<!-- 
  数据生成面板
  提供给管理员手动更新系统数据
-->
<template>
  <div class="data-generation-panel">
    <el-card class="panel-card">
      <template #header>
        <div class="panel-header">
          <h3>系统数据生成工具</h3>
          <el-tag type="info" size="small">管理员专用</el-tag>
        </div>
      </template>
      
      <div class="panel-content">
        <div class="section">
          <h4>当前数据统计</h4>
          <div class="stats-container">
            <el-descriptions :column="3" border>
              <el-descriptions-item label="库存记录">
                <el-tag type="info">{{ inventoryStats.totalCount }} 条</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="测试数据">
                <el-tag type="success">{{ inventoryStats.testedCount }} 条</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="上线数据">
                <el-tag type="warning">{{ inventoryStats.onlineCount }} 条</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="批次数量">
                <el-tag type="info">{{ inventoryStats.batchCount }} 个</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="平均不良率">
                <el-tag :type="inventoryStats.overallDefectRate > 0.1 ? 'danger' : 'success'">
                  {{ (inventoryStats.overallDefectRate * 100).toFixed(2) }}%
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="高风险批次">
                <el-tag type="danger">{{ inventoryStats.highRiskBatchCount }} 个</el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
        
        <el-divider />
        
        <div class="section">
          <h4>数据生成</h4>
          <el-form :model="dataOptions" label-position="top" size="default">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="数据数量">
                  <el-input-number v-model="dataOptions.count" :min="10" :max="1000" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="数据选项">
                  <el-checkbox v-model="dataOptions.clearExisting">清空现有数据</el-checkbox>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
              
          <div class="action-group">
            <el-popconfirm
              title="确定要一键生成所有数据吗？"
              @confirm="generateAllData"
              confirm-button-text="确定生成"
              cancel-button-text="取消"
            >
              <template #reference>
                <el-button 
                  type="primary" 
                  icon="Plus"
                  :loading="isGenerating.all"
                  size="large"
                >
                  一键生成所有数据
                </el-button>
              </template>
            </el-popconfirm>
            
            <el-popconfirm
              title="确定要清除所有数据吗？此操作不可恢复。"
              @confirm="clearAllData"
              confirm-button-text="确定清除"
              cancel-button-text="取消"
            >
              <template #reference>
                <el-button type="danger" icon="Delete" :loading="isGenerating.all" size="large">
                  清除所有数据
                </el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { ElMessage, ElNotification } from 'element-plus';
import UnifiedDataService from '../../services/UnifiedDataService';
import { useInventoryAnalysis } from '../../composables/useInventoryAnalysis';

const { inventoryStats, refreshData } = useInventoryAnalysis();

const isGenerating = reactive({
  all: false,
});

const dataOptions = reactive({
  count: 100,
  clearExisting: true,
});

onMounted(async () => {
  await refreshData();
});

const handleGeneration = async (clear: boolean, count: number) => {
  isGenerating.all = true;
  try {
    await UnifiedDataService.generateAndSaveData({ count, clearExisting: clear });
    await refreshData();
    ElNotification({
      title: '成功',
      message: `成功生成 ${count} 条新数据。`,
      type: 'success',
    });
  } catch (error) {
    console.error("Data generation failed:", error);
    ElMessage.error('数据生成失败，请查看控制台日志。');
  } finally {
    isGenerating.all = false;
  }
};

const generateAllData = () => {
  handleGeneration(dataOptions.clearExisting, dataOptions.count);
};

const clearAllData = async () => {
  isGenerating.all = true;
  try {
    await UnifiedDataService.clearAllData();
    await refreshData();
    ElNotification({
      title: '成功',
      message: '所有库存数据已清除。',
      type: 'success',
    });
  } catch (error) {
    console.error("Data clearing failed:", error);
    ElMessage.error('数据清除失败，请查看控制台日志。');
  } finally {
    isGenerating.all = false;
  }
};
</script>

<style scoped>
.data-generation-panel {
  padding: 20px;
}
.panel-card {
  margin-bottom: 20px;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.section {
  margin-bottom: 20px;
}
.stats-container, .action-group {
  margin-top: 15px;
}
.action-group .el-button {
  margin-right: 10px;
}
</style>