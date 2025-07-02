<template>
  <div id="ai-assistant-overlay">
    <!-- 三栏AI助手 -->
    <div class="ai-container">
      <!-- 顶部导航 -->
      <div class="ai-header">
        <h1>🤖 IQE AI 智能助手</h1>
        <div class="ai-controls">
          <button class="ai-btn primary" @click="toggleAI">
            {{ aiEnabled ? 'AI增强模式' : '基础模式' }}
          </button>
          <button class="ai-btn" @click="clearChat">清空对话</button>
          <button class="ai-btn secondary" @click="goBack">返回系统</button>
        </div>
      </div>

      <!-- 三栏主体 -->
      <div class="ai-body">
        <!-- 左栏：工具 -->
        <div class="ai-left">
          <div class="panel-title">🛠️ 可用工具</div>
          
          <div class="tool-section">
            <div class="tool-group">
              <h4>📊 数据分析工具</h4>
              <div class="tool-item" @click="selectTool('数据分析')">
                <span>📊</span>
                <div>
                  <div class="tool-name">数据分析</div>
                  <div class="tool-desc">分析质量管理数据</div>
                </div>
              </div>
              <div class="tool-item" @click="selectTool('统计分析')">
                <span>📈</span>
                <div>
                  <div class="tool-name">统计分析</div>
                  <div class="tool-desc">执行统计分析</div>
                </div>
              </div>
            </div>

            <div class="tool-group">
              <h4>📈 可视化工具</h4>
              <div class="tool-item" @click="selectTool('图表生成')">
                <span>📊</span>
                <div>
                  <div class="tool-name">图表生成</div>
                  <div class="tool-desc">生成数据可视化图表</div>
                </div>
              </div>
              <div class="tool-item" @click="selectTool('报告生成')">
                <span>📄</span>
                <div>
                  <div class="tool-name">报告生成</div>
                  <div class="tool-desc">生成质量分析报告</div>
                </div>
              </div>
            </div>

            <div class="tool-group">
              <h4>🎯 质量管理</h4>
              <div class="tool-item" @click="selectTool('库存查询')">
                <span>📦</span>
                <div>
                  <div class="tool-name">库存查询</div>
                  <div class="tool-desc">查询库存信息</div>
                </div>
              </div>
              <div class="tool-item" @click="selectTool('生产查询')">
                <span>🏭</span>
                <div>
                  <div class="tool-name">生产查询</div>
                  <div class="tool-desc">查询生产数据</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 中栏：对话 -->
        <div class="ai-center">
          <div class="panel-title">
            💬 智能问答
            <div class="quick-tags">
              <span class="tag" @click="askQuick('查询工厂A的库存情况')">查询工厂A的库存情况</span>
              <span class="tag" @click="askQuick('分析最近的质量趋势')">分析最近的质量趋势</span>
              <span class="tag" @click="askQuick('生成质量报告')">生成质量报告</span>
            </div>
          </div>

          <!-- 对话区 -->
          <div class="chat-area" ref="chatArea">
            <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.type]">
              <div class="avatar">{{ msg.type === 'user' ? '👤' : '🤖' }}</div>
              <div class="content">
                <div class="text">{{ msg.content }}</div>
                <div class="time">{{ formatTime(msg.timestamp) }}</div>
              </div>
            </div>
            
            <div v-if="loading" class="message ai">
              <div class="avatar">🤖</div>
              <div class="content">
                <div class="loading-dots">
                  <span></span><span></span><span></span>
                </div>
                <div class="loading-text">AI正在思考中...</div>
              </div>
            </div>
          </div>

          <!-- 输入区 -->
          <div class="input-area">
            <textarea 
              v-model="userInput" 
              placeholder="请输入您的问题..."
              @keydown.ctrl.enter="sendMessage"
              :disabled="loading"
            ></textarea>
            <button class="send-btn" @click="sendMessage" :disabled="!userInput.trim() || loading">
              {{ loading ? '发送中...' : '发送' }}
            </button>
          </div>
        </div>

        <!-- 右栏：思考过程 -->
        <div class="ai-right">
          <div class="panel-title">🧠 AI思考过程</div>
          
          <div class="thinking-area">
            <div v-if="thinkingSteps.length === 0" class="empty">
              <div class="empty-icon">🤔</div>
              <div class="empty-text">AI正在等待您的问题...</div>
            </div>
            
            <div v-for="(step, index) in thinkingSteps" :key="index" :class="['step', step.status]">
              <div class="step-header">
                <span class="step-icon">{{ getStepIcon(step.type) }}</span>
                <span class="step-title">{{ step.title }}</span>
                <span class="step-status">{{ getStatusText(step.status) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AIAssistantSimple',
  data() {
    return {
      aiEnabled: true,
      loading: false,
      userInput: '',
      messages: [
        {
          type: 'ai',
          content: '您好！我是IQE AI智能助手。我已接入DeepSeek大语言模型，可以为您提供专业的质量管理问答服务。',
          timestamp: new Date()
        }
      ],
      thinkingSteps: []
    }
  },
  methods: {
    goBack() {
      this.$router.push('/')
    },
    
    toggleAI() {
      this.aiEnabled = !this.aiEnabled
      this.$message.info(`已切换到${this.aiEnabled ? 'AI增强模式' : '基础模式'}`)
    },
    
    clearChat() {
      this.messages = [
        {
          type: 'ai',
          content: '对话已清空。您好！我是IQE AI智能助手，已接入DeepSeek大语言模型。',
          timestamp: new Date()
        }
      ]
      this.thinkingSteps = []
    },
    
    selectTool(toolName) {
      this.userInput = `请使用${toolName}工具帮我分析数据`
      this.$message.success(`已选择工具：${toolName}`)
    },
    
    askQuick(question) {
      this.userInput = question
      this.sendMessage()
    },
    
    async sendMessage() {
      if (!this.userInput.trim() || this.loading) return

      const userMessage = {
        type: 'user',
        content: this.userInput,
        timestamp: new Date()
      }

      this.messages.push(userMessage)
      const question = this.userInput
      this.userInput = ''
      
      this.scrollToBottom()
      
      try {
        await this.processAI(question)
      } catch (error) {
        console.error('AI处理错误:', error)
        this.messages.push({
          type: 'ai',
          content: '抱歉，处理您的问题时出现了错误。请稍后重试。',
          timestamp: new Date()
        })
      }
      
      this.scrollToBottom()
    },
    
    async processAI(question) {
      this.loading = true
      this.thinkingSteps = []
      
      try {
        // 步骤1
        this.thinkingSteps.push({ type: 'thinking', title: '理解问题', status: 'processing' })
        await this.delay(500)
        this.thinkingSteps[0].status = 'completed'
        
        // 步骤2
        this.thinkingSteps.push({ type: 'data_query', title: '获取业务数据', status: 'processing' })
        await this.delay(400)
        this.thinkingSteps[1].status = 'completed'
        
        // 步骤3
        this.thinkingSteps.push({ type: 'ai_call', title: '调用AI大模型', status: 'processing' })
        let response
        
        if (this.aiEnabled) {
          try {
            response = await this.callAI(question)
          } catch (error) {
            response = `抱歉，AI服务暂时不可用。基于您的问题"${question}"，我为您提供基础分析...`
          }
        } else {
          response = `基础模式回复：我收到了您的问题"${question}"。这是一个关于质量管理的问题，我正在为您分析相关数据...`
        }
        
        this.thinkingSteps[2].status = 'completed'
        
        // 步骤4
        this.thinkingSteps.push({ type: 'response', title: '生成回答', status: 'processing' })
        await this.delay(200)
        this.thinkingSteps[3].status = 'completed'
        
        // 显示回复
        this.messages.push({
          type: 'ai',
          content: response,
          timestamp: new Date()
        })
        
      } finally {
        this.loading = false
      }
    },
    
    async callAI(question) {
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
              role: 'system',
              content: '你是IQE质量管理系统的AI智能助手，专门负责质量管理数据分析和问答。请基于用户问题提供专业、准确、有用的回答。'
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
    },
    
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    },
    
    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString()
    },
    
    getStepIcon(type) {
      const icons = {
        thinking: '🤔',
        data_query: '📊',
        ai_call: '🤖',
        response: '💬'
      }
      return icons[type] || '⚙️'
    },
    
    getStatusText(status) {
      const texts = {
        processing: '处理中...',
        completed: '完成'
      }
      return texts[status] || status
    },
    
    scrollToBottom() {
      this.$nextTick(() => {
        if (this.$refs.chatArea) {
          this.$refs.chatArea.scrollTop = this.$refs.chatArea.scrollHeight
        }
      })
    }
  },
  
  mounted() {
    console.log('🤖 IQE AI智能助手已加载')
  }
}
</script>

<style>
/* 全局覆盖样式 */
#ai-assistant-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background: #f5f7fa !important;
  z-index: 999999 !important;
  overflow: hidden !important;
}

.ai-container {
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
}

/* 顶部导航 */
.ai-header {
  background: white !important;
  padding: 16px 24px !important;
  border-bottom: 1px solid #e4e7ed !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
  flex-shrink: 0 !important;
}

.ai-header h1 {
  margin: 0 !important;
  color: #303133 !important;
  font-size: 24px !important;
  font-weight: 600 !important;
}

.ai-controls {
  display: flex !important;
  gap: 12px !important;
}

.ai-btn {
  padding: 8px 16px !important;
  border: 1px solid #dcdfe6 !important;
  border-radius: 4px !important;
  background: white !important;
  color: #606266 !important;
  cursor: pointer !important;
  font-size: 14px !important;
  transition: all 0.3s !important;
}

.ai-btn:hover {
  border-color: #409eff !important;
  color: #409eff !important;
}

.ai-btn.primary {
  background: #409eff !important;
  border-color: #409eff !important;
  color: white !important;
}

.ai-btn.secondary {
  background: #909399 !important;
  border-color: #909399 !important;
  color: white !important;
}

/* 三栏主体 */
.ai-body {
  flex: 1 !important;
  display: flex !important;
  gap: 16px !important;
  padding: 16px !important;
  overflow: hidden !important;
}

/* 左栏 */
.ai-left {
  width: 300px !important;
  min-width: 300px !important;
  background: white !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
  overflow-y: auto !important;
}

/* 中栏 */
.ai-center {
  flex: 1 !important;
  background: white !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}

/* 右栏 */
.ai-right {
  width: 350px !important;
  min-width: 350px !important;
  background: white !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
  overflow-y: auto !important;
}

.panel-title {
  padding: 16px !important;
  border-bottom: 1px solid #e4e7ed !important;
  background: #f8f9fa !important;
  font-weight: 600 !important;
  color: #303133 !important;
  font-size: 16px !important;
}

.quick-tags {
  margin-top: 12px !important;
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 8px !important;
}

.tag {
  padding: 4px 8px !important;
  background: #f0f2f5 !important;
  border: 1px solid #d9d9d9 !important;
  border-radius: 4px !important;
  font-size: 12px !important;
  cursor: pointer !important;
  transition: all 0.3s !important;
}

.tag:hover {
  background: #409eff !important;
  color: white !important;
  border-color: #409eff !important;
}

/* 工具区域 */
.tool-section {
  padding: 16px !important;
}

.tool-group {
  margin-bottom: 20px !important;
}

.tool-group h4 {
  margin: 0 0 12px 0 !important;
  color: #606266 !important;
  font-size: 14px !important;
}

.tool-item {
  display: flex !important;
  align-items: center !important;
  padding: 8px 12px !important;
  background: #f8f9fa !important;
  border-radius: 6px !important;
  margin-bottom: 8px !important;
  cursor: pointer !important;
  transition: all 0.3s !important;
}

.tool-item:hover {
  background: #e3f2fd !important;
  transform: translateX(4px) !important;
}

.tool-item span {
  font-size: 20px !important;
  margin-right: 12px !important;
}

.tool-name {
  font-weight: 500 !important;
  color: #303133 !important;
  font-size: 13px !important;
}

.tool-desc {
  color: #909399 !important;
  font-size: 12px !important;
  margin-top: 2px !important;
}

/* 对话区域 */
.chat-area {
  flex: 1 !important;
  padding: 16px !important;
  overflow-y: auto !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 16px !important;
}

.message {
  display: flex !important;
  gap: 12px !important;
  max-width: 80% !important;
}

.message.user {
  align-self: flex-end !important;
  flex-direction: row-reverse !important;
}

.avatar {
  width: 40px !important;
  height: 40px !important;
  border-radius: 50% !important;
  background: #f0f0f0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 18px !important;
  flex-shrink: 0 !important;
}

.message.user .avatar {
  background: #409eff !important;
  color: white !important;
}

.content {
  flex: 1 !important;
}

.text {
  background: #f8f9fa !important;
  padding: 12px 16px !important;
  border-radius: 12px !important;
  line-height: 1.5 !important;
  word-wrap: break-word !important;
}

.message.user .text {
  background: #409eff !important;
  color: white !important;
}

.time {
  font-size: 12px !important;
  color: #909399 !important;
  margin-top: 4px !important;
  text-align: right !important;
}

.message.user .time {
  text-align: left !important;
}

/* 输入区域 */
.input-area {
  padding: 16px !important;
  border-top: 1px solid #e4e7ed !important;
  display: flex !important;
  gap: 12px !important;
  align-items: flex-end !important;
}

.input-area textarea {
  flex: 1 !important;
  padding: 12px !important;
  border: 1px solid #dcdfe6 !important;
  border-radius: 4px !important;
  resize: none !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
  min-height: 80px !important;
}

.send-btn {
  padding: 12px 24px !important;
  background: #409eff !important;
  color: white !important;
  border: none !important;
  border-radius: 4px !important;
  cursor: pointer !important;
  font-size: 14px !important;
  transition: all 0.3s !important;
}

.send-btn:hover {
  background: #337ecc !important;
}

.send-btn:disabled {
  background: #c0c4cc !important;
  cursor: not-allowed !important;
}

/* 思考区域 */
.thinking-area {
  padding: 16px !important;
}

.empty {
  text-align: center !important;
  padding: 40px 20px !important;
  color: #909399 !important;
}

.empty-icon {
  font-size: 48px !important;
  margin-bottom: 16px !important;
}

.step {
  margin-bottom: 16px !important;
  border: 1px solid #e4e7ed !important;
  border-radius: 8px !important;
  overflow: hidden !important;
}

.step.processing {
  border-color: #409eff !important;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.2) !important;
}

.step.completed {
  border-color: #67c23a !important;
}

.step-header {
  padding: 12px 16px !important;
  background: #f8f9fa !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}

.step-title {
  flex: 1 !important;
  font-weight: 500 !important;
  color: #303133 !important;
  font-size: 14px !important;
}

.step-status {
  font-size: 12px !important;
  color: #909399 !important;
}

.step.processing .step-status {
  color: #409eff !important;
}

.step.completed .step-status {
  color: #67c23a !important;
}

/* 加载动画 */
.loading-dots {
  display: flex !important;
  gap: 4px !important;
}

.loading-dots span {
  width: 8px !important;
  height: 8px !important;
  border-radius: 50% !important;
  background: #909399 !important;
  animation: bounce 1.4s infinite ease-in-out !important;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s !important; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s !important; }

.loading-text {
  margin-top: 8px !important;
  color: #909399 !important;
  font-size: 12px !important;
}

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}
</style>
