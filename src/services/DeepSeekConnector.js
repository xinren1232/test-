/**
 * DeepSeek AI连接器服务
 * 提供与DeepSeek AI API的通信功能
 */

import aiConfig from '../config/aiConfig';

class DeepSeekConnector {
  constructor() {
    this.config = aiConfig;
    this.fallbackService = null;
    this.isInitialized = false;
    this.isAvailable = false;
  }

  /**
   * 初始化连接器
   * @param {Object} fallbackService - 后备服务，当DeepSeek不可用时使用
   */
  async initialize(fallbackService = null) {
    if (this.isInitialized) return;
    
    this.fallbackService = fallbackService;
    
    try {
      this.isAvailable = await this.checkAvailability();
      console.log(`DeepSeek AI连接器初始化完成，服务状态: ${this.isAvailable ? '可用' : '不可用'}`);
    } catch (error) {
      console.warn('DeepSeek AI连接器初始化异常:', error);
      this.isAvailable = false;
    }
    
    this.isInitialized = true;
    
    // 定期检查服务可用性
    setInterval(() => this.checkAvailability(), 60000); // 每分钟检查一次
    
    return this.isAvailable;
  }

  /**
   * 检查DeepSeek AI服务可用性
   * @returns {Promise<boolean>}
   */
  async checkAvailability() {
    try {
      // 超时设置更短，避免长时间等待
      const response = await fetch(this.config.endpoints.status, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.auth.apiKey}`
        },
        signal: AbortSignal.timeout(5000) // 5秒超时
      });
      
      if (response.ok) {
        const data = await response.json();
        this.isAvailable = true; // 如果API返回成功，就认为服务可用
        if (this.config.request.debug) {
          console.log('DeepSeek服务状态检查成功:', data);
        }
      } else {
        this.isAvailable = false;
        console.warn('DeepSeek服务状态响应错误:', response.status);
      }
    } catch (error) {
      console.warn('DeepSeek AI服务状态检查失败:', error);
      this.isAvailable = false;
    }
    
    return this.isAvailable;
  }

  /**
   * 发送聊天请求到DeepSeek
   * @param {string} message - 用户消息
   * @param {Object} context - 上下文数据
   * @param {Array} history - 历史消息
   * @returns {Promise<Object>} 响应对象
   */
  async sendChatRequest(message, context = {}, history = []) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    // 如果DeepSeek不可用且有后备服务，则使用后备服务
    if (!this.isAvailable && this.fallbackService) {
      console.log('DeepSeek不可用，使用后备服务');
      return this.fallbackService.sendChatRequest(message, context, history);
    }
    
    try {
      // 转换历史消息为DeepSeek API格式
      const messages = [];
      
      // 添加历史消息
      if (history && history.length > 0) {
        history.forEach(msg => {
          messages.push({
            role: msg.role || 'user',
            content: msg.content || msg
          });
        });
      }
      
      // 添加新的用户消息
      messages.push({
        role: 'user',
        content: message
      });
      
      // 构建完整的API请求
      const payload = {
        model: this.config.models.chat,
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        stream: false
      };
      
      if (this.config.request.debug) {
        console.log('发送请求到DeepSeek:', JSON.stringify(payload));
      }
      
      const response = await fetch(this.config.endpoints.chat, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.auth.apiKey}`
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.config.request.timeout)
      });
      
      if (!response.ok) {
        throw new Error(`DeepSeek API响应错误: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (this.config.request.debug) {
        console.log('DeepSeek响应:', data);
      }
      
      return {
        text: data.choices?.[0]?.message?.content || '未能获取有效响应',
        raw: data,
        success: true,
        source: 'deepseek'
      };
    } catch (error) {
      console.error('DeepSeek请求失败:', error);
      
      // 如果请求失败且有后备服务，则使用后备服务
      if (this.fallbackService) {
        console.log('切换到后备服务');
        return this.fallbackService.sendChatRequest(message, context, history);
      }
      
      // 否则返回错误
      return {
        text: this.config.fallbackResponses.error,
        success: false,
        error: error.message,
        source: 'error'
      };
    }
  }

  /**
   * 发送图片分析请求到DeepSeek
   * @param {File|Blob|string} imageData - 图片数据
   * @param {Object} context - 上下文数据
   * @param {string} prompt - 分析提示
   * @returns {Promise<Object>} 分析结果
   */
  async sendImageAnalysisRequest(imageData, context = {}, prompt = '') {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    // 如果DeepSeek不可用且有后备服务，则使用后备服务
    if (!this.isAvailable && this.fallbackService) {
      console.log('DeepSeek不可用，使用后备服务分析图片');
      return this.fallbackService.sendImageAnalysisRequest(imageData, context, prompt);
    }
    
    try {
      // 处理图片数据，转换为Base64
      let base64Image = '';
      
      if (imageData instanceof File || imageData instanceof Blob) {
        // 将文件/Blob转换为Base64
        base64Image = await this.convertToBase64(imageData);
      } else if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
        // 已经是Base64格式
        base64Image = imageData;
      } else {
        throw new Error('不支持的图片格式');
      }
      
      // 准备请求数据
      const payload = {
        model: this.config.models.chat,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt || '分析这张图片中的内容，给出详细描述' },
              { type: 'image_url', image_url: { url: base64Image } }
            ]
          }
        ],
        max_tokens: 1000
      };
      
      if (this.config.request.debug) {
        console.log('发送图片分析请求到DeepSeek');
      }
      
      const response = await fetch(this.config.endpoints.chat, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.auth.apiKey}`
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.config.request.timeout)
      });
      
      if (!response.ok) {
        throw new Error(`DeepSeek图片分析服务响应错误: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (this.config.request.debug) {
        console.log('DeepSeek图片分析响应:', data);
      }
      
      return {
        text: data.choices?.[0]?.message?.content || '未能获取有效的图片分析结果',
        raw: data,
        success: true,
        source: 'deepseek'
      };
    } catch (error) {
      console.error('DeepSeek图片分析失败:', error);
      
      // 如果请求失败且有后备服务，则使用后备服务
      if (this.fallbackService) {
        console.log('切换到后备服务分析图片');
        return this.fallbackService.sendImageAnalysisRequest(imageData, context, prompt);
      }
      
      // 否则返回错误
      return {
        text: this.config.fallbackResponses.imageReceived,
        success: false,
        error: error.message,
        source: 'error'
      };
    }
  }
  
  /**
   * 将文件或Blob转换为Base64
   * @param {File|Blob} file - 文件或Blob对象
   * @returns {Promise<string>} Base64字符串
   */
  async convertToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

// 创建单例实例
const deepseekConnector = new DeepSeekConnector();
export default deepseekConnector; 