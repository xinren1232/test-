# 项目与基线关系配置说明

## 功能概述

本模块实现了项目(Project)和基线(Baseline)之间的命名规则和固定绑定关系，主要特性包括：

1. **命名规则**：
   - 基线ID格式：I + 4位数字，如`I6789`
   - 项目ID格式：X + 4位数字，如`X6827`

2. **绑定关系**：
   - 每个基线固定绑定5-6个项目
   - 一个项目只能归属于一个基线
   - 通过映射表维护基线和项目之间的关系

3. **数据结构变更**：
   - 基线设计(baseline)中移除了子列(projects)字段
   - 在实验室测试(lab)和上线使用(online)数据中添加了项目名(project_name)字段
   - 项目与基线的绑定关系通过ProjectBaselineService服务统一管理

## 实现方式

### 核心服务

`ProjectBaselineService`服务提供以下功能：

- 生成符合规则的基线ID和项目ID
- 创建基线和项目
- 管理基线和项目的关联关系
- 存储和读取基线数据和关系映射
- 验证ID格式和关系有效性

### 数据存储

项目和基线的关系存储使用两部分：

1. **基线数据**：存储在localStorage的`baseline_data`键中，包含基线的基本信息
2. **关系映射表**：存储在localStorage的`project_baseline_relation`键中，表示项目与基线的对应关系

### 关键组件

1. **ProjectBaselineManager.vue**：管理界面，用于创建、查看和管理项目与基线的关系
2. **ProjectBaselinePage.vue**：页面容器，集成到系统路由

### 数据流转

1. 用户创建基线 → 生成基线ID → 保存基线数据
2. 用户创建项目并关联基线 → 验证项目ID → 保存项目与基线的关系
3. 测试数据和上线数据中引用项目名称 → 使用服务查询关系

## 数据验证规则

系统确保了以下数据一致性规则：

1. 基线ID必须符合"I + 4位数字"格式
2. 项目ID必须符合"X + 4位数字"格式
3. 每个基线最多关联6个项目
4. 每个项目只能关联一个基线
5. 项目必须关联到有效的基线

## 使用方法

### 创建基线

```javascript
const result = projectBaselineService.createBaseline("I1234", {
  name: "基线测试",
  version: "v1.0",
  // 其他属性...
});
```

### 创建项目并关联基线

```javascript
const result = projectBaselineService.createProject("X5678", "I1234", {
  name: "项目测试",
  // 其他属性...
});
```

### 查询基线的项目

```javascript
const projects = projectBaselineService.getProjectsByBaseline("I1234");
```

### 查询项目的基线

```javascript
const baselineId = projectBaselineService.getBaselineByProject("X5678");
```

## 适配的数据变更

1. 在TestDataGenerator中更新了基线数据生成逻辑
2. 修改了测试数据生成逻辑，添加项目与基线的关联
3. 在数据验证规则中移除了对projects字段的依赖

## 注意事项

1. 确保在生成测试数据时使用正确的项目与基线映射
2. 创建新基线或项目时应验证ID格式的正确性
3. 操作基线和项目时需考虑现有数据关系的一致性 