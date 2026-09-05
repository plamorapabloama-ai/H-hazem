import React, { useState } from 'react';
import { useHR } from '../../context/HRContext';
import { ShieldCheck, UserCheck, Smartphone, Lock, Database, Sun, Moon } from 'lucide-react';
import AuthModal from './AuthModal';

export default function Navbar({ onOpenInstallModal, onOpenDataModal }) {
  const { currentUser, switchUser, employees, effects, settings, theme, toggleTheme } = useHR();
  const [authModal, setAuthModal] = useState({ open: false, mode: 'admin', employeeId: null });

  const pendingCount = effects.filter(e => e.status === 'pending').length;

  const handleSwitchToAdmin = () => {
    setAuthModal({ open: true, mode: 'admin', employeeId: null });
  };

  const handleSwitchToEmployee = (empId, password) => {
    switchUser('employee', empId);
  };

  const handleSwitchToAdminAfterAuth = () => {
    switchUser('admin');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#1E293B]/90 backdrop-blur-md border-b border-slate-200 dark:border-[#334155] shadow-sm">
      <div className="w-full px-3 sm:px-6 h-14 flex items-center justify-between gap-2">
        
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md shrink-0">
            <img src={settings.company.icon || '/ICON.png'} alt="Logo" className="w-full h-full object-cover" onError={(e) => { e.target.src = '/ICON.png'; }} />
          </div>
          <div className="min-w-0">
            <h1 className="font-black text-slate-800 dark:text-[#F1F5F9] text-sm sm:text-base leading-tight truncate max-w-[180px] sm:max-w-[280px] md:max-w-none">
              {currentUser.role === 'admin' ? (settings.company.name || 'نظام الموارد البشرية') : settings.company.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          <button
            onClick={toggleTheme}
            className="p-1.5 text-slate-500 dark:text-[#94A3B8] hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-[#273449] rounded-lg transition"
            title={theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenInstallModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-[#FB923C] hover:bg-orange-100 dark:hover:bg-orange-900 border border-orange-200 dark:border-orange-800 text-[11px] font-semibold transition"
            title="تثبيت التطبيق على الموبايل"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">تثبيت التطبيق (PWA)</span>
          </button>

          <button
            onClick={onOpenDataModal}
            className="p-1.5 text-slate-500 dark:text-[#94A3B8] hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-[#273449] rounded-lg transition"
            title="إدارة البيانات والنسخ الاحتياطي"
          >
            <Database className="w-4 h-4" />
          </button>

          <div className="flex items-center bg-slate-100 dark:bg-[#273449] p-0.5 rounded-lg border border-slate-200 dark:border-[#334155]">
            <button
              onClick={handleSwitchToAdmin}
              className={'flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition ' + (
                currentUser.role === 'admin'
                  ? 'bg-white dark:bg-[#334155] text-orange-700 dark:text-[#FB923C] shadow-sm'
                  : 'text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-[#F1F5F9]'
              )}
            >
              <ShieldCheck className="w-3 h-3" />
              <span className="hidden sm:inline">المدير</span>
              {pendingCount > 0 && currentUser.role === 'admin' && (
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-bold">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                if (employees.length > 0) {
                  setAuthModal({ open: true, mode: 'employee', employeeId: employees[0].id });
                }
              }}
              className={'flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition ' + (
                currentUser.role === 'employee'
                  ? 'bg-white dark:bg-[#334155] text-orange-700 dark:text-[#FB923C] shadow-sm'
                  : 'text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-[#F1F5F9]'
              )}
            >
              <UserCheck className="w-3 h-3" />
              <span className="hidden sm:inline">الموظف</span>
            </button>
          </div>

          {currentUser.role === 'employee' && (
            <select
              value={currentUser.employeeId}
              onChange={(e) => {
                setAuthModal({ open: true, mode: 'employee', employeeId: e.target.value });
              }}
              className="text-[11px] border border-slate-200 dark:border-[#334155] rounded-lg px-1.5 py-1 bg-slate-50 dark:bg-[#273449] text-slate-700 dark:text-[#CBD5E1] font-medium focus:ring-1 focus:ring-orange-500 outline-none max-w-[100px] sm:max-w-[140px]"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => window.dispatchEvent(new CustomEvent('lock-app'))}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800 dark:bg-[#334155] hover:bg-slate-700 dark:hover:bg-[#334155] text-white text-[11px] font-bold transition"
            title="قفل الشاشة"
          >
            <Lock className="w-3 h-3" />
            <span className="hidden sm:inline">قفل</span>
          </button>

        </div>
      </div>

      <AuthModal
        isOpen={authModal.open}
        onClose={() => setAuthModal({ open: false, mode: 'admin', employeeId: null })}
        mode={authModal.mode}
        employeeId={authModal.employeeId}
        onAuth={() => {
          if (authModal.mode === 'admin') {
            handleSwitchToAdminAfterAuth();
          } else if (authModal.mode === 'employee' && authModal.employeeId) {
            handleSwitchToEmployee(authModal.employeeId);
          }
        }}
      />
    </header>
  );
}
