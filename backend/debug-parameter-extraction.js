/**
 * 调试参数提取问题
 */
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function debugParameterExtraction() {
  console.log('🔍 调试参数提取问题...');
  
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // 查看当前的NLP规则
    const [rules] = await connection.query(`
      SELECT intent_name, action_target, parameters 
      FROM nlp_intent_rules 
      WHERE intent_name LIKE '%库存%' 
      LIMIT 1
    `);
    
    if (rules.length > 0) {
      const rule = rules[0];
      console.log('📋 当前库存查询规则:');
      console.log('Intent:', rule.intent_name);
      console.log('SQL:', rule.action_target);
      console.log('Parameters:', rule.parameters);
      
      // 计算占位符数量
      const placeholderCount = (rule.action_target.match(/\?/g) || []).length;
      console.log('占位符数量:', placeholderCount);
      
      // 解析参数定义
      try {
        const params = JSON.parse(rule.parameters);
        console.log('参数定义:', params);
      } catch (e) {
        console.log('参数解析失败:', e.message);
      }
    }
    
  } catch (error) {
    console.error('❌ 调试失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

debugParameterExtraction();
