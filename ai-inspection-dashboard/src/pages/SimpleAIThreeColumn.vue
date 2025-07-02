<template>
  <div class="simple-ai-three-column">
    <!-- 顶部标题栏 -->
    <div class="header-bar">
      <div class="header-left">
        <div class="logo-section">
          <span class="logo-icon">🤖</span>
          <span class="logo-text">IQE AI 智能助手 - 简化版三栏布局</span>
        </div>
      </div>
      <div class="header-right">
        <button @click="clearMessages" class="header-button">清空对话</button>
      </div>
    </div>

    <!-- 三栏主体布局 -->
    <div class="three-column-layout">
      <!-- 左侧工具面板 -->
      <div class="left-panel">
        <div class="panel-header">
          <span class="panel-icon">🛠️</span>
          <h3 class="panel-title">智能问答规则</h3>
        </div>

        <!-- 基础规则问答 -->
        <div class="rule-section">
          <div class="section-header" @click="toggleSection('basic')">
            <span class="section-icon">📋</span>
            <span class="section-title">基础规则问答</span>
            <span class="expand-icon" :class="{ expanded: expandedSections.basic }">▼</span>
          </div>
          <div v-show="expandedSections.basic" class="section-content">
            <!-- 库存查询规则 -->
            <div class="rule-category">
              <h4>📦 库存查询 ({{ basicRules.inventory.length }})</h4>
              <div class="rule-container">
                <div class="rule-buttons-scrollable" ref="inventoryRulesContainer">
                  <button
                    v-for="rule in basicRules.inventory"
                    :key="rule.query"
                    @click="sendQuery(rule.query)"
                    class="rule-btn"
                    :title="rule.query"
                  >
                    {{ rule.name }}
                  </button>
                </div>
                <div class="rule-pagination">
                  <button @click="scrollRules('inventory', 'left')" class="scroll-btn">◀</button>
                  <span class="rule-count">{{ getVisibleRuleCount('inventory') }}</span>
                  <button @click="scrollRules('inventory', 'right')" class="scroll-btn">▶</button>
                </div>
              </div>
            </div>

            <!-- 质量分析规则 -->
            <div class="rule-category">
              <h4>🧪 质量分析 ({{ basicRules.quality.length }})</h4>
              <div class="rule-container">
                <div class="rule-buttons-scrollable" ref="qualityRulesContainer">
                  <button
                    v-for="rule in basicRules.quality"
                    :key="rule.query"
                    @click="sendQuery(rule.query)"
                    class="rule-btn"
                    :title="rule.query"
                  >
                    {{ rule.name }}
                  </button>
                </div>
                <div class="rule-pagination">
                  <button @click="scrollRules('quality', 'left')" class="scroll-btn">◀</button>
                  <span class="rule-count">{{ getVisibleRuleCount('quality') }}</span>
                  <button @click="scrollRules('quality', 'right')" class="scroll-btn">▶</button>
                </div>
              </div>
            </div>

            <!-- 生产跟踪规则 -->
            <div class="rule-category">
              <h4>🏭 生产跟踪 ({{ basicRules.production.length }})</h4>
              <div class="rule-container">
                <div class="rule-buttons-scrollable" ref="productionRulesContainer">
                  <button
                    v-for="rule in basicRules.production"
                    :key="rule.query"
                    @click="sendQuery(rule.query)"
                    class="rule-btn"
                    :title="rule.query"
                  >
                    {{ rule.name }}
                  </button>
                </div>
                <div class="rule-pagination">
                  <button @click="scrollRules('production', 'left')" class="scroll-btn">◀</button>
                  <span class="rule-count">{{ getVisibleRuleCount('production') }}</span>
                  <button @click="scrollRules('production', 'right')" class="scroll-btn">▶</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- AI增强分析 -->
        <div class="rule-section">
          <div class="section-header" @click="toggleSection('ai')">
            <span class="section-icon">🤖</span>
            <span class="section-title">AI增强分析</span>
            <span class="expand-icon" :class="{ expanded: expandedSections.ai }">▼</span>
          </div>
          <div v-show="expandedSections.ai" class="section-content">
            <div class="rule-category">
              <h4>🔍 智能分析</h4>
              <div class="rule-buttons">
                <button
                  v-for="rule in aiRules.analysis"
                  :key="rule.query"
                  @click="sendQuery(rule.query)"
                  class="rule-btn ai-rule"
                >
                  {{ rule.name }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 图表工具 -->
        <div class="rule-section">
          <div class="section-header" @click="toggleSection('chart')">
            <span class="section-icon">📊</span>
            <span class="section-title">图表工具</span>
            <span class="expand-icon" :class="{ expanded: expandedSections.chart }">▼</span>
          </div>
          <div v-show="expandedSections.chart" class="section-content">
            <!-- 集成图表工具面板 -->
            <ChartToolPanel @chart-generated="handleChartGenerated" />
          </div>
        </div>

        <!-- 对话管理 -->
        <div class="rule-section">
          <div class="section-header" @click="toggleSection('conversation')">
            <span class="section-icon">💬</span>
            <span class="section-title">对话管理</span>
            <span class="expand-icon" :class="{ expanded: expandedSections.conversation }">▼</span>
          </div>
          <div v-show="expandedSections.conversation" class="section-content">
            <!-- 当前会话信息 -->
            <div class="current-session" v-if="currentSessionId">
              <div class="session-info">
                <span class="session-icon">🟢</span>
                <span class="session-text">当前会话</span>
                <span class="message-count">{{ messages.length }}条</span>
              </div>
            </div>

            <!-- 会话操作按钮 -->
            <div class="session-actions">
              <button @click="createNewSession" class="action-btn new-session">
                <span class="btn-icon">➕</span>
                新建对话
              </button>
              <button @click="saveCurrentSession" class="action-btn save-session" :disabled="messages.length === 0">
                <span class="btn-icon">💾</span>
                保存对话
              </button>
            </div>

            <!-- 历史会话列表 -->
            <div class="history-sessions" v-if="savedSessions.length > 0">
              <h4>📚 历史对话 ({{ savedSessions.length }})</h4>
              <div class="session-list">
                <div
                  v-for="session in savedSessions.slice(0, 5)"
                  :key="session.id"
                  class="session-item"
                  :class="{ active: session.id === currentSessionId }"
                  @click="loadSession(session.id)"
                >
                  <div class="session-header">
                    <span class="session-title">{{ session.title }}</span>
                    <button
                      @click.stop="deleteSession(session.id)"
                      class="delete-btn"
                      title="删除会话"
                    >
                      ❌
                    </button>
                  </div>
                  <div class="session-meta">
                    <span class="session-time">{{ formatSessionTime(session.timestamp) }}</span>
                    <span class="session-count">{{ session.messageCount }}条消息</span>
                  </div>
                </div>
              </div>

              <!-- 查看更多按钮 -->
              <div v-if="savedSessions.length > 5" class="view-more">
                <button @click="showAllSessions = !showAllSessions" class="view-more-btn">
                  {{ showAllSessions ? '收起' : `查看全部 ${savedSessions.length} 个会话` }}
                </button>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-else class="empty-sessions">
              <div class="empty-icon">📝</div>
              <div class="empty-text">暂无历史对话</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间对话面板 -->
      <div class="center-panel">
        <div class="panel-header">
          <span class="panel-icon">💬</span>
          <h3 class="panel-title">AI对话</h3>
        </div>

        <div class="chat-container">
          <!-- 消息列表 -->
          <div class="messages-container" ref="messagesContainer">
            <!-- 空状态 -->
            <div v-if="messages.length === 0" class="empty-messages">
              <div class="empty-icon">💬</div>
              <div class="empty-text">开始您的智能问答之旅</div>
              <div class="empty-hint">点击左侧规则按钮或直接输入问题</div>
            </div>

            <!-- 消息列表 -->
            <div v-for="(message, index) in messages" :key="index" class="message-item" :class="message.type">
              <!-- 用户消息 -->
              <div v-if="message.type === 'user'" class="user-message-wrapper">
                <div class="user-avatar">👤</div>
                <div class="user-content">
                  <div class="user-text">{{ message.content }}</div>
                  <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                </div>
              </div>

              <!-- AI助手消息 -->
              <div v-else class="assistant-message-wrapper">
                <div class="assistant-avatar">🤖</div>
                <div class="assistant-content">
                  <div class="assistant-header">
                    <span class="assistant-name">AI智能助手</span>
                    <span class="message-source" v-if="message.source">{{ getSourceLabel(message.source) }}</span>
                  </div>
                  <div class="assistant-text" v-html="formatAssistantMessage(message.content)"></div>

                  <!-- 工作流信息 -->
                  <div v-if="message.workflow" class="workflow-info">
                    <div class="workflow-summary">
                      <span class="workflow-icon">⚡</span>
                      <span class="workflow-text">{{ getWorkflowSummary(message.workflow) }}</span>
                    </div>
                  </div>

                  <!-- 图表信息 -->
                  <div v-if="message.chartData" class="chart-info">
                    <div class="chart-summary">
                      <span class="chart-icon">📊</span>
                      <span class="chart-text">已生成{{ message.chartData.name }}，请查看左侧预览</span>
                    </div>
                  </div>

                  <!-- 数据统计 -->
                  <div v-if="message.data" class="data-stats">
                    <div class="stats-item">
                      <span class="stats-icon">📋</span>
                      <span class="stats-text">数据量: {{ getDataCount(message.data) }}</span>
                    </div>
                  </div>

                  <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="input-area">
            <div class="input-container">
              <input
                v-model="inputMessage"
                @keyup.enter="sendMessage"
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
          </div>
        </div>
      </div>

      <!-- 右侧分析过程面板 -->
      <div class="right-panel">
        <div class="panel-header">
          <span class="panel-icon">🧠</span>
          <h3 class="panel-title">智能分析</h3>
          <div class="analysis-status" v-if="currentAnalysis">
            <span class="status-dot" :class="currentAnalysis.status"></span>
            <span class="status-text">{{ getAnalysisStatusText() }}</span>
          </div>
        </div>

        <!-- 当前分析展示 -->
        <div class="analysis-content" v-if="currentAnalysis">
          <!-- 分析概览 -->
          <div class="analysis-overview">
            <div class="analysis-title">{{ currentAnalysis.question }}</div>
            <div class="analysis-meta">
              <span class="analysis-time">{{ formatAnalysisTime(currentAnalysis.startTime) }}</span>
              <span class="analysis-type">{{ currentAnalysis.type }}</span>
            </div>
          </div>

          <!-- 工作流步骤 -->
          <div class="workflow-steps">
            <div
              v-for="(step, index) in currentAnalysis.steps"
              :key="index"
              class="workflow-step"
              :class="{
                'active': step.status === 'processing',
                'completed': step.status === 'completed',
                'error': step.status === 'error'
              }"
            >
              <div class="step-header">
                <div class="step-number">{{ index + 1 }}</div>
                <div class="step-info">
                  <div class="step-title">{{ step.title }}</div>
                  <div class="step-description">{{ step.description }}</div>
                </div>
                <div class="step-status">
                  <span v-if="step.status === 'processing'" class="loading-spinner">⏳</span>
                  <span v-else-if="step.status === 'completed'" class="success-icon">✅</span>
                  <span v-else-if="step.status === 'error'" class="error-icon">❌</span>
                  <span v-else class="pending-icon">⏸️</span>
                </div>
              </div>

              <!-- 步骤详情 -->
              <div v-if="step.details && step.status === 'completed'" class="step-details">
                <div v-if="step.data" class="step-data">
                  <strong>数据:</strong> {{ formatStepData(step.data) }}
                </div>
                <div v-if="step.result" class="step-result">
                  <strong>结果:</strong> {{ step.result }}
                </div>
                <div v-if="step.duration" class="step-duration">
                  <strong>耗时:</strong> {{ step.duration }}ms
                </div>
              </div>
            </div>
          </div>

          <!-- 分析结果摘要 -->
          <div v-if="currentAnalysis.summary" class="analysis-summary">
            <h4>📊 分析摘要</h4>
            <div class="summary-content">
              <div v-if="currentAnalysis.summary.dataPoints" class="summary-item">
                <strong>数据点:</strong> {{ currentAnalysis.summary.dataPoints }}
              </div>
              <div v-if="currentAnalysis.summary.insights" class="summary-item">
                <strong>关键洞察:</strong> {{ currentAnalysis.summary.insights }}
              </div>
              <div v-if="currentAnalysis.summary.recommendations" class="summary-item">
                <strong>建议:</strong> {{ currentAnalysis.summary.recommendations }}
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-analysis">
          <div class="empty-icon">🤔</div>
          <div class="empty-text">等待分析任务...</div>
          <div class="empty-hint">点击左侧规则或输入问题开始分析</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, onBeforeUnmount } from 'vue'
import AnalysisProcessPanel from '../components/AnalysisProcessPanel.vue'
import ChartToolPanel from '../components/ChartToolPanel.vue'

// 响应式数据
const messages = ref([])
const inputMessage = ref('')
const currentSessionId = ref(null)
const isLoading = ref(false)
const currentWorkflow = ref(null)
const multiStepServiceUrl = 'http://localhost:3005'

// 当前分析状态
const currentAnalysis = ref(null)

// 对话历史管理
const conversationHistory = ref([])
const savedSessions = ref([])

// 左侧面板状态
const expandedSections = ref({
  basic: true,  // 基础规则默认展开
  ai: false,
  chart: false,
  conversation: false
})

// 对话管理状态
const showAllSessions = ref(false)

// 基础规则配置 - 基于实际数据库结构扩展
const basicRules = ref({
  inventory: [
    { name: '深圳工厂库存', query: '查询深圳工厂的所有库存物料' },
    { name: '美光科技物料', query: '查询供应商美光科技的库存情况' },
    { name: '富士康物料', query: '查询供应商富士康的库存情况' },
    { name: '立讯精密物料', query: '查询供应商立讯精密的库存情况' },
    { name: '电子元件库存', query: '查询电子元件类型的所有物料' },
    { name: '显示屏库存', query: '查询所有显示屏相关物料' },
    { name: '处理器库存', query: '查询处理器相关物料' },
    { name: '摄像头模组', query: '查询摄像头模组库存情况' },
    { name: '连接器库存', query: '查询连接器类物料库存' },
    { name: '正常状态物料', query: '查询状态为正常的所有物料' }
  ],
  quality: [
    { name: '库存质量分析', query: '分析库存物料的质量状态' },
    { name: '供应商质量评估', query: '评估各供应商的质量表现' },
    { name: '物料风险分析', query: '分析物料的风险等级分布' },
    { name: '美光科技质量', query: '分析美光科技供应商的质量情况' },
    { name: '富士康质量', query: '分析富士康供应商的质量情况' },
    { name: '电子元件质量', query: '分析电子元件的质量状况' },
    { name: '显示屏质量', query: '分析显示屏产品的质量情况' },
    { name: '处理器质量', query: '分析处理器产品的质量状况' },
    { name: '深圳工厂质量', query: '分析深圳工厂的整体质量情况' },
    { name: '质量改进建议', query: '基于当前数据提供质量改进建议' }
  ],
  production: [
    { name: '生产状态', query: '查询当前生产状态' },
    { name: '不良率分析', query: '分析生产不良率情况' },
    { name: '产线效率', query: '查询各产线效率' },
    { name: '在线跟踪', query: '查询在线跟踪记录' },
    { name: '工序统计', query: '统计各工序的处理情况' },
    { name: '异常记录', query: '查询生产异常记录' },
    { name: '设备状态', query: '查询设备运行状态' },
    { name: '班次统计', query: '统计各班次的生产情况' },
    { name: '效率对比', query: '对比各产线效率' },
    { name: '质量控制点', query: '查询质量控制点状态' }
  ]
})

// AI增强规则配置
const aiRules = ref({
  analysis: [
    { name: '智能质量分析', query: '请对当前质量状况进行深度分析并提供改进建议' },
    { name: '供应商风险评估', query: '分析各供应商的风险等级和质量表现' },
    { name: '预测性维护', query: '基于历史数据预测可能的质量问题' },
    { name: '库存优化建议', query: '基于历史数据分析库存配置优化方案' },
    { name: '质量趋势预测', query: '预测未来一个月的质量趋势变化' },
    { name: '异常模式识别', query: '识别生产过程中的异常模式和规律' },
    { name: '成本效益分析', query: '分析质量改进措施的成本效益' },
    { name: '供应链风险评估', query: '评估供应链中的潜在风险点' },
    { name: '工艺优化建议', query: '基于质量数据提供工艺优化建议' },
    { name: '设备维护预测', query: '预测设备维护需求和最佳时机' }
  ]
})

// 图表工具配置
const chartRules = ref({
  visualization: [
    { name: 'TOP不良物料', query: '生成TOP不良物料排行榜' },
    { name: '风险等级分布', query: '显示风险等级分布图' },
    { name: '供应商质量对比', query: '生成供应商质量对比雷达图' },
    { name: '库存趋势图', query: '生成库存变化趋势图表' },
    { name: '合格率统计图', query: '生成月度合格率统计图' },
    { name: '测试项目分布', query: '显示测试项目执行分布饼图' },
    { name: '不良类型帕累托图', query: '生成不良类型帕累托分析图' },
    { name: '供应商评分雷达图', query: '生成供应商综合评分雷达图' },
    { name: '质量控制图', query: '生成质量控制过程图表' },
    { name: '效率对比柱状图', query: '生成各产线效率对比柱状图' },
    { name: '异常趋势热力图', query: '生成异常发生趋势热力图' },
    { name: '成本分析图表', query: '生成质量成本分析图表' }
  ]
})

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) {
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

  // 创建分析任务
  const analysisType = userQuestion.includes('AI') || userQuestion.includes('智能') || userQuestion.includes('分析') ? 'ai-enhanced' : 'basic'
  createAnalysisTask(userQuestion, analysisType)

  inputMessage.value = ''
  isLoading.value = true

  try {
    console.log('🔄 启动多步骤AI分析...')

    // 模拟分析步骤进度
    simulateAnalysisProgress()

    // 首先尝试基础规则匹配
    const basicResponse = await tryBasicRules(userQuestion)
    if (basicResponse) {
      console.log('✅ 基础规则匹配成功')
      messages.value.push({
        type: 'assistant',
        content: basicResponse,
        timestamp: new Date(),
        source: 'basic-rules'
      })
      return
    }

    // 调用优化版多步骤AI服务
    const response = await fetch(`${multiStepServiceUrl}/api/multi-step-query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: userQuestion
      })
    })

    if (!response.ok) {
      throw new Error(`多步骤AI服务请求失败: ${response.status}`)
    }

    const result = await response.json()
    console.log('✅ 多步骤AI分析完成:', result)

    // 更新工作流状态
    currentWorkflow.value = result.workflow

    // 添加AI回复
    const messageToAdd = {
      type: 'assistant',
      content: result.result?.answer || '抱歉，分析过程中出现问题。',
      timestamp: new Date(),
      workflow: result.workflow,
      data: result.result?.data,
      tools: result.result?.tools,
      source: 'ai-enhanced'
    }

    console.log('📨 准备添加消息:', messageToAdd)
    messages.value.push(messageToAdd)

    console.log('📊 当前消息总数:', messages.value.length)
    console.log('✅ 消息处理完成')

  } catch (error) {
    console.error('❌ 处理消息失败:', error)

    messages.value.push({
      type: 'assistant',
      content: `抱歉，处理您的问题时出现错误：${error.message}`,
      timestamp: new Date()
    })
  } finally {
    isLoading.value = false
  }
}

// 清空消息
const clearMessages = () => {
  messages.value = []
  currentWorkflow.value = null
  console.log('🗑️ 对话已清空')
}

// 格式化时间
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
}

// 格式化助手消息
const formatAssistantMessage = (content) => {
  if (!content) return ''

  // 将换行符转换为HTML换行
  let formatted = content.replace(/\n/g, '<br>')

  // 高亮数字和百分比
  formatted = formatted.replace(/(\d+\.?\d*%?)/g, '<span class="highlight-number">$1</span>')

  // 高亮关键词
  const keywords = ['合格', '不合格', '风险', '质量', '库存', '供应商', '测试', '检验']
  keywords.forEach(keyword => {
    const regex = new RegExp(`(${keyword})`, 'g')
    formatted = formatted.replace(regex, '<span class="highlight-keyword">$1</span>')
  })

  return formatted
}

// 获取消息源标签
const getSourceLabel = (source) => {
  const labels = {
    'basic-rules': '基础规则',
    'ai-enhanced': 'AI增强',
    'chart-tool': '图表工具'
  }
  return labels[source] || source
}

// 获取工作流摘要
const getWorkflowSummary = (workflow) => {
  if (!workflow) return ''

  const completedSteps = workflow.steps?.filter(step => step.status === 'completed').length || 0
  const totalSteps = workflow.steps?.length || 0
  const totalTime = workflow.totalTime || 0

  return `${completedSteps}/${totalSteps}步完成，耗时${totalTime}ms`
}

// 获取数据数量
const getDataCount = (data) => {
  if (Array.isArray(data)) {
    return `${data.length}条`
  } else if (typeof data === 'object') {
    return `${Object.keys(data).length}项`
  } else if (typeof data === 'string') {
    return `${data.length}字符`
  }
  return '未知'
}

const formatSessionTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  return date.toLocaleDateString()
}

// 切换左侧面板展开状态
const toggleSection = (section) => {
  expandedSections.value[section] = !expandedSections.value[section]
}

// 发送预设查询
const sendQuery = (query) => {
  if (isLoading.value) {
    return
  }

  inputMessage.value = query
  sendMessage()
}

// 规则滚动和分页功能
const scrollRules = (category, direction) => {
  const containerRef = {
    'inventory': 'inventoryRulesContainer',
    'quality': 'qualityRulesContainer',
    'production': 'productionRulesContainer'
  }[category]

  const container = document.querySelector(`[ref="${containerRef}"]`) ||
                   document.querySelector(`.rule-buttons-scrollable`)

  if (container) {
    const scrollAmount = 120 // 每次滚动的像素
    const currentScroll = container.scrollLeft
    const newScroll = direction === 'left'
      ? Math.max(0, currentScroll - scrollAmount)
      : currentScroll + scrollAmount

    container.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    })
  }
}

const getVisibleRuleCount = (category) => {
  const rules = basicRules.value[category] || []
  return `${Math.min(4, rules.length)}/${rules.length}`
}

// 尝试基础规则匹配
const tryBasicRules = async (question) => {
  try {
    const response = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: question
      })
    })

    if (response.ok) {
      const result = await response.json()
      if (result.reply && result.reply.length > 50 && !result.reply.includes('抱歉')) {
        return result.reply
      }
    }
  } catch (error) {
    console.log('基础规则匹配失败:', error.message)
  }

  return null
}

// 分析状态相关方法
const getAnalysisStatusText = () => {
  if (!currentAnalysis.value) return ''

  switch (currentAnalysis.value.status) {
    case 'processing': return '分析中...'
    case 'completed': return '分析完成'
    case 'error': return '分析失败'
    default: return '等待中'
  }
}

const formatAnalysisTime = (timestamp) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleTimeString()
}

const formatStepData = (data) => {
  if (typeof data === 'object') {
    return JSON.stringify(data).substring(0, 100) + '...'
  }
  return String(data).substring(0, 100)
}

// 创建新的分析任务
const createAnalysisTask = (question, type = 'basic') => {
  const analysis = {
    id: Date.now(),
    question: question,
    type: type,
    status: 'processing',
    startTime: new Date(),
    steps: [
      { title: '问题理解', description: '分析用户意图', status: 'processing' },
      { title: '数据源识别', description: '确定相关数据表', status: 'pending' },
      { title: '数据查询', description: '执行SQL查询', status: 'pending' },
      { title: '数据汇总', description: '统计分析数据', status: 'pending' },
      { title: '工具调用', description: '调用分析工具', status: 'pending' },
      { title: 'AI分析', description: 'DeepSeek智能分析', status: 'pending' },
      { title: '数据整理', description: '结构化组织结果', status: 'pending' },
      { title: '结果呈现', description: '格式化输出', status: 'pending' }
    ],
    summary: null
  }

  currentAnalysis.value = analysis
  return analysis
}

// 更新分析步骤
const updateAnalysisStep = (stepIndex, status, details = null) => {
  if (!currentAnalysis.value || !currentAnalysis.value.steps[stepIndex]) return

  currentAnalysis.value.steps[stepIndex].status = status
  if (details) {
    currentAnalysis.value.steps[stepIndex].details = true
    currentAnalysis.value.steps[stepIndex] = {
      ...currentAnalysis.value.steps[stepIndex],
      ...details
    }
  }

  // 如果当前步骤完成，开始下一步
  if (status === 'completed' && stepIndex < currentAnalysis.value.steps.length - 1) {
    currentAnalysis.value.steps[stepIndex + 1].status = 'processing'
  }

  // 如果所有步骤完成，更新整体状态
  const allCompleted = currentAnalysis.value.steps.every(step => step.status === 'completed')
  if (allCompleted) {
    currentAnalysis.value.status = 'completed'
    currentAnalysis.value.endTime = new Date()
  }
}

// 模拟分析进度
const simulateAnalysisProgress = async () => {
  if (!currentAnalysis.value) return

  const steps = currentAnalysis.value.steps

  for (let i = 0; i < steps.length; i++) {
    // 随机延迟
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200))

    // 更新步骤状态
    updateAnalysisStep(i, 'completed', {
      duration: Math.floor(Math.random() * 200 + 50),
      result: `步骤 ${i + 1} 完成`,
      data: `处理了 ${Math.floor(Math.random() * 100 + 10)} 条数据`
    })
  }

  // 添加分析摘要
  if (currentAnalysis.value) {
    currentAnalysis.value.summary = {
      dataPoints: Math.floor(Math.random() * 1000 + 100),
      insights: '发现3个关键质量问题',
      recommendations: '建议优化供应商管理流程'
    }
  }
}

// 对话历史管理方法
const generateSessionId = () => {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

const saveCurrentSession = () => {
  if (messages.value.length === 0) return

  const session = {
    id: currentSessionId.value || generateSessionId(),
    title: messages.value[0]?.content?.substring(0, 30) + '...' || '新对话',
    messages: [...messages.value],
    analysis: currentAnalysis.value ? {...currentAnalysis.value} : null,
    timestamp: new Date(),
    messageCount: messages.value.length
  }

  // 保存到localStorage
  const existingIndex = savedSessions.value.findIndex(s => s.id === session.id)
  if (existingIndex >= 0) {
    savedSessions.value[existingIndex] = session
  } else {
    savedSessions.value.unshift(session)
  }

  // 限制保存的会话数量
  if (savedSessions.value.length > 50) {
    savedSessions.value = savedSessions.value.slice(0, 50)
  }

  localStorage.setItem('ai_chat_sessions', JSON.stringify(savedSessions.value))
  currentSessionId.value = session.id

  console.log('💾 会话已保存:', session.title)
}

const loadSavedSessions = () => {
  try {
    const saved = localStorage.getItem('ai_chat_sessions')
    if (saved) {
      savedSessions.value = JSON.parse(saved)
      console.log(`📚 加载了 ${savedSessions.value.length} 个历史会话`)
    }
  } catch (error) {
    console.error('加载历史会话失败:', error)
    savedSessions.value = []
  }
}

const loadSession = (sessionId) => {
  const session = savedSessions.value.find(s => s.id === sessionId)
  if (session) {
    messages.value = [...session.messages]
    currentAnalysis.value = session.analysis ? {...session.analysis} : null
    currentSessionId.value = session.id
    console.log('📖 已加载会话:', session.title)
  }
}

const createNewSession = () => {
  // 先保存当前会话
  if (messages.value.length > 0) {
    saveCurrentSession()
  }

  // 创建新会话
  messages.value = []
  currentAnalysis.value = null
  currentSessionId.value = null
  console.log('🆕 创建新会话')
}

const deleteSession = (sessionId) => {
  savedSessions.value = savedSessions.value.filter(s => s.id !== sessionId)
  localStorage.setItem('ai_chat_sessions', JSON.stringify(savedSessions.value))

  // 如果删除的是当前会话，创建新会话
  if (currentSessionId.value === sessionId) {
    createNewSession()
  }

  console.log('🗑️ 会话已删除')
}

// 自动保存监听
watch(messages, () => {
  if (messages.value.length > 0) {
    // 延迟保存，避免频繁操作
    setTimeout(() => {
      saveCurrentSession()
    }, 1000)
  }
}, { deep: true })

// 组件初始化
onMounted(() => {
  console.log('🚀 AI智能助手初始化...')
  loadSavedSessions()

  // 如果有历史会话，可以选择加载最近的一个
  if (savedSessions.value.length > 0) {
    console.log(`📚 发现 ${savedSessions.value.length} 个历史会话`)
  }
})

// 处理图表生成事件
const handleChartGenerated = (chartData) => {
  console.log('📊 图表生成成功:', chartData)

  // 将图表信息添加到对话中
  const chartMessage = {
    type: 'assistant',
    content: `📊 已生成${chartData.name}图表，请查看左侧图表工具面板中的预览。`,
    timestamp: new Date(),
    chartData: chartData,
    source: 'chart-tool'
  }

  messages.value.push(chartMessage)

  // 自动保存会话
  setTimeout(() => {
    saveCurrentSession()
  }, 500)
}

// 组件卸载前保存
onBeforeUnmount(() => {
  if (messages.value.length > 0) {
    saveCurrentSession()
  }
})
</script>

<style scoped>
.simple-ai-three-column {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.header-bar {
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 24px;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
}

.header-button {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: background 0.3s;
}

.header-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.three-column-layout {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.left-panel, .center-panel, .right-panel {
  display: flex;
  flex-direction: column;
  background: white;
  border-right: 1px solid #e1e5e9;
}

.left-panel {
  width: 25%;
  min-width: 250px;
}

.center-panel {
  width: 40%;
  min-width: 400px;
}

.right-panel {
  width: 35%;
  min-width: 300px;
  border-right: none;
}

.panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e1e5e9;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fafbfc;
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

.tool-content {
  padding: 20px;
  color: #666;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  display: flex;
  flex-direction: column;
  max-width: 80%;
}

.message-item.user {
  align-self: flex-end;
}

.message-item.user .message-content {
  background: #007bff;
  color: white;
}

.message-item.assistant {
  align-self: flex-start;
}

.message-item.assistant .message-content {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #e9ecef;
}

.message-content {
  padding: 12px 16px;
  border-radius: 12px;
  word-wrap: break-word;
  line-height: 1.4;
}

.message-time {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  text-align: right;
}

.message-item.assistant .message-time {
  text-align: left;
}

.input-area {
  padding: 20px;
  border-top: 1px solid #e1e5e9;
  background: #fafbfc;
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
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

.message-input:focus {
  border-color: #007bff;
}

.send-button {
  padding: 12px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s;
}

.send-button:hover:not(:disabled) {
  background: #0056b3;
}

.send-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 左侧面板规则样式 */
.rule-section {
  margin-bottom: 16px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  overflow: hidden;
}

.section-header {
  padding: 12px 16px;
  background: #f8f9fa;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.3s;
}

.section-header:hover {
  background: #e9ecef;
}

.section-icon {
  font-size: 16px;
}

.section-title {
  flex: 1;
  font-weight: 600;
  color: #2c3e50;
}

.expand-icon {
  font-size: 12px;
  transition: transform 0.3s;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.section-content {
  padding: 16px;
  background: white;
}

.rule-category {
  margin-bottom: 16px;
}

.rule-category:last-child {
  margin-bottom: 0;
}

.rule-category h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #495057;
  font-weight: 600;
}

.rule-container {
  position: relative;
}

.rule-buttons-scrollable {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 4px 0;
  scroll-behavior: smooth;
  max-height: 120px;
  flex-wrap: wrap;
}

.rule-buttons-scrollable::-webkit-scrollbar {
  height: 4px;
}

.rule-buttons-scrollable::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.rule-buttons-scrollable::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.rule-buttons-scrollable::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.rule-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  padding: 4px 8px;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e1e5e9;
}

.scroll-btn {
  background: none;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #6c757d;
  transition: all 0.3s;
}

.scroll-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
  color: #495057;
}

.rule-count {
  font-size: 10px;
  color: #6c757d;
  font-weight: 600;
}

.rule-btn {
  padding: 6px 10px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  font-size: 11px;
  text-align: center;
  transition: all 0.3s;
  color: #495057;
  white-space: nowrap;
  min-width: 80px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rule-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.rule-btn.ai-rule {
  background: #e8f5e8;
  border-color: #28a745;
  color: #155724;
}

.rule-btn.ai-rule:hover {
  background: #d4edda;
}

.rule-btn.chart-rule {
  background: #e3f2fd;
  border-color: #2196f3;
  color: #0d47a1;
}

.rule-btn.chart-rule:hover {
  background: #bbdefb;
}

/* 右侧分析面板样式 */
.analysis-status {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6c757d;
}

.status-dot.processing {
  background: #ffc107;
  animation: pulse 1.5s infinite;
}

.status-dot.completed {
  background: #28a745;
}

.status-dot.error {
  background: #dc3545;
}

.status-text {
  font-size: 12px;
  color: #6c757d;
}

.analysis-overview {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.analysis-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 14px;
}

.analysis-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #6c757d;
}

.analysis-type {
  padding: 2px 8px;
  background: #e9ecef;
  border-radius: 12px;
}

.workflow-steps {
  max-height: 400px;
  overflow-y: auto;
}

.workflow-step {
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.workflow-step.active {
  border-color: #ffc107;
  background: #fff8e1;
}

.workflow-step.completed {
  border-color: #28a745;
  background: #f8fff8;
}

.workflow-step.error {
  border-color: #dc3545;
  background: #fff5f5;
}

.step-header {
  display: flex;
  align-items: center;
  padding: 12px;
  gap: 12px;
}

.step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #495057;
}

.workflow-step.active .step-number {
  background: #ffc107;
  color: white;
}

.workflow-step.completed .step-number {
  background: #28a745;
  color: white;
}

.step-info {
  flex: 1;
}

.step-title {
  font-weight: 600;
  color: #2c3e50;
  font-size: 13px;
}

.step-description {
  font-size: 12px;
  color: #6c757d;
  margin-top: 2px;
}

.step-status {
  font-size: 16px;
}

.step-details {
  padding: 0 12px 12px 48px;
  font-size: 12px;
  color: #495057;
}

.step-details > div {
  margin-bottom: 4px;
}

.analysis-summary {
  margin-top: 16px;
  padding: 16px;
  background: #e8f5e8;
  border-radius: 8px;
  border: 1px solid #28a745;
}

.analysis-summary h4 {
  margin: 0 0 12px 0;
  color: #155724;
  font-size: 14px;
}

.summary-content {
  font-size: 12px;
}

.summary-item {
  margin-bottom: 8px;
  color: #155724;
}

.empty-analysis {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #6c757d;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 12px;
  text-align: center;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* 对话管理样式 */
.current-session {
  padding: 12px;
  background: #e8f5e8;
  border-radius: 6px;
  margin-bottom: 12px;
  border: 1px solid #28a745;
}

.session-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.session-icon {
  font-size: 10px;
}

.session-text {
  flex: 1;
  font-weight: 600;
  color: #155724;
}

.message-count {
  background: #28a745;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
}

.session-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
  color: #495057;
}

.action-btn:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #adb5bd;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.new-session {
  background: #e3f2fd;
  border-color: #2196f3;
  color: #0d47a1;
}

.action-btn.save-session {
  background: #e8f5e8;
  border-color: #28a745;
  color: #155724;
}

.btn-icon {
  font-size: 14px;
}

.history-sessions h4 {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #495057;
  font-weight: 600;
}

.session-list {
  max-height: 200px;
  overflow-y: auto;
}

.session-item {
  padding: 8px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
}

.session-item:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.session-item.active {
  background: #e8f5e8;
  border-color: #28a745;
}

.session-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.session-title {
  font-size: 12px;
  font-weight: 600;
  color: #2c3e50;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 10px;
  opacity: 0.6;
  transition: opacity 0.3s;
}

.delete-btn:hover {
  opacity: 1;
}

.session-meta {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #6c757d;
}

.view-more {
  text-align: center;
  margin-top: 8px;
}

.view-more-btn {
  background: none;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 10px;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.3s;
}

.view-more-btn:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.empty-sessions {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  color: #6c757d;
}

.empty-sessions .empty-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.empty-sessions .empty-text {
  font-size: 12px;
}

/* 优化的消息样式 */
.empty-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #6c757d;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 14px;
  opacity: 0.8;
}

/* 用户消息样式 */
.user-message-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  max-width: 70%;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.user-content {
  background: #409eff;
  color: white;
  padding: 12px 16px;
  border-radius: 18px 18px 4px 18px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.user-text {
  line-height: 1.5;
  margin-bottom: 6px;
}

/* AI助手消息样式 */
.assistant-message-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  max-width: 85%;
}

.assistant-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.assistant-content {
  background: white;
  padding: 16px;
  border-radius: 4px 18px 18px 18px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #667eea;
}

.assistant-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.assistant-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.message-source {
  background: #e9ecef;
  color: #495057;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.assistant-text {
  line-height: 1.6;
  color: #2c3e50;
  margin-bottom: 12px;
}

/* 高亮样式 */
.highlight-number {
  background: #fff3cd;
  color: #856404;
  padding: 1px 4px;
  border-radius: 3px;
  font-weight: 600;
}

.highlight-keyword {
  background: #d1ecf1;
  color: #0c5460;
  padding: 1px 4px;
  border-radius: 3px;
  font-weight: 500;
}

/* 工作流信息样式 */
.workflow-info {
  margin: 8px 0;
  padding: 8px 12px;
  background: #e8f5e8;
  border-radius: 6px;
  border-left: 3px solid #28a745;
}

.workflow-summary {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #155724;
}

.workflow-icon {
  font-size: 14px;
}

/* 图表信息样式 */
.chart-info {
  margin: 8px 0;
  padding: 8px 12px;
  background: #e3f2fd;
  border-radius: 6px;
  border-left: 3px solid #2196f3;
}

.chart-summary {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #0d47a1;
}

.chart-icon {
  font-size: 14px;
}

/* 数据统计样式 */
.data-stats {
  margin: 8px 0;
  padding: 8px 12px;
  background: #fff3cd;
  border-radius: 6px;
  border-left: 3px solid #ffc107;
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #856404;
}

.stats-icon {
  font-size: 14px;
}
</style>
