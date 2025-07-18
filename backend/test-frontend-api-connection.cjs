// 测试前端API连接
const mysql = require('mysql2/promise');
const express = require('express');
const cors = require('cors');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function testFrontendAPIConnection() {
  try {
    console.log('🔍 测试前端API连接...\n');
    
    // 1. 检查数据库连接
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 2. 测试规则匹配和执行
    const testQuery = '全测试';
    console.log(`\n🧪 测试查询: "${testQuery}"`);
    
    // 查找匹配的规则
    const [matchedRules] = await connection.execute(`
      SELECT id, intent_name, action_target, trigger_words, priority
      FROM nlp_intent_rules 
      WHERE status = 'active' 
      AND (
        JSON_CONTAINS(trigger_words, ?) 
        OR intent_name LIKE ?
      )
      ORDER BY priority DESC
      LIMIT 1
    `, [JSON.stringify(testQuery), `%${testQuery}%`]);
    
    if (matchedRules.length > 0) {
      const rule = matchedRules[0];
      console.log(`✅ 找到匹配规则: ${rule.intent_name} (ID: ${rule.id})`);
      
      // 执行SQL
      try {
        const [results] = await connection.execute(rule.action_target);
        console.log(`✅ SQL执行成功: ${results.length} 条数据`);
        if (results.length > 0) {
          console.log(`   第一条数据:`, results[0]);
        }
      } catch (error) {
        console.log(`❌ SQL执行失败: ${error.message}`);
      }
    } else {
      console.log(`❌ 未找到匹配规则`);
    }
    
    await connection.end();
    
    // 3. 创建临时API服务器测试
    console.log('\n🚀 创建临时API服务器...');
    
    const app = express();
    app.use(cors());
    app.use(express.json());
    
    // API端点：/api/assistant/query
    app.post('/api/assistant/query', async (req, res) => {
      try {
        const { query } = req.body;
        console.log(`📥 收到查询请求: "${query}"`);
        
        const connection = await mysql.createConnection(dbConfig);
        
        // 查找匹配的规则
        const [rules] = await connection.execute(`
          SELECT id, intent_name, action_target, trigger_words, priority
          FROM nlp_intent_rules 
          WHERE status = 'active'
          ORDER BY priority DESC
        `);
        
        let selectedRule = null;
        
        // 尝试JSON匹配
        for (const rule of rules) {
          try {
            if (rule.trigger_words && Array.isArray(rule.trigger_words)) {
              if (rule.trigger_words.some(word => query.includes(word))) {
                selectedRule = rule;
                break;
              }
            } else if (rule.trigger_words && typeof rule.trigger_words === 'string') {
              const words = rule.trigger_words.split(',');
              if (words.some(word => query.includes(word.trim()))) {
                selectedRule = rule;
                break;
              }
            }
          } catch (e) {
            // 忽略JSON解析错误
          }
        }
        
        // 如果没有匹配到，使用模糊匹配
        if (!selectedRule) {
          for (const rule of rules) {
            if (rule.intent_name.includes(query) || query.includes('测试') || query.includes('全')) {
              selectedRule = rule;
              break;
            }
          }
        }
        
        // 如果还是没有，使用第一个规则
        if (!selectedRule && rules.length > 0) {
          selectedRule = rules[0];
        }
        
        if (!selectedRule) {
          await connection.end();
          return res.json({
            success: false,
            message: '未找到匹配的规则',
            data: { tableData: [], cards: [] }
          });
        }
        
        console.log(`✅ 匹配规则: ${selectedRule.intent_name}`);
        
        // 执行SQL
        try {
          const [results] = await connection.execute(selectedRule.action_target);
          console.log(`✅ 查询成功: ${results.length} 条数据`);
          
          await connection.end();
          
          res.json({
            success: true,
            message: `查询成功，找到 ${results.length} 条数据`,
            data: {
              tableData: results,
              cards: [
                {
                  title: '查询结果',
                  value: results.length,
                  unit: '条',
                  trend: 'up',
                  color: '#67C23A'
                },
                {
                  title: '匹配规则',
                  value: selectedRule.intent_name,
                  unit: '',
                  trend: 'stable',
                  color: '#409EFF'
                }
              ],
              matchedRule: selectedRule.intent_name,
              executedSQL: selectedRule.action_target.substring(0, 100) + '...'
            }
          });
          
        } catch (error) {
          console.log(`❌ SQL执行失败: ${error.message}`);
          await connection.end();
          
          res.json({
            success: false,
            message: `SQL执行失败: ${error.message}`,
            data: { tableData: [], cards: [] }
          });
        }
        
      } catch (error) {
        console.error('❌ API处理失败:', error);
        res.status(500).json({
          success: false,
          message: `服务器错误: ${error.message}`,
          data: { tableData: [], cards: [] }
        });
      }
    });
    
    // 健康检查端点
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', message: '服务正常运行' });
    });
    
    // 启动服务器
    const PORT = 3001;
    const server = app.listen(PORT, () => {
      console.log(`✅ API服务器启动成功: http://localhost:${PORT}`);
      console.log(`📡 API端点: http://localhost:${PORT}/api/assistant/query`);
      console.log(`🏥 健康检查: http://localhost:${PORT}/api/health`);
      console.log('\n💡 现在可以测试前端连接了！');
      console.log('   前端应该向 http://localhost:3001/api/assistant/query 发送POST请求');
      console.log('   请求体格式: { "query": "全测试" }');
    });
    
    // 优雅关闭
    process.on('SIGINT', () => {
      console.log('\n🛑 正在关闭服务器...');
      server.close(() => {
        console.log('✅ 服务器已关闭');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testFrontendAPIConnection();
