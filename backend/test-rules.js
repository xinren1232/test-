import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Flameaway3.',
  database: 'iqe_database'
};

async function checkRules() {
  try {
    console.log('🔍 检查数据库中的规则...');
    const connection = await mysql.createConnection(dbConfig);
    
    const [rules] = await connection.execute(`
      SELECT id, intent_name, description, trigger_words, status, priority 
      FROM nlp_intent_rules 
      WHERE status = 'active' 
      ORDER BY priority ASC 
      LIMIT 10
    `);
    
    console.log(`📊 找到 ${rules.length} 条活跃规则:`);
    console.log('');
    
    rules.forEach((rule, index) => {
      console.log(`${index + 1}. ${rule.intent_name}`);
      console.log(`   描述: ${rule.description}`);
      console.log(`   触发词: ${rule.trigger_words}`);
      console.log(`   状态: ${rule.status}`);
      console.log(`   优先级: ${rule.priority}`);
      console.log('');
    });
    
    // 测试特定查询的匹配
    console.log('🧪 测试查询匹配:');
    const testQuery = '查询电池库存';
    console.log(`测试查询: "${testQuery}"`);
    
    const matchingRules = rules.filter(rule => {
      let triggerWords = rule.trigger_words;
      
      // 解析触发词
      if (typeof triggerWords === 'string' && triggerWords.startsWith('[')) {
        try {
          triggerWords = JSON.parse(triggerWords);
        } catch (e) {
          triggerWords = triggerWords.split(',').map(w => w.trim());
        }
      } else if (typeof triggerWords === 'string') {
        triggerWords = triggerWords.split(',').map(w => w.trim());
      }
      
      if (!Array.isArray(triggerWords)) {
        return false;
      }
      
      // 检查是否有匹配的触发词
      return triggerWords.some(word => 
        testQuery.toLowerCase().includes(word.toLowerCase()) ||
        word.toLowerCase().includes('电池') ||
        word.toLowerCase().includes('库存')
      );
    });
    
    console.log(`找到 ${matchingRules.length} 条匹配规则:`);
    matchingRules.forEach(rule => {
      console.log(`- ${rule.intent_name}: ${rule.description}`);
    });
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 检查规则失败:', error.message);
  }
}

checkRules();
