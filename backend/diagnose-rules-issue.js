/**
 * 诊断规则丢失问题
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function diagnoseRulesIssue() {
  console.log('🔍 诊断规则配置丢失问题...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查规则总数
    console.log('1. 检查规则总数:');
    const [countResult] = await connection.query('SELECT COUNT(*) as total FROM nlp_intent_rules');
    console.log(`   总规则数: ${countResult[0].total}`);
    
    // 2. 检查action_target字段状态
    console.log('\n2. 检查action_target字段状态:');
    const [actionTargetCheck] = await connection.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN action_target IS NULL THEN 1 ELSE 0 END) as null_count,
        SUM(CASE WHEN action_target = '' THEN 1 ELSE 0 END) as empty_count,
        SUM(CASE WHEN action_target IS NOT NULL AND action_target != '' THEN 1 ELSE 0 END) as valid_count
      FROM nlp_intent_rules
    `);
    
    const stats = actionTargetCheck[0];
    console.log(`   - 总数: ${stats.total}`);
    console.log(`   - NULL: ${stats.null_count}`);
    console.log(`   - 空字符串: ${stats.empty_count}`);
    console.log(`   - 有效配置: ${stats.valid_count}`);
    
    // 3. 显示有问题的规则
    console.log('\n3. 显示action_target为空的规则:');
    const [emptyRules] = await connection.query(`
      SELECT id, intent_name, description, action_type, status, created_at
      FROM nlp_intent_rules 
      WHERE action_target IS NULL OR action_target = ''
      ORDER BY id
      LIMIT 10
    `);
    
    if (emptyRules.length > 0) {
      console.log('   ❌ 发现以下规则缺少action_target配置:');
      emptyRules.forEach((rule, index) => {
        console.log(`   ${index + 1}. [${rule.id}] ${rule.intent_name}`);
        console.log(`      描述: ${rule.description || '无'}`);
        console.log(`      类型: ${rule.action_type} | 状态: ${rule.status}`);
        console.log(`      创建时间: ${rule.created_at}`);
        console.log('');
      });
    } else {
      console.log('   ✅ 所有规则都有action_target配置');
    }
    
    // 4. 显示有效的规则示例
    console.log('4. 显示有效规则示例:');
    const [validRules] = await connection.query(`
      SELECT id, intent_name, description, action_type, 
             LEFT(action_target, 100) as action_preview
      FROM nlp_intent_rules 
      WHERE action_target IS NOT NULL AND action_target != ''
      ORDER BY id
      LIMIT 3
    `);
    
    if (validRules.length > 0) {
      console.log('   ✅ 有效规则示例:');
      validRules.forEach((rule, index) => {
        console.log(`   ${index + 1}. [${rule.id}] ${rule.intent_name}`);
        console.log(`      类型: ${rule.action_type}`);
        console.log(`      SQL预览: ${rule.action_preview}...`);
        console.log('');
      });
    } else {
      console.log('   ❌ 没有找到有效的规则配置');
    }
    
    // 5. 检查最近的修改时间
    console.log('5. 检查最近的修改时间:');
    const [recentChanges] = await connection.query(`
      SELECT 
        DATE(updated_at) as update_date,
        COUNT(*) as count
      FROM nlp_intent_rules 
      WHERE updated_at IS NOT NULL
      GROUP BY DATE(updated_at)
      ORDER BY update_date DESC
      LIMIT 5
    `);
    
    if (recentChanges.length > 0) {
      console.log('   最近修改记录:');
      recentChanges.forEach(change => {
        console.log(`   - ${change.update_date}: ${change.count} 条规则被修改`);
      });
    } else {
      console.log('   没有找到修改记录');
    }
    
    // 6. 检查trigger_words和parameters配置
    console.log('\n6. 检查其他关键字段:');
    const [otherFields] = await connection.query(`
      SELECT 
        SUM(CASE WHEN trigger_words IS NULL THEN 1 ELSE 0 END) as null_trigger_words,
        SUM(CASE WHEN parameters IS NULL THEN 1 ELSE 0 END) as null_parameters,
        SUM(CASE WHEN example_query IS NULL OR example_query = '' THEN 1 ELSE 0 END) as empty_examples
      FROM nlp_intent_rules
    `);
    
    const fieldStats = otherFields[0];
    console.log(`   - 缺少trigger_words: ${fieldStats.null_trigger_words}`);
    console.log(`   - 缺少parameters: ${fieldStats.null_parameters}`);
    console.log(`   - 缺少example_query: ${fieldStats.empty_examples}`);
    
    await connection.end();
    
    // 7. 问题总结和建议
    console.log('\n📋 问题诊断总结:');
    
    if (stats.valid_count === 0) {
      console.log('❌ 严重问题: 所有规则的action_target都为空！');
      console.log('💡 建议: 需要重新导入完整的规则配置');
    } else if (stats.valid_count < stats.total) {
      console.log(`⚠️  部分问题: ${stats.total - stats.valid_count} 条规则缺少action_target配置`);
      console.log('💡 建议: 需要修复缺失的规则配置');
    } else {
      console.log('✅ action_target配置正常');
      console.log('💡 可能是前端显示问题，需要检查前端代码');
    }
    
  } catch (error) {
    console.error('❌ 诊断失败:', error.message);
  }
}

// 执行诊断
diagnoseRulesIssue();
