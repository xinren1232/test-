<template>
  <div class="cleaning-rules-manager">
    <!-- 规则管理头部 -->
    <div class="rules-header">
      <div class="header-left">
        <h3>数据清洗规则管理</h3>
        <p>配置和管理数据清洗规则，支持自定义规则创建</p>
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

    <!-- 规则分类标签 -->
    <div class="rules-categories">
      <el-tabs v-model="activeCategory" @tab-change="handleCategoryChange">
        <el-tab-pane label="基础规则" name="basic">
          <div class="category-description">
            <el-icon><DataAnalysis /></el-icon>
            <span>基础数据清洗规则，包括去除空值、格式化等常用操作</span>
          </div>
        </el-tab-pane>
        <el-tab-pane label="高级规则" name="advanced">
          <div class="category-description">
            <el-icon><Setting /></el-icon>
            <span>高级数据处理规则，包括术语标准化、智能分析等</span>
          </div>
        </el-tab-pane>
        <el-tab-pane label="格式化规则" name="format">
          <div class="category-description">
            <el-icon><EditPen /></el-icon>
            <span>数据格式化规则，统一日期、数值、文本格式</span>
          </div>
        </el-tab-pane>
        <el-tab-pane label="验证规则" name="validation">
          <div class="category-description">
            <el-icon><CircleCheck /></el-icon>
            <span>数据验证规则，检查数据完整性和准确性</span>
          </div>
        </el-tab-pane>
        <el-tab-pane label="自定义规则" name="custom">
          <div class="category-description">
            <el-icon><Tools /></el-icon>
            <span>用户自定义规则，支持JavaScript代码和正则表达式</span>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 规则列表 -->
    <div class="rules-list">
      <div class="list-controls">
        <el-input
          v-model="searchText"
          placeholder="搜索规则..."
          style="width: 300px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <div class="view-controls">
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button label="grid">网格视图</el-radio-button>
            <el-radio-button label="list">列表视图</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 网格视图 -->
      <div v-if="viewMode === 'grid'" class="rules-grid">
        <div
          v-for="rule in filteredRules"
          :key="rule.id"
          class="rule-card"
          :class="{ active: rule.enabled, disabled: !rule.enabled }"
        >
          <div class="rule-header">
            <div class="rule-info">
              <h4 class="rule-name">{{ rule.name }}</h4>
              <el-tag :type="getCategoryType(rule.category)" size="small">
                {{ getCategoryLabel(rule.category) }}
              </el-tag>
            </div>
            <div class="rule-actions">
              <el-switch
                v-model="rule.enabled"
                @change="toggleRule(rule)"
                size="small"
              />
              <el-dropdown @command="handleRuleAction">
                <el-button type="text" size="small">
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="`edit_${rule.id}`">编辑</el-dropdown-item>
                    <el-dropdown-item :command="`copy_${rule.id}`">复制</el-dropdown-item>
                    <el-dropdown-item :command="`test_${rule.id}`">测试</el-dropdown-item>
                    <el-dropdown-item :command="`delete_${rule.id}`" divided>删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          
          <div class="rule-description">
            {{ rule.description }}
          </div>
          
          <div class="rule-stats">
            <div class="stat-item">
              <span class="stat-label">使用次数:</span>
              <span class="stat-value">{{ rule.usageCount || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">成功率:</span>
              <span class="stat-value">{{ rule.successRate || 100 }}%</span>
            </div>
          </div>
          
          <div class="rule-footer">
            <div class="rule-priority">
              <el-rate
                v-model="rule.priority"
                :max="5"
                size="small"
                disabled
                show-score
                text-color="#ff9900"
              />
            </div>
            <div class="rule-updated">
              更新于 {{ formatDate(rule.updatedAt) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-if="viewMode === 'list'" class="rules-table">
        <el-table :data="filteredRules" style="width: 100%">
          <el-table-column prop="enabled" label="状态" width="80">
            <template #default="{ row }">
              <el-switch
                v-model="row.enabled"
                @change="toggleRule(row)"
                size="small"
              />
            </template>
          </el-table-column>
          
          <el-table-column prop="name" label="规则名称" min-width="150">
            <template #default="{ row }">
              <div class="rule-name-cell">
                <span class="name">{{ row.name }}</span>
                <el-tag :type="getCategoryType(row.category)" size="small">
                  {{ getCategoryLabel(row.category) }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
          
          <el-table-column prop="priority" label="优先级" width="120">
            <template #default="{ row }">
              <el-rate
                v-model="row.priority"
                :max="5"
                size="small"
                disabled
              />
            </template>
          </el-table-column>
          
          <el-table-column prop="usageCount" label="使用次数" width="100" />
          
          <el-table-column prop="successRate" label="成功率" width="100">
            <template #default="{ row }">
              {{ row.successRate || 100 }}%
            </template>
          </el-table-column>
          
          <el-table-column prop="updatedAt" label="更新时间" width="150">
            <template #default="{ row }">
              {{ formatDate(row.updatedAt) }}
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button type="text" size="small" @click="editRule(row)">编辑</el-button>
              <el-button type="text" size="small" @click="testRule(row)">测试</el-button>
              <el-button type="text" size="small" @click="deleteRule(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 创建/编辑规则对话框 -->
    <el-dialog
      v-model="ruleDialogVisible"
      :title="editingRule ? '编辑规则' : '创建规则'"
      width="60%"
      :before-close="closeRuleDialog"
    >
      <el-form
        ref="ruleFormRef"
        :model="ruleForm"
        :rules="ruleFormRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="规则名称" prop="name">
              <el-input v-model="ruleForm.name" placeholder="请输入规则名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规则分类" prop="category">
              <el-select v-model="ruleForm.category" placeholder="请选择分类">
                <el-option label="基础规则" value="basic" />
                <el-option label="高级规则" value="advanced" />
                <el-option label="格式化规则" value="format" />
                <el-option label="验证规则" value="validation" />
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
            placeholder="请输入规则描述"
          />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-rate v-model="ruleForm.priority" :max="5" show-text />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="启用状态">
              <el-switch v-model="ruleForm.enabled" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="规则代码" prop="code">
          <el-input
            v-model="ruleForm.code"
            type="textarea"
            :rows="8"
            placeholder="请输入JavaScript代码或正则表达式"
          />
          <div class="code-help">
            <el-text type="info" size="small">
              支持JavaScript函数，参数为data数组，返回处理后的数据
            </el-text>
          </div>
        </el-form-item>
        
        <el-form-item label="测试数据">
          <el-input
            v-model="ruleForm.testData"
            type="textarea"
            :rows="4"
            placeholder="请输入测试数据（JSON格式）"
          />
          <div class="test-actions">
            <el-button size="small" @click="testRuleCode">测试规则</el-button>
            <el-button size="small" @click="clearTestResult">清除结果</el-button>
          </div>
        </el-form-item>
        
        <el-form-item v-if="testResult" label="测试结果">
          <div class="test-result">
            <pre>{{ testResult }}</pre>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="closeRuleDialog">取消</el-button>
        <el-button type="primary" @click="saveRule">保存</el-button>
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
  Search,
  DataAnalysis,
  Setting,
  EditPen,
  CircleCheck,
  Tools,
  MoreFilled
} from '@element-plus/icons-vue'

export default {
  name: 'CleaningRulesManager',
  components: {
    Plus,
    Upload,
    Download,
    Search,
    DataAnalysis,
    Setting,
    EditPen,
    CircleCheck,
    Tools,
    MoreFilled
  },
  setup() {
    // 响应式数据
    const activeCategory = ref('basic')
    const searchText = ref('')
    const viewMode = ref('grid')
    const ruleDialogVisible = ref(false)
    const editingRule = ref(null)
    const testResult = ref('')
    
    // 表单相关
    const ruleFormRef = ref()
    const ruleForm = ref({
      name: '',
      category: 'basic',
      description: '',
      priority: 3,
      enabled: true,
      code: '',
      testData: ''
    })
    
    const ruleFormRules = {
      name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
      category: [{ required: true, message: '请选择规则分类', trigger: 'change' }],
      description: [{ required: true, message: '请输入规则描述', trigger: 'blur' }],
      code: [{ required: true, message: '请输入规则代码', trigger: 'blur' }]
    }

    // 模拟规则数据
    const rules = ref([
      {
        id: 'remove_empty',
        name: '去除空值',
        category: 'basic',
        description: '移除空白、null、undefined等无效数据',
        priority: 5,
        enabled: true,
        usageCount: 1250,
        successRate: 98,
        updatedAt: new Date('2024-01-15'),
        code: 'return data.filter(item => Object.values(item).some(value => value !== null && value !== undefined && value !== ""));'
      },
      {
        id: 'trim_whitespace',
        name: '去除空白字符',
        category: 'basic',
        description: '移除字段值前后的空白字符',
        priority: 4,
        enabled: true,
        usageCount: 980,
        successRate: 99,
        updatedAt: new Date('2024-01-10'),
        code: 'return data.map(item => { const cleaned = {}; Object.keys(item).forEach(key => { cleaned[key] = typeof item[key] === "string" ? item[key].trim() : item[key]; }); return cleaned; });'
      },
      {
        id: 'standardize_terms',
        name: '术语标准化',
        category: 'advanced',
        description: '统一术语和表达方式',
        priority: 3,
        enabled: true,
        usageCount: 456,
        successRate: 95,
        updatedAt: new Date('2024-01-08'),
        code: 'const termMapping = {"质量问题": "质量异常", "品质问题": "质量异常"}; return data.map(item => { const standardized = {}; Object.keys(item).forEach(key => { let value = item[key]; if (typeof value === "string") { Object.keys(termMapping).forEach(oldTerm => { value = value.replace(new RegExp(oldTerm, "g"), termMapping[oldTerm]); }); } standardized[key] = value; }); return standardized; });'
      }
    ])

    // 计算属性
    const filteredRules = computed(() => {
      let filtered = rules.value

      // 按分类过滤
      if (activeCategory.value !== 'all') {
        filtered = filtered.filter(rule => rule.category === activeCategory.value)
      }

      // 按搜索文本过滤
      if (searchText.value) {
        const search = searchText.value.toLowerCase()
        filtered = filtered.filter(rule =>
          rule.name.toLowerCase().includes(search) ||
          rule.description.toLowerCase().includes(search)
        )
      }

      return filtered
    })

    // 方法
    const getCategoryType = (category) => {
      const types = {
        basic: 'primary',
        advanced: 'success',
        format: 'warning',
        validation: 'info',
        custom: 'danger'
      }
      return types[category] || 'info'
    }

    const getCategoryLabel = (category) => {
      const labels = {
        basic: '基础',
        advanced: '高级',
        format: '格式化',
        validation: '验证',
        custom: '自定义'
      }
      return labels[category] || category
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('zh-CN')
    }

    const handleCategoryChange = (category) => {
      activeCategory.value = category
    }

    const toggleRule = (rule) => {
      ElMessage.success(`规则 "${rule.name}" 已${rule.enabled ? '启用' : '禁用'}`)
    }

    const handleRuleAction = (command) => {
      const [action, ruleId] = command.split('_')
      const rule = rules.value.find(r => r.id === ruleId)
      
      switch (action) {
        case 'edit':
          editRule(rule)
          break
        case 'copy':
          copyRule(rule)
          break
        case 'test':
          testRule(rule)
          break
        case 'delete':
          deleteRule(rule)
          break
      }
    }

    const showCreateRuleDialog = () => {
      editingRule.value = null
      ruleForm.value = {
        name: '',
        category: 'basic',
        description: '',
        priority: 3,
        enabled: true,
        code: '',
        testData: ''
      }
      ruleDialogVisible.value = true
    }

    const editRule = (rule) => {
      editingRule.value = rule
      ruleForm.value = { ...rule }
      ruleDialogVisible.value = true
    }

    const copyRule = (rule) => {
      const newRule = {
        ...rule,
        id: `${rule.id}_copy_${Date.now()}`,
        name: `${rule.name} (副本)`,
        usageCount: 0
      }
      rules.value.push(newRule)
      ElMessage.success('规则已复制')
    }

    const testRule = (rule) => {
      ElMessage.info(`正在测试规则: ${rule.name}`)
      // 这里可以实现规则测试逻辑
    }

    const deleteRule = async (rule) => {
      try {
        await ElMessageBox.confirm(`确定要删除规则 "${rule.name}" 吗？`, '确认删除', {
          type: 'warning'
        })
        
        const index = rules.value.findIndex(r => r.id === rule.id)
        if (index > -1) {
          rules.value.splice(index, 1)
          ElMessage.success('规则已删除')
        }
      } catch {
        // 用户取消
      }
    }

    const saveRule = async () => {
      try {
        await ruleFormRef.value.validate()
        
        if (editingRule.value) {
          // 编辑现有规则
          Object.assign(editingRule.value, ruleForm.value)
          editingRule.value.updatedAt = new Date()
          ElMessage.success('规则已更新')
        } else {
          // 创建新规则
          const newRule = {
            ...ruleForm.value,
            id: `custom_${Date.now()}`,
            usageCount: 0,
            successRate: 100,
            updatedAt: new Date()
          }
          rules.value.push(newRule)
          ElMessage.success('规则已创建')
        }
        
        closeRuleDialog()
      } catch (error) {
        console.error('保存规则失败:', error)
      }
    }

    const closeRuleDialog = () => {
      ruleDialogVisible.value = false
      editingRule.value = null
      testResult.value = ''
    }

    const testRuleCode = () => {
      try {
        const testData = JSON.parse(ruleForm.value.testData || '[]')
        const code = ruleForm.value.code
        
        // 创建函数并执行
        const func = new Function('data', code)
        const result = func(testData)
        
        testResult.value = JSON.stringify(result, null, 2)
        ElMessage.success('规则测试成功')
      } catch (error) {
        testResult.value = `错误: ${error.message}`
        ElMessage.error('规则测试失败')
      }
    }

    const clearTestResult = () => {
      testResult.value = ''
    }

    const importRules = () => {
      ElMessage.info('导入规则功能开发中...')
    }

    const exportRules = () => {
      const data = JSON.stringify(rules.value, null, 2)
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'cleaning_rules.json'
      link.click()
      URL.revokeObjectURL(url)
      ElMessage.success('规则已导出')
    }

    return {
      activeCategory,
      searchText,
      viewMode,
      ruleDialogVisible,
      editingRule,
      testResult,
      ruleFormRef,
      ruleForm,
      ruleFormRules,
      filteredRules,
      getCategoryType,
      getCategoryLabel,
      formatDate,
      handleCategoryChange,
      toggleRule,
      handleRuleAction,
      showCreateRuleDialog,
      editRule,
      copyRule,
      testRule,
      deleteRule,
      saveRule,
      closeRuleDialog,
      testRuleCode,
      clearTestResult,
      importRules,
      exportRules
    }
  }
}
</script>

<style scoped>
.cleaning-rules-manager {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.rules-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-left h3 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
}

.header-left p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.rules-categories {
  margin-bottom: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.category-description {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 15px 20px;
  color: #606266;
  font-size: 14px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
}

.rules-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.list-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.view-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  padding: 20px;
}

.rule-card {
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  padding: 20px;
  background: white;
  transition: all 0.3s ease;
  position: relative;
}

.rule-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.rule-card.active {
  border-color: #67c23a;
  background-color: #f0f9ff;
}

.rule-card.disabled {
  opacity: 0.6;
  background-color: #f5f7fa;
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.rule-info h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
}

.rule-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rule-description {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 15px;
}

.rule-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.rule-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #f0f2f5;
}

.rule-updated {
  font-size: 12px;
  color: #909399;
}

.rules-table {
  padding: 20px;
}

.rule-name-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rule-name-cell .name {
  font-weight: 500;
  color: #2c3e50;
}

.code-help {
  margin-top: 8px;
}

.test-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

.test-result {
  background-color: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 15px;
  max-height: 200px;
  overflow-y: auto;
}

.test-result pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-wrap: break-word;
}

@media (max-width: 768px) {
  .rules-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .header-actions {
    justify-content: space-between;
  }

  .list-controls {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .rules-grid {
    grid-template-columns: 1fr;
  }

  .rule-stats {
    flex-direction: column;
    gap: 10px;
  }

  .stat-item {
    flex-direction: row;
    justify-content: space-between;
  }
}
</style>
