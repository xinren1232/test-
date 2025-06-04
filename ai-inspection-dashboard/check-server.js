// 检查服务器状态并获取访问URL
import { networkInterfaces } from 'os';

console.log('检查开发服务器状态...');
console.log('前端应该可通过以下地址访问:');
console.log('本地访问: http://localhost:5173/');

// 获取本机IP地址以便局域网访问
const nets = networkInterfaces();
const results = {};

for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    // 跳过内部IP
    if (net.family === 'IPv4' && !net.internal) {
      if (!results[name]) {
        results[name] = [];
      }
      results[name].push(net.address);
    }
  }
}

// 输出所有可能的网络访问地址
console.log('\n网络访问:');
for (const [key, value] of Object.entries(results)) {
  if (value.length > 0) {
    value.forEach(ip => {
      console.log(`http://${ip}:5173/`);
    });
  }
}

// 常见故障排查提示
console.log('\n如果无法访问，请检查:');
console.log('1. 防火墙设置是否阻止了端口5173');
console.log('2. 项目依赖是否正确安装 (npm install)');
console.log('3. 端口5173是否被其他程序占用'); 