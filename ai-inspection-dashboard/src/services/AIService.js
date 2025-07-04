/**
 * AI服务
 * 管理AI增强功能的API调用
 */

class AIService {
  constructor() {
    this.baseUrl = 'http://localhost:3001/api/assistant';
    this.isEnabled = false;
  }

  /**
   * 检查AI服务健康状态
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/ai-health`);
      if (response.ok) {
        const health = await response.json();
        return health;
      } else {
        throw new Error(`健康检查失败: ${response.status}`);
      }
    } catch (error) {
      console.error('AI健康检查失败:', error);
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * 启用/禁用AI增强
   */
  async toggleAI(enabled) {
    try {
      const response = await fetch(`${this.baseUrl}/ai-toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled })
      });

      if (response.ok) {
        const result = await response.json();
        this.isEnabled = enabled;
        return result;
      } else {
        throw new Error(`AI切换失败: ${response.status}`);
      }
    } catch (error) {
      console.error('AI切换失败:', error);
      throw error;
    }
  }

  /**
   * 发送AI增强查询（流式响应）
   */
  async sendAIQuery(query, onMessage) {
    try {
      const response = await fetch(`${this.baseUrl}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error(`AI查询失败: ${response.status}`);
      }

      // 处理JSON响应（非流式）
      const result = await response.json();

      if (onMessage) {
        // 模拟流式响应的格式
        onMessage({
          type: 'message',
          content: result.reply || result.message || '查询完成',
          source: result.source || 'database-service',
          timestamp: result.timestamp
        });

        // 发送完成信号
        onMessage({ type: 'done' });
      }

      return result;
    } catch (error) {
      console.error('AI查询失败:', error);
      if (onMessage) {
        onMessage({
          type: 'error',
          message: error.message
        });
      }
      throw error;
    }
  }

  /**
   * 发送基础查询
   */
  async sendBasicQuery(query) {
    try {
      const response = await fetch(`${this.baseUrl}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error(`基础查询失败: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('基础查询失败:', error);
      throw error;
    }
  }

  /**
   * 智能路由：根据查询复杂度选择处理方式
   */
  async smartQuery(query, onMessage) {
    // 检测复杂查询的关键词
    const complexKeywords = [
      '分析', '评估', '比较', '趋势', '预测', '建议', '优化',
      '整体', '综合', '深度', '全面', '详细', '专业',
      '为什么', '如何', '怎样', '原因', '影响', '关联',
      '质量状况', '质量分析', '质量评估', '质量趋势',
      '风险评估', '改进建议', '优化方案'
    ];

    const hasComplexKeywords = complexKeywords.some(keyword => 
      query.includes(keyword)
    );

    const isLongQuery = query.length > 20;
    const hasMultipleEntities = (
      (query.includes('工厂') ? 1 : 0) +
      (query.includes('供应商') ? 1 : 0) +
      (query.includes('物料') ? 1 : 0) +
      (query.includes('批次') ? 1 : 0)
    ) >= 2;

    const shouldUseAI = this.isEnabled && (hasComplexKeywords || isLongQuery || hasMultipleEntities);

    if (shouldUseAI) {
      console.log('🤖 使用AI增强处理复杂查询');
      return await this.sendAIQuery(query, onMessage);
    } else {
      console.log('📋 使用基础规则处理简单查询');
      const result = await this.sendBasicQuery(query);
      if (onMessage) {
        onMessage({
          type: 'basic_result',
          data: result
        });
      }
      return result;
    }
  }

  /**
   * 获取AI状态
   */
  getStatus() {
    return {
      isEnabled: this.isEnabled,
      baseUrl: this.baseUrl
    };
  }

  /**
   * 设置AI状态
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }
}

// 创建单例实例
const aiService = new AIService();

export default aiService;

// 导出一些便捷方法
export const checkAIHealth = () => aiService.checkHealth();
export const toggleAI = (enabled) => aiService.toggleAI(enabled);
export const sendAIQuery = (query, onMessage) => aiService.sendAIQuery(query, onMessage);
export const sendBasicQuery = (query) => aiService.sendBasicQuery(query);
export const smartQuery = (query, onMessage) => aiService.smartQuery(query, onMessage);

/**
 * AI消息处理器
 * 用于处理流式AI响应
 */
export class AIMessageHandler {
  constructor() {
    this.reset();
  }

  reset() {
    this.analysisPhase = '';
    this.queryPlan = null;
    this.queryResults = null;
    this.aiContent = '';
    this.isComplete = false;
    this.hasError = false;
    this.errorMessage = '';
  }

  handleMessage(message) {
    switch (message.type) {
      case 'start':
        this.analysisPhase = message.message;
        break;
      case 'analysis_plan':
        this.queryPlan = message.data;
        this.analysisPhase = '📋 生成分析计划完成';
        break;
      case 'query_results':
        this.queryResults = message.data;
        this.analysisPhase = '🔍 数据查询完成';
        break;
      case 'ai_analysis_start':
        this.analysisPhase = message.message;
        break;
      case 'ai_content':
        this.aiContent += message.content;
        break;
      case 'end':
        this.analysisPhase = message.message;
        this.isComplete = true;
        break;
      case 'error':
        this.hasError = true;
        this.errorMessage = message.message;
        break;
      case 'basic_result':
        // 处理基础查询结果
        this.isComplete = true;
        break;
    }
  }

  getState() {
    return {
      analysisPhase: this.analysisPhase,
      queryPlan: this.queryPlan,
      queryResults: this.queryResults,
      aiContent: this.aiContent,
      isComplete: this.isComplete,
      hasError: this.hasError,
      errorMessage: this.errorMessage
    };
  }
}

/**
 * AI查询建议器
 * 根据用户输入提供查询建议
 */
export class AIQuerySuggester {
  constructor() {
    this.suggestions = {
      quality_analysis: [
        '分析{material}的整体质量状况',
        '评估{supplier}供应商的质量表现',
        '分析{factory}工厂的质量趋势',
        '为什么{material}的不良率上升？'
      ],
      comparison: [
        '对比{supplier1}和{supplier2}的质量表现',
        '比较{factory1}和{factory2}的生产效率',
        '分析不同供应商的{material}质量差异'
      ],
      optimization: [
        '如何优化{material}的质量管理？',
        '提供{factory}工厂的改进建议',
        '如何降低{material}的不良率？'
      ],
      prediction: [
        '预测{material}的质量趋势',
        '分析{supplier}供应商的风险等级',
        '评估{factory}工厂的质量稳定性'
      ]
    };
  }

  getSuggestions(category = 'quality_analysis', context = {}) {
    const templates = this.suggestions[category] || this.suggestions.quality_analysis;
    
    return templates.map(template => {
      let suggestion = template;
      
      // 替换占位符
      Object.entries(context).forEach(([key, value]) => {
        suggestion = suggestion.replace(`{${key}}`, value);
      });
      
      // 如果还有未替换的占位符，使用默认值
      suggestion = suggestion
        .replace('{material}', 'OLED显示屏')
        .replace('{supplier}', 'BOE')
        .replace('{supplier1}', 'BOE')
        .replace('{supplier2}', '聚龙')
        .replace('{factory}', '深圳工厂')
        .replace('{factory1}', '深圳工厂')
        .replace('{factory2}', '上海工厂');
      
      return suggestion;
    });
  }

  getAllSuggestions() {
    const all = [];
    Object.keys(this.suggestions).forEach(category => {
      all.push(...this.getSuggestions(category));
    });
    return all;
  }
}
