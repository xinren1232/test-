/**
 * 常规案例解析器
 * 解析一般性问题分析案例，提取关键信息和结构化数据
 */

/**
 * 案例结构定义
 */
export const CASE_SECTIONS = {
  METADATA: {
    name: '元数据信息',
    keywords: ['标题', '编号', '日期', '部门', '负责人', '分类'],
    patterns: [
      /(?:标题|题目)[:：\s]*(.+?)(?:\n|$)/i,
      /(?:编号|案例号)[:：\s]*([A-Z0-9-]+)/i,
      /(?:日期|时间)[:：\s]*(\d{4}[-\/年]\d{1,2}[-\/月]\d{1,2}[日]?)/i,
      /(?:部门|科室)[:：\s]*(.+?)(?:\n|$)/i
    ],
    fields: ['title', 'caseNumber', 'date', 'department', 'responsible', 'category']
  },

  BACKGROUND: {
    name: '背景信息',
    keywords: ['背景', '环境', '条件', '前提', '情况', '状态'],
    patterns: [
      /(?:背景|环境|条件)[:：\s]*([^。\n]{20,200})/i,
      /在.*?情况下/i,
      /当时.*?状态/i
    ],
    fields: ['context', 'environment', 'conditions', 'timeline']
  },

  PROBLEM: {
    name: '问题描述',
    keywords: ['问题', '故障', '异常', '缺陷', '不良', '失效'],
    patterns: [
      /(?:问题|故障|异常)[:：\s]*([^。\n]{20,300})/i,
      /发生.*?问题/i,
      /出现.*?异常/i
    ],
    fields: ['description', 'symptoms', 'impact', 'frequency', 'severity']
  },

  ANALYSIS: {
    name: '分析过程',
    keywords: ['分析', '调查', '检查', '测试', '验证', '排查'],
    patterns: [
      /(?:分析|调查|检查)[:：\s]*([^。\n]{20,300})/i,
      /通过.*?分析/i,
      /经过.*?调查/i
    ],
    fields: ['method', 'process', 'findings', 'data', 'tools']
  },

  CAUSE: {
    name: '原因分析',
    keywords: ['原因', '根源', '因素', '导致', '造成', '引起'],
    patterns: [
      /(?:原因|根源|因素)[:：\s]*([^。\n]{20,300})/i,
      /由于.*?导致/i,
      /因为.*?造成/i
    ],
    fields: ['rootCause', 'contributingFactors', 'mechanism', 'evidence']
  },

  SOLUTION: {
    name: '解决方案',
    keywords: ['解决', '处理', '措施', '方案', '对策', '改进'],
    patterns: [
      /(?:解决|处理|措施)[:：\s]*([^。\n]{20,300})/i,
      /采取.*?措施/i,
      /实施.*?方案/i
    ],
    fields: ['solution', 'steps', 'resources', 'timeline', 'responsible']
  },

  RESULT: {
    name: '处理结果',
    keywords: ['结果', '效果', '成果', '改善', '解决', '完成'],
    patterns: [
      /(?:结果|效果|成果)[:：\s]*([^。\n]{20,300})/i,
      /最终.*?解决/i,
      /成功.*?改善/i
    ],
    fields: ['outcome', 'effectiveness', 'metrics', 'verification']
  },

  LESSONS: {
    name: '经验总结',
    keywords: ['经验', '教训', '启示', '总结', '反思', '学习'],
    patterns: [
      /(?:经验|教训|启示)[:：\s]*([^。\n]{20,300})/i,
      /从中.*?学到/i,
      /总结.*?经验/i
    ],
    fields: ['lessons', 'insights', 'improvements', 'prevention']
  }
}

/**
 * 常规案例解析器类
 */
export class RegularCaseParser {
  constructor() {
    this.sections = CASE_SECTIONS
  }

  /**
   * 解析常规案例
   * @param {string} content - 案例内容
   * @returns {Object} 解析结果
   */
  async parseCase(content) {
    try {
      const result = {
        metadata: {},
        sections: {},
        summary: {},
        structure: {},
        quality: {},
        issues: [],
        recommendations: []
      }

      // 预处理内容
      const processedContent = this.preprocessContent(content)

      // 解析各个部分
      for (const [sectionId, sectionConfig] of Object.entries(this.sections)) {
        result.sections[sectionId] = await this.parseSection(
          processedContent, 
          sectionId, 
          sectionConfig
        )
      }

      // 提取元数据
      result.metadata = this.extractMetadata(result.sections.METADATA)

      // 分析文档结构
      result.structure = this.analyzeStructure(processedContent, result.sections)

      // 评估质量
      result.quality = this.assessQuality(result.sections, result.structure)

      // 生成摘要
      result.summary = this.generateSummary(result.sections, result.metadata)

      // 识别问题和生成建议
      result.issues = this.identifyIssues(result.sections, result.quality)
      result.recommendations = this.generateRecommendations(result.issues, result.quality)

      return result
    } catch (error) {
      console.error('常规案例解析失败:', error)
      throw new Error(`解析失败: ${error.message}`)
    }
  }

  /**
   * 预处理内容
   */
  preprocessContent(content) {
    // 统一换行符
    let processed = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    
    // 清理多余空白
    processed = processed.replace(/\n\s*\n/g, '\n\n')
    
    // 标准化标点符号
    processed = processed.replace(/：/g, ':').replace(/；/g, ';')
    
    return processed
  }

  /**
   * 解析单个部分
   */
  async parseSection(content, sectionId, sectionConfig) {
    const sectionResult = {
      id: sectionId,
      name: sectionConfig.name,
      content: '',
      extractedData: {},
      confidence: 0,
      keywords: [],
      issues: []
    }

    // 查找部分内容
    const sectionContent = this.extractSectionContent(content, sectionConfig)
    sectionResult.content = sectionContent

    if (sectionContent) {
      // 提取结构化数据
      sectionResult.extractedData = this.extractSectionData(sectionContent, sectionConfig.fields)
      
      // 提取关键词
      sectionResult.keywords = this.extractKeywords(sectionContent)
      
      // 计算置信度
      sectionResult.confidence = this.calculateSectionConfidence(sectionContent, sectionConfig)
      
      // 识别问题
      sectionResult.issues = this.identifySectionIssues(sectionContent, sectionConfig)
    }

    return sectionResult
  }

  /**
   * 提取部分内容
   */
  extractSectionContent(content, sectionConfig) {
    // 尝试模式匹配
    for (const pattern of sectionConfig.patterns) {
      const match = content.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }

    // 基于关键词查找相关段落
    return this.findRelevantParagraphs(content, sectionConfig.keywords)
  }

  /**
   * 查找相关段落
   */
  findRelevantParagraphs(content, keywords) {
    const paragraphs = content.split(/\n\s*\n/)
    const relevantParagraphs = []

    paragraphs.forEach(paragraph => {
      const keywordCount = keywords.filter(keyword => 
        paragraph.toLowerCase().includes(keyword.toLowerCase())
      ).length

      if (keywordCount >= 1) {
        relevantParagraphs.push(paragraph.trim())
      }
    })

    return relevantParagraphs.join('\n\n')
  }

  /**
   * 提取部分结构化数据
   */
  extractSectionData(content, fields) {
    const data = {}

    fields.forEach(field => {
      switch (field) {
        case 'title':
          data[field] = this.extractTitle(content)
          break
        case 'description':
          data[field] = this.extractDescription(content)
          break
        case 'rootCause':
          data[field] = this.extractRootCause(content)
          break
        case 'solution':
          data[field] = this.extractSolution(content)
          break
        case 'outcome':
          data[field] = this.extractOutcome(content)
          break
        case 'timeline':
          data[field] = this.extractTimeline(content)
          break
        case 'responsible':
          data[field] = this.extractResponsible(content)
          break
        default:
          data[field] = this.extractGenericField(content, field)
      }
    })

    return data
  }

  /**
   * 提取标题
   */
  extractTitle(content) {
    const patterns = [
      /(?:标题|题目|名称)[:：\s]*(.+?)(?:\n|$)/i,
      /^(.{5,50})(?:\n|$)/m
    ]

    for (const pattern of patterns) {
      const match = content.match(pattern)
      if (match) return match[1].trim()
    }

    return ''
  }

  /**
   * 提取描述
   */
  extractDescription(content) {
    // 返回内容的前200个字符作为描述
    return content.substring(0, 200).replace(/\n/g, ' ').trim()
  }

  /**
   * 提取根本原因
   */
  extractRootCause(content) {
    const patterns = [
      /(?:根本|主要|直接).*?原因[:：\s]*([^。\n]+)/i,
      /由于.*?([^。\n]{10,100})/i,
      /因为.*?([^。\n]{10,100})/i
    ]

    for (const pattern of patterns) {
      const match = content.match(pattern)
      if (match) return match[1].trim()
    }

    return ''
  }

  /**
   * 提取解决方案
   */
  extractSolution(content) {
    const patterns = [
      /(?:解决|处理|采取).*?(?:方案|措施|办法)[:：\s]*([^。\n]+)/i,
      /通过.*?([^。\n]{10,100})/i,
      /实施.*?([^。\n]{10,100})/i
    ]

    for (const pattern of patterns) {
      const match = content.match(pattern)
      if (match) return match[1].trim()
    }

    return ''
  }

  /**
   * 提取结果
   */
  extractOutcome(content) {
    const patterns = [
      /(?:结果|效果|成果)[:：\s]*([^。\n]+)/i,
      /最终.*?([^。\n]{10,100})/i,
      /成功.*?([^。\n]{10,100})/i
    ]

    for (const pattern of patterns) {
      const match = content.match(pattern)
      if (match) return match[1].trim()
    }

    return ''
  }

  /**
   * 提取时间线
   */
  extractTimeline(content) {
    const dates = content.match(/\d{4}[-\/年]\d{1,2}[-\/月]\d{1,2}[日]?/g) || []
    const times = content.match(/\d{1,2}[:：]\d{2}/g) || []
    
    return [...dates, ...times].join(', ')
  }

  /**
   * 提取负责人
   */
  extractResponsible(content) {
    const patterns = [
      /(?:负责人|责任人|处理人)[:：\s]*([^\n，,。]{2,10})/i,
      /([^\n，,。]{2,10})(?:\s*负责|\s*处理)/i
    ]

    for (const pattern of patterns) {
      const match = content.match(pattern)
      if (match) return match[1].trim()
    }

    return ''
  }

  /**
   * 提取通用字段
   */
  extractGenericField(content, fieldName) {
    const fieldPatterns = {
      category: /(?:分类|类型|种类)[:：\s]*([^\n，,。]+)/i,
      severity: /(?:严重|程度|级别)[:：\s]*([^\n，,。]+)/i,
      frequency: /(?:频率|次数|频繁)[:：\s]*([^\n，,。]+)/i,
      impact: /(?:影响|后果|损失)[:：\s]*([^\n，,。]+)/i,
      method: /(?:方法|方式|手段)[:：\s]*([^\n，,。]+)/i,
      tools: /(?:工具|设备|仪器)[:：\s]*([^\n，,。]+)/i
    }

    const pattern = fieldPatterns[fieldName]
    if (pattern) {
      const match = content.match(pattern)
      if (match) return match[1].trim()
    }

    return ''
  }

  /**
   * 提取关键词
   */
  extractKeywords(content) {
    const keywords = []
    const commonWords = ['的', '了', '在', '是', '有', '和', '与', '或', '但', '因为', '所以', '这个', '那个']
    
    // 提取中文词汇
    const chineseWords = content.match(/[\u4e00-\u9fa5]{2,}/g) || []
    chineseWords.forEach(word => {
      if (!commonWords.includes(word) && word.length >= 2 && word.length <= 6) {
        keywords.push(word)
      }
    })
    
    // 提取英文单词
    const englishWords = content.match(/[a-zA-Z]{3,}/g) || []
    englishWords.forEach(word => {
      keywords.push(word.toLowerCase())
    })
    
    // 去重并返回前15个关键词
    return [...new Set(keywords)].slice(0, 15)
  }

  /**
   * 计算部分置信度
   */
  calculateSectionConfidence(content, sectionConfig) {
    if (!content) return 0

    let score = 0

    // 关键词匹配 (40分)
    const keywordMatches = sectionConfig.keywords.filter(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    ).length
    score += Math.min(40, (keywordMatches / sectionConfig.keywords.length) * 40)

    // 模式匹配 (30分)
    const patternMatches = sectionConfig.patterns.filter(pattern => 
      pattern.test(content)
    ).length
    score += Math.min(30, (patternMatches / sectionConfig.patterns.length) * 30)

    // 内容长度 (20分)
    const lengthScore = Math.min(20, (content.length / 150) * 20)
    score += lengthScore

    // 结构化程度 (10分)
    const hasStructure = content.includes(':') || content.includes('：') || 
                        content.includes('\n') || content.includes('。')
    score += hasStructure ? 10 : 0

    return Math.round(Math.min(100, score))
  }

  /**
   * 识别部分问题
   */
  identifySectionIssues(content, sectionConfig) {
    const issues = []

    if (!content || content.length < 20) {
      issues.push({
        type: 'missing',
        message: `${sectionConfig.name} 内容缺失或过短`
      })
    }

    const keywordMatches = sectionConfig.keywords.filter(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    ).length

    if (keywordMatches === 0) {
      issues.push({
        type: 'irrelevant',
        message: `${sectionConfig.name} 内容可能不相关`
      })
    }

    return issues
  }

  /**
   * 提取元数据
   */
  extractMetadata(metadataSection) {
    const metadata = {
      title: '',
      caseNumber: '',
      date: '',
      department: '',
      responsible: '',
      category: ''
    }

    if (metadataSection && metadataSection.extractedData) {
      Object.assign(metadata, metadataSection.extractedData)
    }

    return metadata
  }

  /**
   * 分析文档结构
   */
  analyzeStructure(content, sections) {
    const structure = {
      totalLength: content.length,
      paragraphCount: content.split(/\n\s*\n/).length,
      sectionCount: Object.keys(sections).length,
      completedSections: 0,
      hasTimeline: false,
      hasQuantitativeData: false,
      organizationLevel: 'basic'
    }

    // 统计完成的部分
    structure.completedSections = Object.values(sections).filter(section => 
      section.content && section.confidence > 50
    ).length

    // 检查是否有时间线
    structure.hasTimeline = /\d{4}[-\/年]\d{1,2}[-\/月]\d{1,2}[日]?/.test(content)

    // 检查是否有定量数据
    structure.hasQuantitativeData = /\d+%|\d+\.\d+|\d+个|\d+次/.test(content)

    // 评估组织水平
    if (structure.completedSections >= 6) {
      structure.organizationLevel = 'excellent'
    } else if (structure.completedSections >= 4) {
      structure.organizationLevel = 'good'
    } else if (structure.completedSections >= 2) {
      structure.organizationLevel = 'fair'
    }

    return structure
  }

  /**
   * 评估质量
   */
  assessQuality(sections, structure) {
    const quality = {
      overallScore: 0,
      completeness: 0,
      clarity: 0,
      detail: 0,
      structure: 0
    }

    // 完整性评分 (30%)
    const totalSections = Object.keys(this.sections).length
    const completedSections = Object.values(sections).filter(section => 
      section.content && section.confidence > 60
    ).length
    quality.completeness = Math.round((completedSections / totalSections) * 100)

    // 清晰度评分 (25%)
    const avgConfidence = Object.values(sections).reduce((sum, section) => 
      sum + section.confidence, 0) / Object.keys(sections).length
    quality.clarity = Math.round(avgConfidence)

    // 详细程度评分 (25%)
    const avgContentLength = Object.values(sections).reduce((sum, section) => 
      sum + (section.content ? section.content.length : 0), 0) / Object.keys(sections).length
    quality.detail = Math.min(100, Math.round((avgContentLength / 100) * 100))

    // 结构化程度评分 (20%)
    const structureScore = {
      'excellent': 100,
      'good': 80,
      'fair': 60,
      'basic': 40
    }
    quality.structure = structureScore[structure.organizationLevel] || 40

    // 总体评分
    quality.overallScore = Math.round(
      quality.completeness * 0.3 +
      quality.clarity * 0.25 +
      quality.detail * 0.25 +
      quality.structure * 0.2
    )

    return quality
  }

  /**
   * 生成摘要
   */
  generateSummary(sections, metadata) {
    const summary = {
      title: metadata.title || '案例分析报告',
      category: metadata.category || '常规案例',
      problemSummary: '',
      solutionSummary: '',
      resultSummary: '',
      keyPoints: []
    }

    // 问题摘要
    if (sections.PROBLEM && sections.PROBLEM.extractedData.description) {
      summary.problemSummary = sections.PROBLEM.extractedData.description
    }

    // 解决方案摘要
    if (sections.SOLUTION && sections.SOLUTION.extractedData.solution) {
      summary.solutionSummary = sections.SOLUTION.extractedData.solution
    }

    // 结果摘要
    if (sections.RESULT && sections.RESULT.extractedData.outcome) {
      summary.resultSummary = sections.RESULT.extractedData.outcome
    }

    // 关键要点
    Object.values(sections).forEach(section => {
      if (section.confidence > 70 && section.keywords.length > 0) {
        summary.keyPoints.push(...section.keywords.slice(0, 3))
      }
    })

    // 去重关键要点
    summary.keyPoints = [...new Set(summary.keyPoints)].slice(0, 10)

    return summary
  }

  /**
   * 识别问题
   */
  identifyIssues(sections, quality) {
    const issues = []

    // 质量问题
    if (quality.overallScore < 60) {
      issues.push({
        type: 'quality',
        severity: 'medium',
        message: `案例质量偏低 (${quality.overallScore}分)`,
        details: '建议补充更多详细信息和结构化内容'
      })
    }

    // 完整性问题
    if (quality.completeness < 70) {
      issues.push({
        type: 'completeness',
        severity: 'high',
        message: `案例完整性不足 (${quality.completeness}%)`,
        details: '缺少关键部分，建议补充问题描述、分析过程、解决方案等'
      })
    }

    // 关键部分缺失
    const criticalSections = ['PROBLEM', 'ANALYSIS', 'SOLUTION']
    criticalSections.forEach(sectionId => {
      if (!sections[sectionId] || sections[sectionId].confidence < 50) {
        issues.push({
          type: 'missing',
          severity: 'high',
          message: `缺少${this.sections[sectionId].name}`,
          details: `${this.sections[sectionId].name}是案例分析的关键部分`
        })
      }
    })

    return issues
  }

  /**
   * 生成建议
   */
  generateRecommendations(issues, quality) {
    const recommendations = []

    if (quality.completeness < 80) {
      recommendations.push({
        type: 'improvement',
        priority: 'high',
        title: '完善案例结构',
        description: '建议按照标准案例分析框架补充背景、问题、分析、解决方案、结果、经验等部分'
      })
    }

    if (quality.detail < 60) {
      recommendations.push({
        type: 'enhancement',
        priority: 'medium',
        title: '增加详细信息',
        description: '建议在各部分添加更多具体细节，包括数据、时间、人员、方法等'
      })
    }

    if (quality.structure < 70) {
      recommendations.push({
        type: 'organization',
        priority: 'medium',
        title: '改进文档结构',
        description: '建议使用清晰的标题、段落和格式，提高文档的可读性和结构化程度'
      })
    }

    recommendations.push({
      type: 'general',
      priority: 'low',
      title: '标准化模板',
      description: '建议使用标准的案例分析模板，确保信息完整性和一致性'
    })

    return recommendations
  }
}

/**
 * 默认导出解析器实例
 */
export default new RegularCaseParser()
