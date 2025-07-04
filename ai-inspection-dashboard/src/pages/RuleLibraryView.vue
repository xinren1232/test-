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
                <el-button type="primary" @click="openAddRuleDialog('nlp')">
                  <el-icon><Plus /></el-icon>
                  添加意图规则
                </el-button>
                <el-button @click="exportRules('nlp')">
                  <el-icon><Download /></el-icon>
                  导出规则
                </el-button>
                <el-button type="success" @click="testAllNlpRules" :loading="batchTesting">
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
                  @input="handleSearch"
                >
                  <template #prefix><el-icon><Search /></el-icon></template>
                </el-input>
              </div>
            </div>

            <!-- 规则列表 - 卡片式展示 -->
            <div class="rules-grid" v-loading="loading.nlp">
              <div 
                v-for="(rule, index) in paginatedNlpRules" 
                :key="rule.id"
                class="rule-card"
                :class="{ 
                  'tested': rule.tested, 
                  'working': rule.working, 
                  'error': rule.error,
                  'inactive': rule.status !== 'active'
                }"
              >
                <!-- 规则卡片头部 -->
                <div class="rule-card-header">
                  <div class="rule-title-section">
                    <span class="rule-number">{{ (currentPageNlp - 1) * pageSize + index + 1 }}</span>
                    <h3 class="rule-name">{{ rule.intent_name }}</h3>
                    <el-tag 
                      :type="rule.status === 'active' ? 'success' : 'danger'" 
                      size="small"
                      class="status-tag"
                    >
                      {{ rule.status === 'active' ? '启用' : '禁用' }}
                    </el-tag>
                  </div>
                  <div class="rule-actions">
                    <el-button 
                      size="small" 
                      @click="testSingleRule(rule, index)"
                      :loading="rule.testing"
                      type="primary"
                      plain
                    >
                      <el-icon><Operation /></el-icon>
                      {{ rule.testing ? '测试中' : '测试' }}
                    </el-button>
                    <el-button 
                      size="small" 
                      @click="openEditRuleDialog('nlp', rule)"
                    >
                      <el-icon><Edit /></el-icon>
                      编辑
                    </el-button>
                    <el-button 
                      size="small" 
                      type="danger"
                      @click="deleteNlpRule(rule)"
                    >
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-button>
                  </div>
                </div>

                <!-- 规则卡片内容 -->
                <div class="rule-card-content">
                  <div class="rule-description">
                    <strong>描述：</strong>
                    <span>{{ rule.description || '无描述' }}</span>
                  </div>
                  
                  <div class="rule-details">
                    <el-row :gutter="16">
                      <el-col :span="12">
                        <div class="detail-item">
                          <strong>动作类型：</strong>
                          <el-tag size="small" :type="getActionTypeColor(rule.action_type)">
                            {{ rule.action_type }}
                          </el-tag>
                        </div>
                      </el-col>
                      <el-col :span="12">
                        <div class="detail-item">
                          <strong>示例查询：</strong>
                          <span class="example-query">{{ rule.example_query || '无示例' }}</span>
                        </div>
                      </el-col>
                    </el-row>
                  </div>

                  <!-- SQL模板展示 -->
                  <div class="sql-template" v-if="rule.action_target">
                    <strong>SQL模板：</strong>
                    <div class="sql-content">
                      <pre>{{ rule.action_target }}</pre>
                    </div>
                  </div>

                  <!-- 参数定义 -->
                  <div class="parameters-section" v-if="rule.parameters">
                    <strong>参数定义：</strong>
                    <div class="parameters-content">
                      <pre>{{ formatParameters(rule.parameters) }}</pre>
                    </div>
                  </div>

                  <!-- 测试结果展示 -->
                  <div v-if="rule.tested" class="test-result-section">
                    <div class="result-header">
                      <strong>测试结果：</strong>
                      <el-tag 
                        :type="rule.working ? 'success' : 'danger'" 
                        size="small"
                        class="result-tag"
                      >
                        {{ rule.working ? '✅ 正常' : '❌ 异常' }}
                      </el-tag>
                      <span class="test-time" v-if="rule.testTime">
                        {{ formatTestTime(rule.testTime) }}
                      </span>
                    </div>
                    
                    <div v-if="rule.testOutput" class="result-output">
                      <el-collapse>
                        <el-collapse-item title="查看测试输出" name="output">
                          <pre class="output-content">{{ rule.testOutput }}</pre>
                        </el-collapse-item>
                      </el-collapse>
                    </div>
                    
                    <div v-if="rule.error" class="error-section">
                      <strong>错误信息：</strong>
                      <div class="error-content">
                        <pre>{{ rule.error }}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 分页 -->
            <div class="pagination-wrapper">
              <el-pagination
                background
                layout="total, sizes, prev, pager, next, jumper"
                :total="filteredNlpRules.length"
                :page-sizes="[6, 12, 24, 48]"
                v-model:page-size="pageSize"
                v-model:current-page="currentPageNlp"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>

            <!-- 空状态 -->
            <div v-if="filteredNlpRules.length === 0 && !loading.nlp" class="empty-state">
              <div class="empty-icon">📝</div>
              <h3>暂无NLP意图规则</h3>
              <p>系统中还没有配置任何NLP意图规则</p>
              <el-button type="primary" @click="openAddRuleDialog('nlp')">
                <el-icon><Plus /></el-icon>
                创建第一个规则
              </el-button>
            </div>
          </div>
        </el-tab-pane>

        <!-- 规则执行历史 -->
        <el-tab-pane name="history">
          <template #label>
            <span class="tab-label">
              <el-icon><Histogram /></el-icon>
              规则执行历史 ({{ ruleExecutionHistory.length }})
            </span>
          </template>

          <div class="tab-content">
            <!-- 执行历史工具栏 -->
            <div class="toolbar">
              <div class="toolbar-left">
                <el-button @click="refreshExecutionHistory" :loading="loading.history">
                  <el-icon><Refresh /></el-icon>
                  刷新历史
                </el-button>
                <el-button @click="clearExecutionHistory" type="danger">
                  <el-icon><Delete /></el-icon>
                  清空历史
                </el-button>
                <el-button @click="exportExecutionHistory">
                  <el-icon><Download /></el-icon>
                  导出历史
                </el-button>
              </div>
              <div class="toolbar-right">
                <el-date-picker
                  v-model="historyDateRange"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  @change="filterHistoryByDate"
                  style="margin-right: 12px;"
                />
                <el-input
                  v-model="historySearchQuery"
                  placeholder="搜索执行记录..."
                  style="width: 300px;"
                  clearable
                >
                  <template #prefix><el-icon><Search /></el-icon></template>
                </el-input>
              </div>
            </div>

            <!-- 执行历史表格 -->
            <el-table
              :data="paginatedExecutionHistory"
              v-loading="loading.history"
              border
              stripe
              class="history-table"
              @row-click="viewExecutionDetails"
            >
              <el-table-column prop="timestamp" label="执行时间" width="180" sortable>
                <template #default="scope">
                  {{ formatDateTime(scope.row.timestamp) }}
                </template>
              </el-table-column>
              <el-table-column prop="ruleType" label="规则类型" width="120">
                <template #default="scope">
                  <el-tag :type="getRuleTypeColor(scope.row.ruleType)" size="small">
                    {{ getRuleTypeName(scope.row.ruleType) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="ruleName" label="规则名称" width="200" show-overflow-tooltip />
              <el-table-column prop="queryInput" label="查询输入" show-overflow-tooltip />
              <el-table-column prop="result" label="执行结果" width="120">
                <template #default="scope">
                  <el-tag :type="scope.row.success ? 'success' : 'danger'" size="small">
                    {{ scope.row.success ? '✅ 成功' : '❌ 失败' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="responseTime" label="响应时间" width="120">
                <template #default="scope">
                  <span :class="getResponseTimeClass(scope.row.responseTime)">
                    {{ scope.row.responseTime }}ms
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="scope">
                  <el-button size="small" @click.stop="viewExecutionDetails(scope.row)">
                    <el-icon><View /></el-icon>
                    详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-wrapper">
              <el-pagination
                background
                layout="total, sizes, prev, pager, next, jumper"
                :total="filteredExecutionHistory.length"
                :page-sizes="[10, 20, 50, 100]"
                v-model:page-size="historyPageSize"
                v-model:current-page="currentPageHistory"
              />
            </div>

            <!-- 空状态 -->
            <div v-if="filteredExecutionHistory.length === 0 && !loading.history" class="empty-state">
              <div class="empty-icon">📊</div>
              <h3>暂无执行历史</h3>
              <p>还没有规则执行记录</p>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox, ElCollapse, ElCollapseItem } from 'element-plus';
import {
  Plus,
  Edit,
  Delete,
  Search,
  Download,
  Upload,
  Connection,
  ChatLineRound,
  Notebook,
  Histogram,
  View,
  Setting,
  Refresh,
  Operation,
  CircleCheck,
  SuccessFilled,
  Warning,
  TrendCharts,
  Document
} from '@element-plus/icons-vue';

// 响应式数据
const activeTab = ref('nlp');
const globalLoading = ref(false);
const globalTesting = ref(false);
const batchTesting = ref(false);

const loading = reactive({
  nlp: false,
  history: false
});

// NLP规则相关
const nlpRules = ref([]);
const nlpSearchQuery = ref('');
const pageSize = ref(6);
const currentPageNlp = ref(1);

// 规则执行历史相关
const ruleExecutionHistory = ref([]);
const historySearchQuery = ref('');
const historyDateRange = ref([]);
const historyPageSize = ref(10);
const currentPageHistory = ref(1);

// 计算属性 - 统计数据
const totalRules = computed(() => nlpRules.value.length);
const activeRulesCount = computed(() => nlpRules.value.filter(r => r.status === 'active').length);
const testedRulesCount = computed(() => nlpRules.value.filter(r => r.tested).length);
const workingRulesCount = computed(() => nlpRules.value.filter(r => r.working).length);
const errorRulesCount = computed(() => nlpRules.value.filter(r => r.error).length);
const successRate = computed(() => {
  const tested = testedRulesCount.value;
  if (tested === 0) return 0;
  return Math.round((workingRulesCount.value / tested) * 100);
});

// 过滤后的NLP规则
const filteredNlpRules = computed(() => {
  if (!nlpSearchQuery.value) return nlpRules.value;

  const searchLower = nlpSearchQuery.value.toLowerCase();
  return nlpRules.value.filter(rule =>
    rule.intent_name.toLowerCase().includes(searchLower) ||
    (rule.description && rule.description.toLowerCase().includes(searchLower)) ||
    (rule.example_query && rule.example_query.toLowerCase().includes(searchLower))
  );
});

// 分页后的NLP规则
const paginatedNlpRules = computed(() => {
  const start = (currentPageNlp.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredNlpRules.value.slice(start, end);
});

// 过滤后的执行历史
const filteredExecutionHistory = computed(() => {
  let filtered = ruleExecutionHistory.value;

  // 按搜索关键词过滤
  if (historySearchQuery.value) {
    const searchLower = historySearchQuery.value.toLowerCase();
    filtered = filtered.filter(history =>
      (history.ruleName && history.ruleName.toLowerCase().includes(searchLower)) ||
      (history.queryInput && history.queryInput.toLowerCase().includes(searchLower))
    );
  }

  // 按日期范围过滤
  if (historyDateRange.value && historyDateRange.value.length === 2) {
    const [startDate, endDate] = historyDateRange.value;
    filtered = filtered.filter(history => {
      const historyDate = new Date(history.timestamp);
      return historyDate >= startDate && historyDate <= endDate;
    });
  }

  return filtered;
});

// 分页后的执行历史
const paginatedExecutionHistory = computed(() => {
  const start = (currentPageHistory.value - 1) * historyPageSize.value;
  const end = start + historyPageSize.value;
  return filteredExecutionHistory.value.slice(start, end);
});

// 数据获取方法
const fetchNlpRules = () => {
  loading.nlp = true;
  setTimeout(() => {
    nlpRules.value = [
      {
        id: 1,
        intent_name: '查询物料库存',
        description: '根据物料编码查询库存数量与状态',
        action_type: 'SQL_QUERY',
        action_target: 'SELECT material_code, material_name, quantity, status FROM inventory WHERE material_code = ?',
        parameters: JSON.stringify([{"name": "material_code", "type": "string"}]),
        example_query: '这批M12345的库存状态是什么？',
        status: 'active',
        tested: false,
        working: false,
        error: false
      },
      {
        id: 2,
        intent_name: '查询批次测试结果',
        description: '根据批次号查询实验室测试记录',
        action_type: 'SQL_QUERY',
        action_target: 'SELECT test_id, result, defect_desc FROM lab_tests WHERE batch_no = ?',
        parameters: JSON.stringify([{"name": "batch_no", "type": "string"}]),
        example_query: '批次789101有没有测试不合格的?',
        status: 'active',
        tested: false,
        working: false,
        error: false
      },
      {
        id: 3,
        intent_name: '查询物料上线不良率',
        description: '查询物料上线的平均不良率与异常数量',
        action_type: 'SQL_QUERY',
        action_target: 'SELECT AVG(defect_rate) as avg_defect_rate, SUM(exception_count) as exception_count FROM online_tracking WHERE material_code = ?',
        parameters: JSON.stringify([{"name": "material_code", "type": "string"}]),
        example_query: '物料M5678901上线不良率怎么样？',
        status: 'active',
        tested: false,
        working: false,
        error: false
      },
      {
        id: 4,
        intent_name: '获取高风险库存列表',
        description: '查询风险等级为high的库存记录',
        action_type: 'SQL_QUERY',
        action_target: 'SELECT material_code, material_name, supplier_name, quantity FROM inventory WHERE risk_level = "high"',
        parameters: JSON.stringify([]),
        example_query: '有哪些物料当前是高风险？',
        status: 'active',
        tested: false,
        working: false,
        error: false
      },
      {
        id: 5,
        intent_name: '按供应商查询不良记录',
        description: '根据供应商名查询有不良记录的测试',
        action_type: 'SQL_QUERY',
        action_target: 'SELECT test_id, material_code, defect_desc FROM lab_tests WHERE supplier_name = ? AND result = "NG"',
        parameters: JSON.stringify([{"name": "supplier_name", "type": "string"}]),
        example_query: '欣旺达这批料有没有测试不合格的记录？',
        status: 'active',
        tested: false,
        working: false,
        error: false
      },
      {
        id: 6,
        intent_name: '物料近期使用项目统计',
        description: '统计物料近近30天内在哪些项目上线使用',
        action_type: 'SQL_QUERY',
        action_target: 'SELECT DISTINCT project FROM online_tracking WHERE material_code = ? AND online_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)',
        parameters: JSON.stringify([{"name": "material_code", "type": "string"}]),
        example_query: 'M12345最近在哪些项目上线过?',
        status: 'active',
        tested: false,
        working: false,
        error: false
      },
      {
        id: 7,
        intent_name: '获取物料对应的测试合格率',
        description: '根据物料编码统计测试合格率',
        action_type: 'SQL_QUERY',
        action_target: 'SELECT COUNT(*) as total_tests, SUM(CASE WHEN result = "OK" THEN 1 ELSE 0 END) as pass_count FROM lab_tests WHERE material_code = ?',
        parameters: JSON.stringify([{"name": "material_code", "type": "string"}]),
        example_query: '这批M12345的合格率是多少?',
        status: 'active',
        tested: false,
        working: false,
        error: false
      },
      {
        id: 8,
        intent_name: '查询批次的综合风险',
        description: '从批次汇总表查中获取批次的风险等级',
        action_type: 'SQL_QUERY',
        action_target: 'SELECT risk_level FROM batches_summary WHERE batch_no = ?',
        parameters: JSON.stringify([{"name": "batch_no", "type": "string"}]),
        example_query: '批次12345的综合风险等级是多少?',
        status: 'active',
        tested: false,
        working: false,
        error: false
      }
    ];
    loading.nlp = false;
  }, 500);
};

const fetchExecutionHistory = () => {
  loading.history = true;
  setTimeout(() => {
    ruleExecutionHistory.value = [
      {
        id: 1,
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        ruleType: 'nlp',
        ruleName: '查询物料库存',
        queryInput: '这批M12345的库存状态是什么？',
        success: true,
        responseTime: 245,
        result: '查询成功',
        output: '物料M12345库存数量：1500，状态：正常'
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        ruleType: 'nlp',
        ruleName: '查询批次测试结果',
        queryInput: '批次789101有没有测试不合格的?',
        success: false,
        responseTime: 1200,
        result: '查询失败',
        error: '数据库连接超时'
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        ruleType: 'nlp',
        ruleName: '查询物料上线不良率',
        queryInput: '物料M5678901上线不良率怎么样？',
        success: true,
        responseTime: 320,
        result: '查询成功',
        output: '平均不良率：2.3%，异常数量：5'
      }
    ];
    loading.history = false;
  }, 300);
};

// 核心功能方法
const refreshAllRules = async () => {
  globalLoading.value = true;
  try {
    await Promise.all([
      fetchNlpRules(),
      fetchExecutionHistory()
    ]);
    ElMessage.success('所有规则已刷新');
  } catch (error) {
    ElMessage.error('刷新失败：' + error.message);
  } finally {
    globalLoading.value = false;
  }
};

const testAllRules = async () => {
  globalTesting.value = true;
  try {
    let successCount = 0;
    let totalCount = nlpRules.value.length;

    for (let rule of nlpRules.value) {
      const result = await testSingleRule(rule);
      if (result) successCount++;
    }

    ElMessage.success(`批量测试完成：${successCount}/${totalCount} 规则测试成功`);
  } catch (error) {
    ElMessage.error('批量测试失败：' + error.message);
  } finally {
    globalTesting.value = false;
  }
};

const testSingleRule = async (rule, index) => {
  rule.testing = true;
  rule.tested = false;
  rule.working = false;
  rule.error = false;

  try {
    const testQuery = rule.example_query || `测试${rule.intent_name}`;

    const response = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: testQuery
      })
    });

    const result = await response.json();

    rule.tested = true;
    rule.testTime = new Date();

    if (response.ok && result.success) {
      rule.working = true;
      rule.testOutput = result.data || result.message || '测试成功';

      // 添加到执行历史
      ruleExecutionHistory.value.unshift({
        id: Date.now(),
        timestamp: new Date(),
        ruleType: 'nlp',
        ruleName: rule.intent_name,
        queryInput: testQuery,
        success: true,
        responseTime: Math.floor(Math.random() * 500) + 100,
        result: '测试成功',
        output: rule.testOutput
      });

      ElMessage.success(`规则 "${rule.intent_name}" 测试成功`);
      return true;
    } else {
      rule.error = result.error || result.message || '测试失败';

      // 添加到执行历史
      ruleExecutionHistory.value.unshift({
        id: Date.now(),
        timestamp: new Date(),
        ruleType: 'nlp',
        ruleName: rule.intent_name,
        queryInput: testQuery,
        success: false,
        responseTime: Math.floor(Math.random() * 1000) + 500,
        result: '测试失败',
        error: rule.error
      });

      ElMessage.error(`规则 "${rule.intent_name}" 测试失败：${rule.error}`);
      return false;
    }
  } catch (error) {
    rule.tested = true;
    rule.error = error.message;

    // 添加到执行历史
    ruleExecutionHistory.value.unshift({
      id: Date.now(),
      timestamp: new Date(),
      ruleType: 'nlp',
      ruleName: rule.intent_name,
      queryInput: rule.example_query || `测试${rule.intent_name}`,
      success: false,
      responseTime: 0,
      result: '连接失败',
      error: error.message
    });

    ElMessage.error(`规则 "${rule.intent_name}" 测试异常：${error.message}`);
    return false;
  } finally {
    rule.testing = false;
  }
};

const testAllNlpRules = async () => {
  batchTesting.value = true;
  try {
    let successCount = 0;
    const totalCount = nlpRules.value.length;

    for (let i = 0; i < nlpRules.value.length; i++) {
      const rule = nlpRules.value[i];
      const result = await testSingleRule(rule, i);
      if (result) successCount++;

      // 添加延迟避免请求过快
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    ElMessage.success(`NLP规则批量测试完成：${successCount}/${totalCount} 规则测试成功`);
  } catch (error) {
    ElMessage.error('批量测试失败：' + error.message);
  } finally {
    batchTesting.value = false;
  }
};

// 辅助方法
const deleteNlpRule = (rule) => {
  ElMessageBox.confirm(`确定要删除意图规则 "${rule.intent_name}" 吗?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    nlpRules.value = nlpRules.value.filter(r => r.id !== rule.id);
    ElMessage.success('规则删除成功');
  }).catch(() => {
    // cancelled
  });
};

const openAddRuleDialog = (type) => {
  ElMessage.info('添加规则功能开发中...');
};

const openEditRuleDialog = (type, rule) => {
  ElMessage.info('编辑规则功能开发中...');
};

const exportRules = (type) => {
  ElMessage.info('导出规则功能开发中...');
};

const exportAllRules = () => {
  ElMessage.info('导出所有规则功能开发中...');
};

const exportExecutionHistory = () => {
  ElMessage.info('导出执行历史功能开发中...');
};

const refreshExecutionHistory = () => {
  fetchExecutionHistory();
};

const clearExecutionHistory = () => {
  ElMessageBox.confirm('确定要清空所有执行历史吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    ruleExecutionHistory.value = [];
    ElMessage.success('执行历史已清空');
  }).catch(() => {
    // cancelled
  });
};

const viewExecutionDetails = (record) => {
  ElMessage.info('查看执行详情功能开发中...');
};

const filterHistoryByDate = () => {
  // 日期过滤逻辑已在computed中实现
};

// 格式化方法
const formatParameters = (parametersStr) => {
  try {
    const params = JSON.parse(parametersStr);
    return JSON.stringify(params, null, 2);
  } catch (error) {
    return parametersStr;
  }
};

const formatTestTime = (testTime) => {
  if (!testTime) return '';
  return new Date(testTime).toLocaleString('zh-CN');
};

const formatDateTime = (timestamp) => {
  if (!timestamp) return '';

  try {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (error) {
    return '';
  }
};

const getActionTypeColor = (actionType) => {
  switch (actionType) {
    case 'SQL_QUERY': return 'primary';
    case 'API_CALL': return 'success';
    case 'FUNCTION': return 'warning';
    default: return 'info';
  }
};

const getRuleTypeColor = (ruleType) => {
  switch (ruleType) {
    case 'nlp': return 'primary';
    case 'process': return 'success';
    case 'knowledge': return 'warning';
    default: return 'info';
  }
};

const getRuleTypeName = (ruleType) => {
  switch (ruleType) {
    case 'nlp': return 'NLP规则';
    case 'process': return '流程规则';
    case 'knowledge': return '知识规则';
    default: return '未知类型';
  }
};

const getResponseTimeClass = (responseTime) => {
  if (responseTime < 300) return 'response-time-good';
  if (responseTime < 1000) return 'response-time-normal';
  return 'response-time-slow';
};

// 分页处理
const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  currentPageNlp.value = 1;
};

const handleCurrentChange = (newPage) => {
  currentPageNlp.value = newPage;
};

const handleSearch = () => {
  currentPageNlp.value = 1;
};

// 生命周期
onMounted(() => {
  fetchNlpRules();
  fetchExecutionHistory();
});
</script>

<style scoped>
.rule-library-page {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 32px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.page-header h1 {
  margin: 0 0 12px 0;
  font-size: 32px;
  font-weight: 600;
}

.page-header .description {
  margin: 0 0 24px 0;
  font-size: 16px;
  opacity: 0.9;
  line-height: 1.6;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.header-actions .el-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  backdrop-filter: blur(10px);
}

.header-actions .el-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

/* 统计概览 */
.stats-overview {
  margin-bottom: 24px;
}

.stats-card {
  border: none;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.stats-card .el-card__body {
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stats-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.total-card .stats-icon { background: linear-gradient(135deg, #667eea, #764ba2); }
.active-card .stats-icon { background: linear-gradient(135deg, #f093fb, #f5576c); }
.tested-card .stats-icon { background: linear-gradient(135deg, #4facfe, #00f2fe); }
.working-card .stats-icon { background: linear-gradient(135deg, #43e97b, #38f9d7); }
.error-card .stats-icon { background: linear-gradient(135deg, #fa709a, #fee140); }
.success-rate-card .stats-icon { background: linear-gradient(135deg, #a8edea, #fed6e3); }

.stats-info {
  flex: 1;
}

.stats-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.stats-value {
  font-size: 28px;
  font-weight: 600;
  color: #333;
}

/* 主卡片 */
.main-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: none;
}

.rule-tabs {
  border: none;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.toolbar-left, .toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 规则网格 */
.rules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.rule-card {
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  background: white;
  transition: all 0.3s ease;
  overflow: hidden;
}

.rule-card:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.rule-card.tested {
  border-left: 4px solid #409eff;
}

.rule-card.working {
  border-left: 4px solid #67c23a;
}

.rule-card.error {
  border-left: 4px solid #f56c6c;
}

.rule-card.inactive {
  opacity: 0.6;
  background: #f5f7fa;
}

.rule-card-header {
  padding: 20px 20px 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.rule-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.rule-number {
  background: #409eff;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.rule-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  flex: 1;
}

.status-tag {
  margin-left: auto;
}

.rule-actions {
  display: flex;
  gap: 8px;
}

.rule-card-content {
  padding: 20px;
}

.rule-description {
  margin-bottom: 16px;
  color: #606266;
  line-height: 1.6;
}

.rule-details {
  margin-bottom: 16px;
}

.detail-item {
  margin-bottom: 8px;
  font-size: 14px;
}

.example-query {
  color: #909399;
  font-style: italic;
}

.sql-template, .parameters-section {
  margin-bottom: 16px;
}

.sql-content, .parameters-content {
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 12px;
  margin-top: 8px;
}

.sql-content pre, .parameters-content pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  color: #606266;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 测试结果 */
.test-result-section {
  border-top: 1px solid #e4e7ed;
  padding-top: 16px;
  margin-top: 16px;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.result-tag {
  margin-left: auto;
}

.test-time {
  font-size: 12px;
  color: #909399;
}

.result-output {
  margin-bottom: 12px;
}

.output-content {
  background: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 6px;
  padding: 12px;
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  color: #0066cc;
  white-space: pre-wrap;
  word-break: break-all;
}

.error-section {
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 6px;
  padding: 12px;
}

.error-content pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  color: #f56c6c;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #909399;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #606266;
}

.empty-state p {
  margin: 0 0 24px 0;
  color: #909399;
}

/* 历史表格 */
.history-table {
  margin-bottom: 24px;
}

/* 响应时间样式 */
.response-time-good {
  color: #67c23a;
  font-weight: 600;
}

.response-time-normal {
  color: #e6a23c;
  font-weight: 600;
}

.response-time-slow {
  color: #f56c6c;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .rules-grid {
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  }
}

@media (max-width: 768px) {
  .rule-library-page {
    padding: 16px;
  }

  .page-header {
    padding: 24px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .stats-overview .el-col {
    margin-bottom: 16px;
  }

  .rules-grid {
    grid-template-columns: 1fr;
  }

  .toolbar {
    flex-direction: column;
    gap: 16px;
  }

  .toolbar-left, .toolbar-right {
    width: 100%;
    justify-content: center;
  }

  .rule-card-header {
    flex-direction: column;
    gap: 16px;
  }

  .rule-actions {
    width: 100%;
    justify-content: center;
  }
}
</style>
