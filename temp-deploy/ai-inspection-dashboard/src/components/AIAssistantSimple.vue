<template>
  <div class="ai-assistant-simple">
    <h1>🤖 AI智能助手测试页面</h1>
    <p>如果您能看到这个页面，说明路由配置正确。</p>
    
    <div class="test-layout">
      <!-- 左侧工具区 -->
      <div class="left-panel">
        <h3>🛠️ 工具区</h3>
        <div class="tool-item">📊 数据分析</div>
        <div class="tool-item">📈 图表生成</div>
        <div class="tool-item">🔍 网络搜索</div>
      </div>
      
      <!-- 中间对话区 -->
      <div class="center-panel">
        <h3>💬 对话区</h3>
        <div class="message">
          <strong>AI:</strong> 您好！我是IQE AI智能助手，请问有什么可以帮助您的吗？
        </div>
        <input type="text" placeholder="请输入您的问题..." class="input-box" />
      </div>
      
      <!-- 右侧思考区 -->
      <div class="right-panel">
        <h3>🧠 思考过程</h3>
        <div class="process-step">
          <div class="step">🤔 理解问题</div>
          <div class="step">🔍 分析类型</div>
          <div class="step">🛠️ 选择工具</div>
          <div class="step">💬 生成回答</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AIAssistantSimple'
}
</script>

<style scoped>
.ai-assistant-simple {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.test-layout {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.left-panel, .center-panel, .right-panel {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.left-panel {
  width: 250px;
}

.center-panel {
  flex: 1;
}

.right-panel {
  width: 300px;
}

.tool-item {
  padding: 10px;
  margin: 5px 0;
  background: #f0f0f0;
  border-radius: 4px;
  cursor: pointer;
}

.tool-item:hover {
  background: #e0e0e0;
}

.message {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 15px;
}

.input-box {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.step {
  padding: 8px 12px;
  margin: 5px 0;
  background: #e3f2fd;
  border-radius: 4px;
  border-left: 3px solid #2196f3;
}
</style>
