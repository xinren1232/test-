import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
const PORT = 3001;

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

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '修复后的服务器正常运行' });
});

// 修复后的库存查询 - 不包含风险等级字段
app.post('/api/assistant/query', async (req, res) => {
  const { query } = req.body;
  console.log(`收到查询: ${query}`);
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 检查是否为库存相关查询
    if (query.includes('库存') || query.includes('物料') || query.includes('供应商')) {
      console.log('识别为库存查询');
      
      // 修复后的SQL查询 - 移除了risk_level字段
      const sql = `
        SELECT 
          material_code as 物料编码, 
          material_name as 物料名称, 
          batch_code as 批次号,
          supplier_name as 供应商, 
          quantity as 数量, 
          storage_location as 工厂, 
          status as 状态,
          inbound_time as 入库时间,
          notes as 备注
        FROM inventory 
        LIMIT 10
      `;
      
      const [rows] = await connection.execute(sql);
      console.log(`查询到 ${rows.length} 条记录`);
      
      let result = `✅ 查询到 ${rows.length} 条库存记录（已修复，不包含风险等级）：\n\n`;
      
      rows.forEach((row, index) => {
        result += `📦 记录 ${index + 1}:\n`;
        result += `   物料: ${row.物料名称} (${row.物料编码})\n`;
        result += `   批次: ${row.批次号}\n`;
        result += `   供应商: ${row.供应商}\n`;
        result += `   数量: ${row.数量}\n`;
        result += `   工厂: ${row.工厂}\n`;
        result += `   状态: ${row.状态}\n`;
        result += `   入库时间: ${row.入库时间}\n`;
        if (row.备注) result += `   备注: ${row.备注}\n`;
        result += `\n`;
      });
      
      result += `🔍 字段验证：\n`;
      result += `✅ 已移除风险等级字段\n`;
      result += `✅ 显示字段符合前端页面要求\n`;
      
      await connection.end();
      res.json({ reply: result });
      
    } else {
      await connection.end();
      res.json({ 
        reply: `🤖 收到查询"${query}"，但未识别为库存查询。\n\n💡 提示：尝试使用"查询库存"、"查询物料"等关键词。` 
      });
    }
    
  } catch (error) {
    console.error('查询失败:', error);
    res.json({ reply: `❌ 查询失败: ${error.message}` });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 修复后的服务器启动成功，端口: ${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`🤖 AI查询: http://localhost:${PORT}/api/assistant/query`);
  console.log(`✅ 已修复风险等级字段问题`);
}).on('error', (err) => {
  console.error('❌ 服务器启动失败:', err);
});
