// 检验数据API
export default function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 模拟检验数据
  const inspections = [
    {
      id: 1,
      materialCode: "M001-LCD-001",
      materialName: "LCD显示屏",
      supplierName: "天马微电子",
      supplierCode: "SUP001",
      inspectionDate: "2024-01-15",
      inspectionTime: "09:30:00",
      result: "合格",
      defectRate: 2.1,
      batchNumber: "B20240115001",
      inspector: "张三",
      defectTypes: ["轻微划痕"],
      remarks: "整体质量良好"
    },
    {
      id: 2,
      materialCode: "M002-BAT-001", 
      materialName: "锂电池",
      supplierName: "比亚迪",
      supplierCode: "SUP002",
      inspectionDate: "2024-01-16",
      inspectionTime: "14:20:00",
      result: "不合格",
      defectRate: 8.5,
      batchNumber: "B20240116001",
      inspector: "李四",
      defectTypes: ["容量不足", "外观缺陷"],
      remarks: "需要退货处理"
    },
    {
      id: 3,
      materialCode: "M003-PCB-001",
      materialName: "主板PCB",
      supplierName: "富士康",
      supplierCode: "SUP003", 
      inspectionDate: "2024-01-17",
      inspectionTime: "11:15:00",
      result: "合格",
      defectRate: 1.2,
      batchNumber: "B20240117001",
      inspector: "王五",
      defectTypes: [],
      remarks: "质量优秀"
    },
    {
      id: 4,
      materialCode: "M004-CAM-001",
      materialName: "摄像头模组",
      supplierName: "舜宇光学",
      supplierCode: "SUP004",
      inspectionDate: "2024-01-18",
      inspectionTime: "16:45:00",
      result: "合格",
      defectRate: 3.8,
      batchNumber: "B20240118001",
      inspector: "赵六",
      defectTypes: ["对焦偏差"],
      remarks: "在可接受范围内"
    }
  ];

  if (req.method === 'GET') {
    const { 
      materialCode, 
      supplierName, 
      result, 
      startDate, 
      endDate,
      page = 1,
      limit = 10 
    } = req.query;
    
    let filteredInspections = inspections;
    
    // 过滤条件
    if (materialCode) {
      filteredInspections = filteredInspections.filter(item => 
        item.materialCode.toLowerCase().includes(materialCode.toLowerCase())
      );
    }
    
    if (supplierName) {
      filteredInspections = filteredInspections.filter(item => 
        item.supplierName.toLowerCase().includes(supplierName.toLowerCase())
      );
    }
    
    if (result) {
      filteredInspections = filteredInspections.filter(item => 
        item.result === result
      );
    }
    
    if (startDate) {
      filteredInspections = filteredInspections.filter(item => 
        item.inspectionDate >= startDate
      );
    }
    
    if (endDate) {
      filteredInspections = filteredInspections.filter(item => 
        item.inspectionDate <= endDate
      );
    }

    // 分页
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedData = filteredInspections.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      data: paginatedData,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredInspections.length,
        totalPages: Math.ceil(filteredInspections.length / limitNum)
      },
      timestamp: new Date().toISOString()
    });
  } 
  else if (req.method === 'POST') {
    const newInspection = {
      id: inspections.length + 1,
      ...req.body,
      inspectionDate: new Date().toISOString().split('T')[0],
      inspectionTime: new Date().toTimeString().split(' ')[0]
    };

    res.status(201).json({
      success: true,
      data: newInspection,
      message: '检验记录创建成功'
    });
  }
  else {
    res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }
}
