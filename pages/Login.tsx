
import React, { useState } from 'react';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';

interface LoginProps {
  onLogin: (userData: any) => void;
  lang: Language;
  toggleLang: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, lang, toggleLang }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const t = TRANSLATIONS[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onLogin({ 
        name: lang === 'zh' ? '管理员' : 'Admin', 
        role: '高级用户', 
        avatar: '管' 
      });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-100 items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl">
            <i className="fa-solid fa-database"></i>
          </div>
          <h1 className="text-2xl font-black text-slate-800">{t.loginTitle}</h1>
          <p className="text-slate-400 text-sm mt-2">{t.loginSub}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">{t.usernameLabel}</label>
            <input 
              type="text" 
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="请输入账号"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">{t.passwordLabel}</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? <i className="fa-solid fa-spinner animate-spin"></i> : t.enterPlatform}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 flex justify-center">
           <button onClick={toggleLang} className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors">
             {lang === 'zh' ? 'Switch to English' : '切换为中文'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
