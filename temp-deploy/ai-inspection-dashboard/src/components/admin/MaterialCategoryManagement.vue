<template>
  <div class="material-category-management">
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <h3>
            <el-icon><Grid /></el-icon>
            物料大类别管理系统
          </h3>
          <el-button type="primary" @click="refreshData">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </div>
      </template>
      
      <div class="category-overview">
        <el-row :gutter="20">
          <el-col :span="4" v-for="category in categoryStats" :key="category.code">
            <el-card class="category-card" :class="getCategoryClass(category.code)">
              <div class="category-info">
                <div class="category-icon">
                  <el-icon><Box /></el-icon>
                </div>
                <div class="category-details">
                  <h4>{{ category.name }}</h4>
                  <p>{{ category.materialCount }}种物料</p>
                  <p>{{ category.supplierCount }}个供应商</p>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 物料大类别详情 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <h4>
              <el-icon><List /></el-icon>
              物料大类别详情
            </h4>
          </template>
          
          <el-table :data="categories" style="width: 100%" v-loading="loading.categories">
            <el-table-column prop="category_name" label="大类别名称" width="120">
              <template #default="{ row }">
                <el-tag :type="getCategoryTagType(row.category_code)" size="small">
                  {{ row.category_name }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" show-overflow-tooltip />
            <el-table-column prop="priority" label="优先级" width="80" />
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button 
                  type="text" 
                  size="small" 
                  @click="viewCategoryDetails(row)"
                >
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 物料子类别 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <h4>
              <el-icon><Menu /></el-icon>
              物料子类别
            </h4>
          </template>
          
          <el-table :data="subcategories" style="width: 100%" v-loading="loading.subcategories">
            <el-table-column prop="material_name" label="物料名称" width="120" />
            <el-table-column prop="category_code" label="所属大类" width="100">
              <template #default="{ row }">
                <el-tag :type="getCategoryTagType(row.category_code)" size="small">
                  {{ getCategoryName(row.category_code) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="常见不良" show-overflow-tooltip>
              <template #default="{ row }">
                <el-tag 
                  v-for="defect in getDefects(row.common_defects)" 
                  :key="defect"
                  size="small"
                  style="margin-right: 5px; margin-bottom: 2px;"
                  type="warning"
                >
                  {{ defect }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 供应商-大类别关联 -->
      <el-col :span="24">
        <el-card>
          <template #header>
            <h4>
              <el-icon><Connection /></el-icon>
              供应商-大类别关联关系
            </h4>
          </template>
          
          <el-table :data="supplierMappings" style="width: 100%" v-loading="loading.mappings">
            <el-table-column prop="supplier_name" label="供应商" width="120" />
            <el-table-column prop="category_code" label="专业大类" width="120">
              <template #default="{ row }">
                <el-tag :type="getCategoryTagType(row.category_code)" size="small">
                  {{ getCategoryName(row.category_code) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="is_primary" label="主要供应商" width="100">
              <template #default="{ row }">
                <el-tag :type="row.is_primary ? 'success' : 'info'" size="small">
                  {{ row.is_primary ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="quality_score" label="质量评分" width="100">
              <template #default="{ row }">
                <el-rate 
                  v-model="row.quality_score" 
                  :max="5" 
                  :allow-half="true"
                  disabled
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column label="相关物料" show-overflow-tooltip>
              <template #default="{ row }">
                <span>{{ getRelatedMaterials(row.category_code) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
                  {{ row.status === 'active' ? '活跃' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详情对话框 -->
    <el-dialog 
      v-model="detailDialogVisible" 
      :title="`${selectedCategory?.category_name} 详细信息`"
      width="60%"
    >
      <div v-if="selectedCategory">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="大类别代码">
            {{ selectedCategory.category_code }}
          </el-descriptions-item>
          <el-descriptions-item label="大类别名称">
            {{ selectedCategory.category_name }}
          </el-descriptions-item>
          <el-descriptions-item label="优先级">
            {{ selectedCategory.priority }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="selectedCategory.status === 'active' ? 'success' : 'danger'">
              {{ selectedCategory.status === 'active' ? '活跃' : '停用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">
            {{ selectedCategory.description }}
          </el-descriptions-item>
        </el-descriptions>

        <h4 style="margin-top: 20px;">包含的物料:</h4>
        <el-table :data="getCategoryMaterials(selectedCategory.category_code)" style="width: 100%">
          <el-table-column prop="material_name" label="物料名称" />
          <el-table-column label="常见不良">
            <template #default="{ row }">
              <el-tag 
                v-for="defect in getDefects(row.common_defects)" 
                :key="defect"
                size="small"
                style="margin-right: 5px;"
                type="warning"
              >
                {{ defect }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Grid, Refresh, Box, List, Menu, Connection } from '@element-plus/icons-vue';

// 响应式数据
const loading = reactive({
  categories: false,
  subcategories: false,
  mappings: false
});

const categories = ref([]);
const subcategories = ref([]);
const supplierMappings = ref([]);
const detailDialogVisible = ref(false);
const selectedCategory = ref(null);

// 计算属性
const categoryStats = computed(() => {
  const stats = {};
  
  // 统计每个大类别的物料数量
  subcategories.value.forEach(sub => {
    if (!stats[sub.category_code]) {
      stats[sub.category_code] = {
        code: sub.category_code,
        name: getCategoryName(sub.category_code),
        materialCount: 0,
        supplierCount: 0
      };
    }
    stats[sub.category_code].materialCount++;
  });
  
  // 统计每个大类别的供应商数量
  supplierMappings.value.forEach(mapping => {
    if (stats[mapping.category_code]) {
      stats[mapping.category_code].supplierCount++;
    }
  });
  
  return Object.values(stats);
});

// 方法
const getCategoryName = (categoryCode) => {
  const category = categories.value.find(c => c.category_code === categoryCode);
  return category ? category.category_name : categoryCode;
};

const getCategoryTagType = (categoryCode) => {
  const typeMap = {
    '结构件类': 'primary',
    '光学类': 'success',
    '充电类': 'warning',
    '声学类': 'info',
    '包材类': 'danger'
  };
  return typeMap[categoryCode] || 'default';
};

const getCategoryClass = (categoryCode) => {
  return `category-${categoryCode.replace('类', '')}`;
};

const getDefects = (defectsJson) => {
  try {
    return JSON.parse(defectsJson || '[]').slice(0, 3); // 只显示前3个
  } catch {
    return [];
  }
};

const getRelatedMaterials = (categoryCode) => {
  const materials = subcategories.value
    .filter(sub => sub.category_code === categoryCode)
    .map(sub => sub.material_name);
  return materials.join(', ');
};

const getCategoryMaterials = (categoryCode) => {
  return subcategories.value.filter(sub => sub.category_code === categoryCode);
};

const viewCategoryDetails = (category) => {
  selectedCategory.value = category;
  detailDialogVisible.value = true;
};

const loadCategories = async () => {
  loading.categories = true;
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500));
    categories.value = [
      { category_code: '结构件类', category_name: '结构件类', description: '手机结构相关的物理组件', priority: 1, status: 'active' },
      { category_code: '光学类', category_name: '光学类', description: '显示和摄像相关的光学组件', priority: 2, status: 'active' },
      { category_code: '充电类', category_name: '充电类', description: '电源和充电相关组件', priority: 3, status: 'active' },
      { category_code: '声学类', category_name: '声学类', description: '音频相关组件', priority: 4, status: 'active' },
      { category_code: '包材类', category_name: '包材类', description: '包装和保护相关材料', priority: 5, status: 'active' }
    ];
  } catch (error) {
    ElMessage.error('加载大类别失败');
  } finally {
    loading.categories = false;
  }
};

const loadSubcategories = async () => {
  loading.subcategories = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    subcategories.value = [
      { material_name: '电池盖', category_code: '结构件类', common_defects: '["划伤", "堵漆", "起翘"]' },
      { material_name: '中框', category_code: '结构件类', common_defects: '["变形", "破裂", "堵漆"]' },
      { material_name: 'LCD显示屏', category_code: '光学类', common_defects: '["漏光", "暗点", "亮屏"]' },
      { material_name: 'OLED显示屏', category_code: '光学类', common_defects: '["闪屏", "mura", "亮线"]' },
      { material_name: '电池', category_code: '充电类', common_defects: '["起鼓", "放电", "漏液"]' },
      { material_name: '充电器', category_code: '充电类', common_defects: '["无法充电", "外壳破裂"]' },
      { material_name: '喇叭', category_code: '声学类', common_defects: '["无声", "杂声", "音量小"]' },
      { material_name: '听筒', category_code: '声学类', common_defects: '["无声", "杂声", "音量小"]' },
      { material_name: '保护套', category_code: '包材类', common_defects: '["尺寸偏差", "发黄"]' },
      { material_name: '包装盒', category_code: '包材类', common_defects: '["破损", "logo错误"]' }
    ];
  } catch (error) {
    ElMessage.error('加载子类别失败');
  } finally {
    loading.subcategories = false;
  }
};

const loadSupplierMappings = async () => {
  loading.mappings = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    supplierMappings.value = [
      { supplier_name: '聚龙', category_code: '结构件类', is_primary: true, quality_score: 4.2, status: 'active' },
      { supplier_name: '欣冠', category_code: '结构件类', is_primary: false, quality_score: 3.8, status: 'active' },
      { supplier_name: '天马', category_code: '光学类', is_primary: true, quality_score: 4.5, status: 'active' },
      { supplier_name: 'BOE', category_code: '光学类', is_primary: true, quality_score: 4.3, status: 'active' },
      { supplier_name: '华星', category_code: '光学类', is_primary: false, quality_score: 4.0, status: 'active' },
      { supplier_name: '百佳达', category_code: '充电类', is_primary: true, quality_score: 4.1, status: 'active' },
      { supplier_name: '歌尔', category_code: '声学类', is_primary: true, quality_score: 4.6, status: 'active' },
      { supplier_name: '富群', category_code: '包材类', is_primary: true, quality_score: 3.9, status: 'active' }
    ];
  } catch (error) {
    ElMessage.error('加载供应商关联失败');
  } finally {
    loading.mappings = false;
  }
};

const refreshData = async () => {
  await Promise.all([
    loadCategories(),
    loadSubcategories(),
    loadSupplierMappings()
  ]);
  ElMessage.success('数据刷新成功');
};

// 组件挂载时加载数据
onMounted(() => {
  refreshData();
});
</script>

<style scoped>
.material-category-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-overview {
  margin-top: 20px;
}

.category-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.category-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.category-icon {
  font-size: 24px;
  color: #409EFF;
}

.category-details h4 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.category-details p {
  margin: 2px 0;
  font-size: 12px;
  color: #909399;
}

.category-结构件 { border-left: 4px solid #409EFF; }
.category-光学 { border-left: 4px solid #67C23A; }
.category-充电 { border-left: 4px solid #E6A23C; }
.category-声学 { border-left: 4px solid #909399; }
.category-包材 { border-left: 4px solid #F56C6C; }
</style>
