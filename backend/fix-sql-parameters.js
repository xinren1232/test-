/**
 * 修复SQL参数问题
 */
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixSQLParameters() {
  console.log('🔧 修复SQL参数问题...');
  
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 连接到数据库成功！');
    
    // 修复库存查询SQL - 参数数量要匹配
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET action_target = ?
      WHERE intent_name = '查询库存,库存查询,查库存,库存情况'
    `, [`SELECT 
          material_code as 物料编码,
          material_name as 物料名称,
          batch_code as 批次号,
          supplier_name as 供应商,
          quantity as 数量,
          storage_location as 存储位置,
          status as 状态,
          risk_level as 风险等级,
          DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
          inspector as 检验员
        FROM inventory 
        WHERE material_code LIKE CONCAT('%', ?, '%') OR material_name LIKE CONCAT('%', ?, '%')
        ORDER BY created_at DESC LIMIT 10`]);
    
    console.log('✅ 修复库存查询SQL');
    
    // 修复测试结果查询SQL - 参数数量要匹配
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET action_target = ?
      WHERE intent_name = '测试结果,检测结果,实验结果,测试报告'
    `, [`SELECT 
          batch_code as 批次号,
          material_code as 物料编码,
          material_name as 物料名称,
          supplier_name as 供应商,
          test_item as 测试项目,
          test_result as 测试结果,
          conclusion as 结论,
          defect_desc as 缺陷描述,
          DATE_FORMAT(test_date, '%Y-%m-%d') as 测试日期,
          tester as 测试员,
          reviewer as 审核员
        FROM lab_tests 
        WHERE batch_code LIKE CONCAT('%', ?, '%') OR material_code LIKE CONCAT('%', ?, '%')
        ORDER BY test_date DESC LIMIT 10`]);
    
    console.log('✅ 修复测试结果查询SQL');
    
    console.log('🎉 SQL参数修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixSQLParameters().catch(console.error);
