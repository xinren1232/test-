/**
 * DeepSeek缓存服务 - 简化版本
 * 基于AI参考资料中的DeepSeek提示缓存功能实现
 */

class DeepSeekCacheService {
  constructor() {
    this.cache = new Map()
    this.config = {
      maxCacheSize: 1000,
      cacheThreshold: 0.85,
      cachePrefix: 'iqe_qa_cache',
      ttl: 24 * 60 * 60 * 1000 // 24小时
    }
    console.log('🚀 DeepSeek缓存服务已初始化')
  }

  /**
   * 生成问题的哈希键
   * @param {string} question 用户问题
   * @param {string} userId 用户ID
   * @returns {string} 哈希键
   */
  generateHashKey(question, userId = 'default') {
    const content = `${userId}:${question.trim().toLowerCase()}`
    // 使用简单的哈希函数替代crypto-js
    const hash = this.simpleHash(content)
    return `${this.config.cachePrefix}:${hash}`
  }

  /**
   * 简单哈希函数
   * @param {string} str 输入字符串
   * @returns {string} 哈希值
   */
  simpleHash(str) {
    let hash = 0
    if (str.length === 0) return hash.toString()

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }

    return Math.abs(hash).toString(36)
  }

  /**
   * 计算文本相似度（简化版）
   * @param {string} text1 文本1
   * @param {string} text2 文本2
   * @returns {number} 相似度分数 (0-1)
   */
  calculateSimilarity(text1, text2) {
    // 简化的相似度计算，实际项目中应使用向量嵌入
    const words1 = text1.toLowerCase().split(/\s+/)
    const words2 = text2.toLowerCase().split(/\s+/)
    
    const set1 = new Set(words1)
    const set2 = new Set(words2)
    
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    const union = new Set([...set1, ...set2])
    
    return intersection.size / union.size
  }

  /**
   * 搜索相似的缓存问题
   * @param {string} question 用户问题
   * @param {string} userId 用户ID
   * @returns {Object|null} 缓存结果
   */
  searchSimilarCache(question, userId = 'default') {
    let bestMatch = null
    let maxSimilarity = 0

    for (const [key, value] of this.cache.entries()) {
      if (key.startsWith(`${this.config.cachePrefix}:`) && value.userId === userId) {
        const similarity = this.calculateSimilarity(question, value.question)
        
        if (similarity > maxSimilarity && similarity >= this.config.cacheThreshold) {
          maxSimilarity = similarity
          bestMatch = {
            ...value,
            similarity: similarity,
            cacheKey: key
          }
        }
      }
    }

    return bestMatch
  }

  /**
   * 获取缓存的答案
   * @param {string} question 用户问题
   * @param {string} userId 用户ID
   * @returns {Object|null} 缓存结果
   */
  getCachedAnswer(question, userId = 'default') {
    // 首先尝试精确匹配
    const exactKey = this.generateHashKey(question, userId)
    const exactMatch = this.cache.get(exactKey)
    
    if (exactMatch && !this.isExpired(exactMatch)) {
      console.log('🎯 缓存精确命中:', question)
      return {
        ...exactMatch,
        source: 'exact_cache',
        similarity: 1.0
      }
    }

    // 然后尝试语义相似匹配
    const similarMatch = this.searchSimilarCache(question, userId)
    if (similarMatch && !this.isExpired(similarMatch)) {
      console.log('🔍 缓存语义命中:', question, '相似度:', similarMatch.similarity)
      return {
        ...similarMatch,
        source: 'semantic_cache'
      }
    }

    console.log('❌ 缓存未命中:', question)
    return null
  }

  /**
   * 存储答案到缓存
   * @param {string} question 用户问题
   * @param {string} answer 答案
   * @param {string} userId 用户ID
   * @param {Object} metadata 元数据
   */
  setCachedAnswer(question, answer, userId = 'default', metadata = {}) {
    const key = this.generateHashKey(question, userId)
    const cacheEntry = {
      question: question,
      answer: answer,
      userId: userId,
      timestamp: Date.now(),
      accessCount: 1,
      metadata: {
        source: 'llm',
        model: 'deepseek-chat',
        ...metadata
      }
    }

    this.cache.set(key, cacheEntry)
    console.log('💾 答案已缓存:', question)

    // 检查缓存大小限制
    this.cleanupCache()
  }

  /**
   * 检查缓存是否过期
   * @param {Object} cacheEntry 缓存条目
   * @returns {boolean} 是否过期
   */
  isExpired(cacheEntry) {
    return Date.now() - cacheEntry.timestamp > this.config.ttl
  }

  /**
   * 清理过期和超量缓存
   */
  cleanupCache() {
    // 清理过期缓存
    for (const [key, value] of this.cache.entries()) {
      if (this.isExpired(value)) {
        this.cache.delete(key)
      }
    }

    // 如果缓存仍然超量，删除最久未访问的条目
    if (this.cache.size > this.config.maxCacheSize) {
      const entries = Array.from(this.cache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      
      const deleteCount = this.cache.size - this.config.maxCacheSize
      for (let i = 0; i < deleteCount; i++) {
        this.cache.delete(entries[i][0])
      }
    }
  }

  /**
   * 更新缓存访问统计
   * @param {string} cacheKey 缓存键
   */
  updateCacheStats(cacheKey) {
    const entry = this.cache.get(cacheKey)
    if (entry) {
      entry.accessCount = (entry.accessCount || 0) + 1
      entry.lastAccess = Date.now()
      this.cache.set(cacheKey, entry)
    }
  }

  /**
   * 获取缓存统计信息
   * @param {string} userId 用户ID
   * @returns {Object} 统计信息
   */
  getCacheStats(userId = 'default') {
    let userCacheCount = 0
    let totalHits = 0
    let totalQueries = 0

    for (const [key, value] of this.cache.entries()) {
      if (value.userId === userId) {
        userCacheCount++
        totalHits += value.accessCount || 0
      }
    }

    return {
      userCacheCount,
      totalCacheSize: this.cache.size,
      hitRate: totalQueries > 0 ? (totalHits / totalQueries * 100).toFixed(2) : 0,
      cacheThreshold: this.config.cacheThreshold,
      maxCacheSize: this.config.maxCacheSize
    }
  }

  /**
   * 清空用户缓存
   * @param {string} userId 用户ID
   */
  clearUserCache(userId = 'default') {
    for (const [key, value] of this.cache.entries()) {
      if (value.userId === userId) {
        this.cache.delete(key)
      }
    }
    console.log(`🗑️ 已清空用户 ${userId} 的缓存`)
  }

  /**
   * 导出缓存数据（用于持久化）
   * @returns {Array} 缓存数据数组
   */
  exportCache() {
    return Array.from(this.cache.entries()).map(([key, value]) => ({
      key,
      ...value
    }))
  }

  /**
   * 导入缓存数据（用于恢复）
   * @param {Array} cacheData 缓存数据数组
   */
  importCache(cacheData) {
    this.cache.clear()
    cacheData.forEach(item => {
      const { key, ...value } = item
      this.cache.set(key, value)
    })
    console.log(`📥 已导入 ${cacheData.length} 条缓存记录`)
  }

  /**
   * 预热缓存 - 添加常用问题
   */
  warmupCache() {
    const commonQuestions = [
      {
        question: '查询深圳工厂的库存情况',
        answer: '深圳工厂当前库存包含20种物料，总计数量充足，详细信息请查看库存报表。',
        userId: 'system'
      },
      {
        question: '分析结构件类物料的质量状况',
        answer: '结构件类物料整体质量良好，测试通过率达到95%以上，主要包括中框结构件、前壳组件等。',
        userId: 'system'
      },
      {
        question: '检查高风险物料批次',
        answer: '当前有3个高风险物料批次需要关注，建议优先处理或更换供应商。',
        userId: 'system'
      }
    ]

    commonQuestions.forEach(({ question, answer, userId }) => {
      this.setCachedAnswer(question, answer, userId, { source: 'warmup' })
    })

    console.log('🔥 缓存预热完成')
  }
}

// 创建全局实例
const deepSeekCacheService = new DeepSeekCacheService()

// 初始化时预热缓存
deepSeekCacheService.warmupCache()

export default deepSeekCacheService
