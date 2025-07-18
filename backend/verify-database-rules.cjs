// 验证数据库中的规则
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function verifyDatabaseRules() {
  let connection;
  try {
    console.log('🔍 验证数据库中的规则...\n');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 1. 检查表是否存在
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE 'nlp_intent_rules'
    `);
    
    if (tables.length === 0) {
      console.log('❌ nlp_intent_rules表不存在！');
      
      // 创建表
      console.log('🔧 正在创建表...');
      await connection.execute(`
        CREATE TABLE nlp_intent_rules (
          id INT PRIMARY KEY AUTO_INCREMENT,
          intent_name VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(100),
          example_query TEXT,
          trigger_words JSON,
          action_target TEXT,
          status VARCHAR(20) DEFAULT 'active',
          priority INT DEFAULT 50,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ 表创建成功');
    } else {
      console.log('✅ nlp_intent_rules表存在');
    }
    
    // 2. 检查现有数据
    const [count] = await connection.execute(`
      SELECT COUNT(*) as total FROM nlp_intent_rules
    `);
    
    console.log(`\n📊 现有规则数: ${count[0].total}`);
    
    // 3. 如果没有数据，插入基础规则
    if (count[0].total === 0) {
      console.log('\n🔧 插入基础规则...');
      
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
        
        console.log(`✅ 插入规则: ${rule.intent_name}`);
      }
    }
    
    // 4. 显示最终规则列表
    const [finalRules] = await connection.execute(`
      SELECT id, intent_name, category, status, priority
      FROM nlp_intent_rules 
      ORDER BY priority DESC
    `);
    
    console.log(`\n📋 最终规则列表 (${finalRules.length} 条):`);
    for (const rule of finalRules) {
      console.log(`${rule.id}. ${rule.intent_name} [${rule.category}] (${rule.status}) 优先级:${rule.priority}`);
    }
    
    // 5. 测试规则API格式
    console.log('\n🧪 测试规则API格式:');
    const [apiRules] = await connection.execute(`
      SELECT
        id,
        intent_name,
        description,
        action_type,
        action_target,
        parameters,
        trigger_words,
        synonyms,
        example_query,
        category,
        priority,
        sort_order,
        status,
        created_at,
        updated_at
      FROM nlp_intent_rules
      WHERE status = 'active'
      ORDER BY priority ASC, id ASC
    `);
    
    console.log(`API格式规则数: ${apiRules.length}`);
    if (apiRules.length > 0) {
      console.log('第一条规则API格式:');
      console.log(JSON.stringify(apiRules[0], null, 2));
    }
    
    await connection.end();
    console.log('\n🎉 数据库验证完成！');
    
  } catch (error) {
    console.error('❌ 验证失败:', error.message);
    console.error('错误详情:', error);
    if (connection) await connection.end();
  }
}

verifyDatabaseRules();
