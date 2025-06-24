// 调试工厂数据问题
console.log('开始生成工厂数据');

import { writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// 将工厂数据导出到文件
const filePath = join(__dirname, 'factory-data.json');
try {
  await writeFile(filePath, JSON.stringify(factoryData, null, 2));
  console.log(`已生成${factoryData.length}条测试数据并保存到factory-data.json`);
} catch (error) {
  console.error('写入文件失败:', error);
}

// 创建调试用的浏览器代码
const debugCode = `
// 调试FactoryView组件中的数据加载问题
(function() {
  try {
    // 向localStorage中存入测试数据
    const data = ${JSON.stringify(factoryData)};
    localStorage.setItem('factory_data', JSON.stringify(data));
    console.log('已成功保存工厂数据到localStorage，数量:', data.length);
    
    // 测试数据加载
    setTimeout(() => {
      try {
        // 模拟统一数据服务的getFactoryData方法
        const loadedData = JSON.parse(localStorage.getItem('factory_data'));
        console.log('从localStorage中读取的数据:', loadedData ? loadedData.length : 0, '条');
        
        // 检查是否存在id和materialCode字段
        if (loadedData && loadedData.length > 0) {
          console.log('数据示例:', loadedData[0]);
        } else {
          console.error('未找到有效数据');
        }
      } catch (e) {
        console.error('测试数据加载出错:', e);
      }
    }, 100);
    
    // 测试ECharts初始化问题
    setTimeout(() => {
      try {
        const testDom = document.getElementById('echarts-test-container');
        if (!testDom) {
          // 创建一个测试用的DOM元素
          const testContainer = document.createElement('div');
          testContainer.id = 'echarts-test-container';
          testContainer.style.width = '300px';
          testContainer.style.height = '200px';
          document.body.appendChild(testContainer);
          
          // 尝试初始化ECharts
          if (window.echarts) {
            const chart = window.echarts.init(testContainer);
            chart.setOption({
              xAxis: { type: 'category', data: ['A', 'B', 'C'] },
              yAxis: { type: 'value' },
              series: [{ type: 'bar', data: [5, 10, 15] }]
            });
            console.log('ECharts初始化成功');
          } else {
            console.error('未找到echarts对象');
          }
        }
      } catch (e) {
        console.error('ECharts测试失败:', e);
      }
    }, 500);
  } catch (e) {
    console.error('整体调试代码执行错误:', e);
  }
})();
`;

try {
  await writeFile(join(__dirname, 'debug-browser-code.js'), debugCode);
  console.log('已创建浏览器调试代码，可在控制台中使用');
} catch (error) {
  console.error('写入调试代码失败:', error);
}

console.log('调试完成'); 