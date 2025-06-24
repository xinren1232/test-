/**
 * 统一数据定义
 * 定义系统中使用的数据结构和类型
 */

// 定义存储键
export const STORAGE_KEYS = {
  INVENTORY: 'unified_inventory_data',
  LAB: 'unified_lab_data',
  FACTORY: 'unified_factory_data',
  HISTORICAL_INVENTORY: 'historical_inventory_data',
  HISTORICAL_LAB: 'historical_test_data',
  HISTORICAL_FACTORY: 'historical_online_data'
};

// 定义数据字段映射
export const FIELD_MAPPINGS = {
  // 物料字段映射
  MATERIAL: {
    CODE: ['materialCode', 'material_code', 'code'],
    NAME: ['materialName', 'material_name', 'name'],
    TYPE: ['materialType', 'material_type', 'type', 'category']
  },
  
  // 批次字段映射
  BATCH: {
    NO: ['batchNo', 'batch_no', 'batchNumber', 'batch_number', 'batch'],
    DATE: ['batchDate', 'batch_date', 'manufactureDate', 'manufacture_date']
  },
  
  // 供应商字段映射
  SUPPLIER: {
    NAME: ['supplier', 'supplierName', 'supplier_name', 'vendor'],
    CODE: ['supplierCode', 'supplier_code', 'vendorCode']
  },
  
  // 质量字段映射
  QUALITY: {
    DEFECT_RATE: ['defectRate', 'defect_rate', 'failure_rate', 'failureRate'],
    DEFECTS: ['defects', 'defect_list', 'defectList', 'failures'],
    DEFECT: ['defect', 'defect_description', 'defectDescription']
  }
};

// 定义数据格式类型
export const DATA_FORMATS = {
  // 批次号格式: 6位数字，100000-999999
  BATCH_NO: /^\d{6}$/,
  
  // 物料编码格式: M开头，后面跟4-6位数字
  MATERIAL_CODE: /^M\d{4,6}$/,
  
  // 日期格式: ISO 8601
  DATE_ISO: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
  
  // 数字格式
  NUMBER: /^-?\d+(\.\d+)?$/,
  
  // 百分比格式(可带%符号或不带)
  PERCENTAGE: /^-?\d+(\.\d+)?%?$/
};

// 定义默认的空导出，防止导入错误
export default {
  STORAGE_KEYS,
  FIELD_MAPPINGS,
  DATA_FORMATS
}; 