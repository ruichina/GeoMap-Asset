
import React, { useState, useRef, useEffect } from 'react';
import { CommonPageProps, Coordinates5D, GraphicAsset, PageId } from '../types';

interface ExtractedAsset extends GraphicAsset {
  confidence: number;
}

interface UploadingFile {
  name: string;
  size: string;
  progress: number;
}

// Fixed props interface to include onAddAsset to match App.tsx usage
interface GraphicCollectionProps extends CommonPageProps {
  onAddAsset?: (asset: GraphicAsset) => void;
}

const MBU_OPTIONS = [
  '常规油气/松辽盆地/萨尔图油田/北一区/高台子组',
  '非常规/准疆尔盆地/吉木萨尔/页岩油/1号试验区',
  '海外项目/中亚区/阿克纠宾/构造演化/主断层带',
  '深层油气/塔里木/顺北/4号断裂带/二叠系',
  '地面工程/长输管线/西气东输/二线/增压站'
];

const GraphicCollection: React.FC<GraphicCollectionProps> = ({ lang, onNavigate, onAddAsset }) => {
  const [activeMethod, setActiveMethod] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [extractedAssets, setExtractedAssets] = useState<ExtractedAsset[]>([]);
  const [uploadingFile, setUploadingFile] = useState<UploadingFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New states for specific methods
  const [projectPath, setProjectPath] = useState('//FS-SERVER/Projects/2024/Halahatang_Study/');
  const [dbStatus, setDbStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  const updateAsset = (id: string, updates: Partial<ExtractedAsset>) => {
    setExtractedAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const updateCoord = (id: string, key: keyof Coordinates5D, value: string) => {
    setExtractedAssets(prev => prev.map(a => {
      if (a.id === id) {
        return {
          ...a,
          coordinates5D: {
            ...(a.coordinates5D || { object: '', business: '', work: '', profession: '', process: '' }),
            [key]: value
          } as Coordinates5D
        };
      }
      return a;
    }));
  };

  const collectionMethods = [
    { 
      id: 0, 
      title: '文档采集', 
      icon: 'fa-file-pdf', 
      desc: 'PDF, Word, PPT 图表抽取',
      color: 'bg-blue-600'
    },
    { 
      id: 1, 
      title: '专业图件采集', 
      icon: 'fa-vector-square', 
      desc: 'GDBX, GXF, DWG 矢量解析',
      color: 'bg-indigo-600'
    },
    { 
      id: 2, 
      title: '项目成果采集', 
      icon: 'fa-folder-tree', 
      desc: '指定文件夹路径深度扫描',
      color: 'bg-emerald-600'
    },
    { 
      id: 3, 
      title: '体数据采集', 
      icon: 'fa-database', 
      desc: 'Las, Segy, Grdecl, Zmap',
      color: 'bg-amber-600'
    },
    { 
      id: 4, 
      title: '专业软件推送', 
      icon: 'fa-tower-broadcast', 
      desc: 'Petrel, Geomap, 双狐等推送',
      color: 'bg-rose-600'
    },
    { 
      id: 5, 
      title: '图形数据库对接', 
      icon: 'fa-network-wired', 
      desc: '从存量数据库获取资产信息',
      color: 'bg-slate-800'
    },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingFile({ name: file.name, size: (file.size / 1024 / 1024).toFixed(2) + ' MB', progress: 0 });
      setIsAnalyzing(true);
      setShowResults(false);
      simulateProgress();
    }
  };

  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadingFile(prev => prev ? { ...prev, progress } : null);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => completeAnalysis(), 500);
      }
    }, 100);
  };

  const completeAnalysis = () => {
    // Generate varied graphic types based on collection method
    let gType: 'static' | 'dynamic' | 'datavolume' = 'static';
    if (activeMethod === 3) gType = 'datavolume';
    if (activeMethod === 4) gType = 'dynamic';

    // When collecting from document, return multiple items to satisfy "listing" requirement
    const resultCount = activeMethod === 0 ? 3 : 1;
    const docPages = [12, 24, 38];

    const mockNotes = [
      "图中展示了萨尔图油田北一区主力油层高台子组的顶面构造特征。主断层呈北北东走向，落差在 20-50m 之间。井位分布密集，显示了二次加密后的注采网格形态。",
      "该剖面图横跨顺北5号断裂带，清晰展示了下奥陶统蓬莱坝组的岩溶缝洞发育特征，AI识别出多处强振幅类串珠状反射特征。",
      "实时数据流显示：当前平均注水压力为 14.2 MPa，对比设计值偏高 5%，建议核查 S-101 井组的吸水指数变化。"
    ];

    const mockResults: ExtractedAsset[] = Array.from({ length: resultCount }).map((_, idx) => ({
      id: `ext-${Date.now()}-${idx}`,
      title: activeMethod === 0 
        ? `从文档中提取的图形成果 - ${idx + 1}` 
        : (activeMethod === 4 ? '实时注采平衡监控曲线 (推送)' : '萨尔图油气藏北一区构造精细解释图'),
      category: activeMethod === 4 ? '监测曲线' : '地质平面图',
      profession: activeMethod === 3 ? '地球物理' : '地质工程',
      oilfield: '萨尔图',
      wellId: 'S-101',
      layer: '高台子组',
      stage: '开发阶段',
      thumbnail: `https://picsum.photos/seed/oil-${activeMethod}-${idx}/600/400`,
      lastUpdate: new Date().toISOString().split('T')[0],
      version: 'V2.1',
      status: 'draft',
      tags: ['构造', '精细解释', 'AI识别'],
      source: activeMethod === 4 ? 'Petrel 推送' : '采集入库',
      sourcePage: activeMethod === 0 ? docPages[idx] : undefined,
      format: activeMethod === 3 ? 'DAT (三维体)' : activeMethod === 4 ? 'WebSocket Stream' : 'GDBX',
      creationTime: '2024-05-18',
      coordinateSystem: 'CGCS2000',
      projectName: '萨尔图北一区综合研究',
      confidence: 0.94 - (idx * 0.05),
      figureNote: mockNotes[idx % mockNotes.length],
      mbuNode: MBU_OPTIONS[idx % MBU_OPTIONS.length],
      graphicType: gType,
      coordinates5D: {
        object: '萨尔图北一区构造带',
        business: '产能建设',
        work: '方案编制',
        profession: '石油地质',
        process: '成果归档'
      }
    }));

    setExtractedAssets(mockResults);
    setIsAnalyzing(false);
    setShowResults(true);
    setUploadingFile(null);
  };

  const connectDatabase = () => {
    setDbStatus('connecting');
    setTimeout(() => {
      setDbStatus('connected');
      completeAnalysis();
    }, 1500);
  };

  const SectionTitle = ({ icon, title, sub, color = "text-blue-600" }: { icon: string, title: string, sub?: string, color?: string }) => (
    <div className="flex flex-col mb-4">
      <h5 className={`text-xs font-black flex items-center gap-2 uppercase tracking-wide ${color}`}>
        <i className={`fa-solid ${icon}`}></i>
        {title}
      </h5>
      {sub && <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{sub}</span>}
    </div>
  );

  return (
    <div className="flex flex-col h-full gap-6 animate-fadeIn pb-24">
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 shrink-0">
        {collectionMethods.map((m) => (
          <button
            key={m.id}
            onClick={() => { setActiveMethod(m.id); setShowResults(false); setDbStatus('disconnected'); }}
            className={`p-4 rounded-[24px] border transition-all flex flex-col items-center text-center group relative overflow-hidden ${
              activeMethod === m.id 
                ? `${m.color} text-white shadow-xl ring-4 ring-offset-2 ring-blue-500/10` 
                : 'bg-white border-slate-100 hover:border-blue-200 text-slate-600'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-2 ${
              activeMethod === m.id ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'
            }`}>
              <i className={`fa-solid ${m.icon}`}></i>
            </div>
            <h5 className="font-black text-[11px] mb-0.5">{m.title}</h5>
            <p className={`text-[9px] leading-tight opacity-70 ${activeMethod === m.id ? 'text-white' : 'text-slate-400'}`}>{m.desc}</p>
          </button>
        ))}
      </section>

      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between shrink-0">
           <div className="flex items-center gap-3">
              <div className={`w-2 h-6 rounded-full ${collectionMethods[activeMethod].color}`}></div>
              <h4 className="font-bold text-slate-800 tracking-tight">{collectionMethods[activeMethod].title} 工作台</h4>
           </div>
           {showResults && (
             <div className="flex gap-3 animate-fadeIn">
                <span className="text-[10px] font-black text-slate-400 self-center uppercase tracking-widest mr-4">
                  AI 共识别出 <span className="text-blue-600">{extractedAssets.length}</span> 项图形资产
                </span>
                <button onClick={() => setShowResults(false)} className="text-xs font-bold text-slate-400 px-4 py-2 hover:bg-slate-50 rounded-xl transition-all">取消重来</button>
                <button 
                  onClick={() => {
                    // Call onAddAsset for each extracted asset to store them globally
                    extractedAssets.forEach(asset => onAddAsset?.(asset));
                    onNavigate('review');
                  }} 
                  className="bg-blue-600 text-white px-8 py-2.5 rounded-2xl text-xs font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                   <i className="fa-solid fa-cloud-arrow-up"></i>
                   确认解析并提交评审
                </button>
             </div>
           )}
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          {isAnalyzing ? (
            <div className="h-full bg-white rounded-[40px] border border-slate-100 flex flex-col items-center justify-center animate-fadeIn">
               <div className="relative mb-8">
                  <div className="w-24 h-24 border-8 border-blue-500/10 border-t-blue-600 rounded-full animate-spin"></div>
                  <i className="fa-solid fa-robot absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl text-blue-600"></i>
               </div>
               <h3 className="text-xl font-black text-slate-800">深度解析进行中...</h3>
               <p className="text-sm text-slate-400 mt-2">正在从{collectionMethods[activeMethod].title}中提取图件语义并自动匹配 MBU 节点</p>
               {uploadingFile && (
                 <div className="mt-8 w-80">
                    <div className="flex justify-between text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
                       <span>{uploadingFile.name}</span>
                       <span>{uploadingFile.progress}%</span>
                    </div>
                    <div className="bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner">
                       <div className="h-full bg-blue-600 transition-all duration-300 shadow-lg" style={{ width: `${uploadingFile.progress}%` }}></div>
                    </div>
                 </div>
               )}
            </div>
          ) : !showResults ? (
            <div className="h-full space-y-6">
              {(activeMethod === 0 || activeMethod === 1 || activeMethod === 3) && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="h-full bg-white rounded-[40px] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center cursor-pointer hover:border-blue-200 hover:bg-blue-50/20 transition-all group"
                >
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} multiple />
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${collectionMethods[activeMethod].color} text-white shadow-2xl`}>
                    <i className={`fa-solid ${collectionMethods[activeMethod].icon} text-4xl`}></i>
                  </div>
                  <h3 className="text-xl font-black text-slate-800">点击或拖拽文件进行{collectionMethods[activeMethod].title}</h3>
                  <p className="text-sm text-slate-400 mt-2">
                    {activeMethod === 3 
                      ? '支持 Las, Segy, Grdecl, Zmap 等专业体数据格式' 
                      : '支持多图件并发上传与 AI 语义自动提取'}
                  </p>
                </div>
              )}

              {activeMethod === 2 && (
                <div className="h-full bg-white rounded-[40px] border border-slate-100 p-12 flex flex-col items-center justify-center">
                   <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center text-3xl mb-8 shadow-sm">
                      <i className="fa-solid fa-folder-open"></i>
                   </div>
                   <h3 className="text-xl font-black text-slate-800 mb-2">项目成果文件扫描</h3>
                   <p className="text-sm text-slate-400 mb-8">输入项目存储服务器路径，系统将递归解析所有文件夹中的图表、矢量图及专业文档</p>
                   <div className="w-full max-w-2xl bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-4 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all">
                      <i className="fa-solid fa-network-wired text-slate-300"></i>
                      <input 
                        type="text" 
                        value={projectPath}
                        onChange={(e) => setProjectPath(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-700 font-mono"
                        placeholder="请输入服务器路径 (如: //NAS-SERVER/Projects/...)"
                      />
                      <button onClick={simulateProgress} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200">
                         开始深度解析
                      </button>
                   </div>
                </div>
              )}

              {activeMethod === 4 && (
                <div className="h-full flex flex-col gap-6">
                   <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between">
                      <div>
                         <h3 className="font-black text-slate-800">专业软件实时推送</h3>
                         <p className="text-xs text-slate-400 mt-1">当前已有 4 个专业软件插件在线，实时接收并预览来自生产端的成果推送</p>
                      </div>
                      <div className="flex gap-2">
                         {['Geomap', 'Petrel', 'Gxplorer', '双狐'].map(app => (
                           <span key={app} className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black rounded-full border border-rose-100">{app} 插件就绪</span>
                         ))}
                      </div>
                   </div>
                   <div className="flex-1 bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                      <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         <span>待处理推送 (工区/成果)</span>
                         <span>共 1 条新消息</span>
                      </div>
                      <div className="flex-1 p-6 flex items-center justify-center">
                         <div className="w-full max-w-xl p-6 border-2 border-rose-100 bg-rose-50/30 rounded-3xl flex items-center justify-between animate-pulse">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center text-xl">
                                  <i className="fa-solid fa-share-from-square"></i>
                               </div>
                               <div>
                                  <h5 className="text-sm font-black text-slate-800">来自 Petrel 2024 的构造解释推送</h5>
                                  <p className="text-[10px] text-slate-400 mt-1">推送人: 王工 | 时间: {new Date().toLocaleTimeString()} | 工区: 塔里木哈拉哈塘</p>
                               </div>
                            </div>
                            <button onClick={completeAnalysis} className="bg-rose-600 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-rose-200">
                               预览并处理
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {activeMethod === 5 && (
                <div className="h-full bg-white rounded-[40px] border border-slate-100 p-12 flex flex-col items-center justify-center">
                   <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-3xl mb-8 shadow-sm transition-all ${dbStatus === 'connected' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-900 text-white'}`}>
                      <i className={`fa-solid ${dbStatus === 'connected' ? 'fa-circle-check' : 'fa-database'}`}></i>
                   </div>
                   <h3 className="text-xl font-black text-slate-800 mb-2">已有图形数据库对接</h3>
                   <p className="text-sm text-slate-400 mb-8 max-w-md text-center">直接连接已有的 Oracle/Spatia 或 PG/PostGIS 数据库，批量获取存量资产及其元数据标签</p>
                   
                   {dbStatus === 'disconnected' ? (
                     <div className="w-full max-lg space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="DB 主机地址" className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold" />
                          <input type="text" placeholder="端口号" className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold" />
                        </div>
                        <button onClick={connectDatabase} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-black transition-all">
                           建立连接并提取资产
                        </button>
                     </div>
                   ) : dbStatus === 'connecting' ? (
                     <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                        <p className="text-xs font-bold text-slate-500">正在验证数据库权限...</p>
                     </div>
                   ) : (
                     <div className="text-center animate-bounce">
                        <p className="text-emerald-600 font-black text-sm">连接成功，正在检索资产列表...</p>
                     </div>
                   )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8 pb-24">
              {extractedAssets.map((asset, assetIdx) => (
                <div key={asset.id} className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex animate-fadeIn">
                  {/* Left Column: Thumbnail & Figure Note & MBU */}
                  <div className="w-[450px] bg-slate-900 flex flex-col shrink-0">
                     <div className="h-[300px] relative flex items-center justify-center p-6 bg-[#0a0f1d]">
                        <img src={asset.thumbnail} className="max-w-full max-h-full object-contain shadow-2xl rounded border border-white/10" />
                        <div className="absolute top-6 left-6 bg-emerald-500 text-white text-[10px] px-3 py-1.5 rounded-xl font-black shadow-lg">
                           AI 置信度: {(asset.confidence * 100).toFixed(0)}%
                        </div>
                        {asset.sourcePage && (
                          <div className="absolute bottom-6 left-6 bg-blue-600 text-white text-[10px] px-3 py-1.5 rounded-xl font-black shadow-lg flex items-center gap-2">
                             <i className="fa-solid fa-file-invoice"></i>
                             来源页码: 第 {asset.sourcePage} 页
                          </div>
                        )}
                     </div>

                     <div className="flex-1 p-6 bg-slate-800 border-t border-white/5 space-y-6 overflow-y-auto">
                        {/* Figure Note Integrated Below Thumbnail */}
                        <div className="space-y-3">
                           <div className="flex items-center justify-between">
                              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                 <i className="fa-solid fa-quote-left text-blue-400"></i>
                                 图注内容 (AI 自动识别)
                              </h5>
                              <div className="flex items-center gap-1.5 text-[8px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                                 <i className="fa-solid fa-sparkles animate-pulse"></i>
                                 识别置信度: 88%
                              </div>
                           </div>
                           <div className="relative group">
                              <textarea 
                                 value={asset.figureNote}
                                 onChange={(e) => updateAsset(asset.id, { figureNote: e.target.value })}
                                 className="w-full h-28 bg-white/5 border border-white/10 rounded-2xl p-4 text-[11px] font-medium text-slate-300 leading-relaxed outline-none focus:border-blue-500 focus:bg-white/10 transition-all resize-none shadow-inner"
                                 placeholder="请输入图注详细信息..."
                              />
                              <button className="absolute bottom-3 right-3 w-7 h-7 rounded-lg bg-white/10 text-slate-400 border border-white/5 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all opacity-0 group-hover:opacity-100">
                                 <i className="fa-solid fa-rotate text-[9px]"></i>
                              </button>
                           </div>
                        </div>

                        <div className="h-px bg-white/5"></div>

                        <div className="space-y-4">
                           <SectionTitle icon="fa-link" title="最小业务单元 (MBU) 挂载" sub="确定图件所属业务逻辑节点" color="text-slate-300" />
                           <select 
                              value={asset.mbuNode}
                              onChange={(e) => updateAsset(asset.id, { mbuNode: e.target.value })}
                              className="w-full bg-white/10 border border-white/20 text-white text-xs font-bold p-3 rounded-xl outline-none hover:bg-white/15 transition-colors"
                           >
                              {MBU_OPTIONS.map(opt => <option key={opt} value={opt} className="text-slate-800">{opt}</option>)}
                           </select>
                           <button onClick={() => onNavigate('detail', asset)} className="w-full py-3 bg-blue-600 text-white text-[11px] font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2">
                              <i className="fa-solid fa-circle-info"></i>
                              查看当前资产详情预览
                           </button>
                        </div>
                     </div>
                  </div>

                  {/* Right Column: Base Info & Meta */}
                  <div className="flex-1 p-8 overflow-y-auto bg-white flex flex-col gap-10">
                     <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <SectionTitle icon="fa-heading" title="图件基本信息" />
                          <input 
                             type="text" 
                             value={asset.title}
                             onChange={(e) => updateAsset(asset.id, { title: e.target.value })}
                             className="w-full text-lg font-black text-slate-800 border-b-2 border-slate-100 pb-2 outline-none focus:border-blue-600 transition-colors"
                          />
                        </div>
                        {activeMethod === 0 && (
                           <div className="ml-6 px-4 py-2 bg-blue-50 border border-blue-100 rounded-2xl flex flex-col items-center">
                              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Origin Page</span>
                              <span className="text-xl font-black text-blue-600">P.{asset.sourcePage}</span>
                           </div>
                        )}
                     </div>

                     <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                        <SectionTitle icon="fa-microchip" title="五维语义坐标 (5D Semantic)" />
                        <div className="grid grid-cols-5 gap-3">
                           {[
                             { key: 'object', label: 'Object 对象', icon: 'fa-cube', color: 'text-blue-500' },
                             { key: 'business', label: 'Biz 业务', icon: 'fa-briefcase', color: 'text-indigo-500' },
                             { key: 'work', label: 'Work 工作', icon: 'fa-hammer', color: 'text-emerald-500' },
                             { key: 'profession', label: 'Prof 专业', icon: 'fa-microscope', color: 'text-amber-500' },
                             { key: 'process', label: 'Proc 流程', icon: 'fa-diagram-project', color: 'text-slate-500' },
                           ].map(dim => (
                             <div key={dim.key} className="space-y-1.5 overflow-hidden">
                               <label className="text-[9px] font-black text-slate-400 uppercase ml-1">{dim.label}</label>
                               <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center gap-2 group focus-within:ring-2 focus-within:ring-blue-500/20">
                                  <i className={`fa-solid ${dim.icon} text-[10px] ${dim.color} shrink-0`}></i>
                                  <input 
                                    type="text" 
                                    value={(asset.coordinates5D as any)[dim.key]}
                                    onChange={(e) => updateCoord(asset.id, dim.key as any, e.target.value)}
                                    className="w-full text-[11px] font-black text-slate-800 outline-none truncate" 
                                  />
                               </div>
                             </div>
                           ))}
                        </div>
                     </div>

                     <div className="space-y-6">
                        <SectionTitle icon="fa-gears" title="技术/用户元数据" />
                        <div className="grid grid-cols-3 gap-x-8 gap-y-6">
                           {[
                             { key: 'source', label: '来源 (软件/单位)', icon: 'fa-share-nodes' },
                             { key: 'version', label: '图件版本号', icon: 'fa-code-branch' },
                             { key: 'format', label: '文件格式', icon: 'fa-file-code' },
                             { key: 'creationTime', label: '编制日期', icon: 'fa-calendar-day' },
                             { key: 'oilfield', label: '关联工区/盆地', icon: 'fa-earth-asia' },
                             { key: 'wellId', label: '关联井号', icon: 'fa-bore-hole' },
                             { key: 'layer', label: '关联层位', icon: 'fa-layer-group' },
                             { key: 'mbuNode', label: '最小业务节点', icon: 'fa-link' },
                             { key: 'coordinateSystem', label: '坐标参考系', icon: 'fa-compass' },
                             { key: 'projectName', label: '所属项目信息', icon: 'fa-folder-tree' },
                             { key: 'category', label: '图件类型', icon: 'fa-tags' },
                           ].map(meta => (
                             <div key={meta.key} className="space-y-1.5 overflow-hidden">
                               <label className="text-[10px] font-black text-slate-400 uppercase ml-1">{meta.label}</label>
                               <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3 border border-transparent focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50/50 transition-all">
                                  <i className={`fa-solid ${meta.icon} text-xs text-slate-300 shrink-0`}></i>
                                  <input 
                                    type="text"
                                    value={(asset as any)[meta.key]}
                                    onChange={(e) => updateAsset(asset.id, { [meta.key]: e.target.value })}
                                    className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none truncate" 
                                  />
                               </div>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GraphicCollection;
