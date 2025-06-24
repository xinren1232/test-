// 工厂数据生成工具 (CommonJS)
const fs = require('fs');
const path = require('path');

console.log('开始生成工厂数据，使用CommonJS模块');

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

// 保存为JSON文件
fs.writeFileSync(path.join(__dirname, 'factory-data.json'), JSON.stringify(factoryData, null, 2));
console.log(`已生成${factoryData.length}条工厂数据，并保存到JSON文件`);

// 创建浏览器中可以运行的调试代码
const debugCode = `
// 运行此代码将工厂数据加载到localStorage
(function() {
  try {
    // 将数据保存到localStorage
    const factoryData = ${JSON.stringify(factoryData)};
    localStorage.setItem('factory_data', JSON.stringify(factoryData));
    console.log('成功保存工厂数据到localStorage，数量:', factoryData.length);
    
    // 验证数据
    const reloadedData = JSON.parse(localStorage.getItem('factory_data'));
    console.log('重新加载的数据条数:', reloadedData ? reloadedData.length : 0);
    console.log('第一条数据示例:', reloadedData[0]);
  } catch(error) {
    console.error('保存工厂数据出错:', error);
  }
})();
`;

// 将调试代码保存到文件
fs.writeFileSync(path.join(__dirname, 'inject-factory-data.js'), debugCode);
console.log('已创建工厂数据注入代码，可在浏览器控制台运行');

// 退出
console.log('脚本执行完毕'); 