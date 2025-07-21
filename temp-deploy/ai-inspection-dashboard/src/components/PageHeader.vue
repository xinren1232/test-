<!--
  页面头部组件
  用于显示页面标题和副标题
-->
<template>
  <div class="page-header">
    <div class="header-content">
      <h1 class="title">{{ title }}</h1>
      <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
    </div>
    <div class="header-actions">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
    default: "页面标题"
  },
  subtitle: {
    type: String,
    default: ""
  }
});
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.header-content {
  flex: 1;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  padding: 0;
}

.subtitle {
  font-size: 14px;
  color: #606266;
  margin-top: 8px;
  margin-bottom: 0;
}

.header-actions {
  display: flex;
  align-items: center;
}
</style> 