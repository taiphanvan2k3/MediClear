/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AnimatePresence, motion } from "motion/react";
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
import { PwaGuideModal } from "./components/PwaGuideModal";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function App() {
  const activeTab = useUIStore((state) => state.activeTab);
  const setActiveTab = useUIStore((state) => state.setActiveTab);
  const setAlertMessage = useUIStore((state) => state.setAlertMessage);
  const setDeferredInstallPrompt = useUIStore((state) => state.setDeferredInstallPrompt);
  const isAppInstalled = useUIStore((state) => state.isAppInstalled);
  const setIsAppInstalled = useUIStore((state) => state.setIsAppInstalled);

  const setUser = useAuthStore((state) => state.setUser);
  const userProfile = useAuthStore((state) => state.userProfile);
  const setUserProfile = useAuthStore((state) => state.setUserProfile);

  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

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

  // 3. Listen for PWA Install Prompt (beforeinstallprompt) or retrieve early prompt
  useEffect(() => {
    // Check if early prompt was captured before React mounted
    if ((window as any).__deferredPrompt) {
      const promptEvent = (window as any).__deferredPrompt as BeforeInstallPromptEvent;
      setInstallPrompt(promptEvent);
      setDeferredInstallPrompt(promptEvent);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      (window as any).__deferredPrompt = promptEvent;
      setInstallPrompt(promptEvent);
      setDeferredInstallPrompt(promptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, [setDeferredInstallPrompt]);

  const handleInstallPWA = async () => {
    const activePrompt = installPrompt || ((window as any).__deferredPrompt as BeforeInstallPromptEvent | undefined);
    if (activePrompt) {
      try {
        await activePrompt.prompt();
        const { outcome } = await activePrompt.userChoice;
        if (outcome === "accepted") {
          setIsDismissed(true);
          setIsAppInstalled(true);
        }
        setInstallPrompt(null);
        setDeferredInstallPrompt(null);
        (window as any).__deferredPrompt = null;
        return;
      } catch (err) {
        console.warn("Lỗi khi mở prompt cài đặt PWA:", err);
      }
    }

    // Fallback: Open Guide Modal for iOS Safari / manual desktop install
    setIsGuideModalOpen(true);
  };

  const showInstallBanner = !isAppInstalled && !isDismissed;

  return (
    <div className="min-h-screen bg-stone-100 flex justify-center selection:bg-[#B85B43]/20">
      <div className="w-full max-w-md min-h-screen bg-[#FAF6F0] flex flex-col relative shadow-xl border-x border-stone-200/60 pb-20">
        {/* PWA Install Banner with Smooth Slide-down Accordion Animation */}
        <AnimatePresence>
          {showInstallBanner && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden bg-[#B85B43] text-white shadow-md z-40 border-b border-[#A34E37]"
            >
              <div className="px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <div className="p-1 bg-white/20 rounded-lg shrink-0">
                    <Download className="w-3.5 h-3.5 text-white animate-bounce" />
                  </div>
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
                    onClick={() => setIsDismissed(true)}
                    className="p-1 text-white/80 hover:text-white rounded-md cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
        <PwaGuideModal isOpen={isGuideModalOpen} onClose={() => setIsGuideModalOpen(false)} />
      </div>
    </div>
  );
}
