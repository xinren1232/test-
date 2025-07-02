/**
 * 实时联网检索服务
 * 实现项目自适应性对接的实时搜索功能
 */

class RealtimeSearchService {
  constructor() {
    this.searchEngines = new Map()
    this.contextCache = new Map()
    this.adaptiveRules = new Map()
    this.initializeSearchEngines()
    this.initializeAdaptiveRules()
  }

  /**
   * 初始化搜索引擎
   */
  initializeSearchEngines() {
    // 整合分析搜索引擎
    this.searchEngines.set('integrated-analysis', {
      name: '整合分析搜索',
      endpoint: 'http://localhost:3004/api/integrated-analysis/intelligent-query',
      priority: 1,
      enabled: true,
      timeout: 5000,
      retryCount: 2
    })

    // 数据库查询引擎
    this.searchEngines.set('database-query', {
      name: '数据库查询',
      endpoint: '/api/assistant/query',
      priority: 2,
      enabled: true,
      timeout: 3000,
      retryCount: 1
    })

    // AI分析引擎
    this.searchEngines.set('ai-analysis', {
      name: 'AI智能分析',
      endpoint: '/api/assistant/ai-query',
      priority: 3,
      enabled: true,
      timeout: 10000,
      retryCount: 1
    })
  }

  /**
   * 初始化自适应规则
   */
  initializeAdaptiveRules() {
    // 查询类型自适应规则
    this.adaptiveRules.set('query-type', {
      'factory-query': {
        keywords: ['工厂', '深圳', '重庆', '南昌', '宜宾'],
        preferredEngine: 'integrated-analysis',
        context: 'factory-management'
      },
      'material-query': {
        keywords: ['物料', '结构件', '光学', '电子元件'],
        preferredEngine: 'integrated-analysis',
        context: 'material-management'
      },
      'supplier-query': {
        keywords: ['供应商', '聚龙', 'BOE', '歌尔', '三星'],
        preferredEngine: 'integrated-analysis',
        context: 'supplier-management'
      },
      'quality-query': {
        keywords: ['质量', '测试', '不良率', '通过率'],
        preferredEngine: 'database-query',
        context: 'quality-control'
      },
      'analysis-query': {
        keywords: ['分析', '趋势', '预测', '报告'],
        preferredEngine: 'ai-analysis',
        context: 'data-analysis'
      }
    })

    // 用户角色自适应规则
    this.adaptiveRules.set('user-role', {
      'operator': {
        allowedEngines: ['database-query', 'integrated-analysis'],
        defaultEngine: 'database-query',
        maxComplexity: 'medium'
      },
      'manager': {
        allowedEngines: ['database-query', 'integrated-analysis', 'ai-analysis'],
        defaultEngine: 'integrated-analysis',
        maxComplexity: 'high'
      },
      'admin': {
        allowedEngines: ['database-query', 'integrated-analysis', 'ai-analysis'],
        defaultEngine: 'ai-analysis',
        maxComplexity: 'unlimited'
      }
    })
  }

  /**
   * 分析查询意图
   * @param {string} query 查询内容
   * @param {Object} userContext 用户上下文
   * @returns {Object} 查询意图分析结果
   */
  analyzeQueryIntent(query, userContext = {}) {
    const queryLower = query.toLowerCase()
    const intent = {
      type: 'general',
      confidence: 0,
      preferredEngine: 'database-query',
      context: 'general',
      complexity: 'low',
      keywords: []
    }

    // 分析查询类型
    const queryTypeRules = this.adaptiveRules.get('query-type')
    for (const [type, rule] of Object.entries(queryTypeRules)) {
      const matchedKeywords = rule.keywords.filter(keyword => 
        queryLower.includes(keyword.toLowerCase())
      )
      
      if (matchedKeywords.length > 0) {
        const confidence = matchedKeywords.length / rule.keywords.length
        if (confidence > intent.confidence) {
          intent.type = type
          intent.confidence = confidence
          intent.preferredEngine = rule.preferredEngine
          intent.context = rule.context
          intent.keywords = matchedKeywords
        }
      }
    }

    // 分析查询复杂度
    if (queryLower.includes('分析') || queryLower.includes('趋势') || queryLower.includes('预测')) {
      intent.complexity = 'high'
    } else if (queryLower.includes('对比') || queryLower.includes('统计') || queryLower.includes('汇总')) {
      intent.complexity = 'medium'
    }

    // 根据用户角色调整
    if (userContext.role) {
      const roleRules = this.adaptiveRules.get('user-role')[userContext.role]
      if (roleRules) {
        if (!roleRules.allowedEngines.includes(intent.preferredEngine)) {
          intent.preferredEngine = roleRules.defaultEngine
        }
        
        if (roleRules.maxComplexity !== 'unlimited') {
          const complexityLevels = { low: 1, medium: 2, high: 3 }
          const maxLevel = complexityLevels[roleRules.maxComplexity] || 1
          const currentLevel = complexityLevels[intent.complexity] || 1
          
          if (currentLevel > maxLevel) {
            intent.complexity = roleRules.maxComplexity
            intent.preferredEngine = roleRules.defaultEngine
          }
        }
      }
    }

    return intent
  }

  /**
   * 执行实时搜索
   * @param {string} query 查询内容
   * @param {Object} userContext 用户上下文
   * @param {Object} options 搜索选项
   * @returns {Promise<Object>} 搜索结果
   */
  async executeRealtimeSearch(query, userContext = {}, options = {}) {
    const startTime = Date.now()
    
    try {
      // 分析查询意图
      const intent = this.analyzeQueryIntent(query, userContext)
      console.log('🎯 查询意图分析:', intent)

      // 选择搜索引擎
      const selectedEngine = options.forceEngine || intent.preferredEngine
      const engine = this.searchEngines.get(selectedEngine)
      
      if (!engine || !engine.enabled) {
        throw new Error(`搜索引擎 ${selectedEngine} 不可用`)
      }

      // 构建搜索请求
      const searchRequest = {
        query,
        intent,
        userContext,
        timestamp: new Date().toISOString()
      }

      // 执行搜索
      console.log(`🔍 使用 ${engine.name} 执行搜索:`, query)
      const result = await this.callSearchEngine(engine, searchRequest)

      // 处理搜索结果
      const processedResult = this.processSearchResult(result, intent, engine)
      
      // 更新上下文缓存
      this.updateContextCache(query, processedResult, userContext)

      const responseTime = Date.now() - startTime
      console.log(`✅ 搜索完成，耗时: ${responseTime}ms`)

      return {
        success: true,
        result: processedResult,
        metadata: {
          engine: engine.name,
          intent,
          responseTime,
          timestamp: new Date()
        }
      }

    } catch (error) {
      console.error('❌ 实时搜索失败:', error)
      
      // 尝试降级搜索
      if (!options.isRetry) {
        console.log('🔄 尝试降级搜索...')
        return await this.executeFallbackSearch(query, userContext, error)
      }

      return {
        success: false,
        error: error.message,
        metadata: {
          responseTime: Date.now() - startTime,
          timestamp: new Date()
        }
      }
    }
  }

  /**
   * 调用搜索引擎
   * @param {Object} engine 搜索引擎配置
   * @param {Object} request 搜索请求
   * @returns {Promise<Object>} 搜索结果
   */
  async callSearchEngine(engine, request) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), engine.timeout)

    try {
      const response = await fetch(engine.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  /**
   * 处理搜索结果
   * @param {Object} rawResult 原始搜索结果
   * @param {Object} intent 查询意图
   * @param {Object} engine 搜索引擎
   * @returns {Object} 处理后的结果
   */
  processSearchResult(rawResult, intent, engine) {
    const processed = {
      content: rawResult.response || rawResult.reply || '未获取到有效结果',
      source: engine.name,
      confidence: intent.confidence,
      context: intent.context,
      data: rawResult.data || null,
      metadata: rawResult.metadata || {}
    }

    // 根据查询类型进行特殊处理
    switch (intent.type) {
      case 'factory-query':
        processed.category = '工厂管理'
        break
      case 'material-query':
        processed.category = '物料管理'
        break
      case 'supplier-query':
        processed.category = '供应商管理'
        break
      case 'quality-query':
        processed.category = '质量控制'
        break
      case 'analysis-query':
        processed.category = '数据分析'
        break
      default:
        processed.category = '综合查询'
    }

    return processed
  }

  /**
   * 执行降级搜索
   * @param {string} query 查询内容
   * @param {Object} userContext 用户上下文
   * @param {Error} originalError 原始错误
   * @returns {Promise<Object>} 降级搜索结果
   */
  async executeFallbackSearch(query, userContext, originalError) {
    // 按优先级尝试其他搜索引擎
    const availableEngines = Array.from(this.searchEngines.entries())
      .filter(([_, engine]) => engine.enabled)
      .sort((a, b) => a[1].priority - b[1].priority)

    for (const [engineName, engine] of availableEngines) {
      try {
        console.log(`🔄 尝试降级到 ${engine.name}`)
        
        const request = {
          query,
          userContext,
          fallback: true,
          originalError: originalError.message
        }

        const result = await this.callSearchEngine(engine, request)
        const processed = this.processSearchResult(result, { type: 'fallback' }, engine)

        return {
          success: true,
          result: processed,
          metadata: {
            engine: engine.name,
            isFallback: true,
            originalError: originalError.message,
            timestamp: new Date()
          }
        }
      } catch (fallbackError) {
        console.log(`❌ ${engine.name} 降级搜索也失败:`, fallbackError.message)
        continue
      }
    }

    // 所有搜索引擎都失败，返回默认响应
    return {
      success: false,
      result: {
        content: '抱歉，当前所有搜索服务都不可用，请稍后重试。',
        source: 'fallback',
        category: '系统提示'
      },
      metadata: {
        allEnginesFailed: true,
        originalError: originalError.message,
        timestamp: new Date()
      }
    }
  }

  /**
   * 更新上下文缓存
   * @param {string} query 查询内容
   * @param {Object} result 搜索结果
   * @param {Object} userContext 用户上下文
   */
  updateContextCache(query, result, userContext) {
    const cacheKey = `${userContext.sessionId || 'default'}_${Date.now()}`
    const cacheEntry = {
      query,
      result,
      userContext,
      timestamp: new Date()
    }

    this.contextCache.set(cacheKey, cacheEntry)

    // 限制缓存大小
    if (this.contextCache.size > 100) {
      const oldestKey = Array.from(this.contextCache.keys())[0]
      this.contextCache.delete(oldestKey)
    }
  }

  /**
   * 获取搜索引擎状态
   * @returns {Object} 搜索引擎状态
   */
  getSearchEngineStatus() {
    const status = {}
    
    for (const [name, engine] of this.searchEngines.entries()) {
      status[name] = {
        name: engine.name,
        enabled: engine.enabled,
        priority: engine.priority,
        timeout: engine.timeout
      }
    }

    return status
  }

  /**
   * 切换搜索引擎状态
   * @param {string} engineName 搜索引擎名称
   * @param {boolean} enabled 是否启用
   */
  toggleSearchEngine(engineName, enabled) {
    const engine = this.searchEngines.get(engineName)
    if (engine) {
      engine.enabled = enabled
      console.log(`🔧 搜索引擎 ${engine.name} 已${enabled ? '启用' : '禁用'}`)
    }
  }

  /**
   * 获取搜索统计信息
   * @returns {Object} 统计信息
   */
  getSearchStats() {
    return {
      totalEngines: this.searchEngines.size,
      enabledEngines: Array.from(this.searchEngines.values()).filter(e => e.enabled).length,
      cacheSize: this.contextCache.size,
      adaptiveRules: this.adaptiveRules.size
    }
  }
}

// 创建全局实例
const realtimeSearchService = new RealtimeSearchService()

export default realtimeSearchService
