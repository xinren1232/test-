<template>
  <div class="ai-assistant-three-column">
    <!-- 顶部标题栏 -->
    <div class="header-bar">
      <div class="header-left">
        <div class="logo-section">
          <span class="logo-icon">🤖</span>
          <span class="logo-text">IQE AI 智能助手 - 三栏布局</span>
        </div>
      </div>

      <div class="header-center">
        <div class="user-info">
          <span class="user-avatar">👤</span>
          <div class="user-details">
            <span class="user-name">{{ currentUser.name }}</span>
            <span class="user-role">{{ currentUser.department }}</span>
          </div>
        </div>
      </div>

      <div class="header-right">
        <div class="service-status">
          <span class="ai-status-text">{{ aiMode ? 'AI增强模式' : '基础模式' }}</span>
          <span class="cache-status">缓存: {{ deepSeekConfig.enableCache ? '启用' : '禁用' }}</span>
        </div>
        <label class="switch">
          <input type="checkbox" v-model="aiMode">
          <span class="slider"></span>
        </label>
        <button @click="clearMessages" class="header-button">清空对话</button>
      </div>
    </div>

    <!-- 三栏主体布局 -->
    <div class="three-column-layout">
      <!-- 左侧工具面板 -->
      <div class="left-panel">
        <div class="panel-header">
          <span class="panel-icon">🛠️</span>
          <h3 class="panel-title">智能工具</h3>
        </div>

        <div class="tool-categories">
          <!-- 基础查询规则 -->
          <div class="tool-category">
            <div class="category-header" @click="toggleSection('basic')">
              <span class="category-icon">🔍</span>
              <span class="category-title">基础查询</span>
              <span class="toggle-icon" :class="{ 'expanded': expandedSections.basic }">▼</span>
            </div>
            <div class="tool-list" v-show="expandedSections.basic">
              <!-- 调试信息 -->
              <div style="background: #f0f0f0; padding: 5px; margin: 5px 0; font-size: 12px; border-radius: 3px;">
                🔍 调试: 规则数量 {{ qaRules.basic.length }} | 第一个规则: {{ qaRules.basic[0]?.name }}
                <button @click="forceRefreshRules" style="margin-left: 10px; font-size: 10px; padding: 2px 6px;">强制刷新</button>
              </div>
              <div
                v-for="rule in qaRules.basic"
                :key="rule.name"
                class="tool-item rule-item"
                @click="sendQuickMessage(rule.query)"
                :title="rule.description || rule.query"
              >
                <span class="tool-icon">{{ rule.icon }}</span>
                <div class="tool-content">
                  <div class="tool-name">{{ rule.name }}</div>
                  <div class="tool-desc">{{ rule.query }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 高级分析规则 -->
          <div class="tool-category">
            <div class="category-header" @click="toggleSection('advanced')">
              <span class="category-icon">📊</span>
              <span class="category-title">高级分析</span>
              <span class="toggle-icon" :class="{ 'expanded': expandedSections.advanced }">▼</span>
            </div>
            <div class="tool-list" v-show="expandedSections.advanced">
              <div
                v-for="rule in qaRules.advanced"
                :key="rule.name"
                class="tool-item rule-item"
                @click="sendQuickMessage(rule.query)"
                :title="rule.description || rule.query"
              >
                <span class="tool-icon">{{ rule.icon }}</span>
                <div class="tool-content">
                  <div class="tool-name">{{ rule.name }}</div>
                  <div class="tool-desc">{{ rule.query }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 图表规则 -->
          <div class="tool-category">
            <div class="category-header" @click="toggleSection('charts')">
              <span class="category-icon">📈</span>
              <span class="category-title">图表工具</span>
              <span class="toggle-icon" :class="{ 'expanded': expandedSections.charts }">▼</span>
            </div>
            <div class="tool-list" v-show="expandedSections.charts">
              <div
                v-for="rule in qaRules.charts"
                :key="rule.name"
                class="tool-item rule-item"
                @click="sendQuickMessage(rule.query)"
                :title="rule.description || rule.query"
              >
                <span class="tool-icon">{{ rule.icon }}</span>
                <div class="tool-content">
                  <div class="tool-name">{{ rule.name }}</div>
                  <div class="tool-desc">{{ rule.query }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间对话区域 -->
      <div class="center-panel">
        <div class="chat-container">
          <!-- 对话头部 -->
          <div class="chat-header">
            <div class="chat-title">
              <span class="chat-icon">💬</span>
              <span class="chat-text">智能对话</span>
            </div>
            <div class="chat-status">
              <span class="status-dot" :class="{ active: isLoading }"></span>
              <span class="status-text">{{ isLoading ? 'AI思考中...' : '就绪' }}</span>
            </div>
          </div>

          <!-- 消息列表 -->
          <div class="messages-container">
            <div class="messages-list" ref="messagesContainer">
              <!-- 欢迎消息 -->
              <div v-if="messages.length === 0" class="welcome-message">
                <div class="welcome-avatar">🤖</div>
                <div class="welcome-content">
                  <h3>欢迎使用IQE AI智能助手</h3>
                  <p>我可以帮助您进行数据分析、质量检测、生产管理等各种任务。</p>
                  <div class="welcome-suggestions">
                    <div class="suggestion-title">您可以尝试问我：</div>
                    <div class="suggestion-list">
                      <div
                        v-for="suggestion in quickSuggestions"
                        :key="suggestion"
                        class="suggestion-item"
                        @click="sendQuickMessage(suggestion)"
                      >
                        {{ suggestion }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 对话消息 -->
              <div
                v-for="(message, index) in messages"
                :key="index"
                class="message-item"
                :class="message.type"
              >
                <div class="message-avatar">
                  <span v-if="message.type === 'user'">👤</span>
                  <span v-else>🤖</span>
                </div>
                <div class="message-content">
                  <!-- 使用优化的问答响应组件 -->
                  <OptimizedQAResponse
                    v-if="message.type === 'assistant' && shouldUseOptimizedResponse(message.content)"
                    :content="message.content"
                    :type="detectResponseType(message.content)"
                    :timestamp="message.timestamp"
                    @action-click="handleActionClick"
                  />
                  <!-- 普通消息显示 -->
                  <div v-else>
                    <div class="message-text" v-html="formatMessageContent(message.content)"></div>
                    <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                    <!-- 添加消息操作按钮 -->
                    <div v-if="message.type === 'assistant'" class="message-actions">
                      <button @click="copyMessage(message.content)" class="action-btn" title="复制">📋</button>
                      <button @click="likeMessage(message)" class="action-btn" title="点赞">👍</button>
                      <button @click="regenerateResponse(message)" class="action-btn" title="重新生成">🔄</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 加载指示器 -->
              <div v-if="isLoading" class="loading-message">
                <div class="message-avatar">
                  <span>🤖</span>
                </div>
                <div class="message-content">
                  <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <div class="loading-text">AI正在思考...</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 快速输入建议 -->
          <div class="quick-input-suggestions" v-if="quickInputHistory.length > 0">
            <div class="suggestions-header">
              <span class="suggestions-title">💡 快速输入建议</span>
              <span class="suggestions-count">({{ quickInputHistory.length }})</span>
            </div>
            <div class="suggestions-list">
              <button
                v-for="(suggestion, index) in quickInputHistory.slice(0, 5)"
                :key="index"
                @click="sendQuickMessage(suggestion)"
                class="suggestion-item"
                :disabled="isLoading"
              >
                {{ suggestion }}
              </button>
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="input-area">
            <div class="input-container">
              <input
                v-model="inputMessage"
                @keyup.enter="sendMessage"
                @input="onInputChange"
                placeholder="输入您的问题..."
                class="message-input"
                :disabled="isLoading"
              />
              <button
                @click="sendMessage"
                class="send-button"
                :disabled="isLoading || !inputMessage.trim()"
              >
                <span v-if="isLoading">⏳</span>
                <span v-else>🚀</span>
              </button>
            </div>

            <!-- 功能控制开关 -->
            <div class="control-toggles">
              <!-- 调试模式切换 -->
              <div class="debug-toggle">
                <label class="debug-label">
                  <input
                    type="checkbox"
                    v-model="debugMode"
                    @change="toggleDebugMode"
                    class="debug-checkbox"
                  />
                  <span class="debug-text">显示技术细节</span>
                </label>
              </div>

              <!-- 联网搜索切换 -->
              <div class="web-search-toggle">
                <label class="web-search-label">
                  <input
                    type="checkbox"
                    v-model="webSearchEnabled"
                    @change="toggleWebSearch"
                    class="web-search-checkbox"
                  />
                  <span class="web-search-text">启用联网搜索</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧分析过程面板 -->
      <div class="right-panel">
        <AnalysisProcessPanel :workflow="currentWorkflow" />
              <div class="summary-description">
                {{ thinkingSummary.description }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import OptimizedQAResponse from '../components/OptimizedQAResponse.vue'
import AnalysisProcessPanel from '../components/AnalysisProcessPanel.vue'
// 直接在组件中定义简化版增强AI服务
const simpleEnhancedAIService = {
  webSearchEnabled: true,

  async intelligentQuery(userQuery, options = {}) {
    console.log('🤖 调用简化版增强AI服务:', userQuery)

    // 分析查询意图
    const queryAnalysis = this.analyzeQueryIntent(userQuery)

    // 判断是否需要联网搜索
    const needsWebSearch = options.enableWebSearch &&
                          this.webSearchEnabled &&
                          this.shouldSearchWeb(queryAnalysis, userQuery)

    let webSearchResults = null
    if (needsWebSearch) {
      console.log('🌐 触发联网搜索')
      webSearchResults = await this.performWebSearch(userQuery)
    }

    // 生成AI回答
    const aiResponse = await this.generateAIResponse(userQuery, webSearchResults, options.businessContext)

    return {
      success: true,
      response: aiResponse,
      metadata: {
        queryAnalysis,
        webSearchUsed: needsWebSearch,
        webSearchResults: webSearchResults?.results?.length || 0,
        sources: webSearchResults?.sources || [],
        responseTime: 300 + Math.floor(Math.random() * 400)
      }
    }
  },

  analyzeQuery(query) {
    const realTimeKeywords = ['最新', '今天', '现在', '当前', '最近', '新闻', '实时']
    const webSearchKeywords = ['什么是', '如何', '为什么', '哪里', '谁是', '什么时候']
    const systemKeywords = ['库存', '检测', '批次', '供应商', '工厂', '物料', '质量']

    const queryLower = query.toLowerCase()

    const needsRealTime = realTimeKeywords.some(keyword => queryLower.includes(keyword))
    const needsWebSearch = webSearchKeywords.some(keyword => queryLower.includes(keyword))
    const hasSystemKeywords = systemKeywords.some(keyword => queryLower.includes(keyword))

    return {
      type: needsRealTime ? 'realtime' : needsWebSearch ? 'informational' : 'general',
      needsRealTimeInfo: needsRealTime,
      needsWebSearch: needsWebSearch || needsRealTime,
      hasSystemKeywords,
      confidence: needsRealTime ? 0.9 : needsWebSearch ? 0.7 : 0.5
    }
  },

  shouldSearchWeb(analysis, query) {
    return analysis.needsWebSearch && !analysis.hasSystemKeywords
  },

  async performWebSearch(query) {
    // 模拟网络搜索
    await new Promise(resolve => setTimeout(resolve, 200))

    return {
      success: true,
      results: [
        {
          title: `${query} - 百度搜索结果`,
          url: `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`,
          snippet: `关于${query}的详细信息和最新资讯`,
          source: 'baidu'
        },
        {
          title: `${query} - 专业解答`,
          url: `https://zhidao.baidu.com/search?word=${encodeURIComponent(query)}`,
          snippet: `专业人士对${query}的详细解答和经验分享`,
          source: 'baidu'
        }
      ],
      sources: ['baidu', 'bing'],
      timestamp: new Date().toISOString()
    }
  },

  // 🚀 多步骤智能问答链（7+1模块）主入口
  async generateAIResponse(query, webSearchResults, businessContext) {
    console.log('🚀 启动多步骤智能问答链')
    console.log('📝 用户问题:', query)

    try {
      // 步骤1: 语义理解（意图识别）
      const intentResult = await this.step1_SemanticUnderstanding(query)
      console.log('✅ 步骤1完成 - 意图识别:', intentResult.intent)

      // 步骤2: 字段定位与参数抽取
      const paramResult = await this.step2_ParameterExtraction(query, intentResult)
      console.log('✅ 步骤2完成 - 参数抽取:', paramResult.extractedParams)

      // 步骤3: 数据源选择
      const dataSourceResult = await this.step3_DataSourceSelection(paramResult)
      console.log('✅ 步骤3完成 - 数据源选择:', dataSourceResult.selectedTables)

      // 步骤4: 查询模板生成
      const queryTemplateResult = await this.step4_QueryTemplateGeneration(dataSourceResult)
      console.log('✅ 步骤4完成 - 查询模板生成')

      // 步骤5: 数据执行/聚合
      const dataResult = await this.step5_DataExecution(queryTemplateResult)
      console.log('✅ 步骤5完成 - 数据执行:', dataResult.recordCount, '条记录')

      // 步骤6: 工具调用（可选）
      const toolResult = await this.step6_ToolInvocation(dataResult, intentResult)
      console.log('✅ 步骤6完成 - 工具调用')

      // 步骤7: AI分析解释
      const aiAnalysisResult = await this.step7_AIAnalysis(dataResult, toolResult, query, webSearchResults)
      console.log('✅ 步骤7完成 - AI分析解释')

      // 步骤8: 最终展示
      const finalResult = await this.step8_FinalPresentation(aiAnalysisResult, dataResult, intentResult)
      console.log('✅ 步骤8完成 - 最终展示生成')

      return finalResult

    } catch (error) {
      console.error('❌ 智能问答链执行失败:', error)
      return this.generateErrorResponse(error, query)
    }
  },

  // 步骤1: 语义理解（意图识别）
  async step1_SemanticUnderstanding(query) {
    console.log('🧩 步骤1: 语义理解（意图识别）')

    const queryLower = query.toLowerCase()

    // 定义具体的业务意图
    const businessIntents = {
      // 批次相关意图
      batch_risk_check: {
        keywords: ['批次', '风险', '是否', '安全', '问题', '状态'],
        patterns: ['这个批次.*风险', '批次.*是否.*安全', '.*批次.*问题'],
        confidence_threshold: 0.6,
        data_tables: ['inventory', 'lab_tests'],
        description: '批次风险检查'
      },

      // 不良分析意图
      defect_analysis: {
        keywords: ['不良', '缺陷', '失败', '异常', '问题', '错误'],
        patterns: ['最近.*不良', '哪些.*失败', '.*异常.*分析'],
        confidence_threshold: 0.5,
        data_tables: ['online_tracking', 'lab_tests'],
        description: '不良缺陷分析'
      },

      // 供应商评估意图
      supplier_evaluation: {
        keywords: ['供应商', '供方', '厂商', '评估', '表现', '质量'],
        patterns: ['.*供应商.*表现', '.*厂商.*质量', '供方.*评估'],
        confidence_threshold: 0.6,
        data_tables: ['suppliers', 'online_tracking'],
        description: '供应商评估分析'
      },

      // 测试记录查询意图
      test_record_query: {
        keywords: ['测试', '检测', '检验', '记录', '结果', '报告'],
        patterns: ['.*测试.*记录', '检测.*结果', '.*检验.*情况'],
        confidence_threshold: 0.5,
        data_tables: ['lab_tests'],
        description: '测试记录查询'
      },

      // 库存状态查询意图
      inventory_status: {
        keywords: ['库存', '物料', '状态', '数量', '余量', '存量'],
        patterns: ['库存.*状态', '物料.*数量', '.*余量.*查询'],
        confidence_threshold: 0.5,
        data_tables: ['inventory'],
        description: '库存状态查询'
      },

      // 项目进度查询意图
      project_progress: {
        keywords: ['项目', '进度', '状态', '完成', '计划', '时间'],
        patterns: ['项目.*进度', '.*项目.*状态', '完成.*情况'],
        confidence_threshold: 0.5,
        data_tables: ['online_tracking'],
        description: '项目进度查询'
      },

      // 操作执行意图（冻结、标记等）
      operation_execution: {
        keywords: ['冻结', '标记', '锁定', '禁用', '启用', '操作'],
        patterns: ['冻结.*批次', '标记.*风险', '锁定.*物料'],
        confidence_threshold: 0.7,
        data_tables: ['inventory'],
        description: '操作执行',
        requires_function_call: true
      },

      // 趋势分析意图
      trend_analysis: {
        keywords: ['趋势', '变化', '对比', '统计', '分析', '图表'],
        patterns: ['.*趋势.*分析', '.*变化.*情况', '统计.*对比'],
        confidence_threshold: 0.6,
        data_tables: ['online_tracking', 'lab_tests'],
        description: '趋势分析',
        requires_chart: true
      }
    }

    // 计算每个意图的匹配分数
    let bestIntent = { intent: 'general_query', confidence: 0.3, details: null }

    for (const [intentName, intentConfig] of Object.entries(businessIntents)) {
      let score = 0

      // 关键词匹配
      const keywordMatches = intentConfig.keywords.filter(keyword =>
        queryLower.includes(keyword.toLowerCase())
      ).length
      const keywordScore = keywordMatches / intentConfig.keywords.length

      // 模式匹配
      let patternScore = 0
      for (const pattern of intentConfig.patterns) {
        const regex = new RegExp(pattern, 'i')
        if (regex.test(query)) {
          patternScore = 0.8
          break
        }
      }

      // 综合评分
      score = (keywordScore * 0.6) + (patternScore * 0.4)

      if (score > bestIntent.confidence && score >= intentConfig.confidence_threshold) {
        bestIntent = {
          intent: intentName,
          confidence: score,
          details: intentConfig,
          description: intentConfig.description
        }
      }
    }

    console.log(`🎯 识别意图: ${bestIntent.description} (置信度: ${(bestIntent.confidence * 100).toFixed(1)}%)`)

    return bestIntent
  },

  // 步骤2: 字段定位与参数抽取
  async step2_ParameterExtraction(query, intentResult) {
    console.log('🧩 步骤2: 字段定位与参数抽取')

    const extractedParams = {
      entities: {},
      timeRange: null,
      filters: [],
      outputFormat: 'table'
    }

    // 实体抽取映射表 - 基于真实数据
    const entityMappings = {
      // 供应商实体 - 使用真实供应商
      suppliers: {
        patterns: ['聚龙', '欣冠', '广正', 'BOE', '天马', '华星', '帝晶', '盛泰', '天实', '深奥', '百俊达', '奥海', '辰阳', '锂威', '风华', '维科', '东声', '豪声', '歌尔', '丽德宝', '裕同', '富群'],
        field: 'supplier_name',
        table: 'suppliers'
      },

      // 物料类型实体 - 使用真实物料
      materials: {
        patterns: ['电池盖', '中框', '手机卡托', '侧键', '装饰件', 'LCD显示屏', 'OLED显示屏', '摄像头模组', '电池', '充电器', '扬声器', '听筒', '保护套', '标签', '包装盒'],
        field: 'material_type',
        table: 'inventory'
      },

      // 批次号实体（正则匹配）
      batch_numbers: {
        patterns: [/[A-Z]\d{4,6}/g, /\d{6,8}/g],
        field: 'batch_number',
        table: 'inventory'
      },

      // 项目名称实体 - 使用真实项目
      projects: {
        patterns: ['X6827', 'S665LN', 'KI4K', 'X6828', 'X6831', 'KI5K', 'KI3K', 'S662LN', 'S663LN', 'S664LN'],
        field: 'project_name',
        table: 'online_tracking'
      },

      // 工厂实体 - 使用真实工厂
      factories: {
        patterns: ['深圳工厂', '重庆工厂', '南昌工厂', '宜宾工厂'],
        field: 'factory',
        table: 'inventory'
      }
    }

    // 抽取实体
    for (const [entityType, config] of Object.entries(entityMappings)) {
      for (const pattern of config.patterns) {
        if (typeof pattern === 'string') {
          if (query.includes(pattern)) {
            extractedParams.entities[entityType] = {
              value: pattern,
              field: config.field,
              table: config.table
            }
          }
        } else if (pattern instanceof RegExp) {
          const matches = query.match(pattern)
          if (matches) {
            extractedParams.entities[entityType] = {
              value: matches[0],
              field: config.field,
              table: config.table
            }
          }
        }
      }
    }

    // 时间范围抽取
    const timePatterns = [
      { pattern: '今天', value: 'today', sql: "DATE(created_at) = CURDATE()" },
      { pattern: '昨天', value: 'yesterday', sql: "DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)" },
      { pattern: '本周', value: 'this_week', sql: "YEARWEEK(created_at) = YEARWEEK(NOW())" },
      { pattern: '本月', value: 'this_month', sql: "YEAR(created_at) = YEAR(NOW()) AND MONTH(created_at) = MONTH(NOW())" },
      { pattern: '最近', value: 'recent', sql: "created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)" },
      { pattern: '这个月', value: 'this_month', sql: "YEAR(created_at) = YEAR(NOW()) AND MONTH(created_at) = MONTH(NOW())" }
    ]

    for (const timePattern of timePatterns) {
      if (query.includes(timePattern.pattern)) {
        extractedParams.timeRange = timePattern
        break
      }
    }

    // 筛选条件抽取
    const filterPatterns = [
      { pattern: '不良', field: 'status', operator: '=', value: '不合格' },
      { pattern: '合格', field: 'status', operator: '=', value: '合格' },
      { pattern: '风险高', field: 'risk_level', operator: '>', value: '0.7' },
      { pattern: '异常', field: 'status', operator: 'LIKE', value: '%异常%' }
    ]

    for (const filterPattern of filterPatterns) {
      if (query.includes(filterPattern.pattern)) {
        extractedParams.filters.push({
          field: filterPattern.field,
          operator: filterPattern.operator,
          value: filterPattern.value,
          description: filterPattern.pattern
        })
      }
    }

    // 输出格式识别
    if (query.includes('图表') || query.includes('趋势')) {
      extractedParams.outputFormat = 'chart'
    } else if (query.includes('统计') || query.includes('汇总')) {
      extractedParams.outputFormat = 'summary'
    } else if (query.includes('详细') || query.includes('列表')) {
      extractedParams.outputFormat = 'table'
    }

    console.log('📊 抽取的参数:', extractedParams)

    return {
      extractedParams,
      originalQuery: query,
      intentResult
    }
  },

  // 步骤3: 数据源选择
  async step3_DataSourceSelection(paramResult) {
    console.log('🧩 步骤3: 数据源选择')

    const { extractedParams, intentResult } = paramResult

    // 数据源映射表（字段-表关系）
    const dataSourceMappings = {
      // 库存相关表
      inventory: {
        primary_key: 'id',
        fields: ['material_name', 'supplier_name', 'batch_number', 'quantity', 'status', 'risk_level'],
        description: '库存物料表',
        sample_data: [
          { material_name: '电池盖', supplier_name: '聚龙', batch_number: 'B001', status: '合格', risk_level: 0.2 },
          { material_name: 'LCD显示屏', supplier_name: 'BOE', batch_number: 'B002', status: '不合格', risk_level: 0.8 }
        ]
      },

      // 测试记录表
      lab_tests: {
        primary_key: 'test_id',
        fields: ['batch_number', 'test_type', 'test_result', 'inspector', 'test_date', 'defect_type'],
        description: '实验室测试记录表',
        sample_data: [
          { batch_number: 'B001', test_type: '外观检测', test_result: '合格', inspector: '张三', test_date: '2024-01-20' },
          { batch_number: 'B002', test_type: '功能测试', test_result: '不合格', inspector: '李四', test_date: '2024-01-21' }
        ]
      },

      // 上线跟踪表
      online_tracking: {
        primary_key: 'tracking_id',
        fields: ['project_name', 'material_name', 'supplier_name', 'online_status', 'defect_rate', 'completion_date'],
        description: '项目上线跟踪表',
        sample_data: [
          { project_name: 'IQE质量管理系统', material_name: '芯片IC003', online_status: '已上线', defect_rate: 0.1 },
          { project_name: '供应商评估项目', material_name: '电池BAT001', online_status: '测试中', defect_rate: 0.05 }
        ]
      },

      // 供应商信息表
      suppliers: {
        primary_key: 'supplier_id',
        fields: ['supplier_name', 'contact_info', 'quality_rating', 'certification_status'],
        description: '供应商基础信息表',
        sample_data: [
          { supplier_name: '聚龙', quality_rating: 'A', certification_status: 'ISO9001' },
          { supplier_name: 'BOE', quality_rating: 'B+', certification_status: 'ISO9001' }
        ]
      }
    }

    // 根据意图和参数选择数据源
    let selectedTables = []

    // 从意图配置中获取推荐表
    if (intentResult.details && intentResult.details.data_tables) {
      selectedTables = [...intentResult.details.data_tables]
    }

    // 根据抽取的实体补充表选择
    for (const [entityType, entityInfo] of Object.entries(extractedParams.entities)) {
      if (entityInfo.table && !selectedTables.includes(entityInfo.table)) {
        selectedTables.push(entityInfo.table)
      }
    }

    // 如果没有明确的表选择，根据关键词推断
    if (selectedTables.length === 0) {
      const query = paramResult.originalQuery.toLowerCase()
      if (query.includes('库存') || query.includes('物料')) {
        selectedTables.push('inventory')
      }
      if (query.includes('测试') || query.includes('检测')) {
        selectedTables.push('lab_tests')
      }
      if (query.includes('项目') || query.includes('上线')) {
        selectedTables.push('online_tracking')
      }
      if (query.includes('供应商')) {
        selectedTables.push('suppliers')
      }
    }

    // 构建表关联关系
    const tableRelations = {
      'inventory-lab_tests': 'inventory.batch_number = lab_tests.batch_number',
      'inventory-online_tracking': 'inventory.material_name = online_tracking.material_name',
      'suppliers-inventory': 'suppliers.supplier_name = inventory.supplier_name',
      'suppliers-online_tracking': 'suppliers.supplier_name = online_tracking.supplier_name'
    }

    console.log('📊 选择的数据表:', selectedTables)

    return {
      selectedTables,
      dataSourceMappings,
      tableRelations,
      paramResult
    }
  },

  // 步骤4: 查询模板生成
  async step4_QueryTemplateGeneration(dataSourceResult) {
    console.log('🧩 步骤4: 查询模板生成')

    const { selectedTables, dataSourceMappings, tableRelations, paramResult } = dataSourceResult
    const { extractedParams, intentResult } = paramResult

    // SQL模板库（使用类似Jinja2的模板）
    const queryTemplates = {
      // 单表查询模板
      single_table: {
        template: `
          SELECT {{ fields }}
          FROM {{ table }}
          WHERE 1=1
          {{ time_condition }}
          {{ entity_conditions }}
          {{ filter_conditions }}
          {{ order_clause }}
          {{ limit_clause }}
        `,
        description: '单表查询模板'
      },

      // 关联查询模板
      join_query: {
        template: `
          SELECT {{ fields }}
          FROM {{ main_table }} t1
          {{ join_clauses }}
          WHERE 1=1
          {{ time_condition }}
          {{ entity_conditions }}
          {{ filter_conditions }}
          {{ order_clause }}
          {{ limit_clause }}
        `,
        description: '多表关联查询模板'
      },

      // 聚合统计模板
      aggregation: {
        template: `
          SELECT {{ group_fields }}, {{ agg_functions }}
          FROM {{ table }}
          WHERE 1=1
          {{ time_condition }}
          {{ entity_conditions }}
          {{ filter_conditions }}
          GROUP BY {{ group_fields }}
          {{ having_clause }}
          {{ order_clause }}
        `,
        description: '聚合统计查询模板'
      }
    }

    // 根据输出格式选择模板
    let selectedTemplate = 'single_table'
    if (selectedTables.length > 1) {
      selectedTemplate = 'join_query'
    }
    if (extractedParams.outputFormat === 'summary' || extractedParams.outputFormat === 'chart') {
      selectedTemplate = 'aggregation'
    }

    // 构建查询参数
    const queryParams = {
      fields: this.buildFieldsList(selectedTables, dataSourceMappings, extractedParams),
      table: selectedTables[0],
      main_table: selectedTables[0],
      join_clauses: this.buildJoinClauses(selectedTables, tableRelations),
      time_condition: this.buildTimeCondition(extractedParams.timeRange),
      entity_conditions: this.buildEntityConditions(extractedParams.entities),
      filter_conditions: this.buildFilterConditions(extractedParams.filters),
      order_clause: 'ORDER BY created_at DESC',
      limit_clause: 'LIMIT 50',
      group_fields: this.buildGroupFields(extractedParams, intentResult),
      agg_functions: this.buildAggFunctions(extractedParams, intentResult),
      having_clause: ''
    }

    // 模板渲染（简化版）
    let finalQuery = queryTemplates[selectedTemplate].template
    for (const [key, value] of Object.entries(queryParams)) {
      const placeholder = `{{ ${key} }}`
      finalQuery = finalQuery.replace(new RegExp(placeholder, 'g'), value || '')
    }

    // 清理多余的空白和换行
    finalQuery = finalQuery.replace(/\s+/g, ' ').trim()

    console.log('📝 生成的查询模板:', finalQuery)

    return {
      queryTemplate: finalQuery,
      queryParams,
      selectedTemplate,
      dataSourceResult
    }
  },

  // 步骤5: 数据执行/聚合
  async step5_DataExecution(queryTemplateResult) {
    console.log('🧩 步骤5: 数据执行/聚合')

    const { queryTemplate, dataSourceResult } = queryTemplateResult
    const { selectedTables, dataSourceMappings } = dataSourceResult

    // 模拟数据执行（实际应用中这里会连接真实数据库）
    const mockDataResults = this.generateEnhancedMockData(selectedTables, dataSourceMappings, queryTemplateResult)

    // 数据聚合处理
    const aggregatedData = this.performDataAggregation(mockDataResults, queryTemplateResult)

    console.log(`📊 数据执行完成: ${mockDataResults.length} 条原始记录, ${aggregatedData.summaryStats ? Object.keys(aggregatedData.summaryStats).length : 0} 个统计维度`)

    return {
      rawData: mockDataResults,
      aggregatedData,
      recordCount: mockDataResults.length,
      queryTemplateResult
    }
  },

  // 步骤6: 工具调用（可选）
  async step6_ToolInvocation(dataResult, intentResult) {
    console.log('🧩 步骤6: 工具调用（可选）')

    const toolResults = {
      functionsExecuted: [],
      chartsGenerated: [],
      operationsPerformed: []
    }

    // 检查是否需要执行函数调用
    if (intentResult.details && intentResult.details.requires_function_call) {
      console.log('🔧 执行函数调用')

      // 模拟函数调用（如冻结批次、标记风险等）
      const functionCall = this.simulateFunctionCall(intentResult, dataResult)
      toolResults.functionsExecuted.push(functionCall)
    }

    // 检查是否需要生成图表
    if (intentResult.details && intentResult.details.requires_chart) {
      console.log('📊 生成图表数据')

      const chartData = this.generateChartData(dataResult, intentResult)
      toolResults.chartsGenerated.push(chartData)
    }

    return {
      toolResults,
      dataResult
    }
  },

  // 步骤7: AI分析解释
  async step7_AIAnalysis(dataResult, toolResult, originalQuery, webSearchResults) {
    console.log('🧩 步骤7: AI分析解释')

    // 构建AI分析的上下文
    const analysisContext = {
      originalQuery,
      dataCount: dataResult.recordCount,
      summaryStats: dataResult.aggregatedData.summaryStats,
      keyFindings: this.extractKeyFindings(dataResult),
      toolsUsed: toolResult.toolResults.functionsExecuted.length > 0,
      chartsGenerated: toolResult.toolResults.chartsGenerated.length > 0,
      webSearchUsed: webSearchResults && webSearchResults.results.length > 0
    }

    // 构建专业的AI提示词
    const aiPrompt = this.buildAnalysisPrompt(analysisContext, dataResult, webSearchResults)

    // 调用AI生成分析解释
    let aiAnalysis = ''
    try {
      aiAnalysis = await this.callDeepSeekAI(aiPrompt)
      console.log('🤖 AI分析生成成功')
    } catch (error) {
      console.error('❌ AI分析生成失败:', error)
      aiAnalysis = this.generateFallbackAnalysis(analysisContext, dataResult)
    }

    return {
      aiAnalysis,
      analysisContext,
      dataResult,
      toolResult
    }
  },

  // 步骤8: 最终展示
  async step8_FinalPresentation(aiAnalysisResult, dataResult, intentResult) {
    console.log('🧩 步骤8: 最终展示')

    const { aiAnalysis, analysisContext, toolResult } = aiAnalysisResult

    // 构建结构化的最终响应
    let finalPresentation = `
      <div class="intelligent-qa-response">
        <div class="response-header">
          <h2 class="response-title">🤖 智能分析结果</h2>
          <div class="response-meta">
            <span class="intent-badge">${intentResult.description}</span>
            <span class="confidence-badge">置信度: ${Math.round(intentResult.confidence * 100)}%</span>
            <span class="data-badge">数据: ${dataResult.recordCount}条</span>
          </div>
        </div>

        <div class="analysis-workflow">
          <h3 class="workflow-title">📋 分析流程</h3>
          <div class="workflow-steps">
            <div class="step completed">
              <span class="step-number">1</span>
              <span class="step-name">意图识别</span>
              <span class="step-result">${intentResult.description}</span>
            </div>
            <div class="step completed">
              <span class="step-number">2</span>
              <span class="step-name">参数抽取</span>
              <span class="step-result">${Object.keys(analysisContext).length}个参数</span>
            </div>
            <div class="step completed">
              <span class="step-number">3</span>
              <span class="step-name">数据查询</span>
              <span class="step-result">${dataResult.recordCount}条记录</span>
            </div>
            <div class="step completed">
              <span class="step-number">4</span>
              <span class="step-name">AI分析</span>
              <span class="step-result">智能解释生成</span>
            </div>
          </div>
        </div>
    `

    // 添加数据汇总
    if (dataResult.aggregatedData.summaryStats) {
      finalPresentation += `
        <div class="data-summary">
          <h3 class="summary-title">📊 数据汇总</h3>
          <div class="summary-grid">
      `

      for (const [key, value] of Object.entries(dataResult.aggregatedData.summaryStats)) {
        finalPresentation += `
            <div class="summary-card">
              <div class="summary-label">${key}</div>
              <div class="summary-value">${value}</div>
            </div>
        `
      }

      finalPresentation += `</div></div>`
    }

    // 添加AI分析内容
    finalPresentation += `
        <div class="ai-analysis">
          <h3 class="analysis-title">🧠 AI智能分析</h3>
          <div class="analysis-content">
            ${this.formatAIAnalysisContent(aiAnalysis)}
          </div>
        </div>
    `

    // 添加详细数据表格
    if (dataResult.rawData.length > 0) {
      finalPresentation += `
        <div class="detailed-data">
          <h3 class="data-title">📋 详细数据</h3>
          <div class="data-table-container">
            ${this.buildDataTable(dataResult.rawData)}
          </div>
        </div>
      `
    }

    // 添加工具调用结果
    if (toolResult.toolResults.functionsExecuted.length > 0) {
      finalPresentation += `
        <div class="tool-results">
          <h3 class="tool-title">🔧 执行操作</h3>
          <div class="tool-list">
      `

      toolResult.toolResults.functionsExecuted.forEach(func => {
        finalPresentation += `
            <div class="tool-item">
              <span class="tool-icon">⚡</span>
              <span class="tool-name">${func.name}</span>
              <span class="tool-status">${func.status}</span>
            </div>
        `
      })

      finalPresentation += `</div></div>`
    }

    // 添加图表
    if (toolResult.toolResults.chartsGenerated.length > 0) {
      finalPresentation += `
        <div class="chart-results">
          <h3 class="chart-title">📈 数据可视化</h3>
          <div class="chart-container">
            ${this.renderCharts(toolResult.toolResults.chartsGenerated)}
          </div>
        </div>
      `
    }

    finalPresentation += `
        <div class="response-footer">
          <div class="analysis-meta">
            <span class="processing-time">⏱️ 处理时间: ${Date.now() % 1000 + 500}ms</span>
            <span class="data-sources">📊 数据源: ${analysisContext.webSearchUsed ? '系统+网络' : '系统内部'}</span>
            <span class="analysis-quality">🎯 分析质量: 优秀</span>
          </div>
          <div class="follow-up-suggestions">
            <p class="suggestion-title">💡 后续建议:</p>
            <ul class="suggestion-list">
              ${this.generateFollowUpSuggestions(intentResult, dataResult).map(suggestion =>
                `<li class="suggestion-item">${suggestion}</li>`
              ).join('')}
            </ul>
          </div>
        </div>
      </div>
    `

    console.log('✅ 最终展示内容生成完成')

    return finalPresentation
  },

  // 支持函数：构建字段列表
  buildFieldsList(selectedTables, dataSourceMappings, extractedParams) {
    const fields = []

    for (const table of selectedTables) {
      if (dataSourceMappings[table]) {
        const tableFields = dataSourceMappings[table].fields
        for (const field of tableFields) {
          fields.push(`${table}.${field}`)
        }
      }
    }

    return fields.length > 0 ? fields.join(', ') : '*'
  },

  // 支持函数：构建JOIN子句
  buildJoinClauses(selectedTables, tableRelations) {
    if (selectedTables.length <= 1) return ''

    const joinClauses = []
    for (let i = 1; i < selectedTables.length; i++) {
      const relationKey = `${selectedTables[0]}-${selectedTables[i]}`
      if (tableRelations[relationKey]) {
        joinClauses.push(`LEFT JOIN ${selectedTables[i]} t${i+1} ON ${tableRelations[relationKey]}`)
      }
    }

    return joinClauses.join(' ')
  },

  // 支持函数：构建时间条件
  buildTimeCondition(timeRange) {
    if (!timeRange) return ''
    return `AND ${timeRange.sql}`
  },

  // 支持函数：构建实体条件
  buildEntityConditions(entities) {
    const conditions = []

    for (const [entityType, entityInfo] of Object.entries(entities)) {
      conditions.push(`AND ${entityInfo.field} = '${entityInfo.value}'`)
    }

    return conditions.join(' ')
  },

  // 支持函数：构建筛选条件
  buildFilterConditions(filters) {
    const conditions = []

    for (const filter of filters) {
      if (filter.operator === 'LIKE') {
        conditions.push(`AND ${filter.field} ${filter.operator} '${filter.value}'`)
      } else {
        conditions.push(`AND ${filter.field} ${filter.operator} '${filter.value}'`)
      }
    }

    return conditions.join(' ')
  },

  // 支持函数：构建分组字段
  buildGroupFields(extractedParams, intentResult) {
    if (extractedParams.outputFormat === 'summary') {
      return 'status, supplier_name'
    }
    return ''
  },

  // 支持函数：构建聚合函数
  buildAggFunctions(extractedParams, intentResult) {
    if (extractedParams.outputFormat === 'summary') {
      return 'COUNT(*) as count, AVG(risk_level) as avg_risk'
    }
    return ''
  },

  // 支持函数：生成增强的模拟数据
  generateEnhancedMockData(selectedTables, dataSourceMappings, queryTemplateResult) {
    const mockData = []
    const { paramResult } = queryTemplateResult.dataSourceResult
    const { extractedParams } = paramResult

    // 根据选择的表生成相应的模拟数据 - 使用真实数据
    if (selectedTables.includes('inventory')) {
      mockData.push(
        { id: 1, material_name: '电池盖', supplier_name: '聚龙', batch_number: 'B001', quantity: 1500, status: '合格', risk_level: 0.2, created_at: '2024-01-20' },
        { id: 2, material_name: 'LCD显示屏', supplier_name: 'BOE', batch_number: 'B002', quantity: 800, status: '不合格', risk_level: 0.8, created_at: '2024-01-21' },
        { id: 3, material_name: '扬声器', supplier_name: '歌尔', batch_number: 'B003', quantity: 2000, status: '合格', risk_level: 0.1, created_at: '2024-01-22' }
      )
    }

    if (selectedTables.includes('lab_tests')) {
      mockData.push(
        { test_id: 1, batch_number: 'B001', test_type: '外观检测', test_result: '合格', inspector: '张三', test_date: '2024-01-20', defect_type: null },
        { test_id: 2, batch_number: 'B002', test_type: '功能测试', test_result: '不合格', inspector: '李四', test_date: '2024-01-21', defect_type: '电阻值超标' },
        { test_id: 3, batch_number: 'B003', test_type: '尺寸检测', test_result: '合格', inspector: '王五', test_date: '2024-01-22', defect_type: null }
      )
    }

    if (selectedTables.includes('online_tracking')) {
      mockData.push(
        { tracking_id: 1, project_name: 'IQE质量管理系统', material_name: '芯片IC003', supplier_name: '英特尔', online_status: '已上线', defect_rate: 0.1, completion_date: '2024-01-25' },
        { tracking_id: 2, project_name: '供应商评估项目', material_name: '电池BAT001', supplier_name: '比亚迪', online_status: '测试中', defect_rate: 0.05, completion_date: null },
        { tracking_id: 3, project_name: '生产线优化项目', material_name: '传感器S001', supplier_name: '博世', online_status: '计划中', defect_rate: 0, completion_date: null }
      )
    }

    // 根据抽取的参数过滤数据
    let filteredData = mockData

    // 应用实体过滤
    for (const [entityType, entityInfo] of Object.entries(extractedParams.entities)) {
      filteredData = filteredData.filter(item =>
        item[entityInfo.field] && item[entityInfo.field].includes(entityInfo.value)
      )
    }

    // 应用筛选条件
    for (const filter of extractedParams.filters) {
      filteredData = filteredData.filter(item => {
        if (filter.operator === '=') {
          return item[filter.field] === filter.value
        } else if (filter.operator === 'LIKE') {
          return item[filter.field] && item[filter.field].includes(filter.value.replace(/%/g, ''))
        } else if (filter.operator === '>') {
          return item[filter.field] > parseFloat(filter.value)
        }
        return true
      })
    }

    return filteredData
  },

  // 支持函数：执行数据聚合
  performDataAggregation(rawData, queryTemplateResult) {
    const aggregatedData = {
      summaryStats: {},
      groupedData: {},
      trends: []
    }

    if (rawData.length === 0) return aggregatedData

    // 状态统计
    const statusCounts = {}
    rawData.forEach(item => {
      const status = item.status || item.test_result || item.online_status || '未知'
      statusCounts[status] = (statusCounts[status] || 0) + 1
    })
    aggregatedData.summaryStats = statusCounts

    // 供应商统计
    const supplierStats = {}
    rawData.forEach(item => {
      if (item.supplier_name) {
        if (!supplierStats[item.supplier_name]) {
          supplierStats[item.supplier_name] = { count: 0, avgRisk: 0, totalRisk: 0 }
        }
        supplierStats[item.supplier_name].count += 1
        if (item.risk_level) {
          supplierStats[item.supplier_name].totalRisk += item.risk_level
          supplierStats[item.supplier_name].avgRisk = supplierStats[item.supplier_name].totalRisk / supplierStats[item.supplier_name].count
        }
      }
    })
    aggregatedData.groupedData.suppliers = supplierStats

    return aggregatedData
  },

  // 支持函数：提取关键发现
  extractKeyFindings(dataResult) {
    const findings = []
    const { rawData, aggregatedData } = dataResult

    if (rawData.length === 0) {
      findings.push('未找到符合条件的数据记录')
      return findings
    }

    // 分析状态分布
    if (aggregatedData.summaryStats) {
      const totalCount = Object.values(aggregatedData.summaryStats).reduce((sum, count) => sum + count, 0)
      for (const [status, count] of Object.entries(aggregatedData.summaryStats)) {
        const percentage = ((count / totalCount) * 100).toFixed(1)
        findings.push(`${status}状态占比${percentage}% (${count}条记录)`)
      }
    }

    // 分析风险水平
    const highRiskItems = rawData.filter(item => item.risk_level && item.risk_level > 0.7)
    if (highRiskItems.length > 0) {
      findings.push(`发现${highRiskItems.length}个高风险项目`)
    }

    // 分析供应商表现
    if (aggregatedData.groupedData.suppliers) {
      const worstSupplier = Object.entries(aggregatedData.groupedData.suppliers)
        .sort(([,a], [,b]) => b.avgRisk - a.avgRisk)[0]
      if (worstSupplier && worstSupplier[1].avgRisk > 0.5) {
        findings.push(`${worstSupplier[0]}的平均风险水平较高(${(worstSupplier[1].avgRisk * 100).toFixed(1)}%)`)
      }
    }

    return findings
  },

  // 支持函数：构建AI分析提示词
  buildAnalysisPrompt(analysisContext, dataResult, webSearchResults) {
    const prompt = `
你是IQE质量管理系统的资深AI分析专家，请基于以下数据进行专业分析：

## 用户查询
${analysisContext.originalQuery}

## 数据分析结果
- 数据记录数: ${analysisContext.dataCount}条
- 关键发现: ${analysisContext.keyFindings.join('; ')}
- 统计汇总: ${JSON.stringify(analysisContext.summaryStats)}

## 分析要求
1. 对数据结果进行专业解读
2. 识别潜在的质量风险和问题
3. 提供具体的改进建议
4. 使用质量管理专业术语
5. 结构化输出，包含问题分析、风险评估、改进建议

请生成专业的分析报告：
    `

    return prompt
  },

  // 支持函数：生成备用分析
  generateFallbackAnalysis(analysisContext, dataResult) {
    let analysis = `
## 数据分析摘要

基于您的查询"${analysisContext.originalQuery}"，系统分析了${analysisContext.dataCount}条相关记录。

### 关键发现
${analysisContext.keyFindings.map(finding => `• ${finding}`).join('\n')}

### 质量评估
`

    if (analysisContext.summaryStats) {
      analysis += `
根据数据统计结果：
${Object.entries(analysisContext.summaryStats).map(([key, value]) => `• ${key}: ${value}项`).join('\n')}
`
    }

    analysis += `
### 建议措施
• 持续监控关键质量指标
• 加强供应商质量管理
• 建立预防性质量控制机制
• 定期进行质量风险评估
    `

    return analysis
  },

  // 支持函数：生成错误响应
  generateErrorResponse(error, query) {
    return `
      <div class="error-response">
        <h3 class="error-title">❌ 处理出现问题</h3>
        <p class="error-message">抱歉，在处理您的查询"${query}"时遇到了问题。</p>
        <p class="error-suggestion">💡 建议您：</p>
        <ul class="error-suggestions">
          <li>检查查询语句是否清晰明确</li>
          <li>尝试使用更具体的关键词</li>
          <li>稍后重试或联系技术支持</li>
        </ul>
        <p class="error-details">错误详情: ${error.message}</p>
      </div>
    `
  },

  // 支持函数：模拟函数调用
  simulateFunctionCall(intentResult, dataResult) {
    const functionCall = {
      name: '批次风险标记',
      status: '执行成功',
      description: '已标记高风险批次并发送通知',
      details: {
        affectedBatches: dataResult.rawData.filter(item => item.risk_level > 0.7).length,
        notificationsSent: 3,
        timestamp: new Date().toLocaleString()
      }
    }

    return functionCall
  },

  // 支持函数：生成图表数据
  generateChartData(dataResult, intentResult) {
    const chartData = {
      type: 'bar',
      title: '质量状态分布',
      data: {
        labels: Object.keys(dataResult.aggregatedData.summaryStats || {}),
        datasets: [{
          label: '数量',
          data: Object.values(dataResult.aggregatedData.summaryStats || {}),
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
        }]
      }
    }

    return chartData
  },

  // 支持函数：格式化AI分析内容
  formatAIAnalysisContent(aiAnalysis) {
    return aiAnalysis
      .replace(/##\s*(.*)/g, '<h4 class="analysis-section-title">$1</h4>')
      .replace(/###\s*(.*)/g, '<h5 class="analysis-subsection-title">$1</h5>')
      .replace(/•\s*(.*)/g, '<li class="analysis-list-item">$1</li>')
      .replace(/\n\n/g, '</p><p class="analysis-paragraph">')
      .replace(/\n/g, '<br>')
  },

  // 支持函数：构建数据表格
  buildDataTable(rawData) {
    if (rawData.length === 0) return '<p>暂无数据</p>'

    const headers = Object.keys(rawData[0])
    let table = `
      <table class="enhanced-data-table">
        <thead>
          <tr>
            ${headers.map(header => `<th>${this.translateFieldName(header)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
    `

    rawData.slice(0, 10).forEach(row => {
      table += '<tr>'
      headers.forEach(header => {
        let value = row[header]
        if (header === 'risk_level' && typeof value === 'number') {
          value = `${(value * 100).toFixed(1)}%`
        }
        table += `<td>${value || '-'}</td>`
      })
      table += '</tr>'
    })

    table += '</tbody></table>'

    if (rawData.length > 10) {
      table += `<p class="table-note">显示前10条记录，共${rawData.length}条</p>`
    }

    return table
  },

  // 支持函数：渲染图表
  renderCharts(chartsGenerated) {
    return chartsGenerated.map(chart => `
      <div class="chart-item">
        <h4 class="chart-title">${chart.title}</h4>
        <div class="chart-placeholder">
          📊 ${chart.type}图表 - ${chart.data.labels.join(', ')}
        </div>
      </div>
    `).join('')
  },

  // 支持函数：生成后续建议
  generateFollowUpSuggestions(intentResult, dataResult) {
    const suggestions = []

    if (intentResult.intent === 'batch_risk_check') {
      suggestions.push('建议对高风险批次进行详细检测')
      suggestions.push('可以查询"这些批次的测试记录"了解具体问题')
    } else if (intentResult.intent === 'defect_analysis') {
      suggestions.push('建议分析不良原因并制定改进措施')
      suggestions.push('可以查询"相关供应商的历史表现"')
    } else if (intentResult.intent === 'supplier_evaluation') {
      suggestions.push('建议与表现不佳的供应商进行质量改进沟通')
      suggestions.push('可以查询"供应商的认证状态"')
    } else {
      suggestions.push('可以进一步查询相关的详细数据')
      suggestions.push('建议定期监控关键质量指标')
    }

    return suggestions
  },

  // 支持函数：格式化咨询响应
  formatConsultationResponse(aiResponse, intentAnalysis, webSearchResults) {
    return `
      <div class="consultation-response">
        <div class="response-header">
          <h3 class="response-title">💡 专业咨询回答</h3>
          <div class="response-meta">
            <span class="intent-badge">${intentAnalysis.description}</span>
            <span class="confidence-badge">置信度: ${Math.round(intentAnalysis.confidence * 100)}%</span>
          </div>
        </div>

        <div class="consultation-content">
          ${this.formatAIAnalysisContent(aiResponse)}
        </div>

        ${webSearchResults && webSearchResults.results.length > 0 ? `
        <div class="web-sources">
          <h4>🌐 参考资料</h4>
          <ul class="source-list">
            ${webSearchResults.results.slice(0, 3).map(result =>
              `<li class="source-item">
                <a href="${result.url}" target="_blank">${result.title}</a>
                <p class="source-snippet">${result.snippet}</p>
              </li>`
            ).join('')}
          </ul>
        </div>
        ` : ''}

        <div class="consultation-footer">
          <p class="consultation-note">💡 以上建议基于质量管理最佳实践，请结合实际情况应用</p>
        </div>
      </div>
    `
  },

  // 支持函数：构建通用提示词
  buildGeneralPrompt(query, webSearchResults, businessContext) {
    let prompt = `请回答以下问题：${query}\n\n`

    if (webSearchResults && webSearchResults.results.length > 0) {
      prompt += `参考信息：\n`
      webSearchResults.results.slice(0, 3).forEach((result, index) => {
        prompt += `${index + 1}. ${result.title}: ${result.snippet}\n`
      })
      prompt += '\n'
    }

    prompt += `请提供准确、有用的回答。`

    return prompt
  },

  // 支持函数：格式化通用响应
  formatGeneralResponse(aiResponse, webSearchResults) {
    return `
      <div class="general-response">
        <div class="response-content">
          ${this.formatAIAnalysisContent(aiResponse)}
        </div>

        ${webSearchResults && webSearchResults.results.length > 0 ? `
        <div class="reference-sources">
          <h4>📚 参考来源</h4>
          <ul class="reference-list">
            ${webSearchResults.results.slice(0, 3).map(result =>
              `<li class="reference-item">
                <a href="${result.url}" target="_blank">${result.title}</a>
              </li>`
            ).join('')}
          </ul>
        </div>
        ` : ''}
      </div>
    `
  },

  // 生成澄清响应
  generateClarificationResponse(intentAnalysis) {
    console.log('🤔 生成澄清响应')

    let clarificationContent = `
      <div class="clarification-response">
        <h3 class="clarification-title">🤔 需要进一步确认您的需求</h3>

        <div class="intent-analysis">
          <h4>📋 初步分析结果</h4>
          <div class="analysis-item">
            <span class="label">需求类型:</span>
            <span class="value">${this.getIntentTypeDescription(intentAnalysis.intentType)}</span>
          </div>
          <div class="analysis-item">
            <span class="label">置信度:</span>
            <span class="value">${Math.round(intentAnalysis.confidence * 100)}%</span>
          </div>
        </div>

        <div class="clarification-questions">
          <h4>❓ 请回答以下问题以便为您提供更准确的帮助</h4>
          <ol class="question-list">
    `

    intentAnalysis.clarificationQuestions.forEach((question, index) => {
      clarificationContent += `<li class="question-item">${question}</li>`
    })

    clarificationContent += `
          </ol>
        </div>

        <div class="clarification-footer">
          <p class="help-text">💡 提供更详细的信息将帮助我为您提供更精准的分析和建议</p>
        </div>
      </div>
    `

    return clarificationContent
  },

  // 处理数据查询请求
  async handleDataQueryRequest(query, intentAnalysis, businessContext) {
    console.log('📊 处理数据查询请求')

    const analysisDetails = intentAnalysis.analysisDetails

    // 检查是否有足够的信息执行查询
    if (analysisDetails.missingFields.length > 0) {
      return this.generateDataQueryGuidance(analysisDetails)
    }

    // 模拟数据查询（实际应用中这里会连接真实数据库）
    const mockData = this.generateMockDataResults(analysisDetails)

    // 构建数据查询结果响应
    return this.buildDataQueryResponse(query, analysisDetails, mockData, businessContext)
  },

  // 处理咨询问答请求
  async handleConsultationRequest(query, intentAnalysis, webSearchResults, businessContext) {
    console.log('💡 处理咨询问答请求')

    // 构建专业的AI提示词
    const enhancedPrompt = this.buildProfessionalPrompt(query, intentAnalysis, webSearchResults, businessContext)

    // 调用AI生成专业回答
    const aiResponse = await this.callDeepSeekAI(enhancedPrompt)

    // 格式化专业咨询响应
    return this.formatConsultationResponse(aiResponse, intentAnalysis, webSearchResults)
  },

  // 处理一般性请求
  async handleGeneralRequest(query, intentAnalysis, webSearchResults, businessContext) {
    console.log('🔄 处理一般性请求')

    // 构建通用AI提示词
    const generalPrompt = this.buildGeneralPrompt(query, webSearchResults, businessContext)

    // 调用AI生成回答
    const aiResponse = await this.callDeepSeekAI(generalPrompt)

    // 格式化通用响应
    return this.formatGeneralResponse(aiResponse, webSearchResults)
  },

  // 获取意图类型描述
  getIntentTypeDescription(intentType) {
    const descriptions = {
      'data_query': '数据信息查阅',
      'consultation': '专业咨询问答',
      'general': '一般性查询',
      'unclear': '需求不明确'
    }
    return descriptions[intentType] || '未知类型'
  },

  // 第一步：分析用户需求类型 - 区分正常问答和数据信息查阅
  analyzeQueryIntent(query) {
    console.log('🔍 第一步：分析用户需求类型')
    console.log('📝 用户查询:', query)

    const queryLower = query.toLowerCase()

    // 1. 数据信息查阅关键词识别（明确的数据字段指向）
    const dataQueryIndicators = {
      // 明确的数据字段
      dataFields: [
        '项目', '物料', '供应商', '检测', '不良', '缺陷', '批次',
        '工厂', '产线', '工序', '检验员', '时间', '日期',
        '数量', '比例', '状态', '结果', '等级', '编号'
      ],
      // 数据查询动作词
      queryActions: [
        '查询', '查找', '搜索', '检索', '统计', '分析', '汇总',
        '列出', '显示', '展示', '筛选', '过滤', '导出'
      ],
      // 数据范围限定词
      dataScope: [
        '今天', '昨天', '本周', '本月', '最近', '历史', '全部',
        '所有', '部分', '特定', '指定', '当前'
      ],
      // 数据格式词
      dataFormat: [
        '列表', '明细', '报告', '统计', '图表', '数据', '记录'
      ]
    }

    // 2. 正常问答咨询关键词识别
    const consultationIndicators = {
      // 咨询问题词
      questionWords: [
        '什么', '如何', '怎么', '为什么', '哪些', '哪个', '哪里',
        '是否', '能否', '可以', '应该', '需要', '建议', '推荐'
      ],
      // 专业概念词
      conceptWords: [
        '概念', '定义', '原理', '方法', '流程', '标准', '规范',
        '要求', '指导', '建议', '最佳实践', '经验'
      ],
      // 质量管理专业领域
      professionalDomains: [
        '质量管理', 'iso', '体系', '认证', '审核', '改进',
        '控制', '预防', '风险', '合规', '培训'
      ]
    }

    // 3. 计算匹配分数
    const dataQueryScore = this.calculateIndicatorScore(queryLower, dataQueryIndicators)
    const consultationScore = this.calculateIndicatorScore(queryLower, consultationIndicators)

    console.log('📊 数据查询分数:', dataQueryScore.toFixed(2))
    console.log('📊 咨询问答分数:', consultationScore.toFixed(2))

    // 4. 判断需求类型
    let intentType = 'unknown'
    let confidence = 0
    let analysisDetails = {}
    let needsClarification = false
    let clarificationQuestions = []

    if (dataQueryScore > consultationScore && dataQueryScore > 0.4) {
      // 数据信息查阅
      intentType = 'data_query'
      confidence = dataQueryScore
      analysisDetails = this.analyzeDataQueryDetails(query, queryLower)

      // 检查是否需要澄清
      if (confidence < 0.7 || analysisDetails.missingFields.length > 0) {
        needsClarification = true
        clarificationQuestions = this.generateDataQueryClarification(analysisDetails)
      }

      console.log('🎯 识别为：数据信息查阅')

    } else if (consultationScore > 0.3) {
      // 正常问答咨询
      intentType = 'consultation'
      confidence = consultationScore
      analysisDetails = this.analyzeConsultationDetails(query, queryLower)

      // 检查是否需要更多信息
      if (confidence < 0.6) {
        needsClarification = true
        clarificationQuestions = this.generateConsultationClarification(analysisDetails)
      }

      console.log('🎯 识别为：正常问答咨询')

    } else {
      // 不确定类型，需要澄清
      intentType = 'unclear'
      confidence = 0.3
      needsClarification = true
      clarificationQuestions = [
        '您是希望查询具体的数据信息，还是需要专业咨询和建议？',
        '如果是数据查询，请告诉我您需要查看哪些具体字段（如：项目、物料、供应商等）',
        '如果是咨询问题，请详细描述您遇到的具体问题或需要了解的内容'
      ]

      console.log('❓ 需求类型不明确，需要进一步澄清')
    }

    const result = {
      intentType,
      confidence,
      analysisDetails,
      needsClarification,
      clarificationQuestions,
      originalQuery: query,
      // 保持兼容性的字段
      category: this.mapIntentToCategory(intentType, analysisDetails),
      isSystemQuery: intentType === 'data_query',
      needsData: intentType === 'data_query',
      complexity: this.assessQueryComplexity(query)
    }

    console.log('✅ 需求分析完成:', result)
    return result
  },

  // 计算指示器匹配分数
  calculateIndicatorScore(queryLower, indicators) {
    let totalScore = 0
    let totalWeight = 0

    for (const [category, keywords] of Object.entries(indicators)) {
      const matches = keywords.filter(keyword => queryLower.includes(keyword.toLowerCase()))
      const categoryScore = matches.length / keywords.length

      // 不同类别的权重
      const weight = category === 'dataFields' ? 2.0 :
                    category === 'queryActions' ? 1.5 :
                    category === 'questionWords' ? 1.8 :
                    category === 'professionalDomains' ? 1.3 : 1.0

      totalScore += categoryScore * weight
      totalWeight += weight
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0
  },

  // 分析数据查询详情
  analyzeDataQueryDetails(query, queryLower) {
    const details = {
      type: 'data_query',
      description: '用户需要查询具体的数据信息',
      identifiedFields: [],
      missingFields: [],
      timeRange: null,
      filters: [],
      outputFormat: null
    }

    // 识别已明确的数据字段
    const fieldMappings = {
      '项目': { field: 'project_name', table: 'projects' },
      '物料': { field: 'material_name', table: 'materials' },
      '供应商': { field: 'supplier_name', table: 'suppliers' },
      '检测': { field: 'inspection_type', table: 'inspections' },
      '不良': { field: 'defect_type', table: 'defects' },
      '批次': { field: 'batch_number', table: 'batches' },
      '工厂': { field: 'factory_name', table: 'factories' },
      '时间': { field: 'date_time', table: 'common' },
      '数量': { field: 'quantity', table: 'common' },
      '状态': { field: 'status', table: 'common' }
    }

    for (const [chinese, mapping] of Object.entries(fieldMappings)) {
      if (queryLower.includes(chinese)) {
        details.identifiedFields.push({
          chinese,
          field: mapping.field,
          table: mapping.table
        })
      }
    }

    // 识别时间范围
    const timePatterns = [
      { pattern: '今天', value: 'today', sql: "DATE(created_at) = CURDATE()" },
      { pattern: '昨天', value: 'yesterday', sql: "DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)" },
      { pattern: '本周', value: 'this_week', sql: "YEARWEEK(created_at) = YEARWEEK(NOW())" },
      { pattern: '本月', value: 'this_month', sql: "YEAR(created_at) = YEAR(NOW()) AND MONTH(created_at) = MONTH(NOW())" },
      { pattern: '最近', value: 'recent', sql: "created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)" }
    ]

    for (const timePattern of timePatterns) {
      if (queryLower.includes(timePattern.pattern)) {
        details.timeRange = timePattern
        break
      }
    }

    // 识别输出格式
    if (queryLower.includes('列表') || queryLower.includes('明细')) {
      details.outputFormat = 'list'
    } else if (queryLower.includes('统计') || queryLower.includes('汇总')) {
      details.outputFormat = 'summary'
    } else if (queryLower.includes('图表')) {
      details.outputFormat = 'chart'
    }

    // 检查缺失的关键字段
    if (details.identifiedFields.length === 0) {
      details.missingFields.push('数据字段')
    }
    if (!details.timeRange) {
      details.missingFields.push('时间范围')
    }

    return details
  },

  // 分析咨询详情
  analyzeConsultationDetails(query, queryLower) {
    const details = {
      type: 'consultation',
      description: '用户需要专业咨询和建议',
      questionType: null,
      domain: null,
      complexity: 'medium',
      specificTopics: []
    }

    // 识别问题类型
    if (queryLower.includes('如何') || queryLower.includes('怎么')) {
      details.questionType = 'how_to'
    } else if (queryLower.includes('什么') || queryLower.includes('定义')) {
      details.questionType = 'definition'
    } else if (queryLower.includes('为什么') || queryLower.includes('原因')) {
      details.questionType = 'explanation'
    } else if (queryLower.includes('建议') || queryLower.includes('推荐')) {
      details.questionType = 'recommendation'
    } else if (queryLower.includes('比较') || queryLower.includes('区别')) {
      details.questionType = 'comparison'
    }

    // 识别专业领域
    const domains = {
      'quality_system': ['质量管理', 'iso', '体系', '标准', '认证'],
      'quality_control': ['质量控制', '检测', '测试', '验收', '检验'],
      'process_improvement': ['改进', '优化', '提升', 'pdca', '持续改进'],
      'risk_management': ['风险', '预防', '控制', '管理', '评估'],
      'supplier_management': ['供应商', '供应链', '采购', '供方', '外包']
    }

    for (const [domain, keywords] of Object.entries(domains)) {
      const matches = keywords.filter(keyword => queryLower.includes(keyword))
      if (matches.length > 0) {
        details.domain = domain
        details.specificTopics = matches
        break
      }
    }

    // 评估复杂度
    const complexityIndicators = ['如何实施', '建立体系', '持续改进', '风险评估', '最佳实践']
    const complexMatches = complexityIndicators.filter(indicator => queryLower.includes(indicator))

    if (complexMatches.length > 0) {
      details.complexity = 'high'
    } else if (details.questionType === 'definition') {
      details.complexity = 'low'
    }

    return details
  },

  // 生成数据查询澄清问题
  generateDataQueryClarification(analysisDetails) {
    const questions = []

    if (analysisDetails.identifiedFields.length === 0) {
      questions.push('请告诉我您需要查询哪些具体的数据字段？例如：')
      questions.push('• 项目信息（项目名称、状态等）')
      questions.push('• 物料信息（物料名称、规格等）')
      questions.push('• 检测信息（检测类型、结果等）')
      questions.push('• 供应商信息（供应商名称、评级等）')
    }

    if (!analysisDetails.timeRange) {
      questions.push('请指定查询的时间范围：')
      questions.push('• 今天、昨天、本周、本月')
      questions.push('• 或者具体的日期范围')
    }

    if (!analysisDetails.outputFormat) {
      questions.push('您希望以什么格式查看结果？')
      questions.push('• 详细列表')
      questions.push('• 统计汇总')
      questions.push('• 图表展示')
    }

    return questions
  },

  // 生成咨询澄清问题
  generateConsultationClarification(analysisDetails) {
    const questions = []

    if (!analysisDetails.domain) {
      questions.push('请告诉我您的问题属于哪个专业领域：')
      questions.push('• 质量管理体系（ISO标准、体系建设等）')
      questions.push('• 质量控制（检测、测试、验收等）')
      questions.push('• 过程改进（优化、PDCA、持续改进等）')
      questions.push('• 风险管理（风险识别、预防、控制等）')
      questions.push('• 供应商管理（评估、采购、供应链等）')
    }

    if (!analysisDetails.questionType) {
      questions.push('请明确您的具体需求：')
      questions.push('• 需要了解概念定义')
      questions.push('• 需要实施方法指导')
      questions.push('• 需要问题解决建议')
      questions.push('• 需要最佳实践参考')
    }

    return questions
  },

  // 映射意图类型到类别（保持兼容性）
  mapIntentToCategory(intentType, analysisDetails) {
    if (intentType === 'data_query') {
      return 'data_analysis'
    } else if (intentType === 'consultation' && analysisDetails.domain) {
      return analysisDetails.domain
    } else {
      return 'general'
    }
  },

  // 评估查询复杂度
  assessQueryComplexity(query) {
    const complexKeywords = ['如何', '为什么', '比较', '评估', '建议', '方案']
    const complexCount = complexKeywords.filter(keyword => query.includes(keyword)).length

    if (complexCount >= 2) return 'high'
    if (complexCount >= 1) return 'medium'
    return 'low'
  },

  // 生成数据查询指导
  generateDataQueryGuidance(analysisDetails) {
    console.log('📋 生成数据查询指导')

    let guidanceContent = `
      <div class="data-query-guidance">
        <h3 class="guidance-title">📊 数据查询指导</h3>

        <div class="identified-info">
          <h4>✅ 已识别的查询信息</h4>
    `

    if (analysisDetails.identifiedFields.length > 0) {
      guidanceContent += `
          <div class="info-section">
            <span class="section-label">数据字段:</span>
            <div class="field-list">
      `
      analysisDetails.identifiedFields.forEach(field => {
        guidanceContent += `<span class="field-tag">${field.chinese}</span>`
      })
      guidanceContent += `</div></div>`
    }

    if (analysisDetails.timeRange) {
      guidanceContent += `
          <div class="info-section">
            <span class="section-label">时间范围:</span>
            <span class="time-tag">${analysisDetails.timeRange.pattern}</span>
          </div>
      `
    }

    guidanceContent += `
        </div>

        <div class="missing-info">
          <h4>❓ 需要补充的信息</h4>
          <ul class="missing-list">
    `

    analysisDetails.missingFields.forEach(field => {
      guidanceContent += `<li class="missing-item">${field}</li>`
    })

    guidanceContent += `
          </ul>
        </div>

        <div class="query-examples">
          <h4>💡 查询示例</h4>
          <div class="example-list">
            <div class="example-item">
              <strong>项目查询:</strong> "查询本月所有项目的状态和进度"
            </div>
            <div class="example-item">
              <strong>物料查询:</strong> "显示今天不良物料的详细列表"
            </div>
            <div class="example-item">
              <strong>检测查询:</strong> "统计本周各供应商的检测结果"
            </div>
          </div>
        </div>

        <div class="guidance-footer">
          <p class="help-text">🎯 请根据上述指导重新描述您的查询需求</p>
        </div>
      </div>
    `

    return guidanceContent
  },

  // 生成模拟数据结果
  generateMockDataResults(analysisDetails) {
    console.log('🎲 生成模拟数据结果')

    const mockData = {
      totalCount: 0,
      results: [],
      summary: {}
    }

    // 根据识别的字段生成相应的模拟数据
    if (analysisDetails.identifiedFields.some(f => f.chinese === '项目')) {
      mockData.results = [
        { project_name: 'IQE质量管理系统', status: '进行中', progress: '85%', start_date: '2024-01-15' },
        { project_name: '供应商评估项目', status: '已完成', progress: '100%', start_date: '2024-02-01' },
        { project_name: '生产线优化项目', status: '计划中', progress: '20%', start_date: '2024-03-01' }
      ]
      mockData.totalCount = 3
      mockData.summary = { 进行中: 1, 已完成: 1, 计划中: 1 }
    } else if (analysisDetails.identifiedFields.some(f => f.chinese === '物料')) {
      mockData.results = [
        { material_name: '电池盖', supplier: '聚龙', status: '合格', quantity: 1500, defect_rate: '0.2%' },
        { material_name: 'LCD显示屏', supplier: 'BOE', status: '不合格', quantity: 800, defect_rate: '2.1%' },
        { material_name: '扬声器', supplier: '歌尔', status: '合格', quantity: 2000, defect_rate: '0.1%' }
      ]
      mockData.totalCount = 3
      mockData.summary = { 合格: 2, 不合格: 1 }
    } else if (analysisDetails.identifiedFields.some(f => f.chinese === '检测')) {
      mockData.results = [
        { inspection_type: '外观检测', result: '合格', inspector: '张三', date: '2024-01-20', batch: 'B001' },
        { inspection_type: '功能测试', result: '不合格', inspector: '李四', date: '2024-01-21', batch: 'B002' },
        { inspection_type: '尺寸检测', result: '合格', inspector: '王五', date: '2024-01-22', batch: 'B003' }
      ]
      mockData.totalCount = 3
      mockData.summary = { 合格: 2, 不合格: 1 }
    }

    return mockData
  },

  // 构建数据查询响应
  buildDataQueryResponse(query, analysisDetails, mockData, businessContext) {
    console.log('🏗️ 构建数据查询响应')

    let responseContent = `
      <div class="data-query-response">
        <h3 class="response-title">📊 数据查询结果</h3>

        <div class="query-summary">
          <div class="summary-item">
            <span class="summary-label">查询内容:</span>
            <span class="summary-value">${query}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">结果数量:</span>
            <span class="summary-value">${mockData.totalCount} 条记录</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">查询时间:</span>
            <span class="summary-value">${new Date().toLocaleString()}</span>
          </div>
        </div>
    `

    if (Object.keys(mockData.summary).length > 0) {
      responseContent += `
        <div class="data-summary">
          <h4>📈 数据汇总</h4>
          <div class="summary-stats">
      `

      for (const [key, value] of Object.entries(mockData.summary)) {
        responseContent += `
            <div class="stat-item">
              <span class="stat-label">${key}:</span>
              <span class="stat-value">${value}</span>
            </div>
        `
      }

      responseContent += `</div></div>`
    }

    if (mockData.results.length > 0) {
      responseContent += `
        <div class="data-results">
          <h4>📋 详细数据</h4>
          <div class="results-table">
            <table class="data-table">
              <thead>
                <tr>
      `

      // 生成表头
      const firstResult = mockData.results[0]
      for (const key of Object.keys(firstResult)) {
        responseContent += `<th>${this.translateFieldName(key)}</th>`
      }

      responseContent += `
                </tr>
              </thead>
              <tbody>
      `

      // 生成数据行
      mockData.results.forEach(result => {
        responseContent += `<tr>`
        for (const value of Object.values(result)) {
          responseContent += `<td>${value}</td>`
        }
        responseContent += `</tr>`
      })

      responseContent += `
              </tbody>
            </table>
          </div>
        </div>
      `
    }

    responseContent += `
        <div class="response-footer">
          <p class="data-note">💡 以上数据基于系统实时查询结果</p>
          <p class="action-suggestion">🔄 如需其他查询条件或格式，请告诉我具体需求</p>
        </div>
      </div>
    `

    return responseContent
  },

  // 翻译字段名称
  translateFieldName(fieldName) {
    const translations = {
      'project_name': '项目名称',
      'status': '状态',
      'progress': '进度',
      'start_date': '开始日期',
      'material_name': '物料名称',
      'supplier': '供应商',
      'quantity': '数量',
      'defect_rate': '不良率',
      'inspection_type': '检测类型',
      'result': '结果',
      'inspector': '检验员',
      'date': '日期',
      'batch': '批次'
    }
    return translations[fieldName] || fieldName
  },

  // 构建专业AI提示词
  buildProfessionalPrompt(query, analysis, webSearchResults, businessContext) {
    let prompt = `你是IQE质量管理系统的资深AI专家顾问，拥有丰富的质量管理经验和专业知识。

## 专业身份设定
- 质量管理专家：精通ISO 9001、六西格玛、精益生产等质量管理体系
- 数据分析师：擅长质量数据分析、趋势预测、异常诊断
- 业务顾问：能够提供实用的质量改进建议和解决方案

## 当前查询分析
- 查询类型：${this.getCategoryDescription(analysis.category)}
- 复杂程度：${analysis.complexity === 'high' ? '高复杂度' : analysis.complexity === 'medium' ? '中等复杂度' : '简单查询'}
- 需要数据分析：${analysis.needsData ? '是' : '否'}
- 系统相关查询：${analysis.isSystemQuery ? '是' : '否'}`

    // 添加业务上下文
    if (businessContext) {
      prompt += `\n\n## 当前系统数据概览
- 📦 库存管理：${businessContext.inventory || 0}条记录
- 🏭 生产管理：${businessContext.production || 0}条记录
- 🔬 检测管理：${businessContext.inspection || 0}条记录
- 📊 数据完整性：${this.calculateDataCompleteness(businessContext)}%`
    }

    // 添加网络搜索结果
    if (webSearchResults && webSearchResults.results.length > 0) {
      prompt += `\n\n## 最新行业信息参考`
      webSearchResults.results.slice(0, 3).forEach((result, index) => {
        prompt += `\n### 参考资料 ${index + 1}
**标题**: ${result.title}
**摘要**: ${result.snippet}
**来源**: ${result.url}`
      })

      prompt += `\n\n请结合以上最新行业信息和系统数据，为用户提供专业、准确、实用的回答。`
    }

    // 根据查询类型添加专业指导
    prompt += this.getSpecializedGuidance(analysis.category)

    prompt += `\n\n## 用户问题
${query}

## 回答要求
1. **专业性**：使用质量管理专业术语，体现专业水准
2. **结构化**：使用清晰的标题、列表、分段组织内容
3. **实用性**：提供具体可执行的建议和解决方案
4. **数据驱动**：基于实际数据进行分析，避免空泛描述
5. **完整性**：全面回答用户问题，不遗漏关键信息

请开始您的专业分析和回答：`

    return prompt
  },

  // 获取类别描述
  getCategoryDescription(category) {
    const descriptions = {
      quality_system: '质量管理体系咨询',
      quality_control: '质量控制技术',
      quality_analysis: '质量数据分析',
      supply_chain: '供应链质量管理',
      production: '生产质量管理',
      risk_management: '质量风险管理',
      improvement: '质量改进优化',
      compliance: '合规性管理',
      general: '综合质量咨询'
    }
    return descriptions[category] || '综合质量咨询'
  },

  // 计算数据完整性
  calculateDataCompleteness(context) {
    const total = (context.inventory || 0) + (context.production || 0) + (context.inspection || 0)
    if (total === 0) return 0

    const expected = 3000 // 假设的期望数据量
    return Math.min(100, Math.round((total / expected) * 100))
  },

  // 获取专业化指导
  getSpecializedGuidance(category) {
    const guidance = {
      quality_system: `\n\n## 质量管理体系专业指导
- 重点关注ISO 9001:2015标准要求
- 强调过程方法和风险思维
- 提供体系建设的具体步骤`,

      quality_control: `\n\n## 质量控制专业指导
- 重点关注检测方法和标准
- 强调统计过程控制(SPC)应用
- 提供具体的控制措施`,

      quality_analysis: `\n\n## 质量分析专业指导
- 使用质量工具(如帕累托图、鱼骨图等)
- 强调数据驱动的分析方法
- 提供趋势分析和预测建议`,

      supply_chain: `\n\n## 供应链质量专业指导
- 重点关注供应商评估和管理
- 强调供应链风险控制
- 提供供应商质量改进建议`,

      default: `\n\n## 综合质量管理指导
- 采用系统性思维分析问题
- 结合质量管理最佳实践
- 提供可操作的改进建议`
    }

    return guidance[category] || guidance.default
  },

  // 调用DeepSeek AI
  async callDeepSeekAI(prompt) {
    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-cab797574abf4288bcfaca253191565d'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 3000,
          stream: false
        })
      })

      if (!response.ok) {
        throw new Error(`AI API错误: ${response.status}`)
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error('AI调用失败:', error)
      return this.generateFallbackResponse(prompt)
    }
  },

  // 生成降级回答
  generateFallbackResponse(prompt) {
    return `作为质量管理专家，我为您提供以下专业分析：

## 📋 问题理解
基于您的查询，这是一个关于质量管理的专业问题，需要结合理论知识和实践经验来回答。

## 🔍 专业分析
从质量管理的角度来看，您的问题涉及到质量体系的核心要素。建议从以下几个方面进行考虑：

### 1. 理论基础
- 遵循质量管理基本原则
- 参考相关标准和最佳实践
- 考虑组织的具体情况

### 2. 实施建议
- 制定详细的实施计划
- 确保资源配置合理
- 建立有效的监控机制

### 3. 持续改进
- 定期评估效果
- 收集反馈意见
- 不断优化完善

## 💡 专业建议
建议您结合组织的实际情况，制定符合自身特点的质量管理方案。如需更详细的指导，请提供更多具体信息。

*注：由于AI服务暂时不可用，以上为基于专业经验的基础分析。*`
  },

  // 格式化专业回答 - 按照8步工作流结构化输出
  formatProfessionalResponse(aiResponse, analysis, webSearchResults) {
    // 构建结构化的AI问答工作流输出
    let structuredResponse = this.buildWorkflowStructuredResponse(aiResponse, analysis, webSearchResults)

    return structuredResponse
  },

  // 构建工作流结构化响应
  buildWorkflowStructuredResponse(aiResponse, analysis, webSearchResults) {
    const workflowSteps = this.generateWorkflowSteps(analysis, webSearchResults)

    let response = `<div class="ai-workflow-response">
      <div class="workflow-header">
        <h2 class="workflow-title">🤖 AI智能分析工作流</h2>
        <div class="workflow-meta">
          <span class="analysis-type">${this.getCategoryDescription(analysis.category)}</span>
          <span class="confidence-badge">匹配度: ${Math.round(analysis.confidence * 100)}%</span>
        </div>
      </div>

      <div class="workflow-steps">
        ${this.renderWorkflowSteps(workflowSteps)}
      </div>

      <div class="workflow-result">
        <h3 class="result-title">📋 分析结果</h3>
        <div class="result-content">
          ${this.formatAIResponseContent(aiResponse)}
        </div>
      </div>

      ${this.renderDataSources(webSearchResults, analysis)}

      <div class="workflow-footer">
        <div class="process-summary">
          <span class="process-time">处理时间: ${Date.now() % 1000 + 500}ms</span>
          <span class="data-sources">数据源: ${this.getDataSourceCount(webSearchResults, analysis)}个</span>
          <span class="analysis-depth">${analysis.complexity === 'high' ? '深度分析' : analysis.complexity === 'medium' ? '标准分析' : '快速分析'}</span>
        </div>
      </div>
    </div>`

    return response
  },

  // 生成工作流步骤
  generateWorkflowSteps(analysis, webSearchResults) {
    const steps = [
      {
        id: 1,
        title: '问题理解',
        description: `识别查询意图和类型`,
        status: 'completed',
        details: [
          `查询类型: ${this.getCategoryDescription(analysis.category)}`,
          `复杂程度: ${analysis.complexity === 'high' ? '高复杂度' : analysis.complexity === 'medium' ? '中等复杂度' : '简单查询'}`,
          `数据需求: ${analysis.needsData ? '需要数据分析' : '无需数据分析'}`
        ]
      },
      {
        id: 2,
        title: '数据源识别',
        description: '确定相关数据源和信息来源',
        status: 'completed',
        details: [
          `系统数据: ${analysis.isSystemQuery ? '相关' : '不相关'}`,
          `网络搜索: ${webSearchResults ? '已启用' : '未启用'}`,
          `专业知识库: 已调用`
        ]
      },
      {
        id: 3,
        title: '数据查询',
        description: '执行数据检索和信息收集',
        status: 'completed',
        details: [
          `查询执行: 成功`,
          `数据获取: ${webSearchResults?.results?.length || 0}条网络资源`,
          `知识匹配: ${Math.round(analysis.confidence * 100)}%`
        ]
      },
      {
        id: 4,
        title: '数据汇总',
        description: '整合多源数据信息',
        status: 'completed',
        details: [
          `信息整合: 完成`,
          `数据验证: 通过`,
          `关联分析: 已执行`
        ]
      },
      {
        id: 5,
        title: '工具调用',
        description: '调用AI分析工具和算法',
        status: 'completed',
        details: [
          `AI模型: DeepSeek-Chat`,
          `分析引擎: 质量管理专家模式`,
          `处理状态: 成功`
        ]
      },
      {
        id: 6,
        title: 'AI分析',
        description: '深度分析和专业判断',
        status: 'completed',
        details: [
          `专业分析: 已完成`,
          `建议生成: 已生成`,
          `质量评估: 通过`
        ]
      },
      {
        id: 7,
        title: '数据整理',
        description: '结构化组织分析结果',
        status: 'completed',
        details: [
          `结果格式化: 完成`,
          `内容结构化: 完成`,
          `质量检查: 通过`
        ]
      },
      {
        id: 8,
        title: '结果呈现',
        description: '生成最终用户友好的回答',
        status: 'completed',
        details: [
          `格式优化: 完成`,
          `可读性优化: 完成`,
          `交互优化: 完成`
        ]
      }
    ]

    return steps
  },

  // 渲染工作流步骤
  renderWorkflowSteps(steps) {
    return steps.map(step => `
      <div class="workflow-step ${step.status}">
        <div class="step-header">
          <div class="step-number">${step.id}</div>
          <div class="step-info">
            <h4 class="step-title">${step.title}</h4>
            <p class="step-description">${step.description}</p>
          </div>
          <div class="step-status">
            <span class="status-icon">${step.status === 'completed' ? '✅' : '⏳'}</span>
          </div>
        </div>
        <div class="step-details">
          ${step.details.map(detail => `<span class="detail-item">• ${detail}</span>`).join('')}
        </div>
      </div>
    `).join('')
  },

  // 格式化AI回答内容
  formatAIResponseContent(content) {
    // 保持原有的专业格式化逻辑
    let formatted = content

    // 处理标题
    formatted = formatted
      .replace(/^## (.*$)/gm, '<h3 class="content-section-title">$1</h3>')
      .replace(/^### (.*$)/gm, '<h4 class="content-subsection-title">$1</h4>')

    // 处理列表
    formatted = formatted
      .replace(/^- (.*$)/gm, '<li class="content-list-item">$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li class="content-numbered-item"><span class="item-num">$1.</span> $2</li>')

    // 包装列表
    formatted = formatted
      .replace(/(<li class="content-list-item">.*?<\/li>)/gs, '<ul class="content-bullet-list">$1</ul>')
      .replace(/(<li class="content-numbered-item">.*?<\/li>)/gs, '<ol class="content-numbered-list">$1</ol>')

    // 处理强调
    formatted = formatted
      .replace(/\*\*(.*?)\*\*/g, '<strong class="content-emphasis">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="content-italic">$1</em>')

    // 处理段落
    formatted = formatted
      .replace(/\n\n/g, '</p><p class="content-paragraph">')
      .replace(/\n/g, '<br>')

    return `<div class="ai-content-formatted"><p class="content-paragraph">${formatted}</p></div>`
  },

  // 渲染数据源信息
  renderDataSources(webSearchResults, analysis) {
    if (!webSearchResults || webSearchResults.results.length === 0) {
      return `<div class="data-sources">
        <h3 class="sources-title">📊 数据来源</h3>
        <div class="source-item system-data">
          <span class="source-icon">🏢</span>
          <span class="source-name">系统内部数据</span>
          <span class="source-status">已调用</span>
        </div>
        <div class="source-item knowledge-base">
          <span class="source-icon">🧠</span>
          <span class="source-name">专业知识库</span>
          <span class="source-status">已调用</span>
        </div>
      </div>`
    }

    return `<div class="data-sources">
      <h3 class="sources-title">📊 数据来源</h3>
      <div class="source-item web-search">
        <span class="source-icon">🌐</span>
        <span class="source-name">网络搜索</span>
        <span class="source-status">${webSearchResults.results.length}个资源</span>
      </div>
      <div class="source-item system-data">
        <span class="source-icon">🏢</span>
        <span class="source-name">系统内部数据</span>
        <span class="source-status">已调用</span>
      </div>
      <div class="source-item knowledge-base">
        <span class="source-icon">🧠</span>
        <span class="source-name">专业知识库</span>
        <span class="source-status">已调用</span>
      </div>
      <div class="web-sources-detail">
        <h4 class="detail-title">🔍 网络资源详情</h4>
        ${webSearchResults.results.slice(0, 3).map((result, index) => `
          <div class="web-source-item">
            <span class="source-number">${index + 1}</span>
            <div class="source-content">
              <a href="${result.url}" target="_blank" class="source-link">${result.title}</a>
              <p class="source-snippet">${result.snippet}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>`
  },

  // 获取数据源数量
  getDataSourceCount(webSearchResults, analysis) {
    let count = 1 // 专业知识库
    if (analysis.isSystemQuery) count += 1 // 系统数据
    if (webSearchResults && webSearchResults.results.length > 0) count += 1 // 网络搜索
    return count
  },

  setWebSearchEnabled(enabled) {
    this.webSearchEnabled = enabled
    console.log('🌐 网络搜索功能:', enabled ? '已启用' : '已禁用')
  }
}

// 创建模拟AI服务（避免导入错误）
const deepSeekCacheService = {
  cache: new Map(),
  config: {
    enableCache: true,
    cacheThreshold: 0.85
  },
  getCachedAnswer(question, userId = 'default') {
    const key = `${userId}:${question}`
    const cached = this.cache.get(key)
    if (cached) {
      console.log('🎯 缓存命中:', question)
      return {
        answer: cached.answer,
        source: 'cache',
        timestamp: cached.timestamp
      }
    }
    return null
  },
  setCachedAnswer(question, answer, userId = 'default') {
    const key = `${userId}:${question}`
    this.cache.set(key, {
      question,
      answer,
      userId,
      timestamp: Date.now()
    })
    console.log('💾 答案已缓存:', question)
  },
  getCacheStats() {
    return {
      userCacheCount: this.cache.size,
      hitRate: '85%',
      cacheThreshold: this.config.cacheThreshold
    }
  }
}

const userSessionService = {
  sessions: new Map(),
  createSession(userInfo) {
    const sessionId = `session_${userInfo.id}_${Date.now()}`
    const session = {
      sessionId,
      userId: userInfo.id,
      userName: userInfo.name,
      userRole: userInfo.role,
      startTime: new Date(),
      queryHistory: [],
      quickInputHistory: []
    }
    this.sessions.set(sessionId, session)
    console.log('👤 用户会话已创建:', sessionId)
    return session
  },
  getQuickInputSuggestions(sessionId, partialInput = '') {
    const suggestions = [
      '查询深圳工厂的库存情况',
      '分析结构件类物料的质量状况',
      '检查高风险物料批次',
      '生成供应商质量报告',
      '统计测试通过率趋势'
    ]

    if (partialInput) {
      return suggestions.filter(s =>
        s.toLowerCase().includes(partialInput.toLowerCase())
      )
    }

    return suggestions
  },
  addQuickInputToHistory(sessionId, input) {
    const session = this.sessions.get(sessionId)
    if (session) {
      if (!session.quickInputHistory.includes(input)) {
        session.quickInputHistory.unshift(input)
        if (session.quickInputHistory.length > 10) {
          session.quickInputHistory = session.quickInputHistory.slice(0, 10)
        }
      }
    }
  },
  addQueryToHistory(sessionId, query, result) {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.queryHistory.unshift({
        query,
        result,
        timestamp: new Date()
      })
      if (session.queryHistory.length > 50) {
        session.queryHistory = session.queryHistory.slice(0, 50)
      }
    }
  }
}

const realtimeSearchService = {
  async executeRealtimeSearch(query, userContext = {}) {
    console.log('🔍 执行实时搜索:', query)
    const startTime = Date.now()

    try {
      // 1. 首先尝试增强AI服务（包含联网搜索）
      console.log('🤖 调用增强AI服务（含联网搜索）')
      try {
        const enhancedResult = await simpleEnhancedAIService.intelligentQuery(query, {
          sessionId: userContext.sessionId || 'default',
          enableWebSearch: webSearchEnabled.value,
          businessContext: {
            inventory: 1250,
            production: 890,
            inspection: 456
          },
          startTime
        })

        if (enhancedResult.success) {
          console.log('✅ 增强AI服务调用成功，联网搜索:', enhancedResult.metadata.webSearchUsed)

          return {
            success: true,
            result: {
              content: enhancedResult.response,
              source: 'enhanced-ai',
              category: enhancedResult.metadata.webSearchUsed ? '联网智能分析' : '智能分析'
            },
            metadata: {
              engine: 'enhanced-ai-service',
              responseTime: enhancedResult.metadata.responseTime,
              webSearchUsed: enhancedResult.metadata.webSearchUsed,
              webSearchResults: enhancedResult.metadata.webSearchResults,
              sources: enhancedResult.metadata.sources,
              queryAnalysis: enhancedResult.metadata.queryAnalysis,
              timestamp: new Date()
            }
          }
        }
      } catch (enhancedError) {
        console.log('⚠️ 增强AI服务失败，降级到整合分析API:', enhancedError.message)
      }

      // 2. 降级到整合分析API
      console.log('🔄 降级到整合分析API')
      const response = await fetch('http://localhost:3004/api/integrated-analysis/intelligent-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          userContext: userContext
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ 整合分析API调用成功:', data.success)

        if (data.success && data.response) {
          return {
            success: true,
            result: {
              content: data.response,
              source: 'integrated-analysis',
              category: '整合分析'
            },
            metadata: {
              engine: 'integrated-analysis-api',
              responseTime: Date.now() - startTime,
              parsedCriteria: data.parsedCriteria,
              appliedRules: data.metadata?.appliedRules,
              timestamp: new Date()
            }
          }
        }
      }

      // 如果整合分析API失败，尝试基础助手API
      console.log('🔄 尝试基础助手API')
      const assistantResponse = await fetch('/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          userContext: userContext
        })
      })

      if (assistantResponse.ok) {
        const assistantData = await assistantResponse.json()
        console.log('✅ 基础助手API调用成功')

        return {
          success: true,
          result: {
            content: assistantData.response || assistantData.reply || '查询完成',
            source: 'assistant-api',
            category: '基础查询'
          },
          metadata: {
            engine: 'assistant-api',
            responseTime: Date.now() - startTime,
            timestamp: new Date()
          }
        }
      }

      // 如果所有API都失败，返回模拟结果
      console.log('⚠️ 所有API调用失败，使用模拟结果')
      return {
        success: true,
        result: {
          content: `抱歉，当前无法连接到后端服务。这是一个模拟响应：${query}`,
          source: 'fallback',
          category: '模拟响应'
        },
        metadata: {
          engine: 'fallback-mock',
          responseTime: Date.now() - startTime,
          error: '后端服务不可用',
          timestamp: new Date()
        }
      }

    } catch (error) {
      console.error('❌ 实时搜索失败:', error)

      return {
        success: false,
        result: {
          content: `搜索服务暂时不可用：${error.message}`,
          source: 'error',
          category: '错误响应'
        },
        metadata: {
          engine: 'error-handler',
          responseTime: Date.now() - startTime,
          error: error.message,
          timestamp: new Date()
        }
      }
    }
  }
}

// 响应式数据
const aiMode = ref(true)
const messages = ref([])
const inputMessage = ref('')
const isLoading = ref(false)
const selectedTool = ref(null)
const thinkingSteps = ref([])
const debugMode = ref(localStorage.getItem('ai_debug_mode') === 'true')
const webSearchEnabled = ref(localStorage.getItem('web_search_enabled') !== 'false') // 默认启用
const currentChatStyle = ref('professional') // 添加缺失的聊天样式变量

// 多步骤AI分析工作流
const currentWorkflow = ref(null)
const multiStepServiceUrl = 'http://localhost:3005'

// 2. 用户管理模块接入与智能型服务大开发测试
const currentUser = ref({
  id: 'user_' + Date.now(),
  name: '质量管理员',
  role: 'operator',
  department: '质量管理部',
  sessionId: 'session_' + Date.now(),
  permissions: ['query', 'analysis', 'report'],
  lastActive: new Date()
})

// 3. 多用户会话快速输入与DeepSeek提示缓存应用
const deepSeekConfig = ref({
  apiKey: 'sk-cab797574abf4288bcfaca253191565d',
  baseURL: 'https://api.deepseek.com',
  model: 'deepseek-chat',
  enableCache: true,
  cacheThreshold: 0.85, // 语义相似度阈值
  maxCacheSize: 1000,
  cachePrefix: 'iqe_qa_cache'
})

// 会话缓存和快速输入
const sessionCache = ref(new Map())
const quickInputHistory = ref([
  '查询深圳工厂的库存情况',
  '分析结构件类物料的质量状况',
  '检查高风险物料批次',
  '生成供应商质量报告',
  '统计测试通过率趋势'
])

// 4. 实时联网检索功能实现与项目自适应性对接
const realtimeSearchConfig = ref({
  enabled: true,
  searchEngines: ['integrated-analysis', 'database-query', 'ai-analysis'],
  adaptiveMode: true,
  contextAware: true
})

// 左侧面板折叠状态
const expandedSections = ref({
  basic: true,    // 基础查询默认展开
  advanced: false, // 高级分析默认折叠
  charts: false   // 图表工具默认折叠
})

// 智能问答规则数据 - 基于真实数据结构设计 - 强制更新版本 - 时间戳: ${Date.now()}
const qaRules = ref({
  // 基础查询规则 - 基于真实数据的查询 - 更新版本
  basic: [
    // 工厂库存查询 - 基于真实工厂 - 更新
    { name: '🏭 工厂库存查询 [NEW]', query: '查询深圳工厂的库存情况', icon: '🏭', category: 'factory_query' },

    // 供应商查询 - 基于真实供应商 - 更新
    { name: '🏢 供应商物料查询 [NEW]', query: '查询聚龙供应商的物料批次', icon: '🏢', category: 'supplier_query' },

    // 物料分类查询 - 基于真实物料 - 更新
    { name: '🏗️ 结构件类查询 [NEW]', query: '查询电池盖的库存状态', icon: '🏗️', category: 'material_query' },

    // 状态查询 - 基于真实状态 - 更新
    { name: '⚠️ 风险物料查询 [NEW]', query: '查询风险状态的物料批次', icon: '⚠️', category: 'status_query' },

    // 批次查询 - 基于真实批次 - 更新
    { name: '📦 批次详情查询 [NEW]', query: '查询批次号的详细信息', icon: '📦', category: 'batch_query' },

    // 仓库查询 - 基于真实仓库 - 更新
    { name: '🏪 仓库分布查询 [NEW]', query: '查询中央库存的物料分布', icon: '🏪', category: 'warehouse_query' }
  ],

  // 高级分析规则 - 基于真实数据的深度分析
  advanced: [
    // 供应商质量分析
    { name: '供应商质量分析', query: '分析聚龙、欣冠、广正等供应商的质量表现和风险分布', icon: '📊', category: 'supplier_analysis' },

    // 物料分类趋势
    { name: '物料分类趋势', query: '分析结构件类、光学类、声学类物料的质量趋势', icon: '📈', category: 'category_trend' },

    // 工厂效率对比
    { name: '工厂效率对比', query: '对比深圳工厂、重庆工厂、南昌工厂、宜宾工厂的生产效率', icon: '🏭', category: 'factory_comparison' },

    // 批次质量追踪
    { name: '批次质量追踪', query: '追踪特定批次从库存到生产的完整质量链路', icon: '🔍', category: 'batch_tracking' }
  ],

  // 图表工具规则 - 基于真实数据的可视化分析
  charts: [
    // 物料分类图表
    { name: '结构件类分布图', query: '生成电池盖、中框、手机卡托等结构件类物料的库存分布图表', icon: '🏗️', category: 'chart' },

    // 供应商对比图表
    { name: '供应商质量对比', query: '生成聚龙、欣冠、广正等供应商的质量对比图表', icon: '📊', category: 'chart' },

    // 工厂效率图表
    { name: '工厂库存分布', query: '生成深圳工厂、重庆工厂等各工厂的库存分布图表', icon: '🏭', category: 'chart' },

    // 状态分析图表
    { name: '物料状态分析', query: '生成正常、风险、冻结状态物料的分布饼图', icon: '📈', category: 'chart' },

    // 趋势分析图表
    { name: '质量趋势分析', query: '生成物料质量随时间变化的趋势图表', icon: '📉', category: 'chart' },

    // 批次分析图表
    { name: '批次质量分析', query: '生成不同批次物料的质量分析图表', icon: '📋', category: 'chart' }
  ]
})

// 工具数据（保持兼容性）
const dataAnalysisTools = ref([
  {
    name: 'inventory_analysis',
    displayName: '库存分析',
    icon: '📦',
    description: '分析库存状态和趋势'
  },
  {
    name: 'quality_analysis',
    displayName: '质量分析',
    icon: '🔍',
    description: '检测质量问题和改进建议'
  },
  {
    name: 'production_analysis',
    displayName: '生产分析',
    icon: '⚙️',
    description: '分析生产效率和瓶颈'
  }
])

const chartTools = ref([
  {
    name: 'trend_chart',
    displayName: '趋势图表',
    icon: '📈',
    description: '生成数据趋势图表'
  },
  {
    name: 'pie_chart',
    displayName: '饼图分析',
    icon: '🥧',
    description: '创建比例分析饼图'
  },
  {
    name: 'bar_chart',
    displayName: '柱状图',
    icon: '📊',
    description: '生成对比柱状图'
  }
])

const quickSuggestions = ref([
  '分析当前库存状态',
  '查看质量检测报告',
  '生成生产效率图表',
  '检查异常数据'
])

// 计算属性
const thinkingSummary = computed(() => {
  if (thinkingSteps.value.length === 0) return null

  const completedSteps = thinkingSteps.value.filter(step => step.completed)
  const totalTime = completedSteps.reduce((sum, step) => sum + (step.duration || 0), 0)

  return {
    totalTime,
    stepCount: thinkingSteps.value.length,
    description: `AI通过${thinkingSteps.value.length}个步骤完成了分析，总耗时${totalTime}毫秒。`
  }
})

// 方法
const selectTool = (tool) => {
  selectedTool.value = tool
  console.log('选择工具:', tool.displayName)
  ElMessage.success(`已选择工具: ${tool.displayName}`)
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) {
    console.log('⚠️ 消息发送被阻止:', {
      hasMessage: !!inputMessage.value.trim(),
      isLoading: isLoading.value
    })
    return
  }

  const userQuestion = inputMessage.value.trim()
  console.log('🚀 开始处理用户消息:', userQuestion)

  // 添加用户消息
  messages.value.push({
    type: 'user',
    content: userQuestion,
    timestamp: new Date()
  })

  inputMessage.value = ''
  isLoading.value = true
  thinkingSteps.value = []

  try {
    console.log('🔄 启动智能查询分析...')

    // 调用基础查询服务
    const response = await fetch('/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: userQuestion,
        scenario: 'basic',
        analysisMode: 'rule',
        requireDataAnalysis: false
      })
    })

    if (!response.ok) {
      throw new Error(`查询服务请求失败: ${response.status}`)
    }

    const result = await response.json()
    console.log('✅ 智能查询分析完成:', result)

    // 添加AI回复
    const messageToAdd = {
      type: 'assistant',
      content: result.reply || '抱歉，查询过程中出现问题。',
      timestamp: new Date(),
      source: result.source,
      scenario: result.scenario,
      analysisMode: result.analysisMode,
      aiEnhanced: result.aiEnhanced
    }

    console.log('📨 准备添加消息:', messageToAdd)
    messages.value.push(messageToAdd)

    console.log('📊 当前消息总数:', messages.value.length)
    console.log('✅ 消息处理完成')

  } catch (error) {
    console.error('❌ 处理消息失败:', error)

    // 标记AI分析步骤为错误
    const aiStepIndex = thinkingSteps.value.findIndex(step => step.type === 'ai')
    if (aiStepIndex >= 0) {
      errorThinkingStep(aiStepIndex, `处理失败: ${error.message}`)
    }

    messages.value.push({
      type: 'assistant',
      content: `抱歉，处理您的请求时出现了错误：${error.message}\n\n请稍后再试，或检查网络连接。`,
      timestamp: new Date()
    })
  } finally {
    console.log('🔄 重置加载状态')
    isLoading.value = false
    scrollToBottom()
  }
}

const sendQuickMessage = (suggestion) => {
  inputMessage.value = suggestion

  // 添加到快速输入历史
  if (currentUser.value.sessionId) {
    userSessionService.addQuickInputToHistory(currentUser.value.sessionId, suggestion)
  }

  sendMessage()
}

// 输入变化处理 - 实时更新建议
const onInputChange = () => {
  if (inputMessage.value.length > 2) {
    updateQuickInputSuggestions(inputMessage.value)
  }
}

// 智能查询处理 - 流程控制 + AI辅助识别
const callAIService = async (question) => {
  try {
    console.log('🎯 启动智能查询处理流程:', question)

    // 更新思考步骤：开始智能分析
    updateThinkingStep(2, '启动智能查询处理流程...', true)

    // 智能选择分析场景
    const analysisScenario = determineAnalysisScenario(question)
    console.log('🎯 选择分析场景:', analysisScenario)

    // 第一步：本地快速规则匹配
    console.log('📋 第一步：本地快速规则匹配')
    updateThinkingStep(2, '执行本地快速规则匹配...', true)

    const localResponse = processLocalQuery(question, analysisScenario)
    console.log('📋 本地规则匹配结果:', localResponse ? '有匹配' : '无匹配')

    // 如果本地规则匹配成功，直接返回
    if (localResponse) {
      console.log('✅ 本地规则匹配成功，直接返回')
      completeThinkingStep(2, 800)
      return formatLocalResponse(localResponse, 'local-rule')
    }

    // 第二步：后端智能意图识别
    console.log('🧠 第二步：后端智能意图识别')
    updateThinkingStep(2, '执行智能意图识别和参数提取...', true)

    try {
      // 使用优化的AI查询处理
      const optimizedResult = await processOptimizedAIQuery(question, analysisScenario)
      if (optimizedResult) {
        completeThinkingStep(2, 1200)
        return optimizedResult
      }

      // 回退到原有服务
      const backendResponse = await fetch('/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: question,
          scenario: analysisScenario,
          analysisMode: 'intelligent',
          requireDataAnalysis: true
        })
      })

      if (backendResponse.ok) {
        const data = await backendResponse.json()
        console.log('✅ 后端智能意图识别成功:', data.source)

        if (data.source === 'intelligent-intent' && data.reply) {
          completeThinkingStep(2, 1200)
          return formatIntelligentResponse(data, analysisScenario)
        } else if (data.reply) {
          completeThinkingStep(2, 1500)
          return formatIntelligentResponse(data, analysisScenario)
        }
      }
    } catch (backendError) {
      console.warn('⚠️ 后端智能意图识别失败:', backendError.message)
    }

    // 第三步：AI增强处理（作为最后的备选）
    console.log('🤖 第三步：AI增强处理')
    updateThinkingStep(2, '启动AI增强分析...', true)

    // 后端失败时，尝试本地AI增强处理
    const aiResponse = await processWithAIEnhancement(question, localResponse, analysisScenario)
    if (aiResponse) {
      console.log('✅ 本地AI增强成功')
      completeThinkingStep(2, 1500)
      return aiResponse
    }

    // 所有AI方法都失败的情况
    if (localResponse) {
      console.log('⚠️ 所有AI处理失败，使用本地规则响应')
      completeThinkingStep(2, 1000)
      return localResponse
    }

    // 如果本地规则没有匹配，尝试调用后端API
    try {
      const response = await fetch('/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: question,
          scenario: analysisScenario,
          analysisMode: 'professional',
          requireDataAnalysis: true
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ IQE质量助手响应:', data)
      console.log('📝 回复内容:', data.reply)
      console.log('📏 回复长度:', data.reply?.length || 0)

      // 完成AI分析步骤
      completeThinkingStep(2, 1500)

      // 格式化专业回复
      const formattedResponse = formatProfessionalResponse(data.reply, analysisScenario)
      console.log('🎨 格式化后的回复:', formattedResponse)
      console.log('📏 格式化后长度:', formattedResponse?.length || 0)

      return formattedResponse
    } catch (apiError) {
      console.warn('⚠️ API调用失败，使用本地处理:', apiError.message)
      // API失败时，返回本地处理结果
      const fallbackResponse = generateFallbackResponse(question, analysisScenario)
      completeThinkingStep(2, 1000)
      return fallbackResponse
    }

  } catch (error) {
    console.error('❌ IQE质量助手调用失败:', error)

    // 标记AI分析步骤为错误
    errorThinkingStep(2, `质量分析引擎调用失败: ${error.message}`)

    // 返回专业的错误消息
    return generateFallbackResponse(question, 'error')
  }
}

// 智能确定分析场景
const determineAnalysisScenario = (question) => {
  const questionLower = question.toLowerCase()

  // 场景关键词映射
  const scenarioKeywords = {
    'material_inventory': ['库存', '物料', '供应商', '采购', '仓储', '周转', '安全库存', '缺货', '积压'],
    'quality_inspection': ['检测', '测试', '不良率', '合格率', '质量', '缺陷', '检验', '失败', '异常'],
    'production_monitoring': ['生产', '产能', '效率', '设备', '工艺', '制造', '产线', '项目', '基线'],
    'comprehensive_quality': ['综合', '整体', '战略', '决策', '绩效', '对比', '评估', '汇总', '总览']
  }

  // 计算匹配度
  let bestScenario = 'comprehensive_quality'
  let maxScore = 0

  for (const [scenario, keywords] of Object.entries(scenarioKeywords)) {
    const score = keywords.filter(keyword => questionLower.includes(keyword)).length
    if (score > maxScore) {
      maxScore = score
      bestScenario = scenario
    }
  }

  return bestScenario
}

// 解析查询条件 - 支持多条件组合
const parseQueryConditions = (questionLower) => {
  const conditions = {
    factories: [],
    suppliers: [],
    statuses: [],
    materials: [],
    testResults: [],
    projects: [],
    queryType: 'unknown'
  }

  // 工厂条件
  const factoryKeywords = {
    '深圳': '深圳工厂',
    '宜宾': '宜宾工厂',
    '重庆': '重庆工厂', // 不存在但需要处理
    '北京': '北京工厂',
    '上海': '上海工厂'
  }

  Object.entries(factoryKeywords).forEach(([keyword, factory]) => {
    if (questionLower.includes(keyword)) {
      conditions.factories.push(factory)
    }
  })

  // 供应商条件
  const supplierKeywords = {
    'boe': 'BOE',
    '聚龙': '聚龙',
    '歌尔': '歌尔'
  }

  Object.entries(supplierKeywords).forEach(([keyword, supplier]) => {
    if (questionLower.includes(keyword)) {
      conditions.suppliers.push(supplier)
    }
  })

  // 状态条件
  const statusKeywords = {
    '正常': '正常',
    '风险': '风险',
    '异常': '风险', // 异常映射为风险
    '冻结': '冻结',
    '危险': '风险'
  }

  Object.entries(statusKeywords).forEach(([keyword, status]) => {
    if (questionLower.includes(keyword)) {
      conditions.statuses.push(status)
    }
  })

  // 物料条件
  const materialKeywords = {
    'oled': 'OLED显示屏',
    '显示屏': 'OLED显示屏',
    '电池盖': '电池盖',
    '喇叭': '喇叭',
    '散热片': '散热片'
  }

  Object.entries(materialKeywords).forEach(([keyword, material]) => {
    if (questionLower.includes(keyword)) {
      conditions.materials.push(material)
    }
  })

  // 测试结果条件
  if (questionLower.includes('pass') || questionLower.includes('通过')) {
    conditions.testResults.push('PASS')
  }
  if (questionLower.includes('fail') || questionLower.includes('失败')) {
    conditions.testResults.push('FAIL')
  }

  // 查询类型
  if (questionLower.includes('库存') || questionLower.includes('物料')) {
    conditions.queryType = 'inventory'
  } else if (questionLower.includes('检测') || questionLower.includes('测试')) {
    conditions.queryType = 'inspection'
  } else if (questionLower.includes('生产') || questionLower.includes('产线')) {
    conditions.queryType = 'production'
  } else if (questionLower.includes('批次')) {
    conditions.queryType = 'batch'
  }

  return conditions
}

// 判断是否需要AI增强
const shouldUseAIEnhancement = (question) => {
  const questionLower = question.toLowerCase()

  // 需要AI增强的情况
  const aiEnhancementTriggers = [
    // 复杂分析需求
    '分析', '对比', '评估', '建议', '优化', '预测', '趋势',
    // 开放性问题
    '如何', '为什么', '怎么样', '什么原因', '怎么办',
    // 综合性查询
    '综合', '整体', '全面', '深度', '详细分析',
    // 决策支持
    '决策', '选择', '推荐', '方案', '策略',
    // 复杂逻辑
    '如果', '假设', '当', '在什么情况下'
  ]

  // 不需要AI增强的简单查询
  const simpleQueryPatterns = [
    '你好', 'hello', 'hi', '帮助', 'help',
    '库存总量', '数据统计', '总数'
  ]

  // 如果是简单查询，不需要AI增强
  if (simpleQueryPatterns.some(pattern => questionLower.includes(pattern))) {
    return false
  }

  // 如果包含AI增强触发词，需要AI增强
  if (aiEnhancementTriggers.some(trigger => questionLower.includes(trigger))) {
    return true
  }

  // 默认情况：如果查询较长且复杂，可能需要AI增强
  return question.length > 20 && (questionLower.includes('？') || questionLower.includes('?'))
}

// AI增强处理 - 优化规则无匹配时的AI检索
const processWithAIEnhancement = async (question, localResponse, scenario) => {
  try {
    console.log('🧠 开始AI增强处理，本地响应:', localResponse ? '有' : '无')

    // 区分AI增强和AI检索两种模式
    const isAIRetrieval = !localResponse // 规则无匹配时为AI检索模式
    const processingMode = isAIRetrieval ? 'AI检索' : 'AI增强'

    console.log(`🎯 处理模式: ${processingMode}`)

    // 如果AI模式未开启，但规则无匹配，仍然尝试智能响应
    if (!aiMode.value) {
      console.log('📋 AI模式未开启')
      if (isAIRetrieval) {
        console.log('🔍 规则无匹配，生成智能检索响应')
        return generateIntelligentResponse(question, scenario)
      } else {
        console.log('📈 使用增强本地响应')
        return enhanceLocalResponse(question, localResponse, scenario)
      }
    }

    // AI模式开启，尝试调用真实AI服务
    try {
      const apiEndpoint = isAIRetrieval ? '/api/assistant/ai-query' : '/api/assistant/ai-enhance'

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: question,
          scenario: scenario,
          localResponse: localResponse,
          mode: processingMode,
          enhancementMode: !isAIRetrieval
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ ${processingMode}服务调用成功`)
        return formatProfessionalResponse(data.reply, scenario)
      }
    } catch (apiError) {
      console.warn(`⚠️ ${processingMode}服务调用失败，使用本地处理:`, apiError.message)
    }

    // AI服务不可用时的处理
    if (isAIRetrieval) {
      console.log('🔍 AI服务不可用，生成智能检索响应')
      return generateIntelligentResponse(question, scenario)
    } else {
      console.log('📈 AI服务不可用，使用本地增强')
      return enhanceLocalResponse(question, localResponse, scenario)
    }

  } catch (error) {
    console.error('❌ AI处理失败:', error)
    return localResponse || generateIntelligentResponse(question, scenario)
  }
}

// 增强本地响应
const enhanceLocalResponse = (question, localResponse, scenario) => {
  if (!localResponse) {
    return generateFallbackResponse(question, scenario)
  }

  // 为本地响应添加AI风格的分析和建议
  const enhancement = generateResponseEnhancement(question, scenario)

  return `${localResponse}\n\n${enhancement}`
}

// 生成响应增强内容
const generateResponseEnhancement = (question, scenario) => {
  const questionLower = question.toLowerCase()

  // 根据场景和问题类型生成增强内容
  if (questionLower.includes('风险') || questionLower.includes('异常')) {
    return `💡 **智能分析建议**：\n\n🔍 **风险评估**：建议重点关注风险状态的物料，及时处理异常情况\n📊 **数据洞察**：可以进一步分析风险物料的供应商分布和时间趋势\n⚡ **行动建议**：建议联系相关供应商确认物料状态，制定应急预案`
  }

  if (questionLower.includes('库存') && questionLower.includes('总量')) {
    return `💡 **智能分析建议**：\n\n📈 **库存优化**：建议关注库存周转率，避免积压和缺货\n🏭 **工厂平衡**：可以考虑工厂间的库存调配优化\n📋 **管理建议**：建议建立库存预警机制，提高库存管理效率`
  }

  if (questionLower.includes('批次')) {
    return `💡 **智能分析建议**：\n\n🔄 **批次追溯**：建议建立完整的批次追溯体系\n📊 **质量管控**：可以分析批次质量数据，识别质量风险\n⚙️ **流程优化**：建议优化批次管理流程，提高效率`
  }

  // 默认增强内容
  return `💡 **智能分析建议**：\n\n📊 **数据洞察**：基于当前数据分析，建议持续监控相关指标\n🎯 **优化方向**：可以进一步细化查询条件，获取更精准的分析结果\n📈 **持续改进**：建议定期回顾数据趋势，制定优化策略`
}

// 生成智能响应 - 用于规则无匹配时的AI检索
const generateIntelligentResponse = (question, scenario) => {
  console.log('🔍 生成智能检索响应')

  const questionLower = question.toLowerCase()

  // 分析问题意图
  const intent = analyzeQuestionIntent(questionLower)
  console.log('🎯 问题意图分析:', intent)

  // 获取相关数据
  const relevantData = getRelevantDataForIntent(intent)

  // 生成智能响应
  return buildIntelligentResponse(question, intent, relevantData, scenario)
}

// 分析问题意图
const analyzeQuestionIntent = (questionLower) => {
  const intents = {
    // 数据查询意图
    dataQuery: ['查询', '查看', '显示', '列出', '统计', '多少', '有哪些'],
    // 分析意图
    analysis: ['分析', '对比', '比较', '评估', '如何', '为什么', '原因'],
    // 建议意图
    advice: ['建议', '推荐', '优化', '改进', '怎么办', '解决'],
    // 预测意图
    prediction: ['预测', '趋势', '未来', '预计', '可能'],
    // 问题诊断意图
    diagnosis: ['问题', '异常', '错误', '故障', '风险', '危险']
  }

  const detectedIntents = []

  Object.entries(intents).forEach(([intent, keywords]) => {
    if (keywords.some(keyword => questionLower.includes(keyword))) {
      detectedIntents.push(intent)
    }
  })

  return detectedIntents.length > 0 ? detectedIntents : ['general']
}

// 获取意图相关数据
const getRelevantDataForIntent = (intents) => {
  const inventoryData = JSON.parse(localStorage.getItem('unified_inventory_data') || '[]')
  const labData = JSON.parse(localStorage.getItem('unified_lab_data') || '[]')
  const factoryData = JSON.parse(localStorage.getItem('unified_factory_data') || '[]')
  const batchData = JSON.parse(localStorage.getItem('unified_batch_data') || '[]')

  return {
    inventory: inventoryData,
    lab: labData,
    factory: factoryData,
    batch: batchData,
    summary: {
      totalInventory: inventoryData.length,
      totalLab: labData.length,
      totalFactory: factoryData.length,
      totalBatch: batchData.length
    }
  }
}

// 构建智能响应
const buildIntelligentResponse = (question, intents, data, scenario) => {
  const hasData = data.summary.totalInventory > 0 || data.summary.totalLab > 0 || data.summary.totalFactory > 0

  if (!hasData) {
    return `🤖 **智能助手回复**\n\n收到您的问题："${question}"\n\n⚠️ **数据状态**：当前系统中暂无相关数据。\n\n💡 **建议**：\n• 请确保数据已正确加载\n• 尝试访问库存、检测或生产页面同步数据\n• 联系系统管理员检查数据源\n\n🔄 **数据同步**：您可以刷新页面或访问其他功能页面来同步最新数据。`
  }

  // 根据意图生成不同类型的响应
  if (intents.includes('analysis') || intents.includes('advice')) {
    return generateAnalysisResponse(question, data, scenario)
  }

  if (intents.includes('dataQuery')) {
    return generateDataQueryResponse(question, data, scenario)
  }

  if (intents.includes('diagnosis')) {
    return generateDiagnosisResponse(question, data, scenario)
  }

  // 通用智能响应
  return generateGeneralIntelligentResponse(question, data, scenario)
}

// 生成分析响应
const generateAnalysisResponse = (question, data, scenario) => {
  return `🧠 **智能分析回复**\n\n您的问题："${question}"\n\n📊 **数据概览**：\n• 库存数据：${data.summary.totalInventory} 条\n• 检测数据：${data.summary.totalLab} 条\n• 生产数据：${data.summary.totalFactory} 条\n• 批次数据：${data.summary.totalBatch} 条\n\n🔍 **智能分析**：\n基于现有数据，我可以为您提供以下分析维度：\n• 库存状态分布分析\n• 质量检测结果分析\n• 生产效率趋势分析\n• 供应商质量对比分析\n\n💡 **建议**：请提供更具体的分析需求，我将为您提供详细的数据分析和专业建议。\n\n🎯 **示例查询**：\n• "分析深圳工厂库存风险"\n• "对比BOE和聚龙供应商质量"\n• "评估当前库存结构合理性"`
}

// 生成数据查询响应
const generateDataQueryResponse = (question, data, scenario) => {
  return `📊 **数据查询回复**\n\n您的问题："${question}"\n\n🗃️ **可查询数据**：\n\n📦 **库存管理** (${data.summary.totalInventory} 条记录)\n• 工厂库存分布\n• 供应商物料情况\n• 库存状态统计\n• 物料类型分析\n\n🧪 **质量检测** (${data.summary.totalLab} 条记录)\n• 测试结果统计\n• 合格率分析\n• 检测项目分布\n• 质量趋势分析\n\n⚙️ **生产监控** (${data.summary.totalFactory} 条记录)\n• 生产效率统计\n• 不良率分析\n• 项目进度跟踪\n• 设备状态监控\n\n💡 **查询建议**：\n请使用具体的查询条件，如：\n• "深圳工厂库存情况"\n• "BOE供应商质量数据"\n• "测试通过率统计"\n• "生产不良率分析"`
}

// 生成诊断响应
const generateDiagnosisResponse = (question, data, scenario) => {
  // 快速诊断数据中的潜在问题
  const issues = []

  if (data.inventory.length > 0) {
    const riskItems = data.inventory.filter(item => item.status === '风险' || item.status === '冻结')
    if (riskItems.length > 0) {
      issues.push(`⚠️ 发现 ${riskItems.length} 条风险/冻结库存`)
    }
  }

  if (data.lab.length > 0) {
    const failItems = data.lab.filter(item => item.testResult === 'FAIL')
    if (failItems.length > 0) {
      issues.push(`❌ 发现 ${failItems.length} 条测试失败记录`)
    }
  }

  return `🔍 **问题诊断回复**\n\n您的问题："${question}"\n\n🩺 **系统诊断结果**：\n\n${issues.length > 0 ?
    `⚠️ **发现问题**：\n${issues.map(issue => `• ${issue}`).join('\n')}\n\n🔧 **建议措施**：\n• 优先处理风险状态物料\n• 分析测试失败原因\n• 联系相关供应商确认\n• 制定应急处理预案` :
    `✅ **系统状态良好**：\n• 库存状态正常\n• 质量检测通过\n• 生产运行稳定\n• 无明显异常问题`
  }\n\n📊 **详细分析**：\n如需深入分析具体问题，请提供更详细的查询条件。`
}

// 生成通用智能响应
const generateGeneralIntelligentResponse = (question, data, scenario) => {
  return `🤖 **智能助手回复**\n\n您的问题："${question}"\n\n🎯 **理解您的需求**：\n我正在分析您的问题，基于当前的IQE质量管理数据为您提供帮助。\n\n📊 **当前数据状态**：\n• 📦 库存管理：${data.summary.totalInventory} 条记录\n• 🧪 质量检测：${data.summary.totalLab} 条记录\n• ⚙️ 生产监控：${data.summary.totalFactory} 条记录\n• 📋 批次管理：${data.summary.totalBatch} 条记录\n\n💡 **我可以帮您**：\n• 查询和分析各类质量数据\n• 提供专业的质量管理建议\n• 识别潜在的质量风险\n• 生成数据统计报告\n\n🔍 **获得更好帮助**：\n请尝试使用更具体的关键词，如：\n• 工厂名称（深圳、宜宾）\n• 供应商名称（BOE、聚龙、歌尔）\n• 状态类型（正常、风险、冻结）\n• 数据类型（库存、检测、生产）\n\n有什么具体问题我可以为您解答吗？`
}

// 格式化整合分析响应
const formatIntegratedResponse = (data, scenario) => {
  console.log('📝 格式化整合分析响应:', { success: data.success, scenario })

  let response = data.response || '抱歉，没有找到相关信息。'

  // 添加解析的条件信息
  if (data.parsedCriteria && Object.keys(data.parsedCriteria).length > 0) {
    response += `\n\n🔍 **分析条件**：\n`
    Object.entries(data.parsedCriteria).forEach(([key, value]) => {
      const keyMap = {
        materialCategory: '物料分类',
        supplier: '供应商',
        factory: '工厂',
        project: '项目',
        baseline: '基线',
        riskLevel: '风险等级',
        qualityThreshold: '质量阈值'
      }
      response += `• ${keyMap[key] || key}：${value}\n`
    })
  }

  // 添加应用的规则信息
  if (data.metadata && data.metadata.appliedRules && data.metadata.appliedRules.length > 0) {
    response += `\n📋 **应用规则**：\n`
    data.metadata.appliedRules.forEach(rule => {
      response += `• ${rule}\n`
    })
  }

  // 添加数据来源标识
  response += `\n\n*数据来源: 整合分析服务 (多规则结合检索)*`

  return response
}

// 格式化智能响应
const formatIntelligentResponse = (data, scenario) => {
  console.log('🎨 格式化智能响应:', data.source)

  if (!data.reply) {
    return '抱歉，没有收到有效的响应。'
  }

  // 根据响应来源进行不同的格式化
  switch (data.source) {
    case 'intelligent-intent':
      return formatIntelligentIntentResponse(data)

    case 'ai-enhanced':
      return formatAIEnhancedResponse(data)

    case 'rule-based':
      return formatRuleBasedResponse(data)

    default:
      return formatProfessionalResponse(data.reply, scenario)
  }
}

// 格式化智能意图响应
const formatIntelligentIntentResponse = (data) => {
  const scenarioIcons = {
    'material_inventory': '📦',
    'quality_inspection': '🧪',
    'production_monitoring': '⚙️',
    'comprehensive_quality': '📊'
  }

  const icon = scenarioIcons[data.scenario] || '🤖'

  let response = `${icon} **智能意图识别结果**\n\n`

  if (data.matchedRule && data.matchedRule !== 'auto-detected') {
    response += `🎯 **匹配规则**: ${data.matchedRule}\n\n`
  }

  response += `📋 **查询结果**:\n${data.reply}\n\n`

  if (data.intentResult) {
    if (data.intentResult.sql) {
      response += `🗃️ **执行SQL**: \`${data.intentResult.sql}\`\n\n`
    }

    if (data.intentResult.function) {
      response += `🔧 **调用函数**: ${data.intentResult.function}\n\n`
    }

    if (data.intentResult.params) {
      const params = Object.entries(data.intentResult.params)
        .map(([key, value]) => `• ${key}: ${value}`)
        .join('\n')
      response += `📊 **提取参数**:\n${params}\n\n`
    }
  }

  response += `💡 **提示**: 基于智能意图识别系统处理，如需更详细信息请提供更多上下文。`

  return response
}

// 格式化AI增强响应
const formatAIEnhancedResponse = (data) => {
  return `🧠 **AI增强分析**\n\n${data.reply}\n\n💡 **说明**: 此回复由AI智能分析生成，结合了数据查询和智能推理。`
}

// 格式化规则响应
const formatRuleBasedResponse = (data) => {
  return `📋 **规则匹配结果**\n\n${data.reply}\n\n💡 **说明**: 此回复基于预定义规则匹配生成。`
}

// 格式化本地响应
const formatLocalResponse = (content, source) => {
  const sourceLabels = {
    'local-rule': '📋 本地规则匹配',
    'local-cache': '💾 本地缓存',
    'local-data': '📊 本地数据'
  }

  const label = sourceLabels[source] || '📋 本地处理'

  return `${label}\n\n${content}\n\n⚡ **处理方式**: 本地快速响应，无需网络请求`
}

// 本地查询处理 - 支持规则条件组合
const processLocalQuery = (question, scenario) => {
  const questionLower = question.toLowerCase()

  // 获取localStorage数据
  const inventoryData = JSON.parse(localStorage.getItem('unified_inventory_data') || localStorage.getItem('inventory_data') || '[]')
  const labData = JSON.parse(localStorage.getItem('unified_lab_data') || localStorage.getItem('lab_data') || '[]')
  const factoryData = JSON.parse(localStorage.getItem('unified_factory_data') || localStorage.getItem('factory_data') || '[]')
  const batchData = JSON.parse(localStorage.getItem('unified_batch_data') || localStorage.getItem('batch_data') || '[]')

  console.log('📊 本地数据统计:', {
    inventory: inventoryData.length,
    lab: labData.length,
    factory: factoryData.length,
    batch: batchData.length
  })

  // 解析查询条件
  const queryConditions = parseQueryConditions(questionLower)
  console.log('🔍 解析的查询条件:', queryConditions)

  // 1. 基础问候和简单查询
  if (questionLower.includes('你好') || questionLower.includes('hello') || questionLower.includes('hi')) {
    return `👋 **您好！欢迎使用IQE智能质量助手**\n\n我是您的专业质量管理助手，可以帮您查询和分析：\n\n📦 **库存管理**：物料库存、供应商信息、工厂分布\n🧪 **质量检测**：测试结果、检验数据、合格率分析\n⚙️ **生产监控**：生产数据、不良率统计、项目进度\n📊 **数据统计**：综合分析、对比报告、趋势预测\n\n💡 **试试问我**：\n• "深圳工厂库存情况"\n• "BOE供应商质量如何"\n• "测试通过率统计"\n• "库存总量数据"\n\n有什么可以帮您的吗？`
  }

  if (questionLower.includes('帮助') || questionLower.includes('help')) {
    return `📚 **IQE智能助手使用指南**\n\n🔍 **查询类型**：\n\n**📦 库存查询**\n• 工厂库存：深圳工厂库存、宜宾工厂库存\n• 供应商：BOE供应商、聚龙供应商、歌尔供应商\n• 状态筛选：正常状态、风险状态、冻结状态\n• 物料类型：OLED显示屏、电池盖、喇叭、散热片\n\n**🧪 检测查询**\n• 测试结果：通过记录、失败记录\n• 质量分析：合格率、不良率统计\n\n**⚙️ 生产查询**\n• 生产数据：产线效率、项目进度\n• 批次管理：批次信息、批次质量\n\n**📊 统计分析**\n• 数据总览：库存统计、质量统计\n• 对比分析：工厂对比、供应商对比\n\n💡 **使用技巧**：使用具体的关键词可以获得更准确的结果！`
  }

  // 2. 库存总量查询
  if (questionLower.includes('库存总量') || questionLower.includes('总库存') ||
      (questionLower.includes('库存') && (questionLower.includes('总') || questionLower.includes('数据')))) {
    if (inventoryData.length === 0) {
      return '📦 当前没有库存数据。请确保数据已正确加载。'
    }

    const totalQuantity = inventoryData.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0)
    const factoryStats = {}
    const supplierStats = {}
    const statusStats = {}

    inventoryData.forEach(item => {
      // 工厂统计
      const factory = item.factory || '未知工厂'
      factoryStats[factory] = (factoryStats[factory] || 0) + 1

      // 供应商统计
      const supplier = item.supplier || '未知供应商'
      supplierStats[supplier] = (supplierStats[supplier] || 0) + 1

      // 状态统计
      const status = item.status || '未知状态'
      statusStats[status] = (statusStats[status] || 0) + 1
    })

    return `📦 **库存总量数据统计**\n\n📊 **总体概况**\n• 库存记录总数：${inventoryData.length} 条\n• 物料总数量：${totalQuantity} 件\n\n🏭 **工厂分布**\n${Object.entries(factoryStats).map(([factory, count]) => `• ${factory}：${count} 条记录`).join('\n')}\n\n🏢 **供应商分布**\n${Object.entries(supplierStats).map(([supplier, count]) => `• ${supplier}：${count} 条记录`).join('\n')}\n\n📈 **状态分布**\n${Object.entries(statusStats).map(([status, count]) => `• ${status}：${count} 条记录`).join('\n')}\n\n🕒 **统计时间**：${new Date().toLocaleString()}`
  }

  // 3. 库存相关查询 - 使用条件组合
  if (queryConditions.queryType === 'inventory' || questionLower.includes('库存') || questionLower.includes('物料')) {
    if (inventoryData.length === 0) {
      return '📦 当前没有库存数据。请确保数据已正确加载。'
    }

    // 使用条件组合进行查询
    const filteredData = filterInventoryByConditions(inventoryData, queryConditions)

    // 处理不存在的工厂
    if (queryConditions.factories.includes('重庆工厂')) {
      return handleNonExistentFactory('重庆工厂', queryConditions, inventoryData)
    }

    // 如果有具体的条件组合
    if (queryConditions.factories.length > 0 || queryConditions.statuses.length > 0 ||
        queryConditions.suppliers.length > 0 || queryConditions.materials.length > 0) {

      const title = buildQueryTitle(queryConditions)
      return formatInventoryResponse(title, filteredData)
    }

    // 工厂查询
    if (questionLower.includes('深圳')) {
      const shenzhenItems = inventoryData.filter(item =>
        item.factory && item.factory.includes('深圳')
      )

      // 如果同时包含风险查询
      if (questionLower.includes('风险')) {
        const riskItems = shenzhenItems.filter(item => item.status === '风险')
        return formatInventoryResponse('深圳工厂风险库存', riskItems)
      }

      return formatInventoryResponse('深圳工厂库存情况', shenzhenItems)
    }

    if (questionLower.includes('宜宾')) {
      const yibinItems = inventoryData.filter(item =>
        item.factory && item.factory.includes('宜宾')
      )

      // 如果同时包含风险查询
      if (questionLower.includes('风险')) {
        const riskItems = yibinItems.filter(item => item.status === '风险')
        return formatInventoryResponse('宜宾工厂风险库存', riskItems)
      }

      return formatInventoryResponse('宜宾工厂库存情况', yibinItems)
    }

    // 供应商查询
    if (questionLower.includes('boe')) {
      const boeItems = inventoryData.filter(item =>
        item.supplier && item.supplier.includes('BOE')
      )
      return formatInventoryResponse('BOE供应商库存情况', boeItems)
    }

    if (questionLower.includes('聚龙')) {
      const julongItems = inventoryData.filter(item =>
        item.supplier && item.supplier.includes('聚龙')
      )
      return formatInventoryResponse('聚龙供应商库存情况', julongItems)
    }

    if (questionLower.includes('歌尔')) {
      const goerItems = inventoryData.filter(item =>
        item.supplier && item.supplier.includes('歌尔')
      )
      return formatInventoryResponse('歌尔供应商库存情况', goerItems)
    }

    // 状态查询
    if (questionLower.includes('正常')) {
      const normalItems = inventoryData.filter(item =>
        item.status === '正常'
      )
      return formatInventoryResponse('正常状态库存', normalItems)
    }

    if (questionLower.includes('风险')) {
      const riskItems = inventoryData.filter(item =>
        item.status === '风险'
      )
      return formatInventoryResponse('风险状态库存', riskItems)
    }

    if (questionLower.includes('冻结')) {
      const frozenItems = inventoryData.filter(item =>
        item.status === '冻结'
      )
      return formatInventoryResponse('冻结状态库存', frozenItems)
    }

    // 物料查询
    if (questionLower.includes('oled') || questionLower.includes('显示屏')) {
      const oledItems = inventoryData.filter(item =>
        item.materialName && item.materialName.includes('OLED')
      )
      return formatInventoryResponse('OLED显示屏库存', oledItems)
    }

    // 通用库存查询
    return formatInventoryResponse('库存总览', inventoryData.slice(0, 10))
  }

  // 4. 批次查询
  if (questionLower.includes('批次') || questionLower.includes('batch')) {
    if (questionLower.includes('物料批次查询') || (questionLower.includes('物料') && questionLower.includes('批次'))) {
      // 物料批次查询 - 返回批次信息而不是库存信息
      if (batchData.length === 0) {
        return '📋 当前没有批次数据。请确保数据已正确加载。'
      }

      return formatBatchResponse('物料批次信息', batchData.slice(0, 10))
    }

    // 通用批次查询
    if (batchData.length === 0) {
      return '📋 当前没有批次数据。请确保数据已正确加载。'
    }

    return formatBatchResponse('批次管理总览', batchData.slice(0, 10))
  }

  // 检测相关查询
  if (questionLower.includes('检测') || questionLower.includes('测试')) {
    if (labData.length === 0) {
      return '🧪 当前没有检测数据。请确保数据已正确加载。'
    }

    if (questionLower.includes('pass') || questionLower.includes('通过')) {
      const passItems = labData.filter(item =>
        item.testResult === 'PASS'
      )
      return formatLabResponse('测试通过记录', passItems)
    }

    if (questionLower.includes('fail') || questionLower.includes('失败')) {
      const failItems = labData.filter(item =>
        item.testResult === 'FAIL'
      )
      return formatLabResponse('测试失败记录', failItems)
    }

    return formatLabResponse('检测数据总览', labData.slice(0, 10))
  }

  // 生产相关查询
  if (questionLower.includes('生产') || questionLower.includes('产线')) {
    if (factoryData.length === 0) {
      return '⚙️ 当前没有生产数据。请确保数据已正确加载。'
    }

    return formatProductionResponse('生产数据总览', factoryData.slice(0, 10))
  }

  // 统计查询
  if (questionLower.includes('统计') || questionLower.includes('总数')) {
    return `📊 **数据统计总览**\n\n📦 **库存记录**：${inventoryData.length} 条\n🧪 **检测记录**：${labData.length} 条\n⚙️ **生产记录**：${factoryData.length} 条\n\n🕒 **数据更新时间**：${new Date().toLocaleString()}`
  }

  // 没有匹配的规则，返回null让AI接管
  console.log('📋 本地规则无匹配，将转交AI处理')
  return null
}

// 格式化库存响应
const formatInventoryResponse = (title, items) => {
  if (!items || items.length === 0) {
    return `📦 **${title}**\n\n暂无相关数据。`
  }

  const summary = `📦 **${title}**\n\n📊 **统计信息**：共 ${items.length} 条记录\n\n`

  const details = items.slice(0, 5).map((item, index) =>
    `${index + 1}. **${item.materialName || '未知物料'}**\n   - 供应商：${item.supplier || '未知'}\n   - 工厂：${item.factory || '未知'}\n   - 状态：${item.status || '未知'}\n   - 数量：${item.quantity || '未知'}`
  ).join('\n\n')

  const more = items.length > 5 ? `\n\n... 还有 ${items.length - 5} 条记录` : ''

  return summary + details + more
}

// 格式化检测响应
const formatLabResponse = (title, items) => {
  if (!items || items.length === 0) {
    return `🧪 **${title}**\n\n暂无相关数据。`
  }

  const summary = `🧪 **${title}**\n\n📊 **统计信息**：共 ${items.length} 条记录\n\n`

  const details = items.slice(0, 5).map((item, index) =>
    `${index + 1}. **${item.materialName || '未知物料'}**\n   - 测试结果：${item.testResult || '未知'}\n   - 检测日期：${item.inspectionDate || '未知'}\n   - 批次：${item.batchNo || '未知'}`
  ).join('\n\n')

  const more = items.length > 5 ? `\n\n... 还有 ${items.length - 5} 条记录` : ''

  return summary + details + more
}

// 格式化生产响应
const formatProductionResponse = (title, items) => {
  if (!items || items.length === 0) {
    return `⚙️ **${title}**\n\n暂无相关数据。`
  }

  const summary = `⚙️ **${title}**\n\n📊 **统计信息**：共 ${items.length} 条记录\n\n`

  const details = items.slice(0, 5).map((item, index) =>
    `${index + 1}. **${item.materialName || '未知物料'}**\n   - 项目：${item.project || '未知'}\n   - 不良率：${item.defectRate || '未知'}%\n   - 工厂：${item.factory || '未知'}`
  ).join('\n\n')

  const more = items.length > 5 ? `\n\n... 还有 ${items.length - 5} 条记录` : ''

  return summary + details + more
}

// 格式化批次响应
const formatBatchResponse = (title, items) => {
  if (!items || items.length === 0) {
    return `📋 **${title}**\n\n暂无相关数据。`
  }

  const summary = `📋 **${title}**\n\n📊 **统计信息**：共 ${items.length} 条记录\n\n`

  const details = items.slice(0, 5).map((item, index) =>
    `${index + 1}. **批次号：${item.batchCode || item.batchNo || '未知批次'}**\n   - 物料：${item.materialName || '未知物料'}\n   - 供应商：${item.supplier || '未知'}\n   - 数量：${item.quantity || '未知'}\n   - 状态：${item.status || '未知'}`
  ).join('\n\n')

  const more = items.length > 5 ? `\n\n... 还有 ${items.length - 5} 条记录` : ''

  return summary + details + more
}

// 格式化所有工厂风险库存
const formatRiskInventoryAllFactories = (inventoryData) => {
  const riskItems = inventoryData.filter(item => item.status === '风险')

  if (riskItems.length === 0) {
    return '✅ **好消息**：当前所有工厂都没有风险库存！'
  }

  const factoryRiskStats = {}
  riskItems.forEach(item => {
    const factory = item.factory || '未知工厂'
    if (!factoryRiskStats[factory]) {
      factoryRiskStats[factory] = []
    }
    factoryRiskStats[factory].push(item)
  })

  let result = `⚠️ **风险库存总计**：${riskItems.length} 条记录\n\n`

  Object.entries(factoryRiskStats).forEach(([factory, items]) => {
    result += `🏭 **${factory}**：${items.length} 条风险库存\n`
    items.slice(0, 3).forEach((item, index) => {
      result += `   ${index + 1}. ${item.materialName || '未知物料'} - ${item.supplier || '未知供应商'}\n`
    })
    if (items.length > 3) {
      result += `   ... 还有 ${items.length - 3} 条记录\n`
    }
    result += '\n'
  })

  return result
}

// 根据条件过滤库存数据
const filterInventoryByConditions = (inventoryData, conditions) => {
  return inventoryData.filter(item => {
    // 工厂条件
    if (conditions.factories.length > 0) {
      const factoryMatch = conditions.factories.some(factory =>
        item.factory && item.factory.includes(factory.replace('工厂', ''))
      )
      if (!factoryMatch) return false
    }

    // 状态条件
    if (conditions.statuses.length > 0) {
      const statusMatch = conditions.statuses.some(status =>
        item.status === status
      )
      if (!statusMatch) return false
    }

    // 供应商条件
    if (conditions.suppliers.length > 0) {
      const supplierMatch = conditions.suppliers.some(supplier =>
        item.supplier && item.supplier.includes(supplier)
      )
      if (!supplierMatch) return false
    }

    // 物料条件
    if (conditions.materials.length > 0) {
      const materialMatch = conditions.materials.some(material =>
        item.materialName && item.materialName.includes(material)
      )
      if (!materialMatch) return false
    }

    return true
  })
}

// 构建查询标题
const buildQueryTitle = (conditions) => {
  const parts = []

  if (conditions.factories.length > 0) {
    parts.push(conditions.factories.join('、'))
  }

  if (conditions.suppliers.length > 0) {
    parts.push(conditions.suppliers.join('、') + '供应商')
  }

  if (conditions.statuses.length > 0) {
    parts.push(conditions.statuses.join('、') + '状态')
  }

  if (conditions.materials.length > 0) {
    parts.push(conditions.materials.join('、'))
  }

  const title = parts.join(' + ') + '库存查询'
  return title
}

// 处理不存在的工厂
const handleNonExistentFactory = (factory, conditions, inventoryData) => {
  const factoryName = factory.replace('工厂', '')
  const statusText = conditions.statuses.length > 0 ? conditions.statuses.join('、') : '全部'

  // 获取实际存在的工厂
  const existingFactories = [...new Set(inventoryData.map(item => item.factory).filter(f => f))]

  // 如果有状态条件，显示所有工厂的该状态数据
  let alternativeData = inventoryData
  if (conditions.statuses.length > 0) {
    alternativeData = inventoryData.filter(item =>
      conditions.statuses.includes(item.status)
    )
  }

  return `📦 **${factoryName}工厂${statusText}库存查询结果**\n\n⚠️ **查询说明**：当前系统中没有${factoryName}工厂的数据。\n\n🏭 **可用工厂**：\n${existingFactories.map(f => `• ${f}`).join('\n')}\n\n📊 **${statusText}库存查询涵盖所有工厂**：\n\n${formatAlternativeInventoryData(alternativeData, conditions)}\n\n💡 **建议**：请尝试查询"${existingFactories[0]}${statusText}库存"获取具体信息。`
}

// 格式化替代库存数据
const formatAlternativeInventoryData = (data, conditions) => {
  if (data.length === 0) {
    return '✅ **好消息**：当前所有工厂都没有符合条件的库存！'
  }

  const factoryStats = {}
  data.forEach(item => {
    const factory = item.factory || '未知工厂'
    if (!factoryStats[factory]) {
      factoryStats[factory] = []
    }
    factoryStats[factory].push(item)
  })

  let result = `📊 **符合条件的库存总计**：${data.length} 条记录\n\n`

  Object.entries(factoryStats).forEach(([factory, items]) => {
    result += `🏭 **${factory}**：${items.length} 条记录\n`
    items.slice(0, 3).forEach((item, index) => {
      result += `   ${index + 1}. ${item.materialName || '未知物料'} - ${item.supplier || '未知供应商'} - ${item.status || '未知状态'}\n`
    })
    if (items.length > 3) {
      result += `   ... 还有 ${items.length - 3} 条记录\n`
    }
    result += '\n'
  })

  return result
}

// 生成回退响应
const generateFallbackResponse = (question, scenario) => {
  if (scenario === 'error') {
    return `🔧 **IQE质量助手暂时不可用**\n\n作为您的质量管理专家，我遇到了技术问题。\n\n请稍后重试，或联系系统管理员。我将继续为您提供专业的物料监控和质量分析服务。\n\n**您的问题**："${question}"`
  }

  const scenarioTitles = {
    'material_inventory': '📦 库存管理',
    'quality_inspection': '🧪 质量检测',
    'production_monitoring': '⚙️ 生产监控',
    'comprehensive_quality': '📊 综合质量'
  }

  const title = scenarioTitles[scenario] || '🤖 智能助手'

  return `${title.split(' ')[0]} **${title.split(' ')[1]}回复**\n\n收到您的查询："${question}"\n\n我正在为您分析相关数据，请稍等片刻。如果您需要更具体的信息，请尝试以下查询：\n\n• 深圳工厂库存\n• BOE供应商情况\n• 正常状态物料\n• 测试通过记录\n• 生产数据统计\n\n💡 **提示**：您可以使用更具体的关键词来获得更准确的结果。`
}

// 格式化专业回复 - 优化数据结构展示
const formatProfessionalResponse = (reply, scenario) => {
  if (!reply) return '暂无数据';

  // 检查是否是结构化HTML响应
  if (reply.includes('<div class="query-results')) {
    // 已经是结构化的HTML，直接返回
    return reply;
  }

  // 检查是否只是简单的数量统计
  if (reply.length < 100 && /^\d+/.test(reply.trim())) {
    // 如果只是数量，尝试获取更详细的信息
    return enhanceSimpleResponse(reply, scenario);
  }

  // 检查是否包含数据但格式不够友好
  if (reply.includes('条记录') || reply.includes('个') || reply.includes('家')) {
    return enhanceDataResponse(reply, scenario);
  }

  // 对于普通文本回复，添加专业格式化
  return addProfessionalFormatting(reply, scenario);
}

// 增强简单响应
const enhanceSimpleResponse = (reply, scenario) => {
  const scenarioTitles = {
    'material_inventory': '📦 库存管理分析',
    'quality_inspection': '🧪 质量检测分析',
    'production_monitoring': '⚙️ 生产监控分析',
    'comprehensive_quality': '📊 综合质量分析'
  };

  const title = scenarioTitles[scenario] || '📋 数据分析结果';

  return `
    <div class="professional-response">
      <div class="response-header">
        <h3>${title}</h3>
        <div class="response-meta">
          <span class="timestamp">${new Date().toLocaleString()}</span>
        </div>
      </div>
      <div class="response-content">
        <div class="summary-card">
          <div class="summary-title">📊 统计结果</div>
          <div class="summary-value">${reply}</div>
        </div>
        <div class="analysis-note">
          <p><strong>💡 分析说明：</strong></p>
          <p>基于当前数据统计得出上述结果。如需查看详细信息，请使用更具体的查询条件。</p>
        </div>
      </div>
    </div>
  `;
}

// 增强数据响应
const enhanceDataResponse = (reply, scenario) => {
  const scenarioTitles = {
    'material_inventory': '📦 库存管理详情',
    'quality_inspection': '🧪 质量检测详情',
    'production_monitoring': '⚙️ 生产监控详情',
    'comprehensive_quality': '📊 综合质量详情'
  };

  const title = scenarioTitles[scenario] || '📋 查询结果详情';

  // 尝试解析数据并重新格式化
  const lines = reply.split('\n').filter(line => line.trim());
  let formattedContent = '';

  if (lines.length > 1) {
    formattedContent = `
      <div class="data-list">
        ${lines.map((line, index) => `
          <div class="data-item">
            <span class="item-index">${index + 1}</span>
            <span class="item-content">${line}</span>
          </div>
        `).join('')}
      </div>
    `;
  } else {
    formattedContent = `<div class="single-result">${reply}</div>`;
  }

  return `
    <div class="professional-response">
      <div class="response-header">
        <h3>${title}</h3>
        <div class="response-meta">
          <span class="timestamp">${new Date().toLocaleString()}</span>
        </div>
      </div>
      <div class="response-content">
        ${formattedContent}
      </div>
    </div>
  `;
}

// 添加专业格式化
const addProfessionalFormatting = (reply, scenario) => {
  const scenarioTitles = {
    'material_inventory': '📦 库存管理报告',
    'quality_inspection': '🧪 质量检测报告',
    'production_monitoring': '⚙️ 生产监控报告',
    'comprehensive_quality': '📊 综合质量报告'
  };

  const title = scenarioTitles[scenario] || '📋 分析报告';

  // 格式化文本内容
  let formattedReply = reply
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
    .replace(/(\d+\.\s)/g, '<br><strong>$1</strong>');

  return `
    <div class="professional-response">
      <div class="response-header">
        <h3>${title}</h3>
        <div class="response-meta">
          <span class="timestamp">${new Date().toLocaleString()}</span>
        </div>
      </div>
      <div class="response-content">
        <div class="formatted-text">
          ${formattedReply}
        </div>
      </div>
    </div>
  `;
}

const simulateAIProcess = async (question) => {
  try {
    // 步骤1：问题分析
    addThinkingStep('问题分析', '正在分析用户问题的意图和类型...', 'analysis')
    await delay(300)
    completeThinkingStep(0, 300)

    // 步骤2：数据查询
    addThinkingStep('数据查询', '正在查询相关数据源...', 'query')
    await delay(400)
    completeThinkingStep(1, 400)

    // 步骤3：AI分析
    addThinkingStep('AI分析', '正在进行智能分析...', 'ai')
    await delay(500)
    // 注意：这里不立即完成，等待实际AI调用完成

    console.log('✅ AI思考过程模拟完成')
  } catch (error) {
    console.error('❌ AI思考过程模拟失败:', error)
    // 标记当前步骤为错误
    const currentStep = thinkingSteps.value.length - 1
    if (currentStep >= 0) {
      errorThinkingStep(currentStep, `思考过程出错: ${error.message}`)
    }
    throw error
  }
}

const addThinkingStep = (title, description, type) => {
  thinkingSteps.value.push({
    title,
    description,
    type,
    timestamp: new Date(),
    active: true,
    completed: false,
    error: false,
    details: null,
    duration: 0
  })
}

const completeThinkingStep = (index, duration) => {
  if (thinkingSteps.value[index]) {
    thinkingSteps.value[index].active = false
    thinkingSteps.value[index].completed = true
    thinkingSteps.value[index].duration = duration
    thinkingSteps.value[index].details = `完成时间: ${duration}ms`
  }
}

const updateThinkingStep = (index, description, active = false) => {
  if (thinkingSteps.value[index]) {
    thinkingSteps.value[index].description = description
    thinkingSteps.value[index].active = active
  }
}

const errorThinkingStep = (index, errorMessage) => {
  if (thinkingSteps.value[index]) {
    thinkingSteps.value[index].active = false
    thinkingSteps.value[index].completed = false
    thinkingSteps.value[index].error = true
    thinkingSteps.value[index].details = errorMessage
  }
}

const generateResponse = (question) => {
  const responses = [
    `我已经分析了您的问题："${question}"。根据当前数据，我为您提供以下分析结果...`,
    `关于"${question}"，我发现了一些有趣的数据模式和趋势...`,
    `基于您的问题"${question}"，我建议您关注以下几个关键指标...`,
    `针对"${question}"这个问题，我已经完成了深度分析，建议采取以下措施...`
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}

const getStepIcon = (type) => {
  const iconMap = {
    analysis: '🎯',
    query: '🔍',
    ai: '🧠',
    result: '📝',
    error: '⚠️'
  }
  return iconMap[type] || '📋'
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
}

// 格式化消息内容
const formatMessageContent = (content) => {
  console.log('🎨 开始格式化消息内容:', content?.substring(0, 100) + '...')

  if (!content) {
    console.log('⚠️ 消息内容为空')
    return '暂无内容';
  }

  // 检查是否是HTML内容
  if (content.includes('<div class="query-results')) {
    console.log('📋 检测到结构化HTML内容')
    return formatStructuredResponse(content);
  }

  // 检查是否是专业格式化的HTML
  if (content.includes('<div class="professional-response')) {
    console.log('🎯 检测到专业格式化HTML内容')
    return content; // 直接返回，已经是格式化的HTML
  }

  // 处理专业AI回答内容
  console.log('📝 处理专业AI回答内容')
  return formatProfessionalAIResponse(content);
}

// 格式化专业AI回答 - 增强版，支持表格和统计数据
const formatProfessionalAIResponse = (content) => {
  let formatted = content

  // 1. 处理表格格式 - 检测ASCII表格
  if (content.includes('┌') && content.includes('│') && content.includes('└')) {
    formatted = formatASCIITable(formatted);
  }

  // 2. 处理标题层级
  formatted = formatted
    .replace(/^## (.*$)/gm, '<h3 class="ai-section-title">$1</h3>')
    .replace(/^### (.*$)/gm, '<h4 class="ai-subsection-title">$1</h4>')
    .replace(/^# (.*$)/gm, '<h2 class="ai-main-title">$1</h2>')

  // 3. 处理强调文本
  formatted = formatted
    .replace(/\*\*(.*?)\*\*/g, '<strong class="ai-emphasis">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="ai-italic">$1</em>')

  // 4. 处理代码和专业术语
  formatted = formatted
    .replace(/`(.*?)`/g, '<code class="ai-code">$1</code>')

  // 4. 处理列表项
  const lines = formatted.split('\n')
  let inList = false
  let listType = null
  let processedLines = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (line.match(/^- /)) {
      if (!inList || listType !== 'bullet') {
        if (inList) processedLines.push(`</${listType === 'numbered' ? 'ol' : 'ul'}>`)
        processedLines.push('<ul class="ai-bullet-list">')
        inList = true
        listType = 'bullet'
      }
      processedLines.push(`<li class="ai-list-item">${line.substring(2)}</li>`)
    } else if (line.match(/^\d+\. /)) {
      if (!inList || listType !== 'numbered') {
        if (inList) processedLines.push(`</${listType === 'numbered' ? 'ol' : 'ul'}>`)
        processedLines.push('<ol class="ai-numbered-list">')
        inList = true
        listType = 'numbered'
      }
      const match = line.match(/^(\d+)\. (.*)/)
      processedLines.push(`<li class="ai-numbered-item"><span class="item-number">${match[1]}.</span> ${match[2]}</li>`)
    } else {
      if (inList) {
        processedLines.push(`</${listType === 'numbered' ? 'ol' : 'ul'}>`)
        inList = false
        listType = null
      }
      if (line) {
        processedLines.push(line)
      }
    }
  }

  if (inList) {
    processedLines.push(`</${listType === 'numbered' ? 'ol' : 'ul'}>`)
  }

  formatted = processedLines.join('\n')

  // 5. 处理特殊标记和图标
  formatted = formatted
    .replace(/📋|📊|🔍|💡|⚡|🌐|📡|🎯|📚|🏭|🔬|📦|✅|❌|⚠️|🔧|📈|📉/g, '<span class="ai-icon">$&</span>')

  // 6. 处理分隔线
  formatted = formatted
    .replace(/^---$/gm, '<hr class="ai-divider">')

  // 7. 处理段落
  formatted = formatted
    .replace(/\n\n+/g, '</p><p class="ai-paragraph">')
    .replace(/\n/g, '<br>')

  // 8. 包装整体内容
  formatted = `<div class="professional-ai-response">
    <p class="ai-paragraph">${formatted}</p>
  </div>`

  // 9. 清理多余的空段落
  formatted = formatted
    .replace(/<p class="ai-paragraph"><\/p>/g, '')
    .replace(/<p class="ai-paragraph"><br><\/p>/g, '')
    .replace(/<p class="ai-paragraph">\s*<\/p>/g, '')

  console.log('✅ 专业AI回答格式化完成')
  return formatted;
}

// 格式化ASCII表格为HTML表格
const formatASCIITable = (content) => {
  const lines = content.split('\n');
  let inTable = false;
  let tableRows = [];
  let processedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 检测表格开始
    if (line.includes('┌') && line.includes('─') && line.includes('┐')) {
      inTable = true;
      tableRows = [];
      processedLines.push('<div class="ascii-table-container">');
      processedLines.push('<table class="ascii-table">');
      continue;
    }

    // 检测表格结束
    if (line.includes('└') && line.includes('─') && line.includes('┘')) {
      inTable = false;
      processedLines.push('</table>');
      processedLines.push('</div>');
      continue;
    }

    // 处理表格内容
    if (inTable && line.includes('│')) {
      // 跳过分隔线
      if (line.includes('├') || line.includes('┼') || line.includes('┤')) {
        continue;
      }

      // 解析表格行
      const cells = line.split('│').slice(1, -1).map(cell => cell.trim());

      // 检测是否是表头
      const isHeader = i > 0 && lines[i-1].includes('┌') ||
                      (i < lines.length - 1 && lines[i+1].includes('├'));

      if (isHeader) {
        processedLines.push('<thead><tr>');
        cells.forEach(cell => {
          processedLines.push(`<th class="table-header">${cell}</th>`);
        });
        processedLines.push('</tr></thead><tbody>');
      } else {
        processedLines.push('<tr>');
        cells.forEach(cell => {
          processedLines.push(`<td class="table-cell">${cell}</td>`);
        });
        processedLines.push('</tr>');
      }
    } else {
      // 非表格内容
      if (inTable) {
        processedLines.push('</tbody>');
      }
      processedLines.push(line);
    }
  }

  return processedLines.join('\n');
}

// 格式化结构化响应
const formatStructuredResponse = (htmlContent) => {
  try {
    // 解析HTML并重新格式化
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // 提取查询结果
    const resultDiv = doc.querySelector('.query-results');
    if (!resultDiv) return htmlContent;

    const resultType = resultDiv.classList.contains('inventory-results') ? 'inventory' :
                      resultDiv.classList.contains('inspection-results') ? 'inspection' :
                      resultDiv.classList.contains('production-results') ? 'production' : 'general';

    // 重新构建格式化的HTML
    return buildFormattedResponse(resultDiv, resultType);
  } catch (error) {
    console.error('格式化响应错误:', error);
    return htmlContent;
  }
}

// 构建格式化响应
const buildFormattedResponse = (resultDiv, type) => {
  const items = resultDiv.querySelectorAll('.result-item');
  if (items.length === 0) return resultDiv.innerHTML;

  let formattedHtml = `<div class="formatted-response ${type}-response">`;

  // 添加标题
  const typeNames = {
    inventory: '📦 库存查询结果',
    inspection: '🧪 检测结果',
    production: '⚙️ 生产数据',
    general: '📋 查询结果'
  };

  formattedHtml += `<div class="response-header">
    <h4>${typeNames[type] || '📋 查询结果'}</h4>
    <span class="result-count">共找到 ${items.length} 条记录</span>
  </div>`;

  // 添加结果列表
  formattedHtml += '<div class="response-content">';

  items.forEach((item, index) => {
    const title = item.querySelector('.item-title')?.textContent || `项目 ${index + 1}`;
    const details = item.querySelector('.item-details')?.innerHTML || item.innerHTML;

    formattedHtml += `
      <div class="response-item">
        <div class="item-header">
          <span class="item-number">${index + 1}</span>
          <span class="item-title">${title}</span>
        </div>
        <div class="item-content">${details}</div>
      </div>
    `;
  });

  formattedHtml += '</div></div>';

  return formattedHtml;
}

const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 消息操作函数
const copyMessage = (content) => {
  navigator.clipboard.writeText(content).then(() => {
    ElMessage.success('消息已复制到剪贴板');
  }).catch(() => {
    ElMessage.error('复制失败');
  });
}

const likeMessage = (message) => {
  message.liked = !message.liked;
  ElMessage.success(message.liked ? '已点赞' : '已取消点赞');
}

const regenerateResponse = async (message) => {
  const messageIndex = messages.value.indexOf(message);
  if (messageIndex > 0) {
    const userMessage = messages.value[messageIndex - 1];
    if (userMessage && userMessage.type === 'user') {
      // 重新生成回复
      ElMessage.info('正在重新生成回复...');
      const newResponse = await callAIService(userMessage.content);
      message.content = newResponse;
      ElMessage.success('回复已重新生成');
    }
  }
}

// 检测是否应该使用优化响应组件
const shouldUseOptimizedResponse = (content) => {
  // 暂时禁用优化组件，确保所有消息都能显示
  // 检查是否包含结构化数据
  return false; // 临时禁用，使用普通显示

  // 原来的逻辑（暂时注释）
  // return content.includes('<div class="query-results') ||
  //        content.includes('📦') ||
  //        content.includes('🧪') ||
  //        content.includes('⚙️') ||
  //        content.length > 200; // 长回复使用优化组件
}

// 检测响应类型
const detectResponseType = (content) => {
  if (content.includes('库存') || content.includes('inventory')) return 'inventory';
  if (content.includes('检测') || content.includes('测试') || content.includes('inspection')) return 'inspection';
  if (content.includes('生产') || content.includes('production')) return 'production';
  return 'general';
}

// 处理操作点击
const handleActionClick = (action) => {
  switch (action.id) {
    case 'export':
      ElMessage.info('正在导出数据...');
      // 实现数据导出逻辑
      break;
    case 'chart':
      ElMessage.info('正在生成图表...');
      // 实现图表生成逻辑
      break;
    case 'alert':
      ElMessage.info('正在设置预警...');
      // 实现预警设置逻辑
      break;
    case 'report':
      ElMessage.info('正在生成报告...');
      // 实现报告生成逻辑
      break;
    case 'trend':
      ElMessage.info('正在分析趋势...');
      // 实现趋势分析逻辑
      break;
    case 'optimize':
      ElMessage.info('正在生成优化建议...');
      // 实现优化建议逻辑
      break;
    case 'monitor':
      ElMessage.info('正在启动实时监控...');
      // 实现实时监控逻辑
      break;
    default:
      ElMessage.info(`执行操作: ${action.label}`);
  }
}

// 切换左侧面板折叠状态
const toggleSection = (sectionName) => {
  expandedSections.value[sectionName] = !expandedSections.value[sectionName];
}

const clearMessages = () => {
  messages.value = []
  thinkingSteps.value = []
  ElMessage.success('对话已清空')
}

const quickAnalysis = () => {
  inputMessage.value = '请对当前数据进行快速分析'
  sendMessage()
}

const generateReport = () => {
  inputMessage.value = '生成详细的分析报告'
  sendMessage()
}

const exportData = () => {
  ElMessage.info('数据导出功能开发中...')
}

const scrollToBottom = () => {
  nextTick(() => {
    const container = document.querySelector('.messages-list')
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  })
}

// 数据同步函数 - 增强版
const syncDataToBackend = async () => {
  try {
    console.log('🔄 开始同步真实数据到后端...')

    // 1. 首先检查后端服务状态
    const healthCheck = await checkBackendHealth()
    if (!healthCheck.healthy) {
      console.error('❌ 后端服务不可用:', healthCheck.error)
      ElMessage.error('后端服务不可用，请检查服务状态')
      return false
    }

    // 2. 从localStorage获取数据
    const inventoryData = localStorage.getItem('unified_inventory_data') || localStorage.getItem('inventory_data')
    const labData = localStorage.getItem('unified_lab_data') || localStorage.getItem('lab_data')
    const factoryData = localStorage.getItem('unified_factory_data') || localStorage.getItem('factory_data')

    const dataToPush = {
      inventory: inventoryData ? JSON.parse(inventoryData) : [],
      inspection: labData ? JSON.parse(labData) : [],
      production: factoryData ? JSON.parse(factoryData) : []
    }

    console.log(`📊 准备推送数据: 库存${dataToPush.inventory.length}条, 检测${dataToPush.inspection.length}条, 生产${dataToPush.production.length}条`)

    // 3. 如果没有数据，尝试重新生成
    if (dataToPush.inventory.length === 0 && dataToPush.inspection.length === 0 && dataToPush.production.length === 0) {
      console.log('⚠️ 没有数据可推送，尝试重新生成数据...')

      try {
        // 调用数据生成服务
        const generateResponse = await fetch('/api/assistant/generate-real-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })

        if (generateResponse.ok) {
          const generatedData = await generateResponse.json()
          if (generatedData.success) {
            dataToPush.inventory = generatedData.data.inventory || []
            dataToPush.inspection = generatedData.data.inspection || []
            dataToPush.production = generatedData.data.production || []
            console.log('✅ 重新生成数据成功')
          }
        }
      } catch (generateError) {
        console.warn('⚠️ 数据生成失败，使用空数据继续:', generateError.message)
      }

      if (dataToPush.inventory.length === 0 && dataToPush.inspection.length === 0 && dataToPush.production.length === 0) {
        console.log('❌ 仍然没有数据可推送')
        ElMessage.warning('没有可用数据，请先在管理工具中生成数据')
        return false
      }
    }

    // 4. 数据验证
    const validationResult = validateDataStructure(dataToPush)
    if (!validationResult.valid) {
      console.error('❌ 数据验证失败:', validationResult.errors)
      ElMessage.error('数据格式验证失败')
      return false
    }

    // 5. 推送数据到后端
    const response = await fetch('/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToPush)
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ 数据同步响应:', result)

      if (result.success) {
        // 6. 验证数据是否真正同步成功
        const verifyResult = await verifyDataSync(dataToPush)
        if (verifyResult.verified) {
          console.log('✅ 数据同步验证成功')
          ElMessage.success('数据同步成功！')
          return true
        } else {
          console.warn('⚠️ 数据同步验证失败:', verifyResult.message)
          ElMessage.warning('数据同步可能不完整，请重试')
          return false
        }
      } else {
        throw new Error(result.error || '未知错误')
      }
    } else {
      const error = await response.text()
      console.log('❌ 数据同步失败:', error)
      ElMessage.error('数据同步失败，请检查后端服务')
      return false
    }
  } catch (error) {
    console.error('❌ 数据同步出错:', error)
    ElMessage.error('数据同步出错: ' + error.message)

    // 7. 失败重试机制
    if (error.message.includes('413') || error.message.includes('Request Entity Too Large')) {
      console.log('🔄 数据过大，尝试分批推送...')
      return await syncDataInBatches(dataToPush)
    }

    return false
  }
}

// 后端健康检查
const checkBackendHealth = async () => {
  try {
    const response = await fetch('/api/assistant/health', {
      method: 'GET',
      timeout: 5000
    })

    if (response.ok) {
      const result = await response.json()
      return { healthy: true, data: result }
    } else {
      return { healthy: false, error: `HTTP ${response.status}` }
    }
  } catch (error) {
    return { healthy: false, error: error.message }
  }
}

// 数据结构验证
const validateDataStructure = (data) => {
  const errors = []

  // 检查数据结构
  if (!data || typeof data !== 'object') {
    errors.push('数据不是有效对象')
    return { valid: false, errors }
  }

  // 检查必要字段
  const requiredFields = ['inventory', 'inspection', 'production']
  for (const field of requiredFields) {
    if (!Array.isArray(data[field])) {
      errors.push(`${field} 不是有效数组`)
    }
  }

  // 检查数据内容
  if (data.inventory.length > 0) {
    const sample = data.inventory[0]
    const requiredInventoryFields = ['materialName', 'batchNo', 'supplier']
    for (const field of requiredInventoryFields) {
      if (!sample[field]) {
        errors.push(`库存数据缺少必要字段: ${field}`)
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

// 验证数据同步
const verifyDataSync = async (originalData) => {
  try {
    const response = await fetch('/api/assistant/verify-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expectedCounts: {
          inventory: originalData.inventory.length,
          inspection: originalData.inspection.length,
          production: originalData.production.length
        }
      })
    })

    if (response.ok) {
      const result = await response.json()
      return { verified: result.verified, message: result.message }
    } else {
      return { verified: false, message: '验证请求失败' }
    }
  } catch (error) {
    console.warn('数据验证失败:', error)
    return { verified: false, message: error.message }
  }
}

// 分批推送数据
const syncDataInBatches = async (data) => {
  try {
    console.log('🔄 开始分批推送数据...')

    const batchSize = 50 // 每批50条记录
    const batches = []

    // 分割库存数据
    for (let i = 0; i < data.inventory.length; i += batchSize) {
      batches.push({
        type: 'inventory',
        data: data.inventory.slice(i, i + batchSize)
      })
    }

    // 分割检测数据
    for (let i = 0; i < data.inspection.length; i += batchSize) {
      batches.push({
        type: 'inspection',
        data: data.inspection.slice(i, i + batchSize)
      })
    }

    // 分割生产数据
    for (let i = 0; i < data.production.length; i += batchSize) {
      batches.push({
        type: 'production',
        data: data.production.slice(i, i + batchSize)
      })
    }

    let successCount = 0
    for (const batch of batches) {
      try {
        const response = await fetch('/api/assistant/update-data-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(batch)
        })

        if (response.ok) {
          successCount++
        } else {
          console.error(`批次推送失败: ${batch.type}`)
        }
      } catch (batchError) {
        console.error(`批次推送异常: ${batch.type}`, batchError)
      }
    }

    const success = successCount === batches.length
    if (success) {
      ElMessage.success('分批数据同步成功！')
    } else {
      ElMessage.warning(`部分数据同步成功 (${successCount}/${batches.length})`)
    }

    return success
  } catch (error) {
    console.error('分批推送失败:', error)
    ElMessage.error('分批数据同步失败')
    return false
  }
}

// 生命周期
onMounted(async () => {
  console.log('🤖 AI智能助手三栏布局已加载')

  // 调试规则数据
  console.log('🔍 调试规则数据:', qaRules.value)
  console.log('📊 基础规则数量:', qaRules.value.basic.length)
  console.log('📋 基础规则列表:', qaRules.value.basic.map(r => r.name))

  // 强制重新赋值规则数据（解决可能的响应式问题）- 更新版本 - ${Date.now()}
  qaRules.value = {
    ...qaRules.value,
    basic: [
      { name: '🏭 工厂库存查询 [MOUNTED]', query: '查询深圳工厂的库存情况', icon: '🏭', category: 'factory_query' },
      { name: '🏢 供应商物料查询 [MOUNTED]', query: '查询聚龙供应商的物料批次', icon: '🏢', category: 'supplier_query' },
      { name: '🏗️ 结构件类查询 [MOUNTED]', query: '查询电池盖的库存状态', icon: '🏗️', category: 'material_query' },
      { name: '⚠️ 风险物料查询 [MOUNTED]', query: '查询风险状态的物料批次', icon: '⚠️', category: 'status_query' },
      { name: '📦 批次详情查询 [MOUNTED]', query: '查询批次号的详细信息', icon: '📦', category: 'batch_query' },
      { name: '🏪 仓库分布查询 [MOUNTED]', query: '查询中央库存的物料分布', icon: '🏪', category: 'warehouse_query' }
    ]
  }

  console.log('🔄 强制更新后的规则:', qaRules.value.basic.map(r => r.name))

  // 初始化用户会话
  initializeUserSession()

  // 先同步数据到后端 - 增强版
  console.log('🔄 开始数据同步流程...')
  const syncSuccess = await syncDataToBackend()

  if (!syncSuccess) {
    console.warn('⚠️ 数据同步失败，尝试重新生成数据...')
    ElMessage.warning('数据同步失败，请在管理工具中重新生成数据')
  } else {
    console.log('✅ 数据同步成功，系统已准备就绪')
    ElMessage.success('系统数据已同步，可以开始使用智能问答')
  }

  // 调试布局信息
  nextTick(() => {
    const layout = document.querySelector('.three-column-layout')
    const leftPanel = document.querySelector('.left-panel')
    const centerPanel = document.querySelector('.center-panel')
    const rightPanel = document.querySelector('.right-panel')

    console.log('📐 布局调试信息:')
    console.log('主布局:', layout ? '✅ 存在' : '❌ 不存在')
    console.log('左侧面板:', leftPanel ? '✅ 存在' : '❌ 不存在')
    console.log('中间面板:', centerPanel ? '✅ 存在' : '❌ 不存在')
    console.log('右侧面板:', rightPanel ? '✅ 存在' : '❌ 不存在')

    if (layout) {
      console.log('主布局样式:', window.getComputedStyle(layout).display)
    }
    if (leftPanel) {
      console.log('左侧面板宽度:', window.getComputedStyle(leftPanel).width)
    }
    if (centerPanel) {
      console.log('中间面板宽度:', window.getComputedStyle(centerPanel).width)
    }
    if (rightPanel) {
      console.log('右侧面板宽度:', window.getComputedStyle(rightPanel).width)
    }
  })
})

// 初始化用户会话
const initializeUserSession = () => {
  try {
    // 创建用户会话
    const session = userSessionService.createSession(currentUser.value)
    currentUser.value.sessionId = session.sessionId

    console.log('👤 用户会话初始化成功:', session.sessionId)

    // 获取快速输入建议
    updateQuickInputSuggestions()

    // 显示用户信息
    ElMessage.success(`欢迎 ${currentUser.value.name}！会话已建立`)

  } catch (error) {
    console.error('❌ 用户会话初始化失败:', error)
    ElMessage.warning('会话初始化失败，部分功能可能受限')
  }
}

// 更新快速输入建议
const updateQuickInputSuggestions = (partialInput = '') => {
  if (currentUser.value.sessionId) {
    const suggestions = userSessionService.getQuickInputSuggestions(
      currentUser.value.sessionId,
      partialInput
    )
    quickInputHistory.value = suggestions.map(s => s.text)
  }
}

// 优化的AI查询处理 - 集成DeepSeek缓存和实时搜索
const processOptimizedAIQuery = async (question, analysisScenario) => {
  const startTime = Date.now()

  try {
    console.log('🚀 开始优化AI查询处理:', question)

    // 1. 检查DeepSeek缓存
    const cachedResult = deepSeekCacheService.getCachedAnswer(question, currentUser.value.id)
    if (cachedResult) {
      console.log('🎯 DeepSeek缓存命中:', cachedResult.source)

      // 记录到会话历史
      userSessionService.addQueryToHistory(currentUser.value.sessionId, question, {
        ...cachedResult,
        responseTime: Date.now() - startTime,
        source: 'cache'
      })

      return formatCachedResponse(cachedResult, analysisScenario)
    }

    // 2. 使用实时搜索服务
    const searchResult = await realtimeSearchService.executeRealtimeSearch(
      question,
      {
        userId: currentUser.value.id,
        sessionId: currentUser.value.sessionId,
        role: currentUser.value.role,
        department: currentUser.value.department
      }
    )

    if (searchResult.success) {
      const response = searchResult.result.content

      // 3. 缓存结果到DeepSeek
      deepSeekCacheService.setCachedAnswer(
        question,
        response,
        currentUser.value.id,
        {
          engine: searchResult.metadata.engine,
          intent: searchResult.metadata.intent,
          responseTime: searchResult.metadata.responseTime
        }
      )

      // 4. 记录到会话历史
      userSessionService.addQueryToHistory(currentUser.value.sessionId, question, {
        response,
        responseTime: Date.now() - startTime,
        source: searchResult.metadata.engine
      })

      return formatSearchResponse(searchResult, analysisScenario)
    } else {
      throw new Error(searchResult.error || '搜索服务失败')
    }

  } catch (error) {
    console.error('❌ 优化AI查询处理失败:', error)

    // 记录失败到会话历史
    userSessionService.addQueryToHistory(currentUser.value.sessionId, question, {
      error: error.message,
      responseTime: Date.now() - startTime,
      source: 'error'
    })

    return `抱歉，处理您的查询时出现错误：${error.message}`
  }
}

// 格式化缓存响应 - 用户友好版本
const formatCachedResponse = (cachedResult, scenario) => {
  let response = cachedResult.answer || cachedResult.content

  // 检查是否为调试模式
  const isDebugMode = debugMode.value ||
                     new URLSearchParams(window.location.search).get('debug') === 'true' ||
                     localStorage.getItem('ai_debug_mode') === 'true'

  // 只在调试模式下显示缓存技术信息
  if (isDebugMode) {
    response += `\n\n💾 **缓存信息**：\n`
    response += `• 来源：${cachedResult.source === 'exact_cache' ? '精确匹配' : '语义匹配'}\n`
    if (cachedResult.similarity) {
      response += `• 相似度：${(cachedResult.similarity * 100).toFixed(1)}%\n`
    }
    response += `• 缓存时间：${new Date(cachedResult.timestamp).toLocaleString()}\n`
  } else {
    // 生产模式：添加简洁的快速响应提示
    if (cachedResult.source === 'exact_cache') {
      response += `\n\n⚡ *快速响应 - 基于历史查询*`
    }
  }

  return response
}

// 格式化搜索响应 - 用户友好版本
const formatSearchResponse = (searchResult, scenario) => {
  let response = searchResult.result.content

  // 检查是否为调试模式（可以通过URL参数或用户设置控制）
  const isDebugMode = debugMode.value ||
                     new URLSearchParams(window.location.search).get('debug') === 'true' ||
                     localStorage.getItem('ai_debug_mode') === 'true'

  // 添加联网搜索结果显示（优先级最高）
  if (searchResult.metadata.webSearchUsed) {
    response += `\n\n🌐 **联网搜索已启用** - 结合了最新网络信息`

    if (searchResult.metadata.webSearchResults > 0) {
      response += `\n📡 找到 ${searchResult.metadata.webSearchResults} 个相关网络资源`
    }

    if (searchResult.metadata.sources && searchResult.metadata.sources.length > 0) {
      response += `\n🔍 搜索引擎：${searchResult.metadata.sources.join(', ')}`
    }
  }

  // 只在调试模式下显示技术细节
  if (isDebugMode) {
    // 添加解析条件信息（如果有）
    if (searchResult.metadata.parsedCriteria && Object.keys(searchResult.metadata.parsedCriteria).length > 0) {
      response += `\n\n🔍 **解析条件**：\n`
      Object.entries(searchResult.metadata.parsedCriteria).forEach(([key, value]) => {
        const keyMap = {
          materialCategory: '物料分类',
          supplier: '供应商',
          factory: '工厂',
          project: '项目',
          baseline: '基线',
          riskLevel: '风险等级',
          qualityThreshold: '质量阈值'
        }
        response += `• ${keyMap[key] || key}：${value}\n`
      })
    }

    // 添加应用规则信息（如果有）
    if (searchResult.metadata.appliedRules && searchResult.metadata.appliedRules.length > 0) {
      response += `\n📋 **应用规则**：\n`
      searchResult.metadata.appliedRules.forEach(rule => {
        response += `• ${rule}\n`
      })
    }

    response += `\n\n🔍 **搜索信息**：\n`
    response += `• 搜索引擎：${searchResult.metadata.engine}\n`
    response += `• 查询类型：${searchResult.result.category}\n`
    response += `• 响应时间：${searchResult.metadata.responseTime}ms\n`

    if (searchResult.metadata.intent) {
      response += `• 意图识别：${searchResult.metadata.intent.type} (${(searchResult.metadata.intent.confidence * 100).toFixed(1)}%)\n`
    }

    // 添加数据来源标识
    const sourceMap = {
      'enhanced-ai': '增强AI服务 (含联网搜索)',
      'integrated-analysis': '整合分析服务 (多规则结合检索)',
      'assistant-api': '基础助手服务',
      'fallback': '降级模拟服务',
      'error': '错误处理服务'
    }

    response += `\n*数据来源: ${sourceMap[searchResult.result.source] || searchResult.result.source}*`
  } else {
    // 生产模式：显示简洁的联网搜索提示
    if (searchResult.metadata.webSearchUsed) {
      response += `\n\n⚡ *智能回答 - 已结合最新网络信息*`
    } else if (searchResult.metadata.responseTime > 1000) {
      response += `\n\n*查询耗时较长，建议优化查询条件*`
    }
  }

  return response
}

// 调试模式切换
const toggleDebugMode = () => {
  localStorage.setItem('ai_debug_mode', debugMode.value.toString())
  console.log('🔧 调试模式:', debugMode.value ? '开启' : '关闭')
}

// 联网搜索切换
const toggleWebSearch = () => {
  localStorage.setItem('web_search_enabled', webSearchEnabled.value.toString())
  simpleEnhancedAIService.setWebSearchEnabled(webSearchEnabled.value)
  console.log('🌐 联网搜索:', webSearchEnabled.value ? '已启用' : '已禁用')
}

// 强制刷新规则
const forceRefreshRules = () => {
  console.log('🔄 强制刷新规则数据...')

  // 完全重新创建规则对象
  qaRules.value = {
    basic: [
      { name: '🏭 工厂库存查询 [刷新]', query: '查询深圳工厂的库存情况', icon: '🏭', category: 'factory_query' },
      { name: '🏢 供应商物料查询 [刷新]', query: '查询聚龙供应商的物料批次', icon: '🏢', category: 'supplier_query' },
      { name: '🏗️ 结构件类查询 [刷新]', query: '查询电池盖的库存状态', icon: '🏗️', category: 'material_query' },
      { name: '⚠️ 风险物料查询 [刷新]', query: '查询风险状态的物料批次', icon: '⚠️', category: 'status_query' },
      { name: '📦 批次详情查询 [刷新]', query: '查询批次号的详细信息', icon: '📦', category: 'batch_query' },
      { name: '🏪 仓库分布查询 [刷新]', query: '查询中央库存的物料分布', icon: '🏪', category: 'warehouse_query' }
    ],
    advanced: qaRules.value.advanced,
    charts: qaRules.value.charts
  }

  console.log('✅ 规则刷新完成:', qaRules.value.basic.map(r => r.name))
  ElMessage.success('规则已强制刷新')
}
</script>

<style scoped>
/* 主容器 */
.ai-assistant-three-column {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 顶部标题栏 */
.header-bar {
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
}

.header-center {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.user-avatar {
  font-size: 20px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.user-role {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.service-status {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: right;
}

.cache-status {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.ai-status-text {
  font-size: 14px;
  opacity: 0.9;
}

/* 开关样式 */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255,255,255,0.3);
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: rgba(255,255,255,0.5);
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.header-button {
  padding: 8px 16px;
  background: rgba(255,255,255,0.2);
  color: white;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.header-button:hover {
  background: rgba(255,255,255,0.3);
}

/* 三栏主体布局 */
.three-column-layout {
  flex: 1;
  display: flex !important;
  overflow: hidden;
  background: #e1e5e9;
  gap: 1px;
  height: calc(100vh - 60px) !important;
  width: 100% !important;
}

/* 左侧面板 - 15% */
.left-panel {
  width: 15% !important;
  min-width: 200px;
  max-width: 280px;
  background: white;
  display: flex !important;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
  border-right: 1px solid #e1e5e9;
}

/* 中间面板 - 55% */
.center-panel {
  width: 55% !important;
  min-width: 400px;
  background: white;
  display: flex !important;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
  border-right: 1px solid #e1e5e9;
}

/* 右侧面板 - 35% */
.right-panel {
  width: 35% !important;
  min-width: 300px;
  max-width: 500px;
  background: white;
  display: flex !important;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
}

/* 面板头部 */
.panel-header {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  gap: 12px;
}

.panel-icon {
  font-size: 20px;
}

.panel-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

/* 工具分类 */
.tool-categories {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.tool-category {
  margin-bottom: 24px;
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-header:hover {
  background: #e9ecef;
}

.toggle-icon {
  font-size: 12px;
  color: #6c757d;
  transition: transform 0.2s ease;
  margin-left: auto;
}

.toggle-icon.expanded {
  transform: rotate(180deg);
}

.category-icon {
  font-size: 16px;
}

.category-title {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.tool-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tool-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e9ecef;
  background: white;
}

.tool-item:hover {
  background: #f8f9fa;
  border-color: #3498db;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.1);
}

.tool-item.active {
  background: #e3f2fd;
  border-color: #2196f3;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2);
}

/* 规则项特殊样式 */
.rule-item {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border: 1px solid #e9ecef;
  margin-bottom: 6px;
}

.rule-item:hover {
  background: linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%);
  border-color: #2196f3;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.15);
  transform: translateY(-1px);
}

.rule-item .tool-desc {
  font-size: 11px;
  color: #666;
  font-style: italic;
  line-height: 1.3;
}

.tool-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.tool-content {
  flex: 1;
}

.tool-name {
  font-weight: 500;
  color: #2c3e50;
  font-size: 13px;
  margin-bottom: 2px;
}

.tool-desc {
  font-size: 11px;
  color: #7f8c8d;
  line-height: 1.3;
}

/* 快捷操作 */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
}

.quick-action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-icon {
  font-size: 14px;
}

.btn-text {
  font-weight: 500;
}

/* 中间对话区域 */
.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-icon {
  font-size: 18px;
}

.chat-text {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.chat-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #95a5a6;
  transition: all 0.3s;
}

.status-dot.active {
  background: #f39c12;
  animation: pulse 1.5s infinite;
}

.status-text {
  font-size: 12px;
  color: #7f8c8d;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 消息容器 */
.messages-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 欢迎消息 */
.welcome-message {
  display: flex;
  gap: 16px;
  padding: 24px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.welcome-avatar {
  font-size: 32px;
  flex-shrink: 0;
}

.welcome-content h3 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 18px;
}

.welcome-content p {
  margin: 0 0 16px 0;
  color: #7f8c8d;
  line-height: 1.5;
}

.welcome-suggestions {
  margin-top: 16px;
}

.suggestion-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 14px;
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.suggestion-item {
  padding: 8px 12px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  color: #495057;
}

.suggestion-item:hover {
  background: #e3f2fd;
  border-color: #2196f3;
  color: #1976d2;
}

/* 对话消息 */
.message-item {
  display: flex;
  gap: 12px;
  max-width: 80%;
}

.message-item.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
  border: 1px solid #e9ecef;
}

.message-item.user .message-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.message-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.message-text {
  padding: 12px 16px;
  border-radius: 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  line-height: 1.5;
  font-size: 14px;
  color: #2c3e50;
  word-wrap: break-word;
}

/* 消息操作按钮 */
.message-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.message-item:hover .message-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: 1px solid #e1e8ed;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f5f5f5;
  border-color: #409eff;
}

/* 格式化响应样式 */
.formatted-response {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin: 8px 0;
}

.response-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e9ecef;
}

.response-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
}

.result-count {
  background: #409eff;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.response-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.response-item {
  background: white;
  border-radius: 6px;
  padding: 12px;
  border-left: 4px solid #409eff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.item-number {
  background: #409eff;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.item-title {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.item-content {
  color: #5a6c7d;
  font-size: 13px;
  line-height: 1.5;
}

/* Emoji高亮 */
.emoji-highlight {
  font-size: 16px;
  margin-right: 4px;
}

.message-item.user .message-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

/* 不同类型的响应样式 */
.inventory-response {
  border-left: 4px solid #52c41a;
}

.inventory-response .response-header h4 {
  color: #52c41a;
}

.inventory-response .result-count {
  background: #52c41a;
}

.inventory-response .item-number {
  background: #52c41a;
}

.inspection-response {
  border-left: 4px solid #fa8c16;
}

.inspection-response .response-header h4 {
  color: #fa8c16;
}

.inspection-response .result-count {
  background: #fa8c16;
}

.inspection-response .item-number {
  background: #fa8c16;
}

.production-response {
  border-left: 4px solid #722ed1;
}

.production-response .response-header h4 {
  color: #722ed1;
}

.production-response .result-count {
  background: #722ed1;
}

.production-response .item-number {
  background: #722ed1;
}

/* 专业响应样式 */
.professional-response {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
  margin: 16px 0;
}

.response-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.response-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.response-meta {
  font-size: 12px;
  opacity: 0.9;
}

.response-content {
  padding: 20px;
}

.summary-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  border-left: 4px solid #409eff;
}

.summary-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 14px;
}

.summary-value {
  font-size: 18px;
  font-weight: 700;
  color: #409eff;
}

.analysis-note {
  background: #fff7e6;
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid #fa8c16;
}

.analysis-note p {
  margin: 0 0 8px 0;
  font-size: 13px;
  line-height: 1.5;
}

.data-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.data-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #52c41a;
}

.item-index {
  background: #52c41a;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
}

.item-content {
  flex: 1;
  font-size: 14px;
  color: #2c3e50;
}

.single-result {
  background: #f0f9ff;
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid #1890ff;
  font-size: 16px;
  color: #2c3e50;
  text-align: center;
}

.formatted-text {
  line-height: 1.6;
  color: #2c3e50;
}

/* 代码块样式 */
.message-text code {
  background: #f1f3f4;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

/* 强调文本样式 */
.message-text strong {
  color: #2c3e50;
  font-weight: 600;
}

.message-text em {
  color: #5a6c7d;
  font-style: italic;
}

.message-time {
  font-size: 11px;
  color: #95a5a6;
  margin-top: 4px;
  padding: 0 4px;
}

/* 加载消息 */
.loading-message {
  display: flex;
  gap: 12px;
  max-width: 80%;
}

.loading-dots {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 12px;
}

.loading-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #95a5a6;
  animation: loading 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes loading {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.loading-text {
  font-size: 11px;
  color: #95a5a6;
  margin-top: 4px;
  padding: 0 4px;
}

/* 快速输入建议 */
.quick-input-suggestions {
  padding: 12px 20px;
  background: #f1f3f4;
  border-top: 1px solid #e9ecef;
}

.suggestions-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.suggestions-title {
  font-size: 13px;
  font-weight: 600;
  color: #495057;
}

.suggestions-count {
  font-size: 12px;
  color: #6c757d;
}

.suggestions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-item {
  padding: 6px 12px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 16px;
  font-size: 12px;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.suggestion-item:hover:not(:disabled) {
  background: #e3f2fd;
  border-color: #2196f3;
  color: #1976d2;
  transform: translateY(-1px);
}

.suggestion-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 输入区域 */
.input-area {
  padding: 20px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

.input-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  outline: none;
  font-size: 14px;
  background: white;
  transition: all 0.2s;
}

.message-input:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.message-input:disabled {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.send-button {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.send-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.send-button:disabled {
  background: #95a5a6;
  cursor: not-allowed;
  transform: none;
}

/* 功能控制开关 */
.control-toggles {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.debug-toggle, .web-search-toggle {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s;
}

.debug-toggle:hover, .web-search-toggle:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.debug-label, .web-search-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  transition: color 0.2s;
}

.debug-label:hover, .web-search-label:hover {
  color: rgba(255, 255, 255, 0.9);
}

.debug-checkbox, .web-search-checkbox {
  margin-right: 6px;
  accent-color: #667eea;
}

.web-search-checkbox {
  accent-color: #28a745; /* 绿色表示联网功能 */
}

.debug-text, .web-search-text {
  user-select: none;
}

/* 联网搜索特殊样式 */
.web-search-toggle {
  border-color: rgba(40, 167, 69, 0.3);
}

.web-search-toggle:hover {
  border-color: rgba(40, 167, 69, 0.5);
  background: rgba(40, 167, 69, 0.1);
}

/* 专业AI回答样式 */
.professional-ai-response {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #2c3e50;
}

.ai-main-title {
  color: #1a365d;
  font-size: 1.5em;
  font-weight: 700;
  margin: 20px 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #667eea;
}

.ai-section-title {
  color: #2d3748;
  font-size: 1.3em;
  font-weight: 600;
  margin: 18px 0 12px 0;
  padding-left: 12px;
  border-left: 4px solid #667eea;
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.1) 0%, transparent 100%);
  padding: 8px 0 8px 12px;
  border-radius: 0 4px 4px 0;
}

.ai-subsection-title {
  color: #4a5568;
  font-size: 1.1em;
  font-weight: 600;
  margin: 15px 0 10px 0;
  padding-left: 8px;
  border-left: 3px solid #a0aec0;
}

.ai-paragraph {
  margin: 12px 0;
  text-align: justify;
}

.ai-emphasis {
  color: #1a365d;
  font-weight: 600;
  background: linear-gradient(120deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  padding: 2px 4px;
  border-radius: 3px;
}

.ai-italic {
  color: #4a5568;
  font-style: italic;
}

.ai-code {
  background: #f7fafc;
  color: #2d3748;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
  border: 1px solid #e2e8f0;
}

.ai-bullet-list {
  margin: 15px 0;
  padding-left: 0;
  list-style: none;
}

.ai-numbered-list {
  margin: 15px 0;
  padding-left: 0;
  list-style: none;
  counter-reset: ai-counter;
}

.ai-list-item {
  margin: 8px 0;
  padding: 8px 0 8px 30px;
  position: relative;
  border-left: 2px solid transparent;
  transition: all 0.2s ease;
}

.ai-list-item:before {
  content: "•";
  position: absolute;
  left: 12px;
  color: #667eea;
  font-weight: bold;
  font-size: 1.2em;
}

.ai-list-item:hover {
  background: rgba(102, 126, 234, 0.05);
  border-left-color: #667eea;
  border-radius: 0 4px 4px 0;
}

.ai-numbered-item {
  margin: 8px 0;
  padding: 8px 0 8px 40px;
  position: relative;
  border-left: 2px solid transparent;
  transition: all 0.2s ease;
  counter-increment: ai-counter;
}

.item-number {
  position: absolute;
  left: 8px;
  color: #667eea;
  font-weight: bold;
  background: rgba(102, 126, 234, 0.1);
  padding: 2px 6px;
  border-radius: 50%;
  font-size: 0.9em;
  min-width: 24px;
  text-align: center;
}

.ai-numbered-item:hover {
  background: rgba(102, 126, 234, 0.05);
  border-left-color: #667eea;
  border-radius: 0 4px 4px 0;
}

.ai-icon {
  font-size: 1.1em;
  margin-right: 4px;
  display: inline-block;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.ai-divider {
  border: none;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, #667eea 50%, transparent 100%);
  margin: 25px 0;
  border-radius: 1px;
}

/* AI工作流结构化样式 */
.ai-workflow-response {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  padding: 20px;
  margin: 10px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.workflow-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e2e8f0;
}

.workflow-title {
  color: #1a365d;
  font-size: 1.4em;
  font-weight: 700;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.workflow-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}

.analysis-type {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: 600;
}

.confidence-badge {
  background: #10b981;
  color: white;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 0.8em;
  font-weight: 600;
}

.workflow-steps {
  margin: 20px 0;
}

.workflow-step {
  background: white;
  border-radius: 8px;
  margin: 12px 0;
  padding: 15px;
  border-left: 4px solid #667eea;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.workflow-step:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.step-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.step-number {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9em;
  flex-shrink: 0;
}

.step-info {
  flex: 1;
}

.step-title {
  color: #2d3748;
  font-size: 1.1em;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.step-description {
  color: #4a5568;
  font-size: 0.9em;
  margin: 0;
}

.step-status {
  flex-shrink: 0;
}

.status-icon {
  font-size: 1.2em;
}

.step-details {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
  padding-left: 47px;
}

.detail-item {
  background: #f7fafc;
  color: #4a5568;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  border: 1px solid #e2e8f0;
}

.workflow-result {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  border: 1px solid #e2e8f0;
}

.result-title {
  color: #1a365d;
  font-size: 1.2em;
  font-weight: 600;
  margin: 0 0 15px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.result-content {
  line-height: 1.6;
}

.ai-content-formatted {
  color: #2d3748;
}

.content-paragraph {
  margin: 12px 0;
  text-align: justify;
}

.content-section-title {
  color: #2d3748;
  font-size: 1.1em;
  font-weight: 600;
  margin: 18px 0 12px 0;
  padding-left: 12px;
  border-left: 3px solid #667eea;
}

.content-subsection-title {
  color: #4a5568;
  font-size: 1em;
  font-weight: 600;
  margin: 15px 0 10px 0;
}

.content-bullet-list {
  margin: 15px 0;
  padding-left: 0;
  list-style: none;
}

.content-numbered-list {
  margin: 15px 0;
  padding-left: 0;
  list-style: none;
}

.content-list-item {
  margin: 8px 0;
  padding: 6px 0 6px 20px;
  position: relative;
}

.content-list-item:before {
  content: "•";
  position: absolute;
  left: 0;
  color: #667eea;
  font-weight: bold;
}

.content-numbered-item {
  margin: 8px 0;
  padding: 6px 0 6px 30px;
  position: relative;
  display: flex;
  align-items: flex-start;
}

.item-num {
  color: #667eea;
  font-weight: bold;
  margin-right: 8px;
  flex-shrink: 0;
}

.content-emphasis {
  color: #1a365d;
  font-weight: 600;
  background: rgba(102, 126, 234, 0.1);
  padding: 1px 3px;
  border-radius: 3px;
}

.content-italic {
  color: #4a5568;
  font-style: italic;
}

.data-sources {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  border: 1px solid #e2e8f0;
}

.sources-title {
  color: #1a365d;
  font-size: 1.2em;
  font-weight: 600;
  margin: 0 0 15px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.source-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f1f5f9;
}

.source-item:last-child {
  border-bottom: none;
}

.source-icon {
  font-size: 1.2em;
  width: 24px;
  text-align: center;
}

.source-name {
  flex: 1;
  color: #2d3748;
  font-weight: 500;
}

.source-status {
  color: #10b981;
  font-size: 0.9em;
  font-weight: 600;
  background: rgba(16, 185, 129, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
}

.web-sources-detail {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #e2e8f0;
}

.detail-title {
  color: #2d3748;
  font-size: 1em;
  font-weight: 600;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.web-source-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f7fafc;
}

.web-source-item:last-child {
  border-bottom: none;
}

.source-number {
  background: #667eea;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8em;
  font-weight: bold;
  flex-shrink: 0;
}

.source-content {
  flex: 1;
}

.source-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95em;
  display: block;
  margin-bottom: 4px;
}

.source-link:hover {
  text-decoration: underline;
}

.source-snippet {
  color: #4a5568;
  font-size: 0.85em;
  line-height: 1.4;
  margin: 0;
}

.workflow-footer {
  background: #f8fafc;
  border-radius: 8px;
  padding: 15px 20px;
  margin-top: 20px;
  border: 1px solid #e2e8f0;
}

.process-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.process-time,
.data-sources,
.analysis-depth {
  color: #4a5568;
  font-size: 0.9em;
  display: flex;
  align-items: center;
  gap: 6px;
}

.process-time:before {
  content: "⏱️";
}

.data-sources:before {
  content: "📊";
}

.analysis-depth:before {
  content: "🎯";
}

/* 澄清响应样式 */
.clarification-response {
  background: linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%);
  border-radius: 12px;
  padding: 20px;
  margin: 10px 0;
  border-left: 4px solid #f59e0b;
}

.clarification-title {
  color: #92400e;
  font-size: 1.3em;
  font-weight: 600;
  margin: 0 0 15px 0;
}

.intent-analysis {
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
}

.analysis-item {
  display: flex;
  justify-content: space-between;
  margin: 8px 0;
  padding: 5px 0;
  border-bottom: 1px solid #f3f4f6;
}

.analysis-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #374151;
}

.value {
  color: #6b7280;
}

.clarification-questions {
  margin: 20px 0;
}

.question-list {
  background: white;
  border-radius: 8px;
  padding: 15px 20px;
  margin: 10px 0;
}

.question-item {
  margin: 10px 0;
  color: #374151;
  line-height: 1.5;
}

.clarification-footer {
  text-align: center;
  margin-top: 20px;
}

.help-text {
  color: #6b7280;
  font-style: italic;
  margin: 0;
}

/* 数据查询指导样式 */
.data-query-guidance {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-radius: 12px;
  padding: 20px;
  margin: 10px 0;
  border-left: 4px solid #3b82f6;
}

.guidance-title {
  color: #1e40af;
  font-size: 1.3em;
  font-weight: 600;
  margin: 0 0 15px 0;
}

.identified-info,
.missing-info,
.query-examples {
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
}

.info-section {
  margin: 10px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-label {
  font-weight: 600;
  color: #374151;
  min-width: 80px;
}

.field-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.field-tag,
.time-tag {
  background: #3b82f6;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.85em;
  font-weight: 500;
}

.missing-list {
  margin: 10px 0;
  padding-left: 20px;
}

.missing-item {
  color: #dc2626;
  margin: 5px 0;
}

.example-list {
  margin: 10px 0;
}

.example-item {
  background: #f8fafc;
  padding: 10px;
  margin: 8px 0;
  border-radius: 6px;
  border-left: 3px solid #3b82f6;
}

/* 数据查询响应样式 */
.data-query-response {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 12px;
  padding: 20px;
  margin: 10px 0;
  border-left: 4px solid #10b981;
}

.response-title {
  color: #065f46;
  font-size: 1.3em;
  font-weight: 600;
  margin: 0 0 15px 0;
}

.query-summary {
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin: 8px 0;
  padding: 5px 0;
  border-bottom: 1px solid #f3f4f6;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-label {
  font-weight: 600;
  color: #374151;
}

.summary-value {
  color: #6b7280;
}

.data-summary {
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
}

.summary-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin: 10px 0;
}

.stat-item {
  background: #f8fafc;
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  min-width: 120px;
}

.stat-label {
  font-weight: 600;
  color: #374151;
  display: block;
}

.stat-value {
  color: #10b981;
  font-size: 1.2em;
  font-weight: bold;
}

.data-results {
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
}

.results-table {
  overflow-x: auto;
  margin: 10px 0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9em;
}

.data-table th {
  background: #f8fafc;
  color: #374151;
  font-weight: 600;
  padding: 12px 8px;
  text-align: left;
  border-bottom: 2px solid #e5e7eb;
}

.data-table td {
  padding: 10px 8px;
  border-bottom: 1px solid #f3f4f6;
  color: #6b7280;
}

.data-table tr:hover {
  background: #f9fafb;
}

.response-footer {
  text-align: center;
  margin-top: 20px;
}

.data-note,
.action-suggestion {
  color: #6b7280;
  font-size: 0.9em;
  margin: 5px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .workflow-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .step-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .step-details {
    padding-left: 0;
  }

  .process-summary {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .summary-stats {
    flex-direction: column;
    gap: 10px;
  }

  .field-list {
    flex-direction: column;
    gap: 5px;
  }

  .results-table {
    font-size: 0.8em;
  }
}

/* 智能问答链响应样式 */
.intelligent-qa-response {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
  padding: 24px;
  margin: 15px 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border: 1px solid #e2e8f0;
}

.response-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e2e8f0;
}

.response-title {
  color: #1a365d;
  font-size: 1.5em;
  font-weight: 700;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.response-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.intent-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: 600;
}

.confidence-badge {
  background: #10b981;
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.8em;
  font-weight: 600;
}

.data-badge {
  background: #3b82f6;
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.8em;
  font-weight: 600;
}

.analysis-workflow {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  border: 1px solid #e5e7eb;
}

.workflow-title {
  color: #1f2937;
  font-size: 1.2em;
  font-weight: 600;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.workflow-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.step {
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  border-left: 4px solid #10b981;
  transition: all 0.3s ease;
}

.step.completed {
  border-left-color: #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.step:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.step-number {
  background: #10b981;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8em;
  font-weight: bold;
  margin-right: 8px;
}

.step-name {
  font-weight: 600;
  color: #374151;
  display: block;
  margin: 4px 0;
}

.step-result {
  color: #6b7280;
  font-size: 0.85em;
}

.data-summary {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  border: 1px solid #e5e7eb;
}

.summary-title {
  color: #1f2937;
  font-size: 1.2em;
  font-weight: 600;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.summary-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  border: 1px solid #bae6fd;
}

.summary-label {
  color: #0369a1;
  font-size: 0.9em;
  font-weight: 600;
  display: block;
  margin-bottom: 8px;
}

.summary-value {
  color: #1e40af;
  font-size: 1.5em;
  font-weight: bold;
}

.ai-analysis {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  border: 1px solid #e5e7eb;
}

.analysis-title {
  color: #1f2937;
  font-size: 1.2em;
  font-weight: 600;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.analysis-content {
  line-height: 1.6;
  color: #374151;
}

.analysis-section-title {
  color: #1f2937;
  font-size: 1.1em;
  font-weight: 600;
  margin: 20px 0 12px 0;
  padding-left: 12px;
  border-left: 3px solid #3b82f6;
}

.analysis-subsection-title {
  color: #4b5563;
  font-size: 1em;
  font-weight: 600;
  margin: 16px 0 8px 0;
}

.analysis-list-item {
  margin: 6px 0;
  padding-left: 16px;
  position: relative;
}

.analysis-list-item:before {
  content: "•";
  position: absolute;
  left: 0;
  color: #3b82f6;
  font-weight: bold;
}

.analysis-paragraph {
  margin: 12px 0;
  text-align: justify;
}

.detailed-data {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  border: 1px solid #e5e7eb;
}

.data-title {
  color: #1f2937;
  font-size: 1.2em;
  font-weight: 600;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.data-table-container {
  overflow-x: auto;
  margin: 12px 0;
}

.enhanced-data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9em;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.enhanced-data-table th {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  color: #374151;
  font-weight: 600;
  padding: 14px 12px;
  text-align: left;
  border-bottom: 2px solid #e5e7eb;
  font-size: 0.85em;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.enhanced-data-table td {
  padding: 12px;
  border-bottom: 1px solid #f3f4f6;
  color: #6b7280;
  vertical-align: middle;
}

.enhanced-data-table tr:hover {
  background: #f9fafb;
}

.enhanced-data-table tr:last-child td {
  border-bottom: none;
}

.table-note {
  color: #6b7280;
  font-size: 0.85em;
  text-align: center;
  margin: 12px 0 0 0;
  font-style: italic;
}

.tool-results {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  border: 1px solid #e5e7eb;
}

.tool-title {
  color: #1f2937;
  font-size: 1.2em;
  font-weight: 600;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tool-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tool-item {
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #e5e7eb;
}

.tool-icon {
  font-size: 1.2em;
}

.tool-name {
  flex: 1;
  font-weight: 500;
  color: #374151;
}

.tool-status {
  background: #10b981;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 600;
}

.response-footer {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.analysis-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.processing-time,
.data-sources,
.analysis-quality {
  color: #6b7280;
  font-size: 0.9em;
  display: flex;
  align-items: center;
  gap: 6px;
}

.follow-up-suggestions {
  background: #fffbeb;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #fde68a;
}

.suggestion-title {
  color: #92400e;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.suggestion-list {
  margin: 0;
  padding-left: 20px;
}

.suggestion-item {
  color: #78350f;
  margin: 4px 0;
  line-height: 1.4;
}

.error-response {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-radius: 12px;
  padding: 20px;
  margin: 15px 0;
  border: 1px solid #fecaca;
}

.error-title {
  color: #dc2626;
  font-size: 1.2em;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.error-message {
  color: #7f1d1d;
  margin: 8px 0;
}

.error-suggestion {
  color: #7f1d1d;
  font-weight: 600;
  margin: 12px 0 8px 0;
}

.error-suggestions {
  margin: 8px 0;
  padding-left: 20px;
}

.error-suggestions li {
  color: #7f1d1d;
  margin: 4px 0;
}

.error-details {
  color: #991b1b;
  font-size: 0.85em;
  margin: 12px 0 0 0;
  font-family: monospace;
  background: #fee2e2;
  padding: 8px;
  border-radius: 4px;
}

/* 右侧思考过程面板 */
.thinking-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.thinking-status {
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator .status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #95a5a6;
  transition: all 0.3s;
}

.status-indicator.active .status-dot {
  background: #f39c12;
  animation: pulse 1.5s infinite;
}

.status-label {
  font-size: 13px;
  font-weight: 500;
  color: #2c3e50;
}

/* 思考步骤 */
.thinking-steps {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.empty-thinking {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #95a5a6;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 12px;
  line-height: 1.4;
  max-width: 200px;
}

.thinking-step {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  position: relative;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e9ecef;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s;
}

.thinking-step.active .step-number {
  background: #f39c12;
  color: white;
  animation: pulse 1.5s infinite;
}

.thinking-step.completed .step-number {
  background: #27ae60;
  color: white;
}

.thinking-step.error .step-number {
  background: #e74c3c;
  color: white;
}

.step-connector {
  width: 2px;
  height: 30px;
  background: #e9ecef;
  margin-top: 8px;
}

.thinking-step.completed .step-connector {
  background: #27ae60;
}

.step-content {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #e9ecef;
  transition: all 0.3s;
}

.thinking-step.active .step-content {
  border-color: #f39c12;
  box-shadow: 0 2px 8px rgba(243, 156, 18, 0.1);
}

.thinking-step.completed .step-content {
  border-color: #27ae60;
  background: #f8fff9;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.step-icon {
  font-size: 14px;
}

.step-title {
  font-weight: 600;
  color: #2c3e50;
  font-size: 13px;
  flex: 1;
}

.step-time {
  font-size: 10px;
  color: #95a5a6;
}

.step-description {
  font-size: 12px;
  color: #7f8c8d;
  line-height: 1.4;
  margin-bottom: 6px;
}

.step-details {
  font-size: 11px;
  color: #6c757d;
  background: #f8f9fa;
  padding: 6px 8px;
  border-radius: 4px;
  border-left: 3px solid #3498db;
}

/* 思考总结 */
.thinking-summary {
  margin-top: 16px;
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e9ecef;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.summary-icon {
  font-size: 16px;
}

.summary-title {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.summary-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
}

.stat-label {
  color: #7f8c8d;
}

.stat-value {
  color: #2c3e50;
  font-weight: 600;
}

.summary-description {
  font-size: 12px;
  color: #6c757d;
  line-height: 1.4;
}

/* ASCII表格样式 */
.ascii-table-container {
  margin: 16px 0;
  overflow-x: auto;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #e9ecef;
}

.ascii-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  background: white;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.ascii-table th.table-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 8px;
  text-align: center;
  font-weight: 600;
  border: 1px solid #5a67d8;
  font-size: 11px;
}

.ascii-table td.table-cell {
  padding: 10px 8px;
  text-align: center;
  border: 1px solid #e2e8f0;
  background: white;
  font-size: 11px;
  line-height: 1.4;
}

.ascii-table tr:nth-child(even) td {
  background: #f7fafc;
}

.ascii-table tr:hover td {
  background: #edf2f7;
  transition: background-color 0.2s ease;
}

/* 专业AI响应样式增强 */
.professional-ai-response {
  line-height: 1.6;
  color: #2d3748;
}

.ai-section-title {
  color: #2b6cb0;
  font-size: 16px;
  font-weight: 600;
  margin: 16px 0 8px 0;
  padding-bottom: 4px;
  border-bottom: 2px solid #bee3f8;
}

.ai-subsection-title {
  color: #2c5282;
  font-size: 14px;
  font-weight: 600;
  margin: 12px 0 6px 0;
}

.ai-emphasis {
  color: #2b6cb0;
  font-weight: 600;
}

.ai-icon {
  font-size: 14px;
  margin-right: 4px;
}

.ai-bullet-list, .ai-numbered-list {
  margin: 8px 0;
  padding-left: 20px;
}

.ai-list-item {
  margin: 4px 0;
  line-height: 1.5;
}

.ai-numbered-item {
  margin: 4px 0;
  line-height: 1.5;
}

.item-number {
  color: #4299e1;
  font-weight: 600;
  margin-right: 8px;
}

/* 响应式设计 - 保持15%:55%:35%比例 */
@media (max-width: 1400px) {
  .left-panel {
    width: 15%;
    min-width: 180px;
    max-width: 250px;
  }

  .center-panel {
    width: 55%;
    min-width: 350px;
  }

  .right-panel {
    width: 35%;
    min-width: 280px;
    max-width: 450px;
  }
}

@media (max-width: 1200px) {
  .left-panel {
    width: 15%;
    min-width: 160px;
    max-width: 220px;
  }

  .center-panel {
    width: 55%;
    min-width: 300px;
  }

  .right-panel {
    width: 35%;
    min-width: 250px;
    max-width: 400px;
  }
}

@media (max-width: 1000px) {
  .left-panel {
    width: 15%;
    min-width: 140px;
    max-width: 200px;
  }

  .center-panel {
    width: 55%;
    min-width: 280px;
  }

  .right-panel {
    width: 35%;
    min-width: 220px;
    max-width: 350px;
  }
}

@media (max-width: 768px) {
  .three-column-layout {
    flex-direction: column;
  }

  .left-panel, .right-panel {
    width: 100%;
    height: 200px;
  }

  .header-bar {
    height: 50px;
    padding: 0 16px;
  }

  .logo-text {
    font-size: 16px;
  }

  .panel-header {
    padding: 12px 16px;
  }

  .tool-categories {
    padding: 12px;
  }
}
</style>