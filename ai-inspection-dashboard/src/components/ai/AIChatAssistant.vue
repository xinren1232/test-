<template>
  <div class="ai-chat-container">
    <!-- 消息列表 -->
    <div class="message-list" ref="messageListRef">
      <div v-if="messages.length === 0" class="empty-state">
        <el-empty description="暂无对话记录" :image-size="64">
          <template #description>
            <p>您可以开始与AI助手交流，询问有关质量检验的问题</p>
            <small class="model-info">使用模型: {{ activeModel.name }}</small>
          </template>
          <el-button type="primary" @click="showSuggestedQuestions">
            查看建议问题
          </el-button>
        </el-empty>
      </div>
      
      <template v-else>
        <div 
          v-for="(message, index) in messages" 
          :key="message.id || index"
          class="message-item"
          :class="{
            'user-message': message.type === 'user',
            'ai-message': message.type === 'ai',
            'system-message': message.type === 'system',
            'error-message': message.type === 'error'
          }"
        >
          <!-- 用户消息 -->
          <template v-if="message.type === 'user'">
            <div class="message-avatar user-avatar">
              <el-avatar :size="40" src="/assets/user-avatar.svg">用户</el-avatar>
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="message-sender">您</span>
                <span class="message-time">{{ formatTime(message.timestamp) }}</span>
              </div>
              <div class="message-body">{{ message.content }}</div>
              <div v-if="message.attachments && message.attachments.length > 0" class="message-attachments">
                <div 
                  v-for="(attachment, idx) in message.attachments" 
                  :key="idx"
                  class="attachment-item"
                  :class="attachment.type"
                >
                  <el-image 
                    v-if="attachment.type === 'image'"
                    :src="attachment.url" 
                    :preview-src-list="[attachment.url]"
                    fit="cover"
                    class="attachment-image"
                  />
                  <div v-else-if="attachment.type === 'file'" class="attachment-file">
                    <el-icon><Document /></el-icon>
                    <span>{{ attachment.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
          
          <!-- AI消息 -->
          <template v-else-if="message.type === 'ai'">
            <div class="message-avatar ai-avatar">
              <el-avatar :size="40" src="/assets/ai-avatar.svg">AI</el-avatar>
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="message-sender">AI助手</span>
                <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                <div class="message-actions">
                  <el-tooltip content="复制回复" placement="top">
                    <el-icon @click="copyMessage(message.content)"><CopyDocument /></el-icon>
                  </el-tooltip>
                </div>
              </div>
              <div class="message-body" v-html="renderMarkdown(message.content)"></div>
              
              <!-- 引用的数据 -->
              <div v-if="message.references && message.references.length > 0" class="message-references">
                <div class="references-header">参考数据</div>
                <div class="references-list">
                  <div 
                    v-for="(ref, idx) in message.references" 
                    :key="idx"
                    class="reference-item"
                  >
                    <el-icon><DataLine /></el-icon>
                    <span>{{ ref.description || ref.source }}</span>
                  </div>
                </div>
              </div>
              
              <!-- 图表展示 -->
              <div v-if="message.chart" class="message-chart" :id="`chart-${message.id}`"></div>
              
              <!-- 建议操作 -->
              <div v-if="message.suggestedActions && message.suggestedActions.length > 0" class="suggested-actions">
                <el-button
                  v-for="action in message.suggestedActions"
                  :key="action.id"
                  size="small"
                  :type="action.primary ? 'primary' : ''"
                  @click="handleSuggestedAction(action)"
                >
                  {{ action.label }}
                </el-button>
              </div>
            </div>
          </template>
          
          <!-- 系统消息 -->
          <template v-else-if="message.type === 'system'">
            <div class="system-message-content">
              <el-icon><InfoFilled /></el-icon>
              <span>{{ message.content }}</span>
            </div>
          </template>
          
          <!-- 错误消息 -->
          <template v-else-if="message.type === 'error'">
            <div class="error-message-content">
              <el-icon><WarningFilled /></el-icon>
              <span>{{ message.content }}</span>
              <el-button 
                v-if="message.canRetry" 
                size="small" 
                type="danger" 
                @click="retryLastMessage"
              >
                重试
              </el-button>
            </div>
          </template>
        </div>
        
        <!-- 正在输入指示器 -->
        <div v-if="isTyping" class="typing-indicator">
          <div class="message-avatar ai-avatar">
            <el-avatar :size="40" src="/assets/ai-avatar.svg">AI</el-avatar>
          </div>
          <div class="message-content">
            <div class="dots">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>
        </div>
      </template>
    </div>
    
    <!-- 消息输入区域 -->
    <div class="message-input">
      <div class="input-container">
        <el-input
          v-model="inputMessage"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 4 }"
          placeholder="输入您的问题..."
          :disabled="isProcessing"
          @keydown.enter.exact.prevent="sendMessage"
        />
        
        <!-- 附件预览区 -->
        <div v-if="attachments.length > 0" class="attachments-preview">
          <div 
            v-for="(attachment, index) in attachments" 
            :key="index"
            class="attachment-preview-item"
          >
            <div class="attachment-preview-content">
              <el-image 
                v-if="attachment.type === 'image'"
                :src="attachment.url" 
                fit="cover"
                class="attachment-preview-image"
              />
              <div v-else class="attachment-preview-file">
                <el-icon><Document /></el-icon>
                <span>{{ attachment.name }}</span>
              </div>
            </div>
            <el-icon class="attachment-remove" @click="removeAttachment(index)">
              <Close />
            </el-icon>
          </div>
        </div>
        
        <!-- 按钮工具栏 -->
        <div class="input-actions">
          <div class="left-actions">
            <el-tooltip content="上传图片" placement="top">
              <el-upload
                action=""
                :auto-upload="false"
                :show-file-list="false"
                accept="image/*"
                :on-change="handleImageUpload"
                :disabled="isProcessing"
              >
                <el-button :icon="Picture" circle plain :disabled="isProcessing" />
              </el-upload>
            </el-tooltip>
            
            <el-tooltip content="上传文件" placement="top">
              <el-upload
                action=""
                :auto-upload="false"
                :show-file-list="false"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
                :on-change="handleFileUpload"
                :disabled="isProcessing"
              >
                <el-button :icon="Upload" circle plain :disabled="isProcessing" />
              </el-upload>
            </el-tooltip>
            
            <el-tooltip content="语音输入" placement="top">
              <el-button
                :icon="isRecording ? Microphone : Mic"
                circle
                :type="isRecording ? 'primary' : ''"
                plain
                :disabled="isProcessing"
                @click="toggleVoiceInput"
              />
            </el-tooltip>
          </div>
          
          <div class="right-actions">
            <el-button
              type="primary"
              :loading="isProcessing"
              :disabled="!canSendMessage"
              @click="sendMessage"
            >
              {{ isProcessing ? '处理中' : '发送' }}
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useEventListener } from '@vueuse/core';
import { Picture, Upload, Microphone, Mic, Document, CopyDocument, InfoFilled, WarningFilled, DataLine, Close } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useChatStore } from '../../stores';
import { useContextStore } from '../../stores';
import { useAIModelStore } from '../../stores';
import { IntentRecognizer } from '../../services/core/IntentRecognizer';
import { TaskManager } from '../../services/core/TaskManager';
import aiService from '../../services/ai/AIService';

export default {
  name: 'AIChatAssistant',
  
  props: {
    // 仍保留context属性以支持不使用store的场景
    context: {
      type: Object,
      default: () => ({})
    },
    modelId: {
      type: String,
      default: null
    }
  },
  
  emits: [
    'message-sent',
    'response-received',
    'feature-activated',
    'material-mentioned',
    'voice-start',
    'voice-end',
    'image-upload'
  ],
  
  setup(props, { emit }) {
    // 使用状态存储
    const chatStore = useChatStore();
    const contextStore = useContextStore();
    const aiModelStore = useAIModelStore();
    
    // 本地状态
    const inputMessage = ref('');
    const isTyping = ref(false);
    const isRecording = ref(false);
    const attachments = ref([]);
    const messageListRef = ref(null);
    const taskManager = ref(null);
    
    // 计算属性
    const messages = computed(() => chatStore.messages);
    const isProcessing = computed(() => chatStore.isProcessing);
    
    // 获取当前活跃的AI模型
    const activeModel = computed(() => AIService.getActiveModel());
    
    const canSendMessage = computed(() => {
      return (inputMessage.value.trim() !== '' || attachments.value.length > 0) && !isProcessing.value;
    });
    
    // 初始化任务管理器
    onMounted(() => {
      taskManager.value = new TaskManager();
      
      // 滚动到底部
      scrollToBottom();
      
      // 如果没有消息，显示欢迎消息
      if (messages.value.length === 0) {
        addWelcomeMessage();
      }
    });
    
    // 监听消息变化，自动滚动到底部
    watch(messages, () => {
      nextTick(scrollToBottom);
    }, { deep: true });
    
    // 添加欢迎消息
    function addWelcomeMessage() {
      chatStore.addMessage({
        type: 'system',
        content: '欢迎使用IQE质量智能助手，您可以询问任何关于质量检验的问题！'
      });
    }
    
    // 格式化时间
    function formatTime(timestamp) {
      if (!timestamp) return '';
      
      const date = new Date(timestamp);
      const now = new Date();
      const isToday = date.getDate() === now.getDate() && 
                      date.getMonth() === now.getMonth() && 
                      date.getFullYear() === now.getFullYear();
      
      if (isToday) {
        return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      }
      
      return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) + 
             ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
    
    // 发送消息
    async function sendMessage() {
      if (!canSendMessage.value) return;
      
      const messageText = inputMessage.value.trim();
      
      // 创建消息对象
      const newMessage = {
        type: 'user',
        content: messageText
      };
      
      // 添加附件（如果有）
      if (attachments.value.length > 0) {
        newMessage.attachments = [...attachments.value];
      }
      
      // 添加到消息列表
      chatStore.addMessage(newMessage);
      
      // 更新上下文
      const currentContext = {
        ...contextStore.contextForAI,
        ...props.context // 兼容直接传入的context
      };
      
      chatStore.updateLastContext(currentContext);
      
      // 发送消息事件
      emit('message-sent', {
        content: messageText,
        attachments: newMessage.attachments,
        context: currentContext
      });
      
      // 清空输入
      inputMessage.value = '';
      attachments.value = [];
      
      // 设置处理中状态
      chatStore.setProcessing(true);
      isTyping.value = true;
      
      try {
        // 获取历史消息用于上下文
        const history = chatStore.messages
          .slice(-10) // 最多取10条历史记录
          .filter(m => m.type === 'user' || m.type === 'ai')
          .map(m => ({
            role: m.type === 'user' ? 'user' : 'assistant',
            content: m.content
          }));
        
        // 去掉最后一条，即刚刚添加的用户消息
        history.pop();
        
        // 识别意图
        const intent = await IntentRecognizer.recognizeIntent(messageText, currentContext);
        
        // 处理意图
        if (intent && intent.module && intent.feature) {
          // 触发功能激活事件
            chatStore.activateFeature(`${intent.module}.${intent.feature}`);
            emit('feature-activated', intent);
          
          // 提取提及的物料
          if (intent.entities && intent.entities.materialCode) {
            emit('material-mentioned', { materialCode: intent.entities.materialCode });
          }
        }
        
        // 创建临时消息ID，用于后续更新
        const tempMessageId = `ai-response-${Date.now()}`;
        
        // 添加空的AI消息，准备接收流式内容
        chatStore.addMessage({
          id: tempMessageId,
          type: 'ai',
          content: '',
          isStreaming: true
        });
        
        // 使用流式输出
        const response = await AIService.executeQuery(messageText, {
          context: currentContext,
          intent,
          history,
          streaming: true,
          onStream: (chunk, fullContent) => {
            // 更新消息内容
            chatStore.updateMessageContent(tempMessageId, fullContent);
          }
        });
        
        // 设置正在输入为false
        isTyping.value = false;
        
        if (response.error) {
          // 删除临时消息
          chatStore.removeMessage(tempMessageId);
          
          // 处理API错误
        chatStore.addMessage({
            type: 'error',
            content: `处理您的请求时出错: ${response.message}`,
            canRetry: true
          });
        } else {
          // 更新最终消息，移除streaming标志
          chatStore.updateMessage(tempMessageId, {
            isStreaming: false,
          references: response.references,
          chart: response.chart,
          suggestedActions: response.suggestedActions
        });
        
        // 发送响应接收事件
        emit('response-received', {
          response: response.content,
          intent,
          context: currentContext
        });
        
        // 如果有图表数据，渲染图表
        if (response.chart) {
          nextTick(() => {
            renderChart(response.chart);
          });
          }
        }
      } catch (error) {
        console.error('处理消息失败:', error);
        isTyping.value = false;
        
        // 添加错误消息
        chatStore.addMessage({
          type: 'error',
          content: `处理您的请求时出错: ${error.message || '未知错误'}`,
          canRetry: true
        });
      } finally {
        // 设置处理完成
        chatStore.setProcessing(false);
      }
    }
    
    // 重试最后一条消息
    function retryLastMessage() {
      const lastMessage = chatStore.lastUserMessage;
      if (lastMessage) {
        inputMessage.value = lastMessage.content;
        if (lastMessage.attachments) {
          attachments.value = [...lastMessage.attachments];
        }
        sendMessage();
      }
    }
    
    // 显示建议问题
    function showSuggestedQuestions() {
      const suggestedQuestions = [
        '查询物料 M2023-001 的最新质量数据',
        '分析批次 B001-123 的检验结果',
        '生成本月质量趋势报告',
        '查看产线A的异常记录',
        '如何提高钢材加工良品率?'
      ];
      
      chatStore.addMessage({
        type: 'system',
        content: '您可以尝试以下问题：\n' + suggestedQuestions.map(q => `• ${q}`).join('\n')
      });
    }
    
    // 处理图片上传
    function handleImageUpload(file) {
      if (!file) return;
      
      // 检查文件大小（限制为10MB）
      if (file.size > 10 * 1024 * 1024) {
        ElMessage.error('图片大小不能超过10MB');
        return;
      }
      
      // 创建预览URL
      const url = URL.createObjectURL(file.raw);
      
      // 添加到附件列表
      attachments.value.push({
        type: 'image',
        url,
        file: file.raw,
        name: file.name
      });
      
      // 触发图片上传事件
      emit('image-upload', {
        file: file.raw,
        url,
        name: file.name
      });
    }
    
    // 处理文件上传
    function handleFileUpload(file) {
      if (!file) return;
      
      // 检查文件大小（限制为20MB）
      if (file.size > 20 * 1024 * 1024) {
        ElMessage.error('文件大小不能超过20MB');
        return;
      }
      
      // 添加到附件列表
      attachments.value.push({
        type: 'file',
        file: file.raw,
        name: file.name
      });
    }
    
    // 移除附件
    function removeAttachment(index) {
      if (index >= 0 && index < attachments.value.length) {
        // 如果是图片，释放URL对象
        if (attachments.value[index].type === 'image' && attachments.value[index].url) {
          URL.revokeObjectURL(attachments.value[index].url);
        }
        
        attachments.value.splice(index, 1);
      }
    }
    
    // 切换语音输入
    function toggleVoiceInput() {
      if (isRecording.value) {
        stopVoiceRecording();
      } else {
        startVoiceRecording();
      }
    }
    
    // 开始语音录制
    function startVoiceRecording() {
      isRecording.value = true;
      
      // 发送语音开始事件
      emit('voice-start');
      
      // TODO: 实现实际的语音录制功能
      ElMessage.info('语音输入功能正在开发中');
      
      // 模拟录制，3秒后自动停止
      setTimeout(() => {
        if (isRecording.value) {
          stopVoiceRecording();
        }
      }, 3000);
    }
    
    // 停止语音录制
    function stopVoiceRecording() {
      if (!isRecording.value) return;
      
      isRecording.value = false;
      
      // 发送语音结束事件
      emit('voice-end');
      
      // TODO: 实现实际的语音处理功能
      inputMessage.value = '语音输入示例';
    }
    
    // 复制消息内容
    function copyMessage(content) {
      navigator.clipboard.writeText(content)
        .then(() => {
          ElMessage.success('已复制到剪贴板');
        })
        .catch(err => {
          console.error('复制失败:', err);
          ElMessage.error('复制失败');
        });
    }
    
    // 渲染Markdown
    function renderMarkdown(text) {
      if (!text) return '';
      
      try {
        const html = marked.parse(text);
        return DOMPurify.sanitize(html);
      } catch (error) {
        console.error('Markdown渲染失败:', error);
        return text;
      }
    }
    
    // 渲染图表
    function renderChart(chartData) {
      // TODO: 实现图表渲染
    }
    
    // 滚动到底部
    function scrollToBottom() {
      if (messageListRef.value) {
        messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
      }
    }
    
    // 添加消息
    function addMessage(message) {
      chatStore.addMessage(message);
    }
    
    // 清除历史记录
    function clearHistory() {
      chatStore.clearHistory();
      addWelcomeMessage();
    }
    
    // 处理建议操作
    function handleSuggestedAction(action) {
      if (action.type === 'send') {
        inputMessage.value = action.message || action.label;
        sendMessage();
      } else if (action.type === 'navigate') {
        // 触发功能激活事件
        if (action.module && action.feature) {
          emit('feature-activated', {
            module: action.module,
            feature: action.feature,
            parameters: action.parameters
          });
        }
      }
    }
    
    // 键盘快捷键
    useEventListener('keydown', (e) => {
      // Ctrl+Enter 发送消息
      if (e.ctrlKey && e.key === 'Enter') {
        sendMessage();
      }
    });
    
    return {
      // 状态引用
      inputMessage,
      isTyping,
      isRecording,
      attachments,
      messageListRef,
      
      // 计算属性
      messages,
      isProcessing,
      canSendMessage,
      activeModel,
      
      // 方法
      sendMessage,
      retryLastMessage,
      formatTime,
      showSuggestedQuestions,
      handleImageUpload,
      handleFileUpload,
      removeAttachment,
      toggleVoiceInput,
      copyMessage,
      renderMarkdown,
      addMessage,
      clearHistory,
      handleSuggestedAction,
      
      // 导出图标
      Picture,
      Upload,
      Microphone,
      Mic,
      Document,
      CopyDocument,
      InfoFilled,
      WarningFilled,
      DataLine,
      Close
    };
  }
};
</script>

<style>
.ai-chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f9f9f9;
  border-radius: 4px;
  overflow: hidden;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.message-item {
  display: flex;
  margin-bottom: 20px;
  animation: fadeIn 0.3s ease-in-out;
}

.user-message {
  flex-direction: row-reverse;
}

.ai-message, .system-message, .error-message {
  flex-direction: row;
}

.message-avatar {
  margin: 0 10px;
}

.message-content {
  max-width: 70%;
  border-radius: 8px;
  padding: 10px 15px;
  position: relative;
}

.user-message .message-content {
  background-color: #ecf5ff;
  border: 1px solid #d9ecff;
}

.ai-message .message-content {
  background-color: #ffffff;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.system-message-content, .error-message-content {
  width: 100%;
  padding: 8px 16px;
  border-radius: 4px;
  margin: 10px 0;
  display: flex;
  align-items: center;
}

.system-message-content {
  background-color: #f5f7fa;
  border: 1px dashed #dcdfe6;
  color: #606266;
}

.error-message-content {
  background-color: #fef0f0;
  border: 1px dashed #fbc4c4;
  color: #f56c6c;
}

.system-message-content .el-icon,
.error-message-content .el-icon {
  margin-right: 8px;
  font-size: 16px;
}

.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  font-size: 12px;
  color: #909399;
}

.message-sender {
  font-weight: 600;
  color: #606266;
  margin-right: auto;
}

.message-time {
  font-size: 10px;
  color: #c0c4cc;
}

.message-actions {
  margin-left: 10px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.message-content:hover .message-actions {
  opacity: 1;
}

.message-actions .el-icon {
  font-size: 14px;
  cursor: pointer;
  color: #909399;
}

.message-actions .el-icon:hover {
  color: #409eff;
}

.message-body {
  line-height: 1.5;
  word-wrap: break-word;
}

.ai-message .message-body {
  color: #303133;
}

.ai-message .message-body pre {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 12px;
  overflow-x: auto;
  margin: 8px 0;
}

.ai-message .message-body code {
  background-color: #f5f7fa;
  border-radius: 3px;
  padding: 2px 4px;
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
}

.user-message .message-body {
  color: #2c3e50;
}

.message-attachments {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.attachment-item {
  border-radius: 4px;
  overflow: hidden;
}

.attachment-item.image {
  width: 120px;
  height: 90px;
  border: 1px solid #e4e7ed;
}

.attachment-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.attachment-file {
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  max-width: 200px;
}

.attachment-file .el-icon {
  margin-right: 8px;
  color: #409eff;
}

.attachment-file span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
}

.message-references {
  margin-top: 15px;
  border-top: 1px dashed #e4e7ed;
  padding-top: 10px;
}

.references-header {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.references-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.reference-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #606266;
}

.reference-item .el-icon {
  margin-right: 5px;
  color: #909399;
}

.message-chart {
  width: 100%;
  height: 200px;
  margin-top: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.suggested-actions {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.message-input {
  padding: 15px;
  border-top: 1px solid #e4e7ed;
  background-color: #ffffff;
}

.input-container {
  position: relative;
}

.input-actions {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-actions, .right-actions {
  display: flex;
  gap: 10px;
}

.attachments-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px 0;
}

.attachment-preview-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #e4e7ed;
  background-color: #f5f7fa;
}

.attachment-preview-content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.attachment-preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.attachment-preview-file {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.attachment-preview-file .el-icon {
  font-size: 24px;
  color: #409eff;
  margin-bottom: 5px;
}

.attachment-preview-file span {
  font-size: 10px;
  width: 70px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

.attachment-remove {
  position: absolute;
  top: 2px;
  right: 2px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 50%;
  padding: 2px;
  font-size: 12px;
  cursor: pointer;
  z-index: 1;
}

.typing-indicator {
  display: flex;
  margin-bottom: 20px;
}

.typing-indicator .message-content {
  background-color: #ffffff;
  border: 1px solid #e4e7ed;
  min-width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dots {
  display: flex;
  align-items: center;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #dcdfe6;
  margin: 0 3px;
  animation: bounce 1.5s infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-5px);
  }
}

@media (max-width: 768px) {
  .message-content {
    max-width: 85%;
  }
  
  .message-avatar {
    margin: 0 5px;
  }
}

.model-info {
  display: block;
  margin-top: 5px;
  color: #909399;
  font-size: 12px;
}
</style> 