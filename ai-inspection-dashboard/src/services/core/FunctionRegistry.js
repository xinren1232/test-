/**
 * 功能注册中心 - 管理系统所有功能模块
 */

export class FunctionRegistry {
  // 功能存储库
  static functions = {};
  
  // 功能分组
  static functionGroups = {
    'inventory': { 
      label: '库存管理', 
      priority: 90, 
      description: '管理物料和批次的库存状态'
    },
    'laboratory': { 
      label: '实验室测试', 
      priority: 80, 
      description: '管理物料的实验室测试数据'
    },
    'production': { 
      label: '生产线管理', 
      priority: 85, 
      description: '管理生产线状态和异常分析'
    },
    'quality': { 
      label: '质量检验', 
      priority: 95, 
      description: '管理物料的质量检验数据'
    },
    'visualization': { 
      label: '数据可视化', 
      priority: 75, 
      description: '生成各类数据图表'
    },
    'navigation': { 
      label: '系统导航', 
      priority: 60, 
      description: '系统页面导航'
    },
    'general': { 
      label: '通用功能', 
      priority: 70, 
      description: '通用系统功能'
    }
  };
  
  /**
   * 注册功能
   * @param {string} module 模块名称
   * @param {string} feature 功能名称
   * @param {Function} handler 处理函数
   * @param {Object} metadata 元数据
   */
  static registerFunction(module, feature, handler, metadata = {}) {
    if (!this.functions[module]) {
      this.functions[module] = {};
    }
    
    this.functions[module][feature] = {
      handler,
      metadata: {
        module,
        feature,
        permissions: ['*'],
        tags: [],
        ...metadata
      },
      registeredAt: new Date()
    };
    
    console.log(`FunctionRegistry: 注册功能 ${module}.${feature} 成功`);
  }
  
  /**
   * 检查是否存在指定功能
   * @param {string} module 模块名称
   * @param {string} feature 功能名称
   * @returns {boolean} 是否存在
   */
  static hasFunction(module, feature) {
    return !!(this.functions[module] && this.functions[module][feature]);
  }
  
  /**
   * 查找功能
   * @param {string} module 模块名称
   * @param {string} feature 功能名称
   * @returns {Object|null} 功能对象
   */
  static findFunction(module, feature) {
    if (!this.functions[module] || !this.functions[module][feature]) {
      return null;
    }
    
    return this.functions[module][feature];
  }
  
  /**
   * 调用功能
   * @param {string} module 模块名称
   * @param {string} feature 功能名称
   * @param {Object} params 参数
   * @returns {Promise<any>} 调用结果
   */
  static async callFunction(module, feature, params = {}) {
    const func = this.findFunction(module, feature);
    
    if (!func) {
      throw new Error(`找不到功能: ${module}.${feature}`);
    }
    
    try {
      // 记录调用历史
      this.recordFunctionCall(module, feature, params);
      
      // 执行功能处理函数
      return await func.handler(params);
    } catch (error) {
      console.error(`调用功能 ${module}.${feature} 失败:`, error);
      throw error;
    }
  }
  
  /**
   * 获取模块所有功能
   * @param {string} module 模块名称
   * @returns {Object} 功能列表
   */
  static getModuleFunctions(module) {
    return this.functions[module] || {};
  }
  
  /**
   * 获取所有已注册功能
   * @returns {Object} 所有功能
   */
  static getAllFunctions() {
    return this.functions;
  }
  
  /**
   * 获取功能列表数组
   * @returns {Array} 功能列表
   */
  static getFunctionList() {
    const list = [];
    
    for (const [module, features] of Object.entries(this.functions)) {
      for (const [feature, funcObj] of Object.entries(features)) {
        list.push({
          id: `${module}.${feature}`,
          module,
          feature,
          ...funcObj.metadata
        });
      }
    }
    
    return list;
  }
  
  /**
   * 查找与标签匹配的功能
   * @param {Array<string>} tags 标签数组
   * @returns {Array} 匹配的功能列表
   */
  static findFunctionsByTags(tags) {
    if (!tags || !tags.length) {
      return [];
    }
    
    return this.getFunctionList().filter(func => {
      return func.tags.some(tag => tags.includes(tag));
    });
  }
  
  /**
   * 根据关键词搜索功能
   * @param {string} keyword 关键词
   * @returns {Array} 匹配的功能列表
   */
  static searchFunctions(keyword) {
    if (!keyword) {
      return [];
    }
    
    const lowerKeyword = keyword.toLowerCase();
    
    return this.getFunctionList().filter(func => {
      return (
        func.module.toLowerCase().includes(lowerKeyword) ||
        func.feature.toLowerCase().includes(lowerKeyword) ||
        (func.description && func.description.toLowerCase().includes(lowerKeyword)) ||
        func.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
      );
    });
  }

  /**
   * 功能调用历史
   */
  static callHistory = [];
  
  /**
   * 记录功能调用
   * @param {string} module 模块名称
   * @param {string} feature 功能名称
   * @param {Object} params 参数
   */
  static recordFunctionCall(module, feature, params) {
    const timestamp = new Date();
    this.callHistory.push({
      module,
      feature,
      params,
      timestamp
    });
    
    // 只保留最近100条记录
    if (this.callHistory.length > 100) {
      this.callHistory.shift();
    }
  }
  
  /**
   * 获取调用历史
   * @param {number} limit 限制数量
   * @returns {Array} 调用历史
   */
  static getCallHistory(limit = 10) {
    return this.callHistory.slice(-limit);
  }
  
  /**
   * 获取最近调用的功能
   * @param {number} limit 限制数量
   * @returns {Array} 功能列表
   */
  static getRecentFunctions(limit = 5) {
    const recentCalls = [];
    const uniqueKeys = new Set();
    
    // 从最近的调用开始遍历
    for (let i = this.callHistory.length - 1; i >= 0; i--) {
      const call = this.callHistory[i];
      const key = `${call.module}.${call.feature}`;
      
      if (!uniqueKeys.has(key)) {
        uniqueKeys.add(key);
        recentCalls.push(call);
        
        if (recentCalls.length >= limit) {
          break;
        }
      }
    }
    
    // 获取完整功能信息
    return recentCalls.map(call => {
      const func = this.findFunction(call.module, call.feature);
      return {
        id: `${call.module}.${call.feature}`,
        module: call.module,
        feature: call.feature,
        lastCalled: call.timestamp,
        ...(func ? func.metadata : {})
      };
    });
  }
  
  /**
   * 获取推荐功能
   * @param {Object} context 上下文
   * @param {number} limit 限制数量
   * @returns {Array} 推荐功能列表
   */
  static getRecommendedFunctions(context = {}, limit = 5) {
    // 基于上下文智能推荐功能
    const { scenario, materialCode, recentActivity } = context;
    
    // 获取所有功能
    const allFunctions = this.getFunctionList();
    
    // 计算每个功能的推荐分数
    const scoredFunctions = allFunctions.map(func => {
      let score = 0;
      
      // 根据模块优先级加分
      const groupInfo = this.functionGroups[func.module] || {};
      score += (groupInfo.priority || 50) / 100;
      
      // 如果场景匹配，加分
      if (scenario && func.module === scenario) {
        score += 0.3;
      }
      
      // 如果功能与物料相关且上下文中有物料，加分
      if (materialCode && func.tags.includes('material')) {
        score += 0.2;
      }
      
      // 近期使用过的功能加分
      const recentFunc = this.getRecentFunctions(10)
        .find(recent => recent.module === func.module && recent.feature === func.feature);
      
      if (recentFunc) {
        // 最近使用过的功能优先级更高
        const hoursSinceLastCall = (new Date() - new Date(recentFunc.lastCalled)) / (1000 * 60 * 60);
        if (hoursSinceLastCall < 24) {
          score += 0.1 * (1 - hoursSinceLastCall / 24);
        }
      }
      
      return {
        ...func,
        score
      };
    });
    
    // 按分数排序并返回前N个
    return scoredFunctions
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
  
  /**
   * 获取功能分组信息
   * @returns {Object} 分组信息
   */
  static getFunctionGroups() {
    return this.functionGroups;
  }
  
  /**
   * 注册功能分组
   * @param {string} groupId 分组ID
   * @param {Object} groupInfo 分组信息
   */
  static registerFunctionGroup(groupId, groupInfo) {
    this.functionGroups[groupId] = {
      ...groupInfo,
      id: groupId
    };
  }
  
  /**
   * 按分组获取功能
   * @returns {Object} 分组功能
   */
  static getFunctionsByGroup() {
    const result = {};
    
    // 初始化所有分组
    Object.keys(this.functionGroups).forEach(groupId => {
      result[groupId] = {
        ...this.functionGroups[groupId],
        functions: []
      };
    });
    
    // 将功能分配到各个分组
    const allFunctions = this.getFunctionList();
    allFunctions.forEach(func => {
      if (result[func.module]) {
        result[func.module].functions.push(func);
      }
    });
    
    return result;
  }
}

export default FunctionRegistry; 