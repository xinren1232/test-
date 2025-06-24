<template>
  <div class="data-rules-page">
    <div class="page-header">
      <h1>数据规则文档</h1>
      <p class="description">系统数据结构与生成规则说明</p>
    </div>

    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="规则概述" name="overview">
        <el-card class="main-card">
          <template #header>
            <div class="card-header">
              <h2>系统数据规则概述</h2>
            </div>
          </template>

          <div class="card-content">
            <p>
              IQE智能质检系统涉及物料从库存入库、实验室测试到生产线上线的完整流程。
              为确保数据完整性、关联性和一致性，系统定义了一系列核心规则，用于指导数据的生成、验证和分析。
            </p>

            <el-divider content-position="left">主要数据分类</el-divider>

            <el-row :gutter="20" class="rule-categories">
              <el-col :span="8">
                <el-card shadow="hover">
                  <h3>库存数据</h3>
                  <p>物料入库信息，包括物料编码、名称、供应商、批次号等</p>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card shadow="hover">
                  <h3>测试数据</h3>
                  <p>物料测试记录，包括测试结果、项目ID、基线ID等</p>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card shadow="hover">
                  <h3>上线数据</h3>
                  <p>物料上线信息，包括工厂、线体、不良率等</p>
                </el-card>
              </el-col>
            </el-row>

            <el-divider content-position="left">数据生成步骤</el-divider>

            <el-steps :active="3" finish-status="success" direction="vertical" style="margin: 20px 0;">
              <el-step title="生成库存数据" description="生成物料库存数据，作为整个数据链的起点" />
              <el-step title="生成测试数据" description="基于已有库存数据，生成物料测试数据" />
              <el-step title="生成上线数据" description="生成物料在各工厂的使用数据" />
            </el-steps>

            <el-alert
              title="数据生成工具入口"
              type="success"
              description="系统提供了专用的数据生成工具，可以根据以上规则自动生成符合要求的测试数据。"
              show-icon
              :closable="false"
              style="margin: 20px 0"
            >
              <template #default>
                <div class="alert-actions">
                  <el-button type="primary" size="small" @click="goToDataGenerator">
                    进入数据生成工具
                  </el-button>
                </div>
              </template>
            </el-alert>
          </div>
        </el-card>
      </el-tab-pane>
      
      <el-tab-pane label="数据结构定义" name="structure">
        <el-card class="main-card">
          <template #header>
            <div class="card-header">
              <h2>数据结构定义</h2>
            </div>
          </template>
          
          <div class="card-content">
            <h3 class="section-title">智能物料管理系统页面字段规则与限制</h3>

            <el-divider content-position="left">仓库页面字段规范</el-divider>
            
            <el-table :data="warehouseConstraints" border style="width: 100%; margin-bottom: 20px">
              <el-table-column prop="fieldName" label="字段名" width="150" />
              <el-table-column prop="type" label="类型" width="100" />
              <el-table-column prop="format" label="格式要求" width="180" />
              <el-table-column prop="rule" label="约束规则" />
              <el-table-column prop="note" label="补充说明" width="180" />
            </el-table>

            <div class="rules-section">
              <h4>页面级约束:</h4>
              <ol>
                <li>同工厂的同种物料不能使用相同批次号</li>
                <li>物料编码+批次号+供应商三者必须全局一致</li>
                <li>重庆工厂只能使用"重庆库存"或"中央库存"</li>
              </ol>
            </div>

            <el-divider content-position="left">测试页面字段规范</el-divider>
            
            <el-table :data="testConstraints" border style="width: 100%; margin-bottom: 20px">
              <el-table-column prop="fieldName" label="字段名" width="150" />
              <el-table-column prop="type" label="类型" width="100" />
              <el-table-column prop="format" label="格式要求" width="180" />
              <el-table-column prop="rule" label="约束规则" />
              <el-table-column prop="note" label="补充说明" width="180" />
            </el-table>

            <div class="rules-section">
              <h4>页面级约束:</h4>
              <ol>
                <li>相同物料批次必须有3-5条历史测试记录</li>
                <li>测试日期必须晚于物料入库日期</li>
                <li>不合格记录必须包含有效缺陷描述</li>
                <li>项目-基线组合必须严格匹配预设关系</li>
              </ol>
            </div>

            <el-divider content-position="left">上线页面字段规范</el-divider>
            
            <el-table :data="onlineConstraints" border style="width: 100%; margin-bottom: 20px">
              <el-table-column prop="fieldName" label="字段名" width="150" />
              <el-table-column prop="type" label="类型" width="100" />
              <el-table-column prop="format" label="格式要求" width="180" />
              <el-table-column prop="rule" label="约束规则" />
              <el-table-column prop="note" label="补充说明" width="180" />
            </el-table>

            <div class="rules-section">
              <h4>页面级约束:</h4>
              <ol>
                <li>相同物料批次必须有5-8条历史上线记录</li>
                <li>工厂必须与批次在仓库中的工厂一致</li>
                <li>检验日期必须晚于测试日期（当有测试记录时）</li>
                <li>不良率>0.5%时必须包含有效缺陷描述</li>
              </ol>
            </div>

            <el-divider content-position="left">跨页面一致性规则</el-divider>

            <div class="rules-section">
              <h4>三要素绑定</h4>
              <div class="mermaid-diagram">
                <pre class="mermaid">
graph LR
    A[仓库页面] -- materialCode+batchNo --> B[测试页面]
    A -- materialCode+batchNo --> C[上线页面]
    B -- supplier一致 --> A
    C -- supplier一致 --> A
    C -- factory一致 --> A
                </pre>
              </div>

              <h4>时间线约束</h4>
              <div class="mermaid-diagram">
                <pre class="mermaid">
gantt
    title 物料生命周期时间线
    dateFormat  YYYY-MM-DD
    section 物料批次
    入库日期      ：a1, 2024-01-01, 30d
    测试日期      ：a2, after a1, 60d
    上线检验日期  ：a3, after a2, 30d
                </pre>
              </div>

              <h4>项目-基线一致性</h4>
              <el-table :data="projectBaselineConsistency" border style="width: 100%; margin-bottom: 20px">
                <el-table-column prop="page" label="页面" width="150" />
                <el-table-column prop="field" label="字段" width="150" />
                <el-table-column prop="rule" label="一致性要求" />
              </el-table>
            </div>

            <el-divider content-position="left">禁止性规则汇总</el-divider>

            <div class="rules-section">
              <h4>全局禁止行为</h4>
              <ol>
                <li>❌ 同项目在不同页面/记录中出现不同基线ID</li>
                <li>❌ 相同物料编码+批次在不同页面出现不同供应商</li>
                <li>❌ 日期超出2024-01-01至2025-05-31范围</li>
              </ol>

              <h4>仓库页面禁止</h4>
              <ol>
                <li>❌ 同工厂的同种物料使用相同批次</li>
                <li>❌ 重庆工厂使用深圳库存</li>
                <li>❌ 状态分布偏离正常70%/风险20%/冻结10%±5%</li>
              </ol>

              <h4>测试页面禁止</h4>
              <ol>
                <li>❌ 合格记录中出现缺陷描述</li>
                <li>❌ 测试合格率偏离90%±2%</li>
                <li>❌ 物料批次测试记录少于3条</li>
              </ol>

              <h4>上线页面禁止</h4>
              <ol>
                <li>❌ 缺陷率≤0.5%的记录出现缺陷描述</li>
                <li>❌ 不良率分布偏离<5%:80%/≥5%:20%±5%</li>
                <li>❌ 物料批次上线记录少于5条</li>
                <li>❌ 工厂信息与仓库记录不一致</li>
              </ol>
            </div>

            <el-divider content-position="left">数据验证指标</el-divider>

            <div class="rules-section">
              <h4>数量验证</h4>
              <el-table :data="quantityValidation" border style="width: 100%; margin-bottom: 20px">
                <el-table-column prop="page" label="页面" width="150" />
                <el-table-column prop="count" label="记录数" width="150" />
                <el-table-column prop="deviation" label="允许偏差" width="150" />
              </el-table>

              <h4>关键分布验证</h4>
              <el-table :data="distributionValidation" border style="width: 100%; margin-bottom: 20px">
                <el-table-column prop="page" label="页面" width="150" />
                <el-table-column prop="metric" label="指标" />
                <el-table-column prop="requirement" label="要求" width="150" />
                <el-table-column prop="deviation" label="允许偏差" width="150" />
              </el-table>

              <h4>完整性验证</h4>
              <el-table :data="completenessValidation" border style="width: 100%; margin-bottom: 20px">
                <el-table-column prop="item" label="检查项" />
                <el-table-column prop="requirement" label="要求" width="150" />
              </el-table>
            </div>
            
            <div class="conclusion-note">
              此分页面字段规则文档完整定义了智能物料管理系统三大核心页面的数据约束条件和业务规则，确保各页面数据符合系统需求且保持跨页面一致性，为物料全生命周期管理提供可靠数据基础。
            </div>
          </div>
        </el-card>
      </el-tab-pane>
      
      <el-tab-pane label="数据生成规则" name="generation">
        <el-card class="main-card">
          <template #header>
            <div class="card-header">
              <h2>数据生成规则</h2>
            </div>
          </template>
          
          <div class="card-content">
            <el-timeline>
              <el-timeline-item timestamp="第一步: 物料编码生成" placement="top" type="primary">
                <h4>物料编码生成</h4>
                <p>为每种物料生成多个供应商的编码，格式为"M+数字"，如M10001</p>
                <div class="code-block">
                  <pre>
// 为每种物料生成多个供应商的编码
for category, materials in material_categories.items():
  for material in materials:
    suppliers = material_suppliers[material]["suppliers"]
    for supplier in suppliers:
      material_codes[f"M{code_counter}"] = {
        "material_name": material,
        "category": category,
        "supplier": supplier
      }
      code_counter += 1
                  </pre>
                </div>
              </el-timeline-item>
              
              <el-timeline-item timestamp="第二步: 批次号生成" placement="top" type="primary">
                <h4>批次号生成</h4>
                <p>为每个物料供应商组合生成3-5个批次号</p>
                <div class="code-block">
                  <pre>
// 为每个物料供应商组合生成3-5个批次
for material_code, info in material_codes.items():
  material_name = info["material_name"]
  num_batches = random.randint(3, 5)
  batches = []
  for _ in range(num_batches):
    batch = random.randint(100000, 999999)
    # 确保批次号唯一
    while batch in batch_numbers:
      batch = random.randint(100000, 999999)
    batches.append(batch)
    batch_numbers[batch] = {
      "material_code": material_code,
      "material_name": material_name,
      "supplier": info["supplier"]
    }
                  </pre>
                </div>
              </el-timeline-item>
              
              <el-timeline-item timestamp="第三步: 库存数据生成" placement="top" type="success">
                <h4>库存数据生成</h4>
                <p>生成库存数据，包括工厂、仓库、物料、批次、数量等信息</p>
                <div class="code-block">
                  <pre>
for _ in range(200):
  # 随机选择一个物料
  material_code = random.choice(list(material_codes.keys()))
  material_info = material_codes[material_code]
  material_name = material_info["material_name"]
  supplier = material_info["supplier"]
  
  # 选择一个批次
  batch = random.choice(material_info["batches"])
  
  # 选择工厂和仓库
  factory = random.choice(factories)
  
  # 仓库分配逻辑：中央库存可对应所有工厂，地方库存只对应本地工厂
  if factory == "重庆工厂":
    warehouse = random.choice(["中央库存", "重庆库存"])
  elif factory == "深圳工厂":
    warehouse = random.choice(["中央库存", "深圳库存"])
  else:
    warehouse = "中央库存"
  
  # 库位生成
  area = random.choice(["A", "B", "C", "D"])
  section = str(random.randint(1, 50)).zfill(2)
  location = f"{area}区-{section}"
  
  # 数量
  quantity = random.randint(100, 5000)
  
  # 状态
  status = random.choices(status_options, weights=[0.7, 0.2, 0.1])[0]
  
  # 入库时间 (2024-01-01 至 2025-05-31)
  receive_date = datetime(2024, 1, 1) + timedelta(days=random.randint(0, 515))
  
  # 保质期计算
  shelf_life = material_suppliers[material_name]["shelf_life"]
  expiry_date = receive_date + timedelta(days=shelf_life*30)
                  </pre>
                </div>
              </el-timeline-item>
              
              <el-timeline-item timestamp="第四步: 测试数据生成" placement="top" type="warning">
                <h4>测试数据生成</h4>
                <p>生成物料测试数据，包括测试编号、测试日期、项目ID、基线ID等</p>
                <div class="code-block">
                  <pre>
for _ in range(540):
  # 随机选择一个物料批次
  batch = random.choice(list(batch_numbers.keys()))
  batch_info = batch_numbers[batch]
  material_code = batch_info["material_code"]
  material_name = batch_info["material_name"]
  supplier = batch_info["supplier"]
  
  # 测试日期 (2024-01-01 至 2025-05-31)
  test_date = datetime(2024, 1, 1) + timedelta(days=random.randint(0, 515))
  
  # 测试编号格式：TEST-[物料编码]-[批次号前4位]-[时间戳后6位]
  batch_prefix = str(batch)[:4]
  timestamp_suffix = str(uuid.uuid4().int)[-6:]
  test_id = f"TEST-{material_code}-{batch_prefix}-{timestamp_suffix}"
  
  # 选择项目
  project = random.choice(list(project_baseline.keys()))
  baseline = project_baseline[project]
  
  # 测试类型
  test_type = random.choice(test_types)
  
  # 测试结果 (90%合格)
  if random.random() < 0.9:
    result = "合格"
    defect = ""
  else:
    result = "不合格"
    # 选择1-2个缺陷
    num_defects = random.randint(1, 2)
    defect = ",".join(random.sample(material_defects[material_name], num_defects))
                  </pre>
                </div>
              </el-timeline-item>
              
              <el-timeline-item timestamp="第五步: 上线数据生成" placement="top" type="danger">
                <h4>上线数据生成</h4>
                <p>生成物料上线数据，包括工厂、线体、不良率等信息</p>
                <div class="code-block">
                  <pre>
for _ in range(1080):
  # 随机选择一个物料批次
  batch = random.choice(list(batch_numbers.keys()))
  batch_info = batch_numbers[batch]
  material_code = batch_info["material_code"]
  material_name = batch_info["material_name"]
  supplier = batch_info["supplier"]
  
  # 选择工厂
  factory = random.choice(factories)
  
  # 生产线
  line = random.choice(production_lines)
  
  # 选择项目
  project = random.choice(list(project_baseline.keys()))
  baseline = project_baseline[project]
  
  # 检验日期 (2024-01-01 至 2025-05-31)
  inspection_date = datetime(2024, 1, 1) + timedelta(days=random.randint(0, 515))
  
  # 不良率 (大多数在0-5%之间)
  if random.random() < 0.8:
    defect_rate = round(random.uniform(0, 5.0), 1)
  else:
    defect_rate = round(random.uniform(5.0, 10.0), 1)
  
  # 不良现象 (不良率>0.5%时有缺陷)
  defect = ""
  if defect_rate > 0.5:
    # 选择1-2个缺陷
    num_defects = random.randint(1, 2)
    defect = ",".join(random.sample(material_defects[material_name], num_defects))
                  </pre>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const activeTab = ref('overview');

// 库存数据字段
const warehouseFields = ref([
  { name: '工厂', description: '物料所在工厂', sample: '重庆工厂' },
  { name: '仓库', description: '物料所在仓库', sample: '中央库存' },
  { name: '物料编码', description: '物料唯一编码', sample: 'M10001' },
  { name: '物料名称', description: '物料名称', sample: '电池盖' },
  { name: '供应商', description: '物料供应商', sample: '聚龙' },
  { name: '批次号', description: '物料生产批次', sample: '100001' },
  { name: '数量', description: '库存数量', sample: '1000' },
  { name: '状态', description: '库存状态', sample: '正常' },
  { name: '入库时间', description: '物料入库日期', sample: '2024-03-15' },
  { name: '到期时间', description: '物料保质期到期日期', sample: '2025-03-15' },
  { name: '库位', description: '仓库中的存放位置', sample: 'A区-01' },
  { name: '备注', description: '额外说明信息', sample: '紧急物料' },
]);

// 测试数据字段
const testFields = ref([
  { name: '测试编号', description: '唯一测试标识', sample: 'TEST-M10001-1000-952' },
  { name: '测试日期', description: '测试执行日期', sample: '2024-03-15' },
  { name: '项目ID', description: '关联的项目ID', sample: 'X6827' },
  { name: '基线ID', description: '关联的基线ID', sample: 'I6789' },
  { name: '物料编码', description: '物料唯一编码', sample: 'M10001' },
  { name: '物料名称', description: '物料名称', sample: '电池盖' },
  { name: '批次号', description: '物料生产批次', sample: '100001' },
  { name: '供应商', description: '物料供应商', sample: '聚龙' },
  { name: '测试项目', description: '测试类型', sample: '新品测试' },
  { name: '测试结果', description: '测试结果', sample: '合格' },
  { name: '不良现象', description: '测试发现的问题', sample: '划伤,色差' },
]);

// 上线数据字段
const productionFields = ref([
  { name: '工厂', description: '上线工厂', sample: '重庆工厂' },
  { name: '线体', description: '生产线', sample: '01线' },
  { name: '基线ID', description: '关联的基线ID', sample: 'I6789' },
  { name: '项目ID', description: '关联的项目ID', sample: 'X6827' },
  { name: '物料编码', description: '物料唯一编码', sample: 'M10001' },
  { name: '物料名称', description: '物料名称', sample: '电池盖' },
  { name: '供应商', description: '物料供应商', sample: '聚龙' },
  { name: '批次号', description: '物料生产批次', sample: '100001' },
  { name: '不良率', description: '生产中的不良比例', sample: '0.2%' },
  { name: '不良现象', description: '生产中发现的问题', sample: '划伤,色差' },
  { name: '检验日期', description: '检验执行日期', sample: '2024-03-15' },
]);

// 仓库页面字段规范
const warehouseConstraints = ref([
  { fieldName: 'materialCode', type: 'String', format: '1-2大写字母+4-6位数字', rule: '必须与测试/上线页面的相同物料编码一致', note: '如"M12345"' },
  { fieldName: 'materialName', type: 'String', format: '2-50字符', rule: '必须来自15种预定义物料', note: '物料名称全局一致' },
  { fieldName: 'category', type: 'String', format: '枚举值', rule: '光学类/结构件类/声学类等', note: '与物料名称绑定' },
  { fieldName: 'batchNo', type: 'String', format: '6位数字', rule: '100000~999999 (全局唯一)', note: '同物料不同工厂需不同批次' },
  { fieldName: 'factory', type: 'String', format: '枚举值', rule: '重庆工厂/深圳工厂/南昌工厂/宜宾工厂', note: '' },
  { fieldName: 'warehouse', type: 'String', format: '枚举值', rule: '中央库存/重庆库存/深圳库存', note: '重庆工厂对应重庆库存或中央库存' },
  { fieldName: 'supplier', type: 'String', format: '2-50字符', rule: '必须匹配物料对应的供应商列表', note: '与物料编码绑定' },
  { fieldName: 'quantity', type: 'Number', format: '正整数', rule: '100~5000', note: '' },
  { fieldName: 'status', type: 'String', format: '枚举值', rule: '正常(70%)/风险(20%)/冻结(10%)', note: '风险=保质期<3个月' },
  { fieldName: 'receiveDate', type: 'Date', format: 'YYYY-MM-DD', rule: '2024-01-01 至 2025-05-31', note: '' },
  { fieldName: 'expiryDate', type: 'Date', format: 'YYYY-MM-DD', rule: '根据receiveDate+物料保质期计算', note: '保质期来自物料定义' },
  { fieldName: 'remarks', type: 'String', format: '最大500字符', rule: '可选字段', note: '仅30%记录包含备注' },
]);

// 测试页面字段规范
const testConstraints = ref([
  { fieldName: 'testId', type: 'String', format: 'TEST-[物料编码]-[批次前4位]-[6位随机]', rule: '全局唯一', note: '如"TEST-M10001-1000-952847"' },
  { fieldName: 'testDate', type: 'Date', format: 'YYYY-MM-DD', rule: '2024-01-01 至 2025-05-31', note: '' },
  { fieldName: 'projectId', type: 'String', format: '项目ID格式', rule: '必须来自预定义项目(X6827,S665LN等)', note: '' },
  { fieldName: 'baselineId', type: 'String', format: '基线ID格式', rule: '必须与projectId匹配预设对应关系', note: '禁止同项目不同基线' },
  { fieldName: 'materialCode', type: 'String', format: '同仓库页面', rule: '必须与仓库页面的相同批次物料编码一致', note: '' },
  { fieldName: 'materialName', type: 'String', format: '同仓库页面', rule: '必须与仓库页面的相同批次物料名称一致', note: '' },
  { fieldName: 'batchNo', type: 'String', format: '同仓库页面', rule: '必须与仓库页面的相同批次号一致', note: '' },
  { fieldName: 'supplier', type: 'String', format: '同仓库页面', rule: '必须与仓库页面的相同批次供应商一致', note: '' },
  { fieldName: 'testItem', type: 'String', format: '枚举值', rule: '新品测试/量产例行', note: '各占50%' },
  { fieldName: 'result', type: 'String', format: '枚举值', rule: '合格(90%)/不合格(10%)', note: '' },
  { fieldName: 'defect', type: 'String', format: '文本', rule: '不合格时必须包含1-2个物料对应的缺陷类型', note: '合格时禁止出现缺陷描述' },
]);

// 上线页面字段规范
const onlineConstraints = ref([
  { fieldName: 'factory', type: 'String', format: '枚举值', rule: '重庆工厂/深圳工厂/南昌工厂/宜宾工厂', note: '' },
  { fieldName: 'productionLine', type: 'String', format: '枚举值', rule: '01线/02线/03线/04线', note: '' },
  { fieldName: 'baselineId', type: 'String', format: '基线ID格式', rule: '必须与projectId匹配预设对应关系', note: '禁止同项目不同基线' },
  { fieldName: 'projectId', type: 'String', format: '项目ID格式', rule: '必须来自预定义项目', note: '' },
  { fieldName: 'materialCode', type: 'String', format: '同仓库页面', rule: '必须与仓库页面的相同批次物料编码一致', note: '' },
  { fieldName: 'materialName', type: 'String', format: '同仓库页面', rule: '必须与仓库页面的相同批次物料名称一致', note: '' },
  { fieldName: 'supplier', type: 'String', format: '同仓库页面', rule: '必须与仓库页面的相同批次供应商一致', note: '' },
  { fieldName: 'batchNo', type: 'String', format: '同仓库页面', rule: '必须与仓库页面的相同批次号一致', note: '' },
  { fieldName: 'defectRate', type: 'String', format: '百分比格式', rule: '0.0%~10.0% (80%<5%, 20%≥5%)', note: '如"0.2%"' },
  { fieldName: 'defect', type: 'String', format: '文本', rule: 'defectRate>0.5%时必须包含1-2个物料对应的缺陷类型', note: 'defectRate≤0.5%时禁止出现缺陷描述' },
  { fieldName: 'inspectionDate', type: 'Date', format: 'YYYY-MM-DD', rule: '2024-01-01 至 2025-05-31', note: '必须晚于物料入库日期' },
]);

// 项目-基线一致性
const projectBaselineConsistency = ref([
  { page: '测试页面', field: 'projectId', rule: '相同projectId必须对应相同baselineId' },
  { page: '上线页面', field: 'projectId', rule: '相同projectId必须对应相同baselineId' },
  { page: '测试/上线', field: 'baselineId', rule: '必须严格匹配project_baseline预设映射' },
]);

// 数量验证
const quantityValidation = ref([
  { page: '仓库', count: '200', deviation: '±5%' },
  { page: '测试', count: '540', deviation: '±5%' },
  { page: '上线', count: '1080', deviation: '±5%' },
]);

// 关键分布验证
const distributionValidation = ref([
  { page: '仓库', metric: '正常状态比例', requirement: '70%', deviation: '±5%' },
  { page: '测试', metric: '合格率', requirement: '90%', deviation: '±2%' },
  { page: '上线', metric: '不良率<5%比例', requirement: '80%', deviation: '±5%' },
]);

// 完整性验证
const completenessValidation = ref([
  { item: '物料种类覆盖率', requirement: '100%' },
  { item: '项目覆盖率', requirement: '100%' },
  { item: '工厂覆盖率', requirement: '100%' },
  { item: '物料批次历史测试记录(≥3条)', requirement: '100%' },
  { item: '物料批次历史上线记录(≥5条)', requirement: '100%' },
]);

// 跳转到数据生成工具
function goToDataGenerator() {
  router.push('/admin/data');
}
</script>

<style scoped>
.data-rules-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin-bottom: 5px;
}

.description {
  color: #666;
  font-size: 14px;
}

.main-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rule-categories {
  margin: 20px 0;
}

.code-block {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 10px;
  margin: 10px 0;
  overflow-x: auto;
}

.code-block pre {
  margin: 0;
  font-family: monospace;
  white-space: pre-wrap;
}

.alert-actions {
  margin-top: 10px;
}

.section-title {
  margin-bottom: 10px;
}

.rules-section {
  margin-bottom: 20px;
}

.mermaid-diagram {
  margin-bottom: 20px;
}

.conclusion-note {
  margin-top: 20px;
  color: #666;
  font-size: 14px;
}
</style> 