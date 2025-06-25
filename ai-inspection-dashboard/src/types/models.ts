/**
 * IQE动态检验系统 - 数据模型定义
 * 标准化的数据结构，用于系统内部数据交换和存储
 */

// ===== 基础通用类型 =====

export type RiskLevel = 'low' | 'medium' | 'high';
export type Status = 'normal' | 'frozen' | 'inspection' | 'risk';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type TestResult = 'pass' | 'fail' | 'warning';
export type Importance = 'critical' | 'major' | 'minor';
export type AnomalyStatus = 'open' | 'investigating' | 'resolved' | 'closed';

// ===== 库存管理模型 =====

export interface InventoryItem {
  id: string;
  materialCode: string;
  materialName: string;
  quantity: number;
  unit: string;
  storageLocation: string;
  supplier: string;
  batchNumber: string;
  receiveDate: string; // ISO 8601 YYYY-MM-DD
  expirationDate: string; // ISO 8601 YYYY-MM-DD
  status: 'normal' | 'risk' | 'frozen';
  inspectionStatus: 'pending' | 'passed' | 'failed';
  lastInspectionDate?: string;
  freezeReason?: string;
  notes?: string;
  qualityScore?: number;
  riskLevel?: 'Low' | 'Medium' | 'High';
  materialCategory?: string;
  assignedTo?: string;

  // --- Lab Inspection Fields ---
  testStatus?: 'Untested' | 'Pass' | 'Fail' | 'Conditional Pass';
  testDate?: string;
  testResults?: Record<string, any>;
  testOperator?: string;
  testDefectDescription?: string;

  // --- Online Tracking Fields ---
  onlineDate?: string;
  factory?: string;
  warehouse?: string;
  qualityStatus?: '合格' | '不合格' | '风险' | '待定';
  defectType?: string;
  onlineOperator?: string;
  
  // For any other legacy fields
  [key: string]: any;
}

export type MaterialStatus = '合格' | '不合格' | '待定' | '冻结';

// ===== 产线异常模型 =====

export interface ProductionAnomaly {
  id: string;                 // 异常ID
  date: Date;                 // 异常日期
  productionLine: string;     // 产线
  materialCode: string;       // 相关物料编码
  batchNumber: string;        // 批次号
  anomalyType: string;        // 异常类型
  severity: Severity;         // 严重程度
  description: string;        // 异常描述
  images?: string[];          // 相关图片URL
  responsibleDepartment: string; // 责任部门
  responsiblePerson?: string; // 责任人
  status: AnomalyStatus;      // 状态
  resolutionSteps?: string[]; // 解决步骤
  resolutionDate?: Date;      // 解决日期
  affectedInventory?: string[]; // 受影响的库存批次
  rootCause?: string;         // 根本原因
  preventiveMeasures?: string[]; // 预防措施
}

// ===== 实验室测试模型 =====

export interface TestItem {
  name: string;               // 测试项目名称
  standardValue: number;      // 标准值
  actualValue: number;        // 实际值
  unit: string;               // 单位
  tolerance: number;          // 容差
  result: 'pass' | 'fail';    // 结果
  importance: Importance;     // 重要性
}

export interface LabTest {
  id: string;                 // 测试ID
  date: Date;                 // 测试日期
  materialCode: string;       // 物料编码
  materialName: string;       // 物料名称
  batchNumber: string;        // 批次号
  testType: string;           // 测试类型
  testItems: TestItem[];      // 测试项目
  overallResult: TestResult;  // 整体结果
  inspector: string;          // 检验员
  notes?: string;             // 备注
  attachments?: string[];     // 附件URL
  relatedAnomalies?: string[]; // 相关异常ID
}

// ===== AI推荐模型 =====

export interface Recommendation {
  id: string;
  type: 'inventory_action' | 'inspection' | 'production_change' | 'supplier_action';
  priority: Severity;
  description: string;
  reasoning: string;
  suggestedActions: {
    action: string,
    expectedOutcome: string
  }[];
  historicalSuccess?: {
    implementationCount: number,
    successRate: number
  };
}

// ===== 风险预测模型 =====

export interface RiskPrediction {
  materialCode: string;
  batchNumber: string;
  riskLevel: RiskLevel;
  riskScore: number; // 0-100
  riskFactors: {factor: string, contribution: number}[];
  projectedIssues: {issue: string, probability: number}[];
  recommendedActions: string[];
}

// ===== 异常检测结果 =====

export interface AnomalyDetectionResult {
  entityType: 'inventory' | 'production' | 'labTest';
  entityId: string;
  anomalyType: string;
  confidence: number; // 0-1
  suggestedActions: string[];
} 