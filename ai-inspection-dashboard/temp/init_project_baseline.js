// 初始化项目基线关系的测试脚本

/**
 * 项目-基线映射数据
 * 定义项目与基线的绑定关系
 */

// 基线定义
const baselines = [
  {
    baseline_id: 'I6789',
    baseline_name: '基础电子元件基线',
    baseline_version: 'v1.0',
    design_date: '2023-01-15',
    design_owner: '张工',
    description: '电子元件通用测试基线',
    status: '活跃'
  },
  {
    baseline_id: 'I7890',
    baseline_name: '机械零件基线',
    baseline_version: 'v1.0',
    design_date: '2023-02-20',
    design_owner: '李工',
    description: '机械零件通用测试基线',
    status: '活跃'
  },
  {
    baseline_id: 'I8901',
    baseline_name: '塑料材料基线',
    baseline_version: 'v1.0',
    design_date: '2023-03-10',
    design_owner: '王工',
    description: '塑料材料通用测试基线',
    status: '活跃'
  },
  {
    baseline_id: 'I9012',
    baseline_name: '金属材料基线',
    baseline_version: 'v1.0',
    design_date: '2023-04-05',
    design_owner: '赵工',
    description: '金属材料通用测试基线',
    status: '活跃'
  },
  {
    baseline_id: 'I1234',
    baseline_name: '显示屏基线',
    baseline_version: 'v1.0',
    design_date: '2023-05-12',
    design_owner: '孙工',
    description: '显示屏通用测试基线',
    status: '活跃'
  }
];

// 项目定义
const projects = [
  {
    project_id: 'X6827',
    project_name: '智能手机电路项目',
    baseline_id: 'I6789', // 关联到电子元件基线
    creation_date: '2023-01-20',
    owner: '张工',
    status: '活跃'
  },
  {
    project_id: 'X7938',
    project_name: '平板电脑电路项目',
    baseline_id: 'I6789', // 关联到电子元件基线
    creation_date: '2023-01-25',
    owner: '李工',
    status: '活跃'
  },
  {
    project_id: 'X8049',
    project_name: '机械手臂零件项目',
    baseline_id: 'I7890', // 关联到机械零件基线
    creation_date: '2023-02-28',
    owner: '王工',
    status: '活跃'
  },
  {
    project_id: 'X9150',
    project_name: '工业机器人零件项目',
    baseline_id: 'I7890', // 关联到机械零件基线
    creation_date: '2023-03-05',
    owner: '赵工',
    status: '活跃'
  },
  {
    project_id: 'X1261',
    project_name: '手机外壳项目',
    baseline_id: 'I8901', // 关联到塑料材料基线
    creation_date: '2023-03-15',
    owner: '孙工',
    status: '活跃'
  },
  {
    project_id: 'X2372',
    project_name: '笔记本电脑外壳项目',
    baseline_id: 'I8901', // 关联到塑料材料基线
    creation_date: '2023-03-20',
    owner: '钱工',
    status: '活跃'
  },
  {
    project_id: 'X3483',
    project_name: '金属结构件项目',
    baseline_id: 'I9012', // 关联到金属材料基线
    creation_date: '2023-04-10',
    owner: '周工',
    status: '活跃'
  },
  {
    project_id: 'X4594',
    project_name: '金属外壳项目',
    baseline_id: 'I9012', // 关联到金属材料基线
    creation_date: '2023-04-15',
    owner: '吴工',
    status: '活跃'
  },
  {
    project_id: 'X5605',
    project_name: '智能手表显示屏项目',
    baseline_id: 'I1234', // 关联到显示屏基线
    creation_date: '2023-05-20',
    owner: '郑工',
    status: '活跃'
  },
  {
    project_id: 'X6716',
    project_name: '智能手机显示屏项目',
    baseline_id: 'I1234', // 关联到显示屏基线
    creation_date: '2023-05-25',
    owner: '冯工',
    status: '活跃'
  }
];

/**
 * 初始化项目基线关系到localStorage
 */
function initializeProjectBaselineRelations() {
  try {
    // 获取项目与基线的关系映射
    const map = new Map();
    projects.forEach(project => {
      map.set(project.project_id, project.baseline_id);
    });
    
    const relations = Array.from(map.entries());
    localStorage.setItem('project_baseline_relation', JSON.stringify(relations));
    localStorage.setItem('baseline_data', JSON.stringify(baselines));
    
    console.log('项目基线关系初始化成功！');
    console.log(`已保存${baselines.length}个基线和${projects.length}个项目`);
    
    return true;
  } catch (error) {
    console.error('初始化项目基线关系失败:', error);
    return false;
  }
}

// 浏览器环境中的localStorage模拟
if (typeof localStorage === 'undefined') {
  global.localStorage = {
    _data: {},
    setItem: function(id, val) {
      console.log(`保存数据: ${id}, 长度: ${val.length}`);
      this._data[id] = val;
    },
    getItem: function(id) {
      return this._data[id];
    },
    removeItem: function(id) {
      delete this._data[id];
    },
    clear: function() {
      this._data = {};
    }
  };
}

// 执行初始化
initializeProjectBaselineRelations(); 