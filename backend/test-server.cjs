// 最简单的测试服务
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查API
app.get('/api/health', (req, res) => {
  console.log('📚 收到健康检查请求');
  res.json({
    status: 'ok',
    message: '后端服务运行正常',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// 模拟规则数据
const mockRules = [
  {
    id: 1,
    intent_name: '库存查询_基础',
    description: '查询物料库存信息',
    category: '库存场景',
    example_query: '库存查询',
    trigger_words: '["库存查询", "库存", "查库存"]',
    action_target: 'SELECT * FROM inventory LIMIT 10',
    status: 'active',
    priority: 100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    intent_name: '聚龙供应商_库存查询',
    description: '查询聚龙供应商的库存信息',
    category: '库存场景',
    example_query: '聚龙供应商',
    trigger_words: '["聚龙供应商", "聚龙", "聚龙光电"]',
    action_target: 'SELECT * FROM inventory WHERE supplier_name LIKE "%聚龙%" LIMIT 10',
    status: 'active',
    priority: 95,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    intent_name: 'BOE供应商_库存查询',
    description: '查询BOE供应商的库存信息',
    category: '库存场景',
    example_query: 'BOE供应商',
    trigger_words: '["BOE供应商", "BOE", "BOE科技"]',
    action_target: 'SELECT * FROM inventory WHERE supplier_name LIKE "%BOE%" LIMIT 10',
    status: 'active',
    priority: 93,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    intent_name: '全测试_综合查询',
    description: '查询检验测试结果',
    category: '检验场景',
    example_query: '全测试',
    trigger_words: '["全测试", "检验结果", "测试结果"]',
    action_target: 'SELECT * FROM lab_tests LIMIT 10',
    status: 'active',
    priority: 90,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    intent_name: '生产上线_情况查询',
    description: '查询生产上线情况',
    category: '生产场景',
    example_query: '上线情况',
    trigger_words: '["上线情况", "生产情况", "生产", "上线"]',
    action_target: 'SELECT * FROM online_tracking LIMIT 10',
    status: 'active',
    priority: 85,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// 模拟数据
const mockData = [
  { 物料名称: 'LCD显示屏', 供应商: '聚龙光电', 数量: '1500', 状态: '正常' },
  { 物料名称: 'OLED面板', 供应商: 'BOE科技', 数量: '800', 状态: '正常' },
  { 物料名称: '触控芯片', 供应商: '天马微电子', 数量: '2000', 状态: '正常' },
  { 物料名称: '电池模组', 供应商: '聚龙光电', 数量: '1200', 状态: '正常' },
  { 物料名称: '摄像头模组', 供应商: 'BOE科技', 数量: '900', 状态: '正常' }
];

// 获取规则列表API
app.get('/api/rules', (req, res) => {
  console.log('📋 收到规则列表请求');
  
  res.json({
    success: true,
    data: mockRules,
    total: mockRules.length,
    timestamp: new Date().toISOString()
  });
});

// 智能查询API
app.post('/api/assistant/query', (req, res) => {
  const { query, context } = req.body;
  console.log('🤖 收到智能查询请求:', { query, context });

  if (!query) {
    return res.status(400).json({
      success: false,
      error: '缺少查询内容'
    });
  }

  // 简单的规则匹配
  let matchedRule = '默认查询';
  let filteredData = mockData;

  if (query.includes('聚龙')) {
    matchedRule = '聚龙供应商_库存查询';
    filteredData = mockData.filter(item => item.供应商.includes('聚龙'));
  } else if (query.includes('BOE')) {
    matchedRule = 'BOE供应商_库存查询';
    filteredData = mockData.filter(item => item.供应商.includes('BOE'));
  } else if (query.includes('库存')) {
    matchedRule = '库存查询_基础';
  }

  const cards = [
    {
      title: '数据总数',
      value: filteredData.length.toString(),
      icon: '📊',
      color: 'primary'
    },
    {
      title: '匹配规则',
      value: matchedRule,
      icon: '🎯',
      color: 'success'
    }
  ];

  console.log(`✅ 匹配规则: ${matchedRule}, 返回 ${filteredData.length} 条数据`);

  res.json({
    success: true,
    data: {
      tableData: filteredData,
      cards
    },
    matchedRule,
    query,
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('🚀 启动测试后端服务...');
  console.log(`✅ 测试后端服务已启动，端口: ${PORT}`);
  console.log(`📚 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`📋 规则接口: http://localhost:${PORT}/api/rules`);
  console.log(`🤖 查询接口: http://localhost:${PORT}/api/assistant/query`);
  console.log('💡 使用模拟数据，无需数据库连接');
});
