/**
 * 测试环境变量配置
 */

console.log('🔍 环境变量测试:');
console.log('VITE_USE_REAL_API:', import.meta.env.VITE_USE_REAL_API);
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('NODE_ENV:', import.meta.env.NODE_ENV);
console.log('MODE:', import.meta.env.MODE);

// 测试API客户端配置
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
console.log('计算的baseURL:', baseURL);

const testClient = axios.create({
  baseURL: baseURL,
  timeout: 10000
});

console.log('测试客户端配置:', testClient.defaults);

// 测试API调用
async function testAPI() {
  try {
    console.log('🧪 测试API调用...');
    const response = await testClient.get('/api/rules');
    console.log('✅ API调用成功:', response.data.count, '条规则');
  } catch (error) {
    console.error('❌ API调用失败:', error.message);
    console.error('错误详情:', error.response?.status, error.response?.data);
  }
}

testAPI();
