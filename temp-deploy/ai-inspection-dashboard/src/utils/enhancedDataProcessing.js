/**
 * 增强版数据处理工具库
 * 集成真正的Lodash和Day.js，提供更强大的数据处理能力
 */

// 导入真正的Lodash和Day.js
import _ from 'lodash'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime.js'
import duration from 'dayjs/plugin/duration.js'
import timezone from 'dayjs/plugin/timezone.js'
import utc from 'dayjs/plugin/utc.js'
import 'dayjs/locale/zh-cn.js'

// 配置Day.js
dayjs.extend(relativeTime)
dayjs.extend(duration)
dayjs.extend(timezone)
dayjs.extend(utc)
dayjs.locale('zh-cn')

/**
 * 增强版数据处理器
 * 结合Lodash和Day.js的强大功能
 */
export class EnhancedDataProcessor {
  constructor() {
    this._ = _
    this.dayjs = dayjs
  }

  /**
   * 数据分组和聚合
   */
  groupAndAggregate(data, groupBy, aggregations = {}) {
    const grouped = _.groupBy(data, groupBy)
    const result = {}

    _.forEach(grouped, (items, key) => {
      result[key] = {
        count: items.length,
        items: items
      }

      // 执行聚合操作
      _.forEach(aggregations, (config, field) => {
        const values = _.map(items, config.field || field)
        
        switch (config.type) {
          case 'sum':
            result[key][field] = _.sumBy(items, config.field || field)
            break
          case 'avg':
            result[key][field] = _.meanBy(items, config.field || field)
            break
          case 'max':
            result[key][field] = _.maxBy(items, config.field || field)
            break
          case 'min':
            result[key][field] = _.minBy(items, config.field || field)
            break
          case 'unique':
            result[key][field] = _.uniqBy(items, config.field || field).length
            break
          default:
            result[key][field] = values
        }
      })
    })

    return result
  }

  /**
   * 时间序列数据处理
   */
  processTimeSeries(data, timeField, valueField, interval = 'day') {
    // 按时间排序
    const sortedData = _.orderBy(data, [timeField], ['asc'])
    
    // 按时间间隔分组
    const grouped = _.groupBy(sortedData, (item) => {
      const time = dayjs(item[timeField])
      switch (interval) {
        case 'hour':
          return time.format('YYYY-MM-DD HH:00')
        case 'day':
          return time.format('YYYY-MM-DD')
        case 'week':
          return time.startOf('week').format('YYYY-MM-DD')
        case 'month':
          return time.format('YYYY-MM')
        case 'year':
          return time.format('YYYY')
        default:
          return time.format('YYYY-MM-DD')
      }
    })

    // 计算每个时间段的统计信息
    const result = _.map(grouped, (items, timeKey) => {
      const values = _.map(items, valueField)
      return {
        time: timeKey,
        count: items.length,
        sum: _.sum(values),
        avg: _.mean(values),
        max: _.max(values),
        min: _.min(values),
        items: items
      }
    })

    return _.orderBy(result, ['time'], ['asc'])
  }

  /**
   * 数据质量分析
   */
  analyzeDataQuality(data, fields = []) {
    const totalRecords = data.length
    const analysis = {
      totalRecords,
      fields: {}
    }

    const fieldsToAnalyze = fields.length > 0 ? fields : _.keys(data[0] || {})

    _.forEach(fieldsToAnalyze, (field) => {
      const values = _.map(data, field)
      const nonNullValues = _.filter(values, (v) => v != null && v !== '')
      const uniqueValues = _.uniq(nonNullValues)

      analysis.fields[field] = {
        totalValues: values.length,
        nonNullValues: nonNullValues.length,
        nullValues: values.length - nonNullValues.length,
        uniqueValues: uniqueValues.length,
        completeness: (nonNullValues.length / values.length * 100).toFixed(2) + '%',
        uniqueness: (uniqueValues.length / nonNullValues.length * 100).toFixed(2) + '%',
        dataType: this.detectDataType(nonNullValues),
        sampleValues: _.take(uniqueValues, 5)
      }

      // 数值字段的额外统计
      if (analysis.fields[field].dataType === 'number') {
        const numericValues = _.map(nonNullValues, Number).filter(v => !isNaN(v))
        analysis.fields[field].statistics = {
          min: _.min(numericValues),
          max: _.max(numericValues),
          avg: _.mean(numericValues),
          median: this.calculateMedian(numericValues),
          stdDev: this.calculateStdDev(numericValues)
        }
      }
    })

    return analysis
  }

  /**
   * 数据类型检测
   */
  detectDataType(values) {
    if (values.length === 0) return 'unknown'

    const sample = _.take(values, 100)
    let numberCount = 0
    let dateCount = 0
    let booleanCount = 0

    _.forEach(sample, (value) => {
      if (typeof value === 'number' || (!isNaN(Number(value)) && value !== '')) {
        numberCount++
      } else if (dayjs(value).isValid() && value.toString().length > 4) {
        dateCount++
      } else if (typeof value === 'boolean' || value === 'true' || value === 'false') {
        booleanCount++
      }
    })

    const total = sample.length
    if (numberCount / total > 0.8) return 'number'
    if (dateCount / total > 0.8) return 'date'
    if (booleanCount / total > 0.8) return 'boolean'
    return 'string'
  }

  /**
   * 计算中位数
   */
  calculateMedian(values) {
    const sorted = _.sortBy(values)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid]
  }

  /**
   * 计算标准差
   */
  calculateStdDev(values) {
    const mean = _.mean(values)
    const squaredDiffs = _.map(values, (value) => Math.pow(value - mean, 2))
    const avgSquaredDiff = _.mean(squaredDiffs)
    return Math.sqrt(avgSquaredDiff)
  }

  /**
   * 数据清洗
   */
  cleanData(data, rules = {}) {
    let cleanedData = _.cloneDeep(data)

    // 移除重复项
    if (rules.removeDuplicates) {
      const uniqueBy = rules.removeDuplicates === true ? undefined : rules.removeDuplicates
      cleanedData = uniqueBy ? _.uniqBy(cleanedData, uniqueBy) : _.uniq(cleanedData)
    }

    // 处理缺失值
    if (rules.handleMissing) {
      _.forEach(rules.handleMissing, (strategy, field) => {
        cleanedData = _.map(cleanedData, (item) => {
          if (item[field] == null || item[field] === '') {
            switch (strategy.type) {
              case 'default':
                item[field] = strategy.value
                break
              case 'mean':
                const values = _.map(cleanedData, field).filter(v => v != null && v !== '')
                item[field] = _.mean(values)
                break
              case 'median':
                const medianValues = _.map(cleanedData, field).filter(v => v != null && v !== '')
                item[field] = this.calculateMedian(medianValues)
                break
              case 'remove':
                return null // 标记为删除
            }
          }
          return item
        })
      })
      
      // 移除标记为删除的项
      cleanedData = _.filter(cleanedData, item => item !== null)
    }

    // 数据转换
    if (rules.transform) {
      _.forEach(rules.transform, (transformer, field) => {
        cleanedData = _.map(cleanedData, (item) => {
          if (typeof transformer === 'function') {
            item[field] = transformer(item[field], item)
          } else if (transformer.type === 'date') {
            item[field] = dayjs(item[field]).format(transformer.format || 'YYYY-MM-DD')
          } else if (transformer.type === 'number') {
            item[field] = Number(item[field])
          } else if (transformer.type === 'string') {
            item[field] = String(item[field])
          }
          return item
        })
      })
    }

    return cleanedData
  }

  /**
   * 数据透视表
   */
  createPivotTable(data, rowField, colField, valueField, aggregateFunc = 'sum') {
    const pivot = {}
    const rows = _.uniq(_.map(data, rowField))
    const cols = _.uniq(_.map(data, colField))

    // 初始化透视表结构
    _.forEach(rows, (row) => {
      pivot[row] = {}
      _.forEach(cols, (col) => {
        pivot[row][col] = []
      })
    })

    // 填充数据
    _.forEach(data, (item) => {
      const row = item[rowField]
      const col = item[colField]
      const value = item[valueField]
      
      if (pivot[row] && pivot[row][col]) {
        pivot[row][col].push(value)
      }
    })

    // 应用聚合函数
    _.forEach(pivot, (rowData, row) => {
      _.forEach(rowData, (values, col) => {
        switch (aggregateFunc) {
          case 'sum':
            pivot[row][col] = _.sum(values)
            break
          case 'avg':
            pivot[row][col] = _.mean(values)
            break
          case 'count':
            pivot[row][col] = values.length
            break
          case 'max':
            pivot[row][col] = _.max(values)
            break
          case 'min':
            pivot[row][col] = _.min(values)
            break
          default:
            pivot[row][col] = values
        }
      })
    })

    return {
      data: pivot,
      rows: rows,
      columns: cols,
      summary: {
        totalRows: rows.length,
        totalColumns: cols.length,
        totalCells: rows.length * cols.length
      }
    }
  }

  /**
   * 时间范围分析
   */
  analyzeTimeRange(data, timeField) {
    const times = _.map(data, timeField).filter(t => t != null)
    const dayJSTimes = _.map(times, t => dayjs(t)).filter(t => t.isValid())

    if (dayJSTimes.length === 0) {
      return null
    }

    const sortedTimes = _.sortBy(dayJSTimes, t => t.valueOf())
    const earliest = sortedTimes[0]
    const latest = sortedTimes[sortedTimes.length - 1]
    const duration = latest.diff(earliest)

    return {
      earliest: earliest.format('YYYY-MM-DD HH:mm:ss'),
      latest: latest.format('YYYY-MM-DD HH:mm:ss'),
      duration: {
        milliseconds: duration,
        humanReadable: dayjs.duration(duration).humanize(),
        days: Math.ceil(duration / (1000 * 60 * 60 * 24)),
        hours: Math.ceil(duration / (1000 * 60 * 60)),
        minutes: Math.ceil(duration / (1000 * 60))
      },
      totalRecords: dayJSTimes.length,
      timeDistribution: this.analyzeTimeDistribution(dayJSTimes)
    }
  }

  /**
   * 时间分布分析
   */
  analyzeTimeDistribution(dayJSTimes) {
    const hourDistribution = _.countBy(dayJSTimes, t => t.hour())
    const dayOfWeekDistribution = _.countBy(dayJSTimes, t => t.day())
    const monthDistribution = _.countBy(dayJSTimes, t => t.month())

    return {
      byHour: hourDistribution,
      byDayOfWeek: dayOfWeekDistribution,
      byMonth: monthDistribution
    }
  }
}

// 创建全局实例
export const enhancedDataProcessor = new EnhancedDataProcessor()

// 导出Lodash和Day.js实例供直接使用
export { _ as lodash, dayjs }

// 默认导出
export default EnhancedDataProcessor
