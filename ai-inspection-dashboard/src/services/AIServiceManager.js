/**
 * AI服务管理器
 * 统一管理DeepSeek AI服务，提供智能问答和数据查询判断功能
 */

class AIServiceManager {
  constructor() {
    this.config = {
      apiKey: 'sk-cab797574abf4288bcfaca253191565d',
      baseURL: 'https://api.deepseek.com/v1/chat/completions',
      model: 'deepseek-chat',
      timeout: 30000,
      maxRetries: 3
    }
    
    this.isAvailable = false
    this.lastHealthCheck = null
    this.healthCheckInterval = 5 * 60 * 1000 // 5分钟
  }

  /**
   * 初始化AI服务
   */
  async initialize() {
    console.log('🤖 初始化AI服务管理器...')
    await this.healthCheck()
    return this.isAvailable
  }

  /**
   * 健康检查
   */
  async healthCheck() {
    try {
      console.log('🔍 执行AI服务健康检查...')
      
      const response = await fetch(this.config.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [{ role: 'user', content: '测试连接' }],
          max_tokens: 10
        }),
        signal: AbortSignal.timeout(5000)
      })

      if (response.ok) {
        this.isAvailable = true
        this.lastHealthCheck = Date.now()
        console.log('✅ AI服务健康检查通过')
      } else {
        this.isAvailable = false
        console.warn('⚠️ AI服务健康检查失败:', response.status)
      }
    } catch (error) {
      this.isAvailable = false
      console.warn('⚠️ AI服务健康检查异常:', error.message)
    }

    return this.isAvailable
  }

  /**
   * 智能分析用户问题，判断是否需要查询数据
   */
  async analyzeUserIntent(userQuery) {
    console.log('🧠 分析用户意图:', userQuery)

    // 基础规则判断
    const basicAnalysis = this.basicIntentAnalysis(userQuery)
    
    // 如果AI服务不可用，返回基础分析
    if (!this.isAvailable) {
      console.log('⚠️ AI服务不可用，使用基础分析')
      return basicAnalysis
    }

    try {
      // 使用AI进行深度意图分析
      const aiAnalysis = await this.aiIntentAnalysis(userQuery)
      
      // 合并基础分析和AI分析结果
      return {
        ...basicAnalysis,
        ...aiAnalysis,
        confidence: Math.max(basicAnalysis.confidence, aiAnalysis.confidence || 0.5),
        source: 'ai_enhanced'
      }
    } catch (error) {
      console.warn('⚠️ AI意图分析失败，使用基础分析:', error.message)
      return basicAnalysis
    }
  }

  /**
   * 基础意图分析（规则基础）
   */
  basicIntentAnalysis(query) {
    const queryLower = query.toLowerCase()
    
    // 数据查询关键词
    const dataQueryKeywords = [
      '查询', '查看', '显示', '统计', '分析', '报告',
      '库存', '物料', '供应商', '工厂', '测试', '检验',
      '批次', '不良率', '合格率', '风险', '异常'
    ]
    
    // 咨询问答关键词
    const consultationKeywords = [
      '什么是', '如何', '为什么', '怎么', '建议', '推荐',
      '最佳实践', '标准', '规范', '流程', '方法'
    ]
    
    // 计算匹配度
    const dataQueryScore = dataQueryKeywords.filter(keyword => 
      queryLower.includes(keyword)
    ).length
    
    const consultationScore = consultationKeywords.filter(keyword => 
      queryLower.includes(keyword)
    ).length

    let intent = 'general'
    let needsDataQuery = false
    let confidence = 0.3

    if (dataQueryScore > consultationScore) {
      intent = 'data_query'
      needsDataQuery = true
      confidence = Math.min(0.8, 0.3 + dataQueryScore * 0.1)
    } else if (consultationScore > 0) {
      intent = 'consultation'
      needsDataQuery = false
      confidence = Math.min(0.7, 0.3 + consultationScore * 0.1)
    }

    return {
      intent,
      needsDataQuery,
      confidence,
      keywords: {
        dataQuery: dataQueryScore,
        consultation: consultationScore
      },
      source: 'rule_based'
    }
  }

  /**
   * AI深度意图分析
   */
  async aiIntentAnalysis(query) {
    const prompt = `
作为QMS问答助手-小Q，请分析以下用户问题的意图：

用户问题："${query}"

请判断：
1. 用户意图类型（data_query: 数据查询, consultation: 咨询问答, general: 一般对话）
2. 是否需要查询数据库数据（true/false）
3. 置信度（0-1之间的数值）
4. 关键信息提取

请以JSON格式回复：
{
  "intent": "data_query|consultation|general",
  "needsDataQuery": true|false,
  "confidence": 0.8,
  "extractedInfo": {
    "entities": ["实体1", "实体2"],
    "queryType": "库存查询|质量分析|供应商评估|等",
    "scope": "具体范围"
  },
  "reasoning": "分析理由"
}
`

    try {
      const response = await this.callDeepSeek(prompt)
      const aiResult = JSON.parse(response)
      
      console.log('🤖 AI意图分析结果:', aiResult)
      return aiResult
    } catch (error) {
      console.warn('⚠️ AI意图分析解析失败:', error.message)
      return { confidence: 0.3 }
    }
  }

  /**
   * 调用DeepSeek API
   */
  async callDeepSeek(prompt, options = {}) {
    if (!this.isAvailable) {
      throw new Error('AI服务不可用')
    }

    const requestBody = {
      model: this.config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000,
      stream: false
    }

    let lastError = null
    
    // 重试机制
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        console.log(`🔄 AI调用尝试 ${attempt}/${this.config.maxRetries}`)
        
        const response = await fetch(this.config.baseURL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
          },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(this.config.timeout)
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`API错误 ${response.status}: ${errorText}`)
        }

        const data = await response.json()
        console.log('✅ AI调用成功')
        return data.choices[0].message.content

      } catch (error) {
        lastError = error
        console.warn(`⚠️ AI调用尝试 ${attempt} 失败:`, error.message)
        
        if (attempt < this.config.maxRetries) {
          // 指数退避
          const delay = Math.pow(2, attempt) * 1000
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    // 所有重试都失败
    this.isAvailable = false
    throw lastError || new Error('AI服务调用失败')
  }

  /**
   * 生成降级响应
   */
  generateFallbackResponse(query, intent) {
    const responses = {
      data_query: `抱歉，小Q的AI增强功能暂时不可用。我已收到您关于"${query}"的查询请求，正在尝试通过基础规则为您处理...`,
      consultation: `我是小Q，您的质量管理助手。关于您的问题"${query}"，虽然AI增强功能暂时不可用，但我可以基于专业知识为您提供基础建议...`,
      general: `您好！我是小Q。我收到了您的问题"${query}"，虽然智能分析功能暂时不可用，但我会尽力为您提供帮助...`
    }

    return responses[intent] || responses.general
  }

  /**
   * 检查是否需要重新进行健康检查
   */
  shouldPerformHealthCheck() {
    if (!this.lastHealthCheck) return true
    return Date.now() - this.lastHealthCheck > this.healthCheckInterval
  }
}

// 创建单例实例
const aiServiceManager = new AIServiceManager()

export default aiServiceManager
