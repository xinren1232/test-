/**
 * 插入优化的NLP规则
 */
import mysql from 'mysql2/promise';

async function insertOptimizedRules() {
  console.log('🔄 开始插入优化的NLP规则...');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 连接到数据库成功！');
    
    // 清空现有规则
    await connection.query('DELETE FROM nlp_intent_rules');
    
    // 插入优化的规则
    const rules = [
      {
        intent_name: '查询高风险库存',
        description: '查询所有风险等级为高的库存',
        action_type: 'SQL_QUERY',
        action_target: 'SELECT batch_code, material_name, supplier_name, quantity FROM inventory WHERE risk_level = "high"',
        parameters: JSON.stringify([]),
        example_query: '目前有哪些高风险库存？'
      },
      {
        intent_name: '查询库存,查库存',
        description: '根据物料编码查询库存信息',
        action_type: 'SQL_QUERY',
        action_target: 'SELECT batch_code, material_name, quantity, status, storage_location, risk_level FROM inventory WHERE material_code = ?',
        parameters: JSON.stringify([{ name: "material_code", type: "string", description: "物料编码" }]),
        example_query: '查询物料 M12345 的库存'
      },
      {
        intent_name: '查询测试结果,查测试',
        description: '根据批次号查询测试结果',
        action_type: 'SQL_QUERY',
        action_target: 'SELECT test_item, test_result, conclusion, defect_desc FROM lab_tests WHERE batch_code = ?',
        parameters: JSON.stringify([{ name: "batch_code", type: "string", description: "批次号" }]),
        example_query: '查询批号 BATCH001 的测试结果'
      },
      {
        intent_name: '查询不良品,查NG',
        description: '查询所有测试结果为NG的记录',
        action_type: 'SQL_QUERY',
        action_target: 'SELECT batch_code, material_name, test_item, defect_desc FROM lab_tests WHERE test_result = "NG"',
        parameters: JSON.stringify([]),
        example_query: '最近有哪些不良品？'
      },
      {
        intent_name: '查询物料合格率',
        description: '根据物料编码查询其测试合格率',
        action_type: 'SQL_QUERY',
        action_target: 'SELECT material_code, COUNT(*) as total, SUM(CASE WHEN test_result = "OK" THEN 1 ELSE 0 END) as passed FROM lab_tests WHERE material_code = ? GROUP BY material_code',
        parameters: JSON.stringify([{ name: "material_code", type: "string", description: "物料编码" }]),
        example_query: '物料 M12345 的合格率怎么样？'
      },
      {
        intent_name: '查询上线情况',
        description: '根据批次号查询其在产线上的使用情况',
        action_type: 'SQL_QUERY',
        action_target: 'SELECT factory, workshop, line, project, defect_rate, exception_count FROM online_tracking WHERE batch_code = ?',
        parameters: JSON.stringify([{ name: "batch_code", type: "string", description: "批次号" }]),
        example_query: '批号 BATCH001 在哪条产线用了？'
      },
      {
        intent_name: '查询供应商库存',
        description: '根据供应商名称查询其供应的物料库存',
        action_type: 'SQL_QUERY',
        action_target: 'SELECT batch_code, material_name, quantity, status FROM inventory WHERE supplier_name LIKE CONCAT("%", ?, "%")',
        parameters: JSON.stringify([{ name: "supplier_name", type: "string", description: "供应商名称" }]),
        example_query: '欣旺达的库存有哪些？'
      },
      {
        intent_name: '查询项目不良率',
        description: '查询特定项目相关物料的平均不良率',
        action_type: 'SQL_QUERY',
        action_target: 'SELECT project, AVG(defect_rate) as avg_defect_rate FROM online_tracking WHERE project LIKE CONCAT("%", ?, "%") GROUP BY project',
        parameters: JSON.stringify([{ name: "project", type: "string", description: "项目名称" }]),
        example_query: 'P001项目的不良率如何？'
      }
    ];
    
    // 插入规则
    for (const rule of rules) {
      await connection.query(
        'INSERT INTO nlp_intent_rules (intent_name, description, action_type, action_target, parameters, example_query, status) VALUES (?, ?, ?, ?, ?, ?, "active")',
        [rule.intent_name, rule.description, rule.action_type, rule.action_target, rule.parameters, rule.example_query]
      );
    }
    
    console.log(`✅ 成功插入 ${rules.length} 条NLP规则！`);
    
    // 验证插入的规则
    const [insertedRules] = await connection.query('SELECT * FROM nlp_intent_rules');
    console.log(`📊 数据库中共有 ${insertedRules.length} 条规则`);
    
    await connection.end();
    console.log('🎉 NLP规则插入完成！');
    
  } catch (error) {
    console.error('❌ NLP规则插入失败:', error);
    process.exit(1);
  }
}

insertOptimizedRules();
