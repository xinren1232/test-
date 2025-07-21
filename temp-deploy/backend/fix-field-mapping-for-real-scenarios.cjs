// 修复字段映射以符合实际业务场景
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 基于实际业务场景的正确字段映射
const CORRECT_FIELD_MAPPINGS = {
  // 库存场景 - 对应前端库存页面的实际字段
  inventory: {
    displayName: '库存管理',
    fields: {
      '工厂': 'factory',
      '仓库': 'warehouse', 
      '物料编码': 'material_code',
      '物料名称': 'material_name',
      '物料类型': 'material_type',
      '供应商': 'supplier_name',
      '批次号': 'batch_code',
      '数量': 'quantity',
      '状态': 'status',
      '入库时间': 'inbound_time',
      '到期时间': 'updated_at',
      '备注': 'notes'
    },
    // 从storage_location字段提取工厂信息
    specialMappings: {
      '工厂': "SUBSTRING_INDEX(storage_location, '-', 1)",
      '仓库': "CONCAT(SUBSTRING_INDEX(storage_location, '-', 1), '库存')",
      '入库时间': "DATE_FORMAT(inbound_time, '%Y-%m-%d')",
      '到期时间': "DATE_FORMAT(updated_at, '%Y-%m-%d')"
    }
  },
  
  // 检验场景 - 对应前端检验页面的实际字段  
  inspection: {
    displayName: '检验管理',
    fields: {
      '测试编号': 'test_id',
      '日期': 'test_date',
      '项目': 'project_id',
      '基线': 'baseline_id',
      '物料编码': 'material_code',
      '物料名称': 'material_name',
      '物料类型': 'material_type',
      '供应商': 'supplier_name',
      '批次号': 'batch_code',
      '数量': 'quantity',
      '测试结果': 'test_result',
      '不合格描述': 'defect_desc',
      '结论': 'conclusion',
      '备注': 'notes'
    },
    specialMappings: {
      '日期': "DATE_FORMAT(test_date, '%Y-%m-%d')",
      '项目': "COALESCE(project_id, '项目A')",
      '基线': "COALESCE(baseline_id, '基线1.0')",
      '数量': "COALESCE(quantity, 1)",
      '不合格描述': "COALESCE(defect_desc, '')"
    }
  },
  
  // 生产场景 - 对应前端生产页面的实际字段
  production: {
    displayName: '生产管理', 
    fields: {
      '工厂': 'factory',
      '基线': 'project',
      '项目': 'project',
      '物料编码': 'material_code',
      '物料名称': 'material_name',
      '物料类型': 'material_type',
      '供应商': 'supplier_name',
      '批次号': 'batch_code',
      '产线': 'line',
      '车间': 'workshop',
      '不良率': 'defect_rate',
      '本周异常': 'exception_count',
      '检验日期': 'inspection_date',
      '使用时间': 'use_time',
      '备注': 'notes'
    },
    specialMappings: {
      '不良率': "CONCAT(ROUND(defect_rate * 100, 2), '%')",
      '本周异常': "COALESCE(exception_count, 0)",
      '检验日期': "DATE_FORMAT(inspection_date, '%Y-%m-%d')",
      '使用时间': "DATE_FORMAT(use_time, '%Y-%m-%d')"
    }
  }
};

// 生成正确的字段映射函数
function generateFieldMapping(scenario, tableName) {
  const mapping = CORRECT_FIELD_MAPPINGS[scenario];
  if (!mapping) return null;
  
  const selectFields = [];
  
  Object.entries(mapping.fields).forEach(([displayName, dbField]) => {
    if (mapping.specialMappings && mapping.specialMappings[displayName]) {
      // 使用特殊映射
      selectFields.push(`${mapping.specialMappings[displayName]} as \`${displayName}\``);
    } else {
      // 使用普通映射
      selectFields.push(`${dbField} as \`${displayName}\``);
    }
  });
  
  return {
    selectClause: selectFields.join(', '),
    tableName: tableName,
    displayFields: Object.keys(mapping.fields)
  };
}

async function fixFieldMapping() {
  let connection;
  
  try {
    console.log('🔧 修复字段映射以符合实际业务场景...\n');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 1. 检查当前表结构
    console.log('\n📋 检查当前表结构:');
    
    const tables = ['inventory', 'lab_tests', 'online_tracking'];
    const tableStructures = {};
    
    for (const table of tables) {
      try {
        const [columns] = await connection.execute(`DESCRIBE ${table}`);
        tableStructures[table] = columns.map(col => col.Field);
        console.log(`${table}表字段: ${tableStructures[table].join(', ')}`);
      } catch (error) {
        console.log(`❌ ${table}表不存在: ${error.message}`);
      }
    }
    
    // 2. 生成正确的字段映射
    console.log('\n🎯 生成正确的字段映射:');
    
    const scenarios = [
      { name: 'inventory', table: 'inventory', scenario: 'inventory' },
      { name: 'inspection', table: 'lab_tests', scenario: 'inspection' },
      { name: 'production', table: 'online_tracking', scenario: 'production' }
    ];
    
    const fieldMappings = {};
    
    scenarios.forEach(({ name, table, scenario }) => {
      const mapping = generateFieldMapping(scenario, table);
      if (mapping) {
        fieldMappings[name] = mapping;
        console.log(`\n${CORRECT_FIELD_MAPPINGS[scenario].displayName}场景:`);
        console.log(`  表名: ${mapping.tableName}`);
        console.log(`  字段: ${mapping.displayFields.join(', ')}`);
        console.log(`  SQL: SELECT ${mapping.selectClause} FROM ${mapping.tableName}`);
      }
    });
    
    // 3. 测试字段映射
    console.log('\n🧪 测试字段映射:');
    
    for (const [name, mapping] of Object.entries(fieldMappings)) {
      try {
        console.log(`\n测试 ${name} 场景:`);
        
        const testSQL = `SELECT ${mapping.selectClause} FROM ${mapping.tableName} LIMIT 1`;
        const [results] = await connection.execute(testSQL);
        
        if (results.length > 0) {
          console.log(`  ✅ 成功: 返回字段 ${Object.keys(results[0]).join(', ')}`);
          
          // 显示第一条数据示例
          console.log('  数据示例:');
          Object.entries(results[0]).forEach(([key, value]) => {
            const displayValue = value && value.toString().length > 20 
              ? value.toString().substring(0, 20) + '...' 
              : value;
            console.log(`    ${key}: ${displayValue}`);
          });
        } else {
          console.log(`  ⚠️ 无数据`);
        }
        
      } catch (error) {
        console.log(`  ❌ 失败: ${error.message}`);
      }
    }
    
    // 4. 生成前端数据后端的字段映射代码
    console.log('\n📝 生成前端数据后端的字段映射代码:');
    
    const mappingCode = `
// 正确的字段映射 - 符合实际业务场景
const FIELD_MAPPINGS = {
  inventory: {
    selectClause: "${fieldMappings.inventory?.selectClause || ''}",
    displayFields: ${JSON.stringify(fieldMappings.inventory?.displayFields || [])}
  },
  inspection: {
    selectClause: "${fieldMappings.inspection?.selectClause || ''}",
    displayFields: ${JSON.stringify(fieldMappings.inspection?.displayFields || [])}
  },
  production: {
    selectClause: "${fieldMappings.production?.selectClause || ''}",
    displayFields: ${JSON.stringify(fieldMappings.production?.displayFields || [])}
  }
};`;
    
    console.log(mappingCode);
    
    // 5. 保存映射配置到文件
    const fs = require('fs');
    const mappingConfig = {
      timestamp: new Date().toISOString(),
      description: '基于实际业务场景的字段映射配置',
      mappings: fieldMappings,
      correctFieldMappings: CORRECT_FIELD_MAPPINGS
    };
    
    fs.writeFileSync('backend/field-mapping-config.json', JSON.stringify(mappingConfig, null, 2));
    console.log('\n💾 字段映射配置已保存到 backend/field-mapping-config.json');
    
    console.log('\n🎉 字段映射修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixFieldMapping();
