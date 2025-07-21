/**
 * 修复数据问题
 * 1. 清理多余的上线数据，保持1056条
 * 2. 修复结构件类查询规则
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixDataProblems() {
  console.log('🔧 修复数据问题...\n');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 问题1：修复上线数据数量
    console.log('📊 问题1：修复上线数据数量');
    console.log('=' .repeat(50));
    
    const [onlineCount] = await connection.execute('SELECT COUNT(*) as count FROM online_tracking');
    console.log(`当前上线数据: ${onlineCount[0].count} 条`);
    
    const expectedCount = 1056;
    const excessCount = onlineCount[0].count - expectedCount;
    
    if (excessCount > 0) {
      console.log(`需要删除多余的 ${excessCount} 条数据`);
      
      // 检查批次分布
      const [batchStats] = await connection.execute(`
        SELECT 
          batch_code,
          COUNT(*) as count
        FROM online_tracking 
        GROUP BY batch_code 
        ORDER BY count DESC, batch_code
      `);
      
      console.log(`\n批次统计: 共 ${batchStats.length} 个批次`);
      
      // 找出超过8条记录的批次
      const excessBatches = batchStats.filter(batch => batch.count > 8);
      if (excessBatches.length > 0) {
        console.log('\n超出8条记录的批次:');
        excessBatches.forEach(batch => {
          console.log(`   批次 ${batch.batch_code}: ${batch.count} 条记录`);
        });
        
        // 删除多余记录，每个批次只保留8条
        for (const batch of excessBatches) {
          const deleteCount = batch.count - 8;
          console.log(`\n删除批次 ${batch.batch_code} 的 ${deleteCount} 条多余记录...`);

          // 先获取要删除的记录ID
          const [toDelete] = await connection.execute(`
            SELECT id FROM online_tracking
            WHERE batch_code = ?
            ORDER BY created_at DESC
            LIMIT ${deleteCount}
          `, [batch.batch_code]);

          if (toDelete.length > 0) {
            const idsToDelete = toDelete.map(row => row.id);
            const placeholders = idsToDelete.map(() => '?').join(',');

            const [deleteResult] = await connection.execute(`
              DELETE FROM online_tracking
              WHERE id IN (${placeholders})
            `, idsToDelete);

            console.log(`✅ 删除了 ${deleteResult.affectedRows} 条记录`);
          }
        }
      } else {
        // 如果没有超出8条的批次，删除最新的多余记录
        console.log(`\n删除最新的 ${excessCount} 条多余记录...`);

        // 先获取要删除的记录ID
        const [toDelete] = await connection.execute(`
          SELECT id FROM online_tracking
          ORDER BY created_at DESC
          LIMIT ${excessCount}
        `);

        if (toDelete.length > 0) {
          const idsToDelete = toDelete.map(row => row.id);
          const placeholders = idsToDelete.map(() => '?').join(',');

          const [deleteResult] = await connection.execute(`
            DELETE FROM online_tracking
            WHERE id IN (${placeholders})
          `, idsToDelete);

          console.log(`✅ 删除了 ${deleteResult.affectedRows} 条记录`);
        }
      }
      
      // 验证删除结果
      const [newCount] = await connection.execute('SELECT COUNT(*) as count FROM online_tracking');
      console.log(`\n修复后数据量: ${newCount[0].count} 条`);
      
      if (newCount[0].count === expectedCount) {
        console.log('✅ 上线数据数量修复成功');
      } else {
        console.log(`⚠️  数据量仍不正确，差异: ${newCount[0].count - expectedCount} 条`);
      }
    } else {
      console.log('✅ 上线数据数量正常，无需修复');
    }
    
    // 问题2：修复结构件类查询
    console.log('\n\n📋 问题2：修复结构件类查询');
    console.log('=' .repeat(50));
    
    // 检查结构件物料
    const structureMaterials = ['电池盖', '中框', '手机卡托', '侧键', '装饰件'];
    
    console.log('检查结构件物料在库存中的分布:');
    for (const material of structureMaterials) {
      const [count] = await connection.execute(
        'SELECT COUNT(*) as count FROM inventory WHERE material_name = ?',
        [material]
      );
      console.log(`   ${material}: ${count[0].count} 条记录`);
    }
    
    // 修复结构件类库存查询规则
    const correctStructureSQL = `
SELECT 
  COALESCE(storage_location, '未知工厂') as 工厂,
  COALESCE(storage_location, '未知仓库') as 仓库,
  COALESCE(material_code, '无编码') as 物料编码,
  COALESCE(material_name, '未知物料') as 物料名称,
  COALESCE(supplier_name, '未知供应商') as 供应商,
  COALESCE(quantity, 0) as 数量,
  COALESCE(status, '未知状态') as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory 
WHERE (material_name LIKE '%电池盖%' OR material_name LIKE '%中框%' OR material_name LIKE '%手机卡托%' OR material_name LIKE '%侧键%' OR material_name LIKE '%装饰件%')
ORDER BY material_name, inbound_time DESC`.trim();
    
    // 查找并更新结构件类库存查询规则
    const [structureInventoryRule] = await connection.execute(`
      SELECT id, intent_name, action_target
      FROM nlp_intent_rules 
      WHERE intent_name = '结构件类库存查询'
      AND status = 'active'
    `);
    
    if (structureInventoryRule.length > 0) {
      console.log('\n🔧 更新结构件类库存查询规则...');
      
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET action_target = ?, updated_at = NOW()
        WHERE id = ?
      `, [correctStructureSQL, structureInventoryRule[0].id]);
      
      console.log('✅ 结构件类库存查询规则已更新');
      
      // 测试更新后的规则
      try {
        const [testResults] = await connection.execute(correctStructureSQL);
        console.log(`✅ 规则测试成功: ${testResults.length} 条结构件记录`);
        
        if (testResults.length > 0) {
          console.log('   示例数据:');
          console.log('  ', JSON.stringify(testResults[0], null, 4));
        }
      } catch (error) {
        console.log(`❌ 规则测试失败: ${error.message}`);
      }
    } else {
      console.log('\n❌ 未找到结构件类库存查询规则');
    }
    
    // 同样修复结构件类测试查询和上线查询
    const structureTestSQL = `
SELECT
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(project, '') as 项目,
  COALESCE(baseline, '') as 基线,
  material_code as 物料编码,
  quantity as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(notes, '') as 备注
FROM lab_tests
WHERE (material_name LIKE '%电池盖%' OR material_name LIKE '%中框%' OR material_name LIKE '%手机卡托%' OR material_name LIKE '%侧键%' OR material_name LIKE '%装饰件%')
ORDER BY test_date DESC`.trim();
    
    const structureOnlineSQL = `
SELECT 
  factory as 工厂,
  baseline as 基线,
  project as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  batch_code as 批次号,
  CONCAT(ROUND(defect_rate * 100, 2), '%') as 不良率,
  COALESCE(weekly_anomaly, '') as 不良现象,
  DATE_FORMAT(inspection_date, '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking 
WHERE (material_name LIKE '%电池盖%' OR material_name LIKE '%中框%' OR material_name LIKE '%手机卡托%' OR material_name LIKE '%侧键%' OR material_name LIKE '%装饰件%')
ORDER BY inspection_date DESC`.trim();
    
    // 更新结构件类测试查询规则
    const [testUpdateResult] = await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = ?, updated_at = NOW()
      WHERE intent_name = '结构件类测试查询' AND status = 'active'
    `, [structureTestSQL]);
    
    // 更新结构件类上线查询规则
    const [onlineUpdateResult] = await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = ?, updated_at = NOW()
      WHERE intent_name = '结构件类上线查询' AND status = 'active'
    `, [structureOnlineSQL]);
    
    console.log(`✅ 结构件类测试查询规则更新: ${testUpdateResult.affectedRows} 条`);
    console.log(`✅ 结构件类上线查询规则更新: ${onlineUpdateResult.affectedRows} 条`);
    
    console.log('\n🎉 所有数据问题修复完成！');
    
  } finally {
    await connection.end();
  }
}

// 运行修复
fixDataProblems().catch(console.error);
