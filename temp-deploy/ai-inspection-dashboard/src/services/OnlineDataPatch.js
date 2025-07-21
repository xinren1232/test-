/**
 * 上线数据补丁服务
 * 用于生成工厂上线数据
 */
import { ElMessage } from 'element-plus';
import unifiedDataService from './UnifiedDataService.js';
import { getAllMaterials } from '../data/MaterialSupplierMap.js';

/**
 * 创建测试数据
 * @param {number} count 数据量
 * @returns {Promise<boolean>} 是否成功
 */
export async function createTestFactoryData(count = 30) {
  try {
    ElMessage.info('正在生成测试数据...');
    
    // 清除现有数据
    unifiedDataService.clearFactoryData();
    
    // 生成测试数据
    const data = [];
    
    // 从物料供应商映射中获取数据
    const allMaterials = getAllMaterials();
    if (!allMaterials || allMaterials.length === 0) {
      throw new Error('无法获取物料数据');
    }
    
    // 生成测试数据
    for (let i = 0; i < count; i++) {
      const materialInfo = allMaterials[i % allMaterials.length];
      const materialName = materialInfo.name;
      const category = materialInfo.category;
      const materialCode = `${materialInfo.code_prefix}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      // 生成批次号
      const today = new Date();
      const batchNo = `${materialInfo.code_prefix}B-${today.getFullYear().toString().substr(2)}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      // 随机供应商
      const suppliersList = materialInfo.suppliers || [];
      const supplier = suppliersList.length > 0 
        ? suppliersList[Math.floor(Math.random() * suppliersList.length)] 
        : '未知供应商';
        
      // 随机工厂
      const factories = ['上海工厂', '深圳工厂', '北京工厂', '武汉工厂', '成都工厂'];
      const factory = factories[Math.floor(Math.random() * factories.length)];
      
      // 随机生成物料状态
      const statuses = ['正常', '风险', '异常'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      // 随机生成质量状态
      const qualities = ['合格', '待检', '不合格'];
      const quality = qualities[Math.floor(Math.random() * qualities.length)];
      
      // 随机日期
      const onlineDate = new Date();
      onlineDate.setDate(onlineDate.getDate() - Math.floor(Math.random() * 30));
      
      // 创建数据项
      data.push({
        id: `ONLINE-${Date.now()}-${i}`,
        materialCode: materialCode,
        materialName: materialName,
        batchNo: batchNo,
        supplier: supplier,
        factory: factory,
        warehouse: '中央仓库',
        location: `A-${Math.floor(Math.random() * 100)}`,
        status: status,
        quality: quality,
        quantity: Math.floor(Math.random() * 1000) + 100,
        onlineDate: onlineDate.toISOString(),
        operator: ['张工', '李工', '王工'][Math.floor(Math.random() * 3)],
        remark: ''
      });
    }
    
    // 保存数据
    unifiedDataService.saveFactoryData(data, true);
    
    ElMessage.success('测试数据生成成功');
    return true;
  } catch (error) {
    console.error('生成测试数据失败:', error);
    ElMessage.error('生成测试数据失败: ' + error.message);
    return false;
  }
}

export default {
  createTestFactoryData
}; 