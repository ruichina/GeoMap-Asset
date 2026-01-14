
import React from 'react';
import { CommonPageProps } from '../types';

const SystemStandards: React.FC<CommonPageProps> = ({ lang, onNavigate }) => {
  const configs = [
    { name: '图层命名标准', icon: 'fa-layers-group' },
    { name: '地质图元符号库', icon: 'fa-shapes' },
    { name: '坐标参考系标准', icon: 'fa-earth-asia' },
    { name: '图形存储与备份策略', icon: 'fa-hard-drive' },
    { name: 'AI 语义提取模型配置', icon: 'fa-microchip' },
  ];

  return (
    <div className="flex h-full gap-6 animate-fadeIn">
      {/* Configuration Nav */}
      <aside className="w-80 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
         <div className="p-6 border-b border-slate-100">
            <h4 className="font-bold text-slate-800">系统管理配置</h4>
         </div>
         <nav className="flex-1 p-2 space-y-1">
            {configs.map((c, i) => (
              <button key={i} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${i === 1 ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}>
                 <i className={`fa-solid ${c.icon} w-5`}></i>
                 <span className="text-sm font-bold">{c.name}</span>
              </button>
            ))}
         </nav>
      </aside>

      {/* Settings Form */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
         <div className="p-8 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-2">
               <i className="fa-solid fa-shapes text-blue-600 text-2xl"></i>
               <h3 className="text-xl font-bold text-slate-800">地质图元符号标准化管理</h3>
            </div>
            <p className="text-xs text-slate-400">定义全企业统一的地质剖面图、构造图符号集，确保图形资产的规范性与一致性。</p>
         </div>
         
         <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <div className="space-y-4">
               <h4 className="text-sm font-bold text-slate-800">符号库管理</h4>
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { name: '断层符号集', count: 12, color: 'bg-rose-500' },
                    { name: '岩性填充标准', count: 45, color: 'bg-amber-500' },
                    { name: '油气藏标识', count: 8, color: 'bg-emerald-500' },
                    { name: '工程设施图标', count: 32, color: 'bg-slate-500' },
                  ].map((lib, i) => (
                    <div key={i} className="p-4 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all cursor-pointer group">
                       <div className={`${lib.color} w-10 h-10 rounded-xl mb-3 group-hover:scale-110 transition-transform`}></div>
                       <h5 className="text-xs font-bold text-slate-800 mb-1">{lib.name}</h5>
                       <span className="text-[10px] text-slate-400 font-bold uppercase">{lib.count} 个符号</span>
                    </div>
                  ))}
                  <div title="新增符号库" className="border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center p-4 text-slate-300 hover:text-blue-300 hover:border-blue-200 cursor-pointer">
                     <i className="fa-solid fa-plus text-xl"></i>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <h4 className="text-sm font-bold text-slate-800">符号标准属性</h4>
               <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">制图标准体系</label>
                     <select className="w-full text-sm border-slate-200 bg-slate-50 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 border">
                        <option>中国国家标准 (GB/T)</option>
                        <option>国际石油协会标准 (IPA)</option>
                        <option>企业内部定制标准 2024</option>
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">全局线条粗细 (像素)</label>
                     <input type="number" defaultValue={2} className="w-full text-sm border-slate-200 bg-slate-50 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 border" />
                  </div>
               </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 text-white">
               <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-bold">渲染效果预览</h4>
                  <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded font-bold">符合标准</span>
               </div>
               <div className="h-40 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-1 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                    <span className="text-[10px] font-mono opacity-50">符号编码: F-01 (活动断层)</span>
                  </div>
               </div>
            </div>
         </div>

         <div className="p-8 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <button className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100">重置配置</button>
            <button className="px-8 py-3 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200">全平台发布生效</button>
         </div>
      </div>
    </div>
  );
};

export default SystemStandards;
