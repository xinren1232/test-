import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 测试API端点
app.post('/api/assistant/query', async (req, res) => {
  const { query } = req.body;
  console.log('🔍 收到查询:', query);
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    let sqlQuery = '';
    let queryParams = [];
    
    // 简单的查询匹配逻辑
    if (query.includes('深圳') && query.includes('库存')) {
      sqlQuery = `
        SELECT 
          storage_location as 工厂,
          material_code as 物料编码,
          material_name as 物料名称,
          supplier_name as 供应商,
          quantity as 数量,
          status as 状态,
          DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间
        FROM inventory 
        WHERE storage_location LIKE '%深圳%'
        ORDER BY inbound_time DESC
        LIMIT 20
      `;
    } else if (query.includes('BOE') && (query.includes('供应商') || query.includes('物料'))) {
      sqlQuery = `
        SELECT 
          storage_location as 工厂,
          material_code as 物料编码,
          material_name as 物料名称,
          supplier_name as 供应商,
          quantity as 数量,
          status as 状态,
          DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间
        FROM inventory 
        WHERE supplier_name LIKE '%BOE%'
        ORDER BY inbound_time DESC
        LIMIT 20
      `;
    } else if (query.includes('库存') || query.includes('物料')) {
      sqlQuery = `
        SELECT 
          storage_location as 工厂,
          material_code as 物料编码,
          material_name as 物料名称,
          supplier_name as 供应商,
          quantity as 数量,
          status as 状态,
          DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间
        FROM inventory 
        ORDER BY inbound_time DESC
        LIMIT 20
      `;
    } else {
      // 默认查询
      sqlQuery = `
        SELECT 
          storage_location as 工厂,
          material_code as 物料编码,
          material_name as 物料名称,
          supplier_name as 供应商,
          quantity as 数量,
          status as 状态,
          DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间
        FROM inventory 
        ORDER BY inbound_time DESC
        LIMIT 10
      `;
    }
    
    const [rows] = await connection.execute(sqlQuery, queryParams);
    await connection.end();
    
    console.log(`✅ 查询成功，返回 ${rows.length} 条记录`);
    
    // 构建响应
    const response = {
      success: true,
      data: {
        question: query,
        answer: `根据您的查询"${query}"，找到了 ${rows.length} 条相关记录。`,
        analysis: {
          type: 'inventory',
          intent: 'query',
          entities: {},
          confidence: 0.9
        },
        template: 'inventory_query',
        tableData: rows,
        keyMetrics: [
          {
            label: '总记录数',
            value: rows.length,
            trend: 'stable'
          },
          {
            label: '正常状态',
            value: rows.filter(r => r.状态 === '正常').length,
            trend: 'up'
          },
          {
            label: '风险状态',
            value: rows.filter(r => r.状态 === '风险').length,
            trend: 'down'
          }
        ],
        summary: `查询完成，共找到 ${rows.length} 条库存记录`,
        metadata: {
          dataSource: 'real_database',
          timestamp: new Date().toISOString(),
          processingTime: Date.now()
        }
      },
      timestamp: new Date().toISOString(),
      source: 'simple-test-server'
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ 查询失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 简单测试服务器已启动，端口: ${PORT}`);
  console.log(`📚 测试地址: http://localhost:${PORT}/api/assistant/query`);
});
