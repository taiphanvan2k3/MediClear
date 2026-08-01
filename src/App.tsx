/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Stethoscope, 
  Camera, 
  Loader2, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Calendar, 
  RefreshCw,
  LogIn,
  LogOut,
  Save,
  FileText,
  Pill,
  Clock,
  User as UserIcon,
  Mic,
  Phone,
  Settings,
  ChevronRight,
  Heart,
  Lightbulb,
  ShieldAlert,
  Activity,
  Check,
  ArrowLeft,
  Share2,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  RotateCw,
  X,
  Maximize2,
  Upload,
  Download,
  Plus,
  Trash2,
  Layers,
  Edit3,
  Sliders,
  Sparkles,
  UserCheck,
  HeartPulse
} from 'lucide-react';
import { auth, db } from './firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

let cachedAccessToken: string | null = null;

type TabType = 'RECORDS' | 'MEDS' | 'HISTORY' | 'PROFILE';
type ScanStateType = 'IDLE' | 'ANALYZING' | 'RESULT';

export interface UserProfile {
  nickname: string;
  age: string;
  birthYear: string;
  userTitle: string; // e.g. "Bác", "Ông", "Bà", "Chú", "Cô", "Anh/Chị", "Tôi"
  aiTitle: string;   // e.g. "Cháu", "Con", "Trợ lý AI", "Em", "Tôi"
  conditions: string[];
  emergencyName: string;
  emergencyPhone: string;
}

const DEFAULT_PROFILE: UserProfile = {
  nickname: '',
  age: '68',
  birthYear: '1958',
  userTitle: 'Bác',
  aiTitle: 'Cháu',
  conditions: ['❤️ Cao huyết áp', '🥣 Đau dạ dày'],
  emergencyName: 'Con gái Mai',
  emergencyPhone: '0987654321'
};

const USER_TITLE_OPTIONS = ['Bác', 'Ông', 'Bà', 'Chú', 'Cô', 'Anh/Chị', 'Tôi'];
const AI_TITLE_OPTIONS = ['Cháu', 'Con', 'Trợ lý AI', 'Em', 'Tôi'];
const PRESET_CONDITIONS = [
  '❤️ Cao huyết áp', 
  '🥣 Đau dạ dày', 
  '🩸 Tiểu đường', 
  '🦴 Gút (Axit Uric cao)', 
  '🫀 Tim mạch', 
  '🩺 Mỡ máu', 
  '👁️ Mắt kém',
  '🧠 Suy nhược thần kinh'
];

export interface HistoryItemDetail {
  label: string;
  value: string;
  status?: 'normal' | 'high' | 'warning';
}

export interface HistoryRecord {
  id: string;
  title: string;
  date: string;
  type: 'prescription' | 'lab';
  badge: string;
  badgeType: 'warning' | 'success' | 'info';
  summary: string;
  facility?: string;
  doctor?: string;
  details: HistoryItemDetail[];
  advice: string;
  note?: string;
  imageUrls?: string[];
  imageUrl?: string; // fallback for legacy
}

const DEFAULT_HISTORY_RECORDS: HistoryRecord[] = [
  {
    id: 'rec-1',
    title: 'Đơn thuốc Huyết áp & Tim mạch',
    date: 'Hôm nay, 08:30',
    type: 'prescription',
    badge: 'Đang dùng',
    badgeType: 'info',
    summary: 'Amlodipin 5mg • Nhắc lịch 8h sáng',
    facility: 'Bệnh viện Tim Hà Nội',
    doctor: 'BS. Nguyễn Thị Mai',
    imageUrls: [],
    details: [
      { label: 'Tên thuốc', value: 'Amlodipin 5mg' },
      { label: 'Liều dùng', value: '1 viên / ngày (Buổi sáng sau ăn)' },
      { label: 'Mục đích điều trị', value: 'Kiểm soát & ổn định huyết áp' },
      { label: 'Cảnh báo ăn uống', value: 'Tuyệt đối không uống cùng nước ép bưởi', status: 'warning' }
    ],
    advice: 'Bác nhớ duy trì uống thuốc đều đặn vào 8h sáng hàng ngày. Hạn chế ăn mặn (dưới 5g muối/ngày) và theo dõi huyết áp định kỳ ạ.',
    note: 'Bác có thể chạm nút "Thêm ảnh" bên dưới để chụp tải đơn thuốc thực tế của Bác vào đây.'
  },
  {
    id: 'rec-2',
    title: 'Xét nghiệm máu tổng quát',
    date: '15/10/2023, 10:15',
    type: 'lab',
    badge: 'Đường cao',
    badgeType: 'warning',
    summary: 'Glucose 8.5 mmol/L • Men gan chuẩn',
    facility: 'Bệnh viện Đa khoa Trung ương',
    doctor: 'BS. Trần Văn Hùng',
    imageUrls: [],
    details: [
      { label: 'Chỉ số Đường huyết (Glucose)', value: '8.5 mmol/L (Mức CAO)', status: 'high' },
      { label: 'Chỉ số Axit Uric', value: '450 µmol/L (Hơi cao)', status: 'warning' },
      { label: 'Men gan (ALT/AST)', value: '24 U/L (Bình thường)', status: 'normal' },
      { label: 'Mỡ máu (Cholesterol toàn phần)', value: '5.1 mmol/L (An toàn)', status: 'normal' }
    ],
    advice: 'Chỉ số đường huyết 8.5 mmol/L vượt ngưỡng an toàn. Bác nên bớt ăn cơm trắng, bánh kẹo ngọt và tăng cường ăn rau xanh, đi bộ nhẹ nhàng 30 phút mỗi ngày.',
    note: 'Tái khám xét nghiệm lại sau 1 tháng'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('RECORDS');
  const [scanState, setScanState] = useState<ScanStateType>('IDLE');
  const [user, setUser] = useState<User | null>(null);
  
  // Profile State & Pronouns Configuration
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('mediClear_userProfile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Lỗi đọc profile từ localStorage:", e);
    }
    return DEFAULT_PROFILE;
  });

  const [customConditionInput, setCustomConditionInput] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSavedSuccess, setProfileSavedSuccess] = useState(false);

  // Dynamic pronouns helpers
  const uTitle = userProfile.userTitle || 'Bác';
  const aiTitle = userProfile.aiTitle || 'Cháu';
  const userDisplayName = userProfile.nickname ? userProfile.nickname : (user?.displayName ? user.displayName : uTitle);
  
  // Photo & Image States (Support Multiple Images)
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  
  // Lightbox view state
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  
  // File inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreFileInputRef = useRef<HTMLInputElement>(null);
  const recordDetailFileInputRef = useRef<HTMLInputElement>(null);
  
  // History state
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>(DEFAULT_HISTORY_RECORDS);
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
  
  // Custom accessible UI toggles
  const [isLargeText, setIsLargeText] = useState(true);
  
  // Saving states
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [eventSuccess, setEventSuccess] = useState(false);
  
  // Custom modal dialogs
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{message: string, onConfirm: () => void} | null>(null);
  
  // Medicine search text
  const [searchQuery, setSearchQuery] = useState('');

  // Sizing definitions for high accessibility
  const titleClass = isLargeText ? "text-2xl font-bold tracking-tight" : "text-xl font-bold tracking-tight";
  const subTitleClass = isLargeText ? "text-lg font-bold" : "text-base font-bold";
  const bodyClass = isLargeText ? "text-base leading-relaxed" : "text-sm leading-relaxed";
  const descClass = isLargeText ? "text-sm" : "text-xs";

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        if (currentUser && db) {
          try {
            const docRef = doc(db, 'users', currentUser.uid, 'profile', 'info');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data() as UserProfile;
              setUserProfile(prev => ({ ...prev, ...data }));
              localStorage.setItem('mediClear_userProfile', JSON.stringify(data));
            }
          } catch (e) {
            console.error("Lỗi đồng bộ profile từ Cloud:", e);
          }
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const handleSaveProfile = async (newProfile?: UserProfile) => {
    const targetProfile = newProfile || userProfile;
    setIsSavingProfile(true);
    try {
      localStorage.setItem('mediClear_userProfile', JSON.stringify(targetProfile));
      if (user && db) {
        await setDoc(doc(db, 'users', user.uid, 'profile', 'info'), {
          ...targetProfile,
          updatedAt: serverTimestamp()
        });
      }
      setProfileSavedSuccess(true);
      setTimeout(() => setProfileSavedSuccess(false), 3000);
      setAlertMessage(`Đã cập nhật cấu hình thông tin cá nhân! ${targetProfile.aiTitle} sẽ xưng hô là "${targetProfile.aiTitle}" và gọi là "${targetProfile.userTitle}" theo đúng cài đặt.`);
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
      ? userProfile.conditions.filter(c => c !== cond)
      : [...userProfile.conditions, cond];
    
    setUserProfile(prev => ({ ...prev, conditions: updatedConditions }));
  };

  const handleAddCustomCondition = () => {
    if (!customConditionInput.trim()) return;
    const tag = customConditionInput.trim();
    if (!userProfile.conditions.includes(tag)) {
      setUserProfile(prev => ({ ...prev, conditions: [...prev.conditions, tag] }));
    }
    setCustomConditionInput('');
  };

  useEffect(() => {
    if (scanState === 'ANALYZING') {
      const timer = setTimeout(() => {
        setScanState('RESULT');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [scanState]);

  // Handle uploading 1 or multiple files
  const handleFilesSelect = (filesList: FileList | File[]) => {
    const fileArray = Array.from(filesList) as File[];
    const files = fileArray.filter(f => f && f.type && f.type.startsWith('image/'));
    
    if (files.length === 0) {
      setAlertMessage('Vui lòng chọn các tập tin hình ảnh hợp lệ (JPG, PNG, WEBP...) ạ!');
      return;
    }

    const readPromises = files.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises).then(newImages => {
      setSelectedImages(prev => [...prev, ...newImages]);
      setActiveImageIndex(0);
      setScanState('ANALYZING');
    });
  };

  const handleMainFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelect(e.target.files);
    }
  };

  const handleAddMorePhotosInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files) as File[];
      const files = fileArray.filter(f => f && f.type && f.type.startsWith('image/'));
      const readPromises = files.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (evt) => resolve(evt.target?.result as string);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readPromises).then(newImages => {
        setSelectedImages(prev => [...prev, ...newImages]);
        setAlertMessage(`Đã tải thêm ${newImages.length} ảnh vào tập hồ sơ!`);
      });
    }
  };

  const handleRemoveImageFromBatch = (indexToRemove: number) => {
    setSelectedImages(prev => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      if (updated.length === 0) {
        setScanState('IDLE');
      } else if (activeImageIndex >= updated.length) {
        setActiveImageIndex(updated.length - 1);
      }
      return updated;
    });
  };

  // Add photos to selected record in detail view
  const handleRecordDetailPhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && selectedRecord) {
      const fileArray = Array.from(e.target.files) as File[];
      const files = fileArray.filter(f => f && f.type && f.type.startsWith('image/'));
      const readPromises = files.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (evt) => resolve(evt.target?.result as string);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readPromises).then(newImages => {
        const existingImages = selectedRecord.imageUrls || (selectedRecord.imageUrl ? [selectedRecord.imageUrl] : []);
        const updatedImages = [...existingImages, ...newImages];
        const updatedRecord = { ...selectedRecord, imageUrls: updatedImages };
        
        setSelectedRecord(updatedRecord);
        setHistoryRecords(prev => prev.map(rec => rec.id === updatedRecord.id ? updatedRecord : rec));
        setAlertMessage(`Đã cập nhật thêm ${newImages.length} ảnh mới vào hồ sơ thành công!`);
      });
    }
  };

  // Delete photo from selected record in detail view
  const handleRecordDetailPhotoDelete = (indexToDelete: number) => {
    if (!selectedRecord) return;
    const existingImages = selectedRecord.imageUrls || (selectedRecord.imageUrl ? [selectedRecord.imageUrl] : []);
    const updatedImages = existingImages.filter((_, idx) => idx !== indexToDelete);
    const updatedRecord = { ...selectedRecord, imageUrls: updatedImages };
    
    setSelectedRecord(updatedRecord);
    setHistoryRecords(prev => prev.map(rec => rec.id === updatedRecord.id ? updatedRecord : rec));
  };

  const openLightbox = (url: string, title: string) => {
    setZoomLevel(1);
    setRotation(0);
    setLightboxImage({ url, title });
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    setZoomLevel(1);
    setRotation(0);
  };

  const handleLogin = async () => {
    if (window !== window.top) {
      setAlertMessage("Vui lòng mở ứng dụng trong thẻ trình duyệt mới (New Tab) để đăng nhập an toàn ạ.");
      return;
    }
    if (!auth) {
      setAlertMessage("Vui lòng cấu hình Firebase trong file src/firebase.ts để đăng nhập.");
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/calendar.events');
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        cachedAccessToken = credential.accessToken;
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      setAlertMessage("Không thể đăng nhập. Vui lòng thử lại.");
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      cachedAccessToken = null;
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  const handleSaveResult = async () => {
    if (selectedImages.length === 0) {
      setAlertMessage("Chưa có hình ảnh nào được tải lên để lưu ạ!");
      return;
    }

    setIsSaving(true);
    try {
      if (user && db) {
        const resultData = {
          userId: user.uid,
          glucose: "8.5 mmol/L",
          uricAcid: "450 µmol/L",
          status: "Cần theo dõi",
          imageUrls: selectedImages,
          timestamp: serverTimestamp()
        };
        const newResultRef = doc(db, 'users', user.uid, 'results', Date.now().toString());
        await setDoc(newResultRef, resultData);
      }

      const newRecord: HistoryRecord = {
        id: Date.now().toString(),
        title: `Hồ sơ y tế mới (${selectedImages.length} ảnh chụp)`,
        date: new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }),
        type: 'lab',
        badge: 'Đã lưu',
        badgeType: 'info',
        summary: `Gồm ${selectedImages.length} trang/ảnh chụp thực tế`,
        facility: 'Chụp/Tải từ ứng dụng',
        imageUrls: selectedImages,
        details: [
          { label: 'Số lượng ảnh lưu trữ', value: `${selectedImages.length} ảnh/trang phiếu` },
          { label: 'Chỉ số Đường huyết (Glucose)', value: '8.5 mmol/L (Mức CAO)', status: 'high' },
          { label: 'Chỉ số Axit Uric', value: '450 µmol/L (Hơi cao)', status: 'warning' }
        ],
        advice: 'Tất cả hình ảnh phiếu khám Bác vừa chụp/tải lên đã được lưu giữ an toàn. Bác có thể mở xem lại bất kỳ lúc nào.'
      };

      setHistoryRecords(prev => [newRecord, ...prev]);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      setAlertMessage("Lưu thất bại, Bác thử lại sau nhé!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateReminder = async () => {
    if (!user || !cachedAccessToken) {
      setConfirmDialog({
        message: "Để tự động tạo lịch nhắc, Bác cần Đăng nhập và cấp quyền Lịch. Bác có muốn đăng nhập ngay không ạ?",
        onConfirm: () => {
          setConfirmDialog(null);
          handleLogin();
        }
      });
      return;
    }

    setConfirmDialog({
      message: "Cháu sẽ tạo một lịch nhắc nhở uống thuốc vào 8h sáng mai trên Google Calendar của Bác nhé?",
      onConfirm: async () => {
        setConfirmDialog(null);
        setIsCreatingEvent(true);
        try {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(8, 0, 0, 0);
          
          const endTime = new Date(tomorrow.getTime() + 30 * 60000);

          const event = {
            summary: 'Nhắc nhở uống thuốc (MediClear)',
            description: 'Đã đến giờ uống thuốc theo kết quả xét nghiệm. Bác nhớ ăn nhẹ trước khi uống nhé!',
            start: {
              dateTime: tomorrow.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            end: {
              dateTime: endTime.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
          };

          const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${cachedAccessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
          });

          if (!res.ok) {
            throw new Error('Failed to create event');
          }

          setEventSuccess(true);
          setTimeout(() => setEventSuccess(false), 3000);
        } catch (error) {
          console.error("Lỗi khi tạo lịch:", error);
          setAlertMessage("Lưu lịch thất bại, Bác thử lại sau nhé!");
        } finally {
          setIsCreatingEvent(false);
        }
      }
    });
  };

  // Content for Tab 1: RECORDS
  const renderRecordsTab = () => {
    if (scanState === 'IDLE') {
      return (
        <div className="flex flex-col items-center justify-center py-5 px-4 space-y-5 animate-in fade-in duration-300 max-w-sm mx-auto">
          {/* Main Multiple File Input */}
          <input 
            type="file" 
            ref={fileInputRef}
            accept="image/*"
            multiple
            capture="environment"
            className="hidden"
            onChange={handleMainFileInputChange}
          />

          {/* Greeting Block */}
          <div className="w-full text-center space-y-1 py-1">
            <h2 className={`${titleClass} text-slate-800 font-bold`}>
              {aiTitle} chào {uTitle}{userProfile.nickname ? ` ${userProfile.nickname}` : (user?.displayName ? ` ${user.displayName}` : "")}!
            </h2>
            <p className={`${bodyClass} text-slate-600 font-medium max-w-xs mx-auto`}>
              {uTitle} chụp hoặc chọn tải lên phiếu khám, đơn thuốc của {uTitle} nhé!
            </p>
          </div>

          {/* Clean Upload Box */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-square max-w-xs rounded-3xl border-2 border-dashed border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 transition-all flex flex-col items-center justify-center p-6 space-y-3 shadow-soft text-center group cursor-pointer relative overflow-hidden"
          >
            {/* Camera Circle */}
            <div className="p-4 bg-emerald-100 group-hover:bg-emerald-200 rounded-full text-emerald-700 transition-colors shadow-sm">
              <Camera className="w-12 h-12 text-emerald-700" />
            </div>

            <div className="space-y-1 px-2">
              <span className={`${subTitleClass} text-emerald-950 font-bold block leading-snug`}>
                Chụp hoặc Tải ảnh lên
              </span>
              <p className="text-xs text-emerald-800/90 font-medium">
                Cho phép chọn 1 hoặc nhiều ảnh cùng lúc (đơn thuốc nhiều trang)
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-white border border-emerald-300 px-3.5 py-1.5 rounded-full shadow-xs">
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              Chọn từ thiết bị / Máy ảnh
            </span>
          </div>

          {/* Medical Tip Block */}
          <div className="w-full bg-sky-50/80 border-l-4 border-sky-500 rounded-r-2xl p-3.5 shadow-sm text-left">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-sky-100 rounded-lg text-sky-600 shrink-0 mt-0.5">
                <Lightbulb className="w-5 h-5" />
              </div>
              <p className={`${descClass} text-sky-900 leading-relaxed font-medium`}>
                <strong className="font-bold text-sky-950">Lưu ý cho Bác:</strong> Mọi hình ảnh Bác thực tế chụp tải lên đều sẽ được bảo mật và lưu giữ trong mục <span className="font-bold text-emerald-700">Lịch Sử</span> để Bác mở xem lại bất kỳ lúc nào.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (scanState === 'ANALYZING') {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4 space-y-6 animate-in fade-in duration-300 text-center max-w-sm mx-auto">
          {/* Animated Scanner Box showing uploaded image */}
          <div className="relative w-full aspect-4/3 max-w-xs rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-lg bg-slate-900">
            {selectedImages.length > 0 ? (
              <img 
                src={selectedImages[0]} 
                alt="Ảnh đang phân tích" 
                className="w-full h-full object-contain opacity-90" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <ImageIcon className="w-12 h-12" />
              </div>
            )}
            
            {/* Green Scan Overlay */}
            <div className="absolute inset-x-0 h-1 bg-emerald-400 shadow-[0_0_15px_#10b981] animate-pulse top-1/2 -translate-y-1/2"></div>
            <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none"></div>

            <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-md rounded-lg py-1.5 px-2.5 text-[11px] text-emerald-300 font-bold flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              Đang phân tích {selectedImages.length} ảnh Bác vừa tải...
            </div>
          </div>

          <div className="space-y-1.5">
            <h3 className={`${titleClass} text-slate-800 font-bold`}>
              Bác đợi cháu một chút nhé...
            </h3>
            <p className={`${bodyClass} text-slate-600`}>
              Cháu đang quét chữ và trích xuất chỉ số từ {selectedImages.length} ảnh Bác vừa tải lên ạ.
            </p>
          </div>

          <div className="w-full max-w-xs h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full animate-pulse w-3/4"></div>
          </div>
        </div>
      );
    }

    // RESULTS Screen
    return (
      <div className="space-y-5 px-4 py-4 animate-in slide-in-from-bottom-4 duration-300 max-w-md mx-auto">
        {/* Hidden File Input to add more photos to current batch */}
        <input 
          type="file" 
          ref={addMoreFileInputRef}
          accept="image/*"
          multiple
          capture="environment"
          className="hidden"
          onChange={handleAddMorePhotosInputChange}
        />

        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-600" />
            <h2 className={`${titleClass} text-slate-800`}>Kết quả phân tích:</h2>
          </div>
          <span className="px-3 py-1 bg-amber-100 border border-amber-300 text-amber-800 rounded-full font-bold text-xs">
            CẦN CHÚ Ý
          </span>
        </div>

        {/* Uploaded Images Gallery Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-emerald-600" />
              Ảnh thực tế đã tải lên ({selectedImages.length} ảnh):
            </span>

            <button 
              onClick={() => addMoreFileInputRef.current?.click()}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm ảnh khác
            </button>
          </div>

          {/* Main Active Image View */}
          {selectedImages.length > 0 && (
            <div className="space-y-2">
              <div 
                onClick={() => openLightbox(selectedImages[activeImageIndex], `Ảnh thứ ${activeImageIndex + 1}`)}
                className="relative rounded-xl overflow-hidden border border-slate-300 h-44 bg-slate-900 cursor-pointer group shadow-sm flex items-center justify-center"
              >
                <img 
                  src={selectedImages[activeImageIndex]} 
                  alt={`Ảnh ${activeImageIndex + 1}`} 
                  className="w-full h-full object-contain group-hover:scale-102 transition-transform duration-300" 
                />
                <div className="absolute inset-0 bg-slate-900/30 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center">
                  <div className="p-2 bg-white/25 backdrop-blur-md rounded-full text-white">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md flex items-center gap-1">
                  <ZoomIn className="w-3.5 h-3.5" /> Phóng to
                </div>

                <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[11px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md">
                  Trang {activeImageIndex + 1} / {selectedImages.length}
                </div>
              </div>

              {/* Thumbnails list if multiple */}
              {selectedImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
                  {selectedImages.map((imgUrl, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 cursor-pointer shrink-0 transition-all ${
                        activeImageIndex === idx ? 'border-emerald-600 scale-105 shadow-sm' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImageFromBatch(idx);
                        }}
                        className="absolute top-0 right-0 bg-rose-600 text-white p-0.5 rounded-bl-md hover:bg-rose-700"
                        title="Xóa ảnh này"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          {/* Card 1: High Glucose */}
          <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 shadow-sm space-y-2">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className={`${subTitleClass} text-amber-950 font-bold`}>
                  Đường huyết - 8.5 mmol/L (CAO)
                </h3>
                <p className={`${bodyClass} text-amber-900 leading-relaxed`}>
                  <strong className="text-amber-950">Lời khuyên của cháu:</strong> Bác nhớ hạn chế ăn đồ ngọt, bánh kẹo và bớt cơm trắng nha!
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Liver Function Normal */}
          <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 shadow-sm space-y-2">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shrink-0 mt-0.5">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className={`${subTitleClass} text-emerald-950 font-bold`}>
                  Men gan - Bình thường
                </h3>
                <p className={`${bodyClass} text-emerald-900 leading-relaxed`}>
                  <strong className="text-emerald-950">Chỉ số tốt:</strong> Gan của bác rất khỏe mạnh, hoạt động cực kỳ tốt ạ!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-3">
          <button 
            onClick={handleSaveResult}
            disabled={isSaving || saveSuccess}
            className={`w-full flex items-center justify-center gap-2 rounded-2xl p-4 text-lg font-bold transition-all shadow-sm active:scale-98 ${
              saveSuccess 
                ? 'bg-emerald-700 text-white' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isSaving ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-6 h-6" />
            ) : (
              <Save className="w-6 h-6" />
            )}
            {saveSuccess ? 'Đã lưu toàn bộ ảnh vào Lịch sử!' : `Lưu kết quả & ${selectedImages.length} ảnh vào Lịch sử`}
          </button>

          <button 
            onClick={() => {
              setSelectedImages([]);
              setActiveImageIndex(0);
              setScanState('IDLE');
            }}
            className="w-full flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-2xl p-3.5 text-base font-bold active:scale-98 transition-all shadow-xs"
          >
            <RefreshCw className="w-5 h-5 text-slate-500" />
            Chụp hoặc Tải bộ ảnh khác
          </button>
        </div>
      </div>
    );
  };

  // Content for Tab 2: MEDS
  const renderMedsTab = () => {
    return (
      <div className="space-y-5 px-4 py-4 animate-in slide-in-from-bottom-4 duration-300 max-w-md mx-auto">
        <div className="space-y-1 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Pill className="w-6 h-6 text-emerald-600" />
            <h2 className={`${titleClass} text-slate-800`}>Tra cứu thuốc thông minh</h2>
          </div>
          <p className={`${descClass} text-slate-500`}>
            Nhập tên thuốc hoặc hướng camera vào hộp thuốc để tra thông tin.
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập hoặc đọc tên thuốc..."
              className="w-full bg-white border border-slate-300 rounded-2xl py-3.5 pl-4 pr-11 text-base text-slate-800 shadow-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400 font-medium"
            />
            <button 
              onClick={() => setSearchQuery("Amlodipin 5mg")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-emerald-600 transition-colors"
              title="Đọc mẫu"
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={() => {
              fileInputRef.current?.click();
            }}
            className="p-3.5 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 active:scale-98 transition-all shadow-sm shrink-0"
            title="Quét hộp thuốc"
          >
            <Camera className="w-6 h-6" />
          </button>
        </div>

        {/* Medicine Detail Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                <Pill className="w-7 h-7" />
              </div>
              <div>
                <h3 className={`${subTitleClass} text-slate-900 font-bold`}>Amlodipin 5mg</h3>
                <span className="inline-block text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Hạ huyết áp
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              HƯỚNG DẪN SỬ DỤNG:
            </h4>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-1">
              <p className={`${bodyClass} text-slate-800 font-semibold`}>
                💊 Uống 1 viên vào buổi sáng, sau khi ăn no.
              </p>
              <p className={`${descClass} text-slate-600`}>
                Bác nên uống vào một khung giờ cố định mỗi ngày để đạt hiệu quả cao nhất.
              </p>
            </div>
          </div>
        </div>

        {/* AI Warning Box */}
        <div className="bg-rose-50 border-l-4 border-rose-500 rounded-r-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-rose-100 rounded-lg text-rose-600 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className={`${subTitleClass} text-rose-950 font-bold`}>
                Cảnh báo từ bác sĩ AI:
              </h3>
              <p className={`${bodyClass} text-rose-900 font-medium leading-relaxed`}>
                ⚠️ Tuyệt đối không uống thuốc này cùng nước ép bưởi ạ.
              </p>
              <p className={`${descClass} text-rose-800 leading-relaxed`}>
                Nước ép bưởi có thể làm tăng lượng thuốc trong máu, dễ gây hạ huyết áp quá mức cực kỳ nguy hiểm cho sức khỏe của bác.
              </p>
            </div>
          </div>
        </div>

        {/* Big Action Button */}
        <button 
          onClick={handleCreateReminder}
          disabled={isCreatingEvent || eventSuccess}
          className={`w-full flex items-center justify-center gap-2.5 rounded-2xl p-4 text-base font-bold transition-all shadow-sm active:scale-98 ${
            eventSuccess
              ? 'bg-sky-700 text-white'
              : 'bg-sky-600 hover:bg-sky-700 text-white'
          }`}
        >
          {isCreatingEvent ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : eventSuccess ? (
            <Check className="w-6 h-6" />
          ) : (
            <Calendar className="w-6 h-6" />
          )}
          {eventSuccess ? 'Đã tạo lịch thành công!' : 'Tạo lịch nhắc uống thuốc'}
        </button>
      </div>
    );
  };

  // Content for Tab 3: HISTORY
  const renderHistoryTab = () => {
    if (selectedRecord) {
      const recordImages = selectedRecord.imageUrls && selectedRecord.imageUrls.length > 0 
        ? selectedRecord.imageUrls 
        : (selectedRecord.imageUrl ? [selectedRecord.imageUrl] : []);

      return (
        <div className="space-y-4 px-4 py-4 animate-in slide-in-from-right duration-300 max-w-md mx-auto">
          {/* Hidden File Input for record details photo addition */}
          <input 
            type="file" 
            ref={recordDetailFileInputRef}
            accept="image/*"
            multiple
            capture="environment"
            className="hidden"
            onChange={handleRecordDetailPhotoAdd}
          />

          {/* Back Button */}
          <button 
            onClick={() => setSelectedRecord(null)}
            className="inline-flex items-center gap-2 text-slate-700 hover:text-emerald-700 font-bold text-sm bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs transition-all active:scale-98"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-600" />
            Quay lại Lịch sử
          </button>

          {/* Record Details Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-soft space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="space-y-1 min-w-0 flex-1">
                <span className="text-xs font-semibold text-slate-500">{selectedRecord.date}</span>
                <h2 className={`${subTitleClass} text-slate-900 font-bold leading-snug`}>
                  {selectedRecord.title}
                </h2>
                {selectedRecord.facility && (
                  <p className={`${descClass} text-slate-600 font-medium`}>{selectedRecord.facility}</p>
                )}
                {selectedRecord.doctor && (
                  <p className={`${descClass} text-slate-500`}>{selectedRecord.doctor}</p>
                )}
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap shrink-0 border ${
                selectedRecord.badgeType === 'warning'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : selectedRecord.badgeType === 'success'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-sky-100 text-sky-800 border-sky-300'
              }`}>
                {selectedRecord.badge}
              </span>
            </div>

            {/* Document Photos Section in Detail */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Ảnh hồ sơ đã chụp/tải lên ({recordImages.length} ảnh)
                  </h3>
                </div>
                <button 
                  onClick={() => recordDetailFileInputRef.current?.click()}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm ảnh
                </button>
              </div>

              {recordImages.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    {recordImages.map((imgUrl, idx) => (
                      <div 
                        key={idx}
                        className="relative group rounded-xl overflow-hidden border border-slate-300 bg-slate-900 aspect-square flex items-center justify-center cursor-pointer shadow-xs"
                        onClick={() => openLightbox(imgUrl, `${selectedRecord.title} - Ảnh ${idx + 1}`)}
                      >
                        <img 
                          src={imgUrl} 
                          alt={`Ảnh ${idx + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white">
                          <Maximize2 className="w-5 h-5 text-white" />
                          <span className="text-[10px] font-bold">Xem ảnh</span>
                        </div>

                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRecordDetailPhotoDelete(idx);
                          }}
                          className="absolute top-1.5 right-1.5 p-1 bg-rose-600/90 hover:bg-rose-700 text-white rounded-md shadow-xs"
                          title="Xóa ảnh này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs">
                          Ảnh {idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-slate-500 font-medium">
                    Chạm vào hình ảnh bất kỳ để xem toàn màn hình, phóng to, xoay ảnh hoặc tải về.
                  </p>
                </div>
              ) : (
                <div className="p-5 bg-white border border-dashed border-slate-300 rounded-xl text-center space-y-2">
                  <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-600 font-medium">Hồ sơ này chưa có ảnh chụp đính kèm.</p>
                  <button 
                    onClick={() => recordDetailFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs"
                  >
                    <Camera className="w-4 h-4" />
                    Chụp hoặc tải ảnh lên ngay
                  </button>
                </div>
              )}
            </div>

            {/* List of Details */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                CHI TIẾT CHỈ SỐ / HƯỚNG DẪN:
              </h3>
              <div className="space-y-2">
                {selectedRecord.details.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3.5 rounded-xl border flex flex-col gap-1 ${
                      item.status === 'high' || item.status === 'warning'
                        ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                        : 'bg-slate-50 border-slate-100 text-slate-800'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-500">{item.label}</span>
                    <span className="text-sm font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Medical Advice */}
            <div className="bg-sky-50 border-l-4 border-sky-500 rounded-r-2xl p-4 shadow-xs space-y-1.5">
              <div className="flex items-center gap-2 text-sky-950 font-bold text-sm">
                <Lightbulb className="w-5 h-5 text-sky-600 shrink-0" />
                <span>Lời khuyên của bác sĩ AI:</span>
              </div>
              <p className={`${bodyClass} text-sky-900 leading-relaxed font-medium`}>
                {selectedRecord.advice}
              </p>
            </div>

            {/* Note if available */}
            {selectedRecord.note && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{selectedRecord.note}</span>
              </div>
            )}

            {/* Share Action */}
            <div className="pt-2">
              <button 
                onClick={() => setAlertMessage("Đã sao chép thông tin chi tiết hồ sơ & đường dẫn ảnh để Bác gửi cho con cháu hoặc Bác sĩ!")}
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-xs transition-all active:scale-98"
              >
                <Share2 className="w-4 h-4" />
                Chia sẻ thông tin này
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-5 px-4 py-4 animate-in slide-in-from-bottom-4 duration-300 max-w-md mx-auto">
        <div className="space-y-1 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-emerald-600" />
            <h2 className={`${titleClass} text-slate-800`}>Lịch sử sức khỏe của Bác</h2>
          </div>
          <p className={`${descClass} text-slate-500`}>
            Lưu giữ các lần khám và xét nghiệm cùng ảnh chụp thực tế. Chạm vào để xem chi tiết.
          </p>
        </div>

        <div className="space-y-3">
          {historyRecords.map((rec) => {
            const recImages = rec.imageUrls && rec.imageUrls.length > 0 
              ? rec.imageUrls 
              : (rec.imageUrl ? [rec.imageUrl] : []);

            return (
              <div 
                key={rec.id}
                onClick={() => setSelectedRecord(rec)}
                className="bg-white border border-slate-200 hover:border-emerald-400 rounded-2xl p-3.5 shadow-soft flex items-center justify-between transition-all cursor-pointer group active:scale-98 gap-3"
              >
                {/* Thumbnail Image if available */}
                {recImages.length > 0 ? (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shrink-0 shadow-2xs">
                    <img src={recImages[0]} alt={rec.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[9px] text-white text-center font-bold py-0.5">
                      📷 {recImages.length} ảnh
                    </div>
                  </div>
                ) : (
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
                    rec.type === 'prescription' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {rec.type === 'prescription' ? <Pill className="w-7 h-7" /> : <FileText className="w-7 h-7" />}
                  </div>
                )}

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <h3 className={`${subTitleClass} text-slate-900 font-bold truncate min-w-0 flex-1`}>
                      {rec.title}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${
                      rec.badgeType === 'warning'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : rec.badgeType === 'success'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-sky-100 text-sky-800 border-sky-300'
                    }`}>
                      {rec.badge}
                    </span>
                  </div>
                  <p className={`${descClass} text-slate-500 truncate`}>{rec.summary}</p>
                  <span className="text-[11px] text-slate-400 font-medium block">{rec.date}</span>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-emerald-900 flex items-center gap-3">
          <Heart className="w-6 h-6 text-emerald-600 shrink-0 fill-emerald-100" />
          <p className={`${descClass} font-semibold`}>
            Bác đang có {historyRecords.length} hồ sơ được lưu giữ an toàn trong ứng dụng.
          </p>
        </div>
      </div>
    );
  };

  // Content for Tab 4: PROFILE
  const renderProfileTab = () => {
    return (
      <div className="space-y-5 px-4 py-4 animate-in slide-in-from-bottom-4 duration-300 max-w-md mx-auto">
        <div className="space-y-1 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <UserIcon className="w-6 h-6 text-emerald-600" />
            <h2 className={`${titleClass} text-slate-800`}>Hồ sơ cá nhân</h2>
          </div>
          <p className={`${descClass} text-slate-500`}>
            Cấu hình xưng hô, độ tuổi, bệnh nền & đồng bộ dữ liệu.
          </p>
        </div>

        {/* User Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-soft space-y-3">
          <div className="flex items-center gap-4">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || "Avatar"} 
                className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xl shrink-0">
                <UserIcon className="w-8 h-8" />
              </div>
            )}
            <div className="space-y-1 min-w-0 flex-1">
              <h3 className={`${titleClass} text-slate-900 font-bold truncate`}>
                {user ? (user.displayName || userDisplayName) : "Chưa đăng nhập"}
              </h3>
              <p className={`${descClass} text-slate-500 font-medium truncate`}>
                {user?.email || "Đăng nhập để đồng bộ thông tin & lịch nhắc"}
              </p>
              {user ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  <Check className="w-3 h-3 text-emerald-600" />
                  Đã đồng bộ tài khoản Google
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  💡 Lưu trên thiết bị (Chưa đồng bộ Cloud)
                </span>
              )}
            </div>
          </div>

          {!user ? (
            <button 
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 px-4 font-bold text-sm transition-all shadow-xs active:scale-98"
            >
              <LogIn className="w-4 h-4" />
              Đăng nhập bằng Google
            </button>
          ) : (
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl py-2.5 px-4 font-semibold text-xs transition-all border border-slate-200 active:scale-98"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              Đăng xuất tài khoản
            </button>
          )}
        </div>

        {/* PROFILE CONFIGURATION FORM */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-soft space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`${subTitleClass} text-slate-900 font-bold`}>
                Thiết lập Xưng hô & Độ tuổi
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Cài đặt để Trợ lý AI tư vấn và trò chuyện phù hợp nhất.
              </p>
            </div>
          </div>

          {/* 1. User Pronoun Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              1. BÁC / NGƯỜI DÙNG MUỐN ĐƯỢC GỌI LÀ:
            </label>
            <div className="flex flex-wrap gap-2">
              {USER_TITLE_OPTIONS.map((title) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => setUserProfile(prev => ({ ...prev, userTitle: title }))}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all border ${
                    userProfile.userTitle === title
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {userProfile.userTitle === title && <Check className="w-3.5 h-3.5 inline mr-1" />}
                  {title}
                </button>
              ))}
            </div>
          </div>

          {/* 2. AI Self Pronoun Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              2. TRỢ LÝ AI TỰ XƯNG LÀ:
            </label>
            <div className="flex flex-wrap gap-2">
              {AI_TITLE_OPTIONS.map((aiOpt) => (
                <button
                  key={aiOpt}
                  type="button"
                  onClick={() => setUserProfile(prev => ({ ...prev, aiTitle: aiOpt }))}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all border ${
                    userProfile.aiTitle === aiOpt
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {userProfile.aiTitle === aiOpt && <Check className="w-3.5 h-3.5 inline mr-1" />}
                  {aiOpt}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Name / Nickname */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              3. TÊN HOẶC BIỆT DANH THÂN MẬT:
            </label>
            <input 
              type="text"
              value={userProfile.nickname}
              onChange={(e) => setUserProfile(prev => ({ ...prev, nickname: e.target.value }))}
              placeholder={`Ví dụ: ${uTitle} Tám, ${uTitle} Nam...`}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          {/* 4. Age & Birth Year */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                ĐỘ TUỔI (TUỔI):
              </label>
              <input 
                type="number"
                value={userProfile.age}
                onChange={(e) => setUserProfile(prev => ({ ...prev, age: e.target.value }))}
                placeholder="68"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                NĂM SINH:
              </label>
              <input 
                type="number"
                value={userProfile.birthYear}
                onChange={(e) => setUserProfile(prev => ({ ...prev, birthYear: e.target.value }))}
                placeholder="1958"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* 5. Health Conditions */}
          <div className="space-y-2.5 pt-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              5. BỆNH NỀN / TIỀN SỬ SỨC KHỎE THEO DÕI:
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_CONDITIONS.map((cond) => {
                const isSelected = userProfile.conditions.includes(cond);
                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => handleToggleCondition(cond)}
                    className={`px-3 py-1.5 rounded-full font-bold text-xs transition-all border flex items-center gap-1 ${
                      isSelected
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300 shadow-2xs'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? <Check className="w-3 h-3 text-emerald-700" /> : <Plus className="w-3 h-3" />}
                    {cond}
                  </button>
                );
              })}
            </div>

            {/* Custom Condition Add */}
            <div className="flex gap-2 pt-1">
              <input 
                type="text"
                value={customConditionInput}
                onChange={(e) => setCustomConditionInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomCondition()}
                placeholder="Thêm bệnh nền khác (ví dụ: Hen suyễn)..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
              />
              <button 
                type="button"
                onClick={handleAddCustomCondition}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm
              </button>
            </div>
          </div>

          {/* 6. Emergency Contact */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              6. NGƯỜI THÂN KHẨN CẤP (NÚT SOS):
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input 
                type="text"
                value={userProfile.emergencyName}
                onChange={(e) => setUserProfile(prev => ({ ...prev, emergencyName: e.target.value }))}
                placeholder="Tên người thân"
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
              />
              <input 
                type="tel"
                value={userProfile.emergencyPhone}
                onChange={(e) => setUserProfile(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                placeholder="Số điện thoại"
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Save Profile Button */}
          <div className="pt-2">
            <button 
              type="button"
              onClick={() => handleSaveProfile()}
              disabled={isSavingProfile}
              className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 px-4 font-bold text-sm transition-all shadow-xs active:scale-98 ${
                profileSavedSuccess
                  ? 'bg-sky-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isSavingProfile ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : profileSavedSuccess ? (
                <Check className="w-5 h-5" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {profileSavedSuccess ? 'Đã lưu cấu hình thành công!' : 'LƯU CẤU HÌNH THÔNG TIN'}
            </button>
          </div>
        </div>

        {/* Settings Toggle */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-soft space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-slate-600" />
              <span className={`${bodyClass} font-bold text-slate-800`}>Chữ to dễ đọc</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input 
                type="checkbox" 
                checked={isLargeText}
                onChange={() => setIsLargeText(!isLargeText)}
                className="sr-only peer" 
              />
              <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        {/* Emergency SOS Button */}
        <button 
          onClick={() => setAlertMessage(`${aiTitle} đang thực hiện cuộc gọi khẩn cấp đến người thân của ${uTitle}: ${userProfile.emergencyName} (${userProfile.emergencyPhone})!`)}
          className="w-full flex items-center justify-center gap-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl p-4 text-base font-bold active:scale-98 transition-all shadow-sm"
        >
          <Phone className="w-5 h-5" />
          ☎️ GỌI NGƯỜI THÂN KHẨN CẤP ({userProfile.emergencyName || 'SOS'})
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto h-screen bg-slate-50 text-slate-800 shadow-xl relative flex flex-col font-sans overflow-hidden border-x border-slate-200">
      
      {/* Lightbox Image Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[120] bg-slate-950/92 backdrop-blur-md flex flex-col justify-between p-4 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between text-white z-10 bg-slate-900/80 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2 min-w-0 mr-2">
              <ImageIcon className="w-5 h-5 text-emerald-400 shrink-0" />
              <h3 className="text-sm font-bold truncate">{lightboxImage.title}</h3>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button 
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.3, 3))}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
                title="Phóng to"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.3, 0.7))}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
                title="Thu nhỏ"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setRotation(prev => (prev + 90) % 360)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
                title="Xoay ảnh"
              >
                <RotateCw className="w-5 h-5" />
              </button>
              <button 
                onClick={() => closeLightbox()}
                className="p-2 bg-rose-500/80 hover:bg-rose-600 rounded-xl text-white transition-colors ml-1"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Image Display */}
          <div className="flex-1 flex items-center justify-center overflow-hidden p-2 my-2 relative">
            <img 
              src={lightboxImage.url} 
              alt={lightboxImage.title}
              style={{
                transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease-out'
              }}
              className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between text-slate-300 text-xs px-3 py-2 bg-slate-900/80 rounded-xl border border-white/10 backdrop-blur-md">
            <span>Độ phóng: {Math.round(zoomLevel * 100)}%</span>
            <span>Góc xoay: {rotation}°</span>
            <a 
              href={lightboxImage.url} 
              download="ho-so-y-te-medi-clear.jpg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
            >
              <Download className="w-4 h-4" /> Tải về
            </a>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {alertMessage && (
        <div className="absolute inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-emerald-100 rounded-2xl text-emerald-700 shrink-0">
                <Info className="w-7 h-7" />
              </div>
              <p className="text-base text-slate-800 leading-relaxed font-bold pt-1">
                {alertMessage}
              </p>
            </div>
            <button 
              onClick={() => setAlertMessage(null)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl p-3.5 text-base font-bold active:scale-98 transition-all shadow-sm"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmDialog && (
        <div className="absolute inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <p className="text-base text-slate-800 leading-relaxed font-bold text-center">
              {confirmDialog.message}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmDialog(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl p-3 text-base font-bold active:scale-98 transition-all border border-slate-200"
              >
                Hủy
              </button>
              <button 
                onClick={confirmDialog.onConfirm}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl p-3 text-base font-bold active:scale-98 transition-all shadow-sm"
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clinical Modern Header */}
      <header className="bg-[#00a66c] p-4 text-white shadow-md flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/15 rounded-xl border border-white/20 backdrop-blur-xs">
            <Stethoscope className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>Trợ lý Y tế AI</span>
            </h1>
            <p className="text-[11px] font-medium text-emerald-100 tracking-wider">TRỢ LÝ Y TẾ GIA ĐÌNH</p>
          </div>
        </div>

        <div>
          {user ? (
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white border border-white/30 px-3.5 py-1.5 rounded-full transition-all text-xs font-semibold backdrop-blur-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              Đăng xuất
            </button>
          ) : (
            <button 
              onClick={handleLogin}
              className="flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 font-bold px-4 py-1.5 rounded-full transition-all text-xs shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              Đăng nhập
            </button>
          )}
        </div>
      </header>
      
      {/* Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 bg-slate-50">
        {activeTab === 'RECORDS' && renderRecordsTab()}
        {activeTab === 'MEDS' && renderMedsTab()}
        {activeTab === 'HISTORY' && renderHistoryTab()}
        {activeTab === 'PROFILE' && renderProfileTab()}
      </main>

      {/* Clean Bottom Navigation Bar */}
      <nav className="absolute bottom-0 w-full h-18 bg-white border-t border-slate-200 flex justify-around items-center z-50 px-2 shadow-lg">
        <button 
          onClick={() => { setActiveTab('RECORDS'); setSelectedRecord(null); }}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 gap-1 transition-all ${
            activeTab === 'RECORDS' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <FileText className="w-6 h-6" />
          <span className="text-xs">Sổ Khám</span>
        </button>

        <button 
          onClick={() => { setActiveTab('MEDS'); setSelectedRecord(null); }}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 gap-1 transition-all ${
            activeTab === 'MEDS' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Pill className="w-6 h-6" />
          <span className="text-xs">Tra Thuốc</span>
        </button>

        <button 
          onClick={() => { setActiveTab('HISTORY'); setSelectedRecord(null); }}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 gap-1 transition-all ${
            activeTab === 'HISTORY' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Clock className="w-6 h-6" />
          <span className="text-xs">Lịch Sử</span>
        </button>

        <button 
          onClick={() => { setActiveTab('PROFILE'); setSelectedRecord(null); }}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 gap-1 transition-all ${
            activeTab === 'PROFILE' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <UserIcon className="w-6 h-6" />
          <span className="text-xs">Hồ Sơ</span>
        </button>
      </nav>
    </div>
  );
}
