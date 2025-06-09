// AI Service Initializer
// 提供AI服务统一初始化和管理的接口

import { AIInitializer } from './ai/AIInitializer';
import { MaterialAIService } from './ai/MaterialAIService';
import { AIEngine } from './core/AIEngine';
import { AIQueryService } from './AIQueryService';

/**
 * AI服务初始化器
 * 对外提供统一的AI服务初始化接口，整合所有AI相关功能
 */
class AIServiceInitializer {
  /**
   * 初始化所有AI服务
   * @param {Object} options 初始化选项
   * @return {Promise<void>}
   */
  static async initialize(options = {}) {
    console.log('[AIServiceInitializer] 开始初始化AI服务...');
    
    try {
      // 初始化核心AI服务
      await AIInitializer.initialize(options);
      
      console.log('[AIServiceInitializer] AI服务初始化完成');
      
      return {
        engine: AIEngine,
        query: AIQueryService,
        material: MaterialAIService,
        initialized: true
      };
    } catch (error) {
      console.error('[AIServiceInitializer] AI服务初始化失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取AI服务状态
   */
  static getStatus() {
    return {
      initialized: AIInitializer.isInitialized,
      services: {
        engine: !!AIEngine,
        material: !!MaterialAIService,
        query: !!AIQueryService
      },
      version: '1.0.0'
    };
  }
  
  /**
   * 获取AI服务列表
   */
  static getServiceList() {
    return [
      {
        id: 'ai-engine',
        name: 'AI引擎',
        status: 'active',
        description: '核心AI命令处理系统'
      },
      {
        id: 'material-ai',
        name: '物料AI服务',
        status: 'active',
        description: '物料风险和质量预测服务'
      },
      {
        id: 'ai-query',
        name: 'AI查询服务',
        status: 'active',
        description: '自然语言查询处理服务'
      }
    ];
  }
}

// 默认导出AIServiceInitializer类
export default AIServiceInitializer;