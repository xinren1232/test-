import initializeDatabase from './src/models/index.js';

async function fixProblematicRules() {
  console.log('🔧 修复有问题的规则...\n');
  
  try {
    const db = await initializeDatabase();
    const sequelize = db.sequelize;
    
    // 修复规则3: 批次状态查询
    console.log('1. 修复批次状态查询规则...');
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET 
        example_query = '查询风险状态的批次',
        action_target = 'SELECT
        batch_code as 批次号,
        material_name as 物料名称,
        supplier_name as 供应商,
        status as 状态,
        risk_level as 风险等级,
        quantity as 数量,
        storage_location as 位置
      FROM inventory
      WHERE status LIKE CONCAT(''%'', ?, ''%'')
      ORDER BY inbound_time DESC
      LIMIT 15'
      WHERE intent_name = '批次状态查询'
    `);
    console.log('✅ 批次状态查询规则已修复');
    
    // 修复规则10: 批次追溯查询 - 使用实际存在的批次号
    console.log('2. 修复批次追溯查询规则...');
    const [sampleBatch] = await sequelize.query('SELECT batch_code FROM inventory LIMIT 1', {
      type: sequelize.QueryTypes.SELECT
    });
    
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET 
        example_query = '追溯批次${sampleBatch.batch_code}的完整信息',
        action_target = 'SELECT
        ''库存'' as 数据源,
        batch_code as 批次号,
        material_name as 物料名称,
        supplier_name as 供应商,
        inbound_time as 时间,
        status as 状态
      FROM inventory
      WHERE batch_code LIKE CONCAT(''%'', ?, ''%'')
      UNION ALL
      SELECT
        ''测试'' as 数据源,
        batch_code as 批次号,
        material_name as 物料名称,
        supplier_name as 供应商,
        test_date as 时间,
        test_result as 状态
      FROM lab_tests
      WHERE batch_code LIKE CONCAT(''%'', ?, ''%'')
      ORDER BY 时间 DESC'
      WHERE intent_name = '批次追溯查询'
    `);
    console.log('✅ 批次追溯查询规则已修复');
    
    // 修复规则15: 缺陷分析查询 - 改为查询所有失败记录
    console.log('3. 修复缺陷分析查询规则...');
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET 
        example_query = '分析测试失败的记录',
        action_target = 'SELECT
        supplier_name as 供应商,
        material_name as 物料名称,
        COUNT(*) as 失败次数,
        GROUP_CONCAT(DISTINCT batch_code SEPARATOR '', '') as 批次列表
      FROM lab_tests
      WHERE test_result = ''FAIL''
      GROUP BY supplier_name, material_name
      ORDER BY 失败次数 DESC
      LIMIT 10'
      WHERE intent_name = '缺陷分析查询'
    `);
    console.log('✅ 缺陷分析查询规则已修复');
    
    // 修复规则17: 批次测试历史
    console.log('4. 修复批次测试历史规则...');
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET 
        example_query = '查询批次${sampleBatch.batch_code}的测试历史',
        action_target = 'SELECT
        test_date as 测试日期,
        test_item as 测试项目,
        test_result as 测试结果,
        conclusion as 结论,
        material_name as 物料名称,
        supplier_name as 供应商
      FROM lab_tests
      WHERE batch_code LIKE CONCAT(''%'', ?, ''%'')
      ORDER BY test_date DESC'
      WHERE intent_name = '批次测试历史'
    `);
    console.log('✅ 批次测试历史规则已修复');
    
    // 修复规则25: 批次生产追踪
    console.log('5. 修复批次生产追踪规则...');
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET 
        example_query = '追踪批次${sampleBatch.batch_code}的生产使用情况',
        action_target = 'SELECT
        use_time as 使用时间,
        factory as 工厂,
        workshop as 车间,
        line as 产线,
        defect_rate as 不良率,
        exception_count as 异常次数,
        material_name as 物料名称,
        supplier_name as 供应商
      FROM online_tracking
      WHERE batch_code LIKE CONCAT(''%'', ?, ''%'')
      ORDER BY use_time DESC'
      WHERE intent_name = '批次生产追踪'
    `);
    console.log('✅ 批次生产追踪规则已修复');
    
    // 修复规则29: 供应商查询 - 修正字段名
    console.log('6. 修复供应商查询规则...');
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET 
        example_query = '查询富群供应商的库存',
        action_target = 'SELECT * FROM inventory WHERE supplier_name LIKE CONCAT("%", ?, "%") ORDER BY inbound_time DESC LIMIT 20'
      WHERE intent_name = '供应商查询'
    `);
    console.log('✅ 供应商查询规则已修复');
    
    console.log('\n🎉 所有问题规则修复完成！');
    
    // 验证修复结果
    console.log('\n🧪 验证修复结果...');
    const problematicRules = [
      '批次状态查询',
      '批次追溯查询', 
      '缺陷分析查询',
      '批次测试历史',
      '批次生产追踪',
      '供应商查询'
    ];
    
    for (const ruleName of problematicRules) {
      const [rule] = await sequelize.query(
        'SELECT * FROM nlp_intent_rules WHERE intent_name = ?',
        {
          replacements: [ruleName],
          type: sequelize.QueryTypes.SELECT
        }
      );
      
      if (rule) {
        console.log(`\n📋 ${ruleName}:`);
        console.log(`示例查询: ${rule.example_query}`);
        console.log(`SQL模板: ${rule.action_target.substring(0, 100)}...`);
      }
    }
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

fixProblematicRules();
