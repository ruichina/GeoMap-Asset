
import React, { useState, useEffect } from 'react';
import { GraphicAsset, PageId } from '../types';

interface OverlayCompareProps {
  selectedAssets?: GraphicAsset[];
  onAddAsset?: (asset: GraphicAsset) => void;
  onNavigate: (page: PageId, data?: any) => void;
}

const OverlayCompare: React.FC<OverlayCompareProps> = ({ 
  selectedAssets = [], 
  onAddAsset,
  onNavigate 
}) => {
  const [layers, setLayers] = useState<any[]>([]);

  useEffect(() => {
    if (selectedAssets.length > 0) {
      setLayers(selectedAssets.map((asset, index) => ({
        id: asset.id,
        name: asset.title + (index === 0 ? ' (底图)' : ''),
        opacity: index === 0 ? 100 : 60,
        visible: true,
        img: asset.thumbnail,
        color: index === 0 ? 'text-blue-500' : 'text-emerald-500'
      })));
    } else {
      setLayers([
        { id: '1', name: '基础构造图 (底层)', opacity: 100, visible: true, color: 'text-blue-500', img: 'https://picsum.photos/seed/layer1/800/600' },
        { id: '2', name: '油水界面图', opacity: 60, visible: true, color: 'text-emerald-500', img: 'https://picsum.photos/seed/layer2/800/600' },
      ]);
    }
  }, [selectedAssets]);

  const updateOpacity = (id: string | number, val: number) => {
    setLayers(layers.map(l => l.id === id ? { ...l, opacity: val } : l));
  };

  const toggleVisible = (id: string | number) => {
    setLayers(layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  };

  const saveAsNewGraphic = () => {
    const timestamp = Date.now();
    const newAsset: GraphicAsset = {
      id: `merged-${timestamp}`,
      title: `叠加组合图件_${new Date().toLocaleDateString()}`,
      category: selectedAssets[0]?.category || '综合',
      profession: selectedAssets[0]?.profession || '多学科',
      oilfield: selectedAssets[0]?.oilfield || '未知区域',
      stage: '成果集成',
      thumbnail: layers[0]?.img || 'https://picsum.photos/seed/merged/400/300',
      lastUpdate: new Date().toISOString().split('T')[0],
      version: 'V1.0',
      status: 'draft', 
      tags: ['叠加对比', '组合成果'],
      format: 'SVG / TIFF',
      creationTime: new Date().toISOString().split('T')[0],
      constructionType: '综合图件',
      graphicType: 'static',
    };

    if (onAddAsset) {
      onAddAsset(newAsset);
      alert(`叠加状态已保存为新资产：${newAsset.title}。已自动加入发布评审-待提交列表。`);
      onNavigate('review');
    }
  };

  return (
    <div className="flex h-full gap-6 animate-fadeIn">
      {/* Canvas Area */}
      <div className="flex-1 bg-slate-200 rounded-3xl border border-slate-300 shadow-inner overflow-hidden relative flex items-center justify-center p-12">
         {/* Floating Back Button */}
         <button 
           onClick={() => onNavigate('detail', selectedAssets[0])}
           className="absolute top-6 left-6 w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-600 hover:text-blue-600 transition-all shadow-xl z-20 group"
         >
           <i className="fa-solid fa-chevron-left group-hover:-translate-x-0.5 transition-transform"></i>
         </button>

         {/* Main Canvas Base */}
         <div className="w-full h-full relative bg-white shadow-2xl rounded-lg overflow-hidden">
            {layers.map((layer) => (
              <img 
                key={layer.id}
                src={layer.img}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                style={{ 
                  opacity: layer.visible ? layer.opacity / 100 : 0,
                  mixBlendMode: 'multiply'
                }}
              />
            ))}
            <div className="absolute inset-0 pointer-events-none border border-slate-200 flex flex-wrap opacity-20">
               {[...Array(64)].map((_, i) => <div key={i} className="w-[12.5%] h-[12.5%] border-r border-b border-slate-400"></div>)}
            </div>
         </div>

         <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-6 py-2 rounded-full shadow-2xl border border-slate-100 flex items-center gap-6">
            <button className="text-slate-600 hover:text-blue-600 transition-all font-bold text-xs"><i className="fa-solid fa-hand mr-2"></i> 抓手</button>
            <button className="text-slate-600 hover:text-blue-600 transition-all font-bold text-xs"><i className="fa-solid fa-arrow-pointer mr-2"></i> 选择</button>
            <button className="text-slate-600 hover:text-blue-600 transition-all font-bold text-xs"><i className="fa-solid fa-ruler mr-2"></i> 测量</button>
         </div>
      </div>

      {/* Layer Panel */}
      <aside className="w-96 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-slate-800">图层堆叠管理</h4>
          </div>
          <div className="space-y-4">
            {layers.map(layer => (
              <div key={layer.id} className="p-4 rounded-xl border border-slate-50 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <button onClick={() => toggleVisible(layer.id)} className={`${layer.visible ? 'text-blue-600' : 'text-slate-300'}`}>
                       <i className={`fa-solid ${layer.visible ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                     </button>
                     <span className={`text-sm font-bold ${layer.visible ? 'text-slate-800' : 'text-slate-400'}`}>{layer.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <input type="range" min="0" max="100" value={layer.opacity} onChange={(e) => updateOpacity(layer.id, parseInt(e.target.value))} className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                  <span className="text-[10px] font-mono text-slate-500 w-8">{layer.opacity}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-4">
           <button onClick={saveAsNewGraphic} className="w-full bg-blue-600 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
              <i className="fa-solid fa-cloud-arrow-up"></i>
              保存为新图形
           </button>
        </div>
      </aside>
    </div>
  );
};

export default OverlayCompare;
