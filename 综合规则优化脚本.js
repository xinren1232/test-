/**
 * 综合规则优化脚本
 * 结合数据生成程序的字段定义，全面优化规则库
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 基于数据生成程序的完整字段定义
const FIELD_DEFINITIONS = {
  // 物料分类定义 (来自MaterialSupplierMap.js)
  materialCategories: {
    "结构件类": ["电池盖", "中框", "手机卡托", "侧键", "装饰件"],
    "光学类": ["LCD显示屏", "OLED显示屏", "摄像头模组"],
    "充电类": ["电池", "充电器"],
    "声学类": ["扬声器", "听筒"],
    "包材类": ["保护套", "标签", "包装盒"]
  },

  // 供应商映射 (来自MaterialSupplierMap.js)
  materialSuppliers: {
    "电池盖": ["聚龙", "欣冠", "广正"],
    "中框": ["聚龙", "欣冠", "广正"],
    "手机卡托": ["聚龙", "欣冠", "广正"],
    "侧键": ["聚龙", "欣冠", "广正"],
    "装饰件": ["聚龙", "欣冠", "广正"],
    "LCD显示屏": ["帝晶", "天马", "BOE"],
    "OLED显示屏": ["BOE", "天马", "华星"],
    "摄像头模组": ["盛泰", "天实", "深奥"],
    "电池": ["百俊达", "奥海", "辰阳"],
    "充电器": ["锂威", "风华", "维科"],
    "扬声器": ["东声", "豪声", "歌尔"],
    "听筒": ["东声", "豪声", "歌尔"],
    "保护套": ["丽德宝", "裕同", "富群"],
    "标签": ["丽德宝", "裕同", "富群"],
    "包装盒": ["丽德宝", "裕同", "富群"]
  },

  // 工厂定义 (来自SystemDataUpdater.js)
  factories: ["重庆工厂", "深圳工厂", "南昌工厂", "宜宾工厂"],

  // 仓库定义 (来自SystemDataUpdater.js)
  warehouses: ["中央库存", "重庆库存", "深圳库存"],

  // 工厂-仓库关系 (来自SystemDataUpdater.js)
  factoryWarehouseRules: {
    '重庆工厂': ['重庆库存', '中央库存'],
    '深圳工厂': '深圳库存',
    '南昌工厂': '中央库存',
    '宜宾工厂': '中央库存'
  },

  // 项目-基线关系 (来自SystemDataUpdater.js)
  projectBaselineRules: {
    'I6789': ['X6827', 'S665LN', 'KI4K', 'X6828'],
    'I6788': ['X6831', 'KI5K', 'KI3K'],
    'I6787': ['S662LN', 'S663LN', 'S664LN']
  },

  // 状态定义
  statusOptions: ["正常", "风险", "冻结"],
  testResults: ["PASS", "FAIL"],

  // 缺陷类型定义 (来自SystemDataUpdater.js)
  materialDefects: {
    "电池盖": ["划伤", "变形", "破裂", "起鼓", "色差", "尺寸异常"],
    "中框": ["变形", "破裂", "掉漆", "尺寸异常"],
    "手机卡托": ["注塑不良", "尺寸异常", "断裂", "毛刺"],
    "侧键": ["脱落", "卡键", "尺寸异常", "松动"],
    "装饰件": ["掉色", "偏位", "脱落"],
    "LCD显示屏": ["漏光", "暗点", "偏色", "亮晶"],
    "OLED显示屏": ["闪屏", "mura", "亮点", "亮线"],
    "摄像头模组": ["刮花", "底座破裂", "脏污", "无法拍照"],
    "电池": ["起鼓", "鼓包", "漏液", "电压不稳定"],
    "充电器": ["无法充电", "外壳破裂", "输出功率异常", "发热异常"],
    "扬声器": ["无声", "杂音", "音量小", "破裂"],
    "听筒": ["无声", "杂音", "音量小", "破裂"],
    "保护套": ["尺寸偏差", "发黄", "开孔错位", "模具压痕"],
    "标签": ["脱落", "错印", "logo错误", "尺寸异常"],
    "包装盒": ["破损", "logo错误", "错印"]
  }
};

// 前端场景字段映射 (完全对应前端页面)
const SCENE_FIELD_MAPPINGS = {
  inventory: {
    displayName: '库存场景',
    fields: ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'],
    sqlMapping: {
      '工厂': 'factory',
      '仓库': 'warehouse',
      '物料编码': 'material_code',
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '数量': 'quantity',
      '状态': 'status',
      '入库时间': "DATE_FORMAT(inbound_time, '%Y-%m-%d')",
      '到期时间': "DATE_FORMAT(expiry_time, '%Y-%m-%d')",
      '备注': 'notes'
    },
    tableName: 'inventory',
    constraints: {
      factory: FIELD_DEFINITIONS.factories,
      warehouse: FIELD_DEFINITIONS.warehouses,
      supplier_name: Object.values(FIELD_DEFINITIONS.materialSuppliers).flat(),
      status: FIELD_DEFINITIONS.statusOptions
    }
  },

  testing: {
    displayName: '测试场景',
    fields: ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注'],
    sqlMapping: {
      '测试编号': 'test_id',
      '日期': "DATE_FORMAT(test_date, '%Y-%m-%d')",
      '项目': 'project',
      '基线': 'baseline',
      '物料编码': 'material_code',
      '数量': 'quantity',
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '测试结果': 'test_result',
      '不合格描述': 'defect_desc',
      '备注': 'notes'
    },
    tableName: 'lab_tests',
    constraints: {
      project: Object.keys(FIELD_DEFINITIONS.projectBaselineRules),
      baseline: Object.values(FIELD_DEFINITIONS.projectBaselineRules).flat(),
      test_result: FIELD_DEFINITIONS.testResults,
      supplier_name: Object.values(FIELD_DEFINITIONS.materialSuppliers).flat()
    }
  },

  online: {
    displayName: '上线场景',
    fields: ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '本周异常', '检验日期', '备注'],
    sqlMapping: {
      '工厂': 'factory',
      '基线': 'baseline',
      '项目': 'project',
      '物料编码': 'material_code',
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '批次号': 'batch_code',
      '不良率': 'defect_rate',
      '本周异常': 'weekly_anomaly',
      '检验日期': "DATE_FORMAT(inspection_date, '%Y-%m-%d')",
      '备注': 'notes'
    },
    tableName: 'production_tracking',
    constraints: {
      factory: FIELD_DEFINITIONS.factories,
      project: Object.keys(FIELD_DEFINITIONS.projectBaselineRules),
      baseline: Object.values(FIELD_DEFINITIONS.projectBaselineRules).flat(),
      supplier_name: Object.values(FIELD_DEFINITIONS.materialSuppliers).flat()
    }
  },

  batch: {
    displayName: '批次场景',
    fields: ['批次号', '物料编码', '物料名称', '供应商', '数量', '入库日期', '产线异常', '测试异常', '备注'],
    sqlMapping: {
      '批次号': 'batch_code',
      '物料编码': 'material_code',
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '数量': 'quantity',
      '入库日期': "DATE_FORMAT(inbound_date, '%Y-%m-%d')",
      '产线异常': 'production_anomaly',
      '测试异常': 'test_anomaly',
      '备注': 'notes'
    },
    tableName: 'batch_management',
    constraints: {
      supplier_name: Object.values(FIELD_DEFINITIONS.materialSuppliers).flat()
    }
  }
};

class ComprehensiveRuleOptimizer {
  constructor() {
    this.connection = null;
    this.processedRules = [];
    this.errors = [];
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection(dbConfig);
      console.log('✅ 数据库连接成功');
    } catch (error) {
      console.error('❌ 数据库连接失败:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      console.log('✅ 数据库连接已关闭');
    }
  }

  /**
   * 获取所有活跃规则
   */
  async getAllActiveRules() {
    try {
      const [rules] = await this.connection.execute(`
        SELECT 
          id,
          intent_name,
          description,
          action_type,
          action_target,
          parameters,
          trigger_words,
          synonyms,
          example_query,
          category,
          priority,
          status
        FROM nlp_intent_rules 
        WHERE status = 'active'
        ORDER BY id ASC
      `);
      
      console.log(`📋 获取到 ${rules.length} 条活跃规则`);
      return rules;
    } catch (error) {
      console.error('❌ 获取规则失败:', error);
      throw error;
    }
  }

  /**
   * 智能识别规则场景
   */
  identifyRuleScenario(rule) {
    const text = `${rule.intent_name} ${rule.description || ''} ${rule.action_target || ''}`.toLowerCase();
    
    // 场景关键词匹配
    const sceneKeywords = {
      'inventory': ['库存', '物料库存', 'inventory', '仓库', '入库', '到期'],
      'testing': ['测试', 'NG', '不合格', 'lab_tests', '检验', '质量', '缺陷', '合格率'],
      'online': ['上线', '生产', 'production', '产线', '批次上线', '不良率'],
      'batch': ['批次', 'batch', '批次管理', '批次信息', '异常批次']
    };

    for (const [scene, keywords] of Object.entries(sceneKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return scene;
      }
    }

    return null;
  }

  /**
   * 生成标准化SQL查询
   */
  generateStandardizedSQL(scene, rule) {
    const mapping = SCENE_FIELD_MAPPINGS[scene];
    if (!mapping) {
      return rule.action_target; // 如果没有映射，返回原SQL
    }

    // 构建SELECT字段
    const selectFields = mapping.fields.map(field => {
      const sqlField = mapping.sqlMapping[field];
      return `  ${sqlField} as ${field}`;
    }).join(',\n');

    // 构建WHERE条件 (基于规则名称和描述推断)
    let whereConditions = ['1=1'];
    
    // 根据规则内容添加智能WHERE条件
    const ruleName = rule.intent_name.toLowerCase();
    const ruleDesc = (rule.description || '').toLowerCase();
    
    // 供应商相关查询
    if (ruleName.includes('供应商') || ruleDesc.includes('供应商')) {
      whereConditions.push("(? IS NULL OR supplier_name LIKE CONCAT('%', ?, '%'))");
    }
    
    // 物料相关查询
    if (ruleName.includes('物料') || ruleDesc.includes('物料')) {
      whereConditions.push("(? IS NULL OR material_name LIKE CONCAT('%', ?, '%'))");
      whereConditions.push("(? IS NULL OR material_code LIKE CONCAT('%', ?, '%'))");
    }
    
    // 工厂相关查询
    if (ruleName.includes('工厂') || ruleDesc.includes('工厂')) {
      whereConditions.push("(? IS NULL OR factory LIKE CONCAT('%', ?, '%'))");
    }
    
    // 状态相关查询
    if (ruleName.includes('状态') || ruleName.includes('异常') || ruleName.includes('风险')) {
      if (scene === 'inventory') {
        whereConditions.push("(? IS NULL OR status = ?)");
      } else if (scene === 'testing') {
        whereConditions.push("(? IS NULL OR test_result = ?)");
      }
    }

    // 生成完整SQL
    const standardSQL = `SELECT 
${selectFields}
FROM ${mapping.tableName}
WHERE ${whereConditions.join('\n  AND ')}
ORDER BY ${mapping.fields.includes('日期') ? mapping.sqlMapping['日期'] : 'id'} DESC
LIMIT 10`;

    return standardSQL;
  }

  /**
   * 生成增强的触发词和同义词
   */
  generateEnhancedTriggerWords(rule, scene) {
    const mapping = SCENE_FIELD_MAPPINGS[scene];
    if (!mapping) return { trigger_words: [], synonyms: {} };

    const triggerWords = [];
    const synonyms = {};

    // 基于场景添加触发词
    const sceneTriggers = {
      'inventory': ['库存', '物料库存', '仓库', '入库', '到期', '数量'],
      'testing': ['测试', '检验', '质量', 'NG', '不合格', '合格率', '缺陷'],
      'online': ['上线', '生产', '产线', '批次上线', '不良率', '异常'],
      'batch': ['批次', '批次管理', '批次信息', '异常批次']
    };

    triggerWords.push(...(sceneTriggers[scene] || []));

    // 添加字段相关触发词
    mapping.fields.forEach(field => {
      triggerWords.push(field);
      
      // 添加同义词
      const fieldSynonyms = {
        '物料编码': ['料号', '编码', '物料号'],
        '物料名称': ['物料', '料件', '零件'],
        '供应商': ['厂商', '供货商', '供应方'],
        '工厂': ['厂区', '生产基地', '制造厂'],
        '仓库': ['库房', '存储区', '仓储'],
        '状态': ['情况', '状况', '条件'],
        '测试结果': ['检验结果', '测试状态', '质量结果'],
        '不合格描述': ['缺陷描述', '问题描述', '异常描述'],
        '批次号': ['批号', '批次', 'batch'],
        '不良率': ['缺陷率', '异常率', '问题率']
      };

      if (fieldSynonyms[field]) {
        synonyms[field] = fieldSynonyms[field];
      }
    });

    // 添加约束值作为触发词和同义词
    if (mapping.constraints) {
      Object.entries(mapping.constraints).forEach(([field, values]) => {
        if (Array.isArray(values)) {
          triggerWords.push(...values);
          
          // 特殊同义词处理
          if (field === 'factory') {
            synonyms['工厂'] = values;
          } else if (field === 'supplier_name') {
            synonyms['供应商'] = values;
          }
        }
      });
    }

    return {
      trigger_words: JSON.stringify([...new Set(triggerWords)]),
      synonyms: JSON.stringify(synonyms)
    };
  }

  /**
   * 更新单个规则
   */
  async updateRule(rule, dryRun = true) {
    const scene = this.identifyRuleScenario(rule);
    
    if (!scene || rule.action_type !== 'SQL_QUERY') {
      console.log(`⏭️ 跳过规则 ${rule.id}: ${rule.intent_name} (场景: ${scene || '未识别'}, 类型: ${rule.action_type})`);
      return;
    }

    const mapping = SCENE_FIELD_MAPPINGS[scene];
    const standardizedSQL = this.generateStandardizedSQL(scene, rule);
    const { trigger_words, synonyms } = this.generateEnhancedTriggerWords(rule, scene);

    const updateData = {
      action_target: standardizedSQL,
      category: mapping.displayName,
      trigger_words: trigger_words,
      synonyms: synonyms
    };

    const needsUpdate = rule.action_target !== standardizedSQL || 
                       rule.category !== mapping.displayName ||
                       !rule.trigger_words ||
                       !rule.synonyms;

    if (dryRun) {
      console.log(`🔍 [预览] 规则 ${rule.id}: ${rule.intent_name}`);
      console.log(`   场景: ${mapping.displayName}`);
      console.log(`   需要更新: ${needsUpdate ? '是' : '否'}`);
      if (needsUpdate) {
        console.log(`   新SQL: ${standardizedSQL.substring(0, 100)}...`);
      }
    } else if (needsUpdate) {
      try {
        await this.connection.execute(`
          UPDATE nlp_intent_rules 
          SET action_target = ?, category = ?, trigger_words = ?, synonyms = ?
          WHERE id = ?
        `, [updateData.action_target, updateData.category, updateData.trigger_words, updateData.synonyms, rule.id]);
        
        console.log(`✅ 更新规则 ${rule.id}: ${rule.intent_name}`);
      } catch (error) {
        console.error(`❌ 更新规则 ${rule.id} 失败:`, error.message);
        this.errors.push({ ruleId: rule.id, error: error.message });
      }
    }

    this.processedRules.push({
      id: rule.id,
      name: rule.intent_name,
      scene: mapping.displayName,
      needsUpdate: needsUpdate
    });
  }

  /**
   * 批量处理所有规则
   */
  async processAllRules(dryRun = true) {
    try {
      console.log(`🚀 开始${dryRun ? '预览' : '执行'}综合规则优化...`);
      
      const rules = await this.getAllActiveRules();
      
      for (const rule of rules) {
        await this.updateRule(rule, dryRun);
      }
      
      this.generateReport(dryRun);
      
    } catch (error) {
      console.error('❌ 批量处理失败:', error);
      throw error;
    }
  }

  /**
   * 生成处理报告
   */
  generateReport(dryRun) {
    console.log('\n📊 综合优化报告:');
    console.log(`模式: ${dryRun ? '预览模式' : '执行模式'}`);
    console.log(`总规则数: ${this.processedRules.length}`);
    
    const needsUpdate = this.processedRules.filter(r => r.needsUpdate);
    console.log(`需要更新: ${needsUpdate.length}`);
    
    const byScene = {};
    this.processedRules.forEach(rule => {
      byScene[rule.scene] = (byScene[rule.scene] || 0) + 1;
    });
    
    console.log('\n📋 按场景分布:');
    Object.entries(byScene).forEach(([scene, count]) => {
      console.log(`  ${scene}: ${count}条`);
    });
    
    if (this.errors.length > 0) {
      console.log(`\n❌ 错误数: ${this.errors.length}`);
    }

    console.log('\n🎯 字段定义统计:');
    console.log(`  物料分类: ${Object.keys(FIELD_DEFINITIONS.materialCategories).length}类`);
    console.log(`  物料总数: ${Object.values(FIELD_DEFINITIONS.materialCategories).flat().length}种`);
    console.log(`  供应商总数: ${[...new Set(Object.values(FIELD_DEFINITIONS.materialSuppliers).flat())].length}家`);
    console.log(`  工厂数量: ${FIELD_DEFINITIONS.factories.length}个`);
    console.log(`  仓库数量: ${FIELD_DEFINITIONS.warehouses.length}个`);
  }
}

// 主函数
async function main() {
  const optimizer = new ComprehensiveRuleOptimizer();
  
  try {
    await optimizer.connect();
    
    const args = process.argv.slice(2);
    const executeMode = args.includes('--execute');
    
    console.log('🔧 IQE综合规则优化工具');
    console.log('==========================');
    console.log('📋 基于数据生成程序字段定义的规则库优化');
    
    if (!executeMode) {
      console.log('⚠️ 当前为预览模式，不会实际修改数据');
      console.log('要执行实际更新，请添加 --execute 参数');
    }
    
    await optimizer.processAllRules(!executeMode);
    
  } catch (error) {
    console.error('❌ 执行失败:', error);
  } finally {
    await optimizer.disconnect();
  }
}

// 运行脚本
main().catch(console.error);
