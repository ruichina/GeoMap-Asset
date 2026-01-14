
import React from 'react';
import { CommonPageProps } from '../types';

const SecurityManagement: React.FC<CommonPageProps> = ({ lang, onNavigate }) => {
  const roles = [
    { id: 1, name: '系统管理员', users: 3, level: 'Level 0' },
    { id: 2, name: '资深地质专家', users: 12, level: 'Level 1' },
    { id: 3, name: '助理工程师', users: 45, level: 'Level 2' },
    { id: 4, name: '外部合作单位', users: 10, level: 'Level 3' },
  ];

  const permissions = [
    '查看图形资产', '下载高分辨率原稿', '编辑元数据', '上传新版本', '评审与正式发布', '管理安全策略'
  ];

  return (
    <div className="flex h-full gap-6 animate-fadeIn">
      {/* Role List */}
      <aside className="w-80 flex flex-col gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex-1 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
             <h4 className="font-bold text-slate-800">角色列表</h4>
             <button title="添加角色" className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100"><i className="fa-solid fa-plus text-xs"></i></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
             {roles.map(role => (
               <div key={role.id} className={`p-4 rounded-xl border transition-all cursor-pointer ${role.id === 2 ? 'bg-blue-600 border-blue-600 shadow-lg' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}>
                  <div className="flex justify-between items-start mb-1">
                     <span className={`text-sm font-bold ${role.id === 2 ? 'text-white' : 'text-slate-800'}`}>{role.name}</span>
                     <span className={`text-[9px] font-bold px-1.5 rounded ${role.id === 2 ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'}`}>{role.level}</span>
                  </div>
                  <span className={`text-[10px] ${role.id === 2 ? 'text-blue-100' : 'text-slate-400'}`}>{role.users} 个已指派用户</span>
               </div>
             ))}
          </div>
        </div>
      </aside>

      {/* Permission Matrix */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
         <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
               <h4 className="font-bold text-slate-800">权限配置矩阵</h4>
               <p className="text-[10px] text-slate-400 font-medium">正在配置角色：<span className="text-blue-600 font-bold">资深地质专家</span></p>
            </div>
            <div className="flex gap-2">
               <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50">审计日志</button>
               <button className="px-6 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-lg hover:bg-blue-700">保存变更</button>
            </div>
         </div>
         <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-slate-50/80 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                  <tr>
                     <th className="px-8 py-4">功能权限</th>
                     <th className="px-8 py-4 text-center">允许</th>
                     <th className="px-8 py-4 text-center">拒绝</th>
                     <th className="px-8 py-4">权限上下文 / 条件</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {permissions.map((perm, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                       <td className="px-8 py-6">
                          <span className="text-sm font-bold text-slate-800">{perm}</span>
                       </td>
                       <td className="px-8 py-6 text-center">
                          <input type="radio" name={`perm-${i}`} className="w-4 h-4 text-emerald-500 focus:ring-emerald-500" defaultChecked={i < 4} />
                       </td>
                       <td className="px-8 py-6 text-center">
                          <input type="radio" name={`perm-${i}`} className="w-4 h-4 text-rose-500 focus:ring-rose-500" defaultChecked={i >= 4} />
                       </td>
                       <td className="px-8 py-6">
                          <select className="text-xs border-slate-200 rounded-lg p-1.5 focus:ring-blue-500 bg-slate-50 border">
                             <option>全平台资产</option>
                             <option>仅限本部门</option>
                             <option>仅限所属业务节点</option>
                             <option>自定义脚本控制</option>
                          </select>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
         <div className="p-8 border-t border-slate-100 bg-amber-50/50">
            <div className="flex items-start gap-4">
               <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
                  <i className="fa-solid fa-triangle-exclamation text-xl"></i>
               </div>
               <div>
                  <h5 className="text-sm font-bold text-amber-800 mb-1">安全强制执行提示</h5>
                  <p className="text-xs text-amber-700/80 leading-relaxed">角色权限变更将立即影响 12 名在线用户。任何正在评审中的图形资产，若发布权限被移除，将需要重新发起授权流程。</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SecurityManagement;
