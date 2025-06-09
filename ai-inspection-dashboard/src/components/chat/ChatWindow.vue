<!-- ChatWindow Component -->
<template>
  <div class="chat-window-container">
    <div class="chat-messages" ref="messagesContainer">
      <!-- 欢迎消息 -->
      <div v-if="welcomeMessage" class="message system-message">
        <div class="message-content">{{ welcomeMessage }}</div>
      </div>
      
      <!-- 消息列表 -->
      <div 
        v-for="(message, index) in messages" 
        :key="index" 
        :class="['message', message.type === 'user' ? 'user-message' : 'ai-message']"
      >
        <div class="message-header">
          <div class="avatar">
            <el-avatar :size="32" :icon="message.type === 'user' ? 'el-icon-user' : 'el-icon-s-help'">
              {{ message.type === 'user' ? '我' : 'AI' }}
            </el-avatar>
          </div>
          <div class="message-info">
            <div class="message-sender">
              {{ message.type === 'user' ? '我' : 'AI助手' }}
            </div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>
        <div class="message-content" v-html="message.content"></div>
      </div>
      
      <!-- 加载中提示 -->
      <div v-if="isLoading" class="message ai-message loading">
        <div class="message-content">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="chat-input">
      <el-input
        v-model="inputMessage"
        type="textarea"
        :rows="2"
        placeholder="请输入您的问题..."
        @keyup.enter.native.ctrl="sendMessage"
        resize="none"
      ></el-input>
      <div class="input-actions">
        <el-button-group>
          <el-tooltip content="上传图片">
            <el-button 
              circle 
              icon="el-icon-picture"
              @click="triggerImageUpload"
            ></el-button>
          </el-tooltip>
          <el-tooltip content="语音输入">
            <el-button 
              circle 
              :icon="isSpeechActive ? 'el-icon-microphone' : 'el-icon-mic'"
              :class="{ 'speech-active': isSpeechActive }"
              @click="toggleSpeech"
            ></el-button>
          </el-tooltip>
        </el-button-group>
        <el-button type="primary" @click="sendMessage" :disabled="!inputMessage.trim()">发送</el-button>
      </div>
      <input 
        type="file" 
        ref="imageInput" 
        accept="image/*" 
        style="display: none" 
        @change="onImageSelected"
      >
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatWindow',
  
  props: {
    welcomeMessage: {
      type: String,
      default: '您好！我是IQE智能助手，有什么可以帮助您的？'
    },
    contextMemory: {
      type: Boolean,
      default: true
    },
    maxContextMessages: {
      type: Number,
      default: 10
    }
  },
  
  data() {
    return {
      messages: [],
      inputMessage: '',
      isLoading: false,
      isSpeechActive: false,
      speechRecognition: null
    };
  },
  
  methods: {
    sendMessage() {
      if (!this.inputMessage.trim()) return;
      
      // 添加用户消息
      const userMessage = {
        type: 'user',
        content: this.inputMessage,
        timestamp: new Date()
      };
      
      this.messages.push(userMessage);
      
      // 发出事件
      this.$emit('send-message', this.inputMessage, this.getContextMessages());
      
      // 清空输入
      this.inputMessage = '';
      
      // 显示加载状态
      this.isLoading = true;
      
      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    
    receiveMessage(message) {
      // 添加AI响应消息
      this.isLoading = false;
      
      const aiMessage = {
        type: 'ai',
        content: message,
        timestamp: new Date()
      };
      
      this.messages.push(aiMessage);
      
      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    
    scrollToBottom() {
      if (this.$refs.messagesContainer) {
        this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight;
      }
    },
    
    getContextMessages() {
      if (!this.contextMemory) return [];
      
      // 返回最近几条消息作为上下文
      return this.messages.slice(-this.maxContextMessages);
    },
    
    formatTime(timestamp) {
      if (!timestamp) return '';
      
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    
    triggerImageUpload() {
      this.$refs.imageInput.click();
    },
    
    onImageSelected(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      this.$emit('image-upload', file);
      
      // 清空文件选择，以便再次选择同一文件
      event.target.value = '';
    },
    
    toggleSpeech() {
      if (this.isSpeechActive) {
        this.stopSpeechRecognition();
      } else {
        this.startSpeechRecognition();
      }
    },
    
    startSpeechRecognition() {
      // 检查浏览器支持
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.error('当前浏览器不支持语音识别');
        return;
      }
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.speechRecognition = new SpeechRecognition();
      
      this.speechRecognition.lang = 'zh-CN';
      this.speechRecognition.continuous = true;
      this.speechRecognition.interimResults = true;
      
      this.speechRecognition.onstart = () => {
        this.isSpeechActive = true;
        this.$emit('speech-start');
      };
      
      this.speechRecognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        
        this.inputMessage = transcript;
      };
      
      this.speechRecognition.onerror = (event) => {
        console.error('语音识别错误:', event.error);
        this.stopSpeechRecognition();
      };
      
      this.speechRecognition.onend = () => {
        this.isSpeechActive = false;
        this.$emit('speech-end');
      };
      
      this.speechRecognition.start();
    },
    
    stopSpeechRecognition() {
      if (this.speechRecognition) {
        this.speechRecognition.stop();
        this.speechRecognition = null;
      }
      
      this.isSpeechActive = false;
    },
    
    clearMessages() {
      this.messages = [];
    }
  }
};
</script>

<style scoped>
.chat-window-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 8px;
  background-color: var(--el-bg-color);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  flex-direction: column;
  max-width: 85%;
  gap: 8px;
}

.user-message {
  align-self: flex-end;
}

.ai-message {
  align-self: flex-start;
}

.system-message {
  align-self: center;
  width: 80%;
  text-align: center;
  opacity: 0.8;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.message-info {
  display: flex;
  flex-direction: column;
}

.message-sender {
  font-weight: bold;
  font-size: 14px;
}

.message-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.message-content {
  background-color: var(--el-color-info-light-9);
  padding: 10px 14px;
  border-radius: 8px;
  word-break: break-word;
  white-space: pre-wrap;
}

.user-message .message-content {
  background-color: var(--el-color-primary-light-8);
}

.chat-input {
  padding: 16px;
  border-top: 1px solid var(--el-border-color-light);
}

.input-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
}

.typing-indicator {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--el-color-primary);
  opacity: 0.6;
  display: inline-block;
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

.speech-active {
  background-color: var(--el-color-danger) !important;
  color: white !important;
}

@keyframes typing {
  0%, 80%, 100% { transform: scale(0.6); }
  40% { transform: scale(1); }
}
</style>
