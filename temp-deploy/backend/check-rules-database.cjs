// 检查数据库中的规则配置
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkRulesDatabase() {
  let connection;
  
  try {
    console.log('🔍 检查数据库中的规则配置...\n');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 获取所有规则
    const [rules] = await connection.execute(`
      SELECT id, intent_name, description, action_target, trigger_words, example_query, status, priority
      FROM assistant_rules
      WHERE status = 'active'
      ORDER BY priority DESC
    `);
    
    console.log(`\n📋 找到 ${rules.length} 条活跃规则:\n`);
    
    rules.forEach((rule, index) => {
      console.log(`${index + 1}. 规则: ${rule.intent_name}`);
      console.log(`   描述: ${rule.description}`);
      console.log(`   触发词: ${rule.trigger_words}`);
      console.log(`   示例查询: ${rule.example_query}`);
      console.log(`   目标: ${rule.action_target}`);
      console.log(`   优先级: ${rule.priority}`);
      console.log('');
    });
    
    // 测试一些查询的匹配情况
    console.log('🧪 测试查询匹配情况:\n');
    
    const testQueries = [
      '显示检验结果',
      '查询不合格产品', 
      '查询最近的检验记录',
      '显示生产异常情况',
      '生产数据统计',
      '查询聚龙供应商的库存'
    ];
    
    for (const query of testQueries) {
      console.log(`🔍 测试查询: "${query}"`);
      
      let matchedRule = null;
      for (const rule of rules) {
        let triggerWords = [];
        
        // 处理不同格式的trigger_words
        if (rule.trigger_words) {
          if (Array.isArray(rule.trigger_words)) {
            triggerWords = rule.trigger_words;
          } else if (typeof rule.trigger_words === 'string') {
            triggerWords = rule.trigger_words.split(',');
          } else {
            // 可能是JSON字符串，尝试解析
            try {
              const parsed = JSON.parse(rule.trigger_words);
              triggerWords = Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
              triggerWords = [rule.trigger_words.toString()];
            }
          }
        }
        
        console.log(`   检查规则 "${rule.intent_name}": 触发词 [${triggerWords.join(', ')}]`);
        
        if (triggerWords.some(word => query.includes(word.toString().trim()))) {
          matchedRule = rule;
          console.log(`   ✅ 匹配成功！`);
          break;
        }
      }
      
      if (!matchedRule) {
        // 使用默认规则
        matchedRule = rules.find(r => r.intent_name.includes('库存')) || rules[0];
        console.log(`   ⚠️  无匹配，使用默认规则: ${matchedRule?.intent_name}`);
      }
      
      console.log(`   🎯 最终匹配: ${matchedRule?.intent_name}\n`);
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkRulesDatabase();
