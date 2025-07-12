/**
 * 优化物料大类查询规则
 * 正确处理多物料种类汇集的情况，确保大类查询能返回所有相关物料
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
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
 * 检查数据库中的物料分布
 */
async function checkMaterialDistribution() {
  console.log('🔍 检查数据库中的物料分布...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 检查库存中的物料分布
    const [inventoryStats] = await connection.execute(`
      SELECT 
        material_name,
        COUNT(*) as inventory_count,
        COUNT(DISTINCT supplier_name) as supplier_count
      FROM inventory 
      GROUP BY material_name
      ORDER BY inventory_count DESC
    `);
    
    console.log('\n📊 库存物料分布:');
    const categoryStats = {};
    
    inventoryStats.forEach(stat => {
      const category = Object.keys(MATERIAL_CATEGORIES).find(cat =>
        MATERIAL_CATEGORIES[cat].includes(stat.material_name)
      );
      
      if (category) {
        if (!categoryStats[category]) {
          categoryStats[category] = { materials: [], totalCount: 0 };
        }
        categoryStats[category].materials.push({
          name: stat.material_name,
          count: stat.inventory_count,
          supplierCount: stat.supplier_count
        });
        categoryStats[category].totalCount += stat.inventory_count;
      }
      
      console.log(`${stat.material_name}: ${stat.inventory_count}条记录, ${stat.supplier_count}个供应商 (${category || '未分类'})`);
    });
    
    console.log('\n📋 按大类汇总:');
    Object.entries(categoryStats).forEach(([category, stats]) => {
      console.log(`${category}: ${stats.materials.length}种物料, 总计${stats.totalCount}条记录`);
      stats.materials.forEach(material => {
        console.log(`  - ${material.name}: ${material.count}条记录`);
      });
    });
    
    return { inventoryStats, categoryStats };
    
  } finally {
    await connection.end();
  }
}

/**
 * 生成优化的物料大类查询SQL
 */
function generateCategoryQuerySQL(category, queryType = 'inventory') {
  const materials = MATERIAL_CATEGORIES[category];
  const materialConditions = materials.map(material => `material_name = '${material}'`).join(' OR ');
  
  let sql = '';
  
  if (queryType === 'inventory') {
    sql = `
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
FROM inventory 
WHERE (${materialConditions})
ORDER BY material_name, inbound_time DESC
LIMIT 50`;
  } else if (queryType === 'testing') {
    sql = `
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
FROM lab_tests 
WHERE (${materialConditions})
ORDER BY material_name, test_date DESC
LIMIT 50`;
  }
  
  return sql;
}

/**
 * 创建或更新物料大类规则
 */
async function createOrUpdateCategoryRules() {
  console.log('\n🔧 创建或更新物料大类规则...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    let createdCount = 0;
    let updatedCount = 0;
    
    for (const [category, materials] of Object.entries(MATERIAL_CATEGORIES)) {
      // 为每个大类创建库存查询规则
      const inventoryRuleName = `${category}库存查询`;
      const inventorySQL = generateCategoryQuerySQL(category, 'inventory');
      
      // 检查规则是否已存在
      const [existingRules] = await connection.execute(`
        SELECT id FROM nlp_intent_rules 
        WHERE intent_name = ? AND status = 'active'
      `, [inventoryRuleName]);
      
      if (existingRules.length > 0) {
        // 更新现有规则
        await connection.execute(`
          UPDATE nlp_intent_rules 
          SET 
            action_target = ?,
            description = ?,
            trigger_words = ?,
            example_query = ?,
            updated_at = NOW()
          WHERE id = ?
        `, [
          inventorySQL,
          `查询${category}的库存信息，包含${materials.join('、')}等物料`,
          JSON.stringify([category, `${category}库存`, `${category}物料`, ...materials]),
          `查询${category}库存`,
          existingRules[0].id
        ]);
        updatedCount++;
        console.log(`✅ 更新规则: ${inventoryRuleName}`);
      } else {
        // 创建新规则
        await connection.execute(`
          INSERT INTO nlp_intent_rules (
            intent_name, description, action_type, action_target, 
            trigger_words, example_query, category, priority, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          inventoryRuleName,
          `查询${category}的库存信息，包含${materials.join('、')}等物料`,
          'SQL_QUERY',
          inventorySQL,
          JSON.stringify([category, `${category}库存`, `${category}物料`, ...materials]),
          `查询${category}库存`,
          'material_category',
          20,
          'active'
        ]);
        createdCount++;
        console.log(`✅ 创建规则: ${inventoryRuleName}`);
      }
      
      // 为每个大类创建测试查询规则
      const testingRuleName = `${category}测试查询`;
      const testingSQL = generateCategoryQuerySQL(category, 'testing');
      
      const [existingTestRules] = await connection.execute(`
        SELECT id FROM nlp_intent_rules 
        WHERE intent_name = ? AND status = 'active'
      `, [testingRuleName]);
      
      if (existingTestRules.length > 0) {
        await connection.execute(`
          UPDATE nlp_intent_rules 
          SET 
            action_target = ?,
            description = ?,
            trigger_words = ?,
            example_query = ?,
            updated_at = NOW()
          WHERE id = ?
        `, [
          testingSQL,
          `查询${category}的测试信息，包含${materials.join('、')}等物料`,
          JSON.stringify([`${category}测试`, `${category}检验`, ...materials.map(m => `${m}测试`)]),
          `查询${category}测试结果`,
          existingTestRules[0].id
        ]);
        updatedCount++;
        console.log(`✅ 更新规则: ${testingRuleName}`);
      } else {
        await connection.execute(`
          INSERT INTO nlp_intent_rules (
            intent_name, description, action_type, action_target, 
            trigger_words, example_query, category, priority, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          testingRuleName,
          `查询${category}的测试信息，包含${materials.join('、')}等物料`,
          'SQL_QUERY',
          testingSQL,
          JSON.stringify([`${category}测试`, `${category}检验`, ...materials.map(m => `${m}测试`)]),
          `查询${category}测试结果`,
          'material_category',
          20,
          'active'
        ]);
        createdCount++;
        console.log(`✅ 创建规则: ${testingRuleName}`);
      }
    }
    
    console.log(`\n📊 规则更新统计:`);
    console.log(`✅ 创建新规则: ${createdCount} 个`);
    console.log(`🔄 更新现有规则: ${updatedCount} 个`);
    
    return { createdCount, updatedCount };
    
  } finally {
    await connection.end();
  }
}

async function main() {
  try {
    console.log('🚀 开始优化物料大类查询规则...\n');
    
    // 1. 检查物料分布
    const materialDistribution = await checkMaterialDistribution();
    
    // 2. 创建或更新规则
    const ruleUpdateResults = await createOrUpdateCategoryRules();
    
    console.log('\n✅ 物料大类规则优化完成！');
    console.log(`📊 优化统计:`);
    console.log(`- 物料大类: ${Object.keys(MATERIAL_CATEGORIES).length} 个`);
    console.log(`- 物料种类: ${Object.values(MATERIAL_CATEGORIES).flat().length} 种`);
    console.log(`- 规则创建: ${ruleUpdateResults.createdCount} 个`);
    console.log(`- 规则更新: ${ruleUpdateResults.updatedCount} 个`);
    
    return {
      materialDistribution,
      ruleUpdateResults
    };
    
  } catch (error) {
    console.error('❌ 优化过程中发生错误:', error);
    throw error;
  }
}

main().catch(console.error);
