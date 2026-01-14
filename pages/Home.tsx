import React, { useMemo, useState, useEffect, useRef } from 'react';
import { MOCK_ASSETS, TRANSLATIONS } from '../constants';
import { GraphicAsset, Language, PageId } from '../types';

declare const Cesium: any;

interface HomeProps {
  lang: Language;
  onNavigate: (page: PageId, data?: any) => void;
}

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

const Home: React.FC<HomeProps> = ({ lang, onNavigate }) => {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'stream' | 'map'>('map');
  const [isCesiumReady, setIsCesiumReady] = useState(false);
  const [hasMapError, setHasMapError] = useState(false);
  const [mapErrorMessage, setMapErrorMessage] = useState<string | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [targetSearch, setTargetSearch] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const cesiumContainerRef = useRef<HTMLDivElement>(null);
  const fullWorkareaRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const highlightedEntityRef = useRef<any>(null);
  const boundaryEntitiesRef = useRef<Record<string, any>>({});
  const floatingAssetsRef = useRef<any[]>([]);

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
    return Object.keys(PHYSICAL_OBJECTS_MAP).filter(name => 
      name.toLowerCase().includes(targetSearch.toLowerCase()) && 
      spatialDistributionData[name]?.length > 0
    );
  }, [targetSearch, spatialDistributionData]);

  const resetMapHighlight = () => {
    if (highlightedEntityRef.current) {
      highlightedEntityRef.current.billboard.scale = 1.0;
      highlightedEntityRef.current.label.scale = 1.0;
      highlightedEntityRef.current.label.fillColor = Cesium.Color.WHITE;
      highlightedEntityRef.current = null;
    }
    Object.values(boundaryEntitiesRef.current).forEach((entity: any) => {
      if (entity.rectangle) entity.rectangle.outlineColor = Cesium.Color.fromCssColorString('#3b82f6').withAlpha(0.8);
      if (entity.ellipse) entity.ellipse.outlineColor = Cesium.Color.fromCssColorString('#f59e0b').withAlpha(0.8);
    });
    floatingAssetsRef.current.forEach(entity => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.entities.remove(entity);
      }
    });
    floatingAssetsRef.current = [];
  };

  const toggleFullscreen = () => {
    if (!fullWorkareaRef.current) return;
    if (!document.fullscreenElement) {
      fullWorkareaRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const flyToTarget = (name: string) => {
    const pos = PHYSICAL_OBJECTS_MAP[name];
    if (!pos || !viewerRef.current) return;
    
    setSelectedObjectId(name);
    resetMapHighlight();

    const entity = viewerRef.current.entities.getById(`mini-node-${name}`);
    if (entity) {
      entity.billboard.scale = 2.4; 
      entity.label.scale = 1.25;
      entity.label.fillColor = Cesium.Color.fromCssColorString('#3b82f6');
      highlightedEntityRef.current = entity;
    }
    const boundary = boundaryEntitiesRef.current[name];
    if (boundary) {
      if (boundary.rectangle) boundary.rectangle.outlineColor = Cesium.Color.WHITE;
      if (boundary.ellipse) boundary.ellipse.outlineColor = Cesium.Color.WHITE;
    }

    const relatedAssets = (spatialDistributionData[name] || []).slice(0, 3);
    relatedAssets.forEach((asset, index) => {
      const angle = (index / Math.max(relatedAssets.length, 1)) * Math.PI - (Math.PI / 2);
      const radius = 8000; 
      const offsetLat = (radius / 111320) * Math.sin(angle);
      const offsetLng = (radius / (111320 * Math.cos(Cesium.Math.toRadians(pos.lat)))) * Math.cos(angle);

      const floatingEntity = viewerRef.current.entities.add({
        position: Cesium.Cartesian3.fromDegrees(pos.lng + offsetLng, pos.lat + offsetLat, 1500),
        properties: { type: 'asset-thumbnail', assetData: asset },
        billboard: {
          image: asset.thumbnail,
          width: 120, height: 80,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 150000),
        }
      });
      floatingAssetsRef.current.push(floatingEntity);
    });

    viewerRef.current.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(pos.lng, pos.lat - 0.15, 35000), 
      duration: 1.5,
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT
    });
  };

  useEffect(() => {
    if (activeTab === 'map' && cesiumContainerRef.current) {
      if (viewerRef.current) return;

      const baseUrl = 'https://cdn.jsdelivr.net/npm/cesium@1.114.0/Build/Cesium/';
      (window as any).CESIUM_BASE_URL = baseUrl;

      const initMap = async () => {
        try {
          if (Cesium.buildModuleUrl) {
            Cesium.buildModuleUrl.setBaseUrl(baseUrl);
          }

          // 配置 Google Hybrid Imagery (Google地球模式)
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
            homeButton: true,
            infoBox: false,
            sceneModePicker: true,
            timeline: false,
            navigationHelpButton: false,
            scene3DOnly: true,
            skyBox: false,
            skyAtmosphere: false, // Disable to prevent dynamicLighting related errors in mini-view
            requestRenderMode: true
          });

          // FIX: setDynamicLighting crash in Scene environment update
          viewer.scene.globe.enableLighting = false;

          try {
            const tp = await Cesium.Terrain.fromWorldTerrain();
            viewer.terrainProvider = tp;
          } catch(e) {}

          Object.entries(spatialDistributionData).forEach(([name, assets]) => {
            const pos = PHYSICAL_OBJECTS_MAP[name];
            if (!pos) return;
            const isField = pos.type === 'field';
            const colorStr = isField ? '#3b82f6' : '#f59e0b';
            
            const boundary = viewer.entities.add({
              id: `mini-node-boundary-${name}`,
              ...(isField ? {
                rectangle: {
                  coordinates: Cesium.Rectangle.fromDegrees(pos.lng - 0.02, pos.lat - 0.015, pos.lng + 0.02, pos.lat + 0.015),
                  material: Cesium.Color.fromCssColorString(colorStr).withAlpha(0.1),
                  outline: true,
                  outlineColor: Cesium.Color.fromCssColorString(colorStr).withAlpha(0.8),
                  outlineWidth: 2
                }
              } : {
                ellipse: {
                  semiMinorAxis: 400.0,
                  semiMajorAxis: 400.0,
                  material: Cesium.Color.fromCssColorString(colorStr).withAlpha(0.1),
                  outline: true,
                  outlineColor: Cesium.Color.fromCssColorString(colorStr).withAlpha(0.8),
                  outlineWidth: 2
                }
              })
            });
            boundaryEntitiesRef.current[name] = boundary;

            const svgStr = `
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="12" fill="rgba(30,41,59,0.8)" stroke="${colorStr}" stroke-width="2"/>
                <circle cx="16" cy="16" r="4" fill="${colorStr}"/>
              </svg>`;

            viewer.entities.add({
              id: `mini-node-${name}`,
              name: name,
              position: Cesium.Cartesian3.fromDegrees(pos.lng, pos.lat),
              properties: { type: 'business-node', objectId: name },
              billboard: {
                image: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr),
                width: 24, height: 24,
                disableDepthTestDistance: Number.POSITIVE_INFINITY
              },
              label: {
                text: `${name} (${assets.length})`,
                font: 'bold 11px sans-serif',
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 4, outlineColor: Cesium.Color.BLACK,
                fillColor: Cesium.Color.WHITE,
                pixelOffset: new Cesium.Cartesian2(0, 24),
                verticalOrigin: Cesium.VerticalOrigin.TOP,
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 10000000)
              }
            });
          });

          const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
          handler.setInputAction((click: any) => {
            const picked = viewer.scene.pick(click.position);
            if (Cesium.defined(picked) && picked.id && picked.id.properties) {
              const props = picked.id.properties.getValue(Cesium.JulianDate.now());
              if (props.type === 'business-node') flyToTarget(props.objectId);
              else if (props.type === 'asset-thumbnail') onNavigate('detail', props.assetData);
            } else {
              setSelectedObjectId(null);
              resetMapHighlight();
            }
          }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

          viewerRef.current = viewer;
          setIsCesiumReady(true);
          viewer.camera.setView({ destination: Cesium.Cartesian3.fromDegrees(108, 34, 15000000) });
        } catch (e) {
          console.error("Home Map Init Failed:", e);
          setHasMapError(true);
          // FIX [object Object]: Convert to string
          const msg = e instanceof Error ? e.message : (typeof e === 'object' ? JSON.stringify(e) : String(e));
          setMapErrorMessage(msg);
        }
      };
      initMap();
    }
    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [activeTab, spatialDistributionData]);

  const metrics = [
    { label: t.metrics.total, value: '12,482', trend: 12, icon: 'fa-database', color: 'bg-blue-600', target: 'search' as PageId },
    { label: t.metrics.recent, value: '142', trend: 5, icon: 'fa-cloud-arrow-up', color: 'bg-indigo-600', target: 'search' as PageId },
    { label: t.metrics.pending, value: '28', trend: -2, icon: 'fa-clock-rotate-left', color: 'bg-amber-600', target: 'review' as PageId },
    { label: t.metrics.download24h, value: '1,053', trend: 8, icon: 'fa-download', color: 'bg-emerald-600', target: 'report-cite' as PageId },
  ];

  const recentAssets = useMemo(() => (MOCK_ASSETS || []).slice(0, 6), []);

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-20">
      <section className="bg-slate-900 px-10 py-3 rounded-[24px] relative overflow-hidden shadow-2xl w-full border border-white/5">
        <div className="absolute top-[-40%] right-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10 flex items-center justify-between gap-12 w-full">
          <div className="flex items-center gap-6 shrink-0">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <i className="fa-solid fa-magnifying-glass"></i>
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">图形知识资产智能搜索</h1>
              <p className="text-blue-200/50 text-[7px] font-black uppercase tracking-[0.4em] opacity-80">{t.aiSub}</p>
            </div>
          </div>
          <div className="flex-1 flex bg-white/10 backdrop-blur-2xl p-0.5 rounded-[16px] border border-white/10 shadow-2xl group transition-all focus-within:ring-4 focus-within:ring-blue-500/20 max-w-3xl">
            <div className="flex items-center px-4 text-white/30 group-focus-within:text-blue-400 transition-colors">
              <i className="fa-solid fa-search text-xs"></i>
            </div>
            <input type="text" placeholder={t.searchPlaceholder} className="flex-1 py-1.5 bg-transparent text-white text-[11px] outline-none font-bold placeholder:text-white/20" />
            <button onClick={() => onNavigate('search')} className="bg-blue-600 text-white px-6 py-1.5 rounded-[12px] font-black text-[9px] hover:bg-blue-500 transition-all uppercase tracking-widest active:scale-95 shrink-0">{t.smartSearch}</button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => (
          <div key={idx} onClick={() => onNavigate(m.target)} className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all group cursor-pointer flex items-center gap-4 h-18">
            <div className={`${m.color} w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform shrink-0`}><i className={`fa-solid ${m.icon} text-sm`}></i></div>
            <div className="flex-1 min-w-0">
              <h3 className="text-slate-400 text-[9px] font-black uppercase tracking-widest truncate mb-0.5">{m.label}</h3>
              <p className="text-xl font-black text-slate-800 tracking-tight leading-none">{m.value}</p>
            </div>
            <div className={`text-[9px] font-black px-1.5 py-0.5 rounded-lg shrink-0 ${m.trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {m.trend > 0 ? '↑' : '↓'} {Math.abs(m.trend)}%
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
             <button onClick={() => setActiveTab('stream')} className={`flex items-center gap-3 px-8 py-3 rounded-xl transition-all font-black text-xs uppercase tracking-widest ${activeTab === 'stream' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>最新动态</button>
             <button onClick={() => setActiveTab('map')} className={`flex items-center gap-3 px-8 py-3 rounded-xl transition-all font-black text-xs uppercase tracking-widest ${activeTab === 'map' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>图形资产地理分布</button>
          </div>
        </div>

        <div ref={fullWorkareaRef} className={`flex gap-6 ${isFullscreen ? 'bg-slate-100 p-8 h-screen w-screen overflow-hidden' : 'min-h-[550px] h-[550px]'}`}>
          {activeTab === 'stream' ? (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-1">
              {recentAssets.map((asset) => (
                <div key={asset.id} onClick={() => onNavigate('detail', asset)} className="bg-white p-4 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col h-full">
                  <div className="relative h-44 rounded-[32px] overflow-hidden mb-5 bg-slate-50 border border-slate-50">
                    <img src={asset.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="px-3 pb-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-base font-black text-slate-800 group-hover:text-blue-600 transition-colors leading-tight mb-2 line-clamp-2">{asset.title}</h4>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{asset.oilfield} • {asset.lastUpdate}</p>
                    </div>
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
                      <div className="flex gap-1.5">{(asset.tags || []).slice(0, 2).map(tag => (<span key={tag} className="text-[9px] font-black text-slate-400 px-2 py-0.5 rounded-lg bg-slate-50">#{tag}</span>))}</div>
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">{asset.version}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <aside className={`bg-white/80 backdrop-blur-2xl border border-slate-100 shadow-xl flex flex-col overflow-hidden shrink-0 transition-all ${isFullscreen ? 'w-80 rounded-[48px]' : 'w-64 rounded-[56px]'}`}>
                <div className="p-6 border-b border-slate-50">
                  <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2"><i className="fa-solid fa-crosshairs"></i>业务目标导航</h4>
                  <div className="relative group">
                    <input type="text" placeholder="搜索工区/井..." value={targetSearch} onChange={(e) => setTargetSearch(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                    <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-[10px]"></i>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1.5 bg-slate-50/20">
                   {filteredTargets.map(name => {
                      const isSelected = selectedObjectId === name;
                      const type = PHYSICAL_OBJECTS_MAP[name]?.type;
                      const count = spatialDistributionData[name]?.length || 0;
                      return (
                        <button key={name} onClick={() => flyToTarget(name)} className={`w-full text-left px-4 py-3 rounded-2xl transition-all flex items-center justify-between group ${isSelected ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600 hover:bg-white hover:shadow-md'}`}>
                          <div className="flex items-center gap-3">
                            <i className={`fa-solid ${type === 'field' ? 'fa-mountain' : 'fa-bore-hole'} text-[10px] ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-blue-500'}`}></i>
                            <span className="text-xs font-black truncate max-w-[120px]">{name}</span>
                          </div>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-lg ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>{count}</span>
                        </button>
                      );
                   })}
                </div>
              </aside>

              <div className={`flex-1 bg-black border border-white/5 overflow-hidden h-full shadow-2xl relative ${isFullscreen ? 'rounded-[48px]' : 'rounded-[56px]'}`}>
                {hasMapError ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center bg-slate-950 overflow-hidden text-white">
                    <i className="fa-solid fa-triangle-exclamation text-4xl mb-4 text-rose-500"></i>
                    <h4 className="text-xl font-black uppercase text-rose-50">GIS Context Failed</h4>
                    {mapErrorMessage && <p className="text-[10px] font-mono text-rose-300 mt-4 max-w-md break-all">{mapErrorMessage}</p>}
                    <button onClick={() => window.location.reload()} className="mt-8 px-6 py-2 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-600/20">Retry Initialization</button>
                  </div>
                ) : (
                  <>
                    <div ref={cesiumContainerRef} className="w-full h-full z-0" />
                    {!isCesiumReady && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-white z-50">
                        <div className="w-16 h-16 border-4 border-blue-500/10 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Restoring Space Control Environment...</p>
                      </div>
                    )}
                    
                    <div className="absolute top-8 left-8 bg-black/60 backdrop-blur-xl p-6 rounded-[32px] border border-white/10 shadow-2xl pointer-events-none z-10">
                      <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Geographic Context</h4>
                      <p className="text-white text-sm font-bold flex items-center gap-2"><i className="fa-solid fa-satellite text-blue-500"></i> Google Earth (Hybrid)</p>
                    </div>

                    <button 
                      onClick={toggleFullscreen}
                      className="absolute top-8 right-8 w-12 h-12 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 text-white flex items-center justify-center shadow-2xl hover:bg-blue-600 transition-all group z-20"
                      title={isFullscreen ? '退出全屏' : '全屏查看'}
                    >
                       <i className={`fa-solid ${isFullscreen ? 'fa-compress' : 'fa-expand'} text-sm group-hover:scale-110 transition-transform`}></i>
                    </button>
                  </>
                )}
              </div>

              <aside className={`bg-white/90 backdrop-blur-2xl border border-slate-100 shadow-2xl flex flex-col overflow-hidden shrink-0 transition-all ${isFullscreen ? 'w-[450px] rounded-[48px]' : 'w-96 rounded-[56px]'}`}>
                {selectedObjectId ? (
                  <div className="flex flex-col h-full animate-fadeIn">
                     <div className="p-8 border-b border-slate-50 flex-shrink-0 bg-slate-50/40">
                        <div className="flex items-center justify-between mb-3">
                           <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest border border-blue-100">Coordinate Bound</span>
                           <button onClick={() => {setSelectedObjectId(null); resetMapHighlight();}} className="text-slate-300 hover:text-rose-500 transition-colors"><i className="fa-solid fa-circle-xmark"></i></button>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 leading-tight tracking-tighter">{selectedObjectId}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">关联资产：{spatialDistributionData[selectedObjectId]?.length || 0} 份</p>
                     </div>
                     <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                        {(spatialDistributionData[selectedObjectId] || []).map(asset => (
                           <div key={asset.id} onClick={() => onNavigate('detail', asset)} className="p-4 rounded-[32px] bg-white border border-slate-100 hover:border-blue-500 transition-all cursor-pointer group shadow-sm">
                              <img src={asset.thumbnail} className="w-full h-32 object-cover rounded-[24px] mb-4 group-hover:scale-105 transition-transform" />
                              <p className="text-xs font-black text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">{asset.title}</p>
                           </div>
                        ))}
                     </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
                     <div className="w-24 h-24 bg-slate-50 rounded-[48px] flex items-center justify-center mb-8 rotate-12 shadow-inner border border-slate-100">
                        <i className="fa-solid fa-map-location-dot text-5xl opacity-20 text-blue-600"></i>
                     </div>
                     <h4 className="text-lg font-black text-slate-800 uppercase tracking-widest">探索地理资产</h4>
                     <p className="text-xs mt-4 leading-relaxed max-w-[200px] font-medium text-slate-400">
                       点击列表或锚点，系统将自动展示目标周边的<span className="text-blue-600 font-bold">地理资产成果</span>。
                     </p>
                  </div>
                )}
                <div className="p-8 border-t border-slate-50 bg-slate-50/20">
                   <div className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 cursor-not-allowed">
                      <i className="fa-solid fa-lock"></i>高级地理分析已锁定
                   </div>
                </div>
              </aside>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;