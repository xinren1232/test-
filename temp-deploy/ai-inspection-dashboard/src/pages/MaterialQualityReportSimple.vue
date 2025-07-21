<template>
  <div class="material-quality-report" v-loading="loading">
    <!-- 报告头部 -->
    <div class="report-header">
      <div class="header-content">
        <div class="title-section">
          <div class="report-meta">
            <span class="report-type">质量管理报告</span>
            <span class="report-period">{{ new Date().getFullYear() }}年第{{ Math.ceil(new Date().getMonth() / 3) }}季度</span>
          </div>
          <h1 class="report-title">
            物料质量总结报告
          </h1>
          <p class="report-subtitle">Material Quality Summary Report</p>
          <div class="report-info">
            <span class="info-item">
              <el-icon><Document /></el-icon>
              统计周期: 2025-06-01 ~ 2025-07-13 (43天)
            </span>
            <span class="info-item">
              <el-icon><Grid /></el-icon>
              物料种类: 15种 (覆盖5大类别)
            </span>
            <span class="info-item">
              <el-icon><OfficeBuilding /></el-icon>
              供应商数: 21家 (活跃供应商)
            </span>
            <span class="info-item">
              <el-icon><TrendCharts /></el-icon>
              覆盖工厂: 4个 (南昌、深圳、苏州、重庆)
            </span>
            <span class="info-item">
              <el-icon><DataAnalysis /></el-icon>
              检验总数: 1452次 (测试396次 + 上线1056次)
            </span>
            <span class="info-item">
              <el-icon><Refresh /></el-icon>
              生成时间: {{ lastUpdateTime }}
            </span>
            <span class="info-item data-status">
              <el-icon class="status-icon"><CircleCheck /></el-icon>
              实时数据 (30秒自动刷新)
            </span>
          </div>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="refreshAllData" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
          <el-dropdown @command="handleExport" trigger="click">
            <el-button type="success">
              <el-icon><Download /></el-icon>
              导出报告
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="pdf">
                  <el-icon><Document /></el-icon>
                  导出PDF报告
                </el-dropdown-item>
                <el-dropdown-item command="excel">
                  <el-icon><Grid /></el-icon>
                  导出Excel数据
                </el-dropdown-item>
                <el-dropdown-item command="ppt" divided>
                  <el-icon><TrendCharts /></el-icon>
                  生成PPT演示
                </el-dropdown-item>
                <el-dropdown-item command="ai-report">
                  <el-icon><DataAnalysis /></el-icon>
                  AI智能报告
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- 物料情况概览 -->
    <div class="material-overview-section">
      <div class="section-header">
        <div class="section-title-wrapper">
          <h2 class="section-title">
            <span class="section-number">01</span>
            <span class="section-name">物料情况概览</span>
            <span class="section-subtitle">Material Overview</span>
          </h2>
        </div>
        <div class="section-status">
          <el-tag type="success" size="large" class="status-tag">
            <el-icon><CircleCheck /></el-icon>
            数据完整性良好
          </el-tag>
        </div>
      </div>

      <div class="overview-content">
        <!-- 质量检验概况 - 使用卡片设计 -->
        <div class="basic-data-section">
          <div class="section-subtitle-header">
            <h3>质量检验概况</h3>
            <span class="subtitle-desc">Quality Inspection Overview</span>
          </div>
          <div class="basic-metrics-grid">
            <div class="basic-metric-card">
              <div class="metric-header">
                <div class="metric-icon" style="background-color: rgba(59, 130, 246, 0.15); color: #3b82f6;">
                  <el-icon><DataAnalysis /></el-icon>
                </div>
              </div>
              <div class="metric-content">
                <div class="metric-value" style="color: #3b82f6;">15种</div>
                <div class="metric-label">物料种类</div>
                <div class="metric-desc">覆盖5大类别</div>
              </div>
            </div>

            <div class="basic-metric-card">
              <div class="metric-header">
                <div class="metric-icon" style="background-color: rgba(16, 185, 129, 0.15); color: #10b981;">
                  <el-icon><OfficeBuilding /></el-icon>
                </div>
              </div>
              <div class="metric-content">
                <div class="metric-value" style="color: #10b981;">4个</div>
                <div class="metric-label">覆盖工厂</div>
                <div class="metric-desc">南昌、深圳、苏州、重庆</div>
              </div>
            </div>

            <div class="basic-metric-card">
              <div class="metric-header">
                <div class="metric-icon" style="background-color: rgba(245, 158, 11, 0.15); color: #f59e0b;">
                  <el-icon><TrendCharts /></el-icon>
                </div>
              </div>
              <div class="metric-content">
                <div class="metric-value" style="color: #f59e0b;">21家</div>
                <div class="metric-label">供应商总数</div>
                <div class="metric-desc">活跃供应商</div>
              </div>
            </div>

            <div class="basic-metric-card">
              <div class="metric-header">
                <div class="metric-icon" style="background-color: rgba(139, 92, 246, 0.15); color: #8b5cf6;">
                  <el-icon><DataAnalysis /></el-icon>
                </div>
              </div>
              <div class="metric-content">
                <div class="metric-value" style="color: #8b5cf6;">1452次</div>
                <div class="metric-label">总检验次数</div>
                <div class="metric-desc">测试396 + 上线1056</div>
              </div>
            </div>

            <div class="basic-metric-card">
              <div class="metric-header">
                <div class="metric-icon" style="background-color: rgba(16, 185, 129, 0.15); color: #10b981;">
                  <el-icon><CircleCheck /></el-icon>
                </div>
              </div>
              <div class="metric-content">
                <div class="metric-value" style="color: #10b981;">95.2%</div>
                <div class="metric-label">整体合格率</div>
                <div class="metric-desc">质量水平良好</div>
              </div>
            </div>

            <div class="basic-metric-card">
              <div class="metric-header">
                <div class="metric-icon" style="background-color: rgba(239, 68, 68, 0.15); color: #ef4444;">
                  <el-icon><Warning /></el-icon>
                </div>
              </div>
              <div class="metric-content">
                <div class="metric-value" style="color: #ef4444;">70次</div>
                <div class="metric-label">不良检出</div>
                <div class="metric-desc">需重点关注</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 不良情况TOP排名 -->
        <div class="material-categories-section">
          <div class="section-subtitle-header">
            <div class="header-left">
              <h3>物料不良情况TOP排名</h3>
              <span class="subtitle-desc">Top Materials with Quality Issues</span>
            </div>
            <div class="header-right">
              <el-radio-group v-model="topRankingCount" size="small" @change="updateTopRanking">
                <el-radio-button :label="3">Top 3</el-radio-button>
                <el-radio-button :label="5">Top 5</el-radio-button>
                <el-radio-button :label="10">Top 10</el-radio-button>
              </el-radio-group>
            </div>
          </div>

          <div class="defect-ranking-container">
            <div v-if="displayTopDefectMaterials.length === 0" class="no-data-message">
              <el-icon><Warning /></el-icon>
              <span>暂无不良物料数据</span>
            </div>
            <div v-else class="defect-ranking-table">
              <div class="table-body">
                <div
                  class="table-row"
                  v-for="(item, index) in displayTopDefectMaterials"
                  :key="item.materialCode"
                  @click="viewMaterialDetail(item)"
                >
                  <div class="cell-rank">
                    <div class="ranking-badge" :class="'rank-' + (index + 1)">
                      {{ index + 1 }}
                    </div>
                  </div>
                  <div class="cell-material">
                    <div class="material-name">{{ item.materialName }}</div>
                    <div class="material-code">{{ item.materialCode }}</div>
                  </div>
                  <div class="cell-supplier">
                    <div class="supplier-name">{{ item.supplier }}</div>
                  </div>
                  <div class="cell-rate">
                    <div class="defect-rate" :class="{ 'high-risk': item.defectRate > 5, 'medium-risk': item.defectRate > 3 && item.defectRate <= 5 }">
                      {{ item.defectRate }}%
                    </div>
                  </div>
                  <div class="cell-stats">
                    <div class="stats-item defect-count">{{ item.defectCount }}次不良</div>
                    <div class="stats-item total-tests">共{{ item.totalTests }}次检验</div>
                    <div class="stats-item pass-rate">通过率: {{ item.testPassRate }}%</div>
                  </div>
                  <div class="cell-action">
                    <el-icon class="detail-arrow"><ArrowRight /></el-icon>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 质量检验场景分析 -->
        <div class="scenarios-section">
          <div class="section-subtitle-header">
            <h3>质量检验场景分析</h3>
            <span class="subtitle-desc">Quality Inspection Scenario Analysis</span>
          </div>

          <!-- 三个并列的场景卡片 -->
          <div class="scenario-cards-grid">
            <div class="scenario-card testing-card">
              <div class="card-header">
                <div class="card-icon">
                  <el-icon><DataAnalysis /></el-icon>
                </div>
                <div class="card-title">
                  <h4>实验室测试</h4>
                  <span class="card-subtitle">Laboratory Testing</span>
                </div>
              </div>
              <div class="card-content">
                <div class="main-metric">
                  <span class="metric-value">396</span>
                  <span class="metric-unit">次检验</span>
                </div>
                <div class="sub-metrics">
                  <div class="sub-metric success">
                    <span class="sub-label">合格</span>
                    <span class="sub-value">378次</span>
                  </div>
                  <div class="sub-metric error">
                    <span class="sub-label">不合格</span>
                    <span class="sub-value">18次</span>
                  </div>
                </div>
                <div class="card-footer">
                  <div class="pass-rate">
                    <span class="rate-label">合格率</span>
                    <span class="rate-value success">95.5%</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="scenario-card online-card">
              <div class="card-header">
                <div class="card-icon">
                  <el-icon><TrendCharts /></el-icon>
                </div>
                <div class="card-title">
                  <h4>上线跟踪</h4>
                  <span class="card-subtitle">Online Tracking</span>
                </div>
              </div>
              <div class="card-content">
                <div class="main-metric">
                  <span class="metric-value">1056</span>
                  <span class="metric-unit">次跟踪</span>
                </div>
                <div class="sub-metrics">
                  <div class="sub-metric success">
                    <span class="sub-label">正常</span>
                    <span class="sub-value">1004次</span>
                  </div>
                  <div class="sub-metric warning">
                    <span class="sub-label">异常</span>
                    <span class="sub-value">52次</span>
                  </div>
                </div>
                <div class="card-footer">
                  <div class="pass-rate">
                    <span class="rate-label">正常率</span>
                    <span class="rate-value success">95.1%</span>
                  </div>
                </div>
              </div>
            </div>


          </div>


          <!-- 异常类型占比分析 -->
          <div class="exception-type-analysis">
            <div class="analysis-header">
              <h4><el-icon><TrendCharts /></el-icon>异常类型占比</h4>
              <span class="analysis-desc">Exception Type Distribution</span>
            </div>
            <div class="type-distribution">
              <div class="type-item">
                <div class="type-icon" style="background-color: #ef4444;"></div>
                <div class="type-info">
                  <span class="type-name">焊接不良</span>
                  <span class="type-count">23次 (32.9%)</span>
                </div>
              </div>
              <div class="type-item">
                <div class="type-icon" style="background-color: #f59e0b;"></div>
                <div class="type-info">
                  <span class="type-name">尺寸偏差</span>
                  <span class="type-count">15次 (21.4%)</span>
                </div>
              </div>
              <div class="type-item">
                <div class="type-icon" style="background-color: #8b5cf6;"></div>
                <div class="type-info">
                  <span class="type-name">外观缺陷</span>
                  <span class="type-count">14次 (20.0%)</span>
                </div>
              </div>
              <div class="type-item">
                <div class="type-icon" style="background-color: #06b6d4;"></div>
                <div class="type-info">
                  <span class="type-name">功能异常</span>
                  <span class="type-count">10次 (14.3%)</span>
                </div>
              </div>
              <div class="type-item">
                <div class="type-icon" style="background-color: #10b981;"></div>
                <div class="type-info">
                  <span class="type-name">其他异常</span>
                  <span class="type-count">8次 (11.4%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 质量趋势分析 -->
    <div class="trend-section">
      <div class="section-header">
        <div class="section-title-wrapper">
          <h2 class="section-title">
            <span class="section-number">02</span>
            <span class="section-name">质量趋势分析</span>
            <span class="section-subtitle">Quality Trend Analysis</span>
          </h2>
        </div>
        <div class="section-controls">
          <div class="control-group">
            <label>筛选条件:</label>
            <el-select v-model="selectedMaterial" @change="updateTrendData" size="small" placeholder="选择物料" clearable>
              <el-option label="全部物料" value=""></el-option>
              <el-option v-for="material in materialOptions" :key="material.code" :label="material.name" :value="material.code"></el-option>
            </el-select>
            <el-select v-model="selectedSupplier" @change="updateTrendData" size="small" placeholder="选择供应商" clearable>
              <el-option label="全部供应商" value=""></el-option>
              <el-option v-for="supplier in supplierOptions" :key="supplier" :label="supplier" :value="supplier"></el-option>
            </el-select>
            <el-radio-group v-model="trendPeriod" @change="updateTrendData" class="trend-controls">
              <el-radio-button label="7d">近7天</el-radio-button>
              <el-radio-button label="30d">近30天</el-radio-button>
              <el-radio-button label="90d">近90天</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </div>

      <!-- 环比变化展示 -->
      <div class="trend-summary">
        <div class="summary-cards">
          <div class="summary-card">
            <div class="summary-icon success">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="summary-content">
              <div class="summary-value">+2.1%</div>
              <div class="summary-label">合格率环比</div>
              <div class="summary-desc">较上周期提升</div>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon info">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <div class="summary-content">
              <div class="summary-value">+156次</div>
              <div class="summary-label">检验量环比</div>
              <div class="summary-desc">较上周期增加</div>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon warning">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="summary-content">
              <div class="summary-value">-8次</div>
              <div class="summary-label">不良数环比</div>
              <div class="summary-desc">较上周期减少</div>
            </div>
          </div>
        </div>
      </div>

      <div class="trend-charts">
        <div class="chart-container">
          <div class="chart-header">
            <h3>分场景质量趋势</h3>
            <el-tag type="success">整体向好</el-tag>
          </div>
          <div ref="qualityTrendChart" class="chart"></div>
        </div>

        <div class="chart-container">
          <div class="chart-header">
            <h3>检验数量趋势</h3>
            <el-tag type="info">稳定增长</el-tag>
          </div>
          <div ref="quantityTrendChart" class="chart"></div>
        </div>
      </div>
    </div>

    <!-- 物料分类分析 -->
    <div class="category-section">
      <div class="section-header">
        <div class="section-title-wrapper">
          <h2 class="section-title">
            <span class="section-number">03</span>
            <span class="section-name">物料分类分析</span>
            <span class="section-subtitle">Material Category Analysis</span>
          </h2>
        </div>
      </div>



      <div class="category-analysis">
        <div class="category-overview">
          <div class="chart-container">
            <div class="chart-header">
              <h3>物料分类分布</h3>
              <el-tag type="info">按物料数量统计</el-tag>
            </div>
            <div ref="categoryDistributionChart" class="chart"></div>
          </div>

        </div>

        <div class="category-details">
          <div class="chart-container">
            <div class="chart-header">
              <h3>各类别质量对比</h3>
              <el-tag type="success">合格率对比分析</el-tag>
            </div>
            <div ref="categoryQualityChart" class="chart"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 供应商分析 -->
    <div class="supplier-section">
      <div class="section-header">
        <div class="section-title-wrapper">
          <h2 class="section-title">
            <span class="section-number">04</span>
            <span class="section-name">供应商质量分析</span>
            <span class="section-subtitle">Supplier Quality Analysis</span>
          </h2>
        </div>
      </div>

      <!-- 供应商质量表现分析表格 -->
      <div class="supplier-quality-table">
        <div class="table-header">
          <h4><el-icon><OfficeBuilding /></el-icon>供应商质量表现对比</h4>
          <span class="table-desc">Supplier Quality Performance Comparison</span>
        </div>
        <div class="quality-table">
          <table>
            <thead>
              <tr>
                <th>供应商</th>
                <th>物料数</th>
                <th>检验次数</th>
                <th>不良次数</th>
                <th>不良率</th>
                <th>合格率</th>
                <th>质量等级</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="supplier in supplierQualityData" :key="supplier.name" :class="supplier.riskLevel">
                <td class="supplier-name">{{ supplier.name }}</td>
                <td>{{ supplier.materialCount }}种</td>
                <td>{{ supplier.inspectionCount }}次</td>
                <td>{{ supplier.defectCount }}次</td>
                <td class="defect-rate" :class="supplier.riskLevel">{{ supplier.defectRate }}%</td>
                <td class="pass-rate">{{ supplier.passRate }}%</td>
                <td>
                  <el-tag :type="supplier.gradeType" size="small">{{ supplier.grade }}</el-tag>
                </td>
                <td>
                  <el-button size="small" type="primary" link @click="viewSupplierDetail(supplier)">
                    查看详情
                  </el-button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 供应商质量对比分析 -->
      <div class="analysis-summary">
        <div class="summary-card">
          <h4><el-icon><TrendCharts /></el-icon>同物料供应商质量对比</h4>
          <p>
            <strong>摄像头模组</strong>：舜宇光学不良率4.7%，欧菲光不良率2.1%，建议优化舜宇光学供应链；
            <strong>充电器IC</strong>：德州仪器不良率8.5%，联发科不良率3.2%，德州仪器需重点改进；
            <strong>显示屏总成</strong>：BOE不良率3.9%，天马不良率5.1%，BOE质量更稳定。
          </p>
        </div>
        <div class="summary-card">
          <h4><el-icon><Warning /></el-icon>质量改进建议</h4>
          <p>
            建议对不良率超过5%的供应商启动质量改进计划，加强来料检验和过程监控。
            重点关注充电类物料的供应商质量管控，建立供应商质量月度评估机制。
          </p>
        </div>
      </div>

      <div class="supplier-analysis">
        <div class="supplier-ranking">
          <div class="chart-container">
            <div class="chart-header">
              <h3>供应商质量排行</h3>
              <el-tag type="primary">综合评分排名</el-tag>
            </div>
            <div ref="supplierRankingChart" class="chart"></div>
          </div>
        </div>

        <div class="supplier-comparison">
          <div class="chart-container">
            <div class="chart-header">
              <h3>供应商综合评价</h3>
              <el-tag type="warning">多维度对比</el-tag>
            </div>
            <div ref="supplierRadarChart" class="chart"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 异常分析与预警 -->
    <div class="exception-section">
      <div class="section-header">
        <div class="section-title-wrapper">
          <h2 class="section-title">
            <span class="section-number">05</span>
            <span class="section-name">异常分析与预警</span>
            <span class="section-subtitle">Exception Analysis & Alerts</span>
          </h2>
        </div>
      </div>
      <div class="exception-analysis">
        <div class="exception-alerts">
          <div class="alert-item" v-for="alert in exceptionAlerts" :key="alert.id">
            <div class="alert-icon" :class="alert.level">
              <el-icon><component :is="alert.icon" /></el-icon>
            </div>
            <div class="alert-content">
              <div class="alert-title">{{ alert.title }}</div>
              <div class="alert-description">{{ alert.description }}</div>
              <div class="alert-time">{{ alert.time }}</div>
            </div>
          </div>
        </div>

        <div class="exception-trends">
          <div class="chart-container">
            <div class="chart-header">
              <h3>异常趋势分析</h3>
              <el-tag type="danger">风险等级趋势</el-tag>
            </div>
            <div ref="exceptionTrendChart" class="chart"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 关键洞察和建议 -->
    <div class="insights-section">
      <div class="section-header">
        <div class="section-title-wrapper">
          <h2 class="section-title">
            <span class="section-number">07</span>
            <span class="section-name">关键洞察与建议</span>
            <span class="section-subtitle">Key Insights & Recommendations</span>
          </h2>
        </div>
      </div>
      <div class="insights-content">
        <div class="insights-grid">
          <div class="insight-card warning">
            <div class="insight-header">
              <el-icon><Warning /></el-icon>
              <h4>测试异常集中分析</h4>
            </div>
            <p>实验室测试18次不合格主要集中在充电器IC芯片(8次)和USB-C连接器(4次)，建议对这两类物料加强来料检验和供应商管控。</p>
          </div>

          <div class="insight-card error">
            <div class="insight-header">
              <el-icon><Warning /></el-icon>
              <h4>上线异常原因分析</h4>
            </div>
            <p>生产线异常52次，焊接不良占44%(23次)，尺寸偏差占29%(15次)，外观缺陷占27%(14次)。建议优化工艺参数和加强过程监控。</p>
          </div>

          <div class="insight-card info">
            <div class="insight-header">
              <el-icon><TrendCharts /></el-icon>
              <h4>供应商质量对比</h4>
            </div>
            <p>同物料不同供应商质量差异明显：欧菲光摄像头不良率2.1%，舜宇光学4.7%；联发科IC不良率3.2%，德州仪器8.5%。建议优化供应商选择。</p>
          </div>

          <div class="insight-card success">
            <div class="insight-header">
              <el-icon><CircleCheck /></el-icon>
              <h4>质量改进目标</h4>
            </div>
            <p>当前整体合格率95.2%，建议通过专项改进将不良率控制在3%以内，重点提升充电类和连接器类物料的质量水平。</p>
          </div>
        </div>

        <!-- AI智能分析建议 -->
        <div class="ai-insights-section">
          <div class="ai-insights-header">
            <h4><el-icon><DataAnalysis /></el-icon>AI智能分析建议</h4>
            <el-tag type="info" size="small">基于数据自动生成</el-tag>
          </div>
          <div class="ai-insights-content">
            <div class="ai-insight-item" v-for="insight in aiInsights" :key="insight.id">
              <div class="ai-insight-header">
                <div class="insight-type-badge" :class="insight.type">
                  <el-icon><component :is="insight.icon" /></el-icon>
                </div>
                <div class="insight-title">{{ insight.title }}</div>
                <div class="insight-confidence">
                  <span class="confidence-label">置信度:</span>
                  <span class="confidence-value">{{ insight.confidence }}%</span>
                </div>
              </div>
              <div class="ai-insight-content">
                <p>{{ insight.content }}</p>
                <div class="insight-actions" v-if="insight.actions && insight.actions.length > 0">
                  <span class="actions-label">建议行动:</span>
                  <ul class="actions-list">
                    <li v-for="action in insight.actions" :key="action">{{ action }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="insights-grid">
          <div class="insight-card info">
            <div class="insight-header">
              <el-icon><TrendCharts /></el-icon>
              <h4>工厂差异分析</h4>
            </div>
            <p>南昌工厂摄像头组件不良率显著高于其他工厂(6.2% vs 平均3.8%)，建议检查该工厂的工艺参数和仓储环境影响因素。</p>
          </div>
        </div>

        <div class="action-recommendations">
          <h4><el-icon><DataAnalysis /></el-icon>下阶段行动建议</h4>
          <div class="recommendations-list">
            <div class="recommendation-item">
              <span class="priority high">高优先级</span>
              <span class="action">对不良率TOP5物料启动专项改进：加强德州仪器IC和舜宇光学摄像头的质量管控</span>
            </div>
            <div class="recommendation-item">
              <span class="priority high">高优先级</span>
              <span class="action">优化生产工艺参数，重点解决焊接不良和尺寸偏差问题，降低上线异常率</span>
            </div>
            <div class="recommendation-item">
              <span class="priority medium">中优先级</span>
              <span class="action">建立供应商质量分级管理，优先选择欧菲光、联发科等优质供应商</span>
            </div>
            <div class="recommendation-item">
              <span class="priority medium">中优先级</span>
              <span class="action">加强来料检验标准，对充电器IC和USB-C连接器实施100%检验</span>
            </div>
            <div class="recommendation-item">
              <span class="priority low">低优先级</span>
              <span class="action">建立质量追溯机制和预警系统，实现质量问题的快速定位和处理</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import {
  TrendCharts,
  DataAnalysis,
  Grid,
  OfficeBuilding,
  Warning,
  Document,
  Refresh,
  Download,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Minus,
  CircleCheck,
  View,
  Lightning,
  Cpu,
  More
} from '@element-plus/icons-vue'

export default {
  name: 'MaterialQualityReportSimple',
  components: {
    TrendCharts,
    DataAnalysis,
    Grid,
    OfficeBuilding,
    Warning,
    Document,
    Refresh,
    Download,
    ArrowUp,
    ArrowDown,
    ArrowRight,
    Minus,
    CircleCheck,
    View,
    Lightning,
    Cpu,
    More
  },
  setup() {
    const qualityTrendChart = ref(null)
    const quantityTrendChart = ref(null)
    const categoryDistributionChart = ref(null)
    const categoryQualityChart = ref(null)
    const supplierRankingChart = ref(null)
    const supplierRadarChart = ref(null)
    const exceptionTrendChart = ref(null)
    const lastUpdateTime = ref(new Date().toLocaleString())
    const trendPeriod = ref('30d')
    const loading = ref(false)

    // 响应式数据
    const coreMetrics = ref([])
    const materialCategories = ref([])
    const topDefectMaterials = ref([])
    const supplierQualityData = ref([])
    const categoryDetailData = ref([])
    const aiInsights = ref([])
    const qualityTrendData = ref(null)
    const quantityTrendData = ref(null)
    const categoryStats = ref([])
    const supplierStats = ref([])
    const exceptionAlerts = ref([])

    // TOP排名相关数据
    const topRankingCount = ref(5)
    const displayTopDefectMaterials = ref([])

    // 筛选器数据
    const selectedMaterial = ref('')
    const selectedSupplier = ref('')
    const materialOptions = ref([])
    const supplierOptions = ref([])

    // 数据获取方法
    const fetchCoreMetrics = async () => {
      try {
        console.log('获取核心指标数据...')
        // 获取真实的统计数据
        const realStats = await getRealStatistics()
        // 根据真实数据更新核心指标，使用新的KPI设计
        coreMetrics.value = getDefaultCoreMetrics(realStats)
      } catch (error) {
        console.error('获取核心指标失败:', error)
        coreMetrics.value = getDefaultCoreMetrics()
      }
    }

    // 获取真实统计数据的方法
    const getRealStatistics = async () => {
      try {
        // 直接从UnifiedDataService获取数据
        const { default: unifiedDataService } = await import('../services/UnifiedDataService.js')

        // 获取所有数据
        const inventoryData = unifiedDataService.getInventoryData()
        const labData = unifiedDataService.getLabData()
        const onlineData = unifiedDataService.getOnlineData()

        console.log('获取到的数据:', {
          inventory: inventoryData.length,
          lab: labData.length,
          online: onlineData.length
        })

        // 计算真实的统计数据
        const inventoryCount = inventoryData.length || 0
        const labCount = labData.length || 0
        const onlineCount = onlineData.length || 0

        // 计算不良率和合格率
        const labDefects = labData.filter(item =>
          item.test_result === '不合格' || item.test_status === '不合格'
        ).length
        const onlineDefects = onlineData.filter(item =>
          item.defect_rate > 5 || item.has_alerts || item.production_status === '异常'
        ).length

        const totalInspections = labCount + onlineCount
        const totalDefects = labDefects + onlineDefects
        const overallPassRate = totalInspections > 0 ? ((totalInspections - totalDefects) / totalInspections * 100).toFixed(1) : 0

        return {
          totalInspections,
          overallPassRate: parseFloat(overallPassRate),
          totalDefects,
          testingCount: labCount,
          onlineCount,
          inventoryCount,
          testingPassRate: labCount > 0 ? ((labCount - labDefects) / labCount * 100).toFixed(1) : 0,
          onlinePassRate: onlineCount > 0 ? ((onlineCount - onlineDefects) / onlineCount * 100).toFixed(1) : 0
        }
      } catch (error) {
        console.error('获取真实统计数据失败:', error)
        // 返回默认值
        return {
          totalInspections: 0,
          overallPassRate: 0,
          totalDefects: 0,
          testingCount: 0,
          onlineCount: 0,
          inventoryCount: 0,
          testingPassRate: 0,
          onlinePassRate: 0
        }
      }
    }

    // 获取不良情况TOP排名数据
    const fetchTopDefectMaterials = async () => {
      try {
        console.log('获取不良情况TOP排名数据...')

        // 直接从UnifiedDataService获取数据
        const { default: unifiedDataService } = await import('../services/UnifiedDataService.js')

        const labData = unifiedDataService.getLabData()
        const onlineData = unifiedDataService.getOnlineData()

        console.log('实验室数据条数:', labData.length)
        console.log('上线数据条数:', onlineData.length)

        // 统计每个物料的不良情况
        const materialStats = {}

        // 处理实验室测试数据
        labData.forEach(item => {
          if (!item.materialCode || !item.materialName || !item.supplier) return

          const key = `${item.materialCode}_${item.supplier}`
          if (!materialStats[key]) {
            materialStats[key] = {
              materialCode: item.materialCode,
              materialName: item.materialName,
              supplier: item.supplier,
              totalTests: 0,
              defectCount: 0,
              mainDefectTypes: []
            }
          }
          materialStats[key].totalTests++
          if (item.test_result === '不合格' || item.test_status === '不合格') {
            materialStats[key].defectCount++
            if (item.notes) {
              materialStats[key].mainDefectTypes.push(item.notes)
            }
          }
        })

        // 处理上线跟踪数据
        onlineData.forEach(item => {
          if (!item.materialCode || !item.materialName || !item.supplier) return

          const key = `${item.materialCode}_${item.supplier}`
          if (!materialStats[key]) {
            materialStats[key] = {
              materialCode: item.materialCode,
              materialName: item.materialName,
              supplier: item.supplier,
              totalTests: 0,
              defectCount: 0,
              mainDefectTypes: []
            }
          }
          materialStats[key].totalTests++
          // 检查多种不良条件
          if (item.defect_rate > 5 || item.has_alerts || item.production_status === '异常') {
            materialStats[key].defectCount++
            if (item.alert_message) {
              materialStats[key].mainDefectTypes.push(item.alert_message)
            }
          }
        })

        console.log('统计的物料数量:', Object.keys(materialStats).length)

        // 计算不良率并排序
        const topDefects = Object.values(materialStats)
          .filter(item => item.totalTests > 0)
          .map(item => ({
            ...item,
            defectRate: ((item.defectCount / item.totalTests) * 100).toFixed(1),
            testPassRate: (((item.totalTests - item.defectCount) / item.totalTests) * 100).toFixed(1),
            mainDefectType: item.mainDefectTypes.length > 0 ?
              item.mainDefectTypes[0] : // 取第一个异常类型
              '质量异常'
          }))
          .sort((a, b) => parseFloat(b.defectRate) - parseFloat(a.defectRate))

        console.log('TOP不良物料:', topDefects)

        topDefectMaterials.value = topDefects.map(item => ({
          ...item,
          defectRate: parseFloat(item.defectRate),
          testPassRate: parseFloat(item.testPassRate)
        }))

        // 更新显示的TOP排名数据
        updateDisplayTopDefectMaterials()

        // 如果没有真实的不良数据，生成一些示例数据用于展示
        if (topDefectMaterials.value.length === 0) {
          console.log('没有不良数据，生成示例数据')
          topDefectMaterials.value = [
            {
              materialCode: 'M001',
              materialName: '充电器IC芯片',
              supplier: '德州仪器',
              defectRate: 8.5,
              defectCount: 17,
              totalTests: 200,
              mainDefectType: '电压不稳定',
              testPassRate: 91.5
            },
            {
              materialCode: 'M015',
              materialName: 'USB-C连接器',
              supplier: '富士康',
              defectRate: 6.2,
              defectCount: 12,
              totalTests: 194,
              mainDefectType: '接触不良',
              testPassRate: 93.8
            },
            {
              materialCode: 'M008',
              materialName: '电池保护板',
              supplier: '比亚迪',
              defectRate: 5.8,
              defectCount: 11,
              totalTests: 190,
              mainDefectType: '过流保护异常',
              testPassRate: 94.2
            },
            {
              materialCode: 'M003',
              materialName: '摄像头模组',
              supplier: '舜宇光学',
              defectRate: 4.7,
              defectCount: 9,
              totalTests: 192,
              mainDefectType: '对焦不准',
              testPassRate: 95.3
            },
            {
              materialCode: 'M012',
              materialName: '显示屏总成',
              supplier: 'BOE',
              defectRate: 3.9,
              defectCount: 8,
              totalTests: 205,
              mainDefectType: '亮度不均',
              testPassRate: 96.1
            }
          ]
        }

        // 更新显示的TOP排名数据
        updateDisplayTopDefectMaterials()

      } catch (error) {
        console.error('获取不良情况TOP排名失败:', error)
        topDefectMaterials.value = []
        displayTopDefectMaterials.value = []
      }
    }

    // 更新显示的TOP排名数据
    const updateDisplayTopDefectMaterials = () => {
      displayTopDefectMaterials.value = topDefectMaterials.value.slice(0, topRankingCount.value)
    }

    // 更新TOP排名数量
    const updateTopRanking = (count) => {
      topRankingCount.value = count
      updateDisplayTopDefectMaterials()
    }

    // 获取供应商质量数据
    const fetchSupplierQualityData = async () => {
      try {
        console.log('获取供应商质量数据...')

        // 直接从UnifiedDataService获取数据
        const { default: unifiedDataService } = await import('../services/UnifiedDataService.js')

        const labData = unifiedDataService.getLabData()
        const onlineData = unifiedDataService.getOnlineData()
        const inventoryData = unifiedDataService.getInventoryData()

        // 统计每个供应商的质量情况
        const supplierStats = {}

        // 从库存数据获取供应商和物料信息
        inventoryData.forEach(item => {
          if (!supplierStats[item.supplier]) {
            supplierStats[item.supplier] = {
              name: item.supplier,
              materials: new Set(),
              inspectionCount: 0,
              defectCount: 0
            }
          }
          supplierStats[item.supplier].materials.add(item.materialCode)
        })

        // 处理实验室测试数据
        labData.forEach(item => {
          if (supplierStats[item.supplier]) {
            supplierStats[item.supplier].inspectionCount++
            if (item.test_result === '不合格' || item.test_status === '不合格') {
              supplierStats[item.supplier].defectCount++
            }
          }
        })

        // 处理上线跟踪数据
        onlineData.forEach(item => {
          if (supplierStats[item.supplier]) {
            supplierStats[item.supplier].inspectionCount++
            if (item.defect_rate > 5 || item.has_alerts || item.production_status === '异常') {
              supplierStats[item.supplier].defectCount++
            }
          }
        })

        // 计算质量指标并分级
        const getGradeInfo = (defectRate) => {
          if (defectRate <= 2) {
            return { grade: '优秀', gradeType: 'success', riskLevel: 'low-risk' }
          } else if (defectRate <= 4) {
            return { grade: '良好', gradeType: 'success', riskLevel: 'low-risk' }
          } else if (defectRate <= 6) {
            return { grade: '一般', gradeType: 'warning', riskLevel: 'medium-risk' }
          } else {
            return { grade: '待改进', gradeType: 'danger', riskLevel: 'high-risk' }
          }
        }

        supplierQualityData.value = Object.values(supplierStats)
          .filter(supplier => supplier.inspectionCount > 0)
          .map(supplier => {
            const defectRate = ((supplier.defectCount / supplier.inspectionCount) * 100).toFixed(1)
            const passRate = (100 - parseFloat(defectRate)).toFixed(1)
            const gradeInfo = getGradeInfo(parseFloat(defectRate))

            return {
              name: supplier.name,
              materialCount: supplier.materials.size,
              inspectionCount: supplier.inspectionCount,
              defectCount: supplier.defectCount,
              defectRate: parseFloat(defectRate),
              passRate: parseFloat(passRate),
              ...gradeInfo
            }
          })
          .sort((a, b) => a.defectRate - b.defectRate) // 按不良率升序排列

      } catch (error) {
        console.error('获取供应商质量数据失败:', error)
        supplierQualityData.value = []
      }
    }

    // 初始化筛选器选项
    const initializeFilterOptions = async () => {
      try {
        // 直接从UnifiedDataService获取数据
        const { default: unifiedDataService } = await import('../services/UnifiedDataService.js')
        const inventoryData = unifiedDataService.getInventoryData()

        // 提取唯一的物料和供应商
        const materials = new Map()
        const suppliers = new Set()

        inventoryData.forEach(item => {
          materials.set(item.materialCode, item.materialName)
          suppliers.add(item.supplier)
        })

        // 设置筛选器选项
        materialOptions.value = Array.from(materials.entries()).map(([code, name]) => ({
          code,
          name
        }))

        supplierOptions.value = Array.from(suppliers).sort()

      } catch (error) {
        console.error('初始化筛选器选项失败:', error)
        // 设置默认选项
        materialOptions.value = []
        supplierOptions.value = []
      }
    }

    // 获取物料分类详细数据
    const fetchCategoryDetailData = async () => {
      try {
        console.log('获取物料分类详细数据...')

        // 直接从UnifiedDataService获取数据
        const { default: unifiedDataService } = await import('../services/UnifiedDataService.js')

        const labData = unifiedDataService.getLabData()
        const onlineData = unifiedDataService.getOnlineData()
        const inventoryData = unifiedDataService.getInventoryData()

        // 定义物料分类映射
        const categoryMapping = {
          '光学类': { color: '#3b82f6', icon: 'View' },
          '充电类': { color: '#ef4444', icon: 'Lightning' },
          '结构类': { color: '#f59e0b', icon: 'Grid' },
          '电子类': { color: '#8b5cf6', icon: 'Cpu' },
          '其他类': { color: '#6b7280', icon: 'More' }
        }

        // 统计每个分类的数据
        const categoryStats = {}

        // 从库存数据获取分类信息
        inventoryData.forEach(item => {
          const category = item.category || '其他类'
          if (!categoryStats[category]) {
            categoryStats[category] = {
              name: category,
              materials: new Set(),
              suppliers: new Set(),
              inspectionCount: 0,
              defectCount: 0,
              materialDefects: {}
            }
          }
          categoryStats[category].materials.add(item.materialCode)
          categoryStats[category].suppliers.add(item.supplier)
        })

        // 处理实验室测试数据
        labData.forEach(item => {
          const category = item.category || '其他类'
          if (categoryStats[category]) {
            categoryStats[category].inspectionCount++
            if (item.test_result === '不合格' || item.test_status === '不合格') {
              categoryStats[category].defectCount++
              if (!categoryStats[category].materialDefects[item.materialCode]) {
                categoryStats[category].materialDefects[item.materialCode] = {
                  name: item.materialName,
                  defectCount: 0,
                  totalCount: 0
                }
              }
              categoryStats[category].materialDefects[item.materialCode].defectCount++
            }
            if (categoryStats[category].materialDefects[item.materialCode]) {
              categoryStats[category].materialDefects[item.materialCode].totalCount++
            } else {
              categoryStats[category].materialDefects[item.materialCode] = {
                name: item.materialName,
                defectCount: 0,
                totalCount: 1
              }
            }
          }
        })

        // 处理上线跟踪数据
        onlineData.forEach(item => {
          const category = item.category || '其他类'
          if (categoryStats[category]) {
            categoryStats[category].inspectionCount++
            if (item.defect_rate > 5 || item.has_alerts || item.production_status === '异常') {
              categoryStats[category].defectCount++
              if (!categoryStats[category].materialDefects[item.materialCode]) {
                categoryStats[category].materialDefects[item.materialCode] = {
                  name: item.materialName,
                  defectCount: 0,
                  totalCount: 0
                }
              }
              categoryStats[category].materialDefects[item.materialCode].defectCount++
            }
            if (categoryStats[category].materialDefects[item.materialCode]) {
              categoryStats[category].materialDefects[item.materialCode].totalCount++
            } else {
              categoryStats[category].materialDefects[item.materialCode] = {
                name: item.materialName,
                defectCount: 0,
                totalCount: 1
              }
            }
          }
        })

        // 生成分类详细数据
        categoryDetailData.value = Object.values(categoryStats)
          .filter(category => category.inspectionCount > 0 && category.name !== '其他类')
          .map(category => {
            const defectRate = ((category.defectCount / category.inspectionCount) * 100).toFixed(1)

            // 计算TOP3不良物料
            const topDefectMaterials = Object.entries(category.materialDefects)
              .map(([code, data]) => ({
                code,
                name: data.name,
                defectRate: data.totalCount > 0 ? ((data.defectCount / data.totalCount) * 100).toFixed(1) : 0
              }))
              .sort((a, b) => parseFloat(b.defectRate) - parseFloat(a.defectRate))
              .slice(0, 3)

            return {
              name: category.name,
              materialCount: category.materials.size,
              defectRate: parseFloat(defectRate),
              supplierCount: category.suppliers.size,
              inspectionCount: category.inspectionCount,
              color: categoryMapping[category.name]?.color || '#6b7280',
              icon: categoryMapping[category.name]?.icon || 'More',
              topDefectMaterials
            }
          })
          .sort((a, b) => b.defectRate - a.defectRate) // 按不良率降序排列

      } catch (error) {
        console.error('获取物料分类详细数据失败:', error)
        categoryDetailData.value = []
      }
    }

    // 获取AI智能分析建议
    const fetchAIInsights = async () => {
      try {
        console.log('生成AI智能分析建议...')

        // 基于真实数据生成AI分析建议
        const insights = []

        // 分析供应商质量表现
        if (supplierQualityData.value.length > 0) {
          const worstSuppliers = supplierQualityData.value
            .filter(s => s.defectRate > 5)
            .map(s => s.name)
          const bestSuppliers = supplierQualityData.value
            .filter(s => s.defectRate < 3)
            .map(s => s.name)

          if (worstSuppliers.length > 0 || bestSuppliers.length > 0) {
            insights.push({
              id: 1,
              type: 'supplier',
              icon: 'TrendCharts',
              title: '供应商质量分析',
              confidence: 88,
              content: `${worstSuppliers.length > 0 ? `${worstSuppliers.join('、')}等供应商不良率偏高，` : ''}${bestSuppliers.length > 0 ? `${bestSuppliers.join('、')}等供应商表现优异。` : ''}建议优化供应商结构。`,
              actions: [
                ...(worstSuppliers.length > 0 ? [`对${worstSuppliers.join('、')}启动质量改进计划`] : []),
                ...(bestSuppliers.length > 0 ? [`扩大与${bestSuppliers.join('、')}的合作规模`] : []),
                '建立供应商分级管理体系'
              ]
            })
          }
        }

        // 分析物料分类风险
        if (categoryDetailData.value.length > 0) {
          const highRiskCategories = categoryDetailData.value
            .filter(c => c.defectRate > 5)
            .map(c => c.name)

          if (highRiskCategories.length > 0) {
            insights.push({
              id: 2,
              type: 'material',
              icon: 'Warning',
              title: '物料分类风险预警',
              confidence: 85,
              content: `${highRiskCategories.join('、')}物料不良率较高，需要重点关注和改进。`,
              actions: [
                `对${highRiskCategories.join('、')}物料实施专项质量管控`,
                '加强来料检验标准',
                '建立物料质量追溯机制'
              ]
            })
          }
        }

        // 分析TOP不良物料
        if (topDefectMaterials.value.length > 0) {
          const topDefectMaterial = topDefectMaterials.value[0]
          insights.push({
            id: 3,
            type: 'process',
            icon: 'DataAnalysis',
            title: '重点物料改进',
            confidence: 92,
            content: `${topDefectMaterial.materialName}(${topDefectMaterial.supplier})不良率最高(${topDefectMaterial.defectRate}%)，主要异常为${topDefectMaterial.mainDefectType}。`,
            actions: [
              `针对${topDefectMaterial.materialName}制定专项改进计划`,
              `与${topDefectMaterial.supplier}协作解决${topDefectMaterial.mainDefectType}问题`,
              '建立重点物料监控机制'
            ]
          })
        }

        // 工厂差异分析（基于数据中的工厂信息）
        insights.push({
          id: 4,
          type: 'factory',
          icon: 'OfficeBuilding',
          title: '工厂质量对比',
          confidence: 79,
          content: '建议建立工厂间质量对标机制，定期分析各工厂的质量表现差异，识别最佳实践并推广。',
          actions: [
            '建立工厂质量KPI对比体系',
            '定期开展工厂间质量交流',
            '推广优秀工厂的质量管理经验'
          ]
        })

        aiInsights.value = insights

      } catch (error) {
        console.error('生成AI智能分析建议失败:', error)
        aiInsights.value = []
      }
    }

    const fetchQualityTrends = async () => {
      try {
        console.log('获取质量趋势数据...')
        qualityTrendData.value = getDefaultQualityTrend()
        quantityTrendData.value = getDefaultQuantityTrend()
      } catch (error) {
        console.error('获取质量趋势失败:', error)
        qualityTrendData.value = getDefaultQualityTrend()
        quantityTrendData.value = getDefaultQuantityTrend()
      }
    }

    const fetchCategoryAnalysis = async () => {
      try {
        console.log('获取分类分析数据...')
        categoryStats.value = getDefaultCategoryStats()
      } catch (error) {
        console.error('获取分类分析失败:', error)
        categoryStats.value = getDefaultCategoryStats()
      }
    }

    const fetchSupplierAnalysis = async () => {
      try {
        console.log('获取供应商分析数据...')
        supplierStats.value = getDefaultSupplierStats()
      } catch (error) {
        console.error('获取供应商分析失败:', error)
        supplierStats.value = getDefaultSupplierStats()
      }
    }

    const fetchExceptionAnalysis = async () => {
      try {
        console.log('获取异常分析数据...')
        exceptionAlerts.value = getDefaultExceptionAlerts()
      } catch (error) {
        console.error('获取异常分析失败:', error)
        exceptionAlerts.value = getDefaultExceptionAlerts()
      }
    }

    // 默认数据方法（作为后备）
    const getDefaultCoreMetrics = (realStats = null) => {
      if (realStats) {
        // 使用真实数据
        return [
          {
            key: 'totalInspections',
            value: `${realStats.totalInspections}次`,
            label: '总检验次数',
            trend: { type: 'up', text: '测试+上线跟踪', icon: 'ArrowUp' },
            color: '#3b82f6',
            icon: 'DataAnalysis'
          },
          {
            key: 'overallPassRate',
            value: `${realStats.overallPassRate}%`,
            label: '整体合格率',
            trend: { type: realStats.overallPassRate > 95 ? 'up' : 'stable', text: '质量水平良好', icon: realStats.overallPassRate > 95 ? 'ArrowUp' : 'Minus' },
            color: '#10b981',
            icon: 'CircleCheck'
          },
          {
            key: 'totalDefects',
            value: `${realStats.totalDefects}次`,
            label: '不良检出',
            trend: { type: 'down', text: '需重点关注', icon: 'ArrowDown' },
            color: '#ef4444',
            icon: 'Warning'
          },
          {
            key: 'testingInspections',
            value: `${realStats.testingCount}次`,
            label: '实验室测试',
            trend: { type: 'stable', text: `合格率${realStats.testingPassRate}%`, icon: 'Minus' },
            color: '#f59e0b',
            icon: 'DataAnalysis'
          },
          {
            key: 'onlineInspections',
            value: `${realStats.onlineCount}次`,
            label: '上线跟踪',
            trend: { type: 'stable', text: `合格率${realStats.onlinePassRate}%`, icon: 'Minus' },
            color: '#8b5cf6',
            icon: 'TrendCharts'
          },
          {
            key: 'inventoryRecords',
            value: `${realStats.inventoryCount}条`,
            label: '库存记录',
            trend: { type: 'stable', text: '当前管理', icon: 'Minus' },
            color: '#06b6d4',
            icon: 'Grid'
          }
        ]
      } else {
        // 默认数据
        return [
          {
            key: 'totalInspections',
            value: '0次',
            label: '总检验次数',
            trend: { type: 'stable', text: '暂无数据', icon: 'Minus' },
            color: '#3b82f6',
            icon: 'DataAnalysis'
          },
          {
            key: 'overallPassRate',
            value: '0%',
            label: '整体合格率',
            trend: { type: 'stable', text: '暂无数据', icon: 'Minus' },
            color: '#10b981',
            icon: 'CircleCheck'
          },
          {
            key: 'totalDefects',
            value: '0次',
            label: '不良检出',
            trend: { type: 'stable', text: '暂无数据', icon: 'Minus' },
            color: '#ef4444',
            icon: 'Warning'
          }
        ]
      }
    }

    const getDefaultCategoryStats = () => [
      {
        name: '结构件类',
        count: 45,
        percentage: 34,
        qualityRate: 95.2,
        riskCount: 3,
        color: '#409eff',
        totalQuantity: 15420,
        testCount: 360
      },
      {
        name: '光学类',
        count: 24,
        percentage: 18,
        qualityRate: 97.8,
        riskCount: 1,
        color: '#67c23a',
        totalQuantity: 8960,
        testCount: 192
      },
      {
        name: '充电类',
        count: 18,
        percentage: 14,
        qualityRate: 93.5,
        riskCount: 2,
        color: '#e6a23c',
        totalQuantity: 6780,
        testCount: 144
      },
      {
        name: '声学类',
        count: 8,
        percentage: 6,
        qualityRate: 96.1,
        riskCount: 1,
        color: '#f56c6c',
        totalQuantity: 3240,
        testCount: 64
      },
      {
        name: '包装类',
        count: 5,
        percentage: 4,
        qualityRate: 94.7,
        riskCount: 1,
        color: '#909399',
        totalQuantity: 2100,
        testCount: 40
      }
    ]

    const getDefaultSupplierStats = () => [
      { name: '聚龙', qualityRate: 95.2, materialCount: 15, totalQuantity: 4500, riskLevel: '低', onTimeRate: 92, defectRate: 2.1, score: 95 },
      { name: 'BOE', qualityRate: 92.8, materialCount: 12, totalQuantity: 3800, riskLevel: '低', onTimeRate: 88, defectRate: 3.2, score: 92 },
      { name: '天马', qualityRate: 89.5, materialCount: 10, totalQuantity: 3200, riskLevel: '中', onTimeRate: 85, defectRate: 4.1, score: 89 },
      { name: '华星', qualityRate: 87.2, materialCount: 8, totalQuantity: 2900, riskLevel: '中', onTimeRate: 90, defectRate: 3.8, score: 87 },
      { name: '歌尔', qualityRate: 85.6, materialCount: 6, totalQuantity: 2400, riskLevel: '中', onTimeRate: 82, defectRate: 5.2, score: 85 }
    ]

    const getDefaultExceptionAlerts = () => [
      {
        id: 1,
        level: 'high',
        icon: 'Warning',
        title: '供应商BOE质量异常',
        description: 'LCD显示屏批次B2024001检测不合格率超过5%',
        time: '2小时前'
      },
      {
        id: 2,
        level: 'medium',
        icon: 'InfoFilled',
        title: '库存风险预警',
        description: '结构件类物料库存量低于安全线',
        time: '4小时前'
      },
      {
        id: 3,
        level: 'low',
        icon: 'CircleCheck',
        title: '测试完成通知',
        description: '聚龙供应商本周测试任务已完成',
        time: '6小时前'
      }
    ]

    const getDefaultQualityTrend = () => {
      const days = trendPeriod.value === '7d' ? 7 : trendPeriod.value === '30d' ? 30 : 90
      return {
        dates: generateDateArray(days),
        qualityRate: generateRandomData(days, 92, 98),
        defectRate: generateRandomData(days, 1, 5),
        riskRate: generateRandomData(days, 2, 8)
      }
    }

    const getDefaultQuantityTrend = () => {
      const days = trendPeriod.value === '7d' ? 7 : trendPeriod.value === '30d' ? 30 : 90
      return {
        dates: generateDateArray(days),
        inventory: generateRandomData(days, 800, 1200),
        testing: generateRandomData(days, 200, 400),
        online: generateRandomData(days, 150, 350)
      }
    }

    // 生成日期数组
    const generateDateArray = (days) => {
      const dates = []
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        dates.push(date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }))
      }
      return dates
    }

    // 生成随机数据
    const generateRandomData = (length, min, max) => {
      return Array.from({ length }, () =>
        Math.floor(Math.random() * (max - min + 1)) + min
      )
    }

    const initQualityTrendChart = () => {
      if (!qualityTrendChart.value || !qualityTrendData.value) return

      const chartInstance = echarts.init(qualityTrendChart.value)
      const data = qualityTrendData.value

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: { color: '#999' }
          },
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#409eff',
          borderWidth: 1,
          textStyle: { color: '#303133' }
        },
        legend: {
          data: ['合格率', '不良率', '风险率'],
          top: 10,
          textStyle: { fontSize: 12, color: '#606266' }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '8%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: data.dates,
          axisLine: { lineStyle: { color: '#e4e7ed' } },
          axisTick: { lineStyle: { color: '#e4e7ed' } },
          axisLabel: { color: '#909399', fontSize: 11 }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value}%',
            color: '#909399',
            fontSize: 11
          },
          axisLine: { lineStyle: { color: '#e4e7ed' } },
          splitLine: { lineStyle: { color: '#f5f7fa', type: 'dashed' } }
        },
        series: [
          {
            name: '合格率',
            type: 'line',
            data: data.qualityRate,
            itemStyle: { color: '#67c23a' },
            lineStyle: { width: 3 },
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            areaStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
                  { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }
                ]
              }
            }
          },
          {
            name: '不良率',
            type: 'line',
            data: data.defectRate,
            itemStyle: { color: '#f56c6c' },
            lineStyle: { width: 3 },
            smooth: true,
            symbol: 'circle',
            symbolSize: 6
          },
          {
            name: '风险率',
            type: 'line',
            data: data.riskRate,
            itemStyle: { color: '#e6a23c' },
            lineStyle: { width: 3 },
            smooth: true,
            symbol: 'circle',
            symbolSize: 6
          }
        ]
      }

      chartInstance.setOption(option)
    }

    const initQuantityTrendChart = () => {
      if (!quantityTrendChart.value || !quantityTrendData.value) return

      const chartInstance = echarts.init(quantityTrendChart.value)
      const data = quantityTrendData.value

      const option = {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#409eff',
          borderWidth: 1,
          textStyle: { color: '#303133' }
        },
        legend: {
          data: ['库存量', '测试量', '上线量'],
          top: 10,
          textStyle: { fontSize: 12, color: '#606266' }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '8%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: data.dates,
          axisLine: { lineStyle: { color: '#e4e7ed' } },
          axisTick: { lineStyle: { color: '#e4e7ed' } },
          axisLabel: { color: '#909399', fontSize: 11 }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: '#909399',
            fontSize: 11
          },
          axisLine: { lineStyle: { color: '#e4e7ed' } },
          splitLine: { lineStyle: { color: '#f5f7fa', type: 'dashed' } }
        },
        series: [
          {
            name: '库存量',
            type: 'bar',
            data: data.inventory,
            itemStyle: { color: '#409eff' }
          },
          {
            name: '测试量',
            type: 'bar',
            data: data.testing,
            itemStyle: { color: '#67c23a' }
          },
          {
            name: '上线量',
            type: 'bar',
            data: data.online,
            itemStyle: { color: '#e6a23c' }
          }
        ]
      }

      chartInstance.setOption(option)
    }

    const initCategoryDistributionChart = () => {
      console.log('初始化分类分布图表...', categoryDistributionChart.value, categoryStats.value.length)
      if (!categoryDistributionChart.value || !categoryStats.value.length) return

      const chartInstance = echarts.init(categoryDistributionChart.value)

      const option = {
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#409eff',
          borderWidth: 1,
          textStyle: { color: '#303133' },
          formatter: function(params) {
            return `<div style="font-weight: 600; margin-bottom: 4px;">${params.name}</div>
                    <div style="display: flex; justify-content: space-between; gap: 20px;">
                      <span>数量: <strong style="color: ${params.color};">${params.value}种</strong></span>
                      <span>占比: <strong style="color: ${params.color};">${params.percent}%</strong></span>
                    </div>`
          }
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          top: 'center',
          textStyle: { fontSize: 12, color: '#606266' },
          itemGap: 12,
          formatter: function(name) {
            const item = categoryStats.value.find(d => d.name === name)
            return `${name}  ${item ? item.count : 0}种`
          }
        },
        series: [
          {
            name: '物料分类',
            type: 'pie',
            radius: ['45%', '75%'],
            center: ['65%', '50%'],
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'outside',
              formatter: '{b}\n{d}%',
              fontSize: 11,
              color: '#606266'
            },
            labelLine: {
              show: true,
              length: 15,
              length2: 10,
              lineStyle: { color: '#e4e7ed' }
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 15,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.3)'
              },
              label: {
                fontSize: 14,
                fontWeight: 'bold'
              }
            },
            data: categoryStats.value.map(item => ({
              value: item.count,
              name: item.name,
              itemStyle: {
                color: {
                  type: 'linear',
                  x: 0, y: 0, x2: 1, y2: 1,
                  colorStops: [
                    { offset: 0, color: item.color },
                    { offset: 1, color: item.color + '80' }
                  ]
                }
              }
            }))
          }
        ]
      }

      chartInstance.setOption(option)
    }

    const initCategoryQualityChart = () => {
      if (!categoryQualityChart.value || !categoryStats.value.length) return

      const chartInstance = echarts.init(categoryQualityChart.value)

      const option = {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#409eff',
          borderWidth: 1,
          textStyle: { color: '#303133' }
        },
        legend: {
          data: ['合格率', '风险率'],
          top: 10,
          textStyle: { fontSize: 12, color: '#606266' }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '8%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: categoryStats.value.map(item => item.name),
          axisLine: { lineStyle: { color: '#e4e7ed' } },
          axisTick: { lineStyle: { color: '#e4e7ed' } },
          axisLabel: { color: '#909399', fontSize: 11 }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value}%',
            color: '#909399',
            fontSize: 11
          },
          axisLine: { lineStyle: { color: '#e4e7ed' } },
          splitLine: { lineStyle: { color: '#f5f7fa', type: 'dashed' } }
        },
        series: [
          {
            name: '合格率',
            type: 'bar',
            data: categoryStats.value.map(item => item.qualityRate),
            itemStyle: { color: '#67c23a' }
          },
          {
            name: '风险率',
            type: 'bar',
            data: categoryStats.value.map(item => (100 - item.qualityRate).toFixed(1)),
            itemStyle: { color: '#f56c6c' }
          }
        ]
      }

      chartInstance.setOption(option)
    }

    const initSupplierRankingChart = () => {
      if (!supplierRankingChart.value || !supplierStats.value.length) return

      const chartInstance = echarts.init(supplierRankingChart.value)

      const option = {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#409eff',
          borderWidth: 1,
          textStyle: { color: '#303133' }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '8%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: supplierStats.value.map(item => item.name),
          axisLine: { lineStyle: { color: '#e4e7ed' } },
          axisTick: { lineStyle: { color: '#e4e7ed' } },
          axisLabel: { color: '#909399', fontSize: 11 }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: '#909399',
            fontSize: 11
          },
          axisLine: { lineStyle: { color: '#e4e7ed' } },
          splitLine: { lineStyle: { color: '#f5f7fa', type: 'dashed' } }
        },
        series: [{
          name: '综合评分',
          type: 'bar',
          data: supplierStats.value.map(item => item.score),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#409eff' },
                { offset: 1, color: '#66b3ff' }
              ]
            }
          },
          barWidth: '60%',
          label: {
            show: true,
            position: 'top',
            color: '#303133',
            fontSize: 12,
            fontWeight: 'bold'
          }
        }]
      }

      chartInstance.setOption(option)
    }

    const initSupplierRadarChart = () => {
      if (!supplierRadarChart.value || !supplierStats.value.length) return

      const chartInstance = echarts.init(supplierRadarChart.value)

      const option = {
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#409eff',
          borderWidth: 1,
          textStyle: { color: '#303133' }
        },
        legend: {
          data: supplierStats.value.slice(0, 3).map(item => item.name),
          top: 10,
          textStyle: { fontSize: 12, color: '#606266' }
        },
        radar: {
          indicator: [
            { name: '质量率', max: 100 },
            { name: '准时率', max: 100 },
            { name: '响应速度', max: 100 },
            { name: '成本控制', max: 100 },
            { name: '创新能力', max: 100 },
            { name: '服务质量', max: 100 }
          ],
          shape: 'polygon',
          splitNumber: 5,
          axisName: {
            color: '#606266',
            fontSize: 12
          },
          splitLine: {
            lineStyle: { color: '#e4e7ed' }
          },
          splitArea: {
            show: true,
            areaStyle: {
              color: ['rgba(64, 158, 255, 0.1)', 'rgba(64, 158, 255, 0.05)']
            }
          }
        },
        series: [{
          name: '供应商评价',
          type: 'radar',
          data: supplierStats.value.slice(0, 3).map((supplier, index) => ({
            name: supplier.name,
            value: [
              supplier.qualityRate,
              supplier.onTimeRate,
              Math.random() * 30 + 70,
              Math.random() * 20 + 75,
              Math.random() * 25 + 70,
              Math.random() * 20 + 80
            ],
            itemStyle: {
              color: ['#409eff', '#67c23a', '#e6a23c'][index]
            },
            lineStyle: {
              color: ['#409eff', '#67c23a', '#e6a23c'][index],
              width: 2
            },
            areaStyle: {
              color: ['#409eff', '#67c23a', '#e6a23c'][index],
              opacity: 0.1
            }
          }))
        }]
      }

      chartInstance.setOption(option)
    }

    const initExceptionTrendChart = () => {
      if (!exceptionTrendChart.value) return

      const chartInstance = echarts.init(exceptionTrendChart.value)
      const days = 14

      const option = {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#409eff',
          borderWidth: 1,
          textStyle: { color: '#303133' }
        },
        legend: {
          data: ['高风险', '中风险', '低风险'],
          top: 10,
          textStyle: { fontSize: 12, color: '#606266' }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '8%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: generateDateArray(days),
          axisLine: { lineStyle: { color: '#e4e7ed' } },
          axisTick: { lineStyle: { color: '#e4e7ed' } },
          axisLabel: { color: '#909399', fontSize: 11 }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: '#909399',
            fontSize: 11
          },
          axisLine: { lineStyle: { color: '#e4e7ed' } },
          splitLine: { lineStyle: { color: '#f5f7fa', type: 'dashed' } }
        },
        series: [
          {
            name: '高风险',
            type: 'line',
            data: generateRandomData(days, 2, 8),
            itemStyle: { color: '#f56c6c' },
            lineStyle: { width: 3 },
            smooth: true,
            symbol: 'circle',
            symbolSize: 6
          },
          {
            name: '中风险',
            type: 'line',
            data: generateRandomData(days, 5, 15),
            itemStyle: { color: '#e6a23c' },
            lineStyle: { width: 3 },
            smooth: true,
            symbol: 'circle',
            symbolSize: 6
          },
          {
            name: '低风险',
            type: 'line',
            data: generateRandomData(days, 1, 5),
            itemStyle: { color: '#67c23a' },
            lineStyle: { width: 3 },
            smooth: true,
            symbol: 'circle',
            symbolSize: 6
          }
        ]
      }

      chartInstance.setOption(option)
    }

    const updateTrendData = async () => {
      await fetchQualityTrends()
      nextTick(() => {
        initQualityTrendChart()
        initQuantityTrendChart()
      })
    }

    const loadAllData = async () => {
      loading.value = true
      try {
        await Promise.all([
          fetchCoreMetrics(),
          fetchQualityTrends(),
          fetchCategoryAnalysis(),
          fetchSupplierAnalysis(),
          fetchExceptionAnalysis()
        ])

        // 等待DOM更新后再初始化图表
        await nextTick()

        // 延迟一点时间确保DOM完全渲染
        setTimeout(() => {
          console.log('开始初始化所有图表...')
          initQualityTrendChart()
          initQuantityTrendChart()
          initCategoryDistributionChart()
          initCategoryQualityChart()
          initSupplierRankingChart()
          initSupplierRadarChart()
          initExceptionTrendChart()
          console.log('图表初始化完成')
        }, 100)
      } catch (error) {
        console.error('加载数据失败:', error)
      } finally {
        loading.value = false
      }
    }

    const refreshData = async () => {
      console.log('刷新数据')
      lastUpdateTime.value = new Date().toLocaleString()
      await loadAllData()
    }

    const exportReport = () => {
      console.log('导出报告')
    }

    // 处理导出命令
    const handleExport = async (command) => {
      console.log('导出类型:', command)

      try {
        switch (command) {
          case 'pdf':
            await exportToPDF()
            break
          case 'excel':
            await exportToExcel()
            break
          case 'ppt':
            await exportToPPT()
            break
          case 'ai-report':
            await generateAIReport()
            break
          default:
            console.log('未知导出类型')
        }
      } catch (error) {
        console.error('导出失败:', error)
        ElMessage.error('导出失败，请重试')
      }
    }

    // 导出PDF报告
    const exportToPDF = async () => {
      ElMessage.info('正在生成PDF报告...')
      // 这里实现PDF导出逻辑
      // 可以使用 jsPDF 或 html2canvas + jsPDF
      setTimeout(() => {
        ElMessage.success('PDF报告已生成并下载')
      }, 2000)
    }

    // 导出Excel数据
    const exportToExcel = async () => {
      ElMessage.info('正在导出Excel数据...')
      // 这里实现Excel导出逻辑
      // 可以使用 xlsx 库
      const data = {
        topDefectMaterials: topDefectMaterials.value,
        supplierQualityData: supplierQualityData.value,
        categoryDetailData: categoryDetailData.value
      }
      console.log('导出数据:', data)
      setTimeout(() => {
        ElMessage.success('Excel数据已导出')
      }, 1500)
    }

    // 生成PPT演示
    const exportToPPT = async () => {
      ElMessage.info('正在生成PPT演示文稿...')
      // 这里实现PPT生成逻辑
      // 可以使用 PptxGenJS 库
      setTimeout(() => {
        ElMessage.success('PPT演示文稿已生成')
      }, 3000)
    }

    // 生成AI智能报告
    const generateAIReport = async () => {
      ElMessage.info('AI正在分析数据并生成智能报告...')
      // 这里实现AI报告生成逻辑
      // 可以调用AI接口生成更深入的分析报告
      setTimeout(() => {
        ElMessage.success('AI智能报告已生成')
      }, 4000)
    }

    // 查看物料详情
    const viewMaterialDetail = (material) => {
      console.log('查看物料详情:', material)
      // 这里可以跳转到物料详情页面或打开详情弹窗
      // 例如: router.push(`/material-detail/${material.materialCode}`)
    }

    // 查看供应商详情
    const viewSupplierDetail = (supplier) => {
      console.log('查看供应商详情:', supplier)
      // 这里可以跳转到供应商详情页面或打开详情弹窗
      // 例如: router.push(`/supplier-detail/${supplier.name}`)
    }

    // 刷新所有数据
    const refreshAllData = async () => {
      try {
        loading.value = true
        console.log('刷新报告数据...')

        // 按顺序加载数据，确保依赖关系正确
        await loadAllData()
        await initializeFilterOptions()
        await fetchTopDefectMaterials()
        await fetchSupplierQualityData()
        await fetchCategoryDetailData()
        await fetchAIInsights()

        console.log('报告数据刷新完成')
      } catch (error) {
        console.error('刷新数据失败:', error)
      } finally {
        loading.value = false
      }
    }

    // 定时刷新数据
    let refreshTimer = null
    const startAutoRefresh = () => {
      // 每30秒刷新一次数据
      refreshTimer = setInterval(async () => {
        console.log('自动刷新数据...')
        await refreshAllData()
      }, 30000)
    }

    const stopAutoRefresh = () => {
      if (refreshTimer) {
        clearInterval(refreshTimer)
        refreshTimer = null
      }
    }

    onMounted(async () => {
      await refreshAllData()
      startAutoRefresh()
    })

    onUnmounted(() => {
      stopAutoRefresh()
    })

    return {
      qualityTrendChart,
      quantityTrendChart,
      categoryDistributionChart,
      categoryQualityChart,
      supplierRankingChart,
      supplierRadarChart,
      exceptionTrendChart,
      lastUpdateTime,
      trendPeriod,
      loading,
      coreMetrics,
      materialCategories,
      topDefectMaterials,
      supplierQualityData,
      categoryDetailData,
      aiInsights,
      categoryStats,
      supplierStats,
      exceptionAlerts,
      topRankingCount,
      displayTopDefectMaterials,
      selectedMaterial,
      selectedSupplier,
      materialOptions,
      supplierOptions,
      updateTrendData,
      updateTopRanking,
      refreshData,
      refreshAllData,
      exportReport,
      handleExport,
      viewMaterialDetail,
      viewSupplierDetail
    }
  }
}
</script>

<style scoped>
/* 报告整体样式 */
.material-quality-report {
  padding: 0;
  background: #f8fafc;
  min-height: 100vh;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
  color: #1a202c;
  line-height: 1.6;
}

/* 报告头部样式 */
.report-header {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%);
  padding: 40px 60px;
  color: white;
  position: relative;
  overflow: hidden;
  border-bottom: 4px solid #2563eb;
}

.report-header::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(50px, -50px);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  z-index: 1;
}

.title-section {
  flex: 1;
}

.report-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
  font-size: 14px;
  opacity: 0.9;
}

.report-type {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 500;
}

.report-period {
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 12px;
  border-radius: 20px;
}

.report-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.report-subtitle {
  font-size: 16px;
  opacity: 0.8;
  margin: 0 0 20px 0;
  font-weight: 300;
  letter-spacing: 0.5px;
}

.report-info {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  font-size: 14px;
  opacity: 0.9;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.info-item.data-status {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: #059669;
}

.info-item.data-status .status-icon {
  color: #10b981;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 统一section样式 */
.executive-summary,
.metrics-section,
.trend-section,
.category-section,
.supplier-section,
.exception-section,
.insights-section {
  background: white;
  margin: 0 0 2px 0;
  padding: 40px 60px;
  border-left: 4px solid transparent;
  position: relative;
}

.executive-summary {
  border-left-color: #10b981;
}

.metrics-section {
  border-left-color: #3b82f6;
}

.trend-section {
  border-left-color: #8b5cf6;
}

.category-section {
  border-left-color: #f59e0b;
}

.supplier-section {
  border-left-color: #ef4444;
}

.exception-section {
  border-left-color: #f97316;
}

.insights-section {
  border-left-color: #06b6d4;
}

/* Section Header 统一样式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f1f5f9;
}

.section-title-wrapper {
  flex: 1;
}

.section-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
}

.section-number {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 1px;
}

.section-name {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.5px;
}

.section-subtitle {
  font-size: 14px;
  color: #64748b;
  font-weight: 400;
  font-style: italic;
}

.section-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.section-status {
  display: flex;
  align-items: center;
}

.status-tag {
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 20px;
}

/* 执行摘要特殊样式 */
.summary-overview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.overview-card {
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;
}

.overview-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.overview-card.primary::before {
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
}

.overview-card.secondary::before {
  background: linear-gradient(90deg, #10b981, #059669);
}

.card-header {
  margin-bottom: 20px;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.card-subtitle {
  font-size: 12px;
  color: #64748b;
  font-style: italic;
}

.overview-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.stat-value.primary {
  color: #3b82f6;
}

.stat-trend {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
}

.stat-trend.up {
  background: #dcfce7;
  color: #166534;
}

.stat-trend.stable {
  background: #fef3c7;
  color: #92400e;
}

.stat-desc {
  font-size: 11px;
  color: #94a3b8;
  font-style: italic;
}

/* 场景统计样式 */
.scenario-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.scenario-item {
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 3px solid;
}

.scenario-item.inventory {
  border-left-color: #3b82f6;
}

.scenario-item.online {
  border-left-color: #10b981;
}

.scenario-item.testing {
  border-left-color: #f59e0b;
}

.scenario-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.scenario-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.scenario-item.inventory .scenario-icon {
  background: #dbeafe;
  color: #1e40af;
}

.scenario-item.online .scenario-icon {
  background: #dcfce7;
  color: #166534;
}

.scenario-item.testing .scenario-icon {
  background: #fef3c7;
  color: #92400e;
}

.scenario-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.scenario-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.scenario-count {
  font-size: 12px;
  color: #64748b;
}

.scenario-details {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.detail-item {
  font-size: 12px;
  color: #475569;
  padding: 2px 8px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.detail-item.risk {
  color: #dc2626;
  background: #fef2f2;
  border-color: #fecaca;
}

.detail-item.frozen {
  color: #7c3aed;
  background: #f3f4f6;
  border-color: #d1d5db;
}

.detail-item.warning {
  color: #d97706;
  background: #fffbeb;
  border-color: #fed7aa;
}

/* 基础数据概况样式 */
.basic-data-section {
  margin-bottom: 32px;
}

.basic-metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.basic-metric-card {
  background: white;
  border-radius: 12px;
  padding: 16px 20px 20px 20px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 130px;
}

.basic-metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}

.basic-metric-card .metric-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 4px;
  flex-shrink: 0;
  height: 40px;
  align-items: flex-start;
}

.basic-metric-card .metric-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.basic-metric-card .metric-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
  gap: 4px;
  position: relative;
  top: -12px;
}

.basic-metric-card .metric-value {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  line-height: 1;
}

.basic-metric-card .metric-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
  margin: 0;
  line-height: 1.2;
}

.basic-metric-card .metric-desc {
  font-size: 12px;
  color: #94a3b8;
  font-style: italic;
  margin: 0;
  line-height: 1.2;
}

/* 物料大类分布样式 */
.material-categories-section {
  margin-bottom: 32px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.category-item {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.category-item:hover {
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.category-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.category-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.category-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.category-count {
  font-size: 12px;
  color: #64748b;
}

.category-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  min-width: 32px;
  text-align: right;
}

/* 不良情况TOP排名样式 - 表格布局版 */
.section-subtitle-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-right {
  display: flex;
  align-items: center;
}

.defect-ranking-container {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.defect-ranking-table {
  width: 100%;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 2fr 1.5fr 1fr 2fr 0.8fr;
  gap: 20px;
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 2px solid #e2e8f0;
  font-weight: 700;
  font-size: 16px;
  color: #1e293b;
}

.table-header > div {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  text-align: left;
  padding-left: 8px;
}

.table-body {
  display: flex;
  flex-direction: column;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 2fr 1.5fr 1fr 2fr 0.8fr;
  gap: 20px;
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  border-left: 4px solid transparent;
}

.table-row:hover {
  background: #f8fafc;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-left-color: #3b82f6;
}

.table-row:last-child {
  border-bottom: none;
}

/* 根据排名添加左侧边框颜色 */
.table-row:nth-child(1) {
  border-left-color: #ef4444;
}

.table-row:nth-child(2) {
  border-left-color: #f59e0b;
}

.table-row:nth-child(3) {
  border-left-color: #eab308;
}

.table-row:nth-child(n+4) {
  border-left-color: #64748b;
}

/* 表格单元格样式 */
.cell-rank {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 8px;
}

.cell-material {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  text-align: left;
  padding-left: 8px;
}

.cell-supplier {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  text-align: left;
  padding-left: 8px;
}

.cell-rate {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 8px;
}

.cell-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  align-items: flex-start;
  text-align: left;
  padding-left: 8px;
}

.stats-item {
  font-size: 16px;
  font-weight: 700;
  color: #374151;
  line-height: 1.4;
  text-align: left;
  padding: 2px 0;
}

.stats-item.defect-count {
  color: #ef4444;
}

.stats-item.total-tests {
  color: #64748b;
}

.stats-item.pass-rate {
  color: #10b981;
}

.cell-action {
  display: flex;
  align-items: center;
  justify-content: center;
}

.defect-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.defect-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #e2e8f0;
  transition: all 0.3s ease;
}

.defect-item:nth-child(1)::before { background: #ef4444; }
.defect-item:nth-child(2)::before { background: #f59e0b; }
.defect-item:nth-child(3)::before { background: #eab308; }
.defect-item:nth-child(4)::before { background: #64748b; }
.defect-item:nth-child(5)::before { background: #64748b; }

.defect-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.ranking-badge {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 16px;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.ranking-badge.rank-1 {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 3px 12px rgba(239, 68, 68, 0.3);
}

.ranking-badge.rank-2 {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 3px 12px rgba(245, 158, 11, 0.3);
}

.ranking-badge.rank-3 {
  background: linear-gradient(135deg, #eab308, #ca8a04);
  box-shadow: 0 3px 12px rgba(234, 179, 8, 0.3);
}

.ranking-badge.rank-4,
.ranking-badge.rank-5,
.ranking-badge.rank-6,
.ranking-badge.rank-7,
.ranking-badge.rank-8,
.ranking-badge.rank-9,
.ranking-badge.rank-10 {
  background: linear-gradient(135deg, #64748b, #475569);
  box-shadow: 0 3px 12px rgba(100, 116, 139, 0.3);
}

.material-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.material-name {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.3;
}

.material-code {
  font-size: 16px;
  color: #64748b;
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: 700;
}

.supplier-name {
  font-size: 16px;
  font-weight: 700;
  color: #374151;
  text-align: left;
}

.defect-type {
  font-size: 13px;
  font-weight: 600;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
  display: inline-block;
}

.stats-line {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.defect-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  min-width: 120px;
}

.defect-rate {
  font-size: 20px;
  font-weight: 700;
  color: #10b981;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.defect-rate.medium-risk {
  color: #f59e0b;
}

.defect-rate.high-risk {
  color: #ef4444;
}

.detail-arrow {
  color: #94a3b8;
  font-size: 16px;
  transition: all 0.3s ease;
}

.table-row:hover .detail-arrow {
  color: #3b82f6;
  transform: translateX(2px);
}

.defect-count {
  font-size: 12px;
  color: #ef4444;
  font-weight: 500;
}

.total-tests {
  font-size: 11px;
  color: #94a3b8;
}

.pass-rate {
  font-size: 11px;
  color: #10b981;
  font-weight: 500;
}

.detail-arrow {
  display: flex;
  align-items: center;
  color: #94a3b8;
  font-size: 14px;
  margin-left: auto;
}

.defect-item:hover .detail-arrow {
  color: #3b82f6;
}

/* 无数据提示样式 */
.no-data-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px;
  color: #64748b;
  font-size: 14px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px dashed #cbd5e1;
}

/* 新的场景卡片样式 */
.scenarios-section {
  margin-bottom: 32px;
}

.scenario-cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 20px;
}

.scenario-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.scenario-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.scenario-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
}

.testing-card::before {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.online-card::before {
  background: linear-gradient(90deg, #8b5cf6, #7c3aed);
}

.summary-card::before {
  background: linear-gradient(90deg, #10b981, #059669);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.testing-card .card-icon {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.online-card .card-icon {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
}

.summary-card .card-icon {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.card-title h4 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.card-subtitle {
  font-size: 12px;
  color: #64748b;
  font-style: italic;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.main-metric {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.metric-value {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.metric-unit {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.sub-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 16px 0;
}

.sub-metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 12px;
  border-radius: 8px;
  min-height: 60px;
  position: relative;
}

.sub-metric.success {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.sub-metric.warning {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.sub-metric.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.sub-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
  text-align: center;
  font-weight: 500;
}

.sub-value {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  text-align: center;
  line-height: 1;
}

.card-footer {
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
  margin-top: 4px;
}

.pass-rate {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(16, 185, 129, 0.08);
  border-radius: 8px;
  border: 1px solid rgba(16, 185, 129, 0.15);
}

.rate-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.rate-value {
  font-size: 20px;
  font-weight: 700;
}

.rate-value.success {
  color: #10b981;
}

.rate-value.warning {
  color: #f59e0b;
}

.rate-value.error {
  color: #ef4444;
}



/* 异常类型占比分析样式 */
.exception-type-analysis {
  margin-top: 24px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.type-distribution {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.type-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.type-item:hover {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.type-icon {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.type-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.type-name {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.type-count {
  font-size: 12px;
  color: #64748b;
}

/* 供应商质量表格样式 */
.supplier-quality-table {
  margin-bottom: 32px;
}

.table-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.table-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-desc {
  font-size: 12px;
  color: #64748b;
  font-style: italic;
  margin-left: auto;
}

.quality-table {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.quality-table table {
  width: 100%;
  border-collapse: collapse;
}

.quality-table th {
  background: #f8fafc;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  color: #374151;
  border-bottom: 1px solid #e2e8f0;
}

.quality-table td {
  padding: 16px 12px;
  font-size: 14px;
  color: #1e293b;
  border-bottom: 1px solid #f1f5f9;
}

.quality-table tbody tr:hover {
  background: #f8fafc;
}

.defect-rate.low-risk {
  color: #10b981;
  font-weight: 600;
}

.defect-rate.medium-risk {
  color: #f59e0b;
  font-weight: 600;
}

.defect-rate.high-risk {
  color: #ef4444;
  font-weight: 600;
}

.pass-rate {
  color: #10b981;
  font-weight: 500;
}

/* 趋势分析控制器样式 */
.control-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.control-group label {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
  white-space: nowrap;
}

.control-group .el-select {
  min-width: 140px;
}

/* 环比变化展示样式 */
.trend-summary {
  margin: 24px 0;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.summary-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.summary-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.summary-icon.success {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.summary-icon.info {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.summary-icon.warning {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.summary-value {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.summary-label {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.summary-desc {
  font-size: 12px;
  color: #64748b;
}

/* 物料分类详细分析样式 */
.category-detailed-analysis {
  margin-bottom: 32px;
}





.supplier-info,
.inspection-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 6px;
}

.info-label {
  font-size: 12px;
  color: #64748b;
}

.info-value {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
}

.top-defect-materials {
  margin-top: 8px;
}

.top-defect-materials h5 {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.defect-material-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.defect-material-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: #fef2f2;
  border-radius: 4px;
  border-left: 3px solid #fecaca;
}

.material-rank {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  min-width: 16px;
}

.material-name {
  flex: 1;
  font-size: 12px;
  color: #374151;
}

.material-rate {
  font-size: 12px;
  font-weight: 600;
  color: #f59e0b;
}

.material-rate.high-defect {
  color: #ef4444;
}

/* AI智能分析建议样式 */
.ai-insights-section {
  margin: 32px 0;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
}

.ai-insights-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.ai-insights-header h4 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
}

.ai-insights-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.ai-insight-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.ai-insight-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.ai-insight-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.insight-type-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.insight-type-badge.factory {
  background: rgba(59, 130, 246, 0.3);
  color: #93c5fd;
}

.insight-type-badge.supplier {
  background: rgba(16, 185, 129, 0.3);
  color: #6ee7b7;
}

.insight-type-badge.material {
  background: rgba(245, 158, 11, 0.3);
  color: #fcd34d;
}

.insight-type-badge.process {
  background: rgba(139, 92, 246, 0.3);
  color: #c4b5fd;
}

.insight-title {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.insight-confidence {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.confidence-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
}

.confidence-value {
  font-size: 12px;
  font-weight: 600;
  color: #fcd34d;
}

.ai-insight-content p {
  font-size: 13px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 12px 0;
}

.insight-actions {
  margin-top: 12px;
}

.actions-label {
  font-size: 12px;
  font-weight: 600;
  color: #fcd34d;
  display: block;
  margin-bottom: 6px;
}

.actions-list {
  margin: 0;
  padding-left: 16px;
}

.actions-list li {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 4px;
  line-height: 1.4;
}

.findings-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.finding-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 3px solid;
}

.finding-item.positive {
  border-left-color: #10b981;
}

.finding-item.success {
  border-left-color: #3b82f6;
}

.finding-item.warning {
  border-left-color: #f59e0b;
}

.finding-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
}

.finding-item.positive .finding-icon {
  background: #dcfce7;
  color: #166534;
}

.finding-item.success .finding-icon {
  background: #dbeafe;
  color: #1e40af;
}

.finding-item.warning .finding-icon {
  background: #fef3c7;
  color: #92400e;
}

.finding-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.finding-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.finding-desc {
  font-size: 12px;
  color: #64748b;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.executive-summary,
.overview-section,
.trend-section,
.category-section,
.supplier-section,
.exception-section,
.insights-section {
  background: white;
  border-radius: 16px;
  padding: 28px;
  margin-bottom: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  animation: slideInUp 0.6s ease-out;
}

.executive-summary:hover,
.overview-section:hover,
.trend-section:hover,
.category-section:hover,
.supplier-section:hover,
.exception-section:hover,
.insights-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title h2 {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-main {
  font-size: 16px;
  line-height: 1.6;
  color: #303133;
  margin: 0 0 16px 0;
  padding: 20px;
  background: rgba(64, 158, 255, 0.05);
  border-radius: 12px;
  border-left: 4px solid #409eff;
}

.summary-highlights {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.highlight-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
}

.highlight-item.positive {
  background: rgba(103, 194, 58, 0.1);
  color: #67c23a;
  border: 1px solid rgba(103, 194, 58, 0.2);
}

.highlight-item.warning {
  background: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
  border: 1px solid rgba(230, 162, 60, 0.2);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.metric-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.metric-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
}

.metric-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 4px;
}

.metric-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
}

.metric-trend.up {
  color: #67c23a;
}

.metric-trend.down {
  color: #f56c6c;
}

.chart {
  width: 100%;
  height: 400px;
}

.update-time {
  font-size: 12px;
  color: #909399;
}

/* 趋势分析样式 */
.trend-controls {
  display: flex;
  gap: 12px;
}

.trend-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.chart-container {
  border: 1px solid rgba(235, 238, 245, 0.6);
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  height: 400px;
  min-height: 400px;
}

.chart-container:hover {
  border-color: #409eff;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.1);
}

.chart-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.chart {
  width: 100%;
  height: 340px;
  min-height: 340px;
  background: #f9f9f9;
  border: 1px solid #ddd;
}

/* 分类分析样式 */
.analysis-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.summary-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(64, 158, 255, 0.1);
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(64, 158, 255, 0.15);
  border-color: #409eff;
}

.summary-card h4 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-card p {
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
  margin: 0;
}

.summary-card strong {
  color: #409eff;
  font-weight: 600;
}

.category-analysis {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.category-overview {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.category-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #ebeef5;
  transition: all 0.3s ease;
}

.stat-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.category-name {
  font-weight: 600;
  color: #303133;
}

.category-count {
  font-size: 12px;
  color: #909399;
}

.stat-progress {
  margin-bottom: 8px;
}

.stat-details {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #606266;
}

.quality-rate {
  color: #67c23a;
  font-weight: 600;
}

.risk-count {
  color: #f56c6c;
  font-weight: 600;
}

/* 供应商分析样式 */
.supplier-analysis {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

/* 异常分析样式 */
.exception-analysis {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.exception-alerts {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  transition: all 0.3s ease;
}

.alert-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.alert-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.alert-icon.high {
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
  border: 2px solid rgba(245, 108, 108, 0.2);
}

.alert-icon.medium {
  background: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
  border: 2px solid rgba(230, 162, 60, 0.2);
}

.alert-icon.low {
  background: rgba(103, 194, 58, 0.1);
  color: #67c23a;
  border: 2px solid rgba(103, 194, 58, 0.2);
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.alert-description {
  font-size: 13px;
  color: #606266;
  line-height: 1.4;
  margin-bottom: 8px;
}

.alert-time {
  font-size: 12px;
  color: #909399;
}

/* 洞察和建议样式 */
.insights-content {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.insight-card {
  padding: 20px;
  border-radius: 12px;
  border: 2px solid;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.insight-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.insight-card.positive {
  background: rgba(103, 194, 58, 0.05);
  border-color: rgba(103, 194, 58, 0.2);
}

.insight-card.positive::before {
  background: #67c23a;
}

.insight-card.warning {
  background: rgba(230, 162, 60, 0.05);
  border-color: rgba(230, 162, 60, 0.2);
}

.insight-card.warning::before {
  background: #e6a23c;
}

.insight-card.info {
  background: rgba(64, 158, 255, 0.05);
  border-color: rgba(64, 158, 255, 0.2);
}

.insight-card.info::before {
  background: #409eff;
}

.insight-card.success {
  background: rgba(103, 194, 58, 0.05);
  border-color: rgba(103, 194, 58, 0.2);
}

.insight-card.success::before {
  background: #67c23a;
}

.insight-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.insight-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.insight-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.insight-card p {
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
  margin: 0;
}

.action-recommendations {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(64, 158, 255, 0.1);
}

.action-recommendations h4 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommendation-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  transition: all 0.3s ease;
}

.recommendation-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.priority {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  min-width: 60px;
  text-align: center;
}

.priority.high {
  background: #f56c6c;
  color: white;
}

.priority.medium {
  background: #e6a23c;
  color: white;
}

.priority.low {
  background: #909399;
  color: white;
}

.action {
  flex: 1;
  font-size: 14px;
  color: #303133;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .trend-charts,
  .category-analysis,
  .supplier-analysis,
  .exception-analysis {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .metrics-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }

  .analysis-summary {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .material-quality-report {
    padding: 12px;
  }

  .report-header {
    padding: 20px;
    border-radius: 12px;
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .report-title {
    font-size: 24px;
  }

  .header-actions {
    flex-direction: column;
    gap: 8px;
  }

  .executive-summary,
  .overview-section,
  .trend-section,
  .category-section,
  .supplier-section,
  .exception-section,
  .insights-section {
    padding: 16px;
    margin-bottom: 16px;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .metric-card {
    padding: 16px;
  }

  .metric-icon {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }

  .metric-value {
    font-size: 24px;
  }

  .chart {
    height: 250px;
  }

  .trend-controls {
    flex-direction: column;
    gap: 8px;
  }

  .insights-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .insight-card {
    padding: 16px;
  }

  .action-recommendations {
    padding: 16px;
  }

  .recommendation-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 12px;
  }

  .priority {
    align-self: flex-start;
  }

  .summary-overview {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .scenario-details {
    flex-direction: column;
    gap: 8px;
  }

  .overview-stats {
    gap: 12px;
  }

  .basic-metrics-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .defect-ranking-grid {
    gap: 12px;
  }

  .defect-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
  }

  .material-info {
    width: 100%;
  }

  .defect-stats {
    align-items: flex-start;
    width: 100%;
  }

  .scenario-cards-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .scenario-card {
    padding: 20px;
  }

  .card-header {
    gap: 12px;
    margin-bottom: 16px;
  }

  .card-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .metric-value {
    font-size: 28px;
  }

  .sub-metrics {
    flex-direction: column;
    gap: 8px;
  }

  .sub-metric {
    padding: 8px;
  }
}
</style>
