/**
 * 统一助手服务
 * 提供核心业务逻辑，处理助手查询
 */
import { logger } from '../utils/logger.js';
import { sendToAIService } from '../utils/aiClient.js';

/**
 * 助手服务类
 */
class AssistantService {
  constructor() {
    // 会话上下文存储
    this.contextStore = new Map();
    
    // 有效的助手模式
    this.validModes = ['auto', 'quality', 'lab', 'production'];
  }
  
  /**
   * 处理用户查询
   * @param {Object} params 查询参数
   * @param {string} params.query 用户查询文本
   * @param {string} params.mode 助手模式
   * @param {string} params.sessionId 会话ID
   * @param {Object} params.context 上下文信息
   * @param {string} params.requestId 请求ID
   * @returns {Promise<Object>} 处理结果
   */
  async handleQuery(params) {
    const { query, mode, sessionId, context, requestId } = params;
    
    logger.info(`处理查询 [${requestId}]`, {
      query: query.substring(0, 50) + (query.length > 50 ? '...' : ''),
      mode,
      sessionId,
      requestId
    });
    
    try {
      // 获取会话上下文
      const sessionContext = this.getSessionContext(sessionId);
      
      // 合并传入的上下文
      if (context) {
        Object.assign(sessionContext.context, context);
      }
      
      // 自动检测模式 (如果设置为auto)
      const detectedMode = mode === 'auto' ? this.detectMode(query) : mode;
      sessionContext.mode = detectedMode;
      
      // 添加查询到历史记录
      sessionContext.history.push({
        role: 'user',
        content: query,
        timestamp: new Date().toISOString()
      });
      
      // 根据模式处理查询
      const response = await this.processQueryByMode(query, sessionContext);
      
      // 添加响应到历史记录
      sessionContext.history.push({
        role: 'assistant',
        content: response.content,
        data: response.data,
        timestamp: new Date().toISOString()
      });
      
      // 更新会话上下文
      this.updateSessionContext(sessionId, sessionContext);
      
      // 返回处理结果
      return {
        answer: response.content,
        mode: detectedMode,
        context: sessionContext.context,
        structuredData: response.data
      };
    } catch (error) {
      logger.error(`处理查询失败 [${requestId}]`, {
        error: error.message,
        stack: error.stack,
        requestId
      });
      
      throw error;
    }
  }
  
  /**
   * 获取会话上下文
   * @param {string} sessionId 会话ID
   * @returns {Object} 会话上下文
   */
  getSessionContext(sessionId) {
    if (!this.contextStore.has(sessionId)) {
      // 创建新的会话上下文
      const newContext = {
        mode: 'auto',
        history: [],
        context: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.contextStore.set(sessionId, newContext);
      return newContext;
    }
    
    return this.contextStore.get(sessionId);
  }
  
  /**
   * 更新会话上下文
   * @param {string} sessionId 会话ID
   * @param {Object} context 上下文数据
   */
  updateSessionContext(sessionId, context) {
    // 更新最后修改时间
    context.updatedAt = new Date().toISOString();
    
    // 限制历史记录长度，防止内存溢出
    if (context.history.length > 20) {
      context.history = context.history.slice(-20);
    }
    
    this.contextStore.set(sessionId, context);
    
    // 自动清理超过24小时的会话
    this.cleanExpiredSessions();
  }
  
  /**
   * 清理过期的会话
   * 删除超过24小时未活动的会话
   */
  cleanExpiredSessions() {
    const now = new Date();
    const expireThreshold = 24 * 60 * 60 * 1000; // 24小时
    
    for (const [sessionId, context] of this.contextStore.entries()) {
      const lastUpdated = new Date(context.updatedAt);
      const timeDiff = now - lastUpdated;
      
      if (timeDiff > expireThreshold) {
        this.contextStore.delete(sessionId);
        logger.info(`清理过期会话: ${sessionId}`);
      }
    }
  }
  
  /**
   * 清除指定会话的上下文
   * @param {string} sessionId 会话ID
   * @returns {boolean} 是否成功清除
   */
  async clearSessionContext(sessionId) {
    if (this.contextStore.has(sessionId)) {
      this.contextStore.delete(sessionId);
      logger.info(`清除会话上下文: ${sessionId}`);
      return true;
    }
    
    return false;
  }
  
  /**
   * 根据查询内容自动检测助手模式
   * @param {string} query 查询文本
   * @returns {string} 检测到的模式
   */
  detectMode(query) {
    const query_lower = query.toLowerCase();
    
    // 实验室相关关键词
    if (query_lower.includes('实验') || 
        query_lower.includes('测试') || 
        query_lower.includes('检测') ||
        query_lower.includes('分析') ||
        query_lower.includes('参数')) {
      return 'lab';
    }
    
    // 生产线相关关键词
    if (query_lower.includes('生产') || 
        query_lower.includes('产线') || 
        query_lower.includes('产能') ||
        query_lower.includes('设备') ||
        query_lower.includes('效率')) {
      return 'production';
    }
    
    // 质量相关关键词
    if (query_lower.includes('质量') || 
        query_lower.includes('不良') || 
        query_lower.includes('物料') ||
        query_lower.includes('供应商') ||
        query_lower.includes('检验')) {
      return 'quality';
    }
    
    // 默认使用质量模式
    return 'quality';
  }
  
  /**
   * 根据模式处理查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processQueryByMode(query, sessionContext) {
    const mode = sessionContext.mode;
    
    // 根据模式处理查询
    switch (mode) {
      case 'lab':
        return this.processLabQuery(query, sessionContext);
        
      case 'quality':
        return this.processQualityQuery(query, sessionContext);
        
      case 'production':
        return this.processProductionQuery(query, sessionContext);
        
      default:
        // 默认使用质量模式
        return this.processQualityQuery(query, sessionContext);
    }
  }
  
  /**
   * 处理实验室查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processLabQuery(query, sessionContext) {
    try {
      // 准备系统消息
      const systemMessage = `你是实验室质量助手，专注于处理实验室测试、质量分析和参数相关的问题。
当前时间：${new Date().toLocaleString('zh-CN')}
`;
      
      // 准备用户上下文和历史记录
      const messages = this.prepareMessagesForAI(query, sessionContext, systemMessage);
      
      // 调用AI服务
      const aiResponse = await sendToAIService({
        messages,
        temperature: 0.3,
        functions: this.getLabFunctions(),
        stream: false
      });
      
      // 处理AI响应
      return {
        content: aiResponse.content,
        data: aiResponse.functionResults || {}
      };
    } catch (error) {
      logger.error('处理实验室查询失败', { error: error.message });
      
      return {
        content: `抱歉，处理您的实验室查询时出现了问题。${error.message}`,
        data: { error: error.message }
      };
    }
  }
  
  /**
   * 处理质量查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processQualityQuery(query, sessionContext) {
    try {
      // 准备系统消息
      const systemMessage = `你是质量检验助手，专注于处理物料质量检验、不良品分析和供应商相关的问题。
当前时间：${new Date().toLocaleString('zh-CN')}
`;
      
      // 准备用户上下文和历史记录
      const messages = this.prepareMessagesForAI(query, sessionContext, systemMessage);
      
      // 调用AI服务
      const aiResponse = await sendToAIService({
        messages,
        temperature: 0.3,
        functions: this.getQualityFunctions(),
        stream: false
      });
      
      // 处理AI响应
      return {
        content: aiResponse.content,
        data: aiResponse.functionResults || {}
      };
    } catch (error) {
      logger.error('处理质量查询失败', { error: error.message });
      
      return {
        content: `抱歉，处理您的质量查询时出现了问题。${error.message}`,
        data: { error: error.message }
      };
    }
  }
  
  /**
   * 处理生产线查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processProductionQuery(query, sessionContext) {
    try {
      // 准备系统消息
      const systemMessage = `你是生产线助手，专注于处理生产线状态监控、设备维护和效率优化相关的问题。
当前时间：${new Date().toLocaleString('zh-CN')}
`;
      
      // 准备用户上下文和历史记录
      const messages = this.prepareMessagesForAI(query, sessionContext, systemMessage);
      
      // 调用AI服务
      const aiResponse = await sendToAIService({
        messages,
        temperature: 0.3,
        functions: this.getProductionFunctions(),
        stream: false
      });
      
      // 处理AI响应
      return {
        content: aiResponse.content,
        data: aiResponse.functionResults || {}
      };
    } catch (error) {
      logger.error('处理生产线查询失败', { error: error.message });
      
      return {
        content: `抱歉，处理您的生产线查询时出现了问题。${error.message}`,
        data: { error: error.message }
      };
    }
  }
  
  /**
   * 准备发送给AI的消息
   * @param {string} query 当前查询
   * @param {Object} sessionContext 会话上下文
   * @param {string} systemMessage 系统消息
   * @returns {Array} 消息数组
   */
  prepareMessagesForAI(query, sessionContext, systemMessage) {
    // 系统消息
    const messages = [{ role: 'system', content: systemMessage }];
    
    // 添加上下文信息
    if (Object.keys(sessionContext.context).length > 0) {
      messages.push({
        role: 'system',
        content: `上下文信息：\n${JSON.stringify(sessionContext.context, null, 2)}`
      });
    }
    
    // 添加历史记录 (最多5条)
    const relevantHistory = sessionContext.history.slice(-10);
    for (const msg of relevantHistory) {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    }
    
    return messages;
  }
  
  /**
   * 获取实验室相关功能
   * @returns {Array} 功能列表
   */
  getLabFunctions() {
    return [
      {
        name: 'getLabTestData',
        description: '获取实验室测试数据',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            startDate: { type: 'string', description: '开始日期 (YYYY-MM-DD)' },
            endDate: { type: 'string', description: '结束日期 (YYYY-MM-DD)' },
            limit: { type: 'number', description: '返回结果数量限制' }
          }
        }
      },
      {
        name: 'analyzeTestTrend',
        description: '分析测试数据趋势',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            parameterName: { type: 'string', description: '参数名称' },
            period: { type: 'string', description: '分析周期 (day, week, month)' }
          },
          required: ['materialCode', 'parameterName']
        }
      }
    ];
  }
  
  /**
   * 获取质量相关功能
   * @returns {Array} 功能列表
   */
  getQualityFunctions() {
    return [
      {
        name: 'getQualityInspectionData',
        description: '获取质量检验数据',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            supplierId: { type: 'string', description: '供应商ID' },
            startDate: { type: 'string', description: '开始日期 (YYYY-MM-DD)' },
            endDate: { type: 'string', description: '结束日期 (YYYY-MM-DD)' },
            limit: { type: 'number', description: '返回结果数量限制' }
          }
        }
      },
      {
        name: 'getDefectAnalysis',
        description: '获取不良品分析',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            defectType: { type: 'string', description: '不良类型' },
            period: { type: 'string', description: '分析周期 (day, week, month)' }
          }
        }
      }
    ];
  }
  
  /**
   * 获取生产线相关功能
   * @returns {Array} 功能列表
   */
  getProductionFunctions() {
    return [
      {
        name: 'getProductionStatus',
        description: '获取生产线状态',
        parameters: {
          type: 'object',
          properties: {
            lineId: { type: 'string', description: '生产线ID' },
            date: { type: 'string', description: '日期 (YYYY-MM-DD)' }
          }
        }
      },
      {
        name: 'getProductionEfficiency',
        description: '获取生产效率数据',
        parameters: {
          type: 'object',
          properties: {
            lineId: { type: 'string', description: '生产线ID' },
            startDate: { type: 'string', description: '开始日期 (YYYY-MM-DD)' },
            endDate: { type: 'string', description: '结束日期 (YYYY-MM-DD)' }
          }
        }
      }
    ];
  }
}

// 导出单例实例
export default new AssistantService(); 
 * 统一助手服务
 * 提供核心业务逻辑，处理助手查询
 */
import { logger } from '../utils/logger.js';
import { sendToAIService } from '../utils/aiClient.js';

/**
 * 助手服务类
 */
class AssistantService {
  constructor() {
    // 会话上下文存储
    this.contextStore = new Map();
    
    // 有效的助手模式
    this.validModes = ['auto', 'quality', 'lab', 'production'];
  }
  
  /**
   * 处理用户查询
   * @param {Object} params 查询参数
   * @param {string} params.query 用户查询文本
   * @param {string} params.mode 助手模式
   * @param {string} params.sessionId 会话ID
   * @param {Object} params.context 上下文信息
   * @param {string} params.requestId 请求ID
   * @returns {Promise<Object>} 处理结果
   */
  async handleQuery(params) {
    const { query, mode, sessionId, context, requestId } = params;
    
    logger.info(`处理查询 [${requestId}]`, {
      query: query.substring(0, 50) + (query.length > 50 ? '...' : ''),
      mode,
      sessionId,
      requestId
    });
    
    try {
      // 获取会话上下文
      const sessionContext = this.getSessionContext(sessionId);
      
      // 合并传入的上下文
      if (context) {
        Object.assign(sessionContext.context, context);
      }
      
      // 自动检测模式 (如果设置为auto)
      const detectedMode = mode === 'auto' ? this.detectMode(query) : mode;
      sessionContext.mode = detectedMode;
      
      // 添加查询到历史记录
      sessionContext.history.push({
        role: 'user',
        content: query,
        timestamp: new Date().toISOString()
      });
      
      // 根据模式处理查询
      const response = await this.processQueryByMode(query, sessionContext);
      
      // 添加响应到历史记录
      sessionContext.history.push({
        role: 'assistant',
        content: response.content,
        data: response.data,
        timestamp: new Date().toISOString()
      });
      
      // 更新会话上下文
      this.updateSessionContext(sessionId, sessionContext);
      
      // 返回处理结果
      return {
        answer: response.content,
        mode: detectedMode,
        context: sessionContext.context,
        structuredData: response.data
      };
    } catch (error) {
      logger.error(`处理查询失败 [${requestId}]`, {
        error: error.message,
        stack: error.stack,
        requestId
      });
      
      throw error;
    }
  }
  
  /**
   * 获取会话上下文
   * @param {string} sessionId 会话ID
   * @returns {Object} 会话上下文
   */
  getSessionContext(sessionId) {
    if (!this.contextStore.has(sessionId)) {
      // 创建新的会话上下文
      const newContext = {
        mode: 'auto',
        history: [],
        context: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.contextStore.set(sessionId, newContext);
      return newContext;
    }
    
    return this.contextStore.get(sessionId);
  }
  
  /**
   * 更新会话上下文
   * @param {string} sessionId 会话ID
   * @param {Object} context 上下文数据
   */
  updateSessionContext(sessionId, context) {
    // 更新最后修改时间
    context.updatedAt = new Date().toISOString();
    
    // 限制历史记录长度，防止内存溢出
    if (context.history.length > 20) {
      context.history = context.history.slice(-20);
    }
    
    this.contextStore.set(sessionId, context);
    
    // 自动清理超过24小时的会话
    this.cleanExpiredSessions();
  }
  
  /**
   * 清理过期的会话
   * 删除超过24小时未活动的会话
   */
  cleanExpiredSessions() {
    const now = new Date();
    const expireThreshold = 24 * 60 * 60 * 1000; // 24小时
    
    for (const [sessionId, context] of this.contextStore.entries()) {
      const lastUpdated = new Date(context.updatedAt);
      const timeDiff = now - lastUpdated;
      
      if (timeDiff > expireThreshold) {
        this.contextStore.delete(sessionId);
        logger.info(`清理过期会话: ${sessionId}`);
      }
    }
  }
  
  /**
   * 清除指定会话的上下文
   * @param {string} sessionId 会话ID
   * @returns {boolean} 是否成功清除
   */
  async clearSessionContext(sessionId) {
    if (this.contextStore.has(sessionId)) {
      this.contextStore.delete(sessionId);
      logger.info(`清除会话上下文: ${sessionId}`);
      return true;
    }
    
    return false;
  }
  
  /**
   * 根据查询内容自动检测助手模式
   * @param {string} query 查询文本
   * @returns {string} 检测到的模式
   */
  detectMode(query) {
    const query_lower = query.toLowerCase();
    
    // 实验室相关关键词
    if (query_lower.includes('实验') || 
        query_lower.includes('测试') || 
        query_lower.includes('检测') ||
        query_lower.includes('分析') ||
        query_lower.includes('参数')) {
      return 'lab';
    }
    
    // 生产线相关关键词
    if (query_lower.includes('生产') || 
        query_lower.includes('产线') || 
        query_lower.includes('产能') ||
        query_lower.includes('设备') ||
        query_lower.includes('效率')) {
      return 'production';
    }
    
    // 质量相关关键词
    if (query_lower.includes('质量') || 
        query_lower.includes('不良') || 
        query_lower.includes('物料') ||
        query_lower.includes('供应商') ||
        query_lower.includes('检验')) {
      return 'quality';
    }
    
    // 默认使用质量模式
    return 'quality';
  }
  
  /**
   * 根据模式处理查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processQueryByMode(query, sessionContext) {
    const mode = sessionContext.mode;
    
    // 根据模式处理查询
    switch (mode) {
      case 'lab':
        return this.processLabQuery(query, sessionContext);
        
      case 'quality':
        return this.processQualityQuery(query, sessionContext);
        
      case 'production':
        return this.processProductionQuery(query, sessionContext);
        
      default:
        // 默认使用质量模式
        return this.processQualityQuery(query, sessionContext);
    }
  }
  
  /**
   * 处理实验室查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processLabQuery(query, sessionContext) {
    try {
      // 准备系统消息
      const systemMessage = `你是实验室质量助手，专注于处理实验室测试、质量分析和参数相关的问题。
当前时间：${new Date().toLocaleString('zh-CN')}
`;
      
      // 准备用户上下文和历史记录
      const messages = this.prepareMessagesForAI(query, sessionContext, systemMessage);
      
      // 调用AI服务
      const aiResponse = await sendToAIService({
        messages,
        temperature: 0.3,
        functions: this.getLabFunctions(),
        stream: false
      });
      
      // 处理AI响应
      return {
        content: aiResponse.content,
        data: aiResponse.functionResults || {}
      };
    } catch (error) {
      logger.error('处理实验室查询失败', { error: error.message });
      
      return {
        content: `抱歉，处理您的实验室查询时出现了问题。${error.message}`,
        data: { error: error.message }
      };
    }
  }
  
  /**
   * 处理质量查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processQualityQuery(query, sessionContext) {
    try {
      // 准备系统消息
      const systemMessage = `你是质量检验助手，专注于处理物料质量检验、不良品分析和供应商相关的问题。
当前时间：${new Date().toLocaleString('zh-CN')}
`;
      
      // 准备用户上下文和历史记录
      const messages = this.prepareMessagesForAI(query, sessionContext, systemMessage);
      
      // 调用AI服务
      const aiResponse = await sendToAIService({
        messages,
        temperature: 0.3,
        functions: this.getQualityFunctions(),
        stream: false
      });
      
      // 处理AI响应
      return {
        content: aiResponse.content,
        data: aiResponse.functionResults || {}
      };
    } catch (error) {
      logger.error('处理质量查询失败', { error: error.message });
      
      return {
        content: `抱歉，处理您的质量查询时出现了问题。${error.message}`,
        data: { error: error.message }
      };
    }
  }
  
  /**
   * 处理生产线查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processProductionQuery(query, sessionContext) {
    try {
      // 准备系统消息
      const systemMessage = `你是生产线助手，专注于处理生产线状态监控、设备维护和效率优化相关的问题。
当前时间：${new Date().toLocaleString('zh-CN')}
`;
      
      // 准备用户上下文和历史记录
      const messages = this.prepareMessagesForAI(query, sessionContext, systemMessage);
      
      // 调用AI服务
      const aiResponse = await sendToAIService({
        messages,
        temperature: 0.3,
        functions: this.getProductionFunctions(),
        stream: false
      });
      
      // 处理AI响应
      return {
        content: aiResponse.content,
        data: aiResponse.functionResults || {}
      };
    } catch (error) {
      logger.error('处理生产线查询失败', { error: error.message });
      
      return {
        content: `抱歉，处理您的生产线查询时出现了问题。${error.message}`,
        data: { error: error.message }
      };
    }
  }
  
  /**
   * 准备发送给AI的消息
   * @param {string} query 当前查询
   * @param {Object} sessionContext 会话上下文
   * @param {string} systemMessage 系统消息
   * @returns {Array} 消息数组
   */
  prepareMessagesForAI(query, sessionContext, systemMessage) {
    // 系统消息
    const messages = [{ role: 'system', content: systemMessage }];
    
    // 添加上下文信息
    if (Object.keys(sessionContext.context).length > 0) {
      messages.push({
        role: 'system',
        content: `上下文信息：\n${JSON.stringify(sessionContext.context, null, 2)}`
      });
    }
    
    // 添加历史记录 (最多5条)
    const relevantHistory = sessionContext.history.slice(-10);
    for (const msg of relevantHistory) {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    }
    
    return messages;
  }
  
  /**
   * 获取实验室相关功能
   * @returns {Array} 功能列表
   */
  getLabFunctions() {
    return [
      {
        name: 'getLabTestData',
        description: '获取实验室测试数据',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            startDate: { type: 'string', description: '开始日期 (YYYY-MM-DD)' },
            endDate: { type: 'string', description: '结束日期 (YYYY-MM-DD)' },
            limit: { type: 'number', description: '返回结果数量限制' }
          }
        }
      },
      {
        name: 'analyzeTestTrend',
        description: '分析测试数据趋势',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            parameterName: { type: 'string', description: '参数名称' },
            period: { type: 'string', description: '分析周期 (day, week, month)' }
          },
          required: ['materialCode', 'parameterName']
        }
      }
    ];
  }
  
  /**
   * 获取质量相关功能
   * @returns {Array} 功能列表
   */
  getQualityFunctions() {
    return [
      {
        name: 'getQualityInspectionData',
        description: '获取质量检验数据',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            supplierId: { type: 'string', description: '供应商ID' },
            startDate: { type: 'string', description: '开始日期 (YYYY-MM-DD)' },
            endDate: { type: 'string', description: '结束日期 (YYYY-MM-DD)' },
            limit: { type: 'number', description: '返回结果数量限制' }
          }
        }
      },
      {
        name: 'getDefectAnalysis',
        description: '获取不良品分析',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            defectType: { type: 'string', description: '不良类型' },
            period: { type: 'string', description: '分析周期 (day, week, month)' }
          }
        }
      }
    ];
  }
  
  /**
   * 获取生产线相关功能
   * @returns {Array} 功能列表
   */
  getProductionFunctions() {
    return [
      {
        name: 'getProductionStatus',
        description: '获取生产线状态',
        parameters: {
          type: 'object',
          properties: {
            lineId: { type: 'string', description: '生产线ID' },
            date: { type: 'string', description: '日期 (YYYY-MM-DD)' }
          }
        }
      },
      {
        name: 'getProductionEfficiency',
        description: '获取生产效率数据',
        parameters: {
          type: 'object',
          properties: {
            lineId: { type: 'string', description: '生产线ID' },
            startDate: { type: 'string', description: '开始日期 (YYYY-MM-DD)' },
            endDate: { type: 'string', description: '结束日期 (YYYY-MM-DD)' }
          }
        }
      }
    ];
  }
}

// 导出单例实例
export default new AssistantService(); 
 * 统一助手服务
 * 提供核心业务逻辑，处理助手查询
 */
import { logger } from '../utils/logger.js';
import { sendToAIService } from '../utils/aiClient.js';

/**
 * 助手服务类
 */
class AssistantService {
  constructor() {
    // 会话上下文存储
    this.contextStore = new Map();
    
    // 有效的助手模式
    this.validModes = ['auto', 'quality', 'lab', 'production'];
  }
  
  /**
   * 处理用户查询
   * @param {Object} params 查询参数
   * @param {string} params.query 用户查询文本
   * @param {string} params.mode 助手模式
   * @param {string} params.sessionId 会话ID
   * @param {Object} params.context 上下文信息
   * @param {string} params.requestId 请求ID
   * @returns {Promise<Object>} 处理结果
   */
  async handleQuery(params) {
    const { query, mode, sessionId, context, requestId } = params;
    
    logger.info(`处理查询 [${requestId}]`, {
      query: query.substring(0, 50) + (query.length > 50 ? '...' : ''),
      mode,
      sessionId,
      requestId
    });
    
    try {
      // 获取会话上下文
      const sessionContext = this.getSessionContext(sessionId);
      
      // 合并传入的上下文
      if (context) {
        Object.assign(sessionContext.context, context);
      }
      
      // 自动检测模式 (如果设置为auto)
      const detectedMode = mode === 'auto' ? this.detectMode(query) : mode;
      sessionContext.mode = detectedMode;
      
      // 添加查询到历史记录
      sessionContext.history.push({
        role: 'user',
        content: query,
        timestamp: new Date().toISOString()
      });
      
      // 根据模式处理查询
      const response = await this.processQueryByMode(query, sessionContext);
      
      // 添加响应到历史记录
      sessionContext.history.push({
        role: 'assistant',
        content: response.content,
        data: response.data,
        timestamp: new Date().toISOString()
      });
      
      // 更新会话上下文
      this.updateSessionContext(sessionId, sessionContext);
      
      // 返回处理结果
      return {
        answer: response.content,
        mode: detectedMode,
        context: sessionContext.context,
        structuredData: response.data
      };
    } catch (error) {
      logger.error(`处理查询失败 [${requestId}]`, {
        error: error.message,
        stack: error.stack,
        requestId
      });
      
      throw error;
    }
  }
  
  /**
   * 获取会话上下文
   * @param {string} sessionId 会话ID
   * @returns {Object} 会话上下文
   */
  getSessionContext(sessionId) {
    if (!this.contextStore.has(sessionId)) {
      // 创建新的会话上下文
      const newContext = {
        mode: 'auto',
        history: [],
        context: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.contextStore.set(sessionId, newContext);
      return newContext;
    }
    
    return this.contextStore.get(sessionId);
  }
  
  /**
   * 更新会话上下文
   * @param {string} sessionId 会话ID
   * @param {Object} context 上下文数据
   */
  updateSessionContext(sessionId, context) {
    // 更新最后修改时间
    context.updatedAt = new Date().toISOString();
    
    // 限制历史记录长度，防止内存溢出
    if (context.history.length > 20) {
      context.history = context.history.slice(-20);
    }
    
    this.contextStore.set(sessionId, context);
    
    // 自动清理超过24小时的会话
    this.cleanExpiredSessions();
  }
  
  /**
   * 清理过期的会话
   * 删除超过24小时未活动的会话
   */
  cleanExpiredSessions() {
    const now = new Date();
    const expireThreshold = 24 * 60 * 60 * 1000; // 24小时
    
    for (const [sessionId, context] of this.contextStore.entries()) {
      const lastUpdated = new Date(context.updatedAt);
      const timeDiff = now - lastUpdated;
      
      if (timeDiff > expireThreshold) {
        this.contextStore.delete(sessionId);
        logger.info(`清理过期会话: ${sessionId}`);
      }
    }
  }
  
  /**
   * 清除指定会话的上下文
   * @param {string} sessionId 会话ID
   * @returns {boolean} 是否成功清除
   */
  async clearSessionContext(sessionId) {
    if (this.contextStore.has(sessionId)) {
      this.contextStore.delete(sessionId);
      logger.info(`清除会话上下文: ${sessionId}`);
      return true;
    }
    
    return false;
  }
  
  /**
   * 根据查询内容自动检测助手模式
   * @param {string} query 查询文本
   * @returns {string} 检测到的模式
   */
  detectMode(query) {
    const query_lower = query.toLowerCase();
    
    // 实验室相关关键词
    if (query_lower.includes('实验') || 
        query_lower.includes('测试') || 
        query_lower.includes('检测') ||
        query_lower.includes('分析') ||
        query_lower.includes('参数')) {
      return 'lab';
    }
    
    // 生产线相关关键词
    if (query_lower.includes('生产') || 
        query_lower.includes('产线') || 
        query_lower.includes('产能') ||
        query_lower.includes('设备') ||
        query_lower.includes('效率')) {
      return 'production';
    }
    
    // 质量相关关键词
    if (query_lower.includes('质量') || 
        query_lower.includes('不良') || 
        query_lower.includes('物料') ||
        query_lower.includes('供应商') ||
        query_lower.includes('检验')) {
      return 'quality';
    }
    
    // 默认使用质量模式
    return 'quality';
  }
  
  /**
   * 根据模式处理查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processQueryByMode(query, sessionContext) {
    const mode = sessionContext.mode;
    
    // 根据模式处理查询
    switch (mode) {
      case 'lab':
        return this.processLabQuery(query, sessionContext);
        
      case 'quality':
        return this.processQualityQuery(query, sessionContext);
        
      case 'production':
        return this.processProductionQuery(query, sessionContext);
        
      default:
        // 默认使用质量模式
        return this.processQualityQuery(query, sessionContext);
    }
  }
  
  /**
   * 处理实验室查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processLabQuery(query, sessionContext) {
    try {
      // 准备系统消息
      const systemMessage = `你是实验室质量助手，专注于处理实验室测试、质量分析和参数相关的问题。
当前时间：${new Date().toLocaleString('zh-CN')}
`;
      
      // 准备用户上下文和历史记录
      const messages = this.prepareMessagesForAI(query, sessionContext, systemMessage);
      
      // 调用AI服务
      const aiResponse = await sendToAIService({
        messages,
        temperature: 0.3,
        functions: this.getLabFunctions(),
        stream: false
      });
      
      // 处理AI响应
      return {
        content: aiResponse.content,
        data: aiResponse.functionResults || {}
      };
    } catch (error) {
      logger.error('处理实验室查询失败', { error: error.message });
      
      return {
        content: `抱歉，处理您的实验室查询时出现了问题。${error.message}`,
        data: { error: error.message }
      };
    }
  }
  
  /**
   * 处理质量查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processQualityQuery(query, sessionContext) {
    try {
      // 准备系统消息
      const systemMessage = `你是质量检验助手，专注于处理物料质量检验、不良品分析和供应商相关的问题。
当前时间：${new Date().toLocaleString('zh-CN')}
`;
      
      // 准备用户上下文和历史记录
      const messages = this.prepareMessagesForAI(query, sessionContext, systemMessage);
      
      // 调用AI服务
      const aiResponse = await sendToAIService({
        messages,
        temperature: 0.3,
        functions: this.getQualityFunctions(),
        stream: false
      });
      
      // 处理AI响应
      return {
        content: aiResponse.content,
        data: aiResponse.functionResults || {}
      };
    } catch (error) {
      logger.error('处理质量查询失败', { error: error.message });
      
      return {
        content: `抱歉，处理您的质量查询时出现了问题。${error.message}`,
        data: { error: error.message }
      };
    }
  }
  
  /**
   * 处理生产线查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processProductionQuery(query, sessionContext) {
    try {
      // 准备系统消息
      const systemMessage = `你是生产线助手，专注于处理生产线状态监控、设备维护和效率优化相关的问题。
当前时间：${new Date().toLocaleString('zh-CN')}
`;
      
      // 准备用户上下文和历史记录
      const messages = this.prepareMessagesForAI(query, sessionContext, systemMessage);
      
      // 调用AI服务
      const aiResponse = await sendToAIService({
        messages,
        temperature: 0.3,
        functions: this.getProductionFunctions(),
        stream: false
      });
      
      // 处理AI响应
      return {
        content: aiResponse.content,
        data: aiResponse.functionResults || {}
      };
    } catch (error) {
      logger.error('处理生产线查询失败', { error: error.message });
      
      return {
        content: `抱歉，处理您的生产线查询时出现了问题。${error.message}`,
        data: { error: error.message }
      };
    }
  }
  
  /**
   * 准备发送给AI的消息
   * @param {string} query 当前查询
   * @param {Object} sessionContext 会话上下文
   * @param {string} systemMessage 系统消息
   * @returns {Array} 消息数组
   */
  prepareMessagesForAI(query, sessionContext, systemMessage) {
    // 系统消息
    const messages = [{ role: 'system', content: systemMessage }];
    
    // 添加上下文信息
    if (Object.keys(sessionContext.context).length > 0) {
      messages.push({
        role: 'system',
        content: `上下文信息：\n${JSON.stringify(sessionContext.context, null, 2)}`
      });
    }
    
    // 添加历史记录 (最多5条)
    const relevantHistory = sessionContext.history.slice(-10);
    for (const msg of relevantHistory) {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    }
    
    return messages;
  }
  
  /**
   * 获取实验室相关功能
   * @returns {Array} 功能列表
   */
  getLabFunctions() {
    return [
      {
        name: 'getLabTestData',
        description: '获取实验室测试数据',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            startDate: { type: 'string', description: '开始日期 (YYYY-MM-DD)' },
            endDate: { type: 'string', description: '结束日期 (YYYY-MM-DD)' },
            limit: { type: 'number', description: '返回结果数量限制' }
          }
        }
      },
      {
        name: 'analyzeTestTrend',
        description: '分析测试数据趋势',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            parameterName: { type: 'string', description: '参数名称' },
            period: { type: 'string', description: '分析周期 (day, week, month)' }
          },
          required: ['materialCode', 'parameterName']
        }
      }
    ];
  }
  
  /**
   * 获取质量相关功能
   * @returns {Array} 功能列表
   */
  getQualityFunctions() {
    return [
      {
        name: 'getQualityInspectionData',
        description: '获取质量检验数据',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            supplierId: { type: 'string', description: '供应商ID' },
            startDate: { type: 'string', description: '开始日期 (YYYY-MM-DD)' },
            endDate: { type: 'string', description: '结束日期 (YYYY-MM-DD)' },
            limit: { type: 'number', description: '返回结果数量限制' }
          }
        }
      },
      {
        name: 'getDefectAnalysis',
        description: '获取不良品分析',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            defectType: { type: 'string', description: '不良类型' },
            period: { type: 'string', description: '分析周期 (day, week, month)' }
          }
        }
      }
    ];
  }
  
  /**
   * 获取生产线相关功能
   * @returns {Array} 功能列表
   */
  getProductionFunctions() {
    return [
      {
        name: 'getProductionStatus',
        description: '获取生产线状态',
        parameters: {
          type: 'object',
          properties: {
            lineId: { type: 'string', description: '生产线ID' },
            date: { type: 'string', description: '日期 (YYYY-MM-DD)' }
          }
        }
      },
      {
        name: 'getProductionEfficiency',
        description: '获取生产效率数据',
        parameters: {
          type: 'object',
          properties: {
            lineId: { type: 'string', description: '生产线ID' },
            startDate: { type: 'string', description: '开始日期 (YYYY-MM-DD)' },
            endDate: { type: 'string', description: '结束日期 (YYYY-MM-DD)' }
          }
        }
      }
    ];
  }
}

// 导出单例实例
export default new AssistantService(); 
 
 
 
 * 统一助手服务
 * 提供核心业务逻辑，处理助手查询
 */
import { logger } from '../utils/logger.js';
import { sendToAIService } from '../utils/aiClient.js';

/**
 * 助手服务类
 */
class AssistantService {
  constructor() {
    // 会话上下文存储
    this.contextStore = new Map();
    
    // 有效的助手模式
    this.validModes = ['auto', 'quality', 'lab', 'production'];
  }
  
  /**
   * 处理用户查询
   * @param {Object} params 查询参数
   * @param {string} params.query 用户查询文本
   * @param {string} params.mode 助手模式
   * @param {string} params.sessionId 会话ID
   * @param {Object} params.context 上下文信息
   * @param {string} params.requestId 请求ID
   * @returns {Promise<Object>} 处理结果
   */
  async handleQuery(params) {
    const { query, mode, sessionId, context, requestId } = params;
    
    logger.info(`处理查询 [${requestId}]`, {
      query: query.substring(0, 50) + (query.length > 50 ? '...' : ''),
      mode,
      sessionId,
      requestId
    });
    
    try {
      // 获取会话上下文
      const sessionContext = this.getSessionContext(sessionId);
      
      // 合并传入的上下文
      if (context) {
        Object.assign(sessionContext.context, context);
      }
      
      // 自动检测模式 (如果设置为auto)
      const detectedMode = mode === 'auto' ? this.detectMode(query) : mode;
      sessionContext.mode = detectedMode;
      
      // 添加查询到历史记录
      sessionContext.history.push({
        role: 'user',
        content: query,
        timestamp: new Date().toISOString()
      });
      
      // 根据模式处理查询
      const response = await this.processQueryByMode(query, sessionContext);
      
      // 添加响应到历史记录
      sessionContext.history.push({
        role: 'assistant',
        content: response.content,
        data: response.data,
        timestamp: new Date().toISOString()
      });
      
      // 更新会话上下文
      this.updateSessionContext(sessionId, sessionContext);
      
      // 返回处理结果
      return {
        answer: response.content,
        mode: detectedMode,
        context: sessionContext.context,
        structuredData: response.data
      };
    } catch (error) {
      logger.error(`处理查询失败 [${requestId}]`, {
        error: error.message,
        stack: error.stack,
        requestId
      });
      
      throw error;
    }
  }
  
  /**
   * 获取会话上下文
   * @param {string} sessionId 会话ID
   * @returns {Object} 会话上下文
   */
  getSessionContext(sessionId) {
    if (!this.contextStore.has(sessionId)) {
      // 创建新的会话上下文
      const newContext = {
        mode: 'auto',
        history: [],
        context: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.contextStore.set(sessionId, newContext);
      return newContext;
    }
    
    return this.contextStore.get(sessionId);
  }
  
  /**
   * 更新会话上下文
   * @param {string} sessionId 会话ID
   * @param {Object} context 上下文数据
   */
  updateSessionContext(sessionId, context) {
    // 更新最后修改时间
    context.updatedAt = new Date().toISOString();
    
    // 限制历史记录长度，防止内存溢出
    if (context.history.length > 20) {
      context.history = context.history.slice(-20);
    }
    
    this.contextStore.set(sessionId, context);
    
    // 自动清理超过24小时的会话
    this.cleanExpiredSessions();
  }
  
  /**
   * 清理过期的会话
   * 删除超过24小时未活动的会话
   */
  cleanExpiredSessions() {
    const now = new Date();
    const expireThreshold = 24 * 60 * 60 * 1000; // 24小时
    
    for (const [sessionId, context] of this.contextStore.entries()) {
      const lastUpdated = new Date(context.updatedAt);
      const timeDiff = now - lastUpdated;
      
      if (timeDiff > expireThreshold) {
        this.contextStore.delete(sessionId);
        logger.info(`清理过期会话: ${sessionId}`);
      }
    }
  }
  
  /**
   * 清除指定会话的上下文
   * @param {string} sessionId 会话ID
   * @returns {boolean} 是否成功清除
   */
  async clearSessionContext(sessionId) {
    if (this.contextStore.has(sessionId)) {
      this.contextStore.delete(sessionId);
      logger.info(`清除会话上下文: ${sessionId}`);
      return true;
    }
    
    return false;
  }
  
  /**
   * 根据查询内容自动检测助手模式
   * @param {string} query 查询文本
   * @returns {string} 检测到的模式
   */
  detectMode(query) {
    const query_lower = query.toLowerCase();
    
    // 实验室相关关键词
    if (query_lower.includes('实验') || 
        query_lower.includes('测试') || 
        query_lower.includes('检测') ||
        query_lower.includes('分析') ||
        query_lower.includes('参数')) {
      return 'lab';
    }
    
    // 生产线相关关键词
    if (query_lower.includes('生产') || 
        query_lower.includes('产线') || 
        query_lower.includes('产能') ||
        query_lower.includes('设备') ||
        query_lower.includes('效率')) {
      return 'production';
    }
    
    // 质量相关关键词
    if (query_lower.includes('质量') || 
        query_lower.includes('不良') || 
        query_lower.includes('物料') ||
        query_lower.includes('供应商') ||
        query_lower.includes('检验')) {
      return 'quality';
    }
    
    // 默认使用质量模式
    return 'quality';
  }
  
  /**
   * 根据模式处理查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processQueryByMode(query, sessionContext) {
    const mode = sessionContext.mode;
    
    // 根据模式处理查询
    switch (mode) {
      case 'lab':
        return this.processLabQuery(query, sessionContext);
        
      case 'quality':
        return this.processQualityQuery(query, sessionContext);
        
      case 'production':
        return this.processProductionQuery(query, sessionContext);
        
      default:
        // 默认使用质量模式
        return this.processQualityQuery(query, sessionContext);
    }
  }
  
  /**
   * 处理实验室查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processLabQuery(query, sessionContext) {
    try {
      // 准备系统消息
      const systemMessage = `你是实验室质量助手，专注于处理实验室测试、质量分析和参数相关的问题。
当前时间：${new Date().toLocaleString('zh-CN')}
`;
      
      // 准备用户上下文和历史记录
      const messages = this.prepareMessagesForAI(query, sessionContext, systemMessage);
      
      // 调用AI服务
      const aiResponse = await sendToAIService({
        messages,
        temperature: 0.3,
        functions: this.getLabFunctions(),
        stream: false
      });
      
      // 处理AI响应
      return {
        content: aiResponse.content,
        data: aiResponse.functionResults || {}
      };
    } catch (error) {
      logger.error('处理实验室查询失败', { error: error.message });
      
      return {
        content: `抱歉，处理您的实验室查询时出现了问题。${error.message}`,
        data: { error: error.message }
      };
    }
  }
  
  /**
   * 处理质量查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processQualityQuery(query, sessionContext) {
    try {
      // 准备系统消息
      const systemMessage = `你是质量检验助手，专注于处理物料质量检验、不良品分析和供应商相关的问题。
当前时间：${new Date().toLocaleString('zh-CN')}
`;
      
      // 准备用户上下文和历史记录
      const messages = this.prepareMessagesForAI(query, sessionContext, systemMessage);
      
      // 调用AI服务
      const aiResponse = await sendToAIService({
        messages,
        temperature: 0.3,
        functions: this.getQualityFunctions(),
        stream: false
      });
      
      // 处理AI响应
      return {
        content: aiResponse.content,
        data: aiResponse.functionResults || {}
      };
    } catch (error) {
      logger.error('处理质量查询失败', { error: error.message });
      
      return {
        content: `抱歉，处理您的质量查询时出现了问题。${error.message}`,
        data: { error: error.message }
      };
    }
  }
  
  /**
   * 处理生产线查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processProductionQuery(query, sessionContext) {
    try {
      // 准备系统消息
      const systemMessage = `你是生产线助手，专注于处理生产线状态监控、设备维护和效率优化相关的问题。
当前时间：${new Date().toLocaleString('zh-CN')}
`;
      
      // 准备用户上下文和历史记录
      const messages = this.prepareMessagesForAI(query, sessionContext, systemMessage);
      
      // 调用AI服务
      const aiResponse = await sendToAIService({
        messages,
        temperature: 0.3,
        functions: this.getProductionFunctions(),
        stream: false
      });
      
      // 处理AI响应
      return {
        content: aiResponse.content,
        data: aiResponse.functionResults || {}
      };
    } catch (error) {
      logger.error('处理生产线查询失败', { error: error.message });
      
      return {
        content: `抱歉，处理您的生产线查询时出现了问题。${error.message}`,
        data: { error: error.message }
      };
    }
  }
  
  /**
   * 准备发送给AI的消息
   * @param {string} query 当前查询
   * @param {Object} sessionContext 会话上下文
   * @param {string} systemMessage 系统消息
   * @returns {Array} 消息数组
   */
  prepareMessagesForAI(query, sessionContext, systemMessage) {
    // 系统消息
    const messages = [{ role: 'system', content: systemMessage }];
    
    // 添加上下文信息
    if (Object.keys(sessionContext.context).length > 0) {
      messages.push({
        role: 'system',
        content: `上下文信息：\n${JSON.stringify(sessionContext.context, null, 2)}`
      });
    }
    
    // 添加历史记录 (最多5条)
    const relevantHistory = sessionContext.history.slice(-10);
    for (const msg of relevantHistory) {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    }
    
    return messages;
  }
  
  /**
   * 获取实验室相关功能
   * @returns {Array} 功能列表
   */
  getLabFunctions() {
    return [
      {
        name: 'getLabTestData',
        description: '获取实验室测试数据',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            startDate: { type: 'string', description: '开始日期 (YYYY-MM-DD)' },
            endDate: { type: 'string', description: '结束日期 (YYYY-MM-DD)' },
            limit: { type: 'number', description: '返回结果数量限制' }
          }
        }
      },
      {
        name: 'analyzeTestTrend',
        description: '分析测试数据趋势',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            parameterName: { type: 'string', description: '参数名称' },
            period: { type: 'string', description: '分析周期 (day, week, month)' }
          },
          required: ['materialCode', 'parameterName']
        }
      }
    ];
  }
  
  /**
   * 获取质量相关功能
   * @returns {Array} 功能列表
   */
  getQualityFunctions() {
    return [
      {
        name: 'getQualityInspectionData',
        description: '获取质量检验数据',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            supplierId: { type: 'string', description: '供应商ID' },
            startDate: { type: 'string', description: '开始日期 (YYYY-MM-DD)' },
            endDate: { type: 'string', description: '结束日期 (YYYY-MM-DD)' },
            limit: { type: 'number', description: '返回结果数量限制' }
          }
        }
      },
      {
        name: 'getDefectAnalysis',
        description: '获取不良品分析',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            defectType: { type: 'string', description: '不良类型' },
            period: { type: 'string', description: '分析周期 (day, week, month)' }
          }
        }
      }
    ];
  }
  
  /**
   * 获取生产线相关功能
   * @returns {Array} 功能列表
   */
  getProductionFunctions() {
    return [
      {
        name: 'getProductionStatus',
        description: '获取生产线状态',
        parameters: {
          type: 'object',
          properties: {
            lineId: { type: 'string', description: '生产线ID' },
            date: { type: 'string', description: '日期 (YYYY-MM-DD)' }
          }
        }
      },
      {
        name: 'getProductionEfficiency',
        description: '获取生产效率数据',
        parameters: {
          type: 'object',
          properties: {
            lineId: { type: 'string', description: '生产线ID' },
            startDate: { type: 'string', description: '开始日期 (YYYY-MM-DD)' },
            endDate: { type: 'string', description: '结束日期 (YYYY-MM-DD)' }
          }
        }
      }
    ];
  }
}

// 导出单例实例
export default new AssistantService(); 
 * 统一助手服务
 * 提供核心业务逻辑，处理助手查询
 */
import { logger } from '../utils/logger.js';
import { sendToAIService } from '../utils/aiClient.js';

/**
 * 助手服务类
 */
class AssistantService {
  constructor() {
    // 会话上下文存储
    this.contextStore = new Map();
    
    // 有效的助手模式
    this.validModes = ['auto', 'quality', 'lab', 'production'];
  }
  
  /**
   * 处理用户查询
   * @param {Object} params 查询参数
   * @param {string} params.query 用户查询文本
   * @param {string} params.mode 助手模式
   * @param {string} params.sessionId 会话ID
   * @param {Object} params.context 上下文信息
   * @param {string} params.requestId 请求ID
   * @returns {Promise<Object>} 处理结果
   */
  async handleQuery(params) {
    const { query, mode, sessionId, context, requestId } = params;
    
    logger.info(`处理查询 [${requestId}]`, {
      query: query.substring(0, 50) + (query.length > 50 ? '...' : ''),
      mode,
      sessionId,
      requestId
    });
    
    try {
      // 获取会话上下文
      const sessionContext = this.getSessionContext(sessionId);
      
      // 合并传入的上下文
      if (context) {
        Object.assign(sessionContext.context, context);
      }
      
      // 自动检测模式 (如果设置为auto)
      const detectedMode = mode === 'auto' ? this.detectMode(query) : mode;
      sessionContext.mode = detectedMode;
      
      // 添加查询到历史记录
      sessionContext.history.push({
        role: 'user',
        content: query,
        timestamp: new Date().toISOString()
      });
      
      // 根据模式处理查询
      const response = await this.processQueryByMode(query, sessionContext);
      
      // 添加响应到历史记录
      sessionContext.history.push({
        role: 'assistant',
        content: response.content,
        data: response.data,
        timestamp: new Date().toISOString()
      });
      
      // 更新会话上下文
      this.updateSessionContext(sessionId, sessionContext);
      
      // 返回处理结果
      return {
        answer: response.content,
        mode: detectedMode,
        context: sessionContext.context,
        structuredData: response.data
      };
    } catch (error) {
      logger.error(`处理查询失败 [${requestId}]`, {
        error: error.message,
        stack: error.stack,
        requestId
      });
      
      throw error;
    }
  }
  
  /**
   * 获取会话上下文
   * @param {string} sessionId 会话ID
   * @returns {Object} 会话上下文
   */
  getSessionContext(sessionId) {
    if (!this.contextStore.has(sessionId)) {
      // 创建新的会话上下文
      const newContext = {
        mode: 'auto',
        history: [],
        context: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.contextStore.set(sessionId, newContext);
      return newContext;
    }
    
    return this.contextStore.get(sessionId);
  }
  
  /**
   * 更新会话上下文
   * @param {string} sessionId 会话ID
   * @param {Object} context 上下文数据
   */
  updateSessionContext(sessionId, context) {
    // 更新最后修改时间
    context.updatedAt = new Date().toISOString();
    
    // 限制历史记录长度，防止内存溢出
    if (context.history.length > 20) {
      context.history = context.history.slice(-20);
    }
    
    this.contextStore.set(sessionId, context);
    
    // 自动清理超过24小时的会话
    this.cleanExpiredSessions();
  }
  
  /**
   * 清理过期的会话
   * 删除超过24小时未活动的会话
   */
  cleanExpiredSessions() {
    const now = new Date();
    const expireThreshold = 24 * 60 * 60 * 1000; // 24小时
    
    for (const [sessionId, context] of this.contextStore.entries()) {
      const lastUpdated = new Date(context.updatedAt);
      const timeDiff = now - lastUpdated;
      
      if (timeDiff > expireThreshold) {
        this.contextStore.delete(sessionId);
        logger.info(`清理过期会话: ${sessionId}`);
      }
    }
  }
  
  /**
   * 清除指定会话的上下文
   * @param {string} sessionId 会话ID
   * @returns {boolean} 是否成功清除
   */
  async clearSessionContext(sessionId) {
    if (this.contextStore.has(sessionId)) {
      this.contextStore.delete(sessionId);
      logger.info(`清除会话上下文: ${sessionId}`);
      return true;
    }
    
    return false;
  }
  
  /**
   * 根据查询内容自动检测助手模式
   * @param {string} query 查询文本
   * @returns {string} 检测到的模式
   */
  detectMode(query) {
    const query_lower = query.toLowerCase();
    
    // 实验室相关关键词
    if (query_lower.includes('实验') || 
        query_lower.includes('测试') || 
        query_lower.includes('检测') ||
        query_lower.includes('分析') ||
        query_lower.includes('参数')) {
      return 'lab';
    }
    
    // 生产线相关关键词
    if (query_lower.includes('生产') || 
        query_lower.includes('产线') || 
        query_lower.includes('产能') ||
        query_lower.includes('设备') ||
        query_lower.includes('效率')) {
      return 'production';
    }
    
    // 质量相关关键词
    if (query_lower.includes('质量') || 
        query_lower.includes('不良') || 
        query_lower.includes('物料') ||
        query_lower.includes('供应商') ||
        query_lower.includes('检验')) {
      return 'quality';
    }
    
    // 默认使用质量模式
    return 'quality';
  }
  
  /**
   * 根据模式处理查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processQueryByMode(query, sessionContext) {
    const mode = sessionContext.mode;
    
    // 根据模式处理查询
    switch (mode) {
      case 'lab':
        return this.processLabQuery(query, sessionContext);
        
      case 'quality':
        return this.processQualityQuery(query, sessionContext);
        
      case 'production':
        return this.processProductionQuery(query, sessionContext);
        
      default:
        // 默认使用质量模式
        return this.processQualityQuery(query, sessionContext);
    }
  }
  
  /**
   * 处理实验室查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processLabQuery(query, sessionContext) {
    try {
      // 准备系统消息
      const systemMessage = `你是实验室质量助手，专注于处理实验室测试、质量分析和参数相关的问题。
当前时间：${new Date().toLocaleString('zh-CN')}
`;
      
      // 准备用户上下文和历史记录
      const messages = this.prepareMessagesForAI(query, sessionContext, systemMessage);
      
      // 调用AI服务
      const aiResponse = await sendToAIService({
        messages,
        temperature: 0.3,
        functions: this.getLabFunctions(),
        stream: false
      });
      
      // 处理AI响应
      return {
        content: aiResponse.content,
        data: aiResponse.functionResults || {}
      };
    } catch (error) {
      logger.error('处理实验室查询失败', { error: error.message });
      
      return {
        content: `抱歉，处理您的实验室查询时出现了问题。${error.message}`,
        data: { error: error.message }
      };
    }
  }
  
  /**
   * 处理质量查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processQualityQuery(query, sessionContext) {
    try {
      // 准备系统消息
      const systemMessage = `你是质量检验助手，专注于处理物料质量检验、不良品分析和供应商相关的问题。
当前时间：${new Date().toLocaleString('zh-CN')}
`;
      
      // 准备用户上下文和历史记录
      const messages = this.prepareMessagesForAI(query, sessionContext, systemMessage);
      
      // 调用AI服务
      const aiResponse = await sendToAIService({
        messages,
        temperature: 0.3,
        functions: this.getQualityFunctions(),
        stream: false
      });
      
      // 处理AI响应
      return {
        content: aiResponse.content,
        data: aiResponse.functionResults || {}
      };
    } catch (error) {
      logger.error('处理质量查询失败', { error: error.message });
      
      return {
        content: `抱歉，处理您的质量查询时出现了问题。${error.message}`,
        data: { error: error.message }
      };
    }
  }
  
  /**
   * 处理生产线查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processProductionQuery(query, sessionContext) {
    try {
      // 准备系统消息
      const systemMessage = `你是生产线助手，专注于处理生产线状态监控、设备维护和效率优化相关的问题。
当前时间：${new Date().toLocaleString('zh-CN')}
`;
      
      // 准备用户上下文和历史记录
      const messages = this.prepareMessagesForAI(query, sessionContext, systemMessage);
      
      // 调用AI服务
      const aiResponse = await sendToAIService({
        messages,
        temperature: 0.3,
        functions: this.getProductionFunctions(),
        stream: false
      });
      
      // 处理AI响应
      return {
        content: aiResponse.content,
        data: aiResponse.functionResults || {}
      };
    } catch (error) {
      logger.error('处理生产线查询失败', { error: error.message });
      
      return {
        content: `抱歉，处理您的生产线查询时出现了问题。${error.message}`,
        data: { error: error.message }
      };
    }
  }
  
  /**
   * 准备发送给AI的消息
   * @param {string} query 当前查询
   * @param {Object} sessionContext 会话上下文
   * @param {string} systemMessage 系统消息
   * @returns {Array} 消息数组
   */
  prepareMessagesForAI(query, sessionContext, systemMessage) {
    // 系统消息
    const messages = [{ role: 'system', content: systemMessage }];
    
    // 添加上下文信息
    if (Object.keys(sessionContext.context).length > 0) {
      messages.push({
        role: 'system',
        content: `上下文信息：\n${JSON.stringify(sessionContext.context, null, 2)}`
      });
    }
    
    // 添加历史记录 (最多5条)
    const relevantHistory = sessionContext.history.slice(-10);
    for (const msg of relevantHistory) {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    }
    
    return messages;
  }
  
  /**
   * 获取实验室相关功能
   * @returns {Array} 功能列表
   */
  getLabFunctions() {
    return [
      {
        name: 'getLabTestData',
        description: '获取实验室测试数据',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            startDate: { type: 'string', description: '开始日期 (YYYY-MM-DD)' },
            endDate: { type: 'string', description: '结束日期 (YYYY-MM-DD)' },
            limit: { type: 'number', description: '返回结果数量限制' }
          }
        }
      },
      {
        name: 'analyzeTestTrend',
        description: '分析测试数据趋势',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            parameterName: { type: 'string', description: '参数名称' },
            period: { type: 'string', description: '分析周期 (day, week, month)' }
          },
          required: ['materialCode', 'parameterName']
        }
      }
    ];
  }
  
  /**
   * 获取质量相关功能
   * @returns {Array} 功能列表
   */
  getQualityFunctions() {
    return [
      {
        name: 'getQualityInspectionData',
        description: '获取质量检验数据',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            supplierId: { type: 'string', description: '供应商ID' },
            startDate: { type: 'string', description: '开始日期 (YYYY-MM-DD)' },
            endDate: { type: 'string', description: '结束日期 (YYYY-MM-DD)' },
            limit: { type: 'number', description: '返回结果数量限制' }
          }
        }
      },
      {
        name: 'getDefectAnalysis',
        description: '获取不良品分析',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            defectType: { type: 'string', description: '不良类型' },
            period: { type: 'string', description: '分析周期 (day, week, month)' }
          }
        }
      }
    ];
  }
  
  /**
   * 获取生产线相关功能
   * @returns {Array} 功能列表
   */
  getProductionFunctions() {
    return [
      {
        name: 'getProductionStatus',
        description: '获取生产线状态',
        parameters: {
          type: 'object',
          properties: {
            lineId: { type: 'string', description: '生产线ID' },
            date: { type: 'string', description: '日期 (YYYY-MM-DD)' }
          }
        }
      },
      {
        name: 'getProductionEfficiency',
        description: '获取生产效率数据',
        parameters: {
          type: 'object',
          properties: {
            lineId: { type: 'string', description: '生产线ID' },
            startDate: { type: 'string', description: '开始日期 (YYYY-MM-DD)' },
            endDate: { type: 'string', description: '结束日期 (YYYY-MM-DD)' }
          }
        }
      }
    ];
  }
}

// 导出单例实例
export default new AssistantService(); 
 * 统一助手服务
 * 提供核心业务逻辑，处理助手查询
 */
import { logger } from '../utils/logger.js';
import { sendToAIService } from '../utils/aiClient.js';

/**
 * 助手服务类
 */
class AssistantService {
  constructor() {
    // 会话上下文存储
    this.contextStore = new Map();
    
    // 有效的助手模式
    this.validModes = ['auto', 'quality', 'lab', 'production'];
  }
  
  /**
   * 处理用户查询
   * @param {Object} params 查询参数
   * @param {string} params.query 用户查询文本
   * @param {string} params.mode 助手模式
   * @param {string} params.sessionId 会话ID
   * @param {Object} params.context 上下文信息
   * @param {string} params.requestId 请求ID
   * @returns {Promise<Object>} 处理结果
   */
  async handleQuery(params) {
    const { query, mode, sessionId, context, requestId } = params;
    
    logger.info(`处理查询 [${requestId}]`, {
      query: query.substring(0, 50) + (query.length > 50 ? '...' : ''),
      mode,
      sessionId,
      requestId
    });
    
    try {
      // 获取会话上下文
      const sessionContext = this.getSessionContext(sessionId);
      
      // 合并传入的上下文
      if (context) {
        Object.assign(sessionContext.context, context);
      }
      
      // 自动检测模式 (如果设置为auto)
      const detectedMode = mode === 'auto' ? this.detectMode(query) : mode;
      sessionContext.mode = detectedMode;
      
      // 添加查询到历史记录
      sessionContext.history.push({
        role: 'user',
        content: query,
        timestamp: new Date().toISOString()
      });
      
      // 根据模式处理查询
      const response = await this.processQueryByMode(query, sessionContext);
      
      // 添加响应到历史记录
      sessionContext.history.push({
        role: 'assistant',
        content: response.content,
        data: response.data,
        timestamp: new Date().toISOString()
      });
      
      // 更新会话上下文
      this.updateSessionContext(sessionId, sessionContext);
      
      // 返回处理结果
      return {
        answer: response.content,
        mode: detectedMode,
        context: sessionContext.context,
        structuredData: response.data
      };
    } catch (error) {
      logger.error(`处理查询失败 [${requestId}]`, {
        error: error.message,
        stack: error.stack,
        requestId
      });
      
      throw error;
    }
  }
  
  /**
   * 获取会话上下文
   * @param {string} sessionId 会话ID
   * @returns {Object} 会话上下文
   */
  getSessionContext(sessionId) {
    if (!this.contextStore.has(sessionId)) {
      // 创建新的会话上下文
      const newContext = {
        mode: 'auto',
        history: [],
        context: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.contextStore.set(sessionId, newContext);
      return newContext;
    }
    
    return this.contextStore.get(sessionId);
  }
  
  /**
   * 更新会话上下文
   * @param {string} sessionId 会话ID
   * @param {Object} context 上下文数据
   */
  updateSessionContext(sessionId, context) {
    // 更新最后修改时间
    context.updatedAt = new Date().toISOString();
    
    // 限制历史记录长度，防止内存溢出
    if (context.history.length > 20) {
      context.history = context.history.slice(-20);
    }
    
    this.contextStore.set(sessionId, context);
    
    // 自动清理超过24小时的会话
    this.cleanExpiredSessions();
  }
  
  /**
   * 清理过期的会话
   * 删除超过24小时未活动的会话
   */
  cleanExpiredSessions() {
    const now = new Date();
    const expireThreshold = 24 * 60 * 60 * 1000; // 24小时
    
    for (const [sessionId, context] of this.contextStore.entries()) {
      const lastUpdated = new Date(context.updatedAt);
      const timeDiff = now - lastUpdated;
      
      if (timeDiff > expireThreshold) {
        this.contextStore.delete(sessionId);
        logger.info(`清理过期会话: ${sessionId}`);
      }
    }
  }
  
  /**
   * 清除指定会话的上下文
   * @param {string} sessionId 会话ID
   * @returns {boolean} 是否成功清除
   */
  async clearSessionContext(sessionId) {
    if (this.contextStore.has(sessionId)) {
      this.contextStore.delete(sessionId);
      logger.info(`清除会话上下文: ${sessionId}`);
      return true;
    }
    
    return false;
  }
  
  /**
   * 根据查询内容自动检测助手模式
   * @param {string} query 查询文本
   * @returns {string} 检测到的模式
   */
  detectMode(query) {
    const query_lower = query.toLowerCase();
    
    // 实验室相关关键词
    if (query_lower.includes('实验') || 
        query_lower.includes('测试') || 
        query_lower.includes('检测') ||
        query_lower.includes('分析') ||
        query_lower.includes('参数')) {
      return 'lab';
    }
    
    // 生产线相关关键词
    if (query_lower.includes('生产') || 
        query_lower.includes('产线') || 
        query_lower.includes('产能') ||
        query_lower.includes('设备') ||
        query_lower.includes('效率')) {
      return 'production';
    }
    
    // 质量相关关键词
    if (query_lower.includes('质量') || 
        query_lower.includes('不良') || 
        query_lower.includes('物料') ||
        query_lower.includes('供应商') ||
        query_lower.includes('检验')) {
      return 'quality';
    }
    
    // 默认使用质量模式
    return 'quality';
  }
  
  /**
   * 根据模式处理查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processQueryByMode(query, sessionContext) {
    const mode = sessionContext.mode;
    
    // 根据模式处理查询
    switch (mode) {
      case 'lab':
        return this.processLabQuery(query, sessionContext);
        
      case 'quality':
        return this.processQualityQuery(query, sessionContext);
        
      case 'production':
        return this.processProductionQuery(query, sessionContext);
        
      default:
        // 默认使用质量模式
        return this.processQualityQuery(query, sessionContext);
    }
  }
  
  /**
   * 处理实验室查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processLabQuery(query, sessionContext) {
    try {
      // 准备系统消息
      const systemMessage = `你是实验室质量助手，专注于处理实验室测试、质量分析和参数相关的问题。
当前时间：${new Date().toLocaleString('zh-CN')}
`;
      
      // 准备用户上下文和历史记录
      const messages = this.prepareMessagesForAI(query, sessionContext, systemMessage);
      
      // 调用AI服务
      const aiResponse = await sendToAIService({
        messages,
        temperature: 0.3,
        functions: this.getLabFunctions(),
        stream: false
      });
      
      // 处理AI响应
      return {
        content: aiResponse.content,
        data: aiResponse.functionResults || {}
      };
    } catch (error) {
      logger.error('处理实验室查询失败', { error: error.message });
      
      return {
        content: `抱歉，处理您的实验室查询时出现了问题。${error.message}`,
        data: { error: error.message }
      };
    }
  }
  
  /**
   * 处理质量查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processQualityQuery(query, sessionContext) {
    try {
      // 准备系统消息
      const systemMessage = `你是质量检验助手，专注于处理物料质量检验、不良品分析和供应商相关的问题。
当前时间：${new Date().toLocaleString('zh-CN')}
`;
      
      // 准备用户上下文和历史记录
      const messages = this.prepareMessagesForAI(query, sessionContext, systemMessage);
      
      // 调用AI服务
      const aiResponse = await sendToAIService({
        messages,
        temperature: 0.3,
        functions: this.getQualityFunctions(),
        stream: false
      });
      
      // 处理AI响应
      return {
        content: aiResponse.content,
        data: aiResponse.functionResults || {}
      };
    } catch (error) {
      logger.error('处理质量查询失败', { error: error.message });
      
      return {
        content: `抱歉，处理您的质量查询时出现了问题。${error.message}`,
        data: { error: error.message }
      };
    }
  }
  
  /**
   * 处理生产线查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processProductionQuery(query, sessionContext) {
    try {
      // 准备系统消息
      const systemMessage = `你是生产线助手，专注于处理生产线状态监控、设备维护和效率优化相关的问题。
当前时间：${new Date().toLocaleString('zh-CN')}
`;
      
      // 准备用户上下文和历史记录
      const messages = this.prepareMessagesForAI(query, sessionContext, systemMessage);
      
      // 调用AI服务
      const aiResponse = await sendToAIService({
        messages,
        temperature: 0.3,
        functions: this.getProductionFunctions(),
        stream: false
      });
      
      // 处理AI响应
      return {
        content: aiResponse.content,
        data: aiResponse.functionResults || {}
      };
    } catch (error) {
      logger.error('处理生产线查询失败', { error: error.message });
      
      return {
        content: `抱歉，处理您的生产线查询时出现了问题。${error.message}`,
        data: { error: error.message }
      };
    }
  }
  
  /**
   * 准备发送给AI的消息
   * @param {string} query 当前查询
   * @param {Object} sessionContext 会话上下文
   * @param {string} systemMessage 系统消息
   * @returns {Array} 消息数组
   */
  prepareMessagesForAI(query, sessionContext, systemMessage) {
    // 系统消息
    const messages = [{ role: 'system', content: systemMessage }];
    
    // 添加上下文信息
    if (Object.keys(sessionContext.context).length > 0) {
      messages.push({
        role: 'system',
        content: `上下文信息：\n${JSON.stringify(sessionContext.context, null, 2)}`
      });
    }
    
    // 添加历史记录 (最多5条)
    const relevantHistory = sessionContext.history.slice(-10);
    for (const msg of relevantHistory) {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    }
    
    return messages;
  }
  
  /**
   * 获取实验室相关功能
   * @returns {Array} 功能列表
   */
  getLabFunctions() {
    return [
      {
        name: 'getLabTestData',
        description: '获取实验室测试数据',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            startDate: { type: 'string', description: '开始日期 (YYYY-MM-DD)' },
            endDate: { type: 'string', description: '结束日期 (YYYY-MM-DD)' },
            limit: { type: 'number', description: '返回结果数量限制' }
          }
        }
      },
      {
        name: 'analyzeTestTrend',
        description: '分析测试数据趋势',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            parameterName: { type: 'string', description: '参数名称' },
            period: { type: 'string', description: '分析周期 (day, week, month)' }
          },
          required: ['materialCode', 'parameterName']
        }
      }
    ];
  }
  
  /**
   * 获取质量相关功能
   * @returns {Array} 功能列表
   */
  getQualityFunctions() {
    return [
      {
        name: 'getQualityInspectionData',
        description: '获取质量检验数据',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            supplierId: { type: 'string', description: '供应商ID' },
            startDate: { type: 'string', description: '开始日期 (YYYY-MM-DD)' },
            endDate: { type: 'string', description: '结束日期 (YYYY-MM-DD)' },
            limit: { type: 'number', description: '返回结果数量限制' }
          }
        }
      },
      {
        name: 'getDefectAnalysis',
        description: '获取不良品分析',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            defectType: { type: 'string', description: '不良类型' },
            period: { type: 'string', description: '分析周期 (day, week, month)' }
          }
        }
      }
    ];
  }
  
  /**
   * 获取生产线相关功能
   * @returns {Array} 功能列表
   */
  getProductionFunctions() {
    return [
      {
        name: 'getProductionStatus',
        description: '获取生产线状态',
        parameters: {
          type: 'object',
          properties: {
            lineId: { type: 'string', description: '生产线ID' },
            date: { type: 'string', description: '日期 (YYYY-MM-DD)' }
          }
        }
      },
      {
        name: 'getProductionEfficiency',
        description: '获取生产效率数据',
        parameters: {
          type: 'object',
          properties: {
            lineId: { type: 'string', description: '生产线ID' },
            startDate: { type: 'string', description: '开始日期 (YYYY-MM-DD)' },
            endDate: { type: 'string', description: '结束日期 (YYYY-MM-DD)' }
          }
        }
      }
    ];
  }
}

// 导出单例实例
export default new AssistantService(); 
 
 
 
 * 统一助手服务
 * 提供核心业务逻辑，处理助手查询
 */
import { logger } from '../utils/logger.js';
import { sendToAIService } from '../utils/aiClient.js';

/**
 * 助手服务类
 */
class AssistantService {
  constructor() {
    // 会话上下文存储
    this.contextStore = new Map();
    
    // 有效的助手模式
    this.validModes = ['auto', 'quality', 'lab', 'production'];
  }
  
  /**
   * 处理用户查询
   * @param {Object} params 查询参数
   * @param {string} params.query 用户查询文本
   * @param {string} params.mode 助手模式
   * @param {string} params.sessionId 会话ID
   * @param {Object} params.context 上下文信息
   * @param {string} params.requestId 请求ID
   * @returns {Promise<Object>} 处理结果
   */
  async handleQuery(params) {
    const { query, mode, sessionId, context, requestId } = params;
    
    logger.info(`处理查询 [${requestId}]`, {
      query: query.substring(0, 50) + (query.length > 50 ? '...' : ''),
      mode,
      sessionId,
      requestId
    });
    
    try {
      // 获取会话上下文
      const sessionContext = this.getSessionContext(sessionId);
      
      // 合并传入的上下文
      if (context) {
        Object.assign(sessionContext.context, context);
      }
      
      // 自动检测模式 (如果设置为auto)
      const detectedMode = mode === 'auto' ? this.detectMode(query) : mode;
      sessionContext.mode = detectedMode;
      
      // 添加查询到历史记录
      sessionContext.history.push({
        role: 'user',
        content: query,
        timestamp: new Date().toISOString()
      });
      
      // 根据模式处理查询
      const response = await this.processQueryByMode(query, sessionContext);
      
      // 添加响应到历史记录
      sessionContext.history.push({
        role: 'assistant',
        content: response.content,
        data: response.data,
        timestamp: new Date().toISOString()
      });
      
      // 更新会话上下文
      this.updateSessionContext(sessionId, sessionContext);
      
      // 返回处理结果
      return {
        answer: response.content,
        mode: detectedMode,
        context: sessionContext.context,
        structuredData: response.data
      };
    } catch (error) {
      logger.error(`处理查询失败 [${requestId}]`, {
        error: error.message,
        stack: error.stack,
        requestId
      });
      
      throw error;
    }
  }
  
  /**
   * 获取会话上下文
   * @param {string} sessionId 会话ID
   * @returns {Object} 会话上下文
   */
  getSessionContext(sessionId) {
    if (!this.contextStore.has(sessionId)) {
      // 创建新的会话上下文
      const newContext = {
        mode: 'auto',
        history: [],
        context: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.contextStore.set(sessionId, newContext);
      return newContext;
    }
    
    return this.contextStore.get(sessionId);
  }
  
  /**
   * 更新会话上下文
   * @param {string} sessionId 会话ID
   * @param {Object} context 上下文数据
   */
  updateSessionContext(sessionId, context) {
    // 更新最后修改时间
    context.updatedAt = new Date().toISOString();
    
    // 限制历史记录长度，防止内存溢出
    if (context.history.length > 20) {
      context.history = context.history.slice(-20);
    }
    
    this.contextStore.set(sessionId, context);
    
    // 自动清理超过24小时的会话
    this.cleanExpiredSessions();
  }
  
  /**
   * 清理过期的会话
   * 删除超过24小时未活动的会话
   */
  cleanExpiredSessions() {
    const now = new Date();
    const expireThreshold = 24 * 60 * 60 * 1000; // 24小时
    
    for (const [sessionId, context] of this.contextStore.entries()) {
      const lastUpdated = new Date(context.updatedAt);
      const timeDiff = now - lastUpdated;
      
      if (timeDiff > expireThreshold) {
        this.contextStore.delete(sessionId);
        logger.info(`清理过期会话: ${sessionId}`);
      }
    }
  }
  
  /**
   * 清除指定会话的上下文
   * @param {string} sessionId 会话ID
   * @returns {boolean} 是否成功清除
   */
  async clearSessionContext(sessionId) {
    if (this.contextStore.has(sessionId)) {
      this.contextStore.delete(sessionId);
      logger.info(`清除会话上下文: ${sessionId}`);
      return true;
    }
    
    return false;
  }
  
  /**
   * 根据查询内容自动检测助手模式
   * @param {string} query 查询文本
   * @returns {string} 检测到的模式
   */
  detectMode(query) {
    const query_lower = query.toLowerCase();
    
    // 实验室相关关键词
    if (query_lower.includes('实验') || 
        query_lower.includes('测试') || 
        query_lower.includes('检测') ||
        query_lower.includes('分析') ||
        query_lower.includes('参数')) {
      return 'lab';
    }
    
    // 生产线相关关键词
    if (query_lower.includes('生产') || 
        query_lower.includes('产线') || 
        query_lower.includes('产能') ||
        query_lower.includes('设备') ||
        query_lower.includes('效率')) {
      return 'production';
    }
    
    // 质量相关关键词
    if (query_lower.includes('质量') || 
        query_lower.includes('不良') || 
        query_lower.includes('物料') ||
        query_lower.includes('供应商') ||
        query_lower.includes('检验')) {
      return 'quality';
    }
    
    // 默认使用质量模式
    return 'quality';
  }
  
  /**
   * 根据模式处理查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processQueryByMode(query, sessionContext) {
    const mode = sessionContext.mode;
    
    // 根据模式处理查询
    switch (mode) {
      case 'lab':
        return this.processLabQuery(query, sessionContext);
        
      case 'quality':
        return this.processQualityQuery(query, sessionContext);
        
      case 'production':
        return this.processProductionQuery(query, sessionContext);
        
      default:
        // 默认使用质量模式
        return this.processQualityQuery(query, sessionContext);
    }
  }
  
  /**
   * 处理实验室查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processLabQuery(query, sessionContext) {
    try {
      // 准备系统消息
      const systemMessage = `你是实验室质量助手，专注于处理实验室测试、质量分析和参数相关的问题。
当前时间：${new Date().toLocaleString('zh-CN')}
`;
      
      // 准备用户上下文和历史记录
      const messages = this.prepareMessagesForAI(query, sessionContext, systemMessage);
      
      // 调用AI服务
      const aiResponse = await sendToAIService({
        messages,
        temperature: 0.3,
        functions: this.getLabFunctions(),
        stream: false
      });
      
      // 处理AI响应
      return {
        content: aiResponse.content,
        data: aiResponse.functionResults || {}
      };
    } catch (error) {
      logger.error('处理实验室查询失败', { error: error.message });
      
      return {
        content: `抱歉，处理您的实验室查询时出现了问题。${error.message}`,
        data: { error: error.message }
      };
    }
  }
  
  /**
   * 处理质量查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processQualityQuery(query, sessionContext) {
    try {
      // 准备系统消息
      const systemMessage = `你是质量检验助手，专注于处理物料质量检验、不良品分析和供应商相关的问题。
当前时间：${new Date().toLocaleString('zh-CN')}
`;
      
      // 准备用户上下文和历史记录
      const messages = this.prepareMessagesForAI(query, sessionContext, systemMessage);
      
      // 调用AI服务
      const aiResponse = await sendToAIService({
        messages,
        temperature: 0.3,
        functions: this.getQualityFunctions(),
        stream: false
      });
      
      // 处理AI响应
      return {
        content: aiResponse.content,
        data: aiResponse.functionResults || {}
      };
    } catch (error) {
      logger.error('处理质量查询失败', { error: error.message });
      
      return {
        content: `抱歉，处理您的质量查询时出现了问题。${error.message}`,
        data: { error: error.message }
      };
    }
  }
  
  /**
   * 处理生产线查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processProductionQuery(query, sessionContext) {
    try {
      // 准备系统消息
      const systemMessage = `你是生产线助手，专注于处理生产线状态监控、设备维护和效率优化相关的问题。
当前时间：${new Date().toLocaleString('zh-CN')}
`;
      
      // 准备用户上下文和历史记录
      const messages = this.prepareMessagesForAI(query, sessionContext, systemMessage);
      
      // 调用AI服务
      const aiResponse = await sendToAIService({
        messages,
        temperature: 0.3,
        functions: this.getProductionFunctions(),
        stream: false
      });
      
      // 处理AI响应
      return {
        content: aiResponse.content,
        data: aiResponse.functionResults || {}
      };
    } catch (error) {
      logger.error('处理生产线查询失败', { error: error.message });
      
      return {
        content: `抱歉，处理您的生产线查询时出现了问题。${error.message}`,
        data: { error: error.message }
      };
    }
  }
  
  /**
   * 准备发送给AI的消息
   * @param {string} query 当前查询
   * @param {Object} sessionContext 会话上下文
   * @param {string} systemMessage 系统消息
   * @returns {Array} 消息数组
   */
  prepareMessagesForAI(query, sessionContext, systemMessage) {
    // 系统消息
    const messages = [{ role: 'system', content: systemMessage }];
    
    // 添加上下文信息
    if (Object.keys(sessionContext.context).length > 0) {
      messages.push({
        role: 'system',
        content: `上下文信息：\n${JSON.stringify(sessionContext.context, null, 2)}`
      });
    }
    
    // 添加历史记录 (最多5条)
    const relevantHistory = sessionContext.history.slice(-10);
    for (const msg of relevantHistory) {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    }
    
    return messages;
  }
  
  /**
   * 获取实验室相关功能
   * @returns {Array} 功能列表
   */
  getLabFunctions() {
    return [
      {
        name: 'getLabTestData',
        description: '获取实验室测试数据',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            startDate: { type: 'string', description: '开始日期 (YYYY-MM-DD)' },
            endDate: { type: 'string', description: '结束日期 (YYYY-MM-DD)' },
            limit: { type: 'number', description: '返回结果数量限制' }
          }
        }
      },
      {
        name: 'analyzeTestTrend',
        description: '分析测试数据趋势',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            parameterName: { type: 'string', description: '参数名称' },
            period: { type: 'string', description: '分析周期 (day, week, month)' }
          },
          required: ['materialCode', 'parameterName']
        }
      }
    ];
  }
  
  /**
   * 获取质量相关功能
   * @returns {Array} 功能列表
   */
  getQualityFunctions() {
    return [
      {
        name: 'getQualityInspectionData',
        description: '获取质量检验数据',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            supplierId: { type: 'string', description: '供应商ID' },
            startDate: { type: 'string', description: '开始日期 (YYYY-MM-DD)' },
            endDate: { type: 'string', description: '结束日期 (YYYY-MM-DD)' },
            limit: { type: 'number', description: '返回结果数量限制' }
          }
        }
      },
      {
        name: 'getDefectAnalysis',
        description: '获取不良品分析',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            defectType: { type: 'string', description: '不良类型' },
            period: { type: 'string', description: '分析周期 (day, week, month)' }
          }
        }
      }
    ];
  }
  
  /**
   * 获取生产线相关功能
   * @returns {Array} 功能列表
   */
  getProductionFunctions() {
    return [
      {
        name: 'getProductionStatus',
        description: '获取生产线状态',
        parameters: {
          type: 'object',
          properties: {
            lineId: { type: 'string', description: '生产线ID' },
            date: { type: 'string', description: '日期 (YYYY-MM-DD)' }
          }
        }
      },
      {
        name: 'getProductionEfficiency',
        description: '获取生产效率数据',
        parameters: {
          type: 'object',
          properties: {
            lineId: { type: 'string', description: '生产线ID' },
            startDate: { type: 'string', description: '开始日期 (YYYY-MM-DD)' },
            endDate: { type: 'string', description: '结束日期 (YYYY-MM-DD)' }
          }
        }
      }
    ];
  }
}

// 导出单例实例
export default new AssistantService(); 
 * 统一助手服务
 * 提供核心业务逻辑，处理助手查询
 */
import { logger } from '../utils/logger.js';
import { sendToAIService } from '../utils/aiClient.js';

/**
 * 助手服务类
 */
class AssistantService {
  constructor() {
    // 会话上下文存储
    this.contextStore = new Map();
    
    // 有效的助手模式
    this.validModes = ['auto', 'quality', 'lab', 'production'];
  }
  
  /**
   * 处理用户查询
   * @param {Object} params 查询参数
   * @param {string} params.query 用户查询文本
   * @param {string} params.mode 助手模式
   * @param {string} params.sessionId 会话ID
   * @param {Object} params.context 上下文信息
   * @param {string} params.requestId 请求ID
   * @returns {Promise<Object>} 处理结果
   */
  async handleQuery(params) {
    const { query, mode, sessionId, context, requestId } = params;
    
    logger.info(`处理查询 [${requestId}]`, {
      query: query.substring(0, 50) + (query.length > 50 ? '...' : ''),
      mode,
      sessionId,
      requestId
    });
    
    try {
      // 获取会话上下文
      const sessionContext = this.getSessionContext(sessionId);
      
      // 合并传入的上下文
      if (context) {
        Object.assign(sessionContext.context, context);
      }
      
      // 自动检测模式 (如果设置为auto)
      const detectedMode = mode === 'auto' ? this.detectMode(query) : mode;
      sessionContext.mode = detectedMode;
      
      // 添加查询到历史记录
      sessionContext.history.push({
        role: 'user',
        content: query,
        timestamp: new Date().toISOString()
      });
      
      // 根据模式处理查询
      const response = await this.processQueryByMode(query, sessionContext);
      
      // 添加响应到历史记录
      sessionContext.history.push({
        role: 'assistant',
        content: response.content,
        data: response.data,
        timestamp: new Date().toISOString()
      });
      
      // 更新会话上下文
      this.updateSessionContext(sessionId, sessionContext);
      
      // 返回处理结果
      return {
        answer: response.content,
        mode: detectedMode,
        context: sessionContext.context,
        structuredData: response.data
      };
    } catch (error) {
      logger.error(`处理查询失败 [${requestId}]`, {
        error: error.message,
        stack: error.stack,
        requestId
      });
      
      throw error;
    }
  }
  
  /**
   * 获取会话上下文
   * @param {string} sessionId 会话ID
   * @returns {Object} 会话上下文
   */
  getSessionContext(sessionId) {
    if (!this.contextStore.has(sessionId)) {
      // 创建新的会话上下文
      const newContext = {
        mode: 'auto',
        history: [],
        context: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.contextStore.set(sessionId, newContext);
      return newContext;
    }
    
    return this.contextStore.get(sessionId);
  }
  
  /**
   * 更新会话上下文
   * @param {string} sessionId 会话ID
   * @param {Object} context 上下文数据
   */
  updateSessionContext(sessionId, context) {
    // 更新最后修改时间
    context.updatedAt = new Date().toISOString();
    
    // 限制历史记录长度，防止内存溢出
    if (context.history.length > 20) {
      context.history = context.history.slice(-20);
    }
    
    this.contextStore.set(sessionId, context);
    
    // 自动清理超过24小时的会话
    this.cleanExpiredSessions();
  }
  
  /**
   * 清理过期的会话
   * 删除超过24小时未活动的会话
   */
  cleanExpiredSessions() {
    const now = new Date();
    const expireThreshold = 24 * 60 * 60 * 1000; // 24小时
    
    for (const [sessionId, context] of this.contextStore.entries()) {
      const lastUpdated = new Date(context.updatedAt);
      const timeDiff = now - lastUpdated;
      
      if (timeDiff > expireThreshold) {
        this.contextStore.delete(sessionId);
        logger.info(`清理过期会话: ${sessionId}`);
      }
    }
  }
  
  /**
   * 清除指定会话的上下文
   * @param {string} sessionId 会话ID
   * @returns {boolean} 是否成功清除
   */
  async clearSessionContext(sessionId) {
    if (this.contextStore.has(sessionId)) {
      this.contextStore.delete(sessionId);
      logger.info(`清除会话上下文: ${sessionId}`);
      return true;
    }
    
    return false;
  }
  
  /**
   * 根据查询内容自动检测助手模式
   * @param {string} query 查询文本
   * @returns {string} 检测到的模式
   */
  detectMode(query) {
    const query_lower = query.toLowerCase();
    
    // 实验室相关关键词
    if (query_lower.includes('实验') || 
        query_lower.includes('测试') || 
        query_lower.includes('检测') ||
        query_lower.includes('分析') ||
        query_lower.includes('参数')) {
      return 'lab';
    }
    
    // 生产线相关关键词
    if (query_lower.includes('生产') || 
        query_lower.includes('产线') || 
        query_lower.includes('产能') ||
        query_lower.includes('设备') ||
        query_lower.includes('效率')) {
      return 'production';
    }
    
    // 质量相关关键词
    if (query_lower.includes('质量') || 
        query_lower.includes('不良') || 
        query_lower.includes('物料') ||
        query_lower.includes('供应商') ||
        query_lower.includes('检验')) {
      return 'quality';
    }
    
    // 默认使用质量模式
    return 'quality';
  }
  
  /**
   * 根据模式处理查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processQueryByMode(query, sessionContext) {
    const mode = sessionContext.mode;
    
    // 根据模式处理查询
    switch (mode) {
      case 'lab':
        return this.processLabQuery(query, sessionContext);
        
      case 'quality':
        return this.processQualityQuery(query, sessionContext);
        
      case 'production':
        return this.processProductionQuery(query, sessionContext);
        
      default:
        // 默认使用质量模式
        return this.processQualityQuery(query, sessionContext);
    }
  }
  
  /**
   * 处理实验室查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processLabQuery(query, sessionContext) {
    try {
      // 准备系统消息
      const systemMessage = `你是实验室质量助手，专注于处理实验室测试、质量分析和参数相关的问题。
当前时间：${new Date().toLocaleString('zh-CN')}
`;
      
      // 准备用户上下文和历史记录
      const messages = this.prepareMessagesForAI(query, sessionContext, systemMessage);
      
      // 调用AI服务
      const aiResponse = await sendToAIService({
        messages,
        temperature: 0.3,
        functions: this.getLabFunctions(),
        stream: false
      });
      
      // 处理AI响应
      return {
        content: aiResponse.content,
        data: aiResponse.functionResults || {}
      };
    } catch (error) {
      logger.error('处理实验室查询失败', { error: error.message });
      
      return {
        content: `抱歉，处理您的实验室查询时出现了问题。${error.message}`,
        data: { error: error.message }
      };
    }
  }
  
  /**
   * 处理质量查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processQualityQuery(query, sessionContext) {
    try {
      // 准备系统消息
      const systemMessage = `你是质量检验助手，专注于处理物料质量检验、不良品分析和供应商相关的问题。
当前时间：${new Date().toLocaleString('zh-CN')}
`;
      
      // 准备用户上下文和历史记录
      const messages = this.prepareMessagesForAI(query, sessionContext, systemMessage);
      
      // 调用AI服务
      const aiResponse = await sendToAIService({
        messages,
        temperature: 0.3,
        functions: this.getQualityFunctions(),
        stream: false
      });
      
      // 处理AI响应
      return {
        content: aiResponse.content,
        data: aiResponse.functionResults || {}
      };
    } catch (error) {
      logger.error('处理质量查询失败', { error: error.message });
      
      return {
        content: `抱歉，处理您的质量查询时出现了问题。${error.message}`,
        data: { error: error.message }
      };
    }
  }
  
  /**
   * 处理生产线查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processProductionQuery(query, sessionContext) {
    try {
      // 准备系统消息
      const systemMessage = `你是生产线助手，专注于处理生产线状态监控、设备维护和效率优化相关的问题。
当前时间：${new Date().toLocaleString('zh-CN')}
`;
      
      // 准备用户上下文和历史记录
      const messages = this.prepareMessagesForAI(query, sessionContext, systemMessage);
      
      // 调用AI服务
      const aiResponse = await sendToAIService({
        messages,
        temperature: 0.3,
        functions: this.getProductionFunctions(),
        stream: false
      });
      
      // 处理AI响应
      return {
        content: aiResponse.content,
        data: aiResponse.functionResults || {}
      };
    } catch (error) {
      logger.error('处理生产线查询失败', { error: error.message });
      
      return {
        content: `抱歉，处理您的生产线查询时出现了问题。${error.message}`,
        data: { error: error.message }
      };
    }
  }
  
  /**
   * 准备发送给AI的消息
   * @param {string} query 当前查询
   * @param {Object} sessionContext 会话上下文
   * @param {string} systemMessage 系统消息
   * @returns {Array} 消息数组
   */
  prepareMessagesForAI(query, sessionContext, systemMessage) {
    // 系统消息
    const messages = [{ role: 'system', content: systemMessage }];
    
    // 添加上下文信息
    if (Object.keys(sessionContext.context).length > 0) {
      messages.push({
        role: 'system',
        content: `上下文信息：\n${JSON.stringify(sessionContext.context, null, 2)}`
      });
    }
    
    // 添加历史记录 (最多5条)
    const relevantHistory = sessionContext.history.slice(-10);
    for (const msg of relevantHistory) {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    }
    
    return messages;
  }
  
  /**
   * 获取实验室相关功能
   * @returns {Array} 功能列表
   */
  getLabFunctions() {
    return [
      {
        name: 'getLabTestData',
        description: '获取实验室测试数据',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            startDate: { type: 'string', description: '开始日期 (YYYY-MM-DD)' },
            endDate: { type: 'string', description: '结束日期 (YYYY-MM-DD)' },
            limit: { type: 'number', description: '返回结果数量限制' }
          }
        }
      },
      {
        name: 'analyzeTestTrend',
        description: '分析测试数据趋势',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            parameterName: { type: 'string', description: '参数名称' },
            period: { type: 'string', description: '分析周期 (day, week, month)' }
          },
          required: ['materialCode', 'parameterName']
        }
      }
    ];
  }
  
  /**
   * 获取质量相关功能
   * @returns {Array} 功能列表
   */
  getQualityFunctions() {
    return [
      {
        name: 'getQualityInspectionData',
        description: '获取质量检验数据',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            supplierId: { type: 'string', description: '供应商ID' },
            startDate: { type: 'string', description: '开始日期 (YYYY-MM-DD)' },
            endDate: { type: 'string', description: '结束日期 (YYYY-MM-DD)' },
            limit: { type: 'number', description: '返回结果数量限制' }
          }
        }
      },
      {
        name: 'getDefectAnalysis',
        description: '获取不良品分析',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            defectType: { type: 'string', description: '不良类型' },
            period: { type: 'string', description: '分析周期 (day, week, month)' }
          }
        }
      }
    ];
  }
  
  /**
   * 获取生产线相关功能
   * @returns {Array} 功能列表
   */
  getProductionFunctions() {
    return [
      {
        name: 'getProductionStatus',
        description: '获取生产线状态',
        parameters: {
          type: 'object',
          properties: {
            lineId: { type: 'string', description: '生产线ID' },
            date: { type: 'string', description: '日期 (YYYY-MM-DD)' }
          }
        }
      },
      {
        name: 'getProductionEfficiency',
        description: '获取生产效率数据',
        parameters: {
          type: 'object',
          properties: {
            lineId: { type: 'string', description: '生产线ID' },
            startDate: { type: 'string', description: '开始日期 (YYYY-MM-DD)' },
            endDate: { type: 'string', description: '结束日期 (YYYY-MM-DD)' }
          }
        }
      }
    ];
  }
}

// 导出单例实例
export default new AssistantService(); 
 * 统一助手服务
 * 提供核心业务逻辑，处理助手查询
 */
import { logger } from '../utils/logger.js';
import { sendToAIService } from '../utils/aiClient.js';

/**
 * 助手服务类
 */
class AssistantService {
  constructor() {
    // 会话上下文存储
    this.contextStore = new Map();
    
    // 有效的助手模式
    this.validModes = ['auto', 'quality', 'lab', 'production'];
  }
  
  /**
   * 处理用户查询
   * @param {Object} params 查询参数
   * @param {string} params.query 用户查询文本
   * @param {string} params.mode 助手模式
   * @param {string} params.sessionId 会话ID
   * @param {Object} params.context 上下文信息
   * @param {string} params.requestId 请求ID
   * @returns {Promise<Object>} 处理结果
   */
  async handleQuery(params) {
    const { query, mode, sessionId, context, requestId } = params;
    
    logger.info(`处理查询 [${requestId}]`, {
      query: query.substring(0, 50) + (query.length > 50 ? '...' : ''),
      mode,
      sessionId,
      requestId
    });
    
    try {
      // 获取会话上下文
      const sessionContext = this.getSessionContext(sessionId);
      
      // 合并传入的上下文
      if (context) {
        Object.assign(sessionContext.context, context);
      }
      
      // 自动检测模式 (如果设置为auto)
      const detectedMode = mode === 'auto' ? this.detectMode(query) : mode;
      sessionContext.mode = detectedMode;
      
      // 添加查询到历史记录
      sessionContext.history.push({
        role: 'user',
        content: query,
        timestamp: new Date().toISOString()
      });
      
      // 根据模式处理查询
      const response = await this.processQueryByMode(query, sessionContext);
      
      // 添加响应到历史记录
      sessionContext.history.push({
        role: 'assistant',
        content: response.content,
        data: response.data,
        timestamp: new Date().toISOString()
      });
      
      // 更新会话上下文
      this.updateSessionContext(sessionId, sessionContext);
      
      // 返回处理结果
      return {
        answer: response.content,
        mode: detectedMode,
        context: sessionContext.context,
        structuredData: response.data
      };
    } catch (error) {
      logger.error(`处理查询失败 [${requestId}]`, {
        error: error.message,
        stack: error.stack,
        requestId
      });
      
      throw error;
    }
  }
  
  /**
   * 获取会话上下文
   * @param {string} sessionId 会话ID
   * @returns {Object} 会话上下文
   */
  getSessionContext(sessionId) {
    if (!this.contextStore.has(sessionId)) {
      // 创建新的会话上下文
      const newContext = {
        mode: 'auto',
        history: [],
        context: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.contextStore.set(sessionId, newContext);
      return newContext;
    }
    
    return this.contextStore.get(sessionId);
  }
  
  /**
   * 更新会话上下文
   * @param {string} sessionId 会话ID
   * @param {Object} context 上下文数据
   */
  updateSessionContext(sessionId, context) {
    // 更新最后修改时间
    context.updatedAt = new Date().toISOString();
    
    // 限制历史记录长度，防止内存溢出
    if (context.history.length > 20) {
      context.history = context.history.slice(-20);
    }
    
    this.contextStore.set(sessionId, context);
    
    // 自动清理超过24小时的会话
    this.cleanExpiredSessions();
  }
  
  /**
   * 清理过期的会话
   * 删除超过24小时未活动的会话
   */
  cleanExpiredSessions() {
    const now = new Date();
    const expireThreshold = 24 * 60 * 60 * 1000; // 24小时
    
    for (const [sessionId, context] of this.contextStore.entries()) {
      const lastUpdated = new Date(context.updatedAt);
      const timeDiff = now - lastUpdated;
      
      if (timeDiff > expireThreshold) {
        this.contextStore.delete(sessionId);
        logger.info(`清理过期会话: ${sessionId}`);
      }
    }
  }
  
  /**
   * 清除指定会话的上下文
   * @param {string} sessionId 会话ID
   * @returns {boolean} 是否成功清除
   */
  async clearSessionContext(sessionId) {
    if (this.contextStore.has(sessionId)) {
      this.contextStore.delete(sessionId);
      logger.info(`清除会话上下文: ${sessionId}`);
      return true;
    }
    
    return false;
  }
  
  /**
   * 根据查询内容自动检测助手模式
   * @param {string} query 查询文本
   * @returns {string} 检测到的模式
   */
  detectMode(query) {
    const query_lower = query.toLowerCase();
    
    // 实验室相关关键词
    if (query_lower.includes('实验') || 
        query_lower.includes('测试') || 
        query_lower.includes('检测') ||
        query_lower.includes('分析') ||
        query_lower.includes('参数')) {
      return 'lab';
    }
    
    // 生产线相关关键词
    if (query_lower.includes('生产') || 
        query_lower.includes('产线') || 
        query_lower.includes('产能') ||
        query_lower.includes('设备') ||
        query_lower.includes('效率')) {
      return 'production';
    }
    
    // 质量相关关键词
    if (query_lower.includes('质量') || 
        query_lower.includes('不良') || 
        query_lower.includes('物料') ||
        query_lower.includes('供应商') ||
        query_lower.includes('检验')) {
      return 'quality';
    }
    
    // 默认使用质量模式
    return 'quality';
  }
  
  /**
   * 根据模式处理查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processQueryByMode(query, sessionContext) {
    const mode = sessionContext.mode;
    
    // 根据模式处理查询
    switch (mode) {
      case 'lab':
        return this.processLabQuery(query, sessionContext);
        
      case 'quality':
        return this.processQualityQuery(query, sessionContext);
        
      case 'production':
        return this.processProductionQuery(query, sessionContext);
        
      default:
        // 默认使用质量模式
        return this.processQualityQuery(query, sessionContext);
    }
  }
  
  /**
   * 处理实验室查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processLabQuery(query, sessionContext) {
    try {
      // 准备系统消息
      const systemMessage = `你是实验室质量助手，专注于处理实验室测试、质量分析和参数相关的问题。
当前时间：${new Date().toLocaleString('zh-CN')}
`;
      
      // 准备用户上下文和历史记录
      const messages = this.prepareMessagesForAI(query, sessionContext, systemMessage);
      
      // 调用AI服务
      const aiResponse = await sendToAIService({
        messages,
        temperature: 0.3,
        functions: this.getLabFunctions(),
        stream: false
      });
      
      // 处理AI响应
      return {
        content: aiResponse.content,
        data: aiResponse.functionResults || {}
      };
    } catch (error) {
      logger.error('处理实验室查询失败', { error: error.message });
      
      return {
        content: `抱歉，处理您的实验室查询时出现了问题。${error.message}`,
        data: { error: error.message }
      };
    }
  }
  
  /**
   * 处理质量查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processQualityQuery(query, sessionContext) {
    try {
      // 准备系统消息
      const systemMessage = `你是质量检验助手，专注于处理物料质量检验、不良品分析和供应商相关的问题。
当前时间：${new Date().toLocaleString('zh-CN')}
`;
      
      // 准备用户上下文和历史记录
      const messages = this.prepareMessagesForAI(query, sessionContext, systemMessage);
      
      // 调用AI服务
      const aiResponse = await sendToAIService({
        messages,
        temperature: 0.3,
        functions: this.getQualityFunctions(),
        stream: false
      });
      
      // 处理AI响应
      return {
        content: aiResponse.content,
        data: aiResponse.functionResults || {}
      };
    } catch (error) {
      logger.error('处理质量查询失败', { error: error.message });
      
      return {
        content: `抱歉，处理您的质量查询时出现了问题。${error.message}`,
        data: { error: error.message }
      };
    }
  }
  
  /**
   * 处理生产线查询
   * @param {string} query 查询文本
   * @param {Object} sessionContext 会话上下文
   * @returns {Promise<Object>} 处理结果
   */
  async processProductionQuery(query, sessionContext) {
    try {
      // 准备系统消息
      const systemMessage = `你是生产线助手，专注于处理生产线状态监控、设备维护和效率优化相关的问题。
当前时间：${new Date().toLocaleString('zh-CN')}
`;
      
      // 准备用户上下文和历史记录
      const messages = this.prepareMessagesForAI(query, sessionContext, systemMessage);
      
      // 调用AI服务
      const aiResponse = await sendToAIService({
        messages,
        temperature: 0.3,
        functions: this.getProductionFunctions(),
        stream: false
      });
      
      // 处理AI响应
      return {
        content: aiResponse.content,
        data: aiResponse.functionResults || {}
      };
    } catch (error) {
      logger.error('处理生产线查询失败', { error: error.message });
      
      return {
        content: `抱歉，处理您的生产线查询时出现了问题。${error.message}`,
        data: { error: error.message }
      };
    }
  }
  
  /**
   * 准备发送给AI的消息
   * @param {string} query 当前查询
   * @param {Object} sessionContext 会话上下文
   * @param {string} systemMessage 系统消息
   * @returns {Array} 消息数组
   */
  prepareMessagesForAI(query, sessionContext, systemMessage) {
    // 系统消息
    const messages = [{ role: 'system', content: systemMessage }];
    
    // 添加上下文信息
    if (Object.keys(sessionContext.context).length > 0) {
      messages.push({
        role: 'system',
        content: `上下文信息：\n${JSON.stringify(sessionContext.context, null, 2)}`
      });
    }
    
    // 添加历史记录 (最多5条)
    const relevantHistory = sessionContext.history.slice(-10);
    for (const msg of relevantHistory) {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    }
    
    return messages;
  }
  
  /**
   * 获取实验室相关功能
   * @returns {Array} 功能列表
   */
  getLabFunctions() {
    return [
      {
        name: 'getLabTestData',
        description: '获取实验室测试数据',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            startDate: { type: 'string', description: '开始日期 (YYYY-MM-DD)' },
            endDate: { type: 'string', description: '结束日期 (YYYY-MM-DD)' },
            limit: { type: 'number', description: '返回结果数量限制' }
          }
        }
      },
      {
        name: 'analyzeTestTrend',
        description: '分析测试数据趋势',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            parameterName: { type: 'string', description: '参数名称' },
            period: { type: 'string', description: '分析周期 (day, week, month)' }
          },
          required: ['materialCode', 'parameterName']
        }
      }
    ];
  }
  
  /**
   * 获取质量相关功能
   * @returns {Array} 功能列表
   */
  getQualityFunctions() {
    return [
      {
        name: 'getQualityInspectionData',
        description: '获取质量检验数据',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            supplierId: { type: 'string', description: '供应商ID' },
            startDate: { type: 'string', description: '开始日期 (YYYY-MM-DD)' },
            endDate: { type: 'string', description: '结束日期 (YYYY-MM-DD)' },
            limit: { type: 'number', description: '返回结果数量限制' }
          }
        }
      },
      {
        name: 'getDefectAnalysis',
        description: '获取不良品分析',
        parameters: {
          type: 'object',
          properties: {
            materialCode: { type: 'string', description: '物料代码' },
            defectType: { type: 'string', description: '不良类型' },
            period: { type: 'string', description: '分析周期 (day, week, month)' }
          }
        }
      }
    ];
  }
  
  /**
   * 获取生产线相关功能
   * @returns {Array} 功能列表
   */
  getProductionFunctions() {
    return [
      {
        name: 'getProductionStatus',
        description: '获取生产线状态',
        parameters: {
          type: 'object',
          properties: {
            lineId: { type: 'string', description: '生产线ID' },
            date: { type: 'string', description: '日期 (YYYY-MM-DD)' }
          }
        }
      },
      {
        name: 'getProductionEfficiency',
        description: '获取生产效率数据',
        parameters: {
          type: 'object',
          properties: {
            lineId: { type: 'string', description: '生产线ID' },
            startDate: { type: 'string', description: '开始日期 (YYYY-MM-DD)' },
            endDate: { type: 'string', description: '结束日期 (YYYY-MM-DD)' }
          }
        }
      }
    ];
  }
}

// 导出单例实例
export default new AssistantService(); 
 
 
 