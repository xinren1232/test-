/**
 * 8D报告专用分析器
 * 专门用于识别、解析和分析8D质量管理报告
 */

export class EightDReportAnalyzer {
  constructor() {
    this.reportStructure = this.initialize8DStructure()
    this.keywordPatterns = this.initialize8DKeywords()
    this.validationRules = this.initialize8DValidation()
  }

  /**
   * 初始化8D报告标准结构
   */
  initialize8DStructure() {
    return {
      D1: {
        name: '团队组建',
        englishName: 'Team Formation',
        description: '组建跨职能团队',
        requiredFields: ['团队成员', '角色分工', '责任人', '联系方式'],
        keywords: ['团队', '成员', '负责人', '小组', '组长', '协调员'],
        weight: 0.1
      },
      D2: {
        name: '问题描述',
        englishName: 'Problem Description', 
        description: '详细描述问题现象',
        requiredFields: ['问题现象', '发生时间', '影响范围', '严重程度'],
        keywords: ['问题', '现象', '故障', '缺陷', '异常', '不良'],
        weight: 0.15
      },
      D3: {
        name: '临时措施',
        englishName: 'Interim Containment Actions',
        description: '实施临时遏制措施',
        requiredFields: ['临时措施', '实施时间', '效果验证', '负责人'],
        keywords: ['临时', '应急', '遏制', '措施', '处理', '控制'],
        weight: 0.1
      },
      D4: {
        name: '根因分析',
        englishName: 'Root Cause Analysis',
        description: '确定问题根本原因',
        requiredFields: ['根本原因', '分析方法', '验证结果', '证据'],
        keywords: ['根因', '原因', '分析', '鱼骨图', '5Why', '因果'],
        weight: 0.2
      },
      D5: {
        name: '永久措施',
        englishName: 'Permanent Corrective Actions',
        description: '制定永久纠正措施',
        requiredFields: ['纠正措施', '实施计划', '预期效果', '验证方法'],
        keywords: ['永久', '纠正', '改善', '措施', '方案', '对策'],
        weight: 0.15
      },
      D6: {
        name: '措施实施',
        englishName: 'Implementation & Validation',
        description: '实施并验证纠正措施',
        requiredFields: ['实施状态', '验证结果', '效果评估', '完成时间'],
        keywords: ['实施', '执行', '验证', '测试', '确认', '评估'],
        weight: 0.1
      },
      D7: {
        name: '预防措施',
        englishName: 'Prevention',
        description: '防止问题再次发生',
        requiredFields: ['预防措施', '系统改进', '流程优化', '培训计划'],
        keywords: ['预防', '防止', '避免', '系统', '流程', '标准'],
        weight: 0.1
      },
      D8: {
        name: '团队表彰',
        englishName: 'Team Recognition',
        description: '表彰团队贡献',
        requiredFields: ['团队贡献', '表彰方式', '经验总结', '知识分享'],
        keywords: ['表彰', '认可', '贡献', '总结', '分享', '经验'],
        weight: 0.1
      }
    }
  }

  /**
   * 初始化8D关键词模式
   */
  initialize8DKeywords() {
    return {
      // 文档类型识别
      documentType: [
        '8D报告', '8D分析', '质量问题', '客户投诉', '不良分析',
        '8D Report', '8D Analysis', 'Quality Issue', 'Customer Complaint'
      ],
      
      // 质量管理术语
      qualityTerms: [
        'PDCA', 'DMAIC', 'FMEA', 'SPC', 'MSA', 'APQP', 'PPAP',
        '质量', '缺陷', '不合格', '改进', '纠正', '预防'
      ],
      
      // 分析方法
      analysisMethods: [
        '鱼骨图', '5Why', '因果图', '帕累托图', '散点图', '直方图',
        'Fishbone', 'Ishikawa', 'Pareto', 'Histogram', 'Scatter Plot'
      ],
      
      // 时间相关
      timePatterns: [
        /\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/g,  // 日期格式
        /\d{1,2}:\d{2}/g,                   // 时间格式
        /第?\d+周/g,                        // 周次
        /\d+天/g                            // 天数
      ]
    }
  }

  /**
   * 初始化8D验证规则
   */
  initialize8DValidation() {
    return {
      completeness: {
        minD1Fields: 3,  // D1至少需要3个字段
        minD2Fields: 4,  // D2至少需要4个字段
        minD4Fields: 3,  // D4至少需要3个字段
        minD5Fields: 3   // D5至少需要3个字段
      },
      quality: {
        minWordCount: 50,      // 每个维度最少字数
        maxWordCount: 1000,    // 每个维度最多字数
        requiredSections: 6    // 至少需要6个维度有内容
      },
      consistency: {
        timelineCheck: true,   // 检查时间线一致性
        teamConsistency: true, // 检查团队信息一致性
        actionAlignment: true  // 检查措施对应关系
      }
    }
  }

  /**
   * 识别文档是否为8D报告
   */
  async identify8DReport(fileContent, fileName = '') {
    try {
      const identificationScore = this.calculate8DScore(fileContent, fileName)
      const confidence = identificationScore.totalScore / identificationScore.maxScore
      
      return {
        is8DReport: confidence > 0.6,
        confidence: confidence,
        identificationDetails: identificationScore,
        suggestedTemplate: confidence > 0.8 ? 'standard_8d' : 'basic_8d'
      }
    } catch (error) {
      console.error('8D报告识别失败:', error)
      return {
        is8DReport: false,
        confidence: 0,
        error: error.message
      }
    }
  }

  /**
   * 计算8D报告识别分数
   */
  calculate8DScore(content, fileName) {
    let score = {
      fileNameScore: 0,      // 文件名分数 (10分)
      keywordScore: 0,       // 关键词分数 (30分)
      structureScore: 0,     // 结构分数 (40分)
      contentScore: 0,       // 内容分数 (20分)
      totalScore: 0,
      maxScore: 100
    }

    // 1. 文件名评分
    score.fileNameScore = this.scoreFileName(fileName)

    // 2. 关键词评分
    score.keywordScore = this.scoreKeywords(content)

    // 3. 结构评分
    score.structureScore = this.scoreStructure(content)

    // 4. 内容评分
    score.contentScore = this.scoreContent(content)

    score.totalScore = score.fileNameScore + score.keywordScore + 
                      score.structureScore + score.contentScore

    return score
  }

  /**
   * 文件名评分
   */
  scoreFileName(fileName) {
    if (!fileName) return 0
    
    const name = fileName.toLowerCase()
    let score = 0
    
    if (name.includes('8d')) score += 5
    if (name.includes('质量') || name.includes('quality')) score += 2
    if (name.includes('问题') || name.includes('problem')) score += 2
    if (name.includes('报告') || name.includes('report')) score += 1
    
    return Math.min(score, 10)
  }

  /**
   * 关键词评分
   */
  scoreKeywords(content) {
    let score = 0
    const text = content.toLowerCase()
    
    // 检查文档类型关键词
    this.keywordPatterns.documentType.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) {
        score += 5
      }
    })
    
    // 检查质量管理术语
    this.keywordPatterns.qualityTerms.forEach(term => {
      if (text.includes(term.toLowerCase())) {
        score += 2
      }
    })
    
    // 检查分析方法
    this.keywordPatterns.analysisMethods.forEach(method => {
      if (text.includes(method.toLowerCase())) {
        score += 3
      }
    })
    
    return Math.min(score, 30)
  }

  /**
   * 结构评分
   */
  scoreStructure(content) {
    let score = 0
    const text = content.toLowerCase()
    
    // 检查8D维度标识
    Object.keys(this.reportStructure).forEach(dimension => {
      const dimInfo = this.reportStructure[dimension]
      
      // 检查维度标识 (如 D1, D2 等)
      if (text.includes(dimension.toLowerCase()) || 
          text.includes(dimInfo.name) ||
          text.includes(dimInfo.englishName.toLowerCase())) {
        score += 5
      }
    })
    
    return Math.min(score, 40)
  }

  /**
   * 内容评分
   */
  scoreContent(content) {
    let score = 0
    
    // 检查内容长度
    if (content.length > 1000) score += 5
    if (content.length > 3000) score += 5
    
    // 检查时间模式
    this.keywordPatterns.timePatterns.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches && matches.length > 0) {
        score += Math.min(matches.length, 5)
      }
    })
    
    return Math.min(score, 20)
  }

  /**
   * 解析8D报告内容
   */
  async parse8DContent(fileContent, fileType = 'text') {
    try {
      const parsedContent = await this.extractContentByType(fileContent, fileType)
      const dimensionData = this.extract8DDimensions(parsedContent)
      const validationResult = this.validate8DContent(dimensionData)
      
      return {
        success: true,
        dimensions: dimensionData,
        validation: validationResult,
        metadata: this.extractMetadata(parsedContent),
        suggestions: this.generateImprovementSuggestions(dimensionData, validationResult)
      }
    } catch (error) {
      console.error('8D内容解析失败:', error)
      return {
        success: false,
        error: error.message,
        dimensions: {},
        validation: { isValid: false, errors: [error.message] }
      }
    }
  }

  /**
   * 根据文件类型提取内容
   */
  async extractContentByType(fileContent, fileType) {
    switch (fileType.toLowerCase()) {
      case 'excel':
      case 'xlsx':
        return this.parseExcel8D(fileContent)
      case 'word':
      case 'docx':
        return this.parseWord8D(fileContent)
      case 'pdf':
        return this.parsePDF8D(fileContent)
      default:
        return fileContent
    }
  }

  /**
   * 解析Excel格式的8D报告
   */
  parseExcel8D(fileContent) {
    // 这里应该使用实际的Excel解析库
    // 模拟解析结果
    return {
      sheets: ['8D报告'],
      data: {
        'D1-团队组建': '团队成员：张三、李四、王五\n角色：组长、技术专家、质量工程师',
        'D2-问题描述': '产品在客户端出现功能异常，影响用户体验',
        'D3-临时措施': '立即停止发货，召回问题产品',
        'D4-根因分析': '通过5Why分析发现是设计缺陷导致',
        'D5-永久措施': '修改设计方案，增加测试验证',
        'D6-措施实施': '已完成设计修改，通过验证测试',
        'D7-预防措施': '建立设计评审流程，加强测试标准',
        'D8-团队表彰': '表彰团队快速响应和有效解决问题'
      }
    }
  }

  /**
   * 解析Word格式的8D报告
   */
  parseWord8D(fileContent) {
    // 模拟Word解析
    return fileContent
  }

  /**
   * 解析PDF格式的8D报告
   */
  parsePDF8D(fileContent) {
    // 模拟PDF解析
    return fileContent
  }

  /**
   * 提取8D各维度内容
   */
  extract8DDimensions(content) {
    const dimensions = {}
    const text = typeof content === 'string' ? content : JSON.stringify(content)

    Object.keys(this.reportStructure).forEach(dimension => {
      const dimInfo = this.reportStructure[dimension]
      dimensions[dimension] = this.extractDimensionContent(text, dimension, dimInfo)
    })

    return dimensions
  }

  /**
   * 提取单个维度内容
   */
  extractDimensionContent(text, dimension, dimInfo) {
    const patterns = [
      new RegExp(`${dimension}[：:](.*?)(?=${Object.keys(this.reportStructure).join('|')}|$)`, 'is'),
      new RegExp(`${dimInfo.name}[：:](.*?)(?=${Object.values(this.reportStructure).map(d => d.name).join('|')}|$)`, 'is'),
      new RegExp(`${dimInfo.englishName}[：:](.*?)(?=D\\d|$)`, 'is')
    ]

    let extractedContent = ''

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match && match[1]) {
        extractedContent = match[1].trim()
        break
      }
    }

    // 如果没有找到结构化内容，尝试关键词匹配
    if (!extractedContent) {
      extractedContent = this.extractByKeywords(text, dimInfo.keywords)
    }

    return {
      content: extractedContent,
      keywords: this.findKeywords(extractedContent, dimInfo.keywords),
      fields: this.extractFields(extractedContent, dimInfo.requiredFields),
      completeness: this.calculateCompleteness(extractedContent, dimInfo),
      quality: this.assessContentQuality(extractedContent)
    }
  }

  /**
   * 通过关键词提取内容
   */
  extractByKeywords(text, keywords) {
    let relevantContent = ''
    const sentences = text.split(/[。！？.!?]/)

    sentences.forEach(sentence => {
      const matchCount = keywords.filter(keyword =>
        sentence.toLowerCase().includes(keyword.toLowerCase())
      ).length

      if (matchCount > 0) {
        relevantContent += sentence + '。'
      }
    })

    return relevantContent.trim()
  }

  /**
   * 查找关键词
   */
  findKeywords(content, keywords) {
    const found = []
    const text = content.toLowerCase()

    keywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) {
        found.push(keyword)
      }
    })

    return found
  }

  /**
   * 提取字段信息
   */
  extractFields(content, requiredFields) {
    const fields = {}

    requiredFields.forEach(field => {
      const patterns = [
        new RegExp(`${field}[：:](.*?)(?=\\n|$)`, 'i'),
        new RegExp(`${field}.*?[：:]\\s*(.*?)(?=\\n|$)`, 'i')
      ]

      for (const pattern of patterns) {
        const match = content.match(pattern)
        if (match && match[1]) {
          fields[field] = match[1].trim()
          break
        }
      }

      if (!fields[field]) {
        fields[field] = null
      }
    })

    return fields
  }

  /**
   * 计算完整性
   */
  calculateCompleteness(content, dimInfo) {
    const wordCount = content.length
    const keywordMatches = dimInfo.keywords.filter(keyword =>
      content.toLowerCase().includes(keyword.toLowerCase())
    ).length

    const fieldCompleteness = Object.values(
      this.extractFields(content, dimInfo.requiredFields)
    ).filter(value => value !== null).length / dimInfo.requiredFields.length

    return {
      wordCount,
      keywordMatches,
      fieldCompleteness,
      overallScore: (fieldCompleteness * 0.6 + (keywordMatches / dimInfo.keywords.length) * 0.4)
    }
  }

  /**
   * 评估内容质量
   */
  assessContentQuality(content) {
    return {
      length: content.length,
      hasNumbers: /\d/.test(content),
      hasDate: /\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/.test(content),
      hasTime: /\d{1,2}:\d{2}/.test(content),
      complexity: content.split(/[，,。.！!？?]/).length,
      score: Math.min(content.length / 100, 1) * 100
    }
  }

  /**
   * 验证8D内容
   */
  validate8DContent(dimensionData) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      score: 0,
      dimensionScores: {}
    }

    let totalScore = 0
    let maxScore = 0

    Object.keys(this.reportStructure).forEach(dimension => {
      const dimInfo = this.reportStructure[dimension]
      const dimData = dimensionData[dimension]

      if (!dimData || !dimData.content) {
        validation.errors.push(`${dimension}(${dimInfo.name})缺少内容`)
        validation.dimensionScores[dimension] = 0
        return
      }

      const dimScore = this.validateDimension(dimData, dimInfo, validation)
      validation.dimensionScores[dimension] = dimScore
      totalScore += dimScore * dimInfo.weight
      maxScore += 100 * dimInfo.weight
    })

    validation.score = (totalScore / maxScore) * 100
    validation.isValid = validation.errors.length === 0 && validation.score >= 60

    return validation
  }

  /**
   * 验证单个维度
   */
  validateDimension(dimData, dimInfo, validation) {
    let score = 100

    // 检查内容长度
    if (dimData.content.length < this.validationRules.quality.minWordCount) {
      validation.warnings.push(`${dimInfo.name}内容过短，建议补充详细信息`)
      score -= 20
    }

    // 检查字段完整性
    if (dimData.completeness.fieldCompleteness < 0.5) {
      validation.warnings.push(`${dimInfo.name}必填字段不完整`)
      score -= 30
    }

    // 检查关键词覆盖
    if (dimData.keywords.length < dimInfo.keywords.length * 0.3) {
      validation.warnings.push(`${dimInfo.name}缺少关键信息`)
      score -= 20
    }

    return Math.max(score, 0)
  }

  /**
   * 提取元数据
   */
  extractMetadata(content) {
    const text = typeof content === 'string' ? content : JSON.stringify(content)

    return {
      reportDate: this.extractDate(text),
      reportNumber: this.extractReportNumber(text),
      customer: this.extractCustomer(text),
      product: this.extractProduct(text),
      severity: this.extractSeverity(text),
      status: this.extractStatus(text)
    }
  }

  /**
   * 提取日期
   */
  extractDate(text) {
    const datePattern = /\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/g
    const matches = text.match(datePattern)
    return matches ? matches[0] : null
  }

  /**
   * 提取报告编号
   */
  extractReportNumber(text) {
    const patterns = [
      /报告编号[：:]?\s*([A-Z0-9\-]+)/i,
      /Report\s+No[：.]?\s*([A-Z0-9\-]+)/i,
      /8D[：-]?\s*([A-Z0-9\-]+)/i
    ]

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  /**
   * 提取客户信息
   */
  extractCustomer(text) {
    const patterns = [
      /客户[：:]?\s*([^\n\r，,。.]+)/i,
      /Customer[：:]?\s*([^\n\r，,。.]+)/i
    ]

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) return match[1].trim()
    }
    return null
  }

  /**
   * 提取产品信息
   */
  extractProduct(text) {
    const patterns = [
      /产品[：:]?\s*([^\n\r，,。.]+)/i,
      /Product[：:]?\s*([^\n\r，,。.]+)/i,
      /零件[：:]?\s*([^\n\r，,。.]+)/i
    ]

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) return match[1].trim()
    }
    return null
  }

  /**
   * 提取严重程度
   */
  extractSeverity(text) {
    const severityKeywords = ['严重', '一般', '轻微', 'Critical', 'Major', 'Minor']
    const lowerText = text.toLowerCase()

    for (const keyword of severityKeywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return keyword
      }
    }
    return null
  }

  /**
   * 提取状态
   */
  extractStatus(text) {
    const statusKeywords = ['进行中', '已完成', '待处理', 'In Progress', 'Completed', 'Pending']
    const lowerText = text.toLowerCase()

    for (const keyword of statusKeywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return keyword
      }
    }
    return null
  }

  /**
   * 分析8D报告内容
   */
  async analyzeReport(content) {
    try {
      console.log('🔍 开始分析8D报告内容...');

      // 1. 识别是否为8D报告
      const identification = await this.identify8DReport(content);

      if (!identification.is8DReport) {
        console.warn('⚠️ 文档不是标准8D报告');
        return {
          isValid: false,
          confidence: identification.confidence,
          message: '文档不符合8D报告标准格式'
        };
      }

      // 2. 提取8D维度数据
      const dimensionData = this.extractDimensionData(content);

      // 3. 验证报告完整性
      const validationResult = this.validateReport(dimensionData);

      // 4. 生成分析结果
      const analysisResult = {
        isValid: true,
        confidence: identification.confidence,
        reportInfo: {
          reportNumber: this.extractReportNumber(content),
          customer: this.extractCustomer(content),
          product: this.extractProduct(content),
          date: this.extractDate(content),
          severity: this.extractSeverity(content),
          status: this.extractStatus(content)
        },
        dimensionData,
        validation: validationResult,
        suggestions: this.generateImprovementSuggestions(dimensionData, validationResult),
        summary: this.generateReportSummary(dimensionData, validationResult)
      };

      console.log('✅ 8D报告分析完成');
      return analysisResult;

    } catch (error) {
      console.error('❌ 8D报告分析失败:', error);
      throw error;
    }
  }

  /**
   * 提取8D维度数据
   */
  extractDimensionData(content) {
    const dimensionData = {};

    Object.keys(this.reportStructure).forEach(dimension => {
      const dimInfo = this.reportStructure[dimension];
      dimensionData[dimension] = this.extractDimensionContent(content, dimension, dimInfo);
    });

    return dimensionData;
  }

  /**
   * 提取特定维度内容
   */
  extractDimensionContent(content, dimension, dimInfo) {
    const keywords = dimInfo.keywords;
    const sections = [];

    // 查找包含关键词的段落
    const paragraphs = content.split(/\n\s*\n/);

    paragraphs.forEach((paragraph, index) => {
      const lowerParagraph = paragraph.toLowerCase();
      const matchedKeywords = keywords.filter(keyword =>
        lowerParagraph.includes(keyword.toLowerCase())
      );

      if (matchedKeywords.length > 0) {
        sections.push({
          content: paragraph.trim(),
          position: `段落${index + 1}`,
          matchedKeywords,
          confidence: matchedKeywords.length / keywords.length
        });
      }
    });

    return {
      sections,
      totalContent: sections.map(s => s.content).join('\n'),
      keywordMatches: sections.reduce((acc, s) => acc + s.matchedKeywords.length, 0),
      confidence: sections.length > 0 ? sections.reduce((acc, s) => acc + s.confidence, 0) / sections.length : 0
    };
  }

  /**
   * 验证报告完整性
   */
  validateReport(dimensionData) {
    const validation = {
      isComplete: true,
      completeness: 0,
      dimensionScores: {},
      missingDimensions: [],
      issues: []
    };

    let totalScore = 0;
    const dimensionCount = Object.keys(this.reportStructure).length;

    Object.keys(this.reportStructure).forEach(dimension => {
      const dimInfo = this.reportStructure[dimension];
      const dimData = dimensionData[dimension];

      let score = 0;

      // 基于内容长度评分
      if (dimData.totalContent.length > 50) score += 30;
      else if (dimData.totalContent.length > 20) score += 15;

      // 基于关键词匹配评分
      score += dimData.confidence * 40;

      // 基于段落数量评分
      if (dimData.sections.length >= 2) score += 30;
      else if (dimData.sections.length >= 1) score += 15;

      validation.dimensionScores[dimension] = Math.min(100, score);
      totalScore += validation.dimensionScores[dimension];

      if (score < 30) {
        validation.missingDimensions.push(dimension);
        validation.issues.push(`${dimInfo.name}(${dimension})内容不足`);
      }
    });

    validation.completeness = totalScore / dimensionCount;
    validation.isComplete = validation.completeness >= 60;

    return validation;
  }

  /**
   * 生成报告摘要
   */
  generateReportSummary(dimensionData, validationResult) {
    const completedDimensions = Object.keys(validationResult.dimensionScores)
      .filter(dim => validationResult.dimensionScores[dim] >= 60);

    const totalDimensions = Object.keys(this.reportStructure).length;

    return {
      completedDimensions: completedDimensions.length,
      totalDimensions,
      completionRate: (completedDimensions.length / totalDimensions * 100).toFixed(1),
      overallQuality: validationResult.completeness.toFixed(1),
      status: validationResult.isComplete ? '基本完整' : '需要完善',
      keyStrengths: this.identifyStrengths(dimensionData, validationResult),
      keyWeaknesses: this.identifyWeaknesses(dimensionData, validationResult)
    };
  }

  /**
   * 识别优势
   */
  identifyStrengths(dimensionData, validationResult) {
    return Object.keys(validationResult.dimensionScores)
      .filter(dim => validationResult.dimensionScores[dim] >= 80)
      .map(dim => this.reportStructure[dim].name);
  }

  /**
   * 识别弱点
   */
  identifyWeaknesses(dimensionData, validationResult) {
    return Object.keys(validationResult.dimensionScores)
      .filter(dim => validationResult.dimensionScores[dim] < 60)
      .map(dim => this.reportStructure[dim].name);
  }

  /**
   * 生成改进建议
   */
  generateImprovementSuggestions(dimensionData, validationResult) {
    const suggestions = []

    Object.keys(this.reportStructure).forEach(dimension => {
      const dimInfo = this.reportStructure[dimension]
      const dimData = dimensionData[dimension]
      const score = validationResult.dimensionScores[dimension] || 0

      if (score < 70) {
        suggestions.push({
          dimension,
          dimensionName: dimInfo.name,
          priority: score < 40 ? 'high' : 'medium',
          suggestion: this.getDimensionSuggestion(dimension, dimData, dimInfo),
          expectedImprovement: `预计可提升${dimension}维度质量${Math.min(30, 100 - score)}分`
        })
      }
    })

    return suggestions
  }

  /**
   * 获取维度建议
   */
  getDimensionSuggestion(dimension, dimData, dimInfo) {
    const suggestions = {
      D1: '建议补充团队成员的具体角色分工和联系方式，明确各成员的专业背景和责任范围',
      D2: '建议详细描述问题的具体现象、发生频率、影响范围和客户反馈，使用数据量化问题严重程度',
      D3: '建议明确临时措施的具体实施步骤、时间节点、负责人和效果验证方法',
      D4: '建议使用系统性分析方法（如5Why、鱼骨图）深入分析根本原因，并提供充分的验证证据',
      D5: '建议制定详细的永久纠正措施实施计划，包括时间表、资源需求和预期效果',
      D6: '建议补充措施实施的具体进度、验证测试结果和效果评估数据',
      D7: '建议建立系统性的预防措施，包括流程改进、培训计划和监控机制',
      D8: '建议详细记录团队贡献和经验总结，建立知识分享机制'
    }

    return suggestions[dimension] || '建议补充更详细的信息和数据支撑'
  }
}

export default new EightDReportAnalyzer()
