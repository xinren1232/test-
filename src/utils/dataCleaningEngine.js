/**
 * 数据清洗规则引擎
 * 针对不同文件类型提供数据清洗规则和验证机制
 */

/**
 * 清洗规则类型定义
 */
const CLEANING_RULE_TYPES = {
  // 基础清洗规则
  REMOVE_EMPTY: 'remove_empty',           // 移除空值
  TRIM_WHITESPACE: 'trim_whitespace',     // 去除首尾空格
  NORMALIZE_CASE: 'normalize_case',       // 标准化大小写
  REMOVE_DUPLICATES: 'remove_duplicates', // 去除重复
  
  // 格式化规则
  FORMAT_DATE: 'format_date',             // 日期格式化
  FORMAT_NUMBER: 'format_number',         // 数字格式化
  FORMAT_PHONE: 'format_phone',           // 电话号码格式化
  FORMAT_EMAIL: 'format_email',           // 邮箱格式化
  
  // 验证规则
  VALIDATE_REQUIRED: 'validate_required', // 必填验证
  VALIDATE_LENGTH: 'validate_length',     // 长度验证
  VALIDATE_PATTERN: 'validate_pattern',   // 模式验证
  VALIDATE_RANGE: 'validate_range',       // 范围验证
  
  // 转换规则
  CONVERT_ENCODING: 'convert_encoding',   // 编码转换
  CONVERT_UNITS: 'convert_units',         // 单位转换
  EXTRACT_KEYWORDS: 'extract_keywords',  // 关键词提取
  STANDARDIZE_TERMS: 'standardize_terms' // 术语标准化
}

/**
 * 文件类型特定规则配置
 */
const FILE_TYPE_RULES = {
  '8D报告': {
    required: [
      CLEANING_RULE_TYPES.REMOVE_EMPTY,
      CLEANING_RULE_TYPES.TRIM_WHITESPACE,
      CLEANING_RULE_TYPES.STANDARDIZE_TERMS
    ],
    optional: [
      CLEANING_RULE_TYPES.FORMAT_DATE,
      CLEANING_RULE_TYPES.EXTRACT_KEYWORDS,
      CLEANING_RULE_TYPES.VALIDATE_REQUIRED
    ],
    customRules: ['validate_d8_structure', 'extract_d8_steps']
  },
  '常规案例': {
    required: [
      CLEANING_RULE_TYPES.REMOVE_EMPTY,
      CLEANING_RULE_TYPES.TRIM_WHITESPACE,
      CLEANING_RULE_TYPES.REMOVE_DUPLICATES
    ],
    optional: [
      CLEANING_RULE_TYPES.FORMAT_DATE,
      CLEANING_RULE_TYPES.FORMAT_NUMBER,
      CLEANING_RULE_TYPES.EXTRACT_KEYWORDS
    ],
    customRules: ['validate_case_structure', 'extract_case_sections']
  }
}

/**
 * 数据清洗引擎类
 */
export class DataCleaningEngine {
  constructor(options = {}) {
    this.options = {
      strictMode: false,
      preserveOriginal: true,
      logLevel: 'info',
      ...options
    }
    this.rules = new Map()
    this.statistics = {
      totalProcessed: 0,
      rulesApplied: 0,
      errorsFound: 0,
      dataFixed: 0
    }
    
    this.initializeRules()
  }

  /**
   * 初始化清洗规则
   */
  initializeRules() {
    // 注册基础清洗规则
    this.registerRule(CLEANING_RULE_TYPES.REMOVE_EMPTY, this.removeEmptyRule)
    this.registerRule(CLEANING_RULE_TYPES.TRIM_WHITESPACE, this.trimWhitespaceRule)
    this.registerRule(CLEANING_RULE_TYPES.NORMALIZE_CASE, this.normalizeCaseRule)
    this.registerRule(CLEANING_RULE_TYPES.REMOVE_DUPLICATES, this.removeDuplicatesRule)
    
    // 注册格式化规则
    this.registerRule(CLEANING_RULE_TYPES.FORMAT_DATE, this.formatDateRule)
    this.registerRule(CLEANING_RULE_TYPES.FORMAT_NUMBER, this.formatNumberRule)
    this.registerRule(CLEANING_RULE_TYPES.FORMAT_PHONE, this.formatPhoneRule)
    this.registerRule(CLEANING_RULE_TYPES.FORMAT_EMAIL, this.formatEmailRule)
    
    // 注册验证规则
    this.registerRule(CLEANING_RULE_TYPES.VALIDATE_REQUIRED, this.validateRequiredRule)
    this.registerRule(CLEANING_RULE_TYPES.VALIDATE_LENGTH, this.validateLengthRule)
    this.registerRule(CLEANING_RULE_TYPES.VALIDATE_PATTERN, this.validatePatternRule)
    this.registerRule(CLEANING_RULE_TYPES.VALIDATE_RANGE, this.validateRangeRule)
    
    // 注册转换规则
    this.registerRule(CLEANING_RULE_TYPES.CONVERT_ENCODING, this.convertEncodingRule)
    this.registerRule(CLEANING_RULE_TYPES.CONVERT_UNITS, this.convertUnitsRule)
    this.registerRule(CLEANING_RULE_TYPES.EXTRACT_KEYWORDS, this.extractKeywordsRule)
    this.registerRule(CLEANING_RULE_TYPES.STANDARDIZE_TERMS, this.standardizeTermsRule)
  }

  /**
   * 注册清洗规则
   * @param {string} ruleType - 规则类型
   * @param {Function} ruleFunction - 规则函数
   */
  registerRule(ruleType, ruleFunction) {
    this.rules.set(ruleType, ruleFunction.bind(this))
  }

  /**
   * 执行数据清洗
   * @param {Object} data - 待清洗数据
   * @param {string} fileType - 文件类型
   * @param {Object} options - 清洗选项
   * @returns {Object} 清洗结果
   */
  async cleanData(data, fileType, options = {}) {
    try {
      const cleaningOptions = { ...this.options, ...options }
      const result = {
        originalData: cleaningOptions.preserveOriginal ? JSON.parse(JSON.stringify(data)) : null,
        cleanedData: JSON.parse(JSON.stringify(data)),
        appliedRules: [],
        issues: [],
        statistics: {
          startTime: new Date().toISOString(),
          endTime: null,
          processingTime: 0,
          rulesApplied: 0,
          dataPoints: 0,
          errorsFixed: 0,
          warningsGenerated: 0
        },
        quality: {
          before: 0,
          after: 0,
          improvement: 0
        }
      }

      // 计算初始数据质量
      result.quality.before = this.calculateDataQuality(data)

      // 获取适用的清洗规则
      const applicableRules = this.getApplicableRules(fileType, cleaningOptions)

      // 应用清洗规则
      for (const ruleConfig of applicableRules) {
        try {
          const ruleResult = await this.applyRule(
            result.cleanedData, 
            ruleConfig.type, 
            ruleConfig.config
          )
          
          result.appliedRules.push({
            type: ruleConfig.type,
            success: ruleResult.success,
            changes: ruleResult.changes,
            issues: ruleResult.issues,
            processingTime: ruleResult.processingTime
          })

          result.statistics.rulesApplied++
          result.statistics.errorsFixed += ruleResult.changes
          result.statistics.warningsGenerated += ruleResult.issues.length

          // 合并问题
          result.issues.push(...ruleResult.issues)

        } catch (error) {
          this.log('error', `规则${ruleConfig.type}执行失败:`, error)
          result.issues.push({
            type: 'rule_execution_error',
            rule: ruleConfig.type,
            message: error.message,
            severity: 'high'
          })
        }
      }

      // 计算清洗后数据质量
      result.quality.after = this.calculateDataQuality(result.cleanedData)
      result.quality.improvement = result.quality.after - result.quality.before

      // 完成统计
      result.statistics.endTime = new Date().toISOString()
      result.statistics.processingTime = new Date(result.statistics.endTime) - 
                                       new Date(result.statistics.startTime)
      result.statistics.dataPoints = this.countDataPoints(result.cleanedData)

      // 更新全局统计
      this.updateGlobalStatistics(result.statistics)

      return result
    } catch (error) {
      this.log('error', '数据清洗失败:', error)
      throw new Error(`数据清洗失败: ${error.message}`)
    }
  }

  /**
   * 获取适用的清洗规则
   * @param {string} fileType - 文件类型
   * @param {Object} options - 选项
   * @returns {Array} 规则配置列表
   */
  getApplicableRules(fileType, options) {
    const typeRules = FILE_TYPE_RULES[fileType] || FILE_TYPE_RULES['常规案例']
    const rules = []

    // 添加必需规则
    typeRules.required.forEach(ruleType => {
      rules.push({
        type: ruleType,
        config: this.getDefaultRuleConfig(ruleType),
        priority: 'high'
      })
    })

    // 添加可选规则（如果启用）
    if (!options.onlyRequired) {
      typeRules.optional.forEach(ruleType => {
        rules.push({
          type: ruleType,
          config: this.getDefaultRuleConfig(ruleType),
          priority: 'medium'
        })
      })
    }

    // 添加自定义规则
    if (options.includeCustom && typeRules.customRules) {
      typeRules.customRules.forEach(ruleType => {
        rules.push({
          type: ruleType,
          config: this.getCustomRuleConfig(ruleType, fileType),
          priority: 'low'
        })
      })
    }

    return rules.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  /**
   * 应用单个清洗规则
   * @param {Object} data - 数据
   * @param {string} ruleType - 规则类型
   * @param {Object} config - 规则配置
   * @returns {Object} 规则执行结果
   */
  async applyRule(data, ruleType, config) {
    const startTime = Date.now()
    const result = {
      success: false,
      changes: 0,
      issues: [],
      processingTime: 0
    }

    try {
      const ruleFunction = this.rules.get(ruleType)
      if (!ruleFunction) {
        throw new Error(`未找到规则: ${ruleType}`)
      }

      const ruleResult = await ruleFunction(data, config)
      result.success = true
      result.changes = ruleResult.changes || 0
      result.issues = ruleResult.issues || []

    } catch (error) {
      result.issues.push({
        type: 'rule_error',
        message: error.message,
        severity: 'medium'
      })
    }

    result.processingTime = Date.now() - startTime
    return result
  }

  /**
   * 移除空值规则
   * @param {Object} data - 数据
   * @param {Object} config - 配置
   * @returns {Object} 处理结果
   */
  removeEmptyRule(data, config = {}) {
    let changes = 0
    const issues = []

    const processValue = (value, path = '') => {
      if (value === null || value === undefined || value === '') {
        changes++
        return config.replaceWith || null
      }
      
      if (typeof value === 'string' && value.trim() === '') {
        changes++
        return config.replaceWith || null
      }
      
      if (Array.isArray(value)) {
        return value.filter(item => {
          const processed = processValue(item, `${path}[]`)
          return processed !== null
        })
      }
      
      if (typeof value === 'object' && value !== null) {
        const cleaned = {}
        Object.keys(value).forEach(key => {
          const processed = processValue(value[key], `${path}.${key}`)
          if (processed !== null) {
            cleaned[key] = processed
          } else {
            changes++
          }
        })
        return cleaned
      }
      
      return value
    }

    const cleanedData = processValue(data)
    Object.assign(data, cleanedData)

    return { changes, issues }
  }

  /**
   * 去除首尾空格规则
   * @param {Object} data - 数据
   * @param {Object} config - 配置
   * @returns {Object} 处理结果
   */
  trimWhitespaceRule(data, config = {}) {
    let changes = 0
    const issues = []

    const processValue = (value) => {
      if (typeof value === 'string') {
        const trimmed = value.trim()
        if (trimmed !== value) {
          changes++
        }
        return trimmed
      }
      
      if (Array.isArray(value)) {
        return value.map(processValue)
      }
      
      if (typeof value === 'object' && value !== null) {
        const result = {}
        Object.keys(value).forEach(key => {
          result[key] = processValue(value[key])
        })
        return result
      }
      
      return value
    }

    const cleanedData = processValue(data)
    Object.assign(data, cleanedData)

    return { changes, issues }
  }

  /**
   * 计算数据质量分数
   * @param {Object} data - 数据
   * @returns {number} 质量分数 (0-100)
   */
  calculateDataQuality(data) {
    let totalFields = 0
    let validFields = 0
    let score = 0

    const analyzeValue = (value) => {
      totalFields++

      if (value === null || value === undefined) {
        return 0
      }

      if (typeof value === 'string') {
        if (value.trim() === '') {
          return 0
        }
        validFields++
        if (value.length > 10) return 100
        if (value.length > 5) return 80
        return 60
      }

      if (typeof value === 'number') {
        validFields++
        return 100
      }

      if (Array.isArray(value)) {
        if (value.length === 0) return 0
        validFields++
        const itemScores = value.map(analyzeValue)
        return itemScores.reduce((sum, score) => sum + score, 0) / itemScores.length
      }

      if (typeof value === 'object') {
        validFields++
        const fieldScores = Object.values(value).map(analyzeValue)
        return fieldScores.reduce((sum, score) => sum + score, 0) / fieldScores.length
      }

      validFields++
      return 50
    }

    const analyzeObject = (obj) => {
      const scores = Object.values(obj).map(analyzeValue)
      return scores.reduce((sum, score) => sum + score, 0) / scores.length
    }

    score = analyzeObject(data)

    const completeness = totalFields > 0 ? (validFields / totalFields) * 100 : 0

    return Math.round((score * 0.7) + (completeness * 0.3))
  }

  /**
   * 格式化日期
   * @param {Date} date - 日期对象
   * @param {string} format - 格式字符串
   * @returns {string} 格式化后的日期
   */
  formatDate(date, format) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
  }

  /**
   * 获取默认规则配置
   * @param {string} ruleType - 规则类型
   * @returns {Object} 默认配置
   */
  getDefaultRuleConfig(ruleType) {
    const defaultConfigs = {
      [CLEANING_RULE_TYPES.REMOVE_EMPTY]: { replaceWith: null },
      [CLEANING_RULE_TYPES.TRIM_WHITESPACE]: {},
      [CLEANING_RULE_TYPES.NORMALIZE_CASE]: { caseType: 'lower' },
      [CLEANING_RULE_TYPES.REMOVE_DUPLICATES]: {},
      [CLEANING_RULE_TYPES.FORMAT_DATE]: { format: 'YYYY-MM-DD' },
      [CLEANING_RULE_TYPES.FORMAT_NUMBER]: { decimalPlaces: 2 },
      [CLEANING_RULE_TYPES.EXTRACT_KEYWORDS]: { keywords: [] },
      [CLEANING_RULE_TYPES.STANDARDIZE_TERMS]: { termMapping: {} }
    }

    return defaultConfigs[ruleType] || {}
  }

  /**
   * 获取自定义规则配置
   * @param {string} ruleType - 规则类型
   * @param {string} fileType - 文件类型
   * @returns {Object} 自定义配置
   */
  getCustomRuleConfig(ruleType, fileType) {
    // 这里可以根据文件类型返回特定的配置
    return {}
  }

  /**
   * 统计数据点数量
   * @param {Object} data - 数据
   * @returns {number} 数据点数量
   */
  countDataPoints(data) {
    const countValue = (value) => {
      if (value === null || value === undefined) {
        return 0
      }

      if (Array.isArray(value)) {
        return value.reduce((sum, item) => sum + countValue(item), 0)
      }

      if (typeof value === 'object') {
        return Object.values(value).reduce((sum, val) => sum + countValue(val), 0)
      }

      return 1
    }

    return countValue(data)
  }

  /**
   * 更新全局统计
   * @param {Object} stats - 统计信息
   */
  updateGlobalStatistics(stats) {
    this.statistics.totalProcessed++
    this.statistics.rulesApplied += stats.rulesApplied
    this.statistics.errorsFound += stats.warningsGenerated
    this.statistics.dataFixed += stats.errorsFixed
  }

  /**
   * 日志记录
   * @param {string} level - 日志级别
   * @param {string} message - 消息
   * @param {*} data - 数据
   */
  log(level, message, data = null) {
    if (this.options.logLevel === 'debug' ||
        (this.options.logLevel === 'info' && level !== 'debug') ||
        (this.options.logLevel === 'warn' && ['warn', 'error'].includes(level)) ||
        (this.options.logLevel === 'error' && level === 'error')) {
      console[level](message, data)
    }
  }

  /**
   * 获取引擎统计信息
   * @returns {Object} 统计信息
   */
  getStatistics() {
    return { ...this.statistics }
  }

  /**
   * 重置统计信息
   */
  resetStatistics() {
    this.statistics = {
      totalProcessed: 0,
      rulesApplied: 0,
      errorsFound: 0,
      dataFixed: 0
    }
  }
}

// 导出清洗规则类型常量和引擎类
export { CLEANING_RULE_TYPES, FILE_TYPE_RULES }
