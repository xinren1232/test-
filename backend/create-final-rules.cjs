// 创建最终规则集 - 补充剩余查询场景
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 最终规则集 - 补充特殊查询场景
const FINAL_RULES = [
  // === 数据探索规则 ===
  {
    intent_name: '系统数据概览',
    description: '查看系统整体数据概况',
    action_type: 'SQL_QUERY',
    action_target: `SELECT 
      '数据概览' as '统计项目',
      (SELECT COUNT(*) FROM inventory) as '库存记录数',
      (SELECT COUNT(*) FROM lab_tests) as '检验记录数',
      (SELECT COUNT(*) FROM online_tracking) as '生产记录数',
      (SELECT COUNT(DISTINCT supplier_name) FROM inventory WHERE supplier_name IS NOT NULL) as '供应商数量',
      (SELECT COUNT(DISTINCT material_name) FROM inventory WHERE material_name IS NOT NULL) as '物料种类数'`,
    trigger_words: JSON.stringify(['系统概览', '数据概况', '整体数据', '系统统计', '数据总览']),
    example_query: '查看系统数据概览',
    priority: 5
  },

  // === 趋势分析规则 ===
  {
    intent_name: '入库趋势分析',
    description: '分析最近的入库趋势',
    action_type: 'SQL_QUERY',
    action_target: `SELECT 
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as '日期',
      COUNT(*) as '入库批次',
      SUM(quantity) as '入库数量',
      COUNT(DISTINCT supplier_name) as '供应商数'
    FROM inventory 
    WHERE inbound_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY DATE_FORMAT(inbound_time, '%Y-%m-%d')
    ORDER BY inbound_time DESC
    LIMIT 10`,
    trigger_words: JSON.stringify(['入库趋势', '入库分析', '最近入库', '入库统计']),
    example_query: '分析入库趋势',
    priority: 6
  },

  // === 质量问题分析 ===
  {
    intent_name: '质量问题汇总',
    description: '汇总所有质量问题',
    action_type: 'SQL_QUERY',
    action_target: `SELECT 
      '检验不合格' as '问题类型',
      COUNT(*) as '问题数量',
      GROUP_CONCAT(DISTINCT material_name SEPARATOR ', ') as '涉及物料'
    FROM lab_tests 
    WHERE test_result NOT IN ('合格', 'pass', 'passed')
    UNION ALL
    SELECT 
      '高不良率生产' as '问题类型',
      COUNT(*) as '问题数量',
      GROUP_CONCAT(DISTINCT material_name SEPARATOR ', ') as '涉及物料'
    FROM online_tracking 
    WHERE defect_rate > 0.05
    UNION ALL
    SELECT 
      '异常库存状态' as '问题类型',
      COUNT(*) as '问题数量',
      GROUP_CONCAT(DISTINCT material_name SEPARATOR ', ') as '涉及物料'
    FROM inventory 
    WHERE status != 'normal'`,
    trigger_words: JSON.stringify(['质量问题', '问题汇总', '质量异常', '问题统计']),
    example_query: '汇总质量问题',
    priority: 8
  },

  // === 特定条件查询 ===
  {
    intent_name: '冻结库存查询',
    description: '查询被冻结的库存',
    action_type: 'SQL_QUERY',
    action_target: `SELECT 
      material_name as '物料名称',
      supplier_name as '供应商',
      quantity as '数量',
      status as '状态',
      SUBSTRING_INDEX(storage_location, '-', 1) as '工厂',
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as '入库时间',
      notes as '备注'
    FROM inventory 
    WHERE status = 'frozen'
    ORDER BY inbound_time DESC`,
    trigger_words: JSON.stringify(['冻结库存', '被冻结的库存', '冻结状态', '库存冻结']),
    example_query: '查询冻结库存',
    priority: 8
  },

  // === 供应商对比分析 ===
  {
    intent_name: '供应商对比分析',
    description: '对比不同供应商的表现',
    action_type: 'SQL_QUERY',
    action_target: `SELECT 
      i.supplier_name as '供应商',
      COUNT(i.id) as '库存批次数',
      SUM(i.quantity) as '总库存量',
      COUNT(l.id) as '检验次数',
      ROUND(AVG(CASE WHEN l.test_result IN ('合格', 'pass', 'passed') THEN 100 ELSE 0 END), 2) as '平均合格率%',
      COUNT(o.id) as '生产次数',
      ROUND(AVG(o.defect_rate * 100), 2) as '平均不良率%'
    FROM inventory i
    LEFT JOIN lab_tests l ON i.supplier_name = l.supplier_name
    LEFT JOIN online_tracking o ON i.supplier_name = o.supplier_name
    WHERE i.supplier_name IS NOT NULL
    GROUP BY i.supplier_name
    HAVING COUNT(i.id) >= 2
    ORDER BY COUNT(i.id) DESC`,
    trigger_words: JSON.stringify(['供应商对比', '供应商比较', '对比供应商', '供应商排名']),
    example_query: '对比供应商表现',
    priority: 5
  },

  // === 物料类型分析 ===
  {
    intent_name: '物料类型分布',
    description: '分析物料类型的分布情况',
    action_type: 'SQL_QUERY',
    action_target: `SELECT 
      COALESCE(material_type, '未分类') as '物料类型',
      COUNT(*) as '库存记录数',
      SUM(quantity) as '总数量',
      COUNT(DISTINCT supplier_name) as '供应商数量',
      ROUND(AVG(quantity), 2) as '平均数量'
    FROM inventory 
    GROUP BY COALESCE(material_type, '未分类')
    ORDER BY COUNT(*) DESC`,
    trigger_words: JSON.stringify(['物料类型分布', '物料分类', '类型统计', '物料类型']),
    example_query: '分析物料类型分布',
    priority: 6
  },

  // === 异常检测规则 ===
  {
    intent_name: '异常数据检测',
    description: '检测系统中的异常数据',
    action_type: 'SQL_QUERY',
    action_target: `SELECT 
      '异常类型' as '检测项',
      '异常描述' as '描述',
      '数量' as '异常数量'
    FROM (
      SELECT '库存数量异常' as '异常类型', '数量为0或负数的库存' as '异常描述', COUNT(*) as '数量'
      FROM inventory WHERE quantity <= 0
      UNION ALL
      SELECT '缺失供应商信息' as '异常类型', '供应商信息为空的记录' as '异常描述', COUNT(*) as '数量'
      FROM inventory WHERE supplier_name IS NULL OR supplier_name = ''
      UNION ALL
      SELECT '缺失物料名称' as '异常类型', '物料名称为空的记录' as '异常描述', COUNT(*) as '数量'
      FROM inventory WHERE material_name IS NULL OR material_name = ''
    ) anomalies
    WHERE 数量 > 0`,
    trigger_words: JSON.stringify(['异常检测', '数据异常', '异常数据', '检测异常']),
    example_query: '检测异常数据',
    priority: 7
  },

  // === 时间范围灵活查询 ===
  {
    intent_name: '最近一周数据',
    description: '查询最近一周的所有活动',
    action_type: 'SQL_QUERY',
    action_target: `SELECT 
      '库存入库' as '活动类型',
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as '日期',
      COUNT(*) as '记录数',
      '批次' as '单位'
    FROM inventory 
    WHERE inbound_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    GROUP BY DATE_FORMAT(inbound_time, '%Y-%m-%d')
    UNION ALL
    SELECT 
      '检验活动' as '活动类型',
      DATE_FORMAT(test_date, '%Y-%m-%d') as '日期',
      COUNT(*) as '记录数',
      '次' as '单位'
    FROM lab_tests 
    WHERE test_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    GROUP BY DATE_FORMAT(test_date, '%Y-%m-%d')
    ORDER BY 日期 DESC`,
    trigger_words: JSON.stringify(['最近一周', '本周数据', '一周内', '近一周']),
    example_query: '查询最近一周数据',
    priority: 6
  },

  // === 综合报表规则 ===
  {
    intent_name: '质量综合报表',
    description: '生成质量管理综合报表',
    action_type: 'SQL_QUERY',
    action_target: `SELECT 
      '质量指标' as '指标类型',
      '数值' as '指标值',
      '单位' as '单位'
    FROM (
      SELECT '总库存批次' as '质量指标', COUNT(*) as '数值', '批次' as '单位' FROM inventory
      UNION ALL
      SELECT '检验合格率' as '质量指标', 
             ROUND(SUM(CASE WHEN test_result IN ('合格', 'pass', 'passed') THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as '数值',
             '%' as '单位' 
      FROM lab_tests
      UNION ALL
      SELECT '平均不良率' as '质量指标', 
             ROUND(AVG(defect_rate * 100), 2) as '数值',
             '%' as '单位'
      FROM online_tracking
      UNION ALL
      SELECT '异常库存比例' as '质量指标',
             ROUND(SUM(CASE WHEN status != 'normal' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as '数值',
             '%' as '单位'
      FROM inventory
    ) metrics`,
    trigger_words: JSON.stringify(['质量报表', '综合报表', '质量指标', '管理报表']),
    example_query: '生成质量综合报表',
    priority: 4
  }
];

async function createFinalRules() {
  let connection;
  
  try {
    console.log('🚀 创建最终规则集...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 插入最终规则
    console.log('📝 插入最终规则...');
    let insertedCount = 0;
    
    for (const rule of FINAL_RULES) {
      try {
        await connection.execute(`
          INSERT INTO assistant_rules (
            intent_name, description, action_type, action_target,
            trigger_words, example_query, priority, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW())
        `, [
          rule.intent_name,
          rule.description,
          rule.action_type,
          rule.action_target,
          rule.trigger_words,
          rule.example_query,
          rule.priority
        ]);
        
        insertedCount++;
        console.log(`✅ 已插入最终规则: ${rule.intent_name}`);
        
      } catch (error) {
        console.error(`❌ 插入规则失败 [${rule.intent_name}]:`, error.message);
      }
    }
    
    console.log(`\n🎉 最终规则集创建完成！共插入 ${insertedCount} 条规则`);
    
    // 统计总规则数
    const [totalRules] = await connection.execute('SELECT COUNT(*) as count FROM assistant_rules WHERE status = "active"');
    console.log(`📊 系统总活跃规则数量: ${totalRules[0].count}`);
    
    // 按优先级统计
    const [priorityStats] = await connection.execute(`
      SELECT priority, COUNT(*) as count 
      FROM assistant_rules 
      WHERE status = 'active' 
      GROUP BY priority 
      ORDER BY priority DESC
    `);
    
    console.log('\n📈 规则优先级分布:');
    priorityStats.forEach(stat => {
      console.log(`  优先级 ${stat.priority}: ${stat.count} 条规则`);
    });
    
  } catch (error) {
    console.error('❌ 创建最终规则失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createFinalRules();
