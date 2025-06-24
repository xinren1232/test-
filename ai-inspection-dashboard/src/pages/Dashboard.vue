<template>
  <div class="dashboard-container">
    <h1 class="page-title">IQE智能检验平台</h1>
    
    <!-- 数据概览卡片 -->
    <el-row :gutter="20" class="dashboard-stats">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-icon">
            <el-icon><Goods /></el-icon>
          </div>
          <div class="stats-info">
            <div class="stats-title">物料总数</div>
            <div class="stats-value">{{ inventoryCount }}</div>
            <div class="stats-change">
              较昨日 <span class="up">+{{ 12 }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-icon blue">
            <el-icon><DocumentChecked /></el-icon>
          </div>
          <div class="stats-info">
            <div class="stats-title">实验室测试</div>
            <div class="stats-value">{{ labTestCount }}</div>
            <div class="stats-change">
              较昨日 <span class="up">+{{ 8 }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-icon green">
            <el-icon><SetUp /></el-icon>
          </div>
          <div class="stats-info">
            <div class="stats-title">上线物料</div>
            <div class="stats-value">{{ factoryCount }}</div>
            <div class="stats-change">
              较昨日 <span class="up">+{{ 15 }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-icon orange">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="stats-info">
            <div class="stats-title">异常警报</div>
            <div class="stats-value">{{ exceptionCount }}</div>
            <div class="stats-change">
              较昨日 <span class="down">-{{ 3 }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 快速访问模块 -->
    <el-card class="quick-access-card">
      <template #header>
        <div class="card-header">
          <h2>快速访问</h2>
        </div>
      </template>
      
      <el-row :gutter="20" class="quick-access-grid">
        <el-col :xs="24" :sm="8" :md="6" v-for="(item, index) in quickAccessItems" :key="index">
          <el-card shadow="hover" class="quick-access-item" @click="navigateTo(item.path)">
            <el-icon :size="32"><component :is="item.icon" /></el-icon>
            <div class="item-title">{{ item.title }}</div>
            <div class="item-desc">{{ item.description }}</div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 数据分析图表 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <h2>物料质量趋势</h2>
              <el-radio-group v-model="qualityChartPeriod" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container" ref="qualityChartRef"></div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <h2>物料类型分布</h2>
            </div>
          </template>
          <div class="chart-container" ref="categoryChartRef"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import * as echarts from 'echarts/core';
import { BarChart, PieChart, LineChart } from 'echarts/charts';
import { 
  TitleComponent, 
  TooltipComponent, 
  GridComponent, 
  LegendComponent 
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { 
  Goods, 
  DocumentChecked, 
  SetUp, 
  Warning, 
  Box, 
  DataAnalysis, 
  Odometer, 
  TrendCharts 
} from '@element-plus/icons-vue';
import { systemDataUpdater } from '../services';

echarts.use([
  TitleComponent, 
  TooltipComponent, 
  GridComponent, 
  LegendComponent,
  BarChart, 
  PieChart, 
  LineChart, 
  CanvasRenderer
]);

const router = useRouter();

// 数据统计
const inventoryCount = ref(0);
const labTestCount = ref(0);
const factoryCount = ref(0);
const exceptionCount = ref(0);

// 图表相关
const qualityChartRef = ref(null);
const categoryChartRef = ref(null);
const qualityChartPeriod = ref('week');

// 快速访问项
const quickAccessItems = [
  {
    title: '库存管理',
    description: '查看和管理物料库存信息',
    icon: 'Box',
    path: '/inventory'
  },
  {
    title: '实验室数据',
    description: '查看物料测试结果数据',
    icon: 'DocumentChecked',
    path: '/lab'
  },
  {
    title: '上线跟踪',
    description: '查看物料上线使用情况',
    icon: 'SetUp',
    path: '/factory'
  },
  {
    title: '批次管理',
    description: '管理物料批次信息',
    icon: 'Goods',
    path: '/batch'
  },
  {
    title: '异常管理',
    description: '处理物料异常情况',
    icon: 'Warning',
    path: '/material-exception'
  },
  {
    title: '数据分析',
    description: '物料数据分析报表',
    icon: 'DataAnalysis',
    path: '/admin/data'
  }
];

// 初始化数据
const initData = async () => {
  try {
    // 获取统计数据
    inventoryCount.value = 128;
    labTestCount.value = 85;
    factoryCount.value = 96;
    exceptionCount.value = 12;
    
    // 初始化图表
    initQualityChart();
    initCategoryChart();
  } catch (error) {
    console.error('初始化数据失败:', error);
  }
};

// 初始化质量趋势图表
const initQualityChart = () => {
  if (!qualityChartRef.value) return;
  
  const chart = echarts.init(qualityChartRef.value);
  
  const option = {
    title: {
      text: '物料质量趋势'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['合格率', '不良率']
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '合格率',
        type: 'line',
        data: [92, 93, 95, 89, 91, 90, 94],
        itemStyle: {
          color: '#67C23A'
        }
      },
      {
        name: '不良率',
        type: 'line',
        data: [8, 7, 5, 11, 9, 10, 6],
        itemStyle: {
          color: '#F56C6C'
        }
      }
    ]
  };
  
  chart.setOption(option);
  
  window.addEventListener('resize', () => {
    chart.resize();
  });
};

// 初始化物料类型分布图表
const initCategoryChart = () => {
  if (!categoryChartRef.value) return;
  
  const chart = echarts.init(categoryChartRef.value);
  
  const option = {
    title: {
      text: '物料类型分布'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: ['电子元件', '结构件', '显示模组', '包装材料', '其他']
    },
    series: [
      {
        name: '物料类型',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 45, name: '电子元件' },
          { value: 25, name: '结构件' },
          { value: 15, name: '显示模组' },
          { value: 10, name: '包装材料' },
          { value: 5, name: '其他' }
        ]
      }
    ]
  };
  
  chart.setOption(option);
  
  window.addEventListener('resize', () => {
    chart.resize();
  });
};

// 页面导航
const navigateTo = (path) => {
  router.push(path);
};

// 生命周期钩子
onMounted(() => {
  initData();
});
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
}

.dashboard-stats {
  margin-bottom: 20px;
}

.stats-card {
  display: flex;
  padding: 20px;
  height: 100px;
  margin-bottom: 20px;
}

.stats-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 8px;
  background-color: #F2F6FC;
  margin-right: 15px;
  color: #409EFF;
  font-size: 24px;
}

.stats-icon.blue {
  background-color: #ECF5FF;
  color: #409EFF;
}

.stats-icon.green {
  background-color: #F0F9EB;
  color: #67C23A;
}

.stats-icon.orange {
  background-color: #FDF6EC;
  color: #E6A23C;
}

.stats-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stats-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.stats-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stats-change {
  font-size: 12px;
  color: #909399;
}

.stats-change .up {
  color: #F56C6C;
}

.stats-change .down {
  color: #67C23A;
}

.quick-access-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
}

.quick-access-grid {
  margin-top: 10px;
}

.quick-access-item {
  height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
}

.quick-access-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.item-title {
  margin: 10px 0 5px;
  font-size: 16px;
  font-weight: bold;
}

.item-desc {
  font-size: 12px;
  color: #909399;
  text-align: center;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
}
</style> 