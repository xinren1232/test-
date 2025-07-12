import fs from 'fs';
import path from 'path';

async function copyRulesToFrontend() {
  try {
    console.log('🔄 复制规则数据到前端...\n');
    
    // 源文件路径
    const sourceFile = 'rules-for-frontend.json';
    
    // 目标目录路径
    const frontendDataDir = '../frontend/src/data';
    const targetFile = path.join(frontendDataDir, 'rules.json');
    
    // 检查源文件是否存在
    if (!fs.existsSync(sourceFile)) {
      console.error('❌ 源文件不存在:', sourceFile);
      return;
    }
    
    // 创建目标目录（如果不存在）
    if (!fs.existsSync(frontendDataDir)) {
      fs.mkdirSync(frontendDataDir, { recursive: true });
      console.log('📁 创建目录:', frontendDataDir);
    }
    
    // 读取源文件
    const rulesData = fs.readFileSync(sourceFile, 'utf8');
    const rules = JSON.parse(rulesData);
    
    console.log('📊 规则数据统计:');
    console.log(`   - 总规则数: ${rules.totalRules}`);
    console.log(`   - 分类数量: ${rules.categories.length}`);
    console.log(`   - 最后更新: ${rules.lastUpdated}`);
    
    // 写入目标文件
    fs.writeFileSync(targetFile, JSON.stringify(rules, null, 2), 'utf8');
    
    console.log('\n✅ 规则数据已成功复制到前端');
    console.log(`📁 目标文件: ${targetFile}`);
    
    // 验证文件
    const copiedData = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
    console.log('\n🔍 验证复制结果:');
    console.log(`   - 文件大小: ${fs.statSync(targetFile).size} 字节`);
    console.log(`   - 规则总数: ${copiedData.totalRules}`);
    console.log(`   - 分类列表: ${copiedData.categories.map(c => c.name).join(', ')}`);
    
    console.log('\n🎉 同步完成！');
    console.log('🔄 请刷新前端页面查看更新的规则');
    
  } catch (error) {
    console.error('❌ 复制过程中出错:', error);
  }
}

copyRulesToFrontend();
