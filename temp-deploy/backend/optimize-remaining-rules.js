import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
});

/**
 * 优化剩余的"other"场景规则
 * 处理综合查询、统计分析、对比排行等规则
 */

async function optimizeRemainingRules() {
  try {
    console.log('🚀 开始优化剩余的other场景规则...\n');
    
    // 1. 获取所有other场景规则
    const [allRules] = await connection.execute(`
      SELECT id, intent_name, action_target, category
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY intent_name
    `);
    
    const otherRules = classifyOtherRules(allRules);
    
    console.log('📊 剩余规则分类:');
    Object.entries(otherRules).forEach(([type, rules]) => {
      console.log(`  - ${type}: ${rules.length}个规则`);
    });
    console.log('');
    
    // 2. 逐类型优化
    let totalOptimized = 0;
    let totalTested = 0;
    
    for (const [type, rules] of Object.entries(otherRules)) {
      if (rules.length === 0) continue;
      
      console.log(`🔧 优化${type}规则 (${rules.length}个)...`);
      const result = await optimizeRulesByType(type, rules);
      totalOptimized += result.optimized;
      totalTested += result.tested;
      console.log(`  ✅ 优化: ${result.optimized}个, 测试通过: ${result.tested}个\n`);
    }
    
    // 3. 最终验证
    console.log('🧪 最终验证所有规则...');
    const finalResult = await validateAllRules();
    
    console.log('\n📊 最终优化结果:');
    console.log(`总规则数: ${allRules.length}`);
    console.log(`本次优化: ${totalOptimized}个`);
    console.log(`本次测试通过: ${totalTested}个`);
    console.log(`最终成功率: ${Math.round(finalResult.successRate)}%`);
    
    // 4. 生成详细报告
    console.log('\n📄 详细成功规则示例:');
    await showSuccessfulRuleExamples();
    
    console.log('\n🎉 剩余规则优化完成！');
    
  } catch (error) {
    console.error('❌ 优化过程中发生错误:', error);
  } finally {
    await connection.end();
  }
}

/**
 * 分类other规则
 */
function classifyOtherRules(allRules) {
  const otherTypes = {
    comparison: [],    // 对比分析规则
    statistics: [],    // 统计汇总规则
    ranking: [],       // 排行榜规则
    comprehensive: [], // 综合查询规则
    unknown: []        // 未知类型规则
  };
  
  allRules.forEach(rule => {
    const name = rule.intent_name.toLowerCase();
    const sql = rule.action_target.toLowerCase();
    
    // 跳过已经分类的规则
    if ((name.includes('库存') && sql.includes('inventory')) ||
        (name.includes('上线') && sql.includes('online_tracking')) ||
        (name.includes('测试') && sql.includes('lab_tests')) ||
        name.includes('批次')) {
      return;
    }
    
    // 分类other规则
    if (name.includes('对比') || name.includes('比较') || name.includes('vs')) {
      otherTypes.comparison.push(rule);
    } else if (name.includes('top') || name.includes('排行') || name.includes('排名')) {
      otherTypes.ranking.push(rule);
    } else if (name.includes('统计') || name.includes('汇总') || name.includes('总计') || name.includes('count')) {
      otherTypes.statistics.push(rule);
    } else if (name.includes('综合') || name.includes('全面') || name.includes('整体')) {
      otherTypes.comprehensive.push(rule);
    } else {
      otherTypes.unknown.push(rule);
    }
  });
  
  return otherTypes;
}

/**
 * 按类型优化规则
 */
async function optimizeRulesByType(type, rules) {
  let optimized = 0;
  let tested = 0;
  
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    console.log(`  [${i + 1}/${rules.length}] ${rule.intent_name}`);
    
    try {
      // 测试原始SQL
      const [originalResults] = await connection.execute(rule.action_target);
      console.log(`    ✅ 正常 - ${originalResults.length}条记录`);
      tested++;
      
    } catch (error) {
      // 尝试修复SQL
      const fixedSQL = fixRuleSQL(rule.action_target, type);
      
      if (fixedSQL !== rule.action_target) {
        try {
          const [testResults] = await connection.execute(fixedSQL);
          await updateRuleSQL(rule.id, fixedSQL);
          console.log(`    🔧 修复成功 - ${testResults.length}条记录`);
          optimized++;
        } catch (fixError) {
          console.log(`    ❌ 修复失败: ${fixError.message.substring(0, 50)}...`);
        }
      } else {
        console.log(`    ❌ 无法修复: ${error.message.substring(0, 50)}...`);
      }
    }
  }
  
  return { optimized, tested };
}

/**
 * 修复规则SQL
 */
function fixRuleSQL(originalSQL, type) {
  let fixedSQL = originalSQL;
  
  // 通用字段修复
  fixedSQL = fixedSQL
    // 修复inventory表字段
    .replace(/\bfactory\b/g, 'storage_location')
    .replace(/\bwarehouse\b/g, 'storage_location')
    // 修复lab_tests表字段
    .replace(/\bproject\b/g, 'project_id')
    .replace(/\bbaseline\b/g, 'baseline_id')
    .replace(/\bsupplier\b/g, 'supplier_name')
    // 清理多余空格
    .replace(/\s+/g, ' ')
    .trim();
  
  // 根据类型进行特定修复
  switch (type) {
    case 'comparison':
      // 对比分析规则通常需要GROUP BY和聚合函数
      if (!fixedSQL.includes('GROUP BY') && fixedSQL.includes('COUNT')) {
        // 添加基本的GROUP BY
        if (fixedSQL.includes('supplier_name')) {
          fixedSQL = fixedSQL.replace(/ORDER BY/i, 'GROUP BY supplier_name ORDER BY');
        }
      }
      break;
      
    case 'ranking':
      // 排行榜规则通常需要ORDER BY和LIMIT
      if (!fixedSQL.includes('ORDER BY')) {
        if (fixedSQL.includes('COUNT')) {
          fixedSQL = fixedSQL.replace(/LIMIT/i, 'ORDER BY COUNT(*) DESC LIMIT');
        }
      }
      break;
      
    case 'statistics':
      // 统计规则通常需要聚合函数
      if (fixedSQL.includes('SELECT *')) {
        // 将SELECT *替换为具体字段
        fixedSQL = fixedSQL.replace('SELECT *', 'SELECT COUNT(*) as 总数');
      }
      break;
      
    case 'comprehensive':
      // 综合查询规则可能需要JOIN
      break;
  }
  
  return fixedSQL;
}

/**
 * 更新规则SQL
 */
async function updateRuleSQL(ruleId, newSQL) {
  await connection.execute(`
    UPDATE nlp_intent_rules 
    SET action_target = ?
    WHERE id = ?
  `, [newSQL, ruleId]);
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
  
  for (const rule of allRules) {
    try {
      await connection.execute(rule.action_target);
      successCount++;
    } catch (error) {
      // 忽略错误
    }
  }
  
  return {
    total: allRules.length,
    success: successCount,
    successRate: (successCount / allRules.length) * 100
  };
}

/**
 * 显示成功规则示例
 */
async function showSuccessfulRuleExamples() {
  const [successfulRules] = await connection.execute(`
    SELECT intent_name, action_target
    FROM nlp_intent_rules 
    WHERE status = 'active'
    ORDER BY intent_name
    LIMIT 10
  `);
  
  let exampleCount = 0;
  
  for (const rule of successfulRules) {
    try {
      const [results] = await connection.execute(rule.action_target);
      
      if (results.length > 0 && exampleCount < 5) {
        console.log(`\n📋 ${rule.intent_name}:`);
        const example = results[0];
        const fields = Object.keys(example);
        
        fields.slice(0, 5).forEach(field => {
          console.log(`  ${field}: ${example[field]}`);
        });
        
        if (fields.length > 5) {
          console.log(`  ... 还有 ${fields.length - 5} 个字段`);
        }
        
        exampleCount++;
      }
    } catch (error) {
      // 忽略错误
    }
  }
}

// 执行优化
optimizeRemainingRules();
