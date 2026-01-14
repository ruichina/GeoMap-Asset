
import React, { useState } from 'react';
import { CommonPageProps } from '../types';

const MBUBinding: React.FC<CommonPageProps> = ({ lang, onNavigate }) => {
  const [selectedNode, setSelectedNode] = useState('中心油田');

  return (
    <div className="flex h-full gap-6 animate-fadeIn">
      <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
         <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <button 
                 onClick={() => onNavigate('home')} 
                 className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all shadow-sm group"
               >
                 <i className="fa-solid fa-chevron-left text-xs group-hover:-translate-x-0.5 transition-transform"></i>
               </button>
               <h4 className="font-bold text-slate-800 text-sm">待绑定图形资产</h4>
            </div>
            <span className="text-[10px] font-bold text-slate-400">资产 ID: GRAPH-827-C</span>
         </div>
         <div className="flex-1 bg-slate-900 p-8 flex items-center justify-center">
            <img src="https://picsum.photos/seed/mbu/600/400" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" alt="Preview" />
         </div>
         <div className="p-4 bg-blue-50 border-t border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <i className="fa-solid fa-link text-blue-600"></i>
               <span className="text-xs font-bold text-blue-800">当前挂载至业务节点：{selectedNode}</span>
            </div>
         </div>
      </div>

      <aside className="w-96 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h4 className="font-bold text-slate-800 mb-4">业务语义 (MBU) 树形选择</h4>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
           <div className="space-y-4">
              {['中心油田', '西部评价区', '深层系研究室'].map(node => (
                 <div 
                  key={node} 
                  onClick={() => setSelectedNode(node)}
                  className={`p-2 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${selectedNode === node ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                 >
                   {node}
                   {selectedNode === node && <i className="fa-solid fa-check text-[10px]"></i>}
                 </div>
              ))}
           </div>
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50">
           <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm shadow-xl">
             确认业务语义绑定
           </button>
        </div>
      </aside>
    </div>
  );
};

export default MBUBinding;
