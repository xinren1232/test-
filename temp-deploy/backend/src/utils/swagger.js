/**
 * Swagger文档配置
 * 提供API文档生成功能
 */
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { logger } from './logger.js';

// Swagger文档选项
const swaggerOptions = {
  definition: {
          openapi: '3.0.0',
          info: {
            title: 'IQE智能质检系统统一助手API',
            version: '1.0.0',
            description: '提供质量检验、实验室测试和生产线相关的查询服务',
            contact: {
              name: 'IQE团队'
      }
          },
          servers: [
            {
        url: '/api',
        description: 'API服务器'
            }
          ],
          components: {
            schemas: {
              Error: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  error: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                  example: '错误信息'
                },
                      code: {
                        type: 'string',
                  example: 'ERROR_CODE'
                      }
                    }
                  }
                }
              },
              QueryRequest: {
                type: 'object',
                required: ['query'],
                properties: {
                  query: {
                    type: 'string',
              example: '查询批次B12345的质量数据'
                  },
                  mode: {
                    type: 'string',
                    enum: ['auto', 'quality', 'lab', 'production'],
              default: 'auto',
              example: 'auto'
                  },
                  sessionId: {
                    type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440000'
                  },
                  context: {
                    type: 'object',
              example: {}
                  }
                }
              },
              QueryResponse: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  data: {
                    type: 'object',
                    properties: {
                      answer: {
                        type: 'string',
                  example: '批次B12345的质量检验结果显示合格率为98.5%，主要不合格原因是尺寸偏差。'
                      },
                      mode: {
                              type: 'string',
                              example: 'quality'
                  },
                  sessionId: {
                    type: 'string',
                  example: '550e8400-e29b-41d4-a716-446655440000'
                      },
                      structuredData: {
                        type: 'object',
                  example: {
                    batchId: 'B12345',
                    passRate: 0.985,
                    issues: ['尺寸偏差']
                  }
                }
              }
            }
                      }
                    }
                  }
                }
              },
  apis: ['./src/controllers/*.js']
};

// 生成Swagger规范
const swaggerSpec = swaggerJsdoc(swaggerOptions);

/**
 * 设置Swagger文档路由
 * @param {Express} app Express应用实例
 */
export function swaggerDocs(app) {
  // Swagger UI路由
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  // 提供swagger.json
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  logger.info('Swagger文档已配置，访问地址: /api-docs');
} 