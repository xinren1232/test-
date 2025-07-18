// 调试数据调取0条的问题
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function debugZeroDataIssue() {
  try {
    console.log('🔍 调试数据调取0条问题...\n');
    
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查数据库中的实际数据
    console.log('📊 1. 检查数据库表中的数据:');
    
    const tables = ['inventory', 'lab_tests', 'online_tracking'];
    for (const table of tables) {
      const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
      const count = rows[0].count;
      console.log(`   ${table}: ${count} 条数据`);
      
      if (count > 0) {
        const [sample] = await connection.execute(`SELECT * FROM ${table} LIMIT 1`);
        console.log(`   ${table} 样本数据:`, Object.keys(sample[0]));
      }
    }
    
    // 2. 检查规则表中的SQL
    console.log('\n🧠 2. 检查规则表中的SQL:');
    const [rules] = await connection.execute(`
      SELECT id, intent_name, action_target, trigger_words 
      FROM nlp_intent_rules 
      WHERE status = 'active' 
      ORDER BY priority DESC 
      LIMIT 5
    `);
    
    for (const rule of rules) {
      console.log(`\n规则 ${rule.id}: ${rule.intent_name}`);
      console.log(`触发词: ${rule.trigger_words}`);
      console.log(`SQL: ${rule.action_target.substring(0, 200)}...`);
      
      // 3. 测试执行SQL
      try {
        const [results] = await connection.execute(rule.action_target);
        console.log(`✅ SQL执行成功，返回 ${results.length} 条数据`);
        
        if (results.length > 0) {
          console.log(`   字段: ${Object.keys(results[0]).join(', ')}`);
        }
      } catch (sqlError) {
        console.log(`❌ SQL执行失败: ${sqlError.message}`);
      }
    }
    
    // 4. 测试简单的库存查询
    console.log('\n📦 3. 测试简单的库存查询:');
    try {
      const [inventoryData] = await connection.execute(`
        SELECT 
          SUBSTRING_INDEX(storage_location, '-', 1) as 工厂,
          SUBSTRING_INDEX(storage_location, '-', -1) as 仓库,
          material_code as 物料编码,
          material_name as 物料名称,
          supplier_name as 供应商,
          quantity as 数量,
          status as 状态,
          DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
          DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
          COALESCE(notes, '') as 备注
        FROM inventory 
        LIMIT 10
      `);
      
      console.log(`✅ 库存查询成功，返回 ${inventoryData.length} 条数据`);
      if (inventoryData.length > 0) {
        console.log('   第一条数据:', inventoryData[0]);
      }
    } catch (error) {
      console.log(`❌ 库存查询失败: ${error.message}`);
    }
    
    // 5. 测试检验数据查询
    console.log('\n🔬 4. 测试检验数据查询:');
    try {
      const [testData] = await connection.execute(`
        SELECT 
          test_id as 测试编号,
          DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
          material_name as 物料名称,
          supplier_name as 供应商,
          test_result as 测试结果,
          conclusion as 结论,
          defect_desc as 缺陷描述,
          tester as 测试员
        FROM lab_tests 
        LIMIT 10
      `);
      
      console.log(`✅ 检验查询成功，返回 ${testData.length} 条数据`);
      if (testData.length > 0) {
        console.log('   第一条数据:', testData[0]);
      }
    } catch (error) {
      console.log(`❌ 检验查询失败: ${error.message}`);
    }
    
    // 6. 测试在线跟踪查询
    console.log('\n📊 5. 测试在线跟踪查询:');
    try {
      const [trackingData] = await connection.execute(`
        SELECT 
          batch_code as 批次号,
          material_name as 物料名称,
          factory as 工厂,
          workshop as 车间,
          line as 产线,
          DATE_FORMAT(online_date, '%Y-%m-%d') as 上线日期,
          defect_rate as 不良率,
          exception_count as 异常数量,
          operator as 操作员
        FROM online_tracking 
        LIMIT 10
      `);
      
      console.log(`✅ 在线跟踪查询成功，返回 ${trackingData.length} 条数据`);
      if (trackingData.length > 0) {
        console.log('   第一条数据:', trackingData[0]);
      }
    } catch (error) {
      console.log(`❌ 在线跟踪查询失败: ${error.message}`);
    }
    
    await connection.end();
    console.log('\n🎉 调试完成！');
    
  } catch (error) {
    console.error('❌ 调试失败:', error.message);
  }
}

debugZeroDataIssue().catch(console.error);
