
import React, { useState } from 'react';
import { CommonPageProps } from '../types';

const AIMetadataCompletion: React.FC<CommonPageProps> = ({ lang, onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '近海钻井布局图 B4',
    profession: '钻井工程',
    category: '工程设计',
    oilfield: '渤海湾',
    coordinates: '118.42E, 38.15N',
    key_features: '断层线, 井轨迹',
    tags: '海上平台, 配管, 平面图'
  });

  const triggerAI = () => {
    setLoading(true);
    setTimeout(() => {
      setFormData({
        title: '渤海湾 B4 区块水下井口布局 V2',
        profession: '水下生产系统',
        category: '开发设计',
        oilfield: '渤海湾 4号单元',
        coordinates: '118.4231E, 38.1567N',
        key_features: '3口注水井, 2口生产井, 集输系统',
        tags: '水下生产, 布局, 基础建设, 投产规划'
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-fadeIn">
      <div className="h-1/2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
         <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <button 
                 onClick={() => onNavigate('collection')} 
                 className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all shadow-sm group"
               >
                 <i className="fa-solid fa-chevron-left text-xs group-hover:-translate-x-0.5 transition-transform"></i>
               </button>
               <h4 className="font-bold text-slate-800">视觉上下文分析预览</h4>
            </div>
            <div className="flex items-center gap-4">
               <span className="text-[10px] font-bold text-slate-400 uppercase">分析置信度: <span className="text-emerald-500">92%</span></span>
               <button onClick={triggerAI} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg">
                 <i className="fa-solid fa-wand-sparkles"></i>
                 AI 自动补全元数据
               </button>
            </div>
         </div>
         <div className="flex-1 bg-slate-900 p-8 flex items-center justify-center relative">
            <img src="https://picsum.photos/seed/ai_meta/800/400" className="max-w-full max-h-full object-contain rounded-lg opacity-80" alt="Preview" />
         </div>
      </div>

      <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm overflow-y-auto">
         <div className="flex items-center gap-3 mb-6">
            <i className="fa-solid fa-robot text-blue-600 text-xl"></i>
            <h4 className="font-bold text-slate-800">AI 生成元数据表单</h4>
         </div>
         {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
               <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
               <p className="text-sm font-bold text-slate-500">AI 正在补全数据...</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {Object.entries(formData).map(([key, value]) => (
                 <div key={key} className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">{key}</label>
                    <input type="text" value={value} onChange={(e) => setFormData({...formData, [key]: e.target.value})} className="w-full text-sm border-slate-100 bg-slate-50 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none border" />
                 </div>
               ))}
               <div className="md:col-span-2 pt-6 flex justify-end gap-3">
                  <button className="px-8 py-3 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg">确认并存入资产库</button>
               </div>
            </div>
         )}
      </div>
    </div>
  );
};

export default AIMetadataCompletion;
