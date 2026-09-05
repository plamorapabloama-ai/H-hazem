import React, { useState } from 'react';
import { useHR } from '../../context/HRContext';
import { 
  CalendarCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  PlusCircle, 
  AlertCircle,
  Eye,
  Filter,
  CheckSquare,
  Square,
  Trash2,
  X
} from 'lucide-react';
import BulkActionsBar from '../common/BulkActionsBar';

export default function PendingApprovals() {
  const { effects, updateEffectStatus, deleteEffect, employees, addEffect } = useHR();
  const [filterStatus, setFilterStatus] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [noteModal, setNoteModal] = useState({ open: false, effectId: null, action: 'approved', note: '' });
  const [selectedIds, setSelectedIds] = useState(new Set());

  // إضافة مؤثر مباشر من الإدارة
  const [directModal, setDirectModal] = useState(false);
  const [directForm, setDirectForm] = useState({
    employeeId: employees[0] ? employees[0].id : '',
    type: 'bonus',
    typeLabel: 'مكافأة مالية',
    amount: '',
    units: 1,
    unitType: 'أيام',
    reason: ''
  });

  const filteredEffects = effects.filter(eff => {
    const matchesStatus = filterStatus === 'all' || eff.status === filterStatus;
    const matchesSearch = eff.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          eff.typeLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (eff.reason && eff.reason.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const selectedItems = filteredEffects.filter(e => selectedIds.has(e.id));

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredEffects.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEffects.map(e => e.id)));
    }
  };

  const handleBulkApprove = () => {
    selectedIds.forEach(id => {
      updateEffectStatus(id, 'approved', 'اعتماد جماعي');
    });
    setSelectedIds(new Set());
  };

  const handleBulkReject = () => {
    selectedIds.forEach(id => {
      updateEffectStatus(id, 'rejected', 'رفض جماعي');
    });
    setSelectedIds(new Set());
  };

  const handleBulkDelete = () => {
    if (!window.confirm(`هل أنت متأكد من حذف ${selectedIds.size} مؤثر؟`)) return;
    selectedIds.forEach(id => deleteEffect(id));
    setSelectedIds(new Set());
  };

  const handleActionClick = (effectId, action) => {
    setNoteModal({
      open: true,
      effectId,
      action,
      note: action === 'approved' ? 'معتمد وفقاً للوائح العمل' : 'مرفوض لعدم استيفاء الشروط'
    });
  };

  const confirmAction = () => {
    updateEffectStatus(noteModal.effectId, noteModal.action, noteModal.note);
    setNoteModal({ open: false, effectId: null, action: 'approved', note: '' });
  };

  const handleCreateDirectEffect = (e) => {
    e.preventDefault();
    const emp = employees.find(x => x.id === directForm.employeeId);
    
    let label = directForm.type === 'bonus' ? 'مكافأة تميز' :
                directForm.type === 'penalty' ? 'جزاء إداري' :
                directForm.type === 'absence' ? 'خصم غياب بدون إذن' : 'استقطاع مالي';

    addEffect({
      employeeId: directForm.employeeId,
      employeeName: emp ? emp.name : 'موظف',
      type: directForm.type,
      typeLabel: label,
      amount: directForm.amount ? Number(directForm.amount) : 0,
      units: directForm.units ? Number(directForm.units) : 0,
      unitType: directForm.unitType,
      reason: directForm.reason,
      status: 'approved',
      adminNotes: 'أضيف مباشرة من إدارة الموارد البشرية'
    });

    setDirectModal(false);
    setDirectForm({
      employeeId: employees[0] ? employees[0].id : '',
      type: 'bonus',
      typeLabel: 'مكافأة مالية',
      amount: '',
      units: 1,
      unitType: 'أيام',
      reason: ''
    });
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      
      {/* رأس الصفحة والإحصائيات */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-orange-600 dark:text-[#FB923C]" />
            <h2 className="text-lg font-black text-slate-800 dark:text-[#F1F5F9]">صندوق سحب واعتماد المؤثرات</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">
            سحب ومراجعة كافة طلبات الموظفين واعتمادها للتأثير المباشر على مسير الرواتب
          </p>
        </div>

        <button
          onClick={() => setDirectModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-black shadow-md shadow-orange-600/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>إضافة مؤثر إداري مباشر (مكافأة / جزاء)</span>
        </button>
      </div>

      {/* شريط البحث والفلترة */}
      <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 dark:text-[#94A3B8] absolute right-3 top-3" />
          <input
            type="text"
            placeholder="بحث باسم الموظف أو نوع المؤثر..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9] text-xs font-medium focus:ring-1 focus:ring-orange-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterStatus('pending')}
            className={'px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ' + (
              filterStatus === 'pending' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-[#273449] text-slate-600 dark:text-[#CBD5E1] hover:bg-slate-200 dark:hover:bg-[#334155]'
            )}
          >
            قيد الانتظار ({effects.filter(e => e.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={'px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ' + (
              filterStatus === 'approved' ? 'bg-orange-600 text-white' : 'bg-slate-100 dark:bg-[#273449] text-slate-600 dark:text-[#CBD5E1] hover:bg-slate-200 dark:hover:bg-[#334155]'
            )}
          >
            المعتمدة ({effects.filter(e => e.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilterStatus('rejected')}
            className={'px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ' + (
              filterStatus === 'rejected' ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-[#273449] text-slate-600 dark:text-[#CBD5E1] hover:bg-slate-200 dark:hover:bg-[#334155]'
            )}
          >
            المرفوضة ({effects.filter(e => e.status === 'rejected').length})
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={'px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ' + (
              filterStatus === 'all' ? 'bg-slate-800 dark:bg-orange-600 text-white' : 'bg-slate-100 dark:bg-[#273449] text-slate-600 dark:text-[#CBD5E1] hover:bg-slate-200 dark:hover:bg-[#334155]'
            )}
          >
            الكل ({effects.length})
          </button>
        </div>
      </div>

      {/* جدول أو بطاقات المؤثرات */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm overflow-hidden">
        {selectedIds.size > 0 && (
          <div className="bg-orange-50 dark:bg-orange-950/30 border-b border-orange-200 dark:border-orange-800 px-4 py-2.5 flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-orange-700 dark:text-orange-300">
              {selectedIds.size} مؤثر محدد
            </span>
            <div className="flex items-center gap-2 mr-auto">
              <button onClick={handleBulkApprove} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg transition">
                <CheckCircle2 className="w-3.5 h-3.5" /> اعتماد الكل
              </button>
              <button onClick={handleBulkReject} className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold rounded-lg transition">
                <XCircle className="w-3.5 h-3.5" /> رفض الكل
              </button>
              <button onClick={handleBulkDelete} className="flex items-center gap-1 px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white text-[11px] font-bold rounded-lg transition">
                <Trash2 className="w-3.5 h-3.5" /> حذف
              </button>
              <button onClick={() => setSelectedIds(new Set())} className="p-1.5 hover:bg-orange-100 dark:hover:bg-orange-900 rounded-lg transition">
                <X className="w-4 h-4 text-orange-600 dark:text-[#FB923C]" />
              </button>
            </div>
          </div>
        )}
        {filteredEffects.length === 0 ? (
          <div className="p-12 text-center text-slate-400 dark:text-[#94A3B8] text-xs font-bold">
            لا توجد مؤثرات مطابقة للشروط المحددة حالياً.
          </div>
        ) : (
          <>
            <div className="px-4 py-2.5 border-b border-slate-100 dark:border-[#334155] flex items-center gap-3">
              <button onClick={toggleSelectAll} className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-[#CBD5E1] hover:text-orange-600 dark:hover:text-[#FB923C] transition">
                {selectedIds.size === filteredEffects.length
                  ? <CheckSquare className="w-5 h-5 text-orange-500" />
                  : <Square className="w-5 h-5" />}
                <span>{selectedIds.size === filteredEffects.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}</span>
              </button>
              {selectedIds.size > 0 && (
                <span className="text-[11px] font-bold text-orange-600 dark:text-[#FB923C]">
                  {selectedIds.size} من {filteredEffects.length} محدد
                </span>
              )}
            </div>
            <div className="divide-y divide-slate-100 dark:divide-[#334155]">
            {filteredEffects.map(eff => (
              <div key={eff.id} className={'p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition ' + (selectedIds.has(eff.id) ? 'bg-orange-50/50 dark:bg-orange-950/20' : 'hover:bg-slate-50 dark:hover:bg-[#273449]')}>
                <div className="flex items-start gap-4">
                  <button onClick={() => toggleSelect(eff.id)} className="mt-1 hover:scale-110 transition shrink-0 cursor-pointer p-1 -m-1 rounded-lg">
                    {selectedIds.has(eff.id)
                      ? <CheckSquare className="w-6 h-6 text-orange-500" />
                      : <Square className="w-6 h-6 text-slate-400 dark:text-[#94A3B8] hover:text-orange-400 dark:hover:text-[#FB923C]" />}
                  </button>
                  <div className={'p-3 rounded-2xl text-xs font-black shrink-0 ' + (
                    eff.type === 'leave' ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' :
                    eff.type === 'overtime' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                    eff.type === 'mission' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                    eff.type === 'loan' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                    eff.type === 'bonus' ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  )}>
                    {eff.typeLabel}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-800 dark:text-[#F1F5F9]">{eff.employeeName}</h4>
                      <span className="text-[10px] bg-slate-100 dark:bg-[#273449] text-slate-600 dark:text-[#CBD5E1] px-2 py-0.5 rounded font-mono font-bold">
                        {eff.employeeId}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-[#94A3B8]">#{eff.id}</span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-[#CBD5E1] mt-1 font-medium">
                      {eff.reason || 'طلب مؤثر بدون مبرر مكتوب'}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-[#94A3B8] mt-2">
                      <span>تاريخ الطلب: <b>{eff.requestDate}</b></span>
                      {eff.startDate && <span>الفترة: <b>من {eff.startDate} إلى {eff.endDate || eff.startDate}</b></span>}
                      {eff.units > 0 && <span className="text-slate-800 dark:text-[#F1F5F9] font-bold">الكمية: {eff.units} {eff.unitType}</span>}
                      {eff.amount > 0 && <span className="text-orange-700 dark:text-[#FB923C] font-black">المبلغ: {eff.amount.toLocaleString('ar-EG')} ج.م</span>}
                      {eff.destination && <span>الجهة: <b>{eff.destination}</b></span>}
                    </div>

                    {eff.adminNotes && (
                      <div className="mt-2 text-[11px] text-slate-600 dark:text-[#CBD5E1] bg-slate-100/80 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg inline-block border border-slate-200 dark:border-[#334155]">
                        ملاحظة الإدارة: {eff.adminNotes}
                      </div>
                    )}
                  </div>
                </div>

                {/* أزرار الإجراء */}
                <div className="flex items-center justify-end gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-[#334155]">
                  {eff.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleActionClick(eff.id, 'approved')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-sm transition"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>اعتماد المؤثر</span>
                      </button>

                      <button
                        onClick={() => handleActionClick(eff.id, 'rejected')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-[#F87171] hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-800 text-xs font-bold transition"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>رفض</span>
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={'px-3 py-1 rounded-full text-xs font-bold ' + (
                        eff.status === 'approved' ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      )}>
                        {eff.status === 'approved' ? 'معتمد رسمياً' : 'مرفوض'}
                      </span>
                      <button
                        onClick={() => handleActionClick(eff.id, eff.status === 'approved' ? 'rejected' : 'approved')}
                        className="text-[11px] text-slate-400 dark:text-[#94A3B8] hover:text-slate-700 dark:hover:text-slate-300 underline"
                      >
                        تغيير القرار
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          </>
        )}
      </div>

      {/* نافذة كتابة ملاحظات الاعتماد أو الرفض */}
      {noteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 dark:border-[#334155]">
            <h3 className="text-sm font-black text-slate-800 dark:text-[#F1F5F9] mb-2">
              {noteModal.action === 'approved' ? 'تأكيد اعتماد المؤثر المالي' : 'تأكيد رفض الطلب'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] mb-4">
              يمكنك كتابة ملاحظات ستظهر للموظف وتبقى مسجلة في ملف الراتب.
            </p>

            <textarea
              rows="3"
              value={noteModal.note}
              onChange={(e) => setNoteModal({ ...noteModal, note: e.target.value })}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9] focus:ring-1 focus:ring-orange-500 outline-none mb-4"
              placeholder="اكتب ملاحظة الاعتماد أو الرفض..."
            ></textarea>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setNoteModal({ open: false, effectId: null, action: 'approved', note: '' })}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#273449] rounded-xl"
              >
                تراجع
              </button>
              <button
                onClick={confirmAction}
                className={'px-5 py-2 text-xs font-black text-white rounded-xl shadow-md ' + (
                  noteModal.action === 'approved' ? 'bg-orange-600 hover:bg-orange-500' : 'bg-rose-600 hover:bg-rose-500'
                )}
              >
                تأكيد القرار
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة إضافة مؤثر مباشر من الإدارة */}
      {directModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 dark:border-[#334155]">
            <h3 className="text-base font-black text-slate-800 dark:text-[#F1F5F9] mb-1">إضافة مؤثر إداري مباشر</h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] mb-4">
              إدراج مكافأة، أو تطبيق لائحة الجزاءات والغياب مباشرة في حساب الراتب
            </p>

            <form onSubmit={handleCreateDirectEffect} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">الموظف المعني</label>
                <select
                  value={directForm.employeeId}
                  onChange={(e) => setDirectForm({ ...directForm, employeeId: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9] font-medium"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.jobTitle})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">نوع المؤثر الإداري</label>
                <select
                  value={directForm.type}
                  onChange={(e) => setDirectForm({ ...directForm, type: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9] font-medium"
                >
                  <option value="bonus">مكافأة تميز وإنتاجية (إضافة على الراتب)</option>
                  <option value="penalty">جزاء إداري (خصم أيام من الراتب وفق اللائحة)</option>
                  <option value="absence">غياب بدون إذن (خصم أيام الغياب)</option>
                  <option value="deduction">استقطاع أو خصم مالي مباشر (ج.م)</option>
                </select>
              </div>

              {(directForm.type === 'penalty' || directForm.type === 'absence') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">عدد الأيام المستقطعة</label>
                  <input
                    type="number"
                    min="0.25"
                    step="0.25"
                    value={directForm.units}
                    onChange={(e) => setDirectForm({ ...directForm, units: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9]"
                    required
                  />
                </div>
              )}

              {(directForm.type === 'bonus' || directForm.type === 'deduction') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">المبلغ المالي (ج.م)</label>
                  <input
                    type="number"
                    placeholder="مثال: 1000"
                    value={directForm.amount}
                    onChange={(e) => setDirectForm({ ...directForm, amount: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9] font-bold"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">السبب والسند الإداري</label>
                <textarea
                  rows="2"
                  value={directForm.reason}
                  onChange={(e) => setDirectForm({ ...directForm, reason: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9]"
                  placeholder="مثال: قرار لجنة التحقيق رقم 14 أو تقرير تقييم الأداء..."
                  required
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#334155]">
                <button
                  type="button"
                  onClick={() => setDirectModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#273449] rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black text-white bg-orange-600 hover:bg-orange-500 rounded-xl shadow-md shadow-orange-600/30"
                >
                  حفظ المؤثر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BulkActionsBar
        selectedCount={selectedIds.size}
        totalCount={filteredEffects.length}
        selectLabel="مؤثر"
        onToggleAll={toggleSelectAll}
        onDeselectAll={() => setSelectedIds(new Set())}
        onDelete={handleBulkDelete}
      />

    </div>
  );
}