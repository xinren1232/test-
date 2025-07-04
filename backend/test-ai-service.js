/**
 * AI查询功能测试服务
 * 专门用于测试和修复AI问答功能
 */
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
app.use(cors());
app.use(express.json());

// 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection',
  charset: 'utf8mb4'
};

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'ai-test-service',
    timestamp: new Date().toISOString()
  });
});

// AI查询端点
app.post('/api/assistant/query', async (req, res) => {
  const { query } = req.body;
  
  console.log(`🔍 收到AI查询: "${query}"`);
  
  try {
    // 简单的规则匹配测试
    let response = await processSimpleQuery(query);
    
    console.log(`✅ 返回结果: ${response.substring(0, 100)}...`);
    
    res.json({ 
      reply: response,
      source: 'test-service',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ 处理查询失败:', error);
    res.status(500).json({ 
      error: '处理查询失败',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 简单的查询处理函数
async function processSimpleQuery(query) {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 基本的关键词匹配
    if (query.includes('库存') || query.includes('物料')) {
      const [rows] = await connection.execute(`
        SELECT 
          material_code as 物料编码,
          material_name as 物料名称,
          batch_code as 批次号,
          supplier_name as 供应商,
          quantity as 数量,
          storage_location as 工厂,
          status as 状态
        FROM inventory 
        ORDER BY created_at DESC 
        LIMIT 5
      `);
      
      if (rows.length > 0) {
        let result = `📦 查询到 ${rows.length} 条库存记录：\n\n`;
        rows.forEach((row, index) => {
          result += `${index + 1}. ${row.物料名称} (${row.物料编码})\n`;
          result += `   批次: ${row.批次号} | 供应商: ${row.供应商}\n`;
          result += `   数量: ${row.数量} | 工厂: ${row.工厂} | 状态: ${row.状态}\n\n`;
        });
        return result;
      }
    }
    
    if (query.includes('测试') || query.includes('检验')) {
      const [rows] = await connection.execute(`
        SELECT 
          material_code as 物料编码,
          test_type as 测试类型,
          test_result as 测试结果,
          DATE_FORMAT(test_date, '%Y-%m-%d') as 测试日期
        FROM lab_tests 
        ORDER BY test_date DESC 
        LIMIT 5
      `);
      
      if (rows.length > 0) {
        let result = `🧪 查询到 ${rows.length} 条测试记录：\n\n`;
        rows.forEach((row, index) => {
          result += `${index + 1}. 物料: ${row.物料编码}\n`;
          result += `   测试类型: ${row.测试类型} | 结果: ${row.测试结果}\n`;
          result += `   测试日期: ${row.测试日期}\n\n`;
        });
        return result;
      }
    }
    
    // 默认响应
    return `🤖 AI助手收到您的查询："${query}"\n\n` +
           `✅ 服务状态：正常运行\n` +
           `📊 数据库连接：成功\n` +
           `🔍 查询处理：完成\n\n` +
           `💡 提示：您可以询问关于库存、物料、测试、检验等相关问题。`;
    
  } finally {
    await connection.end();
  }
}

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 AI测试服务器启动成功，端口: ${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`🤖 AI查询: http://localhost:${PORT}/api/assistant/query`);
  console.log(`⏰ 启动时间: ${new Date().toISOString()}`);
});
