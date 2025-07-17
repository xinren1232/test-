/**
 * 调试库存数据查询问题
 */

const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function debugInventoryData() {
  let connection;
  
  try {
    console.log('🔍 调试库存数据查询问题...\n');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功\n');
    
    // 1. 检查inventory表结构
    console.log('📋 步骤1: 检查inventory表结构...');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'iqe_inspection' AND TABLE_NAME = 'inventory'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('表结构:');
    columns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (可空: ${col.IS_NULLABLE}, 默认: ${col.COLUMN_DEFAULT})`);
    });
    
    // 2. 检查数据总量
    console.log('\n📊 步骤2: 检查数据总量...');
    const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM inventory');
    console.log(`总记录数: ${countResult[0].total}`);
    
    // 3. 检查空值情况
    console.log('\n🔍 步骤3: 检查空值情况...');
    const nullChecks = [
      'storage_location',
      'material_code', 
      'material_name',
      'material_type',
      'supplier_name',
      'quantity',
      'status',
      'inbound_time',
      'notes'
    ];
    
    for (const field of nullChecks) {
      const [nullCount] = await connection.execute(`
        SELECT COUNT(*) as null_count 
        FROM inventory 
        WHERE ${field} IS NULL OR ${field} = '' OR ${field} = 'null'
      `);
      console.log(`  ${field}: ${nullCount[0].null_count} 条空值记录`);
    }
    
    // 4. 查看前10条实际数据
    console.log('\n📋 步骤4: 查看前10条实际数据...');
    const [sampleData] = await connection.execute(`
      SELECT 
        id,
        storage_location,
        material_code,
        material_name,
        material_type,
        supplier_name,
        quantity,
        status,
        DATE_FORMAT(inbound_time, '%Y-%m-%d') as inbound_time,
        notes
      FROM inventory 
      ORDER BY id DESC 
      LIMIT 10
    `);
    
    console.log('实际数据样本:');
    sampleData.forEach((row, index) => {
      console.log(`\n记录 ${index + 1}:`);
      Object.entries(row).forEach(([key, value]) => {
        const displayValue = value === null ? '[NULL]' : 
                           value === '' ? '[EMPTY]' : 
                           value === 'null' ? '[STRING_NULL]' : value;
        console.log(`  ${key}: ${displayValue}`);
      });
    });
    
    // 5. 测试库存查询SQL
    console.log('\n🧪 步骤5: 测试库存查询SQL...');
    const testSQL = `
      SELECT 
        COALESCE(storage_location, '未知工厂') as 工厂,
        COALESCE(storage_location, '未知仓库') as 仓库,
        COALESCE(material_code, '无编码') as 物料编码,
        COALESCE(material_name, '未知物料') as 物料名称,
        COALESCE(supplier_name, '未知供应商') as 供应商,
        COALESCE(quantity, 0) as 数量,
        COALESCE(status, '未知状态') as 状态,
        COALESCE(DATE_FORMAT(inbound_time, '%Y-%m-%d'), '未知日期') as 入库时间,
        COALESCE(DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d'), '未知日期') as 到期时间,
        COALESCE(notes, '') as 备注
      FROM inventory 
      ORDER BY inbound_time DESC 
      LIMIT 10
    `;
    
    const [queryResults] = await connection.execute(testSQL);
    
    console.log('查询结果:');
    queryResults.forEach((row, index) => {
      console.log(`\n结果 ${index + 1}:`);
      Object.entries(row).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    });
    
    // 6. 检查是否有特殊字符或编码问题
    console.log('\n🔤 步骤6: 检查特殊字符和编码问题...');
    const [encodingCheck] = await connection.execute(`
      SELECT 
        material_name,
        supplier_name,
        HEX(material_name) as material_name_hex,
        HEX(supplier_name) as supplier_name_hex,
        LENGTH(material_name) as material_name_length,
        LENGTH(supplier_name) as supplier_name_length
      FROM inventory 
      WHERE material_name IS NOT NULL AND supplier_name IS NOT NULL
      LIMIT 5
    `);
    
    console.log('编码检查结果:');
    encodingCheck.forEach((row, index) => {
      console.log(`\n记录 ${index + 1}:`);
      console.log(`  物料名称: "${row.material_name}" (长度: ${row.material_name_length})`);
      console.log(`  供应商: "${row.supplier_name}" (长度: ${row.supplier_name_length})`);
      console.log(`  物料名称HEX: ${row.material_name_hex}`);
      console.log(`  供应商HEX: ${row.supplier_name_hex}`);
    });
    
  } catch (error) {
    console.error('❌ 调试过程中出现错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 运行调试
debugInventoryData();
