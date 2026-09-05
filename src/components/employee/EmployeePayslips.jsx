import React from 'react';
import { useHR } from '../../context/HRContext';
import { FileSpreadsheet, Eye, Printer, ShieldCheck } from 'lucide-react';

export default function EmployeePayslips({ onSelectPayslip }) {
  const { currentUser, calculatePayrollForPeriod, activePeriod, setActivePeriod } = useHR();

  const payroll = calculatePayrollForPeriod(activePeriod);
  const myPayslip = payroll.find(p => p.employeeId === currentUser.employeeId);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      
      {/* الرأس */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm dark:bg-[#1E293B] dark:border-[#334155]">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-[#F1F5F9]">مفردات وإشعارات الراتب</h2>
          <p className="text-xs text-slate-500 mt-1 dark:text-[#CBD5E1]">
            استعراض قسائم الرواتب الشهرية الرسمية المحسوبة وفقاً للضرائب والتأمينات المصرية
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 dark:bg-[#273449] dark:border-[#334155]">
          <span className="text-xs font-bold text-slate-600 dark:text-[#CBD5E1]">الفترة المالية:</span>
          <input
            type="month"
            value={activePeriod}
            onChange={(e) => setActivePeriod(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer dark:text-[#F1F5F9]"
          />
        </div>
      </div>

      {/* بطاقة القسيمة للشهر المحدد */}
      {myPayslip ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 dark:bg-[#1E293B] dark:border-[#334155]">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-[#334155]">
            <div>
              <span className="text-[11px] font-bold text-orange-700 dark:text-[#FB923C] bg-orange-50 dark:bg-orange-950 px-2.5 py-0.5 rounded-full border border-orange-200 dark:border-orange-800">
                إشعار الراتب لشهر {activePeriod}
              </span>
              <h3 className="text-base font-black text-slate-900 mt-1 dark:text-[#F1F5F9]">{myPayslip.employeeName}</h3>
              <p className="text-xs text-slate-500 dark:text-[#CBD5E1]">{myPayslip.jobTitle} • {myPayslip.department}</p>
            </div>

            <button
              onClick={() => onSelectPayslip(myPayslip)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black shadow-md shadow-orange-600/20"
            >
              <Printer className="w-4 h-4" />
              <span>معاينة وتحميل القسيمة PDF</span>
            </button>
          </div>

          {/* ملخص الأرقام */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 dark:bg-orange-950 dark:border-orange-800">
              <span className="text-xs text-orange-800 dark:text-[#FB923C] font-bold">إجمالي الاستحقاقات (الأجر الشامل)</span>
              <div className="text-xl font-black text-orange-950 dark:text-[#FB923C] mt-1">
                {myPayslip.totalEntitlements.toLocaleString('ar-EG')} ج.م
              </div>
              <p className="text-[10px] text-orange-700/80 dark:text-[#FB923C] mt-1">أساسي + متغير + إضافي + مكافآت</p>
            </div>

            <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 dark:bg-rose-950 dark:border-rose-800">
              <span className="text-xs text-rose-800 dark:text-[#F87171] font-bold">إجمالي الاستقطاعات والضرائب</span>
              <div className="text-xl font-black text-rose-950 dark:text-[#F87171] mt-1">
                -{myPayslip.totalDeductions.toLocaleString('ar-EG')} ج.م
              </div>
              <p className="text-[10px] text-rose-700/80 dark:text-[#F87171] mt-1">تأمينات 11% + ضرائب + سلف وخصومات</p>
            </div>

<div className="p-4 rounded-xl bg-gradient-to-br from-orange-600 to-orange-700 text-white shadow-md">
              <span className="text-xs text-orange-100 font-bold">صافي الراتب المستلم</span>
              <div className="text-2xl font-black text-white mt-1">
                {myPayslip.netSalary.toLocaleString('ar-EG')} ج.م
              </div>
              <p className="text-[10px] text-orange-200 mt-1">المبلغ المحول للحساب البنكي</p>
            </div>

          </div>

          {/* تفاصيل سريعة */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 dark:bg-[#273449] dark:border-[#334155]">
            <div>
              <span className="text-slate-400 block text-[11px] dark:text-[#94A3B8]">الراتب الأساسي:</span>
              <strong className="text-slate-800 dark:text-[#F1F5F9]">{myPayslip.basicSalary.toLocaleString('ar-EG')} ج.م</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] dark:text-[#94A3B8]">التأمينات (عامل 11%):</span>
              <strong className="text-rose-600 dark:text-[#F87171]">-{myPayslip.socialInsuranceEmployee.toLocaleString('ar-EG')} ج.م</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] dark:text-[#94A3B8]">ضريبة كسب العمل:</span>
              <strong className="text-rose-600 dark:text-[#F87171]">-{myPayslip.incomeTax.toLocaleString('ar-EG')} ج.م</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] dark:text-[#94A3B8]">بدلات ومكافآت وإضافي:</span>
              <strong className="text-orange-700 dark:text-[#FB923C]">+{(myPayslip.overtimePay + myPayslip.bonuses + myPayslip.missionAllowances).toLocaleString('ar-EG')} ج.م</strong>
            </div>
          </div>

        </div>
      ) : (
        <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200 dark:bg-[#1E293B] dark:text-[#94A3B8] dark:border-[#334155]">
          لم يتم العثور على قسيمة راتب للشهر المحدد.
        </div>
      )}

    </div>
  );
}
