/**
 * 开源AI增强服务
 * 集成多种开源AI工具和技术，提供智能化的问答和分析能力
 * 参考 LangChain、LangGraph 等开源AI工具的设计思想
 */

import { DataProcessor, QualityDataAnalyzer, ChartDataTransformer } from '../utils/dataProcessing.js'

/**
 * AI意图识别器
 * 模拟 LangChain 的意图识别能力
 */
class IntentClassifier {
  constructor() {
    this.intentPatterns = {
      // 数据查询意图
      data_query: {
        keywords: ['查询', '查看', '显示', '统计', '分析', '数据'],
        patterns: [
          /查询.*库存/,
          /显示.*数据/,
          /统计.*信息/,
          /分析.*情况/
        ]
      },
      
      // 图表生成意图
      chart_generation: {
        keywords: ['图表', '图形', '可视化', '展示', '趋势', '分布'],
        patterns: [
          /生成.*图表/,
          /显示.*图形/,
          /可视化.*数据/,
          /.*趋势图/,
          /.*分布图/
        ]
      },
      
      // 质量分析意图
      quality_analysis: {
        keywords: ['质量', '合格率', '不良', '缺陷', '风险', '评估'],
        patterns: [
          /质量.*分析/,
          /合格率.*统计/,
          /不良.*分析/,
          /风险.*评估/
        ]
      },
      
      // 对比分析意图
      comparison_analysis: {
        keywords: ['对比', '比较', '差异', '变化', '趋势'],
        patterns: [
          /对比.*数据/,
          /比较.*情况/,
          /.*差异分析/,
          /.*变化趋势/
        ]
      }
    }
  }

  // 识别用户意图
  classify(query) {
    const queryLower = query.toLowerCase()
    const results = []

    for (const [intent, config] of Object.entries(this.intentPatterns)) {
      let score = 0

      // 关键词匹配
      const keywordMatches = config.keywords.filter(keyword => 
        queryLower.includes(keyword)
      ).length
      score += keywordMatches * 10

      // 正则模式匹配
      const patternMatches = config.patterns.filter(pattern => 
        pattern.test(queryLower)
      ).length
      score += patternMatches * 20

      if (score > 0) {
        results.push({ intent, score, confidence: Math.min(score / 30, 1) })
      }
    }

    // 返回最高分的意图
    return results.sort((a, b) => b.score - a.score)[0] || null
  }
}

/**
 * 实体提取器
 * 模拟 NLP 实体识别能力
 */
class EntityExtractor {
  constructor() {
    this.entityPatterns = {
      factory: /(深圳|重庆|南昌|宜宾)工厂?/g,
      supplier: /供应商[：:]?\s*([^\s，,。.]+)/g,
      material: /物料[：:]?\s*([^\s，,。.]+)/g,
      status: /(正常|异常|风险|冻结|待检)/g,
      chartType: /(柱状图|饼图|折线图|散点图|仪表盘)/g,
      timeRange: /(今天|昨天|本周|本月|最近\d+天)/g
    }
  }

  // 提取实体
  extract(query) {
    const entities = {}

    for (const [entityType, pattern] of Object.entries(this.entityPatterns)) {
      const matches = [...query.matchAll(pattern)]
      if (matches.length > 0) {
        if (entityType === 'factory' || entityType === 'status' || entityType === 'chartType') {
          entities[entityType] = matches[0][0]
        } else {
          entities[entityType] = matches[0][1] || matches[0][0]
        }
      }
    }

    return entities
  }
}

/**
 * 响应生成器
 * 模拟 LangChain 的响应生成能力
 */
class ResponseGenerator {
  // 生成结构化响应
  static generateStructuredResponse(intent, data, entities, context) {
    switch (intent.intent) {
      case 'data_query':
        return this.generateDataResponse(data, entities, context)
      
      case 'chart_generation':
        return this.generateChartResponse(data, entities, context)
      
      case 'quality_analysis':
        return this.generateQualityResponse(data, entities, context)
      
      case 'comparison_analysis':
        return this.generateComparisonResponse(data, entities, context)
      
      default:
        return this.generateDefaultResponse(data, entities, context)
    }
  }

  // 生成数据查询响应
  static generateDataResponse(data, entities, context) {
    const analysis = QualityDataAnalyzer.analyzeInventory(data)
    
    return {
      type: 'data_analysis',
      title: `数据查询结果 - ${entities.factory || '全部工厂'}`,
      summary: {
        totalRecords: data.length,
        keyMetrics: [
          { label: '总数量', value: analysis.总数量, unit: '件' },
          { label: '平均数量', value: analysis.平均数量, unit: '件/批' },
          { label: '工厂数量', value: Object.keys(analysis.工厂分布).length, unit: '个' }
        ]
      },
      charts: [
        {
          type: 'pie',
          title: '工厂分布',
          data: ChartDataTransformer.groupToChart(data, 'factory')
        },
        {
          type: 'bar',
          title: '供应商分布',
          data: ChartDataTransformer.groupToChart(data, 'supplier')
        }
      ],
      table: {
        columns: ['物料名称', '工厂', '供应商', '数量', '状态'],
        data: data.slice(0, 10).map(item => [
          item.materialName,
          item.factory,
          item.supplier,
          item.quantity,
          item.status
        ])
      },
      insights: this.generateInsights(analysis),
      actions: [
        { label: '导出数据', action: 'export', type: 'primary' },
        { label: '生成报告', action: 'report', type: 'default' },
        { label: '设置预警', action: 'alert', type: 'warning' }
      ]
    }
  }

  // 生成图表响应
  static generateChartResponse(data, entities, context) {
    const chartType = entities.chartType || 'bar'
    const groupBy = entities.groupBy || 'factory'
    
    return {
      type: 'chart_visualization',
      title: `${chartType}图表 - ${groupBy}分析`,
      charts: [
        {
          type: chartType.includes('柱状') ? 'bar' : 
                chartType.includes('饼') ? 'pie' : 
                chartType.includes('折线') ? 'line' : 'bar',
          title: `按${groupBy}分组统计`,
          data: ChartDataTransformer.groupToChart(data, groupBy),
          description: `展示不同${groupBy}的数据分布情况`
        }
      ],
      summary: {
        chartCount: 1,
        dataPoints: data.length,
        categories: [...new Set(data.map(item => item[groupBy]))].length
      }
    }
  }

  // 生成质量分析响应
  static generateQualityResponse(data, entities, context) {
    const qualityReport = QualityDataAnalyzer.generateQualityReport(
      data.inventory || data,
      data.testing || [],
      data.production || []
    )

    return {
      type: 'quality_analysis',
      title: '质量分析报告',
      summary: {
        overallScore: qualityReport.综合评分,
        status: qualityReport.综合评分 >= 80 ? '优秀' : 
                qualityReport.综合评分 >= 60 ? '良好' : '需改进'
      },
      charts: [
        {
          type: 'gauge',
          title: '综合质量评分',
          data: [{ name: '质量评分', value: qualityReport.综合评分 }]
        }
      ],
      details: qualityReport,
      recommendations: this.generateQualityRecommendations(qualityReport)
    }
  }

  // 生成对比分析响应
  static generateComparisonResponse(data, entities, context) {
    return {
      type: 'comparison_analysis',
      title: '对比分析结果',
      summary: { message: '对比分析功能开发中...' }
    }
  }

  // 生成默认响应
  static generateDefaultResponse(data, entities, context) {
    return {
      type: 'general_response',
      title: '智能分析结果',
      summary: {
        message: '已为您分析相关数据',
        dataCount: Array.isArray(data) ? data.length : 0
      },
      charts: data && data.length > 0 ? [
        {
          type: 'bar',
          title: '数据概览',
          data: ChartDataTransformer.groupToChart(data, 'factory')
        }
      ] : []
    }
  }

  // 生成洞察
  static generateInsights(analysis) {
    const insights = []
    
    if (analysis.总数量 > 10000) {
      insights.push('📈 库存总量较大，建议关注库存周转率')
    }
    
    const factoryCount = Object.keys(analysis.工厂分布).length
    if (factoryCount > 3) {
      insights.push('🏭 多工厂分布，建议优化供应链协调')
    }
    
    return insights
  }

  // 生成质量建议
  static generateQualityRecommendations(report) {
    const recommendations = []
    
    if (report.综合评分 < 60) {
      recommendations.push('⚠️ 质量评分偏低，建议加强质量管控')
    }
    
    if (report.测试分析 && report.测试分析.合格率 < 90) {
      recommendations.push('🔍 测试合格率需提升，建议优化测试流程')
    }
    
    return recommendations
  }
}

/**
 * 开源AI增强服务主类
 * 整合所有AI能力
 */
export class OpenSourceAIService {
  constructor() {
    this.intentClassifier = new IntentClassifier()
    this.entityExtractor = new EntityExtractor()
    this.isEnabled = true
  }

  // 处理智能查询
  async processIntelligentQuery(query, data, context = {}) {
    try {
      console.log('🤖 开源AI服务处理查询:', query)

      // 1. 意图识别
      const intent = this.intentClassifier.classify(query)
      if (!intent) {
        return this.generateFallbackResponse(query)
      }

      console.log('🎯 识别意图:', intent)

      // 2. 实体提取
      const entities = this.entityExtractor.extract(query)
      console.log('📊 提取实体:', entities)

      // 3. 数据过滤
      const filteredData = this.filterDataByEntities(data, entities)
      console.log('🔍 过滤后数据量:', filteredData.length)

      // 4. 生成响应
      const response = ResponseGenerator.generateStructuredResponse(
        intent, 
        filteredData, 
        entities, 
        context
      )

      return {
        success: true,
        data: response,
        source: 'opensource-ai',
        intent: intent.intent,
        confidence: intent.confidence,
        entities: entities
      }

    } catch (error) {
      console.error('❌ 开源AI服务处理失败:', error)
      return this.generateErrorResponse(query, error)
    }
  }

  // 根据实体过滤数据
  filterDataByEntities(data, entities) {
    if (!Array.isArray(data)) return []

    return DataProcessor.from(data)
      .filter(item => {
        // 工厂过滤
        if (entities.factory && item.factory && !item.factory.includes(entities.factory.replace('工厂', ''))) {
          return false
        }
        
        // 供应商过滤
        if (entities.supplier && item.supplier && !item.supplier.includes(entities.supplier)) {
          return false
        }
        
        // 物料过滤
        if (entities.material && item.materialName && !item.materialName.includes(entities.material)) {
          return false
        }
        
        // 状态过滤
        if (entities.status && item.status && !item.status.includes(entities.status)) {
          return false
        }
        
        return true
      })
      .value()
  }

  // 生成回退响应
  generateFallbackResponse(query) {
    return {
      success: false,
      data: `抱歉，我暂时无法理解您的问题："${query}"。请尝试使用更具体的查询，例如：
      
• "查询深圳工厂库存"
• "显示供应商分布图表"  
• "分析质量数据"
• "对比各工厂数据"`,
      source: 'opensource-ai-fallback'
    }
  }

  // 生成错误响应
  generateErrorResponse(query, error) {
    return {
      success: false,
      data: `处理查询时发生错误：${error.message}`,
      source: 'opensource-ai-error',
      error: error.message
    }
  }

  // 健康检查
  healthCheck() {
    return {
      status: 'healthy',
      services: {
        intentClassifier: '✅ 正常',
        entityExtractor: '✅ 正常',
        responseGenerator: '✅ 正常'
      },
      timestamp: new Date().toISOString()
    }
  }
}

export default OpenSourceAIService
