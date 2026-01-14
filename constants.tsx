
import React from 'react';
import { GraphicAsset, PageId, Language } from './types';

export const TRANSLATIONS = {
  zh: {
    platformName: "GeoMap Asset",
    searchPlaceholder: "搜索图形资产、油气藏、专业...",
    logout: "登出",
    loginTitle: "欢迎回来",
    loginSub: "请登录您的账户以管理企业图形资产",
    usernameLabel: "用户名 / 邮箱",
    passwordLabel: "密码",
    rememberMe: "保持登录状态",
    enterPlatform: "进入管理平台",
    aiBrain: "GeoMap AI",
    aiSub: "快速访问、管理 and 分析石油工程各专业的高价值图形资产。",
    smartSearch: "智能检索",
    recentUpdate: "最近更新",
    viewAll: "查看全部",
    hotRecommend: "热门推荐",
    metrics: {
      total: "资产总数",
      recent: "近期上传",
      pending: "待评审",
      download24h: "24h 下载"
    },
    categories: {
      static: "静态图",
      dynamic: "动态图",
      data: "数据体图形",
      dist: "类别分布"
    },
    status: {
      published: "已发布",
      review: "评审中",
      draft: "草稿"
    },
    assetLabels: {
      owner: "所有者",
      security: "安全分级",
      format: "格式",
      creation: "编制时间",
      type: "类型",
      oilfield: "油气藏",
      resolution: "分辨率",
      versionNumber: "图件版本号",
      coord5D: "五维语义坐标",
      coord5D_sub: "对象·业务·工作·专业·流程",
      evolution: "版本演进",
      figureNote: "图注内容 (AI 识别)"
    },
    aiAssistant: {
      greeting: "您好！我是 GeoMap AI。今天我能帮您查找或分析哪些资产？",
      placeholder: "输入指令或询问资产详情...",
      recommend: "推荐提问"
    }
  },
  en: {
    platformName: "GeoMap Asset",
    searchPlaceholder: "Search assets, reservoirs, professions...",
    logout: "Logout",
    loginTitle: "Welcome Back",
    loginSub: "Sign in to manage your enterprise assets",
    usernameLabel: "Username",
    passwordLabel: "Password",
    rememberMe: "Stay Signed In",
    enterPlatform: "Enter Platform",
    aiBrain: "GeoMap AI",
    aiSub: "Fast access, management, and analysis of high-value industrial technical graphics.",
    smartSearch: "Smart Search",
    recentUpdate: "Recent Updates",
    viewAll: "View All",
    hotRecommend: "Top Picks",
    metrics: {
      total: "Total Assets",
      recent: "Recent",
      pending: "Pending",
      download24h: "Downloads"
    },
    categories: {
      static: "Static",
      dynamic: "Dynamic",
      data: "Volumes",
      dist: "Distribution"
    },
    status: {
      published: "Published",
      review: "Reviewing",
      draft: "Draft"
    },
    assetLabels: {
      owner: "Owner",
      security: "Security",
      format: "Format",
      creation: "Created",
      type: "Type",
      oilfield: "Reservoir",
      resolution: "Res",
      versionNumber: "Version Number",
      coord5D: "5D Semantic Coord",
      coord5D_sub: "Obj·Biz·Work·Prof·Proc",
      evolution: "Evolution",
      figureNote: "Figure Note (AI Extracted)"
    },
    aiAssistant: {
      greeting: "Hello! I am GeoMap AI. How can I help you today?",
      placeholder: "Ask anything about assets...",
      recommend: "Suggestions"
    }
  }
};

export const MOCK_ASSETS: GraphicAsset[] = [
  {
    id: '1',
    title: '萨尔图油气藏北一区构造精细解释图',
    category: '勘探图件',
    profession: '地质',
    oilfield: '萨尔图',
    spatialRelation: '地下',
    stage: '开发阶段',
    thumbnail: 'https://picsum.photos/seed/geo_update_v2/600/400',
    lastUpdate: '2023-10-24',
    version: 'V2.1',
    status: 'published',
    tags: ['构造', '三三维精细解释', '权威发布'],
    format: 'TIFF (高清)',
    creationTime: '2023-09-12',
    constructionType: '地质构造类',
    graphicType: 'static',
    figureNote: '图中展示了萨尔图油田北一区主力油层高台子组的顶面构造特征。主断层呈北北东走向，落差在 20-50m 之间。井位分布密集，显示了二次加密后的注采网格形态。',
    coordinates5D: {
      object: '北一区构造带',
      business: '产能建设',
      work: '方案编制',
      profession: '地质工程',
      process: '成果归档'
    }
  },
  {
    id: '2',
    title: 'JZ9-3油气藏注采平衡动态分析图 V3',
    category: '监测图件',
    profession: '油藏工程',
    oilfield: 'JZ9-3',
    spatialRelation: '水下',
    stage: '生产阶段',
    thumbnail: 'https://picsum.photos/seed/dyn1/600/400',
    lastUpdate: '2023-11-02',
    version: 'V3.0',
    status: 'review',
    tags: ['注采平衡', '动态分析', '安全规范'],
    format: 'DWG / SVG',
    creationTime: '2023-10-28',
    constructionType: '生产监测类',
    graphicType: 'dynamic',
    figureNote: '实时监控图展示了 JZ9-3 区块 101 井组的注采平衡状况。目前该井组整体处于注采平衡状态，各单井压力波动在正常设计范围内。',
    coordinates5D: {
      object: 'JZ9-3-101 井组',
      business: '油藏管理',
      work: '动态监测',
      profession: '油藏开发',
      process: '专家评审'
    }
  },
  {
    id: '3',
    title: '顺北5号油气藏地下裂缝发育模型',
    category: '开发模型',
    profession: '地球物理',
    oilfield: '顺北5号',
    spatialRelation: '地下',
    stage: '评价阶段',
    thumbnail: 'https://picsum.photos/seed/vol1/600/400',
    lastUpdate: '2023-11-15',
    version: 'V1.5',
    status: 'draft',
    tags: ['裂缝建模', '数值模拟'],
    format: 'DAT (三维体数据)',
    creationTime: '2023-11-01',
    constructionType: '储层描述类',
    graphicType: 'datavolume',
    figureNote: '顺北5号断裂带裂缝发育模型，展示了多级次裂缝的交织网络。AI 识别结果显示，该区域裂缝密度随深度增加呈指数级衰减，但断裂带核心区仍保持较高的导通性。',
    coordinates5D: {
      object: '顺北5号深层储层',
      business: '储层评价',
      work: '数值建模',
      profession: '地球物理',
      process: '初步解释'
    }
  },
  {
    id: '4',
    title: '威远区块页岩气水平井轨迹综合展示图',
    category: '工程设计',
    profession: '钻井工程',
    oilfield: '威远-长宁',
    spatialRelation: '地下',
    wellId: 'W-204H',
    stage: '开发阶段',
    thumbnail: 'https://picsum.photos/seed/drill1/600/400',
    lastUpdate: '2024-01-10',
    version: 'V1.0',
    status: 'published',
    tags: ['页岩气', '水平井', '轨迹优化'],
    format: 'PDF / SVG',
    creationTime: '2023-12-20',
    graphicType: 'static',
    coordinates5D: {
      object: 'W-204H 井',
      business: '产能建设',
      work: '钻井设计',
      profession: '钻井工程',
      process: '成果发布'
    }
  },
  {
    id: '5',
    title: '渤海海域中心平台实时管线压力监测',
    category: '生产运行',
    profession: '配管',
    oilfield: '渤海湾',
    spatialRelation: '地表',
    stage: '生产阶段',
    thumbnail: 'https://picsum.photos/seed/pipe1/600/400',
    lastUpdate: '2024-02-05',
    version: 'Live',
    status: 'published',
    tags: ['实时监测', '管线安全', '物联网'],
    format: 'WebSocket Stream',
    creationTime: '2024-02-01',
    graphicType: 'dynamic',
    coordinates5D: {
      object: '中心平台集输系统',
      business: '日常生产',
      work: '运行控制',
      profession: '储运工程',
      process: '实时监控'
    }
  },
  {
    id: '6',
    title: '哈拉哈塘三维波阻抗反演体数据包',
    category: '物探成果',
    profession: '地球物理',
    oilfield: '哈拉哈塘',
    spatialRelation: '地下',
    stage: '评价阶段',
    thumbnail: 'https://picsum.photos/seed/seismic1/600/400',
    lastUpdate: '2023-12-18',
    version: 'V2.2',
    status: 'published',
    tags: ['波阻抗反演', '储层预测', '高分辨率'],
    format: 'SGY / GDB',
    creationTime: '2023-11-20',
    graphicType: 'datavolume',
    coordinates5D: {
      object: '哈拉哈塘东部区块',
      business: '目标选址',
      work: '地震解释',
      profession: '地球物理',
      process: '正式入库'
    }
  },
  {
    id: '7',
    title: '胜利东部老区高分辨率层序地层剖面',
    category: '地质剖面',
    profession: '地质',
    oilfield: '胜利东部',
    spatialRelation: '地下',
    stage: '评价阶段',
    thumbnail: 'https://picsum.photos/seed/geo2/600/400',
    lastUpdate: '2024-03-12',
    version: 'V1.1',
    status: 'published',
    tags: ['地层剖面', '老区评价', '层序地层'],
    format: 'TIFF / JPG',
    creationTime: '2024-02-15',
    graphicType: 'static',
    coordinates5D: {
      object: '胜利东部断陷带',
      business: '潜力评估',
      work: '地层对比',
      profession: '石油地质',
      process: '成果发布'
    }
  },
  {
    id: '8',
    title: '大庆油田地面管网拓扑结构图 2024',
    category: '地面工程',
    profession: '配管',
    oilfield: '大庆',
    spatialRelation: '地面',
    stage: '开发阶段',
    thumbnail: 'https://picsum.photos/seed/infra1/600/400',
    lastUpdate: '2024-03-01',
    version: 'V4.0',
    status: 'published',
    tags: ['地面管网', '拓扑结构', 'GIS', '数字化转型'],
    format: 'SHP / DXF',
    creationTime: '2024-02-10',
    graphicType: 'static',
    coordinates5D: {
      object: '地面集输系统',
      business: '规划设计',
      work: '数字化建模',
      profession: '地面工程',
      process: '正式归档'
    }
  },
  {
    id: '9',
    title: '顺北4号断裂带构造应力场模拟动画',
    category: '模拟动画',
    profession: '地质',
    oilfield: '顺北5号',
    spatialRelation: '地下',
    stage: '评价阶段',
    thumbnail: 'https://picsum.photos/seed/anim1/600/400',
    lastUpdate: '2024-02-28',
    version: 'V2.0',
    status: 'review',
    tags: ['应力场模拟', '断裂演化', '有限元分析'],
    format: 'MP4 / GLB',
    creationTime: '2024-01-15',
    graphicType: 'dynamic',
    coordinates5D: {
      object: '4号断裂带',
      business: '地质研究',
      work: '构造模拟',
      profession: '地质力学',
      process: '专家评审'
    }
  },
  {
    id: '10',
    title: '长庆安塞油田注水井组动态分析看板',
    category: '仪表盘',
    profession: '油藏工程',
    oilfield: '安塞',
    spatialRelation: '地面',
    stage: '生产阶段',
    thumbnail: 'https://picsum.photos/seed/dash1/600/400',
    lastUpdate: '2024-03-18',
    version: 'Daily',
    status: 'published',
    tags: ['水驱开发', '注采指标', '数据可视化'],
    format: 'Web Dashboard',
    creationTime: '2024-03-01',
    graphicType: 'dynamic',
    coordinates5D: {
      object: '安塞塞15井区',
      business: '油藏管理',
      work: '动态分析',
      profession: '油藏开发',
      process: '日常生产'
    }
  },
  {
    id: '11',
    title: '塔里木哈6井钻井井身结构设计图',
    category: '工程图纸',
    profession: '钻井工程',
    oilfield: '哈拉哈塘',
    spatialRelation: '地下',
    wellId: 'HA-6',
    stage: '勘探阶段',
    thumbnail: 'https://picsum.photos/seed/well1/600/400',
    lastUpdate: '2023-09-05',
    version: 'V1.0',
    status: 'published',
    tags: ['井身结构', '套管设计', '标准化图件'],
    format: 'DWG / PDF',
    creationTime: '2023-08-20',
    graphicType: 'static',
    coordinates5D: {
      object: '哈6井',
      business: '产能建设',
      work: '工程设计',
      profession: '钻井工程',
      process: '正式入库'
    }
  },
  {
    id: '12',
    title: '深层碳酸盐岩缝洞型储层精细描述体',
    category: '三维模型',
    profession: '地质',
    oilfield: '顺北核心',
    spatialRelation: '地下',
    stage: '开发阶段',
    thumbnail: 'https://picsum.photos/seed/res_model1/600/400',
    lastUpdate: '2024-02-12',
    version: 'V3.1',
    status: 'published',
    tags: ['缝洞型储层', '三维精细描述', '储层非均质性'],
    format: 'GOCAD / Petrel',
    creationTime: '2024-01-10',
    graphicType: 'datavolume',
    coordinates5D: {
      object: '顺北核心区块储层',
      business: '油藏描述',
      work: '地质建模',
      profession: '地质工程',
      process: '正式归档'
    }
  },
  {
    id: '13',
    title: '顺北断裂带高空无人机巡检正射影像',
    category: '巡检影像',
    profession: '工程管理',
    oilfield: '顺北',
    spatialRelation: '高空',
    stage: '运行维护',
    thumbnail: 'https://picsum.photos/seed/drone1/600/400',
    lastUpdate: '2024-04-01',
    version: 'V1.0',
    status: 'published',
    tags: ['无人机', '正射影像', '高清巡检'],
    format: 'GeoTIFF',
    creationTime: '2024-03-25',
    graphicType: 'static',
    coordinates5D: {
      object: '顺北管网区',
      business: '安全环保',
      work: '无人机巡检',
      profession: '工程运维',
      process: '成果入库'
    }
  }
];

export const getNavItems = (lang: Language) => {
  return NAV_ITEMS_RAW.map(item => ({
    id: item.id,
    label: lang === 'zh' ? item.zh : item.en,
    icon: item.icon,
    hidden: item.hidden
  }));
};

export const NAV_ITEMS_RAW: { id: PageId; zh: string; en: string; icon: string; hidden?: boolean }[] = [
  // 1. 平台首页
  { id: 'home', zh: '平台首页', en: 'Home', icon: 'fa-chart-line' },
  // 2. 我的图形
  { id: 'my-graphics', zh: '我的图形', en: 'My Graphics', icon: 'fa-star' },
  // 3. 统一检索
  { id: 'search', zh: '统一检索', en: 'Unified Search', icon: 'fa-magnifying-glass' },
  // 4. 对象数字孪生
  { id: 'digital-twin', zh: '对象数字孪生', en: 'Digital Twin', icon: 'fa-cube' },
  // 5. 业务场景
  { id: 'scenario', zh: '业务场景', en: 'Scenarios', icon: 'fa-layer-group' },
  // 6. 图形数据采集
  { id: 'collection', zh: '图形数据采集', en: 'Graphic Data Collection', icon: 'fa-file-import' },
  // 7. 发布评审
  { id: 'review', zh: '发布评审', en: 'Review', icon: 'fa-clipboard-check' },
  // 8. 图件引用
  { id: 'report-cite', zh: '图件引用', en: 'Graphic Citation', icon: 'fa-share-from-square' },
  // 9. 地理空间分布
  { id: 'spatial-distribution', zh: '地理空间分布', en: 'Geo Distribution', icon: 'fa-earth-asia' },
  // 10. 图形资产知识图谱
  { id: 'asset-graph', zh: '图形资产知识图谱', en: 'Asset Knowledge Graph', icon: 'fa-circle-nodes' },
  // 11. GeoMap AI
  { id: 'ai-assistant', zh: 'GeoMap AI', en: 'GeoMap AI', icon: 'fa-message' },
  // 12. 制图标准
  { id: 'standards', zh: '制图标准', en: 'Standards', icon: 'fa-ruler-combined' },
  // 13. 角色权限
  { id: 'security', zh: '角色权限', en: 'Roles & Permissions', icon: 'fa-shield-halved' },
  
  // Hidden items
  { id: 'detail', zh: '资产详情', en: 'Asset Detail', icon: 'fa-circle-info', hidden: true },
  { id: 'evolution', zh: '版本演进', en: 'Evolution', icon: 'fa-timeline', hidden: true },
  { id: 'overlay', zh: '对比叠加', en: 'Overlay', icon: 'fa-clone', hidden: true },
];
