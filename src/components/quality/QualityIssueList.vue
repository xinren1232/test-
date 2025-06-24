<template>
  <div class="quality-issue-list">
    <h2>质量问题列表</h2>
    
    <!-- 搜索过滤器 -->
    <div class="filter-section">
      <el-form :inline="true" class="filter-form">
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="选择状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="未解决" value="open" />
            <el-option label="已解决" value="closed" />
            <el-option label="处理中" value="in_progress" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="风险等级">
          <el-select v-model="filters.riskLevel" placeholder="选择风险等级" clearable>
            <el-option label="全部" value="" />
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="物料代码">
          <el-input v-model="filters.materialCode" placeholder="输入物料代码" clearable />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="loadQualityIssues">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="qualityIssues"
      border
      stripe
      style="width: 100%"
    >
      <el-table-column prop="issueId" label="问题编号" width="120" />
      <el-table-column prop="title" label="问题标题" min-width="180" />
      <el-table-column prop="type" label="类型" width="100" />
      <el-table-column prop="materialCode" label="物料代码" width="120" />
      <el-table-column prop="riskLevel" label="风险等级" width="100">
        <template #default="scope">
          <el-tag
            :type="getRiskLevelType(scope.row.riskLevel)"
            size="small"
          >
            {{ scope.row.riskLevel }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag
            :type="getStatusType(scope.row.status)"
            size="small"
          >
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="discoveryDate" label="发现日期" width="120">
        <template #default="scope">
          {{ formatDate(scope.row.discoveryDate) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            @click="viewIssueDetails(scope.row)"
          >
            详情
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="deleteIssue(scope.row)"
          >
            删除
          </el-button>
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
        :total="totalItems"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { qualityService } from '@/services';

export default {
  name: 'QualityIssueList',
  
  setup() {
    // 数据状态
    const qualityIssues = ref([]);
    const loading = ref(false);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const totalItems = ref(0);
    
    // 过滤条件
    const filters = reactive({
      status: '',
      riskLevel: '',
      materialCode: ''
    });
    
    // 加载质量问题列表
    const loadQualityIssues = async () => {
      loading.value = true;
      
      try {
        // 构建查询参数
        const params = {
          page: currentPage.value,
          limit: pageSize.value,
          ...filters
        };
        
        // 过滤掉空值
        Object.keys(params).forEach(key => {
          if (params[key] === '') {
            delete params[key];
          }
        });
        
        // 调用服务获取数据
        const issues = await qualityService.getQualityIssues(params);
        qualityIssues.value = issues;
        
        // 假设API返回了总数，实际项目中可能需要调整
        totalItems.value = 100; // 示例值
      } catch (error) {
        ElMessage.error(`加载质量问题失败: ${error.message}`);
      } finally {
        loading.value = false;
      }
    };
    
    // 重置过滤条件
    const resetFilters = () => {
      Object.keys(filters).forEach(key => {
        filters[key] = '';
      });
      currentPage.value = 1;
      loadQualityIssues();
    };
    
    // 处理分页变化
    const handleSizeChange = (size) => {
      pageSize.value = size;
      loadQualityIssues();
    };
    
    const handleCurrentChange = (page) => {
      currentPage.value = page;
      loadQualityIssues();
    };
    
    // 查看详情
    const viewIssueDetails = (issue) => {
      // 在实际应用中，可能会导航到详情页面
      console.log('查看质量问题详情:', issue);
    };
    
    // 删除问题
    const deleteIssue = (issue) => {
      ElMessageBox.confirm(
        `确定要删除质量问题 "${issue.title}" 吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        try {
          await qualityService.deleteQualityIssue(issue.id);
          ElMessage.success('删除成功');
          loadQualityIssues();
        } catch (error) {
          ElMessage.error(`删除失败: ${error.message}`);
        }
      }).catch(() => {
        // 用户取消操作
      });
    };
    
    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    };
    
    // 获取风险等级对应的样式类型
    const getRiskLevelType = (level) => {
      const types = {
        high: 'danger',
        medium: 'warning',
        low: 'success'
      };
      return types[level] || 'info';
    };
    
    // 获取状态对应的样式类型
    const getStatusType = (status) => {
      const types = {
        open: 'danger',
        in_progress: 'warning',
        closed: 'success'
      };
      return types[status] || 'info';
    };
    
    // 获取状态文本
    const getStatusText = (status) => {
      const texts = {
        open: '未解决',
        in_progress: '处理中',
        closed: '已解决'
      };
      return texts[status] || status;
    };
    
    // 组件挂载时加载数据
    onMounted(() => {
      loadQualityIssues();
    });
    
    return {
      qualityIssues,
      loading,
      currentPage,
      pageSize,
      totalItems,
      filters,
      loadQualityIssues,
      resetFilters,
      handleSizeChange,
      handleCurrentChange,
      viewIssueDetails,
      deleteIssue,
      formatDate,
      getRiskLevelType,
      getStatusType,
      getStatusText
    };
  }
};
</script>

<style scoped>
.quality-issue-list {
  padding: 20px;
}

.filter-section {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 