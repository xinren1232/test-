/**
 * 统一助手API控制器
 * 处理外部系统调用，提供HTTP接口
 */
import express from 'express';
import { randomUUID } from 'crypto';
import createError from 'http-errors';
import Joi from 'joi';
import { logger } from '../utils/logger.js';
import AssistantService from '../services/assistantService.js';

// 创建路由器
const router = express.Router();

// 验证模式
const validModes = ['auto', 'quality', 'lab', 'production'];

// 查询请求验证模式
const querySchema = Joi.object({
  query: Joi.string().required().min(1).max(1000)
    .messages({
      'string.empty': '查询内容不能为空',
      'string.min': '查询内容至少需要1个字符',
      'string.max': '查询内容不能超过1000个字符',
      'any.required': '查询内容是必需的'
    }),
  mode: Joi.string().valid(...validModes).default('auto')
    .messages({
      'any.only': '模式必须是以下之一: auto, quality, lab, production'
    }),
  sessionId: Joi.string().allow(null, ''),
  context: Joi.object().default({})
});

/**
 * 查询处理接口
 * POST /api/assistant/query
 */
router.post('/query', async (req, res, next) => {
  try {
    // 验证请求数据
    const { error, value } = querySchema.validate(req.body);
    if (error) {
      throw createError(400, error.message, { code: 'INVALID_REQUEST' });
    }
    
    const { query, mode, sessionId, context } = value;
    const requestSessionId = sessionId || randomUUID();
    
    // 处理查询
    const result = await AssistantService.handleQuery({
      query,
      mode,
      sessionId: requestSessionId,
      context,
      requestId: req.id
    });
    
    // 返回结果
    return res.json({
      success: true,
      data: {
        ...result,
        sessionId: requestSessionId
      }
    });
  } catch (error) {
    next(error); // 传递给错误处理中间件
  }
});

/**
 * 清除会话上下文
 * DELETE /api/assistant/session/:sessionId
 */
router.delete('/session/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    // 验证必要参数
    if (!sessionId) {
      throw createError(400, '会话ID不能为空', { code: 'INVALID_SESSION_ID' });
    }
    
    // 清除会话上下文
    const result = await AssistantService.clearSessionContext(sessionId);
    
    // 会话不存在
    if (!result) {
      throw createError(404, '会话不存在', { code: 'SESSION_NOT_FOUND' });
    }
    
    // 返回结果
    return res.json({
      success: true,
      data: {
        message: '会话上下文已清除',
        sessionId
      }
    });
  } catch (error) {
    next(error); // 传递给错误处理中间件
  }
});

/**
 * 获取支持的模式
 * GET /api/assistant/modes
 */
router.get('/modes', (req, res) => {
  const modes = [
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
  ];
  
  return res.json({
    success: true,
    data: {
      modes
    }
  });
});

export default router; 
 * 统一助手API控制器
 * 处理外部系统调用，提供HTTP接口
 */
import express from 'express';
import { randomUUID } from 'crypto';
import createError from 'http-errors';
import Joi from 'joi';
import { logger } from '../utils/logger.js';
import AssistantService from '../services/assistantService.js';

// 创建路由器
const router = express.Router();

// 验证模式
const validModes = ['auto', 'quality', 'lab', 'production'];

// 查询请求验证模式
const querySchema = Joi.object({
  query: Joi.string().required().min(1).max(1000)
    .messages({
      'string.empty': '查询内容不能为空',
      'string.min': '查询内容至少需要1个字符',
      'string.max': '查询内容不能超过1000个字符',
      'any.required': '查询内容是必需的'
    }),
  mode: Joi.string().valid(...validModes).default('auto')
    .messages({
      'any.only': '模式必须是以下之一: auto, quality, lab, production'
    }),
  sessionId: Joi.string().allow(null, ''),
  context: Joi.object().default({})
});

/**
 * 查询处理接口
 * POST /api/assistant/query
 */
router.post('/query', async (req, res, next) => {
  try {
    // 验证请求数据
    const { error, value } = querySchema.validate(req.body);
    if (error) {
      throw createError(400, error.message, { code: 'INVALID_REQUEST' });
    }
    
    const { query, mode, sessionId, context } = value;
    const requestSessionId = sessionId || randomUUID();
    
    // 处理查询
    const result = await AssistantService.handleQuery({
      query,
      mode,
      sessionId: requestSessionId,
      context,
      requestId: req.id
    });
    
    // 返回结果
    return res.json({
      success: true,
      data: {
        ...result,
        sessionId: requestSessionId
      }
    });
  } catch (error) {
    next(error); // 传递给错误处理中间件
  }
});

/**
 * 清除会话上下文
 * DELETE /api/assistant/session/:sessionId
 */
router.delete('/session/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    // 验证必要参数
    if (!sessionId) {
      throw createError(400, '会话ID不能为空', { code: 'INVALID_SESSION_ID' });
    }
    
    // 清除会话上下文
    const result = await AssistantService.clearSessionContext(sessionId);
    
    // 会话不存在
    if (!result) {
      throw createError(404, '会话不存在', { code: 'SESSION_NOT_FOUND' });
    }
    
    // 返回结果
    return res.json({
      success: true,
      data: {
        message: '会话上下文已清除',
        sessionId
      }
    });
  } catch (error) {
    next(error); // 传递给错误处理中间件
  }
});

/**
 * 获取支持的模式
 * GET /api/assistant/modes
 */
router.get('/modes', (req, res) => {
  const modes = [
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
  ];
  
  return res.json({
    success: true,
    data: {
      modes
    }
  });
});

export default router; 
 * 统一助手API控制器
 * 处理外部系统调用，提供HTTP接口
 */
import express from 'express';
import { randomUUID } from 'crypto';
import createError from 'http-errors';
import Joi from 'joi';
import { logger } from '../utils/logger.js';
import AssistantService from '../services/assistantService.js';

// 创建路由器
const router = express.Router();

// 验证模式
const validModes = ['auto', 'quality', 'lab', 'production'];

// 查询请求验证模式
const querySchema = Joi.object({
  query: Joi.string().required().min(1).max(1000)
    .messages({
      'string.empty': '查询内容不能为空',
      'string.min': '查询内容至少需要1个字符',
      'string.max': '查询内容不能超过1000个字符',
      'any.required': '查询内容是必需的'
    }),
  mode: Joi.string().valid(...validModes).default('auto')
    .messages({
      'any.only': '模式必须是以下之一: auto, quality, lab, production'
    }),
  sessionId: Joi.string().allow(null, ''),
  context: Joi.object().default({})
});

/**
 * 查询处理接口
 * POST /api/assistant/query
 */
router.post('/query', async (req, res, next) => {
  try {
    // 验证请求数据
    const { error, value } = querySchema.validate(req.body);
    if (error) {
      throw createError(400, error.message, { code: 'INVALID_REQUEST' });
    }
    
    const { query, mode, sessionId, context } = value;
    const requestSessionId = sessionId || randomUUID();
    
    // 处理查询
    const result = await AssistantService.handleQuery({
      query,
      mode,
      sessionId: requestSessionId,
      context,
      requestId: req.id
    });
    
    // 返回结果
    return res.json({
      success: true,
      data: {
        ...result,
        sessionId: requestSessionId
      }
    });
  } catch (error) {
    next(error); // 传递给错误处理中间件
  }
});

/**
 * 清除会话上下文
 * DELETE /api/assistant/session/:sessionId
 */
router.delete('/session/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    // 验证必要参数
    if (!sessionId) {
      throw createError(400, '会话ID不能为空', { code: 'INVALID_SESSION_ID' });
    }
    
    // 清除会话上下文
    const result = await AssistantService.clearSessionContext(sessionId);
    
    // 会话不存在
    if (!result) {
      throw createError(404, '会话不存在', { code: 'SESSION_NOT_FOUND' });
    }
    
    // 返回结果
    return res.json({
      success: true,
      data: {
        message: '会话上下文已清除',
        sessionId
      }
    });
  } catch (error) {
    next(error); // 传递给错误处理中间件
  }
});

/**
 * 获取支持的模式
 * GET /api/assistant/modes
 */
router.get('/modes', (req, res) => {
  const modes = [
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
  ];
  
  return res.json({
    success: true,
    data: {
      modes
    }
  });
});

export default router; 
 
 
 
 * 统一助手API控制器
 * 处理外部系统调用，提供HTTP接口
 */
import express from 'express';
import { randomUUID } from 'crypto';
import createError from 'http-errors';
import Joi from 'joi';
import { logger } from '../utils/logger.js';
import AssistantService from '../services/assistantService.js';

// 创建路由器
const router = express.Router();

// 验证模式
const validModes = ['auto', 'quality', 'lab', 'production'];

// 查询请求验证模式
const querySchema = Joi.object({
  query: Joi.string().required().min(1).max(1000)
    .messages({
      'string.empty': '查询内容不能为空',
      'string.min': '查询内容至少需要1个字符',
      'string.max': '查询内容不能超过1000个字符',
      'any.required': '查询内容是必需的'
    }),
  mode: Joi.string().valid(...validModes).default('auto')
    .messages({
      'any.only': '模式必须是以下之一: auto, quality, lab, production'
    }),
  sessionId: Joi.string().allow(null, ''),
  context: Joi.object().default({})
});

/**
 * 查询处理接口
 * POST /api/assistant/query
 */
router.post('/query', async (req, res, next) => {
  try {
    // 验证请求数据
    const { error, value } = querySchema.validate(req.body);
    if (error) {
      throw createError(400, error.message, { code: 'INVALID_REQUEST' });
    }
    
    const { query, mode, sessionId, context } = value;
    const requestSessionId = sessionId || randomUUID();
    
    // 处理查询
    const result = await AssistantService.handleQuery({
      query,
      mode,
      sessionId: requestSessionId,
      context,
      requestId: req.id
    });
    
    // 返回结果
    return res.json({
      success: true,
      data: {
        ...result,
        sessionId: requestSessionId
      }
    });
  } catch (error) {
    next(error); // 传递给错误处理中间件
  }
});

/**
 * 清除会话上下文
 * DELETE /api/assistant/session/:sessionId
 */
router.delete('/session/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    // 验证必要参数
    if (!sessionId) {
      throw createError(400, '会话ID不能为空', { code: 'INVALID_SESSION_ID' });
    }
    
    // 清除会话上下文
    const result = await AssistantService.clearSessionContext(sessionId);
    
    // 会话不存在
    if (!result) {
      throw createError(404, '会话不存在', { code: 'SESSION_NOT_FOUND' });
    }
    
    // 返回结果
    return res.json({
      success: true,
      data: {
        message: '会话上下文已清除',
        sessionId
      }
    });
  } catch (error) {
    next(error); // 传递给错误处理中间件
  }
});

/**
 * 获取支持的模式
 * GET /api/assistant/modes
 */
router.get('/modes', (req, res) => {
  const modes = [
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
  ];
  
  return res.json({
    success: true,
    data: {
      modes
    }
  });
});

export default router; 
 * 统一助手API控制器
 * 处理外部系统调用，提供HTTP接口
 */
import express from 'express';
import { randomUUID } from 'crypto';
import createError from 'http-errors';
import Joi from 'joi';
import { logger } from '../utils/logger.js';
import AssistantService from '../services/assistantService.js';

// 创建路由器
const router = express.Router();

// 验证模式
const validModes = ['auto', 'quality', 'lab', 'production'];

// 查询请求验证模式
const querySchema = Joi.object({
  query: Joi.string().required().min(1).max(1000)
    .messages({
      'string.empty': '查询内容不能为空',
      'string.min': '查询内容至少需要1个字符',
      'string.max': '查询内容不能超过1000个字符',
      'any.required': '查询内容是必需的'
    }),
  mode: Joi.string().valid(...validModes).default('auto')
    .messages({
      'any.only': '模式必须是以下之一: auto, quality, lab, production'
    }),
  sessionId: Joi.string().allow(null, ''),
  context: Joi.object().default({})
});

/**
 * 查询处理接口
 * POST /api/assistant/query
 */
router.post('/query', async (req, res, next) => {
  try {
    // 验证请求数据
    const { error, value } = querySchema.validate(req.body);
    if (error) {
      throw createError(400, error.message, { code: 'INVALID_REQUEST' });
    }
    
    const { query, mode, sessionId, context } = value;
    const requestSessionId = sessionId || randomUUID();
    
    // 处理查询
    const result = await AssistantService.handleQuery({
      query,
      mode,
      sessionId: requestSessionId,
      context,
      requestId: req.id
    });
    
    // 返回结果
    return res.json({
      success: true,
      data: {
        ...result,
        sessionId: requestSessionId
      }
    });
  } catch (error) {
    next(error); // 传递给错误处理中间件
  }
});

/**
 * 清除会话上下文
 * DELETE /api/assistant/session/:sessionId
 */
router.delete('/session/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    // 验证必要参数
    if (!sessionId) {
      throw createError(400, '会话ID不能为空', { code: 'INVALID_SESSION_ID' });
    }
    
    // 清除会话上下文
    const result = await AssistantService.clearSessionContext(sessionId);
    
    // 会话不存在
    if (!result) {
      throw createError(404, '会话不存在', { code: 'SESSION_NOT_FOUND' });
    }
    
    // 返回结果
    return res.json({
      success: true,
      data: {
        message: '会话上下文已清除',
        sessionId
      }
    });
  } catch (error) {
    next(error); // 传递给错误处理中间件
  }
});

/**
 * 获取支持的模式
 * GET /api/assistant/modes
 */
router.get('/modes', (req, res) => {
  const modes = [
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
  ];
  
  return res.json({
    success: true,
    data: {
      modes
    }
  });
});

export default router; 
 * 统一助手API控制器
 * 处理外部系统调用，提供HTTP接口
 */
import express from 'express';
import { randomUUID } from 'crypto';
import createError from 'http-errors';
import Joi from 'joi';
import { logger } from '../utils/logger.js';
import AssistantService from '../services/assistantService.js';

// 创建路由器
const router = express.Router();

// 验证模式
const validModes = ['auto', 'quality', 'lab', 'production'];

// 查询请求验证模式
const querySchema = Joi.object({
  query: Joi.string().required().min(1).max(1000)
    .messages({
      'string.empty': '查询内容不能为空',
      'string.min': '查询内容至少需要1个字符',
      'string.max': '查询内容不能超过1000个字符',
      'any.required': '查询内容是必需的'
    }),
  mode: Joi.string().valid(...validModes).default('auto')
    .messages({
      'any.only': '模式必须是以下之一: auto, quality, lab, production'
    }),
  sessionId: Joi.string().allow(null, ''),
  context: Joi.object().default({})
});

/**
 * 查询处理接口
 * POST /api/assistant/query
 */
router.post('/query', async (req, res, next) => {
  try {
    // 验证请求数据
    const { error, value } = querySchema.validate(req.body);
    if (error) {
      throw createError(400, error.message, { code: 'INVALID_REQUEST' });
    }
    
    const { query, mode, sessionId, context } = value;
    const requestSessionId = sessionId || randomUUID();
    
    // 处理查询
    const result = await AssistantService.handleQuery({
      query,
      mode,
      sessionId: requestSessionId,
      context,
      requestId: req.id
    });
    
    // 返回结果
    return res.json({
      success: true,
      data: {
        ...result,
        sessionId: requestSessionId
      }
    });
  } catch (error) {
    next(error); // 传递给错误处理中间件
  }
});

/**
 * 清除会话上下文
 * DELETE /api/assistant/session/:sessionId
 */
router.delete('/session/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    // 验证必要参数
    if (!sessionId) {
      throw createError(400, '会话ID不能为空', { code: 'INVALID_SESSION_ID' });
    }
    
    // 清除会话上下文
    const result = await AssistantService.clearSessionContext(sessionId);
    
    // 会话不存在
    if (!result) {
      throw createError(404, '会话不存在', { code: 'SESSION_NOT_FOUND' });
    }
    
    // 返回结果
    return res.json({
      success: true,
      data: {
        message: '会话上下文已清除',
        sessionId
      }
    });
  } catch (error) {
    next(error); // 传递给错误处理中间件
  }
});

/**
 * 获取支持的模式
 * GET /api/assistant/modes
 */
router.get('/modes', (req, res) => {
  const modes = [
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
  ];
  
  return res.json({
    success: true,
    data: {
      modes
    }
  });
});

export default router; 
 
 
 
 * 统一助手API控制器
 * 处理外部系统调用，提供HTTP接口
 */
import express from 'express';
import { randomUUID } from 'crypto';
import createError from 'http-errors';
import Joi from 'joi';
import { logger } from '../utils/logger.js';
import AssistantService from '../services/assistantService.js';

// 创建路由器
const router = express.Router();

// 验证模式
const validModes = ['auto', 'quality', 'lab', 'production'];

// 查询请求验证模式
const querySchema = Joi.object({
  query: Joi.string().required().min(1).max(1000)
    .messages({
      'string.empty': '查询内容不能为空',
      'string.min': '查询内容至少需要1个字符',
      'string.max': '查询内容不能超过1000个字符',
      'any.required': '查询内容是必需的'
    }),
  mode: Joi.string().valid(...validModes).default('auto')
    .messages({
      'any.only': '模式必须是以下之一: auto, quality, lab, production'
    }),
  sessionId: Joi.string().allow(null, ''),
  context: Joi.object().default({})
});

/**
 * 查询处理接口
 * POST /api/assistant/query
 */
router.post('/query', async (req, res, next) => {
  try {
    // 验证请求数据
    const { error, value } = querySchema.validate(req.body);
    if (error) {
      throw createError(400, error.message, { code: 'INVALID_REQUEST' });
    }
    
    const { query, mode, sessionId, context } = value;
    const requestSessionId = sessionId || randomUUID();
    
    // 处理查询
    const result = await AssistantService.handleQuery({
      query,
      mode,
      sessionId: requestSessionId,
      context,
      requestId: req.id
    });
    
    // 返回结果
    return res.json({
      success: true,
      data: {
        ...result,
        sessionId: requestSessionId
      }
    });
  } catch (error) {
    next(error); // 传递给错误处理中间件
  }
});

/**
 * 清除会话上下文
 * DELETE /api/assistant/session/:sessionId
 */
router.delete('/session/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    // 验证必要参数
    if (!sessionId) {
      throw createError(400, '会话ID不能为空', { code: 'INVALID_SESSION_ID' });
    }
    
    // 清除会话上下文
    const result = await AssistantService.clearSessionContext(sessionId);
    
    // 会话不存在
    if (!result) {
      throw createError(404, '会话不存在', { code: 'SESSION_NOT_FOUND' });
    }
    
    // 返回结果
    return res.json({
      success: true,
      data: {
        message: '会话上下文已清除',
        sessionId
      }
    });
  } catch (error) {
    next(error); // 传递给错误处理中间件
  }
});

/**
 * 获取支持的模式
 * GET /api/assistant/modes
 */
router.get('/modes', (req, res) => {
  const modes = [
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
  ];
  
  return res.json({
    success: true,
    data: {
      modes
    }
  });
});

export default router; 
 * 统一助手API控制器
 * 处理外部系统调用，提供HTTP接口
 */
import express from 'express';
import { randomUUID } from 'crypto';
import createError from 'http-errors';
import Joi from 'joi';
import { logger } from '../utils/logger.js';
import AssistantService from '../services/assistantService.js';

// 创建路由器
const router = express.Router();

// 验证模式
const validModes = ['auto', 'quality', 'lab', 'production'];

// 查询请求验证模式
const querySchema = Joi.object({
  query: Joi.string().required().min(1).max(1000)
    .messages({
      'string.empty': '查询内容不能为空',
      'string.min': '查询内容至少需要1个字符',
      'string.max': '查询内容不能超过1000个字符',
      'any.required': '查询内容是必需的'
    }),
  mode: Joi.string().valid(...validModes).default('auto')
    .messages({
      'any.only': '模式必须是以下之一: auto, quality, lab, production'
    }),
  sessionId: Joi.string().allow(null, ''),
  context: Joi.object().default({})
});

/**
 * 查询处理接口
 * POST /api/assistant/query
 */
router.post('/query', async (req, res, next) => {
  try {
    // 验证请求数据
    const { error, value } = querySchema.validate(req.body);
    if (error) {
      throw createError(400, error.message, { code: 'INVALID_REQUEST' });
    }
    
    const { query, mode, sessionId, context } = value;
    const requestSessionId = sessionId || randomUUID();
    
    // 处理查询
    const result = await AssistantService.handleQuery({
      query,
      mode,
      sessionId: requestSessionId,
      context,
      requestId: req.id
    });
    
    // 返回结果
    return res.json({
      success: true,
      data: {
        ...result,
        sessionId: requestSessionId
      }
    });
  } catch (error) {
    next(error); // 传递给错误处理中间件
  }
});

/**
 * 清除会话上下文
 * DELETE /api/assistant/session/:sessionId
 */
router.delete('/session/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    // 验证必要参数
    if (!sessionId) {
      throw createError(400, '会话ID不能为空', { code: 'INVALID_SESSION_ID' });
    }
    
    // 清除会话上下文
    const result = await AssistantService.clearSessionContext(sessionId);
    
    // 会话不存在
    if (!result) {
      throw createError(404, '会话不存在', { code: 'SESSION_NOT_FOUND' });
    }
    
    // 返回结果
    return res.json({
      success: true,
      data: {
        message: '会话上下文已清除',
        sessionId
      }
    });
  } catch (error) {
    next(error); // 传递给错误处理中间件
  }
});

/**
 * 获取支持的模式
 * GET /api/assistant/modes
 */
router.get('/modes', (req, res) => {
  const modes = [
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
  ];
  
  return res.json({
    success: true,
    data: {
      modes
    }
  });
});

export default router; 
 * 统一助手API控制器
 * 处理外部系统调用，提供HTTP接口
 */
import express from 'express';
import { randomUUID } from 'crypto';
import createError from 'http-errors';
import Joi from 'joi';
import { logger } from '../utils/logger.js';
import AssistantService from '../services/assistantService.js';

// 创建路由器
const router = express.Router();

// 验证模式
const validModes = ['auto', 'quality', 'lab', 'production'];

// 查询请求验证模式
const querySchema = Joi.object({
  query: Joi.string().required().min(1).max(1000)
    .messages({
      'string.empty': '查询内容不能为空',
      'string.min': '查询内容至少需要1个字符',
      'string.max': '查询内容不能超过1000个字符',
      'any.required': '查询内容是必需的'
    }),
  mode: Joi.string().valid(...validModes).default('auto')
    .messages({
      'any.only': '模式必须是以下之一: auto, quality, lab, production'
    }),
  sessionId: Joi.string().allow(null, ''),
  context: Joi.object().default({})
});

/**
 * 查询处理接口
 * POST /api/assistant/query
 */
router.post('/query', async (req, res, next) => {
  try {
    // 验证请求数据
    const { error, value } = querySchema.validate(req.body);
    if (error) {
      throw createError(400, error.message, { code: 'INVALID_REQUEST' });
    }
    
    const { query, mode, sessionId, context } = value;
    const requestSessionId = sessionId || randomUUID();
    
    // 处理查询
    const result = await AssistantService.handleQuery({
      query,
      mode,
      sessionId: requestSessionId,
      context,
      requestId: req.id
    });
    
    // 返回结果
    return res.json({
      success: true,
      data: {
        ...result,
        sessionId: requestSessionId
      }
    });
  } catch (error) {
    next(error); // 传递给错误处理中间件
  }
});

/**
 * 清除会话上下文
 * DELETE /api/assistant/session/:sessionId
 */
router.delete('/session/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    // 验证必要参数
    if (!sessionId) {
      throw createError(400, '会话ID不能为空', { code: 'INVALID_SESSION_ID' });
    }
    
    // 清除会话上下文
    const result = await AssistantService.clearSessionContext(sessionId);
    
    // 会话不存在
    if (!result) {
      throw createError(404, '会话不存在', { code: 'SESSION_NOT_FOUND' });
    }
    
    // 返回结果
    return res.json({
      success: true,
      data: {
        message: '会话上下文已清除',
        sessionId
      }
    });
  } catch (error) {
    next(error); // 传递给错误处理中间件
  }
});

/**
 * 获取支持的模式
 * GET /api/assistant/modes
 */
router.get('/modes', (req, res) => {
  const modes = [
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
  ];
  
  return res.json({
    success: true,
    data: {
      modes
    }
  });
});

export default router; 
 
 
 