/**
 * 模拟API中间件
 * 用于在没有后端服务的情况下处理前端的API请求
 */
import systemDataUpdater from '../services/SystemDataUpdater.js';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { v4 as uuidv4 } from 'uuid';
import { getAllMaterialCodes } from '../data/MaterialCodeMap.js';

// 存储物料编码映射数据
let materialCodeMappings = [];

// 初始化物料编码映射数据
function initializeMaterialCodeMappings() {
  const materialCodeMap = getAllMaterialCodes();
  materialCodeMappings = [];
  
  for (const [key, code] of materialCodeMap.entries()) {
    const [materialName, supplier] = key.split('|');
    materialCodeMappings.push({
      id: uuidv4(),
      material_code: code,
      material_name: materialName,
      supplier_name: supplier,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
}

/**
 * 设置模拟API拦截器
 * @param {AxiosInstance} axiosInstance axios实例
 * @param {number} delay 模拟延迟时间（毫秒）
 */
function setupMockInterceptor(axiosInstance, delay = 500) {
  // 检查是否应该使用真实API
  const useRealAPI = import.meta.env.VITE_USE_REAL_API === 'true' ||
                     window.location.search.includes('real-api=true');

  console.log('🔍 模拟API中间件检查:', {
    'VITE_USE_REAL_API': import.meta.env.VITE_USE_REAL_API,
    'useRealAPI': useRealAPI,
    'URL参数': window.location.search
  });

  if (useRealAPI) {
    console.log('🔗 使用真实API，跳过模拟拦截器');
    return;
  }

  // 创建模拟适配器
  const mock = new MockAdapter(axiosInstance, { delayResponse: delay });
  
  // 模拟物料编码映射API
  mock.onGet('/api/material-code-mappings').reply(() => {
    if (materialCodeMappings.length === 0) {
      initializeMaterialCodeMappings();
    }
    return [200, materialCodeMappings];
  });
  
  mock.onPost('/api/material-code-mappings').reply((config) => {
    const data = JSON.parse(config.data);
      
    // 检查是否已存在相同的物料编码
    const existingByCode = materialCodeMappings.find(item => item.material_code === data.material_code);
    if (existingByCode) {
      return [200, existingByCode]; // 如果已存在，直接返回
    }
    
    // 检查是否已存在相同的物料名称和供应商组合
    const existingByNameSupplier = materialCodeMappings.find(
      item => item.material_name === data.material_name && item.supplier_name === data.supplier_name
    );
    if (existingByNameSupplier) {
      return [200, existingByNameSupplier]; // 如果已存在，直接返回
    }
    
    // 创建新记录
    const newMapping = {
      id: uuidv4(),
      material_code: data.material_code,
      material_name: data.material_name,
      supplier_name: data.supplier_name,
      code_prefix: data.code_prefix || '',
      category: data.category || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    materialCodeMappings.push(newMapping);
    return [201, newMapping];
  });
  
  // 模拟上线数据API
  mock.onGet('/api/online-data').reply(async () => {
    try {
      // 确保系统数据更新器已初始化
      await systemDataUpdater.ensureCodeMapInitialized();
          
      // 生成一些随机上线数据
      const result = await systemDataUpdater.updateOnlineData({ count: 50, clearExisting: false });
      return [200, result];
    } catch (error) {
      console.error('模拟上线数据API错误:', error);
      return [500, { message: '生成上线数据失败' }];
    }
  });
          
  // 模拟库存数据API
  mock.onGet('/api/inventory-data').reply(async () => {
    try {
      // 确保系统数据更新器已初始化
      await systemDataUpdater.ensureCodeMapInitialized();
      
      // 生成一些随机库存数据
      const result = await systemDataUpdater.generateInventoryData(50, false);
      return [200, result];
    } catch (error) {
      console.error('模拟库存数据API错误:', error);
      return [500, { message: '生成库存数据失败' }];
        }
  });
  
  // 模拟实验室测试数据API
  mock.onGet('/api/lab-data').reply(async () => {
    try {
      // 确保系统数据更新器已初始化
      await systemDataUpdater.ensureCodeMapInitialized();
  
      // 生成一些随机实验室测试数据
      const result = await systemDataUpdater.generateLabData(50, false);
      return [200, result];
    } catch (error) {
      console.error('模拟实验室测试数据API错误:', error);
      return [500, { message: '生成实验室测试数据失败' }];
    }
  });

  // 模拟助手API - 让所有assistant相关请求通过到真实后端
  mock.onPost('/api/assistant/query').passThrough();
  mock.onPost('/api/assistant/update-data').passThrough();
  mock.onGet('/api/assistant/health').passThrough();
  mock.onGet('/api/assistant/rules').passThrough();

  // 规则管理API - 让所有rules相关请求通过到真实后端
  mock.onGet('/api/rules').passThrough();
  mock.onGet('/api/rules/categories').passThrough();
  mock.onGet('/api/rules/stats').passThrough();
  mock.onPost(/\/api\/rules\/test\/\d+/).passThrough();
  mock.onPost('/api/rules/test-all').passThrough();

  // 其他未匹配的API请求返回404
  mock.onAny().reply(404, { message: 'API endpoint not found' });
}

export default setupMockInterceptor;