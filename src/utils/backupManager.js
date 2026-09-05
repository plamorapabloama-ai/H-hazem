import * as XLSX from 'xlsx';

const EMPLOYEE_COLUMNS = [
  { key: 'id', label: 'كود الموظف' },
  { key: 'name', label: 'اسم الموظف' },
  { key: 'nationalId', label: 'الرقم القومي' },
  { key: 'insuranceNumber', label: 'الرقم التأميني' },
  { key: 'jobTitle', label: 'المسمى الوظيفي' },
  { key: 'department', label: 'القسم' },
  { key: 'joinDate', label: 'تاريخ التعيين' },
  { key: 'birthDate', label: 'تاريخ الميلاد' },
  { key: 'phone', label: 'رقم الهاتف' },
  { key: 'email', label: 'البريد الإلكتروني' },
  { key: 'basicSalary', label: 'الراتب الأساسي' },
  { key: 'variableSalary', label: 'الراتب المتغير' },
  { key: 'allowances', label: 'البدلات الثابتة' },
  { key: 'bankAccount', label: 'الحساب البنكي' },
  { key: 'gender', label: 'الجنس' },
  { key: 'annualLeaveBalance', label: 'رصيد إجازة سنوية' },
  { key: 'casualLeaveBalance', label: 'رصيد إجازة عارضة' },
  { key: 'password', label: 'كلمة المرور' },
];

export function exportFullBackup(employees, effects, settings, adminPassword) {
  const backup = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    data: { employees, effects, settings, adminPassword }
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().split('T')[0];
  a.download = `hr-backup-${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importFullBackup(file, onLoad) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target.result);
        if (!backup.version || !backup.data) {
          reject(new Error('ملف النسخة الاحتياطية غير صالح أو تالف'));
          return;
        }
        onLoad(backup.data);
        resolve(backup.data);
      } catch (err) {
        reject(new Error('خطأ في قراءة الملف: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('فشل في قراءة الملف'));
    reader.readAsText(file);
  });
}

export function exportEmployeesToExcel(employees) {
  const data = employees.map(emp => {
    const row = {};
    EMPLOYEE_COLUMNS.forEach(col => {
      row[col.label] = emp[col.key] || '';
    });
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'الموظفين');

  ws['!cols'] = EMPLOYEE_COLUMNS.map(() => ({ wch: 20 }));

  XLSX.writeFile(wb, `employees-${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function downloadEmployeeTemplate() {
  const headers = {};
  EMPLOYEE_COLUMNS.forEach(col => { headers[col.label] = ''; });
  const ws = XLSX.utils.json_to_sheet([headers]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'قالب الموظفين');

  ws['!cols'] = EMPLOYEE_COLUMNS.map(() => ({ wch: 20 }));

  XLSX.writeFile(wb, 'employee-template.xlsx');
}

export function importEmployeesFromExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(ws);

        if (rawData.length === 0) {
          reject(new Error('الملف فارغ أو لا يحتوي على بيانات'));
          return;
        }

        const labelToKey = {};
        EMPLOYEE_COLUMNS.forEach(col => { labelToKey[col.label] = col.key; });

        const employees = rawData.map((row, i) => {
          const emp = {};
          Object.keys(row).forEach(label => {
            const key = labelToKey[label] || label;
            emp[key] = row[label];
          });

          emp.basicSalary = Number(emp.basicSalary) || 0;
          emp.variableSalary = Number(emp.variableSalary) || 1500;
          emp.allowances = Number(emp.allowances) || 1000;
          emp.annualLeaveBalance = Number(emp.annualLeaveBalance) || 21;
          emp.casualLeaveBalance = Number(emp.casualLeaveBalance) || 6;
          emp.gender = emp.gender || 'male';
          emp.role = 'employee';
          emp.password = emp.password || '1234';

          return emp;
        });

        resolve(employees);
      } catch (err) {
        reject(new Error('خطأ في قراءة ملف الإكسيل: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('فشل في قراءة الملف'));
    reader.readAsArrayBuffer(file);
  });
}
