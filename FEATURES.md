# ✅ MediClear — Master Feature Checklist

> Danh sách tính năng cần phát triển theo Spec-Driven Development  
> Chọn các features bạn muốn làm → Implement từng cái một

---

## 🚀 PHASE 1 — Scan Đơn thuốc / Xét nghiệm THẬT bằng Gemini AI
> **Priority: 🔴 CRITICAL** — Tính năng cốt lõi, quyết định điểm Feasibility (40%)

- [ ] **F1.1** — Backend `POST /api/scan/prescription` — Gửi ảnh đơn thuốc → Gemini Vision → Trả JSON structured
  - Tạo mới `server/routes/scan.ts`
  - Register route trong `server/index.ts`
  - Prompt engineering cho Gemini đọc chữ viết tay + in
  - Hỗ trợ gửi nhiều ảnh (multi-page prescription)

- [ ] **F1.2** — Frontend RecordsTab gọi API thật thay vì hardcode
  - Sửa `RecordsTab.tsx`: Gọi `/api/scan/prescription` khi chụp/tải ảnh
  - Hiển thị kết quả AI dynamic (danh sách thuốc, chỉ số xét nghiệm, cảnh báo)
  - Mỗi thuốc trích xuất → Card riêng với nút "📅 Tạo lịch nhắc"
  - Sửa `App.tsx`: `handleSaveResult()` lưu kết quả AI thật

- [ ] **F1.3** — Type definitions cho Scan Result
  - Thêm `PrescriptionScanResult`, `MedicationItem`, `LabResultItem` vào `types.ts`

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

## 🆘 PHASE 3 — SOS Khẩn cấp & Kết nối Gia đình
> **Priority: 🟡 MEDIUM** — Tăng Impact cho người cao tuổi

- [ ] **F3.1** — Floating SOS Button
  - Nút tròn đỏ nổi góc phải (trên BottomNav)
  - 1-touch → `tel:` gọi điện cho `emergencyPhone`
  - Chưa cài SOS → Prompt setup trong ProfileTab
  - Animation pulse nhẹ để dễ nhận biết

- [ ] **F3.2** — Chia sẻ đơn thuốc cho người thân
  - Nút "Gửi cho con/cháu" trong HistoryTab
  - Tạo share link hoặc copy text summary

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
| P1 — Scan AI thật | 3 | ⏱️ Medium | 📈📈📈📈📈 |
| P2 — Drug Interaction | 3 | ⏱️ Medium | 📈📈📈📈 |
| P3 — SOS Button | 2 | ⏱️ Low | 📈📈📈 |
| P4 — Cloud Sync | 2 | ⏱️ Medium | 📈📈 |
| P5 — UX Polish | 3 | ⏱️ Low | 📈📈 |

---

> **Combo tối ưu**: **P1 + P2 + P3 + F5.3** = tăng từ ~5/10 → ~9/10 điểm thi.
