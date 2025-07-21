/**
 * 测试数据清洗服务器 - 最简版
 */
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

console.log('🚀 启动数据清洗测试服务器...');

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

// 内存存储
const fileStorage = new Map();

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '数据清洗服务器运行正常' });
});

// 文件上传接口
app.post('/api/data-cleaning/upload', upload.array('files', 10), async (req, res) => {
  try {
    console.log('📁 接收到文件上传请求');
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有上传文件'
      });
    }

    const uploadedFiles = [];
    
    for (const file of req.files) {
      const fileInfo = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        filename: file.originalname,
        filepath: file.path,
        mimetype: file.mimetype,
        size: file.size,
        upload_time: new Date().toISOString(),
        status: '待处理',
        source_system: req.body.source_system || '手动上传'
      };
      
      // 保存文件信息到内存
      fileStorage.set(fileInfo.id, fileInfo);
      uploadedFiles.push(fileInfo);
      
      console.log(`✅ 文件上传成功: ${file.originalname}`);
    }

    res.json({
      success: true,
      message: '文件上传成功',
      data: uploadedFiles
    });

  } catch (error) {
    console.error('❌ 文件上传失败:', error);
    res.status(500).json({
      success: false,
      message: '文件上传失败: ' + error.message
    });
  }
});

// 处理单个文件
app.post('/api/data-cleaning/process/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { config } = req.body;
    
    console.log(`🔧 开始处理文件: ${fileId}`);
    
    // 获取文件信息
    const fileInfo = fileStorage.get(fileId);
    if (!fileInfo) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      });
    }
    
    // 读取文件内容
    const content = fs.readFileSync(fileInfo.filepath, 'utf-8');
    console.log(`📄 文件内容长度: ${content.length} 字符`);
    
    // 简单处理：按段落分割
    const paragraphs = content
      .split(/\n\s*\n/)
      .map(p => p.replace(/\n/g, ' ').trim())
      .filter(p => p.length > 0);
    
    console.log(`📑 解析出 ${paragraphs.length} 个段落`);
    
    // 生成结构化数据
    const structuredData = paragraphs.map((text, index) => ({
      id: index + 1,
      source_chunk: `CHUNK_${index + 1}`,
      content: text,
      type: '段落',
      position: `第${index + 1}段`,
      source: path.extname(fileInfo.filename).toLowerCase().substring(1),
      confidence: 0.85,
      extractionMethod: 'simple-parser',
      metadata: {
        length: text.length,
        wordCount: text.split(/\s+/).length
      }
    }));
    
    // 生成数据块
    const chunks = paragraphs.map((text, index) => ({
      chunk_id: `CHUNK_${index + 1}`,
      type: '段落',
      content: text,
      position: `第${index + 1}段`,
      source: path.extname(fileInfo.filename).toLowerCase().substring(1),
      labels: generateLabels(text),
      metadata: {
        length: text.length,
        word_count: text.split(/\s+/).length
      }
    }));
    
    // 计算质量分数
    const qualityScore = calculateQualityScore(structuredData);
    
    // 生成处理结果
    const result = {
      fileId: fileInfo.id,
      filename: fileInfo.filename,
      processTime: new Date().toISOString(),
      config: config || {},
      totalChunks: chunks.length,
      structuredFields: Object.keys(structuredData[0] || {}).length,
      rulesApplied: 3, // 模拟应用的规则数
      qualityScore: qualityScore,
      structuredData: structuredData,
      chunks: chunks,
      logs: [
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `开始处理文件: ${fileInfo.filename}`
        },
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `文件大小: ${fileInfo.size} bytes`
        },
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `解析出 ${paragraphs.length} 个段落`
        },
        {
          timestamp: new Date().toISOString(),
          level: 'success',
          message: '文件处理完成'
        }
      ]
    };
    
    console.log('✅ 文件处理完成');
    
    res.json({
      success: true,
      message: '文件处理完成',
      data: result
    });

  } catch (error) {
    console.error('❌ 文件处理失败:', error);
    res.status(500).json({
      success: false,
      message: '文件处理失败: ' + error.message
    });
  }
});

// 生成标签
function generateLabels(text) {
  const labels = [];
  
  if (text.includes('问题') || text.includes('故障') || text.includes('缺陷')) {
    labels.push('问题描述');
  }
  if (text.includes('原因') || text.includes('分析') || text.includes('根因')) {
    labels.push('原因分析');
  }
  if (text.includes('措施') || text.includes('方案') || text.includes('对策')) {
    labels.push('解决方案');
  }
  if (text.includes('团队') || text.includes('成员') || text.includes('负责人')) {
    labels.push('团队信息');
  }
  if (text.includes('时间') || text.includes('日期') || text.includes('计划')) {
    labels.push('时间信息');
  }
  if (text.includes('验证') || text.includes('测试') || text.includes('确认')) {
    labels.push('验证信息');
  }
  
  return labels;
}

// 计算质量分数
function calculateQualityScore(structuredData) {
  let score = 60; // 基础分数
  
  // 基于数据量加分
  if (structuredData.length > 3) score += 10;
  if (structuredData.length > 8) score += 10;
  if (structuredData.length > 15) score += 5;
  
  // 基于内容质量加分
  const avgLength = structuredData.reduce((sum, item) => sum + item.content.length, 0) / structuredData.length;
  if (avgLength > 30) score += 5;
  if (avgLength > 80) score += 10;
  if (avgLength > 150) score += 5;
  
  return Math.min(100, score);
}

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 数据清洗测试服务器已启动`);
  console.log(`📡 端口: ${PORT}`);
  console.log(`🔗 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`📁 上传接口: http://localhost:${PORT}/api/data-cleaning/upload`);
});

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的Promise拒绝:', reason);
});
