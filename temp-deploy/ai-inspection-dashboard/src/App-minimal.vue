<template>
  <div class="minimal-app">
    <h1>🎉 Vue应用运行成功！</h1>
    <p>当前时间: {{ currentTime }}</p>
    <p>计数器: {{ count }}</p>
    <button @click="count++">点击增加</button>
    
    <div class="status">
      <h2>系统状态</h2>
      <ul>
        <li>✅ Vue 3 已加载</li>
        <li>✅ 响应式数据正常</li>
        <li>✅ 事件处理正常</li>
        <li>✅ 模板渲染正常</li>
      </ul>
    </div>
    
    <div class="navigation">
      <h2>导航测试</h2>
      <p>如果看到这个页面，说明Vue应用已经成功运行！</p>
      <p>
        <a href="/debug.html">🔧 调试页面</a> |
        <a href="/force-refresh.html">🔄 强制刷新工具</a>
      </p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'MinimalApp',
  setup() {
    const count = ref(0);
    const currentTime = ref('');
    
    const updateTime = () => {
      currentTime.value = new Date().toLocaleString();
    };
    
    onMounted(() => {
      updateTime();
      setInterval(updateTime, 1000);
      console.log('✅ 最小化Vue应用挂载成功');
    });
    
    return {
      count,
      currentTime
    };
  }
};
</script>

<style scoped>
.minimal-app {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: Arial, sans-serif;
  text-align: center;
}

h1 {
  color: #409EFF;
  font-size: 2.5em;
  margin-bottom: 20px;
}

p {
  font-size: 1.2em;
  margin: 10px 0;
  color: #333;
}

button {
  background-color: #409EFF;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin: 20px;
}

button:hover {
  background-color: #337ecc;
}

.status {
  background-color: #f0f9ff;
  border: 1px solid #409EFF;
  border-radius: 8px;
  padding: 20px;
  margin: 30px 0;
}

.status h2 {
  color: #409EFF;
  margin-top: 0;
}

.status ul {
  text-align: left;
  display: inline-block;
}

.status li {
  margin: 8px 0;
  color: #67C23A;
}

.navigation {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin: 30px 0;
}

.navigation h2 {
  color: #333;
  margin-top: 0;
}

.navigation a {
  color: #409EFF;
  text-decoration: none;
  margin: 0 10px;
}

.navigation a:hover {
  text-decoration: underline;
}
</style>
