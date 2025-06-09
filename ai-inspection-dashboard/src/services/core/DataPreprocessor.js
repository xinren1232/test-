/**
 * 数据预处理器 - 提供数据清洗、转换、标准化和特征工程功能
 * 用于AI模型训练和预测前的数据准备
 */

// 数据预处理错误类
export class DataPreprocessorError extends Error {
  constructor(message, operation) {
    super(message);
    this.name = 'DataPreprocessorError';
    this.operation = operation;
    this.timestamp = new Date();
  }
}

export class DataPreprocessor {
  // 数据清洗策略
  static cleaningStrategies = new Map();
  
  // 数据转换策略
  static transformStrategies = new Map();
  
  // 特征工程策略
  static featureStrategies = new Map();
  
  /**
   * 注册数据清洗策略
   * @param {string} name 策略名称
   * @param {Function} strategy 策略函数
   */
  static registerCleaningStrategy(name, strategy) {
    if (typeof strategy !== 'function') {
      throw new Error('清洗策略必须是函数');
    }
    
    this.cleaningStrategies.set(name, strategy);
    console.log(`[DataPreprocessor] 注册清洗策略: ${name}`);
  }
  
  /**
   * 注册数据转换策略
   * @param {string} name 策略名称
   * @param {Function} strategy 策略函数
   */
  static registerTransformStrategy(name, strategy) {
    if (typeof strategy !== 'function') {
      throw new Error('转换策略必须是函数');
    }
    
    this.transformStrategies.set(name, strategy);
    console.log(`[DataPreprocessor] 注册转换策略: ${name}`);
  }
  
  /**
   * 注册特征工程策略
   * @param {string} name 策略名称
   * @param {Function} strategy 策略函数
   */
  static registerFeatureStrategy(name, strategy) {
    if (typeof strategy !== 'function') {
      throw new Error('特征工程策略必须是函数');
    }
    
    this.featureStrategies.set(name, strategy);
    console.log(`[DataPreprocessor] 注册特征工程策略: ${name}`);
  }
  
  /**
   * 执行数据清洗
   * @param {Array|Object} data 待清洗数据
   * @param {string|Array} strategies 清洗策略名称或名称数组
   * @param {Object} options 清洗选项
   * @return {Array|Object} 清洗后的数据
   */
  static clean(data, strategies, options = {}) {
    if (!data) return data;
    
    const strategyNames = Array.isArray(strategies) ? strategies : [strategies];
    let processedData = JSON.parse(JSON.stringify(data)); // 深拷贝
    
    for (const name of strategyNames) {
      const strategy = this.cleaningStrategies.get(name);
      
      if (!strategy) {
        console.warn(`[DataPreprocessor] 未找到清洗策略: ${name}`);
        continue;
      }
      
      try {
        processedData = strategy(processedData, options);
      } catch (error) {
        console.error(`[DataPreprocessor] 清洗策略 ${name} 执行失败:`, error);
        throw error;
      }
    }
    
    return processedData;
  }
  
  /**
   * 执行数据转换
   * @param {Array|Object} data 待转换数据
   * @param {string|Array} strategies 转换策略名称或名称数组
   * @param {Object} options 转换选项
   * @return {Array|Object} 转换后的数据
   */
  static transform(data, strategies, options = {}) {
    if (!data) return data;
    
    const strategyNames = Array.isArray(strategies) ? strategies : [strategies];
    let processedData = JSON.parse(JSON.stringify(data)); // 深拷贝
    
    for (const name of strategyNames) {
      const strategy = this.transformStrategies.get(name);
      
      if (!strategy) {
        console.warn(`[DataPreprocessor] 未找到转换策略: ${name}`);
        continue;
      }
      
      try {
        processedData = strategy(processedData, options);
      } catch (error) {
        console.error(`[DataPreprocessor] 转换策略 ${name} 执行失败:`, error);
        throw error;
      }
    }
    
    return processedData;
  }
  
  /**
   * 执行特征工程
   * @param {Array|Object} data 待处理数据
   * @param {string|Array} strategies 特征工程策略名称或名称数组
   * @param {Object} options 特征工程选项
   * @return {Array|Object} 处理后的数据
   */
  static engineerFeatures(data, strategies, options = {}) {
    if (!data) return data;
    
    const strategyNames = Array.isArray(strategies) ? strategies : [strategies];
    let processedData = JSON.parse(JSON.stringify(data)); // 深拷贝
    
    for (const name of strategyNames) {
      const strategy = this.featureStrategies.get(name);
      
      if (!strategy) {
        console.warn(`[DataPreprocessor] 未找到特征工程策略: ${name}`);
        continue;
      }
      
      try {
        processedData = strategy(processedData, options);
      } catch (error) {
        console.error(`[DataPreprocessor] 特征工程策略 ${name} 执行失败:`, error);
        throw error;
      }
    }
    
    return processedData;
  }
  
  /**
   * 完整的数据预处理流程
   * @param {Array|Object} data 原始数据
   * @param {Object} pipeline 预处理流水线配置
   * @return {Array|Object} 预处理后的数据
   */
  static process(data, pipeline = {}) {
    const {
      cleaning = [],
      transformation = [],
      featureEngineering = [],
      options = {}
    } = pipeline;
    
    // 应用清洗策略
    const cleanedData = this.clean(data, cleaning, options.cleaning || {});
    
    // 应用转换策略
    const transformedData = this.transform(cleanedData, transformation, options.transformation || {});
    
    // 应用特征工程策略
    const engineeredData = this.engineerFeatures(transformedData, featureEngineering, options.featureEngineering || {});
    
    return engineeredData;
  }
  
  /**
   * 标准化数据
   * @param {Array} data 数组数据
   * @param {Object} options 标准化选项
   * @return {Array} 标准化后的数据
   */
  static normalize(data, options = {}) {
    if (!Array.isArray(data)) {
      throw new Error('标准化方法需要数组数据');
    }
    
    const { method = 'minmax', featureIndices = null } = options;
    
    switch (method) {
      case 'minmax':
        return this.minMaxNormalization(data, featureIndices);
      case 'zscore':
        return this.zScoreNormalization(data, featureIndices);
      default:
        throw new Error(`未知的标准化方法: ${method}`);
    }
  }
  
  /**
   * 最小-最大标准化
   * @param {Array} data 数组数据
   * @param {Array} featureIndices 要标准化的特征索引
   * @return {Array} 标准化后的数据
   */
  static minMaxNormalization(data, featureIndices = null) {
    // 简单实现，实际应用中可以更复杂
    return data.map(item => {
      // 对每个数值进行最小-最大标准化
      if (typeof item === 'number') {
        return (item - Math.min(...data)) / (Math.max(...data) - Math.min(...data));
      }
      return item;
    });
  }
  
  /**
   * Z-score标准化
   * @param {Array} data 数组数据
   * @param {Array} featureIndices 要标准化的特征索引
   * @return {Array} 标准化后的数据
   */
  static zScoreNormalization(data, featureIndices = null) {
    // 简单实现，实际应用中可以更复杂
    const numericData = data.filter(item => typeof item === 'number');
    if (numericData.length === 0) return data;
    
    const mean = numericData.reduce((sum, val) => sum + val, 0) / numericData.length;
    const stdDev = Math.sqrt(numericData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numericData.length);
    
    return data.map(item => {
      if (typeof item === 'number') {
        return stdDev === 0 ? 0 : (item - mean) / stdDev;
      }
      return item;
    });
  }
  
  // 数据拆分
  static splitData(data, options = {}) {
    try {
      const { 
        testSize = 0.2, 
        validationSize = 0, 
        stratifyField = null,
        shuffle = true,
        seed = 42
      } = options;
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('输入数据必须是非空数组');
      }
      
      // 验证拆分比例
      if (testSize < 0 || testSize > 1 || validationSize < 0 || validationSize > 1 || (testSize + validationSize) >= 1) {
        throw new Error('测试集和验证集的比例必须在0-1之间，且总和小于1');
      }
      
      // 复制数据
      let dataArray = [...data];
      
      // 打乱数据
      if (shuffle) {
        dataArray = this.shuffleArray(dataArray, seed);
      }
      
      // 分层抽样
      if (stratifyField) {
        return this.stratifiedSplit(dataArray, stratifyField, testSize, validationSize);
      }
      
      // 计算索引
      const totalCount = dataArray.length;
      const testCount = Math.round(totalCount * testSize);
      const validationCount = Math.round(totalCount * validationSize);
      const trainCount = totalCount - testCount - validationCount;
      
      // 拆分数据
      const trainData = dataArray.slice(0, trainCount);
      const testData = dataArray.slice(trainCount, trainCount + testCount);
      const validationData = validationCount > 0 ? dataArray.slice(trainCount + testCount) : [];
      
      return {
        train: trainData,
        test: testData,
        validation: validationData
      };
    } catch (error) {
      throw new DataPreprocessorError(`数据拆分失败: ${error.message}`, 'splitData');
    }
  }
  
  // 数据采样
  static sampleData(data, options = {}) {
    try {
      const { 
        sampleSize, 
        sampleRatio, 
        replacement = false,
        stratifyField = null,
        seed = 42
      } = options;
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('输入数据必须是非空数组');
      }
      
      // 计算采样大小
      let size;
      if (sampleSize) {
        size = sampleSize;
      } else if (sampleRatio) {
        size = Math.round(data.length * sampleRatio);
      } else {
        throw new Error('必须指定sampleSize或sampleRatio');
      }
      
      // 验证采样大小
      if (size <= 0 || (!replacement && size > data.length)) {
        throw new Error('采样大小必须大于0且不大于数据长度（除非使用有放回采样）');
      }
      
      // 分层采样
      if (stratifyField) {
        return this.stratifiedSample(data, stratifyField, size, replacement, seed);
      }
      
      // 随机采样
      return this.randomSample(data, size, replacement, seed);
    } catch (error) {
      throw new DataPreprocessorError(`数据采样失败: ${error.message}`, 'sampleData');
    }
  }
  
  // ==================== 辅助方法 ====================
  
  // 移除空值
  static removeNullValues(data) {
    if (typeof data[0] === 'object') {
      // 对象数组
      return data.filter(item => {
        // 检查所有属性是否都有值
        return Object.values(item).every(val => 
          val !== null && val !== undefined && val !== ''
        );
      });
    } else {
      // 基本类型数组
      return data.filter(item => item !== null && item !== undefined && item !== '');
    }
  }
  
  // 移除重复值
  static removeDuplicateValues(data) {
    if (typeof data[0] === 'object') {
      // 对象数组 - 基于JSON字符串比较
      const uniqueMap = new Map();
      data.forEach(item => {
        const key = JSON.stringify(item);
        uniqueMap.set(key, item);
      });
      return Array.from(uniqueMap.values());
    } else {
      // 基本类型数组
      return [...new Set(data)];
    }
  }
  
  // 移除离群值
  static removeOutliers(data, method, threshold) {
    if (typeof data[0] !== 'number') {
      console.warn('离群值检测只支持数值数组');
      return data;
    }
    
    switch (method) {
      case 'zscore':
        return this.removeOutliersZScore(data, threshold);
      case 'iqr':
        return this.removeOutliersIQR(data, threshold);
      default:
        console.warn(`未知的离群值检测方法: ${method}`);
        return data;
    }
  }
  
  // 使用Z-Score移除离群值
  static removeOutliersZScore(data, threshold) {
    // 计算均值和标准差
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const stdDev = Math.sqrt(
      data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
    );
    
    // 过滤掉Z-Score超过阈值的值
    return data.filter(val => {
      const zScore = Math.abs((val - mean) / stdDev);
      return zScore <= threshold;
    });
  }
  
  // 使用IQR移除离群值
  static removeOutliersIQR(data, threshold) {
    // 排序数据
    const sorted = [...data].sort((a, b) => a - b);
    
    // 计算四分位数
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    
    // 计算IQR
    const iqr = q3 - q1;
    
    // 计算上下界
    const lowerBound = q1 - threshold * iqr;
    const upperBound = q3 + threshold * iqr;
    
    // 过滤离群值
    return data.filter(val => val >= lowerBound && val <= upperBound);
  }
  
  // 归一化字段
  static normalizeField(data, field, params = {}) {
    const { min: customMin, max: customMax, newMin = 0, newMax = 1 } = params;
    
    // 找出最小值和最大值
    let min = customMin;
    let max = customMax;
    
    if (min === undefined || max === undefined) {
      const values = data.map(item => item[field]);
      min = Math.min(...values);
      max = Math.max(...values);
    }
    
    // 避免除以零
    if (max === min) {
      return data.map(item => {
        const newItem = { ...item };
        newItem[field] = newMin;
        return newItem;
      });
    }
    
    // 应用归一化
    return data.map(item => {
      const newItem = { ...item };
      const value = item[field];
      newItem[field] = newMin + ((value - min) * (newMax - newMin)) / (max - min);
      return newItem;
    });
  }
  
  // 标准化字段
  static standardizeField(data, field, params = {}) {
    const { mean: customMean, stdDev: customStdDev } = params;
    
    // 计算均值和标准差
    let mean = customMean;
    let stdDev = customStdDev;
    
    if (mean === undefined || stdDev === undefined) {
      const values = data.map(item => item[field]);
      mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      stdDev = Math.sqrt(
        values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
      );
    }
    
    // 避免除以零
    if (stdDev === 0) {
      return data.map(item => {
        const newItem = { ...item };
        newItem[field] = 0;
        return newItem;
      });
    }
    
    // 应用标准化
    return data.map(item => {
      const newItem = { ...item };
      newItem[field] = (item[field] - mean) / stdDev;
      return newItem;
    });
  }
  
  // 对数转换
  static logTransform(data, field, params = {}) {
    const { base = Math.E, offset = 1 } = params;
    
    return data.map(item => {
      const newItem = { ...item };
      const value = item[field];
      
      // 处理负值和零值
      const adjustedValue = value + offset;
      
      if (adjustedValue <= 0) {
        newItem[field] = 0; // 或者其他适当的默认值
      } else {
        newItem[field] = Math.log(adjustedValue) / Math.log(base);
      }
      
      return newItem;
    });
  }
  
  // One-Hot编码
  static oneHotEncode(data, field, params = {}) {
    const { prefix = field } = params;
    
    // 获取所有唯一值
    const uniqueValues = [...new Set(data.map(item => item[field]))];
    
    // 应用One-Hot编码
    return data.map(item => {
      const newItem = { ...item };
      
      // 为每个唯一值创建一个新字段
      uniqueValues.forEach(value => {
        const newField = `${prefix}_${value}`;
        newItem[newField] = item[field] === value ? 1 : 0;
      });
      
      return newItem;
    });
  }
  
  // 离散化
  static discretize(data, field, params = {}) {
    const { bins = 5, labels = null, strategy = 'equal_width' } = params;
    
    // 获取字段值
    const values = data.map(item => item[field]);
    
    // 计算分箱边界
    let boundaries;
    if (strategy === 'equal_width') {
      boundaries = this.calculateEqualWidthBins(values, bins);
    } else if (strategy === 'equal_frequency') {
      boundaries = this.calculateEqualFrequencyBins(values, bins);
    } else {
      throw new Error(`未知的离散化策略: ${strategy}`);
    }
    
    // 生成标签
    const binLabels = labels || Array.from({ length: bins }, (_, i) => i);
    
    // 应用离散化
    return data.map(item => {
      const newItem = { ...item };
      const value = item[field];
      
      // 找到对应的分箱
      let binIndex = 0;
      for (let i = 0; i < boundaries.length - 1; i++) {
        if (value >= boundaries[i] && value < boundaries[i + 1]) {
          binIndex = i;
          break;
        }
      }
      
      // 处理最大值
      if (value === boundaries[boundaries.length - 1]) {
        binIndex = bins - 1;
      }
      
      newItem[`${field}_bin`] = binLabels[binIndex];
      return newItem;
    });
  }
  
  // 计算等宽分箱
  static calculateEqualWidthBins(values, bins) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const width = (max - min) / bins;
    
    return Array.from({ length: bins + 1 }, (_, i) => min + i * width);
  }
  
  // 计算等频分箱
  static calculateEqualFrequencyBins(values, bins) {
    const sortedValues = [...values].sort((a, b) => a - b);
    const boundaries = [sortedValues[0]];
    
    for (let i = 1; i <= bins; i++) {
      const index = Math.floor((i * sortedValues.length) / bins) - 1;
      boundaries.push(sortedValues[index]);
    }
    
    // 确保最后一个边界是最大值
    boundaries[bins] = sortedValues[sortedValues.length - 1];
    
    return boundaries;
  }
  
  // 创建比率特征
  static createRatioFeature(data, name, fields, params = {}) {
    const { epsilon = 1e-10 } = params;
    
    if (fields.length !== 2) {
      throw new Error('比率特征需要两个字段');
    }
    
    const [numerator, denominator] = fields;
    
    return data.map(item => {
      const newItem = { ...item };
      const num = item[numerator];
      const den = item[denominator];
      
      // 避免除以零
      newItem[name] = num / (den + epsilon);
      
      return newItem;
    });
  }
  
  // 创建聚合特征
  static createAggregateFeature(data, name, fields, params = {}) {
    const { operation = 'sum' } = params;
    
    return data.map(item => {
      const newItem = { ...item };
      const values = fields.map(field => item[field]);
      
      switch (operation) {
        case 'sum':
          newItem[name] = values.reduce((sum, val) => sum + val, 0);
          break;
        case 'avg':
          newItem[name] = values.reduce((sum, val) => sum + val, 0) / values.length;
          break;
        case 'min':
          newItem[name] = Math.min(...values);
          break;
        case 'max':
          newItem[name] = Math.max(...values);
          break;
        case 'product':
          newItem[name] = values.reduce((prod, val) => prod * val, 1);
          break;
        default:
          throw new Error(`未知的聚合操作: ${operation}`);
      }
      
      return newItem;
    });
  }
  
  // 创建窗口特征
  static createWindowFeature(data, name, fields, params = {}) {
    const { 
      windowSize = 3, 
      operation = 'avg',
      groupBy = null,
      sortBy = null
    } = params;
    
    if (fields.length !== 1) {
      throw new Error('窗口特征目前只支持一个字段');
    }
    
    const field = fields[0];
    
    // 如果需要分组和排序
    if (groupBy && sortBy) {
      // 分组
      const groups = new Map();
      data.forEach(item => {
        const groupKey = item[groupBy];
        if (!groups.has(groupKey)) {
          groups.set(groupKey, []);
        }
        groups.get(groupKey).push(item);
      });
      
      // 处理每个分组
      const processedData = [];
      groups.forEach(groupItems => {
        // 排序
        const sortedItems = [...groupItems].sort((a, b) => a[sortBy] - b[sortBy]);
        
        // 应用窗口操作
        const processedGroup = this.applyWindowOperation(sortedItems, field, name, windowSize, operation);
        processedData.push(...processedGroup);
      });
      
      return processedData;
    }
    
    // 如果不需要分组和排序，直接应用窗口操作
    return this.applyWindowOperation(data, field, name, windowSize, operation);
  }
  
  // 应用窗口操作
  static applyWindowOperation(data, field, name, windowSize, operation) {
    return data.map((item, index) => {
      const newItem = { ...item };
      
      // 获取窗口数据
      const start = Math.max(0, index - windowSize + 1);
      const windowData = data.slice(start, index + 1);
      const values = windowData.map(item => item[field]);
      
      // 应用操作
      switch (operation) {
        case 'avg':
          newItem[name] = values.reduce((sum, val) => sum + val, 0) / values.length;
          break;
        case 'sum':
          newItem[name] = values.reduce((sum, val) => sum + val, 0);
          break;
        case 'min':
          newItem[name] = Math.min(...values);
          break;
        case 'max':
          newItem[name] = Math.max(...values);
          break;
        case 'std':
          const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
          const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
          newItem[name] = Math.sqrt(variance);
          break;
        default:
          throw new Error(`未知的窗口操作: ${operation}`);
      }
      
      return newItem;
    });
  }
  
  // 创建多项式特征
  static createPolynomialFeature(data, name, fields, params = {}) {
    const { degree = 2 } = params;
    
    if (fields.length !== 1) {
      throw new Error('多项式特征目前只支持一个字段');
    }
    
    const field = fields[0];
    
    return data.map(item => {
      const newItem = { ...item };
      const value = item[field];
      
      newItem[name] = Math.pow(value, degree);
      
      return newItem;
    });
  }
  
  // 创建交互特征
  static createInteractionFeature(data, name, fields, params = {}) {
    if (fields.length < 2) {
      throw new Error('交互特征需要至少两个字段');
    }
    
    return data.map(item => {
      const newItem = { ...item };
      
      // 计算交互项
      newItem[name] = fields.reduce((product, field) => product * item[field], 1);
      
      return newItem;
    });
  }
  
  // 打乱数组
  static shuffleArray(array, seed) {
    const shuffled = [...array];
    
    // 简单的伪随机数生成器
    const random = (max) => {
      seed = (seed * 9301 + 49297) % 233280;
      return (seed / 233280) * max;
    };
    
    // Fisher-Yates洗牌算法
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random(i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
  }
  
  // 分层抽样
  static stratifiedSample(data, stratifyField, size, replacement, seed) {
    // 按层分组
    const strata = new Map();
    data.forEach(item => {
      const stratum = item[stratifyField];
      if (!strata.has(stratum)) {
        strata.set(stratum, []);
      }
      strata.get(stratum).push(item);
    });
    
    // 计算每层的采样大小
    const totalCount = data.length;
    const result = [];
    
    strata.forEach((stratumData, stratum) => {
      const stratumRatio = stratumData.length / totalCount;
      const stratumSampleSize = Math.round(size * stratumRatio);
      
      // 从每层中采样
      const stratumSample = this.randomSample(stratumData, stratumSampleSize, replacement, seed);
      result.push(...stratumSample);
    });
    
    return result;
  }
  
  // 分层拆分
  static stratifiedSplit(data, stratifyField, testSize, validationSize) {
    // 按层分组
    const strata = new Map();
    data.forEach(item => {
      const stratum = item[stratifyField];
      if (!strata.has(stratum)) {
        strata.set(stratum, []);
      }
      strata.get(stratum).push(item);
    });
    
    // 准备结果集
    const trainData = [];
    const testData = [];
    const validationData = [];
    
    // 对每层进行拆分
    strata.forEach((stratumData, stratum) => {
      const stratumCount = stratumData.length;
      const stratumTestCount = Math.round(stratumCount * testSize);
      const stratumValidationCount = Math.round(stratumCount * validationSize);
      const stratumTrainCount = stratumCount - stratumTestCount - stratumValidationCount;
      
      // 拆分数据
      trainData.push(...stratumData.slice(0, stratumTrainCount));
      testData.push(...stratumData.slice(stratumTrainCount, stratumTrainCount + stratumTestCount));
      validationData.push(...stratumData.slice(stratumTrainCount + stratumTestCount));
    });
    
    return {
      train: trainData,
      test: testData,
      validation: validationData
    };
  }
  
  // 随机采样
  static randomSample(data, size, replacement, seed) {
    if (!replacement && size > data.length) {
      throw new Error('无放回采样的大小不能超过数据长度');
    }
    
    // 简单的伪随机数生成器
    const random = (max) => {
      seed = (seed * 9301 + 49297) % 233280;
      return (seed / 233280) * max;
    };
    
    const result = [];
    
    if (replacement) {
      // 有放回采样
      for (let i = 0; i < size; i++) {
        const index = Math.floor(random(data.length));
        result.push(data[index]);
      }
    } else {
      // 无放回采样
      const indices = Array.from({ length: data.length }, (_, i) => i);
      
      for (let i = 0; i < size; i++) {
        const randomIndex = Math.floor(random(indices.length));
        const dataIndex = indices[randomIndex];
        
        // 移除已选索引
        indices.splice(randomIndex, 1);
        
        result.push(data[dataIndex]);
      }
    }
    
    return result;
  }
} 