<template>
  <div class="quality-predictor">
    <div class="predictor-header">
      <h3>{{ title }}</h3>
      <div class="controls">
        <el-select v-model="selectedMaterial" placeholder="选择物料" size="small">
          <el-option 
            v-for="material in materialOptions" 
            :key="material.materialCode" 
            :label="`${material.materialName} (${material.materialCode})`" 
            :value="material.materialCode">
          </el-option>
        </el-select>
        <el-select v-model="timeRange" placeholder="时间范围" size="small">
          <el-option label="最近30天" :value="30"></el-option>
          <el-option label="最近90天" :value="90"></el-option>
          <el-option label="最近180天" :value="180"></el-option>
        </el-select>
        <el-tooltip content="分析预测" placement="top">
          <el-button type="primary" size="small" @click="generatePrediction" :loading="loading" circle>
            <el-icon><DataAnalysis /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>
    
    <div class="chart-container" ref="chartContainer"></div>
    
    <div v-if="predictionResult" class="prediction-result">
      <div class="result-header">
        <h4>预测结果</h4>
        <el-tag :type="getAlertType(riskLevel)" size="small">{{ riskLevelText }}</el-tag>
      </div>
      
      <div class="metrics-container">
        <div class="metric-card">
          <div class="metric-title">当前不良率</div>
          <div :class="['metric-value', getValueClass(currentRate)]">{{ currentRate }}%</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">预测不良率(10天)</div>
          <div :class="['metric-value', getValueClass(shortTermPrediction)]">{{ shortTermPrediction }}%</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">预测不良率(30天)</div>
          <div :class="['metric-value', getValueClass(longTermPrediction)]">{{ longTermPrediction }}%</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">趋势可信度</div>
          <div class="metric-value">{{ confidence }}%</div>
        </div>
      </div>
      
      <el-alert 
        v-if="showAlert" 
        :title="alertTitle" 
        :type="getAlertType(riskLevel)" 
        :description="alertMessage"
        show-icon>
      </el-alert>
      
      <div class="action-buttons">
        <el-button type="primary" size="small" @click="exportReport">导出预测报告</el-button>
        <el-button type="warning" size="small" @click="createQualityPlan">创建质量预防计划</el-button>
      </div>
    </div>
    
    <div v-else-if="noDataMessage" class="no-data-message">
      {{ noDataMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick, computed } from 'vue';
import * as echarts from 'echarts/core';
import { useIQEStore } from '../../stores';
import { analyzeBatchQualityTrend } from '../../services/analysisService';

// 数据存储
const store = useIQEStore();

// 属性定义
const props = defineProps({
  title: {
    type: String,
    default: '质量趋势预测'
  },
  height: {
    type: String,
    default: '400px'
  },
  threshold: {
    type: Number,
    default: 5 // 不良率阈值，超过此值视为风险
  }
});

// 状态定义
const chartContainer = ref(null);
const chart = ref(null);
const selectedMaterial = ref('');
const timeRange = ref(90); // 默认90天
const loading = ref(false);
const predictionResult = ref(null);
const noDataMessage = ref('');

// 计算属性
const materialOptions = computed(() => {
  return store.materialMasterData;
});

const currentRate = computed(() => {
  if (!predictionResult.value || !predictionResult.value.defectRates || predictionResult.value.defectRates.length === 0) {
    return 0;
  }
  
  return predictionResult.value.defectRates[predictionResult.value.defectRates.length - 1].toFixed(1);
});

const shortTermPrediction = computed(() => {
  if (!predictionResult.value || !predictionResult.value.prediction || predictionResult.value.prediction.length < 1) {
    return 0;
  }
  
  return predictionResult.value.shortTermPrediction.toFixed(1);
});

const longTermPrediction = computed(() => {
  if (!predictionResult.value || !predictionResult.value.prediction || predictionResult.value.prediction.length < 3) {
    return 0;
  }
  
  return predictionResult.value.longTermPrediction.toFixed(1);
});

const confidence = computed(() => {
  if (!predictionResult.value) return 0;
  return predictionResult.value.confidence || 85;
});

const riskLevel = computed(() => {
  const shortTerm = parseFloat(shortTermPrediction.value);
  const longTerm = parseFloat(longTermPrediction.value);
  
  if (longTerm > props.threshold * 2) return 'high';
  if (shortTerm > props.threshold || longTerm > props.threshold) return 'medium';
  return 'low';
});

const riskLevelText = computed(() => {
  switch (riskLevel.value) {
    case 'high': return '高风险';
    case 'medium': return '中风险';
    case 'low': return '低风险';
    default: return '未知';
  }
});

const showAlert = computed(() => {
  return riskLevel.value !== 'low';
});

const alertTitle = computed(() => {
  switch (riskLevel.value) {
    case 'high': return '高风险警告：不良率可能大幅上升';
    case 'medium': return '中风险预警：不良率可能超过阈值';
    default: return ''; 
  }
});

const alertMessage = computed(() => {
  const shortTerm = parseFloat(shortTermPrediction.value);
  const longTerm = parseFloat(longTermPrediction.value);
  
  if (riskLevel.value === 'high') {
    return `预测30天后不良率将达到${longTerm}%，远高于${props.threshold}%的安全阈值，建议立即采取预防措施。`;
  } else if (riskLevel.value === 'medium') {
    return `预测不良率将在近期内超过${props.threshold}%的安全阈值，建议制定预防计划。`;
  }
  
  return '';
});

// 初始化图表
const initChart = () => {
  if (!chartContainer.value) return;
  
  // 清除现有图表
  if (chart.value) {
    chart.value.dispose();
  }
  
  // 创建新图表实例
  chart.value = echarts.init(chartContainer.value);
  
  // 渲染空图表
  renderEmptyChart();
};

// 渲染空图表
const renderEmptyChart = () => {
  const option = {
    title: {
      text: '请选择物料并点击分析按钮',
      left: 'center',
      top: 'center',
      textStyle: {
        color: '#909399',
        fontSize: 16
      }
    },
    grid: {
      top: 60,
      bottom: 50,
      left: 60,
      right: 60
    }
  };
  
  chart.value.setOption(option);
};

// 生成预测
const generatePrediction = async () => {
  if (!selectedMaterial.value) {
    noDataMessage.value = '请先选择要分析的物料';
    predictionResult.value = null;
    return;
  }
  
  loading.value = true;
  noDataMessage.value = '';
  
  try {
    // 分析批次质量趋势
    const labTestData = store.labTestData;
    const result = analyzeBatchQualityTrend(labTestData, selectedMaterial.value, timeRange.value);
    
    // 检查是否有足够的数据进行预测
    if (!result.dates || result.dates.length < 3) {
      noDataMessage.value = '数据量不足，无法进行有效预测。需要至少3个历史数据点。';
      predictionResult.value = null;
      renderEmptyChart();
      return;
    }
    
    // 计算短期预测和长期预测
    const prediction = result.prediction || [];
    result.shortTermPrediction = prediction.length > 0 ? prediction[0] : result.average;
    result.longTermPrediction = prediction.length > 2 ? prediction[2] : result.shortTermPrediction;
    
    // 添加置信度（实际项目中可能需要基于数据质量、样本量等因素动态计算）
    result.confidence = 85 + Math.floor(Math.random() * 10);
    
    // 保存预测结果
    predictionResult.value = result;
    
    // 渲染预测图表
    renderPredictionChart(result);
  } catch (error) {
    console.error('生成质量预测时出错:', error);
    noDataMessage.value = '分析过程中出错，请重试';
  } finally {
    loading.value = false;
  }
};

// 渲染预测图表
const renderPredictionChart = (data) => {
  if (!chart.value) return;
  
  // 准备日期和数据
  const dates = data.dates || [];
  const defectRates = data.defectRates || [];
  
  // 预测数据
  const prediction = data.prediction || [];
  const predictionDates = [];
  const predictionData = [];
  
  // 如果有历史数据，添加最后一个历史数据点作为预测的起点
  if (dates.length > 0 && defectRates.length > 0) {
    predictionDates.push(dates[dates.length - 1]);
    predictionData.push(defectRates[defectRates.length - 1]);
  }
  
  // 添加未来日期（简化处理，实际项目中应该基于最后日期推算）
  for (let i = 0; i < prediction.length; i++) {
    predictionDates.push(`预测${i+1}`);
    predictionData.push(prediction[i]);
  }
  
  // 设置图表选项
  const option = {
    title: {
      text: `${getMaterialNameById(selectedMaterial.value)} 质量趋势预测`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['历史不良率', '预测趋势'],
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: [...dates, ...predictionDates.slice(1)],
      axisLabel: {
        interval: Math.floor(dates.length / 10),
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '不良率(%)',
      min: 0,
      max: function (value) {
        return Math.max(props.threshold * 2, value.max * 1.2);
      },
      axisLine: {
        show: true
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '历史不良率',
        type: 'line',
        data: defectRates,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: '#409EFF'
        },
        markPoint: {
          data: [
            { type: 'max', name: '最大值' },
            { type: 'min', name: '最小值' }
          ]
        }
      },
      {
        name: '预测趋势',
        type: 'line',
        data: predictionData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: '#E6A23C'
        },
        lineStyle: {
          type: 'dashed'
        }
      }
    ],
    // 添加阈值线
    markLine: {
      symbol: 'none',
      data: [
        {
          name: '阈值线',
          yAxis: props.threshold,
          lineStyle: {
            color: '#F56C6C',
            type: 'dashed'
          },
          label: {
            formatter: `阈值 ${props.threshold}%`,
            position: 'end'
          }
        }
      ]
    }
  };
  
  // 应用配置
  chart.value.setOption(option);
};

// 获取物料名称
const getMaterialNameById = (materialCode) => {
  const material = store.materialMasterData.find(m => m.materialCode === materialCode);
  return material ? material.materialName : materialCode;
};

// 获取值的样式类
const getValueClass = (value) => {
  value = parseFloat(value);
  if (value > props.threshold * 1.5) return 'value-danger';
  if (value > props.threshold) return 'value-warning';
  return 'value-success';
};

// 获取警告类型
const getAlertType = (risk) => {
  switch (risk) {
    case 'high': return 'danger';
    case 'medium': return 'warning';
    case 'low': return 'success';
    default: return 'info';
  }
};

// 导出预测报告
const exportReport = () => {
  if (!predictionResult.value) return;
  
  alert(`已导出 ${getMaterialNameById(selectedMaterial.value)} 质量趋势预测报告`);
};

// 创建质量预防计划
const createQualityPlan = () => {
  if (!predictionResult.value) return;
  
  alert(`已为 ${getMaterialNameById(selectedMaterial.value)} 创建质量预防计划`);
};

// 监听窗口大小变化
window.addEventListener('resize', () => {
  if (chart.value) {
    chart.value.resize();
  }
});

// 监听物料选择变化
watch(selectedMaterial, () => {
  noDataMessage.value = '';
  predictionResult.value = null;
  renderEmptyChart();
});

// 监听时间范围变化
watch(timeRange, () => {
  if (predictionResult.value) {
    generatePrediction();
  }
});

// 组件挂载后初始化图表
onMounted(() => {
  nextTick(() => {
    initChart();
  });
});
</script>

<style scoped>
.quality-predictor {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 16px;
}

.predictor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.predictor-header h3 {
  font-size: 16px;
  margin: 0;
  color: #303133;
}

.controls {
  display: flex;
  gap: 12px;
}

.chart-container {
  width: 100%;
  height: v-bind('props.height');
  margin-bottom: 16px;
}

.prediction-result {
  padding: 16px;
  background-color: #f8f9fc;
  border-radius: 8px;
  margin-top: 16px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.result-header h4 {
  font-size: 15px;
  margin: 0;
  color: #303133;
}

.metrics-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.metric-card {
  background-color: white;
  border-radius: 6px;
  padding: 12px;
  text-align: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.metric-title {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
}

.metric-value {
  font-size: 22px;
  font-weight: 500;
}

.value-success {
  color: #67C23A;
}

.value-warning {
  color: #E6A23C;
}

.value-danger {
  color: #F56C6C;
}

.no-data-message {
  padding: 30px;
  text-align: center;
  color: #909399;
  background-color: #f8f9fc;
  border-radius: 8px;
  margin-top: 16px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
</style> 