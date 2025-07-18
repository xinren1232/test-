// 执行场景规则完善
import ScenarioRulesManager from './scenario-rules-manager.js';

async function main() {
  const manager = new ScenarioRulesManager();
  
  try {
    console.log('🚀 开始完善三个场景的规则系统...');
    console.log('📋 场景说明:');
    console.log('  - 库存场景: 物料库存管理相关查询');
    console.log('  - 测试场景: 实验室测试和检验相关查询');
    console.log('  - 上线场景: 生产上线和不良率分析相关查询');
    console.log('');
    
    // 1. 完善场景规则
    const enhanceResult = await manager.enhanceScenarioRules();
    
    if (enhanceResult.success) {
      console.log(`✅ ${enhanceResult.message}`);
    } else {
      console.error(`❌ ${enhanceResult.message}`);
      return;
    }
    
    // 2. 验证规则
    console.log('\n🔍 验证规则完整性...');
    const validateResult = await manager.validateScenarioRules();
    
    if (validateResult.success) {
      console.log(`✅ ${validateResult.message}`);
    } else {
      console.error(`❌ ${validateResult.message}`);
    }
    
    console.log('\n🎉 场景规则系统完善完成！');
    console.log('💡 现在AI助手可以根据用户问题自动识别场景并调取对应的数据');
    
  } catch (error) {
    console.error('❌ 执行失败:', error);
  } finally {
    await manager.disconnect();
  }
}

main().catch(console.error);
