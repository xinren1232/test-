// AI助手API
export default function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    const { message, context } = req.body;

    // 模拟AI响应逻辑
    let response = generateAIResponse(message, context);

    res.status(200).json({
      success: true,
      data: {
        response: response,
        timestamp: new Date().toISOString(),
        context: context || 'general'
      }
    });
  } else {
    res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }
}

function generateAIResponse(message, context) {
  const lowerMessage = message.toLowerCase();
  
  // 质量相关问题
  if (lowerMessage.includes('不良率') || lowerMessage.includes('质量')) {
    return `根据最新数据分析，当前整体不良率为4.2%，主要问题集中在：
1. 外观缺陷 (35.2%)
2. 尺寸偏差 (25.0%) 
3. 功能异常 (21.9%)

建议重点关注供应商质量管控和生产工艺优化。`;
  }
  
  // 供应商相关问题
  if (lowerMessage.includes('供应商')) {
    return `供应商质量表现分析：
- 天马微电子：不良率2.1%，表现优秀
- 比亚迪：不良率8.5%，需要改进
- 富士康：不良率1.2%，质量稳定
- 舜宇光学：不良率3.8%，表现良好

建议与比亚迪进行质量改进沟通。`;
  }
  
  // 8D报告相关
  if (lowerMessage.includes('8d') || lowerMessage.includes('报告')) {
    return `8D报告分析功能可以帮助您：
1. 自动识别8D报告的8个维度
2. 检查报告完整性和逻辑性
3. 提供改进建议和最佳实践
4. 生成质量改进跟踪报告

请上传您的8D报告文档进行分析。`;
  }
  
  // 数据查询相关
  if (lowerMessage.includes('查询') || lowerMessage.includes('数据')) {
    return `我可以帮您查询以下数据：
- 检验记录和统计信息
- 供应商质量表现
- 物料不良率趋势
- 生产线效率数据
- 质量改进跟踪

请告诉我您需要查询什么具体信息。`;
  }
  
  // 默认响应
  return `您好！我是IQE智能质检助手，可以帮助您：

🔍 **质量分析**
- 不良率统计和趋势分析
- 供应商质量评估
- 缺陷类型分析

📊 **数据查询**
- 检验记录查询
- 统计报表生成
- 质量指标监控

📋 **8D报告**
- 自动解析和分析
- 完整性检查
- 改进建议生成

💡 **智能建议**
- 质量改进方案
- 供应商管理建议
- 工艺优化建议

请告诉我您需要什么帮助！`;
}
