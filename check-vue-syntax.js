/**
 * 检查Vue文件语法错误
 */

import fs from 'fs';
import path from 'path';

function checkVueFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const errors = [];
    
    // 检查常见的语法错误
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineNum = i + 1;
      
      // 检查错误的结束标签
      if (line === '</script>' && i > 0) {
        const prevLine = lines[i - 1].trim();
        if (prevLine === '</style>') {
          errors.push({
            line: lineNum,
            error: '错误的</script>标签，应该删除',
            content: line
          });
        }
      }
      
      // 检查未闭合的标签
      if (line.includes('<template>') && !content.includes('</template>')) {
        errors.push({
          line: lineNum,
          error: '缺少</template>结束标签',
          content: line
        });
      }
      
      if (line.includes('<script') && !content.includes('</script>')) {
        errors.push({
          line: lineNum,
          error: '缺少</script>结束标签',
          content: line
        });
      }
      
      if (line.includes('<style') && !content.includes('</style>')) {
        errors.push({
          line: lineNum,
          error: '缺少</style>结束标签',
          content: line
        });
      }
    }
    
    return {
      file: filePath,
      errors,
      hasErrors: errors.length > 0
    };
    
  } catch (error) {
    return {
      file: filePath,
      errors: [{ line: 0, error: `文件读取失败: ${error.message}`, content: '' }],
      hasErrors: true
    };
  }
}

function findVueFiles(dir) {
  const vueFiles = [];
  
  function scanDir(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDir(fullPath);
        } else if (stat.isFile() && item.endsWith('.vue')) {
          vueFiles.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`无法扫描目录 ${currentDir}: ${error.message}`);
    }
  }
  
  scanDir(dir);
  return vueFiles;
}

function checkAllVueFiles() {
  console.log('🔍 检查Vue文件语法错误...\n');
  
  const srcDir = './ai-inspection-dashboard/src';
  const vueFiles = findVueFiles(srcDir);
  
  console.log(`📁 找到 ${vueFiles.length} 个Vue文件\n`);
  
  let totalErrors = 0;
  const problemFiles = [];
  
  for (const file of vueFiles) {
    const result = checkVueFile(file);
    
    if (result.hasErrors) {
      problemFiles.push(result);
      totalErrors += result.errors.length;
      
      console.log(`❌ ${path.relative(srcDir, file)}`);
      result.errors.forEach(error => {
        console.log(`   行 ${error.line}: ${error.error}`);
        if (error.content) {
          console.log(`   内容: ${error.content}`);
        }
      });
      console.log('');
    } else {
      console.log(`✅ ${path.relative(srcDir, file)}`);
    }
  }
  
  console.log(`\n📊 检查结果:`);
  console.log(`总文件数: ${vueFiles.length}`);
  console.log(`有问题的文件: ${problemFiles.length}`);
  console.log(`总错误数: ${totalErrors}`);
  
  if (problemFiles.length > 0) {
    console.log(`\n🔧 需要修复的文件:`);
    problemFiles.forEach(file => {
      console.log(`- ${path.relative(srcDir, file.file)} (${file.errors.length}个错误)`);
    });
  } else {
    console.log(`\n✅ 所有Vue文件语法正确！`);
  }
}

// 运行检查
checkAllVueFiles();
