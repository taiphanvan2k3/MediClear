# ✅ MediClear — Master Feature Checklist

> Danh sách tính năng phát triển theo Spec-Driven Development  
> Cập nhật tiến độ & Roadmap mới nhất

---

## 🚀 PHASE 1 — Scan Đơn thuốc & Xét nghiệm THẬT bằng Gemini Multimodal Vision AI
> **Priority: 🔴 CRITICAL** — Tính năng cốt lõi, quyết định điểm Feasibility (40%)

- [x] **F1.1** — Backend `POST /api/scan/prescription` — Gửi ảnh đơn thuốc → Gemini Multimodal Vision → Trả JSON structured
  - Hỗ trợ ảnh đơn thuốc viết tay + chữ in phức tạp
  - Hỗ trợ gửi nhiều ảnh (multi-page prescription batch)
  - Trích xuất danh sách thuốc, liều dùng, lưu ý ăn uống, chỉ số xét nghiệm, lời khuyên và cảnh báo

- [x] **F1.2** — Frontend RecordsTab kết nối TanStack Query & Gemini API
  - Phân tích đa ảnh thực tế, hiển thị visual cards chuẩn y tế
  - Nút 📅 "Tạo lịch nhắc" từng loại thuốc qua Google Calendar API

- [x] **F1.3** — Type definitions & Stores
  - Định nghĩa kiểu `PrescriptionScanResult`, `HistoryRecord`, `MedSearchHistoryItem` trong `types.ts`
  - Quản lý trạng thái bằng Zustand Store (`useScanStore`, `useRecordsStore`) & TanStack Query mutations

---

## 💊 PHASE 2 — Tra Cứu Thuốc AI & Xuất Phiếu Tái Khám / Mua Thuốc
> **Priority: 🔴 CRITICAL WOW FACTOR** — Giải quyết nỗi đau thực tế khi đi mua thuốc & tái khám

- [x] **F2.1** — Backend `POST /api/scan/medicine-info` — Tra cứu thông tin thuốc AI (Google Grounding)
  - Tra cứu bằng tên thuốc hoặc chụp ảnh bao bì/hộp thuốc
  - Giải thích công dụng, liều dùng, lưu ý ăn uống, dẫn nguồn tài liệu y khoa

- [x] **F2.2** — Màn hình Push Page `PrescriptionSlipView` (Xuất Phiếu Đơn Thuốc Chuyên Dụng)
  - **Chế độ 1: Ra tiệm mua thuốc (Dược sĩ)** — Tối ưu cho Dược sĩ kiểm tra tên thuốc, liều lượng, đóng gói
  - **Chế độ 2: Bác sĩ tái khám (Bác sĩ)** — Tổng hợp tiền sử bệnh nền, thuốc đang uống, chẩn đoán trước đó
  - Tải ảnh thẻ thuốc HD (PNG qua Canvas 1080p), In phiếu / PDF, Sao chép tin nhắn chuẩn Y tế gửi Zalo, Mã QR

- [ ] **F2.3** — Cảnh báo Tương tác Thuốc tự động (Drug-Drug Interaction Checker)
  - Backend `POST /api/interactions/check` kiểm tra xung đột thuốc nguy hiểm giữa đơn mới và thuốc cũ đang uống

---

## 📱 PHASE 3 — PWA App Shortcuts & Cấp Cứu 1-Touch Từ Màn Hình Chính
> **Priority: 🔴 CRITICAL WOW FACTOR** — Hỗ trợ gọi khẩn cấp trực tiếp từ màn hình điện thoại không cần mở app

- [x] **F3.1** — Cấu hình Web App Manifest (`manifest.json`)
  - Tên ứng dụng, icon chuẩn y tế, theme color `#B85B43`, `display: standalone`
  - Cài đặt PWA lên iPhone / Android (Add to Home Screen) chạy toàn màn hình như native app

- [x] **F3.2** — PWA App Shortcuts (Quick Actions khi đè giữ icon App)
  - 🚨 **Shortcut 1: "Gọi Người Thân SOS"** (`/?action=quick_sos`): Đè giữ icon MediClear ngoài màn hình chính → Bấm gọi ngay đến số người thân đã cài đặt trong 0.5s.
  - 📷 **Shortcut 2: "Quét Đơn Thuốc"** (`/?action=scan`): Mở thẳng màn hình máy ảnh chụp đơn thuốc.
  - 🔍 **Shortcut 3: "Tra Cứu Thuốc"** (`/?action=meds`): Mở thẳng ô tìm kiếm thuốc AI.

- [x] **F3.3** — Service Worker & Offline Cache (`sw.js`)
  - Caching tài nguyên tĩnh, tăng tốc độ mở ứng dụng tức thì và hỗ trợ xem dữ liệu ngoại tuyến

---

## ☁️ PHASE 4 — Cloud Sync & Quản Lý Hồ Sơ
> **Priority: 🟡 HIGH** — Bảo mật dữ liệu y tế

- [x] **F4.1** — Google Firebase Authentication & Access Token Scope
  - Đăng nhập 1-touch bằng Google, tự động cấp quyền ghi Google Calendar API

- [x] **F4.2** — Firestore Cloud Sync cho User Profile & Hồ sơ bệnh nền
  - Tự động lưu và đồng bộ cấu hình xưng hô (Bác ↔ Cháu), bệnh nền lên Cloud Firestore

- [ ] **F4.3** — Firestore Sync 2 chiều cho Lịch sử đơn thuốc (History Records)

---

## ✨ PHASE 5 — Accessibility & Trải Nghiệm Người Cao Tuổi
> **Priority: 🟢 HIGH IMPACT** — Chuẩn WCAG AAA cho người lớn tuổi

- [x] **F5.1** — Chế độ Cỡ Chữ To Dễ Đọc (`isLargeText`)
  - Phóng to font chữ toàn bộ giao diện, độ tương phản cao, nút bấm to chống bấm nhầm

- [x] **F5.2** — Xưng hô AI cá nhân hóa theo văn hóa gia đình Việt
  - Tùy biến xưng hô dịu dàng, ân cần (Bác ↔ Cháu, Ông ↔ Cháu, Cô ↔ Cháu...)

- [ ] **F5.3** — Voice Input cho người cao tuổi (Web Speech API)
  - Nút 🎤 Microphone trong thanh tìm kiếm thuốc để đọc tên thuốc thay vì gõ phím

---

## 📋 Bảng Tổng Kết Trọng Trọng Tâm

| Phase | Nội dung cốt lõi | Trạng thái |
|---|---|:---:|
| **P1** | Quét Đơn Thuốc Gemini Multimodal Vision AI | ✅ Hoàn thành |
| **P2** | Tra Cứu Thuốc AI + Xuất Phiếu Mua Thuốc / Tái Khám | ✅ Hoàn thành |
| **P3** | PWA Native App + App Shortcuts Gọi SOS 1-Touch | 🚀 Đang triển khai |
| **P4** | Google Firebase Auth, Calendar API & Firestore Profile | ✅ Hoàn thành |
| **P5** | Accessibility Cỡ Chữ To + Xưng Hô Dịu Dàng | ✅ Hoàn thành |
