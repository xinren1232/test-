<template>
  <div class="chart-generator">
    <div class="chart-toolbar">
      <div class="chart-type-selector">
        <span class="toolbar-label">图表类型：</span>
        <el-radio-group v-model="chartType" size="small" @change="generateChart">
          <el-radio-button label="line">折线图</el-radio-button>
          <el-radio-button label="bar">柱状图</el-radio-button>
          <el-radio-button label="pie">饼图</el-radio-button>
          <el-radio-button label="scatter">散点图</el-radio-button>
          <el-radio-button label="radar">雷达图</el-radio-button>
        </el-radio-group>
      </div>
      
      <div class="chart-actions">
        <el-button size="small" @click="refreshChart">
          <el-icon><el-icon-refresh /></el-icon>
        </el-button>
        <el-button size="small" @click="showDataPanel = !showDataPanel">
          <el-icon><el-icon-document /></el-icon> 编辑数据
        </el-button>
        <el-dropdown @command="exportChart">
          <el-button size="small">
            导出 <el-icon class="el-icon--right"><el-icon-arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="png">PNG图片</el-dropdown-item>
              <el-dropdown-item command="svg">SVG图片</el-dropdown-item>
              <el-dropdown-item command="json">JSON数据</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 数据编辑面板 -->
    <div v-if="showDataPanel" class="data-panel">
      <div class="panel-header">
        <h3>图表数据编辑</h3>
        <el-button size="small" type="primary" @click="applyDataChanges">
          应用更改
        </el-button>
      </div>

      <el-tabs v-model="activeDataTab">
        <el-tab-pane label="维度数据" name="dimensions">
          <div class="dimensions-editor">
            <p class="edit-hint">维度数据（如时间、分类等）</p>
            <div class="dimension-list">
              <div 
                v-for="(dimension, index) in chartData.dimensions" 
                :key="`dim-${index}`"
                class="dimension-item"
              >
                <el-input 
                  v-model="chartData.dimensions[index]" 
                  size="small" 
                  placeholder="输入维度名称"
                />
                <el-button 
                  type="danger" 
                  size="small" 
                  icon="el-icon-delete" 
                  @click="removeDimension(index)"
                  circle
                  plain
                >
                  <el-icon><el-icon-delete /></el-icon>
                </el-button>
              </div>
            </div>
            
            <el-button size="small" @click="addDimension" type="primary" plain>
              <el-icon><el-icon-plus /></el-icon> 添加维度
            </el-button>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="系列数据" name="series">
          <div class="series-editor">
            <p class="edit-hint">系列数据（如各指标数值）</p>
            <div v-for="(series, seriesIndex) in chartData.series" :key="`series-${seriesIndex}`" class="series-container">
              <div class="series-header">
                <el-input 
                  v-model="chartData.series[seriesIndex].name" 
                  size="small" 
                  placeholder="系列名称"
                />
                <el-color-picker 
                  v-model="chartData.series[seriesIndex].color" 
                  size="small"
                />
                <el-select 
                  v-model="chartData.series[seriesIndex].type" 
                  size="small" 
                  placeholder="图表类型"
                >
                  <el-option label="折线图" value="line" />
                  <el-option label="柱状图" value="bar" />
                  <el-option label="散点图" value="scatter" />
                </el-select>
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="removeSeries(seriesIndex)" 
                  circle
                  plain
                >
                  <el-icon><el-icon-delete /></el-icon>
                </el-button>
              </div>
              
              <div class="series-data">
                <div 
                  v-for="(value, valueIndex) in series.data" 
                  :key="`value-${seriesIndex}-${valueIndex}`"
                  class="data-item"
                >
                  <span class="dim-label" v-if="chartData.dimensions[valueIndex]">
                    {{ chartData.dimensions[valueIndex] }}:
                  </span>
                  <el-input-number 
                    v-model="chartData.series[seriesIndex].data[valueIndex]" 
                    :controls="false"
                    size="small"
                  />
                </div>
              </div>
            </div>
            
            <el-button size="small" @click="addSeries" type="primary" plain>
              <el-icon><el-icon-plus /></el-icon> 添加系列
            </el-button>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="图表设置" name="settings">
          <div class="chart-settings">
            <div class="setting-item">
              <span class="setting-label">标题：</span>
              <el-input v-model="chartOptions.title" size="small" placeholder="图表标题" />
            </div>
            
            <div class="setting-item">
              <span class="setting-label">子标题：</span>
              <el-input v-model="chartOptions.subtitle" size="small" placeholder="图表子标题" />
            </div>
            
            <div class="setting-item">
              <span class="setting-label">X轴标题：</span>
              <el-input v-model="chartOptions.xAxisName" size="small" placeholder="X轴标题" />
            </div>
            
            <div class="setting-item">
              <span class="setting-label">Y轴标题：</span>
              <el-input v-model="chartOptions.yAxisName" size="small" placeholder="Y轴标题" />
            </div>
            
            <div class="setting-item">
              <el-checkbox v-model="chartOptions.showLegend">显示图例</el-checkbox>
            </div>
            
            <div class="setting-item">
              <el-checkbox v-model="chartOptions.showDataLabels">显示数据标签</el-checkbox>
            </div>
            
            <div class="setting-item">
              <el-checkbox v-model="chartOptions.enableZoom">启用缩放功能</el-checkbox>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 图表展示区域 -->
    <div class="chart-container" ref="chartContainer">
      <div ref="chartRef" class="chart"></div>
      <div v-if="isLoading" class="chart-loading">
        <el-icon class="loading-icon"><el-icon-loading /></el-icon>
        <span>加载中...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({
      dimensions: [],
      series: []
    })
  },
  initialType: {
    type: String,
    default: 'line'
  },
  height: {
    type: String,
    default: '400px'
  },
  theme: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['chart-updated', 'data-changed']);

// 图表相关
const chartRef = ref(null);
const chartContainer = ref(null);
const chartInstance = ref(null);
const chartType = ref(props.initialType);
const isLoading = ref(false);

// 数据面板相关
const showDataPanel = ref(false);
const activeDataTab = ref('dimensions');

// 图表数据
const chartData = reactive({
  dimensions: [...(props.initialData.dimensions || ['类别A', '类别B', '类别C', '类别D', '类别E'])],
  series: [...(props.initialData.series || [
    {
      name: '系列1',
      type: 'line',
      color: '#5470c6',
      data: [120, 200, 150, 80, 70]
    },
    {
      name: '系列2',
      type: 'bar',
      color: '#91cc75',
      data: [60, 80, 240, 100, 150]
    }
  ])]
});

// 图表选项
const chartOptions = reactive({
  title: '数据分析图表',
  subtitle: '',
  xAxisName: '',
  yAxisName: '',
  showLegend: true,
  showDataLabels: false,
  enableZoom: false
});

// 初始化图表
onMounted(() => {
  initChart();
  window.addEventListener('resize', resizeChart);
});

// 清理事件监听
onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.dispose();
  }
  window.removeEventListener('resize', resizeChart);
});

// 监听图表类型变化
watch(chartType, (newType) => {
  generateChart();
});

// 初始化图表
function initChart() {
  if (!chartRef.value) return;
  
  // 销毁旧实例
  if (chartInstance.value) {
    chartInstance.value.dispose();
  }
  
  // 创建图表实例
  chartInstance.value = echarts.init(chartRef.value, props.theme);
  
  // 生成图表
  generateChart();
  
  // 添加点击事件
  chartInstance.value.on('click', handleChartClick);
}

// 生成图表配置
function generateChartOptions() {
  const options = {
    title: {
      text: chartOptions.title,
      subtext: chartOptions.subtitle
    },
    tooltip: {
      trigger: chartType.value === 'pie' ? 'item' : 'axis',
      formatter: chartType.value === 'pie' 
        ? '{a} <br/>{b}: {c} ({d}%)'
        : undefined
    },
    legend: {
      show: chartOptions.showLegend,
      type: chartData.series.length > 10 ? 'scroll' : 'plain'
    },
    toolbox: {
      feature: {
        saveAsImage: {},
        dataZoom: chartOptions.enableZoom ? { show: true } : { show: false },
        restore: {},
      }
    }
  };
  
  // 根据图表类型添加不同的配置
  if (chartType.value === 'pie') {
    options.series = [{
      name: chartOptions.title,
      type: 'pie',
      radius: '60%',
      center: ['50%', '50%'],
      data: chartData.dimensions.map((dim, index) => ({
        name: dim,
        value: chartData.series[0]?.data[index] || 0,
        itemStyle: {
          color: chartData.series[0]?.color
        }
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      label: {
        show: chartOptions.showDataLabels,
        formatter: '{b}: {c} ({d}%)'
      }
    }];
  } else if (chartType.value === 'radar') {
    options.radar = {
      indicator: chartData.dimensions.map((dim, index) => {
        // 计算所有系列在该维度上的最大值作为雷达图的上限
        const max = Math.max(...chartData.series.map(s => s.data[index] || 0)) * 1.2;
        return { name: dim, max: max > 0 ? max : 100 };
      })
    };
    
    options.series = [{
      type: 'radar',
      data: chartData.series.map(s => ({
        name: s.name,
        value: s.data,
        itemStyle: { color: s.color },
        lineStyle: { color: s.color },
        areaStyle: { color: s.color, opacity: 0.3 }
      }))
    }];
  } else {
    // 折线图、柱状图和散点图的公共配置
    options.xAxis = {
      type: 'category',
      name: chartOptions.xAxisName,
      data: chartData.dimensions,
      axisLabel: {
        rotate: chartData.dimensions.length > 6 ? 45 : 0
      }
    };
    
    options.yAxis = {
      type: 'value',
      name: chartOptions.yAxisName
    };
    
    options.series = chartData.series.map(s => ({
      name: s.name,
      type: chartType.value === 'scatter' ? 'scatter' : (s.type || chartType.value),
      data: s.data,
      itemStyle: { color: s.color },
      label: {
        show: chartOptions.showDataLabels,
        position: 'top'
      }
    }));
  }
  
  // 添加数据缩放组件（仅对非饼图、雷达图启用）
  if (chartOptions.enableZoom && !['pie', 'radar'].includes(chartType.value)) {
    options.dataZoom = [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        type: 'slider',
        start: 0,
        end: 100
      }
    ];
  }
  
  return options;
}

// 生成图表
function generateChart() {
  if (!chartInstance.value) return;
  
  isLoading.value = true;
  
  nextTick(() => {
    const options = generateChartOptions();
    chartInstance.value.setOption(options, true);
    isLoading.value = false;
    emit('chart-updated', { 
      type: chartType.value, 
      options: options 
    });
  });
}

// 刷新图表
function refreshChart() {
  generateChart();
}

// 处理图表点击事件
function handleChartClick(params) {
  console.log('图表点击事件:', params);
  // 这里可以添加钻取逻辑
  // 例如，显示详细信息弹窗
}

// 调整图表大小
function resizeChart() {
  if (chartInstance.value) {
    chartInstance.value.resize();
  }
}

// 导出图表
function exportChart(type) {
  if (!chartInstance.value) return;
  
  switch (type) {
    case 'png':
      const url = chartInstance.value.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#fff'
      });
      downloadImage(url, 'chart.png');
      break;
    case 'svg':
      const svgUrl = chartInstance.value.getDataURL({
        type: 'svg',
        pixelRatio: 1,
        backgroundColor: '#fff'
      });
      downloadImage(svgUrl, 'chart.svg');
      break;
    case 'json':
      const jsonData = {
        type: chartType.value,
        data: chartData,
        options: chartOptions
      };
      const jsonStr = JSON.stringify(jsonData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const jsonUrl = URL.createObjectURL(blob);
      downloadFile(jsonUrl, 'chart-data.json');
      break;
  }
}

// 下载图片
function downloadImage(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 下载文件
function downloadFile(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 添加维度
function addDimension() {
  chartData.dimensions.push(`类别${chartData.dimensions.length + 1}`);
  
  // 为所有系列添加空数据点
  chartData.series.forEach(series => {
    series.data.push(0);
  });
}

// 删除维度
function removeDimension(index) {
  if (chartData.dimensions.length <= 2) {
    ElMessage.warning('至少保留两个维度');
    return;
  }
  
  chartData.dimensions.splice(index, 1);
  
  // 移除所有系列相应索引的数据点
  chartData.series.forEach(series => {
    series.data.splice(index, 1);
  });
}

// 添加系列
function addSeries() {
  const colors = [
    '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
    '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'
  ];
  const newSeriesColor = colors[chartData.series.length % colors.length];
  
  chartData.series.push({
    name: `系列${chartData.series.length + 1}`,
    type: chartType.value,
    color: newSeriesColor,
    data: new Array(chartData.dimensions.length).fill(0)
  });
}

// 删除系列
function removeSeries(index) {
  if (chartData.series.length <= 1) {
    ElMessage.warning('至少保留一个数据系列');
    return;
  }
  
  chartData.series.splice(index, 1);
}

// 应用数据更改
function applyDataChanges() {
  generateChart();
  emit('data-changed', {
    dimensions: chartData.dimensions,
    series: chartData.series
  });
  ElMessage.success('数据已更新');
}

// 对外暴露方法
defineExpose({
  refreshChart,
  generateChart,
  exportChart,
  getChartData() {
    return {
      type: chartType.value,
      dimensions: chartData.dimensions,
      series: chartData.series
    };
  }
});
</script>

<style scoped>
.chart-generator {
  width: 100%;
}

.chart-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.chart-type-selector {
  display: flex;
  align-items: center;
}

.toolbar-label {
  margin-right: 10px;
  font-size: 14px;
  color: #606266;
}

.chart-container {
  position: relative;
  width: 100%;
  height: v-bind('props.height');
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.chart {
  width: 100%;
  height: 100%;
}

.chart-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 10;
}

.loading-icon {
  font-size: 24px;
  margin-bottom: 10px;
  color: #409EFF;
}

.data-panel {
  margin-bottom: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 15px;
  background-color: #f8f8f8;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.edit-hint {
  margin-bottom: 10px;
  font-size: 12px;
  color: #909399;
}

.dimension-list, .series-container {
  margin-bottom: 15px;
}

.dimension-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.dimension-item .el-input {
  width: 200px;
  margin-right: 10px;
}

.series-container {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
  background-color: #fff;
}

.series-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.series-header .el-input {
  width: 150px;
  margin-right: 10px;
}

.series-header .el-select {
  width: 120px;
  margin-right: 10px;
}

.series-data {
  display: flex;
  flex-wrap: wrap;
}

.data-item {
  display: flex;
  align-items: center;
  margin-right: 15px;
  margin-bottom: 10px;
}

.dim-label {
  margin-right: 5px;
  font-size: 12px;
  color: #606266;
  min-width: 60px;
}

.setting-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.setting-label {
  width: 80px;
  margin-right: 10px;
  font-size: 14px;
  color: #606266;
}
</style> 