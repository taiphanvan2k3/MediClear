# F3 — SOS Emergency — Tasks

---

- [ ] Tạo `src/components/SOSButton.tsx`
  - [ ] Floating button layout (fixed position)
  - [ ] Configured state: nút đỏ + icon Phone
  - [ ] Unconfigured state: nút xám + "Cài SOS"
  - [ ] Pulse animation
  - [ ] `tel:` trigger on tap
- [ ] Render SOSButton trong `App.tsx`
  - [ ] Pass emergency contact data từ userProfile
  - [ ] onSetup callback → chuyển tới ProfileTab
- [ ] Test trên mobile (Chrome Android)
  - [ ] Verify mở dialer khi bấm
  - [ ] Verify không che BottomNav
  - [ ] Verify không che nội dung chính
