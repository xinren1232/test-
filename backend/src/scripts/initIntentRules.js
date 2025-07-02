/**
 * 初始化意图规则数据
 * 将预定义的意图规则插入到数据库中
 */

import { logger } from '../utils/logger.js';
import initializeDatabase from '../models/index.js';

// 预定义的意图规则
const INTENT_RULES = [
  {
    intent_name: 'batch_risk_check',
    description: '批次风险检查',
    action_type: 'FUNCTION_CALL',
    action_target: 'checkBatchRisk',
    parameters: [
      {
        name: 'batch_no',
        type: 'string',
        required: true,
        extract_pattern: '批次[号]?[：:]?\\s*([1-9][0-9]{5})'
      }
    ],
    trigger_words: ['批次', '风险', '异常', '状态', '检查'],
    synonyms: {
      '风险': ['异常', '危险', '问题'],
      '批次': ['batch', '批号', '批次号'],
      '检查': ['查询', '查看', '检测']
    },
    example_query: '这个批次有没有风险？',
    priority: 5,
    status: 'active'
  },
  {
    intent_name: 'factory_inventory_query',
    description: '工厂库存查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT * FROM inventory WHERE factory LIKE '%{{ factory }}%'
                   {% if status %} AND status = '{{ status }}' {% endif %}
                   {% if supplier %} AND supplier LIKE '%{{ supplier }}%' {% endif %}
                   {% if material %} AND materialName LIKE '%{{ material }}%' {% endif %}
                   ORDER BY inspectionDate DESC LIMIT 20`,
    parameters: [
      {
        name: 'factory',
        type: 'string',
        required: true,
        extract_pattern: '(重庆|深圳|南昌|宜宾)工厂?'
      },
      {
        name: 'status',
        type: 'string',
        required: false,
        extract_pattern: '(正常|风险|异常|冻结)'
      },
      {
        name: 'supplier',
        type: 'string',
        required: false,
        extract_pattern: '(聚龙|欣冠|广正|帝晶|天马|BOE|华星|盛泰|天实|深奥|百俊达|奥海|辰阳|锂威|风华|维科|东声|豪声|歌尔|丽德宝|裕同|富群)'
      },
      {
        name: 'material',
        type: 'string',
        required: false,
        extract_pattern: '(电池盖|中框|手机卡托|侧键|装饰件|LCD显示屏|OLED显示屏|摄像头模组|电池|充电器|扬声器|听筒|保护套|标签|包装盒)'
      }
    ],
    trigger_words: ['工厂', '库存', '物料'],
    synonyms: {
      '异常': ['风险', '危险'],
      '库存': ['物料', '存货'],
      '扬声器': ['喇叭', '音响'],
      '听筒': ['耳机']
    },
    example_query: '深圳工厂异常库存',
    priority: 4,
    status: 'active'
  },
  {
    intent_name: 'supplier_quality_analysis',
    description: '供应商质量分析',
    action_type: 'FUNCTION_CALL',
    action_target: 'analyzeSupplierQuality',
    parameters: [
      {
        name: 'supplier',
        type: 'string',
        required: true,
        extract_pattern: '(聚龙|欣冠|广正|帝晶|天马|BOE|华星|盛泰|天实|深奥|百俊达|奥海|辰阳|锂威|风华|维科|东声|豪声|歌尔|丽德宝|裕同|富群)'
      },
      {
        name: 'material',
        type: 'string',
        required: false,
        extract_pattern: '(电池盖|中框|手机卡托|侧键|装饰件|LCD显示屏|OLED显示屏|摄像头模组|电池|充电器|扬声器|听筒|保护套|标签|包装盒)'
      }
    ],
    trigger_words: ['供应商', '质量', '分析'],
    synonyms: {
      '质量': ['品质', '合格率', '不良率'],
      '分析': ['评估', '对比', '统计']
    },
    example_query: 'BOE供应商质量如何',
    priority: 3,
    status: 'active'
  },
  {
    intent_name: 'material_defect_rate',
    description: '物料不良率查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT material_name, AVG(defect_rate) as avg_defect_rate, COUNT(*) as total_records
                   FROM production WHERE material_name LIKE '%{{ material }}%'
                   {% if factory %} AND factory LIKE '%{{ factory }}%' {% endif %}
                   GROUP BY material_name
                   ORDER BY avg_defect_rate DESC`,
    parameters: [
      {
        name: 'material',
        type: 'string',
        required: true,
        extract_pattern: '(电池盖|中框|手机卡托|侧键|装饰件|LCD显示屏|OLED显示屏|摄像头模组|电池|充电器|扬声器|听筒|保护套|标签|包装盒)'
      },
      {
        name: 'factory',
        type: 'string',
        required: false,
        extract_pattern: '(重庆|深圳|南昌|宜宾)工厂?'
      }
    ],
    trigger_words: ['不良率', '物料', '缺陷'],
    synonyms: {
      '不良率': ['缺陷率', '失败率', '问题率'],
      '物料': ['材料', '产品', '零件']
    },
    example_query: '电池盖的不良率是多少',
    priority: 3,
    status: 'active'
  },
  {
    intent_name: 'test_result_query',
    description: '测试结果查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT material_name, test_result, COUNT(*) as count
                   FROM lab_test WHERE 1=1
                   {% if material %} AND material_name LIKE '%{{ material }}%' {% endif %}
                   {% if test_result %} AND test_result = '{{ test_result }}' {% endif %}
                   {% if supplier %} AND supplier LIKE '%{{ supplier }}%' {% endif %}
                   GROUP BY material_name, test_result
                   ORDER BY count DESC`,
    parameters: [
      {
        name: 'material',
        type: 'string',
        required: false,
        extract_pattern: '(电池盖|中框|手机卡托|侧键|装饰件|LCD显示屏|OLED显示屏|摄像头模组|电池|充电器|扬声器|听筒|保护套|标签|包装盒)'
      },
      { 
        name: 'test_result', 
        type: 'string', 
        required: false, 
        extract_pattern: '(PASS|FAIL|通过|失败)'
      },
      {
        name: 'supplier',
        type: 'string',
        required: false,
        extract_pattern: '(聚龙|欣冠|广正|帝晶|天马|BOE|华星|盛泰|天实|深奥|百俊达|奥海|辰阳|锂威|风华|维科|东声|豪声|歌尔|丽德宝|裕同|富群)'
      }
    ],
    trigger_words: ['测试', '检测', '结果'],
    synonyms: {
      '测试': ['检测', '检验', '试验'],
      '通过': ['PASS', '合格'],
      '失败': ['FAIL', '不合格', 'NG']
    },
    example_query: '电池盖测试结果',
    priority: 3,
    status: 'active'
  }
];

/**
 * 初始化意图规则
 */
async function initIntentRules() {
  try {
    logger.info('🚀 开始初始化意图规则...');
    
    // 初始化数据库连接
    const db = await initializeDatabase();
    const { NlpIntentRule } = db;
    
    // 清空现有规则（可选）
    await NlpIntentRule.destroy({ where: {} });
    logger.info('🗑️ 清空现有意图规则');
    
    // 插入新规则
    for (const rule of INTENT_RULES) {
      await NlpIntentRule.create(rule);
      logger.info(`✅ 创建意图规则: ${rule.intent_name}`);
    }
    
    logger.info(`🎉 成功初始化 ${INTENT_RULES.length} 条意图规则`);
    
    // 验证插入结果
    const count = await NlpIntentRule.count();
    logger.info(`📊 数据库中共有 ${count} 条意图规则`);
    
    return true;
    
  } catch (error) {
    logger.error('❌ 初始化意图规则失败:', error);
    throw error;
  }
}

/**
 * 获取所有活跃的意图规则
 */
async function getActiveIntentRules() {
  try {
    const db = await initializeDatabase();
    const { NlpIntentRule } = db;
    
    const rules = await NlpIntentRule.findAll({
      where: { status: 'active' },
      order: [['priority', 'DESC'], ['created_at', 'ASC']]
    });
    
    return rules.map(rule => rule.toJSON());
    
  } catch (error) {
    logger.error('❌ 获取意图规则失败:', error);
    return [];
  }
}

/**
 * 添加新的意图规则
 */
async function addIntentRule(ruleData) {
  try {
    const db = await initializeDatabase();
    const { NlpIntentRule } = db;
    
    const rule = await NlpIntentRule.create(ruleData);
    logger.info(`✅ 添加新意图规则: ${rule.intent_name}`);
    
    return rule.toJSON();
    
  } catch (error) {
    logger.error('❌ 添加意图规则失败:', error);
    throw error;
  }
}

/**
 * 更新意图规则
 */
async function updateIntentRule(id, updateData) {
  try {
    const db = await initializeDatabase();
    const { NlpIntentRule } = db;
    
    const [updatedRows] = await NlpIntentRule.update(updateData, {
      where: { id }
    });
    
    if (updatedRows > 0) {
      logger.info(`✅ 更新意图规则: ${id}`);
      return true;
    } else {
      logger.warn(`⚠️ 未找到要更新的意图规则: ${id}`);
      return false;
    }
    
  } catch (error) {
    logger.error('❌ 更新意图规则失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本，则执行初始化
if (import.meta.url === `file://${process.argv[1]}`) {
  initIntentRules()
    .then(() => {
      logger.info('🎉 意图规则初始化完成');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ 意图规则初始化失败:', error);
      process.exit(1);
    });
}

export {
  initIntentRules,
  getActiveIntentRules,
  addIntentRule,
  updateIntentRule,
  INTENT_RULES
};
