/**
 * 物料服务
 * 提供物料相关的功能，包括物料数据的处理、分析和管理
 */
import { unifiedDataService } from "./UnifiedDataService.js";

const MaterialService = {
  /**
   * 获取所有物料数据
   * @returns {Array} 物料数据列表
   */
  getAllMaterials: function() {
    try {
      // 从统一数据服务获取库存数据
      const inventoryData = unifiedDataService.getInventoryData();
      return inventoryData || [];
    } catch (error) {
      console.error("获取物料数据失败:", error);
      return [];
    }
  }
};

export default MaterialService;
