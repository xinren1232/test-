/**
 * AI模型注册表 - 管理系统中使用的AI模型
 */

// 默认模型配置
const DEFAULT_MODELS = {
  'R1': { 
    id: 'R1',
    name: 'R1-Core',
    description: '主要服务模型',
    endpoint: 'https://api.iqe.com/ai/query/r1',
    isDefault: true
  },
  'V3': { 
    id: 'V3',
    name: 'V3-Backup',
    description: '备用服务模型',
    endpoint: 'https://api.iqe.com/ai/query/v3',
    isDefault: false
  }
};

export class AIModelRegistry {
  // 模型存储
  static models = { ...DEFAULT_MODELS };
  
  // 默认模型ID
  static defaultModelId = 'R1';
  
  /**
   * 注册模型
   * @param {string} modelId 模型ID
   * @param {Object} modelConfig 模型配置
   */
  static registerModel(modelId, modelConfig) {
    this.models[modelId] = {
      id: modelId,
      ...modelConfig
    };
    
    console.log(`[AIModelRegistry] 已注册模型: ${modelId}`);
    
    // 如果是默认模型，更新默认模型ID
    if (modelConfig.isDefault) {
      this.defaultModelId = modelId;
    }
    
    return this.models[modelId];
  }
  
  /**
   * 获取模型
   * @param {string} modelId 模型ID
   * @returns {Object} 模型配置
   */
  static getModel(modelId) {
    if (!this.models[modelId]) {
      throw new Error(`未找到模型: ${modelId}`);
    }
    
    return this.models[modelId];
  }
  
  /**
   * 获取默认模型
   * @returns {Object} 默认模型配置
   */
  static getDefaultModel() {
    return this.models[this.defaultModelId] || this.models['R1'];
  }
  
  /**
   * 设置默认模型
   * @param {string} modelId 模型ID
   */
  static setDefaultModel(modelId) {
    if (!this.models[modelId]) {
      throw new Error(`未找到模型: ${modelId}`);
    }
    
    this.defaultModelId = modelId;
    
    // 更新模型配置
    Object.keys(this.models).forEach(id => {
      this.models[id].isDefault = (id === modelId);
    });
    
    return this.models[modelId];
  }
  
  /**
   * 获取所有模型
   * @returns {Array} 模型列表
   */
  static getAllModels() {
    return Object.values(this.models);
  }
  
  /**
   * 更新模型配置
   * @param {string} modelId 模型ID
   * @param {Object} config 新配置
   */
  static updateModel(modelId, config) {
    if (!this.models[modelId]) {
      throw new Error(`未找到模型: ${modelId}`);
    }
    
    this.models[modelId] = {
      ...this.models[modelId],
      ...config
    };
    
    return this.models[modelId];
  }
}

export default AIModelRegistry; 