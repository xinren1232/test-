/**
 * 修复规则参数格式问题
 * 将 [object Object] 转换为正确的JSON格式
 */

import initializeDatabase from './src/models/index.js';

async function fixRuleParameters() {
  console.log('🔧 开始修复规则参数格式问题...\n');
  
  try {
    const db = await initializeDatabase();
    const NlpIntentRule = db.NlpIntentRule;
    
    // 获取所有规则
    const rules = await NlpIntentRule.findAll();
    console.log(`📋 找到 ${rules.length} 条规则\n`);
    
    let fixedCount = 0;
    
    for (const rule of rules) {
      console.log(`🔍 检查规则: ${rule.intent_name}`);
      
      // 检查参数字段
      let needsUpdate = false;
      let newParameters = null;
      
      if (rule.parameters && typeof rule.parameters === 'object' && rule.parameters.toString() === '[object Object]') {
        console.log('  ❌ 发现参数格式问题，尝试修复...');
        
        // 根据规则名称重新构建参数
        newParameters = buildParametersForRule(rule.intent_name, rule.description);
        needsUpdate = true;
      } else if (!rule.parameters || rule.parameters === 'null' || rule.parameters === '[]') {
        console.log('  ⚠️ 参数为空，尝试补充...');
        
        // 为没有参数的规则添加参数
        newParameters = buildParametersForRule(rule.intent_name, rule.description);
        if (newParameters && newParameters !== '[]') {
          needsUpdate = true;
        }
      }
      
      // 检查示例查询
      let newExampleQuery = rule.example_query;
      if (!rule.example_query || rule.example_query.trim() === '') {
        console.log('  ⚠️ 缺少示例查询，尝试补充...');
        newExampleQuery = buildExampleQueryForRule(rule.intent_name, rule.description);
        needsUpdate = true;
      }
      
      // 更新规则
      if (needsUpdate) {
        const updateData = {};
        if (newParameters !== null) {
          updateData.parameters = newParameters;
        }
        if (newExampleQuery !== rule.example_query) {
          updateData.example_query = newExampleQuery;
        }
        
        await rule.update(updateData);
        console.log('  ✅ 规则已修复');
        fixedCount++;
      } else {
        console.log('  ✅ 规则正常');
      }
    }
    
    console.log(`\n🎉 修复完成！共修复 ${fixedCount} 条规则`);
    
    // 验证修复结果
    console.log('\n🔍 验证修复结果...');
    await verifyFixedRules();
    
  } catch (error) {
    console.log('❌ 修复过程出错:', error.message);
  }
}

function buildParametersForRule(intentName, description) {
  const name = intentName.toLowerCase();
  const desc = (description || '').toLowerCase();
  
  // 基于规则名称和描述构建参数
  const parameters = [];
  
  // 工厂相关参数
  if (name.includes('工厂') || desc.includes('工厂')) {
    parameters.push({
      name: 'factory',
      type: 'string',
      required: false,
      extract_from: ['深圳工厂', '重庆工厂', '南昌工厂', '宜宾工厂', '深圳', '重庆', '南昌', '宜宾'],
      mapping: {
        '深圳': '深圳工厂',
        '重庆': '重庆工厂', 
        '南昌': '南昌工厂',
        '宜宾': '宜宾工厂'
      }
    });
  }
  
  // 供应商相关参数
  if (name.includes('供应商') || desc.includes('供应商')) {
    parameters.push({
      name: 'supplier',
      type: 'string',
      required: false,
      extract_from: ['泰科电子', '三星电子', '歌尔', '富士康', '比亚迪', '华为', '小米']
    });
  }
  
  // 物料相关参数
  if (name.includes('物料') || desc.includes('物料')) {
    parameters.push({
      name: 'material',
      type: 'string',
      required: false,
      extract_from: ['电阻器', '电容器', '电池', '芯片', '连接器', '传感器']
    });
  }
  
  // 状态相关参数
  if (name.includes('状态') || desc.includes('状态')) {
    parameters.push({
      name: 'status',
      type: 'string',
      required: false,
      extract_from: ['正常', '风险', '冻结', '异常']
    });
  }
  
  // 批次相关参数
  if (name.includes('批次') || desc.includes('批次')) {
    parameters.push({
      name: 'batchNo',
      type: 'string',
      required: false,
      extract_pattern: '[A-Z]{2}\\d{7}|[A-Z0-9]{6,}'
    });
  }
  
  // 测试结果相关参数
  if (name.includes('测试') || desc.includes('测试')) {
    parameters.push({
      name: 'testResult',
      type: 'string',
      required: false,
      extract_from: ['PASS', 'FAIL', '合格', '不合格', 'OK', 'NG', 'PENDING']
    });
  }
  
  return parameters.length > 0 ? JSON.stringify(parameters) : '[]';
}

function buildExampleQueryForRule(intentName, description) {
  const name = intentName.toLowerCase();
  
  // 基于规则名称生成示例查询
  if (name.includes('工厂') && name.includes('库存')) {
    return '查询深圳工厂的库存情况';
  } else if (name.includes('供应商') && name.includes('库存')) {
    return '查询泰科电子供应商的物料';
  } else if (name.includes('物料') && name.includes('库存')) {
    return '查询电阻器的库存情况';
  } else if (name.includes('批次') && name.includes('状态')) {
    return '查询批次状态信息';
  } else if (name.includes('测试') && name.includes('结果')) {
    return '查询测试结果为PASS的记录';
  } else if (name.includes('生产') && name.includes('效率')) {
    return '分析深圳工厂的生产效率';
  } else if (name.includes('缺陷') || name.includes('不良')) {
    return '查询缺陷分析报告';
  } else if (name.includes('统计')) {
    return '统计相关数据';
  } else {
    return `${intentName}查询示例`;
  }
}

async function verifyFixedRules() {
  try {
    const db = await initializeDatabase();
    const NlpIntentRule = db.NlpIntentRule;
    
    const rules = await NlpIntentRule.findAll({ limit: 5 });
    
    console.log('📋 验证前5条规则:');
    rules.forEach((rule, index) => {
      console.log(`${index + 1}. ${rule.intent_name}`);
      console.log(`   参数: ${rule.parameters}`);
      console.log(`   参数类型: ${typeof rule.parameters}`);
      console.log(`   示例查询: ${rule.example_query}`);
      console.log('');
    });
    
  } catch (error) {
    console.log('❌ 验证失败:', error.message);
  }
}

// 执行修复
fixRuleParameters();
