/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { UserProfile } from "./types";

import { useUIStore, useAuthStore } from "./store";

import { Navbar } from "./components/Navbar";
import { BottomNav } from "./components/BottomNav";
import { LightboxModal } from "./components/LightboxModal";
import { AlertDialogs } from "./components/AlertDialogs";
import { RecordsTab } from "./components/RecordsTab";
import { MedsTab } from "./components/MedsTab";
import { HistoryTab } from "./components/HistoryTab";
import { ProfileTab } from "./components/ProfileTab";

export default function App() {
  const activeTab = useUIStore((state) => state.activeTab);
  const setUser = useAuthStore((state) => state.setUser);
  const setUserProfile = useAuthStore((state) => state.setUserProfile);

  // Sync Firebase Auth state and fetch Firestore Profile
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser && db) {
        try {
          const profileDoc = await getDoc(doc(db, "users", currentUser.uid, "profile", "info"));
          if (profileDoc.exists()) {
            const data = profileDoc.data() as UserProfile;
            setUserProfile(data);
          }
        } catch (e) {
          console.error("Lỗi khi tải profile từ Firestore:", e);
        }
      }
    });

    return () => unsubscribe();
  }, [setUser, setUserProfile]);

  return (
    <div className="min-h-screen bg-stone-100 flex justify-center selection:bg-[#B85B43]/20">
      <div className="w-full max-w-md min-h-screen bg-[#FAF6F0] flex flex-col relative shadow-xl border-x border-stone-200/60 pb-20">
        {/* Sticky Top Header */}
        <Navbar />

        {/* Dynamic Main Workspace Tabs */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === "RECORDS" && <RecordsTab />}
          {activeTab === "MEDS" && <MedsTab />}
          {activeTab === "HISTORY" && <HistoryTab />}
          {activeTab === "PROFILE" && <ProfileTab />}
        </main>

        {/* Fixed Mobile Bottom Navigation Bar */}
        <BottomNav />

        {/* Global Overlays & Modals */}
        <LightboxModal />
        <AlertDialogs />
      </div>
    </div>
  );
}
