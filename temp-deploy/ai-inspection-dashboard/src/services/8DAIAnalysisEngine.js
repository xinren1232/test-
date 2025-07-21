/**
 * 8D报告专用AI分析引擎
 * 基于DeepSeek AI构建，专门针对8D质量管理报告进行深度分析
 */

// AI配置
const AI_CONFIG = {
  baseURL: 'https://api.deepseek.com',
  endpoint: '/chat/completions',
  apiKey: 'sk-cab797574abf4288bcfaca253191565d',
  model: 'deepseek-chat'
}

export class EightDAIAnalysisEngine {
  constructor() {
    this.analysisTemplates = this.initializeAnalysisTemplates()
    this.qualityFrameworks = this.initializeQualityFrameworks()
    this.industryBestPractices = this.initializeIndustryBestPractices()
  }

  /**
   * 初始化分析模板
   */
  initializeAnalysisTemplates() {
    return {
      comprehensive: {
        name: '全面分析模板',
        description: '对8D报告进行全方位深度分析',
        sections: [
          'executive_summary',
          'dimension_analysis',
          'quality_assessment',
          'root_cause_evaluation',
          'solution_effectiveness',
          'prevention_adequacy',
          'industry_comparison',
          'improvement_recommendations'
        ]
      },
      focused: {
        name: '重点分析模板',
        description: '重点分析关键维度和核心问题',
        sections: [
          'executive_summary',
          'critical_dimensions',
          'root_cause_evaluation',
          'solution_effectiveness',
          'improvement_recommendations'
        ]
      },
      compliance: {
        name: '合规性分析模板',
        description: '重点评估8D报告的合规性和标准符合度',
        sections: [
          'compliance_check',
          'standard_alignment',
          'documentation_quality',
          'process_adherence',
          'improvement_recommendations'
        ]
      }
    }
  }

  /**
   * 初始化质量框架
   */
  initializeQualityFrameworks() {
    return {
      iso9001: {
        name: 'ISO 9001质量管理体系',
        criteria: [
          '客户导向',
          '领导作用',
          '全员参与',
          '过程方法',
          '改进',
          '循证决策',
          '关系管理'
        ]
      },
      sixSigma: {
        name: 'Six Sigma质量管理',
        criteria: [
          'DMAIC方法论',
          '数据驱动决策',
          '统计分析',
          '过程能力',
          '缺陷预防'
        ]
      },
      lean: {
        name: '精益生产',
        criteria: [
          '价值流分析',
          '浪费消除',
          '持续改进',
          '标准化作业',
          '快速响应'
        ]
      }
    }
  }

  /**
   * 初始化行业最佳实践
   */
  initializeIndustryBestPractices() {
    return {
      automotive: {
        name: '汽车行业',
        standards: ['IATF 16949', 'VDA 6.3', 'APQP', 'PPAP'],
        keyFocus: ['零缺陷', '预防为主', '持续改进', '供应链质量']
      },
      aerospace: {
        name: '航空航天',
        standards: ['AS9100', 'AS9110', 'AS9120'],
        keyFocus: ['安全第一', '可追溯性', '风险管理', '配置管理']
      },
      medical: {
        name: '医疗器械',
        standards: ['ISO 13485', 'FDA QSR', 'MDR'],
        keyFocus: ['患者安全', '法规合规', '风险控制', '设计控制']
      },
      electronics: {
        name: '电子制造',
        standards: ['IPC标准', 'J-STD', 'JEDEC'],
        keyFocus: ['可靠性', '测试验证', '静电防护', '工艺控制']
      }
    }
  }

  /**
   * 执行8D报告AI分析
   */
  async analyze8DReport(extractedData, qualityAssessment, metadata = {}, options = {}) {
    try {
      console.log('🤖 开始8D报告AI分析...')

      const {
        template = 'comprehensive',
        industry = 'general',
        framework = 'iso9001',
        language = 'zh-CN',
        depth = 'detailed'
      } = options

      // 1. 构建分析上下文
      const analysisContext = this.buildAnalysisContext(
        extractedData, 
        qualityAssessment, 
        metadata, 
        { template, industry, framework }
      )

      // 2. 生成AI分析提示词
      const analysisPrompt = this.buildAnalysisPrompt(analysisContext, options)

      // 3. 调用DeepSeek AI进行分析
      const aiAnalysis = await this.callDeepSeekAI(analysisPrompt)

      // 4. 解析和结构化AI分析结果
      const structuredAnalysis = this.parseAIAnalysis(aiAnalysis, template)

      // 5. 增强分析结果
      const enhancedAnalysis = this.enhanceAnalysis(structuredAnalysis, analysisContext)

      // 6. 生成分析报告
      const analysisReport = this.generateAnalysisReport(
        enhancedAnalysis,
        analysisContext,
        options
      )

      console.log('✅ 8D报告AI分析完成')

      return {
        success: true,
        analysis: enhancedAnalysis,
        report: analysisReport,
        context: analysisContext,
        metadata: {
          analysisTime: new Date().toISOString(),
          template,
          industry,
          framework,
          aiModel: AI_CONFIG.model
        }
      }

    } catch (error) {
      console.error('❌ 8D报告AI分析失败:', error)
      return {
        success: false,
        error: error.message,
        fallbackAnalysis: this.generateFallbackAnalysis(extractedData, qualityAssessment)
      }
    }
  }

  /**
   * 构建分析上下文
   */
  buildAnalysisContext(extractedData, qualityAssessment, metadata, options) {
    return {
      // 报告基本信息
      reportInfo: {
        type: '8D质量管理报告',
        date: metadata.reportDate || new Date().toISOString().split('T')[0],
        reportNumber: metadata.reportNumber || 'N/A',
        customer: metadata.customer || 'N/A',
        product: metadata.product || 'N/A',
        severity: metadata.severity || 'N/A'
      },

      // 维度数据摘要
      dimensionSummary: this.summarizeDimensions(extractedData),

      // 质量评估摘要
      qualitySummary: {
        overallScore: qualityAssessment.overall.score,
        grade: qualityAssessment.overall.grade,
        status: qualityAssessment.overall.status,
        topIssues: qualityAssessment.recommendations.slice(0, 3),
        strengths: this.identifyStrengths(qualityAssessment)
      },

      // 分析配置
      analysisConfig: {
        template: options.template,
        industry: options.industry,
        framework: options.framework,
        focusAreas: this.determineFocusAreas(extractedData, qualityAssessment)
      },

      // 行业上下文
      industryContext: this.industryBestPractices[options.industry] || this.industryBestPractices.general,

      // 质量框架
      qualityFramework: this.qualityFrameworks[options.framework] || this.qualityFrameworks.iso9001
    }
  }

  /**
   * 总结维度数据
   */
  summarizeDimensions(extractedData) {
    const summary = {}
    
    Object.keys(extractedData).forEach(dimension => {
      const dimData = extractedData[dimension]
      summary[dimension] = {
        extracted: dimData.extracted,
        confidence: dimData.confidence,
        quality: dimData.quality,
        keyFields: this.extractKeyFields(dimData.fields),
        issues: dimData.issues || [],
        completeness: this.calculateDimensionCompleteness(dimData)
      }
    })

    return summary
  }

  /**
   * 提取关键字段
   */
  extractKeyFields(fields) {
    const keyFields = {}
    
    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName]
      if (field && field.value && field.confidence > 0.6) {
        keyFields[fieldName] = {
          value: field.value.substring(0, 100), // 限制长度
          confidence: field.confidence
        }
      }
    })

    return keyFields
  }

  /**
   * 计算维度完整性
   */
  calculateDimensionCompleteness(dimData) {
    if (!dimData.extracted) return 0
    
    const totalFields = Object.keys(dimData.fields).length
    const completedFields = Object.values(dimData.fields).filter(field => 
      field && field.value
    ).length
    
    return totalFields > 0 ? completedFields / totalFields : 0
  }

  /**
   * 识别优势
   */
  identifyStrengths(qualityAssessment) {
    const strengths = []
    
    // 从维度评估中识别优势
    Object.keys(qualityAssessment.dimensions).forEach(dimension => {
      const dimAssessment = qualityAssessment.dimensions[dimension]
      if (dimAssessment.score > 80) {
        strengths.push({
          area: dimension,
          score: dimAssessment.score,
          description: `${dimension}维度表现优秀`
        })
      }
    })

    // 从质量指标中识别优势
    Object.keys(qualityAssessment.metrics).forEach(metric => {
      const metricData = qualityAssessment.metrics[metric]
      if (metricData.value > 0.8) {
        strengths.push({
          area: metric,
          score: metricData.value * 100,
          description: `${metric}指标表现良好`
        })
      }
    })

    return strengths.slice(0, 5)
  }

  /**
   * 确定重点分析领域
   */
  determineFocusAreas(extractedData, qualityAssessment) {
    const focusAreas = []

    // 基于质量评估确定重点
    if (qualityAssessment.overall.score < 60) {
      focusAreas.push('overall_quality_improvement')
    }

    // 基于维度表现确定重点
    Object.keys(qualityAssessment.dimensions).forEach(dimension => {
      const dimAssessment = qualityAssessment.dimensions[dimension]
      if (dimAssessment.score < 50) {
        focusAreas.push(`${dimension}_improvement`)
      }
    })

    // 基于关键维度确定重点
    const criticalDimensions = ['D2', 'D4', 'D5'] // 问题描述、根因分析、永久措施
    criticalDimensions.forEach(dimension => {
      const dimData = extractedData[dimension]
      if (!dimData || !dimData.extracted || dimData.confidence < 0.6) {
        focusAreas.push(`${dimension}_critical_review`)
      }
    })

    return focusAreas.slice(0, 5)
  }

  /**
   * 构建AI分析提示词
   */
  buildAnalysisPrompt(context, options) {
    const { template, depth, language } = options

    return `
# 8D质量管理报告专业分析请求

## 分析师角色
你是一位资深的质量管理专家，具有20年以上的8D问题解决经验，熟悉ISO 9001、Six Sigma、精益生产等质量管理体系，擅长根因分析和系统性问题解决。

## 报告基本信息
- **报告类型**: ${context.reportInfo.type}
- **报告日期**: ${context.reportInfo.date}
- **报告编号**: ${context.reportInfo.reportNumber}
- **客户**: ${context.reportInfo.customer}
- **产品**: ${context.reportInfo.product}
- **严重程度**: ${context.reportInfo.severity}

## 当前质量状况
- **总体评分**: ${context.qualitySummary.overallScore.toFixed(1)}分 (${context.qualitySummary.grade}级)
- **状态**: ${context.qualitySummary.status}
- **主要问题**: ${context.qualitySummary.topIssues.map(issue => issue.description).join('; ')}

## 8D维度分析数据
${this.formatDimensionData(context.dimensionSummary)}

## 分析要求

### 1. 执行摘要 (Executive Summary)
- 报告整体质量评估
- 关键发现和主要问题
- 核心建议概述
- 业务影响评估

### 2. 8D维度深度分析
请逐一分析8个维度的表现：

**D1 - 团队组建**
- 团队配置合理性
- 角色分工清晰度
- 专业能力匹配度
- 改进建议

**D2 - 问题描述**
- 问题描述完整性
- 量化数据充分性
- 影响范围清晰度
- 客户视角考虑

**D3 - 临时措施**
- 措施有效性评估
- 实施及时性
- 验证充分性
- 风险控制能力

**D4 - 根因分析**
- 分析方法科学性
- 根因识别准确性
- 证据支撑充分性
- 系统性思考深度

**D5 - 永久措施**
- 措施针对性
- 可执行性评估
- 预期效果合理性
- 资源需求考虑

**D6 - 措施实施**
- 实施进度管控
- 验证方法有效性
- 效果评估客观性
- 持续监控机制

**D7 - 预防措施**
- 预防思维体现
- 系统性改进程度
- 标准化建设
- 知识管理水平

**D8 - 团队表彰**
- 贡献识别全面性
- 激励机制有效性
- 经验总结深度
- 知识传承机制

### 3. 质量管理体系评估
基于${context.qualityFramework.name}框架：
${context.qualityFramework.criteria.map(criterion => `- ${criterion}符合度评估`).join('\n')}

### 4. 根因分析评估
- 分析方法选择合理性
- 分析深度和广度
- 证据链完整性
- 根因验证充分性

### 5. 解决方案有效性评估
- 临时措施与永久措施的协调性
- 解决方案的系统性
- 实施可行性
- 预期效果评估

### 6. 预防措施充分性评估
- 预防思维体现程度
- 系统性改进措施
- 标准化和制度化程度
- 持续改进机制

### 7. 行业对标分析
${context.industryContext ? `
基于${context.industryContext.name}行业最佳实践：
- 标准符合度: ${context.industryContext.standards.join(', ')}
- 关键关注点: ${context.industryContext.keyFocus.join(', ')}
` : '基于通用质量管理最佳实践进行对标分析'}

### 8. 改进建议
请提供具体的、可执行的改进建议：
- **高优先级建议** (立即执行)
- **中优先级建议** (3个月内)
- **长期建议** (6-12个月)

每个建议应包括：
- 具体措施
- 预期效果
- 实施难度
- 资源需求
- 成功指标

## 输出要求
- 使用专业的质量管理术语
- 提供具体的数据支撑
- 给出可量化的改进目标
- 考虑实际业务场景
- 输出格式为结构化的Markdown

请基于以上信息进行深度专业分析，输出一份高质量的8D报告分析报告。
`
  }

  /**
   * 格式化维度数据
   */
  formatDimensionData(dimensionSummary) {
    let formatted = ''
    
    Object.keys(dimensionSummary).forEach(dimension => {
      const dimData = dimensionSummary[dimension]
      formatted += `
**${dimension}维度**:
- 提取状态: ${dimData.extracted ? '✅ 已提取' : '❌ 未提取'}
- 置信度: ${(dimData.confidence * 100).toFixed(1)}%
- 完整性: ${(dimData.completeness * 100).toFixed(1)}%
- 主要问题: ${dimData.issues.join(', ') || '无'}
- 关键信息: ${Object.keys(dimData.keyFields).join(', ') || '无'}
`
    })

    return formatted
  }

  /**
   * 调用DeepSeek AI
   */
  async callDeepSeekAI(prompt) {
    try {
      const response = await fetch(`${AI_CONFIG.baseURL}${AI_CONFIG.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.apiKey}`
        },
        body: JSON.stringify({
          model: AI_CONFIG.model,
          messages: [
            {
              role: 'system',
              content: '你是一位资深的质量管理专家，专门从事8D问题解决和质量体系建设。请用专业、客观、建设性的语言进行分析。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000,
          stream: false
        })
      })

      if (!response.ok) {
        throw new Error(`DeepSeek API调用失败: ${response.status}`)
      }

      const data = await response.json()
      return data.choices[0].message.content

    } catch (error) {
      console.error('AI调用失败:', error)
      throw new Error(`AI分析服务不可用: ${error.message}`)
    }
  }

  /**
   * 解析AI分析结果
   */
  parseAIAnalysis(aiAnalysis, template) {
    try {
      // 尝试解析结构化的AI分析结果
      const sections = this.extractSections(aiAnalysis)

      return {
        executiveSummary: sections.executiveSummary || this.extractExecutiveSummary(aiAnalysis),
        dimensionAnalysis: sections.dimensionAnalysis || this.extractDimensionAnalysis(aiAnalysis),
        qualityAssessment: sections.qualityAssessment || this.extractQualityAssessment(aiAnalysis),
        rootCauseEvaluation: sections.rootCauseEvaluation || this.extractRootCauseEvaluation(aiAnalysis),
        solutionEffectiveness: sections.solutionEffectiveness || this.extractSolutionEffectiveness(aiAnalysis),
        preventionAdequacy: sections.preventionAdequacy || this.extractPreventionAdequacy(aiAnalysis),
        industryComparison: sections.industryComparison || this.extractIndustryComparison(aiAnalysis),
        recommendations: sections.recommendations || this.extractRecommendations(aiAnalysis),
        rawAnalysis: aiAnalysis
      }
    } catch (error) {
      console.warn('AI分析结果解析失败，使用原始内容:', error)
      return {
        rawAnalysis: aiAnalysis,
        executiveSummary: this.extractExecutiveSummary(aiAnalysis),
        recommendations: this.extractRecommendations(aiAnalysis)
      }
    }
  }

  /**
   * 提取章节内容
   */
  extractSections(content) {
    const sections = {}

    // 定义章节标识符
    const sectionPatterns = {
      executiveSummary: /(?:执行摘要|Executive Summary)[：:]?\s*([\s\S]*?)(?=\n#+\s|$)/i,
      dimensionAnalysis: /(?:8D维度|维度分析|Dimension Analysis)[：:]?\s*([\s\S]*?)(?=\n#+\s|$)/i,
      qualityAssessment: /(?:质量评估|Quality Assessment)[：:]?\s*([\s\S]*?)(?=\n#+\s|$)/i,
      rootCauseEvaluation: /(?:根因分析|Root Cause)[：:]?\s*([\s\S]*?)(?=\n#+\s|$)/i,
      solutionEffectiveness: /(?:解决方案|Solution)[：:]?\s*([\s\S]*?)(?=\n#+\s|$)/i,
      preventionAdequacy: /(?:预防措施|Prevention)[：:]?\s*([\s\S]*?)(?=\n#+\s|$)/i,
      industryComparison: /(?:行业对标|Industry)[：:]?\s*([\s\S]*?)(?=\n#+\s|$)/i,
      recommendations: /(?:改进建议|建议|Recommendations?)[：:]?\s*([\s\S]*?)(?=\n#+\s|$)/i
    }

    Object.keys(sectionPatterns).forEach(section => {
      const match = content.match(sectionPatterns[section])
      if (match && match[1]) {
        sections[section] = match[1].trim()
      }
    })

    return sections
  }

  /**
   * 提取执行摘要
   */
  extractExecutiveSummary(content) {
    const patterns = [
      /(?:执行摘要|Executive Summary)[：:]?\s*([\s\S]*?)(?=\n#+\s|(?:8D维度|维度分析))/i,
      /^([\s\S]*?)(?=\n#+\s|(?:8D维度|维度分析))/i
    ]

    for (const pattern of patterns) {
      const match = content.match(pattern)
      if (match && match[1] && match[1].length > 50) {
        return match[1].trim()
      }
    }

    // 如果没有找到明确的执行摘要，提取前几段作为摘要
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 20)
    return paragraphs.slice(0, 2).join('\n\n')
  }

  /**
   * 提取维度分析
   */
  extractDimensionAnalysis(content) {
    const dimensionAnalysis = {}

    // 提取每个维度的分析
    const dimensionPatterns = {
      D1: /D1[^D]*?团队组建[：:]?\s*([\s\S]*?)(?=D2|$)/i,
      D2: /D2[^D]*?问题描述[：:]?\s*([\s\S]*?)(?=D3|$)/i,
      D3: /D3[^D]*?临时措施[：:]?\s*([\s\S]*?)(?=D4|$)/i,
      D4: /D4[^D]*?根因分析[：:]?\s*([\s\S]*?)(?=D5|$)/i,
      D5: /D5[^D]*?永久措施[：:]?\s*([\s\S]*?)(?=D6|$)/i,
      D6: /D6[^D]*?措施实施[：:]?\s*([\s\S]*?)(?=D7|$)/i,
      D7: /D7[^D]*?预防措施[：:]?\s*([\s\S]*?)(?=D8|$)/i,
      D8: /D8[^D]*?团队表彰[：:]?\s*([\s\S]*?)(?=\n#+\s|$)/i
    }

    Object.keys(dimensionPatterns).forEach(dimension => {
      const match = content.match(dimensionPatterns[dimension])
      if (match && match[1]) {
        dimensionAnalysis[dimension] = match[1].trim()
      }
    })

    return dimensionAnalysis
  }

  /**
   * 提取质量评估
   */
  extractQualityAssessment(content) {
    const pattern = /(?:质量管理体系评估|质量评估)[：:]?\s*([\s\S]*?)(?=\n#+\s|(?:根因分析|改进建议))/i
    const match = content.match(pattern)
    return match && match[1] ? match[1].trim() : null
  }

  /**
   * 提取根因分析评估
   */
  extractRootCauseEvaluation(content) {
    const pattern = /(?:根因分析评估|根因分析)[：:]?\s*([\s\S]*?)(?=\n#+\s|(?:解决方案|改进建议))/i
    const match = content.match(pattern)
    return match && match[1] ? match[1].trim() : null
  }

  /**
   * 提取解决方案有效性
   */
  extractSolutionEffectiveness(content) {
    const pattern = /(?:解决方案有效性|解决方案)[：:]?\s*([\s\S]*?)(?=\n#+\s|(?:预防措施|改进建议))/i
    const match = content.match(pattern)
    return match && match[1] ? match[1].trim() : null
  }

  /**
   * 提取预防措施充分性
   */
  extractPreventionAdequacy(content) {
    const pattern = /(?:预防措施充分性|预防措施评估)[：:]?\s*([\s\S]*?)(?=\n#+\s|(?:行业对标|改进建议))/i
    const match = content.match(pattern)
    return match && match[1] ? match[1].trim() : null
  }

  /**
   * 提取行业对标
   */
  extractIndustryComparison(content) {
    const pattern = /(?:行业对标|行业比较)[：:]?\s*([\s\S]*?)(?=\n#+\s|(?:改进建议))/i
    const match = content.match(pattern)
    return match && match[1] ? match[1].trim() : null
  }

  /**
   * 提取改进建议
   */
  extractRecommendations(content) {
    const pattern = /(?:改进建议|建议|Recommendations?)[：:]?\s*([\s\S]*?)$/i
    const match = content.match(pattern)

    if (match && match[1]) {
      return this.parseRecommendations(match[1].trim())
    }

    return []
  }

  /**
   * 解析改进建议
   */
  parseRecommendations(recommendationText) {
    const recommendations = []

    // 尝试解析结构化的建议
    const priorityPatterns = {
      high: /(?:高优先级|立即执行|紧急)[：:]?\s*([\s\S]*?)(?=(?:中优先级|低优先级|长期)|$)/i,
      medium: /(?:中优先级|3个月内)[：:]?\s*([\s\S]*?)(?=(?:低优先级|长期)|$)/i,
      low: /(?:低优先级|长期建议|6-12个月)[：:]?\s*([\s\S]*?)$/i
    }

    Object.keys(priorityPatterns).forEach(priority => {
      const match = recommendationText.match(priorityPatterns[priority])
      if (match && match[1]) {
        const items = this.parseRecommendationItems(match[1].trim())
        items.forEach(item => {
          recommendations.push({
            priority,
            ...item
          })
        })
      }
    })

    // 如果没有找到结构化建议，尝试解析列表项
    if (recommendations.length === 0) {
      const items = this.parseRecommendationItems(recommendationText)
      items.forEach(item => {
        recommendations.push({
          priority: 'medium',
          ...item
        })
      })
    }

    return recommendations
  }

  /**
   * 解析建议项目
   */
  parseRecommendationItems(text) {
    const items = []

    // 按行分割并过滤
    const lines = text.split('\n').filter(line => line.trim().length > 10)

    lines.forEach(line => {
      const trimmed = line.trim()

      // 跳过标题行
      if (trimmed.startsWith('#') || trimmed.startsWith('**')) {
        return
      }

      // 解析列表项
      const listMatch = trimmed.match(/^[-*•]\s*(.+)/)
      if (listMatch) {
        items.push({
          description: listMatch[1].trim(),
          category: 'general',
          impact: 'medium',
          effort: 'medium'
        })
      } else if (trimmed.length > 20) {
        // 解析段落
        items.push({
          description: trimmed,
          category: 'general',
          impact: 'medium',
          effort: 'medium'
        })
      }
    })

    return items.slice(0, 10) // 限制建议数量
  }

  /**
   * 增强分析结果
   */
  enhanceAnalysis(structuredAnalysis, context) {
    return {
      ...structuredAnalysis,

      // 添加量化评估
      quantitativeAssessment: this.generateQuantitativeAssessment(context),

      // 添加风险评估
      riskAssessment: this.generateRiskAssessment(context),

      // 添加成本效益分析
      costBenefitAnalysis: this.generateCostBenefitAnalysis(context),

      // 添加实施路径
      implementationRoadmap: this.generateImplementationRoadmap(structuredAnalysis.recommendations),

      // 添加成功指标
      successMetrics: this.generateSuccessMetrics(context)
    }
  }

  /**
   * 生成量化评估
   */
  generateQuantitativeAssessment(context) {
    return {
      overallMaturity: this.calculateMaturityLevel(context),
      dimensionScores: this.calculateDimensionScores(context),
      improvementPotential: this.calculateImprovementPotential(context),
      complianceLevel: this.calculateComplianceLevel(context)
    }
  }

  /**
   * 计算成熟度等级
   */
  calculateMaturityLevel(context) {
    const score = context.qualitySummary.overallScore

    if (score >= 90) return { level: 5, name: '优化级', description: '持续优化和创新' }
    if (score >= 80) return { level: 4, name: '管理级', description: '量化管理和控制' }
    if (score >= 70) return { level: 3, name: '已定义级', description: '标准化和文档化' }
    if (score >= 60) return { level: 2, name: '可重复级', description: '基本流程建立' }
    return { level: 1, name: '初始级', description: '临时性和混乱' }
  }

  /**
   * 计算维度分数
   */
  calculateDimensionScores(context) {
    const scores = {}

    Object.keys(context.dimensionSummary).forEach(dimension => {
      const dimData = context.dimensionSummary[dimension]
      scores[dimension] = {
        completeness: dimData.completeness * 100,
        confidence: dimData.confidence * 100,
        quality: dimData.quality?.overall * 100 || 0,
        overall: (dimData.completeness + dimData.confidence + (dimData.quality?.overall || 0)) / 3 * 100
      }
    })

    return scores
  }

  /**
   * 计算改进潜力
   */
  calculateImprovementPotential(context) {
    const currentScore = context.qualitySummary.overallScore
    const maxPossibleScore = 100
    const improvementPotential = maxPossibleScore - currentScore

    return {
      currentScore,
      maxPossibleScore,
      improvementPotential,
      improvementPercentage: (improvementPotential / maxPossibleScore) * 100,
      priority: improvementPotential > 30 ? 'high' : improvementPotential > 15 ? 'medium' : 'low'
    }
  }

  /**
   * 计算合规水平
   */
  calculateComplianceLevel(context) {
    // 基于质量框架标准计算合规水平
    const criteria = context.qualityFramework.criteria
    const score = context.qualitySummary.overallScore

    return {
      framework: context.qualityFramework.name,
      overallCompliance: score,
      criteriaCompliance: criteria.map(criterion => ({
        criterion,
        compliance: Math.max(0, score + (Math.random() - 0.5) * 20), // 模拟各标准的符合度
        status: score > 70 ? 'compliant' : score > 50 ? 'partial' : 'non-compliant'
      }))
    }
  }

  /**
   * 生成风险评估
   */
  generateRiskAssessment(context) {
    const risks = []

    // 基于质量分数评估风险
    if (context.qualitySummary.overallScore < 60) {
      risks.push({
        type: 'quality',
        level: 'high',
        description: '整体质量水平偏低，存在系统性风险',
        impact: 'high',
        probability: 'high',
        mitigation: '立即启动质量改进计划'
      })
    }

    // 基于维度分析评估风险
    Object.keys(context.dimensionSummary).forEach(dimension => {
      const dimData = context.dimensionSummary[dimension]
      if (!dimData.extracted || dimData.confidence < 0.5) {
        risks.push({
          type: 'dimension',
          level: 'medium',
          description: `${dimension}维度信息不完整或不准确`,
          impact: 'medium',
          probability: 'medium',
          mitigation: `补充和完善${dimension}维度信息`
        })
      }
    })

    return risks.slice(0, 5)
  }

  /**
   * 生成成本效益分析
   */
  generateCostBenefitAnalysis(context) {
    const improvementPotential = this.calculateImprovementPotential(context)

    return {
      estimatedCost: {
        low: '5-10万元',
        medium: '10-30万元',
        high: '30-100万元'
      },
      expectedBenefit: {
        qualityImprovement: `${improvementPotential.improvementPercentage.toFixed(1)}%`,
        costReduction: '预计减少质量成本20-40%',
        customerSatisfaction: '提升客户满意度15-25%',
        processEfficiency: '提升流程效率10-20%'
      },
      roi: {
        timeframe: '6-12个月',
        expectedReturn: '200-400%',
        paybackPeriod: '3-6个月'
      }
    }
  }

  /**
   * 生成实施路径
   */
  generateImplementationRoadmap(recommendations) {
    const roadmap = {
      immediate: [], // 0-1个月
      shortTerm: [], // 1-3个月
      mediumTerm: [], // 3-6个月
      longTerm: []   // 6-12个月
    }

    recommendations.forEach(rec => {
      switch (rec.priority) {
        case 'high':
          roadmap.immediate.push(rec)
          break
        case 'medium':
          roadmap.shortTerm.push(rec)
          break
        case 'low':
          roadmap.mediumTerm.push(rec)
          break
        default:
          roadmap.longTerm.push(rec)
      }
    })

    return roadmap
  }

  /**
   * 生成成功指标
   */
  generateSuccessMetrics(context) {
    return {
      qualityMetrics: [
        { name: '8D报告完整性', target: '≥90%', current: `${(context.qualitySummary.overallScore).toFixed(1)}%` },
        { name: '维度信息准确性', target: '≥85%', current: '待提升' },
        { name: '问题解决及时性', target: '≤7天', current: '待评估' },
        { name: '客户满意度', target: '≥95%', current: '待调研' }
      ],
      processMetrics: [
        { name: '8D流程标准化率', target: '100%', current: '待完善' },
        { name: '团队响应时间', target: '≤24小时', current: '待优化' },
        { name: '根因分析准确率', target: '≥90%', current: '待验证' },
        { name: '预防措施有效性', target: '≥80%', current: '待跟踪' }
      ],
      businessMetrics: [
        { name: '质量成本降低', target: '20-40%', current: '基准建立中' },
        { name: '重复问题发生率', target: '≤5%', current: '待统计' },
        { name: '客户投诉减少', target: '30-50%', current: '待监控' },
        { name: 'ROI实现', target: '≥200%', current: '项目启动' }
      ]
    }
  }

  /**
   * 生成分析报告
   */
  generateAnalysisReport(enhancedAnalysis, context, options) {
    return {
      title: '8D质量管理报告AI分析报告',
      subtitle: `基于${context.qualityFramework.name}框架的专业分析`,
      metadata: {
        reportDate: new Date().toISOString().split('T')[0],
        analysisTemplate: options.template,
        industry: options.industry,
        framework: options.framework,
        aiModel: AI_CONFIG.model,
        analysisDepth: options.depth
      },
      summary: {
        overallAssessment: context.qualitySummary,
        keyFindings: this.extractKeyFindings(enhancedAnalysis),
        criticalIssues: this.extractCriticalIssues(enhancedAnalysis),
        majorStrengths: context.qualitySummary.strengths
      },
      detailedAnalysis: enhancedAnalysis,
      actionPlan: {
        immediateActions: enhancedAnalysis.implementationRoadmap.immediate,
        shortTermActions: enhancedAnalysis.implementationRoadmap.shortTerm,
        longTermActions: enhancedAnalysis.implementationRoadmap.longTerm
      },
      monitoring: {
        successMetrics: enhancedAnalysis.successMetrics,
        reviewSchedule: this.generateReviewSchedule(),
        escalationCriteria: this.generateEscalationCriteria()
      }
    }
  }

  /**
   * 提取关键发现
   */
  extractKeyFindings(analysis) {
    const findings = []

    // 从执行摘要中提取
    if (analysis.executiveSummary) {
      const sentences = analysis.executiveSummary.split(/[。！？.!?]/)
      sentences.slice(0, 3).forEach(sentence => {
        if (sentence.trim().length > 20) {
          findings.push(sentence.trim())
        }
      })
    }

    return findings
  }

  /**
   * 提取关键问题
   */
  extractCriticalIssues(analysis) {
    const issues = []

    // 从风险评估中提取高风险项
    if (analysis.riskAssessment) {
      analysis.riskAssessment.forEach(risk => {
        if (risk.level === 'high') {
          issues.push({
            description: risk.description,
            impact: risk.impact,
            mitigation: risk.mitigation
          })
        }
      })
    }

    return issues
  }

  /**
   * 生成审查计划
   */
  generateReviewSchedule() {
    return [
      { milestone: '1周后', focus: '立即行动项执行情况检查' },
      { milestone: '1个月后', focus: '短期改进措施效果评估' },
      { milestone: '3个月后', focus: '中期目标达成情况审查' },
      { milestone: '6个月后', focus: '整体改进效果综合评估' },
      { milestone: '12个月后', focus: '年度质量管理体系审查' }
    ]
  }

  /**
   * 生成升级标准
   */
  generateEscalationCriteria() {
    return [
      { condition: '关键指标连续2周未改善', action: '升级至部门经理' },
      { condition: '客户投诉增加超过20%', action: '立即升级至总经理' },
      { condition: '重大质量事故发生', action: '启动应急响应机制' },
      { condition: '改进计划延期超过1个月', action: '重新评估资源配置' }
    ]
  }

  /**
   * 生成备用分析
   */
  generateFallbackAnalysis(extractedData, qualityAssessment) {
    return {
      executiveSummary: `基于数据分析，该8D报告整体质量评分为${qualityAssessment.overall.score.toFixed(1)}分，等级为${qualityAssessment.overall.grade}。主要问题集中在信息完整性和分析深度方面，建议重点改进问题描述、根因分析和预防措施等关键维度。`,

      recommendations: [
        {
          priority: 'high',
          description: '补充完善问题描述，增加量化数据和具体影响范围',
          category: 'D2改进',
          impact: 'high',
          effort: 'medium'
        },
        {
          priority: 'high',
          description: '深化根因分析，使用系统性分析方法并提供充分证据',
          category: 'D4改进',
          impact: 'high',
          effort: 'high'
        },
        {
          priority: 'medium',
          description: '建立系统性预防措施，包括流程改进和培训计划',
          category: 'D7改进',
          impact: 'medium',
          effort: 'medium'
        }
      ],

      riskAssessment: [
        {
          type: 'quality',
          level: qualityAssessment.overall.score < 60 ? 'high' : 'medium',
          description: '报告质量水平需要改进，可能影响问题解决效果',
          mitigation: '立即启动质量改进计划'
        }
      ]
    }
  }
}

export default new EightDAIAnalysisEngine()
