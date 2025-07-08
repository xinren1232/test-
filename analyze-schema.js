const mysql = require('mysql2/promise');

async function analyzeCurrentSchema() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });
  
  try {
    console.log('🔍 分析当前数据库表结构与前端字段需求...');
    
    // 检查inventory表
    console.log('\n=== INVENTORY表分析 ===');
    const [inventoryFields] = await connection.execute('DESCRIBE inventory');
    console.log('当前inventory表字段:');
    inventoryFields.forEach(field => {
      console.log(`- ${field.Field} (${field.Type})`);
    });
    
    console.log('\n前端库存页面需要的字段:');
    const frontendInventoryFields = ['工厂', '仓库', '物料类型', '供应商名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'];
    frontendInventoryFields.forEach(field => {
      console.log(`- ${field}`);
    });
    
    // 检查lab_tests表
    console.log('\n=== LAB_TESTS表分析 ===');
    const [labTestsFields] = await connection.execute('DESCRIBE lab_tests');
    console.log('当前lab_tests表字段:');
    labTestsFields.forEach(field => {
      console.log(`- ${field.Field} (${field.Type})`);
    });
    
    console.log('\n前端上线数据/测试跟踪页面需要的字段:');
    const frontendTestFields = ['测试编号', '日期', '项目', '基线', '物料类型', '数量', '物料名称', '供应商', '不合格描述', '备注'];
    frontendTestFields.forEach(field => {
      console.log(`- ${field}`);
    });
    
    // 检查是否有production_tracking表
    console.log('\n=== PRODUCTION_TRACKING表分析 ===');
    try {
      const [productionFields] = await connection.execute('DESCRIBE production_tracking');
      console.log('当前production_tracking表字段:');
      productionFields.forEach(field => {
        console.log(`- ${field.Field} (${field.Type})`);
      });
    } catch (error) {
      console.log('production_tracking表不存在');
    }
    
    // 检查数据样本
    console.log('\n=== 数据样本分析 ===');
    const [inventorySample] = await connection.execute('SELECT * FROM inventory LIMIT 2');
    console.log('\ninventory表数据样本:');
    if (inventorySample.length > 0) {
      console.log('字段:', Object.keys(inventorySample[0]).join(', '));
      console.log('样本1:', Object.values(inventorySample[0]).join(' | '));
    }
    
    const [labTestsSample] = await connection.execute('SELECT * FROM lab_tests LIMIT 2');
    console.log('\nlab_tests表数据样本:');
    if (labTestsSample.length > 0) {
      console.log('字段:', Object.keys(labTestsSample[0]).join(', '));
      console.log('样本1:', Object.values(labTestsSample[0]).join(' | '));
    }
    
  } finally {
    await connection.end();
  }
}

analyzeCurrentSchema().catch(console.error);
