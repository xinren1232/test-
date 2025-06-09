<!-- 
  上下文侧边栏组件
  用于展示和管理质量助手的上下文信息
-->
<template>
  <div class="sidebar-container">
    <!-- 仅在移动视图下显示的关闭按钮 -->
    <div v-if="isMobileView" class="mobile-sidebar-header">
      <el-button link @click="$emit('toggle-sidebar')">
        <el-icon><Close /></el-icon>
      </el-button>
    </div>
    
    <!-- 上下文信息 -->
    <el-card class="context-card">
      <template #header>
        <div class="card-header">
          <h3>查询上下文</h3>
          <el-tag v-if="modelValue" size="small" type="success">
            已选择物料
          </el-tag>
        </div>
      </template>
      
      <!-- 物料选择 -->
      <div v-if="modelValue" class="material-context">
        <h4>当前物料</h4>
        <div class="material-info">
          <div class="material-header">
            <span class="material-code">{{ modelValue.code }}</span>
            <el-tag size="small" :type="modelValue.status === '正常' ? 'success' : 'danger'">
              {{ modelValue.status }}
            </el-tag>
          </div>
          <div class="material-name">{{ modelValue.name }}</div>
          <div class="material-details">
            <span>库存: {{ modelValue.inventory }}</span>
            <span>类型: {{ modelValue.type }}</span>
          </div>
        </div>
        <el-button size="small" type="primary" plain @click="clearSelectedMaterial">
          清除物料选择
        </el-button>
      </div>
      <div v-else class="no-material-selected">
        <el-empty description="未选择物料" :image-size="60">
          <el-button size="small" type="primary" @click="$emit('select-material')">
            选择物料
          </el-button>
        </el-empty>
      </div>
      
      <!-- 应用场景 -->
      <div class="scenario-context">
        <h4>应用场景</h4>
        <el-radio-group v-model="currentScenario" size="small" @change="handleScenarioChange">
          <el-radio-button label="inventory">库存管理</el-radio-button>
          <el-radio-button label="laboratory">实验室测试</el-radio-button>
          <el-radio-button label="production">生产线</el-radio-button>
        </el-radio-group>
      </div>
      
      <!-- 常用查询 -->
      <div class="common-queries">
        <h4>常用查询</h4>
        <ul class="query-list">
          <li @click="handleSuggestion('查询质量合格率')">查询质量合格率</li>
          <li @click="handleSuggestion('查看批次不良记录')">查看批次不良记录</li>
          <li @click="handleSuggestion('分析实验数据')">分析实验数据</li>
          <li @click="handleSuggestion('查询供应商质量评分')">查询供应商质量评分</li>
        </ul>
      </div>
    </el-card>
    
    <!-- 摘要数据卡片 -->
    <el-card class="summary-card">
      <template #header>
        <div class="card-header">
          <h3>质量数据摘要</h3>
          <el-button link @click="refreshSummaryData">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </template>
      
      <div class="summary-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="质量合格率">
            <span class="highlight">{{ qualityData.passRate }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="待处理质量问题">
            <el-tag :type="qualityData.pendingIssues > 10 ? 'danger' : 'warning'">{{ qualityData.pendingIssues }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="高风险物料">
            <el-tag type="warning">{{ qualityData.highRiskMaterials }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="今日检测批次">
            <span>{{ qualityData.todayInspectionBatches }}</span>
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="summary-chart" ref="summaryChartRef"></div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watchEffect } from 'vue';
import { Close, Refresh } from '@element-plus/icons-vue';
import * as echarts from 'echarts';

// Props定义
const props = defineProps({
  // v-model的物料数据
  modelValue: {
    type: Object,
    default: null
  },
  // 是否为移动视图
  isMobileView: {
    type: Boolean,
    default: false
  }
});

// 事件定义
const emit = defineEmits([
  'update:modelValue',  // 用于v-model
  'toggle-sidebar',     // 切换侧边栏显示
  'select-material',    // 选择物料按钮点击
  'suggestion-click'    // 快捷建议点击
]);

// 当前场景
const currentScenario = ref('laboratory');
// 质量数据
const qualityData = ref({
  passRate: '98.3%',
  pendingIssues: 12,
  highRiskMaterials: 5,
  todayInspectionBatches: 35
});

// 图表实例
let summaryChart = null;
const summaryChartRef = ref(null);

// 处理场景变更
const handleScenarioChange = (newScenario) => {
  // 可以添加场景变更的其他逻辑
  console.log('应用场景变更为:', newScenario);
};

// 清除已选物料
const clearSelectedMaterial = () => {
  emit('update:modelValue', null);
};

// 处理快捷建议
const handleSuggestion = (suggestion) => {
  emit('suggestion-click', suggestion);
};

// 刷新数据摘要
const refreshSummaryData = () => {
  // 这里可以添加刷新数据的逻辑
  // 示例：随机更新数据
  qualityData.value = {
    passRate: (95 + Math.random() * 4).toFixed(1) + '%',
    pendingIssues: Math.floor(5 + Math.random() * 20),
    highRiskMaterials: Math.floor(1 + Math.random() * 10),
    todayInspectionBatches: Math.floor(20 + Math.random() * 30)
  };
  
  // 刷新图表
  updateSummaryChart();
};

// 初始化图表
const initSummaryChart = () => {
  if (summaryChartRef.value) {
    summaryChart = echarts.init(summaryChartRef.value);
    updateSummaryChart();
    
    // 响应窗口大小变化
    window.addEventListener('resize', () => {
      if (summaryChart) {
        summaryChart.resize();
      }
    });
  }
};

// 更新图表
const updateSummaryChart = () => {
  if (!summaryChart) return;
  
  // 定义图表选项
  const option = {
    title: {
      text: '近7天质量趋势',
      left: 'center',
      textStyle: {
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
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
        data: [
          96.8 + Math.random(), 
          97.2 + Math.random(), 
          97.5 + Math.random(), 
          96.5 + Math.random(), 
          98.2 + Math.random(), 
          98.6 + Math.random(), 
          parseFloat(qualityData.value.passRate)
        ],
        markPoint: {
          data: [
            { type: 'max', name: '最高值' },
            { type: 'min', name: '最低值' }
          ]
        }
      }
    ]
  };
  
  // 更新图表
  summaryChart.setOption(option);
};

// 组件挂载后初始化图表
onMounted(() => {
  initSummaryChart();
});

// 组件卸载前销毁图表实例
onBeforeUnmount(() => {
  if (summaryChart) {
    summaryChart.dispose();
    summaryChart = null;
  }
});
</script>

<style scoped>
.sidebar-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 16px;
}

.mobile-sidebar-header {
  display: flex;
  justify-content: flex-end;
  padding: 8px;
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

.material-context {
  margin-bottom: 16px;
}

.material-context h4,
.scenario-context h4,
.common-queries h4 {
  font-size: 14px;
  margin: 12px 0 8px;
  color: #606266;
}

.material-info {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 12px;
}

.material-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.material-code {
  font-weight: bold;
  font-size: 14px;
}

.material-name {
  font-size: 16px;
  margin-bottom: 8px;
}

.material-details {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #606266;
}

.no-material-selected {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
}

.scenario-context {
  margin-bottom: 16px;
}

.query-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.query-list li {
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
  font-size: 14px;
}

.query-list li:hover {
  background-color: #f0f2f5;
  color: #409EFF;
}

.summary-card {
  flex-grow: 1;
}

.summary-content {
  display: flex;
  flex-direction: column;
}

.highlight {
  color: #67c23a;
  font-weight: bold;
}

.summary-chart {
  height: 180px;
  margin-top: 16px;
}

@media (max-width: 768px) {
  .sidebar-container {
    padding: 0;
  }
}
</style> 