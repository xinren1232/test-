/**
 * 图表生成API路由
 * 处理图表生成和数据可视化请求
 */

import express from 'express';
import chartGenerationService from '../services/chartGenerationService.js';

const router = express.Router();

// 生成指定类型的图表
router.post('/generate', async (req, res) => {
  try {
    const { chartType, query } = req.body;
    
    if (!chartType) {
      return res.status(400).json({
        success: false,
        error: '缺少图表类型参数'
      });
    }

    console.log(`📊 生成图表请求: ${chartType}`);
    
    // 生成图表数据
    const chartData = await chartGenerationService.generateChart(chartType);
    
    res.json({
      success: true,
      data: chartData,
      message: `成功生成${chartType}图表`
    });

  } catch (error) {
    console.error('图表生成失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '图表生成失败'
    });
  }
});

// 获取可用的图表类型列表
router.get('/types', (req, res) => {
  const chartTypes = [
    {
      name: 'TOP不良物料',
      description: 'TOP不良物料排行榜',
      category: 'ranking',
      icon: '🏆'
    },
    {
      name: 'TOP风险供应商',
      description: 'TOP风险供应商排行榜',
      category: 'ranking',
      icon: '⚠️'
    },
    {
      name: 'TOP异常批次',
      description: 'TOP异常批次排行榜',
      category: 'ranking',
      icon: '🚨'
    },
    {
      name: '风险等级分布',
      description: '库存风险等级分布饼图',
      category: 'distribution',
      icon: '🥧'
    },
    {
      name: '测试结果分布',
      description: '测试结果分布图',
      category: 'distribution',
      icon: '✅'
    },
    {
      name: '不良率趋势分析',
      description: '不良率趋势分析图',
      category: 'trend',
      icon: '📉'
    },
    {
      name: '供应商质量对比',
      description: '供应商质量对比雷达图',
      category: 'comparison',
      icon: '🎯'
    }
  ];

  res.json({
    success: true,
    data: chartTypes
  });
});

// 批量生成多个图表
router.post('/batch-generate', async (req, res) => {
  try {
    const { chartTypes } = req.body;
    
    if (!Array.isArray(chartTypes) || chartTypes.length === 0) {
      return res.status(400).json({
        success: false,
        error: '缺少图表类型列表'
      });
    }

    console.log(`📊 批量生成图表请求: ${chartTypes.join(', ')}`);
    
    const results = [];
    const errors = [];

    // 并发生成多个图表
    const promises = chartTypes.map(async (chartType) => {
      try {
        const chartData = await chartGenerationService.generateChart(chartType);
        return { chartType, success: true, data: chartData };
      } catch (error) {
        return { chartType, success: false, error: error.message };
      }
    });

    const chartResults = await Promise.all(promises);

    chartResults.forEach(result => {
      if (result.success) {
        results.push(result);
      } else {
        errors.push(result);
      }
    });

    res.json({
      success: true,
      data: {
        successful: results,
        failed: errors,
        summary: {
          total: chartTypes.length,
          successful: results.length,
          failed: errors.length
        }
      }
    });

  } catch (error) {
    console.error('批量图表生成失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '批量图表生成失败'
    });
  }
});

// 获取图表数据统计信息
router.get('/stats', async (req, res) => {
  try {
    const connection = await chartGenerationService.getConnection();
    
    try {
      // 获取基础统计信息
      const [inventoryStats] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
      const [testStats] = await connection.execute('SELECT COUNT(*) as count FROM lab_tests');
      const [trackingStats] = await connection.execute('SELECT COUNT(*) as count FROM online_tracking');
      
      // 获取风险分布
      const [riskStats] = await connection.execute(`
        SELECT risk_level, COUNT(*) as count 
        FROM inventory 
        WHERE risk_level IS NOT NULL 
        GROUP BY risk_level
      `);
      
      // 获取测试结果分布
      const [testResultStats] = await connection.execute(`
        SELECT test_result, COUNT(*) as count 
        FROM lab_tests 
        WHERE test_result IS NOT NULL 
        GROUP BY test_result
      `);

      res.json({
        success: true,
        data: {
          dataStats: {
            inventory: inventoryStats[0].count,
            tests: testStats[0].count,
            tracking: trackingStats[0].count
          },
          riskDistribution: riskStats,
          testResultDistribution: testResultStats,
          lastUpdated: new Date().toISOString()
        }
      });
      
    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('获取图表统计信息失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '获取统计信息失败'
    });
  }
});

// 根据查询文本智能识别图表类型
router.post('/identify-chart', (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: '缺少查询文本'
      });
    }

    const queryLower = query.toLowerCase();
    let chartType = null;
    let confidence = 0;

    // 图表识别规则
    const chartRules = [
      { keywords: ['top', '不良', '物料', '排行'], type: 'TOP不良物料', confidence: 0.9 },
      { keywords: ['top', '风险', '供应商', '排行'], type: 'TOP风险供应商', confidence: 0.9 },
      { keywords: ['top', '异常', '批次', '排行'], type: 'TOP异常批次', confidence: 0.9 },
      { keywords: ['风险', '等级', '分布'], type: '风险等级分布', confidence: 0.8 },
      { keywords: ['测试', '结果', '分布'], type: '测试结果分布', confidence: 0.8 },
      { keywords: ['不良率', '趋势'], type: '不良率趋势分析', confidence: 0.8 },
      { keywords: ['供应商', '质量', '对比', '雷达'], type: '供应商质量对比', confidence: 0.8 }
    ];

    // 匹配最佳图表类型
    let bestMatch = null;
    let maxScore = 0;

    chartRules.forEach(rule => {
      const matchCount = rule.keywords.filter(keyword => 
        queryLower.includes(keyword)
      ).length;
      
      const score = (matchCount / rule.keywords.length) * rule.confidence;
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = {
          chartType: rule.type,
          confidence: score,
          matchedKeywords: rule.keywords.filter(keyword => 
            queryLower.includes(keyword)
          )
        };
      }
    });

    res.json({
      success: true,
      data: {
        query: query,
        identified: bestMatch,
        allRules: chartRules.map(rule => ({
          type: rule.type,
          keywords: rule.keywords
        }))
      }
    });

  } catch (error) {
    console.error('图表类型识别失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '图表类型识别失败'
    });
  }
});

export default router;
