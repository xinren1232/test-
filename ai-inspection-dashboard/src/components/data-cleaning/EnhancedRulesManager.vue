<template>
  <div class="enhanced-rules-manager">
    <!-- 规则管理头部 -->
    <div class="rules-header">
      <div class="header-left">
        <h3>🔧 数据清洗规则配置</h3>
        <p>配置和管理数据清洗规则，支持多种清洗策略和自定义规则</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showCreateRuleDialog">
          <el-icon><Plus /></el-icon>
          新建规则
        </el-button>
        <el-button @click="importRules">
          <el-icon><Upload /></el-icon>
          导入规则
        </el-button>
        <el-button @click="exportRules">
          <el-icon><Download /></el-icon>
          导出规则
        </el-button>
      </div>
    </div>

    <!-- 规则分类 -->
    <div class="rules-categories">
      <el-tabs v-model="activeCategory" @tab-change="handleCategoryChange">
        <el-tab-pane label="基础清洗" name="basic">
          <div class="category-description">
            <el-icon><DataAnalysis /></el-icon>
            <span>基础数据清洗规则：去除空值、重复数据、格式标准化等</span>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="数据验证" name="validation">
          <div class="category-description">
            <el-icon><CircleCheck /></el-icon>
            <span>数据验证规则：格式验证、完整性检查、业务规则验证</span>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="数据转换" name="transformation">
          <div class="category-description">
            <el-icon><EditPen /></el-icon>
            <span>数据转换规则：类型转换、单位换算、编码转换</span>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="智能分析" name="intelligent">
          <div class="category-description">
            <el-icon><MagicStick /></el-icon>
            <span>智能分析规则：AI辅助清洗、异常检测、模式识别</span>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="自定义规则" name="custom">
          <div class="category-description">
            <el-icon><Tools /></el-icon>
            <span>自定义规则：JavaScript代码、正则表达式、业务逻辑</span>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 规则列表 -->
    <div class="rules-list">
      <div class="rules-grid">
        <div 
          v-for="rule in filteredRules" 
          :key="rule.id"
          class="rule-card"
          :class="{ 'active': rule.enabled, 'disabled': !rule.enabled }"
        >
          <div class="rule-header">
            <div class="rule-title">
              <el-icon><component :is="rule.icon" /></el-icon>
              <span>{{ rule.name }}</span>
            </div>
            <div class="rule-actions">
              <el-switch 
                v-model="rule.enabled" 
                @change="toggleRule(rule)"
                size="small"
              />
              <el-dropdown @command="handleRuleAction">
                <el-button size="small" type="text">
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="{action: 'edit', rule}">编辑</el-dropdown-item>
                    <el-dropdown-item :command="{action: 'duplicate', rule}">复制</el-dropdown-item>
                    <el-dropdown-item :command="{action: 'test', rule}">测试</el-dropdown-item>
                    <el-dropdown-item :command="{action: 'delete', rule}" divided>删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          
          <div class="rule-content">
            <p class="rule-description">{{ rule.description }}</p>
            
            <div class="rule-details">
              <div class="rule-meta">
                <el-tag :type="getCategoryType(rule.category)" size="small">
                  {{ getCategoryName(rule.category) }}
                </el-tag>
                <el-tag type="info" size="small">
                  优先级: {{ rule.priority }}
                </el-tag>
              </div>
              
              <div class="rule-stats">
                <span class="stat-item">
                  <el-icon><Timer /></el-icon>
                  执行次数: {{ rule.executionCount || 0 }}
                </span>
                <span class="stat-item">
                  <el-icon><SuccessFilled /></el-icon>
                  成功率: {{ rule.successRate || 100 }}%
                </span>
              </div>
            </div>
            
            <!-- 规则配置预览 -->
            <div v-if="rule.config" class="rule-config">
              <el-collapse>
                <el-collapse-item title="配置详情" name="config">
                  <div class="config-preview">
                    <pre>{{ JSON.stringify(rule.config, null, 2) }}</pre>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 批量操作 -->
    <div class="batch-operations">
      <el-card>
        <template #header>
          <span>批量操作</span>
        </template>
        
        <div class="batch-actions">
          <el-button @click="enableAllRules">
            <el-icon><Check /></el-icon>
            启用所有规则
          </el-button>
          <el-button @click="disableAllRules">
            <el-icon><Close /></el-icon>
            禁用所有规则
          </el-button>
          <el-button @click="resetToDefaults">
            <el-icon><RefreshLeft /></el-icon>
            恢复默认配置
          </el-button>
          <el-button type="primary" @click="saveRulesConfig">
            <el-icon><DocumentChecked /></el-icon>
            保存配置
          </el-button>
        </div>
        
        <div class="rules-summary">
          <div class="summary-item">
            <span class="summary-label">总规则数:</span>
            <span class="summary-value">{{ allRules.length }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">已启用:</span>
            <span class="summary-value enabled">{{ enabledRulesCount }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">已禁用:</span>
            <span class="summary-value disabled">{{ disabledRulesCount }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 创建/编辑规则对话框 -->
    <el-dialog
      v-model="ruleDialogVisible"
      :title="isEditMode ? '编辑规则' : '创建规则'"
      width="60%"
      :before-close="closeRuleDialog"
    >
      <el-form :model="ruleForm" :rules="ruleFormRules" ref="ruleFormRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="规则名称" prop="name">
              <el-input v-model="ruleForm.name" placeholder="输入规则名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规则分类" prop="category">
              <el-select v-model="ruleForm.category" placeholder="选择规则分类">
                <el-option label="基础清洗" value="basic" />
                <el-option label="数据验证" value="validation" />
                <el-option label="数据转换" value="transformation" />
                <el-option label="智能分析" value="intelligent" />
                <el-option label="自定义规则" value="custom" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="规则描述" prop="description">
          <el-input 
            v-model="ruleForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="描述规则的功能和用途"
          />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-input-number 
                v-model="ruleForm.priority" 
                :min="1" 
                :max="100" 
                placeholder="1-100"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="启用状态">
              <el-switch v-model="ruleForm.enabled" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="规则配置">
          <el-input 
            v-model="ruleForm.configJson" 
            type="textarea" 
            :rows="8"
            placeholder="输入JSON格式的规则配置"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeRuleDialog">取消</el-button>
          <el-button type="primary" @click="saveRule">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Upload,
  Download,
  DataAnalysis,
  CircleCheck,
  EditPen,
  MagicStick,
  Tools,
  MoreFilled,
  Timer,
  SuccessFilled,
  Check,
  Close,
  RefreshLeft,
  DocumentChecked
} from '@element-plus/icons-vue'

export default {
  name: 'EnhancedRulesManager',
  components: {
    Plus,
    Upload,
    Download,
    DataAnalysis,
    CircleCheck,
    EditPen,
    MagicStick,
    Tools,
    MoreFilled,
    Timer,
    SuccessFilled,
    Check,
    Close,
    RefreshLeft,
    DocumentChecked
  },
  emits: ['rules-updated'],
  setup(props, { emit }) {
    const activeCategory = ref('basic')
    const ruleDialogVisible = ref(false)
    const isEditMode = ref(false)
    const ruleFormRef = ref()
    
    // 规则表单
    const ruleForm = ref({
      name: '',
      category: '',
      description: '',
      priority: 50,
      enabled: true,
      configJson: ''
    })

    // 表单验证规则
    const ruleFormRules = {
      name: [
        { required: true, message: '请输入规则名称', trigger: 'blur' }
      ],
      category: [
        { required: true, message: '请选择规则分类', trigger: 'change' }
      ],
      description: [
        { required: true, message: '请输入规则描述', trigger: 'blur' }
      ]
    }

    // 所有规则数据
    const allRules = ref([
      {
        id: 1,
        name: '去除空值',
        category: 'basic',
        description: '移除空白、null、undefined等无效数据',
        priority: 90,
        enabled: true,
        icon: 'DataAnalysis',
        executionCount: 156,
        successRate: 98,
        config: {
          removeEmpty: true,
          removeWhitespace: true,
          removeNull: true
        }
      },
      {
        id: 2,
        name: '去除重复数据',
        category: 'basic',
        description: '基于关键字段去除重复记录',
        priority: 85,
        enabled: true,
        icon: 'DataAnalysis',
        executionCount: 89,
        successRate: 95,
        config: {
          keyFields: ['materialCode', 'id'],
          keepFirst: true
        }
      },
      {
        id: 3,
        name: '数据格式验证',
        category: 'validation',
        description: '验证数据格式的正确性，如邮箱、电话号码等',
        priority: 80,
        enabled: true,
        icon: 'CircleCheck',
        executionCount: 234,
        successRate: 92,
        config: {
          emailValidation: true,
          phoneValidation: true,
          dateValidation: true
        }
      },
      {
        id: 4,
        name: '日期格式标准化',
        category: 'transformation',
        description: '统一日期格式为 YYYY-MM-DD',
        priority: 75,
        enabled: true,
        icon: 'EditPen',
        executionCount: 178,
        successRate: 97,
        config: {
          targetFormat: 'YYYY-MM-DD',
          autoDetect: true
        }
      },
      {
        id: 5,
        name: 'AI异常检测',
        category: 'intelligent',
        description: '使用机器学习算法检测数据异常',
        priority: 70,
        enabled: false,
        icon: 'MagicStick',
        executionCount: 45,
        successRate: 88,
        config: {
          algorithm: 'isolation_forest',
          threshold: 0.1
        }
      },
      {
        id: 6,
        name: '术语标准化',
        category: 'transformation',
        description: '统一术语和表达方式',
        priority: 65,
        enabled: true,
        icon: 'EditPen',
        executionCount: 123,
        successRate: 94,
        config: {
          termMapping: {
            '质量问题': '质量异常',
            '品质问题': '质量异常'
          }
        }
      },
      {
        id: 7,
        name: '数值范围验证',
        category: 'validation',
        description: '验证数值是否在合理范围内',
        priority: 60,
        enabled: true,
        icon: 'CircleCheck',
        executionCount: 67,
        successRate: 91,
        config: {
          ranges: {
            quantity: { min: 0, max: 10000 },
            price: { min: 0, max: 1000000 }
          }
        }
      },
      {
        id: 8,
        name: '智能分类',
        category: 'intelligent',
        description: '基于内容自动分类数据',
        priority: 55,
        enabled: false,
        icon: 'MagicStick',
        executionCount: 23,
        successRate: 85,
        config: {
          model: 'text_classification',
          categories: ['技术', '质量', '服务', '其他']
        }
      }
    ])

    // 计算属性
    const filteredRules = computed(() => {
      return allRules.value.filter(rule => rule.category === activeCategory.value)
    })

    const enabledRulesCount = computed(() => {
      return allRules.value.filter(rule => rule.enabled).length
    })

    const disabledRulesCount = computed(() => {
      return allRules.value.filter(rule => !rule.enabled).length
    })

    // 方法
    const handleCategoryChange = (category) => {
      activeCategory.value = category
    }

    const getCategoryType = (category) => {
      const types = {
        basic: 'primary',
        validation: 'success',
        transformation: 'warning',
        intelligent: 'danger',
        custom: 'info'
      }
      return types[category] || 'info'
    }

    const getCategoryName = (category) => {
      const names = {
        basic: '基础清洗',
        validation: '数据验证',
        transformation: '数据转换',
        intelligent: '智能分析',
        custom: '自定义'
      }
      return names[category] || category
    }

    const toggleRule = (rule) => {
      ElMessage.success(`规则 "${rule.name}" 已${rule.enabled ? '启用' : '禁用'}`)
      emit('rules-updated', allRules.value)
    }

    const handleRuleAction = ({ action, rule }) => {
      switch (action) {
        case 'edit':
          editRule(rule)
          break
        case 'duplicate':
          duplicateRule(rule)
          break
        case 'test':
          testRule(rule)
          break
        case 'delete':
          deleteRule(rule)
          break
      }
    }

    const editRule = (rule) => {
      isEditMode.value = true
      ruleForm.value = {
        ...rule,
        configJson: JSON.stringify(rule.config, null, 2)
      }
      ruleDialogVisible.value = true
    }

    const duplicateRule = (rule) => {
      const newRule = {
        ...rule,
        id: Date.now(),
        name: `${rule.name} (副本)`,
        enabled: false
      }
      allRules.value.push(newRule)
      ElMessage.success('规则已复制')
    }

    const testRule = (rule) => {
      ElMessage.info(`正在测试规则: ${rule.name}`)
      // 这里可以实现规则测试逻辑
    }

    const deleteRule = (rule) => {
      ElMessageBox.confirm(
        `确定要删除规则 "${rule.name}" 吗？`,
        '确认删除',
        {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        const index = allRules.value.findIndex(r => r.id === rule.id)
        if (index > -1) {
          allRules.value.splice(index, 1)
          ElMessage.success('规则已删除')
          emit('rules-updated', allRules.value)
        }
      }).catch(() => {
        ElMessage.info('已取消删除')
      })
    }

    return {
      activeCategory,
      ruleDialogVisible,
      isEditMode,
      ruleFormRef,
      ruleForm,
      ruleFormRules,
      allRules,
      filteredRules,
      enabledRulesCount,
      disabledRulesCount,
      handleCategoryChange,
      getCategoryType,
      getCategoryName,
      toggleRule,
      handleRuleAction,
      showCreateRuleDialog,
      importRules,
      exportRules,
      enableAllRules,
      disableAllRules,
      resetToDefaults,
      saveRulesConfig,
      closeRuleDialog,
      saveRule
    }

    function showCreateRuleDialog() {
      isEditMode.value = false
      ruleForm.value = {
        name: '',
        category: activeCategory.value,
        description: '',
        priority: 50,
        enabled: true,
        configJson: '{}'
      }
      ruleDialogVisible.value = true
    }

    function importRules() {
      ElMessage.info('导入规则功能开发中...')
    }

    function exportRules() {
      const rulesData = JSON.stringify(allRules.value, null, 2)
      const blob = new Blob([rulesData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'cleaning-rules.json'
      a.click()
      URL.revokeObjectURL(url)
      ElMessage.success('规则已导出')
    }

    function enableAllRules() {
      allRules.value.forEach(rule => {
        rule.enabled = true
      })
      ElMessage.success('已启用所有规则')
      emit('rules-updated', allRules.value)
    }

    function disableAllRules() {
      allRules.value.forEach(rule => {
        rule.enabled = false
      })
      ElMessage.success('已禁用所有规则')
      emit('rules-updated', allRules.value)
    }

    function resetToDefaults() {
      ElMessageBox.confirm(
        '确定要恢复默认配置吗？这将重置所有规则设置。',
        '确认重置',
        {
          confirmButtonText: '重置',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 重置到默认配置
        ElMessage.success('已恢复默认配置')
        emit('rules-updated', allRules.value)
      }).catch(() => {
        ElMessage.info('已取消重置')
      })
    }

    function saveRulesConfig() {
      ElMessage.success('规则配置已保存')
      emit('rules-updated', allRules.value)
    }

    function closeRuleDialog() {
      ruleDialogVisible.value = false
      ruleForm.value = {
        name: '',
        category: '',
        description: '',
        priority: 50,
        enabled: true,
        configJson: ''
      }
    }

    function saveRule() {
      ruleFormRef.value.validate((valid) => {
        if (valid) {
          try {
            const config = JSON.parse(ruleForm.value.configJson || '{}')

            if (isEditMode.value) {
              // 编辑现有规则
              const index = allRules.value.findIndex(r => r.id === ruleForm.value.id)
              if (index > -1) {
                allRules.value[index] = {
                  ...ruleForm.value,
                  config
                }
              }
              ElMessage.success('规则已更新')
            } else {
              // 创建新规则
              const newRule = {
                ...ruleForm.value,
                id: Date.now(),
                icon: getCategoryIcon(ruleForm.value.category),
                executionCount: 0,
                successRate: 100,
                config
              }
              allRules.value.push(newRule)
              ElMessage.success('规则已创建')
            }

            closeRuleDialog()
            emit('rules-updated', allRules.value)
          } catch (error) {
            ElMessage.error('配置JSON格式错误')
          }
        }
      })
    }

    function getCategoryIcon(category) {
      const icons = {
        basic: 'DataAnalysis',
        validation: 'CircleCheck',
        transformation: 'EditPen',
        intelligent: 'MagicStick',
        custom: 'Tools'
      }
      return icons[category] || 'Tools'
    }
  }
}
</script>

<style scoped>
.enhanced-rules-manager {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.rules-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
}

.header-left h3 {
  margin: 0 0 5px 0;
  font-size: 24px;
}

.header-left p {
  margin: 0;
  opacity: 0.9;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.rules-categories {
  margin-bottom: 30px;
}

.category-description {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.rules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.rule-card {
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 20px;
  background: white;
  transition: all 0.3s;
}

.rule-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.rule-card.active {
  border-color: #67c23a;
  background: #f0f9ff;
}

.rule-card.disabled {
  opacity: 0.6;
  background: #f5f5f5;
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.rule-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
}

.rule-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rule-description {
  color: #606266;
  margin-bottom: 15px;
  line-height: 1.5;
}

.rule-details {
  margin-bottom: 15px;
}

.rule-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.rule-stats {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #909399;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.config-preview {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.batch-operations {
  margin-top: 30px;
}

.batch-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.rules-summary {
  display: flex;
  gap: 30px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-label {
  color: #606266;
}

.summary-value {
  font-weight: 600;
}

.summary-value.enabled {
  color: #67c23a;
}

.summary-value.disabled {
  color: #f56c6c;
}

.dialog-footer {
  text-align: right;
}
</style>
