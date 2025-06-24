/**
 * AI助手配置文件
 * 配置DeepSeek AI助手的相关参数
 */

export default {
  // 基础配置
  model: 'deepseek-chat',
  name: 'IQE智能质检助手',
  
  // API端点配置 - DeepSeek API
  endpoints: {
    chat: 'https://api.deepseek.com/v1/chat/completions',
    imageAnalysis: 'https://api.deepseek.com/v1/images/generations',
    status: 'https://api.deepseek.com/v1/status'
  },
  
  // API认证
  auth: {
    apiKey: 'sk-cab797574abf4288bcfaca253191565d',
    organizationId: ''
  },
  
  // 模型配置
  models: {
    chat: 'deepseek-chat',
    reasoning: 'deepseek-reasoner'
  },
  
  // 请求配置
  request: {
    timeout: 30000, // 30秒超时
    retry: {
      maxAttempts: 3,
      delayMs: 1000
    },
    debug: true // 开启调试日志
  },
  
  // 备用响应配置（当API不可用时使用）
  fallbackResponses: {
    welcome: '您好，我是IQE智能质检助手。我可以帮您查询质量数据、分析风险批次、解答质检问题，请问有什么可以帮您？',
    error: '抱歉，我暂时无法连接到服务器。请稍后再试或联系系统管理员。',
    imageReceived: '我已收到您上传的图片。请问您希望我如何分析这张图片？我可以提取图中的质检数据、识别物料或分析缺陷。'
  },
  
  // UI配置
  ui: {
    avatar: '/assets/ai-avatar.png',
    userAvatar: '/assets/user-avatar.png',
    minimizedByDefault: false,
    mobileAutoMinimize: true
  },
  
  // 上下文配置
  context: {
    includePageInfo: true,
    includeTimestamp: true,
    includeUserInfo: false
  }
}; 