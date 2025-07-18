/**
 * 常规案例解析器
 * 用于解析标准格式的案例文件，提取关键信息
 */

/**
 * 常规案例标准结构定义
 */
const REGULAR_CASE_STRUCTURE = {
  metadata: {
    title: '案例基本信息',
    fields: ['caseTitle', 'caseId', 'date', 'author', 'department', 'category']
  },
  problem: {
    title: '问题描述',
    fields: ['problemDescription', 'symptoms', 'occurrence', 'impact', 'urgency']
  },
  background: {
    title: '背景信息',
    fields: ['context', 'environment', 'conditions', 'stakeholders']
  },
  analysis: {
    title: '分析过程',
    fields: ['analysisMethod', 'dataCollection', 'findings', 'rootCause']
  },
  solution: {
    title: '解决方案',
    fields: ['proposedSolution', 'implementation', 'resources', 'timeline']
  },
  results: {
    title: '结果评估',
    fields: ['outcomes', 'effectiveness', 'metrics', 'feedback']
  },
  lessons: {
    title: '经验总结',
    fields: ['lessonsLearned', 'bestPractices', 'recommendations', 'futureActions']
  }
}

/**
 * 常规案例关键词库
 */
const CASE_KEYWORDS = {
  metadata: ['案例', '标题', '编号', '日期', '作者', '部门', '分类'],
  problem: ['问题', '故障', '异常', '现象', '症状', '发生', '影响', '紧急'],
  background: ['背景', '环境', '条件', '相关方', '上下文'],
  analysis: ['分析', '调查', '数据', '发现', '原因', '方法'],
  solution: ['解决', '方案', '措施', '实施', '资源', '计划', '时间'],
  results: ['结果', '效果', '评估', '指标', '反馈', '成果'],
  lessons: ['经验', '教训', '总结', '建议', '最佳实践', '改进']
}

/**
 * 解析常规案例
 * @param {string} content - 案例内容
 * @param {Object} options - 解析选项
 * @returns {Object} 解析结果
 */
export function parseRegularCase(content, options = {}) {
  try {
    const result = {
      caseType: '常规案例',
      parseTime: new Date().toISOString(),
      structure: {},
      summary: {
        completeness: 0,
        totalSections: Object.keys(REGULAR_CASE_STRUCTURE).length,
        completedSections: 0,
        missingSections: []
      },
      extractedData: {},
      issues: [],
      recommendations: []
    }

    // 预处理内容
    const processedContent = preprocessContent(content)

    // 解析各个部分
    Object.keys(REGULAR_CASE_STRUCTURE).forEach(section => {
      const sectionResult = parseCaseSection(processedContent, section, REGULAR_CASE_STRUCTURE[section])
      result.structure[section] = sectionResult
      
      if (sectionResult.hasContent) {
        result.summary.completedSections++
      } else {
        result.summary.missingSections.push(section)
      }
    })

    // 计算完整性
    result.summary.completeness = (result.summary.completedSections / result.summary.totalSections) * 100

    // 提取关键数据
    result.extractedData = extractCaseKeyData(result.structure)

    // 生成问题和建议
    result.issues = identifyCaseIssues(result.structure, result.summary)
    result.recommendations = generateCaseRecommendations(result.issues, result.summary)

    return result
  } catch (error) {
    console.error('常规案例解析失败:', error)
    return {
      caseType: '常规案例',
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

  // 标准化常见标题格式
  processed = processed
    .replace(/一[、\.]\s*/g, '1. ')
    .replace(/二[、\.]\s*/g, '2. ')
    .replace(/三[、\.]\s*/g, '3. ')
    .replace(/四[、\.]\s*/g, '4. ')
    .replace(/五[、\.]\s*/g, '5. ')
    .replace(/六[、\.]\s*/g, '6. ')
    .replace(/七[、\.]\s*/g, '7. ')

  return processed
}

/**
 * 解析案例部分
 * @param {string} content - 内容
 * @param {string} section - 部分标识
 * @param {Object} sectionDef - 部分定义
 * @returns {Object} 部分解析结果
 */
function parseCaseSection(content, section, sectionDef) {
  const result = {
    section,
    title: sectionDef.title,
    hasContent: false,
    content: '',
    extractedFields: {},
    confidence: 0,
    issues: []
  }

  try {
    // 查找部分内容
    const sectionContent = extractSectionContent(content, section)
    
    if (sectionContent) {
      result.hasContent = true
      result.content = sectionContent
      result.confidence = calculateSectionConfidence(sectionContent, CASE_KEYWORDS[section])
      
      // 提取结构化字段
      result.extractedFields = extractSectionFields(sectionContent, sectionDef.fields, section)
      
      // 识别问题
      result.issues = identifySectionIssues(sectionContent, sectionDef, section)
    }

    return result
  } catch (error) {
    console.error(`解析部分${section}失败:`, error)
    result.issues.push({
      type: 'parse_error',
      message: `解析部分${section}时发生错误: ${error.message}`
    })
    return result
  }
}

/**
 * 提取部分内容
 * @param {string} content - 完整内容
 * @param {string} section - 部分标识
 * @returns {string|null} 部分内容
 */
function extractSectionContent(content, section) {
  const sectionDef = REGULAR_CASE_STRUCTURE[section]
  const keywords = CASE_KEYWORDS[section]

  // 尝试通过标题匹配
  const titlePatterns = [
    new RegExp(`${sectionDef.title}[\\s\\S]*?([\\s\\S]*?)(?=\\n\\s*[一二三四五六七]|\\n\\s*\\d+\\.|$)`, 'i'),
    new RegExp(`${sectionDef.title}[：:]([\\s\\S]*?)(?=\\n|$)`, 'i')
  ]

  for (const pattern of titlePatterns) {
    const match = content.match(pattern)
    if (match && match[1] && match[1].trim().length > 10) {
      return match[1].trim()
    }
  }

  // 通过关键词匹配
  for (const keyword of keywords) {
    const keywordPatterns = [
      new RegExp(`${keyword}[\\s\\S]*?([\\s\\S]{50,500})`, 'i'),
      new RegExp(`.*${keyword}.*\\n([\\s\\S]{20,300})`, 'i')
    ]

    for (const pattern of keywordPatterns) {
      const match = content.match(pattern)
      if (match && match[1] && match[1].trim().length > 20) {
        return match[1].trim()
      }
    }
  }

  return null
}

/**
 * 计算部分置信度
 * @param {string} content - 内容
 * @param {Array} keywords - 关键词列表
 * @returns {number} 置信度 (0-100)
 */
function calculateSectionConfidence(content, keywords) {
  let score = 0
  const contentLower = content.toLowerCase()

  keywords.forEach(keyword => {
    if (contentLower.includes(keyword.toLowerCase())) {
      score += 15
    }
  })

  // 内容长度加分
  if (content.length > 30) score += 10
  if (content.length > 100) score += 10
  if (content.length > 300) score += 15

  // 结构化内容加分
  if (content.includes('：') || content.includes(':')) score += 10
  if (content.match(/\d+\./)) score += 5
  if (content.includes('\n')) score += 5

  return Math.min(100, score)
}

/**
 * 提取部分字段
 * @param {string} content - 部分内容
 * @param {Array} fields - 字段列表
 * @param {string} section - 部分标识
 * @returns {Object} 提取的字段
 */
function extractSectionFields(content, fields, section) {
  const extracted = {}

  // 根据不同部分使用不同的提取策略
  switch (section) {
    case 'metadata':
      extracted.caseTitle = extractCaseTitle(content)
      extracted.caseId = extractCaseId(content)
      extracted.date = extractDate(content)
      extracted.author = extractAuthor(content)
      extracted.department = extractDepartment(content)
      extracted.category = extractCategory(content)
      break
    case 'problem':
      extracted.problemDescription = extractProblemDescription(content)
      extracted.symptoms = extractSymptoms(content)
      extracted.impact = extractImpact(content)
      extracted.urgency = extractUrgency(content)
      break
    case 'analysis':
      extracted.analysisMethod = extractAnalysisMethod(content)
      extracted.findings = extractFindings(content)
      extracted.rootCause = extractRootCause(content)
      break
    case 'solution':
      extracted.proposedSolution = extractSolution(content)
      extracted.implementation = extractImplementation(content)
      extracted.timeline = extractTimeline(content)
      break
    case 'results':
      extracted.outcomes = extractOutcomes(content)
      extracted.effectiveness = extractEffectiveness(content)
      extracted.metrics = extractMetrics(content)
      break
    case 'lessons':
      extracted.lessonsLearned = extractLessons(content)
      extracted.recommendations = extractRecommendations(content)
      break
  }

  return extracted
}

/**
 * 提取案例标题
 * @param {string} content - 内容
 * @returns {string} 案例标题
 */
function extractCaseTitle(content) {
  const patterns = [
    /标题[：:]\s*([^\n]+)/i,
    /案例[：:]\s*([^\n]+)/i,
    /题目[：:]\s*([^\n]+)/i
  ]

  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  // 如果没有明确标识，取第一行作为标题
  const firstLine = content.split('\n')[0]
  if (firstLine && firstLine.length < 100) {
    return firstLine.trim()
  }

  return ''
}

/**
 * 提取案例编号
 * @param {string} content - 内容
 * @returns {string} 案例编号
 */
function extractCaseId(content) {
  const patterns = [
    /编号[：:]\s*([^\n\s]+)/i,
    /ID[：:]\s*([^\n\s]+)/i,
    /案例号[：:]\s*([^\n\s]+)/i,
    /[A-Z]{2,}\d{3,}/g
  ]

  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match) {
      return Array.isArray(match) ? match[0] : match[1].trim()
    }
  }

  return ''
}

/**
 * 提取日期
 * @param {string} content - 内容
 * @returns {string} 日期
 */
function extractDate(content) {
  const patterns = [
    /日期[：:]\s*([^\n]+)/i,
    /时间[：:]\s*([^\n]+)/i,
    /\d{4}[-/年]\d{1,2}[-/月]\d{1,2}[日]?/g,
    /\d{4}\.\d{1,2}\.\d{1,2}/g
  ]

  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match) {
      return Array.isArray(match) ? match[0] : match[1].trim()
    }
  }

  return ''
}

/**
 * 提取作者
 * @param {string} content - 内容
 * @returns {string} 作者
 */
function extractAuthor(content) {
  const patterns = [
    /作者[：:]\s*([^\n,，]+)/i,
    /撰写[：:]\s*([^\n,，]+)/i,
    /负责人[：:]\s*([^\n,，]+)/i
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
 * 提取部门
 * @param {string} content - 内容
 * @returns {string} 部门
 */
function extractDepartment(content) {
  const patterns = [
    /部门[：:]\s*([^\n]+)/i,
    /科室[：:]\s*([^\n]+)/i,
    /单位[：:]\s*([^\n]+)/i
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
 * 提取分类
 * @param {string} content - 内容
 * @returns {string} 分类
 */
function extractCategory(content) {
  const patterns = [
    /分类[：:]\s*([^\n]+)/i,
    /类型[：:]\s*([^\n]+)/i,
    /类别[：:]\s*([^\n]+)/i
  ]

  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  // 尝试从内容中推断分类
  const categories = ['质量', '安全', '生产', '设备', '工艺', '管理', '技术']
  for (const category of categories) {
    if (content.includes(category)) {
      return category
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
    /故障[：:]\s*([^\n]+)/i
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
 * 提取症状
 * @param {string} content - 内容
 * @returns {Array} 症状列表
 */
function extractSymptoms(content) {
  const symptoms = []
  const patterns = [
    /症状[：:]\s*([^\n]+)/gi,
    /现象[：:]\s*([^\n]+)/gi,
    /表现[：:]\s*([^\n]+)/gi
  ]

  patterns.forEach(pattern => {
    const matches = content.match(pattern)
    if (matches) {
      matches.forEach(match => {
        const symptomText = match.split(/[：:]/)[1]
        if (symptomText) {
          symptoms.push(symptomText.trim())
        }
      })
    }
  })

  return symptoms
}

/**
 * 提取影响
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
 * 提取紧急程度
 * @param {string} content - 内容
 * @returns {string} 紧急程度
 */
function extractUrgency(content) {
  const urgencyLevels = ['紧急', '重要', '一般', '低']

  for (const level of urgencyLevels) {
    if (content.includes(level)) {
      return level
    }
  }

  return '一般'
}

/**
 * 提取分析方法
 * @param {string} content - 内容
 * @returns {string} 分析方法
 */
function extractAnalysisMethod(content) {
  const methods = ['鱼骨图', '5Why', '故障树', 'FMEA', '因果图', '头脑风暴', '数据分析']

  for (const method of methods) {
    if (content.includes(method)) {
      return method
    }
  }

  return ''
}

/**
 * 提取发现
 * @param {string} content - 内容
 * @returns {Array} 发现列表
 */
function extractFindings(content) {
  const findings = []
  const patterns = [
    /发现[：:]\s*([^\n]+)/gi,
    /结果[：:]\s*([^\n]+)/gi,
    /结论[：:]\s*([^\n]+)/gi
  ]

  patterns.forEach(pattern => {
    const matches = content.match(pattern)
    if (matches) {
      matches.forEach(match => {
        const findingText = match.split(/[：:]/)[1]
        if (findingText) {
          findings.push(findingText.trim())
        }
      })
    }
  })

  return findings
}

/**
 * 提取根本原因
 * @param {string} content - 内容
 * @returns {string} 根本原因
 */
function extractRootCause(content) {
  const patterns = [
    /根本原因[：:]\s*([^\n]+)/i,
    /主要原因[：:]\s*([^\n]+)/i,
    /原因[：:]\s*([^\n]+)/i
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
 * 提取解决方案
 * @param {string} content - 内容
 * @returns {string} 解决方案
 */
function extractSolution(content) {
  const patterns = [
    /解决方案[：:]\s*([^\n]+)/i,
    /解决措施[：:]\s*([^\n]+)/i,
    /方案[：:]\s*([^\n]+)/i
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
 * 提取实施信息
 * @param {string} content - 内容
 * @returns {Object} 实施信息
 */
function extractImplementation(content) {
  return {
    steps: extractImplementationSteps(content),
    responsible: extractResponsible(content),
    resources: extractResources(content)
  }
}

/**
 * 提取实施步骤
 * @param {string} content - 内容
 * @returns {Array} 实施步骤
 */
function extractImplementationSteps(content) {
  const steps = []
  const patterns = [
    /步骤[：:]\s*([^\n]+)/gi,
    /\d+\.\s*([^\n]+)/g
  ]

  patterns.forEach(pattern => {
    const matches = content.match(pattern)
    if (matches) {
      matches.forEach(match => {
        const stepText = match.replace(/^(\d+\.|步骤[：:])/, '').trim()
        if (stepText) {
          steps.push(stepText)
        }
      })
    }
  })

  return steps
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
 * 提取资源
 * @param {string} content - 内容
 * @returns {Array} 资源列表
 */
function extractResources(content) {
  const resources = []
  const patterns = [
    /资源[：:]\s*([^\n]+)/gi,
    /需要[：:]\s*([^\n]+)/gi
  ]

  patterns.forEach(pattern => {
    const matches = content.match(pattern)
    if (matches) {
      matches.forEach(match => {
        const resourceText = match.split(/[：:]/)[1]
        if (resourceText) {
          resources.push(resourceText.trim())
        }
      })
    }
  })

  return resources
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
 * 提取结果
 * @param {string} content - 内容
 * @returns {Array} 结果列表
 */
function extractOutcomes(content) {
  const outcomes = []
  const patterns = [
    /结果[：:]\s*([^\n]+)/gi,
    /成果[：:]\s*([^\n]+)/gi,
    /效果[：:]\s*([^\n]+)/gi
  ]

  patterns.forEach(pattern => {
    const matches = content.match(pattern)
    if (matches) {
      matches.forEach(match => {
        const outcomeText = match.split(/[：:]/)[1]
        if (outcomeText) {
          outcomes.push(outcomeText.trim())
        }
      })
    }
  })

  return outcomes
}

/**
 * 提取有效性
 * @param {string} content - 内容
 * @returns {string} 有效性评估
 */
function extractEffectiveness(content) {
  const patterns = [
    /有效性[：:]\s*([^\n]+)/i,
    /效果[：:]\s*([^\n]+)/i,
    /评估[：:]\s*([^\n]+)/i
  ]

  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  // 尝试从内容中推断有效性
  const effectiveness = ['很好', '良好', '一般', '较差']
  for (const level of effectiveness) {
    if (content.includes(level)) {
      return level
    }
  }

  return ''
}

/**
 * 提取指标
 * @param {string} content - 内容
 * @returns {Array} 指标列表
 */
function extractMetrics(content) {
  const metrics = []
  const patterns = [
    /指标[：:]\s*([^\n]+)/gi,
    /数据[：:]\s*([^\n]+)/gi,
    /\d+%/g,
    /\d+\.\d+/g
  ]

  patterns.forEach(pattern => {
    const matches = content.match(pattern)
    if (matches) {
      matches.forEach(match => {
        if (pattern.source.includes('[：:]')) {
          const metricText = match.split(/[：:]/)[1]
          if (metricText) {
            metrics.push(metricText.trim())
          }
        } else {
          metrics.push(match)
        }
      })
    }
  })

  return [...new Set(metrics)] // 去重
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
 * 提取建议
 * @param {string} content - 内容
 * @returns {Array} 建议列表
 */
function extractRecommendations(content) {
  const recommendations = []
  const patterns = [
    /建议[：:]\s*([^\n]+)/gi,
    /推荐[：:]\s*([^\n]+)/gi,
    /改进[：:]\s*([^\n]+)/gi
  ]

  patterns.forEach(pattern => {
    const matches = content.match(pattern)
    if (matches) {
      matches.forEach(match => {
        const recommendationText = match.split(/[：:]/)[1]
        if (recommendationText) {
          recommendations.push(recommendationText.trim())
        }
      })
    }
  })

  return recommendations
}

/**
 * 识别部分问题
 * @param {string} content - 内容
 * @param {Object} sectionDef - 部分定义
 * @param {string} section - 部分标识
 * @returns {Array} 问题列表
 */
function identifySectionIssues(content, sectionDef, section) {
  const issues = []

  // 检查内容长度
  if (content.length < 20) {
    issues.push({
      type: 'content_too_short',
      severity: 'medium',
      message: `${sectionDef.title}内容过于简短，建议补充详细信息`
    })
  }

  // 检查关键词覆盖
  const keywords = CASE_KEYWORDS[section]
  const keywordCount = keywords.filter(keyword =>
    content.toLowerCase().includes(keyword.toLowerCase())
  ).length

  if (keywordCount < keywords.length * 0.3) {
    issues.push({
      type: 'missing_keywords',
      severity: 'low',
      message: `${sectionDef.title}缺少关键信息，建议补充相关内容`
    })
  }

  return issues
}

/**
 * 提取案例关键数据
 * @param {Object} structure - 解析结构
 * @returns {Object} 关键数据
 */
function extractCaseKeyData(structure) {
  const keyData = {
    caseTitle: '',
    problemSeverity: 'unknown',
    solutionType: 'unknown',
    timeToResolution: 'unknown',
    effectiveness: 'unknown',
    completeness: 0
  }

  // 提取案例标题
  if (structure.metadata && structure.metadata.extractedFields.caseTitle) {
    keyData.caseTitle = structure.metadata.extractedFields.caseTitle
  }

  // 评估问题严重性
  if (structure.problem && structure.problem.extractedFields.urgency) {
    keyData.problemSeverity = structure.problem.extractedFields.urgency
  }

  // 确定解决方案类型
  if (structure.solution && structure.solution.content) {
    const solutionContent = structure.solution.content.toLowerCase()
    if (solutionContent.includes('技术')) {
      keyData.solutionType = '技术方案'
    } else if (solutionContent.includes('管理')) {
      keyData.solutionType = '管理方案'
    } else if (solutionContent.includes('流程')) {
      keyData.solutionType = '流程改进'
    } else {
      keyData.solutionType = '综合方案'
    }
  }

  // 提取解决时间
  if (structure.solution && structure.solution.extractedFields.timeline) {
    keyData.timeToResolution = structure.solution.extractedFields.timeline
  }

  // 评估有效性
  if (structure.results && structure.results.extractedFields.effectiveness) {
    keyData.effectiveness = structure.results.extractedFields.effectiveness
  }

  // 计算完整性
  const completedSections = Object.values(structure).filter(section => section.hasContent).length
  keyData.completeness = (completedSections / Object.keys(structure).length) * 100

  return keyData
}

/**
 * 识别案例问题
 * @param {Object} structure - 解析结构
 * @param {Object} summary - 摘要信息
 * @returns {Array} 问题列表
 */
function identifyCaseIssues(structure, summary) {
  const issues = []

  // 检查完整性
  if (summary.completeness < 60) {
    issues.push({
      type: 'completeness',
      severity: 'high',
      message: '案例完整性不足，缺少重要部分',
      missingSections: summary.missingSections
    })
  }

  // 检查关键部分
  const criticalSections = ['problem', 'analysis', 'solution']
  criticalSections.forEach(section => {
    if (!structure[section] || !structure[section].hasContent) {
      issues.push({
        type: 'missing_critical_section',
        severity: 'high',
        message: `缺少关键部分: ${REGULAR_CASE_STRUCTURE[section].title}`,
        section
      })
    }
  })

  // 检查内容质量
  Object.entries(structure).forEach(([section, data]) => {
    if (data.hasContent && data.confidence < 40) {
      issues.push({
        type: 'low_confidence',
        severity: 'medium',
        message: `${data.title}内容质量较低，建议补充完善`,
        section,
        confidence: data.confidence
      })
    }
  })

  return issues
}

/**
 * 生成案例建议
 * @param {Array} issues - 问题列表
 * @param {Object} summary - 摘要信息
 * @returns {Array} 建议列表
 */
function generateCaseRecommendations(issues, summary) {
  const recommendations = []

  // 基于问题生成建议
  issues.forEach(issue => {
    switch (issue.type) {
      case 'completeness':
        recommendations.push({
          type: 'improvement',
          priority: 'high',
          title: '完善案例结构',
          description: '建议补充缺失的部分内容，确保案例的完整性',
          actions: issue.missingSections.map(section =>
            `补充${REGULAR_CASE_STRUCTURE[section].title}`)
        })
        break
      case 'missing_critical_section':
        recommendations.push({
          type: 'critical',
          priority: 'high',
          title: `补充关键部分: ${REGULAR_CASE_STRUCTURE[issue.section].title}`,
          description: `${REGULAR_CASE_STRUCTURE[issue.section].title}是案例的关键部分，必须完善`,
          actions: [`详细填写${REGULAR_CASE_STRUCTURE[issue.section].title}的内容`]
        })
        break
      case 'low_confidence':
        recommendations.push({
          type: 'quality',
          priority: 'medium',
          title: `提升${REGULAR_CASE_STRUCTURE[issue.section].title}内容质量`,
          description: '当前内容过于简单，建议增加更多细节和数据支撑',
          actions: [
            `增加${REGULAR_CASE_STRUCTURE[issue.section].title}的详细描述`,
            '提供相关数据和证据'
          ]
        })
        break
    }
  })

  // 通用建议
  if (summary.completeness >= 80) {
    recommendations.push({
      type: 'optimization',
      priority: 'low',
      title: '优化案例格式',
      description: '案例内容较为完整，建议优化格式和可读性',
      actions: ['统一格式标准', '添加图表和数据可视化', '完善文档结构']
    })
  }

  return recommendations
}

export {
  parseRegularCase,
  REGULAR_CASE_STRUCTURE,
  CASE_KEYWORDS
}
