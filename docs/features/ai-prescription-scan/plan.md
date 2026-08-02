# F1 — AI Prescription & Lab Scan — Implementation Plan

---

## Files to Create/Modify

### [NEW] `server/routes/scan.ts`
- `POST /api/scan` endpoint
- Accept: `{ images: string[], mimeType?: string }` (base64 array)
- Gemini 2.5 Flash multimodal call with all images
- System instruction prompt yêu cầu trả JSON structured
- Parse response → validate → return `PrescriptionScanResult`
- Fallback data nếu parse fail

### [MODIFY] `server/index.ts`
- Import & register `scanRouter` at `/api/scan`

### [NEW/MODIFY] `src/types.ts`
- Add: `PrescriptionScanResult`, `MedicationItem`, `LabResultItem`
- Update: `HistoryRecord` to include optional `scanResult` field

### [MODIFY] `src/components/RecordsTab.tsx`
- Replace hardcoded 2.5s timer with real API call to `/api/scan`
- ANALYZING state: Show real progress (API pending)
- RESULT state: Render dynamic cards from `PrescriptionScanResult`
  - MedicationCard: name, dosage, frequency, warnings, calendar button
  - LabResultCard: name, value, status badge (normal/high/low)
  - OverallAdvice: AI summary card
  - Confidence badge

### [MODIFY] `src/App.tsx`
- Update `handleSaveResult()`: Save real AI result instead of hardcoded data
- Pass scan result to RecordsTab
- New state: `scanResult: PrescriptionScanResult | null`

---

## Gemini Prompt Strategy

```
System: Bạn là Trợ lý Y tế AI chuyên phân tích đơn thuốc và phiếu xét nghiệm Việt Nam.
Hãy đọc tất cả hình ảnh được gửi và trích xuất toàn bộ thông tin y tế.

Quy tắc:
1. Đọc cả chữ viết tay lẫn chữ in
2. Tự động nhận biết loại tài liệu (đơn thuốc / xét nghiệm / hỗn hợp)
3. Trả về JSON hợp lệ, KHÔNG dùng Markdown
4. Nếu không đọc được rõ, ghi confidence thấp và note "Chữ viết tay khó đọc"
5. Luôn đưa lời khuyên bằng tiếng Việt dễ hiểu cho người cao tuổi

User: [images] Hãy phân tích tài liệu y tế này và trả JSON theo schema...
```

---

## Execution Order

1. Add types to `types.ts`
2. Create `server/routes/scan.ts` with Gemini integration
3. Register route in `server/index.ts`
4. Refactor `RecordsTab.tsx` to call API & render dynamic results
5. Update `App.tsx` state management
6. Test with real prescription images
