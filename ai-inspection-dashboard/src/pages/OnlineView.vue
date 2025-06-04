<template>
  <div class="online-container">
    <h2 class="page-title">IQE生产现场数据</h2>
    
    <!-- 数据概览卡片 -->
    <div class="statistics-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-title">总生产批次</div>
                <div class="stat-value">{{ totalBatches }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-title">检测样品总数</div>
                <div class="stat-value">{{ totalSamples }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card success" shadow="hover">
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-title">合格样品数</div>
                <div class="stat-value">{{ totalPassing }}</div>
                <div class="stat-rate">{{ passRate }}%</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card danger" shadow="hover">
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-title">不合格样品数</div>
                <div class="stat-value">{{ totalDefects }}</div>
                <div class="stat-rate">{{ defectRate }}%</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 结构化数据表格 -->
    <el-card class="data-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <el-icon><el-icon-data-analysis /></el-icon>
            <span>IQE生产现场数据结构</span>
            <el-tag type="success" effect="dark" size="small">结构化表格</el-tag>
          </div>
          <div class="header-actions">
            <el-button size="small" type="primary">
              <el-icon><el-icon-download /></el-icon> 导出数据
            </el-button>
            <el-button size="small">
              <el-icon><el-icon-refresh /></el-icon> 刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 结构化表格 -->
      <el-table :data="productionData" border stripe style="width: 100%">
        <el-table-column prop="field_name" label="字段名称" width="150" />
        <el-table-column prop="field_value" label="字段值" width="200" />
        <el-table-column prop="field_desc" label="字段说明" />
      </el-table>
    </el-card>
    
    <!-- 用途提示卡片 -->
    <el-card class="tip-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <el-icon><el-icon-info-filled /></el-icon>
            <span>用途说明</span>
          </div>
        </div>
      </template>
      <div class="tip-content">
        <ul class="tip-list">
          <li>
            <el-icon color="#67C23A"><el-icon-check /></el-icon>
            <span>可用于"数据图表展示"、"智能数据复核"、"问题预警检测"。</span>
          </li>
          <li>
            <el-icon color="#67C23A"><el-icon-check /></el-icon>
            <span>提供了结构化表格，便于数据分析。</span>
          </li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import onlineData from '../data/online_data.json';

// 数据处理
const productionData = ref([
  { field_name: "字段名", field_value: "字段值", field_desc: "字段说明" },
  { field_name: "项目名", field_value: "XG735B", field_desc: "项目编号" },
  { field_name: "进度阶段", field_value: "量产 / 试产", field_desc: "项目进度阶段" },
  { field_name: "项目负责人", field_value: "张三", field_desc: "项目负责人姓名" },
  { field_name: "实验室负责人", field_value: "李四", field_desc: "实验室负责人姓名" },
  { field_name: "测试日期", field_value: "2024/05/26", field_desc: "测试执行日期" },
  { field_name: "物料编号", field_value: "XG735B", field_desc: "物料唯一标识符号" },
  { field_name: "问题说明", field_value: "深圳PVD花纹开裂（标称500次），不符合使用力学", field_desc: "详细说明测试中发现的问题" },
  { field_name: "物料分类", field_value: "电池盖", field_desc: "物料的分类信息" },
  { field_name: "供应商", field_value: "金属 / 常规", field_desc: "物料供应商信息" },
  { field_name: "规格型号", field_value: "金属 / 边框 / 常规", field_desc: "物料的规格型号" },
  { field_name: "检验目标", field_value: "质量稳定性", field_desc: "检验的主要目标" },
  { field_name: "加工厂", field_value: "南通工厂 / 零部件工厂", field_desc: "物料加工厂信息" },
  { field_name: "测试设备", field_value: "产检 / IQC / 实验室", field_desc: "测试使用的设备" },
  { field_name: "科号", field_value: "37301062", field_desc: "部门科号标识" },
  { field_name: "批次等级", field_value: "A/B/C", field_desc: "批次质量等级分类" }
]);

// 统计数据计算
const totalBatches = ref(20); // 示例数据，实际应从API获取
const totalSamples = computed(() => {
  return onlineData.reduce((sum, item) => sum + item.total_count, 0);
});
const totalDefects = computed(() => {
  return onlineData.reduce((sum, item) => sum + item.defect_count, 0);
});
const totalPassing = computed(() => {
  return totalSamples.value - totalDefects.value;
});
const passRate = computed(() => {
  return totalSamples.value ? ((totalPassing.value / totalSamples.value) * 100).toFixed(2) : 0;
});
const defectRate = computed(() => {
  return totalSamples.value ? ((totalDefects.value / totalSamples.value) * 100).toFixed(2) : 0;
});

onMounted(() => {
  // 在实际应用中，可以在这里加载实时数据
  console.log("在线生产数据页面已加载");
});
</script>

<style scoped>
.online-container {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.statistics-cards {
  margin-bottom: 20px;
}

.stat-card {
  height: 100px;
  display: flex;
  align-items: center;
}

.stat-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-title {
  font-size: 14px;
  color: #909399;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin: 5px 0;
}

.stat-rate {
  font-size: 12px;
  color: #606266;
}

.success .stat-value {
  color: #67C23A;
}

.danger .stat-value {
  color: #F56C6C;
}

.data-card, .tip-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  font-size: 16px;
}

.tip-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tip-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.tip-list li:last-child {
  margin-bottom: 0;
}
</style> 
 
 