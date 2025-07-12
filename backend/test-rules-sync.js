import mysql from 'mysql2/promise';
import fs from 'fs';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function testRulesSync() {
  try {
    console.log('🔍 测试规则同步状态...\n');
    
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查数据库中的规则数量
    const [dbRules] = await connection.execute('SELECT COUNT(*) as count FROM nlp_intent_rules WHERE status = "active"');
    const dbRuleCount = dbRules[0].count;
    
    // 2. 检查前端JSON文件
    const frontendRulesPath = '../frontend/src/data/rules.json';
    let frontendRuleCount = 0;
    let frontendCategories = [];
    
    if (fs.existsSync(frontendRulesPath)) {
      const frontendData = JSON.parse(fs.readFileSync(frontendRulesPath, 'utf8'));
      frontendRuleCount = frontendData.totalRules;
      frontendCategories = frontendData.categories.map(c => ({
        name: c.name,
        count: c.rules.length
      }));
    }
    
    // 3. 检查后端生成的JSON文件
    const backendRulesPath = 'rules-for-frontend.json';
    let backendRuleCount = 0;
    
    if (fs.existsSync(backendRulesPath)) {
      const backendData = JSON.parse(fs.readFileSync(backendRulesPath, 'utf8'));
      backendRuleCount = backendData.totalRules;
    }
    
    // 4. 检查数据库中的分类分布
    const [categoryStats] = await connection.execute(`
      SELECT 
        category,
        COUNT(*) as count
      FROM nlp_intent_rules 
      WHERE status = 'active'
      GROUP BY category
      ORDER BY count DESC
    `);
    
    await connection.end();
    
    console.log('=== 规则同步状态报告 ===\n');
    
    console.log('📊 规则数量对比:');
    console.log(`   数据库中活跃规则: ${dbRuleCount} 条`);
    console.log(`   后端生成文件: ${backendRuleCount} 条`);
    console.log(`   前端JSON文件: ${frontendRuleCount} 条`);
    
    const isCountConsistent = dbRuleCount === backendRuleCount && backendRuleCount === frontendRuleCount;
    console.log(`   数量一致性: ${isCountConsistent ? '✅ 一致' : '❌ 不一致'}\n`);
    
    console.log('📋 数据库分类分布:');
    categoryStats.forEach(cat => {
      console.log(`   ${cat.category}: ${cat.count} 条规则`);
    });
    
    console.log('\n📁 前端分类分布:');
    frontendCategories.forEach(cat => {
      console.log(`   ${cat.name}: ${cat.count} 条规则`);
    });
    
    console.log('\n🔍 文件状态检查:');
    console.log(`   后端生成文件存在: ${fs.existsSync(backendRulesPath) ? '✅' : '❌'}`);
    console.log(`   前端JSON文件存在: ${fs.existsSync(frontendRulesPath) ? '✅' : '❌'}`);
    
    if (fs.existsSync(frontendRulesPath)) {
      const stats = fs.statSync(frontendRulesPath);
      console.log(`   前端文件大小: ${stats.size} 字节`);
      console.log(`   前端文件修改时间: ${stats.mtime.toLocaleString()}`);
    }
    
    console.log('\n🎯 同步建议:');
    if (isCountConsistent) {
      console.log('✅ 规则同步状态良好，所有文件数据一致');
      console.log('🔄 请刷新前端页面 http://localhost:5173/assistant 查看更新');
    } else {
      console.log('⚠️ 发现数据不一致，建议重新同步:');
      console.log('   1. 运行 node sync-rules-to-frontend.js');
      console.log('   2. 运行 node copy-rules-to-frontend.js');
      console.log('   3. 刷新前端页面');
    }
    
    console.log('\n📱 前端验证清单:');
    console.log('□ 左侧规则面板显示6个分类');
    console.log('□ 每个分类下的规则数量正确');
    console.log('□ 点击规则能正确触发查询');
    console.log('□ 查询结果显示中文字段名');
    console.log('□ 所有52条规则都能正常工作');
    
  } catch (error) {
    console.error('❌ 测试过程中出错:', error);
  }
}

testRulesSync();
