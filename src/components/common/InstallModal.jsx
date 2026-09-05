import React from 'react';
import { X, Smartphone, Download, CheckCircle, Share2, PlusSquare } from 'lucide-react';

export default function InstallModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-[#334155] space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-orange-500 flex items-center justify-center text-white font-black text-xl shadow-md">
              ن
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-[#F1F5F9]">تثبيت التطبيق على الموبايل</h3>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8]">Progressive Web App (PWA)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 dark:text-[#94A3B8] hover:text-slate-700 dark:hover:text-[#F1F5F9] rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-xl border border-orange-100 dark:border-orange-900 text-xs text-orange-900 dark:text-orange-200 space-y-2">
          <div className="font-black flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-orange-600" />
            <span>مميزات تثبيت التطبيق:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-orange-800/90 font-medium">
            <li>فتح مباشر من شاشة الموبايل الرئيسية كأي تطبيق أصيل.</li>
            <li>العمل بسلاسة وسرعة فائقة دون شريط المتصفح.</li>
            <li>تقديم المؤثرات وسحب الرواتب في أي مكان.</li>
          </ul>
        </div>

        {/* خطوات التثبيت على آيفون وأندرويد */}
        <div className="space-y-3 text-xs">
          
          <div className="p-3 bg-slate-50 dark:bg-[#273449] rounded-xl border border-slate-200 dark:border-[#334155]">
            <span className="font-black text-slate-800 dark:text-[#F1F5F9] block mb-1">لهواتف iPhone (Safari):</span>
            <p className="text-[11px] text-slate-600 dark:text-[#CBD5E1] leading-relaxed">
              1. اضغط على زر <b>المشاركة (Share) <Share2 className="w-3.5 h-3.5 inline text-blue-500" /></b> في أسفل متصفح Safari.
              <br />
              2. مرر للأسفل واختر <b>"إضافة إلى الصفحة الرئيسية" (Add to Home Screen) <PlusSquare className="w-3.5 h-3.5 inline text-slate-700" /></b>.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-[#273449] rounded-xl border border-slate-200 dark:border-[#334155]">
            <span className="font-black text-slate-800 dark:text-[#F1F5F9] block mb-1">لهواتف Android (Chrome):</span>
            <p className="text-[11px] text-slate-600 dark:text-[#CBD5E1] leading-relaxed">
              1. اضغط على أيقونة <b>الثلاث نقاط (⋮)</b> في أعلى يمين المتصفح.
              <br />
              2. اضغط على خيار <b>"تثبيت التطبيق" (Install App)</b> أو <b>"إضافة إلى الشاشة الرئيسية"</b>.
            </p>
          </div>

        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black shadow-md shadow-orange-600/20"
        >
          فهمت، حسناً
        </button>

      </div>
    </div>
  );
}
