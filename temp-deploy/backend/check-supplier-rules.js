import mysql from 'mysql2/promise';

async function checkSupplierRules() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root', 
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('=== 检查供应商相关规则 ===');
    const [rules] = await connection.execute(`
      SELECT intent_name, description, action_target, trigger_words 
      FROM nlp_intent_rules 
      WHERE status = 'active' 
      AND (intent_name LIKE '%供应商%' OR trigger_words LIKE '%供应商%' OR trigger_words LIKE '%天马%')
      ORDER BY intent_name
    `);
    
    console.log(`找到 ${rules.length} 条相关规则:`);
    
    rules.forEach((rule, index) => {
      console.log(`\n${index + 1}. 规则名称: ${rule.intent_name}`);
      console.log(`   描述: ${rule.description}`);
      console.log(`   触发词: ${rule.trigger_words}`);
      console.log(`   SQL: ${rule.action_target.substring(0, 100)}...`);
    });
    
    // 检查是否有通用的库存查询规则
    console.log('\n=== 检查通用库存查询规则 ===');
    const [inventoryRules] = await connection.execute(`
      SELECT intent_name, description, action_target, trigger_words 
      FROM nlp_intent_rules 
      WHERE status = 'active' 
      AND (intent_name LIKE '%库存%' OR trigger_words LIKE '%库存%')
      ORDER BY intent_name
    `);
    
    console.log(`找到 ${inventoryRules.length} 条库存相关规则:`);
    
    inventoryRules.forEach((rule, index) => {
      console.log(`\n${index + 1}. 规则名称: ${rule.intent_name}`);
      console.log(`   描述: ${rule.description}`);
      console.log(`   触发词: ${rule.trigger_words}`);
      console.log(`   SQL: ${rule.action_target.substring(0, 100)}...`);
    });
    
    await connection.end();
  } catch (error) {
    console.error('检查失败:', error);
  }
}

checkSupplierRules();
