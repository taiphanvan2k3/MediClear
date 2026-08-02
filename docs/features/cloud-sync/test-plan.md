# F4 — Cloud Sync — Test Plan

---

| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 1 | Save to cloud | Đăng nhập → Scan đơn thuốc → Lưu | Record xuất hiện trong Firestore Console |
| 2 | Fetch on login | Logout → Login lại | Data hiển thị đầy đủ |
| 3 | Cross-device | Login trên thiết bị khác | Thấy cùng data |
| 4 | Delete sync | Xóa 1 record | Record biến mất trên cả local + Cloud |
| 5 | Offline mode | Tắt mạng → Thêm data → Bật mạng | Data sync lên Cloud khi online |
| 6 | Security | Cố truy cập data user khác | Permission denied |

## Manual Verification

- [ ] Check Firestore Console → Verify data structure đúng
- [ ] Test trên 2 trình duyệt khác nhau cùng 1 account
- [ ] Verify security rules block unauthorized access
