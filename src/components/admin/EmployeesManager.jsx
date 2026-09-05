import React, { useState, useRef } from 'react';
import { useHR } from '../../context/HRContext';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  KeyRound,
  RefreshCw,
  Phone, 
  Mail, 
  Building, 
  CreditCard,
  ShieldCheck,
  Calendar,
  Camera,
  Image,
  X,
  CheckSquare,
  Square
} from 'lucide-react';
import BulkActionsBar from '../common/BulkActionsBar';
import { exportEmployeeRosterToExcel } from '../../utils/excelExporter';

export default function EmployeesManager() {
  const { employees, addEmployee, updateEmployee, deleteEmployee, updateEmployeePassword } = useHR();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [resetMsg, setResetMsg] = useState('');
  const [photoPreviewModal, setPhotoPreviewModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const modalFileRef = useRef(null);

  const initialForm = {
    name: '',
    nationalId: '',
    insuranceNumber: '',
    jobTitle: '',
    department: 'تكنولوجيا المعلومات',
    joinDate: new Date().toISOString().split('T')[0],
    birthDate: '1995-01-01',
    phone: '',
    email: '',
    basicSalary: 6000,
    variableSalary: 1500,
    allowances: 1000,
    bankAccount: '',
    gender: 'male',
    role: 'employee',
    password: '1234',
    annualLeaveBalance: 21,
    casualLeaveBalance: 6,
    photo: null
  };

  const [formData, setFormData] = useState(initialForm);

  const filtered = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.nationalId && emp.nationalId.includes(searchQuery))
  );

  const selectedItems = filtered.filter(e => selectedIds.has(e.id));

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

  const handleModalPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const dataUrl = await resizeImage(file);
    setFormData(prev => ({ ...prev, photo: dataUrl }));
    e.target.value = '';
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(e => e.id)));
    }
  };

  const handleBulkDelete = () => {
    if (!window.confirm(`هل أنت متأكد من حذف ${selectedIds.size} موظف؟`)) return;
    selectedIds.forEach(id => deleteEmployee(id));
    setSelectedIds(new Set());
  };

  const handleOpenAdd = () => {
    setEditingEmp(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  const handleResetAllPasswords = () => {
    if (!window.confirm('هل أنت متأكد من إعادة تعيين كلمة مرور جميع الموظفين إلى "1234"؟')) return;
    employees.forEach(emp => {
      updateEmployeePassword(emp.id, '1234');
    });
    setResetMsg('تم إعادة تعيين كلمة مرور جميع الموظفين إلى 1234');
    setTimeout(() => setResetMsg(''), 3000);
  };

  const handleResetEmployeePassword = (empId, empName) => {
    if (!window.confirm(`هل أنت متأكد من إعادة تعيين كلمة مرور "${empName}" إلى "1234"؟`)) return;
    updateEmployeePassword(empId, '1234');
    setResetMsg(`تم إعادة تعيين كلمة مرور "${empName}" إلى 1234`);
    setTimeout(() => setResetMsg(''), 3000);
  };

  const handleOpenEdit = (emp) => {
    setEditingEmp(emp);
    setFormData({ ...emp });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingEmp) {
      updateEmployee(editingEmp.id, {
        ...formData,
        basicSalary: Number(formData.basicSalary),
        variableSalary: Number(formData.variableSalary),
        allowances: Number(formData.allowances),
        annualLeaveBalance: Number(formData.annualLeaveBalance),
        casualLeaveBalance: Number(formData.casualLeaveBalance)
      });
    } else {
      addEmployee({
        ...formData,
        basicSalary: Number(formData.basicSalary),
        variableSalary: Number(formData.variableSalary),
        allowances: Number(formData.allowances),
        annualLeaveBalance: Number(formData.annualLeaveBalance),
        casualLeaveBalance: Number(formData.casualLeaveBalance)
      });
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      
      {/* الرأس */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm">

        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-black text-slate-800 dark:text-[#F1F5F9]">سجل وملفات الموظفين</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">
            إدارة بيانات الموظفين، أجورهم الأساسية والمتغيرة، وأرصدة الإجازات والتأمينات
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetAllPasswords}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-md shadow-amber-500/20"
          >
            <KeyRound className="w-4 h-4" />
            <span>إعادة تعيين كل كلمات المرور</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-black shadow-md shadow-orange-600/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة موظف جديد</span>
          </button>
        </div>
      </div>

      {/* رسالة نجاح إعادة التعيين */}
      {resetMsg && (
        <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          {resetMsg}
        </div>
      )}

      {/* شريط البحث */}
      <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 dark:text-[#94A3B8] absolute right-3 top-3" />
          <input
            type="text"
            placeholder="بحث بالاسم أو الوظيفة أو الرقم القومي..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9] text-xs font-medium focus:ring-1 focus:ring-orange-500 outline-none"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-[#94A3B8] font-bold">
          إجمالي الموظفين: <span className="text-orange-600 font-black">{employees.length}</span>
        </div>
      </div>

      {/* بطاقات الموظفين */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-[#334155] shadow-sm p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-orange-50 dark:bg-orange-950 flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-orange-400" />
          </div>
          <h3 className="text-lg font-black text-slate-800 dark:text-[#F1F5F9] mb-2">
            {searchQuery ? 'لا توجد نتائج بحث' : 'لم تتم إضافة أي موظف بعد'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-[#94A3B8] mb-6 max-w-sm mx-auto">
            {searchQuery
              ? 'جرّب تغيير كلمات البحث أو مسح شريط البحث لعرض جميع الموظفين'
              : 'ابدأ بإضافة أول موظف في النظام لحساب الرواتب وإدارة المؤثرات'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-black shadow-md shadow-orange-600/20 transition"
            >
              <UserPlus className="w-5 h-5" />
              <span>إضافة أول موظف</span>
            </button>
          )}
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(emp => (
          <div key={emp.id} className={'bg-white dark:bg-[#1E293B] rounded-2xl border p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between ' + (selectedIds.has(emp.id) ? 'border-orange-400 dark:border-orange-600 ring-1 ring-orange-200 dark:ring-orange-800' : 'border-slate-200 dark:border-[#334155]')}>
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleSelect(emp.id)} className="mt-1 hover:scale-110 transition shrink-0">
                      {selectedIds.has(emp.id)
                        ? <CheckSquare className="w-5 h-5 text-orange-500" />
                        : <Square className="w-5 h-5 text-slate-300 dark:text-[#94A3B8]" />}
                    </button>
                    {emp.photo ? (
                      <img src={emp.photo} alt={emp.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-800 font-black text-lg flex items-center justify-center shrink-0">
                        {emp.name.charAt(0)}
                      </div>
                    )}
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-[#F1F5F9] text-sm leading-snug">{emp.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-[#94A3B8]">{emp.jobTitle}</p>
                    <span className="text-[10px] bg-slate-100 dark:bg-[#273449] text-slate-600 dark:text-[#CBD5E1] px-2 py-0.5 rounded font-mono font-bold mt-1 inline-block">
                      {emp.id}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(emp)}
                    className="p-1.5 text-slate-500 dark:text-[#94A3B8] hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950 rounded-lg transition"
                    title="تعديل الموظف"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleResetEmployeePassword(emp.id, emp.name)}
                    className="p-1.5 text-slate-500 dark:text-[#94A3B8] hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950 rounded-lg transition"
                    title="إعادة تعيين كلمة المرور إلى 1234"
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
                        deleteEmployee(emp.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 dark:text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-[#CBD5E1] bg-slate-50/70 dark:bg-slate-800/70 p-3 rounded-xl border border-slate-100 dark:border-[#334155]">
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-[#94A3B8]">القسم:</span>
                  <span className="font-bold text-slate-800 dark:text-[#F1F5F9]">{emp.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-[#94A3B8]">الرقم القومي:</span>
                  <span className="font-mono text-slate-800 dark:text-[#F1F5F9]">{emp.nationalId || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-[#94A3B8]">الرقم التأميني:</span>
                  <span className="font-mono text-slate-800 dark:text-[#F1F5F9]">{emp.insuranceNumber || '---'}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200/60 dark:border-slate-700 pt-1 mt-1">
                  <span className="text-slate-400 dark:text-[#94A3B8]">الراتب الأساسي:</span>
                  <span className="font-black text-orange-700">{emp.basicSalary.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-[#94A3B8]">المتغير والبدلات:</span>
                  <span className="font-bold text-slate-700 dark:text-[#CBD5E1]">{(emp.variableSalary + (emp.allowances || 0)).toLocaleString('ar-EG')} ج.م</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 text-center">
                <div className="bg-orange-50 dark:bg-orange-950 text-orange-800 dark:text-orange-200 p-2 rounded-xl text-[11px] font-bold">
                  رصيد اعتيادي: <span className="font-black text-xs">{emp.annualLeaveBalance || 21}</span> يوم
                </div>
                <div className="bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 p-2 rounded-xl text-[11px] font-bold">
                  رصيد عارضة: <span className="font-black text-xs">{emp.casualLeaveBalance || 6}</span> يوم
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-[#94A3B8] mt-3 pt-2 border-t border-slate-100 dark:border-[#334155]">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {emp.phone || 'بدون هاتف'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                تعيين: {emp.joinDate || '---'}
              </span>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* نافذة إضافة أو تعديل موظف */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 dark:border-[#334155] my-8">
            <h3 className="text-base font-black text-slate-800 dark:text-[#F1F5F9] mb-1">
              {editingEmp ? ('تعديل بيانات الموظف: ' + editingEmp.name) : 'إضافة موظف جديد للنظام'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] mb-4">
              تسجيل البيانات الشخصية والتعاقدية والتأمينية وفق المعايير المصرية
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">اسم الموظف رباعياً</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9]"
                    placeholder="مثال: أحمد محمد علي حسن"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">الرقم القومي (14 رقم)</label>
                  <input
                    type="text"
                    maxLength="14"
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9] font-mono"
                    placeholder="29003150102345"
                  />
                </div>
              </div>

              {/* صورة الموظف */}
              <div className="p-4 bg-slate-50 dark:bg-[#273449] rounded-xl border border-slate-200 dark:border-[#334155]">
                <p className="font-bold text-slate-700 dark:text-[#CBD5E1] text-xs mb-3">صورة الموظف</p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <button type="button" onClick={() => formData.photo && setPhotoPreviewModal(true)}
                    className={'w-28 h-28 rounded-2xl bg-white dark:bg-[#1E293B] border-2 border-dashed border-slate-300 dark:border-[#475569] flex items-center justify-center overflow-hidden shrink-0 shadow-sm transition-all duration-200 ' + (formData.photo ? 'cursor-pointer hover:ring-2 hover:ring-orange-400 hover:shadow-md hover:scale-105' : '')}>
                    {formData.photo ? (
                      <img src={formData.photo} alt="معاينة" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Camera className="w-8 h-8 text-slate-300 dark:text-[#94A3B8] mx-auto mb-1" />
                        <span className="text-[10px] text-slate-400 dark:text-[#94A3B8] font-bold">لا توجد صورة</span>
                      </div>
                    )}
                  </button>
                  <div className="flex-1 text-center sm:text-right">
                    <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] mb-2">صورة شخصية واضحة بخلفية بيضاء — تُستخدم في التقارير وبطاقة الهوية</p>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <input ref={modalFileRef} type="file" accept="image/*" onChange={handleModalPhotoUpload} className="hidden" />
                      <button type="button" onClick={() => modalFileRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg transition shadow-sm">
                        <Image className="w-3.5 h-3.5" /> رفع صورة
                      </button>
                      <button type="button" onClick={async () => {
                        try {
                          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } } });
                          const video = document.createElement('video');
                          video.srcObject = stream;
                          video.autoplay = true;
                          video.playsInline = true;
                          const modal = document.createElement('div');
                          modal.className = 'fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm';
                          modal.innerHTML = '<div class="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl text-center"><p class="text-sm font-black text-slate-800 mb-4">التقاط صورة الموظف</p><div class="relative rounded-2xl overflow-hidden bg-slate-900 aspect-square max-h-72 mx-auto mb-4"></div><div class="flex items-center gap-2 justify-center"><button id="cap-btn" class="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg> التقاط</button><button id="cancel-btn" class="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition">إلغاء</button></div></div>';
                          document.body.appendChild(modal);
                          modal.querySelector('div.relative').appendChild(video);
                          document.getElementById('cancel-btn').onclick = () => { stream.getTracks().forEach(t => t.stop()); modal.remove(); };
                          document.getElementById('cap-btn').onclick = () => {
                            const canvas = document.createElement('canvas');
                            const size = Math.min(video.videoWidth, video.videoHeight);
                            canvas.width = 400; canvas.height = 400;
                            canvas.getContext('2d').drawImage(video, (video.videoWidth - size) / 2, (video.videoHeight - size) / 2, size, size, 0, 0, 400, 400);
                            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                            setFormData(prev => ({ ...prev, photo: dataUrl }));
                            stream.getTracks().forEach(t => t.stop());
                            modal.remove();
                          };
                        } catch { alert('لا يمكن الوصول إلى الكاميرا. تأكد من منح الصلاحية.'); }
                      }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-[#CBD5E1] text-xs font-bold rounded-lg transition">
                        <Camera className="w-3.5 h-3.5" /> كاميرا مباشرة
                      </button>
                      {formData.photo && (
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, photo: null }))}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg transition">
                          <X className="w-3.5 h-3.5" /> حذف الصورة
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">المسمى الوظيفي</label>
                  <input
                    type="text"
                    required
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9]"
                    placeholder="مثال: محاسب تكاليف"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">القسم / الإدارة</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9]"
                    placeholder="مثال: الحسابات"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">الرقم التأميني</label>
                  <input
                    type="text"
                    value={formData.insuranceNumber}
                    onChange={(e) => setFormData({ ...formData, insuranceNumber: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9] font-mono"
                    placeholder="54829103"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-[#273449] p-3 rounded-xl border border-slate-200 dark:border-[#334155]">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">الراتب الأساسي (ج.م)</label>
                  <input
                    type="number"
                    required
                    value={formData.basicSalary}
                    onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] font-bold text-orange-700 bg-white dark:bg-[#1E293B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">الراتب المتغير (ج.م)</label>
                  <input
                    type="number"
                    value={formData.variableSalary}
                    onChange={(e) => setFormData({ ...formData, variableSalary: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">البدلات الثابتة (انتقال/وجبة)</label>
                  <input
                    type="number"
                    value={formData.allowances}
                    onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">رقم الحساب البنكي / IBAN</label>
                  <input
                    type="text"
                    value={formData.bankAccount}
                    onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9] font-mono"
                    placeholder="EG38000200..."
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">تاريخ التعيين</label>
                  <input
                    type="date"
                    value={formData.joinDate}
                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9]"
                    placeholder="01012345678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">رصيد الإجازات السنوية (يوم)</label>
                  <input
                    type="number"
                    value={formData.annualLeaveBalance}
                    onChange={(e) => setFormData({ ...formData, annualLeaveBalance: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">رصيد الإجازات العارضة (يوم)</label>
                  <input
                    type="number"
                    value={formData.casualLeaveBalance}
                    onChange={(e) => setFormData({ ...formData, casualLeaveBalance: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-900 dark:text-[#F1F5F9]"
                  />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-[#273449] p-3 rounded-xl border border-slate-200 dark:border-[#334155]">
                <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-orange-600" />
                  كلمة المرور / PIN الخاص بالموظف (للدخول إلى حسابه)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password || ''}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-slate-900 dark:text-[#F1F5F9] font-mono pl-9"
                      placeholder="1234"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#94A3B8] hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz0123456789';
                      let pass = '';
                      for (let i = 0; i < 8; i++) pass += chars[Math.floor(Math.random() * chars.length)];
                      setFormData({ ...formData, password: pass });
                    }}
                    className="flex items-center gap-1 px-3 py-2 bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900 border border-orange-200 dark:border-orange-800 rounded-xl text-[11px] font-bold transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    توليد
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#334155]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#273449] rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black text-white bg-orange-600 hover:bg-orange-500 rounded-xl shadow-md shadow-orange-600/30"
                >
                  {editingEmp ? 'حفظ التعديلات' : 'تسجيل الموظف'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* نافذة معاينة الصورة */}
      {photoPreviewModal && formData.photo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 dark:bg-black/80 backdrop-blur-sm" onClick={() => setPhotoPreviewModal(false)}>
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl max-w-lg w-full p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-800 dark:text-[#F1F5F9]">معايرة صورة — {formData.name}</h3>
              <button onClick={() => setPhotoPreviewModal(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-[#273449] rounded-lg transition">
                <X className="w-4 h-4 text-slate-500 dark:text-[#94A3B8]" />
              </button>
            </div>
            <div className="flex justify-center mb-4">
              <img src={formData.photo} alt={formData.name}
                className="w-72 h-72 rounded-2xl object-cover border-4 border-slate-100 dark:border-[#334155] shadow-xl" />
            </div>
            <div className="flex items-center gap-2">
              <input ref={modalFileRef} type="file" accept="image/*" onChange={handleModalPhotoUpload} className="hidden" />
              <button type="button" onClick={() => modalFileRef.current?.click()}
                className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm">
                <Image className="w-4 h-4" /> تغيير الصورة
              </button>
              <button type="button" onClick={() => { setFormData(prev => ({ ...prev, photo: null })); setPhotoPreviewModal(false); }}
                className="py-2.5 px-4 bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-600 dark:text-[#F87171] rounded-xl text-xs font-bold transition flex items-center gap-1.5">
                <Trash2 className="w-4 h-4" /> حذف
              </button>
            </div>
          </div>
        </div>
      )}

      <BulkActionsBar
        selectedCount={selectedIds.size}
        totalCount={filtered.length}
        selectLabel="موظف"
        onToggleAll={toggleSelectAll}
        onDeselectAll={() => setSelectedIds(new Set())}
        onExportExcel={() => exportEmployeeRosterToExcel(selectedItems, settings.company.name)}
        onDelete={handleBulkDelete}
      />

    </div>
  );
}