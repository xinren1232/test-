<template>
  <div :class="['message-item', message.role === 'user' ? 'user-message' : 'ai-message']">
    <div class="message-avatar">
      <el-avatar :size="40" :src="message.role === 'user' ? userAvatar : aiAvatar" />
    </div>
    <div class="message-content">
      <div class="message-header">
        <span class="message-sender">{{ message.role === 'user' ? '我' : 'AI助手' }}</span>
        <span class="message-time">{{ formatTime(message.timestamp) }}</span>
      </div>
      <div class="message-body" v-html="formattedContent"></div>
      
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
      
      <!-- 分析结果 -->
      <div v-if="message.analysis" class="message-analysis">
        <div class="analysis-header">
          <h4>{{ message.analysis.title }}</h4>
          <div class="confidence-badge" :class="getConfidenceClass(message.analysis.confidence)">
            置信度: {{ (message.analysis.confidence * 100).toFixed(1) }}%
          </div>
        </div>
        
        <div class="analysis-description">
          {{ message.analysis.description }}
        </div>
        
        <div v-if="message.analysis.defects && message.analysis.defects.length > 0" class="analysis-defects">
          <div class="analysis-section-title">检测到的缺陷:</div>
          <div class="defect-item" v-for="(defect, index) in message.analysis.defects" :key="index">
            <div class="defect-header">
              <span class="defect-type">{{ defect.type }}</span>
              <el-tag :type="getSeverityType(defect.severity)" size="small">
                {{ defect.severity }}
              </el-tag>
            </div>
            <div class="defect-description">{{ defect.description }}</div>
          </div>
        </div>
        
        <div v-if="message.analysis.recommendations && message.analysis.recommendations.length > 0" class="analysis-recommendations">
          <div class="analysis-section-title">建议措施:</div>
          <div class="recommendation-item" v-for="(rec, index) in message.analysis.recommendations" :key="index">
            <div class="recommendation-title">{{ index + 1 }}. {{ rec.title }}</div>
            <div class="recommendation-description">{{ rec.description }}</div>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="message-actions" v-if="message.role === 'assistant'">
        <el-button size="small" @click="copyMessage" link>
          <el-icon><el-icon-document-copy /></el-icon>
        </el-button>
        <el-button size="small" @click="speakMessage" link>
          <el-icon><el-icon-microphone /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { ElMessage } from 'element-plus';
import { marked } from 'marked';
import CategoryPieChart from '../charts/CategoryPieChart.vue';
import DefectTrendChart from '../charts/DefectTrendChart.vue';
import DataChart from '../charts/DataChart.vue';

const props = defineProps({
  message: {
    type: Object,
    required: true
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

const emit = defineEmits(['copy', 'speak', 'insert-chart']);

// 格式化消息内容，将Markdown转换为HTML
const formattedContent = computed(() => {
  try {
    if (!props.message.content) return '';
    
    // 转换markdown为HTML
    let html = marked(props.message.content);
    
    // 添加代码高亮
    html = html.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, (match, p1) => {
      return `<pre class="code-block"><code>${p1}</code></pre>`;
    });
    
    return html;
  } catch (error) {
    console.error('消息格式化错误:', error);
    return props.message.content || '';
  }
});

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

// 获取置信度对应的样式类
const getConfidenceClass = (confidence) => {
  if (confidence >= 0.8) return 'high-confidence';
  if (confidence >= 0.5) return 'medium-confidence';
  return 'low-confidence';
};

// 获取严重程度对应的标签类型
const getSeverityType = (severity) => {
  switch (severity) {
    case '严重':
      return 'danger';
    case '中等':
      return 'warning';
    case '轻微':
      return 'info';
    default:
      return '';
  }
};

// 复制消息内容
const copyMessage = () => {
  try {
    // 创建一个纯文本版本的消息
    const textContent = props.message.content || '';
    
    // 复制到剪贴板
    navigator.clipboard.writeText(textContent)
      .then(() => {
        ElMessage.success('消息已复制到剪贴板');
      })
      .catch(err => {
        console.error('复制失败:', err);
        ElMessage.error('复制失败');
      });
  } catch (error) {
    console.error('复制消息失败:', error);
    ElMessage.error('复制消息失败');
  }
  
  emit('copy', props.message);
};

// 朗读消息内容
const speakMessage = () => {
  emit('speak', props.message);
};
</script>

<style scoped>
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

.message-analysis {
  margin-top: 16px;
  padding: 12px;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.analysis-header h4 {
  margin: 0;
  font-size: 16px;
}

.confidence-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.high-confidence {
  background-color: #f0f9eb;
  color: #67c23a;
}

.medium-confidence {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.low-confidence {
  background-color: #fef0f0;
  color: #f56c6c;
}

.analysis-description {
  margin-bottom: 12px;
  font-size: 14px;
}

.analysis-section-title {
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 14px;
}

.defect-item {
  margin-bottom: 8px;
  padding: 8px;
  border-radius: 4px;
  background-color: #ffffff;
}

.defect-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.defect-type {
  font-weight: 500;
}

.defect-description {
  font-size: 13px;
  color: #606266;
}

.analysis-recommendations {
  margin-top: 12px;
}

.recommendation-item {
  margin-bottom: 8px;
}

.recommendation-title {
  font-weight: 500;
  margin-bottom: 2px;
}

.recommendation-description {
  font-size: 13px;
  color: #606266;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style> 
 
 