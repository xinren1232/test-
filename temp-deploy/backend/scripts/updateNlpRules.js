import initializeDatabase from '../src/models/index.js';

const newRules = [
  // 库存查询
  {
    intent_name: '查询库存,查库存',
    description: '根据物料编码或名称查询库存信息',
    action_type: 'SQL_QUERY',
    action_target: "SELECT batch_code, material_name, quantity, status, storage_location, risk_level FROM inventory WHERE material_code = :identifier OR material_name = :identifier",
    parameters: JSON.stringify([{ name: "identifier", type: "string", description: "物料编码或名称" }]),
    example_query: '查询物料 M12345 的库存'
  },
  {
    intent_name: '查询供应商库存',
    description: '根据供应商名称查询其供应的物料库存',
    action_type: 'SQL_QUERY',
    action_target: "SELECT batch_code, material_name, quantity, status FROM inventory WHERE supplier_name LIKE :supplier",
    parameters: JSON.stringify([{ name: "supplier", type: "string", description: "供应商名称" }]),
    example_query: '欣旺达的库存有哪些？'
  },
  {
    intent_name: '高风险库存',
    description: '查询所有风险等级为高的库存',
    action_type: 'SQL_QUERY',
    action_target: "SELECT batch_code, material_name, supplier_name, quantity FROM inventory WHERE risk_level = 'high'",
    parameters: JSON.stringify([]),
    example_query: '目前有哪些高风险库存？'
  },

  // 测试结果查询
  {
    intent_name: '查询测试结果,查测试',
    description: '根据批次号查询测试结果',
    action_type: 'SQL_QUERY',
    action_target: "SELECT test_item, test_result, conclusion, defect_desc FROM lab_tests WHERE batch_code = :batch_code",
    parameters: JSON.stringify([{ name: "batch_code", type: "string", description: "批次号" }]),
    example_query: '查询批号 BATCH-001 的测试结果'
  },
  {
    intent_name: '查询不良品,查NG',
    description: '查询所有测试结果为NG的记录',
    action_type: 'SQL_QUERY',
    action_target: "SELECT batch_code, material_name, test_item, defect_desc FROM lab_tests WHERE test_result = 'NG'",
    parameters: JSON.stringify([]),
    example_query: '最近有哪些不良品？'
  },
  {
    intent_name: '查询物料合格率',
    description: '根据物料编码查询其测试合格率',
    action_type: 'SQL_QUERY',
    action_target: "SELECT material_code, COUNT(*) as total, SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) as passed FROM lab_tests WHERE material_code = :material_code GROUP BY material_code",
    parameters: JSON.stringify([{ name: "material_code", type: "string", description: "物料编码" }]),
    example_query: '物料 M12345 的合格率怎么样？'
  },

  // 产线跟踪查询
  {
    intent_name: '查询上线情况',
    description: '根据批次号查询其在产线上的使用情况',
    action_type: 'SQL_QUERY',
    action_target: "SELECT factory, workshop, line, project, defect_rate, exception_count FROM online_tracking WHERE batch_code = :batch_code",
    parameters: JSON.stringify([{ name: "batch_code", type: "string", description: "批次号" }]),
    example_query: '批号 BATCH-003 在哪条产线用了？'
  },
  {
    intent_name: '查询项目不良率',
    description: '查询特定项目相关物料的平均不良率',
    action_type: 'SQL_QUERY',
    action_target: "SELECT project, AVG(defect_rate) as avg_defect_rate FROM online_tracking WHERE project LIKE :project GROUP BY project",
    parameters: JSON.stringify([{ name: "project", type: "string", description: "项目名称" }]),
    example_query: 'P001项目的不良率如何？'
  },

  // 导航意图
  {
    intent_name: '打开库存页面,去库存',
    description: '导航到库存管理页面',
    action_type: 'NAVIGATE',
    action_target: '/inventory',
    parameters: JSON.stringify([]),
    example_query: '带我去看库存'
  },
    {
    intent_name: '打开批次管理,看批次',
    description: '导航到批次管理页面',
    action_type: 'NAVIGATE',
    action_target: '/batch',
    parameters: JSON.stringify([]),
    example_query: '打开批次管理页面'
  }
];

async function updateNlpRules() {
  // 确保数据库和模型已经初始化，并接收返回的db对象
  const db = await initializeDatabase();
  const { NlpIntentRule } = db;

  try {
    // 1. 清空现有规则
    await NlpIntentRule.destroy({ where: {}, truncate: true });
    console.log('Successfully cleared old NLP intent rules.');

    // 2. 插入新规则
    await NlpIntentRule.bulkCreate(newRules);
    console.log(`Successfully inserted ${newRules.length} new NLP intent rules.`);

  } catch (error) {
    console.error('Error updating NLP intent rules:', error);
  } finally {
    await db.sequelize.close();
  }
}

updateNlpRules(); 