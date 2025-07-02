/**
 * 联网搜索服务
 * 集成多个开源搜索工具，为AI问答提供实时网络信息
 */

// 搜索引擎配置
const SEARCH_ENGINES = {
  // SearXNG - 开源元搜索引擎
  searxng: {
    enabled: true,
    baseUrl: 'https://searx.be', // 公共实例
    timeout: 5000,
    maxResults: 5
  },
  
  // DuckDuckGo API - 免费搜索API
  duckduckgo: {
    enabled: true,
    baseUrl: 'https://api.duckduckgo.com',
    timeout: 5000,
    maxResults: 5
  },
  
  // Bing Search API (需要API Key，但有免费额度)
  bing: {
    enabled: false, // 默认关闭，需要配置API Key
    baseUrl: 'https://api.bing.microsoft.com/v7.0/search',
    apiKey: process.env.BING_SEARCH_API_KEY || '',
    timeout: 5000,
    maxResults: 5
  },
  
  // Google Custom Search (需要API Key)
  google: {
    enabled: false, // 默认关闭，需要配置API Key
    baseUrl: 'https://www.googleapis.com/customsearch/v1',
    apiKey: process.env.GOOGLE_SEARCH_API_KEY || '',
    searchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID || '',
    timeout: 5000,
    maxResults: 5
  }
}

class WebSearchService {
  constructor() {
    this.cache = new Map()
    this.cacheTimeout = 30 * 60 * 1000 // 30分钟缓存
    this.requestQueue = []
    this.isProcessing = false
  }

  /**
   * 执行联网搜索
   * @param {string} query - 搜索查询
   * @param {Object} options - 搜索选项
   * @returns {Promise<Object>} 搜索结果
   */
  async search(query, options = {}) {
    const {
      maxResults = 5,
      language = 'zh-CN',
      safeSearch = 'moderate',
      timeout = 10000
    } = options

    console.log('🔍 开始联网搜索:', query)

    // 检查缓存
    const cacheKey = this.getCacheKey(query, options)
    const cachedResult = this.getFromCache(cacheKey)
    if (cachedResult) {
      console.log('💾 使用缓存结果')
      return cachedResult
    }

    // 执行多引擎搜索
    const searchPromises = []
    
    if (SEARCH_ENGINES.searxng.enabled) {
      searchPromises.push(this.searchWithSearXNG(query, options))
    }
    
    if (SEARCH_ENGINES.duckduckgo.enabled) {
      searchPromises.push(this.searchWithDuckDuckGo(query, options))
    }
    
    if (SEARCH_ENGINES.bing.enabled && SEARCH_ENGINES.bing.apiKey) {
      searchPromises.push(this.searchWithBing(query, options))
    }
    
    if (SEARCH_ENGINES.google.enabled && SEARCH_ENGINES.google.apiKey) {
      searchPromises.push(this.searchWithGoogle(query, options))
    }

    try {
      // 并行执行搜索，取最快的结果
      const results = await Promise.allSettled(searchPromises)
      const successfulResults = results
        .filter(result => result.status === 'fulfilled' && result.value.success)
        .map(result => result.value)

      if (successfulResults.length === 0) {
        throw new Error('所有搜索引擎都失败了')
      }

      // 合并和去重结果
      const mergedResults = this.mergeSearchResults(successfulResults)
      
      // 缓存结果
      this.setCache(cacheKey, mergedResults)
      
      console.log('✅ 联网搜索完成，找到', mergedResults.results.length, '个结果')
      return mergedResults

    } catch (error) {
      console.error('❌ 联网搜索失败:', error)
      return {
        success: false,
        error: error.message,
        results: [],
        sources: [],
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * 使用SearXNG搜索
   */
  async searchWithSearXNG(query, options) {
    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        lang: options.language || 'zh-CN',
        safesearch: options.safeSearch || '1',
        categories: 'general'
      })

      const response = await fetch(`${SEARCH_ENGINES.searxng.baseUrl}/search?${params}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'IQE-AI-Assistant/1.0',
          'Accept': 'application/json'
        },
        timeout: SEARCH_ENGINES.searxng.timeout
      })

      if (!response.ok) {
        throw new Error(`SearXNG API错误: ${response.status}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        engine: 'searxng',
        results: data.results?.slice(0, SEARCH_ENGINES.searxng.maxResults).map(item => ({
          title: item.title,
          url: item.url,
          snippet: item.content,
          publishedDate: item.publishedDate
        })) || [],
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      console.error('SearXNG搜索失败:', error)
      return { success: false, engine: 'searxng', error: error.message }
    }
  }

  /**
   * 使用DuckDuckGo搜索
   */
  async searchWithDuckDuckGo(query, options) {
    try {
      // DuckDuckGo Instant Answer API
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        no_html: '1',
        skip_disambig: '1'
      })

      const response = await fetch(`${SEARCH_ENGINES.duckduckgo.baseUrl}/?${params}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'IQE-AI-Assistant/1.0'
        },
        timeout: SEARCH_ENGINES.duckduckgo.timeout
      })

      if (!response.ok) {
        throw new Error(`DuckDuckGo API错误: ${response.status}`)
      }

      const data = await response.json()
      
      const results = []
      
      // 添加即时答案
      if (data.Abstract) {
        results.push({
          title: data.Heading || '即时答案',
          url: data.AbstractURL,
          snippet: data.Abstract,
          type: 'instant_answer'
        })
      }
      
      // 添加相关主题
      if (data.RelatedTopics) {
        data.RelatedTopics.slice(0, 3).forEach(topic => {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.split(' - ')[0],
              url: topic.FirstURL,
              snippet: topic.Text,
              type: 'related_topic'
            })
          }
        })
      }

      return {
        success: true,
        engine: 'duckduckgo',
        results: results.slice(0, SEARCH_ENGINES.duckduckgo.maxResults),
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      console.error('DuckDuckGo搜索失败:', error)
      return { success: false, engine: 'duckduckgo', error: error.message }
    }
  }

  /**
   * 使用Bing搜索
   */
  async searchWithBing(query, options) {
    try {
      const params = new URLSearchParams({
        q: query,
        count: SEARCH_ENGINES.bing.maxResults,
        mkt: options.language || 'zh-CN',
        safeSearch: options.safeSearch || 'Moderate'
      })

      const response = await fetch(`${SEARCH_ENGINES.bing.baseUrl}?${params}`, {
        method: 'GET',
        headers: {
          'Ocp-Apim-Subscription-Key': SEARCH_ENGINES.bing.apiKey,
          'User-Agent': 'IQE-AI-Assistant/1.0'
        },
        timeout: SEARCH_ENGINES.bing.timeout
      })

      if (!response.ok) {
        throw new Error(`Bing API错误: ${response.status}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        engine: 'bing',
        results: data.webPages?.value?.map(item => ({
          title: item.name,
          url: item.url,
          snippet: item.snippet,
          dateLastCrawled: item.dateLastCrawled
        })) || [],
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      console.error('Bing搜索失败:', error)
      return { success: false, engine: 'bing', error: error.message }
    }
  }

  /**
   * 使用Google自定义搜索
   */
  async searchWithGoogle(query, options) {
    try {
      const params = new URLSearchParams({
        key: SEARCH_ENGINES.google.apiKey,
        cx: SEARCH_ENGINES.google.searchEngineId,
        q: query,
        num: SEARCH_ENGINES.google.maxResults,
        hl: options.language || 'zh-CN',
        safe: options.safeSearch || 'medium'
      })

      const response = await fetch(`${SEARCH_ENGINES.google.baseUrl}?${params}`, {
        method: 'GET',
        timeout: SEARCH_ENGINES.google.timeout
      })

      if (!response.ok) {
        throw new Error(`Google API错误: ${response.status}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        engine: 'google',
        results: data.items?.map(item => ({
          title: item.title,
          url: item.link,
          snippet: item.snippet,
          displayLink: item.displayLink
        })) || [],
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      console.error('Google搜索失败:', error)
      return { success: false, engine: 'google', error: error.message }
    }
  }

  /**
   * 合并多个搜索引擎的结果
   */
  mergeSearchResults(results) {
    const allResults = []
    const seenUrls = new Set()
    const sources = []

    results.forEach(result => {
      sources.push(result.engine)
      
      result.results.forEach(item => {
        // 去重
        if (!seenUrls.has(item.url)) {
          seenUrls.add(item.url)
          allResults.push({
            ...item,
            source: result.engine
          })
        }
      })
    })

    // 按相关性排序（简单的标题长度和内容质量评分）
    allResults.sort((a, b) => {
      const scoreA = (a.title?.length || 0) + (a.snippet?.length || 0)
      const scoreB = (b.title?.length || 0) + (b.snippet?.length || 0)
      return scoreB - scoreA
    })

    return {
      success: true,
      results: allResults.slice(0, 10), // 最多返回10个结果
      sources: [...new Set(sources)],
      totalResults: allResults.length,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * 缓存相关方法
   */
  getCacheKey(query, options) {
    return `search_${query}_${JSON.stringify(options)}`
  }

  getFromCache(key) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }
    this.cache.delete(key)
    return null
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * 清理过期缓存
   */
  cleanCache() {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key)
      }
    }
  }
}

// 创建单例实例
const webSearchService = new WebSearchService()

// 定期清理缓存
setInterval(() => {
  webSearchService.cleanCache()
}, 10 * 60 * 1000) // 每10分钟清理一次

export default webSearchService
