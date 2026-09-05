import React, { useState, useRef } from 'react';
import { useHR } from '../../context/HRContext';
import {
  UserCog, Search, Save, KeyRound, RefreshCw, Eye, EyeOff,
  PlusCircle, Trash2, CheckCircle2, XCircle, Clock, Calendar,
  DollarSign, FileText, Briefcase, Phone, Mail, CreditCard,
  ShieldCheck, CalendarCheck, Award, Wallet, AlertTriangle,
  Camera, Image, X
} from 'lucide-react';

export default function EmployeeMasterFile({ onSelectPayslip }) {
  const {
    employees, effects, settings, activePeriod,
    updateEmployee, updateEmployeePassword, addEffect, updateEffectStatus, deleteEffect,
    calculatePayrollForPeriod
  } = useHR();

  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [activeSection, setActiveSection] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [effectModal, setEffectModal] = useState(false);
  const [effectForm, setEffectForm] = useState({
    type: 'bonus',
    typeLabel: 'مكافأة مالية',
    amount: '',
    units: 1,
    unitType: 'أيام',
    reason: '',
    startDate: '',
    endDate: '',
    destination: '',
    overtimeCategory: 'day',
    leaveType: 'annual'
  });
  const [saveMsg, setSaveMsg] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const fileInputRef = useRef(null);
  const cameraVideoRef = useRef(null);

  const emp = employees.find(e => e.id === selectedEmpId);
  const empEffects = effects.filter(e => e.employeeId === selectedEmpId);
  const empPending = empEffects.filter(e => e.status === 'pending');
  const empApproved = empEffects.filter(e => e.status === 'approved');
  const payrollData = calculatePayrollForPeriod(activePeriod);
  const empPayroll = payrollData.find(p => p.employeeId === selectedEmpId);

  const handleSelectEmp = (id) => {
    setSelectedEmpId(id);
    const found = employees.find(e => e.id === id);
    if (found) {
      setFormData({ ...found });
      setEditMode(false);
    }
  };

  const resizeImage = (file, maxSize = 400) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height;
          if (w > h) { if (w > maxSize) { h = (h * maxSize) / w; w = maxSize; } }
          else { if (h > maxSize) { w = (w * maxSize) / h; h = maxSize; } }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const dataUrl = await resizeImage(file);
    setFormData(prev => ({ ...prev, photo: dataUrl }));
    updateEmployee(selectedEmpId, { photo: dataUrl });
    setSaveMsg('تم رفع الصورة بنجاح');
    setTimeout(() => setSaveMsg(''), 3000);
    e.target.value = '';
  };

  const handleRemovePhoto = () => {
    if (!window.confirm('هل أنت متأكد من حذف صورة الموظف؟')) return;
    setFormData(prev => ({ ...prev, photo: null }));
    updateEmployee(selectedEmpId, { photo: null });
    setSaveMsg('تم حذف الصورة');
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } } });
      setCameraStream(stream);
      setShowPhotoModal(true);
      setTimeout(() => { if (cameraVideoRef.current) cameraVideoRef.current.srcObject = stream; }, 100);
    } catch {
      alert('لا يمكن الوصول إلى الكاميرا. تأكد من منح الصلاحية.');
    }
  };

  const capturePhoto = () => {
    const video = cameraVideoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, 400, 400);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setFormData(prev => ({ ...prev, photo: dataUrl }));
    updateEmployee(selectedEmpId, { photo: dataUrl });
    stopCamera();
    setSaveMsg('تم التقاط الصورة بنجاح');
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
    setShowPhotoModal(false);
  };

  const handleSaveProfile = () => {
    updateEmployee(selectedEmpId, {
      ...formData,
      basicSalary: Number(formData.basicSalary),
      variableSalary: Number(formData.variableSalary),
      allowances: Number(formData.allowances),
      annualLeaveBalance: Number(formData.annualLeaveBalance),
      casualLeaveBalance: Number(formData.casualLeaveBalance)
    });
    setEditMode(false);
    setSaveMsg('تم حفظ التعديلات بنجاح');
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const handleResetPassword = () => {
    if (!window.confirm('هل أنت متأكد من إعادة تعيين كلمة المرور إلى "1234"؟')) return;
    updateEmployeePassword(selectedEmpId, '1234');
    setNewPassword('1234');
    setSaveMsg('تم إعادة تعيين كلمة المرور');
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const handleSaveNewPassword = () => {
    if (!newPassword.trim()) return;
    updateEmployeePassword(selectedEmpId, newPassword);
    setSaveMsg('تم تحديث كلمة المرور');
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const handleAddEffect = (e) => {
    e.preventDefault();
    if (!selectedEmpId) return;

    let label = effectForm.typeLabel;
    if (effectForm.type === 'bonus') label = 'مكافأة مالية';
    else if (effectForm.type === 'penalty') label = 'جزاء إداري';
    else if (effectForm.type === 'absence') label = 'غياب بدون إذن';
    else if (effectForm.type === 'deduction') label = 'استقطاع مالي';
    else if (effectForm.type === 'leave') label = effectForm.leaveType === 'casual' ? 'إجازة عارضة' : 'إجازة اعتيادية';
    else if (effectForm.type === 'overtime') label = 'ساعات عمل إضافية';
    else if (effectForm.type === 'mission') label = 'مأمورية عمل خارجية';

    addEffect({
      employeeId: selectedEmpId,
      type: effectForm.type,
      typeLabel: label,
      amount: effectForm.amount ? Number(effectForm.amount) : 0,
      units: effectForm.units ? Number(effectForm.units) : 0,
      unitType: effectForm.unitType,
      reason: effectForm.reason,
      startDate: effectForm.startDate || undefined,
      endDate: effectForm.endDate || undefined,
      destination: effectForm.destination || undefined,
      overtimeCategory: effectForm.type === 'overtime' ? effectForm.overtimeCategory : undefined,
      leaveType: effectForm.type === 'leave' ? effectForm.leaveType : undefined
    });

    setEffectModal(false);
    setEffectForm({
      type: 'bonus', typeLabel: 'مكافأة مالية', amount: '', units: 1, unitType: 'أيام',
      reason: '', startDate: '', endDate: '', destination: '', overtimeCategory: 'day', leaveType: 'annual'
    });
    setSaveMsg('تم إضافة المؤثر بنجاح');
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const sections = [
    { id: 'profile', label: 'البيانات الشخصية', icon: UserCog },
    { id: 'salary', label: 'الراتب والمكافآت', icon: DollarSign },
    { id: 'effects', label: 'المؤثرات والسجل', icon: FileText },
    { id: 'payslip', label: 'مفردات الراتب', icon: CreditCard },
  ];

  if (!emp) {
    return (
      <div className="space-y-6 pb-20 md:pb-6">
        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <UserCog className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-black text-slate-800 dark:text-[#F1F5F9]">ملف الموظف الشامل</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mb-4">
            إدارة شاملة لبيانات كل موظف: البيانات الشخصية، الراتب، المؤثرات، ومفردات المرتب — كل شيء في مكان واحد
          </p>

          {employees.length === 0 ? (
            <div className="p-12 text-center text-slate-400 dark:text-[#94A3B8]">
              <UserCog className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-[#94A3B8]" />
              <p className="text-sm font-bold">لا يوجد موظفون مسجلون بعد</p>
              <p className="text-xs mt-1">أضف موظفين أولاً من قسم "سجل الموظفين"</p>
            </div>
          ) : (
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 dark:text-[#94A3B8] absolute right-3 top-3" />
              <select
                value={selectedEmpId}
                onChange={(e) => handleSelectEmp(e.target.value)}
                className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9] text-sm font-medium focus:ring-1 focus:ring-orange-500 outline-none appearance-none"
              >
                <option value="">— اختر موظفاً لعرض ملفه الشامل —</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} — {emp.jobTitle} ({emp.id})</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* رأس الملف */}
      <div className="bg-gradient-to-r from-slate-900 via-orange-950 to-slate-900 text-white p-5 rounded-2xl shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <button onClick={() => { if (emp.photo) setShowPhotoModal(true); }}
              className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-md border-2 border-white/20 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:ring-2 hover:ring-orange-400 hover:scale-105 transition-all duration-200 shadow-lg">
              {(formData.photo || emp.photo) ? (
                <img src={formData.photo || emp.photo} alt={emp.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-black text-orange-300">{emp.name.charAt(0)}</span>
              )}
            </button>
            <div>
              <h2 className="text-lg font-black">{emp.name}</h2>
              <p className="text-xs text-slate-300">{emp.jobTitle} • {emp.department}</p>
              <div className="flex items-center gap-3 text-[11px] text-slate-300 mt-1">
                <span>كود: <b className="text-white">{emp.id}</b></span>
                <span>رقم تأميني: <b className="text-white">{emp.insuranceNumber || '---'}</b></span>
              </div>
            </div>
          </div>

          <select
            value={selectedEmpId}
            onChange={(e) => handleSelectEmp(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl bg-white/10 border border-white/20 text-white font-medium outline-none"
          >
            <option value="" className="text-slate-900">تبديل موظف...</option>
            {employees.map(e => (
              <option key={e.id} value={e.id} className="text-slate-900">{e.name} ({e.id})</option>
            ))}
          </select>
        </div>
      </div>

      {/* رسالة النجاح */}
      {saveMsg && (
        <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {saveMsg}
        </div>
      )}

      {/* تنقل الأقسام */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {sections.map(sec => {
          const Icon = sec.icon;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ' + (
                activeSection === sec.id
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-white dark:bg-[#1E293B] text-slate-600 dark:text-[#CBD5E1] border border-slate-200 dark:border-[#334155] hover:bg-slate-50 dark:hover:bg-[#273449]'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {sec.label}
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* قسم البيانات الشخصية */}
      {/* ═══════════════════════════════════════════ */}
      {activeSection === 'profile' && (
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-800 dark:text-[#F1F5F9] flex items-center gap-2">
              <UserCog className="w-4 h-4 text-orange-600" />
              البيانات الشخصية والوظيفية
            </h3>
            <div className="flex items-center gap-2">
              {editMode ? (
                <>
                  <button onClick={() => setEditMode(false)} className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#273449] rounded-lg">إلغاء</button>
                  <button onClick={handleSaveProfile} className="flex items-center gap-1.5 px-4 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg shadow-sm">
                    <Save className="w-3.5 h-3.5" /> حفظ التعديلات
                  </button>
                </>
              ) : (
                <button onClick={() => setEditMode(true)} className="px-4 py-1.5 bg-slate-100 dark:bg-[#273449] hover:bg-slate-200 dark:hover:bg-[#334155] text-slate-700 dark:text-[#CBD5E1] text-xs font-bold rounded-lg">تعديل البيانات</button>
              )}
            </div>
          </div>

          {/* قسم الصورة */}
          <div className="flex flex-col sm:flex-row items-center gap-5 mb-6 p-5 bg-slate-50 dark:bg-[#273449] rounded-2xl border border-slate-100 dark:border-[#334155]">
            <div className="relative group">
              <button onClick={() => setShowPhotoModal(true)}
                className="w-36 h-36 rounded-2xl bg-white dark:bg-[#1E293B] border-2 border-dashed border-slate-300 dark:border-[#475569] flex items-center justify-center overflow-hidden hover:border-orange-400 hover:shadow-lg transition-all cursor-pointer">
                {(formData.photo || emp.photo) ? (
                  <img src={formData.photo || emp.photo} alt={emp.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Camera className="w-10 h-10 text-slate-300 dark:text-[#94A3B8] mx-auto mb-1.5" />
                    <span className="text-xs text-slate-400 dark:text-[#94A3B8] font-bold">إضافة صورة</span>
                  </div>
                )}
              </button>
            </div>
            <div className="flex-1 text-center sm:text-right">
              <p className="text-sm font-black text-slate-800 dark:text-[#F1F5F9] mb-1">صورة الموظف</p>
              <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] mb-3">
                صورة شخصية واضحة تُستخدم في التقارير وبطاقة الهوية — يُفضل صورة بخلفية بيضاء بحجم 300×300 بكسل
              </p>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg shadow-sm transition">
                  <Image className="w-3.5 h-3.5" /> رفع صورة
                </button>
                <button onClick={startCamera}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-[#CBD5E1] text-xs font-bold rounded-lg transition">
                  <Camera className="w-3.5 h-3.5" /> كاميرا مباشرة
                </button>
                {(formData.photo || emp.photo) && (
                  <button onClick={handleRemovePhoto}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-600 dark:text-[#F87171] text-xs font-bold rounded-lg transition">
                    <Trash2 className="w-3.5 h-3.5" /> حذف الصورة
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* الاسم */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">الاسم رباعياً</label>
              <input disabled={!editMode} value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})}
                className={'w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F1F5F9] ' + (!editMode ? 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-[#CBD5E1]' : 'bg-white dark:bg-slate-800')} />
            </div>
            {/* الرقم القومي */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">الرقم القومي</label>
              <input disabled={!editMode} value={formData.nationalId || ''} onChange={e => setFormData({...formData, nationalId: e.target.value})}
                className={'w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F1F5F9] font-mono ' + (!editMode ? 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-[#CBD5E1]' : 'bg-white dark:bg-slate-800')} />
            </div>
            {/* الرقم التأميني */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">الرقم التأميني</label>
              <input disabled={!editMode} value={formData.insuranceNumber || ''} onChange={e => setFormData({...formData, insuranceNumber: e.target.value})}
                className={'w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F1F5F9] font-mono ' + (!editMode ? 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-[#CBD5E1]' : 'bg-white dark:bg-slate-800')} />
            </div>
            {/* المسمى الوظيفي */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">المسمى الوظيفي</label>
              <input disabled={!editMode} value={formData.jobTitle || ''} onChange={e => setFormData({...formData, jobTitle: e.target.value})}
                className={'w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F1F5F9] ' + (!editMode ? 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-[#CBD5E1]' : 'bg-white dark:bg-slate-800')} />
            </div>
            {/* القسم */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">القسم / الإدارة</label>
              <input disabled={!editMode} value={formData.department || ''} onChange={e => setFormData({...formData, department: e.target.value})}
                className={'w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F1F5F9] ' + (!editMode ? 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-[#CBD5E1]' : 'bg-white dark:bg-slate-800')} />
            </div>
            {/* الهاتف */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">رقم الهاتف</label>
              <input disabled={!editMode} value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})}
                className={'w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F1F5F9] ' + (!editMode ? 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-[#CBD5E1]' : 'bg-white dark:bg-slate-800')} />
            </div>
            {/* البريد */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">البريد الإلكتروني</label>
              <input disabled={!editMode} value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})}
                className={'w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F1F5F9] ' + (!editMode ? 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-[#CBD5E1]' : 'bg-white dark:bg-slate-800')} />
            </div>
            {/* تاريخ التعيين */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">تاريخ التعيين</label>
              <input disabled={!editMode} type="date" value={formData.joinDate || ''} onChange={e => setFormData({...formData, joinDate: e.target.value})}
                className={'w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F1F5F9] ' + (!editMode ? 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-[#CBD5E1]' : 'bg-white dark:bg-slate-800')} />
            </div>
            {/* تاريخ الميلاد */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">تاريخ الميلاد</label>
              <input disabled={!editMode} type="date" value={formData.birthDate || ''} onChange={e => setFormData({...formData, birthDate: e.target.value})}
                className={'w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F1F5F9] ' + (!editMode ? 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-[#CBD5E1]' : 'bg-white dark:bg-slate-800')} />
            </div>
            {/* الجنس */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">الجنس</label>
              <select disabled={!editMode} value={formData.gender || 'male'} onChange={e => setFormData({...formData, gender: e.target.value})}
                className={'w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] ' + (!editMode ? 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-[#CBD5E1]' : 'bg-white dark:bg-slate-800 dark:text-slate-100')}>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>
            {/* الدور */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">نوع الحساب</label>
              <select disabled={!editMode} value={formData.role || 'employee'} onChange={e => setFormData({...formData, role: e.target.value})}
                className={'w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F1F5F9] ' + (!editMode ? 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-[#CBD5E1]' : 'bg-white dark:bg-slate-800')}>
                <option value="employee">موظف</option>
                <option value="admin">مدير نظام</option>
              </select>
            </div>
            {/* رقم الحساب البنكي */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">رقم الحساب البنكي / IBAN</label>
              <input disabled={!editMode} value={formData.bankAccount || ''} onChange={e => setFormData({...formData, bankAccount: e.target.value})}
                className={'w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F1F5F9] font-mono ' + (!editMode ? 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-[#CBD5E1]' : 'bg-white dark:bg-slate-800')} />
            </div>
          </div>

          {/* كلمة المرور */}
          <div className="mt-6 p-4 bg-slate-50 dark:bg-[#273449] rounded-xl border border-slate-200 dark:border-[#334155]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-[#CBD5E1]">
                <KeyRound className="w-4 h-4 text-orange-600" />
                كلمة المرور
              </div>
              <button onClick={handleResetPassword} className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold rounded-lg">
                <RefreshCw className="w-3 h-3" /> إعادة تعيين إلى 1234
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-slate-900 dark:text-[#F1F5F9] font-mono pl-9 text-sm"
                  placeholder="كلمة المرور الحالية أو الجديدة"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#94A3B8] hover:text-slate-600 dark:hover:text-slate-300">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button onClick={handleSaveNewPassword} className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl">تحديث</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* قسم الراتب والمكافآت */}
      {/* ═══════════════════════════════════════════ */}
      {activeSection === 'salary' && (
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-800 dark:text-[#F1F5F9] flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-orange-600" />
              تفاصيل الراتب والبدلات
            </h3>
            {editMode ? (
              <div className="flex items-center gap-2">
                <button onClick={() => setEditMode(false)} className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#273449] rounded-lg">إلغاء</button>
                <button onClick={handleSaveProfile} className="flex items-center gap-1.5 px-4 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg shadow-sm">
                  <Save className="w-3.5 h-3.5" /> حفظ
                </button>
              </div>
            ) : (
              <button onClick={() => setEditMode(true)} className="px-4 py-1.5 bg-slate-100 dark:bg-[#273449] hover:bg-slate-200 dark:hover:bg-[#334155] text-slate-700 dark:text-[#CBD5E1] text-xs font-bold rounded-lg">تعديل</button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-xl border border-orange-100 dark:border-orange-800">
              <label className="block text-[11px] font-bold text-orange-700 dark:text-orange-300 mb-1">الراتب الأساسي (ج.م)</label>
              <input disabled={!editMode} type="number" value={formData.basicSalary || 0} onChange={e => setFormData({...formData, basicSalary: e.target.value})}
                className={'w-full p-2 rounded-lg border text-lg font-black text-orange-800 dark:text-orange-200 ' + (!editMode ? 'bg-orange-100/50 dark:bg-orange-900/50 border-orange-200 dark:border-orange-700' : 'bg-white dark:bg-[#1E293B] border-orange-300 dark:border-orange-600')} />
            </div>
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
              <label className="block text-[11px] font-bold text-blue-700 dark:text-blue-300 mb-1">الراتب المتغير (ج.م)</label>
              <input disabled={!editMode} type="number" value={formData.variableSalary || 0} onChange={e => setFormData({...formData, variableSalary: e.target.value})}
                className={'w-full p-2 rounded-lg border text-lg font-black text-blue-800 dark:text-blue-200 ' + (!editMode ? 'bg-blue-100/50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-700' : 'bg-white dark:bg-[#1E293B] border-blue-300 dark:border-blue-600')} />
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
              <label className="block text-[11px] font-bold text-emerald-700 dark:text-emerald-300 mb-1">البدلات الثابتة (ج.م)</label>
              <input disabled={!editMode} type="number" value={formData.allowances || 0} onChange={e => setFormData({...formData, allowances: e.target.value})}
                className={'w-full p-2 rounded-lg border text-lg font-black text-emerald-800 dark:text-emerald-200 ' + (!editMode ? 'bg-emerald-100/50 dark:bg-emerald-900/50 border-emerald-200 dark:border-emerald-700' : 'bg-white dark:bg-[#1E293B] border-emerald-300 dark:border-emerald-600')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-[#273449] p-4 rounded-xl border border-slate-200 dark:border-[#334155]">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-[#CBD5E1] mb-1">رصيد الإجازات السنوية (يوم)</label>
              <input disabled={!editMode} type="number" value={formData.annualLeaveBalance || 21} onChange={e => setFormData({...formData, annualLeaveBalance: e.target.value})}
                className={'w-full p-2 rounded-lg border font-bold text-slate-800 dark:text-[#F1F5F9] ' + (!editMode ? 'bg-white dark:bg-[#1E293B]' : 'bg-white dark:bg-[#1E293B] border-orange-300 dark:border-orange-600')} />
            </div>
            <div className="bg-slate-50 dark:bg-[#273449] p-4 rounded-xl border border-slate-200 dark:border-[#334155]">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-[#CBD5E1] mb-1">رصيد الإجازات العارضة (يوم)</label>
              <input disabled={!editMode} type="number" value={formData.casualLeaveBalance || 6} onChange={e => setFormData({...formData, casualLeaveBalance: e.target.value})}
                className={'w-full p-2 rounded-lg border font-bold text-slate-800 dark:text-[#F1F5F9] ' + (!editMode ? 'bg-white dark:bg-[#1E293B]' : 'bg-white dark:bg-[#1E293B] border-orange-300 dark:border-orange-600')} />
            </div>
          </div>

          {empPayroll && (
            <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-slate-50 dark:from-orange-950 dark:to-slate-800 rounded-xl border border-orange-100 dark:border-orange-800">
              <h4 className="text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-2">ملخص راتب الشهر الحالي ({activePeriod})</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-[#94A3B8]">إجمالي الأجر:</span>
                  <div className="font-black text-slate-800 dark:text-[#F1F5F9]">{empPayroll.totalEntitlements.toLocaleString('ar-EG')} ج.م</div>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-[#94A3B8]">تأمينات العامل:</span>
                  <div className="font-bold text-rose-600">-{empPayroll.socialInsuranceEmployee.toLocaleString('ar-EG')} ج.م</div>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-[#94A3B8]">ضريبة الدخل:</span>
                  <div className="font-bold text-rose-600">-{empPayroll.incomeTax.toLocaleString('ar-EG')} ج.م</div>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-[#94A3B8]">صافي الراتب:</span>
                  <div className="font-black text-orange-700 text-sm">{empPayroll.netSalary.toLocaleString('ar-EG')} ج.م</div>
                </div>
              </div>
              <button onClick={() => onSelectPayslip && onSelectPayslip(empPayroll)} className="mt-3 text-[11px] text-orange-600 font-bold hover:underline">
                عرض القسيمة التفصيلية ←
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* قسم المؤثرات والسجل */}
      {/* ═══════════════════════════════════════════ */}
      {activeSection === 'effects' && (
        <div className="space-y-4">
          {/* زر إضافة مؤثر */}
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-[#F1F5F9] flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-600" />
                سجل المؤثرات ({empEffects.length})
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] mt-0.5">
                {empPending.length} قيد الانتظار • {empApproved.length} معتمد
              </p>
            </div>
            <button
              onClick={() => setEffectModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              إضافة مؤثر مباشر
            </button>
          </div>

          {/* قائمة المؤثرات */}
          {empEffects.length === 0 ? (
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm p-12 text-center text-slate-400 dark:text-[#94A3B8]">
              <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-[#94A3B8]" />
              <p className="text-sm font-bold">لا توجد مؤثرات مسجلة لهذا الموظف</p>
            </div>
          ) : (
            <div className="space-y-2">
              {empEffects.map(eff => (
                <div key={eff.id} className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm p-4 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={'p-2 rounded-xl text-[10px] font-black shrink-0 ' + (
                      eff.type === 'leave' ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' :
                      eff.type === 'overtime' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                      eff.type === 'mission' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                      eff.type === 'loan' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                      eff.type === 'bonus' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    )}>
                      {eff.typeLabel}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-[#F1F5F9]">{eff.reason || 'بدون تفاصيل'}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-[#94A3B8] mt-1">
                        <span>{eff.requestDate}</span>
                        {eff.units > 0 && <span className="font-bold">{eff.units} {eff.unitType}</span>}
                        {eff.amount > 0 && <span className="text-orange-700 font-bold">{eff.amount.toLocaleString('ar-EG')} ج.م</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={'px-2.5 py-1 rounded-full text-[10px] font-bold ' + (
                      eff.status === 'approved' ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' :
                      eff.status === 'rejected' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    )}>
                      {eff.status === 'approved' ? 'معتمد' : eff.status === 'rejected' ? 'مرفوض' : 'قيد الانتظار'}
                    </span>
                    {eff.status === 'pending' && (
                      <>
                        <button onClick={() => updateEffectStatus(eff.id, 'approved', 'تم الاعتماد من الملف الشامل')}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => updateEffectStatus(eff.id, 'rejected', 'مرفوض من الملف الشامل')}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button onClick={() => { if (window.confirm('حذف هذا المؤثر؟')) deleteEffect(eff.id); }}
                      className="p-1.5 text-slate-400 dark:text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* نافذة إضافة مؤثر */}
          {effectModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm overflow-y-auto">
              <div className="bg-white dark:bg-[#1E293B] rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-100 dark:border-[#334155] my-8">
                <h3 className="text-base font-black text-slate-800 dark:text-[#F1F5F9] mb-1">إضافة مؤثر مباشر للموظف: {emp.name}</h3>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8] mb-4">اختر نوع المؤثر وأدخل البيانات — سيتم اعتماده تلقائياً</p>

                <form onSubmit={handleAddEffect} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">نوع المؤثر</label>
                      <select value={effectForm.type} onChange={e => setEffectForm({...effectForm, type: e.target.value})}
                        className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9] font-medium">
                        <option value="bonus">مكافأة مالية</option>
                        <option value="penalty">جزاء إداري</option>
                        <option value="absence">غياب بدون إذن</option>
                        <option value="deduction">استقطاع مالي</option>
                        <option value="leave">إجازة</option>
                        <option value="overtime">ساعات إضافية</option>
                        <option value="mission">مأمورية عمل</option>
                        <option value="loan">سلفة مالية</option>
                      </select>
                    </div>
                    {effectForm.type === 'leave' && (
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">نوع الإجازة</label>
                        <select value={effectForm.leaveType} onChange={e => setEffectForm({...effectForm, leaveType: e.target.value})}
                          className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9] font-medium">
                          <option value="annual">سنوية (عتيادية)</option>
                          <option value="casual">عارضة</option>
                        </select>
                      </div>
                    )}
                    {effectForm.type === 'overtime' && (
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">نوع الإضافي</label>
                        <select value={effectForm.overtimeCategory} onChange={e => setEffectForm({...effectForm, overtimeCategory: e.target.value})}
                          className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9] font-medium">
                          <option value="day">نهاري (35%)</option>
                          <option value="night">ليلي (70%)</option>
                          <option value="holiday">عطلة رسمية (100%)</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {(effectForm.type === 'bonus' || effectForm.type === 'deduction' || effectForm.type === 'loan') && (
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">المبلغ (ج.م)</label>
                      <input type="number" value={effectForm.amount} onChange={e => setEffectForm({...effectForm, amount: e.target.value})}
                        className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9] font-bold" required />
                    </div>
                  )}

                  {(effectForm.type === 'penalty' || effectForm.type === 'absence' || effectForm.type === 'overtime' || effectForm.type === 'leave') && (
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">عدد</label>
                        <input type="number" min="0.25" step="0.25" value={effectForm.units} onChange={e => setEffectForm({...effectForm, units: e.target.value})}
                          className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9]" required />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">الوحدة</label>
                        <select value={effectForm.unitType} onChange={e => setEffectForm({...effectForm, unitType: e.target.value})}
                          className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9]">
                          <option value="أيام">أيام</option>
                          <option value="ساعات">ساعات</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {(effectForm.type === 'leave' || effectForm.type === 'mission') && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">من تاريخ</label>
                        <input type="date" value={effectForm.startDate} onChange={e => setEffectForm({...effectForm, startDate: e.target.value})}
                          className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9]" />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">إلى تاريخ</label>
                        <input type="date" value={effectForm.endDate} onChange={e => setEffectForm({...effectForm, endDate: e.target.value})}
                          className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9]" />
                      </div>
                    </div>
                  )}

                  {effectForm.type === 'mission' && (
                    <>
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">الوجهة / الجهة</label>
                        <input value={effectForm.destination} onChange={e => setEffectForm({...effectForm, destination: e.target.value})}
                          className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9]" placeholder="مثال: الإسكندرية - برج العرب" />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">المبلغ (بدل الانتقال) ج.م</label>
                        <input type="number" value={effectForm.amount} onChange={e => setEffectForm({...effectForm, amount: e.target.value})}
                          className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9] font-bold" />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">السبب / التفاصيل</label>
                    <textarea rows="2" value={effectForm.reason} onChange={e => setEffectForm({...effectForm, reason: e.target.value})}
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9]" placeholder="اكتب سبب المؤثر..." required></textarea>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#334155]">
                    <button type="button" onClick={() => setEffectModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#273449] rounded-xl">إلغاء</button>
                    <button type="submit" className="px-5 py-2 text-xs font-black text-white bg-orange-600 hover:bg-orange-500 rounded-xl shadow-md shadow-orange-600/30">
                      حفظ واعتماد المؤثر
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* قسم مفردات الراتب */}
      {/* ═══════════════════════════════════════════ */}
      {activeSection === 'payslip' && (
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm p-5">
          <h3 className="text-sm font-black text-slate-800 dark:text-[#F1F5F9] flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-orange-600" />
            مفردات راتب شهر {activePeriod}
          </h3>

          {!empPayroll ? (
            <div className="p-12 text-center text-slate-400 dark:text-[#94A3B8]">
              <CreditCard className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-[#94A3B8]" />
              <p className="text-sm font-bold">لا توجد بيانات راتب لهذا الشهر</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* الاستحقاقات */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950 rounded-xl border border-emerald-100 dark:border-emerald-800">
                <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-200 mb-3 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5" /> الاستحقاقات
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between"><span className="text-slate-600 dark:text-[#CBD5E1]">الراتب الأساسي</span><span className="font-bold">{empPayroll.basicSalary.toLocaleString('ar-EG')} ج.م</span></div>
                  <div className="flex justify-between"><span className="text-slate-600 dark:text-[#CBD5E1]">الراتب المتغير</span><span className="font-bold">{empPayroll.variableSalary.toLocaleString('ar-EG')} ج.م</span></div>
                  <div className="flex justify-between"><span className="text-slate-600 dark:text-[#CBD5E1]">عمل إضافي</span><span className="font-bold text-orange-700 dark:text-[#FB923C]">+{empPayroll.overtimePay.toLocaleString('ar-EG')} ج.م</span></div>
                  <div className="flex justify-between"><span className="text-slate-600 dark:text-[#CBD5E1]">مكافآت</span><span className="font-bold text-orange-700 dark:text-[#FB923C]">+{empPayroll.bonuses.toLocaleString('ar-EG')} ج.م</span></div>
                  <div className="flex justify-between"><span className="text-slate-600 dark:text-[#CBD5E1]">مأموريات</span><span className="font-bold text-orange-700 dark:text-[#FB923C]">+{empPayroll.missionAllowances.toLocaleString('ar-EG')} ج.م</span></div>
                  <div className="flex justify-between border-t border-emerald-200 dark:border-emerald-800 pt-1"><span className="font-black text-emerald-900 dark:text-emerald-100">إجمالي الأجر</span><span className="font-black text-emerald-900 dark:text-emerald-100">{empPayroll.totalEntitlements.toLocaleString('ar-EG')} ج.م</span></div>
                </div>
              </div>

              {/* الخصومات */}
              <div className="p-4 bg-rose-50 dark:bg-rose-950 rounded-xl border border-rose-100 dark:border-rose-800">
                <h4 className="text-xs font-bold text-rose-800 dark:text-rose-200 mb-3 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> الخصومات
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between"><span className="text-slate-600 dark:text-[#CBD5E1]">تأمينات اجتماعية (11%)</span><span className="font-bold text-rose-600 dark:text-[#F87171]">-{empPayroll.socialInsuranceEmployee.toLocaleString('ar-EG')} ج.م</span></div>
                  <div className="flex justify-between"><span className="text-slate-600 dark:text-[#CBD5E1]">ضريبة كسب العمل</span><span className="font-bold text-rose-600 dark:text-[#F87171]">-{empPayroll.incomeTax.toLocaleString('ar-EG')} ج.م</span></div>
                  <div className="flex justify-between"><span className="text-slate-600 dark:text-[#CBD5E1]">خصم غياب</span><span className="font-bold text-rose-600 dark:text-[#F87171]">-{empPayroll.absenceDeduction.toLocaleString('ar-EG')} ج.م</span></div>
                  <div className="flex justify-between"><span className="text-slate-600 dark:text-[#CBD5E1]">جزاءات إدارية</span><span className="font-bold text-rose-600 dark:text-[#F87171]">-{empPayroll.penaltyDeduction.toLocaleString('ar-EG')} ج.م</span></div>
                  <div className="flex justify-between"><span className="text-slate-600 dark:text-[#CBD5E1]">سلف وقروض</span><span className="font-bold text-rose-600 dark:text-[#F87171]">-{empPayroll.loansAndAdvances.toLocaleString('ar-EG')} ج.م</span></div>
                  <div className="flex justify-between"><span className="text-slate-600 dark:text-[#CBD5E1]">أخرى</span><span className="font-bold text-rose-600 dark:text-[#F87171]">-{empPayroll.otherDeductions.toLocaleString('ar-EG')} ج.م</span></div>
                  <div className="flex justify-between border-t border-rose-200 dark:border-rose-800 pt-1"><span className="font-black text-rose-900 dark:text-rose-100">إجمالي الخصومات</span><span className="font-black text-rose-900 dark:text-rose-100">-{empPayroll.totalDeductions.toLocaleString('ar-EG')} ج.م</span></div>
                </div>
              </div>

              {/* الصافي */}
              <div className="p-5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl text-white text-center">
                <div className="text-xs font-bold text-orange-100">صافي الراتب المستحق للصرف</div>
                <div className="text-3xl font-black mt-1">{empPayroll.netSalary.toLocaleString('ar-EG')} <span className="text-lg">ج.م</span></div>
                <div className="text-[10px] text-orange-200 mt-1">تكلفة المنشأة الإجمالية: {empPayroll.companyTotalCost.toLocaleString('ar-EG')} ج.م</div>
              </div>

              <button onClick={() => onSelectPayslip && onSelectPayslip(empPayroll)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition">
                عرض وطباعة القسيمة التفصيلية
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* نافذة صورة الموظف — معايرة وكاميرا */}
      {/* ═══════════════════════════════════════════ */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 dark:bg-black/80 backdrop-blur-sm" onClick={stopCamera}>
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl max-w-lg w-full p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-800 dark:text-[#F1F5F9] flex items-center gap-2">
                <Camera className="w-4 h-4 text-orange-600" />
                صورة الموظف — {emp.name}
              </h3>
              <button onClick={stopCamera} className="p-1.5 hover:bg-slate-100 dark:hover:bg-[#273449] rounded-lg transition">
                <X className="w-4 h-4 text-slate-500 dark:text-[#94A3B8]" />
              </button>
            </div>

            {cameraStream ? (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-square max-h-96 mx-auto">
                  <video ref={cameraVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border-2 border-dashed border-white/30 rounded-2xl m-10 pointer-events-none" />
                </div>
                <button onClick={capturePhoto}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-black shadow-md transition flex items-center justify-center gap-2">
                  <Camera className="w-5 h-5" /> التقاط الصورة
                </button>
              </div>
            ) : (formData.photo || emp.photo) ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img src={formData.photo || emp.photo} alt={emp.name}
                    className="w-64 h-64 rounded-2xl object-cover border-4 border-slate-100 dark:border-[#334155] shadow-xl" />
                </div>
                <div className="flex items-center gap-2">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5">
                    <Image className="w-4 h-4" /> تغيير الصورة
                  </button>
                  <button onClick={startCamera}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-[#CBD5E1] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5">
                    <Camera className="w-4 h-4" /> التقاط بالكاميرا
                  </button>
                  <button onClick={handleRemovePhoto}
                    className="py-2.5 px-3 bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-600 dark:text-[#F87171] rounded-xl text-xs font-bold transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-64 h-64 rounded-2xl bg-slate-100 dark:bg-[#273449] border-2 border-dashed border-slate-300 dark:border-[#475569] flex flex-col items-center justify-center">
                    <Camera className="w-16 h-16 text-slate-300 dark:text-[#94A3B8] mb-2" />
                    <span className="text-sm text-slate-400 dark:text-[#94A3B8] font-bold">لا توجد صورة</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5">
                    <Image className="w-4 h-4" /> رفع صورة من الجهاز
                  </button>
                  <button onClick={startCamera}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-[#CBD5E1] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5">
                    <Camera className="w-4 h-4" /> التقاط بالكاميرا
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
