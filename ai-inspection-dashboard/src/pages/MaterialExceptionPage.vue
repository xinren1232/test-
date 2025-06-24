<template>
  <div class="exception-page-container">
    <el-card class="filter-card" shadow="hover">
      <div class="filter-header">
        <h2>物料异常管理</h2>
        <div class="actions">
          <el-button type="primary" @click="exportExceptions">
            <el-icon><Download /></el-icon>导出异常记录
          </el-button>
          <el-button type="success" @click="createExceptionReport">
            <el-icon><Document /></el-icon>生成异常报告
          </el-button>
        </div>
      </div>

      <!-- 过滤条件 -->
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="物料编码">
          <el-input v-model="filterForm.materialCode" placeholder="输入物料编码" clearable />
        </el-form-item>
        <el-form-item label="物料名称">
          <el-input v-model="filterForm.materialName" placeholder="输入物料名称" clearable />
        </el-form-item>
        <el-form-item label="批次号">
          <el-input v-model="filterForm.batchNo" placeholder="输入批次号" clearable />
        </el-form-item>
        <el-form-item label="异常类型">
          <el-select v-model="filterForm.exceptionType" placeholder="选择异常类型" clearable>
            <el-option label="质量不合格" value="质量不合格" />
            <el-option label="外观缺陷" value="外观缺陷" />
            <el-option label="尺寸异常" value="尺寸异常" />
            <el-option label="参数偏差" value="参数偏差" />
            <el-option label="功能异常" value="功能异常" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="选择状态" clearable>
            <el-option label="待处理" value="待处理" />
            <el-option label="处理中" value="处理中" />
            <el-option label="已解决" value="已解决" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计卡片 -->
    <div class="statistics-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card warning" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-title">当月异常数</div>
                <div class="stat-value">{{ statistics.monthlyExceptions }}</div>
                <div class="stat-subtext">较上月 {{ statistics.monthlyTrend > 0 ? '+' : '' }}{{ statistics.monthlyTrend }}%</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card danger" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><CircleClose /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-title">待处理异常</div>
                <div class="stat-value">{{ statistics.pendingExceptions }}</div>
                <div class="stat-subtext">占比 {{ statistics.pendingRate }}%</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card primary" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><Loading /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-title">处理中异常</div>
                <div class="stat-value">{{ statistics.inProgressExceptions }}</div>
                <div class="stat-subtext">平均处理时间: {{ statistics.avgProcessingTime }}h</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card success" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-title">已解决异常</div>
                <div class="stat-value">{{ statistics.resolvedExceptions }}</div>
                <div class="stat-subtext">解决率: {{ statistics.resolveRate }}%</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 异常列表 -->
    <el-card class="exception-list-card" shadow="hover">
      <el-table 
        :data="pagedExceptions" 
        style="width: 100%" 
        border 
        stripe 
        highlight-current-row
        v-loading="loading"
      >
        <el-table-column prop="id" label="异常ID" width="120" />
        <el-table-column prop="date" label="发现日期" width="120" sortable />
        <el-table-column prop="materialCode" label="物料编码" width="120" />
        <el-table-column prop="materialName" label="物料名称" width="150" />
        <el-table-column prop="batchNumber" label="批次号" width="120" />
        <el-table-column prop="anomalyType" label="异常类型" width="120">
          <template #default="scope">
            <el-tag :type="getAnomalyTypeColor(scope.row.anomalyType)">
              {{ scope.row.anomalyType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="severity" label="严重程度" width="100">
          <template #default="scope">
            <el-tag :type="getSeverityColor(scope.row.severity)" effect="dark">
              {{ scope.row.severity }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusColor(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="responsibleDepartment" label="责任部门" width="120" />
        <el-table-column label="操作" fixed="right" width="180">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="viewExceptionDetail(scope.row)">
              <el-icon><View /></el-icon> 详情
            </el-button>
            <el-button type="success" link size="small" @click="updateExceptionStatus(scope.row)">
              <el-icon><Edit /></el-icon> 更新状态
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页控件 -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalExceptions"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          :current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 异常详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="物料异常详情"
      width="70%"
      destroy-on-close
    >
      <div v-if="selectedException" class="exception-detail">
        <div class="detail-header">
          <div class="header-info">
            <h2>{{ selectedException.materialName }} ({{ selectedException.materialCode }})</h2>
            <div class="header-meta">
              <span>异常ID: {{ selectedException.id }}</span>
              <span>批次号: {{ selectedException.batchNumber }}</span>
              <span>发现日期: {{ selectedException.date }}</span>
            </div>
          </div>
          <div class="header-status">
            <el-tag :type="getStatusColor(selectedException.status)" size="large">
              {{ selectedException.status }}
            </el-tag>
          </div>
        </div>

        <el-divider />

        <el-descriptions title="异常信息" :column="2" border>
          <el-descriptions-item label="异常类型">
            <el-tag :type="getAnomalyTypeColor(selectedException.anomalyType)">
              {{ selectedException.anomalyType }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="严重程度">
            <el-tag :type="getSeverityColor(selectedException.severity)" effect="dark">
              {{ selectedException.severity }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="责任部门">{{ selectedException.responsibleDepartment }}</el-descriptions-item>
          <el-descriptions-item label="责任人">{{ selectedException.responsiblePerson || '未指定' }}</el-descriptions-item>
          <el-descriptions-item label="异常描述" :span="2">{{ selectedException.description }}</el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <h4>解决方案</h4>
        <div v-if="selectedException.resolutionSteps && selectedException.resolutionSteps.length > 0">
          <el-timeline>
            <el-timeline-item
              v-for="(step, index) in selectedException.resolutionSteps"
              :key="index"
              :type="getTimelineItemType(index)"
              :timestamp="`步骤 ${index + 1}`"
            >
              {{ step }}
            </el-timeline-item>
          </el-timeline>
        </div>
        <el-empty v-else description="暂无解决方案" />

        <el-divider />

        <h4>相关图片</h4>
        <div v-if="selectedException.images && selectedException.images.length > 0" class="image-list">
          <el-image
            v-for="(image, index) in selectedException.images"
            :key="index"
            :src="image"
            fit="cover"
            :preview-src-list="selectedException.images"
            class="exception-image"
          />
        </div>
        <el-empty v-else description="暂无相关图片" />

        <div class="detail-actions">
          <el-button type="primary">
            <el-icon><Document /></el-icon> 生成异常报告
          </el-button>
          <el-button type="success">
            <el-icon><Edit /></el-icon> 更新状态
          </el-button>
          <el-button type="warning">
            <el-icon><AlarmClock /></el-icon> 创建跟进任务
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 状态更新对话框 -->
    <el-dialog
      v-model="statusDialogVisible"
      title="更新异常状态"
      width="50%"
      destroy-on-close
    >
      <el-form :model="statusForm" label-width="120px">
        <el-form-item label="当前状态">
          <el-tag :type="getStatusColor(statusForm.currentStatus)">{{ statusForm.currentStatus }}</el-tag>
        </el-form-item>
        <el-form-item label="新状态">
          <el-select v-model="statusForm.newStatus" placeholder="选择新状态">
            <el-option label="待处理" value="待处理" />
            <el-option label="处理中" value="处理中" />
            <el-option label="已解决" value="已解决" />
          </el-select>
        </el-form-item>
        <el-form-item label="责任人">
          <el-input v-model="statusForm.responsiblePerson" placeholder="输入责任人" />
        </el-form-item>
        <el-form-item label="解决步骤">
          <el-input
            type="textarea"
            v-model="statusForm.resolutionStep"
            rows="4"
            placeholder="请输入解决步骤或进展说明"
          />
        </el-form-item>
        <el-form-item label="预计解决日期">
          <el-date-picker
            v-model="statusForm.estimatedResolutionDate"
            type="date"
            placeholder="选择预计解决日期"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="statusDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitStatusUpdate">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  Download, Document, View, Edit, Warning, CircleClose,
  Loading, CircleCheck, AlarmClock
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();

// 数据加载状态
const loading = ref(true);

// 筛选表单
const filterForm = reactive({
  materialCode: '',
  materialName: '',
  batchNo: '',
  exceptionType: '',
  status: ''
});

// 分页
const currentPage = ref(1);
const pageSize = ref(20);
const totalExceptions = ref(0);

// 统计数据
const statistics = reactive({
  monthlyExceptions: 127,
  monthlyTrend: -12.5,
  pendingExceptions: 43,
  pendingRate: 22.4,
  inProgressExceptions: 65,
  avgProcessingTime: 48.5,
  resolvedExceptions: 92,
  resolveRate: 47.9
});

// 异常数据
const exceptions = ref([]);

// 分页后的数据
const pagedExceptions = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return exceptions.value.slice(startIndex, endIndex);
});

// 详情对话框
const detailDialogVisible = ref(false);
const selectedException = ref(null);

// 状态更新对话框
const statusDialogVisible = ref(false);
const statusForm = reactive({
  exceptionId: '',
  currentStatus: '',
  newStatus: '',
  responsiblePerson: '',
  resolutionStep: '',
  estimatedResolutionDate: null
});

// 获取异常数据
const fetchExceptionData = async () => {
  loading.value = true;
  try {
    // 模拟API请求，实际应用中应替换为真实API调用
    setTimeout(() => {
      // 生成测试数据
      const testData = generateTestData();
      exceptions.value = testData;
      totalExceptions.value = testData.length;
      loading.value = false;
    }, 500);
  } catch (error) {
    console.error('获取异常数据失败:', error);
    ElMessage.error('获取异常数据失败，请重试');
    loading.value = false;
  }
};

// 生成测试数据
const generateTestData = () => {
  const types = ['质量不合格', '外观缺陷', '尺寸异常', '参数偏差', '功能异常'];
  const severities = ['高', '中', '低'];
  const statuses = ['待处理', '处理中', '已解决'];
  const departments = ['质检部', '物料部', '生产部', '工程部', '供应商'];
  const testData = [];

  for (let i = 1; i <= 192; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const department = departments[Math.floor(Math.random() * departments.length)];

    testData.push({
      id: `EX${String(i).padStart(6, '0')}`,
      date: new Date(2025, Math.floor(Math.random() * 3), Math.floor(Math.random() * 28) + 1).toLocaleDateString('zh-CN'),
      materialCode: `M${String(Math.floor(Math.random() * 90000) + 10000)}`,
      materialName: `物料${i}`,
      batchNumber: `B${String(Math.floor(Math.random() * 90000) + 10000)}`,
      anomalyType: type,
      severity: severity,
      status: status,
      responsibleDepartment: department,
      responsiblePerson: status !== '待处理' ? `员工${Math.floor(Math.random() * 100)}` : '',
      description: `${type}：${severity}级异常，详细描述信息。影响生产线运行，需要${status === '已解决' ? '已处理' : '尽快处理'}。`,
      resolutionSteps: status !== '待处理' ? [
        '确认异常原因并记录',
        '联系相关部门协调处理',
        status === '已解决' ? '完成异常处理并验证' : '正在处理中...'
      ] : [],
      images: []
    });
  }

  return testData;
};

// 处理搜索
const handleSearch = () => {
  // 实现过滤逻辑
  const filteredData = exceptions.value.filter(item => {
    let match = true;
    
    if (filterForm.materialCode && !item.materialCode.includes(filterForm.materialCode)) {
      match = false;
    }
    
    if (filterForm.materialName && !item.materialName.includes(filterForm.materialName)) {
      match = false;
    }
    
    if (filterForm.batchNo && !item.batchNumber.includes(filterForm.batchNo)) {
      match = false;
    }
    
    if (filterForm.exceptionType && item.anomalyType !== filterForm.exceptionType) {
      match = false;
    }
    
    if (filterForm.status && item.status !== filterForm.status) {
      match = false;
    }
    
    return match;
  });
  
  exceptions.value = filteredData;
  totalExceptions.value = filteredData.length;
  currentPage.value = 1;
};

// 重置过滤器
const resetFilter = () => {
  Object.keys(filterForm).forEach(key => {
    filterForm[key] = '';
  });
  fetchExceptionData();
};

// 异常类型颜色
const getAnomalyTypeColor = (type) => {
  switch (type) {
    case '质量不合格': return 'danger';
    case '外观缺陷': return 'warning';
    case '尺寸异常': return 'info';
    case '参数偏差': return 'primary';
    case '功能异常': return 'error';
    default: return 'info';
  }
};

// 严重程度颜色
const getSeverityColor = (severity) => {
  switch (severity) {
    case '高': return 'danger';
    case '中': return 'warning';
    case '低': return 'info';
    default: return 'info';
  }
};

// 状态颜色
const getStatusColor = (status) => {
  switch (status) {
    case '待处理': return 'danger';
    case '处理中': return 'warning';
    case '已解决': return 'success';
    default: return 'info';
  }
};

// 时间线项目类型
const getTimelineItemType = (index) => {
  const types = ['primary', 'success', 'warning', 'danger', 'info'];
  return types[index % types.length];
};

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
};

// 当前页改变
const handleCurrentChange = (val) => {
  currentPage.value = val;
};

// 查看异常详情
const viewExceptionDetail = (exception) => {
  selectedException.value = exception;
  detailDialogVisible.value = true;
};

// 更新异常状态
const updateExceptionStatus = (exception) => {
  statusForm.exceptionId = exception.id;
  statusForm.currentStatus = exception.status;
  statusForm.newStatus = '';
  statusForm.responsiblePerson = exception.responsiblePerson || '';
  statusForm.resolutionStep = '';
  statusForm.estimatedResolutionDate = null;
  statusDialogVisible.value = true;
};

// 提交状态更新
const submitStatusUpdate = () => {
  if (!statusForm.newStatus) {
    ElMessage.warning('请选择新状态');
    return;
  }
  
  const exceptionIndex = exceptions.value.findIndex(item => item.id === statusForm.exceptionId);
  if (exceptionIndex !== -1) {
    // 更新状态
    exceptions.value[exceptionIndex].status = statusForm.newStatus;
    
    // 更新责任人
    if (statusForm.responsiblePerson) {
      exceptions.value[exceptionIndex].responsiblePerson = statusForm.responsiblePerson;
    }
    
    // 添加解决步骤
    if (statusForm.resolutionStep) {
      if (!exceptions.value[exceptionIndex].resolutionSteps) {
        exceptions.value[exceptionIndex].resolutionSteps = [];
      }
      exceptions.value[exceptionIndex].resolutionSteps.push(statusForm.resolutionStep);
    }
    
    ElMessage.success(`异常 ${statusForm.exceptionId} 的状态已更新为 ${statusForm.newStatus}`);
    statusDialogVisible.value = false;
    
    // 如果当前正在查看此异常的详情，同步更新
    if (selectedException.value && selectedException.value.id === statusForm.exceptionId) {
      selectedException.value = { ...exceptions.value[exceptionIndex] };
    }
  }
};

// 导出异常记录
const exportExceptions = () => {
  ElMessage({
    message: '异常记录导出功能正在开发中...',
    type: 'info'
  });
};

// 生成异常报告
const createExceptionReport = () => {
  ElMessage({
    message: '异常报告生成功能正在开发中...',
    type: 'info'
  });
};

// 组件挂载时加载数据
onMounted(() => {
  fetchExceptionData();
});
</script>

<style scoped>
.exception-page-container {
  padding-bottom: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-header h2 {
  margin: 0;
}

.actions {
  display: flex;
  gap: 10px;
}

.statistics-cards {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  font-size: 32px;
  margin-right: 15px;
}

.stat-info {
  flex-grow: 1;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 5px;
}

.stat-subtext {
  font-size: 12px;
  color: #909399;
}

.stat-card.warning .stat-icon,
.stat-card.warning .stat-value {
  color: #E6A23C;
}

.stat-card.danger .stat-icon,
.stat-card.danger .stat-value {
  color: #F56C6C;
}

.stat-card.primary .stat-icon,
.stat-card.primary .stat-value {
  color: #409EFF;
}

.stat-card.success .stat-icon,
.stat-card.success .stat-value {
  color: #67C23A;
}

.exception-list-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.exception-detail {
  padding: 0 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info h2 {
  margin: 0 0 10px 0;
}

.header-meta {
  display: flex;
  gap: 20px;
  color: #606266;
  font-size: 14px;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.exception-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
}

.detail-actions {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 15px;
}
</style> 