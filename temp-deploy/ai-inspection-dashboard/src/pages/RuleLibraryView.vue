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
                <el-button
                  type="success"
                  :loading="batchTesting"
                  @click="testAllNlpRules"
                >
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
                      <el-tag :type="getCategoryTagType(row.category)" size="small" class="complexity-tag">
                        {{ getCategoryLabel(row.category) }}
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

                <el-table-column label="测试状态" width="120" align="center">
                  <template #default="{ row }">
                    <div class="test-status">
                      <span v-if="row.testing" class="status-text">测试中...</span>
                      <span v-else-if="!row.tested" class="status-text">未测试</span>
                      <span v-else-if="row.working" class="status-text">
                        <el-icon class="status-icon success"><SuccessFilled /></el-icon>
                        正常
                      </span>
                      <span v-else class="status-text">
                        <el-icon class="status-icon error"><CircleCloseFilled /></el-icon>
                        异常
                      </span>
                    </div>
                  </template>
                </el-table-column>
                
                <el-table-column label="操作" width="200" align="center">
                  <template #default="{ row }">
                    <div class="action-buttons">
                      <el-button
                        size="small"
                        :loading="row.testing"
                        @click="testSingleRule(row)"
                      >
                        <el-icon><Operation /></el-icon>
                        测试
                      </el-button>
                      <el-button
                        size="small"
                        type="primary"
                        @click="viewRuleDetails(row)"
                      >
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

    <!-- 测试结果对话框 -->
    <el-dialog
      v-model="testResultDialogVisible"
      title="规则测试结果"
      width="80%"
      :close-on-click-modal="false"
    >
      <div v-if="currentTestRule" class="test-result-content">
        <div class="rule-header">
          <h3>{{ currentTestRule.intent_name }}</h3>
          <el-tag :type="currentTestRule.working ? 'success' : 'danger'" size="large">
            {{ currentTestRule.working ? '测试通过' : '测试失败' }}
          </el-tag>
        </div>

        <el-divider />

        <div class="test-details">
          <h4>🔍 测试查询</h4>
          <el-input
            v-model="currentTestQuery"
            type="textarea"
            :rows="2"
            readonly
            class="query-input"
          />

          <h4>📊 查询结果</h4>
          <div v-if="getTestResultTableData(currentTestRule.testResult) && getTestResultTableData(currentTestRule.testResult).length > 0">
            <!-- 显示卡片（如果有） -->
            <div v-if="currentTestRule.testResult?.rawResult?.data?.cards && currentTestRule.testResult.rawResult.data.cards.length > 0" class="test-result-cards">
              <h5>📊 数据统计概览</h5>
              <div class="cards-grid">
                <div
                  v-for="(card, cardIndex) in currentTestRule.testResult.rawResult.data.cards"
                  :key="cardIndex"
                  class="stat-card"
                  :class="card.type"
                >
                  <div class="card-icon">{{ card.icon }}</div>
                  <div class="card-content">
                    <div v-if="card.splitData" class="split-data-content">
                      <div class="card-title">{{ card.title }}</div>
                      <div class="split-data-grid">
                        <div class="split-item">
                          <div class="split-label">{{ card.splitData.material.label }}</div>
                          <div class="split-value">{{ card.splitData.material.value }}{{ card.splitData.material.unit }}</div>
                        </div>
                        <div class="split-item">
                          <div class="split-label">{{ card.splitData.batch.label }}</div>
                          <div class="split-value">{{ card.splitData.batch.value }}{{ card.splitData.batch.unit }}</div>
                        </div>
                      </div>
                    </div>
                    <div v-else class="normal-card-content">
                      <div class="card-title">{{ card.title }}</div>
                      <div class="card-value">{{ card.value }}</div>
                      <div v-if="card.subtitle" class="card-subtitle">{{ card.subtitle }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 数据表格 -->
            <el-table
              :data="getTestResultTableData(currentTestRule.testResult).slice(0, 10)"
              max-height="300"
              border
            >
              <el-table-column
                v-for="(_, key) in getTestResultTableData(currentTestRule.testResult)[0]"
                :key="key"
                :prop="key"
                :label="key"
                show-overflow-tooltip
                min-width="120"
              />
            </el-table>
            <div class="result-summary">
              <el-text type="info">
                显示前10条记录，共 {{ getTestResultTableData(currentTestRule.testResult).length }} 条数据
              </el-text>
            </div>
          </div>
          <div v-else-if="currentTestRule.testResult && currentTestRule.testResult.reply">
            <el-card>
              <h5>AI回复内容：</h5>
              <p>{{ currentTestRule.testResult.reply }}</p>
            </el-card>
          </div>
          <div v-else>
            <el-empty description="无测试数据" />
          </div>

          <h4>🔧 规则配置信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="规则ID">
              {{ currentTestRule.id }}
            </el-descriptions-item>
            <el-descriptions-item label="动作类型">
              <el-tag :type="currentTestRule.action_type === 'SQL_QUERY' ? 'success' : 'warning'">
                {{ currentTestRule.action_type }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="优先级">
              {{ currentTestRule.priority || 1 }}
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="currentTestRule.status === 'active' ? 'success' : 'info'">
                {{ currentTestRule.status === 'active' ? '启用' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="触发词" span="2">
              <div v-if="currentTestRule.trigger_words && currentTestRule.trigger_words.length > 0">
                <el-tag
                  v-for="(word, index) in currentTestRule.trigger_words"
                  :key="index"
                  size="small"
                  class="trigger-word-tag"
                >
                  {{ word }}
                </el-tag>
              </div>
              <span v-else class="text-muted">无触发词配置</span>
            </el-descriptions-item>
            <el-descriptions-item label="SQL查询" span="2">
              <el-input
                :value="currentTestRule.action_target || '无SQL配置'"
                type="textarea"
                :rows="8"
                readonly
                placeholder="规则的SQL查询语句"
              />
            </el-descriptions-item>
          </el-descriptions>

          <div v-if="currentTestRule.testResult" style="margin-top: 20px;">
            <h4>🧪 最近测试信息</h4>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="测试时间">
                {{ currentTestRule.testResult?.timestamp || '未知' }}
              </el-descriptions-item>
              <el-descriptions-item label="测试状态">
                <el-tag :type="currentTestRule.working ? 'success' : currentTestRule.error ? 'danger' : 'info'">
                  {{ currentTestRule.working ? '正常' : currentTestRule.error ? '异常' : '未测试' }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="testResultDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="retestCurrentRule" :loading="currentTestRule?.testing">
          重新测试
        </el-button>
      </template>
    </el-dialog>
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
  CircleCloseFilled,
  Warning,
  TrendCharts,
  ChatLineRound
} from '@element-plus/icons-vue';

// 响应式数据
const activeTab = ref('nlp');
const activeRuleCategory = ref('all');
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

// 测试结果弹窗相关
const testResultDialogVisible = ref(false);
const currentTestRule = ref(null);
const currentTestQuery = ref('');

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

// 过滤后的规则列表
const filteredNlpRules = computed(() => {
  let filtered = nlpRules.value;

  // 按搜索关键词过滤
  if (nlpSearchQuery.value) {
    const query = nlpSearchQuery.value.toLowerCase();
    filtered = filtered.filter(rule =>
      rule.intent_name.toLowerCase().includes(query) ||
      rule.description.toLowerCase().includes(query)
    );
  }

  return filtered;
});

// 规则分类功能
const getBasicRules = () => {
  return nlpRules.value.filter(rule =>
    rule.action_type === 'SQL_QUERY' &&
    (!rule.sql_template || rule.sql_template.split('JOIN').length <= 2)
  );
};

const getAnalysisRules = () => {
  return nlpRules.value.filter(rule =>
    rule.action_type === 'SQL_QUERY' &&
    (rule.sql_template?.includes('COUNT') ||
     rule.sql_template?.includes('SUM') ||
     rule.sql_template?.includes('AVG') ||
     rule.sql_template?.includes('GROUP BY'))
  );
};

const getComplexRules = () => {
  return nlpRules.value.filter(rule =>
    rule.action_type === 'SQL_QUERY' &&
    rule.sql_template &&
    (rule.sql_template.split('JOIN').length > 2 ||
     rule.sql_template.includes('SUBQUERY') ||
     rule.sql_template.includes('WITH'))
  );
};

const getCurrentCategoryRules = () => {
  switch (activeRuleCategory.value) {
    case 'basic':
      return getBasicRules();
    case 'analysis':
      return getAnalysisRules();
    case 'complex':
      return getComplexRules();
    default:
      return filteredNlpRules.value;
  }
};

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
    const { default: RulesService } = await import('../services/RulesService.js');
    const result = await RulesService.testAllRules();

    if (result.success) {
      const { totalTested, successCount } = result.data;
      ElMessage.success(`批量测试完成: ${successCount}/${totalTested} 条规则测试成功`);
    } else {
      throw new Error(result.message || '批量测试失败');
    }
  } catch (error) {
    ElMessage.error('批量测试失败: ' + error.message);
  } finally {
    globalTesting.value = false;
  }
};

const exportAllRules = async () => {
  try {
    const { default: RulesService } = await import('../services/RulesService.js');
    RulesService.exportRules(nlpRules.value);
    ElMessage.success('规则库导出成功');
  } catch (error) {
    ElMessage.error('导出失败: ' + error.message);
  }
};

// 加载NLP规则数据
const loadNlpRules = async () => {
  loading.value.nlp = true;
  try {
    console.log('开始加载规则...');

    // 直接使用fetch避免复杂的服务层问题
    const response = await fetch('/api/rules');

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('API响应数据:', result);

    if (result.success && Array.isArray(result.data)) {
      nlpRules.value = result.data.map(rule => ({
        ...rule,
        tested: false,
        working: false,
        error: false,
        testing: false,
        testResult: null
      }));
      console.log(`成功加载 ${nlpRules.value.length} 条规则`);
      ElMessage.success(`成功加载 ${nlpRules.value.length} 条规则`);
    } else {
      throw new Error('返回的数据格式不正确');
    }
  } catch (error) {
    console.error('加载NLP规则失败:', error);
    ElMessage.error('加载规则失败: ' + error.message);

    // 使用备用数据避免页面崩溃
    nlpRules.value = [
      {
        id: 1,
        intent_name: '备用测试规则',
        description: '这是备用规则，API连接失败时显示',
        action_type: 'SQL_QUERY',
        status: 'active',
        priority: 1,
        tested: false,
        working: false,
        error: false,
        testing: false,
        testResult: null
      }
    ];
    ElMessage.warning('使用备用规则数据，请检查API连接');
  } finally {
    loading.value.nlp = false;
  }
};

// 测试单个规则
const testSingleRule = async (rule) => {
  rule.testing = true;
  try {
    console.log('🧪 测试规则:', rule.intent_name);

    // 必须使用规则的示例查询进行测试
    const testQuery = rule.example_query;
    if (!testQuery) {
      throw new Error('规则缺少示例查询 (example_query)');
    }
    console.log('🔍 使用示例查询:', testQuery);

    // 调用后端API进行测试
    const response = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: testQuery
      })
    });

    console.log('📡 API响应状态:', response.status);

    if (response.ok) {
      const result = await response.json();
      console.log('📊 规则测试结果:', result);

      // 判断测试是否成功 - 重点检查是否有实际数据返回
      // API返回的数据结构: { success: true, tableData: [...], message: "..." }
      const tableData = result.tableData || [];
      const hasData = Array.isArray(tableData) && tableData.length > 0;
      const hasReply = result.reply && result.reply.trim().length > 0;
      const hasMessage = result.message && result.message.trim().length > 0;
      const isSuccess = result.success !== false && (hasData || hasReply || hasMessage);

      console.log('📊 测试结果分析:');
      console.log('  - success字段:', result.success);
      console.log('  - 有数据:', hasData);
      console.log('  - 数据条数:', tableData.length);
      console.log('  - 有回复:', hasReply);
      console.log('  - 有消息:', hasMessage);
      console.log('  - 数据内容:', result.tableData);
      console.log('  - 最终判断:', isSuccess);

      // 更新规则状态
      rule.tested = true;
      rule.working = isSuccess;
      rule.error = !isSuccess;
      rule.testResult = {
        success: isSuccess,
        data: { tableData: tableData },
        reply: result.reply || '',
        sql: result.sql || '',
        params: result.params || {},
        matchedRule: result.matchedRule || '',
        source: result.source || '',
        timestamp: new Date().toLocaleString(),
        query: testQuery,
        hasData: hasData,
        hasReply: hasReply,
        rawResult: result
      };

      if (isSuccess) {
        const dataCount = tableData.length;
        ElMessage.success(`✅ 规则 "${rule.intent_name}" 测试成功 - 返回 ${dataCount} 条数据`);
        console.log(`✅ 规则测试成功 - 返回数据: ${dataCount} 条`);
      } else {
        ElMessage.warning(`⚠️ 规则 "${rule.intent_name}" 测试失败 - 无有效数据返回`);
        console.log(`⚠️ 规则测试失败 - 结果:`, result);
      }
    } else {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  } catch (error) {
    console.error('❌ 规则测试失败:', error);
    rule.tested = true;
    rule.working = false;
    rule.error = true;
    rule.testResult = {
      success: false,
      error: error.message,
      timestamp: new Date().toLocaleString(),
      query: rule.example_query || generateTestQuery(rule)
    };
    ElMessage.error(`❌ 规则测试失败: ${error.message}`);
  } finally {
    rule.testing = false;
  }
};

// 生成测试查询
const generateTestQuery = (rule) => {
  const queries = {
    '真实测试结果统计': '查询测试结果统计',
    '物料库存查询': '查询物料库存信息',
    '供应商信息查询': '查询供应商信息',
    '批次信息查询': '查询批次信息',
    '在线跟踪查询': '查询在线跟踪数据'
  };

  return queries[rule.intent_name] || `测试规则: ${rule.intent_name}`;
};

// 获取测试结果表格数据
const getTestResultTableData = (testResult) => {
  if (!testResult) return [];

  // 检查多种可能的数据结构
  if (testResult.rawResult?.data?.tableData && Array.isArray(testResult.rawResult.data.tableData)) {
    return testResult.rawResult.data.tableData;
  }

  if (testResult.data?.tableData && Array.isArray(testResult.data.tableData)) {
    return testResult.data.tableData;
  }

  if (testResult.data && Array.isArray(testResult.data)) {
    return testResult.data;
  }

  return [];
};

// 获取测试状态文本
const getTestStatusText = (rule) => {
  if (!rule.tested) return '未测试';
  if (rule.testing) return '测试中...';
  if (rule.working) return '正常';
  if (rule.error) return '异常';
  return '未知';
};

// 批量测试所有NLP规则
const testAllNlpRules = async () => {
  batchTesting.value = true;
  try {
    const { default: RulesService } = await import('../services/RulesService.js');
    const result = await RulesService.testAllRules();

    if (result.success) {
      const { totalTested, successCount, failureCount, results } = result.data;

      // 更新规则状态
      results.forEach(testResult => {
        const rule = nlpRules.value.find(r => r.id === testResult.id);
        if (rule) {
          rule.tested = true;
          rule.working = testResult.success;
          rule.error = !testResult.success;
          rule.testResult = testResult;
        }
      });

      ElMessage.success(`批量测试完成: ${successCount}/${totalTested} 条规则测试成功`);
    } else {
      throw new Error(result.message || '批量测试失败');
    }
  } catch (error) {
    console.error('批量测试失败:', error);
    ElMessage.error('批量测试失败: ' + error.message);
  } finally {
    batchTesting.value = false;
  }
};

// 查看规则详情
const viewRuleDetails = (rule) => {
  console.log('📋 查看规则详情:', rule.intent_name);
  currentTestRule.value = rule;
  currentTestQuery.value = rule.testResult?.query || rule.example_query || generateTestQuery(rule);
  testResultDialogVisible.value = true;
};

// 重新测试当前规则
const retestCurrentRule = async () => {
  if (currentTestRule.value) {
    await testSingleRule(currentTestRule.value);
    currentTestQuery.value = currentTestRule.value.testResult?.query || currentTestRule.value.example_query || generateTestQuery(currentTestRule.value);
  }
};

// 编辑规则
const editRule = (rule) => {
  ElMessage.info(`编辑规则: ${rule.intent_name}`);
  // 这里可以打开编辑对话框
};

// 分类相关方法
const getCategoryTagType = (category) => {
  switch (category) {
    case '基础查询':
      return 'success';
    case '进阶查询':
      return 'primary';
    case '专项分析':
      return 'danger';
    case '统计报表':
      return 'warning';
    case '物料专项':
      return 'info';
    case '对比分析':
      return 'primary';
    case '综合查询':
      return 'success';
    // 兼容旧分类名称
    case '基础查询规则':
      return 'success';
    case '进阶分析规则':
      return 'primary';
    case '高级统计规则':
      return 'warning';
    case '专项分析规则':
      return 'danger';
    case '趋势对比规则':
      return 'info';
    case '中级规则':
      return 'success';
    case '高级规则':
      return 'warning';
    case '专项规则':
      return 'danger';
    case '排行规则':
      return 'primary';
    case '复杂规则':
      return 'info';
    case '追溯规则':
      return 'primary';
    default:
      return '';
  }
};

const getCategoryLabel = (category) => {
  switch (category) {
    case '基础查询':
      return '基础查询';
    case '进阶查询':
      return '进阶查询';
    case '专项分析':
      return '专项分析';
    case '统计报表':
      return '统计报表';
    case '物料专项':
      return '物料专项';
    case '对比分析':
      return '对比分析';
    case '综合查询':
      return '综合查询';
    // 兼容旧分类名称
    case '基础查询规则':
      return '基础';
    case '进阶分析规则':
      return '进阶';
    case '高级统计规则':
      return '统计';
    case '专项分析规则':
      return '专项';
    case '趋势对比规则':
      return '趋势';
    case '中级规则':
      return '中级';
    case '高级规则':
      return '高级';
    case '专项规则':
      return '专项';
    case '排行规则':
      return '排行';
    case '复杂规则':
      return '复杂';
    case '追溯规则':
      return '追溯';
    default:
      return '未分类';
  }
};

// 其他辅助功能
const getRuleComplexityType = (rule) => {
  if (getComplexRules().includes(rule)) return 'danger';
  if (getAnalysisRules().includes(rule)) return 'warning';
  return 'success';
};

const getRuleComplexityLabel = (rule) => {
  if (getComplexRules().includes(rule)) return '复杂';
  if (getAnalysisRules().includes(rule)) return '分析';
  return '基础';
};

const hasParameters = (rule) => {
  return rule.parameters && rule.parameters.length > 0;
};

const getParameterCount = (rule) => {
  return rule.parameters ? rule.parameters.length : 0;
};

const getRowClassName = ({ row }) => {
  if (row.error) return 'error-row';
  if (row.working) return 'success-row';
  if (row.tested) return 'tested-row';
  return '';
};

const handleRowClick = (row) => {
  console.log('点击规则行:', row.intent_name);
};

// 事件处理
const handleSearch = () => {
  currentPageNlp.value = 1; // 搜索时重置到第一页
};

const handleCategoryChange = () => {
  currentPageNlp.value = 1; // 切换分类时重置到第一页
};

const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  currentPageNlp.value = 1;
};

const handleCurrentChange = (newPage) => {
  currentPageNlp.value = newPage;
};

const openAddRuleDialog = (type) => {
  ElMessage.info(`添加${type}规则功能开发中...`);
};

const exportRules = (type) => {
  ElMessage.info(`导出${type}规则功能开发中...`);
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

/* 测试结果对话框样式 */
.test-result-content {
  padding: 10px;
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.rule-header h3 {
  margin: 0;
  color: #303133;
}

.test-details h4 {
  margin: 20px 0 10px 0;
  color: #606266;
  font-size: 16px;
}

.query-input {
  margin-bottom: 20px;
}

.result-summary {
  margin-top: 10px;
  text-align: center;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

/* 行状态样式 */
.error-row {
  background-color: #fef0f0;
}

.success-row {
  background-color: #f0f9ff;
}

.tested-row {
  background-color: #f5f7fa;
}

/* 测试状态样式 */
.test-status {
  display: flex;
  align-items: center;
  gap: 5px;
}

.status-icon {
  font-size: 16px;
}

.status-icon.success {
  color: #67c23a;
}

.status-icon.error {
  color: #f56c6c;
}

.status-text {
  font-size: 12px;
}

/* 触发词标签样式 */
.trigger-word-tag {
  margin: 2px 4px 2px 0;
}

.text-muted {
  color: #909399;
  font-style: italic;
}

/* 测试结果卡片样式 */
.test-result-cards {
  margin-bottom: 20px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 12px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #409eff;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-card.inventory {
  border-left-color: #67c23a;
}

.stat-card.production {
  border-left-color: #e6a23c;
}

.stat-card.testing {
  border-left-color: #f56c6c;
}

.card-icon {
  font-size: 24px;
  opacity: 0.8;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.card-value {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.card-subtitle {
  font-size: 11px;
  color: #c0c4cc;
  margin-top: 2px;
}

.split-data-content .card-title {
  margin-bottom: 8px;
}

.split-data-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.split-item {
  text-align: center;
}

.split-label {
  font-size: 11px;
  color: #909399;
  margin-bottom: 2px;
}

.split-value {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}
</style>
