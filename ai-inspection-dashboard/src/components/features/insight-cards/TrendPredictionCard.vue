<template>
  <div class="trend-prediction-card">
    <template v-if="trendData">
      <!-- 趋势概述 -->
      <div class="trend-overview">
        <div class="trend-indicator">
          <el-tag :type="getTrendType(trendData.trend)" size="large">
            {{ getTrendLabel(trendData.trend) }}
          </el-tag>
          <div class="confidence">
            <span class="label">置信度:</span>
            <el-progress 
              :percentage="Math.round(trendData.confidence * 100)" 
              :format="format => `${format}%`"
              :color="getConfidenceColor(trendData.confidence)"
              :stroke-width="10"
            />
          </div>
          <p class="update-time">更新于: {{ formatTime(trendData.timestamp) }}</p>
        </div>
      </div>

      <!-- 趋势图表 -->
      <div class="trend-chart-container">
        <div ref="chartRef" class="trend-chart"></div>
      </div>

      <!-- 预测详情 -->
      <div class="prediction-details">
        <h4>预测详情</h4>
        <el-table :data="trendData.prediction" style="width: 100%">
          <el-table-column prop="timestamp" label="时间点" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.timestamp) }}
            </template>
          </el-table-column>
          <el-table-column prop="value" label="预测值" width="120">
            <template #default="scope">
              {{ scope.row.value.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="confidence" label="置信度" width="120">
            <template #default="scope">
              <el-progress 
                :percentage="Math.round(scope.row.confidence * 100)"
                :color="getConfidenceColor(scope.row.confidence)"
                :stroke-width="6"
              />
            </template>
          </el-table-column>
          <el-table-column label="趋势">
            <template #default="scope">
              <el-tag :type="getPredictionType(scope.row.value, scope.$index, trendData.prediction)">
                {{ getPredictionTrend(scope.row.value, scope.$index, trendData.prediction) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 操作按钮 -->
      <div class="actions-section">
        <el-button type="primary" @click="handleAction('exportPrediction')">
          导出预测
        </el-button>
        <el-button type="success" @click="handleAction('createAlert')">
          设置提醒
        </el-button>
        <el-button @click="handleAction('explainPrediction')">
          解释预测
        </el-button>
      </div>
    </template>
    
    <template v-else>
      <el-empty description="暂无趋势预测数据" />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { 
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  MarkLineComponent,
  MarkAreaComponent
} from 'echarts/components';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

// 注册必要的组件
echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  MarkLineComponent,
  MarkAreaComponent,
  UniversalTransition,
  CanvasRenderer
]);

// 定义属性
const props = defineProps({
  trendData: {
    type: Object,
    default: null
  }
});

// 定义事件
const emit = defineEmits(['action-triggered']);

// 图表引用
const chartRef = ref(null);
let chart = null;

// 格式化时间
function formatTime(timestamp) {
  if (!timestamp) return '未知';
  
  const date = new Date(timestamp);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

// 格式化日期
function formatDate(timestamp) {
  if (!timestamp) return '未知';
  
  const date = new Date(timestamp);
  return date.toLocaleDateString();
}

// 获取趋势类型
function getTrendType(trend) {
  switch (trend) {
    case 'up':
      return 'danger';
    case 'down':
      return 'success';
    case 'stable':
      return 'info';
    default:
      return 'info';
  }
}

// 获取趋势标签
function getTrendLabel(trend) {
  switch (trend) {
    case 'up':
      return '上升趋势';
    case 'down':
      return '下降趋势';
    case 'stable':
      return '稳定趋势';
    default:
      return '未知趋势';
  }
}

// 获取置信度颜色
function getConfidenceColor(confidence) {
  if (confidence >= 0.8) return '#67C23A';
  if (confidence >= 0.6) return '#E6A23C';
  return '#F56C6C';
}

// 获取预测点趋势类型
function getPredictionType(value, index, predictions) {
  if (index === 0) return 'info';
  
  const prevValue = predictions[index - 1].value;
  if (value > prevValue) return 'danger';
  if (value < prevValue) return 'success';
  return 'info';
}

// 获取预测点趋势
function getPredictionTrend(value, index, predictions) {
  if (index === 0) return '基准点';
  
  const prevValue = predictions[index - 1].value;
  const diff = value - prevValue;
  const percent = (Math.abs(diff) / prevValue * 100).toFixed(1);
  
  if (diff > 0) return `上升 ${percent}%`;
  if (diff < 0) return `下降 ${percent}%`;
  return '持平';
}

// 初始化图表
function initChart() {
  if (!chartRef.value) return;
  
  // 创建图表实例
  chart = echarts.init(chartRef.value);
  
  // 更新图表
  updateChart();
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    chart && chart.resize();
  });
}

// 更新图表
function updateChart() {
  if (!chart || !props.trendData) return;
  
  const { prediction, trend } = props.trendData;
  
  // 准备数据
  const dates = prediction.map(item => formatDate(item.timestamp));
  const values = prediction.map(item => item.value);
  const confidenceLower = prediction.map(item => item.value * (1 - (1 - item.confidence) / 2));
  const confidenceUpper = prediction.map(item => item.value * (1 + (1 - item.confidence) / 2));
  
  // 设置图表选项
  const option = {
    title: {
      text: '质量趋势预测',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        const date = params[0].axisValue;
        const value = params[0].data.toFixed(2);
        const lower = params[1].data.toFixed(2);
        const upper = params[2].data.toFixed(2);
        
        return `
          <div style="font-weight: bold; margin-bottom: 5px;">${date}</div>
          <div>预测值: ${value}</div>
          <div>下限: ${lower}</div>
          <div>上限: ${upper}</div>
          <div>可信区间: ${lower} - ${upper}</div>
        `;
      }
    },
    legend: {
      data: ['预测值', '可信区间'],
      bottom: 0
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
      data: dates,
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      name: '值',
      axisLabel: {
        formatter: '{value}'
      }
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        start: 0,
        end: 100
      }
    ],
    series: [
      {
        name: '预测值',
        type: 'line',
        data: values,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: trend === 'up' ? '#F56C6C' : trend === 'down' ? '#67C23A' : '#409EFF'
        },
        lineStyle: {
          width: 3
        }
      },
      {
        name: '下限',
        type: 'line',
        data: confidenceLower,
        lineStyle: {
          opacity: 0
        },
        stack: 'confidence',
        symbol: 'none'
      },
      {
        name: '上限',
        type: 'line',
        data: confidenceUpper,
        lineStyle: {
          opacity: 0
        },
        areaStyle: {
          color: 'rgba(64, 158, 255, 0.2)'
        },
        stack: 'confidence',
        symbol: 'none'
      }
    ]
  };
  
  // 设置图表选项
  chart.setOption(option);
}

// 处理操作按钮点击
function handleAction(actionType) {
  emit('action-triggered', {
    type: actionType,
    data: props.trendData
  });
}

// 监听数据变化
watch(() => props.trendData, () => {
  updateChart();
}, { deep: true });

// 组件挂载后初始化图表
onMounted(() => {
  initChart();
});

// 组件卸载前销毁图表
onUnmounted(() => {
  if (chart) {
    chart.dispose();
    chart = null;
  }
  window.removeEventListener('resize', () => {
    chart && chart.resize();
  });
});
</script>

<style scoped>
.trend-prediction-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.trend-overview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.trend-indicator {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.confidence {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
}

.confidence .label {
  font-size: 14px;
  min-width: 60px;
}

.confidence :deep(.el-progress) {
  width: 120px;
}

.update-time {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.trend-chart-container {
  width: 100%;
  height: 300px;
  margin: 20px 0;
}

.trend-chart {
  width: 100%;
  height: 100%;
}

h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #303133;
}

.actions-section {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}
</style> 