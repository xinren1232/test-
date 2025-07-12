import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// IQE业务场景不合理的规则（库存管理类）
const INAPPROPRIATE_RULES = [
  '低库存预警',
  '高库存查询', 
  '今日入库物料',
  '本周入库统计',
  '库存状态查询',
  '正常物料查询',
  '风险库存查询',
  '风险物料查询',
  '工厂库存查询',
  '物料库存查询',
  '物料库存信息查询',
  '供应商库存查询',
  '批次库存信息查询',
  '物料大类别库存风险分析'
];

// 可能重复的规则组
const POTENTIAL_DUPLICATES = [
  {
    group: '物料查询类',
    rules: ['物料库存查询', '物料库存信息查询', '物料相关查询', '物料系列查询']
  },
  {
    group: '供应商查询类', 
    rules: ['供应商物料查询', '供应商库存查询', '供应商测试情况查询', '供应商上线情况查询']
  },
  {
    group: '批次查询类',
    rules: ['批次信息查询', '批次库存信息查询', '批次测试情况查询', '批次上线情况查询', '批次质量追踪']
  },
  {
    group: '在线跟踪类',
    rules: ['在线跟踪查询', '在线跟踪相关查询', '物料上线情况查询']
  },
  {
    group: '测试结果类',
    rules: ['NG测试结果查询', '测试NG情况查询', '今日测试结果', '测试通过率统计']
  },
  {
    group: '物料分类查询',
    rules: ['充电类物料查询', '光学类物料查询', '包材类物料查询', '声学类物料查询', '结构件类物料查询']
  }
];

async function checkDuplicateRules() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 检查规则重复和业务合理性...\n');
    
    // 获取所有规则
    const [rules] = await connection.execute('SELECT * FROM nlp_intent_rules ORDER BY intent_name');
    
    console.log(`📊 当前总规则数: ${rules.length}条\n`);
    
    // 1. 检查不合理的规则
    console.log('❌ 不符合IQE业务场景的规则 (建议删除):');
    const inappropriateFound = [];
    rules.forEach(rule => {
      if (INAPPROPRIATE_RULES.includes(rule.intent_name)) {
        inappropriateFound.push(rule);
        console.log(`  - ${rule.intent_name}: ${rule.description}`);
      }
    });
    console.log(`  共找到 ${inappropriateFound.length} 条不合理规则\n`);
    
    // 2. 检查重复规则
    console.log('🔄 可能重复的规则组:');
    let totalDuplicates = 0;
    
    POTENTIAL_DUPLICATES.forEach(group => {
      console.log(`\n📋 ${group.group}:`);
      const foundRules = [];
      
      group.rules.forEach(ruleName => {
        const rule = rules.find(r => r.intent_name === ruleName);
        if (rule) {
          foundRules.push(rule);
          console.log(`  - ${rule.intent_name}: ${rule.description}`);
        }
      });
      
      if (foundRules.length > 1) {
        console.log(`  ⚠️  该组有 ${foundRules.length} 条规则，可能存在重复`);
        totalDuplicates += foundRules.length - 1; // 减1是因为保留一条
      }
    });
    
    // 3. 分析规则描述相似度
    console.log('\n🔍 描述相似的规则:');
    const similarRules = [];
    for (let i = 0; i < rules.length; i++) {
      for (let j = i + 1; j < rules.length; j++) {
        const rule1 = rules[i];
        const rule2 = rules[j];
        
        // 简单的相似度检查
        const desc1 = rule1.description.toLowerCase();
        const desc2 = rule2.description.toLowerCase();
        
        if (desc1.includes('查询') && desc2.includes('查询')) {
          const commonWords = ['物料', '供应商', '批次', '测试', '库存', '上线'];
          let commonCount = 0;
          commonWords.forEach(word => {
            if (desc1.includes(word) && desc2.includes(word)) {
              commonCount++;
            }
          });
          
          if (commonCount >= 2) {
            similarRules.push([rule1, rule2]);
            console.log(`  - "${rule1.intent_name}" vs "${rule2.intent_name}"`);
            console.log(`    ${rule1.description}`);
            console.log(`    ${rule2.description}`);
            console.log('');
          }
        }
      }
    }
    
    // 4. 统计分析
    console.log('\n📈 规则分类统计:');
    const categories = {};
    rules.forEach(rule => {
      const desc = rule.description;
      let category = '其他';
      
      if (desc.includes('库存')) category = '库存管理';
      else if (desc.includes('测试')) category = '测试管理';
      else if (desc.includes('上线') || desc.includes('跟踪')) category = '上线跟踪';
      else if (desc.includes('供应商')) category = '供应商管理';
      else if (desc.includes('批次')) category = '批次管理';
      else if (desc.includes('物料')) category = '物料管理';
      else if (desc.includes('分析') || desc.includes('统计')) category = '数据分析';
      
      if (!categories[category]) categories[category] = [];
      categories[category].push(rule.intent_name);
    });
    
    Object.keys(categories).forEach(category => {
      console.log(`  ${category}: ${categories[category].length}条`);
      categories[category].forEach(ruleName => {
        console.log(`    - ${ruleName}`);
      });
      console.log('');
    });
    
    // 5. 建议删除的规则汇总
    console.log('🗑️  建议删除的规则汇总:');
    console.log('\n1. 不符合IQE业务场景 (库存管理类):');
    inappropriateFound.forEach(rule => {
      console.log(`   DELETE: ${rule.intent_name}`);
    });
    
    console.log('\n2. 重复规则建议 (保留功能最全面的一条):');
    POTENTIAL_DUPLICATES.forEach(group => {
      const foundRules = group.rules.filter(ruleName => 
        rules.find(r => r.intent_name === ruleName)
      );
      if (foundRules.length > 1) {
        console.log(`   ${group.group}组 - 保留1条，删除${foundRules.length - 1}条:`);
        foundRules.slice(1).forEach(ruleName => {
          console.log(`     DELETE: ${ruleName}`);
        });
      }
    });
    
    const totalToDelete = inappropriateFound.length + totalDuplicates;
    console.log(`\n📊 删除统计:`);
    console.log(`   不合理规则: ${inappropriateFound.length}条`);
    console.log(`   重复规则: ${totalDuplicates}条`);
    console.log(`   建议删除总数: ${totalToDelete}条`);
    console.log(`   删除后剩余: ${rules.length - totalToDelete}条`);
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await connection.end();
  }
}

checkDuplicateRules();
