<template>
  <div class="lab-view" v-loading="loading">
    <el-card class="box-card search-card">
      <el-form :model="searchFilters" inline class="search-form">
        <el-form-item label="物料编码">
          <el-input v-model="searchFilters.materialCode" placeholder="输入物料编码" clearable></el-input>
        </el-form-item>
        <el-form-item label="供应商">
          <el-input v-model="searchFilters.supplier" placeholder="输入供应商名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="检验状态">
          <el-select v-model="searchFilters.testStatus" placeholder="选择状态" clearable>
            <el-option label="通过" value="Pass"></el-option>
            <el-option label="失败" value="Fail"></el-option>
            <el-option label="有条件通过" value="Conditional Pass"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="测试日期">
          <el-date-picker v-model="searchFilters.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-tabs v-model="activeTab" class="lab-tabs">
      <el-tab-pane label="分析洞察" name="analysis">
        <el-row :gutter="20" class="stats-cards">
          <el-col :span="6">
            <el-card shadow="hover">
              <div class="stat-item">
                <el-icon :size="40" color="#409EFC"><InfoFilled /></el-icon>
                <div>
                  <div class="stat-value">{{ labAnalysis.totalTests }}</div>
                  <div class="stat-label">总测试批次</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
               <div class="stat-item">
                <el-icon :size="40" color="#67C23A"><CircleCheck /></el-icon>
                <div>
                  <div class="stat-value">{{ labAnalysis.passRate }}%</div>
                  <div class="stat-label">检验合格率</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <div class="stat-item">
                <el-icon :size="40" color="#E6A23C"><Warning /></el-icon>
                <div>
                  <div class="stat-value truncate" :title="labAnalysis.topDefectDescription">{{ labAnalysis.topDefectDescription }}</div>
                  <div class="stat-label">主要不合格原因</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
               <div class="stat-item">
                <el-icon :size="40" color="#F56C6C"><Warning /></el-icon>
                <div>
                  <div class="stat-value truncate" :title="labAnalysis.topDefectSupplier">{{ labAnalysis.topDefectSupplier }}</div>
                  <div class="stat-label">主要不合格供应商</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <el-card class="box-card chart-card">
           <template #header>
            <div class="card-header">
              <span>不合格分析</span>
              <el-button class="button" text :icon="Document" @click="generateNgReport">生成不合格报告</el-button>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="12">
              <v-chart class="chart" :option="reasonChartOption" autoresize />
            </el-col>
            <el-col :span="12">
              <v-chart class="chart" :option="supplierChartOption" autoresize />
            </el-col>
          </el-row>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="数据列表" name="data">
        <el-card class="box-card data-table-card">
          <template #header>
            <div class="card-header">
              <span>检验记录</span>
              <el-button type="success" :icon="Download" @click="exportData">导出数据</el-button>
            </div>
          </template>
          <el-table :data="paginatedData" stripe style="width: 100%">
            <el-table-column prop="materialCode" label="物料编码" width="150"></el-table-column>
            <el-table-column prop="materialName" label="物料名称" width="180"></el-table-column>
            <el-table-column prop="batchNumber" label="批次号" width="180"></el-table-column>
            <el-table-column prop="supplier" label="供应商" width="180"></el-table-column>
            <el-table-column prop="testDate" label="测试日期" width="150"></el-table-column>
            <el-table-column prop="testStatus" label="测试结果" width="120">
               <template #default="scope">
                <el-tag :type="scope.row.testStatus === 'Pass' ? 'success' : scope.row.testStatus === 'Fail' ? 'danger' : 'warning'">
                  {{ scope.row.testStatus }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="testDefectDescription" label="不合格描述"></el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button link type="primary" size="small" @click="viewDetails(scope.row)">
                  详情 <el-icon class="el-icon--right"><ArrowRight /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            background
            layout="prev, pager, next"
            :total="filteredLabData.length"
            :current-page="currentPage"
            :page-size="pageSize"
            @current-change="handlePageChange"
            class="pagination">
          </el-pagination>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>


<style scoped>
.lab-view {
  padding: 20px;
  background-color: #1a1a1a;
  color: #fff;
}
.search-card {
  margin-bottom: 20px;
}
.stats-cards {
  margin-bottom: 20px;
}
.stat-item {
  display: flex;
  align-items: center;
}
.stat-item .el-icon {
  margin-right: 15px;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
}
.stat-label {
  color: #999;
}
.chart-card {
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chart {
  height: 300px;
}
.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
:deep(.el-card), :deep(.el-table), :deep(.el-tabs__header) {
    background-color: #2c2c2c !important;
    color: #fff !important;
    border: 1px solid #444;
}
:deep(.el-table th), :deep(.el-table tr), :deep(.el-table td) {
    background-color: #2c2c2c !important;
    color: #fff !important;
    border-bottom: 1px solid #444;
}
:deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background-color: #383838 !important;
}
:deep(.el-input__wrapper), :deep(.el-select__wrapper) {
  background-color: #333 !important;
  box-shadow: none;
}
:deep(.el-input__inner), :deep(.el-select__placeholder) {
  color: #fff;
}
:deep(.el-tabs__item.is-active) {
    color: #409EFC !important;
}
:deep(.el-tabs__item) {
    color: #aaa;
}
:deep(.el-pagination.is-background .el-pager li), :deep(.el-pagination.is-background .btn-next), :deep(.el-pagination.is-background .btn-prev) {
    background-color: #333;
    color: #fff;
}
:deep(.el-pagination.is-background .el-pager li.is-active) {
    background-color: #409EFC;
}
</style>
