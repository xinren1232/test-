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
  env: process.env
});

app.on('close', code => {
  if (code !== 0) {
    console.error(`服务异常退出，退出代码: ${code}`);
    process.exit(code);
  }
});

// 处理进程信号
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务...');
  app.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务...');
  app.kill('SIGINT');
}); 
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
  env: process.env
});

app.on('close', code => {
  if (code !== 0) {
    console.error(`服务异常退出，退出代码: ${code}`);
    process.exit(code);
  }
});

// 处理进程信号
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务...');
  app.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务...');
  app.kill('SIGINT');
}); 
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
  env: process.env
});

app.on('close', code => {
  if (code !== 0) {
    console.error(`服务异常退出，退出代码: ${code}`);
    process.exit(code);
  }
});

// 处理进程信号
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务...');
  app.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务...');
  app.kill('SIGINT');
}); 
 
 
 
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
  env: process.env
});

app.on('close', code => {
  if (code !== 0) {
    console.error(`服务异常退出，退出代码: ${code}`);
    process.exit(code);
  }
});

// 处理进程信号
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务...');
  app.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务...');
  app.kill('SIGINT');
}); 
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
  env: process.env
});

app.on('close', code => {
  if (code !== 0) {
    console.error(`服务异常退出，退出代码: ${code}`);
    process.exit(code);
  }
});

// 处理进程信号
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务...');
  app.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务...');
  app.kill('SIGINT');
}); 
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
  env: process.env
});

app.on('close', code => {
  if (code !== 0) {
    console.error(`服务异常退出，退出代码: ${code}`);
    process.exit(code);
  }
});

// 处理进程信号
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务...');
  app.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务...');
  app.kill('SIGINT');
}); 
 
 
 
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
  env: process.env
});

app.on('close', code => {
  if (code !== 0) {
    console.error(`服务异常退出，退出代码: ${code}`);
    process.exit(code);
  }
});

// 处理进程信号
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务...');
  app.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务...');
  app.kill('SIGINT');
}); 
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
  env: process.env
});

app.on('close', code => {
  if (code !== 0) {
    console.error(`服务异常退出，退出代码: ${code}`);
    process.exit(code);
  }
});

// 处理进程信号
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务...');
  app.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务...');
  app.kill('SIGINT');
}); 
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
  env: process.env
});

app.on('close', code => {
  if (code !== 0) {
    console.error(`服务异常退出，退出代码: ${code}`);
    process.exit(code);
  }
});

// 处理进程信号
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务...');
  app.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务...');
  app.kill('SIGINT');
}); 
 
 
 