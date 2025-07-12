/**
 * 最终修复在线跟踪查询
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function finalFixTracking() {
  console.log('🔧 最终修复在线跟踪查询...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 修复在线跟踪查询规则
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET action_target = ?
      WHERE intent_name = '在线跟踪查询'
    `, [`SELECT 
      id as 跟踪编号,
      DATE_FORMAT(online_date, "%Y-%m-%d") as 日期,
      material_name as 物料名称,
      supplier_name as 供应商,
      CONCAT("异常数量: ", exception_count) as 不合格描述,
      notes as 备注
    FROM online_tracking 
    WHERE 1=1
    ORDER BY online_date DESC 
    LIMIT 20`]);
    
    // 测试查询
    const [testResults] = await connection.query(`
      SELECT 
        id as 跟踪编号,
        DATE_FORMAT(online_date, "%Y-%m-%d") as 日期,
        material_name as 物料名称,
        supplier_name as 供应商,
        CONCAT("异常数量: ", exception_count) as 不合格描述,
        notes as 备注
      FROM online_tracking 
      WHERE 1=1
      ORDER BY online_date DESC 
      LIMIT 20
    `);
    
    console.log(`✅ 在线跟踪查询修复成功: 返回 ${testResults.length} 条记录`);
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

// 执行修复
finalFixTracking();
