// 自动生成的参数提取配置
// 生成时间: 2025-07-09T07:32:57.706Z

export const REAL_SUPPLIERS = [
  "聚龙",
  "欣冠",
  "广正",
  "丽德宝",
  "怡同",
  "富群",
  "天马",
  "东声",
  "瑞声",
  "歌尔",
  "BOE",
  "盛泰",
  "风华",
  "理威",
  "天实",
  "深奥",
  "华星",
  "奥海",
  "维科",
  "百佳达",
  "辉阳"
];

export const REAL_MATERIALS = [
  "摄像头(CAM)",
  "OLED显示屏",
  "LCD显示屏",
  "手机卡托",
  "包装盒",
  "充电器",
  "装饰件",
  "电池盖",
  "保护套",
  "听筒",
  "标签",
  "中框",
  "喇叭",
  "侧键",
  "电池"
];

export const REAL_FACTORIES = [
  "深圳工厂",
  "重庆工厂",
  "南昌工厂",
  "宜宾工厂"
];

export const SUPPLIER_ALIASES = {
  "BOE": [
    "BOE",
    "京东方",
    "boe"
  ],
  "聚龙": [
    "聚龙",
    "julong"
  ],
  "歌尔": [
    "歌尔",
    "歌尔股份",
    "goer"
  ],
  "天马": [
    "天马",
    "tianma"
  ],
  "华星": [
    "华星",
    "华星光电"
  ],
  "欣冠": [
    "欣冠",
    "xinguan"
  ],
  "广正": [
    "广正",
    "guangzheng"
  ]
};

export const MATERIAL_ALIASES = {
  "LCD显示屏": [
    "LCD显示屏",
    "LCD屏",
    "液晶屏",
    "显示屏"
  ],
  "OLED显示屏": [
    "OLED显示屏",
    "OLED屏",
    "OLED",
    "有机屏"
  ],
  "摄像头(CAM)": [
    "摄像头",
    "CAM",
    "摄像头模组",
    "相机"
  ],
  "电池盖": [
    "电池盖",
    "电池后盖"
  ],
  "手机卡托": [
    "手机卡托",
    "卡托",
    "SIM卡托"
  ],
  "充电器": [
    "充电器",
    "充电头",
    "适配器"
  ]
};

// 参数提取函数
export function extractSupplierFromQuery(query) {
  const queryLower = query.toLowerCase();
  
  // 首先检查别名
  for (const [supplier, aliases] of Object.entries(SUPPLIER_ALIASES)) {
    for (const alias of aliases) {
      if (queryLower.includes(alias.toLowerCase())) {
        return supplier;
      }
    }
  }
  
  // 然后检查完整供应商名称
  for (const supplier of REAL_SUPPLIERS) {
    if (queryLower.includes(supplier.toLowerCase())) {
      return supplier;
    }
  }
  
  return null;
}

export function extractMaterialFromQuery(query) {
  const queryLower = query.toLowerCase();
  
  // 首先检查别名
  for (const [material, aliases] of Object.entries(MATERIAL_ALIASES)) {
    for (const alias of aliases) {
      if (queryLower.includes(alias.toLowerCase())) {
        return material;
      }
    }
  }
  
  // 然后按长度排序检查（避免短词匹配长词）
  for (const material of REAL_MATERIALS) {
    if (queryLower.includes(material.toLowerCase())) {
      return material;
    }
  }
  
  return null;
}

export function extractFactoryFromQuery(query) {
  const queryLower = query.toLowerCase();
  
  for (const factory of REAL_FACTORIES) {
    if (queryLower.includes(factory.toLowerCase())) {
      return factory;
    }
  }
  
  return null;
}
