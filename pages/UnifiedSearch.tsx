
import React, { useState, useMemo } from 'react';
import { MOCK_ASSETS } from '../constants';
import { PageId, GraphicAsset } from '../types';

interface UnifiedSearchProps {
  onNavigate: (page: PageId, data?: any) => void;
}

interface FilterState {
  oilfield: string[];
  spatialRelation: string[];
  stage: string[];
  profession: string[];
  graphicType: string[];
}

const UnifiedSearch: React.FC<UnifiedSearchProps> = ({ onNavigate }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    oilfield: [],
    spatialRelation: [],
    stage: [],
    profession: [],
    graphicType: [],
  });

  const basePublishedAssets = useMemo(() => {
    return MOCK_ASSETS.filter(asset => asset.status === 'published');
  }, []);

  // Calculate filtered assets based on selected checkboxes AND search query
  const filteredAssets = useMemo(() => {
    return basePublishedAssets.filter(asset => {
      const matchOilfield = selectedFilters.oilfield.length === 0 || selectedFilters.oilfield.includes(asset.oilfield);
      const matchSpatial = selectedFilters.spatialRelation.length === 0 || (asset.spatialRelation && selectedFilters.spatialRelation.includes(asset.spatialRelation));
      const matchProfession = selectedFilters.profession.length === 0 || selectedFilters.profession.includes(asset.profession);
      const matchType = selectedFilters.graphicType.length === 0 || selectedFilters.graphicType.includes(asset.graphicType || 'static');
      const matchStage = selectedFilters.stage.length === 0 || selectedFilters.stage.some(s => asset.stage?.includes(s));
      
      const query = searchQuery.trim().toLowerCase();
      const matchSearch = query === '' || 
        asset.title.toLowerCase().includes(query) ||
        asset.tags.some(t => t.toLowerCase().includes(query)) ||
        asset.oilfield.toLowerCase().includes(query) ||
        asset.profession.toLowerCase().includes(query);

      return matchOilfield && matchSpatial && matchProfession && matchType && matchStage && matchSearch;
    });
  }, [basePublishedAssets, selectedFilters, searchQuery]);

  // Calculate counts for each filter category based on base published assets
  const filterCounts = useMemo(() => {
    const oilfieldCounts: Record<string, number> = {};
    const spatialCounts: Record<string, number> = {
      '高空': 0,
      '地表': 0,
      '地面': 0,
      '水下': 0,
      '地下': 0
    };
    const stageCounts: Record<string, number> = {};
    const professionCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {
      'static': 0,
      'dynamic': 0,
      'datavolume': 0
    };

    basePublishedAssets.forEach(asset => {
      oilfieldCounts[asset.oilfield] = (oilfieldCounts[asset.oilfield] || 0) + 1;
      if (asset.spatialRelation) {
        spatialCounts[asset.spatialRelation] = (spatialCounts[asset.spatialRelation] || 0) + 1;
      }
      professionCounts[asset.profession] = (professionCounts[asset.profession] || 0) + 1;
      ['勘探', '评价', '开发', '生产'].forEach(s => {
        if (asset.stage?.includes(s)) {
          stageCounts[s] = (stageCounts[s] || 0) + 1;
        }
      });
      if (asset.graphicType) {
        typeCounts[asset.graphicType] = (typeCounts[asset.graphicType] || 0) + 1;
      }
    });

    return { oilfieldCounts, spatialCounts, stageCounts, professionCounts, typeCounts };
  }, [basePublishedAssets]);

  const handleToggleFilter = (category: keyof FilterState, value: string) => {
    setSelectedFilters(prev => {
      const current = prev[category];
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [category]: next };
    });
  };

  const handleReset = () => {
    setSelectedFilters({
      oilfield: [],
      spatialRelation: [],
      stage: [],
      profession: [],
      graphicType: [],
    });
    setSearchQuery('');
  };

  const filterConfigs = [
    { 
      label: '空间关系 (位置分层)', 
      field: 'spatialRelation' as const,
      options: [
        { name: '高空 (High Altitude)', value: '高空', count: filterCounts.spatialCounts['高空'] || 0 },
        { name: '地表 (Surface Boundary)', value: '地表', count: filterCounts.spatialCounts['地表'] || 0 },
        { name: '地面 (Ground Level)', value: '地面', count: filterCounts.spatialCounts['地面'] || 0 },
        { name: '水下 (Underwater)', value: '水下', count: filterCounts.spatialCounts['水下'] || 0 },
        { name: '地下 (Subsurface)', value: '地下', count: filterCounts.spatialCounts['地下'] || 0 },
      ]
    },
    { 
      label: '油气藏 / 区块', 
      field: 'oilfield' as const,
      options: [
        { name: '萨尔图', count: filterCounts.oilfieldCounts['萨尔图'] || 0 },
        { name: '顺北5号', count: filterCounts.oilfieldCounts['顺北5号'] || 0 },
        { name: 'JZ9-3', count: filterCounts.oilfieldCounts['JZ9-3'] || 0 },
        { name: '威远-长宁', count: filterCounts.oilfieldCounts['威远-长宁'] || 0 },
        { name: '哈拉哈塘', count: filterCounts.oilfieldCounts['哈拉哈塘'] || 0 },
        { name: '渤海湾', count: filterCounts.oilfieldCounts['渤海湾'] || 0 },
        { name: '胜利东部', count: filterCounts.oilfieldCounts['胜利东部'] || 0 },
        { name: '大庆', count: filterCounts.oilfieldCounts['大庆'] || 0 },
        { name: '安塞', count: filterCounts.oilfieldCounts['安塞'] || 0 },
      ]
    },
    { 
      label: '阶段', 
      field: 'stage' as const,
      options: [
        { name: '勘探', count: filterCounts.stageCounts['勘探'] || 0 },
        { name: '评价', count: filterCounts.stageCounts['评价'] || 0 },
        { name: '开发', count: filterCounts.stageCounts['开发'] || 0 },
        { name: '生产', count: filterCounts.stageCounts['生产'] || 0 },
      ]
    },
    { 
      label: '专业领域', 
      field: 'profession' as const,
      options: [
        { name: '地质', count: filterCounts.professionCounts['地质'] || 0 },
        { name: '地球物理', count: filterCounts.professionCounts['地球物理'] || 0 },
        { name: '油藏工程', count: filterCounts.professionCounts['油藏工程'] || 0 },
        { name: '配管', count: filterCounts.professionCounts['配管'] || 0 },
        { name: '钻井工程', count: filterCounts.professionCounts['钻井工程'] || 0 },
        { name: '地面工程', count: filterCounts.professionCounts['地面工程'] || 0 },
      ]
    },
    { 
      label: '图形类型', 
      field: 'graphicType' as const,
      options: [
        { name: '静态图', value: 'static', count: filterCounts.typeCounts['static'] || 0 },
        { name: '动态图', value: 'dynamic', count: filterCounts.typeCounts['dynamic'] || 0 },
        { name: '数据体图形', value: 'datavolume', count: filterCounts.typeCounts['datavolume'] || 0 },
      ]
    },
  ];

  return (
    <div className="flex h-full gap-6 animate-fadeIn">
      {/* Sidebar Filters */}
      <aside className="w-72 flex flex-col gap-6 sticky top-0 h-full overflow-y-auto pr-2 shrink-0">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight">业务语义多维筛选</h3>
            <button 
              onClick={handleReset}
              className="text-[10px] text-blue-600 font-bold hover:underline uppercase"
            >
              重置
            </button>
          </div>
          
          {filterConfigs.map((f, i) => (
            <div key={i} className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{f.label}</label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-hide">
                {f.options.map((opt, oi) => {
                  const optValue = (opt as any).value || opt.name;
                  const isChecked = selectedFilters[f.field].includes(optValue);
                  
                  return (
                    <label 
                      key={oi} 
                      className={`flex items-center justify-between group cursor-pointer py-1 px-2 rounded-lg transition-all ${isChecked ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                    >
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                          checked={isChecked}
                          onChange={() => handleToggleFilter(f.field, optValue)}
                        />
                        <span className={`ml-3 text-xs font-bold transition-colors ${isChecked ? 'text-blue-600' : 'text-slate-600 group-hover:text-blue-600'}`}>
                          {opt.name}
                        </span>
                      </div>
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md min-w-[20px] text-center transition-all ${
                        isChecked ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-300 group-hover:text-blue-500'
                      }`}>
                        {opt.count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-slate-100">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-3">时间跨度</label>
            <div className="space-y-2">
               <input type="date" className="w-full text-xs border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 border bg-slate-50 font-bold" />
               <input type="date" className="w-full text-xs border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 border bg-slate-50 font-bold" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Keyword Search Bar */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
           <div className="relative flex items-center group">
              <i className="fa-solid fa-magnifying-glass absolute left-6 text-slate-300 group-focus-within:text-blue-600 transition-colors"></i>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索图形标题、标签、工区关键字..."
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-12 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-6 w-6 h-6 rounded-full bg-slate-200 text-slate-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all"
                >
                  <i className="fa-solid fa-xmark text-[10px]"></i>
                </button>
              )}
           </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shrink-0">
          <p className="text-xs font-bold text-slate-500">
            {searchQuery || selectedFilters.oilfield.length > 0 || selectedFilters.spatialRelation.length > 0 || selectedFilters.profession.length > 0 || selectedFilters.stage.length > 0 || selectedFilters.graphicType.length > 0 ? (
              <>已筛选出 <span className="font-black text-blue-600">{filteredAssets.length}</span> 个结果</>
            ) : (
              <>共找到 <span className="font-black text-slate-800">{filteredAssets.length}</span> 个正式入库结果</>
            )}
          </p>
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setViewMode('grid')}
                className={`w-9 h-9 rounded-lg transition-all flex items-center justify-center ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <i className="fa-solid fa-table-cells-large text-xs"></i>
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`w-9 h-9 rounded-lg transition-all flex items-center justify-center ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <i className="fa-solid fa-list text-xs"></i>
              </button>
            </div>
            <select className="text-xs font-bold border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 border bg-slate-50 outline-none">
              <option>相关性排序</option>
              <option>最新上传</option>
              <option>最早上传</option>
            </select>
          </div>
        </div>

        {/* Scrollable Results Area */}
        <div className="flex-1 overflow-y-auto pr-2">
          {filteredAssets.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                {filteredAssets.map(asset => (
                  <div 
                    key={asset.id} 
                    onClick={() => onNavigate('detail', asset)}
                    className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden group hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer flex flex-col"
                  >
                    <div className="relative h-44 overflow-hidden bg-slate-100 flex items-center justify-center">
                      <img src={asset.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="bg-black/60 backdrop-blur text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">{asset.category}</span>
                      </div>
                      <div className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg ${
                        asset.graphicType === 'dynamic' ? 'bg-amber-500' : asset.graphicType === 'datavolume' ? 'bg-indigo-600' : 'bg-blue-600'
                      }`}>
                        <i className={`fa-solid ${
                          asset.graphicType === 'dynamic' ? 'fa-bolt-lightning' : asset.graphicType === 'datavolume' ? 'fa-cube' : 'fa-image'
                        } text-[10px]`}></i>
                      </div>
                      <button className="absolute bottom-3 right-3 bg-white/90 backdrop-blur w-9 h-9 rounded-2xl flex items-center justify-center text-slate-700 hover:bg-blue-600 hover:text-white transition-all shadow-xl">
                        <i className="fa-solid fa-plus text-xs"></i>
                      </button>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-black text-slate-800 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1 leading-tight">{asset.title}</h4>
                        <div className="flex flex-col gap-0.5 mb-2">
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{asset.oilfield} • {asset.profession}</p>
                           {asset.spatialRelation && <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest">{asset.spatialRelation}</p>}
                        </div>
                        
                        {/* Figure Note Preview */}
                        {asset.figureNote && (
                           <div className="mb-4 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                              <p className="text-[10px] text-slate-500 italic leading-relaxed line-clamp-2">
                                 “{asset.figureNote}”
                              </p>
                           </div>
                        )}

                        <div className="flex flex-wrap gap-1.5">
                          {asset.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">#{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-5">
                        <span className="text-[10px] font-bold text-slate-300 uppercase">{asset.lastUpdate}</span>
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{asset.version}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto mb-20">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    <tr>
                      <th className="px-8 py-5">图形资产名称 / 图注</th>
                      <th className="px-8 py-5">关联区域/空间关系</th>
                      <th className="px-8 py-5">专业领域</th>
                      <th className="px-8 py-5">类型</th>
                      <th className="px-8 py-5">版本</th>
                      <th className="px-8 py-5 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAssets.map(asset => (
                      <tr 
                        key={asset.id} 
                        onClick={() => onNavigate('detail', asset)}
                        className="hover:bg-blue-50/30 transition-colors text-sm group cursor-pointer"
                      >
                        <td className="px-8 py-5 flex items-center gap-4">
                          <div className="w-12 h-9 rounded-lg overflow-hidden border border-slate-100 bg-slate-100 shrink-0">
                            <img src={asset.thumbnail} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-black text-slate-800 group-hover:text-blue-600 transition-colors block truncate">{asset.title}</span>
                            {asset.figureNote && <span className="text-[9px] text-slate-400 font-medium italic block truncate max-w-xs">{asset.figureNote}</span>}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                           <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-500 uppercase">{asset.oilfield}</span>
                              <span className="text-[9px] font-black text-slate-300 uppercase">{asset.spatialRelation}</span>
                           </div>
                        </td>
                        <td className="px-8 py-5 text-xs font-bold text-slate-500">{asset.profession}</td>
                        <td className="px-8 py-5">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            asset.graphicType === 'dynamic' ? 'bg-amber-100 text-amber-600' : asset.graphicType === 'datavolume' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {asset.graphicType || 'static'}
                          </span>
                        </td>
                        <td className="px-8 py-5 font-mono text-[10px] font-black text-slate-400">{asset.version}</td>
                        <td className="px-8 py-5 text-right">
                          <button className="text-slate-300 hover:text-blue-600 transition-colors"><i className="fa-solid fa-ellipsis-vertical"></i></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div className="py-32 text-center bg-white rounded-[40px] border-4 border-dashed border-slate-50">
              <i className="fa-solid fa-magnifying-glass text-5xl mb-6 text-slate-100"></i>
              <p className="text-sm font-black text-slate-300 uppercase tracking-widest">未找到符合条件的资产</p>
              <button 
                onClick={handleReset}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 shadow-lg"
              >
                清除所有筛选
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedSearch;
