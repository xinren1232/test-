// 修复JSON存储问题
const mysql = require('mysql2/promise');

async function fixJsonStorage() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });

  try {
    console.log('🔧 修复JSON存储问题...\n');
    
    // 1. 检查表结构
    console.log('📋 检查表结构:');
    const [structure] = await connection.execute('DESCRIBE frontend_data_sync');
    structure.forEach(field => {
      console.log(`  ${field.Field}: ${field.Type}`);
    });
    
    // 2. 修改表结构，将data_content改为TEXT类型
    console.log('\n🔧 修改表结构...');
    await connection.execute(`
      ALTER TABLE frontend_data_sync 
      MODIFY COLUMN data_content LONGTEXT
    `);
    console.log('✅ 表结构修改成功');
    
    // 3. 清理数据
    await connection.execute('DELETE FROM frontend_data_sync');
    console.log('✅ 清理旧数据');
    
    // 4. 正确插入JSON数据
    console.log('\n📤 插入正确的JSON数据...');
    
    const inventoryData = [
      {
        id: "test-inv-1",
        materialName: "电池盖",
        supplier: "聚龙",
        factory: "宜宾工厂",
        warehouse: "中央库存",
        quantity: 116,
        status: "正常",
        batchNo: 263631,
        projectId: "S665LN",
        baselineId: "I6788"
      },
      {
        id: "test-inv-2", 
        materialName: "电池壳",
        supplier: "比亚迪",
        factory: "重庆工厂",
        warehouse: "原料库",
        quantity: 85,
        status: "正常",
        batchNo: 263632,
        projectId: "X6831",
        baselineId: "I6789"
      }
    ];
    
    const inspectionData = [
      {
        id: "test-insp-1",
        materialName: "电池盖",
        supplier: "聚龙",
        testResult: "PASS",
        testDate: "2025-07-16T16:01:23.989Z",
        batchNo: 263631,
        projectId: "X6831",
        defectDescription: ""
      }
    ];
    
    const productionData = [
      {
        id: "test-prod-1",
        materialName: "电池盖",
        supplier: "聚龙",
        factory: "重庆工厂",
        batchNo: 263631,
        projectId: "X6831",
        baselineId: "I6788",
        onlineTime: "2025-07-16T16:01:23.989Z",
        defectRate: 0,
        defect: ""
      }
    ];
    
    // 使用正确的方式插入JSON数据
    const inventoryJson = JSON.stringify(inventoryData);
    const inspectionJson = JSON.stringify(inspectionData);
    const productionJson = JSON.stringify(productionData);
    
    console.log('库存数据JSON长度:', inventoryJson.length);
    console.log('检验数据JSON长度:', inspectionJson.length);
    console.log('生产数据JSON长度:', productionJson.length);
    
    await connection.execute(`
      INSERT INTO frontend_data_sync (data_type, data_content, created_at)
      VALUES (?, ?, NOW())
    `, ['inventory', inventoryJson]);
    
    await connection.execute(`
      INSERT INTO frontend_data_sync (data_type, data_content, created_at)
      VALUES (?, ?, NOW())
    `, ['inspection', inspectionJson]);
    
    await connection.execute(`
      INSERT INTO frontend_data_sync (data_type, data_content, created_at)
      VALUES (?, ?, NOW())
    `, ['production', productionJson]);
    
    console.log('✅ JSON数据插入成功');
    
    // 5. 验证数据
    console.log('\n✅ 验证插入的数据:');
    const [rows] = await connection.execute(`
      SELECT data_type, data_content 
      FROM frontend_data_sync 
      ORDER BY created_at DESC
    `);
    
    rows.forEach(row => {
      console.log(`\n${row.data_type} 数据:`);
      console.log(`  数据类型: ${typeof row.data_content}`);
      console.log(`  数据长度: ${row.data_content.length}`);
      console.log(`  前50字符: ${row.data_content.substring(0, 50)}...`);
      
      try {
        const parsed = JSON.parse(row.data_content);
        console.log(`  ✅ JSON解析成功，包含 ${parsed.length} 条记录`);
        if (parsed.length > 0) {
          const sample = parsed[0];
          console.log(`  示例记录:`);
          console.log(`    ID: ${sample.id}`);
          console.log(`    物料名称: ${sample.materialName}`);
          console.log(`    供应商: ${sample.supplier}`);
        }
      } catch (error) {
        console.log(`  ❌ JSON解析失败: ${error.message}`);
      }
    });
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  } finally {
    await connection.end();
  }
}

fixJsonStorage();
