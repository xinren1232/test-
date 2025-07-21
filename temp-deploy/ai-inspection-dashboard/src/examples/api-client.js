/**
 * 统一助手API客户端示例
 * 展示如何从外部系统调用统一助手API
 */

// 基础配置
const API_BASE_URL = 'http://localhost:3001/api/assistant';

/**
 * 发送查询到统一助手API
 * @param {string} query 用户查询文本
 * @param {string} mode 助手模式 (auto, quality, lab, production)
 * @param {string} sessionId 会话ID (可选)
 * @param {Object} context 上下文信息 (可选)
 * @returns {Promise<Object>} API响应
 */
async function sendQuery(query, mode = 'auto', sessionId = null, context = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        mode,
        sessionId,
        context
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('调用统一助手API失败:', error);
    throw error;
  }
}

/**
 * 清除会话上下文
 * @param {string} sessionId 会话ID
 * @returns {Promise<Object>} API响应
 */
async function clearSessionContext(sessionId) {
  try {
    const response = await fetch(`${API_BASE_URL}/session/${sessionId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('清除会话上下文失败:', error);
    throw error;
  }
}

/**
 * 获取支持的助手模式
 * @returns {Promise<Object>} API响应
 */
async function getSupportedModes() {
  try {
    const response = await fetch(`${API_BASE_URL}/modes`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取支持的助手模式失败:', error);
    throw error;
  }
}

/**
 * 检查API服务健康状态
 * @returns {Promise<Object>} API响应
 */
async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('检查API服务健康状态失败:', error);
    throw error;
  }
}

/**
 * 使用示例
 * 注意：使用此示例前，请确保已启动API服务器
 * 运行命令：npm run api-server
 */
async function apiClientExample() {
  try {
    console.log('准备连接API服务器，请确保已运行 npm run api-server');
    
    // 检查API服务健康状态
    console.log('检查API服务健康状态...');
    const healthStatus = await checkHealth();
    console.log('API服务状态:', healthStatus);

    // 获取支持的助手模式
    console.log('\n获取支持的助手模式...');
    const modesResponse = await getSupportedModes();
    console.log('支持的助手模式:', modesResponse.modes);

    // 创建一个新的会话
    const sessionId = `session_${Date.now()}`;
    console.log(`\n创建新会话 (ID: ${sessionId})`);

    // 发送一个实验室相关查询
    console.log('\n发送实验室相关查询...');
    const labQuery = '检查最近的不良记录';
    const labResponse = await sendQuery(labQuery, 'auto', sessionId);
    console.log('查询:', labQuery);
    console.log('检测到的模式:', labResponse.mode);
    console.log('响应内容:', labResponse.response.content);
    console.log('响应数据类型:', labResponse.response.data?.type);

    // 发送一个质量相关查询，使用相同的会话ID来保持上下文
    console.log('\n发送质量相关查询...');
    const qualityQuery = '分析供应商质量表现';
    const qualityResponse = await sendQuery(qualityQuery, 'auto', sessionId);
    console.log('查询:', qualityQuery);
    console.log('检测到的模式:', qualityResponse.mode);
    console.log('响应内容:', qualityResponse.response.content);
    console.log('响应数据类型:', qualityResponse.response.data?.type);

    // 发送一个带上下文的查询
    console.log('\n发送带上下文的查询...');
    const contextQuery = '分析物料38501375的异常情况';
    const contextResponse = await sendQuery(contextQuery, 'auto', sessionId, {
      materialCode: '38501375',
      materialName: '保护膜（全包膜）'
    });
    console.log('查询:', contextQuery);
    console.log('检测到的模式:', contextResponse.mode);
    console.log('响应内容:', contextResponse.response.content);

    // 清除会话上下文
    console.log('\n清除会话上下文...');
    const clearResponse = await clearSessionContext(sessionId);
    console.log('清除结果:', clearResponse);

  } catch (error) {
    console.error('API客户端示例运行失败:', error);
    console.error('请确保API服务器已启动 (npm run api-server)');
  }
}

// 导出API客户端函数
export {
  sendQuery,
  clearSessionContext,
  getSupportedModes,
  checkHealth,
  apiClientExample
};

// 如果直接运行此文件，执行示例
if (typeof require !== 'undefined' && require.main === module) {
  apiClientExample();
} 