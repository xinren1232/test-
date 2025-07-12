/**
 * 检查规则库状态脚本
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkRulesStatus() {
  console.log('🔍 检查规则库状态...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查表是否存在
    console.log('1. 检查表结构:');
    const [tables] = await connection.query(`
      SELECT TABLE_NAME, TABLE_COMMENT 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'iqe_inspection' 
      AND TABLE_NAME = 'nlp_intent_rules'
    `);
    
    if (tables.length === 0) {
      console.log('❌ nlp_intent_rules 表不存在！');
      await connection.end();
      return;
    }
    
    console.log('✅ nlp_intent_rules 表存在');
    
    // 2. 检查表结构
    console.log('\n2. 检查表字段:');
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = 'iqe_inspection' 
      AND TABLE_NAME = 'nlp_intent_rules'
      ORDER BY ORDINAL_POSITION
    `);
    
    columns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'NO' ? '(NOT NULL)' : ''} ${col.COLUMN_COMMENT ? `// ${col.COLUMN_COMMENT}` : ''}`);
    });
    
    // 3. 检查数据数量
    console.log('\n3. 检查数据数量:');
    const [countResult] = await connection.query('SELECT COUNT(*) as total FROM nlp_intent_rules');
    const totalRules = countResult[0].total;
    console.log(`📊 总规则数: ${totalRules}`);
    
    if (totalRules === 0) {
      console.log('❌ 规则表为空！');
      await connection.end();
      return;
    }
    
    // 4. 检查规则状态分布
    console.log('\n4. 检查规则状态分布:');
    const [statusResult] = await connection.query(`
      SELECT status, COUNT(*) as count 
      FROM nlp_intent_rules 
      GROUP BY status
    `);
    
    statusResult.forEach(row => {
      console.log(`  - ${row.status}: ${row.count} 条`);
    });
    
    // 5. 检查规则类型分布
    console.log('\n5. 检查规则类型分布:');
    const [typeResult] = await connection.query(`
      SELECT action_type, COUNT(*) as count 
      FROM nlp_intent_rules 
      GROUP BY action_type
    `);
    
    typeResult.forEach(row => {
      console.log(`  - ${row.action_type}: ${row.count} 条`);
    });
    
    // 6. 检查关键字段是否为空
    console.log('\n6. 检查关键字段完整性:');
    const [nullChecks] = await connection.query(`
      SELECT 
        SUM(CASE WHEN intent_name IS NULL OR intent_name = '' THEN 1 ELSE 0 END) as empty_intent_name,
        SUM(CASE WHEN action_target IS NULL OR action_target = '' THEN 1 ELSE 0 END) as empty_action_target,
        SUM(CASE WHEN trigger_words IS NULL THEN 1 ELSE 0 END) as null_trigger_words,
        SUM(CASE WHEN parameters IS NULL THEN 1 ELSE 0 END) as null_parameters
      FROM nlp_intent_rules
    `);
    
    const checks = nullChecks[0];
    console.log(`  - 空意图名称: ${checks.empty_intent_name} 条`);
    console.log(`  - 空动作目标: ${checks.empty_action_target} 条`);
    console.log(`  - 空触发词: ${checks.null_trigger_words} 条`);
    console.log(`  - 空参数: ${checks.null_parameters} 条`);
    
    // 7. 显示前5条规则示例
    console.log('\n7. 规则示例 (前5条):');
    const [sampleRules] = await connection.query(`
      SELECT id, intent_name, description, action_type, status, priority
      FROM nlp_intent_rules 
      ORDER BY priority DESC, id ASC
      LIMIT 5
    `);
    
    sampleRules.forEach((rule, index) => {
      console.log(`  ${index + 1}. [${rule.id}] ${rule.intent_name}`);
      console.log(`     描述: ${rule.description || '无'}`);
      console.log(`     类型: ${rule.action_type} | 状态: ${rule.status} | 优先级: ${rule.priority}`);
      console.log('');
    });
    
    // 8. 检查是否有SQL查询规则
    console.log('8. 检查SQL查询规则:');
    const [sqlRules] = await connection.query(`
      SELECT COUNT(*) as count 
      FROM nlp_intent_rules 
      WHERE action_type = 'SQL_QUERY' AND action_target LIKE '%SELECT%'
    `);
    
    console.log(`  - 包含SELECT的SQL规则: ${sqlRules[0].count} 条`);
    
    // 9. 检查触发词配置
    console.log('\n9. 检查触发词配置:');
    const [triggerWordsCheck] = await connection.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN JSON_LENGTH(trigger_words) > 0 THEN 1 ELSE 0 END) as with_triggers
      FROM nlp_intent_rules 
      WHERE trigger_words IS NOT NULL
    `);
    
    const triggerStats = triggerWordsCheck[0];
    console.log(`  - 有触发词配置的规则: ${triggerStats.with_triggers}/${triggerStats.total} 条`);
    
    await connection.end();
    
    // 总结
    console.log('\n📋 检查总结:');
    if (totalRules > 0) {
      console.log('✅ 规则表存在且有数据');
      if (checks.empty_action_target > 0) {
        console.log('⚠️  发现空的动作目标，可能影响规则执行');
      }
      if (triggerStats.with_triggers < triggerStats.total) {
        console.log('⚠️  部分规则缺少触发词配置');
      }
    } else {
      console.log('❌ 规则表为空，需要重新初始化');
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

// 执行检查
checkRulesStatus();
