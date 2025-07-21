import mysql from 'mysql2/promise';

async function checkAllRules() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });

  try {
    console.log('🔍 检查所有NLP规则的字段映射问题...\n');
    
    const [rules] = await connection.execute(`
      SELECT id, intent_name, action_target 
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY intent_name
    `);
    
    console.log(`找到 ${rules.length} 条活跃规则:\n`);
    
    let problemRules = [];
    
    rules.forEach((rule, index) => {
      console.log(`${index + 1}. ${rule.intent_name}`);
      
      const target = rule.action_target;
      let hasProblems = false;
      let problems = [];
      
      // 检查项目字段映射
      if (target.includes('material_code as 项目')) {
        problems.push('❌ 使用 material_code 作为项目字段 (应该用 project_id)');
        hasProblems = true;
      } else if (target.includes('project_id as 项目')) {
        console.log('   ✅ 项目字段映射正确 (project_id)');
      }
      
      // 检查基线字段映射
      if (target.includes('batch_code as 基线')) {
        problems.push('❌ 使用 batch_code 作为基线字段 (应该用 baseline_id)');
        hasProblems = true;
      } else if (target.includes('baseline_id as 基线')) {
        console.log('   ✅ 基线字段映射正确 (baseline_id)');
      }
      
      // 检查其他可能的问题字段
      if (target.includes('risk_level')) {
        problems.push('❌ 使用了不存在的 risk_level 字段');
        hasProblems = true;
      }
      
      if (target.includes('factory') && !target.includes('storage_location')) {
        problems.push('❌ 使用了不存在的 factory 字段 (应该用 storage_location)');
        hasProblems = true;
      }
      
      if (hasProblems) {
        problemRules.push({
          id: rule.id,
          name: rule.intent_name,
          problems: problems
        });
        problems.forEach(problem => console.log(`   ${problem}`));
      }
      
      console.log('');
    });
    
    console.log(`\n📊 总结:`);
    console.log(`总规则数: ${rules.length}`);
    console.log(`有问题的规则数: ${problemRules.length}`);
    
    if (problemRules.length > 0) {
      console.log(`\n🚨 需要修复的规则:`);
      problemRules.forEach((rule, i) => {
        console.log(`${i + 1}. ${rule.name} (ID: ${rule.id})`);
        rule.problems.forEach(problem => console.log(`   ${problem}`));
      });
    } else {
      console.log(`\n✅ 所有规则的字段映射都正确!`);
    }

  } finally {
    await connection.end();
  }
}

checkAllRules().catch(console.error);
