import axios from 'axios';

async function testFieldMapping() {
  const baseURL = 'http://localhost:3001';
  
  console.log('=== 测试字段映射修复效果 ===\n');
  
  const testQueries = [
    {
      query: 'BOE供应商的物料库存',
      expectedFields: ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'],
      scenario: '库存查询'
    },
    {
      query: 'BOE供应商的测试记录',
      expectedFields: ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注'],
      scenario: '测试查询'
    },
    {
      query: 'BOE供应商的上线生产记录',
      expectedFields: ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '不良现象', '检验日期', '备注'],
      scenario: '生产查询'
    }
  ];
  
  for (const test of testQueries) {
    console.log(`\n🧪 测试: ${test.scenario}`);
    console.log(`查询: "${test.query}"`);
    console.log(`期望字段: ${test.expectedFields.join(', ')}`);
    
    try {
      const response = await axios.post(`${baseURL}/api/assistant/query`, {
        query: test.query
      });
      
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        const actualFields = Object.keys(response.data.data[0]);
        console.log(`实际字段: ${actualFields.join(', ')}`);
        
        // 检查字段匹配情况
        const missingFields = test.expectedFields.filter(field => !actualFields.includes(field));
        const extraFields = actualFields.filter(field => !test.expectedFields.includes(field));
        
        if (missingFields.length === 0 && extraFields.length === 0) {
          console.log('✅ 字段映射完全匹配');
        } else {
          console.log('❌ 字段映射不匹配:');
          if (missingFields.length > 0) {
            console.log(`  缺少字段: ${missingFields.join(', ')}`);
          }
          if (extraFields.length > 0) {
            console.log(`  多余字段: ${extraFields.join(', ')}`);
          }
        }
        
        // 显示第一条数据示例
        console.log('📋 数据示例:');
        const firstRecord = response.data.data[0];
        Object.keys(firstRecord).forEach(key => {
          const value = firstRecord[key];
          console.log(`  ${key}: ${value}`);
        });
        
        console.log(`📊 数据统计: ${response.data.data.length} 条记录`);
        
      } else {
        console.log('❌ 查询失败或无数据');
        console.log('响应:', JSON.stringify(response.data, null, 2));
      }
      
    } catch (error) {
      console.log('❌ 请求失败:', error.message);
      if (error.response) {
        console.log('错误响应:', error.response.data);
      }
    }
  }
  
  console.log('\n=== 测试完成 ===');
}

// 等待后端服务启动
setTimeout(() => {
  testFieldMapping().catch(console.error);
}, 3000);
