/**
 * 优化规则触发词，提高匹配准确率
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 优化的触发词映射
const OPTIMIZED_TRIGGERS = {
  '物料名称库存查询': ['电池', '电池盖', '中框', '显示屏', '摄像头', '喇叭', '听筒', '物料名称'],
  '库存状态查询': ['正常库存', '冻结库存', '风险库存', '状态', '正常状态', '冻结状态'],
  '物料上线跟踪查询': ['上线', '上线跟踪', '生产', '产线', '物料上线', '上线情况'],
  '异常物料上线查询': ['异常', '本周异常', '异常物料', '有异常', '异常上线'],
  '充电类物料查询': ['充电', '电池', '充电器', '充电类'],
  '声学类物料查询': ['声学', '喇叭', '听筒', '声学类'],
  '聚龙供应商查询': ['聚龙', '聚龙供应商'],
  '天马供应商查询': ['天马', '天马供应商'],
  '供应商对比分析': ['供应商对比', '供应商分析', '质量对比', '供应商质量', '对比各供应商', '质量表现'],
  '批次综合信息查询': ['批次', '批次信息', '批次查询', '批号', '批次综合']
};

async function optimizeRulesTriggers() {
  let connection;
  
  try {
    console.log('🔧 开始优化规则触发词...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    let updateCount = 0;
    
    for (const [ruleName, newTriggers] of Object.entries(OPTIMIZED_TRIGGERS)) {
      try {
        const [result] = await connection.execute(
          'UPDATE nlp_intent_rules SET trigger_words = ? WHERE intent_name = ?',
          [JSON.stringify(newTriggers), ruleName]
        );
        
        if (result.affectedRows > 0) {
          console.log(`✅ 更新规则: ${ruleName}`);
          console.log(`   新触发词: [${newTriggers.join(', ')}]`);
          updateCount++;
        } else {
          console.log(`❌ 规则不存在: ${ruleName}`);
        }
      } catch (error) {
        console.log(`❌ 更新失败 ${ruleName}: ${error.message}`);
      }
    }
    
    console.log(`\n🎉 触发词优化完成! 更新了 ${updateCount} 条规则`);
    
    // 验证更新结果
    console.log('\n🔍 验证更新结果...');
    const [rules] = await connection.execute(`
      SELECT intent_name, trigger_words 
      FROM nlp_intent_rules 
      WHERE intent_name IN (${Object.keys(OPTIMIZED_TRIGGERS).map(() => '?').join(',')})
    `, Object.keys(OPTIMIZED_TRIGGERS));
    
    rules.forEach(rule => {
      console.log(`${rule.intent_name}: [${rule.trigger_words.join(', ')}]`);
    });
    
  } catch (error) {
    console.error('❌ 优化失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

optimizeRulesTriggers().catch(console.error);
