<template>
  <div class="simple-qa">
    <h1>🤖 简单问答测试</h1>
    
    <!-- 状态显示 -->
    <div class="status">
      <p>输入内容: "{{ userInput }}"</p>
      <p>消息数量: {{ messages.length }}</p>
      <p>页面状态: {{ status }}</p>
    </div>
    
    <!-- 消息列表 -->
    <div class="messages">
      <div 
        v-for="(msg, index) in messages" 
        :key="index"
        :class="['message', msg.type]"
      >
        <strong>{{ msg.type === 'user' ? '用户' : '助手' }}:</strong>
        {{ msg.text }}
      </div>
    </div>
    
    <!-- 输入区域 -->
    <div class="input-area">
      <input 
        v-model="userInput"
        @keyup.enter="sendMessage"
        placeholder="请输入您的问题..."
        class="input-box"
      />
      <button @click="sendMessage" :disabled="!userInput.trim()">
        发送
      </button>
      <button @click="testFunction">
        测试
      </button>
      <button @click="clearMessages">
        清空
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 响应式数据
const userInput = ref('')
const status = ref('页面已加载')
const messages = ref([
  { type: 'assistant', text: '您好！这是简单问答测试页面。' }
])

// 发送消息函数
const sendMessage = () => {
  console.log('🚀 sendMessage 被调用')
  console.log('📝 用户输入:', userInput.value)
  
  const text = userInput.value.trim()
  if (!text) {
    console.log('❌ 输入为空')
    return
  }
  
  try {
    // 添加用户消息
    messages.value.push({ type: 'user', text })
    console.log('✅ 用户消息已添加')
    
    // 清空输入
    const question = userInput.value
    userInput.value = ''
    
    // 生成回复
    let reply = ''
    const input = text.toLowerCase()
    
    if (input.includes('库存')) {
      reply = '📦 库存查询结果：当前库存状态良好，共132个物料批次。'
    } else if (input.includes('质量')) {
      reply = '🔍 质量分析结果：整体质量稳定，测试通过率91.5%。'
    } else if (input.includes('供应商')) {
      reply = '🏢 供应商分析结果：主要供应商表现良好，合作稳定。'
    } else if (input.includes('测试')) {
      reply = '🧪 测试结果：问答功能正常工作，系统运行稳定。'
    } else {
      reply = `💡 我收到了您的问题："${question}"。这是一个简单的问答测试回复。`
    }
    
    // 添加助手回复
    messages.value.push({ type: 'assistant', text: reply })
    console.log('✅ 助手回复已添加')
    
    status.value = '消息发送成功'
    
  } catch (error) {
    console.error('❌ 发送消息失败:', error)
    status.value = '发送失败: ' + error.message
  }
}

// 测试函数
const testFunction = () => {
  console.log('🧪 测试函数被调用')
  userInput.value = '测试问答功能'
  sendMessage()
}

// 清空消息
const clearMessages = () => {
  console.log('🗑️ 清空消息')
  messages.value = [
    { type: 'assistant', text: '消息已清空。您好！这是简单问答测试页面。' }
  ]
  status.value = '消息已清空'
}

// 页面加载时
console.log('🚀 简单问答页面已加载')
status.value = '页面初始化完成'
</script>

<style scoped>
.simple-qa {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.status {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.status p {
  margin: 5px 0;
  font-family: monospace;
}

.messages {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.message {
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 8px;
}

.message.user {
  background: #dbeafe;
  text-align: right;
}

.message.assistant {
  background: #f0fdf4;
}

.input-area {
  display: flex;
  gap: 10px;
  align-items: center;
}

.input-box {
  flex: 1;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

button {
  padding: 10px 15px;
  border: none;
  border-radius: 6px;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background: #2563eb;
}

button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
</style>
