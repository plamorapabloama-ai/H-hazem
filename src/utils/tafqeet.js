/**
 * تفقيط المبالغ المالية باللغة العربية (الجنيه والقرش)
 * خاص بجمهورية مصر العربية
 */

const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة',
  'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];

const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];

const hundreds = ['', 'مائة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

function convertGroup(n) {
  let output = '';
  if (n === 0) return '';

  const h = Math.floor(n / 100);
  const remainder = n % 100;

  if (h > 0) {
    output += hundreds[h];
  }

  if (remainder > 0) {
    if (output !== '') output += ' و ';
    if (remainder < 20) {
      output += ones[remainder];
    } else {
      const o = remainder % 10;
      const t = Math.floor(remainder / 10);
      if (o > 0) {
        output += ones[o] + ' و ' + tens[t];
      } else {
        output += tens[t];
      }
    }
  }

  return output;
}

export function tafqeet(number) {
  if (number === null || number === undefined || isNaN(number)) return 'صفر جنيه مصري';
  const val = Math.abs(Number(number));
  if (val === 0) return 'صفر جنيه مصري لا غير';

  const intPart = Math.floor(val);
  const decPart = Math.round((val - intPart) * 100);

  let parts = [];
  let n = intPart;

  const billions = Math.floor(n / 1000000000);
  n %= 1000000000;
  const millions = Math.floor(n / 1000000);
  n %= 1000000;
  const thousands = Math.floor(n / 1000);
  const units = n % 1000;

  if (billions > 0) {
    if (billions === 1) parts.push('مليار');
    else if (billions === 2) parts.push('ملياران');
    else if (billions >= 3 && billions <= 10) parts.push(convertGroup(billions) + ' مليارات');
    else parts.push(convertGroup(billions) + ' مليار');
  }

  if (millions > 0) {
    if (millions === 1) parts.push('مليون');
    else if (millions === 2) parts.push('مليونان');
    else if (millions >= 3 && millions <= 10) parts.push(convertGroup(millions) + ' ملايين');
    else parts.push(convertGroup(millions) + ' مليون');
  }

  if (thousands > 0) {
    if (thousands === 1) parts.push('ألف');
    else if (thousands === 2) parts.push('ألفان');
    else if (thousands >= 3 && thousands <= 10) parts.push(convertGroup(thousands) + ' آلاف');
    else parts.push(convertGroup(thousands) + ' ألف');
  }

  if (units > 0) {
    parts.push(convertGroup(units));
  }

  let result = parts.join(' و ') + ' جنيه مصري';

  if (decPart > 0) {
    result += ' و ' + convertGroup(decPart) + ' قرشاً';
  }

  return 'فقط ' + result + ' لا غير';
}
