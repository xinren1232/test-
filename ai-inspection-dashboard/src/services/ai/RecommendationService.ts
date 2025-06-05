/**
 * 推荐引擎服务
 * 提供基于上下文的智能决策推荐
 */

import { 
  InventoryItem, 
  ProductionAnomaly, 
  LabTest, 
  Recommendation, 
  RiskLevel, 
  Severity 
} from '../../types/models';

/**
 * 生成简单的唯一ID
 * 注: 在生产环境中建议使用uuid库
 */
function generateId(): string {
  return 'id_' + Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) +
         '_' + Date.now();
}

/**
 * 推荐类型
 */
type RecommendationType = 'inventory_action' | 'inspection' | 'production_change' | 'supplier_action';

/**
 * 推荐引擎服务类
 */
export class RecommendationService {
  // 历史推荐及其结果
  private recommendationHistory: Map<string, {
    recommendation: Recommendation,
    implemented: boolean,
    outcome?: 'positive' | 'neutral' | 'negative'
  }> = new Map();
  
  // 推荐规则库
  private rules: {
    context: {
      materialCode?: string,
      batchNumber?: string,
      riskLevel?: RiskLevel,
      anomalyType?: string,
      testResult?: 'pass' | 'fail'
    },
    recommendation: Omit<Recommendation, 'id'>
  }[] = [];
  
  /**
   * 初始化推荐引擎
   */
  constructor() {
    this.initializeRules();
  }
  
  /**
   * 初始化推荐规则库
   */
  private initializeRules(): void {
    // 库存操作推荐规则
    this.rules.push({
      context: { riskLevel: 'high' },
      recommendation: {
        type: 'inventory_action',
        priority: 'high',
        description: '高风险物料库存冻结',
        reasoning: '基于物料的高风险评级，建议冻结相关库存以防止潜在的质量问题影响生产。',
        suggestedActions: [
          { action: '冻结所有相关批次库存', expectedOutcome: '防止不合格物料进入生产流程' },
          { action: '通知相关部门和供应商', expectedOutcome: '协调解决方案并启动替代计划' }
        ],
        historicalSuccess: { implementationCount: 24, successRate: 0.92 }
      }
    });
    
    this.rules.push({
      context: { riskLevel: 'medium' },
      recommendation: {
        type: 'inventory_action',
        priority: 'medium',
        description: '增加中风险物料抽检频率',
        reasoning: '物料风险等级为中等，建议增加抽检频率以监控物料质量状况。',
        suggestedActions: [
          { action: '将抽检比例从标准的3%提高到8%', expectedOutcome: '及早发现潜在质量问题' },
          { action: '针对关键参数进行重点检测', expectedOutcome: '确保产品核心性能不受影响' }
        ],
        historicalSuccess: { implementationCount: 56, successRate: 0.85 }
      }
    });
    
    // 检验推荐规则
    this.rules.push({
      context: { testResult: 'fail' },
      recommendation: {
        type: 'inspection',
        priority: 'high',
        description: '失败测试项目复检与根因分析',
        reasoning: '测试结果显示失败项目，需要确认测试结果准确性并找出根本原因。',
        suggestedActions: [
          { action: '对失败项目进行复检', expectedOutcome: '验证测试结果准确性' },
          { action: '进行根因分析', expectedOutcome: '识别问题源头并制定解决方案' },
          { action: '评估对相关批次的影响', expectedOutcome: '确定问题范围和严重程度' }
        ]
      }
    });
    
    // 生产变更推荐规则
    this.rules.push({
      context: { anomalyType: 'frequent_anomalies' },
      recommendation: {
        type: 'production_change',
        priority: 'medium',
        description: '产线工艺参数优化',
        reasoning: '频繁出现的异常可能与产线工艺参数设置不合理有关。',
        suggestedActions: [
          { action: '分析工艺参数与异常的相关性', expectedOutcome: '识别关键影响因素' },
          { action: '小批量试产不同参数组合', expectedOutcome: '确定最优参数设置' },
          { action: '更新工艺规范文件', expectedOutcome: '标准化最佳实践' }
        ]
      }
    });
    
    // 供应商行动推荐规则
    this.rules.push({
      context: { anomalyType: 'critical_test_item_failure' },
      recommendation: {
        type: 'supplier_action',
        priority: 'critical',
        description: '要求供应商提交改进计划',
        reasoning: '关键测试项目失败表明供应商质量控制存在严重问题。',
        suggestedActions: [
          { action: '要求供应商提交详细的纠正预防措施报告', expectedOutcome: '确保问题得到系统性解决' },
          { action: '安排供应商质量审核', expectedOutcome: '验证供应商质量管理体系有效性' },
          { action: '评估替代供应商可行性', expectedOutcome: '降低供应链风险' }
        ]
      }
    });
  }
  
  /**
   * 生成推荐
   * @param context 推荐上下文
   * @returns 推荐列表
   */
  async generateRecommendations(context: {
    materialCode?: string,
    batchNumber?: string,
    anomalyId?: string,
    testId?: string,
    inventory?: InventoryItem,
    anomaly?: ProductionAnomaly,
    test?: LabTest,
    riskLevel?: RiskLevel
  }): Promise<Recommendation[]> {
    // 扩展上下文信息
    const expandedContext = {
      materialCode: context.materialCode,
      batchNumber: context.batchNumber,
      riskLevel: context.riskLevel || (context.inventory?.riskLevel || 'low'),
      anomalyType: context.anomaly?.anomalyType,
      testResult: context.test?.overallResult === 'fail' ? 'fail' as const : 'pass' as const
    };
    
    // 匹配适用的推荐规则
    const matchedRules = this.findMatchingRules(expandedContext);
    
    // 转换为推荐对象并添加唯一标识
    const recommendations = matchedRules.map(rule => ({
      id: generateId(),
      ...rule.recommendation
    }));
    
    // 对推荐进行排序（优先级高的在前）
    return this.prioritizeRecommendations(recommendations);
  }
  
  /**
   * 查找匹配的推荐规则
   */
  private findMatchingRules(expandedContext: {
    materialCode?: string,
    batchNumber?: string,
    riskLevel?: RiskLevel,
    anomalyType?: string,
    testResult?: 'pass' | 'fail'
  }) {
    return this.rules.filter(rule => {
      // 检查规则上下文是否匹配
      for (const [key, value] of Object.entries(rule.context)) {
        const contextKey = key as keyof typeof rule.context;
        if (value !== undefined && expandedContext[contextKey] !== value) {
          return false;
        }
      }
      return true;
    });
  }
  
  /**
   * 对推荐进行优先级排序
   */
  private prioritizeRecommendations(recommendations: Recommendation[]): Recommendation[] {
    const priorityMap: Record<Severity, number> = {
      'critical': 4,
      'high': 3,
      'medium': 2,
      'low': 1
    };
    
    return recommendations.sort((a, b) => {
      // 首先按优先级排序
      const priorityDiff = priorityMap[b.priority] - priorityMap[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // 如果优先级相同，考虑历史成功率
      const aSuccessRate = a.historicalSuccess?.successRate || 0;
      const bSuccessRate = b.historicalSuccess?.successRate || 0;
      return bSuccessRate - aSuccessRate;
    });
  }
  
  /**
   * 记录推荐结果反馈
   * @param recommendationId 推荐ID
   * @param wasImplemented 是否实施
   * @param outcome 结果
   * @param notes 备注
   */
  async trackRecommendationOutcome(
    recommendationId: string,
    wasImplemented: boolean,
    outcome?: 'positive' | 'neutral' | 'negative',
    notes?: string
  ): Promise<void> {
    // 在实际应用中，这里应该将结果保存到数据库
    // 简化版只在内存中保存
    if (!this.recommendationHistory.has(recommendationId)) {
      console.warn(`推荐ID不存在: ${recommendationId}`);
      return;
    }
    
    const historyEntry = this.recommendationHistory.get(recommendationId)!;
    historyEntry.implemented = wasImplemented;
    historyEntry.outcome = outcome;
    
    // 更新历史成功率
    if (wasImplemented && outcome) {
      const recommendation = historyEntry.recommendation;
      const history = recommendation.historicalSuccess || { implementationCount: 0, successRate: 0 };
      
      // 更新实施次数
      history.implementationCount += 1;
      
      // 更新成功率
      const successValue = outcome === 'positive' ? 1 : (outcome === 'neutral' ? 0.5 : 0);
      history.successRate = (history.successRate * (history.implementationCount - 1) + successValue) / history.implementationCount;
      
      recommendation.historicalSuccess = history;
    }
    
    console.log(`推荐反馈已记录: ${recommendationId}, 实施: ${wasImplemented}, 结果: ${outcome}`);
  }
  
  /**
   * 根据特定物料批次获取推荐
   * @param materialCode 物料编码
   * @param batchNumber 批次号
   */
  async getRecommendationsForMaterial(materialCode: string, batchNumber: string): Promise<Recommendation[]> {
    return this.generateRecommendations({ materialCode, batchNumber });
  }
  
  /**
   * 获取最常用推荐
   * @param limit 数量限制
   */
  async getTopRecommendations(limit: number = 5): Promise<Recommendation[]> {
    // 在实际应用中，这里应该从数据库中获取最常使用的推荐
    // 简化版返回固定的高优先级推荐
    const allRecommendations = await Promise.all(
      this.rules
        .filter(rule => rule.recommendation.priority === 'high' || rule.recommendation.priority === 'critical')
        .map(rule => ({
          id: generateId(),
          ...rule.recommendation
        }))
    );
    
    return this.prioritizeRecommendations(allRecommendations).slice(0, limit);
  }
} 