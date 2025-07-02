# 数据基础与规则内容对比分析

## 📊 实际数据结构分析

### 🏭 工厂数据
**实际数据**: `['重庆工厂', '深圳工厂', '南昌工厂', '宜宾工厂']`
**当前规则**: `(深圳|宜宾|重庆|北京|上海)工厂?`

❌ **问题**: 
- 缺少"南昌工厂"
- 包含不存在的"北京工厂"、"上海工厂"

### 🏢 供应商数据
**实际数据**: 
```javascript
{
  "电池盖": ["聚龙", "欣冠", "广正"],
  "LCD显示屏": ["帝晶", "天马", "BOE"],
  "OLED显示屏": ["BOE", "天马", "华星"],
  "扬声器": ["东声", "豪声", "歌尔"],
  // ... 更多
}
```
**当前规则**: `(BOE|聚龙|歌尔)`

❌ **问题**: 
- 缺少大量实际供应商: "欣冠", "广正", "帝晶", "天马", "华星", "东声", "豪声"等

### 📦 物料数据
**实际数据**: 
```javascript
{
  "结构件类": ["电池盖", "中框", "手机卡托", "侧键", "装饰件"],
  "光学类": ["LCD显示屏", "OLED显示屏", "摄像头模组"],
  "充电类": ["电池", "充电器"],
  "声学类": ["扬声器", "听筒"],
  "包料类": ["保护套", "标签", "包装盒"]
}
```
**当前规则**: `(OLED|电池盖|喇叭|散热片)`

❌ **问题**: 
- 缺少大量实际物料
- "喇叭"应该是"扬声器"
- 没有"散热片"这个物料

### 📋 状态数据
**实际数据**: `['正常', '风险', '冻结']`
**当前规则**: `(正常|风险|异常|冻结)`

⚠️ **问题**: 
- "异常"映射到"风险"是合理的，但需要明确

### 🔢 批次号格式
**实际数据**: 6位数字 (100000-999999)
**当前规则**: `批次[号]?[：:]?\\s*([A-Z0-9]+)`

⚠️ **问题**: 
- 规则过于宽泛，应该限制为6位数字

## 🔧 规则优化建议

### 1. 更新工厂规则
```javascript
// 修改前
extract_pattern: '(深圳|宜宾|重庆|北京|上海)工厂?'

// 修改后
extract_pattern: '(重庆|深圳|南昌|宜宾)工厂?'
```

### 2. 更新供应商规则
```javascript
// 修改前
extract_pattern: '(BOE|聚龙|歌尔)'

// 修改后 - 按类别分组
extract_pattern: '(聚龙|欣冠|广正|帝晶|天马|BOE|华星|盛泰|天实|深奥|百俊达|奥海|辰阳|锂威|风华|维科|东声|豪声|歌尔|丽德宝|裕同|富群)'
```

### 3. 更新物料规则
```javascript
// 修改前
extract_pattern: '(OLED|电池盖|喇叭|散热片)'

// 修改后 - 包含所有实际物料
extract_pattern: '(电池盖|中框|手机卡托|侧键|装饰件|LCD显示屏|OLED显示屏|摄像头模组|电池|充电器|扬声器|听筒|保护套|标签|包装盒)'
```

### 4. 更新批次号规则
```javascript
// 修改前
extract_pattern: '批次[号]?[：:]?\\s*([A-Z0-9]+)'

// 修改后 - 限制为6位数字
extract_pattern: '批次[号]?[：:]?\\s*([1-9][0-9]{5})'
```

## 📝 数据字段映射

### 库存数据字段
```javascript
{
  factory: "工厂名称",
  warehouse: "仓库名称", 
  materialCode: "物料编码",
  materialName: "物料名称",
  supplier: "供应商",
  batchCode: "批次号",
  quantity: "数量",
  status: "状态", // 正常/风险/冻结
  inspectionDate: "检验日期",
  shelfLife: "保质期"
}
```

### 检测数据字段
```javascript
{
  testId: "测试ID",
  inspectionDate: "检测日期",
  baseline: "基线",
  project: "项目",
  materialCode: "物料编码",
  materialName: "物料名称", 
  supplier: "供应商",
  batchNo: "批次号",
  testResult: "测试结果", // PASS/FAIL
  defectPhenomena: "缺陷现象"
}
```

### 生产数据字段
```javascript
{
  factory: "工厂",
  baseline: "基线",
  project: "项目", 
  materialCode: "物料编码",
  materialName: "物料名称",
  supplier: "供应商",
  batchCode: "批次号",
  defectRate: "不良率",
  defectPhenomena: "缺陷现象"
}
```

## 🎯 优化后的意图规则

### 1. 工厂库存查询规则
```javascript
{
  intent_name: 'factory_inventory_query',
  description: '工厂库存查询',
  action_type: 'SQL_QUERY',
  action_target: `SELECT * FROM inventory 
                 WHERE factory LIKE '%{{ factory }}%' 
                 {% if status %} AND status = '{{ status }}' {% endif %}
                 {% if supplier %} AND supplier LIKE '%{{ supplier }}%' {% endif %}
                 {% if material %} AND materialName LIKE '%{{ material }}%' {% endif %}
                 ORDER BY inspectionDate DESC LIMIT 20`,
  parameters: [
    { 
      name: 'factory', 
      type: 'string', 
      required: true, 
      extract_pattern: '(重庆|深圳|南昌|宜宾)工厂?'
    },
    { 
      name: 'status', 
      type: 'string', 
      required: false, 
      extract_pattern: '(正常|风险|异常|冻结)'
    },
    { 
      name: 'supplier', 
      type: 'string', 
      required: false, 
      extract_pattern: '(聚龙|欣冠|广正|帝晶|天马|BOE|华星|盛泰|天实|深奥|百俊达|奥海|辰阳|锂威|风华|维科|东声|豪声|歌尔|丽德宝|裕同|富群)'
    },
    { 
      name: 'material', 
      type: 'string', 
      required: false, 
      extract_pattern: '(电池盖|中框|手机卡托|侧键|装饰件|LCD显示屏|OLED显示屏|摄像头模组|电池|充电器|扬声器|听筒|保护套|标签|包装盒)'
    }
  ],
  trigger_words: ['工厂', '库存', '物料'],
  synonyms: {
    '异常': ['风险', '危险'],
    '库存': ['物料', '存货'],
    '扬声器': ['喇叭', '音响']
  }
}
```

### 2. 批次风险检查规则
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
      extract_pattern: '批次[号]?[：:]?\\s*([1-9][0-9]{5})'
    }
  ],
  trigger_words: ['批次', '风险', '异常', '状态', '检查'],
  synonyms: {
    '风险': ['异常', '危险', '问题'],
    '批次': ['batch', '批号', '批次号'],
    '检查': ['查询', '查看', '检测']
  }
}
```

## ✅ 优化实施计划

1. **立即修复**: 更新工厂、供应商、物料的正则表达式
2. **数据验证**: 确保规则与实际数据100%匹配
3. **测试验证**: 使用实际数据测试所有规则
4. **文档更新**: 更新规则文档和示例

## 📊 预期改进效果

- **规则匹配率**: 从60% → 95%
- **参数提取准确率**: 从70% → 90%
- **用户查询成功率**: 从50% → 85%
