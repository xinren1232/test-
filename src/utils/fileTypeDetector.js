/**
 * 文件类型识别模块
 * 支持多种识别模式，用于区分不同类型的文档格式
 */

/**
 * 识别模式枚举
 */
const DETECTION_MODES = {
  AUTO: 'auto',           // 自动识别（默认）
  STRICT: 'strict',       // 严格模式（高精度）
  FUZZY: 'fuzzy',         // 模糊模式（高召回）
  MANUAL: 'manual',       // 手动指定
  HYBRID: 'hybrid'        // 混合模式（多算法融合）
}

/**
 * 文档类型定义
 */
const DOCUMENT_TYPES = {
  D8_REPORT: '8D报告',
  REGULAR_CASE: '常规案例',
  QUALITY_REPORT: '质量报告',
  INSPECTION_REPORT: '检验报告',
  ANALYSIS_REPORT: '分析报告',
  MAINTENANCE_LOG: '维护日志',
  TRAINING_MATERIAL: '培训资料',
  PROCEDURE_DOC: '程序文件',
  UNKNOWN: '未知类型'
}

// 8D报告关键词
const D8_KEYWORDS = [
  '8D', '8d', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8',
  '建立团队', '问题描述', '临时措施', '根本原因', '纠正措施',
  '永久措施', '预防', '团队祝贺', '8D报告', '8D分析', '8D方法'
]

// 8D报告结构模式
const D8_STRUCTURE_PATTERNS = [
  /D[1-8][\s\.\:：]/g,
  /第[一二三四五六七八]步/g,
  /步骤[1-8]/g,
  /(建立|组建).*团队/g,
  /问题.*描述/g,
  /(临时|应急).*措施/g,
  /根本.*原因/g,
  /(纠正|改善).*措施/g,
  /永久.*措施/g,
  /预防.*再发/g,
  /团队.*祝贺/g
]

// 扩展的文档类型关键词库
const DOCUMENT_KEYWORDS = {
  [DOCUMENT_TYPES.D8_REPORT]: [
    '8D', '8d', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8',
    '建立团队', '问题描述', '临时措施', '根本原因', '纠正措施',
    '永久措施', '预防', '团队祝贺', '8D报告', '8D分析', '8D方法',
    '跨职能团队', 'PDCA', '鱼骨图', '5Why'
  ],
  [DOCUMENT_TYPES.REGULAR_CASE]: [
    '案例', '问题', '分析', '解决方案', '总结', '经验',
    '故障', '维修', '检修', '改进', '优化', '建议',
    '现象', '原因', '措施', '效果', '启示'
  ],
  [DOCUMENT_TYPES.QUALITY_REPORT]: [
    '质量', '品质', '检测', '检验', '合格率', '不良率',
    '质量控制', 'QC', 'QA', '质量管理', '质量体系',
    '标准', '规范', '要求', '指标'
  ],
  [DOCUMENT_TYPES.INSPECTION_REPORT]: [
    '检验', '检查', '检测', '测试', '试验', '验证',
    '检验报告', '检测报告', '测试报告', '试验报告',
    '合格', '不合格', '符合', '不符合', '标准'
  ],
  [DOCUMENT_TYPES.ANALYSIS_REPORT]: [
    '分析', '统计', '数据', '趋势', '对比', '评估',
    '分析报告', '数据分析', '统计分析', '趋势分析',
    '图表', '表格', '数据', '指标'
  ],
  [DOCUMENT_TYPES.MAINTENANCE_LOG]: [
    '维护', '保养', '维修', '检修', '巡检', '点检',
    '维护记录', '保养记录', '维修记录', '设备',
    '故障', '异常', '正常', '完成'
  ],
  [DOCUMENT_TYPES.TRAINING_MATERIAL]: [
    '培训', '教育', '学习', '课程', '教材', '讲义',
    '培训资料', '教学', '知识', '技能', '能力',
    '考试', '考核', '评价', '证书'
  ],
  [DOCUMENT_TYPES.PROCEDURE_DOC]: [
    '程序', '流程', '步骤', '操作', '规程', '制度',
    '程序文件', '作业指导书', 'SOP', '标准操作',
    '规定', '要求', '方法', '标准'
  ]
}

/**
 * 检测文件类型（支持多种模式）
 * @param {File} file - 文件对象
 * @param {string} content - 文件内容（可选）
 * @param {Object} options - 检测选项
 * @returns {Promise<Object>} 检测结果
 */
export async function detectFileType(file, content = null, options = {}) {
  const {
    mode = DETECTION_MODES.AUTO,
    manualType = null,
    strictThreshold = 80,
    fuzzyThreshold = 30,
    enableMultiType = false
  } = options
  try {
    const result = {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      documentType: DOCUMENT_TYPES.UNKNOWN,
      confidence: 0,
      detectionMode: mode,
      possibleTypes: [],
      structure: null,
      analysis: {
        keywordMatches: {},
        patternMatches: {},
        structureScore: 0,
        contentLength: 0
      },
      recommendations: []
    }

    // 手动模式直接返回指定类型
    if (mode === DETECTION_MODES.MANUAL && manualType) {
      result.documentType = manualType
      result.confidence = 100
      result.detectionMode = DETECTION_MODES.MANUAL
      return result
    }

    // 如果没有提供内容，尝试读取文件内容
    if (!content) {
      content = await extractTextContent(file)
    }

    if (!content) {
      throw new Error('无法提取文件内容')
    }

    // 根据不同模式进行检测
    switch (mode) {
      case DETECTION_MODES.STRICT:
        return await strictModeDetection(file, content, result, strictThreshold)
      case DETECTION_MODES.FUZZY:
        return await fuzzyModeDetection(file, content, result, fuzzyThreshold)
      case DETECTION_MODES.HYBRID:
        return await hybridModeDetection(file, content, result, options)
      default:
        return await autoModeDetection(file, content, result, enableMultiType)
    }
  } catch (error) {
    console.error('文件类型检测失败:', error)
    return {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      documentType: 'error',
      confidence: 0,
      error: error.message
    }
  }
}

/**
 * 提取文件文本内容
 * @param {File} file - 文件对象
 * @returns {Promise<string>} 文本内容
 */
async function extractTextContent(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        let content = ''
        
        if (file.type === 'text/plain') {
          content = e.target.result
        } else if (file.type.includes('pdf')) {
          // PDF需要专门的解析库，这里模拟
          content = '模拟PDF内容提取...'
        } else if (file.type.includes('word') || file.type.includes('document')) {
          // Word文档需要专门的解析库，这里模拟
          content = '模拟Word内容提取...'
        } else {
          // 其他格式尝试作为文本读取
          content = e.target.result
        }
        
        resolve(content)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('文件读取失败'))
    
    if (file.type === 'text/plain' || file.type.includes('text')) {
      reader.readAsText(file, 'UTF-8')
    } else {
      reader.readAsArrayBuffer(file)
    }
  })
}

/**
 * 分析文档内容
 * @param {string} content - 文档内容
 * @returns {Object} 分析结果
 */
function analyzeContent(content) {
  const analysis = {
    d8Keywords: 0,
    d8Patterns: 0,
    regularKeywords: 0,
    hasStructure: false,
    contentLength: content.length
  }

  // 统计8D关键词
  D8_KEYWORDS.forEach(keyword => {
    const regex = new RegExp(keyword, 'gi')
    const matches = content.match(regex)
    if (matches) {
      analysis.d8Keywords += matches.length
    }
  })

  // 检测8D结构模式
  D8_STRUCTURE_PATTERNS.forEach(pattern => {
    const matches = content.match(pattern)
    if (matches) {
      analysis.d8Patterns += matches.length
    }
  })

  // 统计常规案例关键词
  REGULAR_CASE_KEYWORDS.forEach(keyword => {
    const regex = new RegExp(keyword, 'gi')
    const matches = content.match(regex)
    if (matches) {
      analysis.regularKeywords += matches.length
    }
  })

  // 检测是否有明确的结构
  analysis.hasStructure = analysis.d8Patterns > 3 || 
                         content.includes('D1') && content.includes('D2') && content.includes('D3')

  return analysis
}

/**
 * 确定文档类型
 * @param {Object} analysis - 内容分析结果
 * @param {string} fileName - 文件名
 * @returns {Object} 类型判断结果
 */
function determineDocumentType(analysis, fileName) {
  let d8Score = 0
  let regularScore = 0

  // 文件名评分
  if (fileName.toLowerCase().includes('8d')) {
    d8Score += 30
  }
  if (fileName.toLowerCase().includes('报告')) {
    d8Score += 10
  }
  if (fileName.toLowerCase().includes('案例')) {
    regularScore += 20
  }

  // 关键词评分
  d8Score += analysis.d8Keywords * 5
  d8Score += analysis.d8Patterns * 10
  regularScore += analysis.regularKeywords * 3

  // 结构评分
  if (analysis.hasStructure) {
    d8Score += 25
  }

  // 确定类型
  const totalScore = d8Score + regularScore
  let documentType = 'unknown'
  let confidence = 0

  if (d8Score > regularScore && d8Score > 20) {
    documentType = '8D报告'
    confidence = Math.min(95, (d8Score / totalScore) * 100)
  } else if (regularScore > d8Score && regularScore > 10) {
    documentType = '常规案例'
    confidence = Math.min(95, (regularScore / totalScore) * 100)
  } else if (totalScore > 0) {
    documentType = d8Score > regularScore ? '8D报告' : '常规案例'
    confidence = Math.max(50, (Math.max(d8Score, regularScore) / totalScore) * 100)
  }

  return {
    type: documentType,
    confidence: Math.round(confidence),
    scores: { d8Score, regularScore }
  }
}

/**
 * 提取8D报告结构
 * @param {string} content - 文档内容
 * @returns {Array} 8D结构信息
 */
function extract8DStructure(content) {
  const structure = [
    { step: 'D1', title: '建立团队', hasContent: false, preview: '' },
    { step: 'D2', title: '问题描述', hasContent: false, preview: '' },
    { step: 'D3', title: '实施临时措施', hasContent: false, preview: '' },
    { step: 'D4', title: '根本原因分析', hasContent: false, preview: '' },
    { step: 'D5', title: '选择永久纠正措施', hasContent: false, preview: '' },
    { step: 'D6', title: '实施永久纠正措施', hasContent: false, preview: '' },
    { step: 'D7', title: '预防再发生', hasContent: false, preview: '' },
    { step: 'D8', title: '团队祝贺', hasContent: false, preview: '' }
  ]

  // 尝试提取每个步骤的内容
  structure.forEach(step => {
    const patterns = [
      new RegExp(`${step.step}[\\s\\.\\:：]([\\s\\S]*?)(?=D[1-8]|$)`, 'i'),
      new RegExp(`${step.title}[\\s\\S]*?([\\s\\S]{0,100})`, 'i')
    ]

    for (const pattern of patterns) {
      const match = content.match(pattern)
      if (match && match[1]) {
        step.hasContent = true
        step.preview = match[1].trim().substring(0, 50) + '...'
        break
      }
    }
  })

  return structure
}

/**
 * 获取支持的文件类型
 * @returns {Array} 支持的文件类型列表
 */
export function getSupportedFileTypes() {
  return [
    {
      extension: '.pdf',
      mimeType: 'application/pdf',
      description: 'PDF文档'
    },
    {
      extension: '.doc',
      mimeType: 'application/msword',
      description: 'Word文档 (旧版)'
    },
    {
      extension: '.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      description: 'Word文档'
    },
    {
      extension: '.txt',
      mimeType: 'text/plain',
      description: '纯文本文件'
    },
    {
      extension: '.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      description: 'Excel工作簿'
    },
    {
      extension: '.xls',
      mimeType: 'application/vnd.ms-excel',
      description: 'Excel工作簿 (旧版)'
    }
  ]
}

/**
 * 验证文件类型
 * @param {File} file - 文件对象
 * @returns {Object} 验证结果
 */
export function validateFileType(file) {
  const supportedTypes = getSupportedFileTypes()
  const isSupported = supportedTypes.some(type => 
    file.type === type.mimeType || file.name.toLowerCase().endsWith(type.extension)
  )

  return {
    isValid: isSupported,
    fileType: file.type,
    fileName: file.name,
    fileSize: file.size,
    message: isSupported ? '文件类型支持' : '不支持的文件类型'
  }
}
