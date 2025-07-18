// 测试所有规则的同步情况
const axios = require('axios');

async function testAllRules() {
  try {
    console.log('🔍 检查所有规则的同步情况...\n');
    
    // 1. 首先获取所有规则
    console.log('📋 获取规则列表:');
    const rulesResponse = await axios.get('http://localhost:3001/api/rules');
    
    if (rulesResponse.data.success) {
      const rules = rulesResponse.data.data;
      console.log(`✅ 获取到 ${rules.length} 条规则`);
      
      console.log('\n规则列表:');
      rules.forEach((rule, index) => {
        console.log(`${index + 1}. ${rule.intent_name} - ${rule.description}`);
        console.log(`   触发词: ${rule.trigger_words}`);
        console.log(`   示例: ${rule.example_query}`);
        console.log(`   目标: ${rule.action_target}`);
        console.log('');
      });
      
      // 2. 测试每个规则
      console.log('🧪 测试每个规则的查询效果:\n');
      
      for (const rule of rules) {
        console.log(`📝 测试规则: ${rule.intent_name}`);
        console.log(`   使用示例查询: "${rule.example_query}"`);
        
        try {
          const queryResponse = await axios.post('http://localhost:3001/api/assistant/query', {
            query: rule.example_query
          });
          
          if (queryResponse.data.success) {
            const tableData = queryResponse.data.tableData || [];
            const cards = queryResponse.data.cards || [];
            
            console.log(`   ✅ 查询成功`);
            console.log(`   📊 返回数据: ${tableData.length} 条`);
            console.log(`   📈 统计卡片: ${cards.length} 个`);
            
            if (tableData.length > 0) {
              const firstItem = tableData[0];
              const fieldCount = Object.keys(firstItem).length;
              console.log(`   🏷️  字段数量: ${fieldCount}`);
              console.log(`   🏷️  字段列表: ${Object.keys(firstItem).join(', ')}`);
              
              // 检查是否有真实数据
              const hasRealData = !JSON.stringify(firstItem).includes('未知');
              console.log(`   🎯 真实数据: ${hasRealData ? '是' : '否'}`);
            }
            
            if (cards.length > 0) {
              console.log(`   📈 卡片信息:`);
              cards.forEach(card => {
                console.log(`      ${card.title}: ${card.value} ${card.unit || ''}`);
              });
            }
            
          } else {
            console.log(`   ❌ 查询失败: ${queryResponse.data.error || '未知错误'}`);
          }
          
        } catch (error) {
          console.log(`   ❌ 请求失败: ${error.message}`);
        }
        
        console.log('   ' + '-'.repeat(50));
        
        // 添加延迟避免请求过快
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // 3. 测试一些自定义查询
      console.log('\n🎯 测试自定义查询:\n');
      
      const customQueries = [
        '查询所有库存',
        '显示检验结果',
        '生产数据统计',
        '查询不合格产品',
        '显示库存不足的物料',
        '查询最近的检验记录',
        '显示生产异常情况'
      ];
      
      for (const query of customQueries) {
        console.log(`🔍 测试查询: "${query}"`);
        
        try {
          const response = await axios.post('http://localhost:3001/api/assistant/query', {
            query: query
          });
          
          if (response.data.success) {
            const tableData = response.data.tableData || [];
            const matchedRule = response.data.matchedRule || '未匹配';
            
            console.log(`   ✅ 匹配规则: ${matchedRule}`);
            console.log(`   📊 返回数据: ${tableData.length} 条`);
            
            if (tableData.length > 0) {
              const fieldCount = Object.keys(tableData[0]).length;
              console.log(`   🏷️  字段数量: ${fieldCount}`);
            }
          } else {
            console.log(`   ❌ 查询失败: ${response.data.error || '未知错误'}`);
          }
          
        } catch (error) {
          console.log(`   ❌ 请求失败: ${error.message}`);
        }
        
        console.log('');
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
    } else {
      console.log('❌ 获取规则列表失败');
    }
    
    console.log('🎉 所有规则测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testAllRules();
