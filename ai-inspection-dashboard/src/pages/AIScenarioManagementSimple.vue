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
          <div class="status-badge">
            <span class="status-icon">{{ currentScenario?.icon || '🤖' }}</span>
            <span class="status-name">{{ currentScenario?.name || '未选择' }}</span>
          </div>
        </div>
        <div class="status-actions">
          <el-select 
            v-model="selectedScenarioId" 
            @change="switchScenario"
            placeholder="切换场景"
            style="width: 200px;"
          >
            <el-option
              v-for="scenario in allScenarios"
              :key="scenario.id"
              :label="scenario.name"
              :value="scenario.id"
            />
          </el-select>
        </div>
      </div>
    </div>

    <!-- 场景设计工作台 -->
    <div class="design-workspace">
      <div class="design-category">
        <div class="category-header">
          <span class="category-icon">🎯</span>
          <h3 class="category-name">业务场景</h3>
          <span class="category-count">{{ allScenarios.length }}个场景</span>
        </div>
        
        <div class="scenario-designer-grid">
          <div
            v-for="scenario in allScenarios"
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

    <!-- 创建/编辑场景对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingScenario ? '编辑场景配置' : '设计新场景'"
      width="800px"
      class="scenario-design-dialog"
    >
      <div class="scenario-designer">
        <!-- 基础信息配置 -->
        <div class="design-section">
          <h4 class="section-title">
            <span class="section-icon">📋</span>
            基础信息
          </h4>
          <div class="form-grid">
            <el-form-item label="场景名称">
              <el-input
                v-model="scenarioForm.name"
                placeholder="请输入场景名称"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
            <el-form-item label="场景图标">
              <el-select v-model="scenarioForm.icon" placeholder="选择图标">
                <el-option
                  v-for="icon in iconOptions"
                  :key="icon.value"
                  :label="icon.label"
                  :value="icon.value"
                >
                  <span>{{ icon.value }} {{ icon.label }}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="场景描述" class="full-width">
              <el-input
                v-model="scenarioForm.description"
                type="textarea"
                :rows="3"
                placeholder="请描述该场景的应用范围和特点"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
          </div>
        </div>

        <!-- AI行为配置 -->
        <div class="design-section">
          <h4 class="section-title">
            <span class="section-icon">🧠</span>
            AI行为配置
          </h4>
          <div class="form-grid">
            <el-form-item label="思考方式">
              <el-select v-model="scenarioForm.thinkingStyle" placeholder="选择思考方式">
                <el-option label="逻辑分析" value="logical" />
                <el-option label="创新思维" value="creative" />
                <el-option label="系统思考" value="systematic" />
                <el-option label="批判性思维" value="critical" />
              </el-select>
            </el-form-item>
            <el-form-item label="分析深度">
              <el-select v-model="scenarioForm.analysisDepth" placeholder="选择分析深度">
                <el-option label="快速概览" value="quick" />
                <el-option label="标准分析" value="standard" />
                <el-option label="深度分析" value="deep" />
                <el-option label="专家级分析" value="expert" />
              </el-select>
            </el-form-item>
            <el-form-item label="响应格式">
              <el-select v-model="scenarioForm.responseFormat" placeholder="选择响应格式">
                <el-option label="结构化报告" value="structured" />
                <el-option label="对话式回答" value="conversational" />
                <el-option label="要点总结" value="bullet_points" />
                <el-option label="图表展示" value="visual" />
              </el-select>
            </el-form-item>
            <el-form-item label="创造性参数">
              <div class="slider-container">
                <el-slider
                  v-model="scenarioForm.temperature"
                  :min="0"
                  :max="1"
                  :step="0.1"
                  show-tooltip
                  :format-tooltip="formatTemperature"
                />
                <span class="slider-desc">{{ getTemperatureDesc(scenarioForm.temperature) }}</span>
              </div>
            </el-form-item>
          </div>
        </div>

        <!-- 系统提示词配置 -->
        <div class="design-section">
          <h4 class="section-title">
            <span class="section-icon">💬</span>
            系统提示词
          </h4>
          <div class="prompt-editor">
            <el-input
              v-model="scenarioForm.systemPrompt"
              type="textarea"
              :rows="6"
              placeholder="请输入系统提示词，定义AI在该场景下的角色和行为..."
              maxlength="1000"
              show-word-limit
            />
            <div class="prompt-tips">
              <div class="tip-item">
                <span class="tip-icon">💡</span>
                <span class="tip-text">提示词应该明确定义AI的角色、专业领域和回答风格</span>
              </div>
              <div class="tip-item">
                <span class="tip-icon">📝</span>
                <span class="tip-text">可以包含具体的分析框架、方法论和输出要求</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 业务规则配置 -->
        <div class="design-section">
          <h4 class="section-title">
            <span class="section-icon">⚙️</span>
            业务规则
            <el-button size="small" type="primary" @click="addRule">
              <span class="button-icon">➕</span>
              添加规则
            </el-button>
          </h4>
          <div class="rules-list">
            <div
              v-for="(rule, index) in scenarioForm.rules"
              :key="index"
              class="rule-item"
            >
              <div class="rule-header">
                <el-input
                  v-model="rule.name"
                  placeholder="规则名称"
                  size="small"
                  style="width: 200px;"
                />
                <el-button
                  size="small"
                  type="danger"
                  @click="removeRule(index)"
                  icon="Delete"
                >
                  删除
                </el-button>
              </div>
              <div class="rule-content">
                <el-form-item label="触发条件">
                  <el-input
                    v-model="rule.pattern"
                    placeholder="输入关键词或正则表达式"
                  />
                </el-form-item>
                <el-form-item label="回答模板">
                  <el-input
                    v-model="rule.response"
                    type="textarea"
                    :rows="3"
                    placeholder="定义该规则的标准回答模板..."
                  />
                </el-form-item>
              </div>
            </div>
            <div v-if="scenarioForm.rules.length === 0" class="empty-rules">
              <span class="empty-icon">📋</span>
              <span class="empty-text">暂无业务规则，点击"添加规则"开始配置</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button @click="previewScenario" icon="View">预览效果</el-button>
          <el-button type="primary" @click="saveScenario" icon="Check">
            {{ editingScenario ? '保存修改' : '创建场景' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 场景测试对话框 -->
    <el-dialog
      v-model="showTestDialog"
      title="场景测试"
      width="700px"
    >
      <div class="test-content">
        <p>场景测试功能开发中...</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { aiScenarioManager } from '../services/AIScenarioManager.js'
import { aiScenarioRuleEngine } from '../services/AIScenarioRuleEngine.js'

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

// 场景表单数据
const scenarioForm = ref({
  name: '',
  icon: '🎯',
  description: '',
  thinkingStyle: 'systematic',
  analysisDepth: 'standard',
  responseFormat: 'structured',
  temperature: 0.7,
  systemPrompt: '',
  rules: []
})

// 图标选项
const iconOptions = ref([
  { value: '🎯', label: '目标导向' },
  { value: '🔍', label: '分析调研' },
  { value: '📊', label: '数据分析' },
  { value: '⚙️', label: '流程优化' },
  { value: '🧠', label: '智能决策' },
  { value: '📈', label: '趋势预测' },
  { value: '🔧', label: '问题解决' },
  { value: '💡', label: '创新思维' }
])

// 计算属性
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

const switchScenario = (scenarioId) => {
  if (aiScenarioManager.setCurrentScenario(scenarioId)) {
    currentScenario.value = aiScenarioManager.getCurrentScenario()
    aiScenarioManager.saveToStorage()
    ElMessage.success(`已切换到场景：${currentScenario.value.name}`)
    loadScenarios()
  }
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

  // 填充表单数据
  scenarioForm.value = {
    name: scenario.name || '',
    icon: scenario.icon || '🎯',
    description: scenario.description || '',
    thinkingStyle: scenario.thinkingStyle || 'systematic',
    analysisDepth: scenario.analysisDepth || 'standard',
    responseFormat: scenario.responseFormat || 'structured',
    temperature: scenario.temperature || 0.7,
    systemPrompt: scenario.systemPrompt || '',
    rules: scenario.rules ? [...scenario.rules] : []
  }

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

// 场景设计方法
const addRule = () => {
  scenarioForm.value.rules.push({
    name: '',
    pattern: '',
    response: ''
  })
}

const removeRule = (index) => {
  scenarioForm.value.rules.splice(index, 1)
}

const formatTemperature = (value) => {
  return `${value} (${getTemperatureDesc(value)})`
}

const getTemperatureDesc = (value) => {
  if (value <= 0.3) return '保守稳定'
  if (value <= 0.5) return '平衡适中'
  if (value <= 0.7) return '灵活创新'
  return '高度创造'
}

const previewScenario = () => {
  console.log('预览场景配置:', scenarioForm.value)
  ElMessage.info('场景预览功能开发中...')
}

const saveScenario = () => {
  // 验证表单
  if (!scenarioForm.value.name.trim()) {
    ElMessage.error('请输入场景名称')
    return
  }

  if (!scenarioForm.value.description.trim()) {
    ElMessage.error('请输入场景描述')
    return
  }

  if (!scenarioForm.value.systemPrompt.trim()) {
    ElMessage.error('请输入系统提示词')
    return
  }

  try {
    const newScenario = {
      id: editingScenario.value?.id || `scenario_${Date.now()}`,
      ...scenarioForm.value,
      isCustom: true,
      createdAt: editingScenario.value?.createdAt || Date.now(),
      updatedAt: Date.now()
    }

    if (editingScenario.value) {
      // 更新现有场景
      aiScenarioManager.updateScenario(newScenario.id, newScenario)
      ElMessage.success('场景更新成功')
    } else {
      // 创建新场景
      aiScenarioManager.addScenario(newScenario)
      ElMessage.success('场景创建成功')
    }

    // 保存到存储
    aiScenarioManager.saveToStorage()

    // 重新加载场景列表
    loadScenarios()

    // 关闭对话框
    showCreateDialog.value = false
    resetForm()

  } catch (error) {
    console.error('保存场景失败:', error)
    ElMessage.error('保存场景失败')
  }
}

const resetForm = () => {
  scenarioForm.value = {
    name: '',
    icon: '🎯',
    description: '',
    thinkingStyle: 'systematic',
    analysisDepth: 'standard',
    responseFormat: 'structured',
    temperature: 0.7,
    systemPrompt: '',
    rules: []
  }
  editingScenario.value = null
}

onMounted(() => {
  console.log('🎭 AI场景管理页面已加载')
  
  // 加载场景数据
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.scenario-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 20px;
}

.status-icon {
  font-size: 18px;
}

.status-name {
  font-size: 14px;
  color: #1890ff;
  font-weight: 500;
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

.rules-stats .stat-item {
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

.rules-stats .stat-label {
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

/* 场景设计器样式 */
.scenario-design-dialog .el-dialog__body {
  padding: 0;
}

.scenario-designer {
  max-height: 70vh;
  overflow-y: auto;
  padding: 20px;
}

.design-section {
  margin-bottom: 32px;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e9ecef;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.section-icon {
  font-size: 18px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;
}

.form-grid .full-width {
  grid-column: 1 / -1;
}

.slider-container {
  width: 100%;
}

.slider-desc {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: #666;
  text-align: center;
}

.prompt-editor {
  width: 100%;
}

.prompt-tips {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
}

.tip-icon {
  font-size: 14px;
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rule-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e9ecef;
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.rule-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 16px;
  align-items: start;
}

.empty-rules {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px;
  color: #999;
  text-align: center;
}

.empty-icon {
  font-size: 32px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

.button-icon {
  margin-right: 4px;
}

.test-content {
  padding: 20px;
  text-align: center;
  color: #666;
}
</style>
