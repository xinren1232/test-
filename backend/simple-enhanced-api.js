/**
 * 简化的增强智能问答API
 */

import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
const port = 3002;

app.use(cors());
app.use(express.json());

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 识别查询场景类型
function identifyScenarioType(query, ruleName) {
  const queryLower = query.toLowerCase();
  const ruleNameLower = ruleName.toLowerCase();
  
  if (queryLower.includes('库存') || ruleNameLower.includes('库存')) {
    return 'inventory';
  }
  
  if (queryLower.includes('上线') || ruleNameLower.includes('上线') ||
      queryLower.includes('跟踪') || ruleNameLower.includes('跟踪')) {
    return 'online';
  }
  
  if (queryLower.includes('测试') || ruleNameLower.includes('测试') ||
      queryLower.includes('ng') || ruleNameLower.includes('ng')) {
    return 'testing';
  }
  
  return 'general';
}

// 基于查询结果生成库存场景卡片
function generateInventoryCards(queryResults) {
  if (!queryResults || queryResults.length === 0) {
    return [];
  }

  // 从查询结果中统计数据
  const materialTypes = new Set();
  const batchCodes = new Set();
  const suppliers = new Set();
  let riskCount = 0;
  let frozenCount = 0;

  queryResults.forEach(item => {
    if (item.material_name || item.物料名称) {
      materialTypes.add(item.material_name || item.物料名称);
    }
    if (item.batch_code || item.批次号) {
      batchCodes.add(item.batch_code || item.批次号);
    }
    if (item.supplier_name || item.供应商) {
      suppliers.add(item.supplier_name || item.供应商);
    }
    if ((item.status || item.状态) === '风险') {
      riskCount++;
    }
    if ((item.status || item.状态) === '冻结') {
      frozenCount++;
    }
  });

  return [
    {
      title: '物料/批次',
      value: materialTypes.size,
      subtitle: `${batchCodes.size}个批次`,
      type: 'info',
      icon: '📦',
      color: '#409EFF',
      // 添加分开显示的数据结构
      splitData: {
        material: {
          label: '物料',
          value: materialTypes.size,
          unit: '种'
        },
        batch: {
          label: '批次',
          value: batchCodes.size,
          unit: '个'
        }
      }
    },
    {
      title: '供应商',
      value: `${suppliers.size}个`,
      subtitle: '',
      type: 'success',
      icon: '🏢',
      color: '#67C23A'
    },
    {
      title: '风险库存',
      value: `${riskCount}条`,
      subtitle: '',
      type: 'warning',
      icon: '⚠️',
      color: '#E6A23C'
    },
    {
      title: '冻结库存',
      value: `${frozenCount}条`,
      subtitle: '',
      type: 'danger',
      icon: '🔒',
      color: '#F56C6C'
    }
  ];
}

// 基于查询结果生成上线/生产场景卡片
function generateOnlineCards(queryResults) {
  if (!queryResults || queryResults.length === 0) {
    return [];
  }

  // 从查询结果中统计数据
  const materialTypes = new Set();
  const batchCodes = new Set();
  const suppliers = new Set();
  const projects = new Set();
  let standardCount = 0; // 不良率 <= 3%
  let overStandardCount = 0; // 不良率 > 3%

  queryResults.forEach(item => {
    if (item.material_name || item.物料名称) {
      materialTypes.add(item.material_name || item.物料名称);
    }
    if (item.batch_code || item.批次号) {
      batchCodes.add(item.batch_code || item.批次号);
    }
    if (item.supplier_name || item.供应商) {
      suppliers.add(item.supplier_name || item.供应商);
    }
    if (item.project_id || item.项目) {
      projects.add(item.project_id || item.项目);
    }

    // 不良率统计 (3%为分界)
    const defectRate = parseFloat(item.defect_rate || item.不良率 || 0);
    if (defectRate <= 3) {
      standardCount++;
    } else {
      overStandardCount++;
    }
  });

  return [
    {
      title: '物料/批次',
      value: materialTypes.size,
      subtitle: `${batchCodes.size}个批次`,
      type: 'info',
      icon: '📦',
      color: '#409EFF',
      // 添加分开显示的数据结构
      splitData: {
        material: {
          label: '物料',
          value: materialTypes.size,
          unit: '种'
        },
        batch: {
          label: '批次',
          value: batchCodes.size,
          unit: '个'
        }
      }
    },
    {
      title: '项目',
      value: `${projects.size}个`,
      subtitle: '',
      type: 'primary',
      icon: '🎯',
      color: '#606266'
    },
    {
      title: '供应商',
      value: `${suppliers.size}个`,
      subtitle: '',
      type: 'success',
      icon: '🏢',
      color: '#67C23A'
    },
    {
      title: '不良分析',
      value: `${standardCount}/${overStandardCount}`,
      subtitle: '(3%分界)',
      type: overStandardCount > standardCount ? 'danger' : 'success',
      icon: overStandardCount > standardCount ? '📈' : '📉',
      color: overStandardCount > standardCount ? '#F56C6C' : '#67C23A'
    }
  ];
}

// 基于查询结果生成测试场景卡片
function generateTestingCards(queryResults) {
  if (!queryResults || queryResults.length === 0) {
    return [];
  }

  // 从查询结果中统计数据
  const materialTypes = new Set();
  const batchCodes = new Set();
  const suppliers = new Set();
  const projects = new Set();
  let ngBatchCount = 0;

  queryResults.forEach(item => {
    if (item.material_name || item.物料名称) {
      materialTypes.add(item.material_name || item.物料名称);
    }
    if (item.batch_code || item.批次号) {
      batchCodes.add(item.batch_code || item.批次号);
    }
    if (item.supplier_name || item.供应商) {
      suppliers.add(item.supplier_name || item.供应商);
    }
    if (item.project_id || item.项目) {
      projects.add(item.project_id || item.项目);
    }

    // NG批次统计
    const testResult = item.test_result || item.测试结果 || item.conclusion || '';
    if (testResult === 'FAIL' || testResult === 'NG' || testResult.includes('NG')) {
      ngBatchCount++;
    }
  });

  return [
    {
      title: '物料/批次',
      value: materialTypes.size,
      subtitle: `${batchCodes.size}个批次`,
      type: 'info',
      icon: '📦',
      color: '#409EFF',
      // 添加分开显示的数据结构
      splitData: {
        material: {
          label: '物料',
          value: materialTypes.size,
          unit: '种'
        },
        batch: {
          label: '批次',
          value: batchCodes.size,
          unit: '个'
        }
      }
    },
    {
      title: '项目',
      value: `${projects.size}个`,
      subtitle: '',
      type: 'primary',
      icon: '🎯',
      color: '#606266'
    },
    {
      title: '供应商',
      value: `${suppliers.size}个`,
      subtitle: '',
      type: 'success',
      icon: '🏢',
      color: '#67C23A'
    },
    {
      title: 'NG批次',
      value: `${ngBatchCount}个`,
      subtitle: '',
      type: ngBatchCount > 0 ? 'danger' : 'success',
      icon: ngBatchCount > 0 ? '❌' : '✅',
      color: ngBatchCount > 0 ? '#F56C6C' : '#67C23A'
    }
  ];
}

// 智能问答API
app.post('/api/intelligent-qa/ask', async (req, res) => {
  try {
    const { question } = req.body;
    console.log(`🤖 收到问答请求: "${question}"`);
    
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      // 1. 查找匹配的规则 - 改进关键词匹配逻辑
      const [matchedRules] = await connection.execute(`
        SELECT
          id,
          intent_name,
          description,
          action_target,
          trigger_words
        FROM nlp_intent_rules
        WHERE status = 'active'
        AND (
          intent_name LIKE '%${question}%' OR
          trigger_words LIKE '%${question}%' OR
          trigger_words LIKE '%上线%' AND '${question}' LIKE '%上线%' OR
          trigger_words LIKE '%测试%' AND '${question}' LIKE '%测试%' OR
          trigger_words LIKE '%库存%' AND '${question}' LIKE '%库存%'
        )
        ORDER BY priority ASC
        LIMIT 1
      `);
      
      if (matchedRules.length === 0) {
        return res.json({
          success: false,
          data: {
            question: question,
            answer: '抱歉，我无法理解您的问题。请尝试使用更具体的描述。',
            cards: [],
            scenarioType: 'unknown'
          }
        });
      }
      
      const matchedRule = matchedRules[0];
      console.log(`🎯 匹配到规则: ${matchedRule.intent_name}`);
      
      // 2. 执行SQL查询
      const [queryResults] = await connection.execute(matchedRule.action_target);
      console.log(`📊 查询结果: ${queryResults.length} 条记录`);
      
      // 3. 识别场景类型并生成基于查询结果的卡片
      const scenarioType = identifyScenarioType(question, matchedRule.intent_name);
      let cards = [];

      if (scenarioType === 'inventory') {
        cards = generateInventoryCards(queryResults);
      } else if (scenarioType === 'online') {
        cards = generateOnlineCards(queryResults);
      } else if (scenarioType === 'testing') {
        cards = generateTestingCards(queryResults);
      }
      
      // 4. 格式化回答
      let answer = `📋 **${matchedRule.description}**\n\n`;
      
      if (queryResults.length > 0) {
        answer += `查询到 ${queryResults.length} 条相关记录：\n\n`;
        
        // 显示前5条记录作为示例
        const sampleResults = queryResults.slice(0, 5);
        sampleResults.forEach((record, index) => {
          const fields = Object.entries(record).slice(0, 4);
          const summary = fields.map(([key, value]) => `${key}: ${value}`).join(', ');
          answer += `${index + 1}. ${summary}\n`;
        });
        
        if (queryResults.length > 5) {
          answer += `\n... 还有 ${queryResults.length - 5} 条记录\n`;
        }
      } else {
        answer += '未找到符合条件的记录。';
      }
      
      answer += `\n\n*数据来源: 真实数据库查询*`;
      
      res.json({
        success: true,
        data: {
          question: question,
          answer: answer,
          cards: cards,
          tableData: queryResults, // 添加完整的查询结果数据
          scenarioType: scenarioType,
          dataCount: queryResults.length,
          matchedRule: matchedRule.intent_name,
          timestamp: new Date().toISOString()
        }
      });
      
    } finally {
      await connection.end();
    }
    
  } catch (error) {
    console.error('❌ 智能问答API错误:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      data: {
        question: req.body.question || '',
        answer: '抱歉，系统暂时无法处理您的问题，请稍后再试。',
        cards: [],
        scenarioType: 'error'
      }
    });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'simple-enhanced-intelligent-qa-api'
  });
});

app.listen(port, () => {
  console.log(`🚀 简化增强智能问答API服务启动在端口 ${port}`);
  console.log(`📋 支持的功能:`);
  console.log(`- 动态场景识别`);
  console.log(`- 统计卡片生成`);
  console.log(`- 无数据限制查询`);
  console.log(`- 真实数据展示`);
});
