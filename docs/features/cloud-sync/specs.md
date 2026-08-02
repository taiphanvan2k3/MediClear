# F4 — Cloud Sync — Specs

> Đồng bộ toàn bộ dữ liệu lên Firestore, không mất dữ liệu khi đổi thiết bị

---

## Overview

Hiện tại chỉ profile được lưu Firestore. Feature này mở rộng Firestore CRUD cho tất cả records, lịch sử tra cứu, và kết quả scan AI.

## User Stories

1. **Là người dùng**, tôi muốn đăng nhập trên thiết bị khác và vẫn thấy đầy đủ lịch sử khám & thuốc.
2. **Là người dùng**, tôi muốn dữ liệu không bị mất khi xóa cache trình duyệt.

## Functional Requirements

### Firestore Collections
```
users/{uid}/
  profile/info              ← ✅ Đã có
  records/{recordId}        ← Mở rộng: full HistoryRecord
  medSearches/{searchId}    ← Mới: MedSearchHistoryItem
  scans/{scanId}            ← Mới: PrescriptionScanResult + ảnh
```

### Sync Logic
- **Write**: Mỗi khi thêm/sửa/xóa → Cập nhật cả localStorage + Firestore
- **Read**: Khi đăng nhập → Fetch từ Firestore → Merge với localStorage
- **Conflict resolution**: Cloud data wins (newer timestamp)
- **Offline**: Fallback localStorage, sync khi online lại (Firestore offline persistence)

## Non-Functional Requirements

- Ảnh lưu base64 trong Firestore document (max 1MB/doc)
- Nếu ảnh > 1MB → Nén hoặc dùng Firebase Storage (future)
- Firestore Security Rules: Chỉ user đọc/ghi data của chính mình
