/**
 * Thai Fiscal Year Utilities
 * ปีงบประมาณไทย: 1 ตุลาคม – 30 กันยายน
 * เช่น ปีงบ 2569 = 1 ต.ค. 2568 – 30 ก.ย. 2569
 */

/**
 * คำนวณปีงบประมาณไทย (พ.ศ.) จากวันที่ที่กำหนด
 * ถ้าไม่ระบุ date จะใช้วันปัจจุบัน
 */
export function getCurrentFiscalYear(date: Date = new Date()): number {
  const month = date.getMonth() + 1; // 1-12
  const buddhistYear = date.getFullYear() + 543;
  // ตุลาคม–ธันวาคม (เดือน 10-12) = ขึ้นปีงบถัดไป
  return month >= 10 ? buddhistYear + 1 : buddhistYear;
}

/**
 * สร้าง list ปีงบประมาณย้อนหลัง N ปี + ปีปัจจุบัน
 * เรียงจากปีล่าสุดก่อน (มากไปน้อย)
 */
export function getFiscalYearOptions(pastYears = 2): string[] {
  const startYear = getCurrentFiscalYear();
  const years: string[] = [];
  for (let i = 0; i <= pastYears + 1; i++) {
    years.push(String(startYear - i));
  }
  return years; // จะได้ ["2570", "2569", "2568", "2567"]
}
