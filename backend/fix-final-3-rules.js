import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
});

/**
 * 修复最后3个复杂分析规则
 * 实现100%成功率
 */

async function fixFinal3Rules() {
  try {
    console.log('🎯 修复最后3个复杂分析规则...\n');
    
    // 1. 获取失败的规则
    const [allRules] = await connection.execute(`
      SELECT id, intent_name, action_target
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY intent_name
    `);
    
    const failedRules = [];
    for (const rule of allRules) {
      try {
        await connection.execute(rule.action_target);
      } catch (error) {
        failedRules.push({ ...rule, error: error.message });
      }
    }
    
    console.log(`❌ 剩余失败规则: ${failedRules.length}个`);
    failedRules.forEach((rule, index) => {
      console.log(`  ${index + 1}. ${rule.intent_name}`);
    });
    console.log('');
    
    // 2. 逐个修复
    let fixedCount = 0;
    
    for (let i = 0; i < failedRules.length; i++) {
      const rule = failedRules[i];
      console.log(`🔧 [${i + 1}/${failedRules.length}] 修复: ${rule.intent_name}`);
      
      let fixedSQL = null;
      
      if (rule.intent_name === '供应商对比分析') {
        fixedSQL = createSupplierComparisonQuery();
      } else if (rule.intent_name === '光学类供应商质量排行') {
        fixedSQL = createOpticalSupplierRankingQuery();
      } else if (rule.intent_name === '结构件类供应商质量排行') {
        fixedSQL = createStructuralSupplierRankingQuery();
      }
      
      if (fixedSQL) {
        try {
          // 测试修复后的SQL
          const [testResults] = await connection.execute(fixedSQL);
          
          // 更新数据库
          await connection.execute(`
            UPDATE nlp_intent_rules 
            SET action_target = ?
            WHERE id = ?
          `, [fixedSQL, rule.id]);
          
          console.log(`  ✅ 修复成功 - ${testResults.length}条记录`);
          console.log(`  📊 字段: ${Object.keys(testResults[0] || {}).join(', ')}`);
          fixedCount++;
          
        } catch (fixError) {
          console.log(`  ❌ 修复失败: ${fixError.message}`);
        }
      } else {
        console.log(`  ℹ️  无修复方案`);
      }
      
      console.log('');
    }
    
    // 3. 最终验证
    console.log('🧪 最终验证所有规则...');
    const finalResult = await validateAllRules();
    
    console.log('\n🎉 最终修复结果:');
    console.log(`总规则数: ${allRules.length}`);
    console.log(`本次修复: ${fixedCount}个`);
    console.log(`最终成功率: ${Math.round(finalResult.successRate)}%`);
    console.log(`成功规则: ${finalResult.success}个`);
    console.log(`失败规则: ${finalResult.failed}个`);
    
    if (finalResult.successRate === 100) {
      console.log('\n🏆 恭喜！已实现100%成功率！');
    }
    
    // 4. 展示修复的规则示例
    if (fixedCount > 0) {
      console.log('\n📄 修复规则示例:');
      await showFixedExamples();
    }
    
    console.log('\n🎉 最后3个规则修复完成！');
    
  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error);
  } finally {
    await connection.end();
  }
}

/**
 * 创建供应商对比分析查询
 */
function createSupplierComparisonQuery() {
  return `
    SELECT 
      supplier_name as 供应商,
      COUNT(*) as 测试总数,
      SUM(CASE WHEN test_result = 'NG' THEN 1 ELSE 0 END) as 不良数量,
      ROUND(SUM(CASE WHEN test_result = 'NG' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 不良率,
      GROUP_CONCAT(DISTINCT defect_desc ORDER BY defect_desc SEPARATOR ', ') as 缺陷描述,
      ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM lab_tests), 2) as 占比,
      MAX(test_date) as 最新测试日期
    FROM lab_tests 
    WHERE test_result IS NOT NULL
    GROUP BY supplier_name 
    HAVING COUNT(*) > 0
    ORDER BY 不良率 DESC, 测试总数 DESC
    LIMIT 20
  `.replace(/\s+/g, ' ').trim();
}

/**
 * 创建光学类供应商质量排行查询
 */
function createOpticalSupplierRankingQuery() {
  return `
    SELECT 
      supplier_name as 供应商,
      COUNT(*) as 测试总数,
      SUM(CASE WHEN test_result = 'NG' THEN 1 ELSE 0 END) as 不良数量,
      ROUND(SUM(CASE WHEN test_result = 'NG' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 不良率,
      GROUP_CONCAT(DISTINCT defect_desc ORDER BY defect_desc SEPARATOR ', ') as 缺陷描述,
      ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM lab_tests WHERE material_name LIKE '%显示屏%' OR material_name LIKE '%摄像头%'), 2) as 占比,
      MAX(test_date) as 最新测试日期
    FROM lab_tests 
    WHERE (material_name LIKE '%显示屏%' OR material_name LIKE '%摄像头%')
      AND test_result IS NOT NULL
    GROUP BY supplier_name 
    HAVING COUNT(*) > 0
    ORDER BY 不良率 ASC, 测试总数 DESC
    LIMIT 15
  `.replace(/\s+/g, ' ').trim();
}

/**
 * 创建结构件类供应商质量排行查询
 */
function createStructuralSupplierRankingQuery() {
  return `
    SELECT 
      supplier_name as 供应商,
      COUNT(*) as 测试总数,
      SUM(CASE WHEN test_result = 'NG' THEN 1 ELSE 0 END) as 不良数量,
      ROUND(SUM(CASE WHEN test_result = 'NG' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 不良率,
      GROUP_CONCAT(DISTINCT defect_desc ORDER BY defect_desc SEPARATOR ', ') as 缺陷描述,
      ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM lab_tests WHERE material_name LIKE '%盖%' OR material_name LIKE '%框%' OR material_name LIKE '%键%' OR material_name LIKE '%托%'), 2) as 占比,
      MAX(test_date) as 最新测试日期
    FROM lab_tests 
    WHERE (material_name LIKE '%盖%' OR material_name LIKE '%框%' OR material_name LIKE '%键%' OR material_name LIKE '%托%' OR material_name LIKE '%装饰%')
      AND test_result IS NOT NULL
    GROUP BY supplier_name 
    HAVING COUNT(*) > 0
    ORDER BY 不良率 ASC, 测试总数 DESC
    LIMIT 15
  `.replace(/\s+/g, ' ').trim();
}

/**
 * 验证所有规则
 */
async function validateAllRules() {
  const [allRules] = await connection.execute(`
    SELECT action_target
    FROM nlp_intent_rules 
    WHERE status = 'active'
  `);
  
  let successCount = 0;
  let failedCount = 0;
  
  for (const rule of allRules) {
    try {
      await connection.execute(rule.action_target);
      successCount++;
    } catch (error) {
      failedCount++;
    }
  }
  
  return {
    total: allRules.length,
    success: successCount,
    failed: failedCount,
    successRate: (successCount / allRules.length) * 100
  };
}

/**
 * 展示修复的规则示例
 */
async function showFixedExamples() {
  const ruleNames = ['供应商对比分析', '光学类供应商质量排行', '结构件类供应商质量排行'];
  
  for (const ruleName of ruleNames) {
    try {
      const [rule] = await connection.execute(`
        SELECT action_target
        FROM nlp_intent_rules 
        WHERE intent_name = ? AND status = 'active'
      `, [ruleName]);
      
      if (rule.length > 0) {
        const [results] = await connection.execute(rule[0].action_target);
        
        console.log(`\n📋 ${ruleName}:`);
        console.log(`  记录数: ${results.length}`);
        
        if (results.length > 0) {
          console.log(`  字段: ${Object.keys(results[0]).join(', ')}`);
          
          // 显示第一条记录作为示例
          const example = results[0];
          console.log(`  示例数据:`);
          Object.entries(example).slice(0, 4).forEach(([key, value]) => {
            console.log(`    ${key}: ${value}`);
          });
        }
      }
    } catch (error) {
      console.log(`\n❌ ${ruleName}: 仍有问题`);
    }
  }
}

// 执行修复
fixFinal3Rules();
