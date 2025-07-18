const mysql = require('./backend/node_modules/mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkFieldData() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 检查inventory表中的关键字段数据情况
    console.log('\n📦 inventory表字段数据情况:');
    
    const [inventoryStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(risk_level) as risk_level_count,
        COUNT(inspector) as inspector_count,
        COUNT(notes) as notes_count,
        GROUP_CONCAT(DISTINCT risk_level) as risk_levels,
        GROUP_CONCAT(DISTINCT inspector) as inspectors
      FROM inventory
    `);
    console.log('inventory统计:', inventoryStats[0]);
    
    // 检查lab_tests表中的关键字段数据情况
    console.log('\n🧪 lab_tests表字段数据情况:');
    
    const [labTestsStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(tester) as tester_count,
        COUNT(reviewer) as reviewer_count,
        COUNT(test_item) as test_item_count,
        GROUP_CONCAT(DISTINCT tester) as testers,
        GROUP_CONCAT(DISTINCT reviewer) as reviewers,
        GROUP_CONCAT(DISTINCT test_item) as test_items
      FROM lab_tests
    `);
    console.log('lab_tests统计:', labTestsStats[0]);
    
    // 检查online_tracking表中的关键字段数据情况
    console.log('\n🏭 online_tracking表字段数据情况:');
    
    const [onlineTrackingStats] = await connection.execute(`
      SELECT
        COUNT(*) as total_records,
        COUNT(operator) as operator_count,
        COUNT(workshop) as workshop_count,
        COUNT(\`line\`) as line_count,
        GROUP_CONCAT(DISTINCT operator) as operators,
        GROUP_CONCAT(DISTINCT workshop) as workshops,
        GROUP_CONCAT(DISTINCT \`line\`) as lines
      FROM online_tracking
    `);
    console.log('online_tracking统计:', onlineTrackingStats[0]);
    
    // 检查有数据的记录样本
    console.log('\n📋 有数据的记录样本:');
    
    const [inventoryWithData] = await connection.execute(`
      SELECT risk_level, inspector, notes 
      FROM inventory 
      WHERE risk_level IS NOT NULL OR inspector IS NOT NULL 
      LIMIT 3
    `);
    console.log('inventory有数据样本:', inventoryWithData);
    
    const [labTestsWithData] = await connection.execute(`
      SELECT tester, reviewer, test_item 
      FROM lab_tests 
      WHERE tester IS NOT NULL OR reviewer IS NOT NULL 
      LIMIT 3
    `);
    console.log('lab_tests有数据样本:', labTestsWithData);
    
    const [onlineTrackingWithData] = await connection.execute(`
      SELECT operator, workshop, \`line\`
      FROM online_tracking
      WHERE operator IS NOT NULL OR workshop IS NOT NULL
      LIMIT 3
    `);
    console.log('online_tracking有数据样本:', onlineTrackingWithData);
    
  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkFieldData();
