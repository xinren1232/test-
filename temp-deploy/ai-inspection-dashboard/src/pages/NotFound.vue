<template>
  <div class="not-found-page">
    <div class="not-found-container">
      <h1 class="error-code">404</h1>
      <h2 class="error-title">页面未找到</h2>
      <p class="error-message">抱歉，您访问的页面不存在或已被移除</p>
      <div class="error-actions">
        <router-link to="/" class="return-home">返回首页</router-link>
        <button class="go-back" @click="goBack">返回上一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const goBack = () => {
  router.go(-1);
};
</script>

<style scoped>
.not-found-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.not-found-container {
  text-align: center;
  padding: 50px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.error-code {
  font-size: 72px;
  color: #409EFF;
  margin: 0;
}

.error-title {
  font-size: 24px;
  margin: 20px 0;
}

.error-message {
  color: #606266;
  margin-bottom: 30px;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.return-home, .go-back {
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  text-decoration: none;
}

.return-home {
  background-color: #409EFF;
  color: white;
  border: none;
}

.return-home:hover {
  background-color: #66b1ff;
}

.go-back {
  background-color: white;
  color: #409EFF;
  border: 1px solid #409EFF;
}

.go-back:hover {
  color: #66b1ff;
  border-color: #66b1ff;
}
</style>
