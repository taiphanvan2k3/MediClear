# F2 — Drug Interaction Checker — Test Plan

---

## API Tests

| # | Test Case | Input | Expected |
|---|-----------|-------|----------|
| 1 | Known dangerous pair | Warfarin + Aspirin | severity: `high` or `critical` |
| 2 | Safe combination | Paracetamol + Vitamin C | severity: `none` or `low` |
| 3 | Moderate interaction | Amlodipin + Simvastatin | severity: `moderate` |
| 4 | Single medication | ["Metformin 500mg"] | No interactions, `safe` |
| 5 | Empty list | [] | 400 Bad Request |
| 6 | 5+ medications | Large combo | All pairs checked, reasonable time |

## Integration Tests

| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 1 | Manual check | Nhập 3 thuốc → Bấm kiểm tra | Kết quả hiển thị đúng severity |
| 2 | Auto-detect after scan | Scan đơn mới có thuốc conflict | Warning banner tự động hiện |
| 3 | No conflict scan | Scan đơn mới an toàn | Không hiện warning |

## Manual Verification

- [ ] Kiểm tra kết quả có chính xác so với nguồn y khoa
- [ ] Verify Sources link mở đúng trang web
- [ ] UI severity colors đúng design system (xanh/vàng/đỏ)
- [ ] Disclaimer hiển thị rõ ràng
