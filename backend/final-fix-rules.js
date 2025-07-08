import initializeDatabase from './src/models/index.js';

async function finalFixRules() {
  console.log('🔧 最终修复所有规则问题...\n');
  
  try {
    const db = await initializeDatabase();
    const sequelize = db.sequelize;
    
    // 1. 检查online_tracking表的实际字段
    console.log('1. 检查online_tracking表实际字段...');
    const onlineColumns = await sequelize.query('DESCRIBE online_tracking', {
      type: sequelize.QueryTypes.SELECT
    });
    console.log('online_tracking表字段:', onlineColumns.map(c => c.Field).join(', '));
    
    // 2. 修复生产跟踪查询（online_tracking表没有quantity字段）
    console.log('\n2. 修复生产跟踪查询...');
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
        defect_rate as 不良率,
        exception_count as 异常次数,
        factory as 工厂,
        line as 产线,
        operator as 操作员
      FROM online_tracking
      WHERE material_name LIKE CONCAT(''%'', ?, ''%'')
      ORDER BY online_date DESC
      LIMIT 20'
      WHERE intent_name = '生产跟踪查询'
    `);
    
    // 3. 检查并修复NG物料详细信息规则
    console.log('\n3. 检查NG物料详细信息规则...');
    const ngRule = await sequelize.query(
      "SELECT * FROM nlp_intent_rules WHERE intent_name LIKE '%NG%'",
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (ngRule.length === 0) {
      console.log('未找到NG物料规则，创建新规则...');
      await sequelize.query(`
        INSERT INTO nlp_intent_rules (intent_name, description, field_mapping, action_target, created_at, updated_at)
        VALUES (
          'NG物料详细信息',
          '查询测试失败的物料详细信息',
          '{"物料名称": "material_name", "供应商": "supplier_name", "批次号": "batch_code"}',
          'SELECT 
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
          LIMIT 20',
          NOW(),
          NOW()
        )
      `);
    } else {
      console.log('找到NG物料规则，更新...');
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
        WHERE intent_name LIKE '%NG%'
      `);
    }
    
    // 4. 创建基于前端实际显示的完整规则集
    console.log('\n4. 创建基于前端实际显示的完整规则集...');
    
    const frontendBasedRules = [
      {
        name: '库存状态分布',
        description: '查询各种状态的库存分布情况',
        sql: `SELECT 
          status as 状态,
          COUNT(*) as 数量,
          ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM inventory), 2) as 百分比,
          COUNT(DISTINCT material_type) as 物料种类,
          COUNT(DISTINCT supplier_name) as 供应商数量
        FROM inventory 
        GROUP BY status 
        ORDER BY 数量 DESC`
      },
      {
        name: '物料类型统计',
        description: '统计各物料类型的库存情况',
        sql: `SELECT 
          material_type as 物料类型,
          COUNT(*) as 批次数量,
          COUNT(DISTINCT supplier_name) as 供应商数量,
          SUM(quantity) as 总库存量,
          COUNT(CASE WHEN status = '正常' THEN 1 END) as 正常批次,
          COUNT(CASE WHEN status = '冻结' THEN 1 END) as 冻结批次
        FROM inventory 
        GROUP BY material_type 
        ORDER BY 批次数量 DESC 
        LIMIT 15`
      },
      {
        name: '供应商质量表现',
        description: '分析供应商的质量表现',
        sql: `SELECT 
          i.supplier_name as 供应商,
          COUNT(DISTINCT i.batch_code) as 供货批次,
          COUNT(DISTINCT l.test_id) as 测试次数,
          COUNT(CASE WHEN l.test_result = 'PASS' THEN 1 END) as 通过次数,
          COUNT(CASE WHEN l.test_result = 'FAIL' THEN 1 END) as 失败次数,
          ROUND(COUNT(CASE WHEN l.test_result = 'PASS' THEN 1 END) * 100.0 / COUNT(l.test_id), 2) as 通过率
        FROM inventory i
        LEFT JOIN lab_tests l ON i.batch_code = l.batch_code
        WHERE l.test_id IS NOT NULL
        GROUP BY i.supplier_name
        HAVING COUNT(l.test_id) > 0
        ORDER BY 通过率 ASC, 测试次数 DESC
        LIMIT 15`
      }
    ];
    
    for (const rule of frontendBasedRules) {
      const existing = await sequelize.query(
        'SELECT id FROM nlp_intent_rules WHERE intent_name = ?',
        {
          replacements: [rule.name],
          type: sequelize.QueryTypes.SELECT
        }
      );
      
      if (existing.length === 0) {
        await sequelize.query(`
          INSERT INTO nlp_intent_rules (intent_name, description, field_mapping, action_target, created_at, updated_at)
          VALUES (?, ?, '{}', ?, NOW(), NOW())
        `, {
          replacements: [rule.name, rule.description, rule.sql]
        });
        console.log(`✅ 创建规则: ${rule.name}`);
      } else {
        await sequelize.query(`
          UPDATE nlp_intent_rules 
          SET action_target = ?, description = ?, updated_at = NOW()
          WHERE intent_name = ?
        `, {
          replacements: [rule.sql, rule.description, rule.name]
        });
        console.log(`✅ 更新规则: ${rule.name}`);
      }
    }
    
    // 5. 最终验证所有规则
    console.log('\n5. 最终验证所有规则...');
    
    const allRules = await sequelize.query(
      'SELECT intent_name, action_target FROM nlp_intent_rules ORDER BY intent_name',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    let successCount = 0;
    let failCount = 0;
    
    for (const rule of allRules) {
      console.log(`\n📋 验证规则: ${rule.intent_name}`);
      
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
          const fields = Object.keys(results[0]);
          console.log(`📊 返回字段 (${fields.length}个): ${fields.slice(0, 5).join(', ')}${fields.length > 5 ? '...' : ''}`);
        }
        successCount++;
        
      } catch (error) {
        console.log(`❌ 执行失败: ${error.message}`);
        failCount++;
      }
    }
    
    console.log('\n🎉 最终修复完成！');
    console.log(`📊 验证结果: ${successCount} 成功, ${failCount} 失败`);
    console.log(`📋 总规则数: ${allRules.length}`);
    
    if (failCount === 0) {
      console.log('\n✅ 第一步完成：所有规则都使用前端实际字段且可正常执行');
      console.log('🚀 现在可以进行第二步：测试规则的实际功能效果');
      console.log('\n📋 可用的规则列表:');
      allRules.forEach((rule, index) => {
        console.log(`${index + 1}. ${rule.intent_name}`);
      });
    } else {
      console.log('\n⚠️  还有规则需要进一步修复');
    }
    
    return { successCount, failCount, totalRules: allRules.length };
    
  } catch (error) {
    console.error('❌ 最终修复失败:', error.message);
    return null;
  }
}

finalFixRules();
