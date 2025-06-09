/**
 * Swagger API文档工具
 */
import { fileURLToPath } from 'url';
import path from 'path';
import { logger } from './logger.js';

/**
 * 为Express应用配置Swagger文档
 * @param {Express} app Express应用实例
 */
export function swaggerDocs(app) {
  try {
    // 动态导入swagger-ui-express（因为它是CommonJS模块）
    import('swagger-ui-express')
      .then((swaggerUi) => {
        // 获取swagger定义
        const swaggerDefinition = {
          openapi: '3.0.0',
          info: {
            title: 'IQE智能质检系统统一助手API',
            version: '1.0.0',
            description: '提供质量检验、实验室测试和生产线相关的查询服务',
            contact: {
              name: 'IQE团队'
            },
          },
          servers: [
            {
              url: 'http://localhost:3001',
              description: '开发服务器'
            }
          ],
          tags: [
            {
              name: 'assistant',
              description: '统一助手API'
            },
            {
              name: 'health',
              description: '健康检查API'
            }
          ],
          components: {
            schemas: {
              // 查询请求
              QueryRequest: {
                type: 'object',
                required: ['query'],
                properties: {
                  query: {
                    type: 'string',
                    description: '用户查询文本'
                  },
                  mode: {
                    type: 'string',
                    description: '助手模式',
                    enum: ['auto', 'quality', 'lab', 'production'],
                    default: 'auto'
                  },
                  sessionId: {
                    type: 'string',
                    description: '会话ID，用于维护对话上下文',
                    example: 'sess_abc123'
                  },
                  context: {
                    type: 'object',
                    description: '额外上下文信息'
                  }
                }
              },
              // 查询响应
              QueryResponse: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    description: '请求是否成功'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      answer: {
                        type: 'string',
                        description: '助手回答'
                      },
                      mode: {
                        type: 'string',
                        description: '使用的助手模式',
                        enum: ['quality', 'lab', 'production']
                      },
                      sessionId: {
                        type: 'string',
                        description: '会话ID'
                      },
                      context: {
                        type: 'object',
                        description: '更新后的上下文'
                      },
                      structuredData: {
                        type: 'object',
                        description: '结构化数据（如果有）'
                      }
                    }
                  }
                }
              },
              // 错误响应
              ErrorResponse: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  error: {
                    type: 'object',
                    properties: {
                      code: {
                        type: 'string',
                        description: '错误代码'
                      },
                      message: {
                        type: 'string',
                        description: '错误信息'
                      },
                      requestId: {
                        type: 'string',
                        description: '请求ID'
                      }
                    }
                  }
                }
              },
              // 模式列表响应
              ModesResponse: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  data: {
                    type: 'object',
                    properties: {
                      modes: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: {
                              type: 'string',
                              example: 'quality'
                            },
                            name: {
                              type: 'string',
                              example: '质量检验助手'
                            },
                            description: {
                              type: 'string',
                              example: '处理质量检验相关的问题'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              // 健康检查响应
              HealthResponse: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    example: 'ok'
                  },
                  version: {
                    type: 'string',
                    example: '1.0.0'
                  },
                  uptime: {
                    type: 'number',
                    example: 123.45
                  }
                }
              }
            },
            responses: {
              Success: {
                description: '成功响应',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: {
                          type: 'boolean',
                          example: true
                        },
                        data: {
                          type: 'object'
                        }
                      }
                    }
                  }
                }
              },
              Error: {
                description: '错误响应',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ErrorResponse'
                    }
                  }
                }
              }
            }
          },
          paths: {
            '/api/assistant/query': {
              post: {
                tags: ['assistant'],
                summary: '处理用户查询',
                description: '处理用户查询，返回助手响应',
                requestBody: {
                  required: true,
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '#/components/schemas/QueryRequest'
                      }
                    }
                  }
                },
                responses: {
                  '200': {
                    description: '查询成功',
                    content: {
                      'application/json': {
                        schema: {
                          $ref: '#/components/schemas/QueryResponse'
                        }
                      }
                    }
                  },
                  '400': {
                    $ref: '#/components/responses/Error'
                  },
                  '500': {
                    $ref: '#/components/responses/Error'
                  }
                }
              }
            },
            '/api/assistant/session/{sessionId}': {
              delete: {
                tags: ['assistant'],
                summary: '清除会话',
                description: '清除指定会话的上下文',
                parameters: [
                  {
                    name: 'sessionId',
                    in: 'path',
                    required: true,
                    schema: {
                      type: 'string'
                    },
                    description: '会话ID'
                  }
                ],
                responses: {
                  '200': {
                    description: '会话已清除',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            success: {
                              type: 'boolean',
                              example: true
                            },
                            data: {
                              type: 'object',
                              properties: {
                                message: {
                                  type: 'string',
                                  example: '会话已清除'
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  '404': {
                    $ref: '#/components/responses/Error'
                  },
                  '500': {
                    $ref: '#/components/responses/Error'
                  }
                }
              }
            },
            '/api/assistant/modes': {
              get: {
                tags: ['assistant'],
                summary: '获取支持的助手模式',
                description: '返回系统支持的所有助手模式',
                responses: {
                  '200': {
                    description: '成功获取模式列表',
                    content: {
                      'application/json': {
                        schema: {
                          $ref: '#/components/schemas/ModesResponse'
                        }
                      }
                    }
                  },
                  '500': {
                    $ref: '#/components/responses/Error'
                  }
                }
              }
            },
            '/health': {
              get: {
                tags: ['health'],
                summary: '健康检查',
                description: '检查API服务状态',
                responses: {
                  '200': {
                    description: '服务正常',
                    content: {
                      'application/json': {
                        schema: {
                          $ref: '#/components/schemas/HealthResponse'
                        }
                      }
                    }
                  },
                  '500': {
                    description: '服务异常',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            status: {
                              type: 'string',
                              example: 'error'
                            },
                            error: {
                              type: 'string'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        };
        
        // 设置Swagger UI
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDefinition));
        logger.info('Swagger API文档已配置，可访问 /api-docs');
      })
      .catch(err => {
        logger.warn('无法加载Swagger UI', { error: err.message });
        
        // 如果Swagger不可用，提供一个简单的API文档页面
        app.get('/api-docs', (req, res) => {
          res.send(`
            <html>
              <head>
                <title>IQE API 文档</title>
                <style>
                  body { font-family: system-ui, sans-serif; margin: 2rem; }
                  h1 { color: #333; }
                  p { color: #666; }
                  .info { background: #f8f9fa; padding: 1rem; border-radius: 4px; }
                </style>
              </head>
              <body>
                <h1>IQE API 文档</h1>
                <div class="info">
                  <p>Swagger UI 未加载。</p>
                  <p>请确保已安装 swagger-ui-express 依赖:</p>
                  <pre>npm install swagger-ui-express</pre>
                </div>
                <p>API 端点:</p>
                <ul>
                  <li><code>POST /api/assistant/query</code> - 处理用户查询</li>
                  <li><code>DELETE /api/assistant/session/:sessionId</code> - 清除会话</li>
                  <li><code>GET /api/assistant/modes</code> - 获取支持的助手模式</li>
                  <li><code>GET /health</code> - 健康检查</li>
                </ul>
              </body>
            </html>
          `);
        });
      });
  } catch (error) {
    logger.warn('配置Swagger文档时出错', { error: error.message });
  }
} 
 * Swagger API文档工具
 */
import { fileURLToPath } from 'url';
import path from 'path';
import { logger } from './logger.js';

/**
 * 为Express应用配置Swagger文档
 * @param {Express} app Express应用实例
 */
export function swaggerDocs(app) {
  try {
    // 动态导入swagger-ui-express（因为它是CommonJS模块）
    import('swagger-ui-express')
      .then((swaggerUi) => {
        // 获取swagger定义
        const swaggerDefinition = {
          openapi: '3.0.0',
          info: {
            title: 'IQE智能质检系统统一助手API',
            version: '1.0.0',
            description: '提供质量检验、实验室测试和生产线相关的查询服务',
            contact: {
              name: 'IQE团队'
            },
          },
          servers: [
            {
              url: 'http://localhost:3001',
              description: '开发服务器'
            }
          ],
          tags: [
            {
              name: 'assistant',
              description: '统一助手API'
            },
            {
              name: 'health',
              description: '健康检查API'
            }
          ],
          components: {
            schemas: {
              // 查询请求
              QueryRequest: {
                type: 'object',
                required: ['query'],
                properties: {
                  query: {
                    type: 'string',
                    description: '用户查询文本'
                  },
                  mode: {
                    type: 'string',
                    description: '助手模式',
                    enum: ['auto', 'quality', 'lab', 'production'],
                    default: 'auto'
                  },
                  sessionId: {
                    type: 'string',
                    description: '会话ID，用于维护对话上下文',
                    example: 'sess_abc123'
                  },
                  context: {
                    type: 'object',
                    description: '额外上下文信息'
                  }
                }
              },
              // 查询响应
              QueryResponse: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    description: '请求是否成功'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      answer: {
                        type: 'string',
                        description: '助手回答'
                      },
                      mode: {
                        type: 'string',
                        description: '使用的助手模式',
                        enum: ['quality', 'lab', 'production']
                      },
                      sessionId: {
                        type: 'string',
                        description: '会话ID'
                      },
                      context: {
                        type: 'object',
                        description: '更新后的上下文'
                      },
                      structuredData: {
                        type: 'object',
                        description: '结构化数据（如果有）'
                      }
                    }
                  }
                }
              },
              // 错误响应
              ErrorResponse: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  error: {
                    type: 'object',
                    properties: {
                      code: {
                        type: 'string',
                        description: '错误代码'
                      },
                      message: {
                        type: 'string',
                        description: '错误信息'
                      },
                      requestId: {
                        type: 'string',
                        description: '请求ID'
                      }
                    }
                  }
                }
              },
              // 模式列表响应
              ModesResponse: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  data: {
                    type: 'object',
                    properties: {
                      modes: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: {
                              type: 'string',
                              example: 'quality'
                            },
                            name: {
                              type: 'string',
                              example: '质量检验助手'
                            },
                            description: {
                              type: 'string',
                              example: '处理质量检验相关的问题'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              // 健康检查响应
              HealthResponse: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    example: 'ok'
                  },
                  version: {
                    type: 'string',
                    example: '1.0.0'
                  },
                  uptime: {
                    type: 'number',
                    example: 123.45
                  }
                }
              }
            },
            responses: {
              Success: {
                description: '成功响应',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: {
                          type: 'boolean',
                          example: true
                        },
                        data: {
                          type: 'object'
                        }
                      }
                    }
                  }
                }
              },
              Error: {
                description: '错误响应',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ErrorResponse'
                    }
                  }
                }
              }
            }
          },
          paths: {
            '/api/assistant/query': {
              post: {
                tags: ['assistant'],
                summary: '处理用户查询',
                description: '处理用户查询，返回助手响应',
                requestBody: {
                  required: true,
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '#/components/schemas/QueryRequest'
                      }
                    }
                  }
                },
                responses: {
                  '200': {
                    description: '查询成功',
                    content: {
                      'application/json': {
                        schema: {
                          $ref: '#/components/schemas/QueryResponse'
                        }
                      }
                    }
                  },
                  '400': {
                    $ref: '#/components/responses/Error'
                  },
                  '500': {
                    $ref: '#/components/responses/Error'
                  }
                }
              }
            },
            '/api/assistant/session/{sessionId}': {
              delete: {
                tags: ['assistant'],
                summary: '清除会话',
                description: '清除指定会话的上下文',
                parameters: [
                  {
                    name: 'sessionId',
                    in: 'path',
                    required: true,
                    schema: {
                      type: 'string'
                    },
                    description: '会话ID'
                  }
                ],
                responses: {
                  '200': {
                    description: '会话已清除',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            success: {
                              type: 'boolean',
                              example: true
                            },
                            data: {
                              type: 'object',
                              properties: {
                                message: {
                                  type: 'string',
                                  example: '会话已清除'
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  '404': {
                    $ref: '#/components/responses/Error'
                  },
                  '500': {
                    $ref: '#/components/responses/Error'
                  }
                }
              }
            },
            '/api/assistant/modes': {
              get: {
                tags: ['assistant'],
                summary: '获取支持的助手模式',
                description: '返回系统支持的所有助手模式',
                responses: {
                  '200': {
                    description: '成功获取模式列表',
                    content: {
                      'application/json': {
                        schema: {
                          $ref: '#/components/schemas/ModesResponse'
                        }
                      }
                    }
                  },
                  '500': {
                    $ref: '#/components/responses/Error'
                  }
                }
              }
            },
            '/health': {
              get: {
                tags: ['health'],
                summary: '健康检查',
                description: '检查API服务状态',
                responses: {
                  '200': {
                    description: '服务正常',
                    content: {
                      'application/json': {
                        schema: {
                          $ref: '#/components/schemas/HealthResponse'
                        }
                      }
                    }
                  },
                  '500': {
                    description: '服务异常',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            status: {
                              type: 'string',
                              example: 'error'
                            },
                            error: {
                              type: 'string'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        };
        
        // 设置Swagger UI
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDefinition));
        logger.info('Swagger API文档已配置，可访问 /api-docs');
      })
      .catch(err => {
        logger.warn('无法加载Swagger UI', { error: err.message });
        
        // 如果Swagger不可用，提供一个简单的API文档页面
        app.get('/api-docs', (req, res) => {
          res.send(`
            <html>
              <head>
                <title>IQE API 文档</title>
                <style>
                  body { font-family: system-ui, sans-serif; margin: 2rem; }
                  h1 { color: #333; }
                  p { color: #666; }
                  .info { background: #f8f9fa; padding: 1rem; border-radius: 4px; }
                </style>
              </head>
              <body>
                <h1>IQE API 文档</h1>
                <div class="info">
                  <p>Swagger UI 未加载。</p>
                  <p>请确保已安装 swagger-ui-express 依赖:</p>
                  <pre>npm install swagger-ui-express</pre>
                </div>
                <p>API 端点:</p>
                <ul>
                  <li><code>POST /api/assistant/query</code> - 处理用户查询</li>
                  <li><code>DELETE /api/assistant/session/:sessionId</code> - 清除会话</li>
                  <li><code>GET /api/assistant/modes</code> - 获取支持的助手模式</li>
                  <li><code>GET /health</code> - 健康检查</li>
                </ul>
              </body>
            </html>
          `);
        });
      });
  } catch (error) {
    logger.warn('配置Swagger文档时出错', { error: error.message });
  }
} 
 * Swagger API文档工具
 */
import { fileURLToPath } from 'url';
import path from 'path';
import { logger } from './logger.js';

/**
 * 为Express应用配置Swagger文档
 * @param {Express} app Express应用实例
 */
export function swaggerDocs(app) {
  try {
    // 动态导入swagger-ui-express（因为它是CommonJS模块）
    import('swagger-ui-express')
      .then((swaggerUi) => {
        // 获取swagger定义
        const swaggerDefinition = {
          openapi: '3.0.0',
          info: {
            title: 'IQE智能质检系统统一助手API',
            version: '1.0.0',
            description: '提供质量检验、实验室测试和生产线相关的查询服务',
            contact: {
              name: 'IQE团队'
            },
          },
          servers: [
            {
              url: 'http://localhost:3001',
              description: '开发服务器'
            }
          ],
          tags: [
            {
              name: 'assistant',
              description: '统一助手API'
            },
            {
              name: 'health',
              description: '健康检查API'
            }
          ],
          components: {
            schemas: {
              // 查询请求
              QueryRequest: {
                type: 'object',
                required: ['query'],
                properties: {
                  query: {
                    type: 'string',
                    description: '用户查询文本'
                  },
                  mode: {
                    type: 'string',
                    description: '助手模式',
                    enum: ['auto', 'quality', 'lab', 'production'],
                    default: 'auto'
                  },
                  sessionId: {
                    type: 'string',
                    description: '会话ID，用于维护对话上下文',
                    example: 'sess_abc123'
                  },
                  context: {
                    type: 'object',
                    description: '额外上下文信息'
                  }
                }
              },
              // 查询响应
              QueryResponse: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    description: '请求是否成功'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      answer: {
                        type: 'string',
                        description: '助手回答'
                      },
                      mode: {
                        type: 'string',
                        description: '使用的助手模式',
                        enum: ['quality', 'lab', 'production']
                      },
                      sessionId: {
                        type: 'string',
                        description: '会话ID'
                      },
                      context: {
                        type: 'object',
                        description: '更新后的上下文'
                      },
                      structuredData: {
                        type: 'object',
                        description: '结构化数据（如果有）'
                      }
                    }
                  }
                }
              },
              // 错误响应
              ErrorResponse: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  error: {
                    type: 'object',
                    properties: {
                      code: {
                        type: 'string',
                        description: '错误代码'
                      },
                      message: {
                        type: 'string',
                        description: '错误信息'
                      },
                      requestId: {
                        type: 'string',
                        description: '请求ID'
                      }
                    }
                  }
                }
              },
              // 模式列表响应
              ModesResponse: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  data: {
                    type: 'object',
                    properties: {
                      modes: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: {
                              type: 'string',
                              example: 'quality'
                            },
                            name: {
                              type: 'string',
                              example: '质量检验助手'
                            },
                            description: {
                              type: 'string',
                              example: '处理质量检验相关的问题'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              // 健康检查响应
              HealthResponse: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    example: 'ok'
                  },
                  version: {
                    type: 'string',
                    example: '1.0.0'
                  },
                  uptime: {
                    type: 'number',
                    example: 123.45
                  }
                }
              }
            },
            responses: {
              Success: {
                description: '成功响应',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: {
                          type: 'boolean',
                          example: true
                        },
                        data: {
                          type: 'object'
                        }
                      }
                    }
                  }
                }
              },
              Error: {
                description: '错误响应',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ErrorResponse'
                    }
                  }
                }
              }
            }
          },
          paths: {
            '/api/assistant/query': {
              post: {
                tags: ['assistant'],
                summary: '处理用户查询',
                description: '处理用户查询，返回助手响应',
                requestBody: {
                  required: true,
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '#/components/schemas/QueryRequest'
                      }
                    }
                  }
                },
                responses: {
                  '200': {
                    description: '查询成功',
                    content: {
                      'application/json': {
                        schema: {
                          $ref: '#/components/schemas/QueryResponse'
                        }
                      }
                    }
                  },
                  '400': {
                    $ref: '#/components/responses/Error'
                  },
                  '500': {
                    $ref: '#/components/responses/Error'
                  }
                }
              }
            },
            '/api/assistant/session/{sessionId}': {
              delete: {
                tags: ['assistant'],
                summary: '清除会话',
                description: '清除指定会话的上下文',
                parameters: [
                  {
                    name: 'sessionId',
                    in: 'path',
                    required: true,
                    schema: {
                      type: 'string'
                    },
                    description: '会话ID'
                  }
                ],
                responses: {
                  '200': {
                    description: '会话已清除',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            success: {
                              type: 'boolean',
                              example: true
                            },
                            data: {
                              type: 'object',
                              properties: {
                                message: {
                                  type: 'string',
                                  example: '会话已清除'
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  '404': {
                    $ref: '#/components/responses/Error'
                  },
                  '500': {
                    $ref: '#/components/responses/Error'
                  }
                }
              }
            },
            '/api/assistant/modes': {
              get: {
                tags: ['assistant'],
                summary: '获取支持的助手模式',
                description: '返回系统支持的所有助手模式',
                responses: {
                  '200': {
                    description: '成功获取模式列表',
                    content: {
                      'application/json': {
                        schema: {
                          $ref: '#/components/schemas/ModesResponse'
                        }
                      }
                    }
                  },
                  '500': {
                    $ref: '#/components/responses/Error'
                  }
                }
              }
            },
            '/health': {
              get: {
                tags: ['health'],
                summary: '健康检查',
                description: '检查API服务状态',
                responses: {
                  '200': {
                    description: '服务正常',
                    content: {
                      'application/json': {
                        schema: {
                          $ref: '#/components/schemas/HealthResponse'
                        }
                      }
                    }
                  },
                  '500': {
                    description: '服务异常',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            status: {
                              type: 'string',
                              example: 'error'
                            },
                            error: {
                              type: 'string'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        };
        
        // 设置Swagger UI
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDefinition));
        logger.info('Swagger API文档已配置，可访问 /api-docs');
      })
      .catch(err => {
        logger.warn('无法加载Swagger UI', { error: err.message });
        
        // 如果Swagger不可用，提供一个简单的API文档页面
        app.get('/api-docs', (req, res) => {
          res.send(`
            <html>
              <head>
                <title>IQE API 文档</title>
                <style>
                  body { font-family: system-ui, sans-serif; margin: 2rem; }
                  h1 { color: #333; }
                  p { color: #666; }
                  .info { background: #f8f9fa; padding: 1rem; border-radius: 4px; }
                </style>
              </head>
              <body>
                <h1>IQE API 文档</h1>
                <div class="info">
                  <p>Swagger UI 未加载。</p>
                  <p>请确保已安装 swagger-ui-express 依赖:</p>
                  <pre>npm install swagger-ui-express</pre>
                </div>
                <p>API 端点:</p>
                <ul>
                  <li><code>POST /api/assistant/query</code> - 处理用户查询</li>
                  <li><code>DELETE /api/assistant/session/:sessionId</code> - 清除会话</li>
                  <li><code>GET /api/assistant/modes</code> - 获取支持的助手模式</li>
                  <li><code>GET /health</code> - 健康检查</li>
                </ul>
              </body>
            </html>
          `);
        });
      });
  } catch (error) {
    logger.warn('配置Swagger文档时出错', { error: error.message });
  }
} 
 
 
 
 * Swagger API文档工具
 */
import { fileURLToPath } from 'url';
import path from 'path';
import { logger } from './logger.js';

/**
 * 为Express应用配置Swagger文档
 * @param {Express} app Express应用实例
 */
export function swaggerDocs(app) {
  try {
    // 动态导入swagger-ui-express（因为它是CommonJS模块）
    import('swagger-ui-express')
      .then((swaggerUi) => {
        // 获取swagger定义
        const swaggerDefinition = {
          openapi: '3.0.0',
          info: {
            title: 'IQE智能质检系统统一助手API',
            version: '1.0.0',
            description: '提供质量检验、实验室测试和生产线相关的查询服务',
            contact: {
              name: 'IQE团队'
            },
          },
          servers: [
            {
              url: 'http://localhost:3001',
              description: '开发服务器'
            }
          ],
          tags: [
            {
              name: 'assistant',
              description: '统一助手API'
            },
            {
              name: 'health',
              description: '健康检查API'
            }
          ],
          components: {
            schemas: {
              // 查询请求
              QueryRequest: {
                type: 'object',
                required: ['query'],
                properties: {
                  query: {
                    type: 'string',
                    description: '用户查询文本'
                  },
                  mode: {
                    type: 'string',
                    description: '助手模式',
                    enum: ['auto', 'quality', 'lab', 'production'],
                    default: 'auto'
                  },
                  sessionId: {
                    type: 'string',
                    description: '会话ID，用于维护对话上下文',
                    example: 'sess_abc123'
                  },
                  context: {
                    type: 'object',
                    description: '额外上下文信息'
                  }
                }
              },
              // 查询响应
              QueryResponse: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    description: '请求是否成功'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      answer: {
                        type: 'string',
                        description: '助手回答'
                      },
                      mode: {
                        type: 'string',
                        description: '使用的助手模式',
                        enum: ['quality', 'lab', 'production']
                      },
                      sessionId: {
                        type: 'string',
                        description: '会话ID'
                      },
                      context: {
                        type: 'object',
                        description: '更新后的上下文'
                      },
                      structuredData: {
                        type: 'object',
                        description: '结构化数据（如果有）'
                      }
                    }
                  }
                }
              },
              // 错误响应
              ErrorResponse: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  error: {
                    type: 'object',
                    properties: {
                      code: {
                        type: 'string',
                        description: '错误代码'
                      },
                      message: {
                        type: 'string',
                        description: '错误信息'
                      },
                      requestId: {
                        type: 'string',
                        description: '请求ID'
                      }
                    }
                  }
                }
              },
              // 模式列表响应
              ModesResponse: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  data: {
                    type: 'object',
                    properties: {
                      modes: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: {
                              type: 'string',
                              example: 'quality'
                            },
                            name: {
                              type: 'string',
                              example: '质量检验助手'
                            },
                            description: {
                              type: 'string',
                              example: '处理质量检验相关的问题'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              // 健康检查响应
              HealthResponse: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    example: 'ok'
                  },
                  version: {
                    type: 'string',
                    example: '1.0.0'
                  },
                  uptime: {
                    type: 'number',
                    example: 123.45
                  }
                }
              }
            },
            responses: {
              Success: {
                description: '成功响应',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: {
                          type: 'boolean',
                          example: true
                        },
                        data: {
                          type: 'object'
                        }
                      }
                    }
                  }
                }
              },
              Error: {
                description: '错误响应',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ErrorResponse'
                    }
                  }
                }
              }
            }
          },
          paths: {
            '/api/assistant/query': {
              post: {
                tags: ['assistant'],
                summary: '处理用户查询',
                description: '处理用户查询，返回助手响应',
                requestBody: {
                  required: true,
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '#/components/schemas/QueryRequest'
                      }
                    }
                  }
                },
                responses: {
                  '200': {
                    description: '查询成功',
                    content: {
                      'application/json': {
                        schema: {
                          $ref: '#/components/schemas/QueryResponse'
                        }
                      }
                    }
                  },
                  '400': {
                    $ref: '#/components/responses/Error'
                  },
                  '500': {
                    $ref: '#/components/responses/Error'
                  }
                }
              }
            },
            '/api/assistant/session/{sessionId}': {
              delete: {
                tags: ['assistant'],
                summary: '清除会话',
                description: '清除指定会话的上下文',
                parameters: [
                  {
                    name: 'sessionId',
                    in: 'path',
                    required: true,
                    schema: {
                      type: 'string'
                    },
                    description: '会话ID'
                  }
                ],
                responses: {
                  '200': {
                    description: '会话已清除',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            success: {
                              type: 'boolean',
                              example: true
                            },
                            data: {
                              type: 'object',
                              properties: {
                                message: {
                                  type: 'string',
                                  example: '会话已清除'
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  '404': {
                    $ref: '#/components/responses/Error'
                  },
                  '500': {
                    $ref: '#/components/responses/Error'
                  }
                }
              }
            },
            '/api/assistant/modes': {
              get: {
                tags: ['assistant'],
                summary: '获取支持的助手模式',
                description: '返回系统支持的所有助手模式',
                responses: {
                  '200': {
                    description: '成功获取模式列表',
                    content: {
                      'application/json': {
                        schema: {
                          $ref: '#/components/schemas/ModesResponse'
                        }
                      }
                    }
                  },
                  '500': {
                    $ref: '#/components/responses/Error'
                  }
                }
              }
            },
            '/health': {
              get: {
                tags: ['health'],
                summary: '健康检查',
                description: '检查API服务状态',
                responses: {
                  '200': {
                    description: '服务正常',
                    content: {
                      'application/json': {
                        schema: {
                          $ref: '#/components/schemas/HealthResponse'
                        }
                      }
                    }
                  },
                  '500': {
                    description: '服务异常',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            status: {
                              type: 'string',
                              example: 'error'
                            },
                            error: {
                              type: 'string'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        };
        
        // 设置Swagger UI
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDefinition));
        logger.info('Swagger API文档已配置，可访问 /api-docs');
      })
      .catch(err => {
        logger.warn('无法加载Swagger UI', { error: err.message });
        
        // 如果Swagger不可用，提供一个简单的API文档页面
        app.get('/api-docs', (req, res) => {
          res.send(`
            <html>
              <head>
                <title>IQE API 文档</title>
                <style>
                  body { font-family: system-ui, sans-serif; margin: 2rem; }
                  h1 { color: #333; }
                  p { color: #666; }
                  .info { background: #f8f9fa; padding: 1rem; border-radius: 4px; }
                </style>
              </head>
              <body>
                <h1>IQE API 文档</h1>
                <div class="info">
                  <p>Swagger UI 未加载。</p>
                  <p>请确保已安装 swagger-ui-express 依赖:</p>
                  <pre>npm install swagger-ui-express</pre>
                </div>
                <p>API 端点:</p>
                <ul>
                  <li><code>POST /api/assistant/query</code> - 处理用户查询</li>
                  <li><code>DELETE /api/assistant/session/:sessionId</code> - 清除会话</li>
                  <li><code>GET /api/assistant/modes</code> - 获取支持的助手模式</li>
                  <li><code>GET /health</code> - 健康检查</li>
                </ul>
              </body>
            </html>
          `);
        });
      });
  } catch (error) {
    logger.warn('配置Swagger文档时出错', { error: error.message });
  }
} 
 * Swagger API文档工具
 */
import { fileURLToPath } from 'url';
import path from 'path';
import { logger } from './logger.js';

/**
 * 为Express应用配置Swagger文档
 * @param {Express} app Express应用实例
 */
export function swaggerDocs(app) {
  try {
    // 动态导入swagger-ui-express（因为它是CommonJS模块）
    import('swagger-ui-express')
      .then((swaggerUi) => {
        // 获取swagger定义
        const swaggerDefinition = {
          openapi: '3.0.0',
          info: {
            title: 'IQE智能质检系统统一助手API',
            version: '1.0.0',
            description: '提供质量检验、实验室测试和生产线相关的查询服务',
            contact: {
              name: 'IQE团队'
            },
          },
          servers: [
            {
              url: 'http://localhost:3001',
              description: '开发服务器'
            }
          ],
          tags: [
            {
              name: 'assistant',
              description: '统一助手API'
            },
            {
              name: 'health',
              description: '健康检查API'
            }
          ],
          components: {
            schemas: {
              // 查询请求
              QueryRequest: {
                type: 'object',
                required: ['query'],
                properties: {
                  query: {
                    type: 'string',
                    description: '用户查询文本'
                  },
                  mode: {
                    type: 'string',
                    description: '助手模式',
                    enum: ['auto', 'quality', 'lab', 'production'],
                    default: 'auto'
                  },
                  sessionId: {
                    type: 'string',
                    description: '会话ID，用于维护对话上下文',
                    example: 'sess_abc123'
                  },
                  context: {
                    type: 'object',
                    description: '额外上下文信息'
                  }
                }
              },
              // 查询响应
              QueryResponse: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    description: '请求是否成功'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      answer: {
                        type: 'string',
                        description: '助手回答'
                      },
                      mode: {
                        type: 'string',
                        description: '使用的助手模式',
                        enum: ['quality', 'lab', 'production']
                      },
                      sessionId: {
                        type: 'string',
                        description: '会话ID'
                      },
                      context: {
                        type: 'object',
                        description: '更新后的上下文'
                      },
                      structuredData: {
                        type: 'object',
                        description: '结构化数据（如果有）'
                      }
                    }
                  }
                }
              },
              // 错误响应
              ErrorResponse: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  error: {
                    type: 'object',
                    properties: {
                      code: {
                        type: 'string',
                        description: '错误代码'
                      },
                      message: {
                        type: 'string',
                        description: '错误信息'
                      },
                      requestId: {
                        type: 'string',
                        description: '请求ID'
                      }
                    }
                  }
                }
              },
              // 模式列表响应
              ModesResponse: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  data: {
                    type: 'object',
                    properties: {
                      modes: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: {
                              type: 'string',
                              example: 'quality'
                            },
                            name: {
                              type: 'string',
                              example: '质量检验助手'
                            },
                            description: {
                              type: 'string',
                              example: '处理质量检验相关的问题'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              // 健康检查响应
              HealthResponse: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    example: 'ok'
                  },
                  version: {
                    type: 'string',
                    example: '1.0.0'
                  },
                  uptime: {
                    type: 'number',
                    example: 123.45
                  }
                }
              }
            },
            responses: {
              Success: {
                description: '成功响应',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: {
                          type: 'boolean',
                          example: true
                        },
                        data: {
                          type: 'object'
                        }
                      }
                    }
                  }
                }
              },
              Error: {
                description: '错误响应',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ErrorResponse'
                    }
                  }
                }
              }
            }
          },
          paths: {
            '/api/assistant/query': {
              post: {
                tags: ['assistant'],
                summary: '处理用户查询',
                description: '处理用户查询，返回助手响应',
                requestBody: {
                  required: true,
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '#/components/schemas/QueryRequest'
                      }
                    }
                  }
                },
                responses: {
                  '200': {
                    description: '查询成功',
                    content: {
                      'application/json': {
                        schema: {
                          $ref: '#/components/schemas/QueryResponse'
                        }
                      }
                    }
                  },
                  '400': {
                    $ref: '#/components/responses/Error'
                  },
                  '500': {
                    $ref: '#/components/responses/Error'
                  }
                }
              }
            },
            '/api/assistant/session/{sessionId}': {
              delete: {
                tags: ['assistant'],
                summary: '清除会话',
                description: '清除指定会话的上下文',
                parameters: [
                  {
                    name: 'sessionId',
                    in: 'path',
                    required: true,
                    schema: {
                      type: 'string'
                    },
                    description: '会话ID'
                  }
                ],
                responses: {
                  '200': {
                    description: '会话已清除',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            success: {
                              type: 'boolean',
                              example: true
                            },
                            data: {
                              type: 'object',
                              properties: {
                                message: {
                                  type: 'string',
                                  example: '会话已清除'
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  '404': {
                    $ref: '#/components/responses/Error'
                  },
                  '500': {
                    $ref: '#/components/responses/Error'
                  }
                }
              }
            },
            '/api/assistant/modes': {
              get: {
                tags: ['assistant'],
                summary: '获取支持的助手模式',
                description: '返回系统支持的所有助手模式',
                responses: {
                  '200': {
                    description: '成功获取模式列表',
                    content: {
                      'application/json': {
                        schema: {
                          $ref: '#/components/schemas/ModesResponse'
                        }
                      }
                    }
                  },
                  '500': {
                    $ref: '#/components/responses/Error'
                  }
                }
              }
            },
            '/health': {
              get: {
                tags: ['health'],
                summary: '健康检查',
                description: '检查API服务状态',
                responses: {
                  '200': {
                    description: '服务正常',
                    content: {
                      'application/json': {
                        schema: {
                          $ref: '#/components/schemas/HealthResponse'
                        }
                      }
                    }
                  },
                  '500': {
                    description: '服务异常',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            status: {
                              type: 'string',
                              example: 'error'
                            },
                            error: {
                              type: 'string'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        };
        
        // 设置Swagger UI
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDefinition));
        logger.info('Swagger API文档已配置，可访问 /api-docs');
      })
      .catch(err => {
        logger.warn('无法加载Swagger UI', { error: err.message });
        
        // 如果Swagger不可用，提供一个简单的API文档页面
        app.get('/api-docs', (req, res) => {
          res.send(`
            <html>
              <head>
                <title>IQE API 文档</title>
                <style>
                  body { font-family: system-ui, sans-serif; margin: 2rem; }
                  h1 { color: #333; }
                  p { color: #666; }
                  .info { background: #f8f9fa; padding: 1rem; border-radius: 4px; }
                </style>
              </head>
              <body>
                <h1>IQE API 文档</h1>
                <div class="info">
                  <p>Swagger UI 未加载。</p>
                  <p>请确保已安装 swagger-ui-express 依赖:</p>
                  <pre>npm install swagger-ui-express</pre>
                </div>
                <p>API 端点:</p>
                <ul>
                  <li><code>POST /api/assistant/query</code> - 处理用户查询</li>
                  <li><code>DELETE /api/assistant/session/:sessionId</code> - 清除会话</li>
                  <li><code>GET /api/assistant/modes</code> - 获取支持的助手模式</li>
                  <li><code>GET /health</code> - 健康检查</li>
                </ul>
              </body>
            </html>
          `);
        });
      });
  } catch (error) {
    logger.warn('配置Swagger文档时出错', { error: error.message });
  }
} 
 * Swagger API文档工具
 */
import { fileURLToPath } from 'url';
import path from 'path';
import { logger } from './logger.js';

/**
 * 为Express应用配置Swagger文档
 * @param {Express} app Express应用实例
 */
export function swaggerDocs(app) {
  try {
    // 动态导入swagger-ui-express（因为它是CommonJS模块）
    import('swagger-ui-express')
      .then((swaggerUi) => {
        // 获取swagger定义
        const swaggerDefinition = {
          openapi: '3.0.0',
          info: {
            title: 'IQE智能质检系统统一助手API',
            version: '1.0.0',
            description: '提供质量检验、实验室测试和生产线相关的查询服务',
            contact: {
              name: 'IQE团队'
            },
          },
          servers: [
            {
              url: 'http://localhost:3001',
              description: '开发服务器'
            }
          ],
          tags: [
            {
              name: 'assistant',
              description: '统一助手API'
            },
            {
              name: 'health',
              description: '健康检查API'
            }
          ],
          components: {
            schemas: {
              // 查询请求
              QueryRequest: {
                type: 'object',
                required: ['query'],
                properties: {
                  query: {
                    type: 'string',
                    description: '用户查询文本'
                  },
                  mode: {
                    type: 'string',
                    description: '助手模式',
                    enum: ['auto', 'quality', 'lab', 'production'],
                    default: 'auto'
                  },
                  sessionId: {
                    type: 'string',
                    description: '会话ID，用于维护对话上下文',
                    example: 'sess_abc123'
                  },
                  context: {
                    type: 'object',
                    description: '额外上下文信息'
                  }
                }
              },
              // 查询响应
              QueryResponse: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    description: '请求是否成功'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      answer: {
                        type: 'string',
                        description: '助手回答'
                      },
                      mode: {
                        type: 'string',
                        description: '使用的助手模式',
                        enum: ['quality', 'lab', 'production']
                      },
                      sessionId: {
                        type: 'string',
                        description: '会话ID'
                      },
                      context: {
                        type: 'object',
                        description: '更新后的上下文'
                      },
                      structuredData: {
                        type: 'object',
                        description: '结构化数据（如果有）'
                      }
                    }
                  }
                }
              },
              // 错误响应
              ErrorResponse: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  error: {
                    type: 'object',
                    properties: {
                      code: {
                        type: 'string',
                        description: '错误代码'
                      },
                      message: {
                        type: 'string',
                        description: '错误信息'
                      },
                      requestId: {
                        type: 'string',
                        description: '请求ID'
                      }
                    }
                  }
                }
              },
              // 模式列表响应
              ModesResponse: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  data: {
                    type: 'object',
                    properties: {
                      modes: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: {
                              type: 'string',
                              example: 'quality'
                            },
                            name: {
                              type: 'string',
                              example: '质量检验助手'
                            },
                            description: {
                              type: 'string',
                              example: '处理质量检验相关的问题'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              // 健康检查响应
              HealthResponse: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    example: 'ok'
                  },
                  version: {
                    type: 'string',
                    example: '1.0.0'
                  },
                  uptime: {
                    type: 'number',
                    example: 123.45
                  }
                }
              }
            },
            responses: {
              Success: {
                description: '成功响应',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: {
                          type: 'boolean',
                          example: true
                        },
                        data: {
                          type: 'object'
                        }
                      }
                    }
                  }
                }
              },
              Error: {
                description: '错误响应',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ErrorResponse'
                    }
                  }
                }
              }
            }
          },
          paths: {
            '/api/assistant/query': {
              post: {
                tags: ['assistant'],
                summary: '处理用户查询',
                description: '处理用户查询，返回助手响应',
                requestBody: {
                  required: true,
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '#/components/schemas/QueryRequest'
                      }
                    }
                  }
                },
                responses: {
                  '200': {
                    description: '查询成功',
                    content: {
                      'application/json': {
                        schema: {
                          $ref: '#/components/schemas/QueryResponse'
                        }
                      }
                    }
                  },
                  '400': {
                    $ref: '#/components/responses/Error'
                  },
                  '500': {
                    $ref: '#/components/responses/Error'
                  }
                }
              }
            },
            '/api/assistant/session/{sessionId}': {
              delete: {
                tags: ['assistant'],
                summary: '清除会话',
                description: '清除指定会话的上下文',
                parameters: [
                  {
                    name: 'sessionId',
                    in: 'path',
                    required: true,
                    schema: {
                      type: 'string'
                    },
                    description: '会话ID'
                  }
                ],
                responses: {
                  '200': {
                    description: '会话已清除',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            success: {
                              type: 'boolean',
                              example: true
                            },
                            data: {
                              type: 'object',
                              properties: {
                                message: {
                                  type: 'string',
                                  example: '会话已清除'
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  '404': {
                    $ref: '#/components/responses/Error'
                  },
                  '500': {
                    $ref: '#/components/responses/Error'
                  }
                }
              }
            },
            '/api/assistant/modes': {
              get: {
                tags: ['assistant'],
                summary: '获取支持的助手模式',
                description: '返回系统支持的所有助手模式',
                responses: {
                  '200': {
                    description: '成功获取模式列表',
                    content: {
                      'application/json': {
                        schema: {
                          $ref: '#/components/schemas/ModesResponse'
                        }
                      }
                    }
                  },
                  '500': {
                    $ref: '#/components/responses/Error'
                  }
                }
              }
            },
            '/health': {
              get: {
                tags: ['health'],
                summary: '健康检查',
                description: '检查API服务状态',
                responses: {
                  '200': {
                    description: '服务正常',
                    content: {
                      'application/json': {
                        schema: {
                          $ref: '#/components/schemas/HealthResponse'
                        }
                      }
                    }
                  },
                  '500': {
                    description: '服务异常',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            status: {
                              type: 'string',
                              example: 'error'
                            },
                            error: {
                              type: 'string'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        };
        
        // 设置Swagger UI
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDefinition));
        logger.info('Swagger API文档已配置，可访问 /api-docs');
      })
      .catch(err => {
        logger.warn('无法加载Swagger UI', { error: err.message });
        
        // 如果Swagger不可用，提供一个简单的API文档页面
        app.get('/api-docs', (req, res) => {
          res.send(`
            <html>
              <head>
                <title>IQE API 文档</title>
                <style>
                  body { font-family: system-ui, sans-serif; margin: 2rem; }
                  h1 { color: #333; }
                  p { color: #666; }
                  .info { background: #f8f9fa; padding: 1rem; border-radius: 4px; }
                </style>
              </head>
              <body>
                <h1>IQE API 文档</h1>
                <div class="info">
                  <p>Swagger UI 未加载。</p>
                  <p>请确保已安装 swagger-ui-express 依赖:</p>
                  <pre>npm install swagger-ui-express</pre>
                </div>
                <p>API 端点:</p>
                <ul>
                  <li><code>POST /api/assistant/query</code> - 处理用户查询</li>
                  <li><code>DELETE /api/assistant/session/:sessionId</code> - 清除会话</li>
                  <li><code>GET /api/assistant/modes</code> - 获取支持的助手模式</li>
                  <li><code>GET /health</code> - 健康检查</li>
                </ul>
              </body>
            </html>
          `);
        });
      });
  } catch (error) {
    logger.warn('配置Swagger文档时出错', { error: error.message });
  }
} 
 
 
 
 * Swagger API文档工具
 */
import { fileURLToPath } from 'url';
import path from 'path';
import { logger } from './logger.js';

/**
 * 为Express应用配置Swagger文档
 * @param {Express} app Express应用实例
 */
export function swaggerDocs(app) {
  try {
    // 动态导入swagger-ui-express（因为它是CommonJS模块）
    import('swagger-ui-express')
      .then((swaggerUi) => {
        // 获取swagger定义
        const swaggerDefinition = {
          openapi: '3.0.0',
          info: {
            title: 'IQE智能质检系统统一助手API',
            version: '1.0.0',
            description: '提供质量检验、实验室测试和生产线相关的查询服务',
            contact: {
              name: 'IQE团队'
            },
          },
          servers: [
            {
              url: 'http://localhost:3001',
              description: '开发服务器'
            }
          ],
          tags: [
            {
              name: 'assistant',
              description: '统一助手API'
            },
            {
              name: 'health',
              description: '健康检查API'
            }
          ],
          components: {
            schemas: {
              // 查询请求
              QueryRequest: {
                type: 'object',
                required: ['query'],
                properties: {
                  query: {
                    type: 'string',
                    description: '用户查询文本'
                  },
                  mode: {
                    type: 'string',
                    description: '助手模式',
                    enum: ['auto', 'quality', 'lab', 'production'],
                    default: 'auto'
                  },
                  sessionId: {
                    type: 'string',
                    description: '会话ID，用于维护对话上下文',
                    example: 'sess_abc123'
                  },
                  context: {
                    type: 'object',
                    description: '额外上下文信息'
                  }
                }
              },
              // 查询响应
              QueryResponse: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    description: '请求是否成功'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      answer: {
                        type: 'string',
                        description: '助手回答'
                      },
                      mode: {
                        type: 'string',
                        description: '使用的助手模式',
                        enum: ['quality', 'lab', 'production']
                      },
                      sessionId: {
                        type: 'string',
                        description: '会话ID'
                      },
                      context: {
                        type: 'object',
                        description: '更新后的上下文'
                      },
                      structuredData: {
                        type: 'object',
                        description: '结构化数据（如果有）'
                      }
                    }
                  }
                }
              },
              // 错误响应
              ErrorResponse: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  error: {
                    type: 'object',
                    properties: {
                      code: {
                        type: 'string',
                        description: '错误代码'
                      },
                      message: {
                        type: 'string',
                        description: '错误信息'
                      },
                      requestId: {
                        type: 'string',
                        description: '请求ID'
                      }
                    }
                  }
                }
              },
              // 模式列表响应
              ModesResponse: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  data: {
                    type: 'object',
                    properties: {
                      modes: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: {
                              type: 'string',
                              example: 'quality'
                            },
                            name: {
                              type: 'string',
                              example: '质量检验助手'
                            },
                            description: {
                              type: 'string',
                              example: '处理质量检验相关的问题'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              // 健康检查响应
              HealthResponse: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    example: 'ok'
                  },
                  version: {
                    type: 'string',
                    example: '1.0.0'
                  },
                  uptime: {
                    type: 'number',
                    example: 123.45
                  }
                }
              }
            },
            responses: {
              Success: {
                description: '成功响应',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: {
                          type: 'boolean',
                          example: true
                        },
                        data: {
                          type: 'object'
                        }
                      }
                    }
                  }
                }
              },
              Error: {
                description: '错误响应',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ErrorResponse'
                    }
                  }
                }
              }
            }
          },
          paths: {
            '/api/assistant/query': {
              post: {
                tags: ['assistant'],
                summary: '处理用户查询',
                description: '处理用户查询，返回助手响应',
                requestBody: {
                  required: true,
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '#/components/schemas/QueryRequest'
                      }
                    }
                  }
                },
                responses: {
                  '200': {
                    description: '查询成功',
                    content: {
                      'application/json': {
                        schema: {
                          $ref: '#/components/schemas/QueryResponse'
                        }
                      }
                    }
                  },
                  '400': {
                    $ref: '#/components/responses/Error'
                  },
                  '500': {
                    $ref: '#/components/responses/Error'
                  }
                }
              }
            },
            '/api/assistant/session/{sessionId}': {
              delete: {
                tags: ['assistant'],
                summary: '清除会话',
                description: '清除指定会话的上下文',
                parameters: [
                  {
                    name: 'sessionId',
                    in: 'path',
                    required: true,
                    schema: {
                      type: 'string'
                    },
                    description: '会话ID'
                  }
                ],
                responses: {
                  '200': {
                    description: '会话已清除',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            success: {
                              type: 'boolean',
                              example: true
                            },
                            data: {
                              type: 'object',
                              properties: {
                                message: {
                                  type: 'string',
                                  example: '会话已清除'
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  '404': {
                    $ref: '#/components/responses/Error'
                  },
                  '500': {
                    $ref: '#/components/responses/Error'
                  }
                }
              }
            },
            '/api/assistant/modes': {
              get: {
                tags: ['assistant'],
                summary: '获取支持的助手模式',
                description: '返回系统支持的所有助手模式',
                responses: {
                  '200': {
                    description: '成功获取模式列表',
                    content: {
                      'application/json': {
                        schema: {
                          $ref: '#/components/schemas/ModesResponse'
                        }
                      }
                    }
                  },
                  '500': {
                    $ref: '#/components/responses/Error'
                  }
                }
              }
            },
            '/health': {
              get: {
                tags: ['health'],
                summary: '健康检查',
                description: '检查API服务状态',
                responses: {
                  '200': {
                    description: '服务正常',
                    content: {
                      'application/json': {
                        schema: {
                          $ref: '#/components/schemas/HealthResponse'
                        }
                      }
                    }
                  },
                  '500': {
                    description: '服务异常',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            status: {
                              type: 'string',
                              example: 'error'
                            },
                            error: {
                              type: 'string'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        };
        
        // 设置Swagger UI
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDefinition));
        logger.info('Swagger API文档已配置，可访问 /api-docs');
      })
      .catch(err => {
        logger.warn('无法加载Swagger UI', { error: err.message });
        
        // 如果Swagger不可用，提供一个简单的API文档页面
        app.get('/api-docs', (req, res) => {
          res.send(`
            <html>
              <head>
                <title>IQE API 文档</title>
                <style>
                  body { font-family: system-ui, sans-serif; margin: 2rem; }
                  h1 { color: #333; }
                  p { color: #666; }
                  .info { background: #f8f9fa; padding: 1rem; border-radius: 4px; }
                </style>
              </head>
              <body>
                <h1>IQE API 文档</h1>
                <div class="info">
                  <p>Swagger UI 未加载。</p>
                  <p>请确保已安装 swagger-ui-express 依赖:</p>
                  <pre>npm install swagger-ui-express</pre>
                </div>
                <p>API 端点:</p>
                <ul>
                  <li><code>POST /api/assistant/query</code> - 处理用户查询</li>
                  <li><code>DELETE /api/assistant/session/:sessionId</code> - 清除会话</li>
                  <li><code>GET /api/assistant/modes</code> - 获取支持的助手模式</li>
                  <li><code>GET /health</code> - 健康检查</li>
                </ul>
              </body>
            </html>
          `);
        });
      });
  } catch (error) {
    logger.warn('配置Swagger文档时出错', { error: error.message });
  }
} 
 * Swagger API文档工具
 */
import { fileURLToPath } from 'url';
import path from 'path';
import { logger } from './logger.js';

/**
 * 为Express应用配置Swagger文档
 * @param {Express} app Express应用实例
 */
export function swaggerDocs(app) {
  try {
    // 动态导入swagger-ui-express（因为它是CommonJS模块）
    import('swagger-ui-express')
      .then((swaggerUi) => {
        // 获取swagger定义
        const swaggerDefinition = {
          openapi: '3.0.0',
          info: {
            title: 'IQE智能质检系统统一助手API',
            version: '1.0.0',
            description: '提供质量检验、实验室测试和生产线相关的查询服务',
            contact: {
              name: 'IQE团队'
            },
          },
          servers: [
            {
              url: 'http://localhost:3001',
              description: '开发服务器'
            }
          ],
          tags: [
            {
              name: 'assistant',
              description: '统一助手API'
            },
            {
              name: 'health',
              description: '健康检查API'
            }
          ],
          components: {
            schemas: {
              // 查询请求
              QueryRequest: {
                type: 'object',
                required: ['query'],
                properties: {
                  query: {
                    type: 'string',
                    description: '用户查询文本'
                  },
                  mode: {
                    type: 'string',
                    description: '助手模式',
                    enum: ['auto', 'quality', 'lab', 'production'],
                    default: 'auto'
                  },
                  sessionId: {
                    type: 'string',
                    description: '会话ID，用于维护对话上下文',
                    example: 'sess_abc123'
                  },
                  context: {
                    type: 'object',
                    description: '额外上下文信息'
                  }
                }
              },
              // 查询响应
              QueryResponse: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    description: '请求是否成功'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      answer: {
                        type: 'string',
                        description: '助手回答'
                      },
                      mode: {
                        type: 'string',
                        description: '使用的助手模式',
                        enum: ['quality', 'lab', 'production']
                      },
                      sessionId: {
                        type: 'string',
                        description: '会话ID'
                      },
                      context: {
                        type: 'object',
                        description: '更新后的上下文'
                      },
                      structuredData: {
                        type: 'object',
                        description: '结构化数据（如果有）'
                      }
                    }
                  }
                }
              },
              // 错误响应
              ErrorResponse: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  error: {
                    type: 'object',
                    properties: {
                      code: {
                        type: 'string',
                        description: '错误代码'
                      },
                      message: {
                        type: 'string',
                        description: '错误信息'
                      },
                      requestId: {
                        type: 'string',
                        description: '请求ID'
                      }
                    }
                  }
                }
              },
              // 模式列表响应
              ModesResponse: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  data: {
                    type: 'object',
                    properties: {
                      modes: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: {
                              type: 'string',
                              example: 'quality'
                            },
                            name: {
                              type: 'string',
                              example: '质量检验助手'
                            },
                            description: {
                              type: 'string',
                              example: '处理质量检验相关的问题'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              // 健康检查响应
              HealthResponse: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    example: 'ok'
                  },
                  version: {
                    type: 'string',
                    example: '1.0.0'
                  },
                  uptime: {
                    type: 'number',
                    example: 123.45
                  }
                }
              }
            },
            responses: {
              Success: {
                description: '成功响应',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: {
                          type: 'boolean',
                          example: true
                        },
                        data: {
                          type: 'object'
                        }
                      }
                    }
                  }
                }
              },
              Error: {
                description: '错误响应',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ErrorResponse'
                    }
                  }
                }
              }
            }
          },
          paths: {
            '/api/assistant/query': {
              post: {
                tags: ['assistant'],
                summary: '处理用户查询',
                description: '处理用户查询，返回助手响应',
                requestBody: {
                  required: true,
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '#/components/schemas/QueryRequest'
                      }
                    }
                  }
                },
                responses: {
                  '200': {
                    description: '查询成功',
                    content: {
                      'application/json': {
                        schema: {
                          $ref: '#/components/schemas/QueryResponse'
                        }
                      }
                    }
                  },
                  '400': {
                    $ref: '#/components/responses/Error'
                  },
                  '500': {
                    $ref: '#/components/responses/Error'
                  }
                }
              }
            },
            '/api/assistant/session/{sessionId}': {
              delete: {
                tags: ['assistant'],
                summary: '清除会话',
                description: '清除指定会话的上下文',
                parameters: [
                  {
                    name: 'sessionId',
                    in: 'path',
                    required: true,
                    schema: {
                      type: 'string'
                    },
                    description: '会话ID'
                  }
                ],
                responses: {
                  '200': {
                    description: '会话已清除',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            success: {
                              type: 'boolean',
                              example: true
                            },
                            data: {
                              type: 'object',
                              properties: {
                                message: {
                                  type: 'string',
                                  example: '会话已清除'
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  '404': {
                    $ref: '#/components/responses/Error'
                  },
                  '500': {
                    $ref: '#/components/responses/Error'
                  }
                }
              }
            },
            '/api/assistant/modes': {
              get: {
                tags: ['assistant'],
                summary: '获取支持的助手模式',
                description: '返回系统支持的所有助手模式',
                responses: {
                  '200': {
                    description: '成功获取模式列表',
                    content: {
                      'application/json': {
                        schema: {
                          $ref: '#/components/schemas/ModesResponse'
                        }
                      }
                    }
                  },
                  '500': {
                    $ref: '#/components/responses/Error'
                  }
                }
              }
            },
            '/health': {
              get: {
                tags: ['health'],
                summary: '健康检查',
                description: '检查API服务状态',
                responses: {
                  '200': {
                    description: '服务正常',
                    content: {
                      'application/json': {
                        schema: {
                          $ref: '#/components/schemas/HealthResponse'
                        }
                      }
                    }
                  },
                  '500': {
                    description: '服务异常',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            status: {
                              type: 'string',
                              example: 'error'
                            },
                            error: {
                              type: 'string'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        };
        
        // 设置Swagger UI
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDefinition));
        logger.info('Swagger API文档已配置，可访问 /api-docs');
      })
      .catch(err => {
        logger.warn('无法加载Swagger UI', { error: err.message });
        
        // 如果Swagger不可用，提供一个简单的API文档页面
        app.get('/api-docs', (req, res) => {
          res.send(`
            <html>
              <head>
                <title>IQE API 文档</title>
                <style>
                  body { font-family: system-ui, sans-serif; margin: 2rem; }
                  h1 { color: #333; }
                  p { color: #666; }
                  .info { background: #f8f9fa; padding: 1rem; border-radius: 4px; }
                </style>
              </head>
              <body>
                <h1>IQE API 文档</h1>
                <div class="info">
                  <p>Swagger UI 未加载。</p>
                  <p>请确保已安装 swagger-ui-express 依赖:</p>
                  <pre>npm install swagger-ui-express</pre>
                </div>
                <p>API 端点:</p>
                <ul>
                  <li><code>POST /api/assistant/query</code> - 处理用户查询</li>
                  <li><code>DELETE /api/assistant/session/:sessionId</code> - 清除会话</li>
                  <li><code>GET /api/assistant/modes</code> - 获取支持的助手模式</li>
                  <li><code>GET /health</code> - 健康检查</li>
                </ul>
              </body>
            </html>
          `);
        });
      });
  } catch (error) {
    logger.warn('配置Swagger文档时出错', { error: error.message });
  }
} 
 * Swagger API文档工具
 */
import { fileURLToPath } from 'url';
import path from 'path';
import { logger } from './logger.js';

/**
 * 为Express应用配置Swagger文档
 * @param {Express} app Express应用实例
 */
export function swaggerDocs(app) {
  try {
    // 动态导入swagger-ui-express（因为它是CommonJS模块）
    import('swagger-ui-express')
      .then((swaggerUi) => {
        // 获取swagger定义
        const swaggerDefinition = {
          openapi: '3.0.0',
          info: {
            title: 'IQE智能质检系统统一助手API',
            version: '1.0.0',
            description: '提供质量检验、实验室测试和生产线相关的查询服务',
            contact: {
              name: 'IQE团队'
            },
          },
          servers: [
            {
              url: 'http://localhost:3001',
              description: '开发服务器'
            }
          ],
          tags: [
            {
              name: 'assistant',
              description: '统一助手API'
            },
            {
              name: 'health',
              description: '健康检查API'
            }
          ],
          components: {
            schemas: {
              // 查询请求
              QueryRequest: {
                type: 'object',
                required: ['query'],
                properties: {
                  query: {
                    type: 'string',
                    description: '用户查询文本'
                  },
                  mode: {
                    type: 'string',
                    description: '助手模式',
                    enum: ['auto', 'quality', 'lab', 'production'],
                    default: 'auto'
                  },
                  sessionId: {
                    type: 'string',
                    description: '会话ID，用于维护对话上下文',
                    example: 'sess_abc123'
                  },
                  context: {
                    type: 'object',
                    description: '额外上下文信息'
                  }
                }
              },
              // 查询响应
              QueryResponse: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    description: '请求是否成功'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      answer: {
                        type: 'string',
                        description: '助手回答'
                      },
                      mode: {
                        type: 'string',
                        description: '使用的助手模式',
                        enum: ['quality', 'lab', 'production']
                      },
                      sessionId: {
                        type: 'string',
                        description: '会话ID'
                      },
                      context: {
                        type: 'object',
                        description: '更新后的上下文'
                      },
                      structuredData: {
                        type: 'object',
                        description: '结构化数据（如果有）'
                      }
                    }
                  }
                }
              },
              // 错误响应
              ErrorResponse: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  error: {
                    type: 'object',
                    properties: {
                      code: {
                        type: 'string',
                        description: '错误代码'
                      },
                      message: {
                        type: 'string',
                        description: '错误信息'
                      },
                      requestId: {
                        type: 'string',
                        description: '请求ID'
                      }
                    }
                  }
                }
              },
              // 模式列表响应
              ModesResponse: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  data: {
                    type: 'object',
                    properties: {
                      modes: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: {
                              type: 'string',
                              example: 'quality'
                            },
                            name: {
                              type: 'string',
                              example: '质量检验助手'
                            },
                            description: {
                              type: 'string',
                              example: '处理质量检验相关的问题'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              // 健康检查响应
              HealthResponse: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    example: 'ok'
                  },
                  version: {
                    type: 'string',
                    example: '1.0.0'
                  },
                  uptime: {
                    type: 'number',
                    example: 123.45
                  }
                }
              }
            },
            responses: {
              Success: {
                description: '成功响应',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: {
                          type: 'boolean',
                          example: true
                        },
                        data: {
                          type: 'object'
                        }
                      }
                    }
                  }
                }
              },
              Error: {
                description: '错误响应',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ErrorResponse'
                    }
                  }
                }
              }
            }
          },
          paths: {
            '/api/assistant/query': {
              post: {
                tags: ['assistant'],
                summary: '处理用户查询',
                description: '处理用户查询，返回助手响应',
                requestBody: {
                  required: true,
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '#/components/schemas/QueryRequest'
                      }
                    }
                  }
                },
                responses: {
                  '200': {
                    description: '查询成功',
                    content: {
                      'application/json': {
                        schema: {
                          $ref: '#/components/schemas/QueryResponse'
                        }
                      }
                    }
                  },
                  '400': {
                    $ref: '#/components/responses/Error'
                  },
                  '500': {
                    $ref: '#/components/responses/Error'
                  }
                }
              }
            },
            '/api/assistant/session/{sessionId}': {
              delete: {
                tags: ['assistant'],
                summary: '清除会话',
                description: '清除指定会话的上下文',
                parameters: [
                  {
                    name: 'sessionId',
                    in: 'path',
                    required: true,
                    schema: {
                      type: 'string'
                    },
                    description: '会话ID'
                  }
                ],
                responses: {
                  '200': {
                    description: '会话已清除',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            success: {
                              type: 'boolean',
                              example: true
                            },
                            data: {
                              type: 'object',
                              properties: {
                                message: {
                                  type: 'string',
                                  example: '会话已清除'
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  '404': {
                    $ref: '#/components/responses/Error'
                  },
                  '500': {
                    $ref: '#/components/responses/Error'
                  }
                }
              }
            },
            '/api/assistant/modes': {
              get: {
                tags: ['assistant'],
                summary: '获取支持的助手模式',
                description: '返回系统支持的所有助手模式',
                responses: {
                  '200': {
                    description: '成功获取模式列表',
                    content: {
                      'application/json': {
                        schema: {
                          $ref: '#/components/schemas/ModesResponse'
                        }
                      }
                    }
                  },
                  '500': {
                    $ref: '#/components/responses/Error'
                  }
                }
              }
            },
            '/health': {
              get: {
                tags: ['health'],
                summary: '健康检查',
                description: '检查API服务状态',
                responses: {
                  '200': {
                    description: '服务正常',
                    content: {
                      'application/json': {
                        schema: {
                          $ref: '#/components/schemas/HealthResponse'
                        }
                      }
                    }
                  },
                  '500': {
                    description: '服务异常',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            status: {
                              type: 'string',
                              example: 'error'
                            },
                            error: {
                              type: 'string'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        };
        
        // 设置Swagger UI
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDefinition));
        logger.info('Swagger API文档已配置，可访问 /api-docs');
      })
      .catch(err => {
        logger.warn('无法加载Swagger UI', { error: err.message });
        
        // 如果Swagger不可用，提供一个简单的API文档页面
        app.get('/api-docs', (req, res) => {
          res.send(`
            <html>
              <head>
                <title>IQE API 文档</title>
                <style>
                  body { font-family: system-ui, sans-serif; margin: 2rem; }
                  h1 { color: #333; }
                  p { color: #666; }
                  .info { background: #f8f9fa; padding: 1rem; border-radius: 4px; }
                </style>
              </head>
              <body>
                <h1>IQE API 文档</h1>
                <div class="info">
                  <p>Swagger UI 未加载。</p>
                  <p>请确保已安装 swagger-ui-express 依赖:</p>
                  <pre>npm install swagger-ui-express</pre>
                </div>
                <p>API 端点:</p>
                <ul>
                  <li><code>POST /api/assistant/query</code> - 处理用户查询</li>
                  <li><code>DELETE /api/assistant/session/:sessionId</code> - 清除会话</li>
                  <li><code>GET /api/assistant/modes</code> - 获取支持的助手模式</li>
                  <li><code>GET /health</code> - 健康检查</li>
                </ul>
              </body>
            </html>
          `);
        });
      });
  } catch (error) {
    logger.warn('配置Swagger文档时出错', { error: error.message });
  }
} 
 
 
 