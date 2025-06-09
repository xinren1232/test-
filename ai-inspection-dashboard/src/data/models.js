/**
 * 数据模型定义
 * 定义系统中使用的核心数据结构和类型
 */

// 物料基本信息模型
export const MaterialModel = {
  code: '',       // 物料编码
  name: '',       // 物料名称
  type: '',       // 物料类型
  status: '',     // 状态（正常/冻结/异常）
  inventory: '',  // 库存数量
  supplier: '',   // 供应商
  batchCode: '',  // 批次号
  createdAt: '',  // 入库时间
  updatedAt: '',  // 更新时间
};

// 质量检验结果模型
export const InspectionResultModel = {
  id: '',
  materialCode: '',    // 物料编码
  batchCode: '',       // 批次号
  inspectionType: '',  // 检验类型（来料/实验室/上线）
  result: '',          // 结果（合格/不合格）
  score: 0,            // 质量评分
  defectRate: 0,       // 缺陷率
  inspectorId: '',     // 检验人员ID
  inspectionTime: '',  // 检验时间
  remarks: '',         // 备注
  parameters: [],      // 检验参数
};

// 实验室测试结果模型
export const LabTestModel = {
  id: '',
  materialCode: '',    // 物料编码
  batchCode: '',       // 批次号
  testType: '',        // 测试类型
  parameters: [],      // 测试参数
  testResult: '',      // 测试结果
  status: '',          // 状态
  tester: '',          // 测试人员
  testTime: '',        // 测试时间
  conclusion: '',      // 结论
};

// 生产线数据模型
export const ProductionLineModel = {
  id: '',
  lineName: '',        // 生产线名称
  status: '',          // 状态（运行/停机/维护）
  materials: [],       // 使用中的物料
  defectRate: 0,       // 当前缺陷率
  outputRate: 0,       // 产出率
  startTime: '',       // 当前批次开始时间
  operators: [],       // 操作人员
};

// 质量异常记录模型
export const QualityExceptionModel = {
  id: '',
  materialCode: '',    // 物料编码
  batchCode: '',       // 批次号
  exceptionType: '',   // 异常类型
  severity: '',        // 严重程度
  location: '',        // 发生位置
  discoveryTime: '',   // 发现时间
  reporter: '',        // 报告人
  status: '',          // 状态（待处理/处理中/已解决）
  solution: '',        // 解决方案
  resolveTime: '',     // 解决时间
};

// 质量数据统计模型
export const QualityStatisticsModel = {
  period: '',           // 统计周期
  passRate: 0,          // 合格率
  averageScore: 0,      // 平均评分
  exceptionCount: 0,    // 异常数量
  materialCoverage: 0,  // 物料覆盖率
  trends: [],           // 趋势数据
};

// 封装通用的数据查询结果
export class DataQueryResult {
  constructor(success = true, data = null, message = '', metadata = {}) {
    this.success = success;  // 是否成功
    this.data = data;        // 数据内容
    this.message = message;  // 消息
    this.timestamp = new Date().toISOString(); // 时间戳
    this.metadata = metadata; // 元数据
  }
  
  static success(data, message = '查询成功') {
    return new DataQueryResult(true, data, message);
  }
  
  static error(message = '查询失败', metadata = {}) {
    return new DataQueryResult(false, null, message, metadata);
  }
}

// 导出所有模型
export default {
  MaterialModel,
  InspectionResultModel,
  LabTestModel,
  ProductionLineModel,
  QualityExceptionModel,
  QualityStatisticsModel,
  DataQueryResult
}; 