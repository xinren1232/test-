/**
 * 数据处理工具库
 * 集成开源工具，提供强大的数据分析和转换能力
 */

// 模拟 Lodash 的核心功能（避免依赖问题）
const _ = {
  // 分组功能
  groupBy(collection, iteratee) {
    const result = {}
    for (const item of collection) {
      const key = typeof iteratee === 'function' ? iteratee(item) : item[iteratee]
      if (!result[key]) {
        result[key] = []
      }
      result[key].push(item)
    }
    return result
  },

  // 排序功能
  orderBy(collection, iteratees, orders = ['asc']) {
    return [...collection].sort((a, b) => {
      for (let i = 0; i < iteratees.length; i++) {
        const iteratee = iteratees[i]
        const order = orders[i] || orders[0]
        
        const aVal = typeof iteratee === 'function' ? iteratee(a) : a[iteratee]
        const bVal = typeof iteratee === 'function' ? iteratee(b) : b[iteratee]
        
        if (aVal < bVal) return order === 'asc' ? -1 : 1
        if (aVal > bVal) return order === 'asc' ? 1 : -1
      }
      return 0
    })
  },

  // 求和功能
  sumBy(collection, iteratee) {
    return collection.reduce((sum, item) => {
      const value = typeof iteratee === 'function' ? iteratee(item) : item[iteratee]
      return sum + (Number(value) || 0)
    }, 0)
  },

  // 计数功能
  countBy(collection, iteratee) {
    const result = {}
    for (const item of collection) {
      const key = typeof iteratee === 'function' ? iteratee(item) : item[iteratee]
      result[key] = (result[key] || 0) + 1
    }
    return result
  },

  // 去重功能
  uniqBy(collection, iteratee) {
    const seen = new Set()
    return collection.filter(item => {
      const key = typeof iteratee === 'function' ? iteratee(item) : item[iteratee]
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  },

  // 深拷贝
  cloneDeep(obj) {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj.getTime())
    if (obj instanceof Array) return obj.map(item => _.cloneDeep(item))
    if (typeof obj === 'object') {
      const cloned = {}
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = _.cloneDeep(obj[key])
        }
      }
      return cloned
    }
  }
}

// 时间处理工具（模拟 Day.js）
const dayjs = (date) => {
  const d = date ? new Date(date) : new Date()
  
  return {
    format(template = 'YYYY-MM-DD HH:mm:ss') {
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const hour = String(d.getHours()).padStart(2, '0')
      const minute = String(d.getMinutes()).padStart(2, '0')
      const second = String(d.getSeconds()).padStart(2, '0')
      
      return template
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hour)
        .replace('mm', minute)
        .replace('ss', second)
    },
    
    add(value, unit) {
      const newDate = new Date(d)
      switch (unit) {
        case 'day':
          newDate.setDate(newDate.getDate() + value)
          break
        case 'month':
          newDate.setMonth(newDate.getMonth() + value)
          break
        case 'year':
          newDate.setFullYear(newDate.getFullYear() + value)
          break
        case 'hour':
          newDate.setHours(newDate.getHours() + value)
          break
      }
      return dayjs(newDate)
    },
    
    subtract(value, unit) {
      return this.add(-value, unit)
    },
    
    isBefore(date) {
      return d < new Date(date)
    },
    
    isAfter(date) {
      return d > new Date(date)
    }
  }
}

/**
 * 数据处理核心类
 */
export class DataProcessor {
  constructor(data = []) {
    this.data = _.cloneDeep(data)
  }

  // 链式操作支持
  static from(data) {
    return new DataProcessor(data)
  }

  // 过滤数据
  filter(predicate) {
    this.data = this.data.filter(predicate)
    return this
  }

  // 映射数据
  map(iteratee) {
    this.data = this.data.map(iteratee)
    return this
  }

  // 分组数据
  groupBy(iteratee) {
    return _.groupBy(this.data, iteratee)
  }

  // 排序数据
  orderBy(iteratees, orders) {
    this.data = _.orderBy(this.data, iteratees, orders)
    return this
  }

  // 获取结果
  value() {
    return this.data
  }

  // 统计分析
  analyze() {
    return {
      count: this.data.length,
      sum: (field) => _.sumBy(this.data, field),
      avg: (field) => {
        const sum = _.sumBy(this.data, field)
        return this.data.length > 0 ? sum / this.data.length : 0
      },
      max: (field) => Math.max(...this.data.map(item => Number(item[field]) || 0)),
      min: (field) => Math.min(...this.data.map(item => Number(item[field]) || 0)),
      groupCount: (field) => _.countBy(this.data, field)
    }
  }
}

/**
 * 图表数据转换器
 */
export class ChartDataTransformer {
  // 转换为柱状图数据
  static toBarChart(data, labelField, valueField) {
    return data.map(item => ({
      name: item[labelField],
      value: Number(item[valueField]) || 0
    }))
  }

  // 转换为饼图数据
  static toPieChart(data, labelField, valueField) {
    return data.map(item => ({
      name: item[labelField],
      value: Number(item[valueField]) || 0
    }))
  }

  // 转换为折线图数据
  static toLineChart(data, xField, yField) {
    return {
      xAxis: data.map(item => item[xField]),
      series: data.map(item => Number(item[yField]) || 0)
    }
  }

  // 转换为时间序列数据
  static toTimeSeriesChart(data, timeField, valueField, timeFormat = 'YYYY-MM-DD') {
    const sortedData = _.orderBy(data, [timeField], ['asc'])
    return {
      xAxis: sortedData.map(item => dayjs(item[timeField]).format(timeFormat)),
      series: sortedData.map(item => Number(item[valueField]) || 0)
    }
  }

  // 分组统计转图表
  static groupToChart(data, groupField, valueField = null) {
    const grouped = _.groupBy(data, groupField)
    const result = []

    for (const [key, items] of Object.entries(grouped)) {
      result.push({
        name: key,
        value: valueField ? _.sumBy(items, valueField) : items.length
      })
    }

    return _.orderBy(result, ['value'], ['desc'])
  }
}

/**
 * 质量数据分析器
 */
export class QualityDataAnalyzer {
  // 分析库存数据
  static analyzeInventory(inventoryData) {
    const processor = DataProcessor.from(inventoryData)
    const analyzer = processor.analyze()

    return {
      总数量: analyzer.sum('quantity'),
      平均数量: Math.round(analyzer.avg('quantity')),
      工厂分布: analyzer.groupCount('factory'),
      供应商分布: analyzer.groupCount('supplier'),
      状态分布: analyzer.groupCount('status'),
      物料类型分布: analyzer.groupCount('materialName')
    }
  }

  // 分析测试数据
  static analyzeTestData(testData) {
    const processor = DataProcessor.from(testData)
    const analyzer = processor.analyze()

    return {
      测试总数: testData.length,
      合格率: this.calculatePassRate(testData),
      不良类型分布: analyzer.groupCount('defectType'),
      测试项目分布: analyzer.groupCount('testItem'),
      时间趋势: this.getTimeTrend(testData, 'testDate', 'result')
    }
  }

  // 计算合格率
  static calculatePassRate(testData) {
    const passCount = testData.filter(item => 
      item.result === '合格' || item.result === 'PASS' || item.result === 'OK'
    ).length
    
    return testData.length > 0 ? 
      Math.round((passCount / testData.length) * 100) : 0
  }

  // 获取时间趋势
  static getTimeTrend(data, timeField, valueField) {
    const grouped = _.groupBy(data, item => {
      return dayjs(item[timeField]).format('YYYY-MM-DD')
    })

    const trend = []
    for (const [date, items] of Object.entries(grouped)) {
      trend.push({
        date,
        count: items.length,
        passRate: this.calculatePassRate(items)
      })
    }

    return _.orderBy(trend, ['date'], ['asc'])
  }

  // 生成质量报告
  static generateQualityReport(inventoryData, testData, productionData) {
    return {
      库存分析: this.analyzeInventory(inventoryData || []),
      测试分析: this.analyzeTestData(testData || []),
      生产分析: this.analyzeProduction(productionData || []),
      综合评分: this.calculateOverallScore(inventoryData, testData, productionData)
    }
  }

  // 分析生产数据
  static analyzeProduction(productionData) {
    if (!productionData || productionData.length === 0) {
      return { 生产总数: 0, 效率分析: '暂无数据' }
    }

    const processor = DataProcessor.from(productionData)
    const analyzer = processor.analyze()

    return {
      生产总数: productionData.length,
      平均效率: Math.round(analyzer.avg('efficiency') || 0),
      工厂产能分布: analyzer.groupCount('factory'),
      产品类型分布: analyzer.groupCount('productType')
    }
  }

  // 计算综合评分
  static calculateOverallScore(inventoryData, testData, productionData) {
    let score = 0
    let factors = 0

    // 库存评分 (30%)
    if (inventoryData && inventoryData.length > 0) {
      const normalStock = inventoryData.filter(item => item.status === '正常').length
      const stockScore = (normalStock / inventoryData.length) * 30
      score += stockScore
      factors += 30
    }

    // 测试评分 (40%)
    if (testData && testData.length > 0) {
      const passRate = this.calculatePassRate(testData)
      const testScore = (passRate / 100) * 40
      score += testScore
      factors += 40
    }

    // 生产评分 (30%)
    if (productionData && productionData.length > 0) {
      const avgEfficiency = DataProcessor.from(productionData).analyze().avg('efficiency') || 0
      const productionScore = Math.min(avgEfficiency / 100, 1) * 30
      score += productionScore
      factors += 30
    }

    return factors > 0 ? Math.round(score / factors * 100) : 0
  }
}

// 导出工具
export { _, dayjs }
export default DataProcessor
