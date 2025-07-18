/**
 * 8D报告专用解析器
 * 按照8D方法论的标准结构解析报告内容
 */

/**
 * 8D报告标准结构定义
 */
const D8_STRUCTURE = {
  D1: {
    title: '建立团队',
    description: '组建跨职能团队',
    keywords: ['团队', '成员', '职责', '分工', '负责人'],
    fields: ['teamMembers', 'teamLeader', 'responsibilities', 'contactInfo']
  },
  D2: {
    title: '问题描述',
    description: '详细描述问题',
    keywords: ['问题', '现象', '影响', '数据', '客户'],
    fields: ['problemDescription', 'symptoms', 'impact', 'customerInfo', 'timeline']
  },
  D3: {
    title: '实施临时措施',
    description: '实施临时遏制措施',
    keywords: ['临时', '应急', '遏制', '措施', '验证'],
    fields: ['temporaryActions', 'effectiveness', 'verification', 'timeline']
  },
  D4: {
    title: '根本原因分析',
    description: '确定并验证根本原因',
    keywords: ['根本原因', '分析', '鱼骨图', '5Why', '验证'],
    fields: ['rootCauses', 'analysisMethod', 'verification', 'evidence']
  },
  D5: {
    title: '选择永久纠正措施',
    description: '选择并验证永久纠正措施',
    keywords: ['永久', '纠正', '措施', '选择', '验证'],
    fields: ['correctiveActions', 'selection', 'verification', 'riskAssessment']
  },
  D6: {
    title: '实施永久纠正措施',
    description: '实施永久纠正措施并移除临时措施',
    keywords: ['实施', '永久', '移除', '临时', '监控'],
    fields: ['implementation', 'timeline', 'monitoring', 'temporaryRemoval']
  },
  D7: {
    title: '预防再发生',
    description: '预防问题再次发生',
    keywords: ['预防', '系统', '流程', '标准', '培训'],
    fields: ['preventiveActions', 'systemChanges', 'procedures', 'training']
  },
  D8: {
    title: '团队祝贺',
    description: '认可团队努力',
    keywords: ['祝贺', '认可', '总结', '经验', '分享'],
    fields: ['recognition', 'lessons', 'sharing', 'celebration']
  }
}

/**
 * 解析8D报告
 * @param {string} content - 报告内容
 * @param {Object} options - 解析选项
 * @returns {Object} 解析结果
 */
export function parseD8Report(content, options = {}) {
  try {
    const result = {
      reportType: '8D报告',
      parseTime: new Date().toISOString(),
      structure: {},
      summary: {
        completeness: 0,
        totalSteps: 8,
        completedSteps: 0,
        missingSteps: []
      },
      extractedData: {},
      issues: [],
      recommendations: []
    }

    // 预处理内容
    const processedContent = preprocessContent(content)

    // 解析每个D步骤
    Object.keys(D8_STRUCTURE).forEach(step => {
      const stepResult = parseD8Step(processedContent, step, D8_STRUCTURE[step])
      result.structure[step] = stepResult
      
      if (stepResult.hasContent) {
        result.summary.completedSteps++
      } else {
        result.summary.missingSteps.push(step)
      }
    })

    // 计算完整性
    result.summary.completeness = (result.summary.completedSteps / result.summary.totalSteps) * 100

    // 提取关键数据
    result.extractedData = extractKeyData(result.structure)

    // 生成问题和建议
    result.issues = identifyIssues(result.structure, result.summary)
    result.recommendations = generateRecommendations(result.issues, result.summary)

    return result
  } catch (error) {
    console.error('8D报告解析失败:', error)
    return {
      reportType: '8D报告',
      parseTime: new Date().toISOString(),
      error: error.message,
      success: false
    }
  }
}

/**
 * 预处理内容
 * @param {string} content - 原始内容
 * @returns {string} 处理后的内容
 */
function preprocessContent(content) {
  // 清理和标准化内容
  let processed = content
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\s+/g, ' ')
    .trim()

  // 标准化D步骤标记
  processed = processed
    .replace(/D(\d)/g, 'D$1')
    .replace(/第([一二三四五六七八])步/g, (match, num) => {
      const numMap = { '一': '1', '二': '2', '三': '3', '四': '4', '五': '5', '六': '6', '七': '7', '八': '8' }
      return `D${numMap[num]}`
    })

  return processed
}

/**
 * 解析单个D步骤
 * @param {string} content - 内容
 * @param {string} step - 步骤标识 (D1-D8)
 * @param {Object} stepDef - 步骤定义
 * @returns {Object} 步骤解析结果
 */
function parseD8Step(content, step, stepDef) {
  const result = {
    step,
    title: stepDef.title,
    description: stepDef.description,
    hasContent: false,
    content: '',
    extractedFields: {},
    confidence: 0,
    issues: []
  }

  try {
    // 查找步骤内容
    const stepContent = extractStepContent(content, step)
    
    if (stepContent) {
      result.hasContent = true
      result.content = stepContent
      result.confidence = calculateContentConfidence(stepContent, stepDef.keywords)
      
      // 提取结构化字段
      result.extractedFields = extractStepFields(stepContent, stepDef.fields, step)
      
      // 识别问题
      result.issues = identifyStepIssues(stepContent, stepDef, step)
    }

    return result
  } catch (error) {
    console.error(`解析步骤${step}失败:`, error)
    result.issues.push({
      type: 'parse_error',
      message: `解析步骤${step}时发生错误: ${error.message}`
    })
    return result
  }
}

/**
 * 提取步骤内容
 * @param {string} content - 完整内容
 * @param {string} step - 步骤标识
 * @returns {string|null} 步骤内容
 */
function extractStepContent(content, step) {
  const patterns = [
    // 标准格式: D1. 或 D1: 或 D1：
    new RegExp(`${step}[\\s\\.\\:：]([\\s\\S]*?)(?=D[1-8]|$)`, 'i'),
    // 带标题格式
    new RegExp(`${step}[\\s]*${D8_STRUCTURE[step].title}[\\s\\S]*?([\\s\\S]*?)(?=D[1-8]|$)`, 'i'),
    // 步骤格式
    new RegExp(`步骤\\s*${step.substring(1)}[\\s\\S]*?([\\s\\S]*?)(?=步骤|$)`, 'i')
  ]

  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match && match[1] && match[1].trim().length > 10) {
      return match[1].trim()
    }
  }

  // 如果没有找到明确的步骤分隔，尝试通过关键词查找
  const keywords = D8_STRUCTURE[step].keywords
  for (const keyword of keywords) {
    const keywordPattern = new RegExp(`${keyword}[\\s\\S]{0,500}`, 'i')
    const match = content.match(keywordPattern)
    if (match && match[0].length > 20) {
      return match[0]
    }
  }

  return null
}

/**
 * 计算内容置信度
 * @param {string} content - 内容
 * @param {Array} keywords - 关键词列表
 * @returns {number} 置信度 (0-100)
 */
function calculateContentConfidence(content, keywords) {
  let score = 0
  const contentLower = content.toLowerCase()

  keywords.forEach(keyword => {
    if (contentLower.includes(keyword.toLowerCase())) {
      score += 20
    }
  })

  // 内容长度加分
  if (content.length > 50) score += 10
  if (content.length > 200) score += 10
  if (content.length > 500) score += 10

  return Math.min(100, score)
}

/**
 * 提取步骤字段
 * @param {string} content - 步骤内容
 * @param {Array} fields - 字段列表
 * @param {string} step - 步骤标识
 * @returns {Object} 提取的字段
 */
function extractStepFields(content, fields, step) {
  const extracted = {}

  // 根据不同步骤使用不同的提取策略
  switch (step) {
    case 'D1':
      extracted.teamMembers = extractTeamMembers(content)
      extracted.teamLeader = extractTeamLeader(content)
      break
    case 'D2':
      extracted.problemDescription = extractProblemDescription(content)
      extracted.impact = extractImpact(content)
      break
    case 'D3':
      extracted.temporaryActions = extractActions(content, '临时')
      break
    case 'D4':
      extracted.rootCauses = extractRootCauses(content)
      extracted.analysisMethod = extractAnalysisMethod(content)
      break
    case 'D5':
      extracted.correctiveActions = extractActions(content, '纠正')
      break
    case 'D6':
      extracted.implementation = extractImplementation(content)
      break
    case 'D7':
      extracted.preventiveActions = extractActions(content, '预防')
      break
    case 'D8':
      extracted.recognition = extractRecognition(content)
      break
  }

  return extracted
}

/**
 * 提取团队成员信息
 * @param {string} content - 内容
 * @returns {Array} 团队成员列表
 */
function extractTeamMembers(content) {
  const members = []
  const patterns = [
    /成员[：:]\s*([^\n]+)/gi,
    /团队[：:]\s*([^\n]+)/gi,
    /参与人[：:]\s*([^\n]+)/gi
  ]

  patterns.forEach(pattern => {
    const matches = content.match(pattern)
    if (matches) {
      matches.forEach(match => {
        const memberText = match.split(/[：:]/)[1]
        if (memberText) {
          const memberList = memberText.split(/[,，、\s]+/).filter(m => m.trim())
          members.push(...memberList)
        }
      })
    }
  })

  return [...new Set(members)] // 去重
}

/**
 * 提取团队负责人
 * @param {string} content - 内容
 * @returns {string} 负责人
 */
function extractTeamLeader(content) {
  const patterns = [
    /负责人[：:]\s*([^\n,，]+)/i,
    /组长[：:]\s*([^\n,，]+)/i,
    /领导[：:]\s*([^\n,，]+)/i
  ]

  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  return ''
}

/**
 * 提取问题描述
 * @param {string} content - 内容
 * @returns {string} 问题描述
 */
function extractProblemDescription(content) {
  const patterns = [
    /问题描述[：:]\s*([^\n]+)/i,
    /问题[：:]\s*([^\n]+)/i,
    /现象[：:]\s*([^\n]+)/i
  ]

  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  // 如果没有明确标识，返回前100个字符
  return content.substring(0, 100) + '...'
}

/**
 * 提取影响信息
 * @param {string} content - 内容
 * @returns {string} 影响描述
 */
function extractImpact(content) {
  const patterns = [
    /影响[：:]\s*([^\n]+)/i,
    /后果[：:]\s*([^\n]+)/i,
    /损失[：:]\s*([^\n]+)/i
  ]

  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  return ''
}

/**
 * 提取措施信息
 * @param {string} content - 内容
 * @param {string} type - 措施类型
 * @returns {Array} 措施列表
 */
function extractActions(content, type) {
  const actions = []
  const patterns = [
    new RegExp(`${type}.*措施[：:]\\s*([^\\n]+)`, 'gi'),
    new RegExp(`${type}.*方案[：:]\\s*([^\\n]+)`, 'gi'),
    new RegExp(`${type}.*行动[：:]\\s*([^\\n]+)`, 'gi')
  ]

  patterns.forEach(pattern => {
    const matches = content.match(pattern)
    if (matches) {
      matches.forEach(match => {
        const actionText = match.split(/[：:]/)[1]
        if (actionText) {
          actions.push(actionText.trim())
        }
      })
    }
  })

  return actions
}

/**
 * 提取根本原因
 * @param {string} content - 内容
 * @returns {Array} 根本原因列表
 */
function extractRootCauses(content) {
  const causes = []
  const patterns = [
    /根本原因[：:]\s*([^\n]+)/gi,
    /主要原因[：:]\s*([^\n]+)/gi,
    /原因[：:]\s*([^\n]+)/gi
  ]

  patterns.forEach(pattern => {
    const matches = content.match(pattern)
    if (matches) {
      matches.forEach(match => {
        const causeText = match.split(/[：:]/)[1]
        if (causeText) {
          causes.push(causeText.trim())
        }
      })
    }
  })

  return causes
}

/**
 * 提取分析方法
 * @param {string} content - 内容
 * @returns {string} 分析方法
 */
function extractAnalysisMethod(content) {
  const methods = ['鱼骨图', '5Why', '故障树', 'FMEA', '因果图']
  
  for (const method of methods) {
    if (content.includes(method)) {
      return method
    }
  }

  return ''
}

/**
 * 提取实施信息
 * @param {string} content - 内容
 * @returns {Object} 实施信息
 */
function extractImplementation(content) {
  return {
    timeline: extractTimeline(content),
    responsible: extractResponsible(content),
    status: extractStatus(content)
  }
}

/**
 * 提取时间线
 * @param {string} content - 内容
 * @returns {string} 时间线
 */
function extractTimeline(content) {
  const patterns = [
    /时间[：:]\s*([^\n]+)/i,
    /计划[：:]\s*([^\n]+)/i,
    /\d{4}[-/]\d{1,2}[-/]\d{1,2}/g
  ]

  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match) {
      return Array.isArray(match) ? match.join(', ') : match[1] || match[0]
    }
  }

  return ''
}

/**
 * 提取负责人
 * @param {string} content - 内容
 * @returns {string} 负责人
 */
function extractResponsible(content) {
  const patterns = [
    /负责人[：:]\s*([^\n,，]+)/i,
    /责任人[：:]\s*([^\n,，]+)/i
  ]

  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  return ''
}

/**
 * 提取状态
 * @param {string} content - 内容
 * @returns {string} 状态
 */
function extractStatus(content) {
  const statusKeywords = ['完成', '进行中', '计划中', '已实施', '待实施']
  
  for (const status of statusKeywords) {
    if (content.includes(status)) {
      return status
    }
  }

  return '未知'
}

/**
 * 提取认可信息
 * @param {string} content - 内容
 * @returns {Object} 认可信息
 */
function extractRecognition(content) {
  return {
    achievements: extractAchievements(content),
    lessons: extractLessons(content),
    sharing: extractSharing(content)
  }
}

/**
 * 提取成就
 * @param {string} content - 内容
 * @returns {Array} 成就列表
 */
function extractAchievements(content) {
  const achievements = []
  const patterns = [
    /成果[：:]\s*([^\n]+)/gi,
    /成就[：:]\s*([^\n]+)/gi,
    /收获[：:]\s*([^\n]+)/gi
  ]

  patterns.forEach(pattern => {
    const matches = content.match(pattern)
    if (matches) {
      matches.forEach(match => {
        const achievementText = match.split(/[：:]/)[1]
        if (achievementText) {
          achievements.push(achievementText.trim())
        }
      })
    }
  })

  return achievements
}

/**
 * 提取经验教训
 * @param {string} content - 内容
 * @returns {Array} 经验教训列表
 */
function extractLessons(content) {
  const lessons = []
  const patterns = [
    /经验[：:]\s*([^\n]+)/gi,
    /教训[：:]\s*([^\n]+)/gi,
    /启示[：:]\s*([^\n]+)/gi
  ]

  patterns.forEach(pattern => {
    const matches = content.match(pattern)
    if (matches) {
      matches.forEach(match => {
        const lessonText = match.split(/[：:]/)[1]
        if (lessonText) {
          lessons.push(lessonText.trim())
        }
      })
    }
  })

  return lessons
}

/**
 * 提取分享信息
 * @param {string} content - 内容
 * @returns {string} 分享信息
 */
function extractSharing(content) {
  const patterns = [
    /分享[：:]\s*([^\n]+)/i,
    /推广[：:]\s*([^\n]+)/i
  ]

  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  return ''
}

/**
 * 提取关键数据
 * @param {Object} structure - 解析结构
 * @returns {Object} 关键数据
 */
function extractKeyData(structure) {
  const keyData = {
    teamSize: 0,
    problemSeverity: 'unknown',
    timeToResolution: 'unknown',
    preventiveMeasures: 0,
    completeness: 0
  }

  // 计算团队规模
  if (structure.D1 && structure.D1.extractedFields.teamMembers) {
    keyData.teamSize = structure.D1.extractedFields.teamMembers.length
  }

  // 评估问题严重性
  if (structure.D2 && structure.D2.content) {
    const severityKeywords = {
      high: ['严重', '紧急', '重大', '关键'],
      medium: ['一般', '中等', '普通'],
      low: ['轻微', '小', '次要']
    }

    const content = structure.D2.content.toLowerCase()
    for (const [level, keywords] of Object.entries(severityKeywords)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        keyData.problemSeverity = level
        break
      }
    }
  }

  // 计算预防措施数量
  if (structure.D7 && structure.D7.extractedFields.preventiveActions) {
    keyData.preventiveMeasures = structure.D7.extractedFields.preventiveActions.length
  }

  // 计算完整性
  const completedSteps = Object.values(structure).filter(step => step.hasContent).length
  keyData.completeness = (completedSteps / 8) * 100

  return keyData
}

/**
 * 识别问题
 * @param {Object} structure - 解析结构
 * @param {Object} summary - 摘要信息
 * @returns {Array} 问题列表
 */
function identifyIssues(structure, summary) {
  const issues = []

  // 检查完整性
  if (summary.completeness < 50) {
    issues.push({
      type: 'completeness',
      severity: 'high',
      message: '8D报告完整性不足，缺少关键步骤',
      missingSteps: summary.missingSteps
    })
  }

  // 检查关键步骤
  const criticalSteps = ['D2', 'D4', 'D5']
  criticalSteps.forEach(step => {
    if (!structure[step] || !structure[step].hasContent) {
      issues.push({
        type: 'missing_critical_step',
        severity: 'high',
        message: `缺少关键步骤${step}: ${D8_STRUCTURE[step].title}`,
        step
      })
    }
  })

  // 检查内容质量
  Object.entries(structure).forEach(([step, data]) => {
    if (data.hasContent && data.confidence < 30) {
      issues.push({
        type: 'low_confidence',
        severity: 'medium',
        message: `步骤${step}内容质量较低，建议补充完善`,
        step,
        confidence: data.confidence
      })
    }
  })

  return issues
}

/**
 * 生成建议
 * @param {Array} issues - 问题列表
 * @param {Object} summary - 摘要信息
 * @returns {Array} 建议列表
 */
function generateRecommendations(issues, summary) {
  const recommendations = []

  // 基于问题生成建议
  issues.forEach(issue => {
    switch (issue.type) {
      case 'completeness':
        recommendations.push({
          type: 'improvement',
          priority: 'high',
          title: '完善8D报告结构',
          description: '建议补充缺失的步骤内容，确保8D方法论的完整性',
          actions: issue.missingSteps.map(step => `补充${step}: ${D8_STRUCTURE[step].title}`)
        })
        break
      case 'missing_critical_step':
        recommendations.push({
          type: 'critical',
          priority: 'high',
          title: `补充关键步骤${issue.step}`,
          description: `${issue.step}是8D方法论的关键步骤，必须完善`,
          actions: [`详细填写${issue.step}的内容`]
        })
        break
      case 'low_confidence':
        recommendations.push({
          type: 'quality',
          priority: 'medium',
          title: `提升${issue.step}内容质量`,
          description: '当前内容过于简单，建议增加更多细节和数据支撑',
          actions: [`增加${issue.step}的详细描述`, '提供相关数据和证据']
        })
        break
    }
  })

  // 通用建议
  if (summary.completeness >= 80) {
    recommendations.push({
      type: 'optimization',
      priority: 'low',
      title: '优化报告格式',
      description: '报告内容较为完整，建议优化格式和可读性',
      actions: ['统一格式标准', '添加图表和数据可视化', '完善文档结构']
    })
  }

  return recommendations
}

export {
  parseD8Report,
  D8_STRUCTURE
}
