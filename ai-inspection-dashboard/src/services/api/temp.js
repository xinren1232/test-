    if (query.includes('质量') || mode === 'quality') {
      response = \
我理解您想了解关于质量检验的信息。目前系统处于离线模式，无法获取实时数据。\;
    } else if (query.includes('实验') || query.includes('测试') || mode === 'lab') {
      response = \
您的实验室相关查询已收到。由于系统处于离线模式，暂时无法处理具体测试数据。\;
    } else if (query.includes('生产') || query.includes('产线') || mode === 'production') {
      response = \
关于生产线的查询已收到。系统当前处于离线模式，无法获取生产线实时状态。\;
    } else {
      response = 我已收到您的问题：\
\。系统当前处于离线模式，提供基础回复。;
    }
