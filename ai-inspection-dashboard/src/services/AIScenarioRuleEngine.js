/**
 * AI场景规则引擎 - 管理场景识别和规则应用
 * 实现场景自动识别、规则匹配、智能回答等功能
 */

export class AIScenarioRuleEngine {
  constructor() {
    this.rules = this.initializeRules()
    this.scenarioPatterns = this.initializeScenarioPatterns()
  }

  /**
   * 初始化场景识别规则
   */
  initializeScenarioPatterns() {
    return {
      // 库存管理场景
      inventory: {
        keywords: ['库存', '仓库', '物料', '材料', '供应商', '入库', '出库', '库存量', '安全库存'],
        patterns: [
          /查询.*库存/,
          /.*库存.*情况/,
          /.*仓库.*状态/,
          /.*物料.*数量/,
          /.*供应商.*库存/
        ],
        entities: ['factory', 'warehouse', 'materialCode', 'materialName', 'supplier'],
        confidence: 0.8
      },

      // 质量检测场景
      quality: {
        keywords: ['质量', '检测', '测试', '检验', '合格', '不良', '缺陷', '质检', '品质'],
        patterns: [
          /质量.*分析/,
          /.*检测.*结果/,
          /.*合格率/,
          /.*不良率/,
          /.*质量.*趋势/
        ],
        entities: ['testResult', 'defectPhenomena', 'testDate'],
        confidence: 0.85
      },

      // 生产管理场景
      production: {
        keywords: ['生产', '产线', '制造', '工艺', '产能', '效率', '产量', '生产线'],
        patterns: [
          /生产.*效率/,
          /.*产线.*状态/,
          /.*产能.*分析/,
          /.*工艺.*优化/,
          /.*制造.*数据/
        ],
        entities: ['factory', 'baseline', 'project', 'defectRate'],
        confidence: 0.8
      },

      // 风险管理场景
      risk: {
        keywords: ['风险', '异常', '预警', '问题', '故障', '事故', '隐患', '警报'],
        patterns: [
          /风险.*评估/,
          /.*异常.*检测/,
          /.*预警.*分析/,
          /.*问题.*诊断/,
          /.*风险.*控制/
        ],
        entities: ['status', 'defectPhenomena', 'alertLevel'],
        confidence: 0.9
      },

      // 决策支持场景
      decision: {
        keywords: ['决策', '建议', '对比', '选择', '评估', '分析', '策略', '方案'],
        patterns: [
          /.*决策.*支持/,
          /.*建议.*方案/,
          /.*对比.*分析/,
          /.*评估.*结果/,
          /.*策略.*制定/
        ],
        entities: ['comparison', 'recommendation', 'strategy'],
        confidence: 0.7
      }
    }
  }

  /**
   * 初始化业务规则
   */
  initializeRules() {
    return {
      // 库存管理规则
      inventory: [
        {
          id: 'inv_001',
          name: '库存状态查询',
          pattern: /查询.*库存.*状态/,
          action: 'query_inventory_status',
          dataSource: ['inventory'],
          response: '基于库存数据分析当前状态分布和风险等级'
        },
        {
          id: 'inv_002', 
          name: '供应商库存分析',
          pattern: /.*供应商.*库存/,
          action: 'analyze_supplier_inventory',
          dataSource: ['inventory'],
          response: '分析各供应商的库存表现和供应稳定性'
        },
        {
          id: 'inv_003',
          name: '库存风险评估',
          pattern: /库存.*风险/,
          action: 'assess_inventory_risk',
          dataSource: ['inventory'],
          response: '识别风险库存，评估安全库存水平'
        }
      ],

      // 质量检测规则
      quality: [
        {
          id: 'qua_001',
          name: '质量趋势分析',
          pattern: /质量.*趋势/,
          action: 'analyze_quality_trend',
          dataSource: ['inspection', 'production'],
          response: '分析质量指标的时间趋势和变化模式'
        },
        {
          id: 'qua_002',
          name: '不良率统计',
          pattern: /不良率.*统计/,
          action: 'calculate_defect_rate',
          dataSource: ['production', 'inspection'],
          response: '统计各维度的不良率并进行对比分析'
        },
        {
          id: 'qua_003',
          name: '质量异常检测',
          pattern: /质量.*异常/,
          action: 'detect_quality_anomaly',
          dataSource: ['inspection'],
          response: '检测质量异常模式，提供改进建议'
        }
      ],

      // 生产管理规则
      production: [
        {
          id: 'pro_001',
          name: '生产效率分析',
          pattern: /生产.*效率/,
          action: 'analyze_production_efficiency',
          dataSource: ['production'],
          response: '分析生产效率指标，识别改进机会'
        },
        {
          id: 'pro_002',
          name: '产能利用率',
          pattern: /产能.*利用/,
          action: 'calculate_capacity_utilization',
          dataSource: ['production'],
          response: '计算产能利用率，优化资源配置'
        }
      ],

      // 风险管理规则
      risk: [
        {
          id: 'ris_001',
          name: '风险识别评估',
          pattern: /风险.*识别/,
          action: 'identify_risks',
          dataSource: ['inventory', 'production', 'inspection'],
          response: '全面识别各类风险，进行等级评估'
        },
        {
          id: 'ris_002',
          name: '预警分析',
          pattern: /预警.*分析/,
          action: 'analyze_alerts',
          dataSource: ['inventory', 'production', 'inspection'],
          response: '分析预警信号，制定应对策略'
        }
      ],

      // 决策支持规则
      decision: [
        {
          id: 'dec_001',
          name: '综合对比分析',
          pattern: /对比.*分析/,
          action: 'comprehensive_comparison',
          dataSource: ['inventory', 'production', 'inspection'],
          response: '多维度对比分析，提供决策建议'
        }
      ]
    }
  }

  /**
   * 识别问题所属场景
   * @param {string} question - 用户问题
   * @returns {Object} 场景识别结果
   */
  identifyScenario(question) {
    const questionLower = question.toLowerCase()
    const results = []

    // 遍历所有场景模式
    Object.entries(this.scenarioPatterns).forEach(([scenarioId, pattern]) => {
      let score = 0

      // 关键词匹配
      const keywordMatches = pattern.keywords.filter(keyword => 
        questionLower.includes(keyword)
      ).length
      score += keywordMatches * 10

      // 正则模式匹配
      const patternMatches = pattern.patterns.filter(regex => 
        regex.test(question)
      ).length
      score += patternMatches * 20

      // 实体匹配
      const entityMatches = pattern.entities.filter(entity => 
        questionLower.includes(entity.toLowerCase())
      ).length
      score += entityMatches * 5

      if (score > 0) {
        results.push({
          scenarioId,
          score,
          confidence: Math.min(score / 50 * pattern.confidence, 1),
          matchedKeywords: pattern.keywords.filter(k => questionLower.includes(k)),
          matchedPatterns: pattern.patterns.filter(p => p.test(question))
        })
      }
    })

    // 按分数排序
    results.sort((a, b) => b.score - a.score)

    return {
      primaryScenario: results[0] || null,
      allMatches: results,
      hasMatch: results.length > 0
    }
  }

  /**
   * 匹配业务规则
   * @param {string} question - 用户问题
   * @param {string} scenarioId - 场景ID
   * @returns {Object} 规则匹配结果
   */
  matchRules(question, scenarioId) {
    const scenarioRules = this.rules[scenarioId] || []
    const matchedRules = []

    scenarioRules.forEach(rule => {
      if (rule.pattern.test(question)) {
        matchedRules.push({
          ...rule,
          matchConfidence: 0.9 // 简化的置信度计算
        })
      }
    })

    return {
      matchedRules,
      hasRules: matchedRules.length > 0,
      primaryRule: matchedRules[0] || null
    }
  }

  /**
   * 生成规则化回答
   * @param {Object} ruleMatch - 规则匹配结果
   * @param {Object} dataResults - 数据查询结果
   * @returns {string} 规则化回答
   */
  generateRuleBasedResponse(ruleMatch, dataResults) {
    if (!ruleMatch.hasRules) {
      return null
    }

    const rule = ruleMatch.primaryRule
    let response = `## ${rule.name}\n\n`
    response += `${rule.response}\n\n`

    // 添加数据支撑
    if (dataResults && dataResults.totalRecords > 0) {
      response += `### 数据分析结果\n`
      response += `- 查询到 ${dataResults.totalRecords} 条相关记录\n`
      
      Object.entries(dataResults.sources).forEach(([source, data]) => {
        if (data.length > 0) {
          response += `- ${source}: ${data.length} 条记录\n`
        }
      })
    }

    return response
  }

  /**
   * 增强版问题处理 - 多维度场景识别和智能规则匹配
   * @param {string} question - 用户问题
   * @param {Object} dataResults - 数据查询结果
   * @returns {Object} 处理结果
   */
  processQuestion(question, dataResults = null) {
    console.log('🔍 增强场景引擎处理问题:', question)

    // 1. 预处理问题文本
    const preprocessedQuestion = this.preprocessQuestion(question)

    // 2. 多维度场景识别
    const scenarioAnalysis = this.enhancedScenarioIdentification(preprocessedQuestion)
    console.log('📊 增强场景识别结果:', scenarioAnalysis)

    // 3. 智能规则匹配
    const ruleMatch = this.intelligentRuleMatching(preprocessedQuestion, scenarioAnalysis)
    console.log('📋 智能规则匹配结果:', ruleMatch)

    // 4. 上下文感知分析
    const contextAnalysis = this.analyzeContext(preprocessedQuestion, scenarioAnalysis)

    // 5. 生成增强回答
    const ruleBasedResponse = this.generateEnhancedResponse(ruleMatch, dataResults, contextAnalysis)

    return {
      scenarioMatch: scenarioAnalysis, // 保持兼容性
      ruleMatch,
      contextAnalysis,
      ruleBasedResponse,
      shouldUseRules: ruleMatch.hasRules && ruleBasedResponse !== null,
      processingStrategy: this.determineAdvancedStrategy(scenarioAnalysis, ruleMatch, contextAnalysis),
      confidence: scenarioAnalysis.confidence
    }
  }

  /**
   * 预处理问题文本 - 标准化和增强
   * @param {string} question - 原始问题
   * @returns {Object} 预处理结果
   */
  preprocessQuestion(question) {
    // 1. 基础清理
    let cleaned = question.trim().toLowerCase()

    // 2. 同义词替换
    const synonyms = {
      '库存': ['存货', '库房', '仓储', '储存'],
      '质量': ['品质', '质检', '检验'],
      '生产': ['制造', '产线', '生产线'],
      '供应商': ['厂商', '供货商', '提供商'],
      '检测': ['测试', '检验', '检查'],
      '分析': ['统计', '计算', '评估']
    }

    for (const [standard, variants] of Object.entries(synonyms)) {
      variants.forEach(variant => {
        cleaned = cleaned.replace(new RegExp(variant, 'g'), standard)
      })
    }

    // 3. 提取关键实体
    const entities = this.extractEntities(cleaned)

    // 4. 意图分类
    const intentType = this.classifyIntent(cleaned)

    return {
      original: question,
      cleaned,
      entities,
      intentType,
      keywords: this.extractKeywords(cleaned)
    }
  }

  /**
   * 多维度场景识别 - 增强版
   * @param {Object} preprocessedQuestion - 预处理后的问题
   * @returns {Object} 场景分析结果
   */
  enhancedScenarioIdentification(preprocessedQuestion) {
    const { cleaned, entities, intentType, keywords } = preprocessedQuestion

    // 1. 基于关键词的场景评分
    const keywordScores = this.calculateKeywordScores(keywords)

    // 2. 基于实体的场景评分
    const entityScores = this.calculateEntityScores(entities)

    // 3. 基于意图的场景评分
    const intentScores = this.calculateIntentScores(intentType)

    // 4. 综合评分计算
    const scenarioScores = this.combineScores(keywordScores, entityScores, intentScores)

    // 5. 确定主要场景
    const primaryScenario = this.determinePrimaryScenario(scenarioScores)

    return {
      hasMatch: primaryScenario.confidence > 0.6,
      primaryScenario,
      allScenarios: scenarioScores,
      confidence: primaryScenario.confidence,
      reasoning: this.generateScenarioReasoning(scenarioScores, keywords, entities)
    }
  }

  /**
   * 智能规则匹配 - 增强版
   * @param {Object} preprocessedQuestion - 预处理后的问题
   * @param {Object} scenarioAnalysis - 场景分析结果
   * @returns {Object} 规则匹配结果
   */
  intelligentRuleMatching(preprocessedQuestion, scenarioAnalysis) {
    if (!scenarioAnalysis.hasMatch) {
      return { hasRules: false, matchedRules: [], confidence: 0 }
    }

    const scenarioId = scenarioAnalysis.primaryScenario.scenarioId
    const rules = this.rules[scenarioId] || []

    const matchedRules = []

    for (const rule of rules) {
      const matchScore = this.calculateRuleMatchScore(rule, preprocessedQuestion)
      if (matchScore > 0.5) {
        matchedRules.push({
          ...rule,
          matchScore,
          matchReason: this.generateMatchReason(rule, preprocessedQuestion)
        })
      }
    }

    // 按匹配分数排序
    matchedRules.sort((a, b) => b.matchScore - a.matchScore)

    return {
      hasRules: matchedRules.length > 0,
      matchedRules,
      confidence: matchedRules.length > 0 ? matchedRules[0].matchScore : 0,
      totalMatches: matchedRules.length
    }
  }

  /**
   * 上下文感知分析
   * @param {Object} preprocessedQuestion - 预处理后的问题
   * @param {Object} scenarioAnalysis - 场景分析结果
   * @returns {Object} 上下文分析结果
   */
  analyzeContext(preprocessedQuestion, scenarioAnalysis) {
    const { entities, intentType } = preprocessedQuestion

    return {
      complexity: this.assessQuestionComplexity(preprocessedQuestion),
      urgency: this.assessUrgency(preprocessedQuestion),
      dataRequirements: this.identifyDataRequirements(entities, scenarioAnalysis),
      responseFormat: this.determineOptimalResponseFormat(intentType, scenarioAnalysis),
      userExpertise: this.estimateUserExpertise(preprocessedQuestion)
    }
  }

  /**
   * 添加自定义规则
   * @param {string} scenarioId - 场景ID
   * @param {Object} rule - 规则对象
   */
  addRule(scenarioId, rule) {
    if (!this.rules[scenarioId]) {
      this.rules[scenarioId] = []
    }
    
    rule.id = rule.id || `${scenarioId}_${Date.now()}`
    this.rules[scenarioId].push(rule)
    
    return rule.id
  }

  /**
   * 更新规则
   * @param {string} scenarioId - 场景ID
   * @param {string} ruleId - 规则ID
   * @param {Object} updates - 更新内容
   */
  updateRule(scenarioId, ruleId, updates) {
    const rules = this.rules[scenarioId] || []
    const ruleIndex = rules.findIndex(r => r.id === ruleId)
    
    if (ruleIndex !== -1) {
      this.rules[scenarioId][ruleIndex] = {
        ...this.rules[scenarioId][ruleIndex],
        ...updates
      }
      return true
    }
    
    return false
  }

  /**
   * 删除规则
   * @param {string} scenarioId - 场景ID
   * @param {string} ruleId - 规则ID
   */
  deleteRule(scenarioId, ruleId) {
    const rules = this.rules[scenarioId] || []
    const ruleIndex = rules.findIndex(r => r.id === ruleId)
    
    if (ruleIndex !== -1) {
      this.rules[scenarioId].splice(ruleIndex, 1)
      return true
    }
    
    return false
  }

  /**
   * 获取场景的所有规则
   * @param {string} scenarioId - 场景ID
   * @returns {Array} 规则列表
   */
  getScenarioRules(scenarioId) {
    return this.rules[scenarioId] || []
  }

  /**
   * 获取所有规则统计
   * @returns {Object} 规则统计信息
   */
  getRuleStatistics() {
    const stats = {}
    let totalRules = 0
    
    Object.entries(this.rules).forEach(([scenarioId, rules]) => {
      stats[scenarioId] = rules.length
      totalRules += rules.length
    })
    
    return {
      byScenario: stats,
      total: totalRules
    }
  }

  // ==================== 增强方法实现 ====================

  /**
   * 提取关键实体
   */
  extractEntities(text) {
    const entities = {
      factories: [],
      materials: [],
      suppliers: [],
      timeRanges: [],
      metrics: []
    }

    // 工厂识别
    const factoryPatterns = ['华东工厂', '华南工厂', '华北工厂', '西南工厂']
    factoryPatterns.forEach(factory => {
      if (text.includes(factory.toLowerCase())) {
        entities.factories.push(factory)
      }
    })

    // 物料识别
    const materialPatterns = ['电阻', '电容', '芯片', '连接器', '传感器']
    materialPatterns.forEach(material => {
      if (text.includes(material)) {
        entities.materials.push(material)
      }
    })

    // 时间范围识别
    const timePatterns = [
      { pattern: /最近(\d+)天/, type: 'days' },
      { pattern: /本周|这周/, type: 'week' },
      { pattern: /本月|这个月/, type: 'month' },
      { pattern: /今年|本年/, type: 'year' }
    ]

    timePatterns.forEach(({ pattern, type }) => {
      const match = text.match(pattern)
      if (match) {
        entities.timeRanges.push({ type, value: match[1] || 1 })
      }
    })

    return entities
  }

  /**
   * 意图分类
   */
  classifyIntent(text) {
    const intentPatterns = {
      query: ['查询', '查看', '显示', '列出'],
      analysis: ['分析', '统计', '计算', '评估'],
      comparison: ['对比', '比较', '差异', '区别'],
      prediction: ['预测', '预估', '趋势', '未来'],
      report: ['报告', '报表', '总结', '汇总']
    }

    for (const [intent, keywords] of Object.entries(intentPatterns)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return intent
      }
    }

    return 'general'
  }

  /**
   * 提取关键词
   */
  extractKeywords(text) {
    const stopWords = ['的', '是', '在', '有', '和', '与', '或', '但', '如果', '那么']
    const words = text.split(/\s+/).filter(word =>
      word.length > 1 && !stopWords.includes(word)
    )
    return [...new Set(words)]
  }

  /**
   * 计算关键词场景评分
   */
  calculateKeywordScores(keywords) {
    const scores = {}

    for (const [scenarioId, config] of Object.entries(this.scenarioPatterns)) {
      let score = 0
      const matchedKeywords = []

      keywords.forEach(keyword => {
        if (config.keywords.some(sk => sk.includes(keyword) || keyword.includes(sk))) {
          score += 1
          matchedKeywords.push(keyword)
        }
      })

      scores[scenarioId] = {
        score: score / Math.max(keywords.length, 1),
        matchedKeywords,
        weight: 0.4
      }
    }

    return scores
  }

  /**
   * 计算实体场景评分
   */
  calculateEntityScores(entities) {
    const scores = {}

    for (const [scenarioId, config] of Object.entries(this.scenarioPatterns)) {
      let score = 0
      const matchedEntities = []

      // 检查实体匹配
      if (entities.factories.length > 0 && config.entities.includes('factory')) {
        score += 0.3
        matchedEntities.push('factory')
      }

      if (entities.materials.length > 0 && config.entities.includes('materialCode')) {
        score += 0.3
        matchedEntities.push('material')
      }

      scores[scenarioId] = {
        score,
        matchedEntities,
        weight: 0.3
      }
    }

    return scores
  }

  /**
   * 计算意图场景评分
   */
  calculateIntentScores(intentType) {
    const intentScenarioMapping = {
      query: { inventory: 0.8, quality: 0.6, production: 0.5 },
      analysis: { quality: 0.9, production: 0.8, inventory: 0.7 },
      comparison: { quality: 0.8, production: 0.7, inventory: 0.6 },
      prediction: { production: 0.9, quality: 0.7, inventory: 0.6 },
      report: { quality: 0.8, production: 0.8, inventory: 0.7 }
    }

    const mapping = intentScenarioMapping[intentType] || {}
    const scores = {}

    for (const scenarioId of Object.keys(this.scenarioPatterns)) {
      scores[scenarioId] = {
        score: mapping[scenarioId] || 0.1,
        intent: intentType,
        weight: 0.3
      }
    }

    return scores
  }

  /**
   * 综合评分计算
   */
  combineScores(keywordScores, entityScores, intentScores) {
    const combinedScores = {}

    for (const scenarioId of Object.keys(this.scenarioPatterns)) {
      const keywordScore = keywordScores[scenarioId] || { score: 0, weight: 0.4 }
      const entityScore = entityScores[scenarioId] || { score: 0, weight: 0.3 }
      const intentScore = intentScores[scenarioId] || { score: 0, weight: 0.3 }

      const totalScore =
        keywordScore.score * keywordScore.weight +
        entityScore.score * entityScore.weight +
        intentScore.score * intentScore.weight

      combinedScores[scenarioId] = {
        scenarioId,
        totalScore,
        confidence: Math.min(totalScore, 1.0),
        breakdown: {
          keyword: keywordScore,
          entity: entityScore,
          intent: intentScore
        }
      }
    }

    return combinedScores
  }

  /**
   * 确定主要场景
   */
  determinePrimaryScenario(scenarioScores) {
    const scenarios = Object.values(scenarioScores)
    scenarios.sort((a, b) => b.confidence - a.confidence)

    return scenarios[0] || {
      scenarioId: 'general',
      confidence: 0,
      totalScore: 0
    }
  }

  /**
   * 生成场景推理说明
   */
  generateScenarioReasoning(scenarioScores, keywords, entities) {
    const primary = this.determinePrimaryScenario(scenarioScores)
    const reasons = []

    if (primary.breakdown?.keyword?.matchedKeywords?.length > 0) {
      reasons.push(`关键词匹配: ${primary.breakdown.keyword.matchedKeywords.join(', ')}`)
    }

    if (primary.breakdown?.entity?.matchedEntities?.length > 0) {
      reasons.push(`实体识别: ${primary.breakdown.entity.matchedEntities.join(', ')}`)
    }

    if (primary.breakdown?.intent?.intent) {
      reasons.push(`意图类型: ${primary.breakdown.intent.intent}`)
    }

    return reasons.join('; ')
  }

  /**
   * 计算规则匹配分数
   */
  calculateRuleMatchScore(rule, preprocessedQuestion) {
    const { cleaned, keywords } = preprocessedQuestion
    let score = 0

    // 模式匹配
    if (rule.pattern && rule.pattern.test(cleaned)) {
      score += 0.6
    }

    // 关键词匹配
    const ruleKeywords = rule.name.toLowerCase().split(/\s+/)
    const matchedKeywords = keywords.filter(k =>
      ruleKeywords.some(rk => rk.includes(k) || k.includes(rk))
    )

    if (matchedKeywords.length > 0) {
      score += 0.4 * (matchedKeywords.length / Math.max(ruleKeywords.length, keywords.length))
    }

    return Math.min(score, 1.0)
  }

  /**
   * 生成匹配原因
   */
  generateMatchReason(rule, preprocessedQuestion) {
    const reasons = []

    if (rule.pattern && rule.pattern.test(preprocessedQuestion.cleaned)) {
      reasons.push('模式匹配')
    }

    const ruleKeywords = rule.name.toLowerCase().split(/\s+/)
    const matchedKeywords = preprocessedQuestion.keywords.filter(k =>
      ruleKeywords.some(rk => rk.includes(k) || k.includes(rk))
    )

    if (matchedKeywords.length > 0) {
      reasons.push(`关键词匹配: ${matchedKeywords.join(', ')}`)
    }

    return reasons.join('; ')
  }

  /**
   * 评估问题复杂度
   */
  assessQuestionComplexity(preprocessedQuestion) {
    const { keywords, entities } = preprocessedQuestion

    let complexity = 'simple'

    if (keywords.length > 5 || Object.values(entities).some(arr => arr.length > 2)) {
      complexity = 'medium'
    }

    if (keywords.length > 10 || Object.values(entities).some(arr => arr.length > 5)) {
      complexity = 'complex'
    }

    return complexity
  }

  /**
   * 评估紧急程度
   */
  assessUrgency(preprocessedQuestion) {
    const urgentKeywords = ['紧急', '立即', '马上', '急需', '重要']
    const { cleaned } = preprocessedQuestion

    return urgentKeywords.some(keyword => cleaned.includes(keyword)) ? 'high' : 'normal'
  }

  /**
   * 识别数据需求
   */
  identifyDataRequirements(entities, scenarioAnalysis) {
    const requirements = []

    if (entities.factories.length > 0) {
      requirements.push('factory_data')
    }

    if (entities.materials.length > 0) {
      requirements.push('material_data')
    }

    if (entities.timeRanges.length > 0) {
      requirements.push('time_series_data')
    }

    if (scenarioAnalysis.primaryScenario.scenarioId === 'quality') {
      requirements.push('quality_metrics')
    }

    return requirements
  }

  /**
   * 确定最佳响应格式
   */
  determineOptimalResponseFormat(intentType, scenarioAnalysis) {
    const formatMapping = {
      query: 'structured_list',
      analysis: 'detailed_analysis',
      comparison: 'comparison_table',
      prediction: 'trend_chart',
      report: 'comprehensive_report'
    }

    return formatMapping[intentType] || 'general_response'
  }

  /**
   * 估算用户专业程度
   */
  estimateUserExpertise(preprocessedQuestion) {
    const technicalTerms = ['合格率', '不良率', 'cpk', 'spc', '六西格玛', '质量控制']
    const { cleaned } = preprocessedQuestion

    const technicalCount = technicalTerms.filter(term => cleaned.includes(term)).length

    if (technicalCount >= 2) return 'expert'
    if (technicalCount >= 1) return 'intermediate'
    return 'beginner'
  }

  /**
   * 确定高级处理策略
   */
  determineAdvancedStrategy(scenarioAnalysis, ruleMatch, contextAnalysis) {
    if (ruleMatch.hasRules && ruleMatch.confidence > 0.8) {
      return 'rule_based'
    }

    if (scenarioAnalysis.confidence > 0.7) {
      return 'scenario_guided'
    }

    if (contextAnalysis.complexity === 'complex') {
      return 'ai_enhanced'
    }

    return 'ai_generated'
  }

  /**
   * 生成增强回答
   */
  generateEnhancedResponse(ruleMatch, dataResults, contextAnalysis) {
    if (!ruleMatch.hasRules || ruleMatch.matchedRules.length === 0) {
      return null
    }

    const primaryRule = ruleMatch.matchedRules[0]
    let response = primaryRule.response

    // 根据上下文调整回答
    if (contextAnalysis.userExpertise === 'expert') {
      response += '\n\n技术细节: 基于专业质量管理标准进行深度分析。'
    } else if (contextAnalysis.userExpertise === 'beginner') {
      response += '\n\n说明: 以下是基础分析结果，如需详细解释请告知。'
    }

    if (contextAnalysis.urgency === 'high') {
      response = '⚠️ 紧急响应: ' + response
    }

    return response
  }
}

// 创建单例实例
export const aiScenarioRuleEngine = new AIScenarioRuleEngine()
export default aiScenarioRuleEngine
