<template>
  <div class="ai-data-visualizer">
    <!-- 图表容器 -->
    <div v-if="!loading && chartData" class="chart-container" :id="chartId"></div>
    
    <!-- 加载状态 -->
    <div v-else-if="loading" class="loading-container">
      <el-skeleton animated>
        <template #template>
          <div style="padding: 20px;">
            <el-skeleton-item variant="h3" style="width: 50%;" />
            <el-skeleton-item variant="text" style="margin-right: 16px; margin-top: 16px;" />
            <el-skeleton-item variant="text" style="margin-right: 16px; margin-top: 16px; width: 60%;" />
            <el-skeleton-item variant="text" style="margin-right: 16px; margin-top: 16px;" />
            <div style="margin-top: 20px; height: 200px;">
              <el-skeleton-item variant="image" style="width: 100%; height: 100%;" />
            </div>
          </div>
        </template>
      </el-skeleton>
    </div>
    
    <!-- 空状态 -->
    <div v-else class="empty-container">
      <el-empty description="暂无可视化数据" :image-size="64">
        <template #description>
          <p>{{ emptyDescription || '请先获取数据后查看可视化结果' }}</p>
        </template>
      </el-empty>
    </div>
    
    <!-- 图表配置面板 -->
    <div v-if="showSettings && chartInstance" class="chart-settings">
      <el-divider>图表设置</el-divider>
      <el-row :gutter="20">
        <!-- 图表类型选择 -->
        <el-col :span="12">
          <el-form-item label="图表类型">
            <el-select v-model="currentChartType" @change="updateChartType">
              <el-option v-for="type in availableChartTypes" :key="type.value" :label="type.label" :value="type.value" />
            </el-select>
          </el-form-item>
        </el-col>
        
        <!-- 主题选择 -->
        <el-col :span="12">
          <el-form-item label="主题">
            <el-radio-group v-model="currentTheme" size="small" @change="updateTheme">
              <el-radio-button label="default">默认</el-radio-button>
              <el-radio-button label="dark">暗色</el-radio-button>
              <el-radio-button label="vintage">复古</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      
      <!-- 数据展示设置 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="显示图例">
            <el-switch v-model="showLegend" @change="updateLegend" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="显示工具提示">
            <el-switch v-model="showTooltip" @change="updateTooltip" />
          </el-form-item>
        </el-col>
      </el-row>
    </div>
    
    <!-- 操作按钮 -->
    <div class="chart-actions">
      <el-button-group v-if="chartInstance">
        <el-tooltip content="下载图表" placement="top">
          <el-button size="small" @click="downloadChart">
            <el-icon><Download /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="全屏查看" placement="top">
          <el-button size="small" @click="toggleFullScreen">
            <el-icon><FullScreen /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="刷新数据" placement="top">
          <el-button size="small" @click="refreshChart">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="图表设置" placement="top">
          <el-button size="small" @click="showSettings = !showSettings">
            <el-icon><Setting /></el-icon>
          </el-button>
        </el-tooltip>
      </el-button-group>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { Download, FullScreen, Refresh, Setting } from '@element-plus/icons-vue';
import * as echarts from 'echarts/core';
import {
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent
} from 'echarts/components';
import {
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  RadarChart,
  GaugeChart
} from 'echarts/charts';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { v4 as uuidv4 } from 'uuid';

// 注册必要的ECharts组件
echarts.use([
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  RadarChart,
  GaugeChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
]);

// 主题定义
const themes = {
  default: null,
  dark: {
    backgroundColor: '#100C2A',
    textStyle: {
      color: '#D8DEE9'
    },
    title: {
      textStyle: {
        color: '#E5E9F0'
      }
    },
    legend: {
      textStyle: {
        color: '#D8DEE9'
      }
    },
    tooltip: {
      backgroundColor: 'rgba(30, 31, 48, 0.8)',
      textStyle: {
        color: '#D8DEE9'
      }
    },
    axisLine: {
      lineStyle: {
        color: '#434C5E'
      }
    },
    splitLine: {
      lineStyle: {
        color: '#2E3440'
      }
    },
    axisTick: {
      lineStyle: {
        color: '#D8DEE9'
      }
    },
    axisLabel: {
      textStyle: {
        color: '#D8DEE9'
      }
    }
  },
  vintage: {
    backgroundColor: '#FEF8EF',
    textStyle: {
      color: '#333333'
    },
    title: {
      textStyle: {
        color: '#8A6D3B'
      }
    },
    legend: {
      textStyle: {
        color: '#8A6D3B'
      }
    },
    tooltip: {
      backgroundColor: 'rgba(255, 248, 231, 0.9)',
      borderColor: '#D4B78F',
      textStyle: {
        color: '#5A4525'
      }
    },
    axisLine: {
      lineStyle: {
        color: '#BCA883'
      }
    },
    splitLine: {
      lineStyle: {
        color: '#E6D6BF'
      }
    },
    axisTick: {
      lineStyle: {
        color: '#BCA883'
      }
    },
    axisLabel: {
      textStyle: {
        color: '#8A6D3B'
      }
    }
  }
};

export default {
  name: 'AIDataVisualizer',
  
  components: {
    Download,
    FullScreen,
    Refresh,
    Setting
  },
  
  props: {
    // 图表数据，可以是完整的ECharts配置或简化数据
    chartData: {
      type: Object,
      default: null
    },
    // 图表类型
    chartType: {
      type: String,
      default: 'line'
    },
    // 图表高度
    height: {
      type: String,
      default: '400px'
    },
    // 空状态描述
    emptyDescription: {
      type: String,
      default: ''
    },
    // 是否显示加载状态
    loading: {
      type: Boolean,
      default: false
    },
    // 刷新数据的回调函数
    refreshCallback: {
      type: Function,
      default: null
    },
    // 图表标题
    title: {
      type: String,
      default: ''
    },
    // 是否响应式调整大小
    responsive: {
      type: Boolean,
      default: true
    }
  },
  
  emits: ['chart-rendered', 'chart-click', 'data-updated'],
  
  setup(props, { emit }) {
    // 生成唯一图表ID
    const chartId = `chart-${uuidv4()}`;
    const chartInstance = ref(null);
    const isFullScreen = ref(false);
    const showSettings = ref(false);
    const resizeObserver = ref(null);
    
    // 图表配置
    const currentChartType = ref(props.chartType);
    const currentTheme = ref('default');
    const showLegend = ref(true);
    const showTooltip = ref(true);
    
    // 可用图表类型
    const availableChartTypes = [
      { value: 'line', label: '折线图' },
      { value: 'bar', label: '柱状图' },
      { value: 'pie', label: '饼图' },
      { value: 'scatter', label: '散点图' },
      { value: 'radar', label: '雷达图' },
      { value: 'gauge', label: '仪表盘' }
    ];
    
    // 计算样式
    const chartStyle = computed(() => {
      return {
        height: props.height,
        width: '100%'
      };
    });
    
    // 初始化图表
    const initChart = () => {
      if (chartInstance.value) {
        chartInstance.value.dispose();
      }
      
      const dom = document.getElementById(chartId);
      if (!dom) return;
      
      chartInstance.value = echarts.init(dom);
      
      // 应用主题
      applyTheme();
      
      // 更新图表
      updateChart();
      
      // 注册点击事件
      chartInstance.value.on('click', params => {
        emit('chart-click', params);
      });
    };
    
    // 更新图表
    const updateChart = () => {
      if (!chartInstance.value || !props.chartData) return;
      
      // 根据是否提供完整配置处理数据
      const option = processChartData();
      
      // 应用选项并渲染图表
      if (option) {
        chartInstance.value.setOption(option, true);
        emit('chart-rendered', chartInstance.value);
      }
    };
    
    // 处理图表数据
    const processChartData = () => {
      if (!props.chartData) return null;
      
      // 如果提供了完整的ECharts配置，直接使用
      if (props.chartData.series) {
        const option = { ...props.chartData };
        
        // 应用当前设置
        if (!showLegend.value && option.legend) {
          option.legend.show = false;
        }
        
        if (!showTooltip.value && option.tooltip) {
          option.tooltip.show = false;
        }
        
        return option;
      }
      
      // 否则，根据简化数据构建配置
      const option = {
        title: {
          text: props.title || props.chartData.title,
          left: 'center'
        },
        tooltip: {
          trigger: currentChartType.value === 'pie' ? 'item' : 'axis',
          show: showTooltip.value
        },
        legend: {
          show: showLegend.value,
          orient: 'horizontal',
          bottom: '5%'
        },
        xAxis: currentChartType.value !== 'pie' && currentChartType.value !== 'radar' && currentChartType.value !== 'gauge'
          ? {
              type: props.chartData.xAxisType || 'category',
              data: props.chartData.xData || []
            }
          : undefined,
        yAxis: currentChartType.value !== 'pie' && currentChartType.value !== 'radar' && currentChartType.value !== 'gauge'
          ? {
              type: props.chartData.yAxisType || 'value',
              name: props.chartData.yAxisName || ''
            }
          : undefined,
        series: buildSeries()
      };
      
      // 添加雷达图特有配置
      if (currentChartType.value === 'radar' && props.chartData.indicators) {
        option.radar = {
          indicator: props.chartData.indicators
        };
      }
      
      return option;
    };
    
    // 构建系列数据
    const buildSeries = () => {
      if (!props.chartData) return [];
      
      // 处理数据系列
      if (props.chartData.series) {
        // 如果已提供系列数据，但可能需要调整类型
        return props.chartData.series.map(series => ({
          ...series,
          type: series.type || currentChartType.value
        }));
      }
      
      // 根据提供的数据集构建系列
      if (props.chartData.datasets) {
        return props.chartData.datasets.map(dataset => ({
          name: dataset.name,
          type: currentChartType.value,
          data: dataset.data,
          // 饼图特殊处理
          ...(currentChartType.value === 'pie' ? {
            radius: dataset.radius || '50%',
            center: dataset.center || ['50%', '50%'],
            label: {
              show: true,
              formatter: '{b}: {d}%'
            }
          } : {}),
          // 仪表盘特殊处理
          ...(currentChartType.value === 'gauge' ? {
            min: dataset.min || 0,
            max: dataset.max || 100,
            detail: {
              formatter: '{value}' + (dataset.unit || '')
            },
            axisLabel: {
              formatter: value => value + (dataset.unit || '')
            }
          } : {}),
          // 散点图特殊处理
          ...(currentChartType.value === 'scatter' ? {
            symbolSize: point => dataset.symbolSize || (point[2] ? point[2] : 10)
          } : {})
        }));
      }
      
      // 简单数据格式
      return [{
        type: currentChartType.value,
        data: props.chartData.data || [],
        name: props.chartData.name || ''
      }];
    };
    
    // 应用主题
    const applyTheme = () => {
      if (!chartInstance.value) return;
      
      const theme = themes[currentTheme.value];
      if (theme) {
        chartInstance.value.setOption({
          backgroundColor: theme.backgroundColor,
          textStyle: theme.textStyle,
          title: theme.title,
          legend: theme.legend,
          tooltip: theme.tooltip
        });
      } else {
        // 重置为默认主题
        chartInstance.value.setOption({
          backgroundColor: null,
          textStyle: null,
          title: { textStyle: null },
          legend: { textStyle: null },
          tooltip: { backgroundColor: null, textStyle: null }
        });
      }
    };
    
    // 更新图表类型
    const updateChartType = () => {
      if (chartInstance.value) {
        updateChart();
      }
    };
    
    // 更新主题
    const updateTheme = () => {
      applyTheme();
      updateChart();
    };
    
    // 更新图例显示
    const updateLegend = () => {
      if (chartInstance.value) {
        chartInstance.value.setOption({
          legend: { show: showLegend.value }
        });
      }
    };
    
    // 更新提示工具显示
    const updateTooltip = () => {
      if (chartInstance.value) {
        chartInstance.value.setOption({
          tooltip: { show: showTooltip.value }
        });
      }
    };
    
    // 下载图表
    const downloadChart = () => {
      if (!chartInstance.value) return;
      
      try {
        // 获取Base64编码的图表图片
        const imgData = chartInstance.value.getDataURL({
          pixelRatio: 2,
          backgroundColor: '#fff'
        });
        
        // 创建临时链接并模拟点击下载
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `chart-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        ElMessage.success('图表已成功下载');
      } catch (error) {
        console.error('下载图表失败:', error);
        ElMessage.error('下载图表失败');
      }
    };
    
    // 切换全屏
    const toggleFullScreen = () => {
      const chartContainer = document.getElementById(chartId);
      if (!chartContainer) return;
      
      isFullScreen.value = !isFullScreen.value;
      
      if (isFullScreen.value) {
        if (chartContainer.requestFullscreen) {
          chartContainer.requestFullscreen();
        } else if (chartContainer.webkitRequestFullscreen) {
          chartContainer.webkitRequestFullscreen();
        } else if (chartContainer.msRequestFullscreen) {
          chartContainer.msRequestFullscreen();
        }
        
        document.addEventListener('fullscreenchange', exitFullScreenHandler);
        document.addEventListener('webkitfullscreenchange', exitFullScreenHandler);
        document.addEventListener('mozfullscreenchange', exitFullScreenHandler);
        document.addEventListener('MSFullscreenChange', exitFullScreenHandler);
      } else {
        exitFullScreen();
      }
    };
    
    // 退出全屏处理程序
    const exitFullScreenHandler = () => {
      if (
        !document.fullscreenElement &&
        !document.webkitFullscreenElement &&
        !document.mozFullScreenElement &&
        !document.msFullscreenElement
      ) {
        isFullScreen.value = false;
        // 处理退出全屏后的调整
        nextTick(() => {
          resizeChart();
        });
        
        // 移除事件监听器
        document.removeEventListener('fullscreenchange', exitFullScreenHandler);
        document.removeEventListener('webkitfullscreenchange', exitFullScreenHandler);
        document.removeEventListener('mozfullscreenchange', exitFullScreenHandler);
        document.removeEventListener('MSFullscreenChange', exitFullScreenHandler);
      }
    };
    
    // 退出全屏
    const exitFullScreen = () => {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    };
    
    // 刷新图表
    const refreshChart = () => {
      if (props.refreshCallback) {
        props.refreshCallback();
      } else {
        updateChart();
      }
    };
    
    // 调整图表大小
    const resizeChart = () => {
      if (chartInstance.value) {
        chartInstance.value.resize();
      }
    };
    
    // 监听属性变化
    watch(() => props.chartData, () => {
      nextTick(() => {
        updateChart();
        emit('data-updated', props.chartData);
      });
    }, { deep: true });
    
    watch(() => props.chartType, (newType) => {
      currentChartType.value = newType;
      updateChartType();
    });
    
    // 生命周期钩子
    onMounted(() => {
      nextTick(() => {
        initChart();
        
        // 设置自动调整大小
        if (props.responsive) {
          window.addEventListener('resize', resizeChart);
          
          // 使用ResizeObserver监听容器大小变化
          if (window.ResizeObserver) {
            const chartContainer = document.getElementById(chartId);
            if (chartContainer) {
              resizeObserver.value = new ResizeObserver(() => {
                resizeChart();
              });
              resizeObserver.value.observe(chartContainer);
            }
          }
        }
      });
    });
    
    onBeforeUnmount(() => {
      // 清理事件监听器
      window.removeEventListener('resize', resizeChart);
      
      // 清理ResizeObserver
      if (resizeObserver.value) {
        resizeObserver.value.disconnect();
      }
      
      // 销毁图表实例
      if (chartInstance.value) {
        chartInstance.value.dispose();
      }
    });
    
    return {
      chartId,
      chartInstance,
      chartStyle,
      isFullScreen,
      showSettings,
      currentChartType,
      currentTheme,
      showLegend,
      showTooltip,
      availableChartTypes,
      
      // 方法
      updateChartType,
      updateTheme,
      updateLegend,
      updateTooltip,
      downloadChart,
      toggleFullScreen,
      refreshChart
    };
  }
};
</script>

<style>
.ai-data-visualizer {
  position: relative;
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
}

.chart-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
}

.loading-container, .empty-container {
  width: 100%;
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  opacity: 0.6;
  transition: opacity 0.3s;
}

.chart-actions:hover {
  opacity: 1;
}

.chart-settings {
  margin-top: 15px;
  padding: 15px;
  border-radius: 4px;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
}

.ai-data-visualizer:fullscreen {
  background-color: #fff;
  padding: 20px;
}

.ai-data-visualizer:fullscreen .chart-container {
  height: 90vh;
}

.el-form-item {
  margin-bottom: 12px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.chart-container {
  animation: fadeIn 0.5s ease-in-out;
}
</style> 