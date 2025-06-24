/**
 * 问答知识库规则配置
 * 定义了系统中的问答知识规则模板和默认数据
 */
import { v4 as uuidv4 } from 'uuid';
import { RULE_TYPES, RULE_STATUS } from './rule_types';

// 问答知识库规则模板
export const QA_RULE_TEMPLATE = {
  id: '',
  topic: '', // 知识主题
  keywords: [], // 关键词列表
  content: '', // 知识内容
  category: RULE_TYPES.KNOWLEDGE.GENERAL, // 知识分类
  source: 'manual', // 来源：manual-手动, import-导入, auto-自动生成
  description: '', // 描述
  status: RULE_STATUS.ACTIVE, // 状态
  created_at: null, // 创建时间
  updated_at: null, // 更新时间
  references: [], // 引用来源
  use_count: 0, // 使用次数
  relevance_score: 100, // 相关性分数(0-100)
  metadata: {} // 其他元数据
};

// 创建知识规则函数
export function createKnowledgeRule(data = {}) {
  const now = new Date().toISOString();
  return {
    ...QA_RULE_TEMPLATE,
    id: uuidv4(),
    created_at: now,
    updated_at: now,
    ...data
  };
}

// 默认知识规则库
export const DEFAULT_KNOWLEDGE_RULES = [
  createKnowledgeRule({
    topic: '物料批次检验流程',
    keywords: ['批次', '检验', '流程', '步骤'],
    content: '物料批次检验流程包括以下步骤：1. 收样登记；2. 分配检验任务；3. 执行检验测试；4. 记录检验结果；5. 审核检验报告；6. 结论判定；7. 发布检验报告。',
    category: RULE_TYPES.KNOWLEDGE.PROCESS,
    description: '物料批次检验标准流程描述',
    references: ['质量管理手册v2.3', '检验流程规范P-QC-01']
  }),
  
  createKnowledgeRule({
    topic: '批次状态定义',
    keywords: ['批次', '状态', '定义'],
    content: '系统中批次状态定义如下：\n- 待检：批次已创建但未开始检验\n- 检验中：批次正在进行检验\n- 合格：批次检验完成且结果合格\n- 不合格：批次检验完成但结果不合格\n- 待复检：批次需要进行复检\n- 冻结：批次被临时冻结，不允许使用\n- 报废：批次被判定为报废',
    category: RULE_TYPES.KNOWLEDGE.GENERAL,
    description: '系统中各种批次状态的详细定义'
  }),
  
  createKnowledgeRule({
    topic: '物料上线审批流程',
    keywords: ['物料', '上线', '审批', '流程'],
    content: '物料上线审批流程：1. 提交上线申请；2. 质量部门审核；3. 技术部门评估；4. 生产部门确认；5. 管理层批准；6. 系统状态更新；7. 通知相关部门；8. 执行上线操作。',
    category: RULE_TYPES.KNOWLEDGE.PROCESS,
    description: '物料从检验合格到上线使用的完整审批流程'
  }),
  
  createKnowledgeRule({
    topic: '检验报告解读指南',
    keywords: ['检验', '报告', '解读', '指南'],
    content: '检验报告解读指南：\n- 报告编号：唯一标识，格式为YYYYMMDD-XXX\n- 检验项目：列出所有检测的参数\n- 检验结果：每个参数的具体测量值\n- 标准范围：每个参数的合格标准范围\n- 结论：合格/不合格的最终判定\n- 不合格项：标记所有不符合标准的项目\n- 检验人员：执行检验的人员信息\n- 审核人员：审核报告的人员信息',
    category: RULE_TYPES.KNOWLEDGE.TECHNICAL,
    description: '如何正确理解和解读检验报告中的各项内容'
  }),
  
  createKnowledgeRule({
    topic: '物料检验标准',
    keywords: ['物料', '检验', '标准', '规范'],
    content: '物料检验标准主要参考：\n1. 国家标准GB/T XXXXX-XXXX\n2. 行业标准HJ/T XXX-XXXX\n3. 企业内部标准Q/XXXXX\n4. 技术协议中约定的特殊要求\n\n所有检验必须严格按照这些标准进行，确保结果的准确性和可靠性。',
    category: RULE_TYPES.KNOWLEDGE.POLICY,
    description: '物料检验所依据的各种标准规范'
  }),
  
  createKnowledgeRule({
    topic: '常见质量问题与解决方案',
    keywords: ['质量', '问题', '解决', '方案'],
    content: '常见质量问题与解决方案：\n\n1. 问题：物料尺寸偏差\n   解决方案：检查生产设备校准，调整加工参数\n\n2. 问题：表面污染\n   解决方案：改进清洁流程，检查包装材料\n\n3. 问题：性能不稳定\n   解决方案：检查原材料质量，优化生产工艺\n\n4. 问题：批次不良率高\n   解决方案：进行根因分析，实施纠正措施',
    category: RULE_TYPES.KNOWLEDGE.FAQ,
    description: '生产过程中常见的质量问题及其解决方法总结'
  })
];

// 导出默认问答知识规则
export default DEFAULT_KNOWLEDGE_RULES; 