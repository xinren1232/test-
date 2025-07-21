/**
 * 智能查询缓存服务
 * 实现多层缓存策略，提升数据查询性能
 */

export class QueryCacheService {
  constructor() {
    // 内存缓存
    this.memoryCache = new Map()
    
    // 缓存配置
    this.config = {
      // 默认缓存时间（毫秒）
      defaultTTL: 5 * 60 * 1000, // 5分钟
      
      // 最大缓存条目数
      maxEntries: 1000,
      
      // 不同查询类型的缓存策略
      strategies: {
        inventory: { ttl: 2 * 60 * 1000, priority: 'high' }, // 2分钟
        quality: { ttl: 10 * 60 * 1000, priority: 'medium' }, // 10分钟
        production: { ttl: 5 * 60 * 1000, priority: 'medium' }, // 5分钟
        statistics: { ttl: 30 * 60 * 1000, priority: 'low' }, // 30分钟
        reports: { ttl: 60 * 60 * 1000, priority: 'low' } // 1小时
      }
    }
    
    // 缓存统计
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalQueries: 0
    }
    
    // 启动清理任务
    this.startCleanupTask()
  }

  /**
   * 获取缓存数据
   * @param {string} key - 缓存键
   * @returns {any|null} 缓存的数据或null
   */
  get(key) {
    this.stats.totalQueries++
    
    const cached = this.memoryCache.get(key)
    
    if (!cached) {
      this.stats.misses++
      return null
    }
    
    // 检查是否过期
    if (Date.now() > cached.expireAt) {
      this.memoryCache.delete(key)
      this.stats.misses++
      return null
    }
    
    // 更新访问时间和次数
    cached.lastAccessed = Date.now()
    cached.accessCount++
    
    this.stats.hits++
    console.log(`🎯 缓存命中: ${key}`)
    
    return cached.data
  }

  /**
   * 设置缓存数据
   * @param {string} key - 缓存键
   * @param {any} data - 要缓存的数据
   * @param {Object} options - 缓存选项
   */
  set(key, data, options = {}) {
    const strategy = this.getStrategy(options.type || 'default')
    const ttl = options.ttl || strategy.ttl || this.config.defaultTTL
    
    const cacheEntry = {
      data,
      createdAt: Date.now(),
      expireAt: Date.now() + ttl,
      lastAccessed: Date.now(),
      accessCount: 1,
      type: options.type || 'default',
      priority: strategy.priority || 'medium',
      size: this.estimateSize(data)
    }
    
    // 检查缓存容量
    this.ensureCapacity()
    
    this.memoryCache.set(key, cacheEntry)
    console.log(`💾 数据已缓存: ${key} (TTL: ${ttl}ms)`)
  }

  /**
   * 删除缓存
   * @param {string} key - 缓存键
   */
  delete(key) {
    const deleted = this.memoryCache.delete(key)
    if (deleted) {
      console.log(`🗑️ 缓存已删除: ${key}`)
    }
    return deleted
  }

  /**
   * 清空所有缓存
   */
  clear() {
    const size = this.memoryCache.size
    this.memoryCache.clear()
    console.log(`🧹 已清空所有缓存 (${size}条)`)
  }

  /**
   * 智能查询缓存包装器
   * @param {string} key - 缓存键
   * @param {Function} queryFn - 查询函数
   * @param {Object} options - 选项
   * @returns {Promise<any>} 查询结果
   */
  async query(key, queryFn, options = {}) {
    // 尝试从缓存获取
    const cached = this.get(key)
    if (cached !== null) {
      return cached
    }
    
    // 缓存未命中，执行查询
    console.log(`🔍 执行查询: ${key}`)
    const startTime = Date.now()
    
    try {
      const result = await queryFn()
      const queryTime = Date.now() - startTime
      
      // 缓存结果
      this.set(key, result, {
        ...options,
        queryTime
      })
      
      console.log(`✅ 查询完成: ${key} (${queryTime}ms)`)
      return result
      
    } catch (error) {
      console.error(`❌ 查询失败: ${key}`, error)
      throw error
    }
  }

  /**
   * 批量查询缓存
   * @param {Array} queries - 查询配置数组
   * @returns {Promise<Array>} 查询结果数组
   */
  async batchQuery(queries) {
    const results = []
    const uncachedQueries = []
    
    // 第一轮：检查缓存
    for (const query of queries) {
      const cached = this.get(query.key)
      if (cached !== null) {
        results[query.index] = cached
      } else {
        uncachedQueries.push(query)
      }
    }
    
    // 第二轮：并行执行未缓存的查询
    if (uncachedQueries.length > 0) {
      console.log(`🔄 批量执行 ${uncachedQueries.length} 个未缓存查询`)
      
      const promises = uncachedQueries.map(async (query) => {
        try {
          const result = await query.queryFn()
          this.set(query.key, result, query.options)
          return { index: query.index, result, error: null }
        } catch (error) {
          return { index: query.index, result: null, error }
        }
      })
      
      const batchResults = await Promise.allSettled(promises)
      
      batchResults.forEach((settled, i) => {
        if (settled.status === 'fulfilled') {
          const { index, result, error } = settled.value
          if (error) {
            throw error
          }
          results[index] = result
        }
      })
    }
    
    return results
  }

  /**
   * 预热缓存
   * @param {Array} preloadQueries - 预加载查询配置
   */
  async warmup(preloadQueries) {
    console.log(`🔥 开始缓存预热 (${preloadQueries.length}个查询)`)
    
    const promises = preloadQueries.map(async (query) => {
      try {
        await this.query(query.key, query.queryFn, query.options)
      } catch (error) {
        console.warn(`⚠️ 预热失败: ${query.key}`, error.message)
      }
    })
    
    await Promise.allSettled(promises)
    console.log(`✅ 缓存预热完成`)
  }

  /**
   * 获取缓存策略
   * @param {string} type - 查询类型
   * @returns {Object} 缓存策略
   */
  getStrategy(type) {
    return this.config.strategies[type] || { ttl: this.config.defaultTTL, priority: 'medium' }
  }

  /**
   * 确保缓存容量
   */
  ensureCapacity() {
    if (this.memoryCache.size >= this.config.maxEntries) {
      this.evictLRU()
    }
  }

  /**
   * LRU淘汰策略
   */
  evictLRU() {
    const entries = Array.from(this.memoryCache.entries())
    
    // 按优先级和最后访问时间排序
    entries.sort((a, b) => {
      const [, entryA] = a
      const [, entryB] = b
      
      // 优先级权重
      const priorityWeight = { low: 1, medium: 2, high: 3 }
      const weightA = priorityWeight[entryA.priority] || 2
      const weightB = priorityWeight[entryB.priority] || 2
      
      if (weightA !== weightB) {
        return weightA - weightB // 低优先级先淘汰
      }
      
      return entryA.lastAccessed - entryB.lastAccessed // 最久未访问先淘汰
    })
    
    // 淘汰最低优先级的25%条目
    const evictCount = Math.ceil(this.config.maxEntries * 0.25)
    
    for (let i = 0; i < evictCount && i < entries.length; i++) {
      const [key] = entries[i]
      this.memoryCache.delete(key)
      this.stats.evictions++
    }
    
    console.log(`🗑️ LRU淘汰: 移除了 ${evictCount} 条缓存`)
  }

  /**
   * 估算数据大小
   * @param {any} data - 数据
   * @returns {number} 估算的字节大小
   */
  estimateSize(data) {
    try {
      return JSON.stringify(data).length * 2 // 粗略估算
    } catch {
      return 1000 // 默认大小
    }
  }

  /**
   * 启动清理任务
   */
  startCleanupTask() {
    // 每5分钟清理一次过期缓存
    setInterval(() => {
      this.cleanupExpired()
    }, 5 * 60 * 1000)
  }

  /**
   * 清理过期缓存
   */
  cleanupExpired() {
    const now = Date.now()
    let expiredCount = 0
    
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now > entry.expireAt) {
        this.memoryCache.delete(key)
        expiredCount++
      }
    }
    
    if (expiredCount > 0) {
      console.log(`🧹 清理过期缓存: ${expiredCount}条`)
    }
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    const hitRate = this.stats.totalQueries > 0 
      ? (this.stats.hits / this.stats.totalQueries * 100).toFixed(2)
      : 0
    
    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      currentSize: this.memoryCache.size,
      maxSize: this.config.maxEntries
    }
  }

  /**
   * 生成缓存键
   * @param {string} prefix - 前缀
   * @param {Object} params - 参数
   * @returns {string} 缓存键
   */
  static generateKey(prefix, params) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|')
    
    return `${prefix}:${sortedParams}`
  }
}

// 创建全局实例
export const queryCacheService = new QueryCacheService()
export default queryCacheService
