/**
 * 状态管理 - 使用Pinia存储应用状态
 */

import { defineStore } from 'pinia'

// 上下文存储模块
export const useContextStore = defineStore('context', {
  state: () => ({
    // 当前应用上下文
    current: {
      // 用户信息
      user: {
        id: 'user-001',
        name: '张工',
        role: '质检员'
      },
      // 系统信息
      system: {
        version: '1.0.0',
        theme: 'light'
      }
    },
    
    // AI使用的上下文 - 可根据需求筛选传递给AI的上下文信息
    contextForAI: {}
  }),
  
  actions: {
    /**
     * 更新用户上下文
     * @param {Object} userData 用户数据
     */
    updateUserContext(userData) {
      this.current.user = { 
        ...this.current.user,
        ...userData
      };
      this.updateAIContext();
    },
    
    /**
     * 更新系统上下文
     * @param {Object} systemData 系统数据
     */
    updateSystemContext(systemData) {
      this.current.system = {
        ...this.current.system,
        ...systemData
      };
      this.updateAIContext();
    },
    
    /**
     * 更新AI上下文
     * 筛选并格式化传递给AI的上下文信息
     */
    updateAIContext() {
      this.contextForAI = {
        user: {
          name: this.current.user.name,
          role: this.current.user.role
        },
        // 不包含敏感字段
      };
    }
  }
});

// 聊天存储模块
export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [], // 聊天消息列表
    isProcessing: false, // 是否正在处理消息
    lastContext: {}, // 最后一次消息的上下文
    activeFeature: null, // 当前激活的功能
  }),
  
  getters: {
    lastUserMessage: (state) => {
      return [...state.messages].reverse().find(m => m.type === 'user');
    }
  },
  
  actions: {
    /**
     * 添加新消息
     * @param {Object} message 消息对象
     */
    addMessage(message) {
      // 确保消息有时间戳和ID
      if (!message.timestamp) {
        message.timestamp = Date.now();
      }
      if (!message.id) {
        message.id = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      }
      this.messages.push(message);
    },
    
    /**
     * 删除指定ID的消息
     * @param {string} messageId 消息ID
     */
    removeMessage(messageId) {
      const index = this.messages.findIndex(m => m.id === messageId);
      if (index !== -1) {
        this.messages.splice(index, 1);
      }
    },
    
    /**
     * 更新消息的内容（用于流式输出）
     * @param {string} messageId 消息ID
     * @param {string} content 新内容
     */
    updateMessageContent(messageId, content) {
      const message = this.messages.find(m => m.id === messageId);
      if (message) {
        message.content = content;
      }
    },
    
    /**
     * 更新消息的其他属性
     * @param {string} messageId 消息ID
     * @param {Object} updates 更新的属性
     */
    updateMessage(messageId, updates) {
      const message = this.messages.find(m => m.id === messageId);
      if (message) {
        Object.assign(message, updates);
      }
    },
    
    /**
     * 设置消息处理状态
     * @param {boolean} isProcessing 是否处理中
     */
    setProcessing(isProcessing) {
      this.isProcessing = isProcessing;
    },
    
    /**
     * 更新最后的上下文
     * @param {Object} context 上下文对象
     */
    updateLastContext(context) {
      this.lastContext = { ...context };
    },
    
    /**
     * 激活功能
     * @param {string} featureId 功能ID
     */
    activateFeature(featureId) {
      this.activeFeature = featureId;
    },
    
    /**
     * 清空消息历史
     */
    clearMessages() {
      this.messages = [];
    }
  }
});

// AI模型状态存储
export const useAIModelStore = defineStore('aiModel', {
  state: () => ({
    models: {
      primary: {
        id: 'wp-2025060401315D-tfmvg',
        name: 'DeepSeek R1',
        active: true,
        provider: 'deepseek'
      },
      backup: {
        id: 'wp-2025032811450D-fb7p',
        name: 'DeepSeek V3',
        active: true,
        provider: 'deepseek'
      },
      volcengine: {
        id: 'volcengine-deepseek-r1',
        name: 'DeepSeek R1 (火山引擎)',
        active: true,
        provider: 'volcengine',
        useModelId: 'wp-2025060401315D-tfmvg' // 使用DeepSeek R1模型
      }
    },
    activeModel: 'primary',
    config: {
      temperature: 0.7,
      streaming: true
    }
  }),
  
  getters: {
    currentModel: (state) => {
      return state.models[state.activeModel];
    }
  },
  
  actions: {
    setActiveModel(modelType) {
      if (this.models[modelType] && this.models[modelType].active) {
        this.activeModel = modelType;
        return true;
      }
      return false;
    },
    
    updateConfig(config) {
      this.config = {
        ...this.config,
        ...config
      };
    }
  }
});

// IQE主要业务状态存储
export const useIQEStore = defineStore('iqe', {
  state: () => ({
    quality: {
      metrics: [],
      riskFactors: [],
      alerts: []
    },
    materials: {
      list: [],
      selected: null
    },
    batches: {
      list: [],
      selected: null
    },
    analysis: {
      correlations: [],
      predictions: [],
      loading: false
    },
    // Add labTestData for the filterLabTests function
    labTestData: [],
    // Trend analysis data needed by LabView
    trendAnalysisData: {},
    // Batch comparison data needed by LabView 
    batchComparisonData: {},
    // Risk analysis data needed by LabView
    riskAnalysisData: {},
    // Statistics card data
    statCardsData: {},
    // Quality prediction data
    qualityPredictionData: []
  }),
  
  actions: {
    setMaterials(materials) {
      this.materials.list = materials;
    },
    selectMaterial(materialId) {
      this.materials.selected = materialId;
    },
    setBatches(batches) {
      this.batches.list = batches;
    },
    selectBatch(batchId) {
      this.batches.selected = batchId;
    },
    setRiskFactors(factors) {
      this.quality.riskFactors = factors;
    },
    setAnalysisLoading(loading) {
      this.analysis.loading = loading;
    },
    
    // Add missing functions needed by LabView
    // 根据条件筛选实验室数据
    filterLabTests(filters = {}) {
      return this.labTestData.filter(test => {
        let match = true;
        
        if (filters.materialCode && !test.materialCode.includes(filters.materialCode)) {
          match = false;
        }
        
        if (filters.materialName && !test.materialName.includes(filters.materialName)) {
          match = false;
        }
        
        if (filters.supplier && test.supplier !== filters.supplier) {
          match = false;
        }
        
        if (filters.result && test.result !== filters.result) {
          match = false;
        }
        
        if (filters.project && test.project !== filters.project) {
          match = false;
        }
        
        if (filters.dateRange && filters.dateRange.length === 2) {
          const testDate = new Date(test.testDate);
          const startDate = new Date(filters.dateRange[0]);
          const endDate = new Date(filters.dateRange[1]);
          endDate.setHours(23, 59, 59, 999);
          
          if (testDate < startDate || testDate > endDate) {
            match = false;
          }
        }
        
        return match;
      });
    },
    
    // 刷新数据 (模拟后端API调用)
    async refreshData() {
      // 这里可以添加实际的API调用逻辑
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        success: true,
        message: '数据已更新'
      };
    },
    
    // 获取统计卡片数据
    getStatCardsData(section = 'monitoring') {
      return this.statCardsData[section] || [];
    }
  }
});

export default {
  useContextStore,
  useChatStore,
  useAIModelStore,
  useIQEStore
}; 