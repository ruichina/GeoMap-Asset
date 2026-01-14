import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MOCK_ASSETS } from '../constants';
import { PageId, Language, GraphicAsset } from '../types';

declare const Cesium: any;

interface SpatialDistributionProps {
  onNavigate: (page: PageId, data?: any) => void;
  lang: Language;
}

// 物理对象地理坐标映射
const PHYSICAL_OBJECTS_MAP: Record<string, { lat: number; lng: number; type: 'field' | 'well' }> = {
  '萨尔图': { lat: 46.5833, lng: 124.9167, type: 'field' },
  '顺北5号': { lat: 41.25, lng: 82.55, type: 'field' },
  'JZ9-3': { lat: 40.521, lng: 121.212, type: 'field' },
  '威远-长宁': { lat: 29.48, lng: 104.77, type: 'field' },
  '哈拉哈塘': { lat: 41.515, lng: 82.882, type: 'field' },
  '渤海湾': { lat: 38.55, lng: 119.45, type: 'field' },
  '胜利东部': { lat: 37.52, lng: 118.48, type: 'field' },
  '大庆': { lat: 46.50, lng: 125.01, type: 'field' },
  '安塞': { lat: 36.85, lng: 109.32, type: 'field' },
  '顺北核心': { lat: 41.05, lng: 82.35, type: 'field' },
  '顺北': { lat: 41.15, lng: 82.45, type: 'field' },
  'S-101': { lat: 46.592, lng: 124.931, type: 'well' },
  'W-204H': { lat: 29.492, lng: 104.785, type: 'well' },
  'HA-6': { lat: 41.522, lng: 82.895, type: 'well' },
  '塔里木': { lat: 41.73, lng: 82.96, type: 'field' },
};

const SpatialDistribution: React.FC<SpatialDistributionProps> = ({ onNavigate, lang }) => {
  const cesiumContainerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const highlightedEntityRef = useRef<any>(null);
  const boundaryEntitiesRef = useRef<Record<string, any>>({});
  
  const [isCesiumReady, setIsCesiumReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [activeAssetId, setActiveAssetId] = useState<string | null>(null);
  const [targetSearch, setTargetSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'field' | 'well'>('all');
  const [isLeftPanelExpanded, setIsLeftPanelExpanded] = useState(true);

  // 组织空间分布数据：按物理对象聚合资产
  const spatialDistributionData: Record<string, GraphicAsset[]> = useMemo(() => {
    const mapping: Record<string, GraphicAsset[]> = {};
    MOCK_ASSETS.forEach(asset => {
      const key = (asset.wellId && PHYSICAL_OBJECTS_MAP[asset.wellId]) 
        ? asset.wellId 
        : (PHYSICAL_OBJECTS_MAP[asset.oilfield] ? asset.oilfield : '未知区域');
      if (!mapping[key]) mapping[key] = [];
      mapping[key].push(asset);
    });
    return mapping;
  }, []);

  const filteredTargets = useMemo(() => {
    const targets = Object.keys(PHYSICAL_OBJECTS_MAP);
    return targets.filter(t => {
      const matchSearch = t.toLowerCase().includes(targetSearch.toLowerCase());
      const type = PHYSICAL_OBJECTS_MAP[t].type;
      const matchType = activeFilter === 'all' || activeFilter === type;
      return matchSearch && matchType;
    });
  }, [targetSearch, activeFilter]);

  useEffect(() => {
    if (!cesiumContainerRef.current || viewerRef.current) return;

    /**
     * CRITICAL FIX: Ensure the base URL is absolute. 
     * Relative URLs in WorkerGlobalScope often fail on CDNs.
     */
    const baseUrl = 'https://cdn.jsdelivr.net/npm/cesium@1.114.0/Build/Cesium/';
    (window as any).CESIUM_BASE_URL = baseUrl;

    const initCesium = async () => {
      try {
        if (Cesium.buildModuleUrl) {
          Cesium.buildModuleUrl.setBaseUrl(baseUrl);
        }

        // 1. 配置 Google 地球混合影像 (imagery)
        const googleHybridProvider = new Cesium.UrlTemplateImageryProvider({
          url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
          subdomains: ['0', '1', '2', '3']
        });

        const viewer = new Cesium.Viewer(cesiumContainerRef.current!, {
          animation: false,
          baseLayerPicker: false,
          imageryProvider: googleHybridProvider,
          fullscreenButton: false,
          geocoder: false,
          homeButton: false,
          infoBox: false,
          sceneModePicker: false,
          timeline: false,
          navigationHelpButton: false,
          scene3DOnly: true,
          requestRenderMode: true,
          maximumRenderTimeChange: Infinity,
          skyAtmosphere: false, // Set to false to avoid Pi.updateEnvironment crash in 1.114.0
          msaaSamples: 4,
          fog: true
        });

        // 2. 加载全球地形 (Terrain)
        try {
          const worldTerrain = await Cesium.Terrain.fromWorldTerrain();
          viewer.terrainProvider = worldTerrain;
        } catch (error) {
          console.warn("World terrain failed to load, using default ellipsoid.");
        }

        // 3. 尝试加载 Google Photorealistic 3D Tiles
        try {
          const tileset = await Cesium.createGooglePhotorealistic3DTileset();
          viewer.scene.primitives.add(tileset);
        } catch (e) {
          console.debug("Photorealistic tileset skipped or failed.");
        }

        /**
         * FIX: setDynamicLighting crash. 
         * In Cesium 1.114.0, using enableLighting=true with specific atmospheric settings 
         * can trigger errors in the internal update cycle. Keeping it false is safest.
         */
        viewer.scene.globe.enableLighting = false;

        viewerRef.current = viewer;
        setIsCesiumReady(true);

        // 4. 批量添加业务节点
        Object.entries(spatialDistributionData).forEach(([name, assets]) => {
          const pos = PHYSICAL_OBJECTS_MAP[name];
          if (!pos) return;
          const isField = pos.type === 'field';
          const themeColor = isField ? '#3b82f6' : '#f59e0b';
          
          const boundaryEntity = viewer.entities.add({
            id: `boundary-${name}`,
            name: `${name} 范围`,
            position: Cesium.Cartesian3.fromDegrees(pos.lng, pos.lat),
            ...(isField ? {
              rectangle: {
                coordinates: Cesium.Rectangle.fromDegrees(pos.lng - 0.04, pos.lat - 0.03, pos.lng + 0.04, pos.lat + 0.03),
                material: Cesium.Color.fromCssColorString(themeColor).withAlpha(0.15),
                outline: true,
                outlineColor: Cesium.Color.fromCssColorString(themeColor).withAlpha(0.6),
                outlineWidth: 2,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
              }
            } : {
              ellipse: {
                semiMinorAxis: 1000.0,
                semiMajorAxis: 1000.0,
                material: Cesium.Color.fromCssColorString(themeColor).withAlpha(0.2),
                outline: true,
                outlineColor: Cesium.Color.fromCssColorString(themeColor).withAlpha(0.6),
                outlineWidth: 2,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
              }
            })
          });
          boundaryEntitiesRef.current[name] = boundaryEntity;

          const svgContent = `
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="22" fill="rgba(15,23,42,0.8)" stroke="${themeColor}" stroke-width="3"/>
              <circle cx="30" cy="30" r="6" fill="${themeColor}"/>
              <path d="M30 12 L30 22 M30 38 L30 48 M12 30 L22 30 M38 30 L48 30" stroke="white" stroke-width="2" opacity="0.6"/>
            </svg>`;

          viewer.entities.add({
            id: `node-${name}`,
            position: Cesium.Cartesian3.fromDegrees(pos.lng, pos.lat),
            properties: { type: 'business-node', objectId: name },
            billboard: {
              image: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgContent),
              width: 32, height: 32,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
              verticalOrigin: Cesium.VerticalOrigin.CENTER
            },
            label: {
              text: `${name}\n[${assets.length} Assets]`,
              font: 'black 12px "Inter", sans-serif',
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 4, outlineColor: Cesium.Color.BLACK,
              fillColor: Cesium.Color.WHITE,
              pixelOffset: new Cesium.Cartesian2(0, -40),
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5000000)
            }
          });
        });

        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction((click: any) => {
          const picked = viewer.scene.pick(click.position);
          if (Cesium.defined(picked) && picked.id && picked.id.properties) {
            const props = picked.id.properties.getValue(Cesium.JulianDate.now());
            if (props.type === 'business-node') handleFocusObject(props.objectId);
          } else {
            resetSelection();
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(108.95, 34.27, 18000000),
          orientation: { heading: 0, pitch: Cesium.Math.toRadians(-90), roll: 0 }
        });

        setTimeout(() => {
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(108, 34, 4000000),
            duration: 2.5,
            easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT
          });
        }, 500);

      } catch (e) {
        console.error("Cesium Reconstruction Error:", e);
        setHasError(true);
        // FIX [object Object]: Ensure error is converted to string for React to render
        const msg = e instanceof Error ? e.message : (typeof e === 'object' ? JSON.stringify(e) : String(e));
        setErrorMessage(msg);
      }
    };

    initCesium();

    return () => { 
      if (viewerRef.current && !viewerRef.current.isDestroyed()) { 
        viewerRef.current.destroy(); 
        viewerRef.current = null; 
      } 
    };
  }, [spatialDistributionData]);

  const resetSelection = () => {
    if (highlightedEntityRef.current) {
      highlightedEntityRef.current.billboard.scale = 1.0;
      highlightedEntityRef.current = null;
    }
    Object.entries(boundaryEntitiesRef.current).forEach(([name, entity]: [string, any]) => {
      const isField = PHYSICAL_OBJECTS_MAP[name]?.type === 'field';
      const color = Cesium.Color.fromCssColorString(isField ? '#3b82f6' : '#f59e0b');
      if (entity.rectangle) entity.rectangle.outlineColor = color.withAlpha(0.6);
      if (entity.ellipse) entity.ellipse.outlineColor = color.withAlpha(0.6);
    });
    setSelectedObjectId(null);
    setActiveAssetId(null);
  };

  const handleFocusObject = (name: string) => {
    const pos = PHYSICAL_OBJECTS_MAP[name];
    if (!pos || !viewerRef.current) return;
    
    resetSelection();
    setSelectedObjectId(name);
    
    const entity = viewerRef.current.entities.getById(`node-${name}`);
    if (entity) {
      entity.billboard.scale = 1.6;
      highlightedEntityRef.current = entity;
    }

    const boundary: any = boundaryEntitiesRef.current[name];
    if (boundary) {
      const highlightColor = Cesium.Color.WHITE;
      if (boundary.rectangle) boundary.rectangle.outlineColor = highlightColor;
      if (boundary.ellipse) boundary.ellipse.outlineColor = highlightColor;
    }

    const height = pos.type === 'well' ? 5000 : 20000;
    const offset = pos.type === 'well' ? 0.01 : 0.05;

    viewerRef.current.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(pos.lng + offset, pos.lat - offset, height),
      duration: 2,
      orientation: {
        pitch: Cesium.Math.toRadians(-45),
        heading: Cesium.Math.toRadians(-10),
        roll: 0
      },
      easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT
    });
  };

  return (
    <div className="h-full flex flex-col animate-fadeIn relative overflow-hidden bg-slate-950">
      {/* 顶部悬浮控制栏 */}
      <header className="absolute top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 px-8 py-3.5 bg-slate-900/60 backdrop-blur-2xl rounded-[32px] border border-white/10 shadow-2xl transition-all hover:bg-slate-900/80 group">
        <div className="flex items-center gap-4 border-r border-white/10 pr-6 mr-2">
           <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform duration-500">
              <i className="fa-solid fa-earth-asia text-lg"></i>
           </div>
           <div>
              <h2 className="text-sm font-black text-white tracking-tight leading-none uppercase">GeoSpatial Intelligence</h2>
              <p className="text-[9px] text-blue-400 font-bold tracking-[0.3em] mt-1.5 opacity-80">Enterprise GIS Engine v4.0</p>
           </div>
        </div>
        <div className="flex gap-2">
           <button onClick={() => onNavigate('search')} className="text-[11px] font-black text-slate-300 hover:text-white transition-colors flex items-center gap-2.5 px-4 py-2 rounded-xl hover:bg-white/5">
              <i className="fa-solid fa-magnifying-glass"></i> 全局检索
           </button>
           <button className="text-[11px] font-black text-slate-300 hover:text-white transition-colors flex items-center gap-2.5 px-4 py-2 rounded-xl hover:bg-white/5">
              <i className="fa-solid fa-layer-group"></i> 图层叠加
           </button>
           <button className="text-[11px] font-black text-slate-300 hover:text-white transition-colors flex items-center gap-2.5 px-4 py-2 rounded-xl hover:bg-white/5">
              <i className="fa-solid fa-compass"></i> 测绘分析
           </button>
        </div>
      </header>

      {/* 地图核心区域 */}
      <div className="flex-1 relative w-full h-full overflow-hidden">
         {!isCesiumReady && !hasError && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-white z-50">
              <div className="relative">
                 <div className="w-24 h-24 border-4 border-blue-500/10 border-t-blue-600 rounded-full animate-spin"></div>
                 <i className="fa-solid fa-earth-americas absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl text-blue-500/50"></i>
              </div>
              <p className="text-[12px] font-black uppercase tracking-[0.5em] text-blue-400 mt-10 animate-pulse">Initializing Global GIS Network...</p>
           </div>
         )}
         
         {hasError ? (
           <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-white p-12 text-center overflow-hidden">
              <i className="fa-solid fa-triangle-exclamation text-rose-500 text-5xl mb-6"></i>
              <h3 className="text-2xl font-black uppercase tracking-widest text-rose-50">GIS Engine Fault</h3>
              <p className="text-sm text-slate-500 mt-6 max-w-xl mx-auto leading-relaxed font-medium">
                地理引擎初始化失败。这通常由 API Key 失效、网络连接限制或 Worker 路径解析错误引起。
              </p>
              {errorMessage && (
                <div className="mt-8 p-6 bg-rose-500/5 rounded-2xl border border-rose-500/20 text-[11px] font-mono text-rose-300 break-all max-w-2xl shadow-inner overflow-hidden">
                   ERROR: {errorMessage}
                </div>
              )}
              <button onClick={() => window.location.reload()} className="mt-10 px-10 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 shadow-xl shadow-blue-600/20 transition-all">重新载入</button>
           </div>
         ) : (
           <div ref={cesiumContainerRef} className="w-full h-full z-0 cursor-crosshair" />
         )}

         {/* 左侧：对象导航面板 */}
         <aside 
            className={`absolute top-0 left-0 h-full z-40 transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) flex group ${isLeftPanelExpanded ? 'w-[360px]' : 'w-6'}`}
         >
            <div className={`h-full bg-slate-950/80 backdrop-blur-3xl border-r border-white/10 flex flex-col overflow-hidden shadow-[50px_0_100px_rgba(0,0,0,0.5)] transition-opacity duration-500 ${isLeftPanelExpanded ? 'opacity-100' : 'opacity-0'}`}>
               <div className="p-10 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent shrink-0">
                  <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                     <i className="fa-solid fa-compass-drafting text-lg"></i> 业务目标扫描
                  </h4>
                  <div className="flex bg-white/5 p-1 rounded-2xl mb-8 border border-white/5 shadow-inner">
                     {(['all', 'field', 'well'] as const).map(type => (
                       <button key={type} onClick={() => setActiveFilter(type)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${activeFilter === type ? 'bg-blue-600 text-white shadow-2xl' : 'text-slate-500 hover:text-slate-300'}`}>
                         {type === 'all' ? '全部' : type === 'field' ? '工区' : '井位'}
                       </button>
                     ))}
                  </div>
                  <div className="relative group">
                     <input 
                        type="text" 
                        placeholder="检索三维实景对象..." 
                        value={targetSearch} 
                        onChange={(e) => setTargetSearch(e.target.value)} 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-xs font-black text-white focus:ring-4 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-600" 
                     />
                     <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 text-xs transition-colors"></i>
                  </div>
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-2 bg-black/20">
                  {filteredTargets.map(name => (
                    <button 
                      key={name} 
                      onClick={() => handleFocusObject(name)} 
                      className={`w-full text-left px-6 py-5 rounded-[28px] transition-all duration-300 flex items-center justify-between group/btn ${selectedObjectId === name ? 'bg-blue-600 text-white shadow-[0_20px_40px_rgba(37,99,235,0.4)] translate-x-2' : 'text-slate-500 hover:bg-white/5 hover:text-slate-100'}`}
                    >
                       <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${selectedObjectId === name ? 'bg-white/20 rotate-12' : 'bg-white/5 text-slate-600 group-hover/btn:text-blue-400'}`}>
                             <i className={`fa-solid ${PHYSICAL_OBJECTS_MAP[name].type === 'field' ? 'fa-mountain-city' : 'fa-bore-hole'} text-sm`}></i>
                          </div>
                          <div>
                             <span className="text-sm font-black block tracking-tight">{name}</span>
                             <span className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${selectedObjectId === name ? 'text-blue-100' : 'text-slate-600'}`}>{PHYSICAL_OBJECTS_MAP[name].type === 'field' ? '3D Field' : 'Production Well'}</span>
                          </div>
                       </div>
                       <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl ${selectedObjectId === name ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>{spatialDistributionData[name]?.length || 0}</span>
                    </button>
                  ))}
               </div>
            </div>
            <button 
                onClick={() => setIsLeftPanelExpanded(!isLeftPanelExpanded)}
                className={`h-full flex items-center justify-center transition-all duration-700 ${isLeftPanelExpanded ? 'w-0' : 'w-6 bg-slate-900 border-r border-white/10 hover:bg-blue-600 transition-colors'}`}
            >
               {!isLeftPanelExpanded && <i className="fa-solid fa-chevron-right text-[10px] text-blue-500/50 animate-pulse"></i>}
            </button>
         </aside>

         {/* 右侧：资产预览面板 */}
         {selectedObjectId && (
           <aside className="absolute top-32 right-12 bottom-12 w-[450px] bg-slate-950/80 backdrop-blur-3xl rounded-[56px] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] z-40 flex flex-col overflow-hidden animate-slideLeft">
              <div className="p-12 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent flex-shrink-0">
                 <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]"></span>
                     <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Spatial Context Locked</span>
                   </div>
                   <button onClick={resetSelection} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-all border border-white/5 hover:bg-white/10 hover:scale-110">
                      <i className="fa-solid fa-xmark"></i>
                   </button>
                 </div>
                 <h3 className="text-4xl font-black text-white leading-tight tracking-tighter mb-2">{selectedObjectId}</h3>
                 <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.3em]">关联图形资产成果库</p>
              </div>
              <div className="flex-1 overflow-y-auto p-12 space-y-8 custom-scrollbar">
                 {(spatialDistributionData[selectedObjectId] || []).map((asset, idx) => (
                    <div 
                      key={asset.id} 
                      onClick={() => { setActiveAssetId(asset.id); onNavigate('detail', asset); }} 
                      className={`p-8 rounded-[48px] border transition-all duration-500 cursor-pointer group flex flex-col gap-6 ${activeAssetId === asset.id ? 'bg-blue-600 border-blue-500 shadow-[0_30px_60px_rgba(37,99,235,0.3)] scale-[1.02]' : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'}`}
                    >
                       <div className="relative h-44 overflow-hidden rounded-[36px] bg-black/40 shadow-inner">
                          <img src={asset.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms] opacity-80" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <div className="absolute bottom-5 left-5 bg-white/20 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-xl text-[9px] font-black text-white uppercase tracking-widest">
                             {asset.category}
                          </div>
                       </div>
                       <div>
                          <p className={`text-base font-black leading-snug line-clamp-2 ${activeAssetId === asset.id ? 'text-white' : 'text-slate-100 group-hover:text-blue-400'}`}>{asset.title}</p>
                          <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/5">
                             <div className="flex flex-col">
                                <span className={`text-[9px] font-black uppercase tracking-widest ${activeAssetId === asset.id ? 'text-blue-200' : 'text-slate-500'}`}>Version Tag</span>
                                <span className={`text-xs font-mono font-black ${activeAssetId === asset.id ? 'text-white' : 'text-slate-300'}`}>{asset.version}</span>
                             </div>
                             <button className={`text-[10px] font-black px-8 py-3 rounded-2xl transition-all duration-500 ${activeAssetId === asset.id ? 'bg-white text-blue-600 shadow-xl' : 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20'}`}>查看详情</button>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </aside>
         )}

         {/* 底部信息栏 */}
         <div className="absolute bottom-10 left-10 flex items-center gap-6 z-40 pointer-events-none">
            <div className="bg-black/70 backdrop-blur-3xl px-8 py-5 rounded-[28px] border border-white/10 shadow-[0_25px_50px_rgba(0,0,0,0.5)] flex items-center gap-12">
               <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em]">Engine System</span>
                  <span className="text-xs font-black text-slate-100 flex items-center gap-2">
                     <i className="fa-solid fa-cube"></i> Google Earth 3D Core
                  </span>
               </div>
               <div className="w-px h-8 bg-white/10"></div>
               <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em]">Projection</span>
                  <span className="text-xs font-black text-slate-100 flex items-center gap-2">
                     <i className="fa-solid fa-compass"></i> CGCS2000 / WGS84
                  </span>
               </div>
               <div className="w-px h-8 bg-white/10"></div>
               <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.3em]">Precision</span>
                  <span className="text-xs font-black text-slate-100 flex items-center gap-2">
                     <i className="fa-solid fa-microscope"></i> Sub-meter Aligned
                  </span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SpatialDistribution;