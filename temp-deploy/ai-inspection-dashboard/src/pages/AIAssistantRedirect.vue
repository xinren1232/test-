<template>
  <div class="redirect-container">
    <div class="loading-content">
      <div class="loading-icon">🤖</div>
      <h2>正在启动 IQE AI 智能助手...</h2>
      <div class="loading-bar">
        <div class="loading-progress" :style="{ width: progress + '%' }"></div>
      </div>
      <p class="loading-text">{{ loadingText }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const progress = ref(0)
const loadingText = ref('初始化AI系统...')

const loadingSteps = [
  { text: '初始化AI系统...', duration: 500 },
  { text: '连接DeepSeek大模型...', duration: 800 },
  { text: '加载质量管理数据...', duration: 600 },
  { text: '准备三栏布局界面...', duration: 400 },
  { text: '启动智能助手...', duration: 300 }
]

onMounted(async () => {
  let currentProgress = 0
  
  for (let i = 0; i < loadingSteps.length; i++) {
    const step = loadingSteps[i]
    loadingText.value = step.text
    
    // 动画进度条
    const targetProgress = ((i + 1) / loadingSteps.length) * 100
    const progressStep = (targetProgress - currentProgress) / (step.duration / 50)
    
    while (currentProgress < targetProgress) {
      currentProgress += progressStep
      progress.value = Math.min(currentProgress, targetProgress)
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  // 跳转到三栏布局AI助手页面
  window.location.href = '/#/assistant-ai-three-column'
})
</script>

<style scoped>
.redirect-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
}

.loading-content {
  text-align: center;
  color: white;
  max-width: 400px;
  padding: 40px;
}

.loading-icon {
  font-size: 80px;
  margin-bottom: 20px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

h2 {
  margin: 0 0 30px 0;
  font-size: 24px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.loading-bar {
  width: 100%;
  height: 8px;
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 20px;
}

.loading-progress {
  height: 100%;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(79, 172, 254, 0.5);
}

.loading-text {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}
</style>
