/**
 * 全面检查规则设计，结合实际数据进行分析和优化
 */

import mysql from 'mysql2/promise';
import fetch from 'node-fetch';

async function comprehensiveRuleAnalysis() {
  console.log('🔍 全面检查规则设计与实际数据匹配\n');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root', 
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    // 1. 分析实际数据结构
    console.log('📊 步骤1: 分析实际数据结构...');
    
    // 库存数据分析
    const [inventoryStats] = await connection.query(`
      SELECT 
        COUNT(*) as 总记录数,
        COUNT(DISTINCT material_name) as 物料种类,
        COUNT(DISTINCT supplier_name) as 供应商数量,
        COUNT(DISTINCT storage_location) as 工厂数量,
        COUNT(DISTINCT status) as 状态种类
      FROM inventory
    `);
    
    console.log('📦 库存数据统计:');
    console.table(inventoryStats);
    
    // 获取实际的供应商列表
    const [suppliers] = await connection.query(`
      SELECT supplier_name as 供应商, COUNT(*) as 物料数量 
      FROM inventory 
      GROUP BY supplier_name 
      ORDER BY COUNT(*) DESC
    `);
    
    console.log('\n🏢 实际供应商列表:');
    console.table(suppliers);
    
    // 获取实际的物料列表
    const [materials] = await connection.query(`
      SELECT material_name as 物料名称, COUNT(*) as 批次数量 
      FROM inventory 
      GROUP BY material_name 
      ORDER BY COUNT(*) DESC
      LIMIT 10
    `);
    
    console.log('\n📋 主要物料列表:');
    console.table(materials);
    
    // 获取实际的工厂列表
    const [factories] = await connection.query(`
      SELECT storage_location as 工厂, COUNT(*) as 库存数量 
      FROM inventory 
      GROUP BY storage_location 
      ORDER BY COUNT(*) DESC
    `);
    
    console.log('\n🏭 实际工厂列表:');
    console.table(factories);
    
    // 获取实际的状态列表
    const [statuses] = await connection.query(`
      SELECT status as 状态, COUNT(*) as 数量 
      FROM inventory 
      GROUP BY status 
      ORDER BY COUNT(*) DESC
    `);
    
    console.log('\n📊 实际状态分布:');
    console.table(statuses);
    
    // 2. 分析当前规则设计
    console.log('\n📋 步骤2: 分析当前规则设计...');
    
    const [currentRules] = await connection.query(`
      SELECT 
        id,
        intent_name as 规则名称,
        description as 描述,
        trigger_words as 触发词,
        synonyms as 同义词,
        priority as 优先级,
        status as 状态
      FROM nlp_intent_rules 
      ORDER BY priority DESC
    `);
    
    console.log('🎯 当前规则列表:');
    for (const rule of currentRules) {
      console.log(`\n规则ID: ${rule.id}`);
      console.log(`名称: ${rule.规则名称}`);
      console.log(`描述: ${rule.描述}`);
      console.log(`触发词: ${rule.触发词}`);
      console.log(`优先级: ${rule.优先级}`);
      console.log(`状态: ${rule.状态}`);
    }
    
    // 3. 测试规则与实际数据的匹配效果
    console.log('\n🧪 步骤3: 测试规则与实际数据的匹配效果...');
    
    // 基于实际数据构建测试查询
    const testQueries = [];
    
    // 基于实际供应商构建查询
    for (const supplier of suppliers.slice(0, 3)) {
      testQueries.push({
        type: '供应商查询',
        query: `查询${supplier.供应商}的库存情况`,
        expectData: [supplier.供应商]
      });
    }
    
    // 基于实际工厂构建查询
    for (const factory of factories.slice(0, 3)) {
      testQueries.push({
        type: '工厂查询',
        query: `查询${factory.工厂}库存`,
        expectData: [factory.工厂]
      });
    }
    
    // 基于实际状态构建查询
    for (const status of statuses.slice(0, 3)) {
      testQueries.push({
        type: '状态查询',
        query: `查询${status.状态}状态的库存`,
        expectData: [status.状态]
      });
    }
    
    // 基于实际物料构建查询
    for (const material of materials.slice(0, 3)) {
      testQueries.push({
        type: '物料查询',
        query: `查询${material.物料名称}的情况`,
        expectData: [material.物料名称]
      });
    }
    
    console.log(`\n🔍 执行 ${testQueries.length} 个基于实际数据的测试查询...\n`);
    
    let successCount = 0;
    const failedQueries = [];
    
    for (const testCase of testQueries) {
      console.log(`🔍 ${testCase.type}: "${testCase.query}"`);
      
      try {
        const queryResponse = await fetch('http://localhost:3001/api/assistant/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query: testCase.query })
        });
        
        if (queryResponse.ok) {
          const queryResult = await queryResponse.json();
          const reply = queryResult.reply || '';
          
          // 检查是否包含期望的数据
          const containsExpectedData = testCase.expectData.some(data => 
            reply.toLowerCase().includes(data.toLowerCase())
          );
          
          if (containsExpectedData) {
            console.log(`✅ 成功 (数据源: ${queryResult.source})`);
            successCount++;
          } else {
            console.log(`❌ 失败 - 未包含期望数据: ${testCase.expectData.join(', ')}`);
            console.log(`   返回内容预览: ${reply.substring(0, 100)}...`);
            failedQueries.push({
              ...testCase,
              actualReply: reply,
              source: queryResult.source
            });
          }
        } else {
          console.log(`❌ 查询请求失败: ${queryResponse.status}`);
          failedQueries.push({
            ...testCase,
            error: `HTTP ${queryResponse.status}`
          });
        }
      } catch (error) {
        console.log(`❌ 查询异常: ${error.message}`);
        failedQueries.push({
          ...testCase,
          error: error.message
        });
      }
    }
    
    // 4. 分析失败的查询
    console.log('\n📋 步骤4: 分析失败的查询...');
    
    if (failedQueries.length > 0) {
      console.log(`\n❌ 失败查询分析 (${failedQueries.length}/${testQueries.length}):`);
      
      const failuresByType = {};
      for (const failed of failedQueries) {
        if (!failuresByType[failed.type]) {
          failuresByType[failed.type] = [];
        }
        failuresByType[failed.type].push(failed);
      }
      
      for (const [type, failures] of Object.entries(failuresByType)) {
        console.log(`\n${type} 失败情况:`);
        for (const failure of failures) {
          console.log(`  - 查询: "${failure.query}"`);
          console.log(`    期望: ${failure.expectData.join(', ')}`);
          if (failure.error) {
            console.log(`    错误: ${failure.error}`);
          } else {
            console.log(`    实际: ${failure.actualReply?.substring(0, 50)}...`);
          }
        }
      }
    }
    
    // 5. 生成规则优化建议
    console.log('\n💡 步骤5: 生成规则优化建议...');
    
    const successRate = (successCount / testQueries.length * 100).toFixed(1);
    console.log(`\n📊 总体测试结果: ${successCount}/${testQueries.length} (${successRate}%)`);
    
    if (successRate < 80) {
      console.log('\n🔧 规则优化建议:');
      
      // 分析缺失的触发词
      const allSuppliers = suppliers.map(s => s.供应商);
      const allFactories = factories.map(f => f.工厂);
      const allStatuses = statuses.map(s => s.状态);
      const allMaterials = materials.map(m => m.物料名称);
      
      console.log('\n1. 触发词优化建议:');
      console.log(`   供应商触发词应包含: ${allSuppliers.join(', ')}`);
      console.log(`   工厂触发词应包含: ${allFactories.join(', ')}`);
      console.log(`   状态触发词应包含: ${allStatuses.join(', ')}`);
      console.log(`   物料触发词应包含: ${allMaterials.slice(0, 5).join(', ')}...`);
      
      console.log('\n2. 参数提取优化建议:');
      console.log('   - 改进实体识别算法');
      console.log('   - 增加模糊匹配能力');
      console.log('   - 优化中文分词处理');
      
      console.log('\n3. SQL模板优化建议:');
      console.log('   - 使用LIKE模糊匹配');
      console.log('   - 添加多字段联合查询');
      console.log('   - 优化结果排序和限制');
    } else {
      console.log('\n✅ 规则设计良好，匹配率达到预期标准');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 分析过程中发生错误:', error);
  }
}

comprehensiveRuleAnalysis();
