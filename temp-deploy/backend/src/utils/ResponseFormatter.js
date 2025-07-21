/**
 * 统一的响应格式化工具
 * 确保所有API返回统一的数据格式
 */

class ResponseFormatter {
  /**
   * 创建成功响应
   * @param {object} options - 响应选项
   * @returns {object} 格式化的响应
   */
  static createSuccessResponse(options = {}) {
    const {
      data = null,
      reply = null,
      source = 'unknown',
      processingMode = 'auto',
      intent = null,
      confidence = null,
      aiEnhanced = false,
      chartType = null,
      analysisType = null,
      metadata = {}
    } = options;

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      source,
      processingMode,
      aiEnhanced
    };

    // 添加数据或回复
    if (data !== null) {
      response.data = data;
      
      // 如果是数组数据，添加统计信息
      if (Array.isArray(data)) {
        response.dataInfo = {
          count: data.length,
          type: 'array',
          fields: data.length > 0 ? Object.keys(data[0]) : []
        };
      } else if (typeof data === 'object') {
        response.dataInfo = {
          type: 'object',
          fields: Object.keys(data)
        };
      }
    }

    if (reply !== null) {
      response.reply = reply;
      response.replyInfo = {
        length: reply.length,
        type: 'text'
      };
    }

    // 添加意图信息
    if (intent) {
      response.intent = intent;
    }

    if (confidence !== null) {
      response.confidence = confidence;
    }

    // 添加图表信息
    if (chartType) {
      response.chartType = chartType;
      response.visualization = true;
    }

    // 添加分析类型
    if (analysisType) {
      response.analysisType = analysisType;
    }

    // 添加元数据
    if (Object.keys(metadata).length > 0) {
      response.metadata = metadata;
    }

    return response;
  }

  /**
   * 创建错误响应
   * @param {string} message - 错误消息
   * @param {object} options - 错误选项
   * @returns {object} 格式化的错误响应
   */
  static createErrorResponse(message, options = {}) {
    const {
      code = 'UNKNOWN_ERROR',
      source = 'error-handler',
      details = null
    } = options;

    const response = {
      success: false,
      timestamp: new Date().toISOString(),
      error: {
        message,
        code
      },
      source
    };

    if (details) {
      response.error.details = details;
    }

    return response;
  }

  /**
   * 创建数据响应（专门用于结构化数据）
   * @param {array|object} data - 数据
   * @param {object} options - 选项
   * @returns {object} 格式化的数据响应
   */
  static createDataResponse(data, options = {}) {
    const {
      source = 'data-service',
      intent = null,
      sql = null,
      params = null,
      executionTime = null
    } = options;

    const response = this.createSuccessResponse({
      data,
      source,
      processingMode: 'structured_data',
      intent,
      aiEnhanced: false
    });

    // 添加查询信息
    response.queryInfo = {
      intent: intent || '未识别',
      matchedRule: intent || '无',
      parameters: params || {}
    };

    if (sql) {
      response.queryInfo.sql = sql.substring(0, 200) + (sql.length > 200 ? '...' : '');
      response.queryInfo.executionTime = executionTime;
    }

    return response;
  }

  /**
   * 创建AI分析响应
   * @param {string} reply - AI回复
   * @param {object} options - 选项
   * @returns {object} 格式化的AI响应
   */
  static createAIResponse(reply, options = {}) {
    const {
      source = 'ai-service',
      analysisType = 'general',
      contextData = null,
      confidence = null
    } = options;

    const response = this.createSuccessResponse({
      reply,
      source,
      processingMode: 'ai_analysis',
      analysisType,
      aiEnhanced: true,
      confidence
    });

    // 如果有上下文数据，也包含进去
    if (contextData) {
      response.contextData = contextData;
      response.dataInfo = {
        hasContext: true,
        contextType: Array.isArray(contextData) ? 'array' : typeof contextData,
        contextCount: Array.isArray(contextData) ? contextData.length : 1
      };
    }

    return response;
  }

  /**
   * 创建图表响应
   * @param {object} chartData - 图表数据
   * @param {object} options - 选项
   * @returns {object} 格式化的图表响应
   */
  static createChartResponse(chartData, options = {}) {
    const {
      source = 'chart-generator',
      chartType = 'unknown'
    } = options;

    return this.createSuccessResponse({
      data: chartData,
      source,
      processingMode: 'chart_visualization',
      chartType,
      visualization: true,
      aiEnhanced: false
    });
  }

  /**
   * 创建混合响应（包含数据和AI分析）
   * @param {object} data - 原始数据
   * @param {string} analysis - AI分析
   * @param {object} options - 选项
   * @returns {object} 格式化的混合响应
   */
  static createHybridResponse(data, analysis, options = {}) {
    const {
      source = 'hybrid-service',
      intent = null,
      analysisType = 'enhanced'
    } = options;

    return this.createSuccessResponse({
      data,
      reply: analysis,
      source,
      processingMode: 'hybrid_analysis',
      intent,
      analysisType,
      aiEnhanced: true,
      metadata: {
        hasStructuredData: true,
        hasAIAnalysis: true
      }
    });
  }

  /**
   * 验证响应格式
   * @param {object} response - 响应对象
   * @returns {boolean} 是否符合标准格式
   */
  static validateResponse(response) {
    if (!response || typeof response !== 'object') {
      return false;
    }

    // 必需字段
    const requiredFields = ['success', 'timestamp', 'source'];
    for (const field of requiredFields) {
      if (!(field in response)) {
        return false;
      }
    }

    // 成功响应必须有数据或回复
    if (response.success && !response.data && !response.reply) {
      return false;
    }

    // 错误响应必须有错误信息
    if (!response.success && !response.error) {
      return false;
    }

    return true;
  }

  /**
   * 格式化现有响应以符合标准
   * @param {object} response - 现有响应
   * @returns {object} 标准化的响应
   */
  static standardizeResponse(response) {
    if (this.validateResponse(response)) {
      return response;
    }

    // 尝试修复常见的格式问题
    const standardized = {
      success: response.success !== false,
      timestamp: response.timestamp || new Date().toISOString(),
      source: response.source || 'unknown'
    };

    // 复制其他字段
    Object.keys(response).forEach(key => {
      if (!['success', 'timestamp', 'source'].includes(key)) {
        standardized[key] = response[key];
      }
    });

    return standardized;
  }
}

export default ResponseFormatter;
