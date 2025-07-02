<template>
  <div class="three-column-test">
    <!-- 顶部标题栏 -->
    <div class="header">
      <h2>🎯 三栏布局测试页面</h2>
      <p>验证15%:55%:35%布局比例</p>
    </div>

    <!-- 三栏主体布局 -->
    <div class="layout-container">
      <!-- 左侧面板 - 15% -->
      <div class="left-column">
        <div class="panel-header">
          <h3>🛠️ 左侧工具面板</h3>
          <p>宽度: 15%</p>
        </div>
        <div class="panel-content">
          <div class="tool-item">📊 数据分析工具</div>
          <div class="tool-item">📈 图表生成器</div>
          <div class="tool-item">🔍 查询构建器</div>
          <div class="tool-item">📋 报告生成器</div>
          <div class="tool-item">⚙️ 系统设置</div>
        </div>
      </div>

      <!-- 中间面板 - 55% -->
      <div class="center-column">
        <div class="panel-header">
          <h3>💬 中间对话面板</h3>
          <p>宽度: 55%</p>
        </div>
        <div class="panel-content">
          <div class="chat-area">
            <div class="message user-message">
              <div class="message-content">
                <strong>用户:</strong> 分析当前库存状态
              </div>
            </div>
            <div class="message ai-message">
              <div class="message-content">
                <strong>AI助手:</strong> 正在为您分析库存状态...
              </div>
            </div>
          </div>
          <div class="input-area">
            <input type="text" placeholder="输入您的问题..." class="message-input">
            <button class="send-button">发送</button>
          </div>
        </div>
      </div>

      <!-- 右侧面板 - 35% -->
      <div class="right-column">
        <div class="panel-header">
          <h3>🧠 右侧思考面板</h3>
          <p>宽度: 35%</p>
        </div>
        <div class="panel-content">
          <div class="thinking-step">
            <div class="step-title">🔍 步骤1: 问题分析</div>
            <div class="step-content">正在分析用户问题的意图和类型...</div>
          </div>
          <div class="thinking-step">
            <div class="step-title">📊 步骤2: 数据查询</div>
            <div class="step-content">正在查询相关数据源...</div>
          </div>
          <div class="thinking-step">
            <div class="step-title">🤖 步骤3: AI分析</div>
            <div class="step-content">正在进行智能分析...</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('🎯 三栏布局测试页面已加载')
  
  // 检查布局比例
  setTimeout(() => {
    const container = document.querySelector('.layout-container')
    const left = document.querySelector('.left-column')
    const center = document.querySelector('.center-column')
    const right = document.querySelector('.right-column')
    
    if (container && left && center && right) {
      const containerWidth = container.offsetWidth
      const leftWidth = left.offsetWidth
      const centerWidth = center.offsetWidth
      const rightWidth = right.offsetWidth
      
      console.log('📐 布局宽度检查:')
      console.log(`容器总宽度: ${containerWidth}px`)
      console.log(`左侧面板: ${leftWidth}px (${(leftWidth/containerWidth*100).toFixed(1)}%)`)
      console.log(`中间面板: ${centerWidth}px (${(centerWidth/containerWidth*100).toFixed(1)}%)`)
      console.log(`右侧面板: ${rightWidth}px (${(rightWidth/containerWidth*100).toFixed(1)}%)`)
    }
  }, 100)
})
</script>

<style scoped>
.three-column-test {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  text-align: center;
}

.header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
}

.header p {
  margin: 0;
  opacity: 0.9;
}

.layout-container {
  flex: 1;
  display: flex;
  background: #e1e5e9;
  gap: 1px;
  overflow: hidden;
}

/* 左侧面板 - 15% */
.left-column {
  width: 15%;
  min-width: 200px;
  background: white;
  display: flex;
  flex-direction: column;
}

/* 中间面板 - 55% */
.center-column {
  width: 55%;
  min-width: 400px;
  background: white;
  display: flex;
  flex-direction: column;
}

/* 右侧面板 - 35% */
.right-column {
  width: 35%;
  min-width: 300px;
  background: white;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e1e5e9;
  background: #f8f9fa;
}

.panel-header h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #333;
}

.panel-header p {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.panel-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.tool-item {
  padding: 8px 12px;
  margin: 4px 0;
  background: #f8f9fa;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.tool-item:hover {
  background: #e9ecef;
}

.chat-area {
  flex: 1;
  margin-bottom: 16px;
}

.message {
  margin: 8px 0;
  padding: 12px;
  border-radius: 8px;
}

.user-message {
  background: #e3f2fd;
  margin-left: 20%;
}

.ai-message {
  background: #f3e5f5;
  margin-right: 20%;
}

.input-area {
  display: flex;
  gap: 8px;
}

.message-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.send-button {
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.thinking-step {
  margin: 12px 0;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.step-title {
  font-weight: bold;
  margin-bottom: 4px;
  color: #333;
}

.step-content {
  font-size: 14px;
  color: #666;
}
</style>
