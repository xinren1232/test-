/**
 * 基于前端实际字段修复NLP规则
 */

import mysql from 'mysql2/promise';

async function fixRulesBasedOnFrontendFields() {
  console.log('🔧 基于前端实际字段修复NLP规则...\n');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root', 
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('📋 前端页面实际字段分析:');
    console.log('库存页面: 工厂, 仓库, 物料类型, 供应商名称, 供应商, 数量, 状态, 入库时间, 到期时间, 备注');
    console.log('上线数据页面: 测试编号, 日期, 项目, 基线, 物料类型, 数量, 物料名称, 供应商, 不合格描述, 备注');
    console.log('测试跟踪页面: 测试编号, 日期, 项目, 基线, 物料类型, 数量, 物料名称, 供应商, 不合格描述, 备注\n');
    
    // 1. 修复库存查询规则 - 基于实际数据库字段
    console.log('1. 修复库存查询规则...');
    await connection.query(`
      UPDATE nlp_intent_rules
      SET action_target = 'SELECT
        "未知" as 工厂,
        storage_location as 仓库,
        material_type as 物料类型,
        supplier_name as 供应商名称,
        supplier_name as 供应商,
        quantity as 数量,
        status as 状态,
        inbound_time as 入库时间,
        "未知" as 到期时间,
        notes as 备注
      FROM inventory
      WHERE material_name LIKE CONCAT(''%'', ?, ''%'')
      ORDER BY inbound_time DESC
      LIMIT 20'
      WHERE intent_name LIKE '%库存%' OR intent_name LIKE '%inventory%'
    `);
    
    // 2. 修复上线数据查询规则 - 基于实际数据库字段
    console.log('2. 修复上线数据查询规则...');
    await connection.query(`
      UPDATE nlp_intent_rules
      SET action_target = 'SELECT
        batch_code as 测试编号,
        online_date as 日期,
        project as 项目,
        workshop as 基线,
        material_code as 物料类型,
        "未知" as 数量,
        material_name as 物料名称,
        supplier_name as 供应商,
        CONCAT("不良率:", defect_rate, " 异常数:", exception_count) as 不合格描述,
        notes as 备注
      FROM online_tracking
      WHERE material_name LIKE CONCAT(''%'', ?, ''%'')
      ORDER BY online_date DESC
      LIMIT 20'
      WHERE intent_name LIKE '%生产%' OR intent_name LIKE '%上线%' OR intent_name LIKE '%online%'
    `);
    
    // 3. 修复测试跟踪查询规则 - 基于实际数据库字段
    console.log('3. 修复测试跟踪查询规则...');
    await connection.query(`
      UPDATE nlp_intent_rules
      SET action_target = 'SELECT
        test_id as 测试编号,
        test_date as 日期,
        "未知" as 项目,
        "未知" as 基线,
        material_code as 物料类型,
        "未知" as 数量,
        material_name as 物料名称,
        supplier_name as 供应商,
        defect_desc as 不合格描述,
        notes as 备注
      FROM lab_tests
      WHERE material_name LIKE CONCAT(''%'', ?, ''%'')
      ORDER BY test_date DESC
      LIMIT 20'
      WHERE intent_name LIKE '%测试%' OR intent_name LIKE '%实验%' OR intent_name LIKE '%lab%'
    `);
    
    // 4. 创建或更新NG物料查询规则
    console.log('4. 创建/更新NG物料查询规则...');
    
    const [existingNG] = await connection.query(
      "SELECT id FROM nlp_intent_rules WHERE intent_name LIKE '%NG%' OR intent_name LIKE '%不合格%'"
    );
    
    if (existingNG.length === 0) {
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
            "未知" as 项目,
            "未知" as 基线,
            material_code as 物料类型,
            "未知" as 数量,
            material_name as 物料名称,
            supplier_name as 供应商,
            defect_desc as 不合格描述,
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
      await connection.query(`
        UPDATE nlp_intent_rules 
        SET action_target = 'SELECT
          test_id as 测试编号,
          test_date as 日期,
          "未知" as 项目,
          "未知" as 基线,
          material_code as 物料类型,
          "未知" as 数量,
          material_name as 物料名称,
          supplier_name as 供应商,
          defect_desc as 不合格描述,
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
    
    // 5. 验证所有规则
    console.log('\n5. 验证所有规则...');
    
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
    
    console.log('\n🎉 基于前端实际字段的规则修复完成！');
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

fixRulesBasedOnFrontendFields();
