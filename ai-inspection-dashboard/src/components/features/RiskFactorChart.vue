<template>
  <div class="risk-factor-chart">
    <div class="chart-header">
      <h3>{{ title }}</h3>
      <div class="risk-score">
        风险评分: <span class="score" :class="riskScoreClass">{{ riskScore }}</span>
      </div>
    </div>
    <div class="chart-container" ref="chartContainer"></div>
    <div class="risk-recommendations" v-if="recommendations && recommendations.length">
      <h4>风险缓解建议</h4>
      <div class="recommendations-list">
        <div 
          v-for="(recommendation, index) in recommendations" 
          :key="index" 
          class="recommendation-item"
          :class="'priority-' + recommendation.priority.toLowerCase()"
        >
          <div class="recommendation-header">
            <div class="priority-tag">{{ recommendation.priority }}</div>
            <div class="recommendation-title">{{ recommendation.title }}</div>
          </div>
          <div class="recommendation-description">
            {{ recommendation.description }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick, computed } from 'vue';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { 
  TitleComponent, 
  TooltipComponent, 
  GridComponent, 
  LegendComponent 
} from 'echarts/components';

// 注册必须的组件
echarts.use([
  BarChart,
  CanvasRenderer,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
]);

const props = defineProps({
  // 图表标题
  title: {
    type: String,
    default: '风险因子分析'
  },
  // 风险分析数据
  riskData: {
    type: Object,
    required: true
  },
  // 图表高度
  height: {
    type: String,
    default: '300px'
  }
});

// 引用和状态
const chartContainer = ref(null);
const chart = ref(null);

// 计算属性
const riskFactors = computed(() => {
  if (!props.riskData || !props.riskData.riskFactors) return [];
  return props.riskData.riskFactors;
});

const recommendations = computed(() => {
  if (!props.riskData || !props.riskData.recommendations) return [];
  return props.riskData.recommendations;
});

const riskScore = computed(() => {
  if (!props.riskData || !props.riskData.riskScore) return '无';
  return props.riskData.riskScore;
});

const riskScoreClass = computed(() => {
  const score = Number(riskScore.value);
  if (isNaN(score)) return '';
  
  if (score >= 85) return 'score-high';
  if (score >= 70) return 'score-medium';
  return 'score-low';
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
  if (!chart.value || !riskFactors.value || riskFactors.value.length === 0) return;
  
  // 准备数据
  const categories = riskFactors.value.map(item => item.name);
  const values = riskFactors.value.map(item => item.value);
  const colors = riskFactors.value.map(item => item.color || '#409EFF');
  const descriptions = riskFactors.value.map(item => item.description || '');
  
  // 设置图表选项
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params) {
        const index = params[0].dataIndex;
        return `<div>
          <strong>${categories[index]}</strong><br/>
          风险值: ${values[index]}<br/>
          ${descriptions[index] || ''}
        </div>`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '风险值',
      max: 100,
      axisLabel: {
        formatter: '{value}'
      }
    },
    yAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        formatter: function(value) {
          // 如果名称太长，则截断并添加省略号
          if (value.length > 10) {
            return value.substring(0, 10) + '...';
          }
          return value;
        }
      }
    },
    series: [
      {
        name: '风险值',
        type: 'bar',
        data: values.map((value, index) => {
          return {
            value: value,
            itemStyle: {
              color: colors[index]
            }
          };
        }),
        label: {
          show: true,
          position: 'right',
          formatter: '{c}'
        },
        barWidth: '60%'
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

// 监听数据变化
watch(() => props.riskData, () => {
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
.risk-factor-chart {
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

.risk-score {
  font-size: 14px;
  color: #606266;
}

.score {
  font-weight: 600;
  font-size: 16px;
}

.score-high {
  color: #F56C6C;
}

.score-medium {
  color: #E6A23C;
}

.score-low {
  color: #67C23A;
}

.chart-container {
  width: 100%;
  height: v-bind('props.height');
}

.risk-recommendations {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.risk-recommendations h4 {
  font-size: 14px;
  margin: 0 0 12px 0;
  color: #303133;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommendation-item {
  background-color: #f8f9fc;
  border-radius: 6px;
  padding: 12px;
  border-left: 4px solid #ddd;
}

.recommendation-item.priority-高 {
  border-left-color: #F56C6C;
}

.recommendation-item.priority-中 {
  border-left-color: #E6A23C;
}

.recommendation-item.priority-低 {
  border-left-color: #67C23A;
}

.recommendation-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.priority-tag {
  background-color: #eee;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.priority-高 .priority-tag {
  background-color: rgba(245, 108, 108, 0.1);
  color: #F56C6C;
}

.priority-中 .priority-tag {
  background-color: rgba(230, 162, 60, 0.1);
  color: #E6A23C;
}

.priority-低 .priority-tag {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67C23A;
}

.recommendation-title {
  font-weight: 500;
  font-size: 14px;
  color: #303133;
}

.recommendation-description {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}
</style> 