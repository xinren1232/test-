const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const distPath = path.resolve(__dirname, 'dist');
const ghPagesPath = path.resolve(__dirname, '.gh-pages');
const repoUrl = 'https://github.com/xinren1232/IQE.git'; // 请替换为你的GitHub仓库URL

// 确保dist目录存在
if (!fs.existsSync(distPath)) {
  console.error('Error: dist目录不存在，请先运行 npm run build');
  process.exit(1);
}

// 创建临时目录
if (fs.existsSync(ghPagesPath)) {
  fs.rmSync(ghPagesPath, { recursive: true });
}
fs.mkdirSync(ghPagesPath);

try {
  // 复制dist内容到临时目录
  console.log('复制构建文件到临时目录...');
  copyFolderSync(distPath, ghPagesPath);

  // 在临时目录中初始化git
  console.log('初始化git仓库...');
  process.chdir(ghPagesPath);
  execSync('git init');
  execSync('git checkout -b gh-pages');
  
  // 添加.nojekyll文件（防止GitHub Pages忽略下划线开头的文件）
  fs.writeFileSync(path.join(ghPagesPath, '.nojekyll'), '');
  
  // 提交文件
  console.log('提交文件...');
  execSync('git add .');
  execSync('git commit -m "Deploy to GitHub Pages"');
  
  // 推送到远程仓库
  console.log('推送到GitHub...');
  execSync(`git push -f ${repoUrl} gh-pages`);
  
  console.log('部署成功！');
} catch (error) {
  console.error('部署过程中出错:', error.message);
  process.exit(1);
} finally {
  // 清理临时目录
  process.chdir(__dirname);
  fs.rmSync(ghPagesPath, { recursive: true });
}

// 辅助函数：递归复制目录
function copyFolderSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target);
  }
  
  const files = fs.readdirSync(source);
  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);
    
    if (fs.lstatSync(sourcePath).isDirectory()) {
      copyFolderSync(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
} 