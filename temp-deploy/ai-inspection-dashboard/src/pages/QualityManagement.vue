<template>
  <div class="quality-management">
    <h2 class="page-title">质量管理</h2>
    
    <!-- 质量概览卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card primary">
          <div class="card-header">
            <h3>质量合格率</h3>
            <el-icon><DataLine /></el-icon>
          </div>
          <div class="card-value">98.3%</div>
          <div class="card-footer">
            <span class="trend up">↑ 1.2%</span>
            <span class="period">本周</span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card success">
          <div class="card-header">
            <h3>一次通过率</h3>
            <el-icon><PieChart /></el-icon>
          </div>
          <div class="card-value">94.7%</div>
          <div class="card-footer">
            <span class="trend up">↑ 0.8%</span>
            <span class="period">本周</span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card warning">
          <div class="card-header">
            <h3>不合格品数</h3>
            <el-icon><Warning /></el-icon>
          </div>
          <div class="card-value">37</div>
          <div class="card-footer">
            <span class="trend down">↓ 5</span>
            <span class="period">本周</span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card info">
          <div class="card-header">
            <h3>质量检测总数</h3>
            <el-icon><Files /></el-icon>
          </div>
          <div class="card-value">1,256</div>
          <div class="card-footer">
            <span class="trend up">↑ 128</span>
            <span class="period">本周</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 在质量概览卡片和趋势图之间添加产线异常监控模块 -->
    <el-row :gutter="20" class="production-monitor">
      <el-col :span="24">
        <el-card shadow="hover" class="monitor-card">
          <template #header>
            <div class="card-header">
              <h3>产线实时监控</h3>
              <div class="header-actions">
                <el-select v-model="selectedLine" placeholder="选择产线" size="small" style="width: 150px; margin-right: 10px;">
                  <el-option v-for="line in productionLines" :key="line.id" :label="line.name" :value="line.id"></el-option>
                </el-select>
                <el-button type="primary" size="small" @click="refreshProductionData">刷新</el-button>
              </div>
            </div>
          </template>
          
          <div class="production-status">
            <div class="status-indicator" :class="{'status-normal': productionStatus === 'normal', 'status-warning': productionStatus === 'warning', 'status-danger': productionStatus === 'danger'}">
              <i class="el-icon-video-play"></i>
              <span>{{ getProductionStatusText() }}</span>
            </div>
            
            <div class="production-metrics">
              <div class="metric-item">
                <div class="metric-label">生产节拍</div>
                <div class="metric-value">{{ productionMetrics.cycleTime }}s</div>
              </div>
              <div class="metric-item">
                <div class="metric-label">当前产能</div>
                <div class="metric-value">{{ productionMetrics.output }}件/小时</div>
              </div>
              <div class="metric-item">
                <div class="metric-label">不良率</div>
                <div class="metric-value" :class="{'text-danger': productionMetrics.defectRate > 5}">
                  {{ productionMetrics.defectRate }}%
                </div>
              </div>
              <div class="metric-item">
                <div class="metric-label">运行时间</div>
                <div class="metric-value">{{ productionMetrics.uptime }}小时</div>
              </div>
            </div>
          </div>
          
          <!-- 产线异常预警列表 -->
          <div v-if="productionAlerts.length > 0" class="production-alerts">
            <h4>产线异常预警 ({{ productionAlerts.length }})</h4>
            <el-table :data="productionAlerts" style="width: 100%" size="small">
              <el-table-column prop="time" label="时间" width="160"></el-table-column>
              <el-table-column prop="type" label="异常类型" width="120">
                <template #default="scope">
                  <el-tag :type="getAlertTypeTag(scope.row.type)">{{ scope.row.type }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="station" label="工位" width="100"></el-table-column>
              <el-table-column prop="material" label="涉及物料" width="120"></el-table-column>
              <el-table-column prop="description" label="异常描述"></el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <el-button link size="small" @click="handleAlert(scope.row)">处理</el-button>
                  <el-button link size="small" @click="viewAlertDetail(scope.row)">详情</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 质量趋势图 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>质量趋势分析</h3>
              <el-radio-group v-model="trendTimeRange" size="small">
                <el-radio-button value="week">本周</el-radio-button>
                <el-radio-button value="month">本月</el-radio-button>
                <el-radio-button value="quarter">本季度</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container" id="qualityTrendChart">
            <!-- 图表将在mounted时初始化 -->
            <div style="height: 400px; display: flex; justify-content: center; align-items: center;">
              <p>加载质量趋势数据...</p>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>不合格类型分布</h3>
            </div>
          </template>
          <div class="chart-container" id="defectTypeChart">
            <!-- 图表将在mounted时初始化 -->
            <div style="height: 400px; display: flex; justify-content: center; align-items: center;">
              <p>加载不合格类型数据...</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 质量问题清单 -->
    <el-card shadow="hover" class="table-card">
      <template #header>
        <div class="card-header between">
          <h3>质量问题清单</h3>
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索问题"
              prefix-icon="el-icon-search"
              size="small"
              style="width: 200px; margin-right: 15px;"
            ></el-input>
            <el-button type="primary" size="small" @click="exportData">
              导出数据
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table :data="filteredIssues" style="width: 100%" border stripe>
        <el-table-column prop="id" label="问题ID" width="100"></el-table-column>
        <el-table-column prop="date" label="发现日期" width="120"></el-table-column>
        <el-table-column prop="type" label="问题类型" width="120">
          <template #default="scope">
            <el-tag :type="getIssueTypeTag(scope.row.type)">{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="material" label="涉及物料" width="120"></el-table-column>
        <el-table-column prop="description" label="问题描述" min-width="250"></el-table-column>
        <el-table-column prop="status" label="解决状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="responsible" label="责任人" width="100"></el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button link size="small" @click="viewIssueDetail(scope.row)">详情</el-button>
            <el-button link size="small" @click="editIssue(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalIssues"
          :page-size="pageSize"
          :current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-card>
    
    <!-- 在质量问题清单下方添加根因分析模块 -->
    <el-row :gutter="20" class="root-cause-section">
      <el-col :span="12">
        <el-card shadow="hover" class="analysis-card">
          <template #header>
            <div class="card-header between">
              <h3>质量问题根因分析</h3>
              <el-button type="primary" size="small" @click="generateRootCauseAnalysis" :disabled="!currentIssue">
                生成分析
              </el-button>
            </div>
          </template>
          
          <div v-if="!currentIssue" class="empty-analysis">
            <el-empty description="请先从质量问题清单中选择一个问题"></el-empty>
          </div>
          
          <div v-else class="root-cause-analysis">
            <div class="analysis-header">
              <h4>{{ currentIssue.id }} - {{ currentIssue.type }}</h4>
              <p>{{ currentIssue.description }}</p>
            </div>
            
            <!-- 根因分析图 -->
            <div class="cause-effect-diagram" id="causeEffectChart" style="height: 300px;">
              <!-- 图表将在分析后显示 -->
            </div>
            
            <div v-if="rootCauseAnalysis" class="analysis-results">
              <h4>分析结果</h4>
              <div class="cause-categories">
                <div v-for="(category, idx) in rootCauseAnalysis.categories" :key="idx" class="cause-category">
                  <h5>{{ category.name }}</h5>
                  <ul>
                    <li v-for="(cause, cidx) in category.causes" :key="cidx">
                      {{ cause.name }} 
                      <el-tag size="small" :type="cause.probability > 70 ? 'danger' : cause.probability > 40 ? 'warning' : 'info'">
                        {{ cause.probability }}%
                      </el-tag>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div class="primary-cause">
                <h5>主要根因</h5>
                <p>{{ rootCauseAnalysis.primaryCause }}</p>
              </div>
              
              <div class="recommended-actions">
                <h5>建议措施</h5>
                <ol>
                  <li v-for="(action, idx) in rootCauseAnalysis.actions" :key="idx">
                    {{ action }}
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card shadow="hover" class="material-analysis-card">
          <template #header>
            <div class="card-header between">
              <h3>物料质量分析</h3>
              <el-input
                v-model="materialSearchInput"
                placeholder="输入物料编码"
                size="small"
                style="width: 200px;"
                @keyup.enter="searchMaterial"
              >
                <template #append>
                  <el-button @click="searchMaterial">
                    <el-icon><search /></el-icon>
                  </el-button>
                </template>
              </el-input>
            </div>
          </template>
          
          <div v-if="!selectedMaterial" class="empty-analysis">
            <el-empty description="请输入物料编码进行查询"></el-empty>
          </div>
          
          <div v-else class="material-analysis">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="物料编码">{{ selectedMaterial.code }}</el-descriptions-item>
              <el-descriptions-item label="物料名称">{{ selectedMaterial.name }}</el-descriptions-item>
              <el-descriptions-item label="供应商">{{ selectedMaterial.supplier }}</el-descriptions-item>
              <el-descriptions-item label="最近批次">{{ selectedMaterial.latestBatch }}</el-descriptions-item>
            </el-descriptions>
            
            <div class="quality-metrics">
              <h4>质量指标</h4>
              <div class="metrics-grid">
                <div class="metric-box" :class="getMetricClass(selectedMaterial.metrics.defectRate)">
                  <div class="metric-value">{{ selectedMaterial.metrics.defectRate }}%</div>
                  <div class="metric-name">不良率</div>
                </div>
                <div class="metric-box" :class="getMetricClass(100 - selectedMaterial.metrics.stabilityScore, true)">
                  <div class="metric-value">{{ selectedMaterial.metrics.stabilityScore }}</div>
                  <div class="metric-name">稳定性评分</div>
                </div>
                <div class="metric-box" :class="getMetricClass(selectedMaterial.metrics.riskLevel * 20)">
                  <div class="metric-value">{{ getRiskLevelText(selectedMaterial.metrics.riskLevel) }}</div>
                  <div class="metric-name">风险等级</div>
                </div>
                <div class="metric-box" :class="getMetricClass(100 - selectedMaterial.metrics.qualityScore, true)">
                  <div class="metric-value">{{ selectedMaterial.metrics.qualityScore }}</div>
                  <div class="metric-name">质量评分</div>
                </div>
              </div>
            </div>
            
            <div class="material-issues">
              <h4>相关质量问题</h4>
              <el-table :data="selectedMaterial.issues" style="width: 100%" size="small">
                <el-table-column prop="date" label="日期" width="100"></el-table-column>
                <el-table-column prop="type" label="问题类型" width="120"></el-table-column>
                <el-table-column prop="description" label="描述"></el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag :type="getStatusTag(scope.row.status)">{{ scope.row.status }}</el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 问题详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="currentIssue ? `质量问题详情: ${currentIssue.id}` : '质量问题详情'"
      width="70%"
    >
      <div v-if="currentIssue" class="issue-details">
        <el-descriptions border :column="2">
          <el-descriptions-item label="问题ID">{{ currentIssue.id }}</el-descriptions-item>
          <el-descriptions-item label="发现日期">{{ currentIssue.date }}</el-descriptions-item>
          <el-descriptions-item label="问题类型">
            <el-tag :type="getIssueTypeTag(currentIssue.type)">{{ currentIssue.type }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="涉及物料">{{ currentIssue.material }}</el-descriptions-item>
          <el-descriptions-item label="解决状态">
            <el-tag :type="getStatusTag(currentIssue.status)">{{ currentIssue.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="责任人">{{ currentIssue.responsible }}</el-descriptions-item>
          <el-descriptions-item :span="2" label="问题描述">
            {{ currentIssue.description }}
          </el-descriptions-item>
          <el-descriptions-item :span="2" label="解决措施">
            {{ currentIssue.solution || '暂无解决措施' }}
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="action-buttons">
          <el-button type="primary" @click="dialogVisible = false">关闭</el-button>
          <el-button type="success" @click="editIssue(currentIssue)">编辑</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue';
import * as echarts from 'echarts';
import { DataLine, PieChart, Warning, Files } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

export default {
  name: 'QualityManagement',
  components: {
    DataLine,
    PieChart,
    Warning,
    Files
  },
  
  setup() {
    // 图表实例
    let trendChart = null;
    let defectChart = null;
    
    // 时间范围选择
    const trendTimeRange = ref('week');
    
    // 搜索
    const searchKeyword = ref('');
    
    // 分页
    const pageSize = ref(10);
    const currentPage = ref(1);
    
    // 对话框
    const dialogVisible = ref(false);
    const currentIssue = ref(null);
    
    // 模拟数据
    const qualityIssues = [
      { id: 'QI-2023-001', date: '2023-04-10', type: '尺寸偏差', material: 'M2023-001', description: '产品尺寸超出公差范围', status: '已解决', responsible: '张工' },
      { id: 'QI-2023-002', date: '2023-04-12', type: '外观缺陷', material: 'M2023-005', description: '表面存在明显划痕', status: '处理中', responsible: '李工' },
      { id: 'QI-2023-003', date: '2023-04-15', type: '性能异常', material: 'M2023-002', description: '耐压测试未达标', status: '待处理', responsible: '王工' },
      { id: 'QI-2023-004', date: '2023-04-18', type: '材料问题', material: 'M2023-008', description: '原材料硬度不达标', status: '已解决', responsible: '赵工' },
      { id: 'QI-2023-005', date: '2023-04-20', type: '外观缺陷', material: 'M2023-003', description: '产品表面有气泡', status: '处理中', responsible: '钱工' },
      { id: 'QI-2023-006', date: '2023-04-22', type: '尺寸偏差', material: 'M2023-001', description: '孔位偏差超过允许范围', status: '已解决', responsible: '张工' },
      { id: 'QI-2023-007', date: '2023-04-25', type: '装配问题', material: 'M2023-004', description: '组件无法正常装配', status: '待处理', responsible: '孙工' },
      { id: 'QI-2023-008', date: '2023-04-28', type: '性能异常', material: 'M2023-006', description: '测试过程中出现漏电', status: '已解决', responsible: '周工' },
      { id: 'QI-2023-009', date: '2023-05-02', type: '材料问题', material: 'M2023-007', description: '材料强度不符合规格', status: '处理中', responsible: '吴工' },
      { id: 'QI-2023-010', date: '2023-05-05', type: '外观缺陷', material: 'M2023-009', description: '产品表面有明显色差', status: '待处理', responsible: '郑工' },
      { id: 'QI-2023-011', date: '2023-05-08', type: '尺寸偏差', material: 'M2023-001', description: '产品高度超出规格', status: '已解决', responsible: '张工' },
      { id: 'QI-2023-012', date: '2023-05-10', type: '装配问题', material: 'M2023-004', description: '零件间隙过大', status: '处理中', responsible: '孙工' }
    ];
    
    // 过滤后的问题列表
    const filteredIssues = computed(() => {
      let result = qualityIssues;
      
      // 应用搜索过滤
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase();
        result = result.filter(item => 
          item.id.toLowerCase().includes(keyword) ||
          item.description.toLowerCase().includes(keyword) ||
          item.material.toLowerCase().includes(keyword) ||
          item.type.toLowerCase().includes(keyword)
        );
      }
      
      // 分页
      const startIndex = (currentPage.value - 1) * pageSize.value;
      return result.slice(startIndex, startIndex + pageSize.value);
    });
    
    // 总问题数量
    const totalIssues = computed(() => {
      return qualityIssues.length;
    });
    
    // 查看问题详情
    function viewIssueDetail(issue) {
      currentIssue.value = issue;
      dialogVisible.value = true;
    }
    
    // 编辑问题
    function editIssue(issue) {
      // 实现编辑功能，可能打开编辑表单或页面
      console.log('编辑问题:', issue);
      // TODO: 打开编辑表单或导航到编辑页面
    }
    
    // 导出数据
    function exportData() {
      console.log('导出数据');
      // TODO: 实现导出功能
    }
    
    // 处理每页显示数量变化
    function handleSizeChange(val) {
      pageSize.value = val;
      currentPage.value = 1; // 重置到第一页
    }
    
    // 处理页码变化
    function handleCurrentChange(val) {
      currentPage.value = val;
    }
    
    // 获取问题类型对应的标签类型
    function getIssueTypeTag(type) {
      const typeMap = {
        '尺寸偏差': 'warning',
        '外观缺陷': 'info',
        '性能异常': 'danger',
        '材料问题': 'warning',
        '装配问题': 'info'
      };
      return typeMap[type] || 'info';
    }
    
    // 获取状态对应的标签类型
    function getStatusTag(status) {
      const statusMap = {
        '已解决': 'success',
        '处理中': 'warning',
        '待处理': 'info'
      };
      return statusMap[status] || 'info';
    }
    
    // 初始化图表
    function initCharts() {
      // 初始化质量趋势图表
      const trendChartDom = document.getElementById('qualityTrendChart');
      if (trendChartDom) {
        trendChart = echarts.init(trendChartDom);
        const trendOption = {
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: ['合格率', '一次通过率', '不合格品数'],
            bottom: 0
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '10%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
          },
          yAxis: [
            {
              type: 'value',
              name: '百分比',
              min: 80,
              max: 100,
              axisLabel: {
                formatter: '{value}%'
              }
            },
            {
              type: 'value',
              name: '数量',
              min: 0,
              max: 20,
              axisLabel: {
                formatter: '{value}'
              }
            }
          ],
          series: [
            {
              name: '合格率',
              type: 'line',
              data: [97.2, 96.8, 98.5, 97.9, 98.3, 98.6, 98.9],
              yAxisIndex: 0
            },
            {
              name: '一次通过率',
              type: 'line',
              data: [92.5, 93.7, 94.2, 95.1, 94.8, 94.7, 95.3],
              yAxisIndex: 0
            },
            {
              name: '不合格品数',
              type: 'bar',
              yAxisIndex: 1,
              data: [8, 9, 5, 6, 5, 4, 3]
            }
          ]
        };
        trendChart.setOption(trendOption);
      }
      
      // 初始化不合格类型图表
      const defectChartDom = document.getElementById('defectTypeChart');
      if (defectChartDom) {
        defectChart = echarts.init(defectChartDom);
        const defectOption = {
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            left: 10,
            data: ['尺寸偏差', '外观缺陷', '性能异常', '材料问题', '装配问题']
          },
          series: [
            {
              name: '不合格类型',
              type: 'pie',
              radius: ['50%', '70%'],
              avoidLabelOverlap: false,
              label: {
                show: false,
                position: 'center'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: '16',
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: false
              },
              data: [
                { value: 12, name: '尺寸偏差' },
                { value: 8, name: '外观缺陷' },
                { value: 7, name: '性能异常' },
                { value: 5, name: '材料问题' },
                { value: 5, name: '装配问题' }
              ]
            }
          ]
        };
        defectChart.setOption(defectOption);
      }
    }
    
    // 监听窗口大小变化，重新调整图表大小
    function handleResize() {
      trendChart && trendChart.resize();
      defectChart && defectChart.resize();
    }
    
    // 产线监控相关数据
    const productionLines = [
      { id: 'line1', name: '总装线-1' },
      { id: 'line2', name: '总装线-2' },
      { id: 'line3', name: '电子组装线' },
      { id: 'line4', name: '注塑成型线' }
    ];
    const selectedLine = ref('line1');
    const productionStatus = ref('normal'); // normal, warning, danger
    const productionMetrics = reactive({
      cycleTime: 45,
      output: 80,
      defectRate: 2.5,
      uptime: 6.5
    });

    // 产线异常预警
    const productionAlerts = ref([
      {
        id: 'ALT-2023-001',
        time: '2023-05-10 09:15:22',
        type: '参数超限',
        station: '注塑站',
        material: 'M2023-005',
        description: '注塑温度超出上限10°C，可能导致产品变形',
        status: 'unhandled'
      },
      {
        id: 'ALT-2023-002',
        time: '2023-05-10 10:22:45',
        type: '物料异常',
        station: '装配站',
        material: 'M2023-012',
        description: '物料硬度不足，导致装配困难',
        status: 'unhandled'
      },
      {
        id: 'ALT-2023-003',
        time: '2023-05-10 11:05:17',
        type: '设备故障',
        station: '测试站',
        material: 'N/A',
        description: '测试设备校准偏差，可能导致误判',
        status: 'unhandled'
      }
    ]);

    // 物料分析相关
    const materialSearchInput = ref('');
    const selectedMaterial = ref(null);

    // 根因分析相关
    const rootCauseAnalysis = ref(null);

    // 获取产线状态文本
    function getProductionStatusText() {
      switch (productionStatus.value) {
        case 'normal':
          return '正常生产中';
        case 'warning':
          return '产线异常 - 需关注';
        case 'danger':
          return '产线严重异常 - 需立即处理';
        default:
          return '状态未知';
      }
    }

    // 获取告警类型标签样式
    function getAlertTypeTag(type) {
      switch (type) {
        case '参数超限':
          return 'warning';
        case '物料异常':
          return 'danger';
        case '设备故障':
          return 'error';
        default:
          return 'info';
      }
    }

    // 处理告警
    function handleAlert(alert) {
      ElMessageBox.confirm(
        `确定要处理告警 "${alert.id}: ${alert.description}"?`,
        '处理告警',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 模拟处理告警
        const index = productionAlerts.value.findIndex(a => a.id === alert.id);
        if (index !== -1) {
          productionAlerts.value.splice(index, 1);
        }
        
        ElMessage({
          type: 'success',
          message: `告警 ${alert.id} 已标记为已处理`
        });
        
        // 更新产线状态
        updateProductionStatus();
      });
    }

    // 查看告警详情
    function viewAlertDetail(alert) {
      // 这里可以实现查看告警详情的逻辑
      ElMessage({
        type: 'info',
        message: `查看告警 ${alert.id} 的详细信息`
      });
    }

    // 刷新产线数据
    function refreshProductionData() {
      // 模拟数据刷新
      ElMessage({
        type: 'success',
        message: '产线数据已刷新'
      });
      
      // 随机更新一些指标
      productionMetrics.cycleTime = Math.round((40 + Math.random() * 10) * 10) / 10;
      productionMetrics.output = Math.round(70 + Math.random() * 20);
      productionMetrics.defectRate = Math.round((1 + Math.random() * 5) * 10) / 10;
      
      // 更新产线状态
      updateProductionStatus();
    }

    // 更新产线状态
    function updateProductionStatus() {
      if (productionMetrics.defectRate > 5 || productionAlerts.value.length > 3) {
        productionStatus.value = 'danger';
      } else if (productionMetrics.defectRate > 3 || productionAlerts.value.length > 0) {
        productionStatus.value = 'warning';
      } else {
        productionStatus.value = 'normal';
      }
    }

    // 搜索物料
    function searchMaterial() {
      if (!materialSearchInput.value) {
        ElMessage({
          type: 'warning',
          message: '请输入物料编码'
        });
        return;
      }
      
      // 模拟搜索
      ElMessage({
        type: 'success',
        message: `正在查询物料 ${materialSearchInput.value} 的信息`
      });
      
      // 模拟异步加载
      setTimeout(() => {
        // 模拟数据
        selectedMaterial.value = {
          code: materialSearchInput.value,
          name: `测试物料 ${materialSearchInput.value.substring(0, 4)}`,
          supplier: '供应商A',
          latestBatch: `BT${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}001`,
          metrics: {
            defectRate: Math.round(Math.random() * 8 * 10) / 10,
            stabilityScore: Math.round(70 + Math.random() * 25),
            riskLevel: Math.floor(Math.random() * 5) + 1,
            qualityScore: Math.round(70 + Math.random() * 25)
          },
          issues: [
            {
              date: '2023-05-08',
              type: '尺寸偏差',
              description: '产品尺寸超出公差范围',
              status: '已解决'
            },
            {
              date: '2023-05-05',
              type: '外观缺陷',
              description: '表面存在明显划痕',
              status: '处理中'
            }
          ]
        };
      }, 800);
    }

    // 获取指标样式类
    function getMetricClass(value, isScore = false) {
      if (isScore) {
        // 对于评分，值越高越好
        if (value >= 90) return 'metric-excellent';
        if (value >= 80) return 'metric-good';
        if (value >= 70) return 'metric-average';
        if (value >= 60) return 'metric-poor';
        return 'metric-bad';
      } else {
        // 对于不良率等，值越低越好
        if (value < 1) return 'metric-excellent';
        if (value < 3) return 'metric-good';
        if (value < 5) return 'metric-average';
        if (value < 8) return 'metric-poor';
        return 'metric-bad';
      }
    }

    // 获取风险等级文本
    function getRiskLevelText(level) {
      const levels = ['极低', '低', '中', '高', '极高'];
      return levels[level - 1] || '未知';
    }

    // 生成根因分析
    function generateRootCauseAnalysis() {
      if (!currentIssue.value) return;
      
      ElMessage({
        type: 'info',
        message: '正在生成根因分析...'
      });
      
      // 模拟异步分析过程
      setTimeout(() => {
        rootCauseAnalysis.value = {
          categories: [
            {
              name: '人员因素',
              causes: [
                { name: '操作失误', probability: 30 },
                { name: '培训不足', probability: 45 }
              ]
            },
            {
              name: '机器因素',
              causes: [
                { name: '设备校准不准', probability: 75 },
                { name: '设备磨损', probability: 60 }
              ]
            },
            {
              name: '物料因素',
              causes: [
                { name: '原料质量波动', probability: 85 },
                { name: '供应商变更', probability: 50 }
              ]
            },
            {
              name: '方法因素',
              causes: [
                { name: '工艺参数不合理', probability: 65 },
                { name: '检验标准不明确', probability: 40 }
              ]
            }
          ],
          primaryCause: '原料质量波动是导致此问题的主要原因，其次是设备校准不准确。',
          actions: [
            '与供应商沟通，确认原料批次是否有变化，要求提供更稳定的原料',
            '重新校准生产设备，尤其是关键参数测量部分',
            '修订工艺参数，增加对原料波动的适应性',
            '加强操作人员培训，提高应对异常情况的能力'
          ]
        };
        
        // 初始化根因分析图
        initCauseEffectChart();
        
        ElMessage({
          type: 'success',
          message: '根因分析已完成'
        });
      }, 1500);
    }

    // 初始化根因分析图表
    function initCauseEffectChart() {
      if (!rootCauseAnalysis.value) return;
      
      const chartDom = document.getElementById('causeEffectChart');
      if (!chartDom) return;
      
      const myChart = echarts.init(chartDom);
      
      // 准备数据
      const categories = rootCauseAnalysis.value.categories.map(cat => cat.name);
      const data = [];
      
      rootCauseAnalysis.value.categories.forEach(category => {
        category.causes.forEach(cause => {
          data.push({
            name: cause.name,
            value: cause.probability,
            category: category.name
          });
        });
      });
      
      // 图表配置
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}%'
        },
        legend: {
          data: categories,
          bottom: 0
        },
        series: [
          {
            type: 'graph',
            layout: 'force',
            animation: true,
            draggable: true,
            data: [
              {
                name: currentIssue.value.type,
                symbolSize: 70,
                itemStyle: {
                  color: '#F56C6C'
                },
                fixed: true,
                x: chartDom.clientWidth / 2,
                y: chartDom.clientHeight / 2
              },
              ...data.map(item => ({
                name: item.name,
                value: item.value,
                symbolSize: item.value / 3 + 15,
                category: item.category,
                itemStyle: {
                  color: item.value > 70 ? '#F56C6C' : item.value > 40 ? '#E6A23C' : '#909399'
                }
              }))
            ],
            categories: categories.map(name => ({ name })),
            force: {
              repulsion: 200,
              layoutAnimation: true
            },
            edges: data.map(item => ({
              source: item.name,
              target: currentIssue.value.type,
              lineStyle: {
                width: item.value / 20 + 1,
                opacity: item.value / 100
              }
            })),
            label: {
              show: true,
              position: 'right',
              formatter: '{b}'
            },
            lineStyle: {
              color: 'source',
              curveness: 0.3
            },
            emphasis: {
              focus: 'adjacency',
              lineStyle: {
                width: 5
              }
            }
          }
        ]
      };
      
      option && myChart.setOption(option);
      
      // 监听窗口大小变化，调整图表大小
      window.addEventListener('resize', () => {
        myChart.resize();
      });
    }
    
    onMounted(() => {
      // 初始化图表
      initCharts();
      
      // 添加窗口调整监听
      window.addEventListener('resize', handleResize);
      
      // 更新产线状态
      updateProductionStatus();
    });
    
    return {
      trendTimeRange,
      searchKeyword,
      filteredIssues,
      totalIssues,
      pageSize,
      currentPage,
      dialogVisible,
      currentIssue,
      viewIssueDetail,
      editIssue,
      exportData,
      handleSizeChange,
      handleCurrentChange,
      getIssueTypeTag,
      getStatusTag,
      productionLines,
      selectedLine,
      productionStatus,
      productionMetrics,
      productionAlerts,
      materialSearchInput,
      selectedMaterial,
      rootCauseAnalysis,
      getProductionStatusText,
      getAlertTypeTag,
      handleAlert,
      viewAlertDetail,
      refreshProductionData,
      searchMaterial,
      getMetricClass,
      getRiskLevelText,
      generateRootCauseAnalysis,
      initCauseEffectChart
    };
  }
};
</script>

<style scoped>
.quality-management {
  padding: 20px;
}

.page-title {
  margin-bottom: 25px;
  font-weight: 600;
  font-size: 24px;
}

.stat-cards {
  margin-bottom: 24px;
}

.stat-card {
  height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.stat-card.primary {
  border-left: 4px solid #409EFF;
}

.stat-card.success {
  border-left: 4px solid #67C23A;
}

.stat-card.warning {
  border-left: 4px solid #E6A23C;
}

.stat-card.info {
  border-left: 4px solid #909399;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.card-value {
  font-size: 28px;
  font-weight: 600;
  margin: 10px 0;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.trend {
  font-weight: 500;
}

.trend.up {
  color: #67C23A;
}

.trend.down {
  color: #F56C6C;
}

.period {
  color: #909399;
}

.chart-row {
  margin-bottom: 24px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-container {
  height: 400px;
}

.card-header.between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: right;
}

.issue-details {
  padding: 20px 0;
}

.action-buttons {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.production-monitor {
  margin-bottom: 20px;
}

.monitor-card {
  margin-bottom: 20px;
}

.production-status {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.status-indicator {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: bold;
  margin-right: 20px;
}

.status-normal {
  background-color: #f0f9eb;
  color: #67c23a;
}

.status-warning {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.status-danger {
  background-color: #fef0f0;
  color: #f56c6c;
}

.status-indicator i {
  margin-right: 8px;
  font-size: 18px;
}

.production-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.metric-item {
  padding: 10px;
  border-radius: 4px;
  background-color: #f5f7fa;
  min-width: 120px;
}

.metric-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.metric-value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.text-danger {
  color: #f56c6c;
}

.production-alerts {
  margin-top: 20px;
}

.root-cause-section {
  margin-top: 20px;
}

.analysis-card, .material-analysis-card {
  height: 100%;
}

.empty-analysis {
  padding: 30px;
  text-align: center;
}

.analysis-header {
  margin-bottom: 15px;
}

.cause-effect-diagram {
  margin: 20px 0;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.analysis-results {
  margin-top: 20px;
}

.cause-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.cause-category {
  flex: 1;
  min-width: 200px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.cause-category h5 {
  margin-top: 0;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #dcdfe6;
}

.cause-category ul {
  padding-left: 20px;
  margin: 0;
}

.cause-category li {
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.primary-cause, .recommended-actions {
  margin-top: 15px;
  padding: 10px;
  background-color: #f0f9eb;
  border-radius: 4px;
}

.primary-cause h5, .recommended-actions h5 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #67c23a;
}

.recommended-actions ol {
  padding-left: 20px;
  margin: 0;
}

.recommended-actions li {
  margin-bottom: 8px;
}

.quality-metrics {
  margin: 20px 0;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-top: 10px;
}

.metric-box {
  padding: 15px;
  border-radius: 4px;
  text-align: center;
}

.metric-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.metric-name {
  font-size: 12px;
  color: #606266;
}

.metric-excellent {
  background-color: #f0f9eb;
  color: #67c23a;
}

.metric-good {
  background-color: #e1f3d8;
  color: #67c23a;
}

.metric-average {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.metric-poor {
  background-color: #fef0f0;
  color: #f56c6c;
}

.metric-bad {
  background-color: #fee;
  color: #f56c6c;
}

.material-issues {
  margin-top: 20px;
}
</style> 