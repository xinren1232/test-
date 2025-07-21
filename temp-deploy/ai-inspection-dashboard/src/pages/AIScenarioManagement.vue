<template>
  <div class="scenario-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">
            <span class="title-icon">🎭</span>
            AI场景管理
          </h1>
          <p class="page-description">设计和配置智能场景，定义AI助手在不同业务场景下的行为模式、分析策略和响应规则</p>

          <!-- 统计信息 -->
          <div class="stats-bar">
            <div class="stat-item">
              <span class="stat-icon">📊</span>
              <div class="stat-content">
                <span class="stat-label">总场景数</span>
                <span class="stat-value">{{ scenarios.length }}</span>
              </div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">⚡</span>
              <div class="stat-content">
                <span class="stat-label">活跃场景</span>
                <span class="stat-value">{{ currentScenario?.name || '无' }}</span>
              </div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">📋</span>
              <div class="stat-content">
                <span class="stat-label">总规则数</span>
                <span class="stat-value">{{ totalRules }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="showCreateDialog = true">
            <span class="button-icon">🎨</span>
            设计新场景
          </el-button>
          <el-button @click="showRuleDesigner = true">
            <span class="button-icon">⚙️</span>
            规则设计器
          </el-button>
          <el-button @click="testCurrentScenario">
            <span class="button-icon">🧪</span>
            测试验证
          </el-button>
        </div>
      </div>
    </div>

    <!-- 当前场景状态 -->
    <div class="current-scenario">
      <div class="scenario-status">
        <div class="status-info">
          <span class="status-label">当前激活场景:</span>
          <div class="current-scenario-card">
            <span class="scenario-icon">{{ currentScenario.icon }}</span>
            <div class="scenario-info">
              <div class="scenario-name">{{ currentScenario.name }}</div>
              <div class="scenario-desc">{{ currentScenario.description }}</div>
            </div>
          </div>
        </div>
        <div class="status-actions">
          <el-select v-model="selectedScenarioId" @change="switchScenario" placeholder="切换场景">
            <el-option
              v-for="scenario in allScenarios"
              :key="scenario.id"
              :label="scenario.name"
              :value="scenario.id"
            >
              <span class="option-content">
                <span class="option-icon">{{ scenario.icon }}</span>
                <span class="option-text">{{ scenario.name }}</span>
              </span>
            </el-option>
          </el-select>
        </div>
      </div>
    </div>

    <!-- 场景设计工作台 -->
    <div class="design-workspace">
      <div v-for="(scenarios, category) in scenarioCategories" :key="category" class="design-category">
        <div class="category-header">
          <span class="category-icon">{{ getCategoryIcon(category) }}</span>
          <h3 class="category-name">{{ getCategoryName(category) }}</h3>
          <span class="category-count">{{ scenarios.length }}个场景</span>
        </div>

        <div class="scenario-designer-grid">
          <div
            v-for="scenario in scenarios"
            :key="scenario.id"
            class="scenario-designer-card"
            :class="{
              active: scenario.id === currentScenario.id,
              custom: scenario.isCustom
            }"
          >
            <!-- 场景配置预览 -->
            <div class="design-preview">
              <div class="preview-header">
                <span class="scenario-icon">{{ scenario.icon }}</span>
                <div class="scenario-info">
                  <h4 class="scenario-name">{{ scenario.name }}</h4>
                  <p class="scenario-desc">{{ scenario.description }}</p>
                </div>
                <div class="scenario-status">
                  <el-tag
                    :type="scenario.id === currentScenario.id ? 'success' : 'info'"
                    size="small"
                  >
                    {{ scenario.id === currentScenario.id ? '激活中' : '待用' }}
                  </el-tag>
                </div>
              </div>

              <!-- 配置概览 -->
              <div class="config-overview">
                <div class="config-item">
                  <span class="config-label">思考方式:</span>
                  <span class="config-value">{{ scenario.thinkingStyle }}</span>
                </div>
                <div class="config-item">
                  <span class="config-label">分析深度:</span>
                  <span class="config-value">{{ scenario.analysisDepth }}</span>
                </div>
                <div class="config-item">
                  <span class="config-label">响应格式:</span>
                  <span class="config-value">{{ scenario.responseFormat }}</span>
                </div>
              </div>

              <!-- 规则统计 -->
              <div class="rules-stats">
                <div class="stat-item">
                  <span class="stat-number">{{ getScenarioRuleCount(scenario.id) }}</span>
                  <span class="stat-label">业务规则</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ scenario.temperature || 0.7 }}</span>
                  <span class="stat-label">创造性</span>
                </div>
              </div>
            </div>

            <!-- 设计操作 -->
            <div class="design-actions">
              <el-button
                size="small"
                type="primary"
                @click="designScenario(scenario)"
              >
                <span class="action-icon">🎨</span>
                设计配置
              </el-button>
              <el-button
                size="small"
                @click="activateScenario(scenario)"
                v-if="scenario.id !== currentScenario.id"
              >
                <span class="action-icon">⚡</span>
                激活
              </el-button>
              <el-button
                size="small"
                @click="testScenario(scenario)"
              >
                <span class="action-icon">🧪</span>
                测试
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 场景详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      :title="selectedScenario?.name || '场景详情'"
      width="800px"
      class="scenario-detail-dialog"
    >
      <div v-if="selectedScenario" class="scenario-detail">
        <div class="detail-header">
          <span class="detail-icon">{{ selectedScenario.icon }}</span>
          <div class="detail-info">
            <h3>{{ selectedScenario.name }}</h3>
            <p>{{ selectedScenario.description }}</p>
          </div>
        </div>

        <div class="detail-content">
          <div class="detail-section">
            <h4>系统提示词</h4>
            <div class="prompt-content">{{ selectedScenario.systemPrompt }}</div>
          </div>

          <div class="detail-section">
            <h4>配置参数</h4>
            <div class="config-grid">
              <div class="config-item">
                <span class="config-label">思考方式:</span>
                <span class="config-value">{{ getThinkingStyleName(selectedScenario.thinkingStyle) }}</span>
              </div>
              <div class="config-item">
                <span class="config-label">分析深度:</span>
                <span class="config-value">{{ getAnalysisDepthName(selectedScenario.analysisDepth) }}</span>
              </div>
              <div class="config-item">
                <span class="config-label">回复格式:</span>
                <span class="config-value">{{ getResponseFormatName(selectedScenario.responseFormat) }}</span>
              </div>
              <div class="config-item">
                <span class="config-label">最大Token:</span>
                <span class="config-value">{{ selectedScenario.maxTokens }}</span>
              </div>
              <div class="config-item">
                <span class="config-label">温度参数:</span>
                <span class="config-value">{{ selectedScenario.temperature }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>偏好工具</h4>
            <div class="tools-list">
              <span 
                v-for="tool in selectedScenario.toolPreferences" 
                :key="tool"
                class="tool-chip"
              >
                {{ getToolName(tool) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showDetailDialog = false">关闭</el-button>
          <el-button 
            type="primary" 
            @click="activateScenario(selectedScenario)"
            v-if="selectedScenario && selectedScenario.id !== currentScenario.id"
          >
            激活此场景
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 创建/编辑场景对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingScenario ? '编辑场景' : '创建场景'"
      width="900px"
      class="scenario-create-dialog"
    >
      <ScenarioEditor
        :scenario="editingScenario"
        @save="handleSaveScenario"
        @cancel="handleCancelEdit"
      />
    </el-dialog>

    <!-- 场景测试对话框 -->
    <el-dialog
      v-model="showTestDialog"
      title="场景测试"
      width="700px"
    >
      <ScenarioTester
        :scenario="currentScenario"
        @close="showTestDialog = false"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { aiScenarioManager } from '../services/AIScenarioManager.js'
import { aiScenarioRuleEngine } from '../services/AIScenarioRuleEngine.js'
import ScenarioEditor from '../components/ScenarioEditor.vue'
import ScenarioTester from '../components/ScenarioTester.vue'

// 响应式数据
const allScenarios = ref([])
const currentScenario = ref({})
const selectedScenarioId = ref('')
const selectedScenario = ref(null)
const editingScenario = ref(null)

// 对话框状态
const showDetailDialog = ref(false)
const showCreateDialog = ref(false)
const showTestDialog = ref(false)
const showRuleDesigner = ref(false)

// 计算属性
const scenarioCategories = computed(() => {
  return aiScenarioManager.getScenarioCategories()
})

const scenarios = computed(() => {
  return allScenarios.value
})

const totalRules = computed(() => {
  const stats = aiScenarioRuleEngine.getRuleStatistics()
  return stats.total
})

// 方法
const loadScenarios = () => {
  allScenarios.value = aiScenarioManager.getAllScenarios()
  currentScenario.value = aiScenarioManager.getCurrentScenario()
  selectedScenarioId.value = currentScenario.value.id
}

const selectScenario = (scenario) => {
  selectedScenario.value = scenario
  showDetailDialog.value = true
}

const switchScenario = (scenarioId) => {
  if (aiScenarioManager.setCurrentScenario(scenarioId)) {
    currentScenario.value = aiScenarioManager.getCurrentScenario()
    aiScenarioManager.saveToStorage()
    ElMessage.success(`已切换到场景: ${currentScenario.value.name}`)
  }
}

const activateScenario = (scenario) => {
  switchScenario(scenario.id)
  showDetailDialog.value = false
}

const viewScenario = (scenario) => {
  selectScenario(scenario)
}

const editScenario = (scenario) => {
  editingScenario.value = { ...scenario }
  showCreateDialog.value = true
}

const testCurrentScenario = () => {
  showTestDialog.value = true
}

// 获取场景的规则数量
const getScenarioRuleCount = (scenarioId) => {
  const rules = aiScenarioRuleEngine.getScenarioRules(scenarioId)
  return rules.length
}

// 设计场景配置
const designScenario = (scenario) => {
  editingScenario.value = { ...scenario }
  showCreateDialog.value = true
}

// 激活场景
const activateScenario = (scenario) => {
  if (aiScenarioManager.setCurrentScenario(scenario.id)) {
    currentScenario.value = aiScenarioManager.getCurrentScenario()
    aiScenarioManager.saveToStorage()
    ElMessage.success(`已激活场景：${scenario.name}`)
    loadScenarios()
  }
}

// 测试场景
const testScenario = (scenario) => {
  selectedScenario.value = scenario
  showTestDialog.value = true
}

const handleSaveScenario = (scenarioData) => {
  try {
    if (editingScenario.value) {
      // 更新现有场景
      aiScenarioManager.updateScenario(editingScenario.value.id, scenarioData)
      ElMessage.success('场景更新成功')
    } else {
      // 创建新场景
      aiScenarioManager.addCustomScenario(scenarioData)
      ElMessage.success('场景创建成功')
    }
    
    loadScenarios()
    aiScenarioManager.saveToStorage()
    showCreateDialog.value = false
    editingScenario.value = null
  } catch (error) {
    ElMessage.error('保存失败: ' + error.message)
  }
}

const handleCancelEdit = () => {
  showCreateDialog.value = false
  editingScenario.value = null
}

// 辅助方法
const getCategoryIcon = (category) => {
  const icons = {
    general: '🤖',
    business: '💼', 
    management: '📊',
    custom: '⚙️'
  }
  return icons[category] || '📁'
}

const getCategoryName = (category) => {
  const names = {
    general: '通用场景',
    business: '业务场景',
    management: '管理场景', 
    custom: '自定义场景'
  }
  return names[category] || category
}

const getThinkingStyleName = (style) => {
  const names = {
    systematic: '系统性思考',
    analytical: '分析性思考',
    methodical: '方法论思考',
    efficiency_focused: '效率导向',
    risk_oriented: '风险导向',
    strategic: '战略性思考'
  }
  return names[style] || style
}

const getAnalysisDepthName = (depth) => {
  const names = {
    standard: '标准分析',
    deep: '深度分析',
    operational: '运营分析',
    comprehensive: '综合分析',
    executive: '高管分析'
  }
  return names[depth] || depth
}

const getResponseFormatName = (format) => {
  const names = {
    markdown: 'Markdown格式',
    structured: '结构化格式',
    analytical: '分析报告格式',
    actionable: '行动导向格式',
    risk_focused: '风险聚焦格式',
    executive_summary: '高管摘要格式'
  }
  return names[format] || format
}

const getToolName = (tool) => {
  const names = {
    chart: '图表',
    analysis: '分析',
    pie_chart: '饼图',
    trend_analysis: '趋势分析',
    risk_assessment: '风险评估',
    control_chart: '控制图',
    pareto_chart: '帕累托图',
    fishbone: '鱼骨图',
    gantt_chart: '甘特图',
    efficiency_chart: '效率图',
    capacity_analysis: '产能分析',
    risk_matrix: '风险矩阵',
    alert_dashboard: '预警面板',
    trend_monitoring: '趋势监控',
    dashboard: '仪表盘',
    comparison_chart: '对比图',
    forecast_model: '预测模型'
  }
  return names[tool] || tool
}

// 生命周期
onMounted(() => {
  aiScenarioManager.loadFromStorage()
  loadScenarios()
})
</script>

<style scoped>
.scenario-management {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #333;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  font-size: 32px;
}

.page-description {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.stats-bar {
  display: flex;
  gap: 24px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  min-width: 120px;
}

.stat-icon {
  font-size: 20px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.stat-value {
  font-size: 16px;
  color: #333;
  font-weight: 600;
}

/* 设计工作台样式 */
.design-workspace {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.design-category {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.category-icon {
  font-size: 24px;
}

.category-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.category-count {
  background: #f0f7ff;
  color: #409eff;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.scenario-designer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.scenario-designer-card {
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  background: #fafafa;
  transition: all 0.3s ease;
  overflow: hidden;
}

.scenario-designer-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.scenario-designer-card.active {
  border-color: #52c41a;
  background: #f6ffed;
}

.design-preview {
  padding: 20px;
}

.preview-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.scenario-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.scenario-info {
  flex: 1;
}

.scenario-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.scenario-desc {
  margin: 0;
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.scenario-status {
  margin-left: auto;
}

.config-overview {
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid #f0f0f0;
}

.config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.config-item:last-child {
  margin-bottom: 0;
}

.config-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.config-value {
  font-size: 12px;
  color: #333;
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
}

.rules-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.stat-item {
  flex: 1;
  text-align: center;
  background: white;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.stat-number {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 11px;
  color: #666;
  font-weight: 500;
}

.design-actions {
  background: white;
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 8px;
}

.action-icon {
  margin-right: 4px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.button-icon {
  margin-right: 6px;
}

.current-scenario {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.scenario-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-label {
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  display: block;
}

.current-scenario-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px solid #409eff;
}

.scenario-icon {
  font-size: 24px;
}

.scenario-name {
  font-weight: 600;
  color: #333;
  font-size: 16px;
}

.scenario-desc {
  color: #666;
  font-size: 14px;
}

.scenarios-grid {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.category-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.category-title {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.category-icon {
  font-size: 24px;
}

.scenarios-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.scenario-card {
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafafa;
}

.scenario-card:hover {
  border-color: #409eff;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.scenario-card.active {
  border-color: #409eff;
  background: #f0f8ff;
}

.scenario-card.custom {
  border-left: 4px solid #67c23a;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.card-icon {
  font-size: 24px;
}

.card-title {
  flex: 1;
  font-weight: 600;
  color: #333;
  font-size: 16px;
}

.card-description {
  color: #666;
  font-size: 14px;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.meta-label {
  color: #999;
  min-width: 70px;
}

.meta-value {
  color: #333;
  font-weight: 500;
}

.tool-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tool-tag {
  background: #e8f4fd;
  color: #409eff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.tool-more {
  color: #999;
  font-size: 11px;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-icon {
  font-size: 16px;
}

/* 对话框样式 */
.scenario-detail {
  max-height: 600px;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.detail-icon {
  font-size: 32px;
}

.detail-info h3 {
  margin: 0 0 8px 0;
  color: #333;
}

.detail-info p {
  margin: 0;
  color: #666;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 16px;
}

.prompt-content {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 16px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.config-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.config-label {
  color: #666;
  font-size: 13px;
}

.config-value {
  color: #333;
  font-weight: 500;
  font-size: 13px;
}

.tools-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tool-chip {
  background: #e8f4fd;
  color: #409eff;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}
</style>
