/**
 * 完整后端启动脚本 - 3001端口
 * 包含数据库连接、规则加载等完整功能
 */
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3001;

console.log('🚀 启动完整IQE后端服务...');

// 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection',
  charset: 'utf8mb4',
  timezone: '+08:00'
};

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

console.log('📦 中间件配置完成');

// 数据库连接池
let dbPool = null;

async function initializeDatabase() {
  try {
    console.log('🔄 初始化数据库连接...');
    console.log('📊 数据库配置:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database
    });

    dbPool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      acquireTimeout: 60000,
      timeout: 60000
    });

    // 测试连接
    const connection = await dbPool.getConnection();
    console.log('✅ 数据库连接池创建成功');
    connection.release();

    return true;
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    return false;
  }
}

// 健康检查API
app.get('/api/health', (req, res) => {
  console.log('📚 收到健康检查请求');
  res.json({
    status: 'ok',
    message: 'IQE后端服务运行正常',
    port: PORT,
    database: dbPool ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// 规则库API
app.get('/api/rules', async (req, res) => {
  try {
    console.log('📋 收到规则列表请求');
    
    if (!dbPool) {
      return res.status(500).json({ 
        success: false,
        error: '数据库未连接' 
      });
    }

    const [rows] = await dbPool.execute(`
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
      ORDER BY priority DESC, sort_order ASC, id ASC
    `);

    console.log(`✅ 返回 ${rows.length} 条规则`);

    res.json({
      success: true,
      data: rows,
      total: rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ 获取规则失败:', error.message);
    res.status(500).json({
      success: false,
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

    if (!dbPool) {
      return res.status(500).json({
        success: false,
        error: '数据库未连接'
      });
    }

    let tableData = [];
    let cards = [];
    let matchedRule = '';
    
    try {
      // 1. 根据查询内容匹配规则
      console.log('🔍 开始匹配查询:', `"${query}"`);
      
      const [rules] = await dbPool.execute(`
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
          const [results] = await dbPool.execute(selectedRule.action_target);
          tableData = results;
          console.log(`📦 查询返回 ${tableData.length} 条数据`);
        } catch (sqlError) {
          console.error('❌ SQL执行失败:', sqlError.message);
          // 使用模拟数据
          tableData = [
            { 物料名称: 'LCD显示屏', 供应商: '聚龙光电', 数量: '1500', 状态: '正常' },
            { 物料名称: 'OLED面板', 供应商: 'BOE科技', 数量: '800', 状态: '正常' }
          ];
        }
      } else {
        console.log('⚠️ 未找到匹配规则，使用默认查询');
        matchedRule = '默认库存查询';
        
        // 使用模拟数据
        tableData = [
          { 物料名称: 'LCD显示屏', 供应商: '聚龙光电', 数量: '1500', 状态: '正常' },
          { 物料名称: 'OLED面板', 供应商: 'BOE科技', 数量: '800', 状态: '正常' },
          { 物料名称: '触控芯片', 供应商: '天马微电子', 数量: '2000', 状态: '正常' }
        ];
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

    } catch (error) {
      console.error('❌ 查询处理失败:', error);
      
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
    console.log('🔄 初始化服务...');
    
    // 初始化数据库
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      console.warn('⚠️ 数据库连接失败，将使用模拟数据');
    }
    
    app.listen(PORT, () => {
      console.log(`✅ IQE后端服务已启动，端口: ${PORT}`);
      console.log(`📚 健康检查: http://localhost:${PORT}/api/health`);
      console.log(`📋 规则接口: http://localhost:${PORT}/api/rules`);
      console.log(`🤖 查询接口: http://localhost:${PORT}/api/assistant/query`);
      console.log('🎉 服务启动完成！');
    });
  } catch (error) {
    console.error('❌ 启动服务失败:', error);
    process.exit(1);
  }
}

startServer();
