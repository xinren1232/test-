<template>
  <div class="anomaly-detection">
    <div class="detection-header">
      <h3>异常检测与预警</h3>
      <div class="header-actions">
        <el-button type="primary" size="small" @click="runDetection" :loading="isDetecting">
          <el-icon><el-icon-warning /></el-icon> 运行检测
        </el-button>
        <el-button size="small" @click="showConfig = !showConfig">
          <el-icon><el-icon-setting /></el-icon> 配置
        </el-button>
        <el-button size="small" @click="exportResults" :disabled="!hasResults">
          <el-icon><el-icon-download /></el-icon> 导出
        </el-button>
      </div>
    </div>
    
    <!-- 配置面板 -->
    <div v-if="showConfig" class="config-panel">
      <el-form :model="detectionConfig" label-position="top" size="small">
        <el-form-item label="检测类型">
          <el-radio-group v-model="detectionConfig.type">
            <el-radio-button label="statistical">统计异常</el-radio-button>
            <el-radio-button label="pattern">模式异常</el-radio-button>
            <el-radio-button label="contextual">上下文异常</el-radio-button>
            <el-radio-button label="collective">集体异常</el-radio-button>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="检测算法">
          <el-select v-model="detectionConfig.algorithm" style="width: 100%;">
            <el-option label="Z-Score (基于统计)" value="zscore" />
            <el-option label="IQR (四分位距)" value="iqr" />
            <el-option label="隔离森林" value="isolation_forest" />
            <el-option label="单类SVM" value="one_class_svm" />
            <el-option label="自编码器 (深度学习)" value="autoencoder" />
            <el-option label="LSTM-自编码器" value="lstm_autoencoder" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="敏感度">
          <el-slider 
            v-model="detectionConfig.sensitivity" 
            :min="1" 
            :max="10" 
            :format-tooltip="value => `${value}`"
          />
        </el-form-item>
        
        <el-form-item label="数据源">
          <el-checkbox-group v-model="detectionConfig.dataSources">
            <el-checkbox label="iqc">来料检验</el-checkbox>
            <el-checkbox label="lab">实验室测试</el-checkbox>
            <el-checkbox label="online">产线检测</el-checkbox>
            <el-checkbox label="supplier">供应商数据</el-checkbox>
            <el-checkbox label="equipment">设备数据</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="detectionConfig.timeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY/MM/DD"
            value-format="YYYY-MM-DD"
            style="width: 100%;"
          />
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 检测结果 -->
    <div v-if="hasResults" class="detection-results">
      <div class="results-summary">
        <el-alert
          :title="resultsSummary.title"
          :type="resultsSummary.type"
          :description="resultsSummary.description"
          show-icon
          :closable="false"
        />
      </div>
      
      <div class="chart-container" ref="anomalyChartContainer"></div>
      
      <div class="anomaly-list">
        <h4>检测到的异常</h4>
        <el-table :data="anomalies" style="width: 100%" :max-height="250" border>
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="type" label="异常类型" width="120">
            <template #default="scope">
              <el-tag 
                :type="getAnomalyTypeColor(scope.row.type)" 
                effect="dark"
              >
                {{ getAnomalyTypeLabel(scope.row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="severity" label="严重程度" width="100">
            <template #default="scope">
              <el-progress 
                :percentage="scope.row.severityScore" 
                :status="scope.row.severityScore > 80 ? 'exception' : scope.row.severityScore > 50 ? 'warning' : 'success'"
              />
            </template>
          </el-table-column>
          <el-table-column prop="confidence" label="置信度" width="100">
            <template #default="scope">
              {{ scope.row.confidence }}%
            </template>
          </el-table-column>
          <el-table-column prop="description" label="异常描述" />
          <el-table-column prop="action" label="建议操作" width="120">
            <template #default="scope">
              <el-button size="small" type="primary" @click="showActionDetail(scope.row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    
    <!-- 无结果或正在检测状态 -->
    <div v-if="!hasResults && !isDetecting" class="no-results">
      <el-empty description="请配置并运行异常检测">
        <el-button type="primary" @click="runDetection">开始检测</el-button>
      </el-empty>
    </div>
    
    <div v-if="isDetecting" class="detection-loading">
      <el-progress type="circle" :percentage="detectionProgress" />
      <div class="loading-text">
        <h3>AI异常检测中</h3>
        <p>{{ detectionStage }}</p>
      </div>
    </div>
    
    <!-- 操作详情对话框 -->
    <el-dialog
      v-model="actionDialogVisible"
      title="异常处理建议"
      width="50%"
      destroy-on-close
    >
      <div v-if="selectedAnomaly" class="action-detail">
        <h4>异常信息</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="日期">{{ selectedAnomaly.date }}</el-descriptions-item>
          <el-descriptions-item label="异常类型">{{ getAnomalyTypeLabel(selectedAnomaly.type) }}</el-descriptions-item>
          <el-descriptions-item label="严重程度">{{ selectedAnomaly.severity }}</el-descriptions-item>
          <el-descriptions-item label="置信度">{{ selectedAnomaly.confidence }}%</el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ selectedAnomaly.description }}</el-descriptions-item>
        </el-descriptions>
        
        <h4>建议操作</h4>
        <div class="action-steps">
          <el-steps :active="1" direction="vertical" finish-status="success">
            <el-step 
              v-for="(step, index) in selectedAnomaly.actionSteps" 
              :key="index" 
              :title="step.title" 
              :description="step.description" 
            />
          </el-steps>
        </div>
        
        <h4>潜在影响</h4>
        <el-card class="impact-card">
          <template #header>
            <div class="impact-header">
              <span>影响评估</span>
              <el-rate
                v-model="selectedAnomaly.impactScore"
                disabled
                show-score
                text-color="#ff9900"
                score-template="{value}"
              />
            </div>
          </template>
          <p>{{ selectedAnomaly.impactDescription }}</p>
        </el-card>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="actionDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="createTask">创建任务</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import { detectAnomalies, getAnomalyDetails } from '../../services/aiConnectorService';

// 组件状态
const showConfig = ref(false);
const isDetecting = ref(false);
const hasResults = ref(false);
const detectionProgress = ref(0);
const detectionStage = ref('');
const anomalyChartRef = ref(null);
let anomalyChart = null;

// 异常检测配置
const detectionConfig = reactive({
  type: 'statistical',
  algorithm: 'zscore',
  sensitivity: 5,
  dataSources: ['iqc', 'lab', 'online'],
  timeRange: [
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    new Date().toISOString().split('T')[0]
  ]
});

// 检测结果
const resultsSummary = reactive({
  title: '',
  type: 'info',
  description: ''
});

// 异常列表
const anomalies = ref([]);

// 操作详情对话框
const actionDialogVisible = ref(false);
const selectedAnomaly = ref(null);

// 初始化
onMounted(() => {
  nextTick(() => {
    initChart();
  });
});

// 初始化图表
function initChart() {
  const chartContainer = document.querySelector('.chart-container');
  if (!chartContainer) return;
  
  anomalyChart = echarts.init(chartContainer);
  window.addEventListener('resize', () => {
    anomalyChart && anomalyChart.resize();
  });
}

// 运行异常检测
async function runDetection() {
  isDetecting.value = true;
  detectionProgress.value = 0;
  
  try {
    // 模拟检测过程
    await updateDetectionProgress('正在收集数据...', 10);
    await updateDetectionProgress('预处理数据...', 20);
    await updateDetectionProgress('应用异常检测算法...', 40);
    await updateDetectionProgress('分析异常模式...', 60);
    await updateDetectionProgress('生成异常报告...', 80);
    
    // 获取检测结果
    const results = await detectAnomalies({
      type: detectionConfig.type,
      algorithm: detectionConfig.algorithm,
      sensitivity: detectionConfig.sensitivity,
      dataSources: detectionConfig.dataSources,
      startDate: detectionConfig.timeRange[0],
      endDate: detectionConfig.timeRange[1]
    });
    
    // 更新结果
    updateResults(results);
    
    await updateDetectionProgress('完成', 100);
    hasResults.value = true;
  } catch (error) {
    ElMessage.error('异常检测失败: ' + error.message);
  } finally {
    isDetecting.value = false;
  }
}

// 更新检测进度
async function updateDetectionProgress(stage, progress) {
  return new Promise(resolve => {
    setTimeout(() => {
      detectionStage.value = stage;
      detectionProgress.value = progress;
      resolve();
    }, 500);
  });
}

// 更新结果
function updateResults(results) {
  // 更新结果摘要
  resultsSummary.title = `检测到 ${results.anomalies.length} 个异常`;
  resultsSummary.type = results.anomalies.length > 0 ? 
    (results.criticalCount > 0 ? 'error' : 'warning') : 
    'success';
  resultsSummary.description = results.summary;
  
  // 更新异常列表
  anomalies.value = results.anomalies;
  
  // 更新图表
  renderAnomalyChart(results);
}

// 渲染异常图表
function renderAnomalyChart(results) {
  if (!anomalyChart) return;
  
  const option = {
    title: {
      text: '异常检测结果可视化',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        const dataIndex = params[0].dataIndex;
        const date = results.timeline[dataIndex];
        const value = params[0].value;
        const isAnomaly = results.anomalyIndices.includes(dataIndex);
        
        let html = `<div><b>${date}</b></div>`;
        html += `<div>数值: ${value}</div>`;
        if (isAnomaly) {
          const anomaly = results.anomalies.find(a => a.date === date);
          html += `<div style="color: #F56C6C"><b>异常: ${anomaly.description}</b></div>`;
        }
        return html;
      }
    },
    xAxis: {
      type: 'category',
      data: results.timeline,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '测量值',
      nameLocation: 'middle',
      nameGap: 40
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        start: 0,
        end: 100
      }
    ],
    series: [
      {
        name: '测量值',
        type: 'line',
        data: results.values,
        markPoint: {
          symbolSize: 40,
          data: results.anomalyIndices.map(index => ({
            name: '异常点',
            value: '异常',
            xAxis: index,
            yAxis: results.values[index],
            itemStyle: {
              color: '#F56C6C'
            }
          }))
        },
        markArea: {
          itemStyle: {
            color: 'rgba(255, 173, 177, 0.4)'
          },
          data: results.anomalyRanges.map(range => [
            {
              name: '异常区间',
              xAxis: range[0]
            },
            {
              xAxis: range[1]
            }
          ])
        }
      }
    ]
  };
  
  anomalyChart.setOption(option);
}

// 显示操作详情
async function showActionDetail(anomaly) {
  try {
    const details = await getAnomalyDetails(anomaly.id);
    selectedAnomaly.value = {
      ...anomaly,
      ...details
    };
    actionDialogVisible.value = true;
  } catch (error) {
    ElMessage.error('获取异常详情失败: ' + error.message);
  }
}

// 创建任务
function createTask() {
  if (!selectedAnomaly.value) return;
  
  ElMessage.success('已创建异常处理任务');
  actionDialogVisible.value = false;
}

// 导出结果
function exportResults() {
  ElMessage.success('异常检测报告已导出');
}

// 获取异常类型颜色
function getAnomalyTypeColor(type) {
  switch (type) {
    case 'critical': return 'danger';
    case 'major': return 'warning';
    case 'minor': return 'info';
    default: return 'info';
  }
}

// 获取异常类型标签
function getAnomalyTypeLabel(type) {
  switch (type) {
    case 'critical': return '严重异常';
    case 'major': return '主要异常';
    case 'minor': return '轻微异常';
    case 'pattern': return '模式异常';
    case 'contextual': return '上下文异常';
    case 'collective': return '集体异常';
    default: return '未知类型';
  }
}
</script>

<style scoped>
.anomaly-detection {
  padding: 15px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.detection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.detection-header h3 {
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.config-panel {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid #e4e7ed;
}

.detection-results {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow: hidden;
}

.results-summary {
  margin-bottom: 10px;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.anomaly-list {
  flex: 1;
  overflow: auto;
}

.anomaly-list h4 {
  margin-top: 0;
  margin-bottom: 10px;
}

.no-results {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.detection-loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.loading-text {
  text-align: center;
}

.loading-text h3 {
  margin: 0;
  margin-bottom: 5px;
}

.loading-text p {
  margin: 0;
  color: #606266;
}

.action-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.action-detail h4 {
  margin: 0;
  margin-bottom: 10px;
}

.action-steps {
  margin: 15px 0;
}

.impact-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.impact-card {
  margin-top: 10px;
}
</style> 