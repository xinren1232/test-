/**
 * 基于真实数据重新构建智能问答规则
 */

const rebuildRulesWithRealData = async () => {
  console.log('🔧 基于真实数据重新构建规则...');
  
  // 基于您的真实数据定义新的规则集
  const newRules = [
    {
      intent_name: 'factory_inventory_query',
      description: '工厂库存查询',
      action_type: 'MEMORY_QUERY',
      action_target: 'inventory',
      parameters: {
        factory: {
          type: 'string',
          required: true,
          values: ['深圳工厂', '重庆工厂', '南昌工厂', '宜宾工厂'],
          extract_pattern: '(深圳|重庆|南昌|宜宾)工厂?'
        },
        status: {
          type: 'string', 
          required: false,
          values: ['正常', '风险', '冻结'],
          extract_pattern: '(正常|风险|冻结)'
        },
        supplier: {
          type: 'string',
          required: false, 
          values: ['聚龙', '欣冠', '广正', 'BOE', '三星电子'],
          extract_pattern: '(聚龙|欣冠|广正|BOE|三星电子)'
        },
        material: {
          type: 'string',
          required: false,
          values: ['电池盖', 'OLED显示屏', '电容器', '电阻器', '芯片'],
          extract_pattern: '(电池盖|OLED显示屏|电容器|电阻器|芯片)'
        }
      },
      trigger_words: ['工厂', '库存', '查询'],
      synonyms: {
        '库存': ['物料', '存货', '仓储'],
        '查询': ['查看', '显示', '检索']
      },
      example_queries: [
        '查询深圳工厂库存',
        '深圳工厂风险库存',
        '查询重庆工厂聚龙供应商的库存'
      ],
      priority: 10
    },
    
    {
      intent_name: 'supplier_material_query', 
      description: '供应商物料查询',
      action_type: 'MEMORY_QUERY',
      action_target: 'inventory',
      parameters: {
        supplier: {
          type: 'string',
          required: true,
          values: ['聚龙', '欣冠', '广正', 'BOE', '三星电子'],
          extract_pattern: '(聚龙|欣冠|广正|BOE|三星电子)'
        },
        material: {
          type: 'string',
          required: false,
          values: ['电池盖', 'OLED显示屏', '电容器', '电阻器', '芯片'],
          extract_pattern: '(电池盖|OLED显示屏|电容器|电阻器|芯片)'
        },
        status: {
          type: 'string',
          required: false,
          values: ['正常', '风险', '冻结'],
          extract_pattern: '(正常|风险|冻结)'
        }
      },
      trigger_words: ['供应商', '物料'],
      synonyms: {
        '供应商': ['厂商', '供货商'],
        '物料': ['材料', '零件', '产品']
      },
      example_queries: [
        '查询聚龙供应商的物料',
        '欣冠供应商电池盖库存',
        'BOE供应商风险物料'
      ],
      priority: 9
    },
    
    {
      intent_name: 'material_inventory_query',
      description: '物料库存查询', 
      action_type: 'MEMORY_QUERY',
      action_target: 'inventory',
      parameters: {
        material: {
          type: 'string',
          required: true,
          values: ['电池盖', 'OLED显示屏', '电容器', '电阻器', '芯片'],
          extract_pattern: '(电池盖|OLED显示屏|电容器|电阻器|芯片)'
        },
        factory: {
          type: 'string',
          required: false,
          values: ['深圳工厂', '重庆工厂', '南昌工厂', '宜宾工厂'],
          extract_pattern: '(深圳|重庆|南昌|宜宾)工厂?'
        },
        status: {
          type: 'string',
          required: false,
          values: ['正常', '风险', '冻结'],
          extract_pattern: '(正常|风险|冻结)'
        }
      },
      trigger_words: ['电池盖', 'OLED', '电容器', '电阻器', '芯片'],
      synonyms: {
        'OLED显示屏': ['OLED', '显示屏', '屏幕'],
        '电池盖': ['电池', '盖子'],
        '电容器': ['电容'],
        '电阻器': ['电阻']
      },
      example_queries: [
        '查询电池盖库存',
        'OLED显示屏深圳工厂库存',
        '电容器风险库存'
      ],
      priority: 8
    },
    
    {
      intent_name: 'status_inventory_query',
      description: '状态库存查询',
      action_type: 'MEMORY_QUERY', 
      action_target: 'inventory',
      parameters: {
        status: {
          type: 'string',
          required: true,
          values: ['正常', '风险', '冻结'],
          extract_pattern: '(正常|风险|冻结)'
        },
        factory: {
          type: 'string',
          required: false,
          values: ['深圳工厂', '重庆工厂', '南昌工厂', '宜宾工厂'],
          extract_pattern: '(深圳|重庆|南昌|宜宾)工厂?'
        },
        material: {
          type: 'string',
          required: false,
          values: ['电池盖', 'OLED显示屏', '电容器', '电阻器', '芯片'],
          extract_pattern: '(电池盖|OLED显示屏|电容器|电阻器|芯片)'
        }
      },
      trigger_words: ['风险', '冻结', '正常', '状态'],
      synonyms: {
        '风险': ['异常', '危险', '问题'],
        '冻结': ['锁定', '暂停'],
        '正常': ['良好', '合格']
      },
      example_queries: [
        '查询风险库存',
        '深圳工厂冻结状态库存',
        '正常状态电池盖库存'
      ],
      priority: 7
    },
    
    {
      intent_name: 'comprehensive_inventory_query',
      description: '综合库存查询',
      action_type: 'MEMORY_QUERY',
      action_target: 'inventory', 
      parameters: {
        factory: {
          type: 'string',
          required: false,
          values: ['深圳工厂', '重庆工厂', '南昌工厂', '宜宾工厂'],
          extract_pattern: '(深圳|重庆|南昌|宜宾)工厂?'
        },
        supplier: {
          type: 'string',
          required: false,
          values: ['聚龙', '欣冠', '广正', 'BOE', '三星电子'],
          extract_pattern: '(聚龙|欣冠|广正|BOE|三星电子)'
        },
        material: {
          type: 'string',
          required: false,
          values: ['电池盖', 'OLED显示屏', '电容器', '电阻器', '芯片'],
          extract_pattern: '(电池盖|OLED显示屏|电容器|电阻器|芯片)'
        },
        status: {
          type: 'string',
          required: false,
          values: ['正常', '风险', '冻结'],
          extract_pattern: '(正常|风险|冻结)'
        }
      },
      trigger_words: ['库存', '查询', '显示'],
      synonyms: {
        '库存': ['物料', '存货'],
        '查询': ['查看', '显示', '检索']
      },
      example_queries: [
        '查询深圳工厂聚龙供应商的电池盖',
        '重庆工厂风险状态OLED显示屏',
        '显示所有库存'
      ],
      priority: 6
    }
  ];
  
  console.log(`📋 构建了 ${newRules.length} 条新规则:`);
  newRules.forEach((rule, index) => {
    console.log(`${index + 1}. ${rule.description} (优先级: ${rule.priority})`);
    console.log(`   示例: ${rule.example_queries[0]}`);
  });
  
  // 测试新规则的匹配效果
  console.log('\n🧪 测试新规则匹配效果...');
  
  const testQueries = [
    '查询深圳工厂库存',
    '聚龙供应商的物料',
    '电池盖库存',
    '风险状态库存',
    '深圳工厂聚龙供应商的电池盖'
  ];
  
  for (const query of testQueries) {
    console.log(`\n🔍 测试查询: "${query}"`);
    
    // 模拟规则匹配
    const matchedRules = newRules.filter(rule => {
      const triggerMatch = rule.trigger_words.some(word => query.includes(word));
      const exampleMatch = rule.example_queries.some(example => 
        example.split('').some(char => query.includes(char))
      );
      return triggerMatch || exampleMatch;
    });
    
    if (matchedRules.length > 0) {
      const bestRule = matchedRules.sort((a, b) => b.priority - a.priority)[0];
      console.log(`✅ 匹配规则: ${bestRule.description} (优先级: ${bestRule.priority})`);
      
      // 模拟参数提取
      const extractedParams = {};
      Object.entries(bestRule.parameters).forEach(([key, param]) => {
        const regex = new RegExp(param.extract_pattern, 'i');
        const match = query.match(regex);
        if (match) {
          extractedParams[key] = match[1] || match[0];
        }
      });
      
      if (Object.keys(extractedParams).length > 0) {
        console.log(`📊 提取参数:`, extractedParams);
      }
    } else {
      console.log(`❌ 未匹配到规则`);
    }
  }
  
  return newRules;
};

// 运行规则重建
rebuildRulesWithRealData().then(rules => {
  console.log('\n✅ 规则重建完成！');
  console.log('💡 建议：将这些规则更新到数据库或后端配置中');
});
