/**
 * 多媒体内容处理模块
 * 用于提取和处理图片、表格等多媒体内容
 */

/**
 * 支持的媒体类型
 */
const SUPPORTED_MEDIA_TYPES = {
  images: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp']
  },
  tables: {
    indicators: ['表格', '表', 'table', '数据', '统计'],
    patterns: [
      /\|.*\|.*\|/g,  // Markdown表格
      /┌.*┐/g,        // ASCII表格
      /\+.*\+.*\+/g   // 简单表格
    ]
  },
  charts: {
    indicators: ['图表', '图', 'chart', '柱状图', '饼图', '折线图'],
    types: ['bar', 'pie', 'line', 'scatter', 'area']
  }
}

/**
 * 处理多媒体内容
 * @param {string} content - 文档内容
 * @param {Array} files - 文件列表
 * @param {Object} options - 处理选项
 * @returns {Object} 处理结果
 */
export async function processMediaContent(content, files = [], options = {}) {
  try {
    const result = {
      processTime: new Date().toISOString(),
      mediaItems: [],
      summary: {
        totalItems: 0,
        images: 0,
        tables: 0,
        charts: 0,
        other: 0
      },
      extractedData: {},
      issues: []
    }

    // 处理文本中的表格
    const tables = extractTablesFromText(content)
    result.mediaItems.push(...tables)
    result.summary.tables = tables.length

    // 处理图片引用
    const imageRefs = extractImageReferences(content)
    result.mediaItems.push(...imageRefs)

    // 处理上传的文件
    if (files.length > 0) {
      const fileResults = await processUploadedFiles(files, options)
      result.mediaItems.push(...fileResults.items)
      result.summary.images += fileResults.images
      result.summary.other += fileResults.other
    }

    // 识别图表描述
    const chartDescriptions = extractChartDescriptions(content)
    result.mediaItems.push(...chartDescriptions)
    result.summary.charts = chartDescriptions.length

    // 更新总计
    result.summary.totalItems = result.mediaItems.length

    // 提取结构化数据
    result.extractedData = extractStructuredData(result.mediaItems)

    // 识别问题
    result.issues = identifyMediaIssues(result.mediaItems, result.summary)

    return result
  } catch (error) {
    console.error('多媒体内容处理失败:', error)
    return {
      processTime: new Date().toISOString(),
      error: error.message,
      success: false
    }
  }
}

/**
 * 从文本中提取表格
 * @param {string} content - 文本内容
 * @returns {Array} 表格列表
 */
function extractTablesFromText(content) {
  const tables = []
  let tableIndex = 0

  // 检测Markdown表格
  const markdownTables = content.match(/\|.*\|[\s\S]*?\n(?!\|)/g)
  if (markdownTables) {
    markdownTables.forEach(tableText => {
      const table = parseMarkdownTable(tableText, tableIndex++)
      if (table) {
        tables.push(table)
      }
    })
  }

  // 检测ASCII表格
  const asciiTables = content.match(/[┌┬┐][\s\S]*?[└┴┘]/g)
  if (asciiTables) {
    asciiTables.forEach(tableText => {
      const table = parseAsciiTable(tableText, tableIndex++)
      if (table) {
        tables.push(table)
      }
    })
  }

  // 检测简单分隔符表格
  const simpleTables = extractSimpleTables(content, tableIndex)
  tables.push(...simpleTables)

  return tables
}

/**
 * 解析Markdown表格
 * @param {string} tableText - 表格文本
 * @param {number} index - 表格索引
 * @returns {Object|null} 表格对象
 */
function parseMarkdownTable(tableText, index) {
  try {
    const lines = tableText.trim().split('\n').filter(line => line.includes('|'))
    if (lines.length < 2) return null

    const headers = lines[0].split('|').map(cell => cell.trim()).filter(cell => cell)
    const rows = []

    for (let i = 2; i < lines.length; i++) {
      const cells = lines[i].split('|').map(cell => cell.trim()).filter(cell => cell)
      if (cells.length > 0) {
        rows.push(cells)
      }
    }

    return {
      type: 'table',
      subtype: 'markdown',
      id: `table_${index}`,
      title: `表格 ${index + 1}`,
      headers,
      rows,
      rowCount: rows.length,
      columnCount: headers.length,
      source: 'text_extraction',
      confidence: 90
    }
  } catch (error) {
    console.error('解析Markdown表格失败:', error)
    return null
  }
}

/**
 * 解析ASCII表格
 * @param {string} tableText - 表格文本
 * @param {number} index - 表格索引
 * @returns {Object|null} 表格对象
 */
function parseAsciiTable(tableText, index) {
  try {
    const lines = tableText.split('\n').filter(line => line.trim())
    if (lines.length < 3) return null

    // 简化处理，提取可见的文本内容
    const dataLines = lines.filter(line => 
      !line.match(/^[┌┬┐└┴┘├┼┤─│\s]+$/)
    )

    const headers = []
    const rows = []

    dataLines.forEach((line, i) => {
      const cells = line.split('│').map(cell => cell.trim()).filter(cell => cell)
      if (i === 0) {
        headers.push(...cells)
      } else {
        rows.push(cells)
      }
    })

    return {
      type: 'table',
      subtype: 'ascii',
      id: `table_${index}`,
      title: `表格 ${index + 1}`,
      headers,
      rows,
      rowCount: rows.length,
      columnCount: headers.length,
      source: 'text_extraction',
      confidence: 75
    }
  } catch (error) {
    console.error('解析ASCII表格失败:', error)
    return null
  }
}

/**
 * 提取简单表格
 * @param {string} content - 内容
 * @param {number} startIndex - 起始索引
 * @returns {Array} 表格列表
 */
function extractSimpleTables(content, startIndex) {
  const tables = []
  const tablePatterns = [
    /表\s*\d+[：:]\s*([^\n]+)\n([\s\S]*?)(?=\n\s*\n|\n\s*[表图]|\n\s*\d+\.)/g,
    /数据统计[：:]?\s*\n([\s\S]*?)(?=\n\s*\n|\n\s*[表图])/g
  ]

  tablePatterns.forEach(pattern => {
    let match
    while ((match = pattern.exec(content)) !== null) {
      const tableData = parseSimpleTableData(match[1] || match[0], startIndex + tables.length)
      if (tableData) {
        tables.push(tableData)
      }
    }
  })

  return tables
}

/**
 * 解析简单表格数据
 * @param {string} data - 表格数据
 * @param {number} index - 索引
 * @returns {Object|null} 表格对象
 */
function parseSimpleTableData(data, index) {
  try {
    const lines = data.split('\n').filter(line => line.trim())
    if (lines.length < 2) return null

    const rows = []
    lines.forEach(line => {
      // 尝试多种分隔符
      const separators = ['\t', '  ', '，', ',', '：', ':']
      for (const sep of separators) {
        if (line.includes(sep)) {
          const cells = line.split(sep).map(cell => cell.trim()).filter(cell => cell)
          if (cells.length > 1) {
            rows.push(cells)
            break
          }
        }
      }
    })

    if (rows.length === 0) return null

    return {
      type: 'table',
      subtype: 'simple',
      id: `table_${index}`,
      title: `数据表 ${index + 1}`,
      headers: rows[0],
      rows: rows.slice(1),
      rowCount: rows.length - 1,
      columnCount: rows[0].length,
      source: 'text_extraction',
      confidence: 60
    }
  } catch (error) {
    console.error('解析简单表格失败:', error)
    return null
  }
}

/**
 * 提取图片引用
 * @param {string} content - 内容
 * @returns {Array} 图片引用列表
 */
function extractImageReferences(content) {
  const images = []
  const imagePatterns = [
    /图\s*\d+[：:]\s*([^\n]+)/g,
    /图片[：:]\s*([^\n]+)/g,
    /!\[([^\]]*)\]\(([^)]+)\)/g,  // Markdown图片
    /<img[^>]+src="([^"]+)"[^>]*>/g  // HTML图片
  ]

  imagePatterns.forEach((pattern, patternIndex) => {
    let match
    while ((match = pattern.exec(content)) !== null) {
      const imageRef = {
        type: 'image',
        subtype: 'reference',
        id: `image_ref_${images.length}`,
        title: match[1] || `图片引用 ${images.length + 1}`,
        source: 'text_reference',
        confidence: 80
      }

      if (patternIndex === 2) { // Markdown
        imageRef.alt = match[1]
        imageRef.url = match[2]
      } else if (patternIndex === 3) { // HTML
        imageRef.url = match[1]
      }

      images.push(imageRef)
    }
  })

  return images
}

/**
 * 处理上传的文件
 * @param {Array} files - 文件列表
 * @param {Object} options - 选项
 * @returns {Object} 处理结果
 */
async function processUploadedFiles(files, options) {
  const result = {
    items: [],
    images: 0,
    other: 0
  }

  for (const file of files) {
    try {
      if (isImageFile(file)) {
        const imageItem = await processImageFile(file, result.images)
        result.items.push(imageItem)
        result.images++
      } else {
        const otherItem = await processOtherFile(file, result.other)
        result.items.push(otherItem)
        result.other++
      }
    } catch (error) {
      console.error(`处理文件${file.name}失败:`, error)
    }
  }

  return result
}

/**
 * 检查是否为图片文件
 * @param {File} file - 文件对象
 * @returns {boolean} 是否为图片
 */
function isImageFile(file) {
  return SUPPORTED_MEDIA_TYPES.images.mimeTypes.includes(file.type) ||
         SUPPORTED_MEDIA_TYPES.images.extensions.some(ext => 
           file.name.toLowerCase().endsWith(ext)
         )
}

/**
 * 处理图片文件
 * @param {File} file - 图片文件
 * @param {number} index - 索引
 * @returns {Object} 图片对象
 */
async function processImageFile(file, index) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      resolve({
        type: 'image',
        subtype: 'uploaded',
        id: `image_${index}`,
        title: file.name,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        dataUrl: e.target.result,
        source: 'file_upload',
        confidence: 100
      })
    }
    
    reader.onerror = () => {
      resolve({
        type: 'image',
        subtype: 'error',
        id: `image_${index}`,
        title: file.name,
        error: '图片读取失败',
        source: 'file_upload',
        confidence: 0
      })
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * 处理其他文件
 * @param {File} file - 文件
 * @param {number} index - 索引
 * @returns {Object} 文件对象
 */
async function processOtherFile(file, index) {
  return {
    type: 'file',
    subtype: 'other',
    id: `file_${index}`,
    title: file.name,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    source: 'file_upload',
    confidence: 100
  }
}

/**
 * 提取图表描述
 * @param {string} content - 内容
 * @returns {Array} 图表描述列表
 */
function extractChartDescriptions(content) {
  const charts = []
  const chartPatterns = [
    /图表\s*\d+[：:]\s*([^\n]+)/g,
    /(柱状图|饼图|折线图|散点图|面积图)[：:]?\s*([^\n]+)/g,
    /数据显示[：:]?\s*([^\n]+)/g
  ]

  chartPatterns.forEach((pattern, patternIndex) => {
    let match
    while ((match = pattern.exec(content)) !== null) {
      const chart = {
        type: 'chart',
        subtype: 'description',
        id: `chart_${charts.length}`,
        title: match[1] || match[2] || `图表 ${charts.length + 1}`,
        description: match[0],
        source: 'text_extraction',
        confidence: 70
      }

      if (patternIndex === 1) {
        chart.chartType = match[1]
        chart.title = match[2] || match[1]
      }

      charts.push(chart)
    }
  })

  return charts
}

/**
 * 提取结构化数据
 * @param {Array} mediaItems - 媒体项目列表
 * @returns {Object} 结构化数据
 */
function extractStructuredData(mediaItems) {
  const structuredData = {
    tables: {
      count: 0,
      totalRows: 0,
      totalColumns: 0,
      data: []
    },
    images: {
      count: 0,
      totalSize: 0,
      formats: {},
      data: []
    },
    charts: {
      count: 0,
      types: {},
      data: []
    }
  }

  mediaItems.forEach(item => {
    switch (item.type) {
      case 'table':
        structuredData.tables.count++
        structuredData.tables.totalRows += item.rowCount || 0
        structuredData.tables.totalColumns += item.columnCount || 0
        structuredData.tables.data.push({
          id: item.id,
          title: item.title,
          rows: item.rowCount,
          columns: item.columnCount,
          headers: item.headers
        })
        break

      case 'image':
        structuredData.images.count++
        if (item.fileSize) {
          structuredData.images.totalSize += item.fileSize
        }
        if (item.mimeType) {
          structuredData.images.formats[item.mimeType] =
            (structuredData.images.formats[item.mimeType] || 0) + 1
        }
        structuredData.images.data.push({
          id: item.id,
          title: item.title,
          size: item.fileSize,
          format: item.mimeType
        })
        break

      case 'chart':
        structuredData.charts.count++
        if (item.chartType) {
          structuredData.charts.types[item.chartType] =
            (structuredData.charts.types[item.chartType] || 0) + 1
        }
        structuredData.charts.data.push({
          id: item.id,
          title: item.title,
          type: item.chartType,
          description: item.description
        })
        break
    }
  })

  return structuredData
}

/**
 * 识别媒体问题
 * @param {Array} mediaItems - 媒体项目列表
 * @param {Object} summary - 摘要信息
 * @returns {Array} 问题列表
 */
function identifyMediaIssues(mediaItems, summary) {
  const issues = []

  // 检查媒体内容数量
  if (summary.totalItems === 0) {
    issues.push({
      type: 'no_media_content',
      severity: 'low',
      message: '文档中未发现图片、表格等多媒体内容'
    })
  }

  // 检查表格质量
  const lowQualityTables = mediaItems.filter(item =>
    item.type === 'table' && item.confidence < 70
  )
  if (lowQualityTables.length > 0) {
    issues.push({
      type: 'low_quality_tables',
      severity: 'medium',
      message: `发现${lowQualityTables.length}个质量较低的表格，可能解析不准确`,
      items: lowQualityTables.map(t => t.id)
    })
  }

  // 检查图片引用
  const brokenImageRefs = mediaItems.filter(item =>
    item.type === 'image' && item.subtype === 'reference' && !item.url
  )
  if (brokenImageRefs.length > 0) {
    issues.push({
      type: 'broken_image_references',
      severity: 'medium',
      message: `发现${brokenImageRefs.length}个无效的图片引用`,
      items: brokenImageRefs.map(i => i.id)
    })
  }

  // 检查文件大小
  const largeFiles = mediaItems.filter(item =>
    item.fileSize && item.fileSize > 5 * 1024 * 1024 // 5MB
  )
  if (largeFiles.length > 0) {
    issues.push({
      type: 'large_files',
      severity: 'low',
      message: `发现${largeFiles.length}个大文件，可能影响处理性能`,
      items: largeFiles.map(f => ({ id: f.id, size: f.fileSize }))
    })
  }

  return issues
}

/**
 * 生成媒体内容报告
 * @param {Object} processResult - 处理结果
 * @returns {Object} 报告
 */
export function generateMediaReport(processResult) {
  const report = {
    summary: processResult.summary,
    details: {
      tables: [],
      images: [],
      charts: []
    },
    recommendations: []
  }

  // 生成详细信息
  processResult.mediaItems.forEach(item => {
    const detail = {
      id: item.id,
      title: item.title,
      type: item.type,
      subtype: item.subtype,
      confidence: item.confidence,
      source: item.source
    }

    switch (item.type) {
      case 'table':
        detail.rows = item.rowCount
        detail.columns = item.columnCount
        detail.headers = item.headers
        report.details.tables.push(detail)
        break
      case 'image':
        detail.size = item.fileSize
        detail.format = item.mimeType
        report.details.images.push(detail)
        break
      case 'chart':
        detail.chartType = item.chartType
        detail.description = item.description
        report.details.charts.push(detail)
        break
    }
  })

  // 生成建议
  if (processResult.summary.tables > 0) {
    report.recommendations.push({
      type: 'table_optimization',
      title: '表格数据优化',
      description: '建议对提取的表格数据进行验证和格式化',
      priority: 'medium'
    })
  }

  if (processResult.summary.images > 0) {
    report.recommendations.push({
      type: 'image_processing',
      title: '图片内容分析',
      description: '建议对图片进行OCR识别或内容分析',
      priority: 'low'
    })
  }

  if (processResult.issues.length > 0) {
    report.recommendations.push({
      type: 'issue_resolution',
      title: '问题修复',
      description: `发现${processResult.issues.length}个问题，建议逐一处理`,
      priority: 'high'
    })
  }

  return report
}

/**
 * 导出表格数据
 * @param {Array} tables - 表格列表
 * @param {string} format - 导出格式 (csv, json, excel)
 * @returns {string|Object} 导出数据
 */
export function exportTableData(tables, format = 'json') {
  switch (format.toLowerCase()) {
    case 'csv':
      return tables.map(table => {
        const csvRows = [table.headers.join(',')]
        table.rows.forEach(row => {
          csvRows.push(row.join(','))
        })
        return `# ${table.title}\n${csvRows.join('\n')}`
      }).join('\n\n')

    case 'json':
      return JSON.stringify(tables.map(table => ({
        id: table.id,
        title: table.title,
        headers: table.headers,
        rows: table.rows,
        metadata: {
          rowCount: table.rowCount,
          columnCount: table.columnCount,
          confidence: table.confidence
        }
      })), null, 2)

    case 'excel':
      // 这里需要集成Excel导出库
      return {
        message: 'Excel导出需要额外的库支持',
        data: tables
      }

    default:
      return tables
  }
}

/**
 * 获取媒体统计信息
 * @param {Array} mediaItems - 媒体项目列表
 * @returns {Object} 统计信息
 */
export function getMediaStatistics(mediaItems) {
  const stats = {
    total: mediaItems.length,
    byType: {},
    bySource: {},
    byConfidence: {
      high: 0,    // >= 80
      medium: 0,  // 50-79
      low: 0      // < 50
    },
    averageConfidence: 0
  }

  let totalConfidence = 0

  mediaItems.forEach(item => {
    // 按类型统计
    stats.byType[item.type] = (stats.byType[item.type] || 0) + 1

    // 按来源统计
    stats.bySource[item.source] = (stats.bySource[item.source] || 0) + 1

    // 按置信度统计
    if (item.confidence >= 80) {
      stats.byConfidence.high++
    } else if (item.confidence >= 50) {
      stats.byConfidence.medium++
    } else {
      stats.byConfidence.low++
    }

    totalConfidence += item.confidence
  })

  // 计算平均置信度
  stats.averageConfidence = mediaItems.length > 0 ?
    Math.round(totalConfidence / mediaItems.length) : 0

  return stats
}
