/**
 * 优化基础问答规则，使其更贴合实际数据结构
 * 基于用户反馈和实际数据字段进行调整
 */

import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
});

async function optimizeBasicRules() {
  console.log('🔧 开始优化基础问答规则...');
  
  try {
    // 1. 清理现有规则
    console.log('🗑️ 清理现有规则...');
    await connection.query('DELETE FROM nlp_intent_rules WHERE status = "active"');
    
    // 2. 基于实际数据结构创建优化的规则
    const optimizedRules = [
      
      // ========== 库存查询规则 ==========
      {
        intent_name: 'query_inventory',
        description: '查询库存信息',
        action_type: 'MEMORY_QUERY',
        action_target: 'inventory',
        parameters: JSON.stringify([
          { name: 'factory', type: 'string', description: '工厂名称' },
          { name: 'supplier', type: 'string', description: '供应商名称' },
          { name: 'materialCode', type: 'string', description: '物料编码' },
          { name: 'materialName', type: 'string', description: '物料名称' },
          { name: 'status', type: 'string', description: '状态' }
        ]),
        example_query: '查询深圳工厂的库存',
        status: 'active'
      },
      
      {
        intent_name: 'query_inventory_by_factory',
        description: '按工厂查询库存',
        action_type: 'MEMORY_QUERY',
        action_target: 'inventory',
        parameters: JSON.stringify([
          { name: 'factory', type: 'string', description: '工厂名称' }
        ]),
        example_query: '深圳工厂的库存',
        status: 'active'
      },
      
      {
        intent_name: 'query_inventory_by_supplier',
        description: '按供应商查询库存',
        action_type: 'MEMORY_QUERY',
        action_target: 'inventory',
        parameters: JSON.stringify([
          { name: 'supplier', type: 'string', description: '供应商名称' }
        ]),
        example_query: '紫光供应商的库存',
        status: 'active'
      },
      
      {
        intent_name: 'query_inventory_status',
        description: '按状态查询库存',
        action_type: 'MEMORY_QUERY',
        action_target: 'inventory',
        parameters: JSON.stringify([
          { name: 'status', type: 'string', description: '状态' }
        ]),
        example_query: '风险状态的物料',
        status: 'active'
      },
      
      // ========== 测试查询规则 ==========
      {
        intent_name: 'query_lab_test',
        description: '查询测试结果',
        action_type: 'MEMORY_QUERY',
        action_target: 'inspection',
        parameters: JSON.stringify([
          { name: 'factory', type: 'string', description: '工厂名称' },
          { name: 'supplier', type: 'string', description: '供应商名称' },
          { name: 'materialCode', type: 'string', description: '物料编码' },
          { name: 'materialName', type: 'string', description: '物料名称' },
          { name: 'testResult', type: 'string', description: '测试结果' }
        ]),
        example_query: '查询测试结果',
        status: 'active'
      },
      
      {
        intent_name: 'query_lab_test_negative',
        description: '查询测试不合格记录',
        action_type: 'MEMORY_QUERY',
        action_target: 'inspection',
        parameters: JSON.stringify([
          { name: 'testResult', type: 'string', description: '测试结果', default: 'FAIL' }
        ]),
        example_query: '测试不合格的记录',
        status: 'active'
      },
      
      // ========== 生产查询规则 ==========
      {
        intent_name: 'query_online_tracking',
        description: '查询生产线数据',
        action_type: 'MEMORY_QUERY',
        action_target: 'production',
        parameters: JSON.stringify([
          { name: 'factory', type: 'string', description: '工厂名称' },
          { name: 'supplier', type: 'string', description: '供应商名称' },
          { name: 'materialCode', type: 'string', description: '物料编码' },
          { name: 'materialName', type: 'string', description: '物料名称' },
          { name: 'project', type: 'string', description: '项目' },
          { name: 'baseline', type: 'string', description: '基线' }
        ]),
        example_query: '查询生产线数据',
        status: 'active'
      },
      
      {
        intent_name: 'query_high_defect_rate',
        description: '查询高不良率数据',
        action_type: 'MEMORY_QUERY',
        action_target: 'production',
        parameters: JSON.stringify([
          { name: 'defectRate', type: 'number', description: '不良率阈值', default: 0.05 }
        ]),
        example_query: '高不良率的生产数据',
        status: 'active'
      },
      
      {
        intent_name: 'query_by_baseline',
        description: '按基线查询数据',
        action_type: 'MEMORY_QUERY',
        action_target: 'production',
        parameters: JSON.stringify([
          { name: 'baseline', type: 'string', description: '基线名称' },
          { name: 'factory', type: 'string', description: '工厂名称' }
        ]),
        example_query: '基线A的数据',
        status: 'active'
      },
      
      // ========== 汇总统计规则 ==========
      {
        intent_name: 'query_factory_summary',
        description: '工厂数据汇总',
        action_type: 'MEMORY_QUERY',
        action_target: 'summary',
        parameters: JSON.stringify([
          { name: 'factory', type: 'string', description: '工厂名称' }
        ]),
        example_query: '深圳工厂数据汇总',
        status: 'active'
      },
      
      {
        intent_name: 'query_supplier_summary',
        description: '供应商数据汇总',
        action_type: 'MEMORY_QUERY',
        action_target: 'summary',
        parameters: JSON.stringify([
          { name: 'supplier', type: 'string', description: '供应商名称' }
        ]),
        example_query: '紫光供应商统计',
        status: 'active'
      },
      
      // ========== 实际数据字段规则 ==========
      {
        intent_name: 'query_material_by_code',
        description: '按物料编码查询',
        action_type: 'MEMORY_QUERY',
        action_target: 'inventory',
        parameters: JSON.stringify([
          { name: 'materialCode', type: 'string', description: '物料编码' }
        ]),
        example_query: '物料M001的信息',
        status: 'active'
      },
      
      {
        intent_name: 'query_batch_info',
        description: '查询批次信息',
        action_type: 'MEMORY_QUERY',
        action_target: 'inventory',
        parameters: JSON.stringify([
          { name: 'batchCode', type: 'string', description: '批次号' }
        ]),
        example_query: '批次B001的信息',
        status: 'active'
      }
    ];
    
    // 3. 插入优化后的规则
    console.log('📝 插入优化后的规则...');
    for (const rule of optimizedRules) {
      await connection.query(`
        INSERT INTO nlp_intent_rules
        (intent_name, description, action_type, action_target, parameters, example_query, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        rule.intent_name,
        rule.description,
        rule.action_type,
        rule.action_target,
        rule.parameters,
        rule.example_query,
        rule.status
      ]);
    }
    
    console.log(`✅ 成功插入 ${optimizedRules.length} 条优化规则`);
    
    // 4. 显示当前所有规则
    const [rules] = await connection.query(`
      SELECT intent_name, description, action_type, example_query 
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY created_at
    `);
    
    console.log('\n📋 当前活跃的优化规则:');
    rules.forEach((rule, index) => {
      console.log(`${index + 1}. ${rule.intent_name}`);
      console.log(`   描述: ${rule.description}`);
      console.log(`   类型: ${rule.action_type}`);
      console.log(`   示例: ${rule.example_query}`);
      console.log('');
    });
    
    console.log('🎉 基础规则优化完成！');
    
  } catch (error) {
    console.error('❌ 优化规则失败:', error);
  } finally {
    await connection.end();
  }
}

optimizeBasicRules();
