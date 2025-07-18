// 添加基础工作规则
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function addBasicWorkingRules() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('🔧 添加基础工作规则...');
    
    // 清空现有规则
    await connection.execute(`DELETE FROM nlp_intent_rules`);
    console.log('✅ 已清空现有规则');
    
    // 添加基础规则，这些规则确保能匹配常用查询
    const basicRules = [
      {
        id: 1,
        intent_name: '库存查询_基础',
        description: '基础库存查询',
        category: '库存场景',
        example_query: '库存查询',
        trigger_words: '["库存查询","库存","物料库存","查库存","库存信息"]',
        action_target: 'SELECT material_name as 物料名称, supplier_name as 供应商, CAST(quantity AS CHAR) as 数量, status as 状态, DATE_FORMAT(inbound_time, "%Y-%m-%d") as 入库日期 FROM inventory WHERE status = "正常" ORDER BY inbound_time DESC LIMIT 100',
        status: 'active',
        priority: 100
      },
      {
        id: 2,
        intent_name: '聚龙供应商_库存查询',
        description: '聚龙供应商库存查询',
        category: '库存场景',
        example_query: '聚龙供应商',
        trigger_words: '["聚龙供应商","聚龙","聚龙光电"]',
        action_target: 'SELECT material_name as 物料名称, supplier_name as 供应商, CAST(quantity AS CHAR) as 数量, status as 状态, DATE_FORMAT(inbound_time, "%Y-%m-%d") as 入库日期 FROM inventory WHERE supplier_name LIKE "%聚龙%" ORDER BY inbound_time DESC LIMIT 100',
        status: 'active',
        priority: 95
      },
      {
        id: 3,
        intent_name: '检验结果_查询',
        description: '检验结果查询',
        category: '检验场景',
        example_query: '检验结果',
        trigger_words: '["检验结果","测试结果","检验","测试","全测试"]',
        action_target: 'SELECT test_id as 测试编号, material_name as 物料名称, test_result as 测试结果, conclusion as 结论, DATE_FORMAT(test_date, "%Y-%m-%d") as 测试日期 FROM lab_tests ORDER BY test_date DESC LIMIT 100',
        status: 'active',
        priority: 90
      },
      {
        id: 4,
        intent_name: '生产情况_查询',
        description: '生产情况查询',
        category: '生产场景',
        example_query: '生产情况',
        trigger_words: '["生产情况","上线情况","生产","上线","在线情况"]',
        action_target: 'SELECT batch_code as 批次号, material_name as 物料名称, factory as 工厂, CONCAT(ROUND(defect_rate * 100, 2), "%") as 缺陷率, DATE_FORMAT(online_date, "%Y-%m-%d") as 上线日期 FROM online_tracking ORDER BY online_date DESC LIMIT 100',
        status: 'active',
        priority: 85
      },
      {
        id: 5,
        intent_name: 'BOE供应商_库存查询',
        description: 'BOE供应商库存查询',
        category: '库存场景',
        example_query: 'BOE供应商',
        trigger_words: '["BOE供应商","BOE","BOE科技"]',
        action_target: 'SELECT material_name as 物料名称, supplier_name as 供应商, CAST(quantity AS CHAR) as 数量, status as 状态, DATE_FORMAT(inbound_time, "%Y-%m-%d") as 入库日期 FROM inventory WHERE supplier_name LIKE "%BOE%" ORDER BY inbound_time DESC LIMIT 100',
        status: 'active',
        priority: 88
      }
    ];
    
    // 插入规则
    for (const rule of basicRules) {
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
      
      console.log(`✅ 添加规则: ${rule.intent_name}`);
    }
    
    // 验证规则
    const [count] = await connection.execute(`
      SELECT COUNT(*) as total FROM nlp_intent_rules WHERE status = 'active'
    `);
    
    console.log(`\n📊 总共添加了 ${count[0].total} 条活跃规则`);
    
    // 测试规则匹配
    console.log('\n🧪 测试规则匹配:');
    
    const testQueries = ['库存查询', '聚龙供应商', '检验结果', '生产情况'];
    
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
    console.log('\n🎉 基础规则添加完成！请重启后端服务');
    
  } catch (error) {
    console.error('❌ 添加失败:', error.message);
    if (connection) await connection.end();
  }
}

addBasicWorkingRules();
