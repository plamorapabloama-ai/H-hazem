import React from 'react';
import { CheckSquare, Square, Trash2, FileSpreadsheet, Printer, X, Download, Eye } from 'lucide-react';

export default function BulkActionsBar({
  selectedCount,
  totalCount,
  onToggleAll,
  onDeselectAll,
  onExportExcel,
  onExportPdf,
  onDelete,
  onViewPayslips,
  selectLabel = 'عنصر',
}) {
  if (selectedCount === 0) return null;

  const allSelected = selectedCount === totalCount;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-[#0F172A] dark:bg-[#1E293B] text-white rounded-2xl shadow-2xl shadow-slate-900/30 border border-[#334155] px-4 py-3 flex items-center gap-3 min-w-[340px] max-w-[95vw]">
        <button
          onClick={onToggleAll}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition text-xs font-bold shrink-0"
          title={allSelected ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
        >
          {allSelected ? <CheckSquare className="w-4 h-4 text-orange-400" /> : <Square className="w-4 h-4" />}
          <span>{allSelected ? 'إلغاء الكل' : 'تحديد الكل'}</span>
        </button>

        <div className="h-6 w-px bg-slate-600 shrink-0" />

        <div className="flex items-center gap-1.5 text-xs font-bold">
          <span className="text-orange-400">{selectedCount}</span>
          <span className="text-slate-400">من</span>
          <span>{totalCount}</span>
          <span className="text-slate-400">{selectLabel}</span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1.5">
          {onViewPayslips && (
            <button
              onClick={onViewPayslips}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 transition text-[11px] font-bold"
              title="عرض مفردات الرواتب المحددة"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">مفردات</span>
            </button>
          )}
          {onExportExcel && (
            <button
              onClick={onExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 transition text-[11px] font-bold"
              title="تصدير Excel للعناصر المحددة"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Excel</span>
            </button>
          )}
          {onExportPdf && (
            <button
              onClick={onExportPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 transition text-[11px] font-bold"
              title="تصدير PDF للعناصر المحددة"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PDF</span>
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 transition text-[11px] font-bold"
              title="حذف العناصر المحددة"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">حذف</span>
            </button>
          )}
        </div>

        <div className="h-6 w-px bg-slate-600 shrink-0" />

        <button
          onClick={onDeselectAll}
          className="p-1.5 rounded-lg hover:bg-white/10 transition"
          title="إلغاء التحديد"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </div>
  );
}
