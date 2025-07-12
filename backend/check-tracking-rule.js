import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkTrackingRule() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 检查在线跟踪查询规则的SQL...');
    const [rules] = await connection.execute(
      'SELECT intent_name, action_target FROM nlp_intent_rules WHERE intent_name = ?',
      ['在线跟踪查询']
    );

    if (rules.length > 0) {
      console.log('当前SQL查询:');
      console.log(rules[0].action_target);
    } else {
      console.log('未找到规则');
    }

    console.log('\n🔍 检查实际的在线跟踪数据结构...');
    const [columns] = await connection.execute('DESCRIBE online_tracking');
    console.log('online_tracking表结构:');
    columns.forEach(col => {
      console.log(`- ${col.Field} (${col.Type})`);
    });

    console.log('\n🔍 检查实际数据样本...');
    const [sampleData] = await connection.execute(
      'SELECT * FROM online_tracking WHERE material_name LIKE "%电池%" LIMIT 3'
    );
    console.log('电池相关数据样本:');
    console.log(JSON.stringify(sampleData, null, 2));

    console.log('\n🔍 检查电池精确匹配数据...');
    const [exactData] = await connection.execute(
      'SELECT * FROM online_tracking WHERE material_name = ? LIMIT 5',
      ['电池']
    );
    console.log('电池精确匹配数据:');
    console.log(JSON.stringify(exactData, null, 2));

  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await connection.end();
  }
}

checkTrackingRule();
