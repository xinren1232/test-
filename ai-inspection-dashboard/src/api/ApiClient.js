/**
 * API客户端
 * 处理所有与后端的HTTP通信
 */
import axios from 'axios';
import { ElMessage } from 'element-plus';
import setupMockInterceptor from './mockApiMiddleware';

// 创建axios实例
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000, // 30秒超时
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// 应用模拟API中间件
setupMockInterceptor(apiClient);

// 请求拦截器
apiClient.interceptors.request.use(
  config => {
    // 添加认证令牌（如果有）
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  response => {
    // 只返回数据部分
    return response.data;
  },
  error => {
    if (error.response) {
      // 服务器返回了错误状态码
      const status = error.response.status;
      const message = error.response.data?.message || '未知错误';
      
      switch (status) {
        case 401:
          ElMessage.error('未授权，请重新登录');
          // 可以在这里处理登录过期逻辑
          break;
        case 403:
          ElMessage.error('没有权限访问该资源');
          break;
        case 404:
          ElMessage.warning('请求的资源不存在');
          break;
        case 500:
          ElMessage.error(`服务器错误: ${message}`);
          break;
        default:
          ElMessage.error(`请求失败: ${message}`);
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      ElMessage.error('服务器无响应，请检查网络连接');
    } else {
      // 请求配置出错
      ElMessage.error(`请求错误: ${error.message}`);
    }
    
    return Promise.reject(error);
  }
);

// API方法
const api = {
  /**
   * 发起GET请求
   * @param {string} url 请求地址
   * @param {Object} params 查询参数
   * @param {Object} config 额外配置
   * @returns {Promise} 请求Promise
   */
  get(url, params = {}, config = {}) {
    return apiClient.get(url, { params, ...config });
  },
  
  /**
   * 发起POST请求
   * @param {string} url 请求地址
   * @param {Object} data 请求数据
   * @param {Object} config 额外配置
   * @returns {Promise} 请求Promise
   */
  post(url, data = {}, config = {}) {
    return apiClient.post(url, data, config);
  },
  
  /**
   * 发起PUT请求
   * @param {string} url 请求地址
   * @param {Object} data 请求数据
   * @param {Object} config 额外配置
   * @returns {Promise} 请求Promise
   */
  put(url, data = {}, config = {}) {
    return apiClient.put(url, data, config);
  },
  
  /**
   * 发起PATCH请求
   * @param {string} url 请求地址
   * @param {Object} data 请求数据
   * @param {Object} config 额外配置
   * @returns {Promise} 请求Promise
   */
  patch(url, data = {}, config = {}) {
    return apiClient.patch(url, data, config);
  },
  
  /**
   * 发起DELETE请求
   * @param {string} url 请求地址
   * @param {Object} config 额外配置
   * @returns {Promise} 请求Promise
   */
  delete(url, config = {}) {
    return apiClient.delete(url, config);
  },
  
  /**
   * 发起文件上传请求
   * @param {string} url 请求地址
   * @param {FormData} formData 表单数据
   * @param {Function} onProgress 进度回调
   * @returns {Promise} 请求Promise
   */
  upload(url, formData, onProgress) {
    return apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: onProgress
    });
  },
  
  /**
   * 发起文件下载请求
   * @param {string} url 请求地址
   * @param {Object} params 查询参数
   * @returns {Promise} 请求Promise
   */
  download(url, params = {}) {
    return apiClient.get(url, {
      params,
      responseType: 'blob'
    });
  }
};

export default api;
