# 🧠 MediClear — Knowledge Base (Kiến Thức Kỹ Thuật Tích Lũy)

> Tài liệu tổng hợp các kiến thức, cơ chế kiến trúc và giải thích kỹ thuật trong quá trình phát triển dự án MediClear.

---

## 📑 Mục lục kiến thức

1. [Cơ chế chạy Express.js (BE) và React + Vite (FE) trên cùng 1 Port](#1-cơ-chế-chạy-expressjs-be-và-react--vite-fe-trên-cùng-1-port)
2. [So sánh kiến trúc: ExpressJS (Clean) vs NestJS trong mô hình BFF](#2-so-sánh-kiến-trúc-expressjs-clean-vs-nestjs-trong-mô-hình-bff)
3. [Mô hình Clean Layered Architecture cho Node.js / Express](#3-mô-hình-clean-layered-architecture-cho-nodejs--express)
4. [Cơ chế Quota Google Search Grounding giữa các dòng model Gemini (2.5 Flash vs 3.x Flash-Lite)](#4-cơ-chế-quota-google-search-grounding-giữa-các-dòng-model-gemini-25-flash-vs-3x-flash-lite)
5. [Pipeline 2 Bước (Two-Stage Pipeline) Khi Tra Cứu Bằng Ảnh Chụp Nhãn Thuốc](#5-pipeline-2-bước-two-stage-pipeline-khi-tra-cứu-bằng-ảnh-chụp-nhãn-thuốc)

---

## 1. Cơ chế chạy Express.js (BE) và React + Vite (FE) trên cùng 1 Port

### ❓ Vấn đề thường gặp
Thông thường khi lập trình Fullstack:
- Vite Dev Server chạy ở cổng riêng (ví dụ `http://localhost:5173`).
- NodeJS / Express Server chạy ở cổng riêng (ví dụ `http://localhost:3000`).
- Phải mở 2 Terminal và cấu hình CORS hoặc Proxy để giao tiếp.

### 💡 Bản chất giải pháp (Vite Middleware Mode)
Trong MediClear, **chỉ có duy nhất 1 server Express** mở cổng `3000`. Express đóng vai trò làm "Nhạc trưởng" điều phối mọi request từ trình duyệt.

```
                      Request từ trình duyệt (http://localhost:3000)
                                        │
                                        ▼
                               ┌─────────────────┐
                               │  Express Server │ (Lắng nghe tại PORT 3000)
                               └────────┬────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    ▼                                       ▼
         Đường dẫn `/api/...`                     Tất cả đường dẫn còn lại
      (ví dụ: `/api/meds/search`)                (ví dụ: `/`, `/src/App.tsx`, `.css`)
                    │                                       │
                    ▼                                       ▼
        [API Routes của Backend]                  ┌───────────────────┐
          (Trả về dữ liệu JSON)                   │  Môi trường chạy? │
                                                  └─────────┬─────────┘
                                           Development      │     Production
                                         ┌──────────────────┘          └──────────────────┐
                                         ▼                                                ▼
                                [Vite Middleware]                                 [express.static]
                       (Vite biên dịch React TSX/CSS                         (Trả file tĩnh HTML/JS/CSS
                         trực tiếp + Hot Reload HMR)                             trong thư mục `dist/`)
```

### ⚙️ Chi tiết 2 chế độ:
1. **Development (`NODE_ENV !== 'production'`)**:
   - Dùng hàm `createViteServer({ server: { middlewareMode: true }, appType: 'spa' })`.
   - Toàn bộ tính năng biên dịch JSX/TSX và Hot Module Replacement (HMR) của Vite được nhúng trực tiếp thành một **Express Middleware** (`app.use(vite.middlewares)`).
2. **Production (`NODE_ENV === 'production'`)**:
   - Sau khi chạy `npm run build`, code React được đóng gói thành các file tĩnh HTML/CSS/JS trong thư mục `dist/`.
   - Express dùng `express.static(distPath)` để gửi file tĩnh và `app.get('*')` trả về `dist/index.html` (SPA Fallback).

### 🌟 Lợi ích:
- **Không bao giờ bị lỗi CORS**: FE và BE cùng chung origin `http://localhost:3000`.
- **Tiện lợi**: 1 lệnh `npm run dev` chạy cả hệ thống.
- **Deploy 1-Click**: Đóng gói thành 1 Docker container duy nhất cho Google Cloud Run.

---

## 2. So sánh kiến trúc: ExpressJS (Clean) vs NestJS trong mô hình BFF

### 🎯 Khái niệm BFF (Backend-For-Frontend)
BFF là tầng backend trung gian phục vụ trực tiếp cho frontend: giấu API Key (`GEMINI_API_KEY`), chuẩn hóa dữ liệu, điều phối AI và tích hợp Google APIs.

| Tiêu chí | Express.js (Clean Architecture) | NestJS (Enterprise Standard) |
|---|---|---|
| **Độ phức tạp** | Siêu nhẹ, ít boilerplate, tốc độ khởi động < 0.5s. | Cần nhiều Decorators (`@Injectable()`, `@Controller()`), Modules, Metadata reflection. |
| **Phù hợp với** | BFF, dự án thi hackathon, startup MVP, API vừa và nhỏ. | Hệ thống lớn hàng chục Microservices, SQL ORM (TypeORM, Prisma). |
| **Cơ chế 1-Port** | Hỗ trợ tự nhiên qua `vite.middlewares`. | Thường phải tách 2 Port (`3001` và `3000`) và dùng Vite Proxy. |
| **Kiến trúc** | Tự thiết kế theo Clean Architecture (Controller/Service/Middleware). | Có sẵn khung chuẩn Dependency Injection (DI) bắt buộc. |

---

## 3. Mô hình Clean Layered Architecture cho Node.js / Express

### 🏗️ Sơ đồ phân tầng trách nhiệm (Separation of Concerns)
```
server/
├── config/env.ts              # Nạp và validate tập trung biến môi trường (PORT, API Key)
├── middlewares/
│   ├── errorHandler.ts        # Bắt mọi lỗi tập trung, trả response JSON chuẩn
│   ├── requestLogger.ts       # Ghi log thời gian phản hồi API (ms)
│   └── vite.ts                # Đóng gói Vite Dev vs Production Static
├── controllers/               # Xử lý HTTP Request/Response, validate params
│   └── meds.controller.ts
├── services/                  # Business Logic thuần túy (gọi Gemini AI, 3-tier fallback)
│   ├── gemini.ts
│   └── meds.service.ts
├── routes/                    # Khai báo URL endpoint
│   ├── meds.ts
│   └── index.ts               # Master API Router (/api)
├── app.ts                     # Express App Factory (gắn middlewares & routes)
└── index.ts                   # Entry point khởi chạy & Graceful Shutdown (SIGINT, SIGTERM)
```

### 💡 Quy tắc đặt tên hàm nội bộ (Private Helpers)
- Các hàm chỉ dùng nội bộ trong 1 file (không export) nên bắt đầu bằng dấu gạch dưới `_` (ví dụ: `_setupViteDevMiddleware`, `_setupStaticProductionMiddleware`).
- Các hàm / class cung cấp cho bên ngoài dùng từ khóa `export`.

---

## 4. Cơ chế Quota Google Search Grounding giữa các dòng model Gemini (2.5 Flash vs 3.x Flash-Lite)

### ❓ Hiện tượng thực nghiệm
Khi gọi API với model `gemini-3.1-flash-lite` hoặc `gemini-3.5-flash-lite`:
1. **Gọi Prompt thông thường (không kèm tools)**: ✅ **Thành công 100%** (Phản hồi cực nhanh).
2. **Gọi kèm công cụ tìm kiếm `{ googleSearch: {} }` (Search Grounding)**: ❌ Bị lỗi ngay lập tức:
   ```json
   {"error": {"code": 429, "message": "You exceeded your current quota...", "status": "RESOURCE_EXHAUSTED"}}
   ```
Trong khi đó, gọi `gemini-2.5-flash` và `gemini-2.5-flash-lite` kèm Search Grounding thì lại **chạy mượt mà 100%**.

### 🔍 Nguyên nhân cốt lõi (Root Cause theo Tài liệu Chính Thức Google)
1. **Feature-Specific Quota (Hạn mức riêng cho công cụ tìm kiếm)**:
   - Trong Google GenAI API, **Google Search Grounding** được quản lý theo một hạn mức Quota **độc lập hoàn toàn** với hạn mức Model Tokens/RPM.
   - Ngay cả khi tài khoản của bạn còn dư 100% hạn mức gọi Model Inference, nếu **Grounding Quota** chưa được cấp hoặc vượt quá giới hạn per-minute, API sẽ lập tức trả về lỗi `429 RESOURCE_EXHAUSTED`.

2. **Chính sách phân bổ & Chi phí của dòng Gemini 3.x**:
   - Đối với dòng **Gemini 3.x Models** (`gemini-3.1-flash-lite`, `gemini-3.5-flash-lite`): Google áp dụng chính sách cấp 5,000 lượt grounding/tháng và sau đó tính phí **$14 / 1,000 grounding queries**.
   - Trên tài khoản Free Tier (chưa liên kết Google Cloud Billing Account), Google giới hạn hạn mức tìm kiếm tức thời (Per Minute / Concurrency) của dòng 3.x cực kỳ nghiêm ngặt, khiến các request kèm `{ googleSearch: {} }` bị từ chối bằng mã 429.
   - Ngược lại, dòng **Gemini 2.5 Flash (`gemini-2.5-flash`, `gemini-2.5-flash-lite`)** sử dụng cơ chế cấp quota truyền thống, hỗ trợ Search Grounding mượt mà trên các API Key tiêu chuẩn.

### 🛡️ Giải pháp Kiến Trúc: Custom Medical Search Grounding Engine
Để phá vỡ hoàn toàn rào cản hạn mức tìm kiếm của Google, MediClear đã xây dựng **Custom Medical Search Grounding Engine** ([`server/services/webSearch.service.ts`](file:///d:/SelfLearning/AIRiser2026/MediClear/server/services/webSearch.service.ts)):
1. **Tự động cào/tìm kiếm thông tin thuốc** từ các nguồn y tế hàng đầu Việt Nam (*Bệnh viện Vinmec, Nhà thuốc FPT Long Châu, Bệnh viện Tâm Anh, Dược thư Quốc gia, Medlatec*) hoặc qua **Tavily Search API**.
2. **Cung cấp ngữ cảnh thực tế (Web Context) cho Gemini 3.1 & 3.5 Flash-Lite** tổng hợp thông tin, trích xuất liều dùng, công dụng, lưu ý ăn uống và gán link nguồn trích dẫn thật (`sources`).
3. **Ưu điểm vượt trội**:
   - Hoạt động **100% miễn phí**, không phụ thuộc vào gói cước Grounding của Google AI Studio.
   - Luôn cập nhật thông tin dược học mới nhất và trả về link bài viết thực tế cho người cao tuổi tra cứu.

---

## 5. Pipeline 2 Bước (Two-Stage Pipeline) Khi Tra Cứu Bằng Ảnh Chụp Nhãn Thuốc

### ❓ Vấn đề kỹ thuật
Tavily là công cụ tìm kiếm qua chuỗi văn bản (Text-based Search). Khi người cao tuổi chỉ chụp ảnh hộp/vỉ thuốc mà không gõ chữ, làm thế nào để Tavily tìm kiếm được?

### 💡 Quy trình Two-Stage Recognition & Grounding Pipeline
MediClear sử dụng quy trình 2 bước tự động trong [`server/services/meds.service.ts`](file:///d:/SelfLearning/AIRiser2026/MediClear/server/services/meds.service.ts):

```
[Người dùng chụp ảnh vỏ hộp / vỉ thuốc]
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 1: Quick Vision OCR (Gemini 3.1 Flash-Lite)            │
│  - "Nhìn" ảnh và trích xuất nhanh tên thuốc + hàm lượng     │
│  - Ví dụ: Đọc được chữ "Amlodipin 5mg"                      │
└──────────────────────────────┬──────────────────────────────┘
                               │
               (Tên thuốc: "Amlodipin 5mg")
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 2: Live Medical Search (Tavily Search API)             │
│  - Tìm kiếm bài viết y khoa & phác đồ điều trị thời gian    │
│    thực từ Vinmec, Tâm Anh, Long Châu...                    │
│  - Lấy nội dung tóm tắt & đường link bài viết gốc           │
└──────────────────────────────┬──────────────────────────────┘
                               │
           (Ảnh gốc + Dữ liệu tra cứu thời gian thực)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 3: Tổng hợp & Trình bày (Gemini 3.1 Flash-Lite)        │
│  - Trả về JSON sạch: Liều dùng, Công dụng, Lưu ý ăn uống   │
│  - Đính kèm link bài viết gốc cho người bệnh đối chiếu      │
└─────────────────────────────────────────────────────────────┘
```



