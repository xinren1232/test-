/**
 * 整合分析服务器
 * 基于多规则结合的整体数据调用服务
 */

import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
const PORT = 3004;

// 中间件
app.use(cors());
app.use(express.json());

// 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 业务规则配置
const businessRules = {
  materialCategories: {
    '结构件类': ['中框结构件-塑料', '前壳组件', '背板结构件-金属'],
    '光学类': ['LCD显示屏-6.7寸', 'OLED显示屏-6.1寸', '摄像头模组-5000万像素', '触控屏-超薄系列'],
    '电子元件类': ['IC-存储器-128GB', '电容器-0603-1uF', '电阻器-0805-10K', '高通骁龙处理器'],
    '连接器类': ['Type-C连接器', 'NFC天线'],
    '功能组件类': ['扬声器模组', '指纹识别模组', '马达振动器', '电池-4500mAh'],
    '辅料包材类': ['包装盒-高端系列', '屏幕保护膜', '散热石墨片']
  },
  supplierMaterialMapping: {
    '三星显示': ['LCD显示屏-6.7寸', 'OLED显示屏-6.1寸'],
    '三星电子': ['IC-存储器-128GB', '电容器-0603-1uF'],
    '京东方': ['LCD显示屏-6.7寸', 'OLED显示屏-6.1寸', '触控屏-超薄系列'],
    '富士康': ['中框结构件-塑料', '前壳组件', '背板结构件-金属'],
    '高通': ['高通骁龙处理器'],
    '舜宇光学': ['摄像头模组-5000万像素'],
    '汇顶科技': ['指纹识别模组'],
    '瑞声科技': ['扬声器模组', '马达振动器'],
    '新能源科技': ['电池-4500mAh'],
    '立讯精密': ['Type-C连接器'],
    '信维通信': ['NFC天线'],
    '裕同科技': ['包装盒-高端系列']
  },
  projectBaselineMapping: {
    'I6789': ['X6827', 'S665LN', 'KI4K', 'X6828'],
    'I6788': ['X6831', 'KI5K', 'KI3K'],
    'I6787': ['S662LN', 'S663LN', 'S664LN']
  },
  factoryWarehouseMapping: {
    '深圳工厂': ['深圳工厂', '深圳库存'], // 实际数据中只有深圳工厂
    '重庆工厂': ['重庆库存', '中央库存'], // 预留配置
    '南昌工厂': ['中央库存'], // 预留配置
    '宜宾工厂': ['中央库存'] // 预留配置
  }
};

/**
 * 多规则结合检索
 */
app.post('/api/integrated-analysis/search', async (req, res) => {
  try {
    const searchCriteria = req.body;
    console.log('🔍 收到整合分析请求:', JSON.stringify(searchCriteria, null, 2));
    
    if (!searchCriteria || Object.keys(searchCriteria).length === 0) {
      return res.status(400).json({
        success: false,
        error: '请提供至少一个搜索条件'
      });
    }

    const result = await executeIntegratedSearch(searchCriteria);
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
 * 智能问答
 */
app.post('/api/integrated-analysis/intelligent-query', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: '请提供查询文本'
      });
    }

    console.log('🤖 智能查询:', query);

    // 解析自然语言查询
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
    const result = await executeIntegratedSearch(searchCriteria);
    
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
 */
app.get('/api/integrated-analysis/rules', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        ...businessRules,
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
      }
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
 * 调试API - 查看实际数据库字段值
 */
app.get('/api/integrated-analysis/debug/fields', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    // 查看库存表的工厂字段
    const [storageLocations] = await connection.execute(`
      SELECT DISTINCT storage_location
      FROM inventory
      WHERE storage_location IS NOT NULL
      ORDER BY storage_location
    `);

    // 查看生产表的工厂字段
    const [factories] = await connection.execute(`
      SELECT DISTINCT factory
      FROM online_tracking
      WHERE factory IS NOT NULL
      ORDER BY factory
    `);

    // 查看物料名称
    const [materials] = await connection.execute(`
      SELECT DISTINCT material_name
      FROM inventory
      WHERE material_name IS NOT NULL
      ORDER BY material_name
      LIMIT 20
    `);

    // 查看供应商名称
    const [suppliers] = await connection.execute(`
      SELECT DISTINCT supplier_name
      FROM inventory
      WHERE supplier_name IS NOT NULL
      ORDER BY supplier_name
      LIMIT 20
    `);

    await connection.end();

    res.json({
      success: true,
      data: {
        storageLocations: storageLocations.map(row => row.storage_location),
        factories: factories.map(row => row.factory),
        materials: materials.map(row => row.material_name),
        suppliers: suppliers.map(row => row.supplier_name)
      }
    });

  } catch (error) {
    console.error('获取调试信息失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '获取调试信息失败'
    });
  }
});

/**
 * 生成综合报告
 */
app.post('/api/integrated-analysis/report', async (req, res) => {
  try {
    const { reportType, criteria } = req.body;
    console.log('📊 生成综合报告:', reportType, criteria);

    let searchCriteria = criteria || {};
    
    // 根据报告类型设置默认条件
    switch (reportType) {
      case 'risk_assessment':
        searchCriteria.riskLevel = 'high';
        break;
      case 'factory_efficiency':
        if (!searchCriteria.factory) {
          searchCriteria.factory = '深圳工厂';
        }
        break;
    }

    // 执行数据分析
    const result = await executeIntegratedSearch(searchCriteria);
    
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
 * 执行整合搜索
 */
async function executeIntegratedSearch(searchCriteria) {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const {
      materialCategory,
      supplier,
      project,
      baseline,
      factory,
      riskLevel,
      qualityThreshold
    } = searchCriteria;

    // 构建动态查询
    let whereConditions = [];
    let queryParams = [];

    // 物料分类条件
    if (materialCategory && businessRules.materialCategories[materialCategory]) {
      const materials = businessRules.materialCategories[materialCategory];
      whereConditions.push(`i.material_name IN (${materials.map(() => '?').join(',')})`);
      queryParams.push(...materials);
    }

    // 供应商条件
    if (supplier) {
      whereConditions.push('i.supplier_name = ?');
      queryParams.push(supplier);
    }

    // 工厂条件 - 精确匹配工厂名称
    if (factory) {
      console.log(`🏭 应用工厂过滤条件: ${factory}`);

      // 构建工厂匹配条件
      const factoryConditions = [];
      const factoryParams = [];

      // 直接匹配工厂名称（精确匹配）
      factoryConditions.push('i.storage_location = ?');
      factoryParams.push(factory);

      factoryConditions.push('ot.factory = ?');
      factoryParams.push(factory);

      // 如果有仓库映射关系，也添加仓库条件
      if (businessRules.factoryWarehouseMapping[factory]) {
        const warehouses = businessRules.factoryWarehouseMapping[factory];
        warehouses.forEach(warehouse => {
          factoryConditions.push('i.storage_location = ?');
          factoryParams.push(warehouse);
        });
      }

      // 组合所有工厂相关条件（OR关系）
      whereConditions.push(`(${factoryConditions.join(' OR ')})`);
      queryParams.push(...factoryParams);

      console.log(`🔍 工厂查询条件: ${factoryConditions.join(' OR ')}`);
      console.log(`📋 工厂查询参数: ${factoryParams.join(', ')}`);
    }

    // 风险等级条件
    if (riskLevel) {
      whereConditions.push('i.risk_level = ?');
      queryParams.push(riskLevel);
    }

    // 项目条件
    if (project) {
      whereConditions.push('ot.project = ?');
      queryParams.push(project);
    }

    // 基线条件
    if (baseline && businessRules.projectBaselineMapping[baseline]) {
      const projects = businessRules.projectBaselineMapping[baseline];
      whereConditions.push(`ot.project IN (${projects.map(() => '?').join(',')})`);
      queryParams.push(...projects);
    }

    // 构建查询
    const query = `
      SELECT 
        i.material_name,
        i.supplier_name,
        i.batch_code,
        i.quantity,
        i.risk_level,
        i.storage_location,
        i.created_at as inventory_date,
        COUNT(lt.id) as test_count,
        AVG(CASE WHEN lt.test_result = '合格' THEN 1 ELSE 0 END) as test_pass_rate,
        AVG(ot.defect_rate) as avg_defect_rate,
        AVG(ot.exception_count) as avg_exception_count,
        ot.project,
        ot.factory as production_factory
      FROM inventory i
      LEFT JOIN lab_tests lt ON i.material_name = lt.material_name AND i.batch_code = lt.batch_code
      LEFT JOIN online_tracking ot ON i.material_name = ot.material_name
      ${whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''}
      GROUP BY i.material_name, i.supplier_name, i.batch_code, i.quantity, i.risk_level, i.storage_location, i.created_at, ot.project, ot.factory
      ORDER BY i.created_at DESC, avg_defect_rate DESC
    `;

    console.log('🔍 执行整合查询:', query);
    console.log('📋 查询参数:', queryParams);

    const [results] = await connection.execute(query, queryParams);

    // 如果查询特定工厂但没有结果，检查是否是数据不存在的问题
    if (results.length === 0 && searchCriteria.factory) {
      const [factoryCheck] = await connection.execute(`
        SELECT DISTINCT storage_location, factory
        FROM inventory i
        LEFT JOIN online_tracking ot ON i.material_name = ot.material_name
        WHERE i.storage_location LIKE ? OR ot.factory LIKE ?
      `, [`%${searchCriteria.factory}%`, `%${searchCriteria.factory}%`]);

      if (factoryCheck.length === 0) {
        console.log(`⚠️ 工厂 "${searchCriteria.factory}" 在数据库中不存在`);

        // 获取可用的工厂列表
        const [availableFactories] = await connection.execute(`
          SELECT DISTINCT storage_location FROM inventory
          UNION
          SELECT DISTINCT factory FROM online_tracking WHERE factory IS NOT NULL
        `);

        return {
          success: true,
          data: {
            rawData: [],
            statistics: { totalMaterials: 0 },
            insights: [{
              type: 'data_not_found',
              message: `工厂 "${searchCriteria.factory}" 在当前数据中不存在`,
              severity: 'info'
            }],
            recommendations: [{
              category: 'data_availability',
              action: '检查可用工厂',
              description: `当前可用的工厂: ${availableFactories.map(f => f.storage_location || f.factory).filter(Boolean).join('、')}`
            }]
          },
          metadata: {
            totalRecords: 0,
            searchCriteria: searchCriteria,
            appliedRules: getAppliedRules(searchCriteria),
            availableFactories: availableFactories.map(f => f.storage_location || f.factory).filter(Boolean)
          }
        };
      }
    }

    // 处理结果
    const processedResults = processIntegratedResults(results, searchCriteria);

    return {
      success: true,
      data: processedResults,
      metadata: {
        totalRecords: results.length,
        searchCriteria: searchCriteria,
        appliedRules: getAppliedRules(searchCriteria)
      }
    };

  } finally {
    await connection.end();
  }
}

/**
 * 处理整合查询结果
 */
function processIntegratedResults(rawResults, criteria) {
  // 统计信息
  const statistics = {
    totalMaterials: rawResults.length,
    categoryDistribution: {},
    riskDistribution: {},
    qualityMetrics: {},
    supplierPerformance: {}
  };

  // 分类分布
  rawResults.forEach(record => {
    const category = getMaterialCategory(record.material_name);
    statistics.categoryDistribution[category] = (statistics.categoryDistribution[category] || 0) + 1;
  });

  // 风险分布
  rawResults.forEach(record => {
    const risk = record.risk_level || 'unknown';
    statistics.riskDistribution[risk] = (statistics.riskDistribution[risk] || 0) + 1;
  });

  // 质量指标
  const validTestRecords = rawResults.filter(r => r.test_count > 0);
  if (validTestRecords.length > 0) {
    statistics.qualityMetrics = {
      avgPassRate: validTestRecords.reduce((sum, r) => sum + (r.test_pass_rate || 0), 0) / validTestRecords.length,
      avgDefectRate: validTestRecords.reduce((sum, r) => sum + (r.avg_defect_rate || 0), 0) / validTestRecords.length,
      totalTestCount: validTestRecords.reduce((sum, r) => sum + (r.test_count || 0), 0)
    };
  } else {
    // 确保即使没有测试记录也有默认值
    statistics.qualityMetrics = {
      avgPassRate: 0,
      avgDefectRate: 0,
      totalTestCount: 0
    };
  }

  // 生成洞察和建议
  const insights = generateInsights(rawResults, statistics);
  const recommendations = generateRecommendations(statistics);

  return {
    rawData: rawResults,
    statistics: statistics,
    insights: insights,
    recommendations: recommendations
  };
}

/**
 * 获取物料分类
 */
function getMaterialCategory(materialName) {
  for (const [category, materials] of Object.entries(businessRules.materialCategories)) {
    if (materials.includes(materialName)) {
      return category;
    }
  }
  return '其他';
}

/**
 * 生成业务洞察
 */
function generateInsights(data, statistics) {
  const insights = [];

  // 质量洞察
  if (statistics.qualityMetrics && statistics.qualityMetrics.avgPassRate && statistics.qualityMetrics.avgPassRate < 0.9) {
    insights.push({
      type: 'quality_warning',
      message: `整体测试通过率${(statistics.qualityMetrics.avgPassRate * 100).toFixed(1)}%，低于90%标准`,
      severity: 'high'
    });
  }

  // 风险洞察
  const highRiskRatio = (statistics.riskDistribution.high || 0) / statistics.totalMaterials;
  if (highRiskRatio > 0.3) {
    insights.push({
      type: 'risk_warning',
      message: `高风险物料占比${(highRiskRatio * 100).toFixed(1)}%，超过30%警戒线`,
      severity: 'high'
    });
  }

  return insights;
}

/**
 * 生成改进建议
 */
function generateRecommendations(statistics) {
  const recommendations = [];

  if (statistics.qualityMetrics && statistics.qualityMetrics.avgPassRate && statistics.qualityMetrics.avgPassRate < 0.9) {
    recommendations.push({
      category: 'quality_improvement',
      action: '加强来料检验',
      description: '建议提高抽检比例，重点关注不合格率较高的物料类别'
    });
  }

  const highRiskCount = statistics.riskDistribution.high || 0;
  if (highRiskCount > 0) {
    recommendations.push({
      category: 'risk_management',
      action: '优化库存结构',
      description: `当前有${highRiskCount}个高风险物料批次，建议优先处理或更换供应商`
    });
  }

  return recommendations;
}

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
  
  if (statistics.qualityMetrics && statistics.qualityMetrics.avgPassRate) {
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
  
  const titles = {
    'quality_overview': '质量总览报告',
    'risk_assessment': '风险评估报告',
    'supplier_performance': '供应商表现报告',
    'factory_efficiency': '工厂效率报告'
  };
  
  return {
    title: titles[reportType] || '综合分析报告',
    summary: `本次分析涵盖${statistics.totalMaterials}条记录，包含${Object.keys(statistics.categoryDistribution).length}个物料分类。`,
    keyFindings: insights,
    recommendations: recommendations,
    conclusion: insights.length === 0 ? 
      '当前状况整体良好，各项指标在正常范围内。' : 
      `发现${insights.filter(i => i.severity === 'high').length}个高优先级问题需要立即关注。`
  };
}

/**
 * 获取应用的规则
 */
function getAppliedRules(criteria) {
  const rules = [];
  
  if (criteria.materialCategory) {
    rules.push(`物料分类规则: ${criteria.materialCategory}`);
  }
  if (criteria.supplier) {
    rules.push(`供应商规则: ${criteria.supplier}`);
  }
  if (criteria.project) {
    rules.push(`项目规则: ${criteria.project}`);
  }
  if (criteria.baseline) {
    rules.push(`基线规则: ${criteria.baseline}`);
  }
  if (criteria.factory) {
    rules.push(`工厂规则: ${criteria.factory}`);
  }
  if (criteria.riskLevel) {
    rules.push(`风险等级规则: ${criteria.riskLevel}`);
  }
  if (criteria.qualityThreshold) {
    rules.push(`质量阈值规则: >=${criteria.qualityThreshold}%`);
  }
  
  return rules;
}

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 整合分析服务器启动成功！`);
  console.log(`📡 服务地址: http://localhost:${PORT}`);
  console.log(`🔧 功能特点:`);
  console.log(`   ✅ 基于业务逻辑的整体数据调用`);
  console.log(`   ✅ 多个规则结合检索`);
  console.log(`   ✅ 跨表数据关联分析`);
  console.log(`   ✅ 智能自然语言解析`);
  console.log(`   ✅ 业务洞察和建议生成`);
  console.log(`   ✅ 综合报告自动生成`);
  console.log(`\n🎯 API端点:`);
  console.log(`   POST /api/integrated-analysis/search - 多规则结合检索`);
  console.log(`   POST /api/integrated-analysis/intelligent-query - 智能问答`);
  console.log(`   GET  /api/integrated-analysis/rules - 业务规则配置`);
  console.log(`   POST /api/integrated-analysis/report - 综合报告生成`);
});
