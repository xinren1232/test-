/**
 * 扩展更多NLP规则
 * 基于真实前端字段设计更多实用规则
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function expandMoreRules() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🚀 扩展更多NLP规则...\n');
    
    // 更多实用的规则
    const additionalRules = [
      // 时间相关查询
      {
        intent_name: '今日入库物料',
        description: '查询今日入库的物料信息',
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
WHERE DATE(inbound_time) = CURDATE()
ORDER BY inbound_time DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["今日入库", "今天入库", "当日入库", "今日物料"]),
        synonyms: JSON.stringify({"今日": ["今天", "当日"], "入库": ["进库", "入仓"]}),
        example_query: '查询今日入库物料',
        priority: 9
      },
      
      {
        intent_name: '今日测试结果',
        description: '查询今日的测试结果',
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
WHERE DATE(test_date) = CURDATE()
ORDER BY test_date DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["今日测试", "今天测试", "当日测试", "今日检测"]),
        synonyms: JSON.stringify({"今日": ["今天", "当日"], "测试": ["检测", "检验"]}),
        example_query: '查询今日测试结果',
        priority: 9
      },
      
      // 状态相关查询
      {
        intent_name: '风险物料查询',
        description: '查询状态为风险的物料',
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
WHERE status = '风险'
ORDER BY inbound_time DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["风险物料", "风险库存", "危险物料", "风险状态"]),
        synonyms: JSON.stringify({"风险": ["危险", "异常"], "物料": ["材料", "库存"]}),
        example_query: '查询风险物料',
        priority: 8
      },
      
      {
        intent_name: '正常物料查询',
        description: '查询状态为正常的物料',
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
WHERE status = '正常'
ORDER BY inbound_time DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["正常物料", "正常库存", "合格物料", "正常状态"]),
        synonyms: JSON.stringify({"正常": ["合格", "良好"], "物料": ["材料", "库存"]}),
        example_query: '查询正常物料',
        priority: 7
      },
      
      // 物料类型查询
      {
        intent_name: '电池物料查询',
        description: '查询电池类型的物料',
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
WHERE material_name LIKE '%电池%'
ORDER BY inbound_time DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["电池物料", "电池库存", "电池查询", "电池材料"]),
        synonyms: JSON.stringify({"电池": ["battery"], "物料": ["材料", "库存"]}),
        example_query: '查询电池物料',
        priority: 6
      },
      
      {
        intent_name: '包装盒物料查询',
        description: '查询包装盒类型的物料',
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
WHERE material_name LIKE '%包装盒%'
ORDER BY inbound_time DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["包装盒物料", "包装盒库存", "包装盒查询", "包装材料"]),
        synonyms: JSON.stringify({"包装盒": ["包装", "盒子"], "物料": ["材料", "库存"]}),
        example_query: '查询包装盒物料',
        priority: 6
      },
      
      // 数量相关查询
      {
        intent_name: '低库存预警',
        description: '查询库存数量较低的物料',
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
WHERE quantity < 500
ORDER BY quantity ASC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["低库存", "库存不足", "库存预警", "缺货预警"]),
        synonyms: JSON.stringify({"低库存": ["库存不足", "缺货"], "预警": ["警告", "提醒"]}),
        example_query: '查询低库存预警',
        priority: 8
      },
      
      {
        intent_name: '高库存查询',
        description: '查询库存数量较高的物料',
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
WHERE quantity > 2000
ORDER BY quantity DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["高库存", "库存充足", "大量库存", "库存过多"]),
        synonyms: JSON.stringify({"高库存": ["库存充足", "大量库存"], "查询": ["搜索", "查找"]}),
        example_query: '查询高库存物料',
        priority: 6
      },
      
      // 测试结果统计
      {
        intent_name: '测试通过率统计',
        description: '统计测试通过率',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  material_name as 物料名称,
  supplier_name as 供应商,
  COUNT(*) as 总测试次数,
  SUM(CASE WHEN test_result IN ('PASS', 'OK') THEN 1 ELSE 0 END) as 通过次数,
  SUM(CASE WHEN test_result IN ('FAIL', 'NG') THEN 1 ELSE 0 END) as 失败次数,
  ROUND(SUM(CASE WHEN test_result IN ('PASS', 'OK') THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 通过率,
  DATE_FORMAT(MAX(test_date), '%Y-%m-%d') as 最新测试日期,
  '' as 入库时间,
  '' as 到期时间,
  '' as 备注
FROM lab_tests 
GROUP BY material_name, supplier_name
HAVING COUNT(*) >= 3
ORDER BY 通过率 ASC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["测试通过率", "通过率统计", "测试成功率", "合格率"]),
        synonyms: JSON.stringify({"通过率": ["成功率", "合格率"], "统计": ["分析", "汇总"]}),
        example_query: '统计测试通过率',
        priority: 7
      }
    ];
    
    // 插入新规则
    console.log('➕ 插入扩展规则...\n');
    
    for (const rule of additionalRules) {
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
    
    // 验证所有规则
    console.log('\n🧪 验证所有规则...\n');
    
    const [allRules] = await connection.execute(
      'SELECT intent_name, description, priority FROM nlp_intent_rules ORDER BY priority DESC'
    );
    
    console.log(`共有 ${allRules.length} 条规则:`);
    allRules.forEach((rule, index) => {
      console.log(`${index + 1}. [优先级${rule.priority}] ${rule.intent_name} - ${rule.description}`);
    });
    
    console.log('\n🎉 扩展规则完成！');
    
  } catch (error) {
    console.error('❌ 扩展失败:', error);
  } finally {
    await connection.end();
  }
}

expandMoreRules().catch(console.error);
