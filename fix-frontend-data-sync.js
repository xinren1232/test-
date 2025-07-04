/**
 * 修复前端数据同步问题
 * 确保前端能够正确获取和使用您的真实生成数据
 */

const fs = require('fs');
const path = require('path');

// 读取您的真实生成数据
function loadRealData() {
  console.log('📊 读取真实生成数据...');
  
  try {
    const inventoryData = JSON.parse(fs.readFileSync('unified_inventory_data.json', 'utf8'));
    const inspectionData = JSON.parse(fs.readFileSync('unified_lab_data.json', 'utf8'));
    const productionData = JSON.parse(fs.readFileSync('unified_factory_data.json', 'utf8'));
    
    console.log(`✅ 数据读取成功:`);
    console.log(`   📦 库存数据: ${inventoryData.length} 条`);
    console.log(`   🧪 检测数据: ${inspectionData.length} 条`);
    console.log(`   🏭 生产数据: ${productionData.length} 条`);
    
    return {
      inventory: inventoryData,
      inspection: inspectionData,
      production: productionData
    };
  } catch (error) {
    console.error('❌ 读取数据失败:', error.message);
    return null;
  }
}

// 同步数据到后端
async function syncToBackend(data) {
  console.log('🔄 同步数据到后端...');
  
  try {
    const response = await fetch('http://localhost:3001/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ 后端数据同步成功:', result);
      return true;
    } else {
      console.error('❌ 后端同步失败:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ 后端同步异常:', error.message);
    return false;
  }
}

// 创建前端数据同步脚本
function createFrontendSyncScript(data) {
  console.log('📝 创建前端数据同步脚本...');
  
  const syncScript = `
// 前端数据同步脚本 - 自动生成
// 确保前端使用您的真实生成数据

(function() {
  console.log('🔄 开始前端数据同步...');
  
  // 您的真实数据
  const realData = ${JSON.stringify(data, null, 2)};
  
  // 存储到 localStorage
  localStorage.setItem('unified_inventory_data', JSON.stringify(realData.inventory));
  localStorage.setItem('unified_lab_data', JSON.stringify(realData.inspection));
  localStorage.setItem('unified_factory_data', JSON.stringify(realData.production));
  
  // 兼容旧版本键名
  localStorage.setItem('inventory_data', JSON.stringify(realData.inventory));
  localStorage.setItem('lab_data', JSON.stringify(realData.inspection));
  localStorage.setItem('factory_data', JSON.stringify(realData.production));
  
  console.log('✅ 前端数据同步完成');
  console.log('📊 数据统计:', {
    inventory: realData.inventory.length,
    inspection: realData.inspection.length,
    production: realData.production.length
  });
  
  // 触发数据更新事件
  window.dispatchEvent(new CustomEvent('dataUpdated', { 
    detail: realData 
  }));
})();
`;
  
  // 保存到前端公共目录
  const scriptPath = path.join('ai-inspection-dashboard', 'public', 'sync-real-data.js');
  fs.writeFileSync(scriptPath, syncScript);
  console.log(`✅ 前端同步脚本已保存: ${scriptPath}`);
  
  return scriptPath;
}

// 修复前端组件的数据同步逻辑
function fixFrontendComponent() {
  console.log('🔧 修复前端组件数据同步逻辑...');
  
  const componentPath = path.join('ai-inspection-dashboard', 'src', 'pages', 'AssistantPageAIThreeColumn.vue');
  
  if (!fs.existsSync(componentPath)) {
    console.error('❌ 前端组件文件不存在');
    return false;
  }
  
  let content = fs.readFileSync(componentPath, 'utf8');
  
  // 查找并替换 syncDataToBackend 函数
  const oldSyncFunction = /const syncDataToBackend = async \(\) => \{[\s\S]*?\n\}/;
  
  const newSyncFunction = `const syncDataToBackend = async () => {
  try {
    console.log('🔄 开始同步真实数据到后端...')

    // 首先尝试从生成的数据文件直接读取
    let dataToPush = null;
    
    try {
      // 尝试从后端获取最新的真实数据
      const dataResponse = await fetch('/api/assistant/get-real-data');
      if (dataResponse.ok) {
        dataToPush = await dataResponse.json();
        console.log('✅ 从后端获取真实数据成功');
      }
    } catch (error) {
      console.log('⚠️ 从后端获取数据失败，尝试localStorage');
    }
    
    // 如果后端获取失败，从localStorage获取
    if (!dataToPush) {
      const inventoryData = localStorage.getItem('unified_inventory_data') || localStorage.getItem('inventory_data')
      const labData = localStorage.getItem('unified_lab_data') || localStorage.getItem('lab_data')
      const factoryData = localStorage.getItem('unified_factory_data') || localStorage.getItem('factory_data')

      dataToPush = {
        inventory: inventoryData ? JSON.parse(inventoryData) : [],
        inspection: labData ? JSON.parse(labData) : [],
        production: factoryData ? JSON.parse(factoryData) : []
      }
    }

    console.log(\`📊 准备推送数据: 库存\${dataToPush.inventory.length}条, 检测\${dataToPush.inspection.length}条, 生产\${dataToPush.production.length}条\`)

    if (dataToPush.inventory.length === 0 && dataToPush.inspection.length === 0 && dataToPush.production.length === 0) {
      console.log('⚠️ 没有数据可推送，尝试重新生成数据')
      
      // 调用数据生成接口
      const generateResponse = await fetch('/api/assistant/generate-real-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (generateResponse.ok) {
        const generatedData = await generateResponse.json();
        dataToPush = generatedData;
        console.log('✅ 重新生成数据成功');
      } else {
        console.log('❌ 数据生成失败');
        return;
      }
    }

    // 推送数据到后端
    const response = await fetch('/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToPush)
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ 真实数据同步成功:', result)
      ElMessage.success('数据同步成功')
    } else {
      console.error('❌ 数据同步失败:', response.status)
      ElMessage.error('数据同步失败')
    }

  } catch (error) {
    console.error('❌ 数据同步出错:', error)
    ElMessage.error('数据同步出错: ' + error.message)
  }
}`;

  if (oldSyncFunction.test(content)) {
    content = content.replace(oldSyncFunction, newSyncFunction);
    fs.writeFileSync(componentPath, content);
    console.log('✅ 前端组件数据同步逻辑已修复');
    return true;
  } else {
    console.log('⚠️ 未找到需要替换的函数，可能已经是最新版本');
    return false;
  }
}

// 主执行函数
async function main() {
  console.log('🚀 开始修复前端数据同步问题');
  console.log('=' .repeat(50));
  
  // 1. 读取真实数据
  const realData = loadRealData();
  if (!realData) {
    console.error('❌ 无法读取真实数据，请先运行数据生成程序');
    return;
  }
  
  // 2. 同步到后端
  const backendSyncSuccess = await syncToBackend(realData);
  if (!backendSyncSuccess) {
    console.error('❌ 后端数据同步失败');
    return;
  }
  
  // 3. 创建前端同步脚本
  const scriptPath = createFrontendSyncScript(realData);
  
  // 4. 修复前端组件
  const componentFixed = fixFrontendComponent();
  
  console.log('\n📋 修复结果总结:');
  console.log('=' .repeat(50));
  console.log(`✅ 真实数据读取: 成功`);
  console.log(`✅ 后端数据同步: ${backendSyncSuccess ? '成功' : '失败'}`);
  console.log(`✅ 前端同步脚本: 已创建 (${scriptPath})`);
  console.log(`✅ 前端组件修复: ${componentFixed ? '已修复' : '无需修复'}`);
  
  console.log('\n🔧 下一步操作建议:');
  console.log('1. 重启前端开发服务器 (npm run dev)');
  console.log('2. 在浏览器中打开智能问答页面');
  console.log('3. 检查浏览器控制台确认数据同步成功');
  console.log('4. 测试左侧规则查询功能');
}

// 执行修复
main().catch(console.error);
