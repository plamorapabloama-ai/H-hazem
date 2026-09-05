import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * توليد ترويسة HTML احترافية للشركة (تُعرض عبر html2canvas)
 */
function buildCompanyHeaderHtml(companyName, companyDetails = {}) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  const details = [];
  if (companyDetails.commercialRegister) details.push('س.ت: ' + companyDetails.commercialRegister);
  if (companyDetails.taxNumber) details.push('ب.ض: ' + companyDetails.taxNumber);
  if (companyDetails.insuranceNumber) details.push('رقم التأمين: ' + companyDetails.insuranceNumber);
  if (companyDetails.address) details.push(companyDetails.address);

  return `
    <div style="width:calc(100% + 40px); margin:-20px -20px 15px -20px; box-sizing:border-box; direction:rtl; background:#18181b; color:white; border-top:4px solid #f97316; border-bottom:3px solid #f97316; padding:18px 20px; display:flex; align-items:center; justify-content:space-between; gap:20px; break-inside:avoid; page-break-inside:avoid; overflow:hidden;">
      <div style="flex:1; min-width:0; text-align:right;">
        <div style="font-size:18px; font-weight:900; line-height:1.6; white-space:nowrap;">${companyName || ''}</div>
        <div style="font-size:9.5px; color:#d4d4d8; line-height:1.8; margin-top:4px; overflow-wrap:anywhere; word-break:normal;">${details.join('  •  ')}</div>
      </div>
      <div style="flex:0 0 auto; min-width:120px; text-align:left; direction:rtl; white-space:nowrap;">
        <div style="font-size:10px; color:#ffffff; line-height:1.7;">تاريخ الإصدار: <strong>${dateStr}</strong></div>
      </div>
    </div>
  `;
}

/**
 * توليد تذييل HTML احترافي (يُعرض عبر html2canvas)
 */
function buildCompanyFooterHtml(companyName) {
  return `
    <div style="margin-top:20px; padding-top:10px; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; font-size:8px; color:#94a3b8;">
      <span>${companyName || ''}</span>
      <span>نظام إدارة المرتبات والموارد البشرية المصري</span>
      <span>سري - للإدارة فقط</span>
    </div>
  `;
}

/**
 * تنسيق الرقم السالب مع علامة الطرح في مكان صحيح (يمين الرقم في RTL)
 */
function formatNegative(amount) {
  if (amount === 0) return '٠';
  const abs = Math.abs(amount).toLocaleString('ar-EG');
  return abs + ' -';
}

/**
 * تصدير PDF من عنصر HTML موجود في الصفحة
 */
export async function generatePdfFromElement(elementId, fileName = 'document.pdf', orientation = 'portrait', companyName = '', companyDetails = {}) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found:', elementId);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 15;

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= (pdfHeight - 15 - 15);

    let pageNum = 1;
    while (heightLeft > 0) {
      pdf.addPage();
      pageNum++;
      position = heightLeft - imgHeight + 15;
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 15 - 15);
    }

    for (let i = 1; i <= pageNum; i++) {
      pdf.setPage(i);
      pdf.setFontSize(7);
      pdf.setTextColor(150);
      pdf.text(`Page ${i} of ${pageNum}`, pdfWidth / 2, pdfHeight - 6, { align: 'center' });
    }

    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    window.print();
  }
}

/**
 * تصدير PDF مسير رواتب وأجور — يطابق المعاينة الرسمية تماماً (12 عمود + توقيع المستلم + التوقيعات)
 */
export async function generatePayrollPdf(payrollData, monthYear, settings, orientation = 'landscape') {
  const pdf = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - 20;

  const totalNet = payrollData.reduce((a, b) => a + b.netSalary, 0);
  const totalEmpIns = payrollData.reduce((a, b) => a + b.socialInsuranceEmployee, 0);
  const totalTax = payrollData.reduce((a, b) => a + b.incomeTax, 0);

  // ─── الترويسة (مطابقة للمعاينة) ───
  const headerHtml = `
    <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #0f172a; padding-bottom:12px; margin-bottom:14px; direction:rtl;">
      <div style="text-align:right;">
        <div style="font-size:16px; font-weight:900; color:#0f172a;">${settings.company.name || ''}</div>
        <div style="font-size:11px; color:#475569; margin-top:2px;">س.ت: ${settings.company.commercialRegister || ''} • ب.ض: ${settings.company.taxNumber || ''}</div>
        <div style="font-size:11px; color:#475569;">${settings.company.address || ''}</div>
      </div>
      <div style="text-align:left;">
        <div style="font-size:13px; font-weight:900; background:#0f172a; color:white; padding:4px 12px; border-radius:6px; display:inline-block;">كشف مسير رواتب وأجور</div>
        <div style="font-size:11px; font-weight:700; color:#334155; margin-top:4px;">عن شهر: ${monthYear}</div>
      </div>
    </div>
  `;

  // ─── جدول الرواتب الرسمي (مطابق للمعاينة 100%) ───
  const cellBorder = '1px solid #cbd5e1';
  const rowBorder = '1px solid #e2e8f0';

  let tableHtml = `
    <table style="width:100%; border-collapse:collapse; direction:rtl; font-size:10px;">
      <thead>
        <tr style="background:#f1f5f9; font-weight:700;">
          <th style="padding:6px 4px; border-left:${cellBorder}; border-bottom:1px solid #cbd5e1; text-align:center;">م</th>
          <th style="padding:6px 4px; border-left:${cellBorder}; border-bottom:1px solid #cbd5e1; text-align:right;">اسم الموظف</th>
          <th style="padding:6px 4px; border-left:${cellBorder}; border-bottom:1px solid #cbd5e1; text-align:right;">الوظيفة</th>
          <th style="padding:6px 4px; border-left:${cellBorder}; border-bottom:1px solid #cbd5e1; text-align:center;">الأساسي</th>
          <th style="padding:6px 4px; border-left:${cellBorder}; border-bottom:1px solid #cbd5e1; text-align:center;">المتغير</th>
          <th style="padding:6px 4px; border-left:${cellBorder}; border-bottom:1px solid #cbd5e1; text-align:center;">إضافي ومكافآت</th>
          <th style="padding:6px 4px; border-left:${cellBorder}; border-bottom:1px solid #cbd5e1; text-align:center; font-weight:900;">إجمالي الأجر</th>
          <th style="padding:6px 4px; border-left:${cellBorder}; border-bottom:1px solid #cbd5e1; text-align:center;">تأمينات 11%</th>
          <th style="padding:6px 4px; border-left:${cellBorder}; border-bottom:1px solid #cbd5e1; text-align:center;">ضريبة الدخل</th>
          <th style="padding:6px 4px; border-left:${cellBorder}; border-bottom:1px solid #cbd5e1; text-align:center;">خصومات وسلف</th>
          <th style="padding:6px 4px; border-left:${cellBorder}; border-bottom:1px solid #cbd5e1; text-align:center; font-weight:900; background:#e2e8f0;">الصافي</th>
          <th style="padding:6px 4px; border-bottom:1px solid #cbd5e1; text-align:center;">توقيع المستلم</th>
        </tr>
      </thead>
      <tbody>
  `;

  payrollData.forEach((row, idx) => {
    const extras = row.overtimePay + row.bonuses + row.missionAllowances;
    const deductions = row.absenceDeduction + row.penaltyDeduction + row.loansAndAdvances + row.otherDeductions;
    tableHtml += `
      <tr style="border-bottom:${rowBorder};">
        <td style="padding:6px 4px; border-left:${rowBorder}; text-align:center;">${idx + 1}</td>
        <td style="padding:6px 4px; border-left:${rowBorder}; text-align:right; font-weight:700;">${row.employeeName}</td>
        <td style="padding:6px 4px; border-left:${rowBorder}; text-align:right;">${row.jobTitle}</td>
        <td style="padding:6px 4px; border-left:${rowBorder}; text-align:center;">${row.basicSalary.toLocaleString('ar-EG')}</td>
        <td style="padding:6px 4px; border-left:${rowBorder}; text-align:center;">${row.variableSalary.toLocaleString('ar-EG')}</td>
        <td style="padding:6px 4px; border-left:${rowBorder}; text-align:center;">${extras.toLocaleString('ar-EG')}</td>
        <td style="padding:6px 4px; border-left:${rowBorder}; text-align:center; font-weight:700;">${row.totalEntitlements.toLocaleString('ar-EG')}</td>
        <td style="padding:6px 4px; border-left:${rowBorder}; text-align:center; color:#e11d48;">${row.socialInsuranceEmployee.toLocaleString('ar-EG')}</td>
        <td style="padding:6px 4px; border-left:${rowBorder}; text-align:center; color:#e11d48;">${row.incomeTax.toLocaleString('ar-EG')}</td>
        <td style="padding:6px 4px; border-left:${rowBorder}; text-align:center; color:#e11d48;">${deductions.toLocaleString('ar-EG')}</td>
        <td style="padding:6px 4px; border-left:${rowBorder}; text-align:center; font-weight:900; background:#f8fafc; color:#c2410c;">${row.netSalary.toLocaleString('ar-EG')}</td>
        <td style="padding:6px 4px; text-align:center;"></td>
      </tr>
    `;
  });

  tableHtml += `
        <tr style="background:#f1f5f9; font-weight:700; border-top:2px solid #94a3b8;">
          <td colspan="3" style="padding:6px 4px; border-left:${cellBorder}; text-align:center;">الإجمالي العام:</td>
          <td style="padding:6px 4px; border-left:${cellBorder}; text-align:center;">${payrollData.reduce((a, b) => a + b.basicSalary, 0).toLocaleString('ar-EG')}</td>
          <td style="padding:6px 4px; border-left:${cellBorder}; text-align:center;">${payrollData.reduce((a, b) => a + b.variableSalary, 0).toLocaleString('ar-EG')}</td>
          <td style="padding:6px 4px; border-left:${cellBorder}; text-align:center;">${payrollData.reduce((a, b) => a + (b.overtimePay + b.bonuses + b.missionAllowances), 0).toLocaleString('ar-EG')}</td>
          <td style="padding:6px 4px; border-left:${cellBorder}; text-align:center;">${payrollData.reduce((a, b) => a + b.totalEntitlements, 0).toLocaleString('ar-EG')}</td>
          <td style="padding:6px 4px; border-left:${cellBorder}; text-align:center;">${totalEmpIns.toLocaleString('ar-EG')}</td>
          <td style="padding:6px 4px; border-left:${cellBorder}; text-align:center;">${totalTax.toLocaleString('ar-EG')}</td>
          <td style="padding:6px 4px; border-left:${cellBorder}; text-align:center;">${payrollData.reduce((a, b) => a + (b.absenceDeduction + b.penaltyDeduction + b.loansAndAdvances + b.otherDeductions), 0).toLocaleString('ar-EG')}</td>
          <td style="padding:6px 4px; border-left:${cellBorder}; text-align:center; font-weight:900;">${totalNet.toLocaleString('ar-EG')} ج.م</td>
          <td style="padding:6px 4px;"></td>
        </tr>
      </tbody>
    </table>
  `;

  // ─── التوقيعات والاعتمادات الرسمية (مطابقة للمعاينة) ───
  const signaturesHtml = `
    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:20px; text-align:center; font-size:11px; font-weight:700; padding-top:26px; margin-top:26px; border-top:1px solid #e2e8f0;">
      <div>
        <p style="color:#64748b; margin:0 0 22px;">إعداد / أخصائي الموارد البشرية</p>
        <div style="border-bottom:1.5px dashed #94a3b8; width:128px; margin:0 auto;"></div>
      </div>
      <div>
        <p style="color:#64748b; margin:0 0 22px;">المراجعة / الإدارة المالية</p>
        <div style="border-bottom:1.5px dashed #94a3b8; width:128px; margin:0 auto;"></div>
      </div>
      <div>
        <p style="color:#64748b; margin:0 0 22px;">اعتماد المدير العام / ختم الشركة</p>
        <div style="border-bottom:1.5px dashed #94a3b8; width:128px; margin:0 auto;"></div>
      </div>
    </div>
  `;

  const footerHtml = buildCompanyFooterHtml(settings.company.name);
  const fullHtml = headerHtml + tableHtml + signaturesHtml + footerHtml;

  const container = document.createElement('div');
  container.style.cssText = `
    position:fixed; left:-9999px; top:0;
    width:${contentWidth * 3.78}px;
    font-family:'Cairo',Arial,sans-serif;
    direction:rtl; background:white; color:#0f172a;
    padding:20px; line-height:1.5;
  `;
  container.innerHTML = fullHtml;
  document.body.appendChild(container);

  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    width: contentWidth * 3.78,
    windowWidth: contentWidth * 3.78
  });

  document.body.removeChild(container);

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = contentWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const startY = 10;
  const availableHeight = pageHeight - startY - 12;

  if (imgHeight <= availableHeight) {
    pdf.addImage(imgData, 'PNG', 10, startY, imgWidth, imgHeight);
  } else {
    let sourceY = 0;
    let isFirstPage = true;
    while (sourceY < canvas.height) {
      if (!isFirstPage) pdf.addPage();
      const sliceH = Math.min(availableHeight * (canvas.width / imgWidth), canvas.height - sourceY);
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceH;
      sliceCanvas.getContext('2d').drawImage(canvas, 0, sourceY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
      const sliceData = sliceCanvas.toDataURL('image/png');
      const actualH = (sliceH * imgWidth) / canvas.width;
      pdf.addImage(sliceData, 'PNG', 10, isFirstPage ? startY : 10, imgWidth, actualH);
      sourceY += sliceH;
      isFirstPage = false;
    }
  }

  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(6);
    pdf.setTextColor(150);
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
  }

  pdf.save('مسير_رواتب_' + monthYear.replace('/', '-') + '.pdf');
}

/**
 * تصدير PDF قسيمة راتب فردية — كل المحتوى العربي يُعرض عبر html2canvas
 */
export async function generatePayslipPdf(payslipData, settings, monthYear) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - 20;

  const headerHtml = buildCompanyHeaderHtml(settings.company.name, settings.company);

  const titleHtml = `
    <div style="text-align:center; margin-bottom:15px;">
      <h2 style="font-size:20px; font-weight:900; color:#1e1e1e; margin:0;">بيان مفردات مرتب</h2>
      <p style="font-size:12px; color:#64748b; margin:4px 0 0 0;">شهر: ${monthYear}</p>
    </div>
  `;

  const earnings = [
    ['الراتب الأساسي', payslipData.basicSalary],
    ['الراتب المتغير', payslipData.variableSalary],
    ['البدلات الثابتة', payslipData.fixedAllowances],
    ['العمل الإضافي', payslipData.overtimePay],
    ['المكافآت', payslipData.bonuses],
    ['بدلات مأمورية', payslipData.missionAllowances]
  ].filter(e => e[1] > 0);

  const deductions = [
    ['تأمينات اجتماعية (11%)', payslipData.socialInsuranceEmployee],
    ['ضريبة كسب العمل', payslipData.incomeTax],
    ['صندوق الشهداء', payslipData.martyrsFund],
    ['خصم غياب', payslipData.absenceDeduction],
    ['جزاءات إدارية', payslipData.penaltyDeduction],
    ['سلف وخصومات', payslipData.loansAndAdvances + payslipData.otherDeductions]
  ].filter(d => d[1] > 0);

  const earningsRows = earnings.map(([label, amount]) => `
    <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid #f1f5f9;">
      <span style="color:#475569; font-size:11px;">${label}</span>
      <span style="font-weight:700; color:#1e293b; font-size:11px; direction:ltr;">${amount.toLocaleString('ar-EG')} ج.م</span>
    </div>
  `).join('');

  const deductionsRows = deductions.map(([label, amount]) => `
    <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid #f1f5f9;">
      <span style="color:#475569; font-size:11px;">${label}</span>
      <span style="font-weight:700; color:#e11d48; font-size:11px; direction:ltr;">${formatNegative(amount)} ج.م</span>
    </div>
  `).join('');

  const employeeHtml = `
    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; margin-bottom:15px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; font-size:11px;">
      <div><span style="color:#94a3b8; font-size:10px;">اسم الموظف:</span><br/><strong style="color:#1e293b;">${payslipData.employeeName}</strong></div>
      <div><span style="color:#94a3b8; font-size:10px;">كود الموظف:</span><br/><strong style="color:#1e293b;">${payslipData.employeeId}</strong></div>
      <div><span style="color:#94a3b8; font-size:10px;">الرقم القومي:</span><br/><strong style="color:#1e293b;">${payslipData.nationalId || '---'}</strong></div>
      <div><span style="color:#94a3b8; font-size:10px;">الوظيفة:</span><br/><strong style="color:#1e293b;">${payslipData.jobTitle}</strong></div>
      <div><span style="color:#94a3b8; font-size:10px;">القسم:</span><br/><strong style="color:#1e293b;">${payslipData.department}</strong></div>
      <div><span style="color:#94a3b8; font-size:10px;">الرقم التأميني:</span><br/><strong style="color:#1e293b;">${payslipData.insuranceNumber || '---'}</strong></div>
    </div>
  `;

  const sectionsHtml = `
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:15px;">
      <div style="border:1px solid #fed7aa; border-radius:8px; overflow:hidden;">
        <div style="background:#f97316; color:white; padding:8px 10px; font-weight:900; font-size:12px; display:flex; justify-content:space-between;">
          <span>بيان الاستحقاقات (+)</span>
          <span>المبلغ (ج.م)</span>
        </div>
        <div style="padding:8px 10px;">${earningsRows}</div>
        <div style="background:#fff7ed; padding:8px 10px; border-top:1px solid #fed7aa; display:flex; justify-content:space-between; font-weight:900; font-size:12px; color:#9a3412;">
          <span>إجمالي الاستحقاقات:</span>
          <span style="direction:ltr;">${payslipData.totalEntitlements.toLocaleString('ar-EG')} ج.م</span>
        </div>
      </div>
      <div style="border:1px solid #fecdd3; border-radius:8px; overflow:hidden;">
        <div style="background:#e11d48; color:white; padding:8px 10px; font-weight:900; font-size:12px; display:flex; justify-content:space-between;">
          <span>بيان الاستقطاعات (-)</span>
          <span>المبلغ (ج.م)</span>
        </div>
        <div style="padding:8px 10px;">${deductionsRows}</div>
        <div style="background:#fff1f2; padding:8px 10px; border-top:1px solid #fecdd3; display:flex; justify-content:space-between; font-weight:900; font-size:12px; color:#9f1239;">
          <span>إجمالي الاستقطاعات:</span>
          <span style="direction:ltr;">${formatNegative(payslipData.totalDeductions)} ج.م</span>
        </div>
      </div>
    </div>
  `;

  const netHtml = `
    <div style="background:linear-gradient(135deg, #1e1e1e, #7c2d12); color:white; border-radius:12px; padding:15px; display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
      <div>
        <span style="color:#fdba74; font-size:11px; font-weight:700;">صافي الراتب المستحق للصرف:</span>
        <div style="font-size:26px; font-weight:900; color:#f97316; margin-top:4px; direction:ltr; text-align:right;">
          ${payslipData.netSalary.toLocaleString('ar-EG')} <span style="font-size:13px; font-weight:400; color:white;">ج.م</span>
        </div>
      </div>
      <div style="text-align:center; background:rgba(255,255,255,0.1); padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.2);">
        <span style="display:block; color:#cbd5e1; font-size:10px;">طريقة الصرف:</span>
        <strong style="display:block; color:white; font-size:12px; margin-top:2px;">${payslipData.bankAccount ? 'تحويل بنكي' : 'خزينة المنشأة'}</strong>
        <span style="font-size:10px; color:#fdba74;">${payslipData.bankAccount || 'نقداً'}</span>
      </div>
    </div>
  `;

  const signaturesHtml = `
    <div style="display:flex; justify-content:space-between; padding-top:20px; border-top:2px solid #e2e8f0; margin-top:25px;">
      <div style="text-align:center; width:40%;">
        <p style="font-size:11px; color:#64748b; font-weight:700;">إدارة الموارد البشرية والحسابات</p>
        <div style="margin-top:30px; border-bottom:2px dashed #94a3b8; width:80%; margin:30px auto 0;"></div>
      </div>
      <div style="text-align:center; width:40%;">
        <p style="font-size:11px; color:#64748b; font-weight:700;">توقيع واستلام الموظف</p>
        <div style="margin-top:30px; border-bottom:2px dashed #94a3b8; width:80%; margin:30px auto 0;"></div>
      </div>
    </div>
  `;

  const footerHtml = buildCompanyFooterHtml(settings.company.name);
  const fullHtml = headerHtml + titleHtml + employeeHtml + sectionsHtml + netHtml + signaturesHtml + footerHtml;

  const container = document.createElement('div');
  container.style.cssText = `
    position:fixed; left:-9999px; top:0;
    width:${contentWidth * 3.78}px;
    font-family:'Cairo',Arial,sans-serif;
    direction:rtl; background:white; color:#1e293b;
    padding:20px; line-height:1.5;
  `;
  container.innerHTML = fullHtml;
  document.body.appendChild(container);

  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    width: contentWidth * 3.78,
    windowWidth: contentWidth * 3.78
  });

  document.body.removeChild(container);

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = contentWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const startY = 10;
  const availableHeight = pageHeight - startY - 12;

  if (imgHeight <= availableHeight) {
    pdf.addImage(imgData, 'PNG', 10, startY, imgWidth, imgHeight);
  } else {
    let sourceY = 0;
    let isFirstPage = true;
    while (sourceY < canvas.height) {
      if (!isFirstPage) pdf.addPage();
      const sliceH = Math.min(availableHeight * (canvas.width / imgWidth), canvas.height - sourceY);
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceH;
      sliceCanvas.getContext('2d').drawImage(canvas, 0, sourceY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
      const sliceData = sliceCanvas.toDataURL('image/png');
      const actualH = (sliceH * imgWidth) / canvas.width;
      pdf.addImage(sliceData, 'PNG', 10, isFirstPage ? startY : 10, imgWidth, actualH);
      sourceY += sliceH;
      isFirstPage = false;
    }
  }

  pdf.save('قسيمة_راتب_' + payslipData.employeeName + '_' + monthYear.replace('/', '-') + '.pdf');
}

/**
 * تصدير PDF إقرار ضريبة كسب العمل الشهري — تصميم احترافي ERP
 */
export async function generateTaxReportPdf(payrollData, monthYear, settings) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - 20;

  // حساب الإجماليات
  const totalTax = payrollData.reduce((a, c) => a + c.incomeTax, 0);
  const totalMartyrs = payrollData.reduce((a, c) => a + c.martyrsFund, 0);
  const totalEmpIns = payrollData.reduce((a, c) => a + c.socialInsuranceEmployee, 0);
  const totalCompanyIns = payrollData.reduce((a, c) => a + c.socialInsuranceEmployer, 0);
  const totalGross = payrollData.reduce((a, c) => a + c.totalEntitlements, 0);
  const totalNet = payrollData.reduce((a, c) => a + c.netSalary, 0);

  const details = [];
  if (settings.company.commercialRegister) details.push('س.ت: ' + settings.company.commercialRegister);
  if (settings.company.taxNumber) details.push('ب.ض: ' + settings.company.taxNumber);
  if (settings.company.insuranceNumber) details.push('رقم التأمين: ' + settings.company.insuranceNumber);
  if (settings.company.address) details.push(settings.company.address);

  const now = new Date();
  const dateStr = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

  // ─── الترويسة السوداء الكاملة العرض ───
  const headerHtml = `
    <div style="width:calc(100% + 40px); margin:-20px -20px 15px -20px; box-sizing:border-box; direction:rtl; background:#18181b; color:white; border-top:4px solid #f97316; border-bottom:3px solid #f97316; padding:18px 20px; display:flex; align-items:center; justify-content:space-between; gap:20px; break-inside:avoid; page-break-inside:avoid; overflow:hidden;">
      <div style="flex:1; min-width:0; text-align:right;">
        <div style="font-size:18px; font-weight:900; line-height:1.6; white-space:nowrap;">${settings.company.name || ''}</div>
        <div style="font-size:9.5px; color:#d4d4d8; line-height:1.8; margin-top:4px; overflow-wrap:anywhere; word-break:normal;">${details.join('  •  ')}</div>
      </div>
      <div style="flex:0 0 auto; min-width:120px; text-align:left; direction:rtl; white-space:nowrap;">
        <div style="font-size:10px; color:#ffffff; line-height:1.7;">تاريخ الإصدار: <strong>${dateStr}</strong></div>
      </div>
    </div>
  `;

  // ─── العنوان الرئيسي ───
  const titleHtml = `
    <div style="text-align:center; margin-bottom:15px;">
      <div style="font-size:20px; font-weight:800; color:#09090b; margin-bottom:4px;">إقرار ضريبة كسب العمل الشهري</div>
      <div style="font-size:11px; color:#71717a; font-weight:600;">شهر: ${monthYear}  —  تاريخ الإصدار: ${dateStr}</div>
    </div>
  `;

  // ─── كروت الملخص الإحصائي (2×2) ───
  const cardsHtml = `
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:18px;">
      <div style="background:#fff7ed; border:1px solid #ffedd5; border-radius:8px; padding:12px 14px; text-align:center;">
        <div style="font-size:10px; color:#9a3412; font-weight:700; margin-bottom:6px;">إجمالي الضريبة المستحقة</div>
        <div style="font-size:19px; font-weight:800; color:#c2410c; font-family:monospace, sans-serif;">${totalTax.toLocaleString('ar-EG')} ج.م</div>
      </div>
      <div style="background:#fff1f2; border:1px solid #ffe4e6; border-radius:8px; padding:12px 14px; text-align:center;">
        <div style="font-size:10px; color:#be123c; font-weight:700; margin-bottom:6px;">مساهمة تكريم الشهداء</div>
        <div style="font-size:19px; font-weight:800; color:#be123c; font-family:monospace, sans-serif;">${totalMartyrs.toLocaleString('ar-EG')} ج.م</div>
      </div>
      <div style="background:#eff6ff; border:1px solid #dbeafe; border-radius:8px; padding:12px 14px; text-align:center;">
        <div style="font-size:10px; color:#1d4ed8; font-weight:700; margin-bottom:6px;">إجمالي التأمينات (حصة العامل 11%)</div>
        <div style="font-size:19px; font-weight:800; color:#1d4ed8; font-family:monospace, sans-serif;">${totalEmpIns.toLocaleString('ar-EG')} ج.م</div>
      </div>
      <div style="background:#f0fdf4; border:1px solid #dcfce7; border-radius:8px; padding:12px 14px; text-align:center;">
        <div style="font-size:10px; color:#15803d; font-weight:700; margin-bottom:6px;">إجمالي التأمينات (حصة المنشأة 18.75%)</div>
        <div style="font-size:19px; font-weight:800; color:#15803d; font-family:monospace, sans-serif;">${totalCompanyIns.toLocaleString('ar-EG')} ج.م</div>
      </div>
    </div>
  `;

  // ─── جدول البيانات ───
  let tableHtml = `
    <table style="width:100%; border-collapse:collapse; font-size:10px; direction:rtl; margin-bottom:20px;">
      <thead>
        <tr style="background:#18181b; color:white;">
          <th style="width:5%; padding:8px 4px; border:1px solid #27272a; text-align:center; font-weight:700;">م</th>
          <th style="width:25%; padding:8px 4px; border:1px solid #27272a; text-align:right; font-weight:700; padding-right:10px;">اسم الموظف</th>
          <th style="width:14%; padding:8px 4px; border:1px solid #27272a; text-align:center; font-weight:700;">الراتب الإجمالي</th>
          <th style="width:14%; padding:8px 4px; border:1px solid #27272a; text-align:center; font-weight:700;">ضريبة كسب العمل</th>
          <th style="width:14%; padding:8px 4px; border:1px solid #27272a; text-align:center; font-weight:700;">تأمينات العامل</th>
          <th style="width:14%; padding:8px 4px; border:1px solid #27272a; text-align:center; font-weight:700;">صندوق الشهداء</th>
          <th style="width:14%; padding:8px 4px; border:1px solid #27272a; text-align:center; font-weight:700;">صافي الراتب</th>
        </tr>
      </thead>
      <tbody>
  `;

  payrollData.forEach((row, idx) => {
    const bg = idx % 2 === 0 ? '#ffffff' : '#fcfcfd';
    tableHtml += `
      <tr style="background:${bg};">
        <td style="padding:7px 4px; border:1px solid #e4e4e7; text-align:center; color:#71717a; font-weight:500;">${idx + 1}</td>
        <td style="padding:7px 4px; border:1px solid #e4e4e7; text-align:right; padding-right:10px; font-weight:600; color:#1f2937;">${row.employeeName}</td>
        <td style="padding:7px 4px; border:1px solid #e4e4e7; text-align:center; font-weight:600; color:#374151;">${row.totalEntitlements.toLocaleString('ar-EG')}</td>
        <td style="padding:7px 4px; border:1px solid #e4e4e7; text-align:center; font-weight:700; color:#dc2626;">${row.incomeTax.toLocaleString('ar-EG')}</td>
        <td style="padding:7px 4px; border:1px solid #e4e4e7; text-align:center; font-weight:600; color:#dc2626;">${row.socialInsuranceEmployee.toLocaleString('ar-EG')}</td>
        <td style="padding:7px 4px; border:1px solid #e4e4e7; text-align:center; font-weight:600; color:#dc2626;">${row.martyrsFund.toLocaleString('ar-EG')}</td>
        <td style="padding:7px 4px; border:1px solid #e4e4e7; text-align:center; font-weight:800; color:#ea580c;">${row.netSalary.toLocaleString('ar-EG')}</td>
      </tr>
    `;
  });

  // صف الإجماليات
  tableHtml += `
        <tr style="background:#ea580c; color:white;">
          <td style="padding:9px 4px; border:1px solid #c2410c; font-weight:700;" colspan="2">الإجمالي</td>
          <td style="padding:9px 4px; border:1px solid #c2410c; text-align:center; font-weight:800; font-size:11px;">${totalGross.toLocaleString('ar-EG')}</td>
          <td style="padding:9px 4px; border:1px solid #c2410c; text-align:center; font-weight:800; font-size:11px;">${totalTax.toLocaleString('ar-EG')}</td>
          <td style="padding:9px 4px; border:1px solid #c2410c; text-align:center; font-weight:800; font-size:11px;">${totalEmpIns.toLocaleString('ar-EG')}</td>
          <td style="padding:9px 4px; border:1px solid #c2410c; text-align:center; font-weight:800; font-size:11px;">${totalMartyrs.toLocaleString('ar-EG')}</td>
          <td style="padding:9px 4px; border:1px solid #c2410c; text-align:center; font-weight:900; font-size:12px;">${totalNet.toLocaleString('ar-EG')}</td>
        </tr>
      </tbody>
    </table>
  `;

  // ─── التوقيعات ───
  const signaturesHtml = `
    <div style="display:flex; justify-content:space-between; padding-top:15px; border-top:2px solid #e5e7eb; margin-top:10px; gap:15px;">
      <div style="text-align:center; flex:1; padding:0 8px;">
        <div style="font-size:9px; font-weight:700; color:#4b5563; margin-bottom:10px;">إعداد / محاسب رواتب</div>
        <div style="border-bottom:1.5px dashed #9ca3af; width:120px; margin:0 auto;"></div>
      </div>
      <div style="text-align:center; flex:1; padding:0 8px;">
        <div style="font-size:9px; font-weight:700; color:#4b5563; margin-bottom:10px;">المراجعة / الإدارة المالية</div>
        <div style="border-bottom:1.5px dashed #9ca3af; width:120px; margin:0 auto;"></div>
      </div>
      <div style="text-align:center; flex:1; padding:0 8px;">
        <div style="font-size:9px; font-weight:700; color:#4b5563; margin-bottom:10px;">اعتماد / مدير المنشأة</div>
        <div style="border-bottom:1.5px dashed #9ca3af; width:120px; margin:0 auto;"></div>
      </div>
    </div>
  `;

  // ─── التذييل ───
  const footerHtml = `
    <div style="margin-top:15px; padding-top:8px; border-top:1px solid #e5e7eb; display:flex; justify-content:space-between; font-size:7.5px; color:#9ca3af; align-items:center;">
      <span>${settings.company.name || ''}</span>
      <span style="font-size:6.5px; color:#d4d4d8;">سري - للإدارة فقط</span>
      <span>نظام إدارة المرتبات والموارد البشرية المصري</span>
    </div>
  `;

  const fullHtml = headerHtml + titleHtml + cardsHtml + tableHtml + signaturesHtml + footerHtml;

  // ─── تحويل HTML إلى PDF ───
  const container = document.createElement('div');
  container.style.cssText = `
    position:fixed; left:-9999px; top:0;
    width:${contentWidth * 3.78}px;
    font-family:'Cairo','Segoe UI',Tahoma,Arial,sans-serif;
    direction:rtl; background:white; color:#1f2937;
    padding:20px; line-height:1.5;
    -webkit-print-color-adjust:exact; print-color-adjust:exact;
  `;
  container.innerHTML = fullHtml;
  document.body.appendChild(container);

  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    width: contentWidth * 3.78,
    windowWidth: contentWidth * 3.78
  });

  document.body.removeChild(container);

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = contentWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const startY = 10;
  const availableHeight = pageHeight - startY - 12;

  if (imgHeight <= availableHeight) {
    pdf.addImage(imgData, 'PNG', 10, startY, imgWidth, imgHeight);
  } else {
    let sourceY = 0;
    let isFirstPage = true;
    while (sourceY < canvas.height) {
      if (!isFirstPage) pdf.addPage();
      const sliceH = Math.min(availableHeight * (canvas.width / imgWidth), canvas.height - sourceY);
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceH;
      sliceCanvas.getContext('2d').drawImage(canvas, 0, sourceY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
      const sliceData = sliceCanvas.toDataURL('image/png');
      const actualH = (sliceH * imgWidth) / canvas.width;
      pdf.addImage(sliceData, 'PNG', 10, isFirstPage ? startY : 10, imgWidth, actualH);
      sourceY += sliceH;
      isFirstPage = false;
    }
  }

  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(6);
    pdf.setTextColor(154);
    pdf.text(`صفحة ${i} من ${totalPages}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
  }

  pdf.save('اقرار_ضريبة_كسب_العمل_' + monthYear.replace('/', '-') + '.pdf');
}

// ═══════════════════════════════════════════════════════════════
// تقارير إضافية
// ═══════════════════════════════════════════════════════════════

/**
 * شهادة راتب شهرية — للموظف (للبنوك، القروض، التأشيرات)
 */
export async function generateSalaryCertificatePdf(empData, monthYear, settings) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const contentWidth = pageWidth - 20;

  const now = new Date();
  const dateStr = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  const extras = empData.overtimePay + empData.bonuses + empData.missionAllowances;
  const deductions = empData.absenceDeduction + empData.penaltyDeduction + empData.loansAndAdvances + empData.otherDeductions;
  const annualGross = empData.totalEntitlements * 12;

  const fullHtml = `
    ${buildCompanyHeaderHtml(settings.company.name, settings.company)}
    <div style="text-align:center; margin:20px 0 15px;">
      <h2 style="font-size:20px; font-weight:900; color:#0f172a; margin:0;">شهادة راتب شهرية</h2>
      <p style="font-size:11px; color:#64748b; margin-top:4px;">شهر: ${monthYear} — صادرة بتاريخ: ${dateStr}</p>
    </div>

    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px; margin-bottom:16px;">
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:11px; color:#334155;">
        <div><b>اسم الموظف:</b> ${empData.employeeName}</div>
        <div><b>الرقم القومي:</b> <span style="font-family:monospace;">${empData.nationalId || '---'}</span></div>
        <div><b>المسمى الوظيفي:</b> ${empData.jobTitle}</div>
        <div><b>القسم:</b> ${empData.department}</div>
        <div><b>الرقم التأميني:</b> <span style="font-family:monospace;">${empData.insuranceNumber || '---'}</span></div>
        <div><b>تاريخ التعيين:</b> ${empData.joinDate || '---'}</div>
        <div><b>عدد أيام العمل هذا الشهر:</b> ${empData.workingDays || 22} يوم</div>
        <div><b>الرصيد المتبقي إجازة سنوية:</b> ${empData.annualLeaveBalance || 21} يوم</div>
      </div>
    </div>

    <table style="width:100%; border-collapse:collapse; font-size:11px; direction:rtl; margin-bottom:16px;">
      <thead>
        <tr style="background:#1e293b; color:white;">
          <th style="padding:8px; border:1px solid #333; text-align:right; width:50%">البيان</th>
          <th style="padding:8px; border:1px solid #333; text-align:center; width:25%">الشهر (ج.م)</th>
          <th style="padding:8px; border:1px solid #333; text-align:center; width:25%">السنوي (ج.م)</th>
        </tr>
      </thead>
      <tbody>
        <tr><td style="padding:7px 8px; border:1px solid #e2e8f0; font-weight:700;">الراتب الأساسي</td><td style="padding:7px 8px; border:1px solid #e2e8f0; text-align:center;">${empData.basicSalary.toLocaleString('ar-EG')}</td><td style="padding:7px 8px; border:1px solid #e2e8f0; text-align:center;">${(empData.basicSalary * 12).toLocaleString('ar-EG')}</td></tr>
        <tr style="background:#f8fafc;"><td style="padding:7px 8px; border:1px solid #e2e8f0; font-weight:700;">الراتب المتغير / البدلات</td><td style="padding:7px 8px; border:1px solid #e2e8f0; text-align:center;">${empData.variableSalary.toLocaleString('ar-EG')}</td><td style="padding:7px 8px; border:1px solid #e2e8f0; text-align:center;">${(empData.variableSalary * 12).toLocaleString('ar-EG')}</td></tr>
        <tr><td style="padding:7px 8px; border:1px solid #e2e8f0; font-weight:700;">إضافي ومكافآت</td><td style="padding:7px 8px; border:1px solid #e2e8f0; text-align:center;">${extras.toLocaleString('ar-EG')}</td><td style="padding:7px 8px; border:1px solid #e2e8f0; text-align:center;">${(extras * 12).toLocaleString('ar-EG')}</td></tr>
        <tr style="background:#f8fafc;"><td style="padding:7px 8px; border:1px solid #e2e8f0; font-weight:900;">إجمالي الأجر الإجمالي (Gross)</td><td style="padding:7px 8px; border:1px solid #e2e8f0; text-align:center; font-weight:900;">${empData.totalEntitlements.toLocaleString('ar-EG')}</td><td style="padding:7px 8px; border:1px solid #e2e8f0; text-align:center; font-weight:900;">${annualGross.toLocaleString('ar-EG')}</td></tr>
        <tr><td style="padding:7px 8px; border:1px solid #e2e8f0; color:#e11d48;">خصم: تأمينات اجتماعية (11%)</td><td style="padding:7px 8px; border:1px solid #e2e8f0; text-align:center; color:#e11d48;">-${empData.socialInsuranceEmployee.toLocaleString('ar-EG')}</td><td style="padding:7px 8px; border:1px solid #e2e8f0; text-align:center; color:#e11d48;">-${(empData.socialInsuranceEmployee * 12).toLocaleString('ar-EG')}</td></tr>
        <tr style="background:#f8fafc;"><td style="padding:7px 8px; border:1px solid #e2e8f0; color:#e11d48;">خصم: ضريبة كسب العمل</td><td style="padding:7px 8px; border:1px solid #e2e8f0; text-align:center; color:#e11d48;">-${empData.incomeTax.toLocaleString('ar-EG')}</td><td style="padding:7px 8px; border:1px solid #e2e8f0; text-align:center; color:#e11d48;">-${(empData.incomeTax * 12).toLocaleString('ar-EG')}</td></tr>
        <tr><td style="padding:7px 8px; border:1px solid #e2e8f0; color:#e11d48;">خصومات وسلف</td><td style="padding:7px 8px; border:1px solid #e2e8f0; text-align:center; color:#e11d48;">-${deductions.toLocaleString('ar-EG')}</td><td style="padding:7px 8px; border:1px solid #e2e8f0; text-align:center; color:#e11d48;">-${(deductions * 12).toLocaleString('ar-EG')}</td></tr>
        <tr style="background:#fff7ed;"><td style="padding:8px; border:2px solid #c2410c; font-weight:900; font-size:12px;">صافي الراتب المستحق للصرف</td><td style="padding:8px; border:2px solid #c2410c; text-align:center; font-weight:900; font-size:12px; color:#c2410c;">${empData.netSalary.toLocaleString('ar-EG')} ج.م</td><td style="padding:8px; border:2px solid #c2410c; text-align:center; font-weight:900; font-size:12px; color:#c2410c;">${(empData.netSalary * 12).toLocaleString('ar-EG')} ج.م</td></tr>
      </tbody>
    </table>

    <div style="background:#eff6ff; border:1px solid #dbeafe; border-radius:10px; padding:12px 16px; margin-bottom:20px; font-size:10px; color:#1e40af;">
      <b>ملاحظة:</b> هذه الشهادة صادرة بناءً على سجلات الرواتب الرسمية للمنشأة ولا تحل محل الإقرار الضريبي السنوي.
      حصة المنشأة من التأمينات: ${empData.socialInsuranceEmployer.toLocaleString('ar-EG')} ج.م شهرياً (لا تخصم من راتب الموظف).
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:30px; margin-top:30px; font-size:11px; font-weight:700;">
      <div style="text-align:center;">
        <p style="color:#64748b; margin:0 0 40px;">توقيع الموظف</p>
        <div style="border-bottom:1.5px dashed #94a3b8; width:140px; margin:0 auto;"></div>
      </div>
      <div style="text-align:center;">
        <p style="color:#64748b; margin:0 0 40px;">اعتماد المدير العام / ختم المنشأة</p>
        <div style="border-bottom:1.5px dashed #94a3b8; width:140px; margin:0 auto;"></div>
      </div>
    </div>

    ${buildCompanyFooterHtml(settings.company.name)}
  `;

  const container = document.createElement('div');
  container.style.cssText = `position:fixed; left:-9999px; top:0; width:${contentWidth * 3.78}px; font-family:'Cairo',Arial,sans-serif; direction:rtl; background:white; color:#0f172a; padding:20px; line-height:1.5;`;
  container.innerHTML = fullHtml;
  document.body.appendChild(container);

  const canvas = await html2canvas(container, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff', width: contentWidth * 3.78, windowWidth: contentWidth * 3.78 });
  document.body.removeChild(container);

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = contentWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const startY = 10;
  const availableHeight = pdf.internal.pageSize.getHeight() - startY - 12;

  if (imgHeight <= availableHeight) {
    pdf.addImage(imgData, 'PNG', 10, startY, imgWidth, imgHeight);
  } else {
    let sourceY = 0;
    let isFirstPage = true;
    while (sourceY < canvas.height) {
      if (!isFirstPage) pdf.addPage();
      const sliceH = Math.min(availableHeight * (canvas.width / imgWidth), canvas.height - sourceY);
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceH;
      sliceCanvas.getContext('2d').drawImage(canvas, 0, sourceY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
      const sliceData = sliceCanvas.toDataURL('image/png');
      pdf.addImage(sliceData, 'PNG', 10, isFirstPage ? startY : 10, imgWidth, (sliceH * imgWidth) / canvas.width);
      sourceY += sliceH;
      isFirstPage = false;
    }
  }

  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(6);
    pdf.setTextColor(154);
    pdf.text(`صفحة ${i} من ${totalPages}`, pageWidth / 2, pdf.internal.pageSize.getHeight() - 5, { align: 'center' });
  }

  pdf.save('شهادة_راتب_' + empData.employeeName + '_' + monthYear.replace('/', '-') + '.pdf');
}

/**
 * تقرير الغياب والخصومات الشهرية
 */
export async function generateAbsenceReportPdf(payrollData, monthYear, settings) {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const contentWidth = pageWidth - 20;

  const employeesWithDeductions = payrollData.filter(e => e.absenceDeduction > 0 || e.penaltyDeduction > 0 || e.loansAndAdvances > 0 || e.otherDeductions > 0);
  const totalAbsence = payrollData.reduce((a, b) => a + b.absenceDeduction, 0);
  const totalPenalty = payrollData.reduce((a, b) => a + b.penaltyDeduction, 0);
  const totalLoans = payrollData.reduce((a, b) => a + b.loansAndAdvances, 0);
  const totalOther = payrollData.reduce((a, b) => a + b.otherDeductions, 0);
  const totalAllDeductions = totalAbsence + totalPenalty + totalLoans + totalOther;

  let tableRows = '';
  employeesWithDeductions.forEach((row, idx) => {
    const bg = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
    tableRows += `<tr style="background:${bg};">
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:center;">${idx + 1}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:right; font-weight:700;">${row.employeeName}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:right;">${row.jobTitle}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:center; color:#e11d48;">${row.absenceDeduction > 0 ? row.absenceDeduction.toLocaleString('ar-EG') : '-'}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:center; color:#e11d48;">${row.penaltyDeduction > 0 ? row.penaltyDeduction.toLocaleString('ar-EG') : '-'}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:center; color:#e11d48;">${row.loansAndAdvances > 0 ? row.loansAndAdvances.toLocaleString('ar-EG') : '-'}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:center; color:#e11d48;">${row.otherDeductions > 0 ? row.otherDeductions.toLocaleString('ar-EG') : '-'}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:center; font-weight:900; color:#c2410c;">${(row.absenceDeduction + row.penaltyDeduction + row.loansAndAdvances + row.otherDeductions).toLocaleString('ar-EG')}</td>
    </tr>`;
  });

  const fullHtml = `
    ${buildCompanyHeaderHtml(settings.company.name, settings.company)}
    <div style="text-align:center; margin-bottom:12px;">
      <h2 style="font-size:18px; font-weight:900; color:#0f172a; margin:0;">تقرير الغياب والخصومات والسلف الشهرية</h2>
      <p style="font-size:11px; color:#64748b; margin-top:4px;">شهر: ${monthYear} — عدد المتأثرين: ${employeesWithDeductions.length} موظف</p>
    </div>

    <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:14px;">
      <div style="background:#fff1f2; border:1px solid #ffe4e6; border-radius:8px; padding:10px; text-align:center;">
        <div style="font-size:10px; color:#be123c; font-weight:700;">خصم غياب</div>
        <div style="font-size:16px; font-weight:900; color:#be123c;">${totalAbsence.toLocaleString('ar-EG')} ج.م</div>
      </div>
      <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:10px; text-align:center;">
        <div style="font-size:10px; color:#dc2626; font-weight:700;">جزاءات إدارية</div>
        <div style="font-size:16px; font-weight:900; color:#dc2626;">${totalPenalty.toLocaleString('ar-EG')} ج.م</div>
      </div>
      <div style="background:#eff6ff; border:1px solid #dbeafe; border-radius:8px; padding:10px; text-align:center;">
        <div style="font-size:10px; color:#1d4ed8; font-weight:700;">سلف وقروض</div>
        <div style="font-size:16px; font-weight:900; color:#1d4ed8;">${totalLoans.toLocaleString('ar-EG')} ج.م</div>
      </div>
      <div style="background:#f0fdf4; border:1px solid #dcfce7; border-radius:8px; padding:10px; text-align:center;">
        <div style="font-size:10px; color:#16a34a; font-weight:700;">إجمالي الخصومات</div>
        <div style="font-size:16px; font-weight:900; color:#16a34a;">${totalAllDeductions.toLocaleString('ar-EG')} ج.م</div>
      </div>
    </div>

    ${employeesWithDeductions.length === 0 ? '<div style="padding:30px; text-align:center; color:#94a3b8; font-size:12px;">لا توجد خصومات أو غياب مسجل هذا الشهر.</div>' : `
    <table style="width:100%; border-collapse:collapse; font-size:10px; direction:rtl;">
      <thead>
        <tr style="background:#1e1e1e; color:white;">
          <th style="padding:7px 3px; border:1px solid #333; text-align:center;">م</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:right;">اسم الموظف</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:right;">الوظيفة</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:center;">خصم غياب</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:center;">جزاءات</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:center;">سلف</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:center;">أخرى</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:center;">الإجمالي</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
      <tfoot>
        <tr style="background:#f97316; color:white; font-weight:900;">
          <td colspan="3" style="padding:7px 3px; border:1px solid #ea580c; text-align:center;">الإجمالي</td>
          <td style="padding:7px 3px; border:1px solid #ea580c; text-align:center;">${totalAbsence.toLocaleString('ar-EG')}</td>
          <td style="padding:7px 3px; border:1px solid #ea580c; text-align:center;">${totalPenalty.toLocaleString('ar-EG')}</td>
          <td style="padding:7px 3px; border:1px solid #ea580c; text-align:center;">${totalLoans.toLocaleString('ar-EG')}</td>
          <td style="padding:7px 3px; border:1px solid #ea580c; text-align:center;">${totalOther.toLocaleString('ar-EG')}</td>
          <td style="padding:7px 3px; border:1px solid #ea580c; text-align:center;">${totalAllDeductions.toLocaleString('ar-EG')} ج.م</td>
        </tr>
      </tfoot>
    </table>`}

    ${buildCompanyFooterHtml(settings.company.name)}
  `;

  const container = document.createElement('div');
  container.style.cssText = `position:fixed; left:-9999px; top:0; width:${contentWidth * 3.78}px; font-family:'Cairo',Arial,sans-serif; direction:rtl; background:white; color:#0f172a; padding:20px; line-height:1.5;`;
  container.innerHTML = fullHtml;
  document.body.appendChild(container);

  const canvas = await html2canvas(container, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff', width: contentWidth * 3.78, windowWidth: contentWidth * 3.78 });
  document.body.removeChild(container);

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = contentWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const startY = 10;
  const availableHeight = pdf.internal.pageSize.getHeight() - startY - 12;

  if (imgHeight <= availableHeight) {
    pdf.addImage(imgData, 'PNG', 10, startY, imgWidth, imgHeight);
  } else {
    let sourceY = 0;
    let isFirstPage = true;
    while (sourceY < canvas.height) {
      if (!isFirstPage) pdf.addPage();
      const sliceH = Math.min(availableHeight * (canvas.width / imgWidth), canvas.height - sourceY);
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceH;
      sliceCanvas.getContext('2d').drawImage(canvas, 0, sourceY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
      const sliceData = sliceCanvas.toDataURL('image/png');
      pdf.addImage(sliceData, 'PNG', 10, isFirstPage ? startY : 10, imgWidth, (sliceH * imgWidth) / canvas.width);
      sourceY += sliceH;
      isFirstPage = false;
    }
  }

  pdf.save('تقرير_الغياب_والخصومات_' + monthYear.replace('/', '-') + '.pdf');
}

/**
 * تقرير الساعات الإضافية الشهرية
 */
export async function generateOvertimeReportPdf(effects, payrollData, monthYear, settings) {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const contentWidth = pageWidth - 20;

  const overtimeEffects = effects.filter(e => e.status === 'approved' && e.type === 'overtime');
  const totalOvertimeHours = overtimeEffects.reduce((a, b) => a + (Number(b.units) || 0), 0);
  const totalOvertimePay = payrollData.reduce((a, b) => a + b.overtimePay, 0);

  let tableRows = '';
  overtimeEffects.forEach((eff, idx) => {
    const bg = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
    const category = eff.overtimeCategory === 'night' ? 'ليلي (70%)' : eff.overtimeCategory === 'holiday' ? 'عطلة رسمية (100%)' : 'نهاري (35%)';
    tableRows += `<tr style="background:${bg};">
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:center;">${idx + 1}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:right; font-weight:700;">${eff.employeeName}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:center;">${eff.date || monthYear}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:center; font-weight:700;">${eff.units} ${eff.unitType}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:center;">${category}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:right; font-size:10px;">${eff.reason || '---'}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:center;">${eff.adminNotes || '---'}</td>
    </tr>`;
  });

  const fullHtml = `
    ${buildCompanyHeaderHtml(settings.company.name, settings.company)}
    <div style="text-align:center; margin-bottom:12px;">
      <h2 style="font-size:18px; font-weight:900; color:#0f172a; margin:0;">تقرير الساعات الإضافية الشهرية</h2>
      <p style="font-size:11px; color:#64748b; margin-top:4px;">شهر: ${monthYear} — وفقاً لمادة 85 من قانون العمل رقم 12 لسنة 2003</p>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:14px;">
      <div style="background:#fff7ed; border:1px solid #ffedd5; border-radius:8px; padding:12px; text-align:center;">
        <div style="font-size:10px; color:#9a3412; font-weight:700;">إجمالي ساعات الإضافي</div>
        <div style="font-size:20px; font-weight:900; color:#c2410c;">${totalOvertimeHours} ساعة</div>
      </div>
      <div style="background:#eff6ff; border:1px solid #dbeafe; border-radius:8px; padding:12px; text-align:center;">
        <div style="font-size:10px; color:#1d4ed8; font-weight:700;">عدد الطلبات المعتمدة</div>
        <div style="font-size:20px; font-weight:900; color:#1d4ed8;">${overtimeEffects.length} طلب</div>
      </div>
      <div style="background:#f0fdf4; border:1px solid #dcfce7; border-radius:8px; padding:12px; text-align:center;">
        <div style="font-size:10px; color:#16a34a; font-weight:700;">إجمالي مبلغ الإضافي</div>
        <div style="font-size:20px; font-weight:900; color:#16a34a;">${totalOvertimePay.toLocaleString('ar-EG')} ج.م</div>
      </div>
    </div>

    ${overtimeEffects.length === 0 ? '<div style="padding:30px; text-align:center; color:#94a3b8; font-size:12px;">لا توجد ساعات إضافية معتمدة هذا الشهر.</div>' : `
    <table style="width:100%; border-collapse:collapse; font-size:10px; direction:rtl;">
      <thead>
        <tr style="background:#1e1e1e; color:white;">
          <th style="padding:7px 3px; border:1px solid #333; text-align:center;">م</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:right;">اسم الموظف</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:center;">التاريخ</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:center;">الساعات</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:center;">النوع</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:right;">السبب</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:center;">ملاحظات الإدارة</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
      <tfoot>
        <tr style="background:#f97316; color:white; font-weight:900;">
          <td colspan="3" style="padding:7px 3px; border:1px solid #ea580c; text-align:center;">الإجمالي</td>
          <td style="padding:7px 3px; border:1px solid #ea580c; text-align:center;">${totalOvertimeHours} ساعة</td>
          <td colspan="3" style="padding:7px 3px; border:1px solid #ea580c; text-align:center;">إجمالي المبلغ: ${totalOvertimePay.toLocaleString('ar-EG')} ج.م</td>
        </tr>
      </tfoot>
    </table>`}

    ${buildCompanyFooterHtml(settings.company.name)}
  `;

  const container = document.createElement('div');
  container.style.cssText = `position:fixed; left:-9999px; top:0; width:${contentWidth * 3.78}px; font-family:'Cairo',Arial,sans-serif; direction:rtl; background:white; color:#0f172a; padding:20px; line-height:1.5;`;
  container.innerHTML = fullHtml;
  document.body.appendChild(container);

  const canvas = await html2canvas(container, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff', width: contentWidth * 3.78, windowWidth: contentWidth * 3.78 });
  document.body.removeChild(container);

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = contentWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const startY = 10;
  const availableHeight = pdf.internal.pageSize.getHeight() - startY - 12;

  if (imgHeight <= availableHeight) {
    pdf.addImage(imgData, 'PNG', 10, startY, imgWidth, imgHeight);
  } else {
    let sourceY = 0;
    let isFirstPage = true;
    while (sourceY < canvas.height) {
      if (!isFirstPage) pdf.addPage();
      const sliceH = Math.min(availableHeight * (canvas.width / imgWidth), canvas.height - sourceY);
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceH;
      sliceCanvas.getContext('2d').drawImage(canvas, 0, sourceY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
      const sliceData = sliceCanvas.toDataURL('image/png');
      pdf.addImage(sliceData, 'PNG', 10, isFirstPage ? startY : 10, imgWidth, (sliceH * imgWidth) / canvas.width);
      sourceY += sliceH;
      isFirstPage = false;
    }
  }

  pdf.save('تقرير_الساعات_الإضافية_' + monthYear.replace('/', '-') + '.pdf');
}

/**
 * تقرير أرصدة الإجازات للموظفين
 */
export async function generateLeaveBalancePdf(employees, settings) {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const contentWidth = pageWidth - 20;
  const now = new Date();
  const dateStr = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

  let tableRows = '';
  employees.forEach((emp, idx) => {
    const bg = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
    const annualUsed = 21 - (emp.annualLeaveBalance || 21);
    const casualUsed = 6 - (emp.casualLeaveBalance || 6);
    tableRows += `<tr style="background:${bg};">
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:center;">${idx + 1}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:right; font-weight:700;">${emp.name}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:right;">${emp.jobTitle}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:center;">${emp.department}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:center;">${emp.joinDate || '---'}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:center; font-weight:900; color:#c2410c;">${emp.annualLeaveBalance || 21}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:center;">${annualUsed}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:center; font-weight:900; color:#1d4ed8;">${emp.casualLeaveBalance || 6}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:center;">${casualUsed}</td>
    </tr>`;
  });

  const fullHtml = `
    ${buildCompanyHeaderHtml(settings.company.name, settings.company)}
    <div style="text-align:center; margin-bottom:12px;">
      <h2 style="font-size:18px; font-weight:900; color:#0f172a; margin:0;">تقرير أرصدة الإجازات السنوية والعارضة</h2>
      <p style="font-size:11px; color:#64748b; margin-top:4px;">اعتباراً من: ${dateStr} — عدد الموظفين: ${employees.length}</p>
    </div>

    <table style="width:100%; border-collapse:collapse; font-size:10px; direction:rtl;">
      <thead>
        <tr style="background:#1e1e1e; color:white;">
          <th style="padding:7px 3px; border:1px solid #333; text-align:center;">م</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:right;">اسم الموظف</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:right;">الوظيفة</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:center;">القسم</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:center;">تاريخ التعيين</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:center;">السنوية (المتبقي)</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:center;">السنوية (المستخدمة)</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:center;">العارضة (المتبقي)</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:center;">العارضة (المستخدمة)</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>

    <div style="background:#fff7ed; border:1px solid #ffedd5; border-radius:8px; padding:10px 14px; margin-top:14px; font-size:10px; color:#9a3412;">
      <b>ملاحظة:</b> الإجازة السنوية وفقاً لمادة 47 من قانون العمل 12 لسنة 2003: 21 يوماً سنوياً (30 يوماً لأصحاب الخبرة فوق 10 سنوات).
      الإجازة العارضة: 6 أيام سنوياً بحد أقصى 2 يوماً لكل طلب.
    </div>

    ${buildCompanyFooterHtml(settings.company.name)}
  `;

  const container = document.createElement('div');
  container.style.cssText = `position:fixed; left:-9999px; top:0; width:${contentWidth * 3.78}px; font-family:'Cairo',Arial,sans-serif; direction:rtl; background:white; color:#0f172a; padding:20px; line-height:1.5;`;
  container.innerHTML = fullHtml;
  document.body.appendChild(container);

  const canvas = await html2canvas(container, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff', width: contentWidth * 3.78, windowWidth: contentWidth * 3.78 });
  document.body.removeChild(container);

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = contentWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const startY = 10;
  const availableHeight = pdf.internal.pageSize.getHeight() - startY - 12;

  if (imgHeight <= availableHeight) {
    pdf.addImage(imgData, 'PNG', 10, startY, imgWidth, imgHeight);
  } else {
    let sourceY = 0;
    let isFirstPage = true;
    while (sourceY < canvas.height) {
      if (!isFirstPage) pdf.addPage();
      const sliceH = Math.min(availableHeight * (canvas.width / imgWidth), canvas.height - sourceY);
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceH;
      sliceCanvas.getContext('2d').drawImage(canvas, 0, sourceY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
      const sliceData = sliceCanvas.toDataURL('image/png');
      pdf.addImage(sliceData, 'PNG', 10, isFirstPage ? startY : 10, imgWidth, (sliceH * imgWidth) / canvas.width);
      sourceY += sliceH;
      isFirstPage = false;
    }
  }

  pdf.save('تقرير_أرصدة_الإجازات_' + dateStr.replace(/\s+/g, '_') + '.pdf');
}

/**
 * تقرير المأموريات الخارجية
 */
export async function generateMissionReportPdf(effects, monthYear, settings) {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const contentWidth = pageWidth - 20;

  const missionEffects = effects.filter(e => e.status === 'approved' && e.type === 'mission');
  const totalMissionAmount = missionEffects.reduce((a, b) => a + (b.amount || 0), 0);

  let tableRows = '';
  missionEffects.forEach((eff, idx) => {
    const bg = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
    tableRows += `<tr style="background:${bg};">
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:center;">${idx + 1}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:right; font-weight:700;">${eff.employeeName}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:right;">${eff.destination || '---'}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:center;">${eff.startDate || '---'}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:center;">${eff.endDate || eff.startDate || '---'}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:center; font-weight:700;">${eff.units} ${eff.unitType}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:center; font-weight:900; color:#c2410c;">${(eff.amount || 0).toLocaleString('ar-EG')} ج.م</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:right; font-size:10px;">${eff.reason || '---'}</td>
    </tr>`;
  });

  const fullHtml = `
    ${buildCompanyHeaderHtml(settings.company.name, settings.company)}
    <div style="text-align:center; margin-bottom:12px;">
      <h2 style="font-size:18px; font-weight:900; color:#0f172a; margin:0;">تقرير المأموريات الخارجية</h2>
      <p style="font-size:11px; color:#64748b; margin-top:4px;">شهر: ${monthYear} — عدد المأموريات: ${missionEffects.length}</p>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px;">
      <div style="background:#eff6ff; border:1px solid #dbeafe; border-radius:8px; padding:12px; text-align:center;">
        <div style="font-size:10px; color:#1d4ed8; font-weight:700;">عدد المأموريات المعتمدة</div>
        <div style="font-size:20px; font-weight:900; color:#1d4ed8;">${missionEffects.length} مأمورية</div>
      </div>
      <div style="background:#fff7ed; border:1px solid #ffedd5; border-radius:8px; padding:12px; text-align:center;">
        <div style="font-size:10px; color:#9a3412; font-weight:700;">إجمالي مبالغ المأموريات</div>
        <div style="font-size:20px; font-weight:900; color:#c2410c;">${totalMissionAmount.toLocaleString('ar-EG')} ج.م</div>
      </div>
    </div>

    ${missionEffects.length === 0 ? '<div style="padding:30px; text-align:center; color:#94a3b8; font-size:12px;">لا توجد مأموريات معتمدة هذا الشهر.</div>' : `
    <table style="width:100%; border-collapse:collapse; font-size:10px; direction:rtl;">
      <thead>
        <tr style="background:#1e1e1e; color:white;">
          <th style="padding:7px 3px; border:1px solid #333; text-align:center;">م</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:right;">اسم الموظف</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:right;">الجهة / الوجهة</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:center;">من تاريخ</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:center;">إلى تاريخ</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:center;">المدة</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:center;">المبلغ</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:right;">السبب</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
      <tfoot>
        <tr style="background:#f97316; color:white; font-weight:900;">
          <td colspan="6" style="padding:7px 3px; border:1px solid #ea580c; text-align:center;">الإجمالي</td>
          <td style="padding:7px 3px; border:1px solid #ea580c; text-align:center;">${totalMissionAmount.toLocaleString('ar-EG')} ج.م</td>
          <td style="padding:7px 3px; border:1px solid #ea580c;"></td>
        </tr>
      </tfoot>
    </table>`}

    ${buildCompanyFooterHtml(settings.company.name)}
  `;

  const container = document.createElement('div');
  container.style.cssText = `position:fixed; left:-9999px; top:0; width:${contentWidth * 3.78}px; font-family:'Cairo',Arial,sans-serif; direction:rtl; background:white; color:#0f172a; padding:20px; line-height:1.5;`;
  container.innerHTML = fullHtml;
  document.body.appendChild(container);

  const canvas = await html2canvas(container, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff', width: contentWidth * 3.78, windowWidth: contentWidth * 3.78 });
  document.body.removeChild(container);

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = contentWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const startY = 10;
  const availableHeight = pdf.internal.pageSize.getHeight() - startY - 12;

  if (imgHeight <= availableHeight) {
    pdf.addImage(imgData, 'PNG', 10, startY, imgWidth, imgHeight);
  } else {
    let sourceY = 0;
    let isFirstPage = true;
    while (sourceY < canvas.height) {
      if (!isFirstPage) pdf.addPage();
      const sliceH = Math.min(availableHeight * (canvas.width / imgWidth), canvas.height - sourceY);
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceH;
      sliceCanvas.getContext('2d').drawImage(canvas, 0, sourceY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
      const sliceData = sliceCanvas.toDataURL('image/png');
      pdf.addImage(sliceData, 'PNG', 10, isFirstPage ? startY : 10, imgWidth, (sliceH * imgWidth) / canvas.width);
      sourceY += sliceH;
      isFirstPage = false;
    }
  }

  pdf.save('تقرير_المأموريات_' + monthYear.replace('/', '-') + '.pdf');
}

/**
 * تقرير قائمة الموظفين (Employee Roster)
 */
export async function generateEmployeeRosterPdf(employees, settings) {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const contentWidth = pageWidth - 20;
  const now = new Date();
  const dateStr = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

  let tableRows = '';
  employees.forEach((emp, idx) => {
    const bg = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
    tableRows += `<tr style="background:${bg};">
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:center;">${idx + 1}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:right; font-weight:700;">${emp.name}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:center; font-family:monospace;">${emp.id}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:right;">${emp.jobTitle}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:right;">${emp.department}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:center; font-family:monospace;">${emp.nationalId || '---'}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:center; font-family:monospace;">${emp.insuranceNumber || '---'}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:center;">${emp.joinDate || '---'}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:center;">${emp.phone || '---'}</td>
      <td style="padding:5px 3px; border:1px solid #e2e8f0; text-align:center; font-weight:700;">${emp.basicSalary.toLocaleString('ar-EG')} ج.م</td>
    </tr>`;
  });

  const totalSalaries = employees.reduce((a, b) => a + b.basicSalary, 0);

  const fullHtml = `
    ${buildCompanyHeaderHtml(settings.company.name, settings.company)}
    <div style="text-align:center; margin-bottom:12px;">
      <h2 style="font-size:18px; font-weight:900; color:#0f172a; margin:0;">قائمة الموظفين وبياناتهم الأساسية</h2>
      <p style="font-size:11px; color:#64748b; margin-top:4px;">عدد الموظفين: ${employees.length} — إجمالي الأسس المرتبية: ${totalSalaries.toLocaleString('ar-EG')} ج.م — تاريخ الإصدار: ${dateStr}</p>
    </div>

    <table style="width:100%; border-collapse:collapse; font-size:9px; direction:rtl;">
      <thead>
        <tr style="background:#1e1e1e; color:white;">
          <th style="padding:7px 3px; border:1px solid #333; text-align:center;">م</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:right;">اسم الموظف</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:center;">الكود</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:right;">الوظيفة</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:right;">القسم</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:center;">الرقم القومي</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:center;">الرقم التأميني</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:center;">تاريخ التعيين</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:center;">الهاتف</th>
          <th style="padding:7px 3px; border:1px solid #333; text-align:center;">الأساسي</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
      <tfoot>
        <tr style="background:#f97316; color:white; font-weight:900;">
          <td colspan="9" style="padding:7px 3px; border:1px solid #ea580c; text-align:center;">الإجمالي (${employees.length} موظف)</td>
          <td style="padding:7px 3px; border:1px solid #ea580c; text-align:center;">${totalSalaries.toLocaleString('ar-EG')} ج.م</td>
        </tr>
      </tfoot>
    </table>

    ${buildCompanyFooterHtml(settings.company.name)}
  `;

  const container = document.createElement('div');
  container.style.cssText = `position:fixed; left:-9999px; top:0; width:${contentWidth * 3.78}px; font-family:'Cairo',Arial,sans-serif; direction:rtl; background:white; color:#0f172a; padding:20px; line-height:1.5;`;
  container.innerHTML = fullHtml;
  document.body.appendChild(container);

  const canvas = await html2canvas(container, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff', width: contentWidth * 3.78, windowWidth: contentWidth * 3.78 });
  document.body.removeChild(container);

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = contentWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const startY = 10;
  const availableHeight = pdf.internal.pageSize.getHeight() - startY - 12;

  if (imgHeight <= availableHeight) {
    pdf.addImage(imgData, 'PNG', 10, startY, imgWidth, imgHeight);
  } else {
    let sourceY = 0;
    let isFirstPage = true;
    while (sourceY < canvas.height) {
      if (!isFirstPage) pdf.addPage();
      const sliceH = Math.min(availableHeight * (canvas.width / imgWidth), canvas.height - sourceY);
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceH;
      sliceCanvas.getContext('2d').drawImage(canvas, 0, sourceY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
      const sliceData = sliceCanvas.toDataURL('image/png');
      pdf.addImage(sliceData, 'PNG', 10, isFirstPage ? startY : 10, imgWidth, (sliceH * imgWidth) / canvas.width);
      sourceY += sliceH;
      isFirstPage = false;
    }
  }

  pdf.save('قائمة_الموظفين_' + dateStr.replace(/\s+/g, '_') + '.pdf');
}
