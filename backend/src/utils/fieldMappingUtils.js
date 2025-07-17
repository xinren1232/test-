
/**
 * 字段映射工具函数
 * 根据规则的result_fields配置，将数据库查询结果映射为前端需要的字段格式
 */

/**
 * 应用字段映射到查询结果
 * @param {Array} queryResults - 数据库查询结果
 * @param {Array} resultFields - 目标字段列表
 * @param {string} intentName - 规则名称（用于调试）
 * @returns {Array} 映射后的结果
 */
function applyFieldMapping(queryResults, resultFields, intentName = '') {
  if (!Array.isArray(queryResults) || queryResults.length === 0) {
    return queryResults;
  }
  
  if (!Array.isArray(resultFields) || resultFields.length === 0) {
    console.warn(`规则 ${intentName} 没有定义result_fields，返回原始数据`);
    return queryResults;
  }
  
  console.log(`应用字段映射 [${intentName}]: ${resultFields.join(', ')}`);
  
  return queryResults.map(row => {
    const mappedRow = {};
    const originalKeys = Object.keys(row);
    
    // 为每个目标字段寻找对应的源字段
    resultFields.forEach((targetField, index) => {
      let value = '';
      
      // 1. 直接匹配字段名
      if (row.hasOwnProperty(targetField)) {
        value = row[targetField];
      }
      // 2. 按索引匹配（如果查询结果按顺序返回）
      else if (originalKeys[index]) {
        value = row[originalKeys[index]];
      }
      // 3. 尝试常见的字段映射
      else {
        value = findMappedValue(row, targetField);
      }
      
      mappedRow[targetField] = value || '';
    });
    
    return mappedRow;
  });
}

/**
 * 查找映射值
 * @param {Object} row - 数据行
 * @param {string} targetField - 目标字段
 * @returns {any} 映射的值
 */
function findMappedValue(row, targetField) {
  const fieldMappings = {
    '工厂': ['factory', 'storage_location', 'plant'],
    '仓库': ['warehouse', 'storage_location', 'storage'],
    '物料编码': ['material_code', 'materialCode', 'code'],
    '物料名称': ['material_name', 'materialName', 'name'],
    '供应商': ['supplier', 'supplier_name', 'supplierName'],
    '数量': ['quantity', 'qty', 'amount'],
    '状态': ['status', 'state'],
    '入库时间': ['inbound_time', 'inboundTime', 'created_at'],
    '到期时间': ['expiry_date', 'expiryDate', 'updated_at'],
    '测试编号': ['test_id', 'testId', 'id'],
    '日期': ['test_date', 'testDate', 'date'],
    '项目': ['project', 'project_id', 'projectId'],
    '基线': ['baseline', 'baseline_id', 'baselineId'],
    '测试结果': ['test_result', 'testResult', 'result'],
    '不合格描述': ['defect_desc', 'defectDesc', 'conclusion'],
    '批次号': ['batch_code', 'batchCode', 'batch_no'],
    '不良率': ['defect_rate', 'defectRate'],
    '不良现象': ['weekly_anomaly', 'weeklyAnomaly', 'defect_desc'],
    '检验日期': ['inspection_date', 'inspectionDate', 'online_date'],
    '备注': ['notes', 'remark', 'comment']
  };
  
  const possibleFields = fieldMappings[targetField] || [];
  
  for (const field of possibleFields) {
    if (row.hasOwnProperty(field)) {
      return row[field];
    }
  }
  
  return '';
}

export { applyFieldMapping };
