<template>
  <div class="lab-container">
    <!-- 页面标题与工具栏 -->
    <div class="page-header">
      <h2 class="page-title">实验室测试管理</h2>
      <div class="toolbar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索物料编码或名称"
          clearable
          class="search-input"
        >
          <template #prefix>
            <el-icon><el-icon-search /></el-icon>
          </template>
        </el-input>
        
        <el-select v-model="categoryFilter" placeholder="物料分类" clearable class="filter-select">
          <el-option
            v-for="category in materialCategories"
            :key="category.id"
            :label="category.name"
            :value="category.id"
          />
        </el-select>
        
        <el-select v-model="resultFilter" placeholder="测试结果" clearable class="filter-select">
          <el-option label="全部结果" value="" />
          <el-option label="合格" value="合格" />
          <el-option label="不合格" value="不合格" />
        </el-select>
        
        <el-button type="primary" @click="refreshData">
          <el-icon><el-icon-refresh /></el-icon> 刷新
        </el-button>
      </div>
    </div>
    
    <!-- 数据概览卡片 -->
    <div class="statistics-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon total-icon">
                <el-icon><el-icon-data-line /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-title">总测试样本</div>
                <div class="stat-value">{{ filteredData.length }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card success" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon pass-icon">
                <el-icon><el-icon-check /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-title">合格数量</div>
                <div class="stat-value">{{ passCount }}</div>
                <div class="stat-rate">{{ passRate }}%</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card danger" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon fail-icon">
                <el-icon><el-icon-close /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-title">不合格数量</div>
                <div class="stat-value">{{ failCount }}</div>
                <div class="stat-rate">{{ failRate }}%</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon category-icon">
                <el-icon><el-icon-collection-tag /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-title">物料种类数</div>
                <div class="stat-value">{{ uniqueMaterialCount }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 图表分析 -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>物料分类合格率</h3>
            </div>
          </template>
          <div class="chart-wrapper" ref="categoryChartRef"></div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>不合格项目分布</h3>
            </div>
          </template>
          <div class="chart-wrapper" ref="failureTypeChartRef"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 时间序列图 -->
    <el-card class="chart-card">
      <template #header>
        <div class="card-header">
          <h3>测试结果趋势分析</h3>
          <el-radio-group v-model="timeRange" size="small">
            <el-radio-button label="month">近一月</el-radio-button>
            <el-radio-button label="quarter">近三月</el-radio-button>
            <el-radio-button label="year">一年内</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <div class="chart-wrapper trend-chart" ref="trendChartRef"></div>
    </el-card>
    
    <!-- 测试数据表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <h3>实验室测试记录</h3>
          <el-button-group>
            <el-button size="small" @click="exportData">导出数据</el-button>
            <el-button size="small" type="primary" @click="openAnalysisDialog">数据分析</el-button>
          </el-button-group>
        </div>
      </template>
      
      <el-table 
        :data="pagedData" 
        style="width: 100%" 
        border 
        stripe 
        highlight-current-row
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
        :row-class-name="testResultRowClassName"
      >
        <el-table-column type="expand">
          <template #default="props">
            <div class="expanded-content">
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="测试项目">{{ props.row.test_items.join(', ') }}</el-descriptions-item>
                <el-descriptions-item label="不合格项">{{ props.row.failed_items ? props.row.failed_items.join(', ') : '无' }}</el-descriptions-item>
                <el-descriptions-item label="测试设备">{{ props.row.equipment }}</el-descriptions-item>
                <el-descriptions-item label="测试标准">{{ props.row.standard }}</el-descriptions-item>
                <el-descriptions-item label="备注" :span="2">{{ props.row.notes || '无' }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="test_id" label="测试ID" width="100" />
        <el-table-column prop="material_code" label="物料编码" sortable width="140" />
        <el-table-column prop="material_name" label="物料名称" width="180" />
        <el-table-column label="物料分类" width="180">
          <template #default="scope">
            {{ getCategoryNameById(scope.row.category_id) }}
          </template>
        </el-table-column>
        <el-table-column prop="batch_number" label="批次号" width="120" />
        <el-table-column prop="test_date" label="测试日期" sortable width="120">
          <template #default="scope">
            {{ formatDate(scope.row.test_date) }}
          </template>
        </el-table-column>
        <el-table-column prop="sample_size" label="样本数" sortable width="100" align="center" />
        <el-table-column prop="result" label="测试结论" sortable width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.result === '合格' ? 'success' : 'danger'">
              {{ scope.row.result }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="tester" label="测试员" width="100" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" link size="small" @click.stop="viewDetail(scope.row)">详情</el-button>
            <el-button type="warning" link size="small" @click.stop="retest(scope.row)">复测</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredData.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 测试详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="测试详细信息"
      width="70%"
      append-to-body
    >
      <div v-if="selectedTest" class="test-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="测试ID">{{ selectedTest.test_id }}</el-descriptions-item>
          <el-descriptions-item label="测试日期">{{ formatDate(selectedTest.test_date) }}</el-descriptions-item>
          <el-descriptions-item label="物料编码">{{ selectedTest.material_code }}</el-descriptions-item>
          <el-descriptions-item label="物料名称">{{ selectedTest.material_name }}</el-descriptions-item>
          <el-descriptions-item label="物料分类">{{ getCategoryNameById(selectedTest.category_id) }}</el-descriptions-item>
          <el-descriptions-item label="批次号">{{ selectedTest.batch_number }}</el-descriptions-item>
          <el-descriptions-item label="样本数">{{ selectedTest.sample_size }}</el-descriptions-item>
          <el-descriptions-item label="测试结果">
            <el-tag :type="selectedTest.result === '合格' ? 'success' : 'danger'">
              {{ selectedTest.result }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="测试员">{{ selectedTest.tester }}</el-descriptions-item>
          <el-descriptions-item label="测试设备">{{ selectedTest.equipment }}</el-descriptions-item>
          <el-descriptions-item label="测试标准" :span="2">{{ selectedTest.standard }}</el-descriptions-item>
        </el-descriptions>
        
        <!-- 测试项目列表 -->
        <h4 class="section-title">测试项目明细</h4>
        <el-table 
          :data="getTestItemsDetail(selectedTest)" 
          style="width: 100%" 
          border 
          size="small"
        >
          <el-table-column prop="item" label="测试项目" />
          <el-table-column prop="standard" label="标准要求" />
          <el-table-column prop="result" label="测试结果" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === '合格' ? 'success' : 'danger'">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 测试图片 -->
        <h4 class="section-title">测试图片</h4>
        <div class="test-images">
          <el-empty v-if="!selectedTest.images || selectedTest.images.length === 0" description="暂无测试图片" />
          <el-image 
            v-for="(img, index) in selectedTest.images || []" 
            :key="index"
            :src="img" 
            :preview-src-list="selectedTest.images"
            class="test-image"
            fit="cover"
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { materialCategories, getCategoryName } from '../data/material_categories';
import * as echarts from 'echarts';
import labDataJson from '../data/lab_data.json';

// 状态变量
const labData = ref([...labDataJson]);
const searchQuery = ref('');
const categoryFilter = ref('');
const resultFilter = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const sortBy = ref('');
const sortOrder = ref('');
const detailDialogVisible = ref(false);
const selectedTest = ref(null);
const timeRange = ref('month');

// 图表引用
const categoryChartRef = ref(null);
const failureTypeChartRef = ref(null);
const trendChartRef = ref(null);
let categoryChart = null;
let failureTypeChart = null;
let trendChart = null;

// 计算属性
const filteredData = computed(() => {
  let result = labData.value;
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(item => 
      item.material_code.toLowerCase().includes(query) || 
      item.material_name.toLowerCase().includes(query) ||
      item.test_id.toLowerCase().includes(query)
    );
  }
  
  // 分类过滤
  if (categoryFilter.value) {
    result = result.filter(item => item.category_id === categoryFilter.value);
  }
  
  // 结果过滤
  if (resultFilter.value) {
    result = result.filter(item => item.result === resultFilter.value);
  }
  
  // 排序
  if (sortBy.value) {
    result = [...result].sort((a, b) => {
      if (sortOrder.value === 'ascending') {
        return a[sortBy.value] > b[sortBy.value] ? 1 : -1;
      } else {
        return a[sortBy.value] < b[sortBy.value] ? 1 : -1;
      }
    });
  } else {
    // 默认按测试日期降序排序
    result = [...result].sort((a, b) => 
      new Date(b.test_date) - new Date(a.test_date)
    );
  }
  
  return result;
});

// 分页数据
const pagedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredData.value.slice(start, end);
});

// 统计信息
const passCount = computed(() => {
  return labData.value.filter(item => item.result === '合格').length;
});

const failCount = computed(() => {
  return labData.value.filter(item => item.result === '不合格').length;
});

const passRate = computed(() => {
  return labData.value.length ? 
    ((passCount.value / labData.value.length) * 100).toFixed(1) : 0;
});

const failRate = computed(() => {
  return labData.value.length ? 
    ((failCount.value / labData.value.length) * 100).toFixed(1) : 0;
});

const uniqueMaterialCount = computed(() => {
  const uniqueMaterials = new Set(labData.value.map(item => item.material_code));
  return uniqueMaterials.size;
});

// 方法
function refreshData() {
  // 真实环境中会从API获取刷新数据
  // 这里简单模拟更新
  labData.value = [...labDataJson];
  initCharts();
}

function handleSortChange(val) {
  if (val.prop) {
    sortBy.value = val.prop;
    sortOrder.value = val.order;
  } else {
    sortBy.value = '';
    sortOrder.value = '';
  }
}

function handleSizeChange(val) {
  pageSize.value = val;
  currentPage.value = 1;
}

function handleCurrentChange(val) {
  currentPage.value = val;
}

function handleRowClick(row) {
  viewDetail(row);
}

function viewDetail(test) {
  selectedTest.value = {
    ...test,
    images: generateMockImages(test)
  };
  detailDialogVisible.value = true;
}

function retest(test) {
  // 模拟复测操作，真实环境下打开复测表单或跳转复测页面
  console.log('复测物料:', test.material_code, '测试ID:', test.test_id);
}

function openAnalysisDialog() {
  // 模拟高级分析操作
  console.log('打开高级分析');
}

function exportData() {
  // 模拟导出操作
  console.log('导出数据');
}

function getCategoryNameById(categoryId) {
  return getCategoryName(categoryId);
}

function testResultRowClassName({ row }) {
  return row.result === '不合格' ? 'fail-row' : '';
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function generateMockImages(test) {
  // 模拟测试图片，实际应从后端获取
  if (test.result === '不合格') {
    return [
      'https://via.placeholder.com/300x200?text=测试图片1',
      'https://via.placeholder.com/300x200?text=缺陷检测'
    ];
  }
  return ['https://via.placeholder.com/300x200?text=测试图片1'];
}

function getTestItemsDetail(test) {
  // 模拟测试项目详情，实际应从后端获取完整数据
  return test.test_items.map(item => {
    const isFailed = test.failed_items && test.failed_items.includes(item);
    return {
      item: item,
      standard: getRandomStandard(item),
      result: isFailed ? getRandomFailResult(item) : getRandomPassResult(item),
      status: isFailed ? '不合格' : '合格'
    };
  });
}

function getRandomStandard(item) {
  // 模拟标准要求
  const standards = {
    '外观': '无明显划痕、变形',
    '尺寸': '公差范围±0.2mm',
    '重量': '误差范围±2%',
    '硬度': '硬度值HV 240±20',
    '强度': '抗拉强度≥500MPa',
    '电阻': '电阻值20Ω±5%',
    '耐压': '击穿电压≥1000V',
    '绝缘': '绝缘电阻≥100MΩ',
    '耐候性': '紫外线照射48h无变形',
    '应力': '应力测试通过'
  };
  return standards[item] || '符合标准要求';
}

function getRandomPassResult(item) {
  // 模拟合格的结果
  const results = {
    '外观': '无缺陷',
    '尺寸': '偏差+0.1mm',
    '重量': '偏差+1.2%',
    '硬度': 'HV 245',
    '强度': '520MPa',
    '电阻': '19.8Ω',
    '耐压': '1050V',
    '绝缘': '120MΩ',
    '耐候性': '48h无变化',
    '应力': '通过'
  };
  return results[item] || '合格';
}

function getRandomFailResult(item) {
  // 模拟不合格的结果
  const results = {
    '外观': '发现表面划痕',
    '尺寸': '偏差-0.3mm',
    '重量': '偏差+3.5%',
    '硬度': 'HV 210',
    '强度': '480MPa',
    '电阻': '22.6Ω',
    '耐压': '950V',
    '绝缘': '80MΩ',
    '耐候性': '48h出现轻微变色',
    '应力': '出现微裂缝'
  };
  return results[item] || '不合格';
}

// 图表初始化
function initCategoryChart() {
  if (!categoryChartRef.value) return;
  
  // 销毁旧实例
  if (categoryChart) categoryChart.dispose();
  
  // 计算每个类别的测试数量和合格率
  const categoryStats = {};
  materialCategories.forEach(category => {
    categoryStats[category.id] = {
      name: category.name,
      total: 0,
      pass: 0
    };
  });
  
  labData.value.forEach(item => {
    if (categoryStats[item.category_id]) {
      categoryStats[item.category_id].total++;
      if (item.result === '合格') {
        categoryStats[item.category_id].pass++;
      }
    }
  });
  
  const categories = [];
  const passRates = [];
  
  Object.values(categoryStats).forEach(stat => {
    if (stat.total > 0) {
      categories.push(stat.name);
      passRates.push(((stat.pass / stat.total) * 100).toFixed(1));
    }
  });
  
  // 创建图表
  categoryChart = echarts.init(categoryChartRef.value);
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        rotate: 30,
        interval: 0
      }
    },
    yAxis: {
      type: 'value',
      name: '合格率(%)',
      axisLabel: {
        formatter: '{value}%'
      },
      max: 100
    },
    series: [
      {
        name: '合格率',
        type: 'bar',
        data: passRates,
        itemStyle: {
          color: function(params) {
            const value = parseFloat(params.value);
            if (value >= 90) return '#67c23a';  // 高
            if (value >= 80) return '#e6a23c';  // 中
            return '#f56c6c';  // 低
          }
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%'
        }
      }
    ]
  };
  
  categoryChart.setOption(option);
}

function initFailureTypeChart() {
  if (!failureTypeChartRef.value) return;
  
  // 销毁旧实例
  if (failureTypeChart) failureTypeChart.dispose();
  
  // 计算不合格项目分布
  const failureStats = {};
  labData.value.forEach(item => {
    if (item.failed_items && item.failed_items.length > 0) {
      item.failed_items.forEach(failItem => {
        failureStats[failItem] = (failureStats[failItem] || 0) + 1;
      });
    }
  });
  
  const failureData = Object.entries(failureStats)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  
  // 创建图表
  failureTypeChart = echarts.init(failureTypeChartRef.value);
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      type: 'scroll'
    },
    series: [
      {
        name: '不合格项目',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
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
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: failureData
      }
    ]
  };
  
  failureTypeChart.setOption(option);
}

function initTrendChart() {
  if (!trendChartRef.value) return;
  
  // 销毁旧实例
  if (trendChart) trendChart.dispose();
  
  // 计算日期范围
  const now = new Date();
  let startDate;
  
  switch (timeRange.value) {
    case 'month':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }
  
  // 筛选日期范围内的数据
  const rangeData = labData.value.filter(item => {
    const testDate = new Date(item.test_date);
    return testDate >= startDate && testDate <= now;
  });
  
  // 按日期分组
  const dateGroups = {};
  rangeData.forEach(item => {
    const dateStr = item.test_date.substring(0, 10);
    if (!dateGroups[dateStr]) {
      dateGroups[dateStr] = {
        total: 0,
        pass: 0,
        fail: 0
      };
    }
    
    dateGroups[dateStr].total++;
    if (item.result === '合格') {
      dateGroups[dateStr].pass++;
    } else {
      dateGroups[dateStr].fail++;
    }
  });
  
  // 处理数据
  const dates = Object.keys(dateGroups).sort();
  const totalData = [];
  const passData = [];
  const failData = [];
  
  dates.forEach(date => {
    totalData.push(dateGroups[date].total);
    passData.push(dateGroups[date].pass);
    failData.push(dateGroups[date].fail);
  });
  
  // 创建图表
  trendChart = echarts.init(trendChartRef.value);
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['合格', '不合格', '总数']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates.map(d => formatDate(d)),
      axisLabel: {
        rotate: 45,
        interval: Math.ceil(dates.length / 10)
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '合格',
        type: 'bar',
        stack: 'total',
        data: passData,
        itemStyle: {
          color: '#67c23a'
        }
      },
      {
        name: '不合格',
        type: 'bar',
        stack: 'total',
        data: failData,
        itemStyle: {
          color: '#f56c6c'
        }
      },
      {
        name: '总数',
        type: 'line',
        data: totalData,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#409EFF'
        },
        lineStyle: {
          width: 2
        }
      }
    ]
  };
  
  trendChart.setOption(option);
}

function initCharts() {
  nextTick(() => {
    initCategoryChart();
    initFailureTypeChart();
    initTrendChart();
  });
}

// 监听时间范围变化，更新趋势图
watch(timeRange, () => {
  initTrendChart();
});

// 生命周期钩子
onMounted(() => {
  initCharts();
  
  // 窗口大小变化时重绘图表
  window.addEventListener('resize', () => {
    categoryChart && categoryChart.resize();
    failureTypeChart && failureTypeChart.resize();
    trendChart && trendChart.resize();
  });
});
</script>

<style scoped>
.lab-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 页面标题与工具栏 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  color: #409EFF;
}

.toolbar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.search-input {
  width: 240px;
}

.filter-select {
  width: 140px;
}

/* 统计卡片 */
.statistics-cards {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 15px;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  font-size: 24px;
  margin-right: 15px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.total-icon {
  background-color: #ecf5ff;
  color: #409EFF;
}

.pass-icon {
  background-color: #f0f9eb;
  color: #67c23a;
}

.fail-icon {
  background-color: #fef0f0;
  color: #f56c6c;
}

.category-icon {
  background-color: #f4f4f5;
  color: #909399;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-rate {
  font-size: 14px;
}

.success .stat-rate {
  color: #67c23a;
}

.danger .stat-rate {
  color: #f56c6c;
}

/* 图表卡片 */
.chart-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #606266;
}

.chart-wrapper {
  height: 300px;
  width: 100%;
}

.trend-chart {
  height: 350px;
}

/* 表格卡片 */
.table-card {
  margin-bottom: 20px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 表格样式 */
.fail-row {
  background-color: rgba(245, 108, 108, 0.1) !important;
}

.expanded-content {
  padding: 10px 20px;
}

/* 测试详情 */
.test-detail {
  padding: 10px;
}

.section-title {
  margin: 20px 0 10px;
  font-size: 16px;
  color: #606266;
  border-left: 4px solid #409EFF;
  padding-left: 10px;
}

.test-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.test-image {
  width: 150px;
  height: 100px;
  border-radius: 4px;
  cursor: pointer;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .toolbar {
    width: 100%;
  }
  
  .search-input,
  .filter-select {
    width: 100%;
  }
  
  .chart-wrapper {
    height: 250px;
  }
}
</style> 