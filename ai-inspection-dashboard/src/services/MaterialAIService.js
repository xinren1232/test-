/**
 * 物料AI服务 - 提供物料分析和预测功能
 * 整合工厂、实验室和生产线数据，为IQE提供物料相关的AI分析
 */

import { AIEngine } from './core/AIEngine';
import { DataPreprocessor } from './core/DataPreprocessor';
import { ModelRegistry } from './core/ModelRegistry';

// 物料风险等级
export const RISK_LEVELS = {
  LOW: { value: 'low', label: '低风险', color: '#67C23A' },
  MEDIUM: { value: 'medium', label: '中等风险', color: '#E6A23C' },
  HIGH: { value: 'high', label: '高风险', color: '#F56C6C' },
  CRITICAL: { value: 'critical', label: '严重风险', color: '#8B0000' }
};

// 物料AI服务类
export class MaterialAIService {
  // 物料风险评估
  static async assessRisk(materialData, options = {}) {
    try {
      // 数据预处理
      const cleanedData = DataPreprocessor.cleanData(materialData, {
        removeNulls: true,
        removeDuplicates: true
      });
      
      // 调用AI引擎进行风险分析
      const result = await AIEngine.execute('analyze', {
        type: 'risk',
        data: cleanedData,
        options
      });
      
      // 增强结果
      return this.enhanceRiskAssessment(result, materialData);
    } catch (error) {
      console.error('物料风险评估失败:', error);
      throw error;
    }
  }
  
  // 增强风险评估结果
  static enhanceRiskAssessment(result, originalData) {
    // 添加风险等级标签和颜色
    const enhancedResult = { ...result };
    
    // 根据风险分数确定风险等级
    const riskScore = enhancedResult.riskScore || 0;
    
    if (riskScore >= 80) {
      enhancedResult.riskLevel = RISK_LEVELS.CRITICAL;
    } else if (riskScore >= 60) {
      enhancedResult.riskLevel = RISK_LEVELS.HIGH;
    } else if (riskScore >= 40) {
      enhancedResult.riskLevel = RISK_LEVELS.MEDIUM;
    } else {
      enhancedResult.riskLevel = RISK_LEVELS.LOW;
    }
    
    // 添加建议检验策略
    enhancedResult.recommendedStrategy = this.generateRecommendedStrategy(enhancedResult, originalData);
    
    // 添加历史对比
    enhancedResult.historicalComparison = this.compareWithHistory(enhancedResult, originalData);
    
    return enhancedResult;
  }
  
  // 生成建议检验策略
  static generateRecommendedStrategy(riskAssessment, originalData) {
    const { riskLevel } = riskAssessment;
    
    // 根据风险等级生成不同的策略
    switch (riskLevel.value) {
      case 'critical':
        return {
          inspectionLevel: '全检',
          sampleSize: '100%',
          frequency: '每批次',
          additionalTests: ['成分分析', '物理性能', '可靠性测试', '加速老化测试'],
          priority: '最高',
          description: '该物料存在严重风险，建议进行全检并增加额外测试项目。'
        };
      case 'high':
        return {
          inspectionLevel: '加严抽检',
          sampleSize: 'AQL 0.65',
          frequency: '每批次',
          additionalTests: ['成分分析', '物理性能'],
          priority: '高',
          description: '该物料存在高风险，建议加严抽检并关注关键性能参数。'
        };
      case 'medium':
        return {
          inspectionLevel: '正常抽检',
          sampleSize: 'AQL 1.0',
          frequency: '每批次',
          additionalTests: [],
          priority: '中',
          description: '该物料风险适中，建议按正常抽检标准执行。'
        };
      case 'low':
        return {
          inspectionLevel: '简化检验',
          sampleSize: 'AQL 2.5',
          frequency: '抽批次',
          additionalTests: [],
          priority: '低',
          description: '该物料风险较低，可适当简化检验流程。'
        };
      default:
        return {
          inspectionLevel: '正常抽检',
          sampleSize: 'AQL 1.0',
          frequency: '每批次',
          additionalTests: [],
          priority: '中',
          description: '按标准检验流程执行。'
        };
    }
  }
  
  // 与历史数据对比
  static compareWithHistory(currentAssessment, originalData) {
    // 模拟历史对比
    // 实际应用中应从数据库获取历史数据
    
    return {
      trendDirection: 'up', // 'up', 'down', 'stable'
      changePercentage: 15,
      previousScore: currentAssessment.riskScore * 0.85,
      historicalAverage: currentAssessment.riskScore * 0.9,
      significantChange: true
    };
  }
  
  // 物料缺陷预测
  static async predictDefects(materialData, options = {}) {
    try {
      // 数据预处理
      const cleanedData = DataPreprocessor.cleanData(materialData, {
        removeNulls: true,
        removeDuplicates: true
      });
      
      // 特征工程
      const featuredData = DataPreprocessor.engineerFeatures(cleanedData, [
        {
          name: 'process_stability',
          type: 'ratio',
          fields: ['std_deviation', 'mean_value']
        },
        {
          name: 'quality_trend',
          type: 'window',
          fields: ['defect_rate'],
          params: { windowSize: 5, operation: 'avg' }
        }
      ]);
      
      // 调用AI引擎进行缺陷预测
      return await AIEngine.execute('predict', {
        type: 'defect',
        data: featuredData,
        options
      });
    } catch (error) {
      console.error('物料缺陷预测失败:', error);
      throw error;
    }
  }
  
  // 物料质量趋势预测
  static async predictQualityTrend(materialData, timeRange, options = {}) {
    try {
      // 数据预处理
      const cleanedData = DataPreprocessor.cleanData(materialData, {
        removeNulls: true,
        removeDuplicates: true
      });
      
      // 调用AI引擎进行趋势预测
      return await AIEngine.execute('predict', {
        type: 'trend',
        data: cleanedData,
        timeRange,
        options
      });
    } catch (error) {
      console.error('物料质量趋势预测失败:', error);
      throw error;
    }
  }
  
  // 物料批次相关性分析
  static async analyzeBatchCorrelation(batches, options = {}) {
    try {
      // 调用AI引擎进行相关性分析
      return await AIEngine.execute('analyze', {
        type: 'correlation',
        data: batches,
        options
      });
    } catch (error) {
      console.error('物料批次相关性分析失败:', error);
      throw error;
    }
  }
  
  // 物料检验策略推荐
  static async recommendInspectionStrategy(materialCode, context = {}) {
    try {
      // 调用AI引擎生成推荐
      return await AIEngine.execute('recommend', {
        materialCode,
        context,
        goal: 'quality'
      });
    } catch (error) {
      console.error('物料检验策略推荐失败:', error);
      throw error;
    }
  }
  
  // 物料异常检测
  static async detectAnomalies(materialData, options = {}) {
    try {
      const { sensitivity = 3, algorithm = 'zscore' } = options;
      
      // 数据预处理
      const cleanedData = DataPreprocessor.cleanData(materialData, {
        removeNulls: true,
        removeDuplicates: true
      });
      
      // 调用AI引擎进行异常检测
      return await AIEngine.execute('detect', {
        data: cleanedData,
        algorithm,
        sensitivity,
        context: { materialData }
      });
    } catch (error) {
      console.error('物料异常检测失败:', error);
      throw error;
    }
  }
  
  // 物料供应商风险评估
  static async assessSupplierRisk(supplierData, materialData, options = {}) {
    try {
      // 数据预处理
      const cleanedSupplierData = DataPreprocessor.cleanData(supplierData, {
        removeNulls: true,
        removeDuplicates: true
      });
      
      const cleanedMaterialData = DataPreprocessor.cleanData(materialData, {
        removeNulls: true,
        removeDuplicates: true
      });
      
      // 合并数据
      const combinedData = cleanedSupplierData.map(supplier => {
        const supplierMaterials = cleanedMaterialData.filter(
          material => material.supplierId === supplier.id
        );
        
        return {
          ...supplier,
          materials: supplierMaterials
        };
      });
      
      // 调用AI引擎进行风险分析
      return await AIEngine.execute('analyze', {
        type: 'risk',
        data: combinedData,
        options: {
          ...options,
          analysisType: 'supplier'
        }
      });
    } catch (error) {
      console.error('物料供应商风险评估失败:', error);
      throw error;
    }
  }
  
  // 物料决策解释
  static async explainDecision(decisionId, context = {}) {
    try {
      // 调用AI引擎进行决策解释
      return await AIEngine.execute('explain', {
        decisionId,
        context
      });
    } catch (error) {
      console.error('物料决策解释失败:', error);
      throw error;
    }
  }
  
  // 初始化默认模型
  static initDefaultModels() {
    // 注册风险评估模型
    ModelRegistry.registerSimpleModel(
      'default-risk-assessment',
      this.defaultRiskAssessmentModel,
      {
        type: 'risk-assessment',
        isDefault: true,
        version: '1.0.0',
        description: '默认物料风险评估模型',
        author: 'IQE-AI-Team'
      }
    );
    
    // 注册缺陷预测模型
    ModelRegistry.registerSimpleModel(
      'default-defect-prediction',
      this.defaultDefectPredictionModel,
      {
        type: 'defect-prediction',
        isDefault: true,
        version: '1.0.0',
        description: '默认物料缺陷预测模型',
        author: 'IQE-AI-Team'
      }
    );
    
    // 注册趋势预测模型
    ModelRegistry.registerSimpleModel(
      'default-trend-prediction',
      this.defaultTrendPredictionModel,
      {
        type: 'trend-prediction',
        isDefault: true,
        version: '1.0.0',
        description: '默认物料趋势预测模型',
        author: 'IQE-AI-Team'
      }
    );
    
    console.log('[MaterialAIService] 默认模型初始化完成');
  }
  
  // 默认风险评估模型
  static defaultRiskAssessmentModel(data) {
    // 简单的风险评估逻辑
    // 实际应用中应使用更复杂的模型
    
    // 计算平均缺陷率
    const defectRates = data.map(item => item.defectRate || 0);
    const avgDefectRate = defectRates.length > 0
      ? defectRates.reduce((sum, rate) => sum + rate, 0) / defectRates.length
      : 0;
    
    // 计算供应商稳定性
    const supplierIds = new Set(data.map(item => item.supplierId));
    const supplierStability = 1 - (supplierIds.size / Math.max(data.length, 1));
    
    // 计算批次一致性
    const batchConsistency = this.calculateBatchConsistency(data);
    
    // 计算风险分数 (0-100)
    const riskScore = Math.min(100, Math.max(0,
      avgDefectRate * 100 +
      (1 - supplierStability) * 30 +
      (1 - batchConsistency) * 40
    ));
    
    return {
      riskScore,
      factors: {
        avgDefectRate,
        supplierStability,
        batchConsistency
      },
      details: {
        defectRateContribution: avgDefectRate * 100,
        supplierStabilityContribution: (1 - supplierStability) * 30,
        batchConsistencyContribution: (1 - batchConsistency) * 40
      }
    };
  }
  
  // 默认缺陷预测模型
  static defaultDefectPredictionModel(data) {
    // 简单的缺陷预测逻辑
    // 实际应用中应使用更复杂的模型
    
    // 计算历史平均缺陷率
    const defectRates = data.map(item => item.defectRate || 0);
    const avgDefectRate = defectRates.length > 0
      ? defectRates.reduce((sum, rate) => sum + rate, 0) / defectRates.length
      : 0;
    
    // 计算趋势
    const trend = defectRates.length >= 3
      ? (defectRates[defectRates.length - 1] - defectRates[0]) / defectRates.length
      : 0;
    
    // 预测未来缺陷率
    const predictedDefectRate = Math.max(0, Math.min(1, avgDefectRate + trend * 2));
    
    // 预测主要缺陷类型
    const defectTypes = [
      { type: '尺寸偏差', probability: 0.4 },
      { type: '表面缺陷', probability: 0.3 },
      { type: '材质不符', probability: 0.2 },
      { type: '功能异常', probability: 0.1 }
    ];
    
    return {
      predictedDefectRate,
      trend,
      defectTypes,
      confidence: 0.75,
      predictionHorizon: '30天'
    };
  }
  
  // 默认趋势预测模型
  static defaultTrendPredictionModel(data, timeRange) {
    // 简单的趋势预测逻辑
    // 实际应用中应使用更复杂的模型
    
    // 提取时间序列数据
    const timeSeriesData = data
      .filter(item => item.timestamp && item.value !== undefined)
      .sort((a, b) => a.timestamp - b.timestamp);
    
    if (timeSeriesData.length < 2) {
      return {
        trend: 'stable',
        prediction: [],
        confidence: 0
      };
    }
    
    // 计算简单线性回归
    const { slope, intercept } = this.calculateLinearRegression(
      timeSeriesData.map((item, index) => index),
      timeSeriesData.map(item => item.value)
    );
    
    // 确定趋势方向
    let trend;
    if (slope > 0.05) trend = 'up';
    else if (slope < -0.05) trend = 'down';
    else trend = 'stable';
    
    // 生成预测点
    const lastTimestamp = timeSeriesData[timeSeriesData.length - 1].timestamp;
    const timeStep = (timeSeriesData[timeSeriesData.length - 1].timestamp - timeSeriesData[0].timestamp) / Math.max(1, timeSeriesData.length - 1);
    
    const prediction = Array.from({ length: 5 }, (_, i) => {
      const futureIndex = timeSeriesData.length + i;
      const predictedValue = intercept + slope * futureIndex;
      
      return {
        timestamp: lastTimestamp + (i + 1) * timeStep,
        value: predictedValue,
        confidence: Math.max(0, 1 - (i * 0.1))
      };
    });
    
    return {
      trend,
      prediction,
      confidence: 0.8,
      model: {
        type: 'linear',
        slope,
        intercept
      }
    };
  }
  
  // 计算批次一致性
  static calculateBatchConsistency(data) {
    if (data.length < 2) return 1;
    
    // 按批次分组
    const batchGroups = new Map();
    data.forEach(item => {
      if (!item.batchId) return;
      
      if (!batchGroups.has(item.batchId)) {
        batchGroups.set(item.batchId, []);
      }
      
      batchGroups.get(item.batchId).push(item);
    });
    
    if (batchGroups.size < 2) return 1;
    
    // 计算批次间方差
    const batchMeans = Array.from(batchGroups.values()).map(batch => {
      const values = batch.map(item => item.value || 0);
      return values.reduce((sum, val) => sum + val, 0) / values.length;
    });
    
    const overallMean = batchMeans.reduce((sum, mean) => sum + mean, 0) / batchMeans.length;
    const variance = batchMeans.reduce((sum, mean) => sum + Math.pow(mean - overallMean, 2), 0) / batchMeans.length;
    
    // 计算一致性分数 (0-1)
    return Math.max(0, Math.min(1, 1 - Math.sqrt(variance) / overallMean));
  }
  
  // 计算线性回归
  static calculateLinearRegression(x, y) {
    const n = x.length;
    
    // 计算平均值
    const xMean = x.reduce((sum, val) => sum + val, 0) / n;
    const yMean = y.reduce((sum, val) => sum + val, 0) / n;
    
    // 计算斜率和截距
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (x[i] - xMean) * (y[i] - yMean);
      denominator += Math.pow(x[i] - xMean, 2);
    }
    
    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = yMean - slope * xMean;
    
    return { slope, intercept };
  }
} 