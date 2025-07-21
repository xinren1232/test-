/**
 * Checkpoint服务
 * 提供数据状态保存和回退功能
 */

import { ElMessage, ElMessageBox } from 'element-plus';

class CheckpointService {
  constructor() {
    this.checkpoints = [];
    this.currentCheckpoint = 0;
    this.maxCheckpoints = 50; // 最多保存50个检查点
    this.storageKey = 'system_checkpoints';
    
    // 初始化时加载已保存的检查点
    this.loadCheckpoints();
  }

  /**
   * 创建检查点
   * @param {string} description 检查点描述
   * @param {Object} data 要保存的数据
   * @returns {number} 检查点ID
   */
  createCheckpoint(description = '自动保存', data = null) {
    try {
      // 获取当前系统数据
      const checkpointData = data || this.getCurrentSystemData();
      
      const checkpoint = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        description,
        data: checkpointData,
        version: this.checkpoints.length + 1
      };

      // 如果当前不在最新检查点，删除后续的检查点
      if (this.currentCheckpoint < this.checkpoints.length - 1) {
        this.checkpoints = this.checkpoints.slice(0, this.currentCheckpoint + 1);
      }

      // 添加新检查点
      this.checkpoints.push(checkpoint);
      this.currentCheckpoint = this.checkpoints.length - 1;

      // 限制检查点数量
      if (this.checkpoints.length > this.maxCheckpoints) {
        this.checkpoints.shift();
        this.currentCheckpoint--;
      }

      // 保存到localStorage
      this.saveCheckpoints();

      ElMessage.success(`检查点 ${checkpoint.version} 已创建`);
      console.log(`✅ 检查点已创建: ${description} (ID: ${checkpoint.id})`);
      
      return checkpoint.id;
    } catch (error) {
      console.error('创建检查点失败:', error);
      ElMessage.error('创建检查点失败');
      return null;
    }
  }

  /**
   * 回退到指定检查点
   * @param {number} checkpointId 检查点ID，如果不指定则回退到上一个
   * @returns {boolean} 是否成功回退
   */
  async revertToCheckpoint(checkpointId = null) {
    try {
      let targetIndex;
      
      if (checkpointId) {
        // 根据ID查找检查点
        targetIndex = this.checkpoints.findIndex(cp => cp.id === checkpointId);
        if (targetIndex === -1) {
          ElMessage.error('未找到指定的检查点');
          return false;
        }
      } else {
        // 回退到上一个检查点
        if (this.currentCheckpoint <= 0) {
          ElMessage.warning('没有可回退的检查点');
          return false;
        }
        targetIndex = this.currentCheckpoint - 1;
      }

      const checkpoint = this.checkpoints[targetIndex];
      
      // 确认回退操作
      const confirmed = await ElMessageBox.confirm(
        `确定要回退到检查点 ${checkpoint.version}？\n描述: ${checkpoint.description}\n时间: ${new Date(checkpoint.timestamp).toLocaleString()}`,
        '确认回退',
        {
          confirmButtonText: '确定回退',
          cancelButtonText: '取消',
          type: 'warning'
        }
      );

      if (confirmed) {
        // 执行回退
        this.restoreSystemData(checkpoint.data);
        this.currentCheckpoint = targetIndex;
        
        ElMessage.success(`已回退到检查点 ${checkpoint.version}`);
        console.log(`✅ 已回退到检查点: ${checkpoint.description}`);
        
        // 触发页面刷新事件
        window.dispatchEvent(new CustomEvent('checkpoint-restored', {
          detail: { checkpoint }
        }));
        
        return true;
      }
      
      return false;
    } catch (error) {
      if (error !== 'cancel') {
        console.error('回退检查点失败:', error);
        ElMessage.error('回退检查点失败');
      }
      return false;
    }
  }

  /**
   * 获取当前系统数据
   * @returns {Object} 系统数据
   */
  getCurrentSystemData() {
    return {
      inventory: this.getLocalStorageData('inventory_data'),
      lab: this.getLocalStorageData('lab_data'),
      factory: this.getLocalStorageData('factory_data'),
      online: this.getLocalStorageData('online_data'),
      unified_inventory: this.getLocalStorageData('unified_inventory_data'),
      unified_lab: this.getLocalStorageData('unified_lab_data'),
      unified_factory: this.getLocalStorageData('unified_factory_data'),
      baseline: this.getLocalStorageData('baseline_data'),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 恢复系统数据
   * @param {Object} data 要恢复的数据
   */
  restoreSystemData(data) {
    try {
      // 恢复各种数据
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'timestamp' && value) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      });

      console.log('✅ 系统数据已恢复');
    } catch (error) {
      console.error('恢复系统数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取localStorage数据
   * @param {string} key 存储键
   * @returns {any} 数据
   */
  getLocalStorageData(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn(`获取localStorage数据失败 (${key}):`, error);
      return null;
    }
  }

  /**
   * 获取检查点列表
   * @returns {Array} 检查点列表
   */
  getCheckpoints() {
    return this.checkpoints.map((cp, index) => ({
      ...cp,
      isCurrent: index === this.currentCheckpoint,
      canRevert: index < this.currentCheckpoint
    }));
  }

  /**
   * 删除检查点
   * @param {number} checkpointId 检查点ID
   * @returns {boolean} 是否成功删除
   */
  deleteCheckpoint(checkpointId) {
    try {
      const index = this.checkpoints.findIndex(cp => cp.id === checkpointId);
      if (index === -1) {
        ElMessage.error('未找到指定的检查点');
        return false;
      }

      // 不能删除当前检查点
      if (index === this.currentCheckpoint) {
        ElMessage.warning('不能删除当前检查点');
        return false;
      }

      this.checkpoints.splice(index, 1);
      
      // 调整当前检查点索引
      if (index < this.currentCheckpoint) {
        this.currentCheckpoint--;
      }

      this.saveCheckpoints();
      ElMessage.success('检查点已删除');
      return true;
    } catch (error) {
      console.error('删除检查点失败:', error);
      ElMessage.error('删除检查点失败');
      return false;
    }
  }

  /**
   * 清空所有检查点
   */
  clearAllCheckpoints() {
    this.checkpoints = [];
    this.currentCheckpoint = 0;
    this.saveCheckpoints();
    ElMessage.success('所有检查点已清空');
  }

  /**
   * 保存检查点到localStorage
   */
  saveCheckpoints() {
    try {
      const data = {
        checkpoints: this.checkpoints,
        currentCheckpoint: this.currentCheckpoint,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('保存检查点失败:', error);
    }
  }

  /**
   * 从localStorage加载检查点
   */
  loadCheckpoints() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        this.checkpoints = parsed.checkpoints || [];
        this.currentCheckpoint = parsed.currentCheckpoint || 0;
        console.log(`✅ 已加载 ${this.checkpoints.length} 个检查点`);
      }
    } catch (error) {
      console.error('加载检查点失败:', error);
      this.checkpoints = [];
      this.currentCheckpoint = 0;
    }
  }

  /**
   * 获取当前检查点信息
   * @returns {Object|null} 当前检查点信息
   */
  getCurrentCheckpointInfo() {
    if (this.checkpoints.length === 0) return null;
    
    const current = this.checkpoints[this.currentCheckpoint];
    return {
      ...current,
      position: this.currentCheckpoint + 1,
      total: this.checkpoints.length,
      canRevert: this.currentCheckpoint > 0,
      canForward: this.currentCheckpoint < this.checkpoints.length - 1
    };
  }
}

// 创建单例实例
export const checkpointService = new CheckpointService();

export default checkpointService;
