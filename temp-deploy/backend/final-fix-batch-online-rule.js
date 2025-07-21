import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function finalFixBatchOnlineRule() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 最终修复批次上线情况查询规则...\n');
    
    // 检查online_tracking表的实际字段
    const [fields] = await connection.execute('DESCRIBE online_tracking');
    console.log('online_tracking表实际字段:');
    fields.forEach(field => {
      console.log(`- ${field.Field} (${field.Type})`);
    });
    
    // 修复批次上线情况查询规则 - 移除不存在的baseline_id字段
    const correctSQL = `
SELECT
  factory as 工厂,
  project as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  batch_code as 批次号,
  COALESCE(defect_rate, 0) as 不良率,
  COALESCE(exception_count, 0) as 本周异常,
  DATE_FORMAT(online_date, '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking
WHERE batch_code LIKE CONCAT('%', ?, '%')
ORDER BY online_date DESC
LIMIT 20`.trim();
    
    await connection.execute(
      'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
      [correctSQL, '批次上线情况查询']
    );
    console.log('\n✅ 已修复批次上线情况查询规则');
    
    // 修复批次上线情况查询_优化规则
    const optimizedSQL = `
SELECT
  factory as 工厂,
  project as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  batch_code as 批次号,
  COALESCE(defect_rate, 0) as 不良率,
  COALESCE(exception_count, 0) as 本周异常,
  DATE_FORMAT(online_date, '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking
ORDER BY online_date DESC
LIMIT 20`.trim();
    
    await connection.execute(
      'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
      [optimizedSQL, '批次上线情况查询_优化']
    );
    console.log('✅ 已修复批次上线情况查询_优化规则');
    
    // 修复其他上线相关规则
    const onlineRules = [
      '在线跟踪查询',
      '物料上线情况查询',
      '供应商上线情况查询',
      '物料上线跟踪查询_优化'
    ];
    
    for (const ruleName of onlineRules) {
      await connection.execute(
        'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
        [optimizedSQL, ruleName]
      );
      console.log(`✅ 已修复规则: ${ruleName}`);
    }
    
    // 验证修复结果
    console.log('\n=== 验证修复结果 ===');
    const [updatedRule] = await connection.execute(`
      SELECT action_target 
      FROM nlp_intent_rules 
      WHERE intent_name = '批次上线情况查询'
    `);
    
    if (updatedRule.length > 0) {
      console.log('修复后的SQL:');
      console.log(updatedRule[0].action_target);
      
      // 测试SQL是否能正常执行
      try {
        const [testResult] = await connection.execute(
          updatedRule[0].action_target.replace('?', "'TEST123'")
        );
        console.log(`\n✅ SQL测试成功，返回 ${testResult.length} 条记录`);
      } catch (testError) {
        console.log(`\n❌ SQL测试失败: ${testError.message}`);
      }
    }
    
    console.log('\n✅ 批次上线情况查询规则修复完成！');
    
  } catch (error) {
    console.error('❌ 修复过程中出错:', error);
  } finally {
    await connection.end();
  }
}

finalFixBatchOnlineRule();
