/**
 * 基于真实前端页面截图分析实际字段
 * 重新设计和扩展NLP规则
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 基于真实前端页面的字段分析
const REAL_FRONTEND_FIELDS = {
  // 物料库存页面 - 从截图分析
  inventory: {
    fields: ['工厂', '仓库', '物料编号', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'],
    description: '库存管理页面，显示物料的基本信息和库存状态'
  },
  
  // 物料上线数据页面 - 从截图分析  
  onlineData: {
    fields: ['工厂', '基线', '项目', '物料编号', '物料名称', '供应商', '批次', '不良率', '本批异常', '异常描述'],
    description: '上线物料信息总览，显示物料在产线的使用情况'
  },
  
  // 物料测试数据页面 - 从截图分析
  testData: {
    fields: ['测试编号', '日期', '项目', '基线', '物料编号', '批次', '物料名称', '供应商', '测试结果', '不良描述'],
    description: '检测结果明细，显示物料的测试详情'
  },
  
  // 批次信息页面 - 从截图分析
  batchInfo: {
    fields: ['批次号', '物料编号', '物料名称', '供应商', '数量', '入库时间', '产线异常', '测试异常', '备注'],
    description: '物料批次管理，显示批次的异常统计信息'
  }
};

async function analyzeRealFrontendFields() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 基于真实前端页面分析字段并重新设计NLP规则...');
    
    // 1. 分析真实前端字段
    console.log('\n📋 真实前端页面字段分析:');
    
    Object.keys(REAL_FRONTEND_FIELDS).forEach(pageType => {
      const page = REAL_FRONTEND_FIELDS[pageType];
      console.log(`\n${pageType.toUpperCase()}页面:`);
      console.log(`描述: ${page.description}`);
      console.log(`字段: ${page.fields.join(', ')}`);
    });
    
    // 2. 检查数据库表结构
    console.log('\n📋 检查数据库表结构...');
    
    const [inventoryFields] = await connection.execute('DESCRIBE inventory');
    console.log('inventory表字段:', inventoryFields.map(f => f.Field).join(', '));
    
    const [labTestsFields] = await connection.execute('DESCRIBE lab_tests');
    console.log('lab_tests表字段:', labTestsFields.map(f => f.Field).join(', '));
    
    // 3. 清空现有规则
    console.log('\n🗑️ 清空现有规则，准备重新设计...');
    await connection.execute('DELETE FROM nlp_intent_rules');
    
    // 4. 基于真实字段设计新的扩展规则
    console.log('\n📝 基于真实字段设计扩展的NLP规则...');
    
    const expandedRules = [
      // 库存相关规则
      {
        intent_name: '物料库存查询',
        description: '查询物料库存信息，显示真实前端库存页面字段',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  storage_location as 工厂,
  storage_location as 仓库,
  material_code as 物料编号,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory 
ORDER BY inbound_time DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["物料库存", "库存查询", "库存信息", "物料查询"]),
        synonyms: JSON.stringify({"库存": ["存货", "物料"], "查询": ["查找", "搜索"]}),
        example_query: '查询物料库存信息',
        priority: 10
      },
      
      {
        intent_name: '工厂库存统计',
        description: '按工厂统计库存分布情况',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  storage_location as 工厂,
  storage_location as 仓库,
  material_code as 物料编号,
  material_name as 物料名称,
  supplier_name as 供应商,
  SUM(quantity) as 数量,
  status as 状态,
  DATE_FORMAT(MAX(inbound_time), '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(DATE_ADD(MAX(inbound_time), INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  '' as 备注
FROM inventory 
GROUP BY storage_location, material_code, material_name, supplier_name, status
ORDER BY 数量 DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["工厂库存", "工厂统计", "厂区库存"]),
        synonyms: JSON.stringify({"工厂": ["厂区", "生产基地"], "统计": ["汇总", "分析"]}),
        example_query: '统计各工厂库存情况',
        priority: 9
      },
      
      // 测试相关规则
      {
        intent_name: '物料测试结果查询',
        description: '查询物料测试结果，显示真实前端测试页面字段',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(material_code, '未知') as 项目,
  COALESCE(batch_code, '未知') as 基线,
  material_code as 物料编号,
  batch_code as 批次,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '') as 不良描述
FROM lab_tests 
ORDER BY test_date DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["物料测试", "测试结果", "检测结果", "测试查询"]),
        synonyms: JSON.stringify({"测试": ["检测", "检验"], "结果": ["数据", "信息"]}),
        example_query: '查询物料测试结果',
        priority: 9
      },
      
      {
        intent_name: 'OK测试结果统计',
        description: '统计测试通过的物料信息',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(material_code, '未知') as 项目,
  COALESCE(batch_code, '未知') as 基线,
  material_code as 物料编号,
  batch_code as 批次,
  material_name as 物料名称,
  supplier_name as 供应商,
  'OK' as 测试结果,
  '' as 不良描述
FROM lab_tests 
WHERE test_result IN ('PASS', 'OK')
ORDER BY test_date DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["OK测试", "合格测试", "通过测试", "测试合格"]),
        synonyms: JSON.stringify({"OK": ["合格", "通过", "PASS"], "测试": ["检测", "检验"]}),
        example_query: '查询OK测试结果',
        priority: 8
      },
      
      {
        intent_name: 'NG测试结果统计',
        description: '统计测试失败的物料信息',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(material_code, '未知') as 项目,
  COALESCE(batch_code, '未知') as 基线,
  material_code as 物料编号,
  batch_code as 批次,
  material_name as 物料名称,
  supplier_name as 供应商,
  'NG' as 测试结果,
  COALESCE(defect_desc, '无描述') as 不良描述
FROM lab_tests 
WHERE test_result IN ('FAIL', 'NG')
ORDER BY test_date DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["NG测试", "不合格测试", "失败测试", "测试不合格"]),
        synonyms: JSON.stringify({"NG": ["不合格", "失败", "FAIL"], "测试": ["检测", "检验"]}),
        example_query: '查询NG测试结果',
        priority: 8
      },
      
      // 批次相关规则
      {
        intent_name: '批次信息查询',
        description: '查询批次详细信息，包含异常统计',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  batch_code as 批次号,
  material_code as 物料编号,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  '0' as 产线异常,
  (SELECT COUNT(*) FROM lab_tests WHERE lab_tests.batch_code = inventory.batch_code AND test_result IN ('FAIL', 'NG')) as 测试异常,
  COALESCE(notes, '') as 备注
FROM inventory 
ORDER BY inbound_time DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["批次信息", "批次查询", "批次管理", "批次详情"]),
        synonyms: JSON.stringify({"批次": ["批号", "batch"], "信息": ["详情", "数据"]}),
        example_query: '查询批次信息',
        priority: 8
      },
      
      // 供应商相关规则
      {
        intent_name: '供应商质量分析',
        description: '分析供应商的质量表现',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  supplier_name as 供应商,
  COUNT(DISTINCT material_code) as 物料种类,
  SUM(quantity) as 总数量,
  COUNT(DISTINCT batch_code) as 批次数量,
  (SELECT COUNT(*) FROM lab_tests WHERE lab_tests.supplier_name = inventory.supplier_name AND test_result IN ('PASS', 'OK')) as OK次数,
  (SELECT COUNT(*) FROM lab_tests WHERE lab_tests.supplier_name = inventory.supplier_name AND test_result IN ('FAIL', 'NG')) as NG次数,
  status as 状态,
  DATE_FORMAT(MAX(inbound_time), '%Y-%m-%d') as 最新入库时间,
  '' as 到期时间,
  '' as 备注
FROM inventory 
GROUP BY supplier_name, status
ORDER BY NG次数 DESC, OK次数 DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["供应商质量", "供应商分析", "供应商表现", "质量分析"]),
        synonyms: JSON.stringify({"供应商": ["厂商", "供货商"], "质量": ["品质", "性能"]}),
        example_query: '分析供应商质量表现',
        priority: 7
      },
      
      // 异常相关规则
      {
        intent_name: '异常统计分析',
        description: '统计各类异常情况',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  material_code as 物料编号,
  material_name as 物料名称,
  supplier_name as 供应商,
  batch_code as 批次,
  COUNT(*) as 异常次数,
  GROUP_CONCAT(DISTINCT defect_desc SEPARATOR '; ') as 异常描述,
  DATE_FORMAT(MAX(test_date), '%Y-%m-%d') as 最新异常日期,
  '' as 入库时间,
  '' as 到期时间,
  '' as 备注
FROM lab_tests 
WHERE test_result IN ('FAIL', 'NG') AND defect_desc IS NOT NULL
GROUP BY material_code, material_name, supplier_name, batch_code
ORDER BY 异常次数 DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["异常统计", "异常分析", "不良统计", "缺陷分析"]),
        synonyms: JSON.stringify({"异常": ["不良", "缺陷", "问题"], "统计": ["分析", "汇总"]}),
        example_query: '统计异常情况',
        priority: 7
      }
    ];
    
    // 5. 插入扩展规则
    console.log('\n➕ 插入扩展的NLP规则...');
    
    for (const rule of expandedRules) {
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
    
    // 6. 验证新规则
    console.log('\n🧪 验证新的扩展规则...');
    
    const [newRules] = await connection.execute(
      'SELECT intent_name, description FROM nlp_intent_rules ORDER BY priority DESC'
    );
    
    console.log(`\n共创建 ${newRules.length} 条扩展规则:`);
    newRules.forEach((rule, index) => {
      console.log(`${index + 1}. ${rule.intent_name} - ${rule.description}`);
    });
    
    console.log('\n🎉 基于真实前端字段的扩展NLP规则设计完成！');
    
  } catch (error) {
    console.error('❌ 分析失败:', error);
  } finally {
    await connection.end();
  }
}

analyzeRealFrontendFields().catch(console.error);
