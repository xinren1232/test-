/**
 * 增强的智能问答API
 * 集成动态卡片生成功能
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
  database: 'iqe_inspection',
  charset: 'utf8mb4',
  timezone: '+08:00'
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

// 生成动态统计卡片
async function generateScenarioCards(scenarioType, queryData = null) {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    let cards = [];
    
    if (scenarioType === 'inventory') {
      // 库存场景卡片
      const [materialStats] = await connection.execute(`
        SELECT 
          COUNT(DISTINCT material_name) as 物料种类,
          COUNT(DISTINCT batch_code) as 批次数量
        FROM inventory
      `);
      
      const [supplierStats] = await connection.execute(`
        SELECT COUNT(DISTINCT supplier_name) as 供应商数量 FROM inventory
      `);
      
      const [riskStats] = await connection.execute(`
        SELECT COUNT(*) as 风险库存数量, COALESCE(SUM(quantity), 0) as 风险库存总量
        FROM inventory WHERE status = '风险'
      `);
      
      const [frozenStats] = await connection.execute(`
        SELECT COUNT(*) as 冻结库存数量, COALESCE(SUM(quantity), 0) as 冻结库存总量
        FROM inventory WHERE status = '冻结'
      `);
      
      cards = [
        {
          title: '物料/批次',
          value: materialStats[0].物料种类,
          subtitle: `${materialStats[0].批次数量}个批次`,
          type: 'info',
          icon: '📦',
          color: '#409EFF'
        },
        {
          title: '供应商',
          value: supplierStats[0].供应商数量,
          subtitle: '数量统计',
          type: 'success',
          icon: '🏢',
          color: '#67C23A'
        },
        {
          title: '风险库存',
          value: riskStats[0].风险库存数量,
          subtitle: `${riskStats[0].风险库存总量}件`,
          type: 'warning',
          icon: '⚠️',
          color: '#E6A23C'
        },
        {
          title: '冻结库存',
          value: frozenStats[0].冻结库存数量,
          subtitle: `${frozenStats[0].冻结库存总量}件`,
          type: 'danger',
          icon: '🔒',
          color: '#F56C6C'
        }
      ];
      
    } else if (scenarioType === 'online') {
      // 上线场景卡片
      const [materialStats] = await connection.execute(`
        SELECT 
          COUNT(DISTINCT material_name) as 物料种类,
          COUNT(DISTINCT batch_code) as 批次数量
        FROM online_tracking
      `);
      
      const [projectStats] = await connection.execute(`
        SELECT 
          COUNT(DISTINCT project) as 项目数量,
          COUNT(DISTINCT baseline) as 基线数量
        FROM online_tracking
      `);
      
      const [supplierStats] = await connection.execute(`
        SELECT COUNT(DISTINCT supplier_name) as 供应商数量 FROM online_tracking
      `);
      
      const [defectStats] = await connection.execute(`
        SELECT 
          SUM(CASE WHEN defect_rate <= 0.03 THEN 1 ELSE 0 END) as 标准内,
          SUM(CASE WHEN defect_rate > 0.03 THEN 1 ELSE 0 END) as 标准外
        FROM online_tracking WHERE defect_rate IS NOT NULL
      `);
      
      cards = [
        {
          title: '物料/批次',
          value: materialStats[0].物料种类 || 0,
          subtitle: `${materialStats[0].批次数量 || 0}个批次`,
          type: 'info',
          icon: '📦',
          color: '#409EFF'
        },
        {
          title: '项目',
          value: projectStats[0].项目数量 || 0,
          subtitle: `${projectStats[0].基线数量 || 0}个基线`,
          type: 'primary',
          icon: '🎯',
          color: '#606266'
        },
        {
          title: '供应商',
          value: supplierStats[0].供应商数量 || 0,
          subtitle: '数量统计',
          type: 'success',
          icon: '🏢',
          color: '#67C23A'
        },
        {
          title: '不良分析',
          value: defectStats[0].标准外 || 0,
          subtitle: `标准内${defectStats[0].标准内 || 0}个`,
          type: (defectStats[0].标准外 || 0) > 0 ? 'warning' : 'success',
          icon: '📊',
          color: (defectStats[0].标准外 || 0) > 0 ? '#E6A23C' : '#67C23A'
        }
      ];
      
    } else if (scenarioType === 'testing') {
      // 测试场景卡片
      const [materialStats] = await connection.execute(`
        SELECT 
          COUNT(DISTINCT material_name) as 物料种类,
          COUNT(DISTINCT batch_code) as 批次数量
        FROM lab_tests
      `);
      
      const [projectStats] = await connection.execute(`
        SELECT 
          COUNT(DISTINCT project_id) as 项目数量,
          COUNT(DISTINCT baseline_id) as 基线数量
        FROM lab_tests WHERE project_id IS NOT NULL
      `);
      
      const [supplierStats] = await connection.execute(`
        SELECT COUNT(DISTINCT supplier_name) as 供应商数量 FROM lab_tests
      `);
      
      const [ngStats] = await connection.execute(`
        SELECT 
          COUNT(DISTINCT batch_code) as NG批次数量,
          COUNT(*) as NG测试次数
        FROM lab_tests WHERE test_result = 'FAIL' OR conclusion = 'NG'
      `);
      
      cards = [
        {
          title: '物料/批次',
          value: materialStats[0].物料种类 || 0,
          subtitle: `${materialStats[0].批次数量 || 0}个批次`,
          type: 'info',
          icon: '📦',
          color: '#409EFF'
        },
        {
          title: '项目',
          value: projectStats[0].项目数量 || 0,
          subtitle: `${projectStats[0].基线数量 || 0}个基线`,
          type: 'primary',
          icon: '🎯',
          color: '#606266'
        },
        {
          title: '供应商',
          value: supplierStats[0].供应商数量 || 0,
          subtitle: '数量统计',
          type: 'success',
          icon: '🏢',
          color: '#67C23A'
        },
        {
          title: 'NG批次',
          value: ngStats[0].NG批次数量 || 0,
          subtitle: `${ngStats[0].NG测试次数 || 0}次NG`,
          type: (ngStats[0].NG批次数量 || 0) > 0 ? 'danger' : 'success',
          icon: '❌',
          color: (ngStats[0].NG批次数量 || 0) > 0 ? '#F56C6C' : '#67C23A'
        }
      ];
    }
    
    return cards;
    
  } finally {
    await connection.end();
  }
}

// 智能问答API
app.post('/api/intelligent-qa/ask', async (req, res) => {
  try {
    const { question } = req.body;
    console.log(`🤖 收到问答请求: "${question}"`);
    
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      // 1. 查找匹配的规则
      const [matchedRules] = await connection.execute(`
        SELECT 
          id,
          intent_name,
          description,
          action_target,
          trigger_words
        FROM nlp_intent_rules 
        WHERE status = 'active'
        AND JSON_SEARCH(trigger_words, 'one', '%${question.split(' ')[1] || question}%') IS NOT NULL
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
      
      // 3. 识别场景类型并生成卡片
      const scenarioType = identifyScenarioType(question, matchedRule.intent_name);
      const cards = await generateScenarioCards(scenarioType, queryResults);
      
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
          scenarioType: scenarioType,
          dataCount: queryResults.length,
          matchedRule: matchedRule.intent_name,
          queryData: queryResults,
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
    service: 'enhanced-intelligent-qa-api'
  });
});

app.listen(port, () => {
  console.log(`🚀 增强智能问答API服务启动在端口 ${port}`);
  console.log(`📋 支持的功能:`);
  console.log(`- 动态场景识别`);
  console.log(`- 统计卡片生成`);
  console.log(`- 无数据限制查询`);
  console.log(`- 真实数据展示`);
});
