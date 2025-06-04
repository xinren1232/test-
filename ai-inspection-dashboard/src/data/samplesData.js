// IQE智能质量工程系统 - 优化样本数据
// 包含库存、实验室和产线三大场景的扩展数据结构

// 物料主数据 - 扩展为100+物料
export const materialMasterData = [
  { 
    materialCode: '38501375', 
    materialName: '保护膜（全包膜）', 
    materialType: '包材', 
    unit: '片',
    riskLevel: 'C', 
    standardSampling: '5%',
    keyParameters: ['耐磨性', '附着力', '透光率', '耐化学性'],
    suppliers: ['易湛', '联辉', '德瑞'],
    criticalProcess: ['贴合', '除泡'],
    commonDefects: ['掉漆', '气泡', '划痕', '异物'],
    specifications: {
      thickness: '0.125mm±0.01mm',
      transparency: '≥98%',
      abrasionResistance: '500g×25次不掉漆',
      chemicalResistance: '酒精、油脂耐受'
    }
  },
  { 
    materialCode: '37301062', 
    materialName: '电池盖', 
    materialType: '结构件', 
    unit: '个',
    riskLevel: 'B', 
    standardSampling: '2%',
    keyParameters: ['尺寸', '强度', '平整度', '开合力度'],
    suppliers: ['金盾', '恒拓', '银特'],
    criticalProcess: ['注塑', '表面处理'],
    commonDefects: ['变形', '翘曲', '开裂', '缺胶'],
    specifications: {
      material: 'PC+GF30%',
      thickness: '0.8mm±0.05mm',
      bendingStrength: '≥120MPa',
      openCloseEndurance: '≥500次'
    }
  },
  { 
    materialCode: '37208631', 
    materialName: '按键', 
    materialType: '结构件', 
    unit: '个',
    riskLevel: 'B', 
    standardSampling: '2%',
    keyParameters: ['按压力度', '行程', '回弹性', '表面硬度'],
    suppliers: ['金盾', '华镁', '精技'],
    criticalProcess: ['注塑', '电镀', '组装'],
    commonDefects: ['卡顿', '回弹不良', '褪色', '尺寸偏差'],
    specifications: {
      material: 'PC',
      pressForce: '250±50gf',
      stroke: '0.25mm±0.05mm',
      lifetime: '≥300,000次'
    }
  },
  // ... 更多物料数据
];

// 供应商数据 - 扩展为30+供应商
export const supplierData = [
  {
    id: 'S001',
    name: '易湛',
    riskLevel: 'C',
    qualityScore: 68,
    anomalyCount: 7,
    materials: ['保护膜', '标签', '包装盒'],
    qualityHistory: [
      { month: '2025-01', score: 82 },
      { month: '2025-02', score: 78 },
      { month: '2025-03', score: 74 },
      { month: '2025-04', score: 70 },
      { month: '2025-05', score: 68 },
    ],
    certifications: ['ISO9001', 'QC080000'],
    lastAuditDate: '2025-03-15',
    auditScore: 72,
    mainDefects: ['耐磨性不足', '附着力不良', '气泡']
  },
  {
    id: 'S002',
    name: '金盾',
    riskLevel: 'B',
    qualityScore: 78,
    anomalyCount: 4,
    materials: ['电池盖', '按键', '卡托'],
    qualityHistory: [
      { month: '2025-01', score: 88 },
      { month: '2025-02', score: 85 },
      { month: '2025-03', score: 83 },
      { month: '2025-04', score: 80 },
      { month: '2025-05', score: 78 },
    ],
    certifications: ['ISO9001', 'IATF16949', 'ISO14001'],
    lastAuditDate: '2025-04-10',
    auditScore: 81,
    mainDefects: ['尺寸偏差', '强度不足', '表面缺陷']
  },
  {
    id: 'S003',
    name: '联科',
    riskLevel: 'A',
    qualityScore: 92,
    anomalyCount: 1,
    materials: ['连接器', '弹片', '接口'],
    qualityHistory: [
      { month: '2025-01', score: 91 },
      { month: '2025-02', score: 92 },
      { month: '2025-03', score: 93 },
      { month: '2025-04', score: 94 },
      { month: '2025-05', score: 92 },
    ],
    certifications: ['ISO9001', 'IATF16949', 'ISO14001', 'QC080000'],
    lastAuditDate: '2025-02-25',
    auditScore: 94,
    mainDefects: ['接触电阻波动']
  },
  // ... 更多供应商数据
];

// 工厂数据
export const factoryData = [
  {
    id: 'F001',
    name: '南昌工厂',
    returningRate: 4.2,
    qualityTrend: [3.2, 3.5, 3.8, 4.0, 4.2],
    productCategories: ['手机', '平板', '智能穿戴'],
    mainIssues: ['结构件变形', '组装偏差', '表面缺陷']
  },
  {
    id: 'F002',
    name: '泰衡诺工厂',
    returningRate: 3.8,
    qualityTrend: [4.0, 3.9, 3.7, 3.8, 3.8],
    productCategories: ['笔记本', '显示器', '一体机'],
    mainIssues: ['包材不良', '功能异常', '外观缺陷']
  },
  {
    id: 'F003',
    name: '深圳工厂',
    returningRate: 2.9,
    qualityTrend: [3.3, 3.1, 3.0, 2.8, 2.9],
    productCategories: ['手机', '智能音箱', '路由器'],
    mainIssues: ['电气参数偏差', '功能异常', '组装不良']
  }
];

// 库存物料批次数据 - 扩展为100+批次
export const materialBatchData = [
  {
    materialCode: '38501375',
    materialName: '保护膜',
    project: 'X6725B',
    batchId: '#03, #04',
    inspectionDate: '2025-05-26',
    result: 'NG',
    defectRate: '100%',
    supplier: '易湛',
    status: '退货处理中',
    riskScore: 92,
    isHighRisk: true,
    location: 'IQC',
    inspector: '张明',
    defectType: '外观',
    defectDescription: '酒精耐磨测试掉漆',
    images: [
      '/src/assets/demo/defect-image-1.jpg',
      '/src/assets/demo/defect-image-2.jpg'
    ],
    relatedRecords: ['IQC-20250526-012']
  },
  {
    materialCode: '37301062',
    materialName: '电池盖',
    project: 'X6725B',
    batchId: '#A22, #A23',
    inspectionDate: '2025-05-24',
    result: 'NG',
    defectRate: '66.7%',
    supplier: '金盾',
    status: '返工修复中',
    riskScore: 78,
    isHighRisk: true,
    location: '南昌工厂',
    inspector: '李强',
    defectType: '可靠性',
    defectDescription: '连续开合100次后针变形',
    images: [
      '/src/assets/demo/defect-image-3.jpg'
    ],
    relatedRecords: ['IQC-20250524-008']
  },
  {
    materialCode: '37208631',
    materialName: '按键',
    project: 'X6725B',
    batchId: '#B10',
    inspectionDate: '2025-05-24',
    result: '有条件接收',
    defectRate: '12.5%',
    supplier: '金盾',
    status: '特采使用中',
    riskScore: 45,
    isHighRisk: false,
    location: '产线',
    inspector: '王芳',
    defectType: '外观',
    defectDescription: '按键高度超差+0.3mm',
    images: [],
    relatedRecords: []
  },
  // ... 扩展更多批次数据
];

// 实验室检测数据 - 扩展为100+检测记录
export const labTestData = [
  {
    id: 'LT2025052601',
    testDate: '2025/05/26',
    testSource: '深圳实验室来料例行测试',
    project: 'X6725',
    materialCode: '38501375',
    materialName: '保护膜（全包膜）',
    testItem: '酒精耐磨 500g × 25次掉漆油墨',
    result: 'NG',
    badBatch: '#03, #04',
    defectRate: '2/2（100%）',
    supplier: '易湛',
    responsibility: '来料',
    recommendation: '整批物料标记为不合格，建议暂停上线使用',
    remarks: '与生产端返工记录匹配（见2025/05/26记录）',
    relatedRecords: ['IQC-20250526-012', 'PR-20250526-003'],
    images: [
      { url: '/src/assets/demo/defect-image-1.jpg', caption: '保护膜酒精测试后掉漆现象' },
      { url: '/src/assets/demo/defect-image-2.jpg', caption: '保护膜表面异常放大图' }
    ],
    testProcedure: '按照QATS-38501375-001测试规范执行',
    testEquipment: ['耐磨测试仪#TS-025', '显微镜#MS-103'],
    testParameters: {
      pressure: '500g',
      times: 25,
      solvent: '75%酒精',
      testArea: '中央区域'
    },
    tester: '王立',
    reviewer: '陈博'
  },
  {
    id: 'LT2025052402',
    testDate: '2025/05/24',
    testSource: '南昌实验室来料检测',
    project: 'X6725',
    materialCode: '37301062',
    materialName: '电池盖',
    testItem: '连续开合耐久性测试 500次',
    result: 'NG',
    badBatch: '#A22, #A23',
    defectRate: '2/3（66.7%）',
    supplier: '金盾',
    responsibility: '来料',
    recommendation: '返工处理，增加抽检比例',
    remarks: '与上月同批次问题相似，建议供应商改进工艺',
    relatedRecords: ['IQC-20250524-008'],
    images: [
      { url: '/src/assets/demo/defect-image-3.jpg', caption: '电池盖变形现象' }
    ],
    testProcedure: '按照QATS-37301062-002测试规范执行',
    testEquipment: ['开合测试机#EC-056', '力学分析仪#FM-033'],
    testParameters: {
      cycles: 500,
      speed: '30次/分钟',
      openAngle: '120°',
      temperature: '25±2°C'
    },
    tester: '张明',
    reviewer: '李强'
  },
  // ... 扩展更多测试数据
];

// 产线异常记录 - 扩展为100+记录
export const productionAnomalies = [
  { 
    id: 'PA2025052601',
    date: '2025/05/26',
    project: 'X6725B',
    projectPhase: '量产',
    componentType: '结构件',
    anomalyType: '可靠性',
    urgencyLevel: '返工生产',
    responsibleFactory: '南昌工厂',
    location: 'IQC',
    materialCode: '37301062',
    materialName: '电池盖',
    description: '装卸100次后针变形（标准500次），不良率2/3',
    supplier: '金盾',
    responsibility: '来料',
    riskLevel: 'B',
    impactScope: '当前在产3个批次，约1500台',
    processingStatus: '处理中',
    processor: '李强',
    processingPlan: '1. 返工生产\n2. 供应商提供改进措施\n3. 增加下批次抽检比例',
    estimatedCompletionTime: '2025/05/30',
    actualCompletionTime: '',
    relatedRecords: ['IQC-20250524-008', 'LT2025052402']
  },
  { 
    id: 'PA2025052502',
    date: '2025/05/25',
    project: 'X6725B',
    projectPhase: '量产',
    componentType: '包材',
    anomalyType: '外观',
    urgencyLevel: '克服生产',
    responsibleFactory: '泰衡诺工厂',
    location: '产线',
    materialCode: '38501375',
    materialName: '保护膜',
    description: '酒精耐磨500g×25次掉漆油墨',
    supplier: '易湛',
    responsibility: '来料',
    riskLevel: 'C',
    impactScope: '当前在线2个批次，约800台',
    processingStatus: '已完成',
    processor: '张明',
    processingPlan: '1. 整批退货\n2. 要求供应商排查原因\n3. 临时选用备用供应商',
    estimatedCompletionTime: '2025/05/28',
    actualCompletionTime: '2025/05/27',
    relatedRecords: ['IQC-20250526-012', 'LT2025052601']
  },
  // ... 扩展更多异常记录
];

// 质量预测模型数据
export const qualityPredictionData = [
  {
    materialCode: '38501375',
    materialName: '保护膜',
    batchId: '#D22, #D23',
    supplier: '易湛',
    predictedResult: 'NG',
    predictedDefectRate: 58,
    predictedDefectTypes: [
      { type: '耐磨性不足', probability: 0.75 },
      { type: '气泡', probability: 0.15 },
      { type: '划痕', probability: 0.10 }
    ],
    confidence: 87,
    similarHistoricalBatches: ['#03, #04', '#B12, #B13'],
    recommendedAction: '增加抽检比例至15%，关注工艺参数波动',
    predictedArrivalDate: '2025/06/05',
    riskLevel: '高',
    impactScope: '预计影响5个批次，约2500件'
  },
  {
    materialCode: '37208631',
    materialName: '按键',
    batchId: '#C15',
    supplier: '金盾',
    predictedResult: '有条件接收',
    predictedDefectRate: 35,
    predictedDefectTypes: [
      { type: '尺寸偏差', probability: 0.65 },
      { type: '表面划痕', probability: 0.25 },
      { type: '卡顿', probability: 0.10 }
    ],
    confidence: 82,
    similarHistoricalBatches: ['#B10'],
    recommendedAction: '加强高度和力度检验项目',
    predictedArrivalDate: '2025/06/03',
    riskLevel: '中',
    impactScope: '预计影响2个批次，约800件'
  },
  // ... 更多预测数据
];

// 异常告警数据
export const alertsData = [
  {
    time: '2025-05-26 09:23:45',
    level: '严重',
    type: '可靠性',
    device: '电池盖(37301062)',
    message: '连续开合耐久性测试未达标准，不良率66.7%',
    isPredictive: false,
    id: 'ALT20250526001',
    relatedMaterial: '37301062',
    source: 'IQC测试',
    status: '未处理',
    assignee: '李强',
    deadline: '2025-05-28',
    processingSteps: [
      { step: '隔离不良批次', status: '已完成' },
      { step: '联系供应商', status: '进行中' },
      { step: '安排返工计划', status: '未开始' }
    ]
  },
  {
    time: '2025-05-25 10:15:22',
    level: '严重',
    type: '外观',
    device: '保护膜(38501375)',
    message: '酒精耐磨测试不良，掉漆率100%',
    isPredictive: false,
    id: 'ALT20250525001',
    relatedMaterial: '38501375',
    source: '实验室检测',
    status: '处理中',
    assignee: '张明',
    deadline: '2025-05-27',
    processingSteps: [
      { step: '隔离不良批次', status: '已完成' },
      { step: '联系供应商', status: '已完成' },
      { step: '申请物料退货', status: '进行中' }
    ]
  },
  {
    time: '2025-05-30 08:30:00',
    level: '警告',
    type: '可靠性',
    device: '保护膜(38501375)',
    message: '预测批次#D22, #D23存在58%的耐磨不良风险',
    isPredictive: true,
    id: 'ALT20250530001',
    relatedMaterial: '38501375',
    source: 'AI预测系统',
    status: '监控中',
    assignee: '王芳',
    deadline: '2025-06-05',
    processingSteps: [
      { step: '通知供应商', status: '已完成' },
      { step: '调整检验计划', status: '进行中' },
      { step: '准备备用方案', status: '未开始' }
    ]
  },
  // ... 扩展更多告警数据
];

// 检测参数数据 - 用于批次对比分析
export const batchComparisonData = {
  '38501375': {  // 保护膜
    batches: ['#03, #04', '#B12, #B13', '#C09'],
    parameters: {
      standard: {
        耐磨性: 90,
        附着力: 90,
        耐化学性: 90,
        硬度: 90,
        光泽度: 90
      },
      '#03, #04': {
        耐磨性: 45,
        附着力: 60,
        耐化学性: 75,
        硬度: 85,
        光泽度: 70
      },
      '#B12, #B13': {
        耐磨性: 85,
        附着力: 90,
        耐化学性: 92,
        硬度: 88,
        光泽度: 85
      },
      '#C09': {
        耐磨性: 80,
        附着力: 88,
        耐化学性: 90,
        硬度: 85,
        光泽度: 82
      }
    },
    analysisText: '通过对比分析发现，不良批次与合格批次在原材料供应商和生产参数上存在显著差异。批次#03, #04使用了新供应商的原材料，且生产温度比正常批次低5℃。',
    insights: ['温度参数偏低', '油墨配方变更', '原材料来源变更']
  },
  '37301062': {  // 电池盖
    batches: ['#A22, #A23', '#B15, #B16', '#C12'],
    parameters: {
      standard: {
        强度: 90,
        耐久性: 90,
        尺寸精度: 90,
        表面质量: 90,
        材料均匀性: 90
      },
      '#A22, #A23': {
        强度: 65,
        耐久性: 45,
        尺寸精度: 80,
        表面质量: 75,
        材料均匀性: 60
      },
      '#B15, #B16': {
        强度: 88,
        耐久性: 85,
        尺寸精度: 90,
        表面质量: 85,
        材料均匀性: 88
      },
      '#C12': {
        强度: 86,
        耐久性: 82,
        尺寸精度: 88,
        表面质量: 90,
        材料均匀性: 85
      }
    },
    analysisText: '批次#A22, #A23的耐久性表现显著低于标准，主要原因是模具磨损导致成型精度下降，同时原材料批次变更未经充分验证。',
    insights: ['模具老化', '材料配比偏差', '注塑参数不稳定']
  },
  // ... 更多批次对比数据
};

// 风险分析数据
export const riskAnalysisData = {
  '38501375': {  // 保护膜
    materialName: '保护膜',
    riskLevel: '高',
    riskScore: 92,
    riskImpactScope: '可能影响在产5个批次，约2500件',
    riskConfidence: 87,
    riskFactors: [
      { name: '供应商历史表现', value: 75, color: '#F56C6C', description: '该供应商近3个月有2次类似不良记录' },
      { name: '材料批次一致性', value: 65, color: '#E6A23C', description: '检测到批次间参数波动较大' },
      { name: '工艺稳定性', value: 45, color: '#409EFF', description: '生产参数较为稳定但有波动' },
      { name: '测试方法适用性', value: 25, color: '#67C23A', description: '测试方法已验证有效' },
      { name: '环境因素影响', value: 35, color: '#909399', description: '季节性因素可能影响材料特性' }
    ],
    recommendations: [
      { title: '增加抽样频率', description: '对该批次保护膜增加抽样检验频率至15%，关注酒精耐磨和附着力测试项目', priority: '高' },
      { title: '供应商审核', description: '安排质量工程师对易湛供应商进行专项工艺审核，重点关注原材料变更和生产参数控制', priority: '中' },
      { title: '测试方法优化', description: '建议优化耐磨测试方法，增加耐久性评估维度，更准确反映实际使用场景', priority: '低' }
    ]
  },
  '37301062': {  // 电池盖
    materialName: '电池盖',
    riskLevel: '中',
    riskScore: 78,
    riskImpactScope: '可能影响在产3个批次，约1500台',
    riskConfidence: 82,
    riskFactors: [
      { name: '供应商历史表现', value: 60, color: '#F56C6C', description: '该供应商近6个月有1次类似不良记录' },
      { name: '材料批次一致性', value: 70, color: '#E6A23C', description: '检测到批次间尺寸波动' },
      { name: '工艺稳定性', value: 65, color: '#409EFF', description: '注塑参数波动较大' },
      { name: '测试方法适用性', value: 30, color: '#67C23A', description: '测试方法已验证有效' },
      { name: '环境因素影响', value: 25, color: '#909399', description: '温度波动对材料影响较小' }
    ],
    recommendations: [
      { title: '调整注塑参数', description: '建议供应商调整注塑温度和压力参数，提高结构稳定性', priority: '高' },
      { title: '增加抽检比例', description: '将抽检比例从2%提高到8%，重点关注开合耐久性测试', priority: '中' },
      { title: '模具维护', description: '建议供应商对模具进行全面检查和维护，确保尺寸精度', priority: '中' }
    ]
  },
  // ... 更多风险分析数据
};

// 统计卡片数据
export const statCardsData = {
  monitoring: [
    { 
      icon: 'DataLine', 
      label: '日检量', 
      value: '385', 
      type: 'production',
      trend: 'up',
      change: '8.6%'
    },
    { 
      icon: 'Check', 
      label: '来料合格率', 
      value: '93.2%', 
      type: 'quality',
      trend: 'down',
      change: '2.8%'
    },
    { 
      icon: 'Warning', 
      label: '待处理异常', 
      value: '17', 
      type: 'alert',
      trend: 'up',
      change: '5个'
    },
    { 
      icon: 'Timer', 
      label: '平均检验周期', 
      value: '2.5d', 
      type: 'time',
      trend: 'down',
      change: '0.8d'
    }
  ],
  lab: [
    { 
      icon: 'DataAnalysis', 
      label: '本月检测总数', 
      value: '172', 
      type: 'primary',
      trend: 'up',
      change: '12.5%'
    },
    { 
      icon: 'Warning', 
      label: '不良项检出', 
      value: '43', 
      type: 'danger',
      trend: 'up',
      change: '8.2%'
    },
    { 
      icon: 'Odometer', 
      label: '平均处理周期', 
      value: '2.3天', 
      type: 'warning',
      trend: 'down',
      change: '0.5天'
    },
    { 
      icon: 'Reading', 
      label: '未处理报告', 
      value: '7', 
      type: 'info',
      trend: 'down',
      change: '2份'
    }
  ]
};

// 趋势分析数据
export const trendAnalysisData = {
  weekly: {
    dates: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    total: [350, 410, 375, 390, 450, 320, 385],
    passed: [325, 385, 342, 350, 408, 295, 359],
    failed: [25, 25, 33, 40, 42, 25, 26],
    prediction: [null, null, null, null, null, null, 26, 35, 48]
  },
  monthly: {
    dates: ['第1周', '第2周', '第3周', '第4周', '第5周'],
    total: [1750, 1820, 1910, 1880, 1950],
    passed: [1645, 1710, 1775, 1738, 1802],
    failed: [105, 110, 135, 142, 148],
    prediction: [null, null, null, null, 148, 160, 175]
  },
  quarterly: {
    dates: ['1月', '2月', '3月', '4月', '5月', '6月'],
    total: [7500, 7680, 7820, 7950, 8100, null],
    passed: [6975, 7142, 7273, 7392, 7533, null],
    failed: [525, 538, 547, 558, 567, null],
    prediction: [null, null, null, null, 567, 580, 595]
  }
};

// 导出所有数据
export default {
  materialMasterData,
  supplierData,
  factoryData,
  materialBatchData,
  labTestData,
  productionAnomalies,
  qualityPredictionData,
  alertsData,
  batchComparisonData,
  riskAnalysisData,
  statCardsData,
  trendAnalysisData
}; 