import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import ChartGenerationService from './chartGenerationService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const realDataDict = JSON.parse(readFileSync(join(__dirname, '../config/realDataDictionary.json'), 'utf8'));

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection',
  charset: 'utf8mb4'
};

/**
 * 智能问答系统 - 基于真实数据和规则模板
 */
class IntelligentQASystem {
  constructor() {
    this.connection = null;
    this.dataDict = realDataDict;
    this.chartService = new ChartGenerationService();
    
    // 问题类型识别模式
    this.questionPatterns = {
      // 供应商相关查询
      supplier_query: {
        keywords: ['供应商', '厂商', '厂家'],
        entities: this.dataDict.suppliers,
        templates: ['supplier_inventory', 'supplier_testing', 'supplier_overview']
      },
      
      // 物料相关查询
      material_query: {
        keywords: ['物料', '材料', '零件', '产品'],
        entities: this.dataDict.materials,
        templates: ['material_inventory', 'material_suppliers', 'material_testing']
      },
      
      // 工厂相关查询
      factory_query: {
        keywords: ['工厂', '厂区', '生产基地'],
        entities: this.dataDict.factories,
        templates: ['factory_inventory', 'factory_overview']
      },
      
      // 状态相关查询
      status_query: {
        keywords: ['状态', '风险', '异常', '正常', '冻结'],
        entities: this.dataDict.statuses,
        templates: ['status_analysis', 'risk_analysis']
      },
      
      // 统计分析查询
      analysis_query: {
        keywords: ['统计', '分析', '总结', '排行', '对比'],
        entities: [],
        templates: ['comprehensive_analysis', 'ranking_analysis']
      },

      // 时间范围查询
      time_query: {
        keywords: ['最近', '本周', '本月', '今天', '昨天', '趋势'],
        entities: [],
        templates: ['time_analysis', 'trend_analysis']
      },

      // 质量相关查询
      quality_query: {
        keywords: ['质量', '测试', '通过率', '不良率', '缺陷'],
        entities: [],
        templates: ['quality_analysis', 'defect_analysis']
      },

      // 对比查询
      comparison_query: {
        keywords: ['对比', '比较', '差异', 'vs', '和'],
        entities: [],
        templates: ['comparison_analysis']
      }
    };
  }

  async getConnection() {
    if (!this.connection) {
      this.connection = await mysql.createConnection(dbConfig);
    }
    return this.connection;
  }

  /**
   * 处理用户问题
   */
  async processQuestion(question) {
    console.log(`🤖 智能问答处理: "${question}"`);
    
    try {
      // 1. 问题分析
      const analysis = this.analyzeQuestion(question);
      console.log('📊 问题分析结果:', analysis);
      
      // 2. 选择答题模板
      const template = this.selectTemplate(analysis);
      console.log('📋 选择模板:', template);
      
      // 3. 执行查询
      const data = await this.executeQuery(template, analysis);

      // 4. 生成图表（如果适用）
      const charts = await this.generateCharts(template, analysis, data);

      // 5. 生成回答
      const responseData = this.generateResponse(template, data, analysis);

      return {
        success: true,
        data: {
          question: question,
          analysis: analysis,
          template: template,
          data: responseData.tableData || data, // 返回表格数据
          charts: charts,
          response: responseData.text || responseData, // 文本回复
          answer: responseData.text || responseData, // 兼容前端
          tableData: responseData.tableData, // 表格数据
          summary: responseData.summary, // 汇总信息
          keyMetrics: responseData.keyMetrics, // 关键指标
          metadata: {
            dataSource: 'real_database',
            timestamp: new Date().toISOString(),
            processingTime: null
          }
        }
      };
      
    } catch (error) {
      console.error('❌ 问答处理失败:', error);
      return {
        success: false,
        error: error.message,
        response: `抱歉，处理问题"${question}"时发生错误。`
      };
    }
  }

  /**
   * 分析问题类型和实体
   */
  analyzeQuestion(question) {
    console.log(`🔍 开始分析问题: ${question}`);

    const analysis = {
      type: 'general',
      entities: {},
      intent: 'query',
      confidence: 0.5
    };

    const questionLower = question.toLowerCase();

    // 检查questionPatterns是否存在
    if (!this.questionPatterns) {
      console.error('❌ questionPatterns未定义');
      return analysis;
    }

    console.log(`📊 questionPatterns键数量: ${Object.keys(this.questionPatterns).length}`);

    // 识别问题类型
    for (const [type, pattern] of Object.entries(this.questionPatterns)) {
      if (!pattern || !pattern.keywords) {
        console.warn(`⚠️ 模式 ${type} 缺少keywords`);
        continue;
      }

      if (pattern.keywords.some(keyword => questionLower.includes(keyword))) {
        analysis.type = type;
        analysis.confidence = 0.8;
        console.log(`✅ 匹配到类型: ${type}`);
        break;
      }
    }
    
    // 提取实体
    this.extractEntities(question, analysis);
    
    // 增强的意图识别
    analysis.intent = this.detectAdvancedIntent(questionLower, analysis);

    // 增强的场景识别
    analysis.scenario = this.detectScenario(questionLower, analysis);

    // 数据展示偏好识别
    analysis.displayPreference = this.detectDisplayPreference(questionLower);

    console.log(`🎯 分析结果: 类型=${analysis.type}, 意图=${analysis.intent}, 场景=${analysis.scenario}, 展示偏好=${analysis.displayPreference}`);

    return analysis;
  }

  /**
   * 增强的意图识别
   */
  detectAdvancedIntent(questionLower, analysis) {
    // 列表查询意图
    if (questionLower.includes('有哪些') || questionLower.includes('多少') ||
        questionLower.includes('列表') || questionLower.includes('清单')) {
      return 'list';
    }

    // 状态查询意图
    if (questionLower.includes('情况') || questionLower.includes('状态') ||
        questionLower.includes('概况') || questionLower.includes('概览')) {
      return 'status';
    }

    // 分析意图
    if (questionLower.includes('分析') || questionLower.includes('统计') ||
        questionLower.includes('趋势') || questionLower.includes('对比')) {
      return 'analysis';
    }

    // 详细查询意图
    if (questionLower.includes('详细') || questionLower.includes('具体') ||
        questionLower.includes('详情') || questionLower.includes('信息')) {
      return 'detail';
    }

    // 排行榜意图
    if (questionLower.includes('top') || questionLower.includes('排行') ||
        questionLower.includes('排名') || questionLower.includes('最')) {
      return 'ranking';
    }

    return 'query';
  }

  /**
   * 场景识别
   */
  detectScenario(questionLower, analysis) {
    // 库存场景
    if (questionLower.includes('库存') || questionLower.includes('入库') ||
        questionLower.includes('仓库') || questionLower.includes('存储')) {
      return 'inventory';
    }

    // 质量测试场景
    if (questionLower.includes('测试') || questionLower.includes('检测') ||
        questionLower.includes('质量') || questionLower.includes('合格')) {
      return 'quality';
    }

    // 生产上线场景
    if (questionLower.includes('上线') || questionLower.includes('生产') ||
        questionLower.includes('产线') || questionLower.includes('工厂')) {
      return 'production';
    }

    // 批次管理场景
    if (questionLower.includes('批次') || questionLower.includes('批号') ||
        questionLower.includes('追溯') || questionLower.includes('跟踪')) {
      return 'batch';
    }

    // 供应商场景
    if (analysis.entities.supplier || questionLower.includes('供应商') ||
        questionLower.includes('厂商') || questionLower.includes('厂家')) {
      return 'supplier';
    }

    // 物料场景
    if (analysis.entities.material || questionLower.includes('物料') ||
        questionLower.includes('材料') || questionLower.includes('零件')) {
      return 'material';
    }

    return 'general';
  }

  /**
   * 数据展示偏好识别
   */
  detectDisplayPreference(questionLower) {
    // 表格展示偏好
    if (questionLower.includes('表格') || questionLower.includes('列表') ||
        questionLower.includes('详细记录') || questionLower.includes('明细')) {
      return 'table';
    }

    // 图表展示偏好
    if (questionLower.includes('图表') || questionLower.includes('图形') ||
        questionLower.includes('可视化') || questionLower.includes('趋势图')) {
      return 'chart';
    }

    // 统计展示偏好
    if (questionLower.includes('统计') || questionLower.includes('汇总') ||
        questionLower.includes('概要') || questionLower.includes('总结')) {
      return 'summary';
    }

    // 对比展示偏好
    if (questionLower.includes('对比') || questionLower.includes('比较') ||
        questionLower.includes('差异') || questionLower.includes('排行')) {
      return 'comparison';
    }

    return 'auto';
  }

  /**
   * 提取实体信息
   */
  extractEntities(question, analysis) {
    const questionLower = question.toLowerCase();
    
    // 提取供应商
    for (const supplier of this.dataDict.suppliers) {
      if (questionLower.includes(supplier.toLowerCase())) {
        analysis.entities.supplier = supplier;
        break;
      }
    }
    
    // 提取物料（按长度排序，优先匹配长词）
    const sortedMaterials = this.dataDict.materials.sort((a, b) => b.length - a.length);
    for (const material of sortedMaterials) {
      if (questionLower.includes(material.toLowerCase())) {
        analysis.entities.material = material;
        break;
      }
    }
    
    // 提取工厂
    for (const factory of this.dataDict.factories) {
      if (questionLower.includes(factory.toLowerCase())) {
        analysis.entities.factory = factory;
        break;
      }
    }
    
    // 提取状态
    for (const status of this.dataDict.statuses) {
      if (questionLower.includes(status.toLowerCase())) {
        analysis.entities.status = status;
        break;
      }
    }
  }

  /**
   * 选择答题模板
   */
  selectTemplate(analysis) {
    console.log(`🔍 选择模板，分析结果:`, JSON.stringify(analysis, null, 2));

    if (!analysis) {
      console.error('❌ analysis对象为undefined');
      return 'general_response';
    }

    if (!analysis.entities) {
      console.error('❌ analysis.entities为undefined');
      analysis.entities = {};
    }

    if (!analysis.type) {
      console.error('❌ analysis.type为undefined');
      analysis.type = 'general';
    }

    // 智能模板选择逻辑
    return this.selectSmartTemplate(analysis);
  }

  /**
   * 智能模板选择
   */
  selectSmartTemplate(analysis) {
    console.log(`🎯 智能模板选择，分析结果:`, analysis);

    // 1. 基于场景的模板选择
    const scenarioTemplate = this.selectTemplateByScenario(analysis);
    if (scenarioTemplate) {
      console.log(`📋 基于场景选择模板: ${scenarioTemplate}`);
      return scenarioTemplate;
    }

    // 2. 基于实体的模板选择
    const entityTemplate = this.selectTemplateByEntity(analysis);
    if (entityTemplate) {
      console.log(`🏷️ 基于实体选择模板: ${entityTemplate}`);
      return entityTemplate;
    }

    // 3. 基于意图的模板选择
    const intentTemplate = this.selectTemplateByIntent(analysis);
    if (intentTemplate) {
      console.log(`💭 基于意图选择模板: ${intentTemplate}`);
      return intentTemplate;
    }

    // 4. 默认模板
    console.log(`📄 使用默认模板: general_overview`);
    return 'general_overview';
  }

  /**
   * 基于场景选择模板
   */
  selectTemplateByScenario(analysis) {
    const { scenario, intent, displayPreference, entities } = analysis;

    switch (scenario) {
      case 'inventory':
        if (entities.supplier) return 'supplier_inventory_detail';
        if (entities.material) return 'material_inventory_detail';
        if (entities.status) return 'inventory_status_analysis';
        if (intent === 'ranking') return 'inventory_ranking';
        if (displayPreference === 'summary') return 'inventory_summary';
        return 'inventory_overview';

      case 'quality':
        if (entities.supplier) return 'supplier_quality_analysis';
        if (entities.material) return 'material_quality_analysis';
        if (intent === 'ranking') return 'quality_ranking';
        if (displayPreference === 'chart') return 'quality_trend_chart';
        return 'quality_analysis';

      case 'production':
        if (entities.supplier) return 'supplier_production_analysis';
        if (entities.material) return 'material_production_analysis';
        if (intent === 'ranking') return 'production_ranking';
        if (displayPreference === 'chart') return 'production_trend_chart';
        return 'production_overview';

      case 'batch':
        if (intent === 'detail') return 'batch_comprehensive_trace';
        if (displayPreference === 'table') return 'batch_detail_table';
        return 'batch_overview';

      case 'supplier':
        if (intent === 'list') return 'supplier_materials_list';
        if (intent === 'analysis') return 'supplier_comprehensive_analysis';
        if (displayPreference === 'comparison') return 'supplier_comparison';
        return 'supplier_comprehensive';

      case 'material':
        if (intent === 'list') return 'material_suppliers_list';
        if (intent === 'analysis') return 'material_comprehensive_analysis';
        if (displayPreference === 'comparison') return 'material_comparison';
        return 'material_comprehensive';
    }

    return null;
  }

  /**
   * 基于实体选择模板
   */
  selectTemplateByEntity(analysis) {
    const { entities, intent, displayPreference } = analysis;

    if (entities.supplier) {
      if (intent === 'list') return 'supplier_materials_list';
      if (intent === 'status') return 'supplier_status_overview';
      if (displayPreference === 'chart') return 'supplier_chart_analysis';
      return 'supplier_comprehensive';
    }

    if (entities.material) {
      if (intent === 'list') return 'material_suppliers_list';
      if (intent === 'detail') return 'material_detail_analysis';
      if (displayPreference === 'chart') return 'material_chart_analysis';
      return 'material_comprehensive';
    }

    if (entities.factory) {
      if (displayPreference === 'summary') return 'factory_summary';
      return 'factory_overview';
    }

    if (entities.status) {
      if (displayPreference === 'table') return 'status_detail_table';
      return 'status_analysis';
    }

    return null;
  }

  /**
   * 基于意图选择模板
   */
  selectTemplateByIntent(analysis) {
    const { intent, type, displayPreference } = analysis;

    switch (intent) {
      case 'analysis':
        if (type === 'quality_query') return 'quality_analysis';
        if (type === 'comparison_query') return 'comparison_analysis';
        if (displayPreference === 'chart') return 'trend_analysis_chart';
        return 'comprehensive_analysis';

      case 'ranking':
        if (displayPreference === 'chart') return 'ranking_chart';
        return 'ranking_analysis';

      case 'list':
        if (displayPreference === 'table') return 'detailed_list_table';
        return 'simple_list';

      case 'status':
        if (displayPreference === 'summary') return 'status_summary';
        return 'status_overview';

      case 'detail':
        if (displayPreference === 'table') return 'comprehensive_detail_table';
        return 'detailed_analysis';
    }

    // 基于问题类型的回退选择
    if (type === 'time_query') return 'time_analysis';
    if (type === 'comparison_query') return 'comparison_analysis';

    return null;
  }

  /**
   * 执行数据查询
   */
  async executeQuery(template, analysis) {
    const connection = await this.getConnection();
    
    switch (template) {
      case 'supplier_materials_list':
        return await this.querySupplierMaterials(connection, analysis.entities.supplier);
      
      case 'supplier_comprehensive':
        return await this.querySupplierComprehensive(connection, analysis.entities.supplier);
      
      case 'material_suppliers_list':
        return await this.queryMaterialSuppliers(connection, analysis.entities.material);
      
      case 'material_comprehensive':
        return await this.queryMaterialComprehensive(connection, analysis.entities.material);
      
      case 'factory_overview':
        return await this.queryFactoryOverview(connection, analysis.entities.factory);
      
      case 'status_analysis':
        return await this.queryStatusAnalysis(connection, analysis.entities.status);
      
      case 'comprehensive_analysis':
        return await this.queryComprehensiveAnalysis(connection);

      case 'quality_analysis':
        return await this.queryQualityAnalysis(connection, analysis.entities);

      case 'time_analysis':
        return await this.queryTimeAnalysis(connection, analysis.entities);

      case 'comparison_analysis':
        return await this.queryComparisonAnalysis(connection, analysis.entities);

      default:
        return await this.queryGeneralOverview(connection);
    }
  }

  /**
   * 查询供应商的物料列表
   */
  async querySupplierMaterials(connection, supplier) {
    const sql = `
      SELECT 
        material_name as 物料名称,
        COUNT(*) as 批次数量,
        SUM(quantity) as 总数量,
        AVG(quantity) as 平均数量,
        GROUP_CONCAT(DISTINCT status) as 状态分布,
        GROUP_CONCAT(DISTINCT storage_location) as 工厂分布
      FROM inventory 
      WHERE supplier_name = ?
      GROUP BY material_name
      ORDER BY 总数量 DESC
    `;
    
    const [results] = await connection.execute(sql, [supplier]);
    return results;
  }

  /**
   * 查询供应商综合信息
   */
  async querySupplierComprehensive(connection, supplier) {
    console.log(`🔍 查询供应商综合信息: ${supplier}`);

    try {
      // 库存信息
      const [inventory] = await connection.execute(`
        SELECT COUNT(*) as 批次数, SUM(quantity) as 总数量,
               COUNT(DISTINCT material_name) as 物料种类,
               COUNT(CASE WHEN status = '风险' THEN 1 END) as 风险批次
        FROM inventory WHERE supplier_name = ?
      `, [supplier]);

      console.log('📦 库存查询结果:', inventory[0]);

      // 测试信息
      const [testing] = await connection.execute(`
        SELECT COUNT(*) as 测试总数,
               SUM(CASE WHEN test_result = 'PASS' THEN 1 ELSE 0 END) as 通过数,
               SUM(CASE WHEN test_result = 'FAIL' THEN 1 ELSE 0 END) as 失败数
        FROM lab_tests WHERE supplier_name = ?
      `, [supplier]);

      console.log('🧪 测试查询结果:', testing[0]);

      // 上线信息
      const [online] = await connection.execute(`
        SELECT COUNT(*) as 上线批次, AVG(defect_rate) as 平均不良率
        FROM online_tracking WHERE supplier_name = ?
      `, [supplier]);

      console.log('🏭 上线查询结果:', online[0]);

      // 详细记录
      const [details] = await connection.execute(`
        SELECT material_name, quantity, status, storage_location, batch_code
        FROM inventory WHERE supplier_name = ?
        ORDER BY quantity DESC
        LIMIT 10
      `, [supplier]);

      console.log(`📋 详细记录: ${details.length} 条`);

      const result = {
        inventory: inventory[0],
        testing: testing[0],
        online: online[0],
        details: details
      };

      console.log('✅ 查询完成，返回数据:', JSON.stringify(result, null, 2));
      return result;

    } catch (error) {
      console.error('❌ 查询供应商综合信息失败:', error);
      throw error;
    }
  }

  /**
   * 查询物料的供应商列表
   */
  async queryMaterialSuppliers(connection, material) {
    const sql = `
      SELECT
        supplier_name as 供应商名称,
        COUNT(*) as 批次数量,
        SUM(quantity) as 总数量,
        AVG(quantity) as 平均数量,
        GROUP_CONCAT(DISTINCT status) as 状态分布,
        GROUP_CONCAT(DISTINCT storage_location) as 工厂分布
      FROM inventory
      WHERE material_name = ?
      GROUP BY supplier_name
      ORDER BY 总数量 DESC
    `;

    const [results] = await connection.execute(sql, [material]);
    return results;
  }

  /**
   * 查询物料综合信息
   */
  async queryMaterialComprehensive(connection, material) {
    console.log(`🔍 查询物料综合信息: ${material}`);

    try {
      // 库存信息
      const [inventory] = await connection.execute(`
        SELECT COUNT(*) as 批次数, SUM(quantity) as 总数量,
               COUNT(DISTINCT supplier_name) as 供应商数量,
               COUNT(CASE WHEN status = '风险' THEN 1 END) as 风险批次
        FROM inventory WHERE material_name = ?
      `, [material]);

      console.log('📦 库存查询结果:', inventory[0]);

      // 测试信息
      const [testing] = await connection.execute(`
        SELECT COUNT(*) as 测试总数,
               SUM(CASE WHEN test_result = 'PASS' THEN 1 ELSE 0 END) as 通过数,
               SUM(CASE WHEN test_result = 'FAIL' THEN 1 ELSE 0 END) as 失败数
        FROM lab_tests WHERE material_name = ?
      `, [material]);

      console.log('🧪 测试查询结果:', testing[0]);

      // 详细记录
      const [details] = await connection.execute(`
        SELECT material_name, supplier_name, quantity, status, storage_location, batch_code
        FROM inventory WHERE material_name = ?
        ORDER BY quantity DESC
        LIMIT 10
      `, [material]);

      console.log(`📋 详细记录: ${details.length} 条`);

      const result = {
        inventory: inventory[0],
        testing: testing[0],
        details: details
      };

      console.log('✅ 查询完成，返回数据:', JSON.stringify(result, null, 2));
      return result;

    } catch (error) {
      console.error('❌ 查询物料综合信息失败:', error);
      throw error;
    }
  }

  /**
   * 查询工厂概览
   */
  async queryFactoryOverview(connection, factory) {
    const sql = `
      SELECT
        material_name as 物料名称,
        supplier_name as 供应商,
        COUNT(*) as 批次数量,
        SUM(quantity) as 总数量,
        GROUP_CONCAT(DISTINCT status) as 状态分布
      FROM inventory
      WHERE storage_location = ?
      GROUP BY material_name, supplier_name
      ORDER BY 总数量 DESC
    `;

    const [results] = await connection.execute(sql, [factory]);
    return results;
  }

  /**
   * 查询状态分析
   */
  async queryStatusAnalysis(connection, status) {
    const sql = `
      SELECT
        material_name as 物料名称,
        supplier_name as 供应商,
        storage_location as 工厂,
        quantity as 数量,
        DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间
      FROM inventory
      WHERE status = ?
      ORDER BY quantity DESC
      LIMIT 20
    `;

    const [results] = await connection.execute(sql, [status]);
    return results;
  }

  /**
   * 查询综合分析
   */
  async queryComprehensiveAnalysis(connection) {
    // 供应商排行
    const [suppliers] = await connection.execute(`
      SELECT supplier_name, COUNT(*) as 批次数, SUM(quantity) as 总数量
      FROM inventory GROUP BY supplier_name ORDER BY 总数量 DESC LIMIT 10
    `);

    // 物料排行
    const [materials] = await connection.execute(`
      SELECT material_name, COUNT(*) as 批次数, SUM(quantity) as 总数量
      FROM inventory GROUP BY material_name ORDER BY 总数量 DESC LIMIT 10
    `);

    return { suppliers, materials };
  }

  /**
   * 查询一般概览
   */
  async queryGeneralOverview(connection) {
    const [overview] = await connection.execute(`
      SELECT
        COUNT(*) as 总批次数,
        SUM(quantity) as 总数量,
        COUNT(DISTINCT supplier_name) as 供应商数量,
        COUNT(DISTINCT material_name) as 物料种类,
        COUNT(DISTINCT storage_location) as 工厂数量
      FROM inventory
    `);

    return overview[0];
  }

  /**
   * 查询质量分析
   */
  async queryQualityAnalysis(connection, entities) {
    // 整体质量概览
    const [qualityOverview] = await connection.execute(`
      SELECT
        COUNT(*) as 总测试数,
        SUM(CASE WHEN test_result = 'PASS' THEN 1 ELSE 0 END) as 通过数,
        ROUND(SUM(CASE WHEN test_result = 'PASS' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 通过率,
        COUNT(DISTINCT supplier_name) as 测试供应商数,
        COUNT(DISTINCT material_name) as 测试物料数
      FROM lab_tests
    `);

    // 缺陷分析
    const [defectAnalysis] = await connection.execute(`
      SELECT
        defect_desc as 缺陷类型,
        COUNT(*) as 出现次数,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM lab_tests WHERE test_result = 'FAIL'), 2) as 占比
      FROM lab_tests
      WHERE test_result = 'FAIL' AND defect_desc IS NOT NULL AND defect_desc != ''
      GROUP BY defect_desc
      ORDER BY 出现次数 DESC
      LIMIT 5
    `);

    // 供应商质量排行
    const [supplierQuality] = await connection.execute(`
      SELECT
        supplier_name as 供应商,
        COUNT(*) as 测试数,
        ROUND(SUM(CASE WHEN test_result = 'PASS' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 通过率
      FROM lab_tests
      GROUP BY supplier_name
      HAVING 测试数 >= 5
      ORDER BY 通过率 DESC, 测试数 DESC
      LIMIT 10
    `);

    return {
      overview: qualityOverview[0],
      defects: defectAnalysis,
      suppliers: supplierQuality
    };
  }

  /**
   * 查询时间分析
   */
  async queryTimeAnalysis(connection, entities) {
    // 最近7天的测试趋势
    const [recentTests] = await connection.execute(`
      SELECT
        DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
        COUNT(*) as 测试数,
        SUM(CASE WHEN test_result = 'PASS' THEN 1 ELSE 0 END) as 通过数,
        ROUND(SUM(CASE WHEN test_result = 'PASS' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 通过率
      FROM lab_tests
      WHERE test_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE_FORMAT(test_date, '%Y-%m-%d')
      ORDER BY 日期 DESC
    `);

    // 最近入库情况
    const [recentInventory] = await connection.execute(`
      SELECT
        DATE_FORMAT(inbound_time, '%Y-%m-%d') as 日期,
        COUNT(*) as 入库批次,
        SUM(quantity) as 入库数量,
        COUNT(CASE WHEN status = '风险' THEN 1 END) as 风险批次
      FROM inventory
      WHERE inbound_time >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE_FORMAT(inbound_time, '%Y-%m-%d')
      ORDER BY 日期 DESC
    `);

    return {
      tests: recentTests,
      inventory: recentInventory
    };
  }

  /**
   * 查询对比分析
   */
  async queryComparisonAnalysis(connection, entities) {
    // 如果有两个供应商，进行供应商对比
    if (entities.supplier) {
      // 这里可以扩展为多供应商对比
      const [comparison] = await connection.execute(`
        SELECT
          supplier_name as 供应商,
          COUNT(DISTINCT material_name) as 物料种类,
          COUNT(*) as 库存批次,
          SUM(quantity) as 总数量,
          COUNT(CASE WHEN status = '风险' THEN 1 END) as 风险批次,
          ROUND(COUNT(CASE WHEN status = '风险' THEN 1 END) * 100.0 / COUNT(*), 2) as 风险率
        FROM inventory
        WHERE supplier_name IN (?, '聚龙', '欣冠', '广正')
        GROUP BY supplier_name
        ORDER BY 总数量 DESC
      `, [entities.supplier]);

      return { type: 'supplier_comparison', data: comparison };
    }

    // 默认返回工厂对比
    const [factoryComparison] = await connection.execute(`
      SELECT
        storage_location as 工厂,
        COUNT(DISTINCT supplier_name) as 供应商数,
        COUNT(DISTINCT material_name) as 物料种类,
        COUNT(*) as 库存批次,
        SUM(quantity) as 总数量
      FROM inventory
      GROUP BY storage_location
      ORDER BY 总数量 DESC
    `);

    return { type: 'factory_comparison', data: factoryComparison };
  }

  /**
   * 生成图表
   */
  async generateCharts(template, analysis, data) {
    const charts = [];

    try {
      switch (template) {
        case 'supplier_materials_list':
          if (analysis.entities.supplier) {
            const pieChart = await this.chartService.generateSupplierMaterialsPieChart(analysis.entities.supplier);
            charts.push(pieChart);
          }
          break;

        case 'material_suppliers_list':
          if (analysis.entities.material) {
            const barChart = await this.chartService.generateMaterialSuppliersBarChart(analysis.entities.material);
            charts.push(barChart);
          }
          break;

        case 'factory_overview':
          if (analysis.entities.factory) {
            const stackedChart = await this.chartService.generateFactoryInventoryStackedChart(analysis.entities.factory);
            charts.push(stackedChart);
          }
          break;

        case 'supplier_comprehensive':
          if (analysis.entities.supplier) {
            const trendChart = await this.chartService.generateTestPassRateTrendChart(analysis.entities.supplier);
            charts.push(trendChart);
          }
          break;

        case 'material_comprehensive':
          if (analysis.entities.material) {
            const trendChart = await this.chartService.generateTestPassRateTrendChart(null, analysis.entities.material);
            charts.push(trendChart);
          }
          break;

        default:
          // 对于其他模板，不生成图表
          break;
      }
    } catch (error) {
      console.error('图表生成失败:', error);
      // 图表生成失败不影响主要功能
    }

    return charts;
  }

  /**
   * 生成回答
   */
  generateResponse(template, data, analysis) {
    console.log(`📝 生成回答，模板: ${template}`);

    // 使用智能响应生成器
    return this.generateSmartResponse(template, data, analysis);
  }

  /**
   * 智能响应生成器
   */
  generateSmartResponse(template, data, analysis) {
    // 1. 尝试使用专用格式化器
    const specificFormatter = this.getSpecificFormatter(template);
    if (specificFormatter) {
      return specificFormatter.call(this, data, analysis);
    }

    // 2. 使用通用格式化器
    return this.formatWithTemplate(template, data, analysis);
  }

  /**
   * 获取专用格式化器
   */
  getSpecificFormatter(template) {
    const formatters = {
      // 原有的格式化器
      'supplier_materials_list': (data, analysis) => this.formatSupplierMaterialsList(data, analysis.entities.supplier),
      'supplier_comprehensive': (data, analysis) => this.formatSupplierComprehensive(data, analysis.entities.supplier),
      'material_suppliers_list': (data, analysis) => this.formatMaterialSuppliersList(data, analysis.entities.material),
      'material_comprehensive': (data, analysis) => this.formatMaterialComprehensive(data, analysis.entities.material),
      'factory_overview': (data, analysis) => this.formatFactoryOverview(data, analysis.entities.factory),
      'status_analysis': (data, analysis) => this.formatStatusAnalysis(data, analysis.entities.status),
      'comprehensive_analysis': (data, analysis) => this.formatComprehensiveAnalysis(data),
      'quality_analysis': (data, analysis) => this.formatQualityAnalysis(data),
      'time_analysis': (data, analysis) => this.formatTimeAnalysis(data),
      'comparison_analysis': (data, analysis) => this.formatComparisonAnalysis(data),

      // 新增的专用格式化器
      'inventory_overview': (data, analysis) => this.formatInventoryOverview(data, analysis),
      'inventory_summary': (data, analysis) => this.formatInventorySummary(data, analysis),
      'inventory_ranking': (data, analysis) => this.formatInventoryRanking(data, analysis),
      'quality_ranking': (data, analysis) => this.formatQualityRanking(data, analysis),
      'production_overview': (data, analysis) => this.formatProductionOverview(data, analysis),
      'batch_overview': (data, analysis) => this.formatBatchOverview(data, analysis),
      'supplier_comparison': (data, analysis) => this.formatSupplierComparison(data, analysis),
      'material_comparison': (data, analysis) => this.formatMaterialComparison(data, analysis)
    };

    return formatters[template];
  }

  /**
   * 通用模板格式化器
   */
  formatWithTemplate(template, data, analysis) {
    console.log(`🎨 使用通用格式化器，模板: ${template}`);

    // 根据模板类型和展示偏好生成响应
    const { displayPreference, scenario, intent } = analysis;

    // 基础响应结构
    const response = {
      text: '',
      tableData: [],
      summary: '',
      keyMetrics: [],
      chartData: null
    };

    // 根据展示偏好调整格式
    switch (displayPreference) {
      case 'table':
        return this.formatAsTable(data, analysis, template);
      case 'chart':
        return this.formatAsChart(data, analysis, template);
      case 'summary':
        return this.formatAsSummary(data, analysis, template);
      case 'comparison':
        return this.formatAsComparison(data, analysis, template);
      default:
        return this.formatAsAuto(data, analysis, template);
    }
  }

  /**
   * 表格格式化
   */
  formatAsTable(data, analysis, template) {
    console.log(`📊 表格格式化，模板: ${template}`);

    if (!data || data.length === 0) {
      return {
        text: '📋 **详细数据表格**\n\n暂无相关数据记录。',
        tableData: [],
        summary: '暂无数据',
        keyMetrics: []
      };
    }

    return {
      text: `📋 **详细数据表格** (共${data.length}条记录)\n\n以下是详细的数据记录：`,
      tableData: Array.isArray(data) ? data : [],
      summary: `共找到${data.length}条记录`,
      keyMetrics: [
        { name: '记录总数', value: data.length, unit: '条', trend: 'info' }
      ]
    };
  }

  /**
   * 图表格式化
   */
  formatAsChart(data, analysis, template) {
    console.log(`📈 图表格式化，模板: ${template}`);

    return {
      text: `📈 **数据可视化分析**\n\n已为您生成相关图表，请查看图表区域。`,
      tableData: [],
      summary: '数据已可视化展示',
      keyMetrics: [],
      chartData: data
    };
  }

  /**
   * 摘要格式化
   */
  formatAsSummary(data, analysis, template) {
    console.log(`📝 摘要格式化，模板: ${template}`);

    if (!data || data.length === 0) {
      return {
        text: '📊 **数据摘要**\n\n暂无相关数据。',
        tableData: [],
        summary: '暂无数据',
        keyMetrics: []
      };
    }

    const count = Array.isArray(data) ? data.length : 0;

    return {
      text: `📊 **数据摘要**\n\n共找到 ${count} 条相关记录。`,
      tableData: [],
      summary: `数据总数: ${count}`,
      keyMetrics: [
        { name: '数据总数', value: count, unit: '条', trend: 'info' }
      ]
    };
  }

  /**
   * 对比格式化
   */
  formatAsComparison(data, analysis, template) {
    console.log(`⚖️ 对比格式化，模板: ${template}`);

    return {
      text: `⚖️ **对比分析**\n\n已为您生成对比分析结果。`,
      tableData: Array.isArray(data) ? data : [],
      summary: '对比分析完成',
      keyMetrics: []
    };
  }

  /**
   * 自动格式化
   */
  formatAsAuto(data, analysis, template) {
    console.log(`🤖 自动格式化，模板: ${template}`);

    // 根据数据量和类型自动选择最佳展示方式
    if (!data || data.length === 0) {
      return {
        text: '暂无相关数据。',
        tableData: [],
        summary: '暂无数据',
        keyMetrics: []
      };
    }

    if (data.length <= 10) {
      return this.formatAsTable(data, analysis, template);
    } else {
      return this.formatAsSummary(data, analysis, template);
    }
  }

  /**
   * 格式化供应商物料列表回答
   */
  formatSupplierMaterialsList(data, supplier) {
    if (!data || data.length === 0) {
      return {
        text: `未找到供应商"${supplier}"的物料信息。`,
        tableData: [],
        summary: `未找到供应商"${supplier}"的物料信息`,
        keyMetrics: []
      };
    }

    let response = `📊 **${supplier}供应商物料清单** (共${data.length}种物料)：\n\n`;

    // 构建表格数据
    const tableData = data.map(item => ({
      物料名称: item.物料名称,
      批次数量: item.批次数量,
      总数量: item.总数量,
      平均数量: Math.round(item.平均数量),
      状态分布: item.状态分布,
      工厂分布: item.工厂分布
    }));

    // 添加统计摘要
    const totalQuantity = data.reduce((sum, item) => sum + item.总数量, 0);
    const totalBatches = data.reduce((sum, item) => sum + item.批次数量, 0);

    response += `📋 **详细物料记录如下表所示：**\n\n`;
    response += `📈 **统计摘要**：\n`;
    response += `- 物料种类：${data.length} 种\n`;
    response += `- 总批次数：${totalBatches} 批\n`;
    response += `- 总数量：${totalQuantity} 件\n`;

    // 构建关键指标
    const keyMetrics = [
      { name: '物料种类', value: data.length, unit: '种', trend: 'info' },
      { name: '总批次数', value: totalBatches, unit: '批', trend: 'success' },
      { name: '总数量', value: totalQuantity, unit: '件', trend: 'success' },
      { name: '平均批次量', value: Math.round(totalQuantity / totalBatches), unit: '件/批', trend: 'info' }
    ];

    return {
      text: response,
      tableData: tableData,
      summary: `${supplier}供应商共有${data.length}种物料，总计${totalBatches}批次，${totalQuantity}件`,
      keyMetrics: keyMetrics
    };
  }

  /**
   * 格式化物料供应商列表回答
   */
  formatMaterialSuppliersList(data, material) {
    if (!data || data.length === 0) {
      return {
        text: `未找到物料"${material}"的供应商信息。`,
        tableData: [],
        summary: `未找到物料"${material}"的供应商信息`,
        keyMetrics: []
      };
    }

    let response = `📊 **${material}供应商分布** (共${data.length}家供应商)：\n\n`;

    // 构建表格数据
    const tableData = data.map(item => ({
      供应商名称: item.供应商名称,
      批次数量: item.批次数量,
      总数量: item.总数量,
      平均数量: Math.round(item.平均数量),
      状态分布: item.状态分布,
      工厂分布: item.工厂分布
    }));

    // 计算统计数据
    const totalQuantity = data.reduce((sum, item) => sum + item.总数量, 0);
    const totalBatches = data.reduce((sum, item) => sum + item.批次数量, 0);

    response += `📋 **详细供应商记录如下表所示：**\n\n`;
    response += `📈 **统计摘要**：\n`;
    response += `- 供应商数量：${data.length} 家\n`;
    response += `- 总批次数：${totalBatches} 批\n`;
    response += `- 总数量：${totalQuantity} 件\n`;

    // 构建关键指标
    const keyMetrics = [
      { name: '供应商数量', value: data.length, unit: '家', trend: 'info' },
      { name: '总批次数', value: totalBatches, unit: '批', trend: 'success' },
      { name: '总数量', value: totalQuantity, unit: '件', trend: 'success' },
      { name: '平均批次量', value: Math.round(totalQuantity / totalBatches), unit: '件/批', trend: 'info' }
    ];

    return {
      text: response,
      tableData: tableData,
      summary: `${material}物料共有${data.length}家供应商，总计${totalBatches}批次，${totalQuantity}件`,
      keyMetrics: keyMetrics
    };
  }

  /**
   * 格式化供应商综合信息
   */
  formatSupplierComprehensive(data, supplier) {
    console.log(`🔍 格式化供应商综合信息: ${supplier}`);
    console.log('📊 数据内容:', JSON.stringify(data, null, 2));

    if (!data || !data.inventory) {
      console.log('❌ 数据格式错误或缺失inventory字段');
      return {
        text: `抱歉，未找到供应商"${supplier}"的相关信息。`,
        tableData: [],
        summary: `未找到供应商"${supplier}"的信息`,
        keyMetrics: []
      };
    }

    // 构建文本回复
    let textResponse = `📊 **${supplier}供应商库存详情**\n\n`;
    textResponse += `📦 **汇总统计**：批次数 ${data.inventory.批次数} 批，总数量 ${data.inventory.总数量} 件，物料种类 ${data.inventory.物料种类} 种`;

    if (data.testing && data.testing.测试总数 > 0) {
      const passRate = ((data.testing.通过数 / data.testing.测试总数) * 100).toFixed(1);
      textResponse += `，测试通过率 ${passRate}%`;
    }

    textResponse += `\n\n📋 **详细库存记录如下表所示：**`;

    // 构建表格数据
    const tableData = data.details && data.details.length > 0 ? data.details.map(record => ({
      物料名称: record.material_name || '未知',
      供应商: supplier,
      数量: record.quantity || 0,
      状态: record.status || '正常',
      存储位置: record.storage_location || '未知',
      批次号: record.batch_code || '未知'
    })) : [];

    // 构建关键指标
    const keyMetrics = [
      { name: '批次数', value: data.inventory.批次数, unit: '批', trend: 'info' },
      { name: '总数量', value: data.inventory.总数量, unit: '件', trend: 'success' },
      { name: '物料种类', value: data.inventory.物料种类, unit: '种', trend: 'info' },
      { name: '风险批次', value: data.inventory.风险批次, unit: '批', trend: data.inventory.风险批次 > 0 ? 'warning' : 'success' }
    ];

    if (data.testing && data.testing.测试总数 > 0) {
      const passRate = ((data.testing.通过数 / data.testing.测试总数) * 100).toFixed(1);
      keyMetrics.push(
        { name: '测试总数', value: data.testing.测试总数, unit: '次', trend: 'info' },
        { name: '通过率', value: passRate, unit: '%', trend: passRate >= 90 ? 'success' : passRate >= 80 ? 'warning' : 'danger' }
      );
    }

    if (data.online && data.online.上线批次 > 0) {
      keyMetrics.push(
        { name: '上线批次', value: data.online.上线批次, unit: '批', trend: 'info' },
        { name: '平均不良率', value: (data.online.平均不良率 * 100).toFixed(2), unit: '%', trend: data.online.平均不良率 < 0.05 ? 'success' : 'warning' }
      );
    }

    const result = {
      text: textResponse,
      tableData: tableData,
      summary: `${supplier}供应商共有${data.inventory.批次数}批次，总数量${data.inventory.总数量}件`,
      keyMetrics: keyMetrics
    };

    console.log('✅ 生成的结构化回复:', JSON.stringify(result, null, 2));
    return result;
  }

  /**
   * 格式化物料综合信息
   */
  formatMaterialComprehensive(data, material) {
    console.log(`🔍 格式化物料综合信息: ${material}`);
    console.log('📊 数据内容:', JSON.stringify(data, null, 2));

    if (!data || !data.inventory) {
      console.log('❌ 数据格式错误或缺失inventory字段');
      return {
        text: `抱歉，未找到物料"${material}"的相关信息。`,
        tableData: [],
        summary: `未找到物料"${material}"的信息`,
        keyMetrics: []
      };
    }

    // 构建文本回复
    let textResponse = `📊 **${material}库存详情**\n\n`;
    textResponse += `📦 **汇总统计**：批次数 ${data.inventory.批次数} 批，总数量 ${data.inventory.总数量} 件，供应商 ${data.inventory.供应商数量} 家`;

    if (data.testing && data.testing.测试总数 > 0) {
      const passRate = ((data.testing.通过数 / data.testing.测试总数) * 100).toFixed(1);
      textResponse += `，测试通过率 ${passRate}%`;
    }

    textResponse += `\n\n📋 **详细库存记录如下表所示：**`;

    // 构建表格数据
    const tableData = data.details && data.details.length > 0 ? data.details.map(record => ({
      物料名称: record.material_name || material,
      供应商: record.supplier_name || '未知',
      数量: record.quantity || 0,
      状态: record.status || '正常',
      存储位置: record.storage_location || '未知',
      批次号: record.batch_code || '未知'
    })) : [];

    // 构建关键指标
    const keyMetrics = [
      { name: '批次数', value: data.inventory.批次数, unit: '批', trend: 'info' },
      { name: '总数量', value: data.inventory.总数量, unit: '件', trend: 'success' },
      { name: '供应商数量', value: data.inventory.供应商数量, unit: '家', trend: 'info' },
      { name: '风险批次', value: data.inventory.风险批次, unit: '批', trend: data.inventory.风险批次 > 0 ? 'warning' : 'success' }
    ];

    if (data.testing && data.testing.测试总数 > 0) {
      const passRate = ((data.testing.通过数 / data.testing.测试总数) * 100).toFixed(1);
      keyMetrics.push(
        { name: '测试总数', value: data.testing.测试总数, unit: '次', trend: 'info' },
        { name: '通过率', value: passRate, unit: '%', trend: passRate >= 90 ? 'success' : passRate >= 80 ? 'warning' : 'danger' }
      );
    }

    const result = {
      text: textResponse,
      tableData: tableData,
      summary: `${material}共有${data.inventory.批次数}批次，总数量${data.inventory.总数量}件`,
      keyMetrics: keyMetrics
    };

    console.log('✅ 生成的结构化回复:', JSON.stringify(result, null, 2));
    return result;
  }

  /**
   * 格式化工厂概览
   */
  formatFactoryOverview(data, factory) {
    if (!data || data.length === 0) {
      return `未找到工厂"${factory}"的库存信息。`;
    }

    let response = `🏭 **${factory}库存概览** (共${data.length}条记录)：\n\n`;

    const tableData = {
      headers: ['物料名称', '供应商', '批次数量', '总数量', '状态分布'],
      rows: data.map(item => [
        item.物料名称,
        item.供应商,
        item.批次数量,
        item.总数量,
        item.状态分布
      ])
    };

    response += this.generateTable(tableData);
    return response;
  }

  /**
   * 格式化状态分析
   */
  formatStatusAnalysis(data, status) {
    console.log(`🔍 格式化状态分析: ${status}`);
    console.log('📊 数据内容:', JSON.stringify(data, null, 2));

    if (!data || data.length === 0) {
      return {
        text: `未找到状态为"${status}"的库存信息。`,
        tableData: [],
        summary: `未找到${status}状态的库存`,
        keyMetrics: []
      };
    }

    // 构建文本回复
    let textResponse = `⚠️ **${status}状态物料分析**\n\n`;
    textResponse += `📊 **汇总统计**：共发现 ${data.length} 条${status}状态的库存记录\n\n`;
    textResponse += `📋 **详细记录如下表所示：**`;

    // 构建表格数据
    const tableData = data.map(item => ({
      物料名称: item.material_name || item.物料名称 || '未知',
      供应商: item.supplier_name || item.供应商 || '未知',
      数量: item.quantity || item.数量 || 0,
      状态: item.status || item.状态 || status,
      存储位置: item.storage_location || item.工厂 || '未知',
      批次号: item.batch_code || item.批次号 || '未知',
      入库时间: item.inbound_time || item.入库时间 || '未知'
    }));

    // 计算统计信息
    const totalQuantity = tableData.reduce((sum, item) => sum + (parseInt(item.数量) || 0), 0);
    const suppliers = [...new Set(tableData.map(item => item.供应商))];
    const materials = [...new Set(tableData.map(item => item.物料名称))];

    // 构建关键指标
    const keyMetrics = [
      { name: `${status}记录数`, value: data.length, unit: '条', trend: 'warning' },
      { name: '总数量', value: totalQuantity, unit: '件', trend: 'warning' },
      { name: '涉及供应商', value: suppliers.length, unit: '家', trend: 'info' },
      { name: '涉及物料', value: materials.length, unit: '种', trend: 'info' }
    ];

    const result = {
      text: textResponse,
      tableData: tableData,
      summary: `发现${data.length}条${status}状态记录，总数量${totalQuantity}件`,
      keyMetrics: keyMetrics
    };

    console.log('✅ 生成的结构化回复:', JSON.stringify(result, null, 2));
    return result;
  }

  /**
   * 格式化综合分析
   */
  formatComprehensiveAnalysis(data) {
    let response = `📊 **综合分析报告**：\n\n`;

    response += `🏆 **供应商排行榜** (TOP 10)：\n\n`;
    const supplierTable = {
      headers: ['排名', '供应商', '批次数', '总数量'],
      rows: data.suppliers.map((item, index) => [
        index + 1,
        item.supplier_name,
        item.批次数,
        item.总数量
      ])
    };
    response += this.generateTable(supplierTable);

    response += `\n📦 **物料排行榜** (TOP 10)：\n\n`;
    const materialTable = {
      headers: ['排名', '物料名称', '批次数', '总数量'],
      rows: data.materials.map((item, index) => [
        index + 1,
        item.material_name,
        item.批次数,
        item.总数量
      ])
    };
    response += this.generateTable(materialTable);

    return response;
  }

  /**
   * 格式化质量分析回答
   */
  formatQualityAnalysis(data) {
    console.log(`🔍 格式化质量分析`);
    console.log('📊 数据内容:', JSON.stringify(data, null, 2));

    if (!data || !data.overview) {
      return {
        text: `暂无质量分析数据。`,
        tableData: [],
        summary: `暂无质量分析数据`,
        keyMetrics: []
      };
    }

    // 构建文本回复
    let textResponse = `🔍 **质量分析报告**\n\n`;
    textResponse += `📊 **整体概览**：总测试 ${data.overview.总测试数} 次，通过率 ${data.overview.通过率}%，涉及 ${data.overview.测试供应商数} 家供应商\n\n`;
    textResponse += `📋 **详细测试记录如下表所示：**`;

    // 构建表格数据 - 显示具体的测试记录
    let tableData = [];

    if (data.details && data.details.length > 0) {
      // 如果有详细记录，显示测试记录
      tableData = data.details.map(record => ({
        物料名称: record.material_name || record.物料名称 || '未知',
        供应商: record.supplier_name || record.供应商 || '未知',
        测试结果: record.test_result || record.测试结果 || '未知',
        测试项目: record.test_item || record.测试项目 || '未知',
        缺陷描述: record.defect_desc || record.缺陷描述 || '无',
        测试日期: record.test_date || record.测试日期 || '未知',
        结论: record.conclusion || record.结论 || '未知'
      }));
    } else if (data.defects && data.defects.length > 0) {
      // 如果没有详细记录但有缺陷统计，显示缺陷统计
      tableData = data.defects.map(defect => ({
        缺陷类型: defect.缺陷类型 || '未知',
        出现次数: defect.出现次数 || 0,
        占比: defect.占比 || '0%',
        影响程度: defect.出现次数 > 10 ? '高' : defect.出现次数 > 5 ? '中' : '低'
      }));
    } else if (data.suppliers && data.suppliers.length > 0) {
      // 如果有供应商统计，显示供应商质量排行
      tableData = data.suppliers.map((supplier, index) => ({
        排名: index + 1,
        供应商: supplier.供应商 || '未知',
        测试数: supplier.测试数 || 0,
        通过数: supplier.通过数 || 0,
        通过率: supplier.通过率 || '0%',
        质量等级: parseFloat(supplier.通过率) >= 95 ? '优秀' : parseFloat(supplier.通过率) >= 85 ? '良好' : '需改进'
      }));
    }

    // 构建关键指标
    const keyMetrics = [
      { name: '总测试数', value: data.overview.总测试数, unit: '次', trend: 'info' },
      { name: '通过数', value: data.overview.通过数, unit: '次', trend: 'success' },
      { name: '通过率', value: data.overview.通过率, unit: '%', trend: data.overview.通过率 >= 90 ? 'success' : data.overview.通过率 >= 80 ? 'warning' : 'danger' },
      { name: '测试供应商', value: data.overview.测试供应商数, unit: '家', trend: 'info' },
      { name: '测试物料', value: data.overview.测试物料数, unit: '种', trend: 'info' }
    ];

    const result = {
      text: textResponse,
      tableData: tableData,
      summary: `总测试${data.overview.总测试数}次，通过率${data.overview.通过率}%`,
      keyMetrics: keyMetrics
    };

    console.log('✅ 生成的结构化回复:', JSON.stringify(result, null, 2));
    return result;
  }

  /**
   * 格式化时间分析回答
   */
  formatTimeAnalysis(data) {
    let response = `📅 **时间趋势分析**：\n\n`;

    if (data.tests && data.tests.length > 0) {
      response += `🧪 **最近测试趋势**：\n\n`;
      const testTable = {
        headers: ['日期', '测试数', '通过数', '通过率(%)'],
        rows: data.tests.map(item => [
          item.日期,
          item.测试数,
          item.通过数,
          item.通过率
        ])
      };
      response += this.generateTable(testTable);
    }

    if (data.inventory && data.inventory.length > 0) {
      response += `\n📦 **最近入库情况**：\n\n`;
      const inventoryTable = {
        headers: ['日期', '入库批次', '入库数量', '风险批次'],
        rows: data.inventory.map(item => [
          item.日期,
          item.入库批次,
          item.入库数量,
          item.风险批次
        ])
      };
      response += this.generateTable(inventoryTable);
    }

    response += `\n💡 **可视化图表**：已生成时间趋势图，可查看数据变化趋势。\n`;

    return response;
  }

  /**
   * 格式化对比分析回答
   */
  formatComparisonAnalysis(data) {
    let response = `🔄 **对比分析报告**：\n\n`;

    if (data.type === 'supplier_comparison') {
      response += `🏭 **供应商对比分析**：\n\n`;
      const table = {
        headers: ['供应商', '物料种类', '库存批次', '总数量', '风险批次', '风险率(%)'],
        rows: data.data.map(item => [
          item.供应商,
          item.物料种类,
          item.库存批次,
          item.总数量,
          item.风险批次,
          item.风险率
        ])
      };
      response += this.generateTable(table);
    } else if (data.type === 'factory_comparison') {
      response += `🏢 **工厂对比分析**：\n\n`;
      const table = {
        headers: ['工厂', '供应商数', '物料种类', '库存批次', '总数量'],
        rows: data.data.map(item => [
          item.工厂,
          item.供应商数,
          item.物料种类,
          item.库存批次,
          item.总数量
        ])
      };
      response += this.generateTable(table);
    }

    response += `\n💡 **可视化图表**：已生成对比分析图表，可直观查看差异。\n`;

    return response;
  }

  /**
   * 格式化一般回答
   */
  formatGeneralResponse(data, analysis) {
    const response = `📊 **系统概览**：\n\n📋 **详细数据记录如下表所示：**\n\n📈 **统计摘要**：\n- 总批次数：${data.总批次数} 批\n- 总数量：${data.总数量} 件\n- 供应商数量：${data.供应商数量} 家\n- 物料种类：${data.物料种类} 种\n- 工厂数量：${data.工厂数量} 个`;

    // 构建关键指标
    const keyMetrics = [
      { name: '总批次数', value: data.总批次数, unit: '批', trend: 'success' },
      { name: '总数量', value: data.总数量, unit: '件', trend: 'success' },
      { name: '供应商数量', value: data.供应商数量, unit: '家', trend: 'info' },
      { name: '物料种类', value: data.物料种类, unit: '种', trend: 'info' },
      { name: '工厂数量', value: data.工厂数量, unit: '个', trend: 'info' }
    ];

    return {
      text: response,
      tableData: [],
      summary: `系统总计${data.总批次数}批次，${data.总数量}件物料，涉及${data.供应商数量}家供应商`,
      keyMetrics: keyMetrics
    };
  }

  /**
   * 生成表格
   */
  generateTable(tableData) {
    let table = '| ' + tableData.headers.join(' | ') + ' |\n';
    table += '|' + tableData.headers.map(() => '---').join('|') + '|\n';

    tableData.rows.forEach(row => {
      table += '| ' + row.join(' | ') + ' |\n';
    });

    return table;
  }

  async close() {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }
  }
}

export default IntelligentQASystem;
