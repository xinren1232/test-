<template>
  <div class="chart-container">
    <v-chart class="chart" :option="chartOption" autoresize />
    <div class="chart-actions" v-if="showActions">
      <el-button size="small" @click="downloadChart" type="primary">
        <el-icon><el-icon-download /></el-icon> 导出
      </el-button>
      <el-button size="small" @click="$emit('insert-chart')" type="success">
        <el-icon><el-icon-picture /></el-icon> 插入对话
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, toRaw } from 'vue';
import { ElMessage } from 'element-plus';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import VChart from 'vue-echarts';

// 注册必要的组件
use([CanvasRenderer, PieChart, TitleComponent, TooltipComponent, LegendComponent]);

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: '物料类别分布'
  },
  showActions: {
    type: Boolean,
    default: true
  },
  colorPalette: {
    type: Array,
    default: () => [
      '#5470c6', '#91cc75', '#fac858', '#ee6666', 
      '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'
    ]
  }
});

const emit = defineEmits(['insert-chart']);

// 计算图表选项
const chartOption = computed(() => {
  // 检查数据格式，预期为 [{name: 'xxx', value: 123}, ...]
  if (!props.data || !props.data.length) {
    return {
      title: {
        text: props.title,
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      series: [
        {
          name: props.title,
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [{ name: '暂无数据', value: 100 }]
        }
      ]
    };
  }

  // 有数据时的配置
  return {
    title: {
      text: props.title,
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    color: props.colorPalette,
    series: [
      {
        name: props.title,
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: props.data
      }
    ]
  };
});

// 下载图表为图片
const downloadChart = () => {
  try {
    // 获取图表实例
    const chart = toRaw(document.querySelector('.chart').__vue__.$refs.root.chart);
    
    // 获取图表的base64数据URL
    const dataURL = chart.getDataURL({
      type: 'png',
      backgroundColor: '#fff',
      pixelRatio: 2
    });
    
    // 创建下载链接
    const link = document.createElement('a');
    link.download = `${props.title}-${new Date().toISOString().split('T')[0]}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    ElMessage.success('图表已下载');
  } catch (error) {
    console.error('下载图表失败:', error);
    ElMessage.error('下载图表失败');
  }
};
</script>

<style scoped>
.chart-container {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.chart {
  height: 300px;
  width: 100%;
}

.chart-actions {
  display: flex;
  justify-content: center;
  margin-top: 8px;
  gap: 8px;
}
</style> 
 
 