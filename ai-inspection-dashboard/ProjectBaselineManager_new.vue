<template>
  <div class="project-baseline-manager">
    <el-card class="manager-card">
      <template #header>
        <div class="card-header">
          <h3>项目和基线管理</h3>
          <div class="header-actions">
            <el-button type="primary" @click="refreshData">刷新数据</el-button>
            <el-button @click="autoGenerateProjects">自动生成项目</el-button>
          </div>
        </div>
      </template>
      
      <el-tabs type="border-card">
        <!-- 命名和绑定规则 -->
        <el-tab-pane label="命名和绑定规则">
          <div class="tab-content">
            <el-alert
              title="项目和基线规则"
              type="info"
              description="规定了项目和基线的命名格式以及它们之间的绑定关系"
              :closable="false"
              show-icon
              style="margin-bottom: 20px;"
            />
            
            <el-card class="rules-card" shadow="hover">
              <template #header>
                <h4>命名规则</h4>
              </template>
              <div class="rule-item">
                <h5>基线ID格式</h5>
                <p>I加4位数字，例如：I6789</p>
                <div class="examples">
                  <el-tag size="small" type="success" style="margin-right: 5px;">I1234</el-tag>
                  <el-tag size="small" type="success" style="margin-right: 5px;">I5678</el-tag>
                  <el-tag size="small" type="success">I9012</el-tag>
                </div>
              </div>
              
              <div class="rule-item">
                <h5>项目ID格式</h5>
                <p>X加4位数字，例如：X6827</p>
                <div class="examples">
                  <el-tag size="small" type="success" style="margin-right: 5px;">X1234</el-tag>
                  <el-tag size="small" type="success" style="margin-right: 5px;">X5678</el-tag>
                  <el-tag size="small" type="success">X9012</el-tag>
                </div>
              </div>
            </el-card>
            
            <el-card class="rules-card" shadow="hover" style="margin-top: 20px;">
              <template #header>
                <h4>绑定规则</h4>
              </template>
              <div class="rule-item">
                <h5>基线和项目的关联关系</h5>
                <p>每个基线可以关联5-6个项目，一个项目只能关联一个基线。</p>
              </div>
              
              <div class="rule-item">
                <h5>数据关联规则</h5>
                <ul>
                  <li>实验室测试数据和上线数据中必须包含project_name字段</li>
                  <li>基线设计中不再包含projects字段，而是通过关系映射表维护关系</li>
                  <li>创建实验室测试和上线数据时，必须选择关联的项目</li>
                </ul>
              </div>
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { projectBaselineService } from '../../services/index.js';

// 数据
const baselineData = ref([]);
const projectList = ref([]);

// 获取数据
const loadData = () => {
  try {
    baselineData.value = projectBaselineService.getBaselineData();
    buildProjectList();
  } catch (error) {
    console.error('加载数据失败:', error);
  }
};

// 构建项目列表
const buildProjectList = () => {
  try {
    const projects = [];
    // 处理每个基线关联的项目
    baselineData.value.forEach(baseline => {
      const projectIds = projectBaselineService.getProjectsByBaseline(baseline.baseline_id);
      
      projectIds.forEach(projectId => {
        projects.push({
          project_id: projectId,
          project_name: `项目${projectId}`,
          baseline_id: baseline.baseline_id
        });
      });
    });
    
    projectList.value = projects;
  } catch (error) {
    console.error('构建项目列表失败:', error);
  }
};

// 刷新数据
const refreshData = () => {
  loadData();
  ElMessage.success('数据已刷新');
};

// 自动生成项目
const autoGenerateProjects = () => {
  try {
    const result = projectBaselineService.autoGenerateProjectsForBaselines();
    if (result && result.success) {
      ElMessage.success(`成功为${result.totalBaselines || 0}个基线添加了${result.totalProjectsAdded || 0}个项目`);
      loadData();
    } else {
      ElMessage.error('自动生成项目失败');
    }
  } catch (error) {
    console.error('自动生成项目失败:', error);
    ElMessage.error('自动生成项目发生错误');
  }
};

// 组件挂载时加载数据
onMounted(() => {
  setTimeout(() => {
    try {
      loadData();
    } catch (error) {
      console.error('初始化加载数据失败:', error);
    }
  }, 500);
});
</script>

<style scoped>
.project-baseline-manager {
  padding: 20px;
}

.manager-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.tab-content {
  padding: 20px 0;
}

.rules-card {
  margin-bottom: 20px;
}

.rule-item {
  margin-bottom: 15px;
}

.rule-item h5 {
  margin-top: 0;
  margin-bottom: 8px;
  font-weight: 600;
}

.rule-item p {
  margin: 5px 0;
}

.rule-item ul {
  margin: 5px 0;
  padding-left: 20px;
}

.examples {
  margin-top: 8px;
}
</style>
