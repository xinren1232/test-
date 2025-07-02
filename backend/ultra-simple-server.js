/**
 * 超简单测试服务器
 */
import http from 'http';

const PORT = 3001;

// 内存数据存储
let memoryData = {
  inventory: [],
  inspection: [],
  production: []
};

// 辅助函数：获取状态图标
function getStatusIcon(status) {
  const statusMap = {
    '正常': '✅',
    '风险': '⚠️',
    '冻结': '🔒',
    '异常': '❌',
    'PASS': '✅',
    'FAIL': '❌'
  };
  return statusMap[status] || '📋';
}

console.log('🚀 启动超简单服务器...');

const server = http.createServer((req, res) => {
  console.log(`📝 收到请求: ${req.method} ${req.url}`);
  
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // 健康检查
  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      message: '超简单服务器运行正常',
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // 数据更新
  if (req.url === '/api/assistant/update-data' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);

        // 实际存储数据到内存
        memoryData.inventory = data.inventory || [];
        memoryData.inspection = data.inspection || [];
        memoryData.production = data.production || [];

        console.log('📊 数据已存储到内存:', {
          inventory: memoryData.inventory.length,
          inspection: memoryData.inspection.length,
          production: memoryData.production.length
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: '数据更新成功'
        }));
      } catch (error) {
        console.error('❌ 数据解析错误:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: '数据格式错误'
        }));
      }
    });
    return;
  }
  
  // 查询接口
  if (req.url === '/api/assistant/query' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('🔍 收到查询请求:', data.query);

        let response = '';

        // 使用实际存储的数据进行查询
        if (data.query && data.query.includes('库存')) {
          const inventoryData = memoryData.inventory;

          if (inventoryData.length > 0) {
            // 如果查询包含工厂名称，过滤数据
            let filteredData = inventoryData;
            if (data.query.includes('深圳工厂')) {
              filteredData = inventoryData.filter(item => item.factory === '深圳工厂');
            } else if (data.query.includes('上海工厂')) {
              filteredData = inventoryData.filter(item => item.factory === '上海工厂');
            } else if (data.query.includes('北京工厂')) {
              filteredData = inventoryData.filter(item => item.factory === '北京工厂');
            }

            if (filteredData.length > 0) {
              response = `📦 **库存查询结果** (共 ${filteredData.length} 条记录)\n\n`;

              // 按工厂分组显示
              const groupedByFactory = {};
              filteredData.forEach(item => {
                if (!groupedByFactory[item.factory]) {
                  groupedByFactory[item.factory] = [];
                }
                groupedByFactory[item.factory].push(item);
              });

              Object.keys(groupedByFactory).forEach(factory => {
                const items = groupedByFactory[factory];
                response += `🏭 **${factory}** (${items.length} 条)\n`;
                response += `${'─'.repeat(50)}\n`;

                items.slice(0, 3).forEach((item, index) => {
                  response += `**${index + 1}. ${item.materialName}**\n`;
                  response += `   • 物料编码: \`${item.materialCode}\`\n`;
                  response += `   • 供应商: ${item.supplier}\n`;
                  response += `   • 仓库: ${item.warehouse}\n`;
                  response += `   • 库存数量: **${item.quantity}** 件\n`;
                  response += `   • 状态: ${getStatusIcon(item.status)} ${item.status}\n`;
                  if (item.notes) {
                    response += `   • 备注: ${item.notes}\n`;
                  }
                  response += `\n`;
                });

                if (items.length > 3) {
                  response += `   ... 还有 ${items.length - 3} 条记录\n`;
                }
                response += `\n`;
              });

              // 添加统计信息
              const totalQuantity = filteredData.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
              response += `📊 **统计汇总**\n`;
              response += `• 总记录数: ${filteredData.length} 条\n`;
              response += `• 总库存量: ${totalQuantity.toLocaleString()} 件\n`;
              response += `• 涉及工厂: ${Object.keys(groupedByFactory).length} 个\n`;

            } else {
              response = '❌ 未找到符合条件的库存数据。';
            }
          } else {
            response = '暂无库存数据，请先推送数据到系统。';
          }
        } else if (data.query && data.query.includes('检验')) {
          const inspectionData = memoryData.inspection;
          if (inspectionData.length > 0) {
            response = `🔬 **检验数据查询结果** (共 ${inspectionData.length} 条记录)\n\n`;

            // 按测试结果分组
            const passCount = inspectionData.filter(item => item.testResult === 'PASS').length;
            const failCount = inspectionData.filter(item => item.testResult === 'FAIL').length;

            response += `📊 **检验结果统计**\n`;
            response += `• ✅ 合格: ${passCount} 条 (${((passCount/inspectionData.length)*100).toFixed(1)}%)\n`;
            response += `• ❌ 不合格: ${failCount} 条 (${((failCount/inspectionData.length)*100).toFixed(1)}%)\n\n`;

            response += `📋 **详细记录**\n`;
            response += `${'─'.repeat(50)}\n`;

            inspectionData.slice(0, 5).forEach((item, index) => {
              response += `**${index + 1}. ${item.materialName}**\n`;
              response += `   • 物料编码: \`${item.materialCode}\`\n`;
              response += `   • 批次号: ${item.batchNo}\n`;
              response += `   • 检验结果: ${getStatusIcon(item.testResult)} **${item.testResult}**\n`;
              response += `   • 检验日期: ${item.inspectionDate}\n`;
              response += `   • 供应商: ${item.supplier}\n`;
              if (item.defectPhenomena && item.testResult === 'FAIL') {
                response += `   • 缺陷现象: ${item.defectPhenomena}\n`;
              }
              response += `\n`;
            });

            if (inspectionData.length > 5) {
              response += `... 还有 ${inspectionData.length - 5} 条记录\n`;
            }
          } else {
            response = '❌ 暂无检验数据，请先推送数据到系统。';
          }
        } else {
          response = `❓ **未找到相关信息**\n\n`;
          response += `抱歉，我没有理解您的查询需求。\n\n`;
          response += `📊 **当前系统数据状态**\n`;
          response += `${'─'.repeat(30)}\n`;
          response += `• 📦 库存数据: **${memoryData.inventory.length}** 条\n`;
          response += `• 🔬 检验数据: **${memoryData.inspection.length}** 条\n`;
          response += `• 🏭 生产数据: **${memoryData.production.length}** 条\n\n`;
          response += `💡 **查询建议**\n`;
          response += `• 尝试询问："深圳工厂库存情况"\n`;
          response += `• 尝试询问："检验数据统计"\n`;
          response += `• 尝试询问："库存状态查询"`;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          reply: response,
          source: 'rule-based',
          aiEnhanced: false,
          matchedRule: 'auto-detected'
        }));
      } catch (error) {
        console.error('❌ 查询处理错误:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '查询处理失败' }));
      }
    });
    return;
  }
  
  // 默认响应
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: '接口不存在' }));
});

server.listen(PORT, () => {
  console.log(`🚀 超简单服务器已启动，端口: ${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`🔗 数据更新: http://localhost:${PORT}/api/assistant/update-data`);
  console.log(`🔍 查询接口: http://localhost:${PORT}/api/assistant/query`);
  console.log(`⏰ 启动时间: ${new Date().toLocaleString()}`);
});

server.on('error', (error) => {
  console.error('❌ 服务器错误:', error);
});

process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ 未处理的Promise拒绝:', reason);
});
