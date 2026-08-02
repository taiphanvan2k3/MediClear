# F5.1 — Onboarding Welcome Flow — Specs

> Màn hình giới thiệu lần đầu mở app với 3 slide + setup profile nhanh

---

## Overview

Lần đầu tiên mở MediClear, người dùng thấy 3 slide giới thiệu tính năng chính → Đăng nhập Google → Setup nhanh profile (tuổi, bệnh nền, SOS contact).

## Functional Requirements

- 3 slide swipeable với animation mượt (dùng motion library)
  - Slide 1: "Chụp đơn thuốc → AI đọc giúp" (icon Camera + AI)
  - Slide 2: "Tạo lịch nhắc uống thuốc tự động" (icon Calendar)
  - Slide 3: "Kiểm tra tương tác thuốc an toàn" (icon Shield)
- Nút "Bắt đầu" → Login Google → Profile Setup
- Skip option cho user đã biết
- `localStorage.setItem('mediClear_onboarded', 'true')` → Không hiện lại
