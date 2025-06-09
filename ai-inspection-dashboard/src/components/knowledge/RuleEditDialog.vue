<template>
  <el-dialog
    title="规则编辑"
    :modelValue="visible"
    @update:modelValue="$emit('update:visible', $event)"
    width="60%"
    :before-close="handleClose"
  >
    <el-form :model="form" label-width="120px" label-position="right">
      <!-- 基本信息 -->
      <el-form-item label="规则名称" required>
        <el-input v-model="form.name" placeholder="请输入规则名称" />
      </el-form-item>
      
      <el-form-item label="规则类型">
        <el-select v-model="form.type" disabled>
          <el-option label="查询映射规则" value="query_mapping" />
          <el-option label="关键词映射规则" value="keyword_mapping" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="规则描述">
        <el-input v-model="form.description" type="textarea" :rows="2" placeholder="请输入规则描述" />
      </el-form-item>
      
      <el-divider content-position="left">匹配模式</el-divider>
      
      <!-- 匹配模式 -->
      <el-form-item label="匹配关键词">
        <el-tag
          v-for="(pattern, index) in form.patterns"
          :key="index"
          closable
          @close="removePattern(index)"
          class="pattern-tag"
        >
          {{ pattern }}
        </el-tag>
        <el-input
          v-if="inputVisible"
          ref="inputRef"
          v-model="inputValue"
          class="ml-1 w-20"
          size="small"
          @keyup.enter="handleInputConfirm"
          @blur="handleInputConfirm"
        />
        <el-button v-else class="button-new-tag ml-1" size="small" @click="showInput">
          + 添加关键词
        </el-button>
      </el-form-item>
      
      <el-divider content-position="left">SQL配置</el-divider>
      
      <!-- SQL模板 -->
      <el-form-item label="SQL模板">
        <el-input v-model="form.sqlTemplate" type="textarea" :rows="5" placeholder="请输入SQL查询模板，使用 {参数名} 表示参数" />
      </el-form-item>
      
      <!-- 参数配置 -->
      <el-form-item label="必需参数">
        <el-tag
          v-for="(param, index) in form.requiredParams"
          :key="index"
          closable
          @close="removeParam(index)"
          class="param-tag"
          type="warning"
        >
          {{ param }}
        </el-tag>
        <el-input
          v-if="paramInputVisible"
          ref="paramInputRef"
          v-model="paramInputValue"
          class="ml-1 w-20"
          size="small"
          @keyup.enter="handleParamInputConfirm"
          @blur="handleParamInputConfirm"
        />
        <el-button v-else class="button-new-tag ml-1" size="small" @click="showParamInput">
          + 添加参数
        </el-button>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="submitForm">
          保存
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  rule: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:visible', 'save']);

// 表单数据
const form = ref({
  id: '',
  name: '',
  type: 'query_mapping',
  description: '',
  patterns: [],
  sqlTemplate: '',
  requiredParams: []
});

// 关键词输入相关
const inputVisible = ref(false);
const inputValue = ref('');
const inputRef = ref(null);

// 参数输入相关
const paramInputVisible = ref(false);
const paramInputValue = ref('');
const paramInputRef = ref(null);

// 监听传入的规则数据
watch(() => props.rule, (newRule) => {
  if (newRule) {
    form.value = {
      id: newRule.id || '',
      name: newRule.name || '',
      type: newRule.type || 'query_mapping',
      description: newRule.description || '',
      patterns: [...(newRule.patterns || [])],
      sqlTemplate: newRule.sqlTemplate || '',
      requiredParams: [...(newRule.requiredParams || [])]
    };
  } else {
    // 重置表单
    form.value = {
      id: '',
      name: '',
      type: 'query_mapping',
      description: '',
      patterns: [],
      sqlTemplate: '',
      requiredParams: []
    };
  }
}, { immediate: true });

// 显示关键词输入框
const showInput = () => {
  inputVisible.value = true;
  nextTick(() => {
    inputRef.value.focus();
  });
};

// 添加关键词
const handleInputConfirm = () => {
  if (inputValue.value) {
    form.value.patterns.push(inputValue.value);
  }
  inputVisible.value = false;
  inputValue.value = '';
};

// 删除关键词
const removePattern = (index) => {
  form.value.patterns.splice(index, 1);
};

// 显示参数输入框
const showParamInput = () => {
  paramInputVisible.value = true;
  nextTick(() => {
    paramInputRef.value.focus();
  });
};

// 添加参数
const handleParamInputConfirm = () => {
  if (paramInputValue.value) {
    form.value.requiredParams.push(paramInputValue.value);
  }
  paramInputVisible.value = false;
  paramInputValue.value = '';
};

// 删除参数
const removeParam = (index) => {
  form.value.requiredParams.splice(index, 1);
};

// 关闭对话框
const handleClose = () => {
  emit('update:visible', false);
};

// 提交表单
const submitForm = () => {
  // 检查必填项
  if (!form.value.name) {
    ElMessage.warning('请输入规则名称');
    return;
  }
  
  // 提交保存
  emit('save', { ...form.value });
  emit('update:visible', false);
};
</script>

<style scoped>
.pattern-tag, .param-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

.button-new-tag {
  margin-left: 8px;
  vertical-align: bottom;
}

.input-new-tag {
  width: 150px;
  margin-left: 8px;
  vertical-align: bottom;
}
</style> 