<!-- 
  数据规则文档页面
  展示系统中的数据关联规则
-->
<template>
  <div class="data-rules-doc-page">
    <el-card class="page-card">
      <template #header>
        <div class="page-header">
          <h2>数据规则文档</h2>
          <el-tag type="info">系统数据关联规则</el-tag>
        </div>
      </template>
      
      <div class="page-content">
        <div class="description-section">
          <h3>规则说明</h3>
          <p>本文档描述了系统中三个主要页面（物料库存、测试跟踪、上线跟踪）之间的数据关联规则，确保数据在不同模块间的一致性和可追溯性。</p>
          
          <el-alert
            title="规则用途"
            type="info"
            description="这些规则用于指导数据生成、数据同步和数据校验，确保系统中的数据符合业务逻辑和质量要求。"
            show-icon
            :closable="false"
            class="alert-info"
          />
        </div>
        
        <el-divider />
        
        <!-- 数据规则展示组件 -->
        <DataRulesDisplay />
        
        <el-divider />
        
        <!-- 规则应用指南 -->
        <div class="guide-section">
          <h3>规则应用指南</h3>
          <p>以下是如何在系统中应用这些数据规则的指南：</p>
          
          <ol class="guide-list">
            <li>
              <strong>批次关联查询：</strong> 可以通过批次号或物料编码在三个页面之间进行关联查询，追踪物料从入库到上线的全过程。
            </li>
            <li>
              <strong>供应商质量对比：</strong> 系统支持同一物料不同供应商的质量对比分析，可以通过数据分析页面查看详细对比报告。
            </li>
            <li>
              <strong>批次历史记录：</strong> 每个物料批次都有完整的历史记录，记录了从入库到上线的各个环节的状态变更，可以在批次详情页面查看。
            </li>
            <li>
              <strong>数据一致性校验：</strong> 系统提供数据一致性校验功能，可以检查三个页面之间的数据是否符合关联规则，发现并修复数据不一致问题。
            </li>
            <li>
              <strong>物料-不良-供应商匹配：</strong> 系统限制物料、不良现象和供应商的选择必须遵循预定义的匹配关系，确保数据准确性和一致性。
            </li>
            <li>
              <strong>项目-基线绑定：</strong> 系统确保同一项目在不同记录中必须使用相同的基线ID，防止数据混乱和错误。
            </li>
          </ol>
        </div>
        
        <!-- 规则更新记录 -->
        <div class="update-history">
          <h3>规则更新记录</h3>
          <el-timeline>
            <el-timeline-item
              timestamp="2023-06-15"
              placement="top"
              type="primary"
            >
              <h4>初始版本</h4>
              <p>建立基础数据关联规则框架</p>
            </el-timeline-item>
            <el-timeline-item
              timestamp="2023-08-20"
              placement="top"
              type="success"
            >
              <h4>增强批次关联规则</h4>
              <p>添加批次历史记录功能，增强物料追溯能力</p>
            </el-timeline-item>
            <el-timeline-item
              timestamp="2023-10-05"
              placement="top"
              type="warning"
            >
              <h4>添加供应商对比规则</h4>
              <p>支持同一物料不同供应商的质量对比分析</p>
            </el-timeline-item>
            <el-timeline-item
              timestamp="2023-12-10"
              placement="top"
              type="info"
            >
              <h4>完善数据一致性规则</h4>
              <p>优化三个页面之间的数据关联和转换规则</p>
            </el-timeline-item>
            <el-timeline-item
              timestamp="2024-06-20"
              placement="top"
              type="primary"
            >
              <h4>添加物料-不良-供应商匹配规则</h4>
              <p>限制物料、不良现象和供应商的选择，遵循预定义的匹配关系</p>
            </el-timeline-item>
            <el-timeline-item
              timestamp="2024-06-20"
              placement="top"
              type="warning"
            >
              <h4>添加项目-基线绑定规则</h4>
              <p>确保同一项目在不同记录中使用相同的基线ID</p>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import DataRulesDisplay from '../components/admin/DataRulesDisplay.vue';
import { ElMessage } from 'element-plus';

export default {
  name: 'DataRulesDocPage',
  components: {
    DataRulesDisplay
  },
  setup() {
    onMounted(() => {
      console.log('数据规则文档页面已加载');
    });

    return {};
  }
}
</script>

<style scoped>
.data-rules-doc-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-card {
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.page-content {
  padding: 10px 0;
}

.description-section {
  margin-bottom: 20px;
}

.description-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 500;
}

.alert-info {
  margin: 15px 0;
}

.guide-section {
  margin: 20px 0;
}

.guide-list {
  padding-left: 20px;
}

.guide-list li {
  margin-bottom: 10px;
  line-height: 1.6;
}

.update-history {
  margin-top: 30px;
}

.update-history h3 {
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 500;
}
</style>   margin: 20px 0;
}

.guide-list {
  padding-left: 20px;
}

.guide-list li {
  margin-bottom: 10px;
  line-height: 1.6;
}

.update-history {
  margin-top: 30px;
}

.update-history h3 {
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 500;
}
</style> 
