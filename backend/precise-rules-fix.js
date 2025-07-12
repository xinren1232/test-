import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 基于实际表结构的字段映射
const ACTUAL_FIELD_MAPPING = {
  inventory: {
    // 实际存在的字段
    'batch_code': 'batch_code',
    'material_code': 'material_code', 
    'material_name': 'material_name',
    'material_type': 'material_type',
    'supplier_name': 'supplier_name',
    'quantity': 'quantity',
    'storage_location': 'storage_location',
    'status': 'status',
    'inbound_time': 'inbound_time',
    'notes': 'notes'
  },
  online_tracking: {
    'batch_code': 'batch_code',
    'material_code': 'material_code',
    'material_name': 'material_name', 
    'supplier_name': 'supplier_name',
    'factory': 'factory',
    'workshop': 'workshop',
    'line': 'line',
    'project': 'project',
    'exception_count': 'exception_count',
    'operator': 'operator',
    'online_date': 'online_date',
    'defect_rate': 'defect_rate'
  },
  lab_tests: {
    'test_id': 'test_id',
    'batch_code': 'batch_code',
    'material_code': 'material_code',
    'material_name': 'material_name',
    'supplier_name': 'supplier_name',
    'project_id': 'project_id',
    'baseline_id': 'baseline_id',
    'test_date': 'test_date',
    'test_result': 'test_result',
    'defect_desc': 'defect_desc',
    'conclusion': 'conclusion'
  }
};

// 前端显示字段映射（基于实际前端页面）
const FRONTEND_DISPLAY_MAPPING = {
  inventory: {
    'storage_location': '工厂',
    'storage_location': '仓库', // 可能需要拆分
    'material_type': '物料类型',
    'supplier_name': '供应商名称',
    'supplier_name': '供应商',
    'quantity': '数量',
    'status': '状态',
    'inbound_time': '入库时间',
    'notes': '备注'
  },
  online_tracking: {
    'id': '测试编号',
    'online_date': '日期',
    'project': '项目',
    'baseline_id': '基线', // 需要添加字段
    'material_type': '物料类型', // 需要添加字段
    'quantity': '数量', // 需要添加字段
    'material_name': '物料名称',
    'supplier_name': '供应商',
    'notes': '备注'
  },
  lab_tests: {
    'test_id': '测试编号',
    'test_date': '日期',
    'project_id': '项目',
    'baseline_id': '基线',
    'material_type': '物料类型', // 需要添加字段
    'quantity': '数量', // 需要添加字段
    'material_name': '物料名称',
    'supplier_name': '供应商',
    'defect_desc': '不合格描述',
    'notes': '备注'
  }
};

async function preciseRulesFix() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🎯 开始精确规则修复...\n');
    
    // 获取所有规则
    const [rules] = await connection.execute(`
      SELECT 
        id,
        intent_name,
        action_target
      FROM nlp_intent_rules 
      WHERE action_target IS NOT NULL
      ORDER BY intent_name
    `);
    
    console.log(`📊 需要修复的规则: ${rules.length}条\n`);
    
    let fixedCount = 0;
    
    for (const rule of rules) {
      console.log(`🔧 修复规则: ${rule.intent_name}`);
      
      let sql = rule.action_target;
      let needsUpdate = false;
      
      // 修复1: 移除SQL末尾的分号（避免语法错误）
      if (sql.trim().endsWith(';')) {
        sql = sql.trim().slice(0, -1);
        needsUpdate = true;
        console.log('  ✅ 移除SQL末尾分号');
      }
      
      // 修复2: 修复特定的字段问题
      const originalSQL = sql;
      
      // 修复project/baseline字段映射
      sql = sql.replace(/\bproject\s+as\s+基线/gi, 'project as 项目');
      sql = sql.replace(/\bbaseline\s+as\s+项目/gi, 'baseline_id as 基线');
      
      // 修复计算字段问题
      sql = sql.replace(/\b100\s+as\s+[\u4e00-\u9fa5]+/gi, 'defect_rate as 不良率');
      sql = sql.replace(/\b0\s+as\s+[\u4e00-\u9fa5]+/gi, 'defect_rate as 不良率');
      
      // 修复重复的字段别名
      sql = sql.replace(/(defect_rate\s+as\s+[\u4e00-\u9fa5]+),\s*defect_rate\s+as\s+[\u4e00-\u9fa5]+/gi, '$1');
      
      // 修复UNION查询中的字段不匹配问题
      if (sql.includes('UNION')) {
        // 确保UNION的各部分字段数量和类型匹配
        sql = fixUnionQueries(sql);
      }
      
      if (sql !== originalSQL) {
        needsUpdate = true;
        console.log('  ✅ 修复字段映射');
      }
      
      // 修复3: 清理SQL格式
      sql = sql.replace(/\s+/g, ' ').trim();
      
      if (needsUpdate) {
        try {
          await connection.execute(`
            UPDATE nlp_intent_rules 
            SET action_target = ?, updated_at = NOW()
            WHERE id = ?
          `, [sql, rule.id]);
          
          fixedCount++;
          console.log('  ✅ 规则已更新');
        } catch (error) {
          console.log(`  ❌ 更新失败: ${error.message}`);
        }
      } else {
        console.log('  ℹ️  无需修复');
      }
      
      console.log('');
    }
    
    console.log(`📊 修复完成: ${fixedCount}/${rules.length} 条规则已修复\n`);
    
    // 验证修复效果
    await validateFixedRules(connection);
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    await connection.end();
  }
}

// 修复UNION查询
function fixUnionQueries(sql) {
  // 这里可以添加更复杂的UNION查询修复逻辑
  // 目前先做基本的格式化
  return sql.replace(/UNION\s+/gi, 'UNION ');
}

// 验证修复效果
async function validateFixedRules(connection) {
  console.log('🔍 验证修复效果...\n');
  
  const [rules] = await connection.execute(`
    SELECT intent_name, action_target 
    FROM nlp_intent_rules 
    WHERE action_target IS NOT NULL
    LIMIT 5
  `);
  
  let passCount = 0;
  let failCount = 0;
  
  for (const rule of rules) {
    try {
      // 尝试执行SQL（限制结果）
      const testSQL = rule.action_target + ' LIMIT 1';
      await connection.execute(testSQL);
      console.log(`✅ ${rule.intent_name}: SQL执行成功`);
      passCount++;
    } catch (error) {
      console.log(`❌ ${rule.intent_name}: ${error.message}`);
      failCount++;
    }
  }
  
  console.log(`\n📊 验证结果: ${passCount}通过, ${failCount}失败`);
  
  if (failCount === 0) {
    console.log('🎉 所有测试规则SQL执行成功！');
  } else {
    console.log('⚠️  仍有规则需要进一步修复');
  }
}

preciseRulesFix();
