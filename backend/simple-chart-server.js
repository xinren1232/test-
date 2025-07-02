/**
 * 简单的图表服务器
 * 用于测试图表生成功能
 */

import express from 'express';
import cors from 'cors';
import chartGenerationService from './src/services/chartGenerationService.js';

const app = express();
const PORT = 3003;

// 中间件
app.use(cors());
app.use(express.json());

// 图表生成API
app.post('/api/charts/generate', async (req, res) => {
  try {
    const { chartType } = req.body;
    
    if (!chartType) {
      return res.status(400).json({
        success: false,
        error: '缺少图表类型参数'
      });
    }

    console.log(`📊 生成图表请求: ${chartType}`);
    
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

// 获取图表类型列表
app.get('/api/charts/types', (req, res) => {
  const chartTypes = [
    {
      name: '结构件类质量分析',
      description: '综合分析结构件类物料的库存-测试-生产全链路质量状况',
      category: 'comprehensive',
      icon: '🏗️'
    },
    {
      name: '光学类风险评估',
      description: '综合分析光学类物料的风险分布和供应商表现',
      category: 'comprehensive',
      icon: '📷'
    },
    {
      name: '深圳工厂物料流',
      description: '分析深圳工厂各类物料的库存流转和质量表现',
      category: 'comprehensive',
      icon: '🏭'
    },
    {
      name: '质量-库存-生产联动',
      description: '综合三个数据表分析物料质量问题的影响',
      category: 'comprehensive',
      icon: '🔗'
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

// 批量生成图表
app.post('/api/charts/batch-generate', async (req, res) => {
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

    for (const chartType of chartTypes) {
      try {
        const chartData = await chartGenerationService.generateChart(chartType);
        results.push({ chartType, success: true, data: chartData });
      } catch (error) {
        errors.push({ chartType, success: false, error: error.message });
      }
    }

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

// 图表识别API
app.post('/api/charts/identify-chart', (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: '缺少查询文本'
      });
    }

    const queryLower = query.toLowerCase();

    // 图表识别规则 - 基于物料分类的综合分析
    const chartRules = [
      { keywords: ['结构件', '质量', '分析', '综合'], type: '结构件类质量分析', confidence: 0.9 },
      { keywords: ['光学', '风险', '评估', '显示屏', '摄像头'], type: '光学类风险评估', confidence: 0.9 },
      { keywords: ['深圳', '工厂', '物料', '流转'], type: '深圳工厂物料流', confidence: 0.9 },
      { keywords: ['质量', '库存', '生产', '联动'], type: '质量-库存-生产联动', confidence: 0.9 },
      { keywords: ['风险', '等级', '分布'], type: '风险等级分布', confidence: 0.8 },
      { keywords: ['测试', '结果', '分布'], type: '测试结果分布', confidence: 0.8 },
      { keywords: ['不良率', '趋势'], type: '不良率趋势分析', confidence: 0.8 },
      { keywords: ['供应商', '质量', '对比', '雷达'], type: '供应商质量对比', confidence: 0.8 }
    ];

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
        identified: bestMatch
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

// 数据统计API
app.get('/api/charts/stats', async (req, res) => {
  try {
    const connection = await chartGenerationService.getConnection();
    
    try {
      const [inventoryStats] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
      const [testStats] = await connection.execute('SELECT COUNT(*) as count FROM lab_tests');
      const [trackingStats] = await connection.execute('SELECT COUNT(*) as count FROM online_tracking');
      
      const [riskStats] = await connection.execute(`
        SELECT risk_level, COUNT(*) as count 
        FROM inventory 
        WHERE risk_level IS NOT NULL 
        GROUP BY risk_level
      `);
      
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

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'chart-generation', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`📊 图表生成服务器启动成功！`);
  console.log(`🌐 服务地址: http://localhost:${PORT}`);
  console.log(`📋 API文档:`);
  console.log(`   POST /api/charts/generate - 生成图表`);
  console.log(`   GET  /api/charts/types - 获取图表类型`);
  console.log(`   POST /api/charts/batch-generate - 批量生成图表`);
  console.log(`   POST /api/charts/identify-chart - 识别图表类型`);
  console.log(`   GET  /api/charts/stats - 获取数据统计`);
  console.log(`   GET  /health - 健康检查`);
});
