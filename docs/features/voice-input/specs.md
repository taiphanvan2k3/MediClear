# F5.3 — Voice Input — Specs

> Nhập tên thuốc bằng giọng nói cho người cao tuổi không quen gõ bàn phím

---

## Overview

Thêm nút microphone vào thanh tìm kiếm thuốc (MedsTab), sử dụng Web Speech API (browser native, zero server cost) để chuyển giọng nói thành text.

## User Stories

1. **Là người cao tuổi**, tôi khó gõ bàn phím nhỏ trên điện thoại, tôi muốn nói tên thuốc rồi AI tự tìm.

## Functional Requirements

- Nút 🎤 trong MedsTab search bar (bên cạnh nút camera)
- Bấm → Start listening → Visual indicator (sóng âm / pulse đỏ)
- Nhận diện tiếng Việt (`vi-VN` locale)
- Kết quả speech → Fill vào input → Auto-submit search
- Bấm lần 2 hoặc tự dừng khi im lặng → Stop listening

## Non-Functional Requirements

- Dùng `webkitSpeechRecognition` / `SpeechRecognition` (browser API)
- Không cần server, không tốn API quota
- Fallback: Nếu browser không hỗ trợ → Ẩn nút microphone
