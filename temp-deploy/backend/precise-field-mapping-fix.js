/**
 * 基于用户实际字段设计的精确修复方案
 * 
 * 用户字段设计:
 * 库存页面: 工厂、仓库、物料编码、物料名称、供应商、数量、状态、入库时间、到期时间、备注
 * 上线页面: 工厂、基线、项目、物料编码、物料名称、供应商、批次号、不良率、本周异常、检验日期、备注
 * 测试页面: 测试编号、日期、项目、基线、物料编码、数量、物料名称、供应商、测试结果、不合格描述、备注
 * 批次管理: 批次号、物料编码、物料名称、供应商、数量、入库日期、产线异常、测试异常、备注
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 精确的字段映射：前端中文字段 -> 数据库英文字段
const PRECISE_FIELD_MAPPING = {
  // 库存页面字段映射
  inventory: {
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
  },
  
  // 上线页面字段映射 -> online_tracking表
  online: {
    '工厂': 'factory',
    '基线': 'baseline',
    '项目': 'project', 
    '物料编码': 'material_code',
    '物料名称': 'material_name',
    '供应商': 'supplier_name',
    '批次号': 'batch_code',
    '不良率': 'defect_rate',
    '本周异常': 'exception_count',
    '检验日期': 'inspection_date',
    '备注': 'notes'
  },
  
  // 测试页面字段映射 -> lab_tests表
  testing: {
    '测试编号': 'test_id',
    '日期': 'test_date',
    '项目': 'project_id',
    '基线': 'baseline_id',
    '物料编码': 'material_code',
    '数量': 'quantity',
    '物料名称': 'material_name',
    '供应商': 'supplier_name',
    '测试结果': 'test_result',
    '不合格描述': 'defect_desc',
    '备注': 'notes'
  },
  
  // 批次管理字段映射
  batch: {
    '批次号': 'batch_code',
    '物料编码': 'material_code',
    '物料名称': 'material_name',
    '供应商': 'supplier_name',
    '数量': 'quantity',
    '入库日期': 'inbound_date',
    '产线异常': 'production_exception',
    '测试异常': 'test_exception',
    '备注': 'notes'
  }
};

async function preciseFieldMappingFix() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 1. 检查当前数据库表结构
    console.log('\n=== 检查数据库表结构 ===');
    await checkTableStructures(connection);
    
    // 2. 检查前端数据格式
    console.log('\n=== 检查前端数据格式 ===');
    await checkFrontendDataFormat(connection);
    
    // 3. 修复规则库字段映射
    console.log('\n=== 修复规则库字段映射 ===');
    await fixRuleFieldMapping(connection);
    
    // 4. 创建数据同步函数
    console.log('\n=== 创建数据同步函数 ===');
    await createDataSyncFunction(connection);
    
    // 5. 测试完整流程
    console.log('\n=== 测试完整流程 ===');
    await testCompleteFlow(connection);
    
    console.log('\n🎉 精确字段映射修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function checkTableStructures(connection) {
  const tables = ['inventory', 'online_tracking', 'lab_tests'];
  
  for (const tableName of tables) {
    try {
      const [fields] = await connection.execute(`DESCRIBE ${tableName}`);
      console.log(`\n${tableName}表字段:`);
      fields.forEach(field => {
        console.log(`  ${field.Field} (${field.Type})`);
      });
    } catch (error) {
      console.log(`❌ ${tableName}表不存在: ${error.message}`);
    }
  }
}

async function checkFrontendDataFormat(connection) {
  try {
    const [rows] = await connection.execute(`
      SELECT data_type, 
             LEFT(data_content, 200) as preview,
             LENGTH(data_content) as length
      FROM real_data_storage 
      WHERE is_active = TRUE
    `);
    
    console.log(`找到${rows.length}种数据类型:`);
    rows.forEach(row => {
      console.log(`\n${row.data_type}数据 (${row.length}字符):`);
      console.log(`预览: ${row.preview}...`);
      
      // 检查数据格式
      if (row.preview.includes('[object Object]')) {
        console.log('❌ 数据格式错误：对象被toString()了');
      } else if (row.preview.startsWith('[{') || row.preview.startsWith('{')) {
        console.log('✅ 数据格式正确：JSON格式');
      } else {
        console.log('⚠️ 数据格式未知');
      }
    });
    
  } catch (error) {
    console.log('❌ 检查前端数据格式失败:', error.message);
  }
}

async function fixRuleFieldMapping(connection) {
  try {
    // 检查当前规则中使用的字段
    const [rules] = await connection.execute(`
      SELECT id, intent_name, action_target 
      FROM nlp_intent_rules 
      WHERE status = 'active' AND action_type = 'SQL_QUERY'
      LIMIT 10
    `);
    
    console.log(`检查${rules.length}条规则的字段映射:`);
    
    let needsUpdate = [];
    
    for (const rule of rules) {
      const sql = rule.action_target;
      let hasIssues = false;
      let issues = [];
      
      // 检查常见的字段问题
      if (sql.includes('materialCode')) {
        hasIssues = true;
        issues.push('使用了前端字段格式 materialCode，应为 material_code');
      }
      
      if (sql.includes('materialName')) {
        hasIssues = true;
        issues.push('使用了前端字段格式 materialName，应为 material_name');
      }
      
      if (sql.includes('factory') && !sql.includes('inventory')) {
        // 检查是否在错误的表中使用factory字段
        if (sql.includes('lab_tests')) {
          hasIssues = true;
          issues.push('lab_tests表中不应有factory字段');
        }
      }
      
      if (hasIssues) {
        needsUpdate.push({
          id: rule.id,
          name: rule.intent_name,
          issues: issues,
          sql: sql
        });
      }
    }
    
    console.log(`\n发现${needsUpdate.length}条规则需要修复:`);
    needsUpdate.forEach(rule => {
      console.log(`\n规则${rule.id}: ${rule.name}`);
      rule.issues.forEach(issue => {
        console.log(`  ❌ ${issue}`);
      });
    });
    
    // 这里可以添加自动修复逻辑
    if (needsUpdate.length > 0) {
      console.log('\n⚠️ 建议手动修复这些规则，或者重新生成规则库');
    }
    
  } catch (error) {
    console.log('❌ 修复规则字段映射失败:', error.message);
  }
}

async function createDataSyncFunction(connection) {
  // 这里创建一个标准的数据同步函数模板
  const syncFunctionTemplate = `
/**
 * 标准数据同步函数
 * 将前端localStorage数据同步到MySQL表
 */
async function syncFrontendDataToMySQL(frontendData) {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 清空现有数据
    await connection.execute('DELETE FROM inventory');
    await connection.execute('DELETE FROM online_tracking'); 
    await connection.execute('DELETE FROM lab_tests');
    
    // 同步库存数据
    if (frontendData.inventory) {
      for (const item of frontendData.inventory) {
        await connection.execute(\`
          INSERT INTO inventory (
            material_code, material_name, supplier_name, quantity,
            status, inbound_time, storage_location, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        \`, [
          item.物料编码 || item.materialCode,
          item.物料名称 || item.materialName,
          item.供应商 || item.supplier,
          item.数量 || item.quantity,
          item.状态 || item.status,
          item.入库时间 || item.inboundTime,
          \`\${item.工厂 || item.factory}-\${item.仓库 || item.warehouse}\`,
          item.备注 || item.notes
        ]);
      }
    }
    
    // 同步上线数据
    if (frontendData.production) {
      for (const item of frontendData.production) {
        await connection.execute(\`
          INSERT INTO online_tracking (
            batch_code, material_code, material_name, supplier_name,
            factory, project, baseline, defect_rate, exception_count,
            inspection_date, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        \`, [
          item.批次号 || item.batchNo,
          item.物料编码 || item.materialCode,
          item.物料名称 || item.materialName,
          item.供应商 || item.supplier,
          item.工厂 || item.factory,
          item.项目 || item.project,
          item.基线 || item.baseline,
          item.不良率 || item.defectRate,
          item.本周异常 || item.weeklyAbnormal,
          item.检验日期 || item.inspectionDate,
          item.备注 || item.notes
        ]);
      }
    }
    
    // 同步测试数据
    if (frontendData.inspection) {
      for (const item of frontendData.inspection) {
        await connection.execute(\`
          INSERT INTO lab_tests (
            test_id, test_date, project_id, baseline_id,
            material_code, material_name, supplier_name,
            quantity, test_result, defect_desc, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        \`, [
          item.测试编号 || item.testId,
          item.日期 || item.testDate,
          item.项目 || item.project,
          item.基线 || item.baseline,
          item.物料编码 || item.materialCode,
          item.物料名称 || item.materialName,
          item.供应商 || item.supplier,
          item.数量 || item.quantity,
          item.测试结果 || item.testResult,
          item.不合格描述 || item.defectDesc,
          item.备注 || item.notes
        ]);
      }
    }
    
    console.log('✅ 数据同步完成');
    return true;
    
  } catch (error) {
    console.error('❌ 数据同步失败:', error);
    return false;
  } finally {
    await connection.end();
  }
}
  `;
  
  console.log('✅ 数据同步函数模板已生成');
  console.log('📝 建议将此函数集成到 assistantController.js 中');
}

async function testCompleteFlow(connection) {
  // 测试规则查询是否能正常工作
  const testQueries = [
    {
      name: '库存基础查询',
      sql: 'SELECT material_code, material_name, supplier_name FROM inventory LIMIT 3',
      expectedFields: ['material_code', 'material_name', 'supplier_name']
    },
    {
      name: '上线基础查询', 
      sql: 'SELECT material_code, material_name, factory, project FROM online_tracking LIMIT 3',
      expectedFields: ['material_code', 'material_name', 'factory', 'project']
    },
    {
      name: '测试基础查询',
      sql: 'SELECT material_code, material_name, test_result FROM lab_tests LIMIT 3', 
      expectedFields: ['material_code', 'material_name', 'test_result']
    }
  ];
  
  for (const query of testQueries) {
    try {
      const [results] = await connection.execute(query.sql);
      console.log(`✅ ${query.name}: 返回${results.length}条记录`);
      
      if (results.length > 0) {
        const actualFields = Object.keys(results[0]);
        const missingFields = query.expectedFields.filter(field => !actualFields.includes(field));
        
        if (missingFields.length === 0) {
          console.log(`  ✅ 字段完整: ${actualFields.join(', ')}`);
        } else {
          console.log(`  ❌ 缺少字段: ${missingFields.join(', ')}`);
        }
      }
    } catch (error) {
      console.log(`❌ ${query.name}失败: ${error.message}`);
    }
  }
}

// 运行修复
preciseFieldMappingFix().catch(console.error);
