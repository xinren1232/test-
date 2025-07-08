import mysql from 'mysql2/promise';

async function simpleFixRules() {
  console.log('🔧 简化修复所有规则...\n');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root', 
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    // 1. 修复生产跟踪查询（移除不存在的quantity字段）
    console.log('1. 修复生产跟踪查询...');
    await connection.query(`
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
    
    // 2. 创建或更新NG物料详细信息规则
    console.log('2. 创建/更新NG物料详细信息规则...');
    
    // 先检查是否存在
    const [existingNG] = await connection.query(
      "SELECT id FROM nlp_intent_rules WHERE intent_name LIKE '%NG%' OR intent_name LIKE '%不合格%'"
    );
    
    if (existingNG.length === 0) {
      // 创建新规则
      await connection.query(`
        INSERT INTO nlp_intent_rules (
          intent_name, 
          description, 
          action_type, 
          action_target, 
          example_query,
          status,
          created_at, 
          updated_at
        ) VALUES (
          'NG物料详细信息',
          '查询测试失败的物料详细信息',
          'query',
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
          '查询NG物料',
          'active',
          NOW(),
          NOW()
        )
      `);
      console.log('✅ 创建NG物料规则');
    } else {
      // 更新现有规则
      await connection.query(`
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
        LIMIT 20',
        updated_at = NOW()
        WHERE intent_name LIKE '%NG%' OR intent_name LIKE '%不合格%'
      `);
      console.log('✅ 更新NG物料规则');
    }
    
    // 3. 验证所有规则
    console.log('\n3. 验证所有规则...');
    
    const [allRules] = await connection.query(
      'SELECT intent_name, action_target FROM nlp_intent_rules ORDER BY intent_name'
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
        
        const [results] = await connection.query(testSQL);
        
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
    
    console.log('\n🎉 简化修复完成！');
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
      console.log('请检查失败的规则并手动修复');
    }
    
    await connection.end();
    return { successCount, failCount, totalRules: allRules.length };
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
    return null;
  }
}

simpleFixRules();
