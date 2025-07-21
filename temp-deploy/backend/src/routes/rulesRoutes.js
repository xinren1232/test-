/**
 * 规则管理路由
 * 处理NLP规则相关的API请求
 */
import express from 'express';
import mysql from 'mysql2/promise';
import { logger } from '../utils/logger.js';
import { executeSQL } from '../services/VirtualSQLEngine.js';
import { getMemoryData, isDataSynced } from '../services/DataSyncService.js';

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
        priority,
        sort_order,
        status,
        created_at,
        updated_at
      FROM nlp_intent_rules
      ORDER BY priority ASC, sort_order ASC, id ASC
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
    
    // 按新的场景分类分组
    const categories = {
      '库存场景': rules.filter(r => r.category === '库存场景'),
      '上线场景': rules.filter(r => r.category === '上线场景'),
      '测试场景': rules.filter(r => r.category === '测试场景'),
      '批次场景': rules.filter(r => r.category === '批次场景'),
      '对比场景': rules.filter(r => r.category === '对比场景'),
      '综合场景': rules.filter(r => r.category === '综合场景')
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
      // 处理SQL中的参数占位符
      let testSQL = rule.action_target;

      // 根据规则名称提供合适的测试参数
      let testParam = 'test';
      if (rule.intent_name.includes('结构件') || rule.intent_name.includes('大类')) {
        testParam = '结构件类';
      } else if (rule.intent_name.includes('光学')) {
        testParam = '光学类';
      } else if (rule.intent_name.includes('充电')) {
        testParam = '充电类';
      } else if (rule.intent_name.includes('声学')) {
        testParam = '声学类';
      } else if (rule.intent_name.includes('包装')) {
        testParam = '包装类';
      } else if (rule.intent_name.includes('BOE')) {
        testParam = 'BOE';
      } else if (rule.intent_name.includes('LCD') || rule.intent_name.includes('显示屏')) {
        testParam = 'LCD显示屏';
      } else if (rule.intent_name.includes('深圳')) {
        testParam = '深圳工厂';
      }

      // 替换所有参数占位符
      while (testSQL.includes('?')) {
        testSQL = testSQL.replace('?', `'${testParam}'`);
      }

      // 不再添加任何LIMIT限制，返回完整数据
      // 移除了LIMIT限制逻辑，确保返回所有符合条件的数据
      logger.info('规则查询不添加LIMIT限制，返回完整数据');

      logger.info(`执行测试SQL: ${testSQL.substring(0, 200)}...`);

      // 检查数据是否已同步
      if (!isDataSynced()) {
        logger.warn('数据未同步，无法执行SQL查询');
        await connection.end();
        return res.json({
          success: false,
          data: {
            ruleName: rule.intent_name,
            error: '数据未同步，请先同步前端数据',
            needDataSync: true
          }
        });
      }

      try {
        // 优先使用MySQL数据库执行查询
        const [mysqlResults] = await connection.execute(testSQL);
        await connection.end();

        logger.info(`✅ MySQL查询成功，返回 ${mysqlResults.length} 条记录`);

        // 检查结果质量
        let hasChineseFields = false;
        let hasErrors = false;

        if (mysqlResults.length > 0) {
          const fields = Object.keys(mysqlResults[0]);
          hasChineseFields = fields.some(field => /[\u4e00-\u9fa5]/.test(field));
          hasErrors = mysqlResults.some(record =>
            Object.values(record).some(value =>
              typeof value === 'string' && value.includes('Function not supported')
            )
          );
        }

        res.json({
          success: true,
          data: {
            ruleName: rule.intent_name,
            resultCount: mysqlResults.length,
            fields: mysqlResults.length > 0 ? Object.keys(mysqlResults[0]) : [],
            sampleData: mysqlResults.length > 0 ? mysqlResults[0] : null,
            tableData: mysqlResults,
            testParam: testParam,
            hasChineseFields: hasChineseFields,
            hasErrors: hasErrors,
            dataSource: 'MySQL',
            note: `返回 ${mysqlResults.length} 条MySQL真实数据`
          }
        });
      } catch (mysqlError) {
        logger.error(`MySQL执行失败: ${mysqlError.message}`);

        // 如果MySQL失败，尝试使用虚拟SQL引擎作为备选
        try {
          const memoryData = getMemoryData();
          const results = executeSQL(testSQL, memoryData);
          await connection.end();

          logger.warn(`⚠️ MySQL失败，使用虚拟引擎返回 ${results.length} 条记录`);

          res.json({
            success: true,
            data: {
              ruleName: rule.intent_name,
              resultCount: results.length,
              fields: results.length > 0 ? Object.keys(results[0]) : [],
              sampleData: results.length > 0 ? results[0] : null,
              tableData: results,
              testParam: testParam,
              hasChineseFields: false,
              hasErrors: false,
              dataSource: 'Virtual',
              note: `MySQL失败，返回 ${results.length} 条虚拟数据`
            }
          });
        } catch (virtualSQLError) {
          await connection.end();
          logger.error(`虚拟SQL执行也失败: ${virtualSQLError.message}`);

          res.json({
            success: false,
            data: {
              ruleName: rule.intent_name,
              error: `MySQL执行失败: ${mysqlError.message}\n虚拟SQL执行失败: ${virtualSQLError.message}`
            }
          });
        }
      }

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
        let sql = rule.action_target;

        // 处理参数占位符，用测试值替换
        sql = sql.replace(/\?/g, "'测试值'");
        sql = sql.replace(/COALESCE\('测试值', ''\)/g, "COALESCE('测试值', '')");
        sql = sql.replace(/COALESCE\('测试值', '未指定'\)/g, "COALESCE('测试值', '未指定')");

        const [results] = await connection.execute(sql);
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
