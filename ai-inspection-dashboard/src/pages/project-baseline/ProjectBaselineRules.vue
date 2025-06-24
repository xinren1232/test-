<template>
  <div class="project-baseline-rules">
    <h1 class="page-title">项目基线规则</h1>
    
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <h2>基线规则配置</h2>
          <el-button type="primary" size="small" @click="addRule">新增规则</el-button>
        </div>
      </template>
      
      <el-table :data="rules" border style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="规则ID" width="100" />
        <el-table-column prop="name" label="规则名称" width="180" />
        <el-table-column prop="projectName" label="适用项目" width="180" />
        <el-table-column prop="baselineName" label="适用基线" width="180" />
        <el-table-column prop="category" label="物料类别" width="120" />
        <el-table-column prop="type" label="规则类型" width="120">
          <template #default="scope">
            <el-tag :type="getRuleTypeTag(scope.row.type)">{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="80">
          <template #default="scope">
            <el-tag :type="getPriorityTag(scope.row.priority)">{{ scope.row.priority }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button size="small" @click="editRule(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="confirmDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

// 页面状态
const loading = ref(false);
const rules = ref([]);

// 初始化数据
const fetchRules = async () => {
  loading.value = true;
  try {
    // 模拟API请求
    setTimeout(() => {
      rules.value = [
        {
          id: "1",
          name: "电池元件测试标准",
          projectName: "智能手机项目",
          baselineName: "2023基线",
          category: "电池元件",
          type: "质量规则",
          priority: "高",
          status: "启用",
          content: "电池元件必须通过温度测试，温度范围：-20C至60C",
          createdAt: "2023-06-15T08:30:00"
        },
        {
          id: "2",
          name: "包装材料基本要求",
          projectName: "智能手表项目",
          baselineName: "2023基线",
          category: "包装材料",
          type: "环保规则",
          priority: "中",
          status: "启用",
          content: "包装材料必须使用可回收材料，禁止使用聚氯乙烯(PVC)材料",
          createdAt: "2023-07-20T10:15:00"
        }
      ];
      loading.value = false;
    }, 500);
  } catch (error) {
    console.error("获取规则数据失败:", error);
    ElMessage.error("获取规则数据失败");
    loading.value = false;
  }
};

// 获取标签样式
const getRuleTypeTag = (type) => {
  switch (type) {
    case "质量规则": return "primary";
    case "环保规则": return "success";
    case "安全规则": return "warning";
    case "技术规则": return "info";
    default: return "";
  }
};

const getPriorityTag = (priority) => {
  switch (priority) {
    case "高": return "danger";
    case "中": return "warning";
    case "低": return "info";
    default: return "";
  }
};

const getStatusTag = (status) => {
  return status === "启用" ? "success" : "info";
};

// 格式化日期时间
const formatDateTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleString();
};

// 添加规则
const addRule = () => {
  ElMessage.info("添加规则功能正在开发中");
};

// 编辑规则
const editRule = (row) => {
  ElMessage.info("编辑规则功能正在开发中");
};

// 确认删除
const confirmDelete = (row) => {
  ElMessageBox.confirm(
    `确认要删除规则 "${row.name}" 吗`,
    "删除确认",
    {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    }
  ).then(() => {
    ElMessage.success("删除功能正在开发中");
  }).catch(() => {
    // 取消删除
  });
};

// 组件挂载时加载
onMounted(() => {
  fetchRules();
});
</script>

<style scoped>
.project-baseline-rules {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  font-size: 24px;
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
</style>
