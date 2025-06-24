/**
 * NLP意图规则配置
 * 定义了系统中的NLP意图识别规则模板和默认数据
 */
import { v4 as uuidv4 } from 'uuid';
import { RULE_TYPES, RULE_STATUS } from './rule_types';

// NLP意图规则模板
export const NLP_INTENT_RULE_TEMPLATE = {
  id: '',
  intent_name: '', // 意图名称
  intent_type: 'query', // 意图类型：query-查询, action-动作
  trigger_pattern: '', // 触发模式
  target_table: '', // 目标数据表
  response_template: '', // 响应模板
  api_endpoint: '', // API端点
  category: RULE_TYPES.NLP_INTENT.GENERAL, // 分类
  description: '', // 描述
  status: RULE_STATUS.ACTIVE, // 状态
  created_at: null, // 创建时间
  updated_at: null, // 更新时间
  patterns: [], // 匹配模式列表
  examples: [], // 示例列表
  parameters: [], // 参数列表
  execution_count: 0, // 执行次数
  success_rate: 100, // 成功率(0-100)
  metadata: {} // 其他元数据
};

// 创建NLP意图规则函数
export function createNlpIntentRule(data = {}) {
  const now = new Date().toISOString();
  return {
    ...NLP_INTENT_RULE_TEMPLATE,
    id: uuidv4(),
    created_at: now,
    updated_at: now,
    ...data
  };
}

// 默认NLP意图规则
export const DEFAULT_NLP_INTENT_RULES = [
  createNlpIntentRule({
    intent_name: '查询批次状态',
    intent_type: 'query',
    trigger_pattern: '查询批次{batch_id}的状态',
    target_table: 'batches',
    response_template: '批次{batch_id}的当前状态是{status}，最后更新时间是{last_updated}',
    api_endpoint: '/api/batches/{batch_id}',
    category: RULE_TYPES.NLP_INTENT.BATCH,
    description: '查询指定批次的当前状态信息',
    patterns: [
      '查询批次{batch_id}状态',
      '批次{batch_id}的状态是什么',
      '{batch_id}批次现在是什么状态',
      '查一下{batch_id}批次的状态'
    ],
    examples: [
      '查询批次B2023001的状态',
      'B2023002批次现在是什么状态',
      '查一下B2023003批次的状态'
    ],
    parameters: [
      {
        name: 'batch_id',
        type: 'string',
        required: true,
        description: '批次编号'
      }
    ]
  }),
  
  createNlpIntentRule({
    intent_name: '查询物料库存',
    intent_type: 'query',
    trigger_pattern: '查询物料{material_code}的库存',
    target_table: 'inventory',
    response_template: '物料{material_code}的当前库存为{quantity}{unit}，仓库位置：{location}',
    api_endpoint: '/api/inventory/material/{material_code}',
    category: RULE_TYPES.NLP_INTENT.INVENTORY,
    description: '查询指定物料的当前库存信息',
    patterns: [
      '查询物料{material_code}库存',
      '{material_code}物料有多少库存',
      '物料{material_code}的库存是多少',
      '{material_code}还有多少库存'
    ],
    examples: [
      '查询物料M1001的库存',
      'M1002物料有多少库存',
      'M1003还有多少库存'
    ],
    parameters: [
      {
        name: 'material_code',
        type: 'string',
        required: true,
        description: '物料编码'
      }
    ]
  }),
  
  createNlpIntentRule({
    intent_name: '冻结批次',
    intent_type: 'action',
    trigger_pattern: '冻结批次{batch_id}',
    target_table: 'batches',
    response_template: '已将批次{batch_id}设置为冻结状态，原因：{reason}',
    api_endpoint: '/api/batches/{batch_id}/freeze',
    category: RULE_TYPES.NLP_INTENT.BATCH,
    description: '将指定批次设置为冻结状态',
    patterns: [
      '冻结批次{batch_id}',
      '请将{batch_id}批次冻结',
      '批次{batch_id}需要冻结',
      '把{batch_id}设为冻结状态'
    ],
    examples: [
      '冻结批次B2023001',
      '请将B2023002批次冻结',
      '批次B2023003需要冻结'
    ],
    parameters: [
      {
        name: 'batch_id',
        type: 'string',
        required: true,
        description: '批次编号'
      },
      {
        name: 'reason',
        type: 'string',
        required: false,
        description: '冻结原因'
      }
    ]
  }),
  
  createNlpIntentRule({
    intent_name: '查询质量问题',
    intent_type: 'query',
    trigger_pattern: '查询{status}的质量问题',
    target_table: 'quality_issues',
    response_template: '当前有{count}个{status}的质量问题，最近的问题是：{latest_issue}',
    api_endpoint: '/api/quality/issues?status={status}',
    category: RULE_TYPES.NLP_INTENT.QUALITY,
    description: '查询指定状态的质量问题',
    patterns: [
      '查询{status}的质量问题',
      '有多少{status}的质量问题',
      '{status}状态的质量问题列表',
      '查看{status}质量问题'
    ],
    examples: [
      '查询未解决的质量问题',
      '有多少待处理的质量问题',
      '已关闭状态的质量问题列表'
    ],
    parameters: [
      {
        name: 'status',
        type: 'string',
        required: false,
        default: 'open',
        description: '问题状态：open-未解决，pending-处理中，closed-已关闭'
      }
    ]
  }),
  
  createNlpIntentRule({
    intent_name: '查询生产计划',
    intent_type: 'query',
    trigger_pattern: '查询{date}的生产计划',
    target_table: 'production_plans',
    response_template: '{date}的生产计划包含{count}个任务，总产量目标：{total_target}',
    api_endpoint: '/api/production/plans?date={date}',
    category: RULE_TYPES.NLP_INTENT.PRODUCTION,
    description: '查询指定日期的生产计划',
    patterns: [
      '查询{date}的生产计划',
      '{date}有什么生产计划',
      '{date}的生产安排是什么',
      '看一下{date}的生产计划'
    ],
    examples: [
      '查询今天的生产计划',
      '明天有什么生产计划',
      '下周一的生产安排是什么'
    ],
    parameters: [
      {
        name: 'date',
        type: 'string',
        required: false,
        default: 'today',
        description: '日期：today-今天，tomorrow-明天，或具体日期格式YYYY-MM-DD'
      }
    ]
  })
];

// 导出默认NLP意图规则
export default DEFAULT_NLP_INTENT_RULES; 