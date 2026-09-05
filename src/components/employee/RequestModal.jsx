import React, { useState } from 'react';
import { useHR } from '../../context/HRContext';
import { X, Calendar, Clock, Briefcase, DollarSign, Send } from 'lucide-react';

export default function RequestModal({ isOpen, onClose, initialType = 'leave' }) {
  const { currentUser, employees, addEffect } = useHR();

  const [type, setType] = useState(initialType);
  const [leaveType, setLeaveType] = useState('annual');
  const [overtimeCategory, setOvertimeCategory] = useState('day');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [units, setUnits] = useState(1);
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('');
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    let typeLabel = 'طلب مؤثر';
    let unitType = 'أيام';

    if (type === 'leave') {
      typeLabel = leaveType === 'annual' ? 'إجازة اعتيادية' : (leaveType === 'casual' ? 'إجازة عارضة' : 'إجازة مرضية');
      unitType = 'أيام';
    } else if (type === 'overtime') {
      typeLabel = 'ساعات عمل إضافية';
      unitType = 'ساعات';
    } else if (type === 'mission') {
      typeLabel = 'مأمورية عمل خارجية';
      unitType = 'أيام';
    } else if (type === 'loan') {
      typeLabel = 'طلب سلفة مالية';
      unitType = '';
    } else if (type === 'bonus') {
      typeLabel = 'مكافأة تشجيعية';
      unitType = '';
    } else if (type === 'penalty') {
      typeLabel = 'جزاء إداري';
      unitType = 'أيام';
    }

    addEffect({
      employeeId: currentUser.employeeId,
      type,
      typeLabel,
      leaveType,
      overtimeCategory,
      startDate,
      endDate,
      date,
      units: Number(units) || 0,
      unitType,
      amount: amount ? Number(amount) : 0,
      destination,
      reason
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto dark:bg-black/80">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden my-8 dark:bg-[#1E293B] dark:border-[#334155]">
        
        {/* رأس النافذة */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between dark:bg-[#273449] dark:border-[#334155]">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-orange-600 dark:text-[#FB923C]" />
            <h3 className="text-base font-black text-slate-800 dark:text-[#F1F5F9]">تقديم طلب مؤثر جديد</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg dark:text-[#94A3B8] dark:hover:text-[#CBD5E1]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* نموذج الإدخال */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* اختيار نوع المؤثر */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 dark:text-[#CBD5E1]">نوع الطلب / المؤثر</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setType('leave')}
                className={'py-2 px-3 text-xs font-bold rounded-xl border transition ' + (
                  type === 'leave'
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-[#273449] dark:text-[#CBD5E1] dark:border-[#334155] dark:hover:bg-[#334155]'
                )}
              >
                إجازة
              </button>

              <button
                type="button"
                onClick={() => setType('overtime')}
                className={'py-2 px-3 text-xs font-bold rounded-xl border transition ' + (
                  type === 'overtime'
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-[#273449] dark:text-[#CBD5E1] dark:border-[#334155] dark:hover:bg-[#334155]'
                )}
              >
                ساعات إضافية
              </button>

              <button
                type="button"
                onClick={() => setType('mission')}
                className={'py-2 px-3 text-xs font-bold rounded-xl border transition ' + (
                  type === 'mission'
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-[#273449] dark:text-[#CBD5E1] dark:border-[#334155] dark:hover:bg-[#334155]'
                )}
              >
                مأمورية
              </button>

              <button
                type="button"
                onClick={() => setType('loan')}
                className={'py-2 px-3 text-xs font-bold rounded-xl border transition ' + (
                  type === 'loan'
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-[#273449] dark:text-[#CBD5E1] dark:border-[#334155] dark:hover:bg-[#334155]'
                )}
              >
                سلفة
              </button>
            </div>
          </div>

          {/* تفاصيل مخصصة حسب النوع */}
          {type === 'leave' && (
            <div className="space-y-3 p-3 bg-orange-50/50 rounded-xl border border-orange-100 dark:bg-orange-950/30 dark:border-orange-900">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 dark:text-[#CBD5E1]">نوع الإجازة</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white font-medium dark:bg-[#273449] dark:border-[#334155] dark:text-[#F1F5F9]"
                >
                  <option value="annual">إجازة اعتيادية سنوية (خصم من الرصيد 21/30 يوم)</option>
                  <option value="casual">إجازة عارضة (حد أقصى يومين متتاليين - رصيد 6 أيام)</option>
                  <option value="sick">إجازة مرضية (وفق تقرير التأمين الصحي)</option>
                  <option value="unpaid">إجازة بدون راتب</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 dark:text-[#CBD5E1]">تاريخ البداية</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white dark:bg-[#273449] dark:border-[#334155] dark:text-[#F1F5F9]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 dark:text-[#CBD5E1]">تاريخ النهاية</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white dark:bg-[#273449] dark:border-[#334155] dark:text-[#F1F5F9]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 dark:text-[#CBD5E1]">عدد الأيام</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white dark:bg-[#273449] dark:border-[#334155] dark:text-[#F1F5F9]"
                  required
                />
              </div>
            </div>
          )}

          {type === 'overtime' && (
            <div className="space-y-3 p-3 bg-amber-50/50 rounded-xl border border-amber-100 dark:bg-amber-950/30 dark:border-amber-900">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 dark:text-[#CBD5E1]">فترة العمل الإضافي (وفق مادة 85 من قانون العمل)</label>
                <select
                  value={overtimeCategory}
                  onChange={(e) => setOvertimeCategory(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white font-medium dark:bg-[#273449] dark:border-[#334155] dark:text-[#F1F5F9]"
                >
                  <option value="day">ساعات عمل نهارية (الأجر الأساسي + 35%)</option>
                  <option value="night">ساعات عمل ليلية (الأجر الأساسي + 70%)</option>
                  <option value="holiday">عطلات رسمية وأسبوعية (الأجر الأساسي + 100%)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 dark:text-[#CBD5E1]">تاريخ التكليف</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white dark:bg-[#273449] dark:border-[#334155] dark:text-[#F1F5F9]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 dark:text-[#CBD5E1]">عدد الساعات الإضافية</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    step="0.5"
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white dark:bg-[#273449] dark:border-[#334155] dark:text-[#F1F5F9]"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {type === 'mission' && (
            <div className="space-y-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100 dark:bg-blue-950/30 dark:border-blue-900">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 dark:text-[#CBD5E1]">جهة المأمورية والهدف</label>
                <input
                  type="text"
                  placeholder="مثال: زيارة فرع الإسكندرية لمراجعة المخازن"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white dark:bg-[#273449] dark:border-[#334155] dark:text-[#F1F5F9]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 dark:text-[#CBD5E1]">تاريخ البداية</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white dark:bg-[#273449] dark:border-[#334155] dark:text-[#F1F5F9]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 dark:text-[#CBD5E1]">بدل انتقال مقترح (ج.م)</label>
                  <input
                    type="number"
                    placeholder="مثال: 500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white dark:bg-[#273449] dark:border-[#334155] dark:text-[#F1F5F9]"
                  />
                </div>
              </div>
            </div>
          )}

          {type === 'loan' && (
            <div className="space-y-3 p-3 bg-purple-50/50 rounded-xl border border-purple-100 dark:bg-purple-950/30 dark:border-purple-900">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 dark:text-[#CBD5E1]">مبلغ السلفة المطلوب (ج.م)</label>
                <input
                  type="number"
                  placeholder="مثال: 2000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-bold text-orange-700 dark:bg-[#273449] dark:border-[#334155] dark:text-[#FB923C]"
                  required
                />
              </div>
            </div>
          )}

          {/* سبب الطلب */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 dark:text-[#CBD5E1]">أسباب وتفاصيل الطلب</label>
            <textarea
              rows="3"
              placeholder="اكتب توضيحاً تفصيلياً للطلب..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white font-medium dark:bg-[#273449] dark:border-[#334155] dark:text-[#F1F5F9]"
              required
            ></textarea>
          </div>

          {/* زر التأكيد */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 dark:border-[#334155]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl dark:text-[#94A3B8] dark:hover:bg-[#273449]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-black text-white bg-orange-600 hover:bg-orange-500 rounded-xl shadow-md shadow-orange-600/30"
            >
              إرسال الطلب للاعتماد
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}