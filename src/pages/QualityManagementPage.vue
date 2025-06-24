<template>
  <div class="quality-management-page">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <h1>质量管理</h1>
          <el-button type="primary" @click="createNewIssue">
            <i class="el-icon-plus"></i> 新建质量问题
          </el-button>
        </div>
      </template>
      
      <!-- 质量问题列表组件 -->
      <quality-issue-list ref="issueListRef" />
    </el-card>
    
    <!-- 创建/编辑质量问题对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="60%"
      destroy-on-close
    >
      <quality-issue-form
        :issue-data="currentIssue"
        @save="handleIssueSave"
        @cancel="dialogVisible = false"
      />
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import QualityIssueList from '@/components/quality/QualityIssueList.vue';
// 假设我们有一个表单组件，实际项目中需要创建
// import QualityIssueForm from '@/components/quality/QualityIssueForm.vue';
import { qualityService } from '@/services';

export default {
  name: 'QualityManagementPage',
  
  components: {
    QualityIssueList,
    // QualityIssueForm
  },
  
  setup() {
    const issueListRef = ref(null);
    const dialogVisible = ref(false);
    const currentIssue = ref(null);
    
    // 计算对话框标题
    const dialogTitle = computed(() => {
      return currentIssue.value?.id ? '编辑质量问题' : '新建质量问题';
    });
    
    // 创建新质量问题
    const createNewIssue = () => {
      currentIssue.value = {
        title: '',
        type: '',
        status: 'open',
        riskLevel: 'medium',
        description: '',
        discoveryDate: new Date().toISOString().split('T')[0]
      };
      dialogVisible.value = true;
    };
    
    // 处理质量问题保存
    const handleIssueSave = async (issueData) => {
      try {
        if (issueData.id) {
          // 更新现有问题
          await qualityService.updateQualityIssue(issueData.id, issueData);
          ElMessage.success('质量问题更新成功');
        } else {
          // 创建新问题
          await qualityService.createQualityIssue(issueData);
          ElMessage.success('质量问题创建成功');
        }
        
        // 关闭对话框并刷新列表
        dialogVisible.value = false;
        if (issueListRef.value) {
          issueListRef.value.loadQualityIssues();
        }
      } catch (error) {
        ElMessage.error(`保存失败: ${error.message}`);
      }
    };
    
    return {
      issueListRef,
      dialogVisible,
      currentIssue,
      dialogTitle,
      createNewIssue,
      handleIssueSave
    };
  }
};
</script>

<style scoped>
.quality-management-page {
  padding: 20px;
}

.page-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}
</style> 