<template>
  <div class="iqe-ai-assistant">
    <!-- 顶部标题栏 -->
    <div class="header-bar">
      <div class="header-left">
        <div class="logo-section">
          <span class="logo-icon">🤖</span>
          <span class="logo-text">IQE AI 智能助手</span>
        </div>
      </div>
      
      <div class="header-right">
        <span class="ai-status-text">{{ aiMode ? 'AI增强模式' : '基础模式' }}</span>
        <label class="switch">
          <input type="checkbox" v-model="aiMode">
          <span class="slider"></span>
        </label>
        <button @click="clearMessages" class="header-button">清空对话</button>
      </div>
    </div>

    <!-- 主体内容区 -->
    <div class="main-container">
      <!-- 左侧工具面板 -->
      <div class="left-sidebar">
        <!-- 可用工具 -->
        <div class="tool-section">
          <div class="section-header">
            <span class="section-icon">🛠️</span>
            <span class="section-title">可用工具</span>
          </div>
          
          <!-- 数据分析工具 -->
          <div class="tool-category">
            <div class="category-header">
              <span class="category-icon">📊</span>
              <span class="category-title">数据分析</span>
            </div>
            <div class="tool-list">
              <div 
                v-for="tool in dataAnalysisTools" 
                :key="tool.name"
                class="tool-item"
                :class="{ active: selectedTool?.name === tool.name }"
                @click="selectTool(tool)"
              >
                <span class="tool-icon">{{ tool.icon }}</span>
                <div class="tool-content">
                  <div class="tool-name">{{ tool.displayName }}</div>
                  <div class="tool-desc">{{ tool.description }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 可视化工具 -->
          <div class="tool-category">
            <div class="category-header">
              <span class="category-icon">📈</span>
              <span class="category-title">可视化工具</span>
            </div>
            <div class="tool-list">
              <div 
                v-for="tool in visualizationTools" 
                :key="tool.name"
                class="tool-item"
                :class="{ active: selectedTool?.name === tool.name }"
                @click="selectTool(tool)"
              >
                <span class="tool-icon">{{ tool.icon }}</span>
                <div class="tool-content">
                  <div class="tool-name">{{ tool.displayName }}</div>
                  <div class="tool-desc">{{ tool.description }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 联网工具 -->
          <div class="tool-category">
            <div class="category-header">
              <span class="category-icon">🌐</span>
              <span class="category-title">联网工具</span>
            </div>
            <div class="tool-list">
              <div 
                v-for="tool in networkTools" 
                :key="tool.name"
                class="tool-item"
                :class="{ active: selectedTool?.name === tool.name }"
                @click="selectTool(tool)"
              >
                <span class="tool-icon">{{ tool.icon }}</span>
                <div class="tool-content">
                  <div class="tool-name">{{ tool.displayName }}</div>
                  <div class="tool-desc">{{ tool.description }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间问答区域 -->
      <div class="center-chat-area">
        <!-- 对话头部 -->
        <div class="chat-header">
          <div class="chat-tabs">
            <div class="tab-item active">智能分析</div>
            <div class="tab-item">对话记录</div>
            <div class="tab-item">系统设置</div>
            <div class="tab-item">帮助文档</div>
            <div class="tab-item">使用说明</div>
          </div>

          <div class="chat-actions">
            <button @click="exportChat" class="action-btn">
              📥 导出对话
            </button>
          </div>
        </div>

        <!-- 对话内容 -->
        <div class="chat-content">
          <div class="welcome-message" v-if="messages.length === 0">
            <div class="welcome-icon">🤖</div>
            <h3>您好！我是基于DeepSeek大模型的质量管理专家，可以帮您：</h3>

            <!-- 智能助手介绍 -->
            <div class="assistant-intro">
              <div class="intro-header">
                <div class="ai-avatar">
                  <span class="avatar-icon">🤖</span>
                  <div class="status-indicator" :class="{ active: isAIActive }"></div>
                </div>
                <div class="intro-content">
                  <h3 class="intro-title">IQE质量管理智能助手</h3>
                  <p class="intro-text">我会根据您的问题自动识别最适合的分析场景，为您提供专业的质量管理建议。</p>
                </div>
              </div>

              <!-- AI状态指示 -->
              <div class="ai-status-bar">
                <div class="status-item">
                  <span class="status-label">当前状态:</span>
                  <span class="status-value" :class="aiStatusClass">{{ aiStatusText }}</span>
                </div>
                <div class="status-item">
                  <span class="status-label">响应模式:</span>
                  <span class="status-value">智能场景识别</span>
                </div>
              </div>
            </div>
            <div class="welcome-features">
              <div class="feature-item">
                <span class="feature-icon">📊</span>
                <span class="feature-text">分析质量数据和趋势</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🔍</span>
                <span class="feature-text">查询库存、生产、检测信息</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">📈</span>
                <span class="feature-text">生成可视化图表和报告</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🤖</span>
                <span class="feature-text">提供智能决策建议</span>
              </div>
            </div>
            <div class="welcome-tip">
              <span class="sad-face">😞</span>
              <span class="tip-text">AI正在等待您的问题...</span>
            </div>
          </div>

          <!-- 消息列表 -->
          <div 
            v-for="(message, index) in messages" 
            :key="index"
            :class="['message-item', message.type]"
          >
            <div class="message-avatar">
              <span>{{ message.type === 'user' ? '👤' : '🤖' }}</span>
            </div>
            <div class="message-content">
              <!-- 流式回复内容 -->
              <div
                v-if="message.isStreaming || message.processedContent"
                class="message-text streaming"
                v-html="message.processedContent || message.content"
              ></div>

              <!-- 普通消息内容 -->
              <div
                v-else
                class="message-text"
              >{{ message.content }}</div>

              <!-- 流式进度指示器 -->
              <div v-if="message.isStreaming" class="streaming-indicator">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: message.progress + '%' }"></div>
                </div>
                <span class="progress-text">{{ Math.round(message.progress || 0) }}%</span>
              </div>

              <!-- 图表显示 -->
              <div v-if="message.chartData" class="message-chart">
                <div class="chart-header">
                  <h4>{{ message.chartData.title }}</h4>
                  <p>{{ message.chartData.description }}</p>
                </div>
                <div class="chart-container" :id="`chart-${message.timestamp.getTime()}`"></div>
                <div class="chart-info">
                  <span>数据源: {{ message.chartData.source }}</span>
                  <span>记录数: {{ message.chartData.recordCount }}</span>
                </div>
              </div>

              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>

          <!-- 加载状态 -->
          <div v-if="isLoading" class="loading-message">
            <div class="message-avatar">
              <span>🤖</span>
            </div>
            <div class="message-content">
              <div class="loading-dots">AI正在思考中...</div>
            </div>
          </div>
        </div>

        <!-- 输入区域 - 优化版 -->
        <div class="chat-input">
          <!-- 快捷提示 -->
          <div class="quick-suggestions" v-if="!inputMessage && !isLoading">
            <div class="suggestion-title">💡 试试这些问题：</div>
            <div class="suggestion-list">
              <div
                v-for="suggestion in quickSuggestions"
                :key="suggestion"
                class="suggestion-item"
                @click="inputMessage = suggestion"
              >
                {{ suggestion }}
              </div>
            </div>
          </div>

          <div class="input-container">
            <!-- AI状态指示 -->
            <div class="ai-status-indicator" :class="{ processing: isLoading }">
              <span class="status-dot"></span>
              <span class="status-text">{{ isLoading ? 'AI思考中...' : '就绪' }}</span>
            </div>

            <div class="input-wrapper">
              <textarea
                v-model="inputMessage"
                rows="1"
                placeholder="请输入您的问题，我会自动识别场景并提供专业建议..."
                @keydown.ctrl.enter="sendMessage"
                @input="adjustTextareaHeight"
                :disabled="isLoading"
                class="message-input"
                ref="messageInput"
              ></textarea>

              <div class="input-actions">
                <!-- 语音输入按钮 -->
                <button
                  class="action-button voice-button"
                  @click="toggleVoiceInput"
                  :disabled="isLoading"
                  title="语音输入"
                >
                  🎤
                </button>

                <!-- 发送按钮 -->
                <button
                @click="sendMessage"
                :disabled="isLoading || !inputMessage.trim()"
                class="send-button"
              >
                发送 (Ctrl+Enter)
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧AI思考过程面板 -->
      <div class="right-thinking-panel">
        <AIThinkingProcess
          ref="thinkingProcessRef"
          :steps="thinkingSteps"
          :status="thinkingStatus"
          :auto-expand="true"
          @clear="clearThinkingProcess"
        />

          <!-- 思考步骤列表 -->
          <div class="thinking-steps">
            <div
              v-for="(step, index) in thinkingSteps"
              :key="index"
              class="thinking-step"
              :class="{ active: step.status === 'active', completed: step.status === 'completed' }"
            >
              <div class="step-header">
                <div class="step-number">{{ index + 1 }}</div>
                <div class="step-title">{{ step.title }}</div>
                <div class="step-status">
                  <span v-if="step.status === 'active'" class="status-spinner">⏳</span>
                  <span v-else-if="step.status === 'completed'" class="status-check">✅</span>
                  <span v-else class="status-wait">⏸️</span>
                </div>
              </div>

              <div class="step-content" v-if="step.content">
                <div class="step-description">{{ step.description }}</div>
                <div class="step-details" v-if="step.details">
                  <div class="detail-item" v-for="(detail, idx) in step.details" :key="idx">
                    <span class="detail-label">{{ detail.label }}:</span>
                    <span class="detail-value">{{ detail.value }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 执行工具显示 -->
          <div v-if="currentTool" class="current-tool">
            <div class="tool-header">
              <span class="tool-icon">🛠️</span>
              <span class="tool-name">正在使用: {{ currentTool.displayName }}</span>
            </div>
            <div class="tool-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: toolProgress + '%' }"></div>
              </div>
              <div class="progress-text">{{ toolProgress }}%</div>
            </div>
          </div>

          <!-- 数据查询过程 -->
          <div v-if="queryProcess.length > 0" class="query-process">
            <div class="process-header">
              <span class="process-icon">🔍</span>
              <span class="process-title">数据查询过程</span>
            </div>
            <div class="query-list">
              <div
                v-for="(query, index) in queryProcess"
                :key="index"
                class="query-item"
              >
                <div class="query-sql">{{ query.sql }}</div>
                <div class="query-result">找到 {{ query.count }} 条记录</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

// 延迟导入服务，避免循环依赖
let ChartIntegrationService = null
let dataSourceAnalyzer = null
let aiPromptManager = null
let streamingHandler = null
let aiScenarioManager = null
let aiScenarioRuleEngine = null

// 异步导入服务
const loadServices = async () => {
  try {
    const [
      chartService,
      dataAnalyzer,
      promptManager,
      responseHandler,
      scenarioManager,
      ruleEngine
    ] = await Promise.all([
      import('../services/ChartIntegrationService.js'),
      import('../services/DataSourceAnalyzer.js'),
      import('../services/AIPromptManager.js'),
      import('../services/StreamingResponseHandler.js'),
      import('../services/AIScenarioManager.js'),
      import('../services/AIScenarioRuleEngine.js')
    ])

    ChartIntegrationService = chartService.default
    dataSourceAnalyzer = dataAnalyzer.dataSourceAnalyzer
    aiPromptManager = promptManager.aiPromptManager
    streamingHandler = responseHandler.streamingHandler
    aiScenarioManager = scenarioManager.aiScenarioManager
    aiScenarioRuleEngine = ruleEngine.aiScenarioRuleEngine

    console.log('✅ 所有服务加载完成')
  } catch (error) {
    console.error('❌ 服务加载失败:', error)
    ElMessage.error('服务初始化失败')
  }
}

// 导入AI思考过程组件
import AIThinkingProcess from '../components/AIThinkingProcess.vue'

// 响应式数据
const aiMode = ref(true)
const isLoading = ref(false)
const inputMessage = ref('')
const messages = ref([])
const selectedTool = ref(null)

// AI思考过程相关数据
const isThinking = ref(false)
const thinkingSteps = ref([])
const currentTool = ref(null)
const toolProgress = ref(0)
const queryProcess = ref([])

// DeepSeek AI配置
const AI_CONFIG = {
  apiKey: 'sk-cab797574abf4288bcfaca253191565d',
  baseURL: 'https://api.deepseek.com',
  endpoint: '/chat/completions',
  model: 'deepseek-chat'
}

// 当前AI场景
const currentAIScenario = ref(null)
const availableScenarios = ref([])
const selectedScenarioId = ref('')

// AI状态管理
const isAIActive = ref(true)
const aiStatusText = ref('就绪')
const aiStatusClass = ref('ready')
const isProcessing = ref(false)

// AI思考过程管理
const thinkingProcessRef = ref(null)
const thinkingStatus = ref('idle') // idle, thinking, completed, error

// 工具数据
const dataAnalysisTools = ref([
  { name: 'analyze_data', icon: '📊', displayName: '数据分析', description: '深度分析质量管理数据' },
  { name: 'statistical_analysis', icon: '📈', displayName: '统计分析', description: '执行统计分析' },
  { name: 'calculate', icon: '🔢', displayName: '数值计算', description: '执行数值计算分析' },
  { name: 'data_validation', icon: '✅', displayName: '数据验证', description: '验证数据完整性' }
])

const visualizationTools = ref([
  { name: 'create_chart', icon: '📊', displayName: '图表生成', description: '生成数据可视化图表' },
  { name: 'trend_analysis', icon: '📈', displayName: '趋势分析', description: '分析数据趋势变化' },
  { name: 'generate_report', icon: '📄', displayName: '报表生成', description: '生成质量分析报表' }
])

const networkTools = ref([
  { name: 'web_search', icon: '🔍', displayName: '网络搜索', description: '搜索相关信息' },
  { name: 'api_call', icon: '🔗', displayName: 'API调用', description: '调用外部API接口' }
])

// 快捷建议
const quickSuggestions = ref([
  '分析华东工厂的库存风险情况',
  '查看最近一周的质量检测结果',
  '对比各供应商的产品质量表现',
  '生成本月的质量分析报告'
])

// 方法定义
const clearMessages = () => {
  if (confirm('确定要清空所有对话记录吗？')) {
    messages.value = []
    console.log('对话已清空')
  }
}

const exportChat = () => {
  const chatData = {
    timestamp: new Date().toISOString(),
    messages: messages.value,
    aiMode: aiMode.value
  }
  
  const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `chat-export-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  console.log('对话已导出')
}

const selectTool = (tool) => {
  selectedTool.value = tool
  inputMessage.value = `请使用${tool.displayName}工具帮我分析数据`
  console.log(`已选择工具：${tool.displayName}`)

  // 如果是图表生成工具，添加特殊处理
  if (tool.name === 'create_chart') {
    inputMessage.value = '请为我生成一个数据可视化图表，分析当前的质量管理数据'
  } else if (tool.name === 'trend_analysis') {
    inputMessage.value = '请分析数据趋势，生成趋势分析图表'
  }
}

// 输入框自适应高度
const adjustTextareaHeight = (event) => {
  const textarea = event.target
  textarea.style.height = 'auto'
  textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
}

// 语音输入切换
const toggleVoiceInput = () => {
  console.log('语音输入功能开发中...')
  // TODO: 实现语音输入功能
}

// AI思考过程管理
const addThinkingStep = (step) => {
  if (thinkingProcessRef.value) {
    return thinkingProcessRef.value.addStep(step)
  }
}

const updateThinkingStep = (stepId, updates) => {
  if (thinkingProcessRef.value) {
    thinkingProcessRef.value.updateStep(stepId, updates)
  }
}

const completeThinkingStep = (stepId, duration) => {
  if (thinkingProcessRef.value) {
    thinkingProcessRef.value.completeStep(stepId, duration)
  }
}

const errorThinkingStep = (stepId, error) => {
  if (thinkingProcessRef.value) {
    thinkingProcessRef.value.errorStep(stepId, error)
  }
}

const clearThinkingProcess = () => {
  thinkingSteps.value = []
  thinkingStatus.value = 'idle'
  if (thinkingProcessRef.value) {
    thinkingProcessRef.value.clear()
  }
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return

  const userMessage = {
    type: 'user',
    content: inputMessage.value,
    timestamp: new Date()
  }

  messages.value.push(userMessage)
  const question = inputMessage.value
  inputMessage.value = ''
  isLoading.value = true
  isThinking.value = true

  // 初始化思考过程
  thinkingStatus.value = 'thinking'
  clearThinkingProcess()
  queryProcess.value = []

  try {
    // 🎯 新的数据驱动AI分析流程
    await executeDataDrivenAnalysis(question)

  } catch (error) {
    console.error('发送消息失败:', error)
    const errorMessage = {
      type: 'ai',
      content: `抱歉，处理您的问题时遇到了错误：${error.message}。请稍后重试。`,
      timestamp: new Date()
    }
    messages.value.push(errorMessage)
  } finally {
    isLoading.value = false
    isThinking.value = false
  }
}

// 🚀 智能问答流程 - 根据问题类型选择处理方式
const executeDataDrivenAnalysis = async (question) => {
  // 第0步：判断问题类型，决定是否需要数据分析
  const stepId1 = addThinkingStep({
    type: 'scenario_analysis',
    title: '问题类型分析',
    description: '正在分析问题类型和所需的处理策略...'
  })

  const questionType = analyzeQuestionType(question)
  console.log('🤔 问题类型分析:', questionType)

  completeThinkingStep(stepId1, 200)
  updateThinkingStep(stepId1, {
    details: {
      confidence: questionType.confidence * 100,
      reasoning: `识别为${questionType.questionCategory}类问题，需要数据分析：${questionType.needsDataAnalysis ? '是' : '否'}`
    }
  })

  if (questionType.needsDataAnalysis) {
    // 复杂问题：执行完整的数据驱动分析流程
    await executeComplexAnalysis(question)
  } else {
    // 简单问题：直接AI回答
    await executeSimpleResponse(question, questionType)
  }
}

// 分析问题类型 - 集成场景规则引擎
const analyzeQuestionType = (question) => {
  // 使用场景规则引擎进行智能分析
  const ruleAnalysis = aiScenarioRuleEngine.processQuestion(question)

  // 传统关键词分析作为补充
  const questionLower = question.toLowerCase()
  const dataKeywords = ['查询', '分析', '统计', '对比', '趋势', '数据', '报告', '图表']
  const simpleKeywords = ['什么是', '如何', '为什么', '怎么', '介绍', '说明', '解释']
  const entityKeywords = ['库存', '生产', '检测', '质量', '工厂', '供应商', '物料', '批次']

  const hasDataKeywords = dataKeywords.some(keyword => questionLower.includes(keyword))
  const hasSimpleKeywords = simpleKeywords.some(keyword => questionLower.includes(keyword))
  const hasEntityKeywords = entityKeywords.some(keyword => questionLower.includes(keyword))

  // 综合判断逻辑
  let needsDataAnalysis = false
  let questionCategory = 'general'
  let processingStrategy = 'ai_generated'
  let matchedScenario = null
  let matchedRules = []

  // 优先使用规则引擎结果
  if (ruleAnalysis.scenarioMatch.hasMatch) {
    matchedScenario = ruleAnalysis.scenarioMatch.primaryScenario
    questionCategory = matchedScenario.scenarioId

    if (ruleAnalysis.ruleMatch.hasRules) {
      needsDataAnalysis = true
      processingStrategy = 'rule_based'
      matchedRules = ruleAnalysis.ruleMatch.matchedRules
    } else if (hasDataKeywords || hasEntityKeywords) {
      needsDataAnalysis = true
      processingStrategy = 'data_driven'
    } else {
      needsDataAnalysis = false
      processingStrategy = 'ai_generated'
    }
  } else {
    // 回退到传统分析
    if (hasDataKeywords && hasEntityKeywords) {
      needsDataAnalysis = true
      questionCategory = 'data_query'
      processingStrategy = 'data_driven'
    } else if (hasSimpleKeywords) {
      needsDataAnalysis = false
      questionCategory = 'simple_qa'
    } else if (hasEntityKeywords) {
      needsDataAnalysis = true
      questionCategory = 'business_query'
      processingStrategy = 'data_driven'
    } else {
      needsDataAnalysis = false
      questionCategory = 'general_chat'
    }
  }

  return {
    needsDataAnalysis,
    questionCategory,
    processingStrategy,
    confidence: ruleAnalysis.scenarioMatch.hasMatch ?
      ruleAnalysis.scenarioMatch.primaryScenario.confidence :
      (hasDataKeywords || hasEntityKeywords ? 0.8 : 0.6),
    ruleAnalysis,
    matchedScenario,
    matchedRules
  }
}

// 执行复杂数据分析流程
const executeComplexAnalysis = async (question) => {
  // 第1步：分析问题涉及的数据源
  const stepId2 = addThinkingStep({
    type: 'data_query',
    title: '数据源识别',
    description: '正在分析问题涉及的数据源和查询策略...'
  })

  const dataAnalysis = dataSourceAnalyzer.analyzeDataSources(question)
  console.log('📊 数据源分析结果:', dataAnalysis)

  completeThinkingStep(stepId2, 300)
  updateThinkingStep(stepId2, {
    details: {
      queryType: dataAnalysis.queryStrategy,
      parameters: {
        dataSources: dataAnalysis.involvedSources.join(', '),
        confidence: `${dataAnalysis.confidence}%`
      },
      resultCount: dataAnalysis.involvedSources.length
    }
  })

  // 第2步：执行数据查询
  const stepId3 = addThinkingStep({
    type: 'data_query',
    title: '数据查询执行',
    description: '正在从相关数据源查询匹配数据...'
  })

  const queryStartTime = Date.now()
  const queryResults = await dataSourceAnalyzer.executeDataQuery(dataAnalysis)
  const queryDuration = Date.now() - queryStartTime
  console.log('📋 查询结果:', queryResults)

  // 更新查询过程显示
  Object.entries(queryResults.sources).forEach(([source, data]) => {
    queryProcess.value.push({
      sql: `SELECT * FROM ${source} WHERE conditions`,
      count: data.length
    })
  })

  completeThinkingStep(stepId3, queryDuration)
  updateThinkingStep(stepId3, {
    details: {
      queryType: '多源数据查询',
      parameters: {
        sources: Object.keys(queryResults.sources).join(', '),
        dataQuality: queryResults.summary.dataQuality
      },
      resultCount: queryResults.totalRecords
    }
  })
  thinkingSteps.value[1].status = 'completed'

  // 第3步：AI分析处理
  thinkingSteps.value.push({
    title: '🤖 AI智能分析',
    description: 'DeepSeek AI基于数据进行深度分析',
    status: 'active',
    details: [
      { label: '分析模式', value: 'DeepSeek-V3' },
      { label: '数据输入', value: `${queryResults.totalRecords}条记录` }
    ]
  })

  // 获取当前场景配置
  const scenario = currentAIScenario.value || aiScenarioManager.getCurrentScenario()

  // 构建场景化的AI分析提示词
  const analysisPrompt = buildScenarioPrompt(question, dataAnalysis, queryResults, scenario)
  console.log('💭 AI分析提示词:', analysisPrompt)
  console.log('🎭 使用场景:', scenario.name)

  // 调用DeepSeek AI进行分析
  const aiResponse = await callDeepSeekAIWithData(analysisPrompt, {
    question,
    dataAnalysis,
    queryResults,
    scenario
  })

  thinkingSteps.value[2].status = 'completed'

  // 第4步：工具调用评估
  thinkingSteps.value.push({
    title: '⚙️ 工具调用评估',
    description: '评估是否需要生成图表或调用其他工具',
    status: 'active',
    details: []
  })

  // 分析是否需要工具调用
  const toolRequirements = aiPromptManager.analyzeToolRequirements(aiResponse, {
    question,
    dataAnalysis,
    queryResults
  })

  console.log('🛠️ 工具需求分析:', toolRequirements)

  let chartData = null
  if (toolRequirements.needsChart && queryResults.totalRecords > 0) {
    currentTool.value = {
      displayName: `${toolRequirements.chartType}图表生成器`,
      description: toolRequirements.chartDescription
    }

    // 生成图表
    chartData = await generateChartFromData(queryResults, toolRequirements)

    thinkingSteps.value[3].details.push(
      { label: '图表类型', value: toolRequirements.chartType },
      { label: '生成状态', value: chartData ? '成功' : '失败' }
    )
  }

  thinkingSteps.value[3].status = 'completed'
  currentTool.value = null

  // 第5步：结果呈现
  thinkingSteps.value.push({
    title: '📊 结果综合呈现',
    description: '整合分析结果，生成最终回复',
    status: 'active',
    details: [
      { label: '回复长度', value: `${aiResponse.length}字符` },
      { label: '包含图表', value: chartData ? '是' : '否' }
    ]
  })

  // 创建流式回复消息
  const streamingMessage = streamingHandler.createStreamingMessage(aiResponse, 'ai')
  if (chartData) {
    streamingMessage.chartData = chartData
  }

  messages.value.push(streamingMessage)
  const messageIndex = messages.value.length - 1

  // 开始流式回复
  await streamingHandler.startStreaming(
    aiResponse,
    (update) => {
      streamingHandler.updateStreamingMessage(messages.value[messageIndex], update)
    },
    () => {
      console.log('✅ 流式回复完成')
      thinkingSteps.value[4].status = 'completed'
    }
  )
}

// 执行简单问答流程
const executeSimpleResponse = async (question, questionType) => {
  // 检查是否有匹配的规则
  const hasRules = questionType.matchedRules && questionType.matchedRules.length > 0
  const processingMode = hasRules ? '规则化回答' : '直接AI回答'

  // 更新思考过程 - 简化版
  thinkingSteps.value.push({
    title: '🤔 问题理解与场景识别',
    description: `识别为${questionType.questionCategory}类型问题`,
    status: 'active',
    details: [
      { label: '问题类型', value: questionType.questionCategory },
      { label: '处理策略', value: questionType.processingStrategy },
      { label: '处理方式', value: processingMode },
      { label: '置信度', value: `${(questionType.confidence * 100).toFixed(0)}%` },
      { label: '匹配场景', value: questionType.matchedScenario?.scenarioId || '无' },
      { label: '匹配规则', value: hasRules ? `${questionType.matchedRules.length}条` : '无' }
    ]
  })

  await new Promise(resolve => setTimeout(resolve, 500))
  thinkingSteps.value[0].status = 'completed'

  // 第2步：智能回答生成
  thinkingSteps.value.push({
    title: hasRules ? '📋 规则化回答生成' : '🤖 AI智能回答',
    description: hasRules ? '基于业务规则生成专业回答' : '基于场景配置生成专业回答',
    status: 'active',
    details: [
      { label: '使用场景', value: currentAIScenario.value?.name || '通用场景' },
      { label: '回答模式', value: hasRules ? '规则驱动' : '快速响应' },
      { label: '应用规则', value: hasRules ? questionType.matchedRules[0].name : '无' }
    ]
  })

  let aiResponse = ''

  // 根据场景和规则智能选择回答策略
  const scenario = getScenarioForQuestion(questionType)

  if (hasRules) {
    // 规则驱动回答
    aiResponse = await generateRuleBasedResponse(question, questionType, scenario)
  } else {
    // 场景驱动AI回答
    aiResponse = await generateScenarioBasedResponse(question, questionType, scenario)
  }

  thinkingSteps.value[1].status = 'completed'

  // 第3步：结果呈现
  thinkingSteps.value.push({
    title: '📝 结果呈现',
    description: '生成最终回复',
    status: 'active',
    details: [
      { label: '回复长度', value: `${aiResponse.length}字符` },
      { label: '包含图表', value: '否' }
    ]
  })

  // 创建流式回复消息
  const streamingMessage = streamingHandler.createStreamingMessage(aiResponse, 'ai')
  messages.value.push(streamingMessage)
  const messageIndex = messages.value.length - 1

  // 开始流式回复
  await streamingHandler.startStreaming(
    aiResponse,
    (update) => {
      streamingHandler.updateStreamingMessage(messages.value[messageIndex], update)
    },
    () => {
      console.log('✅ 简单问答完成')
      thinkingSteps.value[2].status = 'completed'
    }
  )
}

// 构建简化提示词
const buildSimplePrompt = (question, scenario, questionType) => {
  return `${scenario.systemPrompt}

## 当前问答任务：
**用户问题**: ${question}
**问题类型**: ${questionType.questionCategory}

## 回答要求：
- 这是一个${questionType.questionCategory}类型的问题
- 请提供简洁、专业、有用的回答
- 使用${scenario.responseFormat}格式
- 回答长度适中，重点突出

请开始你的专业回答：`
}

// 构建规则增强的提示词
const buildRuleEnhancedPrompt = (question, scenario, questionType) => {
  const matchedRules = questionType.matchedRules || []
  const primaryRule = matchedRules[0]

  return `${scenario.systemPrompt}

## 当前问答任务：
**用户问题**: ${question}
**问题类型**: ${questionType.questionCategory}
**匹配场景**: ${questionType.matchedScenario?.scenarioId || '未知'}

## 业务规则指导：
**规则名称**: ${primaryRule?.name || '无'}
**规则描述**: ${primaryRule?.response || '无特定规则'}
**数据源**: ${primaryRule?.dataSource?.join(', ') || '无'}

## 回答要求：
- 严格遵循业务规则进行回答
- 结合场景特点提供专业建议
- 使用${scenario.responseFormat}格式
- 如需数据支撑，说明数据来源和分析方法
- 提供可操作的建议和下一步行动

请基于业务规则开始你的专业回答：`
}

// 根据问题类型获取最适合的场景
const getScenarioForQuestion = (questionType) => {
  // 如果有匹配的场景，使用匹配的场景配置
  if (questionType.matchedScenario) {
    const scenarioId = questionType.matchedScenario.scenarioId
    const scenarioConfig = aiScenarioManager.getScenarioById(scenarioId)
    if (scenarioConfig) {
      return scenarioConfig
    }
  }

  // 否则使用默认场景
  return aiScenarioManager.getCurrentScenario()
}

// 生成规则驱动的回答
const generateRuleBasedResponse = async (question, questionType, scenario) => {
  const ruleBasedResponse = questionType.ruleAnalysis.ruleBasedResponse
  if (ruleBasedResponse) {
    return ruleBasedResponse
  }

  // 规则回答生成失败，使用增强的AI回答
  const enhancedPrompt = buildRuleEnhancedPrompt(question, scenario, questionType)
  return await callDeepSeekAIWithData(enhancedPrompt, {
    question,
    scenario,
    questionType,
    isSimple: true,
    hasRules: true
  })
}

// 生成场景驱动的AI回答
const generateScenarioBasedResponse = async (question, questionType, scenario) => {
  // 根据场景类型选择不同的提示词策略
  let prompt = ''

  switch (questionType.questionCategory) {
    case 'inventory':
      prompt = buildInventoryPrompt(question, scenario, questionType)
      break
    case 'quality':
      prompt = buildQualityPrompt(question, scenario, questionType)
      break
    case 'production':
      prompt = buildProductionPrompt(question, scenario, questionType)
      break
    case 'risk':
      prompt = buildRiskPrompt(question, scenario, questionType)
      break
    case 'decision':
      prompt = buildDecisionPrompt(question, scenario, questionType)
      break
    default:
      prompt = buildGeneralPrompt(question, scenario, questionType)
  }

  console.log(`💭 ${questionType.questionCategory}场景提示词:`, prompt)

  return await callDeepSeekAIWithData(prompt, {
    question,
    scenario,
    questionType,
    isSimple: true,
    scenarioType: questionType.questionCategory
  })
}

// 构建场景化提示词
const buildScenarioPrompt = (question, dataAnalysis, queryResults, scenario) => {
  const basePrompt = aiPromptManager.buildAnalysisPrompt(question, dataAnalysis, queryResults)

  // 使用场景的系统提示词替换默认提示词
  const scenarioPrompt = `${scenario.systemPrompt}

## 当前分析任务：
**用户问题**: ${question}

## 数据源分析结果：
- **涉及数据源**: ${dataAnalysis.involvedSources.join(', ')}
- **查询策略**: ${dataAnalysis.queryStrategy}
- **提取实体**: ${JSON.stringify(dataAnalysis.extractedEntities, null, 2)}
- **置信度**: ${dataAnalysis.confidence}%

## 查询到的数据：
${aiPromptManager.formatQueryResults(queryResults)}

## 分析要求：
根据你的专业领域和分析方法，请对以上数据进行深度分析。
- 思考方式: ${scenario.thinkingStyle}
- 分析深度: ${scenario.analysisDepth}
- 回复格式: ${scenario.responseFormat}

请开始你的专业分析：`

  return scenarioPrompt
}

// 库存场景专用提示词 - 增强版
const buildInventoryPrompt = (question, scenario, questionType) => {
  const contextData = getInventoryContext(questionType)

  return `${scenario.systemPrompt}

## 🏭 库存管理专家模式
您是一位拥有15年经验的高级库存管理专家，专精于制造业物料库存优化和供应链风险管理。

### 📋 当前分析任务
**用户问题**: ${question}
**场景类型**: 库存管理分析
**识别置信度**: ${(questionType.confidence * 100).toFixed(0)}%
**分析时间**: ${new Date().toLocaleString()}

### 🎯 专业分析框架
请按照以下专业框架进行分析：

#### 1. 库存状态评估
- **库存水平分析**: 当前库存量vs安全库存vs最大库存
- **周转率评估**: 库存周转天数、周转次数、资金占用效率
- **ABC分类管理**: 重要物料的库存策略差异化
- **呆滞库存识别**: 超期库存、慢动销物料风险评估

#### 2. 供应链风险分析
- **供应商表现**: 准时交付率、质量合格率、价格稳定性
- **供应风险等级**: 单一供应商依赖、地理集中度风险
- **市场波动影响**: 原材料价格趋势、需求变化预测

#### 3. 优化建议制定
- **短期行动计划**: 立即可执行的优化措施
- **中期策略调整**: 3-6个月的库存策略优化
- **长期体系建设**: 库存管理体系完善建议

#### 4. 关键指标监控
- **预警阈值设定**: 库存上下限、周转率警戒线
- **KPI监控体系**: 库存准确率、缺货率、库存成本率
- **持续改进机制**: 定期评估和优化建议

### 📊 数据分析要求
- 使用具体数据支撑分析结论
- 提供量化的改进目标和预期效果
- 结合行业最佳实践和标杆对比
- 考虑成本效益和实施可行性

### 🎨 回答格式要求
请使用结构化的专业报告格式，包含：
1. **执行摘要** (核心发现和建议)
2. **详细分析** (数据支撑的深度分析)
3. **行动计划** (具体的实施步骤)
4. **风险提示** (潜在风险和应对措施)

现在请开始您的专业分析：`
}

// 质量检测场景专用提示词 - 增强版
const buildQualityPrompt = (question, scenario, questionType) => {
  const contextData = getQualityContext(questionType)

  return `${scenario.systemPrompt}

## 🔬 质量管理专家模式
您是一位获得六西格玛黑带认证的资深质量管理专家，拥有20年制造业质量控制和持续改进经验。

### 📋 质量分析任务
**用户问题**: ${question}
**场景类型**: 质量管理分析
**识别置信度**: ${(questionType.confidence * 100).toFixed(0)}%
**分析时间**: ${new Date().toLocaleString()}

### 🎯 质量分析方法论
请运用以下专业方法论进行分析：

#### 1. 质量现状评估 (DMAIC方法)
- **Define (定义)**: 明确质量问题和改进目标
- **Measure (测量)**: 关键质量指标的当前表现
- **Analyze (分析)**: 质量问题的根本原因分析
- **Improve (改进)**: 质量改进方案和预期效果
- **Control (控制)**: 质量控制措施和监控机制

#### 2. 统计质量控制 (SPC)
- **过程能力分析**: Cp、Cpk、Pp、Ppk指标评估
- **控制图分析**: 过程稳定性和异常模式识别
- **趋势分析**: 质量指标的时间序列变化趋势
- **相关性分析**: 质量因子间的关联关系

#### 3. 质量成本分析
- **预防成本**: 质量预防活动的投入分析
- **检验成本**: 质量检测和验证的成本效益
- **内部失效成本**: 返工、报废等内部质量损失
- **外部失效成本**: 客户投诉、召回等外部质量成本

#### 4. 供应商质量管理
- **供应商质量评级**: 基于质量表现的供应商分级
- **来料质量分析**: 不同供应商的质量差异对比
- **质量协议执行**: 质量标准的符合性评估
- **改进合作计划**: 与供应商的质量提升合作

### 📊 质量工具应用
- **鱼骨图**: 质量问题的系统性原因分析
- **帕累托图**: 质量问题的优先级排序
- **散点图**: 质量因子的相关性分析
- **直方图**: 质量数据的分布特征分析
- **控制图**: 过程质量的统计监控

### 🎯 改进建议框架
#### 短期措施 (1-3个月)
- 立即可实施的质量改进行动
- 紧急质量问题的应急处理方案

#### 中期规划 (3-12个月)
- 系统性的质量改进项目
- 质量管理体系的优化升级

#### 长期战略 (1-3年)
- 质量文化建设和人员能力提升
- 数字化质量管理系统建设

### 📈 回答要求
请提供：
1. **质量诊断报告** (数据驱动的现状分析)
2. **根因分析** (运用质量工具的深度分析)
3. **改进路线图** (分阶段的改进计划)
4. **效果预测** (量化的改进目标和ROI分析)
5. **风险评估** (改进过程中的潜在风险)

现在请开始您的专业质量分析：`
}

// 生产管理场景专用提示词 - 增强版
const buildProductionPrompt = (question, scenario, questionType) => {
  const contextData = getProductionContext(questionType)

  return `${scenario.systemPrompt}

## ⚙️ 生产管理专家模式
您是一位精益生产和工业4.0领域的资深专家，拥有18年制造业生产管理和数字化转型经验。

### 📋 生产分析任务
**用户问题**: ${question}
**场景类型**: 生产管理优化
**识别置信度**: ${(questionType.confidence * 100).toFixed(0)}%
**分析时间**: ${new Date().toLocaleString()}

### 🎯 精益生产分析框架
请运用以下专业方法论进行分析：

#### 1. 生产效率分析 (OEE体系)
- **设备综合效率 (OEE)**: 可用率 × 表现率 × 质量率
- **可用率分析**: 计划停机、故障停机、换线时间优化
- **表现率评估**: 实际产能vs理论产能，速度损失分析
- **质量率监控**: 良品率、返工率、报废率趋势分析

#### 2. 产能规划与优化
- **产能平衡分析**: 各工序产能匹配度和瓶颈识别
- **负荷分析**: 设备利用率、人员配置合理性
- **柔性生产能力**: 多品种小批量生产的适应性
- **产能扩展规划**: 基于需求预测的产能投资建议

#### 3. 精益改善 (Lean Improvement)
- **价值流分析**: 识别增值和非增值活动
- **七大浪费消除**: 过量生产、等待、运输、过度加工、库存、动作、不良品
- **5S现场管理**: 整理、整顿、清扫、清洁、素养
- **TPM全员生产维护**: 预防性维护和自主维护

#### 4. 数字化生产管理
- **MES系统应用**: 生产执行系统的数据分析
- **IoT设备监控**: 实时生产数据采集和分析
- **预测性维护**: 基于数据的设备故障预测
- **智能排产优化**: AI驱动的生产计划优化

### 📊 关键绩效指标 (KPI)
#### 效率指标
- **整体设备效率 (OEE)**: 目标≥85%
- **直通率 (FTY)**: 一次通过率目标≥95%
- **准时交付率 (OTIF)**: 目标≥98%

#### 质量指标
- **过程能力指数 (Cpk)**: 目标≥1.33
- **客户投诉率**: 目标<10PPM
- **内部不良率**: 目标<0.5%

#### 成本指标
- **单位制造成本**: 持续降低趋势
- **能耗效率**: 单位产品能耗优化
- **人员效率**: 人均产值提升

### 🔧 改进工具箱
- **PDCA循环**: 持续改进的标准流程
- **FMEA分析**: 失效模式和影响分析
- **DOE实验设计**: 工艺参数优化
- **统计过程控制 (SPC)**: 过程稳定性监控
- **根因分析**: 5Why、鱼骨图等工具

### 📈 优化建议结构
#### 1. 现状诊断
- 生产效率现状评估
- 关键瓶颈和问题识别
- 对标分析和差距评估

#### 2. 改进方案
- 短期快速改善措施 (Quick Win)
- 中期系统性改进项目
- 长期战略性升级规划

#### 3. 实施路径
- 改进项目优先级排序
- 资源需求和投资回报分析
- 风险评估和应对措施

#### 4. 效果预测
- 量化的改进目标设定
- 投资回报率 (ROI) 计算
- 实施时间表和里程碑

现在请开始您的专业生产管理分析：`
}

// 获取库存上下文信息
const getInventoryContext = (questionType) => {
  return {
    currentTime: new Date().toLocaleString(),
    analysisScope: questionType.entities || {},
    dataFreshness: '实时数据',
    industryBenchmarks: {
      inventoryTurnover: '12-15次/年',
      stockoutRate: '<2%',
      inventoryAccuracy: '>99%'
    }
  }
}

// 获取质量上下文信息
const getQualityContext = (questionType) => {
  return {
    currentTime: new Date().toLocaleString(),
    analysisScope: questionType.entities || {},
    qualityStandards: ['ISO 9001', 'ISO/TS 16949', 'Six Sigma'],
    industryBenchmarks: {
      defectRate: '<100PPM',
      cpkTarget: '>1.33',
      customerSatisfaction: '>95%'
    }
  }
}

// 获取生产上下文信息
const getProductionContext = (questionType) => {
  return {
    currentTime: new Date().toLocaleString(),
    analysisScope: questionType.entities || {},
    productionStandards: ['Lean Manufacturing', 'TPM', 'Industry 4.0'],
    industryBenchmarks: {
      oeeTarget: '>85%',
      onTimeDelivery: '>98%',
      firstPassYield: '>95%'
    }
  }
}

// 风险管理场景专用提示词
const buildRiskPrompt = (question, scenario, questionType) => {
  return `${scenario.systemPrompt}

## 风险管理专家模式
您是一位专业的风险管理专家，专注于风险识别、评估和控制。

**用户问题**: ${question}
**场景类型**: 风险管理
**置信度**: ${(questionType.confidence * 100).toFixed(0)}%

## 分析要求：
- 全面识别和评估各类风险
- 提供风险控制和预防措施
- 建立风险预警和监控机制
- 制定应急响应和处置方案

请以风险管理专家的身份回答：`
}

// 决策支持场景专用提示词
const buildDecisionPrompt = (question, scenario, questionType) => {
  return `${scenario.systemPrompt}

## 决策支持专家模式
您是一位资深的管理决策顾问，专注于数据驱动的决策支持。

**用户问题**: ${question}
**场景类型**: 决策支持
**置信度**: ${(questionType.confidence * 100).toFixed(0)}%

## 分析要求：
- 提供多维度的对比分析
- 评估不同方案的优劣势
- 给出明确的决策建议和理由
- 考虑风险因素和实施可行性

请以决策支持专家的身份回答：`
}

// 通用场景提示词
const buildGeneralPrompt = (question, scenario, questionType) => {
  return `${scenario.systemPrompt}

## 质量管理通用助手模式
您是一位全面的质量管理助手，能够处理各类质量管理相关问题。

**用户问题**: ${question}
**问题类型**: ${questionType.questionCategory}
**置信度**: ${(questionType.confidence * 100).toFixed(0)}%

## 回答要求：
- 提供专业、准确的回答
- 结合质量管理最佳实践
- 给出具体可行的建议
- 保持回答的简洁和实用性

请开始您的专业回答：`
}

// 调用DeepSeek AI - 数据驱动版本
const callDeepSeekAIWithData = async (analysisPrompt, context) => {
  try {
    const { scenario } = context

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
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: scenario.temperature || 0.7,
        max_tokens: scenario.maxTokens || 2500,
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API调用失败: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content

    console.log('🤖 DeepSeek AI回复:', aiResponse)
    return aiResponse

  } catch (error) {
    console.error('DeepSeek AI调用失败:', error)
    // 返回基于数据的备用分析
    return generateFallbackAnalysis(context)
  }
}

// 生成备用分析（当AI调用失败时）
const generateFallbackAnalysis = (context) => {
  const { question, queryResults } = context

  let analysis = `# 📊 数据分析报告\n\n`
  analysis += `**问题**: ${question}\n\n`

  if (queryResults.totalRecords === 0) {
    analysis += `## ⚠️ 数据状态\n未找到相关数据。建议：\n- 检查查询条件\n- 确认数据源\n- 尝试更宽泛的搜索条件\n\n`
  } else {
    analysis += `## 📋 数据概况\n`
    analysis += `- **总记录数**: ${queryResults.totalRecords}\n`
    analysis += `- **数据源**: ${Object.keys(queryResults.sources).join(', ')}\n\n`

    Object.entries(queryResults.sources).forEach(([source, data]) => {
      if (data.length > 0) {
        analysis += `### ${source.toUpperCase()}数据分析\n`
        analysis += `- 记录数量: ${data.length}\n`

        if (source === 'inventory') {
          const statusCounts = {}
          data.forEach(item => {
            const status = item.status || 'Unknown'
            statusCounts[status] = (statusCounts[status] || 0) + 1
          })
          analysis += `- 状态分布: ${Object.entries(statusCounts).map(([k,v]) => `${k}:${v}`).join(', ')}\n`
        }

        analysis += '\n'
      }
    })

    analysis += `## 💡 建议\n`
    analysis += `基于当前数据，建议进行进一步的深度分析和可视化展示。\n\n`
  }

  return analysis
}

// 检查是否需要生成图表
const checkIfNeedsChart = (question, response) => {
  const chartKeywords = ['图表', '图', '可视化', '趋势', '分布', '对比', '统计', '分析图']
  const questionLower = question.toLowerCase()
  const responseLower = response.toLowerCase()

  return chartKeywords.some(keyword =>
    questionLower.includes(keyword) || responseLower.includes(keyword)
  )
}

// 生成图表
const generateChart = async (question, response) => {
  try {
    // 使用ChartIntegrationService生成图表
    const mockData = generateMockDataForChart(question)
    const chartData = ChartIntegrationService.generateChartByQuery(question, mockData)

    return chartData
  } catch (error) {
    console.error('图表生成失败:', error)
    return null
  }
}

// 基于真实数据生成图表
const generateChartFromData = async (queryResults, toolRequirements) => {
  try {
    const { chartType, chartTitle, chartDescription } = toolRequirements

    // 选择主要数据源
    const primarySource = Object.keys(queryResults.sources)[0]
    const data = queryResults.sources[primarySource]

    if (!data || data.length === 0) {
      return null
    }

    let chartData = null

    switch (chartType) {
      case 'pie':
        chartData = generatePieChartData(data, primarySource)
        break
      case 'bar':
        chartData = generateBarChartData(data, primarySource)
        break
      case 'line':
        chartData = generateLineChartData(data, primarySource)
        break
      case 'radar':
        chartData = generateRadarChartData(data, primarySource)
        break
      default:
        chartData = generateBarChartData(data, primarySource)
    }

    return {
      type: chartType,
      title: chartTitle,
      description: chartDescription,
      data: chartData,
      source: primarySource,
      recordCount: data.length
    }

  } catch (error) {
    console.error('图表生成失败:', error)
    return null
  }
}

// 生成饼图数据
const generatePieChartData = (data, source) => {
  if (source === 'inventory') {
    const statusCounts = {}
    data.forEach(item => {
      const status = item.status || 'Unknown'
      statusCounts[status] = (statusCounts[status] || 0) + 1
    })

    return {
      chartType: 'pie',
      categories: Object.keys(statusCounts),
      series: [{
        name: '库存状态分布',
        data: Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
      }]
    }
  }

  if (source === 'inspection') {
    const resultCounts = {}
    data.forEach(item => {
      const result = item.testResult || 'Unknown'
      resultCounts[result] = (resultCounts[result] || 0) + 1
    })

    return {
      chartType: 'pie',
      categories: Object.keys(resultCounts),
      series: [{
        name: '测试结果分布',
        data: Object.entries(resultCounts).map(([name, value]) => ({ name, value }))
      }]
    }
  }

  return null
}

// 生成柱状图数据
const generateBarChartData = (data, source) => {
  if (source === 'inventory') {
    const factoryCounts = {}
    data.forEach(item => {
      const factory = item.factory || 'Unknown'
      factoryCounts[factory] = (factoryCounts[factory] || 0) + 1
    })

    return {
      chartType: 'bar',
      categories: Object.keys(factoryCounts),
      series: [{
        name: '库存数量',
        data: Object.values(factoryCounts)
      }]
    }
  }

  if (source === 'production') {
    const factoryDefects = {}
    data.forEach(item => {
      const factory = item.factory || 'Unknown'
      if (!factoryDefects[factory]) {
        factoryDefects[factory] = { total: 0, defectSum: 0 }
      }
      factoryDefects[factory].total += 1
      factoryDefects[factory].defectSum += parseFloat(item.defectRate) || 0
    })

    return {
      chartType: 'bar',
      categories: Object.keys(factoryDefects),
      series: [{
        name: '平均不良率(%)',
        data: Object.values(factoryDefects).map(f =>
          f.total > 0 ? (f.defectSum / f.total).toFixed(2) : 0
        )
      }]
    }
  }

  return null
}

// 生成折线图数据
const generateLineChartData = (data, source) => {
  // 按时间排序数据
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.testDate || a.inboundTime || a.createdAt || 0)
    const dateB = new Date(b.testDate || b.inboundTime || b.createdAt || 0)
    return dateA - dateB
  })

  if (sortedData.length < 2) return null

  // 按月份聚合数据
  const monthlyData = {}
  sortedData.forEach(item => {
    const date = new Date(item.testDate || item.inboundTime || item.createdAt)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { count: 0, total: 0 }
    }
    monthlyData[monthKey].count += 1

    if (source === 'production') {
      monthlyData[monthKey].total += parseFloat(item.defectRate) || 0
    }
  })

  const categories = Object.keys(monthlyData).sort()
  const values = categories.map(month => {
    const data = monthlyData[month]
    if (source === 'production') {
      return data.count > 0 ? (data.total / data.count).toFixed(2) : 0
    }
    return data.count
  })

  return {
    chartType: 'line',
    categories: categories,
    series: [{
      name: source === 'production' ? '月度平均不良率' : '月度数量',
      data: values
    }]
  }
}

// 生成雷达图数据
const generateRadarChartData = (data, source) => {
  // 简化的雷达图数据生成
  return {
    chartType: 'radar',
    indicators: [
      { name: '数据量', max: 100 },
      { name: '质量', max: 100 },
      { name: '完整性', max: 100 },
      { name: '及时性', max: 100 },
      { name: '准确性', max: 100 }
    ],
    series: [{
      name: '数据评估',
      data: [85, 90, 88, 92, 87]
    }]
  }
}

// 模拟AI思考过程 - 类似DeepSeek-R1的链式思考
const simulateThinkingProcess = async (question) => {
  // 第一阶段：问题理解和分解
  const analysisSteps = analyzeQuestionStructure(question)

  const steps = [
    {
      title: '🧠 问题理解与分析',
      description: '深度解析用户问题的语义和意图',
      details: [
        { label: '问题类型', value: analysisSteps.questionType },
        { label: '关键词提取', value: analysisSteps.keywords.join(', ') },
        { label: '涉及领域', value: analysisSteps.domain },
        { label: '复杂度评估', value: analysisSteps.complexity }
      ]
    },
    {
      title: '🎯 策略规划',
      description: '制定解决问题的最优策略路径',
      details: [
        { label: '解决策略', value: analysisSteps.strategy },
        { label: '所需工具', value: analysisSteps.requiredTools.join(', ') },
        { label: '数据需求', value: analysisSteps.dataRequirements },
        { label: '预期输出', value: analysisSteps.expectedOutput }
      ]
    },
    {
      title: '🔍 数据查询执行',
      description: '基于策略执行精确的数据检索',
      details: [
        { label: '查询范围', value: '库存+生产+检测数据' },
        { label: '时间窗口', value: '动态调整' },
        { label: '过滤条件', value: '智能筛选' },
        { label: '数据质量', value: '实时验证' }
      ]
    },
    {
      title: '⚙️ 智能分析处理',
      description: '运用AI算法进行多维度深度分析',
      details: [
        { label: '分析算法', value: '机器学习+统计分析' },
        { label: '处理维度', value: '时间+空间+业务' },
        { label: '模式识别', value: '异常检测+趋势预测' },
        { label: '关联分析', value: '因果关系挖掘' }
      ]
    },
    {
      title: '📊 结果综合与呈现',
      description: '整合分析结果，生成最优呈现方案',
      details: [
        { label: '结果整合', value: '多源数据融合' },
        { label: '可视化策略', value: analysisSteps.visualizationStrategy },
        { label: '报告结构', value: '层次化呈现' },
        { label: '交互设计', value: '用户友好界面' }
      ]
    }
  ]

  for (let i = 0; i < steps.length; i++) {
    // 添加新步骤
    thinkingSteps.value.push({
      ...steps[i],
      status: 'active'
    })

    // 模拟工具使用
    if (i === 1) {
      currentTool.value = dataAnalysisTools.value[0]
      for (let progress = 0; progress <= 100; progress += 20) {
        toolProgress.value = progress
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    // 模拟数据查询
    if (i === 2) {
      const queries = [
        { sql: 'SELECT * FROM inventory WHERE factory = "工厂A"', count: 45 },
        { sql: 'SELECT * FROM production WHERE date >= "2024-01-01"', count: 128 },
        { sql: 'SELECT * FROM inspection WHERE status = "异常"', count: 12 }
      ]

      for (const query of queries) {
        queryProcess.value.push(query)
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    }

    await new Promise(resolve => setTimeout(resolve, 800))

    // 标记当前步骤完成
    if (thinkingSteps.value[i]) {
      thinkingSteps.value[i].status = 'completed'
    }
  }

  // 清空当前工具
  currentTool.value = null
  toolProgress.value = 0
}

// 分析问题结构 - 智能问题理解
const analyzeQuestionStructure = (question) => {
  const questionLower = question.toLowerCase()

  // 问题类型识别
  let questionType = '一般查询'
  if (questionLower.includes('趋势') || questionLower.includes('变化')) {
    questionType = '趋势分析'
  } else if (questionLower.includes('对比') || questionLower.includes('比较')) {
    questionType = '对比分析'
  } else if (questionLower.includes('分布') || questionLower.includes('统计')) {
    questionType = '分布统计'
  } else if (questionLower.includes('预测') || questionLower.includes('预估')) {
    questionType = '预测分析'
  } else if (questionLower.includes('异常') || questionLower.includes('问题')) {
    questionType = '异常诊断'
  }

  // 关键词提取
  const keywords = []
  const keywordPatterns = [
    '库存', '生产', '检测', '质量', '供应商', '工厂', '批次', '物料',
    '趋势', '分析', '对比', '统计', '图表', '报告', '异常', '风险'
  ]

  keywordPatterns.forEach(keyword => {
    if (questionLower.includes(keyword)) {
      keywords.push(keyword)
    }
  })

  // 领域识别
  let domain = '质量管理'
  if (keywords.includes('库存')) domain = '库存管理'
  else if (keywords.includes('生产')) domain = '生产管理'
  else if (keywords.includes('检测')) domain = '质量检测'

  // 复杂度评估
  let complexity = '简单'
  if (keywords.length > 3) complexity = '中等'
  if (keywords.length > 5 || questionLower.includes('综合') || questionLower.includes('全面')) {
    complexity = '复杂'
  }

  // 策略选择
  let strategy = '直接查询'
  if (questionType === '趋势分析') strategy = '时序分析'
  else if (questionType === '对比分析') strategy = '多维对比'
  else if (questionType === '预测分析') strategy = '预测建模'
  else if (questionType === '异常诊断') strategy = '异常检测'

  // 所需工具
  const requiredTools = []
  if (questionLower.includes('图表') || questionType.includes('分析')) {
    requiredTools.push('图表生成器')
  }
  if (questionLower.includes('统计')) {
    requiredTools.push('统计分析器')
  }
  if (questionLower.includes('预测')) {
    requiredTools.push('预测模型')
  }
  if (requiredTools.length === 0) {
    requiredTools.push('数据查询器')
  }

  // 数据需求
  let dataRequirements = '基础数据'
  if (complexity === '复杂') dataRequirements = '多源数据融合'
  else if (questionType.includes('分析')) dataRequirements = '历史数据+实时数据'

  // 预期输出
  let expectedOutput = '文本回答'
  if (questionLower.includes('图表')) expectedOutput = '图表+文本'
  else if (questionLower.includes('报告')) expectedOutput = '结构化报告'
  else if (questionType.includes('分析')) expectedOutput = '分析报告+可视化'

  // 可视化策略
  let visualizationStrategy = '无'
  if (questionType === '趋势分析') visualizationStrategy = '时间序列图'
  else if (questionType === '对比分析') visualizationStrategy = '对比图表'
  else if (questionType === '分布统计') visualizationStrategy = '分布图'
  else if (questionLower.includes('图表')) visualizationStrategy = '智能图表选择'

  return {
    questionType,
    keywords,
    domain,
    complexity,
    strategy,
    requiredTools,
    dataRequirements,
    expectedOutput,
    visualizationStrategy
  }
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
}

// 渲染图表
const renderChart = async (message) => {
  if (!message.chartData) return

  await nextTick()

  const chartId = `chart-${message.timestamp.getTime()}`
  const container = document.getElementById(chartId)

  if (!container) {
    console.warn('图表容器未找到:', chartId)
    return
  }

  try {
    // 使用ChartIntegrationService渲染图表
    const chartConfig = convertToEChartsConfig(message.chartData)

    // 这里可以集成ECharts或其他图表库
    console.log('📊 渲染图表:', chartConfig)

    // 模拟图表渲染
    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f8f9fa; border-radius: 8px;">
        <div style="text-align: center; color: #666;">
          <div style="font-size: 48px; margin-bottom: 12px;">📊</div>
          <div style="font-size: 16px; font-weight: 600;">${message.chartData.title}</div>
          <div style="font-size: 14px; margin-top: 8px;">${message.chartData.description}</div>
          <div style="font-size: 12px; margin-top: 8px; color: #999;">
            类型: ${message.chartData.type} | 数据: ${message.chartData.recordCount}条
          </div>
        </div>
      </div>
    `

  } catch (error) {
    console.error('图表渲染失败:', error)
    container.innerHTML = `
      <div style="text-align: center; color: #999; padding: 40px;">
        图表渲染失败: ${error.message}
      </div>
    `
  }
}

// 转换为ECharts配置
const convertToEChartsConfig = (chartData) => {
  const { type, data } = chartData

  switch (type) {
    case 'pie':
      return {
        title: { text: chartData.title },
        tooltip: { trigger: 'item' },
        series: [{
          type: 'pie',
          data: data.series[0].data,
          radius: '60%'
        }]
      }

    case 'bar':
      return {
        title: { text: chartData.title },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: data.categories },
        yAxis: { type: 'value' },
        series: [{
          type: 'bar',
          data: data.series[0].data
        }]
      }

    case 'line':
      return {
        title: { text: chartData.title },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: data.categories },
        yAxis: { type: 'value' },
        series: [{
          type: 'line',
          data: data.series[0].data,
          smooth: true
        }]
      }

    default:
      return { title: { text: chartData.title } }
  }
}

// 监听消息变化，自动渲染图表
const watchMessages = () => {
  messages.value.forEach(message => {
    if (message.chartData && !message.isStreaming) {
      setTimeout(() => renderChart(message), 100)
    }
  })
}

// 场景管理相关方法
const loadScenarios = () => {
  availableScenarios.value = aiScenarioManager.getAllScenarios()
  currentAIScenario.value = aiScenarioManager.getCurrentScenario()
  selectedScenarioId.value = currentAIScenario.value.id
}

const switchScenario = (scenarioId) => {
  if (aiScenarioManager.setCurrentScenario(scenarioId)) {
    currentAIScenario.value = aiScenarioManager.getCurrentScenario()
    aiScenarioManager.saveToStorage()
    console.log('🎭 已切换到场景:', currentAIScenario.value.name)

    // 清空对话历史，显示新场景的欢迎信息
    messages.value = []
  }
}

const openScenarioManagement = () => {
  // 打开场景管理页面
  window.open('/#/ai-scenario-management', '_blank')
}

onMounted(async () => {
  console.log('🤖 AI智能助手开始加载...')

  // 首先加载所有服务
  await loadServices()

  // 加载AI场景配置
  if (aiScenarioManager) {
    aiScenarioManager.loadFromStorage()
    loadScenarios()
  }

  // 监听消息变化
  setInterval(watchMessages, 1000)

  console.log('✅ AI智能助手加载完成')
})
</script>

<style scoped>
/* 全局样式 - 响应式优化 */
.iqe-ai-assistant {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
  position: relative;
}

/* 响应式断点 */
@media (max-width: 1200px) {
  .iqe-ai-assistant {
    height: auto;
    min-height: 100vh;
  }
}

@media (max-width: 768px) {
  .iqe-ai-assistant {
    padding: 0;
  }
}

/* 顶部标题栏 */
.header-bar {
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  font-size: 20px;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.ai-status-text {
  font-size: 14px;
  color: #666;
}

.header-button {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  color: #333;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.header-button:hover {
  border-color: #409eff;
  color: #409eff;
}

/* 开关样式 */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
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
  background-color: #ccc;
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
  background-color: #409eff;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

/* 主体内容 - 响应式优化 */
.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
  height: calc(100vh - 60px);
  position: relative;
  transition: all 0.3s ease;
}

/* 平板适配 */
@media (max-width: 1024px) {
  .main-container {
    height: calc(100vh - 50px);
  }
}

/* 左侧面板 - 15% */
.left-sidebar {
  width: 15%;
  min-width: 200px;
  max-width: 280px;
  background: #ffffff;
  border-right: 1px solid #e8e8e8;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

/* 工具面板样式 */
.tool-section {
  padding: 16px 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
}

.section-icon {
  font-size: 16px;
}

.section-title {
  font-size: 14px;
}

.tool-category {
  margin-bottom: 16px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  background: #f8f9fa;
}

.category-icon {
  font-size: 14px;
}

.category-title {
  font-size: 13px;
}

.tool-list {
  display: flex;
  flex-direction: column;
}

.tool-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.tool-item:hover {
  background: #f0f7ff;
  border-left-color: #409eff;
}

.tool-item.active {
  background: #e6f7ff;
  border-left-color: #409eff;
}

.tool-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.tool-content {
  flex: 1;
}

.tool-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.tool-desc {
  font-size: 12px;
  color: #999;
  line-height: 1.3;
}

/* 中间问答区域 - 55% */
.center-chat-area {
  width: 55%;
  min-width: 400px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid #e8e8e8;
  flex-shrink: 0;
}

/* 右侧AI思考面板 - 35% */
.right-thinking-panel {
  width: 35%;
  min-width: 300px;
  max-width: 500px;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
}

/* 对话头部 */
.chat-header {
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

.chat-tabs {
  display: flex;
  align-items: center;
}

.tab-item {
  padding: 12px 16px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.tab-item.active {
  color: #409eff;
  border-bottom-color: #409eff;
}

.tab-item:hover {
  color: #409eff;
}

.chat-actions {
  padding: 8px 16px;
}

.action-btn {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  color: #333;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.action-btn:hover {
  border-color: #409eff;
  color: #409eff;
}

/* 对话内容 */
.chat-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.welcome-message {
  text-align: center;
  padding: 40px 20px;
}

.welcome-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.welcome-message h3 {
  color: #333;
  margin-bottom: 20px;
  font-size: 18px;
}

.current-scenario-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 24px 0;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.scenario-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.scenario-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #e8f4fd;
  border: 1px solid #409eff;
  border-radius: 16px;
  color: #409eff;
  font-weight: 500;
}

.scenario-icon {
  font-size: 16px;
}

.scenario-name {
  font-size: 14px;
}

.welcome-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin: 20px 0;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.feature-icon {
  font-size: 20px;
}

.feature-text {
  font-size: 14px;
  color: #666;
}

.welcome-tip {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #999;
}

.assistant-intro {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  margin: 20px 0;
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.assistant-intro:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4);
}

.intro-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.ai-avatar {
  position: relative;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.avatar-icon {
  font-size: 24px;
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #52c41a;
  border: 2px solid white;
  transition: all 0.3s ease;
}

.status-indicator.active {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}

.intro-content {
  flex: 1;
  text-align: left;
}

.intro-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: white;
}

.intro-text {
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  opacity: 0.9;
}

.ai-status-bar {
  display: flex;
  gap: 24px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-label {
  font-size: 12px;
  opacity: 0.8;
  font-weight: 500;
}

.status-value {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.2);
}

.status-value.ready {
  background: rgba(82, 196, 26, 0.3);
  color: #b7eb8f;
}

.status-value.processing {
  background: rgba(250, 173, 20, 0.3);
  color: #ffd666;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.5; }
}

.sad-face {
  font-size: 24px;
}

.tip-text {
  font-size: 14px;
}

/* 消息样式 */
.message-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.message-content {
  flex: 1;
}

.message-text {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 4px;
}

.message-item.user .message-text {
  background: #e6f7ff;
}

.message-time {
  font-size: 12px;
  color: #999;
}

/* 流式回复样式 */
.message-text.streaming {
  position: relative;
}

.message-text.streaming::after {
  content: '▋';
  animation: blink 1s infinite;
  color: #409eff;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.streaming-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
  font-size: 12px;
  color: #666;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #409eff, #67c23a);
  transition: width 0.3s ease;
}

.progress-text {
  min-width: 35px;
  text-align: right;
}

/* 图表样式优化 */
.message-chart {
  margin: 16px 0;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.chart-header {
  margin-bottom: 16px;
  text-align: center;
}

.chart-header h4 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.chart-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.chart-container {
  width: 100%;
  height: 350px;
  min-height: 350px;
}

.chart-info {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  font-size: 12px;
  color: #999;
}

/* 优化的消息样式 */
.message-text {
  line-height: 1.6;
  font-size: 14px;
}

/* Markdown样式优化 */
.message-text h1,
.message-text h2,
.message-text h3 {
  color: #333;
  margin: 20px 0 12px 0;
  font-weight: 600;
}

.message-text h1 {
  font-size: 20px;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
  color: #409eff;
}

.message-text h2 {
  font-size: 18px;
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 6px;
  color: #333;
  position: relative;
}

.message-text h2::before {
  content: "📊";
  margin-right: 8px;
}

.message-text h3 {
  font-size: 16px;
  color: #555;
  position: relative;
}

.message-text h3::before {
  content: "▶";
  color: #409eff;
  margin-right: 6px;
}

.message-text strong {
  color: #409eff;
  font-weight: 600;
  background: rgba(64, 158, 255, 0.1);
  padding: 2px 4px;
  border-radius: 3px;
}

.message-text ul,
.message-text ol {
  margin: 12px 0;
  padding-left: 24px;
}

.message-text li {
  margin: 8px 0;
  line-height: 1.6;
  position: relative;
}

.message-text ul li::marker {
  content: "🔹";
}

.message-text ol li {
  padding-left: 8px;
}

/* 专业建议样式 */
.message-text li:contains("建议") {
  background: #f8f9fa;
  padding: 8px 12px;
  border-left: 3px solid #52c41a;
  border-radius: 4px;
  margin: 12px 0;
}

/* 重要信息高亮 */
.message-text p:contains("重要") {
  background: #fff7e6;
  border: 1px solid #ffd591;
  padding: 12px;
  border-radius: 6px;
  margin: 12px 0;
}

.message-text code {
  background: #f5f5f5;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.message-text pre {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
  overflow-x: auto;
  margin: 12px 0;
}

.message-text pre code {
  background: none;
  padding: 0;
}

.message-text table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
}

.message-text th,
.message-text td {
  border: 1px solid #e8e8e8;
  padding: 8px 12px;
  text-align: left;
}

.message-text th {
  background: #f8f9fa;
  font-weight: 600;
}

.loading-message {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.loading-dots {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 输入区域 - 优化版 */
.chat-input {
  border-top: 1px solid #e8e8e8;
  padding: 20px;
  background: #ffffff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

/* 快捷建议 */
.quick-suggestions {
  margin-bottom: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.suggestion-title {
  font-size: 14px;
  font-weight: 600;
  color: #666;
  margin-bottom: 12px;
}

.suggestion-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-item {
  padding: 8px 12px;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.suggestion-item:hover {
  border-color: #409eff;
  color: #409eff;
  background: #f0f7ff;
  transform: translateY(-1px);
}

/* AI状态指示器 */
.ai-status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #f0f7ff;
  border-radius: 8px;
  font-size: 12px;
  color: #409eff;
  transition: all 0.3s ease;
}

.ai-status-indicator.processing {
  background: #fff7e6;
  color: #fa8c16;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #52c41a;
  animation: pulse 2s infinite;
}

.ai-status-indicator.processing .status-dot {
  background: #fa8c16;
  animation: blink 1s infinite;
}

.status-text {
  font-weight: 500;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 16px;
  padding: 12px;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: #409eff;
  background: white;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

.message-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 8px 0;
  font-size: 14px;
  resize: none;
  outline: none;
  font-family: inherit;
  line-height: 1.6;
  min-height: 24px;
  max-height: 120px;
  color: #333;
  transition: all 0.3s ease;
}

.message-input::placeholder {
  color: #999;
  font-style: italic;
}

.message-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 输入操作按钮 */
.input-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-button {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #f0f0f0;
  color: #666;
}

.action-button:hover {
  background: #409eff;
  color: white;
  transform: scale(1.1);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.voice-button:hover {
  background: #52c41a;
}

.send-button {
  background: #409eff;
  color: white;
}

.send-button:hover {
  background: #66b1ff;
}

.send-button:disabled {
  background: #c0c4cc;
}

/* 思考面板样式 */
.thinking-header {
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.thinking-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.thinking-icon {
  font-size: 16px;
}

.thinking-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ccc;
  transition: all 0.3s;
}

.status-dot.active {
  background: #52c41a;
  animation: pulse 1.5s infinite;
}

.thinking-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.thinking-empty {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 12px;
  line-height: 1.4;
}

.thinking-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.thinking-step {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 12px;
  transition: all 0.3s;
}

.thinking-step.active {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.thinking-step.completed {
  border-color: #52c41a;
  background: #f6ffed;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.step-number {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #666;
}

.thinking-step.active .step-number {
  background: #409eff;
  color: white;
}

.thinking-step.completed .step-number {
  background: #52c41a;
  color: white;
}

.step-title {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.step-status {
  font-size: 14px;
}

.status-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.step-content {
  margin-left: 28px;
}

.step-description {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.step-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
}

.detail-label {
  color: #999;
}

.detail-value {
  color: #333;
  font-weight: 500;
}

.current-tool {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
}

.tool-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.tool-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #409eff;
  transition: width 0.3s;
}

.progress-text {
  font-size: 11px;
  color: #666;
  min-width: 30px;
}

.query-process {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
}

.process-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.query-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.query-item {
  background: #f8f9fa;
  border-radius: 4px;
  padding: 8px;
}

.query-sql {
  font-family: 'Courier New', monospace;
  font-size: 11px;
  color: #333;
  margin-bottom: 4px;
  word-break: break-all;
}

.query-result {
  font-size: 11px;
  color: #52c41a;
  font-weight: 500;
}

/* 响应式设计 - 保持15%:55%:35%比例 */
@media (max-width: 1400px) {
  .left-sidebar {
    width: 15%;
    min-width: 180px;
    max-width: 250px;
  }

  .center-chat-area {
    width: 55%;
    min-width: 350px;
  }

  .right-thinking-panel {
    width: 35%;
    min-width: 280px;
    max-width: 450px;
  }
}

@media (max-width: 1200px) {
  .left-sidebar {
    width: 15%;
    min-width: 160px;
    max-width: 220px;
  }

  .center-chat-area {
    width: 55%;
    min-width: 300px;
  }

  .right-thinking-panel {
    width: 35%;
    min-width: 250px;
    max-width: 400px;
  }
}

@media (max-width: 1000px) {
  .left-sidebar {
    width: 15%;
    min-width: 140px;
    max-width: 200px;
  }

  .center-chat-area {
    width: 55%;
    min-width: 280px;
  }

  .right-thinking-panel {
    width: 35%;
    min-width: 220px;
    max-width: 350px;
  }
}

@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
  }

  .left-sidebar {
    width: 100%;
    height: 200px;
  }

  .right-thinking-panel {
    width: 100%;
    height: 300px;
  }

  .welcome-features {
    grid-template-columns: 1fr;
  }
}
</style>
