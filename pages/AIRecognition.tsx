
import React, { useState } from 'react';
import { analyzeImageDeeply } from '../services/geminiService';
import { CommonPageProps } from '../types';

const AIRecognition: React.FC<CommonPageProps> = ({ lang, onNavigate }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const defaultResults = [
    { label: '图件类型', value: '地质剖面图', confidence: 0.98, context: '项目初期评估', description: '用于展示地下地层的垂直截面，包含岩性层位和构造形态。' },
    { label: '所属区域', value: '塔里木盆地-顺北区块', confidence: 0.89, context: '勘探许可区', description: '基于地理坐标和图名自动识别的作业区域，关联至区域地质库。' },
    { label: '关键识别实体', value: '碳酸盐岩储层', confidence: 0.94, context: '目标层位', description: '识别出明显的缝洞型储层特征，是该区域主要产油层段。' },
  ];

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeImageDeeply("https://picsum.photos/seed/ai_recog/800/600");
      if (result) {
        setAnalysisResult(result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentResults = analysisResult?.recognitionResults || defaultResults;

  const safeRender = (val: any) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  return (
    <div className="flex h-full gap-6 animate-fadeIn">
      <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col relative">
         <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => onNavigate('home')} 
                className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all shadow-sm group"
              >
                <i className="fa-solid fa-chevron-left text-xs group-hover:-translate-x-0.5 transition-transform"></i>
              </button>
              <div className="flex flex-col">
                <h4 className="font-bold text-slate-800">AI 语义分析识别视图</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-tighter">多模态视觉推理引擎</p>
              </div>
            </div>
            <div className="flex gap-2">
               <button 
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                  isAnalyzing 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                }`}
               >
                 <i className={`fa-solid ${isAnalyzing ? 'fa-spinner animate-spin' : 'fa-wand-magic-sparkles'}`}></i>
                 {isAnalyzing ? '深度识别中...' : '触发深度 AI 分析'}
               </button>
            </div>
         </div>
         <div className="flex-1 bg-slate-900 p-8 flex items-center justify-center relative">
            <img src="https://picsum.photos/seed/ai_recog/800/600" className={`max-w-full max-h-full object-contain rounded-lg transition-opacity duration-500 ${isAnalyzing ? 'opacity-30' : 'opacity-60'}`} alt="Recognition Subject" />
            {isAnalyzing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-4">
                <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="font-bold text-sm tracking-widest uppercase">Gemini 视觉推理运行中</p>
              </div>
            )}
         </div>
      </div>

      <aside className="w-[500px] flex flex-col gap-6 overflow-hidden">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <i className="fa-solid fa-microchip text-blue-600"></i>
              智能识别与语境关联
            </h4>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
             {currentResults.map((res: any, i: number) => (
               <div key={i} className="group p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-white transition-all duration-300">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{safeRender(res.label)}</span>
                     <span className="text-[10px] font-bold text-emerald-600">{((res.confidence || 0.9) * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-sm font-black text-slate-800 mb-2">
                    {safeRender(res.value)}
                  </p>
                  <p className="text-xs text-slate-500 italic leading-relaxed">
                    {safeRender(res.description)}
                  </p>
                  {res.context && (
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-blue-500 uppercase">
                        业务背景: {safeRender(res.context)}
                      </p>
                    </div>
                  )}
               </div>
             ))}
          </div>
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex-shrink-0">
             <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 hover:bg-black transition-all">
                <i className="fa-solid fa-file-export"></i>
                同步识别元数据至资产库
             </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default AIRecognition;
