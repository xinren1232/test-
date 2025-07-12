import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkDatabaseStructure() {
  let connection;
  
  try {
    console.log('🔍 连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('=== INVENTORY表结构 ===');
    const [inventoryFields] = await connection.execute('DESCRIBE inventory');
    console.log('实际字段:');
    inventoryFields.forEach(field => {
      console.log(`  - ${field.Field} (${field.Type})`);
    });
    
    console.log('\n=== INVENTORY样本数据 ===');
    const [inventorySample] = await connection.execute('SELECT * FROM inventory LIMIT 1');
    if (inventorySample.length > 0) {
      console.log('样本数据:');
      Object.entries(inventorySample[0]).forEach(([key, value]) => {
        console.log(`  - ${key}: ${value}`);
      });
    }
    
    console.log('\n=== ONLINE_TRACKING表结构 ===');
    const [onlineFields] = await connection.execute('DESCRIBE online_tracking');
    console.log('实际字段:');
    onlineFields.forEach(field => {
      console.log(`  - ${field.Field} (${field.Type})`);
    });
    
    console.log('\n=== LAB_TESTS表结构 ===');
    const [labFields] = await connection.execute('DESCRIBE lab_tests');
    console.log('实际字段:');
    labFields.forEach(field => {
      console.log(`  - ${field.Field} (${field.Type})`);
    });
    
    // 基于实际字段生成正确的库存查询SQL
    console.log('\n🔧 生成正确的库存查询SQL...');
    const actualInventoryFields = inventoryFields.map(f => f.Field);
    
    let correctSQL = 'SELECT\n';
    
    // 根据实际字段映射
    if (actualInventoryFields.includes('factory')) {
      correctSQL += '  factory as 工厂,\n';
    } else if (actualInventoryFields.includes('storage_location')) {
      correctSQL += '  storage_location as 工厂,\n';
    } else {
      correctSQL += '  "未知" as 工厂,\n';
    }
    
    if (actualInventoryFields.includes('warehouse')) {
      correctSQL += '  warehouse as 仓库,\n';
    } else if (actualInventoryFields.includes('storage_location')) {
      correctSQL += '  storage_location as 仓库,\n';
    } else {
      correctSQL += '  "未知" as 仓库,\n';
    }
    
    if (actualInventoryFields.includes('material_code')) {
      correctSQL += '  material_code as 物料编码,\n';
    }
    
    if (actualInventoryFields.includes('material_name')) {
      correctSQL += '  material_name as 物料名称,\n';
    }
    
    if (actualInventoryFields.includes('supplier_name')) {
      correctSQL += '  supplier_name as 供应商,\n';
    }
    
    if (actualInventoryFields.includes('quantity')) {
      correctSQL += '  quantity as 数量,\n';
    }
    
    if (actualInventoryFields.includes('status')) {
      correctSQL += '  status as 状态,\n';
    }
    
    if (actualInventoryFields.includes('inbound_time')) {
      correctSQL += '  DATE_FORMAT(inbound_time, "%Y-%m-%d") as 入库时间,\n';
      correctSQL += '  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), "%Y-%m-%d") as 到期时间,\n';
    } else {
      correctSQL += '  "未知" as 入库时间,\n';
      correctSQL += '  "未知" as 到期时间,\n';
    }
    
    if (actualInventoryFields.includes('notes')) {
      correctSQL += '  COALESCE(notes, "") as 备注\n';
    } else {
      correctSQL += '  "" as 备注\n';
    }
    
    correctSQL += 'FROM inventory\n';
    correctSQL += 'ORDER BY ';
    
    if (actualInventoryFields.includes('inbound_time')) {
      correctSQL += 'inbound_time DESC\n';
    } else {
      correctSQL += 'id DESC\n';
    }
    
    correctSQL += 'LIMIT 20';
    
    console.log('\n正确的库存查询SQL:');
    console.log(correctSQL);
    
    // 测试这个SQL
    console.log('\n🧪 测试生成的SQL...');
    const [testResult] = await connection.execute(correctSQL);
    console.log(`测试结果: 返回 ${testResult.length} 条记录`);
    
    if (testResult.length > 0) {
      console.log('第一条记录的字段:');
      Object.keys(testResult[0]).forEach(key => {
        console.log(`  - ${key}: ${testResult[0][key]}`);
      });
    }
    
    console.log('\n✅ 数据库结构检查完成！');
    
  } catch (error) {
    console.error('❌ 检查过程中出错:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDatabaseStructure();
