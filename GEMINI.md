# 🏆 COMPETITION JUDGING CRITERIA & PROJECT GUIDELINES (MediClear)

> [!IMPORTANT]
> **TIÊU CHÍ CHẤM THI CHÍNH THỨC**
> Tài liệu này lưu trữ toàn bộ tiêu chí đánh giá cuộc thi để định hướng phát triển phần mềm, thiết kế UI/UX, tích hợp công nghệ AI & Google, và tối ưu hóa trải nghiệm ứng dụng MediClear nhằm đạt điểm số tối đa.

---

## 📋 1. Feasibility (Khả thi) — Trọng số: 40%

**Yêu cầu cốt lõi**: Ứng dụng phải hoạt động thực tế (`functional`), chuyên nghiệp (`professional`) và dễ sử dụng (`easy to use`).

* **Functionality (Tính năng hoạt động)**:
  - Ứng dụng có hoạt động chính xác theo đúng mục đích không?
  - Xử lý quét/đọc đơn thuốc, phiếu xét nghiệm (Gemini AI), lưu trữ lịch sử, và tự động tạo lịch nhắc uống thuốc (Google Calendar API) mượt mà, không gián đoạn.
* **UI/UX & Accessibility (Giao diện & Trải nghiệm người dùng)**:
  - Giao diện trực quan, thân thiện và dễ tiếp cận cho mọi lứa tuổi.
  - Trải nghiệm sử dụng mượt mà, tốc độ phản hồi nhanh.
  - **Hỗ trợ người khuyết tật & người cao tuổi (Disabilities & Seniors)**:
    - Chế độ Cỡ chữ to dễ đọc (`isLargeText`).
    - Độ tương phản màu sắc cao đạt chuẩn WCAG AAA (*Clinical Modern Wellness*).
    - Nút bấm to, vùng chạm rộng (Mobile-first touch targets).
    - Xưng hô AI cá nhân hóa dịu dàng (Bác ↔ Cháu).
    - Nút SOS khẩn cấp 1-touch gọi ngay người thân.

---

## 💡 2. Impact (Tác động xã hội & Tiềm năng) — Trọng số: 30%

**Yêu cầu cốt lõi**: Tìm kiếm các dự án có tác động lớn, giải quyết hiệu quả nỗi đau thực tế và có khả năng mở rộng quy mô (`scaling up`).

* **Problem-Solution Fit (Độ phù hợp vấn đề - giải pháp)**:
  - Ứng dụng có giải quyết hiệu quả một vấn đề nhức nhối thực tế không?
  - *Giải pháp MediClear*: Giúp người cao tuổi & gia đình đọc hiểu chính xác các đơn thuốc chữ viết tay/in phức tạp, ghi chú cảnh báo ăn uống, tự động tạo lịch nhắc nhở uống thuốc tránh quên liều/uống sai liều gây nguy hiểm.
* **Impact & User Group (Tác động & Nhóm người dùng ổn định)**:
  - Dự án có thể phát triển thành giải pháp thực tế hoặc dự án xã hội với lượng người dùng ổn định không?
  - Hướng tới hàng triệu người cao tuổi, bệnh nhân mạn tính (huyết áp, tiểu đường, gút...) và người chăm sóc gia đình tại Việt Nam & toàn cầu.
* **Scalability (Khả năng mở rộng)**:
  - Tầm nhìn phát triển của ứng dụng có triển vọng không?
  - Khả năng tích hợp thêm kết nối phòng khám/bệnh viện, hồ sơ sức khỏe điện tử (EHR), cảnh báo tương tác thuốc tự động.

---

## ✨ 3. Creativity (Sáng tạo & Đột phá) — Trọng số: 30%

**Yêu cầu cốt lõi**: Giải quyết các vấn đề thực tế theo những cách sáng tạo và đột phá!

* **Originality (Tính độc đáo & Bản nguyên)**:
  - Tránh các mẫu (templates) lối mòn có sẵn; ưu tiên các ý tưởng sáng tạo "Out-of-the-box".
  - Trợ lý Y tế AI giao tiếp thông minh, đa ngôn ngữ, tự thích ứng xưng hô thân mật phù hợp văn hóa gia đình Việt.
* **"Wow" Factor & Google Technologies (Yếu tố tạo ấn tượng mạnh & Công nghệ Google)**:
  - Sử dụng tinh tế, ấn tượng các công cụ AI và hệ sinh thái công nghệ từ Google:
    - **Google Gemini AI Multimodal**: Đọc và phân tích trực tiếp hình ảnh đơn thuốc/xét nghiệm y tế thực tế.
    - **Google Firebase**: Authentication, Cloud Firestore bảo mật dữ liệu y tế.
    - **Google Calendar API**: Tự động lên lịch nhắc nhở uống thuốc thông minh trên Lịch Google của người dùng.

---

## 🎨 4. Design System & Style Guidelines ('Clinical Modern Wellness')

> [!TIP]
> **TIÊU CHUẨN NGHỆ THUẬT & GIAO DIỆN HỆ THỐNG**
> Thiết kế giao diện MediClear tuân thủ nghiêm ngặt phong cách **Clinical Modern Wellness**, hướng tới trải nghiệm đáng tin cậy, dịu mắt, dễ đọc cho mọi lứa tuổi (đặc biệt là người cao tuổi).

### 🌈 Color Palette (Bảng màu chuẩn Y tế & Sức khỏe)
* **Base / Nền chủ đạo**:
  - **Crisp White (`#FFFFFF`) & Soft Warm Greys (`slate-50`, `slate-100`, `slate-200/90`)**: Tạo cảm giác sạch sẽ, chuẩn y tế chuyên nghiệp, không gây mỏi mắt hay chói lóa.
* **Primary / Màu nhận diện chính**:
  - **Mint Green (`emerald-600`, `emerald-500`, `emerald-50`)**: Đại diện cho sự chữa lành, an tâm, chăm sóc sức khỏe & các hành động tích cực.
* **Secondary / Màu hỗ trợ tin cậy**:
  - **Cerulean Blue (`sky-600`, `sky-500`, `sky-50`)**: Đại diện cho sự chuyên nghiệp, tin cậy, thông tin y khoa chuẩn xác.
* **Warning & Alert / Cảnh báo & Khẩn cấp**:
  - **Soft Amber (`amber-50`, `amber-200`, `amber-800`)**: Cảnh báo lưu ý ăn uống, đường huyết cao nhẹ.
  - **Soft Rose / Coral Red (`rose-50`, `rose-600`, `rose-700`)**: Cảnh báo tương tác thuốc nguy hiểm & Nút gọi khẩn cấp SOS.

---

### 🔤 Typography & Accessibility (Độ tương phản & Khả năng tiếp cận)
* **Tương phản cao WCAG AAA**: Chữ màu `text-slate-800` / `text-slate-900` đậm nét trên nền sáng, giúp người già mắt kém đọc rõ ràng.
* **Hỗ trợ Cỡ chữ to (`isLargeText`)**: Tự động phóng to kích thước font (`text-2xl`, `text-lg`, `text-base`) khi người dùng bật công tắc "Cỡ chữ to dễ đọc".
* **Tone of Voice**: Thân thiện, tôn trọng, ân cần và chuẩn mực y tế. Xưng hô cá nhân hóa dịu dàng (Bác ↔ Cháu, Bác ↔ Con...). Tránh các thuật ngữ y khoa quá phức tạp hoặc từ ngữ gây hoang mang.

---

### 📱 Mobile UI/UX Principles (Nguyên tắc thiết kế Mobile)
1. **Toast Notification nổi ở đáy (`bottom-20`)**:
   - Toast thông báo không làm mờ/khóa toàn màn hình (không dùng Modal chặn ngắt).
   - Nổi ngay trên thanh Bottom Navigation (`bottom-20`), tự đóng sau 3.5s, không bao giờ che Header tiêu đề hay vùng làm việc chính.
2. **Giao diện khi Chưa Đăng Nhập (Unauthenticated State)**:
   - Hiển thị màn hình **Yêu cầu đăng nhập tập trung (Login Gate)** thay vì bày ra hàng loạt ô trống "Chưa cập nhật", "Chưa cài đặt" gây rối mắt.
3. **Tùy chọn Tải ảnh 2 Nút bấm song song**:
   - 📷 **Nút Chụp ảnh** (`capture="environment"`): Mở trực tiếp ứng dụng Máy ảnh.
   - 🖼️ **Nút Album ảnh** (`multiple` không capture): Mở thư viện Album chọn nhiều trang đơn thuốc.
4. **Touch Targets rộng**: Nút bấm bo tròn 12px - 24px (`rounded-xl` / `rounded-2xl`), chiều cao tối thiểu 44px, hỗ trợ chạm bằng ngón tay dễ dàng trên màn hình cảm ứng nhỏ.

---

## 🎯 ĐỊNH HƯỚNG PHÁT TRIỂN CODE & UI CHO AGENT

Khi thực hiện bất kỳ tính năng hay chỉnh sửa giao diện nào trên MediClear, luôn đối chiếu với 3 tiêu chí trên:
1. **Feasibility (40%)**: Đảm bảo code chạy 100% không lỗi (`tsc --noEmit` pass), UI mượt, nút to dễ bấm cho người già.
2. **Impact (30%)**: Tập trung vào tính năng thực tế giải quyết việc dùng thuốc sai/quên liều của bệnh nhân.
3. **Creativity (30%)**: Tối ưu tính năng AI đọc đơn thuốc (Gemini) và đồng bộ Google Calendar tạo điểm nhấn "WOW".
