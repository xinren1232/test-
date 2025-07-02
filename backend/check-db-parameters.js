/**
 * 检查数据库中的参数字段
 */
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkDBParameters() {
  console.log('🔍 检查数据库中的参数字段...');
  
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // 查看库存查询规则的详细信息
    const [rules] = await connection.query(`
      SELECT * FROM nlp_intent_rules 
      WHERE intent_name = '查询库存,库存查询,查库存,库存情况,物料库存'
    `);
    
    if (rules.length > 0) {
      const rule = rules[0];
      console.log('📋 库存查询规则详情:');
      console.log('ID:', rule.id);
      console.log('Intent:', rule.intent_name);
      console.log('Parameters字段:', rule.parameters);
      console.log('Parameters类型:', typeof rule.parameters);
      console.log('Required_entities字段:', rule.required_entities);
      console.log('Action_target:', rule.action_target);
      
      // 尝试解析参数
      if (rule.parameters) {
        try {
          const parsed = JSON.parse(rule.parameters);
          console.log('✅ 参数解析成功:', parsed);
        } catch (e) {
          console.log('❌ 参数解析失败:', e.message);
        }
      } else {
        console.log('⚠️ 参数字段为空');
      }
    } else {
      console.log('❌ 未找到库存查询规则');
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDBParameters();
