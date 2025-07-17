/**
 * 智能问答系统 - 支持全字段精确查询和完整数据返回
 * 解决问题：
 * 1. 移除所有LIMIT限制，返回完整数据
 * 2. 实现智能意图识别，支持所有字段的精确查询
 */
import mysql from 'mysql2/promise';
import dbConfig from '../config/db.config.js';

class SimpleRuleBasedQA {
  constructor() {
    this.connection = null;
    this.dataDict = {
      suppliers: [],
      materials: [],
      factories: [],
      statuses: [],
      projects: [],
      baselines: []
    };
    this.initialized = false;
  }

  async getConnection() {
    if (!this.connection) {
      this.connection = await mysql.createConnection({
        host: dbConfig.host,
        user: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.database,
        charset: 'utf8mb4'
      });
    }
    return this.connection;
  }

  /**
   * 初始化数据字典 - 获取所有可能的字段值
   */
  async initializeDataDictionary() {
    if (this.initialized) return;

    try {
      const connection = await this.getConnection();

      // 获取所有供应商
      const [suppliers] = await connection.execute(`
        SELECT DISTINCT supplier_name FROM (
          SELECT supplier_name FROM inventory WHERE supplier_name IS NOT NULL
          UNION
          SELECT supplier_name FROM online_tracking WHERE supplier_name IS NOT NULL
          UNION
          SELECT supplier_name FROM lab_tests WHERE supplier_name IS NOT NULL
        ) AS all_suppliers ORDER BY supplier_name
      `);
      this.dataDict.suppliers = suppliers.map(s => s.supplier_name);

      // 获取所有物料
      const [materials] = await connection.execute(`
        SELECT DISTINCT material_name FROM (
          SELECT material_name FROM inventory WHERE material_name IS NOT NULL
          UNION
          SELECT material_name FROM online_tracking WHERE material_name IS NOT NULL
          UNION
          SELECT material_name FROM lab_tests WHERE material_name IS NOT NULL
        ) AS all_materials ORDER BY material_name
      `);
      this.dataDict.materials = materials.map(m => m.material_name);

      // 获取所有工厂
      const [factories] = await connection.execute(`
        SELECT DISTINCT storage_location FROM inventory WHERE storage_location IS NOT NULL
        UNION
        SELECT DISTINCT factory FROM online_tracking WHERE factory IS NOT NULL
        ORDER BY storage_location
      `);
      this.dataDict.factories = factories.map(f => f.storage_location);

      // 获取所有状态
      const [statuses] = await connection.execute(`
        SELECT DISTINCT status FROM inventory WHERE status IS NOT NULL
        ORDER BY status
      `);
      this.dataDict.statuses = statuses.map(s => s.status);

      // 获取所有项目 - 使用实际存在的字段
      try {
        const [projects] = await connection.execute(`
          SELECT DISTINCT project FROM (
            SELECT project FROM online_tracking WHERE project IS NOT NULL
            UNION
            SELECT project FROM lab_tests WHERE project IS NOT NULL
          ) AS all_projects ORDER BY project
        `);
        this.dataDict.projects = projects.map(p => p.project);
      } catch (error) {
        console.log('⚠️ 项目字段查询失败，使用默认值:', error.message);
        this.dataDict.projects = ['项目1', '项目2', '项目3'];
      }

      // 获取所有基线 - 使用实际存在的字段
      try {
        const [baselines] = await connection.execute(`
          SELECT DISTINCT baseline FROM (
            SELECT baseline FROM online_tracking WHERE baseline IS NOT NULL
            UNION
            SELECT baseline FROM lab_tests WHERE baseline IS NOT NULL
          ) AS all_baselines ORDER BY baseline
        `);
        this.dataDict.baselines = baselines.map(b => b.baseline);
      } catch (error) {
        console.log('⚠️ 基线字段查询失败，使用默认值:', error.message);
        this.dataDict.baselines = ['基线1', '基线2', '基线3'];
      }

      this.initialized = true;
      console.log('📚 数据字典初始化完成:', {
        suppliers: this.dataDict.suppliers.length,
        materials: this.dataDict.materials.length,
        factories: this.dataDict.factories.length,
        statuses: this.dataDict.statuses.length,
        projects: this.dataDict.projects.length,
        baselines: this.dataDict.baselines.length
      });

    } catch (error) {
      console.error('❌ 数据字典初始化失败:', error);
    }
  }

  async processQuestion(question) {
    console.log(`🤖 智能问答处理: "${question}"`);

    try {
      // 初始化数据字典
      await this.initializeDataDictionary();

      const connection = await this.getConnection();

      // 1. 智能意图识别和实体提取
      const intentAnalysis = await this.analyzeIntent(question);
      console.log('🎯 意图分析结果:', intentAnalysis);

      // 2. 基于意图执行精确查询
      const queryResult = await this.executeIntelligentQuery(intentAnalysis, connection);

      if (queryResult.data && queryResult.data.length > 0) {
        return {
          success: true,
          data: {
            question: question,
            answer: queryResult.answer,
            data: queryResult.data, // 真实的表格数据
            tableData: queryResult.data, // 兼容性
            analysis: {
              type: queryResult.type,
              intent: intentAnalysis.intent,
              entities: intentAnalysis.entities,
              confidence: intentAnalysis.confidence
            },
            template: queryResult.template,
            metadata: {
              dataSource: 'real_database',
              timestamp: new Date().toISOString(),
              recordCount: queryResult.data.length,
              queryConditions: intentAnalysis.conditions
            }
          }
        };
      } else {
        return {
          success: true,
          data: {
            question: question,
            answer: this.generateNoDataResponse(intentAnalysis),
            data: [],
            tableData: [],
            analysis: {
              type: 'no_data',
              intent: intentAnalysis.intent,
              entities: intentAnalysis.entities,
              confidence: intentAnalysis.confidence
            },
            template: 'no_data_found'
          }
        };
      }
    } catch (error) {
      console.error('❌ 智能问答处理失败:', error);
      return {
        success: false,
        error: error.message,
        data: {
          question: question,
          answer: `处理问题时发生错误: ${error.message}`
        }
      };
    }
  }

  /**
   * 智能意图识别和实体提取
   */
  async analyzeIntent(question) {
    const questionLower = question.toLowerCase();
    const analysis = {
      intent: 'general_query',
      entities: {},
      conditions: [],
      confidence: 0.5,
      queryType: 'inventory' // 默认库存查询
    };

    // 1. 识别查询类型 - 改进逻辑，支持更智能的意图识别
    if (questionLower.includes('库存') || questionLower.includes('仓库') || questionLower.includes('inventory')) {
      analysis.queryType = 'inventory';
      analysis.intent = 'inventory_query';
    } else if (questionLower.includes('上线') || questionLower.includes('生产') || questionLower.includes('online') || questionLower.includes('production')) {
      analysis.queryType = 'production';
      analysis.intent = 'production_query';
    } else if (questionLower.includes('测试') || questionLower.includes('检验') || questionLower.includes('test') || questionLower.includes('lab')) {
      analysis.queryType = 'testing';
      analysis.intent = 'testing_query';
    }

    // 2. 提取实体信息
    await this.extractEntities(question, analysis);

    // 3. 基于实体信息进一步优化查询类型判断
    this.refineQueryTypeBasedOnEntities(question, analysis);

    // 4. 计算置信度
    analysis.confidence = this.calculateConfidence(analysis);

    return analysis;
  }

  /**
   * 基于实体信息优化查询类型判断
   */
  refineQueryTypeBasedOnEntities(question, analysis) {
    const questionLower = question.toLowerCase();

    // 如果问题包含供应商但没有明确的查询类型，需要进一步判断
    if (analysis.entities.supplier && analysis.queryType === 'inventory') {
      // 检查是否有其他暗示查询类型的词汇
      if (questionLower.includes('物料') && !questionLower.includes('库存')) {
        // "供应商物料"这种查询，根据上下文判断最可能的查询类型
        if (questionLower.includes('质量') || questionLower.includes('不良') || questionLower.includes('缺陷')) {
          analysis.queryType = 'testing';
          analysis.intent = 'testing_query';
        } else if (questionLower.includes('批次') || questionLower.includes('不良率')) {
          analysis.queryType = 'production';
          analysis.intent = 'production_query';
        } else {
          // 默认情况下，"供应商物料"查询优先显示库存信息
          analysis.queryType = 'inventory';
          analysis.intent = 'inventory_query';
        }
      }
    }

    // 如果问题只包含供应商名称，没有其他明确指示
    if (analysis.entities.supplier && !questionLower.includes('库存') &&
        !questionLower.includes('测试') && !questionLower.includes('上线') &&
        !questionLower.includes('生产')) {
      // 根据问题的表述方式判断
      if (questionLower.includes('有哪些') || questionLower.includes('什么') ||
          questionLower.includes('多少') || questionLower.includes('情况')) {
        // 这类问题通常是想了解供应商的整体情况，优先显示库存
        analysis.queryType = 'inventory';
        analysis.intent = 'inventory_query';
      }
    }
  }

  /**
   * 提取实体信息
   */
  async extractEntities(question, analysis) {
    const questionLower = question.toLowerCase();

    // 提取供应商
    for (const supplier of this.dataDict.suppliers) {
      if (questionLower.includes(supplier.toLowerCase())) {
        analysis.entities.supplier = supplier;
        analysis.conditions.push(`供应商: ${supplier}`);
        break;
      }
    }

    // 提取物料
    for (const material of this.dataDict.materials) {
      if (questionLower.includes(material.toLowerCase())) {
        analysis.entities.material = material;
        analysis.conditions.push(`物料: ${material}`);
        break;
      }
    }

    // 提取工厂
    for (const factory of this.dataDict.factories) {
      if (questionLower.includes(factory.toLowerCase())) {
        analysis.entities.factory = factory;
        analysis.conditions.push(`工厂: ${factory}`);
        break;
      }
    }

    // 提取状态
    for (const status of this.dataDict.statuses) {
      if (questionLower.includes(status.toLowerCase())) {
        analysis.entities.status = status;
        analysis.conditions.push(`状态: ${status}`);
        break;
      }
    }

    // 提取项目
    for (const project of this.dataDict.projects) {
      if (questionLower.includes(project.toLowerCase())) {
        analysis.entities.project = project;
        analysis.conditions.push(`项目: ${project}`);
        break;
      }
    }

    // 提取基线
    for (const baseline of this.dataDict.baselines) {
      if (questionLower.includes(baseline.toLowerCase())) {
        analysis.entities.baseline = baseline;
        analysis.conditions.push(`基线: ${baseline}`);
        break;
      }
    }

    // 提取特殊关键词
    if (questionLower.includes('风险')) {
      analysis.entities.status = '风险';
      analysis.conditions.push('状态: 风险');
    }
    if (questionLower.includes('正常')) {
      analysis.entities.status = '正常';
      analysis.conditions.push('状态: 正常');
    }
    if (questionLower.includes('冻结')) {
      analysis.entities.status = '冻结';
      analysis.conditions.push('状态: 冻结');
    }
    if (questionLower.includes('ng') || questionLower.includes('失败')) {
      analysis.entities.testResult = 'NG';
      analysis.conditions.push('测试结果: NG');
    }
    if (questionLower.includes('ok') || questionLower.includes('通过')) {
      analysis.entities.testResult = 'OK';
      analysis.conditions.push('测试结果: OK');
    }
  }

  /**
   * 计算置信度
   */
  calculateConfidence(analysis) {
    let confidence = 0.3; // 基础置信度

    // 有明确查询类型
    if (analysis.queryType !== 'inventory') confidence += 0.2;

    // 每个实体增加置信度
    const entityCount = Object.keys(analysis.entities).length;
    confidence += entityCount * 0.15;

    // 最大置信度限制
    return Math.min(confidence, 0.95);
  }
  /**
   * 基于意图执行智能查询 - 无LIMIT限制，返回完整数据
   */
  async executeIntelligentQuery(intentAnalysis, connection) {
    const { queryType, entities } = intentAnalysis;

    try {
      switch (queryType) {
        case 'inventory':
          return await this.executeInventoryQuery(entities, connection);
        case 'production':
          return await this.executeProductionQuery(entities, connection);
        case 'testing':
          return await this.executeTestingQuery(entities, connection);
        default:
          return await this.executeInventoryQuery(entities, connection);
      }
    } catch (error) {
      console.error('❌ 查询执行失败:', error);
      throw error;
    }
  }

  /**
   * 执行库存查询 - 支持所有字段精确匹配
   */
  async executeInventoryQuery(entities, connection) {
    let whereConditions = [];
    let params = [];

    // 构建WHERE条件
    if (entities.supplier) {
      whereConditions.push('supplier_name = ?');
      params.push(entities.supplier);
    }

    if (entities.material) {
      whereConditions.push('material_name LIKE ?');
      params.push(`%${entities.material}%`);
    }

    if (entities.factory) {
      whereConditions.push('storage_location = ?');
      params.push(entities.factory);
    }

    if (entities.status) {
      whereConditions.push('status = ?');
      params.push(entities.status);
    }

    const whereClause = whereConditions.length > 0 ?
      `WHERE ${whereConditions.join(' AND ')}` : '';

    const sql = `
      SELECT
        storage_location as 工厂,
        storage_location as 仓库,
        material_code as 物料编码,
        material_name as 物料名称,
        supplier_name as 供应商,
        quantity as 数量,
        status as 状态,
        DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
        DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
        COALESCE(notes, '') as 备注
      FROM inventory
      ${whereClause}
      ORDER BY inbound_time DESC
    `;

    console.log('🔍 执行库存查询SQL:', sql);
    console.log('📝 查询参数:', params);

    const [results] = await connection.execute(sql, params);

    return {
      data: results,
      answer: this.generateInventoryAnswer(entities, results.length),
      type: 'inventory_query',
      template: 'intelligent_inventory'
    };
  }

  /**
   * 执行生产/上线查询 - 支持所有字段精确匹配
   */
  async executeProductionQuery(entities, connection) {
    let whereConditions = [];
    let params = [];

    // 构建WHERE条件
    if (entities.supplier) {
      whereConditions.push('supplier_name = ?');
      params.push(entities.supplier);
    }

    if (entities.material) {
      whereConditions.push('material_name LIKE ?');
      params.push(`%${entities.material}%`);
    }

    if (entities.factory) {
      whereConditions.push('factory = ?');
      params.push(entities.factory);
    }

    if (entities.project) {
      whereConditions.push('project = ?');
      params.push(entities.project);
    }

    if (entities.baseline) {
      whereConditions.push('baseline = ?');
      params.push(entities.baseline);
    }

    const whereClause = whereConditions.length > 0 ?
      `WHERE ${whereConditions.join(' AND ')}` : '';

    const sql = `
      SELECT
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
      ${whereClause}
      ORDER BY inspection_date DESC
    `;

    console.log('🔍 执行生产查询SQL:', sql);
    console.log('📝 查询参数:', params);

    const [results] = await connection.execute(sql, params);

    return {
      data: results,
      answer: this.generateProductionAnswer(entities, results.length),
      type: 'production_query',
      template: 'intelligent_production'
    };
  }
  /**
   * 执行测试查询 - 支持所有字段精确匹配
   */
  async executeTestingQuery(entities, connection) {
    let whereConditions = [];
    let params = [];

    // 构建WHERE条件
    if (entities.supplier) {
      whereConditions.push('supplier_name = ?');
      params.push(entities.supplier);
    }

    if (entities.material) {
      whereConditions.push('material_name LIKE ?');
      params.push(`%${entities.material}%`);
    }

    if (entities.project) {
      whereConditions.push('project = ?');
      params.push(entities.project);
    }

    if (entities.baseline) {
      whereConditions.push('baseline = ?');
      params.push(entities.baseline);
    }

    if (entities.testResult) {
      whereConditions.push('test_result = ?');
      params.push(entities.testResult);
    }

    const whereClause = whereConditions.length > 0 ?
      `WHERE ${whereConditions.join(' AND ')}` : '';

    const sql = `
      SELECT
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
      ${whereClause}
      ORDER BY test_date DESC
    `;

    console.log('🔍 执行测试查询SQL:', sql);
    console.log('📝 查询参数:', params);

    const [results] = await connection.execute(sql, params);

    return {
      data: results,
      answer: this.generateTestingAnswer(entities, results.length),
      type: 'testing_query',
      template: 'intelligent_testing'
    };
  }
  /**
   * 生成库存查询回答
   */
  generateInventoryAnswer(entities, resultCount) {
    let answer = '📊 **库存查询结果**\n\n';

    if (resultCount > 0) {
      answer += `✅ 找到 ${resultCount} 条符合条件的库存记录。\n\n`;

      if (Object.keys(entities).length > 0) {
        answer += '🎯 **查询条件：**\n';
        if (entities.supplier) answer += `- 供应商：${entities.supplier}\n`;
        if (entities.material) answer += `- 物料：${entities.material}\n`;
        if (entities.factory) answer += `- 工厂：${entities.factory}\n`;
        if (entities.status) answer += `- 状态：${entities.status}\n`;
        answer += '\n';
      }

      answer += '📋 **详细数据如下表所示：**';
    } else {
      answer += '❌ 未找到符合条件的库存记录。\n\n';
      answer += '💡 **建议：**\n';
      answer += '- 检查查询条件是否正确\n';
      answer += '- 尝试使用更宽泛的搜索条件\n';
      answer += '- 确认数据是否存在于系统中';
    }

    return answer;
  }

  /**
   * 生成生产查询回答
   */
  generateProductionAnswer(entities, resultCount) {
    let answer = '📊 **生产/上线查询结果**\n\n';

    if (resultCount > 0) {
      answer += `✅ 找到 ${resultCount} 条符合条件的生产记录。\n\n`;

      if (Object.keys(entities).length > 0) {
        answer += '🎯 **查询条件：**\n';
        if (entities.supplier) answer += `- 供应商：${entities.supplier}\n`;
        if (entities.material) answer += `- 物料：${entities.material}\n`;
        if (entities.factory) answer += `- 工厂：${entities.factory}\n`;
        if (entities.project) answer += `- 项目：${entities.project}\n`;
        if (entities.baseline) answer += `- 基线：${entities.baseline}\n`;
        answer += '\n';
      }

      answer += '📋 **详细数据如下表所示：**';
    } else {
      answer += '❌ 未找到符合条件的生产记录。\n\n';
      answer += '💡 **建议：**\n';
      answer += '- 检查查询条件是否正确\n';
      answer += '- 尝试使用更宽泛的搜索条件\n';
      answer += '- 确认数据是否存在于系统中';
    }

    return answer;
  }
  /**
   * 生成测试查询回答
   */
  generateTestingAnswer(entities, resultCount) {
    let answer = '📊 **测试查询结果**\n\n';

    if (resultCount > 0) {
      answer += `✅ 找到 ${resultCount} 条符合条件的测试记录。\n\n`;

      if (Object.keys(entities).length > 0) {
        answer += '🎯 **查询条件：**\n';
        if (entities.supplier) answer += `- 供应商：${entities.supplier}\n`;
        if (entities.material) answer += `- 物料：${entities.material}\n`;
        if (entities.project) answer += `- 项目：${entities.project}\n`;
        if (entities.baseline) answer += `- 基线：${entities.baseline}\n`;
        if (entities.testResult) answer += `- 测试结果：${entities.testResult}\n`;
        answer += '\n';
      }

      answer += '📋 **详细数据如下表所示：**';
    } else {
      answer += '❌ 未找到符合条件的测试记录。\n\n';
      answer += '💡 **建议：**\n';
      answer += '- 检查查询条件是否正确\n';
      answer += '- 尝试使用更宽泛的搜索条件\n';
      answer += '- 确认数据是否存在于系统中';
    }

    return answer;
  }

  /**
   * 生成无数据回答
   */
  generateNoDataResponse(intentAnalysis) {
    let answer = '❌ **未找到符合条件的数据**\n\n';

    if (intentAnalysis.conditions.length > 0) {
      answer += '🎯 **您的查询条件：**\n';
      intentAnalysis.conditions.forEach(condition => {
        answer += `- ${condition}\n`;
      });
      answer += '\n';
    }

    answer += '💡 **建议：**\n';
    answer += '- 检查查询条件是否正确\n';
    answer += '- 尝试使用更宽泛的搜索条件\n';
    answer += '- 确认数据是否存在于系统中\n';
    answer += '- 可以尝试查询其他相关信息';

    return answer;
  }
}

export default SimpleRuleBasedQA;
