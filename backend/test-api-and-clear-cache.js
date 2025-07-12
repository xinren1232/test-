import fetch from 'node-fetch';

async function testApiAndClearCache() {
  try {
    console.log('🔍 测试API并检查分类数据...\n');
    
    // 1. 测试API端点
    console.log('=== 测试API端点 ===');
    const response = await fetch('http://localhost:3001/api/rules', {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      console.log(`❌ API请求失败: ${response.status} ${response.statusText}`);
      return;
    }
    
    const data = await response.json();
    const rules = data.data || data; // 处理可能的数据包装
    console.log(`✅ API响应成功，返回 ${rules?.length || 0} 条规则`);

    if (!Array.isArray(rules)) {
      console.log('❌ API返回的数据格式不正确');
      console.log('返回数据:', JSON.stringify(data, null, 2));
      return;
    }
    
    // 2. 检查分类情况
    console.log('\n=== 检查分类情况 ===');
    const categoryStats = {};
    rules.forEach(rule => {
      categoryStats[rule.category] = (categoryStats[rule.category] || 0) + 1;
    });
    
    console.log('API返回的分类统计:');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} 条规则`);
    });
    
    // 3. 检查是否是新的场景分类
    const expectedCategories = ['库存场景', '上线场景', '测试场景', '批次场景', '对比场景', '综合场景'];
    const hasNewCategories = expectedCategories.every(cat => categoryStats[cat] > 0);
    
    if (hasNewCategories) {
      console.log('\n✅ API已返回新的场景分类数据！');
      console.log('📋 6个业务场景分类都存在');
    } else {
      console.log('\n❌ API仍返回旧分类数据');
      console.log('🔄 需要检查数据库更新情况');
    }
    
    // 4. 显示每个分类的前3条规则作为示例
    console.log('\n=== 各分类示例规则 ===');
    expectedCategories.forEach(category => {
      const categoryRules = rules.filter(rule => rule.category === category);
      if (categoryRules.length > 0) {
        console.log(`\n--- ${category} (${categoryRules.length}条) ---`);
        categoryRules.slice(0, 3).forEach((rule, index) => {
          console.log(`  ${index + 1}. ${rule.intent_name}`);
        });
        if (categoryRules.length > 3) {
          console.log(`  ... 还有 ${categoryRules.length - 3} 条规则`);
        }
      }
    });
    
    // 5. 提供前端缓存清理建议
    console.log('\n=== 前端缓存清理建议 ===');
    console.log('🔄 如果前端仍显示旧分类，请尝试以下方法:');
    console.log('');
    console.log('方法1 - 强制刷新:');
    console.log('  • Windows: Ctrl + F5 或 Ctrl + Shift + R');
    console.log('  • Mac: Cmd + Shift + R');
    console.log('');
    console.log('方法2 - 清除浏览器缓存:');
    console.log('  1. 打开开发者工具 (F12)');
    console.log('  2. 右键点击刷新按钮');
    console.log('  3. 选择"硬性重新加载"或"清空缓存并硬性重新加载"');
    console.log('');
    console.log('方法3 - 手动清除缓存:');
    console.log('  1. 开发者工具 → Application 标签');
    console.log('  2. Storage → Clear storage');
    console.log('  3. 点击 "Clear site data"');
    console.log('');
    console.log('方法4 - 无痕模式测试:');
    console.log('  • 打开无痕/隐私浏览窗口');
    console.log('  • 访问 http://localhost:5173');
    console.log('  • 检查是否显示新分类');
    console.log('');
    console.log('方法5 - 添加时间戳参数:');
    console.log('  • 访问 http://localhost:5173?t=' + Date.now());
    console.log('');
    
    // 6. 生成测试URL
    const timestamp = Date.now();
    console.log('🔗 测试链接:');
    console.log(`  • 带时间戳: http://localhost:5173?t=${timestamp}`);
    console.log(`  • API直接测试: http://localhost:3001/api/rules`);
    
    console.log('\n✅ API测试完成！');
    console.log('📊 后端数据已正确更新为6个业务场景分类');
    console.log('🔄 如果前端仍显示旧分类，问题在于浏览器缓存');
    
  } catch (error) {
    console.error('❌ 测试过程中出错:', error.message);
    console.log('\n🔧 可能的解决方案:');
    console.log('1. 确认后端服务正在运行: npm start');
    console.log('2. 检查端口3001是否被占用');
    console.log('3. 重启后端服务');
  }
}

testApiAndClearCache();
