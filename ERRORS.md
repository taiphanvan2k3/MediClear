# 🚨 MediClear — Error & Incident Log (Nhật Ký Xử Lý Lỗi)

> File lưu trữ lịch sử lỗi phát sinh, nguyên nhân gốc rễ (Root Cause), mức độ ảnh hưởng (Impact) và giải pháp khắc phục (Resolution) trong quá trình phát triển dự án MediClear.

---

## 📋 Bảng tổng hợp sự cố (Quick Summary)

| # | Ngày (Date) | Hiện tượng / Tên lỗi | Mức độ | Trạng thái |
|---|---|---|---|---|
| 01 | 2026-08-16 | Lỗi xung đột lệnh `npx tsc --noEmit` trên môi trường npm | Thấp (Low) | ✅ Đã khắc phục |
| 02 | 2026-08-16 | Gemini AI trả về Markdown Block quanh chuỗi JSON gây lỗi `JSON.parse` | Trung bình (Medium) | ✅ Đã khắc phục |
| 03 | 2026-08-16 | Unhandled Exception làm sập server do thiếu Middleware bắt lỗi tập trung | Cao (High) | ✅ Đã khắc phục |
| 04 | 2026-08-16 | Google Search Grounding trên Gemini 3.x Flash-Lite bị chặn mã `429 RESOURCE_EXHAUSTED` | Cao (High) | ✅ Đã khắc phục |

---

## 🛠️ Chi tiết các sự cố đã xử lý

### 📝 Sự cố #01: Lỗi xung đột lệnh `npx tsc --noEmit` trên môi trường npm

* **Date**: `2026-08-16`
* **Error / Symptom**: Khi chạy `npx tsc --noEmit`, terminal thông báo *"This is not the tsc command you are looking for"*.
* **Root Cause**: Trên một số môi trường npm toàn cục, gói `tsc` (dummy package trên npm registry) bị gọi nhầm thay vì binary của TypeScript compiler `typescript/bin/tsc`.
* **Impact**: Không thể chạy nhanh typecheck độc lập bằng lệnh `npx tsc`.
* **Resolution**: 
  - Sử dụng script chuẩn đã được định nghĩa trong `package.json`: `npm run lint` (thực thi `"tsc --noEmit"` thông qua runner của npm nội bộ dự án).
  - Kết quả: Kiểm tra toàn bộ lỗi TypeScript thành công 100%.

---

### 📝 Sự cố #02: Gemini AI trả về Markdown Code Block quanh chuỗi JSON

* **Date**: `2026-08-16`
* **Error / Symptom**: Khi gọi Gemini AI trả về kết quả tra cứu thuốc, model thường bọc kết quả trong block ```` ```json { ... } ``` ```` khiến hàm `JSON.parse(text)` trực tiếp bị văng lỗi cú pháp.
* **Root Cause**: Mặc định các mô hình ngôn ngữ lớn (LLM) có thói quen định dạng phản hồi có cấu trúc dưới dạng code block markdown khi không bật chế độ response MIME type bắt buộc.
* **Impact**: Frontend nhận lỗi 500 hoặc phải dùng dữ liệu mock mặc định.
* **Resolution**:
  - Viết bộ Regex bóc tách chuỗi JSON an toàn: `const jsonMatch = responseText.match(/\{[\s\S]*\}/)`.
  - Bổ sung hàm `cleanItems()` để lọc sạch các ký tự markdown như `**`, `*`, bullet points `•` trước khi gửi về client.
  - Bổ sung 3-tier fallback tự động xoay vòng model khi quota hoặc Search Grounding bị gián đoạn.

---

### 📝 Sự cố #03: Backend thiếu Middleware xử lý lỗi tập trung (Global Error Handler)

* **Date**: `2026-08-16`
* **Error / Symptom**: Mỗi route handler phải tự viết `try...catch`, nếu có ngoại lệ bất đồng bộ (async error) bị sót sẽ gây Unhandled Promise Rejection và làm crash tiến trình Node.js.
* **Root Cause**: Cấu trúc Express ban đầu gom chung toàn bộ logic trong `index.ts` và `routes/meds.ts`, không có tầng middleware `errorHandler` đứng ở cuối pipeline.
* **Impact**: Rủi ro gián đoạn dịch vụ khi người dùng gửi payload lỗi hoặc API bên thứ ba trả về mã lỗi bất thường.
* **Resolution**:
  - Tạo middleware [`server/middlewares/errorHandler.ts`](file:///d:/SelfLearning/AIRiser2026/MediClear/server/middlewares/errorHandler.ts) chuẩn Express `(err, req, res, next)`.
  - Trong các controller, khi gặp lỗi chỉ cần gọi `next(error)` để chuyển tiếp về error handler tập trung.
  - Tự động ẩn stack trace chi tiết khi chạy ở môi trường Production (`NODE_ENV === 'production'`).

---

### 📝 Sự cố #04: Google Search Grounding trên Gemini 3.x Flash-Lite bị chặn mã `429 RESOURCE_EXHAUSTED`

* **Date**: `2026-08-16`
* **Error / Symptom**: Khi gọi `POST /api/meds/search` dùng model `gemini-3.1-flash-lite` hoặc `gemini-3.5-flash-lite`, API trả về mã lỗi `429 RESOURCE_EXHAUSTED: You exceeded your current quota...` dù prompt thông thường không kèm tool vẫn chạy thành công.
* **Root Cause**: Google áp dụng hạn mức tính năng riêng biệt (**Feature-Specific Quota**) cho Google Search Grounding. Trên dòng Flash-Lite thế hệ 3.x, Google giới hạn hạn mức tìm kiếm tức thời trên gói Free Tier rất thấp ($14 / 1,000 queries sau 5,000 queries/tháng), trong khi dòng `gemini-2.5-flash` và `gemini-2.5-flash-lite` được cấp Grounding miễn phí rộng rãi.
* **Impact**: Người dùng không thể tra cứu thuốc khi cấu hình bắt buộc dùng 3.x Lite kèm Search Grounding.
* **Resolution**:
  - Thiết lập chiến lược **3-Tier Fallback**:
    - **Tier 1**: `gemini-2.5-flash` với Search Grounding (Đầy đủ nguồn bài viết, hoạt động 100% trên Free Tier).
    - **Tier 2**: `gemini-2.5-flash-lite` với Search Grounding (Xoay vòng tối ưu RPM).
    - **Tier 3**: Tự động fallback sang `gemini-3.1-flash-lite` thuần suy luận y khoa không kèm search tool để đảm bảo hệ thống không bao giờ bị gián đoạn.

---

## 📌 Template ghi chép lỗi mới (Mẫu thêm sự cố)

Sao chép mẫu dưới đây mỗi khi gặp và xử lý lỗi mới:

```markdown
### 📝 Sự cố #XX: [Tiêu đề mô tả ngắn gọn lỗi]

* **Date**: `YYYY-MM-DD`
* **Error / Symptom**: [Hiện tượng, mã lỗi hoặc thông báo lỗi trên UI/Console]
* **Root Cause**: [Nguyên nhân cốt lõi gây ra lỗi]
* **Impact**: [Mức độ ảnh hưởng tới hệ thống / người dùng: Thấp / Trung bình / Cao / Nghiêm trọng]
* **Resolution**: [Các bước cụ thể đã thực hiện để fix lỗi và biện pháp phòng ngừa]
```
