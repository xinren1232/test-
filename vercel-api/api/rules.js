// 规则管理API
export default function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 模拟规则数据
  const rules = [
    {
      id: 1,
      name: "物料供应商不良率分析",
      category: "质量分析",
      description: "分析特定物料供应商的不良率情况，识别高风险供应商",
      triggerWords: ["物料", "供应商", "不良率", "质量问题"],
      enabled: true,
      priority: "高",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-20T15:30:00Z"
    },
    {
      id: 2,
      name: "生产线效率监控",
      category: "生产监控",
      description: "实时监控生产线的效率和产能情况，及时发现瓶颈",
      triggerWords: ["生产线", "效率", "产能", "瓶颈"],
      enabled: true,
      priority: "中",
      createdAt: "2024-01-16T09:00:00Z",
      updatedAt: "2024-01-18T14:20:00Z"
    },
    {
      id: 3,
      name: "8D报告质量分析",
      category: "8D分析",
      description: "自动分析8D报告的完整性和质量，提供改进建议",
      triggerWords: ["8D", "报告", "质量", "改进"],
      enabled: true,
      priority: "高",
      createdAt: "2024-01-17T11:00:00Z",
      updatedAt: "2024-01-19T16:45:00Z"
    },
    {
      id: 4,
      name: "批次追溯分析",
      category: "追溯管理",
      description: "基于批次号进行产品质量追溯和问题定位",
      triggerWords: ["批次", "追溯", "质量", "定位"],
      enabled: false,
      priority: "中",
      createdAt: "2024-01-18T13:00:00Z",
      updatedAt: "2024-01-18T13:00:00Z"
    }
  ];

  if (req.method === 'GET') {
    const { category, enabled } = req.query;
    
    let filteredRules = rules;
    
    if (category) {
      filteredRules = filteredRules.filter(rule => 
        rule.category.toLowerCase().includes(category.toLowerCase())
      );
    }
    
    if (enabled !== undefined) {
      filteredRules = filteredRules.filter(rule => 
        rule.enabled === (enabled === 'true')
      );
    }

    res.status(200).json({
      success: true,
      data: filteredRules,
      total: filteredRules.length,
      timestamp: new Date().toISOString()
    });
  } 
  else if (req.method === 'POST') {
    const newRule = {
      id: rules.length + 1,
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      data: newRule,
      message: '规则创建成功'
    });
  }
  else {
    res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }
}
