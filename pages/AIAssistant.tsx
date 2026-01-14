
import React, { useState, useEffect, useRef } from 'react';
import { getGeminiResponse } from '../services/geminiService';
import { TRANSLATIONS, MOCK_ASSETS } from '../constants';
import { CommonPageProps, GraphicAsset } from '../types';

interface Message {
  role: 'user' | 'ai';
  text: string;
  assets?: GraphicAsset[];
  isGenerating?: boolean;
}

interface AIAssistantProps extends CommonPageProps {
  onAddAsset?: (asset: GraphicAsset) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ lang, onNavigate, onAddAsset }) => {
  const t = TRANSLATIONS[lang];
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: t.aiAssistant.greeting }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const searchAssets = (query: string): GraphicAsset[] => {
    const q = query.toLowerCase();
    return MOCK_ASSETS.filter(a => 
      a.title.toLowerCase().includes(q) || 
      a.oilfield.toLowerCase().includes(q) ||
      a.tags.some(tag => tag.toLowerCase().includes(q))
    ).slice(0, 3);
  };

  const generateNewAsset = (query: string): GraphicAsset => {
    const id = `ai-gen-${Date.now()}`;
    return {
      id,
      title: `[AI生成] ${query.slice(0, 20)}... 综合分析图`,
      category: 'AI 仿真成果',
      profession: '综合研究',
      oilfield: query.includes('大庆') ? '大庆' : (query.includes('塔里木') ? '塔里木' : '待定'),
      stage: '决策建议',
      thumbnail: `https://picsum.photos/seed/${id}/600/400`,
      lastUpdate: new Date().toISOString().split('T')[0],
      version: 'AI-V1.0',
      status: 'draft',
      tags: ['AI生成', '预测模型', '自动合成'],
      graphicType: 'static',
      figureNote: '这是由 AI 根据当前语义语境自动合成的分析图。该图展示了目标区域的预测趋势，仅供决策参考。',
      coordinates5D: {
        object: 'AI 虚拟实体',
        business: '辅助决策',
        work: '图形合成',
        profession: '人工智能',
        process: '草案生成'
      }
    };
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    // AI Logic Flow
    const isSearchIntent = userMsg.match(/查找|搜索|展示|显示|find|search|show/i);
    
    if (isSearchIntent) {
      const found = searchAssets(userMsg);
      
      if (found.length > 0) {
        setMessages(prev => [...prev, { 
          role: 'ai', 
          text: lang === 'zh' ? `为您找到 ${found.length} 份匹配的资产：` : `I found ${found.length} matching assets for you:`,
          assets: found 
        }]);
        setLoading(false);
      } else {
        // TRIGGER AUTO-GENERATION
        setMessages(prev => [...prev, { 
          role: 'ai', 
          text: lang === 'zh' ? "库中暂无匹配项。正在根据您的语义描述，自动合成并渲染新的图形资产..." : "No matches found. Automatically synthesizing and rendering a new graphic asset based on your description...",
          isGenerating: true
        }]);

        // Simulate Generation Progress
        setTimeout(() => {
          const newAsset = generateNewAsset(userMsg);
          if (onAddAsset) onAddAsset(newAsset);
          
          setMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg.isGenerating) {
              return [...prev.slice(0, -1), {
                role: 'ai',
                text: lang === 'zh' ? "资产已生成！已为您创建新的图件并存入待评审列表。" : "Asset generated! A new graphic has been created and added to the pending review list.",
                assets: [newAsset]
              }];
            }
            return prev;
          });
          setLoading(false);
        }, 3000);
      }
    } else {
      // General Chat via Gemini
      const systemInstruction = lang === 'en' 
        ? "You are GeoMap AI, an advanced expert in petroleum engineering graphics and geological analysis. Please respond in English." 
        : "你是 GeoMap AI，石油工程图形与地质分析领域的资深专家助手。请用中文回答。";
      
      const aiResponse = await getGeminiResponse(`${systemInstruction}\n\nUser: ${userMsg}`);
      setMessages(prev => [...prev, { role: 'ai', text: String(aiResponse || (lang === 'zh' ? "抱歉，GeoMap AI 暂时无法处理该请求。" : "Sorry, GeoMap AI can't process that.")) }]);
      setLoading(false);
    }
  };

  const recommendQueries = lang === 'zh' ? [
    '查找大庆油田所有的构造图',
    '生成一个关于顺北5号区块的压力分布模型',
    '总结 2023 年的所有地质报告图件',
    '分析萨尔图北一区的注采平衡风险'
  ] : [
    'Find all structure maps of Daqing Oilfield',
    'Generate a pressure distribution model for Shunbei Block 5',
    'Summarize all geological report graphics in 2023',
    'Analyze injection-production balance risks of Saertu'
  ];

  return (
    <div className="flex h-full gap-6 animate-fadeIn relative">
      {/* Main Chat Area */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col relative">
         <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <i className="fa-solid fa-robot text-white text-sm"></i>
               </div>
               <div>
                  <h4 className="font-black text-slate-800 text-sm tracking-tight">GeoMap AI</h4>
                  <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                     {lang === 'zh' ? '正在智能运行中' : 'Engine Online'}
                  </p>
               </div>
            </div>
            <button 
              onClick={() => setMessages([{ role: 'ai', text: t.aiAssistant.greeting }])}
              className="text-slate-400 hover:text-slate-800 transition-colors p-2"
            >
              <i className="fa-solid fa-trash-can text-sm"></i>
            </button>
         </div>

         <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                 <div className={`max-w-[85%] rounded-[24px] p-5 shadow-sm leading-relaxed ${
                    m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                 }`}>
                    <p className="text-sm whitespace-pre-wrap font-medium">{String(m.text || '')}</p>
                    
                    {m.isGenerating && (
                       <div className="mt-4 space-y-3">
                          <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-600 animate-progress"></div>
                          </div>
                          <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest animate-pulse">AI Synthesis in Progress...</p>
                       </div>
                    )}
                 </div>

                 {/* Display Found Assets */}
                 {m.assets && m.assets.length > 0 && (
                   <div className="mt-4 flex gap-4 overflow-x-auto w-full pb-4 scrollbar-hide">
                      {m.assets.map(asset => (
                        <div 
                          key={asset.id} 
                          onClick={() => onNavigate('detail', asset)}
                          className="min-w-[260px] bg-white rounded-2xl border border-slate-100 shadow-lg hover:border-blue-500 transition-all cursor-pointer group flex flex-col"
                        >
                           <div className="h-28 overflow-hidden rounded-t-2xl relative">
                              <img src={asset.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                              <span className="absolute bottom-2 left-2 text-[8px] text-white font-black uppercase bg-blue-600 px-1.5 py-0.5 rounded">
                                {asset.version}
                              </span>
                           </div>
                           <div className="p-4">
                              <h5 className="text-[11px] font-black text-slate-800 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">{asset.title}</h5>
                              <p className="text-[9px] text-slate-400 font-bold mb-2">{asset.oilfield} • {asset.profession}</p>
                              
                              {/* Added Figure Note */}
                              {asset.figureNote && (
                                <p className="text-[8px] text-slate-400 italic line-clamp-2 leading-relaxed bg-slate-50 p-1.5 rounded-lg border border-slate-100 mb-3">
                                  “{asset.figureNote}”
                                </p>
                              )}

                              <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                 <span className="text-[8px] font-bold text-slate-300 uppercase">{asset.lastUpdate}</span>
                                 <i className="fa-solid fa-arrow-right-long text-blue-400"></i>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                 )}
              </div>
            ))}
            {loading && !messages[messages.length-1].isGenerating && (
               <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-5 flex gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"></div>
                     <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce delay-75"></div>
                     <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce delay-150"></div>
                  </div>
               </div>
            )}
         </div>

         {/* Floating Recommendations */}
         <div className="absolute bottom-28 right-8 w-80 pointer-events-none">
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[32px] border border-slate-100 shadow-2xl pointer-events-auto space-y-4 animate-slideUp">
               <h4 className="font-black text-slate-800 flex items-center gap-2 text-[10px] uppercase tracking-widest">
                  <i className="fa-solid fa-wand-magic-sparkles text-amber-500"></i>
                  {t.aiAssistant.recommend}
               </h4>
               <div className="space-y-2">
                  {recommendQueries.map((q, i) => (
                    <button 
                      key={i} 
                      onClick={() => setInput(q)}
                      className="w-full text-left p-3.5 rounded-xl bg-slate-50 text-[10px] font-bold text-slate-600 hover:bg-blue-600 hover:text-white border border-transparent transition-all leading-snug"
                    >
                      {q}
                    </button>
                  ))}
               </div>
            </div>
         </div>

         {/* Input Box */}
         <div className="p-6 border-t border-slate-100 bg-white">
            <div className="flex items-center gap-4 bg-slate-50 rounded-[24px] p-2 border border-slate-100 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:bg-white transition-all shadow-inner">
               <button title="多模态输入" className="w-12 h-12 rounded-full text-slate-400 hover:text-blue-600 transition-colors">
                  <i className="fa-solid fa-microphone"></i>
               </button>
               <input 
                 type="text" 
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                 placeholder={t.aiAssistant.placeholder} 
                 className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 px-2 font-bold text-slate-700"
               />
               <button 
                onClick={handleSend}
                disabled={loading}
                className="w-14 h-12 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center justify-center disabled:opacity-50"
               >
                  <i className="fa-solid fa-paper-plane text-xs"></i>
               </button>
            </div>
         </div>
      </div>
      
      {/* Sidebar - Context */}
      <aside className="w-80 flex flex-col gap-6">
         <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-[-20%] right-[-20%] w-40 h-40 bg-blue-600/20 rounded-full blur-[60px]"></div>
            <h4 className="font-black text-sm mb-4 relative z-10 flex items-center gap-2">
               <i className="fa-solid fa-brain text-blue-400"></i>
               Semantic Memory
            </h4>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-8 relative z-10">
               {lang === 'zh' 
                 ? 'GeoMap AI 正在通过全局语义索引查找资产。如果您描述了库中不存在的图件，AI 将调用“生成式图元引擎”为您实时合成一份基于行业标准的逻辑图草案。'
                 : 'AI is searching via global semantic indexing. If the requested graphic is missing, our generative engine will synthesize a draft based on industry standards.'}
            </p>
            <div className="space-y-4 relative z-10">
               <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <span className="text-[9px] font-black text-blue-400 uppercase block mb-1">Index Status</span>
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-bold text-slate-300">12,482 Assets Indexed</span>
                     <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                  </div>
               </div>
               <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <span className="text-[9px] font-black text-amber-400 uppercase block mb-1">Synthesizer</span>
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-bold text-slate-300">V3.5 Multi-modal Engine</span>
                     <i className="fa-solid fa-bolt text-amber-500 text-[10px]"></i>
                  </div>
               </div>
            </div>
         </div>
      </aside>
    </div>
  );
};

export default AIAssistant;
