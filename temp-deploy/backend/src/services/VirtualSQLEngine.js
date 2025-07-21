/**
 * 虚拟SQL引擎
 * 用于解析SQL查询并在内存数据上执行
 */

import { logger } from '../utils/logger.js';

// 表名映射到localStorage键名
const TABLE_MAPPING = {
  'inventory': 'inventory',
  'lab_tests': 'inspection',
  'online_tracking': 'production',
  'test_tracking': 'inspection',
  'factory_data': 'production',
  'lab_data': 'inspection',
  'lab_test_data': 'inspection'
};

// 字段映射 - 将SQL字段映射到localStorage数据字段
const FIELD_MAPPING = {
  // 库存字段映射
  'inventory': {
    '工厂': 'factory',
    '仓库': 'warehouse',
    '物料编码': 'materialCode',
    '物料名称': 'materialName',
    '供应商': 'supplier',
    '数量': 'quantity',
    '状态': 'status',
    '入库时间': 'inboundTime',
    '到期时间': 'expiryDate',
    '备注': 'notes'
  },
  
  // 测试字段映射
  'inspection': {
    '测试编号': 'test_id',
    '日期': 'test_date',
    '项目': 'project_id',
    '基线': 'baseline_id',
    '物料编码': 'materialCode',
    '数量': 'quantity',
    '物料名称': 'materialName',
    '供应商': 'supplier',
    '测试结果': 'test_result',
    '不合格描述': 'defect_desc',
    '备注': 'notes'
  },
  
  // 上线字段映射
  'production': {
    '工厂': 'factory',
    '基线': 'baseline_id',
    '项目': 'project_id',
    '物料编码': 'materialCode',
    '物料名称': 'materialName',
    '供应商': 'supplier',
    '批次号': 'batchNo',
    '不良率': 'defectRate',
    '本周异常': 'exception_count',
    '检验日期': 'inspectionDate',
    '备注': 'notes'
  }
};

/**
 * 解析SQL查询
 * @param {string} sql SQL查询语句
 * @returns {Object} 解析结果
 */
function parseSQL(sql) {
  logger.debug('解析SQL查询:', sql);

  // 清理SQL语句，移除多余的空白字符和换行符
  const cleanSQL = sql.replace(/\s+/g, ' ').trim();

  // 简化的SQL解析，支持多行SQL
  const selectMatch = cleanSQL.match(/SELECT\s+(.*?)\s+FROM\s+(\w+)/is);
  if (!selectMatch) {
    throw new Error('无效的SQL查询: 缺少SELECT或FROM子句');
  }
  
  const fieldsStr = selectMatch[1];
  const tableName = selectMatch[2];
  
  // 解析字段
  const fields = fieldsStr.split(',').map(f => f.trim());
  
  // 解析WHERE子句
  const whereMatch = cleanSQL.match(/WHERE\s+(.*?)(?:ORDER BY|LIMIT|$)/is);
  const whereClause = whereMatch ? whereMatch[1].trim() : null;

  // 解析ORDER BY子句
  const orderByMatch = cleanSQL.match(/ORDER BY\s+(.*?)(?:LIMIT|$)/is);
  const orderByClause = orderByMatch ? orderByMatch[1].trim() : null;

  // 解析LIMIT子句
  const limitMatch = cleanSQL.match(/LIMIT\s+(\d+)(?:,\s*(\d+))?/i);
  const limitClause = limitMatch ? {
    offset: limitMatch[2] ? parseInt(limitMatch[1]) : 0,
    limit: limitMatch[2] ? parseInt(limitMatch[2]) : parseInt(limitMatch[1])
  } : null;
  
  return {
    fields,
    tableName,
    whereClause,
    orderByClause,
    limitClause
  };
}

/**
 * 解析WHERE条件
 * @param {string} whereClause WHERE子句
 * @returns {Function} 过滤函数
 */
function parseWhereCondition(whereClause) {
  if (!whereClause) {
    return () => true; // 无条件，返回所有记录
  }

  // 简化的条件解析
  return (record) => {
    try {
      // 替换字段名和值
      let condition = whereClause;

      // 替换字段引用
      for (const field in record) {
        const regex = new RegExp(`\\b${field}\\b`, 'g');
        condition = condition.replace(regex, `record["${field}"]`);
      }

      // 替换操作符
      condition = condition
        .replace(/\s*=\s*/g, ' === ')
        .replace(/\s*<>\s*/g, ' !== ')
        .replace(/\s+AND\s+/gi, ' && ')
        .replace(/\s+OR\s+/gi, ' || ')
        .replace(/\s+LIKE\s+/gi, '.includes(')
        .replace(/IN\s*\((.*?)\)/gi, (match, values) => {
          const items = values.split(',').map(v => v.trim().replace(/'/g, ''));
          return `[${items.map(v => `'${v}'`).join(',')}].includes(record["${field}"])`;
        });

      // 处理LIKE操作
      condition = condition.replace(/record\["([^"]+)"\]\.includes\(([^)]+)\)/g, (match, field, value) => {
        return `record["${field}"] && record["${field}"].toString().includes(${value})`;
      });

      // 执行条件
      return eval(condition);
    } catch (error) {
      logger.error('条件解析错误:', error);
      return false;
    }
  };
}

/**
 * 解析ORDER BY子句
 * @param {string} orderByClause ORDER BY子句
 * @returns {Function} 排序函数
 */
function parseOrderBy(orderByClause) {
  if (!orderByClause) {
    return null; // 无排序
  }
  
  const parts = orderByClause.split(',').map(p => p.trim());
  const sortFields = parts.map(part => {
    const [field, direction] = part.split(/\s+/);
    return {
      field: field.trim(),
      ascending: !direction || direction.toUpperCase() !== 'DESC'
    };
  });
  
  return (a, b) => {
    for (const sort of sortFields) {
      const aValue = a[sort.field];
      const bValue = b[sort.field];
      
      if (aValue < bValue) return sort.ascending ? -1 : 1;
      if (aValue > bValue) return sort.ascending ? 1 : -1;
    }
    return 0;
  };
}

/**
 * 应用字段映射
 * @param {Array} results 查询结果
 * @param {Array} fields 字段列表
 * @param {string} dataType 数据类型
 * @returns {Array} 映射后的结果
 */
function applyFieldMapping(results, fields, dataType) {
  // 如果字段包含*，返回所有字段
  if (fields.includes('*')) {
    return results;
  }
  
  // 解析字段别名
  const fieldMap = fields.map(field => {
    const asMatch = field.match(/(.*?)\s+as\s+(.*)/i);
    if (asMatch) {
      return {
        source: asMatch[1].trim(),
        target: asMatch[2].trim()
      };
    }
    return { source: field, target: field };
  });
  
  // 应用字段映射
  return results.map(record => {
    const mappedRecord = {};
    
    fieldMap.forEach(({ source, target }) => {
      // 处理特殊函数
      if (source.includes('(')) {
        // 处理各种SQL函数
        if (source.startsWith('COUNT(')) {
          mappedRecord[target] = results.length;
        } else if (source.startsWith('SUM(')) {
          const fieldName = source.match(/SUM\((.*?)\)/i)[1];
          mappedRecord[target] = results.reduce((sum, r) => sum + (parseFloat(r[fieldName]) || 0), 0);
        } else if (source.includes('CONCAT(')) {
          // 处理CONCAT函数
          mappedRecord[target] = processConcatFunction(source, record);
        } else if (source.includes('DATE_FORMAT(')) {
          // 处理DATE_FORMAT函数
          mappedRecord[target] = processDateFormatFunction(source, record);
        } else if (source.includes('COALESCE(')) {
          // 处理COALESCE函数
          mappedRecord[target] = processCoalesceFunction(source, record);
        } else if (source.includes('ROUND(')) {
          // 处理ROUND函数
          mappedRecord[target] = processRoundFunction(source, record);
        } else if (source.includes('IFNULL(')) {
          // 处理IFNULL函数
          mappedRecord[target] = processIfNullFunction(source, record);
        } else if (source.includes('CASE ')) {
          // 处理CASE WHEN语句
          mappedRecord[target] = processCaseWhenFunction(source, record);
        } else {
          // 对于其他未实现的函数，尝试提取字段名
          const fieldMatch = source.match(/\w+\(([^)]+)\)/);
          if (fieldMatch) {
            const fieldName = fieldMatch[1].split(',')[0].trim();
            mappedRecord[target] = record[fieldName] || '';
          } else {
            mappedRecord[target] = '';
          }
        }
      } else {
        // 普通字段
        mappedRecord[target] = record[source];
      }
    });
    
    return mappedRecord;
  });
}

/**
 * 处理CONCAT函数
 * @param {string} source - 源字段表达式
 * @param {Object} record - 数据记录
 * @returns {string} 处理结果
 */
function processConcatFunction(source, record) {
  try {
    // 匹配CONCAT函数的参数
    const concatMatch = source.match(/CONCAT\((.*?)\)/i);
    if (!concatMatch) return '';

    const params = concatMatch[1].split(',').map(p => p.trim());
    let result = '';

    for (const param of params) {
      if (param.startsWith("'") && param.endsWith("'")) {
        // 字符串字面量
        result += param.slice(1, -1);
      } else if (param.includes('ROUND(')) {
        // 嵌套的ROUND函数
        const roundResult = processRoundFunction(param, record);
        result += roundResult;
      } else {
        // 字段名
        const fieldValue = record[param] || '';
        result += fieldValue;
      }
    }

    return result;
  } catch (error) {
    return '';
  }
}

/**
 * 处理DATE_FORMAT函数
 * @param {string} source - 源字段表达式
 * @param {Object} record - 数据记录
 * @returns {string} 处理结果
 */
function processDateFormatFunction(source, record) {
  try {
    const dateFormatMatch = source.match(/DATE_FORMAT\(([^,]+),\s*'([^']+)'\)/i);
    if (!dateFormatMatch) return '';

    const fieldName = dateFormatMatch[1].trim();
    const format = dateFormatMatch[2];
    const dateValue = record[fieldName];

    if (!dateValue) return '';

    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return dateValue;

    // 简单的日期格式转换
    switch (format) {
      case '%Y-%m-%d':
        return date.toISOString().split('T')[0];
      case '%Y-%m-%d %H:%i:%s':
        return date.toISOString().replace('T', ' ').split('.')[0];
      case '%m-%d':
        return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      default:
        return date.toISOString().split('T')[0];
    }
  } catch (error) {
    return '';
  }
}

/**
 * 处理COALESCE函数
 * @param {string} source - 源字段表达式
 * @param {Object} record - 数据记录
 * @returns {any} 处理结果
 */
function processCoalesceFunction(source, record) {
  try {
    const coalesceMatch = source.match(/COALESCE\((.*?)\)/i);
    if (!coalesceMatch) return '';

    const params = coalesceMatch[1].split(',').map(p => p.trim());

    for (const param of params) {
      if (param.startsWith("'") && param.endsWith("'")) {
        // 字符串字面量
        return param.slice(1, -1);
      } else {
        // 字段名
        const value = record[param];
        if (value !== null && value !== undefined && value !== '') {
          return value;
        }
      }
    }

    return '';
  } catch (error) {
    return '';
  }
}

/**
 * 处理ROUND函数
 * @param {string} source - 源字段表达式
 * @param {Object} record - 数据记录
 * @returns {number|string} 处理结果
 */
function processRoundFunction(source, record) {
  try {
    const roundMatch = source.match(/ROUND\(([^,]+)(?:,\s*(\d+))?\)/i);
    if (!roundMatch) return '';

    const expression = roundMatch[1].trim();
    const decimals = parseInt(roundMatch[2] || '0');

    let value;

    // 处理数学表达式，如 defect_rate * 100
    if (expression.includes('*')) {
      const parts = expression.split('*').map(p => p.trim());
      const fieldValue = parseFloat(record[parts[0]]) || 0;
      const multiplier = parseFloat(parts[1]) || 1;
      value = fieldValue * multiplier;
    } else {
      value = parseFloat(record[expression]) || 0;
    }

    return Number(value.toFixed(decimals));
  } catch (error) {
    return 0;
  }
}

/**
 * 处理IFNULL函数
 * @param {string} source - 源字段表达式
 * @param {Object} record - 数据记录
 * @returns {any} 处理结果
 */
function processIfNullFunction(source, record) {
  try {
    const ifnullMatch = source.match(/IFNULL\(([^,]+),\s*(.+)\)/i);
    if (!ifnullMatch) return '';

    const fieldName = ifnullMatch[1].trim();
    const defaultValue = ifnullMatch[2].trim();

    const value = record[fieldName];
    if (value === null || value === undefined || value === '') {
      // 返回默认值
      if (defaultValue.startsWith("'") && defaultValue.endsWith("'")) {
        return defaultValue.slice(1, -1);
      } else {
        return record[defaultValue] || defaultValue;
      }
    }

    return value;
  } catch (error) {
    return '';
  }
}

/**
 * 处理CASE WHEN语句
 * @param {string} source - 源字段表达式
 * @param {Object} record - 数据记录
 * @returns {any} 处理结果
 */
function processCaseWhenFunction(source, record) {
  try {
    // 简化的CASE WHEN处理
    const caseMatch = source.match(/CASE\s+WHEN\s+(.+?)\s+THEN\s+(.+?)(?:\s+ELSE\s+(.+?))?\s+END/i);
    if (!caseMatch) return '';

    const condition = caseMatch[1];
    const thenValue = caseMatch[2];
    const elseValue = caseMatch[3] || '';

    // 简单的条件判断
    if (condition.includes('=')) {
      const [field, value] = condition.split('=').map(s => s.trim());
      const fieldValue = record[field];
      const compareValue = value.startsWith("'") && value.endsWith("'") ? value.slice(1, -1) : value;

      if (fieldValue == compareValue) {
        return thenValue.startsWith("'") && thenValue.endsWith("'") ? thenValue.slice(1, -1) : record[thenValue] || thenValue;
      } else {
        return elseValue.startsWith("'") && elseValue.endsWith("'") ? elseValue.slice(1, -1) : record[elseValue] || elseValue;
      }
    }

    return '';
  } catch (error) {
    return '';
  }
}

/**
 * 执行SQL查询
 * @param {string} sql SQL查询语句
 * @param {Object} memoryData 内存数据
 * @returns {Array} 查询结果
 */
export function executeSQL(sql, memoryData) {
  try {
    logger.info('执行SQL查询:', sql);
    
    // 解析SQL
    const { fields, tableName, whereClause, orderByClause, limitClause } = parseSQL(sql);
    
    // 获取数据源
    const dataSourceKey = TABLE_MAPPING[tableName.toLowerCase()];
    if (!dataSourceKey || !memoryData[dataSourceKey]) {
      throw new Error(`未找到数据源: ${tableName}`);
    }
    
    let data = memoryData[dataSourceKey];
    logger.debug(`数据源 ${dataSourceKey} 包含 ${data.length} 条记录`);
    
    // 应用WHERE过滤
    if (whereClause) {
      const filterFn = parseWhereCondition(whereClause);
      data = data.filter(filterFn);
      logger.debug(`WHERE过滤后剩余 ${data.length} 条记录`);
    }
    
    // 应用ORDER BY排序
    if (orderByClause) {
      const sortFn = parseOrderBy(orderByClause);
      if (sortFn) {
        data.sort(sortFn);
        logger.debug('应用ORDER BY排序');
      }
    }
    
    // 应用LIMIT限制
    if (limitClause) {
      data = data.slice(limitClause.offset, limitClause.offset + limitClause.limit);
      logger.debug(`LIMIT限制后剩余 ${data.length} 条记录`);
    }
    
    // 应用字段映射
    const results = applyFieldMapping(data, fields, dataSourceKey);
    logger.info(`SQL查询完成，返回 ${results.length} 条记录`);
    
    return results;
  } catch (error) {
    logger.error('SQL执行错误:', error);
    throw error;
  }
}

export default {
  executeSQL,
  parseSQL
};
