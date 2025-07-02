<template>
  <div class="batch-management-container">
    <div class="page-header">
      <div class="title-section">
          <h2>物料批次管理</h2>
        <span class="subtitle">管理所有物料批次的生命周期和质量状态</span>
      </div>
      
      <div class="actions">
        <el-button type="primary" @click="refreshBatchData" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新数据
            </el-button>
        
          </div>
        </div>
      
    <!-- 搜索和过滤部分 -->
    <div class="filter-section">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-select v-model="filters.supplier" placeholder="供应商" clearable>
            <el-option label="全部" value="" />
              <el-option 
                v-for="supplier in suppliers" 
                :key="supplier.id" 
                :label="supplier.name" 
                :value="supplier.id" 
              />
            </el-select>
          </el-col>
          <el-col :span="8">
            <el-select v-model="filters.status" placeholder="批次状态" clearable>
            <el-option label="全部" value="" />
              <el-option label="待检验" value="pending" />
            <el-option label="合格" value="passed" />
            <el-option label="不合格" value="rejected" />
              <el-option label="已使用" value="used" />
            </el-select>
          </el-col>
          <el-col :span="8">
          <div class="date-filter">
            <el-date-picker
              v-model="filters.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </div>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="filter-row">
          <el-col :span="8">
            <el-input 
              v-model="filters.keyword" 
              placeholder="批次号/物料编码" 
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          </el-col>
          <el-col :span="8">
          <el-select v-model="filters.sortBy" placeholder="创建时间（新→旧）">
              <el-option label="创建时间（新→旧）" value="createdDesc" />
              <el-option label="创建时间（旧→新）" value="createdAsc" />
            <el-option label="不良率（高→低）" value="defectDesc" />
            <el-option label="不良率（低→高）" value="defectAsc" />
            </el-select>
          </el-col>
          <el-col :span="8" class="filter-buttons">
            <el-button type="primary" @click="applyFilters">
            <el-icon><Search /></el-icon> 搜索
            </el-button>
            <el-button @click="resetFilters">
            <el-icon><Refresh /></el-icon> 重置
            </el-button>
          </el-col>
        </el-row>
      </div>
      
      <!-- 批次数据表格 -->
      <el-table 
        :data="filteredBatchList" 
        border 
        stripe 
        style="width: 100%"
        v-loading="loading"
        @sort-change="handleSortChange"
      >
      <el-table-column prop="batch_id" label="批次号" sortable width="120" />
      <el-table-column prop="material_code" label="物料编码" width="120" />
      <el-table-column prop="material_name" label="物料名称" width="150" />
      <el-table-column prop="supplier_name" label="供应商" width="150" />
      <el-table-column prop="quantity" label="数量" sortable width="80" />
      <el-table-column prop="created_date" label="入库日期" sortable width="120">
          <template #default="scope">
          {{ formatDate(scope.row.created_date) }}
          </template>
        </el-table-column>
      <el-table-column prop="line_exceptions" label="产线异常" sortable width="120" align="center">
          <template #default="scope">
          <el-popover v-if="scope.row.line_exceptions > 0" placement="top" trigger="hover" :width="350">
            <template #reference>
              <el-tag type="danger" effect="dark" style="cursor: pointer;">
                {{ scope.row.line_exceptions }} 次
              </el-tag>
            </template>
            <div class="exception-popover">
              <div class="popover-title">产线异常详情</div>
              <ul>
                <li v-for="(detail, index) in scope.row.line_exception_details.slice(0, 5)" :key="index">
                  <strong>{{ detail.date }}:</strong> 在 {{ detail.location }} 发现异常, 不良率 {{ (detail.defect_rate * 100).toFixed(2) }}%
                </li>
              </ul>
              <div v-if="scope.row.line_exception_details.length > 5" class="popover-footer">
                ...等共 {{ scope.row.line_exception_details.length }} 条记录
              </div>
            </div>
          </el-popover>
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column prop="test_exceptions" label="测试异常" sortable width="120" align="center">
        <template #default="scope">
          <el-popover v-if="scope.row.test_exceptions > 0" placement="top" trigger="hover" :width="350">
            <template #reference>
              <el-tag type="warning" effect="dark" style="cursor: pointer;">
                {{ scope.row.test_exceptions }} 次
            </el-tag>
            </template>
            <div class="exception-popover">
              <div class="popover-title">测试异常详情</div>
              <ul>
                <li v-for="(detail, index) in scope.row.test_exception_details.slice(0, 5)" :key="index">
                  <strong>{{ detail.date }}:</strong> {{ detail.test_item }} - {{ detail.defect_desc }}
                </li>
              </ul>
              <div v-if="scope.row.test_exception_details.length > 5" class="popover-footer">
                ...等共 {{ scope.row.test_exception_details.length }} 条记录
              </div>
            </div>
          </el-popover>
          <span v-else>无</span>
          </template>
        </el-table-column>
      <el-table-column label="批次状态" width="120">
          <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <div class="table-actions">
            <el-button type="primary" link size="small" @click="viewBatchDetail(scope.row)">
                详情
              </el-button>
            <el-button 
              type="warning" 
              link 
              size="small" 
              @click="showRiskAnalysis(scope.row)"
            >
              风险分析
              </el-button>
            <el-button type="info" link size="small" @click="showTraceability(scope.row)">
                追溯
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalItems"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    
    <!-- 批次详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="批次详情汇总"
      width="80%"
      destroy-on-close
    >
      <div v-if="selectedBatch" class="batch-detail-container">
        <!-- 批次基本信息卡片 -->
        <el-card class="detail-card">
          <template #header>
            <div class="card-header">
              <h3>批次基本信息</h3>
              <el-tag :type="getStatusTagType(selectedBatch.status)" size="large">
                {{ getStatusText(selectedBatch.status) }}
              </el-tag>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="detail-item">
                <span class="detail-label">批次号</span>
                <span class="detail-value">{{ selectedBatch.batch_id }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="detail-label">物料编码</span>
                <span class="detail-value">{{ selectedBatch.material_code }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="detail-label">物料名称</span>
                <span class="detail-value">{{ selectedBatch.material_name }}</span>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="mt-20">
            <el-col :span="8">
              <div class="detail-item">
                <span class="detail-label">供应商</span>
                <span class="detail-value">{{ selectedBatch.supplier_name }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="detail-label">数量</span>
                <span class="detail-value">{{ selectedBatch.quantity }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="detail-label">入库日期</span>
                <span class="detail-value">{{ formatDate(selectedBatch.created_date) }}</span>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="mt-20">
            <el-col :span="8">
              <div class="detail-item">
                <span class="detail-label">生产日期</span>
                <span class="detail-value">{{ formatDate(selectedBatch.production_date) }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="detail-label">风险评级</span>
                <span class="detail-value">
                  <el-tag :type="getRiskTagType(selectedBatch.risk_level)" effect="dark">
                    {{ getRiskLevelText(selectedBatch.risk_level) }}
                  </el-tag>
                </span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="detail-label">批次备注</span>
                <span class="detail-value">{{ selectedBatch.notes || '无' }}</span>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 质量状态卡片 -->
        <el-card class="detail-card">
          <template #header>
            <div class="card-header">
              <h3>质量状态</h3>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="detail-item">
                <span class="detail-label">不良率</span>
                <span class="detail-value" :class="getDefectRateTextClass(selectedBatch.defect_rate)">
                  {{ (selectedBatch.defect_rate * 100).toFixed(2) }}%
                </span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="detail-label">质量状态</span>
                <span class="detail-value">{{ getQualityStatus() }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="detail-label">供应商质量评分</span>
                <span class="detail-value">{{ getSupplierQualityScore() }}</span>
              </div>
            </el-col>
          </el-row>
          
          <div class="quality-chart-container mt-20">
            <div ref="detailQualityChartRef" style="width: 100%; height: 300px;"></div>
          </div>
        </el-card>

        <!-- 库存信息卡片 -->
        <el-card class="detail-card" v-if="materialInventoryData || selectedBatch.inventory">
          <template #header>
            <div class="card-header">
              <h3>库存信息</h3>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="detail-item">
                <span class="detail-label">库存数量</span>
                <span class="detail-value">{{ (materialInventoryData || selectedBatch.inventory)?.remainQuantity || 0 }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="detail-label">已用数量</span>
                <span class="detail-value">{{ (materialInventoryData || selectedBatch.inventory)?.useQuantity || 0 }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="detail-label">入库时间</span>
                <span class="detail-value">{{ formatDate((materialInventoryData || selectedBatch.inventory)?.inboundTime || selectedBatch.created_date) }}</span>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="mt-20">
            <el-col :span="8">
              <div class="detail-item">
                <span class="detail-label">仓库位置</span>
                <span class="detail-value">{{ (materialInventoryData || selectedBatch.inventory)?.warehouseLocation || (materialInventoryData || selectedBatch.inventory)?.location || '未记录' }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="detail-label">检验员</span>
                <span class="detail-value">{{ (materialInventoryData || selectedBatch.inventory)?.inspector || '未记录' }}</span>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 产线使用信息卡片 -->
        <el-card class="detail-card" v-if="materialProductionData || selectedBatch.production">
          <template #header>
            <div class="card-header">
              <h3>产线使用信息</h3>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="detail-item">
                <span class="detail-label">产线名称</span>
                <span class="detail-value">{{ (materialProductionData || selectedBatch.production)?.line || '未记录' }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="detail-label">工厂</span>
                <span class="detail-value">{{ (materialProductionData || selectedBatch.production)?.factory || '未记录' }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="detail-label">车间</span>
                <span class="detail-value">{{ (materialProductionData || selectedBatch.production)?.workshop || '未记录' }}</span>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="mt-20">
            <el-col :span="8">
              <div class="detail-item">
                <span class="detail-label">使用时间</span>
                <span class="detail-value">{{ formatDate((materialProductionData || selectedBatch.production)?.useTime || selectedBatch.created_date) }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="detail-label">使用数量</span>
                <span class="detail-value">{{ (materialProductionData || selectedBatch.production)?.useQuantity || selectedBatch.quantity }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="detail-label">项目</span>
                <span class="detail-value">{{ (materialProductionData || selectedBatch.production)?.project || (materialProductionData || selectedBatch.production)?.project_display || '未记录' }}</span>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 测试记录信息卡片 -->
        <el-card class="detail-card" v-if="materialTestData || selectedBatch.test">
          <template #header>
            <div class="card-header">
              <h3>测试记录信息</h3>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="detail-item">
                <span class="detail-label">测试编号</span>
                <span class="detail-value">{{ (materialTestData || selectedBatch.test)?.id || (materialTestData || selectedBatch.test)?.testId || '未记录' }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="detail-label">测试日期</span>
                <span class="detail-value">{{ formatDate((materialTestData || selectedBatch.test)?.testDate || selectedBatch.created_date) }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="detail-label">测试项目</span>
                <span class="detail-value">{{ (materialTestData || selectedBatch.test)?.testItem || '常规检测' }}</span>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="mt-20">
            <el-col :span="8">
              <div class="detail-item">
                <span class="detail-label">测试结果</span>
                <span class="detail-value">
                  <el-tag :type="getTestResultType((materialTestData || selectedBatch.test)?.result || getStatusByBatchStatus())">
                    {{ (materialTestData || selectedBatch.test)?.result || getStatusByBatchStatus() }}
                  </el-tag>
                </span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="detail-label">测试员</span>
                <span class="detail-value">{{ (materialTestData || selectedBatch.test)?.tester || '未记录' }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="detail-label">审核员</span>
                <span class="detail-value">{{ (materialTestData || selectedBatch.test)?.reviewer || '未记录' }}</span>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="mt-20">
            <el-col :span="24">
              <div class="detail-item">
                <span class="detail-label">不良现象</span>
                <span class="detail-value">{{ (materialTestData || selectedBatch.test)?.defectDesc || selectedBatch.notes || '无' }}</span>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 批次生命周期 -->
        <el-card class="detail-card">
          <template #header>
            <div class="card-header">
              <h3>批次生命周期</h3>
            </div>
          </template>
          <el-steps :active="getBatchLifecycleStep()" finish-status="success" class="batch-lifecycle-steps">
            <el-step title="创建入库" :description="getBatchLifecycleDate('created')" />
            <el-step title="质量检验" :description="getBatchLifecycleDate('inspected')" />
            <el-step title="生产上线" :description="getBatchLifecycleDate('production')" />
            <el-step title="最终检测" :description="getBatchLifecycleDate('final')" />
          </el-steps>
          
          <div class="batch-timeline mt-20">
            <el-timeline>
              <el-timeline-item
                v-for="(activity, index) in getBatchActivities()"
                :key="index"
                :timestamp="activity.timestamp"
                :type="activity.type"
                :color="activity.color"
                :size="activity.size"
              >
                {{ activity.content }}
                <div v-if="activity.details" class="activity-details">
                  {{ activity.details }}
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>

        <!-- 上线不良率 -->
        <el-card class="detail-card" v-if="getBatchOnlineRecords().length > 0">
          <template #header>
            <div class="card-header">
              <h3>上线不良率</h3>
            </div>
          </template>
          <el-table :data="getBatchOnlineRecords()" border style="width: 100%">
            <el-table-column prop="factory" label="工厂" width="100" />
            <el-table-column prop="line" label="产线" width="120" />
            <el-table-column prop="project" label="项目" width="150" />
            <el-table-column prop="onlineDate" label="上线日期" width="150" />
            <el-table-column prop="quantity" label="数量" width="80" />
            <el-table-column label="不良率" width="100">
              <template #default="scope">
                <span :class="getDefectRateTextClass(scope.row.defectRate / 100)">
                  {{ scope.row.defectRate.toFixed(2) }}%
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="defect" label="不良现象" />
          </el-table>
          
          <div class="defect-trend-chart-container mt-20">
            <div ref="detailDefectTrendChartRef" style="width: 100%; height: 300px;"></div>
          </div>
        </el-card>

        <!-- 关联产品信息 -->
        <el-card class="detail-card" v-if="getRelatedProducts().length > 0">
          <template #header>
            <div class="card-header">
              <h3>关联产品信息</h3>
            </div>
          </template>
          <el-table :data="getRelatedProducts()" border style="width: 100%">
            <el-table-column prop="product_id" label="产品ID" />
            <el-table-column prop="product_name" label="产品名称" />
            <el-table-column prop="production_date" label="生产日期" />
            <el-table-column prop="status" label="状态">
              <template #default="scope">
                <el-tag :type="getProductStatusType(scope.row.status)">
                  {{ scope.row.status === 'completed' ? '已完成' : 
                     scope.row.status === 'in_progress' ? '生产中' : 
                     scope.row.status === 'pending' ? '待生产' : scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button type="primary" size="small" @click="viewProductDetail(scope.row)">
                  查看产品
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
    </el-dialog>
    
    <!-- 批次追溯对话框 -->
    <el-dialog
      v-model="traceabilityVisible"
      title="批次追溯"
      width="80%"
    >
      <div v-if="selectedBatch" class="traceability-container">
        <el-descriptions
          title="批次基本信息"
          :column="3"
          border
        >
          <el-descriptions-item label="批次号">{{ selectedBatch.batch_id }}</el-descriptions-item>
          <el-descriptions-item label="物料编码">{{ selectedBatch.material_code }}</el-descriptions-item>
          <el-descriptions-item label="物料名称">{{ selectedBatch.material_name }}</el-descriptions-item>
          <el-descriptions-item label="供应商">{{ selectedBatch.supplier_name }}</el-descriptions-item>
          <el-descriptions-item label="数量">{{ selectedBatch.quantity }}</el-descriptions-item>
          <el-descriptions-item label="入库日期">{{ formatDate(selectedBatch.created_date) }}</el-descriptions-item>
          <el-descriptions-item label="生产日期">{{ formatDate(selectedBatch.production_date) }}</el-descriptions-item>
        </el-descriptions>
        
        <!-- 批次生命周期图示 -->
        <div class="batch-lifecycle">
          <h4>批次生命周期</h4>
          <el-steps :active="getBatchLifecycleStep()" finish-status="success">
            <el-step title="创建入库" :description="getBatchLifecycleDate('created')" />
            <el-step title="质量检验" :description="getBatchLifecycleDate('inspected')" />
            <el-step title="生产上线" :description="getBatchLifecycleDate('production')" />
            <el-step title="最终检测" :description="getBatchLifecycleDate('final')" />
          </el-steps>
        </div>
        
        <el-tabs v-model="activeTab" class="material-lifecycle-tabs">
          <el-tab-pane label="批次跟踪记录" name="activities">
        <el-timeline>
          <el-timeline-item
                v-for="(activity, index) in getBatchActivities()"
            :key="index"
            :timestamp="activity.timestamp"
            :type="activity.type"
            :color="activity.color"
            :icon="activity.icon"
            :size="activity.size"
          >
            {{ activity.content }}
            <div v-if="activity.details" class="activity-details">
              {{ activity.details }}
            </div>
          </el-timeline-item>
        </el-timeline>
          </el-tab-pane>

          <el-tab-pane label="物料库存信息" name="inventory">
            <el-descriptions
              title="库存详情"
              :column="3"
              border
              v-if="materialInventoryData || selectedBatch.inventory"
            >
              <el-descriptions-item label="物料编码">{{ (materialInventoryData || selectedBatch.inventory)?.materialCode || selectedBatch.material_code }}</el-descriptions-item>
              <el-descriptions-item label="物料名称">{{ (materialInventoryData || selectedBatch.inventory)?.materialName || selectedBatch.material_name }}</el-descriptions-item>
              <el-descriptions-item label="批次号">{{ (materialInventoryData || selectedBatch.inventory)?.batchNo || selectedBatch.batch_id }}</el-descriptions-item>
              <el-descriptions-item label="供应商">{{ (materialInventoryData || selectedBatch.inventory)?.supplier || selectedBatch.supplier_name }}</el-descriptions-item>
              <el-descriptions-item label="库存数量">{{ (materialInventoryData || selectedBatch.inventory)?.remainQuantity || 0 }}</el-descriptions-item>
              <el-descriptions-item label="已用数量">{{ (materialInventoryData || selectedBatch.inventory)?.useQuantity || 0 }}</el-descriptions-item>
              <el-descriptions-item label="状态">{{ getStatusText(selectedBatch.status) }}</el-descriptions-item>
              <el-descriptions-item label="入库时间">{{ (materialInventoryData || selectedBatch.inventory)?.inboundTime || selectedBatch.created_date }}</el-descriptions-item>
              <el-descriptions-item label="仓库位置">{{ (materialInventoryData || selectedBatch.inventory)?.warehouseLocation || (materialInventoryData || selectedBatch.inventory)?.location || '未记录' }}</el-descriptions-item>
              <el-descriptions-item label="检验员">{{ (materialInventoryData || selectedBatch.inventory)?.inspector || '未记录' }}</el-descriptions-item>
            </el-descriptions>
            <el-empty v-else description="未找到库存信息" />
          </el-tab-pane>

          <el-tab-pane label="产线使用信息" name="production">
            <el-descriptions
              title="产线使用详情"
              :column="3"
              border
              v-if="materialProductionData || selectedBatch.production"
            >
              <el-descriptions-item label="产线名称">{{ (materialProductionData || selectedBatch.production)?.line || '未记录' }}</el-descriptions-item>
              <el-descriptions-item label="工厂">{{ (materialProductionData || selectedBatch.production)?.factory || '未记录' }}</el-descriptions-item>
              <el-descriptions-item label="车间">{{ (materialProductionData || selectedBatch.production)?.workshop || '未记录' }}</el-descriptions-item>
              <el-descriptions-item label="使用时间">{{ (materialProductionData || selectedBatch.production)?.useTime || selectedBatch.created_date }}</el-descriptions-item>
              <el-descriptions-item label="使用数量">{{ (materialProductionData || selectedBatch.production)?.useQuantity || selectedBatch.quantity }}</el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="getStatusTagType(selectedBatch.status)">
                  {{ getStatusText(selectedBatch.status) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="质量状态">{{ getQualityStatus() }}</el-descriptions-item>
              <el-descriptions-item label="风险等级">
                <el-tag :type="getRiskTagType(selectedBatch.risk_level)">
                  {{ getRiskLevelText(selectedBatch.risk_level) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="项目">{{ (materialProductionData || selectedBatch.production)?.project || (materialProductionData || selectedBatch.production)?.project_display || '未记录' }}</el-descriptions-item>
            </el-descriptions>
            <el-empty v-else description="未找到产线使用信息" />
          </el-tab-pane>

          <el-tab-pane label="测试记录信息" name="test">
            <el-descriptions
              title="物料测试详情"
              :column="3"
              border
              v-if="materialTestData || selectedBatch.test"
            >
              <el-descriptions-item label="测试编号">{{ (materialTestData || selectedBatch.test)?.id || (materialTestData || selectedBatch.test)?.testId || '未记录' }}</el-descriptions-item>
              <el-descriptions-item label="测试日期">{{ (materialTestData || selectedBatch.test)?.testDate || selectedBatch.created_date }}</el-descriptions-item>
              <el-descriptions-item label="测试项目">{{ (materialTestData || selectedBatch.test)?.testItem || '常规检测' }}</el-descriptions-item>
              <el-descriptions-item label="测试结果">
                <el-tag :type="getTestResultType((materialTestData || selectedBatch.test)?.result || getStatusByBatchStatus())">
                  {{ (materialTestData || selectedBatch.test)?.result || getStatusByBatchStatus() }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="缺陷率">{{ (selectedBatch.defect_rate * 100).toFixed(2) }}%</el-descriptions-item>
              <el-descriptions-item label="测试源">{{ (materialTestData || selectedBatch.test)?.testSource || '常规检测' }}</el-descriptions-item>
              <el-descriptions-item label="测试员">{{ (materialTestData || selectedBatch.test)?.tester || '未记录' }}</el-descriptions-item>
              <el-descriptions-item label="审核员">{{ (materialTestData || selectedBatch.test)?.reviewer || '未记录' }}</el-descriptions-item>
              <el-descriptions-item label="不良现象" :span="2">{{ (materialTestData || selectedBatch.test)?.defectDesc || selectedBatch.notes || '无' }}</el-descriptions-item>
            </el-descriptions>
            <el-empty v-else description="未找到测试记录信息" />
          </el-tab-pane>

          <el-tab-pane label="关联产品信息" name="products">
            <el-table :data="getRelatedProducts()" border style="width: 100%">
          <el-table-column prop="product_id" label="产品ID" />
          <el-table-column prop="product_name" label="产品名称" />
          <el-table-column prop="production_date" label="生产日期" />
          <el-table-column prop="status" label="状态">
            <template #default="scope">
              <el-tag :type="getProductStatusType(scope.row.status)">
                {{ scope.row.status === 'completed' ? '已完成' : 
                   scope.row.status === 'in_progress' ? '生产中' : 
                   scope.row.status === 'pending' ? '待生产' : scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button type="primary" size="small" @click="viewProductDetail(scope.row)">
                查看产品
              </el-button>
            </template>
          </el-table-column>
        </el-table>
            <el-empty v-if="getRelatedProducts().length === 0" description="未找到关联产品信息" />
          </el-tab-pane>
          
          <!-- 新增质量统计标签页 -->
          <el-tab-pane label="质量统计" name="quality">
            <div class="quality-stats" v-if="selectedBatch">
              <div class="quality-chart-container">
                <div ref="qualityChartRef" id="qualityDefectChart" style="width: 100%; height: 300px;"></div>
              </div>
              
              <el-divider content-position="center">质量评估</el-divider>
              
              <div class="quality-metrics">
                <el-row :gutter="20">
                  <el-col :span="8">
                    <div class="metric-card">
                      <div class="metric-title">批次不良率</div>
                      <div class="metric-value" :class="getDefectRateTextClass(selectedBatch.defect_rate)">
                        {{ (selectedBatch.defect_rate * 100).toFixed(2) }}%
                      </div>
                      <div class="metric-comparison">
                        {{ getDefectRateComparison() }}
                      </div>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="metric-card">
                      <div class="metric-title">供应商质量评分</div>
                      <div class="metric-value">
                        {{ getSupplierQualityScore() }}
                      </div>
                      <div class="metric-comparison">
                        {{ getSupplierRanking() }}
                      </div>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="metric-card">
                      <div class="metric-title">批次风险评级</div>
                      <div class="metric-value">
                        <el-tag :type="getRiskTagType(selectedBatch.risk_level)" effect="dark" size="large">
                          {{ getRiskLevelText(selectedBatch.risk_level) }}
                        </el-tag>
                      </div>
                      <div class="metric-comparison">
                        {{ getRiskRecommendation() }}
                      </div>
                    </div>
                  </el-col>
                </el-row>
              </div>
              
              <!-- 上线不良率分板 -->
              <el-divider content-position="center">上线不良率</el-divider>
              
              <div v-if="getBatchOnlineRecords().length > 0">
                <el-table :data="getBatchOnlineRecords()" border style="width: 100%; margin-bottom: 20px;">
                  <el-table-column prop="factory" label="工厂" width="100" />
                  <el-table-column prop="line" label="产线" width="120" />
                  <el-table-column prop="project" label="项目" width="150" />
                  <el-table-column prop="onlineDate" label="上线日期" width="150" />
                  <el-table-column prop="quantity" label="数量" width="80" />
                  <el-table-column label="不良率" width="100">
                    <template #default="scope">
                      <span :class="getDefectRateTextClass(scope.row.defectRate / 100)">
                        {{ scope.row.defectRate.toFixed(2) }}%
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="defect" label="不良现象" />
                </el-table>
              </div>
              <el-empty v-else description="未找到上线不良率记录" />
              
              <div class="defect-trend-chart-container" style="margin-top: 20px;">
                <div ref="defectTrendChartRef" id="defectTrendChart" style="width: 100%; height: 300px;"></div>
              </div>
            </div>
            <el-empty v-else description="未找到质量统计信息" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import * as echarts from 'echarts';
import { unifiedDataService } from '../services/UnifiedDataService';
import BatchService from '../services/BatchService';
import { h } from 'vue';

const router = useRouter();

// 供应商列表
const suppliers = ref([])

// 物料-供应商匹配关系
const materialSupplierMap = {
  // 电子元件类
  'M1': 1, // 富士康
  'M2': 2, // 欧菲光
  'M3': 1, // 富士康
  'M4': 3, // 蓝思
  // 连接器类
  'M5': 4, // 立讯
  'M6': 4, // 立讯
  // 结构件类
  'M7': 3, // 蓝思
  'M8': 5, // 富宇
  'M9': 5, // 富宇
  // 默认供应商
  'default': 1 // 默认富士康
}

// 根据物料编码获取对应供应商ID
function getSupplierIdByMaterialCode(materialCode) {
  if (!materialCode) return 1; // 默认返回富士康
  
  // 提取物料编码前缀(前两个字符)
  const prefix = materialCode.substring(0, 2);
  
  // 查找匹配的供应商
  return materialSupplierMap[prefix] || materialSupplierMap['default'];
}

// 根据供应商ID获取供应商名称
function getSupplierNameById(supplierId) {
  const supplier = suppliers.value.find(s => s.id === supplierId);
  return supplier ? supplier.name : '未知供应商';
}

// 批次管理状态
const loading = ref(false)
const dialogVisible = ref(false)
const traceabilityVisible = ref(false)
const detailDialogVisible = ref(false)
const selectedBatch = ref(null)
const batchList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)
const activeTab = ref('activities')

// 物料全生命周期数据
const materialInventoryData = ref(null)
const materialProductionData = ref(null)
const materialTestData = ref(null)
const materialTestParameters = ref([])

// 图表引用
const qualityChartRef = ref(null)
const defectTrendChartRef = ref(null)
const detailQualityChartRef = ref(null)
const detailDefectTrendChartRef = ref(null)

// 过滤条件
const filters = ref({
  supplier: '',
  status: '',
  dateRange: [],
  keyword: '',
  sortBy: 'createdDesc'
})

// 批次追溯活动记录
const batchActivities = ref([
  {
    content: '批次创建',
    timestamp: '2023-06-01 09:30',
    type: 'primary',
    color: '#0bbd87',
    size: 'large'
  },
  {
    content: '入库检验',
    timestamp: '2023-06-02 11:20',
    type: 'success',
    details: '抽检合格率 98.5%，检验人员: 张工'
  },
  {
    content: '质量抽检',
    timestamp: '2023-06-03 14:00',
    type: 'warning',
    details: '发现2个小问题，已要求供应商改进'
  },
  {
    content: '生产投料',
    timestamp: '2023-06-10 08:15',
    type: 'info'
  },
  {
    content: '用于产品组装',
    timestamp: '2023-06-15 13:45',
    type: 'success'
  }
])

// 关联产品信息
const relatedProducts = ref([
  {
    product_id: 'P2023061501',
    product_name: 'iPhone 14 Pro Max 后盖组件',
    production_date: '2023-06-15',
    status: 'completed'
  },
  {
    product_id: 'P2023061502',
    product_name: 'iPhone 14 Pro 后盖组件',
    production_date: '2023-06-15',
    status: 'completed'
  },
  {
    product_id: 'P2023061601',
    product_name: 'iPhone 14 后盖组件',
    production_date: '2023-06-16',
    status: 'in_progress'
  }
])

// 应用过滤和排序后的批次列表
const filteredBatchList = computed(() => {
  let data = [...batchList.value]
  
  // 应用物料类别过滤
  if (filters.value.category) {
    data = data.filter(item => item.category_id === filters.value.category)
  }
  
  // 应用供应商过滤
  if (filters.value.supplier) {
    data = data.filter(item => item.supplier_id === filters.value.supplier)
  }
  
  // 应用状态过滤
  if (filters.value.status) {
    data = data.filter(item => item.status === filters.value.status)
  }
  
  // 应用日期范围过滤
  if (filters.value.dateRange && filters.value.dateRange.length === 2) {
    const startDate = new Date(filters.value.dateRange[0])
    const endDate = new Date(filters.value.dateRange[1])
    
    data = data.filter(item => {
      const itemDate = new Date(item.created_date)
      return itemDate >= startDate && itemDate <= endDate
    })
  }
  
  // 应用关键词搜索
  if (filters.value.keyword) {
    const keyword = filters.value.keyword.toLowerCase()
    data = data.filter(item => 
      item.batch_id.toLowerCase().includes(keyword) || 
      item.material_code.toLowerCase().includes(keyword) ||
      item.material_name.toLowerCase().includes(keyword)
    )
  }
  
  // 应用排序
  switch (filters.value.sortBy) {
    case 'createdDesc':
      data.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      break
    case 'createdAsc':
      data.sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
      break
    case 'defectDesc':
      data.sort((a, b) => b.defect_rate - a.defect_rate)
      break
    case 'defectAsc':
      data.sort((a, b) => a.defect_rate - b.defect_rate)
      break
  }
  
  // 更新总数
  totalItems.value = data.length
  
  // 返回当前页的数据
  const startIndex = (currentPage.value - 1) * pageSize.value
  return data.slice(startIndex, startIndex + pageSize.value)
})

// 处理页面大小变化
function handleSizeChange(size) {
  pageSize.value = size
  console.log('每页显示数量变更为:', size)
}

// 处理页码变化
function handleCurrentChange(page) {
  currentPage.value = page
  console.log('当前页码变更为:', page)
}

// 应用过滤器
function applyFilters() {
  currentPage.value = 1
  ElMessage.success('已应用筛选条件')
}

// 重置过滤器
function resetFilters() {
  filters.value = {
    category: '',
    supplier: '',
    status: '',
    dateRange: [],
    keyword: '',
    sortBy: 'createdDesc'
  }
  
  currentPage.value = 1
  ElMessage.info('已重置筛选条件')
}

// 处理排序变化
function handleSortChange({ column, prop, order }) {
  console.log('排序变更:', { column, prop, order })
}

// 获取不良率文本样式类
function getDefectRateTextClass(rate) {
  if (rate === undefined || rate === null) return 'low'
  
  const numRate = typeof rate === 'string' ? parseFloat(rate) : rate
  
  if (isNaN(numRate)) return 'low'
  
  if (numRate > 0.025) return 'high'
  if (numRate > 0.01) return 'medium'
  return 'low'
}

// 获取不良率对比信息
function getDefectRateComparison() {
  if (!selectedBatch.value) return '';
  
  const defectRate = selectedBatch.value.defect_rate * 100;
  
  if (defectRate < 0.5) return '优于行业平均水平80%';
  if (defectRate < 1) return '优于行业平均水平50%';
  if (defectRate < 1.5) return '接近行业平均水平';
  if (defectRate < 2) return '略低于行业平均水平';
  return '显著低于行业平均水平';
}

// 获取状态标签类型
function getStatusTagType(status) {
  switch (status) {
    case 'pending': return 'info';
    case 'processing': return 'warning';
    case 'passed': return 'success';
    case 'rejected': return 'danger';
    case 'used': return 'primary';
    default: return 'info';
  }
}

// 获取状态文本
function getStatusText(status) {
  switch (status) {
    case 'pending': return '待检验';
    case 'processing': return '检验中';
    case 'passed': return '合格';
    case 'rejected': return '不合格';
    case 'used': return '已使用';
    default: return '未知';
  }
}

// 获取风险标签类型
function getRiskTagType(level) {
  switch (level) {
    case 'high': return 'danger';
    case 'medium': return 'warning';
    case 'low': return 'success';
    default: return 'info';
  }
}

// 获取风险等级文本
function getRiskLevelText(level) {
  switch (level) {
    case 'high': return '高风险';
    case 'medium': return '中风险';
    case 'low': return '低风险';
    default: return '未知';
  }
}

// 获取产品状态类型
function getProductStatusType(status) {
  switch (status) {
    case 'completed': return 'success'
    case 'in_progress': return 'warning'
    case 'planned': return 'info'
    default: return 'info'
  }
}

// 获取产品状态文本
function getProductStatusText(status) {
  switch (status) {
    case 'completed': return '已完成'
    case 'in_progress': return '生产中'
    case 'planned': return '已计划'
    default: return '未知'
  }
}

// 查看批次详情
function viewBatchDetail(row) {
  selectedBatch.value = row;
  
  // 查询相关数据
  findMaterialTestData(row.material_code);
  findMaterialInventoryData(row.material_code);
  findMaterialProductionData(row.material_code);
  
  // 重新生成批次活动时间线
  generateBatchTimeline(row);
  
  // 关联产品数据
  generateRelatedProducts(row);
  
  // 显示详情对话框
  detailDialogVisible.value = true;
  
  // 等待DOM更新后初始化图表
  nextTick(() => {
    try {
      // 渲染质量统计图
      renderDetailQualityChart();
      
      // 渲染缺陷趋势图
      renderDetailDefectTrendChart();
    } catch (error) {
      console.error('初始化图表失败:', error);
    }
  });
}

// 获取批次状态对应的测试状态
function getStatusByBatchStatus() {
  if (!selectedBatch.value) return '未知';
  
  switch (selectedBatch.value.status) {
    case 'passed': return '合格';
    case 'rejected': return 'NG';
    case 'pending': return '待检验';
    case 'processing': return '检验中';
    case 'used': return '已使用';
    default: return '未知';
  }
}

// 解析不良率
function parseDefectRate(defectRate) {
  if (defectRate === undefined || defectRate === null) return 0
  
  if (typeof defectRate === 'number') {
    // 确保值在0-1之间
    return defectRate > 1 ? defectRate / 100 : defectRate
  }
  
  if (typeof defectRate === 'string') {
    // 移除百分号并转为小数
    const rate = parseFloat(defectRate.replace('%', ''))
    return isNaN(rate) ? 0 : (rate > 1 ? rate / 100 : rate)
  }
  
  return 0
}

// 根据测试结果映射批次状态
function mapTestResultToStatus(result) {
  if (!result) return 'pending'
  
  const resultLower = typeof result === 'string' ? result.toLowerCase() : ''
  
  if (resultLower.includes('ng') || resultLower.includes('不合格') || resultLower.includes('fail')) {
    return 'rejected'
  }
  
  if (resultLower.includes('合格') || resultLower.includes('ok') || resultLower.includes('pass')) {
    return 'passed'
  }
  
  if (resultLower.includes('条件') || resultLower.includes('观察')) {
    return 'processing'
  }
  
  return 'pending'
}

// 根据风险评分获取风险等级
function getRiskLevelFromScore(score) {
  if (score === undefined || score === null) return 'low'
  
  const numScore = typeof score === 'string' ? parseFloat(score) : score
  
  if (isNaN(numScore)) return 'low'
  
  if (numScore >= 70) return 'high'
  if (numScore >= 40) return 'medium'
  return 'low'
}

// 根据不良率获取风险等级
function getRiskLevelFromDefectRate(rate) {
  if (rate >= 0.02) return 'high'
  if (rate >= 0.01) return 'medium'
  return 'low'
}

// 获取批次生命周期阶段
function getBatchLifecycleStep() {
  if (!selectedBatch.value) return 1;
  
  switch (selectedBatch.value.status) {
    case 'pending': return 1;
    case 'processing': return 2;
    case 'passed': return 3;
    case 'rejected': return 3;
    case 'used': return 4;
    default: return 1;
  }
}

// 获取批次生命周期日期
function getBatchLifecycleDate(stage) {
  if (!selectedBatch.value) return '';
  
  switch (stage) {
    case 'created': 
      return selectedBatch.value.created_date || '-';
    case 'inspected':
      return selectedBatch.value.test?.testDate || '-';
    case 'production':
      return selectedBatch.value.production?.useTime || '-';
    case 'final':
      return selectedBatch.value.production?.useTime ? 
        new Date(new Date(selectedBatch.value.production.useTime).getTime() + 86400000).toISOString().split('T')[0] : '-';
    default:
      return '-';
  }
}

// 获取批次活动记录
function getBatchActivities() {
  if (!selectedBatch.value) return [];
  
  const activities = [];
  const batch = selectedBatch.value;
  
  // 添加批次创建记录
  activities.push({
    content: '批次创建入库',
    timestamp: batch.created_date || new Date().toISOString().split('T')[0],
    type: 'primary',
    color: '#0bbd87',
    size: 'large',
    details: `批次号: ${batch.batch_id}, 物料编码: ${batch.material_code}, 数量: ${batch.quantity}`
  });
  
  // 如果有测试记录，添加测试活动
  if (batch.test || materialTestData.value) {
    const testData = batch.test || materialTestData.value;
    const testResult = testData.result || batch.status;
    const testType = testResult === 'passed' ? 'success' : 
                    (testResult === 'rejected' ? 'danger' : 'warning');
    
    activities.push({
      content: '质量检验',
      timestamp: testData.testDate || batch.created_date,
      type: testType,
      details: `检验结果: ${getStatusText(testResult)}, 不良率: ${(batch.defect_rate * 100).toFixed(2)}%, ${testData.defectDesc || batch.notes || ''}`
    });
  }
  
  // 如果有生产记录，添加生产活动
  if (batch.production || materialProductionData.value) {
    const prodData = batch.production || materialProductionData.value;
    
    activities.push({
      content: '生产投料使用',
      timestamp: prodData.useTime || batch.created_date,
      type: 'info',
      details: `工厂: ${prodData.factory || '未记录'}, 产线: ${prodData.line || '未记录'}, 项目: ${prodData.project || prodData.project_display || '未记录'}`
    });
    
    // 添加生产完成记录
    const useDate = new Date(prodData.useTime || batch.created_date);
    const completeDate = new Date(useDate.getTime() + 86400000); // 假设一天后完成
    
    activities.push({
      content: '生产完成',
      timestamp: completeDate.toISOString().split('T')[0],
      type: 'success'
    });
  }
  
  return activities;
}

// 获取关联产品
function getRelatedProducts() {
  if (!selectedBatch.value) return [];
  
  // 如果批次有关联产品数据，直接返回
  if (selectedBatch.value.relatedProducts && selectedBatch.value.relatedProducts.length > 0) {
    return selectedBatch.value.relatedProducts;
  }
  
  // 如果批次没有关联产品数据，但有生产记录，生成模拟关联产品
  if (selectedBatch.value.production || materialProductionData.value) {
    const prodData = selectedBatch.value.production || materialProductionData.value;
    const useDate = new Date(prodData.useTime || selectedBatch.value.created_date);
    
    // 生成1-3个关联产品
    const count = Math.floor(Math.random() * 3) + 1;
    const products = [];
    
    for (let i = 0; i < count; i++) {
      const productDate = new Date(useDate.getTime() + i * 86400000);
      const dateStr = productDate.toISOString().split('T')[0];
      const dateCode = dateStr.replace(/-/g, '').substring(2); // 例如230615
      
      let productStatus = '';
      switch(i) {
        case 0: productStatus = 'completed'; break;
        case 1: productStatus = 'in_progress'; break;
        default: productStatus = 'pending';
      }
      
      products.push({
        product_id: `P${dateCode}${String(i+1).padStart(2, '0')}`,
        product_name: `${prodData.project || '产品'} ${selectedBatch.value.material_name} 组件`,
        production_date: dateStr,
        status: productStatus
      });
    }
    
    return products;
  }
  
  // 如果没有生产记录，返回空数组
  return [];
}



// 获取质量状态
function getQualityStatus() {
  if (!selectedBatch.value) return '未知';
  
  const defectRate = selectedBatch.value.defect_rate;
  
  if (defectRate > 0.025) return '不合格';
  if (defectRate > 0.01) return '有条件合格';
  return '合格';
}

// 获取供应商质量评分
function getSupplierQualityScore() {
  if (!selectedBatch.value) return 0;
  
  // 基于不良率计算评分，满分100
  const defectRate = selectedBatch.value.defect_rate;
  let score = 100 - (defectRate * 1000);
  
  // 确保分数在0-100之间
  score = Math.max(0, Math.min(100, score));
  
  return Math.round(score);
}

// 获取供应商排名
function getSupplierRanking() {
  if (!selectedBatch.value) return '';
  
  const score = getSupplierQualityScore();
  
  if (score >= 90) return '供应商质量表现优秀';
  if (score >= 80) return '供应商质量表现良好';
  if (score >= 70) return '供应商质量表现一般';
  return '供应商质量需改进';
}

// 获取风险建议
function getRiskRecommendation(batch) {
  if (!batch) return '无法评估风险，请检查批次数据。';
  
  if (batch.risk_level === 'high') {
    return '建议暂停使用该批次物料，进行全面质量评估并联系供应商进行质量复核。';
  } else if (batch.risk_level === 'medium') {
    return '建议加强该批次物料的质量监控，对生产过程进行重点监控，并考虑增加抽检频率。';
  } else {
    return '该批次物料风险较低，可正常使用，建议按照常规质量管理流程进行监控。';
  }
}

// 初始化质量图表
function initQualityChart() {
  nextTick(() => {
    renderQualityChart();
    renderDefectTrendChart();
  });
}

// 渲染质量图表
const renderQualityChart = () => {
  if (!selectedBatch.value || !qualityChartRef.value) return;
  
  const chartDom = qualityChartRef.value;
  const myChart = echarts.init(chartDom);
  
  const option = {
    title: {
      text: '批次质量缺陷分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: ['外观缺陷', '功能缺陷', '尺寸偏差', '材料问题', '其他']
    },
    series: [
      {
        name: '缺陷类型',
        type: 'pie',
        radius: '55%',
        center: ['50%', '60%'],
        data: [
          { value: Math.round(selectedBatch.value.defect_rate * 100 * 0.4), name: '外观缺陷' },
          { value: Math.round(selectedBatch.value.defect_rate * 100 * 0.25), name: '功能缺陷' },
          { value: Math.round(selectedBatch.value.defect_rate * 100 * 0.15), name: '尺寸偏差' },
          { value: Math.round(selectedBatch.value.defect_rate * 100 * 0.1), name: '材料问题' },
          { value: Math.round(selectedBatch.value.defect_rate * 100 * 0.1), name: '其他' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
  
  myChart.setOption(option);
}

// 渲染不良趋势图表
const renderDefectTrendChart = () => {
  if (!selectedBatch.value || !defectTrendChartRef.value) return;
  
  const chartDom = defectTrendChartRef.value;
  const myChart = echarts.init(chartDom);
  
  // 获取批次上线记录
  const onlineRecords = getBatchOnlineRecords();
  
  // 如果有上线记录，使用实际数据
  let dates = [];
  let defectRates = [];
  
  if (onlineRecords.length > 0) {
    // 按日期排序
    onlineRecords.sort((a, b) => new Date(a.onlineDate) - new Date(b.onlineDate));
    
    // 提取日期和不良率
    dates = onlineRecords.map(record => record.onlineDate);
    defectRates = onlineRecords.map(record => record.defectRate);
  } else {
    // 如果没有上线记录，生成模拟数据
    // 生成过去7天的日期
    const currentDate = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    // 生成模拟的不良率数据，围绕当前批次的不良率波动
    const defectRate = selectedBatch.value.defect_rate;
    defectRates = dates.map(() => {
      // 在当前不良率基础上随机波动±30%
      const variation = (Math.random() * 0.6 - 0.3) * defectRate;
      return (defectRate + variation) * 100; // 转换为百分比
    });
  }
  
  const option = {
    title: {
      text: '批次不良率趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '不良率',
        type: 'line',
        data: defectRates.map(rate => rate.toFixed(2)),
        markLine: {
          data: [
            { 
              name: '警戒线', 
              yAxis: 2.5,
              lineStyle: { color: '#FF0000' }
            },
            { 
              name: '注意线', 
              yAxis: 1.0,
              lineStyle: { color: '#FFCC00' }
            }
          ]
        }
      }
    ]
  };
  
  myChart.setOption(option);
}

// 获取批次的上线记录
function getBatchOnlineRecords() {
  if (!selectedBatch.value) return [];
  
  // 如果批次有上线记录数组，直接返回
  if (selectedBatch.value.onlineRecords && selectedBatch.value.onlineRecords.length > 0) {
    return selectedBatch.value.onlineRecords;
  }
  
  // 如果批次没有上线记录数组，但有生产记录，创建一条模拟上线记录
  if (selectedBatch.value.production || materialProductionData.value) {
    const prodData = selectedBatch.value.production || materialProductionData.value;
    
    return [{
      factory: prodData.factory || '未知工厂',
      line: prodData.line || '未知产线',
      project: prodData.project || prodData.project_display || '未知项目',
      onlineDate: prodData.useTime || selectedBatch.value.created_date,
      quantity: prodData.quantity || selectedBatch.value.quantity || 0,
      defectRate: selectedBatch.value.defect_rate * 100, // 转换为百分比显示
      defect: prodData.defect || selectedBatch.value.notes || ''
    }];
  }
  
  return [];
}

// 渲染详情页质量图表
const renderDetailQualityChart = () => {
  if (!selectedBatch.value || !detailQualityChartRef.value) return;
  
  const chartDom = detailQualityChartRef.value;
  const myChart = echarts.init(chartDom);
  
  const option = {
    title: {
      text: '批次质量缺陷分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: ['外观缺陷', '功能缺陷', '尺寸偏差', '材料问题', '其他']
    },
    series: [
      {
        name: '缺陷类型',
        type: 'pie',
        radius: '55%',
        center: ['50%', '60%'],
        data: [
          { value: Math.round(selectedBatch.value.defect_rate * 100 * 0.4), name: '外观缺陷' },
          { value: Math.round(selectedBatch.value.defect_rate * 100 * 0.25), name: '功能缺陷' },
          { value: Math.round(selectedBatch.value.defect_rate * 100 * 0.15), name: '尺寸偏差' },
          { value: Math.round(selectedBatch.value.defect_rate * 100 * 0.1), name: '材料问题' },
          { value: Math.round(selectedBatch.value.defect_rate * 100 * 0.1), name: '其他' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
  
  myChart.setOption(option);
}

// 渲染详情页不良趋势图表
const renderDetailDefectTrendChart = () => {
  if (!selectedBatch.value || !detailDefectTrendChartRef.value) return;
  
  const chartDom = detailDefectTrendChartRef.value;
  const myChart = echarts.init(chartDom);
  
  // 获取批次上线记录
  const onlineRecords = getBatchOnlineRecords();
  
  // 如果有上线记录，使用实际数据
  let dates = [];
  let defectRates = [];
  
  if (onlineRecords.length > 0) {
    // 按日期排序
    onlineRecords.sort((a, b) => new Date(a.onlineDate) - new Date(b.onlineDate));
    
    // 提取日期和不良率
    dates = onlineRecords.map(record => record.onlineDate);
    defectRates = onlineRecords.map(record => record.defectRate);
  } else {
    // 如果没有上线记录，生成模拟数据
    // 生成过去7天的日期
    const currentDate = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    // 生成模拟的不良率数据，围绕当前批次的不良率波动
    const defectRate = selectedBatch.value.defect_rate;
    defectRates = dates.map(() => {
      // 在当前不良率基础上随机波动±30%
      const variation = (Math.random() * 0.6 - 0.3) * defectRate;
      return (defectRate + variation) * 100; // 转换为百分比
    });
  }
  
  const option = {
    title: {
      text: '批次不良率趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '不良率',
        type: 'line',
        data: defectRates.map(rate => rate.toFixed(2)),
        markLine: {
          data: [
            { 
              name: '警戒线', 
              yAxis: 2.5,
              lineStyle: { color: '#FF0000' }
            },
            { 
              name: '注意线', 
              yAxis: 1.0,
              lineStyle: { color: '#FFCC00' }
            }
          ]
        }
      }
    ]
  };
  
  myChart.setOption(option);
}

// 生成批次时间线
function generateBatchTimeline(batch) {
  if (!batch) return;
  
  // 这里可以根据批次数据生成时间线
  // 默认情况下使用现有的batchActivities
}

// 生成关联产品
function generateRelatedProducts(batch) {
  if (!batch) return;
  
  // 如果批次已有关联产品，不需要生成
  if (batch.relatedProducts && batch.relatedProducts.length > 0) return;
  
  // 否则生成模拟关联产品数据
  const products = getRelatedProducts();
  if (products.length > 0) {
    batch.relatedProducts = products;
  }
}

// 获取批次数据
const fetchBatchData = async () => {
  loading.value = true;
  try {
    let inventoryData = unifiedDataService.getInventoryData();
    
    // 如果没有数据，则生成并保存模拟数据
    if (!inventoryData || inventoryData.length === 0) {
      console.warn("库存数据为空，将自动生成模拟数据。");
      
      // 直接调用服务来生成和保存数据
      const mockInventory = unifiedDataService.generateAndSaveInventoryData(50);
      const mockLab = unifiedDataService.generateAndSaveLabData(100, mockInventory);
      const mockFactory = unifiedDataService.generateAndSaveFactoryData(80, mockInventory);
      
      // 重新获取数据
      inventoryData = mockInventory;
    }

    const factoryData = unifiedDataService.getFactoryData();
    const labData = unifiedDataService.getLabData();

    // 在这里整合数据
    const aggregatedData = aggregateBatchData(inventoryData, factoryData, labData);
    batchList.value = aggregatedData;

  } catch (error) {
    ElMessage.error('获取批次数据失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 整合批次数据
const aggregateBatchData = (inventory, factory, lab) => {
  const batchMap = new Map();

  // 1. 从库存数据初始化
  inventory.forEach(item => {
    // 统一使用 batchId
    const batchId = item.batchId || item.batchNo;
    if (!batchId) return;

    if (!batchMap.has(batchId)) {
      batchMap.set(batchId, {
        batch_id: batchId,
        material_code: item.materialCode,
        material_name: item.materialName,
        supplier_name: item.supplier,
        quantity: item.quantity,
        created_date: item.storageDate || item.inboundTime || new Date().toISOString().split('T')[0],
        status: item.status,
        risk_level: item.riskLevel || 'low',
        defect_rate: 0,
        line_exceptions: 0,
        test_exceptions: 0,
        line_exception_details: [],
        test_exception_details: []
      });
    }
  });

  // 2. 统计产线异常
  factory.forEach(item => {
    const batchId = item.batchId || item.batchNo;
    if (!batchId || !batchMap.has(batchId)) return;

    const batch = batchMap.get(batchId);
    
    // 确保数据类型正确
    const defectRate = parseFloat(item.defectRate || 0);
    const exceptionCount = parseInt(item.exceptionCount || 0);

    // 检查是否有不良率或异常计数
    if (defectRate > 0 || exceptionCount > 0) {
      // 增加产线异常计数
      batch.line_exceptions += 1;
      
      // 记录异常详情
      batch.line_exception_details.push({
        date: item.onlineDate || item.useTime,
        location: `${item.factory || ''} ${item.line || ''}`,
        defect_rate: defectRate,
        exception_count: exceptionCount
      });
      
      // 更新批次不良率为最大值
      batch.defect_rate = Math.max(batch.defect_rate, defectRate);
    }
  });

  // 3. 统计测试异常
  lab.forEach(item => {
    const batchId = item.batchId || item.batchNo;
    if (!batchId || !batchMap.has(batchId)) return;

    const batch = batchMap.get(batchId);
    
    // 检查测试结果是否为NG
    const result = (item.result || '').toLowerCase();
    if (result === 'ng' || result.includes('不合格') || result.includes('fail')) {
      
      // 增加测试异常计数
      batch.test_exceptions += 1;
      
      // 记录异常详情
      batch.test_exception_details.push({
        date: item.testDate,
        test_item: item.testItem || '常规检测',
        result: item.result,
        defect_desc: item.defectDesc || '未记录'
      });
      
      // 给批次增加基础不良率
      batch.defect_rate = Math.max(batch.defect_rate, 0.01);
    }
  });

  return Array.from(batchMap.values());
};


// 刷新数据
const refreshBatchData = () => {
  fetchBatchData();
  ElMessage.success('批次数据已刷新');
};

// ... existing code ...
onMounted(() => {
  fetchBatchData();
  suppliers.value = BatchService.getSuppliers();
})

// 显示风险分析
const showRiskAnalysis = (batch) => {
  selectedBatch.value = batch;
  ElMessageBox.confirm(
    `<div class="risk-analysis-dialog">
      <h3>批次风险分析</h3>
      <div class="risk-level">
        <span class="risk-label">风险等级:</span>
        <span class="risk-value ${getRiskLevelClass(batch.risk_level)}">${getRiskLevelText(batch.risk_level)}</span>
      </div>
      <div class="risk-factors">
        <h4>风险因素:</h4>
        <ul>
          <li>产线异常: <strong>${batch.line_exceptions}</strong> 次</li>
          <li>测试异常: <strong>${batch.test_exceptions}</strong> 次</li>
          <li>不良率: <strong>${(batch.defect_rate * 100).toFixed(2)}%</strong></li>
        </ul>
      </div>
      <div class="risk-recommendation">
        <h4>风险建议:</h4>
        <p>${getRiskRecommendation(batch)}</p>
      </div>
    </div>`,
    '批次风险分析',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      dangerouslyUseHTMLString: true,
      customClass: 'risk-analysis-message-box'
    }
  ).catch(() => {
    // 取消时不做任何操作
  });
};

// 获取风险等级样式类
const getRiskLevelClass = (level) => {
  switch (level) {
    case 'high': return 'risk-high';
    case 'medium': return 'risk-medium';
    case 'low': return 'risk-low';
    default: return 'risk-low';
  }
};

// 显示追溯信息
const showTraceability = (batch) => {
  selectedBatch.value = batch;
  
  // 查询相关数据
  findMaterialTestData(batch.material_code);
  findMaterialInventoryData(batch.material_code);
  findMaterialProductionData(batch.material_code);
  
  // 生成批次活动时间线
  generateBatchTimeline(batch);
  
  ElMessageBox.confirm(
    `<div class="traceability-dialog">
      <h3>批次追溯信息</h3>
      <div class="batch-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="批次号">{{ selectedBatch.batch_id }}</el-descriptions-item>
          <el-descriptions-item label="物料编码">{{ selectedBatch.material_code }}</el-descriptions-item>
          <el-descriptions-item label="物料名称">{{ selectedBatch.material_name }}</el-descriptions-item>
          <el-descriptions-item label="供应商">{{ selectedBatch.supplier_name }}</el-descriptions-item>
          <el-descriptions-item label="数量">{{ selectedBatch.quantity }}</el-descriptions-item>
          <el-descriptions-item label="入库日期">{{ formatDate(selectedBatch.created_date) }}</el-descriptions-item>
          <el-descriptions-item label="生产日期">{{ formatDate(selectedBatch.production_date) }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <div class="traceability-timeline">
        <el-timeline>
          ${generateTraceabilityTimelineHTML(batch)}
        </el-timeline>
      </div>
    </div>`,
    '批次追溯',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      dangerouslyUseHTMLString: true,
      customClass: 'traceability-message-box',
      width: '700px'
    }
  ).catch(() => {
    // 取消时不做任何操作
  });
};

// 生成追溯时间线HTML
const generateTraceabilityTimelineHTML = (batch) => {
  let timelineHTML = '';
  
  // 入库记录
  timelineHTML += `
    <div class="el-timeline-item">
      <div class="el-timeline-item__tail"></div>
      <div class="el-timeline-item__node el-timeline-item__node--normal el-timeline-item__node--primary"></div>
      <div class="el-timeline-item__wrapper">
        <div class="el-timeline-item__timestamp is-top">${formatDate(batch.created_date)}</div>
        <div class="el-timeline-item__content">
          <h4>入库记录</h4>
          <p>批次${batch.batch_id}入库，数量: ${batch.quantity}</p>
        </div>
      </div>
    </div>
  `;
  
  // 测试异常记录
  if (batch.test_exception_details && batch.test_exception_details.length > 0) {
    batch.test_exception_details.forEach((exception, index) => {
      timelineHTML += `
        <div class="el-timeline-item">
          <div class="el-timeline-item__tail"></div>
          <div class="el-timeline-item__node el-timeline-item__node--normal el-timeline-item__node--warning"></div>
          <div class="el-timeline-item__wrapper">
            <div class="el-timeline-item__timestamp is-top">${formatDate(exception.date)}</div>
            <div class="el-timeline-item__content">
              <h4>测试异常 #${index + 1}</h4>
              <p>测试项目: ${exception.test_item}</p>
              <p>结果: ${exception.result}</p>
              <p>不良现象: ${exception.defect_desc}</p>
            </div>
          </div>
        </div>
      `;
    });
  }
  
  // 产线异常记录
  if (batch.line_exception_details && batch.line_exception_details.length > 0) {
    batch.line_exception_details.forEach((exception, index) => {
      timelineHTML += `
        <div class="el-timeline-item">
          <div class="el-timeline-item__tail"></div>
          <div class="el-timeline-item__node el-timeline-item__node--normal el-timeline-item__node--danger"></div>
          <div class="el-timeline-item__wrapper">
            <div class="el-timeline-item__timestamp is-top">${formatDate(exception.date)}</div>
            <div class="el-timeline-item__content">
              <h4>产线异常 #${index + 1}</h4>
              <p>工厂: ${exception.location}</p>
              <p>不良率: ${exception.defect_rate.toFixed(2)}%</p>
              <p>异常数量: ${exception.exception_count}</p>
            </div>
          </div>
        </div>
      `;
    });
  }
  
  return timelineHTML;
};

// ... existing code ...

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未设置';
  
  // 如果是时间戳数字，转换为日期对象
  if (typeof dateString === 'number') {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  
  // 如果是ISO格式的日期字符串，提取日期部分
  if (typeof dateString === 'string' && dateString.includes('T')) {
    return dateString.split('T')[0];
  }
  
  // 尝试创建日期对象
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // 如果不是有效日期，返回原字符串
    }
    
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  } catch (e) {
    return dateString;
  }
};
</script>

<style scoped>
.batch-management-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title-section h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.subtitle {
  color: #909399;
  font-size: 14px;
  margin-top: 5px;
  display: block;
}

.actions {
  display: flex;
  gap: 10px;
}

.filter-section {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.batch-table {
  margin-top: 20px;
}

.status-tag {
  text-transform: capitalize;
}

.risk-level {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: bold;
}

.risk-high {
  background-color: #fef0f0;
  color: #f56c6c;
}

.risk-medium {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.risk-low {
  background-color: #f0f9eb;
  color: #67c23a;
}

.defect-rate-high {
  color: #f56c6c;
}

.defect-rate-medium {
  color: #e6a23c;
}

.defect-rate-low {
  color: #67c23a;
}

.batch-detail-dialog {
  min-width: 700px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 15px;
}

.detail-title {
  font-size: 18px;
  font-weight: bold;
}

.batch-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.info-value {
  font-size: 14px;
  color: #303133;
}

.metrics-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.metric-card {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  text-align: center;
}

.metric-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.metric-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.tabs-container {
  margin-top: 20px;
}

.activity-timeline {
  padding: 20px 0;
}

.activity-details {
  font-size: 12px;
  color: #606266;
  margin-top: 5px;
}

.related-products-table {
  margin-top: 20px;
}

.test-parameters-table {
  margin-top: 20px;
}

.add-batch-form {
  max-width: 500px;
  margin: 0 auto;
}

/* 批次详情样式 */
.batch-detail-container {
  padding: 0;
}

.detail-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.detail-item {
  margin-bottom: 10px;
}

.detail-label {
  display: block;
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.detail-value {
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.mt-20 {
  margin-top: 20px;
}

.batch-lifecycle-steps {
  padding: 20px 0;
}

.batch-timeline {
  padding: 10px 0;
  max-height: 400px;
  overflow-y: auto;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .batch-info,
  .metrics-container,
  .charts-container {
    grid-template-columns: 1fr;
  }
}

.risk-analysis-dialog {
  padding: 10px;
}

.risk-analysis-dialog h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  color: #303133;
}

.risk-analysis-dialog h4 {
  margin-top: 15px;
  margin-bottom: 10px;
  font-size: 16px;
  color: #303133;
}

.risk-level {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.risk-label {
  font-weight: bold;
  margin-right: 10px;
}

.risk-value {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
}

.risk-high {
  background-color: #f56c6c;
  color: white;
}

.risk-medium {
  background-color: #e6a23c;
  color: white;
}

.risk-low {
  background-color: #67c23a;
  color: white;
}

.risk-factors ul {
  padding-left: 20px;
  margin: 10px 0;
}

.risk-factors li {
  margin-bottom: 5px;
}

.risk-recommendation {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  margin-top: 15px;
}

.risk-recommendation p {
  margin: 0;
  line-height: 1.5;
}

.traceability-timeline {
  padding: 10px;
  max-height: 400px;
  overflow-y: auto;
}

/* 自定义消息框样式 */
:deep(.risk-analysis-message-box) {
  max-width: 500px;
}

:deep(.el-timeline-item__content h4) {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

:deep(.el-timeline-item__content p) {
  margin: 5px 0 0;
  color: #606266;
}

.traceability-dialog {
  padding: 10px;
  max-height: 600px;
  overflow-y: auto;
}

.traceability-dialog h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  color: #303133;
  text-align: center;
}

.batch-info {
  margin-bottom: 20px;
}

.traceability-timeline {
  margin-top: 20px;
  padding: 10px;
  border-top: 1px solid #EBEEF5;
}

:deep(.el-timeline-item__content h4) {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

:deep(.el-timeline-item__content p) {
  margin: 5px 0 0;
  color: #606266;
}

:deep(.traceability-message-box) {
  max-width: 700px;
  width: 90%;
}

:deep(.traceability-message-box .el-message-box__content) {
  max-height: 600px;
  overflow-y: auto;
}

:deep(.traceability-message-box .el-descriptions) {
  margin-bottom: 15px;
}

:deep(.traceability-message-box .el-descriptions__label) {
  width: 100px;
  font-weight: bold;
}

.exception-popover {
  font-size: 13px;
}
.exception-popover .popover-title {
  font-weight: bold;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid #ebeef5;
}
.exception-popover ul {
  padding-left: 15px;
  margin: 0;
}
.exception-popover li {
  margin-bottom: 5px;
}
.exception-popover .popover-footer {
  margin-top: 8px;
  color: #909399;
  font-style: italic;
}
</style> 
 
 