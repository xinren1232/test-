/**
 * 用户会话管理服务
 * 实现多用户会话快速输入功能
 */

class UserSessionService {
  constructor() {
    this.sessions = new Map()
    this.quickInputTemplates = new Map()
    this.userProfiles = new Map()
    this.initializeDefaultData()
  }

  /**
   * 初始化默认数据
   */
  initializeDefaultData() {
    // 初始化快速输入模板
    this.initQuickInputTemplates()
    
    // 初始化用户配置文件
    this.initUserProfiles()
  }

  /**
   * 初始化快速输入模板
   */
  initQuickInputTemplates() {
    const templates = {
      'quality_inspector': [
        '查询{工厂}的库存情况',
        '分析{物料类型}的质量状况',
        '检查{供应商}的物料质量',
        '生成{时间范围}的质量报告',
        '统计{测试项目}的通过率',
        '查看{批次号}的测试结果'
      ],
      'production_manager': [
        '查询{工厂}的生产状态',
        '分析{项目}的进度情况',
        '检查{生产线}的效率',
        '统计{时间范围}的产量',
        '查看异常{批次}的处理情况'
      ],
      'supply_chain': [
        '查询{供应商}的交付情况',
        '分析{物料}的库存风险',
        '检查{采购订单}的状态',
        '统计{供应商}的质量表现',
        '查看{物料}的价格趋势'
      ],
      'admin': [
        '查询系统运行状态',
        '分析用户活跃度',
        '检查数据完整性',
        '生成综合运营报告',
        '查看系统性能指标'
      ]
    }

    for (const [role, templateList] of Object.entries(templates)) {
      this.quickInputTemplates.set(role, templateList)
    }
  }

  /**
   * 初始化用户配置文件
   */
  initUserProfiles() {
    const profiles = {
      'operator': {
        name: '操作员',
        permissions: ['query', 'view'],
        quickInputs: this.quickInputTemplates.get('quality_inspector'),
        defaultQueries: [
          '查询深圳工厂的库存情况',
          '分析结构件类物料的质量状况',
          '检查高风险物料批次'
        ]
      },
      'manager': {
        name: '管理员',
        permissions: ['query', 'view', 'analysis', 'report'],
        quickInputs: this.quickInputTemplates.get('production_manager'),
        defaultQueries: [
          '生成本月质量报告',
          '分析供应商表现趋势',
          '查看工厂效率对比'
        ]
      },
      'admin': {
        name: '系统管理员',
        permissions: ['query', 'view', 'analysis', 'report', 'admin'],
        quickInputs: this.quickInputTemplates.get('admin'),
        defaultQueries: [
          '查询系统运行状态',
          '分析用户活跃度',
          '生成综合运营报告'
        ]
      }
    }

    for (const [role, profile] of Object.entries(profiles)) {
      this.userProfiles.set(role, profile)
    }
  }

  /**
   * 创建用户会话
   * @param {Object} userInfo 用户信息
   * @returns {Object} 会话信息
   */
  createSession(userInfo) {
    const sessionId = `session_${userInfo.id}_${Date.now()}`
    const session = {
      sessionId,
      userId: userInfo.id,
      userName: userInfo.name,
      userRole: userInfo.role,
      department: userInfo.department,
      startTime: new Date(),
      lastActivity: new Date(),
      queryHistory: [],
      quickInputHistory: [],
      preferences: {
        autoComplete: true,
        saveHistory: true,
        maxHistorySize: 50
      },
      statistics: {
        totalQueries: 0,
        cacheHits: 0,
        avgResponseTime: 0
      }
    }

    this.sessions.set(sessionId, session)
    console.log(`👤 用户会话已创建: ${userInfo.name} (${sessionId})`)
    
    return session
  }

  /**
   * 获取用户会话
   * @param {string} sessionId 会话ID
   * @returns {Object|null} 会话信息
   */
  getSession(sessionId) {
    return this.sessions.get(sessionId)
  }

  /**
   * 更新会话活动时间
   * @param {string} sessionId 会话ID
   */
  updateSessionActivity(sessionId) {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.lastActivity = new Date()
      this.sessions.set(sessionId, session)
    }
  }

  /**
   * 添加查询到历史记录
   * @param {string} sessionId 会话ID
   * @param {string} query 查询内容
   * @param {Object} result 查询结果
   */
  addQueryToHistory(sessionId, query, result) {
    const session = this.sessions.get(sessionId)
    if (!session) return

    const historyEntry = {
      query,
      result,
      timestamp: new Date(),
      responseTime: result.responseTime || 0,
      source: result.source || 'unknown'
    }

    session.queryHistory.unshift(historyEntry)
    
    // 限制历史记录大小
    if (session.queryHistory.length > session.preferences.maxHistorySize) {
      session.queryHistory = session.queryHistory.slice(0, session.preferences.maxHistorySize)
    }

    // 更新统计信息
    session.statistics.totalQueries++
    if (result.source === 'cache') {
      session.statistics.cacheHits++
    }

    this.updateSessionActivity(sessionId)
    this.sessions.set(sessionId, session)
  }

  /**
   * 获取用户快速输入建议
   * @param {string} sessionId 会话ID
   * @param {string} partialInput 部分输入
   * @returns {Array} 建议列表
   */
  getQuickInputSuggestions(sessionId, partialInput = '') {
    const session = this.sessions.get(sessionId)
    if (!session) return []

    const userProfile = this.userProfiles.get(session.userRole)
    if (!userProfile) return []

    const suggestions = []

    // 1. 基于用户角色的模板建议
    if (userProfile.quickInputs) {
      userProfile.quickInputs.forEach(template => {
        if (template.toLowerCase().includes(partialInput.toLowerCase())) {
          suggestions.push({
            text: template,
            type: 'template',
            category: '模板建议'
          })
        }
      })
    }

    // 2. 基于历史查询的建议
    session.queryHistory.forEach(entry => {
      if (entry.query.toLowerCase().includes(partialInput.toLowerCase())) {
        suggestions.push({
          text: entry.query,
          type: 'history',
          category: '历史查询',
          lastUsed: entry.timestamp
        })
      }
    })

    // 3. 基于用户角色的默认查询
    if (userProfile.defaultQueries) {
      userProfile.defaultQueries.forEach(query => {
        if (query.toLowerCase().includes(partialInput.toLowerCase())) {
          suggestions.push({
            text: query,
            type: 'default',
            category: '推荐查询'
          })
        }
      })
    }

    // 去重并排序
    const uniqueSuggestions = suggestions.filter((item, index, self) => 
      index === self.findIndex(t => t.text === item.text)
    )

    return uniqueSuggestions.slice(0, 10) // 限制返回数量
  }

  /**
   * 添加快速输入到历史
   * @param {string} sessionId 会话ID
   * @param {string} input 输入内容
   */
  addQuickInputToHistory(sessionId, input) {
    const session = this.sessions.get(sessionId)
    if (!session) return

    // 避免重复添加
    const existingIndex = session.quickInputHistory.findIndex(item => item === input)
    if (existingIndex !== -1) {
      session.quickInputHistory.splice(existingIndex, 1)
    }

    session.quickInputHistory.unshift(input)
    
    // 限制历史记录大小
    if (session.quickInputHistory.length > 20) {
      session.quickInputHistory = session.quickInputHistory.slice(0, 20)
    }

    this.updateSessionActivity(sessionId)
    this.sessions.set(sessionId, session)
  }

  /**
   * 获取会话统计信息
   * @param {string} sessionId 会话ID
   * @returns {Object} 统计信息
   */
  getSessionStats(sessionId) {
    const session = this.sessions.get(sessionId)
    if (!session) return null

    const duration = new Date() - session.startTime
    const cacheHitRate = session.statistics.totalQueries > 0 ? 
      (session.statistics.cacheHits / session.statistics.totalQueries * 100).toFixed(2) : 0

    return {
      sessionId: session.sessionId,
      userName: session.userName,
      userRole: session.userRole,
      duration: Math.round(duration / 1000 / 60), // 分钟
      totalQueries: session.statistics.totalQueries,
      cacheHitRate: `${cacheHitRate}%`,
      lastActivity: session.lastActivity,
      queryHistorySize: session.queryHistory.length
    }
  }

  /**
   * 清理过期会话
   * @param {number} maxIdleTime 最大空闲时间（毫秒）
   */
  cleanupExpiredSessions(maxIdleTime = 24 * 60 * 60 * 1000) { // 默认24小时
    const now = new Date()
    const expiredSessions = []

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > maxIdleTime) {
        expiredSessions.push(sessionId)
      }
    }

    expiredSessions.forEach(sessionId => {
      this.sessions.delete(sessionId)
      console.log(`🗑️ 已清理过期会话: ${sessionId}`)
    })

    return expiredSessions.length
  }

  /**
   * 获取所有活跃会话
   * @returns {Array} 活跃会话列表
   */
  getActiveSessions() {
    const sessions = []
    for (const [sessionId, session] of this.sessions.entries()) {
      sessions.push({
        sessionId,
        userName: session.userName,
        userRole: session.userRole,
        startTime: session.startTime,
        lastActivity: session.lastActivity,
        totalQueries: session.statistics.totalQueries
      })
    }
    return sessions.sort((a, b) => b.lastActivity - a.lastActivity)
  }

  /**
   * 导出会话数据
   * @param {string} sessionId 会话ID
   * @returns {Object} 会话数据
   */
  exportSessionData(sessionId) {
    const session = this.sessions.get(sessionId)
    if (!session) return null

    return {
      ...session,
      exportTime: new Date()
    }
  }
}

// 创建全局实例
const userSessionService = new UserSessionService()

export default userSessionService
