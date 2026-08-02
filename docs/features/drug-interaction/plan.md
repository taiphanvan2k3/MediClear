# F2 — Drug Interaction Checker — Implementation Plan

---

## Files to Create/Modify

### [NEW] `server/routes/interactions.ts`
- `POST /api/interactions/check`
- Accept: `{ medications: string[] }`
- Gemini 2.5 Flash + Search Grounding
- Return `DrugInteractionResult`

### [MODIFY] `server/index.ts`
- Register `interactionsRouter` at `/api/interactions`

### [MODIFY] `src/types.ts`
- Add `DrugInteractionResult`, `DrugInteraction` interfaces

### [MODIFY] `src/components/MedsTab.tsx` or [NEW] section
- UI: List thuốc đang dùng + nút kiểm tra
- Results display: severity badges, recommendations

### [MODIFY] `src/components/RecordsTab.tsx`
- After scan result (F1): Auto-check interactions with existing medications
- Show warning banner if dangerous interaction found

### [MODIFY] `src/App.tsx`
- State: `currentMedications: string[]` (aggregate from scan history)
- Handler: `handleCheckInteractions()`

---

## Execution Order

1. Add types to `types.ts`
2. Create `server/routes/interactions.ts`
3. Register route
4. Build UI in MedsTab
5. Integrate auto-check in RecordsTab (post-scan)
6. Test with known interaction pairs
