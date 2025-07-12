import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 期望的规则结构定义
const EXPECTED_RULE_STRUCTURE = {
  // 库存场景（4类）
  inventory: {
    name: '库存查询',
    expected_rules: [
      '物料库存查询',
      '供应商库存查询', 
      '批次库存信息查询',
      '库存状态查询（风险、冻结物料）'
    ],
    required_fields: ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注']
  },
  
  // 上线数据（5类）
  online: {
    name: '上线跟踪',
    expected_rules: [
      '物料上线情况查询',
      '供应商上线情况查询',
      '批次上线情况查询', 
      '项目物料不良查询',
      '基线物料不良查询'
    ],
    required_fields: ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '本周异常', '检验日期', '备注']
  },
  
  // 测试场景（6类）
  testing: {
    name: '测试查询',
    expected_rules: [
      '物料测试情况查询',
      '供应商测试情况查询',
      '测试NG情况查询',
      '项目测试情况查询',
      '基线测试情况查询',
      '批次测试情况查询'
    ],
    required_fields: ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注']
  },
  
  // 物料大类（5类 × 3场景 = 15类）
  material_categories: {
    name: '物料大类查询',
    categories: ['结构件类', '光学类', '充电类', '声学类', '包装类'],
    scenarios: ['库存查询', '上线情况查询', '测试情况查询'],
    expected_count: 15
  }
};

async function comprehensiveRuleAudit() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 开始全面规则库检查...\n');
    
    // 1. 基础统计
    console.log('📊 基础统计信息:');
    const [totalRules] = await connection.execute(
      'SELECT COUNT(*) as total, COUNT(CASE WHEN status = "active" THEN 1 END) as active FROM nlp_intent_rules'
    );
    console.log(`总规则数: ${totalRules[0].total}条`);
    console.log(`活跃规则数: ${totalRules[0].active}条`);
    
    // 2. 分类统计
    console.log('\n📋 分类统计:');
    const [categoryStats] = await connection.execute(`
      SELECT category, COUNT(*) as count 
      FROM nlp_intent_rules 
      WHERE status = 'active'
      GROUP BY category
      ORDER BY count DESC
    `);
    
    categoryStats.forEach((stat, index) => {
      console.log(`${index + 1}. ${stat.category}: ${stat.count}条`);
    });
    
    // 3. 功能完整性检查
    console.log('\n🎯 功能完整性检查:');
    
    // 检查库存场景规则
    console.log('\n📦 库存场景规则检查:');
    const [inventoryRules] = await connection.execute(`
      SELECT intent_name, description 
      FROM nlp_intent_rules 
      WHERE category IN ('库存查询') AND status = 'active'
      ORDER BY intent_name
    `);
    
    console.log(`找到 ${inventoryRules.length} 条库存规则:`);
    inventoryRules.forEach((rule, index) => {
      console.log(`  ${index + 1}. ${rule.intent_name}`);
    });
    
    // 检查上线场景规则
    console.log('\n🔄 上线跟踪规则检查:');
    const [onlineRules] = await connection.execute(`
      SELECT intent_name, description 
      FROM nlp_intent_rules 
      WHERE category IN ('上线跟踪') AND status = 'active'
      ORDER BY intent_name
    `);
    
    console.log(`找到 ${onlineRules.length} 条上线规则:`);
    onlineRules.forEach((rule, index) => {
      console.log(`  ${index + 1}. ${rule.intent_name}`);
    });
    
    // 检查测试场景规则
    console.log('\n🧪 测试场景规则检查:');
    const [testingRules] = await connection.execute(`
      SELECT intent_name, description 
      FROM nlp_intent_rules 
      WHERE category IN ('测试查询') AND status = 'active'
      ORDER BY intent_name
    `);
    
    console.log(`找到 ${testingRules.length} 条测试规则:`);
    testingRules.forEach((rule, index) => {
      console.log(`  ${index + 1}. ${rule.intent_name}`);
    });
    
    // 检查物料大类规则
    console.log('\n🏷️ 物料大类规则检查:');
    const [materialCategoryRules] = await connection.execute(`
      SELECT intent_name, description 
      FROM nlp_intent_rules 
      WHERE category = '物料大类查询' AND status = 'active'
      ORDER BY intent_name
    `);
    
    console.log(`找到 ${materialCategoryRules.length} 条物料大类规则:`);
    materialCategoryRules.forEach((rule, index) => {
      console.log(`  ${index + 1}. ${rule.intent_name}`);
    });
    
    // 4. 呈现形式检查
    console.log('\n📝 呈现形式规范性检查:');
    
    // 检查字段映射一致性
    const [fieldMappingIssues] = await connection.execute(`
      SELECT intent_name, category, action_target
      FROM nlp_intent_rules 
      WHERE status = 'active' AND action_type = 'SQL_QUERY'
    `);
    
    let fieldIssues = [];
    let presentationIssues = [];
    
    fieldMappingIssues.forEach(rule => {
      const sql = rule.action_target;
      
      // 检查库存规则字段
      if (rule.category === '库存查询') {
        const requiredFields = EXPECTED_RULE_STRUCTURE.inventory.required_fields;
        const missingFields = requiredFields.filter(field => 
          !sql.includes(`as ${field}`) && !sql.includes(`AS ${field}`)
        );
        if (missingFields.length > 0) {
          fieldIssues.push(`${rule.intent_name}: 缺失字段 ${missingFields.join(', ')}`);
        }
      }
      
      // 检查上线规则字段
      if (rule.category === '上线跟踪') {
        const requiredFields = EXPECTED_RULE_STRUCTURE.online.required_fields;
        const missingFields = requiredFields.filter(field => 
          !sql.includes(`as ${field}`) && !sql.includes(`AS ${field}`)
        );
        if (missingFields.length > 0) {
          fieldIssues.push(`${rule.intent_name}: 缺失字段 ${missingFields.join(', ')}`);
        }
      }
      
      // 检查测试规则字段
      if (rule.category === '测试查询') {
        const requiredFields = EXPECTED_RULE_STRUCTURE.testing.required_fields;
        const missingFields = requiredFields.filter(field => 
          !sql.includes(`as ${field}`) && !sql.includes(`AS ${field}`)
        );
        if (missingFields.length > 0) {
          fieldIssues.push(`${rule.intent_name}: 缺失字段 ${missingFields.join(', ')}`);
        }
      }
      
      // 检查呈现形式问题
      if (!sql.includes('LIMIT')) {
        presentationIssues.push(`${rule.intent_name}: 缺少LIMIT限制`);
      }
      
      if (!sql.includes('ORDER BY')) {
        presentationIssues.push(`${rule.intent_name}: 缺少ORDER BY排序`);
      }
    });
    
    if (fieldIssues.length > 0) {
      console.log('\n❌ 字段映射问题:');
      fieldIssues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
    } else {
      console.log('✅ 字段映射检查通过');
    }
    
    if (presentationIssues.length > 0) {
      console.log('\n❌ 呈现形式问题:');
      presentationIssues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
    } else {
      console.log('✅ 呈现形式检查通过');
    }
    
    // 5. 重复设计检查
    console.log('\n🔄 重复设计检查:');
    
    // 检查重复的规则名称
    const [duplicateNames] = await connection.execute(`
      SELECT intent_name, COUNT(*) as count
      FROM nlp_intent_rules 
      WHERE status = 'active'
      GROUP BY intent_name
      HAVING count > 1
    `);
    
    if (duplicateNames.length > 0) {
      console.log('❌ 发现重复规则名称:');
      duplicateNames.forEach((dup, index) => {
        console.log(`  ${index + 1}. ${dup.intent_name} (${dup.count}条)`);
      });
    } else {
      console.log('✅ 无重复规则名称');
    }
    
    // 检查相似的触发词
    const [triggerWords] = await connection.execute(`
      SELECT intent_name, trigger_words
      FROM nlp_intent_rules 
      WHERE status = 'active' AND trigger_words IS NOT NULL
    `);
    
    let triggerConflicts = [];
    for (let i = 0; i < triggerWords.length; i++) {
      for (let j = i + 1; j < triggerWords.length; j++) {
        try {
          const words1 = JSON.parse(triggerWords[i].trigger_words);
          const words2 = JSON.parse(triggerWords[j].trigger_words);
          const overlap = words1.filter(word => words2.includes(word));
          if (overlap.length > 0) {
            triggerConflicts.push({
              rule1: triggerWords[i].intent_name,
              rule2: triggerWords[j].intent_name,
              overlap: overlap
            });
          }
        } catch (e) {
          // 忽略JSON解析错误
        }
      }
    }
    
    if (triggerConflicts.length > 0) {
      console.log('\n⚠️ 触发词重叠情况:');
      triggerConflicts.slice(0, 5).forEach((conflict, index) => {
        console.log(`  ${index + 1}. ${conflict.rule1} ↔ ${conflict.rule2}: ${conflict.overlap.join(', ')}`);
      });
      if (triggerConflicts.length > 5) {
        console.log(`  ... 还有 ${triggerConflicts.length - 5} 个重叠情况`);
      }
    } else {
      console.log('✅ 无明显触发词冲突');
    }
    
    // 6. 总结报告
    console.log('\n📋 检查总结:');
    console.log(`✅ 规则总数: ${totalRules[0].active}条`);
    console.log(`✅ 覆盖场景: 库存(${inventoryRules.length})、上线(${onlineRules.length})、测试(${testingRules.length})、物料大类(${materialCategoryRules.length})`);
    console.log(`${fieldIssues.length === 0 ? '✅' : '❌'} 字段映射: ${fieldIssues.length === 0 ? '完整' : fieldIssues.length + '个问题'}`);
    console.log(`${presentationIssues.length === 0 ? '✅' : '❌'} 呈现形式: ${presentationIssues.length === 0 ? '规范' : presentationIssues.length + '个问题'}`);
    console.log(`${duplicateNames.length === 0 ? '✅' : '❌'} 重复设计: ${duplicateNames.length === 0 ? '无重复' : duplicateNames.length + '个重复'}`);
    
    console.log('\n🎯 优化建议:');
    if (fieldIssues.length > 0 || presentationIssues.length > 0 || duplicateNames.length > 0) {
      console.log('1. 修复上述发现的问题');
      console.log('2. 统一规则命名规范');
      console.log('3. 优化触发词设计，减少冲突');
    } else {
      console.log('1. 规则库质量良好，可以进行实际测试');
      console.log('2. 建议在智能问答页面进行功能验证');
      console.log('3. 根据用户反馈进一步优化规则');
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await connection.end();
  }
}

comprehensiveRuleAudit().catch(console.error);
