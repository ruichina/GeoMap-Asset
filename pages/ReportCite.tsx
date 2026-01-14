
import React, { useState } from 'react';
import { GraphicAsset, CommonPageProps, CitationRecord } from '../types';

interface ReportCiteProps extends CommonPageProps {
  citedAssets?: GraphicAsset[];
  onRemoveCitedAsset?: (id: string) => void;
  citationHistory?: CitationRecord[];
  onFinalizeCitation?: (record: CitationRecord) => void;
  onReCite?: (assets: GraphicAsset[]) => void;
}

const ReportCite: React.FC<ReportCiteProps> = ({ 
  lang, 
  onNavigate, 
  citedAssets = [], 
  onRemoveCitedAsset,
  citationHistory = [],
  onFinalizeCitation,
  onReCite
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [format, setFormat] = useState('PNG 高清图 (带背景)');
  const [includeMeta, setIncludeMeta] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>(citedAssets.map(a => a.id));
  const [isExporting, setIsExporting] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectAll = () => setSelectedIds(citedAssets.map(a => a.id));
  const clearSelection = () => setSelectedIds([]);

  const handleApply = (action: 'clipboard' | 'download') => {
    if (selectedIds.length === 0) return;
    
    setIsExporting(true);
    
    // Simulate export delay
    setTimeout(() => {
      const selectedAssets = citedAssets.filter(a => selectedIds.includes(a.id));
      const record: CitationRecord = {
        id: 'REC-' + Date.now(),
        timestamp: new Date().toLocaleString(),
        assets: selectedAssets,
        format: format
      };

      if (onFinalizeCitation) {
        onFinalizeCitation(record);
      }
      
      setIsExporting(false);
      clearSelection();
      setActiveTab('history');
      alert(lang === 'zh' ? '引用记录已生成，当前待引用列表已清空。' : 'Citation archived. Pending list cleared.');
    }, 1200);
  };

  const renderPendingList = () => (
    <div className="flex flex-col h-full gap-4">
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center sticky top-0 z-10">
         <div className="flex items-center gap-3">
           <h4 className="font-bold text-slate-800 text-sm">
             {lang === 'zh' ? '当前待引用图形资产' : 'Pending Selection'}
           </h4>
           <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-black">
             {citedAssets.length} 项
           </span>
         </div>
         <div className="flex gap-2">
            <button onClick={selectAll} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100">
              {lang === 'zh' ? '全选' : 'Select All'}
            </button>
            <button onClick={clearSelection} className="text-xs font-bold text-slate-400 px-3 py-1.5 hover:bg-slate-50 rounded-lg">
              {lang === 'zh' ? '清除' : 'Clear'}
            </button>
         </div>
      </div>

      {citedAssets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
           {citedAssets.map(asset => (
              <div 
                key={asset.id} 
                className={`bg-white p-2 rounded-2xl border transition-all cursor-pointer relative group ${
                  selectedIds.includes(asset.id) ? 'border-blue-500 ring-4 ring-blue-50' : 'border-slate-100'
                }`}
                onClick={() => toggleSelect(asset.id)}
              >
                 <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onRemoveCitedAsset?.(asset.id); }}
                      className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-rose-500 hover:text-white"
                    >
                       <i className="fa-solid fa-trash-can text-[10px]"></i>
                    </button>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedIds.includes(asset.id) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200'
                    }`}>
                       {selectedIds.includes(asset.id) && <i className="fa-solid fa-check text-[10px]"></i>}
                    </div>
                 </div>
                 <img src={asset.thumbnail} className="w-full h-40 object-cover rounded-xl mb-3" />
                 <div className="px-2 pb-2">
                    <h5 className="text-xs font-bold text-slate-800 mb-1 line-clamp-1">{asset.title}</h5>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{asset.oilfield} • {asset.profession}</p>
                 </div>
              </div>
           ))}
        </div>
      ) : (
        <div className="h-[400px] bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <i className="fa-solid fa-layer-group text-3xl opacity-20"></i>
           </div>
           <p className="text-sm font-bold">{lang === 'zh' ? '待引用队列为空' : 'Pending queue is empty'}</p>
           <button onClick={() => onNavigate('search')} className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-xl shadow-blue-500/10 transition-all">
             {lang === 'zh' ? '去检索并添加图件' : 'Search & Add Assets'}
           </button>
        </div>
      )}
    </div>
  );

  const renderHistory = () => (
    <div className="flex flex-col h-full gap-6">
       <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 sticky top-0 z-10">
          <h4 className="font-bold text-slate-800 text-sm">
             {lang === 'zh' ? '图件引用历史记录' : 'Citation History'}
          </h4>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-black">
             {citationHistory.length}
          </span>
       </div>

       {citationHistory.length > 0 ? (
         <div className="space-y-4 pb-20">
            {citationHistory.map((record) => (
              <div key={record.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group">
                 <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
                          <i className="fa-solid fa-receipt"></i>
                       </div>
                       <div>
                          <p className="text-xs font-black text-slate-800 tracking-tight">{record.timestamp}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{record.id} • {record.format}</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => onReCite?.(record.assets)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                       <i className="fa-solid fa-rotate"></i>
                       {lang === 'zh' ? '以此进行二次下载' : 'Re-Cite'}
                    </button>
                 </div>
                 <div className="p-4 flex gap-3 overflow-x-auto scrollbar-hide">
                    {record.assets.map(asset => (
                      <div key={asset.id} className="shrink-0 w-32 group/img relative">
                         <img src={asset.thumbnail} className="w-full h-20 object-cover rounded-xl border border-slate-100" />
                         <div className="mt-1">
                            <p className="text-[9px] font-bold text-slate-600 truncate">{asset.title}</p>
                            <p className="text-[8px] text-slate-400">{asset.version}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            ))}
         </div>
       ) : (
         <div className="h-[400px] bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
            <i className="fa-solid fa-box-open text-4xl opacity-10 mb-4"></i>
            <p className="text-sm font-bold">{lang === 'zh' ? '尚无引用记录' : 'No history yet'}</p>
         </div>
       )}
    </div>
  );

  return (
    <div className="flex h-full gap-6 animate-fadeIn">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit">
           <button 
             onClick={() => setActiveTab('pending')}
             className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'pending' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
           >
              {lang === 'zh' ? '待引用图件' : 'Wait to Cite'}
           </button>
           <button 
             onClick={() => setActiveTab('history')}
             className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
           >
              {lang === 'zh' ? '历史引用记录' : 'Citation History'}
           </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
           {activeTab === 'pending' ? renderPendingList() : renderHistory()}
        </div>
      </div>

      {/* Settings Panel */}
      <aside className="w-96 flex flex-col gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col gap-8 sticky top-0">
          <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest border-l-4 border-blue-600 pl-4">
            {lang === 'zh' ? '引用设置与导出' : 'Citation Settings'}
          </h4>
          
          <div className="space-y-6">
             <div className="space-y-2.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">引用目标格式</label>
                <select 
                  value={format} 
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-xs font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                >
                   <option>PNG 高清图 (带背景)</option>
                   <option>SVG 矢量对齐 (无背景)</option>
                   <option>TIFF 原始工程文档</option>
                   <option>PDF 自动报告合并</option>
                   <option>源文件</option>
                </select>
             </div>

             <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer p-1">
                   <input 
                    type="checkbox" 
                    checked={includeMeta} 
                    onChange={() => setIncludeMeta(!includeMeta)}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600" 
                  />
                   <span className="text-[11px] font-bold text-slate-600">
                     {lang === 'zh' ? '包含专业元数据页脚 (注记)' : 'Include Metadata Annotation'}
                   </span>
                </label>
             </div>
          </div>

          <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50">
             <h5 className="text-[10px] font-black text-blue-500 uppercase mb-3 tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-quote-left"></i>
                引用注记预览
             </h5>
             <p className="text-[11px] text-blue-600/70 italic leading-relaxed">
               {selectedIds.length > 0 ? (
                 lang === 'zh' 
                   ? `“已选定 ${selectedIds.length} 个资产。生成的引用标注将包含：【对象ID, 版本: ${citedAssets.find(a => a.id === selectedIds[0])?.version}, 引用日期: ${new Date().toLocaleDateString()}】”`
                   : `“${selectedIds.length} assets selected. Label includes: [Asset ID, Version, Date]”`
               ) : (
                 lang === 'zh' ? "请在左侧勾选需要引用的图件" : "Select assets to preview label"
               )}
             </p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => handleApply('clipboard')}
              disabled={selectedIds.length === 0 || isExporting}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 uppercase tracking-widest disabled:opacity-50"
            >
               {isExporting ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-copy"></i>}
               {lang === 'zh' ? '批量引用至剪贴板' : 'Copy to Clipboard'}
            </button>
            <button 
              onClick={() => handleApply('download')}
              disabled={selectedIds.length === 0 || isExporting}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 uppercase tracking-widest disabled:opacity-50"
            >
               <i className="fa-solid fa-download"></i>
               {lang === 'zh' ? '打包下载选中项' : 'Download Bundle'}
            </button>
          </div>

          <p className="text-[9px] text-slate-400 font-bold text-center uppercase tracking-tighter">
             执行引用操作后将自动生成引用记录归档
          </p>
        </div>
      </aside>
    </div>
  );
};

export default ReportCite;
