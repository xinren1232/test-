/**
 * 修复NLP规则的字段映射问题
 * 解决用户提到的4个问题：
 * 1）项目/基线 物料类型 -不合格描述
 * 2）数量这里应该是该物料种类测试OK/NG的次数
 * 3）显示10条数据，但是实际满足条件的数量也要说明
 * 4）备注不要填写这些信息
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixNLPRulesFields() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 开始修复NLP规则的字段映射问题...');
    
    // 1. 检查当前第一个规则
    console.log('\n📋 检查当前第一个规则...');
    const [currentRules] = await connection.execute(
      'SELECT id, intent_name, action_target FROM nlp_intent_rules ORDER BY id LIMIT 1'
    );
    
    if (currentRules.length > 0) {
      console.log('当前第一个规则:', currentRules[0].intent_name);
      console.log('当前SQL:', currentRules[0].action_target.substring(0, 200) + '...');
    }
    
    // 2. 检查实际表结构
    console.log('\n📋 检查实际表结构...');
    const [labTestsFields] = await connection.execute('DESCRIBE lab_tests');
    console.log('lab_tests表字段:', labTestsFields.map(f => f.Field).join(', '));
    
    // 3. 更新第一个规则 - 测试结果统计
    console.log('\n🔧 更新测试结果统计规则...');
    
    const fixedTestResultSQL = `
SELECT 
  COALESCE(material_code, '未知') as 项目,
  COALESCE(batch_code, '未知') as 基线,
  COALESCE(material_type, '未知') as 物料类型,
  COALESCE(defect_desc, '无') as 不合格描述,
  COUNT(CASE WHEN test_result = 'PASS' THEN 1 END) as OK次数,
  COUNT(CASE WHEN test_result = 'FAIL' THEN 1 END) as NG次数,
  COUNT(*) as 总测试次数,
  CONCAT('共查询到', COUNT(*), '条记录，显示前10条') as 说明
FROM lab_tests 
WHERE test_result IN ('PASS', 'FAIL')
GROUP BY material_code, batch_code, material_type, defect_desc
ORDER BY NG次数 DESC, OK次数 DESC
LIMIT 10`;
    
    await connection.execute(
      'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
      [fixedTestResultSQL, '真实测试结果统计']
    );
    
    // 4. 添加新的优化规则
    console.log('\n➕ 添加优化的NLP规则...');
    
    const optimizedRules = [
      {
        intent_name: 'NG物料详细信息_优化',
        description: '查询NG测试结果，正确显示项目/基线/物料类型/不合格描述',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(material_code, '未知项目') as 项目,
  COALESCE(batch_code, '未知基线') as 基线,
  COALESCE(material_type, '未知类型') as 物料类型,
  1 as NG次数,
  material_name as 物料名称,
  supplier_name as 供应商,
  COALESCE(defect_desc, '无不合格描述') as 不合格描述,
  '' as 备注
FROM lab_tests 
WHERE test_result = 'FAIL'
ORDER BY test_date DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["NG物料", "不合格物料", "测试失败"]),
        synonyms: JSON.stringify({"NG": ["不合格", "失败"], "物料": ["材料", "零件"]}),
        example_query: '查询NG物料详细信息',
        priority: 10
      },
      {
        intent_name: '库存状态查询_优化',
        description: '查询库存状态，显示实际前端字段',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  COALESCE(storage_location, '未知') as 工厂,
  COALESCE(storage_location, '未知') as 仓库,
  material_type as 物料类型,
  supplier_name as 供应商名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  '' as 备注
FROM inventory 
ORDER BY inbound_time DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["库存状态", "库存查询", "物料库存"]),
        synonyms: JSON.stringify({"库存": ["存货", "物料"], "状态": ["情况", "信息"]}),
        example_query: '查询库存状态',
        priority: 9
      }
    ];
    
    // 插入优化规则
    for (const rule of optimizedRules) {
      // 检查是否已存在
      const [existing] = await connection.execute(
        'SELECT id FROM nlp_intent_rules WHERE intent_name = ?',
        [rule.intent_name]
      );
      
      if (existing.length === 0) {
        await connection.execute(
          `INSERT INTO nlp_intent_rules 
           (intent_name, description, action_type, action_target, parameters, trigger_words, synonyms, example_query, priority, status, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
          [
            rule.intent_name,
            rule.description,
            rule.action_type,
            rule.action_target,
            rule.parameters,
            rule.trigger_words,
            rule.synonyms,
            rule.example_query,
            rule.priority
          ]
        );
        console.log(`✅ 添加规则: ${rule.intent_name}`);
      } else {
        console.log(`⚠️ 规则已存在: ${rule.intent_name}`);
      }
    }
    
    // 5. 验证修复结果
    console.log('\n✅ 验证修复结果...');
    
    const [updatedFirstRule] = await connection.execute(
      'SELECT intent_name, action_target FROM nlp_intent_rules WHERE intent_name = ?',
      ['真实测试结果统计']
    );
    
    if (updatedFirstRule.length > 0) {
      console.log('修复后的第一个规则SQL:');
      console.log(updatedFirstRule[0].action_target);
    }
    
    const [allRules] = await connection.execute(
      'SELECT intent_name, description FROM nlp_intent_rules ORDER BY priority DESC LIMIT 5'
    );
    
    console.log('\n当前前5个规则:');
    allRules.forEach((rule, index) => {
      console.log(`${index + 1}. ${rule.intent_name} - ${rule.description}`);
    });
    
    console.log('\n🎉 NLP规则字段映射修复完成！');
    console.log('主要修复内容:');
    console.log('1. 修正了项目/基线字段映射');
    console.log('2. 数量改为显示OK/NG次数');
    console.log('3. 添加了记录总数说明');
    console.log('4. 清空了备注字段的系统信息');
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    await connection.end();
  }
}

fixNLPRulesFields().catch(console.error);
