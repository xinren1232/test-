/**
 * 简化的AI服务
 * 专注于基本的AI问答功能
 */

import DeepSeekService from './DeepSeekService.js';

class SimpleAIService {
  constructor() {
    this.deepSeekService = new DeepSeekService();
    this.isEnabled = true;
  }

  /**
   * 处理用户查询
   */
  async processQuery(userQuery) {
    console.log('🤖 SimpleAI处理查询:', userQuery);
    
    try {
      // 判断是否需要AI处理
      if (this.shouldUseAI(userQuery)) {
        console.log('🧠 使用AI处理');
        const answer = await this.deepSeekService.answerQuestion(userQuery);
        return {
          reply: answer,
          source: 'ai-enhanced',
          type: 'ai_direct'
        };
      } else {
        console.log('📋 不需要AI处理');
        return null; // 让控制器使用基础规则处理
      }
    } catch (error) {
      console.error('❌ SimpleAI处理失败:', error);
      return null; // 降级到基础规则处理
    }
  }

  /**
   * 判断是否需要使用AI
   */
  shouldUseAI(userQuery) {
    // 问候语和介绍类关键词
    const greetingKeywords = [
      '你好', '您好', '介绍', '功能', '能力', '帮助', '什么', '是什么',
      'hello', 'hi', '欢迎', '开始'
    ];

    // 复杂查询的关键词
    const complexKeywords = [
      '分析', '评估', '比较', '趋势', '预测', '建议', '优化',
      '整体', '综合', '深度', '全面', '详细', '专业',
      '为什么', '如何', '怎样', '原因', '影响', '关联'
    ];

    const hasGreetingKeywords = greetingKeywords.some(keyword =>
      userQuery.includes(keyword)
    );

    const hasComplexKeywords = complexKeywords.some(keyword =>
      userQuery.includes(keyword)
    );

    // 长查询通常更复杂
    const isLongQuery = userQuery.length > 20;

    return hasGreetingKeywords || hasComplexKeywords || isLongQuery;
  }

  /**
   * 健康检查
   */
  async healthCheck() {
    try {
      const health = await this.deepSeekService.healthCheck();
      return {
        status: 'healthy',
        deepSeek: health,
        enabled: this.isEnabled
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        enabled: this.isEnabled
      };
    }
  }
}

export default SimpleAIService;
