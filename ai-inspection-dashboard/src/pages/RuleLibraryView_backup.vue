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

            <!-- 规则列表 - 表格式展示 -->
            <div v-loading="loading.nlp">
              <!-- 规则分类标签 -->
              <div class="rule-categories">
                <el-tabs v-model="activeRuleCategory" @tab-click="handleCategoryChange">
                  <el-tab-pane label="全部规则" name="all">
                    <template #label>
                      <span class="category-label">
                        <el-icon><List /></el-icon>
                        全部规则 ({{ nlpRules.length }})
                      </span>
                    </template>
                  </el-tab-pane>
                  <el-tab-pane label="基础查询" name="basic">
                    <template #label>
                      <span class="category-label">
                        <el-icon><Search /></el-icon>
                        基础查询 ({{ getBasicRules().length }})
                      </span>
                    </template>
                  </el-tab-pane>
                  <el-tab-pane label="统计分析" name="analysis">
                    <template #label>
                      <span class="category-label">
                        <el-icon><DataAnalysis /></el-icon>
                        统计分析 ({{ getAnalysisRules().length }})
                      </span>
                    </template>
                  </el-tab-pane>
                  <el-tab-pane label="复杂查询" name="complex">
                    <template #label>
                      <span class="category-label">
                        <el-icon><Operation /></el-icon>
                        复杂查询 ({{ getComplexRules().length }})
                      </span>
                    </template>
                  </el-tab-pane>
                </el-tabs>
              </div>

              <!-- 规则表格 -->
              <el-table
                :data="getCurrentCategoryRules().slice((currentPageNlp - 1) * pageSize, currentPageNlp * pageSize)"
                style="width: 100%"
                :row-class-name="getRowClassName"
                @row-click="handleRowClick"
              >
                <el-table-column label="规则信息" min-width="200">
                  <template #default="{ row }">
                    <div class="rule-info">
                      <el-tag :type="getRuleComplexityType(row)" size="small" class="complexity-tag">
                        {{ getRuleComplexityLabel(row) }}
                      </el-tag>
                      <span class="rule-name">{{ row.intent_name }}</span>
                    </div>
                  </template>
                </el-table-column>
                
                <el-table-column label="描述" prop="description" min-width="250" show-overflow-tooltip />
                
                <el-table-column label="参数" width="120" align="center">
                  <template #default="{ row }">
                    <el-tag v-if="hasParameters(row)" type="info" size="small">
                      {{ getParameterCount(row) }} 个参数
                    </el-tag>
                    <span v-else class="no-params">无参数</span>
                  </template>
                </el-table-column>
                
                <el-table-column label="状态" width="100" align="center">
                  <template #default="{ row }">
                    <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
                      {{ row.status === 'active' ? '活跃' : '禁用' }}
                    </el-tag>
                  </template>
                </el-table-column>
                
                <el-table-column label="优先级" width="80" align="center">
                  <template #default="{ row }">
                    <el-tag type="warning" size="small">{{ row.priority }}</el-tag>
                  </template>
                </el-table-column>
                
                <el-table-column label="测试状态" width="120" align="center">
                  <template #default="{ row }">
                    <div class="test-status">
                      <el-icon 
                        :class="['status-icon', row.testResult?.success ? 'success' : 'error']"
                      >
                        <CircleCheck v-if="row.testResult?.success" />
                        <CircleClose v-else />
                      </el-icon>
                      <span class="status-text">
                        {{ getTestStatusText(row) }}
                      </span>
                    </div>
                  </template>
                </el-table-column>
                
                <el-table-column label="操作" width="200" align="center">
                  <template #default="{ row }">
                    <div class="action-buttons">
                      <el-button size="small" @click.stop="testSingleRule(row)" :loading="row.testing">
                        <el-icon><Operation /></el-icon>
                        测试
                      </el-button>
                      <el-button size="small" type="primary" @click.stop="editRule(row)">
                        <el-icon><Edit /></el-icon>
                        编辑
                      </el-button>
                      <el-button size="small" @click.stop="viewRuleDetails(row)">
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
                  :total="getCurrentCategoryRules().length"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                />
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>
