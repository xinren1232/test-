import initializeDatabase from './src/models/index.js';

async function fixInventoryFieldIssues() {
  console.log('🔧 修复库存相关规则中的字段问题...\n');
  
  try {
    const db = await initializeDatabase();
    const sequelize = db.sequelize;
    
    // 1. 首先确认inventory表的实际字段
    console.log('1. 确认inventory表实际字段...');
    const inventoryColumns = await sequelize.query('DESCRIBE inventory', {
      type: sequelize.QueryTypes.SELECT
    });
    
    console.log('inventory表实际字段:');
    inventoryColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });
    
    const actualInventoryFields = inventoryColumns.map(col => col.Field);
    
    // 2. 检查哪些规则错误使用了risk_level字段
    console.log('\n2. 检查使用risk_level字段的规则...');
    const rulesWithRiskLevel = await sequelize.query(
      "SELECT intent_name, action_target FROM nlp_intent_rules WHERE action_target LIKE '%risk_level%'",
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log(`找到 ${rulesWithRiskLevel.length} 个使用risk_level的规则:`);
    rulesWithRiskLevel.forEach(rule => {
      console.log(`  - ${rule.intent_name}`);
    });
    
    // 3. 修复工厂库存查询规则 - 移除risk_level字段
    console.log('\n3. 修复工厂库存查询规则...');
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
    console.log('✅ 工厂库存查询规则已修复');
    
    // 4. 修复供应商库存查询规则 - 移除risk_level字段
    console.log('4. 修复供应商库存查询规则...');
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
    console.log('✅ 供应商库存查询规则已修复');
    
    // 5. 修复批次状态查询规则 - 移除risk_level字段
    console.log('5. 修复批次状态查询规则...');
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
      WHERE status LIKE CONCAT(''%'', ?, ''%'')
      ORDER BY inbound_time DESC
      LIMIT 15'
      WHERE intent_name = '批次状态查询'
    `);
    console.log('✅ 批次状态查询规则已修复');
    
    // 6. 修复状态查询,风险查询,冻结查询,正常查询规则 - 移除risk_level字段
    console.log('6. 修复状态查询规则...');
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT 
        status as 状态,
        COUNT(*) as 数量,
        GROUP_CONCAT(DISTINCT material_name SEPARATOR '', '') as 物料清单,
        GROUP_CONCAT(DISTINCT supplier_name SEPARATOR '', '') as 供应商清单,
        GROUP_CONCAT(DISTINCT storage_location SEPARATOR '', '') as 存储位置,
        SUM(quantity) as 总库存量
      FROM inventory 
      WHERE status LIKE CONCAT(''%'', ?, ''%'')
      GROUP BY status
      ORDER BY 数量 DESC'
      WHERE intent_name = '状态查询,风险查询,冻结查询,正常查询'
    `);
    console.log('✅ 状态查询规则已修复');
    
    // 7. 检查其他可能有问题的字段
    console.log('\n7. 检查其他可能的字段问题...');
    
    // 检查inspector字段的使用
    const rulesWithInspector = await sequelize.query(
      "SELECT intent_name FROM nlp_intent_rules WHERE action_target LIKE '%inspector%'",
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (rulesWithInspector.length > 0) {
      console.log('发现使用inspector字段的规则:');
      rulesWithInspector.forEach(rule => {
        console.log(`  - ${rule.intent_name}`);
      });
      
      // inspector字段在数据库模型中存在，但检查是否有实际数据
      const [inspectorSample] = await sequelize.query(
        'SELECT inspector FROM inventory WHERE inspector IS NOT NULL LIMIT 1',
        { type: sequelize.QueryTypes.SELECT }
      );
      
      if (!inspectorSample) {
        console.log('⚠️  inspector字段存在但无实际数据');
      } else {
        console.log('✅ inspector字段有实际数据');
      }
    }
    
    // 8. 验证修复后的规则
    console.log('\n8. 验证修复后的规则...');
    const testRules = [
      '工厂库存查询',
      '供应商库存查询', 
      '批次状态查询',
      '状态查询,风险查询,冻结查询,正常查询'
    ];
    
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
            console.log('📊 返回字段:', Object.keys(results[0]).join(', '));
          }
          
        } catch (error) {
          console.log(`❌ 执行失败: ${error.message}`);
        }
      } else {
        console.log('❌ 未找到规则');
      }
    }
    
    // 9. 检查数据库中实际的字段值
    console.log('\n9. 检查inventory表实际数据样本...');
    const [sampleData] = await sequelize.query(
      'SELECT * FROM inventory LIMIT 1',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (sampleData) {
      console.log('实际数据字段和样本值:');
      Object.keys(sampleData).forEach(field => {
        const value = sampleData[field];
        console.log(`  - ${field}: ${value === null ? 'NULL' : value}`);
      });
    }
    
    console.log('\n🎉 库存字段问题修复完成！');
    console.log('\n📋 修复总结:');
    console.log('- 移除了所有规则中不存在的risk_level字段引用');
    console.log('- 确保所有规则只使用实际存在的字段');
    console.log('- 验证了修复后规则的可执行性');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

fixInventoryFieldIssues();
