
import React, { useState } from 'react';
import { PageId, Language } from '../types';

interface EvolutionViewProps {
  onNavigate: (page: PageId) => void;
  lang: Language;
}

const EvolutionView: React.FC<EvolutionViewProps> = ({ onNavigate, lang }) => {
  const allVersions = [
    { 
      id: 'v1', 
      ver: 'V1.0', 
      date: '2023-01-15', 
      author: '张三', 
      note: '地震勘探初始草案', 
      img: 'https://picsum.photos/seed/v1/600/400',
      description: '初始版本，基于2022年底地震采集原始数据生成的首版构造草图，确定了基本的层位骨架。'
    },
    { 
      id: 'v2', 
      ver: 'V1.1', 
      date: '2023-04-10', 
      author: '李四', 
      note: '增加了断层线修正', 
      img: 'https://picsum.photos/seed/v2/600/400',
      description: '根据加密地震道处理结果，对西侧主断裂带进行了精细修正，删除了原有的两处伪断裂。'
    },
    { 
      id: 'v3', 
      ver: 'V2.0', 
      date: '2023-08-22', 
      author: '张三', 
      note: '整合专家评审意见', 
      img: 'https://picsum.photos/seed/v3/600/400',
      description: '正式进入开发评审阶段。根据专家组意见，优化了南翼构造的高程等值线分布。'
    },
    { 
      id: 'v4', 
      ver: 'V2.1', 
      date: '2023-10-15', 
      author: '王五', 
      note: '评价阶段正式发布版', 
      img: 'https://picsum.photos/seed/v4/600/400',
      description: '最终发布版。整合了井位回校后的最新坐标，通过了标准化委员会的终审。'
    },
  ];

  // Store multiple selected versions for the comparison grid
  const [selectedIds, setSelectedIds] = useState<string[]>(['v1', 'v4']);
  const selectedVersions = allVersions.filter(v => selectedIds.includes(v.id));

  const toggleVersion = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(vId => vId !== id) 
        : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedIds([]);

  return (
    <div className="flex h-full gap-6 animate-fadeIn">
      {/* Timeline Left Sidebar */}
      <aside className="w-80 flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="font-bold text-slate-800">历史演进轴</h3>
            <button 
              onClick={clearSelection}
              className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase"
            >
              清除选择
            </button>
          </div>
          
          <div className="flex-1 relative pl-6 before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 overflow-y-auto pr-2">
            {allVersions.slice().reverse().map((v) => {
              const isSelected = selectedIds.includes(v.id);
              return (
                <div 
                  key={v.id} 
                  onClick={() => toggleVersion(v.id)}
                  className={`relative mb-6 cursor-pointer group transition-all transform hover:-translate-x-1`}
                >
                  <div className={`absolute -left-7 top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm transition-colors ${isSelected ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                  <div className={`p-4 rounded-xl border transition-all ${isSelected ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-transparent hover:bg-slate-50'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isSelected ? 'text-blue-600' : 'text-slate-800'}`}>{v.ver}</span>
                        {isSelected && <i className="fa-solid fa-check-circle text-blue-500 text-[10px]"></i>}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">{v.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium line-clamp-1 italic">"{v.note}"</p>
                    <div className="mt-2 flex items-center justify-between">
                       <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold uppercase">{v.author[0]}</div>
                          <span className="text-[10px] text-slate-500">{v.author}</span>
                       </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Multi-Version Comparison View */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Header Actions */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
           <div className="flex items-center gap-3">
              <button 
                onClick={() => onNavigate('detail')}
                className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all mr-2"
                title={lang === 'zh' ? '返回详情' : 'Back to Detail'}
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <i className="fa-solid fa-layer-group"></i>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">版本演进对比视图</h4>
                <p className="text-[10px] text-slate-400 font-medium">正在并排展示 <span className="text-blue-600 font-bold">{selectedVersions.length}</span> 个版本</p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-100 p-1 rounded-lg mr-2">
                <button className="px-3 py-1.5 text-xs font-bold bg-white text-blue-600 rounded-md shadow-sm">网格视图</button>
                <button className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800">并列视图</button>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 flex items-center gap-2">
                <i className="fa-solid fa-file-export"></i>
                导出对比报告
              </button>
           </div>
        </div>

        {/* Dynamic Grid for Versions */}
        {selectedVersions.length > 0 ? (
          <div className={`flex-1 overflow-y-auto pr-2 grid gap-6 ${
            selectedVersions.length === 1 ? 'grid-cols-1' : 
            selectedVersions.length === 2 ? 'grid-cols-2' : 
            'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
          }`}>
            {selectedVersions.map((v) => (
              <div key={v.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:ring-2 hover:ring-blue-500 transition-all duration-300">
                {/* Image Header with Info */}
                <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded font-bold">{v.ver}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{v.date}</span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleVersion(v.id); }}
                    className="text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <i className="fa-solid fa-circle-xmark"></i>
                  </button>
                </div>

                {/* Main Preview Area */}
                <div className="flex-1 bg-slate-900 relative overflow-hidden flex items-center justify-center p-4 min-h-[260px]">
                  <img 
                    src={v.img} 
                    alt={`版本 ${v.ver}`} 
                    className="max-w-full max-h-full object-contain shadow-2xl transition-transform duration-500 group-hover:scale-105" 
                  />
                </div>

                {/* Footer Info & Explanation Text */}
                <div className="p-5 bg-white space-y-4">
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">版本演进说明</h5>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {v.description}
                    </p>
                  </div>
                  
                  <div className="pt-3 border-t border-slate-50 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex-shrink-0 flex items-center justify-center text-blue-600 font-bold text-[10px]">
                      {v.author[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                         <h5 className="text-[11px] font-bold text-slate-800">{v.author}</h5>
                         <div className="flex gap-2">
                            <button title="全屏" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><i className="fa-solid fa-expand text-[10px]"></i></button>
                            <button title="下载" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><i className="fa-solid fa-download text-[10px]"></i></button>
                         </div>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium italic mt-0.5">"{v.note}"</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <i className="fa-solid fa-object-group text-3xl opacity-20"></i>
            </div>
            <p className="text-sm font-bold">未选择任何版本进行对比</p>
            <p className="text-xs mt-1">请从左侧时间轴中选择多个版本进行并排对比分析。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvolutionView;
