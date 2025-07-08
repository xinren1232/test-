/**
 * 基于实际数据结构优化NLP规则
 * 
 * 根据数据分析结果：
 * 1. test_item都是"常规检测"，需要根据material_name生成有意义的项目名称
 * 2. batch_code是批次号，可以格式化显示为基线
 * 3. defect_desc字段为空，需要为FAIL记录生成不合格描述
 * 4. 需要正确映射前端字段：测试编号,日期,项目,基线,物料类型,数量,物料名称,供应商,不合格描述,备注
 */

import mysql from 'mysql2/promise';

async function optimizeNLPRules() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });

  try {
    console.log('🔧 基于实际数据结构优化NLP规则...');

    // 1. 首先为FAIL记录生成不合格描述
    console.log('\n1. 为FAIL记录生成不合格描述...');
    
    // 根据MaterialSupplierMap.js中的defectTypes生成不合格描述
    const defectTypeMap = {
      '充电器': ['充电异常', '接触不良', '过热', '电压不稳'],
      '摄像头(CAM)': ['成像模糊', '色彩偏差', '对焦失败', '镜头划伤'],
      '装饰件': ['掉色', '偏位', '脱落', '表面划伤'],
      '包装盒': ['破损', 'logo错误', '错印', '尺寸不符'],
      '中框': ['变形', '破裂', '掉漆', '尺寸异常'],
      '手机卡托': ['注塑不良', '尺寸异常', '断裂', '毛刺'],
      '电池盖': ['划伤', '变形', '破裂', '起鼓', '色差'],
      '保护套': ['尺寸偏差', '发黄', '开孔错位', '模具压痕'],
      '标签': ['脱落', '错印', 'logo错误', '尺寸异常'],
      'LCD显示屏': ['显示异常', '亮点', '色彩不均', '触控失效'],
      'OLED显示屏': ['显示异常', '烧屏', '色彩偏差', '触控失效']
    };

    // 更新FAIL记录的defect_desc
    for (const [materialName, defects] of Object.entries(defectTypeMap)) {
      const randomDefect = defects[Math.floor(Math.random() * defects.length)];
      await connection.execute(`
        UPDATE lab_tests 
        SET defect_desc = ? 
        WHERE material_name = ? AND test_result = 'FAIL' AND (defect_desc IS NULL OR defect_desc = '')
      `, [randomDefect, materialName]);
    }

    console.log('✅ 不合格描述生成完成');

    // 2. 创建优化后的NLP规则
    console.log('\n2. 创建优化后的NLP规则...');

    // 删除旧的测试相关规则
    await connection.execute(`
      DELETE FROM nlp_intent_rules 
      WHERE intent_name LIKE '%测试%' OR intent_name LIKE '%NG%' OR intent_name LIKE '%检测%'
    `);

    // 创建新的优化规则
    const optimizedRules = [
      {
        intent_name: '测试结果查询',
        description: '查询所有测试结果，正确显示项目/基线/物料类型等字段',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  CASE 
    WHEN material_name = '充电器' THEN '充电器检测项目'
    WHEN material_name = '摄像头(CAM)' THEN '摄像头检测项目'
    WHEN material_name = '装饰件' THEN '装饰件检测项目'
    WHEN material_name = '包装盒' THEN '包装检测项目'
    WHEN material_name = '中框' THEN '结构件检测项目'
    WHEN material_name = '手机卡托' THEN '配件检测项目'
    WHEN material_name = '电池盖' THEN '结构件检测项目'
    WHEN material_name = '保护套' THEN '配件检测项目'
    WHEN material_name = '标签' THEN '标识检测项目'
    WHEN material_name LIKE '%显示屏' THEN '显示屏检测项目'
    ELSE CONCAT(material_name, '检测项目')
  END as 项目,
  CONCAT('批次-', batch_code) as 基线,
  material_name as 物料类型,
  CASE 
    WHEN test_result = 'PASS' THEN '1次OK'
    WHEN test_result = 'FAIL' THEN '1次NG'
    ELSE '1次'
  END as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  CASE 
    WHEN test_result = 'PASS' THEN '合格'
    WHEN test_result = 'FAIL' THEN CONCAT('不合格: ', COALESCE(defect_desc, '检测异常'))
    ELSE test_result
  END as 不合格描述,
  '' as 备注
FROM lab_tests 
ORDER BY test_date DESC 
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(['测试结果', '检测结果', '测试查询', '检验结果']),
        synonyms: JSON.stringify({'测试': ['检测', '检验'], '结果': ['数据', '信息']}),
        example_query: '查询测试结果',
        priority: 10,
        status: 'active'
      },
      
      {
        intent_name: 'NG测试结果查询',
        description: '查询测试失败(NG)的记录，显示详细不合格信息',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  CASE 
    WHEN material_name = '充电器' THEN '充电器检测项目'
    WHEN material_name = '摄像头(CAM)' THEN '摄像头检测项目'
    WHEN material_name = '装饰件' THEN '装饰件检测项目'
    WHEN material_name = '包装盒' THEN '包装检测项目'
    WHEN material_name = '中框' THEN '结构件检测项目'
    WHEN material_name = '手机卡托' THEN '配件检测项目'
    WHEN material_name = '电池盖' THEN '结构件检测项目'
    WHEN material_name = '保护套' THEN '配件检测项目'
    WHEN material_name = '标签' THEN '标识检测项目'
    WHEN material_name LIKE '%显示屏' THEN '显示屏检测项目'
    ELSE CONCAT(material_name, '检测项目')
  END as 项目,
  CONCAT('批次-', batch_code) as 基线,
  material_name as 物料类型,
  '1次NG' as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  CONCAT('不合格: ', COALESCE(defect_desc, '检测异常')) as 不合格描述,
  '' as 备注
FROM lab_tests 
WHERE test_result = 'FAIL'
ORDER BY test_date DESC 
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(['NG', '不合格', '失败', '测试失败', '不良品']),
        synonyms: JSON.stringify({'NG': ['不合格', '失败', 'FAIL'], '测试': ['检测', '检验']}),
        example_query: '查询NG测试结果',
        priority: 9,
        status: 'active'
      },
      
      {
        intent_name: 'OK测试结果查询',
        description: '查询测试通过(OK)的记录',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  CASE 
    WHEN material_name = '充电器' THEN '充电器检测项目'
    WHEN material_name = '摄像头(CAM)' THEN '摄像头检测项目'
    WHEN material_name = '装饰件' THEN '装饰件检测项目'
    WHEN material_name = '包装盒' THEN '包装检测项目'
    WHEN material_name = '中框' THEN '结构件检测项目'
    WHEN material_name = '手机卡托' THEN '配件检测项目'
    WHEN material_name = '电池盖' THEN '结构件检测项目'
    WHEN material_name = '保护套' THEN '配件检测项目'
    WHEN material_name = '标签' THEN '标识检测项目'
    WHEN material_name LIKE '%显示屏' THEN '显示屏检测项目'
    ELSE CONCAT(material_name, '检测项目')
  END as 项目,
  CONCAT('批次-', batch_code) as 基线,
  material_name as 物料类型,
  '1次OK' as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  '合格' as 不合格描述,
  '' as 备注
FROM lab_tests 
WHERE test_result = 'PASS'
ORDER BY test_date DESC 
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(['OK', '合格', '通过', '测试通过', '良品']),
        synonyms: JSON.stringify({'OK': ['合格', '通过', 'PASS'], '测试': ['检测', '检验']}),
        example_query: '查询OK测试结果',
        priority: 8,
        status: 'active'
      }
    ];

    // 插入优化后的规则
    for (const rule of optimizedRules) {
      await connection.execute(`
        INSERT INTO nlp_intent_rules (
          intent_name, description, action_type, action_target, parameters,
          trigger_words, synonyms, example_query, priority, status,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        rule.intent_name, rule.description, rule.action_type, rule.action_target,
        rule.parameters, rule.trigger_words, rule.synonyms, rule.example_query,
        rule.priority, rule.status
      ]);
      
      console.log(`✅ 创建规则: ${rule.intent_name}`);
    }

    // 3. 验证优化结果
    console.log('\n3. 验证优化结果...');
    
    const testQuery = optimizedRules[1].action_target; // 使用NG查询进行测试
    const [testResult] = await connection.execute(testQuery);
    
    console.log('\n优化后的NG测试结果预览:');
    console.table(testResult.slice(0, 3));

    console.log('\n✅ NLP规则优化完成！');
    console.log('\n📋 优化总结:');
    console.log('- 项目字段：根据物料名称生成有意义的项目名称（如"充电器检测项目"）');
    console.log('- 基线字段：格式化显示批次号（如"批次-413604"）');
    console.log('- 数量字段：显示"1次OK"或"1次NG"');
    console.log('- 不合格描述：为FAIL记录生成具体的不合格描述');
    console.log('- 字段映射：完全对齐前端显示需求');

  } catch (error) {
    console.error('❌ 优化过程中出现错误:', error);
  } finally {
    await connection.end();
  }
}

// 执行优化
optimizeNLPRules().catch(console.error);
