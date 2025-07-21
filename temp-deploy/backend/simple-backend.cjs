// 简化版后端服务 - 使用CommonJS
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3001;

// 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 中间件
app.use(cors());
app.use(express.json());

// 测试数据库连接
async function testDatabase() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
}

// 健康检查API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '后端服务运行正常',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// 获取规则列表API
app.get('/api/rules', async (req, res) => {
  try {
    console.log('📋 收到规则列表请求');
    
    const connection = await mysql.createConnection(dbConfig);
    const [rules] = await connection.execute(`
      SELECT
        id,
        intent_name,
        description,
        action_type,
        action_target,
        parameters,
        trigger_words,
        synonyms,
        example_query,
        category,
        priority,
        sort_order,
        status,
        created_at,
        updated_at
      FROM nlp_intent_rules
      WHERE status = 'active'
      ORDER BY priority DESC, id ASC
    `);
    
    await connection.end();
    
    console.log(`✅ 返回 ${rules.length} 条规则`);
    
    res.json({
      success: true,
      data: rules,
      total: rules.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ 获取规则失败:', error.message);
    res.status(500).json({
      success: false,
      message: '获取规则失败',
      error: error.message
    });
  }
});

// 智能查询API
app.post('/api/assistant/query', async (req, res) => {
  try {
    const { query, context } = req.body;
    console.log('🤖 收到智能查询请求:', { query, context });

    if (!query) {
      return res.status(400).json({
        success: false,
        error: '缺少查询内容'
      });
    }

    let connection;
    let tableData = [];
    let cards = [];
    let matchedRule = '';
    
    try {
      connection = await mysql.createConnection(dbConfig);
      
      // 1. 根据查询内容匹配规则
      console.log('🔍 开始匹配查询:', `"${query}"`);
      
      const [rules] = await connection.execute(`
        SELECT id, intent_name, action_target, trigger_words
        FROM nlp_intent_rules 
        WHERE status = 'active'
        ORDER BY priority DESC
      `);

      let selectedRule = null;
      
      // 简单的关键词匹配
      for (const rule of rules) {
        let triggerWords = [];
        try {
          if (rule.trigger_words) {
            triggerWords = JSON.parse(rule.trigger_words);
          }
        } catch (e) {
          triggerWords = [rule.trigger_words];
        }
        
        const isMatch = triggerWords.some(word => 
          query.includes(word) || word.includes(query)
        );
        
        if (isMatch) {
          selectedRule = rule;
          matchedRule = rule.intent_name;
          console.log(`✅ 匹配到规则: ${rule.intent_name}`);
          break;
        }
      }

      // 2. 执行查询
      if (selectedRule && selectedRule.action_target) {
        try {
          console.log('📊 执行SQL查询...');
          const [results] = await connection.execute(selectedRule.action_target);
          tableData = results;
          console.log(`📦 查询返回 ${tableData.length} 条数据`);
        } catch (sqlError) {
          console.error('❌ SQL执行失败:', sqlError.message);
          tableData = [];
        }
      } else {
        console.log('⚠️ 未找到匹配规则，使用默认查询');
        matchedRule = '默认库存查询';
        
        try {
          const [results] = await connection.execute(`
            SELECT 
              material_name as 物料名称,
              supplier_name as 供应商,
              CAST(quantity AS CHAR) as 数量,
              status as 状态
            FROM inventory 
            WHERE status = '正常'
            LIMIT 50
          `);
          tableData = results;
        } catch (sqlError) {
          console.error('❌ 默认查询失败:', sqlError.message);
          tableData = [];
        }
      }

      // 3. 生成统计卡片
      if (tableData.length > 0) {
        cards = [
          {
            title: '数据总数',
            value: tableData.length.toString(),
            icon: '📊',
            color: 'primary'
          },
          {
            title: '匹配规则',
            value: matchedRule,
            icon: '🎯',
            color: 'success'
          }
        ];
      }

      await connection.end();

    } catch (error) {
      console.error('❌ 查询处理失败:', error);
      if (connection) await connection.end();
      
      return res.status(500).json({
        success: false,
        message: '查询处理失败',
        error: error.message
      });
    }

    console.log('✅ 智能查询处理完成');

    res.json({
      success: true,
      data: {
        tableData,
        cards
      },
      matchedRule,
      query,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 智能查询失败:', error);
    res.status(500).json({
      success: false,
      message: '智能查询失败',
      error: error.message
    });
  }
});

// 启动服务器
async function startServer() {
  try {
    console.log('🚀 启动后端服务...');
    
    // 测试数据库连接
    const dbConnected = await testDatabase();
    if (!dbConnected) {
      console.error('❌ 数据库连接失败，服务启动中止');
      process.exit(1);
    }
    
    app.listen(PORT, () => {
      console.log(`✅ 后端服务已启动，端口: ${PORT}`);
      console.log(`📚 健康检查: http://localhost:${PORT}/api/health`);
      console.log(`📋 规则接口: http://localhost:${PORT}/api/rules`);
      console.log(`🤖 查询接口: http://localhost:${PORT}/api/assistant/query`);
    });
  } catch (error) {
    console.error('❌ 启动服务失败:', error);
    process.exit(1);
  }
}

startServer();
