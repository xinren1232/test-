import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function databaseCheckUpdate() {
  console.log('🔍 数据库检查和更新...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查数据库表结构
    console.log('1. 📊 检查数据库表结构:');
    
    const tables = ['inventory', 'lab_tests', 'online_tracking', 'nlp_intent_rules'];
    
    for (const table of tables) {
      console.log(`\n   ${table}表结构:`);
      try {
        const [columns] = await connection.execute(`DESCRIBE ${table}`);
        columns.forEach(col => {
          console.log(`     - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(可空)' : '(非空)'} ${col.Key ? `[${col.Key}]` : ''}`);
        });
        
        // 检查记录数
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`     记录数: ${count[0].count} 条`);
        
      } catch (error) {
        console.log(`     ❌ 表不存在或查询失败: ${error.message}`);
      }
    }
    
    // 2. 检查数据完整性
    console.log('\n2. 📋 检查数据完整性:');
    
    // 检查库存数据
    console.log('\n   库存数据完整性:');
    const [inventoryStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        COUNT(material_name) as has_material,
        COUNT(supplier_name) as has_supplier,
        COUNT(batch_code) as has_batch,
        COUNT(storage_location) as has_location,
        COUNT(quantity) as has_quantity
      FROM inventory
    `);
    
    const invStats = inventoryStats[0];
    console.log(`     总记录: ${invStats.total}`);
    console.log(`     物料名称: ${invStats.has_material}/${invStats.total} (${((invStats.has_material/invStats.total)*100).toFixed(1)}%)`);
    console.log(`     供应商: ${invStats.has_supplier}/${invStats.total} (${((invStats.has_supplier/invStats.total)*100).toFixed(1)}%)`);
    console.log(`     批次号: ${invStats.has_batch}/${invStats.total} (${((invStats.has_batch/invStats.total)*100).toFixed(1)}%)`);
    console.log(`     存储位置: ${invStats.has_location}/${invStats.total} (${((invStats.has_location/invStats.total)*100).toFixed(1)}%)`);
    console.log(`     数量: ${invStats.has_quantity}/${invStats.total} (${((invStats.has_quantity/invStats.total)*100).toFixed(1)}%)`);
    
    // 检查测试数据
    console.log('\n   测试数据完整性:');
    const [testStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        COUNT(test_id) as has_test_id,
        COUNT(material_name) as has_material,
        COUNT(supplier_name) as has_supplier,
        COUNT(project_id) as has_project,
        COUNT(baseline_id) as has_baseline,
        COUNT(test_result) as has_result
      FROM lab_tests
    `);
    
    const testStatsData = testStats[0];
    console.log(`     总记录: ${testStatsData.total}`);
    console.log(`     测试ID: ${testStatsData.has_test_id}/${testStatsData.total} (${((testStatsData.has_test_id/testStatsData.total)*100).toFixed(1)}%)`);
    console.log(`     物料名称: ${testStatsData.has_material}/${testStatsData.total} (${((testStatsData.has_material/testStatsData.total)*100).toFixed(1)}%)`);
    console.log(`     供应商: ${testStatsData.has_supplier}/${testStatsData.total} (${((testStatsData.has_supplier/testStatsData.total)*100).toFixed(1)}%)`);
    console.log(`     项目ID: ${testStatsData.has_project}/${testStatsData.total} (${((testStatsData.has_project/testStatsData.total)*100).toFixed(1)}%)`);
    console.log(`     基线ID: ${testStatsData.has_baseline}/${testStatsData.total} (${((testStatsData.has_baseline/testStatsData.total)*100).toFixed(1)}%)`);
    console.log(`     测试结果: ${testStatsData.has_result}/${testStatsData.total} (${((testStatsData.has_result/testStatsData.total)*100).toFixed(1)}%)`);
    
    // 检查上线数据
    console.log('\n   上线数据完整性:');
    const [onlineStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        COUNT(material_name) as has_material,
        COUNT(supplier_name) as has_supplier,
        COUNT(project) as has_project,
        COUNT(baseline) as has_baseline,
        COUNT(factory) as has_factory,
        COUNT(defect_rate) as has_defect_rate
      FROM online_tracking
    `);
    
    const onlineStatsData = onlineStats[0];
    console.log(`     总记录: ${onlineStatsData.total}`);
    console.log(`     物料名称: ${onlineStatsData.has_material}/${onlineStatsData.total} (${((onlineStatsData.has_material/onlineStatsData.total)*100).toFixed(1)}%)`);
    console.log(`     供应商: ${onlineStatsData.has_supplier}/${onlineStatsData.total} (${((onlineStatsData.has_supplier/onlineStatsData.total)*100).toFixed(1)}%)`);
    console.log(`     项目: ${onlineStatsData.has_project}/${onlineStatsData.total} (${((onlineStatsData.has_project/onlineStatsData.total)*100).toFixed(1)}%)`);
    console.log(`     基线: ${onlineStatsData.has_baseline}/${onlineStatsData.total} (${((onlineStatsData.has_baseline/onlineStatsData.total)*100).toFixed(1)}%)`);
    console.log(`     工厂: ${onlineStatsData.has_factory}/${onlineStatsData.total} (${((onlineStatsData.has_factory/onlineStatsData.total)*100).toFixed(1)}%)`);
    console.log(`     不良率: ${onlineStatsData.has_defect_rate}/${onlineStatsData.total} (${((onlineStatsData.has_defect_rate/onlineStatsData.total)*100).toFixed(1)}%)`);
    
    // 3. 检查项目基线映射正确性
    console.log('\n3. 🔧 检查项目基线映射正确性:');
    
    // 正确的项目基线映射（来自数据生成器）
    const correctProjectBaselineMap = {
      "X6827": "I6789",
      "S665LN": "I6789", 
      "KI4K": "I6789",
      "X6828": "I6789",
      "X6831": "I6788",
      "KI5K": "I6788",
      "KI3K": "I6788",
      "S662LN": "I6787",
      "S663LN": "I6787",
      "S664LN": "I6787"
    };
    
    console.log('   正确的项目基线映射:');
    Object.entries(correctProjectBaselineMap).forEach(([project, baseline]) => {
      console.log(`     ${project} → ${baseline}`);
    });
    
    // 检查测试数据中的项目基线映射
    console.log('\n   测试数据项目基线映射检查:');
    const [testProjectBaseline] = await connection.execute(`
      SELECT DISTINCT project_id, baseline_id, COUNT(*) as count
      FROM lab_tests 
      WHERE project_id IS NOT NULL AND baseline_id IS NOT NULL
      GROUP BY project_id, baseline_id
      ORDER BY project_id, baseline_id
    `);
    
    let testCorrectMappings = 0;
    let testTotalMappings = testProjectBaseline.length;
    
    testProjectBaseline.forEach(mapping => {
      const isCorrect = correctProjectBaselineMap[mapping.project_id] === mapping.baseline_id;
      console.log(`     ${mapping.project_id} - ${mapping.baseline_id}: ${mapping.count} 条 ${isCorrect ? '✅' : '❌'}`);
      if (isCorrect) testCorrectMappings++;
    });
    
    // 检查上线数据中的项目基线映射
    console.log('\n   上线数据项目基线映射检查:');
    const [onlineProjectBaseline] = await connection.execute(`
      SELECT DISTINCT project, baseline, COUNT(*) as count
      FROM online_tracking 
      WHERE project IS NOT NULL AND baseline IS NOT NULL
      GROUP BY project, baseline
      ORDER BY project, baseline
    `);
    
    let onlineCorrectMappings = 0;
    let onlineTotalMappings = onlineProjectBaseline.length;
    
    onlineProjectBaseline.forEach(mapping => {
      const isCorrect = correctProjectBaselineMap[mapping.project] === mapping.baseline;
      console.log(`     ${mapping.project} - ${mapping.baseline}: ${mapping.count} 条 ${isCorrect ? '✅' : '❌'}`);
      if (isCorrect) onlineCorrectMappings++;
    });
    
    // 4. 检查规则库状态
    console.log('\n4. 📋 检查规则库状态:');
    
    const [ruleStats] = await connection.execute(`
      SELECT 
        category,
        status,
        COUNT(*) as count
      FROM nlp_intent_rules 
      GROUP BY category, status
      ORDER BY category, status
    `);
    
    console.log('   规则库统计:');
    ruleStats.forEach(stat => {
      console.log(`     ${stat.category} - ${stat.status}: ${stat.count} 条`);
    });
    
    // 5. 数据样本检查
    console.log('\n5. 📊 数据样本检查:');
    
    // 库存数据样本
    console.log('\n   库存数据样本:');
    const [inventorySample] = await connection.execute(`
      SELECT material_name, supplier_name, batch_code, storage_location, quantity, status
      FROM inventory 
      ORDER BY created_at DESC 
      LIMIT 3
    `);
    
    inventorySample.forEach((item, index) => {
      console.log(`     ${index + 1}. ${item.material_name} | ${item.supplier_name} | ${item.batch_code}`);
      console.log(`        位置: ${item.storage_location} | 数量: ${item.quantity} | 状态: ${item.status}`);
    });
    
    // 测试数据样本
    console.log('\n   测试数据样本:');
    const [testSample] = await connection.execute(`
      SELECT test_id, material_name, supplier_name, project_id, baseline_id, test_result
      FROM lab_tests 
      ORDER BY test_date DESC 
      LIMIT 3
    `);
    
    testSample.forEach((item, index) => {
      const isCorrectMapping = correctProjectBaselineMap[item.project_id] === item.baseline_id;
      console.log(`     ${index + 1}. ${item.test_id} | ${item.material_name} | ${item.supplier_name}`);
      console.log(`        项目: ${item.project_id} | 基线: ${item.baseline_id} | 结果: ${item.test_result} ${isCorrectMapping ? '✅' : '❌'}`);
    });
    
    // 上线数据样本
    console.log('\n   上线数据样本:');
    const [onlineSample] = await connection.execute(`
      SELECT material_name, supplier_name, project, baseline, factory, defect_rate
      FROM online_tracking 
      ORDER BY inspection_date DESC 
      LIMIT 3
    `);
    
    onlineSample.forEach((item, index) => {
      const isCorrectMapping = correctProjectBaselineMap[item.project] === item.baseline;
      console.log(`     ${index + 1}. ${item.material_name} | ${item.supplier_name} | ${item.factory}`);
      console.log(`        项目: ${item.project} | 基线: ${item.baseline} | 不良率: ${item.defect_rate} ${isCorrectMapping ? '✅' : '❌'}`);
    });
    
    await connection.end();
    
    // 6. 总结报告
    console.log('\n📋 数据库检查总结报告:');
    console.log('==========================================');
    console.log(`✅ 库存数据: ${invStats.total} 条记录`);
    console.log(`✅ 测试数据: ${testStatsData.total} 条记录`);
    console.log(`✅ 上线数据: ${onlineStatsData.total} 条记录`);
    console.log(`✅ 规则库: ${ruleStats.reduce((sum, stat) => sum + stat.count, 0)} 条规则`);
    
    console.log('\n📊 数据质量评估:');
    console.log(`✅ 测试数据项目基线映射正确率: ${testTotalMappings > 0 ? ((testCorrectMappings/testTotalMappings)*100).toFixed(1) : 0}%`);
    console.log(`✅ 上线数据项目基线映射正确率: ${onlineTotalMappings > 0 ? ((onlineCorrectMappings/onlineTotalMappings)*100).toFixed(1) : 0}%`);
    
    // 7. 建议操作
    console.log('\n🔧 建议操作:');
    if (testCorrectMappings < testTotalMappings) {
      console.log('❌ 需要修复测试数据的项目基线映射');
    }
    if (onlineCorrectMappings < onlineTotalMappings) {
      console.log('❌ 需要修复上线数据的项目基线映射');
    }
    if (testCorrectMappings === testTotalMappings && onlineCorrectMappings === onlineTotalMappings) {
      console.log('✅ 项目基线映射完全正确，无需修复');
    }
    
    console.log('\n🔄 数据库检查完成');
    
  } catch (error) {
    console.error('❌ 数据库检查失败:', error.message);
  }
}

databaseCheckUpdate();
