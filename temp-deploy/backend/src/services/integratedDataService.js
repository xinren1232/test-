/**
 * 整合数据服务
 * 基于业务逻辑的整体数据调用和多规则结合检索
 */

import mysql from 'mysql2/promise';

class IntegratedDataService {
  constructor() {
    this.dbConfig = {
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    };
    
    // 物料分类定义
    this.materialCategories = {
      '结构件类': ['电池盖', '中框', '手机卡托', '侧键', '装饰件'],
      '光学类': ['LCD显示屏', 'OLED显示屏', '摄像头模组'],
      '充电类': ['电池', '充电器'],
      '声学类': ['扬声器', '听筒'],
      '包料类': ['保护套', '标签', '包装盒']
    };
    
    // 供应商-物料映射
    this.supplierMaterialMapping = {
      '聚龙': ['电池盖', '中框', '手机卡托', '侧键', '装饰件'],
      'BOE': ['LCD显示屏', 'OLED显示屏'],
      '歌尔': ['扬声器', '听筒'],
      '天马': ['LCD显示屏', 'OLED显示屏'],
      '华星': ['OLED显示屏']
    };
    
    // 项目-基线关系
    this.projectBaselineMapping = {
      'I6789': ['X6827', 'S665LN', 'KI4K', 'X6828'],
      'I6788': ['X6831', 'KI5K', 'KI3K'],
      'I6787': ['S662LN', 'S663LN', 'S664LN']
    };
    
    // 工厂-仓库关系
    this.factoryWarehouseMapping = {
      '重庆工厂': ['重庆库存', '中央库存'],
      '深圳工厂': ['深圳库存'],
      '南昌工厂': ['中央库存'],
      '宜宾工厂': ['中央库存']
    };
  }

  async getConnection() {
    return await mysql.createConnection(this.dbConfig);
  }

  /**
   * 多规则结合检索 - 核心方法
   * @param {Object} searchCriteria 搜索条件
   * @returns {Object} 整合的数据结果
   */
  async searchWithMultipleRules(searchCriteria) {
    const connection = await this.getConnection();
    
    try {
      const {
        materialCategory,    // 物料分类
        supplier,           // 供应商
        project,            // 项目
        baseline,           // 基线
        factory,            // 工厂
        riskLevel,          // 风险等级
        timeRange,          // 时间范围
        qualityThreshold    // 质量阈值
      } = searchCriteria;

      // 构建动态查询条件
      let whereConditions = [];
      let joinTables = [];
      let selectFields = [];
      let queryParams = [];

      // 基础表和字段
      selectFields.push(`
        i.material_name,
        i.supplier_name,
        i.batch_code,
        i.quantity,
        i.risk_level,
        i.storage_location,
        i.created_at as inventory_date
      `);

      // 根据条件添加JOIN和WHERE
      if (materialCategory) {
        const materials = this.materialCategories[materialCategory];
        if (materials) {
          whereConditions.push(`i.material_name IN (${materials.map(() => '?').join(',')})`);
          queryParams.push(...materials);
        }
      }

      if (supplier) {
        whereConditions.push('i.supplier_name = ?');
        queryParams.push(supplier);
      }

      if (factory) {
        const warehouses = this.factoryWarehouseMapping[factory];
        if (warehouses) {
          whereConditions.push(`i.storage_location IN (${warehouses.map(() => '?').join(',')})`);
          queryParams.push(...warehouses);
        }
      }

      if (riskLevel) {
        whereConditions.push('i.risk_level = ?');
        queryParams.push(riskLevel);
      }

      // 添加测试数据JOIN
      joinTables.push('LEFT JOIN lab_tests lt ON i.material_name = lt.material_name AND i.batch_code = lt.batch_code');
      selectFields.push(`
        COUNT(lt.id) as test_count,
        AVG(CASE WHEN lt.test_result = '合格' THEN 1 ELSE 0 END) as test_pass_rate,
        GROUP_CONCAT(DISTINCT lt.test_item) as test_items
      `);

      // 添加生产数据JOIN
      joinTables.push('LEFT JOIN online_tracking ot ON i.material_name = ot.material_name');
      selectFields.push(`
        AVG(ot.defect_rate) as avg_defect_rate,
        AVG(ot.exception_count) as avg_exception_count,
        ot.project,
        ot.factory as production_factory
      `);

      // 如果指定了项目，添加项目过滤
      if (project) {
        whereConditions.push('ot.project = ?');
        queryParams.push(project);
      }

      // 如果指定了基线，通过项目关系过滤
      if (baseline) {
        const projects = this.projectBaselineMapping[baseline];
        if (projects) {
          whereConditions.push(`ot.project IN (${projects.map(() => '?').join(',')})`);
          queryParams.push(...projects);
        }
      }

      // 质量阈值过滤
      if (qualityThreshold) {
        whereConditions.push('(SELECT AVG(CASE WHEN test_result = "合格" THEN 1 ELSE 0 END) FROM lab_tests WHERE material_name = i.material_name) >= ?');
        queryParams.push(qualityThreshold / 100);
      }

      // 时间范围过滤
      if (timeRange) {
        whereConditions.push('i.created_at >= ? AND i.created_at <= ?');
        queryParams.push(timeRange.start, timeRange.end);
      }

      // 构建完整查询
      const query = `
        SELECT ${selectFields.join(', ')}
        FROM inventory i
        ${joinTables.join(' ')}
        ${whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''}
        GROUP BY i.material_name, i.supplier_name, i.batch_code, i.quantity, i.risk_level, i.storage_location, i.created_at, ot.project, ot.factory
        ORDER BY i.created_at DESC, avg_defect_rate DESC
      `;

      console.log('🔍 执行整合查询:', query);
      console.log('📋 查询参数:', queryParams);

      const [results] = await connection.execute(query, queryParams);

      // 数据后处理和分析
      const processedResults = this.processIntegratedResults(results, searchCriteria);

      return {
        success: true,
        data: processedResults,
        metadata: {
          totalRecords: results.length,
          searchCriteria: searchCriteria,
          executedQuery: query,
          appliedRules: this.getAppliedRules(searchCriteria)
        }
      };

    } finally {
      await connection.end();
    }
  }

  /**
   * 处理整合查询结果
   */
  processIntegratedResults(rawResults, criteria) {
    // 按物料分类分组
    const groupedByCategory = {};
    
    rawResults.forEach(record => {
      const category = this.getMaterialCategory(record.material_name);
      if (!groupedByCategory[category]) {
        groupedByCategory[category] = [];
      }
      groupedByCategory[category].push(record);
    });

    // 计算各种统计指标
    const statistics = {
      totalMaterials: rawResults.length,
      categoryDistribution: {},
      riskDistribution: {},
      qualityMetrics: {},
      supplierPerformance: {}
    };

    // 分类分布统计
    Object.keys(groupedByCategory).forEach(category => {
      statistics.categoryDistribution[category] = groupedByCategory[category].length;
    });

    // 风险分布统计
    rawResults.forEach(record => {
      const risk = record.risk_level || 'unknown';
      statistics.riskDistribution[risk] = (statistics.riskDistribution[risk] || 0) + 1;
    });

    // 质量指标统计
    const validTestRecords = rawResults.filter(r => r.test_count > 0);
    if (validTestRecords.length > 0) {
      statistics.qualityMetrics = {
        avgPassRate: validTestRecords.reduce((sum, r) => sum + (r.test_pass_rate || 0), 0) / validTestRecords.length,
        avgDefectRate: validTestRecords.reduce((sum, r) => sum + (r.avg_defect_rate || 0), 0) / validTestRecords.length,
        totalTestCount: validTestRecords.reduce((sum, r) => sum + (r.test_count || 0), 0)
      };
    }

    // 供应商表现统计
    const supplierGroups = {};
    rawResults.forEach(record => {
      const supplier = record.supplier_name;
      if (!supplierGroups[supplier]) {
        supplierGroups[supplier] = [];
      }
      supplierGroups[supplier].push(record);
    });

    Object.keys(supplierGroups).forEach(supplier => {
      const records = supplierGroups[supplier];
      const validRecords = records.filter(r => r.test_count > 0);
      
      if (validRecords.length > 0) {
        statistics.supplierPerformance[supplier] = {
          materialCount: records.length,
          avgPassRate: validRecords.reduce((sum, r) => sum + (r.test_pass_rate || 0), 0) / validRecords.length,
          avgDefectRate: validRecords.reduce((sum, r) => sum + (r.avg_defect_rate || 0), 0) / validRecords.length,
          riskProfile: this.calculateRiskProfile(records)
        };
      }
    });

    return {
      rawData: rawResults,
      groupedData: groupedByCategory,
      statistics: statistics,
      insights: this.generateInsights(rawResults, statistics),
      recommendations: this.generateRecommendations(statistics)
    };
  }

  /**
   * 获取物料分类
   */
  getMaterialCategory(materialName) {
    for (const [category, materials] of Object.entries(this.materialCategories)) {
      if (materials.includes(materialName)) {
        return category;
      }
    }
    return '其他';
  }

  /**
   * 计算风险档案
   */
  calculateRiskProfile(records) {
    const riskCounts = { high: 0, medium: 0, low: 0 };
    records.forEach(record => {
      const risk = record.risk_level || 'medium';
      riskCounts[risk] = (riskCounts[risk] || 0) + 1;
    });
    
    const total = records.length;
    return {
      high: (riskCounts.high / total * 100).toFixed(1),
      medium: (riskCounts.medium / total * 100).toFixed(1),
      low: (riskCounts.low / total * 100).toFixed(1)
    };
  }

  /**
   * 生成业务洞察
   */
  generateInsights(data, statistics) {
    const insights = [];

    // 质量洞察
    if (statistics.qualityMetrics.avgPassRate < 0.9) {
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

    // 供应商洞察
    const poorPerformingSuppliers = Object.entries(statistics.supplierPerformance)
      .filter(([_, perf]) => perf.avgPassRate < 0.85)
      .map(([supplier, _]) => supplier);
    
    if (poorPerformingSuppliers.length > 0) {
      insights.push({
        type: 'supplier_warning',
        message: `供应商${poorPerformingSuppliers.join('、')}质量表现不佳，需要关注`,
        severity: 'medium'
      });
    }

    return insights;
  }

  /**
   * 生成改进建议
   */
  generateRecommendations(statistics) {
    const recommendations = [];

    // 基于质量指标的建议
    if (statistics.qualityMetrics.avgPassRate < 0.9) {
      recommendations.push({
        category: 'quality_improvement',
        action: '加强来料检验',
        description: '建议提高抽检比例，重点关注不合格率较高的物料类别'
      });
    }

    // 基于风险分布的建议
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
   * 获取应用的规则
   */
  getAppliedRules(criteria) {
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
}

export default new IntegratedDataService();
