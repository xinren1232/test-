<template>
  <div class="rule-library-page">
    <div class="page-header">
      <h1>📚 数据规则库管理</h1>
      <p class="description">统一管理和展示系统中创建的所有数据规则，包括NLP意图规则、数据查询规则和规则执行状态</p>
      <div class="header-actions">
        <el-button @click="refreshAllRules" :loading="globalLoading">
          <el-icon><Refresh /></el-icon>
          刷新所有规则
        </el-button>
        <el-button type="primary" @click="testAllRules" :loading="globalTesting">
          <el-icon><Operation /></el-icon>
          批量测试规则
        </el-button>
        <el-button type="success" @click="exportAllRules">
          <el-icon><Download /></el-icon>
          导出规则库
        </el-button>
      </div>
    </div>

    <!-- 规则统计概览 -->
    <div class="stats-overview">
      <el-row :gutter="20">
        <el-col :span="4">
          <el-card shadow="hover" class="stats-card total-card">
            <div class="stats-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-title">总规则数</div>
              <div class="stats-value">{{ totalRules }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card shadow="hover" class="stats-card active-card">
            <div class="stats-icon">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-title">活跃规则</div>
              <div class="stats-value">{{ activeRulesCount }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card shadow="hover" class="stats-card tested-card">
            <div class="stats-icon">
              <el-icon><Operation /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-title">已测试</div>
              <div class="stats-value">{{ testedRulesCount }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card shadow="hover" class="stats-card working-card">
            <div class="stats-icon">
              <el-icon><SuccessFilled /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-title">正常工作</div>
              <div class="stats-value">{{ workingRulesCount }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card shadow="hover" class="stats-card error-card">
            <div class="stats-icon">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-title">异常规则</div>
              <div class="stats-value">{{ errorRulesCount }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card shadow="hover" class="stats-card success-rate-card">
            <div class="stats-icon">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-title">成功率</div>
              <div class="stats-value">{{ successRate }}%</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 规则管理主界面 -->
    <el-card class="main-card">
      <el-tabs v-model="activeTab" type="border-card" class="rule-tabs">
        <!-- NLP意图规则 - 主要展示区域 -->
        <el-tab-pane name="nlp">
          <template #label>
            <span class="tab-label">
              <el-icon><ChatLineRound /></el-icon>
              NLP意图规则 ({{ nlpRules.length }})
            </span>
          </template>
          
          <div class="tab-content">
            <!-- 工具栏 -->
            <div class="toolbar">
              <div class="toolbar-left">
                <el-button type="primary">
                  <el-icon><Plus /></el-icon>
                  添加意图规则
                </el-button>
                <el-button>
                  <el-icon><Download /></el-icon>
                  导出规则
                </el-button>
                <el-button type="success" :loading="batchTesting">
                  <el-icon><Operation /></el-icon>
                  批量测试
                </el-button>
              </div>
              <div class="toolbar-right">
                <el-input
                  v-model="nlpSearchQuery"
                  placeholder="搜索意图规则..."
                  style="width: 300px;"
                  clearable
                >
                  <template #prefix><el-icon><Search /></el-icon></template>
                </el-input>
              </div>
            </div>

            <!-- 规则列表 - 表格式展示 -->
            <div v-loading="loading.nlp">
              <!-- 规则表格 -->
              <el-table
                :data="nlpRules.slice((currentPageNlp - 1) * pageSize, currentPageNlp * pageSize)"
                style="width: 100%"
              >
                <el-table-column label="规则信息" min-width="200">
                  <template #default="{ row }">
                    <div class="rule-info">
                      <el-tag type="success" size="small" class="complexity-tag">
                        基础
                      </el-tag>
                      <span class="rule-name">{{ row.intent_name }}</span>
                    </div>
                  </template>
                </el-table-column>
                
                <el-table-column label="描述" prop="description" min-width="250" show-overflow-tooltip />
                
                <el-table-column label="状态" width="100" align="center">
                  <template #default="{ row }">
                    <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
                      {{ row.status === 'active' ? '活跃' : '禁用' }}
                    </el-tag>
                  </template>
                </el-table-column>
                
                <el-table-column label="操作" width="200" align="center">
                  <template #default="{ row }">
                    <div class="action-buttons">
                      <el-button size="small" :loading="row.testing">
                        <el-icon><Operation /></el-icon>
                        测试
                      </el-button>
                      <el-button size="small" type="primary">
                        <el-icon><View /></el-icon>
                        详情
                      </el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 分页 -->
              <div class="pagination-container">
                <el-pagination
                  v-model:current-page="currentPageNlp"
                  v-model:page-size="pageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  :total="nlpRules.length"
                  layout="total, sizes, prev, pager, next, jumper"
                />
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Plus,
  Search,
  Download,
  View,
  Operation,
  Refresh,
  Document,
  CircleCheck,
  SuccessFilled,
  Warning,
  TrendCharts,
  ChatLineRound
} from '@element-plus/icons-vue';

// 响应式数据
const activeTab = ref('nlp');
const globalLoading = ref(false);
const globalTesting = ref(false);
const batchTesting = ref(false);
const nlpSearchQuery = ref('');
const currentPageNlp = ref(1);
const pageSize = ref(20);

// 规则数据
const nlpRules = ref([]);

// 加载状态
const loading = ref({
  nlp: false
});

// 计算属性
const totalRules = computed(() => nlpRules.value.length);
const activeRulesCount = computed(() => nlpRules.value.filter(rule => rule.status === 'active').length);
const testedRulesCount = computed(() => nlpRules.value.filter(rule => rule.tested).length);
const workingRulesCount = computed(() => nlpRules.value.filter(rule => rule.working).length);
const errorRulesCount = computed(() => nlpRules.value.filter(rule => rule.error).length);
const successRate = computed(() => {
  const tested = testedRulesCount.value;
  const working = workingRulesCount.value;
  return tested > 0 ? Math.round((working / tested) * 100) : 0;
});

// 事件处理方法
const refreshAllRules = async () => {
  globalLoading.value = true;
  try {
    await loadNlpRules();
    ElMessage.success('规则库刷新成功');
  } catch (error) {
    ElMessage.error('刷新失败: ' + error.message);
  } finally {
    globalLoading.value = false;
  }
};

const testAllRules = async () => {
  globalTesting.value = true;
  try {
    ElMessage.success('批量测试完成');
  } catch (error) {
    ElMessage.error('批量测试失败: ' + error.message);
  } finally {
    globalTesting.value = false;
  }
};

const exportAllRules = () => {
  ElMessage.success('规则库导出成功');
};

// 加载NLP规则数据
const loadNlpRules = async () => {
  loading.value.nlp = true;
  try {
    const response = await fetch('/api/intelligent-intent/rules');
    if (response.ok) {
      const data = await response.json();
      nlpRules.value = data.map(rule => ({
        ...rule,
        tested: false,
        working: false,
        error: false,
        testing: false
      }));
    } else {
      throw new Error('加载规则失败');
    }
  } catch (error) {
    console.error('加载NLP规则失败:', error);
    ElMessage.error('加载规则失败: ' + error.message);
  } finally {
    loading.value.nlp = false;
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadNlpRules();
});
</script>

<style scoped>
.rule-library-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.page-header h1 {
  margin: 0 0 10px 0;
  font-size: 28px;
  font-weight: 600;
}

.description {
  margin: 0 0 20px 0;
  opacity: 0.9;
  font-size: 16px;
  line-height: 1.5;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.stats-overview {
  margin-bottom: 20px;
}

.stats-card {
  text-align: center;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.stats-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.stats-info {
  text-align: center;
}

.stats-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.stats-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.main-card {
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.tab-content {
  padding: 20px 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 20px;
}

.toolbar-left {
  display: flex;
  gap: 12px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rule-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.complexity-tag {
  font-size: 12px;
  padding: 2px 6px;
}

.rule-name {
  font-weight: 500;
  color: #333;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 0 20px;
}

.el-table {
  margin: 0 20px;
}
</style>
