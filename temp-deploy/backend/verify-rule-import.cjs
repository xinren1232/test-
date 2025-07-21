// 验证规则导入状态
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function verifyRuleImport() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查规则总数
    const [count] = await connection.execute(`
      SELECT COUNT(*) as total FROM nlp_intent_rules WHERE status = 'active'
    `);
    
    console.log(`活跃规则总数: ${count[0].total}`);
    
    if (count[0].total === 0) {
      console.log('❌ 没有活跃规则！需要重新导入规则库');
      
      // 重新导入规则库
      console.log('\n🔄 重新导入基础规则...');
      
      // 删除现有规则
      await connection.execute(`DELETE FROM nlp_intent_rules`);
      
      // 插入基础测试规则
      const basicRules = [
        {
          id: 1,
          intent_name: '库存查询_基础',
          description: '基础库存查询',
          category: '库存场景',
          example_query: '库存查询',
          trigger_words: JSON.stringify(['库存查询', '库存', '物料库存', '查库存']),
          action_target: `SELECT material_name as 物料名称, supplier_name as 供应商, CAST(quantity AS CHAR) as 数量, status as 状态 FROM inventory LIMIT 100`,
          status: 'active',
          priority: 100
        },
        {
          id: 2,
          intent_name: '检验查询_基础',
          description: '基础检验查询',
          category: '检验场景',
          example_query: '检验结果',
          trigger_words: JSON.stringify(['检验结果', '测试结果', '检验', '测试']),
          action_target: `SELECT test_id as 测试编号, material_name as 物料名称, test_result as 测试结果, conclusion as 结论 FROM lab_tests LIMIT 100`,
          status: 'active',
          priority: 90
        },
        {
          id: 3,
          intent_name: '生产查询_基础',
          description: '基础生产查询',
          category: '生产场景',
          example_query: '生产情况',
          trigger_words: JSON.stringify(['生产情况', '上线情况', '生产', '上线']),
          action_target: `SELECT batch_code as 批次号, material_name as 物料名称, factory as 工厂, CONCAT(ROUND(defect_rate * 100, 2), '%') as 缺陷率 FROM online_tracking LIMIT 100`,
          status: 'active',
          priority: 80
        }
      ];
      
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
      }
      
      console.log(`✅ 已插入 ${basicRules.length} 条基础规则`);
    }
    
    // 2. 显示前几条规则
    const [rules] = await connection.execute(`
      SELECT id, intent_name, trigger_words, category
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY id ASC
      LIMIT 5
    `);
    
    console.log('\n前5条规则:');
    for (const rule of rules) {
      console.log(`规则 ${rule.id}: ${rule.intent_name} (${rule.category})`);
      console.log(`  触发词: ${rule.trigger_words}`);
    }
    
    // 3. 测试规则匹配
    console.log('\n测试规则匹配:');
    
    const testQueries = ['库存查询', '检验结果', '生产情况'];
    
    for (const query of testQueries) {
      console.log(`\n查询: "${query}"`);
      
      let matched = false;
      for (const rule of rules) {
        let triggerWords = [];
        try {
          triggerWords = JSON.parse(rule.trigger_words);
        } catch (e) {
          triggerWords = [rule.trigger_words];
        }
        
        if (triggerWords.some(word => query.includes(word) || word.includes(query))) {
          console.log(`  ✅ 匹配规则: ${rule.intent_name}`);
          matched = true;
          break;
        }
      }
      
      if (!matched) {
        console.log(`  ❌ 未找到匹配规则`);
      }
    }
    
    await connection.end();
    console.log('\n✅ 验证完成');
    
  } catch (error) {
    console.error('❌ 验证失败:', error.message);
    if (connection) await connection.end();
  }
}

verifyRuleImport();
