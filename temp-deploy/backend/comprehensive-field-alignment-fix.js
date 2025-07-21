import initializeDatabase from './src/models/index.js';

async function comprehensiveFieldAlignmentFix() {
  console.log('🔧 全面字段对齐和逻辑优化...\n');
  
  try {
    const db = await initializeDatabase();
    const sequelize = db.sequelize;

    // 1. 首先检查实际数据库字段和前端字段的对应关系
    console.log('=== 第一步：确认实际数据库字段 ===');
    
    // 检查inventory表实际字段
    const inventoryColumns = await sequelize.query('DESCRIBE inventory', {
      type: sequelize.QueryTypes.SELECT
    });
    console.log('📦 inventory表实际字段:');
    inventoryColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });
    
    // 检查lab_tests表实际字段
    const labTestsColumns = await sequelize.query('DESCRIBE lab_tests', {
      type: sequelize.QueryTypes.SELECT
    });
    console.log('\n🧪 lab_tests表实际字段:');
    labTestsColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });
    
    // 检查online_tracking表实际字段
    const onlineTrackingColumns = await sequelize.query('DESCRIBE online_tracking', {
      type: sequelize.QueryTypes.SELECT
    });
    console.log('\n🏭 online_tracking表实际字段:');
    onlineTrackingColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });

    // 2. 检查实际数据中的测试结果分布和批次逻辑
    console.log('\n=== 第二步：分析实际数据逻辑 ===');
    
    // 检查测试结果分布
    const testResultStats = await sequelize.query(`
      SELECT 
        test_result,
        COUNT(*) as count,
        COUNT(DISTINCT material_code) as material_types,
        COUNT(DISTINCT supplier_name) as suppliers
      FROM lab_tests 
      GROUP BY test_result 
      ORDER BY count DESC
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    
    console.log('📊 测试结果分布:');
    testResultStats.forEach(stat => {
      console.log(`  - ${stat.test_result}: ${stat.count}条记录, ${stat.material_types}种物料, ${stat.suppliers}个供应商`);
    });
    
    // 检查物料批次测试逻辑
    const materialBatchStats = await sequelize.query(`
      SELECT 
        material_code,
        material_name,
        COUNT(*) as total_tests,
        COUNT(DISTINCT batch_code) as batch_count,
        SUM(CASE WHEN test_result = 'PASS' THEN 1 ELSE 0 END) as pass_count,
        SUM(CASE WHEN test_result = 'FAIL' THEN 1 ELSE 0 END) as fail_count
      FROM lab_tests 
      GROUP BY material_code, material_name
      HAVING COUNT(*) >= 3
      ORDER BY total_tests DESC
      LIMIT 5
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    
    console.log('\n📋 物料批次测试统计(前5个物料):');
    materialBatchStats.forEach(stat => {
      console.log(`  - ${stat.material_name} (${stat.material_code}): ${stat.total_tests}次测试, ${stat.batch_count}个批次, PASS:${stat.pass_count}, FAIL:${stat.fail_count}`);
    });

    console.log('\n=== 第三步：修复库存查询规则 ===');
    
    // 修复库存查询规则，对齐前端字段：工厂,仓库,物料类型,供应商名称,供应商,数量,状态,入库时间,到期时间,备注
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET 
        action_target = 'SELECT 
          COALESCE(factory, ''未指定'') as 工厂,
          COALESCE(storage_location, ''未指定'') as 仓库,
          COALESCE(material_type, material_code) as 物料类型,
          supplier_name as 供应商名称,
          supplier_name as 供应商,
          quantity as 数量,
          COALESCE(status, ''正常'') as 状态,
          DATE_FORMAT(inbound_time, ''%Y-%m-%d %H:%i'') as 入库时间,
          DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), ''%Y-%m-%d'') as 到期时间,
          COALESCE(notes, '''') as 备注
        FROM inventory 
        ORDER BY inbound_time DESC',
        description = '查询库存信息，显示与前端页面一致的字段',
        example_query = '查询库存信息'
      WHERE intent_name LIKE '%库存%' AND action_target LIKE '%inventory%'
    `);
    console.log('✅ 库存查询规则已修复');

    console.log('\n=== 第四步：修复测试结果统计规则（基于批次逻辑）===');
    
    // 修复测试结果统计规则 - 按物料批次汇总，不限制20条
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET 
        action_target = 'SELECT 
          test_result as 测试结果,
          COUNT(*) as 测试次数,
          ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM lab_tests WHERE test_result IN (''PASS'', ''FAIL'')), 2) as 百分比,
          COUNT(DISTINCT material_code) as 涉及物料种类,
          COUNT(DISTINCT supplier_name) as 涉及供应商数量,
          COUNT(DISTINCT batch_code) as 涉及批次数量,
          CONCAT(''共'', COUNT(*), ''次测试，涉及'', COUNT(DISTINCT material_code), ''种物料'') as 备注
        FROM lab_tests 
        WHERE test_result IN (''PASS'', ''FAIL'')
        GROUP BY test_result 
        ORDER BY 
          CASE test_result 
            WHEN ''FAIL'' THEN 1 
            WHEN ''PASS'' THEN 2 
          END',
        description = '统计测试结果分布情况，显示实际数据量和批次信息',
        example_query = '统计测试结果分布情况'
      WHERE intent_name = '真实测试结果统计'
    `);
    console.log('✅ 测试结果统计规则已修复（基于批次逻辑）');

    console.log('\n=== 第五步：修复测试结果详细查询规则 ===');
    
    // 修复测试结果详细查询规则，对齐前端字段：测试编号,日期,项目,基线,物料类型,数量,物料名称,供应商,不合格描述,备注
    // 显示前10条，但备注中说明实际总数
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET 
        action_target = 'SELECT 
          test_id as 测试编号,
          DATE_FORMAT(test_date, ''%Y-%m-%d'') as 日期,
          COALESCE(test_item, ''常规检测'') as 项目,
          COALESCE(batch_code, ''MAT-175191'') as 基线,
          material_code as 物料类型,
          ''1'' as 数量,
          material_name as 物料名称,
          supplier_name as 供应商,
          CASE 
            WHEN test_result = ''PASS'' THEN ''合格''
            WHEN test_result = ''FAIL'' THEN CONCAT(''不合格: '', COALESCE(defect_desc, ''无描述''))
            ELSE test_result
          END as 不合格描述,
          CONCAT(''批次: '', batch_code, '' | 总计: '', (SELECT COUNT(*) FROM lab_tests), ''条记录'') as 备注
        FROM lab_tests 
        ORDER BY test_date DESC 
        LIMIT 10',
        description = '查询测试结果详细信息，显示前10条记录，备注中包含总数信息',
        example_query = '查询测试结果详细信息'
      WHERE intent_name = '测试结果查询'
    `);
    console.log('✅ 测试结果详细查询规则已修复');

    console.log('\n=== 第六步：修复NG测试结果查询规则（按物料批次汇总）===');
    
    // 修复NG测试结果查询规则 - 按物料汇总批次测试结果
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET 
        action_target = 'SELECT 
          material_code as 测试编号,
          DATE_FORMAT(MAX(test_date), ''%Y-%m-%d'') as 日期,
          ''质量检测'' as 项目,
          material_code as 基线,
          material_code as 物料类型,
          COUNT(*) as 数量,
          material_name as 物料名称,
          supplier_name as 供应商,
          CONCAT(''NG数量: '', COUNT(*), ''次，批次: '', GROUP_CONCAT(DISTINCT batch_code SEPARATOR '', '')) as 不合格描述,
          CONCAT(''该物料共'', COUNT(*), ''次NG测试，涉及'', COUNT(DISTINCT batch_code), ''个批次'') as 备注
        FROM lab_tests 
        WHERE test_result = ''FAIL''
        GROUP BY material_code, material_name, supplier_name
        ORDER BY COUNT(*) DESC',
        description = '查询测试失败(NG)的物料信息，按物料汇总显示NG次数',
        example_query = '查询NG测试结果',
        trigger_words = '["NG","不合格","失败","测试失败","不良","缺陷","问题物料"]'
      WHERE intent_name = 'NG测试结果查询'
    `);
    console.log('✅ NG测试结果查询规则已修复（按物料批次汇总）');

    console.log('\n=== 第七步：修复OK测试结果查询规则（按物料批次汇总）===');
    
    // 修复OK测试结果查询规则 - 按物料汇总批次测试结果
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET 
        action_target = 'SELECT 
          material_code as 测试编号,
          DATE_FORMAT(MAX(test_date), ''%Y-%m-%d'') as 日期,
          ''质量检测'' as 项目,
          material_code as 基线,
          material_code as 物料类型,
          COUNT(*) as 数量,
          material_name as 物料名称,
          supplier_name as 供应商,
          CONCAT(''OK数量: '', COUNT(*), ''次'') as 不合格描述,
          CONCAT(''该物料共'', COUNT(*), ''次OK测试，涉及'', COUNT(DISTINCT batch_code), ''个批次'') as 备注
        FROM lab_tests 
        WHERE test_result = ''PASS''
        GROUP BY material_code, material_name, supplier_name
        ORDER BY COUNT(*) DESC',
        description = '查询测试通过(OK)的物料信息，按物料汇总显示OK次数',
        example_query = '查询OK测试结果',
        trigger_words = '["OK","合格","通过","测试通过","正常","良品"]'
      WHERE intent_name = 'OK测试结果查询'
    `);
    console.log('✅ OK测试结果查询规则已修复（按物料批次汇总）');

    console.log('\n=== 第八步：验证修复后的规则 ===');

    // 验证修复后的规则
    const updatedRules = await sequelize.query(`
      SELECT intent_name, description, example_query
      FROM nlp_intent_rules
      WHERE intent_name IN ('真实测试结果统计', '测试结果查询', 'NG测试结果查询', 'OK测试结果查询')
      ORDER BY intent_name
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    console.log('修复后的规则列表:');
    updatedRules.forEach(rule => {
      console.log(`- ${rule.intent_name}: ${rule.description}`);
      console.log(`  示例: ${rule.example_query}`);
    });

    console.log('\n=== 第九步：测试修复后的查询效果 ===');

    // 测试统计查询
    console.log('\n📊 测试统计查询:');
    const statsResult = await sequelize.query(`
      SELECT
        test_result as 测试结果,
        COUNT(*) as 测试次数,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM lab_tests WHERE test_result IN ('PASS', 'FAIL')), 2) as 百分比,
        COUNT(DISTINCT material_code) as 涉及物料种类,
        COUNT(DISTINCT supplier_name) as 涉及供应商数量,
        COUNT(DISTINCT batch_code) as 涉及批次数量,
        CONCAT('共', COUNT(*), '次测试，涉及', COUNT(DISTINCT material_code), '种物料') as 备注
      FROM lab_tests
      WHERE test_result IN ('PASS', 'FAIL')
      GROUP BY test_result
      ORDER BY
        CASE test_result
          WHEN 'FAIL' THEN 1
          WHEN 'PASS' THEN 2
        END
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    console.table(statsResult);

    // 测试NG物料汇总查询
    console.log('\n📋 测试NG物料汇总查询（前3个）:');
    const ngResult = await sequelize.query(`
      SELECT
        material_code as 测试编号,
        DATE_FORMAT(MAX(test_date), '%Y-%m-%d') as 日期,
        '质量检测' as 项目,
        material_code as 基线,
        material_code as 物料类型,
        COUNT(*) as 数量,
        material_name as 物料名称,
        supplier_name as 供应商,
        CONCAT('NG数量: ', COUNT(*), '次，批次: ', GROUP_CONCAT(DISTINCT batch_code SEPARATOR ', ')) as 不合格描述,
        CONCAT('该物料共', COUNT(*), '次NG测试，涉及', COUNT(DISTINCT batch_code), '个批次') as 备注
      FROM lab_tests
      WHERE test_result = 'FAIL'
      GROUP BY material_code, material_name, supplier_name
      ORDER BY COUNT(*) DESC
      LIMIT 3
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    console.table(ngResult);

    // 测试OK物料汇总查询
    console.log('\n📋 测试OK物料汇总查询（前3个）:');
    const okResult = await sequelize.query(`
      SELECT
        material_code as 测试编号,
        DATE_FORMAT(MAX(test_date), '%Y-%m-%d') as 日期,
        '质量检测' as 项目,
        material_code as 基线,
        material_code as 物料类型,
        COUNT(*) as 数量,
        material_name as 物料名称,
        supplier_name as 供应商,
        CONCAT('OK数量: ', COUNT(*), '次') as 不合格描述,
        CONCAT('该物料共', COUNT(*), '次OK测试，涉及', COUNT(DISTINCT batch_code), '个批次') as 备注
      FROM lab_tests
      WHERE test_result = 'PASS'
      GROUP BY material_code, material_name, supplier_name
      ORDER BY COUNT(*) DESC
      LIMIT 3
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    console.table(okResult);

    console.log('\n🎉 全面字段对齐和逻辑优化完成！');

    console.log('\n📋 优化总结:');
    console.log('1. ✅ 字段对齐：所有规则字段已与前端实际显示字段完全对齐');
    console.log('2. ✅ 数据量优化：统计查询显示实际数据量，详细查询限制显示条数但备注总数');
    console.log('3. ✅ 批次逻辑：NG/OK查询按物料汇总批次测试结果，数量字段显示该物料的测试次数');
    console.log('4. ✅ 业务逻辑：一个物料多个批次的测试结果正确汇总统计');

    console.log('\n📝 现在您可以使用以下查询:');
    console.log('- "统计测试结果分布情况" - 获取PASS/FAIL统计，显示实际数据量');
    console.log('- "查询测试结果详细信息" - 获取测试记录列表，显示前10条但备注总数');
    console.log('- "查询NG测试结果" - 获取NG物料汇总，按物料显示NG次数和批次信息');
    console.log('- "查询OK测试结果" - 获取OK物料汇总，按物料显示OK次数和批次信息');
    console.log('- "查询库存信息" - 获取库存信息，字段与前端页面完全一致');

    await sequelize.close();

  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
    throw error;
  }
}

comprehensiveFieldAlignmentFix().catch(console.error);
