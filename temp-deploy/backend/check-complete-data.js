import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkCompleteData() {
  console.log('🔍 检查完整数据生成情况...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查库存数据
    console.log('1. 📦 检查库存数据...');
    const [inventoryCount] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
    console.log(`   库存记录总数: ${inventoryCount[0].count} 条`);
    
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
    
    // 2. 检查测试数据
    console.log('\n2. 🧪 检查测试数据...');
    const [testCount] = await connection.execute('SELECT COUNT(*) as count FROM lab_tests');
    console.log(`   测试记录总数: ${testCount[0].count} 条`);
    
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
    
    // 3. 检查上线跟踪数据 - 这是关键！
    console.log('\n3. 🏭 检查上线跟踪数据...');
    const [onlineCount] = await connection.execute('SELECT COUNT(*) as count FROM online_tracking');
    console.log(`   上线跟踪记录总数: ${onlineCount[0].count} 条`);
    
    if (onlineCount[0].count > 0) {
      const [onlineSample] = await connection.execute(`
        SELECT id, material_name, supplier_name, defect_rate, exception_count, online_date 
        FROM online_tracking 
        ORDER BY online_date DESC
        LIMIT 5
      `);
      console.log('   样本数据:');
      onlineSample.forEach((row, index) => {
        console.log(`     ${index + 1}. ID:${row.id} - ${row.material_name} (${row.supplier_name}) - 不良率:${row.defect_rate}% - 异常:${row.exception_count}次 - 日期:${row.online_date}`);
      });
    } else {
      console.log('   ❌ 上线跟踪数据为空！这是问题所在！');
    }
    
    // 4. 检查批次管理数据
    console.log('\n4. 📋 检查批次管理数据...');
    const [batchCount] = await connection.execute('SELECT COUNT(*) as count FROM batch_management');
    console.log(`   批次管理记录总数: ${batchCount[0].count} 条`);
    
    if (batchCount[0].count > 0) {
      const [batchSample] = await connection.execute(`
        SELECT batch_number, material_code, material_name, supplier_name, quantity 
        FROM batch_management 
        LIMIT 3
      `);
      console.log('   样本数据:');
      batchSample.forEach((row, index) => {
        console.log(`     ${index + 1}. 批次:${row.batch_number} - ${row.material_code} - ${row.material_name} (${row.supplier_name}) - 数量:${row.quantity}`);
      });
    }
    
    // 5. 数据完整性分析
    console.log('\n📊 数据完整性分析:');
    
    const expectedInventory = 132;
    const expectedTests = 132 * 3; // 每个批次3次测试
    const expectedOnline = 132 * 8; // 每个批次8次上线记录
    
    console.log(`   预期数据量:`);
    console.log(`   - 库存记录: ${expectedInventory} 条`);
    console.log(`   - 测试记录: ${expectedTests} 条 (132批次 × 3次测试)`);
    console.log(`   - 上线记录: ${expectedOnline} 条 (132批次 × 8次上线)`);
    
    console.log(`\n   实际数据量:`);
    console.log(`   - 库存记录: ${inventoryCount[0].count} 条 ${inventoryCount[0].count === expectedInventory ? '✅' : '❌'}`);
    console.log(`   - 测试记录: ${testCount[0].count} 条 ${testCount[0].count === expectedTests ? '✅' : '❌'}`);
    console.log(`   - 上线记录: ${onlineCount[0].count} 条 ${onlineCount[0].count === expectedOnline ? '✅' : '❌'}`);
    
    // 6. 问题诊断
    console.log('\n🔍 问题诊断:');
    
    if (onlineCount[0].count === 0) {
      console.log('❌ 主要问题: 上线跟踪数据完全缺失！');
      console.log('   影响: 所有上线相关查询都会失败');
      console.log('   建议: 需要重新生成上线跟踪数据');
    } else if (onlineCount[0].count < expectedOnline) {
      console.log('⚠️ 问题: 上线跟踪数据不完整');
      console.log(`   缺失: ${expectedOnline - onlineCount[0].count} 条记录`);
    } else {
      console.log('✅ 上线跟踪数据完整');
    }
    
    if (testCount[0].count < expectedTests) {
      console.log('⚠️ 问题: 测试数据不完整');
      console.log(`   缺失: ${expectedTests - testCount[0].count} 条记录`);
    }
    
    // 7. 检查表结构
    console.log('\n🏗️ 检查表结构:');
    
    try {
      const [onlineColumns] = await connection.execute('DESCRIBE online_tracking');
      console.log('   online_tracking 表字段:');
      onlineColumns.forEach(col => {
        console.log(`     - ${col.Field}: ${col.Type}`);
      });
    } catch (error) {
      console.log('   ❌ online_tracking 表可能不存在或有问题');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

checkCompleteData();
