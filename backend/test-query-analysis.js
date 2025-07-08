// 测试查询分析逻辑
function analyzeQuery(query) {
  console.log(`🔍 分析查询: "${query}"`);

  const analysis = {
    type: 'general',
    keywords: [],
    filters: {},
    limit: 10
  };

  let hasInventoryEntity = false;

  // 提取批次信息
  const batchPatterns = [
    /批次[：:]?\s*([A-Za-z0-9\-]+)/,     // 批次: BATCH-xxx
    /([A-Za-z0-9\-]+)批次/,              // BATCH-xxx批次
    /([0-9]{6})(?=的|批次|物料)/,        // 直接的6位数字
    /TEST-([0-9]+)/                      // 测试批次格式
  ];

  for (const pattern of batchPatterns) {
    const batchMatch = query.match(pattern);
    if (batchMatch) {
      analysis.filters.batch = batchMatch[1];
      analysis.keywords.push(batchMatch[1]);
      console.log(`📦 批次匹配成功: "${batchMatch[1]}"`);
      break;
    }
  }

  // 提取工厂信息
  const factoryPatterns = [
    /(测试工厂)/,                           // 测试工厂
    /([A-Za-z\u4e00-\u9fa5]+工厂)/          // 通用工厂模式
  ];

  for (const pattern of factoryPatterns) {
    const factoryMatch = query.match(pattern);
    if (factoryMatch) {
      console.log(`🏭 工厂匹配成功: "${factoryMatch[1]}" (模式: ${pattern})`);
      analysis.filters.factory = factoryMatch[1];
      analysis.keywords.push(factoryMatch[1]);
      hasInventoryEntity = true;
      break;
    }
  }

  // 提取供应商信息
  if (!analysis.filters.factory) {
    const supplierPatterns = [
      /([A-Za-z\u4e00-\u9fa5]*供应商[A-Za-z0-9]*)/,
      /(测试供应商[A-Za-z0-9]*)/
    ];

    for (const pattern of supplierPatterns) {
      const supplierMatch = query.match(pattern);
      if (supplierMatch) {
        console.log(`🎯 供应商匹配成功: "${supplierMatch[1]}" (模式: ${pattern})`);
        analysis.filters.supplier = supplierMatch[1];
        analysis.keywords.push(supplierMatch[1]);
        hasInventoryEntity = true;
        break;
      }
    }

    // 通用供应商和工厂匹配
    const generalPatterns = [
      /查询([A-Za-z\u4e00-\u9fa5]+)的(?:物料|库存)/,
      /([A-Za-z\u4e00-\u9fa5]+)(?=有什么|的物料)/
    ];

    for (const pattern of generalPatterns) {
      const generalMatch = query.match(pattern);
      if (generalMatch) {
        const matchedText = generalMatch[1];
        // 判断是供应商还是工厂
        if (matchedText.includes('工厂')) {
          console.log(`🏭 工厂匹配成功: "${matchedText}" (通用模式)`);
          analysis.filters.factory = matchedText;
          analysis.keywords.push(matchedText);
          hasInventoryEntity = true;
        } else {
          console.log(`🎯 供应商匹配成功: "${matchedText}" (通用模式)`);
          analysis.filters.supplier = matchedText;
          analysis.keywords.push(matchedText);
          hasInventoryEntity = true;
        }
        break;
      }
    }
  }

  // 提取物料信息
  const materialPatterns = [
    /物料[：:]?\s*([A-Za-z0-9\u4e00-\u9fa5\-]+)/,
    /([A-Za-z0-9\u4e00-\u9fa5\-]+)物料/,
    /物料名称[：:]?\s*([A-Za-z0-9\u4e00-\u9fa5\-]+)/,
    /([A-Za-z\u4e00-\u9fa5]+)(?=的物料|物料)/  // 通用模式，放在最后
  ];

  // 先检查是否有精确的物料名称匹配
  let materialFound = false;
  for (let i = 0; i < materialPatterns.length - 1; i++) { // 排除最后一个通用模式
    const pattern = materialPatterns[i];
    const materialMatch = query.match(pattern);
    if (materialMatch) {
      console.log(`🔧 物料匹配成功: "${materialMatch[1]}" (精确匹配)`);
      analysis.filters.material = materialMatch[1];
      analysis.keywords.push(materialMatch[1]);
      hasInventoryEntity = true;
      materialFound = true;
      break;
    }
  }

  // 如果没有精确匹配，且查询明确包含物料相关词汇，则使用通用模式
  if (!materialFound && (query.includes('物料') || query.includes('库存'))) {
    const generalPattern = materialPatterns[materialPatterns.length - 1];
    const materialMatch = query.match(generalPattern);
    if (materialMatch && !analysis.filters.supplier && !analysis.filters.factory) {
      // 只有在没有匹配到供应商和工厂时才使用通用物料匹配
      console.log(`🔧 物料匹配成功: "${materialMatch[1]}" (通用匹配)`);
      analysis.filters.material = materialMatch[1];
      analysis.keywords.push(materialMatch[1]);
      hasInventoryEntity = true;
    }
  }

  // 提取状态信息 - 基于真实状态值
  if (query.includes('风险') || query.includes('异常')) {
    analysis.filters.status = '风险';
    hasInventoryEntity = true;
  }
  if (query.includes('正常')) {
    analysis.filters.status = '正常';
    hasInventoryEntity = true;
  }
  if (query.includes('冻结')) {
    analysis.filters.status = '冻结';
    hasInventoryEntity = true;
  }

  // 提取测试结果 - 基于真实测试结果值
  if (query.includes('合格') || query.includes('PASS') || query.includes('OK')) {
    analysis.filters.testResult = 'PASS';
  }
  if (query.includes('不合格') || query.includes('FAIL') || query.includes('NG')) {
    analysis.filters.testResult = 'FAIL';
  }

  // 根据实体和关键词确定查询类型
  if (analysis.filters.supplier || analysis.filters.factory || analysis.filters.material ||
      analysis.filters.status || hasInventoryEntity ||
      query.includes('库存') || query.includes('物料') || query.includes('批次') || query.includes('供应商')) {
    analysis.type = 'inventory';
  } else if (query.includes('测试') || query.includes('检验') || query.includes('实验') || query.includes('合格') || query.includes('不合格')) {
    analysis.type = 'test';
  } else if (query.includes('生产') || query.includes('在线') || query.includes('产线') || query.includes('不良率')) {
    analysis.type = 'production';
  }

  console.log('📋 查询分析结果:', analysis);
  return analysis;
}

// 测试不同的查询
const testQueries = [
  "库存",
  "查询库存",
  "查询所有库存",
  "查询测试供应商A的物料",
  "查询泰科电子的物料"
];

console.log('=== 查询分析测试 ===\n');
testQueries.forEach(query => {
  console.log(`\n--- 测试查询: "${query}" ---`);
  const result = analyzeQuery(query);
  console.log(`结果类型: ${result.type}`);
  console.log(`过滤条件:`, result.filters);
  console.log('---\n');
});
