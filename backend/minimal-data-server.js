/**
 * 最小化数据清洗服务器
 */
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));

console.log('🚀 启动最小化数据清洗服务器...');

// 健康检查
app.get('/api/health', (req, res) => {
  console.log('📡 健康检查请求');
  res.json({ 
    status: 'ok', 
    message: '数据清洗服务器运行正常',
    timestamp: new Date().toISOString()
  });
});

// 模拟文件上传
app.post('/api/data-cleaning/upload', (req, res) => {
  console.log('📁 模拟文件上传请求');
  
  const mockFileInfo = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    filename: 'test-file.docx',
    filepath: '/mock/path/test-file.docx',
    mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 2406037,
    upload_time: new Date().toISOString(),
    status: '待处理',
    source_system: '手动上传'
  };
  
  res.json({
    success: true,
    message: '文件上传成功',
    data: [mockFileInfo]
  });
});

// 模拟文件处理
app.post('/api/data-cleaning/process/:fileId', (req, res) => {
  const { fileId } = req.params;
  const { config } = req.body;
  
  console.log(`🔧 模拟处理文件: ${fileId}`);
  console.log('📝 处理配置:', config);
  
  // 模拟真实的8D报告数据
  const mockStructuredData = [
    {
      id: 1,
      source_chunk: 'CHUNK_1',
      content: 'D1 团队组建：成立跨职能团队，包括质量工程师张三、生产主管李四、设备维护员王五等。团队负责人：张三，联系方式：13800138001。',
      type: '段落',
      position: '第1段',
      source: 'docx',
      confidence: 0.92,
      extractionMethod: 'real-parser',
      metadata: { length: 89, wordCount: 25 }
    },
    {
      id: 2,
      source_chunk: 'CHUNK_2',
      content: 'D2 问题描述：在X669二供后接泛绿问题8D复盘过程中发现螺丝偏移问题，具体表现为螺丝孔位偏差导致治具无法正常安装，影响生产效率约15%。',
      type: '段落',
      position: '第2段',
      source: 'docx',
      confidence: 0.95,
      extractionMethod: 'real-parser',
      metadata: { length: 98, wordCount: 28 }
    },
    {
      id: 3,
      source_chunk: 'CHUNK_3',
      content: 'D3 临时措施：立即更换螺丝型号为M3×8，增加定位孔以确保安装精度。临时措施已于2025年1月18日实施，效果良好。',
      type: '段落',
      position: '第3段',
      source: 'docx',
      confidence: 0.88,
      extractionMethod: 'real-parser',
      metadata: { length: 76, wordCount: 22 }
    },
    {
      id: 4,
      source_chunk: 'CHUNK_4',
      content: 'D4 根本原因分析：通过鱼骨图分析和5Why方法，确定根本原因为供应商华为技术在物料编码AXX-9938的加工精度控制不当，导致螺丝孔位偏差超出公差范围。',
      type: '段落',
      position: '第4段',
      source: 'docx',
      confidence: 0.93,
      extractionMethod: 'real-parser',
      metadata: { length: 102, wordCount: 29 }
    },
    {
      id: 5,
      source_chunk: 'CHUNK_5',
      content: 'D5 永久纠正措施：与供应商华为技术重新制定加工工艺标准，增加质量检验节点，确保螺丝孔位精度控制在±0.1mm范围内。',
      type: '段落',
      position: '第5段',
      source: 'docx',
      confidence: 0.90,
      extractionMethod: 'real-parser',
      metadata: { length: 81, wordCount: 24 }
    }
  ];
  
  const mockChunks = mockStructuredData.map(item => ({
    chunk_id: item.source_chunk,
    type: item.type,
    content: item.content,
    position: item.position,
    source: item.source,
    labels: generateLabels(item.content),
    metadata: item.metadata
  }));
  
  const result = {
    fileId: fileId,
    filename: 'X669二供后接泛绿问题8D复盘.docx',
    processTime: new Date().toISOString(),
    config: config || {},
    totalChunks: mockChunks.length,
    structuredFields: Object.keys(mockStructuredData[0] || {}).length,
    rulesApplied: 5,
    qualityScore: 87,
    structuredData: mockStructuredData,
    chunks: mockChunks,
    logs: [
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: '开始处理文件: X669二供后接泛绿问题8D复盘.docx'
      },
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: '文件大小: 2406037 bytes'
      },
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: '识别为8D报告，使用专用解析器'
      },
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: '解析出 5 个关键段落'
      },
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: '应用了 5 条清洗规则'
      },
      {
        timestamp: new Date().toISOString(),
        level: 'success',
        message: '文件处理完成，质量评分: 87/100'
      }
    ]
  };
  
  console.log('✅ 模拟文件处理完成');
  
  res.json({
    success: true,
    message: '文件处理完成',
    data: result
  });
});

// 生成标签
function generateLabels(text) {
  const labels = [];
  
  if (text.includes('D1') || text.includes('团队') || text.includes('成员')) {
    labels.push('团队组建');
  }
  if (text.includes('D2') || text.includes('问题') || text.includes('现象')) {
    labels.push('问题描述');
  }
  if (text.includes('D3') || text.includes('临时') || text.includes('应急')) {
    labels.push('临时措施');
  }
  if (text.includes('D4') || text.includes('根因') || text.includes('原因')) {
    labels.push('根因分析');
  }
  if (text.includes('D5') || text.includes('永久') || text.includes('纠正')) {
    labels.push('永久措施');
  }
  if (text.includes('供应商') || text.includes('华为')) {
    labels.push('供应商信息');
  }
  if (text.includes('物料') || text.includes('编码')) {
    labels.push('物料信息');
  }
  
  return labels;
}

// 启动服务器
const server = app.listen(PORT, () => {
  console.log(`🚀 最小化数据清洗服务器已启动`);
  console.log(`📡 端口: ${PORT}`);
  console.log(`🔗 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`📁 上传接口: http://localhost:${PORT}/api/data-cleaning/upload`);
  console.log(`⚙️ 处理接口: http://localhost:${PORT}/api/data-cleaning/process/:fileId`);
});

// 错误处理
server.on('error', (error) => {
  console.error('❌ 服务器启动失败:', error);
  if (error.code === 'EADDRINUSE') {
    console.log(`端口 ${PORT} 已被占用，请检查是否有其他服务在运行`);
  }
});

process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的Promise拒绝:', reason);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 收到关闭信号，正在关闭服务器...');
  server.close(() => {
    console.log('✅ 服务器已关闭');
    process.exit(0);
  });
});

console.log('✅ 服务器配置完成，等待请求...');
