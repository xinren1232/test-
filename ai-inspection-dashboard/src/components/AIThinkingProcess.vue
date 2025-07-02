<template>
  <div class="ai-thinking-process">
    <!-- 思考过程标题 -->
    <div class="thinking-header">
      <div class="header-content">
        <span class="thinking-icon">🧠</span>
        <h3 class="thinking-title">AI思考过程</h3>
        <div class="thinking-status" :class="statusClass">
          <span class="status-dot"></span>
          <span class="status-text">{{ statusText }}</span>
        </div>
      </div>
      
      <!-- 控制按钮 -->
      <div class="thinking-controls">
        <el-button 
          size="small" 
          @click="toggleExpanded"
          :icon="isExpanded ? 'ArrowUp' : 'ArrowDown'"
        >
          {{ isExpanded ? '收起' : '展开' }}
        </el-button>
        <el-button 
          size="small" 
          @click="clearThinking"
          icon="Delete"
          v-if="thinkingSteps.length > 0"
        >
          清空
        </el-button>
      </div>
    </div>

    <!-- 思考步骤展示 -->
    <div class="thinking-content" v-show="isExpanded">
      <div class="thinking-timeline">
        <div 
          v-for="(step, index) in thinkingSteps" 
          :key="step.id"
          class="thinking-step"
          :class="{ 
            active: step.status === 'processing',
            completed: step.status === 'completed',
            error: step.status === 'error'
          }"
        >
          <!-- 步骤指示器 -->
          <div class="step-indicator">
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-connector" v-if="index < thinkingSteps.length - 1"></div>
          </div>

          <!-- 步骤内容 -->
          <div class="step-content">
            <div class="step-header">
              <span class="step-icon">{{ getStepIcon(step.type) }}</span>
              <h4 class="step-title">{{ step.title }}</h4>
              <span class="step-time">{{ formatTime(step.timestamp) }}</span>
            </div>

            <div class="step-description">{{ step.description }}</div>

            <!-- 步骤详情 -->
            <div class="step-details" v-if="step.details">
              <!-- 数据查询详情 -->
              <div v-if="step.type === 'data_query'" class="query-details">
                <div class="query-info">
                  <span class="query-label">查询类型:</span>
                  <span class="query-value">{{ step.details.queryType }}</span>
                </div>
                <div class="query-info" v-if="step.details.parameters">
                  <span class="query-label">查询参数:</span>
                  <div class="query-params">
                    <span 
                      v-for="(value, key) in step.details.parameters" 
                      :key="key"
                      class="param-tag"
                    >
                      {{ key }}: {{ value }}
                    </span>
                  </div>
                </div>
                <div class="query-info" v-if="step.details.resultCount">
                  <span class="query-label">结果数量:</span>
                  <span class="query-value">{{ step.details.resultCount }}条</span>
                </div>
              </div>

              <!-- 场景识别详情 -->
              <div v-if="step.type === 'scenario_analysis'" class="scenario-details">
                <div class="scenario-confidence">
                  <span class="confidence-label">识别置信度:</span>
                  <div class="confidence-bar">
                    <div 
                      class="confidence-fill" 
                      :style="{ width: step.details.confidence + '%' }"
                    ></div>
                    <span class="confidence-text">{{ step.details.confidence }}%</span>
                  </div>
                </div>
                <div class="scenario-reasoning" v-if="step.details.reasoning">
                  <span class="reasoning-label">推理依据:</span>
                  <span class="reasoning-text">{{ step.details.reasoning }}</span>
                </div>
              </div>

              <!-- AI分析详情 -->
              <div v-if="step.type === 'ai_analysis'" class="analysis-details">
                <div class="analysis-metrics">
                  <div class="metric-item" v-if="step.details.tokenCount">
                    <span class="metric-label">Token数量:</span>
                    <span class="metric-value">{{ step.details.tokenCount }}</span>
                  </div>
                  <div class="metric-item" v-if="step.details.responseTime">
                    <span class="metric-label">响应时间:</span>
                    <span class="metric-value">{{ step.details.responseTime }}ms</span>
                  </div>
                  <div class="metric-item" v-if="step.details.model">
                    <span class="metric-label">AI模型:</span>
                    <span class="metric-value">{{ step.details.model }}</span>
                  </div>
                </div>
              </div>

              <!-- 工具调用详情 -->
              <div v-if="step.type === 'tool_call'" class="tool-details">
                <div class="tool-info">
                  <span class="tool-label">工具名称:</span>
                  <span class="tool-value">{{ step.details.toolName }}</span>
                </div>
                <div class="tool-info" v-if="step.details.input">
                  <span class="tool-label">输入参数:</span>
                  <pre class="tool-input">{{ JSON.stringify(step.details.input, null, 2) }}</pre>
                </div>
              </div>
            </div>

            <!-- 步骤状态 -->
            <div class="step-status">
              <span v-if="step.status === 'processing'" class="status-processing">
                <i class="el-icon-loading"></i> 处理中...
              </span>
              <span v-else-if="step.status === 'completed'" class="status-completed">
                <i class="el-icon-check"></i> 完成 ({{ step.duration }}ms)
              </span>
              <span v-else-if="step.status === 'error'" class="status-error">
                <i class="el-icon-close"></i> 错误: {{ step.error }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 思考总结 -->
      <div class="thinking-summary" v-if="thinkingSummary">
        <div class="summary-header">
          <span class="summary-icon">📊</span>
          <h4 class="summary-title">思考总结</h4>
        </div>
        <div class="summary-content">
          <div class="summary-metrics">
            <div class="metric">
              <span class="metric-label">总耗时:</span>
              <span class="metric-value">{{ thinkingSummary.totalTime }}ms</span>
            </div>
            <div class="metric">
              <span class="metric-label">步骤数:</span>
              <span class="metric-value">{{ thinkingSummary.stepCount }}</span>
            </div>
            <div class="metric">
              <span class="metric-label">数据查询:</span>
              <span class="metric-value">{{ thinkingSummary.queryCount }}次</span>
            </div>
          </div>
          <div class="summary-description">
            {{ thinkingSummary.description }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  steps: {
    type: Array,
    default: () => []
  },
  status: {
    type: String,
    default: 'idle' // idle, thinking, completed, error
  },
  autoExpand: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['clear', 'step-click'])

// 响应式数据
const isExpanded = ref(props.autoExpand)
const thinkingSteps = ref([])

// 计算属性
const statusClass = computed(() => {
  return {
    'status-idle': props.status === 'idle',
    'status-thinking': props.status === 'thinking',
    'status-completed': props.status === 'completed',
    'status-error': props.status === 'error'
  }
})

const statusText = computed(() => {
  const statusMap = {
    idle: '待机',
    thinking: '思考中',
    completed: '完成',
    error: '错误'
  }
  return statusMap[props.status] || '未知'
})

const thinkingSummary = computed(() => {
  if (thinkingSteps.value.length === 0) return null
  
  const completedSteps = thinkingSteps.value.filter(step => step.status === 'completed')
  const totalTime = completedSteps.reduce((sum, step) => sum + (step.duration || 0), 0)
  const queryCount = thinkingSteps.value.filter(step => step.type === 'data_query').length
  
  return {
    totalTime,
    stepCount: thinkingSteps.value.length,
    queryCount,
    description: `AI通过${thinkingSteps.value.length}个步骤完成了分析，包含${queryCount}次数据查询，总耗时${totalTime}毫秒。`
  }
})

// 监听props变化
watch(() => props.steps, (newSteps) => {
  thinkingSteps.value = [...newSteps]
}, { deep: true, immediate: true })

// 方法
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const clearThinking = () => {
  thinkingSteps.value = []
  emit('clear')
}

const getStepIcon = (type) => {
  const iconMap = {
    scenario_analysis: '🎯',
    data_query: '🔍',
    ai_analysis: '🧠',
    tool_call: '🔧',
    result_generation: '📝',
    validation: '✅',
    error_handling: '⚠️'
  }
  return iconMap[type] || '📋'
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
}

// 暴露方法给父组件
defineExpose({
  addStep: (step) => {
    thinkingSteps.value.push({
      id: Date.now() + Math.random(),
      timestamp: Date.now(),
      status: 'processing',
      ...step
    })
  },
  updateStep: (stepId, updates) => {
    const stepIndex = thinkingSteps.value.findIndex(step => step.id === stepId)
    if (stepIndex !== -1) {
      thinkingSteps.value[stepIndex] = { ...thinkingSteps.value[stepIndex], ...updates }
    }
  },
  completeStep: (stepId, duration) => {
    const stepIndex = thinkingSteps.value.findIndex(step => step.id === stepId)
    if (stepIndex !== -1) {
      thinkingSteps.value[stepIndex].status = 'completed'
      thinkingSteps.value[stepIndex].duration = duration
    }
  },
  errorStep: (stepId, error) => {
    const stepIndex = thinkingSteps.value.findIndex(step => step.id === stepId)
    if (stepIndex !== -1) {
      thinkingSteps.value[stepIndex].status = 'error'
      thinkingSteps.value[stepIndex].error = error
    }
  },
  clear: () => {
    thinkingSteps.value = []
  }
})
</script>

<style scoped>
.ai-thinking-process {
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  overflow: hidden;
}

.thinking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.thinking-icon {
  font-size: 24px;
}

.thinking-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.thinking-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 12px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #52c41a;
}

.status-thinking .status-dot {
  background: #faad14;
  animation: pulse 1.5s infinite;
}

.status-error .status-dot {
  background: #ff4d4f;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.thinking-controls {
  display: flex;
  gap: 8px;
}

.thinking-content {
  padding: 20px;
}

.thinking-timeline {
  position: relative;
}

.thinking-step {
  display: flex;
  margin-bottom: 24px;
  position: relative;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 16px;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e9ecef;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.thinking-step.active .step-number {
  background: #faad14;
  color: white;
  animation: pulse 1.5s infinite;
}

.thinking-step.completed .step-number {
  background: #52c41a;
  color: white;
}

.thinking-step.error .step-number {
  background: #ff4d4f;
  color: white;
}

.step-connector {
  width: 2px;
  height: 40px;
  background: #e9ecef;
  margin-top: 8px;
}

.thinking-step.completed .step-connector {
  background: #52c41a;
}

.step-content {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.thinking-step.active .step-content {
  border-color: #faad14;
  box-shadow: 0 2px 8px rgba(250, 173, 20, 0.15);
}

.thinking-step.completed .step-content {
  border-color: #52c41a;
}

.thinking-step.error .step-content {
  border-color: #ff4d4f;
  background: #fff2f0;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.step-icon {
  font-size: 18px;
}

.step-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.step-time {
  font-size: 12px;
  color: #999;
}

.step-description {
  color: #666;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 12px;
}

.step-details {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
  font-size: 12px;
}

.query-details, .scenario-details, .analysis-details, .tool-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.query-info, .tool-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.query-label, .tool-label, .confidence-label, .reasoning-label, .metric-label {
  font-weight: 600;
  color: #333;
  min-width: 80px;
}

.query-value, .tool-value {
  color: #666;
}

.query-params {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.param-tag {
  background: #e6f7ff;
  color: #1890ff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.confidence-bar {
  position: relative;
  width: 100px;
  height: 16px;
  background: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  background: linear-gradient(90deg, #52c41a 0%, #faad14 50%, #ff4d4f 100%);
  transition: width 0.3s ease;
}

.confidence-text {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.analysis-metrics {
  display: flex;
  gap: 16px;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.metric-value {
  color: #1890ff;
  font-weight: 600;
}

.tool-input {
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 8px;
  font-size: 11px;
  max-height: 100px;
  overflow-y: auto;
}

.step-status {
  font-size: 12px;
}

.status-processing {
  color: #faad14;
}

.status-completed {
  color: #52c41a;
}

.status-error {
  color: #ff4d4f;
}

.thinking-summary {
  margin-top: 24px;
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e9ecef;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.summary-icon {
  font-size: 18px;
}

.summary-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.summary-metrics {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
}

.metric {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.summary-description {
  color: #666;
  font-size: 13px;
  line-height: 1.5;
}
</style>
