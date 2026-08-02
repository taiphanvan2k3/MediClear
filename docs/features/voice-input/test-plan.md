# F5.3 — Voice Input — Test Plan

---

| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 1 | Nói tên thuốc | Bấm 🎤 → Nói "Paracetamol" | Input fill "Paracetamol", auto-search |
| 2 | Tiếng Việt | Bấm 🎤 → Nói "Amlodipin năm miligam" | Nhận diện đúng tiếng Việt |
| 3 | Stop listening | Bấm 🎤 → Im lặng 3s | Tự dừng, không treo |
| 4 | Toggle | Bấm 🎤 → Bấm lại | Dừng nghe |
| 5 | Unsupported browser | Mở trên Safari iOS cũ | Nút 🎤 ẩn đi |

## Manual Verification

- [ ] Test trên Chrome Android (giọng nói tiếng Việt thực tế)
- [ ] Verify visual indicator rõ ràng khi đang nghe
- [ ] Kiểm tra không xung đột với camera button
