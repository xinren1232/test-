import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
const PORT = 3001;

// 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection',
  charset: 'utf8mb4',
  timezone: '+08:00'
};

app.use(cors());
app.use(express.json());

// 健康检查
app.get('/api/health', (req, res) => {
  console.log('健康检查请求');
  res.json({ status: 'ok', message: '服务器正常运行' });
});

// 简单查询测试
app.post('/api/assistant/query', async (req, res) => {
  const { query } = req.body;
  console.log(`收到查询: ${query}`);
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功');
    
    // 简单的库存查询测试
    if (query.includes('库存')) {
      const [rows] = await connection.execute(`
        SELECT material_code as 物料编码, material_name as 物料名称, 
               supplier_name as 供应商, quantity as 数量, 
               storage_location as 工厂, status as 状态
        FROM inventory 
        LIMIT 5
      `);
      
      console.log(`查询到 ${rows.length} 条记录`);
      
      let result = `✅ 查询到 ${rows.length} 条库存记录：\n\n`;
      rows.forEach(row => {
        result += `📦 物料: ${row.物料名称} (${row.物料编码})\n`;
        result += `   供应商: ${row.供应商}\n`;
        result += `   数量: ${row.数量}\n`;
        result += `   工厂: ${row.工厂}\n`;
        result += `   状态: ${row.状态}\n\n`;
      });
      
      await connection.end();
      res.json({ reply: result });
    } else {
      await connection.end();
      res.json({ reply: '🤖 收到查询，但未识别为库存查询' });
    }
    
  } catch (error) {
    console.error('查询失败:', error);
    res.json({ reply: `❌ 查询失败: ${error.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 测试服务器启动，端口: ${PORT}`);
}).on('error', (err) => {
  console.error('启动失败:', err);
});
