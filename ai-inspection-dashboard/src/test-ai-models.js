/**
 * AI模型集成测试脚本
 * 用于验证AI模型配置和查询功能
 */

import { AIModelConfigService } from './services/ai/AIModelConfigService';
import { AIInitializer } from './services/ai/AIInitializer';
import { AIQueryService } from './services/AIQueryService';

// 测试函数
async function testAIModels() {
  console.log('=== AI模型测试开始 ===');
  
  // 1. 显示API密钥
  const apiKey = AIModelConfigService.getApiKey();
  console.log(`API密钥: ${apiKey}`);
  
  // 2. 初始化AI服务
  try {
    console.log('初始化AI服务...');
    await AIInitializer.initialize();
    console.log('AI服务初始化成功');
  } catch (error) {
    console.error('AI服务初始化失败:', error);
    return;
  }
  
  // 3. 显示模型配置
  const primaryModel = AIModelConfigService.getPrimaryModel();
  const backupModel = AIModelConfigService.getBackupModel();
  
  console.log('\n=== 模型配置 ===');
  console.log('主要模型:', primaryModel);
  console.log('备用模型:', backupModel);
  
  // 4. 测试模型优先级
  const priority = AIModelConfigService.getModelPriority();
  console.log('\n=== 模型优先级 ===');
  console.log('当前优先级:', priority);
  
  // 5. 获取当前活跃模型
  const activeModel = AIModelConfigService.getActiveModel();
  console.log('\n=== 当前活跃模型 ===');
  console.log('活跃模型:', activeModel);
  
  // 6. 测试查询
  console.log('\n=== 测试查询 ===');
  
  const testQueries = [
    '你好，请介绍一下IQE系统',
    '物料37301062的风险评估',
    '如何提高质量检验效率？',
    '最近的质量趋势是什么？'
  ];
  
  for (const query of testQueries) {
    console.log(`\n查询: "${query}"`);
    try {
      const result = await AIQueryService.executeQuery(query);
      console.log('查询结果:', result);
    } catch (error) {
      console.error('查询失败:', error);
    }
  }
  
  // 7. 切换模型优先级
  console.log('\n=== 切换模型优先级 ===');
  
  // 保存原始优先级
  const originalPriority = [...AIModelConfigService.getModelPriority()];
  
  // 切换优先级
  const newPriority = ['v3', 'r1'];
  AIModelConfigService.updateModelPriority(newPriority);
  console.log('新优先级:', AIModelConfigService.getModelPriority());
  
  // 获取新的活跃模型
  const newActiveModel = AIModelConfigService.getActiveModel();
  console.log('新活跃模型:', newActiveModel);
  
  // 测试查询
  console.log('\n使用新活跃模型查询:');
  try {
    const result = await AIQueryService.executeQuery('使用新模型的测试查询');
    console.log('查询结果:', result);
  } catch (error) {
    console.error('查询失败:', error);
  }
  
  // 恢复原始优先级
  AIModelConfigService.updateModelPriority(originalPriority);
  console.log('\n已恢复原始优先级:', AIModelConfigService.getModelPriority());
  
  console.log('\n=== AI模型测试完成 ===');
}

// 导出测试函数
export default testAIModels; 