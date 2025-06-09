/**
 * 模拟数据源
 * 提供系统所需的各类模拟数据，后期可替换为API调用
 */
import { MaterialModel, InspectionResultModel, LabTestModel, QualityExceptionModel } from './models';

// 物料数据
export const materials = [
  {
    ...MaterialModel,
    code: 'M2023-001',
    name: '高强度钢材A',
    type: '原材料',
    status: '正常',
    inventory: '2300kg',
    supplier: '钢铁供应商A',
    batchCode: 'B20230601',
    createdAt: '2023-06-01',
    updatedAt: '2023-10-15'
  },
  {
    ...MaterialModel,
    code: 'M2023-002',
    name: '铝合金板材B',
    type: '原材料',
    status: '正常',
    inventory: '1200kg',
    supplier: '金属制品厂B',
    batchCode: 'B20230705',
    createdAt: '2023-07-05',
    updatedAt: '2023-10-10'
  },
  {
    ...MaterialModel,
    code: 'M2023-003',
    name: '塑料颗粒C',
    type: '原材料',
    status: '缺货',
    inventory: '850kg',
    supplier: '化工原料厂C',
    batchCode: 'B20230810',
    createdAt: '2023-08-10',
    updatedAt: '2023-10-12'
  },
  {
    ...MaterialModel,
    code: 'M2023-004',
    name: '紧固件D',
    type: '零件',
    status: '正常',
    inventory: '12000个',
    supplier: '五金制品厂D',
    batchCode: 'B20230915',
    createdAt: '2023-09-15',
    updatedAt: '2023-10-05'
  },
  {
    ...MaterialModel,
    code: 'M2023-005',
    name: '电子元件E',
    type: '零件',
    status: '待检',
    inventory: '5600个',
    supplier: '电子科技公司E',
    batchCode: 'B20230922',
    createdAt: '2023-09-22',
    updatedAt: '2023-10-01'
  },
  {
    ...MaterialModel,
    code: 'M2023-006',
    name: '密封圈F',
    type: '零件',
    inventory: '8900个',
    status: '正常',
    supplier: '橡胶制品厂F',
    batchCode: 'B20230928',
    createdAt: '2023-09-28',
    updatedAt: '2023-10-15'
  },
  {
    ...MaterialModel,
    code: 'M2023-007',
    name: '轴承G',
    type: '组件',
    status: '正常',
    inventory: '760个',
    supplier: '机械零件厂G',
    batchCode: 'B20231005',
    createdAt: '2023-10-05',
    updatedAt: '2023-10-15'
  },
  {
    ...MaterialModel,
    code: 'M2023-008',
    name: '电机H',
    type: '组件',
    status: '缺货',
    inventory: '320个',
    supplier: '电气设备厂H',
    batchCode: 'B20231010',
    createdAt: '2023-10-10',
    updatedAt: '2023-10-15'
  },
  {
    ...MaterialModel,
    code: 'M2023-009',
    name: '控制板I',
    type: '组件',
    status: '正常',
    inventory: '450个',
    supplier: '电路板厂I',
    batchCode: 'B20231015',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15'
  }
];

// 质量检验结果数据
export const inspectionResults = [
  {
    ...InspectionResultModel,
    id: 'IR001',
    materialCode: 'M2023-001',
    batchCode: 'B20230601',
    inspectionType: '来料检验',
    result: '合格',
    score: 95,
    defectRate: 0.5,
    inspectorId: 'INS001',
    inspectionTime: '2023-06-02',
    remarks: '符合标准要求',
    parameters: [
      { name: '硬度', value: 780, unit: 'HV', standard: '≥750' },
      { name: '抗拉强度', value: 1050, unit: 'MPa', standard: '≥1000' },
      { name: '厚度公差', value: 0.02, unit: 'mm', standard: '±0.05' }
    ]
  },
  {
    ...InspectionResultModel,
    id: 'IR002',
    materialCode: 'M2023-002',
    batchCode: 'B20230705',
    inspectionType: '来料检验',
    result: '合格',
    score: 92,
    defectRate: 0.8,
    inspectorId: 'INS002',
    inspectionTime: '2023-07-06',
    remarks: '部分表面有轻微划痕，不影响使用',
    parameters: [
      { name: '硬度', value: 95, unit: 'HB', standard: '90-120' },
      { name: '平整度', value: 0.15, unit: 'mm', standard: '≤0.2' },
      { name: '厚度', value: 3.02, unit: 'mm', standard: '3±0.05' }
    ]
  },
  {
    ...InspectionResultModel,
    id: 'IR003',
    materialCode: 'M2023-003',
    batchCode: 'B20230810',
    inspectionType: '来料检验',
    result: '不合格',
    score: 62,
    defectRate: 3.5,
    inspectorId: 'INS001',
    inspectionTime: '2023-08-11',
    remarks: '熔点低于标准，有杂质',
    parameters: [
      { name: '熔点', value: 175, unit: '°C', standard: '≥185' },
      { name: '密度', value: 0.92, unit: 'g/cm³', standard: '0.92-0.94' },
      { name: '杂质含量', value: 2.5, unit: '%', standard: '≤1.0' }
    ]
  },
  {
    ...InspectionResultModel,
    id: 'IR004',
    materialCode: 'M2023-004',
    batchCode: 'B20230915',
    inspectionType: '来料检验',
    result: '合格',
    score: 98,
    defectRate: 0.1,
    inspectorId: 'INS003',
    inspectionTime: '2023-09-16',
    remarks: '质量稳定，尺寸精准',
    parameters: [
      { name: '硬度', value: 28, unit: 'HRC', standard: '≥25' },
      { name: '抗剪强度', value: 820, unit: 'MPa', standard: '≥800' },
      { name: '尺寸公差', value: 0.01, unit: 'mm', standard: '±0.02' }
    ]
  },
  {
    ...InspectionResultModel,
    id: 'IR005',
    materialCode: 'M2023-005',
    batchCode: 'B20230922',
    inspectionType: '来料检验',
    result: '待检',
    score: 0,
    defectRate: 0,
    inspectorId: '',
    inspectionTime: '',
    remarks: '等待检验',
    parameters: []
  }
];

// 实验室测试数据
export const labTests = [
  {
    ...LabTestModel,
    id: 'LT001',
    materialCode: 'M2023-001',
    batchCode: 'B20230601',
    testType: '物理性能测试',
    testResult: '合格',
    status: '已完成',
    tester: 'LAB001',
    testTime: '2023-06-03',
    conclusion: '所有指标符合设计要求',
    parameters: [
      { name: '屈服强度', value: 980, unit: 'MPa', standard: '≥950' },
      { name: '延展性', value: 15, unit: '%', standard: '≥12' },
      { name: '冲击值', value: 75, unit: 'J', standard: '≥70' }
    ]
  },
  {
    ...LabTestModel,
    id: 'LT002',
    materialCode: 'M2023-002',
    batchCode: 'B20230705',
    testType: '物理性能测试',
    testResult: '合格',
    status: '已完成',
    tester: 'LAB002',
    testTime: '2023-07-08',
    conclusion: '性能满足要求，表面处理需改进',
    parameters: [
      { name: '弹性模量', value: 70.5, unit: 'GPa', standard: '68-72' },
      { name: '抗拉强度', value: 310, unit: 'MPa', standard: '≥300' },
      { name: '腐蚀测试', value: '合格', unit: '', standard: '48h无腐蚀' }
    ]
  },
  {
    ...LabTestModel,
    id: 'LT003',
    materialCode: 'M2023-003',
    batchCode: 'B20230810',
    testType: '材料成分分析',
    testResult: '不合格',
    status: '已完成',
    tester: 'LAB001',
    testTime: '2023-08-12',
    conclusion: '添加剂含量不达标，存在安全隐患',
    parameters: [
      { name: '碳酸钙含量', value: 32, unit: '%', standard: '≤25' },
      { name: '阻燃性', value: '不合格', unit: '', standard: 'UL94-V0' },
      { name: '挥发性物质', value: 1.2, unit: '%', standard: '≤1.0' }
    ]
  }
];

// 质量异常记录
export const qualityExceptions = [
  {
    ...QualityExceptionModel,
    id: 'QE001',
    materialCode: 'M2023-003',
    batchCode: 'B20230810',
    exceptionType: '材料性能不达标',
    severity: '严重',
    location: '原材料库',
    discoveryTime: '2023-08-11',
    reporter: 'INS001',
    status: '处理中',
    solution: '已通知供应商，等待替换批次',
    resolveTime: ''
  },
  {
    ...QualityExceptionModel,
    id: 'QE002',
    materialCode: 'M2023-002',
    batchCode: 'B20230705',
    exceptionType: '表面缺陷',
    severity: '轻微',
    location: '加工车间',
    discoveryTime: '2023-07-15',
    reporter: 'PROD002',
    status: '已解决',
    solution: '通过打磨处理解决表面缺陷',
    resolveTime: '2023-07-16'
  },
  {
    ...QualityExceptionModel,
    id: 'QE003',
    materialCode: 'M2023-008',
    batchCode: 'B20231010',
    exceptionType: '电气参数异常',
    severity: '中等',
    location: '装配线',
    discoveryTime: '2023-10-12',
    reporter: 'PROD005',
    status: '待处理',
    solution: '',
    resolveTime: ''
  }
];

// 质量数据统计
export const qualityStatistics = {
  daily: {
    period: '今日',
    passRate: 96.5,
    averageScore: 91.2,
    exceptionCount: 3,
    materialCoverage: 85.5,
    trends: [
      { time: '08:00', passRate: 97.0 },
      { time: '10:00', passRate: 96.8 },
      { time: '12:00', passRate: 96.2 },
      { time: '14:00', passRate: 96.0 },
      { time: '16:00', passRate: 96.5 },
      { time: '18:00', passRate: 97.2 }
    ]
  },
  weekly: {
    period: '本周',
    passRate: 95.8,
    averageScore: 90.5,
    exceptionCount: 12,
    materialCoverage: 86.2,
    trends: [
      { time: '周一', passRate: 96.2 },
      { time: '周二', passRate: 95.8 },
      { time: '周三', passRate: 95.5 },
      { time: '周四', passRate: 96.0 },
      { time: '周五', passRate: 95.8 }
    ]
  },
  monthly: {
    period: '本月',
    passRate: 94.5,
    averageScore: 89.8,
    exceptionCount: 42,
    materialCoverage: 87.6,
    trends: [
      { time: '第1周', passRate: 94.0 },
      { time: '第2周', passRate: 94.3 },
      { time: '第3周', passRate: 95.1 },
      { time: '第4周', passRate: 94.6 }
    ]
  }
};

// 数据查询接口封装
export function queryMaterials(params = {}) {
  let results = [...materials];
  
  // 根据参数过滤
  if (params.code) {
    results = results.filter(m => m.code.includes(params.code));
  }
  if (params.name) {
    results = results.filter(m => m.name.includes(params.name));
  }
  if (params.type) {
    results = results.filter(m => m.type === params.type);
  }
  if (params.status) {
    results = results.filter(m => m.status === params.status);
  }
  
  return results;
}

export function queryInspectionResults(params = {}) {
  let results = [...inspectionResults];
  
  // 根据参数过滤
  if (params.materialCode) {
    results = results.filter(ir => ir.materialCode === params.materialCode);
  }
  if (params.batchCode) {
    results = results.filter(ir => ir.batchCode === params.batchCode);
  }
  if (params.result) {
    results = results.filter(ir => ir.result === params.result);
  }
  
  return results;
}

export function queryLabTests(params = {}) {
  let results = [...labTests];
  
  // 根据参数过滤
  if (params.materialCode) {
    results = results.filter(lt => lt.materialCode === params.materialCode);
  }
  if (params.batchCode) {
    results = results.filter(lt => lt.batchCode === params.batchCode);
  }
  if (params.testResult) {
    results = results.filter(lt => lt.testResult === params.testResult);
  }
  
  return results;
}

export function queryQualityExceptions(params = {}) {
  let results = [...qualityExceptions];
  
  // 根据参数过滤
  if (params.materialCode) {
    results = results.filter(qe => qe.materialCode === params.materialCode);
  }
  if (params.status) {
    results = results.filter(qe => qe.status === params.status);
  }
  if (params.severity) {
    results = results.filter(qe => qe.severity === params.severity);
  }
  
  return results;
}

// 导出所有数据和查询方法
export default {
  materials,
  inspectionResults,
  labTests,
  qualityExceptions,
  qualityStatistics,
  queryMaterials,
  queryInspectionResults,
  queryLabTests,
  queryQualityExceptions
}; 