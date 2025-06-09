<template>
  <div class="unified-assistant">
    <div class="assistant-header">
      <h3>IQE智能助手</h3>
      <div class="model-info">
        <span>{{ currentModel.name }}</span>
        <el-tag size="small" type="success">{{ currentModel.provider }}</el-tag>
      </div>
    </div>
    
    <div class="assistant-content">
      <div class="message-list" ref="messageList">
        <div v-for="(message, index) in messages" :key="index" 
             :class="['message', message.role === 'user' ? 'user' : 'assistant']">
          <div class="message-content">
            {{ message.content }}
          </div>
        </div>
      </div>
      
      <div class="input-area">
        <el-input
          v-model="userInput"
          type="textarea"
          :rows="2"
          placeholder="请输入您的问题..."
          @keyup.enter.ctrl="sendMessage"
        ></el-input>
        <el-button 
          type="primary" 
          @click="sendMessage" 
          :loading="isProcessing"
        >
          发送
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import aiService from '../../services/ai/AIService'

export default {
  name: 'UnifiedAssistant',
  
  setup() {
    const messages = ref([])
    const userInput = ref('')
    const isProcessing = ref(false)
    const messageList = ref(null)
    
    // 获取当前模型信息
    const currentModel = reactive(aiService.getCurrentModel())
    
    // 添加默认欢迎消息
    onMounted(() => {
      messages.value.push({
        role: 'assistant',
        content: '您好，我是IQE智能质量助手。请问有什么可以帮助您的？'
      })
    })
    
    // 发送消息方法
    const sendMessage = async () => {
      const message = userInput.value.trim()
      if (!message || isProcessing.value) return
      
      // 添加用户消息
      messages.value.push({
        role: 'user',
        content: message
      })
      
      // 清空输入框
      userInput.value = ''
      
      // 滚动到底部
      await nextTick()
      scrollToBottom()
      
      // 处理消息
      isProcessing.value = true
      
      try {
        // 获取历史消息上下文(最近5条)
        const context = messages.value
          .slice(-5)
          .filter(msg => msg.role !== 'assistant')
          .map(msg => ({ role: msg.role, content: msg.content }))
        
        // 系统提示词
        const systemPrompt = '你是IQE智能质检系统的助手。你可以帮助用户解答关于质量检验、物料管理、库存和生产的问题。提供简洁、专业的回答。'
        
        // 调用AI服务
        const response = await aiService.sendMessage(message, context, systemPrompt)
        
        // 添加AI响应
        if (response && response.content) {
          messages.value.push({
            role: 'assistant',
            content: response.content
          })
          
          // 滚动到底部
          await nextTick()
          scrollToBottom()
        } else {
          throw new Error('获取AI响应失败')
        }
      } catch (error) {
        console.error('发送消息错误:', error)
        ElMessage.error('发送消息失败，请稍后再试')
        
        messages.value.push({
          role: 'assistant',
          content: '抱歉，处理您的消息时出现了问题。请稍后再试。'
        })
      } finally {
        isProcessing.value = false
      }
    }
    
    // 滚动到底部
    const scrollToBottom = () => {
      if (messageList.value) {
        messageList.value.scrollTop = messageList.value.scrollHeight
      }
    }
    
    return {
      messages,
      userInput,
      isProcessing,
      currentModel,
      messageList,
      sendMessage
    }
  }
}
</script>

<style scoped>
.unified-assistant {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f9f9f9;
  border-radius: 8px;
  overflow: hidden;
}

.assistant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #fff;
  border-bottom: 1px solid #eaeaea;
}

.assistant-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.model-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.assistant-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 8px;
  word-break: break-word;
}

.message.user {
  align-self: flex-end;
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
}

.message.assistant {
  align-self: flex-start;
  background-color: #fff;
  border: 1px solid #eaeaea;
}

.input-area {
  padding: 16px;
  background-color: #fff;
  border-top: 1px solid #eaeaea;
  display: flex;
  gap: 12px;
}

.input-area .el-textarea {
  flex: 1;
}
</style>
