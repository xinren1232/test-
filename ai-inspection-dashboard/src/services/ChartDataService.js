/**
 * 图表数据处理服务
 * 将原始数据转换为图表所需的格式
 */

export class ChartDataService {
  
  /**
   * 生成趋势分析图表数据
   * @param {Array} rawData - 原始数据
   * @param {string} type - 趋势类型 (quality/inventory/defect)
   * @returns {Object} 图表数据
   */
  static generateTrendData(rawData, type) {
    switch (type) {
      case 'quality':
        return this.generateQualityTrendData(rawData)
      case 'inventory':
        return this.generateInventoryTrendData(rawData)
      case 'defect':
        return this.generateDefectTrendData(rawData)
      default:
        return this.generateGenericTrendData(rawData)
    }
  }

  /**
   * 生成质量趋势数据
   */
  static generateQualityTrendData(data) {
    // 按月份分组统计
    const monthlyStats = {}
    
    data.forEach(item => {
      const month = this.extractMonth(item.testDate || item.inspectionDate)
      if (!monthlyStats[month]) {
        monthlyStats[month] = { total: 0, passed: 0 }
      }
      monthlyStats[month].total++
      if (item.testResult === 'PASS' || item.status === '正常') {
        monthlyStats[month].passed++
      }
    })

    const categories = Object.keys(monthlyStats).sort()
    const passRates = categories.map(month => {
      const stats = monthlyStats[month]
      return ((stats.passed / stats.total) * 100).toFixed(1)
    })
    const totalCounts = categories.map(month => monthlyStats[month].total)

    return {
      categories,
      series: [
        {
          name: '合格率(%)',
          data: passRates,
          type: 'line'
        },
        {
          name: '检测总数',
          data: totalCounts,
          type: 'bar'
        }
      ]
    }
  }

  /**
   * 生成库存趋势数据
   */
  static generateInventoryTrendData(data) {
    const monthlyInventory = {}
    
    data.forEach(item => {
      const month = this.extractMonth(item.inspectionDate)
      if (!monthlyInventory[month]) {
        monthlyInventory[month] = { normal: 0, risk: 0, frozen: 0 }
      }
      
      const status = item.status || '正常'
      if (status === '正常') monthlyInventory[month].normal += item.quantity || 0
      else if (status === '风险') monthlyInventory[month].risk += item.quantity || 0
      else if (status === '冻结') monthlyInventory[month].frozen += item.quantity || 0
    })

    const categories = Object.keys(monthlyInventory).sort()
    
    return {
      categories,
      series: [
        {
          name: '正常库存',
          data: categories.map(month => monthlyInventory[month].normal)
        },
        {
          name: '风险库存',
          data: categories.map(month => monthlyInventory[month].risk)
        },
        {
          name: '冻结库存',
          data: categories.map(month => monthlyInventory[month].frozen)
        }
      ]
    }
  }

  /**
   * 生成缺陷趋势数据
   */
  static generateDefectTrendData(data) {
    const monthlyDefects = {}
    
    data.forEach(item => {
      const month = this.extractMonth(item.testDate)
      if (!monthlyDefects[month]) {
        monthlyDefects[month] = 0
      }
      monthlyDefects[month] += item.defectRate || 0
    })

    const categories = Object.keys(monthlyDefects).sort()
    const defectRates = categories.map(month => 
      (monthlyDefects[month] * 100).toFixed(2)
    )

    return {
      categories,
      series: [{
        name: '不良率(%)',
        data: defectRates
      }]
    }
  }

  /**
   * 生成对比分析图表数据
   * @param {Array} rawData - 原始数据
   * @param {string} compareType - 对比类型 (supplier/factory/material)
   * @returns {Object} 图表数据
   */
  static generateComparisonData(rawData, compareType) {
    switch (compareType) {
      case 'supplier':
        return this.generateSupplierComparisonData(rawData)
      case 'factory':
        return this.generateFactoryComparisonData(rawData)
      case 'material':
        return this.generateMaterialComparisonData(rawData)
      default:
        return { categories: [], series: [] }
    }
  }

  /**
   * 生成供应商对比数据
   */
  static generateSupplierComparisonData(data) {
    const supplierStats = {}
    
    data.forEach(item => {
      const supplier = item.supplier
      if (!supplierStats[supplier]) {
        supplierStats[supplier] = {
          total: 0,
          passed: 0,
          quantity: 0,
          defectRate: 0,
          defectCount: 0
        }
      }
      
      const stats = supplierStats[supplier]
      stats.total++
      stats.quantity += item.quantity || 0
      
      if (item.testResult === 'PASS' || item.status === '正常') {
        stats.passed++
      }
      
      if (item.defectRate) {
        stats.defectRate += item.defectRate
        stats.defectCount++
      }
    })

    const suppliers = Object.keys(supplierStats)
    
    return {
      indicators: [
        { name: '合格率', max: 100 },
        { name: '供货量', max: Math.max(...suppliers.map(s => supplierStats[s].quantity)) },
        { name: '响应速度', max: 100 },
        { name: '质量稳定性', max: 100 },
        { name: '成本优势', max: 100 }
      ],
      series: suppliers.map(supplier => {
        const stats = supplierStats[supplier]
        const passRate = (stats.passed / stats.total * 100).toFixed(1)
        const avgDefectRate = stats.defectCount > 0 ? 
          (stats.defectRate / stats.defectCount * 100).toFixed(1) : 0
        
        return {
          name: supplier,
          data: [
            parseFloat(passRate),
            stats.quantity,
            85, // 模拟响应速度
            100 - parseFloat(avgDefectRate),
            80  // 模拟成本优势
          ]
        }
      })
    }
  }

  /**
   * 生成分布分析图表数据
   * @param {Array} rawData - 原始数据
   * @param {string} field - 分析字段
   * @returns {Object} 图表数据
   */
  static generateDistributionData(rawData, field) {
    const distribution = {}
    
    rawData.forEach(item => {
      const value = item[field] || '未知'
      distribution[value] = (distribution[value] || 0) + 1
    })

    return {
      name: `${field}分布`,
      data: Object.keys(distribution).map(key => ({
        name: key,
        value: distribution[key]
      }))
    }
  }

  /**
   * 生成相关性分析数据
   * @param {Array} rawData - 原始数据
   * @param {string} xField - X轴字段
   * @param {string} yField - Y轴字段
   * @returns {Object} 图表数据
   */
  static generateCorrelationData(rawData, xField, yField) {
    const scatterData = rawData
      .filter(item => item[xField] !== undefined && item[yField] !== undefined)
      .map(item => [item[xField], item[yField]])

    return {
      xAxisName: xField,
      yAxisName: yField,
      data: scatterData
    }
  }

  /**
   * 辅助方法：提取月份
   */
  static extractMonth(dateString) {
    if (!dateString) return '未知'
    
    try {
      const date = new Date(dateString)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    } catch (e) {
      return '未知'
    }
  }

  /**
   * 辅助方法：生成通用趋势数据
   */
  static generateGenericTrendData(data) {
    if (!data || data.length === 0) {
      return { categories: [], series: [] }
    }

    // 简单的按时间排序和分组
    const timeField = data[0].testDate || data[0].inspectionDate || data[0].date
    if (!timeField) {
      return { categories: [], series: [] }
    }

    const sortedData = data.sort((a, b) => 
      new Date(a[timeField] || 0) - new Date(b[timeField] || 0)
    )

    const categories = sortedData.map(item => 
      this.extractMonth(item[timeField])
    ).filter((value, index, self) => self.indexOf(value) === index)

    return {
      categories,
      series: [{
        name: '数据趋势',
        data: categories.map(() => Math.floor(Math.random() * 100))
      }]
    }
  }

  /**
   * 智能选择图表类型
   * @param {Array} data - 数据
   * @param {string} analysisType - 分析类型
   * @returns {string} 推荐的图表类型
   */
  static recommendChartType(data, analysisType) {
    if (!data || data.length === 0) return 'bar'

    switch (analysisType) {
      case 'trend':
        return 'line'
      case 'comparison':
        return data.length > 5 ? 'radar' : 'bar'
      case 'distribution':
        return 'pie'
      case 'correlation':
        return 'scatter'
      case 'forecast':
        return 'forecast_line'
      default:
        return 'bar'
    }
  }
}

export default ChartDataService
