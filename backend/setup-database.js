/**
 * 数据库设置脚本
 * 初始化数据库表和意图规则数据
 */

import { initIntentRules } from './src/scripts/initIntentRules.js';
import { logger } from './src/utils/logger.js';
import initializeDatabase from './src/models/index.js';

async function setupDatabase() {
  try {
    logger.info('🚀 开始设置数据库...');
    
    // 1. 初始化数据库连接和表结构
    logger.info('📊 初始化数据库连接...');
    const db = await initializeDatabase();
    logger.info('✅ 数据库连接成功');
    
    // 2. 同步数据库表结构
    logger.info('🔄 同步数据库表结构...');
    await db.sequelize.sync({ force: false }); // 不强制重建表
    logger.info('✅ 数据库表结构同步完成');
    
    // 3. 初始化意图规则
    logger.info('🧠 初始化意图规则...');
    await initIntentRules();
    logger.info('✅ 意图规则初始化完成');
    
    logger.info('🎉 数据库设置完成！');
    
  } catch (error) {
    logger.error('❌ 数据库设置失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase()
    .then(() => {
      logger.info('🎉 数据库设置成功完成');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ 数据库设置失败:', error);
      process.exit(1);
    });
}

export { setupDatabase };
