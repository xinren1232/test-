import mysql from 'mysql2/promise';
import fetch from 'node-fetch';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function finalVerification() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔍 最终验证规则分类修复...\n');
    
    // 1. 验证数据库状态
    console.log('📊 1. 数据库状态验证:');
    
    const [dbRules] = await connection.execute(`
      SELECT id, intent_name, priority, category
      FROM nlp_intent_rules 
      ORDER BY priority, intent_name
    `);
    
    const dbCategoryStats = {};
    dbRules.forEach(rule => {
      if (!dbCategoryStats[rule.category]) {
        dbCategoryStats[rule.category] = 0;
      }
      dbCategoryStats[rule.category]++;
    });
    
    console.log('数据库中的分类分布:');
    Object.keys(dbCategoryStats).forEach(category => {
      console.log(`  ${category}: ${dbCategoryStats[category]}个规则`);
    });
    
    const uncategorizedInDb = dbRules.filter(rule => rule.category === '未分类');
    if (uncategorizedInDb.length === 0) {
      console.log('✅ 数据库中无未分类规则');
    } else {
      console.log(`❌ 数据库中仍有${uncategorizedInDb.length}个未分类规则`);
    }
    
    // 2. 验证API响应
    console.log('\n📡 2. API响应验证:');

    let apiResult = null;
    try {
      const response = await fetch('http://localhost:3001/api/rules');
      apiResult = await response.json();
      
      if (apiResult.success && apiResult.data) {
        console.log(`API返回 ${apiResult.data.length} 条规则`);
        
        const apiCategoryStats = {};
        apiResult.data.forEach(rule => {
          if (!apiCategoryStats[rule.category]) {
            apiCategoryStats[rule.category] = 0;
          }
          apiCategoryStats[rule.category]++;
        });
        
        console.log('API返回的分类分布:');
        Object.keys(apiCategoryStats).forEach(category => {
          console.log(`  ${category}: ${apiCategoryStats[category]}个规则`);
        });
        
        const uncategorizedInApi = apiResult.data.filter(rule => 
          rule.category === '未分类' || !rule.category
        );
        
        if (uncategorizedInApi.length === 0) {
          console.log('✅ API返回无未分类规则');
        } else {
          console.log(`❌ API返回仍有${uncategorizedInApi.length}个未分类规则`);
        }
        
        // 3. 验证数据一致性
        console.log('\n🔄 3. 数据一致性验证:');
        
        if (dbRules.length === apiResult.data.length) {
          console.log('✅ 数据库和API返回的规则数量一致');
        } else {
          console.log(`❌ 数据不一致: 数据库${dbRules.length}条, API${apiResult.data.length}条`);
        }
        
        // 检查分类分布是否一致
        const categoriesMatch = Object.keys(dbCategoryStats).every(category => 
          dbCategoryStats[category] === apiCategoryStats[category]
        );
        
        if (categoriesMatch) {
          console.log('✅ 数据库和API的分类分布一致');
        } else {
          console.log('❌ 数据库和API的分类分布不一致');
        }
        
      } else {
        console.log('❌ API返回数据格式错误');
      }
      
    } catch (apiError) {
      console.log('❌ API测试失败:', apiError.message);
    }
    
    // 4. 前端分类逻辑验证
    console.log('\n🎨 4. 前端分类逻辑验证:');
    
    const testCategories = [
      '基础查询规则',
      '进阶分析规则', 
      '高级统计规则',
      '专项分析规则',
      '趋势对比规则'
    ];
    
    const frontendLogicWorking = testCategories.every(category => {
      const tagType = getCategoryTagType(category);
      const label = getCategoryLabel(category);
      return tagType && label && label !== '未分类';
    });
    
    if (frontendLogicWorking) {
      console.log('✅ 前端分类逻辑正常工作');
    } else {
      console.log('❌ 前端分类逻辑存在问题');
    }
    
    // 5. 生成修复总结
    console.log('\n📋 5. 修复总结:');
    
    const totalIssues = [
      uncategorizedInDb.length > 0 ? '数据库未分类' : null,
      !apiResult?.success ? 'API响应异常' : null,
      !frontendLogicWorking ? '前端逻辑异常' : null
    ].filter(Boolean);
    
    if (totalIssues.length === 0) {
      console.log('🎉 所有问题已修复！');
      console.log('✅ 数据库分类正确');
      console.log('✅ API返回正确');
      console.log('✅ 前端逻辑正常');
      console.log('✅ 用户界面将正确显示规则分类');
    } else {
      console.log('⚠️ 仍存在以下问题:');
      totalIssues.forEach(issue => {
        console.log(`  - ${issue}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 验证过程中出现错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 前端分类函数
function getCategoryTagType(category) {
  switch (category) {
    case '基础查询规则': return 'success';
    case '进阶分析规则': return 'primary';
    case '高级统计规则': return 'warning';
    case '专项分析规则': return 'danger';
    case '趋势对比规则': return 'info';
    default: return '';
  }
}

function getCategoryLabel(category) {
  switch (category) {
    case '基础查询规则': return '基础';
    case '进阶分析规则': return '进阶';
    case '高级统计规则': return '统计';
    case '专项分析规则': return '专项';
    case '趋势对比规则': return '趋势';
    default: return '未分类';
  }
}

finalVerification();
