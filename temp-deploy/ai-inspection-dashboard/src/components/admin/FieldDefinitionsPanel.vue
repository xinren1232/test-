<template>
  <div class="field-definitions-panel">
    <el-card class="module-description">
      <template #header>
        <div class="module-header">
          <h3>{{ getModuleName() }} 数据字段配置</h3>
          <div class="header-actions">
            <el-button type="primary" size="small" @click="addField">
              <el-icon><Plus /></el-icon>添加字段
            </el-button>
          </div>
        </div>
      </template>
      <div class="description-content">
        <p>{{ getModuleDescription() }}</p>
        <el-alert
          :title="`${getModuleName()}模块共有 ${fields.length} 个字段定义`"
          type="info"
          show-icon
          :closable="false"
          class="field-count"
        />
      </div>
    </el-card>
    
    <!-- 字段列表 -->
    <div class="fields-container">
      <el-table :data="fields" style="width: 100%" border>
        <el-table-column prop="id" label="字段ID" width="120" />
        <el-table-column prop="name" label="字段名称" width="120" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag>{{ getFieldTypeName(scope.row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" />
        <el-table-column label="状态" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.required" type="success" size="small" style="margin-right: 5px">必填</el-tag>
            <el-tag v-if="scope.row.unique" type="warning" size="small">唯一</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button link type="primary" @click="editField(scope.row)">编辑</el-button>
            <el-button link type="danger" @click="removeField(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 字段编辑对话框 -->
    <el-dialog 
      v-model="fieldDialogVisible" 
      :title="currentIndex === -1 ? '添加字段' : '编辑字段'" 
      width="70%"
      destroy-on-close
    >
      <el-form label-position="top" :model="currentField" class="field-form">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="字段ID">
              <el-input v-model="currentField.id" placeholder="字段唯一标识符" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="字段名称">
              <el-input v-model="currentField.name" placeholder="字段显示名称" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="字段类型">
              <el-select v-model="currentField.type" style="width: 100%;">
                <el-option label="文本" value="string" />
                <el-option label="数字" value="number" />
                <el-option label="日期" value="date" />
                <el-option label="布尔值" value="boolean" />
                <el-option label="对象" value="object" />
                <el-option label="数组" value="array" />
                <el-option label="枚举" value="enum" />
                <el-option label="规格" value="specification" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="示例值">
              <el-input v-model="currentField.sample" placeholder="字段示例值" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24">
            <el-form-item label="字段描述">
              <el-input 
                v-model="currentField.description" 
                type="textarea" 
                :rows="2"
                placeholder="字段详细描述"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :xs="24" :sm="8">
            <el-form-item>
              <el-checkbox v-model="currentField.required" label="必填字段" border />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-form-item>
              <el-checkbox v-model="currentField.unique" label="唯一字段" border />
            </el-form-item>
          </el-col>
        </el-row>
        
        <!-- 字段验证规则 -->
        <el-divider content-position="left">验证规则</el-divider>
        
        <!-- 根据字段类型显示不同的验证规则选项 -->
        <div v-if="currentField.type === 'string'">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-form-item label="最小长度">
                <el-input-number 
                  v-model="currentField.validation.minLength" 
                  :min="0"
                  controls-position="right"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="最大长度">
                <el-input-number 
                  v-model="currentField.validation.maxLength" 
                  :min="0" 
                  controls-position="right"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-form-item label="正则表达式">
                <el-input v-model="currentField.validation.pattern" placeholder="验证用的正则表达式" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="错误提示">
                <el-input v-model="currentField.validation.message" placeholder="验证失败时的错误提示" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="枚举值（可选值列表，多个值用逗号分隔）">
            <el-input v-model="enumInput" placeholder="例如：正常,冻结,待检" />
          </el-form-item>
        </div>

        <!-- 项目和基线关系设置 -->
        <el-divider content-position="left">关联关系</el-divider>
        
        <el-row :gutter="20">
          <el-col :xs="24" :sm="8">
            <el-form-item label="关联模块">
              <el-select v-model="currentField.relation.module" style="width: 100%;">
                <el-option label="无关联" value="" />
                <el-option label="库存物料" value="inventory" />
                <el-option label="实验室测试" value="lab" />
                <el-option label="上线使用" value="online" />
                <el-option label="基线设计" value="baseline" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-form-item label="关联字段">
              <el-input v-model="currentField.relation.field" placeholder="关联字段ID" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-form-item label="关联类型">
              <el-select v-model="currentField.relation.type" style="width: 100%;">
                <el-option label="一对一" value="oneToOne" />
                <el-option label="一对多" value="oneToMany" />
                <el-option label="多对一" value="manyToOne" />
                <el-option label="多对多" value="manyToMany" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span>
          <el-button @click="fieldDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveField">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';

// 组件属性
const props = defineProps({
  moduleName: {
    type: String,
    required: true,
    validator: (value) => ['inventory', 'lab', 'online', 'baseline'].includes(value)
  },
  fields: {
    type: Array,
    required: true
  }
});

// 事件
const emit = defineEmits(['update:fields']);

// 字段编辑对话框
const fieldDialogVisible = ref(false);
const currentField = reactive({
  id: '',
  name: '',
  type: 'string',
  required: false,
  unique: false,
  description: '',
  sample: '',
  validation: {},
  relation: {
    module: '',
    field: '',
    type: 'oneToOne'
  }
});
const currentIndex = ref(-1);
const enumInput = ref('');

// 获取模块名称
function getModuleName() {
  const moduleMap = {
    'inventory': '库存物料',
    'lab': '实验室测试',
    'online': '上线使用',
    'baseline': '基线设计'
  };
  return moduleMap[props.moduleName] || '未知模块';
}

// 获取模块描述
function getModuleDescription() {
  const descriptionMap = {
    'inventory': '定义库存物料数据的字段结构，包括物料基本信息、库存状态和质量信息等。',
    'lab': '定义实验室测试数据的字段结构，包括测试项目、方法、结果和相关物料信息等。',
    'online': '定义物料上线使用数据的字段结构，包括使用工厂、产线、良率和状态等。',
    'baseline': '定义基线设计数据的字段结构，包括基线版本、物料清单和质量要求等。'
  };
  return descriptionMap[props.moduleName] || '';
}

// 获取字段类型名称
function getFieldTypeName(type) {
  const types = {
    string: '文本',
    number: '数字',
    date: '日期',
    boolean: '布尔值',
    object: '对象',
    array: '数组',
    enum: '枚举',
    specification: '规格'
  };
  return types[type] || type;
}

// 添加字段
function addField() {
  // 重置当前字段
  Object.assign(currentField, {
    id: '',
    name: '',
    type: 'string',
    required: false,
    unique: false,
    description: '',
    sample: '',
    validation: {},
    relation: {
      module: '',
      field: '',
      type: 'oneToOne'
    }
  });
  
  // 重置枚举输入
  enumInput.value = '';
  
  // 设置为添加模式
  currentIndex.value = -1;
  
  // 显示对话框
  fieldDialogVisible.value = true;
}

// 编辑字段
function editField(field) {
  // 找到字段索引
  const index = props.fields.findIndex(f => f.id === field.id);
  if (index === -1) return;
  
  // 设置当前索引
  currentIndex.value = index;
  
  // 复制字段数据
  const fieldCopy = JSON.parse(JSON.stringify(field));
  
  // 确保validation和relation对象存在
  if (!fieldCopy.validation) fieldCopy.validation = {};
  if (!fieldCopy.relation) {
    fieldCopy.relation = {
      module: '',
      field: '',
      type: 'oneToOne'
    };
  }
  
  // 设置当前字段
  Object.assign(currentField, fieldCopy);
  
  // 如果是枚举类型，设置枚举输入
  if (field.type === 'enum' && Array.isArray(field.enumValues)) {
    enumInput.value = field.enumValues.join(',');
  } else {
    enumInput.value = '';
  }
  
  // 显示对话框
  fieldDialogVisible.value = true;
}

// 移除字段
function removeField(index) {
  // 确认删除
  ElMessage.confirm(`确定要删除字段 "${props.fields[index].name}" 吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 创建字段副本
    const updatedFields = [...props.fields];
    
    // 移除字段
    updatedFields.splice(index, 1);
    
    // 更新字段
    emit('update:fields', updatedFields);
    
    ElMessage.success('字段已删除');
  }).catch(() => {});
}

// 保存字段
function saveField() {
  // 验证必填项
  if (!currentField.id || !currentField.name) {
    ElMessage.warning('字段ID和名称为必填项');
    return;
  }
  
  // 处理枚举值
  if (currentField.type === 'enum' && enumInput.value) {
    currentField.enumValues = enumInput.value.split(',').map(v => v.trim()).filter(v => v);
  }
  
  // 创建字段副本
  const updatedFields = [...props.fields];
  
  if (currentIndex.value === -1) {
    // 添加模式
    
    // 检查字段ID是否已存在
    if (updatedFields.some(f => f.id === currentField.id)) {
      ElMessage.warning(`字段ID "${currentField.id}" 已存在`);
      return;
    }
    
    // 添加新字段
    updatedFields.push(JSON.parse(JSON.stringify(currentField)));
    
    ElMessage.success('字段已添加');
  } else {
    // 编辑模式
    
    // 更新字段
    updatedFields[currentIndex.value] = JSON.parse(JSON.stringify(currentField));
    
    ElMessage.success('字段已更新');
  }
  
  // 更新字段
  emit('update:fields', updatedFields);
  
  // 关闭对话框
  fieldDialogVisible.value = false;
}
</script>

<style scoped>
.field-definitions-panel {
  padding: 20px;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.module-header h3 {
  margin: 0;
}

.description-content {
  margin-top: 20px;
}

.fields-container {
  margin-top: 20px;
}

.field-count {
  margin-top: 15px;
}

.field-form {
  margin-top: 20px;
}
</style> 