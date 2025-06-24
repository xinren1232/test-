<template>
  <div class="unified-data-config">
    <div class="config-header">
      <h2>统一数据配置</h2>
      <div class="header-actions">
        <el-button type="primary" @click="saveAllConfigs">
          <el-icon><Check /></el-icon>保存全部配置
        </el-button>
        <el-button @click="resetAllConfigs">
          <el-icon><Refresh /></el-icon>重置
        </el-button>
      </div>
    </div>

    <el-alert
      title="统一数据字段配置"
      type="info"
      description="在此页面统一管理所有模块的数据字段，公共字段只需定义一次，可被多个模块引用"
      show-icon
      style="margin-bottom: 20px;"
      :closable="false"
    />

    <!-- 配置模式选择 -->
    <div class="config-mode">
      <el-radio-group v-model="configMode">
        <el-radio-button label="unified">统一视图</el-radio-button>
        <el-radio-button label="byModule">按模块视图</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 统一视图模式 -->
    <div v-if="configMode === 'unified'" class="unified-view">
      <el-card class="field-library-card">
        <template #header>
          <div class="card-header">
            <h3>字段库</h3>
            <el-button type="primary" size="small" @click="addUnifiedField">
              <el-icon><Plus /></el-icon>添加字段
            </el-button>
          </div>
        </template>

        <el-table :data="unifiedFields" style="width: 100%" border>
          <el-table-column prop="id" label="字段ID" sortable />
          <el-table-column prop="name" label="字段名称" />
          <el-table-column prop="type" label="类型" width="100">
            <template #default="scope">
              <el-tag>{{ getFieldTypeName(scope.row.type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="150">
            <template #default="scope">
              <el-tag v-if="scope.row.required" type="success" size="small" style="margin-right: 5px">必填</el-tag>
              <el-tag v-if="scope.row.unique" type="warning" size="small">唯一</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="使用模块" width="250">
            <template #default="scope">
              <el-tag 
                v-for="module in getFieldModules(scope.row.id)" 
                :key="module"
                type="info"
                size="small"
                style="margin-right: 5px; margin-bottom: 5px;"
              >
                {{ getModuleName(module) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button link type="primary" @click="editUnifiedField(scope.row)">编辑</el-button>
              <el-button link type="danger" @click="confirmDeleteField(scope.row)">删除</el-button>
              <el-button link type="success" @click="assignToModule(scope.row)">分配到模块</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 模块字段分配 -->
      <el-card class="module-assignments-card" style="margin-top: 20px;">
        <template #header>
          <div class="card-header">
            <h3>模块字段分配</h3>
          </div>
        </template>

        <el-tabs tab-position="left">
          <el-tab-pane v-for="module in modules" :key="module.id" :label="module.name">
            <div class="module-fields">
              <el-table :data="getModuleFields(module.id)" style="width: 100%" border>
                <el-table-column prop="id" label="字段ID" width="120" />
                <el-table-column prop="name" label="字段名称" width="150" />
                <el-table-column prop="description" label="描述" />
                <el-table-column width="180">
                  <template #header>
                    <el-button type="primary" size="small" @click="openFieldSelector(module.id)">
                      <el-icon><Plus /></el-icon>添加字段
                    </el-button>
                  </template>
                  <template #default="scope">
                    <el-button link type="danger" @click="removeFieldFromModule(module.id, scope.row.id)">移除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>

    <!-- 按模块视图模式 -->
    <div v-else class="module-view">
      <el-tabs v-model="activeModule">
        <el-tab-pane v-for="module in modules" :key="module.id" :label="module.name" :name="module.id">
          <data-module-config 
            :module-name="module.id"
            :fields="getModuleFields(module.id)"
            @update:fields="updatedFields => updateModuleFields(module.id, updatedFields)"
          />
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 字段编辑对话框 -->
    <el-dialog 
      v-model="fieldDialogVisible" 
      :title="fieldDialogMode === 'add' ? '添加字段' : '编辑字段'" 
      width="70%"
      destroy-on-close
    >
      <field-editor 
        v-if="fieldDialogVisible"
        :field="currentEditingField" 
        :mode="fieldDialogMode"
        @update:field="updatedField => currentEditingField = updatedField"
        @save="saveFieldEdit"
        @cancel="fieldDialogVisible = false"
      />
    </el-dialog>

    <!-- 模块字段选择器对话框 -->
    <el-dialog 
      v-model="fieldSelectorVisible" 
      title="选择字段添加到模块" 
      width="60%"
    >
      <el-table 
        :data="getAvailableFieldsForModule(fieldSelectorModuleId)" 
        style="width: 100%" 
        border
        @selection-change="handleFieldSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="字段ID" width="120" />
        <el-table-column prop="name" label="字段名称" width="150" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag>{{ getFieldTypeName(scope.row.type) }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <span>
          <el-button @click="fieldSelectorVisible = false">取消</el-button>
          <el-button type="primary" @click="addSelectedFieldsToModule">添加已选字段</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Check, Refresh, Plus } from '@element-plus/icons-vue';
import DataModuleConfig from './DataModuleConfig.vue';
import FieldEditor from './FieldEditor.vue';

// 配置模式
const configMode = ref('unified');

// 当前激活的模块
const activeModule = ref('inventory');

// 模块列表
const modules = ref([
  { id: 'inventory', name: '库存物料' },
  { id: 'lab', name: '实验室测试' },
  { id: 'online', name: '上线使用' },
  { id: 'baseline', name: '基线设计' }
]);

// 字段库 (统一视图)
const unifiedFields = ref([]);

// 各模块对应的字段配置 (使用字段ID引用)
const moduleFields = reactive({
  inventory: [],
  lab: [],
  online: [],
  baseline: []
});

// 对话框控制
const fieldDialogVisible = ref(false);
const fieldDialogMode = ref('add'); // 'add' 或 'edit'
const currentEditingField = ref(null);

// 字段选择器对话框控制
const fieldSelectorVisible = ref(false);
const fieldSelectorModuleId = ref('');
const selectedFields = ref([]);

// 获取字段在哪些模块中使用
function getFieldModules(fieldId) {
  const usedIn = [];
  
  for (const moduleId in moduleFields) {
    if (moduleFields[moduleId].includes(fieldId)) {
      usedIn.push(moduleId);
    }
  }
  
  return usedIn;
}

// 获取模块名称
function getModuleName(moduleId) {
  const module = modules.value.find(m => m.id === moduleId);
  return module ? module.name : moduleId;
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

// 获取模块的字段完整信息
function getModuleFields(moduleId) {
  return moduleFields[moduleId].map(fieldId => {
    return unifiedFields.value.find(field => field.id === fieldId);
  }).filter(field => field !== undefined);
}

// 获取可添加到模块的字段
function getAvailableFieldsForModule(moduleId) {
  return unifiedFields.value.filter(field => !moduleFields[moduleId].includes(field.id));
}

// 打开字段选择器
function openFieldSelector(moduleId) {
  fieldSelectorModuleId.value = moduleId;
  fieldSelectorVisible.value = true;
}

// 处理字段选择变化
function handleFieldSelectionChange(selection) {
  selectedFields.value = selection;
}

// 添加选中的字段到模块
function addSelectedFieldsToModule() {
  if (selectedFields.value.length === 0) {
    ElMessage.warning('请至少选择一个字段');
    return;
  }
  
  const moduleId = fieldSelectorModuleId.value;
  selectedFields.value.forEach(field => {
    if (!moduleFields[moduleId].includes(field.id)) {
      moduleFields[moduleId].push(field.id);
    }
  });
  
  ElMessage.success(`已添加 ${selectedFields.value.length} 个字段到${getModuleName(moduleId)}模块`);
  fieldSelectorVisible.value = false;
}

// 从模块中移除字段
function removeFieldFromModule(moduleId, fieldId) {
  const index = moduleFields[moduleId].indexOf(fieldId);
  if (index !== -1) {
    moduleFields[moduleId].splice(index, 1);
    ElMessage.success(`已从${getModuleName(moduleId)}模块移除字段`);
  }
}

// 添加统一字段
function addUnifiedField() {
  currentEditingField.value = {
    id: '',
    name: '',
    type: 'string',
    required: false,
    unique: false,
    description: '',
    validation: {}
  };
  fieldDialogMode.value = 'add';
  fieldDialogVisible.value = true;
}

// 编辑统一字段
function editUnifiedField(field) {
  currentEditingField.value = { ...field };
  fieldDialogMode.value = 'edit';
  fieldDialogVisible.value = true;
}

// 确认删除字段
function confirmDeleteField(field) {
  ElMessageBox.confirm(
    `确定要删除字段 "${field.name}"吗？此操作将从所有模块中移除该字段。`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 删除字段
    const index = unifiedFields.value.findIndex(f => f.id === field.id);
    if (index !== -1) {
      unifiedFields.value.splice(index, 1);
      
      // 从所有模块中移除该字段
      for (const moduleId in moduleFields) {
        const fieldIndex = moduleFields[moduleId].indexOf(field.id);
        if (fieldIndex !== -1) {
          moduleFields[moduleId].splice(fieldIndex, 1);
        }
      }
      
      ElMessage.success(`已删除字段: ${field.name}`);
    }
  }).catch(() => {});
}

// 将字段分配到模块
function assignToModule(field) {
  fieldSelectorModuleId.value = '';
  // 实现字段分配模态框
}

// 保存字段编辑
function saveFieldEdit() {
  if (!currentEditingField.value.id || !currentEditingField.value.name) {
    ElMessage.error('字段ID和名称为必填项');
    return;
  }
  
  if (fieldDialogMode.value === 'add') {
    // 检查ID是否已存在
    if (unifiedFields.value.some(f => f.id === currentEditingField.value.id)) {
      ElMessage.error('字段ID已存在');
      return;
    }
    
    unifiedFields.value.push({ ...currentEditingField.value });
    ElMessage.success('字段添加成功');
  } else {
    // 编辑模式
    const index = unifiedFields.value.findIndex(f => f.id === currentEditingField.value.id);
    if (index !== -1) {
      unifiedFields.value[index] = { ...currentEditingField.value };
      ElMessage.success('字段更新成功');
    }
  }
  
  fieldDialogVisible.value = false;
}

// 更新模块字段
function updateModuleFields(moduleId, fields) {
  // 更新统一字段库
  fields.forEach(field => {
    const existingIndex = unifiedFields.value.findIndex(f => f.id === field.id);
    if (existingIndex === -1) {
      // 添加新字段
      unifiedFields.value.push({ ...field });
    } else {
      // 更新现有字段
      unifiedFields.value[existingIndex] = { ...field };
    }
  });
  
  // 更新模块字段引用
  moduleFields[moduleId] = fields.map(field => field.id);
}

// 保存所有配置
function saveAllConfigs() {
  // 实际项目中应该保存到后端或本地存储
  localStorage.setItem('unifiedFields', JSON.stringify(unifiedFields.value));
  localStorage.setItem('moduleFields', JSON.stringify(moduleFields));
  ElMessage.success('所有配置已保存');
}

// 重置所有配置
function resetAllConfigs() {
  ElMessageBox.confirm('确定要重置所有配置吗？这将恢复到上次保存的状态。', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 从存储中加载配置
    loadConfigs();
    ElMessage.info('配置已重置');
  }).catch(() => {});
}

// 初始化加载配置
function loadConfigs() {
  // 尝试从本地存储加载数据
  try {
    const storedFields = localStorage.getItem('unifiedFields');
    const storedModuleFields = localStorage.getItem('moduleFields');
    
    if (storedFields) {
      unifiedFields.value = JSON.parse(storedFields);
    }
    
    if (storedModuleFields) {
      const parsedModuleFields = JSON.parse(storedModuleFields);
      for (const moduleId in parsedModuleFields) {
        moduleFields[moduleId] = parsedModuleFields[moduleId];
      }
    }
  } catch (error) {
    console.error('加载配置失败:', error);
    // 加载默认配置
    initDefaultConfigs();
  }
}

// 初始化默认配置
function initDefaultConfigs() {
  // 默认字段
  unifiedFields.value = [
    // 通用字段
    {
      id: 'materialCode',
      name: '物料编码',
      type: 'string',
      required: true,
      unique: true,
      description: '物料唯一编码',
      sample: 'SHKH-0093',
      validation: {
        minLength: 3,
        maxLength: 20
      }
    },
    {
      id: 'materialName',
      name: '物料名称',
      type: 'string',
      required: true,
      unique: false,
      description: '物料名称，应明确表述物料种类',
      sample: '手机壳料-后盖',
      validation: {
        minLength: 2,
        maxLength: 50
      }
    },
    {
      id: 'materialType',
      name: '物料类型',
      type: 'string',
      required: true,
      unique: false,
      description: '物料类型分类',
      sample: '结构件',
      validation: {
        minLength: 2,
        maxLength: 30
      }
    },
    {
      id: 'specification',
      name: '物料规格',
      type: 'string',
      required: false,
      unique: false,
      description: '物料规格说明',
      sample: '120mm*60mm*10mm',
      validation: {}
    },
    {
      id: 'batchNo',
      name: '批次号',
      type: 'string',
      required: true,
      unique: true,
      description: '物料批次编号，用于追踪同一批次的物料',
      sample: 'SHKH-广S23-0093',
      validation: {
        minLength: 8,
        maxLength: 30
      }
    },
    {
      id: 'supplier',
      name: '供应商',
      type: 'string',
      required: true,
      unique: false,
      description: '物料供应商名称',
      sample: '歌尔股份',
      validation: {
        minLength: 2,
        maxLength: 50
      }
    },
    {
      id: 'quantity',
      name: '数量',
      type: 'number',
      required: true,
      unique: false,
      description: '物料数量',
      sample: '100',
      validation: {
        min: 0,
        max: 10000
      }
    },
    {
      id: 'unit',
      name: '单位',
      type: 'string',
      required: true,
      unique: false,
      description: '物料计量单位',
      sample: '个',
      validation: {
        minLength: 1,
        maxLength: 10
      }
    },
    {
      id: 'warehouse',
      name: '仓库',
      type: 'string',
      required: true,
      unique: false,
      description: '存储仓库',
      sample: '中央仓库',
      validation: {
        minLength: 2,
        maxLength: 20
      }
    },
    {
      id: 'location',
      name: '库位',
      type: 'string',
      required: true,
      unique: false,
      description: '库位编码',
      sample: 'A0402',
      validation: {
        minLength: 1,
        maxLength: 10
      }
    },
    {
      id: 'factory',
      name: '工厂',
      type: 'string',
      required: true,
      unique: false,
      description: '所属工厂',
      sample: '广州工厂',
      validation: {
        minLength: 2,
        maxLength: 20
      }
    },
    {
      id: 'status',
      name: '物料状态',
      type: 'string',
      required: true,
      unique: false,
      description: '物料当前状态',
      sample: '正常',
      validation: {
        enum: ['正常', '冻结', '风险', '处理中']
      }
    },
    {
      id: 'quality',
      name: '质量状态',
      type: 'string',
      required: true,
      unique: false,
      description: '物料质量状态',
      sample: '合格',
      validation: {
        enum: ['合格', '待检', '不合格']
      }
    },
    {
      id: 'arrivalDate',
      name: '入库日期',
      type: 'date',
      required: true,
      unique: false,
      description: '物料入库日期',
      sample: '2023-05-20',
      validation: {}
    },
    {
      id: 'expiryDate',
      name: '到期日期',
      type: 'date',
      required: false,
      unique: false,
      description: '物料有效期截止日期',
      sample: '2024-05-20',
      validation: {}
    },
    {
      id: 'lastUpdated',
      name: '最后更新',
      type: 'date',
      required: true,
      unique: false,
      description: '记录最后更新时间',
      sample: '2023-06-15',
      validation: {}
    },
    {
      id: 'inspectionDate',
      name: '检验日期',
      type: 'date',
      required: false,
      unique: false,
      description: '最近一次质量检验日期',
      sample: '2023-05-25',
      validation: {}
    }
  ];
  
  // 默认模块字段配置
  moduleFields.inventory = ['materialCode', 'materialName', 'materialType', 'specification', 'batchNo', 'supplier', 'quantity', 'unit', 'warehouse', 'location', 'factory', 'status', 'quality', 'arrivalDate', 'expiryDate', 'lastUpdated', 'inspectionDate'];
  moduleFields.lab = ['materialCode', 'materialName', 'batchNo', 'supplier', 'status', 'quality'];
  moduleFields.online = ['materialCode', 'materialName', 'batchNo', 'quantity', 'factory', 'status'];
  moduleFields.baseline = [];
}

// 初始化
loadConfigs();
</script>

<style scoped>
.unified-data-config {
  padding: 20px;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.config-header h2 {
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.config-mode {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.field-library-card,
.module-assignments-card {
  margin-bottom: 20px;
}

.module-fields {
  margin-top: 10px;
}
</style> 