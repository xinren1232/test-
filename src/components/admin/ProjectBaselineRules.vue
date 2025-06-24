<template>
  <div class="project-baseline-rules">
    <p class="section-description">
      本页面定义了项目与基线之间的关系规则，包括命名规范和关联关系。这些规则对于数据生成和系统功能至关重要。
    </p>
    
    <el-alert
      title="项目和基线规则"
      type="info"
      description="规定了项目和基线的命名格式以及它们之间的绑定关系"
      :closable="false"
      show-icon
      style="margin-bottom: 20px;"
    />
    
    <el-divider content-position="left">命名规则</el-divider>
    
    <el-row :gutter="20" class="rule-categories">
      <el-col :span="12">
        <el-card shadow="hover">
          <h3>基线ID格式</h3>
          <p>I加4位数字，例如：I6789</p>
          <div class="examples">
            <el-tag size="small" type="success" style="margin-right: 5px;">I1234</el-tag>
            <el-tag size="small" type="success" style="margin-right: 5px;">I5678</el-tag>
            <el-tag size="small" type="success">I9012</el-tag>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <h3>项目ID格式</h3>
          <p>X加4位数字，例如：X6827</p>
          <div class="examples">
            <el-tag size="small" type="success" style="margin-right: 5px;">X1234</el-tag>
            <el-tag size="small" type="success" style="margin-right: 5px;">X5678</el-tag>
            <el-tag size="small" type="success">X9012</el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-divider content-position="left">关联规则</el-divider>
    
    <el-descriptions title="项目与基线关联规则" :column="1" border>
      <el-descriptions-item label="基线-项目关系">
        每个基线可以关联5-6个项目，一个项目只能关联一个基线
      </el-descriptions-item>
      <el-descriptions-item label="命名关联">
        项目名称应当包含项目ID作为标识，基线名称应包含基线ID
      </el-descriptions-item>
      <el-descriptions-item label="数据传递">
        项目相关的实验室测试和上线使用数据必须包含关联的基线信息
      </el-descriptions-item>
    </el-descriptions>
    
    <el-divider content-position="left">关系图示</el-divider>
    
    <div class="diagram-container">
      <div class="mermaid-diagram">
        <pre class="mermaid">
          erDiagram
            BASELINE ||--o{ PROJECT : "包含"
            BASELINE {
              string baseline_id "I加4位数字"
              string baseline_name "基线名称"
            }
            PROJECT {
              string project_id "X加4位数字"
              string project_name "项目名称"
              string baseline_id "关联的基线ID"
            }
            PROJECT ||--o{ LAB_TEST : "关联"
            PROJECT ||--o{ ONLINE_USAGE : "关联"
            LAB_TEST {
              string id "测试ID"
              string project_id "关联的项目ID"
              string project_name "关联的项目名称"
            }
            ONLINE_USAGE {
              string id "使用记录ID"
              string project_id "关联的项目ID"
              string project_name "关联的项目名称"
            }
        </pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

// 初始化Mermaid图表
function initMermaid() {
  if (window.mermaid) {
    window.mermaid.init(undefined, document.querySelectorAll('.mermaid'));
  } else {
    // 如果mermaid未加载，则动态加载
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@11.6.0/dist/mermaid.min.js';
    script.onload = () => {
      if (window.mermaid) {
        window.mermaid.initialize({
          startOnLoad: true,
          theme: 'default',
          securityLevel: 'loose'
        });
        window.mermaid.init(undefined, document.querySelectorAll('.mermaid'));
      }
    };
    document.head.appendChild(script);
  }
}

// 组件挂载后初始化图表
onMounted(() => {
  initMermaid();
});
</script>

<style scoped>
.project-baseline-rules {
  margin-bottom: 24px;
}

.section-description {
  margin-bottom: 20px;
  color: var(--el-text-color-secondary);
  line-height: 1.6;
}

.rule-categories {
  margin: 24px 0;
}

.rule-categories h3 {
  font-size: 16px;
  margin-top: 0;
  margin-bottom: 10px;
}

.examples {
  margin-top: 10px;
}

.diagram-container {
  margin: 20px 0;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.mermaid-diagram {
  display: flex;
  justify-content: center;
  overflow: auto;
}
</style>
