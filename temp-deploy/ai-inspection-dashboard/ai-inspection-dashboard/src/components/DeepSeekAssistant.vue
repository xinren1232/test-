<template>
  <div class="deepseek-assistant" :class="{ 'minimized': minimized, 'expanded': !minimized }">
    <!-- 头部/最小化时显示的部分 -->
    <div class="assistant-header" @click="toggleMinimize">
      <div class="assistant-title">
        <img :src="config.ui.avatar" alt="AI助手" class="assistant-avatar" />
        <span>{{ config.name }}</span>
      </div>
      <el-button 
        :icon="minimized ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" 
        size="small" 
        circle 
        @click.stop="toggleMinimize"
      />
    </div>

    <!-- 展开的聊天内容 -->
    <div v-if="!minimized" class="assistant-content">
      <!-- 消息显示区域 -->
      <div class="messages-container" ref="messagesContainer">
        <!-- 欢迎消息 -->
        <div v-if="messages.length === 0" class="welcome-message">
          <p>{{ config.fallbackResponses.welcome }}</p>
        </div>

        <!-- 消息列表 -->
        <div v-for="(msg, index) in messages" :key="index" class="message" :class="msg.isUser ? 'user-message' : 'assistant-message'">
          <div class="message-avatar">
            <img :src="msg.isUser ? config.ui.userAvatar : config.ui.avatar" :alt="msg.isUser ? '用户' : 'AI助手'" />
          </div>
          <div class="message-content">
            <div class="message-text" v-html="formatMessage(msg.text)"></div>
            <div v-if="msg.isOffline" class="offline-indicator">
              <el-tag size="small" type="warning">离线回复</el-tag>
            </div>
            <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
          </div>
        </div>

        <!-- 加载中指示器 -->
        <div v-if="loading" class="loading-indicator">
          <el-skeleton :rows="3" animated />
        </div>
      </div>

      <!-- 图片上传预览区域 -->
      <div v-if="imagePreview" class="image-preview">
        <img :src="imagePreview" alt="预览图片" class="preview-image" />
        <el-button class="remove-image" icon="el-icon-delete" circle size="mini" @click="removeImage"></el-button>
      </div>

      <!-- 输入区域 -->
      <div class="input-container">
        <div class="input-controls">
          <el-input
            v-model="userInput"
            type="textarea"
            :rows="2"
            placeholder="请输入您的问题..."
            @keydown.enter.ctrl.exact="sendMessage"
            resize="none"
          />
          <div class="action-buttons">
            <el-tooltip content="上传图片" placement="top">
              <el-upload
                action=""
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleImageUpload"
                accept="image/*"
              >
                <el-button size="small" icon="el-icon-picture" circle></el-button>
              </el-upload>
            </el-tooltip>
            <el-tooltip content="发送消息" placement="top">
              <el-button 
                type="primary" 
                size="small" 
                icon="el-icon-s-promotion" 
                circle 
                @click="sendMessage"
                :disabled="!userInput.trim() && !imagePreview"
              ></el-button>
            </el-tooltip>
          </div>
        </div>
        <div class="input-hints">
          <span>按Ctrl+Enter发送</span>
          <!-- 服务状态指示器 -->
          <div class="service-status">
            <span :class="['status-indicator', serviceAvailable ? 'status-online' : 'status-offline']"></span>
            <span>{{ serviceAvailable ? '在线' : '离线模式' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import aiService from '../services/AIUnifiedService';
import aiConfig from '../config/aiConfig';

export default {
  name: 'DeepSeekAssistant',
  props: {
    // 传递当前页面上下文
    pageContext: {
      type: Object,
      default: () => ({})
    },
    // 是否默认最小化
    defaultMinimized: {
      type: Boolean,
      default: () => aiConfig.ui.minimizedByDefault
    },
    // 页面名称
    pageName: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    // 状态
    const minimized = ref(props.defaultMinimized);
    const messages = reactive([]);
    const userInput = ref('');
    const loading = ref(false);
    const imagePreview = ref(null);
    const imageData = ref(null);
    const messagesContainer = ref(null);
    const serviceAvailable = ref(false);
    const config = reactive(aiConfig);

    // 检查服务可用性
    const checkServiceStatus = async () => {
      serviceAvailable.value = await aiService.checkAvailability();
      // 设置定期检查
      setTimeout(checkServiceStatus, 60000); // 每分钟检查一次
    };

    // 格式化消息文本，将链接转换为可点击的链接
    const formatMessage = (text) => {
      if (!text) return '';
      // 将URL转换为链接
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      return text.replace(urlRegex, '<a href="$1" target="_blank">$1</a>')
        // 转换换行符为<br>
        .replace(/\n/g, '<br>');
    };

    // 格式化时间
    const formatTime = (timestamp) => {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // 切换最小化状态
    const toggleMinimize = () => {
      minimized.value = !minimized.value;
    };

    // 处理图片上传
    const handleImageUpload = (file) => {
      if (file.raw) {
        // 检查文件大小，限制为5MB
        if (file.raw.size / 1024 / 1024 > 5) {
          ElMessage.warning('图片大小不能超过5MB');
          return;
        }

        // 检查文件类型
        if (!file.raw.type.startsWith('image/')) {
          ElMessage.warning('只能上传图片文件');
          return;
        }

        // 创建预览URL
        imagePreview.value = URL.createObjectURL(file.raw);
        imageData.value = file.raw;
      }
    };

    // 移除图片
    const removeImage = () => {
      if (imagePreview.value) {
        URL.revokeObjectURL(imagePreview.value);
      }
      imagePreview.value = null;
      imageData.value = null;
    };

    // 发送消息
    const sendMessage = async () => {
      // 检查是否有消息或图片
      if (!userInput.value.trim() && !imageData.value) return;

      // 添加用户消息
      const messageTime = new Date();
      let userMessage = userInput.value.trim();
      const hasImage = !!imageData.value;

      // 清空输入并设置加载状态
      userInput.value = '';
      loading.value = true;

      // 添加用户消息到消息列表
      messages.push({
        isUser: true,
        text: hasImage ? (userMessage || '查看这张图片') : userMessage,
        timestamp: messageTime.toISOString()
      });

      // 准备上下文数据
      const context = {
        ...props.pageContext,
        pageName: props.pageName,
        timestamp: messageTime.toISOString()
      };

      // 准备历史消息
      const history = messages
        .slice(0, -1) // 不包括刚刚添加的用户消息
        .map(msg => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.text
        }));

      try {
        let response;

        // 处理图片分析
        if (hasImage) {
          response = await aiService.analyzeImage(
            imageData.value,
            context,
            userMessage // 作为提示
          );
          // 清除图片
          removeImage();
        } else {
          // 处理文本对话
          response = await aiService.sendMessage(userMessage, context, history);
        }

        // 添加助手回复
        messages.push({
          isUser: false,
          text: response.text,
          timestamp: new Date().toISOString(),
          isOffline: response.isOffline
        });

        // 滚动到底部
        await nextTick();
        scrollToBottom();
      } catch (error) {
        console.error('发送消息失败:', error);
        // 添加错误消息
        messages.push({
          isUser: false,
          text: config.fallbackResponses.error,
          timestamp: new Date().toISOString(),
          isOffline: true
        });
      } finally {
        loading.value = false;
      }
    };

    // 滚动到消息容器底部
    const scrollToBottom = () => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
    };

    // 监听消息变化，滚动到底部
    watch(messages, () => {
      nextTick(() => {
        scrollToBottom();
      });
    });

    // 生命周期钩子
    onMounted(() => {
      // 初始检查服务状态
      checkServiceStatus();
    });

    return {
      minimized,
      messages,
      userInput,
      loading,
      imagePreview,
      messagesContainer,
      serviceAvailable,
      config,
      toggleMinimize,
      formatMessage,
      formatTime,
      handleImageUpload,
      removeImage,
      sendMessage,
      scrollToBottom
    };
  }
};
</script>

<style scoped>
.deepseek-assistant {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 350px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  overflow: hidden;
  transition: all 0.3s ease;
}

.deepseek-assistant.minimized {
  height: 50px;
}

.deepseek-assistant.expanded {
  height: 500px;
}

.assistant-header {
  padding: 10px 15px;
  background-color: #409EFF;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  height: 50px;
  box-sizing: border-box;
}

.assistant-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.assistant-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.assistant-content {
  display: flex;
  flex-direction: column;
  height: calc(100% - 50px);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  background-color: #f7f7f7;
}

.welcome-message {
  text-align: center;
  padding: 20px 0;
  color: #606266;
  font-style: italic;
}

.message {
  display: flex;
  margin-bottom: 15px;
  align-items: flex-start;
}

.user-message {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 10px;
  flex-shrink: 0;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-content {
  max-width: 70%;
  border-radius: 10px;
  padding: 10px;
  position: relative;
}

.user-message .message-content {
  background-color: #d8ecff;
  border-top-right-radius: 2px;
}

.assistant-message .message-content {
  background-color: white;
  border-top-left-radius: 2px;
}

.message-text {
  word-break: break-word;
  line-height: 1.5;
}

.message-time {
  font-size: 11px;
  color: #999;
  margin-top: 5px;
  text-align: right;
}

.offline-indicator {
  margin-top: 5px;
}

.loading-indicator {
  padding: 10px;
  background-color: white;
  border-radius: 10px;
  margin-bottom: 15px;
}

.image-preview {
  position: relative;
  padding: 10px;
  border-top: 1px solid #eee;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 5px;
  display: block;
  margin: 0 auto;
}

.remove-image {
  position: absolute;
  top: 15px;
  right: 15px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
}

.input-container {
  border-top: 1px solid #eee;
  padding: 10px;
}

.input-controls {
  display: flex;
  align-items: flex-end;
}

.input-controls .el-textarea {
  flex: 1;
}

.action-buttons {
  display: flex;
  gap: 5px;
  margin-left: 10px;
}

.input-hints {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.service-status {
  display: flex;
  align-items: center;
  gap: 5px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.status-online {
  background-color: #67C23A;
}

.status-offline {
  background-color: #F56C6C;
}

@media (max-width: 768px) {
  .deepseek-assistant {
    width: 90%;
    right: 5%;
    bottom: 10px;
  }
}
</style> 