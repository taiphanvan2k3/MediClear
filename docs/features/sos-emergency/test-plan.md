# F3 — SOS Emergency — Test Plan

---

## Tests

| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 1 | SOS configured | Cài SOS trong Profile → Bấm nút SOS | Mở dialer với đúng số đã cài |
| 2 | SOS not configured | Chưa cài SOS → Bấm nút SOS | Chuyển tới ProfileTab setup |
| 3 | Button visibility | Scroll trang dài | Nút luôn nổi, không bị che |
| 4 | Button position | Mở app trên mobile | Không đè lên BottomNav |
| 5 | Pulse animation | Quan sát nút SOS | Animation pulse nhẹ, dễ nhận biết |

## Manual Verification

- [ ] Test trên Chrome Android thực tế
- [ ] Verify `tel:` protocol mở app gọi điện
- [ ] Kiểm tra accessibility (touch target >= 56px)
- [ ] Kiểm tra cỡ chữ to mode (isLargeText)
