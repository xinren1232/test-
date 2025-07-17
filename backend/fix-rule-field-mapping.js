import mysql from 'mysql2/promise';

async function fixRuleFieldMapping() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });
  
  try {
    console.log('=== 修复规则字段映射问题 ===\n');
    
    // 1. 首先检查是否已经有result_fields字段
    const [columns] = await connection.execute("SHOW COLUMNS FROM nlp_intent_rules LIKE 'result_fields'");
    
    if (columns.length === 0) {
      console.log('1. 添加result_fields字段到nlp_intent_rules表...');
      await connection.execute(`
        ALTER TABLE nlp_intent_rules 
        ADD COLUMN result_fields JSON NULL COMMENT '查询结果字段映射'
      `);
      console.log('✅ result_fields字段添加成功');
    } else {
      console.log('✅ result_fields字段已存在');
    }
    
    // 2. 获取所有规则
    const [rules] = await connection.execute(`
      SELECT id, intent_name, action_type, action_target, category
      FROM nlp_intent_rules 
      WHERE action_type = 'SQL_QUERY'
      ORDER BY id
    `);
    
    console.log(`\n2. 找到 ${rules.length} 条SQL查询规则需要设置字段映射\n`);
    
    // 3. 为每个规则设置正确的字段映射
    for (const rule of rules) {
      console.log(`处理规则: ${rule.intent_name}`);
      
      let resultFields = [];
      
      // 根据规则类型和SQL内容确定字段映射
      if (rule.intent_name.includes('inventory') || rule.intent_name.includes('库存')) {
        resultFields = [
          '工厂', '仓库', '物料编码', '物料名称', '供应商', 
          '数量', '状态', '入库时间', '到期时间', '备注'
        ];
      } else if (rule.intent_name.includes('testing') || rule.intent_name.includes('test') || rule.intent_name.includes('测试')) {
        resultFields = [
          '测试编号', '日期', '项目', '基线', '物料编码', '数量', 
          '物料名称', '供应商', '测试结果', '不合格描述', '备注'
        ];
      } else if (rule.intent_name.includes('production') || rule.intent_name.includes('online') || rule.intent_name.includes('上线')) {
        resultFields = [
          '工厂', '基线', '项目', '物料编码', '物料名称', '供应商', 
          '批次号', '不良率', '不良现象', '检验日期', '备注'
        ];
      } else if (rule.intent_name.includes('batch') || rule.intent_name.includes('批次')) {
        resultFields = [
          '批次号', '物料编码', '物料名称', '供应商', '数量', 
          '入库日期', '产线异常', '测试异常', '备注'
        ];
      } else {
        // 默认字段，根据SQL内容推断
        if (rule.action_target.includes('inventory')) {
          resultFields = [
            '工厂', '仓库', '物料编码', '物料名称', '供应商', 
            '数量', '状态', '入库时间', '到期时间', '备注'
          ];
        } else if (rule.action_target.includes('lab_tests')) {
          resultFields = [
            '测试编号', '日期', '项目', '基线', '物料编码', '数量', 
            '物料名称', '供应商', '测试结果', '不合格描述', '备注'
          ];
        } else if (rule.action_target.includes('online_tracking')) {
          resultFields = [
            '工厂', '基线', '项目', '物料编码', '物料名称', '供应商', 
            '批次号', '不良率', '不良现象', '检验日期', '备注'
          ];
        } else {
          // 通用字段
          resultFields = [
            '工厂', '物料编码', '物料名称', '供应商', '数量', '状态', '备注'
          ];
        }
      }
      
      // 更新规则的result_fields
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET result_fields = ? 
        WHERE id = ?
      `, [JSON.stringify(resultFields), rule.id]);
      
      console.log(`  ✅ 设置字段: ${resultFields.join(', ')}`);
    }
    
    // 4. 验证修复结果
    console.log('\n3. 验证修复结果...');
    const [updatedRules] = await connection.execute(`
      SELECT id, intent_name, result_fields 
      FROM nlp_intent_rules 
      WHERE action_type = 'SQL_QUERY'
      ORDER BY id
    `);
    
    let fixedCount = 0;
    updatedRules.forEach(rule => {
      if (rule.result_fields && rule.result_fields !== '[]') {
        fixedCount++;
        const fields = JSON.parse(rule.result_fields);
        console.log(`✅ ${rule.intent_name}: ${fields.length} 个字段`);
      } else {
        console.log(`❌ ${rule.intent_name}: 字段映射仍为空`);
      }
    });
    
    console.log(`\n=== 修复完成 ===`);
    console.log(`总规则数: ${updatedRules.length}`);
    console.log(`已修复: ${fixedCount}`);
    console.log(`未修复: ${updatedRules.length - fixedCount}`);
    
  } catch (error) {
    console.error('修复过程中出错:', error);
  } finally {
    await connection.end();
  }
}

fixRuleFieldMapping().catch(console.error);
