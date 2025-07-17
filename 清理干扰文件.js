/**
 * IQE项目干扰文件清理脚本
 * 安全地删除可能干扰数据流解析的文件
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置清理级别
const CLEANUP_LEVELS = {
  SAFE: 'safe',        // 安全删除 - 测试、调试、临时文件
  MODERATE: 'moderate', // 中等风险 - 重复文件、旧版本
  CAREFUL: 'careful'   // 需谨慎 - 可能有用的文件
};

// 定义要清理的文件和目录
const CLEANUP_CONFIG = {
  [CLEANUP_LEVELS.SAFE]: {
    // 根目录测试文件
    files: [
      'test-data-sync-fix.js',
      'test-debug-query.js', 
      'test-chart-generation.js',
      'test-final-fix.js',
      'test-ai-assistant-functionality.js',
      'test-chart-tool-system.js',
      'test-chinese-encoding.js',
      'test-clean-rules.js',
      'test-complete-qa-system.js',
      'test-current-qa-system.js',
      'test-data-sync-fix.js',
      'test-enhanced-ai-assistant.js',
      'test-factory-query-fix.js',
      'test-final-optimized-rules.js',
      'test-fixed-rules-simple.js',
      'test-frontend-api-call.js',
      'test-frontend-backend-integration.js',
      'test-integrated-analysis.js',
      'test-intent-service-direct.js',
      'test-multi-step-ai.js',
      'test-ng-query.js',
      'test-optimized-ai.js',
      'test-qa-after-sync.js',
      'test-qa-functionality.js',
      'test-query-analysis.js',
      'test-real-data-qa.js',
      'test-rule-functionality.js',
      'test-simple-query.js',
      'test-updated-rules.js',
      'simple-test.js',
      'simple-integration-test.js',
      'simple-data-sync-test.js',
      'quick-test-fixed-rules.js'
    ],
    // 临时目录
    directories: [
      'temp',
      'temp_edit'
    ],
    // Backend测试文件模式
    backendPatterns: [
      'test-*.js',
      'debug-*.js',
      'check-*.js'
    ],
    // Frontend临时目录
    frontendDirectories: [
      'ai-inspection-dashboard/temp',
      'ai-inspection-dashboard/tmp',
      'ai-inspection-dashboard/backup',
      'ai-inspection-dashboard/backups',
      'ai-inspection-dashboard/dist-backup'
    ]
  },
  
  [CLEANUP_LEVELS.MODERATE]: {
    files: [
      // 重复规则处理文件
      'backend/clean-duplicate-unreasonable-rules.js',
      'backend/delete-inappropriate-rules.js', 
      'backend/fix-duplicate-examples.js',
      'backend/fix-remaining-duplicates.js',
      // 过时的修复文件
      'backend/fix-*.js'
    ],
    // 过时的报告文件
    reports: [
      '*.md'  // 需要手动筛选保留重要文档
    ]
  }
};

class FileCleanup {
  constructor() {
    this.deletedFiles = [];
    this.deletedDirs = [];
    this.errors = [];
    this.dryRun = true; // 默认为预览模式
  }

  /**
   * 设置运行模式
   * @param {boolean} dryRun - true为预览模式，false为实际删除
   */
  setDryRun(dryRun) {
    this.dryRun = dryRun;
  }

  /**
   * 安全删除文件
   * @param {string} filePath - 文件路径
   */
  safeDeleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        if (this.dryRun) {
          console.log(`[预览] 将删除文件: ${filePath}`);
          this.deletedFiles.push(filePath);
        } else {
          fs.unlinkSync(filePath);
          console.log(`✅ 已删除文件: ${filePath}`);
          this.deletedFiles.push(filePath);
        }
      }
    } catch (error) {
      console.error(`❌ 删除文件失败: ${filePath} - ${error.message}`);
      this.errors.push({ file: filePath, error: error.message });
    }
  }

  /**
   * 安全删除目录
   * @param {string} dirPath - 目录路径
   */
  safeDeleteDirectory(dirPath) {
    try {
      if (fs.existsSync(dirPath)) {
        if (this.dryRun) {
          console.log(`[预览] 将删除目录: ${dirPath}`);
          this.deletedDirs.push(dirPath);
        } else {
          fs.rmSync(dirPath, { recursive: true, force: true });
          console.log(`✅ 已删除目录: ${dirPath}`);
          this.deletedDirs.push(dirPath);
        }
      }
    } catch (error) {
      console.error(`❌ 删除目录失败: ${dirPath} - ${error.message}`);
      this.errors.push({ dir: dirPath, error: error.message });
    }
  }

  /**
   * 根据模式匹配删除文件
   * @param {string} directory - 目录路径
   * @param {string} pattern - 文件模式 (如 'test-*.js')
   */
  deleteByPattern(directory, pattern) {
    try {
      if (!fs.existsSync(directory)) return;

      const files = fs.readdirSync(directory);
      const regex = new RegExp(pattern.replace('*', '.*'));

      files.forEach(file => {
        if (regex.test(file)) {
          const filePath = path.join(directory, file);
          this.safeDeleteFile(filePath);
        }
      });
    } catch (error) {
      console.error(`❌ 模式匹配删除失败: ${directory}/${pattern} - ${error.message}`);
      this.errors.push({ pattern: `${directory}/${pattern}`, error: error.message });
    }
  }

  /**
   * 执行安全级别清理
   */
  cleanupSafeFiles() {
    console.log('\n🧹 开始安全级别清理...');
    const config = CLEANUP_CONFIG[CLEANUP_LEVELS.SAFE];

    // 删除根目录文件
    config.files.forEach(file => {
      this.safeDeleteFile(file);
    });

    // 删除临时目录
    config.directories.forEach(dir => {
      this.safeDeleteDirectory(dir);
    });

    // 删除Backend测试文件
    config.backendPatterns.forEach(pattern => {
      this.deleteByPattern('backend', pattern);
    });

    // 删除Frontend临时目录
    config.frontendDirectories.forEach(dir => {
      this.safeDeleteDirectory(dir);
    });
  }

  /**
   * 执行中等风险清理
   */
  cleanupModerateFiles() {
    console.log('\n⚠️ 开始中等风险清理...');
    const config = CLEANUP_CONFIG[CLEANUP_LEVELS.MODERATE];

    config.files.forEach(file => {
      this.safeDeleteFile(file);
    });
  }

  /**
   * 生成清理报告
   */
  generateReport() {
    console.log('\n📊 清理报告:');
    console.log(`删除文件数: ${this.deletedFiles.length}`);
    console.log(`删除目录数: ${this.deletedDirs.length}`);
    console.log(`错误数: ${this.errors.length}`);

    if (this.errors.length > 0) {
      console.log('\n❌ 错误详情:');
      this.errors.forEach(error => {
        console.log(`  ${error.file || error.dir || error.pattern}: ${error.error}`);
      });
    }

    // 保存详细报告
    const report = {
      timestamp: new Date().toISOString(),
      dryRun: this.dryRun,
      deletedFiles: this.deletedFiles,
      deletedDirectories: this.deletedDirs,
      errors: this.errors
    };

    const reportPath = `cleanup-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📋 详细报告已保存: ${reportPath}`);
  }

  /**
   * 执行完整清理
   * @param {string} level - 清理级别
   */
  async cleanup(level = CLEANUP_LEVELS.SAFE) {
    console.log(`🚀 开始清理 (${this.dryRun ? '预览模式' : '实际删除'})...`);
    console.log(`清理级别: ${level}`);

    switch (level) {
      case CLEANUP_LEVELS.SAFE:
        this.cleanupSafeFiles();
        break;
      case CLEANUP_LEVELS.MODERATE:
        this.cleanupSafeFiles();
        this.cleanupModerateFiles();
        break;
      default:
        console.log('❌ 未知的清理级别');
        return;
    }

    this.generateReport();
    
    if (this.dryRun) {
      console.log('\n💡 这是预览模式，没有实际删除文件');
      console.log('要执行实际删除，请运行: node 清理干扰文件.js --execute');
    } else {
      console.log('\n✅ 清理完成！');
    }
  }
}

// 主函数
async function main() {
  const cleanup = new FileCleanup();
  
  // 检查命令行参数
  const args = process.argv.slice(2);
  const executeMode = args.includes('--execute');
  const level = args.includes('--moderate') ? CLEANUP_LEVELS.MODERATE : CLEANUP_LEVELS.SAFE;
  
  cleanup.setDryRun(!executeMode);
  
  console.log('🧹 IQE项目干扰文件清理工具');
  console.log('================================');
  
  if (!executeMode) {
    console.log('⚠️ 当前为预览模式，不会实际删除文件');
    console.log('要执行实际删除，请添加 --execute 参数');
  }
  
  await cleanup.cleanup(level);
}

// 运行清理
main().catch(console.error);

export default FileCleanup;
