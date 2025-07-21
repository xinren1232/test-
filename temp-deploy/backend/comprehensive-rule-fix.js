import initializeDatabase from './src/models/index.js';

async function comprehensiveRuleFix() {
  console.log('🔧 全面修复测试结果统计规则...\n');
  
  try {
    const db = await initializeDatabase();
    const sequelize = db.sequelize;

    console.log('=== 1. 修复真实测试结果统计规则 ===');
    
    // 修复主要的测试结果统计规则 - 应该是统计性查询，不是详细列表
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET 
        action_target = 'SELECT 
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
          END',
        description = '统计测试结果分布情况，显示PASS/FAIL数量和百分比',
        example_query = '统计测试结果分布情况'
      WHERE intent_name = '真实测试结果统计'
    `);
    console.log('✅ 真实测试结果统计规则已修复');

    console.log('\n=== 2. 修复测试结果详细查询规则 ===');
    
    // 修复测试结果查询规则 - 显示详细列表，匹配前端字段
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET 
        action_target = 'SELECT 
          test_id as 测试编号,
          DATE_FORMAT(test_date, ''%Y-%m-%d'') as 日期,
          COALESCE(test_item, ''常规检测'') as 项目,
          ''MAT-175191'' as 基线,
          material_code as 物料类型,
          ''1'' as 数量,
          material_name as 物料名称,
          supplier_name as 供应商,
          CASE 
            WHEN test_result = ''PASS'' THEN ''合格''
            WHEN test_result = ''FAIL'' THEN CONCAT(''不合格: '', COALESCE(defect_desc, ''无描述''))
            ELSE test_result
          END as 不合格描述,
          COALESCE(notes, '''') as 备注
        FROM lab_tests 
        ORDER BY test_date DESC 
        LIMIT 20',
        description = '查询测试结果详细信息，显示测试记录列表',
        example_query = '查询测试结果详细信息'
      WHERE intent_name = '测试结果查询'
    `);
    console.log('✅ 测试结果查询规则已修复');

    console.log('\n=== 3. 修复NG测试结果查询规则 ===');
    
    // 修复NG测试结果查询规则
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET 
        action_target = 'SELECT 
          test_id as 测试编号,
          DATE_FORMAT(test_date, ''%Y-%m-%d'') as 日期,
          COALESCE(test_item, ''常规检测'') as 项目,
          ''MAT-175191'' as 基线,
          material_code as 物料类型,
          ''1'' as 数量,
          material_name as 物料名称,
          supplier_name as 供应商,
          CONCAT(''不合格: '', COALESCE(defect_desc, ''无描述'')) as 不合格描述,
          COALESCE(notes, '''') as 备注
        FROM lab_tests 
        WHERE test_result = ''FAIL''
        ORDER BY test_date DESC 
        LIMIT 20',
        description = '查询测试失败(NG)的物料详细信息',
        example_query = '查询NG测试结果',
        trigger_words = '["NG","不合格","失败","测试失败","不良","缺陷","问题物料"]'
      WHERE intent_name = 'NG测试结果查询'
    `);
    console.log('✅ NG测试结果查询规则已修复');

    console.log('\n=== 4. 修复OK测试结果查询规则 ===');
    
    // 修复OK测试结果查询规则
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET 
        action_target = 'SELECT 
          test_id as 测试编号,
          DATE_FORMAT(test_date, ''%Y-%m-%d'') as 日期,
          COALESCE(test_item, ''常规检测'') as 项目,
          ''MAT-175191'' as 基线,
          material_code as 物料类型,
          ''1'' as 数量,
          material_name as 物料名称,
          supplier_name as 供应商,
          ''合格'' as 不合格描述,
          COALESCE(notes, '''') as 备注
        FROM lab_tests 
        WHERE test_result = ''PASS''
        ORDER BY test_date DESC 
        LIMIT 20',
        description = '查询测试通过(OK)的物料详细信息',
        example_query = '查询OK测试结果',
        trigger_words = '["OK","合格","通过","测试通过","正常","良品"]'
      WHERE intent_name = 'OK测试结果查询'
    `);
    console.log('✅ OK测试结果查询规则已修复');

    console.log('\n=== 5. 验证修复后的规则 ===');
    
    // 验证修复后的规则
    const rules = await sequelize.query(`
      SELECT intent_name, description, example_query
      FROM nlp_intent_rules 
      WHERE intent_name IN ('真实测试结果统计', '测试结果查询', 'NG测试结果查询', 'OK测试结果查询')
      ORDER BY intent_name
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    
    console.log('修复后的规则列表:');
    rules.forEach(rule => {
      console.log(`- ${rule.intent_name}: ${rule.description}`);
      console.log(`  示例: ${rule.example_query}`);
    });

    console.log('\n=== 6. 测试修复后的查询 ===');
    
    // 测试统计查询
    console.log('\n测试统计查询:');
    const statsResults = await sequelize.query(`
      SELECT 
        test_result as 测试结果,
        COUNT(*) as 数量,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM lab_tests), 2) as 百分比,
        COUNT(DISTINCT material_name) as 涉及物料种类,
        COUNT(DISTINCT supplier_name) as 涉及供应商数量
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
    console.table(statsResults);

    // 测试详细查询（前3条）
    console.log('\n测试详细查询（前3条）:');
    const detailResults = await sequelize.query(`
      SELECT 
        test_id as 测试编号,
        DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
        COALESCE(test_item, '常规检测') as 项目,
        'MAT-175191' as 基线,
        material_code as 物料类型,
        '1' as 数量,
        material_name as 物料名称,
        supplier_name as 供应商,
        CASE 
          WHEN test_result = 'PASS' THEN '合格'
          WHEN test_result = 'FAIL' THEN CONCAT('不合格: ', COALESCE(defect_desc, '无描述'))
          ELSE test_result
        END as 不合格描述,
        COALESCE(notes, '') as 备注
      FROM lab_tests 
      ORDER BY test_date DESC 
      LIMIT 3
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    console.table(detailResults);

    console.log('\n🎉 规则修复完成！');
    console.log('\n📋 现在您可以使用以下查询:');
    console.log('- "统计测试结果分布情况" - 获取PASS/FAIL统计');
    console.log('- "查询测试结果详细信息" - 获取测试记录列表');
    console.log('- "查询NG测试结果" - 获取不合格物料列表');
    console.log('- "查询OK测试结果" - 获取合格物料列表');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

comprehensiveRuleFix();
