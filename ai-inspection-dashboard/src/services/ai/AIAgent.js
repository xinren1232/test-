/**
 * AI智能体系统 - 将用户自然语言输入转换为系统功能调用
 * 支持Function Calling机制，实现智能业务处理
 */

import { AIService } from './AIService';
import dataService from '../DataService';

// 可用函数列表
const AVAILABLE_FUNCTIONS = {
  // 查询物料信息
  queryMaterial: {
    name: 'queryMaterial',
    description: '查询物料信息，可通过编码、名称等条件查询',
    parameters: {
      code: '物料编码',
      name: '物料名称',
      type: '物料类型',
      status: '物料状态'
    },
    handler: async (params) => {
      return await dataService.getMaterials(params);
    }
  },

  // 查询物料详情
  getMaterialDetail: {
    name: 'getMaterialDetail',
    description: '查询物料详细信息，包括质检结果、测试数据等',
    parameters: {
      materialCode: '物料编码'
    },
    handler: async (params) => {
      return await dataService.getMaterialDetail(params.materialCode);
    }
  },

  // 查询不合格物料
  queryUnqualifiedMaterials: {
    name: 'queryUnqualifiedMaterials',
    description: '查询不合格物料列表',
    parameters: {},
    handler: async () => {
      return await dataService.getUnqualifiedMaterials();
    }
  },

  // 获取质量统计数据
  getQualityStatistics: {
    name: 'getQualityStatistics',
    description: '获取质量统计数据，可指定统计周期',
    parameters: {
      period: '统计周期(daily|weekly|monthly)'
    },
    handler: async (params) => {
      return await dataService.getQualityStatistics(params.period || 'daily');
    }
  },

  // 查询质量异常
  queryQualityExceptions: {
    name: 'queryQualityExceptions',
    description: '查询质量异常记录',
    parameters: {
      materialCode: '物料编码',
      status: '处理状态',
      severity: '严重程度'
    },
    handler: async (params) => {
      return await dataService.getQualityExceptions(params);
    }
  }
};

// 智能体类
export class AIAgent {
  constructor() {
    this.systemPrompt = `你是IQE质量智能助手，一个专业的质量检验分析专家。
你将帮助用户完成质量数据查询、分析和诊断工作。
请使用简洁专业的语言回答问题，合理调用系统功能，提供实用的质量改进建议。
当数据不足时，可请求用户提供更多信息。`;

    this.functionDescriptions = Object.values(AVAILABLE_FUNCTIONS).map(fn => ({
      name: fn.name,
      description: fn.description,
      parameters: fn.parameters
    }));
  }

  /**
   * 处理用户查询
   * @param {string} userQuery 用户查询文本
   * @param {Array} history 对话历史
   * @returns {Promise<Object>} 处理结果
   */
  async processQuery(userQuery, history = []) {
    try {
      console.log('[AIAgent] 处理用户查询:', userQuery);
      
      // 构建消息历史
      const messages = [
        { role: 'system', content: this.systemPrompt }
      ];
      
      // 添加对话历史
      if (history && history.length > 0) {
        messages.push(...history.slice(-6)); // 只保留最近的6条对话
      }
      
      // 添加用户当前查询
      messages.push({ role: 'user', content: userQuery });
      
      // 调用AI服务
      const aiResponse = await AIService.invoke(messages, {
        functions: this.functionDescriptions,
        function_call: 'auto'
      });
      
      console.log('[AIAgent] AI响应:', aiResponse);
      
      // 处理函数调用
      if (aiResponse.function_call) {
        const { name, arguments: args } = aiResponse.function_call;
        console.log(`[AIAgent] 调用函数: ${name}, 参数:`, args);
        
        const functionToCall = AVAILABLE_FUNCTIONS[name];
        if (!functionToCall) {
          throw new Error(`未知函数: ${name}`);
        }
        
        // 解析函数参数
        let parsedArgs;
        try {
          parsedArgs = JSON.parse(args);
        } catch (error) {
          parsedArgs = {};
          console.error('[AIAgent] 解析函数参数失败:', error);
        }
        
        // 执行函数
        const functionResult = await functionToCall.handler(parsedArgs);
        console.log('[AIAgent] 函数执行结果:', functionResult);
        
        // 将函数结果发送给AI进行解释
        messages.push({
          role: 'assistant',
          content: null,
          function_call: {
            name,
            arguments: args
          }
        });
        
        messages.push({
          role: 'function',
          name,
          content: JSON.stringify(functionResult)
        });
        
        // 获取AI对函数结果的解释
        const finalResponse = await AIService.invoke(messages);
        console.log('[AIAgent] 最终响应:', finalResponse);
        
        return {
          content: finalResponse.content || '抱歉，无法理解数据结果。',
          data: functionResult.data,
          functionCall: {
            name,
            args: parsedArgs,
            result: functionResult
          }
        };
      }
      
      // 直接返回AI回复
      return {
        content: aiResponse.content,
        data: null,
        functionCall: null
      };
    } catch (error) {
      console.error('[AIAgent] 处理查询失败:', error);
      return {
        content: '抱歉，处理您的请求时出现了问题，请稍后重试。',
        error: error.message,
        data: null,
        functionCall: null
      };
    }
  }
}

// 创建单例实例
export const aiAgent = new AIAgent();

export default aiAgent; 