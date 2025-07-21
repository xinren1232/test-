/**
 * 规则类型定义文件
 * 定义了系统中所有的规则类型及其相关配置
 */

export const RULE_TYPES = {
  // 分析规则类型
  ANALYTIC: {
    QUERY: 'query',         // 查询规则
    DETECTION: 'detection', // 检测规则
    ALERT: 'alert',         // 预警规则
    DIAGNOSTIC: 'diagnostic', // 诊断规则
  },
  
  // 流程规则类型
  PROCESS: {
    FREEZE_BATCH: 'freeze_batch',   // 冻结批次
    SEND_ALERT: 'send_alert',       // 发送预警
    CREATE_ISSUE: 'create_issue',   // 创建质量问题
    UPDATE_STATUS: 'update_status', // 更新状态
    RUN_INSPECTION: 'run_inspection', // 运行检查
  },
  
  // NLP意图类型
  NLP_INTENT: {
    GENERAL: 'general',     // 通用
    BATCH: 'batch',         // 批次
    QUALITY: 'quality',     // 质量
    INVENTORY: 'inventory', // 库存
    PRODUCTION: 'production', // 生产
  },
  
  // 知识库规则类型
  KNOWLEDGE: {
    GENERAL: 'general',     // 通用知识
    PROCESS: 'process',     // 流程知识
    TECHNICAL: 'technical', // 技术知识
    POLICY: 'policy',       // 政策规定
    FAQ: 'faq',             // 常见问题
  }
};

// 规则类型UI配置
export const RULE_TYPE_UI = {
  // 分析规则标签样式
  analyticTypeTag: {
    [RULE_TYPES.ANALYTIC.QUERY]: 'success', 
    [RULE_TYPES.ANALYTIC.DETECTION]: 'warning',
    [RULE_TYPES.ANALYTIC.ALERT]: 'danger',
    [RULE_TYPES.ANALYTIC.DIAGNOSTIC]: 'info',
  },
  
  // 分析规则中文名称
  analyticTypeName: {
    [RULE_TYPES.ANALYTIC.QUERY]: '查询规则', 
    [RULE_TYPES.ANALYTIC.DETECTION]: '检测规则',
    [RULE_TYPES.ANALYTIC.ALERT]: '预警规则',
    [RULE_TYPES.ANALYTIC.DIAGNOSTIC]: '诊断规则',
  },
  
  // 流程规则标签样式
  processTypeTag: {
    [RULE_TYPES.PROCESS.FREEZE_BATCH]: 'danger',
    [RULE_TYPES.PROCESS.SEND_ALERT]: 'warning',
    [RULE_TYPES.PROCESS.CREATE_ISSUE]: 'info',
    [RULE_TYPES.PROCESS.UPDATE_STATUS]: 'success',
    [RULE_TYPES.PROCESS.RUN_INSPECTION]: 'primary',
  },
  
  // 流程规则中文名称
  processTypeName: {
    [RULE_TYPES.PROCESS.FREEZE_BATCH]: '冻结批次',
    [RULE_TYPES.PROCESS.SEND_ALERT]: '发送预警',
    [RULE_TYPES.PROCESS.CREATE_ISSUE]: '创建问题',
    [RULE_TYPES.PROCESS.UPDATE_STATUS]: '更新状态',
    [RULE_TYPES.PROCESS.RUN_INSPECTION]: '运行检查',
  },
  
  // NLP意图标签样式
  nlpCategoryTag: {
    [RULE_TYPES.NLP_INTENT.GENERAL]: '', 
    [RULE_TYPES.NLP_INTENT.BATCH]: 'success',
    [RULE_TYPES.NLP_INTENT.QUALITY]: 'danger',
    [RULE_TYPES.NLP_INTENT.INVENTORY]: 'warning',
    [RULE_TYPES.NLP_INTENT.PRODUCTION]: 'info',
  },
  
  // NLP意图中文名称
  nlpCategoryName: {
    [RULE_TYPES.NLP_INTENT.GENERAL]: '通用', 
    [RULE_TYPES.NLP_INTENT.BATCH]: '批次',
    [RULE_TYPES.NLP_INTENT.QUALITY]: '质量',
    [RULE_TYPES.NLP_INTENT.INVENTORY]: '库存',
    [RULE_TYPES.NLP_INTENT.PRODUCTION]: '生产',
  },
  
  // 知识库规则标签样式
  knowledgeTypeTag: {
    [RULE_TYPES.KNOWLEDGE.GENERAL]: '',
    [RULE_TYPES.KNOWLEDGE.PROCESS]: 'success',
    [RULE_TYPES.KNOWLEDGE.TECHNICAL]: 'info',
    [RULE_TYPES.KNOWLEDGE.POLICY]: 'warning',
    [RULE_TYPES.KNOWLEDGE.FAQ]: 'primary',
  },
  
  // 知识库规则中文名称
  knowledgeTypeName: {
    [RULE_TYPES.KNOWLEDGE.GENERAL]: '通用知识',
    [RULE_TYPES.KNOWLEDGE.PROCESS]: '流程知识',
    [RULE_TYPES.KNOWLEDGE.TECHNICAL]: '技术知识',
    [RULE_TYPES.KNOWLEDGE.POLICY]: '政策规定',
    [RULE_TYPES.KNOWLEDGE.FAQ]: '常见问题',
  }
};

// 规则状态
export const RULE_STATUS = {
  ACTIVE: 'active',       // 启用
  INACTIVE: 'inactive',   // 禁用
  DRAFT: 'draft',         // 草稿
  ARCHIVED: 'archived'    // 归档
};

// 规则状态UI配置
export const RULE_STATUS_UI = {
  statusTag: {
    [RULE_STATUS.ACTIVE]: 'success',
    [RULE_STATUS.INACTIVE]: 'info',
    [RULE_STATUS.DRAFT]: 'warning',
    [RULE_STATUS.ARCHIVED]: 'danger'
  },
  
  statusName: {
    [RULE_STATUS.ACTIVE]: '启用',
    [RULE_STATUS.INACTIVE]: '禁用',
    [RULE_STATUS.DRAFT]: '草稿',
    [RULE_STATUS.ARCHIVED]: '归档'
  }
};

export default {
  RULE_TYPES,
  RULE_TYPE_UI,
  RULE_STATUS,
  RULE_STATUS_UI
}; 