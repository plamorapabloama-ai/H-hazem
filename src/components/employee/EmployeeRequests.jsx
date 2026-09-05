import React, { useState } from 'react';
import { useHR } from '../../context/HRContext';
import { FileText, PlusCircle, Filter, CheckCircle2, Clock, XCircle, Trash2 } from 'lucide-react';

export default function EmployeeRequests({ onOpenNewRequest }) {
  const { currentUser, effects, deleteEffect } = useHR();
  const [filterType, setFilterType] = useState('all');

  const myEffects = effects.filter(e => e.employeeId === currentUser.employeeId);

  const filtered = filterType === 'all' 
    ? myEffects 
    : myEffects.filter(e => e.type === filterType);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      
      {/* العنوان والشريط العلوي */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm dark:bg-[#1E293B] dark:border-[#334155]">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-[#F1F5F9]">سجل طلباتي والمؤثرات الشخصية</h2>
          <p className="text-xs text-slate-500 mt-1 dark:text-[#CBD5E1]">
            متابعة حالة الإجازات، المأموريات، الساعات الإضافية، والسلف المقدمة
          </p>
        </div>

        <button
          onClick={() => onOpenNewRequest('leave')}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-black shadow-md shadow-orange-600/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>تقديم طلب جديد</span>
        </button>
      </div>

      {/* شريط الفلترة */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterType('all')}
          className={'px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ' + (filterType === 'all' ? 'bg-slate-800 text-white dark:bg-orange-600 dark:text-white' : 'bg-white text-slate-600 border border-slate-200 dark:bg-[#1E293B] dark:text-[#CBD5E1] dark:border-[#334155]')}
        >
          الكل ({myEffects.length})
        </button>
        <button
          onClick={() => setFilterType('leave')}
          className={'px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ' + (filterType === 'leave' ? 'bg-orange-600 text-white' : 'bg-white text-slate-600 border border-slate-200 dark:bg-[#1E293B] dark:text-[#CBD5E1] dark:border-[#334155]')}
        >
          الإجازات ({myEffects.filter(e => e.type === 'leave').length})
        </button>
        <button
          onClick={() => setFilterType('overtime')}
          className={'px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ' + (filterType === 'overtime' ? 'bg-amber-600 text-white' : 'bg-white text-slate-600 border border-slate-200 dark:bg-[#1E293B] dark:text-[#CBD5E1] dark:border-[#334155]')}
        >
          ساعات إضافية ({myEffects.filter(e => e.type === 'overtime').length})
        </button>
        <button
          onClick={() => setFilterType('mission')}
          className={'px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ' + (filterType === 'mission' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 dark:bg-[#1E293B] dark:text-[#CBD5E1] dark:border-[#334155]')}
        >
          مأموريات ({myEffects.filter(e => e.type === 'mission').length})
        </button>
        <button
          onClick={() => setFilterType('loan')}
          className={'px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ' + (filterType === 'loan' ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 border border-slate-200 dark:bg-[#1E293B] dark:text-[#CBD5E1] dark:border-[#334155]')}
        >
          سلف وخصومات ({myEffects.filter(e => e.type === 'loan').length})
        </button>
      </div>

      {/* قائمة الطلبات */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden dark:bg-[#1E293B] dark:border-[#334155]">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3 dark:text-[#94A3B8]" />
            <p className="text-xs text-slate-500 font-bold dark:text-[#CBD5E1]">لا توجد طلبات مسجلة في هذا القسم</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-[#334155]">
            {filtered.map(eff => (
              <div key={eff.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition dark:hover:bg-[#273449]">
                <div className="flex items-start gap-3">
                  <div className={'p-2.5 rounded-xl text-xs font-black shrink-0 ' + (
                    eff.status === 'approved' ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' :
                    eff.status === 'rejected' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                    'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  )}>
                    {eff.status === 'approved' ? <CheckCircle2 className="w-5 h-5" /> :
                     eff.status === 'rejected' ? <XCircle className="w-5 h-5" /> :
                     <Clock className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 font-mono dark:text-[#CBD5E1]">#{eff.id}</span>
                      <h4 className="text-sm font-black text-slate-800 dark:text-[#F1F5F9]">{eff.typeLabel}</h4>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 dark:text-[#CBD5E1]">{eff.reason || 'بدون تفاصيل إضافية'}</p>
                    
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-2 dark:text-[#94A3B8]">
                      <span>تاريخ التقديم: {eff.requestDate}</span>
                      {eff.startDate && <span>الفترة: من {eff.startDate} إلى {eff.endDate}</span>}
                      {eff.units && <span className="font-bold text-slate-700 dark:text-[#CBD5E1]">{eff.units} {eff.unitType}</span>}
                       {eff.amount && <span className="font-bold text-orange-700 dark:text-[#FB923C]">{eff.amount.toLocaleString('ar-EG')} ج.م</span>}
                    </div>

                    {eff.adminNotes && (
                      <div className="mt-2 text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-lg border border-slate-200 inline-block dark:bg-[#273449] dark:text-[#CBD5E1] dark:border-[#334155]">
                        رد الإدارة: {eff.adminNotes}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-[#334155]">
                  <span className={'px-3 py-1 rounded-full text-xs font-bold ' + (
                    eff.status === 'approved' ? 'bg-orange-100 text-orange-800' :
                    eff.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                    'bg-amber-100 text-amber-800'
                  )}>
                    {eff.status === 'approved' ? 'تم الاعتماد' : eff.status === 'rejected' ? 'مرفوض' : 'قيد الانتظار'}
                  </span>

                  {eff.status === 'pending' && (
                    <button
                      onClick={() => {
                        if (window.confirm('هل تريد إلغاء هذا الطلب؟')) {
                          deleteEffect(eff.id);
                        }
                      }}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg dark:hover:bg-rose-950"
                      title="إلغاء الطلب"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}