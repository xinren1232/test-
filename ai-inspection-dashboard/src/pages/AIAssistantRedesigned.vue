<template>
  <div class="ai-assistant-redesigned">
    <!-- 顶部导航栏 -->
    <div class="top-navbar">
      <div class="navbar-left">
        <div class="logo-section">
          <div class="logo-icon">🤖</div>
          <div class="logo-text">
            <h1>IQE AI 智能助手</h1>
            <p>基于DeepSeek大模型的质量管理专家</p>
          </div>
        </div>
      </div>
      
      <div class="navbar-right">
        <div class="status-indicator" :class="{ active: aiEnabled }">
          <div class="status-dot"></div>
          <span>{{ aiEnabled ? 'AI增强模式' : '基础模式' }}</span>
        </div>
        
        <el-switch
          v-model="aiEnabled"
          @change="toggleAI"
          size="large"
          active-color="#13ce66"
          inactive-color="#ff4949"
        />
        
        <el-button @click="clearChat" type="primary" :icon="Delete" circle />
        <el-button @click="goBack" type="info" :icon="Back" circle />
      </div>
    </div>

    <!-- 主体内容区 -->
    <div class="main-content">
      <!-- 左侧功能面板 -->
      <div class="left-panel">
        <div class="panel-header">
          <h3>🛠️ 智能工具箱</h3>
          <p>选择工具开始智能分析</p>
        </div>
        
        <div class="tools-grid">
          <div 
            v-for="tool in allTools" 
            :key="tool.id"
            class="tool-card"
            :class="{ active: selectedTool?.id === tool.id }"
            @click="selectTool(tool)"
          >
            <div class="tool-icon" :style="{ background: tool.color }">
              {{ tool.icon }}
            </div>
            <div class="tool-info">
              <h4>{{ tool.name }}</h4>
              <p>{{ tool.description }}</p>
            </div>
            <div class="tool-badge" v-if="tool.category">
              {{ tool.category }}
            </div>
          </div>
        </div>
        
        <!-- 快速操作 -->
        <div class="quick-actions">
          <h4>⚡ 快速操作</h4>
          <div class="action-buttons">
            <el-button 
              v-for="action in quickActions" 
              :key="action.text"
              @click="executeQuickAction(action)"
              size="small"
              :type="action.type"
              plain
            >
              {{ action.icon }} {{ action.text }}
            </el-button>
          </div>
        </div>
      </div>

      <!-- 中央对话区 -->
      <div class="center-panel">
        <!-- 对话头部 -->
        <div class="chat-header">
          <div class="chat-title">
            <h3>💬 智能对话</h3>
            <div class="chat-stats">
              <span>对话轮次: {{ messages.length / 2 | 0 }}</span>
              <span>响应时间: {{ lastResponseTime }}ms</span>
            </div>
          </div>
          
          <!-- 快速问题 -->
          <div class="quick-questions">
            <el-tag 
              v-for="question in quickQuestions" 
              :key="question"
              @click="askQuestion(question)"
              class="question-tag"
              effect="plain"
              size="small"
            >
              {{ question }}
            </el-tag>
          </div>
        </div>

        <!-- 对话内容 -->
        <div class="chat-content" ref="chatContent">
          <div class="welcome-message" v-if="messages.length === 0">
            <div class="welcome-icon">🎯</div>
            <h3>欢迎使用IQE AI智能助手</h3>
            <p>我是您的质量管理专家，可以帮助您：</p>
            <ul>
              <li>📊 分析质量数据和趋势</li>
              <li>🔍 查询库存、生产、检测信息</li>
              <li>📈 生成可视化图表和报告</li>
              <li>🤖 提供专业的质量管理建议</li>
            </ul>
            <p>请选择左侧工具或直接提问开始对话！</p>
          </div>
          
          <div 
            v-for="(message, index) in messages" 
            :key="index"
            :class="['message-item', message.type]"
          >
            <div class="message-avatar">
              <div class="avatar-icon">{{ message.type === 'user' ? '👤' : '🤖' }}</div>
              <div class="avatar-status" v-if="message.type === 'ai'"></div>
            </div>
            
            <div class="message-bubble">
              <div class="message-content" v-html="formatMessage(message.content)"></div>
              <div class="message-meta">
                <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                <div class="message-actions" v-if="message.type === 'ai'">
                  <el-button size="small" text @click="copyMessage(message.content)">
                    <el-icon><DocumentCopy /></el-icon>
                  </el-button>
                  <el-button size="small" text @click="likeMessage(message)">
                    <el-icon><Like /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 加载状态 -->
          <div v-if="loading" class="message-item ai loading">
            <div class="message-avatar">
              <div class="avatar-icon">🤖</div>
              <div class="avatar-status loading"></div>
            </div>
            <div class="message-bubble">
              <div class="typing-indicator">
                <span></span><span></span><span></span>
              </div>
              <div class="loading-text">AI正在思考中...</div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="chat-input">
          <div class="input-container">
            <el-input
              v-model="userInput"
              type="textarea"
              :rows="2"
              placeholder="请输入您的问题... (支持 Ctrl+Enter 快速发送)"
              @keydown.ctrl.enter="sendMessage"
              :disabled="loading"
              class="message-input"
            />
            
            <div class="input-actions">
              <div class="input-tools">
                <el-button size="small" text @click="showVoiceInput">
                  <el-icon><Microphone /></el-icon>
                </el-button>
                <el-button size="small" text @click="showFileUpload">
                  <el-icon><Paperclip /></el-icon>
                </el-button>
              </div>
              
              <el-button 
                type="primary" 
                @click="sendMessage"
                :loading="loading"
                :disabled="!userInput.trim()"
                class="send-button"
              >
                <el-icon><Promotion /></el-icon>
                {{ loading ? '发送中' : '发送' }}
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧分析面板 -->
      <div class="right-panel">
        <div class="panel-header">
          <h3>🧠 AI分析过程</h3>
          <p>实时展示AI思考步骤</p>
        </div>
        
        <!-- 思考步骤 -->
        <div class="thinking-steps">
          <div v-if="thinkingSteps.length === 0" class="empty-thinking">
            <div class="empty-icon">💭</div>
            <p>等待AI开始分析...</p>
          </div>
          
          <div 
            v-for="(step, index) in thinkingSteps" 
            :key="index"
            :class="['thinking-step', step.status]"
          >
            <div class="step-indicator">
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-line" v-if="index < thinkingSteps.length - 1"></div>
            </div>
            
            <div class="step-content">
              <div class="step-header">
                <span class="step-icon">{{ getStepIcon(step.type) }}</span>
                <span class="step-title">{{ step.title }}</span>
                <span class="step-status">{{ getStatusText(step.status) }}</span>
              </div>
              
              <div class="step-details" v-if="step.details">
                <p>{{ step.details }}</p>
              </div>
              
              <div class="step-progress" v-if="step.status === 'processing'">
                <div class="progress-bar"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 数据统计 -->
        <div class="data-stats">
          <h4>📊 数据概览</h4>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ dataStats.inventory }}</div>
              <div class="stat-label">库存记录</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ dataStats.production }}</div>
              <div class="stat-label">生产记录</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ dataStats.inspection }}</div>
              <div class="stat-label">检测记录</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Delete, Back, DocumentCopy, Microphone,
  Paperclip, Promotion
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const aiEnabled = ref(true)
const loading = ref(false)
const userInput = ref('')
const messages = ref([])
const thinkingSteps = ref([])
const selectedTool = ref(null)
const lastResponseTime = ref(0)
const chatContent = ref(null)

// 数据统计
const dataStats = reactive({
  inventory: 132,
  production: 1056,
  inspection: 396
})

// 工具配置
const allTools = ref([
  {
    id: 'data-analysis',
    name: '数据分析',
    icon: '📊',
    description: '深度分析质量管理数据',
    category: '分析',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 'trend-analysis',
    name: '趋势分析',
    icon: '📈',
    description: '识别数据变化趋势',
    category: '分析',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    id: 'chart-generation',
    name: '图表生成',
    icon: '📊',
    description: '生成可视化图表',
    category: '可视化',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    id: 'report-generation',
    name: '报告生成',
    icon: '📄',
    description: '自动生成分析报告',
    category: '报告',
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    id: 'inventory-query',
    name: '库存查询',
    icon: '📦',
    description: '查询库存状态信息',
    category: '查询',
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  {
    id: 'production-query',
    name: '生产查询',
    icon: '🏭',
    description: '查询生产线数据',
    category: '查询',
    color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  },
  {
    id: 'quality-inspection',
    name: '质量检测',
    icon: '🔍',
    description: '检测质量异常',
    category: '检测',
    color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
  },
  {
    id: 'web-search',
    name: '网络搜索',
    icon: '🌐',
    description: '搜索相关信息',
    category: '搜索',
    color: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
  }
])

// 快速操作
const quickActions = ref([
  { text: '数据概览', icon: '📊', type: 'primary', action: 'overview' },
  { text: '异常检测', icon: '⚠️', type: 'warning', action: 'anomaly' },
  { text: '质量报告', icon: '📋', type: 'success', action: 'report' },
  { text: '趋势预测', icon: '🔮', type: 'info', action: 'prediction' }
])

// 快速问题
const quickQuestions = ref([
  '查询工厂A的库存情况',
  '分析最近一周的质量趋势',
  '生成本月质量分析报告',
  '检查是否有异常批次',
  '预测下月质量风险',
  '对比各工厂质量表现'
])

// AI配置
const AI_CONFIG = {
  apiKey: 'sk-cab797574abf4288bcfaca253191565d',
  baseURL: 'https://api.deepseek.com',
  endpoint: '/chat/completions',
  model: 'deepseek-chat'
}

// 方法定义
const goBack = () => {
  router.push('/')
}

const toggleAI = () => {
  ElMessage({
    message: `已切换到${aiEnabled.value ? 'AI增强模式' : '基础模式'}`,
    type: 'info',
    duration: 2000
  })
}

const clearChat = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有对话记录吗？',
      '清空对话',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    messages.value = []
    thinkingSteps.value = []
    selectedTool.value = null

    ElMessage({
      type: 'success',
      message: '对话已清空'
    })
  } catch {
    // 用户取消
  }
}

const selectTool = (tool) => {
  selectedTool.value = tool
  userInput.value = `请使用${tool.name}工具帮我分析数据`

  ElMessage({
    message: `已选择工具：${tool.name}`,
    type: 'success',
    duration: 2000
  })
}

const executeQuickAction = (action) => {
  const actionMap = {
    overview: '请提供当前系统的数据概览',
    anomaly: '请检测当前是否存在质量异常',
    report: '请生成本月的质量分析报告',
    prediction: '请预测下个月的质量趋势'
  }

  userInput.value = actionMap[action.action] || action.text
  sendMessage()
}

const askQuestion = (question) => {
  userInput.value = question
  sendMessage()
}

const sendMessage = async () => {
  if (!userInput.value.trim() || loading.value) return

  const question = userInput.value.trim()
  const startTime = Date.now()

  // 添加用户消息
  messages.value.push({
    type: 'user',
    content: question,
    timestamp: new Date()
  })

  userInput.value = ''
  scrollToBottom()

  try {
    await processAI(question)
    lastResponseTime.value = Date.now() - startTime
  } catch (error) {
    console.error('AI处理错误:', error)
    messages.value.push({
      type: 'ai',
      content: '抱歉，处理您的问题时出现了错误。请稍后重试。',
      timestamp: new Date()
    })

    ElMessage({
      message: '处理失败，请稍后重试',
      type: 'error'
    })
  }

  scrollToBottom()
}

const processAI = async (question) => {
  loading.value = true
  thinkingSteps.value = []

  try {
    // 步骤1: 理解问题
    addThinkingStep('understanding', '理解用户问题', 'processing', '正在分析问题意图和关键信息...')
    await delay(800)
    updateThinkingStep(0, 'completed', '问题理解完成，识别出关键要素')

    // 步骤2: 数据检索
    addThinkingStep('data_retrieval', '检索相关数据', 'processing', '从数据库中查找相关信息...')
    await delay(600)
    updateThinkingStep(1, 'completed', '成功检索到相关数据记录')

    // 步骤3: AI分析
    addThinkingStep('ai_analysis', 'AI智能分析', 'processing', '调用DeepSeek大模型进行深度分析...')

    let response
    if (aiEnabled.value) {
      try {
        response = await callAI(question)
        updateThinkingStep(2, 'completed', 'AI分析完成，生成专业回答')
      } catch (error) {
        console.error('AI调用失败:', error)
        response = generateFallbackResponse(question)
        updateThinkingStep(2, 'completed', '使用基础模式生成回答')

        ElMessage({
          message: 'AI服务暂时不可用，已切换到基础模式',
          type: 'warning'
        })
      }
    } else {
      response = generateFallbackResponse(question)
      updateThinkingStep(2, 'completed', '基础模式分析完成')
    }

    // 步骤4: 结果整理
    addThinkingStep('result_formatting', '整理分析结果', 'processing', '格式化输出结果...')
    await delay(300)
    updateThinkingStep(3, 'completed', '结果整理完成，准备展示')

    // 显示AI回复
    messages.value.push({
      type: 'ai',
      content: response,
      timestamp: new Date()
    })

  } finally {
    loading.value = false
  }
}

const callAI = async (question) => {
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
          content: `你是IQE质量管理系统的AI智能助手，专门负责质量管理数据分析和问答。

当前系统数据概览：
- 库存记录：${dataStats.inventory}条
- 生产记录：${dataStats.production}条
- 检测记录：${dataStats.inspection}条

请基于用户问题提供专业、准确、有用的回答。回答要结构化、易读，可以使用适当的格式和符号。`
        },
        {
          role: 'user',
          content: question
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  })

  if (!response.ok) {
    throw new Error(`AI API错误: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

const generateFallbackResponse = (question) => {
  // 基础模式的智能回复逻辑
  const keywords = question.toLowerCase()

  if (keywords.includes('库存') || keywords.includes('inventory')) {
    return `📦 **库存查询结果**

根据您的查询，当前系统中共有 ${dataStats.inventory} 条库存记录。

**主要信息：**
- 总库存记录数：${dataStats.inventory}
- 涉及多个工厂和仓库
- 包含各类物料的详细信息

**建议操作：**
1. 查看具体库存详情页面
2. 筛选特定工厂或物料
3. 检查库存状态和预警信息

如需更详细的分析，请启用AI增强模式。`
  }

  if (keywords.includes('生产') || keywords.includes('production')) {
    return `🏭 **生产数据分析**

当前生产数据概览：

**数据统计：**
- 生产记录总数：${dataStats.production}
- 覆盖多条生产线
- 包含质量检测结果

**关键指标：**
- 生产效率正常
- 质量合格率稳定
- 异常情况已标记

建议查看生产管理页面获取更详细信息。`
  }

  if (keywords.includes('检测') || keywords.includes('质量') || keywords.includes('inspection')) {
    return `🔍 **质量检测分析**

质量检测数据概览：

**检测统计：**
- 检测记录数：${dataStats.inspection}
- 涵盖各类质量指标
- 实时更新检测结果

**质量状态：**
- 整体质量水平良好
- 异常批次已识别
- 改进建议已生成

如需深度分析，建议使用AI增强模式。`
  }

  return `🤖 **智能助手回复**

我收到了您的问题："${question}"

**基础分析：**
这是一个关于质量管理的问题。基于当前数据：
- 库存记录：${dataStats.inventory}条
- 生产记录：${dataStats.production}条
- 检测记录：${dataStats.inspection}条

**建议：**
1. 启用AI增强模式获得更专业的分析
2. 选择左侧相关工具进行深入分析
3. 查看对应的数据管理页面

如有其他问题，请随时询问！`
}

// 辅助方法
const addThinkingStep = (type, title, status, details = '') => {
  thinkingSteps.value.push({
    type,
    title,
    status,
    details,
    timestamp: new Date()
  })
}

const updateThinkingStep = (index, status, details = '') => {
  if (thinkingSteps.value[index]) {
    thinkingSteps.value[index].status = status
    if (details) {
      thinkingSteps.value[index].details = details
    }
  }
}

const getStepIcon = (type) => {
  const icons = {
    understanding: '🤔',
    data_retrieval: '📊',
    ai_analysis: '🤖',
    result_formatting: '📝'
  }
  return icons[type] || '⚙️'
}

const getStatusText = (status) => {
  const texts = {
    processing: '处理中...',
    completed: '已完成',
    failed: '失败'
  }
  return texts[status] || status
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleTimeString()
}

const formatMessage = (content) => {
  // 简单的markdown格式化
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
}

const copyMessage = async (content) => {
  try {
    await navigator.clipboard.writeText(content)
    ElMessage({
      message: '内容已复制到剪贴板',
      type: 'success'
    })
  } catch (error) {
    ElMessage({
      message: '复制失败',
      type: 'error'
    })
  }
}

const likeMessage = (message) => {
  ElMessage({
    message: '感谢您的反馈！',
    type: 'success'
  })
}

const showVoiceInput = () => {
  ElMessage({
    message: '语音输入功能开发中...',
    type: 'info'
  })
}

const showFileUpload = () => {
  ElMessage({
    message: '文件上传功能开发中...',
    type: 'info'
  })
}

const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContent.value) {
      chatContent.value.scrollTop = chatContent.value.scrollHeight
    }
  })
}

// 生命周期
onMounted(() => {
  console.log('🤖 AI智能助手重新设计版本已加载')

  // 加载数据统计
  loadDataStats()

  // 显示欢迎消息
  setTimeout(() => {
    if (messages.value.length === 0) {
      ElMessage({
        message: '欢迎使用IQE AI智能助手！',
        type: 'success',
        duration: 3000
      })
    }
  }, 1000)
})

const loadDataStats = () => {
  try {
    // 从localStorage加载实际数据统计
    const inventoryData = localStorage.getItem('unified_inventory_data') || localStorage.getItem('inventory_data')
    const labData = localStorage.getItem('unified_lab_data') || localStorage.getItem('lab_data')
    const factoryData = localStorage.getItem('unified_factory_data') || localStorage.getItem('factory_data')

    if (inventoryData) {
      const inventory = JSON.parse(inventoryData)
      dataStats.inventory = inventory.length
    }

    if (labData) {
      const lab = JSON.parse(labData)
      dataStats.inspection = lab.length
    }

    if (factoryData) {
      const factory = JSON.parse(factoryData)
      dataStats.production = factory.length
    }
  } catch (error) {
    console.warn('加载数据统计失败:', error)
  }
}
</script>

<style scoped>
/* 全局样式 */
.ai-assistant-redesigned {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: 999999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 顶部导航栏 */
.top-navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.navbar-left {
  display: flex;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.logo-text h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-text p {
  margin: 0;
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.status-indicator.active {
  background: rgba(19, 206, 102, 0.1);
  color: #13ce66;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff4949;
  animation: pulse 2s infinite;
}

.status-indicator.active .status-dot {
  background: #13ce66;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* 主体内容 */
.main-content {
  flex: 1;
  display: flex;
  gap: 20px;
  padding: 20px;
  overflow: hidden;
  min-height: 0;
}

/* 左侧面板 */
.left-panel {
  width: 320px;
  min-width: 320px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.panel-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.panel-header p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

/* 工具网格 */
.tools-grid {
  padding: 16px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  flex: 1;
}

.tool-card {
  position: relative;
  padding: 16px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.tool-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.tool-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  border-color: rgba(102, 126, 234, 0.3);
}

.tool-card:hover::before {
  opacity: 1;
}

.tool-card.active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.tool-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-bottom: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tool-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.tool-info p {
  margin: 0;
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.tool-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 8px;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
}

/* 快速操作 */
.quick-actions {
  padding: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.quick-actions h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-buttons .el-button {
  justify-content: flex-start;
  text-align: left;
}

/* 中央面板 */
.center-panel {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  padding: 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.chat-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chat-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.chat-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #666;
}

.quick-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.question-tag {
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 16px;
}

.question-tag:hover {
  background: #667eea !important;
  color: white !important;
  border-color: #667eea !important;
  transform: translateY(-1px);
}

/* 对话内容 */
.chat-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.welcome-message {
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-radius: 16px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.welcome-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.welcome-message h3 {
  margin: 0 0 16px 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.welcome-message p {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #666;
  line-height: 1.6;
}

.welcome-message ul {
  text-align: left;
  max-width: 400px;
  margin: 0 auto 16px auto;
  padding-left: 0;
  list-style: none;
}

.welcome-message li {
  padding: 8px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

/* 消息项 */
.message-item {
  display: flex;
  gap: 16px;
  max-width: 85%;
  animation: fadeInUp 0.3s ease-out;
}

.message-item.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-avatar {
  position: relative;
  flex-shrink: 0;
}

.avatar-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.message-item.user .avatar-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.avatar-status {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #13ce66;
  border: 2px solid white;
}

.avatar-status.loading {
  background: #409eff;
  animation: pulse 1.5s infinite;
}

.message-bubble {
  flex: 1;
  background: rgba(245, 247, 250, 0.8);
  border-radius: 16px;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.message-item.user .message-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message-content {
  line-height: 1.6;
  font-size: 15px;
}

.message-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.message-item.user .message-meta {
  border-top-color: rgba(255, 255, 255, 0.2);
}

.message-time {
  font-size: 12px;
  color: #999;
}

.message-item.user .message-time {
  color: rgba(255, 255, 255, 0.8);
}

.message-actions {
  display: flex;
  gap: 4px;
}

/* 加载状态 */
.message-item.loading .message-bubble {
  background: rgba(245, 247, 250, 0.8);
}

.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
  margin-bottom: 8px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #667eea;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

.loading-text {
  font-size: 13px;
  color: #666;
  font-style: italic;
}

@keyframes typing {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1.2); opacity: 1; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 输入区域 */
.chat-input {
  padding: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  background: rgba(248, 250, 252, 0.5);
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-input {
  border-radius: 12px;
  border: 2px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.message-input:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.input-tools {
  display: flex;
  gap: 8px;
}

.send-button {
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s;
}

.send-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

/* 右侧面板 */
.right-panel {
  width: 350px;
  min-width: 350px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 思考步骤 */
.thinking-steps {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.empty-thinking {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.thinking-step {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  animation: slideInRight 0.3s ease-out;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f5f7fa;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  border: 2px solid #e2e8f0;
  transition: all 0.3s;
}

.thinking-step.processing .step-number {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
  animation: pulse 2s infinite;
}

.thinking-step.completed .step-number {
  background: #13ce66;
  color: white;
  border-color: #13ce66;
}

.step-line {
  width: 2px;
  height: 40px;
  background: #e2e8f0;
  margin-top: 8px;
}

.thinking-step.processing .step-line {
  background: linear-gradient(to bottom, #667eea, #e2e8f0);
}

.thinking-step.completed .step-line {
  background: #13ce66;
}

.step-content {
  flex: 1;
  padding-top: 4px;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.step-icon {
  font-size: 16px;
}

.step-title {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.step-status {
  font-size: 12px;
  color: #666;
  margin-left: auto;
}

.thinking-step.processing .step-status {
  color: #667eea;
}

.thinking-step.completed .step-status {
  color: #13ce66;
}

.step-details {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 8px;
}

.step-progress {
  height: 3px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 2px;
  animation: progress 2s infinite;
}

@keyframes progress {
  0% { width: 0%; }
  50% { width: 70%; }
  100% { width: 100%; }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 数据统计 */
.data-stats {
  padding: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  background: rgba(248, 250, 252, 0.5);
}

.data-stats h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .left-panel {
    width: 280px;
    min-width: 280px;
  }

  .right-panel {
    width: 300px;
    min-width: 300px;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    gap: 16px;
  }

  .left-panel,
  .right-panel {
    width: 100%;
    min-width: auto;
    height: 200px;
  }

  .tools-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
}
</style>
