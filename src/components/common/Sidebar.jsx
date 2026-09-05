import React from 'react';
import { useHR } from '../../context/HRContext';
import { 
  LayoutDashboard, 
  Users, 
  Calculator, 
  Clock, 
  CalendarCheck2, 
  FileSpreadsheet, 
  Settings, 
  Briefcase, 
  Landmark,
  FileDown,
  UserCog
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { currentUser, effects, settings } = useHR();
  const pendingApprovalsCount = effects.filter(e => e.status === 'pending').length;

  if (currentUser.role !== 'admin') {
    return null;
  }

  const navItems = [
    { id: 'dashboard', label: 'لوحة المؤشرات العامة', icon: LayoutDashboard },
    { id: 'approvals', label: 'صندوق سحب واعتماد المؤثرات', icon: CalendarCheck2, badge: pendingApprovalsCount },
    { id: 'payroll', label: 'مسير الرواتب الإلكتروني', icon: Calculator },
    { id: 'employees', label: 'سجل الموظفين والملفات', icon: Users },
    { id: 'employee-file', label: 'ملف الموظف الشامل', icon: UserCog },
    { id: 'reports', label: 'التقارير والتصدير المالي', icon: FileSpreadsheet },
    { id: 'settings', label: 'إعدادات النظام وقانون العمل', icon: Settings }
  ];

  return (
    <aside className="hidden md:flex flex-col w-56 lg:w-64 bg-slate-900 text-slate-200 p-3 lg:p-4 border-l border-slate-800 shrink-0 h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto">
      
      {/* رأس القائمة */}
      <div className="pb-6 pt-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden">
            <img src={settings.company.icon || '/ICON.png'} alt="Logo" className="w-full h-full object-cover" onError={(e) => { e.target.src = '/ICON.png'; }} />
          </div>
          <div>
            <div className="text-sm font-bold text-white">لوحة تحكم المدير</div>
          </div>
        </div>
      </div>

      {/* الروابط التنقلية */}
      <nav className="flex-1 py-6 space-y-1.5">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ' + (
                isActive
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-900/30'
                  : 'hover:bg-slate-800/80 text-slate-200 hover:text-white'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={'w-4 h-4 ' + (isActive ? 'text-white' : 'text-slate-300')} />
                <span>{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

    </aside>
  );
}