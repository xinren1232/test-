// 简单的后端启动脚本
console.log('🚀 启动后端服务...');

try {
  // 导入主应用
  const app = await import('./src/index.js');
  console.log('✅ 后端服务启动成功');
} catch (error) {
  console.error('❌ 后端服务启动失败:', error);
  process.exit(1);
}
