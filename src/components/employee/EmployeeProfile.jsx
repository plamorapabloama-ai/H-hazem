import React, { useState } from 'react';
import { useHR } from '../../context/HRContext';
import { User, Phone, Mail, Calendar, ShieldCheck, Building2, CreditCard, Award, KeyRound, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function EmployeeProfile() {
  const { currentUser, employees, updateEmployeePassword, verifyEmployeePassword } = useHR();
  const emp = employees.find(e => e.id === currentUser.employeeId) || employees[0];

  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passMsg, setPassMsg] = useState('');
  const [passMsgType, setPassMsgType] = useState('');

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!emp) return;
    if (!verifyEmployeePassword(emp.id, oldPass)) {
      setPassMsg('كلمة المرور الحالية غير صحيحة');
      setPassMsgType('error');
      return;
    }
    if (newPass.length < 4) {
      setPassMsg('كلمة المرور الجديدة يجب أن تكون 4 أحرف على الأقل');
      setPassMsgType('error');
      return;
    }
    if (newPass !== confirmPass) {
      setPassMsg('كلمتا المرور الجديدة غير متطابقتين');
      setPassMsgType('error');
      return;
    }
    updateEmployeePassword(emp.id, newPass);
    setPassMsg('تم تغيير كلمة المرور بنجاح!');
    setPassMsgType('success');
    setOldPass(''); setNewPass(''); setConfirmPass('');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      
      {/* رأس الملف الشخصي */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-5 dark:bg-[#1E293B] dark:border-[#334155]">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-orange-600 to-orange-500 text-white font-black text-3xl flex items-center justify-center shadow-lg shadow-orange-500/30">
          {emp?.name ? emp.name.charAt(0) : 'م'}
        </div>

        <div className="text-center sm:text-right space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-[#F1F5F9]">{emp?.name}</h2>
            <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full">
              كود: {emp?.id}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#CBD5E1]">{emp?.jobTitle} • {emp?.department}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-600 pt-1 dark:text-[#CBD5E1]">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-[#94A3B8]" />
              {emp?.phone || '01012345678'}
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-[#94A3B8]" />
              {emp?.email || 'employee@company.eg'}
            </span>
          </div>
        </div>
      </div>

      {/* تفاصيل العقد والأجور الرسمية */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* بيانات التعاقد والتأمينات */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs dark:bg-[#1E293B] dark:border-[#334155]">
          <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2 dark:text-[#F1F5F9] dark:border-[#334155]">
            <ShieldCheck className="w-4 h-4 text-orange-600 dark:text-[#FB923C]" />
            <span>البيانات التأمينية والتعاقدية</span>
          </h3>

          <div className="flex justify-between py-1">
            <span className="text-slate-500 dark:text-[#CBD5E1]">الرقم القومي:</span>
            <strong className="font-mono text-slate-800 dark:text-[#F1F5F9]">{emp?.nationalId || '---'}</strong>
          </div>

          <div className="flex justify-between py-1">
            <span className="text-slate-500 dark:text-[#CBD5E1]">الرقم التأميني للموظف:</span>
            <strong className="font-mono text-slate-800 dark:text-[#F1F5F9]">{emp?.insuranceNumber || '---'}</strong>
          </div>

          <div className="flex justify-between py-1">
            <span className="text-slate-500 dark:text-[#CBD5E1]">تاريخ التعيين الرسمي:</span>
            <strong className="text-slate-800 dark:text-[#F1F5F9]">{emp?.joinDate || '---'}</strong>
          </div>

          <div className="flex justify-between py-1">
            <span className="text-slate-500 dark:text-[#CBD5E1]">الحساب البنكي / IBAN:</span>
            <strong className="font-mono text-slate-800 dark:text-[#F1F5F9]">{emp?.bankAccount || 'نقداً بالخزينة'}</strong>
          </div>
        </div>

        {/* هيكل الأجر المتفق عليه */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs dark:bg-[#1E293B] dark:border-[#334155]">
          <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2 dark:text-[#F1F5F9] dark:border-[#334155]">
            <Building2 className="w-4 h-4 text-orange-600 dark:text-[#FB923C]" />
            <span>هيكل الراتب والبدلات</span>
          </h3>

          <div className="flex justify-between py-1">
            <span className="text-slate-500 dark:text-[#CBD5E1]">الأجر الأساسي:</span>
            <strong className="font-bold text-orange-700 dark:text-[#FB923C]">{emp?.basicSalary.toLocaleString('ar-EG')} ج.م</strong>
          </div>

          <div className="flex justify-between py-1">
            <span className="text-slate-500 dark:text-[#CBD5E1]">الأجر المتغير:</span>
            <strong className="font-bold text-slate-800 dark:text-[#F1F5F9]">{emp?.variableSalary.toLocaleString('ar-EG')} ج.م</strong>
          </div>

          <div className="flex justify-between py-1">
            <span className="text-slate-500 dark:text-[#CBD5E1]">البدلات الثابتة (انتقال / وجبة):</span>
            <strong className="font-bold text-slate-800 dark:text-[#F1F5F9]">{(emp?.allowances || 0).toLocaleString('ar-EG')} ج.م</strong>
          </div>

          <div className="flex justify-between py-1 border-t border-slate-100 pt-2 dark:border-[#334155]">
            <span className="text-slate-700 font-bold dark:text-[#CBD5E1]">إجمالي الأجر التعاقدي:</span>
            <strong className="font-black text-orange-800 text-sm">
              {(emp?.basicSalary + emp?.variableSalary + (emp?.allowances || 0)).toLocaleString('ar-EG')} ج.م
            </strong>
          </div>
        </div>

        {/* بطاقة الأمان وتغيير كلمة المرور */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm md:col-span-2 dark:bg-[#1E293B] dark:border-[#334155]">
          <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2 mb-4 dark:text-[#F1F5F9] dark:border-[#334155]">
            <KeyRound className="w-4 h-4 text-orange-600 dark:text-[#FB923C]" />
            <span>الأمان وتغيير كلمة المرور</span>
          </h3>

          {passMsg && (
            <div className={
              'mb-4 p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ' +
              (passMsgType === 'success'
                ? 'bg-orange-50 border border-orange-200 text-orange-700 dark:bg-orange-950 dark:border-orange-800 dark:text-[#FB923C]'
                : 'bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950 dark:border-rose-800 dark:text-[#F87171]')
            }>
              {passMsgType === 'success' ? <CheckCircle2 className="w-4 h-4" /> : null}
              {passMsg}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1 dark:text-[#CBD5E1]">كلمة المرور الحالية</label>
              <div className="relative">
                <input
                  type={showOld ? 'text' : 'password'}
                  value={oldPass}
                  onChange={(e) => { setOldPass(e.target.value); setPassMsg(''); }}
                  className="w-full p-2 rounded-xl border border-slate-200 font-mono pl-9 dark:bg-[#273449] dark:border-[#334155] dark:text-[#F1F5F9]"
                  placeholder="••••••"
                />
                <button type="button" onClick={() => setShowOld(!showOld)} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-[#CBD5E1] dark:hover:text-[#CBD5E1]">
                  {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 dark:text-[#CBD5E1]">كلمة المرور الجديدة</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPass}
                  onChange={(e) => { setNewPass(e.target.value); setPassMsg(''); }}
                  className="w-full p-2 rounded-xl border border-slate-200 font-mono pl-9 dark:bg-[#273449] dark:border-[#334155] dark:text-[#F1F5F9]"
                  placeholder="جديدة"
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-[#CBD5E1] dark:hover:text-[#CBD5E1]">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 dark:text-[#CBD5E1]">تأكيد كلمة المرور</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPass}
                  onChange={(e) => { setConfirmPass(e.target.value); setPassMsg(''); }}
                  className="w-full p-2 rounded-xl border border-slate-200 font-mono pl-9 dark:bg-[#273449] dark:border-[#334155] dark:text-[#F1F5F9]"
                  placeholder="تأكيد"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-[#CBD5E1] dark:hover:text-[#CBD5E1]">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black rounded-xl shadow-md shadow-orange-600/20 transition"
              >
                تحديث كلمة المرور
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}

