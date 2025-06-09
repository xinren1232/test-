/**
 * 统一助手API控制器
 * 处理外部系统调用，提供HTTP接口
 */
import express from 'express';
import cors from 'cors';
import unifiedAssistantAPI from '../services/api/UnifiedAssistantAPI';

// 创建Express应用
const app = express();
const router = express.Router();

// 使用中间件
app.use(cors());
app.use(express.json());

/**
 * 查询处理接口
 * POST /api/assistant/query
 */
router.post('/query', async (req, res) => {
  try {
    const { query, mode, sessionId, context } = req.body;
    
    // 验证必要参数
    if (!query) {
      return res.status(400).json({
        success: false,
        error: '查询内容不能为空'
      });
    }
    
    // 处理查询
    const result = await unifiedAssistantAPI.handleQuery({
      query,
      mode: mode || 'auto',
      sessionId,
      context
    });
    
    // 返回结果
    return res.json(result);
  } catch (error) {
    console.error('处理查询请求失败:', error);
    return res.status(500).json({
      success: false,
      error: error.message || '服务器内部错误'
    });
  }
});

/**
 * 清除会话上下文
 * DELETE /api/assistant/session/:sessionId
 */
router.delete('/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // 验证必要参数
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: '会话ID不能为空'
      });
    }
    
    // 清除会话上下文
    const result = unifiedAssistantAPI.clearSessionContext(sessionId);
    
    // 返回结果
    return res.json({
      success: result,
      message: result ? '会话上下文已清除' : '会话不存在或清除失败'
    });
  } catch (error) {
    console.error('清除会话上下文失败:', error);
    return res.status(500).json({
      success: false,
      error: error.message || '服务器内部错误'
    });
  }
});

/**
 * 获取支持的模式
 * GET /api/assistant/modes
 */
router.get('/modes', (req, res) => {
  return res.json({
    success: true,
    modes: [
      {
        id: 'auto',
        name: '自动识别模式',
        description: '根据查询内容自动选择最合适的助手'
      },
      {
        id: 'quality',
        name: '质量检验助手',
        description: '处理物料质量检验和分析相关的问题'
      },
      {
        id: 'lab',
        name: '实验室质量助手',
        description: '处理实验室测试和质量分析相关的问题'
      },
      {
        id: 'production',
        name: '生产线助手',
        description: '处理生产线状态监控和优化相关的问题'
      }
    ]
  });
});

/**
 * 健康检查
 * GET /api/assistant/health
 */
router.get('/health', (req, res) => {
  return res.json({
    success: true,
    status: 'UP',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 注册路由
app.use('/api/assistant', router);

/**
 * 启动服务器
 * @param {number} port 端口号
 */
export function startAssistantAPI(port = 3001) {
  // 确保API服务已初始化
  unifiedAssistantAPI.init();
  
  // 启动服务器
  app.listen(port, () => {
    console.log(`统一助手API服务已启动, 监听端口: ${port}`);
  });
  
  return app;
}

// 导出路由便于集成到主应用
export { router as assistantRouter }; 