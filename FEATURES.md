# ✅ MediClear — Master Feature Checklist

> Danh sách tính năng phát triển theo Spec-Driven Development  
> Cập nhật tiến độ & Roadmap mới nhất (Tháng 8/2026)

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

- [x] **F2.1** — Backend `POST /api/scan/medicine-info` — Tra cứu thông tin thuốc AI (Google Grounding & Tavily)
  - Tra cứu bằng tên thuốc hoặc chụp ảnh bao bì/hộp thuốc
  - Giải thích công dụng, liều dùng, lưu ý ăn uống, dẫn nguồn tài liệu y khoa chính thống
- [x] **F2.2** — Màn hình Push Page `PrescriptionSlipView` (Xuất Phiếu Đơn Thuốc Chuyên Dụng)
  - **Chế độ 1: Ra tiệm mua thuốc (Dược sĩ)** — Tối ưu cho Dược sĩ kiểm tra tên thuốc, liều lượng, đóng gói
  - **Chế độ 2: Bác sĩ tái khám (Bác sĩ)** — Tổng hợp tiền sử bệnh nền, thuốc đang uống, chẩn đoán trước đó
  - Tải ảnh thẻ thuốc HD (PNG qua Canvas 1080p), In phiếu / PDF, Sao chép tin nhắn chuẩn Y tế gửi Zalo, Mã QR
- [ ] **F2.3** — ⚠️ Cảnh Báo Tương Tác Thuốc Tự Động (Drug-Drug Interaction Checker)
  - Backend `POST /api/interactions/check` kiểm tra xung đột hoạt chất nguy hiểm giữa đơn thuốc mới và các thuốc đang uống trong lịch sử

---

## 📱 PHASE 3 — PWA App Shortcuts & Cấp Cứu 1-Touch Từ Màn Hình Chính
> **Priority: 🔴 CRITICAL WOW FACTOR** — Hỗ trợ gọi khẩn cấp trực tiếp từ màn hình điện thoại không cần mở app

- [x] **F3.1** — Cấu hình Web App Manifest (`manifest.json`)
  - Tên ứng dụng, icon chuẩn y tế PNG/SVG, theme color `#B85B43`, `display: standalone`, `scope: /`
  - Cài đặt PWA lên iPhone / Android (WebAPK) chạy toàn màn hình như native app
- [x] **F3.2** — PWA App Shortcuts (Quick Actions khi đè giữ icon App)
  - 🚨 **Shortcut 1: "Gọi Người Thân SOS"** (`/?action=quick_sos`): Đè giữ icon MediClear ngoài màn hình chính → Bấm gọi ngay đến số người thân đã cài đặt trong 0.5s.
  - 📷 **Shortcut 2: "Quét Đơn Thuốc"** (`/?action=scan`): Mở thẳng màn hình máy ảnh chụp đơn thuốc.
  - 💊 **Shortcut 3: "Tra Cứu Thuốc"** (`/?action=meds`): Mở thẳng ô tìm kiếm thuốc AI.
- [x] **F3.3** — Service Worker & Offline Cache (`sw.js`)
  - Chiến lược Network-First cho HTML/JS/CSS, hỗ trợ xem dữ liệu ngoại tuyến, tự động cập nhật khi có code mới

---

## ☁️ PHASE 4 — Cloud Sync & Quản Lý Hồ Sơ
> **Priority: 🟡 HIGH** — Bảo mật dữ liệu y tế

- [x] **F4.1** — Google Firebase Authentication & Access Token Scope
  - Đăng nhập 1-touch bằng Google, tự động cấp quyền ghi Google Calendar API
  - Cơ chế Two-Layer Optimistic Hydration (`cachedUser` + `isAuthReady`) chống chập chờn FOUC khi reload
- [x] **F4.2** — Firestore Cloud Sync cho User Profile & Hồ sơ bệnh nền
  - Tự động lưu và đồng bộ cấu hình xưng hô (Bác ↔ Cháu), bệnh nền lên Cloud Firestore
- [ ] **F4.3** — 🔄 Firestore Sync 2 chiều cho Lịch Sử Đơn Thuốc (History Records Cloud Sync)
  - Đồng bộ toàn bộ lịch sử đơn thuốc và lịch sử tra cứu thuốc lên Cloud Firestore (`users/{uid}/records`) để không bị mất khi đổi thiết bị

---

## ✨ PHASE 5 — Accessibility & Trải Nghiệm Người Cao Tuổi
> **Priority: 🟢 HIGH IMPACT** — Chuẩn WCAG AAA cho người lớn tuổi

- [x] **F5.1** — Chế độ Cỡ Chữ To Dễ Đọc (`isLargeText`)
  - Phóng to font chữ toàn bộ giao diện, độ tương phản cao, nút bấm to chống bấm nhầm
- [x] **F5.2** — Xưng hô AI cá nhân hóa theo văn hóa gia đình Việt
  - Tùy biến xưng hô dịu dàng, ân cần (Bác ↔ Cháu, Ông ↔ Cháu, Cô ↔ Cháu...)
- [ ] **F5.3** — 🎤 Nhập Liệu Bằng Giọng Nói (Voice Input / Web Speech API)
  - Nút Micro 🎙️ trong thanh tìm kiếm thuốc để đọc tên thuốc tiếng Việt (Ví dụ: "Panadol", "Thuốc hạ huyết áp Amlodipine") thay vì phải gõ bàn phím

---

## 📋 Bảng Tổng Kết Trọng Tâm & Tiến Độ

| Phase | Nội dung cốt lõi | Tiến độ | Trạng thái |
|---|---|:---:|:---:|
| **P1** | Quét Đơn Thuốc Gemini Multimodal Vision AI | 100% | ✅ Hoàn thành |
| **P2** | Tra Cứu Thuốc AI + Xuất Phiếu Mua Thuốc / Tái Khám | 75% | 🔄 Còn F2.3 (Cảnh báo tương tác thuốc) |
| **P3** | PWA Native WebAPK + App Shortcuts Gọi SOS 1-Touch | 100% | ✅ Hoàn thành |
| **P4** | Google Firebase Auth, Calendar API & Firestore Sync | 75% | 🔄 Còn F4.3 (Sync lịch sử đơn thuốc lên Cloud) |
| **P5** | Accessibility Cỡ Chữ To + Xưng Hô Dịu Dàng + Voice Search | 70% | 🔄 Còn F5.3 (Tìm kiếm bằng giọng nói 🎤) |
