/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { UserProfile } from "./types";

import { useAuthStore, useUIStore } from "./store";

import { AlertDialogs } from "./components/AlertDialogs";
import { BottomNav } from "./components/BottomNav";
import { HistoryTab } from "./components/HistoryTab";
import { LightboxModal } from "./components/LightboxModal";
import { MedsTab } from "./components/MedsTab";
import { Navbar } from "./components/Navbar";
import { ProfileTab } from "./components/ProfileTab";
import { RecordsTab } from "./components/RecordsTab";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function App() {
  const activeTab = useUIStore((state) => state.activeTab);
  const setActiveTab = useUIStore((state) => state.setActiveTab);
  const setAlertMessage = useUIStore((state) => state.setAlertMessage);
  const setDeferredInstallPrompt = useUIStore((state) => state.setDeferredInstallPrompt);
  const setIsAppInstalled = useUIStore((state) => state.setIsAppInstalled);

  const setUser = useAuthStore((state) => state.setUser);
  const userProfile = useAuthStore((state) => state.userProfile);
  const setUserProfile = useAuthStore((state) => state.setUserProfile);

  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Check if app is already running in standalone mode (installed PWA)
  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsAppInstalled(isStandalone);
  }, [setIsAppInstalled]);

  // 1. Sync Firebase Auth state and fetch Firestore Profile
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

  // 2. Handle PWA App Shortcuts URL Actions (?action=quick_sos, ?action=scan, ?action=meds)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get("action");

    if (action) {
      // Clean query parameter from URL without page refresh
      window.history.replaceState({}, document.title, window.location.pathname);

      if (action === "quick_sos") {
        const phone = userProfile.emergencyPhone?.trim();
        const contactName = userProfile.emergencyName?.trim() || "Người thân SOS";

        if (phone) {
          setAlertMessage(`🚨 Đang thực hiện cuộc gọi khẩn cấp tới ${contactName} (${phone})...`);
          setTimeout(() => {
            window.location.href = `tel:${phone.replace(/\s+/g, "")}`;
          }, 300);
        } else {
          setActiveTab("PROFILE");
          setAlertMessage(
            "⚠️ Bạn chưa cài đặt Số điện thoại khẩn cấp. Vui lòng cập nhật SĐT người thân trong mục Cài đặt Hồ sơ!"
          );
        }
      } else if (action === "scan") {
        setActiveTab("RECORDS");
      } else if (action === "meds") {
        setActiveTab("MEDS");
      }
    }
  }, [userProfile.emergencyPhone, userProfile.emergencyName, setActiveTab, setAlertMessage]);

  // 3. Listen for PWA Install Prompt (beforeinstallprompt)
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setInstallPrompt(promptEvent);
      setDeferredInstallPrompt(promptEvent);
      setShowInstallBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, [setDeferredInstallPrompt]);

  const handleInstallPWA = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBanner(false);
      setIsAppInstalled(true);
    }
    setInstallPrompt(null);
    setDeferredInstallPrompt(null);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex justify-center selection:bg-[#B85B43]/20">
      <div className="w-full max-w-md min-h-screen bg-[#FAF6F0] flex flex-col relative shadow-xl border-x border-stone-200/60 pb-20">
        {/* PWA Install Banner */}
        {showInstallBanner && (
          <div className="bg-[#B85B43] text-white px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold shadow-md animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <Download className="w-4 h-4 shrink-0 text-white animate-bounce" />
              <span className="truncate">Cài đặt ứng dụng MediClear để mở nhanh & gọi SOS</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleInstallPWA}
                className="bg-white text-[#B85B43] hover:bg-stone-100 px-2.5 py-1 rounded-lg font-extrabold text-[11px] shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                Cài đặt
              </button>
              <button
                type="button"
                onClick={() => setShowInstallBanner(false)}
                className="p-1 text-white/80 hover:text-white rounded-md cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

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
