import * as XLSX from 'xlsx-js-style';

// ═══════════════════════════════════════════════════════════════
// الألوان والأنماط الاحترافية
// ═══════════════════════════════════════════════════════════════
const COLORS = {
  navy:       '1E293B',
  orange:     'F97316',
  white:      'FFFFFF',
  black:      '1E1E1E',
  lightGray:  'F8FAFC',
  red:        'E11D48',
  green:      '16A34A',
  yellow:     'F59E0B',
  lightRed:   'FFF1F2',
  lightGreen: 'F0FDF4',
  lightYellow:'FFFBEB',
  slate:      '64748B',
};

// ═══════════════════════════════════════════════════════════════
// دوال مساعدة مشتركة
// ═══════════════════════════════════════════════════════════════

function getColLetter(col) {
  let result = '';
  while (col > 0) { col--; result = String.fromCharCode(65 + (col % 26)) + result; col = Math.floor(col / 26); }
  return result;
}

function makeBorder(style = 'medium') {
  const s = { style, color: { rgb: COLORS.navy } };
  return { left: s, right: s, top: s, bottom: s };
}

function applyStyle(cell, opts) {
  if (!cell) return;
  cell.s = {};
  if (opts.font)   cell.s.font = opts.font;
  if (opts.fill)   cell.s.fill = opts.fill;
  if (opts.align)  cell.s.alignment = opts.align;
  if (opts.border) cell.s.border = opts.border;
}

/**
 * إنشاء worksheet من مصفوفة بيانات + تطبيق الأنماط
 */
function createSheet(aoa, merges, colWidths, rowHeights) {
  const ws = XLSX.utils.aoa_to_sheet(aoa, { cellStyles: true });

  // دمج الخلايا
  if (merges && merges.length) {
    ws['!merges'] = merges.map(m => XLSX.utils.decode_range(m));
  }

  // عرض الأعمدة
  if (colWidths) {
    ws['!cols'] = colWidths.map(w => ({ wch: w }));
  }

  // ارتفاع الصفوف
  if (rowHeights) {
    ws['!rows'] = rowHeights.map(h => ({ hpt: h }));
  }

  return ws;
}

/**
 * بناء مصفوفة رأس الشركة + بيانات + عناوين + جدول
 */
function buildPayrollAoa(payrollData, monthYear, companyName, companyDetails) {
  const details = [];
  if (companyDetails.commercialRegister) details.push('س.ت: ' + companyDetails.commercialRegister);
  if (companyDetails.taxNumber) details.push('ب.ض: ' + companyDetails.taxNumber);
  if (companyDetails.insuranceNumber) details.push('رقم التأمين: ' + companyDetails.insuranceNumber);
  if (companyDetails.address) details.push('العنوان: ' + companyDetails.address);
  if (companyDetails.phone) details.push('ت: ' + companyDetails.phone);

  const aoa = [
    [companyName || ''],
    [details.join('  |  ')],
    [''],  // خط فاصل
    [''],
    [`كشف مسير رواتب وأجور الموظفين  —  شهر: ${monthYear}  —  تاريخ الإصدار: ${new Date().toLocaleDateString('ar-EG')}`],
    [''],
    ['م', 'اسم الموظف', 'الوظيفة', 'الأساسي', 'المتغير', 'إضافي ومكافآت', 'إجمالي الأجر', 'تأمينات 11%', 'ضريبة الدخل', 'خصومات وسلف', 'الصافي', 'توقيع المستلم'],
  ];

  payrollData.forEach((row, idx) => {
    const extras = row.overtimePay + row.bonuses + row.missionAllowances;
    const deductions = row.absenceDeduction + row.penaltyDeduction + row.loansAndAdvances + row.otherDeductions;
    aoa.push([
      idx + 1,
      row.employeeName,
      row.jobTitle,
      row.basicSalary,
      row.variableSalary,
      extras,
      row.totalEntitlements,
      row.socialInsuranceEmployee,
      row.incomeTax,
      deductions,
      row.netSalary,
      ''
    ]);
  });

  // صف الإجماليات
  aoa.push([
    'الإجمالي العام:',
    '',
    '',
    payrollData.reduce((a, c) => a + c.basicSalary, 0),
    payrollData.reduce((a, c) => a + c.variableSalary, 0),
    payrollData.reduce((a, c) => a + c.overtimePay + c.bonuses + c.missionAllowances, 0),
    payrollData.reduce((a, c) => a + c.totalEntitlements, 0),
    payrollData.reduce((a, c) => a + c.socialInsuranceEmployee, 0),
    payrollData.reduce((a, c) => a + c.incomeTax, 0),
    payrollData.reduce((a, c) => a + c.absenceDeduction + c.penaltyDeduction + c.loansAndAdvances + c.otherDeductions, 0),
    payrollData.reduce((a, c) => a + c.netSalary, 0),
    ''
  ]);

  return aoa;
}

function buildBankTransferAoa(payrollData, monthYear, companyName, companyDetails) {
  const details = [];
  if (companyDetails.commercialRegister) details.push('س.ت: ' + companyDetails.commercialRegister);
  if (companyDetails.taxNumber) details.push('ب.ض: ' + companyDetails.taxNumber);
  if (companyDetails.address) details.push('العنوان: ' + companyDetails.address);

  const aoa = [
    [companyName || ''],
    [details.join('  |  ')],
    [''],
    [''],
    [`كشف تحويل رواتب الموظفين للبنك  —  شهر: ${monthYear}  —  تاريخ الإصدار: ${new Date().toLocaleDateString('ar-EG')}`],
    [''],
    ['م', 'اسم الموظف', 'الرقم القومي', 'رقم الحساب / IBAN', 'المبلغ الصافي (ج.م)', 'ملاحظات'],
  ];

  payrollData.forEach((row, idx) => {
    aoa.push([
      idx + 1,
      row.employeeName,
      row.nationalId || '',
      row.bankAccount || 'كاش بالخزينة',
      row.netSalary,
      'راتب شهر ' + monthYear
    ]);
  });

  aoa.push([
    'الإجمالي', '', '', '',
    payrollData.reduce((a, c) => a + c.netSalary, 0),
    ''
  ]);

  return aoa;
}

function buildEffectsAoa(effectsList, monthYear, companyName, companyDetails) {
  const details = [];
  if (companyDetails.commercialRegister) details.push('س.ت: ' + companyDetails.commercialRegister);
  if (companyDetails.taxNumber) details.push('ب.ض: ' + companyDetails.taxNumber);

  const aoa = [
    [companyName || ''],
    [details.join('  |  ')],
    [''],
    [''],
    [`سجل المؤثرات والطلبات المعتمدة  —  شهر: ${monthYear}  —  تاريخ الإصدار: ${new Date().toLocaleDateString('ar-EG')}`],
    [''],
    ['م', 'رقم الطلب', 'التاريخ', 'اسم الموظف', 'نوع المؤثر', 'التفاصيل', 'الأيام/الساعات', 'الحالة'],
  ];

  effectsList.forEach((e, idx) => {
    const status = e.status === 'approved' ? 'معتمد' : (e.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة');
    aoa.push([
      idx + 1,
      idx + 1,
      e.date || '',
      e.employeeName,
      e.typeLabel,
      e.description || '',
      e.units ? (e.units + ' ' + (e.unitType || '')) : '-',
      status
    ]);
  });

  return aoa;
}

// ═══════════════════════════════════════════════════════════════
// التصديرات الرئيسية
// ═══════════════════════════════════════════════════════════════

/**
 * تصدير مسير الرواتب إلى Excel احترافي
 */
export function exportPayrollToExcel(payrollData, monthYear, companyName, companyDetails = {}) {
  const aoa = buildPayrollAoa(payrollData, monthYear, companyName, companyDetails);
  const dataStartRow = 7; // صف رؤوس الأعمدة (0-indexed: row 6)
  const totalRows = aoa.length;

  // بناء أنماط الخلايا
  const cellStyles = [];

  // صف 0: اسم الشركة (سطر 1)
  cellStyles.push({ r: 0, s: { font: { bold: true, sz: 18, color: { rgb: COLORS.black } }, alignment: { horizontal: 'center', vertical: 'center' } } });

  // صف 1: بيانات الشركة
  cellStyles.push({ r: 1, s: { font: { sz: 10, color: { rgb: COLORS.slate } }, alignment: { horizontal: 'center', vertical: 'center' } } });

  // صف 2: خط برتقالي
  cellStyles.push({ r: 2, s: { fill: { fgColor: { rgb: COLORS.orange } } } });

  // صف 4: عنوان التقرير
  cellStyles.push({ r: 4, s: { font: { bold: true, sz: 12, color: { rgb: COLORS.black } }, alignment: { horizontal: 'center', vertical: 'center' } } });

  // صف 6: رؤوس الأعمدة (كحلي + أبيض Bold)
  for (let c = 0; c < 12; c++) {
    cellStyles.push({ r: 6, c, s: {
      font: { bold: true, sz: 10, color: { rgb: COLORS.white } },
      fill: { fgColor: { rgb: COLORS.navy } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: makeBorder('medium')
    }});
  }

  // صفوف البيانات (7 إلى totalRows-2)
  for (let r = 7; r < totalRows - 1; r++) {
    const isEven = (r - 7) % 2 === 0;
    for (let c = 0; c < 12; c++) {
      cellStyles.push({ r, c, s: {
        alignment: { horizontal: 'center', vertical: 'center' },
        border: makeBorder('medium'),
        fill: isEven ? { fgColor: { rgb: COLORS.lightGray } } : undefined
      }});
    }
  }

  // صف الإجماليات (الأخير)
  const totalIdx = totalRows - 1;
  for (let c = 0; c < 12; c++) {
    cellStyles.push({ r: totalIdx, c, s: {
      font: { bold: true, sz: 10, color: { rgb: COLORS.white } },
      fill: { fgColor: { rgb: COLORS.orange } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: makeBorder('medium')
    }});
  }

  // إنشاء worksheet
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // تطبيق الأنماط
  cellStyles.forEach(({ r, c, s }) => {
    const addr = c !== undefined ? XLSX.utils.encode_cell({ r, c }) : XLSX.utils.encode_cell({ r, c: 0 });
    const cell = ws[addr];
    if (cell) applyStyle(cell, s);
  });

  // دمج الخلايا
  ws['!merges'] = [
    XLSX.utils.decode_range('A1:L1'),
    XLSX.utils.decode_range('A2:L2'),
    XLSX.utils.decode_range('A3:L3'),
    XLSX.utils.decode_range('A5:L5'),
  ];

  ws['!cols'] = [
    { wch: 5 }, { wch: 22 }, { wch: 18 }, { wch: 14 }, { wch: 14 },
    { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
    { wch: 16 }, { wch: 18 }
  ];

  ws['!rows'] = [
    { hpt: 40 }, { hpt: 22 }, { hpt: 6 }, { hpt: 10 }, { hpt: 28 },
    { hpt: 10 }, { hpt: 28 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'مسير الرواتب');
  XLSX.writeFile(wb, `مسير_رواتب_${companyName.replace(/\s+/g, '_')}_${monthYear.replace('/', '-')}.xlsx`);
}

/**
 * تصدير كشف تحويلات البنك
 */
export function exportBankTransferExcel(payrollData, monthYear, companyName, companyDetails = {}) {
  const aoa = buildBankTransferAoa(payrollData, monthYear, companyName, companyDetails);
  const totalRows = aoa.length;

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // أنماط
  const cellStyles = [];
  cellStyles.push({ r: 0, s: { font: { bold: true, sz: 18, color: { rgb: COLORS.black } }, alignment: { horizontal: 'center', vertical: 'center' } } });
  cellStyles.push({ r: 1, s: { font: { sz: 10, color: { rgb: COLORS.slate } }, alignment: { horizontal: 'center', vertical: 'center' } } });
  cellStyles.push({ r: 2, s: { fill: { fgColor: { rgb: COLORS.orange } } } });
  cellStyles.push({ r: 4, s: { font: { bold: true, sz: 12, color: { rgb: COLORS.black } }, alignment: { horizontal: 'center', vertical: 'center' } } });

  for (let c = 0; c < 6; c++) {
    cellStyles.push({ r: 6, c, s: { font: { bold: true, sz: 10, color: { rgb: COLORS.white } }, fill: { fgColor: { rgb: COLORS.navy } }, alignment: { horizontal: 'center', vertical: 'center' }, border: makeBorder('medium') } });
  }

  for (let r = 7; r < totalRows - 1; r++) {
    const isEven = (r - 7) % 2 === 0;
    for (let c = 0; c < 6; c++) {
      cellStyles.push({ r, c, s: { alignment: { horizontal: 'center', vertical: 'center' }, border: makeBorder('medium'), fill: isEven ? { fgColor: { rgb: COLORS.lightGray } } : undefined } });
    }
  }

  const totalIdx = totalRows - 1;
  for (let c = 0; c < 6; c++) {
    cellStyles.push({ r: totalIdx, c, s: { font: { bold: true, sz: 10, color: { rgb: COLORS.white } }, fill: { fgColor: { rgb: COLORS.orange } }, alignment: { horizontal: 'center', vertical: 'center' }, border: makeBorder('medium') } });
  }

  cellStyles.forEach(({ r, c, s }) => {
    const cell = ws[XLSX.utils.encode_cell({ r, c })];
    if (cell) applyStyle(cell, s);
  });

  ws['!merges'] = [
    XLSX.utils.decode_range('A1:F1'),
    XLSX.utils.decode_range('A2:F2'),
    XLSX.utils.decode_range('A3:F3'),
    XLSX.utils.decode_range('A5:F5'),
  ];

  ws['!cols'] = [{ wch: 5 }, { wch: 22 }, { wch: 18 }, { wch: 24 }, { wch: 18 }, { wch: 20 }];
  ws['!rows'] = [{ hpt: 40 }, { hpt: 22 }, { hpt: 6 }, { hpt: 10 }, { hpt: 28 }, { hpt: 10 }, { hpt: 28 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'التحويل البنكي');
  XLSX.writeFile(wb, `كشف_تحويل_بنكي_${companyName.replace(/\s+/g, '_')}_${monthYear.replace('/', '-')}.xlsx`);
}

/**
 * تصدير كشف المؤثرات الشهرية
 */
export function exportEffectsExcel(effectsList, monthYear, companyName = '', companyDetails = {}) {
  const aoa = buildEffectsAoa(effectsList, monthYear, companyName, companyDetails);
  const totalRows = aoa.length;

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  const cellStyles = [];
  cellStyles.push({ r: 0, s: { font: { bold: true, sz: 18, color: { rgb: COLORS.black } }, alignment: { horizontal: 'center', vertical: 'center' } } });
  cellStyles.push({ r: 1, s: { font: { sz: 10, color: { rgb: COLORS.slate } }, alignment: { horizontal: 'center', vertical: 'center' } } });
  cellStyles.push({ r: 2, s: { fill: { fgColor: { rgb: COLORS.orange } } } });
  cellStyles.push({ r: 4, s: { font: { bold: true, sz: 12, color: { rgb: COLORS.black } }, alignment: { horizontal: 'center', vertical: 'center' } } });

  for (let c = 0; c < 8; c++) {
    cellStyles.push({ r: 6, c, s: { font: { bold: true, sz: 10, color: { rgb: COLORS.white } }, fill: { fgColor: { rgb: COLORS.navy } }, alignment: { horizontal: 'center', vertical: 'center' }, border: makeBorder('medium') } });
  }

  for (let r = 7; r < totalRows; r++) {
    const isEven = (r - 7) % 2 === 0;
    for (let c = 0; c < 8; c++) {
      cellStyles.push({ r, c, s: { alignment: { horizontal: 'center', vertical: 'center' }, border: makeBorder('medium'), fill: isEven ? { fgColor: { rgb: COLORS.lightGray } } : undefined } });
    }
  }

  // تلوين خلايا الحالة (العمود الأخير =عمود 7)
  effectsList.forEach((e, idx) => {
    const r = 7 + idx;
    const status = e.status === 'approved' ? 'معتمد' : (e.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة');
    const statusColor = e.status === 'approved' ? COLORS.green : (e.status === 'rejected' ? COLORS.red : COLORS.yellow);
    const bgColor = e.status === 'approved' ? COLORS.lightGreen : (e.status === 'rejected' ? COLORS.lightRed : COLORS.lightYellow);

    cellStyles.push({ r, c: 7, s: { font: { bold: true, color: { rgb: statusColor } }, fill: { fgColor: { rgb: bgColor } }, alignment: { horizontal: 'center', vertical: 'center' }, border: makeBorder('medium') } });
  });

  cellStyles.forEach(({ r, c, s }) => {
    const cell = ws[XLSX.utils.encode_cell({ r, c })];
    if (cell) applyStyle(cell, s);
  });

  ws['!merges'] = [
    XLSX.utils.decode_range('A1:H1'),
    XLSX.utils.decode_range('A2:H2'),
    XLSX.utils.decode_range('A3:H3'),
    XLSX.utils.decode_range('A5:H5'),
  ];

  ws['!cols'] = [{ wch: 5 }, { wch: 10 }, { wch: 14 }, { wch: 22 }, { wch: 18 }, { wch: 28 }, { wch: 16 }, { wch: 14 }];
  ws['!rows'] = [{ hpt: 40 }, { hpt: 22 }, { hpt: 6 }, { hpt: 10 }, { hpt: 28 }, { hpt: 10 }, { hpt: 28 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'المؤثرات');
  XLSX.writeFile(wb, `سجل_المؤثرات_${monthYear.replace('/', '-')}.xlsx`);
}

/**
 * تصدير تقرير الغياب والخصومات إلى Excel
 */
export function exportAbsenceReportToExcel(payrollData, monthYear, companyName, companyDetails = {}) {
  const employeesWithDeductions = payrollData.filter(e => e.absenceDeduction > 0 || e.penaltyDeduction > 0 || e.loansAndAdvances > 0 || e.otherDeductions > 0);

  const details = [];
  if (companyDetails.commercialRegister) details.push('س.ت: ' + companyDetails.commercialRegister);
  if (companyDetails.taxNumber) details.push('ب.ض: ' + companyDetails.taxNumber);

  const aoa = [
    [companyName || ''],
    [details.join('  |  ')],
    [''],
    ['تقرير الغياب والخصومات والسلف الشهرية  —  شهر: ' + monthYear],
    [''],
    ['م', 'اسم الموظف', 'الوظيفة', 'خصم غياب', 'جزاءات', 'سلف', 'أخرى', 'الإجمالي'],
  ];

  employeesWithDeductions.forEach((row, idx) => {
    aoa.push([
      idx + 1,
      row.employeeName,
      row.jobTitle,
      row.absenceDeduction || 0,
      row.penaltyDeduction || 0,
      row.loansAndAdvances || 0,
      row.otherDeductions || 0,
      row.absenceDeduction + row.penaltyDeduction + row.loansAndAdvances + row.otherDeductions
    ]);
  });

  aoa.push([
    'الإجمالي', '', '',
    employeesWithDeductions.reduce((a, c) => a + c.absenceDeduction, 0),
    employeesWithDeductions.reduce((a, c) => a + c.penaltyDeduction, 0),
    employeesWithDeductions.reduce((a, c) => a + c.loansAndAdvances, 0),
    employeesWithDeductions.reduce((a, c) => a + c.otherDeductions, 0),
    employeesWithDeductions.reduce((a, c) => a + c.absenceDeduction + c.penaltyDeduction + c.loansAndAdvances + c.otherDeductions, 0)
  ]);

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  const cellStyles = [];
  cellStyles.push({ r: 0, s: { font: { bold: true, sz: 18, color: { rgb: COLORS.black } }, alignment: { horizontal: 'center' } } });
  cellStyles.push({ r: 1, s: { font: { sz: 10, color: { rgb: COLORS.slate } }, alignment: { horizontal: 'center' } } });
  cellStyles.push({ r: 2, s: { fill: { fgColor: { rgb: COLORS.orange } } } });
  cellStyles.push({ r: 3, s: { font: { bold: true, sz: 12, color: { rgb: COLORS.black } }, alignment: { horizontal: 'center' } } });

  for (let c = 0; c < 8; c++) {
    cellStyles.push({ r: 5, c, s: { font: { bold: true, sz: 10, color: { rgb: COLORS.white } }, fill: { fgColor: { rgb: COLORS.navy } }, alignment: { horizontal: 'center', vertical: 'center' }, border: makeBorder('medium') } });
  }

  for (let r = 6; r < aoa.length - 1; r++) {
    for (let c = 0; c < 8; c++) {
      cellStyles.push({ r, c, s: { alignment: { horizontal: 'center', vertical: 'center' }, border: makeBorder('medium') } });
    }
  }

  const totalIdx = aoa.length - 1;
  for (let c = 0; c < 8; c++) {
    cellStyles.push({ r: totalIdx, c, s: { font: { bold: true, sz: 10, color: { rgb: COLORS.white } }, fill: { fgColor: { rgb: COLORS.orange } }, alignment: { horizontal: 'center' }, border: makeBorder('medium') } });
  }

  cellStyles.forEach(({ r, c, s }) => {
    const cell = ws[XLSX.utils.encode_cell({ r, c: c ?? 0 })];
    if (cell) applyStyle(cell, s);
  });

  ws['!merges'] = [
    XLSX.utils.decode_range('A1:H1'),
    XLSX.utils.decode_range('A2:H2'),
    XLSX.utils.decode_range('A3:H3'),
    XLSX.utils.decode_range('A5:H5'),
  ];

  ws['!cols'] = [{ wch: 5 }, { wch: 22 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 16 }];
  ws['!rows'] = [{ hpt: 40 }, { hpt: 22 }, { hpt: 6 }, { hpt: 10 }, { hpt: 28 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'الغياب والخصومات');
  XLSX.writeFile(wb, `تقرير_الغياب_والخصومات_${monthYear.replace('/', '-')}.xlsx`);
}

/**
 * تصدير تقرير أرصدة الإجازات إلى Excel
 */
export function exportLeaveBalanceToExcel(employees, companyName, companyDetails = {}) {
  const details = [];
  if (companyDetails.commercialRegister) details.push('س.ت: ' + companyDetails.commercialRegister);
  if (companyDetails.taxNumber) details.push('ب.ض: ' + companyDetails.taxNumber);
  const now = new Date();
  const dateStr = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

  const aoa = [
    [companyName || ''],
    [details.join('  |  ')],
    [''],
    [`تقرير أرصدة الإجازات — تاريخ الإصدار: ${dateStr}`],
    [''],
    ['م', 'اسم الموظف', 'الوظيفة', 'القسم', 'تاريخ التعيين', 'السنوية (المتبقي)', 'السنوية (المستخدمة)', 'العارضة (المتبقي)', 'العارضة (المستخدمة)'],
  ];

  employees.forEach((emp, idx) => {
    const annualUsed = 21 - (emp.annualLeaveBalance || 21);
    const casualUsed = 6 - (emp.casualLeaveBalance || 6);
    aoa.push([
      idx + 1,
      emp.name,
      emp.jobTitle,
      emp.department,
      emp.joinDate || '',
      emp.annualLeaveBalance || 21,
      annualUsed,
      emp.casualLeaveBalance || 6,
      casualUsed
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  const cellStyles = [];
  cellStyles.push({ r: 0, s: { font: { bold: true, sz: 18, color: { rgb: COLORS.black } }, alignment: { horizontal: 'center' } } });
  cellStyles.push({ r: 1, s: { font: { sz: 10, color: { rgb: COLORS.slate } }, alignment: { horizontal: 'center' } } });
  cellStyles.push({ r: 2, s: { fill: { fgColor: { rgb: COLORS.orange } } } });
  cellStyles.push({ r: 3, s: { font: { bold: true, sz: 12, color: { rgb: COLORS.black } }, alignment: { horizontal: 'center' } } });

  for (let c = 0; c < 9; c++) {
    cellStyles.push({ r: 5, c, s: { font: { bold: true, sz: 10, color: { rgb: COLORS.white } }, fill: { fgColor: { rgb: COLORS.navy } }, alignment: { horizontal: 'center', vertical: 'center' }, border: makeBorder('medium') } });
  }

  for (let r = 6; r < aoa.length; r++) {
    for (let c = 0; c < 9; c++) {
      cellStyles.push({ r, c, s: { alignment: { horizontal: 'center', vertical: 'center' }, border: makeBorder('medium') } });
    }
  }

  cellStyles.forEach(({ r, c, s }) => {
    const cell = ws[XLSX.utils.encode_cell({ r, c: c ?? 0 })];
    if (cell) applyStyle(cell, s);
  });

  ws['!merges'] = [
    XLSX.utils.decode_range('A1:I1'),
    XLSX.utils.decode_range('A2:I2'),
    XLSX.utils.decode_range('A3:I3'),
    XLSX.utils.decode_range('A5:I5'),
  ];

  ws['!cols'] = [{ wch: 5 }, { wch: 22 }, { wch: 18 }, { wch: 16 }, { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }];
  ws['!rows'] = [{ hpt: 40 }, { hpt: 22 }, { hpt: 6 }, { hpt: 10 }, { hpt: 28 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'أرصدة الإجازات');
  XLSX.writeFile(wb, `تقرير_أرصدة_الإجازات_${dateStr.replace(/\s+/g, '_')}.xlsx`);
}

/**
 * تصدير تقرير المأموريات إلى Excel
 */
export function exportMissionReportToExcel(effects, monthYear, companyName, companyDetails = {}) {
  const missionEffects = effects.filter(e => e.status === 'approved' && e.type === 'mission');

  const details = [];
  if (companyDetails.commercialRegister) details.push('س.ت: ' + companyDetails.commercialRegister);
  if (companyDetails.taxNumber) details.push('ب.ض: ' + companyDetails.taxNumber);

  const aoa = [
    [companyName || ''],
    [details.join('  |  ')],
    [''],
    [`تقرير المأموريات الخارجية — شهر: ${monthYear}`],
    [''],
    ['م', 'اسم الموظف', 'الوجهة', 'من تاريخ', 'إلى تاريخ', 'المدة', 'المبلغ (ج.م)', 'السبب'],
  ];

  missionEffects.forEach((eff, idx) => {
    aoa.push([
      idx + 1,
      eff.employeeName,
      eff.destination || '',
      eff.startDate || '',
      eff.endDate || eff.startDate || '',
      (eff.units || 0) + ' ' + (eff.unitType || ''),
      eff.amount || 0,
      eff.reason || ''
    ]);
  });

  aoa.push([
    'الإجمالي', '', '', '', '', '',
    missionEffects.reduce((a, c) => a + (c.amount || 0), 0),
    ''
  ]);

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  const cellStyles = [];
  cellStyles.push({ r: 0, s: { font: { bold: true, sz: 18, color: { rgb: COLORS.black } }, alignment: { horizontal: 'center' } } });
  cellStyles.push({ r: 1, s: { font: { sz: 10, color: { rgb: COLORS.slate } }, alignment: { horizontal: 'center' } } });
  cellStyles.push({ r: 2, s: { fill: { fgColor: { rgb: COLORS.orange } } } });
  cellStyles.push({ r: 3, s: { font: { bold: true, sz: 12, color: { rgb: COLORS.black } }, alignment: { horizontal: 'center' } } });

  for (let c = 0; c < 8; c++) {
    cellStyles.push({ r: 5, c, s: { font: { bold: true, sz: 10, color: { rgb: COLORS.white } }, fill: { fgColor: { rgb: COLORS.navy } }, alignment: { horizontal: 'center', vertical: 'center' }, border: makeBorder('medium') } });
  }

  for (let r = 6; r < aoa.length - 1; r++) {
    for (let c = 0; c < 8; c++) {
      cellStyles.push({ r, c, s: { alignment: { horizontal: 'center', vertical: 'center' }, border: makeBorder('medium') } });
    }
  }

  const totalIdx = aoa.length - 1;
  for (let c = 0; c < 8; c++) {
    cellStyles.push({ r: totalIdx, c, s: { font: { bold: true, sz: 10, color: { rgb: COLORS.white } }, fill: { fgColor: { rgb: COLORS.orange } }, alignment: { horizontal: 'center' }, border: makeBorder('medium') } });
  }

  cellStyles.forEach(({ r, c, s }) => {
    const cell = ws[XLSX.utils.encode_cell({ r, c: c ?? 0 })];
    if (cell) applyStyle(cell, s);
  });

  ws['!merges'] = [
    XLSX.utils.decode_range('A1:H1'),
    XLSX.utils.decode_range('A2:H2'),
    XLSX.utils.decode_range('A3:H3'),
    XLSX.utils.decode_range('A5:H5'),
  ];

  ws['!cols'] = [{ wch: 5 }, { wch: 22 }, { wch: 24 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 28 }];
  ws['!rows'] = [{ hpt: 40 }, { hpt: 22 }, { hpt: 6 }, { hpt: 10 }, { hpt: 28 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'المأموريات');
  XLSX.writeFile(wb, `تقرير_المأموريات_${monthYear.replace('/', '-')}.xlsx`);
}

/**
 * تصدير تقرير الساعات الإضافية إلى Excel
 */
export function exportOvertimeReportToExcel(effects, monthYear, companyName, companyDetails = {}) {
  const overtimeEffects = effects.filter(e => e.status === 'approved' && e.type === 'overtime');

  const details = [];
  if (companyDetails.commercialRegister) details.push('س.ت: ' + companyDetails.commercialRegister);
  if (companyDetails.taxNumber) details.push('ب.ض: ' + companyDetails.taxNumber);

  const aoa = [
    [companyName || ''],
    [details.join('  |  ')],
    [''],
    [`تقرير الساعات الإضافية — شهر: ${monthYear}`],
    [''],
    ['م', 'اسم الموظف', 'التاريخ', 'الساعات', 'النوع', 'السبب', 'ملاحظات الإدارة'],
  ];

  overtimeEffects.forEach((eff, idx) => {
    const category = eff.overtimeCategory === 'night' ? 'ليلي (70%)' : eff.overtimeCategory === 'holiday' ? 'عطلة رسمية (100%)' : 'نهاري (35%)';
    aoa.push([
      idx + 1,
      eff.employeeName,
      eff.date || '',
      eff.units || 0,
      category,
      eff.reason || '',
      eff.adminNotes || ''
    ]);
  });

  aoa.push([
    'الإجمالي', '', '',
    overtimeEffects.reduce((a, c) => a + (Number(c.units) || 0), 0),
    '', '', ''
  ]);

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  const cellStyles = [];
  cellStyles.push({ r: 0, s: { font: { bold: true, sz: 18, color: { rgb: COLORS.black } }, alignment: { horizontal: 'center' } } });
  cellStyles.push({ r: 1, s: { font: { sz: 10, color: { rgb: COLORS.slate } }, alignment: { horizontal: 'center' } } });
  cellStyles.push({ r: 2, s: { fill: { fgColor: { rgb: COLORS.orange } } } });
  cellStyles.push({ r: 3, s: { font: { bold: true, sz: 12, color: { rgb: COLORS.black } }, alignment: { horizontal: 'center' } } });

  for (let c = 0; c < 7; c++) {
    cellStyles.push({ r: 5, c, s: { font: { bold: true, sz: 10, color: { rgb: COLORS.white } }, fill: { fgColor: { rgb: COLORS.navy } }, alignment: { horizontal: 'center', vertical: 'center' }, border: makeBorder('medium') } });
  }

  for (let r = 6; r < aoa.length - 1; r++) {
    for (let c = 0; c < 7; c++) {
      cellStyles.push({ r, c, s: { alignment: { horizontal: 'center', vertical: 'center' }, border: makeBorder('medium') } });
    }
  }

  const totalIdx = aoa.length - 1;
  for (let c = 0; c < 7; c++) {
    cellStyles.push({ r: totalIdx, c, s: { font: { bold: true, sz: 10, color: { rgb: COLORS.white } }, fill: { fgColor: { rgb: COLORS.orange } }, alignment: { horizontal: 'center' }, border: makeBorder('medium') } });
  }

  cellStyles.forEach(({ r, c, s }) => {
    const cell = ws[XLSX.utils.encode_cell({ r, c: c ?? 0 })];
    if (cell) applyStyle(cell, s);
  });

  ws['!merges'] = [
    XLSX.utils.decode_range('A1:G1'),
    XLSX.utils.decode_range('A2:G2'),
    XLSX.utils.decode_range('A3:G3'),
    XLSX.utils.decode_range('A5:G5'),
  ];

  ws['!cols'] = [{ wch: 5 }, { wch: 22 }, { wch: 14 }, { wch: 10 }, { wch: 18 }, { wch: 28 }, { wch: 22 }];
  ws['!rows'] = [{ hpt: 40 }, { hpt: 22 }, { hpt: 6 }, { hpt: 10 }, { hpt: 28 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'الساعات الإضافية');
  XLSX.writeFile(wb, `تقرير_الساعات_الإضافية_${monthYear.replace('/', '-')}.xlsx`);
}

/**
 * تصدير قائمة الموظفين إلى Excel
 */
export function exportEmployeeRosterToExcel(employees, companyName, companyDetails = {}) {
  const details = [];
  if (companyDetails.commercialRegister) details.push('س.ت: ' + companyDetails.commercialRegister);
  if (companyDetails.taxNumber) details.push('ب.ض: ' + companyDetails.taxNumber);
  const now = new Date();
  const dateStr = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

  const aoa = [
    [companyName || ''],
    [details.join('  |  ')],
    [''],
    [`قائمة الموظفين — عدد الموظفين: ${employees.length} — تاريخ الإصدار: ${dateStr}`],
    [''],
    ['م', 'اسم الموظف', 'الكود', 'الوظيفة', 'القسم', 'الرقم القومي', 'الرقم التأميني', 'تاريخ التعيين', 'الهاتف', 'الأساسي (ج.م)'],
  ];

  employees.forEach((emp, idx) => {
    aoa.push([
      idx + 1,
      emp.name,
      emp.id,
      emp.jobTitle,
      emp.department,
      emp.nationalId || '',
      emp.insuranceNumber || '',
      emp.joinDate || '',
      emp.phone || '',
      emp.basicSalary
    ]);
  });

  aoa.push([
    'الإجمالي', '', '', '', '', '', '', '', '',
    employees.reduce((a, c) => a + c.basicSalary, 0)
  ]);

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  const cellStyles = [];
  cellStyles.push({ r: 0, s: { font: { bold: true, sz: 18, color: { rgb: COLORS.black } }, alignment: { horizontal: 'center' } } });
  cellStyles.push({ r: 1, s: { font: { sz: 10, color: { rgb: COLORS.slate } }, alignment: { horizontal: 'center' } } });
  cellStyles.push({ r: 2, s: { fill: { fgColor: { rgb: COLORS.orange } } } });
  cellStyles.push({ r: 3, s: { font: { bold: true, sz: 12, color: { rgb: COLORS.black } }, alignment: { horizontal: 'center' } } });

  for (let c = 0; c < 10; c++) {
    cellStyles.push({ r: 5, c, s: { font: { bold: true, sz: 10, color: { rgb: COLORS.white } }, fill: { fgColor: { rgb: COLORS.navy } }, alignment: { horizontal: 'center', vertical: 'center' }, border: makeBorder('medium') } });
  }

  for (let r = 6; r < aoa.length - 1; r++) {
    for (let c = 0; c < 10; c++) {
      cellStyles.push({ r, c, s: { alignment: { horizontal: 'center', vertical: 'center' }, border: makeBorder('medium') } });
    }
  }

  const totalIdx = aoa.length - 1;
  for (let c = 0; c < 10; c++) {
    cellStyles.push({ r: totalIdx, c, s: { font: { bold: true, sz: 10, color: { rgb: COLORS.white } }, fill: { fgColor: { rgb: COLORS.orange } }, alignment: { horizontal: 'center' }, border: makeBorder('medium') } });
  }

  cellStyles.forEach(({ r, c, s }) => {
    const cell = ws[XLSX.utils.encode_cell({ r, c: c ?? 0 })];
    if (cell) applyStyle(cell, s);
  });

  ws['!merges'] = [
    XLSX.utils.decode_range('A1:J1'),
    XLSX.utils.decode_range('A2:J2'),
    XLSX.utils.decode_range('A3:J3'),
    XLSX.utils.decode_range('A5:J5'),
  ];

  ws['!cols'] = [{ wch: 5 }, { wch: 22 }, { wch: 10 }, { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 14 }];
  ws['!rows'] = [{ hpt: 40 }, { hpt: 22 }, { hpt: 6 }, { hpt: 10 }, { hpt: 28 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'قائمة الموظفين');
  XLSX.writeFile(wb, `قائمة_الموظفين_${dateStr.replace(/\s+/g, '_')}.xlsx`);
}
