import React, { useState } from 'react';
import { useHR } from '../../context/HRContext';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Printer, 
  ShieldCheck, 
  Percent, 
  Building2, 
  CalendarCheck,
  CreditCard,
  UserCheck,
  Clock,
  CalendarOff,
  Map,
  Users,
  Briefcase
} from 'lucide-react';
import { exportPayrollToExcel, exportBankTransferExcel, exportEffectsExcel, exportAbsenceReportToExcel, exportLeaveBalanceToExcel, exportMissionReportToExcel, exportOvertimeReportToExcel, exportEmployeeRosterToExcel } from '../../utils/excelExporter';
import { generatePayrollPdf, generateTaxReportPdf, generateSalaryCertificatePdf, generateAbsenceReportPdf, generateOvertimeReportPdf, generateLeaveBalancePdf, generateMissionReportPdf, generateEmployeeRosterPdf } from '../../utils/pdfGenerator';

export default function ReportsView() {
  const { activePeriod, calculatePayrollForPeriod, settings, effects, employees } = useHR();
  const payrollData = calculatePayrollForPeriod(activePeriod);
  const [selectedEmpId, setSelectedEmpId] = useState('');

  // إجماليات مالية
  const totalNet = payrollData.reduce((a, b) => a + b.netSalary, 0);
  const totalTax = payrollData.reduce((a, b) => a + b.incomeTax, 0);
  const totalMartyrs = payrollData.reduce((a, b) => a + b.martyrsFund, 0);
  const totalEmpIns = payrollData.reduce((a, b) => a + b.socialInsuranceEmployee, 0);
  const totalCompanyIns = payrollData.reduce((a, b) => a + b.socialInsuranceEmployer, 0);

  const handlePrintPayrollReport = () => {
    generatePayrollPdf(payrollData, activePeriod, settings, 'landscape');
  };

  const handlePrintTaxReport = () => {
    generateTaxReportPdf(payrollData, activePeriod, settings);
  };

  const handlePrintSalaryCertificate = () => {
    const emp = payrollData.find(p => p.employeeId === selectedEmpId);
    if (emp) generateSalaryCertificatePdf(emp, activePeriod, settings);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      
      {/* الرأس */}
      <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-orange-600 dark:text-[#FB923C]" />
            <h2 className="text-lg font-black text-slate-800 dark:text-[#F1F5F9]">مركز التقارير والتصدير المالي المعتمد</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-1">
            استخراج كشوفات الرواتب الرسمية، شهادات الراتب، استمارات التأمينات، إقرارات الضرائب، وملفات التحويل البنكي
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportPayrollToExcel(payrollData, activePeriod, settings.company.name, settings.company)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-black shadow-md shadow-orange-600/20"
          >
            <Download className="w-4 h-4" />
            <span>تصدير Excel شامل</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* صف 1: التقارير المالية الرئيسية */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 dark:text-[#CBD5E1] mb-3 flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5" />
          التقارير المالية والضريبية
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* تقرير كسب العمل للضرائب */}
          <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-[#F87171]">
                  <Percent className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono font-bold bg-slate-100 dark:bg-[#273449] text-slate-600 dark:text-[#CBD5E1] px-2 py-0.5 rounded">
                  مصلحة الضرائب المصرية
                </span>
              </div>
              <h3 className="font-black text-slate-800 dark:text-[#F1F5F9] text-sm">إقرار ضريبة كسب العمل الشهري</h3>
              <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-1">
                حساب الخضوع للضريبة بعد الإعفاء الشخصي والشرائح وفق قانون 30 لسنة 2023
              </p>
              <div className="mt-4 p-3 bg-rose-50/50 dark:bg-rose-950/50 rounded-xl border border-rose-100 dark:border-rose-900">
                <div className="text-[11px] text-rose-700 dark:text-[#F87171] font-bold">إجمالي الضريبة المستحقة:</div>
                <div className="text-xl font-black text-rose-800 dark:text-[#F87171] mt-0.5">{totalTax.toLocaleString('ar-EG')} ج.م</div>
                <div className="text-[10px] text-slate-500 dark:text-[#CBD5E1] mt-1">+ مساهمة الشهداء: {totalMartyrs.toLocaleString('ar-EG')} ج.م</div>
              </div>
            </div>
            <button
              onClick={handlePrintTaxReport}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / حفظ PDF الإقرار</span>
            </button>
          </div>

          {/* تقرير التأمينات الاجتماعية */}
          <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-[#60A5FA]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono font-bold bg-slate-100 dark:bg-[#273449] text-slate-600 dark:text-[#CBD5E1] px-2 py-0.5 rounded">
                  قانون 148 لسنة 2019
                </span>
              </div>
              <h3 className="font-black text-slate-800 dark:text-[#F1F5F9] text-sm">كشف سداد التأمينات الاجتماعية</h3>
              <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-1">
                بيان سداد حصة العامل (11%) وحصة المنشأة (18.75%) لمكتب التأمينات
              </p>
              <div className="mt-4 p-3 bg-blue-50/50 dark:bg-blue-950/50 rounded-xl border border-blue-100 dark:border-blue-900 space-y-1">
                <div className="flex justify-between text-xs font-bold text-blue-900 dark:text-[#60A5FA]">
                  <span>حصة العاملين (11%):</span>
                  <span>{totalEmpIns.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-blue-900 dark:text-[#60A5FA]">
                  <span>حصة المنشأة (18.75%):</span>
                  <span>{totalCompanyIns.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div className="flex justify-between text-xs font-black text-blue-950 dark:text-blue-200 border-t border-blue-200 dark:border-blue-800 pt-1 mt-1">
                  <span>الإجمالي للمكتب:</span>
                  <span>{(totalEmpIns + totalCompanyIns).toLocaleString('ar-EG')} ج.م</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => exportPayrollToExcel(payrollData, activePeriod, settings.company.name, settings.company)}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير شيت التأمينات Excel</span>
            </button>
          </div>

          {/* تقرير تحويلات البنك */}
          <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-[#FB923C]">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono font-bold bg-slate-100 dark:bg-[#273449] text-slate-600 dark:text-[#CBD5E1] px-2 py-0.5 rounded">
                  Bank Payroll File
                </span>
              </div>
              <h3 className="font-black text-slate-800 dark:text-[#F1F5F9] text-sm">كشف تحويل رواتب البنك</h3>
              <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-1">
                كشف تفصيلي بأرقام حسابات الموظفين والـ IBAN ومبالغ الصافي جاهزة للتحويل
              </p>
              <div className="mt-4 p-3 bg-orange-50/50 dark:bg-orange-950/50 rounded-xl border border-orange-100 dark:border-orange-900">
                <div className="text-[11px] text-orange-700 dark:text-[#FB923C] font-bold">إجمالي المبلغ المحول:</div>
                <div className="text-xl font-black text-orange-800 dark:text-[#FB923C] mt-0.5">{totalNet.toLocaleString('ar-EG')} ج.م</div>
                <div className="text-[10px] text-slate-500 dark:text-[#CBD5E1] mt-1">لعدد {payrollData.length} حساب بنكي</div>
              </div>
            </div>
            <button
              onClick={() => exportBankTransferExcel(payrollData, activePeriod, settings.company.name)}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition"
            >
              <Download className="w-4 h-4" />
              <span>تنزيل ملف البنك (Excel)</span>
            </button>
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* صف 2: شهادة الراتب + الغياب + الإضافي */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 dark:text-[#CBD5E1] mb-3 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          تقارير الموظفين التشغيلية
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* شهادة راتب شهرية */}
          <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-[#4ADE80]">
                  <UserCheck className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono font-bold bg-slate-100 dark:bg-[#273449] text-slate-600 dark:text-[#CBD5E1] px-2 py-0.5 rounded">
                  للبنوك والقروض
                </span>
              </div>
              <h3 className="font-black text-slate-800 dark:text-[#F1F5F9] text-sm">شهادة راتب شهرية</h3>
              <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-1">
                شهادة راتب رسمية للموظف لتقديمها للبنوك أو الحصول على تأشيرة أو قرض
              </p>
            </div>
            <div className="mt-4 space-y-2">
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#273449] font-medium dark:text-white"
              >
                <option value="">— اختر موظفاً —</option>
                {payrollData.map(p => (
                  <option key={p.employeeId} value={p.employeeId}>{p.employeeName} ({p.jobTitle})</option>
                ))}
              </select>
              <button
                onClick={handlePrintSalaryCertificate}
                disabled={!selectedEmpId}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة / حفظ شهادة الراتب PDF</span>
              </button>
            </div>
          </div>

          {/* تقرير الغياب والخصومات */}
          <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400">
                  <CalendarOff className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono font-bold bg-slate-100 dark:bg-[#273449] text-slate-600 dark:text-[#CBD5E1] px-2 py-0.5 rounded">
                  خصومات وسلف
                </span>
              </div>
              <h3 className="font-black text-slate-800 dark:text-[#F1F5F9] text-sm">تقرير الغياب والخصومات</h3>
              <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-1">
                كشف تفصيلي بخصومات الغياب والجزاءات الإدارية والسلف الشهرية
              </p>
              <div className="mt-4 p-3 bg-red-50/50 dark:bg-red-950/50 rounded-xl border border-red-100 dark:border-red-900">
                <div className="text-[11px] text-red-700 dark:text-red-400 font-bold">إجمالي الخصومات هذا الشهر:</div>
                <div className="text-xl font-black text-red-800 dark:text-red-300 mt-0.5">
                  {payrollData.reduce((a, b) => a + b.absenceDeduction + b.penaltyDeduction + b.loansAndAdvances + b.otherDeductions, 0).toLocaleString('ar-EG')} ج.م
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => generateAbsenceReportPdf(payrollData, activePeriod, settings)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
              >
                <Printer className="w-4 h-4" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => exportAbsenceReportToExcel(payrollData, activePeriod, settings.company.name, settings.company)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Excel</span>
              </button>
            </div>
          </div>

          {/* تقرير الساعات الإضافية */}
          <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-[#FBBF24]">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono font-bold bg-slate-100 dark:bg-[#273449] text-slate-600 dark:text-[#CBD5E1] px-2 py-0.5 rounded">
                  مادة 85 قانون العمل
                </span>
              </div>
              <h3 className="font-black text-slate-800 dark:text-[#F1F5F9] text-sm">تقرير الساعات الإضافية</h3>
              <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-1">
                كشف بالساعات الإضافية المعتمدة (نهاري 35% / ليلي 70% / عطلة 100%)
              </p>
              <div className="mt-4 p-3 bg-amber-50/50 dark:bg-amber-950/50 rounded-xl border border-amber-100 dark:border-amber-900">
                <div className="text-[11px] text-amber-700 dark:text-[#FBBF24] font-bold">إجمالي ساعات الإضافي:</div>
                <div className="text-xl font-black text-amber-800 dark:text-[#FBBF24] mt-0.5">
                  {effects.filter(e => e.status === 'approved' && e.type === 'overtime').reduce((a, b) => a + (Number(b.units) || 0), 0)} ساعة
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => generateOvertimeReportPdf(effects, payrollData, activePeriod, settings)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
              >
                <Printer className="w-4 h-4" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => exportOvertimeReportToExcel(effects, activePeriod, settings.company.name, settings.company)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Excel</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* صف 3: الإجازات + المأموريات + قائمة الموظفين */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 dark:text-[#CBD5E1] mb-3 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          تقارير الموارد البشرية
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* تقرير أرصدة الإجازات */}
          <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono font-bold bg-slate-100 dark:bg-[#273449] text-slate-600 dark:text-[#CBD5E1] px-2 py-0.5 rounded">
                  مادة 47 قانون العمل
                </span>
              </div>
              <h3 className="font-black text-slate-800 dark:text-[#F1F5F9] text-sm">تقرير أرصدة الإجازات</h3>
              <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-1">
                أرصدة الإجازات السنوية (21/30 يوم) والعارضة (6 أيام) لكل موظف
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => generateLeaveBalancePdf(employees, settings)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
              >
                <Printer className="w-4 h-4" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => exportLeaveBalanceToExcel(employees, settings.company.name, settings.company)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Excel</span>
              </button>
            </div>
          </div>

          {/* تقرير المأموريات */}
          <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
                  <Map className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono font-bold bg-slate-100 dark:bg-[#273449] text-slate-600 dark:text-[#CBD5E1] px-2 py-0.5 rounded">
                  بدل انتقال وإقامة
                </span>
              </div>
              <h3 className="font-black text-slate-800 dark:text-[#F1F5F9] text-sm">تقرير المأموريات الخارجية</h3>
              <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-1">
                كشف بالمأموريات الخارجية المعتمدة والمبالغ المصروفة (بدل انتقال وإقامة)
              </p>
              <div className="mt-4 p-3 bg-cyan-50/50 dark:bg-cyan-950/50 rounded-xl border border-cyan-100 dark:border-cyan-900">
                <div className="text-[11px] text-cyan-700 dark:text-cyan-400 font-bold">إجمالي مبالغ المأموريات:</div>
                <div className="text-xl font-black text-cyan-800 dark:text-cyan-300 mt-0.5">
                  {effects.filter(e => e.status === 'approved' && e.type === 'mission').reduce((a, b) => a + (b.amount || 0), 0).toLocaleString('ar-EG')} ج.م
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => generateMissionReportPdf(effects, activePeriod, settings)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
              >
                <Printer className="w-4 h-4" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => exportMissionReportToExcel(effects, activePeriod, settings.company.name, settings.company)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Excel</span>
              </button>
            </div>
          </div>

          {/* قائمة الموظفين */}
          <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#273449] text-slate-600 dark:text-[#CBD5E1]">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono font-bold bg-slate-100 dark:bg-[#273449] text-slate-600 dark:text-[#CBD5E1] px-2 py-0.5 rounded">
                  Employee Roster
                </span>
              </div>
              <h3 className="font-black text-slate-800 dark:text-[#F1F5F9] text-sm">قائمة الموظفين وبياناتهم</h3>
              <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-1">
                كشف شامل ببيانات جميع الموظفين (أرقام قومية، تأمينية، أ salaries، أقسام)
              </p>
              <div className="mt-4 p-3 bg-slate-50 dark:bg-[#273449] rounded-xl border border-slate-200 dark:border-[#334155]">
                <div className="text-[11px] text-slate-600 dark:text-[#CBD5E1] font-bold">عدد الموظفين المسجلين:</div>
                <div className="text-xl font-black text-slate-800 dark:text-[#F1F5F9] mt-0.5">{employees.length} موظف</div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => generateEmployeeRosterPdf(employees, settings)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
              >
                <Printer className="w-4 h-4" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => exportEmployeeRosterToExcel(employees, settings.company.name, settings.company)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Excel</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* مساحة طباعة مسير الرواتب */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-[#F1F5F9]">معاينة مسير الرواتب الرسمي الجاهز للطباعة والـ PDF</h3>
            <p className="text-xs text-slate-500 dark:text-[#CBD5E1]">منسق كملف A4 أفقي رسمي معتمد</p>
          </div>
          {payrollData.length > 0 && (
            <button
              onClick={handlePrintPayrollReport}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة أو حفظ PDF المسير</span>
            </button>
          )}
        </div>

        {payrollData.length === 0 ? (
          <div className="p-12 text-center text-slate-400 dark:text-[#94A3B8]">
            <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-[#94A3B8]" />
            <p className="text-sm font-bold">لا توجد بيانات كشف مسير الرواتب بعد</p>
            <p className="text-xs mt-1">أضف موظفين ثم احسب الرواتب لمعاينة الكشف هنا</p>
          </div>
        ) : (
        <div id="payroll-print-container" className="p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-xl font-sans text-slate-900 dark:text-[#F1F5F9]">
          
          {/* ترويسة التقرير الرسمي */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 dark:border-[#475569] pb-4 mb-4">
            <div>
              <h2 className="text-base font-black">{settings.company.name}</h2>
              <p className="text-xs text-slate-600 dark:text-[#94A3B8]">س.ت: {settings.company.commercialRegister} • ب.ض: {settings.company.taxNumber}</p>
              <p className="text-xs text-slate-600 dark:text-[#94A3B8]">{settings.company.address}</p>
            </div>
            <div className="text-left">
              <h3 className="text-sm font-black bg-slate-900 dark:bg-[#0F172A] text-white px-3 py-1 rounded">كشف مسير رواتب وأجور</h3>
              <p className="text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mt-1">عن شهر: {activePeriod}</p>
            </div>
          </div>

          {/* جدول الرواتب الرسمي */}
          <table className="w-full text-right border border-slate-300 dark:border-[#475569] text-[10px] border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-[#273449] border-b border-slate-300 dark:border-[#475569] font-bold">
                <th className="p-2 border-l border-slate-300 dark:border-[#475569]">م</th>
                <th className="p-2 border-l border-slate-300 dark:border-[#475569]">اسم الموظف</th>
                <th className="p-2 border-l border-slate-300 dark:border-[#475569]">الوظيفة</th>
                <th className="p-2 border-l border-slate-300 dark:border-[#475569]">الأساسي</th>
                <th className="p-2 border-l border-slate-300 dark:border-[#475569]">المتغير</th>
                <th className="p-2 border-l border-slate-300 dark:border-[#475569]">إضافي ومكافآت</th>
                <th className="p-2 border-l border-slate-300 dark:border-[#475569] font-black">إجمالي الأجر</th>
                <th className="p-2 border-l border-slate-300 dark:border-[#475569]">تأمينات 11%</th>
                <th className="p-2 border-l border-slate-300 dark:border-[#475569]">ضريبة الدخل</th>
                <th className="p-2 border-l border-slate-300 dark:border-[#475569]">خصومات وسلف</th>
                <th className="p-2 border-l border-slate-300 dark:border-[#475569] font-black bg-slate-200 dark:bg-[#334155]">الصافي</th>
                <th className="p-2">توقيع المستلم</th>
              </tr>
            </thead>
            <tbody>
              {payrollData.map((row, idx) => (
                <tr key={row.employeeId} className="border-b border-slate-200 dark:border-[#334155]">
                  <td className="p-2 border-l border-slate-200 dark:border-[#334155] text-center">{idx + 1}</td>
                  <td className="p-2 border-l border-slate-200 dark:border-[#334155] font-bold">{row.employeeName}</td>
                  <td className="p-2 border-l border-slate-200 dark:border-[#334155]">{row.jobTitle}</td>
                  <td className="p-2 border-l border-slate-200 dark:border-[#334155]">{row.basicSalary.toLocaleString()}</td>
                  <td className="p-2 border-l border-slate-200 dark:border-[#334155]">{row.variableSalary.toLocaleString()}</td>
                  <td className="p-2 border-l border-slate-200 dark:border-[#334155]">{(row.overtimePay + row.bonuses + row.missionAllowances).toLocaleString()}</td>
                  <td className="p-2 border-l border-slate-200 dark:border-[#334155] font-bold">{row.totalEntitlements.toLocaleString()}</td>
                  <td className="p-2 border-l border-slate-200 dark:border-[#334155] text-rose-600 dark:text-[#F87171]">{row.socialInsuranceEmployee.toLocaleString()}</td>
                  <td className="p-2 border-l border-slate-200 dark:border-[#334155] text-rose-600 dark:text-[#F87171]">{row.incomeTax.toLocaleString()}</td>
                  <td className="p-2 border-l border-slate-200 dark:border-[#334155] text-rose-600 dark:text-[#F87171]">{(row.absenceDeduction + row.penaltyDeduction + row.loansAndAdvances + row.otherDeductions).toLocaleString()}</td>
                  <td className="p-2 border-l border-slate-200 dark:border-[#334155] font-black bg-slate-50 dark:bg-[#273449]">{row.netSalary.toLocaleString()}</td>
                  <td className="p-2"></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 dark:bg-[#273449] font-bold border-t-2 border-slate-400 dark:border-[#475569]">
                <td colSpan="3" className="p-2 border-l border-slate-300 dark:border-[#475569] text-center">الإجمالي العام:</td>
                <td className="p-2 border-l border-slate-300 dark:border-[#475569]">{payrollData.reduce((a, b) => a + b.basicSalary, 0).toLocaleString()}</td>
                <td className="p-2 border-l border-slate-300 dark:border-[#475569]">{payrollData.reduce((a, b) => a + b.variableSalary, 0).toLocaleString()}</td>
                <td className="p-2 border-l border-slate-300 dark:border-[#475569]">{payrollData.reduce((a, b) => a + (b.overtimePay + b.bonuses + b.missionAllowances), 0).toLocaleString()}</td>
                <td className="p-2 border-l border-slate-300 dark:border-[#475569]">{payrollData.reduce((a, b) => a + b.totalEntitlements, 0).toLocaleString()}</td>
                <td className="p-2 border-l border-slate-300 dark:border-[#475569]">{totalEmpIns.toLocaleString()}</td>
                <td className="p-2 border-l border-slate-300 dark:border-[#475569]">{totalTax.toLocaleString()}</td>
                <td className="p-2 border-l border-slate-300 dark:border-[#475569]">{payrollData.reduce((a, b) => a + (b.absenceDeduction + b.penaltyDeduction + b.loansAndAdvances + b.otherDeductions), 0).toLocaleString()}</td>
                <td className="p-2 border-l border-slate-300 dark:border-[#475569] font-black">{totalNet.toLocaleString()} ج.م</td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          {/* التوقيعات والاعتمادات الرسمية */}
          <div className="grid grid-cols-3 gap-8 text-center text-xs font-bold pt-8 mt-6 border-t border-slate-200 dark:border-[#334155]">
            <div>
              <p className="text-slate-500 dark:text-[#94A3B8]">إعداد / أخصائي الموارد البشرية</p>
              <div className="mt-8 border-b border-dashed border-slate-400 dark:border-[#475569] w-32 mx-auto"></div>
            </div>
            <div>
              <p className="text-slate-500 dark:text-[#94A3B8]">المراجعة / الإدارة المالية</p>
              <div className="mt-8 border-b border-dashed border-slate-400 dark:border-[#475569] w-32 mx-auto"></div>
            </div>
            <div>
              <p className="text-slate-500 dark:text-[#94A3B8]">اعتماد المدير العام / ختم الشركة</p>
              <div className="mt-8 border-b border-dashed border-slate-400 dark:border-[#475569] w-32 mx-auto"></div>
            </div>
          </div>

        </div>
        )}
      </div>

    </div>
  );
}
