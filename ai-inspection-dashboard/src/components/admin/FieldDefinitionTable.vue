<!--
  字段定义表格组件
  用于展示字段定义
-->
<template>
  <el-table :data="fields" stripe style="width: 100%">
    <el-table-column prop="fieldId" label="字段ID" width="180" />
    <el-table-column prop="description" label="描述" />
    <el-table-column prop="type" label="类型" width="100" />
    <el-table-column prop="validation" label="验证规则" />
    <el-table-column prop="sample" label="示例值" width="180" />
  </el-table>
</template>

<script setup>
defineProps({
  fields: {
    type: Array,
    required: true
  }
});
</script>

<style scoped>
/* 表格样式 */
</style> 