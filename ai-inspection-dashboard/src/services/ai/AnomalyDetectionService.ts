/**
 * 异常检测服务
 * 提供异常检测、风险评估和预测功能
 */

import { InventoryItem, ProductionAnomaly, LabTest, AnomalyDetectionResult, RiskPrediction } from '../../types/models';

/**
 * 异常检测服务类
 * 负责分析数据，检测异常并生成预测
 */
export class AnomalyDetectionService {
  // 存储训练好的模型权重
  private modelWeights: Record<string, number> = {};
  
  // 异常阈值配置
  private thresholds = {
    inventoryQualityScore: 60,      // 库存质量分数阈值
    labTestDeviation: 0.15,         // 实验室测试偏差阈值 (15%)
    supplierReliability: 70,        // 供应商可靠性阈值
    historicalAnomalyRate: 0.05,    // 历史异常率阈值 (5%)
    criticalTestFailure: true,      // 关键测试失败触发异常
  };
  
  /**
   * 初始化异常检测服务
   * @param config 可选配置参数
   */
  constructor(config?: Partial<typeof AnomalyDetectionService.prototype.thresholds>) {
    if (config) {
      this.thresholds = { ...this.thresholds, ...config };
    }
    
    // 初始化模型权重
    this.initializeModelWeights();
  }
  
  /**
   * 初始化模型权重
   * 在实际应用中，这些权重应该通过机器学习训练得到
   */
  private initializeModelWeights(): void {
    this.modelWeights = {
      // 物料风险因素权重
      material_complexity: 0.15,
      supplier_reliability: 0.25,
      historical_defect_rate: 0.30,
      shelf_life_remaining: 0.10,
      test_failure_rate: 0.20,
      
      // 异常类型权重
      dimension_anomaly: 0.15,
      appearance_anomaly: 0.10,
      functional_anomaly: 0.30,
      chemical_anomaly: 0.25,
      reliability_anomaly: 0.20,
    };
  }
  
  /**
   * 检测库存异常
   * @param items 库存项列表
   * @returns 检测到的异常列表
   */
  detectInventoryAnomalies(items: InventoryItem[]): AnomalyDetectionResult[] {
    const results: AnomalyDetectionResult[] = [];
    
    for (const item of items) {
      // 检查质量分数
      if (item.qualityScore < this.thresholds.inventoryQualityScore) {
        results.push({
          entityType: 'inventory',
          entityId: item.id,
          anomalyType: 'low_quality_score',
          confidence: this.calculateConfidence(this.thresholds.inventoryQualityScore, item.qualityScore),
          suggestedActions: [
            '建议增加抽检比例',
            '检查供应商质量体系',
            '考虑临时冻结库存'
          ]
        });
      }
      
      // 检查风险等级
      if (item.riskLevel === 'high') {
        results.push({
          entityType: 'inventory',
          entityId: item.id,
          anomalyType: 'high_risk_level',
          confidence: 0.9,
          suggestedActions: [
            '立即冻结库存',
            '通知质量管理部门',
            '安排全检计划'
          ]
        });
      }
      
      // 检查有效期
      if (item.expiryDate && this.isNearExpiry(item.expiryDate)) {
        results.push({
          entityType: 'inventory',
          entityId: item.id,
          anomalyType: 'near_expiry',
          confidence: 0.95,
          suggestedActions: [
            '优先使用该批次',
            '考虑调整库存计划',
            '评估是否需要报废'
          ]
        });
      }
    }
    
    return results;
  }
  
  /**
   * 检测实验室测试异常
   * @param tests 实验室测试列表
   * @returns 检测到的异常列表
   */
  detectLabTestAnomalies(tests: LabTest[]): AnomalyDetectionResult[] {
    const results: AnomalyDetectionResult[] = [];
    
    for (const test of tests) {
      // 检查整体测试结果
      if (test.overallResult === 'fail') {
        results.push({
          entityType: 'labTest',
          entityId: test.id,
          anomalyType: 'test_failure',
          confidence: 0.95,
          suggestedActions: [
            '通知供应商测试失败情况',
            '对相关批次进行全检',
            '考虑暂停使用相关物料'
          ]
        });
      }
      
      // 检查关键测试项目
      for (const item of test.testItems) {
        if (item.result === 'fail' && item.importance === 'critical') {
          results.push({
            entityType: 'labTest',
            entityId: test.id,
            anomalyType: 'critical_test_item_failure',
            confidence: 0.98,
            suggestedActions: [
              '立即冻结相关批次',
              '通知生产部门停止使用',
              '启动应急处理预案'
            ]
          });
          break; // 一个关键失败项就足够触发
        }
      }
      
      // 检查测试偏差
      for (const item of test.testItems) {
        const deviation = Math.abs(item.actualValue - item.standardValue) / item.standardValue;
        if (deviation > this.thresholds.labTestDeviation) {
          results.push({
            entityType: 'labTest',
            entityId: test.id,
            anomalyType: 'significant_deviation',
            confidence: this.calculateConfidence(this.thresholds.labTestDeviation, deviation),
            suggestedActions: [
              '复检该测试项目',
              '分析偏差原因',
              '评估对产品性能的影响'
            ]
          });
        }
      }
    }
    
    return results;
  }
  
  /**
   * 检测产线异常
   * @param anomalies 产线异常列表
   * @returns 检测到的模式和趋势
   */
  detectProductionPatterns(anomalies: ProductionAnomaly[]): AnomalyDetectionResult[] {
    const results: AnomalyDetectionResult[] = [];
    
    // 按物料分组
    const materialGroups = this.groupByProperty(anomalies, 'materialCode');
    
    // 分析每种物料的异常模式
    for (const [materialCode, materialAnomalies] of Object.entries(materialGroups)) {
      // 检查异常频率
      if (materialAnomalies.length >= 3) {
        results.push({
          entityType: 'production',
          entityId: materialCode,
          anomalyType: 'frequent_anomalies',
          confidence: this.calculateFrequencyConfidence(materialAnomalies.length),
          suggestedActions: [
            '进行物料质量专项调查',
            '检查供应商生产过程',
            '考虑更换供应商'
          ]
        });
      }
      
      // 检查严重程度分布
      const criticalCount = materialAnomalies.filter(a => a.severity === 'critical').length;
      if (criticalCount >= 2) {
        results.push({
          entityType: 'production',
          entityId: materialCode,
          anomalyType: 'multiple_critical_issues',
          confidence: 0.9,
          suggestedActions: [
            '立即暂停使用该物料',
            '组织专家团队评估风险',
            '制定应急替代方案'
          ]
        });
      }
    }
    
    // 按产线分组
    const lineGroups = this.groupByProperty(anomalies, 'productionLine');
    
    // 分析每条产线的异常模式
    for (const [line, lineAnomalies] of Object.entries(lineGroups)) {
      if (lineAnomalies.length >= 5) {
        results.push({
          entityType: 'production',
          entityId: line,
          anomalyType: 'production_line_issues',
          confidence: 0.85,
          suggestedActions: [
            '检查产线设备状态',
            '对操作人员进行培训',
            '评估工艺参数是否合适'
          ]
        });
      }
    }
    
    return results;
  }
  
  /**
   * 预测物料风险
   * @param materialCode 物料编码
   * @param batchNumber 批次号
   * @param historicalData 历史数据
   */
  predictMaterialRisk(
    materialCode: string,
    batchNumber: string,
    inventoryData: InventoryItem[],
    labTests: LabTest[],
    anomalies: ProductionAnomaly[]
  ): RiskPrediction {
    // 收集与该物料相关的数据
    const materialInventory = inventoryData.find(i => 
      i.materialCode === materialCode && i.batchNumber === batchNumber);
    
    const materialTests = labTests.filter(t => 
      t.materialCode === materialCode && t.batchNumber === batchNumber);
    
    const materialAnomalies = anomalies.filter(a => 
      a.materialCode === materialCode && a.batchNumber === batchNumber);
    
    // 历史异常
    const historicalAnomalies = anomalies.filter(a => 
      a.materialCode === materialCode && a.batchNumber !== batchNumber);
    
    // 计算风险因素
    const riskFactors: {factor: string, contribution: number}[] = [];
    
    // 1. 基于物料质量分数
    if (materialInventory) {
      const qualityRisk = 100 - materialInventory.qualityScore;
      riskFactors.push({
        factor: '物料质量评分',
        contribution: qualityRisk * this.modelWeights.material_complexity / 100
      });
    }
    
    // 2. 基于测试结果
    if (materialTests.length > 0) {
      const failedTests = materialTests.flatMap(t => 
        t.testItems.filter(item => item.result === 'fail'));
      
      const testRisk = (failedTests.length / materialTests.flatMap(t => t.testItems).length) * 100;
      riskFactors.push({
        factor: '测试失败率',
        contribution: testRisk * this.modelWeights.test_failure_rate / 100
      });
      
      // 检查关键测试项
      const criticalFailures = failedTests.filter(t => t.importance === 'critical');
      if (criticalFailures.length > 0) {
        riskFactors.push({
          factor: '关键测试项失败',
          contribution: 0.3 // 固定贡献
        });
      }
    }
    
    // 3. 基于异常历史
    if (historicalAnomalies.length > 0) {
      const historicalRisk = Math.min(historicalAnomalies.length * 0.1, 0.3);
      riskFactors.push({
        factor: '历史异常记录',
        contribution: historicalRisk
      });
      
      // 分析严重程度
      const criticalHistorical = historicalAnomalies.filter(a => a.severity === 'critical').length;
      if (criticalHistorical > 0) {
        riskFactors.push({
          factor: '历史严重异常',
          contribution: criticalHistorical * 0.15
        });
      }
    }
    
    // 4. 基于当前异常
    if (materialAnomalies.length > 0) {
      const currentRisk = Math.min(materialAnomalies.length * 0.15, 0.45);
      riskFactors.push({
        factor: '当前批次异常',
        contribution: currentRisk
      });
    }
    
    // 计算总风险分数
    const riskScore = Math.min(
      Math.round(riskFactors.reduce((sum, factor) => sum + factor.contribution, 0) * 100),
      100
    );
    
    // 确定风险等级
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (riskScore >= 70) riskLevel = 'high';
    else if (riskScore >= 40) riskLevel = 'medium';
    
    // 预测可能的问题
    const projectedIssues = this.predictPotentialIssues(
      materialCode, riskFactors, materialTests, historicalAnomalies
    );
    
    // 生成推荐措施
    const recommendedActions = this.generateRecommendations(
      riskLevel, riskFactors, projectedIssues
    );
    
    return {
      materialCode,
      batchNumber,
      riskLevel,
      riskScore,
      riskFactors,
      projectedIssues,
      recommendedActions
    };
  }
  
  /**
   * 预测潜在问题
   */
  private predictPotentialIssues(
    materialCode: string,
    riskFactors: {factor: string, contribution: number}[],
    tests: LabTest[],
    historicalAnomalies: ProductionAnomaly[]
  ): {issue: string, probability: number}[] {
    const issues: {issue: string, probability: number}[] = [];
    
    // 根据历史异常类型预测问题
    const anomalyTypes = historicalAnomalies.map(a => a.anomalyType);
    const anomalyCounts: Record<string, number> = {};
    
    anomalyTypes.forEach(type => {
      anomalyCounts[type] = (anomalyCounts[type] || 0) + 1;
    });
    
    // 将历史异常类型转换为潜在问题
    for (const [type, count] of Object.entries(anomalyCounts)) {
      const probability = Math.min(count / historicalAnomalies.length + 0.2, 0.9);
      issues.push({
        issue: this.anomalyTypeToIssue(type),
        probability
      });
    }
    
    // 根据测试失败项预测问题
    if (tests.length > 0) {
      const failedItems = tests.flatMap(t => 
        t.testItems.filter(item => item.result === 'fail')
      );
      
      const uniqueFailedTests = new Set(failedItems.map(item => item.name));
      uniqueFailedTests.forEach(testName => {
        issues.push({
          issue: `${testName}测试不合格`,
          probability: 0.75
        });
      });
    }
    
    // 根据风险因素预测问题
    const highContributionFactors = riskFactors
      .filter(f => f.contribution > 0.2)
      .map(f => f.factor);
    
    if (highContributionFactors.includes('关键测试项失败')) {
      issues.push({
        issue: '产品性能不达标',
        probability: 0.85
      });
    }
    
    if (highContributionFactors.includes('历史严重异常')) {
      issues.push({
        issue: '生产工艺稳定性问题',
        probability: 0.7
      });
    }
    
    // 确保不重复，选择概率最高的问题
    const uniqueIssues: {issue: string, probability: number}[] = [];
    const issueMap = new Map<string, number>();
    
    issues.forEach(({issue, probability}) => {
      if (!issueMap.has(issue) || issueMap.get(issue)! < probability) {
        issueMap.set(issue, probability);
      }
    });
    
    issueMap.forEach((probability, issue) => {
      uniqueIssues.push({issue, probability});
    });
    
    // 按概率排序，最高的在前
    return uniqueIssues.sort((a, b) => b.probability - a.probability);
  }
  
  /**
   * 将异常类型转换为问题描述
   */
  private anomalyTypeToIssue(type: string): string {
    const issueMap: Record<string, string> = {
      'dimension_anomaly': '尺寸规格问题',
      'appearance_anomaly': '外观缺陷',
      'functional_anomaly': '功能异常',
      'chemical_anomaly': '化学成分异常',
      'reliability_anomaly': '可靠性问题'
    };
    
    return issueMap[type] || `${type}类型问题`;
  }
  
  /**
   * 生成推荐措施
   */
  private generateRecommendations(
    riskLevel: 'low' | 'medium' | 'high',
    riskFactors: {factor: string, contribution: number}[],
    projectedIssues: {issue: string, probability: number}[]
  ): string[] {
    const recommendations: string[] = [];
    
    // 基于风险等级的通用建议
    if (riskLevel === 'high') {
      recommendations.push('冻结该批次物料，避免用于生产');
      recommendations.push('对现有库存进行全检');
      recommendations.push('通知供应商关于风险情况');
    } else if (riskLevel === 'medium') {
      recommendations.push('增加该批次的抽检比例');
      recommendations.push('监控使用过程中的异常情况');
      recommendations.push('准备备选物料方案');
    } else {
      recommendations.push('按常规检验流程处理');
    }
    
    // 基于风险因素的具体建议
    const highFactors = riskFactors
      .filter(f => f.contribution > 0.15)
      .map(f => f.factor);
    
    if (highFactors.includes('测试失败率')) {
      recommendations.push('重点关注失败测试项目，针对性改进');
    }
    
    if (highFactors.includes('历史异常记录')) {
      recommendations.push('分析历史异常共性，制定预防措施');
    }
    
    if (highFactors.includes('当前批次异常')) {
      recommendations.push('组织专项会议分析当前异常原因');
    }
    
    // 基于预测问题的建议
    if (projectedIssues.length > 0) {
      const highProbIssue = projectedIssues[0];
      if (highProbIssue.probability > 0.7) {
        recommendations.push(`针对${highProbIssue.issue}制定专项防范措施`);
      }
    }
    
    return [...new Set(recommendations)]; // 去重
  }
  
  /**
   * 计算置信度
   * @param threshold 阈值
   * @param value 实际值
   */
  private calculateConfidence(threshold: number, value: number): number {
    const diff = Math.abs(threshold - value);
    const maxDiff = threshold * 0.5; // 假设最大差异为阈值的50%
    
    // 将差异映射到0.5-1的置信度范围，差异越大置信度越高
    return Math.min(0.5 + diff / maxDiff * 0.5, 0.99);
  }
  
  /**
   * 计算基于频率的置信度
   */
  private calculateFrequencyConfidence(count: number): number {
    // 3次异常=0.7，每增加1次增加0.05，最高0.95
    return Math.min(0.7 + (count - 3) * 0.05, 0.95);
  }
  
  /**
   * 判断是否接近过期
   * @param expiryDate 过期日期
   */
  private isNearExpiry(expiryDate: Date): boolean {
    const now = new Date();
    const monthDiff = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return monthDiff < 3; // 小于3个月视为接近过期
  }
  
  /**
   * 按属性将数组分组
   */
  private groupByProperty<T>(array: T[], property: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const key = String(item[property]);
      groups[key] = groups[key] || [];
      groups[key].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }
} 