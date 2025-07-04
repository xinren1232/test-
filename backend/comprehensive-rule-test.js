/**
 * 基于实际数据的全面规则测试
 */

import mysql from 'mysql2/promise';
import fetch from 'node-fetch';

async function comprehensiveRuleTest() {
  console.log('🎯 基于实际数据的全面规则测试\n');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root', 
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    // 1. 获取实际数据用于构建测试查询
    console.log('📊 步骤1: 获取实际数据构建测试查询...');
    
    const [suppliers] = await connection.query(`
      SELECT supplier_name FROM inventory 
      GROUP BY supplier_name 
      ORDER BY COUNT(*) DESC
    `);
    
    const [factories] = await connection.query(`
      SELECT storage_location FROM inventory 
      GROUP BY storage_location 
      ORDER BY COUNT(*) DESC
    `);
    
    const [statuses] = await connection.query(`
      SELECT status FROM inventory 
      GROUP BY status 
      ORDER BY COUNT(*) DESC
    `);
    
    const [materials] = await connection.query(`
      SELECT material_name FROM inventory 
      GROUP BY material_name 
      ORDER BY COUNT(*) DESC 
      LIMIT 10
    `);
    
    console.log(`实际数据统计:`);
    console.log(`- 供应商: ${suppliers.length} 个`);
    console.log(`- 工厂: ${factories.length} 个`);
    console.log(`- 状态: ${statuses.length} 种`);
    console.log(`- 物料: ${materials.length} 种`);
    
    // 2. 构建基于实际数据的测试查询
    console.log('\n📋 步骤2: 构建测试查询...');
    
    const testQueries = [
      // 供应商查询测试
      { category: '供应商查询', query: `查询聚龙的库存情况`, expect: ['聚龙'] },
      { category: '供应商查询', query: `欣冠供应商有什么物料？`, expect: ['欣冠'] },
      { category: '供应商查询', query: `广正的物料质量如何？`, expect: ['广正'] },
      
      // 工厂查询测试
      { category: '工厂查询', query: `查询深圳工厂库存`, expect: ['深圳工厂'] },
      { category: '工厂查询', query: `重庆工厂的情况怎么样？`, expect: ['重庆工厂'] },
      { category: '工厂查询', query: `南昌工厂有多少库存？`, expect: ['南昌工厂'] },
      { category: '工厂查询', query: `宜宾工厂库存分析`, expect: ['宜宾工厂'] },
      
      // 状态查询测试
      { category: '状态查询', query: `查询风险状态的库存`, expect: ['风险'] },
      { category: '状态查询', query: `有哪些冻结的物料？`, expect: ['冻结'] },
      { category: '状态查询', query: `正常状态库存统计`, expect: ['正常'] },
      
      // 物料查询测试
      { category: '物料查询', query: `查询摄像头模组的情况`, expect: ['摄像头'] },
      { category: '物料查询', query: `包装盒的质量如何？`, expect: ['包装盒'] },
      { category: '物料查询', query: `听筒的库存分析`, expect: ['听筒'] },
      
      // 综合查询测试
      { category: '综合查询', query: `深圳工厂的聚龙供应商物料`, expect: ['深圳工厂', '聚龙'] },
      { category: '综合查询', query: `重庆工厂风险状态库存`, expect: ['重庆工厂', '风险'] },
      { category: '综合查询', query: `欣冠供应商在南昌工厂的物料`, expect: ['欣冠', '南昌工厂'] },
      
      // 测试结果查询
      { category: '测试查询', query: `查询OK的测试结果`, expect: ['OK', '测试'] },
      { category: '测试查询', query: `有多少NG的测试记录？`, expect: ['NG', '测试'] },
      { category: '测试查询', query: `PENDING状态的测试统计`, expect: ['PENDING', '测试'] },
      
      // 生产分析查询
      { category: '生产查询', query: `车间生产情况分析`, expect: ['车间', '生产'] },
      { category: '生产查询', query: `产线效率如何？`, expect: ['产线'] },
      { category: '生产查询', query: `工厂生产统计`, expect: ['工厂', '生产'] }
    ];
    
    console.log(`构建了 ${testQueries.length} 个测试查询`);
    
    // 3. 执行测试查询
    console.log('\n🧪 步骤3: 执行测试查询...\n');
    
    const results = {
      total: testQueries.length,
      success: 0,
      failed: 0,
      byCategory: {}
    };
    
    for (const testCase of testQueries) {
      console.log(`🔍 ${testCase.category}: "${testCase.query}"`);
      
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
          
          // 检查是否包含期望的关键词
          const matchedKeywords = testCase.expect.filter(keyword => 
            reply.toLowerCase().includes(keyword.toLowerCase())
          );
          
          const matchRate = matchedKeywords.length / testCase.expect.length;
          
          if (matchRate >= 0.5) { // 至少匹配50%的关键词
            console.log(`✅ 成功 (匹配率: ${(matchRate * 100).toFixed(0)}%, 来源: ${queryResult.source})`);
            console.log(`   匹配关键词: ${matchedKeywords.join(', ')}`);
            results.success++;
            
            if (!results.byCategory[testCase.category]) {
              results.byCategory[testCase.category] = { success: 0, total: 0 };
            }
            results.byCategory[testCase.category].success++;
            results.byCategory[testCase.category].total++;
          } else {
            console.log(`❌ 失败 (匹配率: ${(matchRate * 100).toFixed(0)}%)`);
            console.log(`   期望关键词: ${testCase.expect.join(', ')}`);
            console.log(`   匹配关键词: ${matchedKeywords.join(', ')}`);
            console.log(`   返回预览: ${reply.substring(0, 100)}...`);
            results.failed++;
            
            if (!results.byCategory[testCase.category]) {
              results.byCategory[testCase.category] = { success: 0, total: 0 };
            }
            results.byCategory[testCase.category].total++;
          }
        } else {
          console.log(`❌ 查询请求失败: ${queryResponse.status}`);
          results.failed++;
        }
      } catch (error) {
        console.log(`❌ 查询异常: ${error.message}`);
        results.failed++;
      }
      
      console.log(''); // 空行分隔
    }
    
    // 4. 分析测试结果
    console.log('📊 步骤4: 测试结果分析...\n');
    
    const overallSuccessRate = (results.success / results.total * 100).toFixed(1);
    console.log(`📈 总体成功率: ${results.success}/${results.total} (${overallSuccessRate}%)`);
    
    console.log('\n📋 各类别成功率:');
    for (const [category, stats] of Object.entries(results.byCategory)) {
      const categoryRate = (stats.success / stats.total * 100).toFixed(1);
      console.log(`  ${category}: ${stats.success}/${stats.total} (${categoryRate}%)`);
    }
    
    // 5. 生成优化建议
    console.log('\n💡 步骤5: 规则优化建议...\n');
    
    if (overallSuccessRate < 80) {
      console.log('🔧 需要优化的方面:');
      
      // 分析失败率高的类别
      const lowPerformanceCategories = Object.entries(results.byCategory)
        .filter(([_, stats]) => (stats.success / stats.total) < 0.7)
        .map(([category, _]) => category);
      
      if (lowPerformanceCategories.length > 0) {
        console.log(`\n❌ 表现较差的查询类别: ${lowPerformanceCategories.join(', ')}`);
        
        for (const category of lowPerformanceCategories) {
          console.log(`\n${category} 优化建议:`);
          
          switch (category) {
            case '供应商查询':
              console.log('  - 增加供应商名称的触发词覆盖');
              console.log('  - 优化供应商实体识别算法');
              console.log('  - 添加供应商别名和简称支持');
              break;
            case '工厂查询':
              console.log('  - 完善工厂名称的参数提取');
              console.log('  - 增加地区名称到工厂的映射');
              console.log('  - 优化工厂相关SQL查询模板');
              break;
            case '状态查询':
              console.log('  - 扩展状态相关的同义词');
              console.log('  - 改进状态筛选的SQL逻辑');
              console.log('  - 增加状态描述的自然语言理解');
              break;
            case '物料查询':
              console.log('  - 建立物料名称的标准化词典');
              console.log('  - 增加物料类别的模糊匹配');
              console.log('  - 优化物料相关的触发词');
              break;
            case '综合查询':
              console.log('  - 改进多参数的联合提取');
              console.log('  - 优化复合查询的SQL模板');
              console.log('  - 增加查询意图的优先级判断');
              break;
            default:
              console.log('  - 分析具体失败原因');
              console.log('  - 优化相关规则的触发词和参数提取');
          }
        }
      }
      
      console.log('\n🎯 通用优化建议:');
      console.log('1. 基于实际数据更新触发词词典');
      console.log('2. 改进中文分词和实体识别');
      console.log('3. 增加模糊匹配和容错能力');
      console.log('4. 优化SQL查询模板的参数绑定');
      console.log('5. 增加查询结果的相关性排序');
      
    } else {
      console.log('✅ 规则设计表现良好，达到预期标准！');
      console.log('🎉 系统能够有效处理基于实际数据的各类查询');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

comprehensiveRuleTest();
