/**
 * 库存服务
 * 提供物料库存管理、批次跟踪等功能
 */
import { ref } from 'vue';

// 库存状态常量
export const INVENTORY_STATUS = {
  NORMAL: 'normal',    // 正常
  FROZEN: 'frozen',    // 冻结
  ALERTED: 'alerted',  // 告警
  EXPIRED: 'expired',  // 过期
  CONSUMED: 'consumed' // 已消耗
};

class InventoryService {
  constructor() {
    this.items = ref([]);
    this.batches = ref([]);
    this.materialTypes = ref([]);
    this.initialized = false;
  }

  /**
   * 初始化库存服务
   */
  async initialize() {
    if (this.initialized) return true;
    
    try {
      // 加载物料类型
      this.loadMaterialTypes();
      
      // 加载库存数据
      const storedData = localStorage.getItem('inventory_data');
      if (storedData) {
        this.items.value = JSON.parse(storedData);
      }
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('初始化库存服务失败:', error);
      return false;
    }
  }

  /**
   * 加载物料类型数据
   */
  loadMaterialTypes() {
    this.materialTypes.value = [
      { code: 'RAW-PP', name: '聚丙烯', category: '原材料' },
      { code: 'RAW-PE', name: '聚乙烯', category: '原材料' },
      { code: 'RAW-ABS', name: 'ABS树脂', category: '原材料' },
      { code: 'RAW-PC', name: '聚碳酸酯', category: '原材料' },
      { code: 'ADD-01', name: '抗氧化剂', category: '添加剂' },
      { code: 'ADD-02', name: '紫外线吸收剂', category: '添加剂' },
      { code: 'ADD-03', name: '阻燃剂', category: '添加剂' },
      { code: 'PKG-01', name: '包装膜', category: '包装材料' },
      { code: 'PKG-02', name: '包装盒', category: '包装材料' }
    ];
  }

  /**
   * 获取所有库存项
   */
  getAllItems() {
    return this.items.value;
  }

  /**
   * 获取所有库存（与getAllItems相同，为了兼容性）
   */
  getAllInventory() {
    return this.items.value;
  }

  /**
   * 获取物料类型
   */
  getMaterialTypes() {
    return this.materialTypes.value;
  }

  /**
   * 根据批次号获取库存项
   */
  getItemByBatchNo(batchNo) {
    return this.items.value.find(item => item.batchNo === batchNo);
  }
  
  /**
   * 根据状态筛选库存项
   */
  getItemsByStatus(status) {
    return this.items.value.filter(item => item.status === status);
  }
  
  /**
   * 添加库存项
   */
  addItem(item) {
    // 确保有批次号
    if (!item.batchNo) {
      throw new Error('库存项缺少批次号');
    }
    
    // 检查是否已存在
    const existingIndex = this.items.value.findIndex(i => i.batchNo === item.batchNo);
    if (existingIndex >= 0) {
      // 更新现有项
      this.items.value[existingIndex] = {...this.items.value[existingIndex], ...item};
    } else {
      // 添加新项
      this.items.value.push(item);
    }
    
    // 保存到本地存储
    this._saveToStorage();
    return item;
  }
  
  /**
   * 更新库存项
   */
  updateItem(batchNo, updates) {
    const index = this.items.value.findIndex(item => item.batchNo === batchNo);
    if (index === -1) {
      throw new Error(`未找到批次号为 ${batchNo} 的库存项`);
    }
    
    this.items.value[index] = {...this.items.value[index], ...updates};
    
    // 保存到本地存储
    this._saveToStorage();
    return this.items.value[index];
  }
  
  /**
   * 将库存数据保存到本地存储
   */
  _saveToStorage() {
    localStorage.setItem('inventory_data', JSON.stringify(this.items.value));
  }
}

// 创建单例
const inventoryService = new InventoryService();
export default inventoryService;
