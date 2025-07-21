<template>
  <div class="scenario-editor">
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px">
      <!-- 基本信息 -->
      <div class="form-section">
        <h4 class="section-title">基本信息</h4>
        
        <el-form-item label="场景ID" prop="id">
          <el-input 
            v-model="formData.id" 
            placeholder="请输入场景唯一标识"
            :disabled="!!scenario"
          />
        </el-form-item>
        
        <el-form-item label="场景名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入场景名称" />
        </el-form-item>
        
        <el-form-item label="场景描述" prop="description">
          <el-input 
            v-model="formData.description" 
            type="textarea" 
            :rows="2"
            placeholder="请输入场景描述"
          />
        </el-form-item>
        
        <el-form-item label="场景图标" prop="icon">
          <div class="icon-selector">
            <el-input v-model="formData.icon" placeholder="选择图标" style="width: 200px;" />
            <div class="icon-options">
              <span 
                v-for="icon in iconOptions" 
                :key="icon"
                class="icon-option"
                :class="{ selected: formData.icon === icon }"
                @click="formData.icon = icon"
              >
                {{ icon }}
              </span>
            </div>
          </div>
        </el-form-item>
        
        <el-form-item label="场景分类" prop="category">
          <el-select v-model="formData.category" placeholder="选择分类">
            <el-option label="通用场景" value="general" />
            <el-option label="业务场景" value="business" />
            <el-option label="管理场景" value="management" />
            <el-option label="自定义场景" value="custom" />
          </el-select>
        </el-form-item>
      </div>

      <!-- AI配置 -->
      <div class="form-section">
        <h4 class="section-title">AI配置参数</h4>
        
        <el-form-item label="思考方式" prop="thinkingStyle">
          <el-select v-model="formData.thinkingStyle" placeholder="选择思考方式">
            <el-option label="系统性思考" value="systematic" />
            <el-option label="分析性思考" value="analytical" />
            <el-option label="方法论思考" value="methodical" />
            <el-option label="效率导向" value="efficiency_focused" />
            <el-option label="风险导向" value="risk_oriented" />
            <el-option label="战略性思考" value="strategic" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="分析深度" prop="analysisDepth">
          <el-select v-model="formData.analysisDepth" placeholder="选择分析深度">
            <el-option label="标准分析" value="standard" />
            <el-option label="深度分析" value="deep" />
            <el-option label="运营分析" value="operational" />
            <el-option label="综合分析" value="comprehensive" />
            <el-option label="高管分析" value="executive" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="回复格式" prop="responseFormat">
          <el-select v-model="formData.responseFormat" placeholder="选择回复格式">
            <el-option label="Markdown格式" value="markdown" />
            <el-option label="结构化格式" value="structured" />
            <el-option label="分析报告格式" value="analytical" />
            <el-option label="行动导向格式" value="actionable" />
            <el-option label="风险聚焦格式" value="risk_focused" />
            <el-option label="高管摘要格式" value="executive_summary" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="最大Token数" prop="maxTokens">
          <el-input-number 
            v-model="formData.maxTokens" 
            :min="500" 
            :max="5000" 
            :step="100"
            style="width: 200px;"
          />
        </el-form-item>
        
        <el-form-item label="温度参数" prop="temperature">
          <el-slider 
            v-model="formData.temperature" 
            :min="0" 
            :max="1" 
            :step="0.1"
            show-input
            style="width: 300px;"
          />
        </el-form-item>
      </div>

      <!-- 工具偏好 -->
      <div class="form-section">
        <h4 class="section-title">偏好工具</h4>
        
        <el-form-item label="选择工具" prop="toolPreferences">
          <el-checkbox-group v-model="formData.toolPreferences">
            <div class="tool-grid">
              <el-checkbox 
                v-for="tool in toolOptions" 
                :key="tool.value"
                :label="tool.value"
                class="tool-checkbox"
              >
                <span class="tool-label">
                  <span class="tool-icon">{{ tool.icon }}</span>
                  {{ tool.label }}
                </span>
              </el-checkbox>
            </div>
          </el-checkbox-group>
        </el-form-item>
      </div>

      <!-- 系统提示词 -->
      <div class="form-section">
        <h4 class="section-title">系统提示词</h4>
        
        <el-form-item label="提示词内容" prop="systemPrompt">
          <el-input 
            v-model="formData.systemPrompt" 
            type="textarea" 
            :rows="12"
            placeholder="请输入系统提示词，定义AI的角色、能力和回复风格"
            class="prompt-textarea"
          />
        </el-form-item>
        
        <div class="prompt-tips">
          <h5>提示词编写建议：</h5>
          <ul>
            <li>明确定义AI的角色和专业领域</li>
            <li>描述具体的能力和分析方法</li>
            <li>指定回复的格式和风格要求</li>
            <li>包含相关的专业术语和标准</li>
            <li>提供具体的分析框架或方法论</li>
          </ul>
        </div>
      </div>
    </el-form>

    <!-- 操作按钮 -->
    <div class="form-actions">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSave">
        {{ scenario ? '更新场景' : '创建场景' }}
      </el-button>
      <el-button type="success" @click="handlePreview">预览效果</el-button>
    </div>

    <!-- 预览对话框 -->
    <el-dialog v-model="showPreview" title="场景预览" width="600px">
      <div class="scenario-preview">
        <div class="preview-header">
          <span class="preview-icon">{{ formData.icon }}</span>
          <div class="preview-info">
            <h3>{{ formData.name }}</h3>
            <p>{{ formData.description }}</p>
          </div>
        </div>
        
        <div class="preview-config">
          <div class="config-row">
            <span class="config-label">思考方式:</span>
            <span class="config-value">{{ getThinkingStyleName(formData.thinkingStyle) }}</span>
          </div>
          <div class="config-row">
            <span class="config-label">分析深度:</span>
            <span class="config-value">{{ getAnalysisDepthName(formData.analysisDepth) }}</span>
          </div>
          <div class="config-row">
            <span class="config-label">回复格式:</span>
            <span class="config-value">{{ getResponseFormatName(formData.responseFormat) }}</span>
          </div>
        </div>
        
        <div class="preview-prompt">
          <h4>系统提示词预览:</h4>
          <div class="prompt-preview">{{ formData.systemPrompt }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// Props
const props = defineProps({
  scenario: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['save', 'cancel'])

// 响应式数据
const formRef = ref(null)
const showPreview = ref(false)

const formData = reactive({
  id: '',
  name: '',
  description: '',
  icon: '🤖',
  category: 'custom',
  systemPrompt: '',
  thinkingStyle: 'systematic',
  analysisDepth: 'standard',
  responseFormat: 'markdown',
  toolPreferences: [],
  maxTokens: 2000,
  temperature: 0.7
})

// 表单验证规则
const rules = {
  id: [
    { required: true, message: '请输入场景ID', trigger: 'blur' },
    { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: 'ID只能包含字母、数字和下划线，且以字母开头', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入场景名称', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入场景描述', trigger: 'blur' }
  ],
  systemPrompt: [
    { required: true, message: '请输入系统提示词', trigger: 'blur' },
    { min: 50, message: '提示词至少需要50个字符', trigger: 'blur' }
  ]
}

// 选项数据
const iconOptions = ['🤖', '📦', '🔍', '🏭', '⚠️', '🎯', '📊', '💼', '🔧', '📈', '🛡️', '🎭', '🚀', '💡', '🔬', '📋']

const toolOptions = [
  { label: '图表生成', value: 'chart', icon: '📊' },
  { label: '数据分析', value: 'analysis', icon: '📈' },
  { label: '饼图', value: 'pie_chart', icon: '🥧' },
  { label: '趋势分析', value: 'trend_analysis', icon: '📈' },
  { label: '风险评估', value: 'risk_assessment', icon: '⚠️' },
  { label: '控制图', value: 'control_chart', icon: '📊' },
  { label: '帕累托图', value: 'pareto_chart', icon: '📊' },
  { label: '鱼骨图', value: 'fishbone', icon: '🐟' },
  { label: '甘特图', value: 'gantt_chart', icon: '📅' },
  { label: '效率图', value: 'efficiency_chart', icon: '⚡' },
  { label: '产能分析', value: 'capacity_analysis', icon: '🏭' },
  { label: '风险矩阵', value: 'risk_matrix', icon: '🎯' },
  { label: '预警面板', value: 'alert_dashboard', icon: '🚨' },
  { label: '趋势监控', value: 'trend_monitoring', icon: '👁️' },
  { label: '仪表盘', value: 'dashboard', icon: '📊' },
  { label: '对比图', value: 'comparison_chart', icon: '⚖️' },
  { label: '预测模型', value: 'forecast_model', icon: '🔮' }
]

// 方法
const initializeForm = () => {
  if (props.scenario) {
    Object.assign(formData, props.scenario)
  } else {
    // 设置默认提示词模板
    formData.systemPrompt = `你是专业的质量管理专家，具有丰富的行业经验。

## 专业领域：
1. [定义你的专业领域]
2. [列出核心能力]
3. [描述分析方法]

## 分析重点：
- [关注的关键指标]
- [重要的分析维度]
- [特殊的评估标准]

## 回复风格：
- [回复的语言风格]
- [内容组织方式]
- [专业术语使用]

请基于用户问题提供专业、准确、有用的回答。`
  }
}

const handleSave = async () => {
  try {
    await formRef.value.validate()
    
    const scenarioData = {
      ...formData,
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    emit('save', scenarioData)
  } catch (error) {
    ElMessage.error('请检查表单填写是否完整')
  }
}

const handleCancel = () => {
  emit('cancel')
}

const handlePreview = () => {
  showPreview.value = true
}

// 辅助方法
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

// 监听props变化
watch(() => props.scenario, () => {
  initializeForm()
}, { immediate: true })

// 生命周期
onMounted(() => {
  initializeForm()
})
</script>

<style scoped>
.scenario-editor {
  max-height: 600px;
  overflow-y: auto;
  padding: 0 4px;
}

.form-section {
  margin-bottom: 32px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.section-title {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

.icon-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.icon-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.icon-option {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.3s;
}

.icon-option:hover {
  border-color: #409eff;
  background: #f0f8ff;
}

.icon-option.selected {
  border-color: #409eff;
  background: #409eff;
  color: white;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.tool-checkbox {
  margin: 0;
}

.tool-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tool-icon {
  font-size: 16px;
}

.prompt-textarea {
  font-family: 'Courier New', monospace;
}

.prompt-tips {
  margin-top: 16px;
  padding: 16px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
}

.prompt-tips h5 {
  margin: 0 0 8px 0;
  color: #856404;
}

.prompt-tips ul {
  margin: 0;
  padding-left: 20px;
  color: #856404;
}

.prompt-tips li {
  margin: 4px 0;
  font-size: 13px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 0;
  border-top: 1px solid #e8e8e8;
  margin-top: 20px;
}

.scenario-preview {
  max-height: 500px;
  overflow-y: auto;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.preview-icon {
  font-size: 32px;
}

.preview-info h3 {
  margin: 0 0 8px 0;
  color: #333;
}

.preview-info p {
  margin: 0;
  color: #666;
}

.preview-config {
  margin-bottom: 20px;
}

.config-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.config-label {
  color: #666;
  font-size: 14px;
}

.config-value {
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.preview-prompt h4 {
  margin: 0 0 12px 0;
  color: #333;
}

.prompt-preview {
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
</style>
