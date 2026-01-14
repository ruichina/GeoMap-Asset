
import React, { useState } from 'react';

const DocImport: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [extractedItems, setExtractedItems] = useState([
    { id: 1, type: '图表', title: '2023生产曲线', page: 12, quality: '高清', img: 'https://picsum.photos/seed/doc1/300/200' },
    { id: 2, type: '地图', title: '现场地形图', page: 15, quality: '普通', img: 'https://picsum.photos/seed/doc2/300/200' },
    { id: 3, type: '示意图', title: '工艺流程图', page: 24, quality: '高清', img: 'https://picsum.photos/seed/doc3/300/200' },
  ]);

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => setIsUploading(false), 2000);
  };

  return (
    <div className="flex h-full gap-6 animate-fadeIn">
      {/* Left Document List / Upload */}
      <aside className="w-80 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h4 className="font-bold text-slate-800 mb-4">文档图形导入</h4>
          <div 
            onClick={handleUpload}
            className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group"
          >
             <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-cloud-arrow-up text-xl"></i>
             </div>
             <p className="text-sm font-bold text-slate-800 mb-1">点击上传文档</p>
             <p className="text-[10px] text-slate-400">支持 Word, PDF, PPT (最大 50MB)</p>
          </div>
        </div>

        <div className="bg-white flex-1 rounded-2xl border border-slate-100 shadow-sm p-4 overflow-hidden flex flex-col">
           <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">处理历史</h4>
           <div className="flex-1 overflow-y-auto space-y-2">
              {[
                { name: '现场勘查报告.pdf', status: '已完成', graphics: 14 },
                { name: '钻井日志摘要.docx', status: '处理中', graphics: 0 },
                { name: 'Q4 战略演示文稿.pptx', status: '已完成', graphics: 5 },
              ].map((doc, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-all">
                   <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-slate-800 truncate pr-2">{doc.name}</span>
                      <i className={`fa-solid fa-circle text-[6px] ${doc.status === '已完成' ? 'text-emerald-500' : 'text-blue-500'}`}></i>
                   </div>
                   <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                      <span>{doc.status}</span>
                      <span>{doc.graphics > 0 ? `提取到 ${doc.graphics} 张图` : ''}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </aside>

      {/* Right Extracted Gallery */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
           <div className="flex items-center gap-3">
              <h4 className="font-bold text-slate-800">抽取图形预览区</h4>
              <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">已提取 3 项内容</span>
           </div>
           <div className="flex gap-2">
              <button className="text-xs font-bold text-slate-500 px-3 py-1.5 hover:bg-slate-100 rounded-lg">全部舍弃</button>
              <button className="text-xs font-bold bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 shadow-lg">将选中内容保存至资产库</button>
           </div>
        </div>

        {isUploading ? (
          <div className="flex-1 bg-white rounded-3xl flex flex-col items-center justify-center space-y-6">
             <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 w-1/2 animate-[progress_2s_ease-in-out_infinite]"></div>
             </div>
             <p className="text-sm font-bold text-slate-800">AI 正在分析文档结构并自动抽取图形...</p>
             <p className="text-xs text-slate-400">正在进行 OCR 识别、矢量识别和图像分割</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto flex-1 pr-2">
            {extractedItems.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group flex flex-col">
                 <div className="relative h-44 overflow-hidden bg-slate-50 flex items-center justify-center">
                    <img src={item.img} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform" />
                    <div className="absolute top-2 left-2 flex gap-1">
                       <span className="bg-white/90 backdrop-blur text-[10px] px-2 py-0.5 rounded font-bold text-slate-800 shadow-sm">{item.type}</span>
                    </div>
                    <div className="absolute top-2 right-2">
                       <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-blue-600" defaultChecked />
                    </div>
                 </div>
                 <div className="p-4 flex-1">
                    <h5 className="text-xs font-bold text-slate-800 mb-1">{item.title}</h5>
                    <div className="flex justify-between text-[10px] text-slate-500">
                       <span>第 {item.page} 页</span>
                       <span className={`${item.quality === '高清' ? 'text-emerald-600' : 'text-amber-600'} font-bold`}>{item.quality} 分辨率</span>
                    </div>
                 </div>
                 <div className="px-4 pb-4 flex gap-2">
                    <button className="flex-1 text-[10px] font-bold text-blue-600 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100">确认元数据</button>
                    <button className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"><i className="fa-solid fa-trash-can"></i></button>
                 </div>
              </div>
            ))}
            <div className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-slate-400 cursor-pointer hover:bg-slate-50 transition-colors">
               <i className="fa-solid fa-plus text-xl mb-2"></i>
               <p className="text-[10px] font-bold">手动选区截取</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocImport;
