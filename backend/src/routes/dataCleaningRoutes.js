/**
 * 数据清洗治理路由
 * 支持历史案例数据的清洗、转换和关键信息提取
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { DataCleaningService } from '../services/dataCleaningService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const dataCleaningService = new DataCleaningService();

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/data-cleaning');
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
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'), false);
    }
  }
});

// 文件上传接口
router.post('/upload', upload.array('files', 10), async (req, res) => {
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
      
      // 保存文件信息到数据库（这里先用内存存储）
      await dataCleaningService.saveFileInfo(fileInfo);
      uploadedFiles.push(fileInfo);
      
      console.log(`✅ 文件上传成功: ${file.originalname}`);
    }

    res.json({
      success: true,
      message: `成功上传 ${uploadedFiles.length} 个文件`,
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

// 获取文件列表
router.get('/files', async (req, res) => {
  try {
    console.log('📋 获取文件列表');
    
    const files = await dataCleaningService.getFileList();
    
    res.json({
      success: true,
      data: files
    });

  } catch (error) {
    console.error('❌ 获取文件列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取文件列表失败: ' + error.message
    });
  }
});

// 处理单个文件
router.post('/process/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { config } = req.body;
    
    console.log(`🔧 开始处理文件: ${fileId}`);
    console.log('📝 处理配置:', config);
    
    // 获取文件信息
    const fileInfo = await dataCleaningService.getFileById(fileId);
    if (!fileInfo) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      });
    }
    
    // 更新文件状态为处理中
    await dataCleaningService.updateFileStatus(fileId, '处理中');
    
    // 开始处理流程
    const result = await dataCleaningService.processFile(fileInfo, config);
    
    // 更新文件状态为已处理
    await dataCleaningService.updateFileStatus(fileId, '已处理');
    
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
      await dataCleaningService.updateFileStatus(req.params.fileId, '失败');
    }
    
    res.status(500).json({
      success: false,
      message: '文件处理失败: ' + error.message
    });
  }
});

// 删除文件
router.delete('/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    console.log(`🗑️ 删除文件: ${fileId}`);
    
    const result = await dataCleaningService.deleteFile(fileId);
    
    if (result) {
      res.json({
        success: true,
        message: '文件删除成功'
      });
    } else {
      res.status(404).json({
        success: false,
        message: '文件不存在'
      });
    }

  } catch (error) {
    console.error('❌ 删除文件失败:', error);
    res.status(500).json({
      success: false,
      message: '删除文件失败: ' + error.message
    });
  }
});

// 获取清洗配置模板
router.get('/config/templates', async (req, res) => {
  try {
    console.log('📋 获取清洗配置模板');
    
    const templates = await dataCleaningService.getConfigTemplates();
    
    res.json({
      success: true,
      data: templates
    });

  } catch (error) {
    console.error('❌ 获取配置模板失败:', error);
    res.status(500).json({
      success: false,
      message: '获取配置模板失败: ' + error.message
    });
  }
});

// 保存清洗配置
router.post('/config', async (req, res) => {
  try {
    const { config } = req.body;
    
    console.log('💾 保存清洗配置');
    console.log('📝 配置内容:', config);
    
    const result = await dataCleaningService.saveConfig(config);
    
    res.json({
      success: true,
      message: '配置保存成功',
      data: result
    });

  } catch (error) {
    console.error('❌ 保存配置失败:', error);
    res.status(500).json({
      success: false,
      message: '保存配置失败: ' + error.message
    });
  }
});

// 导出处理结果
router.get('/export/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { format = 'json' } = req.query;
    
    console.log(`📤 导出处理结果: ${fileId}, 格式: ${format}`);
    
    const result = await dataCleaningService.exportResult(fileId, format);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: '处理结果不存在'
      });
    }
    
    // 设置响应头
    const filename = `processed_${fileId}.${format}`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(result, null, 2));
    } else if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.send(result);
    } else {
      res.status(400).json({
        success: false,
        message: '不支持的导出格式'
      });
    }

  } catch (error) {
    console.error('❌ 导出结果失败:', error);
    res.status(500).json({
      success: false,
      message: '导出结果失败: ' + error.message
    });
  }
});

// 获取处理统计信息
router.get('/stats', async (req, res) => {
  try {
    console.log('📊 获取处理统计信息');
    
    const stats = await dataCleaningService.getProcessingStats();
    
    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ 获取统计信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计信息失败: ' + error.message
    });
  }
});

export default router;
