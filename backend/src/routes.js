/**
 * API路由配置
 * 集中管理所有API端点
 */
import assistantRoutes from './controllers/assistantController.js';
import healthRoutes from './controllers/healthController.js';
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
  app.use('/api/health', healthRoutes);
  
  // 统一助手API路由
  app.use('/api/assistant', assistantRoutes);
  
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
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              max-width: 800px; 
              margin: 0 auto; 
              padding: 40px 20px;
              line-height: 1.6;
              color: #333;
            }
            h1 { 
              color: #0066cc; 
              margin-bottom: 30px;
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
            }
            .card {
              background: #f5f7fa;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            }
            .endpoint { 
              margin-bottom: 15px;
            }
            .endpoint h3 {
              margin-bottom: 10px;
              color: #333;
            }
            code { 
              background: #e9ecef; 
              padding: 2px 5px; 
              border-radius: 3px;
              font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
              font-size: 14px;
            }
            .method {
              display: inline-block;
              padding: 3px 8px;
              border-radius: 3px;
              color: white;
              font-size: 12px;
              font-weight: bold;
              margin-right: 8px;
            }
            .get { background-color: #61affe; }
            .post { background-color: #49cc90; }
            .delete { background-color: #f93e3e; }
            .desc {
              margin-top: 5px;
              color: #555;
            }
            .links {
              margin-top: 30px;
            }
            a {
              color: #0066cc;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <h1>IQE统一助手API服务</h1>
          <p>API服务已成功启动，提供以下端点：</p>
          
          <div class="card">
            <div class="endpoint">
              <h3>API文档</h3>
              <span class="method get">GET</span>
              <code>/api-docs</code>
              <div class="desc">API完整文档（Swagger UI）</div>
            </div>
          </div>
          
          <div class="card">
            <div class="endpoint">
              <h3>助手查询</h3>
              <span class="method post">POST</span>
              <code>/api/assistant/query</code>
              <div class="desc">处理用户查询，返回助手响应</div>
            </div>
            
            <div class="endpoint">
              <h3>清除会话</h3>
              <span class="method delete">DELETE</span>
              <code>/api/assistant/session/:sessionId</code>
              <div class="desc">清除指定会话的上下文</div>
            </div>
            
            <div class="endpoint">
              <h3>获取模式</h3>
              <span class="method get">GET</span>
              <code>/api/assistant/modes</code>
              <div class="desc">获取支持的助手模式</div>
            </div>
          </div>
          
          <div class="card">
            <div class="endpoint">
              <h3>健康检查</h3>
              <span class="method get">GET</span>
              <code>/health</code> 或 <code>/api/health</code>
              <div class="desc">检查API服务状态</div>
            </div>
          </div>
          
          <div class="links">
            <p>
              <a href="/api-docs">查看完整API文档</a> | 
              <a href="/api/health">检查API健康状态</a>
            </p>
          </div>
        </body>
      </html>
    `);
  });
} 
 * API路由配置
 * 集中管理所有API端点
 */
import assistantRoutes from './controllers/assistantController.js';
import healthRoutes from './controllers/healthController.js';
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
  app.use('/api/health', healthRoutes);
  
  // 统一助手API路由
  app.use('/api/assistant', assistantRoutes);
  
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
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              max-width: 800px; 
              margin: 0 auto; 
              padding: 40px 20px;
              line-height: 1.6;
              color: #333;
            }
            h1 { 
              color: #0066cc; 
              margin-bottom: 30px;
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
            }
            .card {
              background: #f5f7fa;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            }
            .endpoint { 
              margin-bottom: 15px;
            }
            .endpoint h3 {
              margin-bottom: 10px;
              color: #333;
            }
            code { 
              background: #e9ecef; 
              padding: 2px 5px; 
              border-radius: 3px;
              font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
              font-size: 14px;
            }
            .method {
              display: inline-block;
              padding: 3px 8px;
              border-radius: 3px;
              color: white;
              font-size: 12px;
              font-weight: bold;
              margin-right: 8px;
            }
            .get { background-color: #61affe; }
            .post { background-color: #49cc90; }
            .delete { background-color: #f93e3e; }
            .desc {
              margin-top: 5px;
              color: #555;
            }
            .links {
              margin-top: 30px;
            }
            a {
              color: #0066cc;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <h1>IQE统一助手API服务</h1>
          <p>API服务已成功启动，提供以下端点：</p>
          
          <div class="card">
            <div class="endpoint">
              <h3>API文档</h3>
              <span class="method get">GET</span>
              <code>/api-docs</code>
              <div class="desc">API完整文档（Swagger UI）</div>
            </div>
          </div>
          
          <div class="card">
            <div class="endpoint">
              <h3>助手查询</h3>
              <span class="method post">POST</span>
              <code>/api/assistant/query</code>
              <div class="desc">处理用户查询，返回助手响应</div>
            </div>
            
            <div class="endpoint">
              <h3>清除会话</h3>
              <span class="method delete">DELETE</span>
              <code>/api/assistant/session/:sessionId</code>
              <div class="desc">清除指定会话的上下文</div>
            </div>
            
            <div class="endpoint">
              <h3>获取模式</h3>
              <span class="method get">GET</span>
              <code>/api/assistant/modes</code>
              <div class="desc">获取支持的助手模式</div>
            </div>
          </div>
          
          <div class="card">
            <div class="endpoint">
              <h3>健康检查</h3>
              <span class="method get">GET</span>
              <code>/health</code> 或 <code>/api/health</code>
              <div class="desc">检查API服务状态</div>
            </div>
          </div>
          
          <div class="links">
            <p>
              <a href="/api-docs">查看完整API文档</a> | 
              <a href="/api/health">检查API健康状态</a>
            </p>
          </div>
        </body>
      </html>
    `);
  });
} 
 * API路由配置
 * 集中管理所有API端点
 */
import assistantRoutes from './controllers/assistantController.js';
import healthRoutes from './controllers/healthController.js';
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
  app.use('/api/health', healthRoutes);
  
  // 统一助手API路由
  app.use('/api/assistant', assistantRoutes);
  
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
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              max-width: 800px; 
              margin: 0 auto; 
              padding: 40px 20px;
              line-height: 1.6;
              color: #333;
            }
            h1 { 
              color: #0066cc; 
              margin-bottom: 30px;
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
            }
            .card {
              background: #f5f7fa;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            }
            .endpoint { 
              margin-bottom: 15px;
            }
            .endpoint h3 {
              margin-bottom: 10px;
              color: #333;
            }
            code { 
              background: #e9ecef; 
              padding: 2px 5px; 
              border-radius: 3px;
              font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
              font-size: 14px;
            }
            .method {
              display: inline-block;
              padding: 3px 8px;
              border-radius: 3px;
              color: white;
              font-size: 12px;
              font-weight: bold;
              margin-right: 8px;
            }
            .get { background-color: #61affe; }
            .post { background-color: #49cc90; }
            .delete { background-color: #f93e3e; }
            .desc {
              margin-top: 5px;
              color: #555;
            }
            .links {
              margin-top: 30px;
            }
            a {
              color: #0066cc;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <h1>IQE统一助手API服务</h1>
          <p>API服务已成功启动，提供以下端点：</p>
          
          <div class="card">
            <div class="endpoint">
              <h3>API文档</h3>
              <span class="method get">GET</span>
              <code>/api-docs</code>
              <div class="desc">API完整文档（Swagger UI）</div>
            </div>
          </div>
          
          <div class="card">
            <div class="endpoint">
              <h3>助手查询</h3>
              <span class="method post">POST</span>
              <code>/api/assistant/query</code>
              <div class="desc">处理用户查询，返回助手响应</div>
            </div>
            
            <div class="endpoint">
              <h3>清除会话</h3>
              <span class="method delete">DELETE</span>
              <code>/api/assistant/session/:sessionId</code>
              <div class="desc">清除指定会话的上下文</div>
            </div>
            
            <div class="endpoint">
              <h3>获取模式</h3>
              <span class="method get">GET</span>
              <code>/api/assistant/modes</code>
              <div class="desc">获取支持的助手模式</div>
            </div>
          </div>
          
          <div class="card">
            <div class="endpoint">
              <h3>健康检查</h3>
              <span class="method get">GET</span>
              <code>/health</code> 或 <code>/api/health</code>
              <div class="desc">检查API服务状态</div>
            </div>
          </div>
          
          <div class="links">
            <p>
              <a href="/api-docs">查看完整API文档</a> | 
              <a href="/api/health">检查API健康状态</a>
            </p>
          </div>
        </body>
      </html>
    `);
  });
} 
 
 
 
 * API路由配置
 * 集中管理所有API端点
 */
import assistantRoutes from './controllers/assistantController.js';
import healthRoutes from './controllers/healthController.js';
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
  app.use('/api/health', healthRoutes);
  
  // 统一助手API路由
  app.use('/api/assistant', assistantRoutes);
  
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
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              max-width: 800px; 
              margin: 0 auto; 
              padding: 40px 20px;
              line-height: 1.6;
              color: #333;
            }
            h1 { 
              color: #0066cc; 
              margin-bottom: 30px;
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
            }
            .card {
              background: #f5f7fa;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            }
            .endpoint { 
              margin-bottom: 15px;
            }
            .endpoint h3 {
              margin-bottom: 10px;
              color: #333;
            }
            code { 
              background: #e9ecef; 
              padding: 2px 5px; 
              border-radius: 3px;
              font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
              font-size: 14px;
            }
            .method {
              display: inline-block;
              padding: 3px 8px;
              border-radius: 3px;
              color: white;
              font-size: 12px;
              font-weight: bold;
              margin-right: 8px;
            }
            .get { background-color: #61affe; }
            .post { background-color: #49cc90; }
            .delete { background-color: #f93e3e; }
            .desc {
              margin-top: 5px;
              color: #555;
            }
            .links {
              margin-top: 30px;
            }
            a {
              color: #0066cc;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <h1>IQE统一助手API服务</h1>
          <p>API服务已成功启动，提供以下端点：</p>
          
          <div class="card">
            <div class="endpoint">
              <h3>API文档</h3>
              <span class="method get">GET</span>
              <code>/api-docs</code>
              <div class="desc">API完整文档（Swagger UI）</div>
            </div>
          </div>
          
          <div class="card">
            <div class="endpoint">
              <h3>助手查询</h3>
              <span class="method post">POST</span>
              <code>/api/assistant/query</code>
              <div class="desc">处理用户查询，返回助手响应</div>
            </div>
            
            <div class="endpoint">
              <h3>清除会话</h3>
              <span class="method delete">DELETE</span>
              <code>/api/assistant/session/:sessionId</code>
              <div class="desc">清除指定会话的上下文</div>
            </div>
            
            <div class="endpoint">
              <h3>获取模式</h3>
              <span class="method get">GET</span>
              <code>/api/assistant/modes</code>
              <div class="desc">获取支持的助手模式</div>
            </div>
          </div>
          
          <div class="card">
            <div class="endpoint">
              <h3>健康检查</h3>
              <span class="method get">GET</span>
              <code>/health</code> 或 <code>/api/health</code>
              <div class="desc">检查API服务状态</div>
            </div>
          </div>
          
          <div class="links">
            <p>
              <a href="/api-docs">查看完整API文档</a> | 
              <a href="/api/health">检查API健康状态</a>
            </p>
          </div>
        </body>
      </html>
    `);
  });
} 
 * API路由配置
 * 集中管理所有API端点
 */
import assistantRoutes from './controllers/assistantController.js';
import healthRoutes from './controllers/healthController.js';
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
  app.use('/api/health', healthRoutes);
  
  // 统一助手API路由
  app.use('/api/assistant', assistantRoutes);
  
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
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              max-width: 800px; 
              margin: 0 auto; 
              padding: 40px 20px;
              line-height: 1.6;
              color: #333;
            }
            h1 { 
              color: #0066cc; 
              margin-bottom: 30px;
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
            }
            .card {
              background: #f5f7fa;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            }
            .endpoint { 
              margin-bottom: 15px;
            }
            .endpoint h3 {
              margin-bottom: 10px;
              color: #333;
            }
            code { 
              background: #e9ecef; 
              padding: 2px 5px; 
              border-radius: 3px;
              font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
              font-size: 14px;
            }
            .method {
              display: inline-block;
              padding: 3px 8px;
              border-radius: 3px;
              color: white;
              font-size: 12px;
              font-weight: bold;
              margin-right: 8px;
            }
            .get { background-color: #61affe; }
            .post { background-color: #49cc90; }
            .delete { background-color: #f93e3e; }
            .desc {
              margin-top: 5px;
              color: #555;
            }
            .links {
              margin-top: 30px;
            }
            a {
              color: #0066cc;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <h1>IQE统一助手API服务</h1>
          <p>API服务已成功启动，提供以下端点：</p>
          
          <div class="card">
            <div class="endpoint">
              <h3>API文档</h3>
              <span class="method get">GET</span>
              <code>/api-docs</code>
              <div class="desc">API完整文档（Swagger UI）</div>
            </div>
          </div>
          
          <div class="card">
            <div class="endpoint">
              <h3>助手查询</h3>
              <span class="method post">POST</span>
              <code>/api/assistant/query</code>
              <div class="desc">处理用户查询，返回助手响应</div>
            </div>
            
            <div class="endpoint">
              <h3>清除会话</h3>
              <span class="method delete">DELETE</span>
              <code>/api/assistant/session/:sessionId</code>
              <div class="desc">清除指定会话的上下文</div>
            </div>
            
            <div class="endpoint">
              <h3>获取模式</h3>
              <span class="method get">GET</span>
              <code>/api/assistant/modes</code>
              <div class="desc">获取支持的助手模式</div>
            </div>
          </div>
          
          <div class="card">
            <div class="endpoint">
              <h3>健康检查</h3>
              <span class="method get">GET</span>
              <code>/health</code> 或 <code>/api/health</code>
              <div class="desc">检查API服务状态</div>
            </div>
          </div>
          
          <div class="links">
            <p>
              <a href="/api-docs">查看完整API文档</a> | 
              <a href="/api/health">检查API健康状态</a>
            </p>
          </div>
        </body>
      </html>
    `);
  });
} 
 * API路由配置
 * 集中管理所有API端点
 */
import assistantRoutes from './controllers/assistantController.js';
import healthRoutes from './controllers/healthController.js';
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
  app.use('/api/health', healthRoutes);
  
  // 统一助手API路由
  app.use('/api/assistant', assistantRoutes);
  
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
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              max-width: 800px; 
              margin: 0 auto; 
              padding: 40px 20px;
              line-height: 1.6;
              color: #333;
            }
            h1 { 
              color: #0066cc; 
              margin-bottom: 30px;
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
            }
            .card {
              background: #f5f7fa;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            }
            .endpoint { 
              margin-bottom: 15px;
            }
            .endpoint h3 {
              margin-bottom: 10px;
              color: #333;
            }
            code { 
              background: #e9ecef; 
              padding: 2px 5px; 
              border-radius: 3px;
              font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
              font-size: 14px;
            }
            .method {
              display: inline-block;
              padding: 3px 8px;
              border-radius: 3px;
              color: white;
              font-size: 12px;
              font-weight: bold;
              margin-right: 8px;
            }
            .get { background-color: #61affe; }
            .post { background-color: #49cc90; }
            .delete { background-color: #f93e3e; }
            .desc {
              margin-top: 5px;
              color: #555;
            }
            .links {
              margin-top: 30px;
            }
            a {
              color: #0066cc;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <h1>IQE统一助手API服务</h1>
          <p>API服务已成功启动，提供以下端点：</p>
          
          <div class="card">
            <div class="endpoint">
              <h3>API文档</h3>
              <span class="method get">GET</span>
              <code>/api-docs</code>
              <div class="desc">API完整文档（Swagger UI）</div>
            </div>
          </div>
          
          <div class="card">
            <div class="endpoint">
              <h3>助手查询</h3>
              <span class="method post">POST</span>
              <code>/api/assistant/query</code>
              <div class="desc">处理用户查询，返回助手响应</div>
            </div>
            
            <div class="endpoint">
              <h3>清除会话</h3>
              <span class="method delete">DELETE</span>
              <code>/api/assistant/session/:sessionId</code>
              <div class="desc">清除指定会话的上下文</div>
            </div>
            
            <div class="endpoint">
              <h3>获取模式</h3>
              <span class="method get">GET</span>
              <code>/api/assistant/modes</code>
              <div class="desc">获取支持的助手模式</div>
            </div>
          </div>
          
          <div class="card">
            <div class="endpoint">
              <h3>健康检查</h3>
              <span class="method get">GET</span>
              <code>/health</code> 或 <code>/api/health</code>
              <div class="desc">检查API服务状态</div>
            </div>
          </div>
          
          <div class="links">
            <p>
              <a href="/api-docs">查看完整API文档</a> | 
              <a href="/api/health">检查API健康状态</a>
            </p>
          </div>
        </body>
      </html>
    `);
  });
} 
 
 
 
 * API路由配置
 * 集中管理所有API端点
 */
import assistantRoutes from './controllers/assistantController.js';
import healthRoutes from './controllers/healthController.js';
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
  app.use('/api/health', healthRoutes);
  
  // 统一助手API路由
  app.use('/api/assistant', assistantRoutes);
  
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
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              max-width: 800px; 
              margin: 0 auto; 
              padding: 40px 20px;
              line-height: 1.6;
              color: #333;
            }
            h1 { 
              color: #0066cc; 
              margin-bottom: 30px;
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
            }
            .card {
              background: #f5f7fa;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            }
            .endpoint { 
              margin-bottom: 15px;
            }
            .endpoint h3 {
              margin-bottom: 10px;
              color: #333;
            }
            code { 
              background: #e9ecef; 
              padding: 2px 5px; 
              border-radius: 3px;
              font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
              font-size: 14px;
            }
            .method {
              display: inline-block;
              padding: 3px 8px;
              border-radius: 3px;
              color: white;
              font-size: 12px;
              font-weight: bold;
              margin-right: 8px;
            }
            .get { background-color: #61affe; }
            .post { background-color: #49cc90; }
            .delete { background-color: #f93e3e; }
            .desc {
              margin-top: 5px;
              color: #555;
            }
            .links {
              margin-top: 30px;
            }
            a {
              color: #0066cc;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <h1>IQE统一助手API服务</h1>
          <p>API服务已成功启动，提供以下端点：</p>
          
          <div class="card">
            <div class="endpoint">
              <h3>API文档</h3>
              <span class="method get">GET</span>
              <code>/api-docs</code>
              <div class="desc">API完整文档（Swagger UI）</div>
            </div>
          </div>
          
          <div class="card">
            <div class="endpoint">
              <h3>助手查询</h3>
              <span class="method post">POST</span>
              <code>/api/assistant/query</code>
              <div class="desc">处理用户查询，返回助手响应</div>
            </div>
            
            <div class="endpoint">
              <h3>清除会话</h3>
              <span class="method delete">DELETE</span>
              <code>/api/assistant/session/:sessionId</code>
              <div class="desc">清除指定会话的上下文</div>
            </div>
            
            <div class="endpoint">
              <h3>获取模式</h3>
              <span class="method get">GET</span>
              <code>/api/assistant/modes</code>
              <div class="desc">获取支持的助手模式</div>
            </div>
          </div>
          
          <div class="card">
            <div class="endpoint">
              <h3>健康检查</h3>
              <span class="method get">GET</span>
              <code>/health</code> 或 <code>/api/health</code>
              <div class="desc">检查API服务状态</div>
            </div>
          </div>
          
          <div class="links">
            <p>
              <a href="/api-docs">查看完整API文档</a> | 
              <a href="/api/health">检查API健康状态</a>
            </p>
          </div>
        </body>
      </html>
    `);
  });
} 
 * API路由配置
 * 集中管理所有API端点
 */
import assistantRoutes from './controllers/assistantController.js';
import healthRoutes from './controllers/healthController.js';
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
  app.use('/api/health', healthRoutes);
  
  // 统一助手API路由
  app.use('/api/assistant', assistantRoutes);
  
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
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              max-width: 800px; 
              margin: 0 auto; 
              padding: 40px 20px;
              line-height: 1.6;
              color: #333;
            }
            h1 { 
              color: #0066cc; 
              margin-bottom: 30px;
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
            }
            .card {
              background: #f5f7fa;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            }
            .endpoint { 
              margin-bottom: 15px;
            }
            .endpoint h3 {
              margin-bottom: 10px;
              color: #333;
            }
            code { 
              background: #e9ecef; 
              padding: 2px 5px; 
              border-radius: 3px;
              font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
              font-size: 14px;
            }
            .method {
              display: inline-block;
              padding: 3px 8px;
              border-radius: 3px;
              color: white;
              font-size: 12px;
              font-weight: bold;
              margin-right: 8px;
            }
            .get { background-color: #61affe; }
            .post { background-color: #49cc90; }
            .delete { background-color: #f93e3e; }
            .desc {
              margin-top: 5px;
              color: #555;
            }
            .links {
              margin-top: 30px;
            }
            a {
              color: #0066cc;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <h1>IQE统一助手API服务</h1>
          <p>API服务已成功启动，提供以下端点：</p>
          
          <div class="card">
            <div class="endpoint">
              <h3>API文档</h3>
              <span class="method get">GET</span>
              <code>/api-docs</code>
              <div class="desc">API完整文档（Swagger UI）</div>
            </div>
          </div>
          
          <div class="card">
            <div class="endpoint">
              <h3>助手查询</h3>
              <span class="method post">POST</span>
              <code>/api/assistant/query</code>
              <div class="desc">处理用户查询，返回助手响应</div>
            </div>
            
            <div class="endpoint">
              <h3>清除会话</h3>
              <span class="method delete">DELETE</span>
              <code>/api/assistant/session/:sessionId</code>
              <div class="desc">清除指定会话的上下文</div>
            </div>
            
            <div class="endpoint">
              <h3>获取模式</h3>
              <span class="method get">GET</span>
              <code>/api/assistant/modes</code>
              <div class="desc">获取支持的助手模式</div>
            </div>
          </div>
          
          <div class="card">
            <div class="endpoint">
              <h3>健康检查</h3>
              <span class="method get">GET</span>
              <code>/health</code> 或 <code>/api/health</code>
              <div class="desc">检查API服务状态</div>
            </div>
          </div>
          
          <div class="links">
            <p>
              <a href="/api-docs">查看完整API文档</a> | 
              <a href="/api/health">检查API健康状态</a>
            </p>
          </div>
        </body>
      </html>
    `);
  });
} 
 * API路由配置
 * 集中管理所有API端点
 */
import assistantRoutes from './controllers/assistantController.js';
import healthRoutes from './controllers/healthController.js';
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
  app.use('/api/health', healthRoutes);
  
  // 统一助手API路由
  app.use('/api/assistant', assistantRoutes);
  
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
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              max-width: 800px; 
              margin: 0 auto; 
              padding: 40px 20px;
              line-height: 1.6;
              color: #333;
            }
            h1 { 
              color: #0066cc; 
              margin-bottom: 30px;
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
            }
            .card {
              background: #f5f7fa;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            }
            .endpoint { 
              margin-bottom: 15px;
            }
            .endpoint h3 {
              margin-bottom: 10px;
              color: #333;
            }
            code { 
              background: #e9ecef; 
              padding: 2px 5px; 
              border-radius: 3px;
              font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
              font-size: 14px;
            }
            .method {
              display: inline-block;
              padding: 3px 8px;
              border-radius: 3px;
              color: white;
              font-size: 12px;
              font-weight: bold;
              margin-right: 8px;
            }
            .get { background-color: #61affe; }
            .post { background-color: #49cc90; }
            .delete { background-color: #f93e3e; }
            .desc {
              margin-top: 5px;
              color: #555;
            }
            .links {
              margin-top: 30px;
            }
            a {
              color: #0066cc;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <h1>IQE统一助手API服务</h1>
          <p>API服务已成功启动，提供以下端点：</p>
          
          <div class="card">
            <div class="endpoint">
              <h3>API文档</h3>
              <span class="method get">GET</span>
              <code>/api-docs</code>
              <div class="desc">API完整文档（Swagger UI）</div>
            </div>
          </div>
          
          <div class="card">
            <div class="endpoint">
              <h3>助手查询</h3>
              <span class="method post">POST</span>
              <code>/api/assistant/query</code>
              <div class="desc">处理用户查询，返回助手响应</div>
            </div>
            
            <div class="endpoint">
              <h3>清除会话</h3>
              <span class="method delete">DELETE</span>
              <code>/api/assistant/session/:sessionId</code>
              <div class="desc">清除指定会话的上下文</div>
            </div>
            
            <div class="endpoint">
              <h3>获取模式</h3>
              <span class="method get">GET</span>
              <code>/api/assistant/modes</code>
              <div class="desc">获取支持的助手模式</div>
            </div>
          </div>
          
          <div class="card">
            <div class="endpoint">
              <h3>健康检查</h3>
              <span class="method get">GET</span>
              <code>/health</code> 或 <code>/api/health</code>
              <div class="desc">检查API服务状态</div>
            </div>
          </div>
          
          <div class="links">
            <p>
              <a href="/api-docs">查看完整API文档</a> | 
              <a href="/api/health">检查API健康状态</a>
            </p>
          </div>
        </body>
      </html>
    `);
  });
} 
 
 
 