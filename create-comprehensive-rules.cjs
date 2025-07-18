const mysql = require('./backend/node_modules/mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 基于实际表结构的全信息规则设计
const COMPREHENSIVE_RULES = [
  
  // ===== 库存全信息规则 =====
  {
    intent_name: '库存全信息查询',
    description: '查询库存的完整信息，包括风险等级、检验员等详细字段',
    trigger_words: JSON.stringify(['库存全信息', '库存详情', '库存完整信息', '详细库存']),
    action_target: `SELECT 
      SUBSTRING_INDEX(storage_location, '-', 1) as 工厂,
      SUBSTRING_INDEX(storage_location, '-', -1) as 仓库,
      material_code as 物料编号,
      material_name as 物料名称,
      material_type as 物料类型,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      risk_level as 风险等级,
      inspector as 检验员,
      batch_code as 批次号,
      DATE_FORMAT(inbound_time, '%Y-%m-%d %H:%i') as 入库时间,
      DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as 创建时间,
      notes as 备注
    FROM inventory 
    ORDER BY inbound_time DESC 
    LIMIT 50`,
    action_type: 'SQL_QUERY',
    status: 'active',
    priority: 9,
    example_query: '查询库存全信息'
  },

  // ===== 检验全信息规则 =====
  {
    intent_name: '检验全信息查询',
    description: '查询检验的完整信息，包括测试员、审核员等详细字段',
    trigger_words: JSON.stringify(['检验全信息', '检验详情', '测试详情', '检验完整信息']),
    action_target: `SELECT 
      test_id as 测试编号,
      DATE_FORMAT(test_date, '%Y-%m-%d') as 测试日期,
      material_code as 物料编号,
      material_name as 物料名称,
      supplier_name as 供应商,
      batch_code as 批次号,
      test_item as 测试项目,
      test_result as 测试结果,
      conclusion as 结论,
      defect_desc as 缺陷描述,
      tester as 测试员,
      reviewer as 审核员,
      DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as 创建时间
    FROM lab_tests 
    ORDER BY test_date DESC 
    LIMIT 50`,
    action_type: 'SQL_QUERY',
    status: 'active',
    priority: 9,
    example_query: '查询检验全信息'
  },

  // ===== 生产全信息规则 =====
  {
    intent_name: '生产全信息查询',
    description: '查询生产的完整信息，包括车间、产线、操作员等详细字段',
    trigger_words: JSON.stringify(['生产全信息', '上线详情', '生产详情', '生产完整信息']),
    action_target: `SELECT 
      factory as 工厂,
      workshop as 车间,
      line as 产线,
      project as 项目,
      material_code as 物料编号,
      material_name as 物料名称,
      supplier_name as 供应商,
      batch_code as 批次号,
      CONCAT(ROUND(defect_rate * 100, 2), '%') as 缺陷率,
      exception_count as 异常次数,
      operator as 操作员,
      DATE_FORMAT(online_date, '%Y-%m-%d') as 上线日期,
      DATE_FORMAT(use_time, '%Y-%m-%d %H:%i') as 使用时间,
      DATE_FORMAT(inspection_date, '%Y-%m-%d %H:%i') as 检验时间
    FROM online_tracking 
    ORDER BY online_date DESC 
    LIMIT 50`,
    action_type: 'SQL_QUERY',
    status: 'active',
    priority: 9,
    example_query: '查询生产全信息'
  },

  // ===== 按批次号查询全链路信息 =====
  {
    intent_name: '批次全链路查询',
    description: '根据批次号查询从库存到检验到生产的全链路信息',
    trigger_words: JSON.stringify(['批次全链路', '批次跟踪', '批次追溯', '{batch}批次']),
    action_target: `SELECT
      '库存' as 环节,
      i.batch_code as 批次号,
      i.material_name as 物料名称,
      i.supplier_name as 供应商,
      i.quantity as 数量,
      i.status as 状态,
      DATE_FORMAT(i.inbound_time, '%Y-%m-%d') as 时间,
      i.notes as 备注
    FROM inventory i
    WHERE i.batch_code LIKE '%{batch}%'
    UNION ALL
    SELECT
      '检验' as 环节,
      l.batch_code as 批次号,
      l.material_name as 物料名称,
      l.supplier_name as 供应商,
      l.test_item as 数量,
      l.test_result as 状态,
      DATE_FORMAT(l.test_date, '%Y-%m-%d') as 时间,
      l.defect_desc as 备注
    FROM lab_tests l
    WHERE l.batch_code LIKE '%{batch}%'
    UNION ALL
    SELECT
      '生产' as 环节,
      o.batch_code as 批次号,
      o.material_name as 物料名称,
      o.supplier_name as 供应商,
      o.factory as 数量,
      CONCAT(ROUND(o.defect_rate * 100, 2), '%') as 状态,
      DATE_FORMAT(o.online_date, '%Y-%m-%d') as 时间,
      CONCAT('异常', o.exception_count, '次') as 备注
    FROM online_tracking o
    WHERE o.batch_code LIKE '%{batch}%'
    ORDER BY 时间 DESC`,
    action_type: 'SQL_QUERY',
    status: 'active',
    priority: 8,
    example_query: '查询BATCH_001批次全链路'
  },

  // ===== 风险等级专项查询 =====
  {
    intent_name: '风险等级查询',
    description: '按风险等级查询库存物料',
    trigger_words: JSON.stringify(['风险等级', '高风险', '中风险', '低风险', '风险库存']),
    action_target: `SELECT
      SUBSTRING_INDEX(storage_location, '-', 1) as 工厂,
      material_name as 物料名称,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      risk_level as 风险等级,
      inspector as 检验员,
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
      notes as 备注
    FROM inventory
    WHERE risk_level IS NOT NULL
    ORDER BY
      CASE risk_level
        WHEN 'high' THEN 1
        WHEN 'medium' THEN 2
        WHEN 'low' THEN 3
        ELSE 4
      END,
      inbound_time DESC`,
    action_type: 'SQL_QUERY',
    status: 'active',
    priority: 8,
    example_query: '查询风险等级库存'
  },

  // ===== 测试项目专项查询 =====
  {
    intent_name: '测试项目查询',
    description: '按测试项目查询检验数据',
    trigger_words: JSON.stringify(['测试项目', '性能测试', '外观检查', '功能测试', '{test_item}测试']),
    action_target: `SELECT
      test_item as 测试项目,
      material_name as 物料名称,
      supplier_name as 供应商,
      test_result as 测试结果,
      conclusion as 结论,
      tester as 测试员,
      reviewer as 审核员,
      DATE_FORMAT(test_date, '%Y-%m-%d') as 测试日期,
      defect_desc as 缺陷描述
    FROM lab_tests
    WHERE test_item LIKE '%{test_item}%' OR test_item IS NOT NULL
    ORDER BY test_date DESC`,
    action_type: 'SQL_QUERY',
    status: 'active',
    priority: 8,
    example_query: '查询性能测试项目'
  },

  // ===== 车间产线专项查询 =====
  {
    intent_name: '车间产线查询',
    description: '按车间和产线查询生产数据',
    trigger_words: JSON.stringify(['车间产线', '{workshop}车间', '{line}产线', '车间生产']),
    action_target: `SELECT
      factory as 工厂,
      workshop as 车间,
      line as 产线,
      material_name as 物料名称,
      supplier_name as 供应商,
      CONCAT(ROUND(defect_rate * 100, 2), '%') as 缺陷率,
      exception_count as 异常次数,
      operator as 操作员,
      DATE_FORMAT(online_date, '%Y-%m-%d') as 上线日期,
      DATE_FORMAT(use_time, '%Y-%m-%d %H:%i') as 使用时间
    FROM online_tracking
    WHERE workshop LIKE '%{workshop}%' OR line LIKE '%{line}%'
       OR workshop IS NOT NULL OR line IS NOT NULL
    ORDER BY online_date DESC`,
    action_type: 'SQL_QUERY',
    status: 'active',
    priority: 8,
    example_query: '查询车间1产线数据'
  },

  // ===== 异常分析规则 =====
  {
    intent_name: '异常数据分析',
    description: '分析系统中的各种异常情况',
    trigger_words: JSON.stringify(['异常分析', '异常数据', '问题分析', '异常统计']),
    action_target: `SELECT
      '库存异常' as 异常类型,
      COUNT(*) as 异常数量,
      GROUP_CONCAT(DISTINCT status SEPARATOR ', ') as 异常状态,
      GROUP_CONCAT(DISTINCT material_name SEPARATOR ', ') as 涉及物料
    FROM inventory
    WHERE status NOT IN ('normal', '正常') AND status IS NOT NULL
    UNION ALL
    SELECT
      '检验异常' as 异常类型,
      COUNT(*) as 异常数量,
      GROUP_CONCAT(DISTINCT test_result SEPARATOR ', ') as 异常状态,
      GROUP_CONCAT(DISTINCT material_name SEPARATOR ', ') as 涉及物料
    FROM lab_tests
    WHERE test_result NOT IN ('合格', 'PASS', 'pass') AND test_result IS NOT NULL
    UNION ALL
    SELECT
      '生产异常' as 异常类型,
      COUNT(*) as 异常数量,
      CONCAT('平均缺陷率: ', ROUND(AVG(defect_rate) * 100, 2), '%') as 异常状态,
      GROUP_CONCAT(DISTINCT material_name SEPARATOR ', ') as 涉及物料
    FROM online_tracking
    WHERE defect_rate > 0.05`,
    action_type: 'SQL_QUERY',
    status: 'active',
    priority: 7,
    example_query: '分析异常数据'
  },

  // ===== 时间范围查询规则 =====
  {
    intent_name: '时间范围查询',
    description: '按时间范围查询各类数据',
    trigger_words: JSON.stringify(['本周数据', '本月数据', '最近7天', '最近30天', '时间范围']),
    action_target: `SELECT
      '库存' as 数据类型,
      COUNT(*) as 记录数,
      SUM(quantity) as 总数量,
      COUNT(DISTINCT supplier_name) as 供应商数,
      DATE_FORMAT(MIN(inbound_time), '%Y-%m-%d') as 最早时间,
      DATE_FORMAT(MAX(inbound_time), '%Y-%m-%d') as 最晚时间
    FROM inventory
    WHERE inbound_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    UNION ALL
    SELECT
      '检验' as 数据类型,
      COUNT(*) as 记录数,
      COUNT(DISTINCT test_item) as 总数量,
      COUNT(DISTINCT supplier_name) as 供应商数,
      DATE_FORMAT(MIN(test_date), '%Y-%m-%d') as 最早时间,
      DATE_FORMAT(MAX(test_date), '%Y-%m-%d') as 最晚时间
    FROM lab_tests
    WHERE test_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    UNION ALL
    SELECT
      '生产' as 数据类型,
      COUNT(*) as 记录数,
      SUM(exception_count) as 总数量,
      COUNT(DISTINCT supplier_name) as 供应商数,
      DATE_FORMAT(MIN(online_date), '%Y-%m-%d') as 最早时间,
      DATE_FORMAT(MAX(online_date), '%Y-%m-%d') as 最晚时间
    FROM online_tracking
    WHERE online_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
    action_type: 'SQL_QUERY',
    status: 'active',
    priority: 7,
    example_query: '查询最近30天数据'
  },

  // ===== 物料类型专项分析 =====
  {
    intent_name: '物料类型分析',
    description: '按物料类型分析库存和质量情况',
    trigger_words: JSON.stringify(['物料类型分析', '{material_type}类型', '物料分类']),
    action_target: `SELECT
      i.material_type as 物料类型,
      COUNT(i.id) as 库存记录数,
      SUM(i.quantity) as 库存总量,
      COUNT(DISTINCT i.supplier_name) as 供应商数,
      COUNT(l.id) as 检验记录数,
      ROUND(AVG(CASE WHEN l.test_result IN ('合格', 'PASS', 'pass') THEN 1 ELSE 0 END) * 100, 2) as 合格率,
      COUNT(o.id) as 生产记录数,
      ROUND(AVG(o.defect_rate) * 100, 2) as 平均缺陷率
    FROM inventory i
    LEFT JOIN lab_tests l ON i.material_code = l.material_code
    LEFT JOIN online_tracking o ON i.material_code = o.material_code
    WHERE i.material_type LIKE '%{material_type}%' OR i.material_type IS NOT NULL
    GROUP BY i.material_type
    ORDER BY 库存总量 DESC`,
    action_type: 'SQL_QUERY',
    status: 'active',
    priority: 7,
    example_query: '分析装饰件类型物料'
  }
];

async function createComprehensiveRules() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    console.log('🚀 开始创建全信息覆盖规则...');
    
    for (const rule of COMPREHENSIVE_RULES) {
      try {
        await connection.execute(`
          INSERT INTO assistant_rules (
            intent_name, description, trigger_words, action_target, 
            action_type, status, priority, example_query, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          rule.intent_name,
          rule.description,
          rule.trigger_words,
          rule.action_target,
          rule.action_type,
          rule.status,
          rule.priority,
          rule.example_query
        ]);
        
        console.log(`✅ 创建规则: ${rule.intent_name}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️  规则已存在: ${rule.intent_name}`);
        } else {
          console.error(`❌ 创建规则失败: ${rule.intent_name}`, error.message);
        }
      }
    }
    
    console.log('\n🎯 全信息覆盖规则创建完成！');
    
    // 显示当前所有规则
    const [rules] = await connection.execute(`
      SELECT intent_name, priority, status 
      FROM assistant_rules 
      ORDER BY priority DESC, intent_name
    `);
    
    console.log('\n📋 当前所有规则:');
    rules.forEach(rule => {
      console.log(`  ${rule.intent_name} (优先级: ${rule.priority}, 状态: ${rule.status})`);
    });
    
  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createComprehensiveRules();
