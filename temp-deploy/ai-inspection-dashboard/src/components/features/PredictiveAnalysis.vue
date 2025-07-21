<template>
  <div class="predictive-analysis">
    <div class="prediction-toolbar">
      <div class="prediction-type-selector">
        <span class="toolbar-label">预测类型：</span>
        <el-radio-group v-model="predictionType" size="small" @change="resetPrediction">
          <el-radio-button label="quality">质量趋势</el-radio-button>
          <el-radio-button label="defect">缺陷预测</el-radio-button>
          <el-radio-button label="supplier">供应商评估</el-radio-button>
          <el-radio-button label="maintenance">设备维护</el-radio-button>
        </el-radio-group>
      </div>
      
      <div class="prediction-actions">
        <el-button type="primary" size="small" @click="runPrediction" :loading="isPredicting">
          <el-icon><el-icon-cpu /></el-icon> 运行预测
        </el-button>
        <el-button size="small" @click="showSettings = !showSettings">
          <el-icon><el-icon-setting /></el-icon> 设置
        </el-button>
        <el-button size="small" @click="exportResults" :disabled="!hasPredictionResults">
          <el-icon><el-icon-download /></el-icon> 导出
        </el-button>
      </div>
    </div>

    <!-- 设置面板 -->
    <div v-if="showSettings" class="settings-panel">
      <div class="panel-header">
        <h3>预测设置</h3>
      </div>

      <el-form :model="predictionSettings" label-position="top" size="small">
        <el-form-item label="预测范围">
          <el-radio-group v-model="predictionSettings.timeRange">
            <el-radio-button label="7">未来7天</el-radio-button>
            <el-radio-button label="30">未来30天</el-radio-button>
            <el-radio-button label="90">未来90天</el-radio-button>
            <el-radio-button label="custom">自定义</el-radio-button>
          </el-radio-group>
          
          <template v-if="predictionSettings.timeRange === 'custom'">
            <div class="custom-range">
              <el-date-picker
                v-model="predictionSettings.customRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY/MM/DD"
                value-format="YYYY-MM-DD"
              />
            </div>
          </template>
        </el-form-item>
        
        <el-form-item label="数据源">
          <el-select v-model="predictionSettings.dataSources" multiple placeholder="选择数据源" style="width: 100%;">
            <el-option label="IQC数据" value="iqc" />
            <el-option label="实验室测试" value="lab" />
            <el-option label="产线检测" value="online" />
            <el-option label="供应商历史" value="supplier" />
            <el-option label="设备维护记录" value="equipment" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="AI模型">
          <el-select v-model="predictionSettings.model" placeholder="选择AI模型" style="width: 100%;">
            <el-option label="时间序列预测 (ARIMA)" value="arima" />
            <el-option label="机器学习分类 (RandomForest)" value="randomforest" />
            <el-option label="深度学习 (LSTM)" value="lstm" />
            <el-option label="混合模型 (Ensemble)" value="ensemble" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="置信度阈值">
          <el-slider 
            v-model="predictionSettings.confidenceThreshold" 
            :min="50" 
            :max="99" 
            :format-tooltip="value => `${value}%`"
          />
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据输入面板 -->
    <div v-if="!hasPredictionResults && !isPredicting" class="data-input-panel">
      <el-form :model="predictionInput" label-position="top" size="small">
        <div class="form-header">
          <h3>{{ getPredictionTypeTitle() }} - 数据输入</h3>
        </div>
        
        <!-- 质量趋势预测的输入 -->
        <template v-if="predictionType === 'quality'">
          <el-form-item label="物料类别">
            <el-select v-model="predictionInput.materialCategory" multiple placeholder="选择物料类别" style="width: 100%;">
              <el-option label="电子元器件" value="electronic" />
              <el-option label="结构件" value="structure" />
              <el-option label="包装材料" value="packaging" />
              <el-option label="化学材料" value="chemical" />
              <el-option label="显示模组" value="display" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="关注指标">
            <el-select v-model="predictionInput.metrics" multiple placeholder="选择关注指标" style="width: 100%;">
              <el-option label="不良率" value="defect_rate" />
              <el-option label="一次通过率" value="first_pass_yield" />
              <el-option label="返修率" value="rework_rate" />
              <el-option label="客户投诉" value="customer_complaints" />
            </el-select>
          </el-form-item>
        </template>
        
        <!-- 缺陷预测的输入 -->
        <template v-if="predictionType === 'defect'">
          <el-form-item label="物料编码">
            <el-input v-model="predictionInput.materialCode" placeholder="输入物料编码，如37301062" />
          </el-form-item>
          
          <el-form-item label="供应商">
            <el-select v-model="predictionInput.supplier" placeholder="选择供应商" style="width: 100%;">
              <el-option label="所有供应商" value="all" />
              <el-option label="金盾" value="jindun" />
              <el-option label="易湛" value="yizhan" />
              <el-option label="其他供应商" value="others" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="预测缺陷类型">
            <el-checkbox-group v-model="predictionInput.defectTypes">
              <el-checkbox label="appearance">外观缺陷</el-checkbox>
              <el-checkbox label="functional">功能不良</el-checkbox>
              <el-checkbox label="reliability">可靠性问题</el-checkbox>
              <el-checkbox label="dimensional">尺寸偏差</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </template>
        
        <!-- 其他预测类型的输入表单可以继续添加... -->
      </el-form>
    </div>

    <!-- 预测结果 -->
    <div v-if="hasPredictionResults" class="prediction-results">
      <div class="results-header">
        <h3>{{ getPredictionTypeTitle() }} - 预测结果</h3>
        <el-button size="small" @click="resetPrediction">
          <el-icon><el-icon-refresh-right /></el-icon> 重置
        </el-button>
      </div>
      
      <div class="results-summary">
        <el-alert
          :title="predictionSummary.title"
          :type="predictionSummary.type"
          :description="predictionSummary.description"
          show-icon
          :closable="false"
        />
      </div>
      
      <div class="chart-container" ref="resultChartContainer"></div>
      
      <div class="detailed-predictions">
        <h4>详细预测</h4>
        <el-table :data="detailedPredictions" style="width: 100%" :max-height="250" border>
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="value" label="预测值" width="100" />
          <el-table-column prop="confidence" label="置信度" width="100">
            <template #default="scope">
              <el-progress 
                :percentage="scope.row.confidence" 
                :status="scope.row.confidence > 80 ? 'success' : scope.row.confidence > 60 ? 'warning' : 'exception'"
              />
            </template>
          </el-table-column>
          <el-table-column prop="risk" label="风险评级" width="100">
            <template #default="scope">
              <el-tag 
                :type="scope.row.risk === 'high' ? 'danger' : scope.row.risk === 'medium' ? 'warning' : 'success'"
                effect="dark"
              >
                {{ scope.row.risk === 'high' ? '高' : scope.row.risk === 'medium' ? '中' : '低' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="recommendation" label="建议措施" />
        </el-table>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isPredicting" class="prediction-loading">
      <el-progress type="circle" :percentage="predictionProgress" />
      <div class="loading-text">
        <h3>AI模型计算中</h3>
        <p>{{ predictionStage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';

const emit = defineEmits(['prediction-complete']);

// 预测类型与设置
const predictionType = ref('quality');
const showSettings = ref(false);
const isPredicting = ref(false);
const predictionProgress = ref(0);
const predictionStage = ref('');
const resultChart = ref(null);

// 预测设置
const predictionSettings = reactive({
  timeRange: '30',
  customRange: [],
  dataSources: ['iqc', 'lab', 'online'],
  model: 'ensemble',
  confidenceThreshold: 75
});

// 预测输入
const predictionInput = reactive({
  // 质量趋势
  materialCategory: [],
  metrics: ['defect_rate'],
  
  // 缺陷预测
  materialCode: '',
  supplier: 'all',
  defectTypes: ['appearance', 'functional'],
  
  // 其他预测类型的输入项...
});

// 预测结果
const predictionResults = reactive({
  data: null,
  summary: null,
  details: []
});

// 计算属性
const hasPredictionResults = computed(() => predictionResults.data !== null);

const predictionSummary = computed(() => {
  if (!predictionResults.summary) return { title: '', description: '', type: 'info' };
  
  return {
    title: predictionResults.summary.title || '预测完成',
    description: predictionResults.summary.description || '',
    type: predictionResults.summary.riskLevel === 'high' ? 'error' : 
          predictionResults.summary.riskLevel === 'medium' ? 'warning' : 'success'
  };
});

const detailedPredictions = computed(() => {
  return predictionResults.details || [];
});

// 重置预测
function resetPrediction() {
  predictionResults.data = null;
  predictionResults.summary = null;
  predictionResults.details = [];
  
  if (resultChart.value) {
    resultChart.value.dispose();
    resultChart.value = null;
  }
}

// 获取预测类型标题
function getPredictionTypeTitle() {
  switch(predictionType.value) {
    case 'quality': return '质量趋势预测';
    case 'defect': return '缺陷预测分析';
    case 'supplier': return '供应商质量评估';
    case 'maintenance': return '设备维护预测';
    default: return '预测分析';
  }
}

// 运行预测
async function runPrediction() {
  if (isPredicting.value) return;
  
  // 简单验证
  if (predictionType.value === 'quality' && predictionInput.materialCategory.length === 0) {
    ElMessage.warning('请至少选择一个物料类别');
    return;
  }
  
  if (predictionType.value === 'defect' && !predictionInput.materialCode) {
    ElMessage.warning('请输入物料编码');
    return;
  }
  
  // 开始预测
  isPredicting.value = true;
  predictionProgress.value = 0;
  
  // 模拟AI预测过程
  await simulateAIPrediction();
  
  // 生成结果
  generatePredictionResults();
  
  // 预测完成
  isPredicting.value = false;
  predictionProgress.value = 100;
  
  // 发出事件
  emit('prediction-complete', {
    type: predictionType.value,
    results: predictionResults
  });
  
  // 渲染图表
  nextTick(() => {
    renderResultChart();
  });
}

// 模拟AI预测过程
async function simulateAIPrediction() {
  const stages = [
    '数据收集中...',
    '特征提取中...',
    '模型训练中...',
    'AI推理中...',
    '结果分析中...'
  ];
  
  for (let i = 0; i < stages.length; i++) {
    predictionStage.value = stages[i];
    await new Promise(resolve => setTimeout(resolve, 800));
    predictionProgress.value = Math.min(Math.floor((i + 1) / stages.length * 100), 95);
  }
  
  await new Promise(resolve => setTimeout(resolve, 500));
}

// 生成预测结果 (模拟数据)
function generatePredictionResults() {
  if (predictionType.value === 'quality') {
    generateQualityPrediction();
  } else if (predictionType.value === 'defect') {
    generateDefectPrediction();
  } else if (predictionType.value === 'supplier') {
    generateSupplierPrediction();
  } else if (predictionType.value === 'maintenance') {
    generateMaintenancePrediction();
  }
}

// 生成质量趋势预测
function generateQualityPrediction() {
  const dates = [];
  const values = [];
  const today = new Date();
  
  // 生成日期和预测值
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
    
    // 质量趋势曲线，模拟趋势有所改善
    const baseValue = 5 + Math.random() * 2; // 基础不良率5-7%
    const trendFactor = -0.03 * i; // 趋势因子，负数表示不良率下降
    const randomFactor = (Math.random() - 0.5) * 1.5; // 随机因子
    const value = Math.max(0.5, baseValue + trendFactor + randomFactor).toFixed(2);
    values.push(parseFloat(value));
  }
  
  // 生成详细预测记录
  const details = [];
  for (let i = 0; i < 10; i++) {
    const date = dates[i];
    const value = values[i];
    const confidence = Math.round(95 - i * 1.5);
    const risk = value > 5 ? 'high' : value > 3 ? 'medium' : 'low';
    
    details.push({
      date,
      value: value + '%',
      confidence,
      risk,
      recommendation: getRiskRecommendation(risk, 'quality')
    });
  }
  
  // 设置预测结果
  predictionResults.data = {
    dates,
    values,
    type: 'quality'
  };
  
  predictionResults.summary = {
    title: '质量趋势预测：趋势向好',
    description: `预测未来30天内不良率将从${values[0]}%下降至${values[values.length-1]}%，建议继续优化来料检验流程。`,
    riskLevel: values[0] > 5 ? 'medium' : 'low'
  };
  
  predictionResults.details = details;
}

// 生成缺陷预测
function generateDefectPrediction() {
  const materialCode = predictionInput.materialCode || '37301062';
  const supplier = predictionInput.supplier === 'all' ? '金盾' : predictionInput.supplier === 'jindun' ? '金盾' : '易湛';
  
  // 设置预测结果
  predictionResults.data = {
    materialCode,
    supplier,
    defectTypes: predictionInput.defectTypes,
    probabilities: {
      appearance: 0.23,
      functional: 0.15,
      reliability: 0.42,
      dimensional: 0.08
    },
    type: 'defect'
  };
  
  predictionResults.summary = {
    title: `缺陷预测：${materialCode}存在可靠性风险`,
    description: `AI模型预测该物料在未来30天内发生可靠性问题的概率为42%，建议增加可靠性测试频率。`,
    riskLevel: 'medium'
  };
  
  const today = new Date();
  predictionResults.details = [
    {
      date: new Date(today.setDate(today.getDate() + 7)).toISOString().split('T')[0],
      value: '可靠性问题',
      confidence: 85,
      risk: 'high',
      recommendation: '建议增加疲劳测试次数至600次'
    },
    {
      date: new Date(today.setDate(today.getDate() + 10)).toISOString().split('T')[0],
      value: '外观不良',
      confidence: 65,
      risk: 'medium',
      recommendation: '加强模具清洁维护，增加外观检验比例'
    },
    {
      date: new Date(today.setDate(today.getDate() + 15)).toISOString().split('T')[0],
      value: '尺寸偏差',
      confidence: 45,
      risk: 'low',
      recommendation: '正常监控，无需特别措施'
    }
  ];
}

// 获取风险建议
function getRiskRecommendation(risk, type) {
  if (type === 'quality') {
    switch (risk) {
      case 'high': return '立即增加抽检比例至15%，联系供应商排查问题';
      case 'medium': return '增加抽检比例至8%，关注高风险物料';
      case 'low': return '维持常规检验流程，定期监控';
      default: return '';
    }
  } else {
    switch (risk) {
      case 'high': return '安排专项验证测试，与供应商共同改进';
      case 'medium': return '增加特定测试项目，关注问题批次';
      case 'low': return '维持常规检验流程';
      default: return '';
    }
  }
}

// 生成供应商预测和设备维护预测函数先省略

// 渲染结果图表
function renderResultChart() {
  const chartContainer = document.querySelector('.chart-container');
  if (!chartContainer) return;
  
  if (resultChart.value) {
    resultChart.value.dispose();
  }
  
  resultChart.value = echarts.init(chartContainer);
  
  if (predictionType.value === 'quality') {
    renderQualityTrendChart();
  } else if (predictionType.value === 'defect') {
    renderDefectProbabilityChart();
  } else {
    // 其他图表类型
  }
}

// 渲染质量趋势图表
function renderQualityTrendChart() {
  if (!resultChart.value || !predictionResults.data) return;
  
  const option = {
    title: {
      text: '质量趋势预测',
      subtext: '未来30天不良率变化趋势'
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}%'
    },
    xAxis: {
      type: 'category',
      data: predictionResults.data.dates,
      axisLabel: {
        rotate: 45,
        formatter: (value) => {
          return value.substring(5); // 只显示月-日
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '不良率(%)',
      min: 0
    },
    series: [
      {
        name: '预测不良率',
        type: 'line',
        data: predictionResults.data.values,
        markPoint: {
          data: [
            { type: 'max', name: '最大值' },
            { type: 'min', name: '最小值' }
          ]
        },
        markLine: {
          data: [
            { type: 'average', name: '平均值' },
            { yAxis: 5, name: '警戒线', lineStyle: { color: '#FF4500' } }
          ]
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(58,77,233,0.3)'
            }, {
              offset: 1, color: 'rgba(58,77,233,0.1)'
            }]
          }
        },
        smooth: true
      }
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    }
  };
  
  resultChart.value.setOption(option);
}

// 渲染缺陷概率图表
function renderDefectProbabilityChart() {
  if (!resultChart.value || !predictionResults.data) return;
  
  const option = {
    title: {
      text: '缺陷类型概率分布',
      subtext: `物料: ${predictionResults.data.materialCode}`
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: ['外观缺陷', '功能不良', '可靠性问题', '尺寸偏差']
    },
    series: [
      {
        name: '缺陷概率',
        type: 'pie',
        radius: '60%',
        center: ['50%', '50%'],
        data: [
          {value: predictionResults.data.probabilities.appearance, name: '外观缺陷'},
          {value: predictionResults.data.probabilities.functional, name: '功能不良'},
          {value: predictionResults.data.probabilities.reliability, name: '可靠性问题'},
          {value: predictionResults.data.probabilities.dimensional, name: '尺寸偏差'}
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
  
  resultChart.value.setOption(option);
}

// 导出结果
function exportResults() {
  ElMessage.success('预测结果已导出');
  // 实际导出逻辑
}

onMounted(() => {
  // 初始化
});
</script>

<style scoped>
.predictive-analysis {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.prediction-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.settings-panel,
.data-input-panel {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
  max-height: 300px;
  overflow-y: auto;
}

.panel-header,
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.panel-header h3,
.form-header h3,
.results-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.custom-range {
  margin-top: 10px;
}

.prediction-results {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.results-summary {
  margin-bottom: 15px;
}

.chart-container {
  height: 300px;
  margin-bottom: 15px;
}

.detailed-predictions {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.detailed-predictions h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 14px;
  color: #606266;
}

.prediction-loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.loading-text {
  margin-top: 20px;
  text-align: center;
}

.loading-text h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #303133;
}

.loading-text p {
  margin: 0;
  color: #909399;
}
</style> 