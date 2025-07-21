<template>
  <div class="architecture-container">
    <div class="header">
      <div class="title">IQE动态检验系统 - 架构图解</div>
      <el-button @click="goBack" type="primary" round size="small">
        返回
      </el-button>
    </div>
    
    <!-- 系统架构图标题 -->
    <div class="system-title-bar">
      <div class="main-title">图解IQE动态检验系统架构</div>
    </div>
    
    <!-- 系统说明 -->
    <div class="system-description">
      <p>本架构图展示IQE动态检验系统各组件之间的关系和数据流向。</p>
    </div>

    <!-- 控制面板 -->
    <div class="controls">
      <el-button type="success" size="small" @click="resetView">
        <i class="el-icon-refresh"></i> 重置视图
      </el-button>
    </div>
    
    <!-- ECharts架构图 -->
    <div class="architecture-chart" ref="chartRef"></div>
    
    <!-- 图例说明 -->
    <div class="diagram-legend">
      <div class="legend-title">架构图例说明</div>
      <div class="legend-content">
        <div class="legend-item" v-for="(color, type) in categoryColors" :key="type">
          <div class="legend-color" :style="{ background: color }"></div>
          <span>{{ categoryLabels[type] }}</span>
        </div>
      </div>
      
      <div class="flow-steps">
        <div class="flow-step" v-for="(step, index) in flowSteps" :key="index">
          {{ step.description }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import * as echarts from 'echarts';

const router = useRouter();
const chartRef = ref(null);
let chart = null;

// 返回首页
function goBack() {
  router.push('/');
}

// 定义节点分类和颜色
const categoryColors = {
  'user': '#e74c3c', 
  'frontend': '#3498db',
  'backend': '#9b59b6',
  'storage': '#8e44ad',
  'devops': '#2c3e50',
  'monitor': '#c0392b'
};

// 分类标签
const categoryLabels = {
  'user': '用户交互层',
  'frontend': '应用服务层',
  'backend': '后端服务层',
  'storage': '数据存储层',
  'devops': '开发运维层',
  'monitor': '监控告警层'
};

// 流程步骤
const flowSteps = [
  { description: '开发者提交代码' },
  { description: '用户请求前端服务' },
  { description: '请求负载均衡与处理' },
  { description: '后端与数据存储交互' },
  { description: '部署与监控流程' }
];

// 架构图数据 - 优化节点布局
const nodes = [
  { id: 'dev', name: '开发者', x: 140, y: 100, category: 'devops', symbol: 'circle', symbolSize: 60 },
  { id: 'user', name: '用户', x: 620, y: 100, category: 'user', symbol: 'circle', symbolSize: 60 },
  { id: 'web', name: 'Web前端', x: 500, y: 200, category: 'frontend', symbol: 'rect', symbolSize: [90, 50] },
  { id: 'client', name: '客户端', x: 740, y: 200, category: 'frontend', symbol: 'rect', symbolSize: [90, 50] },
  { id: 'lb', name: '负载均衡', x: 620, y: 280, category: 'frontend', symbol: 'rect', symbolSize: 70 },
  { id: 'cdn', name: 'CDN', x: 800, y: 280, category: 'frontend', symbol: 'diamond', symbolSize: 60 },
  { id: 'webapp', name: 'Web App服务', x: 380, y: 380, category: 'backend', symbol: 'rect', symbolSize: [120, 60] },
  { id: 'backend', name: '后台服务', x: 620, y: 450, category: 'backend', symbol: 'rect', symbolSize: [120, 60] },
  { id: 'db', name: '数据库', x: 380, y: 580, category: 'storage', symbol: 'roundRect', symbolSize: [100, 60] },
  { id: 'cache', name: '缓存', x: 620, y: 580, category: 'storage', symbol: 'roundRect', symbolSize: [100, 60] },
  { id: 'cicd', name: 'CI/CD', x: 200, y: 280, category: 'devops', symbol: 'rect', symbolSize: [90, 50] },
  { id: 'monitor', name: '告警服务', x: 140, y: 580, category: 'monitor', symbol: 'rect', symbolSize: [90, 50] }
];

// 流动连接线
const links = [
  { source: 'dev', target: 'cicd', lineStyle: { width: 2, curveness: 0.2 } },
  { source: 'user', target: 'web', lineStyle: { width: 2, curveness: 0.2 } },
  { source: 'web', target: 'lb', lineStyle: { width: 2, curveness: 0.2 } },
  { source: 'client', target: 'lb', lineStyle: { width: 2, curveness: 0.2 } },
  { source: 'lb', target: 'webapp', lineStyle: { width: 2 } },
  { source: 'lb', target: 'cdn', lineStyle: { width: 2, curveness: 0.2 } },
  { source: 'webapp', target: 'backend', lineStyle: { width: 2 } },
  { source: 'backend', target: 'db', lineStyle: { width: 2, curveness: 0.2 } },
  { source: 'backend', target: 'cache', lineStyle: { width: 2, curveness: 0.2 } },
  { source: 'cicd', target: 'webapp', lineStyle: { width: 2, curveness: 0.3 } },
  { source: 'cicd', target: 'backend', lineStyle: { width: 2, curveness: 0.3 } },
  { source: 'backend', target: 'monitor', lineStyle: { width: 2, curveness: 0.2 } },
  { source: 'db', target: 'monitor', lineStyle: { width: 2, curveness: 0.4 } }
];

// 创建图表
function initChart() {
  if (!chartRef.value) return;
  
  // 销毁旧实例
  if (chart) chart.dispose();
  
  // 创建新实例
  chart = echarts.init(chartRef.value);
  
  // 创建流动效果
  const flowingLinks = links.map(link => {
    return {
      ...link,
      lineStyle: {
        ...link.lineStyle,
        type: 'dashed',
        dashOffset: 0,
        cap: 'round',
        shadowColor: categoryColors[
          nodes.find(n => n.id === link.source).category
        ],
        shadowBlur: 15,
        opacity: 0.95,
        curveness: link.lineStyle.curveness || 0.2
      },
      effect: {
        show: true,
        period: 3.5,
        trailLength: 0.8,
        symbolSize: 8,
        color: '#fff',
        symbol: 'arrow'
      }
    };
  });
  
  // 图表配置
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        if (params.dataType === 'node') {
          return `<div style="font-weight:bold;margin-bottom:5px;">${params.data.name}</div>
                  <div>类型: ${categoryLabels[params.data.category]}</div>`;
        }
        return `数据流向: ${params.data.source} → ${params.data.target}`;
      },
      backgroundColor: 'rgba(30,30,45,0.9)',
      borderColor: 'rgba(255,255,255,0.2)',
      textStyle: {
        color: '#fff'
      },
      extraCssText: 'box-shadow: 0 0 15px rgba(0,0,0,0.3); border-radius: 8px;'
    },
    grid: {
      top: 10,
      bottom: 10,
    },
    legend: {
      show: false
    },
    animationDuration: 1500,
    animationEasingUpdate: 'quinticInOut',
    animation: true,
    series: [{
      type: 'graph',
      layout: 'none',
      symbolSize: 50,
      roam: true, // 允许缩放平移
      focusNodeAdjacency: true, // 鼠标悬停在节点上时，突出显示节点以及节点的边和邻接节点
      itemStyle: {
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        shadowBlur: 15
      },
      lineStyle: {
        color: '#aaa',
        width: 3,
        curveness: 0.2,
        dashOffset: 0
      },
      label: {
        show: true,
        position: 'inside',
        formatter: '{b}',
        fontSize: 13,
        fontWeight: 'bold',
        color: '#fff',
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 4,
        padding: [4, 6]
      },
      edgeLabel: {
        fontSize: 13,
        color: '#fff',
        backgroundColor: 'rgba(40,40,60,0.85)',
        borderRadius: 5,
        padding: [3, 5],
        formatter: '{c}'
      },
      // 节点分类
      categories: Object.keys(categoryColors).map(key => ({
        name: key,
        itemStyle: {
          color: categoryColors[key]
        }
      })),
      data: nodes.map(node => ({
        ...node,
        tooltip: {
          formatter: `${node.name}<br/>类型: ${categoryLabels[node.category]}`
        },
        itemStyle: {
          color: categoryColors[node.category],
          borderWidth: 2,
          borderColor: 'rgba(255, 255, 255, 0.4)',
          shadowBlur: 12,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        },
        emphasis: {
          scale: true,
          itemStyle: {
            shadowBlur: 25,
            borderColor: '#fff',
            borderWidth: 3
          }
        }
      })),
      links: flowingLinks.map(link => ({
        ...link,
        lineStyle: {
          ...link.lineStyle,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [{ 
              offset: 0, 
              color: categoryColors[
                nodes.find(n => n.id === link.source).category
              ] 
            }, {
              offset: 1, 
              color: categoryColors[
                nodes.find(n => n.id === link.target).category
              ]
            }],
            global: false
          }
        },
        emphasis: {
          lineStyle: {
            width: 6,
            shadowBlur: 20,
            type: 'solid'
          }
        }
      })),
      emphasis: {
        lineStyle: {
          width: 5
        },
        itemStyle: {
          shadowBlur: 20
        }
      }
    }]
  };
  
  // 设置图表
  chart.setOption(option);
  
  // 添加Tooltip效果
  chart.on('mouseover', params => {
    if (params.dataType === 'node') {
      chart.dispatchAction({
        type: 'highlight',
        seriesIndex: 0,
        dataIndex: params.dataIndex
      });
    }
  });
  
  chart.on('mouseout', params => {
    if (params.dataType === 'node') {
      chart.dispatchAction({
        type: 'downplay',
        seriesIndex: 0,
        dataIndex: params.dataIndex
      });
    }
  });
}

// 重置视图
function resetView() {
  initChart();
}

// 处理窗口大小改变
function resizeHandler() {
  chart && chart.resize();
}

onMounted(() => {
  initChart();
  window.addEventListener('resize', resizeHandler);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeHandler);
  chart && chart.dispose();
});
</script>

<style scoped>
.architecture-container {
  width: 100%;
  min-height: 100vh;
  padding: 10px;
  background: linear-gradient(to bottom, #1c1c24, #0f0f15);
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-x: hidden;
}

.header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 10px;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #ffffff;
}

/* 系统标题栏 */
.system-title-bar {
  width: 100%;
  padding: 15px 0;
  text-align: center;
  margin-bottom: 10px;
}

.main-title {
  font-size: 26px;
  font-weight: bold;
  background: linear-gradient(90deg, #3498db 0%, #9b59b6 50%, #e74c3c 100%);
  -webkit-background-clip: text;
  color: transparent;
  letter-spacing: 2px;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
  position: relative;
  display: inline-block;
}

.main-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 10%;
  width: 80%;
  height: 2px;
  background: linear-gradient(90deg, #3498db 0%, #9b59b6 50%, #e74c3c 100%);
  border-radius: 2px;
}

/* 系统说明 */
.system-description {
  text-align: center;
  padding: 0 10px;
  color: #aaa;
  font-size: 14px;
  max-width: 700px;
  margin: 0 auto 20px;
}

/* 控制面板 */
.controls {
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
}

/* ECharts架构图 */
.architecture-chart {
  width: 100%;
  height: 680px;
  margin-bottom: 20px;
  border-radius: 15px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(20, 20, 30, 0.95), rgba(10, 10, 18, 0.98));
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 0, 0, 0.4) inset;
  border: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(6px);
}

/* 图例 */
.diagram-legend {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 25px;
  background: rgba(20, 20, 30, 0.9);
  border-radius: 12px;
  margin-top: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4), 0 0 10px rgba(0, 0, 0, 0.3) inset;
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-width: 800px;
}

.legend-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #ecf0f1;
  position: relative;
  letter-spacing: 1px;
}

.legend-title::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 20%;
  width: 60%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
}

.legend-content {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
}

.legend-color, .legend-number {
  width: 15px;
  height: 15px;
  margin-right: 5px;
  border-radius: 3px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.legend-number {
  background: #fff;
  color: #000;
  font-size: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.flow-steps {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.flow-step {
  display: flex;
  align-items: center;
  background: rgba(0,0,0,0.3);
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 13px;
  margin-bottom: 8px;
}

.step-number {
  background: #fff;
  color: #000;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 5px;
  font-size: 10px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .architecture-chart {
    height: 450px;
  }
  
  .flow-steps {
    flex-direction: column;
    align-items: center;
  }
}
</style> 
 
 