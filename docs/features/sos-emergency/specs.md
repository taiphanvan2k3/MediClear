# F3 — SOS Emergency — Specs

> Nút khẩn cấp 1-touch gọi ngay người thân cho người cao tuổi

---

## Overview

Nút SOS nổi (floating) luôn hiển thị trên màn hình, cho phép người cao tuổi gọi điện khẩn cấp cho người thân chỉ với 1 lần chạm.

## User Stories

1. **Là người cao tuổi**, khi tôi cảm thấy không khỏe đột ngột, tôi muốn gọi ngay cho con/cháu mà không cần tìm kiếm số điện thoại.
2. **Là con/cháu**, tôi muốn cài số điện thoại SOS cho bố/mẹ để họ gọi được ngay khi cần.

## Functional Requirements

### SOS Button
- Floating button tròn, màu đỏ (rose-600), nổi góc phải dưới
- Vị trí: Trên BottomNav, dưới nội dung chính
- Animation: Pulse nhẹ liên tục để dễ nhận biết
- 1-touch → `window.open('tel:' + emergencyPhone)`
- Long-press (500ms) → Hiện confirmation + gửi SMS (nếu hỗ trợ)

### Trạng thái
- **Đã cài SOS**: Hiện nút đỏ với icon Phone
- **Chưa cài SOS**: Hiện nút xám với icon + text "Cài SOS" → Navigate tới ProfileTab

### UI Component
- `src/components/SOSButton.tsx` — Floating button
- Render trong `App.tsx`, ngoài main content, trên BottomNav

## Non-Functional Requirements

- Touch target: >= 56px (lớn hơn chuẩn 44px cho người già)
- Không cần internet để gọi (dùng `tel:` protocol)
- Không block UI (không modal confirm trước khi gọi)
