// 确保规则库中有数据
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function ensureRulesExist() {
  let connection;
  try {
    console.log('🔍 检查规则库状态...');
    
    connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查现有规则数量
    const [count] = await connection.execute(`
      SELECT COUNT(*) as total FROM nlp_intent_rules WHERE status = 'active'
    `);
    
    console.log(`📊 当前活跃规则数: ${count[0].total}`);
    
    // 2. 如果没有规则，创建基础规则
    if (count[0].total === 0) {
      console.log('🔧 创建基础规则...');
      
      const basicRules = [
        {
          intent_name: '库存查询_基础',
          description: '查询物料库存信息',
          category: '库存场景',
          example_query: '库存查询',
          trigger_words: JSON.stringify(['库存查询', '库存', '查库存', '库存信息']),
          action_target: 'SELECT material_name as 物料名称, supplier_name as 供应商, CAST(quantity AS CHAR) as 数量, status as 状态 FROM inventory WHERE status = "正常" LIMIT 100',
          status: 'active',
          priority: 100
        },
        {
          intent_name: '聚龙供应商_库存查询',
          description: '查询聚龙供应商的库存信息',
          category: '库存场景',
          example_query: '聚龙供应商',
          trigger_words: JSON.stringify(['聚龙供应商', '聚龙', '聚龙光电', '聚龙库存']),
          action_target: 'SELECT material_name as 物料名称, supplier_name as 供应商, CAST(quantity AS CHAR) as 数量, status as 状态 FROM inventory WHERE supplier_name LIKE "%聚龙%" LIMIT 100',
          status: 'active',
          priority: 95
        },
        {
          intent_name: 'BOE供应商_库存查询',
          description: '查询BOE供应商的库存信息',
          category: '库存场景',
          example_query: 'BOE供应商',
          trigger_words: JSON.stringify(['BOE供应商', 'BOE', 'BOE科技', 'BOE库存']),
          action_target: 'SELECT material_name as 物料名称, supplier_name as 供应商, CAST(quantity AS CHAR) as 数量, status as 状态 FROM inventory WHERE supplier_name LIKE "%BOE%" LIMIT 100',
          status: 'active',
          priority: 93
        },
        {
          intent_name: '全测试_综合查询',
          description: '查询检验测试结果',
          category: '检验场景',
          example_query: '全测试',
          trigger_words: JSON.stringify(['全测试', '检验结果', '测试结果', '检验', '测试']),
          action_target: 'SELECT test_id as 测试编号, material_name as 物料名称, test_result as 测试结果, conclusion as 结论 FROM lab_tests ORDER BY test_date DESC LIMIT 100',
          status: 'active',
          priority: 90
        },
        {
          intent_name: '生产上线_情况查询',
          description: '查询生产上线情况',
          category: '生产场景',
          example_query: '上线情况',
          trigger_words: JSON.stringify(['上线情况', '生产情况', '生产', '上线', '在线情况']),
          action_target: 'SELECT batch_code as 批次号, material_name as 物料名称, factory as 工厂, CONCAT(ROUND(defect_rate * 100, 2), "%") as 缺陷率 FROM online_tracking ORDER BY online_date DESC LIMIT 100',
          status: 'active',
          priority: 85
        }
      ];
      
      for (const rule of basicRules) {
        await connection.execute(`
          INSERT INTO nlp_intent_rules (
            intent_name, description, category, example_query, 
            trigger_words, action_target, status, priority
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          rule.intent_name, rule.description, rule.category, rule.example_query,
          rule.trigger_words, rule.action_target, rule.status, rule.priority
        ]);
        
        console.log(`✅ 创建规则: ${rule.intent_name}`);
      }
    }
    
    // 3. 显示最终规则列表
    const [finalRules] = await connection.execute(`
      SELECT id, intent_name, category, status, priority
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY priority DESC
    `);
    
    console.log(`\n📋 最终规则列表 (${finalRules.length} 条):`);
    for (const rule of finalRules) {
      console.log(`${rule.id}. ${rule.intent_name} [${rule.category}] 优先级:${rule.priority}`);
    }
    
    await connection.end();
    console.log('\n🎉 规则库检查完成！');
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    if (connection) await connection.end();
  }
}

ensureRulesExist();
