# F1 — AI Prescription & Lab Scan — Test Plan

---

## Unit / API Tests

| # | Test Case | Input | Expected Output |
|---|-----------|-------|-----------------|
| 1 | Scan đơn thuốc in rõ | Ảnh đơn thuốc in laser | JSON với medications[], confidence > 0.8 |
| 2 | Scan đơn thuốc viết tay | Ảnh đơn thuốc viết tay BS | JSON với medications[], confidence > 0.5 |
| 3 | Scan phiếu xét nghiệm | Ảnh phiếu XN máu | JSON với labResults[], status chính xác |
| 4 | Multi-page scan | 3 ảnh đơn thuốc liên tiếp | Gộp kết quả từ cả 3 ảnh |
| 5 | Ảnh không phải y tế | Ảnh selfie / phong cảnh | Trả lỗi hoặc confidence rất thấp |
| 6 | Ảnh mờ, chữ khó đọc | Ảnh chụp nghiêng/mờ | Graceful fallback, không crash |
| 7 | Không gửi ảnh | Request body rỗng | 400 Bad Request |

## Integration Tests

| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 1 | Full scan flow | Chụp ảnh → API → Hiển thị kết quả | Kết quả dynamic, không hardcode |
| 2 | Lưu kết quả | Scan → Bấm "Lưu vào Lịch sử" | Record xuất hiện trong HistoryTab |
| 3 | Tạo lịch nhắc | Scan → Bấm "📅 Tạo lịch nhắc" trên 1 thuốc | Event tạo trên Google Calendar |
| 4 | Scan → Lưu → Xem lại | Full cycle | Dữ liệu nhất quán |

## Manual Verification

- [ ] Chụp đơn thuốc thực từ camera điện thoại
- [ ] Tải ảnh đơn thuốc từ album
- [ ] Verify kết quả AI có chính xác so với đơn thuốc gốc
- [ ] Kiểm tra trên mobile Chrome Android
- [ ] Kiểm tra với cỡ chữ to (isLargeText = true)
