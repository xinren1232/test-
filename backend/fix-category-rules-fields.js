/**
 * 修复物料大类规则的字段映射问题
 * 根据实际数据库表结构更新字段映射
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 正确的字段映射（基于实际数据库表结构）
const CORRECT_FIELD_MAPPINGS = {
  inventory: `
SELECT 
  storage_location as 工厂,
  storage_location as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory`,

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
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(notes, '') as 备注
FROM lab_tests`,

  online: `
SELECT 
  factory as 工厂,
  baseline as 基线,
  project as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  batch_code as 批次号,
  ROUND(defect_rate * 100, 2) as 不良率,
  exception_count as 本周异常,
  DATE_FORMAT(inspection_date, '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking`
};

// 物料大类结构定义
const MATERIAL_CATEGORIES = {
  '结构件类': ['电池盖', '中框', '手机卡托', '侧键', '装饰件'],
  '光学类': ['LCD显示屏', 'OLED显示屏', '摄像头(CAM)'],
  '充电类': ['电池', '充电器'],
  '声学类': ['扬声器', '听筒', '喇叭'],
  '包料类': ['保护套', '标签', '包装盒']
};

/**
 * 获取需要修复的物料大类规则
 */
async function getCategoryRulesToFix() {
  console.log('🔍 获取需要修复的物料大类规则...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const [rules] = await connection.execute(`
      SELECT 
        id, 
        intent_name, 
        description,
        action_target,
        trigger_words,
        example_query
      FROM nlp_intent_rules 
      WHERE status = 'active' 
      AND (
        intent_name LIKE '%结构件类%' OR
        intent_name LIKE '%光学类%' OR
        intent_name LIKE '%充电类%' OR
        intent_name LIKE '%声学类%' OR
        intent_name LIKE '%包料类%'
      )
      ORDER BY intent_name
    `);
    
    console.log(`\n📊 找到 ${rules.length} 个需要检查的物料大类规则:`);
    rules.forEach((rule, index) => {
      console.log(`${index + 1}. ${rule.intent_name}`);
    });
    
    return rules;
    
  } finally {
    await connection.end();
  }
}

/**
 * 生成修复后的SQL
 */
function generateFixedCategorySQL(category, queryType, originalSQL) {
  const materials = MATERIAL_CATEGORIES[category];
  const materialConditions = materials.map(material => `material_name = '${material}'`).join(' OR ');
  
  let baseTemplate = '';
  if (queryType === 'inventory' || queryType === '库存') {
    baseTemplate = CORRECT_FIELD_MAPPINGS.inventory;
  } else if (queryType === 'testing' || queryType === '测试') {
    baseTemplate = CORRECT_FIELD_MAPPINGS.testing;
  } else if (queryType === 'online' || queryType === '上线') {
    baseTemplate = CORRECT_FIELD_MAPPINGS.online;
  }
  
  if (!baseTemplate) {
    return originalSQL; // 如果无法确定类型，返回原SQL
  }
  
  // 添加WHERE条件
  const fixedSQL = `${baseTemplate}
WHERE (${materialConditions})
ORDER BY material_name, inbound_time DESC
LIMIT 50`;
  
  return fixedSQL;
}

/**
 * 修复物料大类规则
 */
async function fixCategoryRules() {
  console.log('\n🔧 修复物料大类规则...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const rules = await getCategoryRulesToFix();
    let fixedCount = 0;
    let errorCount = 0;
    
    for (const rule of rules) {
      try {
        // 确定规则类型
        let queryType = 'inventory'; // 默认为库存查询
        if (rule.intent_name.includes('测试') || rule.intent_name.includes('检验')) {
          queryType = 'testing';
        } else if (rule.intent_name.includes('上线') || rule.intent_name.includes('跟踪')) {
          queryType = 'online';
        }
        
        // 确定物料大类
        let category = null;
        for (const cat of Object.keys(MATERIAL_CATEGORIES)) {
          if (rule.intent_name.includes(cat)) {
            category = cat;
            break;
          }
        }
        
        if (!category) {
          console.log(`⚠️ 无法确定规则 ${rule.intent_name} 的物料大类，跳过`);
          continue;
        }
        
        // 生成修复后的SQL
        const fixedSQL = generateFixedCategorySQL(category, queryType, rule.action_target);
        
        // 更新规则
        await connection.execute(`
          UPDATE nlp_intent_rules 
          SET action_target = ?, updated_at = NOW()
          WHERE id = ?
        `, [fixedSQL, rule.id]);
        
        console.log(`✅ 修复规则: ${rule.intent_name} (${category} - ${queryType})`);
        fixedCount++;
        
      } catch (error) {
        console.log(`❌ 修复规则 ${rule.intent_name} 失败: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n📊 修复结果:`);
    console.log(`✅ 成功修复: ${fixedCount} 个规则`);
    console.log(`❌ 修复失败: ${errorCount} 个规则`);
    
    return { fixedCount, errorCount };
    
  } finally {
    await connection.end();
  }
}

/**
 * 测试修复后的规则
 */
async function testFixedRules() {
  console.log('\n🧪 测试修复后的规则...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 测试结构件类库存查询
    const testSQL = `
SELECT 
  storage_location as 工厂,
  storage_location as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory
WHERE (material_name = '电池盖' OR material_name = '中框' OR material_name = '手机卡托' OR material_name = '侧键' OR material_name = '装饰件')
ORDER BY material_name, inbound_time DESC
LIMIT 10`;
    
    console.log('测试结构件类库存查询...');
    const [results] = await connection.execute(testSQL);
    
    console.log(`📊 查询结果: ${results.length} 条记录`);
    if (results.length > 0) {
      const foundMaterials = [...new Set(results.map(r => r.物料名称))];
      console.log(`找到的物料: ${foundMaterials.join(', ')}`);
      
      console.log('\n前3条记录:');
      results.slice(0, 3).forEach((record, index) => {
        console.log(`${index + 1}. ${record.物料名称} - ${record.供应商} - ${record.数量}个 (${record.状态})`);
      });
    }
    
    return results;
    
  } finally {
    await connection.end();
  }
}

async function main() {
  try {
    console.log('🚀 开始修复物料大类规则字段映射...\n');
    
    // 1. 修复规则
    const fixResults = await fixCategoryRules();
    
    // 2. 测试修复结果
    const testResults = await testFixedRules();
    
    console.log('\n✅ 物料大类规则修复完成！');
    console.log(`📊 修复统计:`);
    console.log(`- 成功修复: ${fixResults.fixedCount} 个规则`);
    console.log(`- 修复失败: ${fixResults.errorCount} 个规则`);
    console.log(`- 测试查询: ${testResults.length} 条记录`);
    
    return {
      fixResults,
      testResults
    };
    
  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error);
    throw error;
  }
}

main().catch(console.error);
