/**
 * 获取真实的前端数据
 * 从前端localStorage中读取实际的业务数据
 */
import fs from 'fs';
import path from 'path';

async function fetchRealFrontendData() {
  console.log('🔍 尝试获取真实的前端数据...');
  
  // 方法1: 尝试从前端项目的localStorage备份文件读取
  const frontendPath = path.join(process.cwd(), '../ai-inspection-dashboard');
  
  console.log('📂 前端项目路径:', frontendPath);
  
  // 检查前端项目是否存在
  if (fs.existsSync(frontendPath)) {
    console.log('✅ 找到前端项目');
    
    // 查看前端数据相关文件
    const dataPath = path.join(frontendPath, 'src/data');
    if (fs.existsSync(dataPath)) {
      console.log('📁 数据目录存在:', dataPath);
      
      const files = fs.readdirSync(dataPath);
      console.log('📄 数据文件列表:', files);
      
      // 查看是否有数据生成器或示例数据
      const generatorFile = path.join(dataPath, 'data_generator.js');
      if (fs.existsSync(generatorFile)) {
        console.log('🔧 找到数据生成器文件');
        
        // 读取数据生成器内容的前100行
        const content = fs.readFileSync(generatorFile, 'utf8');
        const lines = content.split('\n').slice(0, 100);
        console.log('📋 数据生成器内容预览:');
        console.log(lines.join('\n'));
      }
    }
  } else {
    console.log('❌ 未找到前端项目');
  }
  
  console.log('\n💡 获取真实数据的方法:');
  console.log('1. 在浏览器中打开你的前端应用');
  console.log('2. 打开开发者工具 (F12)');
  console.log('3. 在Console中运行以下代码:');
  console.log('');
  console.log('// 获取库存数据');
  console.log('console.log("=== 库存数据 ===");');
  console.log('const inventoryData = localStorage.getItem("unified_inventory_data") || localStorage.getItem("inventory_data");');
  console.log('if (inventoryData) {');
  console.log('  const data = JSON.parse(inventoryData);');
  console.log('  console.log("库存数据条数:", data.length);');
  console.log('  console.log("前5条数据:", data.slice(0, 5));');
  console.log('} else {');
  console.log('  console.log("未找到库存数据");');
  console.log('}');
  console.log('');
  console.log('// 获取测试数据');
  console.log('console.log("=== 测试数据 ===");');
  console.log('const labData = localStorage.getItem("unified_lab_data") || localStorage.getItem("lab_data");');
  console.log('if (labData) {');
  console.log('  const data = JSON.parse(labData);');
  console.log('  console.log("测试数据条数:", data.length);');
  console.log('  console.log("前5条数据:", data.slice(0, 5));');
  console.log('} else {');
  console.log('  console.log("未找到测试数据");');
  console.log('}');
  console.log('');
  console.log('// 获取生产数据');
  console.log('console.log("=== 生产数据 ===");');
  console.log('const factoryData = localStorage.getItem("unified_factory_data") || localStorage.getItem("factory_data");');
  console.log('if (factoryData) {');
  console.log('  const data = JSON.parse(factoryData);');
  console.log('  console.log("生产数据条数:", data.length);');
  console.log('  console.log("前5条数据:", data.slice(0, 5));');
  console.log('} else {');
  console.log('  console.log("未找到生产数据");');
  console.log('}');
  console.log('');
  console.log('4. 将输出的数据复制给我，我会基于真实数据更新系统');
  console.log('');
  console.log('或者，你也可以:');
  console.log('5. 在前端应用中导出数据到JSON文件');
  console.log('6. 将JSON文件内容提供给我');
}

fetchRealFrontendData();
