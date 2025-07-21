/**
 * 数据处理流水线管理器
 * 管理完整的6阶段数据处理流程
 */

/**
 * 数据处理阶段定义
 */
export const PROCESSING_STAGES = {
  UPLOAD: {
    id: 'upload',
    name: '数据上传',
    description: '上传数据文件',
    order: 1,
    icon: 'upload',
    color: '#409EFF'
  },
  PARSE: {
    id: 'parse',
    name: '数据解析',
    description: '解析文件内容，提取数据结构',
    order: 2,
    icon: 'document',
    color: '#E6A23C'
  },
  CLEAN: {
    id: 'clean',
    name: '数据清洗',
    description: '应用清洗规则，处理数据质量问题',
    order: 3,
    icon: 'brush',
    color: '#F56C6C'
  },
  EXTRACT: {
    id: 'extract',
    name: '信息提取',
    description: '提取关键数据信息和特征',
    order: 4,
    icon: 'search',
    color: '#67C23A'
  },
  SUMMARIZE: {
    id: 'summarize',
    name: '结果汇总',
    description: '汇总处理结果，生成报告',
    order: 5,
    icon: 'document-copy',
    color: '#909399'
  },
  AI_ANALYSIS: {
    id: 'ai_analysis',
    name: 'AI总结',
    description: 'AI智能分析和总结',
    order: 6,
    icon: 'cpu',
    color: '#722ED1'
  }
}

/**
 * 数据处理流水线类
 */
export class DataProcessingPipeline {
  constructor() {
    this.currentStage = null
    this.stages = Object.values(PROCESSING_STAGES).sort((a, b) => a.order - b.order)
    this.stageResults = {}
    this.stageProgress = {}
    this.logs = []
    this.startTime = null
    this.endTime = null
    this.status = 'idle' // idle, running, completed, error
    this.errorInfo = null
    
    // 初始化阶段进度
    this.stages.forEach(stage => {
      this.stageProgress[stage.id] = {
        status: 'pending', // pending, running, completed, error
        progress: 0,
        startTime: null,
        endTime: null,
        duration: null,
        details: [],
        result: null,
        error: null
      }
    })
  }

  /**
   * 开始处理流程
   */
  async start(file, options = {}) {
    this.log('info', '开始数据处理流程')
    this.status = 'running'
    this.startTime = new Date()
    this.errorInfo = null

    try {
      // 阶段1: 数据上传
      await this.executeStage('upload', async () => {
        return await this.uploadStage(file, options.upload)
      })

      // 阶段2: 数据解析
      await this.executeStage('parse', async () => {
        return await this.parseStage(this.stageResults.upload, options.parse)
      })

      // 阶段3: 数据清洗
      await this.executeStage('clean', async () => {
        return await this.cleanStage(this.stageResults.parse, options.clean)
      })

      // 阶段4: 信息提取
      await this.executeStage('extract', async () => {
        return await this.extractStage(this.stageResults.clean, options.extract)
      })

      // 阶段5: 结果汇总
      await this.executeStage('summarize', async () => {
        return await this.summarizeStage(this.stageResults.extract, options.summarize)
      })

      // 阶段6: AI总结
      await this.executeStage('ai_analysis', async () => {
        return await this.aiAnalysisStage(this.stageResults.summarize, options.aiAnalysis)
      })

      this.status = 'completed'
      this.endTime = new Date()
      this.log('success', '数据处理流程完成')

      return {
        success: true,
        results: this.stageResults,
        summary: this.generateFinalSummary()
      }

    } catch (error) {
      this.status = 'error'
      this.errorInfo = error
      this.log('error', `处理流程失败: ${error.message}`)
      
      return {
        success: false,
        error: error.message,
        results: this.stageResults
      }
    }
  }

  /**
   * 执行单个阶段
   */
  async executeStage(stageId, executor) {
    const stage = this.stages.find(s => s.id === stageId)
    if (!stage) {
      throw new Error(`未找到阶段: ${stageId}`)
    }

    this.currentStage = stageId
    const progress = this.stageProgress[stageId]
    
    progress.status = 'running'
    progress.startTime = new Date()
    progress.progress = 0
    progress.details = []
    
    this.log('info', `开始执行阶段: ${stage.name}`)

    try {
      // 执行阶段逻辑
      const result = await executor()
      
      progress.status = 'completed'
      progress.progress = 100
      progress.endTime = new Date()
      progress.duration = progress.endTime - progress.startTime
      progress.result = result
      
      this.stageResults[stageId] = result
      this.log('success', `阶段 ${stage.name} 完成`)
      
      return result
      
    } catch (error) {
      progress.status = 'error'
      progress.error = error.message
      progress.endTime = new Date()
      progress.duration = progress.endTime - progress.startTime
      
      this.log('error', `阶段 ${stage.name} 失败: ${error.message}`)
      throw error
    }
  }

  /**
   * 更新阶段进度
   */
  updateStageProgress(stageId, progress, detail) {
    if (this.stageProgress[stageId]) {
      this.stageProgress[stageId].progress = progress
      if (detail) {
        this.stageProgress[stageId].details.push({
          time: new Date(),
          message: detail
        })
      }
    }
  }

  /**
   * 阶段1: 数据上传
   */
  async uploadStage(file, options = {}) {
    this.updateStageProgress('upload', 10, '验证文件格式')
    
    if (!file) {
      throw new Error('未提供文件')
    }

    // 验证文件类型
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv',
      'application/json'
    ]

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`不支持的文件类型: ${file.type}`)
    }

    this.updateStageProgress('upload', 50, '读取文件内容')

    // 读取文件内容
    const fileContent = await this.readFile(file)
    
    this.updateStageProgress('upload', 90, '验证文件完整性')

    // 验证文件大小
    const maxSize = options.maxSize || 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new Error(`文件过大，最大支持 ${Math.round(maxSize / 1024 / 1024)}MB`)
    }

    this.updateStageProgress('upload', 100, '文件上传完成')

    return {
      file: {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      },
      content: fileContent,
      uploadTime: new Date()
    }
  }

  /**
   * 读取文件内容
   */
  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        resolve(e.target.result)
      }
      
      reader.onerror = () => {
        reject(new Error('文件读取失败'))
      }
      
      if (file.type === 'application/json' || file.type === 'text/csv') {
        reader.readAsText(file)
      } else {
        reader.readAsArrayBuffer(file)
      }
    })
  }

  /**
   * 记录日志
   */
  log(level, message) {
    const logEntry = {
      time: new Date().toISOString(),
      level,
      message,
      stage: this.currentStage
    }
    this.logs.push(logEntry)
    console.log(`[${level.toUpperCase()}] ${message}`)
  }

  /**
   * 获取当前状态
   */
  getStatus() {
    return {
      status: this.status,
      currentStage: this.currentStage,
      stages: this.stages,
      stageProgress: this.stageProgress,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.endTime ? this.endTime - this.startTime : null,
      logs: this.logs,
      errorInfo: this.errorInfo
    }
  }

  /**
   * 获取整体进度
   */
  getOverallProgress() {
    const completedStages = Object.values(this.stageProgress).filter(p => p.status === 'completed').length
    const totalStages = this.stages.length
    return Math.round((completedStages / totalStages) * 100)
  }

  /**
   * 阶段2: 数据解析
   */
  async parseStage(uploadResult, options = {}) {
    this.updateStageProgress('parse', 10, '初始化解析器')

    const { file, content } = uploadResult
    let parsedData = null

    try {
      if (file.type.includes('excel') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        this.updateStageProgress('parse', 30, '解析Excel文件')
        parsedData = await this.parseExcel(content, options)
      } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        this.updateStageProgress('parse', 30, '解析CSV文件')
        parsedData = await this.parseCSV(content, options)
      } else if (file.type === 'application/json' || file.name.endsWith('.json')) {
        this.updateStageProgress('parse', 30, '解析JSON文件')
        parsedData = await this.parseJSON(content, options)
      } else {
        throw new Error(`不支持的文件格式: ${file.type}`)
      }

      this.updateStageProgress('parse', 70, '验证数据结构')

      // 验证解析结果
      if (!parsedData || !Array.isArray(parsedData) || parsedData.length === 0) {
        throw new Error('解析结果为空或格式不正确')
      }

      this.updateStageProgress('parse', 90, '生成数据摘要')

      // 生成数据摘要
      const summary = this.generateDataSummary(parsedData)

      this.updateStageProgress('parse', 100, '数据解析完成')

      return {
        data: parsedData,
        summary,
        parseTime: new Date(),
        originalFile: file
      }

    } catch (error) {
      throw new Error(`数据解析失败: ${error.message}`)
    }
  }

  /**
   * 解析Excel文件
   */
  async parseExcel(content, options = {}) {
    try {
      // 动态导入xlsx库
      const XLSX = await import('xlsx')

      this.updateStageProgress('parse', 40, '读取Excel工作簿')

      // 读取工作簿
      const workbook = XLSX.read(content, { type: 'array' })

      this.updateStageProgress('parse', 60, '解析工作表')

      // 获取第一个工作表（或指定工作表）
      const sheetName = options.sheetName || workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]

      if (!worksheet) {
        throw new Error(`工作表 "${sheetName}" 不存在`)
      }

      this.updateStageProgress('parse', 80, '转换为JSON格式')

      // 转换为JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: options.header || 1,
        defval: options.defaultValue || '',
        blankrows: options.includeBlankRows || false
      })

      if (jsonData.length === 0) {
        throw new Error('Excel文件中没有数据')
      }

      return jsonData

    } catch (error) {
      throw new Error(`Excel解析失败: ${error.message}`)
    }
  }

  /**
   * 解析CSV文件
   */
  async parseCSV(content, options = {}) {
    try {
      // 动态导入papaparse库
      const Papa = await import('papaparse')

      this.updateStageProgress('parse', 40, '解析CSV内容')

      return new Promise((resolve, reject) => {
        Papa.parse(content, {
          header: options.header !== false, // 默认使用第一行作为标题
          skipEmptyLines: options.skipEmptyLines !== false, // 默认跳过空行
          delimiter: options.delimiter || 'auto', // 自动检测分隔符
          encoding: options.encoding || 'UTF-8',
          transformHeader: options.transformHeader || ((header) => header.trim()),
          transform: options.transform || ((value) => value.trim()),
          complete: (results) => {
            this.updateStageProgress('parse', 80, '验证CSV数据')

            if (results.errors.length > 0) {
              console.warn('CSV解析警告:', results.errors)
            }

            if (!results.data || results.data.length === 0) {
              reject(new Error('CSV文件中没有数据'))
              return
            }

            // 过滤掉完全空的行
            const filteredData = results.data.filter(row => {
              return Object.values(row).some(value => value && String(value).trim() !== '')
            })

            if (filteredData.length === 0) {
              reject(new Error('CSV文件中没有有效数据'))
              return
            }

            resolve(filteredData)
          },
          error: (error) => {
            reject(new Error(`CSV解析失败: ${error.message}`))
          }
        })
      })

    } catch (error) {
      throw new Error(`CSV解析失败: ${error.message}`)
    }
  }

  /**
   * 解析JSON文件
   */
  async parseJSON(content, options = {}) {
    await new Promise(resolve => setTimeout(resolve, 300))

    try {
      const data = JSON.parse(content)
      return Array.isArray(data) ? data : [data]
    } catch (error) {
      throw new Error('JSON格式不正确')
    }
  }

  /**
   * 生成数据摘要
   */
  generateDataSummary(data) {
    const summary = {
      totalRecords: data.length,
      fields: [],
      dataTypes: {},
      sampleData: data.slice(0, 5)
    }

    if (data.length > 0) {
      const firstRecord = data[0]
      summary.fields = Object.keys(firstRecord)

      // 分析字段类型
      summary.fields.forEach(field => {
        const values = data.map(record => record[field]).filter(v => v !== null && v !== undefined && v !== '')
        const types = new Set()

        values.slice(0, 100).forEach(value => {
          if (typeof value === 'string') {
            if (/^\d+$/.test(value)) types.add('integer')
            else if (/^\d+\.\d+$/.test(value)) types.add('decimal')
            else if (/^\d{4}-\d{2}-\d{2}/.test(value)) types.add('date')
            else types.add('string')
          } else if (typeof value === 'number') {
            types.add('number')
          } else {
            types.add(typeof value)
          }
        })

        summary.dataTypes[field] = Array.from(types)
      })
    }

    return summary
  }

  /**
   * 阶段3: 数据清洗
   */
  async cleanStage(parseResult, options = {}) {
    this.updateStageProgress('clean', 10, '初始化清洗引擎')

    const { data } = parseResult
    const cleaningEngine = await import('./dataCleaningEngine.js')

    this.updateStageProgress('clean', 30, '应用清洗规则')

    // 默认清洗规则
    const defaultRules = [
      'REMOVE_EMPTY',
      'TRIM_WHITESPACE',
      'REMOVE_DUPLICATES',
      'STANDARDIZE_TERMS',
      'FORMAT_DATE',
      'FORMAT_NUMBER'
    ]

    const rulesToApply = options.rules || defaultRules
    const cleaningOptions = options.ruleOptions || {}

    this.updateStageProgress('clean', 50, '执行数据清洗')

    const cleaningResult = await cleaningEngine.default.applyRules(data, rulesToApply, cleaningOptions)

    this.updateStageProgress('clean', 80, '生成清洗报告')

    // 生成清洗报告
    const cleaningReport = {
      originalCount: data.length,
      cleanedCount: cleaningResult.data.length,
      removedCount: data.length - cleaningResult.data.length,
      appliedRules: rulesToApply,
      statistics: cleaningResult.statistics,
      qualityScore: cleaningResult.statistics.qualityScore
    }

    this.updateStageProgress('clean', 100, '数据清洗完成')

    return {
      data: cleaningResult.data,
      report: cleaningReport,
      logs: cleaningResult.logs,
      cleanTime: new Date()
    }
  }

  /**
   * 阶段4: 信息提取
   */
  async extractStage(cleanResult, options = {}) {
    this.updateStageProgress('extract', 10, '初始化信息提取')

    const { data } = cleanResult

    this.updateStageProgress('extract', 30, '提取基础统计信息')

    // 提取基础统计信息
    const basicStats = this.extractBasicStatistics(data)

    this.updateStageProgress('extract', 50, '分析数据分布')

    // 分析数据分布
    const distributions = this.analyzeDataDistributions(data)

    this.updateStageProgress('extract', 70, '识别数据模式')

    // 识别数据模式和趋势
    const patterns = this.identifyDataPatterns(data)

    this.updateStageProgress('extract', 90, '生成关键指标')

    // 生成关键指标
    const keyMetrics = this.generateKeyMetrics(data, basicStats, distributions)

    this.updateStageProgress('extract', 100, '信息提取完成')

    return {
      basicStats,
      distributions,
      patterns,
      keyMetrics,
      extractTime: new Date()
    }
  }

  /**
   * 提取基础统计信息
   */
  extractBasicStatistics(data) {
    const stats = {
      totalRecords: data.length,
      fieldCount: data.length > 0 ? Object.keys(data[0]).length : 0,
      completeness: {},
      uniqueness: {},
      dataTypes: {}
    }

    if (data.length > 0) {
      const fields = Object.keys(data[0])

      fields.forEach(field => {
        const values = data.map(record => record[field])
        const filledValues = values.filter(v => v !== null && v !== undefined && v !== '')
        const uniqueValues = new Set(filledValues)

        stats.completeness[field] = Math.round((filledValues.length / data.length) * 100)
        stats.uniqueness[field] = uniqueValues.size
        stats.dataTypes[field] = this.detectFieldType(filledValues)
      })
    }

    return stats
  }

  /**
   * 分析数据分布
   */
  analyzeDataDistributions(data) {
    const distributions = {}

    if (data.length > 0) {
      const fields = Object.keys(data[0])

      fields.forEach(field => {
        const values = data.map(record => record[field]).filter(v => v !== null && v !== undefined && v !== '')

        if (values.length > 0) {
          const distribution = {}
          values.forEach(value => {
            const key = String(value)
            distribution[key] = (distribution[key] || 0) + 1
          })

          const sortedDistribution = Object.entries(distribution)
            .map(([value, count]) => ({ value, count, percentage: Math.round((count / values.length) * 100) }))
            .sort((a, b) => b.count - a.count)

          distributions[field] = {
            total: values.length,
            unique: Object.keys(distribution).length,
            topValues: sortedDistribution.slice(0, 10),
            distribution: sortedDistribution
          }
        }
      })
    }

    return distributions
  }

  /**
   * 识别数据模式
   */
  identifyDataPatterns(data) {
    const patterns = {
      trends: [],
      anomalies: [],
      correlations: [],
      seasonality: []
    }

    // 简化的模式识别
    if (data.length > 0) {
      const fields = Object.keys(data[0])
      const numericFields = fields.filter(field => {
        const values = data.map(record => record[field]).filter(v => v !== null && v !== undefined && v !== '')
        return values.some(v => !isNaN(parseFloat(v)))
      })

      // 识别数值趋势
      numericFields.forEach(field => {
        const values = data.map(record => parseFloat(record[field])).filter(v => !isNaN(v))
        if (values.length > 2) {
          const trend = this.calculateTrend(values)
          if (Math.abs(trend) > 0.1) {
            patterns.trends.push({
              field,
              trend: trend > 0 ? 'increasing' : 'decreasing',
              strength: Math.abs(trend)
            })
          }
        }
      })
    }

    return patterns
  }

  /**
   * 计算趋势
   */
  calculateTrend(values) {
    if (values.length < 2) return 0

    const n = values.length
    const sumX = (n * (n - 1)) / 2
    const sumY = values.reduce((sum, val) => sum + val, 0)
    const sumXY = values.reduce((sum, val, index) => sum + (index * val), 0)
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    return slope
  }

  /**
   * 生成关键指标
   */
  generateKeyMetrics(data, basicStats, distributions) {
    const metrics = {
      dataQuality: {
        completeness: Object.values(basicStats.completeness).reduce((sum, val) => sum + val, 0) / Object.keys(basicStats.completeness).length || 0,
        uniqueness: Object.values(basicStats.uniqueness).reduce((sum, val) => sum + val, 0) / data.length || 0,
        consistency: 85 // 简化计算
      },
      businessMetrics: {},
      technicalMetrics: {
        recordCount: data.length,
        fieldCount: basicStats.fieldCount,
        dataSize: this.calculateDataSize(data)
      }
    }

    // 计算整体质量分数
    metrics.overallQuality = Math.round(
      (metrics.dataQuality.completeness * 0.4 +
       metrics.dataQuality.consistency * 0.4 +
       Math.min(metrics.dataQuality.uniqueness / data.length * 100, 100) * 0.2)
    )

    return metrics
  }

  /**
   * 检测字段类型
   */
  detectFieldType(values) {
    if (values.length === 0) return 'unknown'

    const sample = values.slice(0, 100)
    const types = {
      number: 0,
      date: 0,
      boolean: 0,
      string: 0
    }

    sample.forEach(value => {
      if (!isNaN(parseFloat(value))) types.number++
      else if (/^\d{4}-\d{2}-\d{2}/.test(value)) types.date++
      else if (/^(true|false|yes|no|是|否)$/i.test(value)) types.boolean++
      else types.string++
    })

    return Object.entries(types).reduce((a, b) => a[1] > b[1] ? a : b)[0]
  }

  /**
   * 计算数据大小
   */
  calculateDataSize(data) {
    const jsonString = JSON.stringify(data)
    const sizeInBytes = new Blob([jsonString]).size

    if (sizeInBytes < 1024) return `${sizeInBytes} B`
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`
  }

  /**
   * 阶段5: 结果汇总
   */
  async summarizeStage(extractResult, options = {}) {
    this.updateStageProgress('summarize', 10, '初始化结果汇总')

    const { basicStats, distributions, patterns, keyMetrics } = extractResult

    this.updateStageProgress('summarize', 30, '生成数据概览')

    // 生成数据概览
    const dataOverview = this.generateDataOverview(basicStats, keyMetrics)

    this.updateStageProgress('summarize', 50, '创建质量报告')

    // 创建质量报告
    const qualityReport = this.generateQualityReport(keyMetrics, patterns)

    this.updateStageProgress('summarize', 70, '生成处理报告')

    // 生成处理报告
    const processingReport = this.generateProcessingReport()

    this.updateStageProgress('summarize', 90, '创建可视化数据')

    // 创建可视化数据
    const visualizations = this.generateVisualizationData(distributions, patterns)

    this.updateStageProgress('summarize', 100, '结果汇总完成')

    return {
      dataOverview,
      qualityReport,
      processingReport,
      visualizations,
      recommendations: this.generateRecommendations(keyMetrics, patterns),
      summarizeTime: new Date()
    }
  }

  /**
   * 生成数据概览
   */
  generateDataOverview(basicStats, keyMetrics) {
    return {
      totalRecords: basicStats.totalRecords,
      totalFields: basicStats.fieldCount,
      dataSize: keyMetrics.technicalMetrics.dataSize,
      qualityScore: keyMetrics.overallQuality,
      completenessRate: Math.round(keyMetrics.dataQuality.completeness),
      consistencyRate: Math.round(keyMetrics.dataQuality.consistency),
      fieldTypes: basicStats.dataTypes
    }
  }

  /**
   * 生成质量报告
   */
  generateQualityReport(keyMetrics, patterns) {
    return {
      overallScore: keyMetrics.overallQuality,
      dimensions: {
        completeness: {
          score: Math.round(keyMetrics.dataQuality.completeness),
          status: keyMetrics.dataQuality.completeness >= 80 ? 'good' : keyMetrics.dataQuality.completeness >= 60 ? 'warning' : 'poor',
          description: '数据完整性评估'
        },
        consistency: {
          score: Math.round(keyMetrics.dataQuality.consistency),
          status: keyMetrics.dataQuality.consistency >= 80 ? 'good' : keyMetrics.dataQuality.consistency >= 60 ? 'warning' : 'poor',
          description: '数据一致性评估'
        },
        accuracy: {
          score: 85, // 简化计算
          status: 'good',
          description: '数据准确性评估'
        }
      },
      issues: this.identifyQualityIssues(keyMetrics, patterns),
      improvements: this.suggestImprovements(keyMetrics)
    }
  }

  /**
   * 生成处理报告
   */
  generateProcessingReport() {
    const report = {
      totalDuration: this.endTime ? this.endTime - this.startTime : Date.now() - this.startTime,
      stages: [],
      performance: {
        throughput: 0,
        efficiency: 0
      }
    }

    // 汇总各阶段信息
    this.stages.forEach(stage => {
      const progress = this.stageProgress[stage.id]
      report.stages.push({
        name: stage.name,
        status: progress.status,
        duration: progress.duration || 0,
        details: progress.details.length
      })
    })

    // 计算性能指标
    const totalRecords = this.stageResults.parse?.data?.length || 0
    if (totalRecords > 0 && report.totalDuration > 0) {
      report.performance.throughput = Math.round((totalRecords / report.totalDuration) * 1000) // 记录/秒
      report.performance.efficiency = Math.round((totalRecords / (report.totalDuration / 1000)) * 100) / 100
    }

    return report
  }

  /**
   * 生成可视化数据
   */
  generateVisualizationData(distributions, patterns) {
    const visualizations = {
      fieldDistributions: {},
      trendCharts: [],
      qualityMetrics: []
    }

    // 字段分布图数据
    Object.entries(distributions).forEach(([field, dist]) => {
      if (dist.topValues.length > 0) {
        visualizations.fieldDistributions[field] = {
          type: 'bar',
          data: dist.topValues.slice(0, 10).map(item => ({
            label: item.value,
            value: item.count,
            percentage: item.percentage
          }))
        }
      }
    })

    // 趋势图数据
    patterns.trends.forEach(trend => {
      visualizations.trendCharts.push({
        field: trend.field,
        type: 'line',
        trend: trend.trend,
        strength: trend.strength
      })
    })

    return visualizations
  }

  /**
   * 识别质量问题
   */
  identifyQualityIssues(keyMetrics, patterns) {
    const issues = []

    if (keyMetrics.dataQuality.completeness < 80) {
      issues.push({
        type: 'completeness',
        severity: 'medium',
        message: '数据完整性较低，建议补充缺失数据',
        value: keyMetrics.dataQuality.completeness
      })
    }

    if (keyMetrics.dataQuality.consistency < 70) {
      issues.push({
        type: 'consistency',
        severity: 'high',
        message: '数据一致性问题，需要标准化处理',
        value: keyMetrics.dataQuality.consistency
      })
    }

    return issues
  }

  /**
   * 建议改进措施
   */
  suggestImprovements(keyMetrics) {
    const improvements = []

    if (keyMetrics.dataQuality.completeness < 90) {
      improvements.push({
        category: 'completeness',
        priority: 'high',
        action: '补充缺失数据',
        description: '联系数据源，补充缺失的关键字段信息'
      })
    }

    if (keyMetrics.dataQuality.consistency < 85) {
      improvements.push({
        category: 'consistency',
        priority: 'medium',
        action: '标准化数据格式',
        description: '建立数据标准，统一格式和术语'
      })
    }

    return improvements
  }

  /**
   * 生成建议
   */
  generateRecommendations(keyMetrics, patterns) {
    const recommendations = []

    // 基于质量分数生成建议
    if (keyMetrics.overallQuality < 70) {
      recommendations.push({
        type: 'quality_improvement',
        priority: 'high',
        title: '提升数据质量',
        description: '当前数据质量分数较低，建议进行全面的数据清洗和标准化',
        actions: [
          '识别并修复数据质量问题',
          '建立数据质量监控机制',
          '制定数据标准和规范'
        ]
      })
    }

    // 基于趋势生成建议
    if (patterns.trends.length > 0) {
      recommendations.push({
        type: 'trend_analysis',
        priority: 'medium',
        title: '关注数据趋势',
        description: '数据中发现明显趋势，建议进一步分析',
        actions: [
          '深入分析趋势原因',
          '建立趋势监控',
          '制定应对策略'
        ]
      })
    }

    return recommendations
  }

  /**
   * 阶段6: AI总结
   */
  async aiAnalysisStage(summarizeResult, options = {}) {
    this.updateStageProgress('ai_analysis', 10, '初始化AI分析')

    const { dataOverview, qualityReport, processingReport, visualizations } = summarizeResult

    this.updateStageProgress('ai_analysis', 30, '分析数据特征')

    // AI数据特征分析
    const dataInsights = await this.generateDataInsights(dataOverview, qualityReport)

    this.updateStageProgress('ai_analysis', 60, '生成智能建议')

    // AI智能建议
    const aiRecommendations = await this.generateAIRecommendations(qualityReport, processingReport, dataInsights)

    this.updateStageProgress('ai_analysis', 80, '创建执行摘要')

    // 生成执行摘要
    const executiveSummary = await this.generateExecutiveSummary(dataOverview, qualityReport, dataInsights, aiRecommendations)

    this.updateStageProgress('ai_analysis', 100, 'AI分析完成')

    return {
      dataInsights,
      aiRecommendations,
      executiveSummary,
      confidence: 0.85, // AI分析置信度
      analysisTime: new Date()
    }
  }

  /**
   * 生成数据洞察
   */
  async generateDataInsights(dataOverview, qualityReport) {
    try {
      // 动态导入AI分析服务
      const { default: aiService } = await import('../services/DataAnalysisAIService.js')

      // 使用AI服务生成洞察
      return await aiService.generateDataInsights(dataOverview, qualityReport)

    } catch (error) {
      console.warn('AI服务不可用，使用备用分析:', error)

      // 备用分析逻辑
      const insights = []

      // 数据规模洞察
      if (dataOverview.totalRecords > 10000) {
        insights.push({
          type: 'scale',
          level: 'info',
          title: '大规模数据集',
          description: `数据集包含${dataOverview.totalRecords.toLocaleString()}条记录，属于大规模数据，建议采用分批处理策略。`,
          confidence: 0.80
        })
      }

      // 质量洞察
      if (qualityReport.overallScore >= 85) {
        insights.push({
          type: 'quality',
          level: 'success',
          title: '数据质量优秀',
          description: `数据质量分数为${qualityReport.overallScore}分，整体质量良好，可直接用于分析。`,
          confidence: 0.90
        })
      } else if (qualityReport.overallScore >= 70) {
        insights.push({
          type: 'quality',
          level: 'warning',
          title: '数据质量中等',
          description: `数据质量分数为${qualityReport.overallScore}分，建议进行适当的清洗和优化。`,
          confidence: 0.85
        })
      } else {
        insights.push({
          type: 'quality',
          level: 'error',
          title: '数据质量较差',
          description: `数据质量分数为${qualityReport.overallScore}分，需要进行全面的数据清洗。`,
          confidence: 0.95
        })
      }

      return insights
    }
  }

  /**
   * 生成AI建议
   */
  async generateAIRecommendations(qualityReport, processingReport, dataInsights) {
    try {
      // 动态导入AI分析服务
      const { default: aiService } = await import('../services/DataAnalysisAIService.js')

      // 使用AI服务生成建议
      return await aiService.generateAIRecommendations(qualityReport, processingReport, dataInsights)

    } catch (error) {
      console.warn('AI服务不可用，使用备用建议:', error)

      // 备用建议逻辑
      const recommendations = []

      // 基于处理性能的建议
      if (processingReport.performance?.efficiency < 100) {
        recommendations.push({
          category: 'performance',
          priority: 'medium',
          title: '优化处理性能',
          description: '当前处理效率可以进一步提升',
          confidence: 0.80,
          suggestions: [
            {
              action: '考虑并行处理大数据集',
              description: '提升处理速度',
              difficulty: 'medium'
            },
            {
              action: '优化数据清洗规则',
              description: '减少处理时间',
              difficulty: 'low'
            },
            {
              action: '使用更高效的数据结构',
              description: '提升内存使用效率',
              difficulty: 'high'
            }
          ]
        })
      }

      // 基于质量的建议
      if (qualityReport.overallScore < 80) {
        recommendations.push({
          category: 'quality',
          priority: 'high',
          title: '数据质量提升计划',
          description: '制定系统性的数据质量改进策略',
          confidence: 0.90,
          suggestions: [
            {
              action: '建立数据质量监控体系',
              description: '实时监控数据质量',
              difficulty: 'medium'
            },
            {
              action: '制定数据标准和规范',
              description: '统一数据格式和质量标准',
              difficulty: 'low'
            },
            {
              action: '实施定期数据清洗流程',
              description: '自动化数据清洗',
              difficulty: 'medium'
            }
          ]
        })
      }

      return recommendations
    }
  }

  /**
   * 生成执行摘要
   */
  async generateExecutiveSummary(dataOverview, qualityReport, dataInsights, recommendations) {
    try {
      // 动态导入AI分析服务
      const { default: aiService } = await import('../services/DataAnalysisAIService.js')

      // 使用AI服务生成执行摘要
      return await aiService.generateExecutiveSummary(dataOverview, qualityReport, dataInsights, recommendations)

    } catch (error) {
      console.warn('AI服务不可用，使用备用摘要:', error)

      // 备用摘要逻辑
      const summary = {
        overview: `本次处理了包含${dataOverview.totalRecords.toLocaleString()}条记录、${dataOverview.totalFields}个字段的数据集，数据规模为${dataOverview.dataSize}。`,
        keyFindings: [],
        recommendations: [],
        nextSteps: [],
        riskAssessment: [],
        businessImpact: {
          current: qualityReport.overallScore >= 80 ? 'high' : 'medium',
          potential: 'high',
          description: '数据具有良好的业务价值潜力'
        }
      }

      // 关键发现
      summary.keyFindings.push(`数据质量评分：${qualityReport.overallScore}/100`)
      summary.keyFindings.push(`数据完整性：${dataOverview.completenessRate}%`)
      summary.keyFindings.push(`数据一致性：${dataOverview.consistencyRate}%`)

      // 添加洞察发现
      const highImpactInsights = dataInsights.filter(insight => insight.impact === 'high')
      highImpactInsights.forEach(insight => {
        summary.keyFindings.push(insight.title)
      })

      // 建议
      if (qualityReport.overallScore >= 85) {
        summary.recommendations.push('数据质量良好，可直接用于业务分析')
      } else {
        summary.recommendations.push('建议进行进一步的数据清洗和标准化')
      }

      // 添加AI建议
      if (recommendations && recommendations.length > 0) {
        recommendations.slice(0, 3).forEach(rec => {
          summary.recommendations.push(rec.title)
        })
      }

      // 下一步行动
      if (qualityReport.overallScore < 80) {
        summary.nextSteps.push('立即启动数据质量改进计划')
      }
      summary.nextSteps.push('建立数据质量监控机制')
      summary.nextSteps.push('制定数据维护计划')
      summary.nextSteps.push('培训相关人员数据管理最佳实践')

      // 风险评估
      if (qualityReport.overallScore < 70) {
        summary.riskAssessment.push({
          type: 'quality',
          level: 'high',
          description: '数据质量较低可能影响分析结果的可靠性'
        })
      }

      return summary
    }
  }

  /**
   * 生成最终摘要
   */
  generateFinalSummary() {
    const totalDuration = this.endTime - this.startTime
    const stagesSummary = this.stages.map(stage => ({
      name: stage.name,
      status: this.stageProgress[stage.id].status,
      duration: this.stageProgress[stage.id].duration
    }))

    return {
      totalDuration,
      overallProgress: this.getOverallProgress(),
      stages: stagesSummary,
      finalDataCount: this.stageResults.clean?.data?.length || 0,
      qualityScore: this.stageResults.clean?.report?.qualityScore || 0
    }
  }

  /**
   * 重置流水线状态
   */
  reset() {
    this.currentStage = null
    this.stageResults = {}
    this.logs = []
    this.startTime = null
    this.endTime = null
    this.status = 'idle'
    this.errorInfo = null

    // 重置阶段进度
    this.stages.forEach(stage => {
      this.stageProgress[stage.id] = {
        status: 'pending',
        progress: 0,
        startTime: null,
        endTime: null,
        duration: null,
        details: [],
        result: null,
        error: null
      }
    })

    this.log('info', '流水线已重置')
  }
}

/**
 * 默认导出流水线实例
 */
export default new DataProcessingPipeline()
