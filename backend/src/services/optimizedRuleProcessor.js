/**
 * 优化的规则处理器 V2.0
 * 基于用户实际需求和数据结构设计
 */

import ResponseFormatterService from './ResponseFormatterService.js';

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
    return `未找到${factoryName}的库存记录。`;
  }

  return ResponseFormatterService.formatInventoryResults(results, `${factoryName}库存查询结果`);
}

function handleSupplierInventoryQuery(query) {
  const supplierName = extractSupplierName(query);
  const results = realTimeData.inventory.filter(item => 
    item.supplier && item.supplier.includes(supplierName)
  );
  
  if (results.length === 0) {
    return `未找到${supplierName}供应商的库存记录。`;
  }

  return ResponseFormatterService.formatInventoryResults(results, `${supplierName}供应商库存查询结果`);
}

function handleStatusInventoryQuery(query) {
  const results = realTimeData.inventory.filter(item => 
    item.status && (item.status === '风险' || item.status.includes('风险'))
  );
  
  if (results.length === 0) {
    return '未找到风险状态的库存记录。';
  }

  return ResponseFormatterService.formatInventoryResults(results, '风险库存查询结果');
}

function handleMaterialInventoryQuery(query) {
  const materialName = extractMaterialName(query);
  const results = realTimeData.inventory.filter(item => 
    item.materialName && item.materialName.includes(materialName)
  );
  
  if (results.length === 0) {
    return `未找到${materialName}的库存记录。`;
  }

  return ResponseFormatterService.formatInventoryResults(results, `${materialName}库存查询结果`);
}

function handleAllInventoryQuery() {
  const results = realTimeData.inventory;
  
  if (results.length === 0) {
    return '暂无库存记录。';
  }

  return ResponseFormatterService.formatInventoryResults(results, '所有库存记录');
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
  
  if (results.length === 0) {
    return '未找到测试NG记录。';
  }

  return ResponseFormatterService.formatInspectionResults(results, '测试NG记录查询结果');
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

export default {
  updateRealTimeData,
  processOptimizedRule
};
