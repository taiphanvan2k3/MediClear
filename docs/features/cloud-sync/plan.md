# F4 — Cloud Sync — Implementation Plan

---

## Files to Modify

### [MODIFY] `src/App.tsx`
- `useEffect` on login: Fetch all collections from Firestore
- Merge logic with localStorage data
- Write-through: Update Firestore on every add/edit/delete

### [MODIFY] `src/firebase.ts`
- Enable Firestore offline persistence: `enableIndexedDbPersistence(db)`

### [NEW] `firestore.rules`
- Security rules: `match /users/{userId}` → `request.auth.uid == userId`

---

## Execution Order

1. Add Firestore security rules
2. Update `App.tsx`: Write-through on save
3. Update `App.tsx`: Fetch on login
4. Enable offline persistence
5. Test: Login → Add data → Logout → Login again → Verify data
