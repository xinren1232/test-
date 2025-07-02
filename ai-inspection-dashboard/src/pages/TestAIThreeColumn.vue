<template>
  <div class="test-ai-three-column">
    <h1>测试AI三栏布局页面</h1>
    <div class="test-content">
      <div class="left-panel">
        <h3>左侧面板</h3>
        <p>这是左侧面板的内容</p>
      </div>
      
      <div class="center-panel">
        <h3>中间面板</h3>
        <p>这是中间面板的内容</p>
        <button @click="testFunction">测试按钮</button>
      </div>
      
      <div class="right-panel">
        <h3>右侧面板</h3>
        <AnalysisProcessPanel :workflow="testWorkflow" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AnalysisProcessPanel from '../components/AnalysisProcessPanel.vue'

const testWorkflow = ref({
  steps: [
    {
      step: 1,
      name: '问题理解',
      status: 'completed',
      result: {
        intent: 'data-query',
        confidence: 0.9,
        keywords: ['测试', '查询'],
        complexity: 'medium'
      }
    },
    {
      step: 2,
      name: '数据源识别',
      status: 'completed',
      result: [
        {
          table: 'inventory',
          description: '库存数据'
        }
      ]
    }
  ],
  status: 'completed',
  totalTime: 1500
})

const testFunction = () => {
  console.log('测试按钮被点击')
}
</script>

<style scoped>
.test-ai-three-column {
  padding: 20px;
}

.test-content {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.left-panel, .center-panel, .right-panel {
  flex: 1;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.right-panel {
  height: 600px;
}
</style>
