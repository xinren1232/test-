/**
 * 回复格式化服务
 * 优化问答结构和显示格式
 */

class ResponseFormatterService {
  
  /**
   * 格式化库存查询结果 - 卡片式布局
   */
  formatInventoryResults(results, title = '库存') {
    if (!results || results.length === 0) {
      return this.formatEmptyResult('库存', title);
    }

    // 按状态分组
    const groupedResults = this.groupByStatus(results);
    
    let html = `
<div class="query-results inventory-results">
  <div class="result-header">
    <h3><i class="icon-inventory">📦</i> ${title}查询结果</h3>
    <div class="result-summary">
      <span class="total-badge">共 <strong>${results.length}</strong> 条记录</span>
      ${this.generateStatusSummary(groupedResults)}
    </div>
  </div>
`;

    // 按状态显示结果
    Object.entries(groupedResults).forEach(([status, items]) => {
      const statusConfig = this.getStatusConfig(status);
      
      html += `
  <div class="status-section">
    <div class="status-header ${statusConfig.class}">
      <span class="status-icon">${statusConfig.icon}</span>
      <span class="status-title">${status}状态</span>
      <span class="status-count">${items.length}条</span>
    </div>
    <div class="items-container">`;
      
      items.forEach((item, index) => {
        html += this.formatInventoryCard(item, index);
      });
      
      html += `
    </div>
  </div>`;
    });

    html += `
</div>`;

    return html;
  }

  /**
   * 格式化库存卡片
   */
  formatInventoryCard(item, index) {
    return `
      <div class="item-card">
        <div class="card-header">
          <div class="item-title">
            <span class="item-icon">📋</span>
            <span class="item-name">${item.materialName || '未知物料'}</span>
          </div>
          <div class="item-status ${this.getStatusClass(item.status)}">
            ${item.status || '未知'}
          </div>
        </div>
        <div class="card-body">
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">🏷️ 编码</span>
              <span class="detail-value">${item.materialCode || 'N/A'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">🔢 批次</span>
              <span class="detail-value">${item.batchNo || 'N/A'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">🏢 供应商</span>
              <span class="detail-value">${item.supplier || 'N/A'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">📊 数量</span>
              <span class="detail-value quantity">${item.quantity || 0}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">🏭 工厂</span>
              <span class="detail-value">${item.factory || 'N/A'}</span>
            </div>
            ${item.warehouse ? `
            <div class="detail-item">
              <span class="detail-label">📍 仓库</span>
              <span class="detail-value">${item.warehouse}</span>
            </div>` : ''}
            ${item.inspectionDate ? `
            <div class="detail-item">
              <span class="detail-label">📅 检验</span>
              <span class="detail-value">${item.inspectionDate}</span>
            </div>` : ''}
          </div>
        </div>
      </div>`;
  }

  /**
   * 格式化检验查询结果
   */
  formatInspectionResults(results, title = '检验') {
    if (!results || results.length === 0) {
      return this.formatEmptyResult('检验', title);
    }

    // 按测试结果分组
    const groupedResults = this.groupByTestResult(results);
    
    let html = `
<div class="query-results inspection-results">
  <div class="result-header">
    <h3><i class="icon-test">🧪</i> ${title}查询结果</h3>
    <div class="result-summary">
      <span class="total-badge">共 <strong>${results.length}</strong> 条记录</span>
      ${this.generateTestResultSummary(groupedResults)}
    </div>
  </div>
`;

    // 按测试结果显示
    Object.entries(groupedResults).forEach(([result, items]) => {
      const resultConfig = this.getTestResultConfig(result);
      
      html += `
  <div class="test-section">
    <div class="test-header ${resultConfig.class}">
      <span class="test-icon">${resultConfig.icon}</span>
      <span class="test-title">${result}结果</span>
      <span class="test-count">${items.length}条</span>
    </div>
    <div class="test-items">`;
      
      items.forEach((item, index) => {
        html += this.formatInspectionCard(item, index);
      });
      
      html += `
    </div>
  </div>`;
    });

    html += `
</div>`;

    return html;
  }

  /**
   * 格式化检验卡片
   */
  formatInspectionCard(item, index) {
    return `
      <div class="test-card">
        <div class="card-header">
          <div class="test-title">
            <span class="test-icon">📋</span>
            <span class="test-name">${item.materialName || '未知物料'}</span>
          </div>
          <div class="test-result ${this.getTestResultClass(item.testResult)}">
            ${item.testResult || '未知'}
          </div>
        </div>
        <div class="card-body">
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">🔢 批次</span>
              <span class="detail-value">${item.batchNo || 'N/A'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">🏢 供应商</span>
              <span class="detail-value">${item.supplier || 'N/A'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">📅 测试日期</span>
              <span class="detail-value">${item.testDate || 'N/A'}</span>
            </div>
            ${item.defectDescription ? `
            <div class="detail-item full-width">
              <span class="detail-label">📝 缺陷描述</span>
              <span class="detail-value">${item.defectDescription}</span>
            </div>` : ''}
          </div>
        </div>
      </div>`;
  }

  /**
   * 格式化空结果
   */
  formatEmptyResult(type, title) {
    return `
<div class="empty-result">
  <div class="empty-icon">${this.getTypeIcon(type)}</div>
  <h3>未找到${title}记录</h3>
  <p>没有符合查询条件的数据</p>
  <div class="suggestions">
    <h4>💡 建议：</h4>
    <ul>
      <li>检查查询条件是否正确</li>
      <li>尝试使用其他关键词</li>
      <li>查看所有${type}记录</li>
    </ul>
  </div>
</div>`;
  }

  /**
   * 按状态分组
   */
  groupByStatus(results) {
    return results.reduce((acc, item) => {
      const status = item.status || '未知';
      if (!acc[status]) acc[status] = [];
      acc[status].push(item);
      return acc;
    }, {});
  }

  /**
   * 按测试结果分组
   */
  groupByTestResult(results) {
    return results.reduce((acc, item) => {
      const result = item.testResult || '未知';
      if (!acc[result]) acc[result] = [];
      acc[result].push(item);
      return acc;
    }, {});
  }

  /**
   * 获取状态配置
   */
  getStatusConfig(status) {
    const configs = {
      '正常': { icon: '✅', class: 'status-normal' },
      '风险': { icon: '⚠️', class: 'status-warning' },
      '冻结': { icon: '❄️', class: 'status-danger' },
      '未知': { icon: '❓', class: 'status-unknown' }
    };
    return configs[status] || configs['未知'];
  }

  /**
   * 获取测试结果配置
   */
  getTestResultConfig(result) {
    const configs = {
      'PASS': { icon: '✅', class: 'test-pass' },
      'FAIL': { icon: '❌', class: 'test-fail' },
      '未知': { icon: '❓', class: 'test-unknown' }
    };
    return configs[result] || configs['未知'];
  }

  /**
   * 获取状态样式类
   */
  getStatusClass(status) {
    const classes = {
      '正常': 'normal',
      '风险': 'warning', 
      '冻结': 'danger'
    };
    return classes[status] || 'unknown';
  }

  /**
   * 获取测试结果样式类
   */
  getTestResultClass(result) {
    const classes = {
      'PASS': 'pass',
      'FAIL': 'fail'
    };
    return classes[result] || 'unknown';
  }

  /**
   * 获取类型图标
   */
  getTypeIcon(type) {
    const icons = {
      '库存': '📦',
      '检验': '🧪',
      '生产': '🏭'
    };
    return icons[type] || '📋';
  }

  /**
   * 生成状态摘要
   */
  generateStatusSummary(groupedResults) {
    const summaryItems = Object.entries(groupedResults).map(([status, items]) => {
      const config = this.getStatusConfig(status);
      return `<span class="summary-item ${config.class}">${config.icon} ${status}: ${items.length}</span>`;
    });
    return `<div class="status-summary">${summaryItems.join('')}</div>`;
  }

  /**
   * 生成测试结果摘要
   */
  generateTestResultSummary(groupedResults) {
    const summaryItems = Object.entries(groupedResults).map(([result, items]) => {
      const config = this.getTestResultConfig(result);
      return `<span class="summary-item ${config.class}">${config.icon} ${result}: ${items.length}</span>`;
    });
    return `<div class="test-summary">${summaryItems.join('')}</div>`;
  }

  /**
   * 格式化生产查询结果
   */
  formatProductionResults(results, title = '生产') {
    if (!results || results.length === 0) {
      return this.formatEmptyResult('生产', title);
    }

    let html = `
<div class="query-results production-results">
  <div class="result-header">
    <h3><i class="icon-production">🏭</i> ${title}查询结果</h3>
    <div class="result-summary">
      <span class="total-badge">共 <strong>${results.length}</strong> 条记录</span>
    </div>
  </div>
  <div class="items-container">`;

    results.forEach((item, index) => {
      html += this.formatProductionCard(item, index);
    });

    html += `
  </div>
</div>`;

    return html;
  }

  /**
   * 格式化生产记录卡片
   */
  formatProductionCard(item, index) {
    const defectRateClass = this.getDefectRateClass(item.defectRate);

    return `
    <div class="item-card production-card">
      <div class="card-header">
        <span class="item-number">#${index + 1}</span>
        <span class="material-name">${item.materialName || '未知物料'}</span>
        <span class="defect-rate ${defectRateClass}">${item.defectRate || 0}%</span>
      </div>
      <div class="card-content">
        <div class="info-row">
          <span class="label">📋 物料编码:</span>
          <span class="value">${item.materialCode || '未知'}</span>
        </div>
        <div class="info-row">
          <span class="label">🔢 批次号:</span>
          <span class="value">${item.batchNo || '未知'}</span>
        </div>
        <div class="info-row">
          <span class="label">🏢 供应商:</span>
          <span class="value">${item.supplier || '未知'}</span>
        </div>
        <div class="info-row">
          <span class="label">🏭 工厂:</span>
          <span class="value">${item.factory || '未知'}</span>
        </div>
        <div class="info-row">
          <span class="label">🔧 产线:</span>
          <span class="value">${item.line || '未知'}</span>
        </div>
        <div class="info-row">
          <span class="label">📅 上线时间:</span>
          <span class="value">${item.onlineTime || '未知'}</span>
        </div>
        ${item.defect ? `
        <div class="info-row">
          <span class="label">⚠️ 不良现象:</span>
          <span class="value defect-info">${item.defect}</span>
        </div>` : ''}
        ${item.projectId ? `
        <div class="info-row">
          <span class="label">📋 项目ID:</span>
          <span class="value">${item.projectId}</span>
        </div>` : ''}
      </div>
    </div>`;
  }

  /**
   * 获取不良率等级样式
   */
  getDefectRateClass(defectRate) {
    const rate = parseFloat(defectRate) || 0;
    if (rate === 0) return 'excellent';
    if (rate < 1) return 'good';
    if (rate < 3) return 'warning';
    return 'danger';
  }

  /**
   * 格式化批次追溯结果
   */
  formatBatchTrace(traceData) {
    const { batchNo, inventory, inspection, production } = traceData;

    let html = `
<div class="query-results batch-trace-results">
  <div class="result-header">
    <h3><i class="icon-trace">🔍</i> 批次全链路追溯</h3>
    <div class="batch-info">
      <span class="batch-number">批次号: <strong>${batchNo}</strong></span>
    </div>
  </div>`;

    // 库存信息
    if (inventory.length > 0) {
      const item = inventory[0];
      html += `
  <div class="trace-section inventory-section">
    <div class="section-header">
      <span class="section-icon">📦</span>
      <span class="section-title">库存信息</span>
    </div>
    <div class="trace-card">
      <div class="info-grid">
        <div class="info-item">
          <span class="label">物料名称:</span>
          <span class="value">${item.materialName}</span>
        </div>
        <div class="info-item">
          <span class="label">物料编码:</span>
          <span class="value">${item.materialCode}</span>
        </div>
        <div class="info-item">
          <span class="label">供应商:</span>
          <span class="value">${item.supplier}</span>
        </div>
        <div class="info-item">
          <span class="label">数量:</span>
          <span class="value">${item.quantity}</span>
        </div>
        <div class="info-item">
          <span class="label">状态:</span>
          <span class="value status-${item.status}">${item.status}</span>
        </div>
        <div class="info-item">
          <span class="label">工厂:</span>
          <span class="value">${item.factory}</span>
        </div>
        <div class="info-item">
          <span class="label">入库时间:</span>
          <span class="value">${item.inboundTime}</span>
        </div>
      </div>
    </div>
  </div>`;
    }

    // 测试记录
    if (inspection.length > 0) {
      html += `
  <div class="trace-section inspection-section">
    <div class="section-header">
      <span class="section-icon">🧪</span>
      <span class="section-title">测试记录</span>
      <span class="section-count">${inspection.length}条</span>
    </div>`;

      inspection.forEach((item, index) => {
        const resultClass = item.testResult === 'PASS' ? 'pass' : 'fail';
        html += `
    <div class="trace-card test-card">
      <div class="test-header">
        <span class="test-number">测试 #${index + 1}</span>
        <span class="test-result ${resultClass}">${item.testResult}</span>
        <span class="test-date">${item.testDate}</span>
      </div>
      ${item.defectDescription ? `
      <div class="test-defect">
        <span class="label">不良描述:</span>
        <span class="value">${item.defectDescription}</span>
      </div>` : ''}
    </div>`;
      });

      html += `
  </div>`;
    }

    // 生产记录
    if (production.length > 0) {
      html += `
  <div class="trace-section production-section">
    <div class="section-header">
      <span class="section-icon">🏭</span>
      <span class="section-title">生产记录</span>
      <span class="section-count">${production.length}条</span>
    </div>`;

      production.forEach((item, index) => {
        const defectRateClass = this.getDefectRateClass(item.defectRate);
        html += `
    <div class="trace-card production-card">
      <div class="production-header">
        <span class="production-number">生产 #${index + 1}</span>
        <span class="defect-rate ${defectRateClass}">${item.defectRate}%</span>
        <span class="production-date">${item.onlineTime}</span>
      </div>
      <div class="production-info">
        <div class="info-item">
          <span class="label">工厂:</span>
          <span class="value">${item.factory}</span>
        </div>
        <div class="info-item">
          <span class="label">产线:</span>
          <span class="value">${item.line}</span>
        </div>
        ${item.defect ? `
        <div class="info-item">
          <span class="label">不良现象:</span>
          <span class="value defect-info">${item.defect}</span>
        </div>` : ''}
      </div>
    </div>`;
      });

      html += `
  </div>`;
    }

    html += `
</div>`;

    return html;
  }

  /**
   * 格式化工厂汇总统计
   */
  formatFactorySummary(factoryStats) {
    let html = `
<div class="query-results factory-summary-results">
  <div class="result-header">
    <h3><i class="icon-factory">🏭</i> 工厂数据汇总报告</h3>
    <div class="result-summary">
      <span class="total-badge">共 <strong>${Object.keys(factoryStats).length}</strong> 个工厂</span>
      <span class="timestamp">📅 ${new Date().toLocaleString()}</span>
    </div>
  </div>
  <div class="summary-container">`;

    Object.entries(factoryStats).forEach(([factory, stats]) => {
      const riskLevel = this.getRiskLevel(stats.riskItems, stats.inventory);
      const riskClass = this.getRiskClass(riskLevel);

      html += `
    <div class="summary-card factory-card">
      <div class="card-header">
        <span class="factory-name">🏭 ${factory}</span>
        <span class="risk-badge ${riskClass}">${riskLevel}</span>
      </div>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-icon">📊</span>
          <span class="stat-label">库存总量</span>
          <span class="stat-value">${stats.inventory}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">⚠️</span>
          <span class="stat-label">风险物料</span>
          <span class="stat-value">${stats.riskItems} 种</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">🧊</span>
          <span class="stat-label">冻结物料</span>
          <span class="stat-value">${stats.frozenItems} 种</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">🏭</span>
          <span class="stat-label">生产记录</span>
          <span class="stat-value">${stats.production} 条</span>
        </div>
      </div>
    </div>`;
    });

    html += `
  </div>
</div>`;

    return html;
  }

  /**
   * 格式化供应商汇总统计
   */
  formatSupplierSummary(supplierStats) {
    let html = `
<div class="query-results supplier-summary-results">
  <div class="result-header">
    <h3><i class="icon-supplier">🏢</i> 供应商数据汇总</h3>
    <div class="result-summary">
      <span class="total-badge">共 <strong>${Object.keys(supplierStats).length}</strong> 个供应商</span>
    </div>
  </div>
  <div class="summary-container">`;

    Object.entries(supplierStats).forEach(([supplier, stats]) => {
      const failRate = stats.testRecords > 0 ? ((stats.failedTests / stats.testRecords) * 100).toFixed(1) : 0;
      const performanceClass = this.getSupplierPerformanceClass(failRate);

      html += `
    <div class="summary-card supplier-card">
      <div class="card-header">
        <span class="supplier-name">🏢 ${supplier}</span>
        <span class="performance-badge ${performanceClass}">${failRate}% 不良率</span>
      </div>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-icon">📦</span>
          <span class="stat-label">供货总量</span>
          <span class="stat-value">${stats.totalQuantity}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">🚨</span>
          <span class="stat-label">风险物料</span>
          <span class="stat-value">${stats.riskItems} 项</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">🧪</span>
          <span class="stat-label">测试记录</span>
          <span class="stat-value">${stats.testRecords} 条</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">❌</span>
          <span class="stat-label">不合格测试</span>
          <span class="stat-value">${stats.failedTests} 条</span>
        </div>
      </div>
    </div>`;
    });

    html += `
  </div>
</div>`;

    return html;
  }

  /**
   * 格式化总体概况统计
   */
  formatOverallSummary(summaryData) {
    const { totalInventory, totalInspection, totalProduction, riskItems, frozenItems, failedTests } = summaryData;
    const testPassRate = totalInspection > 0 ? (((totalInspection - failedTests) / totalInspection) * 100).toFixed(1) : 100;

    let html = `
<div class="query-results overall-summary-results">
  <div class="result-header">
    <h3><i class="icon-overview">📊</i> 系统数据总览</h3>
    <div class="result-summary">
      <span class="timestamp">📅 ${new Date().toLocaleString()}</span>
    </div>
  </div>
  <div class="overview-container">
    <div class="overview-section data-overview">
      <div class="section-title">📈 数据统计</div>
      <div class="overview-grid">
        <div class="overview-item">
          <span class="overview-icon">📦</span>
          <span class="overview-label">库存记录</span>
          <span class="overview-value">${totalInventory} 条</span>
        </div>
        <div class="overview-item">
          <span class="overview-icon">🧪</span>
          <span class="overview-label">检验记录</span>
          <span class="overview-value">${totalInspection} 条</span>
        </div>
        <div class="overview-item">
          <span class="overview-icon">🏭</span>
          <span class="overview-label">生产记录</span>
          <span class="overview-value">${totalProduction} 条</span>
        </div>
      </div>
    </div>
    <div class="overview-section quality-overview">
      <div class="section-title">🎯 质量指标</div>
      <div class="overview-grid">
        <div class="overview-item risk">
          <span class="overview-icon">🚨</span>
          <span class="overview-label">风险物料</span>
          <span class="overview-value">${riskItems} 项</span>
        </div>
        <div class="overview-item frozen">
          <span class="overview-icon">🧊</span>
          <span class="overview-label">冻结物料</span>
          <span class="overview-value">${frozenItems} 项</span>
        </div>
        <div class="overview-item test-fail">
          <span class="overview-icon">❌</span>
          <span class="overview-label">不合格测试</span>
          <span class="overview-value">${failedTests} 条</span>
        </div>
        <div class="overview-item test-pass">
          <span class="overview-icon">✅</span>
          <span class="overview-label">测试通过率</span>
          <span class="overview-value">${testPassRate}%</span>
        </div>
      </div>
    </div>
  </div>
</div>`;

    return html;
  }

  /**
   * 获取风险等级
   */
  getRiskLevel(riskItems, totalItems) {
    if (totalItems === 0) return '无数据';
    const riskRatio = riskItems / totalItems;
    if (riskRatio === 0) return '低风险';
    if (riskRatio < 0.1) return '中风险';
    return '高风险';
  }

  /**
   * 获取风险等级样式
   */
  getRiskClass(riskLevel) {
    const classes = {
      '低风险': 'low-risk',
      '中风险': 'medium-risk',
      '高风险': 'high-risk',
      '无数据': 'no-data'
    };
    return classes[riskLevel] || 'no-data';
  }

  /**
   * 获取供应商表现等级样式
   */
  getSupplierPerformanceClass(failRate) {
    const rate = parseFloat(failRate);
    if (rate === 0) return 'excellent';
    if (rate < 5) return 'good';
    if (rate < 15) return 'warning';
    return 'poor';
  }

  /**
   * 格式化错误信息
   */
  formatError(message) {
    return `
<div class="query-results error-results">
  <div class="error-container">
    <div class="error-icon">⚠️</div>
    <div class="error-message">${message}</div>
  </div>
</div>`;
  }
}

const responseFormatterService = new ResponseFormatterService();
export default responseFormatterService;
