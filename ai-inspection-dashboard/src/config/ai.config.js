/**
 * AI系统配置
 * 集中管理AI服务所需的API密钥、模型配置等信息
 * 注意：实际生产环境中应从环境变量或后端获取敏感信息
 */

export const AI_CONFIG = {
  // API密钥
  apiKey: 'sk-your-api-key',  // 实际生产环境应从环境变量或后端获取
  
  // OpenAI服务配置（保留作为后备）
  openai: {
    baseURL: 'https://api.openai.com/v1', // OpenAI服务地址
    timeout: 120000, // 请求超时时间，毫秒
  },
  
  // 火山引擎配置
  volcengine: {
    baseURL: 'https://maas-api.ml-platform-cn-beijing.volces.com', // 火山引擎服务地址
    apiKey: '9c0c30d5-c5e7-4608-bb90-2f9f07c056cf', // 火山引擎API密钥
    timeout: 120000, // 请求超时时间，毫秒
    // 指定火山引擎使用的是DeepSeek模型
    useDeepSeekModel: true,
    modelId: 'wp-2025060401315D-tfmvg', // 使用DeepSeek R1模型
  },
  
  // DeepSeek配置
  deepseek: {
    baseURL: 'https://api.deepseek.com', // DeepSeek服务地址
    timeout: 120000, // 请求超时时间，毫秒
  },
  
  // 模型配置
  models: {
    // 主要模型 - DeepSeek R1
    primary: {
      id: 'wp-2025060401315D-tfmvg',
      name: 'DeepSeek R1',
      provider: 'deepseek',
      temperature: 0.2,
      max_tokens: 2048,
    },
    
    // 备用模型 - DeepSeek V3
    backup: {
      id: 'wp-2025032811450D-fb7p',
      name: 'DeepSeek V3',
      provider: 'deepseek',
      temperature: 0.3,
      max_tokens: 1024,
    }
  },
  
  // 系统提示词
  systemPrompts: {
    // 质量助手核心提示词
    qualityAssistant: `你是IQE质量智能助手，一个专业的质量检验分析专家。
你熟悉物料检验、质量控制和实验室测试的各个环节。
请使用简洁专业的语言回答问题，提供数据和实用的质量改进建议。
如果用户提问含糊，请礼貌地询问详细信息。`,
    
    // 实验室助手提示词
    labAssistant: `你是IQE实验室助手，一个专业的实验数据分析专家。
你熟悉各类实验方法、测试标准和结果分析技术。
请帮助用户解读实验数据，找出异常值和趋势，提供改进建议。`,
    
    // 生产线助手提示词
    productionAssistant: `你是IQE生产线助手，一个专业的生产质量专家。
你熟悉生产过程中的质量控制点、常见问题和解决方案。
请帮助用户分析生产质量数据，识别异常状况，提供改进生产流程的建议。`,
    
    // 默认系统提示词
    default: `你是IQE质量智能助手，一个专业的质量检验分析专家。请使用简洁专业的语言回答问题。`
  },
  
  // 功能配置
  features: {
    // 是否启用自动模型切换（当主模型失败时）
    enableAutoModelSwitch: true,
    
    // 是否启用对话历史
    enableConversationHistory: true,
    
    // 最大对话历史长度
    maxConversationLength: 10,
    
    // 是否启用日志记录
    enableLogging: true,
    
    // 系统消息配置
    systemMessages: {
      welcome: '您好，我是IQE质量智能助手。我可以帮助您查询质量数据、分析实验结果等。请问有什么可以帮您？',
      error: '抱歉，AI服务出现了问题，请稍后再试。',
      dataNotFound: '抱歉，没有找到相关数据。',
      modelSwitched: '主要模型暂时不可用，已切换到备用模型。'
    }
  }
};

/**
 * 获取环境特定的AI配置
 * 根据当前环境返回适当的AI配置
 * @returns {Object} 环境特定的AI配置
 */
export function getEnvironmentConfig() {
  // 获取当前环境
  const env = import.meta.env.MODE || 'development';
  
  // 根据环境返回适当的配置
  const config = {
    api: {
      apiKey: AI_CONFIG.apiKey,
      endpoint: AI_CONFIG.openai.baseURL,
      volcengineKey: AI_CONFIG.volcengine.apiKey,
      volcengineEndpoint: AI_CONFIG.volcengine.baseURL,
      deepseekEndpoint: AI_CONFIG.deepseek.baseURL
    },
    models: AI_CONFIG.models,
    systemPrompts: AI_CONFIG.systemPrompts,
    features: AI_CONFIG.features,
    apiBaseUrl: 'http://localhost:3001/api' // 确认API基础URL与后端端口一致
  };

  // 开发环境可以有特定的配置
  if (env === 'development') {
    console.log('[AI Config] 使用开发环境配置');
    // 可以在这里设置开发环境特定的配置
    config.apiBaseUrl = 'http://localhost:3001/api';
  } 
  // 生产环境配置
  else if (env === 'production') {
    console.log('[AI Config] 使用生产环境配置');
    // 可以在这里设置生产环境特定的配置
    config.apiBaseUrl = '/api'; // 生产环境使用相对路径
  }

  return config;
}

export default AI_CONFIG; 