import mysql from 'mysql2/promise';

async function checkRealDataMapping() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });

  try {
    console.log('📋 检查数据库表结构和字段映射...\n');
    
    // 1. 库存表字段
    console.log('🏭 inventory 表字段:');
    const [inventoryFields] = await connection.execute('DESCRIBE inventory');
    inventoryFields.forEach(field => {
      console.log(`  ${field.Field} (${field.Type})`);
    });
    
    // 2. 测试表字段  
    console.log('\n🧪 lab_tests 表字段:');
    const [testFields] = await connection.execute('DESCRIBE lab_tests');
    testFields.forEach(field => {
      console.log(`  ${field.Field} (${field.Type})`);
    });
    
    // 3. 上线跟踪表字段
    console.log('\n📊 online_tracking 表字段:');
    const [onlineFields] = await connection.execute('DESCRIBE online_tracking');
    onlineFields.forEach(field => {
      console.log(`  ${field.Field} (${field.Type})`);
    });
    
    // 4. 检查数据样本
    console.log('\n📝 数据样本检查:');
    const [inventorySample] = await connection.execute('SELECT * FROM inventory LIMIT 2');
    console.log('库存数据样本:', inventorySample.length, '条');
    if (inventorySample.length > 0) {
      console.log('库存字段示例:', Object.keys(inventorySample[0]));
    }
    
    const [testSample] = await connection.execute('SELECT * FROM lab_tests LIMIT 2');
    console.log('测试数据样本:', testSample.length, '条');
    if (testSample.length > 0) {
      console.log('测试字段示例:', Object.keys(testSample[0]));
    }
    
    const [onlineSample] = await connection.execute('SELECT * FROM online_tracking LIMIT 2');
    console.log('上线数据样本:', onlineSample.length, '条');
    if (onlineSample.length > 0) {
      console.log('上线字段示例:', Object.keys(onlineSample[0]));
    }
    
    // 5. 检查前端页面期望的字段
    console.log('\n🎯 前端页面期望字段:');
    console.log('库存页面字段: 工厂、仓库、物料编码、物料名称、供应商、数量、状态、入库时间、到期时间、备注');
    console.log('测试页面字段: 测试编号、日期、项目、基线、物料编码、数量、物料名称、供应商、测试结果、不合格描述、备注');
    console.log('上线页面字段: 工厂、基线、项目、物料编码、物料名称、供应商、批次号、不良率、不良现象、检验日期、备注');
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await connection.end();
  }
}

checkRealDataMapping();
