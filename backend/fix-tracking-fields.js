/**
 * 修复在线跟踪查询的字段问题
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixTrackingFields() {
  console.log('🔧 修复在线跟踪查询字段问题...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查online_tracking表的实际字段
    console.log('1. 检查online_tracking表字段:');
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = 'iqe_inspection' 
      AND TABLE_NAME = 'online_tracking'
      ORDER BY ORDINAL_POSITION
    `);
    
    const fieldNames = columns.map(col => col.COLUMN_NAME);
    console.log(`   实际字段: ${fieldNames.join(', ')}`);
    
    // 2. 修复在线跟踪查询规则
    console.log('\n2. 修复在线跟踪查询规则...');
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT 
        id as 跟踪编号,
        DATE_FORMAT(date, "%Y-%m-%d") as 日期,
        material_name as 物料名称,
        supplier as 供应商,
        defect_description as 不合格描述,
        notes as 备注
      FROM online_tracking 
      WHERE 1=1
      ORDER BY date DESC 
      LIMIT 20'
      WHERE intent_name = '在线跟踪查询'
    `);
    
    // 3. 测试修复后的查询
    console.log('\n3. 测试修复后的查询...');
    try {
      const [testResults] = await connection.query(`
        SELECT 
          id as 跟踪编号,
          DATE_FORMAT(date, "%Y-%m-%d") as 日期,
          material_name as 物料名称,
          supplier as 供应商,
          defect_description as 不合格描述,
          notes as 备注
        FROM online_tracking 
        WHERE 1=1
        ORDER BY date DESC 
        LIMIT 20
      `);
      
      console.log(`  ✅ 在线跟踪查询: 返回 ${testResults.length} 条记录`);
      if (testResults.length > 0) {
        console.log(`  示例数据: ${JSON.stringify(testResults[0])}`);
      }
    } catch (error) {
      console.log(`  ❌ 在线跟踪查询测试失败: ${error.message}`);
    }
    
    await connection.end();
    
    console.log('\n🎉 在线跟踪字段修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

// 执行修复
fixTrackingFields();
