/**
 * Danh mục Tên miền Y tế & Dược học có độ uy tín và thẩm quyền cao nhất tại Việt Nam
 */

export const TRUSTED_MEDICAL_DOMAINS = [
  // 1. Cơ quan Quản lý Y tế & Viện Tuyến Trung Ương
  "moh.gov.vn",           // Bộ Y Tế Việt Nam
  "dav.gov.vn",           // Cục Quản lý Dược - Bộ Y Tế
  "bachmai.gov.vn",       // Bệnh viện Bạch Mai
  "bvcr.org.vn",          // Bệnh viện Chợ Rẫy
  "choray.vn",            // Bệnh viện Chợ Rẫy
  "k.gov.vn",             // Bệnh viện K Trung ương
  "umc.edu.vn",           // Bệnh viện Đại học Y Dược TP.HCM

  // 2. Hệ thống Bệnh viện Đa khoa & Quốc tế Hàng đầu
  "vinmec.com",           // BV Đa khoa Quốc tế Vinmec
  "tamanhhospital.vn",    // BV Đa khoa Tâm Anh
  "medlatec.vn",          // Hệ thống Y tế Medlatec

  // 3. Cơ sở Dữ liệu Dược thư Quốc gia & Hệ thống Nhà thuốc chuẩn GPP
  "trungtamthuoc.com",     // Trung Tâm Thuốc Central Pharmacy (Dược thư Quốc gia)
  "nhathuoclongchau.com.vn", // Nhà thuốc FPT Long Châu
  "thuocbietduoc.com.vn", // Cơ sở dữ liệu Thuốc Biệt Dược
  "pharmacity.vn",        // Chuỗi Nhà thuốc Pharmacity

  // 4. Cổng thông tin Y tế được Bác sĩ/Dược sĩ thẩm định chuyên môn
  "youmed.vn",            // Cẩm nang Y tế YouMed
  "hellobacsi.com",       // Nền tảng Y khoa HelloBacsi
] as const;

/**
 * Ánh xạ tên miền sang nhãn tên hiển thị chuẩn mực y tế
 */
export function getMedicalDomainLabel(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    const host = url.hostname.toLowerCase();

    if (host.includes("moh.gov")) return "Bộ Y Tế Việt Nam";
    if (host.includes("dav.gov")) return "Cục Quản lý Dược (Bộ Y Tế)";
    if (host.includes("bachmai")) return "Bệnh viện Bạch Mai";
    if (host.includes("choray") || host.includes("bvcr")) return "Bệnh viện Chợ Rẫy";
    if (host.includes("umc.edu")) return "BV Đại học Y Dược TP.HCM";
    if (host.includes("vinmec")) return "BV Đa khoa Quốc tế Vinmec";
    if (host.includes("tamanh")) return "Bệnh viện Đa khoa Tâm Anh";
    if (host.includes("medlatec")) return "Hệ thống Y tế Medlatec";
    if (host.includes("longchau")) return "Nhà thuốc FPT Long Châu";
    if (host.includes("trungtamthuoc")) return "Trung Tâm Thuốc Central Pharmacy";
    if (host.includes("thuocbietduoc")) return "Cơ sở Dữ liệu Thuốc Biệt Dược";
    if (host.includes("pharmacity")) return "Nhà thuốc Pharmacity";
    if (host.includes("youmed")) return "Cẩm nang Y khoa YouMed";
    if (host.includes("hellobacsi")) return "Nền tảng Y tế HelloBacsi";

    return url.hostname;
  } catch {
    return "Nguồn Y tế Uy tín";
  }
}
