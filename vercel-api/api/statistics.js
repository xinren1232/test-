// 统计数据API
export default function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // 模拟统计数据
    const statistics = {
      totalInspections: 1250,
      passRate: 95.8,
      defectRate: 4.2,
      avgProcessingTime: 2.3,
      monthlyTrend: [
        { month: '2024-01', inspections: 980, passRate: 94.2 },
        { month: '2024-02', inspections: 1120, passRate: 95.1 },
        { month: '2024-03', inspections: 1250, passRate: 95.8 }
      ],
      topDefects: [
        { type: '外观缺陷', count: 45, percentage: 35.2 },
        { type: '尺寸偏差', count: 32, percentage: 25.0 },
        { type: '功能异常', count: 28, percentage: 21.9 },
        { type: '其他', count: 23, percentage: 17.9 }
      ]
    };

    res.status(200).json({
      success: true,
      data: statistics,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }
}
