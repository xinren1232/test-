<template>
  <div class="ai-enhanced-button">
    <!-- AI增强按钮 -->
    <el-button
      :type="aiEnabled ? 'success' : 'primary'"
      :loading="isLoading"
      @click="handleAIQuery"
      class="ai-button"
      :class="{ 'ai-active': aiEnabled }"
    >
      <template #icon>
        <el-icon class="ai-icon" :class="{ 'ai-spinning': isLoading }">
          <MagicStick />
        </el-icon>
      </template>
      <span>{{ buttonText }}</span>
      <div v-if="aiEnabled" class="ai-badge">AI</div>
    </el-button>

    <!-- AI状态指示器 -->
    <AIStatusIndicator :show-text="false" size="small" class="status-indicator" />

    <!-- AI响应弹窗 -->
    <el-dialog
      v-model="showDialog"
      :title="dialogTitle"
      width="80%"
      :close-on-click-modal="false"
      class="ai-dialog"
    >
      <div class="ai-response-container">
        <!-- 分析阶段指示 -->
        <div v-if="analysisPhase" class="analysis-phase">
          <el-icon class="phase-icon" :class="{ 'rotating': !isComplete }">
            <Loading v-if="!isComplete" />
            <CircleCheck v-else />
          </el-icon>
          <span>{{ analysisPhase }}</span>
        </div>

        <!-- 查询计划 -->
        <div v-if="queryPlan" class="query-plan">
          <h4>📋 AI分析计划</h4>
          <el-timeline>
            <el-timeline-item
              v-for="(step, index) in queryPlan.steps"
              :key="step.id"
              :type="index < completedSteps ? 'success' : 'info'"
              :icon="index < completedSteps ? CircleCheck : Clock"
            >
              <div class="step-content">
                <div class="step-title">{{ step.purpose }}</div>
                <div class="step-details">工具: {{ step.tool }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>

        <!-- AI分析内容 -->
        <div v-if="aiContent" class="ai-content">
          <h4>🤖 AI深度分析</h4>
          <div class="content-stream" v-html="aiContent"></div>
        </div>

        <!-- 错误信息 -->
        <div v-if="hasError" class="error-message">
          <el-alert
            :title="errorMessage"
            type="error"
            show-icon
            :closable="false"
          />
        </div>

        <!-- 加载状态 -->
        <div v-if="isLoading && !aiContent" class="loading-state">
          <el-skeleton :rows="3" animated />
          <div class="loading-text">
            <el-icon class="rotating"><Loading /></el-icon>
            <span>AI正在深度分析中，请稍候...</span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showDialog = false">关闭</el-button>
          <el-button
            v-if="isComplete"
            type="primary"
            @click="copyToClipboard"
          >
            复制分析结果
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElButton, ElDialog, ElIcon, ElAlert, ElSkeleton, ElTimeline, ElTimelineItem, ElMessage } from 'element-plus';
import { MagicStick, Loading, CircleCheck, Clock } from '@element-plus/icons-vue';
import AIStatusIndicator from './AIStatusIndicator.vue';
import aiService, { AIMessageHandler } from '@/services/AIService.js';

const props = defineProps({
  query: {
    type: String,
    required: true
  },
  buttonText: {
    type: String,
    default: 'AI增强分析'
  },
  autoOpen: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['ai-response', 'ai-error', 'ai-complete']);

// 状态管理
const isLoading = ref(false);
const showDialog = ref(false);
const aiEnabled = ref(false);
const messageHandler = ref(new AIMessageHandler());

// AI响应数据
const analysisPhase = ref('');
const queryPlan = ref(null);
const aiContent = ref('');
const isComplete = ref(false);
const hasError = ref(false);
const errorMessage = ref('');
const completedSteps = ref(0);

const dialogTitle = computed(() => {
  if (hasError.value) return '❌ AI分析失败';
  if (isComplete.value) return '✅ AI分析完成';
  if (isLoading.value) return '🤖 AI正在分析...';
  return '🧠 AI增强分析';
});

const handleAIQuery = async () => {
  if (!props.query.trim()) {
    ElMessage.warning('请提供查询内容');
    return;
  }

  // 重置状态
  resetState();
  
  // 显示对话框
  if (props.autoOpen) {
    showDialog.value = true;
  }
  
  isLoading.value = true;
  aiEnabled.value = true;

  try {
    await aiService.sendAIQuery(props.query, handleAIMessage);
  } catch (error) {
    console.error('AI查询失败:', error);
    hasError.value = true;
    errorMessage.value = error.message;
    emit('ai-error', error);
  } finally {
    isLoading.value = false;
  }
};

const handleAIMessage = (message) => {
  messageHandler.value.handleMessage(message);
  const state = messageHandler.value.getState();
  
  // 更新UI状态
  analysisPhase.value = state.analysisPhase;
  queryPlan.value = state.queryPlan;
  aiContent.value = state.aiContent;
  isComplete.value = state.isComplete;
  hasError.value = state.hasError;
  errorMessage.value = state.errorMessage;

  // 更新完成步骤数
  if (message.type === 'query_results') {
    completedSteps.value = queryPlan.value?.steps?.length || 0;
  }

  // 发送事件
  emit('ai-response', message);
  
  if (state.isComplete) {
    emit('ai-complete', {
      analysisPhase: state.analysisPhase,
      queryPlan: state.queryPlan,
      aiContent: state.aiContent
    });
  }
};

const resetState = () => {
  messageHandler.value.reset();
  analysisPhase.value = '';
  queryPlan.value = null;
  aiContent.value = '';
  isComplete.value = false;
  hasError.value = false;
  errorMessage.value = '';
  completedSteps.value = 0;
};

const copyToClipboard = async () => {
  try {
    const textContent = aiContent.value.replace(/<[^>]*>/g, ''); // 移除HTML标签
    await navigator.clipboard.writeText(textContent);
    ElMessage.success('分析结果已复制到剪贴板');
  } catch (error) {
    console.error('复制失败:', error);
    ElMessage.error('复制失败，请手动选择文本复制');
  }
};

// 暴露方法给父组件
defineExpose({
  triggerAI: handleAIQuery,
  resetState,
  getState: () => messageHandler.value.getState()
});
</script>

<style scoped>
.ai-enhanced-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.ai-button {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.ai-button.ai-active {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  border-color: #67c23a;
  color: white;
}

.ai-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(103, 194, 58, 0.3);
}

.ai-icon {
  transition: all 0.3s ease;
}

.ai-spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.ai-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #f56c6c;
  color: white;
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 8px;
  font-weight: bold;
}

.status-indicator {
  margin-left: 4px;
}

.ai-dialog {
  --el-dialog-border-radius: 16px;
}

.ai-response-container {
  max-height: 60vh;
  overflow-y: auto;
  padding: 16px;
}

.analysis-phase {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 20px;
  font-weight: 600;
}

.phase-icon {
  font-size: 20px;
}

.rotating {
  animation: spin 1s linear infinite;
}

.query-plan {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #67c23a;
}

.query-plan h4 {
  margin: 0 0 16px 0;
  color: #2c3e50;
}

.step-content {
  padding-left: 8px;
}

.step-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.step-details {
  font-size: 14px;
  color: #606266;
}

.ai-content {
  margin-bottom: 24px;
}

.ai-content h4 {
  color: #2c3e50;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.content-stream {
  line-height: 1.8;
  color: #2c3e50;
  background: white;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
}

.error-message {
  margin-bottom: 20px;
}

.loading-state {
  text-align: center;
  padding: 40px 20px;
}

.loading-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  color: #606266;
  font-style: italic;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
