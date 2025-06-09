/**
 * AI插件
 * 用于在Vue应用中全局注册AI相关功能
 */
import aiService from '../services/ai/aiService.js';
import { AICommandProcessor } from '../services/ai/AICommandProcessor.js';
import { AIModelConfigService } from '../services/ai/AIModelConfigService.js';
import { getEnvironmentConfig } from '../config/ai.config.js';

/**
 * AI插件
 */
const AIPlugin = {
  /**
   * 安装插件
   * @param {Object} app Vue应用实例
   * @param {Object} options 插件选项
   */
  install(app, options = {}) {
    console.log('[AIPlugin] 初始化AI插件');
    
    // 获取环境配置
    const config = getEnvironmentConfig();
    
    // 验证AIService实例
    if (!aiService) {
      console.error('[AIPlugin] AIService实例不存在!');
    } else {
      console.log('[AIPlugin] AIService实例正常');
      
      // 将AIService实例提供给全局
      app.config.globalProperties.$aiService = aiService;
      app.provide('aiService', aiService);
      
      // 打印当前模型信息
      const currentModel = aiService.getCurrentModel();
      console.log('[AIPlugin] 当前模型:', currentModel);
    }
    
    // 全局注册AI命令处理器
    app.config.globalProperties.$aiCommandProcessor = AICommandProcessor;
    
    // 全局注册AI模型配置服务
    app.config.globalProperties.$aiModelConfig = AIModelConfigService;
    
    // 提供全局AI方法
    app.config.globalProperties.$ai = {
      /**
       * 执行AI查询
       * @param {string|Object} query 查询文本或查询对象
       * @param {Object} options 选项
       * @returns {Promise<Object>} 查询结果
       */
      async query(query, options = {}) {
        try {
          return await aiService.executeQuery(query, options);
        } catch (error) {
          console.error('AI查询失败:', error);
          return {
            error: true,
            content: '抱歉，AI处理请求时遇到问题，请稍后重试。'
          };
        }
      },
      
      /**
       * 处理AI命令
       * @param {string} command 命令文本
       * @returns {Promise<Object>} 处理结果
       */
      async processCommand(command) {
        try {
          return await AICommandProcessor.processCommand(command);
        } catch (error) {
          console.error('AI命令处理失败:', error);
          return {
            success: false,
            error: '处理命令时发生错误: ' + (error.message || '未知错误')
          };
        }
      },
      
      /**
       * 获取当前活跃的AI模型
       * @returns {Object} 模型信息
       */
      getActiveModel() {
        return AIModelConfigService.getActiveModel();
      },
      
      /**
       * 设置活跃的AI模型
       * @param {string} modelId 模型ID
       * @returns {boolean} 是否成功
       */
      setActiveModel(modelId) {
        return AIModelConfigService.setActiveModel(modelId);
      }
    };
    
    // 提供全局指令
    app.directive('ai-highlight', {
      mounted(el, binding) {
        // 实现AI高亮指令
        const text = el.textContent;
        const keywords = binding.value || [];
        
        if (keywords.length > 0) {
          let highlightedText = text;
          keywords.forEach(keyword => {
            const regex = new RegExp(`(${keyword})`, 'gi');
            highlightedText = highlightedText.replace(regex, '<span class="ai-highlight">$1</span>');
          });
          
          el.innerHTML = highlightedText;
        }
      }
    });
    
    // 注入全局CSS
    const style = document.createElement('style');
    style.textContent = `
      .ai-highlight {
        background-color: rgba(64, 158, 255, 0.2);
        border-bottom: 1px dashed #409EFF;
        padding: 0 2px;
      }
    `;
    document.head.appendChild(style);
    
    console.log('AI插件已安装');
  }
};

export default AIPlugin;