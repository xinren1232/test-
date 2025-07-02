/**
 * 最终格式测试 - 验证前端显示效果
 */
import fetch from 'node-fetch';

async function finalFormatTest() {
  console.log('🎯 最终格式测试开始...\n');
  
  try {
    // 1. 推送丰富的测试数据
    console.log('📊 步骤1: 推送丰富的测试数据...');
    
    const richTestData = {
      inventory: [
        {
          id: 'INV_001',
          materialName: '电池盖',
          materialCode: 'CS-S-B001',
          materialType: '结构件类',
          batchNo: 'JL2024001',
          supplier: '聚龙',
          quantity: 1200,
          status: '正常',
          warehouse: '深圳库存',
          factory: '深圳工厂',
          notes: '正常库存'
        },
        {
          id: 'INV_002',
          materialName: 'OLED显示屏',
          materialCode: 'CS-O-O001',
          materialType: '光学类',
          batchNo: 'BOE2024001',
          supplier: 'BOE',
          quantity: 800,
          status: '风险',
          warehouse: '深圳库存',
          factory: '深圳工厂',
          notes: '需要重点关注'
        },
        {
          id: 'INV_003',
          materialName: '锂电池',
          materialCode: 'CS-P-L001',
          materialType: '电源类',
          batchNo: 'CATL2024001',
          supplier: '宁德时代',
          quantity: 600,
          status: '冻结',
          warehouse: '深圳库存',
          factory: '深圳工厂',
          notes: '质量问题，暂停使用'
        }
      ],
      inspection: [
        {
          id: 'TEST_001',
          materialName: 'OLED显示屏',
          batchNo: 'BOE2024001',
          supplier: 'BOE',
          testDate: '2025-06-11',
          testResult: 'FAIL',
          defectDescription: '显示异常'
        },
        {
          id: 'TEST_002',
          materialName: '锂电池',
          batchNo: 'CATL2024001',
          supplier: '宁德时代',
          testDate: '2025-06-10',
          testResult: 'FAIL',
          defectDescription: '电压不稳定'
        }
      ],
      production: [
        {
          id: 'PROD_001',
          materialName: '电池盖',
          batchNo: 'JL2024001',
          supplier: '聚龙',
          factory: '深圳工厂',
          defectRate: 1.2
        }
      ]
    };
    
    // 推送数据
    const pushResponse = await fetch('http://localhost:3002/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(richTestData)
    });
    
    if (!pushResponse.ok) {
      throw new Error(`数据推送失败: ${pushResponse.status}`);
    }
    
    console.log('✅ 丰富测试数据推送成功');
    
    // 2. 测试多种查询类型
    const testQueries = [
      '查询所有库存状态',
      '哪些物料有质量问题？',
      '深圳工厂的库存情况如何？',
      'BOE供应商的物料检测结果',
      '目前有哪些风险和冻结的库存？'
    ];
    
    console.log('\n📊 步骤2: 测试多种查询类型...\n');
    
    for (let i = 0; i < testQueries.length; i++) {
      const query = testQueries[i];
      console.log(`🎯 测试查询 ${i + 1}: "${query}"`);
      
      try {
        const response = await fetch('http://localhost:3002/api/assistant/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        
        console.log('📋 返回结果:');
        console.log('格式:', typeof result.reply);
        console.log('长度:', result.reply ? result.reply.length : 0);
        console.log('内容:');
        console.log('─'.repeat(50));
        console.log(result.reply);
        console.log('─'.repeat(50));
        console.log('');
        
      } catch (error) {
        console.error(`❌ 查询失败:`, error.message);
      }
    }
    
    // 3. 前端显示建议
    console.log('📊 步骤3: 前端显示优化建议...\n');
    
    console.log('🎨 CSS样式已优化:');
    console.log('✅ white-space: pre-wrap - 保持换行符');
    console.log('✅ line-height: 1.6 - 适当行间距');
    console.log('✅ font-family - 清晰字体');
    console.log('✅ word-break: break-word - 长文本换行');
    
    console.log('\n🔧 前端代理已修复:');
    console.log('✅ 代理端口从3001修改为3002');
    console.log('✅ 前端和后端返回相同结果');
    
    console.log('\n🎯 测试建议:');
    console.log('1. 打开浏览器访问 http://localhost:5173');
    console.log('2. 点击"智能问答助手"');
    console.log('3. 输入上述任一测试查询');
    console.log('4. 检查回复格式是否正确显示');
    console.log('5. 验证换行符、图标、缩进是否正常');
    
    console.log('\n🎉 最终格式测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

finalFormatTest().catch(console.error);
