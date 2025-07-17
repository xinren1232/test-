import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
});

/**
 * 完整的场景化规则优化
 * 按照用户指定的四个场景的字段设计重新优化所有规则
 */

// 四个场景的完整字段设计
const SCENARIO_TEMPLATES = {
  // 库存页面: 工厂、仓库、物料编码、物料名称、供应商、数量、状态、入库时间、到期时间、备注
  inventory: {
    selectFields: `
      storage_location as 工厂,
      storage_location as 仓库,
      material_code as 物料编码,
      material_name as 物料名称,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
      DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
      COALESCE(notes, '') as 备注
    `,
    table: 'inventory',
    requiredFields: ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注']
  },

  // 上线页面: 工厂、基线、项目、物料编码、物料名称、供应商、批次号、不良率、本周异常、检验日期、备注
  online: {
    selectFields: `
      factory as 工厂,
      baseline as 基线,
      project as 项目,
      material_code as 物料编码,
      material_name as 物料名称,
      supplier_name as 供应商,
      batch_code as 批次号,
      CONCAT(ROUND(defect_rate * 100, 2), '%') as 不良率,
      exception_count as 本周异常,
      DATE_FORMAT(inspection_date, '%Y-%m-%d') as 检验日期,
      COALESCE(notes, '') as 备注
    `,
    table: 'online_tracking',
    requiredFields: ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '本周异常', '检验日期', '备注']
  },

  // 测试页面: 测试编号、日期、项目、基线、物料编码、数量、物料名称、供应商、测试结果、不合格描述、备注
  testing: {
    selectFields: `
      test_id as 测试编号,
      DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
      project_id as 项目,
      baseline_id as 基线,
      material_code as 物料编码,
      quantity as 数量,
      material_name as 物料名称,
      supplier_name as 供应商,
      test_result as 测试结果,
      COALESCE(defect_desc, '') as 不合格描述,
      COALESCE(notes, '') as 备注
    `,
    table: 'lab_tests',
    requiredFields: ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注']
  },

  // 批次管理: 批次号、物料编码、物料名称、供应商、数量、入库日期、产线异常、测试异常、备注
  batch: {
    selectFields: `
      i.batch_code as 批次号,
      i.material_code as 物料编码,
      i.material_name as 物料名称,
      i.supplier_name as 供应商,
      i.quantity as 数量,
      DATE_FORMAT(i.inbound_time, '%Y-%m-%d') as 入库日期,
      COALESCE(o.exception_count, 0) as 产线异常,
      CASE WHEN l.test_result = 'NG' THEN 1 ELSE 0 END as 测试异常,
      COALESCE(i.notes, '') as 备注
    `,
    table: 'inventory i LEFT JOIN online_tracking o ON i.batch_code = o.batch_code LEFT JOIN lab_tests l ON i.batch_code = l.batch_code',
    requiredFields: ['批次号', '物料编码', '物料名称', '供应商', '数量', '入库日期', '产线异常', '测试异常', '备注']
  }
};

async function completeScenarioOptimization() {
  try {
    console.log('🚀 开始完整的场景化规则优化...\n');
    
    // 1. 获取所有规则
    const [allRules] = await connection.execute(`
      SELECT id, intent_name, action_target, category
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY intent_name
    `);
    
    console.log(`📋 找到 ${allRules.length} 个活跃规则\n`);
    
    // 2. 按场景分类规则
    const rulesByScenario = classifyRulesByScenario(allRules);
    
    console.log('📊 规则场景分类:');
    Object.entries(rulesByScenario).forEach(([scenario, rules]) => {
      console.log(`  - ${scenario}: ${rules.length}个规则`);
    });
    console.log('');
    
    // 3. 逐场景优化
    let totalOptimized = 0;
    let totalTested = 0;
    
    for (const [scenario, rules] of Object.entries(rulesByScenario)) {
      if (rules.length === 0) continue;
      
      console.log(`🔧 优化${scenario}场景 (${rules.length}个规则)...`);
      const result = await optimizeScenarioRules(scenario, rules);
      totalOptimized += result.optimized;
      totalTested += result.tested;
      console.log(`  ✅ 优化: ${result.optimized}个, 测试通过: ${result.tested}个\n`);
    }
    
    // 4. 最终验证
    console.log('🧪 最终验证所有规则...');
    const finalResult = await validateAllRules();
    
    console.log('\n📊 优化结果汇总:');
    console.log(`总规则数: ${allRules.length}`);
    console.log(`优化规则: ${totalOptimized}`);
    console.log(`测试通过: ${totalTested}`);
    console.log(`最终成功率: ${Math.round(finalResult.successRate)}%`);
    
    // 5. 生成场景示例
    console.log('\n📄 各场景示例数据:');
    await generateScenarioExamples();
    
    console.log('\n🎉 完整的场景化规则优化完成！');
    
  } catch (error) {
    console.error('❌ 优化过程中发生错误:', error);
  } finally {
    await connection.end();
  }
}

/**
 * 按场景分类规则
 */
function classifyRulesByScenario(rules) {
  const scenarios = {
    inventory: [],
    online: [],
    testing: [],
    batch: [],
    other: []
  };
  
  rules.forEach(rule => {
    const name = rule.intent_name.toLowerCase();
    const sql = rule.action_target.toLowerCase();
    
    if ((name.includes('库存') || name.includes('仓库') || name.includes('工厂')) && sql.includes('inventory')) {
      scenarios.inventory.push(rule);
    } else if (name.includes('上线') && sql.includes('online_tracking')) {
      scenarios.online.push(rule);
    } else if ((name.includes('测试') || name.includes('检验')) && sql.includes('lab_tests')) {
      scenarios.testing.push(rule);
    } else if (name.includes('批次')) {
      scenarios.batch.push(rule);
    } else {
      scenarios.other.push(rule);
    }
  });
  
  return scenarios;
}

/**
 * 优化特定场景的规则
 */
async function optimizeScenarioRules(scenario, rules) {
  let optimized = 0;
  let tested = 0;
  
  const template = SCENARIO_TEMPLATES[scenario];
  if (!template) {
    console.log(`  ⚠️  未知场景: ${scenario}`);
    return { optimized, tested };
  }
  
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    console.log(`  [${i + 1}/${rules.length}] ${rule.intent_name}`);
    
    try {
      // 测试原始SQL
      const [originalResults] = await connection.execute(rule.action_target);
      
      // 检查字段完整性
      const fields = Object.keys(originalResults[0] || {});
      const missingFields = template.requiredFields.filter(field => !fields.includes(field));
      
      if (missingFields.length === 0) {
        console.log(`    ✅ 字段完整 - ${originalResults.length}条记录`);
        tested++;
      } else {
        // 需要优化
        const optimizedSQL = generateOptimizedSQL(scenario, rule, template);
        if (optimizedSQL) {
          await updateRuleSQL(rule.id, optimizedSQL);
          console.log(`    🔧 已优化为标准${scenario}格式`);
          optimized++;
        }
      }
      
    } catch (error) {
      // SQL有错误，尝试修复
      const optimizedSQL = generateOptimizedSQL(scenario, rule, template);
      if (optimizedSQL) {
        try {
          const [testResults] = await connection.execute(optimizedSQL);
          await updateRuleSQL(rule.id, optimizedSQL);
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
 * 生成优化后的SQL
 */
function generateOptimizedSQL(scenario, rule, template) {
  const originalSQL = rule.action_target;
  
  // 提取WHERE条件
  const whereMatch = originalSQL.match(/WHERE\s+(.*?)(?:\s+ORDER|\s+GROUP|\s+LIMIT|$)/is);
  let whereClause = whereMatch ? whereMatch[1].trim() : '';
  
  // 修复WHERE条件中的字段名
  if (scenario === 'inventory') {
    whereClause = whereClause
      .replace(/\bfactory\b/g, 'storage_location')
      .replace(/\bwarehouse\b/g, 'storage_location');
  } else if (scenario === 'testing') {
    whereClause = whereClause
      .replace(/\bproject\b/g, 'project_id')
      .replace(/\bbaseline\b/g, 'baseline_id')
      .replace(/\bsupplier\b/g, 'supplier_name');
  }
  
  // 提取ORDER BY和LIMIT
  const orderMatch = originalSQL.match(/ORDER\s+BY\s+(.*?)(?:\s+LIMIT|$)/is);
  const orderClause = orderMatch ? `ORDER BY ${orderMatch[1].trim()}` : '';
  
  const limitMatch = originalSQL.match(/LIMIT\s+(\d+)/is);
  const limitClause = limitMatch ? `LIMIT ${limitMatch[1]}` : '';
  
  // 生成标准SQL
  let optimizedSQL = `SELECT ${template.selectFields.trim()} FROM ${template.table}`;
  
  if (whereClause) {
    optimizedSQL += ` WHERE ${whereClause}`;
  }
  
  if (orderClause) {
    optimizedSQL += ` ${orderClause}`;
  }
  
  if (limitClause) {
    optimizedSQL += ` ${limitClause}`;
  }
  
  return optimizedSQL;
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
 * 生成各场景示例数据
 */
async function generateScenarioExamples() {
  for (const [scenario, template] of Object.entries(SCENARIO_TEMPLATES)) {
    try {
      const sql = `SELECT ${template.selectFields.trim()} FROM ${template.table} LIMIT 1`;
      const [results] = await connection.execute(sql);
      
      if (results.length > 0) {
        console.log(`\n📋 ${scenario}场景示例:`);
        const example = results[0];
        template.requiredFields.forEach(field => {
          console.log(`  ${field}: ${example[field] || 'N/A'}`);
        });
      }
    } catch (error) {
      console.log(`\n❌ ${scenario}场景示例生成失败: ${error.message}`);
    }
  }
}

// 执行优化
completeScenarioOptimization();
