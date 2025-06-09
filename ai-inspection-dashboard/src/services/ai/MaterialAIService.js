/**
 * 物料AI服务 - 提供物料相关的AI分析功能
 */

import { AIBaseService } from './AIBaseService';

/**
 * 物料AI服务类
 */
export class MaterialAIService extends AIBaseService {
  /**
   * 评估物料风险
   * @param {string} materialCode 物料编码
   * @param {Object} options 选项
   * @returns {Promise<Object>} 风险评估结果
   */
  static async assessRisk(materialCode, options = {}) {
    const cacheKey = `risk_assessment_${materialCode}`;
    
    return this.withCache(cacheKey, async () => {
      try {
        // 构建查询文本
        const queryText = `对物料 ${materialCode} 进行风险评估，考虑以下因素：
1. 历史质量数据
2. 供应商绩效
3. 加工工艺难度
4. 环境因素影响
5. 关键性能参数稳定性

请以JSON格式返回以下内容：
{
  "riskLevel": "high/medium/low",
  "riskScore": 评分（0-100）,
  "riskFactors": [
    { "factor": "因素描述", "impact": "high/medium/low", "description": "详细说明" }
  ],
  "recommendations": [
    { "text": "建议内容", "priority": "high/medium/low" }
  ]
}`;
        
        // 使用基类的查询方法
        const result = await this.executeQuery(queryText, {
          context: {
            task: 'risk_assessment',
            materialCode,
            ...options
          },
          responseFormat: 'json'
        });
        
        // 如果已经解析为JSON
        if (result.parsed) {
          return {
            materialCode,
            ...result.parsed,
            originalResponse: result.response,
            modelInfo: result.modelInfo
          };
        }
        
        // 回退到传统解析方式
        return {
          materialCode,
          riskLevel: this.extractRiskLevel(result.response),
          riskFactors: this.extractRiskFactors(result.response),
          recommendations: this.extractRecommendations(result.response),
          originalResponse: result.response,
          modelInfo: result.modelInfo
        };
      } catch (error) {
        console.error('[MaterialAIService] 风险评估失败:', error);
        throw new Error(`物料风险评估失败: ${error.message}`);
      }
    }, 30 * 60 * 1000); // 缓存30分钟
  }
  
  /**
   * 预测物料质量
   * @param {string} materialCode 物料编码
   * @param {Object} options 选项
   * @returns {Promise<Object>} 质量预测结果
   */
  static async predictQuality(materialCode, options = {}) {
    const cacheKey = `quality_prediction_${materialCode}`;
    
    return this.withCache(cacheKey, async () => {
      try {
        // 构建查询文本
        const queryText = `预测物料 ${materialCode} 的质量趋势，基于历史数据分析未来7天内的质量表现，
考虑关键质量参数、加工工艺稳定性和环境因素。

请以JSON格式返回以下内容：
{
  "qualityTrend": "improving/stable/declining/fluctuating",
  "predictedPassRate": 预测合格率（百分比）,
  "confidence": 预测置信度（百分比）,
  "keyParameters": [
    { "name": "参数名称", "trend": "improving/stable/declining/fluctuating", "importance": "high/medium/low" }
  ],
  "riskAreas": [
    { "area": "风险领域", "description": "描述", "mitigation": "缓解措施" }
  ]
}`;
        
        // 使用基类的查询方法
        const result = await this.executeQuery(queryText, {
          context: {
            task: 'quality_prediction',
            materialCode,
            ...options
          },
          responseFormat: 'json'
        });
        
        // 如果已经解析为JSON
        if (result.parsed) {
          return {
            materialCode,
            ...result.parsed,
            originalResponse: result.response,
            modelInfo: result.modelInfo
          };
        }
        
        // 回退到传统解析方式
        return {
          materialCode,
          qualityTrend: this.extractQualityTrend(result.response),
          predictedPassRate: this.extractPredictedPassRate(result.response),
          keyParameters: this.extractKeyParameters(result.response),
          originalResponse: result.response,
          modelInfo: result.modelInfo
        };
      } catch (error) {
        console.error('[MaterialAIService] 质量预测失败:', error);
        throw new Error(`物料质量预测失败: ${error.message}`);
      }
    }, 30 * 60 * 1000); // 缓存30分钟
  }
  
  /**
   * 预测物料缺陷
   * @param {string} materialCode 物料编码
   * @param {Object} options 选项
   * @returns {Promise<Object>} 缺陷预测结果
   */
  static async predictDefects(materialCode, options = {}) {
    const cacheKey = `defect_prediction_${materialCode}`;
    
    return this.withCache(cacheKey, async () => {
      try {
        // 构建查询文本
        const queryText = `分析物料 ${materialCode} 可能出现的缺陷类型和概率，考虑历史数据和当前工艺参数。

请以JSON格式返回以下内容：
{
  "predictedDefects": [
    { "type": "缺陷类型", "probability": "概率百分比", "impact": "high/medium/low", "prevention": "预防措施" }
  ],
  "overallDefectRisk": "high/medium/low",
  "criticalAreas": ["关键区域1", "关键区域2"]
}`;
        
        // 使用基类的查询方法
        const result = await this.executeQuery(queryText, {
          context: {
            task: 'defect_prediction',
            materialCode,
            ...options
          },
          responseFormat: 'json'
        });
        
        // 如果已经解析为JSON
        if (result.parsed) {
          return {
            materialCode,
            ...result.parsed,
            originalResponse: result.response,
            modelInfo: result.modelInfo
          };
        }
        
        // 回退到传统解析方式
        return {
          materialCode,
          predictedDefects: this.extractPredictedDefects(result.response),
          originalResponse: result.response,
          modelInfo: result.modelInfo
        };
      } catch (error) {
        console.error('[MaterialAIService] 缺陷预测失败:', error);
        throw new Error(`物料缺陷预测失败: ${error.message}`);
      }
    }, 30 * 60 * 1000); // 缓存30分钟
  }
  
  /**
   * 检测物料异常
   * @param {string} materialCode 物料编码
   * @param {Object} options 选项
   * @returns {Promise<Object>} 异常检测结果
   */
  static async detectAnomalies(materialCode, options = {}) {
    const cacheKey = `anomaly_detection_${materialCode}`;
    
    return this.withCache(cacheKey, async () => {
      try {
        // 构建查询文本
        const queryText = `检测物料 ${materialCode} 的异常参数和模式，分析可能的根本原因。

请以JSON格式返回以下内容：
{
  "anomalies": [
    { "parameter": "异常参数", "description": "异常描述", "severity": "high/medium/low" }
  ],
  "rootCauses": [
    { "cause": "原因描述", "confidence": "高/中/低", "evidence": "证据" }
  ],
  "recommendations": [
    { "action": "建议行动", "impact": "high/medium/low", "effort": "high/medium/low" }
  ]
}`;
        
        // 使用基类的查询方法
        const result = await this.executeQuery(queryText, {
          context: {
            task: 'anomaly_detection',
            materialCode,
            ...options
          },
          responseFormat: 'json'
        });
        
        // 如果已经解析为JSON
        if (result.parsed) {
          return {
            materialCode,
            ...result.parsed,
            originalResponse: result.response,
            modelInfo: result.modelInfo
          };
        }
        
        // 回退到传统解析方式
        return {
          materialCode,
          anomalies: this.extractAnomalies(result.response),
          rootCauses: this.extractRootCauses(result.response),
          originalResponse: result.response,
          modelInfo: result.modelInfo
        };
      } catch (error) {
        console.error('[MaterialAIService] 异常检测失败:', error);
        throw new Error(`物料异常检测失败: ${error.message}`);
      }
    }, 15 * 60 * 1000); // 缓存15分钟
  }
  
  /**
   * 生成质量改进建议
   * @param {string} materialCode 物料编码
   * @param {Object} context 上下文信息
   * @returns {Promise<Object>} 改进建议结果
   */
  static async generateQualityRecommendations(materialCode, context = {}) {
    const cacheKey = `quality_recommendations_${materialCode}_${JSON.stringify(context)}`;
    
    return this.withCache(cacheKey, async () => {
      try {
        // 构建查询文本
        const queryText = `为物料 ${materialCode} 生成质量改进建议，考虑当前质量状况和历史数据。

请以JSON格式返回以下内容：
{
  "recommendations": [
    { 
      "content": "建议内容", 
      "category": "工艺改进/物料管理/设备维护/人员管理/质量控制", 
      "priority": "high/medium/low",
      "difficulty": "high/medium/low",
      "expectedImpact": "预期影响"
    }
  ],
  "overallStrategy": "总体改进策略",
  "implementationOrder": ["建议1", "建议2", "建议3"]
}`;
        
        // 使用基类的查询方法
        const result = await this.executeQuery(queryText, {
          context: {
            task: 'quality_recommendations',
            materialCode,
            ...context
          },
          responseFormat: 'json'
        });
        
        // 如果已经解析为JSON
        if (result.parsed) {
          return {
            materialCode,
            ...result.parsed,
            originalResponse: result.response,
            modelInfo: result.modelInfo
          };
        }
        
        // 回退到传统解析方式
        return {
          materialCode,
          recommendations: this.parseRecommendations(result.response),
          originalResponse: result.response,
          modelInfo: result.modelInfo
        };
      } catch (error) {
        console.error('[MaterialAIService] 生成质量建议失败:', error);
        throw new Error(`生成质量建议失败: ${error.message}`);
      }
    }, 60 * 60 * 1000); // 缓存60分钟
  }
  
  /**
   * 分析检验结果
   * @param {Object} result 检验结果数据
   * @returns {Promise<Object>} 分析结果
   */
  static async analyzeInspectionResult(result) {
    const cacheKey = `inspection_analysis_${result.materialCode}_${result.analysisType || 'general'}`;
    
    return this.withCache(cacheKey, async () => {
      try {
        // 获取物料编码和分析类型
        const { materialCode, analysisType = 'general' } = result;
        
        // 构建查询文本
        let queryText = `分析物料 ${materialCode} 的检验结果`;
        
        if (analysisType === 'trend') {
          queryText += '，重点关注数据趋势和变化模式';
        } else if (analysisType === 'comparison') {
          queryText += '，与历史数据和标准进行对比分析';
        }
        
        queryText += `

请以JSON格式返回以下内容：
{
  "insights": [
    "关键发现1",
    "关键发现2"
  ],
  "trends": {
    "overall": "improving/stable/declining/fluctuating",
    "parameters": {
      "参数1": "improving/stable/declining/fluctuating",
      "参数2": "improving/stable/declining/fluctuating"
    }
  },
  "recommendations": [
    { "text": "建议内容", "priority": "high/medium/low" }
  ],
  "conclusion": "总结性结论"
}`;
        
        // 使用基类的查询方法
        const aiResult = await this.executeQuery(queryText, {
          context: {
            task: 'inspection_analysis',
            materialCode,
            analysisType,
            rawData: result
          },
          responseFormat: 'json'
        });
        
        // 如果已经解析为JSON
        if (aiResult.parsed) {
          return {
            materialCode,
            analysisType,
            ...aiResult.parsed,
            rawResponse: aiResult.response,
            modelInfo: aiResult.modelInfo
          };
        }
        
        // 回退到传统解析方式
        return {
          materialCode,
          analysisType,
          insights: this.extractInsights(aiResult.response),
          trends: this.extractTrends(aiResult.response),
          rawResponse: aiResult.response,
          modelInfo: aiResult.modelInfo
        };
      } catch (error) {
        console.error('[MaterialAIService] 分析检验结果失败:', error);
        return {
          materialCode: result.materialCode,
          success: false,
          error: error.message,
          insights: [],
          trends: {}
        };
      }
    }, 15 * 60 * 1000); // 缓存15分钟
  }

  // ===== 现有的辅助方法可以保留作为回退，但在正常情况下应该使用JSON响应 =====
}

// 默认导出
export default MaterialAIService; 