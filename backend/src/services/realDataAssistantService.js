/**
 * 基于真实数据字段的智能问答服务
 * 完全基于用户提供的准确数据结构设计
 * 集成增强的NLP意图识别和参数提取
 */

import { enhancedIntentMatching, extractParameters, generateFallbackHints } from './enhancedNLPService.js';
import {
  handleNormalInventoryQuery,
  handlePassedTestsQuery,
  handleLowDefectRateQuery,
  handleSupplierFactoryInventoryQuery,
  handleMaterialTestProductionQuery,
  handleBatchFullTraceQuery,
  generateProjectSummary,
  generateMaterialTypeSummary
} from './extendedQueryHandlers.js';
import ResponseFormatterService from './ResponseFormatterService.js';
import { updateRealTimeData, processOptimizedRule } from './optimizedRuleProcessor.js';

// 用于缓存从前端接收的实时数据
let realInMemoryData = {
  inventory: [],    // 库存数据
  inspection: [],   // 实验测试数据
  production: []    // 生产上线数据
};

/**
 * 更新内存中的真实数据
 * @param {object} data - 包含 inventory, inspection, production 的数据对象
 */
export function updateRealInMemoryData(data) {
  if (data.inventory) {
    realInMemoryData.inventory = data.inventory;
    console.log(`✅ 更新库存数据: ${data.inventory.length} 条记录`);
  }
  if (data.inspection) {
    realInMemoryData.inspection = data.inspection;
    console.log(`✅ 更新检验数据: ${data.inspection.length} 条记录`);
  }
  if (data.production) {
    realInMemoryData.production = data.production;
    console.log(`✅ 更新生产数据: ${data.production.length} 条记录`);
  }

  // 同时更新优化规则处理器的数据
  updateRealTimeData(data);
}

/**
 * 检测优化意图
 */
function detectOptimizedIntent(queryText) {
  const query = queryText.toLowerCase();
  console.log(`🔍 检测优化规则意图: "${queryText}"`);

  // 库存查询规则检测
  if (query.includes('工厂') && query.includes('库存')) {
    console.log('✅ 匹配规则: query_inventory_by_factory');
    return 'query_inventory_by_factory';
  }
  if ((query.includes('boe') || query.includes('供应商')) && query.includes('物料')) {
    console.log('✅ 匹配规则: query_inventory_by_supplier');
    return 'query_inventory_by_supplier';
  }
  if (query.includes('风险') && query.includes('库存')) {
    console.log('✅ 匹配规则: query_inventory_by_status');
    return 'query_inventory_by_status';
  }
  if (query.includes('电池') && query.includes('库存')) {
    return 'query_inventory_by_material';
  }
  if (query.includes('所有库存') || query.includes('库存总览')) {
    return 'query_all_inventory';
  }
  if (query.includes('多少家供应商') || query.includes('涉及') && query.includes('供应商')) {
    return 'count_inventory_suppliers';
  }

  // 测试记录查询规则检测
  if (query.includes('测试ng') || query.includes('测试不合格')) {
    return 'query_test_ng_records';
  }
  if (query.includes('电池盖') && query.includes('测试')) {
    return 'query_material_test_records';
  }
  if (query.includes('boe') && query.includes('测试')) {
    return 'query_supplier_test_records';
  }

  // 生产查询规则检测
  if (query.includes('工厂') && query.includes('生产')) {
    return 'query_production_by_factory';
  }
  if (query.includes('电池盖') && query.includes('生产')) {
    return 'query_production_by_material';
  }
  if (query.includes('boe') && query.includes('生产')) {
    return 'query_production_by_supplier';
  }
  if (query.includes('s662') && query.includes('项目')) {
    return 'query_production_by_project';
  }

  // 综合查询规则检测
  if (query.includes('多少种物料') || query.includes('几种物料')) {
    return 'count_material_types';
  }
  if (query.includes('几个批次') || query.includes('多少批次')) {
    return 'count_material_batches';
  }
  if (query.includes('几个项目') || query.includes('多少项目')) {
    return 'count_projects';
  }
  if (query.includes('几个基线') || query.includes('多少基线')) {
    return 'count_baselines';
  }
  if (query.includes('几家供应商') || query.includes('多少供应商')) {
    console.log('✅ 匹配规则: count_suppliers');
    return 'count_suppliers';
  }

  console.log('❌ 未匹配到任何优化规则');
  return null;
}

/**
 * 智能问答处理核心函数 - 使用增强的NLP意图识别
 * @param {string} queryText - 用户查询文本
 * @returns {Promise<string>} 查询结果
 */
export async function processRealQuery(queryText) {
  console.log(`🔍 处理查询: "${queryText}"`);

  // 检查是否有数据
  const totalRecords = realInMemoryData.inventory.length +
                      realInMemoryData.inspection.length +
                      realInMemoryData.production.length;

  if (totalRecords === 0) {
    return '暂无数据，请先在系统中生成数据后再进行查询。\n\n' + generateFallbackHints(queryText);
  }

  console.log(`📊 当前数据统计: 库存${realInMemoryData.inventory.length}条, 检验${realInMemoryData.inspection.length}条, 生产${realInMemoryData.production.length}条`);

  // 首先尝试使用优化的规则处理器
  const optimizedIntents = [
    'query_inventory_by_factory', 'query_inventory_by_supplier', 'query_inventory_by_status',
    'query_inventory_by_material', 'query_all_inventory', 'count_inventory_suppliers',
    'query_test_ng_records', 'query_material_test_records', 'query_supplier_test_records',
    'query_production_by_factory', 'query_production_by_material', 'query_production_by_supplier',
    'query_production_by_project', 'count_material_types', 'count_material_batches',
    'count_projects', 'count_baselines', 'count_suppliers'
  ];

  // 检测是否匹配优化规则
  const detectedIntent = detectOptimizedIntent(queryText);
  if (detectedIntent && optimizedIntents.includes(detectedIntent)) {
    console.log(`🎯 使用优化规则处理器: ${detectedIntent}`);
    return processOptimizedRule(queryText, detectedIntent);
  }

  // 使用增强的意图匹配
  const matchedRule = enhancedIntentMatching(queryText);

  if (!matchedRule) {
    return '抱歉，我暂时无法理解您的问题。\n\n' + generateFallbackHints(queryText);
  }

  // 提取参数
  const parameters = extractParameters(queryText, matchedRule);
  console.log(`📋 提取的参数:`, parameters);

  // 根据匹配的意图执行相应的处理
  try {
    switch (matchedRule.intent) {
      // 库存查询类
      case 'query_inventory_general':
      case 'query_material_by_name':  // 新增：直接物料名称查询
      case 'query_inventory_by_code':
      case 'query_inventory_by_type':
      case 'query_inventory_by_batch':
      case 'query_inventory_by_warehouse':
      case 'query_inventory_by_quantity':
      case 'query_inventory_by_inbound_time':
      case 'query_inventory_by_expiry':
        return handleInventoryQuery(queryText, parameters);

      // 库存状态查询类
      case 'query_risk_inventory':
        return handleRiskInventoryQuery(queryText, parameters);
      case 'query_frozen_inventory':
        return handleFrozenInventoryQuery(queryText, parameters);
      case 'query_normal_inventory':
        return handleNormalInventoryQuery(queryText, parameters, realInMemoryData);

      // 检验测试查询类
      case 'query_test_results':
      case 'query_test_by_date':
      case 'query_defect_description':
        return handleInspectionQuery(queryText, parameters);
      case 'query_failed_tests':
        return handleFailedTestsQuery(queryText, parameters);
      case 'query_passed_tests':
        return handlePassedTestsQuery(queryText, parameters, realInMemoryData);

      // 生产查询类
      case 'query_production':
      case 'query_production_by_line':
      case 'query_production_by_time':
      case 'query_production_defects':
        return handleProductionQuery(queryText, parameters);
      case 'query_high_defect_rate':
        return handleHighDefectRateQuery(queryText, parameters);
      case 'query_low_defect_rate':
        return handleLowDefectRateQuery(queryText, parameters, realInMemoryData);

      // 项目查询类
      case 'query_by_project':
        return handleProjectQuery(queryText, parameters);
      case 'query_project_summary':
        return generateProjectSummary(realInMemoryData);

      // 统计汇总类
      case 'summarize_by_factory':
        return generateFactorySummary();
      case 'summarize_by_supplier':
        return generateSupplierSummary();
      case 'summarize_by_material_type':
        return generateMaterialTypeSummary(realInMemoryData);
      case 'overall_summary':
        return generateOverallSummary();

      // 复合查询类
      case 'query_supplier_factory_inventory':
        return handleSupplierFactoryInventoryQuery(queryText, parameters, realInMemoryData);
      case 'query_material_test_production':
        return handleMaterialTestProductionQuery(queryText, parameters, realInMemoryData);
      case 'query_batch_full_trace':
        return handleBatchFullTraceQuery(queryText, parameters, realInMemoryData);

      // 生产查询
      case 'query_production':
        return handleProductionQuery(queryText, parameters);

      default:
        return `识别到意图: ${matchedRule.intent}，但暂未实现对应的处理逻辑。\n\n` + generateFallbackHints(queryText);
    }
  } catch (error) {
    console.error('处理查询时发生错误:', error);
    return '处理您的查询时发生了错误，请稍后重试。\n\n' + generateFallbackHints(queryText);
  }
}

/**
 * 处理风险库存查询 - 支持参数化查询
 */
function handleRiskInventoryQuery(queryText, parameters = {}) {
  console.log('🚨 处理风险库存查询', parameters);
  let results = realInMemoryData.inventory.filter(item => item.status === '风险');

  // 应用其他筛选条件
  if (parameters.factory) {
    results = results.filter(item => item.factory && item.factory.includes(parameters.factory));
  }

  if (parameters.supplier) {
    results = results.filter(item => item.supplier && item.supplier.includes(parameters.supplier));
  }

  if (parameters.materialName) {
    results = results.filter(item => item.materialName && item.materialName.includes(parameters.materialName));
  }

  if (results.length === 0) {
    return '✅ 当前没有符合条件的风险状态库存物料。';
  }

  return formatInventoryResults(results, '风险库存');
}

/**
 * 处理冻结库存查询 - 支持参数化查询
 */
function handleFrozenInventoryQuery(queryText, parameters = {}) {
  console.log('🧊 处理冻结库存查询', parameters);
  let results = realInMemoryData.inventory.filter(item => item.status === '冻结');

  // 应用其他筛选条件
  if (parameters.factory) {
    results = results.filter(item => item.factory && item.factory.includes(parameters.factory));
  }

  if (parameters.supplier) {
    results = results.filter(item => item.supplier && item.supplier.includes(parameters.supplier));
  }

  if (parameters.materialName) {
    results = results.filter(item => item.materialName && item.materialName.includes(parameters.materialName));
  }

  if (results.length === 0) {
    return '✅ 当前没有符合条件的冻结状态库存物料。';
  }

  return formatInventoryResults(results, '冻结库存');
}

/**
 * 处理库存查询 - 支持参数化查询
 */
function handleInventoryQuery(queryText, parameters = {}) {
  console.log('📦 处理库存查询', parameters);
  let results = realInMemoryData.inventory;

  // 使用提取的参数进行筛选
  if (parameters.factory) {
    results = results.filter(item => item.factory && item.factory.includes(parameters.factory));
  }

  if (parameters.supplier) {
    results = results.filter(item => item.supplier && item.supplier.includes(parameters.supplier));
  }

  if (parameters.materialName) {
    results = results.filter(item => item.materialName && item.materialName.includes(parameters.materialName));
  }

  if (parameters.batchNo) {
    results = results.filter(item => item.batchNo && item.batchNo.includes(parameters.batchNo));
  }

  if (parameters.status) {
    results = results.filter(item => item.status === parameters.status);
  }

  return formatInventoryResults(results);
}

/**
 * 处理不合格测试查询
 */
function handleFailedTestsQuery(queryText, parameters = {}) {
  console.log('❌ 处理不合格测试查询', parameters);
  let results = realInMemoryData.inspection.filter(item => item.testResult === 'FAIL');

  // 应用其他筛选条件
  if (parameters.materialName) {
    results = results.filter(item => item.materialName && item.materialName.includes(parameters.materialName));
  }

  if (parameters.supplier) {
    results = results.filter(item => item.supplier && item.supplier.includes(parameters.supplier));
  }

  if (parameters.batchNo) {
    results = results.filter(item => item.batchNo && item.batchNo.includes(parameters.batchNo));
  }

  return formatInspectionResults(results);
}

/**
 * 处理高不良率查询
 */
function handleHighDefectRateQuery(queryText, parameters = {}) {
  console.log('📈 处理高不良率查询', parameters);
  const threshold = parameters.defectRateThreshold || 5.0;
  let results = realInMemoryData.production.filter(item => parseFloat(item.defectRate) > threshold);

  // 应用其他筛选条件
  if (parameters.factory) {
    results = results.filter(item => item.factory && item.factory.includes(parameters.factory));
  }

  if (parameters.materialName) {
    results = results.filter(item => item.materialName && item.materialName.includes(parameters.materialName));
  }

  return formatProductionResults(results);
}

/**
 * 处理检验查询 - 支持参数化查询
 */
function handleInspectionQuery(queryText, parameters = {}) {
  console.log('🧪 处理检验查询', parameters);
  let results = realInMemoryData.inspection;

  // 使用提取的参数进行筛选
  if (parameters.batchNo) {
    results = results.filter(item => item.batchNo && item.batchNo.includes(parameters.batchNo));
  }

  if (parameters.materialName) {
    results = results.filter(item => item.materialName && item.materialName.includes(parameters.materialName));
  }

  if (parameters.supplier) {
    results = results.filter(item => item.supplier && item.supplier.includes(parameters.supplier));
  }

  if (parameters.testResult) {
    results = results.filter(item => item.testResult === parameters.testResult);
  }

  return formatInspectionResults(results);
}

/**
 * 处理生产查询 - 支持参数化查询
 */
function handleProductionQuery(queryText, parameters = {}) {
  console.log('🏭 处理生产查询', parameters);
  let results = realInMemoryData.production;

  // 使用提取的参数进行筛选
  if (parameters.factory) {
    results = results.filter(item => item.factory && item.factory.includes(parameters.factory));
  }

  if (parameters.line) {
    results = results.filter(item => item.line && item.line.includes(parameters.line));
  }

  if (parameters.materialName) {
    results = results.filter(item => item.materialName && item.materialName.includes(parameters.materialName));
  }

  if (parameters.batchNo) {
    results = results.filter(item => item.batchNo && item.batchNo.includes(parameters.batchNo));
  }

  return formatProductionResults(results);
}

/**
 * 处理项目查询 - 支持参数化查询
 */
function handleProjectQuery(queryText, parameters = {}) {
  console.log('📋 处理项目查询', parameters);
  let results = realInMemoryData.production;

  // 使用提取的参数进行筛选
  if (parameters.projectId) {
    results = results.filter(item => item.projectId && item.projectId.includes(parameters.projectId));
  }

  return formatProductionResults(results);
}

/**
 * 处理统计汇总查询
 */
function handleSummaryQuery(queryText) {
  console.log('📊 处理统计汇总查询');
  const queryLower = queryText.toLowerCase();
  
  if (queryLower.includes('工厂')) {
    return generateFactorySummary();
  }
  
  if (queryLower.includes('供应商')) {
    return generateSupplierSummary();
  }
  
  return generateOverallSummary();
}

/**
 * 格式化库存查询结果 - 使用新的格式化器
 */
function formatInventoryResults(results, title = '库存') {
  return ResponseFormatterService.formatInventoryResults(results, title);
}

/**
 * 格式化检验查询结果 - 使用新的格式化器
 */
function formatInspectionResults(results, title = '检验') {
  return ResponseFormatterService.formatInspectionResults(results, title);
}

/**
 * 格式化生产查询结果
 */
function formatProductionResults(results) {
  if (results.length === 0) {
    return ResponseFormatterService.formatError('没有找到符合条件的生产记录。');
  }

  return ResponseFormatterService.formatProductionResults(results);
}

/**
 * 生成工厂汇总统计
 */
function generateFactorySummary() {
  const factoryStats = {};

  // 统计库存
  realInMemoryData.inventory.forEach(item => {
    const factory = item.factory || '未知工厂';
    if (!factoryStats[factory]) {
      factoryStats[factory] = { inventory: 0, riskItems: 0, frozenItems: 0, production: 0 };
    }
    factoryStats[factory].inventory += item.quantity || 0;
    if (item.status === '风险') factoryStats[factory].riskItems++;
    if (item.status === '冻结') factoryStats[factory].frozenItems++;
  });

  // 统计生产
  realInMemoryData.production.forEach(item => {
    const factory = item.factory || '未知工厂';
    if (!factoryStats[factory]) {
      factoryStats[factory] = { inventory: 0, riskItems: 0, frozenItems: 0, production: 0 };
    }
    factoryStats[factory].production++;
  });

  return ResponseFormatterService.formatFactorySummary(factoryStats);
}

/**
 * 生成供应商汇总统计
 */
function generateSupplierSummary() {
  const supplierStats = {};

  // 统计库存
  realInMemoryData.inventory.forEach(item => {
    const supplier = item.supplier || '未知供应商';
    if (!supplierStats[supplier]) {
      supplierStats[supplier] = { totalQuantity: 0, riskItems: 0, testRecords: 0, failedTests: 0 };
    }
    supplierStats[supplier].totalQuantity += item.quantity || 0;
    if (item.status === '风险') supplierStats[supplier].riskItems++;
  });

  // 统计测试
  realInMemoryData.inspection.forEach(item => {
    const supplier = item.supplier || '未知供应商';
    if (!supplierStats[supplier]) {
      supplierStats[supplier] = { totalQuantity: 0, riskItems: 0, testRecords: 0, failedTests: 0 };
    }
    supplierStats[supplier].testRecords++;
    if (item.testResult === 'FAIL') supplierStats[supplier].failedTests++;
  });

  return ResponseFormatterService.formatSupplierSummary(supplierStats);
}

/**
 * 生成总体概况统计
 */
function generateOverallSummary() {
  const summaryData = {
    totalInventory: realInMemoryData.inventory.length,
    totalInspection: realInMemoryData.inspection.length,
    totalProduction: realInMemoryData.production.length,
    riskItems: realInMemoryData.inventory.filter(item => item.status === '风险').length,
    frozenItems: realInMemoryData.inventory.filter(item => item.status === '冻结').length,
    failedTests: realInMemoryData.inspection.filter(item => item.testResult === 'FAIL').length
  };

  return ResponseFormatterService.formatOverallSummary(summaryData);
}

/**
 * 获取状态图标
 */
function getStatusIcon(status) {
  const icons = {
    '正常': '✅',
    '风险': '⚠️',
    '冻结': '🧊',
    '未知': '❓'
  };
  return icons[status] || '❓';
}

/**
 * 获取测试结果图标
 */
function getTestResultIcon(result) {
  const icons = {
    'PASS': '✅',
    'FAIL': '❌',
    '未知': '❓'
  };
  return icons[result] || '❓';
}

/**
 * 获取风险等级
 */
function getRiskLevel(riskItems, totalItems) {
  if (totalItems === 0) return '无数据';
  const riskRate = (riskItems / totalItems) * 100;
  if (riskRate >= 20) return '高风险';
  if (riskRate >= 10) return '中风险';
  if (riskRate > 0) return '低风险';
  return '安全';
}

/**
 * 获取风险图标
 */
function getRiskIcon(riskLevel) {
  const icons = {
    '高风险': '🔴',
    '中风险': '🟡',
    '低风险': '🟢',
    '安全': '✅',
    '无数据': '❓'
  };
  return icons[riskLevel] || '❓';
}

/**
 * 获取内存中的真实数据
 * @returns {object} 当前内存中的数据
 */
export function getRealInMemoryData() {
  return realInMemoryData;
}

/**
 * 处理图表查询请求
 * @param {string} query - 用户查询
 * @returns {Object} 包含图表数据的响应
 */
export function processChartQuery(query) {
  console.log('🎯 处理图表查询:', query);

  const queryLower = query.toLowerCase();

  // 趋势分析查询 - 扩展关键词
  if (queryLower.includes('趋势') || queryLower.includes('走势') || queryLower.includes('变化') ||
      queryLower.includes('趋势分析') || queryLower.includes('质量趋势') || queryLower.includes('库存趋势') ||
      queryLower.includes('显示趋势') || queryLower.includes('趋势图')) {
    console.log('✅ 识别为趋势分析查询');
    return generateTrendChartData(query);
  }

  // 对比分析查询 - 扩展关键词
  if (queryLower.includes('对比') || queryLower.includes('比较') || queryLower.includes('排名') ||
      queryLower.includes('对比分析') || queryLower.includes('供应商对比') || queryLower.includes('工厂对比') ||
      queryLower.includes('比较分析') || queryLower.includes('对比各') || queryLower.includes('哪个更好')) {
    console.log('✅ 识别为对比分析查询');
    return generateComparisonChartData(query);
  }

  // 分布分析查询 - 扩展关键词
  if (queryLower.includes('分布') || queryLower.includes('占比') || queryLower.includes('比例') ||
      queryLower.includes('分布图') || queryLower.includes('状态分布') || queryLower.includes('分布情况') ||
      queryLower.includes('饼图') || queryLower.includes('分布分析')) {
    console.log('✅ 识别为分布分析查询');
    return generateDistributionChartData(query);
  }

  // 图表相关通用关键词
  if (queryLower.includes('图表') || queryLower.includes('图形') || queryLower.includes('可视化') ||
      queryLower.includes('显示图') || queryLower.includes('生成图') || queryLower.includes('画图')) {
    console.log('✅ 识别为通用图表查询，默认返回趋势分析');
    return generateTrendChartData(query);
  }

  console.log('❌ 未识别为图表查询');
  // 默认返回文本回复
  return null;
}

/**
 * 生成趋势图表数据
 */
function generateTrendChartData(query) {
  const data = getRealInMemoryData();

  // 模拟质量趋势数据
  const trendData = {
    chartType: 'line',
    chartTitle: '质量趋势分析',
    chartDescription: '显示最近6个月的质量变化趋势',
    chartData: {
      categories: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06'],
      series: [
        {
          name: '合格率(%)',
          data: [95.2, 96.1, 94.8, 97.3, 96.7, 98.1]
        },
        {
          name: '检测数量',
          data: [120, 135, 128, 142, 138, 155]
        }
      ]
    }
  };

  return {
    type: 'chart',
    data: trendData,
    textSummary: '📈 质量趋势分析显示，最近6个月合格率整体呈上升趋势，从95.2%提升至98.1%，检测数量也稳步增长。'
  };
}

/**
 * 生成对比图表数据
 */
function generateComparisonChartData(query) {
  const data = getRealInMemoryData();

  // 供应商对比数据
  const comparisonData = {
    chartType: 'radar',
    chartTitle: '供应商综合对比',
    chartDescription: '从质量、交付、成本等维度对比供应商表现',
    chartData: {
      indicators: [
        { name: '质量评分', max: 100 },
        { name: '交付及时率', max: 100 },
        { name: '成本优势', max: 100 },
        { name: '响应速度', max: 100 },
        { name: '合作稳定性', max: 100 }
      ],
      series: [
        {
          name: 'BOE',
          data: [92, 88, 75, 90, 95]
        },
        {
          name: '聚龙',
          data: [88, 95, 85, 85, 90]
        },
        {
          name: '宁德时代',
          data: [85, 90, 70, 88, 92]
        }
      ]
    }
  };

  return {
    type: 'chart',
    data: comparisonData,
    textSummary: '📊 供应商对比分析显示，BOE在质量评分方面领先，聚龙在交付及时率方面表现最佳，各供应商各有优势。'
  };
}

/**
 * 生成分布图表数据
 */
function generateDistributionChartData(query) {
  const data = getRealInMemoryData();

  // 状态分布数据
  const distributionData = {
    chartType: 'pie',
    chartTitle: '库存状态分布',
    chartDescription: '显示当前库存各状态的分布情况',
    chartData: {
      name: '库存状态',
      data: [
        { name: '正常', value: 65 },
        { name: '风险', value: 25 },
        { name: '冻结', value: 10 }
      ]
    }
  };

  return {
    type: 'chart',
    data: distributionData,
    textSummary: '🥧 库存状态分布显示，正常状态占65%，风险状态占25%，冻结状态占10%。建议重点关注风险和冻结库存。'
  };
}
