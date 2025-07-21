<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    width="50%"
    @close="onClose"
  >
    <el-form :model="form" ref="formRef" label-width="100px" :rules="rules">
      <el-form-item label="意图名称" prop="intent_name">
        <el-input v-model="form.intent_name" placeholder="例如：查询库存" />
        <div class="form-tip">简洁明了的意图名称，用于识别用户查询意图</div>
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input type="textarea" v-model="form.description" placeholder="描述这个意图规则的功能" />
        <div class="form-tip">详细描述这个规则的功能和用途</div>
      </el-form-item>
      <el-form-item label="动作类型" prop="action_type">
        <el-select v-model="form.action_type" placeholder="请选择动作类型">
          <el-option label="API 调用" value="API_CALL" />
          <el-option label="SQL 查询" value="SQL_QUERY" />
        </el-select>
        <div class="form-tip">选择执行的动作类型</div>
      </el-form-item>
      <el-form-item label="动作目标" prop="action_target">
        <el-input
          type="textarea"
          :rows="4"
          v-model="form.action_target" 
          placeholder="如果是API调用，输入端点路径；如果是SQL查询，输入SQL模板，使用?作为参数占位符" 
        />
        <div class="form-tip">
          <span v-if="form.action_type === 'API_CALL'">API端点路径，例如：/api/inventory/query</span>
          <span v-else-if="form.action_type === 'SQL_QUERY'">SQL查询语句，使用?作为参数占位符，例如：SELECT * FROM inventory WHERE material_code = ?</span>
        </div>
      </el-form-item>
      <el-form-item label="示例问题" prop="example_query">
        <el-input v-model="form.example_query" placeholder="例如：查一下某个物料的库存" />
        <div class="form-tip">用户可能会如何提问，用于测试和示例</div>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-switch
          v-model="form.status"
          active-value="active"
          inactive-value="inactive"
          active-text="启用"
          inactive-text="禁用"
        />
      </el-form-item>
      <el-form-item label="参数定义" prop="parameters">
        <div v-for="(param, index) in form.parameters" :key="index" class="parameter-item">
          <el-input v-model="param.name" placeholder="参数名" style="width: 150px; margin-right: 10px;" />
          <el-select v-model="param.type" placeholder="类型" style="width: 120px; margin-right: 10px;">
            <el-option label="字符串" value="string" />
            <el-option label="数字" value="number" />
            <el-option label="日期" value="date" />
            <el-option label="布尔值" value="boolean" />
            <el-option label="列表" value="array" />
          </el-select>
            <el-input
            v-if="param.type === 'string' || param.type === 'array'" 
            v-model="param.default" 
            placeholder="默认值(可选)" 
            style="width: 150px; margin-right: 10px;" 
          />
          <el-input-number 
            v-if="param.type === 'number'" 
            v-model="param.default" 
            placeholder="默认值" 
            style="width: 150px; margin-right: 10px;" 
          />
          <el-button @click="removeParameter(index)" :icon="Delete" circle plain type="danger" />
        </div>
        <el-button @click="addParameter" :icon="Plus" type="primary" plain>添加参数</el-button>
        <div class="form-tip">定义规则所需的参数，将用于匹配用户输入</div>
      </el-form-item>
      
      <el-divider content-position="center">预览</el-divider>
      
      <div class="preview-section" v-if="form.action_type === 'SQL_QUERY'">
        <h4>SQL查询预览</h4>
        <pre>{{ form.action_target }}</pre>
        <h4>参数列表</h4>
        <el-tag v-for="(param, index) in form.parameters" :key="index" class="param-tag">
          {{ param.name }}: {{ param.type }}
        </el-tag>
        <div v-if="form.parameters.length === 0" class="no-params">无参数</div>
      </div>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onClose">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Delete, Plus } from '@element-plus/icons-vue';

const props = defineProps({
  visible: Boolean,
  title: String,
  data: Object,
});

const emit = defineEmits(['update:visible', 'submit']);

const formRef = ref(null);
const form = ref({
  intent_name: '',
  description: '',
  action_type: 'SQL_QUERY',
  action_target: '',
  parameters: [],
  example_query: '',
  status: 'active',
});

const rules = {
  intent_name: [{ required: true, message: '请输入意图名称', trigger: 'blur' }],
  action_type: [{ required: true, message: '请选择动作类型', trigger: 'change' }],
  action_target: [{ required: true, message: '请输入动作目标', trigger: 'blur' }],
  example_query: [{ required: true, message: '请输入示例问题', trigger: 'blur' }],
};

watch(() => props.data, (newData) => {
  if (newData) {
    form.value = { 
      ...newData,
      parameters: typeof newData.parameters === 'string' ? JSON.parse(newData.parameters) : newData.parameters || []
    };
  } else {
    form.value = {
      intent_name: '',
      description: '',
      action_type: 'SQL_QUERY',
      action_target: '',
      parameters: [],
      example_query: '',
      status: 'active',
    };
  }
}, { immediate: true, deep: true });

const addParameter = () => {
  form.value.parameters.push({ name: '', type: 'string', default: '' });
    };
    
const removeParameter = (index) => {
  form.value.parameters.splice(index, 1);
    };
    
const onClose = () => {
  emit('update:visible', false);
    };
    
// 验证参数名称是否有效
const validateParameters = () => {
  const params = form.value.parameters;
  for (let i = 0; i < params.length; i++) {
    if (!params[i].name || params[i].name.trim() === '') {
      ElMessage.error(`参数 #${i+1} 的名称不能为空`);
      return false;
    }
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(params[i].name)) {
      ElMessage.error(`参数 #${i+1} 的名称格式无效，必须以字母开头，只能包含字母、数字和下划线`);
      return false;
    }
  }
  return true;
    };
    
// 验证SQL语句中的参数占位符数量是否与参数数量匹配
const validateSqlParameters = () => {
  if (form.value.action_type !== 'SQL_QUERY') return true;
  
  const sql = form.value.action_target;
  const paramCount = (sql.match(/\?/g) || []).length;
  
  if (paramCount !== form.value.parameters.length) {
    ElMessage.error(`SQL语句中的参数占位符数量(${paramCount})与定义的参数数量(${form.value.parameters.length})不匹配`);
          return false;
        }
  
  return true;
    };
    
const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate((valid) => {
    if (valid) {
      // 额外验证参数
      if (!validateParameters()) return;
      if (!validateSqlParameters()) return;
      
      const submissionData = {
        ...form.value,
        parameters: JSON.stringify(form.value.parameters),
      };
      emit('submit', submissionData);
      onClose();
    } else {
      ElMessage.error('请填写所有必填项');
  }
  });
};
</script>

<style scoped>
.parameter-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}
.dialog-footer {
  text-align: right;
}
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
.preview-section {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  margin-top: 10px;
}
.preview-section h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #606266;
}
.preview-section pre {
  background-color: #edf2fc;
  padding: 10px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: monospace;
}
.param-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}
.no-params {
  color: #909399;
  font-style: italic;
}
</style> 