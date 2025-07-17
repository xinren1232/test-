/**
 * 诊断规则库页面的问题
 * 检查API连接、数据格式、前后端一致性等问题
 */

import mysql from 'mysql2/promise';
import fetch from 'node-fetch';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function diagnoseRuleLibraryIssues() {
  console.log('🔍 开始诊断规则库页面问题...\n');
  
  let connection;
  
  try {
    // 1. 检查数据库连接和规则数据
    console.log('=== 第一步：检查数据库规则数据 ===');
    connection = await mysql.createConnection(dbConfig);
    
    const [rules] = await connection.execute(`
      SELECT 
        COUNT(*) as total_rules,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_rules,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_rules,
        COUNT(CASE WHEN example_query IS NOT NULL AND example_query != '' THEN 1 END) as rules_with_examples,
        COUNT(CASE WHEN action_target IS NOT NULL AND action_target != '' THEN 1 END) as rules_with_sql
      FROM nlp_intent_rules
    `);
    
    console.log('📊 数据库规则统计:');
    console.log(`   总规则数: ${rules[0].total_rules}`);
    console.log(`   活跃规则: ${rules[0].active_rules}`);
    console.log(`   非活跃规则: ${rules[0].inactive_rules}`);
    console.log(`   有示例的规则: ${rules[0].rules_with_examples}`);
    console.log(`   有SQL的规则: ${rules[0].rules_with_sql}`);
    
    // 2. 检查规则字段完整性
    console.log('\n=== 第二步：检查规则字段完整性 ===');
    const [incompleteRules] = await connection.execute(`
      SELECT 
        id,
        intent_name,
        CASE 
          WHEN description IS NULL OR description = '' THEN '缺少描述'
          WHEN action_target IS NULL OR action_target = '' THEN '缺少SQL'
          WHEN example_query IS NULL OR example_query = '' THEN '缺少示例'
          WHEN priority IS NULL THEN '缺少优先级'
          ELSE '完整'
        END as issue
      FROM nlp_intent_rules
      WHERE description IS NULL OR description = '' 
         OR action_target IS NULL OR action_target = ''
         OR example_query IS NULL OR example_query = ''
         OR priority IS NULL
      LIMIT 10
    `);
    
    if (incompleteRules.length > 0) {
      console.log('⚠️ 发现不完整的规则:');
      incompleteRules.forEach(rule => {
        console.log(`   ${rule.intent_name}: ${rule.issue}`);
      });
    } else {
      console.log('✅ 所有规则字段完整');
    }
    
    // 3. 测试API端点
    console.log('\n=== 第三步：测试API端点 ===');
    
    const apiTests = [
      { name: '获取所有规则', url: 'http://localhost:3001/api/rules' },
      { name: '获取规则分类', url: 'http://localhost:3001/api/rules/categories' },
      { name: '获取数据状态', url: 'http://localhost:3001/api/data/status' }
    ];
    
    for (const test of apiTests) {
      try {
        console.log(`🧪 测试: ${test.name}`);
        const response = await fetch(test.url);
        const data = await response.json();
        
        if (response.ok && data.success) {
          console.log(`   ✅ 成功 - 返回${Array.isArray(data.data) ? data.data.length : '1'}条数据`);
        } else {
          console.log(`   ❌ 失败 - ${data.message || '未知错误'}`);
        }
      } catch (error) {
        console.log(`   ❌ 网络错误 - ${error.message}`);
      }
    }
    
    // 4. 检查规则SQL语法
    console.log('\n=== 第四步：检查规则SQL语法 ===');
    
    const [sqlRules] = await connection.execute(`
      SELECT id, intent_name, action_target
      FROM nlp_intent_rules 
      WHERE status = 'active' 
        AND action_target IS NOT NULL 
        AND action_target != ''
      LIMIT 10
    `);
    
    let validSqlCount = 0;
    let invalidSqlCount = 0;
    
    for (const rule of sqlRules) {
      try {
        // 尝试解析SQL（不执行）
        let sql = rule.action_target;
        
        // 替换参数占位符进行语法检查
        sql = sql.replace(/\?/g, "'test'");
        
        // 添加LIMIT避免大量数据
        if (!sql.toLowerCase().includes('limit')) {
          sql += ' LIMIT 1';
        }
        
        await connection.execute(`EXPLAIN ${sql}`);
        validSqlCount++;
        console.log(`   ✅ ${rule.intent_name}: SQL语法正确`);
        
      } catch (error) {
        invalidSqlCount++;
        console.log(`   ❌ ${rule.intent_name}: SQL语法错误 - ${error.message.substring(0, 50)}...`);
      }
    }
    
    console.log(`\n📊 SQL检查结果: ${validSqlCount}个正确，${invalidSqlCount}个错误`);
    
    // 5. 检查前端页面可能的问题
    console.log('\n=== 第五步：检查前端页面问题 ===');
    
    const frontendIssues = [];
    
    // 检查是否有重复的规则名称
    const [duplicateNames] = await connection.execute(`
      SELECT intent_name, COUNT(*) as count
      FROM nlp_intent_rules
      GROUP BY intent_name
      HAVING COUNT(*) > 1
    `);
    
    if (duplicateNames.length > 0) {
      frontendIssues.push(`发现${duplicateNames.length}个重复的规则名称`);
      duplicateNames.forEach(dup => {
        console.log(`   ⚠️ 重复规则名: ${dup.intent_name} (${dup.count}次)`);
      });
    }
    
    // 检查是否有空的分类
    const [emptyCategories] = await connection.execute(`
      SELECT category, COUNT(*) as count
      FROM nlp_intent_rules
      WHERE category IS NULL OR category = ''
      GROUP BY category
    `);
    
    if (emptyCategories.length > 0) {
      frontendIssues.push(`发现${emptyCategories[0].count}个规则没有分类`);
    }
    
    // 检查优先级分布
    const [priorityDistribution] = await connection.execute(`
      SELECT priority, COUNT(*) as count
      FROM nlp_intent_rules
      GROUP BY priority
      ORDER BY priority
    `);
    
    console.log('📊 优先级分布:');
    priorityDistribution.forEach(p => {
      console.log(`   优先级 ${p.priority}: ${p.count}个规则`);
    });
    
    // 6. 生成诊断报告
    console.log('\n=== 诊断报告 ===');
    
    const totalRules = rules[0].total_rules;
    const activeRules = rules[0].active_rules;
    const rulesWithExamples = rules[0].rules_with_examples;
    
    console.log('📋 总体状态:');
    console.log(`   规则总数: ${totalRules}`);
    console.log(`   活跃规则: ${activeRules} (${((activeRules/totalRules)*100).toFixed(1)}%)`);
    console.log(`   完整规则: ${rulesWithExamples} (${((rulesWithExamples/totalRules)*100).toFixed(1)}%)`);
    
    console.log('\n🔍 发现的问题:');
    if (frontendIssues.length === 0) {
      console.log('   ✅ 未发现明显问题');
    } else {
      frontendIssues.forEach(issue => {
        console.log(`   ⚠️ ${issue}`);
      });
    }
    
    console.log('\n💡 建议修复措施:');
    if (incompleteRules.length > 0) {
      console.log('   1. 补充缺失的规则字段（描述、示例、SQL等）');
    }
    if (invalidSqlCount > 0) {
      console.log('   2. 修复SQL语法错误的规则');
    }
    if (duplicateNames.length > 0) {
      console.log('   3. 处理重复的规则名称');
    }
    if (emptyCategories.length > 0) {
      console.log('   4. 为未分类的规则添加分类');
    }
    
    console.log('\n🎯 规则库页面应该能正常显示134条规则');
    
  } catch (error) {
    console.error('❌ 诊断过程出错:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行诊断
diagnoseRuleLibraryIssues().catch(console.error);
