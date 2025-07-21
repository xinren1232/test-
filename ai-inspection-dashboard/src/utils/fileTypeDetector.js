/**
 * 文件类型检测器
 * 智能识别文件类型和内容结构，支持多种文档格式
 */

import { DATA_SOURCE_TYPES } from './dataSourceConfig.js'

/**
 * 文件类型检测规则
 */
const DETECTION_RULES = {
  [DATA_SOURCE_TYPES.D8_REPORT]: {
    keywords: [
      'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8',
      '团队', '问题描述', '临时对策', '根本原因', '永久对策',
      '预防措施', '8D', '问题解决', '质量改进'
    ],
    patterns: [
      /D[1-8][:：\s]/g,
      /步骤[1-8]/g,
      /阶段[一二三四五六七八]/g,
      /8D.*报告/g,
      /问题.*解决.*流程/g
    ],
    structure: {
      minSections: 6,
      requiredSections: ['团队', '问题', '原因', '对策']
    },
    confidence: {
      keywordWeight: 0.4,
      patternWeight: 0.3,
      structureWeight: 0.3
    }
  },

  [DATA_SOURCE_TYPES.REGULAR_CASE]: {
    keywords: [
      '案例', '问题', '分析', '解决方案', '经验', '总结',
      '背景', '过程', '结果', '改进', '建议', '措施'
    ],
    patterns: [
      /案例.*分析/g,
      /问题.*描述/g,
      /解决.*方案/g,
      /改进.*措施/g,
      /经验.*总结/g
    ],
    structure: {
      minSections: 3,
      requiredSections: ['问题', '分析', '解决']
    },
    confidence: {
      keywordWeight: 0.3,
      patternWeight: 0.4,
      structureWeight: 0.3
    }
  },

  [DATA_SOURCE_TYPES.DATA_TABLE]: {
    keywords: [
      '数据', '统计', '记录', '表格', '清单', '汇总',
      '序号', '编号', '名称', '数量', '日期', '状态'
    ],
    patterns: [
      /\d+\s*[,，]\s*\d+/g,  // 数字序列
      /\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/g,  // 日期格式
      /[A-Z]{2,3}-[A-Z0-9]{4,6}/g,  // 编码格式
      /\d+\.\d+/g  // 小数
    ],
    structure: {
      minSections: 1,
      requiredSections: ['数据']
    },
    confidence: {
      keywordWeight: 0.2,
      patternWeight: 0.6,
      structureWeight: 0.2
    }
  },

  [DATA_SOURCE_TYPES.IMAGE_DOCUMENT]: {
    keywords: [
      '图片', '图像', '照片', '截图', '扫描', '图表',
      '流程图', '示意图', '结构图', '位置图'
    ],
    patterns: [
      /图\s*[1-9]/g,
      /图片\s*[1-9]/g,
      /附图/g,
      /见图/g,
      /如图所示/g
    ],
    structure: {
      minSections: 1,
      requiredSections: ['图像']
    },
    confidence: {
      keywordWeight: 0.3,
      patternWeight: 0.4,
      structureWeight: 0.3
    }
  },

  [DATA_SOURCE_TYPES.ONLINE_DATA]: {
    keywords: [
      'API', 'JSON', 'XML', '接口', '数据源', '实时',
      '同步', '在线', '系统', '数据库', '查询'
    ],
    patterns: [
      /\{.*\}/g,  // JSON格式
      /<.*>/g,    // XML格式
      /http[s]?:\/\//g,  // URL
      /api\//g,   // API路径
      /"[^"]*":\s*"[^"]*"/g  // JSON键值对
    ],
    structure: {
      minSections: 1,
      requiredSections: ['数据']
    },
    confidence: {
      keywordWeight: 0.3,
      patternWeight: 0.5,
      structureWeight: 0.2
    }
  }
}

/**
 * 文件类型检测器类
 */
export class FileTypeDetector {
  constructor() {
    this.rules = DETECTION_RULES
  }

  /**
   * 检测文件类型
   * @param {File} file - 文件对象
   * @param {string} content - 文件内容（可选）
   * @returns {Promise<Object>} 检测结果
   */
  async detectFileType(file, content = null) {
    try {
      // 如果没有提供内容，尝试读取文件
      if (!content) {
        content = await this.extractFileContent(file)
      }

      // 对每种数据源类型进行评分
      const scores = {}
      const details = {}

      for (const [sourceType, rule] of Object.entries(this.rules)) {
        const score = this.calculateTypeScore(content, rule)
        scores[sourceType] = score
        details[sourceType] = {
          score,
          matchedKeywords: this.findMatchedKeywords(content, rule.keywords),
          matchedPatterns: this.findMatchedPatterns(content, rule.patterns),
          structureAnalysis: this.analyzeStructure(content, rule.structure)
        }
      }

      // 找到最高分的类型
      const bestMatch = Object.keys(scores).reduce((a, b) => 
        scores[a] > scores[b] ? a : b
      )

      const confidence = scores[bestMatch]
      const documentType = confidence > 60 ? bestMatch : DATA_SOURCE_TYPES.REGULAR_CASE

      return {
        documentType,
        confidence: Math.round(confidence),
        scores,
        details,
        analysis: {
          fileSize: file.size,
          fileName: file.name,
          fileType: file.type,
          contentLength: content.length,
          estimatedPages: Math.ceil(content.length / 2000),
          language: this.detectLanguage(content)
        },
        recommendations: this.generateRecommendations(documentType, confidence, details[documentType])
      }
    } catch (error) {
      console.error('文件类型检测失败:', error)
      return {
        documentType: DATA_SOURCE_TYPES.REGULAR_CASE,
        confidence: 50,
        error: error.message,
        analysis: {
          fileSize: file.size,
          fileName: file.name,
          fileType: file.type
        }
      }
    }
  }

  /**
   * 提取文件内容
   */
  async extractFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        let content = e.target.result
        
        // 根据文件类型进行不同的处理
        if (file.type.includes('text') || file.name.endsWith('.txt')) {
          resolve(content)
        } else if (file.type.includes('json')) {
          resolve(content)
        } else {
          // 对于其他类型，返回基本信息
          resolve(`文件名: ${file.name}\n文件类型: ${file.type}\n文件大小: ${file.size} bytes`)
        }
      }
      
      reader.onerror = () => reject(new Error('文件读取失败'))
      
      // 根据文件类型选择读取方式
      if (file.type.includes('text') || file.name.endsWith('.txt') || file.type.includes('json')) {
        reader.readAsText(file, 'UTF-8')
      } else {
        reader.readAsText(file, 'UTF-8')
      }
    })
  }

  /**
   * 计算类型匹配分数
   */
  calculateTypeScore(content, rule) {
    const keywordScore = this.calculateKeywordScore(content, rule.keywords)
    const patternScore = this.calculatePatternScore(content, rule.patterns)
    const structureScore = this.calculateStructureScore(content, rule.structure)

    const weights = rule.confidence
    const totalScore = (
      keywordScore * weights.keywordWeight +
      patternScore * weights.patternWeight +
      structureScore * weights.structureWeight
    )

    return Math.min(100, totalScore)
  }

  /**
   * 计算关键词匹配分数
   */
  calculateKeywordScore(content, keywords) {
    const contentLower = content.toLowerCase()
    let matchCount = 0
    
    keywords.forEach(keyword => {
      if (contentLower.includes(keyword.toLowerCase())) {
        matchCount++
      }
    })

    return (matchCount / keywords.length) * 100
  }

  /**
   * 计算模式匹配分数
   */
  calculatePatternScore(content, patterns) {
    let totalMatches = 0
    let maxPossibleMatches = patterns.length * 5 // 假设每个模式最多匹配5次

    patterns.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches) {
        totalMatches += Math.min(matches.length, 5)
      }
    })

    return Math.min(100, (totalMatches / maxPossibleMatches) * 100)
  }

  /**
   * 计算结构匹配分数
   */
  calculateStructureScore(content, structure) {
    const sections = this.identifySections(content)
    const sectionCount = sections.length
    
    // 检查最小章节数
    const minSectionScore = sectionCount >= structure.minSections ? 50 : 0
    
    // 检查必需章节
    let requiredSectionScore = 0
    if (structure.requiredSections) {
      const foundSections = structure.requiredSections.filter(required =>
        sections.some(section => section.toLowerCase().includes(required.toLowerCase()))
      )
      requiredSectionScore = (foundSections.length / structure.requiredSections.length) * 50
    }

    return minSectionScore + requiredSectionScore
  }

  /**
   * 识别文档章节
   */
  identifySections(content) {
    const sections = []
    
    // 查找标题模式
    const titlePatterns = [
      /^[一二三四五六七八九十]+[、\.]\s*(.+)$/gm,
      /^[1-9]\d*[、\.]\s*(.+)$/gm,
      /^[A-Z]\d*[、\.]\s*(.+)$/gm,
      /^D[1-8][:：]\s*(.+)$/gm,
      /^#{1,6}\s*(.+)$/gm  // Markdown标题
    ]

    titlePatterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(content)) !== null) {
        sections.push(match[1].trim())
      }
    })

    return [...new Set(sections)] // 去重
  }

  /**
   * 查找匹配的关键词
   */
  findMatchedKeywords(content, keywords) {
    const contentLower = content.toLowerCase()
    return keywords.filter(keyword => 
      contentLower.includes(keyword.toLowerCase())
    )
  }

  /**
   * 查找匹配的模式
   */
  findMatchedPatterns(content, patterns) {
    const matches = []
    patterns.forEach((pattern, index) => {
      const patternMatches = content.match(pattern)
      if (patternMatches) {
        matches.push({
          patternIndex: index,
          matches: patternMatches.slice(0, 3) // 只保留前3个匹配
        })
      }
    })
    return matches
  }

  /**
   * 分析文档结构
   */
  analyzeStructure(content, structure) {
    const sections = this.identifySections(content)
    return {
      sectionCount: sections.length,
      sections: sections.slice(0, 10), // 只返回前10个章节
      meetsMinSections: sections.length >= structure.minSections,
      hasRequiredSections: structure.requiredSections ? 
        structure.requiredSections.every(required =>
          sections.some(section => section.toLowerCase().includes(required.toLowerCase()))
        ) : true
    }
  }

  /**
   * 检测语言
   */
  detectLanguage(content) {
    const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length
    const englishChars = (content.match(/[a-zA-Z]/g) || []).length
    const totalChars = chineseChars + englishChars

    if (totalChars === 0) return 'unknown'
    
    const chineseRatio = chineseChars / totalChars
    if (chineseRatio > 0.3) return 'chinese'
    if (englishChars / totalChars > 0.7) return 'english'
    return 'mixed'
  }

  /**
   * 生成建议
   */
  generateRecommendations(documentType, confidence, details) {
    const recommendations = []

    if (confidence < 70) {
      recommendations.push({
        type: 'warning',
        title: '识别置信度较低',
        description: '建议手动确认文档类型或提供更多上下文信息'
      })
    }

    if (details && details.structureAnalysis && !details.structureAnalysis.meetsMinSections) {
      recommendations.push({
        type: 'info',
        title: '文档结构建议',
        description: '建议增加更多章节标题以提高文档结构化程度'
      })
    }

    if (documentType === DATA_SOURCE_TYPES.D8_REPORT && confidence > 80) {
      recommendations.push({
        type: 'success',
        title: '8D报告识别成功',
        description: '将使用专门的8D报告解析器进行处理'
      })
    }

    return recommendations
  }
}

/**
 * 默认导出检测器实例
 */
export default new FileTypeDetector()
