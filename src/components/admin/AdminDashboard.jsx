import React from 'react';
import { useHR } from '../../context/HRContext';
import { 
  Users, 
  Calculator, 
  CalendarCheck2, 
  DollarSign, 
  Clock, 
  ChevronLeft, 
  FileSpreadsheet,
  AlertTriangle,
  Award,
  Briefcase
} from 'lucide-react';

export default function AdminDashboard({ setActiveTab, onSelectPayslip }) {
  const { employees, effects, calculatePayrollForPeriod, activePeriod } = useHR();

  const payroll = calculatePayrollForPeriod(activePeriod);
  const pendingEffects = effects.filter(e => e.status === 'pending');

  const totalPayrollCost = payroll.reduce((acc, c) => acc + c.companyTotalCost, 0);
  const totalNet = payroll.reduce((acc, c) => acc + c.netSalary, 0);
  const totalOvertimeHours = effects
    .filter(e => e.status === 'approved' && e.type === 'overtime')
    .reduce((acc, c) => acc + (Number(c.units) || 0), 0);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      
      {/* بطاقة الترحيب والإحصاء العام */}
      <div className="bg-gradient-to-r from-slate-900 via-orange-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full font-bold border border-orange-500/30">
              لوحة القيادة الإدارية للموارد البشرية
            </span>
            <h2 className="text-xl md:text-2xl font-black mt-2">
              نظام إدارة المرتبات والمؤثرات - شهر {activePeriod}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              متابعة مباشرة لطلبات الموظفين والامتثال لقوانين العمل والتأمينات المصرية
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('payroll')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition shadow-md shadow-orange-600/30"
            >
              <Calculator className="w-4 h-4" />
              <span>عرض مسير الرواتب الكامل</span>
            </button>
          </div>
        </div>
      </div>

      {/* المؤشرات الرئيسية (KPIs) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 dark:text-[#94A3B8] mb-2">
            <span className="text-xs font-bold text-slate-600 dark:text-[#CBD5E1]">إجمالي قوة العمل</span>
            <Users className="w-4 h-4 text-orange-600 dark:text-[#FB923C]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 dark:text-[#F1F5F9]">{employees.length}</span>
            <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium">موظف مسجل</span>
          </div>
          <button
            onClick={() => setActiveTab('employees')}
            className="text-[11px] text-orange-600 dark:text-[#FB923C] font-bold hover:underline mt-2 inline-flex items-center gap-1"
          >
            <span>إدارة الموظفين</span>
            <ChevronLeft className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 dark:text-[#94A3B8] mb-2">
            <span className="text-xs font-bold text-slate-600 dark:text-[#CBD5E1]">طلبات تحتاج اعتماد</span>
            <CalendarCheck2 className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-amber-600 dark:text-[#FBBF24]">{pendingEffects.length}</span>
            <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium">طلب مؤثر</span>
          </div>
          <button
            onClick={() => setActiveTab('approvals')}
            className="text-[11px] text-amber-600 dark:text-[#FBBF24] font-bold hover:underline mt-2 inline-flex items-center gap-1"
          >
            <span>فتح صندوق المؤثرات</span>
            <ChevronLeft className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 dark:text-[#94A3B8] mb-2">
            <span className="text-xs font-bold text-slate-600 dark:text-[#CBD5E1]">صافي الرواتب للشهر</span>
            <DollarSign className="w-4 h-4 text-orange-600 dark:text-[#FB923C]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-orange-700 dark:text-[#FB923C]">{totalNet.toLocaleString('ar-EG')}</span>
            <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium">ج.م</span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-[#94A3B8] mt-2 block">صافي محول لحسابات الموظفين</span>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 dark:text-[#94A3B8] mb-2">
            <span className="text-xs font-bold text-slate-600 dark:text-[#CBD5E1]">ساعات الإضافي المعتمدة</span>
            <Clock className="w-4 h-4 text-blue-600 dark:text-[#60A5FA]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-blue-700 dark:text-[#60A5FA]">{totalOvertimeHours}</span>
            <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium">ساعة عمل</span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-[#94A3B8] mt-2 block">وفق مادة 85 من قانون العمل</span>
        </div>

      </div>

      {/* قسمان: طلبات معلقة سريعة ومختصر الرواتب */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* قائمة الطلبات المعلقة */}
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-[#334155] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck2 className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-black text-slate-800 dark:text-[#F1F5F9]">أحدث المؤثرات بانتظار الاعتماد</h3>
            </div>
            <button
              onClick={() => setActiveTab('approvals')}
              className="text-xs text-orange-600 dark:text-[#FB923C] font-bold hover:underline"
            >
              عرض الكل ({pendingEffects.length})
            </button>
          </div>

          {pendingEffects.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-[#94A3B8] text-xs">
              لا توجد طلبات معلقة حالياً، جميع المؤثرات معتمدة ومسجلة في الرواتب.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-[#334155]">
              {pendingEffects.slice(0, 4).map(eff => (
                <div key={eff.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-[#273449] transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-800 dark:text-[#F1F5F9]">{eff.employeeName}</span>
                      <span className="text-[10px] bg-slate-100 dark:bg-[#273449] px-2 py-0.5 rounded font-bold">{eff.typeLabel}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] mt-0.5">{eff.reason || 'بدون تفاصيل إضافية'}</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('approvals')}
                    className="px-3 py-1 rounded-lg bg-orange-600 text-white text-[11px] font-bold"
                  >
                    مراجعة
                  </button>
              </div>
            ))}
            </div>
          )}
        </div>

        {/* ملخص كشف الرواتب */}
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-[#334155] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-orange-600 dark:text-[#FB923C]" />
              <h3 className="text-sm font-black text-slate-800 dark:text-[#F1F5F9]">معاينة مسير رواتب الموظفين</h3>
            </div>
            <button
              onClick={() => setActiveTab('payroll')}
              className="text-xs text-orange-600 dark:text-[#FB923C] font-bold hover:underline"
            >
              المسير الكامل
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-[#334155]">
            {payroll.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-[#94A3B8] text-xs">
                <Calculator className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-[#94A3B8]" />
                <p className="font-bold">لا توجد بيانات رواتب بعد</p>
                <p className="mt-1">أضف موظفين أولاً لحساب مسير الرواتب</p>
              </div>
            ) : (
              payroll.slice(0, 4).map(p => (
                <div key={p.employeeId} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-[#273449] transition">
                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-[#F1F5F9]">{p.employeeName}</h4>
                    <p className="text-[11px] text-slate-400 dark:text-[#94A3B8]">{p.jobTitle} • {p.department}</p>
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-black text-orange-700 dark:text-[#FB923C] block">{p.netSalary.toLocaleString('ar-EG')} ج.م</span>
                    <button
                      onClick={() => onSelectPayslip(p)}
                      className="text-[10px] text-slate-400 dark:text-[#94A3B8] hover:text-orange-600 underline font-bold"
                    >
                      عرض القسيمة
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
