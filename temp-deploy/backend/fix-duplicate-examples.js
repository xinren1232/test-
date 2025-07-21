import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixDuplicateExamples() {
  console.log('🔧 修复重复的示例查询...');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 查找重复的示例查询
    console.log('🔍 查找重复的示例查询...');
    const [duplicates] = await connection.execute(`
      SELECT example_query, COUNT(*) as count, GROUP_CONCAT(intent_name) as rules
      FROM nlp_intent_rules 
      GROUP BY example_query 
      HAVING count > 1
    `);
    
    console.log(`发现 ${duplicates.length} 个重复的示例查询:`);
    duplicates.forEach(dup => {
      console.log(`  "${dup.example_query}" - 被 ${dup.count} 个规则使用: ${dup.rules}`);
    });
    
    // 2. 为每个规则生成唯一的示例查询
    console.log('\n🔧 为规则生成唯一的示例查询...');
    
    const ruleUpdates = [
      {
        intent_name: '供应商物料查询',
        new_example: '查询BOE供应商的所有物料'
      },
      {
        intent_name: '物料大类查询', 
        new_example: '查询结构件类物料统计'
      },
      {
        intent_name: '项目物料不良查询',
        new_example: '查询KI4K项目的物料不良情况'
      },
      {
        intent_name: '基线物料不良查询',
        new_example: '查询I6788基线的物料不良情况'
      },
      {
        intent_name: '物料测试情况查询',
        new_example: '查询LCD显示屏的测试结果'
      },
      {
        intent_name: '项目测试情况查询',
        new_example: '查询KI4K项目的测试统计'
      },
      {
        intent_name: '基线测试情况查询',
        new_example: '查询I6788基线的测试统计'
      },
      {
        intent_name: '批次信息查询',
        new_example: '查询批次114962的详细信息'
      },
      {
        intent_name: '物料上线Top不良',
        new_example: '查询上线不良率最高的物料排行'
      },
      {
        intent_name: '物料测试Top不良',
        new_example: '查询测试失败率最高的物料排行'
      }
    ];
    
    // 3. 更新规则的示例查询
    for (const update of ruleUpdates) {
      await connection.execute(
        'UPDATE nlp_intent_rules SET example_query = ? WHERE intent_name = ?',
        [update.new_example, update.intent_name]
      );
      console.log(`✅ 更新规则 "${update.intent_name}" 的示例查询为: "${update.new_example}"`);
    }
    
    // 4. 验证修复结果
    console.log('\n🔍 验证修复结果...');
    const [afterFix] = await connection.execute(`
      SELECT example_query, COUNT(*) as count
      FROM nlp_intent_rules 
      GROUP BY example_query 
      HAVING count > 1
    `);
    
    if (afterFix.length === 0) {
      console.log('✅ 所有重复的示例查询已修复！');
    } else {
      console.log('⚠️ 仍有重复的示例查询:');
      afterFix.forEach(dup => {
        console.log(`  "${dup.example_query}" - ${dup.count} 个规则使用`);
      });
    }
    
    await connection.end();
    console.log('\n🎉 示例查询修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

fixDuplicateExamples();
