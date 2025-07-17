import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function quickFixRules() {
  console.log('🔧 快速修复规则...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 修复物料上线情况查询规则
    console.log('1. 修复物料上线情况查询规则...');
    const onlineSQL = `
SELECT 
  id as 跟踪编号,
  DATE_FORMAT(online_date, '%Y-%m-%d') as 日期,
  material_name as 物料名称,
  supplier_name as 供应商,
  COALESCE(defect_rate, 0) as 不良率,
  COALESCE(exception_count, 0) as 异常次数,
  COALESCE(notes, '') as 备注
FROM online_tracking 
WHERE 1=1
ORDER BY online_date DESC 
LIMIT 50`;

    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = ?
      WHERE intent_name = '物料上线情况查询'
    `, [onlineSQL.trim()]);
    
    console.log('   ✅ 修复物料上线情况查询');

    // 2. 修复所有包含 supplier 字段错误的规则
    console.log('2. 修复字段错误...');
    
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = REPLACE(action_target, 'supplier as 供应商', 'supplier_name as 供应商')
      WHERE action_target LIKE '%supplier as 供应商%'
    `);
    
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = REPLACE(action_target, ', supplier,', ', supplier_name,')
      WHERE action_target LIKE '%, supplier,%'
    `);
    
    console.log('   ✅ 修复字段名错误');

    // 3. 验证修复结果
    console.log('\n🧪 验证修复结果...');
    
    const [problemRules] = await connection.query(`
      SELECT id, intent_name
      FROM nlp_intent_rules 
      WHERE action_target LIKE '%supplier as 供应商%'
      AND status = 'active'
      LIMIT 5
    `);
    
    if (problemRules.length === 0) {
      console.log('✅ 字段错误已修复');
    } else {
      console.log(`⚠️ 仍有 ${problemRules.length} 条规则存在字段错误`);
    }
    
    await connection.end();
    console.log('\n🎉 快速修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  }
}

quickFixRules();
