<template>
  <div class="data-rules-display">
    <el-tabs type="border-card" class="rule-tabs">
      <el-tab-pane label="物料关联规则">
        <div class="rule-content">
          <h4>批次关联规则</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="批次号保留">
              <el-tag type="success">测试数据保留原批次号</el-tag>
              <el-tag type="success" style="margin-left: 5px">上线数据保留原批次号</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="主要关联字段">
              <el-tag type="primary">批次号(batchNo)</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="次要关联字段">
              <el-tag>物料编码(materialCode)</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="校验依据">
              <el-tag type="warning">物料编码+批次号+供应商三者必须全局一致</el-tag>
            </el-descriptions-item>
          </el-descriptions>
          
          <h4 style="margin-top: 20px">物料追踪规则</h4>
      <el-table :data="rulesData" border style="width: 100%">
        <el-table-column prop="name" label="规则名称" width="180" />
        <el-table-column prop="keyField" label="关联字段" width="180" />
        <el-table-column prop="relationType" label="关系类型" />
        <el-table-column prop="description" label="规则描述" />
      </el-table>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="历史记录规则">
        <div class="rule-content">
          <div class="history-group">
            <h5>物料入库记录类型</h5>
            <div class="tag-group">
              <el-tag v-for="type in historyTypes.inventory" :key="type" style="margin: 5px">{{ type }}</el-tag>
            </div>
          </div>
          
          <div class="history-group">
            <h5>测试记录类型</h5>
            <div class="tag-group">
              <el-tag v-for="type in historyTypes.lab" :key="type" type="success" style="margin: 5px">{{ type }}</el-tag>
            </div>
          </div>
          
          <div class="history-group">
            <h5>上线记录类型</h5>
            <div class="tag-group">
              <el-tag v-for="type in historyTypes.factory" :key="type" type="warning" style="margin: 5px">{{ type }}</el-tag>
            </div>
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="物料-不良-供应商匹配规则">
        <div class="rule-content">
          <el-alert
            title="物料-不良现象-供应商匹配规则"
            type="warning"
            description="系统限制物料-不良现象-供应商必须按照以下规则进行匹配，后续的物料、不良现象和供应商选择只能从此表中选取，并遵循表中的匹配规则。"
            show-icon
            :closable="false"
            class="alert-info"
            style="margin-bottom: 20px"
          />
          
          <h4>结构件类</h4>
          <el-table :data="materialDefectStructure" border style="width: 100%; margin-bottom: 20px">
            <el-table-column prop="material" label="物料" width="150" />
            <el-table-column label="异常" min-width="250">
              <template #default="scope">
                <div class="tag-group">
                  <el-tag size="small" v-for="(defect, index) in scope.row.defects" :key="index" style="margin: 2px">
                    {{ defect }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="供应商" min-width="200">
              <template #default="scope">
                <div class="tag-group">
                  <el-tag size="small" type="success" v-for="(supplier, index) in scope.row.suppliers" :key="index" style="margin: 2px">
                    {{ supplier }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
          </el-table>
          
          <h4>光学类</h4>
          <el-table :data="materialDefectOptical" border style="width: 100%; margin-bottom: 20px">
            <el-table-column prop="material" label="物料" width="150" />
            <el-table-column label="异常" min-width="250">
              <template #default="scope">
                <div class="tag-group">
                  <el-tag size="small" v-for="(defect, index) in scope.row.defects" :key="index" style="margin: 2px">
                    {{ defect }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="供应商" min-width="200">
              <template #default="scope">
                <div class="tag-group">
                  <el-tag size="small" type="success" v-for="(supplier, index) in scope.row.suppliers" :key="index" style="margin: 2px">
                    {{ supplier }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
          </el-table>
          
          <h4>充电类</h4>
          <el-table :data="materialDefectCharging" border style="width: 100%; margin-bottom: 20px">
            <el-table-column prop="material" label="物料" width="150" />
            <el-table-column label="异常" min-width="250">
              <template #default="scope">
                <div class="tag-group">
                  <el-tag size="small" v-for="(defect, index) in scope.row.defects" :key="index" style="margin: 2px">
                    {{ defect }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="供应商" min-width="200">
              <template #default="scope">
                <div class="tag-group">
                  <el-tag size="small" type="success" v-for="(supplier, index) in scope.row.suppliers" :key="index" style="margin: 2px">
                    {{ supplier }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="项目-基线绑定规则">
        <div class="rule-content">
          <el-alert
            title="项目-基线绑定规则"
            type="warning"
            description="系统限制项目-基线必须按照以下规则进行匹配，同一项目在不同记录中必须使用相同的基线ID。"
            show-icon
            :closable="false"
            class="alert-info"
            style="margin-bottom: 20px"
          />
          
          <h4>项目-基线绑定表</h4>
          <el-table :data="projectBaselineMapping" border style="width: 100%; margin-bottom: 20px">
            <el-table-column prop="projectId" label="项目ID" width="180" />
            <el-table-column prop="baselineId" label="对应的基线ID" width="180" />
            <el-table-column prop="description" label="说明" />
          </el-table>
          
          <div class="warning-section">
            <el-tag type="danger">禁止出现：</el-tag>
            <p>同项目在不同记录中出现不同基线ID</p>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 规则数据
const rulesData = ref([
  {
    name: '库存-质检关联',
    keyField: 'batchNo',
    relationType: '一对一',
    description: '库存数据与质检数据通过批次号关联'
  },
  {
    name: '质检-上线关联',
    keyField: 'batchNo',
    relationType: '一对一',
    description: '质检数据与上线数据通过批次号关联'
  },
  {
    name: '物料跟踪关系',
    keyField: 'trackingId',
    relationType: '多对一',
    description: '多个环节的物料数据通过跟踪ID建立关联'
  }
]);

// 历史记录类型
const historyTypes = {
  inventory: ['入库', '出库', '调拨', '盘点', '冻结', '解冻', '状态变更', '质量问题', '返工', '退货'],
  lab: ['送检', '检验开始', '检验完成', '合格', '不合格', '有条件接收', '返工', '特采', '报废'],
  factory: ['上线', '生产', '完工', '异常', '停线', '返修', '报废', '入库']
};

// 物料-不良现象-供应商匹配数据
const materialDefectStructure = ref([
  { 
    material: '电池盖', 
    defects: ['划伤', '掉漆', '起鼓', '超重', '尺寸异常'],
    suppliers: ['聚龙', '欣冠', '广正']
  },
  { 
    material: '主板', 
    defects: ['变形', '破裂', '断裂', '尺寸异常'],
    suppliers: ['聚龙', '欣冠', '广正']
  },
  { 
    material: '手机卡托', 
    defects: ['注塑不良', '尺寸异常', '断裂', '毛刺'],
    suppliers: ['聚龙', '欣冠', '广正']
  },
  { 
    material: '侧键', 
    defects: ['脱落', '卡键', '尺寸异常', '松动'],
    suppliers: ['聚龙', '欣冠', '广正']
  },
  { 
    material: '装饰件', 
    defects: ['掉色', '偏位', '脱落', '掉色'],
    suppliers: ['聚龙', '欣冠', '广正']
  }
]);

const materialDefectOptical = ref([
  { 
    material: 'LCD屏幕', 
    defects: ['亮点', '暗点', '色差', '漏光', '闪烁'],
    suppliers: ['晶电', '京东方', '夏普']
  },
  { 
    material: '摄像头模组', 
    defects: ['成像模糊', '异物', '色斑', '聚焦异常'],
    suppliers: ['晶电', '京东方', '夏普']
  },
  { 
    material: '触摸屏', 
    defects: ['触控失灵', '多点触控异常', '灵敏度低', '划痕'],
    suppliers: ['晶电', '京东方', '夏普']
  }
]);

const materialDefectCharging = ref([
  { 
    material: '充电器', 
    defects: ['接触不良', '电压不稳', '短路', '过热'],
    suppliers: ['德赛', '立讯', '比亚迪']
  },
  { 
    material: '电池', 
    defects: ['鼓包', '容量不足', '过热', '充电异常'],
    suppliers: ['德赛', '立讯', '比亚迪']
  }
]);

// 项目-基线对应关系
const projectBaselineMapping = ref([
  { projectId: 'X6827', baselineId: 'BL-2024001', description: 'X6系列第一代基线' },
  { projectId: 'S665LN', baselineId: 'BL-2024002', description: 'S6系列豪华版基线' },
  { projectId: 'S665', baselineId: 'BL-2024003', description: 'S6系列标准版基线' },
  { projectId: 'X6P', baselineId: 'BL-2024004', description: 'X6系列Plus版基线' },
  { projectId: 'M2201', baselineId: 'BL-2024005', description: 'M2系列第一代基线' },
  { projectId: 'K358', baselineId: 'BL-2024006', description: 'K3系列高配版基线' },
  { projectId: 'K358L', baselineId: 'BL-2024007', description: 'K3系列轻量版基线' },
  { projectId: 'A778H', baselineId: 'BL-2024008', description: 'A7系列高端版基线' }
]);
</script>

<style scoped>
.data-rules-display {
  width: 100%;
}

.rule-tabs {
  margin-bottom: 20px;
}

.rule-content {
  padding: 15px;
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.history-group h5 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.warning-section {
  margin-top: 20px;
  padding: 15px;
  background-color: #FEF0F0;
  border-radius: 4px;
  border-left: 3px solid #F56C6C;
}

.warning-section p {
  margin: 10px 0 0;
  font-size: 14px;
  color: #606266;
}
</style>
