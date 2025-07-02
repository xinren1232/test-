<template>
  <div>
    <h1>后端连通性测试</h1>
    <p>
      这个页面用于测试前端和后端服务之间的连接是否正常。
    </p>
    <p>
      点击下面的按钮来向后端的 <code>/api/health</code> 端点发送一个请求。
    </p>
    <el-button @click="testBackend" :loading="loading" type="primary">
      发送测试请求
    </el-button>

    <div v-if="response" class="result-box success">
      <h3>成功! 后端响应:</h3>
      <pre>{{ response }}</pre>
    </div>

    <div v-if="error" class="result-box error">
      <h3>失败! 错误信息:</h3>
      <pre>{{ error }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const loading = ref(false);
const response = ref(null);
const error = ref(null);

const testBackend = async () => {
  loading.value = true;
  response.value = null;
  error.value = null;
  try {
    // 根据Vite的代理设置，这个请求会被转发到 http://localhost:3001/api/health
    const res = await axios.get('/api/health');
    response.value = res.data;
  } catch (e) {
    error.value = `错误信息: ${e.message}\n\n`;
    if (e.response) {
      error.value += `响应状态: ${e.response.status}\n`;
      error.value += `响应数据: ${JSON.stringify(e.response.data, null, 2)}`;
    } else {
      error.value += '请求未能收到响应，请检查后端服务是否正在运行，以及Vite代理配置是否正确。';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.result-box {
  margin-top: 20px;
  padding: 15px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: monospace;
}
.success {
  border: 1px solid #67c23a;
  background-color: #f0f9eb;
  color: #67c23a;
}
.error {
  border: 1px solid #f56c6c;
  background-color: #fef0f0;
  color: #f56c6c;
}
</style> 