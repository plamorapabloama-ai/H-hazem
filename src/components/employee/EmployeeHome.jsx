import React from 'react';
import { useHR } from '../../context/HRContext';
import { 
  Calendar, 
  Briefcase, 
  Clock, 
  DollarSign, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ChevronLeft,
  PlusCircle,
  Award,
  Wallet
} from 'lucide-react';

export default function EmployeeHome({ onOpenNewRequest, setActiveTab, setSelectedPayslipEmp }) {
  const { currentUser, employees, effects, calculatePayrollForPeriod, activePeriod } = useHR();

  const currentEmp = employees.find(e => e.id === currentUser.employeeId) || employees[0];
  const myEffects = effects.filter(e => e.employeeId === currentEmp?.id);
  const myPendingCount = myEffects.filter(e => e.status === 'pending').length;

  // احتساب تقديري لراتب الشهر الحالي
  const payrollList = calculatePayrollForPeriod(activePeriod);
  const mySalary = payrollList.find(p => p.employeeId === currentEmp?.id);

  const annualPercent = Math.min(100, Math.round(((currentEmp?.annualLeaveBalance || 0) / 21) * 100));
  const casualPercent = Math.min(100, Math.round(((currentEmp?.casualLeaveBalance || 0) / 6) * 100));

  if (!currentEmp) {
    return (
      <div className="space-y-6 pb-20 md:pb-6">
        <div className="bg-gradient-to-r from-slate-900 via-orange-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-black">مرحباً بك في نظام إدارة الموارد البشرية</h2>
          <p className="text-sm text-slate-300 mt-1">لم يتم تعيين موظف بعد. ابدأ بإضافة موظفين من لوحة تحكم المدير.</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center dark:bg-[#1E293B] dark:border-[#334155]">
          <Briefcase className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-[#94A3B8]" />
          <p className="text-sm font-bold text-slate-600 dark:text-[#CBD5E1]">لا توجد بيانات موظف معين</p>
          <p className="text-xs text-slate-400 mt-1 dark:text-[#94A3B8]">تواصل مع الإدارة لتسجيل بياناتك في النظام</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      
      {/* بطاقة الترحيب والملف الشخصي */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-800 via-orange-800 to-slate-900 text-white p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl font-black text-orange-300 shadow-inner">
              {currentEmp?.name ? currentEmp.name.charAt(0) : 'م'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black text-white">مرحباً، {currentEmp?.name}</h2>
                <span className="text-xs bg-orange-500/30 border border-orange-400/40 text-orange-200 px-2.5 py-0.5 rounded-full font-bold">
                  {currentEmp?.role === 'admin' ? 'مدير نظام' : 'موظف'}
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-200 mt-1">
                {currentEmp?.jobTitle} • {currentEmp?.department}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-200 mt-2">
                <span>كود الموظف: <b className="text-white">{currentEmp?.id}</b></span>
                <span>الرقم التأميني: <b className="text-white">{currentEmp?.insuranceNumber}</b></span>
              </div>
            </div>
          </div>

          {/* زر التقديم السريع لمؤثر */}
          <button
            onClick={() => onOpenNewRequest('leave')}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-sm shadow-lg shadow-orange-500/30 transition active:scale-95"
          >
            <PlusCircle className="w-5 h-5" />
            <span>تقديم طلب مؤثر جديد</span>
          </button>
        </div>

        {/* دوائر خلفية زخرفية */}
        <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-orange-500/10 blur-2xl"></div>
        <div className="absolute right-1/3 -top-12 w-32 h-32 rounded-full bg-orange-400/10 blur-xl"></div>
      </div>

      {/* أرصدة الموظف السريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* رصيد الاعتيادي */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm dark:bg-[#1E293B] dark:border-[#334155]">
          <div className="flex items-center justify-between text-slate-400 mb-2 dark:text-[#94A3B8]">
            <span className="text-xs font-bold text-slate-600 dark:text-[#CBD5E1]">الإجازات الاعتيادية</span>
            <Calendar className="w-4 h-4 text-orange-600 dark:text-[#FB923C]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-800 dark:text-[#F1F5F9]">{currentEmp?.annualLeaveBalance || 0}</span>
            <span className="text-xs text-slate-500 font-medium dark:text-[#CBD5E1]">يوم متبقي</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden dark:bg-[#273449]">
            <div 
              className="bg-orange-500 h-full rounded-full" 
              style={{ width: annualPercent + '%' }}
            ></div>
          </div>
        </div>

        {/* رصيد العارضة */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm dark:bg-[#1E293B] dark:border-[#334155]">
          <div className="flex items-center justify-between text-slate-400 mb-2 dark:text-[#94A3B8]">
            <span className="text-xs font-bold text-slate-600 dark:text-[#CBD5E1]">الإجازات العارضة</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-800 dark:text-[#F1F5F9]">{currentEmp?.casualLeaveBalance || 0}</span>
            <span className="text-xs text-slate-500 font-medium dark:text-[#CBD5E1]">من أصل 6 أيام</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden dark:bg-[#273449]">
            <div 
              className="bg-amber-500 h-full rounded-full" 
              style={{ width: casualPercent + '%' }}
            ></div>
          </div>
        </div>

        {/* صافي الراتب المتوقع لهذا الشهر */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm dark:bg-[#1E293B] dark:border-[#334155]">
          <div className="flex items-center justify-between text-slate-400 mb-2 dark:text-[#94A3B8]">
            <span className="text-xs font-bold text-slate-600 dark:text-[#CBD5E1]">صافي راتب الشهر التقديري</span>
            <Wallet className="w-4 h-4 text-blue-600 dark:text-[#60A5FA]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-orange-700 dark:text-[#FB923C]">
              {mySalary ? mySalary.netSalary.toLocaleString('ar-EG') : '---'}
            </span>
            <span className="text-xs text-slate-500 font-medium dark:text-[#CBD5E1]">ج.م</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 dark:text-[#94A3B8]">
            بعد خصم التأمينات والضرائب وكافة المؤثرات
          </p>
        </div>

        {/* حالة الطلبات المعلقة */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm dark:bg-[#1E293B] dark:border-[#334155]">
          <div className="flex items-center justify-between text-slate-400 mb-2 dark:text-[#94A3B8]">
            <span className="text-xs font-bold text-slate-600 dark:text-[#CBD5E1]">طلبات قيد المراجعة</span>
            <AlertCircle className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-800 dark:text-[#F1F5F9]">{myPendingCount}</span>
            <span className="text-xs text-slate-500 font-medium dark:text-[#CBD5E1]">طلب بانتظار المدير</span>
          </div>
          <button
            onClick={() => setActiveTab('employee-requests')}
            className="text-[11px] text-orange-600 dark:text-[#FB923C] font-bold hover:underline mt-2 inline-flex items-center gap-1"
          >
            <span>استعراض الطلبات</span>
            <ChevronLeft className="w-3 h-3" />
          </button>
        </div>

      </div>

      {/* أزرار الإجراءات السريعة للموظف */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm dark:bg-[#1E293B] dark:border-[#334155]">
        <h3 className="text-sm font-black text-slate-800 mb-4 dark:text-[#F1F5F9]">إجراءات سريعة وتقديم المؤثرات</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          <button
            onClick={() => onOpenNewRequest('leave')}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 hover:bg-orange-50 hover:border-orange-200 border border-slate-200 transition group dark:bg-[#273449] dark:hover:bg-orange-950 dark:hover:border-orange-800 dark:border-[#334155]"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center mb-2 group-hover:scale-110 transition dark:bg-orange-900/30 dark:text-[#FB923C]">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-[#F1F5F9]">طلب إجازة</span>
            <span className="text-[10px] text-slate-500 dark:text-[#CBD5E1]">اعتيادي / عارضة / مرضي</span>
          </button>

          <button
            onClick={() => onOpenNewRequest('mission')}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 transition group dark:bg-[#273449] dark:hover:bg-blue-950 dark:hover:border-blue-800 dark:border-[#334155]"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-2 group-hover:scale-110 transition dark:bg-blue-900/30 dark:text-[#60A5FA]">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-[#F1F5F9]">مأمورية عمل</span>
            <span className="text-[10px] text-slate-500 dark:text-[#CBD5E1]">خارجية مع بدل انتقال</span>
          </button>

          <button
            onClick={() => onOpenNewRequest('overtime')}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 hover:bg-amber-50 hover:border-amber-200 border border-slate-200 transition group dark:bg-[#273449] dark:hover:bg-amber-950 dark:hover:border-amber-800 dark:border-[#334155]"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-110 transition dark:bg-amber-900/30 dark:text-[#FBBF24]">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-[#F1F5F9]">ساعات إضافية</span>
            <span className="text-[10px] text-slate-500 dark:text-[#CBD5E1]">نهاري / ليلي / عطلة</span>
          </button>

          <button
            onClick={() => onOpenNewRequest('loan')}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 transition group dark:bg-[#273449] dark:hover:bg-purple-950 dark:hover:border-purple-800 dark:border-[#334155]"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2 group-hover:scale-110 transition dark:bg-purple-900/30 dark:text-purple-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-[#F1F5F9]">طلب سلفة</span>
            <span className="text-[10px] text-slate-500 dark:text-[#CBD5E1]">سلفة تخصم من الراتب</span>
          </button>

        </div>
      </div>

      {/* آخر المؤثرات والطلبات الخاصة بالموظف */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden dark:bg-[#1E293B] dark:border-[#334155]">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between dark:border-[#334155]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-600 dark:text-[#FB923C]" />
            <h3 className="text-sm font-black text-slate-800 dark:text-[#F1F5F9]">سجل مؤثراتي وطلباتي الأخيرة</h3>
          </div>
          <button
            onClick={() => setActiveTab('employee-requests')}
            className="text-xs text-orange-600 dark:text-[#FB923C] hover:text-orange-700 font-bold"
          >
            عرض الكل ({myEffects.length})
          </button>
        </div>

        {myEffects.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs dark:text-[#94A3B8]">
            لا توجد مؤثرات مسجلة حتى الآن. يمكنك تقديم طلب جديد في أي وقت.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-[#334155]">
            {myEffects.slice(0, 5).map(eff => (
              <div key={eff.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition dark:hover:bg-[#273449]">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl text-xs font-bold ${
                    eff.type === 'leave' ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' :
                    eff.type === 'overtime' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                    eff.type === 'mission' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                    eff.type === 'loan' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                    eff.type === 'bonus' ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    {eff.typeLabel}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-[#F1F5F9]">{eff.reason || eff.typeLabel}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 dark:text-[#CBD5E1]">
                      {eff.startDate ? ('من ' + eff.startDate + ' إلى ' + (eff.endDate || eff.startDate)) : ('تاريخ: ' + (eff.date || eff.requestDate))}
                      {eff.units ? (' • ' + eff.units + ' ' + (eff.unitType || '')) : ''}
                      {eff.amount ? (' • ' + eff.amount.toLocaleString('ar-EG') + ' ج.م') : ''}
                    </p>
                    {eff.adminNotes && (
                      <p className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block dark:text-[#CBD5E1] dark:bg-[#273449]">
                        ملاحظات الإدارة: {eff.adminNotes}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    eff.status === 'approved' ? 'bg-orange-100 text-orange-800' :
                    eff.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {eff.status === 'approved' ? 'معتمد' : eff.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}