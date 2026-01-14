
import React, { useState } from 'react';
import { GraphicAsset, PageId, Language } from '../types';

interface GraphicStyleEditorProps {
  onNavigate: (page: PageId, data?: any) => void;
  lang: Language;
  asset: GraphicAsset;
}

const GraphicStyleEditor: React.FC<GraphicStyleEditorProps> = ({ onNavigate, lang, asset }) => {
  const [activeTool, setActiveTool] = useState('select');
  const [layers, setLayers] = useState([
    { id: 1, name: '底图 (Raster)', visible: true, locked: true },
    { id: 2, name: '断层线 (Vector)', visible: true, locked: false, color: '#ef4444' },
    { id: 3, name: '井位点 (Symbols)', visible: true, locked: false, color: '#3b82f6' },
    { id: 4, name: '标注文本', visible: true, locked: false, color: '#ffffff' },
  ]);
  const [activePreset, setActivePreset] = useState('standard');

  const tools = [
    { id: 'select', icon: 'fa-arrow-pointer', label: '选择' },
    { id: 'draw', icon: 'fa-pen-nib', label: '绘制' },
    { id: 'text', icon: 'fa-font', label: '文本' },
    { id: 'measure', icon: 'fa-ruler-combined', label: '测量' },
    { id: 'fill', icon: 'fa-fill-drip', label: '填充' },
  ];

  const presets = [
    { id: 'standard', name: '标准工业', desc: '经典白图黑线风格' },
    { id: 'night', name: '深色模式', desc: '适合长时制图，低疲劳' },
    { id: 'high-contrast', name: '高对比度', desc: '显著区分重点构造' },
    { id: 'topographic', name: '地形渲染', desc: '模拟三维高程视觉' },
  ];

  const toggleLayer = (id: number) => {
    setLayers(layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  };

  const handleSave = () => {
    alert(lang === 'zh' ? '样式配置已暂存，正在生成预览并提交评审...' : 'Style saved. Generating preview for review...');
    onNavigate('review');
  };

  return (
    <div className="h-screen -m-6 flex flex-col bg-slate-900 overflow-hidden animate-fadeIn">
      {/* Header */}
      <header className="h-14 bg-slate-800 border-b border-white/5 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
           <button 
            onClick={() => onNavigate('detail', asset)}
            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all"
           >
              <i className="fa-solid fa-chevron-left text-xs"></i>
           </button>
           <div className="flex flex-col">
              <h2 className="text-xs font-black text-white leading-none mb-1">{asset.title}</h2>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">在线样式编辑器 <span className="text-blue-500 ml-2">Beta</span></span>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex items-center bg-white/5 p-1 rounded-lg border border-white/5 mr-4">
              <button className="w-8 h-8 rounded flex items-center justify-center text-slate-400 hover:bg-white/10 transition-all" title="撤销"><i className="fa-solid fa-rotate-left text-xs"></i></button>
              <button className="w-8 h-8 rounded flex items-center justify-center text-slate-400 hover:bg-white/10 transition-all" title="重做"><i className="fa-solid fa-rotate-right text-xs"></i></button>
           </div>
           <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black px-6 py-2 rounded-lg shadow-lg shadow-blue-600/20 transition-all uppercase tracking-widest">
              保存样式并发布
           </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <aside className="w-14 bg-slate-800 border-r border-white/5 flex flex-col items-center py-4 gap-4 shrink-0">
           {tools.map(tool => (
             <button 
              key={tool.id} 
              onClick={() => setActiveTool(tool.id)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activeTool === tool.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
              }`}
              title={tool.label}
             >
                <i className={`fa-solid ${tool.icon} text-sm`}></i>
             </button>
           ))}
           <div className="w-6 h-px bg-white/5 my-2"></div>
           <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-white/5"><i className="fa-solid fa-eraser text-sm"></i></button>
        </aside>

        {/* Canvas Area */}
        <main className="flex-1 relative bg-[#0f172a] flex items-center justify-center overflow-hidden">
           {/* Grid Pattern */}
           <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '160px 160px' }}></div>

           {/* Asset Preview */}
           <div className="relative group p-4 bg-white/5 rounded-lg border border-white/5">
              <img 
                src={asset.thumbnail} 
                className={`max-w-4xl max-h-[70vh] object-contain transition-all duration-700 ${
                  activePreset === 'night' ? 'invert brightness-90 hue-rotate-180' : 
                  activePreset === 'high-contrast' ? 'contrast-200 saturate-150' :
                  activePreset === 'topographic' ? 'grayscale brightness-110 sepia' : ''
                }`}
                style={{ opacity: layers[0].visible ? 1 : 0.1 }}
              />
              
              {/* Simulation Vector Overlay */}
              {layers[1].visible && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                   <path d="M10,40 Q30,30 50,50 T90,40" fill="none" stroke={layers[1].color} strokeWidth="0.5" strokeDasharray="1,1" />
                </svg>
              )}
              
              {/* Tooltip Cursor Simulation */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="w-10 h-10 border border-blue-500/50 rounded-full flex items-center justify-center bg-blue-500/10">
                    <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                 </div>
              </div>
           </div>

           {/* Floating View Controls */}
           <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur border border-white/10 px-6 py-2 rounded-full flex items-center gap-6 shadow-2xl">
              <div className="flex items-center gap-3 text-[10px] font-black text-slate-400">
                 <button className="hover:text-white transition-colors"><i className="fa-solid fa-minus"></i></button>
                 <span className="w-12 text-center text-blue-400">125%</span>
                 <button className="hover:text-white transition-colors"><i className="fa-solid fa-plus"></i></button>
              </div>
              <div className="w-px h-4 bg-white/10"></div>
              <button className="text-slate-400 hover:text-white transition-colors"><i className="fa-solid fa-expand text-xs"></i></button>
              <button className="text-slate-400 hover:text-white transition-colors"><i className="fa-solid fa-crosshairs text-xs"></i></button>
           </div>
        </main>

        {/* Right Sidebar - Layers & Styles */}
        <aside className="w-72 bg-slate-800 border-l border-white/5 flex flex-col shrink-0">
           <div className="p-6 space-y-8 flex-1 overflow-y-auto">
              {/* Layers Section */}
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                    <span>图层管理器</span>
                    <button className="text-blue-500 hover:underline">新增 +</button>
                 </h4>
                 <div className="space-y-2">
                    {layers.map(layer => (
                       <div key={layer.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 group hover:border-white/10 transition-all">
                          <div className="flex items-center gap-3">
                             <button 
                              onClick={() => toggleLayer(layer.id)}
                              className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${layer.visible ? 'text-blue-500' : 'text-slate-600'}`}
                             >
                                <i className={`fa-solid ${layer.visible ? 'fa-eye' : 'fa-eye-slash'} text-[10px]`}></i>
                             </button>
                             <span className={`text-[11px] font-bold ${layer.visible ? 'text-slate-200' : 'text-slate-600'}`}>{layer.name}</span>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             {layer.color && (
                                <div className="w-3 h-3 rounded shadow-sm" style={{ backgroundColor: layer.color }}></div>
                             )}
                             <button className="text-slate-600 hover:text-slate-300"><i className="fa-solid fa-lock text-[8px]"></i></button>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Style Presets */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">全局配色预设</h4>
                 <div className="grid grid-cols-1 gap-3">
                    {presets.map(preset => (
                       <button 
                        key={preset.id}
                        onClick={() => setActivePreset(preset.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                           activePreset === preset.id 
                           ? 'bg-blue-600/10 border-blue-500' 
                           : 'bg-white/5 border-white/5 hover:border-white/20'
                        }`}
                       >
                          <p className={`text-[11px] font-black mb-0.5 ${activePreset === preset.id ? 'text-blue-400' : 'text-slate-200'}`}>{preset.name}</p>
                          <p className="text-[9px] text-slate-500 leading-tight">{preset.desc}</p>
                       </button>
                    ))}
                 </div>
              </div>
           </div>

           {/* Stats Summary */}
           <div className="p-6 bg-black/20 border-t border-white/5 space-y-4">
              <div className="flex justify-between items-center text-[10px] font-bold">
                 <span className="text-slate-500 uppercase tracking-widest">画布 DPI</span>
                 <span className="text-slate-300">300 (Vector Optimized)</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold">
                 <span className="text-slate-500 uppercase tracking-widest">最后编辑</span>
                 <span className="text-slate-300">刚刚</span>
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
};

export default GraphicStyleEditor;
