import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkBatteryData() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔍 检查数据库中的电池数据...\n');
    
    // 1. 检查所有物料
    console.log('📋 1. 检查所有物料:');
    const [allMaterials] = await connection.execute(`
      SELECT DISTINCT material_name, COUNT(*) as count 
      FROM inventory 
      GROUP BY material_name 
      ORDER BY material_name
    `);

    console.log('数据库中的所有物料:');
    allMaterials.forEach(m => {
      console.log(`  ${m.material_name}: ${m.count}条记录`);
    });

    // 2. 专门检查电池相关数据
    console.log('\n🔋 2. 检查电池相关数据:');
    const [batteryData] = await connection.execute(`
      SELECT material_name, supplier_name, quantity, status, storage_location
      FROM inventory 
      WHERE material_name LIKE '%电池%'
      ORDER BY material_name, supplier_name
    `);

    if (batteryData.length > 0) {
      console.log(`找到 ${batteryData.length} 条电池相关记录:`);
      batteryData.forEach(item => {
        console.log(`  ${item.material_name} | ${item.supplier_name} | ${item.quantity} | ${item.status} | ${item.storage_location}`);
      });
    } else {
      console.log('❌ 没有找到电池相关数据');
    }

    // 3. 检查精确的电池数据
    console.log('\n🎯 3. 检查精确的电池数据:');
    const [exactBattery] = await connection.execute(`
      SELECT material_name, supplier_name, quantity, status, storage_location
      FROM inventory 
      WHERE material_name = '电池'
      ORDER BY supplier_name
    `);

    if (exactBattery.length > 0) {
      console.log(`找到 ${exactBattery.length} 条精确电池记录:`);
      exactBattery.forEach(item => {
        console.log(`  ${item.material_name} | ${item.supplier_name} | ${item.quantity} | ${item.status} | ${item.storage_location}`);
      });
    } else {
      console.log('❌ 没有找到精确的电池数据');
    }

    // 4. 检查当前的物料库存查询规则
    console.log('\n📝 4. 检查物料库存查询规则:');
    const [rules] = await connection.execute(`
      SELECT intent_name, action_target
      FROM nlp_intent_rules 
      WHERE intent_name LIKE '%物料%' OR intent_name LIKE '%电池%'
      ORDER BY intent_name
    `);

    rules.forEach(rule => {
      console.log(`\n规则: ${rule.intent_name}`);
      console.log(`SQL: ${rule.action_target.substring(0, 150)}...`);
    });

    // 5. 手动测试电池查询SQL
    console.log('\n🧪 5. 手动测试电池查询SQL:');
    
    const testSQL = `
      SELECT 
        storage_location as 工厂,
        material_code as 物料编码,
        material_name as 物料名称,
        supplier_name as 供应商,
        quantity as 数量,
        status as 状态,
        DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间
      FROM inventory 
      WHERE material_name = '电池'
      ORDER BY inbound_time DESC 
      LIMIT 10
    `;

    try {
      const [testResults] = await connection.execute(testSQL);
      console.log(`手动SQL查询结果: ${testResults.length} 条记录`);
      
      if (testResults.length > 0) {
        testResults.forEach(item => {
          console.log(`  ${item.物料名称} | ${item.供应商} | ${item.数量} | ${item.状态} | ${item.工厂}`);
        });
      }
    } catch (error) {
      console.log(`手动SQL查询失败: ${error.message}`);
    }

    // 6. 检查是否需要重新生成数据
    console.log('\n📊 6. 数据统计:');
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(DISTINCT material_name) as unique_materials,
        COUNT(DISTINCT supplier_name) as unique_suppliers
      FROM inventory
    `);

    console.log(`总记录数: ${stats[0].total_records}`);
    console.log(`物料种类: ${stats[0].unique_materials}`);
    console.log(`供应商数量: ${stats[0].unique_suppliers}`);

    if (stats[0].total_records < 100) {
      console.log('\n⚠️ 数据量较少，建议重新生成数据');
    }

  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行检查
checkBatteryData();
