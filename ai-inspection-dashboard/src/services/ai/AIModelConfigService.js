/**
 * AI模型配置服务
 * 负责管理和配置系统中使用的AI模型
 */

// AI模型配置
const AI_MODEL_CONFIG = {
  // API密钥
  apiKey: '9c0c30d5-c5e7-4608-bb90-2f9f07c056cf',
  
  // 模型配置
  models: {
    // 主要模型 - R1模型
    primary: {
      id: 'r1',
      name: 'R1模型',
      version: '1.0',
      isActive: true,
      description: '主要AI问答模型',
      capabilities: ['text-generation', 'question-answering', 'context-understanding']
    },
    
    // 备用模型 - V3模型
    backup: {
      id: 'v3',
      name: 'V3模型',
      version: '1.0',
      isActive: true,
      description: '备用AI问答模型',
      capabilities: ['text-generation', 'question-answering']
    }
  },
  
  // 模型使用优先级
  priority: ['r1', 'v3']
};

/**
 * AI模型配置服务类
 */
export class AIModelConfigService {
  // 模型配置
  static config = AI_MODEL_CONFIG;
  
  /**
   * 初始化AI模型配置
   * @param {Object} options - 配置选项
   * @param {string} options.apiKey - API密钥
   * @param {Object} options.models - 模型配置
   */
  static init(options = {}) {
    if (options.apiKey) {
      this.config.apiKey = options.apiKey;
    }
    
    if (options.models) {
      // 处理传入的模型配置
      const modelEntries = Object.entries(options.models);
      if (modelEntries.length > 0) {
        // 更新主要模型和备用模型
        for (const [id, model] of modelEntries) {
          if (id === 'R1' || model.isDefault) {
            this.config.models.primary = {
              ...this.config.models.primary,
              id: model.id || 'r1',
              name: model.name || 'R1模型',
              description: model.description || '主要AI问答模型',
              endpoint: model.endpoint,
              isActive: true
            };
          } else {
            this.config.models.backup = {
              ...this.config.models.backup,
              id: model.id || 'v3',
              name: model.name || 'V3模型',
              description: model.description || '备用AI问答模型',
              endpoint: model.endpoint,
              isActive: true
            };
          }
        }
      }
    }
    
    console.log('[AIModelConfigService] 初始化完成', this.config);
  }
  
  /**
   * 获取API密钥
   * @returns {string} API密钥
   */
  static getApiKey() {
    return this.config.apiKey;
  }
  
  /**
   * 获取主要模型配置
   * @returns {Object} 主要模型配置
   */
  static getPrimaryModel() {
    return this.config.models.primary;
  }
  
  /**
   * 获取备用模型配置
   * @returns {Object} 备用模型配置
   */
  static getBackupModel() {
    return this.config.models.backup;
  }
  
  /**
   * 获取所有模型配置
   * @returns {Object} 所有模型配置
   */
  static getAllModels() {
    return this.config.models;
  }
  
  /**
   * 获取模型优先级
   * @returns {Array} 模型优先级数组
   */
  static getModelPriority() {
    return this.config.priority;
  }
  
  /**
   * 获取当前活跃模型
   * @returns {Object} 当前活跃模型配置
   */
  static getActiveModel() {
    // 按优先级顺序查找第一个活跃的模型
    const priorityList = this.getModelPriority();
    for (const modelId of priorityList) {
      const model = this.config.models[modelId === 'r1' ? 'primary' : 'backup'];
      if (model && model.isActive) {
        return model;
      }
    }
    
    // 如果没有活跃模型，返回备用模型
    return this.config.models.backup;
  }
  
  /**
   * 切换模型活跃状态
   * @param {string} modelId 模型ID
   * @param {boolean} isActive 是否活跃
   */
  static setModelActive(modelId, isActive) {
    if (modelId === 'r1' && this.config.models.primary) {
      this.config.models.primary.isActive = isActive;
    } else if (modelId === 'v3' && this.config.models.backup) {
      this.config.models.backup.isActive = isActive;
    }
  }
  
  /**
   * 更新模型优先级
   * @param {Array} priorityList 新的优先级列表
   */
  static updateModelPriority(priorityList) {
    if (Array.isArray(priorityList) && priorityList.length > 0) {
      this.config.priority = [...priorityList];
    }
  }
  
  /**
   * 切换到备用模型
   * 禁用主要模型并启用备用模型
   */
  static switchToBackupModel() {
    // 禁用主要模型
    if (this.config.models.primary) {
      this.config.models.primary.isActive = false;
    }
    
    // 启用备用模型
    if (this.config.models.backup) {
      this.config.models.backup.isActive = true;
    }
    
    // 更新优先级
    this.config.priority = ['v3', 'r1'];
    
    console.log('[AIModelConfigService] 已切换到备用模型', this.getActiveModel());
    return this.getActiveModel();
  }
  
  /**
   * 切换到主要模型
   * 禁用备用模型并启用主要模型
   */
  static switchToPrimaryModel() {
    // 启用主要模型
    if (this.config.models.primary) {
      this.config.models.primary.isActive = true;
    }
    
    // 禁用备用模型
    if (this.config.models.backup) {
      this.config.models.backup.isActive = false;
    }
    
    // 更新优先级
    this.config.priority = ['r1', 'v3'];
    
    console.log('[AIModelConfigService] 已切换到主要模型', this.getActiveModel());
    return this.getActiveModel();
  }
}

// 默认导出
export default AIModelConfigService; 