/**
 * 检查实际业务数据
 * 查看真实的数据库内容，而不是示例数据
 */

import mysql from 'mysql2/promise';

async function checkActualBusinessData() {
  console.log('🔍 检查实际业务数据...\n');

  try {
    // 连接数据库
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });

    console.log('✅ 连接到数据库成功！\n');

    // 检查所有表
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📊 数据库中的所有表:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });

    console.log('\n📦 检查inventory表的实际数据:');
    const [inventoryRows] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
    console.log(`记录总数: ${inventoryRows[0].count}`);
    
    if (inventoryRows[0].count > 0) {
      // 显示前5条记录
      const [inventorySample] = await connection.execute('SELECT * FROM inventory LIMIT 5');
      console.log('前5条记录:');
      inventorySample.forEach((row, index) => {
        console.log(`记录 ${index + 1}:`, {
          id: row.id,
          material_name: row.material_name,
          supplier_name: row.supplier_name,
          storage_location: row.storage_location,
          status: row.status,
          material_type: row.material_type
        });
      });
      
      // 检查唯一值
      const [uniqueSuppliers] = await connection.execute('SELECT DISTINCT supplier_name FROM inventory WHERE supplier_name IS NOT NULL AND supplier_name != ""');
      console.log('实际供应商:', uniqueSuppliers.map(s => s.supplier_name));
      
      const [uniqueMaterials] = await connection.execute('SELECT DISTINCT material_name FROM inventory WHERE material_name IS NOT NULL AND material_name != ""');
      console.log('实际物料:', uniqueMaterials.map(m => m.material_name));
    } else {
      console.log('❌ inventory表为空');
    }

    console.log('\n🧪 检查lab_tests表的实际数据:');
    const [labTestRows] = await connection.execute('SELECT COUNT(*) as count FROM lab_tests');
    console.log(`记录总数: ${labTestRows[0].count}`);
    
    if (labTestRows[0].count > 0) {
      const [labTestSample] = await connection.execute('SELECT * FROM lab_tests LIMIT 3');
      console.log('前3条记录:');
      labTestSample.forEach((row, index) => {
        console.log(`记录 ${index + 1}:`, {
          id: row.id,
          material_name: row.material_name,
          test_item: row.test_item,
          test_result: row.test_result,
          conclusion: row.conclusion
        });
      });
    } else {
      console.log('❌ lab_tests表为空');
    }

    console.log('\n⚙️ 检查online_tracking表的实际数据:');
    const [trackingRows] = await connection.execute('SELECT COUNT(*) as count FROM online_tracking');
    console.log(`记录总数: ${trackingRows[0].count}`);
    
    if (trackingRows[0].count > 0) {
      const [trackingSample] = await connection.execute('SELECT * FROM online_tracking LIMIT 3');
      console.log('前3条记录:');
      trackingSample.forEach((row, index) => {
        console.log(`记录 ${index + 1}:`, {
          id: row.id,
          factory: row.factory,
          workshop: row.workshop,
          line: row.line,
          project: row.project,
          material_name: row.material_name
        });
      });
    } else {
      console.log('❌ online_tracking表为空');
    }

    // 检查是否有其他可能的数据表
    console.log('\n🔍 检查其他可能的数据表:');
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      if (!['inventory', 'lab_tests', 'online_tracking', 'nlp_intent_rules', 'nlp_rules'].includes(tableName)) {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM \`${tableName}\``);
        console.log(`${tableName}: ${count[0].count} 条记录`);
        
        if (count[0].count > 0 && count[0].count < 100) {
          // 显示小表的结构
          const [structure] = await connection.execute(`DESCRIBE \`${tableName}\``);
          console.log(`  结构:`, structure.map(col => col.Field));
          
          // 显示样本数据
          const [sample] = await connection.execute(`SELECT * FROM \`${tableName}\` LIMIT 2`);
          if (sample.length > 0) {
            console.log(`  样本:`, sample[0]);
          }
        }
      }
    }

    await connection.end();
    console.log('\n🎉 实际数据检查完成！');

  } catch (error) {
    console.error('❌ 数据检查失败:', error);
    process.exit(1);
  }
}

// 运行检查
checkActualBusinessData();
