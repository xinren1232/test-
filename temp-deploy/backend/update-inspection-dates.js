import mysql from 'mysql2/promise';

async function updateInspectionDates() {
  console.log('🔧 更新online_tracking表中的inspection_date字段...\n');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root', 
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    // 1. 检查需要更新的记录数量
    const [countResult] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM online_tracking 
      WHERE inspection_date IS NULL
    `);
    
    console.log(`📊 需要更新的记录数量: ${countResult[0].count}`);
    
    if (countResult[0].count === 0) {
      console.log('✅ 所有记录的inspection_date字段都已有值');
      await connection.end();
      return;
    }
    
    // 2. 更新inspection_date字段
    // 策略：使用use_time作为基准，随机往前推0-30天作为检验日期
    console.log('🔄 正在更新inspection_date字段...');
    
    const updateResult = await connection.execute(`
      UPDATE online_tracking 
      SET inspection_date = DATE_SUB(
        COALESCE(use_time, online_date, NOW()), 
        INTERVAL FLOOR(RAND() * 30) DAY
      ) + INTERVAL FLOOR(RAND() * 24) HOUR + INTERVAL FLOOR(RAND() * 60) MINUTE
      WHERE inspection_date IS NULL
    `);
    
    console.log(`✅ 已更新 ${updateResult[0].affectedRows} 条记录`);
    
    // 3. 验证更新结果
    const [verifyResult] = await connection.execute(`
      SELECT 
        COUNT(*) as total_count,
        COUNT(inspection_date) as has_inspection_date,
        COUNT(*) - COUNT(inspection_date) as null_inspection_date
      FROM online_tracking
    `);
    
    console.log('📊 更新后统计:', verifyResult[0]);
    
    // 4. 显示一些示例数据
    console.log('\n📋 示例数据:');
    const [sampleData] = await connection.execute(`
      SELECT 
        id, 
        material_name,
        DATE_FORMAT(use_time, '%Y-%m-%d %H:%i') as use_time,
        DATE_FORMAT(inspection_date, '%Y-%m-%d %H:%i') as inspection_date
      FROM online_tracking 
      WHERE inspection_date IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    console.table(sampleData);
    
    await connection.end();
    console.log('\n🎉 更新完成！');
    
  } catch (error) {
    console.error('❌ 更新失败:', error.message);
    process.exit(1);
  }
}

// 运行脚本
updateInspectionDates();
