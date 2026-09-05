import React from 'react';
import { useHR } from '../../context/HRContext';
import { X, Printer, Download, QrCode, CheckCircle2, ShieldCheck, Building2 } from 'lucide-react';
import { tafqeet } from '../../utils/tafqeet';
import { generatePayslipPdf } from '../../utils/pdfGenerator';

export default function PayslipModal({ employeeSalary, onClose }) {
  const { settings, activePeriod } = useHR();

  if (!employeeSalary) return null;

  const handlePrint = () => {
    generatePayslipPdf(employeeSalary, settings, activePeriod);
  };

  const tafqeetText = tafqeet(employeeSalary.netSalary);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 dark:bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-[#334155] overflow-hidden my-6">
        
        {/* شريط التحكم العلوي */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-orange-400" />
            <h3 className="text-sm font-black">إشعار مفردات الراتب الرسمي (Payslip)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 rounded-xl text-xs font-black transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / حفظ PDF</span>
            </button>
            <button onClick={onClose} className="p-1 text-slate-200 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* حاوية القسيمة المطبوعة (A4 Format) */}
        <div id="single-payslip-content" className="p-6 sm:p-8 bg-white text-slate-900 font-sans space-y-6">
          
          {/* ترويسة المنشأة */}
          <div className="flex justify-between items-start border-b-2 border-orange-700 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">{settings.company.name}</h2>
              <p className="text-xs text-slate-600 mt-0.5">سجل تجاري: {settings.company.commercialRegister} • بطاقة ضريبية: {settings.company.taxNumber}</p>
              <p className="text-xs text-slate-500">{settings.company.insuranceOffice} • رقم المنشأة: {settings.company.insuranceNumber}</p>
            </div>
            <div className="text-left bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="text-[11px] font-bold text-orange-800">بيان مفردات مرتب</div>
              <div className="text-xs font-black text-slate-800">شهر: {activePeriod}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">تاريخ الإصدار: {new Date().toLocaleDateString('ar-EG')}</div>
            </div>
          </div>

          {/* بيانات الموظف */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">اسم الموظف:</span>
              <strong className="text-slate-900 text-sm">{employeeSalary.employeeName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">كود الموظف:</span>
              <strong className="text-slate-800 font-mono">{employeeSalary.employeeId}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">الرقم القومي:</span>
              <strong className="text-slate-800 font-mono">{employeeSalary.nationalId || '---'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">الوظيفة:</span>
              <strong className="text-slate-800">{employeeSalary.jobTitle}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">القسم / الإدارة:</span>
              <strong className="text-slate-800">{employeeSalary.department}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">الرقم التأميني:</span>
              <strong className="text-slate-800 font-mono">{employeeSalary.insuranceNumber || '---'}</strong>
            </div>
          </div>

          {/* جدول الاستحقاقات والاستقطاعات */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* جانب الاستحقاقات (Earnings) */}
            <div className="border border-orange-200 rounded-xl overflow-hidden">
              <div className="bg-orange-700 text-white p-2.5 text-xs font-black flex justify-between">
                <span>بيان الاستحقاقات (+)</span>
                <span>المبلغ (ج.م)</span>
              </div>
              <div className="p-3 space-y-2 text-xs divide-y divide-slate-100">
                <div className="flex justify-between pt-1">
                  <span className="text-slate-600">الراتب الأساسي</span>
                  <span className="font-bold text-slate-800">{employeeSalary.basicSalary.toLocaleString('ar-EG')}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-600">الراتب المتغير</span>
                  <span className="font-bold text-slate-800">{employeeSalary.variableSalary.toLocaleString('ar-EG')}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-600">البدلات الثابتة المعفاة</span>
                  <span className="font-bold text-slate-800">{employeeSalary.fixedAllowances.toLocaleString('ar-EG')}</span>
                </div>
                {employeeSalary.overtimePay > 0 && (
                  <div className="flex justify-between pt-1 text-orange-700 font-bold">
                    <span>ساعات عمل إضافية (مادة 85)</span>
                    <span>+{employeeSalary.overtimePay.toLocaleString('ar-EG')}</span>
                  </div>
                )}
                {employeeSalary.bonuses > 0 && (
                  <div className="flex justify-between pt-1 text-orange-700 font-bold">
                    <span>مكافأة تشجيعية</span>
                    <span>+{employeeSalary.bonuses.toLocaleString('ar-EG')}</span>
                  </div>
                )}
                {employeeSalary.missionAllowances > 0 && (
                  <div className="flex justify-between pt-1 text-orange-700 font-bold">
                    <span>بدلات مأمورية خارجية</span>
                    <span>+{employeeSalary.missionAllowances.toLocaleString('ar-EG')}</span>
                  </div>
                )}
              </div>
              <div className="bg-orange-50 p-3 border-t border-orange-200 flex justify-between text-xs font-black text-orange-900">
                <span>إجمالي الاستحقاقات:</span>
                <span>{employeeSalary.totalEntitlements.toLocaleString('ar-EG')} ج.م</span>
              </div>
            </div>

            {/* جانب الاستقطاعات (Deductions) */}
            <div className="border border-rose-200 rounded-xl overflow-hidden">
              <div className="bg-rose-700 text-white p-2.5 text-xs font-black flex justify-between">
                <span>بيان الاستقطاعات (-)</span>
                <span>المبلغ (ج.م)</span>
              </div>
              <div className="p-3 space-y-2 text-xs divide-y divide-slate-100">
                <div className="flex justify-between pt-1">
                  <span className="text-slate-600">تأمينات اجتماعية (حصة العامل 11%)</span>
                  <span className="font-bold text-rose-700">-{employeeSalary.socialInsuranceEmployee.toLocaleString('ar-EG')}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-600">ضريبة كسب العمل (الدخل)</span>
                  <span className="font-bold text-rose-700">-{employeeSalary.incomeTax.toLocaleString('ar-EG')}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-600">صندوق تكريم الشهداء (0.0005)</span>
                  <span className="font-bold text-rose-700">-{employeeSalary.martyrsFund.toLocaleString('ar-EG')}</span>
                </div>
                {employeeSalary.absenceDeduction > 0 && (
                  <div className="flex justify-between pt-1 text-rose-600">
                    <span>خصم غياب ({employeeSalary.absenceDays} يوم)</span>
                    <span className="font-bold">-{employeeSalary.absenceDeduction.toLocaleString('ar-EG')}</span>
                  </div>
                )}
                {employeeSalary.penaltyDeduction > 0 && (
                  <div className="flex justify-between pt-1 text-rose-600">
                    <span>جزاءات إدارية ({employeeSalary.penaltyDays} يوم)</span>
                    <span className="font-bold">-{employeeSalary.penaltyDeduction.toLocaleString('ar-EG')}</span>
                  </div>
                )}
                {employeeSalary.loansAndAdvances > 0 && (
                  <div className="flex justify-between pt-1 text-rose-600">
                    <span>سلفة شخصية مستحقة</span>
                    <span className="font-bold">-{employeeSalary.loansAndAdvances.toLocaleString('ar-EG')}</span>
                  </div>
                )}
                {employeeSalary.otherDeductions > 0 && (
                  <div className="flex justify-between pt-1 text-rose-600">
                    <span>استقطاعات أخرى</span>
                    <span className="font-bold">-{employeeSalary.otherDeductions.toLocaleString('ar-EG')}</span>
                  </div>
                )}
              </div>
              <div className="bg-rose-50 p-3 border-t border-rose-200 flex justify-between text-xs font-black text-rose-900">
                <span>إجمالي الاستقطاعات:</span>
                <span>-{employeeSalary.totalDeductions.toLocaleString('ar-EG')} ج.م</span>
              </div>
            </div>

          </div>

          {/* مربع الصافي النهائي مع التفقيط المالي */}
          <div className="p-4 bg-gradient-to-r from-slate-900 to-orange-950 text-white rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-200 font-bold block">صافي الراتب المستحق للصرف:</span>
              <div className="text-2xl sm:text-3xl font-black text-orange-400 mt-1">
                {employeeSalary.netSalary.toLocaleString('ar-EG')} <span className="text-sm font-normal text-white">جنيه مصري</span>
              </div>
              <div className="text-xs text-slate-200 font-bold mt-1.5 bg-white/10 px-3 py-1 rounded-lg inline-block">
                {tafqeetText}
              </div>
            </div>

            <div className="text-center bg-white/10 p-3 rounded-xl border border-white/20 text-xs">
              <span className="block text-slate-300 text-[11px]">طريقة الصرف:</span>
              <strong className="text-white block mt-0.5">{employeeSalary.bankAccount ? 'تحويل بنكي' : 'خزينة المنشأة'}</strong>
              <span className="font-mono text-[10px] text-slate-200">{employeeSalary.bankAccount || 'نقداً'}</span>
            </div>
          </div>

          {/* التوقيعات والختم */}
          <div className="grid grid-cols-2 gap-8 text-center text-xs font-bold pt-6 border-t border-slate-200">
            <div>
              <p className="text-slate-500">إدارة الموارد البشرية والحسابات</p>
              <div className="mt-8 border-b border-dashed border-slate-400 w-36 mx-auto"></div>
            </div>
            <div>
              <p className="text-slate-500">توقيع واستلام الموظف</p>
              <div className="mt-8 border-b border-dashed border-slate-400 w-36 mx-auto"></div>
            </div>
          </div>

        </div>

        {/* زر إغلاق أسفل القسيمة */}
        <div className="p-4 bg-slate-50 dark:bg-[#273449] border-t border-slate-200 dark:border-[#334155] flex justify-center">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-black transition shadow-md"
          >
            <X className="w-4 h-4" />
            <span>إغلاق القسيمة</span>
          </button>
        </div>

      </div>
    </div>
  );
}
