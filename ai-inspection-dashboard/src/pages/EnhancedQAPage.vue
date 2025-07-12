<template>
  <div class="enhanced-qa-page">
    <!-- 头部 -->
    <div class="qa-header">
      <h1>🤖 增强智能问答系统</h1>
      <p class="subtitle">支持动态卡片展示和无数据限制查询</p>
    </div>

    <!-- 主要内容区域 -->
    <div class="qa-main-content">
      <!-- 左侧规则面板 -->
      <div class="rules-panel">
        <h3>📋 查询规则</h3>
        <div class="rules-categories">
          <div 
            v-for="category in ruleCategories" 
            :key="category.name"
            class="rule-category"
          >
            <h4>{{ category.name }}</h4>
            <div class="rule-items">
              <div 
                v-for="rule in category.rules" 
                :key="rule.id"
                class="rule-item"
                @click="selectRule(rule)"
                :class="{ active: selectedRule?.id === rule.id }"
              >
                <span class="rule-name">{{ rule.name }}</span>
                <span class="rule-example">{{ rule.example }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间对话区域 -->
      <div class="chat-area">
        <!-- 消息列表 -->
        <div class="messages-container" ref="messagesContainer">
          <div 
            v-for="(message, index) in messages" 
            :key="index"
            class="message-item"
            :class="message.type"
          >
            <div class="message-content">
              <div class="message-header">
                <span class="sender">{{ message.type === 'user' ? '👤 您' : '🤖 QMS智能助手' }}</span>
                <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
              </div>
              
              <div class="message-body">
                <div v-if="message.type === 'user'" class="user-message">
                  {{ message.content }}
                </div>
                
                <div v-else class="bot-message">
                  <!-- 统计卡片区域 -->
                  <div v-if="message.cards && message.cards.length > 0" class="stats-cards-section">
                    <h4>📊 数据分析结果</h4>
                    <div class="stats-cards-grid">
                      <div 
                        v-for="(card, cardIndex) in message.cards" 
                        :key="cardIndex"
                        class="stat-card"
                        :class="card.type"
                        :style="{ borderColor: card.color }"
                      >
                        <div class="card-icon">{{ card.icon }}</div>
                        <div class="card-content">
                          <div class="card-value">{{ card.value }}</div>
                          <div class="card-title">{{ card.title }}</div>
                          <div class="card-subtitle">{{ card.subtitle }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- 回答内容 -->
                  <div class="answer-content" v-html="formatMessage(message.content)"></div>
                  
                  <!-- 数据详情 -->
                  <div v-if="message.dataCount > 0" class="data-summary">
                    <p><strong>📊 查询统计:</strong> 共找到 {{ message.dataCount }} 条记录</p>
                    <p><strong>🎯 场景类型:</strong> {{ getScenarioLabel(message.scenarioType) }}</p>
                    <p><strong>📋 匹配规则:</strong> {{ message.matchedRule }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 加载状态 -->
          <div v-if="isLoading" class="message-item bot loading">
            <div class="message-content">
              <div class="message-header">
                <span class="sender">🤖 QMS智能助手</span>
                <span class="timestamp">正在思考...</span>
              </div>
              <div class="message-body">
                <div class="loading-animation">
                  <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span class="loading-text">正在分析您的问题...</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-section">
          <div class="input-container">
            <input
              v-model="currentQuestion"
              @keyup.enter="handleSubmit"
              placeholder="请输入您的问题，例如：查询结构件类库存"
              class="question-input"
              :disabled="isLoading"
            />
            <button 
              @click="handleSubmit"
              class="submit-button"
              :disabled="isLoading || !currentQuestion.trim()"
            >
              <span v-if="isLoading">🔄</span>
              <span v-else>📤</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧信息面板 -->
      <div class="info-panel">
        <h3>ℹ️ 系统信息</h3>
        <div class="system-stats">
          <div class="stat-item">
            <span class="stat-label">规则总数:</span>
            <span class="stat-value">{{ totalRules }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">查询次数:</span>
            <span class="stat-value">{{ queryCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">成功率:</span>
            <span class="stat-value">{{ successRate }}%</span>
          </div>
        </div>

        <div class="feature-highlights">
          <h4>✨ 新功能特性</h4>
          <ul>
            <li>✅ 无数据限制查询</li>
            <li>✅ 动态场景识别</li>
            <li>✅ 智能统计卡片</li>
            <li>✅ 真实数据展示</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'

// 响应式数据
const messages = ref([])
const currentQuestion = ref('')
const isLoading = ref(false)
const selectedRule = ref(null)
const totalRules = ref(52)
const queryCount = ref(0)
const successRate = ref(95)

// 规则分类数据
const ruleCategories = ref([
  {
    name: '库存场景',
    rules: [
      { id: 1, name: '结构件类库存查询', example: '查询结构件类库存' },
      { id: 2, name: '供应商库存查询', example: '查询聚龙供应商库存' },
      { id: 3, name: '风险库存查询', example: '查询风险状态库存' }
    ]
  },
  {
    name: '测试场景',
    rules: [
      { id: 4, name: 'NG测试查询', example: '查询NG测试结果' },
      { id: 5, name: '项目测试查询', example: '查询X6827项目测试' }
    ]
  },
  {
    name: '上线场景',
    rules: [
      { id: 6, name: '物料上线查询', example: '查询LCD上线情况' },
      { id: 7, name: '不良率查询', example: '查询不良率超标物料' }
    ]
  }
])

// 方法
const selectRule = (rule) => {
  selectedRule.value = rule
  currentQuestion.value = rule.example
}

const handleSubmit = async () => {
  if (!currentQuestion.value.trim() || isLoading.value) return
  
  const question = currentQuestion.value.trim()
  
  // 添加用户消息
  messages.value.push({
    type: 'user',
    content: question,
    timestamp: new Date()
  })
  
  // 清空输入
  currentQuestion.value = ''
  isLoading.value = true
  queryCount.value++
  
  try {
    // 调用增强的智能问答API
    const response = await fetch('http://localhost:3002/api/intelligent-qa/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: question
      })
    })

    const result = await response.json()
    console.log('✅ API响应:', result)

    if (result.success) {
      // 添加机器人回复
      const botMessage = {
        type: 'bot',
        content: result.data.answer,
        cards: result.data.cards || [],
        scenarioType: result.data.scenarioType,
        dataCount: result.data.dataCount || 0,
        matchedRule: result.data.matchedRule,
        timestamp: new Date()
      }

      messages.value.push(botMessage)
    } else {
      messages.value.push({
        type: 'bot',
        content: result.data?.answer || '抱歉，处理您的问题时出现了错误。',
        timestamp: new Date()
      })
    }
  } catch (error) {
    console.error('❌ API调用失败:', error)
    messages.value.push({
      type: 'bot',
      content: '抱歉，系统暂时无法处理您的问题，请稍后再试。',
      timestamp: new Date()
    })
  } finally {
    isLoading.value = false
    await nextTick()
    scrollToBottom()
  }
}

const formatTime = (date) => {
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const formatMessage = (content) => {
  return content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
}

const getScenarioLabel = (scenarioType) => {
  const labels = {
    'inventory': '库存场景',
    'online': '上线场景',
    'testing': '测试场景',
    'general': '通用场景'
  }
  return labels[scenarioType] || scenarioType
}

const scrollToBottom = () => {
  const container = document.querySelector('.messages-container')
  if (container) {
    container.scrollTop = container.scrollHeight
  }
}

onMounted(() => {
  // 添加欢迎消息
  messages.value.push({
    type: 'bot',
    content: '👋 欢迎使用增强智能问答系统！我可以帮您查询库存、测试、上线等各种数据。请选择左侧规则或直接输入问题。',
    timestamp: new Date()
  })
})
</script>

<style scoped>
.enhanced-qa-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.qa-header {
  background: white;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.qa-header h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 24px;
}

.subtitle {
  margin: 5px 0 0 0;
  color: #7f8c8d;
  font-size: 14px;
}

.qa-main-content {
  flex: 1;
  display: flex;
  gap: 20px;
  padding: 20px;
  overflow: hidden;
}

/* 左侧规则面板 */
.rules-panel {
  width: 300px;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow-y: auto;
}

.rules-panel h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.rule-category {
  margin-bottom: 20px;
}

.rule-category h4 {
  margin: 0 0 10px 0;
  color: #34495e;
  font-size: 14px;
  border-bottom: 1px solid #ecf0f1;
  padding-bottom: 5px;
}

.rule-item {
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 5px;
  border: 1px solid transparent;
}

.rule-item:hover {
  background: #f8f9fa;
  border-color: #3498db;
}

.rule-item.active {
  background: #e3f2fd;
  border-color: #2196f3;
}

.rule-name {
  display: block;
  font-weight: 500;
  color: #2c3e50;
  font-size: 13px;
}

.rule-example {
  display: block;
  color: #7f8c8d;
  font-size: 12px;
  margin-top: 2px;
}

/* 中间对话区域 */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.messages-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.message-item {
  margin-bottom: 20px;
}

.message-content {
  max-width: 80%;
}

.message-item.user .message-content {
  margin-left: auto;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.sender {
  font-weight: 500;
  color: #2c3e50;
}

.timestamp {
  font-size: 12px;
  color: #95a5a6;
}

.user-message {
  background: #3498db;
  color: white;
  padding: 12px 16px;
  border-radius: 18px 18px 4px 18px;
  word-wrap: break-word;
}

.bot-message {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 18px 18px 18px 4px;
  border-left: 4px solid #3498db;
}

/* 统计卡片样式 */
.stats-cards-section {
  margin-bottom: 20px;
}

.stats-cards-section h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 16px;
}

.stats-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-left: 4px solid #3498db;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.stat-card.info {
  border-left-color: #3498db;
}

.stat-card.success {
  border-left-color: #27ae60;
}

.stat-card.warning {
  border-left-color: #f39c12;
}

.stat-card.danger {
  border-left-color: #e74c3c;
}

.card-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  line-height: 1;
}

.card-title {
  font-size: 14px;
  color: #34495e;
  margin: 4px 0 2px 0;
}

.card-subtitle {
  font-size: 12px;
  color: #7f8c8d;
}

.answer-content {
  line-height: 1.6;
  color: #2c3e50;
}

.data-summary {
  margin-top: 15px;
  padding: 12px;
  background: #ecf0f1;
  border-radius: 6px;
  font-size: 13px;
}

.data-summary p {
  margin: 4px 0;
}

/* 加载动画 */
.loading-animation {
  display: flex;
  align-items: center;
  gap: 10px;
}

.loading-dots {
  display: flex;
  gap: 4px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3498db;
  animation: loading 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes loading {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.loading-text {
  color: #7f8c8d;
  font-size: 14px;
}

/* 输入区域 */
.input-section {
  padding: 20px;
  border-top: 1px solid #ecf0f1;
  background: #f8f9fa;
}

.input-container {
  display: flex;
  gap: 10px;
}

.question-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 25px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s ease;
}

.question-input:focus {
  border-color: #3498db;
}

.submit-button {
  padding: 12px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s ease;
}

.submit-button:hover:not(:disabled) {
  background: #2980b9;
}

.submit-button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

/* 右侧信息面板 */
.info-panel {
  width: 250px;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.info-panel h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.system-stats {
  margin-bottom: 30px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #ecf0f1;
}

.stat-label {
  color: #7f8c8d;
  font-size: 13px;
}

.stat-value {
  color: #2c3e50;
  font-weight: 500;
  font-size: 13px;
}

.feature-highlights h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 14px;
}

.feature-highlights ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-highlights li {
  padding: 5px 0;
  color: #27ae60;
  font-size: 13px;
}
</style>
