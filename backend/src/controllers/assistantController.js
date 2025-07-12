import express from 'express';
import { processQuery, updateInMemoryData } from '../services/assistantService.js';
import { processRealQuery, updateRealInMemoryData, getRealInMemoryData, processChartQuery } from '../services/realDataAssistantService.js';
import AIEnhancedService from '../services/AIEnhancedService.js';
import SimpleAIService from '../services/SimpleAIService.js';
import DeepSeekService from '../services/DeepSeekService.js';
import IntelligentIntentService from '../services/intelligentIntentService.js';
import OptimizedQueryProcessor from '../services/OptimizedQueryProcessor.js';
import { IQE_AI_SCENARIOS, selectOptimalScenario } from '../config/iqe-ai-scenarios.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// 初始化AI服务
const aiEnhancedService = new AIEnhancedService();
const simpleAIService = new SimpleAIService();
const deepSeekService = new DeepSeekService();
const intelligentIntentService = new IntelligentIntentService();
const optimizedQueryProcessor = new OptimizedQueryProcessor();

// 初始化服务
let servicesInitialized = false;

const initializeServices = async () => {
  try {
    await intelligentIntentService.initialize();
    await optimizedQueryProcessor.initialize();
    servicesInitialized = true;
    logger.info('✅ 所有服务初始化完成');
  } catch (error) {
    logger.error('❌ 服务初始化失败:', error);
  }
};

// 立即开始初始化
initializeServices();

/**
 * 处理来自前端的数据更新请求（使用真实数据服务）
 * @param {object} req - Express请求对象
 * @param {object} res - Express响应对象
 */
const handleDataUpdate = (req, res) => {
  const { body: data } = req;
  if (!data || (Object.keys(data).length === 0)) {
    return res.status(400).json({ error: 'No data provided for update.' });
  }

  try {
    console.log('📥 接收到数据更新请求:', {
      inventory: data.inventory?.length || 0,
      inspection: data.inspection?.length || 0,
      production: data.production?.length || 0
    });

    // 数据验证
    const validationResult = validateIncomingData(data);
    if (!validationResult.valid) {
      console.error('❌ 数据验证失败:', validationResult.errors);
      return res.status(400).json({
        success: false,
        error: 'Data validation failed',
        details: validationResult.errors
      });
    }

    // 同时更新两个服务的数据（兼容性）
    updateInMemoryData(data);
    updateRealInMemoryData(data);

    // 验证数据是否真的被更新了
    const verifyData = getRealInMemoryData();

    // 检查数据完整性
    const integrityCheck = {
      inventory: {
        expected: data.inventory?.length || 0,
        actual: verifyData.inventory?.length || 0,
        match: (data.inventory?.length || 0) === (verifyData.inventory?.length || 0)
      },
      inspection: {
        expected: data.inspection?.length || 0,
        actual: verifyData.inspection?.length || 0,
        match: (data.inspection?.length || 0) === (verifyData.inspection?.length || 0)
      },
      production: {
        expected: data.production?.length || 0,
        actual: verifyData.production?.length || 0,
        match: (data.production?.length || 0) === (verifyData.production?.length || 0)
      }
    };

    const allMatched = integrityCheck.inventory.match &&
                      integrityCheck.inspection.match &&
                      integrityCheck.production.match;

    console.log('✅ 数据完整性检查:', integrityCheck);

    logger.info('Real data updated successfully', {
      inventory: data.inventory?.length || 0,
      inspection: data.inspection?.length || 0,
      production: data.production?.length || 0,
      verifyInventory: verifyData.inventory?.length || 0,
      verifyInspection: verifyData.inspection?.length || 0,
      verifyProduction: verifyData.production?.length || 0,
      integrityCheck,
      requestId: req.requestId
    });

    res.json({
      success: true,
      message: 'Real data updated successfully.',
      integrityCheck,
      verified: allMatched,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ 数据更新失败:', error);
    logger.error('Error updating real data:', { error, requestId: req.requestId });
    res.status(500).json({
      success: false,
      error: 'Failed to update real data.',
      details: error.message
    });
  }
};

// 数据验证函数
const validateIncomingData = (data) => {
  const errors = [];

  // 检查数据结构
  if (!data || typeof data !== 'object') {
    errors.push('数据不是有效对象');
    return { valid: false, errors };
  }

  // 检查必要字段
  const requiredFields = ['inventory', 'inspection', 'production'];
  for (const field of requiredFields) {
    if (!Array.isArray(data[field])) {
      errors.push(`${field} 不是有效数组`);
    }
  }

  // 检查数据内容
  if (data.inventory && data.inventory.length > 0) {
    const sample = data.inventory[0];
    const requiredInventoryFields = ['materialName', 'batchNo', 'supplier'];
    for (const field of requiredInventoryFields) {
      if (!sample[field]) {
        errors.push(`库存数据缺少必要字段: ${field}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
};

/**
 * 处理来自客户端的问答查询（基于规则模板的智能问答）
 * @param {object} req - Express请求对象
 * @param {object} res - Express响应对象
 */
const handleQuery = async (req, res) => {
  const { query, scenario, analysisMode, requireDataAnalysis, forceMode } = req.body;

  console.log('🚀 IQE智能问答收到查询请求:', query);
  console.log('🎯 分析场景:', scenario);
  console.log('📊 分析模式:', analysisMode);

  if (!query) {
    return res.status(400).json({
      success: false,
      error: 'Query text is required.'
    });
  }

  // 确保服务已初始化
  if (!servicesInitialized) {
    logger.warn('服务尚未初始化完成，等待初始化...');
    await initializeServices();
  }

  logger.info(`Received IQE intelligent query: "${query}"`, {
    scenario,
    analysisMode,
    forceMode,
    requestId: req.requestId
  });

  try {
    logger.info(`🚀 开始基于规则模板的智能问答处理`, {
      query,
      requestId: req.requestId
    });

    // 使用新的基于规则模板的智能问答处理
    const result = await processQuery(query);

    logger.info(`🎯 智能问答处理完成`, {
      hasResult: !!result,
      success: result?.success,
      requestId: req.requestId
    });

    if (result && result.success) {
      logger.info(`Query processed successfully: "${query}"`, {
        intent: result.data?.analysis?.intent,
        template: result.data?.template,
        dataCount: result.data?.tableData ? result.data.tableData.length : 0,
        requestId: req.requestId
      });

      res.json(result);
      return;
    } else {
      logger.warn(`智能问答处理失败:`, {
        hasResult: !!result,
        success: result?.success,
        message: result?.message || '查询处理失败',
        requestId: req.requestId
      });

      // 返回失败响应
      res.status(400).json({
        success: false,
        error: result?.message || '查询处理失败',
        suggestions: result?.suggestions || []
      });
      return;
    }



  } catch (error) {
    logger.error(`❌ OptimizedQueryProcessor失败: "${query}"`, {
      error: error.message,
      stack: error.stack,
      requestId: req.requestId
    });

    // 如果优化查询处理器失败，回退到原始服务
    try {
      logger.info(`🔄 回退到原始服务处理: "${query}"`);
      const fallbackResponse = await processQuery(query);

      const fallbackResult = {
        success: true,
        reply: fallbackResponse,
        source: 'rule-based-fallback',
        processingMode: 'structured_data',
        aiEnhanced: false,
        timestamp: new Date().toISOString()
      };

      logger.info(`✅ 回退服务处理成功`, {
        source: fallbackResult.source,
        replyLength: fallbackResponse?.length || 0,
        requestId: req.requestId
      });

      res.json(fallbackResult);
    } catch (fallbackError) {
      logger.error(`Fallback query also failed: "${query}"`, { error: fallbackError.message, requestId: req.requestId });
      res.status(500).json({ error: 'An internal error occurred while processing your request.' });
    }
  }
};



/**
 * 处理AI增强查询（流式响应）
 * @param {object} req - Express请求对象
 * @param {object} res - Express响应对象
 */
const handleAIQuery = async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query text is required.' });
  }

  logger.info(`Received AI enhanced query: "${query}"`, { requestId: req.requestId });

  try {
    await aiEnhancedService.handleStreamingRequest(req, res);
  } catch (error) {
    logger.error(`Error processing AI query: "${query}"`, { error, requestId: req.requestId });

    if (!res.headersSent) {
      res.status(500).json({ error: 'An internal error occurred while processing your AI request.' });
    }
  }
};

/**
 * AI服务健康检查
 */
const handleAIHealthCheck = async (req, res) => {
  try {
    const health = await aiEnhancedService.healthCheck();
    res.json(health);
  } catch (error) {
    logger.error('AI health check failed:', { error, requestId: req.requestId });
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
};

/**
 * 启用/禁用AI增强
 */
const handleAIToggle = (req, res) => {
  const { enabled } = req.body;

  if (typeof enabled !== 'boolean') {
    return res.status(400).json({ error: 'enabled must be a boolean value.' });
  }

  aiEnhancedService.setEnabled(enabled);

  logger.info(`AI enhanced service ${enabled ? 'enabled' : 'disabled'}`, { requestId: req.requestId });

  res.json({
    success: true,
    enabled: enabled,
    message: `AI增强服务已${enabled ? '启用' : '禁用'}`
  });
};

/**
 * 处理专业质量查询
 */
const handleProfessionalQualityQuery = async (query, scenarioId, requireDataAnalysis) => {
  console.log('🎯 开始专业质量分析:', { query, scenarioId, requireDataAnalysis });

  try {
    // 1. 选择最优分析场景
    const scenario = selectOptimalScenario(scenarioId, query.split(' '));
    console.log('📊 选择分析场景:', scenario.name);

    // 2. 如果需要数据分析，先进行数据查询
    let contextData = null;
    if (requireDataAnalysis) {
      console.log('📋 执行数据查询分析...');

      try {
        // 使用DeepSeek分析查询需求
        const queryAnalysis = await deepSeekService.analyzeQuery(query);
        console.log('🔍 查询分析结果:', queryAnalysis);

        // 基于分析结果执行数据查询
        contextData = await executeDataQueries(queryAnalysis);
        console.log('📊 查询到的数据:', contextData ? '有数据' : '无数据');

      } catch (dataError) {
        console.log('⚠️ 数据查询失败，使用直接AI回答:', dataError.message);
      }
    }

    // 3. 使用专业场景进行AI分析
    console.log('🤖 调用专业AI分析...');
    const professionalResponse = await deepSeekService.answerQuestion(query, {
      scenario: scenario,
      contextData: contextData,
      analysisMode: 'professional',
      qualityFocus: true
    });

    // 4. 格式化专业回复
    const formattedResponse = formatProfessionalQualityResponse(professionalResponse, scenario, contextData);

    return formattedResponse;

  } catch (error) {
    console.error('❌ 专业质量分析失败:', error);
    throw new Error(`专业质量分析失败: ${error.message}`);
  }
};

/**
 * 执行数据查询
 */
const executeDataQueries = async (queryAnalysis) => {
  try {
    // 这里可以根据queryAnalysis的查询计划执行实际的数据查询
    // 暂时返回模拟数据，实际应该调用相应的数据查询服务
    console.log('📊 执行数据查询计划:', queryAnalysis.queryPlan);

    // 模拟数据查询结果
    return {
      queryPlan: queryAnalysis.queryPlan,
      dataAvailable: true,
      summary: '基于查询计划获取的相关数据'
    };
  } catch (error) {
    console.error('数据查询执行失败:', error);
    return null;
  }
};

/**
 * 格式化专业质量回复
 */
const formatProfessionalQualityResponse = (response, scenario, contextData) => {
  const header = `# 🎯 ${scenario.name} - 专业分析报告\n\n`;
  const footer = `\n\n---\n💡 **基于IQE质量管理体系的专业分析** | 场景: ${scenario.name}`;

  let dataInfo = '';
  if (contextData) {
    dataInfo = `\n📊 **数据基础**: 已整合相关质量数据进行分析\n`;
  }

  return header + dataInfo + response + footer;
};



/**
 * 获取所有规则列表
 * 统一返回格式，与 /api/rules 保持一致
 */
const handleGetRules = async (req, res) => {
  try {
    const { loadIntentRules } = await import('../services/assistantService.js');

    // 确保规则已加载
    await loadIntentRules();

    // 从数据库获取规则
    const initializeDatabase = (await import('../models/index.js')).default;
    const db = await initializeDatabase();
    const rules = await db.NlpIntentRule.findAll({
      where: { status: 'active' },
      order: [['priority', 'ASC'], ['sort_order', 'ASC'], ['id', 'ASC']],
      raw: true
    });

    logger.info(`获取到 ${rules.length} 条规则`, { requestId: req.requestId });

    // 统一返回格式，与 /api/rules 保持一致
    res.json({
      success: true,
      data: rules,  // 使用 data 字段而不是 rules
      count: rules.length
    });
  } catch (error) {
    logger.error('获取规则列表失败:', { error: error.message, requestId: req.requestId });
    res.status(500).json({
      success: false,
      message: '获取规则列表失败',
      error: error.message
    });
  }
};

// 现有路由
router.post('/query', handleQuery);
router.post('/update-data', handleDataUpdate);

// AI增强路由
router.post('/ai-query', handleAIQuery);
router.get('/ai-health', handleAIHealthCheck);
router.post('/ai-toggle', handleAIToggle);

// 规则管理路由
router.get('/rules', handleGetRules);

// 测试路由
router.get('/test', (req, res) => {
  console.log('🧪 测试端点被调用');
  res.json({
    message: '控制器正常工作',
    timestamp: new Date().toISOString(),
    aiServiceEnabled: aiEnhancedService.isEnabled
  });
});

// AI调试路由
router.post('/debug-ai', async (req, res) => {
  const { query } = req.body;
  console.log('🔍 AI调试端点被调用:', query);

  try {
    const aiResponse = await simpleAIService.processQuery(query);
    console.log('🔍 AI响应:', aiResponse);

    res.json({
      success: true,
      query: query,
      aiResponse: aiResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ AI调试失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 健康检查端点
const handleHealthCheck = (req, res) => {
  try {
    const verifyData = getRealInMemoryData();
    const status = {
      healthy: true,
      timestamp: new Date().toISOString(),
      services: {
        assistant: 'running',
        realDataService: 'running',
        aiEnhanced: 'running'
      },
      dataStatus: {
        inventory: verifyData.inventory?.length || 0,
        inspection: verifyData.inspection?.length || 0,
        production: verifyData.production?.length || 0,
        hasData: (verifyData.inventory?.length || 0) > 0 ||
                 (verifyData.inspection?.length || 0) > 0 ||
                 (verifyData.production?.length || 0) > 0
      }
    };

    console.log('🏥 健康检查:', status);
    res.json(status);
  } catch (error) {
    console.error('❌ 健康检查失败:', error);
    res.status(500).json({
      healthy: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// 数据验证端点
const handleDataVerification = (req, res) => {
  try {
    const { expectedCounts } = req.body;
    const actualData = getRealInMemoryData();

    const verification = {
      verified: true,
      timestamp: new Date().toISOString(),
      checks: {
        inventory: {
          expected: expectedCounts.inventory || 0,
          actual: actualData.inventory?.length || 0,
          match: (expectedCounts.inventory || 0) === (actualData.inventory?.length || 0)
        },
        inspection: {
          expected: expectedCounts.inspection || 0,
          actual: actualData.inspection?.length || 0,
          match: (expectedCounts.inspection || 0) === (actualData.inspection?.length || 0)
        },
        production: {
          expected: expectedCounts.production || 0,
          actual: actualData.production?.length || 0,
          match: (expectedCounts.production || 0) === (actualData.production?.length || 0)
        }
      }
    };

    verification.verified = verification.checks.inventory.match &&
                           verification.checks.inspection.match &&
                           verification.checks.production.match;

    verification.message = verification.verified ?
      '数据验证成功，所有数据计数匹配' :
      '数据验证失败，存在数据计数不匹配';

    console.log('🔍 数据验证结果:', verification);
    res.json(verification);
  } catch (error) {
    console.error('❌ 数据验证失败:', error);
    res.status(500).json({
      verified: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// 分批数据更新端点
const handleBatchDataUpdate = (req, res) => {
  try {
    const { type, data } = req.body;

    if (!type || !data || !Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid batch data format'
      });
    }

    console.log(`📦 接收批次数据: ${type}, ${data.length}条记录`);

    // 获取当前数据
    const currentData = getRealInMemoryData();

    // 根据类型更新数据
    switch (type) {
      case 'inventory':
        currentData.inventory = [...(currentData.inventory || []), ...data];
        break;
      case 'inspection':
        currentData.inspection = [...(currentData.inspection || []), ...data];
        break;
      case 'production':
        currentData.production = [...(currentData.production || []), ...data];
        break;
      default:
        return res.status(400).json({
          success: false,
          error: `Unknown data type: ${type}`
        });
    }

    // 更新数据
    updateRealInMemoryData(currentData);

    res.json({
      success: true,
      message: `Batch ${type} data updated successfully`,
      count: data.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ 批次数据更新失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// 新增路由
router.get('/health', handleHealthCheck);
router.post('/verify-data', handleDataVerification);
router.post('/update-data-batch', handleBatchDataUpdate);

export { router as default };