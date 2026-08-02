# F4 — Cloud Sync — Tasks

---

- [ ] Tạo `firestore.rules` — Security rules cho tất cả collections
- [ ] Cập nhật `App.tsx` — Write-through Firestore
  - [ ] `handleSaveResult()` → Lưu record lên Firestore
  - [ ] `handleSaveMedSearchHistory()` → Lưu med search lên Firestore
  - [ ] `handleDeleteRecord()` → Xóa trên Firestore
  - [ ] `handleDeleteMedSearchItem()` → Xóa trên Firestore
- [ ] Cập nhật `App.tsx` — Fetch on login
  - [ ] Fetch `records` collection → Merge với localStorage
  - [ ] Fetch `medSearches` collection → Merge
- [ ] Enable offline persistence trong `firebase.ts`
- [ ] Test: Login → Add → Logout → Clear cache → Login → Verify
