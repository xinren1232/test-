<template>
  <div class="data-module-config">
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
import { ref, reactive, computed, watch } from 'vue';
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

// 当前展开的字段
const activeFields = ref([]);

// 临时枚举输入
const enumInput = ref('');

// 临时规格值输入
const specValuesInput = ref('');

// 添加字段相关
const addFieldDialogVisible = ref(false);
const newField = reactive({
  id: '',
  name: '',
  type: 'string',
  required: false,
  unique: false,
  description: '',
  validation: {},
  relation: {
    module: '',
    field: '',
    type: 'oneToOne'
  },
  sample: '',
  specType: '',
  specValues: []
});

// 检查是否可以添加新字段
const canAddField = computed(() => {
  return newField.id && newField.name && newField.type;
});

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
  return descriptionMap[props.moduleName] || '模块数据字段定义';
}

// 获取关联字段选项
function getRelationFieldOptions(moduleName) {
  const fieldOptionsMap = {
    'inventory': [
      { label: '物料编码 (materialCode)', value: 'materialCode' },
      { label: '批次号 (batchNo)', value: 'batchNo' },
      { label: '物料名称 (materialName)', value: 'materialName' },
      { label: '供应商 (supplier)', value: 'supplier' }
    ],
    'lab': [
      { label: '测试ID (testId)', value: 'testId' },
      { label: '物料编码 (materialCode)', value: 'materialCode' },
      { label: '批次号 (batchNo)', value: 'batchNo' },
      { label: '测试结果 (result)', value: 'result' }
    ],
    'online': [
      { label: '上线ID (onlineId)', value: 'onlineId' },
      { label: '物料编码 (materialCode)', value: 'materialCode' },
      { label: '批次号 (batchNo)', value: 'batchNo' },
      { label: '工厂 (factory)', value: 'factory' },
      { label: '产线 (line)', value: 'line' }
    ],
    'baseline': [
      { label: '基线ID (baselineId)', value: 'baselineId' },
      { label: '基线名称 (baselineName)', value: 'baselineName' },
      { label: '项目 (project)', value: 'project' }
    ]
  };
  
  return fieldOptionsMap[moduleName] || [];
}

// 添加字段
function addField() {
  addFieldDialogVisible.value = true;
  
  // 重置新字段表单
  Object.assign(newField, {
    id: '',
    name: '',
    type: 'string',
    required: false,
    unique: false,
    description: '',
    validation: {},
    relation: {
      module: '',
      field: '',
      type: 'oneToOne'
    },
    sample: '',
    specType: '',
    specValues: []
  });
}

// 确认添加字段
function confirmAddField() {
  if (!newField.id || !newField.name) {
    ElMessage.warning('字段ID和名称为必填项');
    return;
  }
  
  // 检查字段ID是否已存在
  if (props.fields.some(field => field.id === newField.id)) {
    ElMessage.warning(`字段ID "${newField.id}" 已存在`);
    return;
  }
  
  // 根据字段类型初始化验证规则
  const validation = {};
  switch (newField.type) {
    case 'string':
      validation.minLength = 0;
      validation.maxLength = 100;
      break;
    case 'number':
      validation.min = 0;
      validation.max = 1000;
      validation.precision = 0;
      break;
    case 'date':
      validation.format = 'YYYY-MM-DD';
      break;
    case 'specification':
      validation.required = newField.required;
      break;
  }
  
  // 创建新字段对象
  const fieldToAdd = {
    id: newField.id,
    name: newField.name,
    type: newField.type,
    required: newField.required,
    unique: newField.unique,
    description: newField.description || `${newField.name}字段`,
    validation,
    relation: {
      module: '',
      field: '',
      type: 'oneToOne'
    },
    sample: ''
  };
  
  // 如果是规格类型，添加规格相关属性
  if (newField.type === 'specification') {
    fieldToAdd.specType = newField.specType || 'other';
    fieldToAdd.specValues = newField.specValues || [];
  }
  
  // 添加到字段列表
  const updatedFields = [...props.fields, fieldToAdd];
  emit('update:fields', updatedFields);
  
  // 关闭对话框
  addFieldDialogVisible.value = false;
  
  // 展开新添加的字段
  activeFields.value.push(fieldToAdd.id);
  
  ElMessage.success(`成功添加字段: ${fieldToAdd.name}`);
}

// 更新字段
function updateField(index) {
  const updatedFields = [...props.fields];
  emit('update:fields', updatedFields);
  ElMessage.success(`成功更新字段: ${updatedFields[index].name}`);
}

// 删除字段
function removeField(index) {
  const fieldToRemove = props.fields[index];
  const updatedFields = props.fields.filter((_, i) => i !== index);
  emit('update:fields', updatedFields);
  
  // 从展开列表中移除
  activeFields.value = activeFields.value.filter(id => id !== fieldToRemove.id);
  
  ElMessage.success(`成功删除字段: ${fieldToRemove.name}`);
}

// 更新枚举值
function updateEnum(index) {
  if (!enumInput.value) return;
  
  const values = enumInput.value.split(',').map(v => v.trim()).filter(v => v);
  if (values.length === 0) return;
  
  const updatedFields = [...props.fields];
  if (!updatedFields[index].validation) {
    updatedFields[index].validation = {};
  }
  updatedFields[index].validation.enum = values;
  
  emit('update:fields', updatedFields);
  enumInput.value = '';
}

// 显示枚举输入
function showEnumInput(index) {
  const field = props.fields[index];
  if (field.validation && field.validation.enum) {
    enumInput.value = field.validation.enum.join(',');
  } else {
    enumInput.value = '';
  }
}

// 移除枚举项
function removeEnumItem(fieldIndex, enumIndex) {
  const updatedFields = [...props.fields];
  updatedFields[fieldIndex].validation.enum.splice(enumIndex, 1);
  
  if (updatedFields[fieldIndex].validation.enum.length === 0) {
    delete updatedFields[fieldIndex].validation.enum;
  }
  
  emit('update:fields', updatedFields);
}

// 更新规格值
function updateSpecValues(index) {
  if (!specValuesInput.value) return;
  
  const values = specValuesInput.value.split(',').map(v => v.trim()).filter(v => v);
  if (values.length === 0) return;
  
  const updatedFields = [...props.fields];
  updatedFields[index].specValues = values;
  
  emit('update:fields', updatedFields);
  specValuesInput.value = '';
}

// 编辑字段
function editField(field) {
  // 实现编辑字段的逻辑
}

// 保存字段
function saveField() {
  // 实现保存字段的逻辑
}

// 获取字段类型的显示名称
function getFieldTypeName(type) {
  const typeMap = {
    'string': '文本',
    'number': '数字',
    'date': '日期',
    'boolean': '布尔值',
    'object': '对象',
    'array': '数组',
    'enum': '枚举',
    'specification': '规格'
  };
  return typeMap[type] || type;
}
</script>

<style scoped>
.data-module-config {
  margin-bottom: 20px;
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
  margin-bottom: 10px;
}

.field-count {
  margin-top: 15px;
}

.fields-container {
  margin-top: 20px;
}

.field-collapse-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.field-name {
  font-weight: bold;
}

.field-tags {
  display: flex;
  gap: 5px;
}

.field-form {
  padding: 10px;
}

.field-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style> 