# F1 — AI Prescription & Lab Scan — Specs

> Quét và phân tích đơn thuốc / phiếu xét nghiệm thực tế bằng Gemini AI Multimodal Vision

---

## Overview

Tính năng cốt lõi của MediClear: Người dùng chụp/tải ảnh đơn thuốc (chữ viết tay hoặc in) hoặc phiếu xét nghiệm → Gemini AI đọc, trích xuất và phân tích thành dữ liệu có cấu trúc → Hiển thị kết quả dễ đọc cho người cao tuổi.

## User Stories

1. **Là người cao tuổi**, tôi muốn chụp ảnh đơn thuốc bác sĩ vừa kê → AI đọc giúp tôi biết phải uống thuốc gì, liều lượng bao nhiêu, lúc nào.
2. **Là người cao tuổi**, tôi muốn chụp ảnh phiếu xét nghiệm máu → AI cho biết chỉ số nào bình thường, chỉ số nào bất thường cần lo.
3. **Là con/cháu chăm sóc**, tôi muốn chụp đơn thuốc của bố/mẹ → Lưu lại lịch sử để theo dõi.

## Functional Requirements

### Input
- 1 hoặc nhiều ảnh (JPEG/PNG, max 10MB mỗi ảnh)
- Hỗ trợ: Chụp camera trực tiếp HOẶC chọn từ album
- Loại tài liệu: Đơn thuốc viết tay, đơn thuốc in, phiếu xét nghiệm máu/nước tiểu/sinh hóa

### Processing
- Gửi ảnh(s) base64 → Express API → Gemini 2.5 Flash (multimodal)
- Prompt yêu cầu trả về **Structured JSON** (không dùng Markdown)
- Auto-detect loại tài liệu: `prescription` | `lab_result` | `mixed`

### Output — Prescription Scan Result Schema

```typescript
interface PrescriptionScanResult {
  documentType: 'prescription' | 'lab_result' | 'mixed';
  facility?: string;          // "Bệnh viện Tim Hà Nội"
  doctor?: string;            // "BS. Nguyễn Thị Mai"
  date?: string;              // "15/07/2024"
  diagnosis?: string;         // "Tăng huyết áp độ 2"
  medications: MedicationItem[];
  labResults: LabResultItem[];
  overallAdvice: string;      // Lời khuyên tổng hợp cho bệnh nhân
  confidence: number;         // 0.0 - 1.0
}

interface MedicationItem {
  name: string;               // "Amlodipin 5mg"
  dosage: string;             // "1 viên/ngày"
  frequency: string;          // "Sáng sau ăn"
  duration?: string;          // "Dùng liên tục"
  purpose?: string;           // "Hạ huyết áp"
  warnings: string[];         // ["Không uống cùng nước ép bưởi"]
}

interface LabResultItem {
  name: string;               // "Glucose"
  value: string;              // "8.5"
  unit: string;               // "mmol/L"
  status: 'normal' | 'high' | 'low' | 'critical';
  normalRange?: string;       // "3.9 - 6.1 mmol/L"
  interpretation?: string;    // "Vượt ngưỡng an toàn"
}
```

### UI Display
- Kết quả hiện dạng card list, mỗi thuốc 1 card
- Chỉ số xét nghiệm bất thường: Highlight vàng/đỏ
- Mỗi card thuốc có nút "📅 Tạo lịch nhắc" → Google Calendar
- Nút "💾 Lưu vào Lịch sử"
- Confidence score hiển thị dạng badge

## Non-Functional Requirements

- Response time: < 8 giây cho 1 ảnh, < 15 giây cho 3+ ảnh
- Graceful fallback nếu Gemini không đọc được chữ
- Không gửi dữ liệu y tế lên bên thứ 3 ngoài Google
