<template>
  <div class="test-rules-page">
    <h1>规则测试页面</h1>
    
    <div class="stats-section">
      <el-card>
        <h2>规则统计</h2>
        <p>总规则数: {{ rules.length }}</p>
        <p>活跃规则数: {{ activeRules.length }}</p>
        <p>加载状态: {{ loading ? '加载中...' : '加载完成' }}</p>
        <el-button @click="loadRules" :loading="loading">重新加载规则</el-button>
      </el-card>
    </div>

    <div class="rules-section">
      <el-card>
        <h2>规则列表</h2>
        <el-table :data="rules" border style="width: 100%" max-height="600">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="intent_name" label="规则名称" min-width="200" />
          <el-table-column prop="description" label="描述" min-width="300" />
          <el-table-column prop="priority" label="优先级" width="100" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'info'">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

const rules = ref([]);
const loading = ref(false);

const activeRules = computed(() => 
  rules.value.filter(rule => rule.status === 'active')
);

const loadRules = async () => {
  loading.value = true;
  try {
    console.log('开始加载规则...');
    // 使用完整URL避免代理问题
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    const fullURL = `${baseURL}/api/rules`;
    console.log('请求URL:', fullURL);

    const response = await fetch(fullURL);
    console.log('API响应状态:', response.status);

    if (response.ok) {
      const result = await response.json();
      console.log('API响应数据:', result);

      if (result.success && Array.isArray(result.data)) {
        rules.value = result.data;
        ElMessage.success(`成功加载 ${rules.value.length} 条规则`);
      } else {
        throw new Error('API返回数据格式错误');
      }
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('加载规则失败:', error);
    ElMessage.error('加载规则失败: ' + error.message);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadRules();
});
</script>

<style scoped>
.test-rules-page {
  padding: 20px;
}

.stats-section {
  margin-bottom: 20px;
}

.rules-section {
  margin-top: 20px;
}
</style>
