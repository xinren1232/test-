/**
 * 规则管理路由
 * 处理NLP规则相关的API请求
 */
import express from 'express';
import mysql from 'mysql2/promise';
import { logger } from '../utils/logger.js';

const router = express.Router();

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

/**
 * GET /api/rules
 * 获取所有规则
 */
router.get('/', async (req, res) => {
  try {
    logger.info('获取所有规则请求');
    
    const connection = await mysql.createConnection(dbConfig);
    
    const [rules] = await connection.execute(`
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
        sort_order,
        status,
        created_at,
        updated_at
      FROM nlp_intent_rules
      ORDER BY sort_order ASC, id ASC
    `);
    
    await connection.end();
    
    logger.info(`返回 ${rules.length} 条规则`);
    
    res.json({
      success: true,
      data: rules,
      count: rules.length
    });
    
  } catch (error) {
    logger.error('获取规则失败:', error);
    res.status(500).json({
      success: false,
      message: '获取规则失败: ' + error.message
    });
  }
});

/**
 * GET /api/rules/categories
 * 获取规则分类统计
 */
router.get('/categories', async (req, res) => {
  try {
    logger.info('获取规则分类统计请求');
    
    const connection = await mysql.createConnection(dbConfig);
    
    const [rules] = await connection.execute(`
      SELECT
        intent_name,
        description,
        category,
        sort_order,
        status
      FROM nlp_intent_rules
      ORDER BY sort_order ASC
    `);
    
    await connection.end();
    
    // 按分类分组
    const categories = {
      '基础查询': rules.filter(r => r.category === '基础查询'),
      '单场景分析': rules.filter(r => r.category === '单场景分析'),
      '多场景分析': rules.filter(r => r.category === '多场景分析')
    };
    
    const result = Object.keys(categories).map(category => ({
      name: category,
      count: categories[category].length,
      rules: categories[category].map(rule => ({
        name: rule.intent_name,
        description: rule.description,
        sort_order: rule.sort_order,
        status: rule.status
      }))
    })).filter(cat => cat.count > 0);
    
    res.json({
      success: true,
      data: {
        categories: result,
        totalRules: rules.length,
        activeRules: rules.filter(r => r.status === 'active').length
      }
    });
    
  } catch (error) {
    logger.error('获取规则分类失败:', error);
    res.status(500).json({
      success: false,
      message: '获取规则分类失败: ' + error.message
    });
  }
});

/**
 * POST /api/rules/test/:id
 * 测试特定规则
 */
router.post('/test/:id', async (req, res) => {
  try {
    const ruleId = req.params.id;
    logger.info(`测试规则 ${ruleId}`);
    
    const connection = await mysql.createConnection(dbConfig);
    
    // 获取规则
    const [rules] = await connection.execute(
      'SELECT action_target, intent_name FROM nlp_intent_rules WHERE id = ?',
      [ruleId]
    );
    
    if (rules.length === 0) {
      await connection.end();
      return res.status(404).json({
        success: false,
        message: '规则不存在'
      });
    }
    
    const rule = rules[0];
    
    try {
      // 执行规则的SQL查询
      const [results] = await connection.execute(rule.action_target);
      
      await connection.end();
      
      res.json({
        success: true,
        data: {
          ruleName: rule.intent_name,
          resultCount: results.length,
          fields: results.length > 0 ? Object.keys(results[0]) : [],
          sampleData: results.length > 0 ? results[0] : null
        }
      });
      
    } catch (sqlError) {
      await connection.end();
      logger.error(`规则 ${ruleId} SQL执行错误:`, sqlError);
      
      res.json({
        success: false,
        data: {
          ruleName: rule.intent_name,
          error: sqlError.message
        }
      });
    }
    
  } catch (error) {
    logger.error('测试规则失败:', error);
    res.status(500).json({
      success: false,
      message: '测试规则失败: ' + error.message
    });
  }
});

/**
 * POST /api/rules/test-all
 * 批量测试所有规则
 */
router.post('/test-all', async (req, res) => {
  try {
    logger.info('批量测试所有规则');
    
    const connection = await mysql.createConnection(dbConfig);
    
    const [rules] = await connection.execute(
      'SELECT id, intent_name, action_target FROM nlp_intent_rules WHERE status = "active"'
    );
    
    const testResults = [];
    
    for (const rule of rules) {
      try {
        const [results] = await connection.execute(rule.action_target);
        testResults.push({
          id: rule.id,
          name: rule.intent_name,
          success: true,
          resultCount: results.length,
          fields: results.length > 0 ? Object.keys(results[0]) : []
        });
      } catch (sqlError) {
        testResults.push({
          id: rule.id,
          name: rule.intent_name,
          success: false,
          error: sqlError.message
        });
      }
    }
    
    await connection.end();
    
    const successCount = testResults.filter(r => r.success).length;
    
    res.json({
      success: true,
      data: {
        totalTested: testResults.length,
        successCount: successCount,
        failureCount: testResults.length - successCount,
        results: testResults
      }
    });
    
  } catch (error) {
    logger.error('批量测试规则失败:', error);
    res.status(500).json({
      success: false,
      message: '批量测试规则失败: ' + error.message
    });
  }
});

/**
 * GET /api/rules/stats
 * 获取规则统计信息
 */
router.get('/stats', async (req, res) => {
  try {
    logger.info('获取规则统计信息');
    
    const connection = await mysql.createConnection(dbConfig);
    
    const [totalCount] = await connection.execute('SELECT COUNT(*) as count FROM nlp_intent_rules');
    const [activeCount] = await connection.execute('SELECT COUNT(*) as count FROM nlp_intent_rules WHERE status = "active"');
    const [priorityStats] = await connection.execute(`
      SELECT 
        priority,
        COUNT(*) as count
      FROM nlp_intent_rules 
      GROUP BY priority 
      ORDER BY priority DESC
    `);
    
    await connection.end();
    
    res.json({
      success: true,
      data: {
        totalRules: totalCount[0].count,
        activeRules: activeCount[0].count,
        inactiveRules: totalCount[0].count - activeCount[0].count,
        priorityDistribution: priorityStats
      }
    });
    
  } catch (error) {
    logger.error('获取规则统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取规则统计失败: ' + error.message
    });
  }
});

export default router;
