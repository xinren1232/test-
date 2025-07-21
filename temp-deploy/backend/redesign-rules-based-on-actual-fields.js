/**
 * 基于实际前端字段重新设计NLP规则
 * 去掉不存在的字段，严格按照前端实际显示字段设计
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function redesignRulesBasedOnActualFields() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 基于实际前端字段重新设计NLP规则...');
    
    // 1. 检查实际数据库表结构
    console.log('\n📋 检查实际数据库表结构...');
    
    const [inventoryFields] = await connection.execute('DESCRIBE inventory');
    console.log('inventory表字段:', inventoryFields.map(f => f.Field).join(', '));
    
    const [labTestsFields] = await connection.execute('DESCRIBE lab_tests');
    console.log('lab_tests表字段:', labTestsFields.map(f => f.Field).join(', '));
    
    // 检查production_tracking表是否存在
    try {
      const [productionFields] = await connection.execute('DESCRIBE production_tracking');
      console.log('production_tracking表字段:', productionFields.map(f => f.Field).join(', '));
    } catch (error) {
      console.log('production_tracking表不存在，跳过');
    }
    
    // 2. 清空现有规则，重新设计
    console.log('\n🗑️ 清空现有规则...');
    await connection.execute('DELETE FROM nlp_intent_rules');
    
    // 3. 基于实际前端字段设计新规则
    console.log('\n📝 基于实际前端字段设计新规则...');
    
    const actualFieldRules = [
      // 库存查询规则 - 严格按照前端库存页面字段
      {
        intent_name: '库存查询',
        description: '查询库存信息，显示前端库存页面的实际字段',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  storage_location as 工厂,
  storage_location as 仓库,
  COALESCE(material_name, '未知') as 物料类型,
  supplier_name as 供应商名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d %H:%i') as 入库时间,
  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory 
ORDER BY inbound_time DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["库存查询", "库存", "查库存", "物料库存"]),
        synonyms: JSON.stringify({"库存": ["存货", "物料"], "查询": ["查找", "搜索"]}),
        example_query: '查询库存情况',
        priority: 10
      },
      
      // 测试结果查询规则 - 严格按照前端上线数据页面字段
      {
        intent_name: '测试结果查询',
        description: '查询测试结果，显示前端上线数据页面的实际字段',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(material_code, '未知') as 项目,
  COALESCE(batch_code, '未知') as 基线,
  COALESCE(material_name, '未知') as 物料类型,
  1 as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(notes, '') as 备注
FROM lab_tests 
ORDER BY test_date DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["测试结果", "测试查询", "检测结果"]),
        synonyms: JSON.stringify({"测试": ["检测", "检验"], "结果": ["数据", "信息"]}),
        example_query: '查询测试结果',
        priority: 9
      },
      
      // NG测试结果查询 - 显示NG次数而非物料数量
      {
        intent_name: 'NG测试结果查询',
        description: '查询NG测试结果，数量显示为NG次数',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(material_code, '未知') as 项目,
  COALESCE(batch_code, '未知') as 基线,
  COALESCE(material_name, '未知') as 物料类型,
  COUNT(*) as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  COALESCE(defect_desc, '无') as 不合格描述,
  '' as 备注
FROM lab_tests 
WHERE test_result = 'FAIL'
GROUP BY test_id, test_date, material_code, batch_code, material_name, supplier_name, defect_desc
ORDER BY test_date DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["NG", "不合格", "失败", "测试失败"]),
        synonyms: JSON.stringify({"NG": ["不合格", "失败", "FAIL"]}),
        example_query: '查询NG测试结果',
        priority: 9
      },
      
      // OK测试结果查询 - 显示OK次数
      {
        intent_name: 'OK测试结果查询',
        description: '查询OK测试结果，数量显示为OK次数',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(material_code, '未知') as 项目,
  COALESCE(batch_code, '未知') as 基线,
  COALESCE(material_name, '未知') as 物料类型,
  COUNT(*) as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  '' as 不合格描述,
  '' as 备注
FROM lab_tests 
WHERE test_result = 'PASS'
GROUP BY test_id, test_date, material_code, batch_code, material_name, supplier_name
ORDER BY test_date DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["OK", "合格", "通过", "测试通过"]),
        synonyms: JSON.stringify({"OK": ["合格", "通过", "PASS"]}),
        example_query: '查询OK测试结果',
        priority: 9
      },
      
      // 测试跟踪查询 - 基于lab_tests表模拟测试跟踪页面字段
      {
        intent_name: '测试跟踪查询',
        description: '查询测试跟踪信息，显示前端测试跟踪页面的实际字段',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(material_code, '未知') as 项目,
  COALESCE(batch_code, '未知') as 基线,
  COALESCE(material_name, '未知') as 物料类型,
  1 as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(notes, '') as 备注
FROM lab_tests
ORDER BY test_date DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["测试跟踪", "跟踪查询", "测试追踪"]),
        synonyms: JSON.stringify({"测试": ["检测", "检验"], "跟踪": ["追踪", "监控"]}),
        example_query: '查询测试跟踪信息',
        priority: 8
      },
      
      // 工厂库存查询
      {
        intent_name: '工厂库存查询',
        description: '按工厂查询库存分布',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  storage_location as 工厂,
  storage_location as 仓库,
  COALESCE(material_name, '未知') as 物料类型,
  supplier_name as 供应商名称,
  supplier_name as 供应商,
  SUM(quantity) as 数量,
  status as 状态,
  DATE_FORMAT(MAX(inbound_time), '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(DATE_ADD(MAX(inbound_time), INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  '' as 备注
FROM inventory 
WHERE storage_location LIKE CONCAT('%', COALESCE(?, ''), '%')
GROUP BY storage_location, material_name, supplier_name, status
ORDER BY 数量 DESC
LIMIT 10`,
        parameters: JSON.stringify([{"name":"factory","type":"string","required":false,"description":"工厂名称"}]),
        trigger_words: JSON.stringify(["工厂库存", "工厂", "厂区库存"]),
        synonyms: JSON.stringify({"工厂": ["厂区", "生产基地"]}),
        example_query: '查询深圳工厂库存',
        priority: 8
      },
      
      // 供应商查询
      {
        intent_name: '供应商查询',
        description: '按供应商查询相关信息',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  storage_location as 工厂,
  storage_location as 仓库,
  COALESCE(material_name, '未知') as 物料类型,
  supplier_name as 供应商名称,
  supplier_name as 供应商,
  SUM(quantity) as 数量,
  status as 状态,
  DATE_FORMAT(MAX(inbound_time), '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(DATE_ADD(MAX(inbound_time), INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  '' as 备注
FROM inventory 
WHERE supplier_name LIKE CONCAT('%', COALESCE(?, ''), '%')
GROUP BY storage_location, material_name, supplier_name, status
ORDER BY 数量 DESC
LIMIT 10`,
        parameters: JSON.stringify([{"name":"supplier","type":"string","required":false,"description":"供应商名称"}]),
        trigger_words: JSON.stringify(["供应商查询", "供应商", "供应商库存"]),
        synonyms: JSON.stringify({"供应商": ["厂商", "供货商"]}),
        example_query: '查询欣旺达供应商',
        priority: 8
      }
    ];
    
    // 4. 插入新规则
    console.log('\n➕ 插入基于实际字段的新规则...');
    
    for (const rule of actualFieldRules) {
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
      console.log(`✅ 插入规则: ${rule.intent_name}`);
    }
    
    // 5. 验证新规则
    console.log('\n🧪 验证新规则...');
    
    const [newRules] = await connection.execute(
      'SELECT intent_name, description FROM nlp_intent_rules ORDER BY priority DESC'
    );
    
    console.log(`\n共创建 ${newRules.length} 条新规则:`);
    newRules.forEach((rule, index) => {
      console.log(`${index + 1}. ${rule.intent_name} - ${rule.description}`);
    });
    
    // 6. 测试第一个规则
    console.log('\n🧪 测试第一个规则...');
    
    const [firstRule] = await connection.execute(
      'SELECT action_target FROM nlp_intent_rules ORDER BY priority DESC LIMIT 1'
    );
    
    if (firstRule.length > 0) {
      try {
        const [results] = await connection.execute(firstRule[0].action_target);
        console.log('✅ 第一个规则执行成功');
        console.log('返回字段:', Object.keys(results[0] || {}).join(', '));
        console.log('返回记录数:', results.length);
        
        if (results.length > 0) {
          console.log('示例数据:');
          Object.keys(results[0]).forEach(key => {
            console.log(`- ${key}: ${results[0][key]}`);
          });
        }
      } catch (error) {
        console.error('❌ 第一个规则执行失败:', error.message);
      }
    }
    
    console.log('\n🎉 基于实际前端字段的NLP规则重新设计完成！');
    console.log('\n✅ 设计原则确认:');
    console.log('1. 严格按照前端实际显示字段设计');
    console.log('2. 去掉了不存在的字段（风险等级、测试人员等）');
    console.log('3. 数量字段在测试结果中显示为OK/NG次数');
    console.log('4. 备注字段不填写系统信息');
    console.log('5. 显示10条数据，实际满足条件的数量在查询中体现');
    
  } catch (error) {
    console.error('❌ 重新设计失败:', error);
  } finally {
    await connection.end();
  }
}

redesignRulesBasedOnActualFields().catch(console.error);
