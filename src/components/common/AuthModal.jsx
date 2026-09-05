import React, { useState, useRef, useEffect } from 'react';
import { useHR } from '../../context/HRContext';
import { X, ShieldCheck, Eye, EyeOff, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onAuth, mode = 'admin', employeeId = null }) {
  const { verifyAdminPassword, verifyEmployeePassword, employees } = useHR();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  const employee = mode === 'employee' ? employees.find(e => e.id === employeeId) : null;

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setShowPassword(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('الرجاء إدخال كلمة المرور');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    let verified = false;
    if (mode === 'admin') {
      verified = verifyAdminPassword(password);
    } else if (mode === 'employee' && employeeId) {
      verified = verifyEmployeePassword(employeeId, password);
    }

    if (verified) {
      onAuth();
      onClose();
    } else {
      setError('كلمة المرور غير صحيحة');
      setShake(true);
      setPassword('');
      setTimeout(() => setShake(false), 500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 dark:bg-black/80 backdrop-blur-md">
      <div
        className={
          'bg-white dark:bg-[#1E293B] rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 dark:border-[#334155] overflow-hidden ' +
          (shake ? 'animate-[shake_0.5s_ease-in-out]' : '')
        }
        style={shake ? { animation: 'shake 0.5s ease-in-out' } : {}}
      >
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-10px); }
            40% { transform: translateX(10px); }
            60% { transform: translateX(-10px); }
            80% { transform: translateX(10px); }
          }
        `}</style>

        <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-orange-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/30">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-black text-white">
            {mode === 'admin' ? 'تحقق من هوية المدير' : 'تسجيل الدخول كموظف'}
          </h3>
          {mode === 'employee' && employee && (
            <p className="text-xs text-slate-200 mt-1">{employee.name} • {employee.jobTitle}</p>
          )}
          {mode === 'admin' && (
            <p className="text-xs text-slate-200 mt-1">أدخل كلمة مرور المدير للمتابعة</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1.5">كلمة المرور</label>
            <div className="relative">
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full p-3 pr-10 pl-10 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#273449] text-sm font-mono text-center tracking-widest focus:ring-2 focus:ring-orange-500 outline-none dark:text-white"
                placeholder="••••••••"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#94A3B8] hover:text-slate-600 dark:hover:text-[#CBD5E1]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-[#F87171] text-xs font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-xl shadow-md shadow-orange-600/20 transition text-sm"
          >
            تحقق ودخول
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-slate-500 dark:text-[#94A3B8] hover:text-slate-700 dark:hover:text-[#F1F5F9] font-bold text-xs transition"
          >
            إلغاء
          </button>
        </form>
      </div>
    </div>
  );
}
