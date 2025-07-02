/**
 * 测试修复后的AI智能问答接入
 */
import fetch from 'node-fetch';

async function testAIFixed() {
  console.log('🔧 测试修复后的AI智能问答接入...\n');
  
  try {
    // 1. 重新推送数据
    console.log('📊 步骤1: 重新推送测试数据...');
    const mockData = {
      inventory: [
        {
          id: "INV_001",
          factory: "深圳工厂",
          warehouse: "A区仓库",
          materialCode: "CS-S-M4529",
          materialName: "OLED显示屏",
          supplier: "聚龙",
          batchCode: "T14127",
          quantity: 850,
          status: "正常"
        }
      ],
      inspection: [
        {
          id: "TEST_001",
          testDate: "2025-09-14",
          materialName: "OLED显示屏",
          testResult: "PASS"
        }
      ],
      production: [
        {
          id: "PROD_001",
          materialName: "OLED显示屏",
          defectRate: 2.1,
          defect: "轻微mura现象"
        }
      ]
    };

    const updateResponse = await fetch('http://localhost:3001/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mockData)
    });

    if (updateResponse.ok) {
      console.log('✅ 数据推送成功');
    } else {
      console.log('❌ 数据推送失败:', updateResponse.status);
    }

    // 2. 测试AI触发查询
    console.log('\n📊 步骤2: 测试AI触发查询...');
    const aiQueries = [
      '你好，请介绍一下你的功能',
      '请分析一下当前的质量管理情况',
      '为什么会出现质量问题？'
    ];

    for (const query of aiQueries) {
      console.log(`\n🎯 测试AI查询: "${query}"`);
      
      const response = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ 查询成功');
        console.log('📋 数据源:', result.source || '未知');
        console.log('🤖 AI增强:', result.aiEnhanced ? '是' : '否');
        console.log('📄 匹配规则:', result.matchedRule || '无');
        console.log('📄 回复长度:', result.reply.length, '字符');
        
        // 检查是否是AI回复
        if (result.source === 'ai-enhanced' && result.aiEnhanced === true) {
          console.log('🎉 AI成功处理此查询！');
        } else if (result.source === 'ai-enhanced' && result.aiEnhanced !== true) {
          console.log('⚠️ AI处理了查询但aiEnhanced标志错误');
        } else {
          console.log('⚠️ 此查询未使用AI处理');
        }
      } else {
        console.log('❌ 查询失败:', response.status);
      }
    }

    // 3. 测试业务查询
    console.log('\n📊 步骤3: 测试业务查询...');
    const businessQueries = [
      '查询深圳工厂的库存',
      '查询OLED显示屏的情况'
    ];

    for (const query of businessQueries) {
      console.log(`\n🎯 测试业务查询: "${query}"`);
      
      const response = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ 查询成功');
        console.log('📋 数据源:', result.source || '未知');
        console.log('🤖 AI增强:', result.aiEnhanced ? '是' : '否');
        console.log('📄 回复长度:', result.reply.length, '字符');
      } else {
        console.log('❌ 查询失败:', response.status);
      }
    }

    console.log('\n🎯 AI接入测试完成！');

  } catch (error) {
    console.error('❌ 测试过程出错:', error.message);
  }
}

// 运行测试
testAIFixed();
