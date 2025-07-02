/**
 * 测试AI优先级修复后的功能
 */
import fetch from 'node-fetch';

async function testAIPriorityFix() {
  console.log('🔧 测试AI优先级修复后的功能...\n');
  
  try {
    // 1. 重新推送数据确保AI有数据可用
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

    // 2. 测试AI优先级查询
    console.log('\n📊 步骤2: 测试AI优先级查询...');
    const testQueries = [
      {
        name: 'AI增强查询1',
        query: '你好，请介绍一下你的功能',
        scenario: 'comprehensive_quality',
        analysisMode: 'professional',
        requireDataAnalysis: true
      },
      {
        name: 'AI增强查询2',
        query: '请分析一下当前的质量管理情况',
        scenario: 'comprehensive_quality',
        analysisMode: 'professional',
        requireDataAnalysis: true
      },
      {
        name: 'AI增强查询3',
        query: '为什么会出现质量问题？',
        scenario: 'quality_inspection',
        analysisMode: 'professional',
        requireDataAnalysis: true
      },
      {
        name: '业务数据查询',
        query: '查询深圳工厂的库存',
        scenario: 'material_inventory',
        analysisMode: 'professional',
        requireDataAnalysis: true
      }
    ];

    for (const testCase of testQueries) {
      console.log(`\n🎯 测试${testCase.name}: "${testCase.query}"`);
      
      try {
        const response = await fetch('http://localhost:3001/api/assistant/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(testCase)
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ 查询成功');
          console.log('📋 数据源:', result.source || '未知');
          console.log('🤖 AI增强:', result.aiEnhanced ? '是' : '否');
          console.log('📄 分析模式:', result.analysisMode || '未知');
          console.log('📄 回复长度:', result.reply.length, '字符');
          
          // 检查是否是AI增强回复
          if (result.source === 'ai-enhanced' && result.aiEnhanced === true) {
            console.log('🎉 AI增强成功处理此查询！');
          } else if (result.source === 'iqe-professional') {
            console.log('⚠️ 使用了专业模板回复');
          } else {
            console.log('⚠️ 使用了其他处理方式');
          }
        } else {
          console.log('❌ 查询失败:', response.status, response.statusText);
          const errorText = await response.text();
          console.log('❌ 错误详情:', errorText);
        }
      } catch (error) {
        console.log('❌ 查询错误:', error.message);
      }
    }

    console.log('\n🎯 AI优先级修复测试完成！');

  } catch (error) {
    console.error('❌ 测试过程出错:', error.message);
  }
}

// 运行测试
testAIPriorityFix();
