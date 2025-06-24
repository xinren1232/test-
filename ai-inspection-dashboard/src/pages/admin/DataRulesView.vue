<!-- 
  数据规则文档页面
  展示系统中的数据规则，包括三个页面的数据关联规则
-->
<template>
  <div class="data-rules-view">
    <div class="page-header">
      <h1>数据规则管理</h1>
      <p class="description">管理系统中的数据规则配置</p>
    </div>

    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <h2>数据规则配置</h2>
          <div class="header-actions">
            <el-button type="primary" @click="navigateToRulesDefinition">
              查看完整数据结构定义
            </el-button>
          </div>
        </div>
      </template>
      
      <div class="card-content">
        <el-tabs type="border-card">
          <el-tab-pane label="物料-不良-供应商匹配规则">
            <MaterialSupplierDefectRules />
          </el-tab-pane>
          <el-tab-pane label="物料-项目-不良匹配规则">
            <MaterialProjectDefectRules />
          </el-tab-pane>
          <el-tab-pane label="项目-基线绑定规则">
            <ProjectBaselineRules />
          </el-tab-pane>
          <el-tab-pane label="项目-基线-不良匹配规则">
            <ProjectBaselineDefectRules />
          </el-tab-pane>
          <el-tab-pane label="其他数据规则">
            <DataRulesDisplay />
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import DataRulesDisplay from '../../components/admin/DataRulesDisplay.vue';
import MaterialSupplierDefectRules from '../../components/admin/MaterialSupplierDefectRules.vue';
import ProjectBaselineRules from '../../components/admin/ProjectBaselineRules.vue';
import MaterialProjectDefectRules from '../../components/admin/MaterialProjectDefectRules.vue';
import ProjectBaselineDefectRules from '../../components/admin/ProjectBaselineDefectRules.vue';

const router = useRouter();

const navigateToRulesDefinition = () => {
  router.push('/admin/data/rules/definition');
};
</script>

<style scoped>
.data-rules-view {
  width: 100%;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin-bottom: 5px;
  font-size: 24px;
}

.page-header .description {
  color: #606266;
  font-size: 14px;
}

.main-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
}

.card-content {
  padding: 20px 0;
}

.rule-list,
.step-list {
  padding-left: 20px;
  margin: 16px 0;
}

.rule-list li,
.step-list li {
  margin-bottom: 12px;
  line-height: 1.5;
}

.flow-chart {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.tool-link {
  margin: 20px 0;
  text-align: center;
}

.tool-description {
  margin-top: 12px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}
</style>
