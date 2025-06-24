/**
 * 工厂数据注入工具
 * 用于在浏览器控制台中手动注入测试数据
 * 使用方法：在浏览器控制台中粘贴此文件内容，然后调用 injectFactoryData() 函数
 */

/**
 * 注入工厂数据
 * @param {Number} count 要注入的数据条数，默认20条
 * @param {Boolean} clearExisting 是否清除现有数据，默认false
 * @returns {Array} 注入的数据
 */
function injectFactoryData(count = 20, clearExisting = false) {
  console.log(`开始注入${count}条工厂数据，清除现有数据: ${clearExisting}`);
  
  // 生成工厂数据
  const factoryData = [];
  for (let i = 0; i < count; i++) {
    factoryData.push({
      id: `PROD${Date.now()}${i}`,
      materialCode: `M${1000 + i}`,
      materialName: `测试物料${i}`,
      batchNo: `B${2000 + i}`,
      category: i % 2 ? '电子件' : '结构件',
      supplier: `供应商${i % 3 + 1}`,
      factory: `工厂${i % 2 + 1}`,
      productionLine: `产线${i % 4 + 1}`,
      onlineStatus: ['待上线', '上线中', '已上线'][i % 3],
      onlineDate: new Date().toISOString(),
      usageQuantity: 100 + i * 10,
      unit: '个',
      yieldRate: `${90 + i % 10}%`,
      risk_level: ['低风险', '中风险', '高风险'][i % 3],
      quality: ['合格', '待检', '不合格'][i % 3],
      last_updated: new Date().toISOString()
    });
  }
  
  // 保存到localStorage
  try {
    // 如果需要清除现有数据
    if (clearExisting) {
      localStorage.setItem('factory_data', JSON.stringify(factoryData));
    } else {
      // 获取现有数据
      const existingData = localStorage.getItem('factory_data');
      const parsedData = existingData ? JSON.parse(existingData) : [];
      
      // 合并数据
      const newData = [...parsedData, ...factoryData];
      localStorage.setItem('factory_data', JSON.stringify(newData));
    }
    
    console.log(`成功注入${factoryData.length}条工厂数据`);
    return factoryData;
  } catch (error) {
    console.error('注入工厂数据失败:', error);
    return [];
  }
}

// 导出函数，在浏览器中可以直接调用
window.injectFactoryData = injectFactoryData;

// 提示使用方法
console.log('工厂数据注入工具已加载。使用方法: injectFactoryData(数量, 是否清除现有数据)');
console.log('例如: injectFactoryData(20, false) - 注入20条数据并保留现有数据');
console.log('例如: injectFactoryData(30, true) - 注入30条数据并清除现有数据');

export default injectFactoryData; 