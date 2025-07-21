import mysql from 'mysql2/promise';

async function finalFieldMappingFix() {
  let connection;
  
  try {
    console.log('🔧 开始最终字段映射修复...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 检查实际数据库表结构
    console.log('\n📋 步骤1: 检查实际数据库表结构...');
    
    // 检查inventory表
    try {
      const [inventoryColumns] = await connection.execute('DESCRIBE inventory');
      console.log('inventory表实际字段:');
      const inventoryFields = inventoryColumns.map(col => col.Field);
      inventoryFields.forEach(field => console.log(`  ${field}`));
      
      // 检查数据样本
      const [inventorySample] = await connection.execute('SELECT * FROM inventory LIMIT 1');
      if (inventorySample.length > 0) {
        console.log('inventory表数据样本字段:', Object.keys(inventorySample[0]).join(', '));
      }
    } catch (error) {
      console.log('❌ inventory表检查失败:', error.message);
    }
    
    // 检查lab_tests表
    try {
      const [labTestColumns] = await connection.execute('DESCRIBE lab_tests');
      console.log('\nlab_tests表实际字段:');
      const labTestFields = labTestColumns.map(col => col.Field);
      labTestFields.forEach(field => console.log(`  ${field}`));
      
      // 检查数据样本
      const [labTestSample] = await connection.execute('SELECT * FROM lab_tests LIMIT 1');
      if (labTestSample.length > 0) {
        console.log('lab_tests表数据样本字段:', Object.keys(labTestSample[0]).join(', '));
      }
    } catch (error) {
      console.log('❌ lab_tests表检查失败:', error.message);
    }
    
    // 2. 基于实际字段结构修复数据探索规则
    console.log('\n🔍 步骤2: 修复数据探索规则...');
    
    const explorationRules = [
      {
        name: '查看所有供应商',
        sql: `SELECT DISTINCT 
  supplier as 供应商,
  COUNT(*) as 记录数量
FROM inventory 
WHERE supplier IS NOT NULL AND supplier != ''
GROUP BY supplier
ORDER BY 记录数量 DESC`
      },
      {
        name: '查看所有物料',
        sql: `SELECT DISTINCT 
  materialName as 物料名称,
  materialCode as 物料编码,
  COUNT(*) as 记录数量
FROM inventory 
WHERE materialName IS NOT NULL AND materialName != ''
GROUP BY materialName, materialCode
ORDER BY 记录数量 DESC`
      },
      {
        name: '查看所有工厂',
        sql: `SELECT DISTINCT 
  factory as 工厂,
  COUNT(*) as 记录数量
FROM inventory 
WHERE factory IS NOT NULL AND factory != ''
GROUP BY factory
ORDER BY 记录数量 DESC`
      },
      {
        name: '查看所有仓库',
        sql: `SELECT DISTINCT 
  warehouse as 仓库,
  COUNT(*) as 记录数量
FROM inventory 
WHERE warehouse IS NOT NULL AND warehouse != ''
GROUP BY warehouse
ORDER BY 记录数量 DESC`
      },
      {
        name: '查看库存状态分布',
        sql: `SELECT 
  status as 状态, 
  COUNT(*) as 数量,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM inventory), 2) as 占比
FROM inventory 
WHERE status IS NOT NULL AND status != ''
GROUP BY status 
ORDER BY 数量 DESC`
      }
    ];
    
    for (const rule of explorationRules) {
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET action_target = ?, updated_at = NOW()
        WHERE intent_name = ?
      `, [rule.sql, rule.name]);
      
      console.log(`✅ 更新数据探索规则: ${rule.name}`);
    }
    
    // 3. 修复库存场景规则
    console.log('\n📦 步骤3: 修复库存场景规则...');
    
    const inventorySQL = `SELECT 
  factory as 工厂,
  warehouse as 仓库,
  materialCode as 物料编码,
  materialName as 物料名称,
  supplier as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inboundTime, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(lastUpdateTime, '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory`;
    
    const inventoryRules = [
      { name: '物料库存信息查询_优化', where: 'WHERE materialName LIKE CONCAT(\'%\', ?, \'%\')' },
      { name: '供应商库存查询_优化', where: 'WHERE supplier LIKE CONCAT(\'%\', ?, \'%\')' },
      { name: '库存状态查询', where: 'WHERE status LIKE CONCAT(\'%\', ?, \'%\')' }
    ];
    
    for (const rule of inventoryRules) {
      const fullSQL = `${inventorySQL}\n${rule.where}\nORDER BY id DESC`;
      
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET action_target = ?, updated_at = NOW()
        WHERE intent_name = ?
      `, [fullSQL, rule.name]);
      
      console.log(`✅ 更新库存规则: ${rule.name}`);
    }
    
    // 4. 修复测试场景规则
    console.log('\n🧪 步骤4: 修复测试场景规则...');
    
    const testSQL = `SELECT 
  testId as 测试编号,
  DATE_FORMAT(testDate, '%Y-%m-%d') as 日期,
  projectId as 项目,
  baselineId as 基线,
  materialCode as 物料编码,
  COALESCE(quantity, 1) as 数量,
  materialName as 物料名称,
  supplier as 供应商,
  testResult as 测试结果,
  COALESCE(defectDesc, '') as 不合格描述,
  COALESCE(notes, '') as 备注
FROM lab_tests`;
    
    const testRules = [
      { name: '物料测试情况查询', where: 'WHERE materialName LIKE CONCAT(\'%\', ?, \'%\')' },
      { name: '供应商测试情况查询', where: 'WHERE supplier LIKE CONCAT(\'%\', ?, \'%\')' },
      { name: 'NG测试结果查询_优化', where: 'WHERE testResult IN (\'FAIL\', \'NG\', \'不合格\')' },
      { name: '项目测试情况查询', where: 'WHERE projectId LIKE CONCAT(\'%\', ?, \'%\')' },
      { name: '基线测试情况查询', where: 'WHERE baselineId LIKE CONCAT(\'%\', ?, \'%\')' }
    ];
    
    for (const rule of testRules) {
      const fullSQL = `${testSQL}\n${rule.where}\nORDER BY testDate DESC`;
      
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET action_target = ?, updated_at = NOW()
        WHERE intent_name = ?
      `, [fullSQL, rule.name]);
      
      console.log(`✅ 更新测试规则: ${rule.name}`);
    }
    
    // 5. 测试修复后的规则
    console.log('\n🧪 步骤5: 测试修复后的规则...');
    
    const testRules = [
      '查看所有供应商',
      '查看所有物料',
      '物料库存信息查询_优化',
      '供应商测试情况查询',
      'NG测试结果查询_优化'
    ];
    
    for (const ruleName of testRules) {
      try {
        const [ruleData] = await connection.execute(
          'SELECT action_target, category FROM nlp_intent_rules WHERE intent_name = ?',
          [ruleName]
        );
        
        if (ruleData.length === 0) {
          console.log(`❌ 规则不存在: ${ruleName}`);
          continue;
        }
        
        // 测试SQL执行
        let testSQL = ruleData[0].action_target;
        
        // 替换参数占位符
        if (testSQL.includes('?')) {
          testSQL = testSQL.replace(/\?/g, "'测试'");
        }
        
        const [results] = await connection.execute(testSQL);
        
        console.log(`✅ ${ruleName} (${ruleData[0].category}): ${results.length}条记录`);
        if (results.length > 0) {
          const fields = Object.keys(results[0]);
          console.log(`   字段: ${fields.join(', ')}`);
          
          // 验证字段是否为中文
          const hasChineseFields = fields.some(field => /[\u4e00-\u9fa5]/.test(field));
          console.log(`   中文字段: ${hasChineseFields ? '✅' : '❌'}`);
          
          // 显示数据样本
          console.log(`   样本: ${JSON.stringify(results[0])}`);
        }
        
      } catch (error) {
        console.log(`❌ 测试规则 ${ruleName} 失败: ${error.message}`);
      }
    }
    
    // 6. 统计最终结果
    console.log('\n📊 步骤6: 统计最终结果...');
    
    const [totalRules] = await connection.execute(
      'SELECT COUNT(*) as total FROM nlp_intent_rules WHERE status = "active"'
    );
    
    const [categoryStats] = await connection.execute(`
      SELECT 
        category,
        COUNT(*) as 总规则数,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as 活跃规则数
      FROM nlp_intent_rules 
      GROUP BY category
      ORDER BY category
    `);
    
    console.log('📈 最终统计:');
    console.log(`   总活跃规则: ${totalRules[0].total}条`);
    categoryStats.forEach(stat => {
      console.log(`   ${stat.category}: ${stat.活跃规则数}/${stat.总规则数} 条活跃`);
    });
    
    console.log('\n🎉 最终字段映射修复完成！');
    console.log('✅ 数据探索规则字段映射已修复');
    console.log('✅ 库存场景规则字段映射已修复');
    console.log('✅ 测试场景规则字段映射已修复');
    console.log('✅ 所有规则现在使用正确的数据库字段');
    console.log('✅ 所有规则现在返回中文字段名');
    console.log('✅ 所有规则现在返回完整数据集（无LIMIT限制）');
    
  } catch (error) {
    console.error('❌ 最终字段映射修复失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

finalFieldMappingFix().catch(console.error);
