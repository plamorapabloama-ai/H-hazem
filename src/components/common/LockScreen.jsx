import React, { useState, useRef, useEffect } from 'react';
import { useHR } from '../../context/HRContext';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function LockScreen() {
  const { unlockApp, verifyAdminPassword, verifyEmployeePassword, switchUser, employees, settings } = useHR();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [time, setTime] = useState(new Date());
  const inputRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 200);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('الرجاء إدخال كلمة المرور');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    if (verifyAdminPassword(password)) {
      switchUser('admin');
      unlockApp();
    } else {
      const matchedEmp = employees.find(emp => verifyEmployeePassword(emp.id, password));
      if (matchedEmp) {
        switchUser('employee', matchedEmp.id);
        unlockApp();
      } else {
        setError('كلمة المرور غير صحيحة');
        setShake(true);
        setPassword('');
        setTimeout(() => setShake(false), 500);
      }
    }
  };

  const formatTime = (d) => {
    return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (d) => {
    return d.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-orange-950">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-10px); }
          80% { transform: translateX(10px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        className="w-full max-w-sm px-6"
        style={{ animation: 'fadeIn 0.6s ease-out' }}
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-xl shadow-orange-500/30 mx-auto mb-4">
            <img src={settings.company.icon || '/ICON.png'} alt="Logo" className="w-full h-full object-cover" onError={(e) => { e.target.src = '/ICON.png'; }} />
          </div>
          <h1 className="text-xl font-black text-white">{settings.company.name || 'نظام الموارد البشرية'}</h1>
          <p className="text-xs text-slate-200 mt-1">{settings.company.address || 'القاهرة، مصر'}</p>
        </div>

        <div className="text-center mb-6">
          <div className="text-5xl font-black text-white mb-2 font-mono tracking-wider">
            {formatTime(time)}
          </div>
          <div className="text-sm text-slate-200">{formatDate(time)}</div>
        </div>

        <div
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          style={shake ? { animation: 'shake 0.5s ease-in-out' } : {}}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-orange-400" />
            <span className="text-sm font-bold text-white">الشاشة مقفلة</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full p-3 pr-10 pl-10 rounded-xl bg-white/10 border border-white/20 text-white text-center text-lg font-mono tracking-widest placeholder-slate-400 focus:ring-2 focus:ring-orange-400 outline-none"
                placeholder="••••••••"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-200 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-200" />
            </div>

            {error && (
              <div className="text-center text-rose-400 text-xs font-bold bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-white font-black rounded-xl shadow-lg shadow-orange-500/30 transition text-sm"
            >
              فتح القفل
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
