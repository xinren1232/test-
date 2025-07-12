/**
 * 增强的问答呈现系统
 * 支持表格生成、图表展示和格式化输出
 */

import * as echarts from 'echarts';

export class EnhancedQAPresentation {
  constructor() {
    this.chartInstances = new Map();
  }

  /**
   * 格式化查询结果为表格
   * @param {Array} data 查询结果数据
   * @param {string} title 表格标题
   * @returns {Object} 格式化的表格对象
   */
  formatAsTable(data, title = '查询结果') {
    if (!data || data.length === 0) {
      return {
        type: 'table',
        title,
        message: '暂无数据',
        data: [],
        columns: []
      };
    }

    // 获取列名
    const columns = Object.keys(data[0]).map(key => ({
      key,
      title: key,
      width: this.calculateColumnWidth(key, data)
    }));

    return {
      type: 'table',
      title,
      columns,
      data: data.slice(0, 10), // 限制显示前10条
      total: data.length,
      hasMore: data.length > 10
    };
  }

  /**
   * 计算列宽度
   */
  calculateColumnWidth(key, data) {
    const maxLength = Math.max(
      key.length,
      ...data.slice(0, 5).map(row => String(row[key] || '').length)
    );
    return Math.min(Math.max(maxLength * 12, 100), 200);
  }

  /**
   * 格式化为统计卡片
   * @param {Array} data 统计数据
   * @param {string} title 标题
   * @returns {Object} 统计卡片对象
   */
  formatAsStatCards(data, title = '统计概览') {
    if (!data || data.length === 0) {
      return {
        type: 'stat_cards',
        title,
        cards: []
      };
    }

    const cards = data.map((item, index) => {
      const keys = Object.keys(item);
      return {
        id: index,
        title: item[keys[0]] || `项目${index + 1}`,
        value: item[keys[1]] || 0,
        unit: this.detectUnit(keys[1]),
        trend: this.calculateTrend(item),
        color: this.getCardColor(index)
      };
    });

    return {
      type: 'stat_cards',
      title,
      cards: cards.slice(0, 6) // 最多显示6个卡片
    };
  }

  /**
   * 检测数值单位
   */
  detectUnit(key) {
    if (key.includes('百分比') || key.includes('率')) return '%';
    if (key.includes('次数') || key.includes('数量')) return '次';
    if (key.includes('天') || key.includes('日')) return '天';
    return '';
  }

  /**
   * 获取卡片颜色
   */
  getCardColor(index) {
    const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#9C27B0'];
    return colors[index % colors.length];
  }

  /**
   * 计算趋势（简单示例）
   */
  calculateTrend(item) {
    const keys = Object.keys(item);
    const value = parseFloat(item[keys[1]]) || 0;
    
    if (value > 90) return 'up';
    if (value < 60) return 'down';
    return 'stable';
  }

  /**
   * 生成柱状图
   * @param {Array} data 数据
   * @param {string} title 标题
   * @param {string} containerId 容器ID
   * @returns {Object} 图表配置
   */
  generateBarChart(data, title, containerId) {
    if (!data || data.length === 0) return null;

    const keys = Object.keys(data[0]);
    const xAxisData = data.map(item => item[keys[0]]);
    const seriesData = data.map(item => parseFloat(item[keys[1]]) || 0);

    const option = {
      title: {
        text: title,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: {
          rotate: 45,
          interval: 0
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        name: keys[1],
        type: 'bar',
        data: seriesData,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#2378f7' },
              { offset: 0.7, color: '#2378f7' },
              { offset: 1, color: '#83bff6' }
            ])
          }
        }
      }]
    };

    return {
      type: 'chart',
      chartType: 'bar',
      containerId,
      option,
      title
    };
  }

  /**
   * 生成饼图
   * @param {Array} data 数据
   * @param {string} title 标题
   * @param {string} containerId 容器ID
   * @returns {Object} 图表配置
   */
  generatePieChart(data, title, containerId) {
    if (!data || data.length === 0) return null;

    const keys = Object.keys(data[0]);
    const seriesData = data.map(item => ({
      name: item[keys[0]],
      value: parseFloat(item[keys[1]]) || 0
    }));

    const option = {
      title: {
        text: title,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [{
        name: title,
        type: 'pie',
        radius: '50%',
        data: seriesData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };

    return {
      type: 'chart',
      chartType: 'pie',
      containerId,
      option,
      title
    };
  }

  /**
   * 生成折线图
   * @param {Array} data 数据
   * @param {string} title 标题
   * @param {string} containerId 容器ID
   * @returns {Object} 图表配置
   */
  generateLineChart(data, title, containerId) {
    if (!data || data.length === 0) return null;

    const keys = Object.keys(data[0]);
    const xAxisData = data.map(item => item[keys[0]]);
    const seriesData = data.map(item => parseFloat(item[keys[1]]) || 0);

    const option = {
      title: {
        text: title,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        name: keys[1],
        type: 'line',
        stack: 'Total',
        data: seriesData,
        smooth: true,
        lineStyle: {
          color: '#5470c6'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(84, 112, 198, 0.3)' },
            { offset: 1, color: 'rgba(84, 112, 198, 0.1)' }
          ])
        }
      }]
    };

    return {
      type: 'chart',
      chartType: 'line',
      containerId,
      option,
      title
    };
  }

  /**
   * 智能选择最佳呈现方式
   * @param {Array} data 数据
   * @param {string} queryType 查询类型
   * @param {string} title 标题
   * @returns {Object} 呈现配置
   */
  smartFormat(data, queryType, title) {
    if (!data || data.length === 0) {
      return {
        type: 'message',
        title,
        content: '暂无相关数据',
        icon: '📭'
      };
    }

    // 根据查询类型和数据特征选择呈现方式
    if (queryType.includes('排行') || queryType.includes('Top')) {
      // 排行数据适合用柱状图 + 表格
      return {
        type: 'combined',
        title,
        components: [
          this.generateBarChart(data, `${title} - 图表`, 'chart-container'),
          this.formatAsTable(data, `${title} - 详细数据`)
        ]
      };
    }

    if (queryType.includes('对比') || queryType.includes('分析')) {
      // 对比数据适合用统计卡片 + 表格
      return {
        type: 'combined',
        title,
        components: [
          this.formatAsStatCards(data, `${title} - 概览`),
          this.formatAsTable(data, `${title} - 详细对比`)
        ]
      };
    }

    if (queryType.includes('分布') || queryType.includes('状态')) {
      // 分布数据适合用饼图 + 表格
      return {
        type: 'combined',
        title,
        components: [
          this.generatePieChart(data, `${title} - 分布图`, 'pie-container'),
          this.formatAsTable(data, `${title} - 详细数据`)
        ]
      };
    }

    if (queryType.includes('趋势') || queryType.includes('时间')) {
      // 趋势数据适合用折线图 + 表格
      return {
        type: 'combined',
        title,
        components: [
          this.generateLineChart(data, `${title} - 趋势图`, 'line-container'),
          this.formatAsTable(data, `${title} - 详细数据`)
        ]
      };
    }

    // 默认使用表格呈现
    return this.formatAsTable(data, title);
  }

  /**
   * 渲染图表到DOM
   * @param {Object} chartConfig 图表配置
   * @param {HTMLElement} container 容器元素
   */
  renderChart(chartConfig, container) {
    if (!chartConfig || chartConfig.type !== 'chart') return;

    // 清理现有图表
    if (this.chartInstances.has(chartConfig.containerId)) {
      this.chartInstances.get(chartConfig.containerId).dispose();
    }

    // 创建新图表
    const chart = echarts.init(container);
    chart.setOption(chartConfig.option);
    
    // 保存图表实例
    this.chartInstances.set(chartConfig.containerId, chart);

    // 响应式调整
    window.addEventListener('resize', () => {
      chart.resize();
    });

    return chart;
  }

  /**
   * 清理所有图表实例
   */
  dispose() {
    this.chartInstances.forEach(chart => {
      chart.dispose();
    });
    this.chartInstances.clear();
  }
}

// 导出单例实例
export const qaPresentation = new EnhancedQAPresentation();
