# F3 — SOS Emergency — Specs

> Nút khẩn cấp 1-touch gọi ngay người thân cho người cao tuổi (Hiển thị cố định trên mọi màn hình)

---

## Overview

Nút SOS nổi toàn cầu (Global Floating SOS Button) luôn hiển thị ở góc dưới màn hình và Top Header trên **TẤT CẢ các trang**, cho phép người cao tuổi gọi điện khẩn cấp cho người thân chỉ với 1 lần chạm.

## User Stories

1. **Là người cao tuổi**, khi tôi cảm thấy không khỏe đột ngột, tôi muốn gọi ngay cho con/cháu chỉ bằng 1 lần chạm vào nút SOS nổi đỏ trên màn hình hiện tại mà không cần đi tìm số điện thoại.
2. **Là người dùng lần đầu**, khi bấm vào nút SOS nổi mà chưa có số điện thoại, tôi muốn hiển thị ngay bảng cài đặt nhanh SĐT người thân tại chỗ để nhập và thực hiện cuộc gọi cấp cứu ngay lập tức.
3. **Là con/cháu**, tôi muốn cài số điện thoại SOS cho bố/mẹ để họ gọi được ngay khi cần.

## Functional Requirements

### SOS Floating Button (Global)
- Floating button tròn, màu đỏ khẩn cấp (`rose-600`), nổi cố định ở góc dưới bên phải (`bottom-20 right-4`).
- Vị trí: Trên BottomNav (`z-40`), nổi trên tất cả nội dung ứng dụng.
- Animation: Hiệu ứng pulse sóng lan tỏa nhẹ nhàng liên tục + badge rung lắc "GỌI SOS" giúp người cao tuổi dễ nhận diện khi khẩn cấp.
- 1-touch khi ĐÃ cài số người thân → Tự động kết nối cuộc gọi `window.location.href = 'tel:' + emergencyPhone`.
- 1-touch khi CHƯA cài số người thân → Bật ngay **Modal Cài Đặt Nhanh SĐT SOS** trực tiếp tại vị trí màn hình hiện tại.

### Header Quick SOS Button
- Tích hợp thêm nút bấm khẩn cấp mini SOS đỏ trên thanh Top Navbar header để người dùng có thể nhấp bất cứ lúc nào.

### Quick SOS Setup Modal
- Cho phép nhập Tên người thân (vd: Con gái, Bác sĩ...) và Số điện thoại khẩn cấp.
- Nút "LƯU SỐ & GỌI KHẨN CẤP NGAY": Lưu thông tin vào `userProfile` (localStorage + Cloud Firestore) và tự động kích hoạt cuộc gọi điện thoại.

### UI Components
- `src/components/SOSButton.tsx` — Global Floating Button + Quick Setup Modal.
- `src/components/Navbar.tsx` — Header Quick SOS Button.
- Render trong `App.tsx`, ngoài main content container.

## Non-Functional Requirements

- Touch target: >= 64px (lớn hơn chuẩn 44px cho người già mắt kém, tay run).
- Không cần internet để gọi điện thoại (dùng `tel:` protocol tích hợp hệ thống máy điện thoại).
- Đạt chuẩn WCAG AAA tương phản màu sắc cao (`text-white` trên nền `rose-600` / `rose-700`).

