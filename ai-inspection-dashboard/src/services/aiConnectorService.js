/**
 * AI连接器服务
 * 
 * 该服务负责连接不同的数据源与AI助手，实现数据的智能分析和处理
 * 包括工厂数据、实验室数据、生产线数据等的集成
 */

// 模拟API调用延迟
function simulateApiCall(data, delay = 800) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(data);
    }, delay);
  });
}

/**
 * 获取特定物料的质量数据
 * @param {string} materialCode 物料编码
 * @returns {Promise} 物料质量数据
 */
export async function getMaterialQualityData(materialCode) {
  // 模拟API返回数据
  const qualityData = {
    materialCode,
    materialName: materialCode === '37301062' ? '电池盖' : materialCode === '38501375' ? '保护膜' : '未知物料',
    supplierCode: materialCode === '37301062' ? 'SUP001' : materialCode === '38501375' ? 'SUP002' : 'UNKNOWN',
    supplierName: materialCode === '37301062' ? '金盾' : materialCode === '38501375' ? '易湛' : '未知供应商',
    qualityHistory: [
      { date: '2025-01-15', defectRate: 2.5, sampleSize: 120, majorDefects: 2, minorDefects: 1 },
      { date: '2025-02-15', defectRate: 3.2, sampleSize: 150, majorDefects: 3, minorDefects: 2 },
      { date: '2025-03-15', defectRate: 5.1, sampleSize: 180, majorDefects: 7, minorDefects: 2 },
      { date: '2025-04-15', defectRate: 4.8, sampleSize: 200, majorDefects: 6, minorDefects: 4 },
      { date: '2025-05-15', defectRate: 6.7, sampleSize: 150, majorDefects: 8, minorDefects: 2 }
    ],
    mainDefectTypes: [
      { type: '外观', percentage: 45 },
      { type: '功能', percentage: 25 },
      { type: '尺寸', percentage: 20 },
      { type: '其他', percentage: 10 }
    ],
    riskLevel: materialCode === '37301062' ? 'medium' : materialCode === '38501375' ? 'high' : 'low',
    recommendations: [
      materialCode === '37301062' ? '增加开合次数测试至800次' : '增加酒精耐磨测试强度',
      '与供应商共同制定改进计划',
      '临时增加来料抽检比例'
    ]
  };
  
  return simulateApiCall(qualityData);
}

/**
 * 获取供应商质量评估
 * @param {string} supplierCode 供应商代码
 * @returns {Promise} 供应商质量评估数据
 */
export async function getSupplierQualityAssessment(supplierCode) {
  // 模拟不同供应商的评估数据
  const isJinDun = supplierCode === 'SUP001';
  const isYiZhan = supplierCode === 'SUP002';
  
  const assessmentData = {
    supplierCode,
    supplierName: isJinDun ? '金盾' : isYiZhan ? '易湛' : '未知供应商',
    overallScore: isJinDun ? 78 : isYiZhan ? 65 : 85,
    qualityLevel: isJinDun ? 'B' : isYiZhan ? 'C' : 'A',
    performanceHistory: [
      { month: '2025-01', score: isJinDun ? 82 : 75 },
      { month: '2025-02', score: isJinDun ? 79 : 72 },
      { month: '2025-03', score: isJinDun ? 75 : 68 },
      { month: '2025-04', score: isJinDun ? 77 : 64 },
      { month: '2025-05', score: isJinDun ? 78 : 65 }
    ],
    categoryScores: {
      deliveryTime: isJinDun ? 85 : 78,
      qualityConsistency: isJinDun ? 75 : 62,
      responsiveness: isJinDun ? 80 : 70,
      costPerformance: isJinDun ? 82 : 75,
      innovation: isJinDun ? 70 : 60
    },
    recentIssues: isJinDun ? [
      { date: '2025-05-26', issue: '电池盖耐久性不足', severity: 'medium' },
      { date: '2025-04-28', issue: '按键卡顿', severity: 'low' }
    ] : isYiZhan ? [
      { date: '2025-05-25', issue: '保护膜酒精耐磨不合格', severity: 'high' },
      { date: '2025-04-12', issue: '标签褪色', severity: 'medium' }
    ] : [],
    improvementAreas: isJinDun ? [
      '可靠性测试流程优化',
      '模具维护计划改进'
    ] : isYiZhan ? [
      '材料选型全面评估',
      '工艺稳定性提升',
      '质量检验标准提高'
    ] : ['持续监控']
  };
  
  return simulateApiCall(assessmentData);
}

/**
 * 获取实验室测试数据
 * @param {string} materialCode 物料编码
 * @param {string} testType 测试类型(可选)
 * @returns {Promise} 实验室测试数据
 */
export async function getLabTestData(materialCode, testType = null) {
  // 电池盖测试数据
  const batteryTestData = {
    materialCode: '37301062',
    materialName: '电池盖',
    testRecords: [
      {
        date: '2025-05-24',
        testType: 'reliability',
        testName: '连续开合耐久性测试',
        standard: '500次无变形',
        result: 'NG',
        actualValue: '100次后针变形',
        testLab: '南昌实验室',
        tester: '张工',
        remarks: '连续两批次出现相同问题'
      },
      {
        date: '2025-04-15',
        testType: 'functional',
        testName: '卡扣强度测试',
        standard: '50N不脱落',
        result: 'OK',
        actualValue: '67N',
        testLab: '深圳实验室',
        tester: '李工',
        remarks: '符合要求'
      }
    ]
  };
  
  // 保护膜测试数据
  const filmTestData = {
    materialCode: '38501375',
    materialName: '保护膜',
    testRecords: [
      {
        date: '2025-05-26',
        testType: 'chemical',
        testName: '酒精耐磨测试',
        standard: '500g×25次不掉漆',
        result: 'NG',
        actualValue: '出现掉漆现象',
        testLab: '深圳实验室',
        tester: '王工',
        remarks: '批次#03,#04均不合格'
      },
      {
        date: '2025-04-20',
        testType: 'adhesion',
        testName: '粘贴力测试',
        standard: '≥4.5N/25mm',
        result: 'OK',
        actualValue: '4.8N/25mm',
        testLab: '南昌实验室',
        tester: '刘工',
        remarks: '符合要求'
      }
    ]
  };
  
  // 根据物料编码返回对应数据
  let testData = {};
  if (materialCode === '37301062') {
    testData = batteryTestData;
  } else if (materialCode === '38501375') {
    testData = filmTestData;
  } else {
    testData = {
      materialCode,
      materialName: '未知物料',
      testRecords: []
    };
  }
  
  // 如果指定了测试类型，进行过滤
  if (testType) {
    testData.testRecords = testData.testRecords.filter(record => record.testType === testType);
  }
  
  return simulateApiCall(testData);
}

/**
 * 获取生产线检测数据
 * @param {string} materialCode 物料编码
 * @param {string} lineId 生产线ID(可选)
 * @returns {Promise} 生产线检测数据
 */
export async function getProductionLineData(materialCode, lineId = null) {
  const productionData = {
    materialCode,
    materialName: materialCode === '37301062' ? '电池盖' : materialCode === '38501375' ? '保护膜' : '未知物料',
    usageRecords: [
      {
        date: '2025-05-26',
        lineId: 'LINE001',
        lineName: 'A区组装线',
        batchNumber: 'B20250526001',
        quantity: 5000,
        defectRate: 2.8,
        defectDetails: [
          { type: '安装不良', count: 78, percentage: 55.7 },
          { type: '外观不良', count: 32, percentage: 22.9 },
          { type: '功能不良', count: 30, percentage: 21.4 }
        ],
        reworkRate: 1.5,
        reworkCost: 4500,
        impactLevel: 'medium'
      },
      {
        date: '2025-05-20',
        lineId: 'LINE002',
        lineName: 'B区组装线',
        batchNumber: 'B20250520002',
        quantity: 4500,
        defectRate: 2.2,
        defectDetails: [
          { type: '安装不良', count: 56, percentage: 56.6 },
          { type: '外观不良', count: 24, percentage: 24.2 },
          { type: '功能不良', count: 19, percentage: 19.2 }
        ],
        reworkRate: 1.2,
        reworkCost: 3200,
        impactLevel: 'low'
      }
    ]
  };
  
  // 如果指定了生产线ID，进行过滤
  if (lineId) {
    productionData.usageRecords = productionData.usageRecords.filter(record => record.lineId === lineId);
  }
  
  return simulateApiCall(productionData);
}

/**
 * 使用AI生成质量改进建议
 * @param {Object} data 质量数据
 * @returns {Promise} AI生成的改进建议
 */
export async function generateQualityImprovementSuggestions(data) {
  // 模拟AI生成的改进建议
  const suggestions = {
    timestamp: new Date().toISOString(),
    materialCode: data.materialCode,
    materialName: data.materialName || '未知物料',
    currentStatus: {
      riskLevel: data.riskLevel || 'medium',
      mainIssues: data.mainDefectTypes?.map(defect => defect.type) || ['质量波动'],
      trendAnalysis: '近期质量呈下降趋势，需要重点关注'
    },
    suggestions: [
      {
        area: '来料检验',
        actions: [
          '增加抽检比例至8%（标准2%）',
          '针对历史问题点增加专项检测项目',
          '使用图像识别技术进行外观自动检测'
        ],
        priority: 'high',
        expectedImpact: '可减少不良品进入生产线的概率约60%'
      },
      {
        area: '供应商管理',
        actions: [
          '与供应商共同建立质量改进计划',
          '增加供应商现场审核频率',
          '要求提供更详细的出厂检验报告'
        ],
        priority: 'medium',
        expectedImpact: '从源头减少质量问题，长期效果显著'
      },
      {
        area: '设计优化',
        actions: [
          '评估当前设计中的质量风险点',
          '考虑替代材料或工艺',
          '优化设计容差'
        ],
        priority: 'medium',
        expectedImpact: '从根本上解决设计相关的质量问题'
      }
    ],
    implementationPlan: {
      shortTerm: '立即增加来料检验力度，与供应商沟通当前问题',
      midTerm: '实施供应商改进计划，评估替代供应商',
      longTerm: '优化设计和材料选型，建立预防性质量管理体系'
    }
  };
  
  return simulateApiCall(suggestions, 1500);
}

/**
 * 预测未来质量趋势
 * @param {string} materialCode 物料编码
 * @param {number} days 预测天数
 * @returns {Promise} 质量趋势预测
 */
export async function predictQualityTrend(materialCode, days = 30) {
  // 模拟AI预测
  const startDate = new Date();
  const predictions = [];
  
  // 基于物料生成不同的预测趋势
  let baseDefectRate, trend, volatility;
  
  if (materialCode === '37301062') { // 电池盖 - 逐渐改善
    baseDefectRate = 6.5;
    trend = -0.08; // 每天下降0.08%
    volatility = 0.5; // 波动范围
  } else if (materialCode === '38501375') { // 保护膜 - 先恶化后改善
    baseDefectRate = 8.0;
    trend = 0.1; // 初始趋势
    volatility = 0.8; // 较大波动
  } else { // 默认 - 基本稳定
    baseDefectRate = 4.0;
    trend = -0.02;
    volatility = 0.3;
  }
  
  // 生成预测数据
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // 针对保护膜在第10天后改变趋势方向
    if (materialCode === '38501375' && i > 10) {
      trend = -0.15; // 快速改善
    }
    
    const randomFactor = (Math.random() - 0.5) * volatility;
    let predictedRate = baseDefectRate + (trend * i) + randomFactor;
    predictedRate = Math.max(0.5, predictedRate); // 确保不小于0.5%
    
    predictions.push({
      date: date.toISOString().split('T')[0],
      defectRate: parseFloat(predictedRate.toFixed(2)),
      confidence: Math.max(30, 95 - i * 1.5), // 随时间降低置信度
      factors: generateFactors(materialCode, i)
    });
  }
  
  const prediction = {
    materialCode,
    materialName: materialCode === '37301062' ? '电池盖' : materialCode === '38501375' ? '保护膜' : '未知物料',
    predictionPeriod: `${days}天`,
    startDate: startDate.toISOString().split('T')[0],
    endDate: predictions[predictions.length - 1].date,
    predictions,
    summary: {
      initialDefectRate: predictions[0].defectRate,
      finalDefectRate: predictions[predictions.length - 1].defectRate,
      averageDefectRate: parseFloat((predictions.reduce((sum, p) => sum + p.defectRate, 0) / predictions.length).toFixed(2)),
      trend: predictions[0].defectRate > predictions[predictions.length - 1].defectRate ? '改善' : '恶化',
      riskLevel: predictions[0].defectRate > 5 ? 'high' : predictions[0].defectRate > 3 ? 'medium' : 'low',
      confidenceLevel: 'medium'
    }
  };
  
  return simulateApiCall(prediction, 2000);
}

// 生成影响因素
function generateFactors(materialCode, day) {
  const factors = [];
  
  // 基于物料类型和预测日生成不同的影响因素
  if (materialCode === '37301062') { // 电池盖
    if (day < 10) {
      factors.push({ name: '模具调整', impact: 'positive', weight: 0.4 });
    }
    if (day > 5 && day < 20) {
      factors.push({ name: '工艺改进', impact: 'positive', weight: 0.3 });
    }
    if (day > 15) {
      factors.push({ name: '原材料批次变化', impact: 'negative', weight: 0.2 });
    }
  } else if (materialCode === '38501375') { // 保护膜
    if (day < 10) {
      factors.push({ name: '材料问题持续', impact: 'negative', weight: 0.5 });
    }
    if (day > 10) {
      factors.push({ name: '供应商更换材料', impact: 'positive', weight: 0.6 });
      factors.push({ name: '工艺优化', impact: 'positive', weight: 0.3 });
    }
  } else { // 默认
    if (day % 7 === 0) {
      factors.push({ name: '定期检查', impact: 'positive', weight: 0.2 });
    }
  }
  
  // 添加一些随机因素
  const randomFactors = [
    '操作人员培训', '设备维护', '环境温度波动', '检验标准调整', '批次差异'
  ];
  
  if (Math.random() > 0.7) {
    const randomFactor = randomFactors[Math.floor(Math.random() * randomFactors.length)];
    factors.push({
      name: randomFactor,
      impact: Math.random() > 0.5 ? 'positive' : 'negative',
      weight: parseFloat((Math.random() * 0.3).toFixed(2))
    });
  }
  
  return factors;
}

/**
 * 集成多个数据源分析物料
 * @param {string} materialCode 物料编码
 * @returns {Promise} 集成分析结果
 */
export async function getIntegratedMaterialAnalysis(materialCode) {
  try {
    // 并行请求多个数据源
    const [qualityData, labData, productionData] = await Promise.all([
      getMaterialQualityData(materialCode),
      getLabTestData(materialCode),
      getProductionLineData(materialCode)
    ]);
    
    // 集成数据分析
    const analysis = {
      materialCode,
      materialName: qualityData.materialName,
      timestamp: new Date().toISOString(),
      summary: {
        riskLevel: qualityData.riskLevel,
        currentDefectRate: qualityData.qualityHistory[qualityData.qualityHistory.length - 1].defectRate,
        trendAnalysis: calculateTrend(qualityData.qualityHistory.map(h => h.defectRate)),
        recentTestStatus: labData.testRecords.length > 0 ? labData.testRecords[0].result : 'N/A',
        productionImpact: productionData.usageRecords.length > 0 ? productionData.usageRecords[0].impactLevel : 'N/A'
      },
      qualityData: simplifyQualityData(qualityData),
      labData: simplifyLabData(labData),
      productionData: simplifyProductionData(productionData),
      recommendations: generateIntegratedRecommendations(qualityData, labData, productionData)
    };
    
    return simulateApiCall(analysis, 1000);
  } catch (error) {
    console.error('集成分析失败:', error);
    throw error;
  }
}

// 计算趋势
function calculateTrend(values) {
  if (!values || values.length < 2) return '数据不足';
  
  const first = values[0];
  const last = values[values.length - 1];
  const diff = last - first;
  const percentChange = (diff / first) * 100;
  
  if (percentChange > 10) return '明显上升';
  if (percentChange > 5) return '轻微上升';
  if (percentChange < -10) return '明显下降';
  if (percentChange < -5) return '轻微下降';
  return '基本稳定';
}

// 简化数据，只保留关键信息
function simplifyQualityData(data) {
  return {
    riskLevel: data.riskLevel,
    qualityHistory: data.qualityHistory,
    mainDefectTypes: data.mainDefectTypes
  };
}

function simplifyLabData(data) {
  return {
    testRecords: data.testRecords.map(r => ({
      date: r.date,
      testName: r.testName,
      result: r.result,
      testLab: r.testLab
    }))
  };
}

function simplifyProductionData(data) {
  return {
    usageRecords: data.usageRecords.map(r => ({
      date: r.date,
      lineName: r.lineName,
      defectRate: r.defectRate,
      impactLevel: r.impactLevel
    }))
  };
}

// 生成集成建议
function generateIntegratedRecommendations(qualityData, labData, productionData) {
  const recommendations = [];
  
  // 基于质量数据
  if (qualityData.riskLevel === 'high') {
    recommendations.push({
      area: '质量控制',
      action: '紧急增加来料抽检比例至100%',
      priority: 'critical',
      rationale: '高风险物料，需要全检确保质量'
    });
  } else if (qualityData.riskLevel === 'medium') {
    recommendations.push({
      area: '质量控制',
      action: '增加来料抽检比例至8%',
      priority: 'high',
      rationale: '中等风险物料，需要加强检验'
    });
  }
  
  // 基于实验室数据
  const failedTests = labData.testRecords.filter(r => r.result === 'NG');
  if (failedTests.length > 0) {
    recommendations.push({
      area: '实验室检测',
      action: `增加${failedTests[0].testName}的测试频率和强度`,
      priority: 'high',
      rationale: '针对已发现的问题加强测试'
    });
  }
  
  // 基于生产线数据
  if (productionData.usageRecords.length > 0) {
    const avgDefectRate = productionData.usageRecords.reduce((sum, r) => sum + r.defectRate, 0) / productionData.usageRecords.length;
    if (avgDefectRate > 2.5) {
      recommendations.push({
        area: '生产管控',
        action: '优化产线工艺参数和作业指导书',
        priority: 'medium',
        rationale: '产线不良率较高，需要改进操作方法'
      });
    }
  }
  
  // 通用建议
  recommendations.push({
    area: '供应商管理',
    action: '与供应商共同制定质量改进计划',
    priority: qualityData.riskLevel === 'high' ? 'high' : 'medium',
    rationale: '从源头控制质量问题'
  });
  
  return recommendations;
}

/**
 * 检测异常
 * @param {Object} config 异常检测配置
 * @returns {Promise} 异常检测结果
 */
export async function detectAnomalies(config) {
  // 根据不同的检测类型和算法生成模拟数据
  const { type, algorithm, sensitivity, dataSources, startDate, endDate } = config;
  
  // 生成时间线
  const timeline = generateTimeline(startDate, endDate);
  
  // 生成模拟数据值
  const values = generateTimeSeriesData(timeline.length, type);
  
  // 根据敏感度和算法检测异常
  const anomalyIndices = detectAnomalyIndices(values, algorithm, sensitivity / 10);
  
  // 生成异常区间
  const anomalyRanges = generateAnomalyRanges(anomalyIndices);
  
  // 生成异常列表
  const anomalies = anomalyIndices.map(index => {
    const anomalyType = Math.random() > 0.7 ? 'critical' : Math.random() > 0.5 ? 'major' : 'minor';
    const severityScore = anomalyType === 'critical' ? 85 + Math.random() * 15 : 
                         anomalyType === 'major' ? 60 + Math.random() * 25 : 
                         30 + Math.random() * 30;
    
    return {
      id: `anomaly-${Date.now()}-${index}`,
      date: timeline[index],
      type: anomalyType,
      severity: anomalyType === 'critical' ? '严重' : anomalyType === 'major' ? '中等' : '轻微',
      severityScore: Math.round(severityScore),
      confidence: Math.round(70 + Math.random() * 25),
      description: generateAnomalyDescription(type, algorithm, values[index], dataSources),
    };
  });
  
  // 生成摘要
  const criticalCount = anomalies.filter(a => a.type === 'critical').length;
  const majorCount = anomalies.filter(a => a.type === 'major').length;
  const minorCount = anomalies.filter(a => a.type === 'minor').length;
  
  let summary = '';
  if (criticalCount > 0) {
    summary += `检测到${criticalCount}个严重异常，需要立即处理。`;
  }
  if (majorCount > 0) {
    summary += `${majorCount}个中等异常需要关注。`;
  }
  if (minorCount > 0) {
    summary += `${minorCount}个轻微异常建议监控。`;
  }
  
  if (anomalies.length === 0) {
    summary = '未检测到异常，质量状态良好。';
  }
  
  return simulateApiCall({
    timeline,
    values,
    anomalyIndices,
    anomalyRanges,
    anomalies,
    criticalCount,
    majorCount,
    minorCount,
    summary
  });
}

/**
 * 获取异常详情
 * @param {string} anomalyId 异常ID
 * @returns {Promise} 异常详情
 */
export async function getAnomalyDetails(anomalyId) {
  // 模拟异常详情数据
  const details = {
    actionSteps: [
      {
        title: '立即通知相关人员',
        description: '将异常情况通知质量工程师和生产主管'
      },
      {
        title: '暂停相关批次',
        description: '暂停使用可能受影响的物料批次，进行隔离'
      },
      {
        title: '增加抽检比例',
        description: '对同供应商其他批次增加抽检频率和比例'
      },
      {
        title: '启动根因分析',
        description: '组织质量分析会议，确定问题根因'
      }
    ],
    impactScore: 3.5 + Math.random() * 1.5,
    impactDescription: '此异常可能导致产品功能不稳定，影响用户体验，建议在生产前解决。如继续使用有问题批次，可能导致返修率上升2-5个百分点。'
  };
  
  return simulateApiCall(details);
}

/**
 * 生成时间线
 * @param {string} startDate 开始日期
 * @param {string} endDate 结束日期
 * @returns {Array} 时间线数组
 */
function generateTimeline(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const timeline = [];
  
  const currentDate = new Date(start);
  while (currentDate <= end) {
    timeline.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return timeline;
}

/**
 * 生成时间序列数据
 * @param {number} length 数据长度
 * @param {string} type 异常类型
 * @returns {Array} 时间序列数据
 */
function generateTimeSeriesData(length, type) {
  const values = [];
  const baseValue = 100;
  const noise = 10;
  
  // 生成基础时间序列
  for (let i = 0; i < length; i++) {
    let value = baseValue + (Math.random() - 0.5) * noise;
    
    // 添加趋势
    value += i * 0.2;
    
    // 添加季节性
    value += 5 * Math.sin(i / 7 * Math.PI);
    
    values.push(Math.round(value * 10) / 10);
  }
  
  // 根据不同类型添加异常
  if (type === 'statistical') {
    // 添加点异常
    const anomalyIndices = [
      Math.floor(length * 0.2),
      Math.floor(length * 0.5),
      Math.floor(length * 0.8)
    ];
    
    anomalyIndices.forEach(index => {
      values[index] = baseValue + noise * 3 * (Math.random() > 0.5 ? 1 : -1);
    });
  } else if (type === 'pattern') {
    // 添加模式异常
    const patternStartIndex = Math.floor(length * 0.6);
    for (let i = 0; i < 5; i++) {
      if (patternStartIndex + i < length) {
        values[patternStartIndex + i] = baseValue - noise - i * 2;
      }
    }
  } else if (type === 'contextual') {
    // 添加上下文异常
    const contextStartIndex = Math.floor(length * 0.4);
    for (let i = 0; i < 3; i++) {
      if (contextStartIndex + i < length) {
        // 在季节性高点添加异常低值
        if (Math.sin((contextStartIndex + i) / 7 * Math.PI) > 0.5) {
          values[contextStartIndex + i] = baseValue - noise * 2;
        }
      }
    }
  } else if (type === 'collective') {
    // 添加集体异常
    const collectiveStartIndex = Math.floor(length * 0.7);
    const shift = noise * 2;
    for (let i = collectiveStartIndex; i < length; i++) {
      values[i] += shift;
    }
  }
  
  return values;
}

/**
 * 检测异常索引
 * @param {Array} values 数据值
 * @param {string} algorithm 算法
 * @param {number} threshold 阈值
 * @returns {Array} 异常索引
 */
function detectAnomalyIndices(values, algorithm, threshold) {
  const anomalyIndices = [];
  
  if (algorithm === 'zscore') {
    // 计算均值和标准差
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    );
    
    // 检测Z-Score异常
    values.forEach((value, index) => {
      const zScore = Math.abs((value - mean) / stdDev);
      if (zScore > 2 + threshold * 3) {
        anomalyIndices.push(index);
      }
    });
  } else if (algorithm === 'iqr') {
    // 排序数据
    const sortedValues = [...values].sort((a, b) => a - b);
    
    // 计算四分位数
    const q1Index = Math.floor(sortedValues.length * 0.25);
    const q3Index = Math.floor(sortedValues.length * 0.75);
    const q1 = sortedValues[q1Index];
    const q3 = sortedValues[q3Index];
    const iqr = q3 - q1;
    
    // 计算异常边界
    const lowerBound = q1 - iqr * (1.5 + threshold);
    const upperBound = q3 + iqr * (1.5 + threshold);
    
    // 检测IQR异常
    values.forEach((value, index) => {
      if (value < lowerBound || value > upperBound) {
        anomalyIndices.push(index);
      }
    });
  } else {
    // 其他算法，简单模拟
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    );
    
    values.forEach((value, index) => {
      // 随机选择一些点作为异常，但确保极端值被选中
      const deviation = Math.abs(value - mean);
      if (deviation > stdDev * (2 + threshold) || (deviation > stdDev && Math.random() < 0.2)) {
        anomalyIndices.push(index);
      }
    });
  }
  
  return anomalyIndices;
}

/**
 * 生成异常区间
 * @param {Array} anomalyIndices 异常索引
 * @returns {Array} 异常区间
 */
function generateAnomalyRanges(anomalyIndices) {
  if (anomalyIndices.length === 0) return [];
  
  const ranges = [];
  let rangeStart = anomalyIndices[0];
  let prevIndex = anomalyIndices[0];
  
  for (let i = 1; i < anomalyIndices.length; i++) {
    const currentIndex = anomalyIndices[i];
    
    // 如果当前索引与前一个索引不连续，结束当前区间并开始新区间
    if (currentIndex - prevIndex > 1) {
      ranges.push([rangeStart, prevIndex]);
      rangeStart = currentIndex;
    }
    
    prevIndex = currentIndex;
  }
  
  // 添加最后一个区间
  ranges.push([rangeStart, anomalyIndices[anomalyIndices.length - 1]]);
  
  return ranges;
}

/**
 * 生成异常描述
 * @param {string} type 异常类型
 * @param {string} algorithm 算法
 * @param {number} value 异常值
 * @param {Array} dataSources 数据源
 * @returns {string} 异常描述
 */
function generateAnomalyDescription(type, algorithm, value, dataSources) {
  const descriptions = [
    `${dataSources.includes('iqc') ? 'IQC检测' : ''}${dataSources.includes('lab') ? '实验室测试' : ''} 数据出现异常波动`,
    `检测到${type === 'statistical' ? '统计' : type === 'pattern' ? '模式' : type === 'contextual' ? '上下文' : '集体'}异常，测量值为 ${value}`,
    `使用${algorithm === 'zscore' ? 'Z-Score' : algorithm === 'iqr' ? 'IQR' : algorithm}算法检测到数据异常`,
    `${dataSources.includes('supplier') ? '供应商' : ''}${dataSources.includes('equipment') ? '设备' : ''} 质量数据异常`,
    `检测到不符合历史模式的异常值 ${value}，建议进一步分析`
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

/**
 * 获取AI分析洞察
 * @param {string} dataType 数据类型
 * @param {Object} filters 过滤条件
 * @returns {Promise} AI分析洞察
 */
export async function getAiInsights(dataType, filters = {}) {
  // 模拟不同类型的AI分析洞察
  let insights = [];
  
  if (dataType === 'quality') {
    insights = [
      {
        title: "质量趋势洞察",
        description: "近30天质量数据显示不良率呈上升趋势，主要集中在外观缺陷类别。",
        confidence: 92,
        recommendation: "建议对外观检测标准进行培训，并与供应商沟通改进。",
        impactLevel: "medium"
      },
      {
        title: "批次相关性分析",
        description: "批次号以'B25'开头的物料不良率显著高于平均水平，可能存在系统性问题。",
        confidence: 87,
        recommendation: "对'B25'批次进行专项抽检，并追溯生产记录。",
        impactLevel: "high"
      },
      {
        title: "季节性模式识别",
        description: "检测到每月第一周来料质量波动较大，与供应商月度生产计划变更相关。",
        confidence: 78,
        recommendation: "调整月初验收标准，增加抽检比例。",
        impactLevel: "low"
      }
    ];
  } else if (dataType === 'supplier') {
    insights = [
      {
        title: "供应商绩效评估",
        description: "供应商'金盾'近3个月质量评分下降12%，主要问题在于交付及时性。",
        confidence: 95,
        recommendation: "安排供应商质量会议，制定改进计划。",
        impactLevel: "medium"
      },
      {
        title: "供应商风险预警",
        description: "供应商'易湛'连续出现相同质量问题，且改进效果不明显。",
        confidence: 89,
        recommendation: "考虑启动备选供应商评估，降低依赖风险。",
        impactLevel: "high"
      },
      {
        title: "供应链优化建议",
        description: "综合质量、成本和交付分析，建议增加'华辰'的订单比例。",
        confidence: 82,
        recommendation: "与'华辰'商议扩大合作规模，签订长期协议。",
        impactLevel: "medium"
      }
    ];
  } else if (dataType === 'process') {
    insights = [
      {
        title: "工艺参数优化",
        description: "通过机器学习分析，发现温度控制在72±2℃时良品率最高。",
        confidence: 91,
        recommendation: "调整工艺参数，缩小温度控制范围。",
        impactLevel: "high"
      },
      {
        title: "设备维护预测",
        description: "设备#3振动数据显示异常模式，预计在未来2周可能发生故障。",
        confidence: 85,
        recommendation: "安排预防性维护，检查轴承和传动部件。",
        impactLevel: "high"
      },
      {
        title: "工序瓶颈分析",
        description: "检测到装配工序是当前产能瓶颈，人员技能差异导致效率波动。",
        confidence: 88,
        recommendation: "优化人员配置，增加技能培训。",
        impactLevel: "medium"
      }
    ];
  }
  
  // 根据过滤条件筛选
  if (filters.confidence) {
    insights = insights.filter(item => item.confidence >= filters.confidence);
  }
  
  if (filters.impactLevel) {
    insights = insights.filter(item => item.impactLevel === filters.impactLevel);
  }
  
  return simulateApiCall({
    insights,
    generatedAt: new Date().toISOString(),
    dataSourcesAnalyzed: dataType === 'quality' ? ['IQC数据', '实验室测试', '产线检测'] :
                         dataType === 'supplier' ? ['供应商评估', '来料检验', '交付记录'] :
                         ['设备数据', '工艺参数', '产能数据'],
    aiModelUsed: dataType === 'quality' ? 'QualityTrendAnalyzer v2.1' :
                dataType === 'supplier' ? 'SupplierRiskAssessment v1.8' :
                'ProcessOptimization v3.0'
  });
}

// 创建服务对象
const aiConnectorService = {
  getMaterialQualityData,
  getSupplierQualityAssessment,
  getLabTestData,
  getProductionLineData,
  generateQualityImprovementSuggestions,
  predictQualityTrend,
  getIntegratedMaterialAnalysis,
  detectAnomalies,
  getAnomalyDetails,
  getAiInsights,
  configure: (config) => {
    console.log("配置AI连接器:", config);
    return { success: true };
  },
  testConnection: async () => {
    // 模拟连接测试
    return { success: true };
  }
};

// 导出具名服务
export { aiConnectorService };

// 导出默认服务
export default aiConnectorService; 