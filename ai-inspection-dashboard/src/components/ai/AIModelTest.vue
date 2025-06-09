<template>
  <div class="ai-model-test">
    <h3 class="test-title">AI模型测试面板</h3>
    
    <div class="test-section">
      <h4>当前活跃模型</h4>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="模型名称">{{ activeModel.name }}</el-descriptions-item>
        <el-descriptions-item label="模型ID">{{ activeModel.id }}</el-descriptions-item>
        <el-descriptions-item label="版本">{{ activeModel.version }}</el-descriptions-item>
        <el-descriptions-item label="API密钥">
          <el-tag type="info">{{ formatKeyId(apiKey) }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>
    
    <div class="test-section">
      <h4>测试查询</h4>
      <el-form>
        <el-form-item>
          <el-input 
            v-model="testQuery" 
            type="textarea" 
            :rows="3" 
            placeholder="输入测试查询内容..." 
            :disabled="loading"
          />
        </el-form-item>
        <el-form-item>
          <el-button 
            type="primary" 
            @click="executeTest" 
            :loading="loading" 
            :disabled="!testQuery.trim()"
          >
            执行测试
          </el-button>
          <el-button @click="clearResults" :disabled="loading || !hasResults">清除结果</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <div v-if="hasResults" class="test-section">
      <h4>测试结果</h4>
      <div class="result-info">
        <el-tag :type="testSuccess ? 'success' : 'danger'" effect="dark">
          {{ testSuccess ? '成功' : '失败' }}
        </el-tag>
        <span class="result-time">响应时间: {{ responseTime }}ms</span>
      </div>
      
      <el-card class="result-card">
        <template #header>
          <div class="result-header">
            <span>模型响应</span>
            <el-tag size="small" type="info">{{ testResult.modelInfo?.id || '未知模型' }}</el-tag>
          </div>
        </template>
        <div class="result-content">{{ testResult.response }}</div>
      </el-card>
      
      <el-collapse v-if="testSuccess">
        <el-collapse-item title="详细信息">
          <pre class="result-details">{{ JSON.stringify(testResult, null, 2) }}</pre>
        </el-collapse-item>
      </el-collapse>
    </div>
    
    <div v-if="testError" class="test-section error-section">
      <h4>错误信息</h4>
      <el-alert
        :title="testError"
        type="error"
        :closable="false"
        show-icon
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { AIModelConfigService } from '../../services/ai/AIModelConfigService';
import { AIQueryService } from '../../services/AIQueryService';
import { AIInitializer } from '../../services/ai/AIInitializer';

export default {
  name: 'AIModelTest',
  
  setup() {
    // 活跃模型信息
    const activeModel = reactive(AIModelConfigService.getActiveModel());
    const apiKey = ref(AIModelConfigService.getApiKey());
    
    // 测试状态
    const testQuery = ref('');
    const loading = ref(false);
    const testResult = ref(null);
    const testSuccess = ref(false);
    const testError = ref('');
    const responseTime = ref(0);
    
    // 计算属性
    const hasResults = computed(() => !!testResult.value);
    
    // 格式化API密钥ID显示
    const formatKeyId = (key) => {
      if (!key) return '未设置';
      return key.substring(0, 8) + '...' + key.substring(key.length - 4);
    };
    
    // 执行测试
    const executeTest = async () => {
      if (!testQuery.value.trim()) return;
      
      loading.value = true;
      testResult.value = null;
      testSuccess.value = false;
      testError.value = '';
      
      try {
        const startTime = Date.now();
        
        // 执行查询
        const result = await AIQueryService.executeQuery(testQuery.value);
        
        // 计算响应时间
        responseTime.value = Date.now() - startTime;
        
        // 设置结果
        testResult.value = result;
        testSuccess.value = result.success;
        
        if (!result.success) {
          testError.value = result.error || '未知错误';
        }
        
        // 根据结果显示提示
        if (result.success) {
          ElMessage.success('测试查询执行成功');
        } else {
          ElMessage.error(`测试查询失败: ${result.error}`);
        }
      } catch (error) {
        console.error('测试执行失败:', error);
        testError.value = error.message || '执行测试时发生错误';
        ElMessage.error(`测试执行失败: ${error.message}`);
      } finally {
        loading.value = false;
      }
    };
    
    // 清除结果
    const clearResults = () => {
      testResult.value = null;
      testSuccess.value = false;
      testError.value = '';
      responseTime.value = 0;
    };
    
    return {
      activeModel,
      apiKey,
      testQuery,
      loading,
      testResult,
      testSuccess,
      testError,
      responseTime,
      hasResults,
      formatKeyId,
      executeTest,
      clearResults
    };
  }
};
</script>

<style scoped>
.ai-model-test {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.test-title {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 20px;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 15px;
}

.test-section {
  margin-bottom: 30px;
}

.test-section h4 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  color: #606266;
}

.result-info {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.result-time {
  margin-left: 15px;
  font-size: 14px;
  color: #909399;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-card {
  margin-bottom: 15px;
}

.result-content {
  white-space: pre-wrap;
  font-size: 14px;
  line-height: 1.6;
  color: #303133;
}

.result-details {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  overflow-x: auto;
  color: #606266;
}

.error-section {
  margin-top: 20px;
}
</style> 