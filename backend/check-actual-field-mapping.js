import initializeDatabase from './src/models/index.js';

async function checkActualFieldMapping() {
  console.log('🔍 检查实际数据库字段映射和前端显示字段...\n');

  try {
    const db = await initializeDatabase();
    const sequelize = db.sequelize;

    console.log('=== 1. 检查lab_tests表结构 ===');
    const columns = await sequelize.query('DESCRIBE lab_tests', {
      type: sequelize.QueryTypes.SELECT
    });
    console.log('lab_tests表字段:');
    columns.forEach(col => {
      console.log(`- ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    console.log('\n=== 2. 检查lab_tests实际数据示例 ===');
    const sampleData = await sequelize.query('SELECT * FROM lab_tests LIMIT 3', {
      type: sequelize.QueryTypes.SELECT
    });
    if (sampleData.length > 0) {
      console.log('实际数据字段和值:');
      Object.keys(sampleData[0]).forEach(key => {
        console.log(`- ${key}: ${sampleData[0][key]}`);
      });
    }

    console.log('\n=== 3. 根据图片显示的字段分析 ===');
    console.log('前端显示字段 -> 数据库字段映射:');
    console.log('- 测试编号 -> test_id');
    console.log('- 日期 -> test_date');  
    console.log('- 项目 -> ? (需要确认)');
    console.log('- 基线 -> ? (需要确认)');
    console.log('- 物料类型 -> material_code');
    console.log('- 数量 -> ? (需要确认)');
    console.log('- 物料名称 -> material_name');
    console.log('- 供应商 -> supplier_name');
    console.log('- 不合格描述 -> defect_desc 或基于 test_result');
    console.log('- 备注 -> notes');

    console.log('\n=== 4. 检查当前测试结果统计规则 ===');
    const rules = await sequelize.query(`
      SELECT intent_name, action_target, trigger_words
      FROM nlp_intent_rules
      WHERE intent_name LIKE '%测试结果%' OR intent_name LIKE '%真实测试%'
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    rules.forEach(rule => {
      console.log(`\n规则名: ${rule.intent_name}`);
      console.log(`触发词: ${rule.trigger_words}`);
      console.log(`SQL模板: ${rule.action_target}`);
      console.log('---');
    });

    console.log('\n=== 5. 测试修正后的查询 ===');
    const correctedQuery = `
      SELECT
        test_id as 测试编号,
        test_date as 日期,
        'MAT-175191' as 项目,
        '未知' as 基线,
        material_code as 物料类型,
        '未知' as 数量,
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
      LIMIT 10
    `;

    const testResults = await sequelize.query(correctedQuery, {
      type: sequelize.QueryTypes.SELECT
    });
    console.log(`\n修正查询返回 ${testResults.length} 条记录:`);
    if (testResults.length > 0) {
      console.table(testResults);
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

checkActualFieldMapping();
