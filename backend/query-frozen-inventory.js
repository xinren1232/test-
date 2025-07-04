/**
 * 查询冻结库存数据
 * 用于验证前端筛选和后端数据是否一致
 */
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function queryFrozenInventory() {
  console.log('🧊 查询冻结库存数据\n');

  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 查询冻结状态的库存总数
    console.log('📊 步骤1: 冻结库存总数...');
    const [countResult] = await connection.query(`
      SELECT COUNT(*) as count 
      FROM inventory 
      WHERE status = '冻结'
    `);
    console.log(`❄️ 冻结库存总数: ${countResult[0].count} 条`);

    // 2. 按工厂分组统计冻结库存
    console.log('\n🏭 步骤2: 各工厂冻结库存分布...');
    const [factoryResult] = await connection.query(`
      SELECT 
        storage_location as 工厂,
        COUNT(*) as 冻结数量
      FROM inventory 
      WHERE status = '冻结'
      GROUP BY storage_location 
      ORDER BY COUNT(*) DESC
    `);
    
    if (factoryResult.length > 0) {
      console.table(factoryResult);
    } else {
      console.log('❌ 未找到冻结库存数据');
    }

    // 3. 按物料分组统计冻结库存
    console.log('\n📦 步骤3: 各物料冻结库存分布...');
    const [materialResult] = await connection.query(`
      SELECT 
        material_name as 物料名称,
        COUNT(*) as 冻结数量,
        GROUP_CONCAT(DISTINCT storage_location) as 涉及工厂
      FROM inventory 
      WHERE status = '冻结'
      GROUP BY material_name 
      ORDER BY COUNT(*) DESC
    `);
    
    if (materialResult.length > 0) {
      console.table(materialResult);
    } else {
      console.log('❌ 未找到冻结物料数据');
    }

    // 4. 按供应商分组统计冻结库存
    console.log('\n🏢 步骤4: 各供应商冻结库存分布...');
    const [supplierResult] = await connection.query(`
      SELECT 
        supplier_name as 供应商,
        COUNT(*) as 冻结数量,
        GROUP_CONCAT(DISTINCT material_name) as 涉及物料
      FROM inventory 
      WHERE status = '冻结'
      GROUP BY supplier_name 
      ORDER BY COUNT(*) DESC
    `);
    
    if (supplierResult.length > 0) {
      console.table(supplierResult);
    } else {
      console.log('❌ 未找到冻结供应商数据');
    }

    // 5. 冻结库存详细记录（前10条）
    console.log('\n📝 步骤5: 冻结库存详细记录（前10条）...');
    const [detailResult] = await connection.query(`
      SELECT 
        id as ID,
        material_name as 物料名称,
        supplier_name as 供应商,
        batch_code as 批次号,
        quantity as 数量,
        storage_location as 存储位置
      FROM inventory 
      WHERE status = '冻结'
      ORDER BY id
      LIMIT 10
    `);
    
    if (detailResult.length > 0) {
      console.table(detailResult);
    } else {
      console.log('❌ 未找到冻结库存详细记录');
    }

    // 6. 所有状态分布统计
    console.log('\n📈 步骤6: 所有库存状态分布...');
    const [statusResult] = await connection.query(`
      SELECT 
        status as 状态,
        COUNT(*) as 数量,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM inventory), 2) as 百分比
      FROM inventory 
      GROUP BY status 
      ORDER BY COUNT(*) DESC
    `);
    
    console.log('库存状态分布:');
    console.table(statusResult);

    await connection.end();

    // 7. 总结
    console.log('\n📋 查询总结:');
    if (countResult[0].count > 0) {
      console.log(`✅ 冻结库存总数: ${countResult[0].count} 条记录`);
      console.log('✅ 数据结构完整，包含工厂、物料、供应商等信息');
      console.log('🎯 请在前端页面筛选"冻结"状态并对比以上数据');
    } else {
      console.log('❌ 无冻结库存数据');
      console.log('💡 可能的原因:');
      console.log('   1. 数据尚未生成');
      console.log('   2. 状态字段值不匹配');
      console.log('   3. 数据同步未完成');
    }

  } catch (error) {
    console.error('❌ 查询失败:', error);
  }
}

// 运行查询
queryFrozenInventory();
