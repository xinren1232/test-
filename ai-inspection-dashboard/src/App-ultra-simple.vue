<template>
  <div id="app">
    <h1>🎯 Vue应用测试</h1>
    <p>当前时间: {{ currentTime }}</p>
    <router-view />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'App',
  setup() {
    const currentTime = ref('')

    const updateTime = () => {
      currentTime.value = new Date().toLocaleString()
    }

    onMounted(() => {
      console.log('🎉 App组件挂载成功！')
      updateTime()
      setInterval(updateTime, 1000)
    })

    return {
      currentTime
    }
  }
}
</script>

<style>
#app {
  padding: 20px;
  text-align: center;
  font-family: Arial, sans-serif;
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
