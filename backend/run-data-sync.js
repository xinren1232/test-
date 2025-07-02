/**
 * 运行数据同步
 */
import frontendDataService from './src/services/frontendDataService.js';

async function runSync() {
  try {
    console.log('🚀 开始数据同步...');
    const result = await frontendDataService.performFullSync();
    console.log('✅ 同步结果:', result);
  } catch (error) {
    console.error('❌ 同步失败:', error);
  }
}

runSync();
