<template>
  <div class="custom-icon" :class="iconClass" :style="iconStyle">
    <!-- 质量相关图标 -->
    <svg v-if="name === 'quality'" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/>
    </svg>
    
    <!-- 库存相关图标 -->
    <svg v-else-if="name === 'inventory'" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z"/>
      <path d="M12 12L2 7L12 2L22 7L12 12Z" fill="none" stroke="currentColor" stroke-width="1"/>
    </svg>
    
    <!-- 趋势上升图标 -->
    <svg v-else-if="name === 'trend-up'" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 17L9 11L13 15L21 7"/>
      <path d="M14 7H21V14" fill="none" stroke="currentColor" stroke-width="2"/>
    </svg>
    
    <!-- 趋势下降图标 -->
    <svg v-else-if="name === 'trend-down'" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 7L9 13L13 9L21 17"/>
      <path d="M14 17H21V10" fill="none" stroke="currentColor" stroke-width="2"/>
    </svg>
    
    <!-- 对比分析图标 -->
    <svg v-else-if="name === 'compare'" viewBox="0 0 24 24" fill="currentColor">
      <rect x="3" y="8" width="4" height="13" rx="1"/>
      <rect x="10" y="4" width="4" height="17" rx="1"/>
      <rect x="17" y="11" width="4" height="10" rx="1"/>
    </svg>
    
    <!-- 分布图标 -->
    <svg v-else-if="name === 'distribution'" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M12 2A10 10 0 0 1 22 12H12V2Z"/>
      <path d="M12 12L18.36 18.36" stroke="currentColor" stroke-width="1"/>
    </svg>
    
    <!-- 供应商图标 -->
    <svg v-else-if="name === 'supplier'" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z"/>
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M8 12H16" stroke="currentColor" stroke-width="1"/>
    </svg>
    
    <!-- 工厂图标 -->
    <svg v-else-if="name === 'factory'" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 21H21V19H3V21Z"/>
      <path d="M5 19V13L9 9V19H5Z"/>
      <path d="M9 19V9L13 5V19H9Z"/>
      <path d="M13 19V5L17 9V19H13Z"/>
      <circle cx="7" cy="16" r="1"/>
      <circle cx="11" cy="14" r="1"/>
      <circle cx="15" cy="16" r="1"/>
    </svg>
    
    <!-- 批次图标 -->
    <svg v-else-if="name === 'batch'" viewBox="0 0 24 24" fill="currentColor">
      <rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M7 8H17"/>
      <path d="M7 12H17"/>
      <path d="M7 16H13"/>
      <circle cx="17" cy="16" r="1"/>
    </svg>
    
    <!-- 风险警告图标 -->
    <svg v-else-if="name === 'risk'" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L22 20H2L12 2Z" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M12 8V13"/>
      <circle cx="12" cy="17" r="1"/>
    </svg>
    
    <!-- 正常状态图标 -->
    <svg v-else-if="name === 'normal'" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2" fill="none"/>
    </svg>
    
    <!-- 冻结状态图标 -->
    <svg v-else-if="name === 'frozen'" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2V22"/>
      <path d="M5 7L19 17"/>
      <path d="M5 17L19 7"/>
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/>
    </svg>
    
    <!-- 测试图标 -->
    <svg v-else-if="name === 'test'" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 2V6H15V2"/>
      <path d="M9 6L7 22H17L15 6"/>
      <circle cx="12" cy="14" r="2" fill="none" stroke="currentColor" stroke-width="1"/>
    </svg>
    
    <!-- 生产图标 -->
    <svg v-else-if="name === 'production'" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1V3"/>
      <path d="M12 21V23"/>
      <path d="M4.22 4.22L5.64 5.64"/>
      <path d="M18.36 18.36L19.78 19.78"/>
      <path d="M1 12H3"/>
      <path d="M21 12H23"/>
      <path d="M4.22 19.78L5.64 18.36"/>
      <path d="M18.36 5.64L19.78 4.22"/>
    </svg>
    
    <!-- 默认图标 -->
    <svg v-else viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10"/>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [String, Number],
    default: 16
  },
  color: {
    type: String,
    default: 'currentColor'
  },
  className: {
    type: String,
    default: ''
  }
})

const iconClass = computed(() => {
  return [
    'custom-icon',
    `icon-${props.name}`,
    props.className
  ].filter(Boolean).join(' ')
})

const iconStyle = computed(() => {
  return {
    width: typeof props.size === 'number' ? `${props.size}px` : props.size,
    height: typeof props.size === 'number' ? `${props.size}px` : props.size,
    color: props.color
  }
})
</script>

<style scoped>
.custom-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}

.custom-icon svg {
  width: 100%;
  height: 100%;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* 特定图标的颜色主题 */
.icon-quality {
  color: #67c23a;
}

.icon-risk {
  color: #f56c6c;
}

.icon-normal {
  color: #67c23a;
}

.icon-frozen {
  color: #909399;
}

.icon-trend-up {
  color: #67c23a;
}

.icon-trend-down {
  color: #f56c6c;
}

.icon-inventory {
  color: #409eff;
}

.icon-supplier {
  color: #e6a23c;
}

.icon-factory {
  color: #909399;
}

.icon-test {
  color: #409eff;
}

.icon-production {
  color: #e6a23c;
}
</style>
