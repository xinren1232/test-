<template>
  <div class="test-page">
    <h1>测试页面</h1>
    <p>这是一个简单的测试页面，用于验证Vue组件是否正常工作。</p>
    <el-button type="primary" @click="handleClick">点击测试</el-button>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'TestPage',
  setup() {
    const message = ref('')

    const handleClick = () => {
      message.value = '按钮点击成功！'
      ElMessage.success('测试成功！')
    }

    return {
      message,
      handleClick
    }
  }
}
</script>

<style scoped>
.test-page {
  padding: 20px;
  text-align: center;
}
</style>
