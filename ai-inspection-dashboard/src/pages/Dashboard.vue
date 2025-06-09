<template>
  <div class="dashboard-page">
    <h1 class="page-title">质量检验仪表盘</h1>
    
    <!-- 顶部统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon quality-icon">
              <el-icon><Medal /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">93.7%</div>
              <div class="stat-label">合格率</div>
            </div>
            <div class="stat-trend up">
              <el-icon><CaretTop /></el-icon>
              <span>2.3%</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon production-icon">
              <el-icon><Box /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">248</div>
              <div class="stat-label">今日产量</div>
            </div>
            <div class="stat-trend up">
              <el-icon><CaretTop /></el-icon>
              <span>12</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon anomaly-icon">
              <el-icon><WarningFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">7</div>
              <div class="stat-label">异常事件</div>
            </div>
            <div class="stat-trend down">
              <el-icon><CaretBottom /></el-icon>
              <span>3</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon lab-icon">
              <el-icon><SetUp /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">15</div>
              <div class="stat-label">待检测试</div>
            </div>
            <div class="stat-trend up">
              <el-icon><CaretTop /></el-icon>
              <span>5</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 主要内容区域 -->
    <el-row :gutter="20" class="main-content">
      <!-- 左侧图表 -->
      <el-col :span="16">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>质量趋势</h3>
              <el-radio-group v-model="timeRange" size="small">
                <el-radio-button label="day">今日</el-radio-button>
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div id="quality-trend-chart" class="chart-container"></div>
        </el-card>
        
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>缺陷分布</h3>
              <el-tag size="small" type="info" effect="plain">A类产品</el-tag>
            </div>
          </template>
          <div id="defect-distribution-chart" class="chart-container"></div>
        </el-card>
      </el-col>
      
      <!-- 右侧信息 -->
      <el-col :span="8">
        <el-card shadow="hover" class="list-card">
          <template #header>
            <div class="card-header">
              <h3>最新质量事件</h3>
              <el-button type="primary" size="small" plain>查看全部</el-button>
            </div>
          </template>
          <div class="event-list">
            <div v-for="(event, index) in qualityEvents" :key="index" class="event-item">
              <div class="event-icon" :class="event.level">
                <el-icon v-if="event.level === 'high'"><WarningFilled /></el-icon>
                <el-icon v-else-if="event.level === 'medium'"><InfoFilled /></el-icon>
                <el-icon v-else><Notification /></el-icon>
              </div>
              <div class="event-info">
                <div class="event-title">{{ event.title }}</div>
                <div class="event-desc">{{ event.description }}</div>
                <div class="event-meta">
                  <span class="event-time">{{ event.time }}</span>
                  <span class="event-location">{{ event.location }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
        
        <el-card shadow="hover" class="list-card ai-recommendations">
          <template #header>
            <div class="card-header">
              <h3>AI质量改进建议</h3>
              <el-tag size="small" type="primary" effect="dark">由AI生成</el-tag>
            </div>
          </template>
          <div class="recommendation-list">
            <div v-for="(rec, index) in recommendations" :key="index" class="recommendation-item">
              <div class="recommendation-icon">
                <el-icon><Bulb /></el-icon>
              </div>
              <div class="recommendation-content">
                <div class="recommendation-text">{{ rec.content }}</div>
                <div class="recommendation-meta">
                  <el-tag size="small" effect="plain">{{ rec.category }}</el-tag>
                  <span class="confidence">置信度: {{ rec.confidence }}%</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts/core';
import { 
  BarChart, LineChart, PieChart 
} from 'echarts/charts';
import {
  TitleComponent, 
  GridComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 注册ECharts组件
echarts.use([
  TitleComponent,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  BarChart,
  LineChart,
  PieChart,
  CanvasRenderer
]);

export default {
  name: 'Dashboard',
  
  setup() {
    // 图表实例
    let qualityTrendChart = null;
    let defectDistributionChart = null;
    
    // 状态
    const timeRange = ref('week');
    
    // 质量事件数据
    const qualityEvents = ref([
      {
        title: '产线A批次质量异常',
        description: '检测到硬度参数超出上限，已通知生产部门调整工艺参数',
        level: 'high',
        time: '10:25',
        location: 'A产线'
      },
      {
        title: '新物料样品检验完成',
        description: 'M2023-008物料样品通过所有检验项目，可以投入使用',
        level: 'low',
        time: '09:40',
        location: '实验室'
      },
      {
        title: '设备预防性维护提醒',
        description: '检测设备C需要进行校准，建议今日下午安排',
        level: 'medium',
        time: '08:15',
        location: '质检站'
      },
      {
        title: '供应商物料到货检验',
        description: '供应商B送样已完成初检，等待物性检验结果',
        level: 'low',
        time: '昨天',
        location: '收货区'
      }
    ]);
    
    // AI推荐数据
    const recommendations = ref([
      {
        content: '建议优化B产线温控参数，可能提高良品率约2.5%',
        category: '工艺改进',
        confidence: 92
      },
      {
        content: 'M2023-006物料硬度波动较大，建议与供应商沟通提升稳定性',
        category: '物料管理',
        confidence: 89
      },
      {
        content: '检测到C生产线操作差异性大，建议进行标准化培训',
        category: '人员管理',
        confidence: 85
      }
    ]);
    
    // 初始化图表
    function initCharts() {
      // 初始化质量趋势图表
      qualityTrendChart = echarts.init(document.getElementById('quality-trend-chart'));
      
      const qualityTrendOption = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['合格率', '产量', '缺陷数']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        },
        yAxis: [
          {
            type: 'value',
            name: '百分比',
            min: 80,
            max: 100,
            position: 'left',
            axisLabel: {
              formatter: '{value}%'
            }
          },
          {
            type: 'value',
            name: '数量',
            position: 'right'
          }
        ],
        series: [
          {
            name: '合格率',
            type: 'line',
            data: [92.5, 93.1, 91.8, 94.2, 93.7, 94.8, 93.5],
            yAxisIndex: 0,
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: '#409EFF'
            }
          },
          {
            name: '产量',
            type: 'bar',
            data: [220, 232, 201, 234, 290, 230, 220],
            yAxisIndex: 1,
            itemStyle: {
              color: '#67C23A'
            }
          },
          {
            name: '缺陷数',
            type: 'line',
            data: [18, 16, 22, 14, 20, 12, 16],
            yAxisIndex: 1,
            symbol: 'circle',
            symbolSize: 6,
            itemStyle: {
              color: '#F56C6C'
            }
          }
        ]
      };
      
      qualityTrendChart.setOption(qualityTrendOption);
      
      // 初始化缺陷分布图表
      defectDistributionChart = echarts.init(document.getElementById('defect-distribution-chart'));
      
      const defectDistributionOption = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          data: ['外观缺陷', '尺寸超差', '功能异常', '材质问题', '其他']
        },
        series: [
          {
            name: '缺陷分布',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
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
              { value: 35, name: '外观缺陷' },
              { value: 28, name: '尺寸超差' },
              { value: 20, name: '功能异常' },
              { value: 12, name: '材质问题' },
              { value: 5, name: '其他' }
            ]
          }
        ]
      };
      
      defectDistributionChart.setOption(defectDistributionOption);
    }
    
    // 窗口大小调整时重新适配图表
    function resizeHandler() {
      if (qualityTrendChart) qualityTrendChart.resize();
      if (defectDistributionChart) defectDistributionChart.resize();
    }
    
    onMounted(() => {
      // 初始化图表
      nextTick(() => {
        initCharts();
      });
      
      // 添加窗口大小调整监听
      window.addEventListener('resize', resizeHandler);
    });
    
    onUnmounted(() => {
      // 移除窗口大小调整监听
      window.removeEventListener('resize', resizeHandler);
      
      // 销毁图表
      if (qualityTrendChart) qualityTrendChart.dispose();
      if (defectDistributionChart) defectDistributionChart.dispose();
    });
    
    return {
      timeRange,
      qualityEvents,
      recommendations
    };
  }
};
</script>

<style>
.dashboard-page {
  padding: 20px;
}

.page-title {
  margin-top: 0;
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

/* 统计卡片样式 */
.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  height: 120px;
}

.stat-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
  font-size: 28px;
  color: white;
}

.quality-icon {
  background-color: #409EFF;
}

.production-icon {
  background-color: #67C23A;
}

.anomaly-icon {
  background-color: #F56C6C;
}

.lab-icon {
  background-color: #E6A23C;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.stat-trend {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.stat-trend.up {
  color: #67C23A;
}

.stat-trend.down {
  color: #F56C6C;
}

/* 图表卡片样式 */
.chart-card {
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
}

/* 列表卡片样式 */
.list-card {
  margin-bottom: 20px;
  height: calc(50% - 10px);
}

.event-list, .recommendation-list {
  height: calc(100% - 20px);
  overflow-y: auto;
}

.event-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #EBEEF5;
}

.event-item:last-child {
  border-bottom: none;
}

.event-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
  color: white;
  flex-shrink: 0;
}

.event-icon.high {
  background-color: #F56C6C;
}

.event-icon.medium {
  background-color: #E6A23C;
}

.event-icon.low {
  background-color: #909399;
}

.event-info {
  flex: 1;
}

.event-title {
  font-weight: bold;
  margin-bottom: 4px;
  font-size: 14px;
}

.event-desc {
  font-size: 12px;
  color: #606266;
  margin-bottom: 4px;
}

.event-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

.ai-recommendations .recommendation-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #EBEEF5;
}

.ai-recommendations .recommendation-item:last-child {
  border-bottom: none;
}

.recommendation-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #409EFF;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
  color: white;
  flex-shrink: 0;
}

.recommendation-content {
  flex: 1;
}

.recommendation-text {
  font-size: 14px;
  margin-bottom: 8px;
}

.recommendation-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.confidence {
  color: #909399;
}
</style> 