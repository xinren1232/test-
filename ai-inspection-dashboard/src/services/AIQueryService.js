/**
 * AI查询服务 - 提供自然语言查询和分析功能
 * 用于处理用户的自然语言查询，将其转换为系统可执行的命令
 */

import { AIEngine } from './core/AIEngine';
import { MaterialAIService } from './ai/MaterialAIService';
import { AIInitializer } from './ai/AIInitializer';
import { AIModelConfigService } from './ai/AIModelConfigService';

// 命令映射定义
const COMMAND_PATTERNS = [
  {
    pattern: /风险(评估|分析|等级|预测|如何)|安全(隐患|问题)/i,
    command: 'assessRisk',
    service: 'material',
    extractParams: (text) => {
      const materialCodeMatch = text.match(/物料[号码]?[是为:]?\s*([A-Z0-9-]+)/i);
      return {
        materialCode: materialCodeMatch ? materialCodeMatch[1] : null
      };
    }
  },
  {
    pattern: /质量(预测|趋势|走势|变化|如何|怎么样)/i,
    command: 'predictQuality',
    service: 'material',
    extractParams: (text) => {
      const materialCodeMatch = text.match(/物料[号码]?[是为:]?\s*([A-Z0-9-]+)/i);
      return {
        materialCode: materialCodeMatch ? materialCodeMatch[1] : null
      };
    }
  },
  {
    pattern: /(缺陷|不良品|问题)(预测|可能|概率|风险)/i,
    command: 'predictDefects',
    service: 'material',
    extractParams: (text) => {
      const materialCodeMatch = text.match(/物料[号码]?[是为:]?\s*([A-Z0-9-]+)/i);
      return {
        materialCode: materialCodeMatch ? materialCodeMatch[1] : null
      };
    }
  },
  {
    pattern: /异常[检测|识别|发现]/i,
    command: 'detectAnomalies',
    service: 'material',
    extractParams: (text) => {
      const materialCodeMatch = text.match(/物料[号码]?[是为:]?\s*([A-Z0-9-]+)/i);
      const sensitivityMatch = text.match(/灵敏度[是为:]\s*(\d+)/i);
      return {
        materialCode: materialCodeMatch ? materialCodeMatch[1] : null,
        options: {
          sensitivity: sensitivityMatch ? parseInt(sensitivityMatch[1]) : 3
        }
      };
    }
  },
  {
    pattern: /(建议|推荐|改进|优化|提升)/i,
    command: 'generateQualityRecommendations',
    service: 'material',
    extractParams: (text) => {
      const materialCodeMatch = text.match(/物料[号码]?[是为:]?\s*([A-Z0-9-]+)/i);
      return {
        materialCode: materialCodeMatch ? materialCodeMatch[1] : null,
        context: {
          focus: text.includes('成本') ? 'cost' : 
                 text.includes('效率') ? 'efficiency' : 'quality'
        }
      };
    }
  }
];

export class AIQueryService {
  /**
   * 解析自然语言查询
   * @param {string} query 用户查询文本
   * @param {Object} context 上下文信息
   * @return {Object} 解析结果
   */
  static parseQuery(query, context = {}) {
    if (!query) {
      return {
        success: false,
        error: '查询不能为空'
      };
    }
    
    // 如果上下文中有materialCode，使用它
    const defaultMaterialCode = context.materialCode || null;
    
    // 遍历命令模式，寻找匹配项
    for (const pattern of COMMAND_PATTERNS) {
      if (pattern.pattern.test(query)) {
        const params = pattern.extractParams(query);
        
        // 如果没有提取到materialCode，但上下文有默认值，使用默认值
        if (!params.materialCode && defaultMaterialCode) {
          params.materialCode = defaultMaterialCode;
        }
        
        return {
          success: true,
          command: pattern.command,
          service: pattern.service,
          params,
          query
        };
      }
    }
    
    // 如果没有匹配到预定义命令，尝试通用解析
    return this.parseGenericQuery(query, context);
  }
  
  /**
   * 解析通用查询
   * @param {string} query 用户查询文本
   * @param {Object} context 上下文信息
   * @return {Object} 解析结果
   */
  static parseGenericQuery(query, context) {
    // 在实际应用中，可以使用更复杂的NLP进行意图识别
    // 这里使用简化的启发式方法
    
    // 检查是否是关于物料的问题
    if (/物料|材料|原材料|原料/.test(query)) {
      return {
        success: true,
        command: 'analyze',
        service: 'generic',
        params: {
          query,
          type: 'material',
          context
        },
        query
      };
    }
    
    // 检查是否是关于检验的问题
    if (/检验|检查|测试|测量|质检/.test(query)) {
      return {
        success: true,
        command: 'analyze',
        service: 'generic',
        params: {
          query,
          type: 'inspection',
          context
        },
        query
      };
    }
    
    // 默认为通用查询
    return {
      success: true,
      command: 'query',
      service: 'assistant',
      params: {
        query,
        context
      },
      query
    };
  }
  
  /**
   * 执行AI查询
   * @param {string} query 用户查询文本
   * @param {Object} context 上下文信息
   * @return {Promise<Object>} 查询结果
   */
  static async executeQuery(query, context = {}) {
    try {
      // 解析查询
      const parsedQuery = this.parseQuery(query, context);
      
      if (!parsedQuery.success) {
        return {
          success: false,
          error: parsedQuery.error,
          response: '抱歉，我无法理解您的问题。请尝试用不同的方式提问。'
        };
      }
      
      // 基于解析结果执行对应服务的命令
      const { command, service, params } = parsedQuery;
      
      let result;
      
      // 路由到对应服务
      switch (service) {
        case 'material':
          result = await this.executeMaterialServiceCommand(command, params);
          break;
        case 'generic':
          result = await this.executeGenericCommand(command, params);
          break;
        case 'assistant':
          result = await this.executeAssistantCommand(params);
          break;
        default:
          return {
            success: false,
            error: `未知服务: ${service}`,
            response: '抱歉，我无法处理您的请求。'
          };
      }
      
      // 格式化响应
      return this.formatResponse(result, parsedQuery);
    } catch (error) {
      console.error('AI查询执行失败:', error);
      return {
        success: false,
        error: error.message,
        response: '抱歉，处理您的请求时发生错误。请稍后再试。'
      };
    }
  }
  
  /**
   * 执行物料服务命令
   * @param {string} command 命令
   * @param {Object} params 参数
   * @return {Promise<Object>} 执行结果
   */
  static async executeMaterialServiceCommand(command, params) {
    // 检查物料服务是否可用
    if (!MaterialAIService[command]) {
      throw new Error(`物料服务不支持命令: ${command}`);
    }
    
    // 执行命令
    return await MaterialAIService[command](params.materialCode, params.options || params.context);
  }
  
  /**
   * 执行通用命令
   * @param {string} command 命令
   * @param {Object} params 参数
   * @return {Promise<Object>} 执行结果
   */
  static async executeGenericCommand(command, params) {
    // 这里可以实现更复杂的通用命令处理逻辑
    return {
      type: params.type,
      query: params.query,
      response: `这是关于${params.type}的分析结果`
    };
  }
  
  /**
   * 执行助手命令 - 使用配置的AI模型
   * @param {Object} params 参数
   * @return {Promise<Object>} 执行结果
   */
  static async executeAssistantCommand(params) {
    // 获取当前活跃的AI对话模型
    const activeModel = AIInitializer.getActiveConversationModel();
    
    if (!activeModel) {
      console.warn('未找到活跃的AI对话模型，使用备用处理方式');
      return {
        query: params.query,
        response: `我收到了您的问题: "${params.query}"，但我目前无法提供完整的回答。`,
        model: 'fallback'
      };
    }
    
    try {
      // 使用AI模型处理查询
      console.log(`使用AI模型 [${activeModel.name}] 处理查询`);
      
      // 调用模型的query方法
      const result = await activeModel.query({
        query: params.query,
        context: params.context || {}
      });
      
      return {
        ...result,
        query: params.query
      };
    } catch (error) {
      console.error('AI模型查询失败:', error);
      
      // 尝试使用备用模型
      try {
        const backupModel = AIInitializer.getConversationModel(true);
        if (backupModel) {
          console.log(`主模型失败，使用备用模型 [${backupModel.name}]`);
          
          const backupResult = await backupModel.query({
            query: params.query,
            context: params.context || {}
          });
          
          return {
            ...backupResult,
            query: params.query,
            usedBackup: true
          };
        }
      } catch (backupError) {
        console.error('备用模型也失败:', backupError);
      }
      
      // 如果主模型和备用模型都失败，返回错误
      throw error;
    }
  }
  
  /**
   * 格式化响应
   * @param {Object} result 执行结果
   * @param {Object} parsedQuery 解析后的查询
   * @return {Object} 格式化后的响应
   */
  static formatResponse(result, parsedQuery) {
    const { command, service } = parsedQuery;
    
    // 根据不同命令格式化响应
    let formattedResponse;
    
    if (service === 'material') {
      switch (command) {
        case 'assessRisk':
          formattedResponse = this.formatRiskAssessmentResponse(result);
          break;
        case 'predictQuality':
          formattedResponse = this.formatQualityPredictionResponse(result);
          break;
        case 'predictDefects':
          formattedResponse = this.formatDefectPredictionResponse(result);
          break;
        case 'detectAnomalies':
          formattedResponse = this.formatAnomalyDetectionResponse(result);
          break;
        case 'generateQualityRecommendations':
          formattedResponse = this.formatRecommendationsResponse(result);
          break;
        default:
          formattedResponse = `物料分析结果: ${JSON.stringify(result)}`;
      }
    } else if (service === 'assistant') {
      // 对于AI助手，直接使用模型返回的响应
      formattedResponse = result.response;
    } else {
      // 通用格式化
      formattedResponse = `分析结果: ${result.response || JSON.stringify(result)}`;
    }
    
    return {
      success: true,
      command,
      service,
      response: formattedResponse,
      rawResult: result,
      modelInfo: result.model ? {
        id: result.model,
        confidence: result.confidence,
        usedBackup: result.usedBackup || false
      } : undefined
    };
  }
  
  /**
   * 格式化风险评估响应
   * @param {Object} result 评估结果
   * @return {string} 格式化的响应
   */
  static formatRiskAssessmentResponse(result) {
    const { materialCode, riskScore, riskLevel, keyFactors } = result;
    
    let response = `物料 ${materialCode} 的风险评估结果:\n\n`;
    response += `- 风险评分: ${riskScore.toFixed(2)}/100\n`;
    response += `- 风险等级: ${riskLevel}\n\n`;
    
    if (keyFactors && keyFactors.length > 0) {
      response += '主要风险因素:\n';
      keyFactors.forEach(factor => {
        response += `- ${factor.factor}: ${factor.description}\n`;
      });
    }
    
    return response;
  }
  
  /**
   * 格式化质量预测响应
   * @param {Object} result 预测结果
   * @return {string} 格式化的响应
   */
  static formatQualityPredictionResponse(result) {
    const { materialCode, qualityPredictions } = result;
    
    let response = `物料 ${materialCode} 的质量预测结果:\n\n`;
    
    if (qualityPredictions && qualityPredictions.length > 0) {
      // 在实际应用中，这里可以更详细地描述预测结果
      const avgQuality = qualityPredictions.reduce((sum, q) => sum + q.value, 0) / qualityPredictions.length;
      response += `- 预测平均质量: ${avgQuality.toFixed(2)}/100\n`;
      response += `- 预测趋势: ${avgQuality > 80 ? '良好' : avgQuality > 60 ? '一般' : '需要注意'}\n`;
      response += `- 预测时长: ${qualityPredictions.length} 天\n`;
    } else {
      response += '暂无有效的质量预测数据。\n';
    }
    
    return response;
  }
  
  /**
   * 格式化缺陷预测响应
   * @param {Object} result 预测结果
   * @return {string} 格式化的响应
   */
  static formatDefectPredictionResponse(result) {
    const { materialCode, potentialDefects, defectProbabilities } = result;
    
    let response = `物料 ${materialCode} 的缺陷预测结果:\n\n`;
    
    if (potentialDefects && potentialDefects.length > 0) {
      response += '可能的缺陷:\n';
      
      potentialDefects.forEach((defect, index) => {
        const probability = defectProbabilities && defectProbabilities[index] 
          ? `${(defectProbabilities[index] * 100).toFixed(1)}%` 
          : '未知';
        
        response += `- ${defect}: 概率${probability}\n`;
      });
    } else {
      response += '未检测到潜在缺陷。\n';
    }
    
    return response;
  }
  
  /**
   * 格式化异常检测响应
   * @param {Object} result 检测结果
   * @return {string} 格式化的响应
   */
  static formatAnomalyDetectionResponse(result) {
    const { materialCode, anomalies } = result;
    
    let response = `物料 ${materialCode} 的异常检测结果:\n\n`;
    
    if (anomalies && anomalies.length > 0) {
      response += `检测到 ${anomalies.length} 个异常:\n`;
      
      anomalies.forEach((anomaly, index) => {
        response += `- 异常 #${index + 1}: ${anomaly.description || '未知异常'}\n`;
        if (anomaly.date) {
          const date = new Date(anomaly.date);
          response += `  日期: ${date.toLocaleDateString()}\n`;
        }
        if (anomaly.value !== undefined) {
          response += `  异常值: ${anomaly.value}\n`;
        }
        if (anomaly.severity !== undefined) {
          response += `  严重程度: ${anomaly.severity}\n`;
        }
        response += '\n';
      });
    } else {
      response += '未检测到异常。\n';
    }
    
    return response;
  }
  
  /**
   * 格式化推荐建议响应
   * @param {Object} result 建议结果
   * @return {string} 格式化的响应
   */
  static formatRecommendationsResponse(result) {
    const { materialCode, recommendations } = result;
    
    let response = `物料 ${materialCode} 的质量改进建议:\n\n`;
    
    if (recommendations && recommendations.length > 0) {
      recommendations.forEach((recommendation, index) => {
        response += `${index + 1}. ${recommendation.title || '建议'}\n`;
        if (recommendation.description) {
          response += `   ${recommendation.description}\n`;
        }
        if (recommendation.expectedImpact) {
          response += `   预期影响: ${recommendation.expectedImpact}\n`;
        }
        response += '\n';
      });
    } else {
      response += '暂无改进建议。\n';
    }
    
    return response;
  }
} 