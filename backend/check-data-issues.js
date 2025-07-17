/**
 * 检查数据问题
 * 1. 上线数据数量异常
 * 2. 结构件类查询失败
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkDataIssues() {
  console.log('🔍 检查数据问题...\n');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 问题1：检查上线数据数量
    console.log('📊 问题1：检查上线数据数量');
    console.log('=' .repeat(50));
    
    const [onlineCount] = await connection.execute('SELECT COUNT(*) as count FROM online_tracking');
    console.log(`上线数据总数: ${onlineCount[0].count} 条`);
    
    // 检查预期数据量（132个批次 × 8条 = 1056条）
    const expectedOnlineCount = 132 * 8;
    console.log(`预期数据量: ${expectedOnlineCount} 条`);
    console.log(`差异: ${onlineCount[0].count - expectedOnlineCount} 条 ${onlineCount[0].count > expectedOnlineCount ? '(超出)' : '(不足)'}`);
    
    // 检查数据分布
    const [batchDistribution] = await connection.execute(`
      SELECT 
        batch_number,
        COUNT(*) as count
      FROM online_tracking 
      GROUP BY batch_number 
      HAVING COUNT(*) != 8
      ORDER BY count DESC
      LIMIT 10
    `);
    
    if (batchDistribution.length > 0) {
      console.log('\n⚠️  异常批次（不是8条记录）:');
      batchDistribution.forEach(batch => {
        console.log(`   批次 ${batch.batch_number}: ${batch.count} 条记录`);
      });
    } else {
      console.log('\n✅ 所有批次都有8条记录');
    }
    
    // 检查重复数据
    const [duplicates] = await connection.execute(`
      SELECT 
        batch_number,
        factory,
        material_code,
        COUNT(*) as count
      FROM online_tracking 
      GROUP BY batch_number, factory, material_code
      HAVING COUNT(*) > 1
      LIMIT 10
    `);
    
    if (duplicates.length > 0) {
      console.log('\n⚠️  发现重复数据:');
      duplicates.forEach(dup => {
        console.log(`   批次 ${dup.batch_number}, 工厂 ${dup.factory}, 物料 ${dup.material_code}: ${dup.count} 条重复`);
      });
    } else {
      console.log('\n✅ 没有发现重复数据');
    }
    
    // 问题2：检查结构件类查询
    console.log('\n\n📋 问题2：检查结构件类查询');
    console.log('=' .repeat(50));
    
    // 检查规则名称
    const [structureRules] = await connection.execute(`
      SELECT 
        id,
        intent_name,
        category,
        status
      FROM nlp_intent_rules 
      WHERE intent_name LIKE '%结构%'
      ORDER BY intent_name
    `);
    
    console.log('结构相关规则:');
    structureRules.forEach(rule => {
      console.log(`   ${rule.id}: ${rule.intent_name} (${rule.category}) - ${rule.status}`);
    });
    
    // 检查物料分类
    console.log('\n物料分类统计:');
    
    // 检查库存中的物料分类
    const [inventoryMaterials] = await connection.execute(`
      SELECT 
        material_name,
        COUNT(*) as count
      FROM inventory
      WHERE material_name IN ('电池盖', '中框', '手机卡托', '侧键', '装饰件')
      GROUP BY material_name
      ORDER BY material_name
    `);
    
    console.log('库存中的结构件物料:');
    inventoryMaterials.forEach(material => {
      console.log(`   ${material.material_name}: ${material.count} 条记录`);
    });
    
    // 测试结构件类查询
    console.log('\n🧪 测试结构件类查询:');
    
    const structureQuery = `
      SELECT 
        storage_location as 工厂,
        storage_location as 仓库,
        material_code as 物料编码,
        material_name as 物料名称,
        supplier_name as 供应商,
        quantity as 数量,
        status as 状态,
        DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
        DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
        COALESCE(notes, '') as 备注
      FROM inventory 
      WHERE (material_name LIKE '%电池盖%' OR material_name LIKE '%中框%' OR material_name LIKE '%手机卡托%' OR material_name LIKE '%侧键%' OR material_name LIKE '%装饰件%')
      ORDER BY material_name, inbound_time DESC
    `;
    
    try {
      const [structureResults] = await connection.execute(structureQuery);
      console.log(`✅ 结构件类查询成功: ${structureResults.length} 条记录`);
      
      if (structureResults.length > 0) {
        console.log('   示例数据:');
        console.log('  ', JSON.stringify(structureResults[0], null, 4));
      }
    } catch (error) {
      console.log(`❌ 结构件类查询失败: ${error.message}`);
    }
    
    // 检查具体的结构件类规则SQL
    const [structureRule] = await connection.execute(`
      SELECT 
        id,
        intent_name,
        action_target
      FROM nlp_intent_rules 
      WHERE intent_name = '结构件类库存查询'
      AND status = 'active'
    `);
    
    if (structureRule.length > 0) {
      console.log('\n📝 结构件类库存查询规则SQL:');
      console.log(structureRule[0].action_target);
      
      // 测试规则SQL
      try {
        const [ruleResults] = await connection.execute(structureRule[0].action_target);
        console.log(`✅ 规则SQL执行成功: ${ruleResults.length} 条记录`);
      } catch (error) {
        console.log(`❌ 规则SQL执行失败: ${error.message}`);
      }
    } else {
      console.log('\n❌ 未找到结构件类库存查询规则');
    }
    
  } finally {
    await connection.end();
  }
}

// 运行检查
checkDataIssues().catch(console.error);
