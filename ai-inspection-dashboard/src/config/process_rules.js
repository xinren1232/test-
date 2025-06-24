/**
 * 流程规则配置
 * 定义了系统中的流程自动化规则模板和默认数据
 */
import { v4 as uuidv4 } from 'uuid';
import { RULE_TYPES, RULE_STATUS } from './rule_types';

// 流程规则模板
export const PROCESS_RULE_TEMPLATE = {
  id: '',
  rule_name: '', // 规则名称
  trigger_event: '', // 触发事件
  trigger_table: '', // 触发表
  conditions: [], // 条件列表
  action_type: '', // 动作类型
  action_config: {}, // 动作配置
  priority: 5, // 优先级(1-10)
  description: '', // 描述
  status: RULE_STATUS.ACTIVE, // 状态
  created_at: null, // 创建时间
  updated_at: null, // 更新时间
  last_execution: null, // 最后执行时间
  execution_count: 0, // 执行次数
  metadata: {} // 其他元数据
};

// 创建流程规则函数
export function createProcessRule(data = {}) {
  const now = new Date().toISOString();
  return {
    ...PROCESS_RULE_TEMPLATE,
    id: uuidv4(),
    created_at: now,
    updated_at: now,
    ...data
  };
}

// 默认流程规则
export const DEFAULT_PROCESS_RULES = [
  createProcessRule({
    rule_name: '批次不合格自动冻结',
    trigger_event: 'batch_status_change',
    trigger_table: 'batches',
    conditions: [
      {
        field: 'inspection_result',
        operator: 'equals',
        value: 'failed'
      },
      {
        field: 'is_frozen',
        operator: 'equals',
        value: false
      }
    ],
    action_type: RULE_TYPES.PROCESS.FREEZE_BATCH,
    action_config: {
      freeze_reason: '检验结果不合格，系统自动冻结',
      notify_users: ['quality_manager', 'production_manager']
    },
    priority: 10,
    description: '当批次检验结果为不合格时，自动冻结批次并通知相关负责人'
  }),
  
  createProcessRule({
    rule_name: '关键参数超限预警',
    trigger_event: 'parameter_updated',
    trigger_table: 'inspection_data',
    conditions: [
      {
        field: 'parameter_type',
        operator: 'equals',
        value: 'critical'
      },
      {
        field: 'value',
        operator: 'outside_range',
        value: {
          min: '${parameter.min_value}',
          max: '${parameter.max_value}'
        }
      }
    ],
    action_type: RULE_TYPES.PROCESS.SEND_ALERT,
    action_config: {
      alert_level: 'high',
      alert_message: '关键参数${parameter.name}超出限制范围，当前值:${value}，范围:${parameter.min_value}-${parameter.max_value}',
      alert_channels: ['system', 'email']
    },
    priority: 8,
    description: '当关键检验参数超出限制范围时，发送高优先级预警'
  }),
  
  createProcessRule({
    rule_name: '连续三批次质量波动创建问题单',
    trigger_event: 'batch_inspection_completed',
    trigger_table: 'batches',
    conditions: [
      {
        field: 'parameter_trend.fluctuation',
        operator: 'greater_than',
        value: 15
      },
      {
        field: 'parameter_trend.consecutive_batches',
        operator: 'greater_than_or_equal',
        value: 3
      }
    ],
    action_type: RULE_TYPES.PROCESS.CREATE_ISSUE,
    action_config: {
      issue_type: 'quality_fluctuation',
      issue_title: '检测到连续${parameter_trend.consecutive_batches}批次的质量参数波动',
      issue_description: '系统检测到${parameter_name}参数在连续${parameter_trend.consecutive_batches}批次中波动超过${parameter_trend.fluctuation}%，需要进行调查',
      issue_priority: 'medium',
      assign_to: 'quality_engineer'
    },
    priority: 6,
    description: '当检测到连续多个批次的质量参数有明显波动时，自动创建问题单进行跟踪'
  }),
  
  createProcessRule({
    rule_name: '批次即将过期提醒',
    trigger_event: 'daily_check',
    trigger_table: 'batches',
    conditions: [
      {
        field: 'status',
        operator: 'not_equals',
        value: 'expired'
      },
      {
        field: 'expiry_date',
        operator: 'less_than_days_from_now',
        value: 30
      },
      {
        field: 'is_notified_expiry',
        operator: 'equals',
        value: false
      }
    ],
    action_type: RULE_TYPES.PROCESS.SEND_ALERT,
    action_config: {
      alert_level: 'medium',
      alert_message: '批次#${batch_id} ${batch_name}将在${days_to_expiry}天后过期，请及时处理',
      alert_channels: ['system'],
      update_fields: {
        is_notified_expiry: true
      }
    },
    priority: 4,
    description: '批次即将在30天内过期时发送提醒通知'
  }),
  
  createProcessRule({
    rule_name: '新物料首次检验触发全参数检查',
    trigger_event: 'batch_created',
    trigger_table: 'batches',
    conditions: [
      {
        field: 'is_first_time',
        operator: 'equals',
        value: true
      },
      {
        field: 'material_type',
        operator: 'equals',
        value: 'new'
      }
    ],
    action_type: RULE_TYPES.PROCESS.RUN_INSPECTION,
    action_config: {
      inspection_template: 'full_parameter',
      priority: 'high',
      assign_to: 'senior_inspector',
      special_instructions: '新物料首次检验，请执行全参数检测并详细记录'
    },
    priority: 9,
    description: '当新物料首次进入系统时，自动触发全参数检验流程'
  })
];

// 导出默认流程规则
export default DEFAULT_PROCESS_RULES; 