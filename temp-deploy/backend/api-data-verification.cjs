// API数据完整性验证
const http = require('http');

function testAPIData() {
  const postData = JSON.stringify({
    query: '查询库存信息'
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/assistant/query',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('🔍 API数据验证结果:\n');
        
        if (response.success && response.tableData && response.tableData.length > 0) {
          console.log(`✅ 成功获取 ${response.tableData.length} 条数据`);
          
          const firstItem = response.tableData[0];
          console.log('\n📋 第一条数据的所有字段:');
          Object.entries(firstItem).forEach(([key, value]) => {
            console.log(`   ${key}: ${value}`);
          });
          
          // 检查关键字段
          const requiredFields = ['工厂', '仓库', '物料编码', '物料名称', '供应商', '批次号', '数量', '状态'];
          const missingFields = requiredFields.filter(field => !firstItem.hasOwnProperty(field));
          
          console.log(`\n📊 字段完整性检查:`);
          console.log(`   总字段数: ${Object.keys(firstItem).length}`);
          console.log(`   必需字段: ${requiredFields.length}`);
          console.log(`   缺失字段: ${missingFields.length}`);
          
          if (missingFields.length === 0) {
            console.log('   ✅ 所有必需字段都存在');
          } else {
            console.log(`   ❌ 缺失字段: ${missingFields.join(', ')}`);
          }
          
          // 检查数据真实性
          const hasRealData = firstItem.物料编码 && firstItem.物料编码.startsWith('MAT_') &&
                             firstItem.批次号 && firstItem.批次号.startsWith('BATCH_');
          
          console.log(`\n🎯 数据来源判断:`);
          console.log(`   物料编码格式: ${firstItem.物料编码 ? (firstItem.物料编码.startsWith('MAT_') ? '✅ 真实格式' : '❌ 非真实格式') : '❌ 缺失'}`);
          console.log(`   批次号格式: ${firstItem.批次号 ? (firstItem.批次号.startsWith('BATCH_') ? '✅ 真实格式' : '❌ 非真实格式') : '❌ 缺失'}`);
          console.log(`   数据来源: ${hasRealData ? '✅ 来自真实数据表' : '❌ 可能来自同步表'}`);
          
          // 显示前3条数据概览
          console.log('\n📋 前3条数据概览:');
          response.tableData.slice(0, 3).forEach((item, index) => {
            console.log(`\n${index + 1}. ${item.物料名称 || 'N/A'}`);
            console.log(`   工厂: ${item.工厂 || 'N/A'}`);
            console.log(`   仓库: ${item.仓库 || 'N/A'}`);
            console.log(`   编码: ${item.物料编码 || 'N/A'}`);
            console.log(`   供应商: ${item.供应商 || 'N/A'}`);
            console.log(`   批次: ${item.批次号 || 'N/A'}`);
            console.log(`   数量: ${item.数量 || 'N/A'}`);
            console.log(`   状态: ${item.状态 || 'N/A'}`);
          });
          
          // 总结
          console.log('\n🎯 验证总结:');
          if (missingFields.length === 0 && hasRealData) {
            console.log('✅ 数据完整且来自真实数据表，修复成功！');
          } else if (missingFields.length === 0) {
            console.log('⚠️  字段完整但数据可能来自同步表');
          } else {
            console.log('❌ 字段不完整，需要进一步修复');
          }
          
        } else {
          console.log('❌ API返回失败或无数据');
          console.log('响应:', response);
        }
      } catch (error) {
        console.error('❌ 解析响应失败:', error.message);
        console.log('原始响应:', data.substring(0, 500));
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ 请求失败: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

console.log('🚀 开始API数据验证...');
console.log('⏰ 当前时间:', new Date().toLocaleString());
testAPIData();
