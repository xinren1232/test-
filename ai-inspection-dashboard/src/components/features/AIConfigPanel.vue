<template>
  <div class="ai-config-panel">
    <h3 class="panel-title">AI模型配置</h3>
    
    <el-alert
      v-if="configSaved"
      title="配置已保存"
      type="success"
      :closable="true"
      show-icon
      @close="configSaved = false"
    />
    
    <div class="config-section">
      <h4>API密钥</h4>
      <el-input 
        v-model="config.apiKey" 
        placeholder="API密钥" 
        :disabled="true"
        show-password
      >
        <template #append>
          <el-tooltip content="API密钥已加密存储" placement="top">
            <el-icon><Lock /></el-icon>
          </el-tooltip>
        </template>
      </el-input>
      <div class="key-info">密钥ID: {{ formatKeyId(config.apiKey) }}</div>
    </div>
    
    <div class="config-section">
      <h4>模型配置</h4>
      <div class="models-container">
        <!-- 主要模型 -->
        <el-card class="model-card" :class="{ active: primaryModel.isActive }">
          <template #header>
            <div class="model-header">
              <div class="model-title">
                <span class="model-name">{{ primaryModel.name }}</span>
                <el-tag size="small" type="primary">主要模型</el-tag>
              </div>
              <el-switch 
                v-model="primaryModel.isActive" 
                active-text="启用" 
                inactive-text="禁用"
                @change="handlePrimaryModelChange"
              />
            </div>
          </template>
          <div class="model-content">
            <div class="model-info">
              <p><strong>模型ID:</strong> {{ primaryModel.id }}</p>
              <p><strong>版本:</strong> {{ primaryModel.version }}</p>
              <p><strong>描述:</strong> {{ primaryModel.description }}</p>
            </div>
            <div class="model-capabilities">
              <h5>功能:</h5>
              <div class="capabilities-list">
                <el-tag 
                  v-for="(cap, index) in primaryModel.capabilities" 
                  :key="index"
                  size="small"
                  effect="plain"
                  class="capability-tag"
                >
                  {{ formatCapability(cap) }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-card>
        
        <!-- 备用模型 -->
        <el-card class="model-card" :class="{ active: backupModel.isActive }">
          <template #header>
            <div class="model-header">
              <div class="model-title">
                <span class="model-name">{{ backupModel.name }}</span>
                <el-tag size="small" type="warning">备用模型</el-tag>
              </div>
              <el-switch 
                v-model="backupModel.isActive" 
                active-text="启用" 
                inactive-text="禁用"
                @change="handleBackupModelChange"
              />
            </div>
          </template>
          <div class="model-content">
            <div class="model-info">
              <p><strong>模型ID:</strong> {{ backupModel.id }}</p>
              <p><strong>版本:</strong> {{ backupModel.version }}</p>
              <p><strong>描述:</strong> {{ backupModel.description }}</p>
            </div>
            <div class="model-capabilities">
              <h5>功能:</h5>
              <div class="capabilities-list">
                <el-tag 
                  v-for="(cap, index) in backupModel.capabilities" 
                  :key="index"
                  size="small"
                  effect="plain"
                  class="capability-tag"
                >
                  {{ formatCapability(cap) }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
    
    <div class="config-section">
      <h3>模型优先级设置</h3>
      <el-radio-group v-model="selectedModel">
        <el-radio-button value="wp-2025060401315D-tfmvg">优先使用R1模型</el-radio-button>
        <el-radio-button value="wp-2025032811450D-fb7p">优先使用V3模型</el-radio-button>
      </el-radio-group>
    </div>
    
    <div class="config-section">
      <h4>高级设置</h4>
      <el-form :model="advancedConfig" label-position="top">
        <el-form-item label="缓存设置">
          <el-switch v-model="advancedConfig.useCache" />
          <span class="setting-label">启用缓存</span>
        </el-form-item>
        
        <el-form-item label="缓存过期时间 (分钟)" v-if="advancedConfig.useCache">
          <el-slider 
            v-model="advancedConfig.cacheTTL" 
            :min="5" 
            :max="60" 
            :step="5"
            :format-tooltip="value => `${value}分钟`"
          />
        </el-form-item>
        
        <el-form-item label="日志级别">
          <el-select v-model="advancedConfig.logLevel" style="width: 100%;">
            <el-option label="详细" value="verbose" />
            <el-option label="信息" value="info" />
            <el-option label="警告" value="warn" />
            <el-option label="错误" value="error" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    
    <div class="actions">
      <el-button type="primary" @click="saveConfig">保存配置</el-button>
      <el-button @click="resetConfig">重置</el-button>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Lock } from '@element-plus/icons-vue';
import { AIModelConfigService } from '../../services/ai/AIModelConfigService';
import { AIInitializer } from '../../services/ai/AIInitializer';

export default {
  name: 'AIConfigPanel',
  
  components: {
    Lock
  },
  
  setup() {
    // 配置状态
    const config = reactive({
      apiKey: AIModelConfigService.getApiKey()
    });
    
    // 模型状态
    const primaryModel = reactive({...AIModelConfigService.getPrimaryModel()});
    const backupModel = reactive({...AIModelConfigService.getBackupModel()});
    
    // 优先级设置
    const selectedModel = ref(AIModelConfigService.getModelPriority()[0]);
    
    // 高级配置
    const advancedConfig = reactive({
      useCache: AIInitializer.config.useCache,
      cacheTTL: AIInitializer.config.cacheTTL / (60 * 1000), // 转换为分钟
      logLevel: AIInitializer.config.enableLogging ? 'info' : 'error'
    });
    
    // 保存成功标志
    const configSaved = ref(false);
    
    // 处理主模型状态变更
    const handlePrimaryModelChange = (value) => {
      AIModelConfigService.setModelActive('r1', value);
      
      // 确保至少有一个模型是活跃的
      if (!value && !backupModel.isActive) {
        backupModel.isActive = true;
        AIModelConfigService.setModelActive('v3', true);
        ElMessage.warning('至少需要一个活跃的AI模型，已自动启用备用模型');
      }
    };
    
    // 处理备用模型状态变更
    const handleBackupModelChange = (value) => {
      AIModelConfigService.setModelActive('v3', value);
      
      // 确保至少有一个模型是活跃的
      if (!value && !primaryModel.isActive) {
        primaryModel.isActive = true;
        AIModelConfigService.setModelActive('r1', true);
        ElMessage.warning('至少需要一个活跃的AI模型，已自动启用主要模型');
      }
    };
    
    // 格式化API密钥ID显示
    const formatKeyId = (key) => {
      if (!key) return '未设置';
      // 显示前8位和后4位，中间用星号代替
      return key.substring(0, 8) + '...' + key.substring(key.length - 4);
    };
    
    // 格式化能力显示
    const formatCapability = (capability) => {
      const capabilityMap = {
        'text-generation': '文本生成',
        'question-answering': '问答能力',
        'context-understanding': '上下文理解',
        'image-recognition': '图像识别',
        'code-generation': '代码生成'
      };
      
      return capabilityMap[capability] || capability;
    };
    
    // 保存配置
    const saveConfig = () => {
      // 更新高级配置到AIInitializer
      AIInitializer.config.useCache = advancedConfig.useCache;
      AIInitializer.config.cacheTTL = advancedConfig.cacheTTL * 60 * 1000; // 转换回毫秒
      AIInitializer.config.enableLogging = advancedConfig.logLevel !== 'error';
      
      // 显示保存成功提示
      configSaved.value = true;
      ElMessage.success('AI模型配置已保存');
    };
    
    // 重置配置
    const resetConfig = () => {
      // 重置模型状态
      primaryModel.isActive = true;
      backupModel.isActive = true;
      AIModelConfigService.setModelActive('r1', true);
      AIModelConfigService.setModelActive('v3', true);
      
      // 重置优先级
      selectedModel.value = 'wp-2025060401315D-tfmvg';
      AIModelConfigService.updateModelPriority(['wp-2025060401315D-tfmvg', 'wp-2025032811450D-fb7p']);
      
      // 重置高级配置
      advancedConfig.useCache = true;
      advancedConfig.cacheTTL = 30;
      advancedConfig.logLevel = 'info';
      
      ElMessage.info('配置已重置');
    };
    
    return {
      config,
      primaryModel,
      backupModel,
      selectedModel,
      advancedConfig,
      configSaved,
      handlePrimaryModelChange,
      handleBackupModelChange,
      formatKeyId,
      formatCapability,
      saveConfig,
      resetConfig
    };
  }
};
</script>

<style scoped>
.ai-config-panel {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.panel-title {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 20px;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 15px;
}

.config-section {
  margin-bottom: 30px;
}

.config-section h4 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  color: #606266;
}

.key-info {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.models-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.model-card {
  transition: all 0.3s ease;
}

.model-card.active {
  border-color: #409eff;
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.2);
}

.model-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.model-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.model-name {
  font-weight: bold;
  font-size: 16px;
}

.model-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.model-info p {
  margin: 5px 0;
  font-size: 14px;
}

.model-capabilities h5 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 14px;
}

.capabilities-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.capability-tag {
  margin-right: 0;
}

.setting-label {
  margin-left: 10px;
  font-size: 14px;
  color: #606266;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style> 