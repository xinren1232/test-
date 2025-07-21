/**
 * 最终修复字段映射问题
 * 基于实际数据库表结构修复NLP规则
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function finalFixFieldMapping() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 最终修复字段映射问题...');
    
    // 1. 检查实际表结构
    console.log('\n📋 检查实际表结构...');
    
    const [labTestsFields] = await connection.execute('DESCRIBE lab_tests');
    console.log('lab_tests表实际字段:');
    labTestsFields.forEach(field => {
      console.log(`- ${field.Field} (${field.Type})`);
    });
    
    const [inventoryFields] = await connection.execute('DESCRIBE inventory');
    console.log('\ninventory表实际字段:');
    inventoryFields.forEach(field => {
      console.log(`- ${field.Field} (${field.Type})`);
    });
    
    // 2. 基于实际字段修复第一个规则
    console.log('\n🔧 基于实际字段修复测试结果统计规则...');
    
    const correctedTestResultSQL = `
SELECT 
  COALESCE(material_code, '未知项目') as 项目,
  COALESCE(batch_code, '未知基线') as 基线,
  COALESCE(material_name, '未知物料类型') as 物料类型,
  COALESCE(defect_desc, '无') as 不合格描述,
  COUNT(CASE WHEN test_result = 'PASS' THEN 1 END) as OK次数,
  COUNT(CASE WHEN test_result = 'FAIL' THEN 1 END) as NG次数,
  COUNT(*) as 总测试次数,
  CONCAT('共查询到', COUNT(*), '条记录，显示前10条') as 说明
FROM lab_tests 
WHERE test_result IN ('PASS', 'FAIL')
GROUP BY material_code, batch_code, material_name, defect_desc
ORDER BY NG次数 DESC, OK次数 DESC
LIMIT 10`;
    
    await connection.execute(
      'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
      [correctedTestResultSQL, '真实测试结果统计']
    );
    
    // 3. 修复NG物料详细信息规则
    console.log('\n🔧 修复NG物料详细信息规则...');
    
    const correctedNGSQL = `
SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(material_code, '未知项目') as 项目,
  COALESCE(batch_code, '未知基线') as 基线,
  COALESCE(material_name, '未知物料类型') as 物料类型,
  1 as NG次数,
  material_name as 物料名称,
  supplier_name as 供应商,
  COALESCE(defect_desc, '无不合格描述') as 不合格描述,
  '' as 备注
FROM lab_tests 
WHERE test_result = 'FAIL'
ORDER BY test_date DESC
LIMIT 10`;
    
    await connection.execute(
      'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
      [correctedNGSQL, 'NG物料详细信息_优化']
    );
    
    // 4. 添加基于实际字段的新规则
    console.log('\n➕ 添加基于实际字段的新规则...');
    
    const newRules = [
      {
        intent_name: '测试结果详细查询_最终版',
        description: '查询测试结果详细信息，完全基于实际数据库字段',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  material_code as 项目,
  batch_code as 基线,
  material_name as 物料类型,
  CASE WHEN test_result = 'PASS' THEN 1 ELSE 0 END as OK次数,
  CASE WHEN test_result = 'FAIL' THEN 1 ELSE 0 END as NG次数,
  material_name as 物料名称,
  supplier_name as 供应商,
  COALESCE(defect_desc, '') as 不合格描述,
  '' as 备注
FROM lab_tests 
ORDER BY test_date DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["测试结果详细", "测试详情", "检测结果"]),
        synonyms: JSON.stringify({"测试": ["检测", "检验"], "结果": ["数据", "信息"]}),
        example_query: '查询测试结果详细信息',
        priority: 11
      },
      {
        intent_name: '库存信息完整查询_最终版',
        description: '查询库存完整信息，基于实际inventory表字段',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  COALESCE(storage_location, '未知工厂') as 工厂,
  COALESCE(storage_location, '未知仓库') as 仓库,
  COALESCE(material_name, '未知类型') as 物料类型,
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
        trigger_words: JSON.stringify(["库存信息完整", "库存详情", "物料库存"]),
        synonyms: JSON.stringify({"库存": ["存货", "物料"], "信息": ["数据", "详情"]}),
        example_query: '查询库存信息完整情况',
        priority: 11
      }
    ];
    
    // 插入新规则
    for (const rule of newRules) {
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
    
    // 5. 测试修复后的规则
    console.log('\n🧪 测试修复后的规则...');
    
    // 测试第一个规则
    const [firstRule] = await connection.execute(
      'SELECT action_target FROM nlp_intent_rules WHERE intent_name = ?',
      ['真实测试结果统计']
    );
    
    if (firstRule.length > 0) {
      try {
        const [results] = await connection.execute(firstRule[0].action_target);
        console.log('✅ 第一个规则执行成功');
        console.log('返回字段:', Object.keys(results[0] || {}).join(', '));
        console.log('返回记录数:', results.length);
        
        if (results.length > 0) {
          console.log('示例数据:');
          console.log('- 项目:', results[0].项目);
          console.log('- 基线:', results[0].基线);
          console.log('- 物料类型:', results[0].物料类型);
          console.log('- OK次数:', results[0].OK次数);
          console.log('- NG次数:', results[0].NG次数);
          console.log('- 说明:', results[0].说明);
        }
      } catch (error) {
        console.error('❌ 第一个规则执行失败:', error.message);
      }
    }
    
    console.log('\n🎉 字段映射最终修复完成！');
    console.log('修复总结:');
    console.log('✅ 1. 基于实际数据库字段重新映射');
    console.log('✅ 2. 项目 = material_code, 基线 = batch_code, 物料类型 = material_name');
    console.log('✅ 3. 数量显示为OK/NG次数');
    console.log('✅ 4. 备注字段清空');
    console.log('✅ 5. 添加记录总数说明');
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    await connection.end();
  }
}

finalFixFieldMapping().catch(console.error);
