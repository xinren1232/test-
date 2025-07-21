/**
 * 前端响应处理工具
 * 统一处理后端返回的各种响应格式
 */

export class ResponseHandler {
  /**
   * 处理API响应
   * @param {object} response - API响应
   * @returns {object} 处理后的响应
   */
  static handleResponse(response) {
    if (!response) {
      return this.createErrorResult('响应为空');
    }

    // 验证响应格式
    if (!this.validateResponse(response)) {
      console.warn('响应格式不标准，尝试修复:', response);
      response = this.normalizeResponse(response);
    }

    // 根据响应类型处理
    if (!response.success) {
      return this.handleErrorResponse(response);
    }

    switch (response.processingMode) {
      case 'structured_data':
        return this.handleDataResponse(response);
      case 'chart_visualization':
        return this.handleChartResponse(response);
      case 'ai_analysis':
        return this.handleAIResponse(response);
      case 'hybrid_analysis':
        return this.handleHybridResponse(response);
      default:
        return this.handleGenericResponse(response);
    }
  }

  /**
   * 验证响应格式
   */
  static validateResponse(response) {
    if (!response || typeof response !== 'object') {
      return false;
    }

    const requiredFields = ['success', 'timestamp', 'source'];
    return requiredFields.every(field => field in response);
  }

  /**
   * 标准化响应格式
   */
  static normalizeResponse(response) {
    const normalized = {
      success: response.success !== false,
      timestamp: response.timestamp || new Date().toISOString(),
      source: response.source || 'unknown',
      processingMode: response.processingMode || 'generic'
    };

    // 复制其他字段
    Object.keys(response).forEach(key => {
      if (!['success', 'timestamp', 'source', 'processingMode'].includes(key)) {
        normalized[key] = response[key];
      }
    });

    return normalized;
  }

  /**
   * 处理错误响应
   */
  static handleErrorResponse(response) {
    return {
      type: 'error',
      message: response.error?.message || '未知错误',
      code: response.error?.code || 'UNKNOWN_ERROR',
      source: response.source,
      timestamp: response.timestamp
    };
  }

  /**
   * 处理数据响应
   */
  static handleDataResponse(response) {
    const result = {
      type: 'data',
      source: response.source,
      intent: response.intent,
      aiEnhanced: response.aiEnhanced || false,
      timestamp: response.timestamp
    };

    if (response.data) {
      result.data = response.data;
      result.dataInfo = response.dataInfo || this.analyzeData(response.data);

      // 处理卡片数据
      if (response.data.cards) {
        result.cards = response.data.cards;
      }

      // 处理表格数据
      if (response.data.queryData) {
        result.tableData = response.data.queryData;
      }

      // 处理场景类型
      if (response.data.scenarioType) {
        result.scenarioType = response.data.scenarioType;
      }

      // 处理数据计数
      if (response.data.dataCount !== undefined) {
        result.dataCount = response.data.dataCount;
      }
    }

    if (response.queryInfo) {
      result.queryInfo = response.queryInfo;
    }

    return result;
  }

  /**
   * 处理图表响应
   */
  static handleChartResponse(response) {
    return {
      type: 'chart',
      data: response.data,
      chartType: response.chartType,
      source: response.source,
      visualization: true,
      timestamp: response.timestamp
    };
  }

  /**
   * 处理AI分析响应
   */
  static handleAIResponse(response) {
    return {
      type: 'ai_analysis',
      reply: response.reply,
      analysisType: response.analysisType,
      confidence: response.confidence,
      source: response.source,
      aiEnhanced: true,
      contextData: response.contextData,
      timestamp: response.timestamp
    };
  }

  /**
   * 处理混合响应
   */
  static handleHybridResponse(response) {
    return {
      type: 'hybrid',
      data: response.data,
      reply: response.reply,
      analysisType: response.analysisType,
      source: response.source,
      aiEnhanced: true,
      dataInfo: response.dataInfo || this.analyzeData(response.data),
      timestamp: response.timestamp
    };
  }

  /**
   * 处理通用响应
   */
  static handleGenericResponse(response) {
    const result = {
      type: 'generic',
      source: response.source,
      aiEnhanced: response.aiEnhanced || false,
      timestamp: response.timestamp
    };

    if (response.data) {
      result.data = response.data;
      result.dataInfo = this.analyzeData(response.data);

      // 处理卡片数据
      if (response.data.cards) {
        result.cards = response.data.cards;
      }

      // 处理表格数据
      if (response.data.queryData) {
        result.tableData = response.data.queryData;
      }

      // 处理场景类型
      if (response.data.scenarioType) {
        result.scenarioType = response.data.scenarioType;
      }

      // 处理数据计数
      if (response.data.dataCount !== undefined) {
        result.dataCount = response.data.dataCount;
      }
    }

    if (response.reply) {
      result.reply = response.reply;
    }

    return result;
  }

  /**
   * 分析数据结构
   */
  static analyzeData(data) {
    if (!data) return null;

    if (Array.isArray(data)) {
      return {
        type: 'array',
        count: data.length,
        fields: data.length > 0 ? Object.keys(data[0]) : [],
        isEmpty: data.length === 0
      };
    }

    if (typeof data === 'object') {
      return {
        type: 'object',
        fields: Object.keys(data),
        isEmpty: Object.keys(data).length === 0
      };
    }

    return {
      type: typeof data,
      isEmpty: !data
    };
  }

  /**
   * 创建错误结果
   */
  static createErrorResult(message) {
    return {
      type: 'error',
      message,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 格式化数据用于显示
   */
  static formatDataForDisplay(data, options = {}) {
    const { maxRows = 20, maxColumns = 10 } = options;

    if (!data) return null;

    if (Array.isArray(data)) {
      // 限制行数
      const limitedData = data.slice(0, maxRows);
      
      // 限制列数
      if (limitedData.length > 0) {
        const allFields = Object.keys(limitedData[0]);
        const limitedFields = allFields.slice(0, maxColumns);
        
        return {
          data: limitedData.map(row => {
            const limitedRow = {};
            limitedFields.forEach(field => {
              limitedRow[field] = row[field];
            });
            return limitedRow;
          }),
          meta: {
            totalRows: data.length,
            totalColumns: allFields.length,
            displayRows: limitedData.length,
            displayColumns: limitedFields.length,
            truncated: data.length > maxRows || allFields.length > maxColumns
          }
        };
      }
    }

    return { data, meta: { truncated: false } };
  }

  /**
   * 检查是否需要特殊处理
   */
  static needsSpecialHandling(response) {
    // 检查是否是大数据集
    if (response.dataInfo?.count > 100) {
      return { type: 'large_dataset', reason: '数据量较大，建议分页显示' };
    }

    // 检查是否是复杂分析
    if (response.aiEnhanced && response.reply?.length > 1000) {
      return { type: 'complex_analysis', reason: '分析内容较长，建议分段显示' };
    }

    // 检查是否是图表数据
    if (response.visualization) {
      return { type: 'visualization', reason: '需要图表组件渲染' };
    }

    return null;
  }
}

export default ResponseHandler;
