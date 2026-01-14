
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MOCK_ASSETS, TRANSLATIONS } from '../constants';
import { GraphicAsset, PageId, Language } from '../types';

interface AssetDetailProps {
  onNavigate: (page: PageId, data?: any) => void;
  onCiteAsset?: (asset: GraphicAsset) => void;
  citedIds?: string[];
  lang: Language;
  asset: GraphicAsset;
  navigationSource?: PageId;
}

const AssetDetail: React.FC<AssetDetailProps> = ({ onNavigate, onCiteAsset, citedIds = [], lang, asset, navigationSource = 'home' }) => {
  const t_labels = TRANSLATIONS[lang].assetLabels;
  const [isOverlayModalOpen, setIsOverlayModalOpen] = useState(false);
  const [isHeatmapOpen, setIsHeatmapOpen] = useState(false);
  const [selectedOverlayIds, setSelectedOverlayIds] = useState<string[]>([asset.id]);
  const [isCiting, setIsCiting] = useState(false);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'info' | 'lineage' | 'link'>('info');
  
  // Edit logic states
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [isLaunchingProTool, setIsLaunchingProTool] = useState(false);
  const [launchProgress, setLaunchProgress] = useState(0);
  const editMenuRef = useRef<HTMLDivElement>(null);

  const isAlreadyCited = citedIds.includes(asset.id);
  
  // Navigation Logic
  const currentIndex = useMemo(() => MOCK_ASSETS.findIndex(a => a.id === asset.id), [asset.id]);
  const prevAsset = MOCK_ASSETS[(currentIndex - 1 + MOCK_ASSETS.length) % MOCK_ASSETS.length];
  const nextAsset = MOCK_ASSETS[(currentIndex + 1) % MOCK_ASSETS.length];

  const concurrentAssets = useMemo(() => {
    return MOCK_ASSETS.filter(a => 
      a.id !== asset.id && 
      (a.projectName === asset.projectName || a.oilfield === asset.oilfield)
    ).slice(0, 3);
  }, [asset]);

  // Click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editMenuRef.current && !editMenuRef.current.contains(event.target as Node)) {
        setShowEditMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCite = () => {
    if (onCiteAsset) {
      setIsCiting(true);
      onCiteAsset(asset);
      setTimeout(() => setIsCiting(false), 1000);
    }
  };

  const handleLaunchProTool = (toolName: string) => {
    setShowEditMenu(false);
    setIsLaunchingProTool(true);
    setLaunchProgress(0);
    
    const interval = setInterval(() => {
      setLaunchProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsLaunchingProTool(false), 800);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const confirmOverlay = () => {
    const selectedAssets = MOCK_ASSETS.filter(a => selectedOverlayIds.includes(a.id));
    onNavigate('overlay', { assets: selectedAssets });
  };

  const AssociationHeatmap = () => {
    const professions = ['地质', '物探', '油藏', '钻井', '地面', '采油'];
    const stages = ['勘探', '评价', '开发', '生产'];
    
    const getIntensity = (p: string, s: string) => {
      if (p === asset.profession && s === asset.stage.slice(0, 2)) return 95;
      const seed = p.length + s.length + (MOCK_ASSETS.length % 5);
      return (seed * 17) % 80;
    };

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-fadeIn">
        <div className="bg-white w-full max-w-5xl rounded-[48px] shadow-2xl overflow-hidden flex flex-col border border-white/10">
          <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">
                {lang === 'zh' ? '跨专业资产关联热图' : 'Cross-Professional Heatmap'}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                {lang === 'zh' ? '多模态语义频率分析' : 'Multi-modal Semantic Frequency Analysis'}
              </p>
            </div>
            <button 
              onClick={() => setIsHeatmapOpen(false)} 
              className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-all"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div className="p-10 flex-1 overflow-y-auto">
            <div className="flex mb-8 items-center gap-6 bg-blue-50 p-6 rounded-3xl border border-blue-100">
               <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <i className="fa-solid fa-circle-info"></i>
               </div>
               <p className="text-sm text-blue-800 font-medium leading-relaxed">
                 {lang === 'zh' 
                  ? `当前分析焦点：${asset.oilfield} 工区。热图展示了该工区内资产在“专业”与“业务阶段”两个维度的分布密度。深色区域代表资产沉淀较为集中的业务交叉点。` 
                  : `Focus Area: ${asset.oilfield}. The heatmap displays asset density across 'Professions' and 'Business Stages'. Darker cells indicate higher concentration.`}
               </p>
            </div>

            <div className="relative overflow-x-auto pb-6">
              <table className="w-full border-separate border-spacing-2">
                <thead>
                  <tr>
                    <th className="w-24"></th>
                    {professions.map(p => (
                      <th key={p} className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-4">{p}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stages.map(s => (
                    <tr key={s}>
                      <td className="text-[10px] font-black text-slate-800 uppercase tracking-widest text-right pr-4">{s}</td>
                      {professions.map(p => {
                        const intensity = getIntensity(p, s);
                        return (
                          <td key={p + s} className="h-20 group relative">
                            <div 
                              className={`w-full h-full rounded-2xl transition-all duration-500 border border-transparent group-hover:scale-105 group-hover:shadow-xl cursor-default flex items-center justify-center`}
                              style={{ 
                                backgroundColor: `rgba(37, 99, 235, ${intensity / 100})`,
                                color: intensity > 50 ? 'white' : '#1e293b'
                              }}
                            >
                              <span className="text-sm font-black opacity-0 group-hover:opacity-100 transition-opacity">
                                {(intensity / 5).toFixed(0)}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AssetKnowledgeGraph = () => {
    const center = { x: 185, y: 185 };
    const nodes = [
      { id: 'well', label: asset.wellId || '未知井号', icon: 'fa-bore-hole', x: 80, y: 100, color: '#f59e0b' },
      { id: 'field', label: asset.oilfield, icon: 'fa-mountain', x: 290, y: 80, color: '#10b981' },
      { id: 'prof', label: asset.profession, icon: 'fa-microscope', x: 300, y: 280, color: '#3b82f6' },
      { id: 'proj', label: '所属项目', icon: 'fa-folder-tree', x: 80, y: 290, color: '#6366f1' },
    ];

    return (
      <div className="bg-slate-950 rounded-3xl p-4 h-[420px] relative overflow-hidden animate-fadeIn select-none border border-white/5">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <svg className="w-full h-full" viewBox="0 0 370 370">
          <g>
            {nodes.map((node, i) => (
              <line key={i} x1={center.x} y1={center.y} x2={node.x} y2={node.y} stroke={node.color} strokeWidth="1" strokeDasharray="4 2" opacity="0.4" />
            ))}
          </g>
          {nodes.map((node, i) => (
            <g key={i} className="cursor-pointer group">
              <circle cx={node.x} cy={node.y} r="24" fill="rgba(255,255,255,0.03)" stroke={node.color} strokeWidth="1" className="group-hover:fill-white/10 transition-all" />
              <foreignObject x={node.x - 8} y={node.y - 8} width="16" height="16">
                <i className={`fa-solid ${node.icon}`} style={{ color: node.color, fontSize: '11px' }}></i>
              </foreignObject>
              <text x={node.x} y={node.y + 38} fill="white" fontSize="9" fontWeight="bold" textAnchor="middle" opacity="0.6" className="group-hover:opacity-100 transition-opacity">{node.label}</text>
            </g>
          ))}
          <g className="animate-pulse">
            <circle cx={center.x} cy={center.y} r="35" fill="rgba(59, 130, 246, 0.1)" stroke="#3b82f6" strokeWidth="2" />
            <foreignObject x={center.x - 12} y={center.y - 12} width="24" height="24">
              <i className="fa-solid fa-file-image text-blue-500 text-lg"></i>
            </foreignObject>
          </g>
        </svg>
      </div>
    );
  };

  const renderViewport = () => {
    return (
      <div className="w-full h-full relative group flex items-center justify-center bg-[#0a0f1d] overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <img src={asset.thumbnail} alt="Static Preview" className="max-w-[90%] max-h-[90%] object-contain shadow-2xl transition-transform duration-500 hover:scale-105" />
      </div>
    );
  };

  const SectionTitle = ({ icon, title, sub, color = "text-blue-600" }: { icon: string, title: string, sub?: string, color?: string }) => (
    <div className="flex flex-col mb-4">
      <h5 className={`text-[11px] font-black text-slate-800 flex items-center gap-3 uppercase tracking-widest border-l-4 ${color.replace('text', 'border')} pl-3`}>
        <i className={`fa-solid ${icon} ${color}`}></i>
        {title}
      </h5>
      {sub && <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight ml-7">{sub}</span>}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 animate-fadeIn h-full pb-20">
      {isHeatmapOpen && <AssociationHeatmap />}
      
      {/* Launch Progress Overlay */}
      {isLaunchingProTool && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white p-12 rounded-[40px] shadow-2xl w-full max-w-md flex flex-col items-center gap-8 border border-slate-100">
             <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center text-white text-3xl shadow-2xl shadow-blue-500/40">
                   <i className="fa-solid fa-rocket animate-bounce"></i>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 border-4 border-white"></div>
             </div>
             <div className="text-center space-y-2">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">正在唤醒专业工作站</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">正在通过企业级协议链接至外部编辑器...</p>
             </div>
             <div className="w-full space-y-3">
                <div className="flex justify-between text-[10px] font-black text-blue-600 uppercase tracking-widest">
                   <span>初始化本地环境</span>
                   <span>{launchProgress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                   <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${launchProgress}%` }}></div>
                </div>
             </div>
             <p className="text-[10px] text-slate-400 italic">请确保已安装最新版 GeoMap Desktop 客户端并正确配置工区权限。</p>
          </div>
        </div>
      )}

      <div className="flex h-[620px] gap-6 shrink-0">
        <div className="flex-1 bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
            <div className="flex items-center gap-4">
               <div className="flex bg-white rounded-xl border border-slate-200 shadow-sm p-1">
                 <button onClick={() => onNavigate(navigationSource as PageId)} className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-all group" title="返回列表">
                   <i className="fa-solid fa-chevron-left text-xs group-hover:-translate-x-0.5 transition-transform"></i>
                 </button>
                 <div className="w-px h-6 bg-slate-100 self-center mx-1"></div>
                 <button onClick={() => onNavigate('detail', prevAsset)} className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-all"><i className="fa-solid fa-arrow-left text-xs"></i></button>
                 <button onClick={() => onNavigate('detail', nextAsset)} className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-all"><i className="fa-solid fa-arrow-right text-xs"></i></button>
               </div>
               
               <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg bg-blue-600`}>
                 <i className="fa-solid fa-image"></i>
               </div>
               <div className="flex flex-col">
                 <h3 className="font-black text-slate-800 text-base tracking-tight leading-tight">{asset.title}</h3>
                 <span className="text-[10px] text-slate-400 font-black uppercase mt-0.5">VER: <span className="text-blue-600">{asset.version}</span></span>
               </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button onClick={() => onNavigate('evolution', asset)} className="flex items-center gap-2 text-[11px] font-black bg-indigo-50 text-indigo-600 border border-indigo-100 px-5 py-2.5 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                <i className="fa-solid fa-clock-rotate-left"></i>
                {t_labels.evolution}
              </button>
              
              <button onClick={() => setIsOverlayModalOpen(true)} className="flex items-center gap-2 text-[11px] font-black bg-blue-50 text-blue-600 border border-blue-100 px-5 py-2.5 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                <i className="fa-solid fa-clone"></i>
                {lang === 'zh' ? '图形叠加' : 'Overlay'}
              </button>

              <div className="relative" ref={editMenuRef}>
                <button 
                  onClick={() => setShowEditMenu(!showEditMenu)}
                  className="flex items-center gap-2 text-[11px] font-black bg-slate-50 text-slate-600 border border-slate-200 px-5 py-2.5 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                  {lang === 'zh' ? '图形编辑' : 'Edit Graphic'}
                  <i className={`fa-solid fa-chevron-down text-[8px] ml-1 transition-transform ${showEditMenu ? 'rotate-180' : ''}`}></i>
                </button>

                {showEditMenu && (
                  <div className="absolute top-full right-0 mt-3 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-slideUp">
                    <div className="p-4 bg-slate-50 border-b border-slate-100">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">请选择编辑模式</span>
                    </div>
                    <div className="p-2">
                       <button 
                        onClick={() => { setShowEditMenu(false); onNavigate('graphic-style-editor', asset); }}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-blue-50 transition-all group text-left"
                       >
                          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform">
                             <i className="fa-solid fa-palette"></i>
                          </div>
                          <div>
                             <h5 className="text-xs font-black text-slate-800">在线图形样式编辑</h5>
                             <p className="text-[10px] text-slate-400 mt-0.5">调整配色、矢量标注与图层</p>
                          </div>
                       </button>

                       <button 
                        onClick={() => handleLaunchProTool('GeoMap')}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-emerald-50 transition-all group text-left"
                       >
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform">
                             <i className="fa-solid fa-computer"></i>
                          </div>
                          <div>
                             <h5 className="text-xs font-black text-slate-800">用专业工具打开</h5>
                             <p className="text-[10px] text-slate-400 mt-0.5">唤醒 Petrel / GeoMap 桌面客户端</p>
                          </div>
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                       </button>
                    </div>
                    <div className="p-4 bg-blue-50/50">
                       <p className="text-[9px] text-blue-600 font-bold leading-relaxed italic">
                         “专业工具编辑将自动检出 (Check-out) 资产，防止版本冲突。”
                       </p>
                    </div>
                  </div>
                )}
              </div>

              <button onClick={handleCite} disabled={isAlreadyCited || isCiting} className={`flex items-center gap-2 text-[11px] font-black px-5 py-2.5 rounded-2xl transition-all border ${isAlreadyCited ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-white text-blue-600 border-blue-100 hover:bg-blue-50'}`}>
                <i className={`fa-solid ${isAlreadyCited ? 'fa-check-double' : (isCiting ? 'fa-spinner animate-spin' : 'fa-share-from-square')}`}></i>
                {isAlreadyCited ? (lang === 'zh' ? '已添加引用' : 'Cited') : (lang === 'zh' ? '引用至报告' : 'Cite to Report')}
              </button>
            </div>
          </div>
          <div className="flex-1 relative overflow-hidden bg-slate-100">
             {renderViewport()}
          </div>
        </div>

        <aside className="w-[420px] flex flex-col gap-6 overflow-hidden shrink-0">
          <div className="flex-1 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8 overflow-y-auto">
            {asset.figureNote && (
              <div className="space-y-4 animate-fadeIn">
                  <SectionTitle icon="fa-quote-left" title={t_labels.figureNote} color="text-emerald-500" />
                  <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 relative group shadow-sm">
                    <p className="text-xs font-bold text-slate-600 leading-relaxed italic">“{asset.figureNote}”</p>
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg"><i className="fa-solid fa-sparkles text-xs animate-pulse"></i></div>
                  </div>
              </div>
            )}

            <div className="flex bg-slate-100 p-1 rounded-xl w-full">
              {['info', 'lineage', 'link'].map((tab) => (
                <button key={tab} onClick={() => setActiveAnalysisTab(tab as any)} className={`flex-1 px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeAnalysisTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                  {tab === 'info' ? (lang === 'zh' ? '元数据' : 'Metadata') : tab === 'lineage' ? (lang === 'zh' ? '数据追溯' : 'Trace') : (lang === 'zh' ? '语义关联' : 'Links')}
                </button>
              ))}
            </div>

            {activeAnalysisTab === 'info' && (
               <div className="space-y-8 animate-fadeIn">
                  <div className="space-y-4">
                     <SectionTitle icon="fa-gears" title={lang === 'zh' ? '核心技术指标' : 'Technical Indicators'} />
                     <div className="grid grid-cols-1 gap-1">
                        {[
                          { label: t_labels.owner, value: asset.source || '标准资产库' },
                          { label: t_labels.creation, value: asset.creationTime || asset.lastUpdate },
                          { label: '关联工区', value: asset.oilfield },
                          { label: '关联井号', value: asset.wellId || '未挂载' },
                          { label: '坐标系', value: asset.coordinateSystem || 'CGCS2000' }
                        ].map((item, idx) => (
                           <div key={idx} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                              <span className="text-[10px] text-slate-400 font-bold uppercase">{item.label}</span>
                              <span className="text-[11px] font-black text-slate-800">{item.value}</span>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-4">
                     <SectionTitle icon="fa-microchip" title={lang === 'zh' ? '五维业务语义坐标' : '5D Semantic Coordinates'} color="text-emerald-500" />
                     <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-4">
                        {[
                          { key: 'object', label: '对象 (Object)', icon: 'fa-cube', color: 'text-blue-500' },
                          { key: 'business', label: '业务 (Biz)', icon: 'fa-briefcase', color: 'text-indigo-500' },
                          { key: 'work', label: '工作 (Work)', icon: 'fa-hammer', color: 'text-emerald-500' },
                          { key: 'profession', label: '专业 (Prof)', icon: 'fa-microscope', color: 'text-amber-500' },
                          { key: 'process', label: '流程 (Proc)', icon: 'fa-diagram-project', color: 'text-slate-500' },
                        ].map(dim => (
                          <div key={dim.key} className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className={`w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center ${dim.color} border border-slate-100`}>
                                   <i className={`fa-solid ${dim.icon} text-[10px]`}></i>
                                </div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{dim.label}</span>
                             </div>
                             <span className="text-[11px] font-black text-slate-800 truncate max-w-[140px] text-right">
                               {(asset.coordinates5D as any)?.[dim.key] || '未挂载'}
                             </span>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
            )}
            {activeAnalysisTab === 'link' && <div className="animate-fadeIn"><AssetKnowledgeGraph /></div>}
            {activeAnalysisTab === 'lineage' && (
               <div className="space-y-6 animate-fadeIn">
                  <SectionTitle icon="fa-share-nodes" title="数据来源追溯" color="text-emerald-500" />
                  <div className="relative pl-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                    <div className="relative mb-6">
                       <div className="absolute -left-5 top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></div>
                       <p className="text-[10px] font-black text-slate-800 uppercase">源头数据 - 原始采集成果</p>
                       <p className="text-[9px] text-slate-400 mt-0.5">来源：勘探中心数据库</p>
                    </div>
                    <div className="relative">
                       <div className="absolute -left-5 top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm ring-2 ring-indigo-50"></div>
                       <p className="text-[10px] font-black text-indigo-600 uppercase">当前处理成果</p>
                       <p className="text-[9px] text-slate-400 mt-0.5">状态：正式入库</p>
                    </div>
                  </div>
               </div>
            )}
          </div>
        </aside>
      </div>

      {/* Intelligent Association Section */}
      <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 space-y-8 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-[20px] bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                <i className="fa-solid fa-wand-sparkles text-xl"></i>
             </div>
             <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">{lang === 'zh' ? '智能关联分析与推荐' : 'Intelligent Association'}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                    {lang === 'zh' ? '基于多维语义图谱的自动发现' : 'Multi-dimensional Semantic Linkage Discovery'}
                </p>
             </div>
          </div>
          <button onClick={() => setIsHeatmapOpen(true)} className="text-[10px] font-black text-blue-600 bg-blue-50 px-5 py-2.5 rounded-xl hover:bg-blue-100 transition-all uppercase tracking-widest">
            {lang === 'zh' ? '查看跨专业关联热图' : 'View Linkage Heatmap'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="space-y-4">
              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2"><i className="fa-solid fa-cube text-blue-500"></i> {lang === 'zh' ? '核心物理对象关联' : 'Object Association'}</h4>
              <div className="space-y-3">
                 {[
                   { name: asset.oilfield, type: '油气藏单元', icon: 'fa-mountain' },
                   { name: asset.wellId || '关键评估井', type: '物理实体井', icon: 'fa-bore-hole' },
                   { name: '中心集输站 B1', type: '地面基础设施', icon: 'fa-industry' }
                 ].map((obj, i) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-200 hover:bg-white transition-all group cursor-pointer shadow-sm">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors"><i className={`fa-solid ${obj.icon} text-xs`}></i></div>
                         <div>
                            <p className="text-xs font-black text-slate-800">{obj.name}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{obj.type}</p>
                         </div>
                      </div>
                      <i className="fa-solid fa-chevron-right text-[10px] text-slate-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"></i>
                   </div>
                 ))}
              </div>
           </div>

           <div className="space-y-4">
              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2"><i className="fa-solid fa-microscope text-emerald-500"></i> {lang === 'zh' ? '业务专业协同分析' : 'Professional Association'}</h4>
              <div className="flex flex-wrap gap-2">
                 {['地质', '物探', '油藏', '钻井', '地面'].map((prof, i) => (
                   <button key={i} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${prof === asset.profession ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg' : 'bg-white text-slate-500 border-slate-100 hover:border-emerald-300 hover:text-emerald-600'}`}>
                      {prof}
                   </button>
                 ))}
              </div>
           </div>

           <div className="space-y-4">
              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2"><i className="fa-solid fa-folder-tree text-indigo-500"></i> {lang === 'zh' ? '项目所属及同期成果推荐' : 'Project & Concurrent Recommendations'}</h4>
              <div className="space-y-3">
                 {concurrentAssets.map(ca => (
                   <div key={ca.id} onClick={() => onNavigate('detail', ca)} className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-slate-50 hover:border-indigo-200 hover:shadow-md transition-all group cursor-pointer">
                      <img src={ca.thumbnail} className="w-14 h-10 object-cover rounded-lg shadow-sm border border-slate-100" />
                      <div className="flex-1 min-w-0">
                         <p className="text-[11px] font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{ca.title}</p>
                         <p className="text-[9px] text-slate-400 font-bold uppercase">{ca.lastUpdate}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* Overlay Modal */}
      {isOverlayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200">
            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">{lang === 'zh' ? '图形叠加对比配置' : 'Overlay Configuration'}</h3>
              <button onClick={() => setIsOverlayModalOpen(false)} className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-all"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 grid grid-cols-3 gap-8">
              {MOCK_ASSETS.map(a => (
                <div key={a.id} onClick={() => setSelectedOverlayIds(prev => prev.includes(a.id) ? prev.filter(i => i !== a.id) : [...prev, a.id])} className={`p-4 rounded-[32px] border-2 transition-all cursor-pointer relative ${selectedOverlayIds.includes(a.id) ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'}`}>
                  <img src={a.thumbnail} className="w-full h-32 object-cover rounded-2xl mb-4" />
                  <h5 className="text-xs font-black text-slate-800 line-clamp-1">{a.title}</h5>
                </div>
              ))}
            </div>
            <div className="px-10 py-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4">
              <button onClick={() => setIsOverlayModalOpen(false)} className="px-8 py-3 text-sm font-black text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '取消' : 'Cancel'}</button>
              <button onClick={confirmOverlay} className="px-12 py-3 bg-blue-600 text-white text-sm font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-widest">{lang === 'zh' ? '开始对比分析' : 'Start Analysis'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetDetail;
