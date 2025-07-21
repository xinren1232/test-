import mysql from 'mysql2/promise';

async function fixAllProjectBaselineFields() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });

  try {
    console.log('🔧 修复所有规则的项目和基线字段映射...\n');
    
    // 获取所有需要修复的规则
    const [rules] = await connection.execute(`
      SELECT id, intent_name, action_target
      FROM nlp_intent_rules
      WHERE status = 'active'
      AND (
        action_target LIKE '%material_code as 项目%'
        OR action_target LIKE '%batch_code as 基线%'
        OR (action_target LIKE '%COALESCE(material_code%' AND action_target LIKE '%as 项目%')
        OR (action_target LIKE '%COALESCE(batch_code%' AND action_target LIKE '%as 基线%')
      )
      ORDER BY intent_name
    `);
    
    console.log(`找到 ${rules.length} 条需要修复的规则:\n`);
    
    for (const rule of rules) {
      console.log(`修复规则: ${rule.intent_name}`);
      
      let updatedTarget = rule.action_target;
      let changes = [];
      
      // 修复项目字段映射
      if (updatedTarget.includes('material_code as 项目')) {
        updatedTarget = updatedTarget.replace(/material_code as 项目/g, 'project_id as 项目');
        changes.push('项目字段: material_code → project_id');
      }
      
      // 修复COALESCE项目字段映射 - 处理不同的引号格式
      if (updatedTarget.includes('COALESCE(material_code,') && updatedTarget.includes('as 项目')) {
        updatedTarget = updatedTarget.replace(/COALESCE\(material_code,\s*'[^']*'\)\s*as 项目/g, 'COALESCE(project_id, \'未知项目\') as 项目');
        changes.push('项目字段: COALESCE(material_code) → COALESCE(project_id)');
      }

      // 修复基线字段映射
      if (updatedTarget.includes('batch_code as 基线')) {
        updatedTarget = updatedTarget.replace(/batch_code as 基线/g, 'baseline_id as 基线');
        changes.push('基线字段: batch_code → baseline_id');
      }

      // 修复COALESCE基线字段映射 - 处理不同的引号格式
      if (updatedTarget.includes('COALESCE(batch_code,') && updatedTarget.includes('as 基线')) {
        updatedTarget = updatedTarget.replace(/COALESCE\(batch_code,\s*'[^']*'\)\s*as 基线/g, 'COALESCE(baseline_id, \'未知基线\') as 基线');
        changes.push('基线字段: COALESCE(batch_code) → COALESCE(baseline_id)');
      }
      
      if (changes.length > 0) {
        // 更新数据库中的规则
        await connection.execute(
          'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE id = ?',
          [updatedTarget, rule.id]
        );
        
        console.log(`  ✅ 已修复: ${changes.join(', ')}`);
      } else {
        console.log(`  ℹ️  无需修复`);
      }
      
      console.log('');
    }
    
    console.log('🔍 验证修复结果...\n');
    
    // 验证修复结果
    const [verifyRules] = await connection.execute(`
      SELECT intent_name, action_target
      FROM nlp_intent_rules
      WHERE status = 'active'
      AND (
        action_target LIKE '%material_code as 项目%'
        OR action_target LIKE '%batch_code as 基线%'
        OR (action_target LIKE '%COALESCE(material_code%' AND action_target LIKE '%as 项目%')
        OR (action_target LIKE '%COALESCE(batch_code%' AND action_target LIKE '%as 基线%')
      )
    `);
    
    if (verifyRules.length === 0) {
      console.log('✅ 所有规则的项目和基线字段映射已修复完成！');
    } else {
      console.log(`⚠️  仍有 ${verifyRules.length} 条规则需要手动检查:`);
      verifyRules.forEach(rule => {
        console.log(`  - ${rule.intent_name}`);
      });
    }
    
    console.log('\n📊 修复总结:');
    console.log(`检查的规则数: ${rules.length}`);
    console.log(`修复的规则数: ${rules.filter(rule => 
      rule.action_target.includes('material_code as 项目') || 
      rule.action_target.includes('batch_code as 基线') ||
      rule.action_target.includes('COALESCE(material_code') ||
      rule.action_target.includes('COALESCE(batch_code')
    ).length}`);

  } finally {
    await connection.end();
  }
}

fixAllProjectBaselineFields().catch(console.error);
