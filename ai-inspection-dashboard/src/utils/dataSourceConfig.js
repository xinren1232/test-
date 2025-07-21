/**
 * 数据源配置管理
 * 定义不同数据源的处理逻辑和配置信息
 */

/**
 * 数据源类型枚举
 */
export const DATA_SOURCE_TYPES = {
  D8_REPORT: '8D报告',
  REGULAR_CASE: '常规案例',
  DATA_TABLE: '数据表格',
  IMAGE_DOCUMENT: '图像文档',
  ONLINE_DATA: '在线数据'
}

/**
 * 数据源配置
 */
export const DATA_SOURCE_CONFIG = {
  [DATA_SOURCE_TYPES.D8_REPORT]: {
    type: DATA_SOURCE_TYPES.D8_REPORT,
    title: '8D问题解决报告',
    description: '标准8D方法论报告，包含D1-D8完整步骤的问题解决文档',
    icon: 'Notebook',
    features: ['结构化解析', '步骤验证', '完整性检查', '根本原因分析'],
    formats: ['PDF', 'Word', 'TXT'],
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ],
    acceptTypes: '.pdf,.doc,.docx,.txt',
    maxSize: 10, // MB
    instructions: '请上传包含8D方法论步骤的问题解决报告文档',
    processingMethod: '按D1-D8步骤结构化解析，提取团队信息、问题描述、根本原因等关键数据',
    uploadTip: '支持PDF、Word、TXT格式，文件大小不超过10MB',
    examples: [
      { 
        name: '标准8D报告模板.pdf', 
        description: '包含完整D1-D8步骤的标准模板',
        url: '/examples/8d-template.pdf'
      },
      { 
        name: '质量问题8D分析.docx', 
        description: '实际质量问题的8D分析案例',
        url: '/examples/quality-8d-case.docx'
      },
      { 
        name: '设备故障8D报告.pdf', 
        description: '设备故障问题的8D解决过程',
        url: '/examples/equipment-8d-report.pdf'
      }
    ],
    cleaningRules: {
      required: ['remove_empty', 'trim_whitespace', 'standardize_terms'],
      optional: ['format_date', 'extract_keywords', 'validate_required'],
      custom: ['validate_d8_structure', 'extract_d8_steps']
    },
    qualityMetrics: {
      completeness: { weight: 0.4, threshold: 80 },
      accuracy: { weight: 0.3, threshold: 85 },
      consistency: { weight: 0.3, threshold: 75 }
    }
  },

  [DATA_SOURCE_TYPES.REGULAR_CASE]: {
    type: DATA_SOURCE_TYPES.REGULAR_CASE,
    title: '常规问题案例',
    description: '一般性问题分析案例，包含问题描述、分析过程、解决方案等内容',
    icon: 'Files',
    features: ['智能分段', '关键词提取', '结构识别', '经验总结'],
    formats: ['PDF', 'Word', 'Excel', 'TXT'],
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ],
    acceptTypes: '.pdf,.doc,.docx,.xlsx,.xls,.txt',
    maxSize: 15, // MB
    instructions: '请上传包含问题分析过程的案例文档',
    processingMethod: '智能识别案例结构，提取问题描述、分析过程、解决方案等关键信息',
    uploadTip: '支持PDF、Word、Excel、TXT格式，文件大小不超过15MB',
    examples: [
      { 
        name: '设备故障案例.pdf', 
        description: '设备故障分析和处理案例',
        url: '/examples/equipment-failure-case.pdf'
      },
      { 
        name: '质量改进案例.xlsx', 
        description: '质量改进项目的详细记录',
        url: '/examples/quality-improvement-case.xlsx'
      },
      { 
        name: '工艺优化案例.docx', 
        description: '生产工艺优化的实施案例',
        url: '/examples/process-optimization-case.docx'
      }
    ],
    cleaningRules: {
      required: ['remove_empty', 'trim_whitespace', 'remove_duplicates'],
      optional: ['format_date', 'format_number', 'extract_keywords'],
      custom: ['validate_case_structure', 'extract_case_sections']
    },
    qualityMetrics: {
      completeness: { weight: 0.35, threshold: 75 },
      accuracy: { weight: 0.35, threshold: 80 },
      consistency: { weight: 0.3, threshold: 70 }
    }
  },

  [DATA_SOURCE_TYPES.DATA_TABLE]: {
    type: DATA_SOURCE_TYPES.DATA_TABLE,
    title: '结构化数据表格',
    description: '包含结构化数据的表格文件，如检验记录、统计数据等',
    icon: 'DataAnalysis',
    features: ['表格解析', '数据验证', '统计分析', '异常检测'],
    formats: ['Excel', 'CSV'],
    mimeTypes: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ],
    acceptTypes: '.xlsx,.xls,.csv',
    maxSize: 50, // MB
    instructions: '请上传包含结构化数据的表格文件',
    processingMethod: '解析表格结构，验证数据完整性，进行统计分析和质量检查',
    uploadTip: '支持Excel、CSV格式，建议第一行为列标题，文件大小不超过50MB',
    examples: [
      { 
        name: '检验数据记录.xlsx', 
        description: '产品检验数据的统计记录',
        url: '/examples/inspection-data.xlsx'
      },
      { 
        name: '质量指标统计.csv', 
        description: '质量指标的历史统计数据',
        url: '/examples/quality-metrics.csv'
      },
      { 
        name: '生产数据汇总.xlsx', 
        description: '生产过程数据的汇总表格',
        url: '/examples/production-summary.xlsx'
      }
    ],
    cleaningRules: {
      required: ['remove_empty', 'trim_whitespace', 'format_number'],
      optional: ['format_date', 'validate_range', 'remove_duplicates'],
      custom: ['validate_table_structure', 'detect_outliers']
    },
    qualityMetrics: {
      completeness: { weight: 0.4, threshold: 90 },
      accuracy: { weight: 0.4, threshold: 95 },
      consistency: { weight: 0.2, threshold: 85 }
    }
  },

  [DATA_SOURCE_TYPES.IMAGE_DOCUMENT]: {
    type: DATA_SOURCE_TYPES.IMAGE_DOCUMENT,
    title: '图像和扫描文档',
    description: '包含图片、图表、扫描件等多媒体内容的文档',
    icon: 'PictureRounded',
    features: ['OCR识别', '图表提取', '内容分析', '图像增强'],
    formats: ['PDF', 'JPG', 'PNG', 'BMP'],
    mimeTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/bmp',
      'image/tiff'
    ],
    acceptTypes: '.pdf,.jpg,.jpeg,.png,.bmp,.tiff',
    maxSize: 20, // MB
    instructions: '请上传包含图片、图表或扫描内容的文档',
    processingMethod: '使用OCR技术识别文字，提取图表信息，分析多媒体内容',
    uploadTip: '支持PDF、JPG、PNG等格式，建议图片清晰度不低于300DPI，文件大小不超过20MB',
    examples: [
      { 
        name: '检验报告扫描件.pdf', 
        description: '扫描的检验报告文档',
        url: '/examples/inspection-report-scan.pdf'
      },
      { 
        name: '流程图分析.png', 
        description: '包含流程图的分析文档',
        url: '/examples/process-flowchart.png'
      },
      { 
        name: '设备照片记录.jpg', 
        description: '设备状态的照片记录',
        url: '/examples/equipment-photos.jpg'
      }
    ],
    cleaningRules: {
      required: ['remove_empty', 'trim_whitespace'],
      optional: ['format_date', 'extract_keywords'],
      custom: ['ocr_text_extraction', 'image_quality_check']
    },
    qualityMetrics: {
      completeness: { weight: 0.3, threshold: 70 },
      accuracy: { weight: 0.5, threshold: 75 },
      consistency: { weight: 0.2, threshold: 65 }
    }
  },

  [DATA_SOURCE_TYPES.ONLINE_DATA]: {
    type: DATA_SOURCE_TYPES.ONLINE_DATA,
    title: '在线数据源',
    description: '从在线系统、数据库或API接口获取的实时数据',
    icon: 'Connection',
    features: ['实时同步', 'API集成', '自动更新', '数据监控'],
    formats: ['JSON', 'XML', 'API'],
    mimeTypes: [
      'application/json',
      'application/xml',
      'text/xml'
    ],
    acceptTypes: '.json,.xml',
    maxSize: 100, // MB
    instructions: '配置在线数据源连接，或上传数据导出文件',
    processingMethod: '连接在线数据源，实时获取和同步数据，进行实时质量监控',
    uploadTip: '支持JSON、XML格式，或配置API接口连接，文件大小不超过100MB',
    examples: [
      { 
        name: '系统导出数据.json', 
        description: '从业务系统导出的JSON数据',
        url: '/examples/system-export.json'
      },
      { 
        name: 'API数据样例.xml', 
        description: 'API接口返回的XML数据样例',
        url: '/examples/api-sample.xml'
      },
      { 
        name: '实时监控数据.json', 
        description: '实时监控系统的数据格式',
        url: '/examples/realtime-monitoring.json'
      }
    ],
    cleaningRules: {
      required: ['remove_empty', 'trim_whitespace', 'validate_required'],
      optional: ['format_date', 'format_number', 'validate_range'],
      custom: ['validate_json_schema', 'real_time_validation']
    },
    qualityMetrics: {
      completeness: { weight: 0.3, threshold: 95 },
      accuracy: { weight: 0.4, threshold: 98 },
      consistency: { weight: 0.3, threshold: 90 }
    }
  }
}

/**
 * 获取数据源配置
 * @param {string} sourceType - 数据源类型
 * @returns {Object} 数据源配置
 */
export function getDataSourceConfig(sourceType) {
  return DATA_SOURCE_CONFIG[sourceType] || null
}

/**
 * 获取所有数据源配置
 * @returns {Array} 数据源配置列表
 */
export function getAllDataSourceConfigs() {
  return Object.values(DATA_SOURCE_CONFIG)
}

/**
 * 验证文件是否符合数据源要求
 * @param {File} file - 文件对象
 * @param {string} sourceType - 数据源类型
 * @returns {Object} 验证结果
 */
export function validateFileForDataSource(file, sourceType) {
  const config = getDataSourceConfig(sourceType)
  if (!config) {
    return { valid: false, message: '无效的数据源类型' }
  }

  // 检查文件类型
  const isValidType = config.mimeTypes.includes(file.type) ||
                     config.formats.some(format => 
                       file.name.toLowerCase().endsWith(`.${format.toLowerCase()}`)
                     )

  if (!isValidType) {
    return { 
      valid: false, 
      message: `${config.title}只支持 ${config.formats.join('、')} 格式!` 
    }
  }

  // 检查文件大小
  const fileSizeMB = file.size / 1024 / 1024
  if (fileSizeMB > config.maxSize) {
    return { 
      valid: false, 
      message: `${config.title}文件大小不能超过 ${config.maxSize}MB!` 
    }
  }

  return { valid: true, message: '文件验证通过' }
}

/**
 * 获取数据源的清洗规则配置
 * @param {string} sourceType - 数据源类型
 * @returns {Object} 清洗规则配置
 */
export function getCleaningRulesForDataSource(sourceType) {
  const config = getDataSourceConfig(sourceType)
  return config ? config.cleaningRules : null
}

/**
 * 获取数据源的质量指标配置
 * @param {string} sourceType - 数据源类型
 * @returns {Object} 质量指标配置
 */
export function getQualityMetricsForDataSource(sourceType) {
  const config = getDataSourceConfig(sourceType)
  return config ? config.qualityMetrics : null
}
