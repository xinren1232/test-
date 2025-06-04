/**
 * IQE动态检验系统 - API请求工具
 * 提供统一的API请求方法，包含错误处理和重试机制
 */
import { ElMessage } from 'element-plus';

/**
 * 默认请求配置
 */
const defaultOptions = {
  timeout: 10000, // 超时时间：10秒
  retryCount: 2,  // 重试次数
  retryDelay: 1000 // 重试延迟：1秒
};

/**
 * 统一API请求方法
 * @param {string} url - 请求地址
 * @param {Object} options - 请求选项
 * @param {string} apiKey - API密钥
 * @returns {Promise<any>} - 请求结果
 */
export const apiRequest = async (url, options = {}, apiKey) => {
  const mergedOptions = { ...defaultOptions, ...options };
  const { retryCount, retryDelay, ...fetchOptions } = mergedOptions;
  
  // 添加请求头
  const headers = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers
  };
  
  // 如果提供了API密钥，添加到请求头
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }
  
  // 重试逻辑
  let lastError;
  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      // 发送请求
      const response = await fetch(url, {
        ...fetchOptions,
        headers
      });
      
      // 检查响应状态
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: '未知错误' };
        }
        
        const errorMessage = errorData?.message || `请求失败: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }
      
      // 解析响应数据
      const data = await response.json();
      return data;
      
    } catch (error) {
      lastError = error;
      
      // 记录错误
      console.error(`API请求错误 (尝试 ${attempt+1}/${retryCount+1}):`, error);
      
      // 如果不是最后一次尝试，等待后重试
      if (attempt < retryCount) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
      
      // 最后一次尝试失败，显示错误消息
      ElMessage.error(`请求失败: ${error.message}`);
      throw error;
    }
  }
};

/**
 * LLM API调用
 * @param {Object} requestData - 请求数据
 * @param {string} apiKey - API密钥
 * @returns {Promise<string>} - 返回LLM响应文本
 */
export const callLLMAPI = async (requestData, apiKey, modelType = 'volcengine') => {
  try {
    let apiUrl = '';
    
    // 根据模型类型选择API地址
    if (modelType === 'volcengine') {
      apiUrl = 'https://api.volcengine.com/v1/chat/completions';
    } else if (modelType === 'openai') {
      apiUrl = 'https://api.openai.com/v1/chat/completions';
    } else {
      throw new Error(`不支持的模型类型: ${modelType}`);
    }
    
    // 发送API请求
    const response = await apiRequest(apiUrl, {
      method: 'POST',
      body: JSON.stringify(requestData)
    }, apiKey);
    
    // 提取返回内容
    return response.choices[0].message.content;
  } catch (error) {
    console.error('LLM API调用错误:', error);
    return `抱歉，处理您的请求时出现错误：${error.message}`;
  }
};

/**
 * 语音识别请求
 * @param {Blob} audioBlob - 音频数据
 * @param {string} language - 语言代码
 * @returns {Promise<string>} - 返回识别文本
 */
export const speechToText = async (audioBlob, language = 'zh-CN') => {
  // 实际项目中应改为真实的语音识别API
  // 这里只是示例接口
  try {
    // 模拟请求延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 示例响应
    return '这是语音识别的示例结果';
  } catch (error) {
    console.error('语音识别错误:', error);
    ElMessage.error('语音识别失败');
    throw error;
  }
}; 
 
 