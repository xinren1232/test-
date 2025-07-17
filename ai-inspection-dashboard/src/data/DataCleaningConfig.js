/**
 * 数据清洗治理配置
 * 增强版配置，支持智能物料识别、多语言处理、规则引擎
 */

// 物料分类映射 - 增强版
export const MaterialCategoryMap = {
  '结构件': {
    code: 'STRUCTURE',
    keywords: ['电池盖', '中框', '手机卡托', '侧键', '装饰件', '外壳', '支架', '框架', '后盖', '前盖'],
    patterns: [
      /电池盖/i, /中框/i, /卡托/i, /侧键/i, /装饰件/i, /外壳/i, /支架/i, /框架/i,
      /后盖/i, /前盖/i, /battery.*cover/i, /middle.*frame/i, /card.*tray/i
    ],
    description: '手机结构性组件',
    color: '#409EFF'
  },
  '光学类': {
    code: 'OPTICAL',
    keywords: ['显示屏', 'LCD', 'OLED', '摄像头', '镜头', '传感器', '屏幕', '触摸屏'],
    patterns: [
      /显示屏/i, /LCD/i, /OLED/i, /摄像头/i, /镜头/i, /传感器/i, /屏幕/i, /触摸屏/i,
      /display/i, /screen/i, /camera/i, /lens/i, /sensor/i
    ],
    description: '光学显示和成像组件',
    color: '#67C23A'
  },
  '充电类': {
    code: 'CHARGING',
    keywords: ['充电器', '电池', '电源', '充电线', '适配器', '充电头', '数据线'],
    patterns: [
      /充电/i, /电池/i, /电源/i, /适配器/i, /线缆/i, /充电头/i, /数据线/i,
      /charger/i, /battery/i, /power/i, /adapter/i, /cable/i
    ],
    description: '电源充电相关组件',
    color: '#E6A23C'
  },
  '声学类': {
    code: 'ACOUSTIC',
    keywords: ['扬声器', '麦克风', '听筒', '喇叭', '音频', '声音'],
    patterns: [
      /扬声器/i, /麦克风/i, /听筒/i, /喇叭/i, /音频/i, /声音/i,
      /speaker/i, /microphone/i, /audio/i, /sound/i
    ],
    description: '音频声学组件',
    color: '#F56C6C'
  },
  '包装类': {
    code: 'PACKAGING',
    keywords: ['标签', '保护套', '包装盒', '说明书', '贴纸', '包装材料'],
    patterns: [
      /标签/i, /保护套/i, /包装/i, /说明书/i, /贴纸/i, /包装材料/i,
      /label/i, /package/i, /manual/i, /sticker/i
    ],
    description: '包装保护相关组件',
    color: '#909399'
  }
};

// 供应商映射 - 增强版
export const SupplierMap = {
  '聚龙': {
    code: 'JL',
    fullName: '聚龙科技有限公司',
    category: ['结构件', '充电类'],
    aliases: ['聚龙科技', 'JuLong', '聚龙有限公司', '聚龙集团'],
    region: '深圳',
    level: 'A'
  },
  '华为技术': {
    code: 'HW',
    fullName: '华为技术有限公司',
    category: ['结构件', '光学类'],
    aliases: ['华为', 'Huawei', '华为科技', '华为集团'],
    region: '深圳',
    level: 'S'
  },
  '深圳精密': {
    code: 'SZ',
    fullName: '深圳精密制造有限公司',
    category: ['结构件'],
    aliases: ['深圳精密制造', '精密制造', 'SZ Precision'],
    region: '深圳',
    level: 'A'
  },
  '天马': {
    code: 'TM',
    fullName: '天马微电子股份有限公司',
    category: ['光学类'],
    aliases: ['天马微电子', 'Tianma', '天马显示'],
    region: '厦门',
    level: 'A'
  },
  '歌尔': {
    code: 'GE',
    fullName: '歌尔股份有限公司',
    category: ['声学类'],
    aliases: ['歌尔股份', 'GoerTek', '歌尔声学'],
    region: '潍坊',
    level: 'A'
  }
};

// 问题类型分类
export const IssueTypeMap = {
  '尺寸问题': {
    keywords: ['尺寸', '偏差', '超差', '公差', '长度', '宽度', '厚度', '直径'],
    patterns: [/尺寸/i, /偏差/i, /超差/i, /公差/i, /长度/i, /宽度/i, /厚度/i],
    severity: 'high',
    color: '#F56C6C'
  },
  '外观问题': {
    keywords: ['外观', '划痕', '污渍', '变色', '裂纹', '缺陷', '瑕疵'],
    patterns: [/外观/i, /划痕/i, /污渍/i, /变色/i, /裂纹/i, /缺陷/i, /瑕疵/i],
    severity: 'medium',
    color: '#E6A23C'
  },
  '功能问题': {
    keywords: ['功能', '性能', '失效', '故障', '异常', '不良'],
    patterns: [/功能/i, /性能/i, /失效/i, /故障/i, /异常/i, /不良/i],
    severity: 'high',
    color: '#F56C6C'
  },
  '装配问题': {
    keywords: ['装配', '安装', '配合', '间隙', '松动', '卡死'],
    patterns: [/装配/i, /安装/i, /配合/i, /间隙/i, /松动/i, /卡死/i],
    severity: 'medium',
    color: '#E6A23C'
  },
  '材料问题': {
    keywords: ['材料', '材质', '硬度', '强度', '韧性', '老化'],
    patterns: [/材料/i, /材质/i, /硬度/i, /强度/i, /韧性/i, /老化/i],
    severity: 'high',
    color: '#F56C6C'
  }
};

// 数据清洗规则配置
export const CleaningRules = {
  // 文本清洗规则
  textCleaning: [
    {
      name: '去除测试文本',
      pattern: /测试测试|test.*test|demo.*demo/gi,
      replacement: '',
      priority: 1
    },
    {
      name: '去除HTML标签',
      pattern: /<[^>]*>/g,
      replacement: '',
      priority: 2
    },
    {
      name: '标点符号规范化',
      pattern: /[，。；：！？]/g,
      replacement: (match) => {
        const map = { '，': ',', '。': '.', '；': ';', '：': ':', '！': '!', '？': '?' };
        return map[match] || match;
      },
      priority: 3
    },
    {
      name: '多余空格清理',
      pattern: /\s+/g,
      replacement: ' ',
      priority: 4
    },
    {
      name: '去除特殊字符',
      pattern: /[^\u4e00-\u9fa5a-zA-Z0-9\s\-_.,:;!?()[\]{}]/g,
      replacement: '',
      priority: 5
    }
  ],

  // 字段映射规则
  fieldMapping: {
    '物料编码': ['MaterialCode', 'material_code', '料号', 'PN', 'Part Number', '编码'],
    '物料名称': ['MaterialName', 'material_name', '物料', '产品名称', 'Product Name'],
    '供应商': ['Supplier', 'supplier_name', '供应商名称', 'Vendor', '厂商'],
    '问题类型': ['IssueType', 'issue_type', '不良类型', 'Defect Type', '故障类型'],
    '问题描述': ['Description', 'description', '现象描述', 'Issue Description', '故障描述'],
    '临时对策': ['TemporaryAction', 'temporary_action', '应急措施', 'Countermeasure', '处理措施'],
    '责任部门': ['ResponsibleDept', 'responsible_dept', '负责部门', 'Department', '归属部门'],
    '发生日期': ['OccurrenceDate', 'occurrence_date', '日期', 'Date', '时间'],
    '处理状态': ['Status', 'status', '状态', 'State', '进度']
  }
};

// 智能提取模板
export const ExtractionTemplates = {
  // 质量问题报告模板
  qualityReport: {
    name: '质量问题报告',
    patterns: [
      /质量.*报告/i,
      /问题.*报告/i,
      /不良.*分析/i
    ],
    fields: [
      {
        name: 'MaterialCode',
        patterns: [
          /物料编码[：:]\s*([A-Z0-9\-]+)/i,
          /料号[：:]\s*([A-Z0-9\-]+)/i,
          /PN[：:]\s*([A-Z0-9\-]+)/i
        ]
      },
      {
        name: 'MaterialName',
        patterns: [
          /物料名称[：:]\s*([^\n\r，,。.]+)/i,
          /产品名称[：:]\s*([^\n\r，,。.]+)/i
        ]
      },
      {
        name: 'Supplier',
        patterns: [
          /供应商[：:]\s*([^\n\r，,。.]+)/i,
          /厂商[：:]\s*([^\n\r，,。.]+)/i
        ]
      },
      {
        name: 'IssueType',
        patterns: [
          /问题类型[：:]\s*([^\n\r，,。.]+)/i,
          /不良类型[：:]\s*([^\n\r，,。.]+)/i
        ]
      },
      {
        name: 'Description',
        patterns: [
          /问题描述[：:]\s*([\s\S]*?)(?=临时对策|责任部门|发生日期|$)/i,
          /现象描述[：:]\s*([\s\S]*?)(?=临时对策|责任部门|发生日期|$)/i
        ]
      },
      {
        name: 'TemporaryAction',
        patterns: [
          /临时对策[：:]\s*([\s\S]*?)(?=责任部门|发生日期|处理状态|$)/i,
          /应急措施[：:]\s*([\s\S]*?)(?=责任部门|发生日期|处理状态|$)/i
        ]
      },
      {
        name: 'ResponsibleDept',
        patterns: [
          /责任部门[：:]\s*([^\n\r，,。.]+)/i,
          /负责部门[：:]\s*([^\n\r，,。.]+)/i
        ]
      },
      {
        name: 'OccurrenceDate',
        patterns: [
          /发生日期[：:]\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2})/i,
          /日期[：:]\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2})/i
        ]
      },
      {
        name: 'Status',
        patterns: [
          /处理状态[：:]\s*([^\n\r，,。.]+)/i,
          /状态[：:]\s*([^\n\r，,。.]+)/i
        ]
      }
    ]
  }
};

// 数据验证规则
export const ValidationRules = {
  MaterialCode: {
    required: true,
    pattern: /^[A-Z0-9\-]{3,20}$/,
    message: '物料编码格式不正确'
  },
  MaterialName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    message: '物料名称长度应在2-50字符之间'
  },
  Supplier: {
    required: true,
    minLength: 2,
    maxLength: 30,
    message: '供应商名称长度应在2-30字符之间'
  },
  IssueType: {
    required: false,
    enum: Object.keys(IssueTypeMap),
    message: '问题类型不在预定义范围内'
  },
  Description: {
    required: false,
    minLength: 10,
    maxLength: 1000,
    message: '问题描述长度应在10-1000字符之间'
  },
  OccurrenceDate: {
    required: false,
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    message: '日期格式应为YYYY-MM-DD'
  }
};

// 导出配置
export const DataCleaningConfig = {
  MaterialCategoryMap,
  SupplierMap,
  IssueTypeMap,
  CleaningRules,
  ExtractionTemplates,
  ValidationRules
};
