/**
 * 自然语言处理服务
 * 提供自然语言查询解析和意图识别功能
 */

// 定义NLP意图类型
export interface NLPIntent {
  action: 'query' | 'update' | 'alert' | 'analyze' | 'recommend';
  entity: 'inventory' | 'anomaly' | 'labTest' | 'risk' | 'trend';
  filters: Record<string, any>;
  timeRange?: {start: Date, end: Date};
  limit?: number;
  aggregation?: 'count' | 'average' | 'sum' | 'max' | 'min';
}

// 时间相关表达式处理
const timeExpressions = {
  '今天': () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return {
      start: today,
      end: new Date()
    };
  },
  '昨天': () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return {
      start: yesterday,
      end: today
    };
  },
  '本周': () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    
    const startOfWeek = new Date(today.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);
    
    return {
      start: startOfWeek,
      end: new Date()
    };
  },
  '上周': () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    
    const startOfLastWeek = new Date(today.setDate(diff - 7));
    startOfLastWeek.setHours(0, 0, 0, 0);
    
    const endOfLastWeek = new Date(today.setDate(diff - 1));
    endOfLastWeek.setHours(23, 59, 59, 999);
    
    return {
      start: startOfLastWeek,
      end: endOfLastWeek
    };
  },
  '本月': () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    return {
      start: startOfMonth,
      end: new Date()
    };
  },
  '上个月': () => {
    const today = new Date();
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
    
    return {
      start: startOfLastMonth,
      end: endOfLastMonth
    };
  },
  '最近一周': () => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    return {
      start: lastWeek,
      end: today
    };
  },
  '最近一个月': () => {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    return {
      start: lastMonth,
      end: today
    };
  },
  '最近三个月': () => {
    const today = new Date();
    const last3Months = new Date(today);
    last3Months.setMonth(last3Months.getMonth() - 3);
    
    return {
      start: last3Months,
      end: today
    };
  }
};

// 关键词匹配规则
const keywordMappings = {
  // 实体类型匹配
  entities: {
    'inventory': ['库存', '物料', '批次', '仓库'],
    'anomaly': ['异常', '缺陷', '问题', '故障', '产线异常'],
    'labTest': ['测试', '检验', '实验', '化验', '检测'],
    'risk': ['风险', '隐患', '威胁'],
    'trend': ['趋势', '走势', '变化']
  },
  
  // 动作类型匹配
  actions: {
    'query': ['查询', '查看', '显示', '列出', '找出'],
    'update': ['更新', '修改', '变更', '改变'],
    'alert': ['警告', '提醒', '通知'],
    'analyze': ['分析', '评估', '诊断'],
    'recommend': ['推荐', '建议', '提议']
  },
  
  // 风险等级匹配
  riskLevels: {
    'high': ['高风险', '高危', '严重'],
    'medium': ['中风险', '中等风险', '一般'],
    'low': ['低风险', '轻微']
  },
  
  // 状态匹配
  status: {
    'normal': ['正常', '普通', '常规'],
    'frozen': ['冻结', '锁定', '停用'],
    'inspection': ['检验中', '审核中', '待检']
  }
};

/**
 * 解析自然语言查询，转换为结构化意图
 * @param query 用户输入的自然语言查询
 * @returns 解析后的意图对象
 */
export function parseQuery(query: string): NLPIntent {
  // 默认意图
  const intent: NLPIntent = {
    action: 'query',
    entity: 'inventory',
    filters: {}
  };
  
  // 检测实体类型
  for (const [entity, keywords] of Object.entries(keywordMappings.entities)) {
    if (keywords.some(keyword => query.includes(keyword))) {
      intent.entity = entity as any;
      break;
    }
  }
  
  // 检测动作类型
  for (const [action, keywords] of Object.entries(keywordMappings.actions)) {
    if (keywords.some(keyword => query.includes(keyword))) {
      intent.action = action as any;
      break;
    }
  }
  
  // 检测风险等级
  for (const [level, keywords] of Object.entries(keywordMappings.riskLevels)) {
    if (keywords.some(keyword => query.includes(keyword))) {
      intent.filters.riskLevel = level;
      break;
    }
  }
  
  // 检测状态
  for (const [status, keywords] of Object.entries(keywordMappings.status)) {
    if (keywords.some(keyword => query.includes(keyword))) {
      intent.filters.status = status;
      break;
    }
  }
  
  // 检测时间范围
  for (const [timeExpr, timeFunc] of Object.entries(timeExpressions)) {
    if (query.includes(timeExpr)) {
      intent.timeRange = timeFunc();
      break;
    }
  }
  
  // 检测物料编码 (例如: "M12345"格式)
  const materialCodeMatch = query.match(/[Mm][0-9]{5,}/);
  if (materialCodeMatch) {
    intent.filters.materialCode = materialCodeMatch[0];
  }
  
  // 检测批次号 (例如: "B12345"格式)
  const batchNumberMatch = query.match(/[Bb][0-9]{5,}/);
  if (batchNumberMatch) {
    intent.filters.batchNumber = batchNumberMatch[0];
  }
  
  // 检测供应商
  const supplierKeywords = ['供应商', '厂商', '供货商'];
  for (const keyword of supplierKeywords) {
    const index = query.indexOf(keyword);
    if (index !== -1) {
      // 尝试提取供应商名称 (关键词后的内容)
      const afterKeyword = query.substring(index + keyword.length).trim();
      const supplierMatch = afterKeyword.match(/^[：:]\s*([^\s,，.。]+)/);
      if (supplierMatch) {
        intent.filters.supplier = supplierMatch[1];
      }
    }
  }
  
  return intent;
}

/**
 * 将意图转换为自然语言描述
 * @param intent 结构化意图对象
 * @returns 自然语言描述
 */
export function intentToText(intent: NLPIntent): string {
  // 实体映射
  const entityMap: Record<string, string> = {
    'inventory': '库存',
    'anomaly': '产线异常',
    'labTest': '实验室测试',
    'risk': '风险评估',
    'trend': '趋势分析'
  };
  
  // 动作映射
  const actionMap: Record<string, string> = {
    'query': '查询',
    'update': '更新',
    'alert': '提醒',
    'analyze': '分析',
    'recommend': '推荐'
  };
  
  // 基础描述
  let description = `${actionMap[intent.action]}${entityMap[intent.entity]}`;
  
  // 添加过滤条件
  const filters = [];
  
  if (intent.filters.riskLevel) {
    const riskLevelMap: Record<string, string> = {
      'high': '高风险',
      'medium': '中风险',
      'low': '低风险'
    };
    filters.push(riskLevelMap[intent.filters.riskLevel]);
  }
  
  if (intent.filters.status) {
    const statusMap: Record<string, string> = {
      'normal': '正常',
      'frozen': '已冻结',
      'inspection': '检验中'
    };
    filters.push(statusMap[intent.filters.status]);
  }
  
  if (intent.filters.materialCode) {
    filters.push(`物料编码为${intent.filters.materialCode}`);
  }
  
  if (intent.filters.batchNumber) {
    filters.push(`批次号为${intent.filters.batchNumber}`);
  }
  
  if (intent.filters.supplier) {
    filters.push(`供应商为${intent.filters.supplier}`);
  }
  
  // 添加时间范围
  if (intent.timeRange) {
    const start = formatDate(intent.timeRange.start);
    const end = formatDate(intent.timeRange.end);
    filters.push(`时间范围从${start}到${end}`);
  }
  
  // 组合完整描述
  if (filters.length > 0) {
    description += `（${filters.join('、')}）`;
  }
  
  return description;
}

/**
 * 格式化日期为易读格式
 */
function formatDate(date: Date): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

/**
 * 快速示例查询匹配表
 * 包含常用查询的预定义解析
 */
export const quickQueryExamples: Record<string, NLPIntent> = {
  '查询最近一周的产线异常': {
    action: 'query',
    entity: 'anomaly',
    filters: {},
    timeRange: timeExpressions['最近一周']()
  },
  '分析高风险物料': {
    action: 'analyze',
    entity: 'inventory',
    filters: {
      riskLevel: 'high'
    }
  },
  '查看已冻结库存': {
    action: 'query',
    entity: 'inventory',
    filters: {
      status: 'frozen'
    }
  },
  '推荐处理方案': {
    action: 'recommend',
    entity: 'anomaly',
    filters: {
      status: 'open'
    }
  },
  '显示本月检验结果': {
    action: 'query',
    entity: 'labTest',
    filters: {},
    timeRange: timeExpressions['本月']()
  }
};

/**
 * NLP服务类
 */
export class NLPService {
  /**
   * 处理用户自然语言查询
   * @param query 用户查询
   * @returns 解析后的意图
   */
  processQuery(query: string): NLPIntent {
    // 检查是否匹配预定义示例
    for (const [example, intent] of Object.entries(quickQueryExamples)) {
      if (query.includes(example)) {
        return {...intent};
      }
    }
    
    // 执行自然语言解析
    return parseQuery(query);
  }
  
  /**
   * 获取意图的自然语言描述
   * @param intent 意图对象
   * @returns 自然语言描述
   */
  getIntentDescription(intent: NLPIntent): string {
    return intentToText(intent);
  }
  
  /**
   * 生成查询建议
   * @param partialQuery 部分查询文本
   * @returns 建议列表
   */
  generateSuggestions(partialQuery: string): string[] {
    const suggestions: string[] = [];
    
    // 匹配快速查询示例
    for (const example of Object.keys(quickQueryExamples)) {
      if (example.toLowerCase().includes(partialQuery.toLowerCase())) {
        suggestions.push(example);
      }
    }
    
    return suggestions.slice(0, 5); // 最多返回5个建议
  }
} 