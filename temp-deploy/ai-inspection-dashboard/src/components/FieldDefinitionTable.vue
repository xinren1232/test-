<template>
  <div class="field-definition-table">
    <el-table :data="fields" border stripe style="width: 100%">
      <el-table-column prop="name" label="字段名称" width="180" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="type" label="类型" width="120" />
      <el-table-column prop="validation" label="验证规则" width="200" />
      <el-table-column prop="sample" label="示例值" width="150" />
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'FieldDefinitionTable',
  props: {
    fields: {
      type: Array,
      required: true,
      default: () => []
    }
  }
};
</script>

<style scoped>
.field-definition-table {
  margin-bottom: 20px;
}
</style> 