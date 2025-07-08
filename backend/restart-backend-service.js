/**
 * 重启后端服务脚本
 * 确保使用最新的NLP规则
 */

import { spawn } from 'child_process';
import fetch from 'node-fetch';

const BACKEND_URL = 'http://localhost:3001';

async function restartBackendService() {
  console.log('🔄 重启后端服务以应用最新的NLP规则...');

  try {
    // 1. 检查当前服务状态
    console.log('\n1. 检查当前服务状态...');
    try {
      const response = await fetch(`${BACKEND_URL}/api/health`);
      if (response.ok) {
        console.log('✅ 后端服务当前正在运行');
      }
    } catch (error) {
      console.log('⚠️ 后端服务可能未运行');
    }

    // 2. 提示用户手动重启
    console.log('\n2. 请手动重启后端服务:');
    console.log('   在后端目录执行: npm run dev 或 node src/app.js');
    console.log('   或者在VSCode中重启调试会话');

    // 3. 等待服务重启
    console.log('\n3. 等待服务重启...');
    let serviceReady = false;
    let attempts = 0;
    const maxAttempts = 30; // 等待30秒

    while (!serviceReady && attempts < maxAttempts) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/health`);
        if (response.ok) {
          serviceReady = true;
          console.log('✅ 后端服务已重启并运行');
        }
      } catch (error) {
        // 服务还未准备好
      }
      
      if (!serviceReady) {
        attempts++;
        console.log(`⏳ 等待服务启动... (${attempts}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!serviceReady) {
      console.log('❌ 服务重启超时，请手动检查');
      return false;
    }

    // 4. 测试更新后的NLP规则
    console.log('\n4. 测试更新后的NLP规则...');
    
    const testResponse = await fetch(`${BACKEND_URL}/api/assistant/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '查询测试结果'
      })
    });

    if (!testResponse.ok) {
      console.log(`❌ 测试请求失败: ${testResponse.status}`);
      return false;
    }

    const testResult = await testResponse.json();
    
    if (testResult.data && testResult.data.length > 0) {
      const firstRecord = testResult.data[0];
      console.log('\n📋 测试结果分析:');
      console.log(`- 项目字段: ${firstRecord['项目']}`);
      console.log(`- 基线字段: ${firstRecord['基线']}`);
      
      // 检查项目字段格式
      const projectValue = firstRecord['项目'];
      if (projectValue && projectValue.match(/^[XSK][0-9A-Z]{3,5}$/)) {
        console.log('✅ 项目字段格式正确 (项目代码)');
      } else if (projectValue && projectValue.startsWith('MAT-')) {
        console.log('❌ 项目字段仍显示物料编码，需要进一步修正');
      } else {
        console.log(`⚠️ 项目字段格式异常: ${projectValue}`);
      }
      
      // 检查基线字段格式
      const baselineValue = firstRecord['基线'];
      if (baselineValue && baselineValue.match(/^I\d{4}$/)) {
        console.log('✅ 基线字段格式正确 (基线代码)');
      } else if (baselineValue && baselineValue.match(/^\d{6}$/)) {
        console.log('❌ 基线字段仍显示批次号，需要进一步修正');
      } else {
        console.log(`⚠️ 基线字段格式异常: ${baselineValue}`);
      }
    }

    console.log('\n🎉 后端服务重启完成！');
    console.log('\n📋 下一步:');
    console.log('1. 在前端测试NLP查询功能');
    console.log('2. 验证项目和基线字段是否正确显示');
    console.log('3. 如果仍有问题，检查数据库中的规则是否正确');

    return true;

  } catch (error) {
    console.error('❌ 重启过程中出现错误:', error);
    return false;
  }
}

// 执行重启
restartBackendService().catch(console.error);
