/**
 * 检查智能问答页面左侧规则的数据调用实现
 * 基于您的真实数据字段进行验证
 */

// 智能问答页面左侧的实际规则（从AssistantPageAIThreeColumn.vue提取）
const leftPanelRules = {
  // 基础查询规则
  basic: [
    {
      name: '结构件类分析',
      query: '结合库存、测试、生产数据，分析结构件类物料（电池盖、中框等）的整体质量状况和风险分布',
      expectedDataSources: ['inventory', 'inspection', 'production'],
      expectedMaterials: ['电池盖', '中框']
    },
    {
      name: '供应商综合评估',
      query: '整合聚龙、BOE、歌尔等供应商在不同物料类别、工厂、项目中的表现数据',
      expectedDataSources: ['inventory', 'inspection', 'production'],
      expectedSuppliers: ['聚龙', 'BOE', '歌尔']
    },
    {
      name: '项目质量追踪',
      query: '基于项目-基线关系，追踪X6827(I6789)、KI5K(I6788)等项目的物料质量链路',
      expectedDataSources: ['inventory', 'inspection', 'production'],
      expectedProjects: ['X6827', 'KI5K']
    },
    {
      name: '工厂效率分析',
      query: '结合工厂-仓库映射关系，分析深圳工厂等的库存流转和生产效率',
      expectedDataSources: ['inventory', 'production'],
      expectedFactories: ['深圳工厂']
    },
    {
      name: '风险预警系统',
      query: '整合风险等级、质量阈值、异常批次等多维度数据，生成综合风险预警',
      expectedDataSources: ['inventory', 'inspection', 'production'],
      expectedStatuses: ['风险', '异常']
    },
    {
      name: '质量链路追踪',
      query: '跨表追踪物料从库存→测试→生产的完整质量链路和问题根因',
      expectedDataSources: ['inventory', 'inspection', 'production'],
      expectedFlow: ['库存', '测试', '生产']
    }
  ],

  // 高级分析规则
  advanced: [
    {
      name: '多维关联分析',
      query: '基于物料分类、供应商映射、项目基线、工厂仓库等多个业务规则，进行深度关联分析',
      expectedDataSources: ['inventory', 'inspection', 'production'],
      expectedDimensions: ['物料分类', '供应商', '工厂']
    },
    {
      name: '业务规则验证',
      query: '验证供应商-物料匹配、项目-基线关系、工厂-仓库映射等业务规则的执行情况',
      expectedDataSources: ['inventory', 'inspection', 'production'],
      expectedValidations: ['供应商-物料匹配', '工厂-仓库映射']
    },
    {
      name: '智能预测分析',
      query: '基于历史数据和业务规则，预测质量风险、库存需求、供应商表现等趋势',
      expectedDataSources: ['inventory', 'inspection', 'production'],
      expectedPredictions: ['质量风险', '库存需求']
    },
    {
      name: '问题根因分析',
      query: '当发现质量问题时，跨表追踪从供应商→物料→测试→生产的完整链路，定位根本原因',
      expectedDataSources: ['inventory', 'inspection', 'production'],
      expectedChain: ['供应商', '物料', '测试', '生产']
    }
  ],

  // 图表规则
  charts: [
    {
      name: '结构件类质量分析',
      query: '综合分析结构件类物料（电池盖、中框、手机卡托等）的库存-测试-生产全链路质量状况',
      expectedDataSources: ['inventory', 'inspection', 'production'],
      expectedMaterials: ['电池盖', '中框', '手机卡托']
    },
    {
      name: '光学类风险评估',
      query: '综合分析光学类物料（LCD显示屏、OLED显示屏、摄像头模组）的风险分布和供应商表现',
      expectedDataSources: ['inventory', 'inspection', 'production'],
      expectedMaterials: ['LCD显示屏', 'OLED显示屏', '摄像头模组']
    },
    {
      name: '电子元件类趋势',
      query: '综合分析电子元件类物料的不良率趋势和批次稳定性，结合供应商质量表现',
      expectedDataSources: ['inventory', 'inspection', 'production'],
      expectedCategories: ['电子元件类']
    }
  ]
};

// 检查左侧规则的数据调用实现
async function checkLeftPanelRules() {
  console.log('🔍 检查智能问答页面左侧规则的数据调用实现');
  console.log('=' .repeat(70));
  
  let totalRules = 0;
  let passedRules = 0;
  
  // 检查每个类别的规则
  for (const [category, rules] of Object.entries(leftPanelRules)) {
    console.log(`\n📋 检查 ${category.toUpperCase()} 类别规则 (${rules.length} 条)`);
    console.log('-' .repeat(50));
    
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      totalRules++;
      
      console.log(`\n🧪 测试规则 ${i + 1}: ${rule.name}`);
      console.log(`   查询: "${rule.query}"`);
      console.log(`   期望数据源: ${rule.expectedDataSources.join(', ')}`);
      
      try {
        // 发送查询请求
        const response = await fetch('http://localhost:3001/api/assistant/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: rule.query })
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // 检查服务来源
          const isIntelligentService = data.source === 'intelligent-intent';
          
          // 检查响应内容
          const hasValidResponse = data.reply && data.reply.length > 100;
          
          // 检查是否包含您的真实数据
          const hasRealData = checkForRealData(data.reply, rule);
          
          // 检查数据完整性
          const hasCompleteData = checkDataCompleteness(data.reply, rule);
          
          if (isIntelligentService && hasValidResponse && hasRealData && hasCompleteData) {
            console.log('   ✅ 规则测试通过');
            console.log(`   服务: ${data.source} ✅`);
            console.log(`   响应: 有效内容 ✅`);
            console.log(`   数据: 包含真实数据 ✅`);
            console.log(`   完整性: 数据完整 ✅`);
            passedRules++;
          } else {
            console.log('   ❌ 规则测试失败');
            console.log(`   服务: ${data.source} ${isIntelligentService ? '✅' : '❌'}`);
            console.log(`   响应: ${hasValidResponse ? '有效内容 ✅' : '内容不足 ❌'}`);
            console.log(`   数据: ${hasRealData ? '真实数据 ✅' : '缺少真实数据 ❌'}`);
            console.log(`   完整性: ${hasCompleteData ? '数据完整 ✅' : '数据不完整 ❌'}`);
            
            // 显示响应预览用于调试
            if (data.reply) {
              const preview = data.reply.substring(0, 300) + (data.reply.length > 300 ? '...' : '');
              console.log(`   响应预览: ${preview}`);
            }
          }
        } else {
          console.log('   ❌ 请求失败');
          console.log(`   HTTP状态: ${response.status}`);
        }
        
      } catch (error) {
        console.log('   ❌ 测试异常:', error.message);
      }
    }
  }
  
  // 输出总结
  console.log('\n📊 左侧规则检查总结');
  console.log('=' .repeat(70));
  console.log(`总规则数: ${totalRules}`);
  console.log(`通过规则: ${passedRules}`);
  console.log(`失败规则: ${totalRules - passedRules}`);
  console.log(`通过率: ${Math.round(passedRules / totalRules * 100)}%`);
  
  if (passedRules < totalRules) {
    console.log('\n🔧 需要优化的方面:');
    console.log('1. 确保数据库规则覆盖所有左侧规则场景');
    console.log('2. 优化触发词匹配复杂查询语句');
    console.log('3. 增强跨表数据关联查询能力');
    console.log('4. 完善综合分析和预测功能');
  } else {
    console.log('\n🎉 所有左侧规则都已正确实现数据调用！');
  }
  
  return passedRules === totalRules;
}

// 检查响应是否包含真实数据
function checkForRealData(reply, rule) {
  if (!reply) return false;
  
  // 检查供应商名称
  const realSuppliers = ['聚龙', '欣冠', '广正', 'BOE', '三星电子'];
  const hasSuppliers = realSuppliers.some(supplier => reply.includes(supplier));
  
  // 检查工厂名称
  const realFactories = ['深圳工厂', '重庆工厂', '南昌工厂', '宜宾工厂'];
  const hasFactories = realFactories.some(factory => reply.includes(factory));
  
  // 检查物料名称
  const realMaterials = ['电池盖', 'OLED显示屏', '电容器', '电阻器', '芯片'];
  const hasMaterials = realMaterials.some(material => reply.includes(material));
  
  // 检查状态
  const realStatuses = ['正常', '风险', '冻结', 'PASS', 'FAIL'];
  const hasStatuses = realStatuses.some(status => reply.includes(status));
  
  return hasSuppliers || hasFactories || hasMaterials || hasStatuses;
}

// 检查数据完整性
function checkDataCompleteness(reply, rule) {
  if (!reply) return false;
  
  // 检查是否包含数量信息
  const hasQuantity = /\d+/.test(reply);
  
  // 检查是否包含结构化信息
  const hasStructure = reply.includes('📊') || reply.includes('•') || reply.includes('-');
  
  // 检查响应长度（综合查询应该有较长的响应）
  const hasAdequateLength = reply.length > 200;
  
  return hasQuantity && hasStructure && hasAdequateLength;
}

// 执行检查
checkLeftPanelRules();
