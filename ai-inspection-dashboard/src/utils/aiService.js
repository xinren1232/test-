/**
 * AI服务模块 - DeepSeek API集成
 */

class AIService {
  constructor() {
    this.apiKey = 'sk-cab797574abf4288bcfaca253191565d';
    this.baseURL = 'https://api.deepseek.com';
    this.endpoint = '/chat/completions';
    this.model = 'deepseek-chat'; // 指向 DeepSeek-V3-0324
  }

  /**
   * 获取完整的API URL
   */
  get apiURL() {
    return `${this.baseURL}${this.endpoint}`;
  }

  /**
   * 测试API连接
   * @returns {Promise<boolean>} 连接是否成功
   */
  async testConnection() {
    try {
      console.log('🔍 测试DeepSeek API连接...');

      const response = await fetch(this.apiURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: 'Hello'
            }
          ],
          max_tokens: 10,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API错误 ${response.status}: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ DeepSeek API连接成功');
      return true;

    } catch (error) {
      console.error('❌ DeepSeek API连接失败:', error);
      return false;
    }
  }

  /**
   * 调用DeepSeek AI进行智能问答
   * @param {string} userQuery - 用户查询
   * @param {Object} businessData - 业务数据上下文
   * @returns {Promise<Object>} AI分析结果
   */
  async queryAI(userQuery, businessData) {
    try {
      console.log('🤖 调用DeepSeek AI大模型...');
      
      // 构建系统提示词
      const systemPrompt = this.buildSystemPrompt(businessData);
      
      // 构建用户提示词
      const userPrompt = this.buildUserPrompt(userQuery, businessData);
      
      const response = await fetch(this.apiURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || response.statusText;
        throw new Error(`DeepSeek API错误 ${response.status}: ${errorMessage}`);
      }

      const data = await response.json();
      console.log('✅ DeepSeek AI响应成功');

      // 检查响应格式
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('DeepSeek API响应格式异常');
      }

      // 解析AI回复
      const aiResponse = data.choices[0].message.content;
      return this.parseAIResponse(aiResponse, businessData);

    } catch (error) {
      console.error('❌ DeepSeek AI调用失败:', error);

      // 提供更友好的错误信息
      if (error.message.includes('401')) {
        throw new Error('API密钥无效，请检查DeepSeek API密钥配置');
      } else if (error.message.includes('429')) {
        throw new Error('API调用频率超限，请稍后重试');
      } else if (error.message.includes('500')) {
        throw new Error('DeepSeek服务器错误，请稍后重试');
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('网络连接失败，请检查网络连接');
      }

      throw error;
    }
  }

  /**
   * 流式调用DeepSeek AI
   * @param {string} userQuery - 用户查询
   * @param {Object} businessData - 业务数据上下文
   * @param {Function} onChunk - 流式数据回调
   * @returns {Promise<Object>} 完整的AI分析结果
   */
  async queryAIStream(userQuery, businessData, onChunk) {
    try {
      console.log('🤖 启动DeepSeek AI流式调用...');
      
      const systemPrompt = this.buildSystemPrompt(businessData);
      const userPrompt = this.buildUserPrompt(userQuery, businessData);
      
      const response = await fetch(this.apiURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
          stream: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || response.statusText;
        throw new Error(`DeepSeek API错误 ${response.status}: ${errorMessage}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                fullResponse += content;
                onChunk(content);
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }

      console.log('✅ DeepSeek AI流式响应完成');
      return this.parseAIResponse(fullResponse, businessData);
      
    } catch (error) {
      console.error('❌ DeepSeek AI流式调用失败:', error);

      // 提供更友好的错误信息
      if (error.message.includes('401')) {
        throw new Error('API密钥无效，请检查DeepSeek API密钥配置');
      } else if (error.message.includes('429')) {
        throw new Error('API调用频率超限，请稍后重试');
      } else if (error.message.includes('500')) {
        throw new Error('DeepSeek服务器错误，请稍后重试');
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('网络连接失败，请检查网络连接');
      }

      throw error;
    }
  }

  /**
   * 构建系统提示词
   */
  buildSystemPrompt(businessData) {
    const { inventoryData, testData, productionData, batchData } = businessData;
    
    return `你是IQE质量管理智能助手，专门分析质量管理数据并提供专业建议。

## 数据概况
- 库存数据: ${inventoryData?.length || 0} 条记录
- 测试数据: ${testData?.length || 0} 条记录  
- 生产数据: ${productionData?.length || 0} 条记录
- 批次数据: ${batchData?.length || 0} 条记录

## 分析能力
你具备以下分析能力：
1. 库存风险评估和预警
2. 质量问题根因分析
3. 生产效率和不良率分析
4. 供应商表现评估
5. 跨场景关联分析
6. 趋势预测和建议

## 回复格式
请按以下JSON格式回复：
{
  "analysis": {
    "title": "分析标题",
    "summary": "分析摘要",
    "keyMetrics": [
      {"name": "指标名", "value": "数值", "unit": "单位", "trend": "up/down/stable"}
    ],
    "insights": [
      {"icon": "图标", "title": "洞察标题", "description": "详细描述", "priority": "high/medium/low"}
    ],
    "recommendations": [
      {"priority": "高/中/低", "title": "建议标题", "description": "具体建议"}
    ]
  },
  "response": "自然语言回复内容"
}

## 注意事项
- 基于实际数据进行分析，不要编造数据
- 提供具体可执行的建议
- 突出关键风险和改进机会
- 使用专业的质量管理术语`;
  }

  /**
   * 构建用户提示词
   */
  buildUserPrompt(userQuery, businessData) {
    const { inventoryData, testData, productionData } = businessData;
    
    // 提取关键数据统计
    const stats = this.extractDataStats(businessData);
    
    return `用户问题: ${userQuery}

## 当前数据统计
${stats}

请基于以上实际数据，对用户问题进行深度分析，提供专业的质量管理建议。`;
  }

  /**
   * 提取数据统计信息
   */
  extractDataStats(businessData) {
    const { inventoryData, testData, productionData } = businessData;
    
    let stats = '';
    
    if (inventoryData?.length > 0) {
      const riskCount = inventoryData.filter(item => item.status === '风险').length;
      const frozenCount = inventoryData.filter(item => item.status === '冻结').length;
      stats += `\n库存统计:
- 总库存: ${inventoryData.length} 项
- 风险库存: ${riskCount} 项
- 冻结库存: ${frozenCount} 项`;
    }
    
    if (testData?.length > 0) {
      const failedCount = testData.filter(test => test.testResult === 'FAIL').length;
      const passRate = (((testData.length - failedCount) / testData.length) * 100).toFixed(1);
      stats += `\n质量统计:
- 总测试: ${testData.length} 项
- 不合格: ${failedCount} 项
- 合格率: ${passRate}%`;
    }
    
    if (productionData?.length > 0) {
      const avgDefectRate = (productionData.reduce((sum, item) => sum + (item.defectRate || 0), 0) / productionData.length).toFixed(2);
      stats += `\n生产统计:
- 总记录: ${productionData.length} 项
- 平均不良率: ${avgDefectRate}%`;
    }
    
    return stats;
  }

  /**
   * 解析AI回复
   */
  parseAIResponse(aiResponse, businessData) {
    try {
      // 尝试解析JSON格式的回复
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          type: 'ai_analysis',
          title: parsed.analysis?.title || 'AI分析结果',
          summary: parsed.analysis?.summary || '基于AI大模型的智能分析',
          keyMetrics: parsed.analysis?.keyMetrics || [],
          insights: parsed.analysis?.insights || [],
          recommendations: parsed.analysis?.recommendations || [],
          aiResponse: parsed.response || aiResponse,
          dataSources: ['DeepSeek AI大模型', '实时业务数据']
        };
      }
    } catch (e) {
      console.log('AI回复非JSON格式，使用文本解析');
    }
    
    // 如果不是JSON格式，进行文本解析
    return {
      type: 'ai_analysis',
      title: 'AI智能分析',
      summary: '基于DeepSeek AI大模型的深度分析',
      keyMetrics: this.extractMetricsFromText(aiResponse),
      insights: this.extractInsightsFromText(aiResponse),
      recommendations: this.extractRecommendationsFromText(aiResponse),
      aiResponse: aiResponse,
      dataSources: ['DeepSeek AI大模型', '实时业务数据']
    };
  }

  /**
   * 从文本中提取指标
   */
  extractMetricsFromText(text) {
    const metrics = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      // 匹配数字和百分比
      const numberMatch = line.match(/(\d+(?:\.\d+)?)\s*(%|项|个|条)/);
      if (numberMatch) {
        const value = numberMatch[1];
        const unit = numberMatch[2];
        const name = line.replace(numberMatch[0], '').replace(/[：:]/g, '').trim();
        
        if (name && name.length < 20) {
          metrics.push({
            name: name,
            value: value,
            unit: unit,
            trend: 'info'
          });
        }
      }
    }
    
    return metrics.slice(0, 5); // 最多返回5个指标
  }

  /**
   * 从文本中提取洞察
   */
  extractInsightsFromText(text) {
    const insights = [];
    const sentences = text.split(/[。！？.!?]/);
    
    for (const sentence of sentences) {
      if (sentence.length > 10 && sentence.length < 100) {
        if (sentence.includes('风险') || sentence.includes('问题') || sentence.includes('建议')) {
          insights.push({
            icon: sentence.includes('风险') ? '⚠️' : sentence.includes('问题') ? '🔍' : '💡',
            title: '关键发现',
            description: sentence.trim(),
            priority: sentence.includes('风险') ? 'high' : 'medium'
          });
        }
      }
    }
    
    return insights.slice(0, 3); // 最多返回3个洞察
  }

  /**
   * 从文本中提取建议
   */
  extractRecommendationsFromText(text) {
    const recommendations = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.includes('建议') || line.includes('应该') || line.includes('需要')) {
        recommendations.push({
          priority: line.includes('紧急') || line.includes('立即') ? '高' : '中',
          title: '改进建议',
          description: line.trim()
        });
      }
    }
    
    return recommendations.slice(0, 3); // 最多返回3个建议
  }

  /**
   * 简单的聊天对话接口
   * @param {Array} messages - 消息数组，格式: [{role: 'user'|'assistant'|'system', content: string}]
   * @param {Object} options - 可选参数
   * @returns {Promise<Object>} AI回复
   */
  async chat(messages, options = {}) {
    try {
      console.log('🤖 发送聊天请求到DeepSeek API');
      console.log('📝 消息数量:', messages.length);

      const requestBody = {
        model: this.model,
        messages: messages,
        max_tokens: options.max_tokens || 2000,
        temperature: options.temperature || 0.7,
        stream: options.stream || false
      };

      const response = await fetch(this.apiURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API错误 ${response.status}: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ DeepSeek API响应成功');

      return data;

    } catch (error) {
      console.error('❌ 聊天请求失败:', error);
      throw error;
    }
  }

  /**
   * 增强的聊天接口 - 支持工具调用
   * @param {Array} messages - 消息数组
   * @param {Object} options - 选项
   * @returns {Promise<Object>} 增强的AI回复
   */
  async enhancedChat(messages, options = {}) {
    try {
      console.log('🚀 开始增强AI对话...');

      // 分析用户意图，判断是否需要工具调用
      const lastMessage = messages[messages.length - 1];
      const toolAnalysis = await this.analyzeToolNeeds(lastMessage.content);

      let finalResponse = null;
      let toolResults = [];

      // 如果需要工具调用，先执行工具
      if (toolAnalysis.needsTools && toolAnalysis.tools.length > 0) {
        console.log('🔧 检测到需要工具调用:', toolAnalysis.tools);

        // 动态导入工具服务
        const { toolService } = await import('./toolService.js');

        // 执行工具调用
        for (const toolCall of toolAnalysis.tools) {
          try {
            const toolResult = await toolService.executeTool(toolCall.name, toolCall.parameters);
            toolResults.push(toolResult);
            console.log(`✅ 工具 ${toolCall.name} 执行成功`);
          } catch (error) {
            console.warn(`⚠️ 工具 ${toolCall.name} 执行失败:`, error.message);
            toolResults.push({
              tool: toolCall.name,
              success: false,
              error: error.message
            });
          }
        }

        // 将工具结果添加到对话上下文
        const toolContext = this.formatToolResults(toolResults);
        const enhancedMessages = [
          ...messages,
          {
            role: 'system',
            content: `工具调用结果：\n${toolContext}\n\n请基于以上工具调用结果回答用户的问题。`
          }
        ];

        // 使用增强的上下文调用AI
        finalResponse = await this.chat(enhancedMessages, options);
      } else {
        // 不需要工具调用，直接对话
        finalResponse = await this.chat(messages, options);
      }

      return {
        ...finalResponse,
        enhanced: true,
        tool_calls: toolResults,
        tool_analysis: toolAnalysis
      };

    } catch (error) {
      console.error('❌ 增强对话失败:', error);
      // 降级到普通对话
      return await this.chat(messages, options);
    }
  }

  /**
   * 分析用户消息，判断是否需要工具调用
   * @param {string} userMessage - 用户消息
   * @returns {Promise<Object>} 工具分析结果
   */
  async analyzeToolNeeds(userMessage) {
    const analysis = {
      needsTools: false,
      tools: [],
      confidence: 0
    };

    const message = userMessage.toLowerCase();

    // 搜索相关关键词
    const searchKeywords = ['搜索', '查找', '查询', '最新', '新闻', '信息', '什么是', '介绍'];
    if (searchKeywords.some(keyword => message.includes(keyword))) {
      analysis.needsTools = true;
      analysis.tools.push({
        name: 'web_search',
        parameters: {
          query: userMessage,
          engine: 'duckduckgo'
        }
      });
      analysis.confidence += 0.3;
    }

    // 时间相关关键词
    const timeKeywords = ['时间', '现在几点', '当前时间', '今天', '日期'];
    if (timeKeywords.some(keyword => message.includes(keyword))) {
      analysis.needsTools = true;
      analysis.tools.push({
        name: 'get_time',
        parameters: {}
      });
      analysis.confidence += 0.4;
    }

    // 计算相关关键词
    const calcKeywords = ['计算', '算', '等于', '+', '-', '*', '/', '数学'];
    const hasNumbers = /\d/.test(message);
    const hasMathOperators = /[+\-*/=]/.test(message);

    if ((calcKeywords.some(keyword => message.includes(keyword)) || hasMathOperators) && hasNumbers) {
      analysis.needsTools = true;
      // 提取数学表达式
      const mathExpression = this.extractMathExpression(userMessage);
      if (mathExpression) {
        analysis.tools.push({
          name: 'calculate',
          parameters: {
            expression: mathExpression
          }
        });
        analysis.confidence += 0.5;
      }
    }

    // 数据分析相关关键词
    const dataKeywords = ['分析', '统计', '数据', '库存', '生产', '测试', '质量', '报告'];
    if (dataKeywords.some(keyword => message.includes(keyword))) {
      analysis.needsTools = true;

      // 判断数据类型
      let dataType = 'inventory'; // 默认
      if (message.includes('生产')) dataType = 'production';
      else if (message.includes('测试')) dataType = 'testing';
      else if (message.includes('批次')) dataType = 'batch';

      analysis.tools.push({
        name: 'analyze_data',
        parameters: {
          data_type: dataType
        }
      });
      analysis.confidence += 0.3;
    }

    return analysis;
  }

  /**
   * 从用户消息中提取数学表达式
   * @param {string} message - 用户消息
   * @returns {string|null} 数学表达式
   */
  extractMathExpression(message) {
    // 简单的数学表达式提取
    const mathPattern = /[\d+\-*/().\s]+/g;
    const matches = message.match(mathPattern);

    if (matches && matches.length > 0) {
      // 找到最长的匹配项
      const longestMatch = matches.reduce((a, b) => a.length > b.length ? a : b);
      return longestMatch.trim();
    }

    return null;
  }

  /**
   * 格式化工具调用结果
   * @param {Array} toolResults - 工具调用结果数组
   * @returns {string} 格式化的结果文本
   */
  formatToolResults(toolResults) {
    if (!toolResults || toolResults.length === 0) {
      return '无工具调用结果';
    }

    let formatted = '';

    toolResults.forEach((result, index) => {
      formatted += `\n=== 工具 ${index + 1}: ${result.tool} ===\n`;

      if (result.success) {
        formatted += `状态: ✅ 成功\n`;
        formatted += `摘要: ${result.summary}\n`;

        if (result.data) {
          if (result.tool === 'web_search' && result.data.results) {
            formatted += `搜索结果:\n`;
            result.data.results.forEach((item, i) => {
              formatted += `${i + 1}. ${item.title}\n   ${item.snippet}\n   ${item.url}\n\n`;
            });
          } else if (result.tool === 'analyze_data' && result.data.analysis) {
            formatted += `数据分析:\n`;
            formatted += JSON.stringify(result.data.analysis, null, 2);
          } else {
            formatted += `数据: ${JSON.stringify(result.data, null, 2)}\n`;
          }
        }
      } else {
        formatted += `状态: ❌ 失败\n`;
        formatted += `错误: ${result.error}\n`;
      }

      formatted += '\n';
    });

    return formatted;
  }
}

// 创建AI服务实例
export const aiService = new AIService();

// 导出默认实例
export default aiService;
