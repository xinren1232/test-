<template>
  <div class="data-requirements-sync">
    <el-card class="sync-card">
      <template #header>
        <div class="card-header">
          <h3>数据需求同步工具</h3>
          <div class="header-actions">
            <el-button type="primary" @click="syncAllFields">
              <el-icon><Refresh /></el-icon>同步所有字段
            </el-button>
          </div>
        </div>
      </template>
      
      <el-alert
        title="数据需求同步"
        type="info"
        description="此工具可以从系统中的实际数据结构自动生成字段定义，确保字段定义与实际使用的数据结构保持一致。"
        show-icon
        style="margin-bottom: 20px;"
        :closable="false"
      />
      
      <el-tabs v-model="activeTab">
        <el-tab-pane label="同步设置" name="settings">
          <el-form label-position="top">
            <el-form-item label="同步选项">
              <el-checkbox v-model="syncOptions.overwriteExisting" label="覆盖现有字段定义" />
              <el-checkbox v-model="syncOptions.includeRelations" label="包含字段关系" />
              <el-checkbox v-model="syncOptions.enforceProjectBaselineFormat" label="强制项目和基线ID格式" />
            </el-form-item>
            
            <el-form-item label="要同步的模块">
              <el-checkbox-group v-model="syncOptions.modules">
                <el-checkbox label="inventory">库存物料</el-checkbox>
                <el-checkbox label="lab">实验室测试</el-checkbox>
                <el-checkbox label="online">上线使用</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-form>
          
          <el-divider content-position="left">项目-基线关系设置</el-divider>
          
          <el-form label-position="top">
            <el-form-item label="项目ID格式">
              <el-input v-model="syncOptions.projectIdPattern" placeholder="例如：^X\d{4}$" />
              <div class="form-help">项目ID格式为X加4位数字，如X6827</div>
            </el-form-item>
            
            <el-form-item label="基线ID格式">
              <el-input v-model="syncOptions.baselineIdPattern" placeholder="例如：^I\d{4}$" />
              <div class="form-help">基线ID格式为I加4位数字，如I6789</div>
            </el-form-item>
            
            <el-form-item label="每个基线关联的项目数量">
              <el-input-number v-model="syncOptions.projectsPerBaseline" :min="1" :max="10" />
              <div class="form-help">每个基线应关联5-6个项目</div>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="同步结果" name="results">
          <div v-if="syncResults.length === 0" class="no-results">
            <el-empty description="尚未执行同步操作" />
          </div>
          
          <div v-else class="sync-results">
            <el-timeline>
              <el-timeline-item
                v-for="(result, index) in syncResults"
                :key="index"
                :timestamp="result.timestamp"
                :type="result.status === 'success' ? 'success' : result.status === 'warning' ? 'warning' : 'danger'"
              >
                <h4>{{ result.title }}</h4>
                <p>{{ result.message }}</p>
                <div v-if="result.details" class="result-details">
                  <el-collapse>
                    <el-collapse-item title="详细信息">
                      <pre>{{ JSON.stringify(result.details, null, 2) }}</pre>
                    </el-collapse-item>
                  </el-collapse>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';
import unifiedDataService from '../../services/UnifiedDataService.js';
import projectBaselineService from '../../services/ProjectBaselineService.js';

// 当前激活的标签页
const activeTab = ref('settings');

// 同步选项
const syncOptions = reactive({
  overwriteExisting: true,
  includeRelations: true,
  enforceProjectBaselineFormat: true,
  modules: ['inventory', 'lab', 'online'],
  projectIdPattern: '^X\\d{4}$',
  baselineIdPattern: '^I\\d{4}$',
  projectsPerBaseline: 5
});

// 同步结果
const syncResults = ref([]);

// 同步所有字段
async function syncAllFields() {
  try {
    // 确认对话框
    await ElMessageBox.confirm(
      '此操作将根据实际数据重新生成字段定义，可能会覆盖现有定义。确定要继续吗？',
      '同步确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    // 记录开始同步
    syncResults.value.unshift({
      title: '开始同步字段定义',
      message: `同步模块: ${syncOptions.modules.join(', ')}`,
      timestamp: new Date().toLocaleString(),
      status: 'info'
    });
    
    // 切换到结果标签页
    activeTab.value = 'results';
    
    // 获取实际数据
    const inventoryData = syncOptions.modules.includes('inventory') ? unifiedDataService.getInventoryData() : [];
    const labData = syncOptions.modules.includes('lab') ? unifiedDataService.getLabData() : [];
    const onlineData = syncOptions.modules.includes('online') ? unifiedDataService.getFactoryData() : [];
    
    // 提取字段定义
    const inventoryFields = extractFields(inventoryData, 'inventory');
    const labFields = extractFields(labData, 'lab');
    const onlineFields = extractFields(onlineData, 'online');
    
    // 添加项目和基线字段关系
    if (syncOptions.includeRelations) {
      addProjectBaselineRelations(inventoryFields, 'inventory');
      addProjectBaselineRelations(labFields, 'lab');
      addProjectBaselineRelations(onlineFields, 'online');
    }
    
    // 保存字段定义
    if (syncOptions.modules.includes('inventory')) {
      localStorage.setItem('inventory_fields', JSON.stringify(inventoryFields));
      syncResults.value.unshift({
        title: '库存物料字段同步完成',
        message: `共同步了 ${inventoryFields.length} 个字段`,
        timestamp: new Date().toLocaleString(),
        status: 'success',
        details: { fields: inventoryFields.map(f => f.id) }
      });
    }
    
    if (syncOptions.modules.includes('lab')) {
      localStorage.setItem('lab_fields', JSON.stringify(labFields));
      syncResults.value.unshift({
        title: '实验室测试字段同步完成',
        message: `共同步了 ${labFields.length} 个字段`,
        timestamp: new Date().toLocaleString(),
        status: 'success',
        details: { fields: labFields.map(f => f.id) }
      });
    }
    
    if (syncOptions.modules.includes('online')) {
      localStorage.setItem('online_fields', JSON.stringify(onlineFields));
      syncResults.value.unshift({
        title: '上线使用字段同步完成',
        message: `共同步了 ${onlineFields.length} 个字段`,
        timestamp: new Date().toLocaleString(),
        status: 'success',
        details: { fields: onlineFields.map(f => f.id) }
      });
    }
    
    ElMessage.success('字段定义同步完成');
  } catch (error) {
    if (error === 'cancel') return;
    
    console.error('同步字段定义失败:', error);
    
    syncResults.value.unshift({
      title: '同步失败',
      message: error.message || '未知错误',
      timestamp: new Date().toLocaleString(),
      status: 'error'
    });
    
    ElMessage.error('同步字段定义失败');
  }
}

// 从数据中提取字段定义
function extractFields(data, moduleName) {
  if (!data || data.length === 0) {
    syncResults.value.unshift({
      title: `${getModuleName(moduleName)}数据为空`,
      message: '无法从空数据中提取字段定义',
      timestamp: new Date().toLocaleString(),
      status: 'warning'
    });
    return [];
  }
  
  // 获取现有字段定义（如果有）
  let existingFields = [];
  try {
    const storedFields = localStorage.getItem(`${moduleName}_fields`);
    if (storedFields) {
      existingFields = JSON.parse(storedFields);
    }
  } catch (error) {
    console.error(`读取现有${moduleName}字段定义失败:`, error);
  }
  
  // 从第一条数据中提取字段
  const firstItem = data[0];
  const extractedFields = Object.keys(firstItem).map(key => {
    // 检查是否已存在该字段
    const existingField = existingFields.find(f => f.id === key);
    
    // 如果存在且不覆盖，则返回现有字段
    if (existingField && !syncOptions.overwriteExisting) {
      return existingField;
    }
    
    // 创建新字段定义
    const fieldType = getFieldType(firstItem[key]);
    
    // 判断字段是否必填
    const isRequired = isRequiredField(key, moduleName);
    
    // 判断字段是否唯一
    const isUnique = isUniqueField(key, moduleName);
    
    // 创建字段定义
    return {
      id: key,
      name: getFieldDisplayName(key),
      type: fieldType,
      required: isRequired,
      unique: isUnique,
      description: getFieldDescription(key, moduleName),
      sample: String(firstItem[key]),
      validation: getFieldValidation(key, moduleName)
    };
  });
  
  return extractedFields;
}

// 添加项目和基线字段关系
function addProjectBaselineRelations(fields, moduleName) {
  // 查找项目ID字段
  const projectIdField = fields.find(f => f.id === 'project_id');
  if (projectIdField) {
    projectIdField.relation = {
      module: 'baseline',
      field: 'baseline_id',
      type: 'manyToOne'
    };
    
    // 添加验证规则
    if (syncOptions.enforceProjectBaselineFormat) {
      projectIdField.validation = {
        pattern: syncOptions.projectIdPattern,
        message: '项目ID格式应为X加4位数字'
      };
    }
  }
  
  // 查找基线ID字段
  const baselineIdField = fields.find(f => f.id === 'baseline_id');
  if (baselineIdField) {
    // 添加验证规则
    if (syncOptions.enforceProjectBaselineFormat) {
      baselineIdField.validation = {
        pattern: syncOptions.baselineIdPattern,
        message: '基线ID格式应为I加4位数字'
      };
    }
  }
  
  // 查找批次号字段
  const batchNoField = fields.find(f => f.id === 'batchNo');
  if (batchNoField && moduleName !== 'inventory') {
    batchNoField.relation = {
      module: 'inventory',
      field: 'batchNo',
      type: 'manyToOne'
    };
  }
}

// 判断字段是否必填
function isRequiredField(fieldId, moduleName) {
  const requiredFieldsMap = {
    inventory: ['materialCode', 'materialName', 'batchNo', 'supplier', 'project_id', 'project_name', 'baseline_id', 'baseline_name'],
    lab: ['testId', 'batchNo', 'testDate', 'testItem', 'project_id', 'project_name', 'baseline_id', 'baseline_name'],
    online: ['onlineId', 'batchNo', 'factory', 'line', 'project_id', 'project_name', 'baseline_id', 'baseline_name'],
    baseline: ['baseline_id', 'baseline_name', 'baselineVersion']
  };
  
  return requiredFieldsMap[moduleName]?.includes(fieldId) || false;
}

// 判断字段是否唯一
function isUniqueField(fieldId, moduleName) {
  const uniqueFieldsMap = {
    inventory: ['materialCode', 'batchNo'],
    lab: ['testId'],
    online: ['onlineId'],
    baseline: ['baseline_id', 'baseline_name']
  };
  
  return uniqueFieldsMap[moduleName]?.includes(fieldId) || false;
}

// 获取字段验证规则
function getFieldValidation(fieldId, moduleName) {
  if (fieldId === 'project_id' && syncOptions.enforceProjectBaselineFormat) {
    return {
      pattern: syncOptions.projectIdPattern,
      message: '项目ID格式应为X加4位数字'
    };
  }
  
  if (fieldId === 'baseline_id' && syncOptions.enforceProjectBaselineFormat) {
    return {
      pattern: syncOptions.baselineIdPattern,
      message: '基线ID格式应为I加4位数字'
    };
  }
  
  return {};
}

// 获取字段类型
function getFieldType(value) {
  if (value === null || value === undefined) return 'string';
  
  const type = typeof value;
  
  if (type === 'number') return 'number';
  if (type === 'boolean') return 'boolean';
  if (type === 'object') {
    if (Array.isArray(value)) return 'array';
    if (value instanceof Date) return 'date';
    return 'object';
  }
  
  // 检查日期字符串
  if (type === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return 'date';
  }
  
  return 'string';
}

// 获取字段显示名称
function getFieldDisplayName(fieldId) {
  const nameMap = {
    // 库存字段
    materialCode: '物料编码',
    materialName: '物料名称',
    category: '物料类别',
    batchNo: '批次号',
    supplier: '供应商',
    quantity: '数量',
    unit: '单位',
    warehouse: '仓库',
    location: '库位',
    factory: '工厂',
    status: '状态',
    quality: '质量状态',
    arrivalDate: '入库日期',
    expiryDate: '到期日期',
    lastUpdated: '最后更新',
    
    // 实验室测试字段
    testId: '测试ID',
    testDate: '测试日期',
    testItem: '测试项目',
    testMethod: '测试方法',
    testStandard: '测试标准',
    testValue: '测试值',
    standardValue: '标准值',
    result: '测试结果',
    tester: '测试人员',
    batchId: '批次号',
    
    // 上线使用字段
    onlineId: '上线ID',
    line: '产线',
    useTime: '上线时间',
    yield: '良率',
    defectRate: '不良率',
    
    // 基线设计字段
    baselineId: '基线ID',
    baseline_id: '基线ID',
    baselineName: '基线名称',
    baseline_name: '基线名称',
    baselineVersion: '基线版本',
    project: '项目',
    designDate: '设计日期',
    
    // 项目字段
    project_id: '项目ID',
    project_name: '项目名称',
    project_display: '项目显示名称'
  };
  
  return nameMap[fieldId] || fieldId;
}

// 获取字段描述
function getFieldDescription(fieldId, moduleName) {
  const descriptionMap = {
    // 库存字段
    materialCode: '物料唯一编码',
    materialName: '物料名称描述',
    category: '物料所属分类',
    batchNo: '物料批次号',
    supplier: '物料供应商',
    quantity: '物料数量',
    unit: '计量单位',
    warehouse: '存放仓库',
    location: '仓库内的具体位置',
    factory: '所属工厂',
    status: '物料状态',
    quality: '物料质量状态',
    arrivalDate: '物料入库日期',
    expiryDate: '物料到期日期',
    lastUpdated: '最后更新时间',
    
    // 实验室测试字段
    testId: '测试记录唯一标识符',
    testDate: '测试执行日期',
    testItem: '测试项目名称',
    testMethod: '测试使用的方法',
    testStandard: '测试遵循的标准',
    testValue: '测试结果值',
    standardValue: '测试标准值或范围',
    result: '测试结果状态',
    tester: '执行测试的人员',
    batchId: '测试物料批次号',
    
    // 上线使用字段
    onlineId: '上线记录唯一标识符',
    line: '使用物料的产线',
    useTime: '物料上线使用的时间',
    yield: '物料使用良率',
    defectRate: '物料使用不良率',
    
    // 基线设计字段
    baselineId: '基线设计唯一标识符',
    baseline_id: '基线设计唯一标识符',
    baselineName: '基线设计名称',
    baseline_name: '基线设计名称',
    baselineVersion: '基线设计版本号',
    project: '基线所属项目',
    designDate: '基线设计日期',
    
    // 项目字段
    project_id: '项目唯一标识符，格式为X加4位数字',
    project_name: '项目名称',
    project_display: '项目显示名称，包含ID和名称'
  };
  
  return descriptionMap[fieldId] || `${getModuleName(moduleName)}模块的${fieldId}字段`;
}

// 获取模块名称
function getModuleName(moduleId) {
  const moduleMap = {
    'inventory': '库存物料',
    'lab': '实验室测试',
    'online': '上线使用',
    'baseline': '基线设计'
  };
  return moduleMap[moduleId] || moduleId;
}
</script>

<style scoped>
.data-requirements-sync {
  padding: 20px;
}

.sync-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
}

.form-help {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.no-results {
  padding: 40px 0;
  text-align: center;
}

.sync-results {
  margin-top: 20px;
}

.result-details {
  margin-top: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 10px;
}

.result-details pre {
  margin: 0;
  white-space: pre-wrap;
  font-size: 12px;
}
</style> 