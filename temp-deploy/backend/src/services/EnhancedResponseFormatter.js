/**
 * 增强响应格式化服务
 * 支持结构化数据、图表和优化的UI展示
 */

class EnhancedResponseFormatter {
  
  /**
   * 格式化库存查询结果 - 结构化数据
   */
  static formatInventoryQuery(results, queryInfo = {}) {
    if (!results || results.length === 0) {
      return {
        type: 'empty_result',
        message: '未找到相关库存记录',
        suggestions: ['检查查询条件', '尝试其他关键词', '查看所有库存']
      };
    }

    // 计算关键指标
    const summary = this.calculateInventorySummary(results);
    
    // 生成图表数据
    const chartData = this.generateInventoryCharts(results);
    
    // 格式化详细数据
    const tableData = this.formatInventoryTable(results);

    return {
      type: 'inventory_query',
      title: queryInfo.title || '库存查询结果',
      timestamp: new Date().toISOString(),
      summary: summary,
      charts: chartData,
      table: tableData,
      actions: [
        { label: '导出数据', action: 'export', icon: '📊' },
        { label: '查看详情', action: 'detail', icon: '🔍' },
        { label: '风险分析', action: 'risk_analysis', icon: '⚠️' }
      ]
    };
  }

  /**
   * 计算库存汇总信息
   */
  static calculateInventorySummary(results) {
    const totalQuantity = results.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
    const statusCounts = this.groupByField(results, 'status');
    const supplierCounts = this.groupByField(results, 'supplier_name');
    const materialCounts = this.groupByField(results, 'material_name');

    return {
      totalBatches: results.length,
      totalQuantity: totalQuantity.toLocaleString(),
      statusBreakdown: statusCounts,
      topSuppliers: Object.entries(supplierCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([name, count]) => ({ name, count })),
      materialTypes: Object.keys(materialCounts).length,
      riskItems: statusCounts['风险'] || statusCounts['RISK'] || 0
    };
  }

  /**
   * 生成库存图表数据
   */
  static generateInventoryCharts(results) {
    return {
      statusPie: {
        type: 'pie',
        title: '库存状态分布',
        data: Object.entries(this.groupByField(results, 'status')).map(([name, value]) => ({
          name: name || '未知',
          value,
          color: this.getStatusColor(name)
        }))
      },
      supplierBar: {
        type: 'bar',
        title: '供应商物料分布',
        data: Object.entries(this.groupByField(results, 'supplier_name'))
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([name, value]) => ({
            name: name || '未知供应商',
            value
          }))
      },
      trendLine: {
        type: 'line',
        title: '入库时间趋势',
        data: this.generateTimeTrend(results, 'inbound_time')
      }
    };
  }

  /**
   * 格式化库存表格数据
   */
  static formatInventoryTable(results) {
    return {
      columns: [
        { key: 'material_name', title: '物料名称', width: '20%' },
        { key: 'supplier_name', title: '供应商', width: '15%' },
        { key: 'batch_number', title: '批次号', width: '15%' },
        { key: 'quantity', title: '数量', width: '10%', align: 'right' },
        { key: 'status', title: '状态', width: '10%', type: 'status' },
        { key: 'factory', title: '工厂', width: '15%' },
        { key: 'inbound_time', title: '入库时间', width: '15%', type: 'date' }
      ],
      rows: results.slice(0, 50).map(item => ({
        id: item.batch_number || Math.random().toString(36),
        material_name: item.material_name || item.material_code || '未知物料',
        supplier_name: item.supplier_name || '未知供应商',
        batch_number: item.batch_number || '无批次号',
        quantity: (item.quantity || 0).toLocaleString(),
        status: {
          value: item.status || '正常',
          color: this.getStatusColor(item.status),
          icon: this.getStatusIcon(item.status)
        },
        factory: item.factory || '未知工厂',
        inbound_time: this.formatDate(item.inbound_time)
      })),
      pagination: {
        current: 1,
        pageSize: 50,
        total: results.length,
        hasMore: results.length > 50
      }
    };
  }

  /**
   * 格式化质量分析结果
   */
  static formatQualityAnalysis(inspectionData, queryInfo = {}) {
    if (!inspectionData || inspectionData.length === 0) {
      return {
        type: 'empty_result',
        message: '暂无质量检验数据'
      };
    }

    const summary = this.calculateQualitySummary(inspectionData);
    const charts = this.generateQualityCharts(inspectionData);
    const insights = this.generateQualityInsights(summary);

    return {
      type: 'quality_analysis',
      title: '质量分析报告',
      timestamp: new Date().toISOString(),
      summary: summary,
      charts: charts,
      insights: insights,
      recommendations: this.generateQualityRecommendations(summary),
      actions: [
        { label: '详细报告', action: 'detailed_report', icon: '📋' },
        { label: '趋势分析', action: 'trend_analysis', icon: '📈' },
        { label: '改进建议', action: 'improvement_plan', icon: '💡' }
      ]
    };
  }

  /**
   * 计算质量汇总信息
   */
  static calculateQualitySummary(data) {
    const totalTests = data.length;
    const passedTests = data.filter(item => 
      item.test_result === 'PASS' || item.test_result === '合格'
    ).length;
    const failedTests = totalTests - passedTests;
    const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : 0;

    // 按供应商统计
    const supplierStats = {};
    data.forEach(item => {
      const supplier = item.supplier_name || '未知供应商';
      if (!supplierStats[supplier]) {
        supplierStats[supplier] = { total: 0, passed: 0 };
      }
      supplierStats[supplier].total++;
      if (item.test_result === 'PASS' || item.test_result === '合格') {
        supplierStats[supplier].passed++;
      }
    });

    return {
      totalTests,
      passedTests,
      failedTests,
      passRate: parseFloat(passRate),
      qualityGrade: this.getQualityGrade(passRate),
      supplierPerformance: Object.entries(supplierStats).map(([name, stats]) => ({
        name,
        total: stats.total,
        passed: stats.passed,
        rate: ((stats.passed / stats.total) * 100).toFixed(2)
      })).sort((a, b) => b.rate - a.rate)
    };
  }

  /**
   * 生成质量图表数据
   */
  static generateQualityCharts(data) {
    return {
      passRateGauge: {
        type: 'gauge',
        title: '整体合格率',
        value: this.calculatePassRate(data),
        max: 100,
        unit: '%',
        thresholds: [
          { value: 95, color: '#52c41a', label: '优秀' },
          { value: 85, color: '#faad14', label: '良好' },
          { value: 70, color: '#ff7875', label: '一般' },
          { value: 0, color: '#ff4d4f', label: '需改进' }
        ]
      },
      supplierComparison: {
        type: 'bar',
        title: '供应商质量对比',
        data: this.getSupplierQualityData(data)
      },
      defectTrend: {
        type: 'line',
        title: '不良率趋势',
        data: this.generateDefectTrend(data)
      }
    };
  }

  // 工具方法
  static groupByField(data, field) {
    return data.reduce((acc, item) => {
      const key = item[field] || '未知';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  static getStatusColor(status) {
    const colorMap = {
      '正常': '#52c41a',
      'NORMAL': '#52c41a',
      '风险': '#ff4d4f',
      'RISK': '#ff4d4f',
      '警告': '#faad14',
      'WARNING': '#faad14'
    };
    return colorMap[status] || '#d9d9d9';
  }

  static getStatusIcon(status) {
    const iconMap = {
      '正常': '✅',
      'NORMAL': '✅',
      '风险': '⚠️',
      'RISK': '⚠️',
      '警告': '⚡',
      'WARNING': '⚡'
    };
    return iconMap[status] || '❓';
  }

  static formatDate(dateStr) {
    if (!dateStr) return '未知';
    try {
      return new Date(dateStr).toLocaleDateString('zh-CN');
    } catch {
      return dateStr;
    }
  }

  static getQualityGrade(passRate) {
    if (passRate >= 95) return { grade: 'A', label: '优秀', color: '#52c41a' };
    if (passRate >= 85) return { grade: 'B', label: '良好', color: '#faad14' };
    if (passRate >= 70) return { grade: 'C', label: '一般', color: '#ff7875' };
    return { grade: 'D', label: '需改进', color: '#ff4d4f' };
  }

  static calculatePassRate(data) {
    if (!data || data.length === 0) return 0;
    const passed = data.filter(item => 
      item.test_result === 'PASS' || item.test_result === '合格'
    ).length;
    return ((passed / data.length) * 100).toFixed(2);
  }

  static generateQualityInsights(summary) {
    const insights = [];
    
    if (summary.passRate >= 95) {
      insights.push({
        type: 'positive',
        icon: '🎉',
        title: '质量表现优秀',
        content: `当前合格率${summary.passRate}%，超过95%优秀标准`
      });
    } else if (summary.passRate < 70) {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        title: '质量需要改进',
        content: `当前合格率${summary.passRate}%，低于70%基准线，需要立即关注`
      });
    }

    // 供应商表现分析
    const topSupplier = summary.supplierPerformance[0];
    if (topSupplier) {
      insights.push({
        type: 'info',
        icon: '🏆',
        title: '最佳供应商',
        content: `${topSupplier.name}表现最佳，合格率${topSupplier.rate}%`
      });
    }

    return insights;
  }

  static generateQualityRecommendations(summary) {
    const recommendations = [];

    if (summary.passRate < 85) {
      recommendations.push('加强供应商质量管控');
      recommendations.push('优化进料检验流程');
      recommendations.push('建立质量追溯机制');
    }

    if (summary.failedTests > 10) {
      recommendations.push('分析主要不良原因');
      recommendations.push('制定针对性改进措施');
    }

    return recommendations;
  }

  // 生成时间趋势数据
  static generateTimeTrend(data, timeField) {
    if (!data || data.length === 0) return [];

    // 按日期分组统计
    const dateGroups = {};
    data.forEach(item => {
      if (item[timeField]) {
        const date = new Date(item[timeField]).toDateString();
        dateGroups[date] = (dateGroups[date] || 0) + 1;
      }
    });

    return Object.entries(dateGroups)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('zh-CN'),
        value: count
      }));
  }

  // 获取供应商质量数据
  static getSupplierQualityData(data) {
    const supplierStats = {};

    data.forEach(item => {
      const supplier = item.supplier_name || '未知供应商';
      if (!supplierStats[supplier]) {
        supplierStats[supplier] = { total: 0, passed: 0 };
      }
      supplierStats[supplier].total++;
      if (item.test_result === 'PASS' || item.test_result === '合格') {
        supplierStats[supplier].passed++;
      }
    });

    return Object.entries(supplierStats)
      .map(([name, stats]) => ({
        name,
        value: ((stats.passed / stats.total) * 100).toFixed(2)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }

  // 生成不良率趋势
  static generateDefectTrend(data) {
    if (!data || data.length === 0) return [];

    // 按日期分组计算不良率
    const dateGroups = {};
    data.forEach(item => {
      if (item.test_date) {
        const date = new Date(item.test_date).toDateString();
        if (!dateGroups[date]) {
          dateGroups[date] = { total: 0, failed: 0 };
        }
        dateGroups[date].total++;
        if (item.test_result === 'FAIL' || item.test_result === '不合格') {
          dateGroups[date].failed++;
        }
      }
    });

    return Object.entries(dateGroups)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, stats]) => ({
        date: new Date(date).toLocaleDateString('zh-CN'),
        value: stats.total > 0 ? ((stats.failed / stats.total) * 100).toFixed(2) : 0
      }));
  }
}

export default EnhancedResponseFormatter;
