<template>
  <div class="data-rule-diagram">
    <div class="diagram-controls">
      <el-radio-group v-model="activeDiagramType" size="large">
        <el-radio-button label="flow">数据流程图</el-radio-button>
        <el-radio-button label="relation">关系图</el-radio-button>
        <el-radio-button label="hierarchy">层次图</el-radio-button>
      </el-radio-group>
      
      <div class="view-controls">
        <el-tooltip content="重置视图">
          <el-button size="small" circle @click="resetView">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="导出图像">
          <el-button size="small" circle @click="exportImage">
            <el-icon><Download /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>
    
    <div class="diagram-container">
      <div ref="chartRef" class="chart-container"></div>
    </div>
    
    <div class="diagram-legend">
      <div class="legend-item" v-for="(item, index) in legendItems" :key="index">
        <div class="legend-color" :style="{ backgroundColor: item.color }"></div>
        <div class="legend-label">{{ item.label }}</div>
      </div>
    </div>
    
    <div class="diagram-description">
      <h4>{{ getDiagramTitle() }}</h4>
      <p>{{ getDiagramDescription() }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { Refresh, Download } from '@element-plus/icons-vue';
import * as echarts from 'echarts';

// 图表类型
const activeDiagramType = ref('flow');
const chartRef = ref(null);
let chart = null;

// 图例项
const legendItems = ref([
  { label: '库存数据', color: '#409EFF' },
  { label: '测试数据', color: '#67C23A' },
  { label: '上线数据', color: '#E6A23C' },
  { label: '数据关系', color: '#909399' }
]);

// 监听图表类型变化
watch(activeDiagramType, () => {
  renderChart();
});

// 组件挂载时初始化图表
onMounted(() => {
  initChart();
  
  // 监听窗口大小变化，调整图表大小
  window.addEventListener('resize', () => {
    chart && chart.resize();
  });
});

// 初始化图表
const initChart = () => {
  if (chart) {
    chart.dispose();
  }
  
  chart = echarts.init(chartRef.value);
  renderChart();
};

// 渲染图表
const renderChart = () => {
  if (!chart) return;
  
  let option = {};
  
  switch (activeDiagramType.value) {
    case 'flow':
      option = getFlowDiagramOption();
      break;
    case 'relation':
      option = getRelationDiagramOption();
      break;
    case 'hierarchy':
      option = getHierarchyDiagramOption();
      break;
  }
  
  chart.setOption(option);
};

// 获取流程图配置
const getFlowDiagramOption = () => {
  return {
    title: {
      text: '数据流程图',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}'
    },
    series: [
      {
        type: 'sankey',
        layout: 'none',
        emphasis: {
          focus: 'adjacency'
        },
        data: [
          { name: '物料入库', itemStyle: { color: '#409EFF' } },
          { name: '库存管理', itemStyle: { color: '#409EFF' } },
          { name: '质量检测', itemStyle: { color: '#67C23A' } },
          { name: '测试分析', itemStyle: { color: '#67C23A' } },
          { name: '生产上线', itemStyle: { color: '#E6A23C' } },
          { name: '使用跟踪', itemStyle: { color: '#E6A23C' } }
        ],
        links: [
          { source: '物料入库', target: '库存管理', value: 10 },
          { source: '库存管理', target: '质量检测', value: 8 },
          { source: '质量检测', target: '测试分析', value: 8 },
          { source: '测试分析', target: '生产上线', value: 6 },
          { source: '生产上线', target: '使用跟踪', value: 6 }
        ]
      }
    ]
  };
};

// 获取关系图配置
const getRelationDiagramOption = () => {
  return {
    title: {
      text: '数据关系图',
      left: 'center'
    },
    tooltip: {},
    legend: {
      data: ['库存数据', '测试数据', '上线数据'],
      orient: 'vertical',
      right: 10,
      top: 20
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        animation: true,
        label: {
          show: true,
          position: 'right'
        },
        draggable: true,
        data: [
          {
            name: '物料ID',
            category: 0,
            symbolSize: 50,
            itemStyle: { color: '#409EFF' }
          },
          {
            name: '批次号',
            category: 0,
            symbolSize: 40,
            itemStyle: { color: '#409EFF' }
          },
          {
            name: '供应商',
            category: 0,
            symbolSize: 30,
            itemStyle: { color: '#409EFF' }
          },
          {
            name: '测试ID',
            category: 1,
            symbolSize: 50,
            itemStyle: { color: '#67C23A' }
          },
          {
            name: '测试结果',
            category: 1,
            symbolSize: 40,
            itemStyle: { color: '#67C23A' }
          },
          {
            name: '上线ID',
            category: 2,
            symbolSize: 50,
            itemStyle: { color: '#E6A23C' }
          },
          {
            name: '生产线',
            category: 2,
            symbolSize: 40,
            itemStyle: { color: '#E6A23C' }
          }
        ],
        links: [
          { source: '物料ID', target: '批次号' },
          { source: '物料ID', target: '供应商' },
          { source: '物料ID', target: '测试ID' },
          { source: '批次号', target: '测试ID' },
          { source: '测试ID', target: '测试结果' },
          { source: '测试ID', target: '上线ID' },
          { source: '测试结果', target: '上线ID' },
          { source: '上线ID', target: '生产线' }
        ],
        categories: [
          { name: '库存数据' },
          { name: '测试数据' },
          { name: '上线数据' }
        ],
        force: {
          repulsion: 100,
          edgeLength: 80
        }
      }
    ]
  };
};

// 获取层次图配置
const getHierarchyDiagramOption = () => {
  return {
    title: {
      text: '数据层次图',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove'
    },
    series: [
      {
        type: 'tree',
        data: [
          {
            name: '系统数据',
            children: [
              {
                name: '库存数据',
                itemStyle: { color: '#409EFF' },
                children: [
                  { name: '物料基本信息', itemStyle: { color: '#409EFF' } },
                  { name: '批次信息', itemStyle: { color: '#409EFF' } },
                  { name: '供应商信息', itemStyle: { color: '#409EFF' } }
                ]
              },
              {
                name: '测试数据',
                itemStyle: { color: '#67C23A' },
                children: [
                  { name: '检测参数', itemStyle: { color: '#67C23A' } },
                  { name: '检测结果', itemStyle: { color: '#67C23A' } },
                  { name: '异常标记', itemStyle: { color: '#67C23A' } }
                ]
              },
              {
                name: '上线数据',
                itemStyle: { color: '#E6A23C' },
                children: [
                  { name: '上线时间', itemStyle: { color: '#E6A23C' } },
                  { name: '生产状态', itemStyle: { color: '#E6A23C' } },
                  { name: '生产结果', itemStyle: { color: '#E6A23C' } }
                ]
              }
            ]
          }
        ],
        top: '10%',
        left: '8%',
        bottom: '22%',
        right: '20%',
        symbolSize: 12,
        label: {
          position: 'left',
          verticalAlign: 'middle',
          align: 'right',
          fontSize: 14
        },
        leaves: {
          label: {
            position: 'right',
            verticalAlign: 'middle',
            align: 'left'
          }
        },
        emphasis: {
          focus: 'descendant'
        },
        expandAndCollapse: true,
        animationDuration: 550,
        animationDurationUpdate: 750
      }
    ]
  };
};

// 重置视图
const resetView = () => {
  if (chart) {
    chart.dispatchAction({
      type: 'restore'
    });
  }
};

// 导出图像
const exportImage = () => {
  if (chart) {
    const imgData = chart.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#fff'
    });
    
    const link = document.createElement('a');
    link.href = imgData;
    link.download = `IQE数据${getDiagramTitle()}.png`;
    link.click();
  }
};

// 获取图表标题
const getDiagramTitle = () => {
  switch (activeDiagramType.value) {
    case 'flow':
      return '数据流程图';
    case 'relation':
      return '数据关系图';
    case 'hierarchy':
      return '数据层次图';
    default:
      return '数据图表';
  }
};

// 获取图表描述
const getDiagramDescription = () => {
  switch (activeDiagramType.value) {
    case 'flow':
      return '该图表展示了系统中数据的流转过程和规则约束关系，从库存物料到实验室测试再到上线使用的完整流程。图中节点表示数据模块与规则，连线表示它们之间的关系。';
    case 'relation':
      return '该图表展示了系统中各数据模块间的字段级关联关系，包括主键、外键关系以及各字段在不同模块中的作用。通过此图可以清晰了解数据间的依赖与引用关系。';
    case 'hierarchy':
      return '该图表展示了系统中数据的层次结构和数据间的依赖关系，帮助理解系统各模块对数据完整性和质量的要求。';
    default:
      return '';
  }
};
</script>

<style scoped>
.data-rule-diagram {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.diagram-controls {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.view-controls {
  display: flex;
  gap: 10px;
}

.diagram-container {
  flex: 1;
  min-height: 500px;
}

.chart-container {
  width: 100%;
  height: 100%;
  min-height: 500px;
}

.diagram-legend {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  margin: 0 15px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  margin-right: 6px;
}

.legend-label {
  font-size: 14px;
}

.diagram-description {
  margin-top: 20px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.diagram-description h4 {
  margin-top: 0;
  margin-bottom: 10px;
}

.diagram-description p {
  margin: 0;
  color: #606266;
}
</style> 