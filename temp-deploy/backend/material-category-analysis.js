/**
 * 物料大类结构分析
 * 基于用户提供的物料分类表格，分析各大类物料的特点和查询需求
 */

// 物料大类结构定义
const MATERIAL_CATEGORIES = {
  // 结构件类
  structural: {
    name: '结构件类',
    materials: [
      { name: '电池盖', defects: ['刮伤', '掉漆', '起泡', '色差', '聚龙', '欣旺', '广正'] },
      { name: '手机卡托', defects: ['注塑不良', '尺寸异常', '断裂', '毛刺', '聚龙', '欣旺', '广正'] },
      { name: '侧键', defects: ['脱落', '卡键', '尺寸异常', '松动', '聚龙', '欣旺', '广正'] },
      { name: '装饰件', defects: ['掉色', '偏位', '脱落', '掉色', '聚龙', '欣旺', '广正'] }
    ],
    common_defects: ['尺寸异常', '外观缺陷', '装配问题', '材料缺陷'],
    suppliers: ['聚龙', '欣旺', '广正'],
    key_inspection_items: ['尺寸精度', '外观质量', '装配性能', '材料强度']
  },

  // 光学类
  optical: {
    name: '光学类',
    materials: [
      { name: 'LCD显示屏', defects: ['漏光', '暗点', '偏色', '帝晶', '天马', 'BOE'] },
      { name: 'OLED显示屏', defects: ['闪屏', 'mura', '亮点', '亮线', 'BOE', '天马', '华星'] },
      { name: '摄像头(CAM)', defects: ['刮花', '底座破损', '脱污', '无法拍照', '盖泰', '天实', '深奥'] }
    ],
    common_defects: ['显示异常', '光学性能不良', '图像质量问题'],
    suppliers: ['帝晶', '天马', 'BOE', '华星', '盖泰', '天实', '深奥'],
    key_inspection_items: ['显示效果', '光学参数', '图像质量', '色彩准确性']
  },

  // 充电类
  charging: {
    name: '充电类',
    materials: [
      { name: '电池', defects: ['起鼓', '松动', '漏液', '输出功率异常', '发热导常', '奥海', '辰阳'] },
      { name: '充电器', defects: ['无法充电', '外壳破损', '输出功率异常', '发热导常', '锂威', '风华', '维科'] }
    ],
    common_defects: ['充电异常', '电气性能不良', '安全隐患'],
    suppliers: ['奥海', '辰阳', '锂威', '风华', '维科'],
    key_inspection_items: ['电气性能', '充电效率', '安全性能', '温度控制']
  },

  // 声学类
  acoustic: {
    name: '声学类',
    materials: [
      { name: '喇叭', defects: ['无声', '杂音', '音量小', '破裂', '东声', '豪声', '歌尔'] },
      { name: '听筒', defects: ['无声', '杂音', '音量小', '破裂', '东声', '豪声', '歌尔'] }
    ],
    common_defects: ['音频异常', '声学性能不良', '机械损坏'],
    suppliers: ['东声', '豪声', '歌尔'],
    key_inspection_items: ['音频质量', '音量输出', '频响特性', '机械强度']
  },

  // 包装类
  packaging: {
    name: '包装类',
    materials: [
      { name: '保护套', defects: ['尺寸偏差', '发黄', '开孔错位', '模具压痕', '丽德宝', '裕同', '富群'] },
      { name: '标签', defects: ['脱落', '错印', 'logo错误', '尺寸异常', '丽德宝', '裕同', '富群'] },
      { name: '包装盒', defects: ['破损', 'logo错误', '错印', '尺寸异常', '丽德宝', '裕同', '富群'] }
    ],
    common_defects: ['包装缺陷', '印刷问题', '尺寸偏差'],
    suppliers: ['丽德宝', '裕同', '富群'],
    key_inspection_items: ['包装完整性', '印刷质量', '尺寸精度', '外观质量']
  }
};

// 场景查询规则分类
const SCENARIO_RULES = {
  inventory: {
    name: '库存查询',
    rules: [
      '物料库存查询',
      '供应商库存查询', 
      '批次库存信息查询',
      '库存状态查询（风险、冻结物料）'
    ]
  },
  online: {
    name: '上线数据查询',
    rules: [
      '物料上线情况查询',
      '供应商上线情况查询',
      '批次上线情况查询', 
      '项目物料不良查询',
      '基线物料不良查询'
    ]
  },
  testing: {
    name: '测试查询',
    rules: [
      '物料测试情况查询',
      '供应商测试情况查询',
      '测试NG情况查询',
      '项目测试情况查询',
      '基线测试情况查询',
      '批次测试情况查询'
    ]
  }
};

// 生成物料大类查询规则模板
function generateMaterialCategoryRules() {
  const rules = [];
  
  Object.entries(MATERIAL_CATEGORIES).forEach(([categoryKey, category]) => {
    const categoryName = category.name;
    const materials = category.materials.map(m => m.name);
    const suppliers = category.suppliers;
    const commonDefects = category.common_defects;
    
    // 为每个大类生成库存查询规则
    rules.push({
      intent_name: `${categoryName}库存查询`,
      description: `查询${categoryName}的库存信息`,
      action_type: 'SQL_QUERY',
      action_target: `
SELECT 
  SUBSTRING_INDEX(storage_location, '-', 1) as 工厂,
  SUBSTRING_INDEX(storage_location, '-', -1) as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d %H:%i') as 入库时间,
  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory 
WHERE material_name IN (${materials.map(m => `'${m}'`).join(', ')})
   OR supplier_name IN (${suppliers.map(s => `'${s}'`).join(', ')})
ORDER BY inbound_time DESC
LIMIT 10`,
      parameters: JSON.stringify([]),
      trigger_words: JSON.stringify([`${categoryName}库存`, `${categoryName}查询`, ...materials, ...suppliers]),
      synonyms: JSON.stringify({
        [categoryName]: materials,
        "库存": ["存货", "仓储"],
        "查询": ["查找", "搜索"]
      }),
      example_query: `查询${categoryName}库存`,
      category: '物料大类查询',
      priority: 8
    });
    
    // 为每个大类生成上线查询规则
    rules.push({
      intent_name: `${categoryName}上线情况查询`,
      description: `查询${categoryName}的上线跟踪信息`,
      action_type: 'SQL_QUERY',
      action_target: `
SELECT 
  factory as 工厂,
  project as 基线,
  project as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  batch_code as 批次号,
  CONCAT(ROUND(defect_rate * 100, 2), '%') as 不良率,
  exception_count as 本周异常,
  DATE_FORMAT(inspection_date, '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking 
WHERE material_name IN (${materials.map(m => `'${m}'`).join(', ')})
   OR supplier_name IN (${suppliers.map(s => `'${s}'`).join(', ')})
ORDER BY inspection_date DESC
LIMIT 10`,
      parameters: JSON.stringify([]),
      trigger_words: JSON.stringify([`${categoryName}上线`, `${categoryName}跟踪`, ...materials]),
      synonyms: JSON.stringify({
        [categoryName]: materials,
        "上线": ["在线", "生产"],
        "跟踪": ["追踪", "监控"]
      }),
      example_query: `查询${categoryName}上线情况`,
      category: '物料大类查询',
      priority: 8
    });
    
    // 为每个大类生成测试查询规则
    rules.push({
      intent_name: `${categoryName}测试情况查询`,
      description: `查询${categoryName}的测试结果信息`,
      action_type: 'SQL_QUERY',
      action_target: `
SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(project_id, '未指定') as 项目,
  COALESCE(baseline_id, '未指定') as 基线,
  material_code as 物料编码,
  COUNT(*) OVER (PARTITION BY material_name, supplier_name) as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(conclusion, '') as 备注
FROM lab_tests 
WHERE material_name IN (${materials.map(m => `'${m}'`).join(', ')})
   OR supplier_name IN (${suppliers.map(s => `'${s}'`).join(', ')})
ORDER BY test_date DESC
LIMIT 10`,
      parameters: JSON.stringify([]),
      trigger_words: JSON.stringify([`${categoryName}测试`, `${categoryName}检测`, ...materials]),
      synonyms: JSON.stringify({
        [categoryName]: materials,
        "测试": ["检测", "检验"],
        "结果": ["数据", "报告"]
      }),
      example_query: `查询${categoryName}测试情况`,
      category: '物料大类查询',
      priority: 8
    });
  });
  
  return rules;
}

// 分析当前规则库状态
function analyzeCurrentRuleLibrary() {
  console.log('📊 物料大类结构分析');
  console.log('='.repeat(50));
  
  Object.entries(MATERIAL_CATEGORIES).forEach(([key, category]) => {
    console.log(`\n🏷️ ${category.name}:`);
    console.log(`   物料: ${category.materials.map(m => m.name).join(', ')}`);
    console.log(`   供应商: ${category.suppliers.join(', ')}`);
    console.log(`   常见缺陷: ${category.common_defects.join(', ')}`);
  });
  
  console.log('\n📋 场景查询规则需求:');
  Object.entries(SCENARIO_RULES).forEach(([key, scenario]) => {
    console.log(`\n${scenario.name}:`);
    scenario.rules.forEach((rule, index) => {
      console.log(`   ${index + 1}. ${rule}`);
    });
  });
  
  console.log('\n🎯 需要创建的物料大类规则:');
  const categoryCount = Object.keys(MATERIAL_CATEGORIES).length;
  console.log(`   - ${categoryCount} 个物料大类`);
  console.log(`   - 每个大类 3 个场景（库存、上线、测试）`);
  console.log(`   - 总计需要创建: ${categoryCount * 3} 条物料大类规则`);
}

export { MATERIAL_CATEGORIES, SCENARIO_RULES, generateMaterialCategoryRules, analyzeCurrentRuleLibrary };

// 直接运行分析
analyzeCurrentRuleLibrary();
