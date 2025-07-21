<!-- 
  页面标题组件
  用于在页面顶部显示标题和操作按钮
-->
<template>
  <div class="page-header">
    <div class="header-content">
      <div class="title-section">
        <h2 class="page-title">{{ title }}</h2>
        <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
      </div>
      <div class="actions-section">
        <slot name="actions"></slot>
      </div>
    </div>
    <el-divider v-if="showDivider" />
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  showDivider: {
    type: Boolean,
    default: true
  }
});
</script>

<style scoped>
.page-header {
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
}

.title-section {
  flex: 1;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.page-subtitle {
  margin: 5px 0 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.actions-section {
  display: flex;
  gap: 10px;
  align-items: center;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .actions-section {
    margin-top: 10px;
    width: 100%;
    justify-content: flex-end;
  }
}
</style> 
 
 
 
 