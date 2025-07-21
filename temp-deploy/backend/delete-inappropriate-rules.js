import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 不符合IQE业务场景的规则（库存管理类）
const INAPPROPRIATE_RULES = [
  '今日入库物料',
  '低库存预警', 
  '供应商库存查询',
  '工厂库存查询',
  '库存状态查询',
  '批次库存信息查询',
  '本周入库统计',
  '正常物料查询',
  '物料大类别库存风险分析',
  '物料库存信息查询',
  '物料库存查询',
  '风险库存查询',
  '风险物料查询',
  '高库存查询'
];

// 重复规则（保留功能最全面的一条，删除其他）
const DUPLICATE_RULES_TO_DELETE = [
  // 物料查询类 - 保留"物料相关查询"（功能最全面）
  '物料库存信息查询',
  '物料系列查询',
  
  // 供应商查询类 - 保留"供应商物料查询"（最全面）
  '供应商库存查询',
  '供应商测试情况查询', 
  '供应商上线情况查询',
  
  // 批次查询类 - 保留"批次信息查询"（整合所有信息）
  '批次库存信息查询',
  '批次测试情况查询',
  '批次上线情况查询',
  '批次质量追踪',
  
  // 在线跟踪类 - 保留"在线跟踪查询"（最详细）
  '在线跟踪相关查询',
  '物料上线情况查询',
  
  // 测试结果类 - 保留"NG测试结果查询"（最核心）
  '测试NG情况查询',
  '今日测试结果',
  '测试通过率统计',
  
  // 物料分类查询 - 保留"充电类物料查询"作为模板，删除其他分类
  '光学类物料查询',
  '包材类物料查询', 
  '声学类物料查询',
  '结构件类物料查询'
];

async function deleteInappropriateRules() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🗑️  开始删除不合理和重复的规则...\n');
    
    // 获取当前规则总数
    const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM nlp_intent_rules');
    const totalBefore = countResult[0].total;
    console.log(`📊 删除前总规则数: ${totalBefore}条\n`);
    
    let deletedCount = 0;
    
    // 1. 删除不符合IQE业务场景的规则
    console.log('1️⃣ 删除不符合IQE业务场景的规则:');
    for (const ruleName of INAPPROPRIATE_RULES) {
      try {
        const [result] = await connection.execute(
          'DELETE FROM nlp_intent_rules WHERE intent_name = ?',
          [ruleName]
        );
        
        if (result.affectedRows > 0) {
          console.log(`   ✅ 已删除: ${ruleName}`);
          deletedCount++;
        } else {
          console.log(`   ⚠️  未找到: ${ruleName}`);
        }
      } catch (error) {
        console.log(`   ❌ 删除失败: ${ruleName} - ${error.message}`);
      }
    }
    
    console.log(`\n   小计: 删除了 ${deletedCount} 条不合理规则\n`);
    
    // 2. 删除重复规则
    console.log('2️⃣ 删除重复规则:');
    let duplicateDeleted = 0;
    
    for (const ruleName of DUPLICATE_RULES_TO_DELETE) {
      try {
        const [result] = await connection.execute(
          'DELETE FROM nlp_intent_rules WHERE intent_name = ?',
          [ruleName]
        );
        
        if (result.affectedRows > 0) {
          console.log(`   ✅ 已删除: ${ruleName}`);
          duplicateDeleted++;
        } else {
          console.log(`   ⚠️  未找到: ${ruleName}`);
        }
      } catch (error) {
        console.log(`   ❌ 删除失败: ${ruleName} - ${error.message}`);
      }
    }
    
    console.log(`\n   小计: 删除了 ${duplicateDeleted} 条重复规则\n`);
    
    // 3. 统计删除后的结果
    const [countAfter] = await connection.execute('SELECT COUNT(*) as total FROM nlp_intent_rules');
    const totalAfter = countAfter[0].total;
    
    console.log('📈 删除结果统计:');
    console.log(`   删除前总数: ${totalBefore}条`);
    console.log(`   不合理规则删除: ${deletedCount}条`);
    console.log(`   重复规则删除: ${duplicateDeleted}条`);
    console.log(`   总删除数: ${deletedCount + duplicateDeleted}条`);
    console.log(`   删除后剩余: ${totalAfter}条`);
    console.log(`   删除率: ${(((deletedCount + duplicateDeleted) / totalBefore) * 100).toFixed(1)}%`);
    
    // 4. 显示剩余规则
    console.log('\n📋 剩余规则列表:');
    const [remainingRules] = await connection.execute(
      'SELECT intent_name, description FROM nlp_intent_rules ORDER BY intent_name'
    );
    
    remainingRules.forEach((rule, index) => {
      console.log(`   ${index + 1}. ${rule.intent_name}: ${rule.description}`);
    });
    
    console.log('\n🎉 规则清理完成！');
    console.log('现在规则库更加精简，专注于IQE质量检验的核心业务场景。');
    
  } catch (error) {
    console.error('❌ 删除操作失败:', error);
  } finally {
    await connection.end();
  }
}

deleteInappropriateRules();
