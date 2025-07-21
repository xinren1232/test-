/**
 * 智能问题识别工具
 * 基于规则库和数据范围进行问题意图识别
 */

// 数据范围定义（与后端保持一致）
export const DATA_SCOPE = {
  materialCategories: ['结构件类', '光学类', '充电类', '声学类', '包料类'],
  suppliers: [
    '聚龙', 'BOE', '天马', '华星', '歌尔', '东声', '欣冠', '广正', 
    '丽德宝', '富群', '奥海', '风华', '维科', '天实', '怡同', '深奥', 
    '理威', '瑞声', '百佳达', '盛泰', '辉阳'
  ],
  factories: ['深圳工厂', '重庆工厂', '南昌工厂', '宜宾工厂'],
  materials: [
    '电池盖', '中框', '手机卡托', '侧键', '装饰件', 'LCD显示屏', 
    'OLED显示屏', '摄像头(CAM)', '电池', '充电器', '喇叭', '听筒', 
    '保护套', '标签', '包装盒'
  ],
  projects: ['I6789', 'I6788', 'I6787'],
  baselines: [
    'X6827', 'S665LN', 'KI4K', 'X6828', 'X6831', 'KI5K', 'KI3K', 
    'S662LN', 'S663LN', 'S664LN'
  ],
  scenarios: [
    { name: '库存场景', keywords: ['库存', '查询', '物料', '仓库', '存储'] },
    { name: '测试场景', keywords: ['测试', '检测', 'ng', '不合格', '合格率', '质量'] },
    { name: '上线场景', keywords: ['上线', '跟踪', '生产', '产线', '工厂'] },
    { name: '批次场景', keywords: ['批次', '批号', 'batch'] },
    { name: '对比场景', keywords: ['对比', '比较', '分析', '排行', '排名'] },
    { name: '综合场景', keywords: ['综合', '汇总', '统计', '总结'] }
  ]
};

/**
 * 智能问题识别函数
 * @param {string} question - 用户问题
 * @returns {Object} 识别结果
 */
export function recognizeQueryIntent(question) {
  const analysis = {
    question: question,
    recognizedEntities: {
      materialCategory: null,
      supplier: null,
      factory: null,
      material: null,
      project: null,
      baseline: null,
      scenario: null
    },
    confidence: 0,
    suggestedRules: [],
    queryType: 'unknown'
  };

  if (!question || typeof question !== 'string') {
    return analysis;
  }

  const lowerQuestion = question.toLowerCase();

  // 识别物料类别
  for (const category of DATA_SCOPE.materialCategories) {
    if (lowerQuestion.includes(category.toLowerCase())) {
      analysis.recognizedEntities.materialCategory = category;
      analysis.confidence += 0.2;
      break;
    }
  }

  // 识别供应商
  for (const supplier of DATA_SCOPE.suppliers) {
    if (lowerQuestion.includes(supplier.toLowerCase())) {
      analysis.recognizedEntities.supplier = supplier;
      analysis.confidence += 0.2;
      break;
    }
  }

  // 识别工厂
  for (const factory of DATA_SCOPE.factories) {
    if (lowerQuestion.includes(factory.toLowerCase())) {
      analysis.recognizedEntities.factory = factory;
      analysis.confidence += 0.15;
      break;
    }
  }

  // 识别具体物料
  for (const material of DATA_SCOPE.materials) {
    if (lowerQuestion.includes(material.toLowerCase())) {
      analysis.recognizedEntities.material = material;
      analysis.confidence += 0.15;
      break;
    }
  }

  // 识别项目
  for (const project of DATA_SCOPE.projects) {
    if (lowerQuestion.includes(project.toLowerCase())) {
      analysis.recognizedEntities.project = project;
      analysis.confidence += 0.1;
      break;
    }
  }

  // 识别基线
  for (const baseline of DATA_SCOPE.baselines) {
    if (lowerQuestion.includes(baseline.toLowerCase())) {
      analysis.recognizedEntities.baseline = baseline;
      analysis.confidence += 0.1;
      break;
    }
  }

  // 识别场景类型
  for (const scenario of DATA_SCOPE.scenarios) {
    for (const keyword of scenario.keywords) {
      if (lowerQuestion.includes(keyword.toLowerCase())) {
        analysis.recognizedEntities.scenario = scenario.name;
        analysis.confidence += 0.1;
        break;
      }
    }
    if (analysis.recognizedEntities.scenario) break;
  }

  // 确定查询类型
  if (analysis.recognizedEntities.scenario) {
    analysis.queryType = analysis.recognizedEntities.scenario;
  } else if (analysis.recognizedEntities.supplier || analysis.recognizedEntities.materialCategory) {
    analysis.queryType = '库存场景'; // 默认为库存查询
  }

  return analysis;
}

/**
 * 生成智能建议
 * @param {Object} analysis - 识别分析结果
 * @returns {Array} 建议列表
 */
export function generateSuggestions(analysis) {
  const suggestions = [];
  const entities = analysis.recognizedEntities;

  // 基于识别的实体生成建议
  if (entities.supplier) {
    suggestions.push(`查询${entities.supplier}供应商库存`);
    suggestions.push(`查询${entities.supplier}供应商测试情况`);
    suggestions.push(`查询${entities.supplier}供应商上线情况`);
  }

  if (entities.materialCategory) {
    suggestions.push(`查询${entities.materialCategory}库存`);
    suggestions.push(`查询${entities.materialCategory}测试情况`);
    suggestions.push(`查询${entities.materialCategory}上线情况`);
  }

  if (entities.material) {
    suggestions.push(`查询${entities.material}库存`);
    suggestions.push(`查询${entities.material}测试结果`);
  }

  if (entities.factory) {
    suggestions.push(`查询${entities.factory}库存情况`);
    suggestions.push(`查询${entities.factory}生产记录`);
  }

  // 基于场景生成建议
  if (entities.scenario === '对比场景') {
    suggestions.push('供应商对比分析');
    suggestions.push('物料大类别质量对比');
  }

  return [...new Set(suggestions)]; // 去重
}

/**
 * 匹配规则库
 * @param {Object} analysis - 识别分析结果
 * @param {Array} rulesLibrary - 规则库
 * @returns {Array} 匹配的规则
 */
export function matchRules(analysis, rulesLibrary) {
  const matchedRules = [];
  const entities = analysis.recognizedEntities;

  // 遍历规则库
  for (const [category, rules] of Object.entries(rulesLibrary)) {
    for (const rule of rules) {
      let score = 0;

      // 场景匹配
      if (entities.scenario && rule.category === entities.scenario) {
        score += 0.5;
      }

      // 触发词匹配
      if (rule.trigger_words && Array.isArray(rule.trigger_words)) {
        for (const trigger of rule.trigger_words) {
          if (analysis.question.toLowerCase().includes(trigger.toLowerCase())) {
            score += 0.3;
            break;
          }
        }
      }

      // 实体匹配
      if (entities.supplier && rule.intent_name.includes(entities.supplier)) {
        score += 0.2;
      }
      if (entities.materialCategory && rule.intent_name.includes(entities.materialCategory)) {
        score += 0.2;
      }
      if (entities.material && rule.intent_name.includes(entities.material)) {
        score += 0.2;
      }

      if (score > 0.3) { // 阈值过滤
        matchedRules.push({
          ...rule,
          matchScore: score
        });
      }
    }
  }

  // 按匹配分数排序
  return matchedRules.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
}

/**
 * 格式化识别结果
 * @param {Object} analysis - 识别分析结果
 * @returns {string} 格式化的结果描述
 */
export function formatAnalysisResult(analysis) {
  const entities = analysis.recognizedEntities;
  const parts = [];

  if (entities.scenario) {
    parts.push(`场景: ${entities.scenario}`);
  }
  if (entities.supplier) {
    parts.push(`供应商: ${entities.supplier}`);
  }
  if (entities.materialCategory) {
    parts.push(`物料类别: ${entities.materialCategory}`);
  }
  if (entities.material) {
    parts.push(`具体物料: ${entities.material}`);
  }
  if (entities.factory) {
    parts.push(`工厂: ${entities.factory}`);
  }

  const confidenceText = `置信度: ${(analysis.confidence * 100).toFixed(1)}%`;
  
  if (parts.length === 0) {
    return `未识别到明确实体，${confidenceText}`;
  }

  return `识别结果: ${parts.join(', ')}，${confidenceText}`;
}

/**
 * 检查问题复杂度
 * @param {string} question - 用户问题
 * @returns {Object} 复杂度分析
 */
export function analyzeComplexity(question) {
  const analysis = recognizeQueryIntent(question);
  const entityCount = Object.values(analysis.recognizedEntities).filter(v => v !== null).length;
  
  let complexity = 'simple';
  if (entityCount >= 3) {
    complexity = 'complex';
  } else if (entityCount >= 2) {
    complexity = 'medium';
  }

  return {
    complexity,
    entityCount,
    confidence: analysis.confidence,
    needsAdvancedProcessing: complexity === 'complex' || analysis.confidence < 0.3
  };
}

export default {
  DATA_SCOPE,
  recognizeQueryIntent,
  generateSuggestions,
  matchRules,
  formatAnalysisResult,
  analyzeComplexity
};
