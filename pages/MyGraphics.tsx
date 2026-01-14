
import React, { useState } from 'react';
import { MOCK_ASSETS } from '../constants';
import { PageId, GraphicAsset } from '../types';

interface MyGraphicsProps {
  onNavigate: (page: PageId, data?: any) => void;
}

const MyGraphics: React.FC<MyGraphicsProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'folders' | 'themes'>('folders');
  const [selectedFolder, setSelectedFolder] = useState('收藏夹');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isWatchModalOpen, setIsWatchModalOpen] = useState(false);
  const [activeWatchItem, setActiveWatchItem] = useState<any>(null);
  const [newFolderName, setNewFolderName] = useState('');

  const watchConditions = [
    { 
      id: 1, 
      name: '大庆构造 V3.x 更新', 
      updates: 2, 
      icon: 'fa-mountain-sun',
      assets: MOCK_ASSETS.slice(0, 2),
      desc: '监测到大庆工区构造图件版本库有 2 项由“张工”提交的 V3.1 预审版更新。'
    },
    { 
      id: 2, 
      name: '塔里木油藏评审', 
      updates: 1, 
      icon: 'fa-droplet',
      assets: [MOCK_ASSETS[10]],
      desc: '塔里木哈6井钻井井身结构设计图已进入“专家评审”环节。'
    },
    { 
      id: 3, 
      name: '海上配管安全规范', 
      updates: 0, 
      icon: 'fa-shield-halved',
      assets: [],
      desc: '暂无新的符合安全规范校验的图形产出。'
    },
  ];

  const [folderList, setFolderList] = useState([
    { name: '收藏夹', icon: 'fa-star', count: 12 },
    { name: 'Alpha 项目', icon: 'fa-folder', count: 5 },
    { name: '评价报告文档', icon: 'fa-folder', count: 8 },
    { name: '与我共享', icon: 'fa-share-nodes', count: 3 },
  ]);

  const businessThemes = [
    { name: '勘探地质', count: 24 },
    { name: '油藏模拟', count: 15 },
    { name: '采油工程', count: 9 },
  ];

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder = {
      name: newFolderName,
      icon: 'fa-folder',
      count: 0
    };
    setFolderList([...folderList, newFolder]);
    setSelectedFolder(newFolderName);
    setNewFolderName('');
    setIsCreateModalOpen(false);
  };

  const handleWatchClick = (item: any) => {
    if (item.updates > 0) {
      setActiveWatchItem(item);
      setIsWatchModalOpen(true);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-fadeIn">
      {/* Top Banner - Recent Items */}
      <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <i className="fa-solid fa-clock-rotate-left text-blue-500"></i>
            最近使用
          </h3>
          <button className="text-[10px] font-bold text-blue-600 hover:underline">查看历史</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {MOCK_ASSETS.map(asset => (
            <div 
              key={asset.id} 
              onClick={() => onNavigate('detail', asset)}
              className="flex-shrink-0 w-64 bg-slate-50 p-3 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="relative h-28 overflow-hidden rounded-xl mb-2">
                <img src={asset.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[9px] font-bold text-slate-800">
                  {asset.version}
                </div>
              </div>
              <h4 className="text-xs font-bold text-slate-800 truncate mb-1 group-hover:text-blue-600 transition-colors">{asset.title}</h4>
              <p className="text-[9px] text-slate-400">2小时前使用</p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left Sidebar - Organization & Watchlist */}
        <aside className="w-72 flex flex-col gap-6">
          {/* Organization Toggles */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('folders')}
                className={`flex-1 text-[10px] font-bold py-2 rounded-lg transition-all ${activeTab === 'folders' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                个人目录
              </button>
              <button 
                onClick={() => setActiveTab('themes')}
                className={`flex-1 text-[10px] font-bold py-2 rounded-lg transition-all ${activeTab === 'themes' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                业务主题
              </button>
            </div>

            <nav className="space-y-1">
              {(activeTab === 'folders' ? folderList : businessThemes).map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedFolder(item.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                    selectedFolder === item.name ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <i className={`fa-solid ${(item as any).icon || 'fa-tag'} text-xs opacity-60`}></i>
                    <span className="text-xs font-semibold">{item.name}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{item.count}</span>
                </button>
              ))}
              {activeTab === 'folders' && (
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-blue-600/50 hover:text-blue-600 text-xs font-bold border border-dashed border-slate-100 rounded-xl mt-4 transition-all"
                >
                  <i className="fa-solid fa-plus-circle"></i>
                  创建新目录
                </button>
              )}
            </nav>
          </div>

          {/* Update Notification Panel */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">图形更新关注</h4>
              <i className="fa-solid fa-bell-concierge text-blue-400"></i>
            </div>
            <div className="space-y-3">
              {watchConditions.map(cond => (
                <div 
                  key={cond.id} 
                  onClick={() => handleWatchClick(cond)}
                  className={`group ${cond.updates > 0 ? 'cursor-pointer' : 'opacity-50 cursor-default'}`}
                >
                  <div className={`flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 transition-all ${cond.updates > 0 ? 'hover:bg-white/10 hover:border-blue-500/50' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400`}>
                        <i className={`fa-solid ${cond.icon} text-xs`}></i>
                      </div>
                      <span className="text-[11px] font-bold text-slate-300">{cond.name}</span>
                    </div>
                    {cond.updates > 0 && (
                      <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]">
                        {cond.updates}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-slate-500 italic px-1">当新的结果符合您关注的条件时，系统将通过红标通知您。</p>
          </div>
        </aside>

        {/* Right Content - Asset List */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h4 className="font-bold text-slate-800">{selectedFolder}</h4>
              <span className="text-[10px] text-slate-400 font-bold uppercase">12 个图形</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button className="p-1.5 bg-white text-blue-600 rounded-md shadow-sm"><i className="fa-solid fa-table-cells-large text-xs"></i></button>
                <button className="p-1.5 text-slate-500 hover:text-slate-800 transition-all"><i className="fa-solid fa-list text-xs"></i></button>
              </div>
              <button className="text-[11px] font-bold bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 shadow-lg">批量操作</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {MOCK_ASSETS.map(asset => (
              <div 
                key={asset.id} 
                onClick={() => onNavigate('detail', asset)}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl hover:ring-2 hover:ring-blue-500 transition-all duration-300 cursor-pointer"
              >
                <div className="relative h-44 overflow-hidden">
                  <img src={asset.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-black/60 backdrop-blur text-white text-[10px] px-2 py-0.5 rounded font-bold">{asset.category}</span>
                  </div>
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-slate-800 hover:text-blue-600 shadow-xl"><i className="fa-solid fa-share-nodes text-xs"></i></button>
                    <button className="w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-slate-800 hover:text-rose-600 shadow-xl"><i className="fa-solid fa-heart text-xs"></i></button>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1">{asset.title}</h5>
                    <p className="text-[10px] text-slate-400 font-medium mb-2">{asset.profession} • {asset.oilfield}</p>
                    
                    {asset.figureNote && (
                       <p className="text-[9px] text-slate-500 italic line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100 mb-3">
                          “{asset.figureNote}”
                       </p>
                    )}

                    <div className="flex flex-wrap gap-1 mb-4">
                      {asset.tags.slice(0, 2).map(t => (
                        <span key={t} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">#{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className="text-[10px] font-bold text-slate-300">{asset.lastUpdate}</span>
                    <div className="flex gap-2">
                       <button className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors">查看</button>
                       <button className="p-1 text-slate-300 hover:text-slate-600"><i className="fa-solid fa-ellipsis-vertical text-xs"></i></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Watch Updates Modal */}
      {isWatchModalOpen && activeWatchItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border border-white/10 flex flex-col max-h-[85vh]">
            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
                  <i className={`fa-solid ${activeWatchItem.icon}`}></i>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">{activeWatchItem.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Asset Update Intelligence Panel</p>
                </div>
              </div>
              <button 
                onClick={() => setIsWatchModalOpen(false)} 
                className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-all"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-8">
              <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                <p className="text-sm text-blue-800 font-medium leading-relaxed italic">
                  “{activeWatchItem.desc}”
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                   <i className="fa-solid fa-list-check"></i>
                   变更图形列表
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  {activeWatchItem.assets.map((asset: GraphicAsset) => (
                    <div 
                      key={asset.id} 
                      onClick={() => { setIsWatchModalOpen(false); onNavigate('detail', asset); }}
                      className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group"
                    >
                      <img src={asset.thumbnail} className="w-20 h-14 object-cover rounded-xl border border-slate-50 shadow-sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                           <h5 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">{asset.title}</h5>
                           <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-black">{asset.version}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">{asset.profession} • {asset.oilfield} • 更新于 {asset.lastUpdate}</p>
                      </div>
                      <i className="fa-solid fa-chevron-right text-slate-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all text-xs"></i>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-10 py-8 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button 
                onClick={() => setIsWatchModalOpen(false)}
                className="px-10 py-3 bg-slate-900 text-white text-xs font-black rounded-2xl shadow-xl hover:bg-black transition-all uppercase tracking-widest"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-800 tracking-tight">创建新目录</h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-all"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">目录名称</label>
                <input 
                  type="text" 
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                  placeholder="请输入新目录名称..." 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all"
                />
              </div>
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3 items-start">
                <i className="fa-solid fa-circle-info text-blue-500 mt-0.5"></i>
                <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
                  新目录创建后，您可以将资产直接拖入其中进行个性化管理。
                </p>
              </div>
            </div>
            <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="px-6 py-2.5 text-xs font-black text-slate-400 uppercase hover:text-slate-800 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleCreateFolder}
                className="px-8 py-2.5 bg-blue-600 text-white text-xs font-black rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
              >
                创建目录
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyGraphics;
