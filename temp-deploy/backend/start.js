/**
 * IQE统一助手API服务启动脚本
 * 处理初始化工作，如创建日志目录等
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建日志目录
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  try {
    fs.mkdirSync(logDir);
    console.log(`日志目录已创建: ${logDir}`);
  } catch (error) {
    console.error(`创建日志目录失败: ${error.message}`);
    process.exit(1);
  }
}

// 启动应用
console.log('正在启动IQE统一助手API服务...');
const app = spawn('node', ['src/index.js'], {
  stdio: 'inherit',
  env: { ...process.env },
});

app.on('close', code => {
  if (code !== 0) {
    console.error(`服务异常退出，退出代码: ${code}`);
  }
  // 不再在这里调用 process.exit()，让脚本可以由其他工具（如nodemon）管理
});

app.on('error', (err) => {
  console.error('启动子进程失败:', err);
});

// 处理进程信号
const handleSignal = (signal) => {
  console.log(`收到 ${signal} 信号，正在关闭服务...`);
  // 尝试正常关闭子进程
  const killed = app.kill(signal);
  if (!killed) {
    console.log('子进程无法被信号关闭, 可能已经退出。');
  }
};

process.on('SIGTERM', () => handleSignal('SIGTERM'));
process.on('SIGINT', () => handleSignal('SIGINT')); 