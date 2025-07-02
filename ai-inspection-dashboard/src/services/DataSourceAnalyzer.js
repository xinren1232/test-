/**
 * 数据源分析器 - 智能识别问题涉及的数据源并执行查询
 * 实现类似MCP的数据查询和分析流程
 */

export class DataSourceAnalyzer {
  constructor() {
    this.dataSources = {
      inventory: '库存数据',
      production: '生产数据', 
      inspection: '检测数据',
      batch: '批次数据'
    }
    
    // 数据字段映射
    this.fieldMappings = {
      inventory: ['factory', 'warehouse', 'materialCode', 'materialName', 'supplier', 'batchCode', 'quantity', 'status', 'inboundTime', 'shelfLife'],
      production: ['factory', 'baseline', 'project', 'materialCode', 'materialName', 'supplier', 'batchCode', 'defectRate', 'defectPhenomena'],
      inspection: ['testId', 'testDate', 'baseline', 'project', 'materialCode', 'materialName', 'supplier', 'batchCode', 'testResult', 'defectPhenomena']
    }
  }

  /**
   * 分析问题涉及的数据源
   * @param {string} question - 用户问题
   * @returns {Object} 分析结果
   */
  analyzeDataSources(question) {
    const analysis = {
      question: question,
      involvedSources: [],
      queryStrategy: '',
      extractedEntities: {},
      confidence: 0
    }

    const questionLower = question.toLowerCase()

    // 1. 识别涉及的数据源
    if (this.containsKeywords(questionLower, ['库存', '仓库', '物料', '材料', '存储'])) {
      analysis.involvedSources.push('inventory')
    }
    
    if (this.containsKeywords(questionLower, ['生产', '产线', '制造', '不良率', '缺陷'])) {
      analysis.involvedSources.push('production')
    }
    
    if (this.containsKeywords(questionLower, ['检测', '测试', '检验', '质量', '合格'])) {
      analysis.involvedSources.push('inspection')
    }
    
    if (this.containsKeywords(questionLower, ['批次', '批号', '追溯'])) {
      analysis.involvedSources.push('batch')
    }

    // 2. 提取实体信息
    analysis.extractedEntities = this.extractEntities(question)

    // 3. 确定查询策略
    analysis.queryStrategy = this.determineQueryStrategy(analysis.involvedSources, analysis.extractedEntities)

    // 4. 计算置信度
    analysis.confidence = this.calculateConfidence(analysis)

    return analysis
  }

  /**
   * 检查是否包含关键词
   */
  containsKeywords(text, keywords) {
    return keywords.some(keyword => text.includes(keyword))
  }

  /**
   * 提取实体信息
   */
  extractEntities(question) {
    const entities = {}

    // 工厂识别
    const factories = ['深圳', '上海', '北京', '广州', '工厂A', '工厂B', '工厂C']
    factories.forEach(factory => {
      if (question.includes(factory)) {
        entities.factory = factory
      }
    })

    // 供应商识别
    const suppliers = ['BOE', '京东方', '三星', '华星光电', '供应商A', '供应商B']
    suppliers.forEach(supplier => {
      if (question.includes(supplier)) {
        entities.supplier = supplier
      }
    })

    // 物料识别
    const materials = ['电池盖', '显示屏', '电路板', '连接器', '传感器']
    materials.forEach(material => {
      if (question.includes(material)) {
        entities.materialName = material
      }
    })

    // 状态识别
    const statuses = ['正常', '风险', '冻结', '异常']
    statuses.forEach(status => {
      if (question.includes(status)) {
        entities.status = status
      }
    })

    // 时间识别
    const timePatterns = [
      /(\d+)天/, /(\d+)周/, /(\d+)月/, /(\d+)年/,
      /最近/, /本月/, /上月/, /今年/, /去年/
    ]
    timePatterns.forEach(pattern => {
      const match = question.match(pattern)
      if (match) {
        entities.timeRange = match[0]
      }
    })

    return entities
  }

  /**
   * 确定查询策略
   */
  determineQueryStrategy(sources, entities) {
    if (sources.length === 0) {
      return 'general_search'
    }
    
    if (sources.length === 1) {
      return `single_source_${sources[0]}`
    }
    
    if (sources.length > 1) {
      // 多数据源关联查询
      if (sources.includes('inventory') && sources.includes('production')) {
        return 'inventory_production_correlation'
      }
      if (sources.includes('production') && sources.includes('inspection')) {
        return 'production_quality_correlation'
      }
      if (sources.length === 3) {
        return 'full_lifecycle_analysis'
      }
      return 'multi_source_correlation'
    }
    
    return 'unknown'
  }

  /**
   * 计算置信度
   */
  calculateConfidence(analysis) {
    let confidence = 0
    
    // 基础分数
    if (analysis.involvedSources.length > 0) confidence += 30
    
    // 实体提取分数
    const entityCount = Object.keys(analysis.extractedEntities).length
    confidence += Math.min(entityCount * 15, 45)
    
    // 策略明确性分数
    if (analysis.queryStrategy !== 'unknown') confidence += 25
    
    return Math.min(confidence, 100)
  }

  /**
   * 执行数据查询
   * @param {Object} analysis - 数据源分析结果
   * @returns {Object} 查询结果
   */
  async executeDataQuery(analysis) {
    const results = {
      sources: {},
      summary: {},
      totalRecords: 0,
      queryTime: Date.now()
    }

    try {
      // 获取本地存储数据
      const localData = this.getLocalStorageData()

      // 根据涉及的数据源执行查询
      for (const source of analysis.involvedSources) {
        if (localData[source] && localData[source].length > 0) {
          const filteredData = this.filterDataByEntities(localData[source], analysis.extractedEntities)
          results.sources[source] = filteredData
          results.totalRecords += filteredData.length
        }
      }

      // 生成汇总信息
      results.summary = this.generateDataSummary(results.sources, analysis)

      return results
    } catch (error) {
      console.error('数据查询失败:', error)
      return {
        sources: {},
        summary: { error: '数据查询失败: ' + error.message },
        totalRecords: 0,
        queryTime: Date.now()
      }
    }
  }

  /**
   * 获取本地存储数据
   */
  getLocalStorageData() {
    return {
      inventory: JSON.parse(localStorage.getItem('inventoryData') || '[]'),
      production: JSON.parse(localStorage.getItem('productionData') || '[]'),
      inspection: JSON.parse(localStorage.getItem('testData') || '[]'),
      batch: JSON.parse(localStorage.getItem('batchData') || '[]')
    }
  }

  /**
   * 根据实体过滤数据
   */
  filterDataByEntities(data, entities) {
    let filtered = [...data]

    Object.entries(entities).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        filtered = filtered.filter(item => {
          const itemValue = item[key]
          if (itemValue) {
            return itemValue.toString().toLowerCase().includes(value.toLowerCase())
          }
          return false
        })
      }
    })

    return filtered
  }

  /**
   * 生成数据汇总
   */
  generateDataSummary(sources, analysis) {
    const summary = {
      totalSources: Object.keys(sources).length,
      recordCounts: {},
      keyFindings: [],
      dataQuality: 'good'
    }

    Object.entries(sources).forEach(([source, data]) => {
      summary.recordCounts[source] = data.length
      
      // 生成关键发现
      if (data.length > 0) {
        summary.keyFindings.push(`${this.dataSources[source]}: 找到 ${data.length} 条相关记录`)
      }
    })

    // 数据质量评估
    if (summary.totalSources === 0) {
      summary.dataQuality = 'no_data'
    } else if (summary.totalSources < analysis.involvedSources.length) {
      summary.dataQuality = 'partial'
    }

    return summary
  }

  /**
   * 生成查询报告
   */
  generateQueryReport(analysis, queryResults) {
    const report = {
      timestamp: new Date().toISOString(),
      question: analysis.question,
      confidence: analysis.confidence,
      strategy: analysis.queryStrategy,
      dataSources: analysis.involvedSources,
      entities: analysis.extractedEntities,
      results: queryResults,
      recommendations: []
    }

    // 生成建议
    if (queryResults.totalRecords === 0) {
      report.recommendations.push('未找到相关数据，建议检查数据源或调整查询条件')
    } else if (queryResults.totalRecords > 100) {
      report.recommendations.push('数据量较大，建议添加更多筛选条件以获得更精确的结果')
    } else {
      report.recommendations.push('数据查询成功，可以进行进一步的分析和可视化')
    }

    return report
  }
}

// 创建单例实例
export const dataSourceAnalyzer = new DataSourceAnalyzer()
export default dataSourceAnalyzer
