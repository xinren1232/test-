/**
 * 数据清洗服务
 * 实现历史案例数据的清洗、转换和关键信息提取
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AIModelService } from './aiModelService.js';
import { DataCleaningDatabaseService } from './dataCleaningDatabaseService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DataCleaningService {
  constructor() {
    // 内存存储（实际应用中应该使用数据库）
    this.files = new Map();
    this.processResults = new Map();
    this.configs = new Map();

    // 初始化AI模型服务
    this.aiModelService = new AIModelService();

    // 初始化数据库服务
    this.databaseService = new DataCleaningDatabaseService();

    // 初始化默认配置
    this.initDefaultConfigs();
  }

  /**
   * 初始化默认配置
   */
  initDefaultConfigs() {
    // 标准清洗配置
    const standardConfig = {
      id: 'standard',
      name: '标准清洗配置',
      mode: 'standard',
      extractFields: ['MaterialCode', 'IssueType', 'Description', 'TemporaryAction', 'ResponsibleDept'],
      chunkStrategy: 'paragraph',
      cleaningRules: [
        {
          name: '去除测试文本',
          pattern: /测试测试|test.*test|demo.*demo/gi,
          replacement: '',
          priority: 1
        },
        {
          name: '去除HTML标签',
          pattern: /<[^>]*>/g,
          replacement: '',
          priority: 2
        },
        {
          name: '标点符号规范化',
          pattern: /[，。；：！？]/g,
          replacement: (match) => {
            const map = { '，': ',', '。': '.', '；': ';', '：': ':', '！': '!', '？': '?' };
            return map[match] || match;
          },
          priority: 3
        },
        {
          name: '多余空格清理',
          pattern: /\s+/g,
          replacement: ' ',
          priority: 4
        },
        {
          name: '去除特殊字符',
          pattern: /[^\u4e00-\u9fa5a-zA-Z0-9\s\-_.,:;!?()[\]{}]/g,
          replacement: '',
          priority: 5
        }
      ],
      fieldMappings: {
        '料号': 'MaterialCode',
        '物料编码': 'MaterialCode',
        'PN': 'MaterialCode',
        'Part Number': 'MaterialCode',
        '问题类型': 'IssueType',
        '不良现象': 'IssueType',
        '不良类型': 'IssueType',
        '故障类型': 'IssueType',
        '问题描述': 'Description',
        '现象描述': 'Description',
        '故障描述': 'Description',
        '临时对策': 'TemporaryAction',
        '应急措施': 'TemporaryAction',
        '处理措施': 'TemporaryAction',
        '责任部门': 'ResponsibleDept',
        '负责单位': 'ResponsibleDept',
        '负责部门': 'ResponsibleDept',
        '供应商': 'Supplier',
        '供应商名称': 'Supplier',
        '厂商': 'Supplier',
        '发生日期': 'OccurrenceDate',
        '日期': 'OccurrenceDate',
        '时间': 'OccurrenceDate',
        '处理状态': 'Status',
        '状态': 'Status',
        '进度': 'Status'
      },
      validationRules: {
        MaterialCode: {
          required: true,
          pattern: /^[A-Z0-9\-]{3,20}$/,
          message: '物料编码格式不正确'
        },
        MaterialName: {
          required: true,
          minLength: 2,
          maxLength: 50,
          message: '物料名称长度应在2-50字符之间'
        },
        Supplier: {
          required: true,
          minLength: 2,
          maxLength: 30,
          message: '供应商名称长度应在2-30字符之间'
        }
      }
    };

    // 深度清洗配置
    const deepConfig = {
      id: 'deep',
      name: '深度清洗配置',
      mode: 'deep',
      extractFields: ['MaterialCode', 'MaterialName', 'Supplier', 'IssueType', 'Description', 'TemporaryAction', 'ResponsibleDept', 'OccurrenceDate', 'Status'],
      chunkStrategy: 'semantic',
      cleaningRules: [...standardConfig.cleaningRules,
        {
          name: '数字格式规范化',
          pattern: /(\d+)([a-zA-Z%]+)/g,
          replacement: '$1 $2',
          priority: 6
        },
        {
          name: '日期格式规范化',
          pattern: /(\d{4})[年/](\d{1,2})[月/](\d{1,2})[日]?/g,
          replacement: '$1-$2-$3',
          priority: 7
        }
      ],
      fieldMappings: standardConfig.fieldMappings,
      validationRules: standardConfig.validationRules,
      enableAI: true,
      enableSemanticAnalysis: true
    };

    this.configs.set('standard', standardConfig);
    this.configs.set('deep', deepConfig);
    this.configs.set('default', standardConfig); // 保持向后兼容
  }

  /**
   * 保存文件信息
   */
  async saveFileInfo(fileInfo) {
    // 同时保存到内存和数据库
    this.files.set(fileInfo.id, fileInfo);
    await this.databaseService.saveFileInfo(fileInfo);
    return fileInfo;
  }

  /**
   * 获取文件列表
   */
  async getFileList() {
    // 优先从数据库获取，如果失败则从内存获取
    try {
      return await this.databaseService.getFileList();
    } catch (error) {
      console.warn('从数据库获取文件列表失败，使用内存数据:', error.message);
      return Array.from(this.files.values()).sort((a, b) =>
        new Date(b.upload_time) - new Date(a.upload_time)
      );
    }
  }

  /**
   * 根据ID获取文件信息
   */
  async getFileById(fileId) {
    return this.files.get(fileId);
  }

  /**
   * 更新文件状态
   */
  async updateFileStatus(fileId, status) {
    const file = this.files.get(fileId);
    if (file) {
      file.status = status;
      file.updated_time = new Date().toISOString();
      this.files.set(fileId, file);
    }
    return file;
  }

  /**
   * 删除文件
   */
  async deleteFile(fileId) {
    const file = this.files.get(fileId);
    if (file) {
      // 删除物理文件
      try {
        if (fs.existsSync(file.filepath)) {
          fs.unlinkSync(file.filepath);
        }
      } catch (error) {
        console.warn('删除物理文件失败:', error.message);
      }
      
      // 删除记录
      this.files.delete(fileId);
      this.processResults.delete(fileId);
      return true;
    }
    return false;
  }

  /**
   * 处理文件
   */
  async processFile(fileInfo, config = {}) {
    console.log(`🔧 开始处理文件: ${fileInfo.filename}`);
    
    // 使用默认配置或传入的配置
    const processingConfig = { ...this.configs.get('default'), ...config };
    
    try {
      // 1. 内容解析与格式统一
      const parsedContent = await this.parseFileContent(fileInfo);
      
      // 2. 数据清洗
      const cleanedContent = await this.cleanData(parsedContent, processingConfig);
      
      // 3. 标签提取与结构化（支持AI增强）
      let structuredData = await this.extractStructuredData(cleanedContent, processingConfig);

      // 如果启用AI增强且有API密钥，使用AI模型进行增强提取
      if (processingConfig.enableAI && this.aiModelService.getModelStatus().available) {
        console.log('🤖 启用AI增强提取...');
        const aiEnhancedData = await this.aiModelService.batchExtractWithAI(cleanedContent);
        if (aiEnhancedData && aiEnhancedData.length > 0) {
          // 合并传统提取和AI提取的结果
          structuredData = this.mergeExtractionResults(structuredData, aiEnhancedData);
        }
      }
      
      // 4. 分块切片与数据转换
      const chunks = await this.chunkData(cleanedContent, processingConfig);
      
      // 5. 生成处理结果
      const result = {
        fileId: fileInfo.id,
        filename: fileInfo.filename,
        processTime: new Date().toISOString(),
        config: processingConfig,
        totalChunks: chunks.length,
        structuredFields: Object.keys(structuredData[0] || {}).length,
        rulesApplied: processingConfig.cleaningRules.length,
        qualityScore: this.calculateQualityScore(structuredData, chunks),
        structuredData: structuredData,
        chunks: chunks,
        logs: this.generateProcessingLogs(fileInfo, processingConfig)
      };
      
      // 保存处理结果到内存和数据库
      this.processResults.set(fileInfo.id, result);

      try {
        await this.databaseService.saveProcessResult(fileInfo.id, result);
        console.log(`✅ 处理结果已保存到数据库: ${fileInfo.filename}`);
      } catch (error) {
        console.warn('保存处理结果到数据库失败:', error.message);
      }

      console.log(`✅ 文件处理完成: ${fileInfo.filename}`);
      return result;
      
    } catch (error) {
      console.error(`❌ 文件处理失败: ${fileInfo.filename}`, error);
      throw error;
    }
  }

  /**
   * 解析文件内容
   */
  async parseFileContent(fileInfo) {
    console.log(`📑 解析文件内容: ${fileInfo.filename}`);

    // 根据文件类型进行不同的解析
    const ext = path.extname(fileInfo.filename).toLowerCase();

    switch (ext) {
      case '.txt':
        return this.parseTxtFile(fileInfo.filepath);
      case '.pdf':
        return this.parsePdfFile(fileInfo.filepath);
      case '.docx':
      case '.doc':
        return this.parseDocxFile(fileInfo.filepath);
      case '.xlsx':
      case '.xls':
        return this.parseExcelFile(fileInfo.filepath);
      case '.csv':
        return this.parseCsvFile(fileInfo.filepath);
      case '.json':
        return this.parseJsonFile(fileInfo.filepath);
      case '.xml':
        return this.parseXmlFile(fileInfo.filepath);
      case '.md':
        return this.parseMarkdownFile(fileInfo.filepath);
      case '.rtf':
        return this.parseRtfFile(fileInfo.filepath);
      case '.html':
      case '.htm':
        return this.parseHtmlFile(fileInfo.filepath);
      default:
        throw new Error(`不支持的文件类型: ${ext}。支持的格式: .txt, .pdf, .docx, .doc, .xlsx, .xls, .csv, .json, .xml, .md, .rtf, .html`);
    }
  }

  /**
   * 解析TXT文件
   */
  async parseTxtFile(filepath) {
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

  /**
   * 解析PDF文件（真实实现）
   */
  async parsePdfFile(filepath) {
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

  /**
   * 解析Word文件（真实实现）
   */
  async parseDocxFile(filepath) {
    console.log('📝 解析Word文件:', filepath);

    try {
      // 检查文件是否存在
      if (!fs.existsSync(filepath)) {
        throw new Error(`文件不存在: ${filepath}`);
      }

      // 读取文件内容
      const content = fs.readFileSync(filepath, 'utf-8');
      console.log(`📄 文件内容长度: ${content.length} 字符`);

      // 简单的文本解析（适用于.doc转换后的文本文件）
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

  /**
   * 解析Excel文件（模拟实现）
   */
  async parseExcelFile(filepath) {
    console.log('📊 解析Excel文件（模拟）');
    
    return [
      {
        chunk_id: 'XLSX_1',
        type: '表格行',
        source: 'xlsx',
        text: '物料编码: BXX-1001, 问题类型: 尺寸偏差, 责任部门: 质检部',
        position: '工作表1 第2行'
      }
    ];
  }

  /**
   * 解析CSV文件
   */
  async parseCsvFile(filepath) {
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

  /**
   * 解析JSON文件
   */
  async parseJsonFile(filepath) {
    console.log('📄 解析JSON文件');
    const content = fs.readFileSync(filepath, 'utf-8');
    const jsonData = JSON.parse(content);

    const parseObject = (obj, prefix = '', level = 0) => {
      const results = [];

      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          if (typeof item === 'object') {
            results.push(...parseObject(item, `${prefix}[${index}]`, level + 1));
          } else {
            results.push({
              chunk_id: `JSON_${prefix}[${index}]`,
              type: '数组项',
              source: 'json',
              text: `${prefix}[${index}]: ${item}`,
              position: `层级${level} 数组项${index}`,
              data: { key: `${prefix}[${index}]`, value: item }
            });
          }
        });
      } else if (typeof obj === 'object' && obj !== null) {
        Object.entries(obj).forEach(([key, value]) => {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          if (typeof value === 'object') {
            results.push(...parseObject(value, fullKey, level + 1));
          } else {
            results.push({
              chunk_id: `JSON_${fullKey}`,
              type: '对象属性',
              source: 'json',
              text: `${fullKey}: ${value}`,
              position: `层级${level} 属性${key}`,
              data: { key: fullKey, value: value }
            });
          }
        });
      }

      return results;
    };

    return parseObject(jsonData);
  }

  /**
   * 解析XML文件
   */
  async parseXmlFile(filepath) {
    console.log('📄 解析XML文件（简化版）');
    const content = fs.readFileSync(filepath, 'utf-8');

    // 简单的XML解析（实际应用中建议使用xml2js等库）
    const tagRegex = /<([^>]+)>([^<]*)<\/\1>/g;
    const results = [];
    let match;
    let index = 0;

    while ((match = tagRegex.exec(content)) !== null) {
      const [, tagName, tagContent] = match;
      if (tagContent.trim()) {
        results.push({
          chunk_id: `XML_${index + 1}`,
          type: 'XML标签',
          source: 'xml',
          text: `${tagName}: ${tagContent.trim()}`,
          position: `标签${tagName}`,
          data: { tag: tagName, content: tagContent.trim() }
        });
        index++;
      }
    }

    return results;
  }

  /**
   * 解析Markdown文件
   */
  async parseMarkdownFile(filepath) {
    console.log('📄 解析Markdown文件');
    const content = fs.readFileSync(filepath, 'utf-8');
    const lines = content.split('\n');
    const results = [];
    let index = 0;

    lines.forEach((line, lineIndex) => {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        let type = '段落';

        // 识别Markdown元素类型
        if (trimmedLine.startsWith('#')) {
          const level = trimmedLine.match(/^#+/)[0].length;
          type = `标题${level}`;
        } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
          type = '列表项';
        } else if (trimmedLine.startsWith('```')) {
          type = '代码块';
        } else if (trimmedLine.startsWith('> ')) {
          type = '引用';
        }

        results.push({
          chunk_id: `MD_${index + 1}`,
          type: type,
          source: 'markdown',
          text: trimmedLine,
          position: `第${lineIndex + 1}行`,
          data: { lineNumber: lineIndex + 1, type: type }
        });
        index++;
      }
    });

    return results;
  }

  /**
   * 解析RTF文件
   */
  async parseRtfFile(filepath) {
    console.log('📄 解析RTF文件（简化版）');
    const content = fs.readFileSync(filepath, 'utf-8');

    // 简单的RTF文本提取（去除RTF控制字符）
    const textContent = content
      .replace(/\\[a-z]+\d*\s?/g, '') // 移除RTF控制字
      .replace(/[{}]/g, '') // 移除大括号
      .replace(/\s+/g, ' ') // 规范化空格
      .trim();

    const paragraphs = textContent.split('\n').filter(p => p.trim());

    return paragraphs.map((text, index) => ({
      chunk_id: `RTF_${index + 1}`,
      type: '段落',
      source: 'rtf',
      text: text.trim(),
      position: `第${index + 1}段`
    }));
  }

  /**
   * 解析HTML文件
   */
  async parseHtmlFile(filepath) {
    console.log('📄 解析HTML文件（简化版）');
    const content = fs.readFileSync(filepath, 'utf-8');

    // 简单的HTML文本提取（去除HTML标签）
    const textContent = content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // 移除script标签
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // 移除style标签
      .replace(/<[^>]+>/g, ' ') // 移除所有HTML标签
      .replace(/\s+/g, ' ') // 规范化空格
      .trim();

    const paragraphs = textContent.split('\n').filter(p => p.trim());

    return paragraphs.map((text, index) => ({
      chunk_id: `HTML_${index + 1}`,
      type: '段落',
      source: 'html',
      text: text.trim(),
      position: `第${index + 1}段`
    }));
  }

  /**
   * 数据清洗
   */
  async cleanData(parsedContent, config) {
    console.log('🧽 执行数据清洗');
    
    return parsedContent.map(item => {
      let cleanedText = item.text;
      
      // 应用清洗规则
      config.cleaningRules.forEach(rule => {
        if (typeof rule.replacement === 'function') {
          cleanedText = cleanedText.replace(rule.pattern, rule.replacement);
        } else {
          cleanedText = cleanedText.replace(rule.pattern, rule.replacement);
        }
      });
      
      return {
        ...item,
        text: cleanedText.trim(),
        cleaned: true
      };
    });
  }

  /**
   * 提取结构化数据
   */
  async extractStructuredData(cleanedContent, config) {
    console.log('🏷️ 提取结构化数据');

    const structuredData = [];

    // 增强的字段提取逻辑
    cleanedContent.forEach(item => {
      const extracted = {};
      const text = item.text;

      // 1. 物料编码提取（支持多种格式）
      const materialCodePatterns = [
        /(?:物料编码|料号|PN|编码|代码)[：:\s]*([A-Z0-9\-_]+)/i,
        /([A-Z]{2,3}-[A-Z0-9\-_]+)/g, // 格式如 CS-B-聚3488
        /\b([A-Z]+\d{3,})\b/g // 格式如 AXX9938
      ];

      for (const pattern of materialCodePatterns) {
        const match = text.match(pattern);
        if (match) {
          extracted.MaterialCode = match[1] || match[0];
          break;
        }
      }

      // 2. 问题类型提取（扩展关键词）
      const issueTypePatterns = [
        /(?:问题类型|不良现象|故障类型|异常类型)[：:\s]*([^，,。.\n]+)/i,
        /(?:发现|出现|存在)([^，,。.\n]*(?:问题|异常|故障|缺陷|不良))/i,
        /(尺寸偏差|表面缺陷|功能异常|螺丝偏移|划痕|变形|开裂|色差)/i
      ];

      for (const pattern of issueTypePatterns) {
        const match = text.match(pattern);
        if (match) {
          extracted.IssueType = match[1].trim();
          break;
        }
      }

      // 3. 物料名称提取
      const materialNamePatterns = [
        /(?:物料名称|产品名称|零件名称)[：:\s]*([^，,。.\n]+)/i,
        /(电池盖|中框|手机卡托|侧键|装饰件|显示屏|充电器|电池|摄像头|扬声器|标签|保护套)/i
      ];

      for (const pattern of materialNamePatterns) {
        const match = text.match(pattern);
        if (match) {
          extracted.MaterialName = match[1].trim();
          break;
        }
      }

      // 4. 供应商提取
      const supplierPatterns = [
        /(?:供应商|厂商|制造商)[：:\s]*([^，,。.\n]+)/i,
        /(聚龙|华为|深圳精密|天马|东声|深奥|歌尔|丽德宝|富群|欣冠|广正|BOE|华星|奥海|瑞声|百佳达|盛泰|维科|辉阳|风华)(?:科技|技术|有限公司|公司)?/i
      ];

      for (const pattern of supplierPatterns) {
        const match = text.match(pattern);
        if (match) {
          extracted.Supplier = match[1].trim();
          break;
        }
      }

      // 5. 问题描述提取（更智能的识别）
      if (text.includes('问题描述') || text.includes('现象描述') || text.includes('故障描述')) {
        const descMatch = text.match(/(?:问题描述|现象描述|故障描述)[：:\s]*([^]+)/i);
        if (descMatch) {
          extracted.Description = descMatch[1].trim();
        }
      } else if (text.includes('发现') || text.includes('检测') || text.includes('出现')) {
        // 自动识别描述性文本
        if (text.length > 20 && (text.includes('偏差') || text.includes('超差') || text.includes('异常'))) {
          extracted.Description = text;
        }
      }

      // 6. 临时对策提取（支持多行）
      const actionPatterns = [
        /(?:临时对策|应急措施|处理措施|解决方案)[：:\s]*([^]+?)(?=责任部门|发生日期|处理状态|$)/i,
        /(?:对策|措施)[：:\s]*([^]+?)(?=责任部门|发生日期|处理状态|$)/i
      ];

      for (const pattern of actionPatterns) {
        const match = text.match(pattern);
        if (match) {
          extracted.TemporaryAction = match[1].trim().replace(/\d+\.\s*/g, ''); // 移除编号
          break;
        }
      }

      // 7. 责任部门提取
      const deptPatterns = [
        /(?:责任部门|负责单位|处理部门)[：:\s]*([^，,。.\n]+)/i,
        /(装配车间|质检部|包装车间|生产部|工程部|品质部)/i
      ];

      for (const pattern of deptPatterns) {
        const match = text.match(pattern);
        if (match) {
          extracted.ResponsibleDept = match[1].trim();
          break;
        }
      }

      // 8. 发生日期提取
      const datePatterns = [
        /(?:发生日期|问题日期|故障日期)[：:\s]*(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/i,
        /(\d{4}年\d{1,2}月\d{1,2}日)/i,
        /(\d{4}-\d{2}-\d{2})/g
      ];

      for (const pattern of datePatterns) {
        const match = text.match(pattern);
        if (match) {
          extracted.OccurrenceDate = match[1];
          break;
        }
      }

      // 9. 处理状态提取
      const statusPatterns = [
        /(?:处理状态|状态)[：:\s]*([^，,。.\n]+)/i,
        /(已完成|处理中|待处理|已关闭|进行中)/i
      ];

      for (const pattern of statusPatterns) {
        const match = text.match(pattern);
        if (match) {
          extracted.ProcessStatus = match[1].trim();
          break;
        }
      }

      // 10. 数值提取（尺寸、偏差等）
      const measurementPatterns = [
        /(\d+\.?\d*)\s*mm/g,
        /偏差[：:\s]*([+-]?\d+\.?\d*)/gi,
        /规格[：:\s]*(\d+\.?\d*[±]\d+\.?\d*)/gi
      ];

      const measurements = [];
      for (const pattern of measurementPatterns) {
        const matches = [...text.matchAll(pattern)];
        for (const match of matches) {
          measurements.push(match[1] || match[0]);
        }
      }

      if (measurements.length > 0) {
        extracted.Measurements = measurements.join(', ');
      }

      // 只有提取到有效字段才添加到结果中
      const validFields = Object.keys(extracted).filter(key =>
        key !== 'source_chunk' && key !== 'source_position' && extracted[key]
      );

      if (validFields.length > 0) {
        extracted.source_chunk = item.chunk_id;
        extracted.source_position = item.position;
        extracted.confidence = this.calculateExtractionConfidence(extracted, text);
        structuredData.push(extracted);
      }
    });

    return this.mergeRelatedRecords(structuredData);
  }

  /**
   * 计算提取置信度
   */
  calculateExtractionConfidence(extracted, originalText) {
    let score = 0;
    const totalFields = Object.keys(extracted).length - 2; // 排除source字段

    // 基于提取字段数量
    score += Math.min(totalFields * 10, 50);

    // 基于关键词匹配度
    const keywords = ['物料', '问题', '对策', '责任', '日期'];
    const matchedKeywords = keywords.filter(keyword => originalText.includes(keyword));
    score += matchedKeywords.length * 10;

    // 基于文本长度合理性
    if (originalText.length > 50 && originalText.length < 1000) {
      score += 20;
    }

    return Math.min(score, 100);
  }

  /**
   * 合并相关记录
   */
  mergeRelatedRecords(structuredData) {
    const merged = [];
    const processed = new Set();

    structuredData.forEach((record, index) => {
      if (processed.has(index)) return;

      // 查找相关记录（相同物料编码或相邻位置）
      const related = structuredData.filter((other, otherIndex) => {
        if (otherIndex === index || processed.has(otherIndex)) return false;

        return (
          (record.MaterialCode && record.MaterialCode === other.MaterialCode) ||
          (record.source_chunk && other.source_chunk &&
           Math.abs(parseInt(record.source_chunk.split('_')[1]) - parseInt(other.source_chunk.split('_')[1])) <= 2)
        );
      });

      // 合并相关记录
      const mergedRecord = { ...record };
      related.forEach((relatedRecord, relatedIndex) => {
        Object.keys(relatedRecord).forEach(key => {
          if (!mergedRecord[key] && relatedRecord[key] &&
              key !== 'source_chunk' && key !== 'source_position') {
            mergedRecord[key] = relatedRecord[key];
          }
        });
        processed.add(structuredData.indexOf(relatedRecord));
      });

      processed.add(index);
      merged.push(mergedRecord);
    });

    return merged;
  }

  /**
   * 合并传统提取和AI提取的结果
   */
  mergeExtractionResults(traditionalData, aiData) {
    console.log('🔄 合并传统提取和AI提取结果');

    const merged = [];
    const processedChunks = new Set();

    // 首先处理AI提取的结果（优先级更高）
    aiData.forEach(aiRecord => {
      const chunkId = aiRecord.source_chunk;
      if (chunkId) {
        processedChunks.add(chunkId);

        // 查找对应的传统提取结果
        const traditionalRecord = traditionalData.find(t => t.source_chunk === chunkId);

        if (traditionalRecord) {
          // 合并两种方法的结果，AI结果优先
          const mergedRecord = {
            ...traditionalRecord,
            ...aiRecord,
            extractionMethod: 'hybrid',
            traditionalConfidence: traditionalRecord.confidence || 0,
            aiConfidence: aiRecord.confidence || 0,
            finalConfidence: Math.max(
              traditionalRecord.confidence || 0,
              aiRecord.confidence || 0
            )
          };
          merged.push(mergedRecord);
        } else {
          // 只有AI提取结果
          merged.push({
            ...aiRecord,
            extractionMethod: 'ai-only',
            finalConfidence: aiRecord.confidence || 0
          });
        }
      }
    });

    // 添加只有传统提取结果的记录
    traditionalData.forEach(traditionalRecord => {
      const chunkId = traditionalRecord.source_chunk;
      if (chunkId && !processedChunks.has(chunkId)) {
        merged.push({
          ...traditionalRecord,
          extractionMethod: 'traditional-only',
          finalConfidence: traditionalRecord.confidence || 0
        });
      }
    });

    console.log(`✅ 合并完成，共 ${merged.length} 条记录`);
    return merged;
  }

  /**
   * 数据分块
   */
  async chunkData(cleanedContent, config) {
    console.log('🧩 执行数据分块');
    
    return cleanedContent.map(item => ({
      chunk_id: item.chunk_id,
      type: item.type,
      content: item.text,
      position: item.position,
      source: item.source,
      labels: this.generateLabels(item.text),
      metadata: {
        cleaned: item.cleaned,
        length: item.text.length,
        word_count: item.text.split(/\s+/).length
      }
    }));
  }

  /**
   * 生成标签
   */
  generateLabels(text) {
    const labels = [];
    
    // 基于关键词生成标签
    const keywordMap = {
      '问题描述': ['问题', '现象', '发现', '异常'],
      '物料信息': ['物料', '编码', '料号', 'PN'],
      '质量问题': ['不良', '缺陷', '偏差', '超差'],
      '处理措施': ['对策', '措施', '处理', '解决'],
      '责任归属': ['责任', '部门', '负责', '单位']
    };
    
    Object.entries(keywordMap).forEach(([label, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        labels.push(label);
      }
    });
    
    return labels;
  }

  /**
   * 计算质量评分
   */
  calculateQualityScore(structuredData, chunks) {
    let score = 0;
    
    // 基于提取的结构化字段数量
    const avgFields = structuredData.reduce((sum, item) => sum + Object.keys(item).length, 0) / Math.max(structuredData.length, 1);
    score += Math.min(avgFields * 10, 40);
    
    // 基于分块质量
    const avgChunkLength = chunks.reduce((sum, chunk) => sum + chunk.content.length, 0) / Math.max(chunks.length, 1);
    if (avgChunkLength > 20 && avgChunkLength < 500) {
      score += 30;
    }
    
    // 基于标签覆盖率
    const totalLabels = chunks.reduce((sum, chunk) => sum + chunk.labels.length, 0);
    score += Math.min(totalLabels, 30);
    
    return Math.round(score);
  }

  /**
   * 生成处理日志
   */
  generateProcessingLogs(fileInfo, config) {
    return [
      {
        id: 1,
        level: 'INFO',
        timestamp: new Date().toISOString(),
        message: `开始处理文件: ${fileInfo.filename}`
      },
      {
        id: 2,
        level: 'INFO',
        timestamp: new Date().toISOString(),
        message: `应用清洗规则: ${config.cleaningRules.length} 条`
      },
      {
        id: 3,
        level: 'INFO',
        timestamp: new Date().toISOString(),
        message: `提取字段配置: ${config.extractFields.join(', ')}`
      },
      {
        id: 4,
        level: 'INFO',
        timestamp: new Date().toISOString(),
        message: '文件处理完成'
      }
    ];
  }

  /**
   * 获取配置模板
   */
  async getConfigTemplates() {
    return Array.from(this.configs.values());
  }

  /**
   * 保存配置
   */
  async saveConfig(config) {
    const configId = config.id || Date.now().toString();
    config.id = configId;
    config.created_time = new Date().toISOString();
    
    this.configs.set(configId, config);
    return config;
  }

  /**
   * 导出结果
   */
  async exportResult(fileId, format) {
    const result = this.processResults.get(fileId);
    if (!result) {
      return null;
    }
    
    if (format === 'json') {
      return result;
    } else if (format === 'csv') {
      // 转换为CSV格式
      const csvData = result.structuredData.map(item => {
        return Object.values(item).join(',');
      }).join('\n');
      
      const headers = Object.keys(result.structuredData[0] || {}).join(',');
      return headers + '\n' + csvData;
    }
    
    return result;
  }

  /**
   * 获取处理统计信息
   */
  async getProcessingStats() {
    const files = Array.from(this.files.values());
    const results = Array.from(this.processResults.values());
    
    return {
      totalFiles: files.length,
      processedFiles: files.filter(f => f.status === '已处理').length,
      pendingFiles: files.filter(f => f.status === '待处理').length,
      failedFiles: files.filter(f => f.status === '失败').length,
      totalChunks: results.reduce((sum, r) => sum + r.totalChunks, 0),
      totalStructuredFields: results.reduce((sum, r) => sum + r.structuredFields, 0),
      avgQualityScore: results.length > 0 ? 
        Math.round(results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length) : 0
    };
  }
}
