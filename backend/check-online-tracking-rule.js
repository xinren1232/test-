import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkOnlineTrackingRule() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 查看在线跟踪查询规则...\n');
    
    // 查找在线跟踪相关规则
    const [rules] = await connection.execute(`
      SELECT intent_name, description, action_target, trigger_words, example_query, priority, category
      FROM nlp_intent_rules 
      WHERE intent_name LIKE '%在线%' OR intent_name LIKE '%跟踪%' OR intent_name LIKE '%上线%'
      ORDER BY priority ASC
    `);
    
    console.log(`找到 ${rules.length} 条相关规则:\n`);
    
    rules.forEach((rule, index) => {
      console.log(`${index + 1}. 规则名称: ${rule.intent_name}`);
      console.log(`   描述: ${rule.description}`);
      console.log(`   分类: ${rule.category}`);
      console.log(`   优先级: ${rule.priority}`);
      console.log(`   触发词: ${rule.trigger_words}`);
      console.log(`   示例查询: ${rule.example_query}`);
      console.log(`   SQL查询:`);
      console.log(`   ${rule.action_target.substring(0, 300)}...`);
      console.log('');
    });
    
    // 测试查询"电池"相关的在线跟踪数据
    console.log('🧪 测试查询"电池"相关的在线跟踪数据...\n');
    
    const [onlineData] = await connection.execute(`
      SELECT 
        factory,
        material_name,
        supplier_name,
        batch_code,
        project,
        workshop,
        defect_rate,
        exception_count,
        DATE_FORMAT(online_date, '%Y-%m-%d') as online_date
      FROM online_tracking 
      WHERE material_name LIKE '%电池%'
      ORDER BY online_date DESC
      LIMIT 10
    `);
    
    console.log(`找到 ${onlineData.length} 条电池相关的在线跟踪记录:`);
    onlineData.forEach((record, index) => {
      console.log(`${index + 1}. ${record.material_name} - ${record.supplier_name} (${record.factory})`);
      console.log(`   批次: ${record.batch_code}, 项目: ${record.project}, 日期: ${record.online_date}`);
    });
    
  } catch (error) {
    console.error('❌ 查询失败:', error);
  } finally {
    await connection.end();
  }
}

checkOnlineTrackingRule();
