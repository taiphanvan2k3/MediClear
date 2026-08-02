# F5.3 — Voice Input — Implementation Plan

---

## Files to Modify

### [MODIFY] `src/components/MedsTab.tsx`
- Add microphone button next to camera button in search bar
- `useSpeechRecognition()` hook or inline logic
- `SpeechRecognition` API with `lang: 'vi-VN'`
- Visual states: idle → listening (pulse animation) → processing
- On result → set medQuery → auto-trigger search

---

## Execution Order

1. Add mic button UI to MedsTab search bar
2. Implement SpeechRecognition logic
3. Auto-fill + auto-submit
4. Add feature detection (hide if unsupported)
5. Test on Chrome Android (Vietnamese speech)
