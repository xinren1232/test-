/**
 * 基于真实数据特点重新设计完整的NLP规则库
 * 数据特点：
 * - 库存：264条记录，21个供应商，15种物料，4个工厂，52个风险项
 * - 测试：396条记录，9个项目，3个基线，40个失败，356个通过
 * - 上线：1056条记录，4个工厂，平均不良率2.44%，最高9.99%
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 基础规则 - 按用户思路设计
const BASIC_RULES = [
  // 1. 库存类基础规则 (4个)
  {
    intent_name: '物料库存查询',
    description: '查询物料库存基本信息，显示工厂、仓库、物料类型等',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  storage_location as 工厂,
  storage_location as 仓库,
  material_type as 物料类型,
  supplier_name as 供应商名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory 
ORDER BY inbound_time DESC
LIMIT 10`,
    trigger_words: ["物料库存", "库存查询", "库存信息", "查库存"],
    example_query: '查询物料库存情况'
  },
  
  {
    intent_name: '供应商库存查询',
    description: '按供应商查询库存分布情况，基于21个真实供应商数据',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  supplier_name as 供应商,
  COUNT(*) as 库存批次数,
  SUM(quantity) as 总数量,
  COUNT(CASE WHEN status LIKE '%风险%' THEN 1 END) as 风险批次,
  GROUP_CONCAT(DISTINCT material_name ORDER BY material_name SEPARATOR ', ') as 物料类型,
  AVG(quantity) as 平均数量
FROM inventory 
GROUP BY supplier_name 
ORDER BY 总数量 DESC
LIMIT 10`,
    trigger_words: ["供应商库存", "供应商查询", "供应商分布"],
    example_query: '查询各供应商的库存情况'
  },
  
  {
    intent_name: '批次库存信息查询',
    description: '查询特定批次的库存详细信息',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  batch_code as 批次号,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  storage_location as 工厂,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  COALESCE(notes, '') as 备注
FROM inventory 
ORDER BY inbound_time DESC
LIMIT 10`,
    trigger_words: ["批次库存", "批次查询", "批次信息"],
    example_query: '查询批次库存信息'
  },
  
  {
    intent_name: '库存状态查询',
    description: '查询风险、冻结等异常状态的库存物料，基于52个风险项',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  material_name as 物料名称,
  supplier_name as 供应商,
  batch_code as 批次号,
  quantity as 数量,
  status as 状态,
  storage_location as 工厂,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  COALESCE(notes, '') as 备注
FROM inventory 
WHERE status LIKE '%风险%' OR status LIKE '%冻结%' OR risk_level = 'high'
ORDER BY inbound_time DESC
LIMIT 10`,
    trigger_words: ["风险库存", "异常库存", "冻结物料", "库存状态"],
    example_query: '查询风险状态的库存'
  },
  
  // 2. 上线数据类基础规则 (5个)
  {
    intent_name: '物料上线情况查询',
    description: '查询物料上线基本情况，基于1056条上线记录',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  factory as 工厂,
  project as 项目,
  material_name as 物料名称,
  supplier_name as 供应商,
  CONCAT(ROUND(defect_rate * 100, 2), '%') as 不良率,
  exception_count as 异常次数,
  DATE_FORMAT(online_date, '%Y-%m-%d') as 上线日期,
  operator as 操作员
FROM online_tracking 
ORDER BY online_date DESC
LIMIT 10`,
    trigger_words: ["物料上线", "上线情况", "上线查询"],
    example_query: '查询物料上线情况'
  },
  
  {
    intent_name: '供应商上线情况查询',
    description: '按供应商统计上线质量表现',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  supplier_name as 供应商,
  COUNT(*) as 上线次数,
  AVG(defect_rate) * 100 as 平均不良率,
  MAX(defect_rate) * 100 as 最高不良率,
  SUM(exception_count) as 总异常次数,
  COUNT(DISTINCT material_name) as 物料种类数
FROM online_tracking 
GROUP BY supplier_name 
ORDER BY 平均不良率 DESC
LIMIT 10`,
    trigger_words: ["供应商上线", "供应商质量", "供应商表现"],
    example_query: '查询各供应商上线质量表现'
  },
  
  {
    intent_name: '批次上线情况查询',
    description: '查询特定批次的上线跟踪情况',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  batch_code as 批次号,
  material_name as 物料名称,
  supplier_name as 供应商,
  factory as 工厂,
  CONCAT(ROUND(defect_rate * 100, 2), '%') as 不良率,
  exception_count as 异常次数,
  DATE_FORMAT(online_date, '%Y-%m-%d') as 上线日期
FROM online_tracking 
ORDER BY defect_rate DESC
LIMIT 10`,
    trigger_words: ["批次上线", "批次跟踪", "批次质量"],
    example_query: '查询批次上线情况'
  },
  
  {
    intent_name: '项目物料不良查询',
    description: '按项目查询物料不良情况，基于9个真实项目',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  project as 项目,
  material_name as 物料名称,
  supplier_name as 供应商,
  COUNT(*) as 上线次数,
  AVG(defect_rate) * 100 as 平均不良率,
  MAX(defect_rate) * 100 as 最高不良率,
  SUM(exception_count) as 异常总数
FROM online_tracking 
WHERE defect_rate > 0.02
GROUP BY project, material_name, supplier_name
ORDER BY 平均不良率 DESC
LIMIT 10`,
    trigger_words: ["项目不良", "项目质量", "项目物料"],
    example_query: '查询项目物料不良情况'
  },
  
  {
    intent_name: '基线物料不良查询',
    description: '按基线查询物料不良情况，基于3个真实基线',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  l.baseline_id as 基线,
  l.material_name as 物料名称,
  l.supplier_name as 供应商,
  COUNT(CASE WHEN l.test_result = 'FAIL' THEN 1 END) as 测试失败次数,
  COUNT(*) as 总测试次数,
  ROUND(COUNT(CASE WHEN l.test_result = 'FAIL' THEN 1 END) * 100.0 / COUNT(*), 2) as 失败率
FROM lab_tests l
GROUP BY l.baseline_id, l.material_name, l.supplier_name
HAVING 失败率 > 0
ORDER BY 失败率 DESC
LIMIT 10`,
    trigger_words: ["基线不良", "基线质量", "基线物料"],
    example_query: '查询基线物料不良情况'
  },

  // 3. 测试类基础规则 (6个)
  {
    intent_name: '物料测试情况查询',
    description: '查询物料测试基本情况，基于396条测试记录',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  project_id as 项目,
  baseline_id as 基线,
  material_name as 物料类型,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(notes, '') as 备注
FROM lab_tests
ORDER BY test_date DESC
LIMIT 10`,
    trigger_words: ["物料测试", "测试情况", "测试查询"],
    example_query: '查询物料测试情况'
  },

  {
    intent_name: '供应商测试情况查询',
    description: '按供应商统计测试质量表现',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT
  supplier_name as 供应商,
  COUNT(*) as 总测试次数,
  COUNT(CASE WHEN test_result = 'PASS' THEN 1 END) as 通过次数,
  COUNT(CASE WHEN test_result = 'FAIL' THEN 1 END) as 失败次数,
  ROUND(COUNT(CASE WHEN test_result = 'PASS' THEN 1 END) * 100.0 / COUNT(*), 2) as 通过率,
  COUNT(DISTINCT material_name) as 测试物料种类
FROM lab_tests
GROUP BY supplier_name
ORDER BY 通过率 ASC
LIMIT 10`,
    trigger_words: ["供应商测试", "供应商质量测试", "供应商表现"],
    example_query: '查询各供应商测试表现'
  },

  {
    intent_name: '测试NG情况查询',
    description: '查询测试失败(NG)记录，基于40个失败案例',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  project_id as 项目,
  baseline_id as 基线,
  material_name as 物料类型,
  supplier_name as 供应商,
  defect_desc as 不合格描述,
  COALESCE(notes, '') as 备注
FROM lab_tests
WHERE test_result = 'FAIL'
ORDER BY test_date DESC
LIMIT 10`,
    trigger_words: ["测试NG", "测试失败", "不合格测试", "NG查询"],
    example_query: '查询测试NG情况'
  },

  {
    intent_name: '项目测试情况查询',
    description: '按项目查询测试情况，基于9个真实项目',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT
  project_id as 项目,
  COUNT(*) as 总测试次数,
  COUNT(CASE WHEN test_result = 'PASS' THEN 1 END) as 通过次数,
  COUNT(CASE WHEN test_result = 'FAIL' THEN 1 END) as 失败次数,
  ROUND(COUNT(CASE WHEN test_result = 'PASS' THEN 1 END) * 100.0 / COUNT(*), 2) as 通过率,
  COUNT(DISTINCT material_name) as 涉及物料数,
  COUNT(DISTINCT supplier_name) as 涉及供应商数
FROM lab_tests
GROUP BY project_id
ORDER BY 总测试次数 DESC
LIMIT 10`,
    trigger_words: ["项目测试", "项目质量", "项目检测"],
    example_query: '查询各项目测试情况'
  },

  {
    intent_name: '基线测试情况查询',
    description: '按基线查询测试情况，基于3个真实基线',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT
  baseline_id as 基线,
  COUNT(*) as 总测试次数,
  COUNT(CASE WHEN test_result = 'PASS' THEN 1 END) as 通过次数,
  COUNT(CASE WHEN test_result = 'FAIL' THEN 1 END) as 失败次数,
  ROUND(COUNT(CASE WHEN test_result = 'PASS' THEN 1 END) * 100.0 / COUNT(*), 2) as 通过率,
  COUNT(DISTINCT project_id) as 关联项目数
FROM lab_tests
GROUP BY baseline_id
ORDER BY 总测试次数 DESC`,
    trigger_words: ["基线测试", "基线质量", "基线检测"],
    example_query: '查询各基线测试情况'
  },

  {
    intent_name: '批次测试情况查询',
    description: '查询特定批次的测试跟踪情况',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT
  batch_code as 批次号,
  material_name as 物料名称,
  supplier_name as 供应商,
  COUNT(*) as 测试次数,
  COUNT(CASE WHEN test_result = 'PASS' THEN 1 END) as 通过次数,
  COUNT(CASE WHEN test_result = 'FAIL' THEN 1 END) as 失败次数,
  ROUND(COUNT(CASE WHEN test_result = 'PASS' THEN 1 END) * 100.0 / COUNT(*), 2) as 通过率,
  GROUP_CONCAT(DISTINCT CASE WHEN test_result = 'FAIL' THEN defect_desc END SEPARATOR '; ') as 不合格描述
FROM lab_tests
GROUP BY batch_code, material_name, supplier_name
ORDER BY 测试次数 DESC
LIMIT 10`,
    trigger_words: ["批次测试", "批次检测", "批次质量"],
    example_query: '查询批次测试情况'
  }
];

// 进阶规则 - 按用户思路设计
const ADVANCED_RULES = [
  // 1. 批次信息查询（整合库存、上线和测试）
  {
    intent_name: '批次信息查询',
    description: '整合批次的库存、上线和测试信息，按批次管理页面数据设计呈现',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT
  i.batch_code as 批次号,
  i.material_code as 物料编码,
  i.material_name as 物料名称,
  i.supplier_name as 供应商,
  i.quantity as 数量,
  DATE_FORMAT(i.inbound_time, '%Y-%m-%d') as 入库日期,
  COUNT(DISTINCT o.id) as 产线异常,
  COUNT(CASE WHEN l.test_result = 'FAIL' THEN 1 END) as 测试异常,
  CONCAT(
    COUNT(CASE WHEN l.test_result = 'PASS' THEN 1 END), '次OK',
    CASE WHEN COUNT(CASE WHEN l.test_result = 'FAIL' THEN 1 END) > 0
         THEN CONCAT(', ', COUNT(CASE WHEN l.test_result = 'FAIL' THEN 1 END), '次NG')
         ELSE ''
    END
  ) as 测试结果统计
FROM inventory i
LEFT JOIN lab_tests l ON i.batch_code = l.batch_code
LEFT JOIN online_tracking o ON i.batch_code = o.batch_code AND o.exception_count > 0
GROUP BY i.batch_code, i.material_code, i.material_name, i.supplier_name, i.quantity, i.inbound_time
ORDER BY i.inbound_time DESC
LIMIT 10`,
    trigger_words: ["批次信息", "批次管理", "批次详情", "批次查询"],
    example_query: '查询批次完整信息'
  },

  // 2. 物料上线Top不良
  {
    intent_name: '物料上线Top不良',
    description: '统计物料上线不良率排行，基于真实不良率数据',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT
  material_name as 物料名称,
  supplier_name as 供应商,
  COUNT(*) as 上线次数,
  AVG(defect_rate) * 100 as 平均不良率,
  MAX(defect_rate) * 100 as 最高不良率,
  SUM(exception_count) as 总异常次数,
  COUNT(DISTINCT factory) as 涉及工厂数,
  RANK() OVER (ORDER BY AVG(defect_rate) DESC) as 不良率排名
FROM online_tracking
WHERE defect_rate > 0
GROUP BY material_name, supplier_name
ORDER BY 平均不良率 DESC
LIMIT 10`,
    trigger_words: ["上线不良排行", "物料不良Top", "上线质量排名", "不良率排行"],
    example_query: '查询物料上线不良率排行'
  },

  // 3. 物料测试Top不良
  {
    intent_name: '物料测试Top不良',
    description: '统计物料测试失败率排行，基于真实测试数据',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT
  material_name as 物料名称,
  supplier_name as 供应商,
  COUNT(*) as 总测试次数,
  COUNT(CASE WHEN test_result = 'FAIL' THEN 1 END) as 失败次数,
  ROUND(COUNT(CASE WHEN test_result = 'FAIL' THEN 1 END) * 100.0 / COUNT(*), 2) as 失败率,
  COUNT(DISTINCT project_id) as 涉及项目数,
  GROUP_CONCAT(DISTINCT CASE WHEN test_result = 'FAIL' THEN defect_desc END SEPARATOR '; ') as 主要不合格原因,
  RANK() OVER (ORDER BY COUNT(CASE WHEN test_result = 'FAIL' THEN 1 END) * 100.0 / COUNT(*) DESC) as 失败率排名
FROM lab_tests
GROUP BY material_name, supplier_name
HAVING 总测试次数 >= 3
ORDER BY 失败率 DESC
LIMIT 10`,
    trigger_words: ["测试不良排行", "物料测试Top", "测试失败排名", "测试质量排行"],
    example_query: '查询物料测试不良率排行'
  }
];

async function createCompleteRules() {
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔧 开始创建完整规则库...');

    // 合并所有规则
    const ALL_RULES = [...BASIC_RULES, ...ADVANCED_RULES];

    // 清理现有规则
    await connection.execute(`
      DELETE FROM nlp_intent_rules
      WHERE intent_name IN (${ALL_RULES.map(() => '?').join(',')})
    `, ALL_RULES.map(r => r.intent_name));

    console.log('🗑️ 已清理现有规则');

    // 插入基础规则
    console.log('\n📋 创建基础规则...');
    for (const rule of BASIC_RULES) {
      await connection.execute(`
        INSERT INTO nlp_intent_rules (
          intent_name, description, action_type, action_target,
          parameters, trigger_words, synonyms, example_query, priority, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        rule.intent_name,
        rule.description,
        rule.action_type,
        rule.action_target,
        JSON.stringify([]),
        JSON.stringify(rule.trigger_words),
        JSON.stringify({}),
        rule.example_query,
        10
      ]);

      console.log(`✅ 基础规则: ${rule.intent_name}`);
    }

    // 插入进阶规则
    console.log('\n🚀 创建进阶规则...');
    for (const rule of ADVANCED_RULES) {
      await connection.execute(`
        INSERT INTO nlp_intent_rules (
          intent_name, description, action_type, action_target,
          parameters, trigger_words, synonyms, example_query, priority, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        rule.intent_name,
        rule.description,
        rule.action_type,
        rule.action_target,
        JSON.stringify([]),
        JSON.stringify(rule.trigger_words),
        JSON.stringify({}),
        rule.example_query,
        20
      ]);

      console.log(`✅ 进阶规则: ${rule.intent_name}`);
    }

    // 验证创建结果
    console.log('\n🧪 验证规则创建结果...');
    const [ruleCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM nlp_intent_rules WHERE intent_name IN (' +
      ALL_RULES.map(() => '?').join(',') + ')',
      ALL_RULES.map(r => r.intent_name)
    );

    console.log(`\n🎯 规则库创建完成！`);
    console.log(`📊 基础规则: ${BASIC_RULES.length} 个`);
    console.log(`🚀 进阶规则: ${ADVANCED_RULES.length} 个`);
    console.log(`📈 总计规则: ${ruleCount[0].count} 个`);

    // 测试几个关键规则
    console.log('\n🔍 测试关键规则...');

    // 测试批次信息查询
    const batchRule = ADVANCED_RULES.find(r => r.intent_name === '批次信息查询');
    if (batchRule) {
      try {
        const [results] = await connection.execute(batchRule.action_target);
        console.log(`✅ 批次信息查询测试成功，返回 ${results.length} 条记录`);
      } catch (error) {
        console.log(`❌ 批次信息查询测试失败: ${error.message}`);
      }
    }

    // 测试物料上线Top不良
    const topDefectRule = ADVANCED_RULES.find(r => r.intent_name === '物料上线Top不良');
    if (topDefectRule) {
      try {
        const [results] = await connection.execute(topDefectRule.action_target);
        console.log(`✅ 物料上线Top不良测试成功，返回 ${results.length} 条记录`);
      } catch (error) {
        console.log(`❌ 物料上线Top不良测试失败: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ 创建规则时出现错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createCompleteRules();
