/**
 * 复杂汇总服务
 * 实现物料整体质量状态确认等高级功能
 */

import { getRealData } from './frontendDataService.js';
import ResponseFormatterService from './ResponseFormatterService.js';

class ComplexSummaryService {
  constructor() {
    this.data = null;
  }

  /**
   * 更新数据
   */
  updateData(newData) {
    this.data = newData;
  }

  /**
   * 物料整体质量状态确认
   */
  async confirmMaterialQualityStatus(materialName) {
    const data = this.data || getRealData();
    
    if (!data || !materialName) {
      return this.formatError('缺少必要的参数或数据');
    }

    // 查找相关物料数据
    const inventoryData = this.findMaterialInInventory(data.inventory, materialName);
    const productionData = this.findMaterialInProduction(data.production, materialName);
    const inspectionData = this.findMaterialInInspection(data.inspection, materialName);

    if (!inventoryData.length && !productionData.length && !inspectionData.length) {
      return this.formatError(`未找到物料"${materialName}"的相关数据`);
    }

    // 生成综合质量状态报告
    const qualityReport = this.generateQualityReport(
      materialName,
      inventoryData,
      productionData,
      inspectionData
    );

    return ResponseFormatterService.formatComplexSummary(qualityReport);
  }

  /**
   * 工厂所有物料状态分析
   */
  async analyzeFactoryMaterialStatus(factory) {
    const data = this.data || getRealData();
    
    if (!data || !factory) {
      return this.formatError('缺少必要的参数或数据');
    }

    // 获取工厂相关数据
    const factoryInventory = data.inventory.filter(item => 
      item.factory && item.factory.includes(factory)
    );
    
    const factoryProduction = data.production.filter(item => 
      item.factory && item.factory.includes(factory)
    );

    if (!factoryInventory.length && !factoryProduction.length) {
      return this.formatError(`未找到工厂"${factory}"的相关数据`);
    }

    // 生成工厂分析报告
    const factoryReport = this.generateFactoryReport(
      factory,
      factoryInventory,
      factoryProduction,
      data.inspection
    );

    return ResponseFormatterService.formatFactoryAnalysis(factoryReport);
  }

  /**
   * 供应商综合评估
   */
  async evaluateSupplierPerformance(supplier) {
    const data = this.data || getRealData();
    
    if (!data || !supplier) {
      return this.formatError('缺少必要的参数或数据');
    }

    // 获取供应商相关数据
    const supplierInventory = data.inventory.filter(item => 
      item.supplier && item.supplier.includes(supplier)
    );
    
    const supplierProduction = data.production.filter(item => 
      item.supplier && item.supplier.includes(supplier)
    );

    const supplierInspection = data.inspection.filter(item => 
      item.supplier && item.supplier.includes(supplier)
    );

    if (!supplierInventory.length && !supplierProduction.length && !supplierInspection.length) {
      return this.formatError(`未找到供应商"${supplier}"的相关数据`);
    }

    // 生成供应商评估报告
    const supplierReport = this.generateSupplierReport(
      supplier,
      supplierInventory,
      supplierProduction,
      supplierInspection
    );

    return ResponseFormatterService.formatSupplierEvaluation(supplierReport);
  }

  /**
   * 查找库存中的物料
   */
  findMaterialInInventory(inventory, materialName) {
    return inventory.filter(item => 
      item.materialName && item.materialName.includes(materialName)
    );
  }

  /**
   * 查找生产中的物料
   */
  findMaterialInProduction(production, materialName) {
    return production.filter(item => 
      item.materialName && item.materialName.includes(materialName)
    );
  }

  /**
   * 查找测试中的物料
   */
  findMaterialInInspection(inspection, materialName) {
    return inspection.filter(item => 
      item.materialName && item.materialName.includes(materialName)
    );
  }

  /**
   * 生成物料质量报告
   */
  generateQualityReport(materialName, inventoryData, productionData, inspectionData) {
    // 库存分析
    const inventoryAnalysis = this.analyzeInventoryData(inventoryData);
    
    // 生产分析
    const productionAnalysis = this.analyzeProductionData(productionData);
    
    // 测试分析
    const inspectionAnalysis = this.analyzeInspectionData(inspectionData);
    
    // 综合评估
    const overallAssessment = this.calculateOverallAssessment(
      inventoryAnalysis,
      productionAnalysis,
      inspectionAnalysis
    );

    return {
      materialName,
      timestamp: new Date().toISOString(),
      inventory: inventoryAnalysis,
      production: productionAnalysis,
      inspection: inspectionAnalysis,
      overall: overallAssessment,
      recommendations: this.generateRecommendations(overallAssessment)
    };
  }

  /**
   * 分析库存数据
   */
  analyzeInventoryData(inventoryData) {
    if (!inventoryData.length) {
      return { status: 'no_data', message: '无库存数据' };
    }

    const totalQuantity = inventoryData.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const statusDistribution = this.calculateStatusDistribution(inventoryData);
    const riskLevel = this.calculateInventoryRiskLevel(statusDistribution);

    return {
      totalRecords: inventoryData.length,
      totalQuantity,
      statusDistribution,
      riskLevel,
      factories: [...new Set(inventoryData.map(item => item.factory))],
      warehouses: [...new Set(inventoryData.map(item => item.warehouse))]
    };
  }

  /**
   * 分析生产数据
   */
  analyzeProductionData(productionData) {
    if (!productionData.length) {
      return { status: 'no_data', message: '无生产数据' };
    }

    const avgDefectRate = productionData.reduce((sum, item) => 
      sum + (item.defectRate || 0), 0) / productionData.length;
    
    const defectTypes = [...new Set(productionData.map(item => item.defect).filter(Boolean))];
    const qualityLevel = this.calculateQualityLevel(avgDefectRate);

    return {
      totalRecords: productionData.length,
      avgDefectRate: Number(avgDefectRate.toFixed(2)),
      qualityLevel,
      defectTypes,
      factories: [...new Set(productionData.map(item => item.factory))],
      projects: [...new Set(productionData.map(item => item.projectId))]
    };
  }

  /**
   * 分析测试数据
   */
  analyzeInspectionData(inspectionData) {
    if (!inspectionData.length) {
      return { status: 'no_data', message: '无测试数据' };
    }

    const passCount = inspectionData.filter(item => item.testResult === 'PASS').length;
    const passRate = (passCount / inspectionData.length * 100);
    const testLevel = this.calculateTestLevel(passRate);

    return {
      totalRecords: inspectionData.length,
      passCount,
      failCount: inspectionData.length - passCount,
      passRate: Number(passRate.toFixed(1)),
      testLevel,
      projects: [...new Set(inspectionData.map(item => item.projectId))]
    };
  }

  /**
   * 计算状态分布
   */
  calculateStatusDistribution(inventoryData) {
    const distribution = {};
    inventoryData.forEach(item => {
      const status = item.status || '未知';
      distribution[status] = (distribution[status] || 0) + 1;
    });
    return distribution;
  }

  /**
   * 计算库存风险等级
   */
  calculateInventoryRiskLevel(statusDistribution) {
    const total = Object.values(statusDistribution).reduce((sum, count) => sum + count, 0);
    const riskCount = (statusDistribution['风险'] || 0) + (statusDistribution['冻结'] || 0);
    const riskRatio = riskCount / total;

    if (riskRatio > 0.2) return '高风险';
    if (riskRatio > 0.1) return '中风险';
    return '低风险';
  }

  /**
   * 计算质量等级
   */
  calculateQualityLevel(avgDefectRate) {
    if (avgDefectRate <= 1) return '优秀';
    if (avgDefectRate <= 3) return '良好';
    if (avgDefectRate <= 5) return '一般';
    return '需改进';
  }

  /**
   * 计算测试等级
   */
  calculateTestLevel(passRate) {
    if (passRate >= 98) return '优秀';
    if (passRate >= 95) return '良好';
    if (passRate >= 90) return '一般';
    return '需改进';
  }

  /**
   * 计算综合评估
   */
  calculateOverallAssessment(inventoryAnalysis, productionAnalysis, inspectionAnalysis) {
    const scores = [];
    
    // 库存评分
    if (inventoryAnalysis.riskLevel === '低风险') scores.push(90);
    else if (inventoryAnalysis.riskLevel === '中风险') scores.push(70);
    else scores.push(50);
    
    // 生产评分
    if (productionAnalysis.qualityLevel === '优秀') scores.push(95);
    else if (productionAnalysis.qualityLevel === '良好') scores.push(80);
    else if (productionAnalysis.qualityLevel === '一般') scores.push(65);
    else scores.push(50);
    
    // 测试评分
    if (inspectionAnalysis.testLevel === '优秀') scores.push(95);
    else if (inspectionAnalysis.testLevel === '良好') scores.push(80);
    else if (inspectionAnalysis.testLevel === '一般') scores.push(65);
    else scores.push(50);

    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    let level;
    if (avgScore >= 90) level = '优秀';
    else if (avgScore >= 80) level = '良好';
    else if (avgScore >= 70) level = '一般';
    else level = '需改进';

    return {
      score: Number(avgScore.toFixed(1)),
      level,
      dimensions: {
        inventory: inventoryAnalysis.riskLevel,
        production: productionAnalysis.qualityLevel,
        inspection: inspectionAnalysis.testLevel
      }
    };
  }

  /**
   * 生成改进建议
   */
  generateRecommendations(assessment) {
    const recommendations = [];
    
    if (assessment.dimensions.inventory !== '低风险') {
      recommendations.push('加强库存风险管理，及时处理风险和冻结物料');
    }
    
    if (assessment.dimensions.production !== '优秀') {
      recommendations.push('优化生产工艺，降低不良率，提升产品质量');
    }
    
    if (assessment.dimensions.inspection !== '优秀') {
      recommendations.push('加强质量检验，提高测试通过率');
    }
    
    if (assessment.score >= 90) {
      recommendations.push('继续保持优秀的质量管理水平');
    }

    return recommendations;
  }

  /**
   * 格式化错误信息
   */
  formatError(message) {
    return ResponseFormatterService.formatError(message);
  }
}

export default ComplexSummaryService;
