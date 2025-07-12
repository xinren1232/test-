import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 基于实际前端页面的正确字段映射
const CORRECT_FIELD_MAPPINGS = {
  // 库存数据页面 - 实际字段：工厂、仓库、物料编码、物料名称、供应商、数量、状态、入库时间、到期时间、备注
  inventory: {
    table: 'inventory',
    fields: {
      '工厂': 'factory',
      '仓库': 'warehouse', 
      '物料编码': 'material_code',
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '数量': 'quantity',
      '状态': 'status',
      '入库时间': 'inbound_time',
      '到期时间': 'expiry_date',
      '备注': 'notes'
    }
  },
  
  // 上线数据页面 - 实际字段：工厂、基线、项目、物料编码、物料名称、供应商、批次号、不良率、本周异常、检验日期、备注
  online_tracking: {
    table: 'online_tracking',
    fields: {
      '工厂': 'factory',
      '基线': 'project', // 注意：基线在数据库中对应project字段
      '项目': 'project',
      '物料编码': 'material_code',
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '批次号': 'batch_code',
      '不良率': 'defect_rate',
      '本周异常': 'exception_count',
      '检验日期': 'online_date',
      '备注': 'notes'
    }
  },
  
  // 测试数据页面 - 实际字段：测试编号、日期、项目、基线、物料编码、数量、物料名称、供应商、测试结果、不合格描述、备注
  lab_tests: {
    table: 'lab_tests',
    fields: {
      '测试编号': 'test_id',
      '日期': 'test_date',
      '项目': 'test_item', // 注意：这里可能需要确认具体映射
      '基线': 'baseline_id', // 注意：这里可能需要确认具体映射
      '物料编码': 'material_code',
      '数量': 'COUNT(*)', // 聚合字段
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '测试结果': 'test_result',
      '不合格描述': 'defect_desc',
      '备注': 'notes'
    }
  },
  
  // 批次管理页面 - 实际字段：批次号、物料编码、物料名称、供应商、数量、入库日期、产线异常、测试异常、备注
  batch_management: {
    table: 'inventory', // 批次管理基于库存表
    fields: {
      '批次号': 'batch_code',
      '物料编码': 'material_code',
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '数量': 'quantity',
      '入库日期': 'inbound_time',
      '产线异常': '(SELECT COUNT(*) FROM online_tracking WHERE batch_code = inventory.batch_code AND exception_count > 0)',
      '测试异常': '(SELECT COUNT(*) FROM lab_tests WHERE batch_code = inventory.batch_code AND test_result = "FAIL")',
      '备注': 'notes'
    }
  }
};

async function checkAndFixRulesFields() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log('🔍 检查并修正规则库中的字段定义...');

    // 获取所有规则
    const [rules] = await connection.execute('SELECT * FROM nlp_intent_rules ORDER BY intent_name');

    console.log(`\n找到 ${rules.length} 条规则，开始逐一修正：\n`);

    let fixedCount = 0;

    for (const rule of rules) {
      console.log(`📋 处理规则: ${rule.intent_name}`);

      let originalSQL = rule.action_target;
      let fixedSQL = originalSQL;
      let needsUpdate = false;

      // 修正问题字段
      const fieldReplacements = [
        // 删除车间相关字段
        { from: /,\s*workshop\s+as\s+车间/gi, to: '' },
        { from: /,\s*factory\s+as\s+工厂,\s*workshop\s+as\s+车间/gi, to: ', factory as 工厂' },
        { from: /workshop\s+as\s+车间,?\s*/gi, to: '' },
        { from: /,\s*车间/gi, to: '' },

        // 删除生产线相关字段
        { from: /,\s*line\s+as\s+生产线/gi, to: '' },
        { from: /line\s+as\s+生产线,?\s*/gi, to: '' },
        { from: /,\s*生产线/gi, to: '' },

        // 删除风险等级字段
        { from: /OR\s+risk_level\s*=\s*'high'/gi, to: '' },
        { from: /,\s*risk_level/gi, to: '' },

        // 修正表名错误
        { from: /FROM\s+test_tracking/gi, to: 'FROM lab_tests' },
        { from: /test_tracking/gi, to: 'lab_tests' },

        // 修正字段名
        { from: /defect_description/gi, to: 'defect_desc' },
        { from: /project_id/gi, to: 'test_item' },
        { from: /baseline_id/gi, to: 'baseline' },
        { from: /batch_no/gi, to: 'batch_code' },

        // 清理多余的逗号
        { from: /,\s*,/g, to: ',' },
        { from: /,\s*FROM/gi, to: ' FROM' },
        { from: /,\s*WHERE/gi, to: ' WHERE' },
        { from: /,\s*ORDER/gi, to: ' ORDER' },
        { from: /,\s*GROUP/gi, to: ' GROUP' },
        { from: /,\s*HAVING/gi, to: ' HAVING' }
      ];

      fieldReplacements.forEach(replacement => {
        const newSQL = fixedSQL.replace(replacement.from, replacement.to);
        if (newSQL !== fixedSQL) {
          needsUpdate = true;
          fixedSQL = newSQL;
        }
      });

      if (needsUpdate) {
        console.log(`🔧 修正字段问题`);

        // 更新数据库
        await connection.execute(
          'UPDATE nlp_intent_rules SET action_target = ? WHERE id = ?',
          [fixedSQL, rule.id]
        );

        fixedCount++;
        console.log(`✅ 已更新`);
      } else {
        console.log(`✅ 无需修正`);
      }

      console.log('---\n');
    }

    console.log(`\n🎉 修正完成！共修正了 ${fixedCount} 条规则`);

  } catch (error) {
    console.error('❌ 修正失败:', error);
  } finally {
    await connection.end();
  }
}

checkAndFixRulesFields();
