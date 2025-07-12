import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection',
  charset: 'utf8mb4',
  timezone: '+08:00'
};

async function testRule() {
  try {
    console.log('连接数据库...');
    const connection = await mysql.createConnection(dbConfig);
    
    // 获取一个规则进行测试
    console.log('\n=== 获取规则 ===');
    const [rules] = await connection.execute('SELECT * FROM nlp_intent_rules LIMIT 1');
    if (rules.length === 0) {
      console.log('没有找到规则');
      return;
    }
    
    const rule = rules[0];
    console.log('测试规则:', rule.intent_name);
    console.log('示例查询:', rule.example_query);
    console.log('动作类型:', rule.action_type);
    console.log('动作目标:', rule.action_target);
    
    // 测试API调用
    console.log('\n=== 测试API调用 ===');
    const response = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: rule.example_query || '查询库存信息'
      })
    });
    
    console.log('API响应状态:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('API响应结果:');
      console.log('- success:', result.success);
      console.log('- data length:', result.data ? (Array.isArray(result.data) ? result.data.length : 'not array') : 'no data');
      console.log('- reply:', result.reply ? result.reply.substring(0, 100) + '...' : 'no reply');
      console.log('- 完整结果:', JSON.stringify(result, null, 2));
    } else {
      console.log('API调用失败:', response.statusText);
      const errorText = await response.text();
      console.log('错误信息:', errorText);
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

testRule();
