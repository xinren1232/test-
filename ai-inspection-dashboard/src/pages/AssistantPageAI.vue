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
        <span class="ai-status-text">AI增强模式</span>
        <el-switch
          v-model="aiMode"
          size="default"
          active-color="#409EFF"
          inactive-color="#DCDFE6"
        />
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

          <!-- 质量管理工具 -->
          <div class="tool-category">
            <h4>🎯 质量管理</h4>
            <div
              v-for="tool in qualityTools"
              :key="tool.name"
              class="tool-card"
              :class="{ active: selectedTool?.name === tool.name }"
              @click="selectTool(tool)"
            >
              <div class="tool-icon" :style="{ background: getToolColor('quality') }">
                {{ tool.icon }}
              </div>
              <div class="tool-info">
                <h4>{{ tool.displayName }}</h4>
                <p>{{ tool.description }}</p>
              </div>
              <div class="tool-badge">质量</div>
            </div>
          </div>
        </div>

        <!-- 快速操作 -->
        <div class="quick-actions">
          <div class="section-header">
            <span class="section-icon">⚡</span>
            <span class="section-title">快速操作</span>
          </div>
          <div class="action-list">
            <button
              v-for="action in quickActions"
              :key="action.text"
              @click="executeQuickAction(action)"
              class="action-button"
            >
              <span class="action-icon">{{ action.icon }}</span>
              <span class="action-text">{{ action.text }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧对话区 -->
      <div class="right-chat-area">
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
        <div class="chat-content" ref="chatMessages">
          <div class="welcome-message" v-if="messages.length === 0">
            <div class="welcome-icon">🤖</div>
            <h3>您好！我是基于DeepSeek大模型的质量管理专家，可以帮您：</h3>
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

          <div
            v-for="(message, index) in messages"
            :key="index"
            :class="['message-item', message.sender || message.type]"
          >
            <div class="message-avatar">
              <div class="avatar-icon">{{ (message.sender === 'user' || message.type === 'user') ? '👤' : '🤖' }}</div>
              <div class="avatar-status" v-if="(message.sender !== 'user' && message.type !== 'user')"></div>
            </div>

            <div class="message-bubble">
              <div class="message-content" v-html="formatMessage(message.content || message.text)"></div>
              <div class="message-meta">
                <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                <div class="message-actions" v-if="(message.sender !== 'user' && message.type !== 'user')">
                  <el-button size="small" text @click="copyMessage(message.content || message.text)">
                    复制
                  </el-button>
                  <el-button size="small" text @click="likeMessage(message)">
                    点赞
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 加载状态 -->
          <div v-if="isLoading" class="message-item ai loading">
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
            <textarea
              v-model="inputMessage"
              rows="1"
              placeholder="请输入您的问题..."
              @keydown.ctrl.enter="sendMessage"
              :disabled="isLoading"
              class="message-input"
            ></textarea>

            <div class="input-actions">
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
    </div>
  </div>

        <!-- 思考步骤 -->
        <div class="thinking-steps">
          <div v-if="currentProcess.length === 0" class="empty-thinking">
            <div class="empty-icon">💭</div>
            <p>等待AI开始分析...</p>
          </div>

          <div
            v-for="(step, index) in currentProcess"
            :key="index"
            :class="['thinking-step', step.status]"
          >
            <div class="step-indicator">
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-line" v-if="index < currentProcess.length - 1"></div>
            </div>

            <div class="step-content">
              <div class="step-header">
                <span class="step-icon">{{ getStepIcon(step.type || step.name) }}</span>
                <span class="step-title">{{ step.title || step.name }}</span>
                <span class="step-status">{{ getStatusText(step.status) }}</span>
              </div>

              <div class="step-details" v-if="step.details || step.description">
                <p>{{ step.details || step.description }}</p>
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
               :class="['process-step', step.status]">
            <div class="step-header">
              <div class="step-icon">{{ getStepIcon(step.type) }}</div>
              <div class="step-title">{{ step.title }}</div>
              <div class="step-status">{{ getStatusText(step.status) }}</div>
            </div>

            <div v-if="step.details" class="step-details">
              <pre>{{ JSON.stringify(step.details, null, 2) }}</pre>
            </div>

            <div v-if="step.result" class="step-result">
              <div class="result-label">执行结果:</div>
              <div class="result-content">{{ formatStepResult(step.result) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue'
import { ElSwitch } from 'element-plus'

// 响应式数据
const aiMode = ref(true)
const isLoading = ref(false)
const inputMessage = ref('')
const messages = ref([])
const currentProcess = ref([])
const chatMessages = ref(null)
const selectedTool = ref(null)
const lastResponseTime = ref(0)

// 数据统计
const dataStats = reactive({
  inventory: 132,
  production: 1056,
  inspection: 396
})

// 快速操作
const quickActions = ref([
  { text: '数据概览', icon: '📊', type: 'primary', action: 'overview' },
  { text: '异常检测', icon: '⚠️', type: 'warning', action: 'anomaly' },
  { text: '质量报告', icon: '📋', type: 'success', action: 'report' },
  { text: '趋势预测', icon: '🔮', type: 'info', action: 'prediction' }
])

// 快速示例问题
const quickExamples = ref([
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

// 工具分类
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

const qualityTools = ref([
  { name: 'production_management', icon: '🏭', displayName: '生产管理', description: '管理生产流程数据' }
])

// 方法定义
const toggleAI = () => {
  console.log(`已切换到${aiMode.value ? 'AI增强模式' : '基础模式'}`)
}

const clearMessages = () => {
  if (confirm('确定要清空所有对话记录吗？')) {
    messages.value = []
    currentProcess.value = []
    selectedTool.value = null
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
}

const getToolColor = (category) => {
  const colors = {
    analysis: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    visualization: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    network: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    quality: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  }
  return colors[category] || 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
}

const executeQuickAction = (action) => {
  const actionMap = {
    overview: '请提供当前系统的数据概览',
    anomaly: '请检测当前是否存在质量异常',
    report: '请生成本月的质量分析报告',
    prediction: '请预测下个月的质量趋势'
  }

  inputMessage.value = actionMap[action.action] || action.text
  sendMessage()
}

const sendQuickQuestion = (question) => {
  inputMessage.value = question
  sendMessage()
}

const formatMessage = (content) => {
  if (!content) return ''
  return content.replace(/\n/g, '<br>')
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

  try {
    // 模拟AI回复
    setTimeout(() => {
      const aiMessage = {
        type: 'ai',
        content: `收到您的问题："${question}"。这是一个模拟回复，AI功能正在开发中。`,
        timestamp: new Date()
      }
      messages.value.push(aiMessage)
      isLoading.value = false
    }, 1000)
  } catch (error) {
    console.error('发送消息失败:', error)
    isLoading.value = false
  }
}

// exportChat函数已在前面定义

// 初始化AI服务
const initAIService = async () => {
  try {
    console.log('🤖 初始化AI服务...');
    console.log('📋 AI服务实例:', aiServiceInstance.value);

    // 测试连接
    if (aiServiceInstance.value) {
      console.log('🔄 测试DeepSeek API连接...');
      const isConnected = await aiServiceInstance.value.testConnection();
      if (isConnected) {
        pageStatus.value = 'AI已连接';
        console.log('✅ DeepSeek API连接成功');
      } else {
        pageStatus.value = 'AI连接失败';
        console.warn('⚠️ DeepSeek API连接失败');
      }
    } else {
      console.error('❌ AI服务实例为空');
      pageStatus.value = 'AI服务异常';
    }
  } catch (error) {
    console.error('❌ AI服务初始化失败:', error);
    pageStatus.value = 'AI服务异常';
  }
}

// 删除重复的sendMessage和processAI函数，使用前面定义的版本

// callAI函数已在前面定义

// generateFallbackResponse函数已在前面定义

// 辅助方法已在前面定义

// getStepIcon和getStatusText函数已在前面定义

// formatTime和formatMessage函数已在前面定义

// copyMessage函数已在前面定义

// 这些函数已在前面定义

// onMounted和loadDataStats函数已在前面定义

// 删除重复的错误处理代码

// callRealAI函数已在前面定义

// generateBasicResponse函数已在前面定义

// 添加缺失的变量定义
const userInput = ref('')
const pageStatus = ref('正常')
const aiServiceInstance = ref(null)

// AI服务已在上面定义，删除重复定义

// 确保onMounted正确执行
onMounted(async () => {
  console.log('🤖 AI智能助手重新设计版本已加载')

  // 加载数据统计
  loadDataStats()

  // 初始化AI服务
  await initAIService()

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
</script>

<style scoped>
/* 全局样式 */
.iqe-ai-assistant {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
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
.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
  height: calc(100vh - 60px);
}

/* 左侧面板 */
.left-sidebar {
  width: 200px;
  background: #ffffff;
  border-right: 1px solid #e8e8e8;
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

/* 工具网格 */
.tools-grid {
  padding: 16px;
  flex: 1;
}

.tool-category {
  margin-bottom: 24px;
}

.tool-category h4 {
  margin: 0 0 12px 0;
  color: #606266;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
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
  margin-bottom: 12px;
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

/* 右侧对话区 */
.right-chat-area {
  flex: 1;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

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

.question-tag {
  display: inline-block;
  padding: 6px 12px;
  background: #f0f2f5;
  border: 1px solid #d9d9d9;
  border-radius: 16px;
  cursor: pointer;
  font-size: 12px;
  margin: 4px;
  transition: all 0.3s;
}

.question-tag:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
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
  width: 100%;
  border-radius: 12px;
  border: 2px solid rgba(0, 0, 0, 0.05);
  padding: 12px;
  font-size: 14px;
  resize: vertical;
  transition: all 0.3s;
  font-family: inherit;
}

.message-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.tool-button {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s;
}

.tool-button:hover {
  background: rgba(0, 0, 0, 0.05);
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
}
</style>

/* 左侧工具面板 */
.tools-panel {
  width: 300px !important;
  min-width: 300px;
  max-width: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow-y: auto;
  flex-shrink: 0;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

.panel-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
}

.quick-actions {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.quick-tag:hover {
  background: #409eff;
  color: white;
}

.tool-category {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.tool-category h4 {
  margin: 0 0 12px 0;
  color: #606266;
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
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.tool-item:hover {
  background: #e3f2fd;
  transform: translateX(4px);
}

.tool-icon {
  font-size: 20px;
  margin-right: 12px;
}

.tool-info {
  flex: 1;
}

.tool-name {
  font-weight: 500;
  color: #303133;
  font-size: 13px;
}

.tool-desc {
  color: #909399;
  font-size: 12px;
  margin-top: 2px;
}

/* 中间聊天面板 */
.chat-panel {
  flex: 1 1 auto !important;
  min-width: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex !important;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 12px;
  max-width: 80%;
}

.message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message.ai {
  align-self: flex-start;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: #409eff;
  color: white;
}

.message.ai .message-avatar {
  background: #67c23a;
  color: white;
}

.message-content {
  flex: 1;
}

.message-text {
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.5;
  word-wrap: break-word;
}

.message.user .message-text {
  background: #409eff;
  color: white;
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  text-align: right;
}

.message.user .message-time {
  text-align: left;
}

/* 加载动画 */
.loading .message-text {
  background: #f0f0f0;
  padding: 16px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #909399;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

.chat-input {
  padding: 16px;
  border-top: 1px solid #e4e7ed;
}

.input-actions {
  margin-top: 8px;
  text-align: right;
}

/* 右侧思考过程面板 */
.process-panel {
  width: 350px !important;
  min-width: 350px;
  max-width: 350px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex !important;
  flex-direction: column;
  flex-shrink: 0;
}

.process-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #909399;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 14px;
}

.process-step {
  margin-bottom: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}

.process-step.processing {
  border-color: #409eff;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.2);
}

.process-step.completed {
  border-color: #67c23a;
}

.step-header {
  padding: 12px 16px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-icon {
  font-size: 16px;
}

.step-title {
  flex: 1;
  font-weight: 500;
  color: #303133;
  font-size: 14px;
}

.step-status {
  font-size: 12px;
  color: #909399;
}

.process-step.processing .step-status {
  color: #409eff;
}

.process-step.completed .step-status {
  color: #67c23a;
}

.step-details {
  padding: 12px 16px;
  border-top: 1px solid #e4e7ed;
  background: #fafafa;
}

.step-details pre {
  margin: 0;
  font-size: 12px;
  color: #606266;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.step-result {
  padding: 12px 16px;
  border-top: 1px solid #e4e7ed;
}

.result-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.result-content {
  font-size: 13px;
  color: #303133;
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 4px;
  border-left: 3px solid #67c23a;
}

/* 保持原有样式的兼容性 - 已注释以避免冲突 */

/*
.mode-control {
  display: flex;
  align-items: center;
  gap: 15px;
}

.mode-desc {
  color: #666;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.messages-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.messages-container {
  padding: 20px;
}

.message-item {
  margin-bottom: 20px;
  padding: 15px;
  border-radius: 8px;
}

.message-item.user {
  background: #e3f2fd;
  margin-left: 20%;
}

.message-item.assistant {
  background: #f1f8e9;
  margin-right: 20%;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.sender-name {
  font-weight: bold;
  color: #2c3e50;
}

.timestamp {
  font-size: 12px;
  color: #999;
  margin-left: auto;
}

.loading-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}

.ai-message {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.ai-title {
  background: #f5f5f5;
  padding: 10px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-content {
  padding: 15px;
}
*/

/* 剩余旧样式已注释 - 使用新的三栏布局样式 */
/*
.ai-content ul {
  margin: 5px 0;
  padding-left: 20px;
}

.text-message {
  line-height: 1.6;
  white-space: pre-wrap;
}

.input-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.input-row {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.input-row .el-input {
  flex: 1;
}

.quick-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.enhanced-ai-message {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-left: 4px solid #0ea5e9;
  border-radius: 12px;
  padding: 16px;
  margin: 8px 0;
}

.tool-results {
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  border: 1px solid #e0e7ff;
}

.tool-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 12px;
  font-size: 14px;
}

.tool-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tool-item {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.tool-item.success {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.tool-item.error {
  background: #fef2f2;
  border-color: #fecaca;
}

.tool-name {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
  margin-bottom: 4px;
  font-size: 13px;
}

.tool-summary {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
}
*/

/* 剩余旧样式已全部注释 */
/*
.search-results {
  margin-top: 8px;
}

.search-result-item {
  padding: 6px 0;
  border-bottom: 1px solid #f3f4f6;
}

.search-result-item:last-child {
  border-bottom: none;
}

.result-title {
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 2px;
}

.result-title a {
  color: #1d4ed8;
  text-decoration: none;
}

.result-title a:hover {
  text-decoration: underline;
}

.result-snippet {
  font-size: 11px;
  color: #6b7280;
  line-height: 1.4;
}

.ai-response {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #e0e7ff;
}

.response-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 8px;
  font-size: 14px;
}

.response-content {
  color: #374151;
  line-height: 1.6;
  font-size: 14px;
}
*/
</style>
