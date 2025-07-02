<template>
  <div class="ai-status-indicator">
    <el-tooltip :content="tooltipContent" placement="bottom">
      <div class="status-badge" :class="statusClass">
        <el-icon class="status-icon">
          <component :is="statusIcon" />
        </el-icon>
        <span class="status-text">{{ statusText }}</span>
        <div class="status-dot" :class="dotClass"></div>
      </div>
    </el-tooltip>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ElIcon, ElTooltip } from 'element-plus';
import { MagicStick, Warning, Loading, CircleCheck } from '@element-plus/icons-vue';
import aiService from '@/services/AIService.js';

const props = defineProps({
  showText: {
    type: Boolean,
    default: true
  },
  size: {
    type: String,
    default: 'default', // small, default, large
    validator: (value) => ['small', 'default', 'large'].includes(value)
  }
});

const aiStatus = ref('checking'); // checking, healthy, error, disabled
const healthData = ref(null);
const checkInterval = ref(null);

const statusIcon = computed(() => {
  switch (aiStatus.value) {
    case 'checking':
      return Loading;
    case 'healthy':
      return MagicStick;
    case 'error':
      return Warning;
    case 'disabled':
      return MagicStick;
    default:
      return MagicStick;
  }
});

const statusText = computed(() => {
  if (!props.showText) return '';
  
  switch (aiStatus.value) {
    case 'checking':
      return '检查中';
    case 'healthy':
      return 'AI就绪';
    case 'error':
      return 'AI异常';
    case 'disabled':
      return 'AI关闭';
    default:
      return 'AI状态';
  }
});

const statusClass = computed(() => {
  const baseClass = `status-${props.size}`;
  const statusClass = `status-${aiStatus.value}`;
  return [baseClass, statusClass];
});

const dotClass = computed(() => {
  return `dot-${aiStatus.value}`;
});

const tooltipContent = computed(() => {
  if (!healthData.value) {
    return 'AI服务状态检查中...';
  }

  const health = healthData.value;
  let content = `AI服务状态: ${health.status === 'healthy' ? '正常' : '异常'}\n`;
  
  if (health.deepSeek) {
    content += `DeepSeek API: ${health.deepSeek.status === 'healthy' ? '正常' : '异常'}\n`;
  }
  
  if (health.queryAgent) {
    content += `查询代理: ${health.queryAgent.status === 'healthy' ? '正常' : '异常'}\n`;
    content += `可用工具: ${health.queryAgent.toolsCount || 0}个\n`;
  }
  
  content += `AI增强: ${health.isEnabled ? '已启用' : '已禁用'}`;
  
  return content;
});

const checkAIHealth = async () => {
  try {
    const health = await aiService.checkHealth();
    healthData.value = health;
    
    if (health.status === 'healthy') {
      aiStatus.value = health.isEnabled ? 'healthy' : 'disabled';
    } else {
      aiStatus.value = 'error';
    }
  } catch (error) {
    console.error('AI健康检查失败:', error);
    aiStatus.value = 'error';
    healthData.value = {
      status: 'error',
      error: error.message
    };
  }
};

const startHealthCheck = () => {
  // 立即检查一次
  checkAIHealth();
  
  // 每30秒检查一次
  checkInterval.value = setInterval(checkAIHealth, 30000);
};

const stopHealthCheck = () => {
  if (checkInterval.value) {
    clearInterval(checkInterval.value);
    checkInterval.value = null;
  }
};

onMounted(() => {
  startHealthCheck();
});

onUnmounted(() => {
  stopHealthCheck();
});

// 暴露方法给父组件
defineExpose({
  checkHealth: checkAIHealth,
  getStatus: () => aiStatus.value,
  getHealthData: () => healthData.value
});
</script>

<style scoped>
.ai-status-indicator {
  display: inline-block;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
}

.status-badge:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

/* 尺寸变体 */
.status-small {
  padding: 2px 6px;
  font-size: 12px;
}

.status-small .status-icon {
  font-size: 14px;
}

.status-default {
  padding: 4px 8px;
  font-size: 14px;
}

.status-default .status-icon {
  font-size: 16px;
}

.status-large {
  padding: 6px 12px;
  font-size: 16px;
}

.status-large .status-icon {
  font-size: 18px;
}

/* 状态颜色 */
.status-checking {
  color: #909399;
  border-color: rgba(144, 147, 153, 0.3);
}

.status-healthy {
  color: #67c23a;
  border-color: rgba(103, 194, 58, 0.3);
}

.status-error {
  color: #f56c6c;
  border-color: rgba(245, 108, 108, 0.3);
}

.status-disabled {
  color: #c0c4cc;
  border-color: rgba(192, 196, 204, 0.3);
}

.status-icon {
  flex-shrink: 0;
}

.status-text {
  font-weight: 500;
  white-space: nowrap;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  position: relative;
}

.dot-checking {
  background: #909399;
  animation: pulse 2s infinite;
}

.dot-healthy {
  background: #67c23a;
  animation: pulse-success 2s infinite;
}

.dot-error {
  background: #f56c6c;
  animation: pulse-error 2s infinite;
}

.dot-disabled {
  background: #c0c4cc;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(144, 147, 153, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(144, 147, 153, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(144, 147, 153, 0);
  }
}

@keyframes pulse-success {
  0% {
    box-shadow: 0 0 0 0 rgba(103, 194, 58, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(103, 194, 58, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(103, 194, 58, 0);
  }
}

@keyframes pulse-error {
  0% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(245, 108, 108, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0);
  }
}

/* 旋转动画 */
.status-checking .status-icon {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
