/**
 * 数据验证工具
 * 提供数据验证和一致性检查功能
 */

import { ref } from 'vue';

export function useDataValidator() {
  const validationResults = ref({
    isValid: true,
    errors: [],
    warnings: [],
    lastValidated: null
  });

  /**
   * 验证所有系统数据
   * @returns {Object} 验证结果
   */
  const validateAllData = () => {
    try {
      // 重置验证结果
      validationResults.value = {
        isValid: true,
        errors: [],
        warnings: [],
        lastValidated: new Date()
      };

      // 验证库存数据
      validateInventoryData();
      
      // 验证测试数据
      validateLabData();
      
      // 验证上线数据
      validateFactoryData();
      
      // 验证数据间的关系
      validateDataRelationships();
      
      return {
        success: validationResults.value.isValid,
        results: validationResults.value,
        message: validationResults.value.isValid 
          ? '数据验证通过' 
          : `发现 ${validationResults.value.errors.length} 个错误和 ${validationResults.value.warnings.length} 个警告`
      };
    } catch (error) {
      console.error('数据验证失败:', error);
      return {
        success: false,
        results: null,
        message: `验证失败: ${error.message}`
      };
    }
  };
  
  /**
   * 验证库存数据
   */
  const validateInventoryData = () => {
    // 从本地存储获取库存数据
    const inventoryData = localStorage.getItem('inventory_data');
    const unifiedInventory = localStorage.getItem('unified_inventory_data');
    
    // 如果两个键都存在，检查数据是否一致
    if (inventoryData && unifiedInventory && inventoryData !== unifiedInventory) {
      validationResults.value.isValid = false;
      validationResults.value.errors.push({
        type: 'storage_inconsistency',
        message: '库存数据存储不一致，新旧键中的数据不匹配',
        module: 'inventory'
      });
    }
  };

  /**
   * 验证测试数据
   */
  const validateLabData = () => {
    // 从本地存储获取测试数据
    const labData = localStorage.getItem('lab_data');
    const labTestData = localStorage.getItem('lab_test_data');
    const unifiedLab = localStorage.getItem('unified_lab_data');
    
    // 检查测试数据键是否一致
    if (labData && labTestData && labData !== labTestData) {
      validationResults.value.isValid = false;
      validationResults.value.errors.push({
        type: 'storage_inconsistency',
        message: '测试数据存储不一致，lab_data 和 lab_test_data 不匹配',
        module: 'lab'
      });
    }
    
    // 检查统一数据服务的测试数据是否与旧数据一致
    if (unifiedLab && labData && unifiedLab !== labData) {
      validationResults.value.isValid = false;
      validationResults.value.errors.push({
        type: 'storage_inconsistency',
        message: '测试数据存储不一致，统一数据服务和旧数据不匹配',
        module: 'lab'
      });
    }
  };
  
  /**
   * 验证上线数据
   */
  const validateFactoryData = () => {
    // 从本地存储获取上线数据
    const factoryData = localStorage.getItem('factory_data');
    const onlineData = localStorage.getItem('online_data');
    const unifiedFactory = localStorage.getItem('unified_factory_data');
    
    // 检查上线数据键是否一致
    if (factoryData && onlineData && factoryData !== onlineData) {
      validationResults.value.isValid = false;
      validationResults.value.errors.push({
        type: 'storage_inconsistency',
        message: '上线数据存储不一致，factory_data 和 online_data 不匹配',
        module: 'factory'
      });
    }
    
    // 检查统一数据服务的上线数据是否与旧数据一致
    if (unifiedFactory && factoryData && unifiedFactory !== factoryData) {
      validationResults.value.isValid = false;
      validationResults.value.errors.push({
        type: 'storage_inconsistency',
        message: '上线数据存储不一致，统一数据服务和旧数据不匹配',
        module: 'factory'
      });
    }
  };
  
  /**
   * 验证数据间的关系
   */
  const validateDataRelationships = () => {
    try {
      // 获取所有数据
      const inventoryData = JSON.parse(localStorage.getItem('inventory_data') || '[]');
      const labData = JSON.parse(localStorage.getItem('lab_data') || '[]');
      const factoryData = JSON.parse(localStorage.getItem('factory_data') || '[]');
      
      // 检查批次号一致性
      const inventoryBatchNos = new Set(inventoryData.map(item => item.batchNo));
      
      // 检查测试数据中的批次号是否在库存数据中存在
      for (const labItem of labData) {
        if (labItem.batchNo && !inventoryBatchNos.has(labItem.batchNo)) {
          validationResults.value.isValid = false;
          validationResults.value.errors.push({
            type: 'data_relationship',
            message: `测试数据中的批次号 ${labItem.batchNo} 在库存数据中不存在`,
            module: 'lab',
            item: labItem
          });
        }
      }
      
      // 检查上线数据中的批次号是否在库存数据中存在
      for (const factoryItem of factoryData) {
        if (factoryItem.batchNo && !inventoryBatchNos.has(factoryItem.batchNo)) {
          validationResults.value.isValid = false;
          validationResults.value.errors.push({
            type: 'data_relationship',
            message: `上线数据中的批次号 ${factoryItem.batchNo} 在库存数据中不存在`,
            module: 'factory',
            item: factoryItem
          });
        }
      }
    } catch (error) {
      console.error('验证数据关系失败:', error);
      validationResults.value.isValid = false;
      validationResults.value.errors.push({
        type: 'validation_error',
        message: `验证数据关系失败: ${error.message}`,
        module: 'system'
      });
    }
  };
  
  return {
    validationResults,
    validateAllData
  };
} 