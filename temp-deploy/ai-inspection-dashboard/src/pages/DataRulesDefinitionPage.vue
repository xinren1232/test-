<template>
  <div class="data-rules-definition">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <el-icon class="title-icon"><Document /></el-icon>
            数据规则定义
          </h1>
          <p class="page-description">
            IQE智能质检系统完整数据规则体系，涵盖数据结构、生成规则、匹配规则和一致性约束
          </p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="goToDataGenerator">
            <el-icon><Tools /></el-icon>
            数据生成工具
          </el-button>
          <el-button type="success" @click="goToRuleLibrary">
            <el-icon><Collection /></el-icon>
            规则库管理
          </el-button>
        </div>
      </div>
    </div>

    <!-- 规则概览卡片 -->
    <div class="overview-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="overview-card" shadow="hover">
            <div class="card-content">
              <div class="card-icon inventory">
                <el-icon><Box /></el-icon>
              </div>
              <div class="card-info">
                <h3>库存规则</h3>
                <p>132条记录</p>
                <span class="card-tag">物料入库管理</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card" shadow="hover">
            <div class="card-content">
              <div class="card-icon test">
                <el-icon><Monitor /></el-icon>
              </div>
              <div class="card-info">
                <h3>测试规则</h3>
                <p>396条记录</p>
                <span class="card-tag">质量检测管理</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card" shadow="hover">
            <div class="card-content">
              <div class="card-icon production">
                <el-icon><Operation /></el-icon>
              </div>
              <div class="card-info">
                <h3>上线规则</h3>
                <p>1056条记录</p>
                <span class="card-tag">生产线管理</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card" shadow="hover">
            <div class="card-content">
              <div class="card-icon matching">
                <el-icon><Connection /></el-icon>
              </div>
              <div class="card-info">
                <h3>匹配规则</h3>
                <p>15种物料</p>
                <span class="card-tag">关联性管理</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 主要内容区域 -->
    <el-card class="main-content-card">
      <el-tabs v-model="activeTab" type="border-card" class="main-tabs">
        <!-- 数据结构定义 -->
        <el-tab-pane label="数据结构定义" name="structure">
          <div class="tab-content">
            <div class="section-header">
              <h2>
                <el-icon><Grid /></el-icon>
                数据结构定义
              </h2>
              <p>定义系统中三大核心页面的数据字段结构、类型约束和业务规则</p>
            </div>

            <!-- 库存数据结构 -->
            <div class="structure-section">
              <h3 class="section-title">
                <el-icon><Box /></el-icon>
                库存数据结构
              </h3>
              <el-table :data="inventoryFields" border stripe class="structure-table">
                <el-table-column prop="fieldName" label="字段名" width="150" />
                <el-table-column prop="type" label="数据类型" width="120" />
                <el-table-column prop="format" label="格式要求" width="200" />
                <el-table-column prop="constraint" label="约束条件" />
                <el-table-column prop="example" label="示例" width="150" />
              </el-table>
            </div>

            <!-- 测试数据结构 -->
            <div class="structure-section">
              <h3 class="section-title">
                <el-icon><Monitor /></el-icon>
                测试数据结构
              </h3>
              <el-table :data="testFields" border stripe class="structure-table">
                <el-table-column prop="fieldName" label="字段名" width="150" />
                <el-table-column prop="type" label="数据类型" width="120" />
                <el-table-column prop="format" label="格式要求" width="200" />
                <el-table-column prop="constraint" label="约束条件" />
                <el-table-column prop="example" label="示例" width="150" />
              </el-table>
            </div>

            <!-- 上线数据结构 -->
            <div class="structure-section">
              <h3 class="section-title">
                <el-icon><Operation /></el-icon>
                上线数据结构
              </h3>
              <el-table :data="productionFields" border stripe class="structure-table">
                <el-table-column prop="fieldName" label="字段名" width="150" />
                <el-table-column prop="type" label="数据类型" width="120" />
                <el-table-column prop="format" label="格式要求" width="200" />
                <el-table-column prop="constraint" label="约束条件" />
                <el-table-column prop="example" label="示例" width="150" />
              </el-table>
            </div>
          </div>
        </el-tab-pane>

        <!-- 数据生成规则 -->
        <el-tab-pane label="数据生成规则" name="generation">
          <div class="tab-content">
            <div class="section-header">
              <h2>
                <el-icon><Tools /></el-icon>
                数据生成规则
              </h2>
              <p>定义系统数据自动生成的逻辑、步骤和约束条件</p>
            </div>

            <!-- 生成流程图 -->
            <div class="generation-flow">
              <h3 class="section-title">数据生成流程</h3>
              <el-steps :active="5" finish-status="success" align-center>
                <el-step title="物料编码生成" description="为每种物料生成唯一编码" />
                <el-step title="批次号分配" description="为每个物料-供应商组合生成批次" />
                <el-step title="库存数据生成" description="生成132条库存记录" />
                <el-step title="测试数据生成" description="生成396条测试记录" />
                <el-step title="上线数据生成" description="生成1056条上线记录" />
              </el-steps>
            </div>

            <!-- 生成规则详情 -->
            <div class="generation-rules">
              <el-collapse v-model="activeGenerationRules">
                <el-collapse-item title="物料编码生成规则" name="material-code">
                  <div class="rule-detail">
                    <h4>生成逻辑</h4>
                    <ul>
                      <li>格式：M + 4-6位数字（如：M10001）</li>
                      <li>为每种物料的每个供应商生成独立编码</li>
                      <li>编码全局唯一，不重复</li>
                    </ul>
                    <div class="code-example">
                      <pre><code>// 物料编码生成示例
for (const material of materials) {
  for (const supplier of material.suppliers) {
    const code = `M${codeCounter.toString().padStart(5, '0')}`;
    materialCodes[code] = { material, supplier };
    codeCounter++;
  }
}</code></pre>
                    </div>
                  </div>
                </el-collapse-item>

                <el-collapse-item title="批次号分配规则" name="batch-no">
                  <div class="rule-detail">
                    <h4>分配逻辑</h4>
                    <ul>
                      <li>格式：6位数字，范围100000-999999</li>
                      <li>每个物料-供应商组合生成固定批次数</li>
                      <li>批次号全局唯一</li>
                      <li>同工厂同物料不能使用相同批次号</li>
                      <li><strong>总计132个批次</strong>，对应132条库存记录</li>
                    </ul>
                  </div>
                </el-collapse-item>

                <el-collapse-item title="数据生成比例规则" name="data-ratio">
                  <div class="rule-detail">
                    <h4>固定比例生成</h4>
                    <ul>
                      <li><strong>库存:测试:上线 = 1:3:8</strong></li>
                      <li>每个物料批次生成1条库存记录</li>
                      <li>每个物料批次生成3条测试记录</li>
                      <li>每个物料批次生成8条上线记录</li>
                      <li>总计：132 × (1+3+8) = 1584条记录</li>
                    </ul>
                    <div class="code-example">
                      <pre><code>// 数据生成比例示例
const BATCH_COUNT = 132;
const INVENTORY_PER_BATCH = 1;  // 132条库存
const TEST_PER_BATCH = 3;       // 396条测试
const PRODUCTION_PER_BATCH = 8; // 1056条上线

for (let i = 0; i < BATCH_COUNT; i++) {
  generateInventoryRecord(batch);     // 1条
  generateTestRecords(batch, 3);      // 3条
  generateProductionRecords(batch, 8); // 8条
}</code></pre>
                    </div>
                  </div>
                </el-collapse-item>

                <el-collapse-item title="数据量分配规则" name="data-volume">
                  <div class="rule-detail">
                    <h4>记录数量分配</h4>
                    <p><strong>基于实际业务数据的固定数量生成：</strong></p>
                    <el-table :data="dataVolumeRules" border>
                      <el-table-column prop="dataType" label="数据类型" />
                      <el-table-column prop="totalRecords" label="总记录数" />
                      <el-table-column prop="perBatch" label="每批次记录数" />
                      <el-table-column prop="distribution" label="分布规则" />
                    </el-table>
                    <div class="data-note">
                      <el-alert
                        title="数据生成说明"
                        type="info"
                        description="系统采用固定数量的数据生成策略，确保每次生成的数据量一致，便于测试和演示。每个物料批次按照预设的记录数量进行分配，保证数据的完整性和一致性。"
                        show-icon
                        :closable="false"
                      />
                    </div>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
          </div>
        </el-tab-pane>

        <!-- 数据匹配规则 -->
        <el-tab-pane label="数据匹配规则" name="matching">
          <div class="tab-content">
            <div class="section-header">
              <h2>
                <el-icon><Connection /></el-icon>
                数据匹配规则
              </h2>
              <p>定义物料、供应商、不良现象和项目基线之间的匹配关系</p>
            </div>

            <!-- 物料-供应商-不良匹配 -->
            <div class="matching-section">
              <h3 class="section-title">
                <el-icon><Setting /></el-icon>
                物料-供应商-不良匹配规则
              </h3>
              <el-alert
                title="匹配规则说明"
                type="warning"
                description="系统限制物料-不良现象-供应商必须按照预定义规则进行匹配，确保数据的准确性和一致性。"
                show-icon
                :closable="false"
                style="margin-bottom: 20px"
              />

              <el-table :data="materialSupplierDefectRules" border stripe class="matching-table">
                <el-table-column prop="material" label="物料名称" width="150" />
                <el-table-column prop="category" label="物料分类" width="120" />
                <el-table-column prop="suppliers" label="可选供应商" width="200" />
                <el-table-column prop="defects" label="可能不良现象" />
              </el-table>
            </div>

            <!-- 项目-基线匹配 -->
            <div class="matching-section">
              <h3 class="section-title">
                <el-icon><DataAnalysis /></el-icon>
                项目-基线匹配规则
              </h3>
              <el-alert
                title="项目基线绑定"
                type="info"
                description="同一项目在不同记录中必须使用相同的基线ID，禁止出现同项目不同基线的情况。"
                show-icon
                :closable="false"
                style="margin-bottom: 20px"
              />

              <el-table :data="projectBaselineRules" border stripe class="matching-table">
                <el-table-column prop="baselineId" label="基线ID" width="150" />
                <el-table-column prop="projects" label="关联项目" />
                <el-table-column prop="description" label="项目描述" />
              </el-table>
            </div>

            <!-- 工厂-仓库匹配 -->
            <div class="matching-section">
              <h3 class="section-title">
                <el-icon><Box /></el-icon>
                工厂-仓库匹配规则
              </h3>
              <el-table :data="factoryWarehouseRules" border stripe class="matching-table">
                <el-table-column prop="factory" label="工厂" width="150" />
                <el-table-column prop="allowedWarehouses" label="可用仓库" />
                <el-table-column prop="restriction" label="限制说明" />
              </el-table>
            </div>
          </div>
        </el-tab-pane>

        <!-- 一致性约束 -->
        <el-tab-pane label="一致性约束" name="consistency">
          <div class="tab-content">
            <div class="section-header">
              <h2>
                <el-icon><Monitor /></el-icon>
                数据一致性约束
              </h2>
              <p>定义跨页面数据的一致性要求和验证规则</p>
            </div>

            <!-- 跨页面一致性 -->
            <div class="consistency-section">
              <h3 class="section-title">跨页面数据一致性</h3>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-card class="consistency-card">
                    <template #header>
                      <h4>三要素绑定规则</h4>
                    </template>
                    <div class="consistency-content">
                      <p><strong>物料编码 + 批次号 + 供应商</strong> 三者必须在所有页面保持一致</p>
                      <ul>
                        <li>库存页面：定义三要素基础信息</li>
                        <li>测试页面：继承库存页面的三要素</li>
                        <li>上线页面：继承库存页面的三要素</li>
                      </ul>
                    </div>
                  </el-card>
                </el-col>
                <el-col :span="12">
                  <el-card class="consistency-card">
                    <template #header>
                      <h4>时间线约束规则</h4>
                    </template>
                    <div class="consistency-content">
                      <p><strong>入库时间 ≤ 测试时间 ≤ 检验时间</strong></p>
                      <ul>
                        <li>测试日期必须晚于物料入库日期</li>
                        <li>检验日期必须晚于测试日期</li>
                        <li>所有日期在2024-01-01至2025-05-31范围内</li>
                      </ul>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </div>

            <!-- 禁止性规则 -->
            <div class="consistency-section">
              <h3 class="section-title">禁止性规则汇总</h3>
              <el-collapse v-model="activeConsistencyRules">
                <el-collapse-item title="全局禁止行为" name="global">
                  <div class="rule-detail">
                    <el-tag type="danger" class="rule-tag">❌ 同项目在不同页面/记录中出现不同基线ID</el-tag>
                    <el-tag type="danger" class="rule-tag">❌ 相同物料编码+批次在不同页面出现不同供应商</el-tag>
                    <el-tag type="danger" class="rule-tag">❌ 日期超出2024-01-01至2025-05-31范围</el-tag>
                  </div>
                </el-collapse-item>

                <el-collapse-item title="库存页面禁止" name="inventory">
                  <div class="rule-detail">
                    <el-tag type="danger" class="rule-tag">❌ 同工厂的同种物料使用相同批次</el-tag>
                    <el-tag type="danger" class="rule-tag">❌ 重庆工厂使用深圳库存</el-tag>
                    <el-tag type="danger" class="rule-tag">❌ 状态分布偏离正常70%/风险20%/冻结10%±5%</el-tag>
                  </div>
                </el-collapse-item>

                <el-collapse-item title="测试页面禁止" name="test">
                  <div class="rule-detail">
                    <el-tag type="danger" class="rule-tag">❌ 合格记录中出现缺陷描述</el-tag>
                    <el-tag type="danger" class="rule-tag">❌ 测试合格率偏离90%±2%</el-tag>
                    <el-tag type="danger" class="rule-tag">❌ 物料批次测试记录不等于3条</el-tag>
                  </div>
                </el-collapse-item>

                <el-collapse-item title="上线页面禁止" name="production">
                  <div class="rule-detail">
                    <el-tag type="danger" class="rule-tag">❌ 缺陷率≤0.5%的记录出现缺陷描述</el-tag>
                    <el-tag type="danger" class="rule-tag">❌ 不良率分布偏离<5%:80%/≥5%:20%±5%</el-tag>
                    <el-tag type="danger" class="rule-tag">❌ 物料批次上线记录不等于8条</el-tag>
                    <el-tag type="danger" class="rule-tag">❌ 工厂信息与仓库记录不一致</el-tag>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>

            <!-- 数据验证指标 -->
            <div class="consistency-section">
              <h3 class="section-title">数据验证指标</h3>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-card class="validation-card">
                    <template #header>
                      <h4>数量验证</h4>
                    </template>
                    <el-table :data="quantityValidation" border size="small">
                      <el-table-column prop="page" label="页面" />
                      <el-table-column prop="count" label="记录数" />
                      <el-table-column prop="deviation" label="允许偏差" />
                    </el-table>
                  </el-card>
                </el-col>
                <el-col :span="8">
                  <el-card class="validation-card">
                    <template #header>
                      <h4>分布验证</h4>
                    </template>
                    <el-table :data="distributionValidation" border size="small">
                      <el-table-column prop="metric" label="指标" />
                      <el-table-column prop="requirement" label="要求" />
                      <el-table-column prop="deviation" label="偏差" />
                    </el-table>
                  </el-card>
                </el-col>
                <el-col :span="8">
                  <el-card class="validation-card">
                    <template #header>
                      <h4>完整性验证</h4>
                    </template>
                    <el-table :data="completenessValidation" border size="small">
                      <el-table-column prop="item" label="检查项" />
                      <el-table-column prop="requirement" label="要求" />
                    </el-table>
                  </el-card>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Document, Tools, Collection, Box, Monitor, Operation, 
  Connection, Grid, Setting, DataAnalysis 
} from '@element-plus/icons-vue';

const router = useRouter();
const activeTab = ref('structure');
const activeGenerationRules = ref(['material-code']);
const activeConsistencyRules = ref(['global']);

// 库存数据字段定义
const inventoryFields = ref([
  {
    fieldName: 'materialCode',
    type: 'String',
    format: 'M + 4-6位数字',
    constraint: '全局唯一，与测试/上线页面一致',
    example: 'M10001'
  },
  {
    fieldName: 'materialName', 
    type: 'String',
    format: '2-50字符',
    constraint: '来自15种预定义物料',
    example: '电池盖'
  },
  {
    fieldName: 'batchNo',
    type: 'String', 
    format: '6位数字',
    constraint: '100000-999999，全局唯一',
    example: '123456'
  },
  {
    fieldName: 'factory',
    type: 'String',
    format: '枚举值',
    constraint: '重庆/深圳/南昌/宜宾工厂',
    example: '重庆工厂'
  },
  {
    fieldName: 'warehouse',
    type: 'String', 
    format: '枚举值',
    constraint: '中央/重庆/深圳库存',
    example: '中央库存'
  },
  {
    fieldName: 'supplier',
    type: 'String',
    format: '2-50字符', 
    constraint: '匹配物料对应供应商列表',
    example: '聚龙'
  },
  {
    fieldName: 'quantity',
    type: 'Number',
    format: '正整数',
    constraint: '100-5000',
    example: '1500'
  },
  {
    fieldName: 'status',
    type: 'String',
    format: '枚举值',
    constraint: '正常70%/风险20%/冻结10%',
    example: '正常'
  }
]);

// 测试数据字段定义
const testFields = ref([
  {
    fieldName: 'testId',
    type: 'String',
    format: 'TEST-[物料编码]-[批次前4位]-[6位随机]',
    constraint: '全局唯一',
    example: 'TEST-M10001-1234-567890'
  },
  {
    fieldName: 'testDate',
    type: 'Date',
    format: 'YYYY-MM-DD',
    constraint: '2024-01-01至2025-05-31',
    example: '2024-03-15'
  },
  {
    fieldName: 'projectId',
    type: 'String', 
    format: '项目ID格式',
    constraint: '来自预定义项目列表',
    example: 'X6827'
  },
  {
    fieldName: 'baselineId',
    type: 'String',
    format: '基线ID格式', 
    constraint: '与projectId匹配预设关系',
    example: 'I6789'
  },
  {
    fieldName: 'result',
    type: 'String',
    format: '枚举值',
    constraint: '合格90%/不合格10%',
    example: '合格'
  },
  {
    fieldName: 'defect',
    type: 'String',
    format: '文本',
    constraint: '不合格时必须包含1-2个缺陷',
    example: '划伤,色差'
  }
]);

// 上线数据字段定义  
const productionFields = ref([
  {
    fieldName: 'factory',
    type: 'String',
    format: '枚举值', 
    constraint: '重庆/深圳/南昌/宜宾工厂',
    example: '重庆工厂'
  },
  {
    fieldName: 'productionLine',
    type: 'String',
    format: '枚举值',
    constraint: '01线/02线/03线/04线',
    example: '01线'
  },
  {
    fieldName: 'defectRate',
    type: 'String',
    format: '百分比格式',
    constraint: '0.0%-10.0%，80%<5%',
    example: '0.2%'
  },
  {
    fieldName: 'defect',
    type: 'String', 
    format: '文本',
    constraint: 'defectRate>0.5%时必须包含缺陷',
    example: '划伤,色差'
  },
  {
    fieldName: 'inspectionDate',
    type: 'Date',
    format: 'YYYY-MM-DD',
    constraint: '2024-01-01至2025-05-31',
    example: '2024-03-20'
  }
]);

// 数据量分配规则
const dataVolumeRules = ref([
  {
    dataType: '库存数据',
    totalRecords: '132条',
    perBatch: '1条',
    distribution: '每个物料批次对应1条库存记录'
  },
  {
    dataType: '测试数据',
    totalRecords: '396条',
    perBatch: '3条',
    distribution: '每个物料批次固定3条测试记录'
  },
  {
    dataType: '上线数据',
    totalRecords: '1056条',
    perBatch: '8条',
    distribution: '每个物料批次固定8条上线记录'
  }
]);

// 物料-供应商-不良匹配规则
const materialSupplierDefectRules = ref([
  {
    material: '电池盖',
    category: '结构件类',
    suppliers: '聚龙',
    defects: '划伤, 色差, 尺寸偏差, 毛刺'
  },
  {
    material: 'LCD显示屏',
    category: '光学类',
    suppliers: 'BOE, 天马',
    defects: '亮点, 暗点, 色彩偏差, 触控失效'
  },
  {
    material: 'OLED显示屏',
    category: '光学类',
    suppliers: 'BOE, 天马, 华星',
    defects: '烧屏, 色彩不均, 触控失效, 亮度异常'
  },
  {
    material: '扬声器',
    category: '声学类',
    suppliers: '歌尔',
    defects: '音质异常, 无声, 杂音, 音量偏小'
  },
  {
    material: '中框',
    category: '结构件类',
    suppliers: '聚龙',
    defects: '变形, 划伤, 尺寸偏差, 表面缺陷'
  }
]);

// 项目-基线匹配规则
const projectBaselineRules = ref([
  {
    baselineId: 'I6789',
    projects: 'X6827, S665LN, KI4K, X6828',
    description: '主要产品线基线，涵盖核心项目'
  },
  {
    baselineId: 'I6788',
    projects: 'X6831, KI5K, KI3K',
    description: '次要产品线基线，涵盖辅助项目'
  },
  {
    baselineId: 'I6787',
    projects: 'S662LN, S663LN, S664LN',
    description: '特殊产品线基线，涵盖定制项目'
  }
]);

// 工厂-仓库匹配规则
const factoryWarehouseRules = ref([
  {
    factory: '重庆工厂',
    allowedWarehouses: '重庆库存, 中央库存',
    restriction: '可使用本地库存或中央库存'
  },
  {
    factory: '深圳工厂',
    allowedWarehouses: '深圳库存, 中央库存',
    restriction: '可使用本地库存或中央库存'
  },
  {
    factory: '南昌工厂',
    allowedWarehouses: '中央库存',
    restriction: '只能使用中央库存'
  },
  {
    factory: '宜宾工厂',
    allowedWarehouses: '中央库存',
    restriction: '只能使用中央库存'
  }
]);

// 数量验证规则
const quantityValidation = ref([
  { page: '库存', count: '132', deviation: '固定数量' },
  { page: '测试', count: '396', deviation: '固定数量' },
  { page: '上线', count: '1056', deviation: '固定数量' }
]);

// 分布验证规则
const distributionValidation = ref([
  { metric: '正常状态比例', requirement: '70%', deviation: '±5%' },
  { metric: '测试合格率', requirement: '90%', deviation: '±2%' },
  { metric: '不良率<5%比例', requirement: '80%', deviation: '±5%' }
]);

// 完整性验证规则
const completenessValidation = ref([
  { item: '物料种类覆盖率', requirement: '100%' },
  { item: '项目覆盖率', requirement: '100%' },
  { item: '工厂覆盖率', requirement: '100%' },
  { item: '批次测试记录=3条', requirement: '100%' },
  { item: '批次上线记录=8条', requirement: '100%' }
]);

// 导航方法
function goToDataGenerator() {
  router.push('/admin/data');
}

function goToRuleLibrary() {
  router.push('/rule-library');
}
</script>

<style scoped>
.data-rules-definition {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 页面头部样式 */
.page-header {
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.title-section {
  flex: 1;
}

.page-title {
  display: flex;
  align-items: center;
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.title-icon {
  margin-right: 12px;
  font-size: 32px;
  color: #409eff;
}

.page-description {
  margin: 0;
  color: #606266;
  font-size: 16px;
  line-height: 1.5;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 概览卡片样式 */
.overview-cards {
  margin-bottom: 20px;
}

.overview-card {
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.card-content {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: white;
}

.card-icon.inventory {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-icon.test {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.card-icon.production {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.card-icon.matching {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.card-info h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.card-info p {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: #409eff;
}

.card-tag {
  display: inline-block;
  padding: 2px 8px;
  background: #f0f9ff;
  color: #1890ff;
  border-radius: 4px;
  font-size: 12px;
}

/* 主内容卡片样式 */
.main-content-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: none;
}

.main-tabs {
  border: none;
}

.tab-content {
  padding: 20px 0;
}

/* 章节头部样式 */
.section-header {
  margin-bottom: 30px;
  text-align: center;
}

.section-header h2 {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.section-header h2 .el-icon {
  margin-right: 8px;
  font-size: 28px;
  color: #409eff;
}

.section-header p {
  margin: 0;
  color: #606266;
  font-size: 16px;
}

/* 结构章节样式 */
.structure-section {
  margin-bottom: 40px;
}

.section-title {
  display: flex;
  align-items: center;
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.section-title .el-icon {
  margin-right: 8px;
  color: #409eff;
}

.structure-table {
  margin-bottom: 20px;
}

/* 生成流程样式 */
.generation-flow {
  margin-bottom: 30px;
  padding: 24px;
  background: white;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.generation-rules {
  margin-top: 20px;
}

.rule-detail h4 {
  margin: 0 0 12px 0;
  color: #303133;
}

.rule-detail ul {
  margin: 0 0 16px 0;
  padding-left: 20px;
}

.rule-detail li {
  margin-bottom: 8px;
  color: #606266;
}

.code-example {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 16px;
  margin-top: 12px;
}

.code-example pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  color: #303133;
}

/* 匹配规则样式 */
.matching-section {
  margin-bottom: 40px;
}

.matching-table {
  margin-top: 16px;
}

/* 一致性约束样式 */
.consistency-section {
  margin-bottom: 30px;
}

.consistency-card {
  height: 100%;
  border: 1px solid #ebeef5;
}

.consistency-content p {
  margin: 0 0 12px 0;
  font-weight: 600;
  color: #303133;
}

.consistency-content ul {
  margin: 0;
  padding-left: 20px;
}

.consistency-content li {
  margin-bottom: 6px;
  color: #606266;
}

.rule-tag {
  display: block;
  margin-bottom: 8px;
  padding: 8px 12px;
  border-radius: 4px;
}

.validation-card {
  height: 100%;
  border: 1px solid #ebeef5;
}

.data-note {
  margin-top: 16px;
}

.data-note .el-alert {
  border-radius: 6px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .data-rules-definition {
    padding: 10px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .page-title {
    font-size: 24px;
  }

  .card-content {
    flex-direction: column;
    text-align: center;
  }

  .card-icon {
    margin-right: 0;
    margin-bottom: 12px;
  }
}
</style>
