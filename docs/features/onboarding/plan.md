# F5.1 — Onboarding — Plan, Tasks & Test Plan

## Plan
- [NEW] `src/components/OnboardingScreen.tsx`
- [MODIFY] `src/App.tsx` — Show onboarding if `!localStorage.mediClear_onboarded`

## Tasks
- [ ] Tạo `OnboardingScreen.tsx` — 3 slide + animation
- [ ] Nút "Bắt đầu" → Trigger login → Mark onboarded
- [ ] Skip option
- [ ] Render trong App.tsx (conditional)
- [ ] Test: Xóa localStorage → Mở app → Thấy onboarding

## Test Plan
| # | Test | Expected |
|---|------|----------|
| 1 | Lần đầu mở | Thấy 3 slide onboarding |
| 2 | Swipe slides | Animation mượt |
| 3 | Bấm "Bắt đầu" | Login → Setup → Main app |
| 4 | Mở lại | Không thấy onboarding nữa |
| 5 | Skip | Vào thẳng main app |
