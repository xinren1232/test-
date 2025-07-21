/**
 * 8D报告专用数据提取规则引擎
 * 为8D报告的8个维度设计专门的数据提取规则和验证逻辑
 */

import EightDReportAnalyzer from './8DReportAnalyzer.js'

export class EightDDataExtractor {
  constructor() {
    this.analyzer = EightDReportAnalyzer
    this.extractionRules = this.initializeExtractionRules()
    this.validationRules = this.initializeValidationRules()
    this.qualityMetrics = this.initializeQualityMetrics()
  }

  /**
   * 初始化数据提取规则
   */
  initializeExtractionRules() {
    return {
      D1: {
        patterns: {
          teamMembers: [
            /团队成员[：:]?\s*([^。\n]+)/gi,
            /成员[：:]?\s*([^。\n]+)/gi,
            /Team\s+Members?[：:]?\s*([^。\n]+)/gi
          ],
          roles: [
            /角色[：:]?\s*([^。\n]+)/gi,
            /职责[：:]?\s*([^。\n]+)/gi,
            /Role[s]?[：:]?\s*([^。\n]+)/gi
          ],
          leader: [
            /组长[：:]?\s*([^。\n]+)/gi,
            /负责人[：:]?\s*([^。\n]+)/gi,
            /Leader[：:]?\s*([^。\n]+)/gi
          ],
          contact: [
            /联系方式[：:]?\s*([^。\n]+)/gi,
            /电话[：:]?\s*([^。\n]+)/gi,
            /Contact[：:]?\s*([^。\n]+)/gi
          ]
        },
        requiredFields: ['teamMembers', 'roles', 'leader'],
        optionalFields: ['contact'],
        validationRules: {
          minTeamSize: 3,
          maxTeamSize: 10,
          requiredRoles: ['组长', '技术专家', '质量工程师']
        }
      },

      D2: {
        patterns: {
          problemDescription: [
            /问题描述[：:]?\s*([^D\d]+)/gi,
            /问题现象[：:]?\s*([^D\d]+)/gi,
            /Problem\s+Description[：:]?\s*([^D\d]+)/gi
          ],
          occurrence: [
            /发生时间[：:]?\s*([^。\n]+)/gi,
            /时间[：:]?\s*([^。\n]+)/gi,
            /Occurrence[：:]?\s*([^。\n]+)/gi
          ],
          impact: [
            /影响范围[：:]?\s*([^。\n]+)/gi,
            /影响[：:]?\s*([^。\n]+)/gi,
            /Impact[：:]?\s*([^。\n]+)/gi
          ],
          severity: [
            /严重程度[：:]?\s*([^。\n]+)/gi,
            /等级[：:]?\s*([^。\n]+)/gi,
            /Severity[：:]?\s*([^。\n]+)/gi
          ],
          customer: [
            /客户[：:]?\s*([^。\n]+)/gi,
            /Customer[：:]?\s*([^。\n]+)/gi
          ]
        },
        requiredFields: ['problemDescription', 'occurrence', 'impact'],
        optionalFields: ['severity', 'customer'],
        validationRules: {
          minDescriptionLength: 50,
          requiresQuantification: true,
          mustHaveTimeframe: true
        }
      },

      D3: {
        patterns: {
          interimActions: [
            /临时措施[：:]?\s*([^D\d]+)/gi,
            /应急措施[：:]?\s*([^D\d]+)/gi,
            /Interim\s+Actions?[：:]?\s*([^D\d]+)/gi
          ],
          implementation: [
            /实施时间[：:]?\s*([^。\n]+)/gi,
            /执行时间[：:]?\s*([^。\n]+)/gi,
            /Implementation[：:]?\s*([^。\n]+)/gi
          ],
          verification: [
            /效果验证[：:]?\s*([^。\n]+)/gi,
            /验证[：:]?\s*([^。\n]+)/gi,
            /Verification[：:]?\s*([^。\n]+)/gi
          ],
          responsible: [
            /负责人[：:]?\s*([^。\n]+)/gi,
            /责任人[：:]?\s*([^。\n]+)/gi,
            /Responsible[：:]?\s*([^。\n]+)/gi
          ]
        },
        requiredFields: ['interimActions', 'implementation', 'verification'],
        optionalFields: ['responsible'],
        validationRules: {
          mustBeTemporary: true,
          requiresVerification: true,
          timeframeDefined: true
        }
      },

      D4: {
        patterns: {
          rootCause: [
            /根本原因[：:]?\s*([^D\d]+)/gi,
            /根因[：:]?\s*([^D\d]+)/gi,
            /Root\s+Cause[：:]?\s*([^D\d]+)/gi
          ],
          analysisMethod: [
            /分析方法[：:]?\s*([^。\n]+)/gi,
            /方法[：:]?\s*([^。\n]+)/gi,
            /Method[：:]?\s*([^。\n]+)/gi
          ],
          evidence: [
            /证据[：:]?\s*([^。\n]+)/gi,
            /验证结果[：:]?\s*([^。\n]+)/gi,
            /Evidence[：:]?\s*([^。\n]+)/gi
          ],
          tools: [
            /工具[：:]?\s*([^。\n]+)/gi,
            /使用工具[：:]?\s*([^。\n]+)/gi,
            /Tools?[：:]?\s*([^。\n]+)/gi
          ]
        },
        requiredFields: ['rootCause', 'analysisMethod', 'evidence'],
        optionalFields: ['tools'],
        validationRules: {
          requiresSystematicAnalysis: true,
          mustHaveEvidence: true,
          knownMethods: ['5Why', '鱼骨图', 'FMEA', '因果图']
        }
      },

      D5: {
        patterns: {
          correctiveActions: [
            /永久措施[：:]?\s*([^D\d]+)/gi,
            /纠正措施[：:]?\s*([^D\d]+)/gi,
            /Corrective\s+Actions?[：:]?\s*([^D\d]+)/gi
          ],
          implementation: [
            /实施计划[：:]?\s*([^。\n]+)/gi,
            /计划[：:]?\s*([^。\n]+)/gi,
            /Plan[：:]?\s*([^。\n]+)/gi
          ],
          expectedEffect: [
            /预期效果[：:]?\s*([^。\n]+)/gi,
            /效果[：:]?\s*([^。\n]+)/gi,
            /Expected\s+Effect[：:]?\s*([^。\n]+)/gi
          ],
          verification: [
            /验证方法[：:]?\s*([^。\n]+)/gi,
            /验证[：:]?\s*([^。\n]+)/gi,
            /Verification[：:]?\s*([^。\n]+)/gi
          ]
        },
        requiredFields: ['correctiveActions', 'implementation', 'expectedEffect'],
        optionalFields: ['verification'],
        validationRules: {
          mustAddressRootCause: true,
          requiresTimeline: true,
          mustBeVerifiable: true
        }
      },

      D6: {
        patterns: {
          implementationStatus: [
            /实施状态[：:]?\s*([^。\n]+)/gi,
            /状态[：:]?\s*([^。\n]+)/gi,
            /Status[：:]?\s*([^。\n]+)/gi
          ],
          verificationResults: [
            /验证结果[：:]?\s*([^。\n]+)/gi,
            /结果[：:]?\s*([^。\n]+)/gi,
            /Results?[：:]?\s*([^。\n]+)/gi
          ],
          effectiveness: [
            /效果评估[：:]?\s*([^。\n]+)/gi,
            /评估[：:]?\s*([^。\n]+)/gi,
            /Effectiveness[：:]?\s*([^。\n]+)/gi
          ],
          completion: [
            /完成时间[：:]?\s*([^。\n]+)/gi,
            /完成[：:]?\s*([^。\n]+)/gi,
            /Completion[：:]?\s*([^。\n]+)/gi
          ]
        },
        requiredFields: ['implementationStatus', 'verificationResults', 'effectiveness'],
        optionalFields: ['completion'],
        validationRules: {
          mustShowProgress: true,
          requiresEvidence: true,
          effectivenessMeasured: true
        }
      },

      D7: {
        patterns: {
          preventiveMeasures: [
            /预防措施[：:]?\s*([^D\d]+)/gi,
            /预防[：:]?\s*([^D\d]+)/gi,
            /Prevention[：:]?\s*([^D\d]+)/gi
          ],
          systemImprovement: [
            /系统改进[：:]?\s*([^。\n]+)/gi,
            /改进[：:]?\s*([^。\n]+)/gi,
            /Improvement[：:]?\s*([^。\n]+)/gi
          ],
          processOptimization: [
            /流程优化[：:]?\s*([^。\n]+)/gi,
            /流程[：:]?\s*([^。\n]+)/gi,
            /Process[：:]?\s*([^。\n]+)/gi
          ],
          training: [
            /培训计划[：:]?\s*([^。\n]+)/gi,
            /培训[：:]?\s*([^。\n]+)/gi,
            /Training[：:]?\s*([^。\n]+)/gi
          ]
        },
        requiredFields: ['preventiveMeasures', 'systemImprovement'],
        optionalFields: ['processOptimization', 'training'],
        validationRules: {
          mustPreventRecurrence: true,
          systemicApproach: true,
          sustainabilityConsidered: true
        }
      },

      D8: {
        patterns: {
          teamContribution: [
            /团队贡献[：:]?\s*([^。\n]+)/gi,
            /贡献[：:]?\s*([^。\n]+)/gi,
            /Contribution[：:]?\s*([^。\n]+)/gi
          ],
          recognition: [
            /表彰方式[：:]?\s*([^。\n]+)/gi,
            /表彰[：:]?\s*([^。\n]+)/gi,
            /Recognition[：:]?\s*([^。\n]+)/gi
          ],
          lessonsLearned: [
            /经验总结[：:]?\s*([^。\n]+)/gi,
            /总结[：:]?\s*([^。\n]+)/gi,
            /Lessons\s+Learned[：:]?\s*([^。\n]+)/gi
          ],
          knowledgeSharing: [
            /知识分享[：:]?\s*([^。\n]+)/gi,
            /分享[：:]?\s*([^。\n]+)/gi,
            /Knowledge\s+Sharing[：:]?\s*([^。\n]+)/gi
          ]
        },
        requiredFields: ['teamContribution', 'recognition'],
        optionalFields: ['lessonsLearned', 'knowledgeSharing'],
        validationRules: {
          mustRecognizeTeam: true,
          encouragesLearning: true,
          promotesSharing: true
        }
      }
    }
  }

  /**
   * 初始化验证规则
   */
  initializeValidationRules() {
    return {
      global: {
        minDimensionsRequired: 6,
        minContentLength: 100,
        maxContentLength: 5000,
        timelineConsistency: true,
        crossReferenceCheck: true
      },
      quality: {
        completenessThreshold: 0.7,
        accuracyThreshold: 0.8,
        consistencyThreshold: 0.75,
        clarityThreshold: 0.7
      },
      business: {
        mustHaveCustomerImpact: true,
        mustHaveTimeline: true,
        mustHaveOwnership: true,
        mustHaveVerification: true
      }
    }
  }

  /**
   * 初始化质量指标
   */
  initializeQualityMetrics() {
    return {
      completeness: {
        weight: 0.3,
        calculation: 'fieldsCompleted / totalRequiredFields'
      },
      accuracy: {
        weight: 0.25,
        calculation: 'validatedFields / totalFields'
      },
      consistency: {
        weight: 0.2,
        calculation: 'consistentReferences / totalReferences'
      },
      clarity: {
        weight: 0.15,
        calculation: 'clearStatements / totalStatements'
      },
      actionability: {
        weight: 0.1,
        calculation: 'actionableItems / totalItems'
      }
    }
  }

  /**
   * 执行8D数据提取
   */
  async extract8DData(fileContent, fileType = 'text', fileName = '') {
    try {
      console.log('🔍 开始8D数据提取...')
      
      // 1. 识别是否为8D报告
      const identification = await this.analyzer.identify8DReport(fileContent, fileName)
      
      if (!identification.is8DReport) {
        throw new Error(`文件不是标准8D报告格式 (置信度: ${(identification.confidence * 100).toFixed(1)}%)`)
      }

      // 2. 解析8D内容
      const parseResult = await this.analyzer.parse8DContent(fileContent, fileType)
      
      if (!parseResult.success) {
        throw new Error(`8D内容解析失败: ${parseResult.error}`)
      }

      // 3. 执行专用数据提取
      const extractedData = this.performSpecializedExtraction(parseResult.dimensions)
      
      // 4. 执行质量验证
      const qualityAssessment = this.performQualityAssessment(extractedData)
      
      // 5. 生成提取报告
      const extractionReport = this.generateExtractionReport(
        identification,
        parseResult,
        extractedData,
        qualityAssessment
      )

      console.log('✅ 8D数据提取完成')
      
      return {
        success: true,
        identification,
        extractedData,
        qualityAssessment,
        extractionReport,
        metadata: parseResult.metadata,
        suggestions: parseResult.suggestions
      }

    } catch (error) {
      console.error('❌ 8D数据提取失败:', error)
      return {
        success: false,
        error: error.message,
        extractedData: null,
        qualityAssessment: null
      }
    }
  }

  /**
   * 执行专用数据提取
   */
  performSpecializedExtraction(dimensions) {
    const extractedData = {}
    
    Object.keys(this.extractionRules).forEach(dimension => {
      const rules = this.extractionRules[dimension]
      const dimData = dimensions[dimension]
      
      if (!dimData || !dimData.content) {
        extractedData[dimension] = this.createEmptyDimensionData(rules)
        return
      }
      
      extractedData[dimension] = this.extractDimensionData(dimData.content, rules, dimension)
    })
    
    return extractedData
  }

  /**
   * 创建空维度数据
   */
  createEmptyDimensionData(rules) {
    const data = {
      extracted: false,
      fields: {},
      quality: {
        completeness: 0,
        accuracy: 0,
        clarity: 0
      },
      issues: ['维度内容缺失']
    }

    // 初始化所有字段为null
    const allFields = rules.requiredFields.concat(rules.optionalFields)
    allFields.forEach(field => {
      data.fields[field] = null
    })

    return data
  }

  /**
   * 提取维度数据
   */
  extractDimensionData(content, rules, dimension) {
    const data = {
      extracted: true,
      fields: {},
      quality: {},
      issues: [],
      confidence: 0
    }

    // 提取所有字段
    const allFields = rules.requiredFields.concat(rules.optionalFields)
    allFields.forEach(field => {
      data.fields[field] = this.extractField(content, rules.patterns[field] || [], field)
    })

    // 评估质量
    data.quality = this.assessExtractionQuality(data.fields, rules, content)

    // 验证规则
    data.issues = this.validateExtractionRules(data.fields, rules.validationRules, dimension)

    // 计算置信度
    data.confidence = this.calculateExtractionConfidence(data.fields, data.quality, data.issues)

    return data
  }

  /**
   * 提取单个字段
   */
  extractField(content, patterns, fieldName) {
    if (!patterns || patterns.length === 0) {
      return null
    }

    for (const pattern of patterns) {
      const matches = content.match(pattern)
      if (matches && matches.length > 0) {
        // 取第一个匹配的捕获组
        const extracted = matches[0].replace(pattern, '$1').trim()
        if (extracted && extracted.length > 0) {
          return {
            value: extracted,
            confidence: this.calculateFieldConfidence(extracted, fieldName),
            source: 'pattern_match',
            pattern: pattern.toString()
          }
        }
      }
    }

    // 如果模式匹配失败，尝试关键词搜索
    return this.extractByKeywordSearch(content, fieldName)
  }

  /**
   * 通过关键词搜索提取
   */
  extractByKeywordSearch(content, fieldName) {
    const keywordMap = {
      teamMembers: ['成员', '人员', '团队'],
      roles: ['角色', '职责', '分工'],
      leader: ['组长', '负责人', '主管'],
      problemDescription: ['问题', '现象', '故障'],
      occurrence: ['时间', '发生', '出现'],
      impact: ['影响', '范围', '后果'],
      rootCause: ['原因', '根因', '起因'],
      correctiveActions: ['措施', '行动', '方案']
    }

    const keywords = keywordMap[fieldName] || []
    const sentences = content.split(/[。！？.!?]/)

    for (const sentence of sentences) {
      for (const keyword of keywords) {
        if (sentence.includes(keyword)) {
          return {
            value: sentence.trim(),
            confidence: 0.6,
            source: 'keyword_search',
            keyword: keyword
          }
        }
      }
    }

    return null
  }

  /**
   * 计算字段置信度
   */
  calculateFieldConfidence(extracted, fieldName) {
    let confidence = 0.5 // 基础置信度

    // 长度评分
    if (extracted.length > 10) confidence += 0.2
    if (extracted.length > 50) confidence += 0.1

    // 特定字段的特殊规则
    switch (fieldName) {
      case 'teamMembers':
        if (/[，,]/.test(extracted)) confidence += 0.2 // 包含分隔符
        break
      case 'occurrence':
        if (/\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/.test(extracted)) confidence += 0.3 // 包含日期
        break
      case 'rootCause':
        if (extracted.length > 30) confidence += 0.2 // 根因描述应该详细
        break
    }

    return Math.min(confidence, 1.0)
  }

  /**
   * 评估提取质量
   */
  assessExtractionQuality(fields, rules, content) {
    const quality = {
      completeness: 0,
      accuracy: 0,
      clarity: 0,
      overall: 0
    }

    // 计算完整性
    const requiredFieldsCount = rules.requiredFields.length
    const extractedRequiredFields = rules.requiredFields.filter(field =>
      fields[field] && fields[field].value
    ).length
    quality.completeness = extractedRequiredFields / requiredFieldsCount

    // 计算准确性（基于置信度）
    const allExtractedFields = Object.values(fields).filter(field => field && field.value)
    if (allExtractedFields.length > 0) {
      quality.accuracy = allExtractedFields.reduce((sum, field) =>
        sum + field.confidence, 0) / allExtractedFields.length
    }

    // 计算清晰度（基于内容长度和结构）
    quality.clarity = this.assessContentClarity(content)

    // 计算总体质量
    quality.overall = (quality.completeness * 0.4 + quality.accuracy * 0.4 + quality.clarity * 0.2)

    return quality
  }

  /**
   * 评估内容清晰度
   */
  assessContentClarity(content) {
    let clarity = 0.5

    // 检查结构化程度
    if (/[：:]/.test(content)) clarity += 0.2 // 包含冒号分隔
    if (/\d+[、.]/.test(content)) clarity += 0.1 // 包含编号
    if (/\n/.test(content)) clarity += 0.1 // 包含换行

    // 检查长度适中
    if (content.length > 50 && content.length < 500) clarity += 0.1

    return Math.min(clarity, 1.0)
  }

  /**
   * 验证提取规则
   */
  validateExtractionRules(fields, validationRules, dimension) {
    const issues = []

    if (!validationRules) return issues

    // 通用验证
    Object.keys(validationRules).forEach(rule => {
      const ruleValue = validationRules[rule]

      switch (rule) {
        case 'minTeamSize':
          if (fields.teamMembers && fields.teamMembers.value) {
            const memberCount = (fields.teamMembers.value.match(/[，,]/g) || []).length + 1
            if (memberCount < ruleValue) {
              issues.push(`团队成员数量不足，建议至少${ruleValue}人`)
            }
          }
          break

        case 'minDescriptionLength':
          if (fields.problemDescription && fields.problemDescription.value) {
            if (fields.problemDescription.value.length < ruleValue) {
              issues.push(`问题描述过于简单，建议至少${ruleValue}字`)
            }
          }
          break

        case 'requiresQuantification':
          if (fields.problemDescription && fields.problemDescription.value) {
            if (!/\d/.test(fields.problemDescription.value)) {
              issues.push('问题描述缺少量化数据')
            }
          }
          break

        case 'mustHaveTimeframe':
          if (!fields.occurrence || !fields.occurrence.value) {
            issues.push('缺少时间信息')
          }
          break

        case 'requiresSystematicAnalysis':
          if (fields.analysisMethod && fields.analysisMethod.value) {
            const knownMethods = validationRules.knownMethods || []
            const hasKnownMethod = knownMethods.some(method =>
              fields.analysisMethod.value.includes(method)
            )
            if (!hasKnownMethod) {
              issues.push('建议使用系统性分析方法（如5Why、鱼骨图等）')
            }
          }
          break
      }
    })

    return issues
  }

  /**
   * 计算提取置信度
   */
  calculateExtractionConfidence(fields, quality, issues) {
    let confidence = quality.overall

    // 根据问题数量调整置信度
    const issueCount = issues.length
    if (issueCount > 0) {
      confidence *= Math.max(0.3, 1 - (issueCount * 0.1))
    }

    // 根据字段提取成功率调整
    const totalFields = Object.keys(fields).length
    const extractedFields = Object.values(fields).filter(field => field && field.value).length
    const extractionRate = extractedFields / totalFields
    confidence = (confidence + extractionRate) / 2

    return Math.min(confidence, 1.0)
  }

  /**
   * 执行质量评估
   */
  performQualityAssessment(extractedData) {
    const assessment = {
      overall: {
        score: 0,
        grade: 'F',
        status: 'poor'
      },
      dimensions: {},
      metrics: {},
      recommendations: []
    }

    let totalScore = 0
    let dimensionCount = 0

    // 评估每个维度
    Object.keys(extractedData).forEach(dimension => {
      const dimData = extractedData[dimension]
      const dimAssessment = this.assessDimensionQuality(dimData, dimension)

      assessment.dimensions[dimension] = dimAssessment
      totalScore += dimAssessment.score
      dimensionCount++
    })

    // 计算总体评分
    assessment.overall.score = dimensionCount > 0 ? totalScore / dimensionCount : 0
    assessment.overall.grade = this.calculateGrade(assessment.overall.score)
    assessment.overall.status = this.determineStatus(assessment.overall.score)

    // 计算质量指标
    assessment.metrics = this.calculateQualityMetrics(extractedData)

    // 生成改进建议
    assessment.recommendations = this.generateQualityRecommendations(extractedData, assessment)

    return assessment
  }

  /**
   * 评估维度质量
   */
  assessDimensionQuality(dimData, dimension) {
    if (!dimData.extracted) {
      return {
        score: 0,
        grade: 'F',
        status: 'missing',
        issues: ['维度内容缺失'],
        strengths: []
      }
    }

    const assessment = {
      score: dimData.quality.overall * 100,
      grade: this.calculateGrade(dimData.quality.overall * 100),
      status: this.determineStatus(dimData.quality.overall * 100),
      issues: dimData.issues || [],
      strengths: []
    }

    // 识别优势
    if (dimData.quality.completeness > 0.8) {
      assessment.strengths.push('信息完整度高')
    }
    if (dimData.quality.accuracy > 0.8) {
      assessment.strengths.push('信息准确度高')
    }
    if (dimData.confidence > 0.8) {
      assessment.strengths.push('提取置信度高')
    }

    return assessment
  }

  /**
   * 计算等级
   */
  calculateGrade(score) {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }

  /**
   * 确定状态
   */
  determineStatus(score) {
    if (score >= 80) return 'excellent'
    if (score >= 70) return 'good'
    if (score >= 60) return 'acceptable'
    if (score >= 40) return 'poor'
    return 'critical'
  }

  /**
   * 计算质量指标
   */
  calculateQualityMetrics(extractedData) {
    const metrics = {}

    Object.keys(this.qualityMetrics).forEach(metricName => {
      const metric = this.qualityMetrics[metricName]
      metrics[metricName] = {
        value: this.calculateMetricValue(extractedData, metricName),
        weight: metric.weight,
        description: metric.calculation
      }
    })

    return metrics
  }

  /**
   * 计算指标值
   */
  calculateMetricValue(extractedData, metricName) {
    const dimensions = Object.values(extractedData)

    switch (metricName) {
      case 'completeness':
        const totalRequired = dimensions.length * 3 // 假设每个维度3个必填字段
        const completed = dimensions.reduce((sum, dim) => {
          if (!dim.extracted) return sum
          return sum + Object.values(dim.fields).filter(field => field && field.value).length
        }, 0)
        return completed / totalRequired

      case 'accuracy':
        const allFields = dimensions.reduce((acc, dim) => {
          if (!dim.extracted) return acc
          return acc.concat(Object.values(dim.fields).filter(field => field && field.value))
        }, [])
        if (allFields.length === 0) return 0
        return allFields.reduce((sum, field) => sum + field.confidence, 0) / allFields.length

      case 'consistency':
        // 简化的一致性计算
        return dimensions.filter(dim => dim.extracted && dim.issues.length === 0).length / dimensions.length

      case 'clarity':
        return dimensions.reduce((sum, dim) => sum + (dim.quality?.clarity || 0), 0) / dimensions.length

      case 'actionability':
        // 检查是否包含可执行的行动项
        const actionableDimensions = ['D3', 'D5', 'D6', 'D7']
        const actionableCount = actionableDimensions.filter(dim => {
          const dimData = extractedData[dim]
          return dimData && dimData.extracted && dimData.confidence > 0.6
        }).length
        return actionableCount / actionableDimensions.length

      default:
        return 0
    }
  }

  /**
   * 生成质量改进建议
   */
  generateQualityRecommendations(extractedData, assessment) {
    const recommendations = []

    // 基于总体评分的建议
    if (assessment.overall.score < 60) {
      recommendations.push({
        priority: 'high',
        category: '整体质量',
        description: '8D报告整体质量偏低，建议重新审视各维度内容的完整性和准确性',
        impact: '提升报告整体可信度和实用性'
      })
    }

    // 基于维度评估的建议
    Object.keys(assessment.dimensions).forEach(dimension => {
      const dimAssessment = assessment.dimensions[dimension]

      if (dimAssessment.score < 70) {
        const dimInfo = this.analyzer.reportStructure[dimension]
        recommendations.push({
          priority: dimAssessment.score < 40 ? 'high' : 'medium',
          category: `${dimension} - ${dimInfo.name}`,
          description: this.getDimensionRecommendation(dimension, dimAssessment),
          impact: `提升${dimInfo.name}维度质量`
        })
      }
    })

    // 基于质量指标的建议
    Object.keys(assessment.metrics).forEach(metricName => {
      const metric = assessment.metrics[metricName]

      if (metric.value < 0.7) {
        recommendations.push({
          priority: 'medium',
          category: `质量指标 - ${metricName}`,
          description: this.getMetricRecommendation(metricName, metric.value),
          impact: `提升${metricName}指标`
        })
      }
    })

    return recommendations.slice(0, 10) // 限制建议数量
  }

  /**
   * 获取维度建议
   */
  getDimensionRecommendation(dimension, assessment) {
    const baseRecommendations = {
      D1: '建议补充完整的团队成员信息，包括姓名、角色、联系方式和专业背景',
      D2: '建议详细描述问题现象，包括具体数据、发生频率、影响范围和客户反馈',
      D3: '建议明确临时措施的具体内容、实施时间、负责人和验证方法',
      D4: '建议使用系统性分析方法深入分析根本原因，并提供充分的验证证据',
      D5: '建议制定详细的永久纠正措施，包括实施计划、时间表和预期效果',
      D6: '建议补充措施实施的具体进度、验证结果和效果评估',
      D7: '建议建立系统性的预防措施，包括流程改进和培训计划',
      D8: '建议详细记录团队贡献和经验总结，建立知识分享机制'
    }

    let recommendation = baseRecommendations[dimension] || '建议补充更详细的信息'

    // 根据具体问题调整建议
    if (assessment.issues.includes('维度内容缺失')) {
      recommendation = `${dimension}维度内容完全缺失，` + recommendation
    } else if (assessment.issues.length > 0) {
      recommendation += `。特别注意：${assessment.issues.join('、')}`
    }

    return recommendation
  }

  /**
   * 获取指标建议
   */
  getMetricRecommendation(metricName, value) {
    const recommendations = {
      completeness: '建议补充缺失的必填字段信息，确保每个维度的关键信息完整',
      accuracy: '建议提高信息的准确性和具体性，避免模糊或不确定的表述',
      consistency: '建议检查各维度间的信息一致性，确保时间线和责任人等信息匹配',
      clarity: '建议改善内容的清晰度，使用结构化的表述方式',
      actionability: '建议增加具体的行动项和可执行的措施'
    }

    return recommendations[metricName] || '建议改善该质量指标'
  }

  /**
   * 生成提取报告
   */
  generateExtractionReport(identification, parseResult, extractedData, qualityAssessment) {
    return {
      summary: {
        documentType: '8D质量管理报告',
        confidence: identification.confidence,
        extractionSuccess: true,
        dimensionsProcessed: Object.keys(extractedData).length,
        overallQuality: qualityAssessment.overall.grade,
        processingTime: new Date().toISOString()
      },
      identification: {
        is8DReport: identification.is8DReport,
        confidence: identification.confidence,
        suggestedTemplate: identification.suggestedTemplate
      },
      extraction: {
        dimensionsExtracted: Object.keys(extractedData).filter(dim =>
          extractedData[dim].extracted
        ).length,
        totalDimensions: Object.keys(extractedData).length,
        averageConfidence: this.calculateAverageConfidence(extractedData)
      },
      quality: {
        overall: qualityAssessment.overall,
        metrics: qualityAssessment.metrics,
        topIssues: this.getTopIssues(extractedData),
        strengths: this.getStrengths(extractedData)
      },
      recommendations: qualityAssessment.recommendations.slice(0, 5)
    }
  }

  /**
   * 计算平均置信度
   */
  calculateAverageConfidence(extractedData) {
    const extractedDimensions = Object.values(extractedData).filter(dim => dim.extracted)
    if (extractedDimensions.length === 0) return 0

    return extractedDimensions.reduce((sum, dim) => sum + dim.confidence, 0) / extractedDimensions.length
  }

  /**
   * 获取主要问题
   */
  getTopIssues(extractedData) {
    const allIssues = []

    Object.keys(extractedData).forEach(dimension => {
      const dimData = extractedData[dimension]
      if (dimData.issues && dimData.issues.length > 0) {
        dimData.issues.forEach(issue => {
          allIssues.push({
            dimension,
            issue,
            severity: dimData.confidence < 0.5 ? 'high' : 'medium'
          })
        })
      }
    })

    return allIssues.slice(0, 5)
  }

  /**
   * 获取优势
   */
  getStrengths(extractedData) {
    const strengths = []

    Object.keys(extractedData).forEach(dimension => {
      const dimData = extractedData[dimension]
      if (dimData.extracted && dimData.confidence > 0.8) {
        const dimInfo = this.analyzer.reportStructure[dimension]
        strengths.push({
          dimension,
          name: dimInfo.name,
          confidence: dimData.confidence,
          description: `${dimInfo.name}维度信息提取质量高`
        })
      }
    })

    return strengths
  }
}

export default new EightDDataExtractor()
