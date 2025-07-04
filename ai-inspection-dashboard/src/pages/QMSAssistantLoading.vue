<template>
  <div class="loading-container">
    <div class="loading-content">
      <!-- 加载动画 -->
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      
      <!-- 加载文字 -->
      <div class="loading-text">
        <h2>正在加载QMS智能助手...</h2>
        <p>请稍候，系统正在为您准备智能问答服务</p>
      </div>
      
      <!-- 进度条 -->
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <div class="progress-text">{{ progress }}%</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const progress = ref(0)

onMounted(() => {
  // 模拟加载进度
  const interval = setInterval(() => {
    if (progress.value < 100) {
      progress.value += Math.random() * 15 + 5 // 随机增加5-20%
      if (progress.value > 100) progress.value = 100
    } else {
      clearInterval(interval)
      // 加载完成后跳转到QMS AI智能助手页面
      setTimeout(() => {
        router.push('/assistant-ai-three-column')
      }, 500)
    }
  }, 200) // 每200ms更新一次进度
})
</script>

<style scoped>
.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  color: white;
}

.loading-spinner {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 40px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4px solid transparent;
  border-top: 4px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: spin 1.5s linear infinite;
}

.spinner-ring:nth-child(2) {
  width: 80%;
  height: 80%;
  top: 10%;
  left: 10%;
  border-top-color: rgba(255, 255, 255, 0.6);
  animation-duration: 2s;
  animation-direction: reverse;
}

.spinner-ring:nth-child(3) {
  width: 60%;
  height: 60%;
  top: 20%;
  left: 20%;
  border-top-color: rgba(255, 255, 255, 0.4);
  animation-duration: 2.5s;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text h2 {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 16px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.loading-text p {
  font-size: 16px;
  margin: 0 0 40px 0;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.progress-container {
  width: 300px;
  margin: 0 auto;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(79, 172, 254, 0.5);
}

.progress-text {
  font-size: 14px;
  font-weight: 500;
  opacity: 0.8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .loading-spinner {
    width: 80px;
    height: 80px;
    margin-bottom: 30px;
  }
  
  .loading-text h2 {
    font-size: 24px;
  }
  
  .loading-text p {
    font-size: 14px;
    margin-bottom: 30px;
  }
  
  .progress-container {
    width: 250px;
  }
}
</style>
