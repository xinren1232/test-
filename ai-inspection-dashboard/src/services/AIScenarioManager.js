/**
 * AI场景管理器 - 管理不同业务场景的AI配置
 * 支持自定义prompt、思考方式、分析策略等
 */

export class AIScenarioManager {
  constructor() {
    this.scenarios = this.initializeScenarios()
    this.currentScenario = 'general'
  }

  /**
   * 初始化预设场景
   */
  initializeScenarios() {
    return {
      // 通用场景
      general: {
        id: 'general',
        name: '通用质量管理',
        description: '适用于一般性质量管理问答',
        icon: '🤖',
        category: 'general',
        systemPrompt: `你是IQE质量管理系统的AI智能助手，专门负责质量管理数据分析和问答。

## 核心能力：
1. 数据分析和统计
2. 质量趋势分析  
3. 问题诊断和建议
4. 报告生成

## 回复要求：
- 使用专业术语但保持易懂
- 提供具体的数据支撑
- 给出可操作的建议
- 使用Markdown格式组织内容`,
        thinkingStyle: 'systematic',
        analysisDepth: 'standard',
        responseFormat: 'markdown',
        toolPreferences: ['chart', 'analysis'],
        maxTokens: 2000,
        temperature: 0.7
      },

      // 库存管理场景
      inventory: {
        id: 'inventory',
        name: '库存管理专家',
        description: '专注于库存分析、风险评估、优化建议',
        icon: '📦',
        category: 'business',
        systemPrompt: `你是专业的库存管理专家，具有丰富的供应链和仓储管理经验。

## 专业领域：
1. 库存水平分析和优化
2. 风险库存识别和处理
3. 供应商表现评估
4. 库存周转率分析
5. 安全库存计算

## 分析重点：
- 关注库存周转效率
- 识别滞销和短缺风险
- 评估供应商可靠性
- 提供库存优化策略

## 回复风格：
- 数据驱动的分析
- 具体的改进建议
- 风险等级评估
- ROI计算和成本分析`,
        thinkingStyle: 'analytical',
        analysisDepth: 'deep',
        responseFormat: 'structured',
        toolPreferences: ['pie_chart', 'trend_analysis', 'risk_assessment'],
        maxTokens: 2500,
        temperature: 0.6
      },

      // 质量检测场景
      quality: {
        id: 'quality',
        name: '质量检测专家',
        description: '专注于质量分析、缺陷诊断、改进措施',
        icon: '🔍',
        category: 'business',
        systemPrompt: `你是资深的质量管理专家，专精于质量控制和持续改进。

## 专业领域：
1. 质量数据统计分析
2. 缺陷模式识别
3. 根因分析(RCA)
4. 质量改进建议
5. 质量成本分析

## 分析方法：
- 使用统计质量控制(SQC)方法
- 应用帕累托分析
- 进行趋势分析
- 实施PDCA循环思维

## 回复特点：
- 基于数据的客观分析
- 提供根因分析
- 给出具体改进措施
- 量化质量成本影响`,
        thinkingStyle: 'methodical',
        analysisDepth: 'deep',
        responseFormat: 'analytical',
        toolPreferences: ['control_chart', 'pareto_chart', 'fishbone'],
        maxTokens: 3000,
        temperature: 0.5
      },

      // 生产管理场景
      production: {
        id: 'production',
        name: '生产管理专家',
        description: '专注于生产效率、工艺优化、产能分析',
        icon: '🏭',
        category: 'business',
        systemPrompt: `你是经验丰富的生产管理专家，专注于制造业生产优化。

## 专业领域：
1. 生产效率分析
2. 工艺流程优化
3. 产能规划和调度
4. 设备效率(OEE)分析
5. 生产成本控制

## 分析视角：
- 关注生产效率指标
- 识别生产瓶颈
- 评估工艺稳定性
- 优化资源配置

## 回复重点：
- 提供效率提升方案
- 分析产能利用率
- 识别改进机会
- 量化效益预期`,
        thinkingStyle: 'efficiency_focused',
        analysisDepth: 'operational',
        responseFormat: 'actionable',
        toolPreferences: ['gantt_chart', 'efficiency_chart', 'capacity_analysis'],
        maxTokens: 2500,
        temperature: 0.6
      },

      // 风险管理场景
      risk: {
        id: 'risk',
        name: '风险管理专家',
        description: '专注于风险识别、评估、预警和控制',
        icon: '⚠️',
        category: 'management',
        systemPrompt: `你是专业的风险管理专家，具备敏锐的风险识别和评估能力。

## 专业领域：
1. 质量风险识别和评估
2. 供应链风险分析
3. 合规风险管控
4. 预警机制设计
5. 应急响应策略

## 分析框架：
- 使用风险矩阵评估
- 应用FMEA分析方法
- 建立风险指标体系
- 制定缓解措施

## 回复特色：
- 突出风险等级
- 提供预警建议
- 制定应对策略
- 建立监控机制`,
        thinkingStyle: 'risk_oriented',
        analysisDepth: 'comprehensive',
        responseFormat: 'risk_focused',
        toolPreferences: ['risk_matrix', 'alert_dashboard', 'trend_monitoring'],
        maxTokens: 2800,
        temperature: 0.4
      },

      // 决策支持场景
      decision: {
        id: 'decision',
        name: '决策支持专家',
        description: '提供数据驱动的决策建议和战略分析',
        icon: '🎯',
        category: 'management',
        systemPrompt: `你是高级管理顾问，专注于为管理层提供数据驱动的决策支持。

## 专业能力：
1. 战略数据分析
2. 多维度对比评估
3. ROI和成本效益分析
4. 趋势预测和建模
5. 决策方案评估

## 分析方法：
- 多角度数据对比
- 量化分析和建模
- 情景分析和预测
- 风险收益评估

## 回复风格：
- 高层次战略视角
- 数据支撑的结论
- 多方案对比分析
- 明确的行动建议`,
        thinkingStyle: 'strategic',
        analysisDepth: 'executive',
        responseFormat: 'executive_summary',
        toolPreferences: ['dashboard', 'comparison_chart', 'forecast_model'],
        maxTokens: 3500,
        temperature: 0.7
      }
    }
  }

  /**
   * 获取所有场景
   */
  getAllScenarios() {
    return Object.values(this.scenarios)
  }

  /**
   * 获取场景分类
   */
  getScenarioCategories() {
    const categories = {}
    Object.values(this.scenarios).forEach(scenario => {
      if (!categories[scenario.category]) {
        categories[scenario.category] = []
      }
      categories[scenario.category].push(scenario)
    })
    return categories
  }

  /**
   * 获取指定场景配置
   */
  getScenario(scenarioId) {
    return this.scenarios[scenarioId] || this.scenarios.general
  }

  /**
   * 设置当前场景
   */
  setCurrentScenario(scenarioId) {
    if (this.scenarios[scenarioId]) {
      this.currentScenario = scenarioId
      return true
    }
    return false
  }

  /**
   * 获取当前场景配置
   */
  getCurrentScenario() {
    return this.getScenario(this.currentScenario)
  }

  /**
   * 添加自定义场景
   */
  addCustomScenario(scenario) {
    if (!scenario.id || this.scenarios[scenario.id]) {
      throw new Error('场景ID无效或已存在')
    }

    this.scenarios[scenario.id] = {
      ...scenario,
      category: scenario.category || 'custom',
      isCustom: true
    }

    return true
  }

  /**
   * 更新场景配置
   */
  updateScenario(scenarioId, updates) {
    if (!this.scenarios[scenarioId]) {
      throw new Error('场景不存在')
    }

    this.scenarios[scenarioId] = {
      ...this.scenarios[scenarioId],
      ...updates
    }

    return this.scenarios[scenarioId]
  }

  /**
   * 删除自定义场景
   */
  deleteScenario(scenarioId) {
    const scenario = this.scenarios[scenarioId]
    if (!scenario || !scenario.isCustom) {
      throw new Error('只能删除自定义场景')
    }

    delete this.scenarios[scenarioId]
    
    // 如果删除的是当前场景，切换到通用场景
    if (this.currentScenario === scenarioId) {
      this.currentScenario = 'general'
    }

    return true
  }

  /**
   * 根据问题内容推荐场景
   */
  recommendScenario(question) {
    const questionLower = question.toLowerCase()
    
    // 场景关键词映射
    const scenarioKeywords = {
      inventory: ['库存', '仓库', '物料', '供应商', '入库', '出库', '库存量'],
      quality: ['质量', '检测', '测试', '缺陷', '不良', '合格率', '质检'],
      production: ['生产', '产线', '制造', '工艺', '产能', '效率', '产量'],
      risk: ['风险', '异常', '预警', '问题', '故障', '事故', '隐患'],
      decision: ['决策', '对比', '选择', '评估', '分析', '建议', '策略']
    }

    let maxScore = 0
    let recommendedScenario = 'general'

    Object.entries(scenarioKeywords).forEach(([scenarioId, keywords]) => {
      const score = keywords.reduce((sum, keyword) => {
        return sum + (questionLower.includes(keyword) ? 1 : 0)
      }, 0)

      if (score > maxScore) {
        maxScore = score
        recommendedScenario = scenarioId
      }
    })

    return {
      scenarioId: recommendedScenario,
      confidence: maxScore > 0 ? (maxScore / 3) * 100 : 0,
      scenario: this.getScenario(recommendedScenario)
    }
  }

  /**
   * 保存配置到本地存储
   */
  saveToStorage() {
    const customScenarios = {}
    Object.entries(this.scenarios).forEach(([id, scenario]) => {
      if (scenario.isCustom) {
        customScenarios[id] = scenario
      }
    })

    localStorage.setItem('aiScenarios', JSON.stringify({
      customScenarios,
      currentScenario: this.currentScenario
    }))
  }

  /**
   * 从本地存储加载配置
   */
  loadFromStorage() {
    try {
      const saved = localStorage.getItem('aiScenarios')
      if (saved) {
        const { customScenarios, currentScenario } = JSON.parse(saved)
        
        // 加载自定义场景
        Object.entries(customScenarios || {}).forEach(([id, scenario]) => {
          this.scenarios[id] = scenario
        })

        // 设置当前场景
        if (currentScenario && this.scenarios[currentScenario]) {
          this.currentScenario = currentScenario
        }
      }
    } catch (error) {
      console.error('加载AI场景配置失败:', error)
    }
  }
}

// 创建单例实例
export const aiScenarioManager = new AIScenarioManager()
export default aiScenarioManager
