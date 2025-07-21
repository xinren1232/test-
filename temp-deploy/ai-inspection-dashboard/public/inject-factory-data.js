// 工厂数据注入脚本
// 在浏览器控制台中运行此脚本，为物料上线页面提供测试数据

(function() {
  console.log('开始注入工厂数据...');
  
  // 生成测试用的工厂数据
  const factoryData = [];
  for (let i = 0; i < 20; i++) {
    factoryData.push({
      id: `PROD${i}`,
      materialCode: `M${i}`,
      materialName: `测试物料${i}`,
      batchNo: `B${i}`,
      category: i % 2 ? '电子件' : '结构件',
      supplier: `供应商${i % 3}`,
      factory: `工厂${i % 2}`,
      productionLine: `产线${i % 4}`,
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
  
  try {
    // 将数据保存到localStorage
    localStorage.setItem('factory_data', JSON.stringify(factoryData));
    console.log('成功注入工厂数据到localStorage，数量:', factoryData.length);
    
    // 验证数据
    const reloadedData = JSON.parse(localStorage.getItem('factory_data'));
    console.log('重新加载的数据条数:', reloadedData ? reloadedData.length : 0);
    console.log('第一条数据示例:', reloadedData[0]);
    
    // 刷新页面以应用数据
    if (confirm('数据已注入，是否刷新页面以应用数据？')) {
      window.location.reload();
    }
  } catch (error) {
    console.error('注入工厂数据失败:', error);
  }
})(); 