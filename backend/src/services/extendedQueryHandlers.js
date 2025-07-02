/**
 * 扩展的查询处理函数
 * 支持基于真实数据字段的全面查询功能
 */

import ResponseFormatterService from './ResponseFormatterService.js';

/**
 * 处理正常库存查询
 */
export function handleNormalInventoryQuery(queryText, parameters = {}, inMemoryData) {
  console.log('✅ 处理正常库存查询', parameters);
  let results = inMemoryData.inventory.filter(item => item.status === '正常');
  
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
    return '✅ 当前没有符合条件的正常状态库存物料。';
  }
  
  return formatInventoryResults(results, '正常库存');
}

/**
 * 处理合格测试查询
 */
export function handlePassedTestsQuery(queryText, parameters = {}, inMemoryData) {
  console.log('✅ 处理合格测试查询', parameters);
  let results = inMemoryData.inspection.filter(item => item.testResult === 'PASS');
  
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
 * 处理低不良率查询
 */
export function handleLowDefectRateQuery(queryText, parameters = {}, inMemoryData) {
  console.log('📉 处理低不良率查询', parameters);
  const threshold = parameters.defectRateThreshold || 2.0;
  let results = inMemoryData.production.filter(item => parseFloat(item.defectRate) <= threshold);
  
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
 * 处理供应商工厂库存组合查询
 */
export function handleSupplierFactoryInventoryQuery(queryText, parameters = {}, inMemoryData) {
  console.log('🏢🏭 处理供应商工厂库存组合查询', parameters);
  let results = inMemoryData.inventory;
  
  if (parameters.supplier) {
    results = results.filter(item => item.supplier && item.supplier.includes(parameters.supplier));
  }
  
  if (parameters.factory) {
    results = results.filter(item => item.factory && item.factory.includes(parameters.factory));
  }
  
  if (results.length === 0) {
    return `没有找到符合条件的库存记录。`;
  }
  
  return formatInventoryResults(results);
}

/**
 * 处理物料测试生产综合查询
 */
export function handleMaterialTestProductionQuery(queryText, parameters = {}, inMemoryData) {
  console.log('📦🧪🏭 处理物料测试生产综合查询', parameters);
  
  if (!parameters.materialName) {
    return '请指定要查询的物料名称。';
  }
  
  const materialName = parameters.materialName;
  
  // 查询库存
  const inventory = inMemoryData.inventory.filter(item => 
    item.materialName && item.materialName.includes(materialName)
  );
  
  // 查询测试
  const inspection = inMemoryData.inspection.filter(item => 
    item.materialName && item.materialName.includes(materialName)
  );
  
  // 查询生产
  const production = inMemoryData.production.filter(item => 
    item.materialName && item.materialName.includes(materialName)
  );
  
  let output = `📋 物料 "${materialName}" 的综合情况：\n\n`;
  
  output += `📦 库存情况 (${inventory.length} 条记录):\n`;
  if (inventory.length > 0) {
    inventory.forEach((item, index) => {
      output += `  ${index + 1}. 数量: ${item.quantity}, 状态: ${item.status}, 工厂: ${item.factory}\n`;
    });
  } else {
    output += `  暂无库存记录\n`;
  }
  
  output += `\n🧪 测试情况 (${inspection.length} 条记录):\n`;
  if (inspection.length > 0) {
    inspection.forEach((item, index) => {
      output += `  ${index + 1}. 结果: ${item.testResult}, 日期: ${item.testDate}, 供应商: ${item.supplier}\n`;
    });
  } else {
    output += `  暂无测试记录\n`;
  }
  
  output += `\n🏭 生产情况 (${production.length} 条记录):\n`;
  if (production.length > 0) {
    production.forEach((item, index) => {
      output += `  ${index + 1}. 不良率: ${item.defectRate}%, 工厂: ${item.factory}, 产线: ${item.line}\n`;
    });
  } else {
    output += `  暂无生产记录\n`;
  }
  
  return output;
}

/**
 * 处理批次全链路追溯查询
 */
export function handleBatchFullTraceQuery(queryText, parameters = {}, inMemoryData) {
  console.log('🔍 处理批次全链路追溯查询', parameters);

  if (!parameters.batchNo) {
    return ResponseFormatterService.formatError('请指定要追溯的批次号。');
  }

  const batchNo = parameters.batchNo;

  // 查询库存
  const inventory = inMemoryData.inventory.filter(item =>
    item.batchNo && item.batchNo.includes(batchNo)
  );

  // 查询测试
  const inspection = inMemoryData.inspection.filter(item =>
    item.batchNo && item.batchNo.includes(batchNo)
  );

  // 查询生产
  const production = inMemoryData.production.filter(item =>
    item.batchNo && item.batchNo.includes(batchNo)
  );

  if (inventory.length === 0 && inspection.length === 0 && production.length === 0) {
    return ResponseFormatterService.formatError(`没有找到批次 "${batchNo}" 的相关记录。`);
  }

  // 构建追溯数据
  const traceData = {
    batchNo: batchNo,
    inventory: inventory,
    inspection: inspection,
    production: production
  };

  return ResponseFormatterService.formatBatchTrace(traceData);
}

/**
 * 生成项目汇总统计
 */
export function generateProjectSummary(inMemoryData) {
  console.log('📋 生成项目汇总统计');
  
  const projectStats = {};
  
  // 统计检验数据中的项目
  inMemoryData.inspection.forEach(item => {
    if (item.projectId) {
      const projectId = item.projectId;
      if (!projectStats[projectId]) {
        projectStats[projectId] = { testRecords: 0, failedTests: 0, productionRecords: 0 };
      }
      projectStats[projectId].testRecords++;
      if (item.testResult === 'FAIL') {
        projectStats[projectId].failedTests++;
      }
    }
  });
  
  // 统计生产数据中的项目
  inMemoryData.production.forEach(item => {
    if (item.projectId) {
      const projectId = item.projectId;
      if (!projectStats[projectId]) {
        projectStats[projectId] = { testRecords: 0, failedTests: 0, productionRecords: 0 };
      }
      projectStats[projectId].productionRecords++;
    }
  });
  
  let output = '📋 项目数据汇总：\n\n';
  Object.entries(projectStats).forEach(([projectId, stats]) => {
    const failRate = stats.testRecords > 0 ? ((stats.failedTests / stats.testRecords) * 100).toFixed(1) : 0;
    output += `📋 项目 ${projectId}:\n`;
    output += `   🧪 测试记录: ${stats.testRecords} 条\n`;
    output += `   ❌ 不合格测试: ${stats.failedTests} 条 (${failRate}%)\n`;
    output += `   🏭 生产记录: ${stats.productionRecords} 条\n\n`;
  });
  
  return output;
}

/**
 * 生成物料类别汇总统计
 */
export function generateMaterialTypeSummary(inMemoryData) {
  console.log('🏷️ 生成物料类别汇总统计');
  
  const typeStats = {};
  
  // 统计库存中的物料类别
  inMemoryData.inventory.forEach(item => {
    if (item.materialType) {
      const materialType = item.materialType;
      if (!typeStats[materialType]) {
        typeStats[materialType] = { totalQuantity: 0, itemCount: 0, riskItems: 0 };
      }
      typeStats[materialType].totalQuantity += item.quantity || 0;
      typeStats[materialType].itemCount++;
      if (item.status === '风险') {
        typeStats[materialType].riskItems++;
      }
    }
  });
  
  let output = '🏷️ 物料类别数据汇总：\n\n';
  Object.entries(typeStats).forEach(([materialType, stats]) => {
    output += `🏷️ ${materialType}:\n`;
    output += `   📦 物料种类: ${stats.itemCount} 种\n`;
    output += `   📊 总库存量: ${stats.totalQuantity}\n`;
    output += `   🚨 风险物料: ${stats.riskItems} 种\n\n`;
  });
  
  return output;
}

// 格式化函数（从主文件复制过来）
function formatInventoryResults(results, title = '库存') {
  if (results.length === 0) {
    return `没有找到符合条件的${title}记录。`;
  }
  
  let output = `📦 找到 ${results.length} 条${title}记录：\n\n`;
  
  results.forEach((item, index) => {
    output += `${index + 1}. ${item.materialName || '未知物料'}\n`;
    output += `   📋 物料编码: ${item.materialCode || '未知'}\n`;
    output += `   🏷️ 物料类别: ${item.materialType || '未知'}\n`;
    output += `   🔢 批次号: ${item.batchNo || '未知'}\n`;
    output += `   🏢 供应商: ${item.supplier || '未知'}\n`;
    output += `   📊 数量: ${item.quantity || 0}\n`;
    output += `   ⚡ 状态: ${item.status || '未知'}\n`;
    output += `   🏭 工厂: ${item.factory || '未知'}\n`;
    output += `   📍 仓库: ${item.warehouse || '未知'}\n`;
    if (item.notes && item.notes !== '-') {
      output += `   📝 备注: ${item.notes}\n`;
    }
    output += '\n';
  });
  
  return output;
}

function formatInspectionResults(results) {
  if (results.length === 0) {
    return '没有找到符合条件的检验记录。';
  }
  
  let output = `🧪 找到 ${results.length} 条检验记录：\n\n`;
  
  results.forEach((item, index) => {
    output += `${index + 1}. ${item.materialName || '未知物料'}\n`;
    output += `   🔢 批次号: ${item.batchNo || '未知'}\n`;
    output += `   🏢 供应商: ${item.supplier || '未知'}\n`;
    output += `   📅 测试日期: ${item.testDate || '未知'}\n`;
    output += `   ✅ 测试结果: ${item.testResult || '未知'}\n`;
    if (item.defectDescription) {
      output += `   ⚠️ 不良描述: ${item.defectDescription}\n`;
    }
    if (item.projectId) {
      output += `   📋 项目ID: ${item.projectId}\n`;
    }
    output += '\n';
  });
  
  return output;
}

function formatProductionResults(results) {
  if (results.length === 0) {
    return ResponseFormatterService.formatError('没有找到符合条件的生产记录。');
  }

  return ResponseFormatterService.formatProductionResults(results);
}
