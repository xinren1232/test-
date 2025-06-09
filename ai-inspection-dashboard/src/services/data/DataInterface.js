/**
 * 数据接口服务
 * 提供统一的数据访问接口，可以连接到真实API或使用模拟数据
 */

import { useIQEStore } from '../../stores';
import { storeToRefs } from 'pinia';

class DataInterface {
  constructor() {
    // 标记是否使用真实API
    this.useRealApi = false;
    this.apiBaseUrl = '';
    
    // 初始化标记
    this.initialized = false;
  }

  /**
   * 初始化数据接口
   * @param {Object} options 配置选项
   */
  init(options = {}) {
    this.useRealApi = options.useRealApi || false;
    this.apiBaseUrl = options.apiBaseUrl || '';
    this.initialized = true;
    
    console.log(`[DataInterface] 初始化数据接口: ${this.useRealApi ? '使用真实API' : '使用模拟数据'}`);
    return this;
  }

  /**
   * 获取Store引用
   * @returns {Object} Store引用
   */
  getStore() {
    return useIQEStore();
  }

  /**
   * 获取物料主数据
   * @param {Object} filters 过滤条件
   * @returns {Array} 物料主数据
   */
  async getMaterialMasterData(filters = {}) {
    if (this.useRealApi) {
      // 实际API调用
      // return await fetch(`${this.apiBaseUrl}/materials?...`).then(res => res.json());
      throw new Error('真实API尚未实现');
    } else {
      // 使用本地数据
      const store = this.getStore();
      const { materialMasterData } = storeToRefs(store);
      
      // 应用过滤器
      let data = [...materialMasterData.value];
      
      if (filters.materialCode) {
        data = data.filter(m => m.materialCode.includes(filters.materialCode));
      }
      
      if (filters.materialType) {
        data = data.filter(m => m.materialType === filters.materialType);
      }
      
      if (filters.riskLevel) {
        data = data.filter(m => m.riskLevel === filters.riskLevel);
      }
      
      return data;
    }
  }

  /**
   * 获取单个物料数据
   * @param {string} materialCode 物料编码
   * @returns {Object} 物料数据
   */
  async getMaterial(materialCode) {
    const materials = await this.getMaterialMasterData({ materialCode });
    return materials.length > 0 ? materials[0] : null;
  }

  /**
   * 获取供应商数据
   * @param {Object} filters 过滤条件
   * @returns {Array} 供应商数据
   */
  async getSupplierData(filters = {}) {
    if (this.useRealApi) {
      // 实际API调用
      throw new Error('真实API尚未实现');
    } else {
      // 使用本地数据
      const store = this.getStore();
      const { supplierData } = storeToRefs(store);
      
      // 应用过滤器
      let data = [...supplierData.value];
      
      if (filters.name) {
        data = data.filter(s => s.name.includes(filters.name));
      }
      
      if (filters.riskLevel) {
        data = data.filter(s => s.riskLevel === filters.riskLevel);
      }
      
      return data;
    }
  }

  /**
   * 获取库存物料批次数据
   * @param {Object} filters 过滤条件
   * @returns {Array} 库存物料批次数据
   */
  async getMaterialBatchData(filters = {}) {
    if (this.useRealApi) {
      // 实际API调用
      throw new Error('真实API尚未实现');
    } else {
      // 使用本地数据
      const store = this.getStore();
      const { materialBatchData } = storeToRefs(store);
      
      // 应用过滤器
      let data = [...materialBatchData.value];
      
      if (filters.materialCode) {
        data = data.filter(b => b.materialCode === filters.materialCode);
      }
      
      if (filters.supplier) {
        data = data.filter(b => b.supplier === filters.supplier);
      }
      
      if (filters.result) {
        data = data.filter(b => b.result === filters.result);
      }
      
      if (filters.isHighRisk !== undefined) {
        data = data.filter(b => b.isHighRisk === filters.isHighRisk);
      }
      
      // 应用日期范围过滤
      if (filters.startDate && filters.endDate) {
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        
        data = data.filter(b => {
          const date = new Date(b.inspectionDate);
          return date >= start && date <= end;
        });
      }
      
      return data;
    }
  }

  /**
   * 获取实验室检测数据
   * @param {Object} filters 过滤条件
   * @returns {Array} 实验室检测数据
   */
  async getLabTestData(filters = {}) {
    if (this.useRealApi) {
      // 实际API调用
      throw new Error('真实API尚未实现');
    } else {
      // 使用本地数据
      const store = this.getStore();
      const { labTestData } = storeToRefs(store);
      
      // 应用过滤器
      let data = [...labTestData.value];
      
      if (filters.materialCode) {
        data = data.filter(t => t.materialCode === filters.materialCode);
      }
      
      if (filters.supplier) {
        data = data.filter(t => t.supplier === filters.supplier);
      }
      
      if (filters.result) {
        data = data.filter(t => t.result === filters.result);
      }
      
      if (filters.testItem) {
        data = data.filter(t => t.testItem && t.testItem.includes(filters.testItem));
      }
      
      // 应用日期范围过滤
      if (filters.startDate && filters.endDate) {
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        
        data = data.filter(t => {
          const date = new Date(t.testDate);
          return date >= start && date <= end;
        });
      }
      
      // 排序
      if (filters.sortBy) {
        data.sort((a, b) => {
          if (filters.sortBy === 'date') {
            return filters.sortDir === 'desc' 
              ? new Date(b.testDate) - new Date(a.testDate)
              : new Date(a.testDate) - new Date(b.testDate);
          }
          
          return 0;
        });
      }
      
      return data;
    }
  }

  /**
   * 获取产线异常记录
   * @param {Object} filters 过滤条件
   * @returns {Array} 产线异常记录
   */
  async getProductionAnomalies(filters = {}) {
    if (this.useRealApi) {
      // 实际API调用
      throw new Error('真实API尚未实现');
    } else {
      // 使用本地数据
      const store = this.getStore();
      const { productionAnomalies } = storeToRefs(store);
      
      // 应用过滤器
      let data = [...productionAnomalies.value];
      
      if (filters.materialCode) {
        data = data.filter(a => a.materialCode === filters.materialCode);
      }
      
      if (filters.anomalyType) {
        data = data.filter(a => a.anomalyType === filters.anomalyType);
      }
      
      return data;
    }
  }

  /**
   * 获取质量统计数据
   * @param {string} section 统计区域
   * @returns {Object} 统计数据
   */
  async getStatisticsData(section = 'all') {
    if (this.useRealApi) {
      // 实际API调用
      throw new Error('真实API尚未实现');
    } else {
      // 使用本地数据
      const store = this.getStore();
      return store.getStatCardsData(section);
    }
  }

  /**
   * 分析物料质量趋势
   * @param {string} materialCode 物料编码
   * @param {number} period 分析周期（天）
   * @returns {Object} 分析结果
   */
  async analyzeMaterialQualityTrend(materialCode, period = 30) {
    if (this.useRealApi) {
      // 实际API调用
      throw new Error('真实API尚未实现');
    } else {
      // 使用本地数据
      const store = this.getStore();
      return store.analyzeMaterialQualityTrend(materialCode, period);
    }
  }

  /**
   * 根据测试结果查找相关物料批次
   * @param {string} testResult 测试结果描述
   * @returns {Array} 匹配的批次
   */
  async findBatchesByTestResult(testResult) {
    // 获取所有实验室测试数据
    const testData = await this.getLabTestData();
    
    // 查找匹配的测试记录
    const matchingTests = testData.filter(test => 
      test.testItem && test.testItem.includes(testResult) || 
      test.defectDescription && test.defectDescription.includes(testResult)
    );
    
    // 获取相关批次
    const batchesSet = new Set();
    matchingTests.forEach(test => {
      if (test.badBatch) {
        test.badBatch.split(',').forEach(batch => batchesSet.add(batch.trim()));
      }
    });
    
    // 返回批次数组
    return Array.from(batchesSet);
  }

  /**
   * 根据物料代码分析相关供应商质量趋势
   * @param {string} materialCode 物料代码
   * @returns {Object} 供应商质量趋势分析
   */
  async analyzeSupplierQualityByMaterial(materialCode) {
    // 获取此物料的所有测试数据
    const testData = await this.getLabTestData({ materialCode });
    
    // 按供应商分组
    const supplierMap = {};
    
    testData.forEach(test => {
      if (!test.supplier) return;
      
      if (!supplierMap[test.supplier]) {
        supplierMap[test.supplier] = {
          name: test.supplier,
          totalTests: 0,
          passedTests: 0,
          failedTests: 0,
          passRate: 0,
          testResults: []
        };
      }
      
      const supplier = supplierMap[test.supplier];
      supplier.totalTests++;
      
      if (test.result === 'NG') {
        supplier.failedTests++;
      } else {
        supplier.passedTests++;
      }
      
      supplier.testResults.push({
        date: test.testDate,
        result: test.result,
        testItem: test.testItem
      });
    });
    
    // 计算合格率
    Object.values(supplierMap).forEach(supplier => {
      supplier.passRate = supplier.totalTests > 0 
        ? (supplier.passedTests / supplier.totalTests * 100).toFixed(1) 
        : 0;
    });
    
    return Object.values(supplierMap);
  }
}

// 创建单例实例
const dataInterface = new DataInterface();

export default dataInterface; 