<template>
  <div class="inventory-page">
    <div class="page-header">
      <h1>物料库存管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="refreshData">
          <el-icon><Refresh /></el-icon>刷新数据
        </el-button>
        <el-button type="success" @click="openImportDialog">
          <el-icon><Upload /></el-icon>导入
        </el-button>
        <el-button type="warning">
          <el-icon><Download /></el-icon>导出
        </el-button>
      </div>
    </div>

    <!-- 统计概览卡片 -->
    <el-row :gutter="20" class="dashboard-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="dashboard-card total-items">
          <template #header>
            <div class="card-header">
              <h3>总物料数</h3>
              <el-icon><Goods /></el-icon>
            </div>
          </template>
          <div class="card-value-container">
            <div class="card-value">{{ dashboardData.totalItems }}</div>
            <div class="card-trend" :class="dashboardData.totalItemsTrend > 0 ? 'trend-up' : 'trend-down'">
              <el-icon v-if="dashboardData.totalItemsTrend > 0"><CaretTop /></el-icon>
              <el-icon v-else><CaretBottom /></el-icon>
              {{ Math.abs(dashboardData.totalItemsTrend) }}%
            </div>
          </div>
          <div class="card-desc">较上个月</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="dashboard-card low-stock">
          <template #header>
            <div class="card-header">
              <h3>低库存预警</h3>
              <el-icon><Warning /></el-icon>
            </div>
          </template>
          <div class="card-value-container">
            <div class="card-value">{{ dashboardData.lowStockItems }}</div>
            <div class="card-trend" :class="dashboardData.lowStockTrend > 0 ? 'trend-up' : 'trend-down'">
              <el-icon v-if="dashboardData.lowStockTrend > 0"><CaretTop /></el-icon>
              <el-icon v-else><CaretBottom /></el-icon>
              {{ Math.abs(dashboardData.lowStockTrend) }}%
            </div>
          </div>
          <div class="card-desc">较上周</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="dashboard-card quality-issues">
          <template #header>
            <div class="card-header">
              <h3>质量问题物料</h3>
              <el-icon><CircleCloseFilled /></el-icon>
            </div>
          </template>
          <div class="card-value-container">
            <div class="card-value">{{ dashboardData.qualityIssueItems }}</div>
            <div class="card-trend" :class="dashboardData.qualityIssueTrend > 0 ? 'trend-up' : 'trend-down'">
              <el-icon v-if="dashboardData.qualityIssueTrend > 0"><CaretTop /></el-icon>
              <el-icon v-else><CaretBottom /></el-icon>
              {{ Math.abs(dashboardData.qualityIssueTrend) }}%
            </div>
          </div>
          <div class="card-desc">较上周</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="dashboard-card incoming">
          <template #header>
            <div class="card-header">
              <h3>本周到货</h3>
              <el-icon><Van /></el-icon>
            </div>
          </template>
          <div class="card-value-container">
            <div class="card-value">{{ dashboardData.incomingItems }}</div>
            <div class="card-trend" :class="dashboardData.incomingTrend > 0 ? 'trend-up' : 'trend-down'">
              <el-icon v-if="dashboardData.incomingTrend > 0"><CaretTop /></el-icon>
              <el-icon v-else><CaretBottom /></el-icon>
              {{ Math.abs(dashboardData.incomingTrend) }}%
            </div>
          </div>
          <div class="card-desc">较上周</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 库存图表区域 -->
    <el-row :gutter="20" class="chart-section">
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>库存分类统计</h3>
              <el-select v-model="categoryChartPeriod" placeholder="时间范围" size="small">
                <el-option label="近7天" value="7days"></el-option>
                <el-option label="近30天" value="30days"></el-option>
                <el-option label="近3个月" value="3months"></el-option>
              </el-select>
            </div>
          </template>
          <div id="categoryChart" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>库存趋势</h3>
              <el-select v-model="trendChartPeriod" placeholder="时间范围" size="small">
                <el-option label="近7天" value="7days"></el-option>
                <el-option label="近30天" value="30days"></el-option>
                <el-option label="近3个月" value="3months"></el-option>
              </el-select>
            </div>
          </template>
          <div id="trendChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 物料表格区域 -->
    <el-card shadow="hover" class="table-card">
      <template #header>
        <div class="card-header">
          <h3>物料库存列表</h3>
          <div class="table-actions">
            <el-input
              v-model="searchQuery"
              placeholder="搜索物料编码、名称或规格"
              prefix-icon="Search"
              clearable
              @input="handleSearch"
              style="width: 300px"
            ></el-input>
            <el-select v-model="statusFilter" placeholder="状态筛选" @change="handleSearch" style="width: 150px">
              <el-option label="全部" value=""></el-option>
              <el-option label="正常" value="normal"></el-option>
              <el-option label="低库存" value="low"></el-option>
              <el-option label="缺货" value="out"></el-option>
              <el-option label="质检不合格" value="quality_issue"></el-option>
            </el-select>
          </div>
        </div>
      </template>

      <el-table 
        :data="filteredInventoryData" 
        style="width: 100%" 
        v-loading="tableLoading"
        height="450"
        stripe
      >
        <el-table-column prop="materialCode" label="物料编码" width="120" sortable></el-table-column>
        <el-table-column prop="materialName" label="物料名称" width="180"></el-table-column>
        <el-table-column prop="specification" label="规格" width="150"></el-table-column>
        <el-table-column prop="category" label="类别" width="120"></el-table-column>
        <el-table-column prop="quantity" label="库存数量" sortable width="120"></el-table-column>
        <el-table-column prop="unit" label="单位" width="80"></el-table-column>
        <el-table-column prop="minStock" label="安全库存" width="120"></el-table-column>
        <el-table-column prop="supplier" label="供应商" width="180"></el-table-column>
        <el-table-column label="库存状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="质量状态" width="120">
          <template #default="scope">
            <el-tag :type="getQualityType(scope.row)">{{ scope.row.quality }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastUpdate" label="最后更新时间" width="180"></el-table-column>
        <el-table-column label="操作" fixed="right" width="150">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="info" size="small" @click="handleHistory(scope.row)">历史</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 导入对话框 -->
    <el-dialog v-model="importDialogVisible" title="导入库存数据" width="500px" destroy-on-close>
      <el-upload
        class="upload-area"
        drag
        action="#"
        :auto-upload="false"
        :file-list="importFiles"
        accept=".xlsx,.csv"
      >
        <el-icon class="upload-icon"><Upload /></el-icon>
        <div class="upload-text">拖拽文件到此处或点击上传</div>
        <div class="upload-hint">支持 Excel(.xlsx) 或 CSV(.csv) 文件</div>
      </el-upload>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="importData">导入</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, reactive, computed } from 'vue';
import { ElMessage, ElNotification } from 'element-plus';
import { 
  Refresh, Upload, Download, Goods, Warning, CircleCloseFilled, Van, 
  Search, CaretTop, CaretBottom
} from '@element-plus/icons-vue';
import * as echarts from 'echarts/core';
import { PieChart, LineChart } from 'echarts/charts';
import { 
  TitleComponent, TooltipComponent, LegendComponent, GridComponent,
  DatasetComponent, TransformComponent 
} from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

// 注册echarts组件
echarts.use([
  TitleComponent, TooltipComponent, LegendComponent, GridComponent,
  DatasetComponent, TransformComponent, PieChart, LineChart,
  LabelLayout, UniversalTransition, CanvasRenderer
]);

export default {
  name: 'InventoryPage',
  components: {
    Refresh, Upload, Download, Goods, Warning, CircleCloseFilled, Van, Search,
    CaretTop, CaretBottom
  },
  setup() {
    // 仪表盘数据
    const dashboardData = reactive({
      totalItems: 1258,
      totalItemsTrend: 5.2,
      lowStockItems: 42,
      lowStockTrend: 12.8,
      qualityIssueItems: 15,
      qualityIssueTrend: -8.3,
      incomingItems: 78,
      incomingTrend: 24.6
    });

    // 图表配置
    const categoryChartPeriod = ref('30days');
    const trendChartPeriod = ref('30days');
    
    // 表格数据
    const inventoryData = ref([]);
    const tableLoading = ref(false);
    
    // 分页
    const currentPage = ref(1);
    const pageSize = ref(10);
    const total = ref(0);
    
    // 过滤
    const searchQuery = ref('');
    const statusFilter = ref('');
    
    // 对话框
    const importDialogVisible = ref(false);
    const importFiles = ref([]);
    
    // 过滤后的数据
    const filteredInventoryData = computed(() => {
      let data = [...inventoryData.value];
      
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        data = data.filter(item => 
          item.materialCode.toLowerCase().includes(query) ||
          item.materialName.toLowerCase().includes(query) ||
          item.specification.toLowerCase().includes(query)
        );
      }
      
      if (statusFilter.value) {
        data = data.filter(item => {
          if (statusFilter.value === 'normal') return item.status === '正常';
          if (statusFilter.value === 'low') return item.status === '低库存';
          if (statusFilter.value === 'out') return item.status === '缺货';
          if (statusFilter.value === 'quality_issue') return item.quality === '不合格';
          return true;
        });
      }
      
      total.value = data.length;
      
      // 分页
      const startIndex = (currentPage.value - 1) * pageSize.value;
      const endIndex = startIndex + pageSize.value;
      return data.slice(startIndex, endIndex);
    });
    
    // 获取库存状态样式
    const getStatusType = (row) => {
      if (row.status === '正常') return 'success';
      if (row.status === '低库存') return 'warning';
      if (row.status === '缺货') return 'danger';
      return 'info';
    };
    
    // 获取质量状态样式
    const getQualityType = (row) => {
      if (row.quality === '合格') return 'success';
      if (row.quality === '待检') return 'info';
      if (row.quality === '不合格') return 'danger';
      return '';
    };
    
    // 查询方法
    const handleSearch = () => {
      // 重置为第一页
      currentPage.value = 1;
    };
    
    // 分页方法
    const handleSizeChange = (val) => {
      pageSize.value = val;
    };
    
    const handleCurrentChange = (val) => {
      currentPage.value = val;
    };
    
    // 编辑物料
    const handleEdit = (row) => {
      console.log('编辑物料:', row);
      ElMessage.info(`编辑物料 ${row.materialName} 的信息`);
    };
    
    // 查看历史
    const handleHistory = (row) => {
      console.log('查看物料历史:', row);
      ElNotification({
        title: '物料历史记录',
        message: `查看 ${row.materialName} 的库存历史变动记录`,
        type: 'info'
      });
    };
    
    // 打开导入对话框
    const openImportDialog = () => {
      importDialogVisible.value = true;
    };
    
    // 导入数据
    const importData = () => {
      ElMessage.success('数据导入成功');
      importDialogVisible.value = false;
    };
    
    // 刷新数据
    const refreshData = () => {
      tableLoading.value = true;
      setTimeout(() => {
        fetchInventoryData();
        tableLoading.value = false;
        ElMessage.success('数据已刷新');
      }, 800);
    };

    // 获取库存数据
    const fetchInventoryData = () => {
      tableLoading.value = true;
      
      // 模拟数据 - 实际应从API获取
      setTimeout(() => {
        const mockData = [];
        for (let i = 1; i <= 150; i++) {
          // 生成库存量，有20%概率低于安全库存
          const minStock = Math.floor(Math.random() * 100) + 50;
          const quantity = Math.random() < 0.2 ? 
            Math.floor(Math.random() * minStock) : 
            minStock + Math.floor(Math.random() * 200);
          
          // 物料状态
          let status;
          if (quantity === 0) {
            status = '缺货';
          } else if (quantity < minStock) {
            status = '低库存';
          } else {
            status = '正常';
          }
          
          // 质量状态 - 85%合格，10%待检，5%不合格
          let quality;
          const qualityRandom = Math.random();
          if (qualityRandom < 0.85) {
            quality = '合格';
          } else if (qualityRandom < 0.95) {
            quality = '待检';
          } else {
            quality = '不合格';
          }
          
          // 物料类别
          const categories = ['钢材', '铝材', '铜材', '塑料', '电子元件', '化学品', '辅料'];
          const category = categories[Math.floor(Math.random() * categories.length)];
          
          // 单位
          const units = ['个', '件', '箱', '千克', '吨', '米', '卷'];
          const unit = units[Math.floor(Math.random() * units.length)];
          
          // 供应商
          const suppliers = ['钢铁集团', '铝材有限公司', '铜业科技', '塑料工业', '电子科技集团', '化工有限公司'];
          const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
          
          // 更新日期 - 最近30天内
          const today = new Date();
          const randomDays = Math.floor(Math.random() * 30);
          const updateDate = new Date(today);
          updateDate.setDate(today.getDate() - randomDays);
          
          mockData.push({
            id: i,
            materialCode: `M${String(1000 + i).padStart(4, '0')}`,
            materialName: `测试物料${i}`,
            specification: `规格${Math.floor(Math.random() * 100) + 1}`,
            category,
            quantity,
            unit,
            minStock,
            supplier,
            status,
            quality,
            lastUpdate: updateDate.toLocaleString()
          });
        }
        
        inventoryData.value = mockData;
        total.value = mockData.length;
        tableLoading.value = false;
        
        // 渲染图表
        nextTick(() => {
          renderCategoryChart();
          renderTrendChart();
        });
      }, 1000);
    };
    
    // 渲染类别分布图表
    const renderCategoryChart = () => {
      // 统计每个类别的物料数量
      const categoryCount = inventoryData.value.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});
      
      // 转换为图表所需格式
      const chartData = Object.keys(categoryCount).map(key => ({
        name: key,
        value: categoryCount[key]
      }));
      
      // 渲染图表
      const chartDom = document.getElementById('categoryChart');
      if (!chartDom) return;
      
      const myChart = echarts.init(chartDom);
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          data: Object.keys(categoryCount)
        },
        series: [
          {
            name: '物料类别',
            type: 'pie',
            radius: ['40%', '70%'],
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
                fontSize: '16',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: chartData
          }
        ]
      };
      
      myChart.setOption(option);
      
      // 窗口大小变化时自适应
      window.addEventListener('resize', () => {
        myChart.resize();
      });
    };
    
    // 渲染趋势图表
    const renderTrendChart = () => {
      const chartDom = document.getElementById('trendChart');
      if (!chartDom) return;
      
      const myChart = echarts.init(chartDom);
      
      // 模拟30天数据
      const dates = [];
      const normalData = [];
      const lowStockData = [];
      const outOfStockData = [];
      
      // 生成日期和模拟数据
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dates.push(`${date.getMonth() + 1}/${date.getDate()}`);
        
        // 模拟数据 - 使用一些波动但有趋势的数据
        normalData.push(1000 + Math.floor(Math.random() * 200) + i * 3);
        lowStockData.push(40 + Math.floor(Math.random() * 20) - i * 0.5);
        outOfStockData.push(10 + Math.floor(Math.random() * 10) - i * 0.2);
      }
      
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['正常库存', '低库存', '缺货']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: dates
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '正常库存',
            type: 'line',
            smooth: true,
            data: normalData,
            itemStyle: {
              color: '#67C23A'
            }
          },
          {
            name: '低库存',
            type: 'line',
            smooth: true,
            data: lowStockData,
            itemStyle: {
              color: '#E6A23C'
            }
          },
          {
            name: '缺货',
            type: 'line',
            smooth: true,
            data: outOfStockData,
            itemStyle: {
              color: '#F56C6C'
            }
          }
        ]
      };
      
      myChart.setOption(option);
      
      // 窗口大小变化时自适应
      window.addEventListener('resize', () => {
        myChart.resize();
      });
    };
    
    // 生命周期钩子
    onMounted(() => {
      // 获取数据
      fetchInventoryData();
    });
    
    return {
      // 数据
      dashboardData,
      inventoryData,
      filteredInventoryData,
      tableLoading,
      
      // 图表
      categoryChartPeriod,
      trendChartPeriod,
      
      // 分页
      currentPage,
      pageSize,
      total,
      
      // 过滤
      searchQuery,
      statusFilter,
      
      // 导入
      importDialogVisible,
      importFiles,
      
      // 方法
      getStatusType,
      getQualityType,
      handleSearch,
      handleSizeChange,
      handleCurrentChange,
      handleEdit,
      handleHistory,
      openImportDialog,
      importData,
      refreshData
    };
  }
};
</script>

<style scoped>
.inventory-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.dashboard-cards {
  margin-bottom: 24px;
}

.dashboard-card {
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.total-items .card-header {
  color: #409EFF;
}

.low-stock .card-header {
  color: #E6A23C;
}

.quality-issues .card-header {
  color: #F56C6C;
}

.incoming .card-header {
  color: #67C23A;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 400;
}

.card-value-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 5px;
}

.card-value {
  font-size: 28px;
  font-weight: bold;
  margin-right: 10px;
}

.card-trend {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.trend-up {
  color: #67C23A;
}

.trend-down {
  color: #F56C6C;
}

.card-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.chart-section {
  margin-bottom: 24px;
}

.chart-card {
  height: 400px;
}

.chart-container {
  width: 100%;
  height: 330px;
}

.table-card {
  margin-bottom: 24px;
}

.table-actions {
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.upload-area {
  width: 100%;
}

.upload-icon {
  font-size: 48px;
  color: #909399;
  margin-bottom: 10px;
}

.upload-text {
  color: #606266;
  font-size: 16px;
  text-align: center;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}
</style> 
 