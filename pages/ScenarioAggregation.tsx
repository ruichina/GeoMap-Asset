
import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_ASSETS } from '../constants';
import { PageId, GraphicAsset } from '../types';

// --- Type Definitions ---

interface ScenarioStageRule {
  id: string;
  name: string;
  requiredCategories: string[];
}

interface ScenarioDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  stages: ScenarioStageRule[];
  updatedAt: string;
}

// --- Initial Data ---

const INITIAL_SCENARIOS: ScenarioDefinition[] = [
  { 
    id: '1', 
    name: '新井评价会战', 
    icon: 'fa-droplet', 
    description: '针对新井评价阶段，聚合构造、沉积及储量相关图件，辅助钻探决策。',
    updatedAt: '2024-03-20',
    stages: [
      { id: 's1-1', name: '地质背景认识', requiredCategories: ['勘探图件', '地质剖面'] },
      { id: 's1-2', name: '储层精细评价', requiredCategories: ['开发模型', '三维模型', '物探成果'] },
      { id: 's1-3', name: '井位部署决策', requiredCategories: ['工程设计', '工程图纸'] }
    ]
  },
  { 
    id: '2', 
    name: '老区挖潜综合治理', 
    icon: 'fa-layer-group', 
    description: '针对高含水期油田，重点展示注采关系、剩余油分布及调整方案。',
    updatedAt: '2024-03-15',
    stages: [
      { id: 's2-1', name: '生产现状诊断', requiredCategories: ['生产运行', '监测图件', '仪表盘'] },
      { id: 's2-2', name: '剩余油分布研究', requiredCategories: ['开发模型', '三维模型', '数据体图形'] },
      { id: 's2-3', name: '调整方案编制', requiredCategories: ['工程设计', '地面工程'] }
    ]
  },
  { 
    id: '3', 
    name: '地面工程优化', 
    icon: 'fa-network-wired', 
    description: '聚焦地面管网、集输系统及巡检影像，优化地面设施布局。',
    updatedAt: '2024-02-10',
    stages: [
      { id: 's3-1', name: '现状拓扑分析', requiredCategories: ['地面工程', '生产运行'] },
      { id: 's3-2', name: '现场巡检反馈', requiredCategories: ['巡检影像'] }
    ]
  }
];

const ALL_CATEGORIES = Array.from(new Set(MOCK_ASSETS.map(a => a.category)));
const ICONS = ['fa-droplet', 'fa-cubes', 'fa-layer-group', 'fa-network-wired', 'fa-bore-hole', 'fa-mountain-sun', 'fa-flask', 'fa-life-ring', 'fa-clipboard-check'];

const ScenarioAggregation: React.FC<{ onNavigate: (page: PageId, data?: any) => void }> = ({ onNavigate }) => {
  const [viewMode, setViewMode] = useState<'usage' | 'config'>('usage');
  const [scenarios, setScenarios] = useState<ScenarioDefinition[]>(INITIAL_SCENARIOS);
  
  // --- Usage Mode State ---
  const [activeScenarioId, setActiveScenarioId] = useState<string>(INITIAL_SCENARIOS[0].id);
  const [selectedObject, setSelectedObject] = useState<string>(''); // Holds the object name (e.g. "Saertu")

  // --- Config Mode State ---
  const [configSelectedId, setConfigSelectedId] = useState<string | null>(INITIAL_SCENARIOS[0].id);
  // Draft state for the form on the right side of config
  const [draftScenario, setDraftScenario] = useState<ScenarioDefinition | null>(null);

  // --- Derived Data ---

  // All unique objects available in the system
  const availableObjects = useMemo(() => {
    const objs = new Set<string>();
    MOCK_ASSETS.forEach(a => {
      if (a.oilfield) objs.add(a.oilfield);
      if (a.wellId) objs.add(a.wellId);
      if (a.coordinates5D?.object) objs.add(a.coordinates5D.object);
    });
    return Array.from(objs).sort();
  }, []);

  const activeScenario = useMemo(() => 
    scenarios.find(s => s.id === activeScenarioId) || scenarios[0], 
  [activeScenarioId, scenarios]);

  // Filter assets for Usage View
  const usageAssets = useMemo(() => {
    if (!selectedObject) return [];
    return MOCK_ASSETS.filter(a => 
      a.oilfield === selectedObject || 
      a.wellId === selectedObject || 
      a.coordinates5D?.object === selectedObject
    );
  }, [selectedObject]);

  // Group assets by stage for Usage View
  const timelineData = useMemo(() => {
    if (!selectedObject) return [];
    return activeScenario.stages.map(stage => {
      const assetsInStage = usageAssets.filter(asset => 
        stage.requiredCategories.includes(asset.category)
      );
      return {
        stageName: stage.name,
        required: stage.requiredCategories,
        assets: assetsInStage
      };
    }).filter(group => group.assets.length > 0 || group.required.length > 0); 
    // Keep stages even if empty to show what's missing, or filter? Let's show all defined stages.
  }, [activeScenario, usageAssets, selectedObject]);


  // --- Config Effects ---

  // When selecting a scenario in config list, load it into draft
  useEffect(() => {
    if (configSelectedId) {
      const found = scenarios.find(s => s.id === configSelectedId);
      if (found) {
        setDraftScenario(JSON.parse(JSON.stringify(found)));
      }
    } else {
      setDraftScenario(null);
    }
  }, [configSelectedId, scenarios]);

  // --- Config Handlers ---

  const handleAddNewScenario = () => {
    const newScenario: ScenarioDefinition = {
      id: Date.now().toString(),
      name: '未命名场景',
      icon: 'fa-layer-group',
      description: '请输入场景描述...',
      stages: [{ id: `st-${Date.now()}`, name: '阶段一', requiredCategories: [] }],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setScenarios([...scenarios, newScenario]);
    setConfigSelectedId(newScenario.id);
  };

  const handleDeleteScenario = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (scenarios.length <= 1) return alert('至少保留一个场景');
    if (confirm('确定删除此场景吗？')) {
      const next = scenarios.filter(s => s.id !== id);
      setScenarios(next);
      if (configSelectedId === id) setConfigSelectedId(next[0].id);
    }
  };

  const handleDraftChange = (field: keyof ScenarioDefinition, value: any) => {
    if (!draftScenario) return;
    setDraftScenario({ ...draftScenario, [field]: value });
  };

  const handleStageChange = (idx: number, field: keyof ScenarioStageRule, value: any) => {
    if (!draftScenario) return;
    const newStages = [...draftScenario.stages];
    newStages[idx] = { ...newStages[idx], [field]: value };
    setDraftScenario({ ...draftScenario, stages: newStages });
  };

  const toggleCategory = (stageIdx: number, cat: string) => {
    if (!draftScenario) return;
    const stage = draftScenario.stages[stageIdx];
    const newCats = stage.requiredCategories.includes(cat)
      ? stage.requiredCategories.filter(c => c !== cat)
      : [...stage.requiredCategories, cat];
    handleStageChange(stageIdx, 'requiredCategories', newCats);
  };

  const addStage = () => {
    if (!draftScenario) return;
    setDraftScenario({
      ...draftScenario,
      stages: [...draftScenario.stages, { id: `st-${Date.now()}`, name: '新阶段', requiredCategories: [] }]
    });
  };

  const removeStage = (idx: number) => {
    if (!draftScenario) return;
    const newStages = [...draftScenario.stages];
    newStages.splice(idx, 1);
    setDraftScenario({ ...draftScenario, stages: newStages });
  };

  const saveDraft = () => {
    if (!draftScenario) return;
    setScenarios(prev => prev.map(s => s.id === draftScenario.id ? draftScenario : s));
    alert('场景配置已保存');
  };

  // --- Render ---

  if (viewMode === 'config') {
    return (
      <div className="h-full flex flex-col animate-fadeIn">
        {/* Config Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-100 shrink-0">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setViewMode('usage')}
                className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-all group"
                title="返回使用模式"
              >
                <i className="fa-solid fa-arrow-left group-hover:-translate-x-0.5 transition-transform"></i>
              </button>
              <div className="h-6 w-px bg-slate-200"></div>
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                    <i className="fa-solid fa-gears"></i>
                 </div>
                 <div>
                    <h2 className="font-black text-slate-800 text-sm">业务场景配置中心</h2>
                    <p className="text-[10px] text-slate-400 font-medium">Scenario Configuration</p>
                 </div>
              </div>
           </div>
           {/* Right side actions placeholder */}
           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Administrator Mode
           </div>
        </header>

        {/* Config Content: Master-Detail */}
        <div className="flex-1 flex overflow-hidden bg-slate-50">
           {/* Left Sidebar: List */}
           <aside className="w-80 bg-white border-r border-slate-100 flex flex-col">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                 <span className="text-xs font-black text-slate-400 uppercase tracking-widest">场景列表</span>
                 <button onClick={handleAddNewScenario} className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center"><i className="fa-solid fa-plus text-[10px]"></i></button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                 {scenarios.map(s => (
                    <div 
                      key={s.id}
                      onClick={() => setConfigSelectedId(s.id)}
                      className={`p-3 rounded-xl cursor-pointer flex items-center gap-3 transition-all group ${configSelectedId === s.id ? 'bg-blue-50 border border-blue-200 shadow-sm' : 'hover:bg-slate-50 border border-transparent'}`}
                    >
                       <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${configSelectedId === s.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          <i className={`fa-solid ${s.icon}`}></i>
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs text-slate-800 truncate">{s.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{s.stages.length} 个阶段</div>
                       </div>
                       <button onClick={(e) => handleDeleteScenario(e, s.id)} className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                          <i className="fa-solid fa-trash-can text-[10px]"></i>
                       </button>
                    </div>
                 ))}
              </div>
           </aside>

           {/* Right Panel: Editor */}
           <main className="flex-1 overflow-y-auto p-8">
              {draftScenario ? (
                 <div className="max-w-3xl mx-auto space-y-8 pb-20">
                    {/* Basic Info */}
                    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm space-y-6">
                       <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-l-4 border-blue-600 pl-3">基本信息</h3>
                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold text-slate-400 uppercase">场景名称</label>
                             <input 
                               type="text" 
                               value={draftScenario.name} 
                               onChange={(e) => handleDraftChange('name', e.target.value)}
                               className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-blue-500 outline-none"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold text-slate-400 uppercase">图标</label>
                             <div className="flex gap-2 flex-wrap">
                                {ICONS.map(icon => (
                                   <button 
                                     key={icon}
                                     onClick={() => handleDraftChange('icon', icon)}
                                     className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${draftScenario.icon === icon ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                   >
                                      <i className={`fa-solid ${icon} text-xs`}></i>
                                   </button>
                                ))}
                             </div>
                          </div>
                          <div className="col-span-2 space-y-2">
                             <label className="text-[10px] font-bold text-slate-400 uppercase">场景描述</label>
                             <textarea 
                               value={draftScenario.description}
                               onChange={(e) => handleDraftChange('description', e.target.value)}
                               className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-blue-500 outline-none resize-none h-20"
                             />
                          </div>
                       </div>
                    </div>

                    {/* Stages Config */}
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-l-4 border-emerald-500 pl-3">阶段与规则配置</h3>
                          <button onClick={addStage} className="text-emerald-600 text-xs font-bold hover:underline">+ 添加阶段</button>
                       </div>
                       
                       {draftScenario.stages.map((stage, idx) => (
                          <div key={stage.id} className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm relative group">
                             <div className="flex items-center gap-4 mb-4">
                                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">{idx + 1}</span>
                                <input 
                                  type="text" 
                                  value={stage.name}
                                  onChange={(e) => handleStageChange(idx, 'name', e.target.value)}
                                  className="font-bold text-sm text-slate-800 border-b border-transparent focus:border-blue-500 outline-none hover:border-slate-200 transition-colors"
                                  placeholder="阶段名称"
                                />
                                <button onClick={() => removeStage(idx)} className="ml-auto text-slate-300 hover:text-rose-500"><i className="fa-solid fa-trash-can"></i></button>
                             </div>
                             <div className="bg-slate-50 p-4 rounded-xl">
                                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-2">包含图件类型 (点击选择)</label>
                                <div className="flex flex-wrap gap-2">
                                   {ALL_CATEGORIES.map(cat => {
                                      const isSelected = stage.requiredCategories.includes(cat);
                                      return (
                                         <button 
                                           key={cat}
                                           onClick={() => toggleCategory(idx, cat)}
                                           className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all border ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'}`}
                                         >
                                            {cat}
                                         </button>
                                      )
                                   })}
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>

                    <div className="flex justify-end pt-6 border-t border-slate-200">
                       <button onClick={saveDraft} className="px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-black hover:bg-black shadow-lg transition-all">保存配置</button>
                    </div>
                 </div>
              ) : (
                 <div className="h-full flex items-center justify-center text-slate-400">请选择一个场景进行编辑</div>
              )}
           </main>
        </div>
      </div>
    );
  }

  // --- Usage Mode ---
  return (
    <div className="h-full flex flex-col gap-6 animate-fadeIn pb-10">
      {/* 1. Header: Scenario Tabs & Mode Switch */}
      <div className="flex items-center justify-between px-2 shrink-0">
         <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
            {scenarios.map(s => (
               <button 
                  key={s.id}
                  onClick={() => { setActiveScenarioId(s.id); }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                     activeScenarioId === s.id 
                     ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' 
                     : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
                  }`}
               >
                  <i className={`fa-solid ${s.icon}`}></i>
                  {s.name}
               </button>
            ))}
         </div>
         <button 
            onClick={() => setViewMode('config')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-200 transition-all shrink-0 ml-4"
         >
            <i className="fa-solid fa-gears"></i>
            场景配置
         </button>
      </div>

      {/* 2. Main Area */}
      <div className="flex-1 bg-white rounded-[40px] border border-slate-100 shadow-sm flex flex-col overflow-hidden relative">
         
         {/* Object Selector Bar & Active Scenario Card */}
         <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-blue-50/80 to-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 z-10">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 rounded-3xl bg-white shadow-lg border border-white flex items-center justify-center text-blue-600 text-2xl">
                  <i className={`fa-solid ${activeScenario.icon}`}></i>
               </div>
               <div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-2">{activeScenario.name}</h2>
                  <p className="text-xs text-slate-500 max-w-lg leading-relaxed">{activeScenario.description}</p>
               </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-2 pl-4 rounded-2xl border border-blue-100 shadow-sm">
               <span className="text-sm font-black text-blue-500 uppercase tracking-widest">聚焦对象:</span>
               <div className="relative group">
                  <select 
                     value={selectedObject} 
                     onChange={(e) => setSelectedObject(e.target.value)}
                     className="appearance-none bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 pl-5 pr-10 rounded-xl outline-none cursor-pointer transition-all min-w-[200px] shadow-lg"
                  >
                     <option value="" className="bg-slate-900 text-slate-400">请选择业务对象...</option>
                     {availableObjects.map(obj => <option key={obj} value={obj} className="bg-slate-900 text-white">{obj}</option>)}
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-white/50 text-[10px] pointer-events-none"></i>
               </div>
            </div>
         </div>

         {/* Content Area */}
         <div className="flex-1 overflow-y-auto p-8 relative bg-slate-50/30">
            {!selectedObject ? (
               // Empty State
               <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                  <div className="w-24 h-24 bg-slate-100 rounded-[40px] flex items-center justify-center mb-6 animate-pulse">
                     <i className="fa-solid fa-arrow-pointer text-4xl opacity-20"></i>
                  </div>
                  <h3 className="text-lg font-black text-slate-400">请先选择业务对象</h3>
                  <p className="text-xs mt-2 font-medium">选择对象后，系统将根据“{activeScenario.name}”规则自动聚合图件</p>
               </div>
            ) : (
               // Timeline View
               <div className="max-w-5xl mx-auto pb-10">
                  {/* Timeline Line */}
                  <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-slate-200"></div>

                  {timelineData.length > 0 ? timelineData.map((group, idx) => (
                     <div key={idx} className="relative pl-16 mb-12 animate-slideUp" style={{ animationDelay: `${idx * 100}ms` }}>
                        {/* Node */}
                        <div className="absolute left-8 top-0 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-4 border-blue-100 flex items-center justify-center z-10 shadow-sm">
                           <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                        </div>

                        {/* Stage Header */}
                        <div className="mb-4 flex items-center gap-3">
                           <h3 className="text-sm font-black text-slate-800">{group.stageName}</h3>
                           <div className="flex gap-1">
                              {group.required.map(req => (
                                 <span key={req} className="text-[9px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded font-bold">{req}</span>
                              ))}
                           </div>
                        </div>

                        {/* Assets Grid */}
                        {group.assets.length > 0 ? (
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {group.assets.map(asset => (
                                 <div 
                                    key={asset.id}
                                    onClick={() => onNavigate('detail', asset)}
                                    className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group flex gap-3"
                                 >
                                    <div className="w-20 h-16 shrink-0 rounded-xl bg-slate-100 overflow-hidden relative">
                                       <img src={asset.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                       <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white text-[8px]">
                                          <i className="fa-solid fa-arrow-right -rotate-45 group-hover:rotate-0 transition-transform"></i>
                                       </div>
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                       <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">{asset.title}</h4>
                                       <div className="flex items-center gap-2 mt-1">
                                          <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-black">{asset.category}</span>
                                          <span className="text-[9px] text-slate-400 font-mono">{asset.version}</span>
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <div className="p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center">
                              <span className="text-[10px] font-bold text-slate-400">该阶段暂无匹配图件</span>
                           </div>
                        )}
                     </div>
                  )) : (
                     <div className="pl-16 pt-4 text-slate-400 text-sm font-bold">
                        当前对象在此场景下未找到任何相关图件。
                     </div>
                  )}
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default ScenarioAggregation;
