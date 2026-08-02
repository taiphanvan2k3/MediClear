# F2 — Drug Interaction Checker — Specs

> Kiểm tra tương tác nguy hiểm giữa các thuốc đang dùng bằng Gemini AI + Google Search Grounding

---

## Overview

Khi người cao tuổi dùng nhiều thuốc cùng lúc (đa thuốc), một số cặp thuốc có thể tương tác gây tác dụng phụ nguy hiểm. Feature này tự động phát hiện và cảnh báo các tương tác thuốc tiềm ẩn.

## User Stories

1. **Là người cao tuổi**, tôi đang uống 3 loại thuốc, tôi muốn biết chúng có "đánh nhau" không.
2. **Là người cao tuổi**, khi bác sĩ kê thêm thuốc mới, tôi muốn AI kiểm tra xem thuốc mới có xung đột với thuốc đang uống không.
3. **Là con/cháu**, tôi muốn app tự động cảnh báo nếu bố/mẹ tôi được kê đơn có thuốc tương tác nguy hiểm.

## Functional Requirements

### Input
- Danh sách thuốc đang dùng (từ lịch sử scan hoặc nhập tay)
- Thuốc mới vừa được kê (từ kết quả scan đơn thuốc)

### Processing
- Gửi danh sách thuốc → Gemini AI + Google Search Grounding
- Phân tích từng cặp thuốc (n*(n-1)/2 cặp)
- Tra cứu thông tin tương tác từ nguồn y khoa uy tín

### Output Schema

```typescript
interface DrugInteractionResult {
  interactions: DrugInteraction[];
  overallSafety: 'safe' | 'caution' | 'dangerous';
  summary: string;
  checkedAt: string;
}

interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'none' | 'low' | 'moderate' | 'high' | 'critical';
  description: string;
  recommendation: string;
  sources?: { title: string; uri: string }[];
}
```

### UI Display
- Danh sách thuốc đang dùng (editable)
- Nút "🔍 Kiểm tra tương tác"
- Kết quả: Matrix hoặc list view
  - `safe` → Badge xanh ✅
  - `caution` → Badge vàng ⚠️
  - `dangerous` → Banner đỏ 🚨 với cảnh báo mạnh
- Auto-trigger: Khi scan đơn thuốc mới (F1) → Tự kiểm tra với thuốc cũ

## Non-Functional Requirements

- Response time: < 10 giây
- Dùng Search Grounding để tra cứu real-time, không dựa vào knowledge cutoff
- Disclaimer: "Thông tin tham khảo, không thay thế tư vấn bác sĩ"
