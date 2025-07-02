import express from 'express';
import { processQuery, updateInMemoryData } from '../services/assistantService.js';
import { processRealQuery, updateRealInMemoryData, processChartQuery } from '../services/realDataAssistantService.js';
import AIEnhancedService from '../services/AIEnhancedService.js';
import SimpleAIService from '../services/SimpleAIService.js';
import DeepSeekService from '../services/DeepSeekService.js';
import IntelligentIntentService from '../services/intelligentIntentService.js';
import { IQE_AI_SCENARIOS, selectOptimalScenario } from '../config/iqe-ai-scenarios.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// 初始化AI服务
const aiEnhancedService = new AIEnhancedService();
const simpleAIService = new SimpleAIService();
const deepSeekService = new DeepSeekService();
const intelligentIntentService = new IntelligentIntentService();

// 初始化智能意图服务
intelligentIntentService.initialize().catch(error => {
  logger.error('智能意图服务初始化失败:', error);
});

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
    // 同时更新两个服务的数据（兼容性）
    updateInMemoryData(data);
    updateRealInMemoryData(data);

    logger.info('Real data updated successfully', {
      inventory: data.inventory?.length || 0,
      inspection: data.inspection?.length || 0,
      production: data.production?.length || 0,
      requestId: req.requestId
    });

    res.json({ success: true, message: 'Real data updated successfully.' });
  } catch (error) {
    logger.error('Error updating real data:', { error, requestId: req.requestId });
    res.status(500).json({ error: 'Failed to update real data.' });
  }
};

/**
 * 处理来自客户端的问答查询（使用真实数据服务）
 * @param {object} req - Express请求对象
 * @param {object} res - Express响应对象
 */
const handleQuery = async (req, res) => {
  const { query, scenario, analysisMode, requireDataAnalysis } = req.body;

  console.log('🚀 IQE质量助手收到查询请求:', query);
  console.log('🎯 分析场景:', scenario);
  console.log('📊 分析模式:', analysisMode);

  if (!query) {
    return res.status(400).json({ error: 'Query text is required.' });
  }

  logger.info(`Received IQE quality query: "${query}"`, {
    scenario,
    analysisMode,
    requestId: req.requestId
  });

  try {
    // 第一步：尝试智能意图识别和结构化处理 - 最高优先级
    console.log(`🧠 尝试智能意图识别: "${query}"`);
    try {
      const intentResult = await intelligentIntentService.processQuery(query, {
        scenario,
        analysisMode,
        requireDataAnalysis
      });

      if (intentResult && intentResult.success) {
        console.log(`✅ 智能意图处理成功: ${intentResult.source}`);
        logger.info(`Intelligent intent processed successfully: "${query}"`, {
          source: intentResult.source,
          requestId: req.requestId
        });

        res.json({
          reply: intentResult.data,
          source: 'intelligent-intent',
          aiEnhanced: false,
          matchedRule: intentResult.intent || 'auto-detected',
          scenario: scenario,
          analysisMode: 'intelligent-intent',
          intentResult: intentResult
        });
        return;
      } else {
        console.log('⚠️ 智能意图无匹配，尝试AI增强处理');
      }
    } catch (intentError) {
      console.log(`⚠️ 智能意图处理失败:`, intentError.message);
    }

    // 第二步：尝试AI增强处理 - 作为智能意图的补充
    console.log(`🤖 尝试AI增强处理: "${query}"`);
    try {
      const aiResponse = await simpleAIService.processQuery(query);
      console.log('🔍 AI响应:', aiResponse);

      if (aiResponse && aiResponse.reply) {
        console.log(`✅ AI增强处理成功，回复长度: ${aiResponse.reply.length}`);
        logger.info(`AI enhanced query processed successfully: "${query}"`, {
          responseLength: aiResponse.reply.length,
          requestId: req.requestId
        });

        res.json({
          reply: aiResponse.reply,
          source: 'ai-enhanced',
          aiEnhanced: true,
          matchedRule: null,
          scenario: scenario,
          analysisMode: 'ai-enhanced'
        });
        return;
      } else {
        console.log('⚠️ AI不处理此查询，尝试基础规则');
      }
    } catch (aiError) {
      console.log(`⚠️ AI处理失败，降级到基础规则:`, aiError.message);
    }

    // 尝试基础规则匹配（优先于专业模式）
    console.log(`📝 尝试基础规则匹配: "${query}"`);
    try {
      const ruleBasedResponse = await processRealQuery(query);

      // 检查是否是有效的规则响应（不是错误消息）
      if (ruleBasedResponse &&
          !ruleBasedResponse.includes('抱歉') &&
          !ruleBasedResponse.includes('无法理解') &&
          !ruleBasedResponse.includes('暂无数据') &&
          ruleBasedResponse.length > 50) {

        console.log(`✅ 基础规则匹配成功，返回结果`);

        logger.info(`Rule-based query processed successfully: "${query}"`, {
          responseLength: ruleBasedResponse.length,
          requestId: req.requestId
        });

        res.json({
          reply: ruleBasedResponse,
          source: 'rule-based',
          aiEnhanced: false,
          matchedRule: 'auto-detected',
          scenario: scenario,
          analysisMode: 'rule-based'
        });
        return;
      } else {
        console.log(`⚠️ 基础规则未匹配或返回错误，继续专业模式`);
      }
    } catch (ruleError) {
      console.log(`⚠️ 基础规则处理失败:`, ruleError.message);
    }

    // 如果基础规则失败，使用IQE专业质量助手（作为最后的备选）
    console.log('🎯 启用IQE专业质量分析模式（备选）');

    try {
      const professionalResponse = await handleProfessionalQualityQuery(query, scenario, requireDataAnalysis);

      logger.info(`IQE professional query processed: "${query}"`, {
        scenario,
        responseLength: professionalResponse.length,
        requestId: req.requestId
      });

      res.json({
        reply: professionalResponse,
        source: 'iqe-professional',
        scenario: scenario,
        analysisMode: 'professional',
        aiEnhanced: false
      });
      return;

    } catch (professionalError) {
      console.log(`⚠️ 专业模式也失败:`, professionalError.message);
    }

    // 检查是否是图表查询
    console.log(`🔍 检查图表查询: "${query}"`);
    const chartResponse = processChartQuery(query);
    console.log(`📊 图表查询结果:`, chartResponse ? '有数据' : '无数据');

    if (chartResponse) {
      console.log(`✅ 返回图表数据: ${chartResponse.data.chartType}`);
      logger.info(`Chart query processed successfully: "${query}"`, {
        chartType: chartResponse.data.chartType,
        requestId: req.requestId
      });

      res.json(chartResponse);
      return;
    }

    console.log(`📝 继续处理文本查询: "${query}"`);

    // 否则使用基于真实数据的问答服务
    const responseText = await processRealQuery(query);

    logger.info(`Real query processed successfully: "${query}"`, {
      responseLength: responseText.length,
      requestId: req.requestId
    });

    res.json({
      reply: responseText,
      source: 'rule-based',
      aiEnhanced: false,
      matchedRule: 'auto-detected'
    });
  } catch (error) {
    logger.error(`Error processing real query: "${query}"`, { error, requestId: req.requestId });

    // 如果真实数据服务失败，回退到原始服务
    try {
      const fallbackResponse = await processQuery(query);
      res.json({
        reply: fallbackResponse
      });
    } catch (fallbackError) {
      logger.error(`Fallback query also failed: "${query}"`, { error: fallbackError, requestId: req.requestId });
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
      order: [['created_at', 'ASC']],
      raw: true
    });

    logger.info(`获取到 ${rules.length} 条规则`, { requestId: req.requestId });

    res.json({
      success: true,
      rules: rules,
      count: rules.length,
      timestamp: new Date().toISOString()
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

export { router as default };