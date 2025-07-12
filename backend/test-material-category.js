/**
 * 测试物料大类查询
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

async function testCategoryQuery() {
  console.log('🧪 测试物料大类查询...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 测试结构件类查询
    const category = '结构件类';
    const materials = MATERIAL_CATEGORIES[category];
    const materialConditions = materials.map(material => `material_name = '${material}'`).join(' OR ');
    
    console.log(`\n测试 ${category} 查询:`);
    console.log(`包含物料: ${materials.join(', ')}`);
    console.log(`查询条件: ${materialConditions}`);
    
    const sql = `
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
LIMIT 10`;
    
    console.log('\n执行SQL查询...');
    const [results] = await connection.execute(sql);
    
    console.log(`\n📊 查询结果: ${results.length} 条记录`);
    if (results.length > 0) {
      const foundMaterials = [...new Set(results.map(r => r.物料名称))];
      console.log(`找到的物料: ${foundMaterials.join(', ')}`);
      
      console.log('\n前3条记录:');
      results.slice(0, 3).forEach((record, index) => {
        console.log(`${index + 1}. ${record.物料名称} - ${record.供应商} - ${record.数量}个 (${record.状态})`);
      });
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ 查询失败:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

async function checkExistingCategoryRules() {
  console.log('\n🔍 检查现有的物料大类规则...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const [rules] = await connection.execute(`
      SELECT 
        id, 
        intent_name, 
        description,
        trigger_words,
        example_query
      FROM nlp_intent_rules 
      WHERE status = 'active' 
      AND (
        intent_name LIKE '%结构件%' OR
        intent_name LIKE '%光学%' OR
        intent_name LIKE '%充电%' OR
        intent_name LIKE '%声学%' OR
        intent_name LIKE '%包料%' OR
        intent_name LIKE '%大类%'
      )
      ORDER BY intent_name
    `);
    
    console.log(`\n📊 找到 ${rules.length} 个物料大类相关规则:`);
    rules.forEach((rule, index) => {
      console.log(`${index + 1}. ${rule.intent_name}`);
      console.log(`   描述: ${rule.description}`);
      console.log(`   示例: ${rule.example_query}`);
    });
    
    return rules;
    
  } finally {
    await connection.end();
  }
}

async function main() {
  try {
    console.log('🚀 开始测试物料大类功能...\n');
    
    // 1. 检查现有规则
    const existingRules = await checkExistingCategoryRules();
    
    // 2. 测试查询
    const queryResults = await testCategoryQuery();
    
    console.log('\n✅ 测试完成！');
    console.log(`📊 统计:`);
    console.log(`- 现有大类规则: ${existingRules.length} 个`);
    console.log(`- 测试查询结果: ${queryResults.length} 条记录`);
    
    return {
      existingRules,
      queryResults
    };
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    throw error;
  }
}

main().catch(console.error);
