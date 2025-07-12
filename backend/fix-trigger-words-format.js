/**
 * 修复触发词格式问题
 * 将逗号分隔的字符串转换为JSON数组格式
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function main() {
  console.log('🔧 修复触发词格式...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 获取所有规则
    const [rules] = await connection.execute(`
      SELECT id, intent_name, trigger_words
      FROM nlp_intent_rules 
      WHERE status = 'active'
    `);
    
    console.log(`找到 ${rules.length} 个规则`);
    
    let fixedCount = 0;
    
    for (const rule of rules) {
      try {
        // 检查是否已经是JSON格式
        JSON.parse(rule.trigger_words);
        continue; // 已经是正确格式
      } catch (e) {
        // 需要修复
      }
      
      if (rule.trigger_words && typeof rule.trigger_words === 'string') {
        // 转换为数组
        const wordsArray = rule.trigger_words
          .split(',')
          .map(word => word.trim())
          .filter(word => word.length > 0);
        
        if (wordsArray.length > 0) {
          await connection.execute(`
            UPDATE nlp_intent_rules 
            SET trigger_words = ?
            WHERE id = ?
          `, [JSON.stringify(wordsArray), rule.id]);
          
          console.log(`✅ 修复: ${rule.intent_name}`);
          fixedCount++;
        }
      }
    }
    
    console.log(`\n📊 修复完成: ${fixedCount} 个规则`);
    
    // 测试修复结果
    const [testResults] = await connection.execute(`
      SELECT intent_name, trigger_words
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND JSON_SEARCH(trigger_words, 'one', '%结构件%') IS NOT NULL
      LIMIT 3
    `);
    
    console.log(`\n🧪 测试结果: 找到 ${testResults.length} 个结构件相关规则`);
    testResults.forEach(rule => {
      console.log(`- ${rule.intent_name}`);
    });
    
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
