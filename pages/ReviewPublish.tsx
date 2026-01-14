
import React, { useState, useMemo } from 'react';
import { TRANSLATIONS } from '../constants';
import { GraphicAsset, CommonPageProps, Coordinates5D } from '../types';

interface ReviewPublishProps extends CommonPageProps {
  assets: GraphicAsset[];
  onUpdateAssets: (updatedAssets: GraphicAsset[]) => void;
}

// 增强版元数据接口
interface EnhancedGraphicAsset extends GraphicAsset {
  projectName: string;
  creationDate: string;
  mbuNode: string;
  confidence: number;
  author: string;
  department: string;
}

const MBU_OPTIONS = [
  '勘探部/地质研究室',
  '勘探部/物探研究室',
  '地质研究所/构造室',
  '采油一厂/工程技术站',
  '采油二厂/开发管理科',
  '总工办/标准化委员会'
];

const ReviewPublish: React.FC<ReviewPublishProps> = ({ lang, onNavigate, assets = [], onUpdateAssets }) => {
  const [activeTab, setActiveTab] = useState<'to-submit' | 'pending'>('pending');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const t = TRANSLATIONS[lang];

  // Map incoming assets to the enhanced metadata structure used in this page
  const currentAssets: EnhancedGraphicAsset[] = useMemo(() => {
    return (assets || []).map(a => ({
      ...a,
      projectName: (a as any).projectName || (a.oilfield + ' 2024 综合研究项目'),
      creationDate: (a as any).creationDate || (a.creationTime || '2024-03-15'),
      mbuNode: (a as any).mbuNode || '地质研究所/构造室',
      confidence: (a as any).confidence || 0.95,
      author: (a as any).author || '张工',
      department: (a as any).department || '地质勘探研究院'
    }));
  }, [assets]);

  const updateAssetStatus = (id: string, newStatus: 'draft' | 'review' | 'published') => {
    const updated = (assets || []).map(a => a.id === id ? ({ ...a, status: newStatus, lastUpdate: new Date().toISOString().split('T')[0] } as GraphicAsset) : a);
    onUpdateAssets(updated);
    setSelectedAssetId(null);
    setIsEditing(false);
  };

  const handleBatchApprove = () => {
    if ((selectedIds || []).length === 0) return;
    const updated = (assets || []).map(a => 
      (selectedIds || []).includes(a.id) ? ({ ...a, status: 'published', lastUpdate: new Date().toISOString().split('T')[0] } as GraphicAsset) : a
    );
    onUpdateAssets(updated);
    setSelectedIds([]);
    alert(lang === 'zh' ? `已成功批量通过 ${selectedIds.length} 份图件入库。` : `Successfully approved ${selectedIds.length} assets.`);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      (prev || []).includes(id) ? prev.filter(item => item !== id) : [...(prev || []), id]
    );
  };

  const toggleSelectAll = (filteredAssets: EnhancedGraphicAsset[]) => {
    const list = filteredAssets || [];
    if ((selectedIds || []).length === list.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(list.map(a => a.id));
    }
  };

  const handleUpdateAsset = (id: string, field: string, value: any) => {
    const updated = (assets || []).map(a => {
      if (a.id !== id) return a;
      
      if (field.startsWith('coord.')) {
        const coordKey = field.split('.')[1];
        return {
          ...a,
          coordinates5D: {
            ...(a.coordinates5D || { object: '', business: '', work: '', profession: '', process: '' }),
            [coordKey]: value
          }
        };
      }
      
      return { ...a, [field]: value };
    });
    onUpdateAssets(updated);
  };

  const handleDeleteAsset = (id: string) => {
    if (confirm(lang === 'zh' ? '确定删除该资产记录吗？此操作不可撤销。' : 'Are you sure you want to delete this asset?')) {
      const updated = (assets || []).filter(a => a.id !== id);
      onUpdateAssets(updated);
    }
  };

  const assetsByTab = useMemo(() => {
    return {
      'to-submit': currentAssets.filter(a => a.status === 'draft'),
      'pending': currentAssets.filter(a => a.status === 'review'),
    };
  }, [currentAssets]);

  const selectedAsset = useMemo(() => 
    currentAssets.find(a => a.id === selectedAssetId), 
  [selectedAssetId, currentAssets]);

  const counts = {
    'to-submit': assetsByTab['to-submit'].length,
    'pending': assetsByTab['pending'].length,
  };

  const SectionHeader = ({ title, icon, color = 'text-blue-600' }: { title: string, icon: string, color?: string }) => (
    <h5 className="font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
      <i className={`fa-solid ${icon} ${color}`}></i>
      <span className="text-slate-500">{title}</span>
    </h5>
  );

  const SVGViewer = () => (
    <div className="w-full h-full relative bg-[#0a0f1d] overflow-hidden flex items-center justify-center p-12 select-none">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-blue-500/20"></div>
      <div className="absolute top-1/2 left-0 right-0 h-px bg-blue-500/20"></div>
      
      <svg className="w-full h-full max-w-4xl drop-shadow-[0_0_50px_rgba(59,130,246,0.2)]" viewBox="0 0 800 600">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.4 }} />
            <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 0.4 }} />
          </linearGradient>
        </defs>
        <path d="M 100 400 Q 300 350 500 450 T 750 380" fill="none" stroke="#60a5fa" strokeWidth="2" strokeDasharray="8 4" className="animate-pulse" />
        <path d="M 50 200 L 750 220" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
        <path d="M 200 200 Q 400 150 600 200 L 600 400 Q 400 450 200 400 Z" fill="url(#grad1)" stroke="#3b82f6" strokeWidth="1" />
        <circle cx="400" cy="300" r="5" fill="#ef4444" />
        <text x="410" y="305" fill="#94a3b8" fontSize="10" fontWeight="bold">勘探井点 A-1</text>
        <line x1="650" y1="550" x2="750" y2="550" stroke="white" strokeWidth="2" />
        <text x="680" y="570" fill="white" fontSize="8">1 : 50,000</text>
      </svg>
    </div>
  );

  const renderDetail = (asset: EnhancedGraphicAsset) => {
    const canEdit = activeTab === 'to-submit' || isEditing;
    
    return (
      <div className="flex flex-col h-full gap-6 animate-fadeIn">
        <div className="bg-white px-8 py-5 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between">
           <div className="flex items-center gap-6">
              <button 
                onClick={() => { setSelectedAssetId(null); setIsEditing(false); }}
                className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all group"
              >
                 <i className="fa-solid fa-arrow-left transition-transform group-hover:-translate-x-1"></i>
              </button>
              <div className="h-10 w-px bg-slate-100"></div>
              <div>
                 <h3 className="text-base font-black text-slate-800 flex items-center gap-3">
                    {asset.title}
                    <span className="text-[10px] bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full font-black uppercase tracking-widest">{asset.version}</span>
                 </h3>
                 <p className="text-[11px] text-slate-400 font-bold mt-1">
                   资产标识：{asset.id} <span className="mx-2">|</span> 
                   置信度：<span className="text-emerald-500">{(asset.confidence * 100).toFixed(0)}%</span>
                 </p>
              </div>
           </div>
           <div className="flex gap-4">
              {activeTab === 'to-submit' && (
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-6 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${isEditing ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                >
                  <i className={`fa-solid ${isEditing ? 'fa-check' : 'fa-pen-to-square'}`}></i>
                  {isEditing ? '保存修改' : '修正元数据'}
                </button>
              )}
              <button className="px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-bold shadow-lg flex items-center gap-2 hover:bg-black transition-all">
                 <i className="fa-solid fa-download"></i>
                 下载矢量原稿
              </button>
           </div>
        </div>

        <div className="flex-1 flex gap-6 overflow-hidden">
          <div className="flex-1 bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
             <SVGViewer />
          </div>

          <aside className="w-[500px] flex flex-col gap-6 overflow-y-auto pr-1 pb-10">
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
               
               <div>
                  <SectionHeader title="基础业务属性" icon="fa-gears" color="text-blue-500" />
                  <div className="grid grid-cols-2 gap-4">
                     {[
                        { key: 'projectName', label: '所属科研项目', icon: 'fa-folder-tree' },
                        { key: 'profession', label: '专业领域', icon: 'fa-microscope' },
                        { key: 'oilfield', label: '关联区块', icon: 'fa-location-dot' },
                        { key: 'category', label: '图件分类', icon: 'fa-tags' },
                        { key: 'version', label: '版本号', icon: 'fa-code-branch' },
                        { key: 'creationDate', label: '生成日期', icon: 'fa-calendar-day', type: 'date' },
                     ].map((item) => (
                        <div key={item.key} className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{item.label}</label>
                           <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${canEdit ? 'bg-white border-blue-500 ring-4 ring-blue-50' : 'bg-slate-50 border-transparent text-slate-800'}`}>
                              <input 
                                 type={item.type || 'text'}
                                 disabled={!canEdit}
                                 value={String((asset as any)[item.key] || '')}
                                 onChange={(e) => handleUpdateAsset(asset.id, item.key, e.target.value)}
                                 className="flex-1 bg-transparent border-none text-[11px] font-bold outline-none truncate"
                              />
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="bg-blue-50/30 p-6 rounded-2xl border border-blue-50">
                  <SectionHeader title="五维语义坐标 (5D Semantic)" icon="fa-microchip" color="text-indigo-600" />
                  <div className="grid grid-cols-1 gap-3">
                     {[
                        { key: 'object', label: '物理对象 (Object)', icon: 'fa-cube' },
                        { key: 'business', label: '业务环节 (Business)', icon: 'fa-briefcase' },
                        { key: 'work', label: '工作任务 (Work)', icon: 'fa-hammer' },
                        { key: 'profession', label: '专业视角 (Profession)', icon: 'fa-eye' },
                        { key: 'process', label: '生命周期流程 (Process)', icon: 'fa-diagram-project' },
                     ].map((dim) => (
                        <div key={dim.key} className="flex items-center gap-4">
                           <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-indigo-500 shrink-0 border border-indigo-100">
                              <i className={`fa-solid ${dim.icon} text-[10px]`}></i>
                           </div>
                           <div className="flex-1 space-y-1">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{dim.label}</span>
                              <input 
                                 disabled={!canEdit}
                                 value={String((asset.coordinates5D as any)?.[dim.key] || '未定义')}
                                 onChange={(e) => handleUpdateAsset(asset.id, `coord.${dim.key}`, e.target.value)}
                                 className={`w-full bg-transparent border-none text-[11px] font-bold outline-none p-0 ${canEdit ? 'text-indigo-600 border-b border-indigo-200' : 'text-slate-700'}`}
                              />
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div>
                  <SectionHeader title="图注内容 (AI 自动识别)" icon="fa-quote-left" color="text-emerald-500" />
                  <div className="space-y-1.5">
                     <div className={`p-4 rounded-2xl border transition-all ${canEdit ? 'bg-white border-blue-500 ring-4 ring-blue-50' : 'bg-emerald-50/50 border-emerald-100/50'}`}>
                        <textarea 
                           disabled={!canEdit}
                           value={String(asset.figureNote || '')}
                           onChange={(e) => handleUpdateAsset(asset.id, 'figureNote', e.target.value)}
                           className={`w-full bg-transparent border-none text-[11px] font-bold outline-none leading-relaxed min-h-[100px] resize-none ${canEdit ? 'text-slate-800' : 'text-slate-600 italic'}`}
                           placeholder="此处显示 AI 自动识别的图注内容..."
                        />
                     </div>
                  </div>
               </div>

               <div>
                  <SectionHeader title="编制信息与溯源" icon="fa-user-shield" color="text-emerald-500" />
                  <div className="grid grid-cols-1 gap-4">
                     <div className="flex gap-4">
                        <div className="flex-1 space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">编制人员</label>
                           <div className={`flex items-center gap-3 p-3 rounded-xl border ${canEdit ? 'bg-white border-blue-500' : 'bg-slate-50 border-transparent'}`}>
                              <i className="fa-solid fa-user-pen text-xs text-slate-300"></i>
                              <input 
                                 disabled={!canEdit}
                                 value={String(asset.author || '')}
                                 onChange={(e) => handleUpdateAsset(asset.id, 'author', e.target.value)}
                                 className="flex-1 bg-transparent border-none text-[11px] font-bold outline-none"
                              />
                           </div>
                        </div>
                        <div className="flex-1 space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">来源部门</label>
                           <div className={`flex items-center gap-3 p-3 rounded-xl border ${canEdit ? 'bg-white border-blue-500' : 'bg-slate-50 border-transparent'}`}>
                              <i className="fa-solid fa-sitemap text-xs text-slate-300"></i>
                              <input 
                                 disabled={!canEdit}
                                 value={String(asset.department || '')}
                                 onChange={(e) => handleUpdateAsset(asset.id, 'department', e.target.value)}
                                 className="flex-1 bg-transparent border-none text-[11px] font-bold outline-none"
                              />
                           </div>
                        </div>
                     </div>
                     
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MBU 业务挂载节点</label>
                        <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${canEdit ? 'bg-white border-blue-500 ring-4 ring-blue-50' : 'bg-emerald-50 border-transparent'}`}>
                           <i className="fa-solid fa-link text-xs text-emerald-500"></i>
                           {canEdit ? (
                              <select 
                                 value={String(asset.mbuNode || '')}
                                 onChange={(e) => handleUpdateAsset(asset.id, 'mbuNode', e.target.value)}
                                 className="flex-1 bg-transparent border-none text-[11px] font-bold outline-none cursor-pointer"
                              >
                                 {(MBU_OPTIONS || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                           ) : (
                              <span className="text-[11px] font-bold text-emerald-800">{asset.mbuNode}</span>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-slate-900 text-white p-8 rounded-[32px] shadow-2xl space-y-6">
               <h4 className="font-bold text-sm text-blue-400 flex items-center gap-3">
                  <i className="fa-solid fa-clipboard-check"></i>
                  审核决策
               </h4>
               
               {activeTab === 'pending' ? (
                 <div className="space-y-4">
                    <textarea 
                       placeholder="在此输入专家评审意见..." 
                       className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs text-slate-300 outline-none resize-none h-20 placeholder:text-slate-600"
                    ></textarea>
                    <div className="grid grid-cols-2 gap-4">
                       <button onClick={() => updateAssetStatus(asset.id, 'published')} className="bg-emerald-600 hover:bg-emerald-500 py-4 rounded-xl font-black text-sm shadow-xl shadow-emerald-600/10 transition-all flex items-center justify-center gap-2">
                          <i className="fa-solid fa-check"></i>
                          通过并入库
                       </button>
                       <button onClick={() => updateAssetStatus(asset.id, 'draft')} className="bg-rose-600 hover:bg-rose-500 py-4 rounded-xl font-black text-sm transition-all shadow-xl flex items-center justify-center gap-2">
                          <i className="fa-solid fa-xmark"></i>
                          驳回修改
                       </button>
                    </div>
                 </div>
               ) : (
                 <div className="space-y-4">
                    <p className="text-[11px] text-slate-400 italic leading-relaxed">请核对元数据，确认无误后提交评审。</p>
                    <button onClick={() => updateAssetStatus(asset.id, 'review')} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-black text-sm transition-all shadow-xl shadow-blue-500/10 flex items-center justify-center gap-3">
                       <i className="fa-solid fa-rocket"></i>
                       提交发布评审
                    </button>
                 </div>
               )}
            </div>
          </aside>
        </div>
      </div>
    );
  };

  const renderListView = (tabAssets: EnhancedGraphicAsset[] = []) => (
    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
          <tr>
            {activeTab === 'pending' && (
              <th className="px-8 py-5 w-12 text-center">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 cursor-pointer"
                  checked={(selectedIds || []).length === (tabAssets || []).length && (tabAssets || []).length > 0}
                  onChange={() => toggleSelectAll(tabAssets || [])}
                />
              </th>
            )}
            <th className="px-8 py-5">图形资产摘要</th>
            <th className="px-8 py-5">编制人/部门</th>
            <th className="px-8 py-5">专业领域</th>
            <th className="px-8 py-5">五维坐标状态</th>
            <th className="px-8 py-5 text-center">AI 置信度</th>
            <th className="px-8 py-5 text-right">管理操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {(tabAssets || []).map(asset => (
            <tr 
              key={asset.id} 
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.tagName !== 'INPUT') setSelectedAssetId(asset.id);
              }}
              className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
            >
              {activeTab === 'pending' && (
                <td className="px-8 py-5 w-12 text-center">
                   <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 cursor-pointer"
                    checked={(selectedIds || []).includes(asset.id)}
                    onChange={(e) => { e.stopPropagation(); toggleSelection(asset.id); }}
                  />
                </td>
              )}
              <td className="px-8 py-5">
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-10 rounded-lg overflow-hidden shadow-sm border border-slate-100 bg-slate-100">
                    <img src={asset.thumbnail} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      {asset.title}
                      <span className="text-[9px] font-black text-blue-500 px-1.5 bg-blue-50 rounded">{asset.version}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px] italic">“{asset.figureNote}”</div>
                  </div>
                </div>
              </td>
              <td className="px-8 py-5">
                 <div className="text-xs font-bold text-slate-600">{asset.author}</div>
                 <div className="text-[9px] text-slate-400">{asset.department}</div>
              </td>
              <td className="px-8 py-5 text-xs font-bold text-slate-600">{asset.profession}</td>
              <td className="px-8 py-5">
                 <div className="flex items-center gap-1.5">
                    {[1,2,3,4,5].map(i => (
                       <div key={i} className={`w-1.5 h-1.5 rounded-full ${asset.coordinates5D ? 'bg-indigo-500' : 'bg-slate-200'}`}></div>
                    ))}
                    <span className="text-[9px] font-black text-indigo-500 ml-1">5D READY</span>
                 </div>
              </td>
              <td className="px-8 py-5">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${(asset.confidence || 0) * 100}%` }}></div>
                  </div>
                  <span className="text-[9px] font-black text-emerald-600">{((asset.confidence || 0) * 100).toFixed(0)}%</span>
                </div>
              </td>
              <td className="px-8 py-5 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {activeTab === 'to-submit' ? (
                    <>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedAssetId(asset.id); setIsEditing(true); }}
                        className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      >
                        <i className="fa-solid fa-pen-to-square text-[10px]"></i>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteAsset(asset.id); }}
                        className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                      >
                        <i className="fa-solid fa-trash-can text-[10px]"></i>
                      </button>
                    </>
                  ) : (
                    <button className="bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-lg shadow-lg">进入审核</button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {(tabAssets || []).length === 0 && <EmptyState />}
    </div>
  );

  const renderGridView = (tabAssets: EnhancedGraphicAsset[] = []) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {(tabAssets || []).map(asset => (
        <div 
          key={asset.id}
          onClick={() => setSelectedAssetId(asset.id)}
          className={`bg-white rounded-[32px] border shadow-sm overflow-hidden group/card transition-all cursor-pointer flex flex-col relative ${
            (selectedIds || []).includes(asset.id) ? 'ring-4 ring-blue-500 border-blue-500' : 'border-slate-100 hover:ring-4 hover:ring-blue-500/10'
          }`}
        >
          <div className="relative h-44 overflow-hidden bg-slate-900 flex items-center justify-center">
            <img src={asset.thumbnail} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700 opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
            
            {activeTab === 'pending' && (
              <div 
                className={`absolute top-4 left-4 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all z-20 ${
                  (selectedIds || []).includes(asset.id) ? 'bg-blue-600 border-blue-600' : 'bg-white/10 backdrop-blur border-white/20'
                }`}
                onClick={(e) => { e.stopPropagation(); toggleSelection(asset.id); }}
              >
                {(selectedIds || []).includes(asset.id) && <i className="fa-solid fa-check text-white text-[10px]"></i>}
              </div>
            )}

            <div className="absolute bottom-4 left-4 right-4">
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-0.5">{asset.author} • {asset.department}</span>
              <h4 className="text-white font-black text-sm truncate">{asset.title}</h4>
            </div>
          </div>
          
          <div className="p-6 flex-1 flex flex-col justify-between bg-white">
            <div className="space-y-3">
               <div className="flex justify-between items-center text-[10px]">
                 <span className="text-slate-400 font-black uppercase tracking-widest">专业领域</span>
                 <span className="text-slate-800 font-black">{asset.profession}</span>
               </div>
               <div className="flex justify-between items-center text-[10px]">
                 <span className="text-slate-400 font-black uppercase tracking-widest">AI 置信度</span>
                 <div className="flex items-center gap-2">
                    <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500" style={{ width: `${(asset.confidence || 0) * 100}%` }}></div>
                    </div>
                    <span className="text-emerald-500 font-black">{((asset.confidence || 0) * 100).toFixed(0)}%</span>
                 </div>
               </div>
               {asset.figureNote && (
                 <p className="text-[9px] text-slate-400 italic line-clamp-2 mt-2 leading-relaxed bg-slate-50 p-2 rounded-lg">“{asset.figureNote}”</p>
               )}
            </div>
            
            <div className="pt-4 mt-4 border-t border-slate-50 flex items-center justify-between">
              <span className="text-[10px] text-slate-300 font-bold">{asset.lastUpdate}</span>
              <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-black">{asset.version}</span>
            </div>
          </div>
        </div>
      ))}
      {(tabAssets || []).length === 0 && <EmptyState />}
    </div>
  );

  const EmptyState = () => (
    <div className="col-span-full py-32 flex flex-col items-center justify-center bg-white rounded-[40px] border-4 border-dashed border-slate-50">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 text-4xl mb-6">
        <i className="fa-solid fa-folder-open"></i>
      </div>
      <h3 className="text-lg font-black text-slate-300 tracking-tight">该环节下暂无成果</h3>
    </div>
  );

  return (
    <div className="h-full flex flex-col gap-6 animate-fadeIn pb-24">
      {!selectedAssetId && (
        <div className="flex items-center justify-between">
           <div className="bg-white p-2 rounded-[28px] border border-slate-100 shadow-sm flex gap-2">
              {[
                { id: 'to-submit', label: '待提交草稿', icon: 'fa-file-signature', count: counts['to-submit'], color: 'text-slate-400' },
                { id: 'pending', label: '待专家评审', icon: 'fa-shield-halved', count: counts['pending'], color: 'text-amber-500', urgent: counts['pending'] > 0 },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); setSelectedAssetId(null); setSelectedIds([]); }}
                  className={`relative flex items-center gap-3 px-6 py-3.5 rounded-2xl transition-all font-black text-sm ${
                    activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-xl' 
                    : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <i className={`fa-solid ${tab.icon} ${activeTab === tab.id ? 'text-white' : tab.color}`}></i>
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`min-w-[20px] h-5 rounded-full px-1.5 text-[9px] font-black flex items-center justify-center ${
                      activeTab === tab.id ? 'bg-white text-blue-600' : (tab.urgent ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500')
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
           </div>
           
           <div className="flex items-center gap-4">
              <div className="bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm flex gap-1">
                 <button onClick={() => setViewMode('grid')} className={`w-10 h-10 rounded-xl flex items-center justify-center ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}><i className="fa-solid fa-table-cells-large text-xs"></i></button>
                 <button onClick={() => setViewMode('list')} className={`w-10 h-10 rounded-xl flex items-center justify-center ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}><i className="fa-solid fa-list text-xs"></i></button>
              </div>
           </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pr-1">
        {selectedAssetId && selectedAsset ? (
           renderDetail(selectedAsset)
        ) : (
           viewMode === 'grid' ? renderGridView(assetsByTab[activeTab] || []) : renderListView(assetsByTab[activeTab] || [])
        )}
      </div>
    </div>
  );
};

export default ReviewPublish;
