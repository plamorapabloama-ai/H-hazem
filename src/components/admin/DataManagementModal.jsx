import React, { useState } from 'react';
import { useHR } from '../../context/HRContext';
import { AlertTriangle, Trash2, RefreshCw, Database, Users, FileText, Download, Upload } from 'lucide-react';

export default function DataManagementModal({ isOpen, onClose }) {
  const { employees, effects, factoryReset, clearAllEffects, clearAllEmployees, loadDemoData, verifyAdminPassword } = useHR();
  const [confirmText, setConfirmText] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [activeAction, setActiveAction] = useState(null);
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const employeeStorage = JSON.stringify(employees).length;
  const effectsStorage = JSON.stringify(effects).length;
  const totalKB = ((employeeStorage + effectsStorage) / 1024).toFixed(1);

  const handleFactoryReset = () => {
    if (!verifyAdminPassword(adminPass)) {
      alert('كلمة مرور الأدمن غير صحيحة');
      return;
    }
    if (confirmText !== 'تصفير') {
      alert('اكتب كلمة "تصفير" للتأكيد');
      return;
    }
    factoryReset();
    setSuccess('تم تصفير المصنع بنجاح! النظام جاهز للعمل الحي.');
    setConfirmText('');
    setAdminPass('');
    setActiveAction(null);
  };

  const handleClearEffects = () => {
    if (!verifyAdminPassword(adminPass)) {
      alert('كلمة مرور الأدمن غير صحيحة');
      return;
    }
    clearAllEffects();
    setSuccess('تم مسح جميع المؤثرات والطلبات بنجاح.');
    setAdminPass('');
    setActiveAction(null);
  };

  const handleClearEmployees = () => {
    if (!verifyAdminPassword(adminPass)) {
      alert('كلمة مرور الأدمن غير صحيحة');
      return;
    }
    if (!window.confirm('هل أنت متأكد من حذف جميع الموظفين؟ لن يمكن التراجع!')) return;
    clearAllEmployees();
    setSuccess('تم حذف جميع الموظفين والمؤثرات بنجاح.');
    setAdminPass('');
    setActiveAction(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 dark:bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-[#334155] overflow-hidden my-6">

        <div className="p-5 bg-gradient-to-r from-rose-600 to-red-700 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              <h3 className="text-sm font-black">إدارة البيانات وضبط المصنع</h3>
            </div>
            <button onClick={onClose} className="p-1 text-white/70 hover:text-white">✕</button>
          </div>
        </div>

        <div className="p-5 space-y-4">

          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="bg-slate-50 dark:bg-[#273449] p-3 rounded-xl border border-slate-200 dark:border-[#334155]">
              <Users className="w-5 h-5 text-orange-600 dark:text-[#FB923C] mx-auto mb-1" />
              <div className="font-black text-lg text-slate-800 dark:text-[#F1F5F9]">{employees.length}</div>
              <div className="text-slate-500 dark:text-[#94A3B8] font-bold">موظف</div>
            </div>
            <div className="bg-slate-50 dark:bg-[#273449] p-3 rounded-xl border border-slate-200 dark:border-[#334155]">
              <FileText className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <div className="font-black text-lg text-slate-800 dark:text-[#F1F5F9]">{effects.length}</div>
              <div className="text-slate-500 dark:text-[#94A3B8] font-bold">مؤثر / طلب</div>
            </div>
            <div className="bg-slate-50 dark:bg-[#273449] p-3 rounded-xl border border-slate-200 dark:border-[#334155]">
              <Database className="w-5 h-5 text-amber-600 dark:text-[#FBBF24] mx-auto mb-1" />
              <div className="font-black text-lg text-slate-800 dark:text-[#F1F5F9]">{totalKB}</div>
              <div className="text-slate-500 dark:text-[#94A3B8] font-bold">كيلوبايت</div>
            </div>
          </div>

          {success && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 text-xs font-bold">
              <span className="text-orange-500">✓</span>
              {success}
            </div>
          )}

          <div className="space-y-2">
            <button
              onClick={() => {
                setSuccess('استخدم تبويب "إدارة ونسخ البيانات" في الإعدادات لتصدير/استعادة النسخ الاحتياطي وقوالب Excel.');
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-[#334155] hover:bg-slate-50 dark:hover:bg-[#273449] transition text-right"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                <Download className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-800 dark:text-[#F1F5F9]">تصدير نسخة احتياطية كاملة (JSON)</div>
                <div className="text-[10px] text-slate-400 dark:text-[#94A3B8]">يشمل جميع البيانات والإعدادات وكلمات المرور</div>
              </div>
            </button>

            <button
              onClick={() => setActiveAction('cleareffects')}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-[#334155] hover:bg-slate-50 dark:hover:bg-[#273449] transition text-right"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-amber-600 dark:text-[#FBBF24]" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-800 dark:text-[#F1F5F9]">مسح المؤثرات والطلبات فقط</div>
                <div className="text-[10px] text-slate-400 dark:text-[#94A3B8]">يترك الموظفين ويحذف الطلبات والتغييرات الشهرية</div>
              </div>
            </button>

            <button
              onClick={() => setActiveAction('clearemployees')}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-[#334155] hover:bg-slate-50 dark:hover:bg-[#273449] transition text-right"
            >
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-orange-600 dark:text-[#FB923C]" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-800 dark:text-[#F1F5F9]">حذف جميع الموظفين</div>
                <div className="text-[10px] text-slate-400 dark:text-[#94A3B8]">يحذف جميع الموظفين والمؤثرات المرتبطة بهم</div>
              </div>
            </button>

            <button
              onClick={() => { loadDemoData(); setSuccess('تم تحميل البيانات التجريبية بنجاح!'); }}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-[#334155] hover:bg-slate-50 dark:hover:bg-[#273449] transition text-right"
            >
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5 text-orange-600 dark:text-[#FB923C]" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-800 dark:text-[#F1F5F9]">استعادة البيانات التجريبية</div>
                <div className="text-[10px] text-slate-400 dark:text-[#94A3B8]">استعادة البيانات المصغرة للعرض التجريبي</div>
              </div>
            </button>

            <button
              onClick={() => setActiveAction('factoryreset')}
              className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/50 hover:bg-red-50 dark:hover:bg-red-950 transition text-right"
            >
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="font-bold text-xs text-red-800 dark:text-red-200">ضبط المصنع والتصفير الكامل</div>
                <div className="text-[10px] text-red-500 dark:text-red-400">يحذف كل شيء ويترك النظام فارغاً 100%</div>
              </div>
            </button>
          </div>

          {activeAction === 'factoryreset' && (
            <div className="bg-red-50 dark:bg-red-950 p-4 rounded-xl border border-red-200 dark:border-red-800 space-y-3">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300 text-xs font-bold">
                <AlertTriangle className="w-4 h-4" />
                تحذير: هذا الإجراء لا رجعة فيه!
              </div>
              <input
                type="password"
                placeholder="كلمة مرور المدير"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-[#1E293B] dark:text-[#F1F5F9] text-xs"
              />
              <input
                type="text"
                placeholder='اكتب "تصفير" للتأكيد'
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-[#1E293B] dark:text-[#F1F5F9] text-xs"
              />
              <button
                onClick={handleFactoryReset}
                disabled={confirmText !== 'تصفير' || !adminPass}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-black text-xs rounded-xl transition"
              >
                تأكيد التصفير الكامل
              </button>
            </div>
          )}

          {activeAction === 'cleareffects' && (
            <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-xl border border-amber-200 dark:border-amber-800 space-y-3">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-xs font-bold">
                <AlertTriangle className="w-4 h-4" />
                تأكيد مسح جميع المؤثرات والطلبات
              </div>
              <input
                type="password"
                placeholder="كلمة مرور المدير"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-amber-200 dark:border-amber-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9] text-xs"
              />
              <button
                onClick={handleClearEffects}
                disabled={!adminPass}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-black text-xs rounded-xl transition"
              >
                مسح المؤثرات
              </button>
            </div>
          )}

          {activeAction === 'clearemployees' && (
            <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-xl border border-orange-200 dark:border-orange-800 space-y-3">
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300 text-xs font-bold">
                <AlertTriangle className="w-4 h-4" />
                تأكيد حذف جميع الموظفين
              </div>
              <input
                type="password"
                placeholder="كلمة مرور المدير"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-orange-200 dark:border-orange-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9] text-xs"
              />
              <button
                onClick={handleClearEmployees}
                disabled={!adminPass}
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-black text-xs rounded-xl transition"
              >
                حذف جميع الموظفين
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
