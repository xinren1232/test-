// 检查规则数据的实际内容
const mysql = require('mysql2/promise');

async function checkRulesData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });

  try {
    console.log('🔍 检查规则数据的实际内容...\n');
    
    // 查看assistant_rules表的前几条数据
    const [rules] = await connection.execute(`
      SELECT id, intent_name, description, trigger_words, action_target, action_type, status
      FROM assistant_rules 
      WHERE status = 'active'
      ORDER BY priority DESC
      LIMIT 5
    `);
    
    console.log(`📋 找到${rules.length}条活跃规则:\n`);
    
    rules.forEach((rule, index) => {
      console.log(`第${index + 1}条规则:`);
      console.log(`   ID: ${rule.id}`);
      console.log(`   意图名称: ${rule.intent_name}`);
      console.log(`   描述: ${rule.description}`);
      console.log(`   触发词: ${rule.trigger_words}`);
      console.log(`   动作目标: ${rule.action_target}`);
      console.log(`   动作类型: ${rule.action_type}`);
      console.log(`   状态: ${rule.status}`);
      console.log('');
    });
    
    // 特别检查库存相关的规则
    const [inventoryRules] = await connection.execute(`
      SELECT id, intent_name, action_target, action_type
      FROM assistant_rules 
      WHERE status = 'active' AND intent_name LIKE '%库存%'
      LIMIT 3
    `);
    
    console.log('📦 库存相关规则:');
    inventoryRules.forEach((rule, index) => {
      console.log(`\n库存规则${index + 1}:`);
      console.log(`   意图: ${rule.intent_name}`);
      console.log(`   动作目标: ${rule.action_target}`);
      console.log(`   动作类型: ${rule.action_type}`);
    });
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await connection.end();
  }
}

checkRulesData();
