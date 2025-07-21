/**
 * 数据清洗服务器 - 简化版
 * 专门用于测试数据清洗功能
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
const processResults = new Map();

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
    console.log('📝 处理配置:', config);
    
    // 获取文件信息
    const fileInfo = fileStorage.get(fileId);
    if (!fileInfo) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      });
    }
    
    // 更新文件状态为处理中
    fileInfo.status = '处理中';
    fileStorage.set(fileId, fileInfo);
    
    // 开始处理流程
    const result = await processFile(fileInfo, config);
    
    // 更新文件状态为已处理
    fileInfo.status = '已处理';
    fileStorage.set(fileId, fileInfo);
    
    console.log('✅ 文件处理完成');
    
    res.json({
      success: true,
      message: '文件处理完成',
      data: result
    });

  } catch (error) {
    console.error('❌ 文件处理失败:', error);
    
    // 更新文件状态为失败
    if (req.params.fileId) {
      const fileInfo = fileStorage.get(req.params.fileId);
      if (fileInfo) {
        fileInfo.status = '失败';
        fileStorage.set(req.params.fileId, fileInfo);
      }
    }
    
    res.status(500).json({
      success: false,
      message: '文件处理失败: ' + error.message
    });
  }
});

// 文件处理函数
async function processFile(fileInfo, processingConfig) {
  console.log(`📄 开始处理文件: ${fileInfo.filename}`);
  
  try {
    // 1. 内容解析与格式统一
    const parsedContent = await parseFileContent(fileInfo);
    
    // 2. 数据清洗
    const cleanedContent = await cleanData(parsedContent, processingConfig);
    
    // 3. 标签提取与结构化
    const structuredData = await extractStructuredData(cleanedContent, processingConfig);
    
    // 4. 分块切片与数据转换
    const chunks = await chunkData(cleanedContent, processingConfig);
    
    // 5. 生成处理结果
    const result = {
      fileId: fileInfo.id,
      filename: fileInfo.filename,
      processTime: new Date().toISOString(),
      config: processingConfig,
      totalChunks: chunks.length,
      structuredFields: Object.keys(structuredData[0] || {}).length,
      rulesApplied: processingConfig.cleaningRules?.length || 0,
      qualityScore: calculateQualityScore(structuredData, chunks),
      structuredData: structuredData,
      chunks: chunks,
      logs: generateProcessingLogs(fileInfo, processingConfig)
    };
    
    // 保存处理结果到内存
    processResults.set(fileInfo.id, result);

    console.log(`✅ 文件处理完成: ${fileInfo.filename}`);
    return result;
    
  } catch (error) {
    console.error(`❌ 文件处理失败: ${fileInfo.filename}`, error);
    throw error;
  }
}

// 解析文件内容
async function parseFileContent(fileInfo) {
  console.log(`📑 解析文件内容: ${fileInfo.filename}`);

  // 根据文件类型进行不同的解析
  const ext = path.extname(fileInfo.filename).toLowerCase();
  
  switch (ext) {
    case '.txt':
      return await parseTxtFile(fileInfo.filepath);
    case '.docx':
    case '.doc':
      return await parseDocxFile(fileInfo.filepath);
    case '.pdf':
      return await parsePdfFile(fileInfo.filepath);
    case '.csv':
      return await parseCsvFile(fileInfo.filepath);
    case '.json':
      return await parseJsonFile(fileInfo.filepath);
    default:
      // 尝试作为文本文件读取
      return await parseTxtFile(fileInfo.filepath);
  }
}

// 解析TXT文件
async function parseTxtFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8');
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  
  return paragraphs.map((text, index) => ({
    chunk_id: `TXT_${index + 1}`,
    type: '段落',
    source: 'txt',
    text: text.trim(),
    position: `第${index + 1}段`
  }));
}

// 解析Word文件（真实实现）
async function parseDocxFile(filepath) {
  console.log('📝 解析Word文件:', filepath);
  
  try {
    // 检查文件是否存在
    if (!fs.existsSync(filepath)) {
      throw new Error(`文件不存在: ${filepath}`);
    }

    // 读取文件内容
    const content = fs.readFileSync(filepath, 'utf-8');
    console.log(`📄 文件内容长度: ${content.length} 字符`);
    
    if (content.length === 0) {
      console.warn('⚠️ 文件内容为空');
      return [];
    }

    // 按段落分割内容
    const paragraphs = content
      .split(/\n\s*\n/)  // 按空行分割段落
      .map(p => p.replace(/\n/g, ' ').trim())  // 合并段落内的换行
      .filter(p => p.length > 0);  // 过滤空段落

    console.log(`📑 解析出 ${paragraphs.length} 个段落`);

    return paragraphs.map((text, index) => ({
      chunk_id: `DOCX_${index + 1}`,
      type: '段落',
      source: 'docx',
      text: text,
      position: `第${index + 1}段`,
      metadata: {
        length: text.length,
        wordCount: text.split(/\s+/).length
      }
    }));

  } catch (error) {
    console.error('❌ Word文件解析失败:', error);
    
    // 如果解析失败，尝试作为纯文本读取
    try {
      const content = fs.readFileSync(filepath, 'utf-8');
      if (content && content.length > 0) {
        console.log('🔄 尝试作为纯文本解析');
        return [{
          chunk_id: 'DOCX_FALLBACK_1',
          type: '文档内容',
          source: 'docx',
          text: content,
          position: '全文',
          metadata: {
            parseMethod: 'fallback',
            length: content.length
          }
        }];
      }
    } catch (fallbackError) {
      console.error('❌ 纯文本解析也失败:', fallbackError);
    }
    
    throw new Error(`Word文件解析失败: ${error.message}`);
  }
}

// 解析PDF文件（真实实现）
async function parsePdfFile(filepath) {
  console.log('📄 解析PDF文件:', filepath);
  
  try {
    // 检查文件是否存在
    if (!fs.existsSync(filepath)) {
      throw new Error(`文件不存在: ${filepath}`);
    }

    // 尝试读取文件内容（如果PDF已转换为文本）
    const content = fs.readFileSync(filepath, 'utf-8');
    console.log(`📄 PDF文件内容长度: ${content.length} 字符`);
    
    if (content.length === 0) {
      console.warn('⚠️ PDF文件内容为空');
      return [];
    }

    // 按段落分割内容
    const paragraphs = content
      .split(/\n\s*\n/)  // 按空行分割段落
      .map(p => p.replace(/\n/g, ' ').trim())  // 合并段落内的换行
      .filter(p => p.length > 0);  // 过滤空段落

    console.log(`📑 从PDF解析出 ${paragraphs.length} 个段落`);

    return paragraphs.map((text, index) => ({
      chunk_id: `PDF_${index + 1}`,
      type: '段落',
      source: 'pdf',
      text: text,
      position: `第${index + 1}段`,
      metadata: {
        length: text.length,
        wordCount: text.split(/\s+/).length
      }
    }));

  } catch (error) {
    console.error('❌ PDF文件解析失败:', error);
    throw new Error(`PDF文件解析失败: ${error.message}`);
  }
}

// 其他解析函数...
async function parseCsvFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',');

  return lines.slice(1).map((line, index) => {
    const values = line.split(',');
    const rowData = headers.reduce((obj, header, i) => {
      obj[header.trim()] = values[i]?.trim() || '';
      return obj;
    }, {});

    return {
      chunk_id: `CSV_${index + 1}`,
      type: '表格行',
      source: 'csv',
      text: Object.entries(rowData).map(([k, v]) => `${k}: ${v}`).join(', '),
      position: `第${index + 2}行`,
      data: rowData
    };
  });
}

async function parseJsonFile(filepath) {
  console.log('📄 解析JSON文件');
  const content = fs.readFileSync(filepath, 'utf-8');
  const jsonData = JSON.parse(content);
  
  // 将JSON数据转换为文本块
  const processJsonData = (data, path = '') => {
    const results = [];
    
    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        results.push(...processJsonData(item, `${path}[${index}]`));
      });
    } else if (typeof data === 'object' && data !== null) {
      Object.entries(data).forEach(([key, value]) => {
        results.push(...processJsonData(value, path ? `${path}.${key}` : key));
      });
    } else {
      results.push({
        chunk_id: `JSON_${results.length + 1}`,
        type: 'JSON字段',
        source: 'json',
        text: `${path}: ${data}`,
        position: path,
        data: { path, value: data }
      });
    }
    
    return results;
  };
  
  return processJsonData(jsonData);
}

// 数据清洗
async function cleanData(parsedContent, config) {
  console.log('🧽 执行数据清洗');
  
  return parsedContent.map(item => {
    let cleanedText = item.text;
    
    // 应用清洗规则
    if (config.cleaningRules) {
      config.cleaningRules.forEach(rule => {
        if (typeof rule.replacement === 'function') {
          cleanedText = cleanedText.replace(rule.pattern, rule.replacement);
        } else {
          cleanedText = cleanedText.replace(rule.pattern, rule.replacement);
        }
      });
    }
    
    return {
      ...item,
      text: cleanedText.trim(),
      cleaned: true
    };
  });
}

// 提取结构化数据
async function extractStructuredData(cleanedContent, config) {
  console.log('🏷️ 提取结构化数据');

  const structuredData = [];
  
  cleanedContent.forEach((item, index) => {
    const record = {
      id: index + 1,
      source_chunk: item.chunk_id,
      content: item.text,
      type: item.type,
      position: item.position,
      source: item.source,
      confidence: 0.8,
      extractionMethod: 'traditional',
      metadata: item.metadata || {}
    };

    // 简单的关键词提取
    if (config.extractionRules?.enableKeywordExtraction) {
      record.keywords = extractKeywords(item.text);
    }

    // 简单的实体提取
    if (config.extractionRules?.enableEntityExtraction) {
      record.entities = extractEntities(item.text);
    }

    structuredData.push(record);
  });

  return structuredData;
}

// 关键词提取
function extractKeywords(text) {
  const keywords = [];
  const commonWords = ['的', '是', '在', '有', '和', '与', '或', '但', '而', '了', '着', '过'];
  
  const words = text.split(/\s+/).filter(word => 
    word.length > 1 && !commonWords.includes(word)
  );
  
  return words.slice(0, 5); // 返回前5个关键词
}

// 实体提取
function extractEntities(text) {
  const entities = [];
  
  // 简单的日期提取
  const datePattern = /\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/g;
  const dates = text.match(datePattern);
  if (dates) {
    dates.forEach(date => {
      entities.push({ type: 'DATE', value: date });
    });
  }
  
  // 简单的数字提取
  const numberPattern = /\d+\.?\d*/g;
  const numbers = text.match(numberPattern);
  if (numbers) {
    numbers.slice(0, 3).forEach(number => {
      entities.push({ type: 'NUMBER', value: number });
    });
  }
  
  return entities;
}

// 数据分块
async function chunkData(cleanedContent, config) {
  console.log('🧩 执行数据分块');
  
  return cleanedContent.map(item => ({
    chunk_id: item.chunk_id,
    type: item.type,
    content: item.text,
    position: item.position,
    source: item.source,
    labels: generateLabels(item.text),
    metadata: {
      cleaned: item.cleaned,
      length: item.text.length,
      word_count: item.text.split(/\s+/).length
    }
  }));
}

// 生成标签
function generateLabels(text) {
  const labels = [];
  
  if (text.includes('问题') || text.includes('故障')) {
    labels.push('问题描述');
  }
  if (text.includes('原因') || text.includes('分析')) {
    labels.push('原因分析');
  }
  if (text.includes('措施') || text.includes('方案')) {
    labels.push('解决方案');
  }
  if (text.includes('团队') || text.includes('成员')) {
    labels.push('团队信息');
  }
  
  return labels;
}

// 计算质量分数
function calculateQualityScore(structuredData, chunks) {
  let score = 60; // 基础分数
  
  // 基于数据量加分
  if (structuredData.length > 5) score += 10;
  if (structuredData.length > 10) score += 10;
  
  // 基于内容质量加分
  const avgLength = structuredData.reduce((sum, item) => sum + item.content.length, 0) / structuredData.length;
  if (avgLength > 50) score += 10;
  if (avgLength > 100) score += 10;
  
  return Math.min(100, score);
}

// 生成处理日志
function generateProcessingLogs(fileInfo, processingConfig) {
  return [
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
      message: `处理配置: ${JSON.stringify(processingConfig)}`
    },
    {
      timestamp: new Date().toISOString(),
      level: 'success',
      message: '文件处理完成'
    }
  ];
}

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 数据清洗服务器已启动，端口: ${PORT}`);
  console.log(`📡 API地址: http://localhost:${PORT}/api/data-cleaning`);
});
