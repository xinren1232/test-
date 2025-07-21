// 强制创建规则
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function forceCreateRules() {
  let connection;
  try {
    console.log('🔧 强制创建规则...');
    
    connection = await mysql.createConnection(dbConfig);
    
    // 清空现有规则
    await connection.execute(`DELETE FROM nlp_intent_rules`);
    console.log('✅ 已清空现有规则');
    
    // 逐个插入规则
    const rules = [
      {
        id: 1,
        intent_name: '库存查询_基础',
        description: '查询物料库存信息',
        category: '库存场景',
        example_query: '库存查询',
        trigger_words: '["库存查询", "库存", "物料库存", "查库存", "库存信息"]',
        action_target: 'SELECT material_name as 物料名称, supplier_name as 供应商, CAST(quantity AS CHAR) as 数量, status as 状态 FROM inventory LIMIT 100',
        status: 'active',
        priority: 100
      },
      {
        id: 2,
        intent_name: '聚龙供应商_库存查询',
        description: '查询聚龙供应商的库存信息',
        category: '库存场景',
        example_query: '聚龙供应商',
        trigger_words: '["聚龙供应商", "聚龙", "聚龙光电"]',
        action_target: 'SELECT material_name as 物料名称, supplier_name as 供应商, CAST(quantity AS CHAR) as 数量, status as 状态 FROM inventory WHERE supplier_name LIKE "%聚龙%" LIMIT 100',
        status: 'active',
        priority: 95
      },
      {
        id: 3,
        intent_name: 'BOE供应商_库存查询',
        description: '查询BOE供应商的库存信息',
        category: '库存场景',
        example_query: 'BOE供应商',
        trigger_words: '["BOE供应商", "BOE", "BOE科技"]',
        action_target: 'SELECT material_name as 物料名称, supplier_name as 供应商, CAST(quantity AS CHAR) as 数量, status as 状态 FROM inventory WHERE supplier_name LIKE "%BOE%" LIMIT 100',
        status: 'active',
        priority: 93
      },
      {
        id: 4,
        intent_name: '全测试_综合查询',
        description: '查询检验测试结果',
        category: '检验场景',
        example_query: '全测试',
        trigger_words: '["全测试", "检验结果", "测试结果", "检验", "测试"]',
        action_target: 'SELECT test_id as 测试编号, material_name as 物料名称, test_result as 测试结果, conclusion as 结论 FROM lab_tests LIMIT 100',
        status: 'active',
        priority: 90
      },
      {
        id: 5,
        intent_name: '生产上线_情况查询',
        description: '查询生产上线情况',
        category: '生产场景',
        example_query: '上线情况',
        trigger_words: '["上线情况", "生产情况", "生产", "上线"]',
        action_target: 'SELECT batch_code as 批次号, material_name as 物料名称, factory as 工厂, CONCAT(ROUND(defect_rate * 100, 2), "%") as 缺陷率 FROM online_tracking LIMIT 100',
        status: 'active',
        priority: 85
      }
    ];
    
    for (const rule of rules) {
      try {
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
        
        console.log(`✅ 插入规则 ${rule.id}: ${rule.intent_name}`);
      } catch (error) {
        console.log(`❌ 插入规则 ${rule.id} 失败: ${error.message}`);
      }
    }
    
    // 验证插入结果
    const [count] = await connection.execute(`
      SELECT COUNT(*) as total FROM nlp_intent_rules WHERE status = 'active'
    `);
    
    console.log(`\n📊 最终规则数: ${count[0].total}`);
    
    // 显示规则列表
    const [rulesList] = await connection.execute(`
      SELECT id, intent_name, trigger_words FROM nlp_intent_rules WHERE status = 'active'
    `);
    
    console.log('\n📋 规则列表:');
    for (const rule of rulesList) {
      console.log(`${rule.id}. ${rule.intent_name}`);
      console.log(`   触发词: ${rule.trigger_words}`);
    }
    
    await connection.end();
    console.log('\n🎉 规则创建完成！');
    
  } catch (error) {
    console.error('❌ 创建失败:', error.message);
    if (connection) await connection.end();
  }
}

forceCreateRules();
