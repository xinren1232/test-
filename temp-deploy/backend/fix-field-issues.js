import initializeDatabase from './src/models/index.js';

async function fixFieldIssues() {
  console.log('🔧 修复规则中的字段问题...\n');
  
  try {
    const db = await initializeDatabase();
    const sequelize = db.sequelize;
    
    // 1. 修复真实测试结果统计规则
    console.log('1. 修复真实测试结果统计规则...');
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT test_result, COUNT(*) as count, ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM lab_tests), 2) as percentage FROM lab_tests GROUP BY test_result'
      WHERE intent_name = '真实测试结果统计'
    `);
    console.log('✅ 真实测试结果统计规则已修复');
    
    // 2. 修复测试结果统计分析规则
    console.log('2. 修复测试结果统计分析规则...');
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT test_result, COUNT(*) as count, ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM lab_tests), 2) as percentage FROM lab_tests WHERE test_result IN (''PASS'', ''FAIL'') GROUP BY test_result'
      WHERE intent_name = '测试结果统计分析'
    `);
    console.log('✅ 测试结果统计分析规则已修复');
    
    // 3. 修复供应商查询规则
    console.log('3. 修复供应商查询规则...');
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT batch_code, material_name, supplier_name, quantity, storage_location, status, inbound_time FROM inventory WHERE supplier_name LIKE CONCAT("%", ?, "%") ORDER BY inbound_time DESC LIMIT 20'
      WHERE intent_name = '供应商查询'
    `);
    console.log('✅ 供应商查询规则已修复');
    
    // 4. 修复工厂库存统计规则中的字段截断问题
    console.log('4. 修复工厂库存统计规则...');
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT
        storage_location as 工厂,
        COUNT(DISTINCT material_name) as 物料种类,
        COUNT(*) as 批次数量,
        SUM(quantity) as 总库存,
        COUNT(CASE WHEN status = ''风险'' THEN 1 END) as 风险批次,
        ROUND(COUNT(CASE WHEN status = ''风险'' THEN 1 END) * 100.0 / COUNT(*), 2) as 风险比例
      FROM inventory
      WHERE storage_location LIKE CONCAT(''%'', ?, ''%'')
      GROUP BY storage_location
      ORDER BY 总库存 DESC'
      WHERE intent_name = '工厂库存统计'
    `);
    console.log('✅ 工厂库存统计规则已修复');
    
    // 5. 修复批次状态查询规则中的字段截断问题
    console.log('5. 修复批次状态查询规则...');
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT
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
    
    // 6. 修复供应商物料种类统计规则
    console.log('6. 修复供应商物料种类统计规则...');
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT
        supplier_name as 供应商,
        COUNT(DISTINCT material_name) as 物料种类数,
        COUNT(*) as 总批次数,
        SUM(quantity) as 总库存量,
        GROUP_CONCAT(DISTINCT material_name SEPARATOR '', '') as 物料清单
      FROM inventory
      WHERE supplier_name LIKE CONCAT(''%'', ?, ''%'')
      GROUP BY supplier_name
      ORDER BY 物料种类数 DESC'
      WHERE intent_name = '供应商物料种类统计'
    `);
    console.log('✅ 供应商物料种类统计规则已修复');
    
    // 7. 修复测试通过率分析规则
    console.log('7. 修复测试通过率分析规则...');
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT
        supplier_name as 供应商,
        material_name as 物料名称,
        COUNT(*) as 总测试次数,
        SUM(CASE WHEN test_result = ''PASS'' THEN 1 ELSE 0 END) as 通过次数,
        ROUND(SUM(CASE WHEN test_result = ''PASS'' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 通过率,
        COUNT(DISTINCT batch_code) as 批次数量
      FROM lab_tests
      WHERE supplier_name LIKE CONCAT(''%'', ?, ''%'')
      GROUP BY supplier_name, material_name
      ORDER BY 通过率 DESC'
      WHERE intent_name = '测试通过率分析'
    `);
    console.log('✅ 测试通过率分析规则已修复');
    
    // 8. 修复测试项目统计规则
    console.log('8. 修复测试项目统计规则...');
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT
        test_item as 测试项目,
        COUNT(*) as 测试次数,
        SUM(CASE WHEN test_result = ''PASS'' THEN 1 ELSE 0 END) as 通过次数,
        SUM(CASE WHEN test_result = ''FAIL'' THEN 1 ELSE 0 END) as 失败次数,
        ROUND(SUM(CASE WHEN test_result = ''PASS'' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 通过率
      FROM lab_tests
      GROUP BY test_item
      ORDER BY 测试次数 DESC'
      WHERE intent_name = '测试项目统计'
    `);
    console.log('✅ 测试项目统计规则已修复');
    
    // 9. 修复缺陷分析查询规则
    console.log('9. 修复缺陷分析查询规则...');
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT
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
    
    // 10. 修复物料测试覆盖率规则
    console.log('10. 修复物料测试覆盖率规则...');
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT
        i.material_name as 物料名称,
        i.supplier_name as 供应商,
        COUNT(DISTINCT i.batch_code) as 库存批次数,
        COUNT(DISTINCT t.batch_code) as 已测试批次数,
        ROUND(COUNT(DISTINCT t.batch_code) * 100.0 / COUNT(DISTINCT i.batch_code), 2) as 测试覆盖率
      FROM inventory i
      LEFT JOIN lab_tests t ON i.batch_code = t.batch_code
      WHERE i.material_name LIKE CONCAT(''%'', ?, ''%'')
      GROUP BY i.material_name, i.supplier_name
      ORDER BY 测试覆盖率 ASC'
      WHERE intent_name = '物料测试覆盖率'
    `);
    console.log('✅ 物料测试覆盖率规则已修复');
    
    // 11. 修复供应商质量对比规则
    console.log('11. 修复供应商质量对比规则...');
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT
        supplier_name as 供应商,
        COUNT(*) as 总测试次数,
        COUNT(DISTINCT material_name) as 物料种类,
        SUM(CASE WHEN test_result = ''PASS'' THEN 1 ELSE 0 END) as 通过次数,
        ROUND(SUM(CASE WHEN test_result = ''PASS'' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 通过率,
        COUNT(CASE WHEN test_result = ''FAIL'' THEN 1 END) as 失败次数
      FROM lab_tests
      GROUP BY supplier_name
      HAVING COUNT(*) >= 5
      ORDER BY 通过率 DESC'
      WHERE intent_name = '供应商质量对比'
    `);
    console.log('✅ 供应商质量对比规则已修复');
    
    // 12. 修复批次生产追踪规则
    console.log('12. 修复批次生产追踪规则...');
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT
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
    
    // 13. 修复供应商生产质量对比规则
    console.log('13. 修复供应商生产质量对比规则...');
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT
        supplier_name as 供应商,
        COUNT(*) as 生产使用次数,
        COUNT(DISTINCT material_name) as 物料种类,
        AVG(defect_rate) as 平均不良率,
        SUM(exception_count) as 总异常次数,
        COUNT(DISTINCT factory) as 使用工厂数
      FROM online_tracking
      GROUP BY supplier_name
      HAVING COUNT(*) >= 5
      ORDER BY 平均不良率 ASC'
      WHERE intent_name = '供应商生产质量对比'
    `);
    console.log('✅ 供应商生产质量对比规则已修复');
    
    console.log('\n🎉 所有字段问题修复完成！');
    
    // 验证修复结果
    console.log('\n🧪 验证修复结果...');
    const testRules = [
      '真实测试结果统计',
      '供应商查询', 
      '工厂库存统计',
      '测试通过率分析'
    ];
    
    for (const ruleName of testRules) {
      const [rule] = await sequelize.query(
        'SELECT * FROM nlp_intent_rules WHERE intent_name = ?',
        {
          replacements: [ruleName],
          type: sequelize.QueryTypes.SELECT
        }
      );
      
      if (rule) {
        console.log(`\n📋 验证规则: ${ruleName}`);
        try {
          let testSQL = rule.action_target;
          
          // 如果包含参数，用测试值替换
          if (testSQL.includes('?')) {
            testSQL = testSQL.replace(/\?/g, "'%'");
          }
          
          const results = await sequelize.query(testSQL, {
            type: sequelize.QueryTypes.SELECT
          });
          
          console.log(`✅ 执行成功，返回 ${results.length} 条记录`);
        } catch (error) {
          console.log(`❌ 执行失败: ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

fixFieldIssues();
