/**
 * 检查数据同步问题
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 检查数据同步问题...\n');

// 1. 检查MaterialSupplierMap.js文件
const mapPath = path.join(__dirname, '../ai-inspection-dashboard/src/data/MaterialSupplierMap.js');
console.log('1. 检查MaterialSupplierMap.js文件:');
console.log(`   文件路径: ${mapPath}`);

if (fs.existsSync(mapPath)) {
  console.log('   ✅ 文件存在');
  
  const content = fs.readFileSync(mapPath, 'utf8');
  
  // 提取供应商信息
  const supplierMatches = content.match(/suppliers:\s*\[(.*?)\]/g);
  if (supplierMatches) {
    console.log('   📋 找到的供应商配置:');
    supplierMatches.slice(0, 5).forEach((match, index) => {
      console.log(`      ${index + 1}: ${match}`);
    });
  }
  
  // 检查是否包含"聚龙"等供应商
  if (content.includes('聚龙')) {
    console.log('   ✅ 包含"聚龙"供应商');
  } else {
    console.log('   ❌ 不包含"聚龙"供应商');
  }
  
  if (content.includes('欣冠')) {
    console.log('   ✅ 包含"欣冠"供应商');
  } else {
    console.log('   ❌ 不包含"欣冠"供应商');
  }
  
} else {
  console.log('   ❌ 文件不存在');
}

console.log('\n2. 检查SystemDataUpdater.js导入:');
const updaterPath = path.join(__dirname, '../ai-inspection-dashboard/src/services/SystemDataUpdater.js');
if (fs.existsSync(updaterPath)) {
  console.log('   ✅ SystemDataUpdater.js存在');
  
  const updaterContent = fs.readFileSync(updaterPath, 'utf8');
  if (updaterContent.includes('MaterialSupplierMap.js')) {
    console.log('   ✅ 导入了MaterialSupplierMap.js');
  } else {
    console.log('   ❌ 没有导入MaterialSupplierMap.js');
  }
} else {
  console.log('   ❌ SystemDataUpdater.js不存在');
}

console.log('\n3. 检查数据同步接口:');
console.log('   后端接口: http://localhost:3001/api/assistant/update-data');
console.log('   前端推送方法: SystemDataUpdater.pushDataToAssistant()');

console.log('\n📊 总结:');
console.log('   问题可能原因:');
console.log('   1. 前端生成的数据没有正确推送到后端');
console.log('   2. 数据库中的数据是旧数据，没有被新数据覆盖');
console.log('   3. 数据同步过程中字段映射有问题');
console.log('   4. 前端实际使用的不是MaterialSupplierMap.js中的数据');
