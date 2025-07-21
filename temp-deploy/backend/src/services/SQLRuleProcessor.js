/**
 * SQL规则处理器
 * 处理SQL类型的规则查询
 */

import { executeSQL } from './VirtualSQLEngine.js';
import { logger } from '../utils/logger.js';

/**
 * 获取内存数据
 * @returns {Object} 内存数据
 */
function getMemoryData() {
  // 这里应该从real_data_storage表或其他地方获取数据
  // 暂时返回空数据，需要与前端数据同步机制配合
  return {
    inventory: [],
    inspection: [],
    production: []
  };
}

/**
 * 将规则转换为SQL查询
 * @param {Object} rule 规则对象
 * @param {string} query 用户查询
 * @returns {string} SQL查询语句
 */
function convertRuleToSQL(rule, query) {
  // 如果规则已经是SQL查询，直接返回
  if (rule.action_target.includes('SELECT')) {
    return rule.action_target;
  }
  
  // 根据规则类型和数据源生成SQL
  const dataSource = rule.action_target;
  
  // 定义字段映射
  const fieldMappings = {
    'inventory': {
      fields: ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'],
      table: 'inventory'
    },
    'inspection': {
      fields: ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注'],
      table: 'lab_tests'
    },
    'production': {
      fields: ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '本周异常', '检验日期', '备注'],
      table: 'online_tracking'
    }
  };
  
  const mapping = fieldMappings[dataSource];
  if (!mapping) {
    throw new Error(`未知的数据源: ${dataSource}`);
  }
  
  // 生成基础SQL
  const fieldsStr = mapping.fields.map(field => `${field} as ${field}`).join(', ');
  let sql = `SELECT ${fieldsStr} FROM ${mapping.table}`;
  
  // 根据查询内容添加WHERE条件
  const whereConditions = [];
  
  // 检查是否包含特定关键词
  if (query.includes('不合格') || query.includes('NG')) {
    if (dataSource === 'inspection') {
      whereConditions.push("测试结果 = 'NG' OR 测试结果 = 'FAIL'");
    }
  }
  
  if (query.includes('合格') && !query.includes('不合格')) {
    if (dataSource === 'inspection') {
      whereConditions.push("测试结果 = 'OK' OR 测试结果 = 'PASS'");
    }
  }
  
  // 检查物料名称
  const materialNames = ['中框', '侧键', '手机卡托', '电池盖', '装饰件', 'LCD显示屏', '摄像头', '电池'];
  for (const material of materialNames) {
    if (query.includes(material)) {
      whereConditions.push(`物料名称 LIKE '%${material}%'`);
      break;
    }
  }
  
  // 检查供应商
  const suppliers = ['华星', '风华', '盛泰', '瑞声', '怡同', '广正', '辉阳', '理威'];
  for (const supplier of suppliers) {
    if (query.includes(supplier)) {
      whereConditions.push(`供应商 LIKE '%${supplier}%'`);
      break;
    }
  }
  
  // 检查工厂
  const factories = ['深圳工厂', '重庆工厂', '南昌工厂', '宜宾工厂'];
  for (const factory of factories) {
    if (query.includes(factory)) {
      whereConditions.push(`工厂 = '${factory}'`);
      break;
    }
  }
  
  // 添加WHERE条件
  if (whereConditions.length > 0) {
    sql += ' WHERE ' + whereConditions.join(' AND ');
  }
  
  // 添加排序
  if (dataSource === 'inspection') {
    sql += ' ORDER BY 日期 DESC';
  } else if (dataSource === 'inventory') {
    sql += ' ORDER BY 入库时间 DESC';
  } else if (dataSource === 'production') {
    sql += ' ORDER BY 检验日期 DESC';
  }
  
  // 添加限制
  sql += ' LIMIT 20';
  
  return sql;
}

/**
 * 处理SQL规则
 * @param {Object} rule 规则对象
 * @param {string} query 用户查询
 * @param {Object} memoryData 内存数据
 * @returns {Object} 处理结果
 */
export function processSQLRule(rule, query, memoryData) {
  try {
    logger.info('处理SQL规则:', rule.intent_name);
    
    // 转换规则为SQL查询
    const sql = convertRuleToSQL(rule, query);
    logger.debug('生成的SQL查询:', sql);
    
    // 执行SQL查询
    const results = executeSQL(sql, memoryData);
    
    // 生成回答
    const answer = generateAnswer(rule, query, results);
    
    return {
      success: true,
      data: {
        answer,
        tableData: results,
        sql,
        ruleName: rule.intent_name
      }
    };
  } catch (error) {
    logger.error('SQL规则处理错误:', error);
    return {
      success: false,
      error: error.message,
      data: {
        answer: '查询处理失败，请稍后重试',
        tableData: [],
        ruleName: rule.intent_name
      }
    };
  }
}

/**
 * 生成回答
 * @param {Object} rule 规则对象
 * @param {string} query 用户查询
 * @param {Array} results 查询结果
 * @returns {string} 回答文本
 */
function generateAnswer(rule, query, results) {
  const count = results.length;
  
  if (count === 0) {
    return `根据您的查询"${query}"，未找到相关记录。`;
  }
  
  let answer = `根据您的查询"${query}"，找到 ${count} 条相关记录。\n\n`;
  
  // 根据规则类型生成不同的回答
  if (rule.intent_name.includes('不合格') || rule.intent_name.includes('NG')) {
    answer += `📊 **不合格记录统计**\n`;
    answer += `❌ 共发现 ${count} 条不合格记录\n`;
    
    if (results.length > 0) {
      // 统计不合格原因
      const defectReasons = {};
      results.forEach(record => {
        const reason = record['不合格描述'] || '未知原因';
        defectReasons[reason] = (defectReasons[reason] || 0) + 1;
      });
      
      answer += `\n🔍 **主要不合格原因：**\n`;
      Object.entries(defectReasons).slice(0, 3).forEach(([reason, count]) => {
        answer += `- ${reason}: ${count}次\n`;
      });
    }
  } else if (rule.intent_name.includes('库存')) {
    answer += `📦 **库存信息统计**\n`;
    answer += `📊 共查询到 ${count} 条库存记录\n`;
    
    if (results.length > 0) {
      // 统计状态分布
      const statusCount = {};
      results.forEach(record => {
        const status = record['状态'] || '未知';
        statusCount[status] = (statusCount[status] || 0) + 1;
      });
      
      answer += `\n📈 **状态分布：**\n`;
      Object.entries(statusCount).forEach(([status, count]) => {
        answer += `- ${status}: ${count}条\n`;
      });
    }
  } else if (rule.intent_name.includes('上线') || rule.intent_name.includes('生产')) {
    answer += `🏭 **生产上线统计**\n`;
    answer += `📊 共查询到 ${count} 条上线记录\n`;
    
    if (results.length > 0) {
      // 计算平均不良率
      const defectRates = results
        .map(record => parseFloat(record['不良率']) || 0)
        .filter(rate => rate > 0);
      
      if (defectRates.length > 0) {
        const avgDefectRate = (defectRates.reduce((sum, rate) => sum + rate, 0) / defectRates.length).toFixed(2);
        answer += `\n📉 **平均不良率：** ${avgDefectRate}%\n`;
      }
    }
  }
  
  answer += `\n📋 **详细数据请查看下方表格**`;
  
  return answer;
}

export default {
  processSQLRule,
  convertRuleToSQL
};
