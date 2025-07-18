// 场景规则管理器 - 根据三个场景完善规则系统
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 场景字段映射 - 根据实际数据生成程序的字段定义
const SCENARIO_FIELD_MAPPING = {
  '库存场景': {
    tableName: 'inventory_data',
    description: '库存管理相关查询，包括物料库存、供应商库存、状态查询等',
    fields: {
      materialName: '物料名称',
      materialCode: '物料编码', 
      batchNo: '批次号',
      supplier: '供应商',
      quantity: '数量',
      status: '状态',
      warehouse: '仓库',
      factory: '工厂',
      projectId: '项目ID',
      baselineId: '基线ID',
      inboundTime: '入库时间',
      lastUpdateTime: '最后更新时间',
      expiryDate: '到期时间',
      freezeReason: '冻结原因'
    },
    commonQueries: [
      '查询{物料名称}的库存情况',
      '查询{供应商}供应商的库存',
      '查询{状态}状态的库存',
      '查询{工厂}的库存情况',
      '查询批次{批次号}的库存信息',
      '查询{仓库}的库存数据'
    ],
    statusValues: ['正常', '风险', '冻结'],
    warehouseValues: ['中央库存', '重庆库存', '深圳库存'],
    factoryValues: ['重庆工厂', '深圳工厂', '南昌工厂', '宜宾工厂']
  },
  '测试场景': {
    tableName: 'inspection_data', 
    description: '实验室测试相关查询，包括测试结果、缺陷分析、供应商测试表现等',
    fields: {
      materialName: '物料名称',
      batchNo: '批次号',
      supplier: '供应商',
      testResult: '测试结果',
      testDate: '测试日期',
      projectId: '项目ID',
      defectDescription: '缺陷描述',
      inspector: '检验员',
      testType: '测试类型'
    },
    commonQueries: [
      '查询{供应商}供应商的测试结果',
      '查询{测试结果}测试结果',
      '查询{物料名称}的测试情况',
      '查询批次{批次号}的测试记录',
      '查询{项目ID}项目的测试数据',
      '查询NG测试结果'
    ],
    testResultValues: ['合格', 'NG', '待检验'],
    defectTypes: ['外观不良', '尺寸超差', '材质问题', '标识错误', '功能异常']
  },
  '上线场景': {
    tableName: 'production_data',
    description: '生产上线相关查询，包括上线状态、不良率分析、生产问题追踪等',
    fields: {
      materialName: '物料名称',
      materialCode: '物料编码',
      batchNo: '批次号', 
      supplier: '供应商',
      factory: '工厂',
      onlineTime: '上线时间',
      defectRate: '不良率',
      defect: '不良现象',
      projectId: '项目ID',
      baselineId: '基线ID',
      onlineStatus: '上线状态',
      inspector: '检验员'
    },
    commonQueries: [
      '查询{物料名称}的上线情况',
      '查询{供应商}供应商的上线数据',
      '查询{工厂}的上线记录',
      '查询不良率超过{数值}%的记录',
      '查询{不良现象}的上线问题',
      '查询{项目ID}项目的上线情况'
    ],
    onlineStatusValues: ['良好', '不良', '待确认'],
    defectPhenomena: ['划伤', '变形', '破裂', '起鼓', '色差', '尺寸异常', '漏光', '暗点', '偏色', '亮晶']
  }
};

// 物料类别映射
const MATERIAL_CATEGORIES = {
  '结构件类': ['电池盖', '中框', '手机卡托', '侧键', '装饰件'],
  '光学类': ['LCD显示屏', 'OLED显示屏', '摄像头(CAM)'],
  '充电类': ['电池', '充电器'],
  '声学类': ['喇叭', '听筒'],
  '包材类': ['保护套', '标签', '包装盒']
};

// 供应商映射
const SUPPLIER_MAPPING = {
  '聚龙': ['电池盖', '中框', '手机卡托', '侧键', '装饰件'],
  '欣冠': ['电池盖', '中框', '手机卡托', '侧键', '装饰件'],
  '广正': ['电池盖', '中框', '手机卡托', '侧键', '装饰件'],
  'BOE': ['LCD显示屏', 'OLED显示屏'],
  '天马': ['LCD显示屏', 'OLED显示屏'],
  '华星': ['OLED显示屏'],
  '盛泰': ['摄像头(CAM)'],
  '天实': ['摄像头(CAM)'],
  '深奥': ['摄像头(CAM)'],
  '百佳达': ['电池'],
  '奥海': ['电池'],
  '辉阳': ['电池'],
  '理威': ['充电器'],
  '风华': ['充电器'],
  '维科': ['充电器'],
  '东声': ['喇叭', '听筒'],
  '瑞声': ['喇叭', '听筒'],
  '歌尔': ['喇叭', '听筒'],
  '丽德宝': ['保护套', '标签', '包装盒'],
  '怡同': ['保护套', '标签', '包装盒'],
  '富群': ['保护套', '标签', '包装盒']
};

class ScenarioRulesManager {
  constructor() {
    this.connection = null;
  }

  async connect() {
    if (!this.connection) {
      this.connection = await mysql.createConnection(dbConfig);
    }
    return this.connection;
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }
  }

  /**
   * 完善三个场景的规则系统
   */
  async enhanceScenarioRules() {
    try {
      console.log('🚀 开始完善三个场景的规则系统...');
      
      const connection = await this.connect();
      
      // 1. 检查现有规则
      const existingRules = await this.getExistingRules();
      console.log(`📋 现有规则数量: ${existingRules.length}`);
      
      // 2. 为每个场景生成完善的规则
      let addedCount = 0;
      
      for (const [scenarioName, scenarioConfig] of Object.entries(SCENARIO_FIELD_MAPPING)) {
        console.log(`\n📝 处理场景: ${scenarioName}`);
        
        // 生成基础查询规则
        const basicRules = await this.generateBasicScenarioRules(scenarioName, scenarioConfig);
        addedCount += basicRules.length;
        
        // 生成物料类别规则
        const categoryRules = await this.generateMaterialCategoryRules(scenarioName, scenarioConfig);
        addedCount += categoryRules.length;
        
        // 生成供应商规则
        const supplierRules = await this.generateSupplierRules(scenarioName, scenarioConfig);
        addedCount += supplierRules.length;
        
        // 生成组合查询规则
        const combinedRules = await this.generateCombinedQueryRules(scenarioName, scenarioConfig);
        addedCount += combinedRules.length;
      }
      
      console.log(`\n✅ 场景规则完善完成，新增 ${addedCount} 条规则`);
      
      return {
        success: true,
        message: `成功完善三个场景规则系统，新增 ${addedCount} 条规则`,
        addedCount
      };
      
    } catch (error) {
      console.error('❌ 完善场景规则失败:', error);
      return {
        success: false,
        message: `完善场景规则失败: ${error.message}`
      };
    }
  }

  /**
   * 获取现有规则
   */
  async getExistingRules() {
    const connection = await this.connect();
    const [rules] = await connection.execute(`
      SELECT intent_name, category, example_query 
      FROM nlp_intent_rules 
      ORDER BY category, priority DESC
    `);
    return rules;
  }

  /**
   * 生成基础场景规则
   */
  async generateBasicScenarioRules(scenarioName, scenarioConfig) {
    const connection = await this.connect();
    const rules = [];

    // 为每个常见查询生成规则
    for (let i = 0; i < scenarioConfig.commonQueries.length; i++) {
      const queryTemplate = scenarioConfig.commonQueries[i];
      const intentName = `${scenarioName}_基础查询_${i + 1}`;

      // 检查规则是否已存在
      const [existing] = await connection.execute(
        'SELECT id FROM nlp_intent_rules WHERE intent_name = ?',
        [intentName]
      );

      if (existing.length === 0) {
        const rule = {
          intent_name: intentName,
          description: `${scenarioConfig.description} - ${queryTemplate}`,
          category: scenarioName,
          action_type: 'query',
          action_target: scenarioConfig.tableName,
          parameters: JSON.stringify(this.extractParametersFromQuery(queryTemplate, scenarioConfig)),
          trigger_words: JSON.stringify(this.generateTriggerWords(queryTemplate)),
          synonyms: JSON.stringify(this.generateSynonyms(queryTemplate)),
          example_query: this.generateExampleQuery(queryTemplate),
          priority: 80,
          sort_order: i + 1,
          status: 'active'
        };

        await this.insertRule(rule);
        rules.push(rule);
      }
    }

    console.log(`  ✅ ${scenarioName} 基础规则: ${rules.length} 条`);
    return rules;
  }

  /**
   * 生成物料类别规则
   */
  async generateMaterialCategoryRules(scenarioName, scenarioConfig) {
    const connection = await this.connect();
    const rules = [];

    for (const [category, materials] of Object.entries(MATERIAL_CATEGORIES)) {
      const intentName = `${scenarioName}_${category}_查询`;

      // 检查规则是否已存在
      const [existing] = await connection.execute(
        'SELECT id FROM nlp_intent_rules WHERE intent_name = ?',
        [intentName]
      );

      if (existing.length === 0) {
        const rule = {
          intent_name: intentName,
          description: `查询${category}物料的${scenarioName.replace('场景', '')}信息`,
          category: scenarioName,
          action_type: 'query',
          action_target: scenarioConfig.tableName,
          parameters: JSON.stringify({
            materialCategory: category,
            materials: materials,
            fields: Object.keys(scenarioConfig.fields)
          }),
          trigger_words: JSON.stringify([category, ...materials, '查询', scenarioName.replace('场景', '')]),
          synonyms: JSON.stringify(this.generateCategorySynonyms(category)),
          example_query: `查询${category}的${scenarioName.replace('场景', '')}情况`,
          priority: 75,
          sort_order: 100 + Object.keys(MATERIAL_CATEGORIES).indexOf(category),
          status: 'active'
        };

        await this.insertRule(rule);
        rules.push(rule);
      }
    }

    console.log(`  ✅ ${scenarioName} 物料类别规则: ${rules.length} 条`);
    return rules;
  }

  /**
   * 生成供应商规则
   */
  async generateSupplierRules(scenarioName, scenarioConfig) {
    const connection = await this.connect();
    const rules = [];

    for (const [supplier, materials] of Object.entries(SUPPLIER_MAPPING)) {
      const intentName = `${scenarioName}_${supplier}供应商_查询`;

      // 检查规则是否已存在
      const [existing] = await connection.execute(
        'SELECT id FROM nlp_intent_rules WHERE intent_name = ?',
        [intentName]
      );

      if (existing.length === 0) {
        const rule = {
          intent_name: intentName,
          description: `查询${supplier}供应商的${scenarioName.replace('场景', '')}信息`,
          category: scenarioName,
          action_type: 'query',
          action_target: scenarioConfig.tableName,
          parameters: JSON.stringify({
            supplier: supplier,
            materials: materials,
            fields: Object.keys(scenarioConfig.fields)
          }),
          trigger_words: JSON.stringify([supplier, '供应商', '查询', scenarioName.replace('场景', '')]),
          synonyms: JSON.stringify([supplier + '供应商', supplier + '厂商']),
          example_query: `查询${supplier}供应商的${scenarioName.replace('场景', '')}情况`,
          priority: 85,
          sort_order: 200 + Object.keys(SUPPLIER_MAPPING).indexOf(supplier),
          status: 'active'
        };

        await this.insertRule(rule);
        rules.push(rule);
      }
    }

    console.log(`  ✅ ${scenarioName} 供应商规则: ${rules.length} 条`);
    return rules;
  }

  /**
   * 生成组合查询规则
   */
  async generateCombinedQueryRules(scenarioName, scenarioConfig) {
    const connection = await this.connect();
    const rules = [];

    // 生成一些常见的组合查询
    const combinedQueries = [
      {
        name: '供应商物料组合查询',
        template: '查询{supplier}供应商的{material}',
        description: '按供应商和物料组合查询'
      },
      {
        name: '项目物料组合查询',
        template: '查询{project}项目的{material}',
        description: '按项目和物料组合查询'
      },
      {
        name: '状态筛选查询',
        template: '查询{status}状态的{material}',
        description: '按状态筛选查询'
      }
    ];

    for (let i = 0; i < combinedQueries.length; i++) {
      const query = combinedQueries[i];
      const intentName = `${scenarioName}_${query.name}`;

      // 检查规则是否已存在
      const [existing] = await connection.execute(
        'SELECT id FROM nlp_intent_rules WHERE intent_name = ?',
        [intentName]
      );

      if (existing.length === 0) {
        const rule = {
          intent_name: intentName,
          description: `${scenarioConfig.description} - ${query.description}`,
          category: scenarioName,
          action_type: 'query',
          action_target: scenarioConfig.tableName,
          parameters: JSON.stringify(this.extractParametersFromQuery(query.template, scenarioConfig)),
          trigger_words: JSON.stringify(this.generateTriggerWords(query.template)),
          synonyms: JSON.stringify(this.generateSynonyms(query.template)),
          example_query: this.generateExampleQuery(query.template),
          priority: 70,
          sort_order: 300 + i,
          status: 'active'
        };

        await this.insertRule(rule);
        rules.push(rule);
      }
    }

    console.log(`  ✅ ${scenarioName} 组合查询规则: ${rules.length} 条`);
    return rules;
  }

  /**
   * 从查询模板中提取参数
   */
  extractParametersFromQuery(queryTemplate, scenarioConfig) {
    const parameters = {
      scenario: scenarioConfig.tableName,
      fields: Object.keys(scenarioConfig.fields)
    };

    // 提取模板中的参数占位符
    const placeholders = queryTemplate.match(/\{([^}]+)\}/g);
    if (placeholders) {
      placeholders.forEach(placeholder => {
        const key = placeholder.replace(/[{}]/g, '');
        parameters[key] = `{${key}}`;
      });
    }

    return parameters;
  }

  /**
   * 生成触发词
   */
  generateTriggerWords(queryTemplate) {
    const words = [];

    // 从模板中提取关键词
    const cleanTemplate = queryTemplate.replace(/\{[^}]+\}/g, '');
    const templateWords = cleanTemplate.match(/[\u4e00-\u9fa5]+/g) || [];
    words.push(...templateWords);

    // 添加常用触发词
    words.push('查询', '查看', '显示', '获取', '统计', '分析');

    return [...new Set(words)];
  }

  /**
   * 生成同义词
   */
  generateSynonyms(queryTemplate) {
    const synonyms = [];

    if (queryTemplate.includes('库存')) {
      synonyms.push('存货', '库房', '仓储');
    }
    if (queryTemplate.includes('测试')) {
      synonyms.push('检测', '检验', '试验');
    }
    if (queryTemplate.includes('上线')) {
      synonyms.push('生产', '投产', '制造');
    }
    if (queryTemplate.includes('供应商')) {
      synonyms.push('厂商', '供货商', '提供商');
    }

    return synonyms;
  }

  /**
   * 生成类别同义词
   */
  generateCategorySynonyms(category) {
    const synonymMap = {
      '结构件类': ['结构件', '结构部件', '机构件'],
      '光学类': ['光学器件', '光学元件', '显示器件'],
      '充电类': ['电源类', '充电器件', '电池类'],
      '声学类': ['音频器件', '声音器件', '音响器件'],
      '包材类': ['包装材料', '包装件', '辅料']
    };

    return synonymMap[category] || [];
  }

  /**
   * 生成示例查询
   */
  generateExampleQuery(queryTemplate) {
    // 替换模板中的占位符为具体示例
    let example = queryTemplate;

    const replacements = {
      '{物料名称}': '电池',
      '{供应商}': '聚龙',
      '{状态}': '正常',
      '{工厂}': '重庆工厂',
      '{批次号}': '123456',
      '{仓库}': '中央库存',
      '{测试结果}': 'NG',
      '{项目ID}': 'X6827',
      '{数值}': '5',
      '{不良现象}': '划伤',
      '{supplier}': '聚龙',
      '{material}': '电池',
      '{project}': 'X6827',
      '{status}': '正常'
    };

    for (const [placeholder, value] of Object.entries(replacements)) {
      example = example.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    }

    return example;
  }

  /**
   * 插入规则到数据库
   */
  async insertRule(rule) {
    const connection = await this.connect();

    const sql = `
      INSERT INTO nlp_intent_rules (
        intent_name, description, category, action_type, action_target,
        parameters, trigger_words, synonyms, example_query, priority, sort_order, status,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const values = [
      rule.intent_name,
      rule.description,
      rule.category,
      rule.action_type,
      rule.action_target,
      rule.parameters,
      rule.trigger_words,
      rule.synonyms,
      rule.example_query,
      rule.priority,
      rule.sort_order,
      rule.status
    ];

    await connection.execute(sql, values);
  }

  /**
   * 验证场景规则
   */
  async validateScenarioRules() {
    try {
      console.log('🔍 验证场景规则...');

      const connection = await this.connect();

      // 检查每个场景的规则数量
      for (const scenarioName of Object.keys(SCENARIO_FIELD_MAPPING)) {
        const [rules] = await connection.execute(
          'SELECT COUNT(*) as count FROM nlp_intent_rules WHERE category = ?',
          [scenarioName]
        );

        console.log(`📊 ${scenarioName}: ${rules[0].count} 条规则`);
      }

      // 检查规则完整性
      const [allRules] = await connection.execute(`
        SELECT category, COUNT(*) as count,
               COUNT(CASE WHEN example_query IS NOT NULL AND example_query != '' THEN 1 END) as with_examples
        FROM nlp_intent_rules
        WHERE category IN ('库存场景', '测试场景', '上线场景')
        GROUP BY category
      `);

      console.log('\n📋 规则完整性检查:');
      allRules.forEach(rule => {
        console.log(`  ${rule.category}: ${rule.count}条规则, ${rule.with_examples}条有示例`);
      });

      return {
        success: true,
        message: '场景规则验证完成',
        rules: allRules
      };

    } catch (error) {
      console.error('❌ 验证场景规则失败:', error);
      return {
        success: false,
        message: `验证场景规则失败: ${error.message}`
      };
    }
  }
}

export default ScenarioRulesManager;
