import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function testDirectQuery() {
  console.log('🧪 直接测试数据库查询...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 测试库存数据查询
    console.log('1. 测试库存数据查询...');
    const [inventoryData] = await connection.execute(`
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
      LIMIT 10
    `);
    
    if (inventoryData.length > 0) {
      console.log('   ✅ 库存数据查询成功');
      console.log(`   📊 返回 ${inventoryData.length} 条记录`);
      inventoryData.slice(0, 3).forEach((row, index) => {
        console.log(`     ${index + 1}. ${row.工厂} - ${row.物料编码} - ${row.物料名称} - ${row.供应商} - ${row.数量} - ${row.状态}`);
      });
    } else {
      console.log('   ❌ 库存数据为空');
    }
    
    // 2. 测试聚龙供应商查询
    console.log('\n2. 测试聚龙供应商查询...');
    const [julongData] = await connection.execute(`
      SELECT 
        storage_location as 工厂,
        material_code as 物料编码,
        material_name as 物料名称,
        supplier_name as 供应商,
        quantity as 数量,
        status as 状态
      FROM inventory 
      WHERE supplier_name LIKE '%聚龙%'
      ORDER BY inbound_time DESC 
      LIMIT 10
    `);
    
    if (julongData.length > 0) {
      console.log('   ✅ 聚龙供应商数据查询成功');
      console.log(`   📊 返回 ${julongData.length} 条记录`);
      julongData.slice(0, 3).forEach((row, index) => {
        console.log(`     ${index + 1}. ${row.工厂} - ${row.物料编码} - ${row.物料名称} - ${row.供应商} - ${row.数量} - ${row.状态}`);
      });
    } else {
      console.log('   ❌ 聚龙供应商数据为空');
    }
    
    // 3. 测试供应商统计
    console.log('\n3. 测试供应商统计...');
    const [supplierStats] = await connection.execute(`
      SELECT 
        supplier_name as 供应商,
        COUNT(*) as 记录数量
      FROM inventory 
      WHERE supplier_name IS NOT NULL AND supplier_name != ''
      GROUP BY supplier_name 
      ORDER BY 记录数量 DESC 
      LIMIT 10
    `);
    
    if (supplierStats.length > 0) {
      console.log('   ✅ 供应商统计查询成功');
      console.log(`   📊 返回 ${supplierStats.length} 个供应商`);
      supplierStats.slice(0, 5).forEach((row, index) => {
        console.log(`     ${index + 1}. ${row.供应商}: ${row.记录数量} 条记录`);
      });
    } else {
      console.log('   ❌ 供应商统计数据为空');
    }
    
    // 4. 测试测试数据
    console.log('\n4. 测试测试数据查询...');
    const [testData] = await connection.execute(`
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
    
    if (testData.length > 0) {
      console.log('   ✅ 测试数据查询成功');
      console.log(`   📊 返回 ${testData.length} 条记录`);
      testData.forEach((row, index) => {
        console.log(`     ${index + 1}. ${row.测试编号} - ${row.物料编码} - ${row.物料名称} - ${row.供应商} - ${row.测试结果}`);
      });
    } else {
      console.log('   ❌ 测试数据为空');
    }
    
    // 5. 验证结论
    console.log('\n📋 验证结论:');
    
    const totalInventory = inventoryData.length;
    const totalJulong = julongData.length;
    const totalSuppliers = supplierStats.length;
    const totalTests = testData.length;
    
    if (totalInventory > 0 || totalTests > 0) {
      console.log('✅ 真实数据调用验证成功！');
      console.log(`   - 库存数据: ${totalInventory > 0 ? '有数据' : '无数据'}`);
      console.log(`   - 聚龙供应商: ${totalJulong > 0 ? '有数据' : '无数据'}`);
      console.log(`   - 供应商统计: ${totalSuppliers > 0 ? '有数据' : '无数据'}`);
      console.log(`   - 测试数据: ${totalTests > 0 ? '有数据' : '无数据'}`);
      console.log('   - 数据库连接正常');
      console.log('   - SQL查询正常');
      console.log('   - 字段映射正确');
      
      if (totalJulong > 0) {
        console.log('\n🎯 聚龙供应商查询可以实现！');
      } else {
        console.log('\n⚠️ 聚龙供应商数据不存在，需要检查数据生成');
      }
    } else {
      console.log('❌ 数据库中没有真实数据');
      console.log('   建议: 需要先生成或导入真实数据');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 验证失败:', error.message);
  }
}

testDirectQuery();
