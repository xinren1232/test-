/**
 * 重新初始化智能意图服务
 * 加载更新后的测试结果查询规则
 */

import IntelligentIntentService from './src/services/intelligentIntentService.js';
import { getActiveIntentRules } from './src/scripts/initIntentRules.js';

async function reinitializeIntentService() {
  console.log('🔄 重新初始化智能意图服务...');

  try {
    // 1. 检查更新后的规则
    console.log('\n1. 检查更新后的规则...');
    const rules = await getActiveIntentRules();
    console.log(`📋 加载了 ${rules.length} 条规则`);
    
    // 查找测试相关规则
    const testRules = rules.filter(rule => 
      rule.intent_name.includes('测试') || 
      rule.intent_name.includes('test') ||
      rule.trigger_words.some(word => word.includes('测试') || word.includes('检测'))
    );
    
    console.log('\n📊 测试相关规则:');
    testRules.forEach(rule => {
      console.log(`- ${rule.intent_name}: ${rule.description}`);
      console.log(`  触发词: ${rule.trigger_words.join(', ')}`);
      console.log(`  优先级: ${rule.priority}`);
      console.log('');
    });

    // 2. 创建新的智能意图服务实例
    console.log('2. 创建新的智能意图服务实例...');
    const intentService = new IntelligentIntentService();
    
    // 3. 强制重新初始化
    console.log('3. 强制重新初始化服务...');
    intentService.initialized = false; // 强制重新初始化
    await intentService.initialize();
    
    console.log('✅ 智能意图服务重新初始化完成');

    // 4. 测试更新后的规则
    console.log('\n4. 测试更新后的规则...');
    
    const testQueries = [
      '查询测试结果',
      '测试结果',
      '检测结果'
    ];

    for (const query of testQueries) {
      console.log(`\n🔍 测试查询: "${query}"`);
      
      try {
        const result = await intentService.processQuery(query);
        
        if (result && result.success) {
          console.log(`✅ 查询成功`);
          console.log(`📊 匹配规则: ${result.intent || result.matchedRule}`);
          console.log(`📄 返回数据: ${result.data ? result.data.length : 0} 条记录`);
          
          // 检查返回的数据结构
          if (result.data && result.data.length > 0) {
            const firstRecord = result.data[0];
            console.log('📋 数据字段:');
            Object.keys(firstRecord).forEach(key => {
              console.log(`  - ${key}: ${firstRecord[key]}`);
            });
            
            // 检查项目和基线字段
            if (firstRecord['项目']) {
              const projectValue = firstRecord['项目'];
              if (projectValue.match(/^[XSK][0-9A-Z]{3,5}$/)) {
                console.log('✅ 项目字段格式正确 (项目代码)');
              } else if (projectValue.startsWith('MAT-')) {
                console.log('⚠️ 项目字段显示物料编码，需要修正');
              } else {
                console.log(`⚠️ 项目字段格式异常: ${projectValue}`);
              }
            }
            
            if (firstRecord['基线']) {
              const baselineValue = firstRecord['基线'];
              if (baselineValue.match(/^I\d{4}$/)) {
                console.log('✅ 基线字段格式正确 (基线代码)');
              } else if (baselineValue.match(/^\d{6}$/)) {
                console.log('⚠️ 基线字段显示批次号，需要修正');
              } else {
                console.log(`⚠️ 基线字段格式异常: ${baselineValue}`);
              }
            }
          }
        } else {
          console.log(`❌ 查询失败: ${result ? result.message : '无结果'}`);
        }
      } catch (error) {
        console.log(`❌ 查询出错: ${error.message}`);
      }
    }

    console.log('\n🎉 重新初始化和测试完成！');
    console.log('\n📋 下一步:');
    console.log('1. 如果项目/基线字段仍显示错误，需要进一步修正SQL查询');
    console.log('2. 重启后端服务以确保更改生效');
    console.log('3. 在前端测试查询功能');

  } catch (error) {
    console.error('❌ 重新初始化失败:', error);
  }
}

// 执行重新初始化
reinitializeIntentService().catch(console.error);
