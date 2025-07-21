<template>
  <div class="analysis-chart">
    <div class="chart-header">
      <h5>{{ title }}</h5>
      <el-button-group size="small" class="chart-controls">
        <el-button 
          v-for="type in chartTypes" 
          :key="type.value"
          :type="activeType === type.value ? 'primary' : ''"
          size="small"
          @click="changeChartType(type.value)"
        >
          {{ type.label }}
        </el-button>
      </el-button-group>
    </div>
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  title: {
    type: String,
    default: '数据分析'
  },
  data: {
    type: Object,
    default: () => ({})
  },
  type: {
    type: String,
    default: 'bar'
  }
});

const chartContainer = ref(null);
const chart = ref(null);
const activeType = ref(props.type);

const chartTypes = [
  { label: '柱状图', value: 'bar' },
  { label: '折线图', value: 'line' },
  { label: '饼图', value: 'pie' },
  { label: '雷达图', value: 'radar' }
];

// 初始化图表
const initChart = () => {
  if (chartContainer.value && !chart.value) {
    chart.value = echarts.init(chartContainer.value);
    updateChart();
  }
};

// 更新图表
const updateChart = () => {
  if (!chart.value || !props.data) return;

  let option = {};
  
  switch (activeType.value) {
    case 'bar':
      option = getBarOption();
      break;
    case 'line':
      option = getLineOption();
      break;
    case 'pie':
      option = getPieOption();
      break;
    case 'radar':
      option = getRadarOption();
      break;
  }

  chart.value.setOption(option, true);
};

// 柱状图配置
const getBarOption = () => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: props.data.categories || ['工厂A', '工厂B', '工厂C'],
    axisLabel: { fontSize: 10 }
  },
  yAxis: {
    type: 'value',
    axisLabel: { fontSize: 10 }
  },
  series: [{
    name: '质量指标',
    type: 'bar',
    data: props.data.values || [95.2, 92.8, 97.1],
    itemStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: '#409eff' },
        { offset: 1, color: '#67c23a' }
      ])
    }
  }]
});

// 折线图配置
const getLineOption = () => ({
  tooltip: {
    trigger: 'axis'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: props.data.timeline || ['1月', '2月', '3月', '4月', '5月', '6月'],
    axisLabel: { fontSize: 10 }
  },
  yAxis: {
    type: 'value',
    axisLabel: { fontSize: 10 }
  },
  series: [{
    name: '趋势',
    type: 'line',
    data: props.data.trend || [92, 94, 91, 95, 93, 96],
    smooth: true,
    lineStyle: { color: '#409eff' },
    areaStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
        { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
      ])
    }
  }]
});

// 饼图配置
const getPieOption = () => ({
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    textStyle: { fontSize: 10 }
  },
  series: [{
    name: '分布',
    type: 'pie',
    radius: ['40%', '70%'],
    center: ['60%', '50%'],
    data: props.data.distribution || [
      { value: 35, name: '正常' },
      { value: 25, name: '风险' },
      { value: 15, name: '冻结' },
      { value: 25, name: '其他' }
    ],
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    }
  }]
});

// 雷达图配置
const getRadarOption = () => ({
  tooltip: {},
  radar: {
    indicator: props.data.indicators || [
      { name: '质量', max: 100 },
      { name: '效率', max: 100 },
      { name: '成本', max: 100 },
      { name: '交期', max: 100 },
      { name: '服务', max: 100 }
    ],
    radius: '60%'
  },
  series: [{
    name: '评估',
    type: 'radar',
    data: [{
      value: props.data.radarValues || [95, 88, 92, 85, 90],
      name: '综合评分'
    }],
    areaStyle: {
      color: 'rgba(64, 158, 255, 0.3)'
    }
  }]
});

// 切换图表类型
const changeChartType = (type) => {
  activeType.value = type;
  updateChart();
};

// 监听数据变化
watch(() => props.data, () => {
  nextTick(() => {
    updateChart();
  });
}, { deep: true });

// 监听容器大小变化
const resizeChart = () => {
  if (chart.value) {
    chart.value.resize();
  }
};

onMounted(() => {
  nextTick(() => {
    initChart();
    window.addEventListener('resize', resizeChart);
  });
});

// 清理
const cleanup = () => {
  if (chart.value) {
    chart.value.dispose();
    chart.value = null;
  }
  window.removeEventListener('resize', resizeChart);
};

// 组件卸载时清理
import { onUnmounted } from 'vue';
onUnmounted(cleanup);
</script>

<style scoped>
.analysis-chart {
  margin-bottom: 16px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.chart-header h5 {
  margin: 0;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 600;
}

.chart-controls {
  display: flex;
}

.chart-container {
  height: 200px;
  width: 100%;
}
</style>
