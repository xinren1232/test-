/**
 * 任务管理器 - 负责协调功能模块执行用户请求
 */

import { AIPromptEngine } from './AIPromptEngine';
import { IntentRecognizer } from './IntentRecognizer';
import { FunctionRegistry } from './FunctionRegistry';
import { AIBaseService } from '../ai/AIBaseService';
import { ElMessage } from 'element-plus';

/**
 * 任务管理器类
 */
export class TaskManager {
  constructor() {
    this.activeRequests = new Map();
    this.callbackRegistry = new Map();
    this.requestTimeouts = new Map();
    this.DEFAULT_TIMEOUT = 30000; // 默认30秒超时
  }

  /**
   * 处理用户请求
   * @param {string} query 用户查询
   * @param {Object} options 选项
   * @returns {Promise<Object>} 处理结果
   */
  async processRequest(query, options = {}) {
    const { 
      context = {}, 
      intent: providedIntent = null, 
      history = [], 
      timeout = this.DEFAULT_TIMEOUT 
    } = options;
    
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
      // 设置请求超时
      const timeoutPromise = new Promise((_, reject) => {
        const timeoutId = setTimeout(() => {
          this.cancelRequest(requestId);
          reject(new Error('请求处理超时'));
        }, timeout);
        this.requestTimeouts.set(requestId, timeoutId);
      });

      // 如果没有提供意图，尝试识别意图
      const intent = providedIntent || await IntentRecognizer.recognizeIntent(query, context);
      console.log('识别的意图:', intent);

      // 记录活动请求
      this.activeRequests.set(requestId, {
        query,
        intent,
        context,
        startTime: Date.now(),
        status: 'processing'
      });

      // 基于意图和上下文，确定处理模式并执行
      const processingPromise = this.executeRequest(requestId, query, intent, context, history);
      
      // 使用Promise.race竞争处理和超时
      const result = await Promise.race([processingPromise, timeoutPromise]);

      // 清除超时定时器
      if (this.requestTimeouts.has(requestId)) {
        clearTimeout(this.requestTimeouts.get(requestId));
        this.requestTimeouts.delete(requestId);
      }

      // 更新请求状态
      this.activeRequests.set(requestId, {
        ...this.activeRequests.get(requestId),
        status: 'completed',
        endTime: Date.now(),
        result
      });

      // 执行回调
      this.executeCallbacks(requestId, result);

      return result;
    } catch (error) {
      console.error('处理请求失败:', error);

      // 清除超时定时器
      if (this.requestTimeouts.has(requestId)) {
        clearTimeout(this.requestTimeouts.get(requestId));
        this.requestTimeouts.delete(requestId);
      }

      // 更新请求状态为失败
      this.activeRequests.set(requestId, {
        ...this.activeRequests.get(requestId),
        status: 'failed',
        endTime: Date.now(),
        error: error.message || '未知错误'
      });

      // 执行错误回调
      this.executeCallbacks(requestId, null, error);

      // 提供失败响应
      return this.buildErrorResponse(error, query);
    }
  }

  /**
   * 构建错误响应
   * @param {Error} error 错误对象
   * @param {string} query 原始查询
   * @returns {Object} 错误响应
   */
  buildErrorResponse(error, query) {
    let errorMessage = '抱歉，处理您的请求时出现了问题。';
    let suggestedActions = [];
    
    if (error.code === 'FUNCTION_NOT_FOUND') {
      errorMessage = '我还不支持此功能，但我正在不断学习中。';
      suggestedActions = [
        { label: '查看可用功能', type: 'send', message: '有哪些功能可用?' },
        { label: '返回首页', type: 'navigate', module: 'navigation', feature: 'navigateTo', parameters: { targetPage: 'dashboard' } }
      ];
    } else if (error.code === 'SERVICE_UNAVAILABLE') {
      errorMessage = '服务暂时不可用，请稍后再试。';
      suggestedActions = [
        { label: '重试', type: 'resend' },
        { label: '帮助', type: 'send', message: '帮助' }
      ];
    } else if (error.name === 'TimeoutError') {
      errorMessage = '处理请求超时，请尝试简化您的问题或稍后再试。';
      suggestedActions = [
        { label: '简化问题', type: 'edit', message: query },
        { label: '帮助', type: 'send', message: '帮助' }
      ];
    } else if (error.code === 'PERMISSION_DENIED') {
      errorMessage = '您没有执行此操作的权限。';
      suggestedActions = [
        { label: '查看可用功能', type: 'send', message: '我可以做什么?' }
      ];
    } else if (error.code === 'INVALID_PARAMETERS') {
      errorMessage = '请求参数无效，请提供正确的信息。';
      suggestedActions = [
        { label: '帮助', type: 'send', message: '如何正确使用此功能?' }
      ];
    }

    return {
      content: `${errorMessage}\n\n您的请求是："${query}"\n\n错误详情：${error.message || '未知错误'}`,
      error: true,
      errorType: error.code || error.name || 'UNKNOWN_ERROR',
      suggestedActions
    };
  }

  /**
   * 执行请求
   * @param {string} requestId 请求ID
   * @param {string} query 用户查询
   * @param {Object} intent 识别的意图
   * @param {Object} context 上下文
   * @param {Array} history 历史记录
   * @returns {Promise<Object>} 执行结果
   */
  async executeRequest(requestId, query, intent, context, history) {
    // 特殊处理：如果是navigation意图，直接返回导航信息
    if (intent.module === 'navigation') {
      return this.handleNavigationRequest(intent);
    }

    // 查找对应的功能处理函数
    const functionObj = FunctionRegistry.findFunction(intent.module, intent.feature);

    // 如果找到对应的处理函数，调用它
    if (functionObj) {
      try {
        const result = await FunctionRegistry.callFunction(intent.module, intent.feature, { 
          query, 
          intent, 
          context, 
          requestId,
          entities: intent.entities || {}
        });
        return this.formatHandlerResult(result);
      } catch (error) {
        console.error('执行功能处理函数失败:', error);
        // 为错误添加更多上下文信息
        error.functionInfo = {
          module: intent.module,
          feature: intent.feature
        };
        throw error;
      }
    } else {
      console.log(`未找到处理函数: ${intent.module}.${intent.feature}，使用AI生成回复`);
    }

    // 没有找到对应处理函数，使用AI生成回复
    return this.generateAIResponse(query, intent, context, history);
  }

  /**
   * 格式化处理函数结果
   * @param {Object|string} result 处理结果
   * @returns {Object} 格式化的结果
   */
  formatHandlerResult(result) {
    if (typeof result === 'string') {
      return { content: result };
    }

    if (result && typeof result === 'object') {
      // 如果已经是预期的格式
      if (result.content !== undefined) {
        return result;
      }

      // 需要转换为预期格式
      try {
        let content;
        if (typeof result.toJSON === 'function') {
          content = JSON.stringify(result.toJSON(), null, 2);
        } else {
          content = JSON.stringify(result, null, 2);
        }
        return { content };
      } catch (e) {
        return { content: `结果: ${result}` };
      }
    }

    return { content: `${result}` };
  }

  /**
   * 处理导航请求
   * @param {Object} intent 导航意图
   * @returns {Object} 导航结果
   */
  handleNavigationRequest(intent) {
    if (intent.feature === 'navigateTo') {
      const { targetPage } = intent.entities || {};
      
      if (!targetPage) {
        return {
          content: '抱歉，我没能理解您想要导航到哪个页面。',
          suggestedActions: [
            { label: '前往首页', type: 'navigate', module: 'navigation', feature: 'navigateTo', parameters: { targetPage: 'dashboard' }, primary: true },
            { label: '查看所有功能', type: 'send', message: '显示系统所有功能' }
          ]
        };
      }

      return {
        content: `好的，正在为您导航到${this.getPageDisplayName(targetPage)}页面。`,
        navigation: {
          targetPage,
          replace: false
        },
        suggestedActions: [
          { label: '返回主页', type: 'navigate', module: 'navigation', feature: 'navigateTo', parameters: { targetPage: 'dashboard' } }
        ]
      };
    } else if (intent.feature === 'goBack') {
      return {
        content: '正在返回上一页...',
        navigation: {
          action: 'back'
        }
      };
    } else if (intent.feature === 'goHome') {
      return {
        content: '正在返回首页...',
        navigation: {
          targetPage: 'dashboard',
          replace: true
        }
      };
    }
    
    // 默认导航行为
    return {
      content: '正在执行导航操作...',
      navigation: {
        action: intent.feature
      }
    };
  }

  /**
   * 获取页面显示名称
   * @param {string} pageId 页面ID
   * @returns {string} 页面显示名称
   */
  getPageDisplayName(pageId) {
    const pageNames = {
      'dashboard': '仪表盘',
      'inventory': '库存管理',
      'laboratory': '实验室测试',
      'production': '生产线管理',
      'quality': '质量检验',
      'settings': '系统设置',
      'reports': '报告中心',
      'data': '数据中心'
    };

    return pageNames[pageId] || pageId;
  }

  /**
   * 使用AI生成响应
   * @param {string} query 用户查询
   * @param {Object} intent 识别的意图
   * @param {Object} context 上下文
   * @param {Array} history 历史记录
   * @returns {Promise<Object>} AI生成的响应
   */
  async generateAIResponse(query, intent, context, history) {
    try {
      // 使用提示词引擎构建提示词
      const prompt = AIPromptEngine.generatePromptForIntent(query, intent, {
        ...context,
        history: history.slice(-5) // 只使用最近的5条历史记录
      });

      // 调用AI服务
      const response = await AIBaseService.executeQuery(prompt, {
        allowRetry: true,
        parseResponse: false
      });

      // 构建响应对象
      return {
        content: response.response,
        intent: this.describeIntent(intent),
        suggestedActions: this.getSuggestedActionsByIntent(intent)
      };
    } catch (error) {
      console.error('AI生成响应失败:', error);
      throw error;
    }
  }

  /**
   * 描述意图
   * @param {Object} intent 意图对象
   * @returns {string} 意图描述
   */
  describeIntent(intent) {
    if (!intent) return '未知意图';
    
    const intentLabels = {
      inventory: {
        freezeBatch: '冻结批次',
        unfreezeBatch: '解冻批次',
        checkBatchStatus: '查询批次状态',
        batchList: '批次列表',
        materialInventory: '物料库存'
      },
      laboratory: {
        queryLabData: '查询实验数据',
        analyzeLabData: '分析实验数据',
        labTestSummary: '实验室测试概况'
      },
      production: {
        analyzeAnomaly: '分析产线异常',
        productionStatus: '生产线状态',
        productionSchedule: '生产计划'
      },
      quality: {
        queryInspection: '查询质量检验',
        predictQuality: '质量趋势预测',
        qualitySummary: '质量概况',
        defectAnalysis: '缺陷分析'
      },
      visualization: {
        showChart: '显示图表',
        trendChart: '趋势图',
        compareChart: '比较图',
        distributionChart: '分布图'
      },
      navigation: {
        navigateTo: '页面导航',
        goBack: '返回',
        goHome: '返回首页'
      },
      general: {
        help: '帮助信息',
        searchInfo: '搜索信息',
        default: '通用对话'
      }
    };
    
    const moduleLabel = intentLabels[intent.module] || {};
    const featureLabel = moduleLabel[intent.feature] || intent.feature;
    
    return `${featureLabel}`;
  }

  /**
   * 根据意图获取建议操作
   * @param {Object} intent 意图对象
   * @returns {Array} 建议操作列表
   */
  getSuggestedActionsByIntent(intent) {
    if (!intent) return [];
    
    const commonActions = [
      { label: '帮助', type: 'send', message: '帮助' }
    ];
    
    if (intent.module === 'inventory') {
      if (intent.feature === 'checkBatchStatus' && intent.entities.batchId) {
        return [
          { label: '冻结此批次', type: 'send', message: `冻结批次 ${intent.entities.batchId}` },
          { label: '查看所有批次', type: 'send', message: '查看所有批次' },
          ...commonActions
        ];
      } else if (intent.feature === 'materialInventory' && intent.entities.materialCode) {
        return [
          { label: '查看实验数据', type: 'send', message: `查询物料 ${intent.entities.materialCode} 实验数据` },
          { label: '查看质量检验', type: 'send', message: `查询物料 ${intent.entities.materialCode} 质量检验` },
          ...commonActions
        ];
      }
    } else if (intent.module === 'laboratory' && intent.entities.materialCode) {
      return [
        { label: '分析数据趋势', type: 'send', message: `分析物料 ${intent.entities.materialCode} 实验数据趋势` },
        { label: '查看库存', type: 'send', message: `查询物料 ${intent.entities.materialCode} 库存` },
        ...commonActions
      ];
    } else if (intent.module === 'quality' && intent.entities.materialCode) {
      return [
        { label: '预测质量趋势', type: 'send', message: `预测物料 ${intent.entities.materialCode} 质量趋势` },
        { label: '查看实验数据', type: 'send', message: `查询物料 ${intent.entities.materialCode} 实验数据` },
        ...commonActions
      ];
    } else if (intent.module === 'visualization') {
      return [
        { label: '生成趋势图', type: 'send', message: '显示趋势图' },
        { label: '生成对比图', type: 'send', message: '显示对比图' },
        ...commonActions
      ];
    }
    
    return commonActions;
  }
  
  /**
   * 执行回调
   * @param {string} requestId 请求ID
   * @param {Object} result 结果
   * @param {Error} error 错误
   */
  executeCallbacks(requestId, result, error = null) {
    if (this.callbackRegistry.has(requestId)) {
      const callbacks = this.callbackRegistry.get(requestId);
      for (const callback of callbacks) {
        try {
          if (error) {
            callback.onError && callback.onError(error);
          } else {
            callback.onSuccess && callback.onSuccess(result);
          }
        } catch (callbackError) {
          console.error('执行回调出错:', callbackError);
        }
      }
      // 执行完毕后清除回调
      this.callbackRegistry.delete(requestId);
    }
  }

  /**
   * 注册回调
   * @param {string} requestId 请求ID
   * @param {Function} onSuccess 成功回调
   * @param {Function} onError 错误回调
   */
  registerCallback(requestId, onSuccess, onError) {
    if (!this.callbackRegistry.has(requestId)) {
      this.callbackRegistry.set(requestId, []);
    }
    
    this.callbackRegistry.get(requestId).push({
      onSuccess,
      onError
    });
  }

  /**
   * 取消请求
   * @param {string} requestId 请求ID
   * @returns {boolean} 是否成功取消
   */
  cancelRequest(requestId) {
    if (!this.activeRequests.has(requestId)) {
      return false;
    }
    
    const request = this.activeRequests.get(requestId);
    
    // 只能取消处理中的请求
    if (request.status !== 'processing') {
      return false;
    }
    
    // 清除超时计时器
    if (this.requestTimeouts.has(requestId)) {
      clearTimeout(this.requestTimeouts.get(requestId));
      this.requestTimeouts.delete(requestId);
    }
    
    // 更新状态
    this.activeRequests.set(requestId, {
      ...request,
      status: 'cancelled',
      endTime: Date.now()
    });
    
    // 执行取消回调
    if (this.callbackRegistry.has(requestId)) {
      const callbacks = this.callbackRegistry.get(requestId);
      for (const callback of callbacks) {
        try {
          callback.onError && callback.onError(new Error('请求已取消'));
        } catch (error) {
          console.error('执行取消回调出错:', error);
        }
      }
      this.callbackRegistry.delete(requestId);
    }
    
    return true;
  }

  /**
   * 获取所有活动请求
   * @returns {Array} 活动请求列表
   */
  getActiveRequests() {
    const result = [];
    
    for (const [requestId, request] of this.activeRequests.entries()) {
      if (request.status === 'processing') {
        result.push({
          id: requestId,
          ...request
        });
      }
    }
    
    return result;
  }

  /**
   * 获取请求状态
   * @param {string} requestId 请求ID
   * @returns {Object|null} 请求状态
   */
  getRequestStatus(requestId) {
    return this.activeRequests.get(requestId) || null;
  }

  /**
   * 清理过期请求
   * @param {number} maxAgeMs 最大存活时间（毫秒）
   */
  cleanupExpiredRequests(maxAgeMs = 3600000) { // 默认1小时
    const now = Date.now();
    
    for (const [requestId, request] of this.activeRequests.entries()) {
      // 清理已完成/失败/取消且已过期的请求
      if (
        ['completed', 'failed', 'cancelled'].includes(request.status) &&
        request.endTime && 
        (now - request.endTime > maxAgeMs)
      ) {
        this.activeRequests.delete(requestId);
      }
      
      // 清理处理时间过长的请求
      if (
        request.status === 'processing' &&
        (now - request.startTime > maxAgeMs * 2) // 处理中请求给予更长时间
      ) {
        this.cancelRequest(requestId);
      }
    }
  }
}

// 导出单例实例
export default new TaskManager(); 