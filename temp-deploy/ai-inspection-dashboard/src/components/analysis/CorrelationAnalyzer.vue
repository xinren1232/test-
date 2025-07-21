<template>
  <div class="correlation-analyzer">
    <div class="analyzer-header">
      <h3>{{ title }}</h3>
      <div class="controls">
        <el-select v-model="selectedDataset" placeholder="选择数据集" size="small">
          <el-option label="物料参数相关性" value="material"></el-option>
          <el-option label="供应商质量相关性" value="supplier"></el-option>
          <el-option label="批次参数相关性" value="batch"></el-option>
        </el-select>
        <el-button type="primary" size="small" @click="analyzeCorrelation" :loading="loading">
          <el-icon><DataAnalysis /></el-icon> 分析相关性
        </el-button>
      </div>
    </div>
    
    <div class="chart-container" ref="chartContainer"></div>
    
    <div v-if="correlationInsights.length" class="insights-container">
      <h4>相关性洞察</h4>
      <div class="insights-list">
        <div v-for="(insight, index) in correlationInsights" :key="index" class="insight-item">
          <el-icon><InfoFilled /></el-icon>
          <span>{{ insight }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts/core';
import { useIQEStore } from '../../stores';

// 数据存储
const store = useIQEStore();

// 属性定义
const props = defineProps({
  title: {
    type: String,
    default: '多参数相关性分析'
  },
  height: {
    type: String,
    default: '500px'
  }
});

// 状态定义
const chartContainer = ref(null);
const chart = ref(null);
const selectedDataset = ref('material');
const loading = ref(false);
const correlationData = ref([]);
const dimensions = ref([]);
const correlationInsights = ref([]);

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
      text: '点击"分析相关性"开始分析',
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

// 分析相关性
const analyzeCorrelation = async () => {
  loading.value = true;
  
  try {
    // 根据选择的数据集获取不同的数据
    let result = await calculateCorrelation(selectedDataset.value);
    correlationData.value = result.data;
    dimensions.value = result.dimensions;
    correlationInsights.value = result.insights;
    
    // 渲染相关性热力图
    renderCorrelationHeatmap();
  } catch (error) {
    console.error('计算相关性时出错:', error);
  } finally {
    loading.value = false;
  }
};

// 计算相关性
const calculateCorrelation = async (datasetType) => {
  // 模拟异步操作
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  let data = [];
  let dimensions = [];
  let insights = [];
  
  switch (datasetType) {
    case 'material':
      // 物料参数相关性
      dimensions = ['耐磨性', '附着力', '透光率', '耐化学性', '硬度', '强度', '平整度'];
      
      // 生成相关性矩阵(示例数据)
      data = [
        [1.0, 0.72, 0.28, 0.65, 0.34, 0.18, 0.12],
        [0.72, 1.0, 0.31, 0.61, 0.41, 0.23, 0.21],
        [0.28, 0.31, 1.0, 0.43, 0.57, 0.31, 0.08],
        [0.65, 0.61, 0.43, 1.0, 0.38, 0.25, 0.14],
        [0.34, 0.41, 0.57, 0.38, 1.0, 0.68, 0.52],
        [0.18, 0.23, 0.31, 0.25, 0.68, 1.0, 0.76],
        [0.12, 0.21, 0.08, 0.14, 0.52, 0.76, 1.0]
      ];
      
      insights = [
        '耐磨性和附着力存在强相关性(0.72)，可能由相同的材料特性决定',
        '硬度和强度高度相关(0.68)，这符合材料学理论预期',
        '透光率与其他参数相关性较弱，可以作为独立质量参数考虑',
        '平整度与强度的关联度(0.76)最高，建议联合控制这两个参数'
      ];
      break;
      
    case 'supplier':
      // 供应商质量相关性
      dimensions = ['质量评分', '返修率', '及时交付', '价格稳定性', '响应速度', '技术能力', '合规性'];
      
      // 生成相关性矩阵(示例数据)
      data = [
        [1.0, -0.82, 0.67, 0.47, 0.58, 0.76, 0.62],
        [-0.82, 1.0, -0.51, -0.32, -0.48, -0.65, -0.53],
        [0.67, -0.51, 1.0, 0.45, 0.72, 0.53, 0.46],
        [0.47, -0.32, 0.45, 1.0, 0.38, 0.41, 0.34],
        [0.58, -0.48, 0.72, 0.38, 1.0, 0.61, 0.54],
        [0.76, -0.65, 0.53, 0.41, 0.61, 1.0, 0.69],
        [0.62, -0.53, 0.46, 0.34, 0.54, 0.69, 1.0]
      ];
      
      insights = [
        '质量评分与返修率呈强负相关(-0.82)，表明评分指标确实反映了质量表现',
        '响应速度与及时交付高度相关(0.72)，表明供应商的流程效率普遍一致',
        '技术能力与质量评分正相关(0.76)，可作为早期供应商评估的重要指标',
        '合规性与技术能力相关度较高(0.69)，表明技术先进的供应商更注重合规'
      ];
      break;
      
    case 'batch':
      // 批次参数相关性
      dimensions = ['不良率', '抽样比例', '批次规模', '生产速度', '工艺变更', '原材料批次', '环境温度'];
      
      // 生成相关性矩阵(示例数据)
      data = [
        [1.0, -0.42, 0.28, 0.53, 0.76, 0.62, 0.47],
        [-0.42, 1.0, -0.15, -0.22, -0.38, -0.27, -0.18],
        [0.28, -0.15, 1.0, 0.31, 0.25, 0.22, 0.17],
        [0.53, -0.22, 0.31, 1.0, 0.58, 0.44, 0.36],
        [0.76, -0.38, 0.25, 0.58, 1.0, 0.65, 0.52],
        [0.62, -0.27, 0.22, 0.44, 0.65, 1.0, 0.41],
        [0.47, -0.18, 0.17, 0.36, 0.52, 0.41, 1.0]
      ];
      
      insights = [
        '工艺变更与不良率高度相关(0.76)，建议严格控制工艺变更管理',
        '原材料批次与不良率显著相关(0.62)，需加强原材料质量控制',
        '增加抽样比例可能降低不良率(-0.42)，但相关性不够强，表示可能存在其他关键因素',
        '生产速度与不良率中度相关(0.53)，可能存在最佳生产速度区间'
      ];
      break;
  }
  
  return { data, dimensions, insights };
};

// 渲染相关性热力图
const renderCorrelationHeatmap = () => {
  if (!chart.value) return;
  
  const data = correlationData.value;
  const dims = dimensions.value;
  
  // 转换数据格式为ECharts所需的格式
  let seriesData = [];
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      seriesData.push([i, j, data[i][j].toFixed(2)]);
    }
  }
  
  // 设置热力图选项
  const option = {
    tooltip: {
      position: 'top',
      formatter: function (params) {
        return `${dims[params.data[0]]} 与 ${dims[params.data[1]]} 的相关性: ${params.data[2]}`;
      }
    },
    grid: {
      top: 60,
      bottom: 50,
      left: 90,
      right: 80
    },
    xAxis: {
      type: 'category',
      data: dims,
      splitArea: {
        show: true
      },
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'category',
      data: dims,
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: -1,
      max: 1,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      inRange: {
        color: ['#3060cf', '#eee', '#c1403d']
      },
      text: ['高正相关', '高负相关'],
      textStyle: {
        color: '#333'
      }
    },
    series: [{
      name: '相关性系数',
      type: 'heatmap',
      data: seriesData,
      label: {
        show: true
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
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

// 监听数据集变化
watch(selectedDataset, () => {
  correlationData.value = [];
  dimensions.value = [];
  correlationInsights.value = [];
  renderEmptyChart();
});

// 组件挂载后初始化图表
onMounted(() => {
  nextTick(() => {
    initChart();
  });
});
</script>

<style scoped>
.correlation-analyzer {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 16px;
}

.analyzer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.analyzer-header h3 {
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

.insights-container {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.insights-container h4 {
  font-size: 14px;
  margin: 0 0 12px 0;
  color: #303133;
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}

.insight-item .el-icon {
  color: #409EFF;
  margin-top: 2px;
}
</style> 