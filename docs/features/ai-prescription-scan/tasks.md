# F1 — AI Prescription & Lab Scan — Tasks

---

- [ ] Thêm `PrescriptionScanResult`, `MedicationItem`, `LabResultItem` types vào `src/types.ts`
- [ ] Tạo `server/routes/scan.ts` — endpoint `POST /api/scan`
  - [ ] Xử lý nhận mảng ảnh base64
  - [ ] Xây dựng prompt Gemini cho prescription analysis
  - [ ] Xây dựng prompt Gemini cho lab result analysis
  - [ ] Parse JSON response + validation
  - [ ] Fallback data nếu parse thất bại
- [ ] Register `scanRouter` trong `server/index.ts`
- [ ] Refactor `RecordsTab.tsx` — gọi `/api/scan` thay vì hardcode
  - [ ] State mới: `scanResult: PrescriptionScanResult | null`
  - [ ] ANALYZING: Gọi API, hiển thị loading thực
  - [ ] RESULT: Render dynamic MedicationCards
  - [ ] RESULT: Render dynamic LabResultCards
  - [ ] RESULT: Render OverallAdvice card
  - [ ] RESULT: Nút "📅 Tạo lịch nhắc" cho từng thuốc
  - [ ] RESULT: Confidence badge
- [ ] Cập nhật `App.tsx` — `handleSaveResult()` lưu kết quả AI thật
- [ ] Test end-to-end với ảnh đơn thuốc thực tế
