/**
 * 优化的查询处理器
 * 实现最佳的查询处理优先级和统一的数据返回格式
 */

import IntelligentIntentService from './intelligentIntentService.js';
import AIEnhancedService from './AIEnhancedService.js';
import { processRealQuery, processChartQuery } from './realDataAssistantService.js';
import ResponseFormatter from '../utils/ResponseFormatter.js';
import { logger } from '../utils/logger.js';

class OptimizedQueryProcessor {
  constructor() {
    this.intelligentIntentService = new IntelligentIntentService();
    this.aiEnhancedService = new AIEnhancedService();
    this.initialized = false;
  }

  /**
   * 初始化处理器
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      await this.intelligentIntentService.initialize();
      this.initialized = true;
      logger.info('优化查询处理器初始化成功');
    } catch (error) {
      logger.error('优化查询处理器初始化失败:', error);
      throw error;
    }
  }

  /**
   * 统一的查询处理入口
   * @param {string} query - 用户查询
   * @param {object} options - 处理选项
   * @returns {object} 统一格式的响应
   */
  async processQuery(query, options = {}) {
    const {
      scenario = 'auto',
      analysisMode = 'auto',
      requireDataAnalysis = false,
      forceMode = null
    } = options;

    logger.info(`开始处理查询: "${query}"`, {
      scenario,
      analysisMode,
      requireDataAnalysis,
      forceMode,
      allOptions: options
    });

    try {
      // 确保初始化完成
      await this.initialize();

      // 1. 强制模式检查
      if (forceMode) {
        return await this.processWithForceMode(query, forceMode, options);
      }

      // 2. 智能路由决策
      const routingDecision = this.makeRoutingDecision(query, options);
      logger.info(`路由决策: ${routingDecision.strategy}`, routingDecision);

      // 3. 按优先级处理
      switch (routingDecision.strategy) {
        case 'structured_data':
          return await this.processStructuredDataQuery(query, options);
        
        case 'chart_visualization':
          return await this.processChartQuery(query, options);
        
        case 'ai_analysis':
          return await this.processAIAnalysisQuery(query, options);
        
        case 'fallback':
        default:
          return await this.processFallbackQuery(query, options);
      }

    } catch (error) {
      logger.error('查询处理失败:', error);
      return this.createErrorResponse(error.message);
    }
  }

  /**
   * 智能路由决策
   */
  makeRoutingDecision(query, options = {}) {
    const { scenario, analysisMode, requireDataAnalysis } = options;

    logger.info(`🧭 路由决策开始:`, {
      query,
      scenario,
      analysisMode,
      requireDataAnalysis,
      allOptions: options
    });
    
    // 强制规则模式
    if (analysisMode === 'rule-based' || analysisMode === 'rule') {
      return {
        strategy: 'structured_data',
        reason: '用户指定规则模式',
        confidence: 1.0
      };
    }

    // 图表查询检测 - 更精确的匹配
    const chartKeywords = ['图表', '趋势图', '统计图', '分布图', '排行榜'];
    const analysisKeywords = ['分析', '对比'];

    // 只有明确要求图表时才路由到图表处理
    const hasChartKeyword = chartKeywords.some(keyword => query.includes(keyword));
    const hasAnalysisKeyword = analysisKeywords.some(keyword => query.includes(keyword));

    if (hasChartKeyword) {
      return {
        strategy: 'chart_visualization',
        reason: '检测到明确的图表关键词',
        confidence: 0.9
      };
    }

    // 简单数据查询检测
    const dataQueryKeywords = ['查询', '查看', '显示', '列出', '有哪些', '多少'];
    const entityKeywords = ['库存', '测试', '批次', '供应商', '物料', '工厂'];
    
    const hasDataKeyword = dataQueryKeywords.some(keyword => query.includes(keyword));
    const hasEntityKeyword = entityKeywords.some(keyword => query.includes(keyword));
    
    if (hasDataKeyword && hasEntityKeyword && query.length < 20) {
      return {
        strategy: 'structured_data',
        reason: '简单数据查询',
        confidence: 0.9
      };
    }

    // 复杂分析查询
    const complexKeywords = ['分析', '总结', '建议', '原因', '如何', '为什么', '怎么样'];
    if (complexKeywords.some(keyword => query.includes(keyword)) || query.length > 30) {
      return {
        strategy: 'ai_analysis',
        reason: '复杂分析查询',
        confidence: 0.7
      };
    }

    // 默认使用结构化数据处理
    return {
      strategy: 'structured_data',
      reason: '默认结构化数据处理',
      confidence: 0.6
    };
  }

  /**
   * 处理结构化数据查询
   */
  async processStructuredDataQuery(query, options) {
    logger.info('使用结构化数据处理');

    try {
      const result = await this.intelligentIntentService.processQuery(query, options);

      // 添加详细的调试日志
      logger.info('智能意图服务返回结果:', {
        hasResult: !!result,
        success: result?.success,
        hasData: !!result?.data,
        dataType: result?.data ? typeof result.data : 'undefined',
        dataLength: Array.isArray(result?.data) ? result.data.length : 'not array',
        source: result?.source,
        intent: result?.intent
      });

      if (result && result.success && result.data) {
        logger.info('✅ 智能意图处理成功，创建数据响应');
        return ResponseFormatter.createDataResponse(result.data, {
          source: 'intelligent-intent',
          intent: result.intent || result.matchedRule || '未识别',
          sql: result.sql,
          params: result.params
        });
      } else {
        logger.warn('❌ 智能意图结果不符合条件:', {
          hasResult: !!result,
          success: result?.success,
          hasData: !!result?.data
        });
      }
    } catch (error) {
      logger.warn('智能意图识别失败，尝试备用方案:', error.message);
    }

    // 备用方案：使用基础规则处理
    try {
      const fallbackResult = await processRealQuery(query);
      return ResponseFormatter.createSuccessResponse({
        reply: fallbackResult,
        source: 'rule-based-fallback',
        processingMode: 'structured_data',
        aiEnhanced: false
      });
    } catch (error) {
      throw new Error(`结构化数据查询失败: ${error.message}`);
    }
  }

  /**
   * 处理图表查询
   */
  async processChartQuery(query, options) {
    logger.info('使用图表可视化处理');
    
    try {
      const chartResult = processChartQuery(query);
      
      if (chartResult && chartResult.data) {
        return ResponseFormatter.createChartResponse(chartResult.data, {
          source: 'chart-generator',
          chartType: chartResult.data.chartType
        });
      }
    } catch (error) {
      logger.warn('图表生成失败，回退到结构化数据处理:', error.message);
    }

    // 回退到结构化数据处理
    return await this.processStructuredDataQuery(query, options);
  }

  /**
   * 处理AI分析查询
   */
  async processAIAnalysisQuery(query, options) {
    logger.info('使用AI增强分析处理');
    
    try {
      // 首先尝试获取相关数据
      let contextData = null;
      try {
        const dataResult = await this.intelligentIntentService.processQuery(query, options);
        if (dataResult && dataResult.success && dataResult.data) {
          contextData = dataResult.data;
        }
      } catch (error) {
        logger.warn('获取上下文数据失败:', error.message);
      }

      // 使用AI增强服务进行分析
      const aiResult = await this.aiEnhancedService.processQuery(query, {
        contextData,
        analysisMode: 'professional'
      });

      if (aiResult && aiResult.success) {
        if (contextData) {
          return ResponseFormatter.createHybridResponse(contextData, aiResult.reply, {
            source: 'ai-enhanced',
            analysisType: aiResult.analysisType
          });
        } else {
          return ResponseFormatter.createAIResponse(aiResult.reply, {
            source: 'ai-enhanced',
            analysisType: aiResult.analysisType
          });
        }
      }
    } catch (error) {
      logger.warn('AI分析失败，回退到结构化数据处理:', error.message);
    }

    // 回退到结构化数据处理
    return await this.processStructuredDataQuery(query, options);
  }

  /**
   * 处理备用查询
   */
  async processFallbackQuery(query, options) {
    logger.info('使用备用处理方案');
    
    try {
      const result = await processRealQuery(query);
      return ResponseFormatter.createSuccessResponse({
        reply: result,
        source: 'fallback',
        processingMode: 'fallback',
        aiEnhanced: false
      });
    } catch (error) {
      throw new Error(`备用查询处理失败: ${error.message}`);
    }
  }

  /**
   * 强制模式处理
   */
  async processWithForceMode(query, forceMode, options) {
    logger.info(`使用强制模式: ${forceMode}`);
    
    switch (forceMode) {
      case 'data-only':
        return await this.processStructuredDataQuery(query, options);
      case 'ai-only':
        return await this.processAIAnalysisQuery(query, options);
      case 'chart-only':
        return await this.processChartQuery(query, options);
      default:
        throw new Error(`不支持的强制模式: ${forceMode}`);
    }
  }

  /**
   * 创建错误响应
   */
  createErrorResponse(message) {
    return ResponseFormatter.createErrorResponse(message, {
      source: 'optimized-query-processor'
    });
  }
}

export default OptimizedQueryProcessor;
