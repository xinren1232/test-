<template>
  <div class="minimal-test">
    <h1>最小测试页面</h1>
    <p>当前时间: {{ currentTime }}</p>
    <p>Vue应用状态: 正常运行</p>
    <el-button type="primary" @click="showMessage">测试按钮</el-button>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElButton, ElMessage } from 'element-plus'

export default {
  name: 'MinimalTest',
  components: {
    ElButton
  },
  setup() {
    const currentTime = ref('')

    const updateTime = () => {
      currentTime.value = new Date().toLocaleString()
    }

    const showMessage = () => {
      ElMessage.success('测试成功！Vue应用正常运行')
    }

    onMounted(() => {
      updateTime()
      setInterval(updateTime, 1000)
    })

    return {
      currentTime,
      showMessage
    }
  }
}
</script>

<style scoped>
.minimal-test {
  padding: 20px;
  text-align: center;
}

h1 {
  color: #409eff;
  margin-bottom: 20px;
}

p {
  margin: 10px 0;
  font-size: 16px;
}
</style>
