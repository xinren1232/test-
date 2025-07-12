/**
 * 修复规则字段映射工具
 * 根据真实数据结构更新所有规则的字段映射
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 标准字段映射模板
const FIELD_MAPPING_TEMPLATES = {
  inventory: `
SELECT 
  storage_location as 工厂,
  warehouse as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(expiry_date, '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory`,

  online: `
SELECT 
  factory as 工厂,
  baseline_id as 基线,
  project_id as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  batch_no as 批次号,
  ROUND(defect_rate * 100, 2) as 不良率,
  weekly_anomalies as 本周异常,
  DATE_FORMAT(inspection_date, '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM factory_production`,

  testing: `
SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  project_id as 项目,
  baseline_id as 基线,
  material_code as 物料编码,
  quantity as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_description, '') as 不合格描述,
  COALESCE(notes, '') as 备注
FROM lab_tests`,

  batch: `
SELECT 
  batch_no as 批次号,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库日期,
  production_anomalies as 产线异常,
  test_anomalies as 测试异常,
  COALESCE(notes, '') as 备注
FROM inventory`
};

/**
 * 分析规则需要的修复类型
 */
async function analyzeRuleFixNeeds() {
  console.log('🔍 分析规则修复需求...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const [rules] = await connection.execute(`
      SELECT 
        id, 
        intent_name, 
        description,
        action_target, 
        category,
        trigger_words
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY category, priority
    `);
    
    const fixNeeds = [];
    
    for (const rule of rules) {
      const sql = rule.action_target;
      let fixType = null;
      let targetTemplate = null;
      
      // 判断规则类型和需要的修复
      if (rule.category === 'inventory' || rule.intent_name.includes('库存') || rule.intent_name.includes('批次')) {
        if (!sql.includes('as 工厂') || !sql.includes('as 仓库') || !sql.includes('as 状态')) {
          fixType = 'UPDATE_INVENTORY_FIELDS';
          targetTemplate = 'inventory';
        }
      } else if (rule.category === 'online' || rule.intent_name.includes('在线') || rule.intent_name.includes('跟踪')) {
        if (!sql.includes('as 基线') || !sql.includes('as 项目') || !sql.includes('as 不良率')) {
          fixType = 'UPDATE_ONLINE_FIELDS';
          targetTemplate = 'online';
        }
      } else if (rule.category === 'testing' || rule.intent_name.includes('测试') || rule.intent_name.includes('检验')) {
        if (!sql.includes('as 测试编号') || !sql.includes('as 测试结果')) {
          fixType = 'UPDATE_TESTING_FIELDS';
          targetTemplate = 'testing';
        }
      }
      
      if (fixType) {
        fixNeeds.push({
          id: rule.id,
          name: rule.intent_name,
          category: rule.category,
          fixType: fixType,
          targetTemplate: targetTemplate,
          currentSql: sql
        });
      }
    }
    
    console.log(`\n📊 需要修复的规则: ${fixNeeds.length} 个`);
    fixNeeds.forEach((fix, index) => {
      console.log(`${index + 1}. ${fix.name} (${fix.fixType})`);
    });
    
    return fixNeeds;
    
  } finally {
    await connection.end();
  }
}

/**
 * 生成修复后的SQL
 */
function generateFixedSQL(originalSql, targetTemplate, ruleName) {
  const baseTemplate = FIELD_MAPPING_TEMPLATES[targetTemplate];
  
  // 提取WHERE条件
  const whereMatch = originalSql.match(/WHERE\s+(.+?)(?:ORDER|LIMIT|$)/is);
  const orderMatch = originalSql.match(/ORDER\s+BY\s+(.+?)(?:LIMIT|$)/is);
  const limitMatch = originalSql.match(/LIMIT\s+(\d+)/is);
  
  let fixedSql = baseTemplate;
  
  // 添加WHERE条件
  if (whereMatch) {
    fixedSql += `\nWHERE ${whereMatch[1].trim()}`;
  }
  
  // 添加ORDER BY
  if (orderMatch) {
    fixedSql += `\nORDER BY ${orderMatch[1].trim()}`;
  } else {
    // 默认排序
    if (targetTemplate === 'inventory') {
      fixedSql += `\nORDER BY inbound_time DESC`;
    } else if (targetTemplate === 'online') {
      fixedSql += `\nORDER BY inspection_date DESC`;
    } else if (targetTemplate === 'testing') {
      fixedSql += `\nORDER BY test_date DESC`;
    }
  }
  
  // 添加LIMIT
  if (limitMatch) {
    fixedSql += `\nLIMIT ${limitMatch[1]}`;
  } else {
    fixedSql += `\nLIMIT 20`; // 默认限制
  }
  
  return fixedSql;
}

/**
 * 执行规则修复
 */
async function executeRuleFixes(fixNeeds) {
  console.log('\n🔧 开始执行规则修复...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    let successCount = 0;
    let errorCount = 0;
    
    for (const fix of fixNeeds) {
      try {
        console.log(`\n修复规则: ${fix.name}`);
        
        // 生成修复后的SQL
        const fixedSql = generateFixedSQL(fix.currentSql, fix.targetTemplate, fix.name);
        
        console.log('原SQL:', fix.currentSql.substring(0, 100) + '...');
        console.log('新SQL:', fixedSql.substring(0, 100) + '...');
        
        // 更新数据库
        await connection.execute(`
          UPDATE nlp_intent_rules 
          SET action_target = ?, updated_at = NOW()
          WHERE id = ?
        `, [fixedSql, fix.id]);
        
        console.log('✅ 修复成功');
        successCount++;
        
      } catch (error) {
        console.log(`❌ 修复失败: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n📊 修复结果:`);
    console.log(`✅ 成功: ${successCount} 个规则`);
    console.log(`❌ 失败: ${errorCount} 个规则`);
    
    return { successCount, errorCount };
    
  } finally {
    await connection.end();
  }
}

/**
 * 验证修复结果
 */
async function validateFixes() {
  console.log('\n🔍 验证修复结果...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const [rules] = await connection.execute(`
      SELECT 
        id, 
        intent_name, 
        action_target,
        category
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY category, priority
    `);
    
    const validationResults = [];
    
    for (const rule of rules) {
      const sql = rule.action_target;
      const issues = [];
      
      // 检查字段别名
      if (rule.category === 'inventory' || rule.intent_name.includes('库存')) {
        const requiredFields = ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'];
        const missingFields = requiredFields.filter(field => !sql.includes(`as ${field}`));
        if (missingFields.length > 0) {
          issues.push(`缺少字段: ${missingFields.join(', ')}`);
        }
      }
      
      if (issues.length === 0) {
        validationResults.push({ id: rule.id, name: rule.intent_name, status: 'VALID' });
      } else {
        validationResults.push({ id: rule.id, name: rule.intent_name, status: 'INVALID', issues });
      }
    }
    
    const validCount = validationResults.filter(r => r.status === 'VALID').length;
    const invalidCount = validationResults.filter(r => r.status === 'INVALID').length;
    
    console.log(`\n📊 验证结果:`);
    console.log(`✅ 有效规则: ${validCount} 个`);
    console.log(`❌ 无效规则: ${invalidCount} 个`);
    
    if (invalidCount > 0) {
      console.log('\n❌ 仍有问题的规则:');
      validationResults.filter(r => r.status === 'INVALID').forEach(result => {
        console.log(`- ${result.name}: ${result.issues.join(', ')}`);
      });
    }
    
    return validationResults;
    
  } finally {
    await connection.end();
  }
}

async function main() {
  try {
    console.log('🚀 开始修复规则字段映射...\n');
    
    // 1. 分析修复需求
    const fixNeeds = await analyzeRuleFixNeeds();
    
    if (fixNeeds.length === 0) {
      console.log('✅ 所有规则字段映射都正确，无需修复！');
      return;
    }
    
    // 2. 执行修复
    const fixResults = await executeRuleFixes(fixNeeds);
    
    // 3. 验证修复结果
    const validationResults = await validateFixes();
    
    console.log('\n✅ 规则字段映射修复完成！');
    
    return {
      fixNeeds,
      fixResults,
      validationResults
    };
    
  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error);
    throw error;
  }
}

main().catch(console.error);
