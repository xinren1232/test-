/**
 * 优化的规则处理器 V2.0
 * 基于用户实际需求和数据结构设计
 */

import ResponseFormatterService from './ResponseFormatterService.js';
import EnhancedResponseFormatter from './EnhancedResponseFormatter.js';

// 缓存实时数据
let realTimeData = {
  inventory: [],
  inspection: [],
  production: []
};

/**
 * 更新实时数据
 */
export function updateRealTimeData(data) {
  if (data.inventory) realTimeData.inventory = data.inventory;
  if (data.inspection) realTimeData.inspection = data.inspection;
  if (data.production) realTimeData.production = data.production;
  console.log('✅ 实时数据已更新:', {
    inventory: realTimeData.inventory.length,
    inspection: realTimeData.inspection.length,
    production: realTimeData.production.length
  });
}

/**
 * 处理优化后的问答规则
 */
export function processOptimizedRule(query, intent) {
  console.log('🎯 处理优化规则:', { query, intent });

  try {
    switch (intent) {
      // 质量分析规则（优先级最高）
      case 'quality_analysis':
        return handleQualityAnalysis(query);
      case 'supplier_quality_assessment':
        return handleSupplierQualityAssessment(query);
      case 'risk_analysis':
        return handleRiskAnalysis(query);
      case 'improvement_suggestions':
        return handleImprovementSuggestions(query);

      // 生产管理规则
      case 'production_status_query':
        return handleProductionStatusQuery(query);
      case 'defect_rate_analysis':
        return handleDefectRateAnalysis(query);
      case 'efficiency_analysis':
        return handleEfficiencyAnalysis(query);
      case 'online_tracking_query':
        return handleOnlineTrackingQuery(query);
      case 'exception_records_query':
        return handleExceptionRecordsQuery(query);

      // 库存查询规则
      case 'query_inventory_by_factory':
        return handleFactoryInventoryQuery(query);
      case 'query_inventory_by_supplier':
        return handleSupplierInventoryQuery(query);
      case 'query_inventory_by_status':
        return handleStatusInventoryQuery(query);
      case 'query_inventory_by_material':
        return handleMaterialInventoryQuery(query);
      case 'query_all_inventory':
        return handleAllInventoryQuery();
      case 'count_inventory_suppliers':
        return handleCountInventorySuppliers();

      // 测试记录查询规则
      case 'query_test_ng_records':
        return handleTestNGRecords();
      case 'query_test_records':
        return handleTestRecords(query);
      case 'query_material_test_records':
        return handleMaterialTestRecords(query);
      case 'query_supplier_test_records':
        return handleSupplierTestRecords(query);

      // 生产查询规则
      case 'query_production_by_factory':
        return handleProductionByFactory(query);
      case 'query_production_by_material':
        return handleProductionByMaterial(query);
      case 'query_production_by_supplier':
        return handleProductionBySupplier(query);
      case 'query_production_by_project':
        return handleProductionByProject(query);

      // 综合查询规则
      case 'count_material_types':
        return handleCountMaterialTypes();
      case 'count_material_batches':
        return handleCountMaterialBatches();
      case 'count_projects':
        return handleCountProjects();
      case 'count_baselines':
        return handleCountBaselines();
      case 'count_suppliers':
        return handleCountSuppliers();

      // 高级分析规则
      case 'analyze_material_comprehensive':
        return handleMaterialComprehensiveAnalysis(query);
      case 'analyze_supplier_comprehensive':
        return handleSupplierComprehensiveAnalysis(query);
      case 'compare_material_batches':
        return handleCompareMaterialBatches(query);
      case 'compare_supplier_performance':
        return handleCompareSupplierPerformance(query);

      // 风险分析规则
      case 'analyze_inventory_risks':
        return handleInventoryRiskAnalysis();
      case 'analyze_quality_risks':
        return handleQualityRiskAnalysis();
      case 'analyze_production_risks':
        return handleProductionRiskAnalysis();

      default:
        return generateFallbackResponse(query);
    }
  } catch (error) {
    console.error('❌ 规则处理错误:', error);
    return `处理查询时出现错误: ${error.message}`;
  }
}

// ========== 库存查询处理器 ==========

function handleFactoryInventoryQuery(query) {
  const factoryName = extractFactoryName(query);
  const results = realTimeData.inventory.filter(item =>
    item.factory && item.factory.includes(factoryName)
  );

  if (results.length === 0) {
    return EnhancedResponseFormatter.formatInventoryQuery([], {
      title: `${factoryName}库存查询`,
      queryType: 'factory',
      factoryName: factoryName
    });
  }

  return EnhancedResponseFormatter.formatInventoryQuery(results, {
    title: `${factoryName}库存查询结果`,
    queryType: 'factory',
    factoryName: factoryName
  });
}

function handleSupplierInventoryQuery(query) {
  const supplierName = extractSupplierName(query);
  const results = realTimeData.inventory.filter(item =>
    item.supplier && item.supplier.includes(supplierName)
  );

  return EnhancedResponseFormatter.formatInventoryQuery(results, {
    title: `${supplierName}供应商库存查询结果`,
    queryType: 'supplier',
    supplierName: supplierName
  });
}

function handleStatusInventoryQuery(query) {
  const results = realTimeData.inventory.filter(item =>
    item.status && (item.status === '风险' || item.status.includes('风险'))
  );

  return EnhancedResponseFormatter.formatInventoryQuery(results, {
    title: '风险库存查询结果',
    queryType: 'status',
    statusFilter: '风险'
  });
}

function handleMaterialInventoryQuery(query) {
  const materialName = extractMaterialName(query);
  const results = realTimeData.inventory.filter(item =>
    item.materialName && item.materialName.includes(materialName)
  );

  return EnhancedResponseFormatter.formatInventoryQuery(results, {
    title: `${materialName}库存查询结果`,
    queryType: 'material',
    materialName: materialName
  });
}

function handleAllInventoryQuery() {
  const results = realTimeData.inventory;

  return EnhancedResponseFormatter.formatInventoryQuery(results, {
    title: '所有库存记录',
    queryType: 'all'
  });
}

function handleCountInventorySuppliers() {
  const suppliers = new Set();
  realTimeData.inventory.forEach(item => {
    if (item.supplier) {
      suppliers.add(item.supplier);
    }
  });

  return `📊 库存物料涉及 **${suppliers.size}** 家供应商：\n\n${Array.from(suppliers).map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
}

// ========== 测试记录查询处理器 ==========

function handleTestNGRecords() {
  const results = realTimeData.inspection.filter(item =>
    item.testResult === 'FAIL' || item.testResult === 'NG' || item.testResult === '不合格'
  );

  return EnhancedResponseFormatter.formatQualityAnalysis(results, {
    title: '测试NG记录查询结果',
    queryType: 'ng_records'
  });
}

function handleMaterialTestRecords(query) {
  const materialName = extractMaterialName(query);
  const results = realTimeData.inspection.filter(item => 
    item.materialName && item.materialName.includes(materialName)
  );
  
  if (results.length === 0) {
    return `未找到${materialName}的测试记录。`;
  }

  return ResponseFormatterService.formatInspectionResults(results, `${materialName}测试记录查询结果`);
}

function handleSupplierTestRecords(query) {
  const supplierName = extractSupplierName(query);
  const results = realTimeData.inspection.filter(item => 
    item.supplier && item.supplier.includes(supplierName)
  );
  
  if (results.length === 0) {
    return `未找到${supplierName}供应商的测试记录。`;
  }

  return ResponseFormatterService.formatInspectionResults(results, `${supplierName}供应商测试记录查询结果`);
}

// ========== 生产查询处理器 ==========

function handleProductionByFactory(query) {
  const factoryName = extractFactoryName(query);
  const results = realTimeData.production.filter(item => 
    item.factory && item.factory.includes(factoryName)
  );
  
  if (results.length === 0) {
    return `未找到${factoryName}的生产记录。`;
  }

  return ResponseFormatterService.formatProductionResults(results, `${factoryName}生产记录查询结果`);
}

function handleProductionByMaterial(query) {
  const materialName = extractMaterialName(query);
  const results = realTimeData.production.filter(item => 
    item.materialName && item.materialName.includes(materialName)
  );
  
  if (results.length === 0) {
    return `未找到${materialName}的生产记录。`;
  }

  return ResponseFormatterService.formatProductionResults(results, `${materialName}生产记录查询结果`);
}

function handleProductionBySupplier(query) {
  const supplierName = extractSupplierName(query);
  const results = realTimeData.production.filter(item => 
    item.supplier && item.supplier.includes(supplierName)
  );
  
  if (results.length === 0) {
    return `未找到${supplierName}供应商的生产记录。`;
  }

  return ResponseFormatterService.formatProductionResults(results, `${supplierName}供应商生产记录查询结果`);
}

function handleProductionByProject(query) {
  const projectName = extractProjectName(query);
  const results = realTimeData.production.filter(item => 
    item.project && item.project.includes(projectName)
  );
  
  if (results.length === 0) {
    return `未找到${projectName}项目的生产记录。`;
  }

  return ResponseFormatterService.formatProductionResults(results, `${projectName}项目生产记录查询结果`);
}

// ========== 综合查询处理器 ==========

function handleCountMaterialTypes() {
  const materials = new Set();
  realTimeData.inventory.forEach(item => {
    if (item.materialName) materials.add(item.materialName);
  });
  realTimeData.inspection.forEach(item => {
    if (item.materialName) materials.add(item.materialName);
  });
  realTimeData.production.forEach(item => {
    if (item.materialName) materials.add(item.materialName);
  });

  return `📊 系统中共有 **${materials.size}** 种物料：\n\n${Array.from(materials).map((m, i) => `${i + 1}. ${m}`).join('\n')}`;
}

function handleCountMaterialBatches() {
  const batches = new Set();
  realTimeData.inventory.forEach(item => {
    if (item.batchCode) batches.add(item.batchCode);
  });

  return `📊 物料共有 **${batches.size}** 个批次：\n\n${Array.from(batches).slice(0, 10).map((b, i) => `${i + 1}. ${b}`).join('\n')}${batches.size > 10 ? '\n...(显示前10个)' : ''}`;
}

function handleCountProjects() {
  const projects = new Set();
  realTimeData.production.forEach(item => {
    if (item.project) projects.add(item.project);
  });
  realTimeData.inspection.forEach(item => {
    if (item.project) projects.add(item.project);
  });

  return `📊 系统中共有 **${projects.size}** 个项目：\n\n${Array.from(projects).map((p, i) => `${i + 1}. ${p}`).join('\n')}`;
}

function handleCountBaselines() {
  const baselines = new Set();
  realTimeData.production.forEach(item => {
    if (item.baseline) baselines.add(item.baseline);
  });
  realTimeData.inspection.forEach(item => {
    if (item.baseline) baselines.add(item.baseline);
  });

  return `📊 系统中共有 **${baselines.size}** 个基线：\n\n${Array.from(baselines).map((b, i) => `${i + 1}. ${b}`).join('\n')}`;
}

function handleCountSuppliers() {
  const suppliers = new Set();
  realTimeData.inventory.forEach(item => {
    if (item.supplier) suppliers.add(item.supplier);
  });
  realTimeData.inspection.forEach(item => {
    if (item.supplier) suppliers.add(item.supplier);
  });
  realTimeData.production.forEach(item => {
    if (item.supplier) suppliers.add(item.supplier);
  });

  return `📊 系统中共有 **${suppliers.size}** 家供应商：\n\n${Array.from(suppliers).map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
}

// ========== 辅助函数 ==========

function extractFactoryName(query) {
  const factories = ['深圳工厂', '重庆工厂', '南昌工厂', '宜宾工厂'];
  for (const factory of factories) {
    if (query.includes(factory)) return factory;
  }
  return '深圳工厂'; // 默认
}

function extractSupplierName(query) {
  const suppliers = ['BOE', '歌尔股份', '聚龙', '欣冠', '广正'];
  for (const supplier of suppliers) {
    if (query.includes(supplier)) return supplier;
  }
  return 'BOE'; // 默认
}

function extractMaterialName(query) {
  const materials = ['电池盖', '电池', '中框', '手机卡托', 'OLED显示屏', 'LCD显示屏'];
  for (const material of materials) {
    if (query.includes(material)) return material;
  }
  return '电池'; // 默认
}

function extractProjectName(query) {
  const projects = ['S662LN', 'S663LN', 'S664LN', 'X6827', 'KI4K'];
  for (const project of projects) {
    if (query.includes(project)) return project;
  }
  return 'S662LN'; // 默认
}

function generateFallbackResponse(query) {
  return `抱歉，我暂时无法理解您的问题："${query}"。请尝试使用更具体的查询，例如：
  
📦 库存查询：查询深圳工厂的库存、查询BOE供应商的物料
🧪 测试查询：查询测试NG记录、查询电池盖测试记录  
⚙️ 生产查询：查询深圳工厂的生产记录、查询S662LN项目记录
📊 统计查询：多少种物料？有几家供应商？`;
}

// 高级分析处理器 (简化版本)
function handleMaterialComprehensiveAnalysis(query) {
  return '🔍 物料综合分析功能正在开发中，敬请期待...';
}

function handleSupplierComprehensiveAnalysis(query) {
  return '🔍 供应商综合分析功能正在开发中，敬请期待...';
}

function handleCompareMaterialBatches(query) {
  return '🔍 物料批次对比功能正在开发中，敬请期待...';
}

function handleCompareSupplierPerformance(query) {
  return '🔍 供应商差异对比功能正在开发中，敬请期待...';
}

function handleInventoryRiskAnalysis() {
  return '🔍 库存风险分析功能正在开发中，敬请期待...';
}

function handleQualityRiskAnalysis() {
  return '🔍 质量风险分析功能正在开发中，敬请期待...';
}

function handleProductionRiskAnalysis() {
  return '🔍 生产风险分析功能正在开发中，敬请期待...';
}

// 新增质量分析处理函数
function handleQualityAnalysis(query) {
  console.log('🔍 处理质量分析查询:', query);

  return EnhancedResponseFormatter.formatQualityAnalysis(realTimeData.inspection, {
    title: '质量分析报告',
    queryType: 'quality_analysis'
  });
}

function handleSupplierQualityAssessment(query) {
  console.log('🔍 处理供应商质量评估查询:', query);

  // 提取供应商名称
  const suppliers = ['聚龙', 'BOE', '欣冠', '广正', '天马', '华星'];
  let targetSupplier = null;

  for (const supplier of suppliers) {
    if (query.includes(supplier)) {
      targetSupplier = supplier;
      break;
    }
  }

  if (targetSupplier) {
    const supplierTests = realTimeData.inspection.filter(item =>
      item.supplier_name && item.supplier_name.includes(targetSupplier)
    );

    if (supplierTests.length === 0) {
      return `❌ 未找到供应商"${targetSupplier}"的测试记录`;
    }

    const passed = supplierTests.filter(item => item.test_result === 'PASS' || item.test_result === '合格').length;
    const rate = ((passed / supplierTests.length) * 100).toFixed(2);

    return `📊 **${targetSupplier}供应商质量评估**\n\n` +
           `• 总测试记录：${supplierTests.length} 条\n` +
           `• 合格记录：${passed} 条\n` +
           `• 合格率：${rate}%\n` +
           `• 质量等级：${rate >= 95 ? '优秀' : rate >= 85 ? '良好' : rate >= 70 ? '一般' : '需改进'}`;
  }

  return handleQualityAnalysis(query);
}

function handleRiskAnalysis(query) {
  console.log('🔍 处理风险分析查询:', query);

  const riskItems = realTimeData.inventory.filter(item =>
    item.status === '风险' || item.status === 'RISK' ||
    (item.quality_status && item.quality_status.includes('风险'))
  );

  const failedTests = realTimeData.inspection.filter(item =>
    item.test_result === 'FAIL' || item.test_result === '不合格'
  );

  let riskReport = `⚠️ **风险分析报告**\n\n`;
  riskReport += `🚨 **库存风险**\n`;
  riskReport += `• 风险状态物料：${riskItems.length} 批次\n`;

  if (riskItems.length > 0) {
    riskReport += `• 主要风险物料：\n`;
    riskItems.slice(0, 5).forEach(item => {
      riskReport += `  - ${item.material_name || item.material_code} (${item.batch_number})\n`;
    });
  }

  riskReport += `\n🧪 **测试风险**\n`;
  riskReport += `• 不合格测试：${failedTests.length} 条\n`;

  if (failedTests.length > 0) {
    const riskSuppliers = [...new Set(failedTests.map(item => item.supplier_name).filter(Boolean))];
    riskReport += `• 涉及供应商：${riskSuppliers.join(', ')}\n`;
  }

  return riskReport;
}

function handleImprovementSuggestions(query) {
  console.log('🔍 处理改进建议查询:', query);

  const totalTests = realTimeData.inspection.length;
  const failedTests = realTimeData.inspection.filter(item =>
    item.test_result === 'FAIL' || item.test_result === '不合格'
  ).length;

  const failRate = totalTests > 0 ? (failedTests / totalTests * 100).toFixed(2) : 0;

  let suggestions = `💡 **质量改进建议**\n\n`;

  if (failRate > 10) {
    suggestions += `🔴 **紧急改进建议**\n`;
    suggestions += `• 当前不合格率：${failRate}%，超过10%警戒线\n`;
    suggestions += `• 建议立即启动质量改进计划\n`;
    suggestions += `• 加强供应商质量管控\n\n`;
  } else if (failRate > 5) {
    suggestions += `🟡 **一般改进建议**\n`;
    suggestions += `• 当前不合格率：${failRate}%，需要关注\n`;
    suggestions += `• 建议优化检测流程\n\n`;
  } else {
    suggestions += `🟢 **质量状况良好**\n`;
    suggestions += `• 当前不合格率：${failRate}%，保持现有水平\n\n`;
  }

  suggestions += `📋 **具体改进措施**\n`;
  suggestions += `1. 建立供应商质量评级体系\n`;
  suggestions += `2. 加强进料检验标准\n`;
  suggestions += `3. 实施质量追溯机制\n`;
  suggestions += `4. 定期质量培训和技能提升\n`;
  suggestions += `5. 建立质量预警系统`;

  return suggestions;
}

// 新增生产管理处理函数
function handleProductionStatusQuery(query) {
  console.log('🔍 处理生产状态查询:', query);

  const totalProduction = realTimeData.production.length;
  const onlineRecords = realTimeData.production.filter(item =>
    item.status === '在线' || item.status === 'ONLINE'
  ).length;

  const offlineRecords = totalProduction - onlineRecords;

  let statusReport = `⚙️ **生产状态报告**\n\n`;
  statusReport += `📊 **总体生产状况**\n`;
  statusReport += `• 总生产记录：${totalProduction} 条\n`;
  statusReport += `• 在线记录：${onlineRecords} 条\n`;
  statusReport += `• 离线记录：${offlineRecords} 条\n`;
  statusReport += `• 在线率：${totalProduction > 0 ? ((onlineRecords / totalProduction) * 100).toFixed(2) : 0}%\n\n`;

  // 按工厂统计
  const factoryStats = {};
  realTimeData.production.forEach(item => {
    const factory = item.factory || '未知工厂';
    if (!factoryStats[factory]) {
      factoryStats[factory] = { total: 0, online: 0 };
    }
    factoryStats[factory].total++;
    if (item.status === '在线' || item.status === 'ONLINE') {
      factoryStats[factory].online++;
    }
  });

  if (Object.keys(factoryStats).length > 0) {
    statusReport += `🏭 **各工厂生产状况**\n`;
    Object.entries(factoryStats).forEach(([factory, data]) => {
      const rate = ((data.online / data.total) * 100).toFixed(2);
      statusReport += `• ${factory}：${data.online}/${data.total} (${rate}%)\n`;
    });
  }

  return statusReport;
}

function handleDefectRateAnalysis(query) {
  console.log('🔍 处理不良率分析查询:', query);

  const totalTests = realTimeData.inspection.length;
  const defectTests = realTimeData.inspection.filter(item =>
    item.test_result === 'FAIL' || item.test_result === '不合格'
  ).length;

  const defectRate = totalTests > 0 ? ((defectTests / totalTests) * 100).toFixed(2) : 0;

  // 按物料统计不良率
  const materialDefects = {};
  realTimeData.inspection.forEach(item => {
    const material = item.material_name || item.material_code || '未知物料';
    if (!materialDefects[material]) {
      materialDefects[material] = { total: 0, defects: 0 };
    }
    materialDefects[material].total++;
    if (item.test_result === 'FAIL' || item.test_result === '不合格') {
      materialDefects[material].defects++;
    }
  });

  let defectReport = `📉 **不良率分析报告**\n\n`;
  defectReport += `🎯 **整体不良率**\n`;
  defectReport += `• 总测试数：${totalTests} 条\n`;
  defectReport += `• 不良数：${defectTests} 条\n`;
  defectReport += `• 不良率：${defectRate}%\n`;
  defectReport += `• 质量等级：${defectRate < 1 ? '优秀' : defectRate < 3 ? '良好' : defectRate < 5 ? '一般' : '需改进'}\n\n`;

  if (Object.keys(materialDefects).length > 0) {
    defectReport += `📦 **各物料不良率**\n`;
    const sortedMaterials = Object.entries(materialDefects)
      .sort(([,a], [,b]) => (b.defects/b.total) - (a.defects/a.total))
      .slice(0, 10);

    sortedMaterials.forEach(([material, data]) => {
      const rate = ((data.defects / data.total) * 100).toFixed(2);
      defectReport += `• ${material}：${rate}% (${data.defects}/${data.total})\n`;
    });
  }

  return defectReport;
}

function handleEfficiencyAnalysis(query) {
  console.log('🔍 处理效率分析查询:', query);

  const productionData = realTimeData.production;
  const inventoryData = realTimeData.inventory;

  let efficiencyReport = `📈 **效率分析报告**\n\n`;

  // 生产效率分析
  if (productionData.length > 0) {
    const onlineRate = (productionData.filter(item =>
      item.status === '在线' || item.status === 'ONLINE'
    ).length / productionData.length * 100).toFixed(2);

    efficiencyReport += `⚙️ **生产效率**\n`;
    efficiencyReport += `• 生产在线率：${onlineRate}%\n`;
    efficiencyReport += `• 生产记录数：${productionData.length} 条\n\n`;
  }

  // 库存周转效率
  if (inventoryData.length > 0) {
    const normalStatus = inventoryData.filter(item =>
      item.status === '正常' || item.status === 'NORMAL'
    ).length;
    const turnoverRate = ((normalStatus / inventoryData.length) * 100).toFixed(2);

    efficiencyReport += `📦 **库存效率**\n`;
    efficiencyReport += `• 正常库存率：${turnoverRate}%\n`;
    efficiencyReport += `• 库存批次数：${inventoryData.length} 个\n\n`;
  }

  efficiencyReport += `💡 **效率提升建议**\n`;
  efficiencyReport += `1. 优化生产排程，提高设备利用率\n`;
  efficiencyReport += `2. 加强库存管理，减少呆滞物料\n`;
  efficiencyReport += `3. 实施精益生产，消除浪费\n`;
  efficiencyReport += `4. 建立效率监控体系`;

  return efficiencyReport;
}

function handleOnlineTrackingQuery(query) {
  console.log('🔍 处理在线跟踪查询:', query);

  const onlineRecords = realTimeData.production.filter(item =>
    item.status === '在线' || item.status === 'ONLINE'
  );

  let trackingReport = `🔍 **在线跟踪报告**\n\n`;
  trackingReport += `📊 **在线状态概览**\n`;
  trackingReport += `• 在线记录数：${onlineRecords.length} 条\n`;
  trackingReport += `• 总生产记录：${realTimeData.production.length} 条\n`;
  trackingReport += `• 在线率：${realTimeData.production.length > 0 ? ((onlineRecords.length / realTimeData.production.length) * 100).toFixed(2) : 0}%\n\n`;

  if (onlineRecords.length > 0) {
    trackingReport += `📋 **最新在线记录**\n`;
    onlineRecords.slice(0, 10).forEach((record, index) => {
      trackingReport += `${index + 1}. ${record.material_name || record.material_code} - ${record.batch_number || '未知批次'}\n`;
      trackingReport += `   工厂：${record.factory || '未知'} | 项目：${record.project_code || '未知'}\n`;
    });
  }

  return trackingReport;
}

function handleExceptionRecordsQuery(query) {
  console.log('🔍 处理异常记录查询:', query);

  const exceptionRecords = [
    ...realTimeData.inventory.filter(item => item.status === '风险' || item.status === 'RISK'),
    ...realTimeData.inspection.filter(item => item.test_result === 'FAIL' || item.test_result === '不合格'),
    ...realTimeData.production.filter(item => item.status === '异常' || item.status === 'EXCEPTION')
  ];

  let exceptionReport = `⚠️ **异常记录报告**\n\n`;
  exceptionReport += `🚨 **异常统计**\n`;
  exceptionReport += `• 库存异常：${realTimeData.inventory.filter(item => item.status === '风险' || item.status === 'RISK').length} 条\n`;
  exceptionReport += `• 测试异常：${realTimeData.inspection.filter(item => item.test_result === 'FAIL' || item.test_result === '不合格').length} 条\n`;
  exceptionReport += `• 生产异常：${realTimeData.production.filter(item => item.status === '异常' || item.status === 'EXCEPTION').length} 条\n`;
  exceptionReport += `• 总异常数：${exceptionRecords.length} 条\n\n`;

  if (exceptionRecords.length > 0) {
    exceptionReport += `📋 **异常详情（前10条）**\n`;
    exceptionRecords.slice(0, 10).forEach((record, index) => {
      exceptionReport += `${index + 1}. ${record.material_name || record.material_code || '未知物料'}\n`;
      exceptionReport += `   状态：${record.status || record.test_result} | 批次：${record.batch_number || '未知'}\n`;
    });
  }

  return exceptionReport;
}

// 添加通用测试记录查询函数
function handleTestRecords(query) {
  console.log('🔍 处理测试记录查询:', query);

  const testRecords = realTimeData.inspection;
  const passedTests = testRecords.filter(item => item.test_result === 'PASS' || item.test_result === '合格');
  const failedTests = testRecords.filter(item => item.test_result === 'FAIL' || item.test_result === '不合格');

  let testReport = `🧪 **测试记录报告**\n\n`;
  testReport += `📊 **测试统计**\n`;
  testReport += `• 总测试记录：${testRecords.length} 条\n`;
  testReport += `• 合格记录：${passedTests.length} 条\n`;
  testReport += `• 不合格记录：${failedTests.length} 条\n`;
  testReport += `• 合格率：${testRecords.length > 0 ? ((passedTests.length / testRecords.length) * 100).toFixed(2) : 0}%\n\n`;

  if (testRecords.length > 0) {
    testReport += `📋 **最新测试记录**\n`;
    testRecords.slice(0, 10).forEach((record, index) => {
      testReport += `${index + 1}. ${record.material_name || record.material_code} - ${record.test_result}\n`;
      testReport += `   供应商：${record.supplier_name || '未知'} | 批次：${record.batch_number || '未知'}\n`;
    });
  }

  return testReport;
}

export default {
  updateRealTimeData,
  processOptimizedRule
};
