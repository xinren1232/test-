/**
 * 分析实际数据结构和内容
 * 用于基于真实数据更新规则
 */
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function analyzeActualData() {
  console.log('🔍 分析实际数据结构和内容\n');

  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 分析库存数据
    console.log('📦 步骤1: 分析库存数据结构...');
    const [inventoryData] = await connection.query('SELECT * FROM inventory LIMIT 3');
    console.log('库存数据样例:');
    console.table(inventoryData);

    // 2. 统计实际的供应商
    console.log('\n🏢 步骤2: 实际供应商列表...');
    const [suppliers] = await connection.query(`
      SELECT supplier_name as 供应商, COUNT(*) as 数量 
      FROM inventory 
      GROUP BY supplier_name 
      ORDER BY COUNT(*) DESC
    `);
    console.table(suppliers);

    // 3. 统计实际的物料
    console.log('\n📋 步骤3: 实际物料列表...');
    const [materials] = await connection.query(`
      SELECT material_name as 物料名称, COUNT(*) as 数量 
      FROM inventory 
      GROUP BY material_name 
      ORDER BY COUNT(*) DESC
    `);
    console.table(materials);

    // 4. 统计实际的工厂
    console.log('\n🏭 步骤4: 实际工厂列表...');
    const [factories] = await connection.query(`
      SELECT storage_location as 工厂, COUNT(*) as 数量 
      FROM inventory 
      GROUP BY storage_location 
      ORDER BY COUNT(*) DESC
    `);
    console.table(factories);

    // 5. 统计实际的状态
    console.log('\n📊 步骤5: 实际状态分布...');
    const [statuses] = await connection.query(`
      SELECT status as 状态, COUNT(*) as 数量 
      FROM inventory 
      GROUP BY status 
      ORDER BY COUNT(*) DESC
    `);
    console.table(statuses);

    // 6. 检查测试数据
    console.log('\n🧪 步骤6: 检查测试数据...');
    const [labCount] = await connection.query('SELECT COUNT(*) as count FROM lab_tests');
    console.log('测试数据总数:', labCount[0].count);

    if (labCount[0].count > 0) {
      const [labSample] = await connection.query('SELECT * FROM lab_tests LIMIT 2');
      console.log('测试数据样例:');
      console.table(labSample);
    }

    // 7. 检查上线数据
    console.log('\n🏭 步骤7: 检查上线数据...');
    const [onlineCount] = await connection.query('SELECT COUNT(*) as count FROM online_tracking');
    console.log('上线数据总数:', onlineCount[0].count);

    if (onlineCount[0].count > 0) {
      const [onlineSample] = await connection.query('SELECT * FROM online_tracking LIMIT 2');
      console.log('上线数据样例:');
      console.table(onlineSample);
    }

    // 8. 分析批次分布
    console.log('\n📋 步骤8: 批次分布分析...');
    const [batchStats] = await connection.query(`
      SELECT 
        COUNT(DISTINCT batch_code) as 批次总数,
        COUNT(DISTINCT material_name) as 物料种类,
        COUNT(DISTINCT supplier_name) as 供应商数量,
        COUNT(DISTINCT storage_location) as 工厂数量
      FROM inventory
    `);
    console.table(batchStats);

    await connection.end();

    console.log('\n📋 数据分析总结:');
    console.log('✅ 数据结构分析完成');
    console.log('✅ 可以基于以上真实数据更新AI规则');

  } catch (error) {
    console.error('❌ 分析失败:', error);
  }
}

// 运行分析
analyzeActualData();
