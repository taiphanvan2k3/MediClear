# F2 — Drug Interaction Checker — Tasks

---

- [ ] Thêm `DrugInteractionResult`, `DrugInteraction` types vào `src/types.ts`
- [ ] Tạo `server/routes/interactions.ts` — endpoint `POST /api/interactions/check`
  - [ ] Prompt engineering cho drug interaction analysis
  - [ ] Tích hợp Google Search Grounding
  - [ ] Parse JSON response + severity classification
  - [ ] Fallback nếu Search Grounding fail
- [ ] Register `interactionsRouter` trong `server/index.ts`
- [ ] UI: Drug Interaction Checker section
  - [ ] Danh sách thuốc đang dùng (editable chips)
  - [ ] Nút "Kiểm tra tương tác"
  - [ ] Results: severity badges (xanh/vàng/đỏ)
  - [ ] Detail view: description + recommendation per pair
  - [ ] Sources từ Google Search
- [ ] Auto-detect: Khi scan đơn thuốc mới → So sánh thuốc mới vs thuốc cũ
  - [ ] Warning banner nếu phát hiện tương tác nguy hiểm
- [ ] Test với cặp thuốc đã biết tương tác (vd: Warfarin + Aspirin)
