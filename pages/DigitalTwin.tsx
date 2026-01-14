
import React, { useState } from 'react';
import { PageId, GraphicAsset } from '../types';

type ObjectType = 'exploration-well' | 'production-well' | 'reservoir';

interface DigitalTwinProps {
  onNavigate: (page: PageId, data?: any) => void;
}

const DigitalTwin: React.FC<DigitalTwinProps> = ({ onNavigate }) => {
  const [selectedObjectType, setSelectedObjectType] = useState<ObjectType>('exploration-well');
  const [selectedObjectId, setSelectedObjectId] = useState('大庆-101井');

  const objects: Record<ObjectType, string[]> = {
    'exploration-well': ['大庆-101井', '塔里木-A2井', '胜利-东-5井', '渤海-BP43'],
    'production-well': ['生产-105井', '生产-201井', '顺北-5-6井', '塔河-TK402'],
    'reservoir': ['萨尔图油藏', '克拉2气田', '蓬莱19-3']
  };

  const createAsset = (id: string, title: string, category: string, date: string, thumbnail: string, type: 'static' | 'dynamic' | 'datavolume' = 'static'): GraphicAsset => ({
    id,
    title,
    category,
    profession: '综合工程',
    oilfield: selectedObjectId.split('-')[0],
    wellId: selectedObjectId,
    stage: category,
    thumbnail,
    lastUpdate: date,
    version: 'V1.0',
    status: 'published',
    tags: ['数字孪生', category],
    format: 'High-Res Preview',
    graphicType: type,
    figureNote: `该图展示了 ${selectedObjectId} 在 ${category} 环节下的核心孪生图形模型。通过高精度的几何建模与实时监测数据对齐，真实还原物理实体状态。`,
    coordinates5D: {
      object: selectedObjectId,
      business: '生产管理',
      work: '数字孪生',
      profession: '信息技术',
      process: '成果展示'
    }
  });

  const explorationStages = [
    { 
      id: 'design', 
      label: '井位设计阶段', 
      icon: 'fa-pen-ruler',
      assets: [
        createAsset('w1', '井位设计综合平面图', '设计阶段', '2023-01-10', 'https://picsum.photos/seed/design1/400/300'),
        createAsset('w2', '邻井对比剖面图', '分析阶段', '2023-01-12', 'https://picsum.photos/seed/design2/400/300')
      ]
    },
    { 
      id: 'drilling', 
      label: '钻井实施阶段', 
      icon: 'fa-bore-hole',
      assets: [
        createAsset('w3', '钻井时效监控图', '过程监控', '2023-02-15', 'https://picsum.photos/seed/drilling1/400/300', 'dynamic'),
        createAsset('w4', '钻头轨迹实时图', '轨迹跟踪', '2023-02-20', 'https://picsum.photos/seed/drilling2/400/300', 'dynamic')
      ]
    },
    { 
      id: 'wireline-logging', 
      label: '测井评价阶段', 
      icon: 'fa-wave-square',
      assets: [
        createAsset('w8', '电测井综合成果图', '评价阶段', '2023-04-01', 'https://picsum.photos/seed/wireline1/400/300')
      ]
    }
  ];

  const productionStages = [
    { 
      id: 'completion-handover', 
      label: '投产交接阶段', 
      icon: 'fa-file-signature',
      assets: [
        createAsset('p1', '完井总结图表', '成果提交', '2023-05-10', 'https://picsum.photos/seed/pwell1/400/300'),
        createAsset('p2', '射孔方案示意图', '工程图纸', '2023-05-15', 'https://picsum.photos/seed/pwell2/400/300')
      ]
    },
    { 
      id: 'production-monitoring', 
      label: '生产曲线与动态监测', 
      icon: 'fa-chart-line',
      assets: [
        createAsset('p3', '月度产液/产气曲线图', '动态监测', '2023-11-01', 'https://picsum.photos/seed/pwell3/400/300', 'dynamic'),
        createAsset('p4', '示功图自动诊断报告', '参数分析', '2023-11-20', 'https://picsum.photos/seed/pwell4/400/300', 'dynamic'),
        createAsset('p5', '井口压力波动分析', '异常监控', '2023-11-25', 'https://picsum.photos/seed/pwell5/400/300', 'dynamic')
      ]
    },
    { 
      id: 'well-intervention', 
      label: '单井措施记录', 
      icon: 'fa-wrench',
      assets: [
        createAsset('p6', '酸化压裂施工曲线', '措施阶段', '2023-08-12', 'https://picsum.photos/seed/pwell6/400/300', 'dynamic'),
        createAsset('p7', '堵水作业设计图', '方案设计', '2023-09-05', 'https://picsum.photos/seed/pwell7/400/300')
      ]
    },
    { 
      id: 'equipment-maint', 
      label: '设备运维阶段', 
      icon: 'fa-gears',
      assets: [
        createAsset('p8', '抽油机结构透视图', '设备资产', '2023-10-15', 'https://picsum.photos/seed/pwell8/400/300')
      ]
    }
  ];

  const reservoirStages = [
    { 
      id: 'res-modeling', 
      label: '地质建模阶段', 
      icon: 'fa-cube',
      assets: [
        createAsset('r1', '三维结构模型视图', '地质建模', '2023-06-20', 'https://picsum.photos/seed/res1/400/300', 'datavolume')
      ]
    },
    { 
      id: 'res-simulation', 
      label: '数值模拟阶段', 
      icon: 'fa-computer',
      assets: [
        createAsset('r2', '剩余油分布热力图', '数值模拟', '2023-07-15', 'https://picsum.photos/seed/res2/400/300', 'datavolume')
      ]
    }
  ];

  const getLifecycleStages = () => {
    switch (selectedObjectType) {
      case 'exploration-well': return explorationStages;
      case 'production-well': return productionStages;
      case 'reservoir': return reservoirStages;
      default: return [];
    }
  };

  const lifecycleStages = getLifecycleStages();

  const handleTypeChange = (type: ObjectType) => {
    setSelectedObjectType(type);
    setSelectedObjectId(objects[type][0]);
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-fadeIn">
      {/* 顶部对象选择与概览 */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => handleTypeChange('exploration-well')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${selectedObjectType === 'exploration-well' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              探井对象
            </button>
            <button 
              onClick={() => handleTypeChange('production-well')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${selectedObjectType === 'production-well' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              生产井对象
            </button>
            <button 
              onClick={() => handleTypeChange('reservoir')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${selectedObjectType === 'reservoir' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              油气藏对象
            </button>
          </div>
          
          <div className="h-8 w-px bg-slate-200"></div>

          <div className="flex items-center gap-3">
             <label className="text-xs font-bold text-slate-400 uppercase">目标选择:</label>
             <select 
               value={selectedObjectId}
               onChange={(e) => setSelectedObjectId(e.target.value)}
               className="bg-slate-50 border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
             >
                {objects[selectedObjectType].map(obj => <option key={obj} value={obj}>{obj}</option>)}
             </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase">当前生命周期状态</p>
              <p className="text-sm font-black text-emerald-500">
                {selectedObjectType === 'exploration-well' ? '勘探评价中' : selectedObjectType === 'production-well' ? '稳定采油中' : '动态更新中'}
              </p>
           </div>
           <button className="bg-slate-900 text-white p-3 rounded-xl hover:bg-slate-800 shadow-lg flex items-center transition-all active:scale-95">
              <i className="fa-solid fa-cube mr-2"></i>
              开启 3D 孪生预览
           </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* 左侧生命周期轴 */}
        <aside className="w-64 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col p-6 overflow-hidden">
           <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <i className="fa-solid fa-timeline text-blue-600"></i>
              生命周期阶段
           </h4>
           <div className="flex-1 overflow-y-auto space-y-2 relative before:content-[''] before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100">
              {lifecycleStages.map((stage) => (
                <div key={stage.id} className="relative pl-10 py-3 group cursor-pointer hover:bg-slate-50 rounded-xl transition-colors">
                   <div className="absolute left-3 top-4 w-4 h-4 rounded-full bg-white border-4 border-slate-200 group-hover:border-blue-500 transition-colors z-10 shadow-sm"></div>
                   <div>
                      <h5 className="text-xs font-bold text-slate-800 group-hover:text-blue-600">{stage.label}</h5>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{stage.assets.length} 个资产记录</span>
                   </div>
                </div>
              ))}
           </div>
        </aside>

        {/* 右侧资产流视图 */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-8 pb-10">
           {lifecycleStages.map((stage) => (
             <section key={stage.id} className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
                      <i className={`fa-solid ${stage.icon}`}></i>
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-slate-800">{stage.label}</h3>
                      <p className="text-xs text-slate-400">在该阶段共产生并归档了 {stage.assets.length} 份图形技术成果</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                   {stage.assets.map(asset => (
                     <div 
                      key={asset.id} 
                      onClick={() => onNavigate('detail', asset)}
                      className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group hover:ring-2 hover:ring-blue-500 transition-all duration-300 cursor-pointer"
                     >
                        <div className="relative h-40 overflow-hidden bg-slate-100 flex items-center justify-center">
                           <img src={asset.thumbnail} className="max-h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                           <div className="absolute top-3 left-3 flex gap-2">
                              <span className="bg-slate-900/80 backdrop-blur text-white text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-widest">{asset.category}</span>
                           </div>
                        </div>
                        <div className="p-4 flex flex-col justify-between">
                           <div>
                              <h5 className="text-sm font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">{asset.title}</h5>
                              <p className="text-[10px] text-slate-400 font-medium mb-2">归档日期: {asset.lastUpdate}</p>
                              
                              {/* Added Figure Note Preview */}
                              {asset.figureNote && (
                                <p className="text-[9px] text-slate-400 italic line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100/50 mb-1">
                                  “{asset.figureNote}”
                                </p>
                              )}
                           </div>
                           <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                              <button className="text-[10px] font-bold text-blue-600 hover:underline">查看详情</button>
                              <div className="flex gap-1">
                                 <button title="下载" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"><i className="fa-solid fa-download text-xs"></i></button>
                                 <button title="对比" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"><i className="fa-solid fa-clone text-xs"></i></button>
                              </div>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </section>
           ))}
        </div>
      </div>
    </div>
  );
};

export default DigitalTwin;
