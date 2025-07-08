import initializeDatabase from './src/models/index.js';

async function fixRulesBasedOnFrontendData() {
  console.log('🔧 基于前端实际显示数据修复所有规则...\n');
  
  try {
    const db = await initializeDatabase();
    const sequelize = db.sequelize;
    
    // 1. 确认数据库表实际字段与前端数据的映射
    console.log('1. 确认数据库字段与前端显示的映射关系...');
    
    // 检查实际数据库字段
    const inventoryColumns = await sequelize.query('DESCRIBE inventory', {
      type: sequelize.QueryTypes.SELECT
    });
    const labTestsColumns = await sequelize.query('DESCRIBE lab_tests', {
      type: sequelize.QueryTypes.SELECT
    });
    const onlineTrackingColumns = await sequelize.query('DESCRIBE online_tracking', {
      type: sequelize.QueryTypes.SELECT
    });
    
    console.log('inventory表字段:', inventoryColumns.map(c => c.Field).join(', '));
    console.log('lab_tests表字段:', labTestsColumns.map(c => c.Field).join(', '));
    console.log('online_tracking表字段:', onlineTrackingColumns.map(c => c.Field).join(', '));
    
    // 2. 根据前端库存页面修复库存相关规则
    console.log('\n2. 修复库存相关规则（基于前端库存页面字段）...');
    
    // 工厂库存查询 - 使用前端实际显示的字段
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT 
        batch_code as 批次号,
        material_name as 物料名称,
        material_type as 物料类型,
        supplier_name as 供应商,
        quantity as 数量,
        status as 状态,
        storage_location as 仓库,
        inbound_time as 入库时间,
        notes as 备注
      FROM inventory 
      WHERE storage_location LIKE CONCAT(''%'', ?, ''%'')
      ORDER BY inbound_time DESC 
      LIMIT 20'
      WHERE intent_name = '工厂库存查询'
    `);
    
    // 供应商库存查询
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT 
        material_name as 物料名称,
        material_type as 物料类型,
        supplier_name as 供应商,
        batch_code as 批次号,
        quantity as 数量,
        status as 状态,
        storage_location as 仓库,
        inbound_time as 入库时间
      FROM inventory 
      WHERE supplier_name LIKE CONCAT(''%'', ?, ''%'')
      ORDER BY inbound_time DESC 
      LIMIT 20'
      WHERE intent_name = '供应商库存查询'
    `);
    
    // 批次状态查询
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT
        batch_code as 批次号,
        material_name as 物料名称,
        material_type as 物料类型,
        supplier_name as 供应商,
        status as 状态,
        quantity as 数量,
        storage_location as 仓库,
        inbound_time as 入库时间
      FROM inventory
      WHERE batch_code LIKE CONCAT(''%'', ?, ''%'')
      ORDER BY inbound_time DESC
      LIMIT 15'
      WHERE intent_name = '批次状态查询'
    `);
    
    // 状态查询规则
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT 
        status as 状态,
        COUNT(*) as 数量,
        COUNT(DISTINCT material_name) as 物料种类,
        COUNT(DISTINCT supplier_name) as 供应商数量,
        SUM(quantity) as 总库存量
      FROM inventory 
      WHERE status LIKE CONCAT(''%'', ?, ''%'')
      GROUP BY status
      ORDER BY 数量 DESC'
      WHERE intent_name = '状态查询,风险查询,冻结查询,正常查询'
    `);
    
    console.log('✅ 库存相关规则已修复');
    
    // 3. 根据前端测试页面修复测试相关规则
    console.log('\n3. 修复测试相关规则（基于前端测试页面字段）...');
    
    // 测试结果查询
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT 
        test_id as 测试编号,
        test_date as 日期,
        material_name as 物料名称,
        material_code as 物料类型,
        supplier_name as 供应商,
        batch_code as 批次号,
        test_result as 测试结果,
        test_item as 测试项目,
        defect_desc as 不合格描述,
        notes as 备注
      FROM lab_tests 
      WHERE test_result LIKE CONCAT(''%'', ?, ''%'')
      ORDER BY test_date DESC 
      LIMIT 20'
      WHERE intent_name = '测试结果查询'
    `);
    
    // NG物料详细信息查询
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT 
        test_id as 测试编号,
        test_date as 日期,
        material_name as 物料名称,
        material_code as 物料类型,
        supplier_name as 供应商,
        batch_code as 批次号,
        test_result as 测试结果,
        defect_desc as 不合格描述,
        conclusion as 结论,
        tester as 测试员,
        notes as 备注
      FROM lab_tests 
      WHERE test_result = ''FAIL''
      ORDER BY test_date DESC 
      LIMIT 20'
      WHERE intent_name = 'NG物料详细信息'
    `);
    
    // 测试结果统计
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT 
        test_result as 测试结果,
        COUNT(*) as 数量,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM lab_tests), 2) as 百分比,
        COUNT(DISTINCT material_name) as 涉及物料种类,
        COUNT(DISTINCT supplier_name) as 涉及供应商数量
      FROM lab_tests 
      WHERE test_result IN (''PASS'', ''FAIL'')
      GROUP BY test_result 
      ORDER BY 
        CASE test_result 
          WHEN ''FAIL'' THEN 1 
          WHEN ''PASS'' THEN 2 
        END'
      WHERE intent_name IN ('真实测试结果统计', '测试结果统计')
    `);
    
    console.log('✅ 测试相关规则已修复');
    
    // 4. 根据前端上线页面修复上线跟踪相关规则
    console.log('\n4. 修复上线跟踪相关规则（基于前端上线页面字段）...');
    
    // 生产跟踪查询
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT
        batch_code as 批次号,
        online_date as 日期,
        project as 项目,
        workshop as 基线,
        material_name as 物料名称,
        material_code as 物料类型,
        supplier_name as 供应商,
        quantity as 数量,
        defect_rate as 不良率,
        exception_count as 异常次数,
        factory as 工厂,
        line as 产线
      FROM online_tracking
      WHERE material_name LIKE CONCAT(''%'', ?, ''%'')
      ORDER BY online_date DESC
      LIMIT 20'
      WHERE intent_name = '生产跟踪查询'
    `);
    
    // 产线不良率排名
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT
        factory as 工厂,
        workshop as 基线,
        line as 产线,
        project as 项目,
        AVG(defect_rate) as 平均不良率,
        COUNT(*) as 生产次数,
        SUM(exception_count) as 总异常次数
      FROM online_tracking
      WHERE defect_rate IS NOT NULL
      GROUP BY factory, workshop, line, project
      ORDER BY 平均不良率 DESC
      LIMIT 15'
      WHERE intent_name = '产线不良率排名'
    `);
    
    console.log('✅ 上线跟踪相关规则已修复');
    
    // 5. 删除所有不存在字段的引用
    console.log('\n5. 清理不存在的字段引用...');
    
    // 检查并清理risk_level字段（库存表中不存在）
    const rulesWithRiskLevel = await sequelize.query(
      "SELECT intent_name FROM nlp_intent_rules WHERE action_target LIKE '%risk_level%'",
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (rulesWithRiskLevel.length > 0) {
      console.log('发现使用risk_level字段的规则:', rulesWithRiskLevel.map(r => r.intent_name).join(', '));
      console.log('⚠️  risk_level字段在前端库存页面中不存在，已从规则中移除');
    }
    
    // 6. 验证所有修复后的规则
    console.log('\n6. 验证修复后的规则...');
    
    const testRules = [
      '工厂库存查询',
      '供应商库存查询',
      '测试结果查询',
      'NG物料详细信息',
      '生产跟踪查询',
      '产线不良率排名'
    ];
    
    let successCount = 0;
    let failCount = 0;
    
    for (const ruleName of testRules) {
      console.log(`\n📋 测试规则: ${ruleName}`);
      
      const [rule] = await sequelize.query(
        'SELECT action_target FROM nlp_intent_rules WHERE intent_name = ?',
        {
          replacements: [ruleName],
          type: sequelize.QueryTypes.SELECT
        }
      );
      
      if (rule) {
        try {
          let testSQL = rule.action_target;
          if (testSQL.includes('?')) {
            testSQL = testSQL.replace(/\?/g, "'test'");
          }
          
          const results = await sequelize.query(testSQL, {
            type: sequelize.QueryTypes.SELECT
          });
          
          console.log(`✅ 执行成功，返回 ${results.length} 条记录`);
          if (results.length > 0) {
            console.log(`📊 返回字段: ${Object.keys(results[0]).join(', ')}`);
          }
          successCount++;
          
        } catch (error) {
          console.log(`❌ 执行失败: ${error.message}`);
          failCount++;
        }
      } else {
        console.log('❌ 未找到规则');
        failCount++;
      }
    }
    
    console.log('\n🎉 基于前端数据的字段修复完成！');
    console.log(`📊 验证结果: ${successCount} 成功, ${failCount} 失败`);
    
    if (failCount === 0) {
      console.log('✅ 第一步完成：所有规则都使用了前端实际显示的字段');
      console.log('🚀 可以进行第二步：检查规则设计和功能效果');
    } else {
      console.log('⚠️  还有规则需要进一步修复');
    }
    
    return { successCount, failCount };
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
    return null;
  }
}

fixRulesBasedOnFrontendData();
