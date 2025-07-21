/**
 * 8D报告专用解析器
 * 按照8D方法论的标准结构解析报告内容
 */

/**
 * 8D步骤定义
 */
export const D8_STEPS = {
  D1: {
    name: 'D1 - 建立团队',
    keywords: ['团队', '小组', '成员', '负责人', '组长', '参与者'],
    patterns: [/D1[:：\s]*(.{0,50}团队.{0,50})/gi, /建立.*团队/gi],
    fields: ['teamLeader', 'teamMembers', 'teamRole', 'contactInfo']
  },
  D2: {
    name: 'D2 - 描述问题',
    keywords: ['问题', '现象', '症状', '表现', '发生', '异常'],
    patterns: [/D2[:：\s]*(.{0,50}问题.{0,50})/gi, /问题.*描述/gi],
    fields: ['problemDescription', 'occurrence', 'symptoms', 'impact']
  },
  D3: {
    name: 'D3 - 临时对策',
    keywords: ['临时', '应急', '对策', '措施', '处理', '控制'],
    patterns: [/D3[:：\s]*(.{0,50}对策.{0,50})/gi, /临时.*措施/gi],
    fields: ['temporaryAction', 'implementation', 'effectiveness', 'timeline']
  },
  D4: {
    name: 'D4 - 根本原因',
    keywords: ['根本', '原因', '分析', '为什么', '因素', '源头'],
    patterns: [/D4[:：\s]*(.{0,50}原因.{0,50})/gi, /根本.*原因/gi],
    fields: ['rootCause', 'analysis', 'verification', 'evidence']
  },
  D5: {
    name: 'D5 - 永久对策',
    keywords: ['永久', '根治', '对策', '解决', '改进', '优化'],
    patterns: [/D5[:：\s]*(.{0,50}对策.{0,50})/gi, /永久.*措施/gi],
    fields: ['permanentAction', 'solution', 'implementation', 'validation']
  },
  D6: {
    name: 'D6 - 实施验证',
    keywords: ['实施', '验证', '确认', '测试', '检验', '效果'],
    patterns: [/D6[:：\s]*(.{0,50}验证.{0,50})/gi, /实施.*验证/gi],
    fields: ['implementation', 'verification', 'results', 'monitoring']
  },
  D7: {
    name: 'D7 - 预防措施',
    keywords: ['预防', '防止', '避免', '系统', '流程', '标准'],
    patterns: [/D7[:：\s]*(.{0,50}预防.{0,50})/gi, /预防.*措施/gi],
    fields: ['prevention', 'systemUpdate', 'processImprovement', 'training']
  },
  D8: {
    name: 'D8 - 团队祝贺',
    keywords: ['祝贺', '表彰', '总结', '经验', '学习', '分享'],
    patterns: [/D8[:：\s]*(.{0,50}祝贺.{0,50})/gi, /团队.*祝贺/gi],
    fields: ['recognition', 'lessons', 'sharing', 'closure']
  }
}

/**
 * 8D报告解析器类
 */
export class D8ReportParser {
  constructor() {
    this.steps = D8_STEPS
  }

  /**
   * 解析8D报告
   * @param {string} content - 报告内容
   * @returns {Object} 解析结果
   */
  async parseReport(content) {
    try {
      const result = {
        metadata: this.extractMetadata(content),
        steps: {},
        summary: {},
        completeness: {},
        issues: [],
        recommendations: []
      }

      // 解析每个8D步骤
      for (const [stepId, stepConfig] of Object.entries(this.steps)) {
        result.steps[stepId] = await this.parseStep(content, stepId, stepConfig)
      }

      // 生成完整性评估
      result.completeness = this.assessCompleteness(result.steps)

      // 生成摘要
      result.summary = this.generateSummary(result.steps, result.metadata)

      // 识别问题和生成建议
      result.issues = this.identifyIssues(result.steps, result.completeness)
      result.recommendations = this.generateRecommendations(result.issues, result.completeness)

      return result
    } catch (error) {
      console.error('8D报告解析失败:', error)
      throw new Error(`解析失败: ${error.message}`)
    }
  }

  /**
   * 提取报告元数据
   */
  extractMetadata(content) {
    const metadata = {
      title: '',
      reportNumber: '',
      date: '',
      department: '',
      product: '',
      customer: ''
    }

    // 提取标题
    const titleMatch = content.match(/(?:标题|题目|报告名称)[:：\s]*(.+?)(?:\n|$)/i)
    if (titleMatch) metadata.title = titleMatch[1].trim()

    // 提取报告编号
    const numberMatch = content.match(/(?:编号|报告号|NO)[:：\s]*([A-Z0-9-]+)/i)
    if (numberMatch) metadata.reportNumber = numberMatch[1].trim()

    // 提取日期
    const dateMatch = content.match(/(\d{4}[-\/年]\d{1,2}[-\/月]\d{1,2}[日]?)/g)
    if (dateMatch) metadata.date = dateMatch[0]

    // 提取部门
    const deptMatch = content.match(/(?:部门|科室|车间)[:：\s]*(.+?)(?:\n|$)/i)
    if (deptMatch) metadata.department = deptMatch[1].trim()

    // 提取产品信息
    const productMatch = content.match(/(?:产品|物料|零件)[:：\s]*(.+?)(?:\n|$)/i)
    if (productMatch) metadata.product = productMatch[1].trim()

    return metadata
  }

  /**
   * 解析单个8D步骤
   */
  async parseStep(content, stepId, stepConfig) {
    const stepResult = {
      id: stepId,
      name: stepConfig.name,
      content: '',
      extractedData: {},
      confidence: 0,
      issues: []
    }

    // 查找步骤内容
    const stepContent = this.extractStepContent(content, stepId, stepConfig)
    stepResult.content = stepContent

    if (stepContent) {
      // 提取结构化数据
      stepResult.extractedData = this.extractStepData(stepContent, stepConfig.fields)
      
      // 计算置信度
      stepResult.confidence = this.calculateStepConfidence(stepContent, stepConfig)
      
      // 识别步骤问题
      stepResult.issues = this.identifyStepIssues(stepContent, stepConfig)
    }

    return stepResult
  }

  /**
   * 提取步骤内容
   */
  extractStepContent(content, stepId, stepConfig) {
    // 尝试多种模式匹配
    const patterns = [
      new RegExp(`${stepId}[:：\\s]*([\\s\\S]*?)(?=D[1-8][:：]|$)`, 'i'),
      new RegExp(`${stepConfig.name}([\\s\\S]*?)(?=D[1-8]|$)`, 'i'),
      ...stepConfig.patterns
    ]

    for (const pattern of patterns) {
      const match = content.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }

    // 如果没有找到明确的步骤标识，尝试基于关键词查找
    return this.findContentByKeywords(content, stepConfig.keywords)
  }

  /**
   * 基于关键词查找内容
   */
  findContentByKeywords(content, keywords) {
    const sentences = content.split(/[。！？\n]/)
    const relevantSentences = []

    sentences.forEach(sentence => {
      const keywordCount = keywords.filter(keyword => 
        sentence.includes(keyword)
      ).length

      if (keywordCount >= 2) {
        relevantSentences.push(sentence.trim())
      }
    })

    return relevantSentences.join('。')
  }

  /**
   * 提取步骤结构化数据
   */
  extractStepData(content, fields) {
    const data = {}

    fields.forEach(field => {
      switch (field) {
        case 'teamLeader':
          data[field] = this.extractTeamLeader(content)
          break
        case 'teamMembers':
          data[field] = this.extractTeamMembers(content)
          break
        case 'problemDescription':
          data[field] = this.extractProblemDescription(content)
          break
        case 'temporaryAction':
          data[field] = this.extractTemporaryAction(content)
          break
        case 'rootCause':
          data[field] = this.extractRootCause(content)
          break
        case 'permanentAction':
          data[field] = this.extractPermanentAction(content)
          break
        default:
          data[field] = this.extractGenericField(content, field)
      }
    })

    return data
  }

  /**
   * 提取团队负责人
   */
  extractTeamLeader(content) {
    const patterns = [
      /(?:负责人|组长|领导)[:：\s]*([^\n，,。]{2,10})/i,
      /([^\n，,。]{2,10})(?:\s*负责|\s*组长)/i
    ]

    for (const pattern of patterns) {
      const match = content.match(pattern)
      if (match) return match[1].trim()
    }

    return ''
  }

  /**
   * 提取团队成员
   */
  extractTeamMembers(content) {
    const members = []
    const patterns = [
      /(?:成员|参与者)[:：\s]*([^\n。]+)/i,
      /([^\n。]{2,50})(?:参与|加入)/i
    ]

    patterns.forEach(pattern => {
      const match = content.match(pattern)
      if (match) {
        const memberStr = match[1]
        const memberList = memberStr.split(/[，,、\s]+/).filter(m => m.length >= 2)
        members.push(...memberList)
      }
    })

    return [...new Set(members)]
  }

  /**
   * 提取问题描述
   */
  extractProblemDescription(content) {
    const patterns = [
      /(?:问题|现象|症状)[:：\s]*([^\n。]+)/i,
      /发生.*?([^\n。]{10,100})/i
    ]

    for (const pattern of patterns) {
      const match = content.match(pattern)
      if (match) return match[1].trim()
    }

    return content.substring(0, 200) // 返回前200个字符作为描述
  }

  /**
   * 提取临时对策
   */
  extractTemporaryAction(content) {
    const patterns = [
      /(?:临时|应急).*?(?:对策|措施|处理)[:：\s]*([^\n。]+)/i,
      /立即.*?([^\n。]{10,100})/i
    ]

    for (const pattern of patterns) {
      const match = content.match(pattern)
      if (match) return match[1].trim()
    }

    return ''
  }

  /**
   * 提取根本原因
   */
  extractRootCause(content) {
    const patterns = [
      /(?:根本|真正).*?原因[:：\s]*([^\n。]+)/i,
      /因为.*?([^\n。]{10,100})/i,
      /原因.*?分析[:：\s]*([^\n。]+)/i
    ]

    for (const pattern of patterns) {
      const match = content.match(pattern)
      if (match) return match[1].trim()
    }

    return ''
  }

  /**
   * 提取永久对策
   */
  extractPermanentAction(content) {
    const patterns = [
      /(?:永久|根治).*?(?:对策|措施|解决)[:：\s]*([^\n。]+)/i,
      /改进.*?([^\n。]{10,100})/i
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
    const fieldMap = {
      implementation: ['实施', '执行', '落实'],
      verification: ['验证', '确认', '检验'],
      prevention: ['预防', '防止', '避免'],
      timeline: ['时间', '期限', '计划']
    }

    const keywords = fieldMap[fieldName] || [fieldName]
    
    for (const keyword of keywords) {
      const pattern = new RegExp(`${keyword}[:：\\s]*([^\\n。]+)`, 'i')
      const match = content.match(pattern)
      if (match) return match[1].trim()
    }

    return ''
  }

  /**
   * 计算步骤置信度
   */
  calculateStepConfidence(content, stepConfig) {
    if (!content) return 0

    let score = 0
    const maxScore = 100

    // 关键词匹配 (40分)
    const keywordMatches = stepConfig.keywords.filter(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    ).length
    score += Math.min(40, (keywordMatches / stepConfig.keywords.length) * 40)

    // 模式匹配 (30分)
    const patternMatches = stepConfig.patterns.filter(pattern => 
      pattern.test(content)
    ).length
    score += Math.min(30, (patternMatches / stepConfig.patterns.length) * 30)

    // 内容长度 (20分)
    const lengthScore = Math.min(20, (content.length / 100) * 20)
    score += lengthScore

    // 结构化程度 (10分)
    const structureScore = content.includes('：') || content.includes(':') ? 10 : 0
    score += structureScore

    return Math.round(Math.min(maxScore, score))
  }

  /**
   * 识别步骤问题
   */
  identifyStepIssues(content, stepConfig) {
    const issues = []

    if (!content || content.length < 10) {
      issues.push({
        type: 'missing',
        message: `${stepConfig.name} 内容缺失或过短`
      })
    }

    const keywordMatches = stepConfig.keywords.filter(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    ).length

    if (keywordMatches < stepConfig.keywords.length * 0.3) {
      issues.push({
        type: 'incomplete',
        message: `${stepConfig.name} 关键信息不完整`
      })
    }

    return issues
  }

  /**
   * 评估完整性
   */
  assessCompleteness(steps) {
    const totalSteps = Object.keys(this.steps).length
    const completedSteps = Object.values(steps).filter(step => 
      step.content && step.confidence > 50
    ).length

    const completenessScore = Math.round((completedSteps / totalSteps) * 100)

    return {
      score: completenessScore,
      totalSteps,
      completedSteps,
      missingSteps: Object.keys(this.steps).filter(stepId => 
        !steps[stepId] || !steps[stepId].content || steps[stepId].confidence <= 50
      )
    }
  }

  /**
   * 生成摘要
   */
  generateSummary(steps, metadata) {
    const summary = {
      title: metadata.title || '8D问题解决报告',
      problemSummary: '',
      solutionSummary: '',
      status: '',
      keyFindings: []
    }

    // 问题摘要
    if (steps.D2 && steps.D2.extractedData.problemDescription) {
      summary.problemSummary = steps.D2.extractedData.problemDescription
    }

    // 解决方案摘要
    if (steps.D5 && steps.D5.extractedData.permanentAction) {
      summary.solutionSummary = steps.D5.extractedData.permanentAction
    }

    // 状态评估
    const avgConfidence = Object.values(steps).reduce((sum, step) => 
      sum + step.confidence, 0) / Object.keys(steps).length

    if (avgConfidence > 80) {
      summary.status = '完整'
    } else if (avgConfidence > 60) {
      summary.status = '基本完整'
    } else {
      summary.status = '不完整'
    }

    // 关键发现
    Object.values(steps).forEach(step => {
      if (step.confidence > 70 && step.extractedData) {
        Object.values(step.extractedData).forEach(data => {
          if (data && typeof data === 'string' && data.length > 10) {
            summary.keyFindings.push(data)
          }
        })
      }
    })

    return summary
  }

  /**
   * 识别问题
   */
  identifyIssues(steps, completeness) {
    const issues = []

    // 完整性问题
    if (completeness.score < 70) {
      issues.push({
        type: 'completeness',
        severity: 'high',
        message: `报告完整性不足 (${completeness.score}%)`,
        details: `缺失步骤: ${completeness.missingSteps.join(', ')}`
      })
    }

    // 关键步骤问题
    const criticalSteps = ['D2', 'D4', 'D5']
    criticalSteps.forEach(stepId => {
      if (!steps[stepId] || steps[stepId].confidence < 60) {
        issues.push({
          type: 'critical',
          severity: 'high',
          message: `关键步骤 ${stepId} 信息不完整`,
          details: `${this.steps[stepId].name} 需要补充更多信息`
        })
      }
    })

    return issues
  }

  /**
   * 生成建议
   */
  generateRecommendations(issues, completeness) {
    const recommendations = []

    if (completeness.score < 80) {
      recommendations.push({
        type: 'improvement',
        priority: 'high',
        title: '完善报告内容',
        description: '建议补充缺失的8D步骤内容，提高报告完整性'
      })
    }

    if (issues.some(issue => issue.type === 'critical')) {
      recommendations.push({
        type: 'critical',
        priority: 'high',
        title: '完善关键步骤',
        description: '重点补充D2问题描述、D4根本原因分析、D5永久对策等关键信息'
      })
    }

    recommendations.push({
      type: 'general',
      priority: 'medium',
      title: '标准化格式',
      description: '建议使用标准的8D报告模板，确保各步骤信息完整清晰'
    })

    return recommendations
  }
}

/**
 * 默认导出解析器实例
 */
export default new D8ReportParser()
