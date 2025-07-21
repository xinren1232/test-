import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function analyzeDataForRules() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔍 分析实际数据特点和业务场景...');
    
    // 1. 分析库存数据特点
    console.log('\n📦 库存数据分析:');
    const [invStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_count,
        COUNT(DISTINCT supplier_name) as supplier_count,
        COUNT(DISTINCT material_name) as material_count,
        COUNT(DISTINCT batch_code) as batch_count,
        COUNT(DISTINCT storage_location) as location_count,
        COUNT(CASE WHEN status LIKE '%风险%' THEN 1 END) as risk_count
      FROM inventory
    `);
    console.table(invStats);
    
    // 2. 分析供应商分布
    console.log('\n🏢 供应商分布(Top 10):');
    const [suppliers] = await connection.execute(`
      SELECT supplier_name, COUNT(*) as count, 
             SUM(quantity) as total_quantity,
             COUNT(CASE WHEN status LIKE '%风险%' THEN 1 END) as risk_items
      FROM inventory 
      GROUP BY supplier_name 
      ORDER BY count DESC 
      LIMIT 10
    `);
    console.table(suppliers);
    
    // 3. 分析测试数据特点
    console.log('\n🧪 测试数据分析:');
    const [testStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_tests,
        COUNT(DISTINCT project_id) as project_count,
        COUNT(DISTINCT baseline_id) as baseline_count,
        COUNT(CASE WHEN test_result = 'FAIL' THEN 1 END) as fail_count,
        COUNT(CASE WHEN test_result = 'PASS' THEN 1 END) as pass_count
      FROM lab_tests
    `);
    console.table(testStats);
    
    // 4. 分析上线数据特点
    console.log('\n🏭 上线数据分析:');
    const [onlineStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_online,
        COUNT(DISTINCT factory) as factory_count,
        COUNT(DISTINCT project) as project_count,
        AVG(defect_rate) as avg_defect_rate,
        MAX(defect_rate) as max_defect_rate
      FROM online_tracking
    `);
    console.table(onlineStats);
    
    // 5. 分析项目和基线数据
    console.log('\n📊 项目基线分析:');
    const [projectData] = await connection.execute(`
      SELECT project_id, baseline_id, COUNT(*) as test_count,
             COUNT(CASE WHEN test_result = 'FAIL' THEN 1 END) as fail_count
      FROM lab_tests 
      GROUP BY project_id, baseline_id 
      ORDER BY test_count DESC 
      LIMIT 10
    `);
    console.table(projectData);
    
    // 6. 分析批次数据关联
    console.log('\n📋 批次数据关联分析:');
    const [batchData] = await connection.execute(`
      SELECT 
        i.batch_code,
        i.material_name,
        i.supplier_name,
        i.quantity as inv_quantity,
        COUNT(DISTINCT l.test_id) as test_count,
        COUNT(DISTINCT o.id) as online_count,
        COUNT(CASE WHEN l.test_result = 'FAIL' THEN 1 END) as fail_count
      FROM inventory i
      LEFT JOIN lab_tests l ON i.batch_code = l.batch_code
      LEFT JOIN online_tracking o ON i.batch_code = o.batch_code
      GROUP BY i.batch_code, i.material_name, i.supplier_name, i.quantity
      HAVING test_count > 0 OR online_count > 0
      ORDER BY (test_count + online_count) DESC
      LIMIT 10
    `);
    console.table(batchData);
    
    // 7. 分析物料类型分布
    console.log('\n📊 物料类型分布:');
    const [materialTypes] = await connection.execute(`
      SELECT material_name, COUNT(*) as count,
             AVG(quantity) as avg_quantity,
             COUNT(CASE WHEN status LIKE '%风险%' THEN 1 END) as risk_count
      FROM inventory 
      GROUP BY material_name 
      ORDER BY count DESC 
      LIMIT 10
    `);
    console.table(materialTypes);
    
    console.log('\n✅ 数据分析完成，可以基于这些真实数据特点设计规则');
    
  } catch (error) {
    console.error('❌ 分析过程中出现错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

analyzeDataForRules();
