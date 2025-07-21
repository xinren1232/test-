<template>
  <div class="quality-trend-chart">
    <div class="chart-header">
      <h3>{{ title }}</h3>
      <div class="period-selector">
        <el-radio-group v-model="selectedPeriod" size="small">
          <el-radio-button label="weekly">周</el-radio-button>
          <el-radio-button label="monthly">月</el-radio-button>
          <el-radio-button label="quarterly">季度</el-radio-button>
        </el-radio-group>
      </div>
    </div>
    <div class="chart-container" ref="chartContainer"></div>
    <div class="trend-analysis" v-if="showAnalysis">
      <h4>趋势分析</h4>
      <div class="trend-metrics">
        <div class="metric">
          <span class="metric-label">平均不良率:</span>
          <span class="metric-value" :class="averageClass">{{ averageDefectRate }}%</span>
        </div>
        <div class="metric">
          <span class="metric-label">趋势方向:</span>
          <span class="metric-value" :class="trendClass">
            <i :class="trendIcon"></i>
            {{ trendText }}
          </span>
        </div>
        <div class="metric">
          <span class="metric-label">预测值:</span>
          <span class="metric-value prediction">{{ predictionValue }}%</span>
        </div>
      </div>
      <el-alert
        :title="alertTitle"
        :type="alertType"
        :description="alertDescription"
        v-if="showAlert"
        show-icon
      ></el-alert>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick, computed } from 'vue';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent, MarkLineComponent, MarkPointComponent } from 'echarts/components';

// 注册必须的组件
echarts.use([
  LineChart,
  CanvasRenderer,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  MarkPointComponent
]);

const props = defineProps({
  // 图表标题
  title: {
    type: String,
    default: '质量趋势'
  },
  // 趋势数据，格式为 { dates: [], total: [], passed: [], failed: [], prediction: [] }
  trendData: {
    type: Object,
    required: true
  },
  // 是否显示分析区域
  showAnalysis: {
    type: Boolean,
    default: true
  },
  // 高度
  height: {
    type: String,
    default: '350px'
  },
  // 质量上限阈值
  threshold: {
    type: Number,
    default: 5 // 5%不良率为阈值
  }
});

// 引用和状态
const chartContainer = ref(null);
const chart = ref(null);
const selectedPeriod = ref('weekly');

// 计算属性和指标
const trendDataset = computed(() => {
  return props.trendData[selectedPeriod.value] || { dates: [], total: [], passed: [], failed: [], prediction: [] };
});

// 计算不良率序列
const defectRateSeries = computed(() => {
  const { dates, total, failed } = trendDataset.value;
  return dates.map((date, index) => {
    if (total[index] === 0 || total[index] === null || failed[index] === null) return null;
    return +(failed[index] / total[index] * 100).toFixed(2);
  });
});

// 计算预测序列（包含实际数据中的null占位）
const predictionSeries = computed(() => {
  const { prediction } = trendDataset.value;
  const actualLength = defectRateSeries.value.length;
  const actualLastIndex = actualLength - 1;
  
  // 结果数组，先填充实际数据位置为null
  const result = Array(actualLength).fill(null);
  
  // 添加最后一个实际数据点作为预测起点连接
  if (actualLastIndex >= 0) {
    result[actualLastIndex] = defectRateSeries.value[actualLastIndex];
  }
  
  // 添加预测数据
  if (prediction && prediction.length) {
    // 预测数据非null部分添加到结果后面
    const predictionData = prediction.filter(val => val !== null);
    return [...result, ...predictionData];
  }
  
  return result;
});

// 计算x轴全部标签（实际+预测）
const allDateLabels = computed(() => {
  const { dates } = trendDataset.value;
  const predictionLength = predictionSeries.value.filter(val => val !== null).length;
  const actualLength = dates.length;
  
  // 复制实际日期
  const result = [...dates];
  
  // 如果有预测数据，添加预测日期标签
  if (predictionLength > 0) {
    // 减去重叠点
    const additionalDates = predictionLength - 1;
    
    // 根据周期添加不同格式的预测日期
    for (let i = 1; i <= additionalDates; i++) {
      const lastDateIndex = actualLength - 1;
      
      if (selectedPeriod.value === 'weekly') {
        result.push(`预测${i}`);
      } else if (selectedPeriod.value === 'monthly') {
        result.push(`预测${i}`);
      } else if (selectedPeriod.value === 'quarterly') {
        result.push(`预测${i}`);
      }
    }
  }
  
  return result;
});

// 计算平均不良率
const averageDefectRate = computed(() => {
  const rates = defectRateSeries.value.filter(rate => rate !== null);
  if (rates.length === 0) return 0;
  
  const sum = rates.reduce((acc, val) => acc + val, 0);
  return (sum / rates.length).toFixed(2);
});

// 计算趋势方向
const trendDirection = computed(() => {
  const rates = defectRateSeries.value.filter(rate => rate !== null);
  
  if (rates.length < 2) return 'stable';
  
  // 计算简单线性回归的斜率
  const n = rates.length;
  const indices = Array.from({ length: n }, (_, i) => i);
  const sumX = indices.reduce((sum, val) => sum + val, 0);
  const sumY = rates.reduce((sum, val) => sum + val, 0);
  const sumXY = indices.reduce((sum, val, i) => sum + val * rates[i], 0);
  const sumXX = indices.reduce((sum, val) => sum + val * val, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  
  // 判断趋势方向
  if (Math.abs(slope) < 0.1) return 'stable';
  return slope > 0 ? 'increasing' : 'decreasing';
});

// 趋势显示文本
const trendText = computed(() => {
  switch (trendDirection.value) {
    case 'increasing': return '上升';
    case 'decreasing': return '下降';
    default: return '稳定';
  }
});

// 趋势图标
const trendIcon = computed(() => {
  switch (trendDirection.value) {
    case 'increasing': return 'el-icon-top';
    case 'decreasing': return 'el-icon-bottom';
    default: return 'el-icon-minus';
  }
});

// 趋势CSS类
const trendClass = computed(() => {
  switch (trendDirection.value) {
    case 'increasing': return 'trend-up'; // 不良率上升是负面的
    case 'decreasing': return 'trend-down'; // 不良率下降是正面的
    default: return 'trend-stable';
  }
});

// 平均值CSS类
const averageClass = computed(() => {
  const value = parseFloat(averageDefectRate.value);
  if (value > props.threshold) return 'value-warning';
  if (value > props.threshold / 2) return 'value-notice';
  return 'value-good';
});

// 预测值
const predictionValue = computed(() => {
  const predictions = predictionSeries.value.filter(val => val !== null);
  if (predictions.length <= 1) return '无数据';
  return predictions[predictions.length - 1].toFixed(2);
});

// 告警信息
const showAlert = computed(() => {
  return parseFloat(predictionValue.value) > props.threshold;
});

const alertTitle = computed(() => {
  if (trendDirection.value === 'increasing') {
    return '不良率趋势上升';
  }
  if (parseFloat(predictionValue.value) > props.threshold) {
    return '预测不良率超出阈值';
  }
  return '';
});

const alertType = computed(() => {
  if (parseFloat(predictionValue.value) > props.threshold * 1.5) {
    return 'error';
  }
  if (parseFloat(predictionValue.value) > props.threshold) {
    return 'warning';
  }
  return 'info';
});

const alertDescription = computed(() => {
  if (trendDirection.value === 'increasing' && parseFloat(predictionValue.value) > props.threshold) {
    return `预测不良率将持续上升至${predictionValue.value}%，已超过${props.threshold}%的阈值标准，建议采取预防措施。`;
  }
  if (trendDirection.value === 'increasing') {
    return `不良率呈上升趋势，虽未超出阈值，仍建议关注。`;
  }
  if (parseFloat(predictionValue.value) > props.threshold) {
    return `预测不良率${predictionValue.value}%已超过${props.threshold}%的阈值标准，建议关注。`;
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
  
  // 更新图表
  updateChart();
};

// 更新图表数据
const updateChart = () => {
  if (!chart.value) return;
  
  // 设置图表选项
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        let result = params[0].axisValueLabel + '<br/>';
        
        // 遍历所有数据系列
        params.forEach(param => {
          // 如果数据点有值
          if (param.value !== null) {
            // 添加颜色标记和系列名称
            result += `${param.marker} ${param.seriesName}: ${param.value}%<br/>`;
          }
        });
        
        return result;
      }
    },
    legend: {
      data: ['不良率', '预测趋势'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: allDateLabels.value,
      axisLabel: {
        interval: 0,
        rotate: allDateLabels.value.length > 7 ? 30 : 0
      }
    },
    yAxis: {
      type: 'value',
      name: '不良率(%)',
      min: 0,
      max: (value) => {
        // 动态计算最大值，至少为阈值的两倍或数据最大值的1.2倍
        const maxValue = Math.max(...defectRateSeries.value.filter(v => v !== null), ...predictionSeries.value.filter(v => v !== null));
        return Math.max(props.threshold * 2, maxValue * 1.2);
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
        name: '不良率',
        type: 'line',
        smooth: true,
        data: defectRateSeries.value,
        itemStyle: {
          color: '#409EFF'
        },
        markLine: {
          silent: true,
          lineStyle: {
            color: '#F56C6C',
            type: 'dashed'
          },
          data: [
            {
              yAxis: props.threshold,
              name: '阈值线',
              label: {
                formatter: `阈值 ${props.threshold}%`,
                position: 'end'
              }
            }
          ]
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
        smooth: true,
        data: predictionSeries.value,
        itemStyle: {
          color: '#E6A23C'
        },
        lineStyle: {
          type: 'dashed'
        }
      }
    ]
  };
  
  // 应用配置
  chart.value.setOption(option);
};

// 监听窗口大小变化
window.addEventListener('resize', () => {
  if (chart.value) {
    chart.value.resize();
  }
});

// 监听周期选择变化
watch(selectedPeriod, () => {
  nextTick(() => {
    updateChart();
  });
});

// 监听数据变化
watch(() => props.trendData, () => {
  nextTick(() => {
    updateChart();
  });
}, { deep: true });

// 组件挂载后初始化图表
onMounted(() => {
  nextTick(() => {
    initChart();
  });
});
</script>

<style scoped>
.quality-trend-chart {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 16px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-header h3 {
  font-size: 16px;
  margin: 0;
  color: #303133;
}

.chart-container {
  width: 100%;
  height: v-bind('props.height');
}

.trend-analysis {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.trend-analysis h4 {
  font-size: 14px;
  margin: 0 0 12px 0;
  color: #303133;
}

.trend-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 16px;
}

.metric {
  display: flex;
  align-items: center;
  gap: 8px;
}

.metric-label {
  font-size: 13px;
  color: #606266;
}

.metric-value {
  font-size: 14px;
  font-weight: 500;
}

.trend-up {
  color: #F56C6C;
}

.trend-down {
  color: #67C23A;
}

.trend-stable {
  color: #909399;
}

.value-warning {
  color: #F56C6C;
}

.value-notice {
  color: #E6A23C;
}

.value-good {
  color: #67C23A;
}

.prediction {
  color: #E6A23C;
}
</style> 