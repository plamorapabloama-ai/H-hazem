import React, { useState } from 'react';
import { useHR } from '../../context/HRContext';
import { 
  Calculator, 
  FileSpreadsheet, 
  FileDown, 
  Printer, 
  Search, 
  Eye, 
  Lock, 
  CheckCircle2, 
  DollarSign, 
  Building2, 
  ShieldCheck,
  Percent,
  CheckSquare,
  Square
} from 'lucide-react';
import { exportPayrollToExcel, exportBankTransferExcel } from '../../utils/excelExporter';
import { generatePayrollPdf } from '../../utils/pdfGenerator';
import BulkActionsBar from '../common/BulkActionsBar';

export default function PayrollCalculator({ onSelectPayslip }) {
  const { 
    activePeriod, 
    setActivePeriod, 
    calculatePayrollForPeriod, 
    settings 
  } = useHR();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedIds, setSelectedIds] = useState(new Set());

  const payrollData = calculatePayrollForPeriod(activePeriod);

  // إحصائيات مالية شاملة
  const totalBase = payrollData.reduce((acc, c) => acc + c.basicSalary, 0);
  const totalEntitlements = payrollData.reduce((acc, c) => acc + c.totalEntitlements, 0);
  const totalDeductions = payrollData.reduce((acc, c) => acc + c.totalDeductions, 0);
  const totalNetSalary = payrollData.reduce((acc, c) => acc + c.netSalary, 0);
  const totalEmployeeInsurance = payrollData.reduce((acc, c) => acc + c.socialInsuranceEmployee, 0);
  const totalEmployerInsurance = payrollData.reduce((acc, c) => acc + c.socialInsuranceEmployer, 0);
  const totalIncomeTax = payrollData.reduce((acc, c) => acc + c.incomeTax, 0);
  const totalCompanyCost = payrollData.reduce((acc, c) => acc + c.companyTotalCost, 0);

  const filtered = payrollData.filter(item => {
    const matchesSearch = item.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'all' || item.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const departments = Array.from(new Set(payrollData.map(p => p.department)));

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(i => i.employeeId)));
    }
  };

  const selectedItems = filtered.filter(i => selectedIds.has(i.employeeId));

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      
      {/* رأس الصفحة واختيار الفترة */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-orange-600 dark:text-[#FB923C]" />
            <h2 className="text-lg font-black text-slate-800 dark:text-[#F1F5F9]">مسير الرواتب والأجور الإلكتروني</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">
            احتساب الضرائب والتأمينات والمؤثرات آلياً وفقاً لقانون العمل والتأمينات رقم 148 لسنة 2019
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* اختيار الشهر */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] rounded-xl px-3 py-1.5">
            <span className="text-xs font-bold text-slate-600 dark:text-[#CBD5E1]">الفترة:</span>
            <input
              type="month"
              value={activePeriod}
              onChange={(e) => setActivePeriod(e.target.value)}
              className="text-xs font-bold text-slate-800 dark:text-[#F1F5F9] bg-transparent outline-none cursor-pointer"
            />
          </div>

{/* تصدير PDF مسير رسمي */}
          <button
            onClick={() => generatePayrollPdf(payrollData, activePeriod, settings)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-black shadow-sm transition"
            title="تصدير مسير الرواتب إلى PDF"
          >
            <Printer className="w-4 h-4" />
            <span>تصدير PDF المسير</span>
          </button>

          {/* تصدير إكسيل مسير كامل */}
          <button
            onClick={() => exportPayrollToExcel(payrollData, activePeriod, settings.company.name, settings.company)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-black shadow-sm transition"
            title="تصدير مسير الرواتب إلى Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير Excel المسير</span>
          </button>

          {/* تصدير كشف البنك */}
          <button
            onClick={() => exportBankTransferExcel(payrollData, activePeriod, settings.company.name, settings.company)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-sm transition"
            title="تصدير ملف التحويل البنكي"
          >
            <Building2 className="w-4 h-4" />
            <span>كشف البنك</span>
          </button>
        </div>
      </div>

      {/* بطاقات الإجماليات المالية للشهر */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* إجمالي صافي المرتبات للموظفين */}
        <div className="bg-gradient-to-br from-orange-600 to-orange-700 text-white p-4 rounded-2xl shadow-md">
<span className="text-xs font-bold text-slate-100">صافي الرواتب المستحقة</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl md:text-2xl font-black">{totalNetSalary.toLocaleString('ar-EG')}</span>
            <span className="text-xs text-slate-200">ج.م</span>
          </div>
          <span className="text-[10px] text-slate-200 mt-1 block">لعدد {payrollData.length} موظف</span>
        </div>

        {/* إجمالي الاستحقاقات الشاملة */}
        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm">
          <span className="text-xs font-bold text-slate-500 dark:text-[#94A3B8]">إجمالي الاستحقاقات (Gross)</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl md:text-2xl font-black text-slate-800 dark:text-[#F1F5F9]">{totalEntitlements.toLocaleString('ar-EG')}</span>
            <span className="text-xs text-slate-500 dark:text-[#94A3B8]">ج.م</span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-[#94A3B8] mt-1 block">أساسي + بدلات + إضافي + مكافآت</span>
        </div>

        {/* إجمالي التأمينات الاجتماعية الموردة */}
        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm">
          <span className="text-xs font-bold text-slate-500 dark:text-[#94A3B8]">إجمالي التأمينات الاجتماعية</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl md:text-2xl font-black text-blue-700 dark:text-[#60A5FA]">
              {(totalEmployeeInsurance + totalEmployerInsurance).toLocaleString('ar-EG')}
            </span>
            <span className="text-xs text-slate-500 dark:text-[#94A3B8]">ج.م</span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-[#94A3B8] mt-1 block">عامل 11% + شركة 18.75%</span>
        </div>

        {/* إجمالي ضريبة كسب العمل الموردة */}
        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm">
          <span className="text-xs font-bold text-slate-500 dark:text-[#94A3B8]">ضريبة كسب العمل والشهداء</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl md:text-2xl font-black text-rose-700 dark:text-[#F87171]">{totalIncomeTax.toLocaleString('ar-EG')}</span>
            <span className="text-xs text-slate-500 dark:text-[#94A3B8]">ج.م</span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-[#94A3B8] mt-1 block">تورد لمصلحة الضرائب المصرية</span>
      </div>

      <BulkActionsBar
        selectedCount={selectedIds.size}
        totalCount={filtered.length}
        selectLabel="موظف"
        onToggleAll={toggleSelectAll}
        onDeselectAll={() => setSelectedIds(new Set())}
        onExportExcel={() => exportPayrollToExcel(selectedItems, activePeriod, settings.company.name, settings.company)}
        onExportPdf={() => generatePayrollPdf(selectedItems, activePeriod, settings)}
        onViewPayslips={() => {
          if (selectedItems.length === 1) onSelectPayslip(selectedItems[0]);
        }}
      />

    </div>

      {/* شريط الفرز والبحث */}
      <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 dark:text-[#94A3B8] absolute right-3 top-3" />
          <input
            type="text"
            placeholder="بحث بالاسم أو الكود أو الوظيفة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9] text-xs font-medium focus:ring-1 focus:ring-orange-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-bold shrink-0">القسم:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9] font-medium outline-none"
          >
            <option value="all">كل الأقسام</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* جدول مسير الرواتب المالي */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-[#0F172A] dark:bg-[#273449] text-slate-200 dark:text-[#F1F5F9] text-[11px] font-bold">
                <th className="p-3 w-10">
                  <button onClick={toggleSelectAll} className="hover:text-orange-400 transition">
                    {selectedIds.size === filtered.length && filtered.length > 0
                      ? <CheckSquare className="w-4 h-4 text-orange-400" />
                      : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="p-3">كود</th>
                <th className="p-3">اسم الموظف</th>
                <th className="p-3">الوظيفة / القسم</th>
                <th className="p-3">الأساسي والمتغير</th>
                <th className="p-3">المؤثرات (+)</th>
                <th className="p-3 text-orange-400">إجمالي الأجر</th>
                <th className="p-3 text-rose-300">تأمينات 11%</th>
                <th className="p-3 text-rose-300">ضريبة الدخل</th>
                <th className="p-3 text-rose-300">خصومات وسلف</th>
                <th className="p-3 text-slate-100 font-black">الصافي المستحق</th>
                <th className="p-3 text-center">مفردات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#334155] font-medium">
              {filtered.map(item => (
                <tr key={item.employeeId} className={'hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition ' + (selectedIds.has(item.employeeId) ? 'bg-orange-50/50 dark:bg-orange-950/20' : '')}>
                  <td className="p-3 text-center">
                    <button onClick={() => toggleSelect(item.employeeId)} className="hover:text-orange-600 transition">
                      {selectedIds.has(item.employeeId)
                        ? <CheckSquare className="w-4 h-4 text-orange-500" />
                        : <Square className="w-4 h-4 text-slate-400" />}
                    </button>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-500 dark:text-[#94A3B8]">{item.employeeId}</td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900 dark:text-[#F1F5F9]">{item.employeeName}</div>
                    <div className="text-[10px] text-slate-400 dark:text-[#94A3B8]">{item.nationalId || '---'}</div>
                  </td>
                  <td className="p-3">
                    <div className="text-slate-800 dark:text-[#F1F5F9]">{item.jobTitle}</div>
                    <div className="text-[10px] text-slate-400 dark:text-[#94A3B8]">{item.department}</div>
                  </td>
                  <td className="p-3 font-bold text-slate-700 dark:text-[#F1F5F9]">
                    {(item.basicSalary + item.variableSalary).toLocaleString('ar-EG')} ج.م
                  </td>
                  <td className="p-3 text-orange-600 dark:text-[#FB923C] font-bold">
                    +{(item.overtimePay + item.bonuses + item.missionAllowances).toLocaleString('ar-EG')} ج.م
                  </td>
                  <td className="p-3 font-black text-slate-900 dark:text-[#F1F5F9] bg-slate-50/50 dark:bg-slate-800/50">
                    {item.totalEntitlements.toLocaleString('ar-EG')} ج.م
                  </td>
                  <td className="p-3 text-rose-600 dark:text-[#FCA5A5] font-bold">
                    -{item.socialInsuranceEmployee.toLocaleString('ar-EG')} ج.م
                  </td>
                  <td className="p-3 text-rose-600 dark:text-[#FCA5A5] font-bold">
                    -{item.incomeTax.toLocaleString('ar-EG')} ج.م
                  </td>
                  <td className="p-3 text-rose-600 dark:text-[#FCA5A5] font-bold">
                    -{(item.absenceDeduction + item.penaltyDeduction + item.loansAndAdvances + item.otherDeductions).toLocaleString('ar-EG')} ج.م
                  </td>
                  <td className="p-3 font-black text-sm text-emerald-700 dark:text-[#4ADE80]">
                    {item.netSalary.toLocaleString('ar-EG')} ج.م
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => onSelectPayslip(item)}
                      className="p-1.5 rounded-lg bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300 hover:bg-orange-100 transition inline-flex items-center gap-1 font-bold text-[11px]"
                      title="عرض وطباعة مفردات المرتب"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>قسيمة</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 dark:bg-[#273449] font-black text-slate-900 dark:text-[#F1F5F9] text-xs border-t-2 border-slate-300 dark:border-[#475569]">
                <td colSpan="5" className="p-3 text-left pl-6">الإجمالي العام لمسير الرواتب:</td>
                <td className="p-3 text-orange-700 dark:text-[#FB923C]">{totalEntitlements.toLocaleString('ar-EG')} ج.م</td>
                <td className="p-3 text-rose-700 dark:text-[#FCA5A5]">{totalEmployeeInsurance.toLocaleString('ar-EG')} ج.م</td>
                <td className="p-3 text-rose-700 dark:text-[#FCA5A5]">{totalIncomeTax.toLocaleString('ar-EG')} ج.م</td>
                <td className="p-3 text-rose-700 dark:text-[#FCA5A5]">{payrollData.reduce((a, b) => a + (b.absenceDeduction + b.penaltyDeduction + b.loansAndAdvances + b.otherDeductions), 0).toLocaleString('ar-EG')} ج.م</td>
                <td className="p-3 text-emerald-700 dark:text-[#4ADE80] text-sm">{totalNetSalary.toLocaleString('ar-EG')} ج.م</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
}
