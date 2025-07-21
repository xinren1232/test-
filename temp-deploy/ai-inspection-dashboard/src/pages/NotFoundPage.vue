<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1>页面未找到</h1>
      <p>抱歉，您访问的页面不存在或已被移除</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFoundPage',
  methods: {
    goHome() {
      this.$router.push('/');
    }
  }
}
</script>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 120px);
  text-align: center;
}

.not-found-content {
  max-width: 500px;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: var(--el-color-primary);
  line-height: 1.2;
  margin-bottom: 20px;
}

h1 {
  font-size: 32px;
  margin-bottom: 20px;
  color: #303133;
}

p {
  font-size: 18px;
  color: #606266;
  margin-bottom: 30px;
}
</style> 