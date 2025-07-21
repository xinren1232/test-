/**
 * IQE数据服务 - 整合各类标准化数据，为AI问答系统提供统一数据源
 */
export class IQEDataService {
  constructor(dataStandardService, laboratoryDataStandard, qualityDataStandard) {
    this.dataStandardService = dataStandardService;
    this.laboratoryDataStandard = laboratoryDataStandard;
    this.qualityDataStandard = qualityDataStandard;
    this.initialized = false;
    this.cachedData = null;
    this.lastUpdateTime = null;
  }
  
  /**
   * 初始化服务
   */
  async initialize() {
    if (!this.dataStandardService || !this.laboratoryDataStandard || !this.qualityDataStandard) {
      throw new Error('依赖的标准化服务未提供');
    }
    
    // 确保依赖的服务已初始化
    if (!this.dataStandardService.initialized) {
      await this.dataStandardService.initialize();
    }
    
    this.initialized = true;
    return true;
  }
  
  /**
   * 获取所有标准化数据
   */
  async getAllStandardizedData() {
    if (!this.initialized) {
      await this.initialize();
    }
    
    // 检查是否需要刷新缓存数据
    const currentTime = new Date().getTime();
    const cacheExpireTime = 5 * 60 * 1000; // 5分钟缓存过期
    
    if (this.cachedData && this.lastUpdateTime && (currentTime - this.lastUpdateTime < cacheExpireTime)) {
      return this.cachedData;
    }
    
    // 获取实验室和质量数据
    const laboratoryData = this.laboratoryDataStandard.getStandardizedTestRecords() || [];
    const qualityData = this.qualityDataStandard.getStandardizedQualityEvents() || [];
    
    // 整合数据
    this.cachedData = {
      laboratory: laboratoryData,
      quality: qualityData,
      metadata: {
        dataTypes: {
          LABORATORY: 'laboratory',
          PRODUCTION: 'production',
          QUALITY: 'quality',
          INVENTORY: 'inventory'
        },
        units: this.dataStandardService.standardParameters?.value?.reduce((acc, param) => {
          if (param.unit) acc[param.code] = param.unit;
          return acc;
        }, {}) || {},
        evaluationStatuses: {
          OK: 'OK',
          NG: 'NG',
          PENDING: 'pending',
          WARNING: 'warning',
          DEVIATION: 'deviation'
        },
        riskLevels: {
          NONE: 'none',
          LOW: 'low',
          MEDIUM: 'medium',
          HIGH: 'high'
        },
        testTypes: {
          APPEARANCE: 'appearance',
          DIMENSIONAL: 'dimensional',
          MATERIAL: 'material',
          CHEMICAL: 'chemical',
          PHYSICAL: 'physical',
          MECHANICAL: 'mechanical',
          ELECTRICAL: 'electrical',
          RELIABILITY: 'reliability',
          PERFORMANCE: 'performance',
          SAFETY: 'safety'
        }
      },
      timestamp: new Date().toISOString()
    };
    
    this.lastUpdateTime = currentTime;
    return this.cachedData;
  }
  
  /**
   * 获取风险相关数据
   */
  async getRiskData() {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const allData = await this.getAllStandardizedData();
    
    // 提取风险相关数据
    const riskData = {
      laboratoryRisks: this._extractRiskItems(allData.laboratory),
      qualityRisks: this._extractRiskItems(allData.quality),
      riskLevels: allData.metadata.riskLevels,
      timestamp: new Date().toISOString()
    };
    
    return riskData;
  }
  
  /**
   * 从数据中提取风险项
   * @private
   */
  _extractRiskItems(data) {
    if (!data || !Array.isArray(data)) {
      return [];
    }
    
    // 提取风险级别不为"无风险"的项
    return data.filter(item => {
      return item.riskLevel && item.riskLevel !== '无风险' && item.riskLevel !== 'none';
    });
  }
  
  /**
   * 获取特定批次的所有相关数据
   * @param {string} batchNumber - 批次号
   */
  async getBatchData(batchNumber) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const allData = await this.getAllStandardizedData();
    
    // 从实验室数据中查找批次信息
    const laboratoryBatchData = allData.laboratory.filter(item => 
      item.batchNumber === batchNumber || item.batchId === batchNumber
    );
    
    // 从质量数据中查找批次信息
    const qualityBatchData = allData.quality.filter(item => 
      item.batchNumber === batchNumber || item.batchId === batchNumber
    );
    
    return {
      batchNumber,
      laboratory: laboratoryBatchData,
      quality: qualityBatchData,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * 获取最近的风险趋势数据
   * @param {number} days - 天数
   */
  async getRiskTrend(days = 30) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    // 获取质量数据
    const qualityData = this.qualityDataStandard.getStandardizedQualityEvents() || [];
    
    // 计算日期范围
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    // 按日期分组并计算风险批次数量
    const trendData = [];
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateString = currentDate.toISOString().split('T')[0];
      
      // 计算当天的风险批次数量
      const dayRiskItems = qualityData.filter(item => {
        const itemDate = new Date(item.timestamp || item.date || item.createdAt);
        return itemDate.toISOString().split('T')[0] === dateString && 
               item.riskLevel && 
               item.riskLevel !== '无风险' && 
               item.riskLevel !== 'none';
      });
      
      trendData.push({
        date: dateString,
        riskCount: dayRiskItems.length,
        highRiskCount: dayRiskItems.filter(item => item.riskLevel === '高风险' || item.riskLevel === 'high').length,
        mediumRiskCount: dayRiskItems.filter(item => item.riskLevel === '中风险' || item.riskLevel === 'medium').length,
        lowRiskCount: dayRiskItems.filter(item => item.riskLevel === '低风险' || item.riskLevel === 'low').length
      });
    }
    
    return {
      period: `${days}天`,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      data: trendData,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * 获取供应商风险分布数据
   */
  async getSupplierRiskDistribution() {
    if (!this.initialized) {
      await this.initialize();
    }
    
    // 获取质量数据
    const qualityData = this.qualityDataStandard.getStandardizedQualityEvents() || [];
    
    // 按供应商分组
    const supplierGroups = {};
    qualityData.forEach(item => {
      if (!item.supplier) return;
      
      if (!supplierGroups[item.supplier]) {
        supplierGroups[item.supplier] = {
          supplier: item.supplier,
          totalItems: 0,
          riskItems: 0,
          highRiskItems: 0,
          mediumRiskItems: 0,
          lowRiskItems: 0
        };
      }
      
      supplierGroups[item.supplier].totalItems++;
      
      if (item.riskLevel && item.riskLevel !== '无风险' && item.riskLevel !== 'none') {
        supplierGroups[item.supplier].riskItems++;
        
        if (item.riskLevel === '高风险' || item.riskLevel === 'high') {
          supplierGroups[item.supplier].highRiskItems++;
        } else if (item.riskLevel === '中风险' || item.riskLevel === 'medium') {
          supplierGroups[item.supplier].mediumRiskItems++;
        } else if (item.riskLevel === '低风险' || item.riskLevel === 'low') {
          supplierGroups[item.supplier].lowRiskItems++;
        }
      }
    });
    
    // 转换为数组并计算风险率
    const supplierRiskData = Object.values(supplierGroups).map(supplier => {
      return {
        ...supplier,
        riskRate: supplier.totalItems > 0 ? (supplier.riskItems / supplier.totalItems * 100).toFixed(2) : 0
      };
    });
    
    // 按风险率排序
    supplierRiskData.sort((a, b) => b.riskRate - a.riskRate);
    
    return {
      suppliers: supplierRiskData,
      timestamp: new Date().toISOString()
    };
  }
} 