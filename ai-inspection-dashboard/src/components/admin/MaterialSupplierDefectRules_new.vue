<template>
  <div class="material-supplier-defect-rules">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <h2>物料-不良-供应商匹配规则</h2>
          <el-button type="primary" size="small" @click="refreshData">刷新数据</el-button>
        </div>
      </template>

      <div class="card-content">
        <p class="description">
          本规则定义了不同供应商的物料可能出现的不良现象及其概率分布，用于指导测试数据和上线数据的不良现象生成。
        </p>

        <el-divider content-position="left">物料-不良-供应商匹配表</el-divider>
        
        <el-table :data="materialDefectSupplierData" border style="width: 100%; margin-bottom: 20px">
          <el-table-column prop="material" label="物料" width="120" />
          <el-table-column label="异常" width="280">
            <template #default="scope">
              <div class="defect-list">
                <el-tag v-for="(defect, index) in scope.row.defects" :key="index" size="small" type="danger" style="margin-right: 5px; margin-bottom: 5px;">
                  {{ defect }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="供应商" width="280">
            <template #default="scope">
              <div class="supplier-list">
                <el-tag v-for="(supplier, index) in scope.row.suppliers" :key="index" size="small" type="success" style="margin-right: 5px; margin-bottom: 5px;">
                  {{ supplier }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <el-divider content-position="left">物料-不良-供应商匹配关系图</el-divider>
        
        <div class="diagram-container">
          <div class="diagram-section">
            <h4>结构件类</h4>
            <div class="material-group">
              <div class="material-item">电池盖</div>
              <div class="material-item">主板</div>
              <div class="material-item">手机卡托</div>
              <div class="material-item">侧键</div>
              <div class="material-item">装饰件</div>
              <div class="arrow">→</div>
              <div class="defect-group">
                <div class="defect-item">划伤/掉漆/起鼓/超重/尺寸异常</div>
              </div>
              <div class="arrow">→</div>
              <div class="supplier-group">
                <div class="supplier-item">聚龙</div>
                <div class="supplier-item">欣冠</div>
                <div class="supplier-item">广正</div>
              </div>
            </div>
          </div>
          
          <div class="diagram-section">
            <h4>光学类</h4>
            <div class="material-group">
              <div class="material-item">LCD显示屏</div>
              <div class="arrow">→</div>
              <div class="defect-group">
                <div class="defect-item">漏光/暗点/亮点/偏色</div>
              </div>
              <div class="arrow">→</div>
              <div class="supplier-group">
                <div class="supplier-item">帝晶</div>
                <div class="supplier-item">天马</div>
                <div class="supplier-item">BOE</div>
              </div>
            </div>
            
            <div class="material-group">
              <div class="material-item">OLED显示屏</div>
              <div class="arrow">→</div>
              <div class="defect-group">
                <div class="defect-item">闪屏/mura/亮点/亮线</div>
              </div>
              <div class="arrow">→</div>
              <div class="supplier-group">
                <div class="supplier-item">BOE</div>
                <div class="supplier-item">天马</div>
                <div class="supplier-item">华星</div>
              </div>
            </div>
            
            <div class="material-group">
              <div class="material-item">摄像头(CAM)</div>
              <div class="arrow">→</div>
              <div class="defect-group">
                <div class="defect-item">刮花/底座破裂/脏污/无法拍照</div>
              </div>
              <div class="arrow">→</div>
              <div class="supplier-group">
                <div class="supplier-item">盛泰</div>
                <div class="supplier-item">天实</div>
                <div class="supplier-item">深奥</div>
              </div>
            </div>
          </div>
          
          <div class="diagram-section">
            <h4>充电类</h4>
            <div class="material-group">
              <div class="material-item">电池</div>
              <div class="arrow">→</div>
              <div class="defect-group">
                <div class="defect-item">起鼓/松动/漏液/电压不稳定</div>
              </div>
              <div class="arrow">→</div>
              <div class="supplier-group">
                <div class="supplier-item">百特达</div>
                <div class="supplier-item">奥海</div>
                <div class="supplier-item">辰阳</div>
              </div>
            </div>
            
            <div class="material-group">
              <div class="material-item">充电器</div>
              <div class="arrow">→</div>
              <div class="defect-group">
                <div class="defect-item">无法充电/外壳破裂/输出功率异常/发热异常</div>
              </div>
              <div class="arrow">→</div>
              <div class="supplier-group">
                <div class="supplier-item">理德</div>
                <div class="supplier-item">风华</div>
                <div class="supplier-item">维科</div>
              </div>
            </div>
          </div>
          
          <div class="diagram-section">
            <h4>声学类</h4>
            <div class="material-group">
              <div class="material-item">喇叭</div>
              <div class="material-item">听筒</div>
              <div class="arrow">→</div>
              <div class="defect-group">
                <div class="defect-item">无声/杂音/音量小/破裂</div>
              </div>
              <div class="arrow">→</div>
              <div class="supplier-group">
                <div class="supplier-item">东声</div>
                <div class="supplier-item">鑫声</div>
                <div class="supplier-item">歌尔</div>
              </div>
            </div>
          </div>
          
          <div class="diagram-section">
            <h4>包装类</h4>
            <div class="material-group">
              <div class="material-item">保护套</div>
              <div class="arrow">→</div>
              <div class="defect-group">
                <div class="defect-item">尺寸偏差/发黄/开孔错位/模具压痕</div>
              </div>
              <div class="arrow">→</div>
              <div class="supplier-group">
                <div class="supplier-item">丽德宝</div>
                <div class="supplier-item">柏同</div>
                <div class="supplier-item">富群</div>
              </div>
            </div>
            
            <div class="material-group">
              <div class="material-item">标签</div>
              <div class="arrow">→</div>
              <div class="defect-group">
                <div class="defect-item">脱落/错印/logo错误/尺寸异常</div>
              </div>
              <div class="arrow">→</div>
              <div class="supplier-group">
                <div class="supplier-item">丽德宝</div>
                <div class="supplier-item">柏同</div>
                <div class="supplier-item">富群</div>
              </div>
            </div>
            
            <div class="material-group">
              <div class="material-item">包装盒</div>
              <div class="arrow">→</div>
              <div class="defect-group">
                <div class="defect-item">破损/logo错误/错印</div>
              </div>
              <div class="arrow">→</div>
              <div class="supplier-group">
                <div class="supplier-item">丽德宝</div>
                <div class="supplier-item">柏同</div>
                <div class="supplier-item">富群</div>
              </div>
            </div>
          </div>
        </div>

        <el-divider content-position="left">规则应用说明</el-divider>

        <div class="rules-section">
          <h4>应用场景</h4>
          <ol>
            <li>测试数据生成：当物料测试结果为"不合格"时，根据物料类型和供应商选择对应的不良类型</li>
            <li>上线数据生成：当物料上线不良率>0.5%时，根据物料类型和供应商选择对应的不良类型</li>
            <li>供应商评估：根据不同供应商的不良现象分布，评估供应商质量水平</li>
          </ol>

          <h4>匹配规则说明</h4>
          <ul>
            <li>每种物料类型都有特定的不良现象集合</li>
            <li>每种物料类型都有特定的供应商集合</li>
            <li>系统生成不良数据时，必须严格遵循物料-不良-供应商的匹配关系</li>
            <li>不同类别的物料具有不同的不良现象特征</li>
          </ul>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 物料-不良-供应商匹配数据（根据图二）
const materialDefectSupplierData = ref([
  // 结构件类
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
  },
  
  // 光学类
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
  },
  
  // 充电类
  { 
    material: '电池', 
    defects: ['起鼓', '松动', '漏液', '电压不稳定'],
    suppliers: ['百特达', '奥海', '辰阳']
  },
  { 
    material: '充电器', 
    defects: ['无法充电', '外壳破裂', '输出功率异常', '发热异常'],
    suppliers: ['理德', '风华', '维科']
  },
  
  // 声学类
  { 
    material: '喇叭', 
    defects: ['无声', '杂音', '音量小', '破裂'],
    suppliers: ['东声', '鑫声', '歌尔']
  },
  { 
    material: '听筒', 
    defects: ['无声', '杂音', '音量小', '破裂'],
    suppliers: ['东声', '鑫声', '歌尔']
  },
  
  // 包装类
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
]);

// 刷新数据
function refreshData() {
  // 实际项目中可能需要从API获取最新规则数据
  console.log('刷新物料-不良-供应商匹配规则数据');
}
</script>

<style scoped>
.material-supplier-defect-rules {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.description {
  margin-bottom: 20px;
  color: #606266;
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.defect-list, .supplier-list {
  display: flex;
  flex-wrap: wrap;
}

.rules-section {
  margin: 20px 0;
}

.rules-section h4 {
  margin-top: 15px;
  margin-bottom: 10px;
  font-weight: 600;
}

.rules-section ul, .rules-section ol {
  padding-left: 20px;
  margin-bottom: 15px;
}

.rules-section li {
  margin-bottom: 5px;
}

.diagram-container {
  margin: 20px 0;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
}

.diagram-section {
  margin-bottom: 25px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 15px;
  background-color: #fff;
}

.diagram-section h4 {
  margin-top: 0;
  margin-bottom: 15px;
  font-weight: 600;
  color: #409EFF;
  border-left: 3px solid #409EFF;
  padding-left: 10px;
}

.material-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 15px;
}

.material-item {
  background-color: #ecf5ff;
  color: #409EFF;
  padding: 5px 10px;
  margin: 5px;
  border-radius: 4px;
  font-weight: 500;
}

.arrow {
  font-size: 20px;
  margin: 0 10px;
  color: #909399;
}

.defect-group {
  flex: 1;
  min-width: 200px;
}

.defect-item {
  background-color: #fef0f0;
  color: #f56c6c;
  padding: 5px 10px;
  margin: 5px;
  border-radius: 4px;
}

.supplier-group {
  display: flex;
  flex-wrap: wrap;
}

.supplier-item {
  background-color: #f0f9eb;
  color: #67c23a;
  padding: 5px 10px;
  margin: 5px;
  border-radius: 4px;
}
</style> 