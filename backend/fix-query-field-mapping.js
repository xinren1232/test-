import mysql from 'mysql2/promise';

/**
 * 修复查询字段映射问题
 * 更新intelligentIntentService.js中的executeSQLQuery方法，使其正确使用result_fields进行字段映射
 */

async function fixQueryFieldMapping() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });
  
  try {
    console.log('=== 修复查询字段映射问题 ===\n');
    
    // 1. 验证所有规则都有正确的result_fields
    const [rules] = await connection.execute(`
      SELECT id, intent_name, result_fields, action_type
      FROM nlp_intent_rules 
      WHERE action_type = 'SQL_QUERY'
      ORDER BY id
    `);
    
    console.log(`检查 ${rules.length} 条SQL查询规则的字段映射...\n`);
    
    let validCount = 0;
    let invalidCount = 0;
    
    for (const rule of rules) {
      console.log(`规则: ${rule.intent_name}`);
      
      if (rule.result_fields && Array.isArray(rule.result_fields) && rule.result_fields.length > 0) {
        console.log(`  ✅ 字段映射: ${rule.result_fields.join(', ')}`);
        validCount++;
      } else {
        console.log(`  ❌ 字段映射: 无效或为空`);
        invalidCount++;
        
        // 为无效的规则设置默认字段映射
        let defaultFields = [];
        if (rule.intent_name.includes('inventory') || rule.intent_name.includes('库存')) {
          defaultFields = ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'];
        } else if (rule.intent_name.includes('testing') || rule.intent_name.includes('test') || rule.intent_name.includes('测试')) {
          defaultFields = ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注'];
        } else if (rule.intent_name.includes('production') || rule.intent_name.includes('online') || rule.intent_name.includes('上线')) {
          defaultFields = ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '不良现象', '检验日期', '备注'];
        } else {
          defaultFields = ['工厂', '物料编码', '物料名称', '供应商', '数量', '状态', '备注'];
        }
        
        await connection.execute(`
          UPDATE nlp_intent_rules 
          SET result_fields = ? 
          WHERE id = ?
        `, [JSON.stringify(defaultFields), rule.id]);
        
        console.log(`  🔧 已设置默认字段: ${defaultFields.join(', ')}`);
        validCount++;
        invalidCount--;
      }
    }
    
    console.log(`\n字段映射检查完成:`);
    console.log(`  有效规则: ${validCount}`);
    console.log(`  无效规则: ${invalidCount}`);
    
    // 2. 创建字段映射工具函数
    console.log('\n=== 创建字段映射工具函数 ===');
    
    const fieldMappingUtilCode = `
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
    console.warn(\`规则 \${intentName} 没有定义result_fields，返回原始数据\`);
    return queryResults;
  }
  
  console.log(\`应用字段映射 [\${intentName}]: \${resultFields.join(', ')}\`);
  
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
`;
    
    // 将工具函数写入文件
    const fs = await import('fs');
    await fs.promises.writeFile('src/utils/fieldMappingUtils.js', fieldMappingUtilCode);
    console.log('✅ 字段映射工具函数已创建: src/utils/fieldMappingUtils.js');
    
    console.log('\n=== 修复完成 ===');
    console.log('下一步需要手动更新 intelligentIntentService.js 中的 executeSQLQuery 方法');
    console.log('使其调用 applyFieldMapping 函数来正确映射查询结果');
    
  } catch (error) {
    console.error('修复过程中出错:', error);
  } finally {
    await connection.end();
  }
}

fixQueryFieldMapping().catch(console.error);
