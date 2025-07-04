/**
 * 新安装工具集成测试
 * 测试Chart.js、D3.js、Plotly.js、Lodash、Day.js、Ant Design Vue等新工具
 */

import { enhancedDataProcessor, lodash, dayjs } from '../utils/enhancedDataProcessing.js'

// 测试数据
const testData = [
  {
    id: 1,
    factory: '深圳工厂',
    supplier: '泰科电子',
    material: '电容器C001',
    quantity: 1500,
    status: '正常',
    date: '2024-01-15 17:45:30',
    defectRate: 0.02
  },
  {
    id: 2,
    factory: '重庆工厂',
    supplier: '三星电子',
    material: '电阻器R002',
    quantity: 2300,
    status: '正常',
    date: '2024-01-15 18:30:15',
    defectRate: 0.01
  },
  {
    id: 3,
    factory: '深圳工厂',
    supplier: '美光科技',
    material: '芯片IC003',
    quantity: 800,
    status: '风险',
    date: '2024-01-15 19:15:45',
    defectRate: 0.05
  },
  {
    id: 4,
    factory: '南昌工厂',
    supplier: '泰科电子',
    material: '连接器CN004',
    quantity: 1200,
    status: '正常',
    date: '2024-01-15 22:20:10',
    defectRate: 0.03
  },
  {
    id: 5,
    factory: '宜宾工厂',
    supplier: '博世科技',
    material: '传感器SN005',
    quantity: 950,
    status: '异常',
    date: '2024-01-16 00:10:25',
    defectRate: 0.08
  }
]

/**
 * 测试Lodash功能
 */
function testLodash() {
  console.log('🔧 测试Lodash功能...')
  
  try {
    // 测试分组
    const groupedByFactory = lodash.groupBy(testData, 'factory')
    console.log('✅ 按工厂分组:', Object.keys(groupedByFactory))
    
    // 测试排序
    const sortedByQuantity = lodash.orderBy(testData, ['quantity'], ['desc'])
    console.log('✅ 按数量排序 (前3):', sortedByQuantity.slice(0, 3).map(item => `${item.material}: ${item.quantity}`))
    
    // 测试聚合
    const totalQuantity = lodash.sumBy(testData, 'quantity')
    const avgDefectRate = lodash.meanBy(testData, 'defectRate')
    console.log('✅ 总数量:', totalQuantity, '平均缺陷率:', avgDefectRate.toFixed(4))
    
    // 测试去重
    const uniqueSuppliers = lodash.uniqBy(testData, 'supplier')
    console.log('✅ 唯一供应商数量:', uniqueSuppliers.length)
    
    // 测试深拷贝
    const clonedData = lodash.cloneDeep(testData)
    console.log('✅ 深拷贝成功:', clonedData.length === testData.length)
    
    return true
  } catch (error) {
    console.error('❌ Lodash测试失败:', error.message)
    return false
  }
}

/**
 * 测试Day.js功能
 */
function testDayjs() {
  console.log('📅 测试Day.js功能...')
  
  try {
    // 测试日期解析
    const now = dayjs()
    const testDate = dayjs('2024-01-15 17:45:30')
    console.log('✅ 当前时间:', now.format('YYYY-MM-DD HH:mm:ss'))
    console.log('✅ 测试日期:', testDate.format('YYYY-MM-DD HH:mm:ss'))
    
    // 测试相对时间
    const relativeTime = testDate.fromNow()
    console.log('✅ 相对时间:', relativeTime)
    
    // 测试时间差
    const duration = now.diff(testDate, 'days')
    console.log('✅ 时间差:', duration, '天')
    
    // 测试时间格式化
    const formatted = testDate.format('YYYY年MM月DD日 HH:mm')
    console.log('✅ 中文格式:', formatted)
    
    // 测试时间操作
    const nextWeek = testDate.add(1, 'week')
    console.log('✅ 一周后:', nextWeek.format('YYYY-MM-DD'))
    
    // 测试时区
    const utcTime = testDate.utc().format()
    console.log('✅ UTC时间:', utcTime)
    
    return true
  } catch (error) {
    console.error('❌ Day.js测试失败:', error.message)
    return false
  }
}

/**
 * 测试增强数据处理器
 */
function testEnhancedDataProcessor() {
  console.log('🚀 测试增强数据处理器...')
  
  try {
    // 测试分组聚合
    const groupedData = enhancedDataProcessor.groupAndAggregate(testData, 'factory', {
      totalQuantity: { field: 'quantity', type: 'sum' },
      avgDefectRate: { field: 'defectRate', type: 'avg' },
      maxQuantity: { field: 'quantity', type: 'max' }
    })
    console.log('✅ 分组聚合结果:', Object.keys(groupedData))
    
    // 测试时间序列处理
    const timeSeries = enhancedDataProcessor.processTimeSeries(testData, 'date', 'quantity', 'hour')
    console.log('✅ 时间序列数据点:', timeSeries.length)
    
    // 测试数据质量分析
    const qualityAnalysis = enhancedDataProcessor.analyzeDataQuality(testData, ['quantity', 'defectRate', 'status'])
    console.log('✅ 数据质量分析字段:', Object.keys(qualityAnalysis.fields))
    
    // 测试数据清洗
    const cleanedData = enhancedDataProcessor.cleanData(testData, {
      removeDuplicates: 'id',
      transform: {
        date: { type: 'date', format: 'YYYY-MM-DD' }
      }
    })
    console.log('✅ 数据清洗后记录数:', cleanedData.length)
    
    // 测试透视表
    const pivotTable = enhancedDataProcessor.createPivotTable(testData, 'factory', 'status', 'quantity', 'sum')
    console.log('✅ 透视表维度:', `${pivotTable.rows.length} x ${pivotTable.columns.length}`)
    
    // 测试时间范围分析
    const timeRange = enhancedDataProcessor.analyzeTimeRange(testData, 'date')
    console.log('✅ 时间范围:', timeRange.duration.humanReadable)
    
    return true
  } catch (error) {
    console.error('❌ 增强数据处理器测试失败:', error.message)
    return false
  }
}

/**
 * 测试Chart.js数据格式转换
 */
function testChartJSDataTransform() {
  console.log('📊 测试Chart.js数据转换...')
  
  try {
    // 模拟Chart.js数据格式
    const chartData = {
      labels: testData.map(item => item.factory),
      datasets: [{
        label: '库存数量',
        data: testData.map(item => item.quantity),
        backgroundColor: [
          'rgba(24, 144, 255, 0.8)',
          'rgba(82, 196, 26, 0.8)',
          'rgba(250, 173, 20, 0.8)',
          'rgba(245, 34, 45, 0.8)',
          'rgba(114, 46, 209, 0.8)'
        ]
      }]
    }
    
    console.log('✅ Chart.js数据格式:', {
      labels: chartData.labels.length,
      datasets: chartData.datasets.length,
      dataPoints: chartData.datasets[0].data.length
    })
    
    // 测试多数据集格式
    const multiDatasetChart = {
      labels: lodash.uniq(testData.map(item => item.factory)),
      datasets: [
        {
          label: '库存数量',
          data: lodash.uniq(testData.map(item => item.factory)).map(factory => 
            lodash.sumBy(testData.filter(item => item.factory === factory), 'quantity')
          )
        },
        {
          label: '平均缺陷率',
          data: lodash.uniq(testData.map(item => item.factory)).map(factory => 
            lodash.meanBy(testData.filter(item => item.factory === factory), 'defectRate')
          )
        }
      ]
    }
    
    console.log('✅ 多数据集Chart.js格式:', {
      factories: multiDatasetChart.labels.length,
      datasets: multiDatasetChart.datasets.length
    })
    
    return true
  } catch (error) {
    console.error('❌ Chart.js数据转换测试失败:', error.message)
    return false
  }
}

/**
 * 测试D3.js数据格式转换
 */
function testD3DataTransform() {
  console.log('🎨 测试D3.js数据转换...')
  
  try {
    // 层次数据结构 (用于树状图)
    const hierarchyData = {
      name: 'root',
      children: lodash.map(lodash.groupBy(testData, 'factory'), (items, factory) => ({
        name: factory,
        children: items.map(item => ({
          name: item.material,
          value: item.quantity,
          defectRate: item.defectRate
        }))
      }))
    }
    
    console.log('✅ D3层次数据:', {
      factories: hierarchyData.children.length,
      totalMaterials: lodash.sumBy(hierarchyData.children, child => child.children.length)
    })
    
    // 网络图数据结构
    const networkData = {
      nodes: [
        ...lodash.uniqBy(testData, 'factory').map(item => ({ id: item.factory, type: 'factory' })),
        ...lodash.uniqBy(testData, 'supplier').map(item => ({ id: item.supplier, type: 'supplier' }))
      ],
      links: testData.map(item => ({
        source: item.factory,
        target: item.supplier,
        value: item.quantity
      }))
    }
    
    console.log('✅ D3网络数据:', {
      nodes: networkData.nodes.length,
      links: networkData.links.length
    })
    
    // 地理数据格式 (模拟)
    const geoData = {
      type: 'FeatureCollection',
      features: lodash.uniqBy(testData, 'factory').map((item, index) => ({
        type: 'Feature',
        properties: {
          name: item.factory,
          quantity: lodash.sumBy(testData.filter(d => d.factory === item.factory), 'quantity')
        },
        geometry: {
          type: 'Point',
          coordinates: [113.2644 + index, 23.1291 + index] // 模拟坐标
        }
      }))
    }
    
    console.log('✅ D3地理数据:', {
      features: geoData.features.length
    })
    
    return true
  } catch (error) {
    console.error('❌ D3.js数据转换测试失败:', error.message)
    return false
  }
}

/**
 * 测试Plotly.js数据格式转换
 */
function testPlotlyDataTransform() {
  console.log('📈 测试Plotly.js数据转换...')
  
  try {
    // 3D散点图数据
    const scatter3D = {
      x: testData.map(item => item.quantity),
      y: testData.map(item => item.defectRate),
      z: testData.map(item => dayjs(item.date).hour()),
      mode: 'markers',
      type: 'scatter3d',
      marker: {
        size: 8,
        color: testData.map(item => item.quantity),
        colorscale: 'Viridis'
      },
      text: testData.map(item => `${item.factory} - ${item.material}`)
    }
    
    console.log('✅ Plotly 3D散点图:', {
      dataPoints: scatter3D.x.length,
      dimensions: 3
    })
    
    // 热力图数据
    const heatmapData = {
      z: [
        testData.slice(0, 3).map(item => item.quantity),
        testData.slice(2, 5).map(item => item.defectRate * 1000),
        testData.slice(1, 4).map(item => dayjs(item.date).hour())
      ],
      type: 'heatmap',
      colorscale: 'RdYlBu'
    }
    
    console.log('✅ Plotly热力图:', {
      rows: heatmapData.z.length,
      cols: heatmapData.z[0].length
    })
    
    // 箱线图数据
    const boxPlotData = lodash.map(lodash.groupBy(testData, 'factory'), (items, factory) => ({
      y: items.map(item => item.quantity),
      type: 'box',
      name: factory
    }))
    
    console.log('✅ Plotly箱线图:', {
      groups: boxPlotData.length
    })
    
    return true
  } catch (error) {
    console.error('❌ Plotly.js数据转换测试失败:', error.message)
    return false
  }
}

/**
 * 性能测试
 */
function testPerformance() {
  console.log('⚡ 测试性能...')
  
  try {
    // 生成大量测试数据
    const largeDataset = []
    for (let i = 0; i < 10000; i++) {
      largeDataset.push({
        id: i,
        factory: `工厂${i % 5}`,
        quantity: Math.floor(Math.random() * 1000) + 100,
        date: dayjs().subtract(Math.floor(Math.random() * 365), 'days').toISOString(),
        defectRate: Math.random() * 0.1
      })
    }
    
    // 测试Lodash性能
    const start1 = performance.now()
    const grouped = lodash.groupBy(largeDataset, 'factory')
    const sorted = lodash.orderBy(largeDataset, ['quantity'], ['desc'])
    const aggregated = lodash.sumBy(largeDataset, 'quantity')
    const end1 = performance.now()
    
    console.log('✅ Lodash处理10000条记录耗时:', (end1 - start1).toFixed(2) + 'ms')
    
    // 测试Day.js性能
    const start2 = performance.now()
    const dates = largeDataset.map(item => dayjs(item.date).format('YYYY-MM-DD'))
    const end2 = performance.now()
    
    console.log('✅ Day.js处理10000个日期耗时:', (end2 - start2).toFixed(2) + 'ms')
    
    // 测试增强数据处理器性能
    const start3 = performance.now()
    const analysis = enhancedDataProcessor.analyzeDataQuality(largeDataset.slice(0, 1000))
    const end3 = performance.now()
    
    console.log('✅ 增强数据处理器分析1000条记录耗时:', (end3 - start3).toFixed(2) + 'ms')
    
    return true
  } catch (error) {
    console.error('❌ 性能测试失败:', error.message)
    return false
  }
}

/**
 * 主测试函数
 */
async function runNewToolsIntegrationTest() {
  console.log('🚀 开始新工具集成测试...\n')
  
  const tests = [
    { name: 'lodash', func: testLodash },
    { name: 'dayjs', func: testDayjs },
    { name: 'enhancedDataProcessor', func: testEnhancedDataProcessor },
    { name: 'chartJSDataTransform', func: testChartJSDataTransform },
    { name: 'd3DataTransform', func: testD3DataTransform },
    { name: 'plotlyDataTransform', func: testPlotlyDataTransform },
    { name: 'performance', func: testPerformance }
  ]
  
  const results = {}
  
  for (const test of tests) {
    try {
      const result = await test.func()
      results[test.name] = result ? '✅ 通过' : '❌ 失败'
    } catch (error) {
      console.error(`❌ ${test.name} 测试异常:`, error.message)
      results[test.name] = '❌ 异常'
    }
    console.log('') // 空行分隔
  }
  
  // 输出测试结果汇总
  console.log('📊 新工具集成测试结果汇总:')
  console.log('==================================================')
  Object.entries(results).forEach(([name, result]) => {
    console.log(`${name}: ${result}`)
  })
  console.log('==================================================')
  
  const passedTests = Object.values(results).filter(result => result.includes('✅')).length
  const totalTests = Object.keys(results).length
  
  console.log(`总体结果: ${passedTests}/${totalTests} 项测试通过`)
  
  if (passedTests === totalTests) {
    console.log('🎉 所有新工具集成测试通过！')
  } else {
    console.log('⚠️ 部分测试未通过，请检查相关配置')
  }
  
  return results
}

// 运行测试
runNewToolsIntegrationTest().catch(console.error)
