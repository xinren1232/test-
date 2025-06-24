<template>
  <div class="add-qa-rule">
    <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="120px">
      <!-- 基本信息 -->
      <h3>基本信息</h3>
      <el-form-item label="主题" prop="topic">
        <el-input v-model="ruleForm.topic" placeholder="请输入知识主题" />
      </el-form-item>
      
      <el-form-item label="分类" prop="category">
        <el-select v-model="ruleForm.category" placeholder="请选择分类">
          <el-option label="质量检验" value="质量检验" />
          <el-option label="物料管理" value="物料管理" />
          <el-option label="生产工艺" value="生产工艺" />
          <el-option label="标准规范" value="标准规范" />
          <el-option label="其他" value="其他" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="来源" prop="source">
        <el-input v-model="ruleForm.source" placeholder="请输入知识来源" />
      </el-form-item>
      
      <el-form-item label="描述" prop="description">
        <el-input v-model="ruleForm.description" type="textarea" :rows="2" placeholder="请输入简短描述" />
      </el-form-item>
      
      <!-- 关键词 -->
      <h3>关键词</h3>
      <el-form-item label="关键词" prop="keywords">
        <el-tag
          v-for="(keyword, index) in ruleForm.keywords"
          :key="index"
          closable
          :disable-transitions="false"
          @close="removeKeyword(keyword)"
          class="keyword-tag"
        >
          {{ keyword }}
        </el-tag>
        <el-input
          v-if="inputVisible"
          ref="keywordInput"
          v-model="inputValue"
          class="keyword-input"
          size="small"
          @keyup.enter="addKeyword"
          @blur="addKeyword"
        />
        <el-button v-else class="button-new-tag" size="small" @click="showInput">
          + 添加关键词
        </el-button>
      </el-form-item>
      
      <!-- 内容 -->
      <h3>知识内容</h3>
      <el-form-item label="内容" prop="content">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="编辑" name="edit">
            <el-input
              v-model="ruleForm.content"
              type="textarea"
              :rows="12"
              placeholder="请输入知识内容，支持Markdown格式"
            />
          </el-tab-pane>
          <el-tab-pane label="预览" name="preview">
            <div class="markdown-preview" v-html="renderedContent"></div>
          </el-tab-pane>
        </el-tabs>
      </el-form-item>
      
      <!-- 示例问题 -->
      <h3>示例问题</h3>
      <el-form-item label="示例问题" prop="examples">
        <div v-for="(example, index) in ruleForm.examples" :key="index" class="example-item">
          <el-input v-model="ruleForm.examples[index]" placeholder="请输入示例问题">
            <template #append>
              <el-button @click="removeExample(index)" icon="Delete" />
            </template>
          </el-input>
        </div>
        <el-button type="primary" plain @click="addExample" icon="Plus">
          添加示例问题
        </el-button>
      </el-form-item>
      
      <!-- 相关主题 -->
      <h3>相关主题</h3>
      <el-form-item label="相关主题">
        <el-tag
          v-for="(topic, index) in ruleForm.related_topics"
          :key="index"
          closable
          :disable-transitions="false"
          @close="removeRelatedTopic(topic)"
          class="topic-tag"
        >
          {{ topic }}
        </el-tag>
        <el-input
          v-if="topicInputVisible"
          ref="topicInput"
          v-model="topicInputValue"
          class="topic-input"
          size="small"
          @keyup.enter="addRelatedTopic"
          @blur="addRelatedTopic"
        />
        <el-button v-else class="button-new-tag" size="small" @click="showTopicInput">
          + 添加相关主题
        </el-button>
      </el-form-item>
      
      <!-- 操作按钮 -->
      <el-form-item>
        <el-button type="primary" @click="submitForm">保存</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { ref, nextTick, computed } from 'vue';
import { marked } from 'marked';
import { Delete, Plus } from '@element-plus/icons-vue';

export default {
  name: 'AddQaRule',
  components: {
    Delete,
    Plus
  },
  emits: ['save', 'cancel'],
  setup(props, { emit }) {
    // 表单数据
    const ruleForm = ref({
      topic: '',
      category: '',
      keywords: [],
      source: '',
      description: '',
      content: '',
      examples: [''],
      related_topics: []
    });
    
    // 表单校验规则
    const rules = {
      topic: [
        { required: true, message: '请输入知识主题', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
      ],
      category: [
        { required: true, message: '请选择分类', trigger: 'change' }
      ],
      content: [
        { required: true, message: '请输入知识内容', trigger: 'blur' },
        { min: 50, message: '内容至少需要50个字符', trigger: 'blur' }
      ]
    };
    
    // 关键词输入
    const inputVisible = ref(false);
    const inputValue = ref('');
    const keywordInput = ref(null);
    
    // 相关主题输入
    const topicInputVisible = ref(false);
    const topicInputValue = ref('');
    const topicInput = ref(null);
    
    // Markdown预览
    const activeTab = ref('edit');
    const renderedContent = computed(() => {
      try {
        return marked(ruleForm.value.content || '');
      } catch (e) {
        console.error('Markdown渲染失败:', e);
        return ruleForm.value.content || '';
      }
    });
    
    // 表单引用
    const ruleFormRef = ref(null);
    
    // 显示关键词输入框
    const showInput = () => {
      inputVisible.value = true;
      nextTick(() => {
        keywordInput.value.focus();
      });
    };
    
    // 添加关键词
    const addKeyword = () => {
      if (inputValue.value) {
        if (!ruleForm.value.keywords.includes(inputValue.value)) {
          ruleForm.value.keywords.push(inputValue.value);
        }
      }
      inputVisible.value = false;
      inputValue.value = '';
    };
    
    // 移除关键词
    const removeKeyword = (keyword) => {
      const index = ruleForm.value.keywords.indexOf(keyword);
      if (index !== -1) {
        ruleForm.value.keywords.splice(index, 1);
      }
    };
    
    // 显示相关主题输入框
    const showTopicInput = () => {
      topicInputVisible.value = true;
      nextTick(() => {
        topicInput.value.focus();
      });
    };
    
    // 添加相关主题
    const addRelatedTopic = () => {
      if (topicInputValue.value) {
        if (!ruleForm.value.related_topics.includes(topicInputValue.value)) {
          ruleForm.value.related_topics.push(topicInputValue.value);
        }
      }
      topicInputVisible.value = false;
      topicInputValue.value = '';
    };
    
    // 移除相关主题
    const removeRelatedTopic = (topic) => {
      const index = ruleForm.value.related_topics.indexOf(topic);
      if (index !== -1) {
        ruleForm.value.related_topics.splice(index, 1);
      }
    };
    
    // 添加示例问题
    const addExample = () => {
      ruleForm.value.examples.push('');
    };
    
    // 移除示例问题
    const removeExample = (index) => {
      ruleForm.value.examples.splice(index, 1);
      // 确保至少有一个示例问题
      if (ruleForm.value.examples.length === 0) {
        ruleForm.value.examples.push('');
      }
    };
    
    // 提交表单
    const submitForm = () => {
      ruleFormRef.value?.validate((valid) => {
        if (valid) {
          // 过滤空的示例问题
          ruleForm.value.examples = ruleForm.value.examples.filter(example => example.trim() !== '');
          
          // 确保至少有一个关键词
          if (ruleForm.value.keywords.length === 0) {
            alert('请至少添加一个关键词');
            return;
          }
          
          // 添加ID和时间戳
          const rule = {
            ...ruleForm.value,
            id: `qa-${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          emit('save', rule);
        } else {
          return false;
        }
      });
    };
    
    // 取消
    const cancel = () => {
      emit('cancel');
    };
    
    return {
      ruleForm,
      rules,
      ruleFormRef,
      inputVisible,
      inputValue,
      keywordInput,
      topicInputVisible,
      topicInputValue,
      topicInput,
      activeTab,
      renderedContent,
      showInput,
      addKeyword,
      removeKeyword,
      showTopicInput,
      addRelatedTopic,
      removeRelatedTopic,
      addExample,
      removeExample,
      submitForm,
      cancel
    };
  }
};
</script>

<style scoped>
.add-qa-rule {
  padding: 20px 0;
}

h3 {
  margin: 20px 0 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.keyword-tag,
.topic-tag {
  margin-right: 10px;
  margin-bottom: 10px;
}

.keyword-input,
.topic-input {
  width: 120px;
  vertical-align: bottom;
}

.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}

.example-item {
  margin-bottom: 10px;
}

.markdown-preview {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 15px;
  min-height: 300px;
  background-color: #fafafa;
  overflow-y: auto;
}

/* Markdown预览样式 */
:deep(.markdown-preview h1) {
  font-size: 24px;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
  margin-top: 24px;
  margin-bottom: 16px;
}

:deep(.markdown-preview h2) {
  font-size: 20px;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
  margin-top: 24px;
  margin-bottom: 16px;
}

:deep(.markdown-preview h3) {
  font-size: 18px;
  margin-top: 24px;
  margin-bottom: 16px;
}

:deep(.markdown-preview p) {
  margin-top: 0;
  margin-bottom: 16px;
}

:deep(.markdown-preview ul),
:deep(.markdown-preview ol) {
  padding-left: 2em;
  margin-top: 0;
  margin-bottom: 16px;
}

:deep(.markdown-preview li) {
  margin-top: 0.25em;
}

:deep(.markdown-preview code) {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(27,31,35,0.05);
  border-radius: 3px;
}

:deep(.markdown-preview pre) {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 3px;
}

:deep(.markdown-preview pre code) {
  display: inline;
  max-width: auto;
  padding: 0;
  margin: 0;
  overflow: visible;
  line-height: inherit;
  word-wrap: normal;
  background-color: transparent;
  border: 0;
}
</style> 