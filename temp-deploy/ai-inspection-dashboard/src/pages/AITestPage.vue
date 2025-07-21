<template>
  <div class="ai-test-page">
    <h1>🤖 AI功能测试页面</h1>
    
    <!-- 状态显示 -->
    <div class="status-section">
      <el-card>
        <h3>📊 AI服务状态</h3>
        <p><strong>服务状态:</strong> {{ aiStatus }}</p>
        <p><strong>API连接:</strong> {{ connectionStatus }}</p>
        <p><strong>最后测试:</strong> {{ lastTestTime }}</p>
        
        <div class="test-buttons">
          <el-button @click="testAIService" type="primary" :loading="testing">
            🔗 测试AI连接
          </el-button>
          <el-button @click="testDirectAPI" type="success" :loading="testing">
            🧪 直接测试API
          </el-button>
          <el-button @click="clearLogs" type="warning">
            🗑️ 清空日志
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 简单对话测试 -->
    <div class="chat-section">
      <el-card>
        <h3>💬 AI对话测试</h3>
        
        <div class="chat-messages">
          <div 
            v-for="(msg, index) in chatMessages" 
            :key="index"
            :class="['chat-message', msg.type]"
          >
            <div class="message-header">
              <strong>{{ msg.type === 'user' ? '👤 用户' : '🤖 AI' }}</strong>
              <span class="timestamp">{{ msg.timestamp }}</span>
            </div>
            <div class="message-content">{{ msg.content }}</div>
          </div>
        </div>
        
        <div class="chat-input">
          <el-input
            v-model="testMessage"
            placeholder="输入测试消息..."
            @keyup.enter="sendTestMessage"
            :disabled="sending"
          />
          <el-button 
            @click="sendTestMessage" 
            type="primary" 
            :loading="sending"
            :disabled="!testMessage.trim()"
          >
            发送
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 调试日志 -->
    <div class="log-section">
      <el-card>
        <h3>📋 调试日志</h3>
        <div class="log-container">
          <div 
            v-for="(log, index) in debugLogs" 
            :key="index"
            :class="['log-item', log.level]"
          >
            <span class="log-time">{{ log.time }}</span>
            <span class="log-level">{{ log.level.toUpperCase() }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElCard, ElButton, ElInput, ElMessage } from 'element-plus'
import { aiService } from '../utils/aiService.js'

// 响应式数据
const aiStatus = ref('未知')
const connectionStatus = ref('未测试')
const lastTestTime = ref('从未')
const testing = ref(false)
const sending = ref(false)
const testMessage = ref('')
const chatMessages = ref([])
const debugLogs = ref([])

// 添加日志
const addLog = (level, message) => {
  const now = new Date()
  debugLogs.value.push({
    time: now.toLocaleTimeString(),
    level,
    message
  })
  
  // 限制日志数量
  if (debugLogs.value.length > 100) {
    debugLogs.value = debugLogs.value.slice(-50)
  }
  
  console.log(`[${level.toUpperCase()}] ${message}`)
}

// 测试AI服务
const testAIService = async () => {
  testing.value = true
  addLog('info', '开始测试AI服务...')
  
  try {
    addLog('info', `AI服务实例: ${!!aiService}`)
    
    if (!aiService) {
      throw new Error('AI服务未加载')
    }
    
    addLog('info', '调用testConnection方法...')
    const result = await aiService.testConnection()
    
    if (result) {
      aiStatus.value = '正常'
      connectionStatus.value = '连接成功'
      addLog('success', 'AI服务连接测试成功')
      ElMessage.success('✅ AI服务连接成功!')
    } else {
      aiStatus.value = '异常'
      connectionStatus.value = '连接失败'
      addLog('error', 'AI服务连接测试失败')
      ElMessage.error('❌ AI服务连接失败')
    }
    
  } catch (error) {
    aiStatus.value = '错误'
    connectionStatus.value = '测试异常'
    addLog('error', `AI服务测试异常: ${error.message}`)
    ElMessage.error(`测试失败: ${error.message}`)
  } finally {
    testing.value = false
    lastTestTime.value = new Date().toLocaleTimeString()
  }
}

// 直接测试API
const testDirectAPI = async () => {
  testing.value = true
  addLog('info', '开始直接测试DeepSeek API...')
  
  try {
    const apiKey = 'sk-cab797574abf4288bcfaca253191565d'
    const apiURL = 'https://api.deepseek.com/chat/completions'
    
    addLog('info', `API地址: ${apiURL}`)
    addLog('info', `API密钥长度: ${apiKey.length}`)
    
    const response = await fetch(apiURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'user', content: 'Hello, this is a test message.' }
        ],
        max_tokens: 50
      })
    })
    
    addLog('info', `响应状态: ${response.status} ${response.statusText}`)
    
    if (response.ok) {
      const data = await response.json()
      addLog('success', '直接API测试成功')
      addLog('info', `响应内容: ${data.choices[0].message.content}`)
      ElMessage.success('✅ 直接API测试成功!')
      
      connectionStatus.value = '直接连接成功'
    } else {
      const errorData = await response.json().catch(() => ({}))
      addLog('error', `API错误: ${JSON.stringify(errorData)}`)
      ElMessage.error('❌ 直接API测试失败')
      
      connectionStatus.value = '直接连接失败'
    }
    
  } catch (error) {
    addLog('error', `直接API测试异常: ${error.message}`)
    ElMessage.error(`直接测试失败: ${error.message}`)
    connectionStatus.value = '直接测试异常'
  } finally {
    testing.value = false
    lastTestTime.value = new Date().toLocaleTimeString()
  }
}

// 发送测试消息
const sendTestMessage = async () => {
  if (!testMessage.value.trim() || sending.value) return
  
  const userMessage = testMessage.value.trim()
  testMessage.value = ''
  
  // 添加用户消息
  chatMessages.value.push({
    type: 'user',
    content: userMessage,
    timestamp: new Date().toLocaleTimeString()
  })
  
  sending.value = true
  addLog('info', `发送消息: ${userMessage}`)
  
  try {
    if (!aiService) {
      throw new Error('AI服务未加载')
    }
    
    const messages = [
      { role: 'user', content: userMessage }
    ]
    
    addLog('info', '调用AI服务chat方法...')
    const response = await aiService.chat(messages)
    
    if (response && response.choices && response.choices[0]) {
      const aiReply = response.choices[0].message.content
      
      // 添加AI回复
      chatMessages.value.push({
        type: 'ai',
        content: aiReply,
        timestamp: new Date().toLocaleTimeString()
      })
      
      addLog('success', `AI回复: ${aiReply.substring(0, 50)}...`)
    } else {
      throw new Error('AI响应格式异常')
    }
    
  } catch (error) {
    addLog('error', `发送消息失败: ${error.message}`)
    
    // 添加错误消息
    chatMessages.value.push({
      type: 'ai',
      content: `❌ 错误: ${error.message}`,
      timestamp: new Date().toLocaleTimeString()
    })
    
    ElMessage.error(`发送失败: ${error.message}`)
  } finally {
    sending.value = false
  }
}

// 清空日志
const clearLogs = () => {
  debugLogs.value = []
  chatMessages.value = []
  addLog('info', '日志已清空')
}

// 页面加载时
onMounted(() => {
  addLog('info', 'AI测试页面已加载')
  addLog('info', `AI服务状态: ${!!aiService}`)
  
  // 自动测试连接
  setTimeout(() => {
    testAIService()
  }, 1000)
})
</script>

<style scoped>
.ai-test-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.status-section, .chat-section, .log-section {
  margin-bottom: 20px;
}

.test-buttons {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.chat-messages {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 15px;
}

.chat-message {
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 6px;
}

.chat-message.user {
  background: #e3f2fd;
  margin-left: 20%;
}

.chat-message.ai {
  background: #f1f8e9;
  margin-right: 20%;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 14px;
}

.timestamp {
  color: #666;
  font-size: 12px;
}

.chat-input {
  display: flex;
  gap: 10px;
}

.chat-input .el-input {
  flex: 1;
}

.log-container {
  max-height: 400px;
  overflow-y: auto;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 10px;
  font-family: monospace;
  font-size: 12px;
}

.log-item {
  margin-bottom: 5px;
  display: flex;
  gap: 10px;
}

.log-time {
  color: #666;
  min-width: 80px;
}

.log-level {
  min-width: 60px;
  font-weight: bold;
}

.log-level.info { color: #2196f3; }
.log-level.success { color: #4caf50; }
.log-level.error { color: #f44336; }
.log-level.warning { color: #ff9800; }

.log-message {
  flex: 1;
}
</style>
