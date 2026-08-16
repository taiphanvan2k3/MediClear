# 🧠 MediClear — Knowledge Base (Kiến Thức Kỹ Thuật Tích Lũy)

> Tài liệu tổng hợp các kiến thức, cơ chế kiến trúc và giải thích kỹ thuật trong quá trình phát triển dự án MediClear.

---

## 📑 Mục lục kiến thức

1. [Cơ chế chạy Express.js (BE) và React + Vite (FE) trên cùng 1 Port](#1-cơ-chế-chạy-expressjs-be-và-react--vite-fe-trên-cùng-1-port)
2. [So sánh kiến trúc: ExpressJS (Clean) vs NestJS trong mô hình BFF](#2-so-sánh-kiến-trúc-expressjs-clean-vs-nestjs-trong-mô-hình-bff)
3. [Mô hình Clean Layered Architecture cho Node.js / Express](#3-mô-hình-clean-layered-architecture-cho-nodejs--express)

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
