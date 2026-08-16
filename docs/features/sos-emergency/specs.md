# F3 — SOS Emergency & Lockscreen Medical ID — Specs

> Hệ sinh thái cứu hộ khẩn cấp toàn diện cho người cao tuổi: Nút SOS 1-Touch, Xuất hình nền màn hình khóa cứu hộ có mã QR, và Thẻ y tế cấp cứu trực tuyến định vị GPS.

---

## Overview

Hệ sinh thái Cấp cứu MediClear giải quyết trọn vẹn cả 2 tình huống sinh tử:
1. **Khi người bệnh tỉnh táo đang cầm máy**: Bấm 1-touch nút SOS đỏ nổi trên màn hình để gọi ngay người thân, gọi 115, hoặc gửi tin nhắn định vị GPS kèm danh sách thuốc.
2. **Khi người bệnh ngất xỉu / tai biến ngoài đường (Điện thoại khóa màn hình)**: Người qua đường hoặc bác sĩ cấp cứu chỉ cần quét **Mã QR trên Hình nền khóa điện thoại** để xem ngay danh sách thuốc đang uống, bệnh nền và số điện thoại người nhà!

---

## User Stories

1. **Là người cao tuổi**, khi tôi cảm thấy tức ngực/choáng váng đột ngột, tôi muốn gọi ngay cho con/cháu chỉ bằng 1 lần chạm vào nút SOS nổi đỏ hoặc gửi ngay tọa độ vị trí GPS hiện tại của tôi cho con.
2. **Là người đi đường / Bác sĩ cấp cứu 115**, khi phát hiện một cụ già bất tỉnh và điện thoại của cụ bị khóa mật khẩu, tôi muốn dùng camera điện thoại của tôi quét mã QR trên màn hình khóa của cụ để biết ngay cụ tên gì, bị bệnh gì, đang uống thuốc gì và liên lạc khẩn cấp cho ai.
3. **Là con/cháu**, tôi muốn tạo và cài đặt sẵn một tấm hình nền khóa chuẩn y tế đẹp mắt cho bố mẹ, có in rõ số điện thoại của tôi và mã QR y tế.

---

## Functional Requirements

### 1. SOS Floating Button & Action Sheet (`src/components/SOSButton.tsx`)
- Floating button tròn màu đỏ (`rose-600`), hiệu ứng pulse nhẹ nhàng liên tục.
- 1-touch mở **Trung tâm Cứu hộ Khẩn cấp**:
  - 🚨 **GỌI NGƯỜI THÂN NGAY** (Cuộc gọi trực tiếp qua `tel:`)
  - 🚑 **GỌI 115 CẤP CỨU Y TẾ**
  - 📍 **GỬI TỌA ĐỘ GPS & ĐƠN THUỐC QUA SMS**: Tự động lấy tọa độ qua `navigator.geolocation` và mở trình soạn tin nhắn `sms:`.
  - 🪪 **MỞ THẺ Y TẾ CẤP CỨU (MEDICAL ID)**
  - 🖼️ **XUẤT HÌNH NỀN KHÓA QR**

### 2. Lock Screen Medical Wallpaper Generator (`src/components/LockscreenWallpaperModal.tsx`)
- Công cụ vẽ hình nền tự động bằng **HTML5 Canvas** (Độ phân giải siêu nét 1080x1920, chuẩn tỷ lệ 9:16 cho mọi smartphone).
- Các thành phần trên hình nền:
  - Đồng hồ hiển thị thời gian & ngày tháng.
  - Banner: `🚨 THẺ Y TẾ CẤP CỨU • MEDICAL ID`.
  - Thông tin bệnh nhân: Họ tên, Năm sinh/Tuổi, Bệnh nền đang theo dõi.
  - Khung số điện thoại người thân SOS to rõ nét.
  - **Mã QR Code Cứu Hộ**: Tự sinh bằng thuật toán không phụ thuộc mạng, mã hóa thông tin liên hệ và đơn thuốc.
  - Hướng dẫn người lạ: *"👉 DÙNG CAMERA ĐIỆN THOẠI QUÉT MÃ NÀY ĐỂ XEM DANH SÁCH THUỐC VÀ GỌI CỨU HỘ"*.
- Hỗ trợ 3 phong cách màu sắc:
  - 🌿 **Ấm áp (Terracotta & Sand)**: Dịu mắt, chuẩn Clinical Modern Wellness.
  - 🌙 **Tối hiện đại (Dark Slate)**: Tương phản cao, tiết kiệm pin OLED.
  - 🚨 **Khẩn cấp (Emergency Rose)**: Nổi bật tối đa.
- Nút **"TẢI ẢNH HÌNH NỀN VỀ MÁY (PNG)"** 1-Click + Hướng dẫn cài đặt cho iOS/Android.

### 3. Public Emergency Medical ID View (`src/components/MedicalIDModal.tsx`)
- Hiển thị Thẻ Y Tế Cấp Cứu chuẩn lâm sàng.
- Tự động đồng bộ danh sách thuốc đang dùng từ các đơn thuốc AI đã quét trong Sổ Khám.
- Tích hợp 2 nút bấm to: Gọi 115 và Gọi Người thân SOS.
- Nút gửi SMS kèm tọa độ GPS định vị vị trí người bệnh.

---

## Non-Functional Requirements
- **Offline-First & Zero Extra Dependencies**: Thuật toán vẽ Canvas và sinh ma trận QR code chạy 100% bằng JavaScript/TypeScript native, hoạt động hoàn hảo ngay cả khi không có kết nối mạng.
- **Accessibility & WCAG AAA**: Nút bấm kích thước lớn (>= 56px), chữ đậm nét trên nền tương phản cao.
