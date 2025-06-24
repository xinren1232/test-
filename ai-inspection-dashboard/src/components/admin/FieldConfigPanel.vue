<template>
  <div class="field-config-panel">
    <div class="panel-actions">
      <el-button size="small" @click="addField">
        <el-icon><Plus /></el-icon>添加字段
      </el-button>
    </div>
    
    <el-table :data="fields" style="width: 100%" border>
      <el-table-column prop="id" label="字段ID" width="120">
        <template #default="scope">
          <el-input v-model="scope.row.id" size="small" placeholder="字段ID" />
        </template>
      </el-table-column>
      
      <el-table-column prop="name" label="字段名称" width="120">
        <template #default="scope">
          <el-input v-model="scope.row.name" size="small" placeholder="字段名称" />
        </template>
      </el-table-column>
      
      <el-table-column prop="type" label="类型" width="120">
        <template #default="scope">
          <el-select v-model="scope.row.type" size="small" placeholder="类型">
            <el-option label="文本" value="string" />
            <el-option label="数字" value="number" />
            <el-option label="日期" value="date" />
            <el-option label="布尔值" value="boolean" />
            <el-option label="对象" value="object" />
            <el-option label="数组" value="array" />
            <el-option label="枚举" value="enum" />
          </el-select>
        </template>
      </el-table-column>
      
      <el-table-column prop="description" label="描述" min-width="200">
        <template #default="scope">
          <el-input v-model="scope.row.description" size="small" placeholder="字段描述" />
        </template>
      </el-table-column>
      
      <el-table-column label="必填" width="80">
        <template #default="scope">
          <el-checkbox v-model="scope.row.required" />
        </template>
      </el-table-column>
      
      <el-table-column label="唯一" width="80">
        <template #default="scope">
          <el-checkbox v-model="scope.row.unique" />
        </template>
      </el-table-column>
      
      <el-table-column label="操作" width="120">
        <template #default="scope">
          <el-button type="danger" size="small" @click="removeField(scope.$index)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { Plus, Delete } from '@element-plus/icons-vue';

const props = defineProps({
  fields: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['update:fields']);

// 添加字段
function addField() {
  const newFields = [...props.fields];
  newFields.push({
    id: '',
    name: '',
    type: 'string',
    description: '',
    required: false,
    unique: false
  });
  emit('update:fields', newFields);
}

// 删除字段
function removeField(index) {
  const newFields = [...props.fields];
  newFields.splice(index, 1);
  emit('update:fields', newFields);
}
</script>

<style scoped>
.field-config-panel {
  padding: 10px 0;
}

.panel-actions {
  margin-bottom: 10px;
  text-align: right;
}
</style> 