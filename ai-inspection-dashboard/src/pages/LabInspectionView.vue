<template>
  <div class="lab-inspection-container">
    <h2 class="page-title">IQE实验室送样检验</h2>
    
    <!-- 数据概览卡片 -->
    <div class="statistics-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-title">总送样数</div>
                <div class="stat-value">{{ totalSamples }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-title">检验类型数</div>
                <div class="stat-value">{{ testTypesCount }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card success" shadow="hover">
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-title">合格数量</div>
                <div class="stat-value">{{ passCount }}</div>
                <div class="stat-rate">{{ passRate }}%</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card danger" shadow="hover">
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-title">不合格数量</div>
                <div class="stat-value">{{ failCount }}</div>
                <div class="stat-rate">{{ failRate }}%</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 检验数据卡片 - 文本/邮件格式 -->
    <el-card class="data-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <el-icon><el-icon-document /></el-icon>
            <span>检验数据</span>
            <el-tag type="primary" effect="dark" size="small">文本/邮件型</el-tag>
          </div>
          <div class="header-actions">
            <el-button-group>
              <el-button size="small">
                <el-icon><el-icon-printer /></el-icon> 打印
              </el-button>
              <el-button size="small" type="primary">
                <el-icon><el-icon-download /></el-icon> 导出
              </el-button>
            </el-button-group>
          </div>
        </div>
      </template>
      
      <!-- 纯文本样式的检验报告 -->
      <div class="plain-text-report">
        <pre>
标:测试,深圳送检送样件|测试|车间
标-测试项目: 500次 x 5次|弯折测试|深圳
型号: XG735
物料代码: 电池盖（全部缩减）
科号: 38S01175
来料时间: 周五
测试日期: 2023/05/26
测试方法: 角落抛成1米（25次）
状态:
  #03 - 抛完, NG
  #04 - 抛完, NG
不良率: 2/2 (100% NG)
供应商: 星港
负责部门: 安阳
建议处理方式: 检查工程 + 测试
备注: 安阳来样测试
</pre>
      </div>
    </el-card>
    
    <!-- 结构化数据表 -->
    <el-card class="data-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <el-icon><el-icon-table /></el-icon>
            <span>结构化数据表</span>
          </div>
        </div>
      </template>
      
      <el-table :data="structuredData" border stripe style="width: 100%">
        <el-table-column prop="field_name" label="字段名称" width="150" />
        <el-table-column prop="field_value" label="字段值" />
      </el-table>
    </el-card>
    
    <!-- 用途提示卡片 -->
    <el-card class="tip-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <el-icon><el-icon-info-filled /></el-icon>
            <span>字段变更建议</span>
          </div>
        </div>
      </template>
      <div class="tip-content">
        <ul class="tip-list">
          <li>
            <el-icon color="#67C23A"><el-icon-check /></el-icon>
            <span>建议统一字段名，使用"结构化表格"。</span>
          </li>
          <li>
            <el-icon color="#67C23A"><el-icon-check /></el-icon>
            <span>运用邮件生成工具，将"结构化表格"字段 → 用于邮件通知示范。</span>
          </li>
          <li>
            <el-icon color="#67C23A"><el-icon-check /></el-icon>
            <span>可设置字段对照表：</span>
          </li>
        </ul>
      </div>
    </el-card>
    
    <!-- 对照表 -->
    <el-card class="mapping-card">
      <el-table :data="fieldMapping" border stripe style="width: 100%">
        <el-table-column prop="original_field" label="原始字段名" width="150" />
        <el-table-column prop="new_field" label="新字段名" width="150" />
        <el-table-column prop="remark" label="备注" />
      </el-table>
    </el-card>
    
    <!-- 整体应用建议 -->
    <el-card class="application-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <el-icon><el-icon-magic-stick /></el-icon>
            <span>整体应用建议</span>
            <el-tag type="danger" effect="dark" size="small">重要</el-tag>
          </div>
        </div>
      </template>
      
      <el-table :data="applicationSuggestions" border style="width: 100%">
        <el-table-column prop="purpose" label="目的" width="120" />
        <el-table-column prop="application" label="使用于场景" width="180" />
        <el-table-column prop="suggestion" label="操作方法建议" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import labData from '../data/lab_data.json';

// 结构化数据
const structuredData = ref([
  { field_name: "项目名", field_value: "XG735B" },
  { field_name: "检测日期", field_value: "2023/05/26" },
  { field_name: "检查类型", field_value: "深圳实验室外观检测" },
  { field_name: "物料", field_value: "XG735" },
  { field_name: "物料名称", field_value: "保护膜" },
  { field_name: "科号", field_value: "38S01175" },
  { field_name: "测试项目", field_value: "测试抛落500g + 25次" },
  { field_name: "检验结果", field_value: "NG / OK" },
  { field_name: "不良记录", field_value: "#03, #04" },
  { field_name: "不良率", field_value: "2/2 (100%)" },
  { field_name: "供应商", field_value: "星港" },
  { field_name: "负责单位", field_value: "安阳" },
  { field_name: "建议处理方式", field_value: "检查工程 + 测试" },
  { field_name: "备注", field_value: "安阳量产生产线" }
]);

// 字段对照表
const fieldMapping = ref([
  { original_field: "标", new_field: "项目名称", remark: "统一命名规范" },
  { original_field: "标-测试项目", new_field: "测试项目", remark: "去掉前缀，简化命名" },
  { original_field: "型号", new_field: "型号", remark: "保持不变" },
  { original_field: "物料代码", new_field: "物料编码", remark: "统一使用'编码'术语" },
  { original_field: "来料时间", new_field: "送样日期", remark: "明确表示送样时间" },
  { original_field: "测试日期", new_field: "测试日期", remark: "保持不变" },
  { original_field: "状态", new_field: "测试结果", remark: "使用更准确的描述" }
]);

// 整体应用建议
const applicationSuggestions = ref([
  {
    purpose: "系统管理",
    application: "数据科学转换和产品描述",
    suggestion: "可采用数据标标准化采集 + 定制变异与数据模型整合"
  },
  {
    purpose: "智能芯片方案",
    application: "数据检测与测试结果采集",
    suggestion: "数据建模 + 异常分析 + 多维图表"
  },
  {
    purpose: "数据可视化设计",
    application: "可视化与结果展示",
    suggestion: "升级表格设计，支持多类图表"
  }
]);

// 统计数据计算
const totalSamples = ref(labData.length);
const passCount = computed(() => {
  return labData.filter(item => item.result === "合格").length;
});
const failCount = computed(() => {
  return totalSamples.value - passCount.value;
});
const passRate = computed(() => {
  return ((passCount.value / totalSamples.value) * 100).toFixed(2);
});
const failRate = computed(() => {
  return ((failCount.value / totalSamples.value) * 100).toFixed(2);
});
const testTypesCount = computed(() => {
  // 获取唯一的测试类型数量
  const types = new Set(labData.map(item => item.test_type));
  return types.size;
});

onMounted(() => {
  console.log("实验室送样检验页面已加载");
});
</script>

<style scoped>
.lab-inspection-container {
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

.data-card, .tip-card, .application-card, .mapping-card {
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

.plain-text-report {
  background-color: #f8f8f8;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 15px;
  font-family: 'Courier New', Courier, monospace;
  white-space: pre-wrap;
  line-height: 1.5;
}

.tip-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tip-list li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 10px;
}

.tip-list li:last-child {
  margin-bottom: 0;
}

.tip-list li .el-icon {
  margin-top: 3px;
}
</style> 