// 创建完整的规则库
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function createCompleteRules() {
  let connection;
  try {
    console.log('🔧 创建完整的规则库...\n');
    
    connection = await mysql.createConnection(dbConfig);
    
    // 1. 清空现有规则
    console.log('1. 清空现有规则:');
    await connection.execute(`DELETE FROM nlp_intent_rules`);
    console.log('✅ 已清空现有规则');
    
    // 2. 创建完整规则集
    console.log('\n2. 创建完整规则集:');
    
    const completeRules = [
      // 库存场景规则
      {
        id: 1,
        intent_name: '库存查询_基础',
        description: '查询物料库存信息',
        category: '库存场景',
        example_query: '库存查询',
        trigger_words: JSON.stringify(['库存查询', '库存', '物料库存', '查库存', '库存信息', '库存状态']),
        action_target: `SELECT 
          material_name as 物料名称,
          supplier_name as 供应商,
          CAST(quantity AS CHAR) as 数量,
          status as 状态,
          DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库日期
        FROM inventory 
        WHERE status = '正常'
        ORDER BY inbound_time DESC 
        LIMIT 100`,
        status: 'active',
        priority: 100
      },
      {
        id: 2,
        intent_name: '聚龙供应商_库存查询',
        description: '查询聚龙供应商的库存信息',
        category: '库存场景',
        example_query: '聚龙供应商库存',
        trigger_words: JSON.stringify(['聚龙供应商', '聚龙', '聚龙光电', '聚龙库存']),
        action_target: `SELECT 
          material_name as 物料名称,
          supplier_name as 供应商,
          CAST(quantity AS CHAR) as 数量,
          status as 状态,
          DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库日期
        FROM inventory 
        WHERE supplier_name LIKE '%聚龙%'
        ORDER BY inbound_time DESC 
        LIMIT 100`,
        status: 'active',
        priority: 95
      },
      {
        id: 3,
        intent_name: 'BOE供应商_库存查询',
        description: '查询BOE供应商的库存信息',
        category: '库存场景',
        example_query: 'BOE供应商库存',
        trigger_words: JSON.stringify(['BOE供应商', 'BOE', 'BOE科技', 'BOE库存']),
        action_target: `SELECT 
          material_name as 物料名称,
          supplier_name as 供应商,
          CAST(quantity AS CHAR) as 数量,
          status as 状态,
          DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库日期
        FROM inventory 
        WHERE supplier_name LIKE '%BOE%'
        ORDER BY inbound_time DESC 
        LIMIT 100`,
        status: 'active',
        priority: 93
      },
      {
        id: 4,
        intent_name: '天马供应商_库存查询',
        description: '查询天马供应商的库存信息',
        category: '库存场景',
        example_query: '天马供应商库存',
        trigger_words: JSON.stringify(['天马供应商', '天马', '天马微电子', '天马库存']),
        action_target: `SELECT 
          material_name as 物料名称,
          supplier_name as 供应商,
          CAST(quantity AS CHAR) as 数量,
          status as 状态,
          DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库日期
        FROM inventory 
        WHERE supplier_name LIKE '%天马%'
        ORDER BY inbound_time DESC 
        LIMIT 100`,
        status: 'active',
        priority: 91
      },
      
      // 检验场景规则
      {
        id: 5,
        intent_name: '全测试_综合查询',
        description: '查询检验测试结果',
        category: '检验场景',
        example_query: '全测试结果',
        trigger_words: JSON.stringify(['全测试', '检验结果', '测试结果', '检验', '测试', '质检结果']),
        action_target: `SELECT 
          test_id as 测试编号,
          material_name as 物料名称,
          test_result as 测试结果,
          conclusion as 结论,
          DATE_FORMAT(test_date, '%Y-%m-%d') as 测试日期
        FROM lab_tests 
        ORDER BY test_date DESC 
        LIMIT 100`,
        status: 'active',
        priority: 90
      },
      {
        id: 6,
        intent_name: '不良率_检验查询',
        description: '查询物料不良率情况',
        category: '检验场景',
        example_query: '不良率查询',
        trigger_words: JSON.stringify(['不良率', '缺陷率', '合格率', '质量问题', '不合格']),
        action_target: `SELECT 
          material_name as 物料名称,
          test_result as 测试结果,
          conclusion as 结论,
          CASE 
            WHEN conclusion = '不合格' THEN '高风险'
            WHEN test_result LIKE '%异常%' THEN '中风险'
            ELSE '正常'
          END as 风险等级
        FROM lab_tests 
        WHERE conclusion != '合格' OR test_result LIKE '%异常%'
        ORDER BY test_date DESC 
        LIMIT 100`,
        status: 'active',
        priority: 88
      },
      
      // 生产场景规则
      {
        id: 7,
        intent_name: '生产上线_情况查询',
        description: '查询生产上线情况',
        category: '生产场景',
        example_query: '上线情况',
        trigger_words: JSON.stringify(['上线情况', '生产情况', '生产', '上线', '在线情况', '生产状态']),
        action_target: `SELECT 
          batch_code as 批次号,
          material_name as 物料名称,
          factory as 工厂,
          CONCAT(ROUND(defect_rate * 100, 2), '%') as 缺陷率,
          DATE_FORMAT(online_date, '%Y-%m-%d') as 上线日期
        FROM online_tracking 
        ORDER BY online_date DESC 
        LIMIT 100`,
        status: 'active',
        priority: 85
      },
      {
        id: 8,
        intent_name: '高缺陷率_生产查询',
        description: '查询高缺陷率的生产批次',
        category: '生产场景',
        example_query: '高缺陷率批次',
        trigger_words: JSON.stringify(['高缺陷率', '缺陷率高', '质量问题', '生产异常', '不良批次']),
        action_target: `SELECT 
          batch_code as 批次号,
          material_name as 物料名称,
          factory as 工厂,
          CONCAT(ROUND(defect_rate * 100, 2), '%') as 缺陷率,
          DATE_FORMAT(online_date, '%Y-%m-%d') as 上线日期
        FROM online_tracking 
        WHERE defect_rate > 0.05
        ORDER BY defect_rate DESC 
        LIMIT 100`,
        status: 'active',
        priority: 83
      },
      
      // 供应商对比规则
      {
        id: 9,
        intent_name: '供应商对比_分析',
        description: '对比不同供应商的表现',
        category: '分析场景',
        example_query: '供应商对比',
        trigger_words: JSON.stringify(['供应商对比', '供应商分析', '供应商比较', '供应商表现']),
        action_target: `SELECT 
          supplier_name as 供应商,
          COUNT(*) as 物料数量,
          SUM(quantity) as 总库存,
          AVG(CASE WHEN status = '正常' THEN 1 ELSE 0 END) as 正常率
        FROM inventory 
        GROUP BY supplier_name
        ORDER BY 总库存 DESC 
        LIMIT 50`,
        status: 'active',
        priority: 80
      },
      
      // 综合查询规则
      {
        id: 10,
        intent_name: '综合质量_报告',
        description: '生成综合质量报告',
        category: '报告场景',
        example_query: '质量报告',
        trigger_words: JSON.stringify(['质量报告', '综合报告', '整体情况', '质量概况', '全面分析']),
        action_target: `SELECT 
          '库存状态' as 指标类型,
          COUNT(*) as 数量,
          CONCAT(ROUND(AVG(CASE WHEN status = '正常' THEN 1 ELSE 0 END) * 100, 1), '%') as 正常率
        FROM inventory
        UNION ALL
        SELECT 
          '检验状态' as 指标类型,
          COUNT(*) as 数量,
          CONCAT(ROUND(AVG(CASE WHEN conclusion = '合格' THEN 1 ELSE 0 END) * 100, 1), '%') as 正常率
        FROM lab_tests
        UNION ALL
        SELECT 
          '生产状态' as 指标类型,
          COUNT(*) as 数量,
          CONCAT(ROUND(AVG(CASE WHEN defect_rate < 0.05 THEN 1 ELSE 0 END) * 100, 1), '%') as 正常率
        FROM online_tracking`,
        status: 'active',
        priority: 75
      }
    ];
    
    // 插入规则
    for (const rule of completeRules) {
      await connection.execute(`
        INSERT INTO nlp_intent_rules (
          id, intent_name, description, category, example_query, 
          trigger_words, action_target, status, priority, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        rule.id, rule.intent_name, rule.description, rule.category, 
        rule.example_query, rule.trigger_words, rule.action_target, 
        rule.status, rule.priority
      ]);
      
      console.log(`✅ 添加规则 ${rule.id}: ${rule.intent_name}`);
    }
    
    // 3. 验证规则创建
    console.log('\n3. 验证规则创建:');
    
    const [finalCount] = await connection.execute(`
      SELECT COUNT(*) as total FROM nlp_intent_rules WHERE status = 'active'
    `);
    console.log(`活跃规则总数: ${finalCount[0].total}`);
    
    // 按分类统计
    const [categoryStats] = await connection.execute(`
      SELECT category, COUNT(*) as count
      FROM nlp_intent_rules 
      WHERE status = 'active'
      GROUP BY category
      ORDER BY count DESC
    `);
    
    console.log('\n分类统计:');
    for (const cat of categoryStats) {
      console.log(`${cat.category}: ${cat.count} 条规则`);
    }
    
    // 4. 测试规则匹配
    console.log('\n4. 测试规则匹配:');
    
    const testQueries = [
      '库存查询', '聚龙供应商', 'BOE库存', '天马供应商',
      '全测试', '不良率', '上线情况', '高缺陷率',
      '供应商对比', '质量报告'
    ];
    
    for (const query of testQueries) {
      const [matchedRules] = await connection.execute(`
        SELECT id, intent_name, trigger_words
        FROM nlp_intent_rules 
        WHERE status = 'active'
        AND JSON_CONTAINS(trigger_words, ?)
        LIMIT 1
      `, [`"${query}"`]);
      
      if (matchedRules.length > 0) {
        console.log(`✅ "${query}" → 规则 ${matchedRules[0].id}: ${matchedRules[0].intent_name}`);
      } else {
        console.log(`❌ "${query}" → 未找到匹配规则`);
      }
    }
    
    await connection.end();
    
    console.log('\n🎉 完整规则库创建完成！');
    console.log('\n📋 规则库包含:');
    console.log('• 库存场景: 基础库存查询、供应商专项查询');
    console.log('• 检验场景: 测试结果查询、不良率分析');
    console.log('• 生产场景: 上线情况、缺陷率监控');
    console.log('• 分析场景: 供应商对比分析');
    console.log('• 报告场景: 综合质量报告');
    console.log('\n💡 下一步:');
    console.log('1. 重启后端服务');
    console.log('2. 刷新前端页面');
    console.log('3. 测试规则查询功能');
    
  } catch (error) {
    console.error('❌ 创建失败:', error.message);
    if (connection) await connection.end();
  }
}

createCompleteRules();
