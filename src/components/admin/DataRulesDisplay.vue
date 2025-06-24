<!-- 
  数据规则展示组件
  展示系统中三个主要页面之间的数据关联规则
-->
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
            <el-descriptions-item label="跟踪字段">
              <el-tag type="info">供应商(supplier)</el-tag>
              <el-tag type="info" style="margin-left: 5px">类别(category)</el-tag>
            </el-descriptions-item>
          </el-descriptions>
          
          <h4 class="sub-title">时间关联规则</h4>
          <el-table :data="timeRules" border style="width: 100%">
            <el-table-column prop="name" label="规则名称" width="220" />
            <el-table-column prop="value" label="规则值" />
            <el-table-column prop="description" label="说明" />
          </el-table>
          
          <h4 class="sub-title">物料流转比例</h4>
          <el-progress 
            :percentage="85" 
            :format="() => '库存→测试: 85%'"
            :stroke-width="18"
            status="success"
            class="progress-item"
          />
          <el-progress 
            :percentage="90" 
            :format="() => '测试→上线: 90%'"
            :stroke-width="18"
            status="success"
            class="progress-item"
          />
          <el-progress 
            :percentage="15" 
            :format="() => '库存→上线(未测试): 15%'"
            :stroke-width="18"
            status="warning"
            class="progress-item"
          />
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="物料状态规则">
        <div class="rule-content">
          <h4>状态转换规则</h4>
          <el-table :data="statusTransitionRules" border style="width: 100%">
            <el-table-column prop="name" label="规则名称" width="220" />
            <el-table-column prop="value" label="规则值" width="180" />
            <el-table-column prop="description" label="说明" />
          </el-table>
          
          <h4 class="sub-title">状态映射关系</h4>
          <div class="status-mapping">
            <div class="mapping-group">
              <h5>库存状态 → 测试状态</h5>
              <div class="mapping-item">
                <span class="status-from"><el-tag>正常</el-tag></span>
                <span class="arrow">→</span>
                <span class="status-to">
                  <el-tag type="success">合格</el-tag>
                  <el-tag type="warning">有条件接收</el-tag>
                </span>
              </div>
              <div class="mapping-item">
                <span class="status-from"><el-tag type="warning">风险</el-tag></span>
                <span class="arrow">→</span>
                <span class="status-to">
                  <el-tag type="warning">有条件接收</el-tag>
                  <el-tag type="danger">不合格</el-tag>
                </span>
              </div>
              <div class="mapping-item">
                <span class="status-from"><el-tag type="danger">冻结</el-tag></span>
                <span class="arrow">→</span>
                <span class="status-to">
                  <el-tag type="danger">不合格</el-tag>
                </span>
              </div>
            </div>
            
            <div class="mapping-group">
              <h5>测试状态 → 上线状态</h5>
              <div class="mapping-item">
                <span class="status-from"><el-tag type="success">合格</el-tag></span>
                <span class="arrow">→</span>
                <span class="status-to">
                  <el-tag>正常</el-tag>
                </span>
              </div>
              <div class="mapping-item">
                <span class="status-from"><el-tag type="warning">有条件接收</el-tag></span>
                <span class="arrow">→</span>
                <span class="status-to">
                  <el-tag>正常</el-tag>
                  <el-tag type="warning">风险</el-tag>
                </span>
              </div>
              <div class="mapping-item">
                <span class="status-from"><el-tag type="danger">不合格</el-tag></span>
                <span class="arrow">→</span>
                <span class="status-to">
                  <el-tag type="warning">风险</el-tag>
                  <el-tag type="danger">异常</el-tag>
                </span>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="供应商对比规则">
        <div class="rule-content">
          <h4>供应商质量差异规则</h4>
          <el-alert
            title="供应商质量差异"
            type="info"
            description="系统支持同一物料不同供应商的质量对比分析，以便进行供应商质量评估和选择。"
            show-icon
            :closable="false"
            class="alert-info"
          />
          
          <h4 class="sub-title">质量差异配置</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="启用供应商质量差异">
              <el-tag type="success">已启用</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="质量差异范围">
              <el-tag type="info">-15% ~ +15%</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="优质供应商">
              <div class="tag-group">
                <el-tag type="success" v-for="(supplier, index) in preferredSuppliers" :key="index">
                  {{ supplier }}
                </el-tag>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="质量较差供应商">
              <div class="tag-group">
                <el-tag type="danger" v-for="(supplier, index) in poorSuppliers" :key="index">
                  {{ supplier }}
                </el-tag>
              </div>
            </el-descriptions-item>
          </el-descriptions>
          
          <h4 class="sub-title">关键对比物料</h4>
          <el-table :data="keyComparisonMaterials" border style="width: 100%">
            <el-table-column prop="name" label="物料名称" />
            <el-table-column prop="minSuppliers" label="最少供应商数" />
            <el-table-column prop="maxSuppliers" label="最多供应商数" />
            <el-table-column label="对比指标">
              <template #default>
                <el-tag size="small">不良率</el-tag>
                <el-tag size="small" type="success">效率</el-tag>
                <el-tag size="small" type="warning">成本指数</el-tag>
                <el-tag size="small" type="info">交付评分</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="物料-不良-供应商匹配">
        <div class="rule-content">
          <h4>物料-不良现象-供应商匹配规则</h4>
          <el-alert
            title="物料-不良现象-供应商匹配规则"
            type="warning"
            description="系统限制物料-不良现象-供应商必须按照以下规则进行匹配，后续的物料、不良现象和供应商选择只能从此表中选取，并遵循表中的匹配规则。"
            show-icon
            :closable="false"
            class="alert-info"
          />
          
          <h4 class="sub-title">结构件类</h4>
          <el-table :data="materialDefectStructure" border style="width: 100%">
            <el-table-column prop="material" label="物料" />
            <el-table-column label="异常">
              <template #default="scope">
                <div class="tag-group">
                  <el-tag size="small" v-for="(defect, index) in scope.row.defects" :key="index">
                    {{ defect }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="供应商">
              <template #default="scope">
                <div class="tag-group">
                  <el-tag size="small" type="success" v-for="(supplier, index) in scope.row.suppliers" :key="index">
                    {{ supplier }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
          </el-table>
          
          <h4 class="sub-title">光学类</h4>
          <el-table :data="materialDefectOptical" border style="width: 100%">
            <el-table-column prop="material" label="物料" />
            <el-table-column label="异常">
              <template #default="scope">
                <div class="tag-group">
                  <el-tag size="small" v-for="(defect, index) in scope.row.defects" :key="index">
                    {{ defect }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="供应商">
              <template #default="scope">
                <div class="tag-group">
                  <el-tag size="small" type="success" v-for="(supplier, index) in scope.row.suppliers" :key="index">
                    {{ supplier }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
          </el-table>
          
          <h4 class="sub-title">充电类</h4>
          <el-table :data="materialDefectCharging" border style="width: 100%">
            <el-table-column prop="material" label="物料" />
            <el-table-column label="异常">
              <template #default="scope">
                <div class="tag-group">
                  <el-tag size="small" v-for="(defect, index) in scope.row.defects" :key="index">
                    {{ defect }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="供应商">
              <template #default="scope">
                <div class="tag-group">
                  <el-tag size="small" type="success" v-for="(supplier, index) in scope.row.suppliers" :key="index">
                    {{ supplier }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
          </el-table>
          
          <h4 class="sub-title">声学类</h4>
          <el-table :data="materialDefectAudio" border style="width: 100%">
            <el-table-column prop="material" label="物料" />
            <el-table-column label="异常">
              <template #default="scope">
                <div class="tag-group">
                  <el-tag size="small" v-for="(defect, index) in scope.row.defects" :key="index">
                    {{ defect }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="供应商">
              <template #default="scope">
                <div class="tag-group">
                  <el-tag size="small" type="success" v-for="(supplier, index) in scope.row.suppliers" :key="index">
                    {{ supplier }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
          </el-table>
          
          <h4 class="sub-title">包装类</h4>
          <el-table :data="materialDefectPackaging" border style="width: 100%">
            <el-table-column prop="material" label="物料" />
            <el-table-column label="异常">
              <template #default="scope">
                <div class="tag-group">
                  <el-tag size="small" v-for="(defect, index) in scope.row.defects" :key="index">
                    {{ defect }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="供应商">
              <template #default="scope">
                <div class="tag-group">
                  <el-tag size="small" type="success" v-for="(supplier, index) in scope.row.suppliers" :key="index">
                    {{ supplier }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="项目-基线规则">
        <div class="rule-content">
          <h4>项目-基线绑定规则</h4>
          <el-alert
            title="项目-基线绑定规则"
            type="warning"
            description="系统限制项目-基线必须按照以下规则进行匹配，同一项目在不同记录中必须使用相同的基线ID。"
            show-icon
            :closable="false"
            class="alert-info"
          />
          
          <h4 class="sub-title">项目-基线绑定表</h4>
          <el-table :data="projectBaselineMapping" border style="width: 100%">
            <el-table-column prop="projectId" label="项目ID" />
            <el-table-column prop="baselineId" label="对应的基线ID" />
          </el-table>
          
          <div class="warning-section">
            <el-tag type="danger">禁止出现：</el-tag>
            <p>同项目在不同记录中出现不同基线ID</p>
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="批次历史规则">
        <div class="rule-content">
          <h4>批次历史记录规则</h4>
          <el-alert
            title="批次历史记录"
            type="info"
            description="系统为每个物料批次维护完整的历史记录，记录了物料从入库到上线的全过程。"
            show-icon
            :closable="false"
            class="alert-info"
          />
          
          <h4 class="sub-title">历史记录类型</h4>
          <div class="history-types">
            <div class="history-group">
              <h5>库存页面记录类型</h5>
              <div class="tag-group">
                <el-tag v-for="(type, index) in historyTypes.inventory" :key="index">
                  {{ type }}
                </el-tag>
              </div>
            </div>
            
            <div class="history-group">
              <h5>测试页面记录类型</h5>
              <div class="tag-group">
                <el-tag type="success" v-for="(type, index) in historyTypes.lab" :key="index">
                  {{ type }}
                </el-tag>
              </div>
            </div>
            
            <div class="history-group">
              <h5>上线页面记录类型</h5>
              <div class="tag-group">
                <el-tag type="warning" v-for="(type, index) in historyTypes.factory" :key="index">
                  {{ type }}
                </el-tag>
              </div>
            </div>
          </div>
          
          <h4 class="sub-title">历史记录保留策略</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="最大记录数">
              <el-tag type="info">50条</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="最长保留时间">
              <el-tag type="info">90天</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="清理策略">
              <el-tag>优先删除最旧的记录</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="记录字段">
              <div class="tag-group">
                <el-tag size="small">时间戳</el-tag>
                <el-tag size="small">操作类型</el-tag>
                <el-tag size="small">操作人</el-tag>
                <el-tag size="small">详细信息</el-tag>
                <el-tag size="small">位置</el-tag>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';

export default {
  name: 'DataRulesDisplay',
  setup() {
    // 时间关联规则
    const timeRules = [
      { name: '库存到测试平均天数', value: '5天', description: '物料从入库到送检的平均时间' },
      { name: '测试到上线平均天数', value: '3天', description: '物料从测试完成到上线的平均时间' },
      { name: '库存直接到上线平均天数', value: '7天', description: '物料从入库直接到上线(未测试)的平均时间' },
      { name: '时间波动范围', value: '±2天', description: '实际时间与平均时间的波动范围' }
    ];
    
    // 状态转换规则
    const statusTransitionRules = [
      { name: '高风险物料测试不合格率', value: '25%', description: '高风险物料在测试中被判定为不合格的概率' },
      { name: '中风险物料测试不合格率', value: '12%', description: '中风险物料在测试中被判定为不合格的概率' },
      { name: '低风险物料测试不合格率', value: '5%', description: '低风险物料在测试中被判定为不合格的概率' },
      { name: '测试合格物料上线后异常率', value: '8%', description: '测试合格的物料在上线后出现异常的概率' },
      { name: '未测试物料上线后异常率', value: '15%', description: '未经测试直接上线的物料出现异常的概率' }
    ];
    
    // 优质供应商
    const preferredSuppliers = [
      '京东方BOE', '舜宇光学', '立讯精密', '歌尔股份', '蓝思科技'
    ];
    
    // 质量较差的供应商
    const poorSuppliers = [
      '信邦', '崇达', '台半'
    ];
    
    // 关键对比物料
    const keyComparisonMaterials = [
      { name: 'PCB主板', minSuppliers: 2, maxSuppliers: 4 },
      { name: '液晶显示屏', minSuppliers: 2, maxSuppliers: 4 },
      { name: 'LED灯珠', minSuppliers: 2, maxSuppliers: 3 },
      { name: '电阻', minSuppliers: 2, maxSuppliers: 4 },
      { name: '电容', minSuppliers: 2, maxSuppliers: 4 },
      { name: '锂电池', minSuppliers: 2, maxSuppliers: 3 },
      { name: '散热器', minSuppliers: 2, maxSuppliers: 3 },
      { name: '电源模块', minSuppliers: 2, maxSuppliers: 3 },
      { name: '传感器', minSuppliers: 2, maxSuppliers: 4 }
    ];
    
    // 历史记录类型
    const historyTypes = {
      inventory: ['入库', '出库', '调拨', '盘点', '冻结', '解冻', '状态变更', '质量问题', '返工', '退货'],
      lab: ['送检', '检验开始', '检验完成', '合格', '不合格', '有条件接收', '返工', '特采', '报废'],
      factory: ['上线', '生产', '完工', '异常', '停线', '返修', '报废', '入库']
    };
    
    // 物料-不良现象-供应商匹配数据
    const materialDefectStructure = [
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
    ];
    
    const materialDefectOptical = [
      { 
        material: 'LCD显示屏', 
        defects: ['漏光', '暗点', '亮点', '偏色'],
        suppliers: ['帝晶', '天马', 'BOE']
      },
      { 
        material: 'OLED显示屏', 
        defects: ['闪屏', 'mura', '亮点', '亮线'],
        suppliers: ['BOE', '天马', '华星']
      },
      { 
        material: '摄像头(CAM)', 
        defects: ['刮花', '底座破裂', '脏污', '无法拍照'],
        suppliers: ['盛泰', '天实', '深奥']
      }
    ];
    
    const materialDefectCharging = [
      { 
        material: '电池', 
        defects: ['起鼓', '松动', '漏液', '电压不稳定'],
        suppliers: ['百特达', '奥海', '辰阳']
      },
      { 
        material: '充电器', 
        defects: ['无法充电', '外壳破裂', '输出功率异常', '发热异常'],
        suppliers: ['理德', '风华', '维科']
      }
    ];
    
    const materialDefectAudio = [
      { 
        material: '喇叭', 
        defects: ['无声', '杂音', '音量小', '破裂'],
        suppliers: ['东声', '鑫声', '歌尔']
      },
      { 
        material: '听筒', 
        defects: ['无声', '杂音', '音量小', '破裂'],
        suppliers: ['东声', '鑫声', '歌尔']
      }
    ];
    
    const materialDefectPackaging = [
      { 
        material: '保护套', 
        defects: ['尺寸偏差', '发黄', '开孔错位', '模具压痕'],
        suppliers: ['丽德宝', '柏同', '富群']
      },
      { 
        material: '标签', 
        defects: ['脱落', '错印', 'logo错误', '尺寸异常'],
        suppliers: ['丽德宝', '柏同', '富群']
      },
      { 
        material: '包装盒', 
        defects: ['破损', 'logo错误', '错印'],
        suppliers: ['丽德宝', '柏同', '富群']
      }
    ];
    
    // 项目-基线映射数据
    const projectBaselineMapping = [
      { projectId: 'X6827', baselineId: 'I6789' },
      { projectId: 'S665LN', baselineId: 'I6789' },
      { projectId: 'KI4K', baselineId: 'I6789' },
      { projectId: 'X6828', baselineId: 'I6789' },
      { projectId: 'X6831', baselineId: 'I6788' },
      { projectId: 'KI5K', baselineId: 'I6788' },
      { projectId: 'S662LN', baselineId: 'I6787' },
      { projectId: 'S663LN', baselineId: 'I6787' },
      { projectId: 'S664LN', baselineId: 'I6787' }
    ];
    
    return {
      timeRules,
      statusTransitionRules,
      preferredSuppliers,
      poorSuppliers,
      keyComparisonMaterials,
      historyTypes,
      materialDefectStructure,
      materialDefectOptical,
      materialDefectCharging,
      materialDefectAudio,
      materialDefectPackaging,
      projectBaselineMapping
    };
  }
};
</script>

<style scoped>
.data-rules-display {
  margin: 20px 0;
}

.rule-tabs {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
}

.rule-content {
  padding: 15px;
}

.rule-content h4 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.sub-title {
  margin-top: 25px;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  border-left: 3px solid #409EFF;
  padding-left: 10px;
}

.progress-item {
  margin-top: 15px;
  margin-bottom: 15px;
}

.status-mapping {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  margin-top: 15px;
}

.mapping-group {
  flex: 1;
  min-width: 300px;
  border: 1px solid #EBEEF5;
  border-radius: 4px;
  padding: 15px;
  background-color: #F8F8F8;
}

.mapping-group h5 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.mapping-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.status-from {
  min-width: 80px;
}

.arrow {
  margin: 0 15px;
  color: #909399;
  font-weight: bold;
}

.status-to {
  display: flex;
  gap: 5px;
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.alert-info {
  margin: 15px 0;
}

.history-types {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 15px;
}

.history-group {
  border: 1px solid #EBEEF5;
  border-radius: 4px;
  padding: 15px;
  background-color: #F8F8F8;
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