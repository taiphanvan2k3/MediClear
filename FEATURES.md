# ✅ MediClear — Master Feature Checklist

> Danh sách tính năng cần phát triển theo Spec-Driven Development  
> Chọn các features bạn muốn làm → Implement từng cái một

---

## 🚀 PHASE 1 — Scan Đơn thuốc / Xét nghiệm THẬT bằng Gemini AI
> **Priority: 🔴 CRITICAL** — Tính năng cốt lõi, quyết định điểm Feasibility (40%)

- [x] **F1.1** — Backend `POST /api/scan/prescription` — Gửi ảnh đơn thuốc → Gemini Vision → Trả JSON structured
  - Tạo mới `server/routes/scan.ts`
  - Register route trong `server/routes/index.ts`
  - Prompt engineering cho Gemini đọc chữ viết tay + in
  - Hỗ trợ gửi nhiều ảnh (multi-page prescription)

- [x] **F1.2** — Frontend RecordsTab gọi API thật thay vì hardcode
  - Sửa `RecordsTab.tsx`: Gọi `/api/scan/prescription` khi chụp/tải ảnh
  - Hiển thị kết quả AI dynamic (danh sách thuốc, chỉ số xét nghiệm, cảnh báo)
  - Mỗi thuốc trích xuất → Card riêng với nút "📅 Tạo lịch nhắc"
  - Sửa `App.tsx`: `handleSaveResult()` lưu kết quả AI thật

- [x] **F1.3** — Type definitions cho Scan Result
  - Thêm `PrescriptionScanResult`, `ScannedMedication`, `ScannedLabResult` vào `types.ts`

---

## 💊 PHASE 2 — Kiểm tra Tương tác Thuốc (Drug Interaction)
> **Priority: 🟠 HIGH** — Yếu tố WOW cho Impact (30%) + Creativity (30%)

- [ ] **F2.1** — Backend `POST /api/interactions/check` — Gửi danh sách thuốc → Gemini + Search → Cảnh báo tương tác
  - Tạo mới `server/routes/interactions.ts`
  - Gemini AI phân tích cặp thuốc, trả severity + khuyến nghị

- [ ] **F2.2** — UI Drug Interaction Checker trong MedsTab hoặc section riêng
  - Hiển thị danh sách thuốc đang dùng
  - Nút "Kiểm tra tương tác" → Kết quả visual (xanh/vàng/đỏ)
  - Banner cảnh báo mạnh nếu phát hiện tương tác nguy hiểm

- [ ] **F2.3** — Auto-detect tương tác khi scan đơn thuốc mới
  - Khi F1 trả kết quả → Tự so sánh thuốc mới vs thuốc cũ đang dùng
  - Popup cảnh báo ngay nếu có conflict

---

## 🆘 PHASE 3 — Hệ Sinh Thái Cấp Cứu SOS & Thẻ Y Tế Khóa Màn Hình
> **Priority: 🔴 CRITICAL WOW FACTOR** — Giải quyết bài toán thực tế khi người già bất tỉnh ngoài đường

- [x] **F3.1** — Floating SOS Button trong App (Dành cho Người bệnh)
  - Nút tròn đỏ nổi góc phải (trên BottomNav), hiệu ứng ripple pulse
  - 1-touch → Mở Trung tâm Cứu hộ SOS: Gọi ngay người thân, Gọi 115, Gửi SMS vị trí GPS, Thẻ Y Tế
  - Chưa cài SĐT SOS → Modal thiết lập nhanh 1-step

- [x] **F3.2** — 🖼️ Xuất Hình Nền Cấp Cứu Màn Hình Khóa (Lock Screen Medical Wallpaper Generator)
  - Nút *"🖼️ Xuất Hình Nền Khóa QR"* trong `ProfileTab.tsx` và `SOSButton.tsx`
  - Tự động vẽ (HTML5 Canvas 1080x1920) ảnh hình nền điện thoại chuẩn y tế:
    - Họ tên, Tuổi, Bệnh nền đang theo dõi
    - SĐT người thân khẩn cấp (In to, rõ ràng)
    - **Mã QR Cứu hộ**: Cho phép người lạ/bác sĩ 115 dùng camera quét khi máy bị khóa màn hình
    - 3 chủ đề màu sắc: Ấm áp (Terracotta), Tối hiện đại (Dark Slate), Khẩn cấp (Emergency Rose)
  - Nút 1-click tải ảnh về máy (Download PNG) để cài làm hình nền khóa điện thoại

- [x] **F3.3** — 🚨 Thẻ Y Tế Cấp Cứu Trực Tuyến (Public Emergency Medical ID View)
  - Modal Thẻ Y Tế Cứu Hộ chuẩn y tế
  - Hiển thị danh sách thuốc đang uống (tự động cập nhật từ các đơn thuốc AI đã quét)
  - Nút to 1-touch: [🚑 Gọi 115 Cấp cứu] và [📞 Gọi Người thân]

- [x] **F3.4** — Chia sẻ đơn thuốc & Tọa độ GPS cho người thân
  - Tự động lấy tọa độ GPS (`navigator.geolocation`) kèm danh sách thuốc gửi trực tiếp qua SMS cho người thân khẩn cấp

---

## ☁️ PHASE 4 — Cloud Sync toàn bộ dữ liệu
> **Priority: 🟡 MEDIUM** — Đảm bảo dữ liệu không mất

- [ ] **F4.1** — Firestore CRUD cho historyRecords & medSearchHistory
  - Lưu lên Cloud khi thêm/sửa/xóa
  - Sync ngược khi đăng nhập lại (merge localStorage + Cloud)

- [ ] **F4.2** — Lưu kết quả scan AI + ảnh gốc lên Firestore
  - Collection `users/{uid}/scans/{scanId}`
  - Ảnh lưu base64 (hoặc Firebase Storage nếu > 1MB)

---

## ✨ PHASE 5 — UX Polish & Accessibility
> **Priority: 🟢 NICE-TO-HAVE** — Đánh bóng trải nghiệm

- [ ] **F5.1** — Onboarding Welcome Flow (3 slide)
  - Lần đầu mở app → Slide giới thiệu → Login → Setup profile nhanh
  - Animation smooth với motion library

- [ ] **F5.2** — PWA Support
  - `manifest.json` + Service Worker
  - "Add to Home Screen" prompt
  - Offline viewing cho lịch sử đã lưu

- [ ] **F5.3** — Voice Input cho người cao tuổi
  - Nút 🎤 microphone trong MedsTab search bar
  - Web Speech API (browser native, zero server cost)
  - Người già nói tên thuốc thay vì gõ bàn phím

---

## 📋 Tóm tắt nhanh

| Phase | Số features | Effort | Điểm thi tăng |
|-------|------------|--------|---------------|
| P1 — Scan AI thật | 3 | ⏱️ Medium | 📈📈📈📈📈 (Feasibility 40%) |
| P2 — Drug Interaction | 3 | ⏱️ Medium | 📈📈📈📈 (Creativity 30%) |
| P3 — SOS & Lockscreen QR | 4 | ⏱️ Medium | 📈📈📈📈📈 (Impact 30% + WOW) |
| P4 — Cloud Sync | 2 | ⏱️ Medium | 📈📈 |
| P5 — UX Polish & Voice | 3 | ⏱️ Low | 📈📈📈 |

---

> **Combo tối ưu tạo điểm WOW**: **P1 + P2 + P3 (Lockscreen Medical Wallpaper QR) + F5.3 (Voice Input)** = Chắc chắn đạt điểm số vượt trội từ BGK!
