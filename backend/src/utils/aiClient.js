/**
 * AI客户端工具
 * 提供与AI服务通信的功能
 */
import { logger } from './logger.js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 默认选项
const defaultOptions = {
  model: process.env.AI_MODEL || 'gpt-4o',
  temperature: 0.5,
  max_tokens: 2000,
  stream: false,
  functions: []
};

/**
 * 发送请求到AI服务
 * @param {Object} options 请求选项
 * @param {Array} options.messages 消息列表
 * @param {number} options.temperature 温度参数
 * @param {Array} options.functions 函数列表
 * @param {boolean} options.stream 是否流式响应
 * @returns {Promise<Object>} AI响应
 */
export async function sendToAIService(options) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    logger.error('未配置AI API密钥');
    return mockAIResponse(options);
  }
  
  const { messages, temperature, functions, stream } = {
    ...defaultOptions,
    ...options
  };
  
  // 完整请求配置
  const requestOptions = {
    model: defaultOptions.model,
    messages,
    temperature,
    max_tokens: defaultOptions.max_tokens,
    stream
  };
  
  // 如果提供了函数，添加到请求中
  if (functions && functions.length > 0) {
    requestOptions.functions = functions;
    requestOptions.function_call = 'auto';
  }
  
  try {
    logger.info('发送请求到AI服务', {
      model: requestOptions.model,
      messageCount: messages.length,
      functionCount: functions?.length || 0
    });
    
    // 目前使用模拟响应，实际集成时替换为真实API调用
    return await mockAIResponse(options);
    
    /* 实际集成OpenAI API的代码：
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestOptions)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`AI API错误: ${error.error?.message || response.statusText}`);
    }
    
    const result = await response.json();
    return parseAIResponse(result);
    */
  } catch (error) {
    logger.error('AI服务请求失败', { error: error.message });
    throw new Error(`与AI服务通信时出错: ${error.message}`);
  }
}

/**
 * 解析AI响应
 * @param {Object} response OpenAI API响应
 * @returns {Object} 处理后的响应
 */
function parseAIResponse(response) {
  const message = response.choices[0].message;
  
  // 提取内容
  const content = message.content || '';
  
  // 处理函数调用结果
  let functionResults = null;
  if (message.function_call) {
    try {
      const functionName = message.function_call.name;
      const functionArgs = JSON.parse(message.function_call.arguments);
      
      // 在实际应用中，这里应该调用相应的函数
      functionResults = {
        function: functionName,
        arguments: functionArgs,
        // 模拟函数执行结果
        result: { success: true, data: {} }
      };
    } catch (error) {
      logger.error('解析函数调用参数失败', { error: error.message });
    }
  }
  
  return {
    content,
    functionResults,
    usage: response.usage
  };
}

/**
 * 模拟AI响应
 * 用于开发和测试
 * @param {Object} options 请求选项
 * @returns {Promise<Object>} 模拟的AI响应
 */
async function mockAIResponse(options) {
  const { messages, functions } = options;
  
  // 获取最后一个用户消息
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
  
  // 基于模式和查询内容生成模拟响应
  let content = '';
  let functionResults = null;
  
  // 检查是否需要函数调用
  if (functions && functions.length > 0 && 
      (lastUserMessage.includes('数据') || 
       lastUserMessage.includes('分析') || 
       lastUserMessage.includes('统计'))) {
    
    // 随机选择一个函数
    const selectedFunction = functions[Math.floor(Math.random() * functions.length)];
    
    // 模拟函数调用结果
    functionResults = {
      function: selectedFunction.name,
      arguments: {}, // 在实际应用中应填充合适的参数
      result: {
        success: true,
        data: {
          // 模拟数据
          total: 42,
          items: [
            { id: '001', name: '示例1', value: 98.5 },
            { id: '002', name: '示例2', value: 87.2 }
          ]
        }
      }
    };
    
    content = `根据您的查询，我已获取相关数据信息。数据显示有${functionResults.result.data.total}条记录，其中包括${functionResults.result.data.items.length}个示例项。`;
  } else {
    // 生成普通文本响应
    if (lastUserMessage.includes('实验室') || lastUserMessage.includes('测试')) {
      content = '根据实验室最新测试结果，所有参数均在标准范围内。您可以查询具体物料的测试数据获取更详细信息。';
    } else if (lastUserMessage.includes('质量') || lastUserMessage.includes('不良品')) {
      content = '本月质量检验合格率为97.8%，比上月提高0.3个百分点。主要不良类型为"表面划痕"，占不良品的35%。';
    } else if (lastUserMessage.includes('生产') || lastUserMessage.includes('产线')) {
      content = '当前生产线运行状态正常，产能利用率为92%。2号产线设备已排定本周五进行例行维护。';
    } else {
      content = '您好，我是IQE智能质检系统统一助手。我可以帮助您查询质量检验、实验室测试和生产线相关的信息。请问有什么可以帮助您的？';
    }
  }
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    content,
    functionResults,
    usage: {
      prompt_tokens: 300,
      completion_tokens: content.length,
      total_tokens: 300 + content.length
    }
  };
} 
 * AI客户端工具
 * 提供与AI服务通信的功能
 */
import { logger } from './logger.js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 默认选项
const defaultOptions = {
  model: process.env.AI_MODEL || 'gpt-4o',
  temperature: 0.5,
  max_tokens: 2000,
  stream: false,
  functions: []
};

/**
 * 发送请求到AI服务
 * @param {Object} options 请求选项
 * @param {Array} options.messages 消息列表
 * @param {number} options.temperature 温度参数
 * @param {Array} options.functions 函数列表
 * @param {boolean} options.stream 是否流式响应
 * @returns {Promise<Object>} AI响应
 */
export async function sendToAIService(options) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    logger.error('未配置AI API密钥');
    return mockAIResponse(options);
  }
  
  const { messages, temperature, functions, stream } = {
    ...defaultOptions,
    ...options
  };
  
  // 完整请求配置
  const requestOptions = {
    model: defaultOptions.model,
    messages,
    temperature,
    max_tokens: defaultOptions.max_tokens,
    stream
  };
  
  // 如果提供了函数，添加到请求中
  if (functions && functions.length > 0) {
    requestOptions.functions = functions;
    requestOptions.function_call = 'auto';
  }
  
  try {
    logger.info('发送请求到AI服务', {
      model: requestOptions.model,
      messageCount: messages.length,
      functionCount: functions?.length || 0
    });
    
    // 目前使用模拟响应，实际集成时替换为真实API调用
    return await mockAIResponse(options);
    
    /* 实际集成OpenAI API的代码：
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestOptions)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`AI API错误: ${error.error?.message || response.statusText}`);
    }
    
    const result = await response.json();
    return parseAIResponse(result);
    */
  } catch (error) {
    logger.error('AI服务请求失败', { error: error.message });
    throw new Error(`与AI服务通信时出错: ${error.message}`);
  }
}

/**
 * 解析AI响应
 * @param {Object} response OpenAI API响应
 * @returns {Object} 处理后的响应
 */
function parseAIResponse(response) {
  const message = response.choices[0].message;
  
  // 提取内容
  const content = message.content || '';
  
  // 处理函数调用结果
  let functionResults = null;
  if (message.function_call) {
    try {
      const functionName = message.function_call.name;
      const functionArgs = JSON.parse(message.function_call.arguments);
      
      // 在实际应用中，这里应该调用相应的函数
      functionResults = {
        function: functionName,
        arguments: functionArgs,
        // 模拟函数执行结果
        result: { success: true, data: {} }
      };
    } catch (error) {
      logger.error('解析函数调用参数失败', { error: error.message });
    }
  }
  
  return {
    content,
    functionResults,
    usage: response.usage
  };
}

/**
 * 模拟AI响应
 * 用于开发和测试
 * @param {Object} options 请求选项
 * @returns {Promise<Object>} 模拟的AI响应
 */
async function mockAIResponse(options) {
  const { messages, functions } = options;
  
  // 获取最后一个用户消息
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
  
  // 基于模式和查询内容生成模拟响应
  let content = '';
  let functionResults = null;
  
  // 检查是否需要函数调用
  if (functions && functions.length > 0 && 
      (lastUserMessage.includes('数据') || 
       lastUserMessage.includes('分析') || 
       lastUserMessage.includes('统计'))) {
    
    // 随机选择一个函数
    const selectedFunction = functions[Math.floor(Math.random() * functions.length)];
    
    // 模拟函数调用结果
    functionResults = {
      function: selectedFunction.name,
      arguments: {}, // 在实际应用中应填充合适的参数
      result: {
        success: true,
        data: {
          // 模拟数据
          total: 42,
          items: [
            { id: '001', name: '示例1', value: 98.5 },
            { id: '002', name: '示例2', value: 87.2 }
          ]
        }
      }
    };
    
    content = `根据您的查询，我已获取相关数据信息。数据显示有${functionResults.result.data.total}条记录，其中包括${functionResults.result.data.items.length}个示例项。`;
  } else {
    // 生成普通文本响应
    if (lastUserMessage.includes('实验室') || lastUserMessage.includes('测试')) {
      content = '根据实验室最新测试结果，所有参数均在标准范围内。您可以查询具体物料的测试数据获取更详细信息。';
    } else if (lastUserMessage.includes('质量') || lastUserMessage.includes('不良品')) {
      content = '本月质量检验合格率为97.8%，比上月提高0.3个百分点。主要不良类型为"表面划痕"，占不良品的35%。';
    } else if (lastUserMessage.includes('生产') || lastUserMessage.includes('产线')) {
      content = '当前生产线运行状态正常，产能利用率为92%。2号产线设备已排定本周五进行例行维护。';
    } else {
      content = '您好，我是IQE智能质检系统统一助手。我可以帮助您查询质量检验、实验室测试和生产线相关的信息。请问有什么可以帮助您的？';
    }
  }
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    content,
    functionResults,
    usage: {
      prompt_tokens: 300,
      completion_tokens: content.length,
      total_tokens: 300 + content.length
    }
  };
} 
 * AI客户端工具
 * 提供与AI服务通信的功能
 */
import { logger } from './logger.js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 默认选项
const defaultOptions = {
  model: process.env.AI_MODEL || 'gpt-4o',
  temperature: 0.5,
  max_tokens: 2000,
  stream: false,
  functions: []
};

/**
 * 发送请求到AI服务
 * @param {Object} options 请求选项
 * @param {Array} options.messages 消息列表
 * @param {number} options.temperature 温度参数
 * @param {Array} options.functions 函数列表
 * @param {boolean} options.stream 是否流式响应
 * @returns {Promise<Object>} AI响应
 */
export async function sendToAIService(options) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    logger.error('未配置AI API密钥');
    return mockAIResponse(options);
  }
  
  const { messages, temperature, functions, stream } = {
    ...defaultOptions,
    ...options
  };
  
  // 完整请求配置
  const requestOptions = {
    model: defaultOptions.model,
    messages,
    temperature,
    max_tokens: defaultOptions.max_tokens,
    stream
  };
  
  // 如果提供了函数，添加到请求中
  if (functions && functions.length > 0) {
    requestOptions.functions = functions;
    requestOptions.function_call = 'auto';
  }
  
  try {
    logger.info('发送请求到AI服务', {
      model: requestOptions.model,
      messageCount: messages.length,
      functionCount: functions?.length || 0
    });
    
    // 目前使用模拟响应，实际集成时替换为真实API调用
    return await mockAIResponse(options);
    
    /* 实际集成OpenAI API的代码：
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestOptions)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`AI API错误: ${error.error?.message || response.statusText}`);
    }
    
    const result = await response.json();
    return parseAIResponse(result);
    */
  } catch (error) {
    logger.error('AI服务请求失败', { error: error.message });
    throw new Error(`与AI服务通信时出错: ${error.message}`);
  }
}

/**
 * 解析AI响应
 * @param {Object} response OpenAI API响应
 * @returns {Object} 处理后的响应
 */
function parseAIResponse(response) {
  const message = response.choices[0].message;
  
  // 提取内容
  const content = message.content || '';
  
  // 处理函数调用结果
  let functionResults = null;
  if (message.function_call) {
    try {
      const functionName = message.function_call.name;
      const functionArgs = JSON.parse(message.function_call.arguments);
      
      // 在实际应用中，这里应该调用相应的函数
      functionResults = {
        function: functionName,
        arguments: functionArgs,
        // 模拟函数执行结果
        result: { success: true, data: {} }
      };
    } catch (error) {
      logger.error('解析函数调用参数失败', { error: error.message });
    }
  }
  
  return {
    content,
    functionResults,
    usage: response.usage
  };
}

/**
 * 模拟AI响应
 * 用于开发和测试
 * @param {Object} options 请求选项
 * @returns {Promise<Object>} 模拟的AI响应
 */
async function mockAIResponse(options) {
  const { messages, functions } = options;
  
  // 获取最后一个用户消息
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
  
  // 基于模式和查询内容生成模拟响应
  let content = '';
  let functionResults = null;
  
  // 检查是否需要函数调用
  if (functions && functions.length > 0 && 
      (lastUserMessage.includes('数据') || 
       lastUserMessage.includes('分析') || 
       lastUserMessage.includes('统计'))) {
    
    // 随机选择一个函数
    const selectedFunction = functions[Math.floor(Math.random() * functions.length)];
    
    // 模拟函数调用结果
    functionResults = {
      function: selectedFunction.name,
      arguments: {}, // 在实际应用中应填充合适的参数
      result: {
        success: true,
        data: {
          // 模拟数据
          total: 42,
          items: [
            { id: '001', name: '示例1', value: 98.5 },
            { id: '002', name: '示例2', value: 87.2 }
          ]
        }
      }
    };
    
    content = `根据您的查询，我已获取相关数据信息。数据显示有${functionResults.result.data.total}条记录，其中包括${functionResults.result.data.items.length}个示例项。`;
  } else {
    // 生成普通文本响应
    if (lastUserMessage.includes('实验室') || lastUserMessage.includes('测试')) {
      content = '根据实验室最新测试结果，所有参数均在标准范围内。您可以查询具体物料的测试数据获取更详细信息。';
    } else if (lastUserMessage.includes('质量') || lastUserMessage.includes('不良品')) {
      content = '本月质量检验合格率为97.8%，比上月提高0.3个百分点。主要不良类型为"表面划痕"，占不良品的35%。';
    } else if (lastUserMessage.includes('生产') || lastUserMessage.includes('产线')) {
      content = '当前生产线运行状态正常，产能利用率为92%。2号产线设备已排定本周五进行例行维护。';
    } else {
      content = '您好，我是IQE智能质检系统统一助手。我可以帮助您查询质量检验、实验室测试和生产线相关的信息。请问有什么可以帮助您的？';
    }
  }
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    content,
    functionResults,
    usage: {
      prompt_tokens: 300,
      completion_tokens: content.length,
      total_tokens: 300 + content.length
    }
  };
} 
 
 
 
 * AI客户端工具
 * 提供与AI服务通信的功能
 */
import { logger } from './logger.js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 默认选项
const defaultOptions = {
  model: process.env.AI_MODEL || 'gpt-4o',
  temperature: 0.5,
  max_tokens: 2000,
  stream: false,
  functions: []
};

/**
 * 发送请求到AI服务
 * @param {Object} options 请求选项
 * @param {Array} options.messages 消息列表
 * @param {number} options.temperature 温度参数
 * @param {Array} options.functions 函数列表
 * @param {boolean} options.stream 是否流式响应
 * @returns {Promise<Object>} AI响应
 */
export async function sendToAIService(options) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    logger.error('未配置AI API密钥');
    return mockAIResponse(options);
  }
  
  const { messages, temperature, functions, stream } = {
    ...defaultOptions,
    ...options
  };
  
  // 完整请求配置
  const requestOptions = {
    model: defaultOptions.model,
    messages,
    temperature,
    max_tokens: defaultOptions.max_tokens,
    stream
  };
  
  // 如果提供了函数，添加到请求中
  if (functions && functions.length > 0) {
    requestOptions.functions = functions;
    requestOptions.function_call = 'auto';
  }
  
  try {
    logger.info('发送请求到AI服务', {
      model: requestOptions.model,
      messageCount: messages.length,
      functionCount: functions?.length || 0
    });
    
    // 目前使用模拟响应，实际集成时替换为真实API调用
    return await mockAIResponse(options);
    
    /* 实际集成OpenAI API的代码：
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestOptions)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`AI API错误: ${error.error?.message || response.statusText}`);
    }
    
    const result = await response.json();
    return parseAIResponse(result);
    */
  } catch (error) {
    logger.error('AI服务请求失败', { error: error.message });
    throw new Error(`与AI服务通信时出错: ${error.message}`);
  }
}

/**
 * 解析AI响应
 * @param {Object} response OpenAI API响应
 * @returns {Object} 处理后的响应
 */
function parseAIResponse(response) {
  const message = response.choices[0].message;
  
  // 提取内容
  const content = message.content || '';
  
  // 处理函数调用结果
  let functionResults = null;
  if (message.function_call) {
    try {
      const functionName = message.function_call.name;
      const functionArgs = JSON.parse(message.function_call.arguments);
      
      // 在实际应用中，这里应该调用相应的函数
      functionResults = {
        function: functionName,
        arguments: functionArgs,
        // 模拟函数执行结果
        result: { success: true, data: {} }
      };
    } catch (error) {
      logger.error('解析函数调用参数失败', { error: error.message });
    }
  }
  
  return {
    content,
    functionResults,
    usage: response.usage
  };
}

/**
 * 模拟AI响应
 * 用于开发和测试
 * @param {Object} options 请求选项
 * @returns {Promise<Object>} 模拟的AI响应
 */
async function mockAIResponse(options) {
  const { messages, functions } = options;
  
  // 获取最后一个用户消息
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
  
  // 基于模式和查询内容生成模拟响应
  let content = '';
  let functionResults = null;
  
  // 检查是否需要函数调用
  if (functions && functions.length > 0 && 
      (lastUserMessage.includes('数据') || 
       lastUserMessage.includes('分析') || 
       lastUserMessage.includes('统计'))) {
    
    // 随机选择一个函数
    const selectedFunction = functions[Math.floor(Math.random() * functions.length)];
    
    // 模拟函数调用结果
    functionResults = {
      function: selectedFunction.name,
      arguments: {}, // 在实际应用中应填充合适的参数
      result: {
        success: true,
        data: {
          // 模拟数据
          total: 42,
          items: [
            { id: '001', name: '示例1', value: 98.5 },
            { id: '002', name: '示例2', value: 87.2 }
          ]
        }
      }
    };
    
    content = `根据您的查询，我已获取相关数据信息。数据显示有${functionResults.result.data.total}条记录，其中包括${functionResults.result.data.items.length}个示例项。`;
  } else {
    // 生成普通文本响应
    if (lastUserMessage.includes('实验室') || lastUserMessage.includes('测试')) {
      content = '根据实验室最新测试结果，所有参数均在标准范围内。您可以查询具体物料的测试数据获取更详细信息。';
    } else if (lastUserMessage.includes('质量') || lastUserMessage.includes('不良品')) {
      content = '本月质量检验合格率为97.8%，比上月提高0.3个百分点。主要不良类型为"表面划痕"，占不良品的35%。';
    } else if (lastUserMessage.includes('生产') || lastUserMessage.includes('产线')) {
      content = '当前生产线运行状态正常，产能利用率为92%。2号产线设备已排定本周五进行例行维护。';
    } else {
      content = '您好，我是IQE智能质检系统统一助手。我可以帮助您查询质量检验、实验室测试和生产线相关的信息。请问有什么可以帮助您的？';
    }
  }
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    content,
    functionResults,
    usage: {
      prompt_tokens: 300,
      completion_tokens: content.length,
      total_tokens: 300 + content.length
    }
  };
} 
 * AI客户端工具
 * 提供与AI服务通信的功能
 */
import { logger } from './logger.js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 默认选项
const defaultOptions = {
  model: process.env.AI_MODEL || 'gpt-4o',
  temperature: 0.5,
  max_tokens: 2000,
  stream: false,
  functions: []
};

/**
 * 发送请求到AI服务
 * @param {Object} options 请求选项
 * @param {Array} options.messages 消息列表
 * @param {number} options.temperature 温度参数
 * @param {Array} options.functions 函数列表
 * @param {boolean} options.stream 是否流式响应
 * @returns {Promise<Object>} AI响应
 */
export async function sendToAIService(options) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    logger.error('未配置AI API密钥');
    return mockAIResponse(options);
  }
  
  const { messages, temperature, functions, stream } = {
    ...defaultOptions,
    ...options
  };
  
  // 完整请求配置
  const requestOptions = {
    model: defaultOptions.model,
    messages,
    temperature,
    max_tokens: defaultOptions.max_tokens,
    stream
  };
  
  // 如果提供了函数，添加到请求中
  if (functions && functions.length > 0) {
    requestOptions.functions = functions;
    requestOptions.function_call = 'auto';
  }
  
  try {
    logger.info('发送请求到AI服务', {
      model: requestOptions.model,
      messageCount: messages.length,
      functionCount: functions?.length || 0
    });
    
    // 目前使用模拟响应，实际集成时替换为真实API调用
    return await mockAIResponse(options);
    
    /* 实际集成OpenAI API的代码：
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestOptions)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`AI API错误: ${error.error?.message || response.statusText}`);
    }
    
    const result = await response.json();
    return parseAIResponse(result);
    */
  } catch (error) {
    logger.error('AI服务请求失败', { error: error.message });
    throw new Error(`与AI服务通信时出错: ${error.message}`);
  }
}

/**
 * 解析AI响应
 * @param {Object} response OpenAI API响应
 * @returns {Object} 处理后的响应
 */
function parseAIResponse(response) {
  const message = response.choices[0].message;
  
  // 提取内容
  const content = message.content || '';
  
  // 处理函数调用结果
  let functionResults = null;
  if (message.function_call) {
    try {
      const functionName = message.function_call.name;
      const functionArgs = JSON.parse(message.function_call.arguments);
      
      // 在实际应用中，这里应该调用相应的函数
      functionResults = {
        function: functionName,
        arguments: functionArgs,
        // 模拟函数执行结果
        result: { success: true, data: {} }
      };
    } catch (error) {
      logger.error('解析函数调用参数失败', { error: error.message });
    }
  }
  
  return {
    content,
    functionResults,
    usage: response.usage
  };
}

/**
 * 模拟AI响应
 * 用于开发和测试
 * @param {Object} options 请求选项
 * @returns {Promise<Object>} 模拟的AI响应
 */
async function mockAIResponse(options) {
  const { messages, functions } = options;
  
  // 获取最后一个用户消息
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
  
  // 基于模式和查询内容生成模拟响应
  let content = '';
  let functionResults = null;
  
  // 检查是否需要函数调用
  if (functions && functions.length > 0 && 
      (lastUserMessage.includes('数据') || 
       lastUserMessage.includes('分析') || 
       lastUserMessage.includes('统计'))) {
    
    // 随机选择一个函数
    const selectedFunction = functions[Math.floor(Math.random() * functions.length)];
    
    // 模拟函数调用结果
    functionResults = {
      function: selectedFunction.name,
      arguments: {}, // 在实际应用中应填充合适的参数
      result: {
        success: true,
        data: {
          // 模拟数据
          total: 42,
          items: [
            { id: '001', name: '示例1', value: 98.5 },
            { id: '002', name: '示例2', value: 87.2 }
          ]
        }
      }
    };
    
    content = `根据您的查询，我已获取相关数据信息。数据显示有${functionResults.result.data.total}条记录，其中包括${functionResults.result.data.items.length}个示例项。`;
  } else {
    // 生成普通文本响应
    if (lastUserMessage.includes('实验室') || lastUserMessage.includes('测试')) {
      content = '根据实验室最新测试结果，所有参数均在标准范围内。您可以查询具体物料的测试数据获取更详细信息。';
    } else if (lastUserMessage.includes('质量') || lastUserMessage.includes('不良品')) {
      content = '本月质量检验合格率为97.8%，比上月提高0.3个百分点。主要不良类型为"表面划痕"，占不良品的35%。';
    } else if (lastUserMessage.includes('生产') || lastUserMessage.includes('产线')) {
      content = '当前生产线运行状态正常，产能利用率为92%。2号产线设备已排定本周五进行例行维护。';
    } else {
      content = '您好，我是IQE智能质检系统统一助手。我可以帮助您查询质量检验、实验室测试和生产线相关的信息。请问有什么可以帮助您的？';
    }
  }
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    content,
    functionResults,
    usage: {
      prompt_tokens: 300,
      completion_tokens: content.length,
      total_tokens: 300 + content.length
    }
  };
} 
 * AI客户端工具
 * 提供与AI服务通信的功能
 */
import { logger } from './logger.js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 默认选项
const defaultOptions = {
  model: process.env.AI_MODEL || 'gpt-4o',
  temperature: 0.5,
  max_tokens: 2000,
  stream: false,
  functions: []
};

/**
 * 发送请求到AI服务
 * @param {Object} options 请求选项
 * @param {Array} options.messages 消息列表
 * @param {number} options.temperature 温度参数
 * @param {Array} options.functions 函数列表
 * @param {boolean} options.stream 是否流式响应
 * @returns {Promise<Object>} AI响应
 */
export async function sendToAIService(options) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    logger.error('未配置AI API密钥');
    return mockAIResponse(options);
  }
  
  const { messages, temperature, functions, stream } = {
    ...defaultOptions,
    ...options
  };
  
  // 完整请求配置
  const requestOptions = {
    model: defaultOptions.model,
    messages,
    temperature,
    max_tokens: defaultOptions.max_tokens,
    stream
  };
  
  // 如果提供了函数，添加到请求中
  if (functions && functions.length > 0) {
    requestOptions.functions = functions;
    requestOptions.function_call = 'auto';
  }
  
  try {
    logger.info('发送请求到AI服务', {
      model: requestOptions.model,
      messageCount: messages.length,
      functionCount: functions?.length || 0
    });
    
    // 目前使用模拟响应，实际集成时替换为真实API调用
    return await mockAIResponse(options);
    
    /* 实际集成OpenAI API的代码：
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestOptions)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`AI API错误: ${error.error?.message || response.statusText}`);
    }
    
    const result = await response.json();
    return parseAIResponse(result);
    */
  } catch (error) {
    logger.error('AI服务请求失败', { error: error.message });
    throw new Error(`与AI服务通信时出错: ${error.message}`);
  }
}

/**
 * 解析AI响应
 * @param {Object} response OpenAI API响应
 * @returns {Object} 处理后的响应
 */
function parseAIResponse(response) {
  const message = response.choices[0].message;
  
  // 提取内容
  const content = message.content || '';
  
  // 处理函数调用结果
  let functionResults = null;
  if (message.function_call) {
    try {
      const functionName = message.function_call.name;
      const functionArgs = JSON.parse(message.function_call.arguments);
      
      // 在实际应用中，这里应该调用相应的函数
      functionResults = {
        function: functionName,
        arguments: functionArgs,
        // 模拟函数执行结果
        result: { success: true, data: {} }
      };
    } catch (error) {
      logger.error('解析函数调用参数失败', { error: error.message });
    }
  }
  
  return {
    content,
    functionResults,
    usage: response.usage
  };
}

/**
 * 模拟AI响应
 * 用于开发和测试
 * @param {Object} options 请求选项
 * @returns {Promise<Object>} 模拟的AI响应
 */
async function mockAIResponse(options) {
  const { messages, functions } = options;
  
  // 获取最后一个用户消息
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
  
  // 基于模式和查询内容生成模拟响应
  let content = '';
  let functionResults = null;
  
  // 检查是否需要函数调用
  if (functions && functions.length > 0 && 
      (lastUserMessage.includes('数据') || 
       lastUserMessage.includes('分析') || 
       lastUserMessage.includes('统计'))) {
    
    // 随机选择一个函数
    const selectedFunction = functions[Math.floor(Math.random() * functions.length)];
    
    // 模拟函数调用结果
    functionResults = {
      function: selectedFunction.name,
      arguments: {}, // 在实际应用中应填充合适的参数
      result: {
        success: true,
        data: {
          // 模拟数据
          total: 42,
          items: [
            { id: '001', name: '示例1', value: 98.5 },
            { id: '002', name: '示例2', value: 87.2 }
          ]
        }
      }
    };
    
    content = `根据您的查询，我已获取相关数据信息。数据显示有${functionResults.result.data.total}条记录，其中包括${functionResults.result.data.items.length}个示例项。`;
  } else {
    // 生成普通文本响应
    if (lastUserMessage.includes('实验室') || lastUserMessage.includes('测试')) {
      content = '根据实验室最新测试结果，所有参数均在标准范围内。您可以查询具体物料的测试数据获取更详细信息。';
    } else if (lastUserMessage.includes('质量') || lastUserMessage.includes('不良品')) {
      content = '本月质量检验合格率为97.8%，比上月提高0.3个百分点。主要不良类型为"表面划痕"，占不良品的35%。';
    } else if (lastUserMessage.includes('生产') || lastUserMessage.includes('产线')) {
      content = '当前生产线运行状态正常，产能利用率为92%。2号产线设备已排定本周五进行例行维护。';
    } else {
      content = '您好，我是IQE智能质检系统统一助手。我可以帮助您查询质量检验、实验室测试和生产线相关的信息。请问有什么可以帮助您的？';
    }
  }
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    content,
    functionResults,
    usage: {
      prompt_tokens: 300,
      completion_tokens: content.length,
      total_tokens: 300 + content.length
    }
  };
} 
 
 
 
 * AI客户端工具
 * 提供与AI服务通信的功能
 */
import { logger } from './logger.js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 默认选项
const defaultOptions = {
  model: process.env.AI_MODEL || 'gpt-4o',
  temperature: 0.5,
  max_tokens: 2000,
  stream: false,
  functions: []
};

/**
 * 发送请求到AI服务
 * @param {Object} options 请求选项
 * @param {Array} options.messages 消息列表
 * @param {number} options.temperature 温度参数
 * @param {Array} options.functions 函数列表
 * @param {boolean} options.stream 是否流式响应
 * @returns {Promise<Object>} AI响应
 */
export async function sendToAIService(options) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    logger.error('未配置AI API密钥');
    return mockAIResponse(options);
  }
  
  const { messages, temperature, functions, stream } = {
    ...defaultOptions,
    ...options
  };
  
  // 完整请求配置
  const requestOptions = {
    model: defaultOptions.model,
    messages,
    temperature,
    max_tokens: defaultOptions.max_tokens,
    stream
  };
  
  // 如果提供了函数，添加到请求中
  if (functions && functions.length > 0) {
    requestOptions.functions = functions;
    requestOptions.function_call = 'auto';
  }
  
  try {
    logger.info('发送请求到AI服务', {
      model: requestOptions.model,
      messageCount: messages.length,
      functionCount: functions?.length || 0
    });
    
    // 目前使用模拟响应，实际集成时替换为真实API调用
    return await mockAIResponse(options);
    
    /* 实际集成OpenAI API的代码：
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestOptions)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`AI API错误: ${error.error?.message || response.statusText}`);
    }
    
    const result = await response.json();
    return parseAIResponse(result);
    */
  } catch (error) {
    logger.error('AI服务请求失败', { error: error.message });
    throw new Error(`与AI服务通信时出错: ${error.message}`);
  }
}

/**
 * 解析AI响应
 * @param {Object} response OpenAI API响应
 * @returns {Object} 处理后的响应
 */
function parseAIResponse(response) {
  const message = response.choices[0].message;
  
  // 提取内容
  const content = message.content || '';
  
  // 处理函数调用结果
  let functionResults = null;
  if (message.function_call) {
    try {
      const functionName = message.function_call.name;
      const functionArgs = JSON.parse(message.function_call.arguments);
      
      // 在实际应用中，这里应该调用相应的函数
      functionResults = {
        function: functionName,
        arguments: functionArgs,
        // 模拟函数执行结果
        result: { success: true, data: {} }
      };
    } catch (error) {
      logger.error('解析函数调用参数失败', { error: error.message });
    }
  }
  
  return {
    content,
    functionResults,
    usage: response.usage
  };
}

/**
 * 模拟AI响应
 * 用于开发和测试
 * @param {Object} options 请求选项
 * @returns {Promise<Object>} 模拟的AI响应
 */
async function mockAIResponse(options) {
  const { messages, functions } = options;
  
  // 获取最后一个用户消息
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
  
  // 基于模式和查询内容生成模拟响应
  let content = '';
  let functionResults = null;
  
  // 检查是否需要函数调用
  if (functions && functions.length > 0 && 
      (lastUserMessage.includes('数据') || 
       lastUserMessage.includes('分析') || 
       lastUserMessage.includes('统计'))) {
    
    // 随机选择一个函数
    const selectedFunction = functions[Math.floor(Math.random() * functions.length)];
    
    // 模拟函数调用结果
    functionResults = {
      function: selectedFunction.name,
      arguments: {}, // 在实际应用中应填充合适的参数
      result: {
        success: true,
        data: {
          // 模拟数据
          total: 42,
          items: [
            { id: '001', name: '示例1', value: 98.5 },
            { id: '002', name: '示例2', value: 87.2 }
          ]
        }
      }
    };
    
    content = `根据您的查询，我已获取相关数据信息。数据显示有${functionResults.result.data.total}条记录，其中包括${functionResults.result.data.items.length}个示例项。`;
  } else {
    // 生成普通文本响应
    if (lastUserMessage.includes('实验室') || lastUserMessage.includes('测试')) {
      content = '根据实验室最新测试结果，所有参数均在标准范围内。您可以查询具体物料的测试数据获取更详细信息。';
    } else if (lastUserMessage.includes('质量') || lastUserMessage.includes('不良品')) {
      content = '本月质量检验合格率为97.8%，比上月提高0.3个百分点。主要不良类型为"表面划痕"，占不良品的35%。';
    } else if (lastUserMessage.includes('生产') || lastUserMessage.includes('产线')) {
      content = '当前生产线运行状态正常，产能利用率为92%。2号产线设备已排定本周五进行例行维护。';
    } else {
      content = '您好，我是IQE智能质检系统统一助手。我可以帮助您查询质量检验、实验室测试和生产线相关的信息。请问有什么可以帮助您的？';
    }
  }
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    content,
    functionResults,
    usage: {
      prompt_tokens: 300,
      completion_tokens: content.length,
      total_tokens: 300 + content.length
    }
  };
} 
 * AI客户端工具
 * 提供与AI服务通信的功能
 */
import { logger } from './logger.js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 默认选项
const defaultOptions = {
  model: process.env.AI_MODEL || 'gpt-4o',
  temperature: 0.5,
  max_tokens: 2000,
  stream: false,
  functions: []
};

/**
 * 发送请求到AI服务
 * @param {Object} options 请求选项
 * @param {Array} options.messages 消息列表
 * @param {number} options.temperature 温度参数
 * @param {Array} options.functions 函数列表
 * @param {boolean} options.stream 是否流式响应
 * @returns {Promise<Object>} AI响应
 */
export async function sendToAIService(options) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    logger.error('未配置AI API密钥');
    return mockAIResponse(options);
  }
  
  const { messages, temperature, functions, stream } = {
    ...defaultOptions,
    ...options
  };
  
  // 完整请求配置
  const requestOptions = {
    model: defaultOptions.model,
    messages,
    temperature,
    max_tokens: defaultOptions.max_tokens,
    stream
  };
  
  // 如果提供了函数，添加到请求中
  if (functions && functions.length > 0) {
    requestOptions.functions = functions;
    requestOptions.function_call = 'auto';
  }
  
  try {
    logger.info('发送请求到AI服务', {
      model: requestOptions.model,
      messageCount: messages.length,
      functionCount: functions?.length || 0
    });
    
    // 目前使用模拟响应，实际集成时替换为真实API调用
    return await mockAIResponse(options);
    
    /* 实际集成OpenAI API的代码：
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestOptions)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`AI API错误: ${error.error?.message || response.statusText}`);
    }
    
    const result = await response.json();
    return parseAIResponse(result);
    */
  } catch (error) {
    logger.error('AI服务请求失败', { error: error.message });
    throw new Error(`与AI服务通信时出错: ${error.message}`);
  }
}

/**
 * 解析AI响应
 * @param {Object} response OpenAI API响应
 * @returns {Object} 处理后的响应
 */
function parseAIResponse(response) {
  const message = response.choices[0].message;
  
  // 提取内容
  const content = message.content || '';
  
  // 处理函数调用结果
  let functionResults = null;
  if (message.function_call) {
    try {
      const functionName = message.function_call.name;
      const functionArgs = JSON.parse(message.function_call.arguments);
      
      // 在实际应用中，这里应该调用相应的函数
      functionResults = {
        function: functionName,
        arguments: functionArgs,
        // 模拟函数执行结果
        result: { success: true, data: {} }
      };
    } catch (error) {
      logger.error('解析函数调用参数失败', { error: error.message });
    }
  }
  
  return {
    content,
    functionResults,
    usage: response.usage
  };
}

/**
 * 模拟AI响应
 * 用于开发和测试
 * @param {Object} options 请求选项
 * @returns {Promise<Object>} 模拟的AI响应
 */
async function mockAIResponse(options) {
  const { messages, functions } = options;
  
  // 获取最后一个用户消息
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
  
  // 基于模式和查询内容生成模拟响应
  let content = '';
  let functionResults = null;
  
  // 检查是否需要函数调用
  if (functions && functions.length > 0 && 
      (lastUserMessage.includes('数据') || 
       lastUserMessage.includes('分析') || 
       lastUserMessage.includes('统计'))) {
    
    // 随机选择一个函数
    const selectedFunction = functions[Math.floor(Math.random() * functions.length)];
    
    // 模拟函数调用结果
    functionResults = {
      function: selectedFunction.name,
      arguments: {}, // 在实际应用中应填充合适的参数
      result: {
        success: true,
        data: {
          // 模拟数据
          total: 42,
          items: [
            { id: '001', name: '示例1', value: 98.5 },
            { id: '002', name: '示例2', value: 87.2 }
          ]
        }
      }
    };
    
    content = `根据您的查询，我已获取相关数据信息。数据显示有${functionResults.result.data.total}条记录，其中包括${functionResults.result.data.items.length}个示例项。`;
  } else {
    // 生成普通文本响应
    if (lastUserMessage.includes('实验室') || lastUserMessage.includes('测试')) {
      content = '根据实验室最新测试结果，所有参数均在标准范围内。您可以查询具体物料的测试数据获取更详细信息。';
    } else if (lastUserMessage.includes('质量') || lastUserMessage.includes('不良品')) {
      content = '本月质量检验合格率为97.8%，比上月提高0.3个百分点。主要不良类型为"表面划痕"，占不良品的35%。';
    } else if (lastUserMessage.includes('生产') || lastUserMessage.includes('产线')) {
      content = '当前生产线运行状态正常，产能利用率为92%。2号产线设备已排定本周五进行例行维护。';
    } else {
      content = '您好，我是IQE智能质检系统统一助手。我可以帮助您查询质量检验、实验室测试和生产线相关的信息。请问有什么可以帮助您的？';
    }
  }
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    content,
    functionResults,
    usage: {
      prompt_tokens: 300,
      completion_tokens: content.length,
      total_tokens: 300 + content.length
    }
  };
} 
 * AI客户端工具
 * 提供与AI服务通信的功能
 */
import { logger } from './logger.js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 默认选项
const defaultOptions = {
  model: process.env.AI_MODEL || 'gpt-4o',
  temperature: 0.5,
  max_tokens: 2000,
  stream: false,
  functions: []
};

/**
 * 发送请求到AI服务
 * @param {Object} options 请求选项
 * @param {Array} options.messages 消息列表
 * @param {number} options.temperature 温度参数
 * @param {Array} options.functions 函数列表
 * @param {boolean} options.stream 是否流式响应
 * @returns {Promise<Object>} AI响应
 */
export async function sendToAIService(options) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    logger.error('未配置AI API密钥');
    return mockAIResponse(options);
  }
  
  const { messages, temperature, functions, stream } = {
    ...defaultOptions,
    ...options
  };
  
  // 完整请求配置
  const requestOptions = {
    model: defaultOptions.model,
    messages,
    temperature,
    max_tokens: defaultOptions.max_tokens,
    stream
  };
  
  // 如果提供了函数，添加到请求中
  if (functions && functions.length > 0) {
    requestOptions.functions = functions;
    requestOptions.function_call = 'auto';
  }
  
  try {
    logger.info('发送请求到AI服务', {
      model: requestOptions.model,
      messageCount: messages.length,
      functionCount: functions?.length || 0
    });
    
    // 目前使用模拟响应，实际集成时替换为真实API调用
    return await mockAIResponse(options);
    
    /* 实际集成OpenAI API的代码：
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestOptions)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`AI API错误: ${error.error?.message || response.statusText}`);
    }
    
    const result = await response.json();
    return parseAIResponse(result);
    */
  } catch (error) {
    logger.error('AI服务请求失败', { error: error.message });
    throw new Error(`与AI服务通信时出错: ${error.message}`);
  }
}

/**
 * 解析AI响应
 * @param {Object} response OpenAI API响应
 * @returns {Object} 处理后的响应
 */
function parseAIResponse(response) {
  const message = response.choices[0].message;
  
  // 提取内容
  const content = message.content || '';
  
  // 处理函数调用结果
  let functionResults = null;
  if (message.function_call) {
    try {
      const functionName = message.function_call.name;
      const functionArgs = JSON.parse(message.function_call.arguments);
      
      // 在实际应用中，这里应该调用相应的函数
      functionResults = {
        function: functionName,
        arguments: functionArgs,
        // 模拟函数执行结果
        result: { success: true, data: {} }
      };
    } catch (error) {
      logger.error('解析函数调用参数失败', { error: error.message });
    }
  }
  
  return {
    content,
    functionResults,
    usage: response.usage
  };
}

/**
 * 模拟AI响应
 * 用于开发和测试
 * @param {Object} options 请求选项
 * @returns {Promise<Object>} 模拟的AI响应
 */
async function mockAIResponse(options) {
  const { messages, functions } = options;
  
  // 获取最后一个用户消息
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
  
  // 基于模式和查询内容生成模拟响应
  let content = '';
  let functionResults = null;
  
  // 检查是否需要函数调用
  if (functions && functions.length > 0 && 
      (lastUserMessage.includes('数据') || 
       lastUserMessage.includes('分析') || 
       lastUserMessage.includes('统计'))) {
    
    // 随机选择一个函数
    const selectedFunction = functions[Math.floor(Math.random() * functions.length)];
    
    // 模拟函数调用结果
    functionResults = {
      function: selectedFunction.name,
      arguments: {}, // 在实际应用中应填充合适的参数
      result: {
        success: true,
        data: {
          // 模拟数据
          total: 42,
          items: [
            { id: '001', name: '示例1', value: 98.5 },
            { id: '002', name: '示例2', value: 87.2 }
          ]
        }
      }
    };
    
    content = `根据您的查询，我已获取相关数据信息。数据显示有${functionResults.result.data.total}条记录，其中包括${functionResults.result.data.items.length}个示例项。`;
  } else {
    // 生成普通文本响应
    if (lastUserMessage.includes('实验室') || lastUserMessage.includes('测试')) {
      content = '根据实验室最新测试结果，所有参数均在标准范围内。您可以查询具体物料的测试数据获取更详细信息。';
    } else if (lastUserMessage.includes('质量') || lastUserMessage.includes('不良品')) {
      content = '本月质量检验合格率为97.8%，比上月提高0.3个百分点。主要不良类型为"表面划痕"，占不良品的35%。';
    } else if (lastUserMessage.includes('生产') || lastUserMessage.includes('产线')) {
      content = '当前生产线运行状态正常，产能利用率为92%。2号产线设备已排定本周五进行例行维护。';
    } else {
      content = '您好，我是IQE智能质检系统统一助手。我可以帮助您查询质量检验、实验室测试和生产线相关的信息。请问有什么可以帮助您的？';
    }
  }
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    content,
    functionResults,
    usage: {
      prompt_tokens: 300,
      completion_tokens: content.length,
      total_tokens: 300 + content.length
    }
  };
} 
 
 
 