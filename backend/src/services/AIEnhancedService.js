/**
 * AI增强服务
 * 实现AI基于问题自主思考、查询数据、分析的完整流程
 */

import DeepSeekService from './DeepSeekService.js';
import AIDataQueryAgent from './AIDataQueryAgent.js';
import { processRealQuery } from './realDataAssistantService.js';

class AIEnhancedService {
  constructor() {
    this.deepSeekService = new DeepSeekService();
    this.queryAgent = new AIDataQueryAgent();
    this.isEnabled = true;
    this.fallbackToRules = true;
  }

  /**
   * 处理复杂查询的主入口
   */
  async processComplexQuery(userQuery) {
    console.log('🤖 AI增强服务处理查询:', userQuery);

    try {
      // 1. 判断是否需要AI增强
      const needsAI = await this.shouldUseAI(userQuery);
      console.log('🔍 是否需要AI增强:', needsAI);

      if (!needsAI) {
        console.log('📋 使用基础规则处理');
        return await this.processWithRules(userQuery);
      }

      // 2. AI思维链分析流程
      console.log('🧠 启动AI思维链分析');
      const result = await this.executeAIReasoningChain(userQuery);
      console.log('🔍 AI思维链结果:', typeof result, Object.keys(result || {}));
      return result;

    } catch (error) {
      console.error('AI增强处理失败:', error);

      if (this.fallbackToRules) {
        console.log('🔄 降级到基础规则处理');
        return await this.processWithRules(userQuery);
      } else {
        throw error;
      }
    }
  }

  /**
   * 判断是否需要使用AI增强
   */
  async shouldUseAI(userQuery) {
    if (!this.isEnabled) return false;

    // 问候语和介绍类关键词
    const greetingKeywords = [
      '你好', '您好', '介绍', '功能', '能力', '帮助', '什么', '是什么',
      'hello', 'hi', '欢迎', '开始'
    ];

    // 复杂查询的关键词
    const complexKeywords = [
      '分析', '评估', '比较', '趋势', '预测', '建议', '优化',
      '整体', '综合', '深度', '全面', '详细', '专业',
      '为什么', '如何', '怎样', '原因', '影响', '关联',
      '质量状况', '质量分析', '质量评估', '质量趋势',
      '风险评估', '改进建议', '优化方案'
    ];

    const hasGreetingKeywords = greetingKeywords.some(keyword =>
      userQuery.includes(keyword)
    );

    const hasComplexKeywords = complexKeywords.some(keyword =>
      userQuery.includes(keyword)
    );

    // 长查询通常更复杂
    const isLongQuery = userQuery.length > 20;

    // 包含多个实体的查询
    const hasMultipleEntities = (
      (userQuery.includes('工厂') ? 1 : 0) +
      (userQuery.includes('供应商') ? 1 : 0) +
      (userQuery.includes('物料') ? 1 : 0) +
      (userQuery.includes('批次') ? 1 : 0)
    ) >= 2;

    return hasGreetingKeywords || hasComplexKeywords || isLongQuery || hasMultipleEntities;
  }

  /**
   * 使用基础规则处理
   */
  async processWithRules(userQuery) {
    const result = await processRealQuery(userQuery);
    return {
      type: 'rule_based',
      reply: result,  // 统一使用reply字段
      isStreaming: false
    };
  }

  /**
   * 执行AI思维链分析
   */
  async executeAIReasoningChain(userQuery) {
    console.log('🔍 AI开始处理问题:', userQuery);

    // 判断问题类型
    const isSimpleQuestion = this.isSimpleQuestion(userQuery);

    if (isSimpleQuestion) {
      console.log('📝 简单问题，直接AI回答');
      // 对于简单问题，直接使用AI回答
      const answer = await this.deepSeekService.answerQuestion(userQuery);
      console.log('🔍 AI回答类型:', typeof answer);
      console.log('🔍 AI回答内容:', answer);
      return {
        type: 'ai_direct',
        reply: answer,
        isStreaming: false
      };
    } else {
      console.log('🔍 复杂问题，执行完整分析流程');

      // 第1步: AI分析问题，生成查询计划
      const analysis = await this.deepSeekService.analyzeQuery(userQuery);
      console.log('📋 查询计划:', analysis);

      // 第2步: 执行数据查询
      console.log('🔍 第2步: 执行数据查询');
      const queryResults = await this.executeQueryPlan(analysis.queryPlan);
      console.log('📊 查询结果:', Object.keys(queryResults));

      // 第3步: AI综合分析
      console.log('🔍 第3步: AI综合分析');
      const finalAnswer = await this.deepSeekService.answerQuestion(userQuery, queryResults);

      return {
        type: 'ai_enhanced',
        analysis: analysis,
        queryResults: queryResults,
        reply: finalAnswer,
        isStreaming: false
      };
    }
  }

  /**
   * 判断是否为简单问题
   */
  isSimpleQuestion(userQuery) {
    const simpleKeywords = [
      '你好', '您好', '介绍', '功能', '能力', '帮助', '什么', '是什么',
      'hello', 'hi', '欢迎', '开始', '谢谢', '再见'
    ];

    const isShort = userQuery.length < 15;
    const hasSimpleKeywords = simpleKeywords.some(keyword =>
      userQuery.includes(keyword)
    );

    return isShort || hasSimpleKeywords;
  }

  /**
   * 执行查询计划
   */
  async executeQueryPlan(queryPlan) {
    const results = {};
    
    if (!queryPlan || !queryPlan.steps) {
      console.warn('查询计划格式错误，使用默认查询');
      return await this.executeDefaultQueries();
    }
    
    for (const step of queryPlan.steps) {
      try {
        console.log(`执行查询步骤: ${step.id} - ${step.tool}`);
        results[step.id] = await this.queryAgent.executeQuery(step.tool, step.parameters);
      } catch (error) {
        console.error(`查询步骤失败: ${step.id}`, error);
        results[step.id] = {
          success: false,
          error: error.message,
          step: step
        };
      }
    }
    
    return results;
  }

  /**
   * 执行默认查询（当AI分析失败时）
   */
  async executeDefaultQueries() {
    console.log('执行默认查询集合');
    
    const defaultQueries = [
      { id: 'overview', tool: 'getOverallSummary', parameters: {} },
      { id: 'risk_inventory', tool: 'queryRiskInventory', parameters: {} },
      { id: 'high_defect', tool: 'queryHighDefectRate', parameters: {} }
    ];
    
    const results = {};
    for (const query of defaultQueries) {
      try {
        results[query.id] = await this.queryAgent.executeQuery(query.tool, query.parameters);
      } catch (error) {
        console.error(`默认查询失败: ${query.id}`, error);
        results[query.id] = { success: false, error: error.message };
      }
    }
    
    return results;
  }

  /**
   * 创建流式响应处理器
   */
  createStreamingHandler(analysisStream) {
    return new ReadableStream({
      start(controller) {
        const reader = analysisStream.getReader();
        
        function pump() {
          return reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            
            // 将AI输出包装为SSE格式
            const sseData = `data: ${JSON.stringify({
              type: 'ai_content',
              content: value
            })}\n\n`;
            
            controller.enqueue(sseData);
            return pump();
          });
        }
        
        return pump();
      }
    });
  }

  /**
   * 处理流式响应的Express路由处理器
   */
  async handleStreamingRequest(req, res) {
    const { query } = req.body;

    try {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      // 发送开始信号
      res.write(`data: ${JSON.stringify({
        type: 'start',
        message: '🤖 AI正在分析您的问题...'
      })}\n\n`);

      // 模拟思考过程
      await new Promise(resolve => setTimeout(resolve, 500));

      res.write(`data: ${JSON.stringify({
        type: 'start',
        message: '🧠 AI正在思考...'
      })}\n\n`);

      const result = await this.processComplexQuery(query);

      // 发送内容
      if (result.reply) {
        // 模拟流式输出，将回复分段发送
        const content = result.reply;
        const chunkSize = 10; // 每次发送10个字符

        for (let i = 0; i < content.length; i += chunkSize) {
          const chunk = content.slice(i, i + chunkSize);

          res.write(`data: ${JSON.stringify({
            type: 'content',
            content: chunk
          })}\n\n`);

          // 添加小延迟模拟打字效果
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        // 发送结束信号
        res.write(`data: ${JSON.stringify({
          type: 'end',
          message: '✅ AI回复完成'
        })}\n\n`);
      } else {
        // 如果没有回复内容，发送错误信息
        res.write(`data: ${JSON.stringify({
          type: 'content',
          content: '抱歉，我暂时无法回答您的问题。'
        })}\n\n`);

        res.write(`data: ${JSON.stringify({
          type: 'end',
          message: '✅ 查询完成'
        })}\n\n`);
      }
      
      res.end();
      
    } catch (error) {
      console.error('流式请求处理失败:', error);
      
      res.write(`data: ${JSON.stringify({
        type: 'error',
        message: '❌ 处理失败: ' + error.message
      })}\n\n`);
      
      res.end();
    }
  }

  /**
   * 健康检查
   */
  async healthCheck() {
    try {
      const deepSeekHealth = await this.deepSeekService.healthCheck();
      const queryAgentHealth = this.queryAgent.getAvailableTools().length > 0;
      
      return {
        status: deepSeekHealth.status === 'healthy' && queryAgentHealth ? 'healthy' : 'error',
        deepSeek: deepSeekHealth,
        queryAgent: {
          status: queryAgentHealth ? 'healthy' : 'error',
          toolsCount: this.queryAgent.getAvailableTools().length
        },
        isEnabled: this.isEnabled
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * 启用/禁用AI增强
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    console.log(`AI增强服务${enabled ? '已启用' : '已禁用'}`);
  }

  /**
   * 设置是否降级到规则处理
   */
  setFallbackToRules(fallback) {
    this.fallbackToRules = fallback;
    console.log(`规则降级${fallback ? '已启用' : '已禁用'}`);
  }
}

export default AIEnhancedService;
