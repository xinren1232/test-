/**
 * 统一助手API客户端
 * 用于与后端API服务通信
 */
import axios from 'axios';

// 配置信息
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const API_TIMEOUT = 30000; // 30秒超时

/**
 * 创建API客户端实例
 * @returns {AxiosInstance}
 */
function createAPIClient() {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
  
  // 请求拦截器
  client.interceptors.request.use(
    config => {
      // 可以在这里添加鉴权Token等
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );
  
  // 响应拦截器
  client.interceptors.response.use(
    response => {
      // 只返回数据部分
      return response.data;
    },
    error => {
      // 统一错误处理
      if (error.response) {
        // 服务器返回错误
        const { status, data } = error.response;
        
        if (status === 401) {
          console.error('身份验证失败，请重新登录');
        } else if (status === 403) {
          console.error('没有权限访问此资源');
        } else if (status === 404) {
          console.error('请求的资源不存在');
        } else if (status >= 500) {
          console.error('服务器内部错误，请稍后再试');
        }
        
        return Promise.reject({
          status,
          message: data?.error?.message || '请求失败',
          data: data
        });
      } else if (error.request) {
        // 请求发出但没收到响应
        console.error('网络连接失败，请检查网络设置');
        return Promise.reject({
          status: 0,
          message: '网络连接失败',
          data: null
        });
      } else {
        // 请求配置出错
        console.error('请求配置错误', error.message);
        return Promise.reject({
          status: 0,
          message: error.message,
          data: null
        });
      }
    }
  );
  
  return client;
}

// 创建API客户端实例
const apiClient = createAPIClient();

/**
 * 统一助手API客户端类
 */
class AssistantAPIClient {
  /**
   * 发送查询到统一助手
   * @param {Object} params 查询参数
   * @param {string} params.query 用户查询文本
   * @param {string} [params.mode] 助手模式 (auto, quality, lab, production)
   * @param {string} [params.sessionId] 会话ID
   * @param {Object} [params.context] 上下文信息
   * @returns {Promise<Object>} 查询结果
   */
  async sendQuery(params) {
    try {
      const { query, mode = 'auto', sessionId, context = {} } = params;
      
      const response = await apiClient.post('/api/assistant/query', {
        query,
        mode,
        sessionId,
        context
      });
      
      return response;
    } catch (error) {
      console.error('发送查询失败:', error);
      throw error;
    }
  }
  
  /**
   * 清除会话上下文
   * @param {string} sessionId 会话ID
   * @returns {Promise<Object>} 操作结果
   */
  async clearSession(sessionId) {
    try {
      const response = await apiClient.delete(`/api/assistant/session/${sessionId}`);
      return response;
    } catch (error) {
      console.error('清除会话失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取支持的助手模式
   * @returns {Promise<Object>} 模式列表
   */
  async getModes() {
    try {
      const response = await apiClient.get('/api/assistant/modes');
      return response;
    } catch (error) {
      console.error('获取模式列表失败:', error);
      throw error;
    }
  }
  
  /**
   * 检查API服务健康状态
   * @returns {Promise<Object>} 健康状态
   */
  async checkHealth() {
    try {
      const response = await apiClient.get('/health');
      return response;
    } catch (error) {
      console.error('健康检查失败:', error);
      throw error;
    }
  }
}

// 导出单例实例
export default new AssistantAPIClient(); 