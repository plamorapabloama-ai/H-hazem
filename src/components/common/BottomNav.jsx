import React from 'react';
import { useHR } from '../../context/HRContext';
import { LayoutDashboard, Users, Calculator, FileText, Settings, PlusCircle, Calendar, Briefcase, FileSpreadsheet, UserCog } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, onOpenNewRequest }) {
  const { currentUser, effects } = useHR();
  const pendingApprovalsCount = effects.filter(e => e.status === 'pending').length;

  if (currentUser.role === 'admin') {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-md border-t border-slate-200 dark:border-[#334155] py-2 px-3 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={'flex flex-col items-center gap-1 text-[11px] font-bold ' + (
            activeTab === 'dashboard' ? 'text-orange-600' : 'text-slate-500 dark:text-[#94A3B8]'
          )}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>الرئيسية</span>
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={'flex flex-col items-center gap-1 text-[11px] font-bold relative ' + (
            activeTab === 'approvals' ? 'text-orange-600' : 'text-slate-500 dark:text-[#94A3B8]'
          )}
        >
          <div className="relative">
            <Calendar className="w-5 h-5" />
            {pendingApprovalsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                {pendingApprovalsCount}
              </span>
            )}
          </div>
          <span>المؤثرات</span>
        </button>

        <button
          onClick={() => setActiveTab('payroll')}
          className={'flex flex-col items-center gap-1 text-[11px] font-bold ' + (
            activeTab === 'payroll' ? 'text-orange-600' : 'text-slate-500 dark:text-[#94A3B8]'
          )}
        >
          <Calculator className="w-5 h-5" />
          <span>الرواتب</span>
        </button>

        <button
          onClick={() => setActiveTab('employees')}
          className={'flex flex-col items-center gap-1 text-[11px] font-bold ' + (
            activeTab === 'employees' ? 'text-orange-600' : 'text-slate-500 dark:text-[#94A3B8]'
          )}
        >
          <Users className="w-5 h-5" />
          <span>الموظفون</span>
        </button>

        <button
          onClick={() => setActiveTab('employee-file')}
          className={'flex flex-col items-center gap-1 text-[11px] font-bold ' + (
            activeTab === 'employee-file' ? 'text-orange-600' : 'text-slate-500 dark:text-[#94A3B8]'
          )}
        >
          <UserCog className="w-5 h-5" />
          <span>الملف</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={'flex flex-col items-center gap-1 text-[11px] font-bold ' + (
            activeTab === 'settings' ? 'text-orange-600' : 'text-slate-500 dark:text-[#94A3B8]'
          )}
        >
          <Settings className="w-5 h-5" />
          <span>الإعدادات</span>
        </button>
      </div>
    );
  }

  // شريط الموظف على الموبايل
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-md border-t border-slate-200 dark:border-[#334155] py-2 px-3 flex items-center justify-around shadow-lg">
      <button
        onClick={() => setActiveTab('employee-home')}
        className={'flex flex-col items-center gap-1 text-[11px] font-bold ' + (
          activeTab === 'employee-home' ? 'text-orange-600' : 'text-slate-500 dark:text-[#94A3B8]'
        )}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>بوابتي</span>
      </button>

      <button
        onClick={() => setActiveTab('employee-requests')}
        className={'flex flex-col items-center gap-1 text-[11px] font-bold ' + (
          activeTab === 'employee-requests' ? 'text-orange-600' : 'text-slate-500 dark:text-[#94A3B8]'
        )}
      >
        <FileText className="w-5 h-5" />
        <span>طلباتي</span>
      </button>

      {/* زر إضافة سريع للطلب */}
      <button
        onClick={onOpenNewRequest}
        className="flex flex-col items-center justify-center -mt-6 bg-orange-600 text-white w-12 h-12 rounded-full shadow-lg shadow-orange-500/40 border-4 border-white dark:border-[#1E293B] active:scale-95 transition"
      >
        <PlusCircle className="w-6 h-6" />
      </button>

      <button
        onClick={() => setActiveTab('employee-payslips')}
        className={'flex flex-col items-center gap-1 text-[11px] font-bold ' + (
          activeTab === 'employee-payslips' ? 'text-orange-600' : 'text-slate-500 dark:text-[#94A3B8]'
        )}
      >
        <FileSpreadsheet className="w-5 h-5" />
        <span>مفردات راتبي</span>
      </button>

      <button
        onClick={() => setActiveTab('employee-profile')}
        className={'flex flex-col items-center gap-1 text-[11px] font-bold ' + (
          activeTab === 'employee-profile' ? 'text-orange-600' : 'text-slate-500 dark:text-[#94A3B8]'
        )}
      >
        <Users className="w-5 h-5" />
        <span>ملفي</span>
      </button>
    </div>
  );
}