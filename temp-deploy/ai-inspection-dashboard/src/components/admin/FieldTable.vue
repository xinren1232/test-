<template>
  <div class="field-table">
    <el-card class="table-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h3>{{ getModuleName() }} 字段定义</h3>
          <div class="header-actions">
            <el-button size="small" @click="exportFields">
              <el-icon><Download /></el-icon>导出
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 字段表格 -->
      <el-table :data="fields" style="width: 100%" border stripe>
        <el-table-column prop="id" label="字段ID" width="120" />
        <el-table-column prop="name" label="字段名称" width="120" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag>{{ getFieldTypeName(scope.row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column label="验证规则" width="150">
          <template #default="scope">
            <div v-if="scope.row.validation && scope.row.validation.pattern">
              <el-tooltip :content="scope.row.validation.message || '验证规则'" placement="top">
                <el-tag type="warning" size="small">{{ scope.row.validation.pattern }}</el-tag>
              </el-tooltip>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="关联关系" width="150">
          <template #default="scope">
            <div v-if="scope.row.relation && scope.row.relation.module">
              <el-tooltip :content="`关联到${getModuleDisplayName(scope.row.relation.module)}的${scope.row.relation.field}字段`" placement="top">
                <el-tag type="info" size="small">{{ getRelationTypeName(scope.row.relation.type) }}</el-tag>
              </el-tooltip>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.required" type="success" size="small" style="margin-right: 5px">必填</el-tag>
            <el-tag v-if="scope.row.unique" type="warning" size="small">唯一</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="示例值" width="120">
          <template #default="scope">
            <span>{{ scope.row.sample || '-' }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { Download } from '@element-plus/icons-vue';

// 组件属性
const props = defineProps({
  fields: {
    type: Array,
    required: true
  },
  moduleName: {
    type: String,
    required: true,
    validator: (value) => ['inventory', 'lab', 'online', 'baseline'].includes(value)
  }
});

// 获取模块名称
function getModuleName() {
  const moduleMap = {
    'inventory': '库存物料',
    'lab': '实验室测试',
    'online': '上线使用',
    'baseline': '基线设计'
  };
  return moduleMap[props.moduleName] || '未知模块';
}

// 获取模块显示名称
function getModuleDisplayName(moduleId) {
  const moduleMap = {
    'inventory': '库存物料',
    'lab': '实验室测试',
    'online': '上线使用',
    'baseline': '基线设计'
  };
  return moduleMap[moduleId] || moduleId;
}

// 获取字段类型名称
function getFieldTypeName(type) {
  const types = {
    string: '文本',
    number: '数字',
    date: '日期',
    boolean: '布尔值',
    object: '对象',
    array: '数组',
    enum: '枚举',
    specification: '规格'
  };
  return types[type] || type;
}

// 获取关系类型名称
function getRelationTypeName(type) {
  const types = {
    oneToOne: '一对一',
    oneToMany: '一对多',
    manyToOne: '多对一',
    manyToMany: '多对多'
  };
  return types[type] || type;
}

// 导出字段定义
function exportFields() {
  try {
    // 创建导出数据
    const exportData = props.fields.map(field => ({
      字段ID: field.id,
      字段名称: field.name,
      类型: getFieldTypeName(field.type),
      描述: field.description,
      必填: field.required ? '是' : '否',
      唯一: field.unique ? '是' : '否',
      示例值: field.sample || '',
      验证规则: field.validation && field.validation.pattern ? field.validation.pattern : '',
      验证提示: field.validation && field.validation.message ? field.validation.message : '',
      关联模块: field.relation && field.relation.module ? getModuleDisplayName(field.relation.module) : '',
      关联字段: field.relation && field.relation.field ? field.relation.field : '',
      关联类型: field.relation && field.relation.type ? getRelationTypeName(field.relation.type) : ''
    }));
    
    // 转换为CSV
    const headers = Object.keys(exportData[0]);
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
    ].join('\n');
    
    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${props.moduleName}_fields.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    ElMessage.success('字段定义已导出');
  } catch (error) {
    console.error('导出字段定义失败:', error);
    ElMessage.error('导出字段定义失败');
  }
}
</script>

<style scoped>
.field-table {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
}

.header-actions {
  display: flex;
  gap: 10px;
}
</style> 