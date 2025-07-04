/**
 * 验证前端数据同步问题
 * 检查前端生成的数据是否正确同步到数据库
 */
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function verifyFrontendDataSync() {
  console.log('🔍 验证前端数据同步问题\n');

  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查当前数据库状态
    console.log('📊 步骤1: 检查当前数据库状态...');
    
    const [countResult] = await connection.query('SELECT COUNT(*) as count FROM inventory');
    console.log(`📦 当前库存数据总数: ${countResult[0].count}`);

    // 2. 检查供应商分布
    const [supplierResult] = await connection.query(`
      SELECT supplier_name, COUNT(*) as count 
      FROM inventory 
      GROUP BY supplier_name 
      ORDER BY count DESC
    `);
    console.log('\n🏢 当前供应商分布:');
    console.table(supplierResult);

    // 3. 检查是否包含MaterialSupplierMap.js中的供应商
    const targetSuppliers = ['聚龙', '欣冠', '广正'];
    const [targetResult] = await connection.query(`
      SELECT supplier_name, COUNT(*) as count 
      FROM inventory 
      WHERE supplier_name IN (?, ?, ?)
      GROUP BY supplier_name
    `, targetSuppliers);
    
    console.log('\n🎯 目标供应商检查:');
    if (targetResult.length > 0) {
      console.log('✅ 找到目标供应商数据:');
      console.table(targetResult);
      
      const totalTargetRecords = targetResult.reduce((sum, item) => sum + item.count, 0);
      console.log(`📊 目标供应商总记录数: ${totalTargetRecords}`);
      
      if (totalTargetRecords >= 60) { // 预期至少60条（3个供应商 × 20条左右）
        console.log('✅ 数据同步正常，记录数量充足');
      } else {
        console.log('⚠️  数据同步可能不完整，记录数量偏少');
      }
    } else {
      console.log('❌ 未找到目标供应商数据');
      console.log('💡 这表明前端生成的数据没有正确同步到数据库');
    }

    // 4. 检查物料分布
    const [materialResult] = await connection.query(`
      SELECT material_name, COUNT(*) as count 
      FROM inventory 
      GROUP BY material_name 
      ORDER BY count DESC
      LIMIT 10
    `);
    console.log('\n📋 物料分布（前10）:');
    console.table(materialResult);

    // 5. 检查是否包含MaterialSupplierMap.js中的物料
    const targetMaterials = ['电池盖', '中框', '手机卡托', '侧键', '装饰件'];
    const [materialTargetResult] = await connection.query(`
      SELECT material_name, COUNT(*) as count 
      FROM inventory 
      WHERE material_name IN (?, ?, ?, ?, ?)
      GROUP BY material_name
    `, targetMaterials);
    
    console.log('\n🎯 目标物料检查:');
    if (materialTargetResult.length > 0) {
      console.log('✅ 找到目标物料数据:');
      console.table(materialTargetResult);
    } else {
      console.log('❌ 未找到目标物料数据');
    }

    // 6. 检查最新数据的时间戳
    const [timeResult] = await connection.query(`
      SELECT 
        MAX(created_at) as latest_created,
        MAX(updated_at) as latest_updated,
        COUNT(*) as total_count
      FROM inventory
    `);
    
    console.log('\n⏰ 数据时间戳检查:');
    console.table(timeResult);
    
    const latestTime = new Date(timeResult[0].latest_created || timeResult[0].latest_updated);
    const now = new Date();
    const timeDiff = (now - latestTime) / (1000 * 60); // 分钟差
    
    if (timeDiff < 30) {
      console.log(`✅ 数据较新，最后更新时间: ${Math.round(timeDiff)}分钟前`);
    } else {
      console.log(`⚠️  数据较旧，最后更新时间: ${Math.round(timeDiff)}分钟前`);
      console.log('💡 建议重新运行前端数据生成和同步');
    }

    await connection.end();

    // 7. 总结和建议
    console.log('\n📋 总结和建议:');
    
    if (targetResult.length > 0 && materialTargetResult.length > 0) {
      console.log('✅ 数据同步状态: 正常');
      console.log('✅ 前端生成的数据已正确同步到数据库');
      console.log('✅ AI查询系统可以使用真实数据');
    } else {
      console.log('❌ 数据同步状态: 异常');
      console.log('💡 建议操作:');
      console.log('   1. 在前端库存管理页面点击"生成数据"按钮');
      console.log('   2. 确保生成132条库存数据');
      console.log('   3. 检查数据是否自动推送到后端');
      console.log('   4. 如果推送失败，检查后端服务器状态');
    }

  } catch (error) {
    console.error('❌ 验证失败:', error);
  }
}

// 运行验证
verifyFrontendDataSync();
