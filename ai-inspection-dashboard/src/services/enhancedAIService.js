/**
 * 增强AI服务 - 集成联网搜索功能
 * 为AI问答提供实时网络信息支持
 */

import webSearchService from './webSearchService.js'

// AI配置
const AI_CONFIG = {
  baseURL: 'https://api.deepseek.com',
  endpoint: '/chat/completions',
  apiKey: 'sk-cab797574abf4288bcfaca253191565d',
  model: 'deepseek-chat'
}

class EnhancedAIService {
  constructor() {
    this.conversationHistory = new Map()
    this.searchCache = new Map()
    this.webSearchEnabled = true
  }

  /**
   * 智能问答 - 集成联网搜索
   * @param {string} userQuery - 用户查询
   * @param {Object} options - 选项
   * @returns {Promise<Object>} AI回答结果
   */
  async intelligentQuery(userQuery, options = {}) {
    const {
      sessionId = 'default',
      enableWebSearch = true,
      searchThreshold = 0.7, // 触发联网搜索的相关性阈值
      maxSearchResults = 5,
      businessContext = null
    } = options

    console.log('🤖 开始智能问答处理:', userQuery)

    try {
      // 1. 分析查询意图
      const queryAnalysis = await this.analyzeQuery(userQuery)
      console.log('🔍 查询分析结果:', queryAnalysis)

      // 2. 判断是否需要联网搜索
      const needsWebSearch = enableWebSearch && 
                            this.webSearchEnabled && 
                            this.shouldSearchWeb(queryAnalysis, userQuery)

      let webSearchResults = null
      if (needsWebSearch) {
        console.log('🌐 触发联网搜索')
        webSearchResults = await this.performWebSearch(userQuery, queryAnalysis)
      }

      // 3. 构建增强的提示词
      const enhancedPrompt = this.buildEnhancedPrompt(
        userQuery, 
        queryAnalysis, 
        webSearchResults, 
        businessContext
      )

      // 4. 调用AI生成回答
      const aiResponse = await this.callAIWithEnhancedPrompt(enhancedPrompt, sessionId)

      // 5. 后处理和格式化
      const finalResponse = this.formatFinalResponse(
        aiResponse, 
        webSearchResults, 
        queryAnalysis
      )

      return {
        success: true,
        response: finalResponse.content,
        metadata: {
          queryAnalysis,
          webSearchUsed: needsWebSearch,
          webSearchResults: webSearchResults?.results?.length || 0,
          sources: webSearchResults?.sources || [],
          responseTime: Date.now() - (options.startTime || Date.now()),
          sessionId
        }
      }

    } catch (error) {
      console.error('❌ 智能问答处理失败:', error)
      return {
        success: false,
        error: error.message,
        response: '抱歉，处理您的问题时出现了错误。请稍后再试。',
        metadata: {
          error: error.message,
          sessionId
        }
      }
    }
  }

  /**
   * 分析查询意图
   */
  async analyzeQuery(query) {
    // 简单的意图分析规则
    const analysis = {
      type: 'general',
      needsRealTimeInfo: false,
      needsWebSearch: false,
      keywords: [],
      confidence: 0.5
    }

    // 检测是否需要实时信息
    const realTimeKeywords = [
      '最新', '今天', '现在', '当前', '最近', '新闻', '实时',
      '今年', '2024', '2025', '最新消息', '最新动态'
    ]
    
    const webSearchKeywords = [
      '什么是', '如何', '为什么', '哪里', '谁是', '什么时候',
      '比较', '推荐', '最好的', '排行榜', '评价', '价格'
    ]

    // 质量管理相关但可能需要最新信息的关键词
    const qualityWebKeywords = [
      '标准', '规范', '法规', '认证', '最新标准', '行业动态',
      '技术发展', '新技术', '趋势', '市场', '供应商信息'
    ]

    const queryLower = query.toLowerCase()
    
    // 检测实时信息需求
    if (realTimeKeywords.some(keyword => queryLower.includes(keyword))) {
      analysis.needsRealTimeInfo = true
      analysis.needsWebSearch = true
      analysis.type = 'realtime'
      analysis.confidence = 0.8
    }
    
    // 检测一般网络搜索需求
    if (webSearchKeywords.some(keyword => queryLower.includes(keyword))) {
      analysis.needsWebSearch = true
      analysis.type = 'informational'
      analysis.confidence = 0.7
    }
    
    // 检测质量管理相关的网络搜索需求
    if (qualityWebKeywords.some(keyword => queryLower.includes(keyword))) {
      analysis.needsWebSearch = true
      analysis.type = 'quality_web'
      analysis.confidence = 0.6
    }

    // 提取关键词
    analysis.keywords = query.split(/\s+/).filter(word => word.length > 1)

    return analysis
  }

  /**
   * 判断是否应该进行网络搜索
   */
  shouldSearchWeb(analysis, query) {
    // 如果明确需要实时信息
    if (analysis.needsRealTimeInfo) {
      return true
    }
    
    // 如果分析建议需要网络搜索
    if (analysis.needsWebSearch && analysis.confidence > 0.6) {
      return true
    }
    
    // 检查是否是质量管理系统无法回答的通用问题
    const systemSpecificKeywords = [
      '库存', '检测', '批次', '供应商', '工厂', '物料',
      '质量', '风险', '报告', '分析', '数据'
    ]
    
    const hasSystemKeywords = systemSpecificKeywords.some(keyword => 
      query.toLowerCase().includes(keyword)
    )
    
    // 如果不包含系统特定关键词，可能需要网络搜索
    return !hasSystemKeywords
  }

  /**
   * 执行网络搜索
   */
  async performWebSearch(query, analysis) {
    try {
      // 优化搜索查询
      const searchQuery = this.optimizeSearchQuery(query, analysis)
      
      const searchResults = await webSearchService.search(searchQuery, {
        maxResults: 5,
        language: 'zh-CN',
        safeSearch: 'moderate'
      })

      if (searchResults.success && searchResults.results.length > 0) {
        console.log('✅ 网络搜索成功，找到', searchResults.results.length, '个结果')
        return searchResults
      } else {
        console.log('⚠️ 网络搜索无结果')
        return null
      }

    } catch (error) {
      console.error('❌ 网络搜索失败:', error)
      return null
    }
  }

  /**
   * 优化搜索查询
   */
  optimizeSearchQuery(originalQuery, analysis) {
    let searchQuery = originalQuery

    // 根据查询类型优化搜索词
    if (analysis.type === 'quality_web') {
      // 为质量管理相关查询添加专业术语
      searchQuery += ' 质量管理 标准 规范'
    } else if (analysis.type === 'realtime') {
      // 为实时查询添加时间限定词
      searchQuery += ' 2024 最新'
    }

    return searchQuery
  }

  /**
   * 构建增强的提示词
   */
  buildEnhancedPrompt(userQuery, analysis, webSearchResults, businessContext) {
    let prompt = `你是IQE质量管理系统的AI智能助手，专门负责质量管理数据分析和问答。`

    // 添加业务上下文
    if (businessContext) {
      prompt += `\n\n当前系统数据概览：
- 库存记录：${businessContext.inventory || 0}条
- 生产记录：${businessContext.production || 0}条  
- 检测记录：${businessContext.inspection || 0}条`
    }

    // 添加网络搜索结果
    if (webSearchResults && webSearchResults.results.length > 0) {
      prompt += `\n\n📡 最新网络信息参考：`
      
      webSearchResults.results.slice(0, 3).forEach((result, index) => {
        prompt += `\n${index + 1}. ${result.title}
   ${result.snippet}
   来源：${result.url}`
      })
      
      prompt += `\n\n请结合以上最新网络信息和系统数据来回答用户问题。如果网络信息与系统功能相关，请优先使用系统数据；如果是通用知识问题，请参考网络信息给出准确回答。`
    }

    prompt += `\n\n用户问题：${userQuery}`

    prompt += `\n\n请提供专业、准确、有用的回答。回答要结构化、易读，可以使用适当的格式和符号。`

    return prompt
  }

  /**
   * 调用AI生成回答
   */
  async callAIWithEnhancedPrompt(prompt, sessionId) {
    const response = await fetch(`${AI_CONFIG.baseURL}${AI_CONFIG.endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2500,
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error(`AI API调用失败: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  /**
   * 格式化最终响应
   */
  formatFinalResponse(aiResponse, webSearchResults, analysis) {
    let content = aiResponse

    // 如果使用了网络搜索，添加信息来源说明
    if (webSearchResults && webSearchResults.results.length > 0) {
      content += `\n\n📚 **参考来源**：`
      
      webSearchResults.results.slice(0, 3).forEach((result, index) => {
        content += `\n${index + 1}. [${result.title}](${result.url})`
      })
      
      content += `\n\n*以上信息结合了系统数据和最新网络资源*`
    }

    return {
      content,
      hasWebSources: webSearchResults && webSearchResults.results.length > 0,
      sourceCount: webSearchResults?.results?.length || 0
    }
  }

  /**
   * 启用/禁用网络搜索
   */
  setWebSearchEnabled(enabled) {
    this.webSearchEnabled = enabled
    console.log('🌐 网络搜索功能:', enabled ? '已启用' : '已禁用')
  }

  /**
   * 获取搜索统计
   */
  getSearchStats() {
    return {
      webSearchEnabled: this.webSearchEnabled,
      cacheSize: this.searchCache.size,
      conversationCount: this.conversationHistory.size
    }
  }
}

// 创建单例实例
const enhancedAIService = new EnhancedAIService()

export default enhancedAIService
