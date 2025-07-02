/**
 * 数据查询优化器
 * 实现查询优化、索引建议、性能监控
 */

import { queryCacheService } from './QueryCacheService.js'

export class QueryOptimizer {
  constructor() {
    // 查询性能统计
    this.performanceStats = new Map()
    
    // 查询模式分析
    this.queryPatterns = new Map()
    
    // 优化建议
    this.optimizationSuggestions = []
    
    // 配置
    this.config = {
      slowQueryThreshold: 1000, // 慢查询阈值（毫秒）
      patternAnalysisWindow: 100, // 模式分析窗口大小
      optimizationInterval: 30 * 60 * 1000 // 优化分析间隔（30分钟）
    }
    
    // 启动性能监控
    this.startPerformanceMonitoring()
  }

  /**
   * 优化查询执行
   * @param {string} queryType - 查询类型
   * @param {Object} params - 查询参数
   * @param {Function} queryFn - 查询函数
   * @param {Object} options - 选项
   * @returns {Promise<any>} 查询结果
   */
  async optimizedQuery(queryType, params, queryFn, options = {}) {
    const queryId = this.generateQueryId(queryType, params)
    const cacheKey = this.generateCacheKey(queryType, params)
    
    // 记录查询开始
    const startTime = Date.now()
    this.recordQueryPattern(queryType, params)
    
    try {
      // 查询优化策略选择
      const strategy = this.selectOptimizationStrategy(queryType, params)
      
      let result
      
      switch (strategy) {
        case 'cache_first':
          result = await this.cacheFirstQuery(cacheKey, queryFn, options)
          break
          
        case 'parallel_batch':
          result = await this.parallelBatchQuery(queryType, params, queryFn, options)
          break
          
        case 'incremental':
          result = await this.incrementalQuery(queryType, params, queryFn, options)
          break
          
        case 'direct':
        default:
          result = await queryFn()
          break
      }
      
      // 记录性能统计
      const duration = Date.now() - startTime
      this.recordPerformance(queryId, duration, 'success')
      
      return result
      
    } catch (error) {
      const duration = Date.now() - startTime
      this.recordPerformance(queryId, duration, 'error')
      throw error
    }
  }

  /**
   * 缓存优先查询策略
   */
  async cacheFirstQuery(cacheKey, queryFn, options) {
    return await queryCacheService.query(cacheKey, queryFn, {
      type: options.cacheType || 'default',
      ttl: options.cacheTTL
    })
  }

  /**
   * 并行批量查询策略
   */
  async parallelBatchQuery(queryType, params, queryFn, options) {
    // 检查是否可以拆分为并行查询
    const subQueries = this.splitIntoSubQueries(queryType, params)
    
    if (subQueries.length <= 1) {
      return await queryFn()
    }
    
    console.log(`🔄 并行执行 ${subQueries.length} 个子查询`)
    
    const promises = subQueries.map(async (subQuery, index) => {
      const subCacheKey = this.generateCacheKey(queryType, subQuery.params)
      return {
        index,
        result: await queryCacheService.query(subCacheKey, subQuery.queryFn, options)
      }
    })
    
    const results = await Promise.all(promises)
    
    // 合并结果
    return this.mergeSubQueryResults(queryType, results)
  }

  /**
   * 增量查询策略
   */
  async incrementalQuery(queryType, params, queryFn, options) {
    // 检查是否有基础数据缓存
    const baseKey = this.generateBaseKey(queryType, params)
    const baseData = queryCacheService.get(baseKey)
    
    if (baseData) {
      // 执行增量查询
      const incrementalParams = this.generateIncrementalParams(params, baseData.lastUpdate)
      const incrementalData = await queryFn(incrementalParams)
      
      // 合并数据
      const mergedData = this.mergeIncrementalData(baseData.data, incrementalData)
      
      // 更新缓存
      queryCacheService.set(baseKey, {
        data: mergedData,
        lastUpdate: Date.now()
      }, options)
      
      return mergedData
    } else {
      // 首次查询，获取全量数据
      const fullData = await queryFn()
      
      queryCacheService.set(baseKey, {
        data: fullData,
        lastUpdate: Date.now()
      }, options)
      
      return fullData
    }
  }

  /**
   * 选择优化策略
   */
  selectOptimizationStrategy(queryType, params) {
    // 基于查询类型和参数选择策略
    const patterns = this.queryPatterns.get(queryType)
    
    if (!patterns) {
      return 'cache_first' // 默认策略
    }
    
    // 高频查询使用缓存优先
    if (patterns.frequency > 10) {
      return 'cache_first'
    }
    
    // 大数据量查询考虑并行处理
    if (this.isLargeDataQuery(queryType, params)) {
      return 'parallel_batch'
    }
    
    // 时间序列数据使用增量查询
    if (this.isTimeSeriesQuery(queryType, params)) {
      return 'incremental'
    }
    
    return 'cache_first'
  }

  /**
   * 拆分为子查询
   */
  splitIntoSubQueries(queryType, params) {
    const subQueries = []
    
    // 根据查询类型进行拆分
    switch (queryType) {
      case 'inventory_by_factory':
        if (params.factories && params.factories.length > 1) {
          params.factories.forEach(factory => {
            subQueries.push({
              params: { ...params, factories: [factory] },
              queryFn: () => this.queryInventoryByFactory({ ...params, factories: [factory] })
            })
          })
        }
        break
        
      case 'quality_analysis':
        if (params.dateRange && this.isLargeDateRange(params.dateRange)) {
          const dateChunks = this.splitDateRange(params.dateRange)
          dateChunks.forEach(chunk => {
            subQueries.push({
              params: { ...params, dateRange: chunk },
              queryFn: () => this.queryQualityAnalysis({ ...params, dateRange: chunk })
            })
          })
        }
        break
    }
    
    return subQueries.length > 0 ? subQueries : [{ params, queryFn: () => {} }]
  }

  /**
   * 合并子查询结果
   */
  mergeSubQueryResults(queryType, results) {
    // 按索引排序
    results.sort((a, b) => a.index - b.index)
    
    switch (queryType) {
      case 'inventory_by_factory':
        return results.reduce((merged, { result }) => {
          return merged.concat(result || [])
        }, [])
        
      case 'quality_analysis':
        return results.reduce((merged, { result }) => {
          if (!result) return merged
          
          return {
            totalRecords: (merged.totalRecords || 0) + (result.totalRecords || 0),
            passRate: this.calculateAveragePassRate(merged, result),
            defectTypes: this.mergeDefectTypes(merged.defectTypes, result.defectTypes),
            trends: this.mergeTrends(merged.trends, result.trends)
          }
        }, {})
        
      default:
        return results.map(r => r.result)
    }
  }

  /**
   * 记录查询模式
   */
  recordQueryPattern(queryType, params) {
    const pattern = this.queryPatterns.get(queryType) || {
      frequency: 0,
      lastParams: [],
      avgResponseTime: 0,
      paramPatterns: new Map()
    }
    
    pattern.frequency++
    pattern.lastParams.push(params)
    
    // 保持最近的参数记录
    if (pattern.lastParams.length > this.config.patternAnalysisWindow) {
      pattern.lastParams.shift()
    }
    
    // 分析参数模式
    this.analyzeParamPatterns(pattern, params)
    
    this.queryPatterns.set(queryType, pattern)
  }

  /**
   * 记录性能统计
   */
  recordPerformance(queryId, duration, status) {
    const stats = this.performanceStats.get(queryId) || {
      count: 0,
      totalTime: 0,
      avgTime: 0,
      minTime: Infinity,
      maxTime: 0,
      successCount: 0,
      errorCount: 0
    }
    
    stats.count++
    stats.totalTime += duration
    stats.avgTime = stats.totalTime / stats.count
    stats.minTime = Math.min(stats.minTime, duration)
    stats.maxTime = Math.max(stats.maxTime, duration)
    
    if (status === 'success') {
      stats.successCount++
    } else {
      stats.errorCount++
    }
    
    this.performanceStats.set(queryId, stats)
    
    // 慢查询警告
    if (duration > this.config.slowQueryThreshold) {
      console.warn(`🐌 慢查询检测: ${queryId} - ${duration}ms`)
      this.generateOptimizationSuggestion(queryId, duration)
    }
  }

  /**
   * 生成优化建议
   */
  generateOptimizationSuggestion(queryId, duration) {
    const suggestion = {
      queryId,
      duration,
      timestamp: Date.now(),
      type: 'slow_query',
      suggestions: []
    }
    
    // 基于查询ID分析建议
    if (queryId.includes('inventory')) {
      suggestion.suggestions.push('考虑添加工厂和物料的复合索引')
      suggestion.suggestions.push('使用分页查询减少数据传输量')
    }
    
    if (queryId.includes('quality')) {
      suggestion.suggestions.push('考虑按时间范围预聚合质量数据')
      suggestion.suggestions.push('使用缓存存储常用的质量统计结果')
    }
    
    if (duration > 5000) {
      suggestion.suggestions.push('考虑将查询拆分为多个并行子查询')
      suggestion.suggestions.push('检查数据库连接池配置')
    }
    
    this.optimizationSuggestions.push(suggestion)
    
    // 保持最近的建议记录
    if (this.optimizationSuggestions.length > 100) {
      this.optimizationSuggestions.shift()
    }
  }

  /**
   * 启动性能监控
   */
  startPerformanceMonitoring() {
    setInterval(() => {
      this.analyzePerformanceTrends()
      this.generatePerformanceReport()
    }, this.config.optimizationInterval)
  }

  /**
   * 分析性能趋势
   */
  analyzePerformanceTrends() {
    console.log('📊 分析查询性能趋势...')
    
    for (const [queryId, stats] of this.performanceStats.entries()) {
      if (stats.count > 10 && stats.avgTime > this.config.slowQueryThreshold) {
        console.warn(`⚠️ 持续慢查询: ${queryId} - 平均${stats.avgTime}ms`)
      }
    }
  }

  /**
   * 生成性能报告
   */
  generatePerformanceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalQueries: Array.from(this.performanceStats.values()).reduce((sum, stats) => sum + stats.count, 0),
      avgResponseTime: this.calculateOverallAvgTime(),
      slowQueries: this.getSlowQueries(),
      cacheStats: queryCacheService.getStats(),
      optimizationSuggestions: this.optimizationSuggestions.slice(-10)
    }
    
    console.log('📈 查询性能报告:', report)
    return report
  }

  /**
   * 辅助方法
   */
  generateQueryId(queryType, params) {
    const paramStr = Object.keys(params).sort().map(key => `${key}:${params[key]}`).join('|')
    return `${queryType}:${paramStr}`
  }

  generateCacheKey(queryType, params) {
    return queryCacheService.constructor.generateKey(queryType, params)
  }

  generateBaseKey(queryType, params) {
    const baseParams = { ...params }
    delete baseParams.dateRange
    delete baseParams.limit
    delete baseParams.offset
    return this.generateCacheKey(`${queryType}_base`, baseParams)
  }

  isLargeDataQuery(queryType, params) {
    return queryType.includes('report') || 
           (params.limit && params.limit > 1000) ||
           (params.dateRange && this.isLargeDateRange(params.dateRange))
  }

  isTimeSeriesQuery(queryType, params) {
    return queryType.includes('trend') || 
           queryType.includes('history') ||
           params.dateRange
  }

  isLargeDateRange(dateRange) {
    if (!dateRange || !dateRange.start || !dateRange.end) return false
    const start = new Date(dateRange.start)
    const end = new Date(dateRange.end)
    const diffDays = (end - start) / (1000 * 60 * 60 * 24)
    return diffDays > 30 // 超过30天认为是大范围
  }

  calculateOverallAvgTime() {
    const allStats = Array.from(this.performanceStats.values())
    if (allStats.length === 0) return 0
    
    const totalTime = allStats.reduce((sum, stats) => sum + stats.totalTime, 0)
    const totalCount = allStats.reduce((sum, stats) => sum + stats.count, 0)
    
    return totalCount > 0 ? totalTime / totalCount : 0
  }

  getSlowQueries() {
    return Array.from(this.performanceStats.entries())
      .filter(([, stats]) => stats.avgTime > this.config.slowQueryThreshold)
      .map(([queryId, stats]) => ({ queryId, avgTime: stats.avgTime, count: stats.count }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 10)
  }
}

// 创建全局实例
export const queryOptimizer = new QueryOptimizer()
export default queryOptimizer
