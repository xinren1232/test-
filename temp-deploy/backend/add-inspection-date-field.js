import mysql from 'mysql2/promise';

async function addInspectionDateField() {
  console.log('🔧 检查并添加inspection_date字段到online_tracking表...\n');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root', 
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    // 1. 检查表结构
    console.log('1. 检查online_tracking表结构...');
    const [columns] = await connection.execute('DESCRIBE online_tracking');
    console.log('当前字段:', columns.map(c => c.Field).join(', '));
    
    // 2. 检查是否已存在inspection_date字段
    const hasInspectionDate = columns.some(col => col.Field === 'inspection_date');
    
    if (hasInspectionDate) {
      console.log('✅ inspection_date字段已存在');
    } else {
      console.log('⚠️ inspection_date字段不存在，正在添加...');
      
      // 3. 添加inspection_date字段
      await connection.execute(`
        ALTER TABLE online_tracking 
        ADD COLUMN inspection_date DATETIME COMMENT '检验日期'
      `);
      
      console.log('✅ inspection_date字段已添加');
    }
    
    // 4. 验证字段是否添加成功
    const [newColumns] = await connection.execute('DESCRIBE online_tracking');
    const newHasInspectionDate = newColumns.some(col => col.Field === 'inspection_date');
    
    if (newHasInspectionDate) {
      console.log('✅ 验证成功：inspection_date字段存在');
      
      // 5. 检查现有数据中inspection_date字段的情况
      const [dataCheck] = await connection.execute(`
        SELECT 
          COUNT(*) as total_count,
          COUNT(inspection_date) as has_inspection_date,
          COUNT(*) - COUNT(inspection_date) as null_inspection_date
        FROM online_tracking
      `);
      
      console.log('📊 数据统计:', dataCheck[0]);
      
      if (dataCheck[0].null_inspection_date > 0) {
        console.log(`⚠️ 发现${dataCheck[0].null_inspection_date}条记录的inspection_date为空`);
        console.log('💡 建议重新生成数据以填充inspection_date字段');
      }
    } else {
      console.log('❌ 验证失败：inspection_date字段添加失败');
    }
    
    await connection.end();
    console.log('\n🎉 检查完成！');
    
  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    process.exit(1);
  }
}

// 运行脚本
addInspectionDateField();
