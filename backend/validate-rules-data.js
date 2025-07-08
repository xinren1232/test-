import { Sequelize } from 'sequelize';

// 数据库连接配置
const sequelize = new Sequelize('iqe_inspection', 'root', 'root123', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

async function validateRulesData() {
  try {
    await sequelize.authenticate();
    console.log('✅ 连接到数据库成功！\n');

    // 检查关键字段的实际值
    console.log('🔍 检查关键字段的实际值:');
    
    // inventory状态值
    const inventoryStatus = await sequelize.query("SELECT DISTINCT status FROM inventory WHERE status IS NOT NULL", { type: Sequelize.QueryTypes.SELECT });
    console.log('inventory.status实际值:', inventoryStatus.map(s => s.status));

    // lab_tests结果值
    const testResults = await sequelize.query("SELECT DISTINCT test_result FROM lab_tests WHERE test_result IS NOT NULL", { type: Sequelize.QueryTypes.SELECT });
    console.log('lab_tests.test_result实际值:', testResults.map(r => r.test_result));

    // online_tracking工厂值
    const factories = await sequelize.query("SELECT DISTINCT factory FROM online_tracking WHERE factory IS NOT NULL", { type: Sequelize.QueryTypes.SELECT });
    console.log('online_tracking.factory实际值:', factories.map(f => f.factory));

    // 项目值
    const projects = await sequelize.query("SELECT DISTINCT project FROM online_tracking WHERE project IS NOT NULL", { type: Sequelize.QueryTypes.SELECT });
    console.log('online_tracking.project实际值:', projects.map(p => p.project));

    // 车间值
    const workshops = await sequelize.query("SELECT DISTINCT workshop FROM online_tracking WHERE workshop IS NOT NULL", { type: Sequelize.QueryTypes.SELECT });
    console.log('online_tracking.workshop实际值:', workshops.map(w => w.workshop));

    // 生产线值
    const lines = await sequelize.query("SELECT DISTINCT line FROM online_tracking WHERE line IS NOT NULL", { type: Sequelize.QueryTypes.SELECT });
    console.log('online_tracking.line实际值:', lines.map(l => l.line));

    // 测试项目值
    const testItems = await sequelize.query("SELECT DISTINCT test_item FROM lab_tests WHERE test_item IS NOT NULL", { type: Sequelize.QueryTypes.SELECT });
    console.log('lab_tests.test_item实际值:', testItems.map(t => t.test_item));

    // 检查是否有supplier_name字段在lab_tests和online_tracking表中
    console.log('\n🔍 检查表中是否有supplier_name字段:');
    
    try {
      const labTestSuppliers = await sequelize.query("SELECT DISTINCT supplier_name FROM lab_tests WHERE supplier_name IS NOT NULL LIMIT 5", { type: Sequelize.QueryTypes.SELECT });
      console.log('lab_tests.supplier_name存在，样本值:', labTestSuppliers.map(s => s.supplier_name));
    } catch (error) {
      console.log('lab_tests表中没有supplier_name字段');
    }

    try {
      const onlineSuppliers = await sequelize.query("SELECT DISTINCT supplier_name FROM online_tracking WHERE supplier_name IS NOT NULL LIMIT 5", { type: Sequelize.QueryTypes.SELECT });
      console.log('online_tracking.supplier_name存在，样本值:', onlineSuppliers.map(s => s.supplier_name));
    } catch (error) {
      console.log('online_tracking表中没有supplier_name字段');
    }

    // 测试一些复杂查询
    console.log('\n🧪 测试复杂查询:');
    
    // 测试JOIN查询
    try {
      const joinTest = await sequelize.query(`
        SELECT i.material_name, i.supplier_name, l.test_result 
        FROM inventory i 
        LEFT JOIN lab_tests l ON i.material_name = l.material_name 
        LIMIT 3
      `, { type: Sequelize.QueryTypes.SELECT });
      console.log('JOIN查询测试成功，样本结果:', joinTest);
    } catch (error) {
      console.log('JOIN查询失败:', error.message);
    }

    // 测试GROUP BY查询
    try {
      const groupTest = await sequelize.query(`
        SELECT status, COUNT(*) as count 
        FROM inventory 
        GROUP BY status
      `, { type: Sequelize.QueryTypes.SELECT });
      console.log('GROUP BY查询测试成功:', groupTest);
    } catch (error) {
      console.log('GROUP BY查询失败:', error.message);
    }

    console.log('\n✅ 数据验证完成！');

  } catch (error) {
    console.error('❌ 验证失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

validateRulesData();
