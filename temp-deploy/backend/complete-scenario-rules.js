import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 完整场景查询规则定义
const COMPLETE_SCENARIO_RULES = [
  
  // ===== 库存场景规则（4类）=====
  
  {
    intent_name: '批次库存信息查询',
    description: '按批次查询库存信息，展示完整字段',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  SUBSTRING_INDEX(storage_location, '-', 1) as 工厂,
  SUBSTRING_INDEX(storage_location, '-', -1) as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d %H:%i') as 入库时间,
  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory 
WHERE batch_code LIKE CONCAT('%', ?, '%')
ORDER BY inbound_time DESC
LIMIT 10`,
    parameters: JSON.stringify([
      { name: "batch_code", type: "string", description: "批次号" }
    ]),
    trigger_words: JSON.stringify(['批次库存', '批次查询', '批次信息']),
    synonyms: JSON.stringify({'批次': ['批号', 'batch'], '库存': ['存货', '仓储']}),
    example_query: '查询批次203252的库存信息',
    category: '库存查询',
    priority: 9
  },
  
  {
    intent_name: '库存状态查询_风险冻结物料',
    description: '查询风险和冻结状态的物料库存',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  SUBSTRING_INDEX(storage_location, '-', 1) as 工厂,
  SUBSTRING_INDEX(storage_location, '-', -1) as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d %H:%i') as 入库时间,
  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory 
WHERE status IN ('风险', '冻结', '异常', '待检')
ORDER BY inbound_time DESC
LIMIT 10`,
    parameters: JSON.stringify([]),
    trigger_words: JSON.stringify(['风险物料', '冻结物料', '异常库存', '待检物料']),
    synonyms: JSON.stringify({'风险': ['异常', '待检'], '冻结': ['锁定', '暂停']}),
    example_query: '查询风险和冻结物料',
    category: '库存查询',
    priority: 9
  },
  
  // ===== 上线数据查询规则（5类）=====
  
  {
    intent_name: '供应商上线情况查询',
    description: '按供应商查询上线情况，展示完整字段',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  factory as 工厂,
  project as 基线,
  project as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  batch_code as 批次号,
  CONCAT(ROUND(defect_rate * 100, 2), '%') as 不良率,
  exception_count as 本周异常,
  DATE_FORMAT(inspection_date, '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking 
WHERE supplier_name LIKE CONCAT('%', ?, '%')
ORDER BY inspection_date DESC
LIMIT 10`,
    parameters: JSON.stringify([
      { name: "supplier_name", type: "string", description: "供应商名称" }
    ]),
    trigger_words: JSON.stringify(['供应商上线', '供应商跟踪', '供应商生产']),
    synonyms: JSON.stringify({'供应商': ['厂商', '供货商'], '上线': ['在线', '生产']}),
    example_query: '查询深圳电池厂的上线情况',
    category: '上线跟踪',
    priority: 9
  },
  
  {
    intent_name: '项目物料不良查询',
    description: '按项目查询物料不良情况',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  factory as 工厂,
  project as 基线,
  project as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  batch_code as 批次号,
  CONCAT(ROUND(defect_rate * 100, 2), '%') as 不良率,
  exception_count as 本周异常,
  DATE_FORMAT(inspection_date, '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking 
WHERE project LIKE CONCAT('%', ?, '%') AND defect_rate > 0
ORDER BY defect_rate DESC, inspection_date DESC
LIMIT 10`,
    parameters: JSON.stringify([
      { name: "project", type: "string", description: "项目名称" }
    ]),
    trigger_words: JSON.stringify(['项目不良', '项目缺陷', '项目异常']),
    synonyms: JSON.stringify({'项目': ['工程', 'project'], '不良': ['缺陷', '异常']}),
    example_query: '查询项目A的物料不良情况',
    category: '上线跟踪',
    priority: 9
  },
  
  {
    intent_name: '基线物料不良查询',
    description: '按基线查询物料不良情况',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  factory as 工厂,
  project as 基线,
  project as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  batch_code as 批次号,
  CONCAT(ROUND(defect_rate * 100, 2), '%') as 不良率,
  exception_count as 本周异常,
  DATE_FORMAT(inspection_date, '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking 
WHERE project LIKE CONCAT('%', ?, '%') AND defect_rate > 0
ORDER BY defect_rate DESC, inspection_date DESC
LIMIT 10`,
    parameters: JSON.stringify([
      { name: "baseline", type: "string", description: "基线名称" }
    ]),
    trigger_words: JSON.stringify(['基线不良', '基线缺陷', '基线异常']),
    synonyms: JSON.stringify({'基线': ['baseline', '基准'], '不良': ['缺陷', '异常']}),
    example_query: '查询基线B的物料不良情况',
    category: '上线跟踪',
    priority: 9
  },
  
  // ===== 测试查询规则（6类）=====
  
  {
    intent_name: '供应商测试情况查询',
    description: '按供应商查询测试情况，展示完整字段',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(project_id, '未指定') as 项目,
  COALESCE(baseline_id, '未指定') as 基线,
  material_code as 物料编码,
  COUNT(*) OVER (PARTITION BY material_name, supplier_name) as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(conclusion, '') as 备注
FROM lab_tests 
WHERE supplier_name LIKE CONCAT('%', ?, '%')
ORDER BY test_date DESC
LIMIT 10`,
    parameters: JSON.stringify([
      { name: "supplier_name", type: "string", description: "供应商名称" }
    ]),
    trigger_words: JSON.stringify(['供应商测试', '供应商检测', '供应商质量']),
    synonyms: JSON.stringify({'供应商': ['厂商', '供货商'], '测试': ['检测', '检验']}),
    example_query: '查询深圳电池厂的测试情况',
    category: '测试查询',
    priority: 9
  },
  
  {
    intent_name: '项目测试情况查询',
    description: '按项目查询测试情况',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(project_id, '未指定') as 项目,
  COALESCE(baseline_id, '未指定') as 基线,
  material_code as 物料编码,
  COUNT(*) OVER (PARTITION BY material_name, supplier_name) as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(conclusion, '') as 备注
FROM lab_tests 
WHERE project_id LIKE CONCAT('%', ?, '%')
ORDER BY test_date DESC
LIMIT 10`,
    parameters: JSON.stringify([
      { name: "project_id", type: "string", description: "项目ID" }
    ]),
    trigger_words: JSON.stringify(['项目测试', '项目检测', '项目质量']),
    synonyms: JSON.stringify({'项目': ['工程', 'project'], '测试': ['检测', '检验']}),
    example_query: '查询项目A的测试情况',
    category: '测试查询',
    priority: 9
  },
  
  {
    intent_name: '基线测试情况查询',
    description: '按基线查询测试情况',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(project_id, '未指定') as 项目,
  COALESCE(baseline_id, '未指定') as 基线,
  material_code as 物料编码,
  COUNT(*) OVER (PARTITION BY material_name, supplier_name) as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(conclusion, '') as 备注
FROM lab_tests 
WHERE baseline_id LIKE CONCAT('%', ?, '%')
ORDER BY test_date DESC
LIMIT 10`,
    parameters: JSON.stringify([
      { name: "baseline_id", type: "string", description: "基线ID" }
    ]),
    trigger_words: JSON.stringify(['基线测试', '基线检测', '基线质量']),
    synonyms: JSON.stringify({'基线': ['baseline', '基准'], '测试': ['检测', '检验']}),
    example_query: '查询基线B的测试情况',
    category: '测试查询',
    priority: 9
  },
  
  {
    intent_name: '批次测试情况查询',
    description: '按批次查询测试情况',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(project_id, '未指定') as 项目,
  COALESCE(baseline_id, '未指定') as 基线,
  material_code as 物料编码,
  COUNT(*) OVER (PARTITION BY material_name, supplier_name) as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(conclusion, '') as 备注
FROM lab_tests 
WHERE batch_code LIKE CONCAT('%', ?, '%')
ORDER BY test_date DESC
LIMIT 10`,
    parameters: JSON.stringify([
      { name: "batch_code", type: "string", description: "批次号" }
    ]),
    trigger_words: JSON.stringify(['批次测试', '批次检测', '批次质量']),
    synonyms: JSON.stringify({'批次': ['批号', 'batch'], '测试': ['检测', '检验']}),
    example_query: '查询批次203252的测试情况',
    category: '测试查询',
    priority: 9
  }
];

async function addCompleteScenarioRules() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔄 开始添加完整场景查询规则...\n');
    
    // 检查当前规则数量
    const [currentRules] = await connection.execute(
      'SELECT COUNT(*) as count FROM nlp_intent_rules'
    );
    console.log(`当前规则数量: ${currentRules[0].count}条`);
    
    // 插入完整场景规则
    console.log('\n🚀 插入完整场景规则...');
    
    for (const rule of COMPLETE_SCENARIO_RULES) {
      // 检查是否已存在同名规则
      const [existing] = await connection.execute(
        'SELECT id FROM nlp_intent_rules WHERE intent_name = ?',
        [rule.intent_name]
      );
      
      if (existing.length > 0) {
        // 更新现有规则
        await connection.execute(`
          UPDATE nlp_intent_rules SET
            description = ?,
            action_type = ?,
            action_target = ?,
            parameters = ?,
            trigger_words = ?,
            synonyms = ?,
            example_query = ?,
            category = ?,
            priority = ?,
            status = 'active',
            updated_at = NOW()
          WHERE intent_name = ?
        `, [
          rule.description,
          rule.action_type,
          rule.action_target,
          rule.parameters,
          rule.trigger_words,
          rule.synonyms,
          rule.example_query,
          rule.category,
          rule.priority,
          rule.intent_name
        ]);
        console.log(`✅ 更新规则: ${rule.intent_name}`);
      } else {
        // 插入新规则
        await connection.execute(`
          INSERT INTO nlp_intent_rules (
            intent_name, description, action_type, action_target,
            parameters, trigger_words, synonyms, example_query,
            category, priority, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
        `, [
          rule.intent_name,
          rule.description,
          rule.action_type,
          rule.action_target,
          rule.parameters,
          rule.trigger_words,
          rule.synonyms,
          rule.example_query,
          rule.category,
          rule.priority
        ]);
        console.log(`✅ 新增规则: ${rule.intent_name}`);
      }
    }
    
    // 验证创建结果
    console.log('\n📊 验证创建结果...');
    const [updatedRules] = await connection.execute(
      'SELECT COUNT(*) as count FROM nlp_intent_rules WHERE status = "active"'
    );
    console.log(`活跃规则数量: ${updatedRules[0].count}条`);
    
    // 按类别显示规则统计
    const [categoryStats] = await connection.execute(`
      SELECT category, COUNT(*) as count 
      FROM nlp_intent_rules 
      WHERE status = 'active'
      GROUP BY category
      ORDER BY count DESC
    `);
    
    console.log('\n📊 规则分类统计:');
    categoryStats.forEach((stat, index) => {
      console.log(`${index + 1}. ${stat.category}: ${stat.count}条`);
    });
    
    console.log('\n✅ 完整场景规则创建完成！');
    console.log('📝 已补充库存、上线、测试的完整场景查询规则');
    
  } catch (error) {
    console.error('❌ 创建失败:', error);
  } finally {
    await connection.end();
  }
}

addCompleteScenarioRules().catch(console.error);
