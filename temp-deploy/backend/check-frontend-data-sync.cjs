// 检查前端数据同步状态
const mysql = require('mysql2/promise');
const fs = require('fs');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkFrontendDataSync() {
  try {
    console.log('🔍 检查前端数据同步状态...\n');
    
    // 1. 检查是否有数据同步记录表
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('1. 检查数据同步记录表:');
    try {
      const [syncRecords] = await connection.execute(`
        SELECT * FROM frontend_data_sync 
        ORDER BY created_at DESC 
        LIMIT 5
      `);
      
      if (syncRecords.length > 0) {
        console.log(`✅ 找到 ${syncRecords.length} 条同步记录:`);
        for (const record of syncRecords) {
          try {
            const dataContent = typeof record.data_content === 'string'
              ? JSON.parse(record.data_content)
              : record.data_content;
            console.log(`  - ${record.data_type}: ${dataContent.length} 条数据 (${record.created_at})`);
          } catch (error) {
            console.log(`  - ${record.data_type}: 解析错误 (${record.created_at})`);
          }
        }
      } else {
        console.log('❌ 没有找到数据同步记录');
      }
    } catch (error) {
      console.log('❌ 数据同步记录表不存在或查询失败:', error.message);
    }
    
    // 2. 检查生成的前端数据文件
    console.log('\n2. 检查生成的前端数据文件:');
    
    const dataFiles = [
      'frontend-data-sync.js',
      'sync-frontend-data.js', 
      '../ai-inspection-dashboard/public/data-sync.js',
      '../frontend/data/sync-data.js'
    ];
    
    for (const file of dataFiles) {
      try {
        if (fs.existsSync(file)) {
          const stats = fs.statSync(file);
          console.log(`✅ 找到数据文件: ${file} (${(stats.size/1024).toFixed(1)}KB, ${stats.mtime})`);
        } else {
          console.log(`❌ 数据文件不存在: ${file}`);
        }
      } catch (error) {
        console.log(`❌ 检查文件失败: ${file} - ${error.message}`);
      }
    }
    
    // 3. 生成最新的前端数据同步脚本
    console.log('\n3. 生成最新的前端数据同步脚本:');
    
    try {
      // 从数据同步记录表获取最新数据
      const [latestSync] = await connection.execute(`
        SELECT data_type, data_content 
        FROM frontend_data_sync 
        WHERE created_at = (SELECT MAX(created_at) FROM frontend_data_sync)
      `);
      
      if (latestSync.length > 0) {
        console.log(`✅ 获取到最新同步数据: ${latestSync.length} 个数据类型`);
        
        // 组织数据
        const syncData = {};
        for (const record of latestSync) {
          try {
            syncData[record.data_type] = typeof record.data_content === 'string'
              ? JSON.parse(record.data_content)
              : record.data_content;
          } catch (error) {
            console.log(`❌ 解析${record.data_type}数据失败:`, error.message);
            syncData[record.data_type] = [];
          }
        }
        
        // 生成前端同步脚本
        const syncScript = `
// 前端数据同步脚本 - 自动生成于 ${new Date().toISOString()}
// 这个脚本将生成的数据同步到前端localStorage

(function() {
  console.log('🔄 开始同步生成的数据到前端localStorage...');
  
  // 库存数据
  const inventoryData = ${JSON.stringify(syncData.inventory || [], null, 2)};
  
  // 检验数据  
  const inspectionData = ${JSON.stringify(syncData.inspection || [], null, 2)};
  
  // 生产数据
  const productionData = ${JSON.stringify(syncData.production || [], null, 2)};
  
  try {
    // 同步到localStorage - 使用统一的键名
    localStorage.setItem('unified_inventory_data', JSON.stringify(inventoryData));
    localStorage.setItem('unified_lab_data', JSON.stringify(inspectionData));
    localStorage.setItem('unified_factory_data', JSON.stringify(productionData));
    
    // 兼容旧版本键名
    localStorage.setItem('inventory_data', JSON.stringify(inventoryData));
    localStorage.setItem('lab_data', JSON.stringify(inspectionData));
    localStorage.setItem('factory_data', JSON.stringify(productionData));
    localStorage.setItem('lab_test_data', JSON.stringify(inspectionData));
    localStorage.setItem('production_data', JSON.stringify(productionData));
    
    console.log('✅ 数据同步到localStorage成功:');
    console.log(\`  - 库存数据: \${inventoryData.length} 条\`);
    console.log(\`  - 检验数据: \${inspectionData.length} 条\`);
    console.log(\`  - 生产数据: \${productionData.length} 条\`);
    
    // 触发数据更新事件
    window.dispatchEvent(new CustomEvent('dataSync', {
      detail: {
        inventory: inventoryData,
        inspection: inspectionData,
        production: productionData
      }
    }));
    
    return true;
  } catch (error) {
    console.error('❌ 数据同步失败:', error);
    return false;
  }
})();

// 导出数据供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    inventory: ${JSON.stringify(syncData.inventory || [], null, 2)},
    inspection: ${JSON.stringify(syncData.inspection || [], null, 2)},
    production: ${JSON.stringify(syncData.production || [], null, 2)}
  };
}
`;
        
        // 保存到前端public目录
        const frontendSyncPath = '../ai-inspection-dashboard/public/data-sync.js';
        fs.writeFileSync(frontendSyncPath, syncScript);
        console.log(`✅ 前端同步脚本已生成: ${frontendSyncPath}`);
        
        // 统计数据
        console.log('\n📊 数据统计:');
        console.log(`  - 库存数据: ${(syncData.inventory || []).length} 条`);
        console.log(`  - 检验数据: ${(syncData.inspection || []).length} 条`);
        console.log(`  - 生产数据: ${(syncData.production || []).length} 条`);
        
      } else {
        console.log('❌ 没有找到最新的同步数据');
      }
    } catch (error) {
      console.log('❌ 生成前端同步脚本失败:', error.message);
    }
    
    // 4. 修改后端API使其从localStorage数据调取
    console.log('\n4. 检查后端API数据源配置:');
    
    // 检查当前后端是否配置为从localStorage数据调取
    try {
      const backendFile = 'real-data-backend.js';
      if (fs.existsSync(backendFile)) {
        const content = fs.readFileSync(backendFile, 'utf8');
        
        if (content.includes('localStorage') || content.includes('frontend_data_sync')) {
          console.log('✅ 后端已配置为从前端数据源调取');
        } else {
          console.log('⚠️  后端可能仍在从数据库调取，需要修改');
        }
      }
    } catch (error) {
      console.log('❌ 检查后端配置失败:', error.message);
    }
    
    await connection.end();
    
    // 5. 提供修复建议
    console.log('\n💡 修复建议:');
    console.log('1. 确保前端加载了data-sync.js脚本');
    console.log('2. 修改后端API从frontend_data_sync表或localStorage数据调取');
    console.log('3. 测试前端localStorage中是否有数据');
    console.log('4. 确保规则匹配后从正确的数据源查询');
    
    console.log('\n🎯 下一步操作:');
    console.log('1. 在浏览器中打开 http://localhost:5174/data-sync.js 加载数据');
    console.log('2. 修改后端API使其从同步的数据表调取');
    console.log('3. 重新测试规则查询功能');
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

checkFrontendDataSync();
