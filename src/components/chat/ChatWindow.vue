<template>
  <div class="chat-window" ref="chatWindowRef">
    <div class="chat-messages" ref="chatMessagesRef">
      <!-- 欢迎消息 -->
      <div class="welcome-message" v-if="messages.length === 0">
        <div class="welcome-header">
          <h3>欢迎使用IQE动态检验AI助手</h3>
        </div>
        <div class="welcome-content">
          <p>您可以向我询问以下内容：</p>
          <ul>
            <li>物料库存和质量数据分析</li>
            <li>实验室测试结果解读</li>
            <li>生产异常问题诊断</li>
            <li>质量数据可视化展示</li>
          </ul>
        </div>
        <div class="quick-questions">
          <el-button 
            v-for="(question, index) in quickQuestions" 
            :key="index"
            size="small" 
            @click="$emit('select-question', question)"
          >
            {{ question }}
          </el-button>
        </div>
      </div>

      <!-- 聊天消息列表 -->
      <div 
        v-for="(message, index) in messages" 
        :key="index" 
        :class="['message-item', message.role === 'user' ? 'user-message' : 'ai-message']"
      >
        <div class="message-avatar">
          <el-avatar :size="40" :src="message.role === 'user' ? userAvatar : aiAvatar" />
        </div>
        <div class="message-content">
          <div class="message-header">
            <span class="message-sender">{{ message.role === 'user' ? '我' : 'AI助手' }}</span>
            <span class="message-time">{{ formatTime(message.timestamp) }}</span>
          </div>
          <div class="message-body" v-html="formatMessage(message.content)"></div>
          
          <!-- 图表容器 -->
          <div v-if="message.charts && message.charts.length > 0" class="message-charts">
            <div 
              v-for="(chart, chartIndex) in message.charts" 
              :key="chartIndex"
              class="message-chart"
            >
              <component 
                :is="getChartComponent(chart.type)" 
                :data="chart.data" 
                :title="chart.title"
                :chart-type="chart.type"
                @insert-chart="$emit('insert-chart', chart)"
              />
            </div>
          </div>
          
          <!-- 图片容器 -->
          <div v-if="message.images && message.images.length > 0" class="message-images">
            <div 
              v-for="(image, imageIndex) in message.images" 
              :key="imageIndex"
              class="message-image"
            >
              <el-image 
                :src="image.url" 
                :preview-src-list="[image.url]"
                fit="contain"
                :alt="image.alt || '图片'"
              >
                <template #placeholder>
                  <div class="image-placeholder">
                    <el-icon><el-icon-picture /></el-icon>
                    <span>加载中...</span>
                  </div>
                </template>
              </el-image>
              <div class="image-caption" v-if="image.caption">{{ image.caption }}</div>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="message-actions" v-if="message.role === 'assistant'">
            <el-button size="small" @click="$emit('copy-message', message)" link>
              <el-icon><el-icon-document-copy /></el-icon>
            </el-button>
            <el-button size="small" @click="$emit('speak-message', message)" link>
              <el-icon><el-icon-microphone /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 加载指示器 -->
      <div v-if="loading" class="loading-indicator">
        <el-icon class="is-loading"><el-icon-loading /></el-icon>
        <span>AI思考中...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { marked } from 'marked';
import { ElMessage } from 'element-plus';
import CategoryPieChart from '../charts/CategoryPieChart.vue';
import DefectTrendChart from '../charts/DefectTrendChart.vue';
import DataChart from '../charts/DataChart.vue';

const props = defineProps({
  messages: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  userAvatar: {
    type: String,
    default: ''
  },
  aiAvatar: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['copy-message', 'speak-message', 'select-question', 'insert-chart']);

const chatWindowRef = ref(null);
const chatMessagesRef = ref(null);

// 快速问题列表
const quickQuestions = [
  '分析最近的物料质量数据',
  '显示缺陷率趋势图',
  '实验室测试结果异常分析',
  '生产线异常情况汇总'
];

// 格式化消息内容，将Markdown转换为HTML
const formatMessage = (content) => {
  try {
    if (!content) return '';
    
    // 转换markdown为HTML
    let html = marked(content);
    
    // 添加代码高亮
    html = html.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, (match, p1) => {
      return `<pre class="code-block"><code>${p1}</code></pre>`;
    });
    
    return html;
  } catch (error) {
    console.error('消息格式化错误:', error);
    return content || '';
  }
};

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  });
};

// 根据图表类型获取对应的组件
const getChartComponent = (type) => {
  switch (type) {
    case 'pie':
      return CategoryPieChart;
    case 'line':
      return DefectTrendChart;
    default:
      return DataChart;
  }
};

// 监听消息变化，自动滚动到底部
watch(() => props.messages.length, async () => {
  await nextTick();
  scrollToBottom();
});

// 监听加载状态变化
watch(() => props.loading, async (newVal) => {
  if (newVal) {
    await nextTick();
    scrollToBottom();
  }
});

// 滚动到底部
const scrollToBottom = () => {
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
  }
};

// 组件挂载后滚动到底部
onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  display: flex;
  margin-bottom: 16px;
  animation: fade-in 0.3s ease-in-out;
}

.user-message {
  flex-direction: row-reverse;
}

.message-avatar {
  margin: 0 8px;
  flex-shrink: 0;
}

.message-content {
  max-width: 80%;
  border-radius: 8px;
  padding: 12px;
  position: relative;
}

.user-message .message-content {
  background-color: #e1f3ff;
  border-top-right-radius: 0;
}

.ai-message .message-content {
  background-color: #ffffff;
  border-top-left-radius: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 12px;
  color: #606266;
}

.message-body {
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}

.message-body :deep(pre.code-block) {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 12px;
  overflow-x: auto;
  margin: 8px 0;
}

.message-body :deep(ul), 
.message-body :deep(ol) {
  padding-left: 20px;
  margin: 8px 0;
}

.message-body :deep(a) {
  color: #409eff;
  text-decoration: none;
}

.message-body :deep(a:hover) {
  text-decoration: underline;
}

.message-charts {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-images {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.message-image {
  width: 200px;
  border-radius: 4px;
  overflow: hidden;
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 150px;
  background-color: #f5f7fa;
  color: #909399;
}

.image-caption {
  font-size: 12px;
  color: #606266;
  padding: 4px;
  text-align: center;
}

.message-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.message-content:hover .message-actions {
  opacity: 1;
}

.welcome-message {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.welcome-header {
  margin-bottom: 16px;
  text-align: center;
  color: #303133;
}

.welcome-content {
  margin-bottom: 16px;
  color: #606266;
}

.quick-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 8px;
  align-self: flex-start;
  margin-left: 48px;
  color: #909399;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style> 