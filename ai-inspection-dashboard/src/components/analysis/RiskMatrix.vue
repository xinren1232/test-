<template>
  <div class="risk-matrix">
    <div class="matrix-header">
      <h3>{{ title }}</h3>
      <div class="controls">
        <el-select v-model="selectedFilter" placeholder="筛选视图" size="small">
          <el-option label="所有物料" value="all"></el-option>
          <el-option label="高风险" value="high"></el-option>
          <el-option label="中风险" value="medium"></el-option>
          <el-option label="低风险" value="low"></el-option>
        </el-select>
        <el-tooltip content="刷新数据" placement="top">
          <el-button type="primary" size="small" @click="refreshMatrix" :loading="loading" circle>
            <el-icon><RefreshRight /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>
    
    <div class="chart-container" ref="chartContainer"></div>
    
    <div class="matrix-legend">
      <div class="legend-item">
        <div class="bubble-sample high"></div>
        <span>高风险</span>
      </div>
      <div class="legend-item">
        <div class="bubble-sample medium"></div>
        <span>中风险</span>
      </div>
      <div class="legend-item">
        <div class="bubble-sample low"></div>
        <span>低风险</span>
      </div>
      <div class="size-legend">
        <div class="size-item">
          <div class="bubble-sample-size small"></div>
          <span>小批量</span>
        </div>
        <div class="size-item">
          <div class="bubble-sample-size large"></div>
          <span>大批量</span>
        </div>
      </div>
    </div>
    
    <div v-if="selectedItem" class="detail-panel">
      <div class="detail-header">
        <h4>详细信息</h4>
        <el-button type="text" @click="selectedItem = null">关闭</el-button>
      </div>
      
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="物料名称">{{ selectedItem.materialName }}</el-descriptions-item>
        <el-descriptions-item label="物料代码">{{ selectedItem.materialCode }}</el-descriptions-item>
        <el-descriptions-item label="供应商">{{ selectedItem.supplier }}</el-descriptions-item>
        <el-descriptions-item label="风险评分">
          <el-tag :type="getRiskTagType(selectedItem.risk)">{{ selectedItem.risk }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="物料复杂度">{{ selectedItem.complexity }}</el-descriptions-item>
        <el-descriptions-item label="供应商稳定性">{{ selectedItem.stability }}</el-descriptions-item>
        <el-descriptions-item label="批量大小">{{ selectedItem.volume }}</el-descriptions-item>
        <el-descriptions-item label="近期不良率">{{ selectedItem.defectRate }}%</el-descriptions-item>
      </el-descriptions>
      
      <div class="action-buttons">
        <el-button type="primary" size="small" @click="viewDetails">查看详情</el-button>
        <el-button type="warning" size="small" @click="createRiskPlan">创建风险控制计划</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick, computed } from 'vue';
import * as echarts from 'echarts/core';
import { useIQEStore } from '../../store';
import { useRouter } from 'vue-router';

// 数据存储
const store = useIQEStore();
const router = useRouter();

// 属性定义
const props = defineProps({
  title: {
    type: String,
    default: '物料-供应商风险矩阵'
  },
  height: {
    type: String,
    default: '500px'
  }
});

// 状态定义
const chartContainer = ref(null);
const chart = ref(null);
const selectedFilter = ref('all');
const loading = ref(false);
const matrixData = ref([]);
const selectedItem = ref(null);

// 初始化图表
const initChart = () => {
  if (!chartContainer.value) return;
  
  // 清除现有图表
  if (chart.value) {
    chart.value.dispose();
  }
  
  // 创建新图表实例
  chart.value = echarts.init(chartContainer.value);
  
  // 初始加载数据
  refreshMatrix();
};

// 刷新矩阵数据
const refreshMatrix = async () => {
  loading.value = true;
  
  try {
    await generateMatrixData();
    renderMatrix();
  } catch (error) {
    console.error('生成风险矩阵数据时出错:', error);
  } finally {
    loading.value = false;
  }
};

// 生成矩阵数据
const generateMatrixData = async () => {
  // 模拟异步操作
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // 从存储中获取物料和供应商数据
  const materialBatchData = store.materialBatchData;
  const supplierData = store.supplierData;
  
  // 生成矩阵数据
  const data = [];
  
  // 合并物料批次和供应商数据
  materialBatchData.forEach(batch => {
    // 查找对应的供应商
    const supplier = supplierData.find(s => s.name === batch.supplier) || {};
    
    // 计算风险评分
    const riskScore = batch.riskScore || Math.floor(Math.random() * 100);
    
    // 计算物料复杂度（示例）
    const complexity = Math.random() * 100;
    
    // 计算供应商稳定性
    const stability = supplier.qualityScore || Math.floor(Math.random() * 100);
    
    // 确定风险级别
    let riskLevel;
    if (riskScore >= 80) riskLevel = 'high';
    else if (riskScore >= 50) riskLevel = 'medium';
    else riskLevel = 'low';
    
    // 处理不良率
    let defectRate = 0;
    if (batch.defectRate) {
      if (typeof batch.defectRate === 'string') {
        const match = batch.defectRate.match(/(\d+(?:\.\d+)?)%/);
        if (match) {
          defectRate = parseFloat(match[1]);
        }
      } else if (typeof batch.defectRate === 'number') {
        defectRate = batch.defectRate;
      }
    }
    
    // 生成批量大小（示例）
    const volume = Math.floor(Math.random() * 900) + 100;
    
    // 添加到数据集
    data.push({
      materialCode: batch.materialCode,
      materialName: batch.materialName,
      supplier: batch.supplier,
      risk: riskScore,
      riskLevel: riskLevel,
      complexity: complexity.toFixed(1),
      stability: stability.toFixed(1),
      volume: volume,
      defectRate: defectRate,
      x: complexity,
      y: stability,
      value: volume
    });
  });
  
  matrixData.value = data;
};

// 渲染矩阵
const renderMatrix = () => {
  if (!chart.value) return;
  
  // 根据筛选条件过滤数据
  let filteredData;
  if (selectedFilter.value === 'all') {
    filteredData = matrixData.value;
  } else {
    filteredData = matrixData.value.filter(item => item.riskLevel === selectedFilter.value);
  }
  
  // 准备散点图数据
  const highRiskData = filteredData.filter(item => item.riskLevel === 'high')
    .map(item => [item.x, item.y, item.value, item]);
  
  const mediumRiskData = filteredData.filter(item => item.riskLevel === 'medium')
    .map(item => [item.x, item.y, item.value, item]);
  
  const lowRiskData = filteredData.filter(item => item.riskLevel === 'low')
    .map(item => [item.x, item.y, item.value, item]);
  
  // 设置散点图选项
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        const data = params.data[3];
        return `
          <div style="font-weight: bold; margin-bottom: 5px;">${data.materialName}</div>
          <div>供应商: ${data.supplier}</div>
          <div>风险评分: ${data.risk}</div>
          <div>物料复杂度: ${data.complexity}</div>
          <div>供应商稳定性: ${data.stability}</div>
          <div>批量: ${data.volume}</div>
          <div>不良率: ${data.defectRate}%</div>
        `;
      }
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '10%',
      bottom: '10%'
    },
    xAxis: {
      type: 'value',
      name: '物料复杂度',
      min: 0,
      max: 100,
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '供应商稳定性',
      min: 0,
      max: 100,
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '高风险',
        type: 'scatter',
        symbolSize: function (data) {
          return Math.sqrt(data[2]) / 5;
        },
        itemStyle: {
          color: '#F56C6C'
        },
        data: highRiskData,
        emphasis: {
          focus: 'series',
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      },
      {
        name: '中风险',
        type: 'scatter',
        symbolSize: function (data) {
          return Math.sqrt(data[2]) / 5;
        },
        itemStyle: {
          color: '#E6A23C'
        },
        data: mediumRiskData,
        emphasis: {
          focus: 'series',
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      },
      {
        name: '低风险',
        type: 'scatter',
        symbolSize: function (data) {
          return Math.sqrt(data[2]) / 5;
        },
        itemStyle: {
          color: '#67C23A'
        },
        data: lowRiskData,
        emphasis: {
          focus: 'series',
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ],
    visualMap: [
      {
        show: false,
        dimension: 2,
        min: 100,
        max: 1000,
        inRange: {
          opacity: [0.2, 0.8]
        }
      }
    ],
    // 划分风险区域
    graphic: [
      {
        type: 'rect',
        z: -100,
        left: '10%',
        top: '10%',
        shape: {
          width: '30%',
          height: '30%'
        },
        style: {
          fill: 'rgba(245, 108, 108, 0.1)'
        }
      },
      {
        type: 'text',
        z: -99,
        left: '15%',
        top: '15%',
        style: {
          fill: '#F56C6C',
          text: '高风险区域',
          fontSize: 14,
          opacity: 0.7
        }
      },
      {
        type: 'rect',
        z: -100,
        left: '60%',
        top: '60%',
        shape: {
          width: '30%',
          height: '30%'
        },
        style: {
          fill: 'rgba(103, 194, 58, 0.1)'
        }
      },
      {
        type: 'text',
        z: -99,
        left: '65%',
        top: '65%',
        style: {
          fill: '#67C23A',
          text: '低风险区域',
          fontSize: 14,
          opacity: 0.7
        }
      }
    ]
  };
  
  // 应用配置
  chart.value.setOption(option);
  
  // 添加点击事件
  chart.value.on('click', function(params) {
    if (params.seriesType === 'scatter') {
      selectedItem.value = params.data[3];
    }
  });
};

// 获取风险标签类型
const getRiskTagType = (risk) => {
  if (risk >= 80) return 'danger';
  if (risk >= 50) return 'warning';
  return 'success';
};

// 查看详情
const viewDetails = () => {
  if (!selectedItem.value) return;
  
  router.push({
    path: '/lab-view',
    query: {
      materialCode: selectedItem.value.materialCode,
      supplier: selectedItem.value.supplier
    }
  });
};

// 创建风险控制计划
const createRiskPlan = () => {
  if (!selectedItem.value) return;
  
  // 这里可以实现风险控制计划的创建逻辑
  console.log('创建风险控制计划', selectedItem.value);
  
  // 示例：显示一个消息
  alert(`已为 ${selectedItem.value.materialName} (${selectedItem.value.supplier}) 创建风险控制计划`);
};

// 监听窗口大小变化
window.addEventListener('resize', () => {
  if (chart.value) {
    chart.value.resize();
  }
});

// 监听筛选器变化
watch(selectedFilter, () => {
  renderMatrix();
});

// 组件挂载后初始化图表
onMounted(() => {
  nextTick(() => {
    initChart();
  });
});
</script>

<style scoped>
.risk-matrix {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 16px;
}

.matrix-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.matrix-header h3 {
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
}

.matrix-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.bubble-sample {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.bubble-sample.high {
  background-color: #F56C6C;
}

.bubble-sample.medium {
  background-color: #E6A23C;
}

.bubble-sample.low {
  background-color: #67C23A;
}

.size-legend {
  display: flex;
  gap: 12px;
  margin-left: 24px;
}

.size-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.bubble-sample-size {
  border-radius: 50%;
  background-color: #909399;
}

.bubble-sample-size.small {
  width: 8px;
  height: 8px;
}

.bubble-sample-size.large {
  width: 16px;
  height: 16px;
}

.detail-panel {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid #EBEEF5;
  border-radius: 4px;
  background-color: #F8F9FB;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.detail-header h4 {
  font-size: 15px;
  margin: 0;
  color: #303133;
}

.action-buttons {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
</rewritten_file>