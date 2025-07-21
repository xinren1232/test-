import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
});

/**
 * 更新物料大类设计到规则库
 * 基于用户提供的详细物料分类表更新规则逻辑和示例问题
 */

// 物料大类设计数据
const materialCategories = {
  '结构件类': {
    materials: [
      { name: '电池盖', defects: ['划伤', '掉漆'], suppliers: ['聚龙', '欣冠', '广正'] },
      { name: '中框', defects: ['变形', '破损'], suppliers: ['聚龙', '欣冠', '广正'] },
      { name: '手机卡托', defects: ['注塑不良', '尺寸异常'], suppliers: ['聚龙', '欣冠', '广正'] },
      { name: '侧键', defects: ['脱落', '卡键'], suppliers: ['聚龙', '欣冠', '广正'] },
      { name: '装饰件', defects: ['掉色', '偏位'], suppliers: ['聚龙', '欣冠', '广正'] }
    ]
  },
  '光学类': {
    materials: [
      { name: 'LCD显示屏', defects: ['漏光', '暗点'], suppliers: ['帝晶', '天马', 'BOE'] },
      { name: 'OLED显示屏', defects: ['闪屏', 'mura'], suppliers: ['BOE', '天马', '华星'] },
      { name: '摄像头(CAM)', defects: ['划花', '底座破损'], suppliers: ['盛泰', '天实', '深奥'] }
    ]
  },
  '充电类': {
    materials: [
      { name: '电池', defects: ['起鼓', '放电'], suppliers: ['百佳达', '奥海', '辰阳'] },
      { name: '充电器', defects: ['无法充电', '外壳破损'], suppliers: ['钜威', '风华', '维科'] }
    ]
  },
  '声学类': {
    materials: [
      { name: '喇叭', defects: ['无声', '杂音'], suppliers: ['东声', '豪声', '歌尔'] },
      { name: '听筒', defects: ['无声', '杂音'], suppliers: ['东声', '豪声', '歌尔'] }
    ]
  },
  '包料类': {
    materials: [
      { name: '保护套', defects: ['尺寸偏差', '发黄'], suppliers: ['丽德宝', '裕同', '富群'] },
      { name: '标签', defects: ['脱落', '错印'], suppliers: ['丽德宝', '裕同', '富群'] },
      { name: '包装盒', defects: ['破损', 'logo错误'], suppliers: ['丽德宝', '裕同', '富群'] }
    ]
  }
};

async function updateMaterialCategories() {
  try {
    console.log('🔧 更新物料大类设计到规则库...\n');
    
    // 1. 更新物料分类相关规则
    console.log('📋 1. 更新物料分类相关规则...');
    await updateCategoryRules();
    
    // 2. 更新供应商相关规则
    console.log('\n🏭 2. 更新供应商相关规则...');
    await updateSupplierRules();
    
    // 3. 更新缺陷相关规则
    console.log('\n🔍 3. 更新缺陷相关规则...');
    await updateDefectRules();
    
    // 4. 生成新的综合查询规则
    console.log('\n🆕 4. 生成新的综合查询规则...');
    await generateComprehensiveRules();
    
    // 5. 验证更新效果
    console.log('\n✅ 5. 验证更新效果...');
    await verifyUpdates();
    
    console.log('\n🎉 物料大类设计更新完成！');
    
  } catch (error) {
    console.error('❌ 更新过程中发生错误:', error);
  } finally {
    await connection.end();
  }
}

/**
 * 更新物料分类相关规则
 */
async function updateCategoryRules() {
  for (const [categoryName, categoryData] of Object.entries(materialCategories)) {
    const materials = categoryData.materials.map(m => m.name);
    const suppliers = [...new Set(categoryData.materials.flatMap(m => m.suppliers))];
    
    // 更新或创建分类查询规则
    const ruleName = `${categoryName}库存查询`;
    const description = `查询${categoryName}的库存信息，包含${materials.join('、')}等物料`;
    
    const sqlQuery = `SELECT
      COALESCE(storage_location, '未知工厂') as 工厂,
      COALESCE(storage_location, '未知仓库') as 仓库,
      material_code as 物料编码,
      material_name as 物料名称,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
      DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
      COALESCE(notes, '') as 备注
    FROM inventory
    WHERE material_name IN (${materials.map(m => `'${m}'`).join(', ')})
    ORDER BY inbound_time DESC`;
    
    // 生成示例问题
    const examples = [
      `查询${categoryName}库存`,
      `${categoryName}物料情况`,
      `${materials[0]}库存查询`,
      `${suppliers[0]}的${categoryName}`,
      `${categoryName}供应商分布`
    ];
    
    await upsertRule(ruleName, description, sqlQuery, examples, '库存场景');
    console.log(`✅ 更新规则: ${ruleName}`);
  }
}

/**
 * 更新供应商相关规则
 */
async function updateSupplierRules() {
  // 获取所有供应商
  const allSuppliers = [...new Set(
    Object.values(materialCategories)
      .flatMap(cat => cat.materials)
      .flatMap(mat => mat.suppliers)
  )];
  
  for (const supplier of allSuppliers) {
    // 找到该供应商的所有物料类别
    const supplierCategories = [];
    const supplierMaterials = [];
    
    for (const [categoryName, categoryData] of Object.entries(materialCategories)) {
      const materials = categoryData.materials.filter(m => m.suppliers.includes(supplier));
      if (materials.length > 0) {
        supplierCategories.push(categoryName);
        supplierMaterials.push(...materials.map(m => m.name));
      }
    }
    
    if (supplierCategories.length > 0) {
      const ruleName = `${supplier}供应商库存查询`;
      const description = `查询${supplier}供应商的库存信息，涉及${supplierCategories.join('、')}`;
      
      const sqlQuery = `SELECT
        COALESCE(storage_location, '未知工厂') as 工厂,
        COALESCE(storage_location, '未知仓库') as 仓库,
        material_code as 物料编码,
        material_name as 物料名称,
        supplier_name as 供应商,
        quantity as 数量,
        status as 状态,
        DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
        DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
        COALESCE(notes, '') as 备注
      FROM inventory
      WHERE supplier_name = '${supplier}'
      ORDER BY inbound_time DESC`;
      
      const examples = [
        `查询${supplier}供应商库存`,
        `${supplier}的库存情况`,
        `${supplier}供应商物料`,
        `${supplier}的${supplierMaterials[0]}`,
        `${supplier}库存状态`
      ];
      
      await upsertRule(ruleName, description, sqlQuery, examples, '库存场景');
      console.log(`✅ 更新规则: ${ruleName}`);
    }
  }
}

/**
 * 更新缺陷相关规则
 */
async function updateDefectRules() {
  // 收集所有缺陷类型
  const allDefects = [...new Set(
    Object.values(materialCategories)
      .flatMap(cat => cat.materials)
      .flatMap(mat => mat.defects)
  )];
  
  for (const defect of allDefects) {
    const ruleName = `${defect}缺陷查询`;
    const description = `查询${defect}相关的测试记录和质量问题`;
    
    const sqlQuery = `SELECT
      test_id as 测试编号,
      DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
      project as 项目,
      baseline as 基线,
      material_code as 物料编码,
      quantity as 数量,
      material_name as 物料名称,
      supplier_name as 供应商,
      test_result as 测试结果,
      COALESCE(defect_description, '') as 不合格描述,
      COALESCE(notes, '') as 备注
    FROM lab_tests
    WHERE defect_description LIKE '%${defect}%' OR notes LIKE '%${defect}%'
    ORDER BY test_date DESC`;
    
    const examples = [
      `查询${defect}问题`,
      `${defect}缺陷统计`,
      `${defect}测试记录`,
      `${defect}质量分析`
    ];
    
    await upsertRule(ruleName, description, sqlQuery, examples, '测试场景');
    console.log(`✅ 更新规则: ${ruleName}`);
  }
}

/**
 * 生成新的综合查询规则
 */
async function generateComprehensiveRules() {
  // 生成物料大类对比规则
  const categoryNames = Object.keys(materialCategories);

  const comparisonRuleName = '物料大类质量对比';
  const comparisonDescription = '对比各物料大类的质量表现和供应商分布';

  const comparisonSQL = `SELECT
    CASE
      ${categoryNames.map(cat => {
        const materials = materialCategories[cat].materials.map(m => `'${m.name}'`).join(', ');
        return `WHEN material_name IN (${materials}) THEN '${cat}'`;
      }).join(' ')}
      ELSE '其他'
    END as 物料大类,
    supplier_name as 供应商,
    COUNT(*) as 测试次数,
    SUM(CASE WHEN test_result = 'NG' THEN 1 ELSE 0 END) as 不良数量,
    ROUND(SUM(CASE WHEN test_result = 'NG' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 不良率,
    GROUP_CONCAT(DISTINCT defect_description) as 主要缺陷
  FROM lab_tests
  WHERE material_name IN (${Object.values(materialCategories).flatMap(cat => cat.materials.map(m => `'${m.name}'`)).join(', ')})
  GROUP BY 物料大类, supplier_name
  ORDER BY 不良率 DESC`;

  const comparisonExamples = [
    '物料大类质量对比',
    '各类物料质量分析',
    '供应商质量排行',
    '物料分类不良率对比'
  ];

  await upsertRule(comparisonRuleName, comparisonDescription, comparisonSQL, comparisonExamples, '对比场景');
  console.log(`✅ 生成规则: ${comparisonRuleName}`);

  // 生成供应商能力分析规则
  const supplierAnalysisRuleName = '供应商能力分析';
  const supplierAnalysisDescription = '分析各供应商的物料类别覆盖和质量能力';

  const supplierAnalysisSQL = `SELECT
    supplier_name as 供应商,
    COUNT(DISTINCT material_name) as 物料种类数,
    GROUP_CONCAT(DISTINCT CASE
      ${categoryNames.map(cat => {
        const materials = materialCategories[cat].materials.map(m => `'${m.name}'`).join(', ');
        return `WHEN material_name IN (${materials}) THEN '${cat}'`;
      }).join(' ')}
      ELSE '其他'
    END) as 涉及大类,
    COUNT(*) as 总测试次数,
    ROUND(AVG(CASE WHEN test_result = 'OK' THEN 100 ELSE 0 END), 2) as 平均合格率,
    DATE_FORMAT(MAX(test_date), '%Y-%m-%d') as 最新测试日期
  FROM lab_tests
  WHERE material_name IN (${Object.values(materialCategories).flatMap(cat => cat.materials.map(m => `'${m.name}'`)).join(', ')})
  GROUP BY supplier_name
  ORDER BY 平均合格率 DESC`;

  const supplierAnalysisExamples = [
    '供应商能力分析',
    '供应商覆盖范围',
    '供应商质量能力',
    '供应商综合评价'
  ];

  await upsertRule(supplierAnalysisRuleName, supplierAnalysisDescription, supplierAnalysisSQL, supplierAnalysisExamples, '综合场景');
  console.log(`✅ 生成规则: ${supplierAnalysisRuleName}`);
}

/**
 * 验证更新效果
 */
async function verifyUpdates() {
  // 统计更新后的规则数量
  const [ruleStats] = await connection.execute(`
    SELECT category, COUNT(*) as count
    FROM nlp_intent_rules
    WHERE status = 'active'
    GROUP BY category
    ORDER BY count DESC
  `);

  console.log('📊 更新后规则分布:');
  ruleStats.forEach(stat => {
    console.log(`  ${stat.category || '未分类'}: ${stat.count}条`);
  });

  // 测试几个新规则
  const testRules = ['结构件类库存查询', '聚龙供应商库存查询', '划伤缺陷查询'];

  for (const ruleName of testRules) {
    try {
      const [rules] = await connection.execute(`
        SELECT action_target, trigger_words
        FROM nlp_intent_rules
        WHERE intent_name = ? AND status = 'active'
      `, [ruleName]);

      if (rules.length > 0) {
        const [results] = await connection.execute(rules[0].action_target);
        console.log(`✅ ${ruleName}: ${results.length}条记录`);

        if (results.length > 0) {
          const fields = Object.keys(results[0]);
          console.log(`   字段: ${fields.slice(0, 5).join(', ')}...`);
        }
      } else {
        console.log(`⚠️ ${ruleName}: 规则不存在`);
      }
    } catch (error) {
      console.log(`❌ ${ruleName}: 测试失败 - ${error.message}`);
    }
  }
}

/**
 * 插入或更新规则
 */
async function upsertRule(intentName, description, actionTarget, examples, category) {
  const triggerWords = JSON.stringify(examples);

  try {
    // 先尝试更新
    const [updateResult] = await connection.execute(`
      UPDATE nlp_intent_rules
      SET description = ?, action_target = ?, trigger_words = ?, category = ?
      WHERE intent_name = ? AND status = 'active'
    `, [description, actionTarget, triggerWords, category, intentName]);

    if (updateResult.affectedRows === 0) {
      // 如果没有更新到记录，则插入新记录
      await connection.execute(`
        INSERT INTO nlp_intent_rules (intent_name, description, action_target, trigger_words, category, status, priority, action_type)
        VALUES (?, ?, ?, ?, ?, 'active', 100, 'SQL_QUERY')
      `, [intentName, description, actionTarget, triggerWords, category]);
    }
  } catch (error) {
    console.log(`❌ 规则 ${intentName} 更新失败: ${error.message}`);
  }
}

// 执行更新
updateMaterialCategories();
