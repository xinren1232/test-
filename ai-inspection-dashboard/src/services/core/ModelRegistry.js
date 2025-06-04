/**
 * 模型注册管理模块 - 管理AI模型的注册和使用
 * 提供模型的注册、获取、版本控制等功能
 */

// 模型注册错误类
export class ModelRegistryError extends Error {
  constructor(message, modelName) {
    super(message);
    this.name = 'ModelRegistryError';
    this.modelName = modelName;
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

// 模型注册管理类
export class ModelRegistry {
  // 存储模型和元数据
  static models = new Map();
  static metadata = new Map();
  
  // 默认模型
  static defaultModels = new Map();
  
  // 模型事件监听器
  static listeners = [];
  
  // 注册模型
  static registerModel(name, model, metadata = {}) {
    try {
      if (!name || typeof name !== 'string') {
        throw new Error('模型名称必须是非空字符串');
      }
      
      if (!model) {
        throw new Error('模型不能为空');
      }
      
      // 创建元数据
      const modelMetadata = new ModelMetadata({
        name,
        ...metadata,
        updatedAt: new Date()
      });
      
      // 存储模型和元数据
      this.models.set(name, model);
      this.metadata.set(name, modelMetadata);
      
      // 如果是默认模型，设置为默认
      if (metadata.isDefault && metadata.type) {
        this.defaultModels.set(metadata.type, name);
      }
      
      // 触发事件
      this.notifyListeners('register', name, modelMetadata);
      
      console.log(`[ModelRegistry] 注册模型: ${name} (${modelMetadata.version})`);
      return true;
    } catch (error) {
      throw new ModelRegistryError(`注册模型失败: ${error.message}`, name);
    }
  }
  
  // 获取模型
  static getModel(name) {
    try {
      if (!this.models.has(name)) {
        throw new Error(`模型不存在: ${name}`);
      }
      
      return this.models.get(name);
    } catch (error) {
      throw new ModelRegistryError(`获取模型失败: ${error.message}`, name);
    }
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
  
  // 删除模型
  static deleteModel(name) {
    try {
      if (!this.models.has(name)) {
        throw new Error(`模型不存在: ${name}`);
      }
      
      // 获取元数据
      const metadata = this.metadata.get(name);
      
      // 如果是默认模型，移除默认设置
      if (metadata.isDefault && metadata.type) {
        this.defaultModels.delete(metadata.type);
      }
      
      // 删除模型和元数据
      this.models.delete(name);
      this.metadata.delete(name);
      
      // 触发事件
      this.notifyListeners('delete', name, metadata);
      
      console.log(`[ModelRegistry] 删除模型: ${name}`);
      return true;
    } catch (error) {
      throw new ModelRegistryError(`删除模型失败: ${error.message}`, name);
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
  
  // 获取模型性能指标
  static getModelMetrics(name) {
    if (!this.metadata.has(name)) {
      throw new ModelRegistryError(`模型元数据不存在: ${name}`, name);
    }
    
    return this.metadata.get(name).metrics;
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