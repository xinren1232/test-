/**
 * AI模型集成服务
 * 提供NLP模型支持以提升数据提取准确性
 */

import fetch from 'node-fetch';

export class AIModelService {
  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || '';
    this.apiUrl = 'https://api.deepseek.com/v1/chat/completions';
    this.modelName = 'deepseek-chat';
    
    // 预定义的提取模板
    this.extractionTemplates = {
      materialInfo: {
        prompt: `请从以下文本中提取物料相关信息，以JSON格式返回：
{
  "MaterialCode": "物料编码",
  "MaterialName": "物料名称", 
  "Supplier": "供应商",
  "Category": "物料分类"
}

文本内容：`,
        fields: ['MaterialCode', 'MaterialName', 'Supplier', 'Category']
      },
      
      qualityIssue: {
        prompt: `请从以下质量问题文本中提取关键信息，以JSON格式返回：
{
  "IssueType": "问题类型",
  "Description": "问题描述",
  "Severity": "严重程度",
  "ImpactArea": "影响范围"
}

文本内容：`,
        fields: ['IssueType', 'Description', 'Severity', 'ImpactArea']
      },
      
      actionPlan: {
        prompt: `请从以下文本中提取处理措施信息，以JSON格式返回：
{
  "TemporaryAction": "临时对策",
  "PermanentAction": "永久对策",
  "ResponsibleDept": "责任部门",
  "Timeline": "处理时限"
}

文本内容：`,
        fields: ['TemporaryAction', 'PermanentAction', 'ResponsibleDept', 'Timeline']
      },
      
      comprehensive: {
        prompt: `请从以下质量案例文本中提取所有相关信息，以JSON格式返回：
{
  "MaterialCode": "物料编码",
  "MaterialName": "物料名称",
  "Supplier": "供应商",
  "IssueType": "问题类型",
  "Description": "详细描述",
  "TemporaryAction": "临时对策",
  "ResponsibleDept": "责任部门",
  "OccurrenceDate": "发生日期",
  "ProcessStatus": "处理状态",
  "Measurements": "相关数值"
}

请确保提取的信息准确完整，如果某个字段在文本中没有明确提及，请返回空字符串。

文本内容：`,
        fields: ['MaterialCode', 'MaterialName', 'Supplier', 'IssueType', 'Description', 
                'TemporaryAction', 'ResponsibleDept', 'OccurrenceDate', 'ProcessStatus', 'Measurements']
      }
    };
  }

  /**
   * 使用AI模型提取结构化数据
   */
  async extractWithAI(text, templateType = 'comprehensive') {
    if (!this.apiKey) {
      console.warn('⚠️ AI API密钥未配置，使用传统提取方法');
      return null;
    }

    try {
      const template = this.extractionTemplates[templateType];
      if (!template) {
        throw new Error(`未知的模板类型: ${templateType}`);
      }

      console.log(`🤖 使用AI模型提取数据 (模板: ${templateType})`);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            {
              role: 'user',
              content: template.prompt + '\n\n' + text
            }
          ],
          temperature: 0.1,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`AI API请求失败: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const extractedText = result.choices[0]?.message?.content;

      if (!extractedText) {
        throw new Error('AI模型返回空结果');
      }

      // 解析JSON结果
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extractedData = JSON.parse(jsonMatch[0]);
        
        // 清理空值和无效数据
        const cleanedData = {};
        Object.keys(extractedData).forEach(key => {
          const value = extractedData[key];
          if (value && typeof value === 'string' && value.trim() !== '' && value !== '无' && value !== 'N/A') {
            cleanedData[key] = value.trim();
          }
        });

        console.log(`✅ AI提取成功，提取到 ${Object.keys(cleanedData).length} 个字段`);
        return {
          ...cleanedData,
          aiExtracted: true,
          confidence: this.calculateAIConfidence(cleanedData, text),
          model: this.modelName,
          template: templateType
        };
      } else {
        throw new Error('无法解析AI返回的JSON格式');
      }

    } catch (error) {
      console.error('❌ AI提取失败:', error.message);
      return null;
    }
  }

  /**
   * 批量AI提取
   */
  async batchExtractWithAI(textChunks, templateType = 'comprehensive') {
    const results = [];
    
    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      console.log(`🔄 处理第 ${i + 1}/${textChunks.length} 个文本块`);
      
      const extracted = await this.extractWithAI(chunk.text, templateType);
      if (extracted) {
        results.push({
          ...extracted,
          source_chunk: chunk.chunk_id,
          source_position: chunk.position
        });
      }
      
      // 添加延迟避免API限流
      if (i < textChunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  /**
   * 智能文本分类
   */
  async classifyText(text) {
    if (!this.apiKey) {
      return this.fallbackClassification(text);
    }

    try {
      const prompt = `请对以下文本进行分类，从以下类别中选择最合适的一个：
1. 质量问题报告
2. 处理措施说明
3. 物料信息描述
4. 检验结果记录
5. 其他

请只返回类别名称，不要其他解释。

文本内容：${text}`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          max_tokens: 50
        })
      });

      if (response.ok) {
        const result = await response.json();
        const classification = result.choices[0]?.message?.content?.trim();
        return classification || '其他';
      }
    } catch (error) {
      console.error('文本分类失败:', error.message);
    }

    return this.fallbackClassification(text);
  }

  /**
   * 后备分类方法
   */
  fallbackClassification(text) {
    const keywords = {
      '质量问题报告': ['问题', '异常', '故障', '缺陷', '不良', '偏差'],
      '处理措施说明': ['对策', '措施', '处理', '解决', '改善', '整改'],
      '物料信息描述': ['物料', '编码', '供应商', '规格', '型号'],
      '检验结果记录': ['检验', '测试', '检测', '合格', '不合格', '结果']
    };

    for (const [category, keywordList] of Object.entries(keywords)) {
      if (keywordList.some(keyword => text.includes(keyword))) {
        return category;
      }
    }

    return '其他';
  }

  /**
   * 计算AI提取置信度
   */
  calculateAIConfidence(extractedData, originalText) {
    let score = 0;
    
    // 基于提取字段数量
    const fieldCount = Object.keys(extractedData).filter(key => 
      !['aiExtracted', 'confidence', 'model', 'template'].includes(key)
    ).length;
    score += Math.min(fieldCount * 15, 60);
    
    // 基于字段内容质量
    Object.values(extractedData).forEach(value => {
      if (typeof value === 'string' && value.length > 3) {
        score += 5;
      }
    });
    
    // 基于原文本长度
    if (originalText.length > 100) {
      score += 20;
    }
    
    return Math.min(score, 100);
  }

  /**
   * 智能数据验证
   */
  async validateExtractedData(extractedData, originalText) {
    const validationResults = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // 验证物料编码格式
    if (extractedData.MaterialCode) {
      const codePattern = /^[A-Z]{2,3}-[A-Z0-9\-_]+$/;
      if (!codePattern.test(extractedData.MaterialCode)) {
        validationResults.warnings.push('物料编码格式可能不标准');
      }
    }

    // 验证日期格式
    if (extractedData.OccurrenceDate) {
      const datePattern = /^\d{4}[-\/]\d{1,2}[-\/]\d{1,2}$/;
      if (!datePattern.test(extractedData.OccurrenceDate)) {
        validationResults.warnings.push('日期格式可能不正确');
      }
    }

    // 验证必填字段
    const requiredFields = ['MaterialCode', 'IssueType'];
    requiredFields.forEach(field => {
      if (!extractedData[field]) {
        validationResults.errors.push(`缺少必填字段: ${field}`);
        validationResults.isValid = false;
      }
    });

    // 验证数据一致性
    if (extractedData.Description && originalText) {
      const similarity = this.calculateTextSimilarity(extractedData.Description, originalText);
      if (similarity < 0.3) {
        validationResults.warnings.push('提取的描述与原文相似度较低');
      }
    }

    return validationResults;
  }

  /**
   * 计算文本相似度（简化版）
   */
  calculateTextSimilarity(text1, text2) {
    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * 获取AI模型状态
   */
  getModelStatus() {
    return {
      available: !!this.apiKey,
      model: this.modelName,
      templates: Object.keys(this.extractionTemplates),
      apiUrl: this.apiUrl
    };
  }
}
