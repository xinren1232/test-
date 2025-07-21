import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
});

try {
  console.log('🔍 查找库存页面相关规则...\n');
  
  // 查找包含storage_location的规则（真正的库存页面字段）
  const [storageRules] = await connection.execute(`
    SELECT intent_name, action_target 
    FROM nlp_intent_rules 
    WHERE action_target LIKE '%storage_location%'
    AND status = 'active'
    LIMIT 5
  `);
  
  console.log('📋 包含storage_location的规则:');
  storageRules.forEach((rule, index) => {
    console.log(`${index + 1}. ${rule.intent_name}`);
  });
  
  if (storageRules.length > 0) {
    console.log('\n🧪 测试第一个规则:');
    const testRule = storageRules[0];
    console.log('规则名称:', testRule.intent_name);
    console.log('SQL查询:');
    console.log(testRule.action_target);
    
    try {
      const [results] = await connection.execute(testRule.action_target);
      console.log('\n✅ 执行成功，返回', results.length, '条记录');
      
      if (results.length > 0) {
        const fields = Object.keys(results[0]);
        console.log('字段列表:', fields);
        
        // 检查库存页面字段匹配
        const expectedFields = ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'];
        console.log('\n字段匹配检查:');
        expectedFields.forEach(field => {
          const hasField = fields.includes(field);
          console.log(`  ${field}: ${hasField ? '✅' : '❌'}`);
        });
        
        console.log('\n第一条记录示例:');
        console.log(JSON.stringify(results[0], null, 2));
      }
    } catch (error) {
      console.log('❌ SQL执行失败:', error.message);
    }
  }
  
} finally {
  await connection.end();
}
