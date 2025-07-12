/**
 * 检查lab_tests表的字段结构
 */
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection',
  charset: 'utf8mb4'
};

const checkLabTestsFields = async () => {
  console.log('🔍 检查lab_tests表字段结构...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 查看表结构
    const [fields] = await connection.execute('DESCRIBE lab_tests');
    console.log('📋 lab_tests表字段结构:');
    fields.forEach(field => {
      console.log(`  - ${field.Field}: ${field.Type} ${field.Null === 'YES' ? '(可空)' : '(非空)'}`);
    });
    
    // 查看示例数据
    console.log('\n📄 示例数据:');
    const [sampleData] = await connection.execute('SELECT * FROM lab_tests LIMIT 3');
    if (sampleData.length > 0) {
      console.log('字段列表:', Object.keys(sampleData[0]).join(', '));
      console.log('示例记录:', sampleData[0]);
    }
    
    // 查看NG记录
    console.log('\n❌ NG测试记录:');
    const [ngData] = await connection.execute(`
      SELECT * FROM lab_tests 
      WHERE test_result = 'NG' OR test_result = 'FAIL'
      LIMIT 3
    `);
    console.log(`找到 ${ngData.length} 条NG记录`);
    if (ngData.length > 0) {
      console.log('NG记录示例:', ngData[0]);
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  }
};

checkLabTestsFields().catch(console.error);
