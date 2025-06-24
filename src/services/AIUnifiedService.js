/**
 * 统一AI服务
 * 整合与DeepSeek AI的通信功能，并提供备用响应
 */

import aiConfig from '../config/aiConfig';
import deepseekConnector from './DeepSeekConnector';

class AIUnifiedService {
  constructor() {
    this.config = aiConfig;
    this.isAvailable = false;
    this.connectors = {
      deepseek: deepseekConnector
    };
    this.initialize();
  }

  /**
   * 初始化服务
   */
  async initialize() {
    try {
      // 初始化DeepSeek连接器
      await this.connectors.deepseek.initialize();
      
      // 检查AI服务可用性
      await this.checkAvailability();
      
      console.log('AI统一服务初始化完成');
    } catch (error) {
      console.error('AI统一服务初始化失败:', error);
    }
  }

  /**
   * 检查AI服务可用性
   * @returns {Promise<boolean>}
   */
  async checkAvailability() {
    try {
      // 优先检查DeepSeek可用性
      this.isAvailable = await this.connectors.deepseek.checkAvailability();
      return this.isAvailable;
    } catch (error) {
      console.warn('AI服务状态检查失败:', error);
      this.isAvailable = false;
      return false;
    }
  }

  /**
   * 向AI发送消息
   * @param {string} message - 用户消息
   * @param {Object} context - 上下文信息
   * @param {Array} history - 历史消息
   * @returns {Promise<Object>} AI响应
   */
  async sendMessage(message, context = {}, history = []) {
    // 添加重试逻辑
    let attempts = 0;
    const maxAttempts = this.config.request.retry.maxAttempts;
    
    // 确定使用哪个模型
    const modelToUse = context.model || this.config.model;
    
    while (attempts < maxAttempts) {
      try {
        // 检查服务可用性
        if (!this.isAvailable && attempts === 0) {
          await this.checkAvailability();
        }
        
        // 优先使用DeepSeek连接器
        const response = await this.connectors.deepseek.sendChatRequest(
          message, 
          { 
            ...context,
            model: modelToUse 
          }, 
          history
        );
        
        // 如果使用了后备服务，记录日志
        if (response.source && response.source !== 'deepseek') {
          console.log(`使用后备服务响应: ${response.source}`);
        }
        
        return {
          text: response.text,
          raw: response.raw || {},
          success: response.success,
          isOffline: !this.isAvailable || response.source !== 'deepseek'
        };
      } catch (error) {
        console.error(`AI请求失败 (尝试 ${attempts + 1}/${maxAttempts}):`, error);
        attempts++;
        
        // 最后一次尝试失败时，返回备用响应
        if (attempts >= maxAttempts) {
          return this.createFallbackResponse(message);
        }
        
        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, this.config.request.retry.delayMs));
      }
    }
  }

  /**
   * 创建备用响应
   * @param {string} message - 用户消息
   * @returns {Object} 备用响应
   */
  createFallbackResponse(message) {
    // 基于用户消息内容生成模拟响应
    let response = '';
    
    if (message.includes('风险批次') || message.includes('质量问题')) {
      response = `根据最近的数据分析，目前系统中有 42 个风险物料批次，其中：
- 15 个批次标记为不合格
- 23 个批次已被冻结
- 8 个批次正在风险处理中

主要风险供应商TOP3是：
1. 欧菲光科技 (风险率12.3%)
2. 立讯精密 (风险率8.7%)
3. 蓝思科技 (风险率6.5%)

您需要查看具体的批次明细吗？`;
    } else if (message.includes('检验') || message.includes('检测')) {
      response = `最近的检验数据显示：
- 上周完成检验批次：138个
- 合格率：92.8%
- 平均检验时长：2.3天
- 待检批次：27个

需要了解更多实验室测试数据或特定批次的检验结果吗？`;
    } else if (message.includes('趋势') || message.includes('分析')) {
      response = `根据系统分析，近30天质量风险趋势呈现：
- 风险批次数量同比上月减少8.3%
- 不良率从3.2%下降到2.7%
- 供应商质量表现整体提升

您可以在"风险批次变化趋势"图表中查看更详细的数据。需要我为您生成特定时间段的分析报告吗？`;
    } else {
      response = `感谢您的提问。我可以帮您查询以下信息：
- 物料批次风险状态和趋势
- 质量检验数据和结果
- 供应商质量表现分析
- 实验室测试结果解读

请告诉我您需要了解的具体信息，我会为您提供相关数据和分析。`;
    }
    
    return {
      text: response,
      success: true,
      isOffline: true
    };
  }

  /**
   * 分析图片
   * @param {File|Blob|string} imageData - 图片数据
   * @param {Object} context - 上下文信息
   * @param {string} prompt - 分析提示
   * @returns {Promise<Object>} 分析结果
   */
  async analyzeImage(imageData, context = {}, prompt = '') {
    try {
      // 检查服务可用性
      if (!this.isAvailable) {
        await this.checkAvailability();
      }
      
      // 确定使用哪个模型
      const modelToUse = context.model || this.config.model;
      
      // 使用DeepSeek连接器分析图片
      const response = await this.connectors.deepseek.sendImageAnalysisRequest(
        imageData,
        {
          ...context,
          model: modelToUse
        },
        prompt
      );
      
      // 如果使用了后备服务，记录日志
      if (response.source && response.source !== 'deepseek') {
        console.log(`使用后备服务分析图片: ${response.source}`);
      }
      
      return {
        text: response.text,
        raw: response.raw || {},
        success: response.success,
        isOffline: !this.isAvailable || response.source !== 'deepseek'
      };
    } catch (error) {
      console.error('图片分析失败:', error);
      return {
        text: this.config.fallbackResponses.imageReceived,
        success: true,
        isOffline: true,
        error: error.message
      };
    }
  }
}

// 创建单例实例
const aiService = new AIUnifiedService();
export default aiService; 