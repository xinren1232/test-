/**
 * DeepSeek AI服务
 * 集成DeepSeek API，实现流式AI分析响应
 */

import fetch from 'node-fetch';

class DeepSeekService {
  constructor(apiKey = 'sk-cab797574abf4288bcfaca253191565d') {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.deepseek.com/v1';
    this.model = 'deepseek-chat';
    this.defaultParams = {
      temperature: 0.7,
      max_tokens: 4096,
      top_p: 0.95
    };
  }

  /**
   * 分析用户查询，生成查询计划
   */
  async analyzeQuery(userQuery) {
    const prompt = this.buildAnalysisPrompt(userQuery);

    try {
      const response = await this.callDeepSeek(prompt, false);
      return this.parseAnalysisResponse(response);
    } catch (error) {
      console.error('查询分析失败:', error);
      throw new Error('AI查询分析失败: ' + error.message);
    }
  }

  /**
   * 直接回答用户问题
   */
  async answerQuestion(userQuery, contextData = null) {
    const prompt = this.buildAnswerPrompt(userQuery, contextData);

    try {
      const response = await this.callDeepSeek(prompt, false);
      // 提取实际的文本内容
      return response.choices[0].message.content;
    } catch (error) {
      console.error('AI回答失败:', error);
      throw new Error('AI回答失败: ' + error.message);
    }
  }

  /**
   * 构建查询分析提示词
   */
  buildAnalysisPrompt(userQuery) {
    return `
# IQE智能查询分析器 - 物料数据查询规划

## 🎯 **分析任务**
作为IQE质量智能助手的查询分析器，你需要深度理解用户的物料监控需求，制定精准的数据查询和分析计划。

**用户问题**: "${userQuery}"

## 🛠️ **可用数据查询工具矩阵**

### 📦 **库存监控工具**
- **queryInventoryByFactory**: 按工厂维度查询库存状态，支持多工厂对比分析
- **queryInventoryBySupplier**: 按供应商维度查询库存分布，评估供应商依赖度
- **queryInventoryByMaterial**: 按物料代码查询具体物料库存详情
- **queryRiskInventory**: 专门查询风险状态库存（临期、异常、预警）
- **queryFrozenInventory**: 查询冻结状态库存及冻结原因分析

### ⚙️ **生产监控工具**
- **queryProductionByFactory**: 按工厂查询生产数据，分析产能和效率
- **queryProductionByProject**: 按项目查询生产进度和质量状况
- **queryHighDefectRate**: 专门查询高不良率生产记录，识别质量问题

### 🔬 **质量检测工具**
- **queryFailedTests**: 查询测试失败记录，分析失败模式和原因
- **queryTestsByProject**: 按项目查询测试结果，评估项目质量水平

### 📊 **综合分析工具**
- **getFactorySummary**: 工厂级别数据汇总，提供全面工厂画像
- **getSupplierSummary**: 供应商绩效汇总，支持供应商评估
- **getOverallSummary**: 系统级数据总览，提供宏观质量态势
- **traceBatch**: 批次全链路追溯，支持质量问题根因分析

## 🧠 **智能分析策略**

### 需求类型识别
1. **基础查询**: 单一维度的数据查询（如某工厂库存、某供应商状态）
2. **状态分析**: 关注异常状态的专项分析（如风险库存、高不良率）
3. **趋势分析**: 时间序列数据的变化趋势和预测
4. **对比分析**: 多维度、多对象的横向或纵向对比
5. **根因分析**: 基于批次追溯的深度问题分析
6. **综合评估**: 跨场景的全面质量评估和决策支持

### 查询优先级策略
- **数据完整性优先**: 优先选择能提供完整信息的查询工具
- **分析深度优先**: 根据问题复杂度选择合适的分析深度
- **效率优化**: 避免重复查询，合理安排查询顺序

## 📋 **输出要求**
请基于用户问题分析，生成结构化的查询计划JSON：

{
  "problemType": "问题类型分类",
  "analysisScope": "分析范围和目标描述",
  "materialFocus": "重点关注的物料类型或范围",
  "qualityDimensions": ["质量关注维度列表"],
  "requiredData": ["需要的数据类型"],
  "queryPlan": {
    "priority": "查询优先级(high/medium/low)",
    "steps": [
      {
        "id": "step1",
        "tool": "工具名称",
        "parameters": {"参数名": "参数值"},
        "purpose": "查询目的和预期结果",
        "dataScope": "数据范围描述"
      }
    ]
  },
  "analysisStrategy": "分析策略描述",
  "expectedInsights": ["预期分析洞察点"],
  "visualizationNeeds": "可视化需求描述"
}

**重要**: 只返回JSON格式，不要包含其他文本内容。
`;
  }

  /**
   * 构建回答提示词
   */
  buildAnswerPrompt(userQuery, contextData = null) {
    return `你是IQE质量智能助手，专注于物料质量监控与分析。

用户问题："${userQuery}"

回答要求：
1. 简洁明了，控制在150字以内
2. 结构清晰，重点突出
3. 提供实用建议
4. 避免冗长介绍

${contextData ? `相关数据：${contextData}` : ''}

请直接回答用户问题：`;
  }

  /**
   * 解析分析响应
   */
  parseAnalysisResponse(response) {
    try {
      const content = response.choices[0].message.content;
      // 提取JSON部分
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('无法解析AI分析结果');
      }
    } catch (error) {
      console.error('解析AI分析结果失败:', error);
      throw new Error('AI分析结果格式错误');
    }
  }

  /**
   * 生成流式分析响应
   */
  async generateStreamingAnalysis(userQuery, queryResults) {
    const prompt = this.buildAnalysisPrompt2(userQuery, queryResults);
    
    try {
      return await this.callDeepSeek(prompt, true);
    } catch (error) {
      console.error('流式分析失败:', error);
      throw new Error('AI流式分析失败: ' + error.message);
    }
  }

  /**
   * 构建综合分析提示词
   */
  buildAnalysisPrompt2(userQuery, queryResults) {
    const dataContext = this.formatQueryResults(queryResults);

    return `
# IQE质量智能分析引擎 - 深度数据洞察报告

## 🎯 **分析任务概述**
基于IQE质量管理体系的专业标准，对物料全生命周期数据进行深度分析，为质量决策提供科学依据。

**用户问题**: "${userQuery}"

## 📊 **数据基础**
${dataContext}

## 🔬 **专业分析框架**

### 1️⃣ **数据质量评估**
- **数据完整性**: 评估数据覆盖度和缺失情况
- **数据一致性**: 检查跨系统数据的一致性
- **数据时效性**: 分析数据的时间有效性

### 2️⃣ **物料状态分析**
- **库存健康度**: 基于安全库存、周转率等指标评估
- **质量合格率**: 计算各环节的质量通过率
- **风险等级评估**: 识别高风险物料和批次

### 3️⃣ **供应链绩效分析**
- **供应商质量表现**: 基于不良率、及时交付率等指标
- **工厂生产效率**: 分析产能利用率和质量稳定性
- **批次追溯分析**: 识别质量问题的根本原因

### 4️⃣ **趋势预测与预警**
- **质量趋势判断**: 基于历史数据预测质量走向
- **风险预警机制**: 识别潜在质量风险点
- **改进机会识别**: 发现质量提升的关键领域

## 📈 **分析输出标准**

### 🎯 **执行摘要** (Executive Summary)
- 核心发现的3-5个关键点
- 主要风险和机会总结
- 优先级行动建议

### 📊 **详细分析** (Detailed Analysis)
- **数据概况**: 样本量、时间范围、覆盖范围
- **关键指标**: 具体数值、百分比、对比基准
- **异常识别**: 偏离正常范围的数据点
- **模式发现**: 数据中的规律和趋势

### ⚠️ **风险评估** (Risk Assessment)
- **高风险项**: 需要立即关注的问题
- **中风险项**: 需要监控的潜在问题
- **风险影响**: 对质量、成本、交期的影响评估

### 🎯 **改进建议** (Improvement Recommendations)
- **短期行动**: 1-3个月内可执行的改进措施
- **中期规划**: 3-12个月的系统性改进
- **长期战略**: 超过1年的战略性质量提升

### 📊 **可视化建议** (Visualization Recommendations)
- 推荐的图表类型和关键指标
- 仪表板设计建议
- 监控预警设置建议

## 🔧 **分析质量要求**

✅ **数据驱动**: 所有结论必须有数据支撑，标注具体数值
✅ **专业准确**: 使用质量管理专业术语和标准
✅ **结构清晰**: 采用标题层次和要点列表
✅ **实用导向**: 提供可执行的具体建议
✅ **风险敏感**: 主动识别和强调风险点
✅ **量化表达**: 尽可能使用数字和百分比
✅ **对比分析**: 提供基准对比和历史对比

现在请基于以上专业框架，对用户问题进行深度分析：
`;
  }

  /**
   * 格式化查询结果为文本
   */
  formatQueryResults(queryResults) {
    let formatted = '';
    
    for (const [stepId, result] of Object.entries(queryResults)) {
      if (result.success) {
        formatted += `\n=== ${stepId} (${result.tool}) ===\n`;
        
        if (result.structuredData) {
          const data = result.structuredData;
          
          if (data.summary) {
            formatted += `摘要: ${data.summary}\n`;
          }
          
          if (data.items && data.items.length > 0) {
            formatted += `条目数量: ${data.items.length}\n`;
            data.items.slice(0, 5).forEach((item, index) => {
              formatted += `  ${index + 1}. ${item.name || '未知'}\n`;
              if (item.values) {
                formatted += `     详情: ${item.values.join(', ')}\n`;
              }
            });
            if (data.items.length > 5) {
              formatted += `  ... 还有 ${data.items.length - 5} 条记录\n`;
            }
          }
          
          if (data.statistics) {
            formatted += `统计信息: ${JSON.stringify(data.statistics)}\n`;
          }
        }
        
        formatted += '\n';
      } else {
        formatted += `\n=== ${stepId} (失败) ===\n`;
        formatted += `错误: ${result.error}\n\n`;
      }
    }
    
    return formatted;
  }

  /**
   * 调用DeepSeek API
   */
  async callDeepSeek(prompt, streaming = false) {
    const requestBody = {
      model: this.model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      stream: streaming,
      ...this.defaultParams
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API调用失败: ${response.status} ${errorText}`);
    }

    if (streaming) {
      return this.handleStreamingResponse(response);
    } else {
      return await response.json();
    }
  }

  /**
   * 处理流式响应
   */
  async handleStreamingResponse(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    return new ReadableStream({
      start(controller) {
        function pump() {
          return reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                
                if (data === '[DONE]') {
                  controller.close();
                  return;
                }
                
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices[0]?.delta?.content;
                  
                  if (content) {
                    controller.enqueue(content);
                  }
                } catch (e) {
                  // 忽略解析错误，继续处理下一行
                  console.warn('解析流式数据失败:', e.message);
                }
              }
            }
            
            return pump();
          });
        }
        
        return pump();
      }
    });
  }

  /**
   * 简单的非流式查询（用于快速测试）
   */
  async simpleQuery(question) {
    const prompt = `
作为IQE质量智能助手，请回答以下问题：

${question}

请提供专业、准确的回答。
`;

    try {
      const response = await this.callDeepSeek(prompt, false);
      return response.choices[0].message.content;
    } catch (error) {
      console.error('简单查询失败:', error);
      throw error;
    }
  }

  /**
   * 健康检查
   */
  async healthCheck() {
    try {
      const response = await this.simpleQuery('你好，请简单介绍一下你的功能。');
      return {
        status: 'healthy',
        message: 'DeepSeek服务正常',
        response: response.substring(0, 100) + '...'
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'DeepSeek服务异常',
        error: error.message
      };
    }
  }
}

export default DeepSeekService;
