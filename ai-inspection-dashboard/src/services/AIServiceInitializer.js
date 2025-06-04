/**
 * AI服务初始化模块 - 初始化和配置所有AI服务
 * 提供统一的入口点来初始化和配置AI功能
 */

import { AIEngine } from './core/AIEngine';
import { ModelRegistry } from './core/ModelRegistry';
import { MaterialAIService } from './MaterialAIService';
import { aiConnectorService } from './aiConnectorService';

// AI服务配置
const DEFAULT_CONFIG = {
  // 缓存配置
  cache: {
    enabled: true,
    ttl: 30 * 60 * 1000 // 30分钟
  },
  // 模型配置
  models: {
    autoRegister: true,
    validateBeforeUse: true
  },
  // 日志配置
  logging: {
    level: 'info',
    enablePerformanceLogging: true
  },
  // API配置
  api: {
    baseUrl: '/api/ai',
    timeout: 30000,
    retries: 2
  }
};

// AI服务初始化类
export class AIServiceInitializer {
  // 配置
  static config = { ...DEFAULT_CONFIG };
  
  // 初始化状态
  static initialized = false;
  
  // 初始化所有AI服务
  static async initialize(customConfig = {}) {
    if (this.initialized) {
      console.warn('[AIServiceInitializer] AI服务已经初始化，跳过');
      return;
    }
    
    try {
      console.log('[AIServiceInitializer] 开始初始化AI服务...');
      
      // 合并配置
      this.config = {
        ...DEFAULT_CONFIG,
        ...customConfig
      };
      
      // 初始化外部AI连接器
      await this.initializeConnector();
      
      // 初始化模型注册表
      this.initializeModelRegistry();
      
      // 初始化物料AI服务
      this.initializeMaterialAIService();
      
      // 注册事件监听器
      this.registerEventListeners();
      
      // 标记为已初始化
      this.initialized = true;
      
      console.log('[AIServiceInitializer] AI服务初始化完成');
      return true;
    } catch (error) {
      console.error('[AIServiceInitializer] AI服务初始化失败:', error);
      throw error;
    }
  }
  
  // 初始化外部AI连接器
  static async initializeConnector() {
    try {
      console.log('[AIServiceInitializer] 初始化AI连接器...');
      
      // 配置连接器
      aiConnectorService.configure({
        baseUrl: this.config.api.baseUrl,
        timeout: this.config.api.timeout,
        retries: this.config.api.retries
      });
      
      // 测试连接
      const connectionStatus = await aiConnectorService.testConnection();
      
      if (!connectionStatus.success) {
        console.warn('[AIServiceInitializer] AI连接器连接测试失败，将使用本地模型');
      }
      
      return connectionStatus.success;
    } catch (error) {
      console.warn('[AIServiceInitializer] AI连接器初始化失败，将使用本地模型:', error);
      return false;
    }
  }
  
  // 初始化模型注册表
  static initializeModelRegistry() {
    console.log('[AIServiceInitializer] 初始化模型注册表...');
    
    // 添加模型注册表事件监听器
    ModelRegistry.addListener((event, modelName, data) => {
      console.log(`[ModelRegistry] 事件: ${event}, 模型: ${modelName}`);
    });
    
    return true;
  }
  
  // 初始化物料AI服务
  static initializeMaterialAIService() {
    console.log('[AIServiceInitializer] 初始化物料AI服务...');
    
    // 初始化默认模型
    MaterialAIService.initDefaultModels();
    
    return true;
  }
  
  // 注册事件监听器
  static registerEventListeners() {
    console.log('[AIServiceInitializer] 注册事件监听器...');
    
    // 性能监控
    if (this.config.logging.enablePerformanceLogging) {
      // 定期记录性能指标
      setInterval(() => {
        const metrics = AIEngine.getMetrics();
        console.log('[AIEngine] 性能指标:', metrics);
      }, 60000); // 每分钟记录一次
    }
    
    return true;
  }
  
  // 获取初始化状态
  static isInitialized() {
    return this.initialized;
  }
  
  // 获取配置
  static getConfig() {
    return { ...this.config };
  }
  
  // 更新配置
  static updateConfig(newConfig) {
    if (this.initialized) {
      console.warn('[AIServiceInitializer] AI服务已初始化，配置更新可能不会完全生效');
    }
    
    this.config = {
      ...this.config,
      ...newConfig
    };
    
    return this.config;
  }
  
  // 重置AI服务
  static async reset() {
    if (!this.initialized) {
      return;
    }
    
    try {
      console.log('[AIServiceInitializer] 重置AI服务...');
      
      // 清除缓存
      AIEngine.AIComputeCache.cache.clear();
      
      // 重置初始化状态
      this.initialized = false;
      
      // 重新初始化
      await this.initialize(this.config);
      
      console.log('[AIServiceInitializer] AI服务重置完成');
      return true;
    } catch (error) {
      console.error('[AIServiceInitializer] AI服务重置失败:', error);
      throw error;
    }
  }
  
  // 获取服务状态
  static async getStatus() {
    const status = {
      initialized: this.initialized,
      connector: {
        available: false,
        latency: null
      },
      models: {
        count: 0,
        types: []
      },
      cache: {
        size: 0,
        enabled: this.config.cache.enabled
      }
    };
    
    // 检查连接器状态
    try {
      const startTime = Date.now();
      const connectionStatus = await aiConnectorService.testConnection();
      const latency = Date.now() - startTime;
      
      status.connector = {
        available: connectionStatus.success,
        latency
      };
    } catch (error) {
      status.connector = {
        available: false,
        latency: null,
        error: error.message
      };
    }
    
    // 获取模型信息
    if (this.initialized) {
      status.models = {
        count: ModelRegistry.getModelCount(),
        types: ModelRegistry.listModelTypes()
      };
      
      // 获取缓存信息
      status.cache = {
        size: AIEngine.AIComputeCache.cache.size,
        enabled: this.config.cache.enabled
      };
    }
    
    return status;
  }
}

// 导出默认实例
export default AIServiceInitializer; 