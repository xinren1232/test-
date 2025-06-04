<template>
  <div class="chat-window">
    <!-- 对话区域 -->
    <div class="messages-container" ref="messagesContainer">
      <!-- 欢迎信息 -->
      <div v-if="welcomeMessage" class="message-item system-message">
        <div class="message-avatar">
          <el-avatar :size="40" :src="botAvatar" />
        </div>
        <div class="message-content">
          <div class="message-bubble">
            <div class="message-text" v-html="renderMarkdown(welcomeMessage)"></div>
          </div>
          <div class="message-time">{{ formattedTime(Date.now()) }}</div>
        </div>
      </div>
      
      <!-- 对话消息 -->
      <div 
        v-for="(message, index) in messages" 
        :key="index"
        :class="['message-item', message.role === 'user' ? 'user-message' : 'bot-message']"
      >
        <!-- 消息头像 -->
        <div class="message-avatar">
          <el-avatar 
            :size="40" 
            :src="message.role === 'user' ? userAvatar : botAvatar" 
          />
        </div>
        
        <!-- 消息内容 -->
        <div class="message-content">
          <div class="message-bubble">
            <!-- 消息类型：文本 -->
            <div 
              v-if="message.type === 'text'" 
              class="message-text"
              v-html="renderMarkdown(message.content)"
            ></div>
            
            <!-- 消息类型：图表 -->
            <div v-else-if="message.type === 'chart'" class="message-chart">
              <div class="chart-title" v-if="message.chartTitle">{{ message.chartTitle }}</div>
              <div :id="`chart-${index}`" class="chart-container" :style="{ height: '300px' }"></div>
            </div>
            
            <!-- 消息类型：图片 -->
            <div v-else-if="message.type === 'image'" class="message-image">
              <el-image 
                :src="message.content" 
                :preview-src-list="[message.content]"
                fit="contain"
                :alt="message.alt || '图片'"
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><el-icon-picture /></el-icon>
                    <span>加载失败</span>
                  </div>
                </template>
              </el-image>
              <div v-if="message.caption" class="image-caption">{{ message.caption }}</div>
            </div>
            
            <!-- 消息类型：文件 -->
            <div v-else-if="message.type === 'file'" class="message-file">
              <el-button type="primary" size="small" @click="downloadFile(message.content, message.fileName)">
                <el-icon><el-icon-document /></el-icon>
                下载{{ message.fileName }}
              </el-button>
            </div>
            
            <!-- 消息类型：加载中 -->
            <div v-else-if="message.type === 'loading'" class="message-loading">
              <div class="loading-dots">
                <div class="dot dot1"></div>
                <div class="dot dot2"></div>
                <div class="dot dot3"></div>
              </div>
            </div>
            
            <!-- 消息类型：错误 -->
            <div v-else-if="message.type === 'error'" class="message-error">
              <el-icon><el-icon-warning /></el-icon>
              <span>{{ message.content }}</span>
            </div>
          </div>
          
          <!-- 消息时间 -->
          <div class="message-time">{{ formattedTime(message.timestamp) }}</div>
          
          <!-- 消息操作按钮 -->
          <div class="message-actions" v-if="message.role === 'assistant' && message.type !== 'loading'">
            <el-tooltip content="复制内容" placement="top">
              <el-button size="small" circle @click="copyMessage(message.content)">
                <el-icon><el-icon-document-copy /></el-icon>
              </el-button>
            </el-tooltip>
            
            <el-tooltip content="朗读内容" placement="top" v-if="message.type === 'text'">
              <el-button size="small" circle @click="speakMessage(message.content)">
                <el-icon><el-icon-headset /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </div>
      </div>
      
      <!-- 新消息指示 -->
      <div v-show="showNewMessageIndicator" class="new-message-indicator" @click="scrollToBottom">
        <el-icon><el-icon-caret-bottom /></el-icon>
        新消息
      </div>
    </div>
    
    <!-- 输入区域 -->
    <div class="input-container">
      <div class="input-tools">
        <el-tooltip content="上传图片" placement="top">
          <el-button type="text" @click="triggerImageUpload">
            <el-icon><el-icon-picture-outline /></el-icon>
          </el-button>
        </el-tooltip>
        
        <el-tooltip content="语音输入" placement="top" v-if="speechSupported">
          <el-button 
            type="text" 
            :class="{ active: isListening }" 
            @click="toggleVoiceInput"
          >
            <el-icon><el-icon-microphone /></el-icon>
          </el-button>
        </el-tooltip>
        
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          style="display: none"
          @change="handleFileChange"
        />
      </div>
      
      <el-input
        v-model="inputMessage"
        type="textarea"
        :rows="2"
        resize="none"
        placeholder="输入您的问题..."
        @keyup.enter.ctrl="sendMessage"
      />
      
      <div class="input-actions">
        <el-button 
          type="primary" 
          :disabled="!inputMessage.trim() && !isUploading" 
          :loading="isUploading || isSending"
          @click="sendMessage"
        >
          发送
        </el-button>
      </div>
    </div>
    
    <!-- 语音识别状态提示 -->
    <div v-if="isListening" class="voice-indicator">
      <div class="voice-wave">
        <div class="wave-bar" v-for="i in 5" :key="i"></div>
      </div>
      <span>正在聆听...</span>
      <el-button size="small" type="danger" @click="stopVoiceInput">
        停止
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';

// Props
const props = defineProps({
  welcomeMessage: {
    type: String,
    default: '您好，我是IQE智能助手，有什么可以帮您?'
  },
  userAvatar: {
    type: String,
    default: '/src/assets/user-avatar.png'
  },
  botAvatar: {
    type: String,
    default: '/src/assets/bot-avatar.png'
  },
  contextMemory: {
    type: Boolean,
    default: true
  },
  maxContextMessages: {
    type: Number,
    default: 10
  }
});

// Emits
const emit = defineEmits([
  'send-message', 
  'clear-chat', 
  'speech-start',
  'speech-end',
  'image-upload'
]);

// 状态变量
const messages = ref([]);
const inputMessage = ref('');
const messagesContainer = ref(null);
const isListening = ref(false);
const isSending = ref(false);
const isUploading = ref(false);
const showNewMessageIndicator = ref(false);
const fileInput = ref(null);
const speechSupported = ref(false);
const recognition = ref(null);
const chartInstances = reactive({});

// 检查浏览器对语音识别的支持
onMounted(() => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    speechSupported.value = true;
    setupSpeechRecognition();
  }
  
  // 监听滚动
  if (messagesContainer.value) {
    messagesContainer.value.addEventListener('scroll', checkScroll);
  }
  
  // 初始化图表
  initCharts();
});

// 组件卸载时的清理
onUnmounted(() => {
  if (messagesContainer.value) {
    messagesContainer.value.removeEventListener('scroll', checkScroll);
  }
  
  // 销毁图表实例
  Object.values(chartInstances).forEach(chart => {
    chart.dispose();
  });
  
  // 停止语音识别
  stopVoiceInput();
});

// 监听消息变化，自动滚动到底部
watch(messages, () => {
  nextTick(() => {
    scrollToBottom();
    // 初始化任何新添加的图表
    initCharts();
  });
}, { deep: true });

// 设置语音识别
function setupSpeechRecognition() {
  try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition.value = new SpeechRecognition();
    recognition.value.continuous = true;
    recognition.value.interimResults = true;
    recognition.value.lang = 'zh-CN'; // 默认中文
    
    recognition.value.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }
      
      if (transcript) {
        inputMessage.value += transcript;
      }
    };
    
    recognition.value.onend = () => {
      isListening.value = false;
    };
    
    recognition.value.onerror = (event) => {
      console.error('语音识别错误：', event.error);
      isListening.value = false;
      ElMessage.error('语音识别出错');
    };
  } catch (error) {
    console.error('设置语音识别失败：', error);
    speechSupported.value = false;
  }
}

// 格式化时间
function formattedTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// 渲染文本（简易版本，替换marked和DOMPurify）
function renderMarkdown(text) {
  if (!text) return '';
  
  // 简单的文本处理：转换换行、链接和加粗
  let processed = text
    .replace(/\n/g, '<br>') // 处理换行
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // 处理加粗
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // 处理斜体
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>'); // 处理链接
    
  // 处理标题
  processed = processed
    .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
    .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    
  return processed;
}

// 发送消息
async function sendMessage() {
  const message = inputMessage.value.trim();
  if (!message && !isUploading.value) return;
  
  // 添加用户消息
  const userMessage = {
    role: 'user',
    type: 'text',
    content: message,
    timestamp: Date.now()
  };
  messages.value.push(userMessage);
  
  // 清空输入
  inputMessage.value = '';
  
  // 添加加载中的消息
  const loadingMessageIndex = messages.value.length;
  messages.value.push({
    role: 'assistant',
    type: 'loading',
    content: '',
    timestamp: Date.now()
  });
  
  // 发射事件，包括上下文历史
  isSending.value = true;
  try {
    // 获取上下文历史（如果启用）
    const contextHistory = props.contextMemory 
      ? messages.value
          .filter(m => m.type !== 'loading' && m.type !== 'error')
          .slice(-(props.maxContextMessages * 2))
      : [];
    
    const response = await new Promise((resolve) => {
      emit('send-message', message, contextHistory, resolve);
    });
    
    // 移除加载消息
    messages.value.splice(loadingMessageIndex, 1);
    
    // 添加响应消息
    if (response) {
      if (typeof response === 'string') {
        // 文本响应
        messages.value.push({
          role: 'assistant',
          type: 'text',
          content: response,
          timestamp: Date.now()
        });
      } else if (typeof response === 'object') {
        // 复杂响应（图表、图像等）
        messages.value.push({
          role: 'assistant',
          type: response.type || 'text',
          content: response.content,
          timestamp: Date.now(),
          ...(response.type === 'chart' && { chartData: response.chartData, chartTitle: response.title }),
          ...(response.type === 'image' && { alt: response.alt, caption: response.caption }),
          ...(response.type === 'file' && { fileName: response.fileName })
        });
      }
    } else {
      // 处理空响应
      messages.value.push({
        role: 'assistant',
        type: 'error',
        content: '抱歉，我无法生成回复。',
        timestamp: Date.now()
      });
    }
  } catch (error) {
    console.error('发送消息错误：', error);
    
    // 移除加载消息
    messages.value.splice(loadingMessageIndex, 1);
    
    // 添加错误消息
    messages.value.push({
      role: 'assistant',
      type: 'error',
      content: '发送消息时出错：' + error.message,
      timestamp: Date.now()
    });
  } finally {
    isSending.value = false;
    nextTick(() => {
      initCharts();
    });
  }
}

// 初始化图表
function initCharts() {
  nextTick(() => {
    messages.value.forEach((message, index) => {
      if (message.type === 'chart') {
        const chartContainer = document.getElementById(`chart-${index}`);
        if (chartContainer) {
          // 如果已有图表实例，先销毁
          if (chartInstances[`chart-${index}`]) {
            chartInstances[`chart-${index}`].dispose();
          }
          
          // 创建新图表
          chartInstances[`chart-${index}`] = echarts.init(chartContainer);
          
          // 设置图表配置
          if (message.chartData) {
            chartInstances[`chart-${index}`].setOption(message.chartData);
          }
        }
      }
    });
  });
}

// 检查滚动位置
function checkScroll() {
  if (!messagesContainer.value) return;
  
  const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value;
  const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
  
  showNewMessageIndicator.value = !isAtBottom && messages.value.length > 0;
}

// 滚动到底部
function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    showNewMessageIndicator.value = false;
  }
}

// 复制消息内容
function copyMessage(content) {
  if (!content) return;
  
  // 如果是HTML内容，提取纯文本
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  const textContent = tempDiv.textContent || tempDiv.innerText || content;
  
  navigator.clipboard.writeText(textContent)
    .then(() => {
      ElMessage.success('内容已复制到剪贴板');
    })
    .catch(err => {
      console.error('复制失败：', err);
      ElMessage.error('复制失败');
    });
}

// 朗读消息
function speakMessage(content) {
  if (!content) return;
  
  // 如果是HTML内容，提取纯文本
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  const textContent = tempDiv.textContent || tempDiv.innerText || content;
  
  // 发出事件，让父组件处理语音合成
  emit('speech-start', textContent);
}

// 触发图片上传
function triggerImageUpload() {
  if (fileInput.value) {
    fileInput.value.click();
  }
}

// 处理文件上传
async function handleFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请上传图片文件');
    return;
  }
  
  isUploading.value = true;
  
  try {
    const result = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
    
    if (result) {
      // 添加用户上传的图片消息
      messages.value.push({
        role: 'user',
        type: 'image',
        content: result,
        timestamp: Date.now()
      });
      
      // 发射图片上传事件
      emit('image-upload', {
        dataUrl: result,
        file: file
      });
    } else {
      ElMessage.error('图片读取失败');
    }
  } catch (error) {
    console.error('图片上传错误：', error);
    ElMessage.error('图片上传失败');
  } finally {
    isUploading.value = false;
    // 重置文件输入
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
}

// 切换语音输入
function toggleVoiceInput() {
  if (isListening.value) {
    stopVoiceInput();
  } else {
    startVoiceInput();
  }
}

// 开始语音输入
function startVoiceInput() {
  if (!recognition.value) {
    setupSpeechRecognition();
  }
  
  try {
    recognition.value.start();
    isListening.value = true;
    emit('speech-start');
  } catch (error) {
    console.error('启动语音识别失败：', error);
    isListening.value = false;
    ElMessage.error('启动语音识别失败');
  }
}

// 停止语音输入
function stopVoiceInput() {
  if (recognition.value) {
    try {
      recognition.value.stop();
    } catch (error) {
      console.error('停止语音识别失败：', error);
    }
  }
  isListening.value = false;
  emit('speech-end');
}

// 下载文件
function downloadFile(content, fileName) {
  const link = document.createElement('a');
  link.href = content;
  link.download = fileName || 'download';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 公开方法
defineExpose({
  messages,
  addMessage(role, content, type = 'text', additionalData = {}) {
    messages.value.push({
      role,
      type,
      content,
      timestamp: Date.now(),
      ...additionalData
    });
  },
  clearMessages() {
    messages.value = [];
  },
  getMessages() {
    return messages.value;
  },
  startVoiceInput,
  stopVoiceInput
});
</script>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f9f9f9;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  position: relative;
}

.message-item {
  display: flex;
  margin-bottom: 20px;
  transition: opacity 0.3s;
}

.user-message {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
  margin: 0 12px;
}

.message-content {
  position: relative;
  max-width: 70%;
}

.user-message .message-content {
  align-items: flex-end;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow-wrap: break-word;
  word-break: break-word;
}

.user-message .message-bubble {
  background-color: #ecf5ff;
  border-top-right-radius: 2px;
}

.bot-message .message-bubble {
  background-color: #fff;
  border-top-left-radius: 2px;
}

.message-text {
  color: #303133;
  font-size: 14px;
  line-height: 1.5;
}

.message-text :deep(pre) {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 10px 0;
}

.message-text :deep(code) {
  background-color: #f5f7fa;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
}

.message-text :deep(p) {
  margin: 0 0 10px 0;
}

.message-text :deep(p:last-child) {
  margin-bottom: 0;
}

.message-text :deep(a) {
  color: #409EFF;
  text-decoration: none;
}

.message-text :deep(a:hover) {
  text-decoration: underline;
}

.message-chart {
  width: 100%;
  min-width: 300px;
}

.chart-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #303133;
}

.chart-container {
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
}

.message-image img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 4px;
  cursor: zoom-in;
}

.image-caption {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  text-align: center;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 150px;
  width: 200px;
  background-color: #f5f7fa;
  border-radius: 4px;
  color: #909399;
}

.message-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
}

.loading-dots {
  display: flex;
}

.dot {
  width: 8px;
  height: 8px;
  margin: 0 4px;
  border-radius: 50%;
  background-color: #c0c4cc;
  animation: dot-pulse 1.5s infinite ease-in-out both;
}

.dot2 {
  animation-delay: 0.2s;
}

.dot3 {
  animation-delay: 0.4s;
}

@keyframes dot-pulse {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.8;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.message-error {
  display: flex;
  align-items: center;
  color: #f56c6c;
}

.message-error .el-icon {
  margin-right: 8px;
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.user-message .message-time {
  text-align: right;
}

.message-actions {
  display: flex;
  position: absolute;
  right: -40px;
  top: 0;
  opacity: 0;
  transition: opacity 0.2s;
}

.message-content:hover .message-actions {
  opacity: 1;
}

.user-message .message-actions {
  left: -80px;
  right: unset;
}

.input-container {
  padding: 12px 20px;
  background-color: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.input-tools {
  display: flex;
  margin-bottom: 8px;
}

.input-tools .el-button {
  font-size: 20px;
  padding: 0;
  margin-right: 16px;
}

.input-tools .el-button.active {
  color: #409EFF;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.system-message {
  opacity: 0.8;
}

.new-message-indicator {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #409EFF;
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 2;
}

.new-message-indicator .el-icon {
  margin-right: 4px;
}

.voice-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
}

.voice-wave {
  display: flex;
  align-items: center;
  height: 40px;
  margin-bottom: 15px;
}

.wave-bar {
  width: 4px;
  height: 20px;
  margin: 0 3px;
  background-color: #409EFF;
  animation: wave-animation 1.2s infinite ease-in-out;
}

.wave-bar:nth-child(2) {
  animation-delay: 0.2s;
}

.wave-bar:nth-child(3) {
  animation-delay: 0.4s;
  height: 30px;
}

.wave-bar:nth-child(4) {
  animation-delay: 0.6s;
}

.wave-bar:nth-child(5) {
  animation-delay: 0.8s;
}

@keyframes wave-animation {
  0%, 100% {
    height: 15px;
  }
  50% {
    height: 30px;
  }
}

.voice-indicator span {
  margin: 10px 0;
  font-size: 16px;
  font-weight: bold;
  color: #409EFF;
}
</style> 