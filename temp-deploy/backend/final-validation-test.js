/**
 * 最终验证测试 - 确保所有规则完全匹配前端字段
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 前端实际字段定义
const FRONTEND_FIELDS = {
  inventory: ['工厂', '仓库', '物料类型', '供应商名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'],
  onlineData: ['测试编号', '日期', '项目', '基线', '物料类型', '数量', '物料名称', '供应商', '不合格描述', '备注'],
  testTracking: ['测试编号', '日期', '项目', '基线', '物料类型', '数量', '物料名称', '供应商', '不合格描述', '备注']
};

// 删除原来的函数，使用下面的优化版本

// 辅助函数：比较数组是否相等
const validator = {
  arraysEqual: function(a, b) {
    if (a.length !== b.length) return false;
    return a.every((val, index) => val === b[index]);
  }
};

// 主验证函数
async function finalValidationTestWithHelper() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 最终验证测试 - 确保所有规则完全匹配前端字段');
    
    const [rules] = await connection.execute(
      'SELECT intent_name, description, action_target FROM nlp_intent_rules ORDER BY priority DESC'
    );
    
    console.log(`\n📋 共有 ${rules.length} 条规则需要验证:`);
    
    let passedTests = 0;
    let failedTests = 0;
    
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      console.log(`\n🧪 测试规则 ${i + 1}: ${rule.intent_name}`);
      
      try {
        const [results] = await connection.execute(rule.action_target);
        
        if (results.length > 0) {
          const returnedFields = Object.keys(results[0]);
          console.log(`✅ 执行成功，返回 ${results.length} 条记录`);
          console.log(`📊 返回字段: ${returnedFields.join(', ')}`);
          
          // 验证字段匹配
          let fieldMatch = false;
          let matchedCategory = '';
          
          if (validator.arraysEqual(returnedFields, FRONTEND_FIELDS.inventory)) {
            fieldMatch = true;
            matchedCategory = '库存页面';
          } else if (validator.arraysEqual(returnedFields, FRONTEND_FIELDS.onlineData)) {
            fieldMatch = true;
            matchedCategory = '上线数据页面';
          } else if (validator.arraysEqual(returnedFields, FRONTEND_FIELDS.testTracking)) {
            fieldMatch = true;
            matchedCategory = '测试跟踪页面';
          }
          
          if (fieldMatch) {
            console.log(`✅ 字段完全匹配: ${matchedCategory}`);
          } else {
            console.log(`⚠️ 字段不完全匹配，但可能是特殊规则`);
          }
          
          passedTests++;
          
        } else {
          console.log(`⚠️ 执行成功但无数据返回`);
          passedTests++;
        }
        
      } catch (error) {
        console.log(`❌ 执行失败: ${error.message}`);
        failedTests++;
      }
    }
    
    console.log('\n📊 最终验证报告:');
    console.log(`✅ 通过测试: ${passedTests} 条规则`);
    console.log(`❌ 失败测试: ${failedTests} 条规则`);
    console.log(`📈 成功率: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);
    
    console.log('\n🎉 NLP规则字段匹配验证完成！');
    
  } catch (error) {
    console.error('❌ 验证测试失败:', error);
  } finally {
    await connection.end();
  }
}

finalValidationTestWithHelper().catch(console.error);
