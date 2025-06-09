/**
 * AI服务基类 - 提供所有AI服务的基础功能
 */

import { AIQueryService } from '../AIQueryService';
import aiService from './AIService';
import { ElMessage } from 'element-plus';

export class AIBaseService {
  // 记录模型故障计数
  static modelFailureCount = {};
  static MAX_RETRIES = 2;
  static FAILURE_RESET_INTERVAL = 30 * 60 * 1000; // 30分钟

  /**
   * 执行AI查询，增强版本，包含错误处理和模型回退机制
   * @param {string|Object} queryText 查询文本或查询对象
   * @param {Object} options 选项
   * @returns {Promise<Object>} 查询结果
   */
  static async executeQuery(queryText, options = {}) {
    const { 
      allowRetry = true, 
      showError = true, 
      context = {},
      retryCount = 0,
      systemPrompt
    } = options;
    
    try {
      // 使用AIService进行查询
      return await AIService.executeQuery(queryText, {
        context,
        systemPrompt
      });
    } catch (error) {
      console.error(`[AIBaseService] 查询失败: ${error.message}`);
      
      // 记录当前模型故障
      const currentModel = AIService.getActiveModel();
      if (!this.modelFailureCount[currentModel.id]) {
        this.modelFailureCount[currentModel.id] = 0;
      }
      this.modelFailureCount[currentModel.id]++;
      
      // 自动定期重置故障计数
      if (this.modelFailureCount[currentModel.id] === 1) {
        setTimeout(() => {
          this.modelFailureCount[currentModel.id] = 0;
        }, this.FAILURE_RESET_INTERVAL);
      }
      
      // 如果允许重试且错误可能是模型原因且未超过重试次数
      if (allowRetry && this.isModelError(error) && retryCount < this.MAX_RETRIES) {
        console.log(`[AIBaseService] 尝试使用备用模型重试查询 (${retryCount + 1}/${this.MAX_RETRIES})`);
        
        try {
          // 切换到备用模型
          const originalModel = AIService.getActiveModel();
          AIService.switchToBackupModel();
          
          // 使用备用模型重新查询
          const retryResult = await AIService.executeQuery(queryText, {
            context: {
              ...context,
              isRetry: true,
              retryCount: retryCount + 1
            },
            systemPrompt
          });
          
          // 查询成功后切回原模型
          AIService.setActiveModel(originalModel.id);
          
          return retryResult;
        } catch (retryError) {
          // 如果重试也失败，显示错误并恢复原模型
          console.error(`[AIBaseService] 备用模型查询也失败: ${retryError.message}`);
          
          if (showError) {
            ElMessage.error('AI服务暂时不可用，请稍后再试');
          }
          
          // 尝试递归重试一次其他备用模型（如果存在）
          if (retryCount < this.MAX_RETRIES - 1) {
            return this.executeQuery(queryText, {
              ...options,
              retryCount: retryCount + 1
            });
          }
          
          throw new Error(`AI查询失败: ${error.message}，备用模型也失败: ${retryError.message}`);
        }
      } else if (showError) {
        ElMessage.error(`AI查询失败: ${error.message}`);
      }
      
      throw error;
    }
  }
  
  /**
   * 判断错误是否为模型错误（可回退）
   * @param {Error} error 错误对象
   * @returns {boolean} 是否为模型错误
   */
  static isModelError(error) {
    const errorMsg = error.message.toLowerCase();
    return (
      errorMsg.includes('timeout') || 
      errorMsg.includes('overloaded') ||
      errorMsg.includes('rate limit') ||
      errorMsg.includes('too many requests') ||
      errorMsg.includes('服务暂时不可用') ||
      errorMsg.includes('model') ||
      errorMsg.includes('unavailable') ||
      errorMsg.includes('capacity') ||
      errorMsg.includes('busy') ||
      errorMsg.includes('error') ||
      errorMsg.includes('connection')
    );
  }
  
  /**
   * 重置模型故障计数
   * @param {string} modelId 模型ID，不传则重置所有
   */
  static resetModelFailureCount(modelId = null) {
    if (modelId) {
      this.modelFailureCount[modelId] = 0;
    } else {
      this.modelFailureCount = {};
    }
  }
  
  /**
   * 创建结构化的响应解析器
   * @param {Object} extractors 提取器配置
   * @returns {Function} 解析器函数
   */
  static createResponseParser(extractors) {
    return (response) => {
      const result = {};
      
      for (const [key, extractor] of Object.entries(extractors)) {
        try {
          if (typeof extractor === 'function') {
            result[key] = extractor(response);
          } else if (extractor.pattern) {
            const match = response.match(extractor.pattern);
            if (match && match[1]) {
              result[key] = extractor.transform ? 
                extractor.transform(match[1]) : match[1].trim();
            } else {
              result[key] = extractor.default;
            }
          }
        } catch (error) {
          console.warn(`[AIBaseService] 提取 ${key} 失败:`, error);
          result[key] = extractor.default || null;
        }
      }
      
      return result;
    };
  }
  
  /**
   * 从响应中提取列表项
   * @param {string} response AI响应文本
   * @param {Object} options 选项
   * @returns {Array} 提取的列表项
   */
  static extractListItems(response, options = {}) {
    const {
      sectionHeaders = [],
      pattern = /[•\-\*]\s*([^\n]+)/g,
      transform = (item) => item.trim(),
      minLength = 5
    } = options;
    
    try {
      let textSection = response;
      
      // 尝试获取指定部分
      if (sectionHeaders.length > 0) {
        for (const header of sectionHeaders) {
          const regex = new RegExp(`${header}[：:]\s*([\\s\\S]+?)(?=\\n\\n|$)`, 'i');
          const match = response.match(regex);
          if (match) {
            textSection = match[1];
            break;
          }
        }
      }
      
      // 提取列表项
      const items = [];
      let match;
      
      while ((match = pattern.exec(textSection)) !== null) {
        if (match[1].length >= minLength) {
          items.push(transform(match[1]));
        }
      }
      
      return items;
    } catch (error) {
      console.warn('[AIBaseService] 提取列表项失败:', error);
      return [];
    }
  }
  
  /**
   * 缓存系统
   */
  static cache = new Map();
  
  /**
   * 使用缓存执行函数
   * @param {string} key 缓存键
   * @param {Function} fn 要执行的函数
   * @param {number} ttl 缓存生存时间（毫秒）
   * @returns {Promise<any>} 函数结果
   */
  static async withCache(key, fn, ttl = 5 * 60 * 1000) {
    const now = Date.now();
    const cached = this.cache.get(key);
    
    if (cached && cached.expiry > now) {
      console.log(`[AIBaseService] 使用缓存数据: ${key}`);
      return cached.data;
    }
    
    console.log(`[AIBaseService] 缓存未命中，执行函数: ${key}`);
    const result = await fn();
    
    this.cache.set(key, {
      data: result,
      expiry: now + ttl,
      createdAt: now
    });
    
    return result;
  }
  
  /**
   * 清除缓存
   * @param {string} keyPrefix 缓存键前缀（可选）
   */
  static clearCache(keyPrefix) {
    if (keyPrefix) {
      let count = 0;
      for (const key of this.cache.keys()) {
        if (key.startsWith(keyPrefix)) {
          this.cache.delete(key);
          count++;
        }
      }
      console.log(`[AIBaseService] 已清除前缀为 ${keyPrefix} 的 ${count} 个缓存项`);
    } else {
      const count = this.cache.size;
      this.cache.clear();
      console.log(`[AIBaseService] 已清除全部 ${count} 个缓存项`);
    }
  }
  
  /**
   * 获取缓存统计信息
   * @returns {Object} 缓存统计信息
   */
  static getCacheStats() {
    const now = Date.now();
    const stats = {
      total: this.cache.size,
      active: 0,
      expired: 0,
      avgTTL: 0,
      oldestCreatedAt: now,
      newestCreatedAt: 0
    };
    
    let totalTTL = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.expiry > now) {
        stats.active++;
        const remainingTTL = item.expiry - now;
        totalTTL += remainingTTL;
        
        if (item.createdAt < stats.oldestCreatedAt) {
          stats.oldestCreatedAt = item.createdAt;
        }
        
        if (item.createdAt > stats.newestCreatedAt) {
          stats.newestCreatedAt = item.createdAt;
        }
      } else {
        stats.expired++;
      }
    }
    
    if (stats.active > 0) {
      stats.avgTTL = totalTTL / stats.active;
    }
    
    return stats;
  }
}

// 默认导出
export default AIBaseService; 