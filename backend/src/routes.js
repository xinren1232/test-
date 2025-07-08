/**
 * API路由配置
 * 集中管理所有API端点
 */
import healthRoutes from './controllers/healthController.js';
import materialCodeMappingsRoutes from './controllers/materialCodeMappingsController.js';
import assistantRoutes from './controllers/assistantController.js';
import dataRoutes from './routes/dataRoutes.js';
import chartsRoutes from './routes/charts.js';
import rulesRoutes from './routes/rulesRoutes.js';
import { swaggerDocs } from './utils/swagger.js';

/**
 * 设置所有API路由
 * @param {Express} app Express应用实例
 */
export function setupRoutes(app) {
  // API文档
  swaggerDocs(app);
  
  // 健康检查路由 (无需身份验证)
  app.use('/health', healthRoutes);
  
  // API路由
  app.use('/api/health', healthRoutes);
  app.use('/api/material-code-mappings', materialCodeMappingsRoutes);
  app.use('/api/assistant', assistantRoutes);
  app.use('/api/data', dataRoutes);
  app.use('/api/charts', chartsRoutes);
  app.use('/api/rules', rulesRoutes);
  
  // API根路径
  app.get('/api', (req, res) => {
    res.json({
      name: 'IQE智能质检系统统一助手API',
      version: '1.0.0',
      description: '提供质量检验、实验室测试和生产线相关的查询服务',
      documentation: '/api-docs'
    });
  });
  
  // 主页
  app.get('/', (req, res) => {
    res.send(`
      <html>
        <head>
          <title>IQE统一助手API服务</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              padding: 2rem;
              max-width: 800px; 
              margin: 0 auto; 
              color: #333;
              line-height: 1.6;
            }
            h1 { color: #0066cc; }
            a { color: #0066cc; text-decoration: none; }
            a:hover { text-decoration: underline; }
            .container {
              border: 1px solid #ddd;
              padding: 2rem;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .footer {
              margin-top: 2rem;
              font-size: 0.8rem;
              color: #666;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>IQE智能质检系统统一助手API</h1>
            <p>这是IQE智能质检系统的统一助手API服务。</p>
            <p>该服务提供质量检验、实验室测试和生产线相关的查询服务。</p>
            <p>
              <a href="/api-docs">查看API文档</a> |
              <a href="/api">API信息</a> |
              <a href="/health">健康状态</a>
            </p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} IQE团队
          </div>
        </body>
      </html>
    `);
  });
} 
 