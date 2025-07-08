import initializeDatabase from './src/models/index.js';

async function fixAllFieldIssuesBasedOnRealPages() {
  console.log('🔧 基于真实页面字段修复所有规则...\n');
  
  try {
    const db = await initializeDatabase();
    const sequelize = db.sequelize;
    
    // 1. 确认所有表的实际字段
    console.log('1. 确认数据库表实际字段...');
    const tables = ['inventory', 'lab_tests', 'online_tracking'];
    const actualFields = {};
    
    for (const table of tables) {
      const columns = await sequelize.query(`DESCRIBE ${table}`, {
        type: sequelize.QueryTypes.SELECT
      });
      actualFields[table] = columns.map(col => col.Field);
      console.log(`${table}表字段: ${actualFields[table].join(', ')}`);
    }
    
    // 2. 检查实际数据样本
    console.log('\n2. 检查实际数据样本...');
    for (const table of tables) {
      const [sample] = await sequelize.query(`SELECT * FROM ${table} LIMIT 1`, {
        type: sequelize.QueryTypes.SELECT
      });
      
      if (sample) {
        console.log(`\n${table}表样本数据:`);
        Object.keys(sample).forEach(field => {
          const value = sample[field];
          console.log(`  - ${field}: ${value === null ? 'NULL' : String(value).substring(0, 30)}`);
        });
      }
    }
    
    // 3. 修复库存相关规则 - 移除不存在的字段
    console.log('\n3. 修复库存相关规则...');
    
    // 修复工厂库存查询 - 移除risk_level
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT 
        batch_code as 批次号,
        material_name as 物料名称,
        supplier_name as 供应商,
        quantity as 数量,
        storage_location as 存储位置,
        status as 状态,
        inbound_time as 入库时间
      FROM inventory 
      WHERE storage_location LIKE CONCAT(''%'', ?, ''%'')
      ORDER BY inbound_time DESC 
      LIMIT 20'
      WHERE intent_name = '工厂库存查询'
    `);
    
    // 修复供应商库存查询 - 移除risk_level
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT 
        material_name as 物料名称,
        supplier_name as 供应商,
        batch_code as 批次号,
        quantity as 数量,
        storage_location as 存储位置,
        status as 状态,
        inbound_time as 入库时间
      FROM inventory 
      WHERE supplier_name LIKE CONCAT(''%'', ?, ''%'')
      ORDER BY inbound_time DESC 
      LIMIT 20'
      WHERE intent_name = '供应商库存查询'
    `);
    
    // 修复批次状态查询 - 移除risk_level
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT
        batch_code as 批次号,
        material_name as 物料名称,
        supplier_name as 供应商,
        status as 状态,
        quantity as 数量,
        storage_location as 存储位置,
        inbound_time as 入库时间
      FROM inventory
      WHERE batch_code LIKE CONCAT(''%'', ?, ''%'')
      ORDER BY inbound_time DESC
      LIMIT 15'
      WHERE intent_name = '批次状态查询'
    `);
    
    // 修复状态查询规则 - 移除risk_level
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT 
        status as 状态,
        COUNT(*) as 数量,
        GROUP_CONCAT(DISTINCT material_name SEPARATOR '', '') as 物料清单,
        GROUP_CONCAT(DISTINCT supplier_name SEPARATOR '', '') as 供应商清单,
        SUM(quantity) as 总库存量
      FROM inventory 
      WHERE status LIKE CONCAT(''%'', ?, ''%'')
      GROUP BY status
      ORDER BY 数量 DESC'
      WHERE intent_name = '状态查询,风险查询,冻结查询,正常查询'
    `);
    
    console.log('✅ 库存相关规则已修复');
    
    // 4. 修复测试相关规则 - 确保使用正确字段
    console.log('\n4. 修复测试相关规则...');
    
    // 修复测试结果查询
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT 
        material_name as 物料名称,
        supplier_name as 供应商,
        batch_code as 批次号,
        test_result as 测试结果,
        test_item as 测试项目,
        test_date as 测试日期,
        conclusion as 结论,
        defect_desc as 缺陷描述,
        tester as 测试员
      FROM lab_tests 
      WHERE test_result LIKE CONCAT(''%'', ?, ''%'')
      ORDER BY test_date DESC 
      LIMIT 20'
      WHERE intent_name = '测试结果查询'
    `);
    
    // 修复缺陷分析查询
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT
        supplier_name as 供应商,
        material_name as 物料名称,
        COUNT(*) as 失败次数,
        GROUP_CONCAT(DISTINCT batch_code SEPARATOR '', '') as 批次列表,
        GROUP_CONCAT(DISTINCT defect_desc SEPARATOR ''; '') as 缺陷描述汇总
      FROM lab_tests
      WHERE test_result = ''FAIL''
      GROUP BY supplier_name, material_name
      ORDER BY 失败次数 DESC
      LIMIT 10'
      WHERE intent_name = '缺陷分析查询'
    `);
    
    console.log('✅ 测试相关规则已修复');
    
    // 5. 修复上线跟踪相关规则 - 确保使用正确字段
    console.log('\n5. 修复上线跟踪相关规则...');
    
    // 修复生产跟踪查询
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT
        material_name as 物料名称,
        supplier_name as 供应商,
        batch_code as 批次号,
        factory as 工厂,
        workshop as 车间,
        line as 产线,
        defect_rate as 不良率,
        exception_count as 异常次数,
        use_time as 使用时间,
        inspection_date as 检验时间
      FROM online_tracking
      WHERE material_name LIKE CONCAT(''%'', ?, ''%'')
      ORDER BY use_time DESC
      LIMIT 20'
      WHERE intent_name = '生产跟踪查询'
    `);
    
    // 修复产线不良率排名
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT
        factory as 工厂,
        workshop as 车间,
        line as 产线,
        AVG(defect_rate) as 平均不良率,
        COUNT(*) as 生产次数,
        SUM(exception_count) as 总异常次数
      FROM online_tracking
      WHERE defect_rate IS NOT NULL
      GROUP BY factory, workshop, line
      ORDER BY 平均不良率 DESC
      LIMIT 15'
      WHERE intent_name = '产线不良率排名'
    `);
    
    console.log('✅ 上线跟踪相关规则已修复');
    
    // 6. 删除所有使用不存在字段的规则内容
    console.log('\n6. 清理不存在的字段引用...');
    
    const problematicFields = ['risk_level', 'receiver', 'inspector'];
    
    for (const field of problematicFields) {
      const rulesWithField = await sequelize.query(
        `SELECT intent_name FROM nlp_intent_rules WHERE action_target LIKE '%${field}%'`,
        { type: sequelize.QueryTypes.SELECT }
      );
      
      if (rulesWithField.length > 0) {
        console.log(`发现使用${field}字段的规则: ${rulesWithField.map(r => r.intent_name).join(', ')}`);
        
        // 对于inventory表，如果字段确实不存在，则移除相关引用
        if (field === 'risk_level' && !actualFields.inventory.includes(field)) {
          console.log(`⚠️  ${field}字段在inventory表中不存在，需要手动检查相关规则`);
        }
      }
    }
    
    // 7. 验证所有修复后的规则
    console.log('\n7. 验证修复后的规则...');
    
    const testRules = [
      '工厂库存查询',
      '测试结果查询',
      '生产跟踪查询',
      '产线不良率排名',
      '缺陷分析查询'
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
    
    console.log('\n🎉 字段修复完成！');
    console.log(`📊 验证结果: ${successCount} 成功, ${failCount} 失败`);
    
    if (failCount === 0) {
      console.log('✅ 第一步完成：所有规则都使用了真实数据和实际字段');
      console.log('🚀 可以进行第二步：检查规则设计和功能效果');
    } else {
      console.log('⚠️  还有规则需要进一步修复');
    }
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

fixAllFieldIssuesBasedOnRealPages();
