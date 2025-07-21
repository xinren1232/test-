# 智能意图识别系统测试文档

## 🎯 系统架构优化

### 问题解决方案
根据您的分析，我们实现了**"语义 -> intent rule -> 模板SQL -> 数据"**的完整闭环：

```
用户查询 → 智能意图识别 → 参数提取 → 模板渲染 → 数据查询 → 结果返回
```

### 核心组件

#### 1. 增强的NLP意图规则模型
```sql
-- 新增字段支持
trigger_words: JSON     -- 触发关键词数组
synonyms: JSON          -- 同义词映射
priority: INTEGER       -- 优先级权重
```

#### 2. 智能意图识别服务 (`IntelligentIntentService`)
- **意图匹配**: 基于关键词和同义词的智能匹配
- **参数提取**: 使用正则表达式从查询中提取参数
- **动作执行**: 支持SQL查询、函数调用、API调用

#### 3. SQL模板渲染引擎 (`TemplateEngine`)
- **Jinja2风格语法**: 支持条件语句和变量替换
- **SQL安全**: 自动转义防止注入攻击
- **模板验证**: 语法检查和变量提取

## 🧪 测试用例

### 1. 批次风险检查
**输入**: "这个批次有没有风险？"
**意图**: `batch_risk_check`
**参数提取**: 需要批次号
**预期响应**: 参数提示或风险检查结果

**测试步骤**:
```bash
curl -X POST http://localhost:3001/api/assistant/query \
  -H "Content-Type: application/json" \
  -d '{"query": "这个批次有没有风险？"}'
```

**预期结果**:
```json
{
  "reply": "请提供更多信息来完成查询。缺少参数: batch_no",
  "source": "intelligent-intent",
  "matchedRule": "batch_risk_check"
}
```

### 2. 工厂库存查询（完整参数）
**输入**: "深圳工厂异常库存"
**意图**: `factory_inventory_query`
**参数提取**: 
- factory: "深圳"
- status: "异常" → "风险"

**测试步骤**:
```bash
curl -X POST http://localhost:3001/api/assistant/query \
  -H "Content-Type: application/json" \
  -d '{"query": "深圳工厂异常库存"}'
```

**预期结果**:
```json
{
  "reply": "SQL查询结果: SELECT * FROM inventory WHERE factory LIKE '%深圳%' AND status = '风险' ORDER BY created_at DESC",
  "source": "intelligent-intent",
  "matchedRule": "factory_inventory_query"
}
```

### 3. 供应商质量分析
**输入**: "BOE供应商质量如何"
**意图**: `supplier_quality_analysis`
**参数提取**: supplier: "BOE"

**测试步骤**:
```bash
curl -X POST http://localhost:3001/api/assistant/query \
  -H "Content-Type: application/json" \
  -d '{"query": "BOE供应商质量如何"}'
```

**预期结果**:
```json
{
  "reply": "BOE供应商质量分析：整体表现良好",
  "source": "intelligent-intent",
  "matchedRule": "supplier_quality_analysis"
}
```

### 4. 物料不良率查询
**输入**: "电池盖的不良率是多少"
**意图**: `material_defect_rate`
**参数提取**: material: "电池盖"

**测试步骤**:
```bash
curl -X POST http://localhost:3001/api/assistant/query \
  -H "Content-Type: application/json" \
  -d '{"query": "电池盖的不良率是多少"}'
```

### 5. 无匹配意图（回退到AI）
**输入**: "质量大天工具箱"
**预期**: 智能意图无匹配 → 转AI增强处理

## 🔍 意图规则配置示例

### 批次风险检查规则
```javascript
{
  intent_name: 'batch_risk_check',
  description: '批次风险检查',
  action_type: 'FUNCTION_CALL',
  action_target: 'checkBatchRisk',
  parameters: [
    { 
      name: 'batch_no', 
      type: 'string', 
      required: true, 
      extract_pattern: /批次[号]?[：:]?\s*([A-Z0-9]+)/i 
    }
  ],
  trigger_words: ['批次', '风险', '异常', '状态'],
  synonyms: {
    '风险': ['异常', '危险', '问题'],
    '批次': ['batch', '批号', '批次号']
  },
  priority: 5
}
```

### 工厂库存查询规则
```javascript
{
  intent_name: 'factory_inventory_query',
  action_type: 'SQL_QUERY',
  action_target: `
    SELECT * FROM inventory 
    WHERE factory LIKE '%{{ factory }}%' 
    {% if status %} AND status = '{{ status }}' {% endif %}
    {% if supplier %} AND supplier LIKE '%{{ supplier }}%' {% endif %}
  `,
  parameters: [
    { name: 'factory', type: 'string', required: true, extract_pattern: /(深圳|宜宾|重庆)工厂?/i },
    { name: 'status', type: 'string', required: false, extract_pattern: /(正常|风险|异常|冻结)/i }
  ],
  trigger_words: ['工厂', '库存'],
  synonyms: {
    '异常': ['风险', '危险'],
    '库存': ['物料', '存货']
  }
}
```

## 📊 SQL模板示例

### 条件查询模板
```sql
SELECT * FROM inventory 
WHERE factory LIKE '%{{ factory }}%'
{% if status %} AND status = '{{ status }}' {% endif %}
{% if supplier %} AND supplier LIKE '%{{ supplier }}%' {% endif %}
ORDER BY created_at DESC
```

**渲染示例**:
- 输入: `{factory: "深圳", status: "风险"}`
- 输出: `SELECT * FROM inventory WHERE factory LIKE '%深圳%' AND status = '风险' ORDER BY created_at DESC`

### 聚合查询模板
```sql
SELECT 
  supplier,
  COUNT(*) as total_batches,
  SUM(CASE WHEN status = '正常' THEN 1 ELSE 0 END) as normal_count,
  ROUND(SUM(CASE WHEN status = '正常' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as quality_rate
FROM inventory
WHERE supplier LIKE '%{{ supplier }}%'
{% if material %} AND material_name LIKE '%{{ material }}%' {% endif %}
GROUP BY supplier
```

## ✅ 验证清单

### 系统集成验证
- [ ] 智能意图服务正确初始化
- [ ] 查询处理优先级正确（智能意图 → AI增强 → 基础规则）
- [ ] 参数提取准确
- [ ] SQL模板渲染正确

### 意图识别验证
- [ ] 关键词匹配准确
- [ ] 同义词映射正确
- [ ] 优先级排序有效
- [ ] 参数验证完整

### 模板引擎验证
- [ ] 条件语句处理正确
- [ ] 变量替换安全
- [ ] SQL转义有效
- [ ] 语法验证准确

### 回退机制验证
- [ ] 无匹配意图时正确回退
- [ ] 参数缺失时提供提示
- [ ] 错误处理完善
- [ ] 日志记录详细

## 🚀 部署和测试

### 启动后端服务
```bash
cd backend
npm start
```

### 测试API端点
```bash
# 健康检查
curl http://localhost:3001/health

# 智能查询测试
curl -X POST http://localhost:3001/api/assistant/query \
  -H "Content-Type: application/json" \
  -d '{"query": "深圳工厂异常库存"}'
```

### 查看日志
```bash
tail -f backend/logs/app.log
```

## 📈 预期改进效果

### 修复前问题
- ❌ 意图理解与结构化调用脱节
- ❌ 无法正确触发对应的规则/SQL/API
- ❌ AI识别语义但无法执行数据动作

### 修复后效果
- ✅ 完整的"语义 → 意图 → 模板 → 数据"闭环
- ✅ 智能参数提取和验证
- ✅ 灵活的SQL模板系统
- ✅ 优雅的回退机制
- ✅ 可扩展的意图规则配置

## 🔧 后续优化建议

1. **数据库集成**: 将意图规则存储到数据库，支持动态配置
2. **机器学习**: 集成NLP模型提升意图识别准确率
3. **缓存优化**: 添加查询结果缓存提升性能
4. **监控告警**: 添加意图识别成功率监控
5. **A/B测试**: 对比新旧系统的查询处理效果

**系统状态**: 🎉 智能意图识别系统已完成，等待测试验证
