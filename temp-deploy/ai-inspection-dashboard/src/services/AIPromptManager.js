/**
 * AI Prompt管理器 - 智能分析流程控制
 * 实现数据驱动的AI分析和工具调用决策
 */

export class AIPromptManager {
  constructor() {
    this.systemPrompt = this.buildSystemPrompt()
    this.analysisTemplates = this.initAnalysisTemplates()
  }

  /**
   * 构建系统提示词
   */
  buildSystemPrompt() {
    return `你是IQE质量管理系统的AI智能助手，专门负责质量管理数据分析和问答。

## 你的核心能力：
1. **数据分析专家** - 深度分析库存、生产、检测数据
2. **质量管理顾问** - 提供专业的质量改进建议
3. **可视化专家** - 智能判断何时需要生成图表
4. **问题诊断师** - 识别质量风险和异常模式

## 工作流程：
1. 理解用户问题的核心需求
2. 分析提供的数据内容和质量
3. 进行专业的数据分析和解读
4. 判断是否需要调用工具（如图表生成）
5. 提供结构化的分析结果和建议

## 回复格式要求：
- 使用Markdown格式组织内容
- 包含清晰的标题和分段
- 重要数据用**粗体**标记
- 使用表格展示对比数据
- 用列表组织要点信息

## 工具调用判断：
当遇到以下情况时，明确说明需要生成图表：
- 趋势分析：时间序列数据 → 建议生成折线图
- 分布分析：分类统计数据 → 建议生成饼图
- 对比分析：多维度比较 → 建议生成柱状图
- 关联分析：多指标评估 → 建议生成雷达图

请始终保持专业、准确、有用的回答风格。`
  }

  /**
   * 初始化分析模板
   */
  initAnalysisTemplates() {
    return {
      // 库存分析模板
      inventory: {
        title: '库存分析报告',
        sections: ['概况总结', '关键指标', '风险评估', '优化建议'],
        chartSuggestions: ['分布图', '趋势图', '对比图']
      },
      
      // 质量分析模板
      quality: {
        title: '质量分析报告', 
        sections: ['质量概况', '问题识别', '根因分析', '改进措施'],
        chartSuggestions: ['趋势图', '帕累托图', '控制图']
      },
      
      // 生产分析模板
      production: {
        title: '生产分析报告',
        sections: ['生产概况', '效率分析', '质量表现', '优化方向'],
        chartSuggestions: ['效率图', '质量图', '对比图']
      },
      
      // 综合分析模板
      comprehensive: {
        title: '综合分析报告',
        sections: ['整体概况', '关键发现', '深度分析', '战略建议'],
        chartSuggestions: ['仪表盘', '多维图', '关联图']
      }
    }
  }

  /**
   * 构建分析提示词
   * @param {string} question - 用户问题
   * @param {Object} dataAnalysis - 数据源分析结果
   * @param {Object} queryResults - 查询结果
   * @returns {string} 完整的分析提示词
   */
  buildAnalysisPrompt(question, dataAnalysis, queryResults) {
    const prompt = `${this.systemPrompt}

## 当前分析任务：
**用户问题**: ${question}

## 数据源分析结果：
- **涉及数据源**: ${dataAnalysis.involvedSources.join(', ')}
- **查询策略**: ${dataAnalysis.queryStrategy}
- **提取实体**: ${JSON.stringify(dataAnalysis.extractedEntities, null, 2)}
- **置信度**: ${dataAnalysis.confidence}%

## 查询到的数据：
${this.formatQueryResults(queryResults)}

## 分析要求：
1. **深度分析**：基于提供的数据进行专业分析
2. **结构化回复**：使用Markdown格式，包含清晰的标题和分段
3. **数据洞察**：识别关键模式、趋势和异常
4. **实用建议**：提供可操作的改进建议
5. **工具建议**：如果数据适合可视化，明确说明需要什么类型的图表

请开始你的专业分析：`

    return prompt
  }

  /**
   * 格式化查询结果为提示词
   */
  formatQueryResults(queryResults) {
    if (!queryResults || queryResults.totalRecords === 0) {
      return '**数据状态**: 未找到相关数据\n**建议**: 检查数据源或调整查询条件'
    }

    let formatted = `**总记录数**: ${queryResults.totalRecords}\n\n`
    
    Object.entries(queryResults.sources).forEach(([source, data]) => {
      formatted += `### ${source.toUpperCase()}数据 (${data.length}条记录)\n`
      
      if (data.length > 0) {
        // 显示前几条记录的关键字段
        const sample = data.slice(0, 3)
        formatted += '```json\n'
        formatted += JSON.stringify(sample, null, 2)
        formatted += '\n```\n\n'
        
        // 添加统计信息
        formatted += this.generateDataStatistics(data, source)
      }
    })

    // 添加汇总信息
    if (queryResults.summary) {
      formatted += `### 数据汇总\n`
      formatted += `- **数据质量**: ${queryResults.summary.dataQuality}\n`
      formatted += `- **关键发现**: \n`
      queryResults.summary.keyFindings?.forEach(finding => {
        formatted += `  - ${finding}\n`
      })
    }

    return formatted
  }

  /**
   * 生成数据统计信息
   */
  generateDataStatistics(data, source) {
    let stats = ''
    
    if (source === 'inventory') {
      const statusCounts = this.countByField(data, 'status')
      const factoryCounts = this.countByField(data, 'factory')
      
      stats += `**状态分布**: ${Object.entries(statusCounts).map(([k,v]) => `${k}:${v}`).join(', ')}\n`
      stats += `**工厂分布**: ${Object.entries(factoryCounts).map(([k,v]) => `${k}:${v}`).join(', ')}\n`
    }
    
    if (source === 'production') {
      const avgDefectRate = this.calculateAverage(data, 'defectRate')
      const factoryCounts = this.countByField(data, 'factory')
      
      stats += `**平均不良率**: ${avgDefectRate.toFixed(2)}%\n`
      stats += `**工厂分布**: ${Object.entries(factoryCounts).map(([k,v]) => `${k}:${v}`).join(', ')}\n`
    }
    
    if (source === 'inspection') {
      const resultCounts = this.countByField(data, 'testResult')
      const passRate = resultCounts['PASS'] ? (resultCounts['PASS'] / data.length * 100).toFixed(1) : 0
      
      stats += `**测试结果**: ${Object.entries(resultCounts).map(([k,v]) => `${k}:${v}`).join(', ')}\n`
      stats += `**合格率**: ${passRate}%\n`
    }
    
    return stats + '\n'
  }

  /**
   * 按字段统计数量
   */
  countByField(data, field) {
    const counts = {}
    data.forEach(item => {
      const value = item[field] || 'Unknown'
      counts[value] = (counts[value] || 0) + 1
    })
    return counts
  }

  /**
   * 计算平均值
   */
  calculateAverage(data, field) {
    const values = data.map(item => parseFloat(item[field]) || 0)
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }

  /**
   * 分析AI回复，判断是否需要工具调用
   * @param {string} aiResponse - AI回复内容
   * @param {Object} context - 上下文信息
   * @returns {Object} 工具调用建议
   */
  analyzeToolRequirements(aiResponse, context) {
    const toolSuggestions = {
      needsChart: false,
      chartType: null,
      chartTitle: '',
      chartDescription: '',
      confidence: 0
    }

    const responseLower = aiResponse.toLowerCase()

    // 检测图表需求关键词
    const chartKeywords = {
      line: ['趋势', '变化', '时间', '发展', '走势'],
      bar: ['对比', '比较', '排名', '分布', '统计'],
      pie: ['占比', '比例', '分布', '构成', '份额'],
      radar: ['评估', '多维', '综合', '指标', '评价']
    }

    let maxScore = 0
    let bestChartType = null

    Object.entries(chartKeywords).forEach(([type, keywords]) => {
      const score = keywords.reduce((sum, keyword) => {
        return sum + (responseLower.includes(keyword) ? 1 : 0)
      }, 0)
      
      if (score > maxScore) {
        maxScore = score
        bestChartType = type
      }
    })

    // 判断是否需要图表
    if (maxScore > 0 || responseLower.includes('图表') || responseLower.includes('可视化')) {
      toolSuggestions.needsChart = true
      toolSuggestions.chartType = bestChartType || 'bar'
      toolSuggestions.confidence = Math.min(maxScore * 25, 100)
      
      // 生成图表标题和描述
      toolSuggestions.chartTitle = this.generateChartTitle(context, toolSuggestions.chartType)
      toolSuggestions.chartDescription = this.generateChartDescription(context, toolSuggestions.chartType)
    }

    return toolSuggestions
  }

  /**
   * 生成图表标题
   */
  generateChartTitle(context, chartType) {
    const { question, dataAnalysis } = context
    const sources = dataAnalysis.involvedSources
    
    if (sources.includes('inventory')) {
      return chartType === 'pie' ? '库存状态分布' : '库存数据分析'
    }
    if (sources.includes('production')) {
      return chartType === 'line' ? '生产质量趋势' : '生产数据分析'
    }
    if (sources.includes('inspection')) {
      return chartType === 'pie' ? '检测结果分布' : '质量检测分析'
    }
    
    return '数据分析图表'
  }

  /**
   * 生成图表描述
   */
  generateChartDescription(context, chartType) {
    const descriptions = {
      line: '展示数据随时间的变化趋势',
      bar: '对比不同类别的数据表现',
      pie: '显示各部分在整体中的占比',
      radar: '多维度综合评估分析'
    }
    
    return descriptions[chartType] || '数据可视化分析'
  }

  /**
   * 构建流式回复的分段提示
   */
  buildStreamingPrompts(analysisPrompt) {
    return [
      {
        phase: 'understanding',
        prompt: `${analysisPrompt}\n\n请先简要说明你对问题的理解和分析思路（50字以内）：`,
        maxTokens: 100
      },
      {
        phase: 'analysis',
        prompt: `${analysisPrompt}\n\n现在请进行详细的数据分析，使用Markdown格式：`,
        maxTokens: 1500
      },
      {
        phase: 'recommendations',
        prompt: `基于以上分析，请提供具体的改进建议和下一步行动计划：`,
        maxTokens: 500
      }
    ]
  }
}

// 创建单例实例
export const aiPromptManager = new AIPromptManager()
export default aiPromptManager
