/**
 * AI服务初始化模块
 * 负责统一初始化和配置AI相关的所有服务
 */

import { AIEngine } from '../core/AIEngine';
import { MaterialAIService } from './MaterialAIService';
import { DataPreprocessor } from '../core/DataPreprocessor';
import { ModelRegistry } from '../core/ModelRegistry';
import { AIModelConfigService } from './AIModelConfigService';

export class AIInitializer {
  // 初始化状态
  static isInitialized = false;
  
  // 初始化配置
  static config = {
    useCache: true,
    cacheTTL: 30 * 60 * 1000, // 30分钟
    enableLogging: true,
    enableMetrics: true,
    defaultModels: {
      prediction: 'quality-prediction-v1',
      detection: 'anomaly-detection-v1',
      recommendation: 'quality-recommendation-v1',
      // 新增AI问答模型配置
      conversation: {
        primary: 'r1',
        backup: 'v3'
      }
    }
  };
  
  /**
   * 初始化所有AI服务
   * @param {Object} options 初始化选项
   * @return {Promise<void>}
   */
  static async initialize(options = {}) {
    if (this.isInitialized) {
      console.warn('AI服务已经初始化');
      return;
    }
    
    console.log('开始初始化AI服务...');
    
    // 合并配置
    this.config = {
      ...this.config,
      ...options
    };
    
    try {
      // 初始化数据预处理器
      await this.initDataPreprocessor();
      
      // 初始化模型注册表
      await this.initModelRegistry();
      
      // 初始化物料AI服务
      await this.initMaterialAIService();
      
      // 设置AI引擎配置
      this.configureAIEngine();
      
      this.isInitialized = true;
      console.log('AI服务初始化完成');
    } catch (error) {
      console.error('AI服务初始化失败:', error);
      throw error;
    }
  }
  
  /**
   * 初始化数据预处理器
   * @return {Promise<void>}
   */
  static async initDataPreprocessor() {
    console.log('初始化数据预处理器...');
    
    // 注册清洗策略
    DataPreprocessor.registerCleaningStrategy('missing-values', (data) => {
      // 简单实现：移除缺失值或使用平均值填充
      return data;
    });
    
    // 注册转换策略
    DataPreprocessor.registerTransformStrategy('normalization', (data) => {
      // 简单实现：标准化数据
      return data;
    });
    
    // 注册特征工程策略
    DataPreprocessor.registerFeatureStrategy('time-series', (data) => {
      // 简单实现：时间序列特征提取
      return data;
    });
    
    console.log('数据预处理器初始化完成');
  }
  
  /**
   * 初始化模型注册表
   * @return {Promise<void>}
   */
  static async initModelRegistry() {
    console.log('初始化模型注册表...');
    
    // 注册默认模型
    ModelRegistry.registerModel(
      this.config.defaultModels.prediction,
      {
        name: '质量预测模型',
        version: '1.0',
        type: 'regression',
        predict: (data) => {
          // 简化实现：模拟预测逻辑
          return { quality: Math.random() * 100 };
        }
      }
    );
    
    ModelRegistry.registerModel(
      this.config.defaultModels.detection,
      {
        name: '异常检测模型',
        version: '1.0',
        type: 'classification',
        detect: (data) => {
          // 简化实现：模拟异常检测逻辑
          return { anomalies: [] };
        }
      }
    );
    
    ModelRegistry.registerModel(
      this.config.defaultModels.recommendation,
      {
        name: '质量推荐模型',
        version: '1.0',
        type: 'recommendation',
        recommend: (data) => {
          // 简化实现：模拟推荐逻辑
          return { recommendations: [] };
        }
      }
    );
    
    // 注册AI问答模型 - 主模型R1
    const primaryModel = AIModelConfigService.getPrimaryModel();
    ModelRegistry.registerModel(
      primaryModel.id,  // 使用一致的ID 'r1'
      {
        name: primaryModel.name,
        version: primaryModel.version,
        type: 'conversation',
        apiKey: AIModelConfigService.getApiKey(),
        isActive: primaryModel.isActive,
        capabilities: primaryModel.capabilities,
        query: (data) => {
          console.log(`[${primaryModel.name}] 处理查询:`, data.query.substring(0, 50) + '...');
          return {
            response: `[${primaryModel.name}] 回复: ${data.query}`,
            model: primaryModel.id,
            confidence: 0.92
          };
        }
      }
    );
    
    // 注册AI问答模型 - 备用模型V3
    const backupModel = AIModelConfigService.getBackupModel();
    ModelRegistry.registerModel(
      backupModel.id,  // 使用一致的ID 'v3'
      {
        name: backupModel.name,
        version: backupModel.version,
        type: 'conversation',
        apiKey: AIModelConfigService.getApiKey(),
        isActive: backupModel.isActive,
        capabilities: backupModel.capabilities,
        query: (data) => {
          console.log(`[${backupModel.name}] 处理查询:`, data.query.substring(0, 50) + '...');
          return {
            response: `[${backupModel.name}] 回复: ${data.query}`,
            model: backupModel.id,
            confidence: 0.85
          };
        }
      }
    );
    
    console.log('模型注册表初始化完成');
  }
  
  /**
   * 初始化物料AI服务
   * @return {Promise<void>}
   */
  static async initMaterialAIService() {
    console.log('初始化物料AI服务...');
    
    // 配置服务
    MaterialAIService.configure({
      riskModel: ModelRegistry.getModel(this.config.defaultModels.prediction),
      qualityModel: ModelRegistry.getModel(this.config.defaultModels.prediction),
      anomalyModel: ModelRegistry.getModel(this.config.defaultModels.detection)
    });
    
    console.log('物料AI服务初始化完成');
  }
  
  /**
   * 配置AI引擎
   */
  static configureAIEngine() {
    console.log('配置AI引擎...');
    
    // 注册模型到AI引擎
    Object.values(this.config.defaultModels).forEach(modelId => {
      if (typeof modelId === 'string') {
        const model = ModelRegistry.getModel(modelId);
        AIEngine.registerModel(modelId, model);
      } else if (typeof modelId === 'object') {
        // 处理嵌套对象，如conversation模型
        Object.values(modelId).forEach(nestedModelId => {
          const model = ModelRegistry.getModel(nestedModelId);
          AIEngine.registerModel(nestedModelId, model);
        });
      }
    });
    
    // 配置缓存
    if (this.config.useCache) {
      // 这里假设AIEngine有一个setCacheTTL方法
      AIEngine.setCacheTTL?.(this.config.cacheTTL);
    }
    
    console.log('AI引擎配置完成');
  }
  
  /**
   * 获取AI问答模型
   * @param {boolean} useBackup 是否使用备用模型
   * @returns {Object} AI问答模型
   */
  static getConversationModel(useBackup = false) {
    const modelId = useBackup 
      ? this.config.defaultModels.conversation.backup 
      : this.config.defaultModels.conversation.primary;
    return ModelRegistry.getModel(modelId);
  }
  
  /**
   * 获取当前活跃会话模型
   * @returns {Object} 活跃的会话模型
   */
  static getActiveConversationModel() {
    const activeModel = AIModelConfigService.getActiveModel();
    const modelId = activeModel.id === AIModelConfigService.getPrimaryModel().id
      ? this.config.defaultModels.conversation.primary 
      : this.config.defaultModels.conversation.backup;
    return ModelRegistry.getModel(modelId);
  }
} 