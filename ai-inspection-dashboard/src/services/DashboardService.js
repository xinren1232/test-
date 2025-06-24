/**
 * 仪表盘服务
 * 集成库存、实验室和质量管理数据，提供统一的指标和预警
 */
import { ref, computed } from 'vue';
import inventoryService, { INVENTORY_STATUS } from './InventoryService';
import laboratoryService, { TEST_RESULTS } from './LaboratoryService';
import qualityService, { QUALITY_EVENT_STATUS, RISK_LEVELS } from './QualityService';

class DashboardService {
  constructor() {
    this.dashboardData = ref(null);
    this.alerts = ref([]);
    this.initialized = false;
    this.lastRefreshedTime = null;
    
    // 预警类型
    this.ALERT_TYPES = {
      HIGH_RISK: 'high_risk',       // 高风险预警
      QUALITY_ISSUE: 'quality_issue', // 质量问题
      INVENTORY: 'inventory',       // 库存预警
      PERFORMANCE: 'performance'    // 性能指标
    };
    
    // 预警级别
    this.ALERT_LEVELS = {
      CRITICAL: 'critical',   // 紧急
      WARNING: 'warning',     // 警告
      NOTICE: 'notice'        // 通知
    };
  }

  /**
   * 初始化仪表盘数据
   */
  async initialize() {
    if (this.initialized) return;
    
    // 确保依赖的服务已初始化
    if (!inventoryService.initialized) {
      await inventoryService.initialize();
    }
    if (!laboratoryService.initialized) {
      await laboratoryService.initialize();
    }
    if (!qualityService.initialized) {
      await qualityService.initialize();
    }
    
    // 生成仪表盘数据
    await this.refreshData();
    
    this.initialized = true;
    return true;
  }

  /**
   * 刷新仪表盘数据
   */
  async refreshData() {
    try {
      // 获取库存统计（检查方法是否存在）
      let inventoryStats = { total: 0, byStatus: {}, byQualityGrade: {} };
      let attentionInventory = [];
      
      if (typeof inventoryService.getInventoryStats === 'function') {
        inventoryStats = inventoryService.getInventoryStats();
      } else {
        // 使用替代方法
        const allItems = inventoryService.getAllItems();
        inventoryStats.total = allItems.length;
        // 计算状态分布
        inventoryStats.byStatus = this._groupByProperty(allItems, 'status');
      }
      
      if (typeof inventoryService.getAttentionRequiredInventory === 'function') {
        attentionInventory = inventoryService.getAttentionRequiredInventory();
      } else {
        // 使用替代方法或创建空数组
        attentionInventory = [];
      }
      
      // 获取实验室数据
      let testRecords = [];
      let attentionTests = [];
      
      if (laboratoryService.getAllTestRecords) {
        testRecords = laboratoryService.getAllTestRecords();
      }
      
      if (laboratoryService.getAttentionRequiredTests) {
        attentionTests = laboratoryService.getAttentionRequiredTests();
      } else {
        // 使用替代方法
        attentionTests = [];
      }
      
      // 获取质量数据
      let qualityMetrics = { overview: {} };
      let qualityEvents = [];
      let attentionEvents = [];
      
      if (qualityService.getQualityMetrics) {
        qualityMetrics = qualityService.getQualityMetrics();
      }
      
      if (qualityService.getAllIssues) {
        qualityEvents = qualityService.getAllIssues();
      } else if (qualityService.getAllQualityEvents) {
        qualityEvents = qualityService.getAllQualityEvents();
      }
      
      if (qualityService.getAttentionRequiredEvents) {
        attentionEvents = qualityService.getAttentionRequiredEvents();
      } else {
        // 使用替代方法
        attentionEvents = [];
      }
      
      // 计算关键绩效指标 (KPI)
      const kpis = this.calculateKPIs(inventoryStats, testRecords, qualityEvents);
      
      // 生成趋势图数据
      const trends = this.generateTrendData();
      
      // 生成预警
      this.generateAlerts(attentionInventory, attentionTests, attentionEvents);
      
      // 计算综合得分
      const scores = this.calculateScores();
      
      // 设置仪表盘数据
      this.dashboardData.value = {
        kpis,
        inventory: {
          total: inventoryStats.total,
          byStatus: inventoryStats.byStatus,
          byQualityGrade: inventoryStats.byQualityGrade,
          attentionRequired: attentionInventory.length
        },
        laboratory: {
          total: testRecords.length,
          pass: testRecords.filter(r => r.overall_result === TEST_RESULTS.PASS).length,
          fail: testRecords.filter(r => r.overall_result === TEST_RESULTS.FAIL).length,
          attentionRequired: attentionTests.length
        },
        quality: {
          events: {
            total: qualityEvents.length,
            open: qualityEvents.filter(e => e.status !== QUALITY_EVENT_STATUS.CLOSED).length,
            closed: qualityEvents.filter(e => e.status === QUALITY_EVENT_STATUS.CLOSED).length,
            highRisk: qualityEvents.filter(e => e.riskLevel === RISK_LEVELS.HIGH).length,
            attentionRequired: attentionEvents.length
          },
          metrics: qualityMetrics.overview || {}
        },
        trends,
        scores
      };
      
      this.lastRefreshedTime = new Date();
    } catch (error) {
      console.error('刷新仪表盘数据失败:', error);
    }
  }

  /**
   * 按属性分组对象
   * @private
   */
  _groupByProperty(array, property) {
    return array.reduce((acc, item) => {
      const key = item[property];
      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key]++;
      return acc;
    }, {});
  }

  /**
   * 计算关键绩效指标
   */
  calculateKPIs(inventoryStats, testRecords, qualityEvents) {
    // 计算合格率
    const totalTests = testRecords.length;
    const passTests = testRecords.filter(r => r.overall_result === TEST_RESULTS.PASS).length;
    const passRate = totalTests > 0 ? (passTests / totalTests * 100).toFixed(2) : '0.00';
    
    // 计算库存冻结率
    const totalInventory = inventoryStats.total;
    const frozenInventory = inventoryStats.byStatus[INVENTORY_STATUS.FROZEN] || 0;
    const frozenRate = totalInventory > 0 ? (frozenInventory / totalInventory * 100).toFixed(2) : '0.00';
    
    // 计算质量事件解决率
    const totalEvents = qualityEvents.length;
    const closedEvents = qualityEvents.filter(e => e.status === QUALITY_EVENT_STATUS.CLOSED).length;
    const resolutionRate = totalEvents > 0 ? (closedEvents / totalEvents * 100).toFixed(2) : '0.00';
    
    // 计算高风险问题比例
    const highRiskEvents = qualityEvents.filter(e => e.riskLevel === RISK_LEVELS.HIGH).length;
    const highRiskRate = totalEvents > 0 ? (highRiskEvents / totalEvents * 100).toFixed(2) : '0.00';
    
    return {
      passRate: {
        value: passRate,
        unit: '%',
        target: '95.00',
        status: parseFloat(passRate) >= 95 ? 'good' : (parseFloat(passRate) >= 90 ? 'warning' : 'bad')
      },
      frozenRate: {
        value: frozenRate,
        unit: '%',
        target: '5.00',
        status: parseFloat(frozenRate) <= 5 ? 'good' : (parseFloat(frozenRate) <= 10 ? 'warning' : 'bad')
      },
      resolutionRate: {
        value: resolutionRate,
        unit: '%',
        target: '90.00',
        status: parseFloat(resolutionRate) >= 90 ? 'good' : (parseFloat(resolutionRate) >= 80 ? 'warning' : 'bad')
      },
      highRiskRate: {
        value: highRiskRate,
        unit: '%',
        target: '10.00',
        status: parseFloat(highRiskRate) <= 10 ? 'good' : (parseFloat(highRiskRate) <= 15 ? 'warning' : 'bad')
      }
    };
  }

  /**
   * 生成趋势图数据
   */
  generateTrendData() {
    try {
      // 处理质量指标趋势数据
      let qualityMetrics = { trend: [] };
      let passRateTrend = [];
      
      if (qualityService.getQualityMetrics) {
        qualityMetrics = qualityService.getQualityMetrics();
        passRateTrend = qualityMetrics.trend || [];
      }
      
      // 处理质量事件趋势数据
      let qualityEvents = [];
      if (qualityService.getAllQualityEvents) {
        qualityEvents = qualityService.getAllQualityEvents();
      } else if (qualityService.getAllIssues) {
        qualityEvents = qualityService.getAllIssues();
      }
      
      const eventsByMonth = this.groupEventsByMonth(qualityEvents);
      
      return {
        passRateTrend,
        eventsByMonth
      };
    } catch (error) {
      console.error('生成趋势数据失败:', error);
      return {
        passRateTrend: [],
        eventsByMonth: {}
      };
    }
  }
  
  /**
   * 按月份分组质量事件
   */
  groupEventsByMonth(events) {
    const groupedData = {};
    
    events.forEach(event => {
      const date = new Date(event.createDate);
      const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!groupedData[yearMonth]) {
        groupedData[yearMonth] = {
          month: yearMonth,
          total: 0,
          byStatus: {
            [QUALITY_EVENT_STATUS.OPEN]: 0,
            [QUALITY_EVENT_STATUS.INVESTIGATION]: 0,
            [QUALITY_EVENT_STATUS.ACTION]: 0,
            [QUALITY_EVENT_STATUS.VERIFICATION]: 0,
            [QUALITY_EVENT_STATUS.CLOSED]: 0
          },
          byRisk: {
            [RISK_LEVELS.HIGH]: 0,
            [RISK_LEVELS.MEDIUM]: 0,
            [RISK_LEVELS.LOW]: 0,
            [RISK_LEVELS.NEGLIGIBLE]: 0
          }
        };
      }
      
      groupedData[yearMonth].total++;
      groupedData[yearMonth].byStatus[event.status]++;
      groupedData[yearMonth].byRisk[event.riskLevel]++;
    });
    
    // 转换为数组并排序
    return Object.values(groupedData).sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * 生成预警信息
   */
  generateAlerts(attentionInventory, attentionTests, attentionEvents) {
    const alerts = [];
    
    // 添加高风险质量事件预警
    const highRiskEvents = attentionEvents.filter(e => 
      e.riskLevel === RISK_LEVELS.HIGH && e.status !== QUALITY_EVENT_STATUS.CLOSED
    );
    
    if (highRiskEvents.length > 0) {
      alerts.push({
        id: `ALT${(1).toString().padStart(3, '0')}`,
        type: this.ALERT_TYPES.HIGH_RISK,
        level: this.ALERT_LEVELS.CRITICAL,
        title: `${highRiskEvents.length}个高风险质量事件需要处理`,
        description: '有高风险质量事件尚未解决，请及时处理',
        data: highRiskEvents.slice(0, 5), // 最多显示5个
        timestamp: new Date().toISOString()
      });
    }
    
    // 添加质量测试失败预警
    const recentFailedTests = attentionTests.slice(0, 10); // 最近10个失败测试
    if (recentFailedTests.length > 0) {
      alerts.push({
        id: `ALT${(2).toString().padStart(3, '0')}`,
        type: this.ALERT_TYPES.QUALITY_ISSUE,
        level: this.ALERT_LEVELS.WARNING,
        title: `${recentFailedTests.length}个近期测试不合格`,
        description: '有测试结果不合格，可能影响产品质量',
        data: recentFailedTests,
        timestamp: new Date().toISOString()
      });
    }
    
    // 添加库存预警
    const frozenInventory = attentionInventory.filter(i => i.status === INVENTORY_STATUS.FROZEN);
    if (frozenInventory.length > 0) {
      alerts.push({
        id: `ALT${(3).toString().padStart(3, '0')}`,
        type: this.ALERT_TYPES.INVENTORY,
        level: frozenInventory.length > 5 ? this.ALERT_LEVELS.WARNING : this.ALERT_LEVELS.NOTICE,
        title: `${frozenInventory.length}个批次库存被冻结`,
        description: '有批次被冻结，请检查相关质量问题',
        data: frozenInventory.slice(0, 5), // 最多显示5个
        timestamp: new Date().toISOString()
      });
    }
    
    // 添加即将过期库存预警
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    
    const expiringInventory = attentionInventory.filter(i => {
      const expiryDate = new Date(i.expiry_date);
      return expiryDate <= thirtyDaysLater && expiryDate >= today;
    });
    
    if (expiringInventory.length > 0) {
      alerts.push({
        id: `ALT${(4).toString().padStart(3, '0')}`,
        type: this.ALERT_TYPES.INVENTORY,
        level: this.ALERT_LEVELS.NOTICE,
        title: `${expiringInventory.length}个批次将在30天内过期`,
        description: '有批次即将过期，请注意使用安排',
        data: expiringInventory.slice(0, 5), // 最多显示5个
        timestamp: new Date().toISOString()
      });
    }
    
    // 设置预警数据
    this.alerts.value = alerts;
  }

  /**
   * 计算综合评分
   */
  calculateScores() {
    if (!this.dashboardData.value || !this.dashboardData.value.kpis) {
      return {
        overall: 0,
        categories: {}
      };
    }
    
    const kpis = this.dashboardData.value.kpis;
    
    // 计算质量得分 (40%)
    const passRateScore = this.calculateMetricScore(kpis.passRate.value, 80, 95);
    const qualityScore = passRateScore * 0.4;
    
    // 计算库存得分 (30%)
    const frozenRateScore = 100 - this.calculateMetricScore(kpis.frozenRate.value, 0, 15);
    const inventoryScore = frozenRateScore * 0.3;
    
    // 计算风险处理得分 (30%)
    const resolutionRateScore = this.calculateMetricScore(kpis.resolutionRate.value, 70, 90);
    const highRiskRateScore = 100 - this.calculateMetricScore(kpis.highRiskRate.value, 0, 20);
    const riskScore = (resolutionRateScore * 0.6 + highRiskRateScore * 0.4) * 0.3;
    
    // 计算总分
    const overallScore = Math.round(qualityScore + inventoryScore + riskScore);
    
    return {
      overall: overallScore,
      categories: {
        quality: Math.round(passRateScore),
        inventory: Math.round(frozenRateScore),
        risk: {
          total: Math.round(resolutionRateScore * 0.6 + highRiskRateScore * 0.4),
          resolution: Math.round(resolutionRateScore),
          highRisk: Math.round(highRiskRateScore)
        }
      },
      lastUpdated: new Date().toISOString()
    };
  }
  
  /**
   * 计算单项指标得分
   */
  calculateMetricScore(value, min, max) {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 0;
    
    if (numValue <= min) return 0;
    if (numValue >= max) return 100;
    
    return Math.round((numValue - min) / (max - min) * 100);
  }

  /**
   * 获取仪表盘数据
   * @returns {Object} 仪表盘数据
   */
  getDashboardData() {
    return this.dashboardData.value;
  }

  /**
   * 获取预警信息
   * @returns {Array} 预警信息列表
   */
  getAlerts() {
    return this.alerts.value;
  }

  /**
   * 获取最新数据（刷新后）
   */
  async getLatestData() {
    await this.refreshData();
    return this.dashboardData.value;
  }
}

// 创建单例
const dashboardService = new DashboardService();

// 默认导出
export default dashboardService; 