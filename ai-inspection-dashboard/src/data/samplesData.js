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
  
  // 新增物料批次数据，与测试数据和产线数据保持一致
  {
    materialCode: 'M10000123',
    materialName: '电阻-0402-10K',
    project: 'MI-P789智能手机',
    batchId: 'ER20231001001',
    inspectionDate: '2023-10-15',
    result: '合格',
    defectRate: '0%',
    supplier: '欧菲光科技',
    status: '已入库',
    riskScore: 5,
    isHighRisk: false,
    location: '原材料仓-A-12-03',
    inspector: '刘强',
    defectType: '',
    defectDescription: '',
    images: [],
    relatedRecords: ['IQC-20231015-032'],
    specification: '0402尺寸 10K欧姆 1%误差',
    category: '电子元件',
    quantity: 50000,
    unit: '个',
    useQuantity: 4500,
    remainQuantity: 45500,
    shelfLife: '2024-10-15'
  },
  {
    materialCode: 'M10000456',
    materialName: '电容-0402-22uF',
    project: 'MI-P789智能手机',
    batchId: 'EC20231001005',
    inspectionDate: '2023-10-16',
    result: '合格',
    defectRate: '6.7%',
    supplier: '立讯精密',
    status: '已入库',
    riskScore: 15,
    isHighRisk: false,
    location: '原材料仓-A-12-04',
    inspector: '刘强',
    defectType: '电气性能',
    defectDescription: '高温下容值偏移',
    images: [],
    relatedRecords: ['IQC-20231016-045'],
    specification: '0402尺寸 22微法 10%误差',
    category: '电子元件',
    quantity: 60000,
    unit: '个',
    useQuantity: 5200,
    remainQuantity: 54800,
    shelfLife: '2024-10-16'
  },
  {
    materialCode: 'M10000789',
    materialName: 'IC-主控芯片-S5350',
    project: 'MI-P789智能手机',
    batchId: 'IC20231005012',
    inspectionDate: '2023-10-18',
    result: '合格',
    defectRate: '0%',
    supplier: '联发科技',
    status: '已入库',
    riskScore: 8,
    isHighRisk: false,
    location: '原材料仓-B-03-01',
    inspector: '张伟',
    defectType: '',
    defectDescription: '',
    images: [],
    relatedRecords: ['IQC-20231018-078'],
    specification: '手机主板主控芯片 S5350型号',
    category: '电子元件',
    quantity: 8000,
    unit: '个',
    useQuantity: 760,
    remainQuantity: 7240,
    shelfLife: '2025-10-18'
  },
  {
    materialCode: 'M40000321',
    materialName: 'PCB-手机主板-MT6582',
    project: 'MI-P789智能手机',
    batchId: 'PCB20231010023',
    inspectionDate: '2023-10-25',
    result: '有条件接收',
    defectRate: '30%',
    supplier: '鹏鼎控股',
    status: '有条件使用',
    riskScore: 45,
    isHighRisk: false,
    location: '原材料仓-C-05-02',
    inspector: '张伟',
    defectType: '结构',
    defectDescription: '层间连接点有微小异常',
    images: [
      '/src/assets/demo/pcb-layer-test.jpg'
    ],
    relatedRecords: ['IQC-20231025-102'],
    specification: '8层PCB 手机主板 MT6582型号',
    category: '晶片类',
    quantity: 3000,
    unit: '片',
    useQuantity: 280,
    remainQuantity: 2720,
    shelfLife: '2024-04-25'
  },
  {
    materialCode: 'M70000567',
    materialName: '焊锡膏-SAC305',
    project: 'MI-P789智能手机',
    batchId: 'SJ20231015008',
    inspectionDate: '2023-10-20',
    result: '合格',
    defectRate: '6.7%',
    supplier: '信利光电',
    status: '已入库',
    riskScore: 20,
    isHighRisk: false,
    location: '辅料仓-D-01-05',
    inspector: '黄晓',
    defectType: '物理性能',
    defectDescription: '粘度稍低但在工艺可接受范围',
    images: [],
    relatedRecords: ['IQC-20231020-098'],
    specification: '无铅环保型 SAC305合金成分',
    category: '辅料/包材',
    quantity: 500,
    unit: '罐',
    useQuantity: 45,
    remainQuantity: 455,
    shelfLife: '2024-01-20'
  },
  {
    materialCode: 'M60000450',
    materialName: '电池-A52-5000mAh',
    project: 'HF-Battery Ultra',
    batchId: 'BAT20231008025',
    inspectionDate: '2023-10-22',
    result: '合格',
    defectRate: '16.7%',
    supplier: '新能源科技',
    status: '已入库',
    riskScore: 25,
    isHighRisk: false,
    location: '电池仓-E-02-08',
    inspector: '张宇',
    defectType: '性能',
    defectDescription: '个别样品循环寿命略低',
    images: [
      '/src/assets/demo/battery-test.jpg'
    ],
    relatedRecords: ['IQC-20231022-123'],
    specification: '聚合物锂电池 5000mAh 3.85V',
    category: '电池类',
    quantity: 2000,
    unit: '个',
    useQuantity: 580,
    remainQuantity: 1420,
    shelfLife: '2024-10-22'
  },
  {
    materialCode: 'M30000620',
    materialName: 'CMOS传感器-IMX766',
    project: 'GZ-Camera Plus',
    batchId: 'IMX20231015088',
    inspectionDate: '2023-10-18',
    result: '合格',
    defectRate: '10%',
    supplier: '索尼半导体',
    status: '已入库',
    riskScore: 15,
    isHighRisk: false,
    location: '电子仓-F-01-12',
    inspector: '黄志',
    defectType: '性能',
    defectDescription: '极低光环境下有轻微噪点',
    images: [
      '/src/assets/demo/cmos-test.jpg'
    ],
    relatedRecords: ['IQC-20231018-156'],
    specification: '5000万像素 1/1.56英寸 2.0μm',
    category: '摄像头元件',
    quantity: 1000,
    unit: '个',
    useQuantity: 220,
    remainQuantity: 780,
    shelfLife: '2025-10-18'
  },
  {
    materialCode: 'M30000720',
    materialName: '广角镜头-L7',
    project: 'GZ-Camera Plus',
    batchId: 'LNS20231010056',
    inspectionDate: '2023-10-15',
    result: '合格',
    defectRate: '0%',
    supplier: '舜宇光学',
    status: '已入库',
    riskScore: 5,
    isHighRisk: false,
    location: '光学仓-G-02-09',
    inspector: '李杰',
    defectType: '',
    defectDescription: '',
    images: [
      '/src/assets/demo/lens-test.jpg'
    ],
    relatedRecords: ['IQC-20231015-178'],
    specification: '广角镜头 120°视场角 F1.6光圈',
    category: '光学元件',
    quantity: 1200,
    unit: '个',
    useQuantity: 180,
    remainQuantity: 1020,
    shelfLife: '2025-10-15'
  }
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
  
  // 新增与上线跟踪和库存模块共用的物料测试数据
  {
    id: 'LT2023110501',
    testDate: '2023/11/05',
    testSource: '深圳实验室材料性能测试',
    project: 'MI-P789智能手机',
    materialCode: 'M10000123',
    materialName: '电阻-0402-10K',
    testItem: '电阻值精度与稳定性测试',
    result: '合格',
    badBatch: '',
    defectRate: '0/12 (0%)',
    supplier: '欧菲光科技',
    responsibility: '常规测试',
    recommendation: '批次合格，可正常使用',
    remarks: '符合项目技术要求，抽样测试12个样品均在公差范围内',
    relatedRecords: ['IQC-20231015-032', 'QC-20231101-005'],
    images: [],
    testProcedure: '按照QATS-R0402-001测试规范执行',
    testEquipment: ['高精度电桥#LCR-089', '环境模拟箱#ET-105'],
    testParameters: {
      测试电压: '1.0V',
      温度循环: '-20°C~85°C',
      循环次数: 5,
      测试点数: 12
    },
    tester: '刘强',
    reviewer: '王雪'
  },
  {
    id: 'LT2023102801',
    testDate: '2023/10/28',
    testSource: '深圳实验室材料性能测试',
    project: 'MI-P789智能手机',
    materialCode: 'M10000456',
    materialName: '电容-0402-22uF',
    testItem: '容值精度与温度特性测试',
    result: '合格',
    badBatch: '',
    defectRate: '1/15 (6.7%)',
    supplier: '立讯精密',
    responsibility: '常规测试',
    recommendation: '批次合格，但建议加强高温稳定性抽检',
    remarks: '15个样品中有1个在85°C高温下容值偏移达到12%，接近但未超出边界值',
    relatedRecords: ['IQC-20231016-045', 'QC-20231101-008'],
    images: [],
    testProcedure: '按照QATS-C0402-002测试规范执行',
    testEquipment: ['高精度电桥#LCR-089', '环境模拟箱#ET-105'],
    testParameters: {
      测试频率: '1kHz',
      温度范围: '-40°C~85°C',
      温度步进: '20°C',
      湿度: '60%RH'
    },
    tester: '刘强',
    reviewer: '王雪'
  },
  {
    id: 'LT2023102001',
    testDate: '2023/10/20',
    testSource: '材料可靠性实验室',
    project: 'MI-P789智能手机',
    materialCode: 'M10000789',
    materialName: 'IC-主控芯片-S5350',
    testItem: '高温工作稳定性测试',
    result: '合格',
    badBatch: '',
    defectRate: '0/8 (0%)',
    supplier: '联发科技',
    responsibility: '高可靠性验证',
    recommendation: '批次合格，可正常使用',
    remarks: '72小时高温连续工作测试通过，性能指标稳定',
    relatedRecords: ['IQC-20231018-078', 'QC-20231101-012'],
    images: [],
    testProcedure: '按照QATS-IC5350-005测试规范执行',
    testEquipment: ['高温老化箱#HT-056', '性能测试仪#PT-108'],
    testParameters: {
      工作温度: '85°C',
      工作时间: '72小时',
      负载条件: '满载',
      样品数量: 8
    },
    tester: '张伟',
    reviewer: '李明'
  },
  {
    id: 'LT2023102501',
    testDate: '2023/10/25',
    testSource: '材料可靠性实验室',
    project: 'MI-P789智能手机',
    materialCode: 'M40000321',
    materialName: 'PCB-手机主板-MT6582',
    testItem: 'PCB多层结构可靠性测试',
    result: '有条件接收',
    badBatch: '',
    defectRate: '3/10 (30%)',
    supplier: '鹏鼎控股',
    responsibility: '供应商质量改进',
    recommendation: '加强生产过程控制，严格执行层间检查',
    remarks: '热应力测试后发现少量样品层间连接点有微小异常，未达到拒收标准但需关注',
    relatedRecords: ['IQC-20231025-102', 'QC-20231101-020'],
    images: [
      { url: '/src/assets/demo/pcb-layer-test.jpg', caption: 'PCB层间微观检测图' }
    ],
    testProcedure: '按照QATS-PCB8L-003测试规范执行',
    testEquipment: ['冷热冲击箱#TS-072', 'X射线检测仪#XR-023'],
    testParameters: {
      温度范围: '-40°C~125°C',
      循环次数: 300,
      转换时间: '<2分钟',
      检测方法: 'X射线透视+剖切分析'
    },
    tester: '张伟',
    reviewer: '李明'
  },
  {
    id: 'LT2023102101',
    testDate: '2023/10/21',
    testSource: '深圳实验室材料特性测试',
    project: 'MI-P789智能手机',
    materialCode: 'M70000567',
    materialName: '焊锡膏-SAC305',
    testItem: '焊锡膏粘度与焊接强度测试',
    result: '合格',
    badBatch: '',
    defectRate: '1/15 (6.7%)',
    supplier: '信利光电',
    responsibility: '常规测试',
    recommendation: '批次合格，注意存储温度控制',
    remarks: '焊接强度测试结果良好，粘度稍低但在工艺可接受范围内',
    relatedRecords: ['IQC-20231020-098', 'QC-20231101-025'],
    images: [],
    testProcedure: '按照QATS-SOL305-002测试规范执行',
    testEquipment: ['粘度计#VS-038', '焊接强度测试仪#ST-067'],
    testParameters: {
      测试温度: '25±1°C',
      剪切速率: '5/s',
      回流焊参数: '标准SAC305曲线',
      测试周期: '0h, 8h, 24h'
    },
    tester: '黄晓',
    reviewer: '陈强'
  },
  {
    id: 'LT2023101001',
    testDate: '2023/10/10',
    testSource: '材料分析中心',
    project: 'HF-Battery Ultra',
    materialCode: 'M60000450',
    materialName: '电池-A52-5000mAh',
    testItem: '电池容量与充放电循环测试',
    result: '合格',
    badBatch: '',
    defectRate: '2/12 (16.7%)',
    supplier: '新能源科技',
    responsibility: '常规测试',
    recommendation: '批次合格，重点监控循环寿命性能',
    remarks: '实测容量符合规格要求，300次循环后容量保持率达到标准，个别样品循环寿命略低',
    relatedRecords: ['IQC-20231022-123', 'QB-20231025-007'],
    images: [
      { url: '/src/assets/demo/battery-test.jpg', caption: '电池循环测试曲线' }
    ],
    testProcedure: '按照QATS-BAT5000-008测试规范执行',
    testEquipment: ['电池测试系统#BTS-120', '环境模拟箱#ET-105'],
    testParameters: {
      充电电流: '0.5C',
      放电电流: '1.0C',
      充电截止电压: '4.35V',
      放电截止电压: '3.2V',
      循环次数: 300,
      温度: '25°C'
    },
    tester: '张宇',
    reviewer: '王丽'
  },
  {
    id: 'LT2023110201',
    testDate: '2023/11/02',
    testSource: '物理性能实验室',
    project: 'GZ-Camera Plus',
    materialCode: 'M30000620',
    materialName: 'CMOS传感器-IMX766',
    testItem: '图像质量与低光性能测试',
    result: '合格',
    badBatch: '',
    defectRate: '1/10 (10%)',
    supplier: '索尼半导体',
    responsibility: '高端器件验证',
    recommendation: '批次合格，可用于高端型号',
    remarks: '10个样品中有1个在极低光环境下有轻微噪点，但整体性能优异',
    relatedRecords: ['IQC-20231018-156', 'QI-20231101-030'],
    images: [
      { url: '/src/assets/demo/cmos-test.jpg', caption: '低光环境成像测试' }
    ],
    testProcedure: '按照QATS-IMX766-010测试规范执行',
    testEquipment: ['图像质量分析仪#IQA-058', '标准光源箱#LSB-023'],
    testParameters: {
      测试环境: '1lux-1000lux分级测试',
      测试图卡: 'ISO12233标准卡',
      信噪比阈值: '>32dB@100lux',
      动态范围: '>12EV'
    },
    tester: '黄志',
    reviewer: '刘芳'
  },
  {
    id: 'LT2023102301',
    testDate: '2023/10/23',
    testSource: '综合性能实验室',
    project: 'GZ-Camera Plus',
    materialCode: 'M30000720',
    materialName: '广角镜头-L7',
    testItem: '光学性能综合测试',
    result: '合格',
    badBatch: '',
    defectRate: '0/8 (0%)',
    supplier: '舜宇光学',
    responsibility: '常规测试',
    recommendation: '批次合格，所有样品性能一致性良好',
    remarks: '边缘锐度和畸变控制表现优异，中心分辨率达到设计指标',
    relatedRecords: ['IQC-20231015-178', 'QO-20231018-022'],
    images: [
      { url: '/src/assets/demo/lens-test.jpg', caption: '镜头MTF测试结果' }
    ],
    testProcedure: '按照QATS-L7WA-005测试规范执行',
    testEquipment: ['光学测试台#OTB-089', '畸变测量仪#DM-045'],
    testParameters: {
      测试焦距: '16mm',
      光圈: 'F1.6-F11',
      视场角: '120°',
      测试距离: '0.1m-∞',
      环境温度: '25±2°C'
    },
    tester: '李杰',
    reviewer: '王成'
  }
  // ... 更多测试数据
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
  
  // 新增通用物料预测数据
  {
    materialCode: 'M10000456',
    materialName: '电容-0402-22uF',
    batchId: 'EC20231205001',
    supplier: '立讯精密',
    predictedResult: '有条件接收',
    predictedDefectRate: 22,
    predictedDefectTypes: [
      { type: '高温容值偏移', probability: 0.78 },
      { type: '焊接性能不良', probability: 0.15 },
      { type: '外观缺陷', probability: 0.07 }
    ],
    confidence: 85,
    similarHistoricalBatches: ['EC20231001005'],
    recommendedAction: '进厂后需加强高温测试和焊接测试项目',
    predictedArrivalDate: '2023/12/10',
    riskLevel: '中',
    impactScope: '预计影响1个生产批次，约6000片主板'
  },
  {
    materialCode: 'M40000321',
    materialName: 'PCB-手机主板-MT6582',
    batchId: 'PCB20231125033',
    supplier: '鹏鼎控股',
    predictedResult: '可能风险',
    predictedDefectRate: 28,
    predictedDefectTypes: [
      { type: '层间连接可靠性', probability: 0.65 },
      { type: '焊盘剥离', probability: 0.25 },
      { type: '线路变形', probability: 0.10 }
    ],
    confidence: 78,
    similarHistoricalBatches: ['PCB20231010023'],
    recommendedAction: '严格执行PCB层间连接可靠性测试，增加抽检比例',
    predictedArrivalDate: '2023/11/30',
    riskLevel: '中',
    impactScope: '预计影响2个批次，约1800片'
  },
  {
    materialCode: 'M70000567',
    materialName: '焊锡膏-SAC305',
    batchId: 'SJ20231120015',
    supplier: '信利光电',
    predictedResult: '合格',
    predictedDefectRate: 8,
    predictedDefectTypes: [
      { type: '粘度不稳定', probability: 0.60 },
      { type: '储存时间超期', probability: 0.25 },
      { type: '杂质', probability: 0.15 }
    ],
    confidence: 92,
    similarHistoricalBatches: ['SJ20231015008'],
    recommendedAction: '建议提前制定备选焊锡方案，加强到货验收检测',
    predictedArrivalDate: '2023/11/25',
    riskLevel: '低',
    impactScope: '预计影响少量生产批次，不影响整体产能'
  },
  {
    materialCode: 'M60000450',
    materialName: '电池-A52-5000mAh',
    batchId: 'BAT20231208036',
    supplier: '新能源科技',
    predictedResult: '需要重点关注',
    predictedDefectRate: 15,
    predictedDefectTypes: [
      { type: '循环寿命不足', probability: 0.55 },
      { type: '低温性能差', probability: 0.30 },
      { type: '自放电率高', probability: 0.15 }
    ],
    confidence: 82,
    similarHistoricalBatches: ['BAT20231008025'],
    recommendedAction: '增加循环寿命和低温性能测试项目，加强电池管理系统优化',
    predictedArrivalDate: '2023/12/15',
    riskLevel: '中',
    impactScope: '预计影响部分高端型号，约1000台设备'
  }
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
      label: '本月测试批次', 
      value: '172', 
      type: 'primary',
      trend: 'up',
      change: '12.5%'
    },
    { 
      icon: 'Warning', 
      label: '不合格物料', 
      value: '43', 
      type: 'danger',
      trend: 'up',
      change: '8.2%'
    },
    { 
      icon: 'Odometer', 
      label: '平均测试周期', 
      value: '2.3天', 
      type: 'warning',
      trend: 'down',
      change: '0.5天'
    },
    { 
      icon: 'Reading', 
      label: '待确认批次', 
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