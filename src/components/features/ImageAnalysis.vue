<template>
  <div class="image-analysis">
    <div class="upload-container">
      <el-upload
        class="image-uploader"
        action="#"
        :auto-upload="false"
        :show-file-list="false"
        :on-change="handleImageChange"
        accept="image/*"
      >
        <div class="upload-area" v-if="!imageUrl">
          <el-icon class="upload-icon"><el-icon-upload /></el-icon>
          <div class="upload-text">点击或拖拽图片到此处</div>
          <div class="upload-hint">支持PNG、JPG格式，最大5MB</div>
        </div>
        <div class="preview-area" v-else>
          <el-image :src="imageUrl" fit="contain" class="preview-image" />
          <div class="preview-actions">
            <el-button size="small" type="danger" @click.stop="removeImage">
              删除图片
            </el-button>
            <el-button size="small" type="primary" @click.stop="analyzeImage" :loading="analyzing">
              分析图片
            </el-button>
          </div>
        </div>
      </el-upload>
    </div>
    
    <!-- 分析结果 -->
    <div class="analysis-results" v-if="analysisResult">
      <el-divider content-position="center">分析结果</el-divider>
      
      <div class="result-header">
        <h3>{{ analysisResult.title }}</h3>
        <div class="confidence-badge" :class="getConfidenceClass(analysisResult.confidence)">
          置信度: {{ (analysisResult.confidence * 100).toFixed(1) }}%
        </div>
      </div>
      
      <div class="result-content">
        <div class="result-description">
          {{ analysisResult.description }}
        </div>
        
        <!-- 检测到的缺陷列表 -->
        <div class="defects-list" v-if="analysisResult.defects && analysisResult.defects.length > 0">
          <h4>检测到的缺陷:</h4>
          <el-table :data="analysisResult.defects" style="width: 100%">
            <el-table-column prop="type" label="缺陷类型" width="120" />
            <el-table-column prop="severity" label="严重程度" width="100">
              <template #default="scope">
                <el-tag :type="getSeverityType(scope.row.severity)">
                  {{ scope.row.severity }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" />
            <el-table-column prop="confidence" label="置信度" width="100">
              <template #default="scope">
                {{ (scope.row.confidence * 100).toFixed(1) }}%
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <!-- 建议措施 -->
        <div class="recommendations" v-if="analysisResult.recommendations && analysisResult.recommendations.length > 0">
          <h4>建议措施:</h4>
          <el-steps direction="vertical" :active="analysisResult.recommendations.length">
            <el-step 
              v-for="(rec, index) in analysisResult.recommendations" 
              :key="index"
              :title="rec.title"
              :description="rec.description"
            />
          </el-steps>
        </div>
      </div>
      
      <div class="result-actions">
        <el-button @click="$emit('insert-analysis', analysisResult)" type="primary">
          插入对话
        </el-button>
        <el-button @click="resetAnalysis" plain>
          重新分析
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { apiRequest } from '../../utils/api';

const props = defineProps({
  scenario: {
    type: String,
    default: 'factory' // 默认为工厂场景
  },
  apiKey: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['insert-analysis', 'analysis-complete']);

const imageUrl = ref('');
const imageFile = ref(null);
const analyzing = ref(false);
const analysisResult = ref(null);

// 处理图片选择
const handleImageChange = (file) => {
  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件');
    return;
  }
  
  // 检查文件大小，限制为5MB
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过5MB');
    return;
  }
  
  imageFile.value = file;
  imageUrl.value = URL.createObjectURL(file);
};

// 移除图片
const removeImage = () => {
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value);
  }
  
  imageFile.value = null;
  imageUrl.value = '';
  analysisResult.value = null;
};

// 分析图片
const analyzeImage = async () => {
  if (!imageFile.value) {
    ElMessage.warning('请先选择图片');
    return;
  }
  
  analyzing.value = true;
  
  try {
    // 模拟API调用，实际项目中应替换为真实的API调用
    // const formData = new FormData();
    // formData.append('image', imageFile.value);
    // formData.append('scenario', props.scenario);
    
    // const result = await apiRequest('/api/analyze-image', {
    //   method: 'POST',
    //   body: formData
    // }, props.apiKey);
    
    // 模拟API响应
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 根据场景生成不同的分析结果
    let result;
    switch (props.scenario) {
      case 'factory':
        result = generateFactoryAnalysisResult();
        break;
      case 'lab':
        result = generateLabAnalysisResult();
        break;
      case 'online':
        result = generateOnlineAnalysisResult();
        break;
      default:
        result = generateFactoryAnalysisResult();
    }
    
    analysisResult.value = result;
    
    // 通知父组件
    emit('analysis-complete', result);
    
    ElMessage.success('图片分析完成');
  } catch (error) {
    console.error('图片分析失败:', error);
    ElMessage.error('图片分析失败，请重试');
  } finally {
    analyzing.value = false;
  }
};

// 重置分析
const resetAnalysis = () => {
  analysisResult.value = null;
};

// 获取置信度对应的样式类
const getConfidenceClass = (confidence) => {
  if (confidence >= 0.8) return 'high-confidence';
  if (confidence >= 0.5) return 'medium-confidence';
  return 'low-confidence';
};

// 获取严重程度对应的标签类型
const getSeverityType = (severity) => {
  switch (severity) {
    case '严重':
      return 'danger';
    case '中等':
      return 'warning';
    case '轻微':
      return 'info';
    default:
      return '';
  }
};

// 生成工厂场景的分析结果
const generateFactoryAnalysisResult = () => {
  return {
    title: '物料表面缺陷分析',
    confidence: 0.92,
    description: '检测到多处表面缺陷，主要为划痕和凹陷，可能影响产品质量和性能。',
    defects: [
      {
        type: '划痕',
        severity: '中等',
        description: '在物料表面右上角发现长约2cm的线性划痕',
        confidence: 0.95
      },
      {
        type: '凹陷',
        severity: '轻微',
        description: '在物料中央区域发现直径约0.5cm的圆形凹陷',
        confidence: 0.89
      },
      {
        type: '变色',
        severity: '轻微',
        description: '在物料边缘处发现轻微氧化变色',
        confidence: 0.78
      }
    ],
    recommendations: [
      {
        title: '调整生产线速度',
        description: '建议将生产线速度降低10%，减少物料运输过程中的磕碰'
      },
      {
        title: '检查传送带',
        description: '检查并更换磨损的传送带部件，特别是转弯处的导向装置'
      },
      {
        title: '增加包装保护',
        description: '在物料包装中增加缓冲材料，防止运输过程中的碰撞损伤'
      }
    ],
    timestamp: new Date().toISOString()
  };
};

// 生成实验室场景的分析结果
const generateLabAnalysisResult = () => {
  return {
    title: '实验样本分析',
    confidence: 0.87,
    description: '样本显示异常结晶形态，可能影响材料性能测试结果。',
    defects: [
      {
        type: '结晶异常',
        severity: '严重',
        description: '样本中心区域结晶形态不规则，与标准样本差异显著',
        confidence: 0.91
      },
      {
        type: '杂质',
        severity: '中等',
        description: '检测到微量金属杂质，可能来自制备过程',
        confidence: 0.85
      }
    ],
    recommendations: [
      {
        title: '重新制备样本',
        description: '建议使用更高纯度的原材料重新制备测试样本'
      },
      {
        title: '调整制备参数',
        description: '将结晶温度提高5°C，延长结晶时间至少30分钟'
      },
      {
        title: '检查设备清洁度',
        description: '检查并清洁样本制备设备，确保无残留物污染'
      }
    ],
    timestamp: new Date().toISOString()
  };
};

// 生成在线监测场景的分析结果
const generateOnlineAnalysisResult = () => {
  return {
    title: '生产线异常分析',
    confidence: 0.94,
    description: '检测到生产线设备异常磨损，可能导致产品质量波动。',
    defects: [
      {
        type: '设备磨损',
        severity: '严重',
        description: '主轴承磨损超过安全阈值，需要立即更换',
        confidence: 0.97
      },
      {
        type: '校准偏差',
        severity: '中等',
        description: '检测到压力控制系统校准偏差约5%',
        confidence: 0.88
      },
      {
        type: '温度波动',
        severity: '轻微',
        description: '工作区温度波动范围±3°C，略高于标准要求',
        confidence: 0.92
      }
    ],
    recommendations: [
      {
        title: '更换轴承',
        description: '立即安排停机维护，更换主轴承，预计需要4小时'
      },
      {
        title: '重新校准系统',
        description: '对压力控制系统进行全面校准，确保偏差控制在±1%以内'
      },
      {
        title: '检查温控系统',
        description: '检查并维护温度控制系统，确保温度波动控制在±1.5°C范围内'
      },
      {
        title: '制定维护计划',
        description: '根据设备使用情况，制定更频繁的预防性维护计划'
      }
    ],
    timestamp: new Date().toISOString()
  };
};
</script>

<style scoped>
.image-analysis {
  margin-bottom: 20px;
}

.upload-container {
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}

.upload-container:hover {
  border-color: #409eff;
}

.upload-area {
  padding: 40px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.upload-icon {
  font-size: 48px;
  color: #c0c4cc;
}

.upload-text {
  margin-top: 16px;
  font-size: 16px;
  color: #606266;
}

.upload-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.preview-area {
  position: relative;
  width: 100%;
}

.preview-image {
  width: 100%;
  height: 300px;
  object-fit: contain;
}

.preview-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 8px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.analysis-results {
  margin-top: 20px;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background-color: #fff;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.result-header h3 {
  margin: 0;
}

.confidence-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
}

.high-confidence {
  background-color: #f0f9eb;
  color: #67c23a;
}

.medium-confidence {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.low-confidence {
  background-color: #fef0f0;
  color: #f56c6c;
}

.result-content {
  margin-bottom: 16px;
}

.result-description {
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 1.6;
}

.defects-list {
  margin-bottom: 20px;
}

.defects-list h4,
.recommendations h4 {
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 500;
}

.result-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}
</style> 