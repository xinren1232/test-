import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function debugTriggerWords() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    const [rules] = await connection.execute('SELECT intent_name, trigger_words FROM nlp_intent_rules LIMIT 3');
    
    console.log('调试触发词解析:');
    rules.forEach(rule => {
      console.log(`\n规则: ${rule.intent_name}`);
      console.log(`原始触发词: "${rule.trigger_words}"`);
      console.log(`类型: ${typeof rule.trigger_words}`);
      console.log(`长度: ${rule.trigger_words ? rule.trigger_words.length : 'null'}`);
      
      // 测试解析
      let triggerWords = [];
      try {
        if (rule.trigger_words) {
          if (Array.isArray(rule.trigger_words)) {
            triggerWords = rule.trigger_words;
            console.log('解析方式: 已是数组');
          } else if (typeof rule.trigger_words === 'string') {
            if (rule.trigger_words.startsWith('[')) {
              triggerWords = JSON.parse(rule.trigger_words);
              console.log('解析方式: JSON字符串');
            } else {
              triggerWords = rule.trigger_words.split(',').map(w => w.trim());
              console.log('解析方式: 逗号分隔字符串');
            }
          } else {
            console.log('解析方式: 未知类型，尝试转换为字符串');
            triggerWords = String(rule.trigger_words).split(',').map(w => w.trim());
          }
        }
        console.log(`解析结果: [${triggerWords.join(', ')}]`);
        console.log(`解析后数量: ${triggerWords.length}`);
      } catch (e) {
        console.log(`解析错误: ${e.message}`);
      }
    });
    
    // 测试匹配
    console.log('\n\n测试匹配:');
    const testQuery = '查询物料库存';
    const queryLower = testQuery.toLowerCase();
    
    for (const rule of rules) {
      let score = 0;
      let triggerWords = [];
      
      try {
        if (rule.trigger_words) {
          if (Array.isArray(rule.trigger_words)) {
            triggerWords = rule.trigger_words;
          } else if (typeof rule.trigger_words === 'string') {
            if (rule.trigger_words.startsWith('[')) {
              triggerWords = JSON.parse(rule.trigger_words);
            } else {
              triggerWords = rule.trigger_words.split(',').map(w => w.trim());
            }
          } else {
            triggerWords = String(rule.trigger_words).split(',').map(w => w.trim());
          }
        }
        
        for (const word of triggerWords) {
          if (queryLower.includes(word.toLowerCase())) {
            score += word.length * 2;
            console.log(`匹配: "${word}" 在 "${testQuery}" 中，得分: ${word.length * 2}`);
          }
        }
        
        console.log(`规则 "${rule.intent_name}" 总得分: ${score}`);
      } catch (e) {
        console.log(`规则 "${rule.intent_name}" 解析错误: ${e.message}`);
      }
    }
    
  } catch (error) {
    console.error('调试失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

debugTriggerWords().catch(console.error);
