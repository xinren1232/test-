// 调试前端数据同步问题
const mysql = require('mysql2/promise');

async function debugSyncData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });

  try {
    console.log('🔍 调试前端数据同步问题...\n');
    
    // 1. 查看原始数据内容
    console.log('📋 查看原始数据内容:');
    const [rows] = await connection.execute(`
      SELECT id, data_type, LEFT(data_content, 200) as data_preview, created_at
      FROM frontend_data_sync
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    rows.forEach((row, index) => {
      console.log(`\n记录 ${index + 1}:`);
      console.log(`  ID: ${row.id}`);
      console.log(`  类型: ${row.data_type}`);
      console.log(`  创建时间: ${row.created_at}`);
      console.log(`  数据预览: ${row.data_preview}`);

      // 检查是否是 [object Object] 问题
      if (row.data_preview && row.data_preview.includes('[object Object]')) {
        console.log(`  🚨 发现 [object Object] 问题！`);
      }
    });
    
    // 2. 清理错误数据并重新测试
    console.log('\n🧹 清理错误数据...');
    await connection.execute('DELETE FROM frontend_data_sync');
    console.log('✅ 错误数据已清理');
    
    // 3. 插入测试数据
    console.log('\n🧪 插入测试数据...');
    
    const testInventory = [
      {
        id: 1,
        materialName: '测试物料A',
        supplier: '测试供应商A',
        factory: '测试工厂A',
        warehouse: '测试仓库A',
        quantity: 100,
        status: '正常'
      },
      {
        id: 2,
        materialName: '测试物料B',
        supplier: '测试供应商B',
        factory: '测试工厂B',
        warehouse: '测试仓库B',
        quantity: 200,
        status: '正常'
      }
    ];
    
    const testInspection = [
      {
        id: 1,
        materialName: '测试物料A',
        supplier: '测试供应商A',
        testResult: '合格',
        testDate: '2024-01-15',
        defectDescription: '无缺陷'
      }
    ];
    
    const testProduction = [
      {
        id: 1,
        materialName: '测试物料A',
        supplier: '测试供应商A',
        factory: '测试工厂A',
        project: '测试项目A',
        baseline: '测试基线A'
      }
    ];
    
    // 插入测试数据
    await connection.execute(`
      INSERT INTO frontend_data_sync (data_type, data_content, created_at)
      VALUES (?, ?, NOW())
    `, ['inventory', JSON.stringify(testInventory)]);
    
    await connection.execute(`
      INSERT INTO frontend_data_sync (data_type, data_content, created_at)
      VALUES (?, ?, NOW())
    `, ['inspection', JSON.stringify(testInspection)]);
    
    await connection.execute(`
      INSERT INTO frontend_data_sync (data_type, data_content, created_at)
      VALUES (?, ?, NOW())
    `, ['production', JSON.stringify(testProduction)]);
    
    console.log('✅ 测试数据插入成功');
    
    // 4. 验证测试数据
    console.log('\n✅ 验证测试数据:');
    const [testRows] = await connection.execute(`
      SELECT data_type, data_content 
      FROM frontend_data_sync 
      ORDER BY created_at DESC
    `);
    
    testRows.forEach(row => {
      console.log(`\n${row.data_type} 数据:`);
      try {
        const parsed = JSON.parse(row.data_content);
        console.log(`  ✅ JSON解析成功，包含 ${parsed.length} 条记录`);
        if (parsed.length > 0) {
          console.log(`  示例记录: ${JSON.stringify(parsed[0], null, 2)}`);
        }
      } catch (error) {
        console.log(`  ❌ JSON解析失败: ${error.message}`);
      }
    });
    
  } catch (error) {
    console.error('❌ 调试失败:', error.message);
  } finally {
    await connection.end();
  }
}

debugSyncData();
