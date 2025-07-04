/**
 * 查询重庆工厂的库存数据
 * 用于验证前端筛选和后端数据是否一致
 */
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function queryChongqingFactory() {
  console.log('🏭 查询重庆工厂库存数据\n');

  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 查询重庆工厂的所有库存记录
    console.log('📊 步骤1: 查询重庆工厂库存总数...');
    const [countResult] = await connection.query(`
      SELECT COUNT(*) as count 
      FROM inventory 
      WHERE storage_location = '重庆工厂' OR storage_location LIKE '%重庆%'
    `);
    console.log(`📦 重庆工厂库存总数: ${countResult[0].count} 条`);

    // 2. 按物料分组统计
    console.log('\n📋 步骤2: 重庆工厂物料分布...');
    const [materialResult] = await connection.query(`
      SELECT 
        material_name as 物料名称,
        COUNT(*) as 数量,
        GROUP_CONCAT(DISTINCT supplier_name) as 供应商
      FROM inventory 
      WHERE storage_location = '重庆工厂' OR storage_location LIKE '%重庆%'
      GROUP BY material_name 
      ORDER BY COUNT(*) DESC
    `);
    
    if (materialResult.length > 0) {
      console.table(materialResult);
    } else {
      console.log('❌ 未找到重庆工厂的库存数据');
    }

    // 3. 按供应商分组统计
    console.log('\n🏢 步骤3: 重庆工厂供应商分布...');
    const [supplierResult] = await connection.query(`
      SELECT 
        supplier_name as 供应商,
        COUNT(*) as 数量,
        GROUP_CONCAT(DISTINCT material_name) as 物料
      FROM inventory 
      WHERE storage_location = '重庆工厂' OR storage_location LIKE '%重庆%'
      GROUP BY supplier_name 
      ORDER BY COUNT(*) DESC
    `);
    
    if (supplierResult.length > 0) {
      console.table(supplierResult);
    } else {
      console.log('❌ 未找到重庆工厂的供应商数据');
    }

    // 4. 按状态分组统计
    console.log('\n📈 步骤4: 重庆工厂库存状态分布...');
    const [statusResult] = await connection.query(`
      SELECT 
        status as 状态,
        COUNT(*) as 数量
      FROM inventory 
      WHERE storage_location = '重庆工厂' OR storage_location LIKE '%重庆%'
      GROUP BY status 
      ORDER BY COUNT(*) DESC
    `);
    
    if (statusResult.length > 0) {
      console.table(statusResult);
    } else {
      console.log('❌ 未找到重庆工厂的状态数据');
    }

    // 5. 详细记录列表（前10条）
    console.log('\n📝 步骤5: 重庆工厂库存详细记录（前10条）...');
    const [detailResult] = await connection.query(`
      SELECT 
        id as ID,
        material_name as 物料名称,
        supplier_name as 供应商,
        batch_code as 批次号,
        quantity as 数量,
        status as 状态,
        storage_location as 存储位置
      FROM inventory 
      WHERE storage_location = '重庆工厂' OR storage_location LIKE '%重庆%'
      ORDER BY id
      LIMIT 10
    `);
    
    if (detailResult.length > 0) {
      console.table(detailResult);
    } else {
      console.log('❌ 未找到重庆工厂的详细记录');
    }

    // 6. 检查所有可能的工厂/存储位置
    console.log('\n🏭 步骤6: 检查所有存储位置...');
    const [locationResult] = await connection.query(`
      SELECT 
        storage_location as 存储位置,
        COUNT(*) as 数量
      FROM inventory 
      GROUP BY storage_location 
      ORDER BY COUNT(*) DESC
    `);
    
    console.log('所有存储位置分布:');
    console.table(locationResult);

    await connection.end();

    // 7. 总结
    console.log('\n📋 查询总结:');
    if (countResult[0].count > 0) {
      console.log(`✅ 重庆工厂库存数据: ${countResult[0].count} 条记录`);
      console.log('✅ 数据结构完整，包含物料、供应商、状态等信息');
      console.log('🎯 请在前端页面筛选"重庆工厂"并对比以上数据');
    } else {
      console.log('❌ 重庆工厂无库存数据');
      console.log('💡 可能的原因:');
      console.log('   1. 数据尚未生成');
      console.log('   2. 存储位置字段名称不匹配');
      console.log('   3. 数据同步未完成');
    }

  } catch (error) {
    console.error('❌ 查询失败:', error);
  }
}

// 运行查询
queryChongqingFactory();
