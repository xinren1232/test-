import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection',
  charset: 'utf8mb4'
};

async function analyzeRealDataComprehensive() {
  console.log('📊 全面分析真实数据情况...\n');
  
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // 1. 数据总量统计
    console.log('=== 1. 数据总量统计 ===');
    const tables = ['inventory', 'lab_tests', 'online_tracking'];
    const dataStats = {};
    
    for (const table of tables) {
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        dataStats[table] = count[0].count;
        console.log(`${table}: ${count[0].count} 条记录`);
      } catch (error) {
        console.log(`${table}: 表不存在或无法访问`);
      }
    }
    
    // 2. 供应商完整列表
    console.log('\n=== 2. 供应商完整分析 ===');
    const [suppliers] = await connection.execute(`
      SELECT supplier_name, COUNT(*) as count
      FROM inventory 
      WHERE supplier_name IS NOT NULL AND supplier_name != ''
      GROUP BY supplier_name
      ORDER BY count DESC
    `);
    
    console.log(`总共有 ${suppliers.length} 家供应商:`);
    suppliers.forEach((supplier, index) => {
      console.log(`  ${index + 1}. ${supplier.supplier_name} (${supplier.count} 条库存记录)`);
    });
    
    // 3. 物料完整列表
    console.log('\n=== 3. 物料完整分析 ===');
    const [materials] = await connection.execute(`
      SELECT material_name, COUNT(*) as count, 
             COUNT(DISTINCT supplier_name) as supplier_count,
             GROUP_CONCAT(DISTINCT supplier_name ORDER BY supplier_name) as suppliers
      FROM inventory 
      WHERE material_name IS NOT NULL AND material_name != ''
      GROUP BY material_name
      ORDER BY count DESC
    `);
    
    console.log(`总共有 ${materials.length} 种物料:`);
    materials.forEach((material, index) => {
      console.log(`  ${index + 1}. ${material.material_name} (${material.count} 条记录, ${material.supplier_count} 家供应商)`);
      console.log(`      供应商: ${material.suppliers}`);
    });
    
    // 4. 工厂分布
    console.log('\n=== 4. 工厂分布分析 ===');
    const [factories] = await connection.execute(`
      SELECT storage_location, COUNT(*) as count,
             COUNT(DISTINCT supplier_name) as supplier_count,
             COUNT(DISTINCT material_name) as material_count
      FROM inventory 
      WHERE storage_location IS NOT NULL AND storage_location != ''
      GROUP BY storage_location
      ORDER BY count DESC
    `);
    
    console.log(`总共有 ${factories.length} 个工厂:`);
    factories.forEach((factory, index) => {
      console.log(`  ${index + 1}. ${factory.storage_location} (${factory.count} 条记录, ${factory.supplier_count} 家供应商, ${factory.material_count} 种物料)`);
    });
    
    // 5. 状态分布
    console.log('\n=== 5. 状态分布分析 ===');
    const [statuses] = await connection.execute(`
      SELECT status, COUNT(*) as count
      FROM inventory 
      WHERE status IS NOT NULL AND status != ''
      GROUP BY status
      ORDER BY count DESC
    `);
    
    console.log('库存状态分布:');
    statuses.forEach((status, index) => {
      console.log(`  ${index + 1}. ${status.status}: ${status.count} 条记录`);
    });
    
    // 6. 测试数据分析
    console.log('\n=== 6. 测试数据分析 ===');
    try {
      const [testStats] = await connection.execute(`
        SELECT 
          COUNT(*) as total_tests,
          COUNT(DISTINCT supplier_name) as test_suppliers,
          COUNT(DISTINCT material_name) as test_materials,
          SUM(CASE WHEN test_result = 'PASS' THEN 1 ELSE 0 END) as pass_count,
          SUM(CASE WHEN test_result = 'FAIL' THEN 1 ELSE 0 END) as fail_count
        FROM lab_tests
      `);
      
      const stats = testStats[0];
      const passRate = ((stats.pass_count / stats.total_tests) * 100).toFixed(1);
      
      console.log(`测试记录总数: ${stats.total_tests}`);
      console.log(`涉及供应商: ${stats.test_suppliers} 家`);
      console.log(`涉及物料: ${stats.test_materials} 种`);
      console.log(`通过: ${stats.pass_count} 条 (${passRate}%)`);
      console.log(`失败: ${stats.fail_count} 条 (${(100 - passRate).toFixed(1)}%)`);
      
      // 测试失败的主要原因
      const [defects] = await connection.execute(`
        SELECT defect_desc, COUNT(*) as count
        FROM lab_tests 
        WHERE test_result = 'FAIL' AND defect_desc IS NOT NULL
        GROUP BY defect_desc
        ORDER BY count DESC
        LIMIT 5
      `);
      
      console.log('\n主要缺陷类型:');
      defects.forEach((defect, index) => {
        console.log(`  ${index + 1}. ${defect.defect_desc}: ${defect.count} 次`);
      });
      
    } catch (error) {
      console.log('测试数据表不存在或无法访问');
    }
    
    // 7. 上线跟踪数据分析
    console.log('\n=== 7. 上线跟踪数据分析 ===');
    try {
      const [onlineStats] = await connection.execute(`
        SELECT 
          COUNT(*) as total_records,
          COUNT(DISTINCT supplier_name) as online_suppliers,
          COUNT(DISTINCT material_name) as online_materials,
          COUNT(DISTINCT factory) as online_factories,
          AVG(defect_rate) as avg_defect_rate
        FROM online_tracking
      `);
      
      const stats = onlineStats[0];
      console.log(`上线记录总数: ${stats.total_records}`);
      console.log(`涉及供应商: ${stats.online_suppliers} 家`);
      console.log(`涉及物料: ${stats.online_materials} 种`);
      console.log(`涉及工厂: ${stats.online_factories} 个`);
      console.log(`平均不良率: ${(stats.avg_defect_rate * 100).toFixed(2)}%`);
      
    } catch (error) {
      console.log('上线跟踪数据表不存在或无法访问');
    }
    
    // 8. 生成数据字典
    console.log('\n=== 8. 生成数据字典 ===');
    const dataDict = {
      suppliers: suppliers.map(s => s.supplier_name),
      materials: materials.map(m => m.material_name),
      factories: factories.map(f => f.storage_location),
      statuses: statuses.map(s => s.status),
      totalRecords: {
        inventory: dataStats.inventory || 0,
        lab_tests: dataStats.lab_tests || 0,
        online_tracking: dataStats.online_tracking || 0
      }
    };
    
    console.log('\n数据字典摘要:');
    console.log(`- 供应商: ${dataDict.suppliers.length} 家`);
    console.log(`- 物料: ${dataDict.materials.length} 种`);
    console.log(`- 工厂: ${dataDict.factories.length} 个`);
    console.log(`- 状态: ${dataDict.statuses.length} 种`);
    console.log(`- 总记录数: ${Object.values(dataDict.totalRecords).reduce((a, b) => a + b, 0)} 条`);
    
    // 保存数据字典到文件
    const fs = await import('fs');
    fs.writeFileSync('./src/config/realDataDictionary.json', JSON.stringify(dataDict, null, 2));
    console.log('\n✅ 数据字典已保存到: src/config/realDataDictionary.json');
    
  } catch (error) {
    console.error('❌ 分析失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

analyzeRealDataComprehensive();
