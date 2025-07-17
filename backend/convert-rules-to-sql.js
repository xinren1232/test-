import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

/**
 * 将memory_query规则转换为SQL_QUERY规则
 */
async function convertRulesToSQL() {
  try {
    console.log('🔧 开始将规则转换为SQL查询...');
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 获取所有memory_query规则
    console.log('\n1. 获取所有memory_query规则:');
    const [rules] = await connection.execute(`
      SELECT id, intent_name, action_type, action_target, description, example_query
      FROM nlp_intent_rules 
      WHERE action_type = 'memory_query'
      ORDER BY id
    `);
    
    console.log(`找到 ${rules.length} 条memory_query规则`);
    
    // 2. 定义SQL模板
    const sqlTemplates = {
      // 库存相关SQL模板
      'inventory': {
        basic: `SELECT 
          factory as 工厂,
          warehouse as 仓库,
          materialCode as 物料编码,
          materialName as 物料名称,
          supplier as 供应商,
          quantity as 数量,
          status as 状态,
          inboundTime as 入库时间,
          expiryDate as 到期时间,
          notes as 备注
        FROM inventory
        ORDER BY inboundTime DESC
        LIMIT 20`,
        
        filtered: `SELECT 
          factory as 工厂,
          warehouse as 仓库,
          materialCode as 物料编码,
          materialName as 物料名称,
          supplier as 供应商,
          quantity as 数量,
          status as 状态,
          inboundTime as 入库时间,
          expiryDate as 到期时间,
          notes as 备注
        FROM inventory
        WHERE {condition}
        ORDER BY inboundTime DESC
        LIMIT 20`
      },
      
      // 测试相关SQL模板
      'inspection': {
        basic: `SELECT 
          test_id as 测试编号,
          test_date as 日期,
          project_id as 项目,
          baseline_id as 基线,
          materialCode as 物料编码,
          quantity as 数量,
          materialName as 物料名称,
          supplier as 供应商,
          test_result as 测试结果,
          defect_desc as 不合格描述,
          notes as 备注
        FROM lab_tests
        ORDER BY test_date DESC
        LIMIT 20`,
        
        ng_only: `SELECT 
          test_id as 测试编号,
          test_date as 日期,
          project_id as 项目,
          baseline_id as 基线,
          materialCode as 物料编码,
          quantity as 数量,
          materialName as 物料名称,
          supplier as 供应商,
          test_result as 测试结果,
          defect_desc as 不合格描述,
          notes as 备注
        FROM lab_tests
        WHERE test_result IN ('NG', 'FAIL', '不合格')
        ORDER BY test_date DESC
        LIMIT 20`,
        
        ok_only: `SELECT 
          test_id as 测试编号,
          test_date as 日期,
          project_id as 项目,
          baseline_id as 基线,
          materialCode as 物料编码,
          quantity as 数量,
          materialName as 物料名称,
          supplier as 供应商,
          test_result as 测试结果,
          defect_desc as 不合格描述,
          notes as 备注
        FROM lab_tests
        WHERE test_result IN ('OK', 'PASS', '合格')
        ORDER BY test_date DESC
        LIMIT 20`
      },
      
      // 上线相关SQL模板
      'production': {
        basic: `SELECT 
          factory as 工厂,
          baseline_id as 基线,
          project_id as 项目,
          materialCode as 物料编码,
          materialName as 物料名称,
          supplier as 供应商,
          batchNo as 批次号,
          defectRate as 不良率,
          exception_count as 本周异常,
          inspectionDate as 检验日期,
          notes as 备注
        FROM online_tracking
        ORDER BY inspectionDate DESC
        LIMIT 20`
      }
    };
    
    // 3. 转换规则
    console.log('\n2. 转换规则为SQL查询:');
    let convertedCount = 0;
    
    for (const rule of rules) {
      const dataSource = rule.action_target;
      const ruleName = rule.intent_name.toLowerCase();
      
      let sql = '';
      
      // 根据数据源和规则名称选择SQL模板
      if (dataSource === 'inventory') {
        if (ruleName.includes('物料') && (ruleName.includes('查询') || ruleName.includes('大类'))) {
          sql = sqlTemplates.inventory.filtered.replace('{condition}', "materialName IN ('中框', '侧键', '手机卡托', '电池盖', '装饰件')");
        } else {
          sql = sqlTemplates.inventory.basic;
        }
      } else if (dataSource === 'inspection') {
        if (ruleName.includes('ng') || ruleName.includes('不合格') || ruleName.includes('失败')) {
          sql = sqlTemplates.inspection.ng_only;
        } else if (ruleName.includes('ok') || ruleName.includes('合格') || ruleName.includes('通过')) {
          sql = sqlTemplates.inspection.ok_only;
        } else {
          sql = sqlTemplates.inspection.basic;
        }
      } else if (dataSource === 'production') {
        sql = sqlTemplates.production.basic;
      }
      
      if (sql) {
        // 更新规则
        await connection.execute(`
          UPDATE nlp_intent_rules 
          SET 
            action_type = 'SQL_QUERY',
            action_target = ?
          WHERE id = ?
        `, [sql, rule.id]);
        
        console.log(`✅ 已转换规则: ${rule.intent_name}`);
        convertedCount++;
      } else {
        console.log(`⚠️ 无法转换规则: ${rule.intent_name} (数据源: ${dataSource})`);
      }
    }
    
    console.log(`\n🎉 成功转换 ${convertedCount} 条规则!`);
    
    // 4. 验证转换结果
    console.log('\n3. 验证转换结果:');
    const [updatedRules] = await connection.execute(`
      SELECT action_type, COUNT(*) as count
      FROM nlp_intent_rules 
      GROUP BY action_type
      ORDER BY count DESC
    `);
    
    console.log('转换后的规则类型统计:');
    updatedRules.forEach(stat => {
      console.log(`- ${stat.action_type}: ${stat.count}条`);
    });
    
    // 5. 显示一些转换后的SQL示例
    console.log('\n4. 转换后的SQL示例:');
    const [sampleRules] = await connection.execute(`
      SELECT intent_name, action_target
      FROM nlp_intent_rules 
      WHERE action_type = 'SQL_QUERY'
      LIMIT 3
    `);
    
    sampleRules.forEach(rule => {
      console.log(`\n规则: ${rule.intent_name}`);
      console.log(`SQL: ${rule.action_target.substring(0, 200)}...`);
    });
    
    await connection.end();
    console.log('\n✅ 规则转换完成!');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  }
}

convertRulesToSQL();
