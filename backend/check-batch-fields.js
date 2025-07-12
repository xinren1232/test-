import mysql from 'mysql2/promise';

async function checkBatchFields() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });
  
  try {
    console.log('🔍 检查库存表的字段结构...\n');
    
    const [fields] = await connection.execute(`
      DESCRIBE inventory
    `);
    
    console.log('📋 inventory表字段:');
    fields.forEach(field => {
      console.log(`- ${field.Field}: ${field.Type}`);
    });
    
    console.log('\n🔍 检查库存表中的批次相关数据...');
    const [sampleData] = await connection.execute(`
      SELECT * FROM inventory LIMIT 5
    `);
    
    console.log('📊 前5条库存数据:');
    sampleData.forEach((row, index) => {
      console.log(`${index + 1}. 物料: ${row.material_name}, 批次相关字段:`);
      Object.keys(row).forEach(key => {
        if (key.toLowerCase().includes('batch') || key.includes('批次')) {
          console.log(`   ${key}: ${row[key]}`);
        }
      });
    });
    
    console.log('\n🔍 检查结构件类库存的具体数据...');
    const [structuralData] = await connection.execute(`
      SELECT material_name, batch_code, supplier_name, status 
      FROM inventory 
      WHERE material_name LIKE '%结构%' OR material_name LIKE '%中框%' OR material_name LIKE '%侧键%'
      LIMIT 10
    `);
    
    console.log('📦 结构件类库存数据:');
    structuralData.forEach((row, index) => {
      console.log(`${index + 1}. 物料: ${row.material_name}, 批次: ${row.batch_code}, 供应商: ${row.supplier_name}, 状态: ${row.status}`);
    });
    
  } finally {
    await connection.end();
  }
}

checkBatchFields().catch(console.error);
