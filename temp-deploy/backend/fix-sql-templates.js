import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixSqlTemplates() {
  try {
    console.log('🔧 修复数据库中的SQL模板...');
    const connection = await mysql.createConnection(dbConfig);
    
    // 查找包含错误语法的SQL模板
    const [rules] = await connection.execute(`
      SELECT id, intent_name, action_target
      FROM nlp_intent_rules
      WHERE action_target LIKE '%! =%' OR action_target LIKE '%< =%' OR action_target LIKE '%> =%'
    `);
    
    console.log(`📋 找到 ${rules.length} 条需要修复的规则:`);
    
    for (const rule of rules) {
      console.log(`\n🔍 修复规则: ${rule.intent_name}`);
      console.log('原SQL模板:');
      console.log(rule.action_target.substring(0, 200) + '...');

      // 修复SQL语法
      let fixedSql = rule.action_target
        .replace(/\s*!\s*=\s*/g, ' != ')
        .replace(/\s*<\s*=\s*/g, ' <= ')
        .replace(/\s*>\s*=\s*/g, ' >= ')
        .replace(/\s*<\s*>\s*/g, ' <> ');

      // 更新数据库
      await connection.execute(
        'UPDATE nlp_intent_rules SET action_target = ? WHERE id = ?',
        [fixedSql, rule.id]
      );

      console.log('✅ 修复完成');
    }
    
    // 特别检查"供应商对比分析"规则
    const [supplierRule] = await connection.execute(
      'SELECT id, action_target FROM nlp_intent_rules WHERE intent_name = ?',
      ['供应商对比分析']
    );

    if (supplierRule.length > 0) {
      console.log('\n🔍 检查供应商对比分析规则:');
      console.log('当前SQL模板:');
      console.log(supplierRule[0].action_target);

      // 如果仍然有问题，手动修复
      if (supplierRule[0].action_target.includes('! =')) {
        const fixedSql = supplierRule[0].action_target.replace(/\s*!\s*=\s*/g, ' != ');
        await connection.execute(
          'UPDATE nlp_intent_rules SET action_target = ? WHERE id = ?',
          [fixedSql, supplierRule[0].id]
        );
        console.log('✅ 手动修复供应商对比分析规则');
      }
    }
    
    await connection.end();
    console.log('\n✅ SQL模板修复完成');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

fixSqlTemplates();
