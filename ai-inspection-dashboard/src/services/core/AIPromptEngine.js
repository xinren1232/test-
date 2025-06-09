/**
 * AI提示词引擎 - 根据上下文为不同功能生成优化的提示词
 */

/**
 * AI提示词引擎类
 */
export class AIPromptEngine {
  /**
   * 提示词模板库
   */
  static promptTemplates = {
    // 通用对话模板
    general: {
      default: `你是IQE质量智能助手，专注于帮助用户解决质量检验和管理相关问题。请提供准确、专业的回答。{context}`,
      error: `作为IQE质量智能助手，你之前的回答出现了问题：{error}。请更正并解释。`
    },
    
    // 库存管理相关模板
    inventory: {
      freezeBatch: `请根据以下信息冻结批次：
批次号: {batchId}
{reason}
{additionalInfo}

请提供批次冻结的确认，并以JSON格式返回结果，包括success字段(布尔值)，message字段(字符串)，details字段(对象)。`,
      
      unfreezeBatch: `请根据以下信息解冻批次：
批次号: {batchId}
{reason}
{additionalInfo}

请提供批次解冻的确认，并以JSON格式返回结果。`,
      
      checkBatchStatus: `请查询以下批次的状态信息：
批次号: {batchId}

请以JSON格式返回状态信息，包括status字段，creationTime字段，lastUpdateTime字段，owner字段，以及如果有冻结原因则包含freezeReason字段。`
    },
    
    // 实验室测试相关模板
    laboratory: {
      queryLabData: `请查询以下物料的实验室测试数据：
物料编码: {materialCode}
时间范围: {timeRange}
测试类型: {testType}

请以JSON格式返回测试数据，并包含数据分析结果。`,
      
      analyzeLabData: `请分析以下物料的实验室测试数据趋势：
物料编码: {materialCode}
时间范围: {timeRange}
测试类型: {testType}

分析需要重点关注以下方面：
1. 数据趋势变化
2. 是否存在异常点
3. 与标准规范的符合度
4. 潜在的质量风险

请以JSON格式返回分析结果，并提供改进建议。`
    },
    
    // 生产线管理相关模板
    production: {
      analyzeAnomaly: `请分析以下生产线异常情况：
生产线: {productionLine}
时间范围: {timeRange}
异常类型: {anomalyType}

请详细分析异常原因，评估影响范围，并提供处理建议。以JSON格式返回分析结果。`
    },
    
    // 质量检验相关模板
    quality: {
      queryInspection: `请查询以下物料的质量检验记录：
物料编码: {materialCode}
时间范围: {timeRange}
检验类型: {inspectionType}

请以JSON格式返回检验记录，包括合格率、不合格项及原因。`,
      
      predictQuality: `基于历史数据，请预测以下物料未来的质量趋势：
物料编码: {materialCode}
预测周期: {predictionPeriod}

请分析可能的质量变化因素，预测未来质量趋势，并提供改进建议。以JSON格式返回预测结果。`
    },
    
    // 数据可视化相关模板
    visualization: {
      showChart: `请生成以下数据的可视化图表：
图表类型: {chartType}
数据类型: {dataType}
时间范围: {timeRange}
聚合方式: {aggregation}

请生成适合的图表配置，并以JSON格式返回图表数据。格式示例：
{
  "title": "图表标题",
  "xAxisType": "category|time|value",
  "xData": [...],
  "datasets": [
    {
      "name": "数据系列名称",
      "data": [...]
    }
  ]
}`
    }
  };
  
  /**
   * 根据用户查询和上下文构建优化的AI提示词
   * @param {string} query 用户查询
   * @param {Object} context 上下文信息
   * @param {Object} options 选项
   * @returns {string} 构建的提示词
   */
  static buildPrompt(query, context = {}, options = {}) {
    const { 
      module = 'general',
      feature = 'default',
      preferredFormat = 'text'
    } = options;
    
    const { materialCode, materialName, scenario } = context;
    
    // 获取提示词模板
    const templateKey = `${module}.${feature}`;
    let template = this.getTemplateByKey(templateKey);
    
    if (!template) {
      console.warn(`未找到提示词模板: ${templateKey}，使用通用模板`);
      template = this.promptTemplates.general.default;
    }
    
    // 填充模板变量
    let filledTemplate = this.fillTemplateVariables(template, {
      ...context,
      query
    });
    
    // 增加上下文信息
    let contextDescription = this.buildContextDescription(context);
    filledTemplate = filledTemplate.replace('{context}', contextDescription);
    
    // 添加格式要求
    if (preferredFormat === 'json') {
      filledTemplate += '\n\n请以JSON格式返回结果，确保JSON格式正确且可解析。';
    }
    
    // 添加物料特定信息（如果有）
    if (materialCode) {
      filledTemplate += this.getMaterialContextPrompt(materialCode, materialName);
    }
    
    // 添加历史上下文（如果有）
    if (options.history && options.history.length > 0) {
      filledTemplate = this.addHistoryContext(filledTemplate, options.history);
    }
    
    return filledTemplate;
  }
  
  /**
   * 根据键路径获取模板
   * @param {string} key 键路径，如 "inventory.freezeBatch"
   * @returns {string|null} 模板字符串
   */
  static getTemplateByKey(key) {
    const parts = key.split('.');
    let current = this.promptTemplates;
    
    for (const part of parts) {
      if (!current[part]) return null;
      current = current[part];
    }
    
    return typeof current === 'string' ? current : null;
  }
  
  /**
   * 填充模板变量
   * @param {string} template 模板字符串
   * @param {Object} variables 变量对象
   * @returns {string} 填充后的模板
   */
  static fillTemplateVariables(template, variables) {
    let result = template;
    
    for (const [key, value] of Object.entries(variables)) {
      if (value !== undefined && value !== null) {
        const regex = new RegExp(`\\{${key}\\}`, 'g');
        result = result.replace(regex, value);
      } else {
        // 移除未提供值的可选字段（整行）
        const regex = new RegExp(`.*\\{${key}\\}.*\\n?`, 'g');
        result = result.replace(regex, '');
      }
    }
    
    // 清理任何剩余的未填充变量
    result = result.replace(/\{[a-zA-Z0-9_]+\}/g, '');
    
    return result;
  }
  
  /**
   * 构建上下文描述
   * @param {Object} context 上下文对象
   * @returns {string} 上下文描述
   */
  static buildContextDescription(context) {
    const { scenario, role, department } = context;
    
    let description = '';
    
    if (scenario) {
      description += `你当前正在帮助用户处理${this.getScenarioName(scenario)}相关问题。`;
    }
    
    if (role) {
      description += `用户的角色是${role}。`;
    }
    
    if (department) {
      description += `用户所在部门是${department}。`;
    }
    
    return description;
  }
  
  /**
   * 获取场景名称
   * @param {string} scenario 场景代码
   * @returns {string} 场景名称
   */
  static getScenarioName(scenario) {
    const scenarioNames = {
      inventory: '库存管理',
      laboratory: '实验室测试',
      production: '生产线管理',
      quality: '质量检验',
      visualization: '数据可视化',
      general: '通用质量管理'
    };
    
    return scenarioNames[scenario] || scenario;
  }
  
  /**
   * 获取物料上下文提示
   * @param {string} materialCode 物料编码
   * @param {string} materialName 物料名称
   * @returns {string} 物料上下文提示
   */
  static getMaterialContextPrompt(materialCode, materialName) {
    let prompt = `\n\n你需要关注的物料信息：\n物料编码: ${materialCode}`;
    
    if (materialName) {
      prompt += `\n物料名称: ${materialName}`;
    }
    
    return prompt;
  }
  
  /**
   * 添加历史上下文
   * @param {string} prompt 当前提示词
   * @param {Array} history 历史记录
   * @returns {string} 添加了历史上下文的提示词
   */
  static addHistoryContext(prompt, history) {
    if (!history || history.length === 0) return prompt;
    
    const historyContext = history
      .map(msg => `${msg.role === 'user' ? '用户' : 'AI助手'}: ${msg.content}`)
      .join('\n\n');
    
    return `以下是之前的对话历史：\n\n${historyContext}\n\n${prompt}`;
  }
  
  /**
   * 为特定意图生成提示词
   * @param {string} query 用户查询
   * @param {Object} intent 识别的意图
   * @param {Object} context 上下文信息
   * @returns {string} 生成的提示词
   */
  static generatePromptForIntent(query, intent, context = {}) {
    if (!intent || !intent.module || !intent.feature) {
      return this.buildPrompt(query, context);
    }
    
    return this.buildPrompt(query, context, {
      module: intent.module,
      feature: intent.feature,
      preferredFormat: intent.preferredFormat || 'json',
      entities: intent.entities
    });
  }
  
  /**
   * 生成错误修复提示词
   * @param {string} query 用户查询
   * @param {string} error 错误信息
   * @param {Object} context 上下文信息
   * @returns {string} 错误修复提示词
   */
  static generateErrorFixPrompt(query, error, context = {}) {
    const template = this.promptTemplates.general.error;
    
    return this.fillTemplateVariables(template, {
      query,
      error,
      ...context
    });
  }
  
  /**
   * 注册自定义提示词模板
   * @param {string} module 模块名称
   * @param {string} feature 功能名称
   * @param {string} template 模板字符串
   */
  static registerTemplate(module, feature, template) {
    if (!this.promptTemplates[module]) {
      this.promptTemplates[module] = {};
    }
    
    this.promptTemplates[module][feature] = template;
  }
}

// 默认导出
export default AIPromptEngine; 