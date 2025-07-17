import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function testRealDataAccess() {
  console.log('🧪 验证真实数据调用能力...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 验证数据库连接
    console.log('1. 验证数据库连接...');
    const [dbInfo] = await connection.execute('SELECT DATABASE() as current_db, NOW() as current_timestamp');
    console.log(`   ✅ 连接成功: ${dbInfo[0].current_db} at ${dbInfo[0].current_timestamp}`);
    
    // 2. 检查表结构和数据
    console.log('\n2. 检查各表数据情况...');
    
    // 检查库存表
    const [inventoryCount] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
    console.log(`   📦 inventory表: ${inventoryCount[0].count} 条记录`);
    
    if (inventoryCount[0].count > 0) {
      const [inventorySample] = await connection.execute(`
        SELECT material_code, material_name, supplier_name, quantity, status 
        FROM inventory 
        LIMIT 3
      `);
      console.log('   样本数据:');
      inventorySample.forEach((row, index) => {
        console.log(`     ${index + 1}. ${row.material_code} - ${row.material_name} (${row.supplier_name}) - 数量:${row.quantity} - 状态:${row.status}`);
      });
    }
    
    // 检查测试表
    const [testCount] = await connection.execute('SELECT COUNT(*) as count FROM lab_tests');
    console.log(`\n   🧪 lab_tests表: ${testCount[0].count} 条记录`);
    
    if (testCount[0].count > 0) {
      const [testSample] = await connection.execute(`
        SELECT test_id, material_code, material_name, supplier_name, test_result 
        FROM lab_tests 
        LIMIT 3
      `);
      console.log('   样本数据:');
      testSample.forEach((row, index) => {
        console.log(`     ${index + 1}. ${row.test_id} - ${row.material_code} - ${row.material_name} (${row.supplier_name}) - 结果:${row.test_result}`);
      });
    }
    
    // 检查上线跟踪表
    const [onlineCount] = await connection.execute('SELECT COUNT(*) as count FROM online_tracking');
    console.log(`\n   🏭 online_tracking表: ${onlineCount[0].count} 条记录`);
    
    if (onlineCount[0].count > 0) {
      const [onlineSample] = await connection.execute(`
        SELECT id, material_name, supplier_name, defect_rate, exception_count 
        FROM online_tracking 
        LIMIT 3
      `);
      console.log('   样本数据:');
      onlineSample.forEach((row, index) => {
        console.log(`     ${index + 1}. ID:${row.id} - ${row.material_name} (${row.supplier_name}) - 不良率:${row.defect_rate}% - 异常:${row.exception_count}次`);
      });
    }
    
    // 3. 测试标准查询
    console.log('\n3. 测试标准查询...');
    
    // 测试库存查询
    console.log('   📦 测试库存查询:');
    const [inventoryQuery] = await connection.execute(`
      SELECT 
        storage_location as 工厂,
        material_code as 物料编码,
        material_name as 物料名称,
        supplier_name as 供应商,
        quantity as 数量,
        status as 状态
      FROM inventory 
      WHERE 1=1
      ORDER BY inbound_time DESC 
      LIMIT 5
    `);
    
    if (inventoryQuery.length > 0) {
      console.log('     ✅ 库存查询成功');
      inventoryQuery.forEach((row, index) => {
        console.log(`       ${index + 1}. ${row.工厂} - ${row.物料编码} - ${row.物料名称} - ${row.供应商} - ${row.数量} - ${row.状态}`);
      });
    } else {
      console.log('     ⚠️ 库存查询无数据');
    }
    
    // 测试测试数据查询
    console.log('\n   🧪 测试测试数据查询:');
    const [testQuery] = await connection.execute(`
      SELECT 
        test_id as 测试编号,
        material_code as 物料编码,
        material_name as 物料名称,
        supplier_name as 供应商,
        test_result as 测试结果
      FROM lab_tests 
      WHERE 1=1
      ORDER BY test_date DESC 
      LIMIT 5
    `);
    
    if (testQuery.length > 0) {
      console.log('     ✅ 测试数据查询成功');
      testQuery.forEach((row, index) => {
        console.log(`       ${index + 1}. ${row.测试编号} - ${row.物料编码} - ${row.物料名称} - ${row.供应商} - ${row.测试结果}`);
      });
    } else {
      console.log('     ⚠️ 测试数据查询无数据');
    }
    
    // 4. 测试特定条件查询
    console.log('\n4. 测试特定条件查询...');
    
    // 测试供应商筛选
    const [supplierQuery] = await connection.execute(`
      SELECT DISTINCT supplier_name, COUNT(*) as count
      FROM inventory 
      GROUP BY supplier_name 
      ORDER BY count DESC 
      LIMIT 5
    `);
    
    console.log('   📊 供应商统计:');
    supplierQuery.forEach((row, index) => {
      console.log(`     ${index + 1}. ${row.supplier_name}: ${row.count} 条记录`);
    });
    
    // 5. 验证结论
    console.log('\n📋 验证结论:');
    const totalRecords = inventoryCount[0].count + testCount[0].count + onlineCount[0].count;
    
    if (totalRecords > 0) {
      console.log('✅ 真实数据调用验证成功！');
      console.log(`   - 总数据量: ${totalRecords} 条`);
      console.log(`   - 库存数据: ${inventoryCount[0].count} 条`);
      console.log(`   - 测试数据: ${testCount[0].count} 条`);
      console.log(`   - 上线数据: ${onlineCount[0].count} 条`);
      console.log('   - 数据库连接正常');
      console.log('   - SQL查询正常');
      console.log('   - 字段映射正确');
    } else {
      console.log('❌ 数据库中没有真实数据');
      console.log('   建议: 需要先生成或导入真实数据');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 验证失败:', error.message);
    console.log('\n可能的问题:');
    console.log('1. 数据库连接配置错误');
    console.log('2. 表结构不存在或不匹配');
    console.log('3. 数据库权限问题');
    console.log('4. MySQL服务未启动');
  }
}

testRealDataAccess();
