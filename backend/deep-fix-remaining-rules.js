import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
});

/**
 * 深度修复剩余的62个问题规则
 * 专门处理特定供应商+物料组合查询等复杂SQL语法错误
 */

async function deepFixRemainingRules() {
  try {
    console.log('🔧 开始深度修复剩余的问题规则...\n');
    
    // 1. 获取所有失败的规则
    const [allRules] = await connection.execute(`
      SELECT id, intent_name, action_target, category
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY intent_name
    `);
    
    console.log(`📋 总规则数: ${allRules.length}`);
    
    // 2. 识别失败的规则
    const failedRules = [];
    const successfulRules = [];
    
    for (const rule of allRules) {
      try {
        await connection.execute(rule.action_target);
        successfulRules.push(rule);
      } catch (error) {
        failedRules.push({ ...rule, error: error.message });
      }
    }
    
    console.log(`❌ 失败规则: ${failedRules.length}个`);
    console.log(`✅ 成功规则: ${successfulRules.length}个\n`);
    
    // 3. 分析失败规则类型
    const ruleTypes = analyzeFailedRuleTypes(failedRules);
    
    console.log('📊 失败规则类型分析:');
    Object.entries(ruleTypes).forEach(([type, rules]) => {
      console.log(`  - ${type}: ${rules.length}个规则`);
    });
    console.log('');
    
    // 4. 逐类型深度修复
    let totalFixed = 0;
    
    for (const [type, rules] of Object.entries(ruleTypes)) {
      if (rules.length === 0) continue;
      
      console.log(`🔧 深度修复${type}规则 (${rules.length}个)...`);
      const fixedCount = await deepFixRulesByType(type, rules);
      totalFixed += fixedCount;
      console.log(`  ✅ 修复成功: ${fixedCount}个\n`);
    }
    
    // 5. 最终验证
    console.log('🧪 最终验证所有规则...');
    const finalResult = await validateAllRulesWithDetails();
    
    console.log('\n📊 深度修复结果:');
    console.log(`总规则数: ${allRules.length}`);
    console.log(`修复成功: ${totalFixed}个`);
    console.log(`最终成功率: ${Math.round(finalResult.successRate)}%`);
    console.log(`成功规则: ${finalResult.success}个`);
    console.log(`仍有问题: ${finalResult.failed}个`);
    
    // 6. 展示修复成果
    if (totalFixed > 0) {
      console.log('\n🎉 修复成果展示:');
      await showFixedRuleExamples(totalFixed);
    }
    
    console.log('\n🎉 深度修复完成！');
    
  } catch (error) {
    console.error('❌ 深度修复过程中发生错误:', error);
  } finally {
    await connection.end();
  }
}

/**
 * 分析失败规则类型
 */
function analyzeFailedRuleTypes(failedRules) {
  const types = {
    supplierMaterial: [],    // 供应商+物料组合查询
    materialOnly: [],        // 纯物料查询
    supplierOnly: [],        // 纯供应商查询
    complexQuery: [],        // 复杂查询
    syntaxError: []          // 语法错误
  };
  
  failedRules.forEach(rule => {
    const name = rule.intent_name.toLowerCase();
    
    // 供应商+物料组合查询 (如"BOE的LCD显示屏查询")
    if (name.includes('的') && (name.includes('查询') || name.includes('专查'))) {
      types.supplierMaterial.push(rule);
    }
    // 纯物料查询 (如"LCD显示屏物料查询")
    else if (name.includes('物料查询')) {
      types.materialOnly.push(rule);
    }
    // 纯供应商查询
    else if (name.includes('供应商') && !name.includes('的')) {
      types.supplierOnly.push(rule);
    }
    // 复杂查询 (包含分析、对比等)
    else if (name.includes('分析') || name.includes('对比') || name.includes('排行')) {
      types.complexQuery.push(rule);
    }
    // 其他语法错误
    else {
      types.syntaxError.push(rule);
    }
  });
  
  return types;
}

/**
 * 按类型深度修复规则
 */
async function deepFixRulesByType(type, rules) {
  let fixedCount = 0;
  
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    console.log(`  [${i + 1}/${rules.length}] ${rule.intent_name}`);
    
    let fixedSQL = null;
    
    switch (type) {
      case 'supplierMaterial':
        fixedSQL = fixSupplierMaterialQuery(rule);
        break;
      case 'materialOnly':
        fixedSQL = fixMaterialOnlyQuery(rule);
        break;
      case 'supplierOnly':
        fixedSQL = fixSupplierOnlyQuery(rule);
        break;
      case 'complexQuery':
        fixedSQL = fixComplexQuery(rule);
        break;
      case 'syntaxError':
        fixedSQL = fixSyntaxError(rule);
        break;
    }
    
    if (fixedSQL && fixedSQL !== rule.action_target) {
      try {
        // 测试修复后的SQL
        const [testResults] = await connection.execute(fixedSQL);
        
        // 更新数据库
        await connection.execute(`
          UPDATE nlp_intent_rules 
          SET action_target = ?
          WHERE id = ?
        `, [fixedSQL, rule.id]);
        
        console.log(`    🔧 修复成功 - ${testResults.length}条记录`);
        fixedCount++;
        
      } catch (fixError) {
        console.log(`    ❌ 修复失败: ${fixError.message.substring(0, 50)}...`);
      }
    } else {
      console.log(`    ℹ️  无法生成修复方案`);
    }
  }
  
  return fixedCount;
}

/**
 * 修复供应商+物料组合查询
 */
function fixSupplierMaterialQuery(rule) {
  const name = rule.intent_name;
  
  // 解析供应商和物料名称
  const match = name.match(/(.+?)的(.+?)查询/);
  if (!match) return null;
  
  const supplier = match[1];
  const material = match[2];
  
  // 根据物料类型确定查询表和字段
  let table = 'inventory';
  let fields = `
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
  `;
  
  // 如果是测试相关，使用lab_tests表
  if (material.includes('测试') || material.includes('检验')) {
    table = 'lab_tests';
    fields = `
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
    `;
  }
  
  // 生成标准SQL
  const fixedSQL = `SELECT ${fields.trim()} FROM ${table} WHERE supplier_name = '${supplier}' AND material_name LIKE '%${material}%' ORDER BY material_code LIMIT 50`;
  
  return fixedSQL;
}

/**
 * 修复纯物料查询
 */
function fixMaterialOnlyQuery(rule) {
  const name = rule.intent_name;
  
  // 提取物料名称
  const match = name.match(/(.+?)物料查询/);
  if (!match) return null;
  
  const material = match[1];
  
  // 使用库存表进行物料查询
  const fixedSQL = `
    SELECT 
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
    FROM inventory 
    WHERE material_name LIKE '%${material}%' 
    ORDER BY supplier_name, material_code 
    LIMIT 50
  `.replace(/\s+/g, ' ').trim();
  
  return fixedSQL;
}

/**
 * 修复纯供应商查询
 */
function fixSupplierOnlyQuery(rule) {
  const originalSQL = rule.action_target;
  
  // 基本字段修复
  let fixedSQL = originalSQL
    .replace(/\bfactory\b/g, 'storage_location')
    .replace(/\bwarehouse\b/g, 'storage_location')
    .replace(/\bsupplier\b/g, 'supplier_name')
    .replace(/\bproject\b/g, 'project_id')
    .replace(/\bbaseline\b/g, 'baseline_id')
    .replace(/\s+/g, ' ')
    .trim();
  
  return fixedSQL;
}

/**
 * 修复复杂查询
 */
function fixComplexQuery(rule) {
  const originalSQL = rule.action_target;
  
  // 基本字段修复
  let fixedSQL = originalSQL
    .replace(/\bfactory\b/g, 'storage_location')
    .replace(/\bwarehouse\b/g, 'storage_location')
    .replace(/\bsupplier\b/g, 'supplier_name')
    .replace(/\bproject\b/g, 'project_id')
    .replace(/\bbaseline\b/g, 'baseline_id')
    .replace(/\s+/g, ' ')
    .trim();
  
  // 修复GROUP BY语法
  if (fixedSQL.includes('GROUP BY') && !fixedSQL.includes('SELECT')) {
    // 如果GROUP BY前没有合适的SELECT，添加基本的聚合查询
    fixedSQL = fixedSQL.replace(/GROUP BY/, 'SELECT COUNT(*) as 总数, supplier_name as 供应商 FROM lab_tests GROUP BY');
  }
  
  return fixedSQL;
}

/**
 * 修复语法错误
 */
function fixSyntaxError(rule) {
  const originalSQL = rule.action_target;
  
  // 通用语法修复
  let fixedSQL = originalSQL
    .replace(/\bfactory\b/g, 'storage_location')
    .replace(/\bwarehouse\b/g, 'storage_location')
    .replace(/\bsupplier\b/g, 'supplier_name')
    .replace(/\bproject\b/g, 'project_id')
    .replace(/\bbaseline\b/g, 'baseline_id')
    .replace(/,\s*,/g, ',')  // 去除多余逗号
    .replace(/\s+/g, ' ')    // 规范化空格
    .trim();
  
  return fixedSQL;
}

/**
 * 验证所有规则并返回详细信息
 */
async function validateAllRulesWithDetails() {
  const [allRules] = await connection.execute(`
    SELECT id, intent_name, action_target
    FROM nlp_intent_rules 
    WHERE status = 'active'
  `);
  
  let successCount = 0;
  let failedCount = 0;
  const successExamples = [];
  
  for (const rule of allRules) {
    try {
      const [results] = await connection.execute(rule.action_target);
      successCount++;
      
      if (results.length > 0 && successExamples.length < 3) {
        successExamples.push({
          name: rule.intent_name,
          recordCount: results.length,
          fields: Object.keys(results[0])
        });
      }
    } catch (error) {
      failedCount++;
    }
  }
  
  return {
    total: allRules.length,
    success: successCount,
    failed: failedCount,
    successRate: (successCount / allRules.length) * 100,
    examples: successExamples
  };
}

/**
 * 展示修复成果示例
 */
async function showFixedRuleExamples(fixedCount) {
  console.log(`成功修复了 ${fixedCount} 个规则！`);
  
  // 随机选择几个成功的规则展示
  const [sampleRules] = await connection.execute(`
    SELECT intent_name, action_target
    FROM nlp_intent_rules 
    WHERE status = 'active'
    ORDER BY RAND()
    LIMIT 3
  `);
  
  for (const rule of sampleRules) {
    try {
      const [results] = await connection.execute(rule.action_target);
      if (results.length > 0) {
        console.log(`\n📋 ${rule.intent_name}:`);
        console.log(`  记录数: ${results.length}`);
        console.log(`  字段: ${Object.keys(results[0]).slice(0, 5).join(', ')}...`);
      }
    } catch (error) {
      // 忽略错误
    }
  }
}

// 执行深度修复
deepFixRemainingRules();
