/**
 * 数据备份工具
 * 提供数据备份和恢复功能
 */

import { ref } from 'vue';
import { ElMessage } from 'element-plus';

export function useDataBackup() {
  const backupStatus = ref({
    lastBackupDate: null,
    backupInProgress: false,
    restoreInProgress: false,
    error: null
  });
  
  /**
   * 备份系统数据
   * @param {Object} allData 所有需要备份的数据
   * @returns {Object} 备份结果
   */
  const backupSystemData = (allData) => {
    try {
      backupStatus.value.backupInProgress = true;
      backupStatus.value.error = null;
      
      // 创建备份对象
      const backup = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: allData
      };
      
      // 将备份对象转换为JSON字符串
      const backupJson = JSON.stringify(backup);
      
      // 存储备份
      localStorage.setItem('system_data_backup', backupJson);
      
      // 更新备份状态
      backupStatus.value.lastBackupDate = new Date();
      
      return {
        success: true,
        timestamp: backup.timestamp,
        message: '系统数据备份成功'
      };
    } catch (error) {
      console.error('备份系统数据失败:', error);
      backupStatus.value.error = error.message;
      return {
        success: false,
        error: error.message,
        message: `备份失败: ${error.message}`
      };
    } finally {
      backupStatus.value.backupInProgress = false;
    }
  };
  
  /**
   * 恢复系统数据
   * @returns {Object} 恢复结果
   */
  const restoreSystemData = () => {
    try {
      backupStatus.value.restoreInProgress = true;
      backupStatus.value.error = null;
      
      // 获取备份
      const backupJson = localStorage.getItem('system_data_backup');
      
      if (!backupJson) {
        throw new Error('未找到系统备份数据');
      }
      
      // 解析备份
      const backup = JSON.parse(backupJson);
      
      if (!backup.data) {
        throw new Error('备份数据格式无效');
      }
      
      // 恢复数据
      const { data } = backup;
      
      // 恢复库存数据
      if (data.inventory) {
        localStorage.setItem('inventory_data', JSON.stringify(data.inventory));
        localStorage.setItem('unified_inventory_data', JSON.stringify(data.inventory));
      }
      
      // 恢复测试数据
      if (data.lab) {
        localStorage.setItem('lab_data', JSON.stringify(data.lab));
        localStorage.setItem('lab_test_data', JSON.stringify(data.lab));
        localStorage.setItem('unified_lab_data', JSON.stringify(data.lab));
      }
      
      // 恢复上线数据
      if (data.online) {
        localStorage.setItem('factory_data', JSON.stringify(data.online));
        localStorage.setItem('online_data', JSON.stringify(data.online));
        localStorage.setItem('unified_factory_data', JSON.stringify(data.online));
      }
      
      // 恢复基线数据
      if (data.baseline) {
        localStorage.setItem('baseline_data', JSON.stringify(data.baseline));
      }
      
      return {
        success: true,
        timestamp: backup.timestamp,
        message: '系统数据恢复成功'
      };
    } catch (error) {
      console.error('恢复系统数据失败:', error);
      backupStatus.value.error = error.message;
      return {
        success: false,
        error: error.message,
        message: `恢复失败: ${error.message}`
      };
    } finally {
      backupStatus.value.restoreInProgress = false;
    }
  };
  
  /**
   * 检查是否有可恢复的备份
   * @returns {boolean} 是否有可恢复的备份
   */
  const hasBackup = () => {
    const backupJson = localStorage.getItem('system_data_backup');
    return !!backupJson;
  };
  
  /**
   * 获取最后备份时间
   * @returns {string|null} 最后备份时间的字符串表示，如果没有备份则返回null
   */
  const getLastBackupTime = () => {
    try {
      const backupJson = localStorage.getItem('system_data_backup');
      
      if (!backupJson) {
        return null;
      }
      
      const backup = JSON.parse(backupJson);
      return backup.timestamp;
    } catch (error) {
      console.error('获取最后备份时间失败:', error);
      return null;
    }
  };
  
  return {
    backupStatus,
    backupSystemData,
    restoreSystemData,
    hasBackup,
    getLastBackupTime
  };
} 