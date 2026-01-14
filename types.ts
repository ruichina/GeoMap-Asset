
export type PageId = 
  | 'home' | 'search' | 'scenario' | 'detail' 
  | 'evolution' | 'overlay' | 'review' | 'collection' 
  | 'ai-completion' | 'mbu-binding' | 'ai-recognition' 
  | 'report-cite' | 'security' | 'standards' | 'ai-assistant'
  | 'my-graphics' | 'digital-twin' | 'spatial-distribution' | 'graphic-style-editor' | 'asset-graph';

export type Language = 'zh' | 'en';

export interface Coordinates5D {
  object: string;     // 对象：井、管线、油藏实体
  business: string;   // 业务：勘探、开发、生产、管理
  work: string;       // 工作：井位设计、动态分析、措施建议
  profession: string; // 专业：地质、物探、采油、配管
  process: string;    // 流程：初审、发布、归档、应用
}

export interface GraphicAsset {
  id: string;
  title: string;
  category: string;   // 图件类型/分类
  profession: string;
  oilfield: string;   // 关联工区
  spatialRelation?: '高空' | '地表' | '地面' | '水下' | '地下'; // 空间关系：高空、地表、地面、水下、地下
  wellId?: string;    // 关联井号
  layer?: string;     // 关联层位
  stage: string;
  thumbnail: string;
  lastUpdate: string;
  version: string;
  status: 'published' | 'review' | 'draft';
  tags: string[];
  format?: string;
  source?: string;    // 来源 (Petrel, Geomap, etc.)
  sourcePage?: number; // 来源页码 (针对文档采集)
  creationTime?: string;
  coordinateSystem?: string; // 坐标系
  projectName?: string;      // 所属项目信息
  professionDesc?: string;   // 图形专业说明信息
  constructionType?: string;
  graphicType?: 'static' | 'dynamic' | 'datavolume';
  coordinates5D?: Coordinates5D;
  mbuNode?: string;    // 最小业务节点 (最小业务单元，非组织架构)
  figureNote?: string; // 图注内容 (AI 识别)
}

export interface CitationRecord {
  id: string;
  timestamp: string;
  assets: GraphicAsset[];
  format: string;
}

export interface MetricCardData {
  label: string;
  value: string | number;
  trend: number;
  icon: string;
}

export interface VersionInfo {
  version: string;
  date: string;
  author: string;
  comment: string;
  thumbnail: string;
}

export interface CommonPageProps {
  lang: Language;
  onNavigate: (page: PageId, data?: any) => void;
}
