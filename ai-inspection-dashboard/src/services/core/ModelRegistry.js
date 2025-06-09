/**
 * AI模型注册表 - 负责管理和跟踪所有AI模型
 * 提供模型注册、获取、版本控制和性能监控功能
 */

// 模型注册错误类
export class ModelRegistryError extends Error {
  constructor(message, modelId) {
    super(message);
    this.name = 'ModelRegistryError';
    this.modelId = modelId;
    this.timestamp = new Date();
  }
}

// 模型元数据类
export class ModelMetadata {
  constructor(options = {}) {
    this.name = options.name || 'unknown';
    this.version = options.version || '1.0.0';
    this.type = options.type || 'unknown';
    this.description = options.description || '';
    this.author = options.author || '';
    this.createdAt = options.createdAt || new Date();
    this.updatedAt = options.updatedAt || new Date();
    this.tags = options.tags || [];
    this.parameters = options.parameters || {};
    this.metrics = options.metrics || {};
    this.dependencies = options.dependencies || [];
  }
}

// 模型注册表类
export class ModelRegistry {
  // 模型存储
  static models = new Map();
  
  // 模型性能指标
  static metrics = new Map();
  
  // 模型元数据存储
  static metadata = new Map();
  
  // 默认模型
  static defaultModels = new Map();
  
  // 模型事件监听器
  static listeners = [];
  
  /**
   * 注册模型
   * @param {string} modelId 模型ID
   * @param {Object} model 模型对象
   */
  static registerModel(modelId, model) {
    if (this.models.has(modelId)) {
      console.warn(`模型 ${modelId} 已存在，将被覆盖`);
    }
    
    // 确保模型有必要的属性
    const validatedModel = {
      name: model.name || modelId,
      version: model.version || '1.0',
      type: model.type || 'unknown',
      createdAt: model.createdAt || new Date(),
      ...model
    };
    
    this.models.set(modelId, validatedModel);
    
    // 初始化性能指标
    this.metrics.set(modelId, {
      invocations: 0,
      successCount: 0,
      errorCount: 0,
      totalResponseTime: 0,
      lastUsed: null
    });
    
    console.log(`[ModelRegistry] 已注册模型 ${modelId} (${validatedModel.name} v${validatedModel.version})`);
    
    return validatedModel;
  }
  
  /**
   * 获取模型
   * @param {string} modelId 模型ID
   * @return {Object} 模型对象
   */
  static getModel(modelId) {
    const model = this.models.get(modelId);
    
    if (!model) {
      throw new Error(`未找到模型: ${modelId}`);
    }
    
    return model;
  }
  
  /**
   * 执行模型
   * @param {string} modelId 模型ID
   * @param {string} method 模型方法
   * @param {Object} data 输入数据
   * @param {Object} options 执行选项
   * @return {Promise<any>} 模型执行结果
   */
  static async executeModel(modelId, method, data, options = {}) {
    const model = this.getModel(modelId);
    const metrics = this.metrics.get(modelId);
    
    // 验证模型方法
    if (!model[method]) {
      throw new Error(`模型 ${modelId} 不支持方法 ${method}`);
    }
    
    // 更新指标
    metrics.invocations++;
    metrics.lastUsed = new Date();
    
    const startTime = Date.now();
    
    try {
      // 执行模型
      const result = await model[method](data, options);
      
      // 更新成功指标
      metrics.successCount++;
      metrics.totalResponseTime += Date.now() - startTime;
      
      return result;
    } catch (error) {
      // 更新错误指标
      metrics.errorCount++;
      console.error(`[ModelRegistry] 模型 ${modelId} 执行失败:`, error);
      
      throw error;
    }
  }
  
  /**
   * 获取所有模型
   * @return {Array} 模型列表
   */
  static getAllModels() {
    return Array.from(this.models.entries()).map(([id, model]) => ({
      id,
      ...model
    }));
  }
  
  /**
   * 获取模型性能指标
   * @param {string} modelId 模型ID
   * @return {Object} 性能指标
   */
  static getModelMetrics(modelId) {
    const model = this.getModel(modelId);
    const metrics = this.metrics.get(modelId);
    
    if (!metrics) {
      throw new Error(`未找到模型 ${modelId} 的性能指标`);
    }
    
    // 计算派生指标
    const successRate = metrics.invocations > 0 
      ? (metrics.successCount / metrics.invocations) * 100
      : 0;
    const avgResponseTime = metrics.successCount > 0
      ? metrics.totalResponseTime / metrics.successCount
      : 0;
    
    return {
      modelId,
      modelName: model.name,
      modelVersion: model.version,
      invocations: metrics.invocations,
      successRate: successRate.toFixed(2) + '%',
      avgResponseTime: avgResponseTime.toFixed(2) + 'ms',
      lastUsed: metrics.lastUsed
    };
  }
  
  /**
   * 获取所有模型的性能指标
   * @return {Array} 性能指标列表
   */
  static getAllMetrics() {
    return Array.from(this.models.keys()).map(modelId => this.getModelMetrics(modelId));
  }
  
  /**
   * 删除模型
   * @param {string} modelId 模型ID
   */
  static deleteModel(modelId) {
    if (!this.models.has(modelId)) {
      throw new Error(`未找到模型: ${modelId}`);
    }
    
    this.models.delete(modelId);
    this.metrics.delete(modelId);
    
    console.log(`[ModelRegistry] 已删除模型 ${modelId}`);
  }
  
  // 获取模型元数据
  static getModelMetadata(name) {
    try {
      if (!this.metadata.has(name)) {
        throw new Error(`模型元数据不存在: ${name}`);
      }
      
      return this.metadata.get(name);
    } catch (error) {
      throw new ModelRegistryError(`获取模型元数据失败: ${error.message}`, name);
    }
  }
  
  // 获取默认模型
  static getDefaultModel(type) {
    try {
      if (!this.defaultModels.has(type)) {
        throw new Error(`没有类型为 ${type} 的默认模型`);
      }
      
      const modelName = this.defaultModels.get(type);
      return this.getModel(modelName);
    } catch (error) {
      throw new ModelRegistryError(`获取默认模型失败: ${error.message}`, type);
    }
  }
  
  // 设置默认模型
  static setDefaultModel(type, name) {
    try {
      if (!this.models.has(name)) {
        throw new Error(`模型不存在: ${name}`);
      }
      
      // 更新默认模型
      this.defaultModels.set(type, name);
      
      // 更新元数据
      const metadata = this.metadata.get(name);
      metadata.isDefault = true;
      this.metadata.set(name, metadata);
      
      // 触发事件
      this.notifyListeners('setDefault', name, { type });
      
      console.log(`[ModelRegistry] 设置默认模型: ${name} (类型: ${type})`);
      return true;
    } catch (error) {
      throw new ModelRegistryError(`设置默认模型失败: ${error.message}`, name);
    }
  }
  
  // 更新模型
  static updateModel(name, model, metadata = {}) {
    try {
      if (!this.models.has(name)) {
        throw new Error(`模型不存在: ${name}`);
      }
      
      // 获取现有元数据
      const existingMetadata = this.metadata.get(name);
      
      // 更新元数据
      const updatedMetadata = new ModelMetadata({
        ...existingMetadata,
        ...metadata,
        updatedAt: new Date()
      });
      
      // 存储模型和元数据
      this.models.set(name, model);
      this.metadata.set(name, updatedMetadata);
      
      // 触发事件
      this.notifyListeners('update', name, updatedMetadata);
      
      console.log(`[ModelRegistry] 更新模型: ${name} (${updatedMetadata.version})`);
      return true;
    } catch (error) {
      throw new ModelRegistryError(`更新模型失败: ${error.message}`, name);
    }
  }
  
  // 列出所有模型
  static listModels(filter = {}) {
    try {
      const { type, tag, author, version } = filter;
      
      // 过滤模型
      const filteredModels = [];
      this.metadata.forEach((metadata, name) => {
        let match = true;
        
        if (type && metadata.type !== type) match = false;
        if (tag && !metadata.tags.includes(tag)) match = false;
        if (author && metadata.author !== author) match = false;
        if (version && metadata.version !== version) match = false;
        
        if (match) {
          filteredModels.push({
            name,
            metadata
          });
        }
      });
      
      return filteredModels;
    } catch (error) {
      throw new ModelRegistryError(`列出模型失败: ${error.message}`);
    }
  }
  
  // 列出所有模型类型
  static listModelTypes() {
    try {
      const types = new Set();
      
      this.metadata.forEach(metadata => {
        if (metadata.type) {
          types.add(metadata.type);
        }
      });
      
      return Array.from(types);
    } catch (error) {
      throw new ModelRegistryError(`列出模型类型失败: ${error.message}`);
    }
  }
  
  // 添加事件监听器
  static addListener(listener) {
    if (typeof listener === 'function') {
      this.listeners.push(listener);
      return true;
    }
    return false;
  }
  
  // 移除事件监听器
  static removeListener(listener) {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
      return true;
    }
    return false;
  }
  
  // 通知监听器
  static notifyListeners(event, modelName, data) {
    this.listeners.forEach(listener => {
      try {
        listener(event, modelName, data);
      } catch (error) {
        console.error(`[ModelRegistry] 监听器错误: ${error.message}`);
      }
    });
  }
  
  // 检查模型是否存在
  static hasModel(name) {
    return this.models.has(name);
  }
  
  // 获取模型数量
  static getModelCount() {
    return this.models.size;
  }
  
  // 获取模型版本
  static getModelVersion(name) {
    if (!this.metadata.has(name)) {
      throw new ModelRegistryError(`模型元数据不存在: ${name}`, name);
    }
    
    return this.metadata.get(name).version;
  }
  
  // 更新模型性能指标
  static updateModelMetrics(name, metrics) {
    try {
      if (!this.metadata.has(name)) {
        throw new Error(`模型元数据不存在: ${name}`);
      }
      
      // 获取现有元数据
      const metadata = this.metadata.get(name);
      
      // 更新指标
      metadata.metrics = {
        ...metadata.metrics,
        ...metrics,
        updatedAt: new Date()
      };
      
      // 保存元数据
      this.metadata.set(name, metadata);
      
      // 触发事件
      this.notifyListeners('updateMetrics', name, metadata.metrics);
      
      return true;
    } catch (error) {
      throw new ModelRegistryError(`更新模型指标失败: ${error.message}`, name);
    }
  }
  
  // 注册简单模型（函数）
  static registerSimpleModel(name, fn, metadata = {}) {
    // 包装函数为模型对象
    const model = {
      predict: fn,
      type: 'function'
    };
    
    return this.registerModel(name, model, {
      type: 'function',
      ...metadata
    });
  }
  
  // 批量注册模型
  static registerModels(models) {
    const results = [];
    
    for (const { name, model, metadata } of models) {
      try {
        const success = this.registerModel(name, model, metadata);
        results.push({ name, success });
      } catch (error) {
        results.push({ name, success: false, error: error.message });
      }
    }
    
    return results;
  }
  
  // 导出模型注册表
  static exportRegistry() {
    const registry = {
      models: {},
      defaultModels: {}
    };
    
    // 导出元数据
    this.metadata.forEach((metadata, name) => {
      registry.models[name] = metadata;
    });
    
    // 导出默认模型
    this.defaultModels.forEach((modelName, type) => {
      registry.defaultModels[type] = modelName;
    });
    
    return registry;
  }
  
  // 导入模型注册表
  static importRegistry(registry, importModels = false) {
    try {
      const { models, defaultModels } = registry;
      
      // 导入元数据
      for (const [name, metadata] of Object.entries(models)) {
        if (importModels && this.models.has(name)) {
          // 如果导入模型且模型已存在，更新元数据
          this.metadata.set(name, new ModelMetadata(metadata));
        } else if (!this.models.has(name)) {
          // 如果模型不存在，创建占位符
          this.metadata.set(name, new ModelMetadata(metadata));
          this.models.set(name, { type: 'placeholder', name });
        }
      }
      
      // 导入默认模型
      for (const [type, modelName] of Object.entries(defaultModels)) {
        if (this.models.has(modelName)) {
          this.defaultModels.set(type, modelName);
        }
      }
      
      return true;
    } catch (error) {
      throw new ModelRegistryError(`导入注册表失败: ${error.message}`);
    }
  }
} 