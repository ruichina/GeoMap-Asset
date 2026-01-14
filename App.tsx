
import React, { useState, useMemo } from 'react';
import { PageId, Language, GraphicAsset, CitationRecord } from './types';
import { getNavItems, TRANSLATIONS, MOCK_ASSETS } from './constants';
import Home from './pages/Home';
import MyGraphics from './pages/MyGraphics';
import DigitalTwin from './pages/DigitalTwin';
import SpatialDistribution from './pages/SpatialDistribution';
import UnifiedSearch from './pages/UnifiedSearch';
import ScenarioAggregation from './pages/ScenarioAggregation';
import AssetDetail from './pages/AssetDetail';
import EvolutionView from './pages/EvolutionView';
import OverlayCompare from './pages/OverlayCompare';
import ReviewPublish from './pages/ReviewPublish';
import GraphicCollection from './pages/GraphicCollection';
import AIMetadataCompletion from './pages/AIMetadataCompletion';
import MBUBinding from './pages/MBUBinding';
import AIRecognition from './pages/AIRecognition';
import ReportCite from './pages/ReportCite';
import SecurityManagement from './pages/SecurityManagement';
import SystemStandards from './pages/SystemStandards';
import AIAssistant from './pages/AIAssistant';
import GraphicStyleEditor from './pages/GraphicStyleEditor';
import AssetGraph from './pages/AssetGraph';
import Login from './pages/Login';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<PageId>('home');
  const [navigationSource, setNavigationSource] = useState<PageId>('home');
  const [activeAsset, setActiveAsset] = useState<GraphicAsset | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [user, setUser] = useState<any>({ name: '张工', role: '管理员', avatar: '张' });
  const [language, setLanguage] = useState<Language>('zh');
  
  const [assets, setAssets] = useState<GraphicAsset[]>(MOCK_ASSETS);
  const [overlayTargets, setOverlayTargets] = useState<GraphicAsset[]>([]);
  const [citedAssets, setCitedAssets] = useState<GraphicAsset[]>([]);
  const [citationHistory, setCitationHistory] = useState<CitationRecord[]>([]);

  const t = TRANSLATIONS[language];
  const navItems = useMemo(() => getNavItems(language), [language]);
  const visibleNavItems = useMemo(() => navItems.filter(item => !item.hidden), [navItems]);

  const handleNavigate = (page: PageId, data?: any) => {
    const currentItem = navItems.find(n => n.id === activePage);
    
    if (currentItem && !currentItem.hidden && ['detail', 'evolution', 'overlay', 'ai-completion', 'mbu-binding', 'ai-recognition', 'graphic-style-editor'].includes(page)) {
      setNavigationSource(activePage);
    }

    if (page === 'overlay' && data?.assets) {
      setOverlayTargets(data.assets);
    }
    if (page === 'detail' && data) {
      setActiveAsset(data);
    } else if (!['detail', 'evolution', 'overlay', 'graphic-style-editor'].includes(page)) {
      const primaryPages: PageId[] = ['home', 'search', 'scenario', 'review', 'collection', 'report-cite', 'my-graphics', 'asset-graph', 'spatial-distribution'];
      if (primaryPages.includes(page)) {
        setActiveAsset(null);
      }
    }

    setActivePage(page);
  };

  const handleAddAsset = (newAsset: GraphicAsset) => {
    setAssets(prev => [newAsset, ...prev]);
  };

  const handleUpdateAssets = (updatedAssets: GraphicAsset[]) => {
    setAssets(updatedAssets);
  };

  const handleCiteAsset = (asset: GraphicAsset) => {
    setCitedAssets(prev => {
      if (prev.find(a => a.id === asset.id)) return prev;
      return [...prev, asset];
    });
  };

  const handleRemoveCitedAsset = (id: string) => {
    setCitedAssets(prev => prev.filter(a => a.id !== id));
  };

  const handleFinalizeCitation = (record: CitationRecord) => {
    setCitationHistory(prev => [record, ...prev]);
    setCitedAssets([]);
  };

  const handleReCite = (assets: GraphicAsset[]) => {
    setCitedAssets(prev => {
      const existingIds = new Set(prev.map(a => a.id));
      const toAdd = assets.filter(a => !existingIds.has(a.id));
      return [...prev, ...toAdd];
    });
    setActivePage('report-cite');
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
  };

  const breadcrumbs = useMemo(() => {
    const crumbs: { id: PageId; label: string }[] = [];
    const currentItem = navItems.find(n => n.id === activePage);
    if (!currentItem) return crumbs;

    if (currentItem.hidden || activePage === 'overlay' || activePage === 'graphic-style-editor') {
      const sourceItem = navItems.find(n => n.id === navigationSource) || navItems.find(n => n.id === 'home');
      if (sourceItem) crumbs.push({ id: sourceItem.id, label: sourceItem.label });
      if ((activePage === 'evolution' || activePage === 'overlay' || activePage === 'graphic-style-editor') && navigationSource !== 'detail') {
        const detailItem = navItems.find(n => n.id === 'detail');
        if (detailItem) crumbs.push({ id: detailItem.id, label: detailItem.label });
      }
      crumbs.push({ id: currentItem.id, label: currentItem.label });
    } else {
      crumbs.push({ id: currentItem.id, label: currentItem.label });
    }
    return crumbs;
  }, [activePage, navigationSource, navItems, language]);

  const renderContent = () => {
    const commonProps = { lang: language, onNavigate: handleNavigate };
    const pageProps = { ...commonProps, navigationSource };
    
    switch (activePage) {
      case 'home': return <Home {...commonProps} />;
      case 'my-graphics': return <MyGraphics {...commonProps} />;
      case 'digital-twin': return <DigitalTwin {...commonProps} />;
      case 'spatial-distribution': return <SpatialDistribution {...commonProps} />;
      case 'search': return <UnifiedSearch {...commonProps} />;
      case 'scenario': return <ScenarioAggregation {...commonProps} />;
      case 'asset-graph': return <AssetGraph {...commonProps} />;
      case 'detail': return <AssetDetail {...pageProps} asset={activeAsset || MOCK_ASSETS[0]} onCiteAsset={handleCiteAsset} citedIds={citedAssets.map(a => a.id)} />;
      case 'evolution': return <EvolutionView {...pageProps} />;
      case 'overlay': return <OverlayCompare {...pageProps} selectedAssets={overlayTargets} onAddAsset={handleAddAsset} onNavigate={handleNavigate} />;
      case 'review': return <ReviewPublish {...commonProps} assets={assets} onUpdateAssets={handleUpdateAssets} />;
      case 'collection': return <GraphicCollection {...commonProps} onAddAsset={handleAddAsset} />;
      case 'ai-completion': return <AIMetadataCompletion {...pageProps} />;
      case 'mbu-binding': return <MBUBinding {...pageProps} />;
      case 'ai-recognition': return <AIRecognition {...pageProps} />;
      case 'graphic-style-editor': return <GraphicStyleEditor {...pageProps} asset={activeAsset || MOCK_ASSETS[0]} />;
      case 'report-cite': return <ReportCite {...commonProps} citedAssets={citedAssets} onRemoveCitedAsset={handleRemoveCitedAsset} citationHistory={citationHistory} onFinalizeCitation={handleFinalizeCitation} onReCite={handleReCite} />;
      case 'security': return <SecurityManagement {...commonProps} />;
      case 'standards': return <SystemStandards {...commonProps} />;
      case 'ai-assistant': return <AIAssistant {...commonProps} />;
      default: return <Home {...commonProps} />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} lang={language} toggleLang={toggleLanguage} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className={`bg-slate-900 text-slate-300 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <i className="fa-solid fa-database text-white"></i>
            </div>
            {!sidebarCollapsed && <span className="font-bold text-lg text-white tracking-tight">{t.platformName}</span>}
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          {visibleNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`w-full flex items-center px-4 py-3 transition-colors relative group ${
                activePage === item.id 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <i className={`fa-solid ${item.icon} ${sidebarCollapsed ? 'mx-auto' : 'w-6'}`}></i>
              {!sidebarCollapsed && <span className="ml-3 text-sm font-medium">{item.label}</span>}
              {item.id === 'report-cite' && citedAssets.length > 0 && (
                <span className="absolute right-4 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                  {citedAssets.length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-4 border-t border-slate-800 hover:bg-slate-800 transition-colors"
        >
          <i className={`fa-solid ${sidebarCollapsed ? 'fa-angles-right' : 'fa-angles-left'} mx-auto`}></i>
        </button>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-4">
             <nav className="flex items-center text-sm font-medium">
               {breadcrumbs.map((crumb, index) => (
                 <React.Fragment key={crumb.id}>
                    {index > 0 && <span className="mx-2 text-slate-300">/</span>}
                    <button
                      onClick={() => handleNavigate(crumb.id)}
                      disabled={index === breadcrumbs.length - 1}
                      className={`transition-colors ${
                        index === breadcrumbs.length - 1 
                          ? 'text-slate-800 font-bold' 
                          : 'text-slate-400 hover:text-blue-600'
                      }`}
                    >
                      {crumb.label}
                    </button>
                 </React.Fragment>
               ))}
             </nav>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleLanguage} className="bg-slate-100 p-2 rounded-lg text-xs font-bold text-blue-600">
               {language === 'zh' ? 'EN' : '中'}
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                {user?.avatar}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800">{user?.name}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
