import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 优化后的规则模板 - 基于真实数据字段设计
const OPTIMIZED_RULES = [
  
  // ===== 库存场景规则 - 完整字段展示 =====
  
  {
    intent_name: '物料库存信息查询_优化',
    description: '查询物料库存信息，展示库存页面所有字段',
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
WHERE material_name LIKE CONCAT('%', COALESCE(?, ''), '%')
   OR material_code LIKE CONCAT('%', COALESCE(?, ''), '%')
   OR supplier_name LIKE CONCAT('%', COALESCE(?, ''), '%')
ORDER BY inbound_time DESC
LIMIT 10`,
    parameters: JSON.stringify([
      { name: "material_name", type: "string", description: "物料名称" },
      { name: "material_code", type: "string", description: "物料编码" },
      { name: "supplier_name", type: "string", description: "供应商名称" }
    ]),
    trigger_words: JSON.stringify(["物料库存", "库存查询", "库存信息", "查库存"]),
    synonyms: JSON.stringify({"库存": ["存货", "仓储"], "物料": ["材料", "零件"]}),
    example_query: '查询物料库存信息',
    category: '库存查询',
    priority: 10
  },
  
  {
    intent_name: '供应商库存查询_优化',
    description: '按供应商查询库存信息，展示完整字段',
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
WHERE supplier_name LIKE CONCAT('%', ?, '%')
ORDER BY inbound_time DESC
LIMIT 10`,
    parameters: JSON.stringify([
      { name: "supplier_name", type: "string", description: "供应商名称" }
    ]),
    trigger_words: JSON.stringify(["供应商库存", "供应商查询", "供应商物料"]),
    synonyms: JSON.stringify({"供应商": ["厂商", "供货商"], "库存": ["存货", "仓储"]}),
    example_query: '查询深圳电池厂的库存',
    category: '库存查询',
    priority: 9
  },
  
  // ===== 上线跟踪场景规则 - 完整字段展示 =====
  
  {
    intent_name: '物料上线跟踪查询_优化',
    description: '查询物料上线跟踪信息，展示上线页面所有字段',
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
WHERE material_name LIKE CONCAT('%', COALESCE(?, ''), '%')
   OR material_code LIKE CONCAT('%', COALESCE(?, ''), '%')
   OR supplier_name LIKE CONCAT('%', COALESCE(?, ''), '%')
ORDER BY inspection_date DESC
LIMIT 10`,
    parameters: JSON.stringify([
      { name: "material_name", type: "string", description: "物料名称" },
      { name: "material_code", type: "string", description: "物料编码" },
      { name: "supplier_name", type: "string", description: "供应商名称" }
    ]),
    trigger_words: JSON.stringify(["上线跟踪", "上线查询", "在线跟踪", "物料上线"]),
    synonyms: JSON.stringify({"上线": ["在线", "生产"], "跟踪": ["追踪", "监控"]}),
    example_query: '查询物料上线跟踪情况',
    category: '上线跟踪',
    priority: 10
  },
  
  {
    intent_name: '批次上线情况查询_优化',
    description: '按批次查询上线情况，展示完整字段',
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
WHERE batch_code LIKE CONCAT('%', ?, '%')
ORDER BY inspection_date DESC
LIMIT 10`,
    parameters: JSON.stringify([
      { name: "batch_code", type: "string", description: "批次号" }
    ]),
    trigger_words: JSON.stringify(["批次上线", "批次跟踪", "批次查询"]),
    synonyms: JSON.stringify({"批次": ["批号", "batch"], "上线": ["在线", "生产"]}),
    example_query: '查询批次203252的上线情况',
    category: '上线跟踪',
    priority: 9
  },
  
  // ===== 测试场景规则 - 完整字段展示 =====
  
  {
    intent_name: '物料测试结果查询_优化',
    description: '查询物料测试结果，展示测试页面所有字段',
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
WHERE material_name LIKE CONCAT('%', COALESCE(?, ''), '%')
   OR material_code LIKE CONCAT('%', COALESCE(?, ''), '%')
   OR supplier_name LIKE CONCAT('%', COALESCE(?, ''), '%')
ORDER BY test_date DESC
LIMIT 10`,
    parameters: JSON.stringify([
      { name: "material_name", type: "string", description: "物料名称" },
      { name: "material_code", type: "string", description: "物料编码" },
      { name: "supplier_name", type: "string", description: "供应商名称" }
    ]),
    trigger_words: JSON.stringify(["测试结果", "测试查询", "检测结果", "物料测试"]),
    synonyms: JSON.stringify({"测试": ["检测", "检验"], "结果": ["数据", "报告"]}),
    example_query: '查询物料测试结果',
    category: '测试查询',
    priority: 10
  },
  
  {
    intent_name: 'NG测试结果查询_优化',
    description: '查询NG测试结果，展示完整字段和统计信息',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(project_id, '未指定') as 项目,
  COALESCE(baseline_id, '未指定') as 基线,
  material_code as 物料编码,
  COUNT(*) OVER (PARTITION BY material_name, supplier_name, test_result) as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '无描述') as 不合格描述,
  COALESCE(conclusion, '') as 备注
FROM lab_tests 
WHERE test_result IN ('FAIL', 'NG', '不合格')
ORDER BY test_date DESC
LIMIT 10`,
    parameters: JSON.stringify([]),
    trigger_words: JSON.stringify(["NG测试", "不合格测试", "测试失败", "NG结果"]),
    synonyms: JSON.stringify({"NG": ["不合格", "失败"], "测试": ["检测", "检验"]}),
    example_query: '查询NG测试结果',
    category: '测试查询',
    priority: 9
  },

  // ===== 批次管理场景规则 - 完整字段展示 =====

  {
    intent_name: '批次综合信息查询_优化',
    description: '查询批次综合信息，展示批次管理页面所有字段',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT DISTINCT
  i.batch_code as 批次号,
  i.material_code as 物料编码,
  i.material_name as 物料名称,
  i.supplier_name as 供应商,
  i.quantity as 数量,
  DATE_FORMAT(i.inbound_time, '%Y-%m-%d') as 入库日期,
  COALESCE(ot.exception_count, 0) as 产线异常,
  CASE
    WHEN lt.test_result = 'FAIL' THEN '有异常'
    WHEN lt.test_result = 'PASS' THEN '正常'
    ELSE '未测试'
  END as 测试异常,
  COALESCE(i.notes, '') as 备注
FROM inventory i
LEFT JOIN online_tracking ot ON i.batch_code = ot.batch_code
LEFT JOIN lab_tests lt ON i.batch_code = lt.batch_code
WHERE i.batch_code LIKE CONCAT('%', COALESCE(?, ''), '%')
   OR i.material_name LIKE CONCAT('%', COALESCE(?, ''), '%')
   OR i.supplier_name LIKE CONCAT('%', COALESCE(?, ''), '%')
ORDER BY i.inbound_time DESC
LIMIT 10`,
    parameters: JSON.stringify([
      { name: "batch_code", type: "string", description: "批次号" },
      { name: "material_name", type: "string", description: "物料名称" },
      { name: "supplier_name", type: "string", description: "供应商名称" }
    ]),
    trigger_words: JSON.stringify(["批次信息", "批次查询", "批次管理", "批次综合"]),
    synonyms: JSON.stringify({"批次": ["批号", "batch"], "信息": ["数据", "详情"]}),
    example_query: '查询批次综合信息',
    category: '批次管理',
    priority: 10
  },

  {
    intent_name: '异常批次识别_优化',
    description: '识别有异常的批次，展示完整异常信息',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT DISTINCT
  i.batch_code as 批次号,
  i.material_code as 物料编码,
  i.material_name as 物料名称,
  i.supplier_name as 供应商,
  i.quantity as 数量,
  DATE_FORMAT(i.inbound_time, '%Y-%m-%d') as 入库日期,
  COALESCE(ot.exception_count, 0) as 产线异常,
  CASE
    WHEN lt.test_result = 'FAIL' THEN CONCAT('测试异常: ', COALESCE(lt.defect_desc, '未知'))
    ELSE '正常'
  END as 测试异常,
  CONCAT('产线异常数: ', COALESCE(ot.exception_count, 0),
         ', 测试状态: ', COALESCE(lt.test_result, '未测试')) as 备注
FROM inventory i
LEFT JOIN online_tracking ot ON i.batch_code = ot.batch_code
LEFT JOIN lab_tests lt ON i.batch_code = lt.batch_code
WHERE ot.exception_count > 0 OR lt.test_result = 'FAIL'
ORDER BY ot.exception_count DESC, i.inbound_time DESC
LIMIT 10`,
    parameters: JSON.stringify([]),
    trigger_words: JSON.stringify(["异常批次", "问题批次", "批次异常", "异常识别"]),
    synonyms: JSON.stringify({"异常": ["问题", "故障"], "批次": ["批号", "batch"]}),
    example_query: '识别异常批次',
    category: '批次管理',
    priority: 9
  }
];

async function updateOptimizedRules() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔄 开始更新优化后的规则模板...\n');
    
    // 备份现有规则
    console.log('📋 备份现有规则...');
    const [existingRules] = await connection.execute(
      'SELECT COUNT(*) as count FROM nlp_intent_rules'
    );
    console.log(`当前规则数量: ${existingRules[0].count}条`);
    
    // 插入优化后的规则
    console.log('\n🚀 插入优化后的规则...');
    
    for (const rule of OPTIMIZED_RULES) {
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
    
    // 验证更新结果
    console.log('\n📊 验证更新结果...');
    const [updatedRules] = await connection.execute(
      'SELECT COUNT(*) as count FROM nlp_intent_rules WHERE status = "active"'
    );
    console.log(`活跃规则数量: ${updatedRules[0].count}条`);
    
    // 显示优化后的规则列表
    const [optimizedRules] = await connection.execute(`
      SELECT intent_name, category, priority 
      FROM nlp_intent_rules 
      WHERE intent_name LIKE '%_优化'
      ORDER BY category, priority DESC
    `);
    
    console.log('\n🎯 优化后的规则列表:');
    optimizedRules.forEach((rule, index) => {
      console.log(`${index + 1}. ${rule.intent_name} (${rule.category}, 优先级: ${rule.priority})`);
    });
    
    console.log('\n✅ 规则优化完成！');
    
  } catch (error) {
    console.error('❌ 更新失败:', error);
  } finally {
    await connection.end();
  }
}

// 如果直接运行此脚本
updateOptimizedRules().catch(console.error);

export { OPTIMIZED_RULES, updateOptimizedRules };
