/**
 * محرك الحسابات المالية وفقاً للتشريعات والقوانين المصرية:
 * 1. قانون التأمينات الاجتماعية والمعاشات رقم 148 لسنة 2019
 * 2. قانون ضريبة كسب العمل وتعديلاته (القانون رقم 30 لسنة 2023 وتعديلات 2024)
 * 3. قانون العمل رقم 12 لسنة 2003 (الإضافي والغياب والراحات)
 * 4. قانون صندوق تكريم الشهداء والمصابين (0.0005)
 */

export const DEFAULT_SETTINGS = {
  company: {
    name: '',
    commercialRegister: '',
    taxNumber: '',
    insuranceOffice: '',
    insuranceNumber: '',
    address: '',
    phone: '',
    logo: ''
  },
  workRules: {
    standardHoursPerDay: 8,
    standardDaysPerMonth: 30,
    workingDaysPerMonth: 22,
    overtimeRates: {
      daytimePercent: 35,
      nighttimePercent: 70,
      holidayPercent: 100
    }
  },
  socialInsurance: {
    employeeSharePercent: 11.0,
    employerSharePercent: 18.75,
    minInsuredSalary: 2000,
    maxInsuredSalary: 12600
  },
  incomeTax: {
    personalExemptionAnnual: 20000,
    martyrsFundPercent: 0.05,
    taxBrackets: [
      { maxLimit: 40000, rate: 0.00 },
      { maxLimit: 55000, rate: 0.10 },
      { maxLimit: 70000, rate: 0.15 },
      { maxLimit: 200000, rate: 0.20 },
      { maxLimit: 400000, rate: 0.225 },
      { maxLimit: Infinity, rate: 0.25 }
    ]
  },
  leavesMatrix: {
    standardAnnualDays: 21,
    seniorAnnualDays: 30,
    casualDays: 6,
    maxCasualPerRequest: 2
  }
};

/**
 * حساب التأمينات الاجتماعية (قانون 148 لسنة 2019)
 */
export function calculateSocialInsurance(grossSalary, insuranceSettings = DEFAULT_SETTINGS.socialInsurance) {
  const insuredSalary = Math.min(
    Math.max(Number(grossSalary) || 0, insuranceSettings.minInsuredSalary),
    insuranceSettings.maxInsuredSalary
  );

  const employeeShare = (insuredSalary * insuranceSettings.employeeSharePercent) / 100;
  const employerShare = (insuredSalary * insuranceSettings.employerSharePercent) / 100;

  return {
    insuredSalary: Math.round(insuredSalary * 100) / 100,
    employeeShare: Math.round(employeeShare * 100) / 100,
    employerShare: Math.round(employerShare * 100) / 100,
    totalInsurance: Math.round((employeeShare + employerShare) * 100) / 100
  };
}

/**
 * حساب ضريبة كسب العمل السنوية والشهرية (قانون 30 لسنة 2023 وتعديلات 2024)
 */
export function calculateIncomeTax(grossAnnualTaxable, taxSettings = DEFAULT_SETTINGS.incomeTax) {
  const taxableAnnual = Math.max(0, grossAnnualTaxable - taxSettings.personalExemptionAnnual);
  
  if (taxableAnnual <= 0) {
    return { annualTax: 0, monthlyTax: 0, bracketBreakdown: [] };
  }

  let remaining = taxableAnnual;
  let prevLimit = 0;
  let totalAnnualTax = 0;
  const breakdown = [];

  for (const bracket of taxSettings.taxBrackets) {
    if (remaining <= 0) break;
    
    const bracketSize = bracket.maxLimit === Infinity ? remaining : (bracket.maxLimit - prevLimit);
    const taxableInBracket = Math.min(remaining, bracketSize);
    const taxInBracket = taxableInBracket * bracket.rate;

    totalAnnualTax += taxInBracket;
    breakdown.push({
      range: prevLimit.toLocaleString('ar-EG') + ' - ' + (bracket.maxLimit === Infinity ? 'ما زاد' : bracket.maxLimit.toLocaleString('ar-EG')),
      taxable: taxableInBracket,
      rate: bracket.rate * 100,
      tax: Math.round(taxInBracket * 100) / 100
    });

    remaining -= taxableInBracket;
    prevLimit = bracket.maxLimit;
  }

  const monthlyTax = Math.round((totalAnnualTax / 12) * 100) / 100;

  return {
    annualTax: Math.round(totalAnnualTax * 100) / 100,
    monthlyTax,
    taxableAnnual,
    bracketBreakdown: breakdown
  };
}

/**
 * حساب قيمة ساعة العمل وسعر العمل الإضافي (قانون 12 لسنة 2003 مادة 85)
 */
export function calculateOvertime(basicSalary, overtimeHours = { day: 0, night: 0, holiday: 0 }, workRules = DEFAULT_SETTINGS.workRules) {
  const dailyWage = basicSalary / (workRules.standardDaysPerMonth || 30);
  const hourlyRate = dailyWage / (workRules.standardHoursPerDay || 8);

  const dayRate = hourlyRate * (1 + workRules.overtimeRates.daytimePercent / 100);
  const nightRate = hourlyRate * (1 + workRules.overtimeRates.nighttimePercent / 100);
  const holidayRate = hourlyRate * (1 + workRules.overtimeRates.holidayPercent / 100);

  const dayAmount = (overtimeHours.day || 0) * dayRate;
  const nightAmount = (overtimeHours.night || 0) * nightRate;
  const holidayAmount = (overtimeHours.holiday || 0) * holidayRate;

  const totalOvertimePay = dayAmount + nightAmount + holidayAmount;

  return {
    hourlyRate: Math.round(hourlyRate * 100) / 100,
    dayAmount: Math.round(dayAmount * 100) / 100,
    nightAmount: Math.round(nightAmount * 100) / 100,
    holidayAmount: Math.round(holidayAmount * 100) / 100,
    totalOvertimePay: Math.round(totalOvertimePay * 100) / 100
  };
}

/**
 * حساب مفردات ومسير الراتب الشامل لموظف
 */
export function calculateEmployeeSalary(employee, effects = {}, settings = DEFAULT_SETTINGS) {
  const basicSalary = Number(employee.basicSalary) || 0;
  const variableSalary = Number(employee.variableSalary) || 0;
  const fixedAllowances = Number(employee.allowances) || 0;

  // 1. حساب الاستحقاقات المباشرة
  const grossBaseSalary = basicSalary + variableSalary + fixedAllowances;

  // 2. المؤثرات الإيجابية
  const overtimeCalc = calculateOvertime(basicSalary, effects.overtimeHours, settings.workRules);
  const bonuses = Number(effects.bonuses) || 0;
  const missionAllowances = Number(effects.missionAllowances) || 0;

  const totalEntitlements = grossBaseSalary + overtimeCalc.totalOvertimePay + bonuses + missionAllowances;

  // 3. التأمينات الاجتماعية
  const insuranceResult = calculateSocialInsurance(basicSalary + variableSalary, settings.socialInsurance);
  const employeeInsuranceDeduction = insuranceResult.employeeShare;

  // 4. ضريبة كسب العمل
  const monthlyTaxableGross = Math.max(0, totalEntitlements - employeeInsuranceDeduction);
  const annualTaxableGross = monthlyTaxableGross * 12;
  const taxResult = calculateIncomeTax(annualTaxableGross, settings.incomeTax);
  const employeeIncomeTax = taxResult.monthlyTax;

  // 5. صندوق تكريم الشهداء (0.0005)
  const martyrsFund = Math.round((totalEntitlements * (settings.incomeTax.martyrsFundPercent / 100)) * 100) / 100;

  // 6. الخصومات الإدارية والغياب
  const dailyWage = basicSalary / (settings.workRules.standardDaysPerMonth || 30);
  const absenceDays = Number(effects.absenceDays) || 0;
  const penaltyDays = Number(effects.penaltyDays) || 0;
  const absenceDeduction = Math.round(absenceDays * dailyWage * 100) / 100;
  const penaltyDeduction = Math.round(penaltyDays * dailyWage * 100) / 100;

  const loansAndAdvances = Number(effects.loans) || 0;
  const otherDeductions = Number(effects.otherDeductions) || 0;

  const totalDeductions = employeeInsuranceDeduction + 
                          employeeIncomeTax + 
                          martyrsFund + 
                          absenceDeduction + 
                          penaltyDeduction + 
                          loansAndAdvances + 
                          otherDeductions;

  const netSalary = Math.max(0, Math.round((totalEntitlements - totalDeductions) * 100) / 100);

  return {
    employeeId: employee.id,
    employeeName: employee.name,
    nationalId: employee.nationalId,
    insuranceNumber: employee.insuranceNumber,
    jobTitle: employee.jobTitle,
    department: employee.department,
    bankAccount: employee.bankAccount,
    
    basicSalary,
    variableSalary,
    fixedAllowances,
    grossBaseSalary,

    overtimePay: overtimeCalc.totalOvertimePay,
    overtimeDetails: overtimeCalc,
    bonuses,
    missionAllowances,
    totalEntitlements: Math.round(totalEntitlements * 100) / 100,

    insuredSalary: insuranceResult.insuredSalary,
    socialInsuranceEmployee: employeeInsuranceDeduction,
    socialInsuranceEmployer: insuranceResult.employerShare,
    incomeTax: employeeIncomeTax,
    taxBreakdown: taxResult.bracketBreakdown,
    martyrsFund,
    absenceDays,
    absenceDeduction,
    penaltyDays,
    penaltyDeduction,
    loansAndAdvances,
    otherDeductions,
    totalDeductions: Math.round(totalDeductions * 100) / 100,

    netSalary,
    companyTotalCost: Math.round((totalEntitlements + insuranceResult.employerShare) * 100) / 100
  };
}