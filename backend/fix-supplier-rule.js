import mysql from 'mysql2/promise';

async function fixSupplierRule() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root', 
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('=== 修复"供应商库存查询_优化"规则 ===');
    
    // 修复后的SQL，添加供应商参数过滤
    const fixedSQL = `SELECT
  storage_location as 工厂,
  storage_location as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory
WHERE supplier_name = :supplier
ORDER BY inbound_time DESC`;
    
    // 更新规则
    const [result] = await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = ?
      WHERE intent_name = '供应商库存查询_优化'
    `, [fixedSQL]);
    
    console.log('✅ 规则更新成功，影响行数:', result.affectedRows);
    
    // 验证更新结果
    const [updatedRules] = await connection.execute(`
      SELECT action_target 
      FROM nlp_intent_rules 
      WHERE intent_name = '供应商库存查询_优化'
    `);
    
    if (updatedRules.length > 0) {
      console.log('\n📋 更新后的SQL:');
      console.log(updatedRules[0].action_target);
    }
    
    await connection.end();
  } catch (error) {
    console.error('修复失败:', error);
  }
}

fixSupplierRule();
