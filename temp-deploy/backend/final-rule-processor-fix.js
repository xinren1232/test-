import fs from 'fs';
import path from 'path';

/**
 * 最终修复规则处理器
 */
async function finalRuleProcessorFix() {
  try {
    console.log('🔧 开始最终修复规则处理器...');
    
    // 1. 修复规则路由处理器
    console.log('\n=== 1. 修复规则路由处理器 ===');
    
    const rulesRoutesPath = path.join(process.cwd(), 'src/routes/rulesRoutes.js');
    
    if (fs.existsSync(rulesRoutesPath)) {
      let rulesRoutesContent = fs.readFileSync(rulesRoutesPath, 'utf8');
      
      // 1.1 移除规则243的特殊处理
      console.log('  ✅ 移除规则243的特殊处理');
      
      // 查找规则243特殊处理代码块
      const rule243SpecialHandler = rulesRoutesContent.match(/\/\/ 特殊处理物料大类查询规则[\s\S]*?if\s*\(rule\.intent_name\s*===\s*['"]物料大类查询['"]\)[\s\S]*?return;[\s\S]*?\}/);
      
      if (rule243SpecialHandler) {
        // 移除规则243特殊处理代码块
        rulesRoutesContent = rulesRoutesContent.replace(rule243SpecialHandler[0], '    // 注意：物料大类查询规则已转换为memory_query类型，不再需要特殊处理');
      }
      
      // 1.2 修复内存查询处理逻辑
      console.log('  ✅ 修复内存查询处理逻辑');
      
      // 查找内存查询处理代码块
      const memoryQueryHandler = rulesRoutesContent.match(/if\s*\(rule\.action_type\s*===\s*['"]memory_query['"]\)[\s\S]*?return res\.json\(\{[\s\S]*?\}\);[\s\S]*?\}/);
      
      if (memoryQueryHandler) {
        // 替换内存查询处理代码块
        const newMemoryQueryHandler = `if (rule.action_type === 'memory_query') {
      console.log('📋 处理内存查询规则:', rule.intent_name);
      
      // 获取内存数据
      const memoryData = getRealInMemoryData();
      
      // 检查内存数据是否存在
      if (!memoryData || 
          (rule.action_target === 'inventory' && (!memoryData.inventory || memoryData.inventory.length === 0)) ||
          (rule.action_target === 'inspection' && (!memoryData.inspection || memoryData.inspection.length === 0)) ||
          (rule.action_target === 'production' && (!memoryData.production || memoryData.production.length === 0))) {
        return res.status(400).json({
          success: false,
          error: '内存数据不存在，请先生成并同步数据'
        });
      }
      
      // 根据规则的action_target选择数据源
      let dataSource = [];
      if (rule.action_target === 'inventory') {
        dataSource = memoryData.inventory;
      } else if (rule.action_target === 'inspection') {
        dataSource = memoryData.inspection;
      } else if (rule.action_target === 'production') {
        dataSource = memoryData.production;
      }
      
      // 限制返回数据量
      const results = dataSource.slice(0, 20);
      
      console.log('🔍 内存查询结果:', {
        ruleName: rule.intent_name,
        dataSource: rule.action_target,
        resultCount: results.length,
        hasTableData: Array.isArray(results)
      });
      
      // 特殊处理物料大类查询规则
      if (rule.intent_name === '物料大类查询') {
        // 过滤结构件类物料
        const structuralMaterials = results.filter(item => 
          ['中框', '侧键', '手机卡托', '电池盖', '装饰件'].includes(item.materialName)
        );
        
        // 转换为前端需要的格式
        const formattedResults = structuralMaterials.map(item => ({
          '工厂': item.factory,
          '仓库': item.storage_location || item.warehouse,
          '物料编码': item.materialCode,
          '物料名称': item.materialName,
          '供应商': item.supplier,
          '数量': item.quantity,
          '状态': item.status,
          '入库时间': new Date(item.inboundTime).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }).replace(/\\//g, '-'),
          '到期时间': new Date(item.lastUpdateTime).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }).replace(/\\//g, '-'),
          '备注': item.notes || item.materialName + '库存记录'
        }));
        
        return res.json({
          success: true,
          data: {
            ruleName: rule.intent_name,
            resultCount: formattedResults.length,
            fields: formattedResults.length > 0 ? Object.keys(formattedResults[0]) : [],
            sampleData: formattedResults.length > 0 ? formattedResults[0] : null,
            tableData: formattedResults,
            testParam: '结构件类',
            note: formattedResults.length > 0 ? \`返回 \${formattedResults.length} 条真实数据\` : '无数据返回'
          }
        });
      }
      
      return res.json({
        success: true,
        data: {
          ruleName: rule.intent_name,
          ruleType: rule.action_type,
          dataSource: rule.action_target,
          resultCount: results.length,
          tableData: results,
          note: \`从内存中返回 \${results.length} 条真实数据\`
        }
      });
    }`;
        
        rulesRoutesContent = rulesRoutesContent.replace(memoryQueryHandler[0], newMemoryQueryHandler);
      } else {
        console.log('  ⚠️ 未找到内存查询处理代码块，可能已经修复');
      }
      
      // 1.3 修复SQL查询处理逻辑
      console.log('  ✅ 修复SQL查询处理逻辑');
      
      // 查找SQL查询处理代码块
      const sqlQueryHandler = rulesRoutesContent.match(/try\s*\{[\s\S]*?const\s*\[\s*results\s*\]\s*=\s*await\s*connection\.execute\(\s*rule\.action_target[\s\S]*?\}/);
      
      if (sqlQueryHandler) {
        // 替换SQL查询处理代码块
        const newSqlQueryHandler = `try {
      // 检查是否是内存查询类型的规则
      if (rule.action_type === 'memory_query') {
        // 内存查询已在前面处理
        return;
      }
      
      // 处理SQL查询类型的规则
      console.log('📋 处理SQL查询规则:', rule.intent_name);
      console.log('执行测试SQL:', rule.action_target.substring(0, 100) + '...');
      
      // 执行SQL查询
      const [results] = await connection.execute(rule.action_target);`;
        
        rulesRoutesContent = rulesRoutesContent.replace(sqlQueryHandler[0], newSqlQueryHandler);
      }
      
      // 保存修改后的文件
      fs.writeFileSync(rulesRoutesPath, rulesRoutesContent);
      console.log('  ✅ 规则路由处理器修复完成');
    } else {
      console.log('  ❌ 未找到规则路由处理器文件');
    }
    
    // 2. 修复规则查询处理器
    console.log('\n=== 2. 修复规则查询处理器 ===');
    
    const assistantControllerPath = path.join(process.cwd(), 'src/controllers/assistantController.js');
    
    if (fs.existsSync(assistantControllerPath)) {
      let assistantControllerContent = fs.readFileSync(assistantControllerPath, 'utf8');
      
      // 查找处理查询的代码块
      const handleQueryBlock = assistantControllerContent.match(/const\s+handleQuery\s*=\s*async\s*\(\s*req\s*,\s*res\s*\)\s*=>\s*\{[\s\S]*?try\s*\{/);
      
      if (handleQueryBlock) {
        // 在处理查询的代码中添加内存查询处理逻辑
        const newHandleQueryBlock = handleQueryBlock[0] + `
    // 获取查询文本和匹配的规则
    const { query: queryText } = req.body;
    const matchedRule = await findMatchingRule(queryText);
    
    if (matchedRule && matchedRule.action_type === 'memory_query') {
      console.log('📋 处理内存查询规则:', matchedRule.intent_name);
      
      // 获取内存数据
      const memoryData = getRealInMemoryData();
      
      // 检查内存数据是否存在
      if (!memoryData || 
          (matchedRule.action_target === 'inventory' && (!memoryData.inventory || memoryData.inventory.length === 0)) ||
          (matchedRule.action_target === 'inspection' && (!memoryData.inspection || memoryData.inspection.length === 0)) ||
          (matchedRule.action_target === 'production' && (!memoryData.production || memoryData.production.length === 0))) {
        return res.json({
          success: false,
          error: '内存数据不存在，请先生成并同步数据'
        });
      }
      
      // 根据规则的action_target选择数据源
      let dataSource = [];
      if (matchedRule.action_target === 'inventory') {
        dataSource = memoryData.inventory;
      } else if (matchedRule.action_target === 'inspection') {
        dataSource = memoryData.inspection;
      } else if (matchedRule.action_target === 'production') {
        dataSource = memoryData.production;
      }
      
      // 限制返回数据量
      const results = dataSource.slice(0, 20);
      
      return res.json({
        success: true,
        data: {
          answer: \`找到 \${results.length} 条相关记录\`,
          tableData: results
        }
      });
    }`;
        
        // 更新文件内容
        assistantControllerContent = assistantControllerContent.replace(handleQueryBlock[0], newHandleQueryBlock);
        
        // 添加导入getRealInMemoryData函数
        if (!assistantControllerContent.includes('getRealInMemoryData')) {
          assistantControllerContent = assistantControllerContent.replace(
            /import.*?from.*?;/,
            `$&\nimport { getRealInMemoryData } from '../services/realDataAssistantService.js';`
          );
        }
        
        // 保存修改后的文件
        fs.writeFileSync(assistantControllerPath, assistantControllerContent);
        console.log('  ✅ 规则查询处理器修复完成');
      } else {
        console.log('  ❌ 未找到规则查询处理代码块');
      }
    } else {
      console.log('  ❌ 未找到规则查询处理器文件');
    }
    
    console.log('\n✅ 规则处理器最终修复完成!');
    console.log('\n🎯 下一步操作:');
    console.log('1. 重启后端服务');
    console.log('2. 在前端重新生成数据');
    console.log('3. 测试规则查询结果');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

finalRuleProcessorFix().catch(console.error);
