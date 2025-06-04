<template>
  <div class="batch-comparison-radar">
    <div class="chart-header">
      <h3>{{ title }}</h3>
      <div class="batch-selection">
        <el-checkbox-group v-model="selectedBatches">
          <el-checkbox v-for="batch in availableBatches" :key="batch" :label="batch">
            {{ batch }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </div>
    <div class="chart-container" ref="chartContainer"></div>
    <div class="chart-legend">
      <div class="legend-item" v-for="(color, key) in colorMap" :key="key">
        <span class="color-dot" :style="{ backgroundColor: color }"></span>
        <span class="legend-label">{{ key }}</span>
      </div>
    </div>
    <div class="chart-analysis" v-if="analysisText">
      <h4>批次分析:</h4>
      <p>{{ analysisText }}</p>
      <div class="insights" v-if="insights && insights.length">
        <h4>关键发现:</h4>
        <ul>
          <li v-for="(insight, index) in insights" :key="index">{{ insight }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts/core';
import { RadarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';

// 注册必须的组件
echarts.use([
  RadarChart,
  CanvasRenderer,
  TitleComponent,
  TooltipComponent,
  LegendComponent
]);

const props = defineProps({
  // 标题
  title: {
    type: String,
    default: '批次质量参数对比'
  },
  // 批次数据，格式为 { standard: {参数1: 值, 参数2: 值}, 批次1: {参数1: 值, 参数2: 值} }
  batchData: {
    type: Object,
    required: true
  },
  // 可用批次列表
  availableBatches: {
    type: Array,
    default: () => []
  },
  // 分析文本
  analysisText: {
    type: String,
    default: ''
  },
  // 关键发现
  insights: {
    type: Array,
    default: () => []
  },
  // 高度
  height: {
    type: String,
    default: '400px'
  }
});

// 颜色映射
const colorMap = {
  'standard': '#409EFF',
  '#03, #04': '#F56C6C',
  '#B12, #B13': '#E6A23C',
  '#C09': '#67C23A',
  '#A22, #A23': '#F56C6C',
  '#B15, #B16': '#E6A23C',
  '#C12': '#67C23A',
};

// 引用和状态
const chartContainer = ref(null);
const chart = ref(null);
const selectedBatches = ref(['standard']);

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
  if (!chart.value || !props.batchData) return;
  
  // 准备雷达图指示器
  const indicator = [];
  const standardData = props.batchData.standard || {};
  
  // 从标准数据中提取指标
  Object.keys(standardData).forEach(key => {
    indicator.push({ name: key, max: 100 });
  });
  
  // 准备数据系列
  const series = [{
    type: 'radar',
    data: []
  }];
  
  // 添加所选批次的数据
  selectedBatches.value.forEach(batch => {
    if (props.batchData[batch]) {
      // 构建该批次的数据点
      const dataPoints = Object.keys(standardData).map(key => props.batchData[batch][key] || 0);
      
      // 添加到系列中
      series[0].data.push({
        value: dataPoints,
        name: batch,
        areaStyle: {
          opacity: batch === 'standard' ? 0.1 : 0.3
        },
        lineStyle: {
          width: batch === 'standard' ? 2 : 1.5,
          type: batch === 'standard' ? 'solid' : 'solid'
        },
        itemStyle: {
          color: colorMap[batch] || '#409EFF'
        },
        symbolSize: 6
      });
    }
  });
  
  // 设置图表选项
  const option = {
    tooltip: {
      trigger: 'item'
    },
    radar: {
      indicator: indicator,
      center: ['50%', '50%'],
      radius: '65%',
      splitNumber: 5,
      shape: 'circle',
      axisName: {
        color: '#666',
        fontSize: 12
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(250,250,250,0.3)', 'rgba(200,200,200,0.1)']
        }
      },
      splitLine: {
        lineStyle: {
          color: ['#ddd']
        }
      },
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      }
    },
    series: series
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

// 监听所选批次变化
watch(selectedBatches, () => {
  nextTick(() => {
    updateChart();
  });
});

// 监听数据变化
watch(() => props.batchData, () => {
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
.batch-comparison-radar {
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

.batch-selection {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chart-container {
  width: 100%;
  height: v-bind('props.height');
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.legend-label {
  font-size: 13px;
  color: #606266;
}

.chart-analysis {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.chart-analysis h4 {
  font-size: 14px;
  margin: 0 0 8px 0;
  color: #303133;
}

.chart-analysis p {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  margin: 0;
}

.insights {
  margin-top: 12px;
}

.insights ul {
  padding-left: 20px;
  margin: 8px 0 0 0;
}

.insights li {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}
</style> 