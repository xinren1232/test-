/**
 * 数据清洗引擎
 * 提供完整的数据清洗功能，包括规则应用、质量评估、统计分析等
 */

/**
 * 清洗规则定义
 */
export const CLEANING_RULES = {
  // 基础清洗规则
  REMOVE_EMPTY: {
    id: 'remove_empty',
    name: '去除空值',
    description: '移除空白、null、undefined等无效数据',
    category: 'basic',
    apply: (data) => {
      return data.filter(item => {
        return Object.values(item).some(value => 
          value !== null && value !== undefined && value !== '' && String(value).trim() !== ''
        )
      })
    }
  },

  TRIM_WHITESPACE: {
    id: 'trim_whitespace',
    name: '去除空白字符',
    description: '移除字段值前后的空白字符',
    category: 'basic',
    apply: (data) => {
      return data.map(item => {
        const cleaned = {}
        Object.keys(item).forEach(key => {
          const value = item[key]
          cleaned[key] = typeof value === 'string' ? value.trim() : value
        })
        return cleaned
      })
    }
  },

  REMOVE_DUPLICATES: {
    id: 'remove_duplicates',
    name: '去除重复数据',
    description: '基于关键字段去除重复记录',
    category: 'basic',
    apply: (data, options = {}) => {
      const keyFields = options.keyFields || ['materialCode', 'id']
      const seen = new Set()
      
      return data.filter(item => {
        const key = keyFields.map(field => item[field]).join('|')
        if (seen.has(key)) {
          return false
        }
        seen.add(key)
        return true
      })
    }
  },

  STANDARDIZE_TERMS: {
    id: 'standardize_terms',
    name: '术语标准化',
    description: '统一术语和表达方式',
    category: 'advanced',
    apply: (data) => {
      const termMapping = {
        // 问题类型标准化
        '质量问题': '质量异常',
        '品质问题': '质量异常',
        '不良': '质量异常',
        '缺陷': '质量异常',
        
        // 状态标准化
        '已解决': '已完成',
        '已处理': '已完成',
        '完成': '已完成',
        '待处理': '进行中',
        '处理中': '进行中',
        
        // 部门标准化
        '品质部': '质量部',
        '品管部': '质量部',
        'QC': '质量部',
        'QA': '质量部'
      }

      return data.map(item => {
        const standardized = {}
        Object.keys(item).forEach(key => {
          let value = item[key]
          if (typeof value === 'string') {
            // 应用术语映射
            Object.keys(termMapping).forEach(oldTerm => {
              value = value.replace(new RegExp(oldTerm, 'g'), termMapping[oldTerm])
            })
          }
          standardized[key] = value
        })
        return standardized
      })
    }
  },

  FORMAT_DATE: {
    id: 'format_date',
    name: '日期格式化',
    description: '统一日期格式为 YYYY-MM-DD',
    category: 'format',
    apply: (data) => {
      const dateFields = ['date', 'createTime', 'updateTime', 'occurTime', 'solveTime']
      
      return data.map(item => {
        const formatted = { ...item }
        dateFields.forEach(field => {
          if (formatted[field]) {
            formatted[field] = formatDate(formatted[field])
          }
        })
        return formatted
      })
    }
  },

  FORMAT_NUMBER: {
    id: 'format_number',
    name: '数值格式化',
    description: '统一数值格式，保留适当小数位',
    category: 'format',
    apply: (data) => {
      const numberFields = ['quantity', 'amount', 'rate', 'percentage', 'score']
      
      return data.map(item => {
        const formatted = { ...item }
        numberFields.forEach(field => {
          if (formatted[field] && !isNaN(formatted[field])) {
            formatted[field] = parseFloat(formatted[field]).toFixed(2)
          }
        })
        return formatted
      })
    }
  },

  EXTRACT_KEYWORDS: {
    id: 'extract_keywords',
    name: '关键词提取',
    description: '从描述性文本中提取关键词',
    category: 'advanced',
    apply: (data) => {
      const textFields = ['description', 'analysis', 'solution', 'remark']
      
      return data.map(item => {
        const enhanced = { ...item }
        textFields.forEach(field => {
          if (enhanced[field]) {
            enhanced[`${field}_keywords`] = extractKeywords(enhanced[field])
          }
        })
        return enhanced
      })
    }
  },

  VALIDATE_REQUIRED: {
    id: 'validate_required',
    name: '必填字段验证',
    description: '验证必填字段的完整性',
    category: 'validation',
    apply: (data, options = {}) => {
      const requiredFields = options.requiredFields || ['materialCode', 'materialName']

      return data.map(item => {
        const validated = { ...item }
        validated._validation = {
          isValid: true,
          missingFields: []
        }

        requiredFields.forEach(field => {
          if (!validated[field] || String(validated[field]).trim() === '') {
            validated._validation.isValid = false
            validated._validation.missingFields.push(field)
          }
        })

        return validated
      })
    }
  },

  // 高级清洗规则
  NORMALIZE_PHONE: {
    id: 'normalize_phone',
    name: '电话号码标准化',
    description: '统一电话号码格式',
    category: 'format',
    apply: (data) => {
      const phoneFields = ['phone', 'mobile', 'telephone', 'contact']

      return data.map(item => {
        const normalized = { ...item }
        phoneFields.forEach(field => {
          if (normalized[field]) {
            normalized[field] = normalizePhone(normalized[field])
          }
        })
        return normalized
      })
    }
  },

  NORMALIZE_EMAIL: {
    id: 'normalize_email',
    name: '邮箱地址标准化',
    description: '统一邮箱地址格式',
    category: 'format',
    apply: (data) => {
      const emailFields = ['email', 'mail', 'emailAddress', 'contactEmail']

      return data.map(item => {
        const normalized = { ...item }
        emailFields.forEach(field => {
          if (normalized[field]) {
            normalized[field] = normalizeEmail(normalized[field])
          }
        })
        return normalized
      })
    }
  },

  VALIDATE_EMAIL: {
    id: 'validate_email',
    name: '邮箱格式验证',
    description: '验证邮箱地址格式的有效性',
    category: 'validation',
    apply: (data) => {
      const emailFields = ['email', 'mail', 'emailAddress', 'contactEmail']

      return data.filter(item => {
        let isValid = true
        emailFields.forEach(field => {
          if (item[field] && !isValidEmail(item[field])) {
            isValid = false
          }
        })
        return isValid
      })
    }
  },

  STANDARDIZE_CURRENCY: {
    id: 'standardize_currency',
    name: '货币格式标准化',
    description: '统一货币金额格式',
    category: 'format',
    apply: (data) => {
      const currencyFields = ['price', 'amount', 'cost', 'value', 'salary']

      return data.map(item => {
        const standardized = { ...item }
        currencyFields.forEach(field => {
          if (standardized[field]) {
            standardized[field] = standardizeCurrency(standardized[field])
          }
        })
        return standardized
      })
    }
  },

  REMOVE_OUTLIERS: {
    id: 'remove_outliers',
    name: '移除异常值',
    description: '基于统计方法移除数值异常值',
    category: 'advanced',
    apply: (data, options = {}) => {
      const numericFields = options.numericFields || ['price', 'amount', 'quantity', 'score']
      const method = options.method || 'iqr' // iqr, zscore
      const threshold = options.threshold || 1.5

      return data.filter(item => {
        let isValid = true
        numericFields.forEach(field => {
          if (item[field] && !isNaN(parseFloat(item[field]))) {
            const value = parseFloat(item[field])
            if (method === 'iqr') {
              const values = data.map(d => parseFloat(d[field])).filter(v => !isNaN(v)).sort((a, b) => a - b)
              const q1 = values[Math.floor(values.length * 0.25)]
              const q3 = values[Math.floor(values.length * 0.75)]
              const iqr = q3 - q1
              const lowerBound = q1 - threshold * iqr
              const upperBound = q3 + threshold * iqr

              if (value < lowerBound || value > upperBound) {
                isValid = false
              }
            }
          }
        })
        return isValid
      })
    }
  },

  GEOCODE_ADDRESS: {
    id: 'geocode_address',
    name: '地址地理编码',
    description: '将地址转换为经纬度坐标',
    category: 'advanced',
    apply: (data, options = {}) => {
      const addressFields = options.addressFields || ['address', 'location', 'addr']

      return data.map(item => {
        const geocoded = { ...item }
        addressFields.forEach(field => {
          if (geocoded[field]) {
            // 模拟地理编码（实际应用中需要调用地理编码API）
            const mockCoords = generateMockCoordinates(geocoded[field])
            geocoded[`${field}_lat`] = mockCoords.lat
            geocoded[`${field}_lng`] = mockCoords.lng
          }
        })
        return geocoded
      })
    }
  },

  CATEGORIZE_TEXT: {
    id: 'categorize_text',
    name: '文本自动分类',
    description: '基于关键词对文本进行自动分类',
    category: 'advanced',
    apply: (data, options = {}) => {
      const textFields = options.textFields || ['description', 'content', 'remark']
      const categories = options.categories || {
        '技术': ['技术', '系统', '软件', '硬件', '网络'],
        '质量': ['质量', '缺陷', '不良', '检验', '测试'],
        '服务': ['服务', '客户', '支持', '咨询', '投诉'],
        '其他': []
      }

      return data.map(item => {
        const categorized = { ...item }
        textFields.forEach(field => {
          if (categorized[field]) {
            categorized[`${field}_category`] = categorizeText(categorized[field], categories)
          }
        })
        return categorized
      })
    }
  },

  MERGE_SIMILAR_RECORDS: {
    id: 'merge_similar_records',
    name: '合并相似记录',
    description: '基于相似度合并重复或相似的记录',
    category: 'advanced',
    apply: (data, options = {}) => {
      const keyFields = options.keyFields || ['name', 'code', 'id']
      const threshold = options.threshold || 0.8

      const merged = []
      const processed = new Set()

      data.forEach((item, index) => {
        if (processed.has(index)) return

        const similar = []
        for (let i = index + 1; i < data.length; i++) {
          if (processed.has(i)) continue

          const similarity = calculateRecordSimilarity(item, data[i], keyFields)
          if (similarity >= threshold) {
            similar.push(i)
            processed.add(i)
          }
        }

        if (similar.length > 0) {
          // 合并相似记录
          const mergedRecord = mergeRecords([item, ...similar.map(i => data[i])])
          merged.push(mergedRecord)
        } else {
          merged.push(item)
        }

        processed.add(index)
      })

      return merged
    }
  },

  ENRICH_DATA: {
    id: 'enrich_data',
    name: '数据增强',
    description: '基于现有数据生成额外的有用字段',
    category: 'advanced',
    apply: (data, options = {}) => {
      return data.map(item => {
        const enriched = { ...item }

        // 生成全名字段
        if (enriched.firstName && enriched.lastName) {
          enriched.fullName = `${enriched.firstName} ${enriched.lastName}`
        }

        // 计算年龄
        if (enriched.birthDate) {
          enriched.age = calculateAge(enriched.birthDate)
        }

        // 生成唯一标识
        if (!enriched.id && (enriched.name || enriched.code)) {
          enriched.id = generateUniqueId(enriched.name || enriched.code)
        }

        // 添加处理时间戳
        enriched._processedAt = new Date().toISOString()

        return enriched
      })
    }
  }
}

/**
 * 数据清洗引擎类
 */
export class DataCleaningEngine {
  constructor() {
    this.rules = { ...CLEANING_RULES }
    this.logs = []
    this.statistics = {
      originalCount: 0,
      processedCount: 0,
      removedCount: 0,
      modifiedCount: 0,
      qualityScore: 0
    }
    this.analysisResults = {
      fieldAnalysis: {},
      duplicateAnalysis: {},
      dataQualityIssues: [],
      recommendations: []
    }
  }

  /**
   * 数据预分析 - 在清洗前进行全面的数据分析
   */
  async analyzeData(data) {
    this.log('info', `开始数据预分析，数据量: ${data.length}`)

    const analysis = {
      fieldAnalysis: this.analyzeFields(data),
      duplicateAnalysis: this.analyzeDuplicates(data),
      dataTypeAnalysis: this.analyzeDataTypes(data),
      qualityIssues: this.identifyQualityIssues(data),
      statisticalSummary: this.generateStatisticalSummary(data),
      recommendations: []
    }

    // 基于分析结果生成建议
    analysis.recommendations = this.generateAnalysisRecommendations(analysis)

    this.analysisResults = analysis
    this.log('info', '数据预分析完成')

    return analysis
  }

  /**
   * 字段分析 - 分析每个字段的完整性、类型、分布等
   */
  analyzeFields(data) {
    if (data.length === 0) return {}

    const fieldAnalysis = {}
    const allFields = new Set()

    // 收集所有字段
    data.forEach(record => {
      Object.keys(record).forEach(field => allFields.add(field))
    })

    // 分析每个字段
    allFields.forEach(fieldName => {
      const fieldData = data.map(record => record[fieldName]).filter(value => value !== undefined)

      fieldAnalysis[fieldName] = {
        // 基本统计
        totalRecords: data.length,
        filledRecords: fieldData.filter(value => this.isValueFilled(value)).length,
        emptyRecords: fieldData.filter(value => !this.isValueFilled(value)).length,
        missingRecords: data.length - fieldData.length,

        // 完整性指标
        completenessRate: this.calculateCompletenessRate(fieldData, data.length),

        // 数据类型分析
        dataTypes: this.analyzeFieldDataTypes(fieldData),

        // 唯一值分析
        uniqueValues: new Set(fieldData.filter(v => this.isValueFilled(v))).size,
        duplicateValues: this.findDuplicateValues(fieldData),

        // 值分布
        valueDistribution: this.analyzeValueDistribution(fieldData),

        // 数据质量问题
        qualityIssues: this.identifyFieldQualityIssues(fieldName, fieldData),

        // 格式一致性
        formatConsistency: this.analyzeFormatConsistency(fieldData),

        // 统计信息（针对数值字段）
        statistics: this.calculateFieldStatistics(fieldData)
      }
    })

    return fieldAnalysis
  }

  /**
   * 重复数据分析
   */
  analyzeDuplicates(data) {
    const duplicateAnalysis = {
      totalRecords: data.length,
      uniqueRecords: 0,
      duplicateRecords: 0,
      duplicateGroups: [],
      duplicateFields: {},
      similarRecords: []
    }

    // 完全重复记录分析
    const recordMap = new Map()
    const duplicateGroups = []

    data.forEach((record, index) => {
      const recordKey = JSON.stringify(this.normalizeRecord(record))

      if (recordMap.has(recordKey)) {
        recordMap.get(recordKey).push({ index, record })
      } else {
        recordMap.set(recordKey, [{ index, record }])
      }
    })

    recordMap.forEach((group, key) => {
      if (group.length > 1) {
        duplicateGroups.push({
          key,
          count: group.length,
          records: group,
          similarity: 100 // 完全重复
        })
      }
    })

    duplicateAnalysis.duplicateGroups = duplicateGroups
    duplicateAnalysis.duplicateRecords = duplicateGroups.reduce((sum, group) => sum + group.count - 1, 0)
    duplicateAnalysis.uniqueRecords = data.length - duplicateAnalysis.duplicateRecords

    // 字段级重复分析
    if (data.length > 0) {
      Object.keys(data[0]).forEach(fieldName => {
        duplicateAnalysis.duplicateFields[fieldName] = this.analyzeFieldDuplicates(data, fieldName)
      })
    }

    // 相似记录分析（基于关键字段）
    duplicateAnalysis.similarRecords = this.findSimilarRecords(data)

    return duplicateAnalysis
  }

  /**
   * 数据类型分析
   */
  analyzeDataTypes(data) {
    const typeAnalysis = {}

    if (data.length === 0) return typeAnalysis

    Object.keys(data[0]).forEach(fieldName => {
      const values = data.map(record => record[fieldName]).filter(v => this.isValueFilled(v))

      typeAnalysis[fieldName] = {
        detectedType: this.detectDataType(values),
        typeDistribution: this.getTypeDistribution(values),
        typeConsistency: this.calculateTypeConsistency(values),
        conversionSuggestions: this.suggestTypeConversions(values)
      }
    })

    return typeAnalysis
  }

  /**
   * 识别数据质量问题
   */
  identifyQualityIssues(data) {
    const issues = []

    // 检查数据完整性
    const completenessIssues = this.checkDataCompleteness(data)
    issues.push(...completenessIssues)

    // 检查数据一致性
    const consistencyIssues = this.checkDataConsistency(data)
    issues.push(...consistencyIssues)

    // 检查数据准确性
    const accuracyIssues = this.checkDataAccuracy(data)
    issues.push(...accuracyIssues)

    // 检查数据有效性
    const validityIssues = this.checkDataValidity(data)
    issues.push(...validityIssues)

    // 检查异常值
    const outlierIssues = this.detectOutliers(data)
    issues.push(...outlierIssues)

    return issues
  }

  /**
   * 生成统计摘要
   */
  generateStatisticalSummary(data) {
    return {
      totalRecords: data.length,
      totalFields: data.length > 0 ? Object.keys(data[0]).length : 0,
      dataSize: this.calculateDataSize(data),
      recordCompleteness: this.calculateOverallCompleteness(data),
      dataQualityScore: this.calculateDataQualityScore(data),
      fieldTypes: this.summarizeFieldTypes(data),
      valueRanges: this.summarizeValueRanges(data)
    }
  }

  /**
   * 注册自定义清洗规则
   */
  registerRule(rule) {
    this.rules[rule.id.toUpperCase()] = rule
    this.log('info', `注册自定义规则: ${rule.name}`)
  }

  /**
   * 应用清洗规则
   */
  async applyRules(data, ruleIds, options = {}) {
    this.log('info', `开始数据清洗，原始记录数: ${data.length}`)
    this.statistics.originalCount = data.length

    let processedData = [...data]
    let modifiedCount = 0

    for (const ruleId of ruleIds) {
      const rule = this.rules[ruleId.toUpperCase()]
      if (!rule) {
        this.log('warn', `未找到清洗规则: ${ruleId}`)
        continue
      }

      try {
        const beforeCount = processedData.length
        const beforeData = JSON.stringify(processedData)

        processedData = rule.apply(processedData, options[ruleId])

        const afterCount = processedData.length
        const afterData = JSON.stringify(processedData)

        const removedRecords = beforeCount - afterCount
        const dataChanged = beforeData !== afterData

        if (removedRecords > 0) {
          this.statistics.removedCount += removedRecords
          this.log('info', `规则 ${rule.name} 移除了 ${removedRecords} 条记录`)
        }

        if (dataChanged) {
          modifiedCount++
          this.log('info', `规则 ${rule.name} 修改了数据内容`)
        }

        this.log('info', `应用规则: ${rule.name}`)

        // 模拟处理时间
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        this.log('error', `规则 ${rule.name} 执行失败: ${error.message}`)
      }
    }

    this.statistics.processedCount = processedData.length
    this.statistics.modifiedCount = modifiedCount
    this.statistics.qualityScore = this.calculateQualityScore(processedData)

    this.log('info', `数据清洗完成，处理后记录数: ${processedData.length}`)

    return {
      data: processedData,
      statistics: this.statistics,
      logs: this.logs
    }
  }
  /**
   * 计算数据质量分数
   */
  calculateQualityScore(data) {
    if (data.length === 0) return 0

    let totalScore = 0
    const weights = {
      completeness: 0.4,  // 完整性
      accuracy: 0.3,      // 准确性
      consistency: 0.3    // 一致性
    }

    // 计算完整性分数
    const completenessScore = this.calculateCompleteness(data)

    // 计算准确性分数
    const accuracyScore = this.calculateAccuracy(data)

    // 计算一致性分数
    const consistencyScore = this.calculateConsistency(data)

    totalScore = (
      completenessScore * weights.completeness +
      accuracyScore * weights.accuracy +
      consistencyScore * weights.consistency
    )

    return Math.round(totalScore)
  }

  /**
   * 计算完整性分数
   */
  calculateCompleteness(data) {
    const requiredFields = ['materialCode', 'materialName', 'supplier']
    let totalFields = 0
    let filledFields = 0

    data.forEach(item => {
      requiredFields.forEach(field => {
        totalFields++
        if (item[field] && String(item[field]).trim() !== '') {
          filledFields++
        }
      })
    })

    return totalFields > 0 ? (filledFields / totalFields) * 100 : 0
  }

  /**
   * 计算准确性分数
   */
  calculateAccuracy(data) {
    let validRecords = 0

    data.forEach(item => {
      let isValid = true

      // 检查物料编码格式
      if (item.materialCode && !/^[A-Z]{2,3}-[A-Z0-9]{4,6}$/.test(item.materialCode)) {
        isValid = false
      }

      // 检查日期格式
      if (item.date && !/^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
        isValid = false
      }

      if (isValid) validRecords++
    })

    return data.length > 0 ? (validRecords / data.length) * 100 : 0
  }

  /**
   * 计算一致性分数
   */
  calculateConsistency(data) {
    const termVariations = this.findTermVariations(data)
    const maxVariations = Math.max(1, data.length * 0.1) // 允许10%的变异
    const actualVariations = Object.keys(termVariations).length

    const consistencyRatio = Math.max(0, (maxVariations - actualVariations) / maxVariations)
    return consistencyRatio * 100
  }

  /**
   * 查找术语变异
   */
  findTermVariations(data) {
    const variations = {}
    const textFields = ['issueType', 'status', 'department']

    data.forEach(item => {
      textFields.forEach(field => {
        if (item[field]) {
          const value = String(item[field]).toLowerCase()
          if (!variations[field]) variations[field] = new Set()
          variations[field].add(value)
        }
      })
    })

    return variations
  }

  /**
   * 记录日志
   */
  log(level, message) {
    const logEntry = {
      time: new Date().toISOString(),
      level,
      message,
      category: 'cleaning'
    }
    this.logs.push(logEntry)
    console.log(`[${level.toUpperCase()}] ${message}`)
  }

  /**
   * 获取清洗统计信息
   */
  getStatistics() {
    return {
      ...this.statistics,
      efficiency: this.statistics.originalCount > 0
        ? Math.round((this.statistics.processedCount / this.statistics.originalCount) * 100)
        : 0
    }
  }

  /**
   * 清除日志和统计信息
   */
  reset() {
    this.logs = []
    this.statistics = {
      originalCount: 0,
      processedCount: 0,
      removedCount: 0,
      modifiedCount: 0,
      qualityScore: 0
    }
  }

  /**
   * 辅助方法 - 检查值是否已填充
   */
  isValueFilled(value) {
    return value !== null && value !== undefined && value !== '' && String(value).trim() !== ''
  }

  /**
   * 计算完整性率
   */
  calculateCompletenessRate(fieldData, totalRecords) {
    const filledCount = fieldData.filter(value => this.isValueFilled(value)).length
    return totalRecords > 0 ? Math.round((filledCount / totalRecords) * 100) : 0
  }

  /**
   * 分析字段数据类型
   */
  analyzeFieldDataTypes(fieldData) {
    const types = {
      string: 0,
      number: 0,
      date: 0,
      boolean: 0,
      email: 0,
      phone: 0,
      url: 0,
      empty: 0
    }

    fieldData.forEach(value => {
      if (!this.isValueFilled(value)) {
        types.empty++
        return
      }

      const type = this.detectValueType(value)
      types[type] = (types[type] || 0) + 1
    })

    return types
  }

  /**
   * 检测值类型
   */
  detectValueType(value) {
    if (!this.isValueFilled(value)) return 'empty'

    const str = String(value).trim()

    // 检查布尔值
    if (/^(true|false|是|否|yes|no)$/i.test(str)) return 'boolean'

    // 检查数字
    if (/^\d+$/.test(str)) return 'number'
    if (/^\d+\.\d+$/.test(str)) return 'number'

    // 检查日期
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) return 'date'
    if (/^\d{4}\/\d{2}\/\d{2}/.test(str)) return 'date'

    // 检查邮箱
    if (this.isEmailString(str)) return 'email'

    // 检查电话
    if (/^[\d\-\+\(\)\s]{8,}$/.test(str)) return 'phone'

    // 检查URL
    if (/^https?:\/\//.test(str)) return 'url'

    return 'string'
  }

  /**
   * 检查是否为邮箱格式
   */
  isEmailString(str) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)
  }

  /**
   * 查找重复值
   */
  findDuplicateValues(fieldData) {
    const valueCount = {}
    const duplicates = []

    fieldData.forEach(value => {
      if (this.isValueFilled(value)) {
        const key = String(value)
        valueCount[key] = (valueCount[key] || 0) + 1
      }
    })

    Object.entries(valueCount).forEach(([value, count]) => {
      if (count > 1) {
        duplicates.push({ value, count })
      }
    })

    return duplicates
  }

  /**
   * 分析值分布
   */
  analyzeValueDistribution(fieldData) {
    const distribution = {}
    const filledData = fieldData.filter(v => this.isValueFilled(v))

    filledData.forEach(value => {
      const key = String(value)
      distribution[key] = (distribution[key] || 0) + 1
    })

    // 转换为数组并排序
    const sortedDistribution = Object.entries(distribution)
      .map(([value, count]) => ({ value, count, percentage: Math.round((count / filledData.length) * 100) }))
      .sort((a, b) => b.count - a.count)

    return {
      total: filledData.length,
      unique: Object.keys(distribution).length,
      topValues: sortedDistribution.slice(0, 10),
      distribution: sortedDistribution
    }
  }

  /**
   * 识别字段质量问题
   */
  identifyFieldQualityIssues(fieldName, fieldData) {
    const issues = []
    const filledData = fieldData.filter(v => this.isValueFilled(v))

    // 检查缺失率
    const missingRate = ((fieldData.length - filledData.length) / fieldData.length) * 100
    if (missingRate > 20) {
      issues.push({
        type: 'high_missing_rate',
        severity: missingRate > 50 ? 'high' : 'medium',
        message: `字段 ${fieldName} 缺失率过高: ${Math.round(missingRate)}%`,
        value: missingRate
      })
    }

    // 检查数据类型不一致
    const types = this.analyzeFieldDataTypes(fieldData)
    const typeCount = Object.values(types).filter(count => count > 0).length
    if (typeCount > 2) {
      issues.push({
        type: 'inconsistent_types',
        severity: 'medium',
        message: `字段 ${fieldName} 包含多种数据类型`,
        value: types
      })
    }

    return issues
  }

  /**
   * 分析格式一致性
   */
  analyzeFormatConsistency(fieldData) {
    const filledData = fieldData.filter(v => this.isValueFilled(v))
    if (filledData.length === 0) return { score: 100, issues: [] }

    const formats = {}
    const issues = []

    filledData.forEach(value => {
      const format = this.detectValueFormat(String(value))
      formats[format] = (formats[format] || 0) + 1
    })

    const formatCount = Object.keys(formats).length
    const dominantFormat = Object.entries(formats).reduce((a, b) => a[1] > b[1] ? a : b)[0]
    const dominantFormatCount = formats[dominantFormat]

    const consistencyScore = Math.round((dominantFormatCount / filledData.length) * 100)

    if (formatCount > 3) {
      issues.push({
        type: 'multiple_formats',
        message: `检测到 ${formatCount} 种不同格式`,
        formats: Object.entries(formats).map(([format, count]) => ({ format, count }))
      })
    }

    return {
      score: consistencyScore,
      dominantFormat,
      formatDistribution: formats,
      issues
    }
  }

  /**
   * 检测值格式
   */
  detectValueFormat(value) {
    const str = value.trim()

    // 数字格式
    if (/^\d+$/.test(str)) return 'integer'
    if (/^\d+\.\d+$/.test(str)) return 'decimal'
    if (/^\d{1,3}(,\d{3})*(\.\d+)?$/.test(str)) return 'formatted_number'

    // 日期格式
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return 'date_iso'
    if (/^\d{4}\/\d{2}\/\d{2}$/.test(str)) return 'date_slash'
    if (/^\d{4}年\d{1,2}月\d{1,2}日$/.test(str)) return 'date_chinese'

    // 编码格式
    if (/^[A-Z]{2,3}-[A-Z0-9]{4,6}$/.test(str)) return 'code_format'
    if (/^[A-Z0-9]{8,}$/.test(str)) return 'alphanumeric_code'

    // 文本格式
    if (/^[a-zA-Z\s]+$/.test(str)) return 'text_alpha'
    if (/^[\u4e00-\u9fa5\s]+$/.test(str)) return 'text_chinese'

    return 'mixed'
  }

  /**
   * 计算字段统计信息
   */
  calculateFieldStatistics(fieldData) {
    const numericData = fieldData
      .filter(v => this.isValueFilled(v))
      .map(v => parseFloat(String(v).replace(/[^\d.-]/g, '')))
      .filter(v => !isNaN(v))

    if (numericData.length === 0) return null

    const sorted = numericData.sort((a, b) => a - b)
    const sum = numericData.reduce((a, b) => a + b, 0)
    const mean = sum / numericData.length

    return {
      count: numericData.length,
      min: Math.min(...numericData),
      max: Math.max(...numericData),
      mean: Math.round(mean * 100) / 100,
      median: this.calculateMedian(sorted),
      mode: this.calculateMode(numericData),
      standardDeviation: this.calculateStandardDeviation(numericData, mean)
    }
  }

  /**
   * 计算中位数
   */
  calculateMedian(sortedArray) {
    const mid = Math.floor(sortedArray.length / 2)
    return sortedArray.length % 2 === 0
      ? (sortedArray[mid - 1] + sortedArray[mid]) / 2
      : sortedArray[mid]
  }

  /**
   * 计算众数
   */
  calculateMode(array) {
    const frequency = {}
    array.forEach(value => {
      frequency[value] = (frequency[value] || 0) + 1
    })

    const maxFreq = Math.max(...Object.values(frequency))
    const modes = Object.keys(frequency).filter(key => frequency[key] === maxFreq)

    return modes.length === array.length ? null : modes.map(Number)
  }

  /**
   * 计算标准差
   */
  calculateStandardDeviation(array, mean) {
    const squaredDiffs = array.map(value => Math.pow(value - mean, 2))
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / array.length
    return Math.round(Math.sqrt(avgSquaredDiff) * 100) / 100
  }

  /**
   * 规范化记录（用于重复检测）
   */
  normalizeRecord(record) {
    const normalized = {}
    Object.keys(record).forEach(key => {
      const value = record[key]
      if (this.isValueFilled(value)) {
        // 标准化字符串：去除空格、转小写
        normalized[key] = String(value).trim().toLowerCase()
      }
    })
    return normalized
  }

  /**
   * 分析字段级重复
   */
  analyzeFieldDuplicates(data, fieldName) {
    const values = data.map(record => record[fieldName]).filter(v => this.isValueFilled(v))
    const uniqueValues = new Set(values.map(v => String(v).trim().toLowerCase()))

    return {
      totalValues: values.length,
      uniqueValues: uniqueValues.size,
      duplicateCount: values.length - uniqueValues.size,
      duplicateRate: values.length > 0 ? Math.round(((values.length - uniqueValues.size) / values.length) * 100) : 0
    }
  }

  /**
   * 查找相似记录
   */
  findSimilarRecords(data, threshold = 0.8) {
    // 简化实现，返回空数组
    return []
  }

  /**
   * 检测数据类型
   */
  detectDataType(values) {
    const typeCount = {
      string: 0,
      number: 0,
      date: 0,
      boolean: 0,
      email: 0,
      phone: 0,
      url: 0
    }

    values.forEach(value => {
      const type = this.detectValueType(value)
      typeCount[type] = (typeCount[type] || 0) + 1
    })

    // 返回最常见的类型
    return Object.entries(typeCount).reduce((a, b) => a[1] > b[1] ? a : b)[0]
  }

  /**
   * 获取类型分布
   */
  getTypeDistribution(values) {
    const distribution = {}
    values.forEach(value => {
      const type = this.detectValueType(value)
      distribution[type] = (distribution[type] || 0) + 1
    })
    return distribution
  }

  /**
   * 计算类型一致性
   */
  calculateTypeConsistency(values) {
    const distribution = this.getTypeDistribution(values)
    const dominantType = Object.entries(distribution).reduce((a, b) => a[1] > b[1] ? a : b)
    return Math.round((dominantType[1] / values.length) * 100)
  }

  /**
   * 建议类型转换
   */
  suggestTypeConversions(values) {
    // 简化实现，返回空数组
    return []
  }

  /**
   * 检查数据完整性
   */
  checkDataCompleteness(data) {
    // 简化实现，返回空数组
    return []
  }

  /**
   * 检查数据一致性
   */
  checkDataConsistency(data) {
    // 简化实现，返回空数组
    return []
  }

  /**
   * 检查数据准确性
   */
  checkDataAccuracy(data) {
    // 简化实现，返回空数组
    return []
  }

  /**
   * 检查数据有效性
   */
  checkDataValidity(data) {
    // 简化实现，返回空数组
    return []
  }

  /**
   * 检测异常值
   */
  detectOutliers(data) {
    // 简化实现，返回空数组
    return []
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
   * 计算总体完整性
   */
  calculateOverallCompleteness(data) {
    if (data.length === 0) return 0

    let totalFields = 0
    let filledFields = 0

    data.forEach(record => {
      Object.values(record).forEach(value => {
        totalFields++
        if (this.isValueFilled(value)) {
          filledFields++
        }
      })
    })

    return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0
  }

  /**
   * 计算数据质量分数
   */
  calculateDataQualityScore(data) {
    const completeness = this.calculateOverallCompleteness(data)
    const consistency = 85 // 简化实现
    const accuracy = 80 // 简化实现

    return Math.round((completeness * 0.4 + consistency * 0.3 + accuracy * 0.3))
  }

  /**
   * 汇总字段类型
   */
  summarizeFieldTypes(data) {
    if (data.length === 0) return {}

    const fieldTypes = {}
    Object.keys(data[0]).forEach(field => {
      const values = data.map(record => record[field]).filter(v => this.isValueFilled(v))
      fieldTypes[field] = this.detectDataType(values)
    })

    return fieldTypes
  }

  /**
   * 汇总值范围
   */
  summarizeValueRanges(data) {
    if (data.length === 0) return {}

    const ranges = {}
    Object.keys(data[0]).forEach(field => {
      const values = data.map(record => record[field]).filter(v => this.isValueFilled(v))
      const numericValues = values.map(v => parseFloat(String(v))).filter(v => !isNaN(v))

      if (numericValues.length > 0) {
        ranges[field] = {
          min: Math.min(...numericValues),
          max: Math.max(...numericValues),
          range: Math.max(...numericValues) - Math.min(...numericValues)
        }
      }
    })

    return ranges
  }

  /**
   * 生成分析建议
   */
  generateAnalysisRecommendations(analysis) {
    // 简化实现，返回空数组
    return []
  }
}

// 日期格式化
function formatDate(dateStr) {
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  } catch (error) {
    return dateStr
  }
}

// 关键词提取
function extractKeywords(text) {
  if (!text || typeof text !== 'string') return []

  // 简单的关键词提取逻辑
  const keywords = []
  const commonWords = ['的', '了', '在', '是', '有', '和', '与', '或', '但', '因为', '所以']

  // 提取中文词汇
  const chineseWords = text.match(/[\u4e00-\u9fa5]{2,}/g) || []
  chineseWords.forEach(word => {
    if (!commonWords.includes(word) && word.length >= 2) {
      keywords.push(word)
    }
  })

  // 提取英文单词
  const englishWords = text.match(/[a-zA-Z]{3,}/g) || []
  englishWords.forEach(word => {
    keywords.push(word.toLowerCase())
  })

  // 去重并返回前10个关键词
  return [...new Set(keywords)].slice(0, 10)
}

// 电话号码标准化
function normalizePhone(phone) {
  if (!phone) return phone

  // 移除所有非数字字符
  const digits = phone.replace(/\D/g, '')

  // 中国手机号码格式化
  if (digits.length === 11 && digits.startsWith('1')) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }

  // 固定电话格式化
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  return phone
}

// 邮箱地址标准化
function normalizeEmail(email) {
  if (!email) return email

  return email.toLowerCase().trim()
}

// 邮箱格式验证
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 货币格式标准化
function standardizeCurrency(value) {
  if (!value) return value

  // 移除货币符号和逗号
  const numericValue = String(value).replace(/[￥$,]/g, '')
  const parsed = parseFloat(numericValue)

  if (isNaN(parsed)) return value

  // 格式化为两位小数
  return parsed.toFixed(2)
}

// 生成模拟坐标
function generateMockCoordinates(address) {
  // 基于地址字符串生成模拟坐标
  const hash = address.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)

  return {
    lat: 39.9 + (hash % 1000) / 10000, // 北京附近
    lng: 116.4 + (hash % 1000) / 10000
  }
}

// 文本分类
function categorizeText(text, categories) {
  if (!text) return '其他'

  const lowerText = text.toLowerCase()

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.length === 0) continue

    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return category
      }
    }
  }

  return '其他'
}

// 计算记录相似度
function calculateRecordSimilarity(record1, record2, keyFields) {
  let matchingFields = 0
  let totalFields = 0

  keyFields.forEach(field => {
    if (record1[field] || record2[field]) {
      totalFields++

      if (record1[field] && record2[field]) {
        const similarity = calculateStringSimilarity(
          String(record1[field]).toLowerCase(),
          String(record2[field]).toLowerCase()
        )
        matchingFields += similarity
      }
    }
  })

  return totalFields > 0 ? matchingFields / totalFields : 0
}

// 字符串相似度计算
function calculateStringSimilarity(str1, str2) {
  if (str1 === str2) return 1

  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1

  if (longer.length === 0) return 1

  const editDistance = calculateEditDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

// 编辑距离计算
function calculateEditDistance(str1, str2) {
  const matrix = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[str2.length][str1.length]
}

// 合并记录
function mergeRecords(records) {
  const merged = {}

  records.forEach(record => {
    Object.keys(record).forEach(key => {
      if (!merged[key] && record[key]) {
        merged[key] = record[key]
      }
    })
  })

  // 添加合并信息
  merged._mergedFrom = records.length
  merged._mergedAt = new Date().toISOString()

  return merged
}

// 计算年龄
function calculateAge(birthDate) {
  const birth = new Date(birthDate)
  const today = new Date()

  if (isNaN(birth.getTime())) return null

  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

// 生成唯一ID
function generateUniqueId(seed) {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  const seedHash = seed ? seed.replace(/\s/g, '').substr(0, 3) : 'xxx'

  return `${seedHash}-${timestamp}-${random}`.toUpperCase()
}

/**
 * 默认导出清洗引擎实例
 */
export default new DataCleaningEngine()
