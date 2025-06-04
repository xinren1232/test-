// 分析服务模块 - 处理高级数据分析功能

/**
 * 计算两个数组之间的皮尔逊相关系数
 * @param {Array<number>} x 第一个数据数组 
 * @param {Array<number>} y 第二个数据数组
 * @returns {number} 相关系数，范围 [-1, 1]
 */
export function calculatePearsonCorrelation(x, y) {
  // 确保两个数组长度相同
  if (x.length !== y.length) {
    throw new Error('数组长度不匹配');
  }
  
  const n = x.length;
  
  // 计算平均值
  let sumX = 0;
  let sumY = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
  }
  const meanX = sumX / n;
  const meanY = sumY / n;
  
  // 计算协方差和方差
  let covariance = 0;
  let varX = 0;
  let varY = 0;
  
  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    
    covariance += diffX * diffY;
    varX += diffX * diffX;
    varY += diffY * diffY;
  }
  
  // 计算相关系数
  if (varX === 0 || varY === 0) {
    return 0; // 避免除以零
  }
  
  return covariance / Math.sqrt(varX * varY);
}

/**
 * 计算相关性矩阵
 * @param {Array<Array<number>>} data 二维数组，每行代表一个特征的值
 * @returns {Array<Array<number>>} 相关性矩阵
 */
export function calculateCorrelationMatrix(data) {
  const n = data.length;
  const matrix = Array(n).fill().map(() => Array(n).fill(0));
  
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1; // 自相关始终为1
      } else {
        const correlation = calculatePearsonCorrelation(data[i], data[j]);
        matrix[i][j] = correlation;
        matrix[j][i] = correlation; // 相关系数矩阵是对称的
      }
    }
  }
  
  return matrix;
}

/**
 * 从原始数据中提取特定参数进行相关性分析
 * @param {Array<Object>} rawData 包含多个参数的原始数据数组
 * @param {Array<string>} parameters 需要分析的参数名称数组
 * @returns {Array<Array<number>>} 转换后的二维数组，每行是一个参数的所有值
 */
export function extractParametersForAnalysis(rawData, parameters) {
  const result = parameters.map(param => []);
  
  rawData.forEach(item => {
    parameters.forEach((param, index) => {
      // 处理嵌套属性路径，如 'specifications.thickness'
      const value = getNestedValue(item, param);
      if (value !== undefined && !isNaN(Number(value))) {
        result[index].push(Number(value));
      }
    });
  });
  
  return result;
}

/**
 * 获取对象的嵌套属性值
 * @param {Object} obj 对象
 * @param {string} path 属性路径，如 'specifications.thickness'
 * @returns {any} 属性值
 */
function getNestedValue(obj, path) {
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value === undefined || value === null) {
      return undefined;
    }
    value = value[key];
  }
  
  return value;
}

/**
 * 计算物料参数的相关性
 * @param {Array<Object>} materialData 物料数据
 * @param {Array<string>} parameters 参数名称
 * @returns {Object} 相关性结果
 */
export function analyzeMaterialCorrelation(materialData, parameters) {
  // 提取要分析的参数数据
  const extractedData = extractParametersForAnalysis(materialData, parameters);
  
  // 计算相关性矩阵
  const correlationMatrix = calculateCorrelationMatrix(extractedData);
  
  // 生成相关性洞察
  const insights = generateCorrelationInsights(correlationMatrix, parameters);
  
  return {
    data: correlationMatrix,
    dimensions: parameters,
    insights
  };
}

/**
 * 根据相关性矩阵生成洞察
 * @param {Array<Array<number>>} matrix 相关性矩阵
 * @param {Array<string>} parameters 参数名称
 * @returns {Array<string>} 洞察结果
 */
function generateCorrelationInsights(matrix, parameters) {
  const insights = [];
  const threshold = 0.7; // 强相关阈值
  const negativeThreshold = -0.7; // 强负相关阈值
  
  // 寻找强相关的参数对
  for (let i = 0; i < matrix.length; i++) {
    for (let j = i + 1; j < matrix[i].length; j++) {
      const correlation = matrix[i][j];
      
      if (correlation >= threshold) {
        insights.push(`${parameters[i]}和${parameters[j]}存在强相关性(${correlation.toFixed(2)})，可能相互影响`);
      } else if (correlation <= negativeThreshold) {
        insights.push(`${parameters[i]}和${parameters[j]}存在强负相关性(${correlation.toFixed(2)})，可能互为消长关系`);
      }
    }
  }
  
  // 如果没有发现强相关，添加一条默认洞察
  if (insights.length === 0) {
    insights.push('未发现参数间的强相关性，各参数可能相对独立');
  }
  
  return insights;
}

/**
 * 基于实验室检测数据分析批次质量趋势
 * @param {Array<Object>} labTestData 实验室检测数据
 * @param {string} materialCode 物料代码
 * @param {number} timeRange 时间范围(天)
 * @returns {Object} 趋势分析结果
 */
export function analyzeBatchQualityTrend(labTestData, materialCode, timeRange = 90) {
  // 筛选指定物料的测试数据
  const filteredData = labTestData.filter(test => test.materialCode === materialCode);
  
  // 按日期排序
  filteredData.sort((a, b) => new Date(a.testDate) - new Date(b.testDate));
  
  // 计算当前日期
  const now = new Date();
  const cutoffDate = new Date();
  cutoffDate.setDate(now.getDate() - timeRange);
  
  // 筛选时间范围内的数据
  const recentData = filteredData.filter(test => new Date(test.testDate) >= cutoffDate);
  
  // 提取日期和不良率
  const dates = [];
  const defectRates = [];
  
  recentData.forEach(test => {
    // 解析日期
    dates.push(test.testDate);
    
    // 解析不良率
    let rate = 0;
    const defectRate = test.defectRate;
    
    if (typeof defectRate === 'string') {
      // 尝试提取百分比
      const percentMatch = defectRate.match(/(\d+(?:\.\d+)?)%/);
      if (percentMatch) {
        rate = parseFloat(percentMatch[1]);
      } else {
        // 尝试解析形如"2/3(66.7%)"的格式
        const fractionMatch = defectRate.match(/\((\d+(?:\.\d+)?)%\)/);
        if (fractionMatch) {
          rate = parseFloat(fractionMatch[1]);
        }
      }
    } else if (typeof defectRate === 'number') {
      rate = defectRate;
    }
    
    defectRates.push(rate);
  });
  
  // 计算趋势和预测
  return {
    materialCode,
    dates,
    defectRates,
    average: defectRates.length ? defectRates.reduce((sum, val) => sum + val, 0) / defectRates.length : 0,
    // 简单线性预测(示例)
    prediction: calculateSimpleLinearPrediction(defectRates, 3) // 预测未来3个点
  };
}

/**
 * 简单线性预测
 * @param {Array<number>} data 历史数据
 * @param {number} steps 预测步数
 * @returns {Array<number>} 预测结果
 */
function calculateSimpleLinearPrediction(data, steps) {
  if (data.length < 2) {
    return [];
  }
  
  // 计算简单线性回归
  const n = data.length;
  const x = Array.from({length: n}, (_, i) => i);
  
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += data[i];
    sumXY += x[i] * data[i];
    sumX2 += x[i] * x[i];
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // 预测未来几步
  const prediction = [];
  for (let i = 1; i <= steps; i++) {
    prediction.push(slope * (n + i - 1) + intercept);
  }
  
  return prediction;
}

// 导出分析服务
export default {
  calculatePearsonCorrelation,
  calculateCorrelationMatrix,
  extractParametersForAnalysis,
  analyzeMaterialCorrelation,
  analyzeBatchQualityTrend
}; 