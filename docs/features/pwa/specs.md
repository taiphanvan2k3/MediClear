# F5.2 — PWA Support — Specs

> Progressive Web App: Cài lên Home Screen + Offline basic viewing

---

## Overview

Cho phép cài MediClear lên Home Screen như native app, với offline support cho lịch sử thuốc đã lưu.

## Functional Requirements

- `public/manifest.json` — App name, icons, theme color (emerald)
- Service Worker — Cache static assets + localStorage data
- "Add to Home Screen" prompt
- Offline: Xem được lịch sử thuốc đã lưu (từ cache)
- Online: Full functionality

## Files
- [NEW] `public/manifest.json`
- [NEW] `public/sw.js` (Service Worker)
- [MODIFY] `index.html` — Link manifest + register SW

## Tasks
- [ ] Tạo `manifest.json` (name, icons, theme, display: standalone)
- [ ] Tạo `sw.js` (cache static assets)
- [ ] Register Service Worker trong `index.html`
- [ ] Test: Install PWA trên Chrome Android

## Test Plan
| # | Test | Expected |
|---|------|----------|
| 1 | Install prompt | Chrome hiện "Add to Home Screen" |
| 2 | Installed app | Mở từ Home Screen, fullscreen |
| 3 | Offline view | Tắt mạng → Xem lịch sử cũ OK |
| 4 | Online restore | Bật mạng → Full features hoạt động |
