# F3 — SOS Emergency — Implementation Plan

---

## Files to Create/Modify

### [NEW] `src/components/SOSButton.tsx`
- Floating button component
- Props: `emergencyPhone`, `emergencyName`, `onSetup` callback
- Conditional render: configured vs not-configured state
- `tel:` link trigger on tap
- Pulse animation via Tailwind

### [MODIFY] `src/App.tsx`
- Render `<SOSButton />` between main content and BottomNav
- Pass `userProfile.emergencyPhone` and `userProfile.emergencyName`
- `onSetup` → navigate to ProfileTab

---

## Execution Order

1. Create `SOSButton.tsx` component
2. Add to `App.tsx` layout
3. Test on mobile (verify `tel:` opens dialer)
4. Polish animation & positioning
