/**
 * 最终图表功能演示
 */
import fetch from 'node-fetch';

async function finalChartDemo() {
  console.log('🎉 智能问答助手图表功能演示\n');
  
  try {
    // 1. 推送完整测试数据
    console.log('📊 步骤1: 推送完整测试数据...');
    
    const completeTestData = {
      inventory: [
        {
          id: 'DEMO_001',
          materialName: '电池盖',
          materialCode: 'CS-S-B001',
          materialType: '结构件类',
          batchNo: 'JL2024001',
          supplier: '聚龙',
          quantity: 1200,
          status: '正常',
          warehouse: '深圳库存',
          factory: '深圳工厂',
          inspectionDate: '2024-06-01'
        },
        {
          id: 'DEMO_002',
          materialName: 'OLED显示屏',
          materialCode: 'CS-O-O001',
          materialType: '光学类',
          batchNo: 'BOE2024001',
          supplier: 'BOE',
          quantity: 800,
          status: '风险',
          warehouse: '深圳库存',
          factory: '深圳工厂',
          inspectionDate: '2024-06-15'
        },
        {
          id: 'DEMO_003',
          materialName: '锂电池',
          materialCode: 'CS-P-L001',
          materialType: '电源类',
          batchNo: 'CATL2024001',
          supplier: '宁德时代',
          quantity: 600,
          status: '冻结',
          warehouse: '深圳库存',
          factory: '深圳工厂',
          inspectionDate: '2024-06-20'
        }
      ],
      inspection: [
        {
          id: 'TEST_DEMO_001',
          materialName: 'OLED显示屏',
          batchNo: 'BOE2024001',
          supplier: 'BOE',
          testDate: '2024-06-15',
          testResult: 'FAIL',
          defectDescription: '显示异常'
        },
        {
          id: 'TEST_DEMO_002',
          materialName: '锂电池',
          batchNo: 'CATL2024001',
          supplier: '宁德时代',
          testDate: '2024-06-20',
          testResult: 'FAIL',
          defectDescription: '电压不稳定'
        },
        {
          id: 'TEST_DEMO_003',
          materialName: '电池盖',
          batchNo: 'JL2024001',
          supplier: '聚龙',
          testDate: '2024-06-01',
          testResult: 'PASS',
          defectDescription: '测试通过'
        }
      ],
      production: [
        {
          id: 'PROD_DEMO_001',
          materialName: '电池盖',
          batchNo: 'JL2024001',
          supplier: '聚龙',
          factory: '深圳工厂',
          defectRate: 1.2
        },
        {
          id: 'PROD_DEMO_002',
          materialName: 'OLED显示屏',
          batchNo: 'BOE2024001',
          supplier: 'BOE',
          factory: '深圳工厂',
          defectRate: 3.5
        },
        {
          id: 'PROD_DEMO_003',
          materialName: '锂电池',
          batchNo: 'CATL2024001',
          supplier: '宁德时代',
          factory: '深圳工厂',
          defectRate: 2.8
        }
      ]
    };
    
    const pushResponse = await fetch('http://localhost:3002/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(completeTestData)
    });
    
    if (pushResponse.ok) {
      const pushResult = await pushResponse.json();
      console.log('✅ 完整测试数据推送成功');
      console.log(`📊 数据统计: 库存${completeTestData.inventory.length}条, 检测${completeTestData.inspection.length}条, 生产${completeTestData.production.length}条`);
    } else {
      throw new Error(`数据推送失败: ${pushResponse.status}`);
    }
    
    // 2. 演示图表功能
    console.log('\n🎨 步骤2: 演示图表功能...');
    
    const chartDemos = [
      {
        title: '📈 趋势分析图表',
        query: '显示质量趋势分析',
        description: '展示质量数据的时间趋势变化'
      },
      {
        title: '🎯 供应商对比雷达图',
        query: '供应商对比分析',
        description: '多维度对比供应商表现'
      },
      {
        title: '🥧 库存状态分布饼图',
        query: '库存状态分布图',
        description: '显示各状态库存的占比分布'
      }
    ];
    
    for (const demo of chartDemos) {
      console.log(`\n${demo.title}`);
      console.log(`📝 描述: ${demo.description}`);
      console.log(`🎯 查询: "${demo.query}"`);
      
      const queryResponse = await fetch('http://localhost:3002/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: demo.query })
      });
      
      if (queryResponse.ok) {
        const result = await queryResponse.json();
        
        if (result.type === 'chart') {
          console.log('✅ 图表生成成功');
          console.log(`📊 图表类型: ${result.data.chartType}`);
          console.log(`📋 图表标题: ${result.data.chartTitle}`);
          console.log(`📝 图表描述: ${result.data.chartDescription}`);
          console.log(`💬 智能总结: ${result.textSummary}`);
          
          // 验证图表数据
          const chartData = result.data.chartData;
          if (chartData.categories) {
            console.log(`📈 数据维度: ${chartData.categories.length}个时间点`);
          }
          if (chartData.series) {
            console.log(`📊 数据系列: ${chartData.series.length}个指标`);
          }
          if (chartData.data) {
            console.log(`🥧 数据点: ${chartData.data.length}个分类`);
          }
          if (chartData.indicators) {
            console.log(`🎯 评估维度: ${chartData.indicators.length}个指标`);
          }
          
        } else {
          console.log('❌ 未返回图表数据');
          console.log('📝 返回内容:', result.reply?.substring(0, 100) + '...');
        }
      } else {
        console.log('❌ 查询失败:', queryResponse.status);
      }
    }
    
    // 3. 演示文本查询功能
    console.log('\n📝 步骤3: 演示文本查询功能...');
    
    const textDemos = [
      '查询BOE供应商的物料',
      '目前有哪些风险库存？',
      '查询深圳工厂的库存情况',
      '有哪些测试不合格的记录？'
    ];
    
    for (const query of textDemos) {
      console.log(`\n🔍 文本查询: "${query}"`);
      
      const response = await fetch('http://localhost:3002/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.reply) {
          console.log('✅ 文本查询成功');
          console.log('📋 回复长度:', result.reply.length);
          console.log('📝 回复预览:', result.reply.substring(0, 150) + '...');
        } else {
          console.log('❓ 未知响应格式');
        }
      } else {
        console.log('❌ 查询失败');
      }
    }
    
    console.log('\n🎉 演示完成！');
    
    // 4. 生成使用指南
    console.log('\n📋 使用指南:');
    console.log('');
    console.log('🎨 图表查询示例:');
    console.log('  - "显示质量趋势分析" → 生成折线图');
    console.log('  - "供应商对比分析" → 生成雷达图');
    console.log('  - "库存状态分布图" → 生成饼图');
    console.log('  - "显示库存趋势" → 生成面积图');
    console.log('  - "对比各工厂表现" → 生成柱状图');
    console.log('');
    console.log('📝 文本查询示例:');
    console.log('  - "查询BOE供应商的物料"');
    console.log('  - "目前有哪些风险库存？"');
    console.log('  - "查询深圳工厂的库存情况"');
    console.log('  - "有哪些测试不合格的记录？"');
    console.log('');
    console.log('🚀 前端测试:');
    console.log('  1. 访问: http://localhost:5173');
    console.log('  2. 进入"智能问答助手"页面');
    console.log('  3. 输入上述查询示例');
    console.log('  4. 观察图表和文本回复效果');
    
  } catch (error) {
    console.error('❌ 演示失败:', error.message);
  }
}

finalChartDemo().catch(console.error);
