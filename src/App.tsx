/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

import {
  TabType,
  ScanStateType,
  UserProfile,
  DEFAULT_PROFILE,
  HistoryRecord,
  DEFAULT_HISTORY_RECORDS,
  MedSearchHistoryItem,
  DEFAULT_MED_SEARCH_HISTORY,
  PrescriptionScanResult
} from "./types";

import { Navbar } from "./components/Navbar";
import { BottomNav } from "./components/BottomNav";
import { LightboxModal } from "./components/LightboxModal";
import { AlertDialogs } from "./components/AlertDialogs";
import { RecordsTab } from "./components/RecordsTab";
import { MedsTab } from "./components/MedsTab";
import { HistoryTab } from "./components/HistoryTab";
import { ProfileTab } from "./components/ProfileTab";
import { SOSButton } from "./components/SOSButton";
import { MedicalIDModal } from "./components/MedicalIDModal";
import { LockscreenWallpaperModal } from "./components/LockscreenWallpaperModal";

let cachedAccessToken: string | null = null;

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("RECORDS");
  const [scanState, setScanState] = useState<ScanStateType>("IDLE");
  const [user, setUser] = useState<User | null>(null);

  // Profile State & Pronouns Configuration
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem("mediClear_userProfile");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Lỗi đọc profile từ localStorage:", e);
    }
    return DEFAULT_PROFILE;
  });

  const [customConditionInput, setCustomConditionInput] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSavedSuccess, setProfileSavedSuccess] = useState(false);

  // Dynamic pronouns helpers
  const uTitle = userProfile.userTitle || 'Bác';
  const aiTitle = userProfile.aiTitle || 'Cháu';
  const userGreeting = (uTitle && uTitle !== 'Tôi') ? uTitle : 'Bác';
  const userDisplayName = userProfile.nickname ? userProfile.nickname : (user?.displayName ? user.displayName : userGreeting);

  // Photos & Image States (Support Multiple Images)
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [scanResult, setScanResult] = useState<PrescriptionScanResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Font size toggle for seniors
  const [isLargeText, setIsLargeText] = useState(() => {
    return localStorage.getItem("mediClear_largeText") === "true";
  });

  // Modal & Dialog States
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null);
  const [isMedicalIDOpen, setIsMedicalIDOpen] = useState<boolean>(false);
  const [isLockscreenModalOpen, setIsLockscreenModalOpen] = useState<boolean>(false);

  // History Records List (Khám bệnh / Đơn thuốc)
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem("mediClear_historyRecords");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Lỗi đọc historyRecords từ localStorage:", e);
    }
    return DEFAULT_HISTORY_RECORDS;
  });

  // Medicine Search History List (Tra cứu thuốc)
  const [medSearchHistory, setMedSearchHistory] = useState<MedSearchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("mediClear_medSearchHistory");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Lỗi đọc medSearchHistory từ localStorage:", e);
    }
    return DEFAULT_MED_SEARCH_HISTORY;
  });

  useEffect(() => {
    localStorage.setItem("mediClear_historyRecords", JSON.stringify(historyRecords));
  }, [historyRecords]);

  useEffect(() => {
    localStorage.setItem("mediClear_medSearchHistory", JSON.stringify(medSearchHistory));
  }, [medSearchHistory]);

  const toggleLargeText = () => {
    setIsLargeText((prev) => {
      const next = !prev;
      localStorage.setItem("mediClear_largeText", String(next));
      return next;
    });
  };

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        if (currentUser && db) {
          try {
            const docRef = doc(db, "users", currentUser.uid, "profile", "info");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data() as UserProfile;
              setUserProfile(data);
              localStorage.setItem("mediClear_userProfile", JSON.stringify(data));
            }
          } catch (e) {
            console.error("Lỗi khi tải profile từ Firestore:", e);
          }
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const handleSaveProfile = async (targetProfile: UserProfile) => {
    setIsSavingProfile(true);
    try {
      if (user && db) {
        await setDoc(doc(db, "users", user.uid, "profile", "info"), {
          ...targetProfile,
          updatedAt: serverTimestamp()
        });
      }
      setUserProfile(targetProfile);
      localStorage.setItem("mediClear_userProfile", JSON.stringify(targetProfile));
      setProfileSavedSuccess(true);
      setTimeout(() => setProfileSavedSuccess(false), 3000);
      setAlertMessage(
        `Đã cập nhật cấu hình thông tin cá nhân! ${targetProfile.aiTitle} sẽ xưng hô là "${targetProfile.aiTitle}" và gọi là "${targetProfile.userTitle}" theo đúng cài đặt.`
      );
    } catch (e) {
      console.error("Lỗi khi lưu profile:", e);
      setAlertMessage("Lưu cấu hình không thành công, vui lòng thử lại sau nhé!");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleToggleCondition = (cond: string) => {
    const exists = userProfile.conditions.includes(cond);
    const updatedConditions = exists
      ? userProfile.conditions.filter((c) => c !== cond)
      : [...userProfile.conditions, cond];

    setUserProfile((prev) => ({ ...prev, conditions: updatedConditions }));
  };

  const handleAddCustomCondition = () => {
    if (!customConditionInput.trim()) return;
    const tag = customConditionInput.trim();
    if (!userProfile.conditions.includes(tag)) {
      setUserProfile((prev) => ({ ...prev, conditions: [...prev.conditions, tag] }));
    }
    setCustomConditionInput("");
  };

  const analyzeImagesWithAI = async (images: string[]) => {
    try {
      const response = await fetch("/api/scan/prescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Không thể phân tích đơn thuốc vào lúc này.");
      }

      setScanResult(data);
      setScanState("RESULT");
    } catch (err: any) {
      console.error("Lỗi khi phân tích đơn thuốc qua Gemini Vision:", err);
      setAlertMessage(err.message || "Không thể phân tích ảnh đơn thuốc. Vui lòng thử lại!");
      setScanState("IDLE");
    }
  };

  const handleFilesSelect = (files: FileList | File[]) => {
    const fileArray = Array.from(files) as File[];
    const validFiles = fileArray.filter((f) => f && f.type && f.type.startsWith("image/"));

    if (validFiles.length === 0) {
      setAlertMessage("Vui lòng chọn hoặc chụp tệp hình ảnh hợp lệ (JPG, PNG)!");
      return;
    }

    const readPromises = validFiles.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises).then((newImages) => {
      setSelectedImages(newImages);
      setActiveImageIndex(0);
      setScanState("ANALYZING");
      analyzeImagesWithAI(newImages);
    });
  };

  const handleRemoveImageFromBatch = (indexToRemove: number) => {
    if (selectedImages.length <= 1) {
      setConfirmDialog({
        message: "Xóa ảnh duy nhất này sẽ quay về màn hình chụp tải ảnh ban đầu. Bác có muốn xóa không?",
        onConfirm: () => {
          setSelectedImages([]);
          setScanResult(null);
          setScanState("IDLE");
          setConfirmDialog(null);
        }
      });
      return;
    }

    const updated = selectedImages.filter((_, idx) => idx !== indexToRemove);
    setSelectedImages(updated);
    if (activeImageIndex >= updated.length) {
      setActiveImageIndex(updated.length - 1);
    }
  };

  const handleSaveResult = async () => {
    if (!scanResult) return;
    setIsSaving(true);
    try {
      const details = [];
      if (scanResult.medications && scanResult.medications.length > 0) {
        for (const med of scanResult.medications) {
          details.push({
            label: med.name,
            value: `${med.dosage}${med.foodAdvice ? ` (Lưu ý: ${med.foodAdvice})` : ""}`,
            status: "normal" as const
          });
        }
      }
      if (scanResult.labResults && scanResult.labResults.length > 0) {
        for (const lab of scanResult.labResults) {
          details.push({
            label: lab.label,
            value: lab.value,
            status: lab.status
          });
        }
      }

      const newRecord: HistoryRecord = {
        id: `rec-${Date.now()}`,
        title: scanResult.title || `Sổ khám mới (${selectedImages.length} trang)`,
        date: new Date().toLocaleString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        }),
        type: scanResult.type || "prescription",
        badge: scanResult.badge || "Đang dùng",
        badgeType: scanResult.badgeType || "info",
        summary: scanResult.summary || `Đã phân tích ${selectedImages.length} ảnh thực tế.`,
        facility: scanResult.facility,
        doctor: scanResult.doctor,
        diagnosis: scanResult.diagnosis,
        imageUrls: selectedImages,
        details: details.length > 0 ? details : [{ label: "Thông tin", value: scanResult.summary }],
        advice: scanResult.advice || "Bác nhớ uống thuốc đúng giờ và đều đặn nhé ạ.",
        warning: scanResult.warning
      };

      if (user && db) {
        await setDoc(doc(db, "users", user.uid, "records", newRecord.id), {
          ...newRecord,
          createdAt: serverTimestamp()
        });
      }

      setHistoryRecords((prev) => [newRecord, ...prev]);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setAlertMessage(
        `Đã lưu thành công ${selectedImages.length} ảnh và kết quả vào phần Lịch sử! ${userGreeting} có thể mở xem lại bất cứ lúc nào.`
      );
    } catch (e) {
      console.error("Lỗi khi lưu kết quả:", e);
      setAlertMessage("Lưu không thành công, vui lòng thử lại sau nhé!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRecord = (id: string) => {
    setConfirmDialog({
      message: `${userGreeting} có chắc chắn muốn xóa bản ghi lịch sử này không?`,
      onConfirm: () => {
        setHistoryRecords((prev) => prev.filter((r) => r.id !== id));
        setConfirmDialog(null);
        setAlertMessage("Đã xóa bản ghi khỏi lịch sử lưu trữ.");
      }
    });
  };

  const handleAddPhotosToRecord = (recordId: string, files: FileList | File[]) => {
    const fileArray = Array.from(files) as File[];
    const validFiles = fileArray.filter((f) => f && f.type && f.type.startsWith("image/"));

    const readPromises = validFiles.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises).then((newImgs) => {
      setHistoryRecords((prev) =>
        prev.map((rec) => {
          if (rec.id === recordId) {
            const currentImgs = rec.imageUrls || (rec.imageUrl ? [rec.imageUrl] : []);
            return {
              ...rec,
              imageUrls: [...currentImgs, ...newImgs]
            };
          }
          return rec;
        })
      );
      setAlertMessage(`Đã đính kèm thêm ${newImgs.length} ảnh mới vào phiếu khám!`);
    });
  };

  const handleSaveMedSearchHistory = (medData: {
    query: string;
    name: string;
    dosage: string[] | string;
    purpose: string[] | string;
    foodAdvice: string[] | string;
    summary?: string;
    sources?: { title: string; uri: string }[];
  }) => {
    const newItem: MedSearchHistoryItem = {
      id: `med-hist-${Date.now()}`,
      query: medData.query || medData.name,
      name: medData.name,
      dosage: medData.dosage,
      purpose: medData.purpose,
      foodAdvice: medData.foodAdvice,
      summary: medData.summary,
      sources: medData.sources,
      date: "Hôm nay, " + new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      timestamp: Date.now()
    };

    setMedSearchHistory((prev) => {
      const filtered = prev.filter((i) => i.name !== newItem.name);
      return [newItem, ...filtered];
    });
  };

  const handleDeleteMedSearchItem = (id: string) => {
    setConfirmDialog({
      message: `${uTitle} có chắc muốn xóa lịch sử tra cứu thuốc này không?`,
      onConfirm: () => {
        setMedSearchHistory((prev) => prev.filter((item) => item.id !== id));
        setConfirmDialog(null);
        setAlertMessage("Đã xóa mục khỏi lịch sử tra cứu thuốc.");
      }
    });
  };

  const handleLogin = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    provider.addScope("https://www.googleapis.com/auth/calendar.events");

    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        cachedAccessToken = credential.accessToken;
      }
      setUser(result.user);
    } catch (e) {
      console.error("Lỗi đăng nhập:", e);
      setAlertMessage("Đăng nhập bằng tài khoản Google không thành công. Vui lòng thử lại!");
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setUser(null);
      cachedAccessToken = null;
    } catch (e) {
      console.error("Lỗi đăng xuất:", e);
    }
  };

  const handleSetCalendarReminder = async (medName: string, timeStr: string) => {
    if (!user) {
      setConfirmDialog({
        message: `${userGreeting} cần đăng nhập Google để tự động tạo lịch nhắc trên Lịch Google Calendar. Bác/Bạn có muốn đăng nhập ngay không?`,
        onConfirm: () => {
          setConfirmDialog(null);
          handleLogin();
        }
      });
      return;
    }

    if (!cachedAccessToken) {
      setAlertMessage("Đang cấp quyền ghi Lịch Google... Vui lòng đăng nhập lại để xác nhận quyền Calendar.");
      handleLogin();
      return;
    }

    try {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const now = new Date();
      const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
      if (startTime < now) {
        startTime.setDate(startTime.getDate() + 1);
      }
      const endTime = new Date(startTime.getTime() + 15 * 60 * 1000);

      const event = {
        summary: `💊 Nhắc uống thuốc: ${medName}`,
        description: `Lịch nhắc uống thuốc hàng ngày từ Trợ lý Y tế AI dành cho ${userDisplayName}`,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        recurrence: ["RRULE:FREQ=DAILY"],
        reminders: {
          useDefault: false,
          overrides: [
            { method: "popup", minutes: 10 },
            { method: "email", minutes: 30 }
          ]
        }
      };

      const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cachedAccessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(event)
      });

      if (res.ok) {
        setAlertMessage(
          `🎉 Tuyệt vời! ${aiTitle} đã tạo thành công Lịch nhắc uống thuốc "${medName}" lúc ${timeStr} hàng ngày trên Google Calendar!`
        );
      } else {
        const errorData = await res.json();
        console.error("Google Calendar Error:", errorData);
        setAlertMessage(`Chưa tạo được lịch nhắc trên Google Calendar. Vui lòng thử lại sau!`);
      }
    } catch (e) {
      console.error("Calendar Sync Error:", e);
      setAlertMessage("Lỗi kết nối khi tạo lịch nhắc. Vui lòng kiểm tra lại mạng!");
    }
  };

  const handleHeaderSOSClick = () => {
    if (userProfile.emergencyPhone) {
      const contactLabel = userProfile.emergencyName
        ? `${userProfile.emergencyName} (${userProfile.emergencyPhone})`
        : userProfile.emergencyPhone;
      setAlertMessage(
        `🚨 ${aiTitle} đang kết nối cuộc gọi khẩn cấp tới người thân: ${contactLabel}. Màn hình gọi điện sẽ xuất hiện ngay lập tức.`
      );
      window.location.href = `tel:${userProfile.emergencyPhone.replace(/\s+/g, "")}`;
    } else {
      setActiveTab("PROFILE");
      setAlertMessage(
        `🚨 Chưa cài SĐT khẩn cấp người thân! Vui lòng chạm vào Nút SOS màu đỏ nổi góc phải bên dưới để cài đặt nhanh.`
      );
    }
  };

  return (
    <div
      className={`min-h-screen bg-[#FAF6F0] font-sans text-stone-900 pb-32 ${isLargeText ? "text-lg" : "text-base"}`}
    >
      {/* Top Navbar Header */}
      <Navbar
        user={user}
        userTitle={uTitle}
        isLargeText={isLargeText}
        onToggleLargeText={toggleLargeText}
        onLogin={handleLogin}
        onLogout={handleLogout}
        activeTab={activeTab}
      />

      {/* Main Tab Screen Switcher */}
      <main className="max-w-md mx-auto">
        {activeTab === "RECORDS" && (
          <RecordsTab
            scanState={scanState}
            setScanState={setScanState}
            selectedImages={selectedImages}
            setSelectedImages={setSelectedImages}
            activeImageIndex={activeImageIndex}
            setActiveImageIndex={setActiveImageIndex}
            onFilesSelect={handleFilesSelect}
            onRemoveImageFromBatch={handleRemoveImageFromBatch}
            onSaveResult={handleSaveResult}
            isSaving={isSaving}
            saveSuccess={saveSuccess}
            onOpenLightbox={(url, title) => setLightboxImage({ url, title })}
            userTitle={uTitle}
            aiTitle={aiTitle}
            userDisplayName={userDisplayName}
            isLargeText={isLargeText}
            setAlertMessage={setAlertMessage}
            scanResult={scanResult}
            onSetCalendarReminder={handleSetCalendarReminder}
          />
        )}

        {activeTab === "MEDS" && (
          <MedsTab
            userTitle={uTitle}
            aiTitle={aiTitle}
            isLargeText={isLargeText}
            onSetCalendarReminder={handleSetCalendarReminder}
            onSaveMedSearchHistory={handleSaveMedSearchHistory}
          />
        )}

        {activeTab === "HISTORY" && (
          <HistoryTab
            user={user}
            onLogin={handleLogin}
            historyRecords={historyRecords}
            medSearchHistory={medSearchHistory}
            onDeleteRecord={handleDeleteRecord}
            onDeleteMedSearchItem={handleDeleteMedSearchItem}
            onOpenLightbox={(url, title) => setLightboxImage({ url, title })}
            userTitle={uTitle}
            aiTitle={aiTitle}
            isLargeText={isLargeText}
            onAddPhotosToRecord={handleAddPhotosToRecord}
            onSetCalendarReminder={handleSetCalendarReminder}
          />
        )}

        {activeTab === "PROFILE" && (
          <ProfileTab
            user={user}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            customConditionInput={customConditionInput}
            setCustomConditionInput={setCustomConditionInput}
            isSavingProfile={isSavingProfile}
            profileSavedSuccess={profileSavedSuccess}
            onSaveProfile={handleSaveProfile}
            onToggleCondition={handleToggleCondition}
            onAddCustomCondition={handleAddCustomCondition}
            onLogin={handleLogin}
            onLogout={handleLogout}
            isLargeText={isLargeText}
            onToggleLargeText={toggleLargeText}
            setAlertMessage={setAlertMessage}
            onOpenMedicalID={() => setIsMedicalIDOpen(true)}
            onOpenLockscreenWallpaper={() => setIsLockscreenModalOpen(true)}
          />
        )}
      </main>

      {/* Global Floating SOS Emergency Call Button */}
      <SOSButton
        userProfile={userProfile}
        historyRecords={historyRecords}
        onSaveProfile={handleSaveProfile}
        isLargeText={isLargeText}
        setAlertMessage={setAlertMessage}
        onOpenMedicalID={() => setIsMedicalIDOpen(true)}
        onOpenLockscreenWallpaper={() => setIsLockscreenModalOpen(true)}
      />

      {/* Bottom Sticky Tab Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} isLargeText={isLargeText} />

      {/* Lightbox Photo Viewer Modal */}
      <LightboxModal image={lightboxImage} onClose={() => setLightboxImage(null)} />

      {/* Emergency Medical ID Modal */}
      <MedicalIDModal
        isOpen={isMedicalIDOpen}
        onClose={() => setIsMedicalIDOpen(false)}
        userProfile={userProfile}
        historyRecords={historyRecords}
        isLargeText={isLargeText}
        setAlertMessage={setAlertMessage}
      />

      {/* Lockscreen Medical Wallpaper Generator Modal */}
      <LockscreenWallpaperModal
        isOpen={isLockscreenModalOpen}
        onClose={() => setIsLockscreenModalOpen(false)}
        userProfile={userProfile}
        historyRecords={historyRecords}
        isLargeText={isLargeText}
      />

      {/* Alert & Confirmation Dialog Modals */}
      <AlertDialogs
        alertMessage={alertMessage}
        onCloseAlert={() => setAlertMessage(null)}
        confirmDialog={confirmDialog}
        onCloseConfirm={() => setConfirmDialog(null)}
        aiTitle={aiTitle}
        userTitle={uTitle}
      />
    </div>
  );
}
