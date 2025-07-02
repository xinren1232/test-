/**
 * 分析真实数据中的所有值
 * 用于重新设计基于实际数据的规则
 */

import mysql from 'mysql2/promise';

async function analyzeRealDataValues() {
  console.log('🔍 分析真实数据中的所有值...\n');

  try {
    // 连接数据库
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });

    console.log('✅ 连接到数据库成功！\n');

    // 分析inventory表的实际值
    console.log('📦 分析inventory表的实际值:');
    
    // 获取所有供应商
    const [suppliers] = await connection.execute('SELECT DISTINCT supplier_name FROM inventory WHERE supplier_name IS NOT NULL ORDER BY supplier_name');
    console.log('🏢 实际供应商:', suppliers.map(s => s.supplier_name));
    
    // 获取所有物料名称
    const [materials] = await connection.execute('SELECT DISTINCT material_name FROM inventory WHERE material_name IS NOT NULL ORDER BY material_name');
    console.log('📦 实际物料:', materials.map(m => m.material_name));
    
    // 获取所有物料类型
    const [materialTypes] = await connection.execute('SELECT DISTINCT material_type FROM inventory WHERE material_type IS NOT NULL ORDER BY material_type');
    console.log('🔧 实际物料类型:', materialTypes.map(t => t.material_type));
    
    // 获取所有存储位置
    const [locations] = await connection.execute('SELECT DISTINCT storage_location FROM inventory WHERE storage_location IS NOT NULL ORDER BY storage_location');
    console.log('🏭 实际存储位置:', locations.map(l => l.storage_location));
    
    // 获取所有状态
    const [statuses] = await connection.execute('SELECT DISTINCT status FROM inventory WHERE status IS NOT NULL ORDER BY status');
    console.log('📊 实际状态:', statuses.map(s => s.status));
    
    // 获取所有风险等级
    const [riskLevels] = await connection.execute('SELECT DISTINCT risk_level FROM inventory WHERE risk_level IS NOT NULL ORDER BY risk_level');
    console.log('⚠️ 实际风险等级:', riskLevels.map(r => r.risk_level));

    console.log('\n🧪 分析lab_tests表的实际值:');
    
    // 获取所有测试项目
    const [testItems] = await connection.execute('SELECT DISTINCT test_item FROM lab_tests WHERE test_item IS NOT NULL ORDER BY test_item');
    console.log('🔬 实际测试项目:', testItems.map(t => t.test_item));
    
    // 获取所有测试结果
    const [testResults] = await connection.execute('SELECT DISTINCT test_result FROM lab_tests WHERE test_result IS NOT NULL ORDER BY test_result');
    console.log('✅ 实际测试结果:', testResults.map(r => r.test_result));
    
    // 获取所有测试结论
    const [conclusions] = await connection.execute('SELECT DISTINCT conclusion FROM lab_tests WHERE conclusion IS NOT NULL ORDER BY conclusion');
    console.log('📋 实际测试结论:', conclusions.map(c => c.conclusion));
    
    // 获取所有测试员
    const [testers] = await connection.execute('SELECT DISTINCT tester FROM lab_tests WHERE tester IS NOT NULL ORDER BY tester');
    console.log('👨‍🔬 实际测试员:', testers.map(t => t.tester));

    console.log('\n⚙️ 分析online_tracking表的实际值:');
    
    // 获取所有工厂
    const [factories] = await connection.execute('SELECT DISTINCT factory FROM online_tracking WHERE factory IS NOT NULL ORDER BY factory');
    console.log('🏭 实际工厂:', factories.map(f => f.factory));
    
    // 获取所有车间
    const [workshops] = await connection.execute('SELECT DISTINCT workshop FROM online_tracking WHERE workshop IS NOT NULL ORDER BY workshop');
    console.log('🏗️ 实际车间:', workshops.map(w => w.workshop));
    
    // 获取所有产线
    const [lines] = await connection.execute('SELECT DISTINCT line FROM online_tracking WHERE line IS NOT NULL ORDER BY line');
    console.log('📏 实际产线:', lines.map(l => l.line));
    
    // 获取所有项目
    const [projects] = await connection.execute('SELECT DISTINCT project FROM online_tracking WHERE project IS NOT NULL ORDER BY project');
    console.log('📊 实际项目:', projects.map(p => p.project));
    
    // 获取所有操作员
    const [operators] = await connection.execute('SELECT DISTINCT operator FROM online_tracking WHERE operator IS NOT NULL ORDER BY operator');
    console.log('👷 实际操作员:', operators.map(o => o.operator));

    // 获取不良率范围
    const [defectRates] = await connection.execute('SELECT MIN(defect_rate) as min_rate, MAX(defect_rate) as max_rate, AVG(defect_rate) as avg_rate FROM online_tracking WHERE defect_rate IS NOT NULL');
    console.log('📈 不良率范围:', defectRates[0]);

    // 获取异常数量范围
    const [exceptionCounts] = await connection.execute('SELECT MIN(exception_count) as min_count, MAX(exception_count) as max_count, AVG(exception_count) as avg_count FROM online_tracking WHERE exception_count IS NOT NULL');
    console.log('🚨 异常数量范围:', exceptionCounts[0]);

    console.log('\n📊 数据统计:');
    
    // 获取各表记录数
    const [inventoryCount] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
    const [labTestsCount] = await connection.execute('SELECT COUNT(*) as count FROM lab_tests');
    const [trackingCount] = await connection.execute('SELECT COUNT(*) as count FROM online_tracking');
    
    console.log(`📦 库存记录数: ${inventoryCount[0].count}`);
    console.log(`🧪 测试记录数: ${labTestsCount[0].count}`);
    console.log(`⚙️ 生产记录数: ${trackingCount[0].count}`);

    await connection.end();
    console.log('\n🎉 数据分析完成！');

  } catch (error) {
    console.error('❌ 数据分析失败:', error);
    process.exit(1);
  }
}

// 运行分析
analyzeRealDataValues();
