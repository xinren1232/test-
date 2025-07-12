import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// IQE业务场景规则设计
const IQE_BUSINESS_RULES = [
  // ===== 1. 基础查询规则 =====
  
  // 库存类
  {
    intent_name: '物料库存查询',
    description: '查询特定物料的库存信息，显示工厂、仓库、数量、状态等',
    action_type: 'database_query',
    action_target: `
SELECT
  storage_location as 工厂,
  storage_location as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  notes as 备注
FROM inventory
WHERE material_name LIKE CONCAT('%', COALESCE(?, ''), '%')
ORDER BY inbound_time DESC
LIMIT 10`,
    category: '基础查询',
    example_query: '查询电池的库存情况'
  },
  
  {
    intent_name: '供应商库存查询',
    description: '查询特定供应商的库存分布情况',
    action_type: 'database_query',
    action_target: `
SELECT
  supplier_name as 供应商,
  material_name as 物料名称,
  COUNT(*) as 批次数量,
  SUM(quantity) as 总数量,
  status as 状态,
  storage_location as 工厂
FROM inventory
WHERE supplier_name LIKE CONCAT('%', COALESCE(?, ''), '%')
GROUP BY supplier_name, material_name, status, storage_location
ORDER BY 总数量 DESC
LIMIT 10`,
    category: '基础查询',
    example_query: '查询华为供应商的库存情况'
  },
  
  {
    intent_name: '批次库存信息查询',
    description: '查询特定批次的库存详细信息',
    action_type: 'database_query',
    action_target: `
SELECT
  batch_code as 批次号,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  storage_location as 工厂,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  notes as 备注
FROM inventory
WHERE batch_code LIKE CONCAT('%', COALESCE(?, ''), '%')
ORDER BY inbound_time DESC
LIMIT 10`,
    category: '基础查询',
    example_query: '查询批次669033的库存信息'
  },
  
  {
    intent_name: '库存状态查询',
    description: '查询风险、冻结等异常状态的库存物料',
    action_type: 'database_query',
    action_target: `
SELECT
  material_name as 物料名称,
  supplier_name as 供应商,
  batch_code as 批次号,
  quantity as 数量,
  status as 状态,
  storage_location as 工厂,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  notes as 备注
FROM inventory
WHERE status IN ('风险', '冻结', '异常')
ORDER BY inbound_time DESC
LIMIT 10`,
    category: '基础查询',
    example_query: '查询风险状态的物料'
  },
  
  // 上线数据类
  {
    intent_name: '物料上线情况查询',
    description: '查询特定物料的上线生产情况',
    action_type: 'database_query',
    action_target: `
SELECT
  material_name as 物料名称,
  supplier_name as 供应商,
  factory as 工厂,
  workshop as 车间,
  line as 生产线,
  project as 项目,
  DATE_FORMAT(online_date, '%Y-%m-%d') as 上线日期,
  CONCAT(ROUND(defect_rate * 100, 2), '%') as 不良率,
  exception_count as 异常次数,
  operator as 操作员
FROM online_tracking
WHERE material_name LIKE CONCAT('%', COALESCE(?, ''), '%')
ORDER BY online_date DESC
LIMIT 10`,
    category: '基础查询',
    example_query: '查询电池的上线情况'
  },
  
  {
    intent_name: '供应商上线情况查询',
    description: '查询特定供应商的上线质量表现',
    action_type: 'database_query',
    action_target: `
SELECT
  supplier_name as 供应商,
  COUNT(*) as 上线次数,
  AVG(defect_rate) * 100 as 平均不良率,
  MAX(defect_rate) * 100 as 最高不良率,
  SUM(exception_count) as 总异常次数,
  COUNT(DISTINCT material_name) as 物料种类数,
  COUNT(DISTINCT factory) as 涉及工厂数
FROM online_tracking
WHERE supplier_name LIKE CONCAT('%', COALESCE(?, ''), '%')
GROUP BY supplier_name
ORDER BY 平均不良率 DESC
LIMIT 10`,
    category: '基础查询',
    example_query: '查询华为供应商的上线情况'
  },
  
  {
    intent_name: '批次上线情况查询',
    description: '查询特定批次的上线跟踪情况',
    action_type: 'database_query',
    action_target: `
SELECT
  batch_code as 批次号,
  material_name as 物料名称,
  supplier_name as 供应商,
  factory as 工厂,
  project as 项目,
  DATE_FORMAT(online_date, '%Y-%m-%d') as 上线日期,
  CONCAT(ROUND(defect_rate * 100, 2), '%') as 不良率,
  exception_count as 异常次数
FROM online_tracking
WHERE batch_code LIKE CONCAT('%', COALESCE(?, ''), '%')
ORDER BY online_date DESC
LIMIT 10`,
    category: '基础查询',
    example_query: '查询批次669033的上线情况'
  },
  
  {
    intent_name: '项目物料不良查询',
    description: '查询特定项目的物料不良情况',
    action_type: 'database_query',
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
WHERE project LIKE CONCAT('%', COALESCE(?, ''), '%')
  AND defect_rate > 0
GROUP BY project, material_name, supplier_name
ORDER BY 平均不良率 DESC
LIMIT 10`,
    category: '基础查询',
    example_query: '查询K34项目的物料不良情况'
  },
  
  {
    intent_name: '基线物料不良查询',
    description: '查询特定基线的物料不良情况',
    action_type: 'database_query',
    action_target: `
SELECT
  baseline_id as 基线,
  material_name as 物料名称,
  supplier_name as 供应商,
  COUNT(CASE WHEN test_result = 'FAIL' THEN 1 END) as 测试失败次数,
  COUNT(*) as 总测试次数,
  ROUND(COUNT(CASE WHEN test_result = 'FAIL' THEN 1 END) * 100.0 / COUNT(*), 2) as 失败率
FROM lab_tests
WHERE baseline_id LIKE CONCAT('%', COALESCE(?, ''), '%')
GROUP BY baseline_id, material_name, supplier_name
HAVING 失败率 > 0
ORDER BY 失败率 DESC
LIMIT 10`,
    category: '基础查询',
    example_query: '查询K34基线的物料不良情况'
  },
  
  // 测试类
  {
    intent_name: '物料测试情况查询',
    description: '查询特定物料的测试情况',
    action_type: 'database_query',
    action_target: `
SELECT
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  material_name as 物料名称,
  supplier_name as 供应商,
  project_id as 项目,
  baseline_id as 基线,
  test_result as 测试结果,
  defect_desc as 不合格描述,
  notes as 备注
FROM lab_tests
WHERE material_name LIKE CONCAT('%', COALESCE(?, ''), '%')
ORDER BY test_date DESC
LIMIT 10`,
    category: '基础查询',
    example_query: '查询电池的测试情况'
  },
  
  {
    intent_name: '供应商测试情况查询',
    description: '查询特定供应商的测试质量表现',
    action_type: 'database_query',
    action_target: `
SELECT
  supplier_name as 供应商,
  COUNT(*) as 总测试次数,
  COUNT(CASE WHEN test_result = 'PASS' THEN 1 END) as 通过次数,
  COUNT(CASE WHEN test_result = 'FAIL' THEN 1 END) as 失败次数,
  ROUND(COUNT(CASE WHEN test_result = 'PASS' THEN 1 END) * 100.0 / COUNT(*), 2) as 通过率,
  COUNT(DISTINCT material_name) as 测试物料种类
FROM lab_tests
WHERE supplier_name LIKE CONCAT('%', COALESCE(?, ''), '%')
GROUP BY supplier_name
ORDER BY 通过率 ASC
LIMIT 10`,
    category: '基础查询',
    example_query: '查询华为供应商的测试情况'
  },
  
  {
    intent_name: '测试NG情况查询',
    description: '查询测试失败(NG)的记录详情',
    action_type: 'database_query',
    action_target: `
SELECT
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  material_name as 物料名称,
  supplier_name as 供应商,
  project_id as 项目,
  baseline_id as 基线,
  defect_desc as 不合格描述,
  notes as 备注
FROM lab_tests
WHERE test_result = 'FAIL'
ORDER BY test_date DESC
LIMIT 10`,
    category: '基础查询',
    example_query: '查询最近的测试失败记录'
  },
  
  {
    intent_name: '项目测试情况查询',
    description: '查询特定项目的测试情况统计',
    action_type: 'database_query',
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
WHERE project_id LIKE CONCAT('%', COALESCE(?, ''), '%')
GROUP BY project_id
ORDER BY 总测试次数 DESC
LIMIT 10`,
    category: '基础查询',
    example_query: '查询K34项目的测试情况'
  },
  
  {
    intent_name: '基线测试情况查询',
    description: '查询特定基线的测试情况统计',
    action_type: 'database_query',
    action_target: `
SELECT
  baseline_id as 基线,
  COUNT(*) as 总测试次数,
  COUNT(CASE WHEN test_result = 'PASS' THEN 1 END) as 通过次数,
  COUNT(CASE WHEN test_result = 'FAIL' THEN 1 END) as 失败次数,
  ROUND(COUNT(CASE WHEN test_result = 'PASS' THEN 1 END) * 100.0 / COUNT(*), 2) as 通过率,
  COUNT(DISTINCT project_id) as 关联项目数
FROM lab_tests
WHERE baseline_id LIKE CONCAT('%', COALESCE(?, ''), '%')
GROUP BY baseline_id
ORDER BY 总测试次数 DESC
LIMIT 10`,
    category: '基础查询',
    example_query: '查询K34基线的测试情况'
  },
  
  {
    intent_name: '批次测试情况查询',
    description: '查询特定批次的测试跟踪情况',
    action_type: 'database_query',
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
WHERE batch_code LIKE CONCAT('%', COALESCE(?, ''), '%')
GROUP BY batch_code, material_name, supplier_name
ORDER BY 测试次数 DESC
LIMIT 10`,
    category: '基础查询',
    example_query: '查询批次669033的测试情况'
  },

  // ===== 2. 进阶规则 =====

  // 批次信息查询（整合库存、上线和测试）
  {
    intent_name: '批次信息查询',
    description: '整合批次的库存、上线和测试信息，按批次管理页面数据设计呈现',
    action_type: 'database_query',
    action_target: `
SELECT
  i.batch_code as 批次号,
  i.material_code as 物料编码,
  i.material_name as 物料名称,
  i.supplier_name as 供应商,
  i.quantity as 数量,
  DATE_FORMAT(i.inbound_time, '%Y-%m-%d') as 入库日期,
  COUNT(DISTINCT CASE WHEN o.exception_count > 0 THEN o.id END) as 产线异常,
  COUNT(CASE WHEN l.test_result = 'FAIL' THEN 1 END) as 测试异常,
  CONCAT(
    COUNT(CASE WHEN l.test_result = 'PASS' THEN 1 END), '次OK',
    CASE WHEN COUNT(CASE WHEN l.test_result = 'FAIL' THEN 1 END) > 0
         THEN CONCAT(', ', COUNT(CASE WHEN l.test_result = 'FAIL' THEN 1 END), '次NG')
         ELSE ''
    END
  ) as 测试结果统计,
  i.notes as 备注
FROM inventory i
LEFT JOIN lab_tests l ON i.batch_code = l.batch_code
LEFT JOIN online_tracking o ON i.batch_code = o.batch_code
WHERE i.batch_code LIKE CONCAT('%', COALESCE(?, ''), '%')
GROUP BY i.batch_code, i.material_code, i.material_name, i.supplier_name, i.quantity, i.inbound_time, i.notes
ORDER BY i.inbound_time DESC
LIMIT 10`,
    category: '进阶查询',
    example_query: '查询批次669033的完整信息'
  },

  // 物料上线Top不良
  {
    intent_name: '物料上线Top不良',
    description: '统计物料上线不良率排行，基于真实不良率数据',
    action_type: 'database_query',
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
    category: '进阶查询',
    example_query: '查询上线不良率最高的物料'
  },

  // 物料测试Top不良
  {
    intent_name: '物料测试Top不良',
    description: '统计物料测试失败率排行，基于真实测试数据',
    action_type: 'database_query',
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
    category: '进阶查询',
    example_query: '查询测试失败率最高的物料'
  },

  // ===== 3. 对比分析规则 =====

  // 供应商对比分析
  {
    intent_name: '供应商对比分析',
    description: '对比两个供应商在库存、上线、测试方面的表现',
    action_type: 'database_query',
    action_target: `
SELECT
  '库存数据' as 数据类型,
  supplier_name as 供应商,
  COUNT(*) as 批次数量,
  SUM(quantity) as 总数量,
  COUNT(CASE WHEN status = '风险' THEN 1 END) as 风险批次,
  '' as 不良率,
  '' as 通过率
FROM inventory
WHERE supplier_name IN (?, ?)
GROUP BY supplier_name

UNION ALL

SELECT
  '上线数据' as 数据类型,
  supplier_name as 供应商,
  COUNT(*) as 上线次数,
  '' as 总数量,
  SUM(exception_count) as 异常次数,
  CONCAT(ROUND(AVG(defect_rate) * 100, 2), '%') as 不良率,
  '' as 通过率
FROM online_tracking
WHERE supplier_name IN (?, ?)
GROUP BY supplier_name

UNION ALL

SELECT
  '测试数据' as 数据类型,
  supplier_name as 供应商,
  COUNT(*) as 测试次数,
  '' as 总数量,
  COUNT(CASE WHEN test_result = 'FAIL' THEN 1 END) as 失败次数,
  '' as 不良率,
  CONCAT(ROUND(COUNT(CASE WHEN test_result = 'PASS' THEN 1 END) * 100.0 / COUNT(*), 2), '%') as 通过率
FROM lab_tests
WHERE supplier_name IN (?, ?)
GROUP BY supplier_name

ORDER BY 数据类型, 供应商`,
    category: '对比分析',
    example_query: '对比华为和小米供应商的表现'
  },

  // 物料对比分析
  {
    intent_name: '物料对比分析',
    description: '对比两种物料在库存、上线、测试方面的数据',
    action_type: 'database_query',
    action_target: `
SELECT
  '库存数据' as 数据类型,
  material_name as 物料名称,
  COUNT(*) as 批次数量,
  SUM(quantity) as 总数量,
  COUNT(CASE WHEN status = '风险' THEN 1 END) as 风险批次,
  '' as 不良率,
  '' as 通过率
FROM inventory
WHERE material_name IN (?, ?)
GROUP BY material_name

UNION ALL

SELECT
  '上线数据' as 数据类型,
  material_name as 物料名称,
  COUNT(*) as 上线次数,
  '' as 总数量,
  SUM(exception_count) as 异常次数,
  CONCAT(ROUND(AVG(defect_rate) * 100, 2), '%') as 不良率,
  '' as 通过率
FROM online_tracking
WHERE material_name IN (?, ?)
GROUP BY material_name

UNION ALL

SELECT
  '测试数据' as 数据类型,
  material_name as 物料名称,
  COUNT(*) as 测试次数,
  '' as 总数量,
  COUNT(CASE WHEN test_result = 'FAIL' THEN 1 END) as 失败次数,
  '' as 不良率,
  CONCAT(ROUND(COUNT(CASE WHEN test_result = 'PASS' THEN 1 END) * 100.0 / COUNT(*), 2), '%') as 通过率
FROM lab_tests
WHERE material_name IN (?, ?)
GROUP BY material_name

ORDER BY 数据类型, 物料名称`,
    category: '对比分析',
    example_query: '对比电池和充电器的质量表现'
  }
];

async function addIQEBusinessRules() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 添加IQE业务场景规则...\n');
    
    // 获取当前规则数量
    const [countBefore] = await connection.execute('SELECT COUNT(*) as total FROM nlp_intent_rules');
    console.log(`📊 添加前规则数: ${countBefore[0].total}条\n`);
    
    let addedCount = 0;
    let updatedCount = 0;
    
    for (const rule of IQE_BUSINESS_RULES) {
      try {
        // 检查规则是否已存在
        const [existing] = await connection.execute(
          'SELECT id FROM nlp_intent_rules WHERE intent_name = ?',
          [rule.intent_name]
        );
        
        if (existing.length > 0) {
          // 更新现有规则
          await connection.execute(`
            UPDATE nlp_intent_rules 
            SET description = ?, action_target = ?, category = ?, example_query = ?, updated_at = NOW()
            WHERE intent_name = ?`,
            [rule.description, rule.action_target, rule.category, rule.example_query, rule.intent_name]
          );
          console.log(`🔄 已更新: ${rule.intent_name}`);
          updatedCount++;
        } else {
          // 添加新规则
          await connection.execute(`
            INSERT INTO nlp_intent_rules 
            (intent_name, description, action_type, action_target, category, example_query, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
            [rule.intent_name, rule.description, rule.action_type, rule.action_target, rule.category, rule.example_query]
          );
          console.log(`✅ 已添加: ${rule.intent_name}`);
          addedCount++;
        }
      } catch (error) {
        console.log(`❌ 处理失败: ${rule.intent_name} - ${error.message}`);
      }
    }
    
    // 获取添加后的规则数量
    const [countAfter] = await connection.execute('SELECT COUNT(*) as total FROM nlp_intent_rules');
    
    console.log('\n📈 添加结果统计:');
    console.log(`   添加前总数: ${countBefore[0].total}条`);
    console.log(`   新增规则: ${addedCount}条`);
    console.log(`   更新规则: ${updatedCount}条`);
    console.log(`   添加后总数: ${countAfter[0].total}条`);
    
    console.log('\n🎉 IQE业务规则添加完成！');
    
  } catch (error) {
    console.error('❌ 添加失败:', error);
  } finally {
    await connection.end();
  }
}

addIQEBusinessRules();
