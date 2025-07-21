<template>
  <div class="opensource-tools-status">
    <!-- 工具状态概览 -->
    <div class="status-overview">
      <h3 class="section-title">
        <el-icon><Tools /></el-icon>
        开源工具集成状态
      </h3>
      
      <div class="overview-cards">
        <div class="overview-card">
          <div class="card-icon success">✅</div>
          <div class="card-content">
            <div class="card-value">{{ statusReport.summary.enabled }}</div>
            <div class="card-label">已启用工具</div>
          </div>
        </div>
        
        <div class="overview-card">
          <div class="card-icon warning">⚠️</div>
          <div class="card-content">
            <div class="card-value">{{ statusReport.summary.disabled }}</div>
            <div class="card-label">待解决工具</div>
          </div>
        </div>
        
        <div class="overview-card">
          <div class="card-icon info">📊</div>
          <div class="card-content">
            <div class="card-value">{{ statusReport.summary.enabledPercentage }}%</div>
            <div class="card-label">集成完成度</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分类工具状态 -->
    <div class="tools-categories">
      <div class="category-section">
        <h4 class="category-title">
          <el-icon><PieChart /></el-icon>
          图表可视化工具
        </h4>
        <div class="tools-grid">
          <div class="tool-card" :class="{ enabled: chartConfig.echarts.enabled }">
            <div class="tool-header">
              <div class="tool-name">ECharts</div>
              <el-tag :type="chartConfig.echarts.enabled ? 'success' : 'danger'" size="small">
                {{ chartConfig.echarts.enabled ? '已启用' : '未启用' }}
              </el-tag>
            </div>
            <div class="tool-info">
              <div class="tool-version">v{{ chartConfig.echarts.version }}</div>
              <div class="tool-features">
                <el-tag v-for="theme in chartConfig.echarts.themes.slice(0, 3)" 
                        :key="theme" size="mini" type="info">
                  {{ theme }}
                </el-tag>
              </div>
            </div>
          </div>

          <div class="tool-card" :class="{ enabled: chartConfig.chartjs.enabled }">
            <div class="tool-header">
              <div class="tool-name">Chart.js</div>
              <el-tag :type="chartConfig.chartjs.enabled ? 'success' : 'warning'" size="small">
                {{ chartConfig.chartjs.enabled ? '已启用' : '依赖冲突' }}
              </el-tag>
            </div>
            <div class="tool-info">
              <div class="tool-version">v{{ chartConfig.chartjs.version }}</div>
              <div class="tool-status">等待依赖解决</div>
            </div>
          </div>

          <div class="tool-card" :class="{ enabled: chartConfig.d3.enabled }">
            <div class="tool-header">
              <div class="tool-name">D3.js</div>
              <el-tag :type="chartConfig.d3.enabled ? 'success' : 'warning'" size="small">
                {{ chartConfig.d3.enabled ? '已启用' : '待安装' }}
              </el-tag>
            </div>
            <div class="tool-info">
              <div class="tool-version">v{{ chartConfig.d3.version }}</div>
              <div class="tool-status">自定义可视化</div>
            </div>
          </div>

          <div class="tool-card" :class="{ enabled: chartConfig.plotly.enabled }">
            <div class="tool-header">
              <div class="tool-name">Plotly.js</div>
              <el-tag :type="chartConfig.plotly.enabled ? 'success' : 'warning'" size="small">
                {{ chartConfig.plotly.enabled ? '已启用' : '待安装' }}
              </el-tag>
            </div>
            <div class="tool-info">
              <div class="tool-version">v{{ chartConfig.plotly.version }}</div>
              <div class="tool-status">科学图表</div>
            </div>
          </div>
        </div>
      </div>

      <div class="category-section">
        <h4 class="category-title">
          <el-icon><BrainFilled /></el-icon>
          AI增强工具
        </h4>
        <div class="tools-grid">
          <div class="tool-card" :class="{ enabled: aiConfig.openSourceAI.enabled }">
            <div class="tool-header">
              <div class="tool-name">开源AI服务</div>
              <el-tag :type="aiConfig.openSourceAI.enabled ? 'success' : 'danger'" size="small">
                {{ aiConfig.openSourceAI.enabled ? '已启用' : '未启用' }}
              </el-tag>
            </div>
            <div class="tool-info">
              <div class="tool-version">自研实现</div>
              <div class="tool-features">
                <el-tag size="mini" type="success">意图识别</el-tag>
                <el-tag size="mini" type="success">实体提取</el-tag>
                <el-tag size="mini" type="success">响应生成</el-tag>
              </div>
            </div>
          </div>

          <div class="tool-card" :class="{ enabled: aiConfig.langchain.enabled }">
            <div class="tool-header">
              <div class="tool-name">LangChain</div>
              <el-tag :type="aiConfig.langchain.enabled ? 'success' : 'info'" size="small">
                {{ aiConfig.langchain.enabled ? '已启用' : '概念实现' }}
              </el-tag>
            </div>
            <div class="tool-info">
              <div class="tool-version">v{{ aiConfig.langchain.version }}</div>
              <div class="tool-status">设计思想已集成</div>
            </div>
          </div>

          <div class="tool-card" :class="{ enabled: aiConfig.langgraph.enabled }">
            <div class="tool-header">
              <div class="tool-name">LangGraph</div>
              <el-tag :type="aiConfig.langgraph.enabled ? 'success' : 'info'" size="small">
                {{ aiConfig.langgraph.enabled ? '已启用' : '概念实现' }}
              </el-tag>
            </div>
            <div class="tool-info">
              <div class="tool-version">v{{ aiConfig.langgraph.version }}</div>
              <div class="tool-status">工作流设计已参考</div>
            </div>
          </div>
        </div>
      </div>

      <div class="category-section">
        <h4 class="category-title">
          <el-icon><DataAnalysis /></el-icon>
          数据处理工具
        </h4>
        <div class="tools-grid">
          <div class="tool-card" :class="{ enabled: dataConfig.customDataProcessor.enabled }">
            <div class="tool-header">
              <div class="tool-name">自研数据处理器</div>
              <el-tag :type="dataConfig.customDataProcessor.enabled ? 'success' : 'danger'" size="small">
                {{ dataConfig.customDataProcessor.enabled ? '已启用' : '未启用' }}
              </el-tag>
            </div>
            <div class="tool-info">
              <div class="tool-version">替代 Lodash</div>
              <div class="tool-features">
                <el-tag size="mini" type="success">链式操作</el-tag>
                <el-tag size="mini" type="success">高性能</el-tag>
              </div>
            </div>
          </div>

          <div class="tool-card" :class="{ enabled: dataConfig.customTimeProcessor.enabled }">
            <div class="tool-header">
              <div class="tool-name">自研时间处理器</div>
              <el-tag :type="dataConfig.customTimeProcessor.enabled ? 'success' : 'danger'" size="small">
                {{ dataConfig.customTimeProcessor.enabled ? '已启用' : '未启用' }}
              </el-tag>
            </div>
            <div class="tool-info">
              <div class="tool-version">替代 Day.js</div>
              <div class="tool-features">
                <el-tag size="mini" type="success">轻量级</el-tag>
                <el-tag size="mini" type="success">本地化</el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="category-section">
        <h4 class="category-title">
          <el-icon><Grid /></el-icon>
          UI组件库
        </h4>
        <div class="tools-grid">
          <div class="tool-card" :class="{ enabled: uiConfig.elementPlus.enabled }">
            <div class="tool-header">
              <div class="tool-name">Element Plus</div>
              <el-tag :type="uiConfig.elementPlus.enabled ? 'success' : 'danger'" size="small">
                {{ uiConfig.elementPlus.enabled ? '已启用' : '未启用' }}
              </el-tag>
            </div>
            <div class="tool-info">
              <div class="tool-version">v{{ uiConfig.elementPlus.version }}</div>
              <div class="tool-features">
                <el-tag size="mini" type="success">Vue 3</el-tag>
                <el-tag size="mini" type="success">TypeScript</el-tag>
              </div>
            </div>
          </div>

          <div class="tool-card" :class="{ enabled: uiConfig.antDesignVue.enabled }">
            <div class="tool-header">
              <div class="tool-name">Ant Design Vue</div>
              <el-tag :type="uiConfig.antDesignVue.enabled ? 'success' : 'warning'" size="small">
                {{ uiConfig.antDesignVue.enabled ? '已启用' : '依赖冲突' }}
              </el-tag>
            </div>
            <div class="tool-info">
              <div class="tool-version">v{{ uiConfig.antDesignVue.version }}</div>
              <div class="tool-status">等待依赖解决</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 问题和解决方案 -->
    <div class="issues-section">
      <h4 class="section-title">
        <el-icon><Warning /></el-icon>
        已知问题和解决方案
      </h4>
      
      <div class="issues-grid">
        <div class="issue-card">
          <div class="issue-header">
            <div class="issue-title">依赖冲突问题</div>
            <el-tag type="warning" size="small">需要解决</el-tag>
          </div>
          <div class="issue-content">
            <ul>
              <li v-for="conflict in statusReport.issues.dependencyConflicts" :key="conflict">
                {{ conflict }}
              </li>
            </ul>
          </div>
        </div>

        <div class="issue-card">
          <div class="issue-header">
            <div class="issue-title">当前解决方案</div>
            <el-tag type="success" size="small">已实施</el-tag>
          </div>
          <div class="issue-content">
            <ul>
              <li v-for="workaround in statusReport.issues.workarounds" :key="workaround">
                {{ workaround }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="actions-section">
      <el-button type="primary" @click="runIntegrationTest">
        <el-icon><PlayFilled /></el-icon>
        运行集成测试
      </el-button>
      <el-button type="default" @click="refreshStatus">
        <el-icon><RefreshRight /></el-icon>
        刷新状态
      </el-button>
      <el-button type="info" @click="exportReport">
        <el-icon><Download /></el-icon>
        导出报告
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { 
  ElButton, ElTag, ElIcon 
} from 'element-plus'
import { 
  Tools, PieChart, BrainFilled, DataAnalysis, Grid, Warning, 
  PlayFilled, RefreshRight, Download 
} from '@element-plus/icons-vue'
import { 
  CHART_CONFIG, AI_CONFIG, DATA_PROCESSING_CONFIG, UI_CONFIG,
  getToolsStatusReport 
} from '../config/openSourceConfig.js'
import { runOpenSourceIntegrationTests } from '../test/openSourceIntegrationTest.js'

// 响应式数据
const statusReport = ref({})
const chartConfig = ref(CHART_CONFIG)
const aiConfig = ref(AI_CONFIG)
const dataConfig = ref(DATA_PROCESSING_CONFIG)
const uiConfig = ref(UI_CONFIG)

// 生命周期
onMounted(() => {
  refreshStatus()
})

// 刷新状态
const refreshStatus = () => {
  statusReport.value = getToolsStatusReport()
  console.log('🔄 工具状态已刷新:', statusReport.value)
}

// 运行集成测试
const runIntegrationTest = async () => {
  console.log('🧪 开始运行集成测试...')
  try {
    const testResult = await runOpenSourceIntegrationTests()
    if (testResult) {
      console.log('✅ 集成测试通过')
    } else {
      console.log('❌ 集成测试失败')
    }
  } catch (error) {
    console.error('❌ 集成测试运行失败:', error)
  }
}

// 导出报告
const exportReport = () => {
  const report = {
    timestamp: new Date().toISOString(),
    summary: statusReport.value.summary,
    categories: statusReport.value.categories,
    enabledTools: statusReport.value.enabledTools,
    issues: statusReport.value.issues
  }
  
  const blob = new Blob([JSON.stringify(report, null, 2)], { 
    type: 'application/json' 
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `opensource-tools-report-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  console.log('📄 报告已导出')
}
</script>

<style scoped>
.opensource-tools-status {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.status-overview {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.overview-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
}

.card-icon {
  font-size: 24px;
}

.card-icon.success { color: #52c41a; }
.card-icon.warning { color: #faad14; }
.card-icon.info { color: #1890ff; }

.card-value {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
}

.card-label {
  font-size: 12px;
  color: #8c8c8c;
}

.tools-categories {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.category-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.category-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.tool-card {
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  background: #fafafa;
  transition: all 0.3s ease;
}

.tool-card.enabled {
  border-color: #52c41a;
  background: #f6ffed;
}

.tool-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.tool-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.tool-name {
  font-weight: 600;
  color: #262626;
}

.tool-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tool-version {
  font-size: 12px;
  color: #8c8c8c;
}

.tool-status {
  font-size: 12px;
  color: #595959;
}

.tool-features {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.issues-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.issues-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 16px;
}

.issue-card {
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  background: #fafafa;
}

.issue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.issue-title {
  font-weight: 600;
  color: #262626;
}

.issue-content ul {
  margin: 0;
  padding-left: 16px;
}

.issue-content li {
  margin-bottom: 4px;
  font-size: 14px;
  color: #595959;
}

.actions-section {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .overview-cards {
    grid-template-columns: 1fr;
  }
  
  .tools-grid {
    grid-template-columns: 1fr;
  }
  
  .issues-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-section {
    flex-direction: column;
    align-items: center;
  }
}
</style>
