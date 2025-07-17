/**
 * 初始化意图规则数据
 * 将预定义的意图规则插入到数据库中
 */

import { logger } from '../utils/logger.js';
import initializeDatabase from '../models/index.js';

// 预定义的意图规则 - 全面覆盖复杂场景
const INTENT_RULES = [
  // ===== 供应商相关查询规则 =====
  {
    intent_name: 'supplier_inventory_query',
    description: '供应商库存查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT
      storage_location as 工厂,
      warehouse as 仓库,
      material_code as 物料编码,
      material_name as 物料名称,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
      DATE_FORMAT(expiry_date, '%Y-%m-%d') as 到期时间,
      COALESCE(notes, '') as 备注
    FROM inventory
    WHERE supplier_name LIKE '%{{ supplier }}%'
    {% if material %} AND material_name LIKE '%{{ material }}%' {% endif %}
    {% if status %} AND status = '{{ status }}' {% endif %}
    {% if factory %} AND storage_location LIKE '%{{ factory }}%' {% endif %}
    ORDER BY inbound_time DESC LIMIT 50`,
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
      },
      {
        name: 'status',
        type: 'string',
        required: false,
        extract_pattern: '(正常|风险|异常|冻结)'
      },
      {
        name: 'factory',
        type: 'string',
        required: false,
        extract_pattern: '(重庆|深圳|南昌|宜宾)工厂?'
      }
    ],
    trigger_words: ['供应商', '库存', '物料', '仓库'],
    synonyms: {
      '供应商': ['厂商', '厂家', '提供商'],
      '库存': ['物料', '存货', '仓储'],
      '物料': ['材料', '产品', '零件']
    },
    example_query: 'BOE供应商的物料库存',
    priority: 1,
    status: 'active'
  },
  {
    intent_name: 'supplier_testing_query',
    description: '供应商测试查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT
      test_id as 测试编号,
      DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
      COALESCE(project, '') as 项目,
      COALESCE(baseline, '') as 基线,
      material_code as 物料编码,
      quantity as 数量,
      material_name as 物料名称,
      supplier_name as 供应商,
      test_result as 测试结果,
      COALESCE(defect_desc, '') as 不合格描述,
      COALESCE(notes, '') as 备注
    FROM lab_tests
    WHERE supplier_name LIKE '%{{ supplier }}%'
    {% if material %} AND material_name LIKE '%{{ material }}%' {% endif %}
    {% if test_result %} AND test_result = '{{ test_result }}' {% endif %}
    ORDER BY test_date DESC LIMIT 50`,
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
      },
      {
        name: 'test_result',
        type: 'string',
        required: false,
        extract_pattern: '(PASS|FAIL|通过|失败|OK|NG|合格|不合格)'
      }
    ],
    trigger_words: ['供应商', '测试', '检验', '检测'],
    synonyms: {
      '供应商': ['厂商', '厂家', '提供商'],
      '测试': ['检测', '检验', '试验'],
      '通过': ['PASS', '合格', 'OK'],
      '失败': ['FAIL', '不合格', 'NG']
    },
    example_query: 'BOE供应商的测试记录',
    priority: 2,
    status: 'active'
  },
  {
    intent_name: 'supplier_production_query',
    description: '供应商生产上线查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT
      factory as 工厂,
      baseline as 基线,
      project as 项目,
      material_code as 物料编码,
      material_name as 物料名称,
      supplier_name as 供应商,
      batch_number as 批次号,
      defect_rate as 不良率,
      defect_phenomenon as 不良现象,
      DATE_FORMAT(inspection_date, '%Y-%m-%d') as 检验日期,
      COALESCE(notes, '') as 备注
    FROM online_tracking
    WHERE supplier_name LIKE '%{{ supplier }}%'
    {% if material %} AND material_name LIKE '%{{ material }}%' {% endif %}
    {% if factory %} AND factory LIKE '%{{ factory }}%' {% endif %}
    ORDER BY inspection_date DESC LIMIT 50`,
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
      },
      {
        name: 'factory',
        type: 'string',
        required: false,
        extract_pattern: '(重庆|深圳|南昌|宜宾)工厂?'
      }
    ],
    trigger_words: ['供应商', '上线', '生产', '产线'],
    synonyms: {
      '供应商': ['厂商', '厂家', '提供商'],
      '上线': ['生产', '产线', '制造'],
      '不良率': ['缺陷率', '失败率']
    },
    example_query: 'BOE供应商的上线生产记录',
    priority: 3,
    status: 'active'
  },
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
    intent_name: '测试结果基础查询',
    description: '查询测试结果的基础信息，正确显示项目代码和基线代码',
    action_type: 'SQL_QUERY',
    action_target: `SELECT
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(project_id, material_code, '未知') as 项目,
  COALESCE(baseline_id, batch_code, '未知') as 基线,
  material_code as 物料编号,
  batch_code as 批次,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '') as 不良描述
FROM lab_tests
WHERE 1=1
{% if material %} AND material_name LIKE '%{{ material }}%' {% endif %}
{% if test_result %} AND test_result = '{{ test_result }}' {% endif %}
{% if supplier %} AND supplier_name LIKE '%{{ supplier }}%' {% endif %}
ORDER BY test_date DESC
LIMIT 10`,
    parameters: [
      {
        name: 'material',
        type: 'string',
        required: false,
        extract_pattern: '(电池盖|中框|手机卡托|侧键|装饰件|LCD显示屏|OLED显示屏|摄像头|电池|充电器|喇叭|听筒|保护套|标签|包装盒)'
      },
      {
        name: 'test_result',
        type: 'string',
        required: false,
        extract_pattern: '(PASS|FAIL|通过|失败|OK|NG|合格|不合格)'
      },
      {
        name: 'supplier',
        type: 'string',
        required: false,
        extract_pattern: '(聚龙|欣冠|广正|帝晶|天马|BOE|华星|盛泰|天实|深奥|百俊达|奥海|辰阳|锂威|风华|维科|东声|豪声|歌尔|丽德宝|裕同|富群)'
      }
    ],
    trigger_words: ['测试', '检测', '结果', '测试结果', '检测结果'],
    synonyms: {
      '测试': ['检测', '检验', '试验'],
      '通过': ['PASS', '合格', 'OK'],
      '失败': ['FAIL', '不合格', 'NG']
    },
    example_query: '查询测试结果',
    priority: 10,
    status: 'active'
  },

  // ===== 具体供应商库存查询规则 =====
  {
    intent_name: 'BOE供应商库存查询',
    description: 'BOE供应商库存查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT
      storage_location as 工厂,
      warehouse as 仓库,
      material_code as 物料编码,
      material_name as 物料名称,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
      DATE_FORMAT(expiry_date, '%Y-%m-%d') as 到期时间,
      COALESCE(notes, '') as 备注
    FROM inventory
    WHERE supplier_name = 'BOE'
    ORDER BY inbound_time DESC LIMIT 50`,
    parameters: [],
    trigger_words: ['BOE', '供应商', '库存'],
    synonyms: {},
    example_query: 'BOE供应商库存查询',
    priority: 15,
    status: 'active'
  },
  {
    intent_name: '东声供应商库存查询',
    description: '东声供应商库存查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT
      storage_location as 工厂,
      warehouse as 仓库,
      material_code as 物料编码,
      material_name as 物料名称,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
      DATE_FORMAT(expiry_date, '%Y-%m-%d') as 到期时间,
      COALESCE(notes, '') as 备注
    FROM inventory
    WHERE supplier_name = '东声'
    ORDER BY inbound_time DESC LIMIT 50`,
    parameters: [],
    trigger_words: ['东声', '供应商', '库存'],
    synonyms: {},
    example_query: '东声供应商库存查询',
    priority: 15,
    status: 'active'
  },
  {
    intent_name: '丽德宝供应商库存查询',
    description: '丽德宝供应商库存查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT
      storage_location as 工厂,
      warehouse as 仓库,
      material_code as 物料编码,
      material_name as 物料名称,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
      DATE_FORMAT(expiry_date, '%Y-%m-%d') as 到期时间,
      COALESCE(notes, '') as 备注
    FROM inventory
    WHERE supplier_name = '丽德宝'
    ORDER BY inbound_time DESC LIMIT 50`,
    parameters: [],
    trigger_words: ['丽德宝', '供应商', '库存'],
    synonyms: {},
    example_query: '丽德宝供应商库存查询',
    priority: 15,
    status: 'active'
  },
  {
    intent_name: '华星供应商库存查询',
    description: '华星供应商库存查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT
      storage_location as 工厂,
      warehouse as 仓库,
      material_code as 物料编码,
      material_name as 物料名称,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
      DATE_FORMAT(expiry_date, '%Y-%m-%d') as 到期时间,
      COALESCE(notes, '') as 备注
    FROM inventory
    WHERE supplier_name = '华星'
    ORDER BY inbound_time DESC LIMIT 50`,
    parameters: [],
    trigger_words: ['华星', '供应商', '库存'],
    synonyms: {},
    example_query: '华星供应商库存查询',
    priority: 15,
    status: 'active'
  },
  {
    intent_name: '天实供应商库存查询',
    description: '天实供应商库存查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT
      storage_location as 工厂,
      warehouse as 仓库,
      material_code as 物料编码,
      material_name as 物料名称,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
      DATE_FORMAT(expiry_date, '%Y-%m-%d') as 到期时间,
      COALESCE(notes, '') as 备注
    FROM inventory
    WHERE supplier_name = '天实'
    ORDER BY inbound_time DESC LIMIT 50`,
    parameters: [],
    trigger_words: ['天实', '供应商', '库存'],
    synonyms: {},
    example_query: '天实供应商库存查询',
    priority: 15,
    status: 'active'
  },
  {
    intent_name: '天马供应商库存查询',
    description: '天马供应商库存查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT
      storage_location as 工厂,
      warehouse as 仓库,
      material_code as 物料编码,
      material_name as 物料名称,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
      DATE_FORMAT(expiry_date, '%Y-%m-%d') as 到期时间,
      COALESCE(notes, '') as 备注
    FROM inventory
    WHERE supplier_name = '天马'
    ORDER BY inbound_time DESC LIMIT 50`,
    parameters: [],
    trigger_words: ['天马', '供应商', '库存'],
    synonyms: {},
    example_query: '天马供应商库存查询',
    priority: 15,
    status: 'active'
  },
  {
    intent_name: '奥海供应商库存查询',
    description: '奥海供应商库存查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT
      storage_location as 工厂,
      warehouse as 仓库,
      material_code as 物料编码,
      material_name as 物料名称,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
      DATE_FORMAT(expiry_date, '%Y-%m-%d') as 到期时间,
      COALESCE(notes, '') as 备注
    FROM inventory
    WHERE supplier_name = '奥海'
    ORDER BY inbound_time DESC LIMIT 50`,
    parameters: [],
    trigger_words: ['奥海', '供应商', '库存'],
    synonyms: {},
    example_query: '奥海供应商库存查询',
    priority: 15,
    status: 'active'
  },
  {
    intent_name: '富群供应商库存查询',
    description: '富群供应商库存查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT
      storage_location as 工厂,
      warehouse as 仓库,
      material_code as 物料编码,
      material_name as 物料名称,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
      DATE_FORMAT(expiry_date, '%Y-%m-%d') as 到期时间,
      COALESCE(notes, '') as 备注
    FROM inventory
    WHERE supplier_name = '富群'
    ORDER BY inbound_time DESC LIMIT 50`,
    parameters: [],
    trigger_words: ['富群', '供应商', '库存'],
    synonyms: {},
    example_query: '富群供应商库存查询',
    priority: 15,
    status: 'active'
  },
  {
    intent_name: '广正供应商库存查询',
    description: '广正供应商库存查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT
      storage_location as 工厂,
      warehouse as 仓库,
      material_code as 物料编码,
      material_name as 物料名称,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
      DATE_FORMAT(expiry_date, '%Y-%m-%d') as 到期时间,
      COALESCE(notes, '') as 备注
    FROM inventory
    WHERE supplier_name = '广正'
    ORDER BY inbound_time DESC LIMIT 50`,
    parameters: [],
    trigger_words: ['广正', '供应商', '库存'],
    synonyms: {},
    example_query: '广正供应商库存查询',
    priority: 15,
    status: 'active'
  },
  {
    intent_name: '怡同供应商库存查询',
    description: '怡同供应商库存查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT
      storage_location as 工厂,
      warehouse as 仓库,
      material_code as 物料编码,
      material_name as 物料名称,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
      DATE_FORMAT(expiry_date, '%Y-%m-%d') as 到期时间,
      COALESCE(notes, '') as 备注
    FROM inventory
    WHERE supplier_name = '怡同'
    ORDER BY inbound_time DESC LIMIT 50`,
    parameters: [],
    trigger_words: ['怡同', '供应商', '库存'],
    synonyms: {},
    example_query: '怡同供应商库存查询',
    priority: 15,
    status: 'active'
  },
  {
    intent_name: '欣冠供应商库存查询',
    description: '欣冠供应商库存查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT
      storage_location as 工厂,
      warehouse as 仓库,
      material_code as 物料编码,
      material_name as 物料名称,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
      DATE_FORMAT(expiry_date, '%Y-%m-%d') as 到期时间,
      COALESCE(notes, '') as 备注
    FROM inventory
    WHERE supplier_name = '欣冠'
    ORDER BY inbound_time DESC LIMIT 50`,
    parameters: [],
    trigger_words: ['欣冠', '供应商', '库存'],
    synonyms: {},
    example_query: '欣冠供应商库存查询',
    priority: 15,
    status: 'active'
  },
  {
    intent_name: '歌尔供应商库存查询',
    description: '歌尔供应商库存查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT
      storage_location as 工厂,
      warehouse as 仓库,
      material_code as 物料编码,
      material_name as 物料名称,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
      DATE_FORMAT(expiry_date, '%Y-%m-%d') as 到期时间,
      COALESCE(notes, '') as 备注
    FROM inventory
    WHERE supplier_name = '歌尔'
    ORDER BY inbound_time DESC LIMIT 50`,
    parameters: [],
    trigger_words: ['歌尔', '供应商', '库存'],
    synonyms: {},
    example_query: '歌尔供应商库存查询',
    priority: 15,
    status: 'active'
  },

  // ===== 供应商测试查询规则 =====
  {
    intent_name: 'BOE供应商测试查询',
    description: 'BOE供应商测试查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT
      test_id as 测试编号,
      DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
      COALESCE(project, '') as 项目,
      COALESCE(baseline, '') as 基线,
      material_code as 物料编码,
      quantity as 数量,
      material_name as 物料名称,
      supplier_name as 供应商,
      test_result as 测试结果,
      COALESCE(defect_desc, '') as 不合格描述,
      COALESCE(notes, '') as 备注
    FROM lab_tests
    WHERE supplier_name = 'BOE'
    ORDER BY test_date DESC LIMIT 50`,
    parameters: [],
    trigger_words: ['BOE', '供应商', '测试'],
    synonyms: {},
    example_query: 'BOE供应商测试查询',
    priority: 15,
    status: 'active'
  },
  {
    intent_name: '东声供应商测试查询',
    description: '东声供应商测试查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT
      test_id as 测试编号,
      DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
      COALESCE(project, '') as 项目,
      COALESCE(baseline, '') as 基线,
      material_code as 物料编码,
      quantity as 数量,
      material_name as 物料名称,
      supplier_name as 供应商,
      test_result as 测试结果,
      COALESCE(defect_desc, '') as 不合格描述,
      COALESCE(notes, '') as 备注
    FROM lab_tests
    WHERE supplier_name = '东声'
    ORDER BY test_date DESC LIMIT 50`,
    parameters: [],
    trigger_words: ['东声', '供应商', '测试'],
    synonyms: {},
    example_query: '东声供应商测试查询',
    priority: 15,
    status: 'active'
  },
  {
    intent_name: '天马供应商测试查询',
    description: '天马供应商测试查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT
      test_id as 测试编号,
      DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
      COALESCE(project, '') as 项目,
      COALESCE(baseline, '') as 基线,
      material_code as 物料编码,
      quantity as 数量,
      material_name as 物料名称,
      supplier_name as 供应商,
      test_result as 测试结果,
      COALESCE(defect_desc, '') as 不合格描述,
      COALESCE(notes, '') as 备注
    FROM lab_tests
    WHERE supplier_name = '天马'
    ORDER BY test_date DESC LIMIT 50`,
    parameters: [],
    trigger_words: ['天马', '供应商', '测试'],
    synonyms: {},
    example_query: '天马供应商测试查询',
    priority: 15,
    status: 'active'
  },
  {
    intent_name: '歌尔供应商测试查询',
    description: '歌尔供应商测试查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT
      test_id as 测试编号,
      DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
      COALESCE(project, '') as 项目,
      COALESCE(baseline, '') as 基线,
      material_code as 物料编码,
      quantity as 数量,
      material_name as 物料名称,
      supplier_name as 供应商,
      test_result as 测试结果,
      COALESCE(defect_desc, '') as 不合格描述,
      COALESCE(notes, '') as 备注
    FROM lab_tests
    WHERE supplier_name = '歌尔'
    ORDER BY test_date DESC LIMIT 50`,
    parameters: [],
    trigger_words: ['歌尔', '供应商', '测试'],
    synonyms: {},
    example_query: '歌尔供应商测试查询',
    priority: 15,
    status: 'active'
  },

  // ===== 供应商上线查询规则 =====
  {
    intent_name: 'BOE供应商上线查询',
    description: 'BOE供应商上线查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT
      factory as 工厂,
      baseline as 基线,
      project as 项目,
      material_code as 物料编码,
      material_name as 物料名称,
      supplier_name as 供应商,
      batch_number as 批次号,
      defect_rate as 不良率,
      defect_phenomenon as 不良现象,
      DATE_FORMAT(inspection_date, '%Y-%m-%d') as 检验日期,
      COALESCE(notes, '') as 备注
    FROM online_tracking
    WHERE supplier_name = 'BOE'
    ORDER BY inspection_date DESC LIMIT 50`,
    parameters: [],
    trigger_words: ['BOE', '供应商', '上线'],
    synonyms: {},
    example_query: 'BOE供应商上线查询',
    priority: 15,
    status: 'active'
  },
  {
    intent_name: '天马供应商上线查询',
    description: '天马供应商上线查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT
      factory as 工厂,
      baseline as 基线,
      project as 项目,
      material_code as 物料编码,
      material_name as 物料名称,
      supplier_name as 供应商,
      batch_number as 批次号,
      defect_rate as 不良率,
      defect_phenomenon as 不良现象,
      DATE_FORMAT(inspection_date, '%Y-%m-%d') as 检验日期,
      COALESCE(notes, '') as 备注
    FROM online_tracking
    WHERE supplier_name = '天马'
    ORDER BY inspection_date DESC LIMIT 50`,
    parameters: [],
    trigger_words: ['天马', '供应商', '上线'],
    synonyms: {},
    example_query: '天马供应商上线查询',
    priority: 15,
    status: 'active'
  },
  {
    intent_name: '歌尔供应商上线查询',
    description: '歌尔供应商上线查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT
      factory as 工厂,
      baseline as 基线,
      project as 项目,
      material_code as 物料编码,
      material_name as 物料名称,
      supplier_name as 供应商,
      batch_number as 批次号,
      defect_rate as 不良率,
      defect_phenomenon as 不良现象,
      DATE_FORMAT(inspection_date, '%Y-%m-%d') as 检验日期,
      COALESCE(notes, '') as 备注
    FROM online_tracking
    WHERE supplier_name = '歌尔'
    ORDER BY inspection_date DESC LIMIT 50`,
    parameters: [],
    trigger_words: ['歌尔', '供应商', '上线'],
    synonyms: {},
    example_query: '歌尔供应商上线查询',
    priority: 15,
    status: 'active'
  },

  // ===== 物料类别查询规则 =====
  {
    intent_name: '结构件类库存查询',
    description: '结构件类库存查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT
      storage_location as 工厂,
      warehouse as 仓库,
      material_code as 物料编码,
      material_name as 物料名称,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
      DATE_FORMAT(expiry_date, '%Y-%m-%d') as 到期时间,
      COALESCE(notes, '') as 备注
    FROM inventory
    WHERE material_name IN ('电池盖', '中框', '手机卡托', '侧键', '装饰件')
    ORDER BY inbound_time DESC LIMIT 50`,
    parameters: [],
    trigger_words: ['结构件类', '库存'],
    synonyms: {},
    example_query: '结构件类库存查询',
    priority: 15,
    status: 'active'
  },
  {
    intent_name: '光学类库存查询',
    description: '光学类库存查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT
      storage_location as 工厂,
      warehouse as 仓库,
      material_code as 物料编码,
      material_name as 物料名称,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
      DATE_FORMAT(expiry_date, '%Y-%m-%d') as 到期时间,
      COALESCE(notes, '') as 备注
    FROM inventory
    WHERE material_name IN ('LCD显示屏', 'OLED显示屏', '摄像头模组')
    ORDER BY inbound_time DESC LIMIT 50`,
    parameters: [],
    trigger_words: ['光学类', '库存'],
    synonyms: {},
    example_query: '光学类库存查询',
    priority: 15,
    status: 'active'
  },
  {
    intent_name: '充电类库存查询',
    description: '充电类库存查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT
      storage_location as 工厂,
      warehouse as 仓库,
      material_code as 物料编码,
      material_name as 物料名称,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
      DATE_FORMAT(expiry_date, '%Y-%m-%d') as 到期时间,
      COALESCE(notes, '') as 备注
    FROM inventory
    WHERE material_name IN ('电池', '充电器')
    ORDER BY inbound_time DESC LIMIT 50`,
    parameters: [],
    trigger_words: ['充电类', '库存'],
    synonyms: {},
    example_query: '充电类库存查询',
    priority: 15,
    status: 'active'
  },
  {
    intent_name: '声学类库存查询',
    description: '声学类库存查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT
      storage_location as 工厂,
      warehouse as 仓库,
      material_code as 物料编码,
      material_name as 物料名称,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
      DATE_FORMAT(expiry_date, '%Y-%m-%d') as 到期时间,
      COALESCE(notes, '') as 备注
    FROM inventory
    WHERE material_name IN ('扬声器', '听筒')
    ORDER BY inbound_time DESC LIMIT 50`,
    parameters: [],
    trigger_words: ['声学类', '库存'],
    synonyms: {},
    example_query: '声学类库存查询',
    priority: 15,
    status: 'active'
  },
  {
    intent_name: '包装类库存查询',
    description: '包装类库存查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT
      storage_location as 工厂,
      warehouse as 仓库,
      material_code as 物料编码,
      material_name as 物料名称,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
      DATE_FORMAT(expiry_date, '%Y-%m-%d') as 到期时间,
      COALESCE(notes, '') as 备注
    FROM inventory
    WHERE material_name IN ('保护套', '标签', '包装盒')
    ORDER BY inbound_time DESC LIMIT 50`,
    parameters: [],
    trigger_words: ['包装类', '库存'],
    synonyms: {},
    example_query: '包装类库存查询',
    priority: 15,
    status: 'active'
  },

  // ===== 物料类别测试查询规则 =====
  {
    intent_name: '结构件类测试查询',
    description: '结构件类测试查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT
      test_id as 测试编号,
      DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
      COALESCE(project, '') as 项目,
      COALESCE(baseline, '') as 基线,
      material_code as 物料编码,
      quantity as 数量,
      material_name as 物料名称,
      supplier_name as 供应商,
      test_result as 测试结果,
      COALESCE(defect_desc, '') as 不合格描述,
      COALESCE(notes, '') as 备注
    FROM lab_tests
    WHERE material_name IN ('电池盖', '中框', '手机卡托', '侧键', '装饰件')
    ORDER BY test_date DESC LIMIT 50`,
    parameters: [],
    trigger_words: ['结构件类', '测试'],
    synonyms: {},
    example_query: '结构件类测试查询',
    priority: 15,
    status: 'active'
  },
  {
    intent_name: '光学类测试查询',
    description: '光学类测试查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT
      test_id as 测试编号,
      DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
      COALESCE(project, '') as 项目,
      COALESCE(baseline, '') as 基线,
      material_code as 物料编码,
      quantity as 数量,
      material_name as 物料名称,
      supplier_name as 供应商,
      test_result as 测试结果,
      COALESCE(defect_desc, '') as 不合格描述,
      COALESCE(notes, '') as 备注
    FROM lab_tests
    WHERE material_name IN ('LCD显示屏', 'OLED显示屏', '摄像头模组')
    ORDER BY test_date DESC LIMIT 50`,
    parameters: [],
    trigger_words: ['光学类', '测试'],
    synonyms: {},
    example_query: '光学类测试查询',
    priority: 15,
    status: 'active'
  },
  {
    intent_name: '充电类测试查询',
    description: '充电类测试查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT
      test_id as 测试编号,
      DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
      COALESCE(project, '') as 项目,
      COALESCE(baseline, '') as 基线,
      material_code as 物料编码,
      quantity as 数量,
      material_name as 物料名称,
      supplier_name as 供应商,
      test_result as 测试结果,
      COALESCE(defect_desc, '') as 不合格描述,
      COALESCE(notes, '') as 备注
    FROM lab_tests
    WHERE material_name IN ('电池', '充电器')
    ORDER BY test_date DESC LIMIT 50`,
    parameters: [],
    trigger_words: ['充电类', '测试'],
    synonyms: {},
    example_query: '充电类测试查询',
    priority: 15,
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
