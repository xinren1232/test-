import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 规则分类定义
const RULE_CATEGORIES = {
  '基础查询': {
    '库存查询': ['物料库存查询', '供应商库存查询', '批次库存信息查询', '库存状态查询'],
    '上线查询': ['物料上线情况查询', '供应商上线情况查询', '批次上线情况查询', '项目物料不良查询'],
    '测试查询': ['物料测试情况查询', '供应商测试情况查询', '测试NG情况查询', '项目测试情况查询', '基线测试情况查询', '基线物料不良查询', '批次测试情况查询']
  },
  '进阶查询': {
    '综合分析': ['批次信息查询'],
    '排行统计': ['物料上线Top不良', '物料测试Top不良']
  },
  '对比分析': {
    '多维对比': ['供应商对比分析', '物料对比分析']
  },
  '专项分析': {
    '质量分析': ['供应商质量评级', '光学类显示缺陷专项分析', '结构件类深度不良分析', '大类别Top不良分析', '重复缺陷分析'],
    '趋势分析': ['物料大类别月度质量趋势', '物料大类别质量对比'],
    '异常分析': ['异常批次识别']
  },
  '统计报表': {
    '汇总统计': ['本月测试汇总'],
    '分类统计': ['物料大类查询', '光学类供应商质量排行', '结构件类供应商质量排行']
  },
  '物料专项': {
    '特定物料': ['充电类物料查询', '包装盒物料查询', '电池物料查询']
  },
  '其他': {
    '综合查询': ['NG测试结果查询', '供应商物料查询', '在线跟踪查询', '物料相关查询']
  }
};

async function checkAndClassifyRules() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 统一检查并分类所有规则...\n');
    
    // 获取所有规则
    const [rules] = await connection.execute(`
      SELECT 
        intent_name, 
        description, 
        category, 
        status,
        action_type,
        example_query,
        created_at,
        updated_at
      FROM nlp_intent_rules 
      ORDER BY intent_name
    `);
    
    console.log(`📊 当前规则总数: ${rules.length}条\n`);
    
    // 按分类整理规则
    const classifiedRules = {};
    const unclassifiedRules = [];
    
    // 初始化分类结构
    Object.keys(RULE_CATEGORIES).forEach(mainCategory => {
      classifiedRules[mainCategory] = {};
      Object.keys(RULE_CATEGORIES[mainCategory]).forEach(subCategory => {
        classifiedRules[mainCategory][subCategory] = [];
      });
    });
    
    // 分类规则
    rules.forEach(rule => {
      let classified = false;
      
      for (const mainCategory of Object.keys(RULE_CATEGORIES)) {
        for (const subCategory of Object.keys(RULE_CATEGORIES[mainCategory])) {
          if (RULE_CATEGORIES[mainCategory][subCategory].includes(rule.intent_name)) {
            classifiedRules[mainCategory][subCategory].push(rule);
            classified = true;
            break;
          }
        }
        if (classified) break;
      }
      
      if (!classified) {
        unclassifiedRules.push(rule);
      }
    });
    
    // 显示分类结果
    console.log('📋 规则分类结果:\n');
    
    Object.keys(classifiedRules).forEach(mainCategory => {
      console.log(`🔸 ${mainCategory}`);
      
      Object.keys(classifiedRules[mainCategory]).forEach(subCategory => {
        const categoryRules = classifiedRules[mainCategory][subCategory];
        if (categoryRules.length > 0) {
          console.log(`  📂 ${subCategory} (${categoryRules.length}条)`);
          
          categoryRules.forEach(rule => {
            const statusIcon = rule.status === 'active' ? '✅' : '❌';
            console.log(`    ${statusIcon} ${rule.intent_name}`);
            console.log(`       描述: ${rule.description}`);
            console.log(`       分类: ${rule.category || '未分类'}`);
            console.log(`       示例: ${rule.example_query || '无'}`);
            console.log('');
          });
        }
      });
      console.log('');
    });
    
    // 显示未分类规则
    if (unclassifiedRules.length > 0) {
      console.log('🔸 未分类规则');
      console.log(`  📂 其他 (${unclassifiedRules.length}条)`);
      
      unclassifiedRules.forEach(rule => {
        const statusIcon = rule.status === 'active' ? '✅' : '❌';
        console.log(`    ${statusIcon} ${rule.intent_name}`);
        console.log(`       描述: ${rule.description}`);
        console.log(`       分类: ${rule.category || '未分类'}`);
        console.log('');
      });
    }
    
    // 统计分析
    console.log('📈 分类统计:');
    let totalClassified = 0;
    
    Object.keys(classifiedRules).forEach(mainCategory => {
      let categoryTotal = 0;
      Object.keys(classifiedRules[mainCategory]).forEach(subCategory => {
        categoryTotal += classifiedRules[mainCategory][subCategory].length;
      });
      
      if (categoryTotal > 0) {
        console.log(`  ${mainCategory}: ${categoryTotal}条`);
        totalClassified += categoryTotal;
      }
    });
    
    console.log(`  未分类: ${unclassifiedRules.length}条`);
    console.log(`  总计: ${totalClassified + unclassifiedRules.length}条\n`);
    
    // 状态统计
    const activeRules = rules.filter(r => r.status === 'active').length;
    const inactiveRules = rules.filter(r => r.status !== 'active').length;
    
    console.log('📊 状态统计:');
    console.log(`  ✅ 活跃规则: ${activeRules}条`);
    console.log(`  ❌ 非活跃规则: ${inactiveRules}条\n`);
    
    // 检查规则完整性
    console.log('🔍 规则完整性检查:');
    
    const missingRules = [];
    Object.keys(RULE_CATEGORIES).forEach(mainCategory => {
      Object.keys(RULE_CATEGORIES[mainCategory]).forEach(subCategory => {
        RULE_CATEGORIES[mainCategory][subCategory].forEach(expectedRule => {
          const found = rules.find(r => r.intent_name === expectedRule);
          if (!found) {
            missingRules.push(`${mainCategory} > ${subCategory} > ${expectedRule}`);
          }
        });
      });
    });
    
    if (missingRules.length > 0) {
      console.log('  ❌ 缺失规则:');
      missingRules.forEach(missing => {
        console.log(`    - ${missing}`);
      });
    } else {
      console.log('  ✅ 所有预期规则都已存在');
    }
    
    // 建议优化
    console.log('\n💡 优化建议:');
    
    // 检查描述为空的规则
    const emptyDescRules = rules.filter(r => !r.description || r.description.trim() === '');
    if (emptyDescRules.length > 0) {
      console.log(`  📝 ${emptyDescRules.length}条规则缺少描述`);
    }
    
    // 检查示例为空的规则
    const emptyExampleRules = rules.filter(r => !r.example_query || r.example_query.trim() === '');
    if (emptyExampleRules.length > 0) {
      console.log(`  💬 ${emptyExampleRules.length}条规则缺少示例查询`);
    }
    
    // 检查分类为空的规则
    const emptyCategoryRules = rules.filter(r => !r.category || r.category.trim() === '' || r.category === '未分类');
    if (emptyCategoryRules.length > 0) {
      console.log(`  🏷️  ${emptyCategoryRules.length}条规则需要更新分类标签`);
    }
    
    console.log('\n🎉 规则检查和分类完成！');
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await connection.end();
  }
}

checkAndClassifyRules();
