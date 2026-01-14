
import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_ASSETS } from '../constants';
import { PageId, Language, GraphicAsset } from '../types';

interface AssetGraphProps {
  onNavigate: (page: PageId, data?: any) => void;
  lang: Language;
}

type NodeType = 'root' | 'oilfield' | 'profession' | 'asset' | 'semantic-dim' | 'axis-hub';

interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  x: number;
  y: number;
  color: string;
  icon: string;
  data?: any;
}

interface GraphLink {
  source: string;
  target: string;
  type: 'hierarchy' | 'semantic' | 'axis';
}

const AssetGraph: React.FC<AssetGraphProps> = ({ onNavigate, lang }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoverNodeId, setHoverNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'global' | 'dimension'>('global');

  // Define dimension configuration for the topology
  const dimensions = [
    { key: 'object', label: '对象 (Object)', color: '#3b82f6', icon: 'fa-cube' },
    { key: 'business', label: '业务 (Biz)', color: '#10b981', icon: 'fa-briefcase' },
    { key: 'work', label: '工作 (Work)', color: '#f59e0b', icon: 'fa-hammer' },
    { key: 'profession', label: '专业 (Prof)', color: '#6366f1', icon: 'fa-microscope' },
    { key: 'process', label: '流程 (Proc)', color: '#ec4899', icon: 'fa-diagram-project' },
  ];

  // Calculate full graph data based on current viewMode
  const graphData = useMemo(() => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const centerX = 400;
    const centerY = 350;

    if (viewMode === 'global') {
      // 1. Root Node
      nodes.push({
        id: 'root',
        label: '图形知识全库',
        type: 'root',
        x: centerX,
        y: centerY,
        color: '#ffffff',
        icon: 'fa-database'
      });

      // 2. Oilfield Nodes (Inner Ring)
      const uniqueOilfields = Array.from(new Set(MOCK_ASSETS.map(a => a.oilfield)));
      uniqueOilfields.forEach((field, i) => {
        const angle = (i / uniqueOilfields.length) * Math.PI * 2;
        const radius = 140;
        const id = `field-${field}`;
        nodes.push({
          id,
          label: field,
          type: 'oilfield',
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          color: '#3b82f6',
          icon: 'fa-mountain'
        });
        links.push({ source: 'root', target: id, type: 'hierarchy' });
      });

      // 3. Profession Nodes (Secondary Hubs)
      const uniqueProfessions = Array.from(new Set(MOCK_ASSETS.map(a => a.profession)));
      uniqueProfessions.forEach((prof, i) => {
        const angle = (i / uniqueProfessions.length) * Math.PI * 2 + (Math.PI / 6);
        const radius = 240;
        const id = `prof-${prof}`;
        nodes.push({
          id,
          label: prof,
          type: 'profession',
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          color: '#10b981',
          icon: 'fa-microscope'
        });
        links.push({ source: 'root', target: id, type: 'hierarchy' });
      });

      // 4. Asset Nodes (Outer Mesh)
      MOCK_ASSETS.forEach((asset, i) => {
        const fieldNode = nodes.find(n => n.id === `field-${asset.oilfield}`);
        const profNode = nodes.find(n => n.id === `prof-${asset.profession}`);
        if (!fieldNode || !profNode) return;

        const mixX = (fieldNode.x * 0.6 + profNode.x * 0.4);
        const mixY = (fieldNode.y * 0.6 + profNode.y * 0.4);
        const jitter = 60;
        const angle = (i / MOCK_ASSETS.length) * Math.PI * 2;
        
        const id = asset.id;
        nodes.push({
          id,
          label: asset.title,
          type: 'asset',
          x: mixX + Math.cos(angle) * jitter,
          y: mixY + Math.sin(angle) * jitter,
          color: '#6366f1',
          icon: 'fa-file-image',
          data: asset
        });

        links.push({ source: fieldNode.id, target: id, type: 'hierarchy' });
        links.push({ source: profNode.id, target: id, type: 'hierarchy' });
      });
    } else {
      // DIMENSION TOPOLOGY MODE
      // 1. Central Semantic Bridge Node
      nodes.push({
        id: 'semantic-core',
        label: '5D 语义核心',
        type: 'root',
        x: centerX,
        y: centerY,
        color: '#ffffff',
        icon: 'fa-microchip'
      });

      // 2. Axis Hubs (The 5 Dimensions arranged in a pentagon)
      dimensions.forEach((dim, i) => {
        const angle = (i / dimensions.length) * Math.PI * 2 - Math.PI / 2;
        const radius = 180;
        const axisId = `axis-${dim.key}`;
        nodes.push({
          id: axisId,
          label: dim.label,
          type: 'axis-hub',
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          color: dim.color,
          icon: dim.icon
        });
        links.push({ source: 'semantic-core', target: axisId, type: 'axis' });

        // 3. Cluster unique values for this dimension around its hub
        const uniqueValues = Array.from(new Set(MOCK_ASSETS.map(a => (a.coordinates5D as any)?.[dim.key]).filter(Boolean)));
        uniqueValues.forEach((val, valIdx) => {
          const valAngle = angle + (valIdx - (uniqueValues.length - 1) / 2) * 0.3;
          const valRadius = 280;
          const valId = `dim-${dim.key}-${val}`;
          nodes.push({
            id: valId,
            label: val as string,
            type: 'semantic-dim',
            x: centerX + Math.cos(valAngle) * valRadius,
            y: centerY + Math.sin(valAngle) * valRadius,
            color: dim.color,
            icon: 'fa-tag'
          });
          links.push({ source: axisId, target: valId, type: 'hierarchy' });
        });
      });

      // 4. Asset Nodes (Positioned on the outermost rim)
      MOCK_ASSETS.forEach((asset, i) => {
        const angle = (i / MOCK_ASSETS.length) * Math.PI * 2;
        const radius = 330;
        const assetId = asset.id;
        nodes.push({
          id: assetId,
          label: asset.title,
          type: 'asset',
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          color: '#6366f1',
          icon: 'fa-file-image',
          data: asset
        });

        // Connect asset to all its 5D coordinate values
        dimensions.forEach(dim => {
          const val = (asset.coordinates5D as any)?.[dim.key];
          if (val) {
            links.push({ source: assetId, target: `dim-${dim.key}-${val}`, type: 'semantic' });
          }
        });
      });
    }

    return { nodes, links };
  }, [viewMode, dimensions]);

  const filteredNodes = useMemo(() => {
    if (!searchQuery) return graphData.nodes;
    const q = searchQuery.toLowerCase();
    return graphData.nodes.filter(n => 
      n.label.toLowerCase().includes(q) || 
      n.type.includes(q)
    );
  }, [graphData.nodes, searchQuery]);

  const activeLinks = useMemo(() => {
    const focusId = hoverNodeId || selectedNodeId;
    if (!focusId) return [];
    return graphData.links.filter(l => l.source === focusId || l.target === focusId);
  }, [selectedNodeId, hoverNodeId, graphData.links]);

  const relatedNodeIds = useMemo(() => {
    const ids = new Set<string>();
    activeLinks.forEach(l => {
      ids.add(l.source);
      ids.add(l.target);
    });
    return ids;
  }, [activeLinks]);

  const selectedAsset = useMemo(() => 
    MOCK_ASSETS.find(a => a.id === selectedNodeId), 
  [selectedNodeId]);

  return (
    <div className="h-full flex flex-col gap-6 animate-fadeIn relative overflow-hidden pb-10">
      
      <header className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
             <i className="fa-solid fa-circle-nodes text-blue-600"></i>
             图形资产知识图谱
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
             {viewMode === 'global' ? 'Enterprise Graphic Semantic Knowledge Network (Oilfield Focus)' : 'Multi-Dimensional 5D Semantic Topology (Coordinate Focus)'}
          </p>
        </div>

        <div className="flex gap-4">
           <div className="relative group">
              <input 
                type="text" 
                placeholder="在图谱中搜索节点..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-slate-100 rounded-2xl px-12 py-3 text-xs font-bold w-64 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
              />
              <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-50 transition-colors"></i>
           </div>
           <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
              <button 
                onClick={() => { setViewMode('global'); setSelectedNodeId(null); }}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'global' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'}`}
              >
                全局视图
              </button>
              <button 
                onClick={() => { setViewMode('dimension'); setSelectedNodeId(null); }}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'dimension' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'}`}
              >
                维度拓扑
              </button>
           </div>
        </div>
      </header>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Main Knowledge Graph Canvas */}
        <div className="flex-1 bg-slate-950 rounded-[48px] border border-white/5 relative overflow-hidden group shadow-2xl">
           <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
           
           <svg className="w-full h-full select-none cursor-grab active:cursor-grabbing" viewBox="0 0 800 700">
             <defs>
                <filter id="nodeGlow">
                   <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                   <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                   </feMerge>
                </filter>
                <linearGradient id="linkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                   <stop offset="0%" stopColor="rgba(59,130,246,0.1)" />
                   <stop offset="100%" stopColor="rgba(99,102,241,0.4)" />
                </linearGradient>
             </defs>

             {/* Background Hierarchy Links */}
             <g>
                {graphData.links.map((link, i) => {
                  const s = graphData.nodes.find(n => n.id === link.source)!;
                  const t = graphData.nodes.find(n => n.id === link.target)!;
                  const isActive = activeLinks.some(al => al === link);
                  const isAxisLink = link.type === 'axis';
                  
                  return (
                    <line 
                      key={i} 
                      x1={s.x} y1={s.y} x2={t.x} y2={t.y} 
                      stroke={isActive ? (link.type === 'semantic' ? '#f59e0b' : '#3b82f6') : (isAxisLink ? 'white' : 'white')} 
                      strokeWidth={isActive ? 3 : (isAxisLink ? 1.5 : 0.4)} 
                      opacity={isActive ? 1 : (isAxisLink ? 0.3 : 0.1)}
                      strokeDasharray={link.type === 'semantic' ? '3 3' : (isAxisLink ? '8 4' : 'none')}
                      className="transition-all duration-700"
                    />
                  );
                })}
             </g>

             {/* Graph Nodes */}
             {graphData.nodes.map(node => {
               const isSelected = selectedNodeId === node.id;
               const isHovered = hoverNodeId === node.id;
               const isRelated = relatedNodeIds.has(node.id);
               const isVisible = filteredNodes.some(n => n.id === node.id);

               if (!isVisible && !isSelected && !isHovered) return null;

               const size = node.type === 'root' ? 45 : node.type === 'axis-hub' ? 38 : node.type === 'oilfield' ? 32 : node.type === 'profession' ? 26 : node.type === 'asset' ? 18 : 14;
               const fontSize = node.type === 'root' ? 13 : node.type === 'asset' ? 8 : 10;

               return (
                 <g 
                    key={node.id} 
                    className={`cursor-pointer transition-all duration-500 ${!isVisible ? 'opacity-20 scale-75 grayscale' : ''}`}
                    onMouseEnter={() => setHoverNodeId(node.id)}
                    onMouseLeave={() => setHoverNodeId(null)}
                    onClick={() => setSelectedNodeId(node.id)}
                    style={{ transform: (isSelected || isHovered) ? 'scale(1.15)' : 'scale(1)' }}
                 >
                    {/* Active State Ring */}
                    {(isSelected || isHovered || isRelated) && (
                      <circle 
                        cx={node.x} cy={node.y} r={size + 10} 
                        fill="none" stroke={node.color} strokeWidth="1.5" 
                        className="animate-pulse opacity-50"
                        filter="url(#nodeGlow)"
                      />
                    )}

                    <circle 
                       cx={node.x} cy={node.y} 
                       r={size} 
                       fill="#0f172a" 
                       stroke={node.color} 
                       strokeWidth={isSelected ? 4 : 1.5}
                       className="transition-all"
                    />

                    <foreignObject 
                      x={node.x - (size/2)} 
                      y={node.y - (size/2)} 
                      width={size} 
                      height={size}
                    >
                       <div className="w-full h-full flex items-center justify-center">
                          <i className={`fa-solid ${node.icon}`} style={{ color: node.color, fontSize: `${size * 0.45}px` }}></i>
                       </div>
                    </foreignObject>

                    <text 
                       x={node.x} y={node.y + size + 16} 
                       fill="white" 
                       fontSize={fontSize} 
                       fontWeight="black" 
                       textAnchor="middle" 
                       className={`transition-opacity uppercase tracking-widest drop-shadow-md pointer-events-none ${isSelected || isHovered || !selectedNodeId ? 'opacity-90' : 'opacity-20'}`}
                    >
                       {node.label}
                    </text>
                 </g>
               );
             })}
           </svg>

           {/* Floating Legend */}
           <div className="absolute top-10 left-10 space-y-4 pointer-events-none">
              <div className="bg-black/60 backdrop-blur-xl p-6 rounded-[32px] border border-white/10 shadow-2xl">
                 <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4">图谱节点图例</h4>
                 <div className="space-y-3">
                    {[
                      { label: '5D 语义中枢', color: 'bg-white', icon: 'fa-microchip' },
                      { label: '语义坐标轴', color: 'bg-indigo-400', icon: 'fa-arrows-to-circle' },
                      { label: '语义维度值', color: 'bg-emerald-400', icon: 'fa-tag' },
                      { label: '图形资产实体', color: 'bg-blue-500', icon: 'fa-file-image' },
                    ].map(item => (
                       <div key={item.label} className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${item.color}`}></div>
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">{item.label}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Interactive Instruction Overlay */}
           <div className="absolute bottom-10 left-10 bg-blue-600/10 backdrop-blur-md px-6 py-4 rounded-3xl border border-blue-500/20 max-w-sm pointer-events-none">
              <p className="text-[11px] text-blue-200 leading-relaxed font-medium">
                 <i className="fa-solid fa-circle-info mr-2"></i>
                 {viewMode === 'global' 
                   ? '“全局模式”以物理工区和专业为核心进行资产聚合展示。'
                   : '“维度拓扑”将资产根据 5D 语义坐标进行挂载。点击轴点可展开该轴线下的所有业务特征值。'}
              </p>
           </div>
        </div>

        {/* Right Info Context Panel */}
        <aside className="w-[420px] flex flex-col gap-6 shrink-0">
           <div className="flex-1 bg-white rounded-[48px] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
              {selectedAsset ? (
                <div className="flex flex-col h-full animate-fadeIn">
                   <div className="p-8 border-b border-slate-50 flex-shrink-0 bg-slate-50/50">
                      <div className="flex items-center justify-between mb-4">
                         <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-100">Semantic Focus</span>
                         <button onClick={() => setSelectedNodeId(null)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-300 hover:text-rose-500 shadow-sm border border-slate-100 transition-all">
                            <i className="fa-solid fa-xmark text-xs"></i>
                         </button>
                      </div>
                      <h3 className="text-xl font-black text-slate-800 leading-tight mb-3">{selectedAsset.title}</h3>
                      <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                         <span className="flex items-center gap-1.5"><i className="fa-solid fa-mountain text-blue-500"></i> {selectedAsset.oilfield}</span>
                         <span className="flex items-center gap-1.5"><i className="fa-solid fa-microscope text-emerald-500"></i> {selectedAsset.profession}</span>
                      </div>
                   </div>

                   <div className="flex-1 overflow-y-auto p-8 space-y-8">
                      <div className="rounded-[32px] overflow-hidden border border-slate-100 bg-slate-50 shadow-inner group relative">
                         <img src={selectedAsset.thumbnail} className="w-full h-44 object-cover group-hover:scale-110 transition-transform duration-1000" />
                      </div>
                      
                      <div className="space-y-4">
                         <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <i className="fa-solid fa-microchip text-indigo-500"></i>
                            五维语义坐标对齐状态
                         </h5>
                         <div className="grid grid-cols-1 gap-2.5">
                            {Object.entries(selectedAsset.coordinates5D || {}).map(([key, val]) => (
                               <div key={key} className="flex justify-between items-center p-4 bg-slate-50 rounded-[20px] border border-transparent hover:border-indigo-100 group transition-all">
                                  <div className="flex items-center gap-3">
                                     <div className="w-2 h-2 rounded-full bg-indigo-300"></div>
                                     <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{key}</span>
                                  </div>
                                  <span className="text-[11px] font-black text-slate-700">{val}</span>
                               </div>
                            ))}
                         </div>
                      </div>

                      {selectedAsset.figureNote && (
                        <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100">
                           <p className="text-[11px] text-emerald-800 font-medium italic leading-relaxed">
                              “{selectedAsset.figureNote}”
                           </p>
                        </div>
                      )}
                   </div>

                   <div className="p-8 border-t border-slate-100 bg-slate-50 flex-shrink-0">
                      <button 
                        onClick={() => onNavigate('detail', selectedAsset)}
                        className="w-full py-4 bg-slate-900 text-white rounded-[20px] font-black text-xs shadow-2xl hover:bg-black transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                      >
                         <i className="fa-solid fa-location-arrow"></i>
                         定位至资产详情页
                      </button>
                   </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                   <div className="relative mb-10">
                      <div className="w-24 h-24 rounded-[40px] bg-slate-100 flex items-center justify-center rotate-12 shadow-inner">
                         <i className="fa-solid fa-share-nodes text-5xl text-slate-200"></i>
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl animate-bounce">
                         <i className="fa-solid fa-mouse-pointer text-xs"></i>
                      </div>
                   </div>
                   <h4 className="text-base font-black text-slate-800 uppercase tracking-widest">探索拓扑关系</h4>
                   <p className="text-xs text-slate-400 mt-4 leading-relaxed max-w-[240px] mx-auto font-medium">
                      请在左侧图谱中选择<span className="text-indigo-600 font-bold">任何节点</span>。在维度拓扑模式下，您可以清晰观察到同一业务环节（如“产能建设”）下沉淀的所有专业图件。
                   </p>
                </div>
              )}
           </div>

           <div className="bg-slate-900 text-white p-8 rounded-[48px] shadow-2xl space-y-6 relative overflow-hidden group">
              <h4 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-3">
                 <i className="fa-solid fa-wand-magic-sparkles"></i>
                 维度冲突分析 (AI)
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                 AI 正在自动监测 <span className="text-white font-bold">5D 语义坐标</span> 的完整度。当前库中有 <span className="text-rose-400">14%</span> 的资产缺少“流程”维度挂载，建议启动批量自动归档工具。
              </p>
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all">
                 开启语义自动对齐
              </button>
           </div>
        </aside>
      </div>
    </div>
  );
};

export default AssetGraph;
