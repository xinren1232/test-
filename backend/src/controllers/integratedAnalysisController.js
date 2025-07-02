/**
 * 整合分析控制器
 * 处理基于多规则结合的整体数据分析请求
 */

import express from 'express';
import integratedDataService from '../services/integratedDataService.js';

const router = express.Router();

/**
 * 多规则结合检索
 * POST /api/integrated-analysis/search
 */
router.post('/search', async (req, res) => {
  try {
    const searchCriteria = req.body;
    
    console.log('🔍 收到整合分析请求:', JSON.stringify(searchCriteria, null, 2));
    
    // 验证请求参数
    if (!searchCriteria || Object.keys(searchCriteria).length === 0) {
      return res.status(400).json({
        success: false,
        error: '请提供至少一个搜索条件'
      });
    }

    // 执行多规则结合检索
    const result = await integratedDataService.searchWithMultipleRules(searchCriteria);
    
    res.json(result);

  } catch (error) {
    console.error('整合分析失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '整合分析失败'
    });
  }
});

/**
 * 智能问答 - 基于自然语言的整合分析
 * POST /api/integrated-analysis/intelligent-query
 */
router.post('/intelligent-query', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: '请提供查询文本'
      });
    }

    console.log('🤖 智能查询:', query);

    // 解析自然语言查询为搜索条件
    const searchCriteria = parseNaturalLanguageQuery(query);
    
    if (Object.keys(searchCriteria).length === 0) {
      return res.json({
        success: true,
        message: '未能识别具体的查询条件，请提供更明确的描述',
        suggestions: [
          '查询结构件类物料的质量情况',
          '分析聚龙供应商的风险状况',
          '检查深圳工厂的库存问题',
          '查看X6827项目的物料表现'
        ]
      });
    }

    // 执行整合分析
    const result = await integratedDataService.searchWithMultipleRules(searchCriteria);
    
    // 生成自然语言回复
    const naturalLanguageResponse = generateNaturalLanguageResponse(result, query);
    
    res.json({
      success: true,
      query: query,
      parsedCriteria: searchCriteria,
      data: result.data,
      response: naturalLanguageResponse,
      metadata: result.metadata
    });

  } catch (error) {
    console.error('智能查询失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '智能查询失败'
    });
  }
});

/**
 * 获取业务规则配置
 * GET /api/integrated-analysis/rules
 */
router.get('/rules', (req, res) => {
  try {
    const businessRules = {
      materialCategories: {
        '结构件类': ['电池盖', '中框', '手机卡托', '侧键', '装饰件'],
        '光学类': ['LCD显示屏', 'OLED显示屏', '摄像头模组'],
        '充电类': ['电池', '充电器'],
        '声学类': ['扬声器', '听筒'],
        '包料类': ['保护套', '标签', '包装盒']
      },
      supplierMaterialMapping: {
        '聚龙': ['电池盖', '中框', '手机卡托', '侧键', '装饰件'],
        'BOE': ['LCD显示屏', 'OLED显示屏'],
        '歌尔': ['扬声器', '听筒'],
        '天马': ['LCD显示屏', 'OLED显示屏'],
        '华星': ['OLED显示屏']
      },
      projectBaselineMapping: {
        'I6789': ['X6827', 'S665LN', 'KI4K', 'X6828'],
        'I6788': ['X6831', 'KI5K', 'KI3K'],
        'I6787': ['S662LN', 'S663LN', 'S664LN']
      },
      factoryWarehouseMapping: {
        '重庆工厂': ['重庆库存', '中央库存'],
        '深圳工厂': ['深圳库存'],
        '南昌工厂': ['中央库存'],
        '宜宾工厂': ['中央库存']
      },
      searchExamples: [
        {
          description: '查询结构件类物料的高风险批次',
          criteria: {
            materialCategory: '结构件类',
            riskLevel: 'high'
          }
        },
        {
          description: '分析聚龙供应商在深圳工厂的表现',
          criteria: {
            supplier: '聚龙',
            factory: '深圳工厂'
          }
        },
        {
          description: '检查X6827项目的质量问题',
          criteria: {
            project: 'X6827',
            qualityThreshold: 90
          }
        }
      ]
    };

    res.json({
      success: true,
      data: businessRules
    });

  } catch (error) {
    console.error('获取业务规则失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '获取业务规则失败'
    });
  }
});

/**
 * 生成综合报告
 * POST /api/integrated-analysis/report
 */
router.post('/report', async (req, res) => {
  try {
    const { reportType, criteria } = req.body;
    
    console.log('📊 生成综合报告:', reportType, criteria);

    let searchCriteria = criteria || {};
    
    // 根据报告类型设置默认条件
    switch (reportType) {
      case 'quality_overview':
        // 质量总览报告
        break;
      case 'risk_assessment':
        // 风险评估报告
        searchCriteria.riskLevel = 'high';
        break;
      case 'supplier_performance':
        // 供应商表现报告
        break;
      case 'factory_efficiency':
        // 工厂效率报告
        if (!searchCriteria.factory) {
          searchCriteria.factory = '深圳工厂'; // 默认深圳工厂
        }
        break;
    }

    // 执行数据分析
    const result = await integratedDataService.searchWithMultipleRules(searchCriteria);
    
    // 生成报告内容
    const report = generateReport(reportType, result);
    
    res.json({
      success: true,
      reportType: reportType,
      generatedAt: new Date().toISOString(),
      criteria: searchCriteria,
      report: report,
      rawData: result.data
    });

  } catch (error) {
    console.error('生成报告失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '生成报告失败'
    });
  }
});

/**
 * 解析自然语言查询
 */
function parseNaturalLanguageQuery(query) {
  const criteria = {};
  const queryLower = query.toLowerCase();

  // 物料分类识别
  if (queryLower.includes('结构件') || queryLower.includes('电池盖') || queryLower.includes('中框')) {
    criteria.materialCategory = '结构件类';
  } else if (queryLower.includes('光学') || queryLower.includes('显示屏') || queryLower.includes('摄像头')) {
    criteria.materialCategory = '光学类';
  } else if (queryLower.includes('充电') || queryLower.includes('电池')) {
    criteria.materialCategory = '充电类';
  } else if (queryLower.includes('声学') || queryLower.includes('扬声器') || queryLower.includes('听筒')) {
    criteria.materialCategory = '声学类';
  }

  // 供应商识别
  if (queryLower.includes('聚龙')) criteria.supplier = '聚龙';
  if (queryLower.includes('boe') || queryLower.includes('京东方')) criteria.supplier = 'BOE';
  if (queryLower.includes('歌尔')) criteria.supplier = '歌尔';
  if (queryLower.includes('天马')) criteria.supplier = '天马';

  // 工厂识别
  if (queryLower.includes('深圳')) criteria.factory = '深圳工厂';
  if (queryLower.includes('重庆')) criteria.factory = '重庆工厂';
  if (queryLower.includes('南昌')) criteria.factory = '南昌工厂';
  if (queryLower.includes('宜宾')) criteria.factory = '宜宾工厂';

  // 项目识别
  const projectMatch = queryLower.match(/(x6827|ki5k|s665ln|x6831|s662ln)/);
  if (projectMatch) {
    criteria.project = projectMatch[1].toUpperCase();
  }

  // 基线识别
  const baselineMatch = queryLower.match(/(i6789|i6788|i6787)/);
  if (baselineMatch) {
    criteria.baseline = baselineMatch[1].toUpperCase();
  }

  // 风险等级识别
  if (queryLower.includes('高风险') || queryLower.includes('high')) {
    criteria.riskLevel = 'high';
  } else if (queryLower.includes('中风险') || queryLower.includes('medium')) {
    criteria.riskLevel = 'medium';
  } else if (queryLower.includes('低风险') || queryLower.includes('low')) {
    criteria.riskLevel = 'low';
  }

  // 质量阈值识别
  const qualityMatch = queryLower.match(/(\d+)%|质量.*?(\d+)/);
  if (qualityMatch) {
    criteria.qualityThreshold = parseInt(qualityMatch[1] || qualityMatch[2]);
  }

  return criteria;
}

/**
 * 生成自然语言回复
 */
function generateNaturalLanguageResponse(result, originalQuery) {
  const { statistics, insights, recommendations } = result.data;
  
  let response = `根据您的查询"${originalQuery}"，我分析了${statistics.totalMaterials}条相关记录。\n\n`;
  
  // 添加统计信息
  response += `📊 数据概览：\n`;
  if (statistics.categoryDistribution) {
    Object.entries(statistics.categoryDistribution).forEach(([category, count]) => {
      response += `• ${category}：${count}条记录\n`;
    });
  }
  
  if (statistics.qualityMetrics.avgPassRate) {
    response += `• 平均测试通过率：${(statistics.qualityMetrics.avgPassRate * 100).toFixed(1)}%\n`;
  }
  
  // 添加洞察
  if (insights.length > 0) {
    response += `\n⚠️ 关键发现：\n`;
    insights.forEach(insight => {
      response += `• ${insight.message}\n`;
    });
  }
  
  // 添加建议
  if (recommendations.length > 0) {
    response += `\n💡 改进建议：\n`;
    recommendations.forEach(rec => {
      response += `• ${rec.action}：${rec.description}\n`;
    });
  }
  
  return response;
}

/**
 * 生成报告
 */
function generateReport(reportType, result) {
  const { statistics, insights, recommendations } = result.data;
  
  const report = {
    title: getReportTitle(reportType),
    summary: generateReportSummary(statistics),
    keyFindings: insights,
    recommendations: recommendations,
    dataAnalysis: generateDataAnalysis(statistics),
    conclusion: generateConclusion(statistics, insights)
  };
  
  return report;
}

function getReportTitle(reportType) {
  const titles = {
    'quality_overview': '质量总览报告',
    'risk_assessment': '风险评估报告',
    'supplier_performance': '供应商表现报告',
    'factory_efficiency': '工厂效率报告'
  };
  return titles[reportType] || '综合分析报告';
}

function generateReportSummary(statistics) {
  return `本次分析涵盖${statistics.totalMaterials}条记录，包含${Object.keys(statistics.categoryDistribution).length}个物料分类。`;
}

function generateDataAnalysis(statistics) {
  const analysis = [];
  
  // 分类分析
  if (statistics.categoryDistribution) {
    analysis.push({
      title: '物料分类分布',
      data: statistics.categoryDistribution
    });
  }
  
  // 风险分析
  if (statistics.riskDistribution) {
    analysis.push({
      title: '风险等级分布',
      data: statistics.riskDistribution
    });
  }
  
  // 质量分析
  if (statistics.qualityMetrics) {
    analysis.push({
      title: '质量指标',
      data: statistics.qualityMetrics
    });
  }
  
  return analysis;
}

function generateConclusion(statistics, insights) {
  let conclusion = '基于数据分析，';
  
  if (insights.length === 0) {
    conclusion += '当前状况整体良好，各项指标在正常范围内。';
  } else {
    const highSeverityIssues = insights.filter(i => i.severity === 'high').length;
    if (highSeverityIssues > 0) {
      conclusion += `发现${highSeverityIssues}个高优先级问题需要立即关注。`;
    } else {
      conclusion += '发现一些需要改进的地方，建议按照推荐措施逐步优化。';
    }
  }
  
  return conclusion;
}

export default router;
