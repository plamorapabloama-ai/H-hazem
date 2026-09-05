import React, { useState, useEffect, useRef } from 'react';
import { useHR } from '../../context/HRContext';
import { 
  Settings, 
  Building, 
  Percent, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  Smartphone, 
  Save, 
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  KeyRound,
  Database,
  Download,
  Upload,
  FileSpreadsheet,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  exportFullBackup, importFullBackup, 
  exportEmployeesToExcel, downloadEmployeeTemplate, importEmployeesFromExcel 
} from '../../utils/backupManager';

export default function SettingsManager() {
  const { settings, setSettings, resetToDemoData, loadDemoData, factoryReset, restoreFullBackup, employees, effects, adminPassword, updateAdminPassword, verifyAdminPassword, addEmployee } = useHR();
  const [activeTab, setActiveTab] = useState('company');
  const [localSettings, setLocalSettings] = useState(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState('');
  const [adminNewPass, setAdminNewPass] = useState('');
  const [adminOldPass, setAdminOldPass] = useState('');
  const [adminConfirmPass, setAdminConfirmPass] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showOldPass, setShowOldPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [adminMsg, setAdminMsg] = useState('');
  const importFileRef = useRef(null);
  const excelImportRef = useRef(null);

  // ─── حساب مساحة التخزين المستخدمة (IndexedDB) ───
  const [storageInfo, setStorageInfo] = useState({
    usedMB: '0.00', totalMB: '0', percent: 0, usageBytes: 0, quotaBytes: 0
  });

  useEffect(() => {
    let cancelled = false;
    const update = async () => {
      if (navigator.storage && navigator.storage.estimate) {
        const est = await navigator.storage.estimate();
        if (cancelled) return;
        setStorageInfo({
          usageMB: ((est.usage || 0) / (1024 * 1024)).toFixed(2),
          totalMB: ((est.quota || 0) / (1024 * 1024)).toFixed(0),
          percent: est.quota && est.quota > 0 ? Math.min(((est.usage || 0) / est.quota) * 100, 100) : 0,
          usageBytes: est.usage || 0,
          quotaBytes: est.quota || 0
        });
      }
    };
    update();
    const interval = setInterval(update, 4000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [employees, effects, settings, adminPassword]);

  useEffect(() => {
    setLocalSettings(settings);
    // تحميل الأيقونة المخصصة عند بدء التطبيق
    if (settings.company.icon) {
      updatePageIcon(settings.company.icon);
    }
  }, [settings]);

  const handleSave = (e) => {
    e.preventDefault();
    setSettings(localSettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCompanyChange = (field, val) => {
    setLocalSettings(prev => ({
      ...prev,
      company: { ...prev.company, [field]: val }
    }));
  };

  const updatePageIcon = (iconUrl) => {
    // تحديث favicon
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = iconUrl;

    // تحديث apple-touch-icon
    let appleLink = document.querySelector("link[rel='apple-touch-icon']");
    if (!appleLink) {
      appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      document.head.appendChild(appleLink);
    }
    appleLink.href = iconUrl;
  };

  const handleInsuranceChange = (field, val) => {
    setLocalSettings(prev => ({
      ...prev,
      socialInsurance: { ...prev.socialInsurance, [field]: Number(val) }
    }));
  };

  const handleTaxChange = (field, val) => {
    setLocalSettings(prev => ({
      ...prev,
      incomeTax: { ...prev.incomeTax, [field]: Number(val) }
    }));
  };

  const handleBracketChange = (index, field, val) => {
    setLocalSettings(prev => {
      const newBrackets = [...prev.incomeTax.taxBrackets];
      if (field === 'maxLimit') {
        newBrackets[index] = { ...newBrackets[index], maxLimit: val === 'Infinity' ? Infinity : Number(val) };
      } else {
        newBrackets[index] = { ...newBrackets[index], [field]: Number(val) };
      }
      return { ...prev, incomeTax: { ...prev.incomeTax, taxBrackets: newBrackets } };
    });
  };

  const addBracket = () => {
    setLocalSettings(prev => {
      const lastBracket = prev.incomeTax.taxBrackets[prev.incomeTax.taxBrackets.length - 1];
      const newMaxLimit = lastBracket && lastBracket.maxLimit !== Infinity ? lastBracket.maxLimit + 50000 : 50000;
      const newBracket = { maxLimit: newMaxLimit, rate: 0.25 };
      const updatedBrackets = prev.incomeTax.taxBrackets.map(b => 
        b.maxLimit === Infinity ? { maxLimit: newMaxLimit, rate: b.rate } : b
      );
      return { ...prev, incomeTax: { ...prev.incomeTax, taxBrackets: [...updatedBrackets, { maxLimit: Infinity, rate: 0.30 }] } };
    });
  };

  const removeBracket = (index) => {
    setLocalSettings(prev => {
      if (prev.incomeTax.taxBrackets.length <= 2) return prev;
      const newBrackets = prev.incomeTax.taxBrackets.filter((_, i) => i !== index);
      if (!newBrackets.some(b => b.maxLimit === Infinity)) {
        newBrackets[newBrackets.length - 1] = { ...newBrackets[newBrackets.length - 1], maxLimit: Infinity };
      }
      return { ...prev, incomeTax: { ...prev.incomeTax, taxBrackets: newBrackets } };
    });
  };

  const handleWorkRulesChange = (parent, field, val) => {
    if (parent === 'overtimeRates') {
      setLocalSettings(prev => ({
        ...prev,
        workRules: {
          ...prev.workRules,
          overtimeRates: { ...prev.workRules.overtimeRates, [field]: Number(val) }
        }
      }));
    } else {
      setLocalSettings(prev => ({
        ...prev,
        workRules: { ...prev.workRules, [field]: Number(val) }
      }));
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      
      {/* رأس الصفحة */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-600 dark:text-[#FB923C]" />
            <h2 className="text-lg font-black text-slate-800 dark:text-[#F1F5F9]">إعدادات النظام والتشريعات</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-1">
            التحكم الشامل في هوية المنشأة، شرائح الضرائب، نسب التأمينات، وقواعد العمل والإضافي
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-[#FB923C] bg-orange-50 dark:bg-orange-950 px-3 py-1.5 rounded-xl border border-orange-200 dark:border-orange-800">
              <CheckCircle2 className="w-4 h-4" />
              <span>تم حفظ الإعدادات بنجاح!</span>
            </span>
          )}

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black shadow-md shadow-orange-600/20 transition"
          >
            <Save className="w-4 h-4" />
            <span>حفظ كل الإعدادات</span>
          </button>
        </div>
      </div>

      {/* تبويبات الإعدادات */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('company')}
          className={'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ' + (
            activeTab === 'company' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white dark:bg-[#273449] text-slate-600 dark:text-[#CBD5E1] border border-slate-200 dark:border-[#334155]'
          )}
        >
          <Building className="w-4 h-4" />
          <span>بيانات وهوية المنشأة والأيقونة</span>
        </button>

        <button
          onClick={() => setActiveTab('tax')}
          className={'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ' + (
            activeTab === 'tax' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white dark:bg-[#273449] text-slate-600 dark:text-[#CBD5E1] border border-slate-200 dark:border-[#334155]'
          )}
        >
          <Percent className="w-4 h-4" />
          <span>شرائح ضريبة كسب العمل والشهداء</span>
        </button>

        <button
          onClick={() => setActiveTab('insurance')}
          className={'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ' + (
            activeTab === 'insurance' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white dark:bg-[#273449] text-slate-600 dark:text-[#CBD5E1] border border-slate-200 dark:border-[#334155]'
          )}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>التأمينات الاجتماعية (قانون 148)</span>
        </button>

        <button
          onClick={() => setActiveTab('work')}
          className={'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ' + (
            activeTab === 'work' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white dark:bg-[#273449] text-slate-600 dark:text-[#CBD5E1] border border-slate-200 dark:border-[#334155]'
          )}
        >
          <Clock className="w-4 h-4" />
          <span>لوائح وساعات العمل والإضافي</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ' + (
            activeTab === 'backup' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white dark:bg-[#273449] text-slate-600 dark:text-[#CBD5E1] border border-slate-200 dark:border-[#334155]'
          )}
        >
          <Database className="w-4 h-4" />
          <span>إدارة ونسخ البيانات</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ' + (
            activeTab === 'security' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white dark:bg-[#273449] text-slate-600 dark:text-[#CBD5E1] border border-slate-200 dark:border-[#334155]'
          )}
        >
          <KeyRound className="w-4 h-4" />
          <span>الأمان وكلمات المرور</span>
        </button>
      </div>

      {/* محتوى التبويبات */}
      <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm">
        
        {/* 1. بيانات وهوية المنشأة */}
        {activeTab === 'company' && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-800 dark:text-[#F1F5F9] border-b border-slate-100 dark:border-[#334155] pb-2">بيانات المنشأة والهوية البصرية</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">اسم المنشأة / الشركة</label>
                <input
                  type="text"
                  value={localSettings.company.name}
                  onChange={(e) => handleCompanyChange('name', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#273449] font-bold dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">رقم السجل التجاري</label>
                <input
                  type="text"
                  value={localSettings.company.commercialRegister}
                  onChange={(e) => handleCompanyChange('commercialRegister', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#273449] font-mono dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">رقم البطاقة الضريبية</label>
                <input
                  type="text"
                  value={localSettings.company.taxNumber}
                  onChange={(e) => handleCompanyChange('taxNumber', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#273449] font-mono dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">مكتب التأمينات التابع له</label>
                <input
                  type="text"
                  value={localSettings.company.insuranceOffice}
                  onChange={(e) => handleCompanyChange('insuranceOffice', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#273449] dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">الرقم التأميني للمنشأة</label>
                <input
                  type="text"
                  value={localSettings.company.insuranceNumber}
                  onChange={(e) => handleCompanyChange('insuranceNumber', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#273449] font-mono dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">عنوان المقر الرئيسي</label>
                <input
                  type="text"
                  value={localSettings.company.address}
                  onChange={(e) => handleCompanyChange('address', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#273449] dark:text-white"
                />
              </div>
            </div>

            {/* تخصيص أيقونة وشعار التطبيق */}
            <div className="pt-4 border-t border-slate-100 dark:border-[#334155] mt-4">
              <h4 className="text-xs font-black text-slate-800 dark:text-[#F1F5F9] mb-2">أيقونة وشعار التطبيق (PWA Icon)</h4>
              <p className="text-[11px] text-slate-500 dark:text-[#CBD5E1] mb-3">
                الأيقونة تظهر على شاشة الهاتف الرئيسية عند تثبيت التطبيق وفي شريط التنقل.
              </p>

              <div className="flex items-center gap-4 bg-slate-50 dark:bg-[#273449] p-4 rounded-xl border border-slate-200 dark:border-[#334155]">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg shrink-0 border-2 border-slate-200 dark:border-[#475569]">
                  <img 
                    src={localSettings.company.icon || '/ICON.png'} 
                    alt="App Icon" 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/ICON.png'; }}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="font-bold text-slate-800 dark:text-[#F1F5F9] text-xs">أيقونة التطبيق الحالية</div>
                  <p className="text-slate-500 dark:text-[#CBD5E1] text-[11px]">ارفع صورة مربعة (512×512 مُوصى به) لتغيير أيقونة التطبيق.</p>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-bold rounded-lg cursor-pointer transition shadow-sm">
                      <Upload className="w-3.5 h-3.5" />
                      <span>رفع أيقونة جديدة</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          if (file.size > 2 * 1024 * 1024) {
                            alert('الحجم الأقصى 2 ميجابايت');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const dataUrl = ev.target.result;
                            // حفظ في الإعدادات
                            handleCompanyChange('icon', dataUrl);
                            // تحديث الأيقونة في الصفحة فوراً
                            updatePageIcon(dataUrl);
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                    {localSettings.company.icon && (
                      <button
                        onClick={() => {
                          handleCompanyChange('icon', '');
                          updatePageIcon('/ICON.png');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 dark:bg-[#334155] hover:bg-slate-300 dark:hover:bg-[#334155] text-slate-700 dark:text-[#CBD5E1] text-[11px] font-bold rounded-lg transition"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>إعادة الافتراضي</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. شرائح الضرائب */}
        {activeTab === 'tax' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-2">
              <h3 className="text-sm font-black text-slate-800 dark:text-[#F1F5F9]">قواعد احتساب ضريبة كسب العمل (القانون 30 لسنة 2023)</h3>
              <span className="text-[10px] bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-full font-bold">
                تحديثات 2024 سارية
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 dark:bg-[#273449] p-4 rounded-xl border border-slate-200 dark:border-[#334155]">
                <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">حد الإعفاء الشخصي السنوي للموظف (ج.م)</label>
                <input
                  type="number"
                  value={localSettings.incomeTax.personalExemptionAnnual}
                  onChange={(e) => handleTaxChange('personalExemptionAnnual', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#334155] font-black text-orange-700 bg-white dark:bg-[#1E293B] dark:text-white"
                />
                <p className="text-[10px] text-slate-400 dark:text-[#94A3B8] mt-1">يخصم من إجمالي الدخل السنوي قبل تطبيق الشرائح الضريبية.</p>
              </div>

              <div className="bg-slate-50 dark:bg-[#273449] p-4 rounded-xl border border-slate-200 dark:border-[#334155]">
                <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">نسبة صندوق تكريم الشهداء (%)</label>
                <input
                  type="number"
                  step="0.005"
                  value={localSettings.incomeTax.martyrsFundPercent}
                  onChange={(e) => handleTaxChange('martyrsFundPercent', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#334155] font-bold bg-white dark:bg-[#1E293B] dark:text-white"
                />
                <p className="text-[10px] text-slate-400 dark:text-[#94A3B8] mt-1">تستقطع بنسبة 5 في العشرة آلاف (0.05%) من إجمالي الأجر.</p>
              </div>
            </div>

            {/* جدول الشرائح */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-[#CBD5E1]">الشرائح الضريبية التصاعدية السنوية:</h4>
                <button
                  onClick={addBracket}
                  className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-bold rounded-lg transition"
                >
                  + إضافة شريحة
                </button>
              </div>
              <div className="border border-slate-200 dark:border-[#334155] rounded-xl overflow-hidden text-xs">
                <table className="w-full text-right">
                  <thead className="bg-slate-100 dark:bg-[#273449] font-bold text-slate-700 dark:text-[#CBD5E1]">
                    <tr>
                      <th className="p-2.5">الشريحة</th>
                      <th className="p-2.5">الحد الأقصى للشريحة (ج.م)</th>
                      <th className="p-2.5">نسبة الضريبة (%)</th>
                      <th className="p-2.5 w-16">حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#334155]">
                    {localSettings.incomeTax.taxBrackets.map((b, i) => (
                      <tr key={i} className={b.maxLimit === Infinity ? 'bg-amber-50/50 dark:bg-amber-950/30' : ''}>
                        <td className="p-2.5 font-bold">الشريحة {i + 1}</td>
                        <td className="p-2.5">
                          {b.maxLimit === Infinity ? (
                            <span className="font-bold text-amber-700 dark:text-[#FBBF24] bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded">ما زاد عن ذلك</span>
                          ) : (
                            <input
                              type="number"
                              value={b.maxLimit}
                              onChange={(e) => handleBracketChange(i, 'maxLimit', e.target.value)}
                              className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-[#334155] font-mono text-xs bg-white dark:bg-[#1E293B] dark:text-white"
                            />
                          )}
                        </td>
                        <td className="p-2.5">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max="100"
                              value={b.rate * 100}
                              onChange={(e) => handleBracketChange(i, 'rate', Number(e.target.value) / 100)}
                              className="w-20 p-1.5 rounded-lg border border-slate-200 dark:border-[#334155] font-bold text-rose-600 bg-white dark:bg-[#1E293B] dark:text-white text-center"
                            />
                            <span className="text-slate-400 font-bold">%</span>
                          </div>
                        </td>
                        <td className="p-2.5 text-center">
                          {localSettings.incomeTax.taxBrackets.length > 2 && (
                            <button
                              onClick={() => removeBracket(i)}
                              className="p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="حذف الشريحة"
                            >
                              ✕
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. التأمينات الاجتماعية */}
        {activeTab === 'insurance' && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-800 dark:text-[#F1F5F9] border-b border-slate-100 dark:border-[#334155] pb-2">
              التأمينات والمعاشات (وفق قانون 148 لسنة 2019)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 dark:bg-[#273449] p-4 rounded-xl border border-slate-200 dark:border-[#334155]">
                <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">نسبة حصة العامل (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={localSettings.socialInsurance.employeeSharePercent}
                  onChange={(e) => handleInsuranceChange('employeeSharePercent', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#334155] font-black text-rose-700 bg-white dark:bg-[#1E293B] dark:text-white"
                />
                <p className="text-[10px] text-slate-400 dark:text-[#94A3B8] mt-1">تستقطع من أجر الموظف التأميني (افتراضي 11%).</p>
              </div>

              <div className="bg-slate-50 dark:bg-[#273449] p-4 rounded-xl border border-slate-200 dark:border-[#334155]">
                <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">نسبة حصة صاحب العمل / المنشأة (%)</label>
                <input
                  type="number"
                  step="0.05"
                  value={localSettings.socialInsurance.employerSharePercent}
                  onChange={(e) => handleInsuranceChange('employerSharePercent', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#334155] font-black text-blue-700 bg-white dark:bg-[#1E293B] dark:text-white"
                />
                <p className="text-[10px] text-slate-400 dark:text-[#94A3B8] mt-1">تتحملها الشركة وتورد لمكتب التأمينات (افتراضي 18.75%).</p>
              </div>

              <div className="bg-slate-50 dark:bg-[#273449] p-4 rounded-xl border border-slate-200 dark:border-[#334155]">
                <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">الحد الأدنى لأجر الاشتراك التأميني (ج.م)</label>
                <input
                  type="number"
                  value={localSettings.socialInsurance.minInsuredSalary}
                  onChange={(e) => handleInsuranceChange('minInsuredSalary', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#334155] font-bold bg-white dark:bg-[#1E293B] dark:text-white"
                />
                <p className="text-[10px] text-slate-400 dark:text-[#94A3B8] mt-1">لا يجوز التأمين بأقل من هذا الحد.</p>
              </div>

              <div className="bg-slate-50 dark:bg-[#273449] p-4 rounded-xl border border-slate-200 dark:border-[#334155]">
                <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">الحد الأقصى لأجر الاشتراك التأميني (ج.م)</label>
                <input
                  type="number"
                  value={localSettings.socialInsurance.maxInsuredSalary}
                  onChange={(e) => handleInsuranceChange('maxInsuredSalary', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#334155] font-bold bg-white dark:bg-[#1E293B] dark:text-white"
                />
                <p className="text-[10px] text-slate-400 dark:text-[#94A3B8] mt-1">الحد الأقصى لحساب التأمين شهرياً.</p>
              </div>
            </div>
          </div>
        )}

        {/* 4. لوائح وساعات العمل والإضافي */}
        {activeTab === 'work' && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-800 dark:text-[#F1F5F9] border-b border-slate-100 dark:border-[#334155] pb-2">
              لوائح ساعات العمل والعمل الإضافي (قانون العمل 12 لسنة 2003 مادة 85)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-50 dark:bg-[#273449] p-4 rounded-xl border border-slate-200 dark:border-[#334155]">
                <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">ساعات العمل اليومية الرسمية</label>
                <input
                  type="number"
                  value={localSettings.workRules.standardHoursPerDay}
                  onChange={(e) => handleWorkRulesChange('direct', 'standardHoursPerDay', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#334155] font-bold bg-white dark:bg-[#1E293B] dark:text-white"
                />
                <p className="text-[10px] text-slate-400 dark:text-[#94A3B8] mt-1">افتراضي 8 ساعات يومياً.</p>
              </div>

              <div className="bg-slate-50 dark:bg-[#273449] p-4 rounded-xl border border-slate-200 dark:border-[#334155]">
                <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">أيام حساب اليومية (القسمة الشهرية)</label>
                <input
                  type="number"
                  value={localSettings.workRules.standardDaysPerMonth}
                  onChange={(e) => handleWorkRulesChange('direct', 'standardDaysPerMonth', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#334155] font-bold bg-white dark:bg-[#1E293B] dark:text-white"
                />
                <p className="text-[10px] text-slate-400 dark:text-[#94A3B8] mt-1">افتراضي 30 يوم لقسمة اليومية وسعر الساعة.</p>
              </div>

              <div className="bg-slate-50 dark:bg-[#273449] p-4 rounded-xl border border-slate-200 dark:border-[#334155]">
                <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">نسبة الإضافي النهاري (%)</label>
                <input
                  type="number"
                  value={localSettings.workRules.overtimeRates.daytimePercent}
                  onChange={(e) => handleWorkRulesChange('overtimeRates', 'daytimePercent', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#334155] font-bold bg-white dark:bg-[#1E293B] dark:text-white text-orange-700"
                />
                <p className="text-[10px] text-slate-400 dark:text-[#94A3B8] mt-1">مادة 85: أجر المثل + 35% نهاراً.</p>
              </div>

              <div className="bg-slate-50 dark:bg-[#273449] p-4 rounded-xl border border-slate-200 dark:border-[#334155]">
                <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">نسبة الإضافي الليلي (%)</label>
                <input
                  type="number"
                  value={localSettings.workRules.overtimeRates.nighttimePercent}
                  onChange={(e) => handleWorkRulesChange('overtimeRates', 'nighttimePercent', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#334155] font-bold bg-white dark:bg-[#1E293B] dark:text-white text-orange-700"
                />
                <p className="text-[10px] text-slate-400 dark:text-[#94A3B8] mt-1">مادة 85: أجر المثل + 70% ليلاً.</p>
              </div>

              <div className="bg-slate-50 dark:bg-[#273449] p-4 rounded-xl border border-slate-200 dark:border-[#334155]">
                <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">نسبة العمل في العطلات والراحات (%)</label>
                <input
                  type="number"
                  value={localSettings.workRules.overtimeRates.holidayPercent}
                  onChange={(e) => handleWorkRulesChange('overtimeRates', 'holidayPercent', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#334155] font-bold bg-white dark:bg-[#1E293B] dark:text-white text-orange-700"
                />
                <p className="text-[10px] text-slate-400 dark:text-[#94A3B8] mt-1">مثل الأجر كاملاً (إجمالي 200%).</p>
              </div>
            </div>
          </div>
        )}

        {/* 5. إدارة ونسخ البيانات */}
        {activeTab === 'backup' && (
          <div className="space-y-4">
            {/* ─── مساحة التخزين ─── */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-2xl text-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-orange-400" />
                  <h3 className="text-sm font-black">مساحة التخزين</h3>
                </div>
                <span className="text-[10px] bg-white/10 px-2.5 py-0.5 rounded-full font-bold">
                  {storageInfo.usedMB} MB / {storageInfo.totalMB} MB
                </span>
              </div>

              {/* شريط التقدم */}
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    storageInfo.percent > 80 ? 'bg-red-500' : storageInfo.percent > 50 ? 'bg-amber-400' : 'bg-orange-500'
                  }`}
                  style={{ width: storageInfo.percent + '%' }}
                />
              </div>

              {/* تفاصيل إضافية */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="bg-white/5 rounded-lg px-3 py-2">
                  <div className="text-[10px] text-slate-200 mb-0.5">المستخدم</div>
                  <div className="text-xs font-bold">{storageInfo.usageMB} MB</div>
                </div>
                <div className="bg-white/5 rounded-lg px-3 py-2">
                  <div className="text-[10px] text-slate-200 mb-0.5">الحد الأقصى</div>
                  <div className="text-xs font-bold">{storageInfo.totalMB} MB</div>
                </div>
                <div className="bg-white/5 rounded-lg px-3 py-2">
                  <div className="text-[10px] text-slate-200 mb-0.5">المساحة المتبقية</div>
                  <div className="text-xs font-bold text-emerald-400">
                    {storageInfo.percent > 0 ? (((storageInfo.quotaBytes - storageInfo.usageBytes) / (1024 * 1024)).toFixed(2)) : 'غير محدد'} MB
                  </div>
                </div>
              </div>

              <div className="mt-2 text-[10px] text-slate-300 leading-relaxed">
                يتم تخزين البيانات في قاعدة بيانات IndexedDB المحلية، والتي توفر مساحة أكبر بكثير من التخزين التقليدي (من مئات الميغابايت حتى عدة جيجابايت حسب المتصفح).
              </div>

              {storageInfo.percent > 80 && (
                <div className="mt-3 flex items-center gap-2 text-[11px] text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-lg">
                  <span className="text-amber-400 font-bold">تنبيه:</span>
                  المساحة المتبقية أقل من 20%. يُنصح بتصدير نسخة احتياطية.
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-2">
              <h3 className="text-sm font-black text-slate-800 dark:text-[#F1F5F9] flex items-center gap-2">
                <Database className="w-4 h-4 text-orange-600 dark:text-[#FB923C]" />
                <span>إدارة ونسخ البيانات (Backup & Import)</span>
              </h3>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-bold">
                {employees.length} موظف • {effects.length} مؤثر
              </span>
            </div>

            {backupSuccess && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-[#FB923C] text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                {backupSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-[#273449] p-4 rounded-xl border border-slate-200 dark:border-[#334155]">
                <div className="flex items-center gap-2 mb-2">
                  <Download className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-sm text-slate-800 dark:text-[#F1F5F9]">تصدير نسخة احتياطية كاملة</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-[#CBD5E1] mb-3">
                  تصدير جميع البيانات (الموظفون، المؤثرات، الإعدادات، كلمات المرور) في ملف JSON آمن.
                </p>
                <button
                  onClick={() => {
                    exportFullBackup(employees, effects, settings, localStorage.getItem('egy_hr_adminPassword') || 'admin123');
                    setBackupSuccess('تم تصدير النسخة الاحتياطية بنجاح!');
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl transition"
                >
                  <Download className="w-4 h-4 inline-block ml-1" />
                  تصدير النسخة الاحتياطية (JSON)
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-[#273449] p-4 rounded-xl border border-slate-200 dark:border-[#334155]">
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="w-4 h-4 text-orange-600 dark:text-[#FB923C]" />
                  <span className="font-bold text-sm text-slate-800 dark:text-[#F1F5F9]">استعادة نسخة احتياطية</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-[#CBD5E1] mb-3">
                  تحميل ملف JSON احتياطي لاستعادة جميع بيانات النظام بنفس الحالة السابقة.
                </p>
                <input
                  ref={importFileRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    importFullBackup(file, (data) => {
                      restoreFullBackup(data);
                      setBackupSuccess('تم استعادة النسخة الاحتياطية بنجاح!');
                    }).catch(err => setBackupSuccess('خطأ: ' + err.message));
                    e.target.value = '';
                  }}
                />
                <button
                  onClick={() => importFileRef.current?.click()}
                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-black text-xs rounded-xl transition"
                >
                  <Upload className="w-4 h-4 inline-block ml-1" />
                  استعادة النسخة الاحتياطية
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-[#273449] p-4 rounded-xl border border-slate-200 dark:border-[#334155]">
                <div className="flex items-center gap-2 mb-2">
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  <span className="font-bold text-sm text-slate-800 dark:text-[#F1F5F9]">تصدير الموظفين إلى Excel</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-[#CBD5E1] mb-3">
                  تصدير سجل الموظفين الكامل بجميع بياناتهم إلى ملف Excel.
                </p>
                <button
                  onClick={() => exportEmployeesToExcel(employees)}
                  className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white font-black text-xs rounded-xl transition"
                >
                  <FileSpreadsheet className="w-4 h-4 inline-block ml-1" />
                  تصدير الموظفين (XLSX)
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-[#273449] p-4 rounded-xl border border-slate-200 dark:border-[#334155]">
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="w-4 h-4 text-amber-600 dark:text-[#FBBF24]" />
                  <span className="font-bold text-sm text-slate-800 dark:text-[#F1F5F9]">استيراد الموظفين من Excel</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-[#CBD5E1] mb-3">
                  تحميل قالب Excel جاهز أو استيراد ملف بالموظفين وإضافتهم تلقائياً.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadEmployeeTemplate()}
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-white font-black text-xs rounded-xl transition"
                  >
                    تحميل القالب
                  </button>
                  <input
                    ref={excelImportRef}
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      importEmployeesFromExcel(file).then((newEmployees) => {
                        newEmployees.forEach(emp => addEmployee(emp));
                        setBackupSuccess(`تم استيراد ${newEmployees.length} موظف بنجاح!`);
                      }).catch(err => setBackupSuccess('خطأ: ' + err.message));
                      e.target.value = '';
                    }}
                  />
                  <button
                    onClick={() => excelImportRef.current?.click()}
                    className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-black text-xs rounded-xl transition"
                  >
                    استيراد ملف
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-950 p-4 rounded-xl border border-red-200 dark:border-red-900 text-xs">
              <div className="flex items-center gap-2 font-bold text-red-700 dark:text-red-400 mb-2">
                <RefreshCw className="w-4 h-4" />
                ضبط المصنع واستعادة البيانات التجريبية
              </div>
              <p className="text-[11px] text-red-600 dark:text-red-400 mb-3">
                إعادة ضبط المصنع يمسح جميع البيانات الفعلية ليصبح النظام فارغاً 100% وجاهزاً للعمل الحي.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    if (window.confirm('تحذير! سيتم مسح جميع الموظفين والمؤثرات والإعدادات نهائياً.\nهل أنت متأكد؟')) {
                      factoryReset();
                      setBackupSuccess('تم تصفير المصنع. النظام جاهز للعمل الحي.');
                    }
                  }}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl transition"
                >
                  ضبط المصنع والتصفير الكامل
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('هل تريد استعادة البيانات التجريبية التوضيحية؟')) {
                      loadDemoData();
                      setBackupSuccess('تم استعادة البيانات التجريبية');
                    }
                  }}
                  className="px-4 py-2.5 bg-slate-200 dark:bg-[#334155] hover:bg-slate-300 dark:hover:bg-[#334155] text-slate-700 dark:text-[#CBD5E1] font-black text-xs rounded-xl transition"
                >
                  استعادة البيانات التجريبية
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. الأمان وكلمات المرور */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-2">
              <h3 className="text-sm font-black text-slate-800 dark:text-[#F1F5F9] flex items-center gap-2">
                <Lock className="w-4 h-4 text-orange-600 dark:text-[#FB923C]" />
                <span>حماية والأمان وكلمات المرور</span>
              </h3>
              <span className="text-[10px] bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-full font-bold">
                قفل المستخدمين مفعّل
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-[#273449] p-4 rounded-xl border border-slate-200 dark:border-[#334155] text-xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-[#F1F5F9] text-sm">
                <KeyRound className="w-4 h-4 text-orange-600 dark:text-[#FB923C]" />
                تغيير كلمة مرور المدير (Admin)
              </div>

              {adminMsg && (
                <div className={
                  'flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold ' +
                  (adminMsg.includes('نجاح')
                    ? 'bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-[#FB923C]'
                    : 'bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-[#F87171]')
                }>
                  {adminMsg}
                </div>
              )}

              <form onSubmit={(e) => {
                e.preventDefault();
                if (!verifyAdminPassword(adminOldPass)) {
                  setAdminMsg('كلمة المرور الحالية غير صحيحة');
                  return;
                }
                if (adminNewPass.length < 6) {
                  setAdminMsg('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل');
                  return;
                }
                if (adminNewPass !== adminConfirmPass) {
                  setAdminMsg('كلمتا المرور غير متطابقتين');
                  return;
                }
                updateAdminPassword(adminNewPass);
                setAdminMsg('تم تغيير كلمة مرور المدير بنجاح!');
                setAdminOldPass(''); setAdminNewPass(''); setAdminConfirmPass('');
              }} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">كلمة المرور الحالية</label>
                  <div className="relative">
                    <input
                      type={showOldPass ? 'text' : 'password'}
                      value={adminOldPass}
                      onChange={(e) => { setAdminOldPass(e.target.value); setAdminMsg(''); }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#334155] font-mono bg-white dark:bg-[#1E293B] dark:text-white pl-9"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowOldPass(!showOldPass)} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#94A3B8] hover:text-slate-600 dark:hover:text-[#CBD5E1]">
                      {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">كلمة المرور الجديدة</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={adminNewPass}
                      onChange={(e) => { setAdminNewPass(e.target.value); setAdminMsg(''); }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#334155] font-mono bg-white dark:bg-[#1E293B] dark:text-white pl-9"
                      placeholder="جديدة (6+ أحرف)"
                    />
                    <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#94A3B8] hover:text-slate-600 dark:hover:text-[#CBD5E1]">
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">تأكيد كلمة المرور</label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      value={adminConfirmPass}
                      onChange={(e) => { setAdminConfirmPass(e.target.value); setAdminMsg(''); }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#334155] font-mono bg-white dark:bg-[#1E293B] dark:text-white pl-9"
                      placeholder="تأكيد"
                    />
                    <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#94A3B8] hover:text-slate-600 dark:hover:text-[#CBD5E1]">
                      {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-black text-xs rounded-xl shadow-md shadow-orange-600/20 transition"
                  >
                    تحديث كلمة مرور المدير
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-slate-50 dark:bg-[#273449] p-4 rounded-xl border border-slate-200 dark:border-[#334155] text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-[#F1F5F9] text-sm">
                <ShieldCheck className="w-4 h-4 text-orange-600 dark:text-[#FB923C]" />
                معلومات الأمان
              </div>
              <div className="space-y-1.5 text-slate-600 dark:text-[#CBD5E1]">
                <p className="flex justify-between py-0.5">
                  <span className="text-slate-500 dark:text-[#CBD5E1]">كلمة مرور المدير الافتراضية:</span>
                  <code className="bg-slate-100 dark:bg-[#334155] px-2 py-0.5 rounded font-mono font-bold dark:text-white">admin123</code>
                </p>
                <p className="flex justify-between py-0.5">
                  <span className="text-slate-500 dark:text-[#CBD5E1]">كلمة مرور الموظف الافتراضية:</span>
                  <code className="bg-slate-100 dark:bg-[#334155] px-2 py-0.5 rounded font-mono font-bold dark:text-white">1234</code>
                </p>
                <p className="flex justify-between py-0.5">
                  <span className="text-slate-500 dark:text-[#CBD5E1]">عدد الموظفين المسجلين:</span>
                  <span className="font-bold text-slate-800 dark:text-[#F1F5F9]">{employees.length}</span>
                </p>
                <p className="flex justify-between py-0.5">
                  <span className="text-slate-500 dark:text-[#CBD5E1]">عدد الطلبات والمؤثرات:</span>
                  <span className="font-bold text-slate-800 dark:text-[#F1F5F9]">{effects.length}</span>
                </p>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-[#94A3B8] mt-2">
                يمكن لكل موظف تغيير كلمة المرور الخاصة به من ملفه الشخصي بعد التحقق من كلمة المرور الحالية.
              </p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}