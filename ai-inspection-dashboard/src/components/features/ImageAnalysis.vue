<template>
  <div class="image-analysis">
    <div class="upload-area" v-if="!imageUrl" @click="triggerUpload" @drop="onDrop" @dragover.prevent @dragenter.prevent>
      <input 
        ref="fileInput" 
        type="file" 
        accept="image/*" 
        @change="handleFileChange" 
        style="display: none"
      />
      <el-icon class="upload-icon"><el-icon-upload /></el-icon>
      <div class="upload-text">
        <span>点击或拖拽上传图片</span>
        <p>支持JPG、PNG格式</p>
      </div>
    </div>

    <div v-if="imageUrl" class="image-preview-container">
      <div class="image-toolbar">
        <el-button-group>
          <el-button type="primary" size="small" @click="analyzeImage" :loading="analyzing">
            <el-icon><el-icon-search /></el-icon> 分析缺陷
          </el-button>
          <el-button size="small" @click="enhanceImage" :disabled="analyzing">
            <el-icon><el-icon-magic-stick /></el-icon> 图像增强
          </el-button>
          <el-button size="small" @click="resetImage" :disabled="analyzing">
            <el-icon><el-icon-refresh-right /></el-icon> 重置
          </el-button>
        </el-button-group>

        <div class="image-controls">
          <span class="control-label">亮度:</span>
          <el-slider v-model="brightness" :min="0" :max="200" :step="5" @input="applyFilters" :disabled="analyzing" />
        
          <span class="control-label">对比度:</span>
          <el-slider v-model="contrast" :min="0" :max="200" :step="5" @input="applyFilters" :disabled="analyzing" />
        
          <span class="control-label">缩放:</span>
          <el-slider v-model="scale" :min="10" :max="200" :step="10" @input="applyTransform" :disabled="analyzing" />
        </div>
        
        <el-button type="danger" size="small" @click="removeImage" :disabled="analyzing">
          <el-icon><el-icon-delete /></el-icon> 删除
        </el-button>
      </div>

      <div class="image-container">
        <img 
          ref="imageRef" 
          :src="imageUrl" 
          :style="{
            filter: `brightness(${brightness}%) contrast(${contrast}%)`,
            transform: `scale(${scale / 100})`,
          }"
          @load="onImageLoad"
          class="preview-image"
        />
        <canvas
          v-if="hasAnalysisResults"
          ref="overlayCanvas"
          class="analysis-overlay"
        ></canvas>
        <div v-if="analyzing" class="analyzing-indicator">
          <el-progress type="circle" :percentage="analysisProgress" :status="analysisProgress === 100 ? 'success' : ''"></el-progress>
          <p>正在分析图像...{{ analysisProgress }}%</p>
        </div>
      </div>

      <div v-if="hasAnalysisResults" class="analysis-results">
        <h3>分析结果</h3>
        <div class="defects-list">
          <div v-for="(defect, index) in analysisResults.defects" :key="index" class="defect-item">
            <el-tag :type="getDefectSeverityType(defect.severity)" effect="dark">
              {{ defect.type }}
            </el-tag>
            <span class="defect-location">位置: {{ defect.location.join(', ') }}</span>
            <span class="defect-probability">
              可信度: {{ (defect.probability * 100).toFixed(0) }}%
            </span>
          </div>
        </div>
        
        <div class="analysis-summary">
          <div class="summary-item">
            <span class="summary-label">检测缺陷数:</span>
            <span class="summary-value">{{ analysisResults.defects.length }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">整体评估:</span>
            <el-tag :type="analysisResults.overallQuality === 'pass' ? 'success' : 'danger'">
              {{ analysisResults.overallQuality === 'pass' ? '合格' : '不合格' }}
            </el-tag>
          </div>
        </div>

        <div class="analysis-actions">
          <el-button type="primary" @click="reportAnalysis">
            生成分析报告
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';

const emit = defineEmits(['analysis-complete', 'report-generated']);

// 图片相关变量
const fileInput = ref(null);
const imageRef = ref(null);
const overlayCanvas = ref(null);
const imageUrl = ref('');
const originalImageUrl = ref('');

// 图像处理参数
const brightness = ref(100);
const contrast = ref(100);
const scale = ref(100);

// 分析状态
const analyzing = ref(false);
const analysisProgress = ref(0);
const analysisResults = reactive({
  defects: [],
  overallQuality: '',
  confidenceScore: 0
});

const hasAnalysisResults = computed(() => analysisResults.defects.length > 0);

// 触发文件上传
function triggerUpload() {
  fileInput.value.click();
}

// 处理文件选择
function handleFileChange(event) {
  const files = event.target.files;
  if (files && files.length > 0) {
    const selectedFile = files[0];
    processImage(selectedFile);
  }
}

// 处理拖放
function onDrop(event) {
  event.preventDefault();
  const files = event.dataTransfer.files;
  if (files && files.length > 0) {
    const file = files[0];
    if (file.type.startsWith('image/')) {
      processImage(file);
    } else {
      ElMessage.error('请上传图片文件');
    }
  }
}

// 处理图片
function processImage(file) {
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请上传图片文件');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    imageUrl.value = e.target.result;
    originalImageUrl.value = e.target.result;
    
    // 重置参数
    brightness.value = 100;
    contrast.value = 100;
    scale.value = 100;
    
    // 清除之前的分析结果
    analysisResults.defects = [];
    analysisResults.overallQuality = '';
    analysisResults.confidenceScore = 0;
  };
  reader.readAsDataURL(file);
}

// 图像加载完成后的处理
function onImageLoad() {
  // 如果需要在图像加载后执行特定的操作，可以在这里实现
  console.log('图像已加载');
}

// 应用滤镜效果
function applyFilters() {
  if (imageRef.value) {
    imageRef.value.style.filter = `brightness(${brightness.value}%) contrast(${contrast.value}%)`;
  }
}

// 应用变换
function applyTransform() {
  if (imageRef.value) {
    imageRef.value.style.transform = `scale(${scale.value / 100})`;
  }
}

// 移除图片
function removeImage() {
  imageUrl.value = '';
  originalImageUrl.value = '';
  analysisResults.defects = [];
  analysisResults.overallQuality = '';
  analysisResults.confidenceScore = 0;
  fileInput.value.value = '';
}

// 重置图片
function resetImage() {
  imageUrl.value = originalImageUrl.value;
  brightness.value = 100;
  contrast.value = 100;
  scale.value = 100;
}

// 图像增强处理（模拟）
function enhanceImage() {
  analyzing.value = true;
  analysisProgress.value = 0;
  
  const interval = setInterval(() => {
    analysisProgress.value += 10;
    if (analysisProgress.value >= 100) {
      clearInterval(interval);
      
      // 模拟增强效果：适当提高对比度和亮度
      brightness.value = 110;
      contrast.value = 120;
      applyFilters();
      
      analyzing.value = false;
      ElMessage.success('图像增强完成');
    }
  }, 100);
}

// 分析图片（这里是模拟分析，实际应用中应该调用后端API）
function analyzeImage() {
  if (!imageUrl.value) {
    ElMessage.warning('请先上传图片');
    return;
  }
  
  analyzing.value = true;
  analysisProgress.value = 0;
  
  // 模拟分析进度
  const progressInterval = setInterval(() => {
    analysisProgress.value += Math.floor(Math.random() * 10) + 1;
    if (analysisProgress.value >= 100) {
      analysisProgress.value = 100;
      clearInterval(progressInterval);
      
      // 模拟分析结果
      setTimeout(() => {
        generateMockAnalysisResults();
        drawDefectsOnCanvas();
        analyzing.value = false;
        emit('analysis-complete', analysisResults);
      }, 500);
    }
  }, 200);
}

// 生成模拟分析结果
function generateMockAnalysisResults() {
  // 清空之前的结果
  analysisResults.defects = [];
  
  // 随机生成缺陷数量
  const defectCount = Math.floor(Math.random() * 3) + 1; // 1-3个缺陷
  
  // 可能的缺陷类型
  const defectTypes = [
    '划痕', '凹陷', '裂纹', '变色', '气泡', '污点', '错位'
  ];
  
  // 可能的缺陷严重程度
  const severities = ['low', 'medium', 'high'];
  
  // 生成随机缺陷
  for (let i = 0; i < defectCount; i++) {
    // 获取图片宽高以计算随机位置
    const imageWidth = imageRef.value.naturalWidth;
    const imageHeight = imageRef.value.naturalHeight;
    
    const defect = {
      type: defectTypes[Math.floor(Math.random() * defectTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      location: [
        Math.floor(Math.random() * imageWidth),
        Math.floor(Math.random() * imageHeight)
      ],
      size: Math.floor(Math.random() * 30) + 10, // 10-40px
      probability: Math.random() * 0.3 + 0.7 // 0.7-1.0
    };
    
    analysisResults.defects.push(defect);
  }
  
  // 设置整体质量评估
  const hasSeriousDefects = analysisResults.defects.some(d => d.severity === 'high');
  analysisResults.overallQuality = hasSeriousDefects ? 'fail' : 'pass';
  
  // 设置置信度评分
  analysisResults.confidenceScore = Math.random() * 0.2 + 0.8; // 0.8-1.0
}

// 在画布上绘制缺陷标记
function drawDefectsOnCanvas() {
  if (!overlayCanvas.value || analysisResults.defects.length === 0) return;
  
  // 确保画布大小与图像一致
  nextTick(() => {
    const img = imageRef.value;
    const canvas = overlayCanvas.value;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 为每个缺陷绘制标记
    analysisResults.defects.forEach(defect => {
      const [x, y] = defect.location;
      const size = defect.size;
      
      // 根据严重程度设置颜色
      let color;
      switch (defect.severity) {
        case 'high': color = 'rgba(255, 0, 0, 0.7)'; break;
        case 'medium': color = 'rgba(255, 165, 0, 0.7)'; break;
        default: color = 'rgba(255, 255, 0, 0.7)';
      }
      
      // 绘制标记圆圈
      ctx.beginPath();
      ctx.arc(x, y, size/2, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.stroke();
      
      // 绘制标记文字
      ctx.font = '14px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(defect.type, x, y);
    });
  });
}

// 获取缺陷严重程度对应的类型
function getDefectSeverityType(severity) {
  switch (severity) {
    case 'high': return 'danger';
    case 'medium': return 'warning';
    default: return 'info';
  }
}

// 生成分析报告
function reportAnalysis() {
  if (!hasAnalysisResults.value) {
    ElMessage.warning('请先分析图像');
    return;
  }
  
  // 这里可以实现报告生成逻辑，例如将结果发送给API或导出为PDF
  ElMessage.success('分析报告已生成');
  
  // 发送报告生成事件
  emit('report-generated', {
    timestamp: new Date().toISOString(),
    imageData: imageUrl.value,
    results: analysisResults
  });
}

defineExpose({
  analyzeImage,
  enhanceImage
});
</script>

<style scoped>
.image-analysis {
  width: 100%;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  padding: 40px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #f5f7fa;
}

.upload-area:hover {
  border-color: #409EFF;
  background-color: #ecf5ff;
}

.upload-icon {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 20px;
}

.upload-text {
  text-align: center;
  color: #606266;
}

.upload-text p {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.image-preview-container {
  width: 100%;
}

.image-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}

.image-controls {
  display: flex;
  align-items: center;
  flex: 1;
  margin: 0 20px;
}

.control-label {
  margin-right: 8px;
  margin-left: 15px;
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.image-container {
  position: relative;
  width: 100%;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  transition: filter 0.3s, transform 0.3s;
}

.analysis-overlay {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  max-width: 100%;
  max-height: 100%;
}

.analyzing-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  z-index: 10;
}

.analyzing-indicator p {
  margin-top: 15px;
  font-size: 16px;
}

.analysis-results {
  margin-top: 20px;
  border-top: 1px solid #ebeef5;
  padding-top: 20px;
}

.analysis-results h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  color: #303133;
}

.defects-list {
  margin-bottom: 20px;
}

.defect-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.defect-location, .defect-probability {
  margin-left: 15px;
  font-size: 14px;
  color: #606266;
}

.analysis-summary {
  display: flex;
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  align-items: center;
  margin-right: 30px;
}

.summary-label {
  margin-right: 8px;
  font-size: 14px;
  color: #606266;
}

.analysis-actions {
  display: flex;
  justify-content: flex-start;
}

:deep(.el-slider) {
  flex: 1;
  margin-right: 15px;
  max-width: 150px;
}
</style> 