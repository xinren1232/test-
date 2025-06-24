// 生成工厂数据的辅助脚本
import SystemDataUpdater from './src/services/SystemDataUpdater.js';
import UnifiedDataService from './src/services/UnifiedDataService.js';

async function generateData() {
  console.log('开始生成工厂数据...');
  try {
    // 先生成库存数据
    console.log('生成库存数据...');
    const inventoryResult = await SystemDataUpdater.updateInventoryData({
      count: 50,
      clearExisting: true
    });
    
    if (!inventoryResult) {
      console.error('生成库存数据失败');
      return;
    }
    
    console.log('已生成库存数据');
    
    // 生成工厂数据
    console.log('生成工厂数据...');
    const factoryResult = await SystemDataUpdater.updateFactoryData({
      count: 30,
      clearExisting: true,
      inventoryItems: inventoryResult
    });
    
    if (factoryResult) {
      console.log('工厂数据生成成功');
    } else {
      console.error('工厂数据生成失败');
    }
  } catch (error) {
    console.error('生成数据时出错:', error);
  }
}

// 执行生成
generateData().then(() => {
  console.log('数据生成过程完成');
}).catch(err => {
  console.error('数据生成过程失败:', err);
}); 