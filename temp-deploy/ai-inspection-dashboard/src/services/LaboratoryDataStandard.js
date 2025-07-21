/**
 * 实验室数据标准化实现
 * 为实验室检测数据提供标准化接口和转换方法
 */
import { ref } from 'vue';
import DataStandardService, { DATA_TYPES, INSPECTION_PHASES, EVALUATION_STATUS, TEST_TYPES } from './DataStandardService';
import laboratoryService, { TEST_RESULTS } from './LaboratoryService';

export class LaboratoryDataStandard {
  constructor() {
    this.standardizedTestRecords = ref([]);
    this.standardizedTestParameters = ref([]);
    this.initialized = false;
    this.labService = null;
    this.dataStandardService = new DataStandardService();
  }

  /**
   * 初始化服务
   * @param {Object} laboratoryService 实验室服务实例
   */
  async initialize(laboratoryService) {
    if (this.initialized) return true;
    
    this.labService = laboratoryService;
    
    // 确保数据标准服务已初始化
    if (!this.dataStandardService.initialized) {
      await this.dataStandardService.initialize();
    }
    
    // 标准化实验室测试参数
    await this.standardizeTestParameters();
    
    // 标准化实验室测试记录
    await this.standardizeTestRecords();
    
    this.initialized = true;
    return true;
  }

  /**
   * 标准化测试参数
   */
  async standardizeTestParameters() {
    if (!this.labService || !this.labService.testParameters || !this.labService.testParameters.value) {
      console.error('实验室服务或测试参数未初始化');
      return;
    }
    
    // 获取原始测试参数
    const originalParameters = this.labService.testParameters.value;
    
    // 标准化参数
    const standardizedParams = originalParameters.map(param => {
      // 尝试匹配对应的标准参数
      const stdParam = this.dataStandardService.standardParameters.value.find(stdP => 
        stdP.name === param.name || 
        (param.name.includes(stdP.name) || stdP.name.includes(param.name))
      );
      
      if (stdParam) {
        // 使用标准参数的信息
        return {
          ...param,
          standardId: stdParam.id,
          name: stdParam.name,
          code: stdParam.code,
          unit: stdParam.unit,
          type: stdParam.type,
          lowerLimit: stdParam.defaultLowerLimit !== undefined ? stdParam.defaultLowerLimit : param.lowerLimit,
          upperLimit: stdParam.defaultUpperLimit !== undefined ? stdParam.defaultUpperLimit : param.upperLimit,
          description: stdParam.description || param.significance
        };
      }
      
      // 如果没有匹配的标准参数，使用原始参数并分配类型
      return {
        ...param,
        code: param.name.substring(0, 2).toUpperCase(),
        type: this.inferParameterType(param.name, param.method)
      };
    });
    
    this.standardizedTestParameters.value = standardizedParams;
  }

  /**
   * 推断参数类型
   * @param {string} paramName 参数名称
   * @param {string} method 测试方法
   * @returns {string} 参数类型
   */
  inferParameterType(paramName, method) {
    const name = paramName.toLowerCase();
    const methodLower = method ? method.toLowerCase() : '';
    
    if (name.includes('外观') || name.includes('颜色') || name.includes('气味')) {
      return TEST_TYPES.APPEARANCE;
    } else if (name.includes('尺寸') || name.includes('长度') || name.includes('宽度') || name.includes('厚度')) {
      return TEST_TYPES.DIMENSIONAL;
    } else if (name.includes('密度') || name.includes('熔融') || name.includes('粘度')) {
      return TEST_TYPES.PHYSICAL;
    } else if (name.includes('拉伸') || name.includes('强度') || name.includes('硬度') || name.includes('弯曲')) {
      return TEST_TYPES.MECHANICAL;
    } else if (name.includes('电阻') || name.includes('电压') || name.includes('电流')) {
      return TEST_TYPES.ELECTRICAL;
    } else if (name.includes('成分') || name.includes('含量')) {
      return TEST_TYPES.CHEMICAL;
    }
    
    // 根据方法推断
    if (methodLower.includes('physical')) {
      return TEST_TYPES.PHYSICAL;
    } else if (methodLower.includes('chemical')) {
      return TEST_TYPES.CHEMICAL;
    } else if (methodLower.includes('mechanical')) {
      return TEST_TYPES.MECHANICAL;
    }
    
    return TEST_TYPES.PHYSICAL; // 默认返回物理性质
  }

  /**
   * 标准化测试记录
   */
  async standardizeTestRecords() {
    if (!this.labService || !this.labService.testRecords || !this.labService.testRecords.value) {
      console.error('实验室服务或测试记录未初始化');
      return;
    }
    
    // 获取原始测试记录
    const originalRecords = this.labService.testRecords.value;
    
    // 标准化记录
    const standardizedRecords = originalRecords.map(record => {
      // 转换检验阶段
      let inspectionPhase = INSPECTION_PHASES.INCOMING;
      if (record.test_type === 'process') {
        inspectionPhase = INSPECTION_PHASES.PROCESS;
      } else if (record.test_type === 'outgoing') {
        inspectionPhase = INSPECTION_PHASES.OUTGOING;
      } else if (record.test_type === 'stability') {
        inspectionPhase = INSPECTION_PHASES.STABILITY;
      }
      
      // 转换结果状态
      let evaluationStatus = EVALUATION_STATUS.PENDING;
      if (record.result === TEST_RESULTS.PASS) {
        evaluationStatus = EVALUATION_STATUS.OK;
      } else if (record.result === TEST_RESULTS.FAIL) {
        evaluationStatus = EVALUATION_STATUS.NG;
      } else if (record.result === TEST_RESULTS.DEVIATION) {
        evaluationStatus = EVALUATION_STATUS.DEVIATION;
      }
      
      // 标准化测试结果数据 - 确保parameter_values存在
      const standardizedParameterValues = Array.isArray(record.parameter_values) ? 
        record.parameter_values.map(data => this.standardizeTestDataItem(data)) : 
        [];
      
      // 返回标准化记录
      return {
        ...record,
        dataType: DATA_TYPES.LABORATORY,
        inspectionPhase,
        evaluationStatus,
        // 保持原始字段名称一致
        parameter_values: standardizedParameterValues
      };
    });
    
    this.standardizedTestRecords.value = standardizedRecords;
  }

  /**
   * 标准化单个测试数据项
   * @param {Object} dataItem 测试数据项
   * @returns {Object} 标准化的测试数据项
   */
  standardizeTestDataItem(dataItem) {
    // 找到匹配的标准参数
    const stdParam = this.standardizedTestParameters.value.find(param => 
      param.name === dataItem.parameter || 
      (param.name && dataItem.parameter && (
        param.name.includes(dataItem.parameter) || 
        dataItem.parameter.includes(param.name)
      ))
    );
    
    if (stdParam) {
      // 评估结果状态
      const value = parseFloat(dataItem.value);
      let status = dataItem.status; // 保留原始状态
      
      // 如果有标准参数且可以计算评估状态
      if (!isNaN(value) && (stdParam.lowerLimit !== undefined || stdParam.upperLimit !== undefined)) {
        status = this.evaluateTestResult(value, stdParam.lowerLimit, stdParam.upperLimit);
      }
      
      return {
        ...dataItem,
        parameter: stdParam.name,
        parameterCode: stdParam.code,
        unit: stdParam.unit || dataItem.unit,
        type: stdParam.type,
        status
      };
    }
    
    // 无法标准化的情况下，保留原始数据
    return dataItem;
  }

  /**
   * 评估测试结果
   * @param {number} value 测试值
   * @param {number} lowerLimit 下限
   * @param {number} upperLimit 上限
   * @returns {string} 评估状态
   */
  evaluateTestResult(value, lowerLimit, upperLimit) {
    // 如果没有上下限，则返回待定
    if (lowerLimit === undefined && upperLimit === undefined) {
      return EVALUATION_STATUS.PENDING;
    }
    
    // 如果只有下限
    if (lowerLimit !== undefined && upperLimit === undefined) {
      if (value < lowerLimit) {
        return EVALUATION_STATUS.NG;
      }
      return EVALUATION_STATUS.OK;
    }
    
    // 如果只有上限
    if (lowerLimit === undefined && upperLimit !== undefined) {
      if (value > upperLimit) {
        return EVALUATION_STATUS.NG;
      }
      return EVALUATION_STATUS.OK;
    }
    
    // 有上下限
    if (value < lowerLimit || value > upperLimit) {
      return EVALUATION_STATUS.NG;
    }
    
    // 接近边界值(±10%)给出警告
    const range = upperLimit - lowerLimit;
    const lowerWarningThreshold = lowerLimit + range * 0.1;
    const upperWarningThreshold = upperLimit - range * 0.1;
    
    if (value < lowerWarningThreshold || value > upperWarningThreshold) {
      return EVALUATION_STATUS.WARNING;
    }
    
    return EVALUATION_STATUS.OK;
  }

  /**
   * 获取标准化的测试记录
   * @returns {Array} 标准化的测试记录
   */
  getStandardizedTestRecords() {
    return this.standardizedTestRecords.value;
  }

  /**
   * 获取特定批次的标准化测试记录
   * @param {string} batchId 批次ID
   * @returns {Array} 批次的标准化测试记录
   */
  getStandardizedTestRecordsByBatchId(batchId) {
    return this.standardizedTestRecords.value.filter(record => record.batchId === batchId);
  }

  /**
   * 添加测试记录并进行标准化
   * @param {Object} recordData 记录数据
   * @returns {Object} 标准化后的记录
   */
  addTestRecord(recordData) {
    // 先通过原服务添加记录
    const originalRecord = this.labService.addTestRecord(recordData);
    
    // 标准化新记录
    const standardizedRecord = this.standardizeTestRecord(originalRecord);
    
    // 添加到标准化记录集合
    this.standardizedTestRecords.value.push(standardizedRecord);
    
    return standardizedRecord;
  }

  /**
   * 标准化单个测试记录
   * @param {Object} record 测试记录
   * @returns {Object} 标准化的测试记录
   */
  standardizeTestRecord(record) {
    // 转换检验阶段
    let inspectionPhase = INSPECTION_PHASES.INCOMING;
    if (record.test_type === 'process') {
      inspectionPhase = INSPECTION_PHASES.PROCESS;
    } else if (record.test_type === 'outgoing') {
      inspectionPhase = INSPECTION_PHASES.OUTGOING;
    } else if (record.test_type === 'stability') {
      inspectionPhase = INSPECTION_PHASES.STABILITY;
    }
    
    // 转换结果状态
    let evaluationStatus = EVALUATION_STATUS.PENDING;
    if (record.result === TEST_RESULTS.PASS) {
      evaluationStatus = EVALUATION_STATUS.OK;
    } else if (record.result === TEST_RESULTS.FAIL) {
      evaluationStatus = EVALUATION_STATUS.NG;
    } else if (record.result === TEST_RESULTS.DEVIATION) {
      evaluationStatus = EVALUATION_STATUS.DEVIATION;
    }
    
    // 标准化测试结果数据 - 确保parameter_values存在
    const standardizedParameterValues = Array.isArray(record.parameter_values) ? 
      record.parameter_values.map(data => this.standardizeTestDataItem(data)) : 
      [];
    
    // 返回标准化记录
    return {
      ...record,
      dataType: DATA_TYPES.LABORATORY,
      inspectionPhase,
      evaluationStatus,
      // 保持原始字段名称一致
      parameter_values: standardizedParameterValues
    };
  }
}

const laboratoryDataStandard = new LaboratoryDataStandard();
export default laboratoryDataStandard; 