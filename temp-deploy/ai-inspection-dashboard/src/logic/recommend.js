// recommend.js
// AI推荐逻辑 - 基于COT (Chain of Thought)推理链

/**
 * 基于工厂、实验室和上线数据推荐检验策略
 * @param {Object} params 包含工厂、实验室和上线数据
 * @returns {Object} 推荐策略信息，包含推荐文本、风险评分、推理链等
 */
export function recommendInspectionStrategy({ factoryData, labData, onlineData, supplierHistory = null, relatedBatches = [] }) {
  // 构建完整返回对象
  const result = {
    recommendation: '',
    riskScore: 0,
    riskLevel: 'low',
    riskFactors: [],
    reasoningChain: [], // COT推理链
    categoryStrategy: '',
    inspectionItems: [], // 关键检验项目
    alertLevel: 'normal', // 告警级别: normal, warning, critical
    riskBreakdown: {      // 细分风险评分
      factoryRisk: 0,     // 工厂/仓库风险
      labRisk: 0,         // 实验室测试风险
      onlineRisk: 0,      // 上线使用风险
      supplierRisk: 0,    // 供应商历史风险
      batchCorrelationRisk: 0,  // 批次关联性风险
      categoryRisk: 0     // 物料类别固有风险
    },
    dataSourceInfo: {     // 数据源信息
      timestamp: new Date().toISOString(),
      sources: ['factory', 'lab', 'online']
    }
  };
  
  // Step 1: 数据完整性验证 (COT第一步)
  if (!factoryData || !labData || !onlineData) {
    result.reasoningChain.push('数据不完整，无法进行全面分析');
    result.recommendation = '数据不足，建议执行标准检验流程';
    return result;
  }
  
  // 数据完整性记录
  result.reasoningChain.push(`开始分析物料 ${factoryData.material_code || '未知物料'} 的检验数据`);
  result.reasoningChain.push(`工厂数据: 缺陷率 ${factoryData.defect_rate}%, 批次 ${factoryData.batch_id}`);
  result.reasoningChain.push(`实验室数据: 评分 ${labData.score}, 测试结果 ${labData.result || '未知'}`);
  result.reasoningChain.push(`上线数据: 缺陷数 ${onlineData.defect_count}/${onlineData.total_count}`);
  
  if (supplierHistory) {
    result.reasoningChain.push(`供应商历史数据: 平均缺陷率 ${supplierHistory.avgDefectRate}%, 记录数量 ${supplierHistory.recordCount}`);
    result.dataSourceInfo.sources.push('supplier_history');
  }
  
  if (relatedBatches && relatedBatches.length > 0) {
    result.reasoningChain.push(`相关批次数量: ${relatedBatches.length}`);
    result.dataSourceInfo.sources.push('related_batches');
  }

  // Step 2: 风险因素评估 (COT第二步)
  // ==================== 工厂/仓库数据分析 ====================
  // 基础风险评分 (0-100)
  let factoryRiskScore = 0;
  
  if (factoryData.defect_rate > 1.5) {
    factoryRiskScore = 75 + Math.min(25, (factoryData.defect_rate - 1.5) * 10);
    result.riskFactors.push('工厂来料缺陷率严重超标');
    result.riskLevel = 'high';
    result.reasoningChain.push(`工厂缺陷率${factoryData.defect_rate}% > 1.5%，判定为高风险因素，风险评分: ${factoryRiskScore.toFixed(1)}`);
  } else if (factoryData.defect_rate > 1) {
    factoryRiskScore = 40 + ((factoryData.defect_rate - 1) * 70);
    result.riskFactors.push('工厂来料缺陷率高');
    result.riskLevel = result.riskLevel === 'high' ? 'high' : 'medium';
    result.reasoningChain.push(`工厂缺陷率${factoryData.defect_rate}% > 1%，判定为中风险因素，风险评分: ${factoryRiskScore.toFixed(1)}`);
  } else if (factoryData.defect_rate > 0.5) {
    factoryRiskScore = 20 + ((factoryData.defect_rate - 0.5) * 40);
    result.reasoningChain.push(`工厂缺陷率${factoryData.defect_rate}%略高于基准值，风险评分: ${factoryRiskScore.toFixed(1)}`);
  } else {
    factoryRiskScore = Math.max(5, factoryData.defect_rate * 40);
    result.reasoningChain.push(`工厂缺陷率${factoryData.defect_rate}%在可接受范围内，风险评分: ${factoryRiskScore.toFixed(1)}`);
  }
  
  result.riskBreakdown.factoryRisk = factoryRiskScore;
  
  // ==================== 实验室数据分析 ====================
  // 基础风险评分 (0-100)
  let labRiskScore = 0;
  
  if (labData.result === '不合格') {
    labRiskScore = 90; // 直接不合格是高风险
    result.riskFactors.push('实验室测试不合格');
    result.riskLevel = 'high';
    result.reasoningChain.push(`实验室测试结果不合格，判定为高风险因素，风险评分: ${labRiskScore.toFixed(1)}`);
  } else if (labData.score < 70) {
    labRiskScore = 75 + Math.min(15, (70 - labData.score) * 0.6);
    result.riskFactors.push('实验室测试评分低');
    result.riskLevel = 'high';
    result.reasoningChain.push(`实验室评分${labData.score} < 70，判定为高风险因素，风险评分: ${labRiskScore.toFixed(1)}`);
  } else if (labData.score < 80) {
    labRiskScore = 40 + ((80 - labData.score) * 3.5);
    result.riskFactors.push('实验室测试评分中等');
    result.riskLevel = result.riskLevel === 'high' ? 'high' : 'medium';
    result.reasoningChain.push(`实验室评分${labData.score} < 80，判定为中风险因素，风险评分: ${labRiskScore.toFixed(1)}`);
  } else if (labData.score < 90) {
    labRiskScore = 15 + ((90 - labData.score) * 2.5);
    result.reasoningChain.push(`实验室评分${labData.score}良好，风险评分: ${labRiskScore.toFixed(1)}`);
  } else {
    labRiskScore = Math.max(5, (100 - labData.score) * 1.5);
    result.reasoningChain.push(`实验室评分${labData.score}优秀，风险评分: ${labRiskScore.toFixed(1)}`);
  }
  
  result.riskBreakdown.labRisk = labRiskScore;

  // ==================== 上线使用数据分析 ====================
  // 基础风险评分 (0-100)
  let onlineRiskScore = 0;
  const onlineDefectRate = onlineData.defect_count / onlineData.total_count * 100;
  
  if (onlineDefectRate > 2) {
    onlineRiskScore = 75 + Math.min(25, (onlineDefectRate - 2) * 5);
    result.riskFactors.push('上线使用缺陷率高');
    result.riskLevel = 'high';
    result.reasoningChain.push(`上线缺陷率${onlineDefectRate.toFixed(2)}% > 2%，判定为高风险因素，风险评分: ${onlineRiskScore.toFixed(1)}`);
  } else if (onlineDefectRate > 1) {
    onlineRiskScore = 40 + ((onlineDefectRate - 1) * 35);
    result.riskFactors.push('上线使用缺陷率中等');
    result.riskLevel = result.riskLevel === 'high' ? 'high' : 'medium';
    result.reasoningChain.push(`上线缺陷率${onlineDefectRate.toFixed(2)}% > 1%，判定为中风险因素，风险评分: ${onlineRiskScore.toFixed(1)}`);
  } else if (onlineDefectRate > 0.5) {
    onlineRiskScore = 20 + ((onlineDefectRate - 0.5) * 40);
    result.reasoningChain.push(`上线缺陷率${onlineDefectRate.toFixed(2)}%略高于基准值，风险评分: ${onlineRiskScore.toFixed(1)}`);
  } else {
    onlineRiskScore = Math.max(5, onlineDefectRate * 40);
    result.reasoningChain.push(`上线缺陷率${onlineDefectRate.toFixed(2)}%在可接受范围内，风险评分: ${onlineRiskScore.toFixed(1)}`);
  }
  
  result.riskBreakdown.onlineRisk = onlineRiskScore;
  
  // ==================== 供应商历史表现分析 ====================
  let supplierRiskScore = 0;
  
  if (supplierHistory) {
    // 考虑供应商历史平均缺陷率
    if (supplierHistory.avgDefectRate > 1.5) {
      supplierRiskScore = 70 + Math.min(30, (supplierHistory.avgDefectRate - 1.5) * 10);
      result.riskFactors.push('供应商历史缺陷率高');
      result.reasoningChain.push(`供应商历史平均缺陷率${supplierHistory.avgDefectRate}% > 1.5%，判定为高风险，风险评分: ${supplierRiskScore.toFixed(1)}`);
    } else if (supplierHistory.avgDefectRate > 0.8) {
      supplierRiskScore = 30 + ((supplierHistory.avgDefectRate - 0.8) * 57);
      result.riskFactors.push('供应商历史缺陷率中等');
      result.reasoningChain.push(`供应商历史平均缺陷率${supplierHistory.avgDefectRate}% > 0.8%，判定为中风险，风险评分: ${supplierRiskScore.toFixed(1)}`);
    } else {
      supplierRiskScore = Math.max(5, supplierHistory.avgDefectRate * 37.5);
      result.reasoningChain.push(`供应商历史平均缺陷率${supplierHistory.avgDefectRate}%在可接受范围内，风险评分: ${supplierRiskScore.toFixed(1)}`);
    }
    
    // 考虑供应商历史记录数量 - 记录越少，置信度越低，风险越高
    if (supplierHistory.recordCount < 5) {
      const confidenceFactor = Math.max(0.2, supplierHistory.recordCount / 5);
      const confidenceRisk = (1 - confidenceFactor) * 30;
      supplierRiskScore = supplierRiskScore * confidenceFactor + confidenceRisk;
      result.reasoningChain.push(`供应商历史记录数量${supplierHistory.recordCount}较少，置信度低，调整风险评分至: ${supplierRiskScore.toFixed(1)}`);
    }
  } else {
    // 无供应商历史数据，默认中等风险
    supplierRiskScore = 35;
    result.reasoningChain.push(`无供应商历史数据，默认中等风险，风险评分: ${supplierRiskScore.toFixed(1)}`);
  }
  
  result.riskBreakdown.supplierRisk = supplierRiskScore;
  
  // ==================== 批次关联性分析 ====================
  let batchCorrelationRiskScore = 0;
  
  if (relatedBatches && relatedBatches.length > 0) {
    // 计算相关批次的平均缺陷率
    const batchDefectRates = relatedBatches.map(batch => batch.defect_rate || 0);
    const avgBatchDefectRate = batchDefectRates.reduce((sum, rate) => sum + rate, 0) / batchDefectRates.length;
    
    // 计算批次间的缺陷率方差（波动性）
    const variance = batchDefectRates.reduce((sum, rate) => sum + Math.pow(rate - avgBatchDefectRate, 2), 0) / batchDefectRates.length;
    const stdDeviation = Math.sqrt(variance);
    
    // 基于平均缺陷率的风险
    let avgRateRisk = 0;
    if (avgBatchDefectRate > 1.5) {
      avgRateRisk = 70;
      result.riskFactors.push('相关批次平均缺陷率高');
      result.reasoningChain.push(`相关批次平均缺陷率${avgBatchDefectRate.toFixed(2)}% > 1.5%，判定为高风险`);
    } else if (avgBatchDefectRate > 0.8) {
      avgRateRisk = 40;
      result.reasoningChain.push(`相关批次平均缺陷率${avgBatchDefectRate.toFixed(2)}% > 0.8%，判定为中风险`);
    } else {
      avgRateRisk = 15;
      result.reasoningChain.push(`相关批次平均缺陷率${avgBatchDefectRate.toFixed(2)}%在可接受范围内`);
    }
    
    // 基于缺陷率波动性的风险
    let variabilityRisk = 0;
    if (stdDeviation > 1.0) {
      variabilityRisk = 70;
      result.riskFactors.push('批次间缺陷率波动大');
      result.reasoningChain.push(`批次间缺陷率标准差${stdDeviation.toFixed(2)}% > 1.0%，波动性大，判定为高风险`);
    } else if (stdDeviation > 0.5) {
      variabilityRisk = 40;
      result.reasoningChain.push(`批次间缺陷率标准差${stdDeviation.toFixed(2)}% > 0.5%，波动性中等，判定为中风险`);
    } else {
      variabilityRisk = 15;
      result.reasoningChain.push(`批次间缺陷率标准差${stdDeviation.toFixed(2)}%，波动性小，风险较低`);
    }
    
    // 计算批次趋势风险 (是否在恶化)
    let trendRisk = 0;
    if (relatedBatches.length >= 3) {
      // 对批次按时间排序
      const sortedBatches = [...relatedBatches].sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // 计算最近3个批次的线性趋势
      const recentBatches = sortedBatches.slice(-3);
      const x = [0, 1, 2];
      const y = recentBatches.map(batch => batch.defect_rate || 0);
      
      // 简化的线性回归计算趋势斜率
      const n = 3;
      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
      const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      
      if (slope > 0.3) {
        trendRisk = 80;
        result.riskFactors.push('批次缺陷率呈明显上升趋势');
        result.reasoningChain.push(`批次缺陷率呈明显上升趋势(斜率=${slope.toFixed(2)})，判定为高风险`);
      } else if (slope > 0.1) {
        trendRisk = 50;
        result.riskFactors.push('批次缺陷率呈轻微上升趋势');
        result.reasoningChain.push(`批次缺陷率呈轻微上升趋势(斜率=${slope.toFixed(2)})，判定为中风险`);
      } else if (slope < -0.1) {
        trendRisk = 10;
        result.reasoningChain.push(`批次缺陷率呈下降趋势(斜率=${slope.toFixed(2)})，判定为低风险`);
      } else {
        trendRisk = 25;
        result.reasoningChain.push(`批次缺陷率趋势稳定(斜率=${slope.toFixed(2)})，判定为一般风险`);
      }
    }
    
    // 综合批次相关风险
    batchCorrelationRiskScore = avgRateRisk * 0.4 + variabilityRisk * 0.3 + (trendRisk || 0) * 0.3;
    result.reasoningChain.push(`批次关联性综合风险评分: ${batchCorrelationRiskScore.toFixed(1)}`);
  } else {
    result.reasoningChain.push(`无相关批次数据，批次关联性风险评分为0`);
  }
  
  result.riskBreakdown.batchCorrelationRisk = batchCorrelationRiskScore;
  
  // ==================== 物料类别固有风险分析 ====================
  let categoryRiskScore = 0;
  
  if (factoryData.category_id) {
    result.reasoningChain.push(`物料类别: ${factoryData.category_name || '类别'+factoryData.category_id}, 子类别: ${factoryData.subcategory || '未知'}`);
    
    // 根据物料类别设置基础风险分
    switch(factoryData.category_id) {
      case 3: // 电子器件
        categoryRiskScore = 45; // 电子器件固有风险较高
        result.reasoningChain.push(`电子器件类固有风险较高，基础风险评分: ${categoryRiskScore}`);
        break;
      case 4: // 晶片类
        categoryRiskScore = 40; // 晶片类固有风险较高
        result.reasoningChain.push(`晶片类固有风险较高，基础风险评分: ${categoryRiskScore}`);
        break;
      case 5: // CAM/FP/电声等
        categoryRiskScore = 35; // 中高风险
        result.reasoningChain.push(`CAM/FP/电声类固有风险中高，基础风险评分: ${categoryRiskScore}`);
        break;
      case 1: // 结构件-量产管理
        categoryRiskScore = 25; // 中等风险
        result.reasoningChain.push(`结构件类固有风险中等，基础风险评分: ${categoryRiskScore}`);
        break;
      case 2: // 结构件项目质量管理
        categoryRiskScore = 30; // 中等风险
        result.reasoningChain.push(`结构件项目类固有风险中等，基础风险评分: ${categoryRiskScore}`);
        break;
      default:
        categoryRiskScore = 20; // 默认一般风险
        result.reasoningChain.push(`未知类别，默认一般风险，基础风险评分: ${categoryRiskScore}`);
    }
    
    // 特定子类别额外风险调整
    if (factoryData.subcategory) {
      const highRiskSubcategories = ['PCB', 'FPC', 'CPU', 'LCM', '摄像头', '指纹'];
      const mediumRiskSubcategories = ['后摄镜片', '壳料', 'CTP', '扬声器', '麦克风'];
      
      if (highRiskSubcategories.some(sub => factoryData.subcategory.includes(sub))) {
        categoryRiskScore += 15;
        result.reasoningChain.push(`${factoryData.subcategory}属于高风险子类别，风险评分调整为: ${categoryRiskScore}`);
      } else if (mediumRiskSubcategories.some(sub => factoryData.subcategory.includes(sub))) {
        categoryRiskScore += 8;
        result.reasoningChain.push(`${factoryData.subcategory}属于中风险子类别，风险评分调整为: ${categoryRiskScore}`);
      }
    }
    
    // 根据物料类别调整策略
    const categoryStrategy = getCategoryStrategy(factoryData.category_id, result.riskLevel, factoryData.subcategory);
    result.categoryStrategy = categoryStrategy.strategy;
    result.inspectionItems = categoryStrategy.items;
    
    result.reasoningChain.push(`基于物料类别的特定检验建议: ${result.categoryStrategy}`);
    result.reasoningChain.push(`推荐检验项目: ${result.inspectionItems.join(', ')}`);
  } else {
    categoryRiskScore = 25; // 默认中等风险
    result.reasoningChain.push(`无法确定物料类别，使用通用检验策略，默认风险评分: ${categoryRiskScore}`);
  }
  
  result.riskBreakdown.categoryRisk = categoryRiskScore;

  // Step 4: 风险评分计算 (COT第四步)
  // 使用加权平均计算总风险评分
  const weights = {
    factoryRisk: 0.20,         // 工厂数据权重
    labRisk: 0.25,             // 实验室测试权重
    onlineRisk: 0.20,          // 上线使用权重
    supplierRisk: 0.10,        // 供应商历史权重
    batchCorrelationRisk: 0.15, // 批次关联性权重
    categoryRisk: 0.10          // 物料类别固有风险权重
  };
  
  // 计算加权风险评分
  let weightedRiskScore = 0;
  for (const [key, weight] of Object.entries(weights)) {
    weightedRiskScore += result.riskBreakdown[key] * weight;
  }
  
  // 根据风险因素数量做轻微调整
  const factorsAdjustment = Math.min(10, result.riskFactors.length * 2);
  result.riskScore = Math.min(100, Math.round(weightedRiskScore + factorsAdjustment));
  
  result.reasoningChain.push(`综合风险评分计算: ${weightedRiskScore.toFixed(1)} + 风险因素调整(${factorsAdjustment}) = ${result.riskScore}`);
  
  // 根据风险评分重新确定风险等级
  if (result.riskScore >= 75) {
    result.riskLevel = 'high';
  } else if (result.riskScore >= 45) {
    result.riskLevel = 'medium';
  } else {
    result.riskLevel = 'low';
  }
  
  // Step 5: 设置告警级别 (COT第五步)
  if (result.riskScore >= 75) {
    result.alertLevel = 'critical';
    result.reasoningChain.push('触发严重告警等级');
  } else if (result.riskScore >= 45) {
    result.alertLevel = 'warning';
    result.reasoningChain.push('触发警告告警等级');
  } else {
    result.reasoningChain.push('正常监控，无需特别告警');
  }

  // Step 6: 生成最终推荐策略 (COT第六步)
  let inspectionStrategy = '';
  if (result.riskScore >= 75) {
    inspectionStrategy = `建议执行全检 (原因: ${result.riskFactors.join(', ')})`;
  } else if (result.riskScore >= 60) {
    inspectionStrategy = `建议加强抽检频次至80% (原因: ${result.riskFactors.join(', ')})`;
  } else if (result.riskScore >= 45) {
    inspectionStrategy = `建议加强抽检频次至50% (原因: ${result.riskFactors.join(', ')})`;
  } else if (result.riskScore >= 25) {
    inspectionStrategy = '建议执行常规抽检 (20%)';
  } else {
    inspectionStrategy = '建议执行常规抽检 (10%)';
  }
  
  result.recommendation = inspectionStrategy;
  
  // 如果有特定类别的策略，添加到推荐中
  if (result.categoryStrategy) {
    result.recommendation += `\n${result.categoryStrategy}`;
  }
  
  result.reasoningChain.push(`最终推荐: ${result.recommendation}`);
  
  return result;
}

/**
 * 获取基于物料类别的策略及检验项目
 */
function getCategoryStrategy(categoryId, riskLevel, subcategory) {
  const result = {
    strategy: '',
    items: []
  };
  
  switch(categoryId) {
    case 1: // 结构件-量产管理
      return getStructuralComponentStrategy(riskLevel, subcategory);
    case 2: // 结构件项目质量管理
      return getStructuralProjectStrategy(riskLevel, subcategory);
    case 3: // 电子器件
      return getElectronicComponentStrategy(riskLevel, subcategory);
    case 4: // 晶片类
      return getChipStrategy(riskLevel, subcategory);
    case 5: // CAM/FP/电声/安规/包材物料组
      return getCameraAudioStrategy(riskLevel, subcategory);
    default:
      return result;
  }
}

/**
 * 获取结构件量产管理策略
 */
function getStructuralComponentStrategy(riskLevel, subcategory) {
  const result = {
    strategy: '',
    items: []
  };
  
  if (subcategory === '壳料' || subcategory === '后摄镜片') {
    if (riskLevel === 'high') {
      result.strategy = '壳料/后摄镜片建议增加外观和尺寸全检';
      result.items = ['外观全检', '尺寸全检', '材质验证', '硬度测试'];
    } else if (riskLevel === 'medium') {
      result.strategy = '壳料/后摄镜片建议重点关注外观和关键尺寸';
      result.items = ['外观抽检', '关键尺寸检测', '硬度抽检'];
    } else {
      result.items = ['外观抽样', '尺寸抽样'];
    }
  } else if (subcategory === '五金小件' || subcategory === '侧键') {
    result.strategy = '建议重点关注功能性和配合度';
    result.items = ['功能测试', '配合度检测', '耐久性测试'];
  } else {
    result.items = ['常规外观检查', '常规尺寸检查'];
  }
  
  return result;
}

/**
 * 获取结构件项目质量管理策略
 */
function getStructuralProjectStrategy(riskLevel, subcategory) {
  const result = {
    strategy: '',
    items: []
  };
  
  if (riskLevel === 'high') {
    result.strategy = '项目阶段建议增加评审频次和样品确认环节';
    result.items = ['首件确认', '过程控制点检验', '增加评审频次', '样品确认'];
  } else if (riskLevel === 'medium') {
    result.strategy = '项目阶段建议关注首件确认和过程管控';
    result.items = ['首件确认', '过程控制点抽检', '常规评审'];
  } else {
    result.items = ['常规样品确认', '常规过程控制'];
  }
  
  return result;
}

/**
 * 获取电子器件策略
 */
function getElectronicComponentStrategy(riskLevel, subcategory) {
  const result = {
    strategy: '',
    items: []
  };
  
  if (subcategory && subcategory.includes('PCB')) {
    if (riskLevel === 'high') {
      result.strategy = 'PCB/FPC建议增加电气性能和焊接可靠性测试';
      result.items = ['电气性能测试', '焊接可靠性测试', '阻抗匹配测试', '高温高湿测试'];
    } else if (riskLevel === 'medium') {
      result.strategy = 'PCB/FPC建议关注布线质量和阻抗匹配';
      result.items = ['布线质量检查', '阻抗匹配抽检', '常规可靠性测试'];
    } else {
      result.items = ['常规电气性能测试', '外观检查'];
    }
  } else {
    result.strategy = '电子器件建议关注功能性和可靠性测试';
    result.items = ['功能性测试', '可靠性测试', '电气安全测试'];
  }
  
  return result;
}

/**
 * 获取晶片类策略
 */
function getChipStrategy(riskLevel, subcategory) {
  const result = {
    strategy: '',
    items: []
  };
  
  if (subcategory === 'LCM') {
    if (riskLevel === 'high') {
      result.strategy = 'LCM建议增加显示均匀性和亮度测试';
      result.items = ['显示均匀性测试', '亮度测试', '色彩还原测试', '寿命测试'];
    } else if (riskLevel === 'medium') {
      result.items = ['显示均匀性抽检', '亮度抽检', '常规功能测试'];
    } else {
      result.items = ['常规显示效果测试', '功能测试'];
    }
  } else if (subcategory === 'CTP') {
    if (riskLevel === 'high') {
      result.strategy = 'CTP建议增加触控精度和多点触控测试';
      result.items = ['触控精度测试', '多点触控测试', '耐久性测试', '失效模式分析'];
    } else if (riskLevel === 'medium') {
      result.items = ['触控精度抽检', '多点触控抽检', '常规功能测试'];
    } else {
      result.items = ['常规触控功能测试'];
    }
  } else {
    result.strategy = '晶片类建议关注功能性和稳定性测试';
    result.items = ['功能性测试', '稳定性测试', '常规参数验证'];
  }
  
  return result;
}

/**
 * 获取CAM/FP/电声/安规/包材物料组策略
 */
function getCameraAudioStrategy(riskLevel, subcategory) {
  const result = {
    strategy: '',
    items: []
  };
  
  if (subcategory === '摄像头') {
    if (riskLevel === 'high') {
      result.strategy = '摄像头建议增加成像质量和低光测试';
      result.items = ['成像质量测试', '低光环境测试', '色彩还原测试', '自动对焦测试', '防抖性能测试'];
    } else if (riskLevel === 'medium') {
      result.items = ['成像质量抽检', '色彩还原抽检', '常规功能测试'];
    } else {
      result.items = ['常规成像效果测试', '功能测试'];
    }
  } else if (subcategory === '指纹') {
    if (riskLevel === 'high') {
      result.strategy = '指纹模组建议增加识别率和响应速度测试';
      result.items = ['识别率测试', '响应速度测试', '防伪测试', '耐久性测试'];
    } else if (riskLevel === 'medium') {
      result.items = ['识别率抽检', '响应速度抽检', '常规功能测试'];
    } else {
      result.items = ['常规识别功能测试'];
    }
  } else if (subcategory === '扬声器' || subcategory === '麦克风') {
    if (riskLevel === 'high') {
      result.strategy = '电声器件建议增加声学性能和频响测试';
      result.items = ['声学性能测试', '频响测试', '失真测试', '功率测试'];
    } else if (riskLevel === 'medium') {
      result.items = ['声学性能抽检', '频响抽检', '常规功能测试'];
    } else {
      result.items = ['常规声学效果测试', '功能测试'];
    }
  } else {
    result.items = ['常规功能测试', '外观检查'];
  }
  
  return result;
}

/**
 * 构建告警推送内容
 * @param {Object} data 推荐结果数据
 * @returns {Object} 告警推送内容
 */
export function buildAlertMessage(data) {
  if (!data) return null;
  
  // 告警标题
  let title = '';
  let type = 'info';
  
  switch(data.alertLevel) {
    case 'critical':
      title = `【紧急】物料${data.materialCode || ''}风险等级高，需立即处理`;
      type = 'error';
      break;
    case 'warning':
      title = `【警告】物料${data.materialCode || ''}风险等级中，请关注`;
      type = 'warning';
      break;
    default:
      title = `【通知】物料${data.materialCode || ''}检验策略已生成`;
      type = 'info';
  }
  
  // 构建告警内容
  return {
    title,
    type,
    time: new Date().toLocaleString(),
    content: data.recommendation,
    riskScore: data.riskScore,
    inspectionItems: data.inspectionItems
  };
}