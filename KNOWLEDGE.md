# 🧠 MediClear — Knowledge Base (Kiến Thức Kỹ Thuật Tích Lũy)

> Tài liệu tổng hợp các kiến thức, cơ chế kiến trúc và giải thích kỹ thuật trong quá trình phát triển dự án MediClear.

---

## 📑 Mục lục kiến thức

1. [Cơ chế chạy Express.js (BE) và React + Vite (FE) trên cùng 1 Port](#1-cơ-chế-chạy-expressjs-be-và-react--vite-fe-trên-cùng-1-port)
2. [So sánh kiến trúc: ExpressJS (Clean) vs NestJS trong mô hình BFF](#2-so-sánh-kiến-trúc-expressjs-clean-vs-nestjs-trong-mô-hình-bff)
3. [Mô hình Clean Layered Architecture cho Node.js / Express](#3-mô-hình-clean-layered-architecture-cho-nodejs--express)
4. [Cơ chế Quota Google Search Grounding giữa các dòng model Gemini (2.5 Flash vs 3.x Flash-Lite)](#4-cơ-chế-quota-google-search-grounding-giữa-các-dòng-model-gemini-25-flash-vs-3x-flash-lite)
5. [Pipeline 2 Bước (Two-Stage Pipeline) Khi Tra Cứu Bằng Ảnh Chụp Nhãn Thuốc](#5-pipeline-2-bước-two-stage-pipeline-khi-tra-cứu-bằng-ảnh-chụp-nhãn-thuốc)
6. [Cơ chế PWA, Google WebAPK, Phím tắt SOS & Kiểm tra Trạng thái Cài đặt (Dẫn nguồn chuẩn Google/W3C)](#6-cơ-chế-pwa-google-webapk-phím-tắt-sos--kiểm-tra-trạng-thái-cài-đặt-dẫn-nguồn-chuẩn-googlew3c)
7. [Tránh lỗi Runtime "Illegal Constructor" do Browser Globals trong React TSX](#7-tránh-lỗi-runtime-illegal-constructor-do-browser-globals-trong-react-tsx)
8. [Nguyên tắc thiết kế Inset Grouped List chuẩn Clinical Modern Wellness](#8-nguyên-tắc-thiết-kế-inset-grouped-list-chuẩn-clinical-modern-wellness)
9. [Xử lý lỗi chập chờn trạng thái Đăng nhập khi Reload trang (Auth FOUC Flicker)](#9-xử-lý-lỗi-chập-chờn-trạng-thái-đăng-nhập-khi-reload-trang-auth-fouc-flicker)

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

---

## 6. Cơ chế PWA, Google WebAPK, Phím tắt SOS & Kiểm tra Trạng thái Cài đặt (Dẫn nguồn chuẩn Google/W3C)

### 📚 Tài liệu & Tiêu chuẩn kỹ thuật tham chiếu:
- **Google Developers (web.dev)**: [Customize PWA Installation](https://web.dev/articles/customize-install)
- **Google Developers (web.dev)**: [Get Installed Related Apps API](https://web.dev/articles/get-installed-related-apps)
- **MDN Web Docs**: [Navigator.getInstalledRelatedApps()](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getInstalledRelatedApps)
- **W3C Web App Manifest**: [App Shortcuts Specification](https://w3c.github.io/manifest-app-info/#shortcuts-member)

---

### ❓ Câu hỏi 1: Tại sao chạy trên HTTP IP (`http://10.x.x.x:3000`) chỉ là Lối tắt Chrome thường, còn lên HTTPS lại thành App WebAPK thật?

#### 🔍 Cơ chế của Google WebAPK Minting Service:
1. **Yêu cầu Secure Origin (HTTPS)**:
   - Google Chromium trên Android bắt buộc trang web phải được phục vụ qua **HTTPS** (hoặc `localhost`) thì mới kích hoạt cơ chế biên dịch **WebAPK**.
   - Nếu chạy qua HTTP không bảo mật (ví dụ IP mạng LAN), Chrome tự động hạ cấp từ *Ứng dụng WebAPK* xuống thành *Lối tắt Bookmark của Chrome (Web Bookmark Shortcut)*.
   - Đối với Lối tắt Bookmark thường, Android không tạo gói `.apk` ảo và không đăng ký Intent với Android OS, nên đè giữ icon chỉ hiện *"Xóa lối tắt"*.
2. **Khi chạy trên HTTPS**:
   - Chrome gửi `manifest.json` về **Google WebAPK Minting Service**.
   - Google tự động đóng gói ứng dụng thành **gói WebAPK ảo** cài thẳng vào Android Launcher.
   - Các phím tắt trong mảng `shortcuts` của `manifest.json` được Android đăng ký vào menu **Long-Press (Đè giữ)** của hệ thống:
     - 🚨 **"Gọi Người Thân SOS"** (`/?action=quick_sos`)
     - 📷 **"Quét Đơn Thuốc Mới"** (`/?action=scan`)
     - 💊 **"Tra Cứu Thuốc AI"** (`/?action=meds`)

```
   [Người dùng đè giữ Icon MediClear trên màn hình chính Android]
                               │
                               ▼
            ┌────────────────────────────────────────┐
            │ Native Android App Shortcuts Popover   │
            │  🚨 Gọi Người Thân SOS                 │ ────► Mở URL `/?action=quick_sos`
            │  📷 Quét Đơn Thuốc Mới                 │                    │
            │  💊 Tra Cứu Thuốc AI                   │                    ▼
            └────────────────────────────────────────┘       ┌────────────────────────┐
                                                             │ Code App.tsx bắt param │
                                                             │ và gọi `tel:<SĐT SOS>` │
                                                             │ tức thì trong 0.5s!    │
                                                             └────────────────────────┘
```

---

### ❓ Câu hỏi 2: Khi người dùng mở tab Web trong Chrome, làm sao Chrome biết được người dùng đã cài App hay đã gỡ App khỏi máy?

Theo đặc tả của **Google Chromium Engine**:

1. **Khi WebAPK ĐANG CÀI trên máy**:
   - Khi người dùng truy cập trang web trong tab Chrome, engine của Chrome sẽ truy vấn **Android PackageManager** của thiết bị.
   - Thấy WebAPK tương ứng với `manifest.id` đã tồn tại trên máy, Chrome **tự động triệt tiêu (suppress), không phát sự kiện `beforeinstallprompt`** vào trang web nữa để tránh hiển thị nút cài đặt dư thừa.
2. **Khi người dùng ĐÃ GỠ / XÓA WebAPK khỏi máy**:
   - Lần tiếp theo người dùng mở trang web trong tab Chrome, Chrome kiểm tra Android PackageManager thấy gói WebAPK **không còn tồn tại**.
   - Vì trang web đáp ứng đầy đủ tiêu chí PWA (HTTPS, Manifest, Service Worker), **Chrome lập tức phát sự kiện `beforeinstallprompt`**.
   - Ứng dụng web bắt sự kiện này và **tự động hiển thị lại thanh Banner Cài đặt trên Header**.
3. **API chính thức `navigator.getInstalledRelatedApps()`**:
   - Trang web có thể gọi trực tiếp hàm này:
     ```ts
     const relatedApps = await navigator.getInstalledRelatedApps();
     // relatedApps.length > 0 -> App đang cài trên máy
     // relatedApps.length === 0 -> App chưa cài hoặc đã bị người dùng xóa
     ```

---

### ⚙️ Các yêu cầu bắt buộc trong `public/manifest.json` để Google WebAPK chấp nhận:
- Có `"scope": "/"` và `"start_url": "/"`.
- `"display": "standalone"`.
- Bắt buộc có **icon PNG raster** chuẩn kích thước:
  - `192x192` PNG (`purpose: "any"`)
  - `512x512` PNG (`purpose: "any maskable"`)
  - `96x96` PNG cho từng icon trong mảng `shortcuts`.
- Phải có một **Service Worker** (`sw.js`) đang hoạt động với sự kiện `fetch`.

### ⚡ Chiến lược Cache Service Worker: `Network-First`
- Để tránh hiện tượng điện thoại giữ cache HTML/JS cũ sau khi code thay đổi, `public/sw.js` sử dụng chiến lược **Network-First**: Luôn ưu tiên lấy code mới nhất từ Server, chỉ fallback sang Cache khi mất mạng (Offline).

---

## 7. Tránh lỗi Runtime "Illegal Constructor" do Browser Globals trong React TSX

### ❓ Hiện tượng
Khi người dùng truy cập màn hình chưa đăng nhập, trang bị sập hoàn toàn và console báo lỗi:
```
Uncaught TypeError: Illegal constructor at Object.react_stack_bottom_frame
```

### 🔍 Nguyên nhân
- Trong React TSX, nếu lập trình viên sử dụng một component icon (ví dụ `<Lock />`, `<Option />`, `<Image />`, `<Notification />`, `<Location />`) nhưng **quên `import` từ thư viện `lucide-react`**:
- JavaScript không báo lỗi thiếu biến lúc build nếu biến đó trùng tên với một **Đối tượng toàn cục của trình duyệt (Browser Global Constructor)** (ví dụ: Web Locks API `window.Lock`, `window.Option`, `window.Notification`).
- Khi React cố gắng render `<Lock />` dưới dạng component React (`new window.Lock()`), trình duyệt sẽ ném lỗi `TypeError: Illegal constructor` do không được phép khởi tạo đối tượng hệ thống này qua React.

### 🛡️ Cách phòng tránh:
- Luôn kiểm tra kỹ danh sách `import { Lock, ... } from "lucide-react"`.
- Cấu hình ESLint rule `no-undef` để bắt các biến toàn cục không mong muốn.

---

## 8. Nguyên tắc thiết kế Inset Grouped List chuẩn Clinical Modern Wellness

### ❓ Vấn đề: Giao diện Mobile rời rạc
Khi thiết kế ứng dụng cho điện thoại, nếu mỗi tùy chọn (Cài đặt, Cỡ chữ, SOS...) đều nằm trong một Card trắng riêng biệt viền nổi, màn hình sẽ bị "vụn", khoảng trống trắng quá nhiều, tạo cảm giác thô kệch và kém chuyên nghiệp.

### 🎨 Giải pháp: Mô hình Inset Grouped List (Chuẩn Apple Health / Modern Settings)
1. **Phân nhóm thành 3 tầng rõ ràng**:
   - **Hero Profile Card**: Chứa thông tin nhận diện cốt lõi (Avatar, Tên, Email, Xưng hô AI).
   - **Health Card**: Chứa dữ liệu y tế (Nhãn bệnh nền đang theo dõi).
   - **Grouped Settings Card**: Gộp toàn bộ các tùy chọn hệ thống (SOS, Cỡ chữ) vào **1 thẻ duy nhất** có đường phân cách mỏng (`divide-stone-100`).
2. **Nguyên tắc Render Modal dùng chung**:
   - Tất cả các Modal hướng dẫn / chỉnh sửa (như Settings Modal) phải được render ở phạm vi dùng chung của component (bên ngoài các lệnh `if (!user) return ...`), đảm bảo modal hoạt động mượt mà ở cả trạng thái đã đăng nhập và chưa đăng nhập.

---

## 9. Xử lý lỗi chập chờn trạng thái Đăng nhập khi Reload trang (Auth FOUC Flicker)

### ❓ Hiện tượng: Flash of Unauthenticated Content (FOUC)
Khi người dùng đã đăng nhập và bấm F5 / Reload trang:
1. Trong khoảng **200ms – 500ms** đầu tiên, Header hiển thị nút màu cam **"Đăng nhập"**.
2. Ngay sau khi Firebase Auth tải xong session từ IndexedDB, nút "Đăng nhập" đột ngột biến mất và nhảy thành **Avatar + Tên người dùng**.
3. Hiện tượng này làm giao diện bị giật (Layout Shift) và tạo cảm giác ứng dụng phản hồi chậm chạp.

### 🔍 Nguyên nhân kỹ thuật
- `onAuthStateChanged` của Firebase Auth là **Bất đồng bộ (Asynchronous)**. Nó cần thời gian để đọc token và giải mã session từ trình duyệt.
- Trong tick render đầu tiên (0ms), React state `user` ban đầu luôn là `null`.
- Do `user === null`, các component như `Navbar.tsx`, `ProfileTab.tsx` lập tức render giao diện "Chưa đăng nhập" trước khi Firebase kịp phản hồi.

```
[F5 / Reload Trang] ──► Render Tick 0ms (user = null) ──► Hiện nút "ĐĂNG NHẬP" (SAI LẦM)
                                │
                        (Chờ 300ms Firebase tải session)
                                ▼
                       Firebase trả về User ────────► Đột ngột biến thành "AVATAR + TÊN" (GIẬT UI)
```

### 💡 Giải pháp Kiến Trúc 2 Lớp (Two-Layer Optimistic Hydration):

```
                                  [F5 / Reload Trang]
                                           │
                        ┌──────────────────┴──────────────────┐
                        ▼                                     ▼
        1. Zustand Synchronous Persist               2. Firebase Async onAuthStateChanged
          (Đọc `cachedUser` từ LocalStorage            (Khởi tạo kết nối IndexedDB ngầm
              ngay tại 0ms đồng bộ)                        trong khoảng 300ms)
                        │                                     │
                        ▼                                     ▼
             currentUser = user || cachedUser         Cập nhật User mới nhất từ Google
                        │                                     │
                        ▼                                     ▼
         ┌─────────────────────────────┐           isAuthReady = true
         │ NAVBAR RENDER NGAY 0ms:     │           (Khớp 100% Token bảo mật)
         │  [Avatar] Tài Phan Văn      │
         │  (Không một giây chập chờn!)│
         └─────────────────────────────┘
```

#### 1. Lớp 1: Lưu trữ Snapshot Đồng Bộ (`cachedUser`)
- Trong [src/store/useAuthStore.ts](file:///d:/SelfLearning/AIRiser2026/MediClear/src/store/useAuthStore.ts), định nghĩa `cachedUser`: `{ uid, displayName, email, photoURL }`.
- Cấu hình Zustand `persist` lưu `cachedUser` vào `localStorage`.
- Khi F5, Zustand khôi phục dữ liệu này **đồng bộ ngay tại 0ms**:
  ```ts
  const currentUser = user || cachedUser;
  ```
- Nhờ đó, Navbar hiển thị Avatar và Tên ngay trong khung hình đầu tiên, không có độ trễ!

#### 2. Lớp 2: Cổng Trạng Thái Khởi Tạo (`isAuthReady`) & Skeleton Placeholder
- Nếu người dùng thực sự **Chưa từng đăng nhập** (hoặc vừa Clear Cache): `cachedUser` là `null` và `isAuthReady` là `false`.
- Thay vì vội vàng hiện nút "Đăng nhập", Header hiển thị một khối **Skeleton Placeholder mờ (`animate-pulse`)**:
  ```tsx
  {!isAuthReady ? (
    <div className="w-20 h-7 rounded-full bg-stone-200/60 animate-pulse"></div>
  ) : (
    <button onClick={handleLogin}>Đăng nhập</button>
  )}
  ```
- Nút "Đăng nhập" chỉ hiển thị khi `isAuthReady === true` và `currentUser === null`.

#### 3. Xử lý Đăng xuất An toàn:
- Khi người dùng bấm **Đăng xuất (`logoutApi`)**, hàm `setUser(null)` sẽ đồng thời xóa sạch `user = null`, `cachedUser = null` và `cachedAccessToken = null`, đảm bảo không lưu thông tin dư thừa.
