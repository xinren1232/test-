<template>
  <div class="batch-management-container" v-loading="loading">
    <el-card class="box-card search-card">
       <template #header>
        <div class="card-header">
          <span>筛选查询</span>
        </div>
      </template>
      <el-form :model="searchFilters" inline class="search-form">
        <el-form-item label="关键词">
          <el-input v-model="searchFilters.keyword" placeholder="批次号 / 物料编码" clearable></el-input>
        </el-form-item>
        <el-form-item label="供应商">
           <el-select v-model="searchFilters.supplier" placeholder="选择供应商" clearable>
            <el-option v-for="s in uniqueSuppliers" :key="s" :label="s" :value="s"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="批次状态">
          <el-select v-model="searchFilters.status" placeholder="选择状态" clearable>
            <el-option label="合格" value="passed"></el-option>
            <el-option label="不合格" value="failed"></el-option>
            <el-option label="风险" value="risk"></el-option>
            <el-option label="已使用" value="used"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="入库日期">
          <el-date-picker v-model="searchFilters.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card data-table-card">
       <template #header>
        <div class="card-header">
          <span>批次列表</span>
        </div>
      </template>
      <el-table :data="paginatedData" stripe style="width: 100%">
        <el-table-column prop="batchNumber" label="批次号" width="180" fixed sortable></el-table-column>
        <el-table-column prop="materialCode" label="物料编码" width="150"></el-table-column>
        <el-table-column prop="materialName" label="物料名称" width="180"></el-table-column>
        <el-table-column prop="supplier" label="供应商" width="180"></el-table-column>
        <el-table-column prop="totalQuantity" label="总数量" width="120" sortable></el-table-column>
        <el-table-column prop="itemCount" label="物料条目" width="120" sortable></el-table-column>
        <el-table-column prop="receiveDate" label="入库日期" width="150" sortable></el-table-column>
        <el-table-column label="综合状态" width="120" fixed="right">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.overallStatus)">
              {{ getStatusText(scope.row.overallStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="viewBatchDetail(scope.row)">
              详情 <el-icon class="el-icon--right"><ArrowRight /></el-icon>
            </el-button>
             <el-button link type="danger" size="small" @click="deleteBatch(scope.row)">
              <el-icon><Delete /></el-icon> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        layout="prev, pager, next, total"
        :total="filteredBatches.length"
        :current-page="currentPage"
        :page-size="pageSize"
        @current-change="handlePageChange"
        class="pagination">
      </el-pagination>
    </el-card>

    <el-dialog v-model="detailDialogVisible" :title="`批次 ${selectedBatch?.batchNumber} 详情`" width="70%" destroy-on-close>
        <div v-if="selectedBatch">
            <el-descriptions :column="3" border>
                <el-descriptions-item label="批次号">{{ selectedBatch.batchNumber }}</el-descriptions-item>
                <el-descriptions-item label="物料编码">{{ selectedBatch.materialCode }}</el-descriptions-item>
                <el-descriptions-item label="物料名称">{{ selectedBatch.materialName }}</el-descriptions-item>
                <el-descriptions-item label="供应商">{{ selectedBatch.supplier }}</el-descriptions-item>
                <el-descriptions-item label="入库日期">{{ selectedBatch.receiveDate }}</el-descriptions-item>
                <el-descriptions-item label="综合状态">
                    <el-tag :type="getStatusTagType(selectedBatch.overallStatus)">
                        {{ getStatusText(selectedBatch.overallStatus) }}
                    </el-tag>
                </el-descriptions-item>
                 <el-descriptions-item label="物料条目数">{{ selectedBatch.itemCount }}</el-descriptions-item>
                <el-descriptions-item label="总数量">{{ selectedBatch.totalQuantity }}</el-descriptions-item>
            </el-descriptions>
            <h4 style="margin-top: 20px;">批次内物料列表</h4>
            <el-table :data="selectedBatch.items" stripe border max-height="400px">
                <el-table-column property="storageLocation" label="库位"></el-table-column>
                <el-table-column property="quantity" label="数量"></el-table-column>
                <el-table-column property="status" label="库存状态">
                     <template #default="scope">
                        <el-tag :type="getStatusTagType(scope.row.status)" size="small">{{ scope.row.status }}</el-tag>
                    </template>
                </el-table-column>
                 <el-table-column property="inspectionStatus" label="检验状态">
                     <template #default="scope">
                        <el-tag :type="getStatusTagType(scope.row.inspectionStatus)" size="small">{{ scope.row.inspectionStatus }}</el-tag>
                    </template>
                 </el-table-column>
                <el-table-column property="testStatus" label="测试状态">
                     <template #default="scope">
                        <el-tag :type="getStatusTagType(scope.row.testStatus)" size="small">{{ scope.row.testStatus || 'N/A' }}</el-tag>
                    </template>
                </el-table-column>
                 <el-table-column property="expirationDate" label="过期日期"></el-table-column>
            </el-table>
        </div>
    </el-dialog>

  </div>
</template>

<style scoped>
.batch-management-container {
  padding: 20px;
  background-color: #f0f2f5;
}
.search-card, .data-table-card {
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useInventoryAnalysis } from '@/composables/useInventoryAnalysis';
import { Search, Refresh, InfoFilled, Warning, CircleCheck, Delete, ArrowRight } from '@element-plus/icons-vue';

const { batchAnalysis, fetchData: fetchCoreData } = useInventoryAnalysis();

const loading = ref(true);
const searchFilters = ref({
  keyword: '',
  supplier: '',
  status: '',
  dateRange: null,
});
const currentPage = ref(1);
const pageSize = ref(10);
const detailDialogVisible = ref(false);
const selectedBatch = ref(null);

const uniqueSuppliers = computed(() => {
  const suppliers = new Set(batchAnalysis.value.map(batch => batch.supplier));
  return Array.from(suppliers);
});

const filteredBatches = computed(() => {
  return batchAnalysis.value
    .filter(batch => {
      const filter = searchFilters.value;
      const itemDate = filter.dateRange ? new Date(batch.receiveDate) : null;
      const startDate = filter.dateRange ? new Date(filter.dateRange[0]) : null;
      const endDate = filter.dateRange ? new Date(filter.dateRange[1]) : null;

      const keywordMatch = !filter.keyword || 
                           batch.batchNumber.includes(filter.keyword) || 
                           batch.materialCode.includes(filter.keyword);

      return (
        keywordMatch &&
        (!filter.supplier || batch.supplier === filter.supplier) &&
        (!filter.status || batch.overallStatus === filter.status) &&
        (!filter.dateRange || (itemDate >= startDate && itemDate <= endDate))
      );
    });
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredBatches.value.slice(start, end);
});

const getStatusText = (status) => {
  const map = {
    passed: '合格',
    failed: '不合格',
    risk: '风险',
    used: '已使用',
    pending: '待检验',
  };
  return map[status] || '未知';
};

const getStatusTagType = (status) => {
  const map = {
    passed: 'success',
    failed: 'danger',
    risk: 'warning',
    used: 'info',
    pending: 'primary',
  };
  return map[status] || '';
};


const fetchData = async () => {
  loading.value = true;
  await fetchCoreData();
  loading.value = false;
};

onMounted(fetchData);

const handleSearch = () => {
  currentPage.value = 1;
};

const handleReset = () => {
  searchFilters.value = {
    keyword: '',
    supplier: '',
    status: '',
    dateRange: null,
  };
  handleSearch();
};

const handlePageChange = (page) => {
  currentPage.value = page;
};

const viewBatchDetail = (batch) => {
  selectedBatch.value = batch;
  detailDialogVisible.value = true;
};

const deleteBatch = (batch) => {
  ElMessageBox.confirm(
    `确定要删除批次 ${batch.batchNumber} 吗？此操作不可恢复。`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // Here you would call a service to delete the batch.
    // For now, we just show a message.
    ElMessage.success(`批次 ${batch.batchNumber} 已被删除 (模拟)`);
  }).catch(() => {});
};

</script>
 
 