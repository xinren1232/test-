/**
 * 启动后端服务脚本
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 启动后端服务...');
console.log('📁 当前目录:', __dirname);
console.log('📁 后端目录:', path.join(__dirname, 'backend'));

const backendProcess = spawn('node', ['database-server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit'
});

backendProcess.on('error', (error) => {
  console.error('❌ 启动失败:', error);
});

backendProcess.on('exit', (code) => {
  console.log(`🔚 后端服务退出，代码: ${code}`);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭后端服务...');
  backendProcess.kill('SIGINT');
  process.exit(0);
});
