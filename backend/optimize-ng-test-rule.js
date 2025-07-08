import initializeDatabase from './src/models/index.js';

async function optimizeNGTestRule() {
  console.log('🔧 优化NG测试结果统计规则，专注于测试NG物料的详细信息...\n');
  
  try {
    const db = await initializeDatabase();
    const sequelize = db.sequelize;
    
    // 1. 更新主要的测试结果统计规则
    console.log('1. 更新测试结果统计规则...');
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET 
        intent_name = '测试结果统计',
        example_query = '统计PASS和FAIL的测试结果',
        action_target = 'SELECT 
        test_result as 测试结果,
        COUNT(*) as 数量,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM lab_tests), 2) as 百分比,
        COUNT(DISTINCT material_name) as 涉及物料种类,
        COUNT(DISTINCT supplier_name) as 涉及供应商数量,
        COUNT(DISTINCT batch_code) as 涉及批次数量
      FROM lab_tests 
      WHERE test_result IN (''PASS'', ''FAIL'')
      GROUP BY test_result 
      ORDER BY 
        CASE test_result 
          WHEN ''FAIL'' THEN 1 
          WHEN ''PASS'' THEN 2 
        END',
        trigger_words = '["PASS","FAIL","测试","结果","统计","合格","不合格","通过","失败","OK","NG"]',
        priority = 90
      WHERE intent_name IN ('真实测试结果统计', '测试结果统计分析')
    `);
    console.log('✅ 测试结果统计规则已更新');
    
    // 2. 添加专门的NG物料详细信息查询规则
    console.log('2. 添加NG物料详细信息查询规则...');
    await sequelize.query(`
      INSERT INTO nlp_intent_rules (
        intent_name, 
        example_query, 
        action_target, 
        trigger_words, 
        priority, 
        category
      ) VALUES (
        'NG物料详细信息',
        '查询测试NG的物料详细信息',
        'SELECT 
        material_name as 物料名称,
        supplier_name as 供应商,
        batch_code as 批次号,
        test_date as 测试日期,
        test_item as 测试项目,
        conclusion as 结论,
        CASE 
          WHEN defect_desc IS NOT NULL AND defect_desc != '''' THEN defect_desc
          ELSE ''需要补充缺陷描述''
        END as 缺陷描述,
        tester as 测试员,
        DATE_FORMAT(created_at, ''%Y-%m-%d %H:%i'') as 记录时间
      FROM lab_tests 
      WHERE test_result = ''FAIL''
      ORDER BY test_date DESC, created_at DESC
      LIMIT 20',
        '["NG","不合格","失败","测试失败","不良","缺陷","问题物料","详细信息"]',
        85,
        '测试分析'
      ) ON DUPLICATE KEY UPDATE
        example_query = VALUES(example_query),
        action_target = VALUES(action_target),
        trigger_words = VALUES(trigger_words),
        priority = VALUES(priority)
    `);
    console.log('✅ NG物料详细信息查询规则已添加');
    
    // 3. 添加NG物料按供应商分组的规则
    console.log('3. 添加NG物料按供应商分组规则...');
    await sequelize.query(`
      INSERT INTO nlp_intent_rules (
        intent_name, 
        example_query, 
        action_target, 
        trigger_words, 
        priority, 
        category
      ) VALUES (
        'NG物料供应商分析',
        '分析各供应商的NG物料情况',
        'SELECT 
        supplier_name as 供应商,
        COUNT(*) as NG总数,
        COUNT(DISTINCT material_name) as NG物料种类,
        COUNT(DISTINCT batch_code) as NG批次数,
        GROUP_CONCAT(DISTINCT material_name ORDER BY material_name SEPARATOR '', '') as NG物料清单,
        DATE(MAX(test_date)) as 最近NG日期,
        ROUND(COUNT(*) * 100.0 / (
          SELECT COUNT(*) FROM lab_tests lt2 
          WHERE lt2.supplier_name = lab_tests.supplier_name
        ), 2) as NG率
      FROM lab_tests 
      WHERE test_result = ''FAIL''
      GROUP BY supplier_name
      HAVING COUNT(*) > 0
      ORDER BY NG总数 DESC, NG率 DESC',
        '["NG","供应商","不合格率","失败率","质量分析","供应商NG"]',
        80,
        '测试分析'
      ) ON DUPLICATE KEY UPDATE
        example_query = VALUES(example_query),
        action_target = VALUES(action_target),
        trigger_words = VALUES(trigger_words),
        priority = VALUES(priority)
    `);
    console.log('✅ NG物料供应商分析规则已添加');
    
    // 4. 添加NG物料排名规则
    console.log('4. 添加NG物料排名规则...');
    await sequelize.query(`
      INSERT INTO nlp_intent_rules (
        intent_name, 
        example_query, 
        action_target, 
        trigger_words, 
        priority, 
        category
      ) VALUES (
        'NG物料排名',
        '查看NG物料排名情况',
        'SELECT 
        material_name as 物料名称,
        COUNT(*) as NG次数,
        COUNT(DISTINCT supplier_name) as 涉及供应商数,
        COUNT(DISTINCT batch_code) as NG批次数,
        GROUP_CONCAT(DISTINCT supplier_name ORDER BY supplier_name SEPARATOR '', '') as 供应商列表,
        DATE(MAX(test_date)) as 最近NG日期,
        DATE(MIN(test_date)) as 首次NG日期,
        ROUND(COUNT(*) * 100.0 / (
          SELECT COUNT(*) FROM lab_tests lt2 
          WHERE lt2.material_name = lab_tests.material_name
        ), 2) as NG率
      FROM lab_tests 
      WHERE test_result = ''FAIL''
      GROUP BY material_name
      HAVING COUNT(*) > 0
      ORDER BY NG次数 DESC, NG率 DESC
      LIMIT 15',
        '["NG","物料","排名","不良物料","问题物料","TOP不良"]',
        75,
        '测试分析'
      ) ON DUPLICATE KEY UPDATE
        example_query = VALUES(example_query),
        action_target = VALUES(action_target),
        trigger_words = VALUES(trigger_words),
        priority = VALUES(priority)
    `);
    console.log('✅ NG物料排名规则已添加');
    
    // 5. 添加最近NG趋势分析规则
    console.log('5. 添加最近NG趋势分析规则...');
    await sequelize.query(`
      INSERT INTO nlp_intent_rules (
        intent_name, 
        example_query, 
        action_target, 
        trigger_words, 
        priority, 
        category
      ) VALUES (
        'NG趋势分析',
        '分析最近的NG趋势',
        'SELECT 
        DATE(test_date) as 测试日期,
        COUNT(*) as NG数量,
        COUNT(DISTINCT material_name) as NG物料种类,
        COUNT(DISTINCT supplier_name) as 涉及供应商数,
        GROUP_CONCAT(DISTINCT material_name ORDER BY material_name SEPARATOR '', '') as NG物料列表
      FROM lab_tests 
      WHERE test_result = ''FAIL''
        AND test_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(test_date)
      ORDER BY 测试日期 DESC
      LIMIT 10',
        '["NG","趋势","最近","时间分析","NG趋势"]',
        70,
        '测试分析'
      ) ON DUPLICATE KEY UPDATE
        example_query = VALUES(example_query),
        action_target = VALUES(action_target),
        trigger_words = VALUES(trigger_words),
        priority = VALUES(priority)
    `);
    console.log('✅ NG趋势分析规则已添加');
    
    // 6. 测试所有新规则
    console.log('\n🧪 测试所有NG相关规则...');
    
    const testQueries = [
      '统计PASS和FAIL的测试结果',
      '查询测试NG的物料详细信息',
      '分析各供应商的NG物料情况',
      '查看NG物料排名情况',
      '分析最近的NG趋势'
    ];
    
    for (const query of testQueries) {
      console.log(`\n📋 测试查询: ${query}`);
      
      // 获取匹配的规则
      const [rule] = await sequelize.query(
        'SELECT * FROM nlp_intent_rules WHERE example_query = ?',
        {
          replacements: [query],
          type: sequelize.QueryTypes.SELECT
        }
      );
      
      if (rule) {
        try {
          // 执行SQL测试
          const results = await sequelize.query(rule.action_target, {
            type: sequelize.QueryTypes.SELECT
          });
          
          console.log(`✅ 规则执行成功，返回 ${results.length} 条记录`);
          if (results.length > 0) {
            console.log('📊 数据示例:');
            console.log(JSON.stringify(results[0], null, 2));
          }
        } catch (error) {
          console.log(`❌ 规则执行失败: ${error.message}`);
        }
      } else {
        console.log('❌ 未找到匹配规则');
      }
    }
    
    console.log('\n🎉 NG测试结果统计规则优化完成！');
    console.log('\n📋 现在您可以使用以下查询来获取NG物料的详细信息:');
    console.log('- "统计PASS和FAIL的测试结果" - 获取整体统计');
    console.log('- "查询测试NG的物料详细信息" - 获取NG物料详细列表');
    console.log('- "分析各供应商的NG物料情况" - 按供应商分析NG情况');
    console.log('- "查看NG物料排名情况" - 查看最容易出现NG的物料');
    console.log('- "分析最近的NG趋势" - 查看NG的时间趋势');
    
  } catch (error) {
    console.error('❌ 优化失败:', error.message);
  }
}

optimizeNGTestRule();
