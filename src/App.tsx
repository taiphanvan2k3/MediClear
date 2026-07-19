/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Camera, 
  Loader2, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Calendar, 
  MapPin, 
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
  Heart
} from 'lucide-react';
import { auth, db } from './firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

let cachedAccessToken: string | null = null;

type TabType = 'RECORDS' | 'MEDS' | 'HISTORY' | 'PROFILE';
type ScanStateType = 'IDLE' | 'ANALYZING' | 'RESULT';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('RECORDS');
  const [scanState, setScanState] = useState<ScanStateType>('IDLE');
  const [user, setUser] = useState<User | null>(null);
  
  // Custom accessible UI toggles
  const [isLargeText, setIsLargeText] = useState(true); // Default to true for elderly Vietnamese users
  
  // Saving states
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [eventSuccess, setEventSuccess] = useState(false);
  
  // Custom modaled dialogues
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{message: string, onConfirm: () => void} | null>(null);
  
  // Medicine search text
  const [searchQuery, setSearchQuery] = useState('');

  // Sizing definitions for high accessibility
  const titleClass = isLargeText ? "text-2xl font-bold" : "text-xl font-bold";
  const subTitleClass = isLargeText ? "text-xl font-bold" : "text-lg font-bold";
  const bodyClass = isLargeText ? "text-lg leading-relaxed" : "text-base leading-relaxed";
  const descClass = isLargeText ? "text-base" : "text-sm";

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    if (scanState === 'ANALYZING') {
      const timer = setTimeout(() => {
        setScanState('RESULT');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [scanState]);

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
    if (!user) {
      setAlertMessage("Bác cần đăng nhập để lưu kết quả ạ!");
      return;
    }
    if (!db) {
      setAlertMessage("Vui lòng cấu hình Firebase trong file src/firebase.ts để lưu.");
      return;
    }

    setIsSaving(true);
    try {
      const resultData = {
        userId: user.uid,
        glucose: "8.5 mmol/L",
        uricAcid: "450 µmol/L",
        status: "Cần theo dõi",
        timestamp: serverTimestamp()
      };
      
      const newResultRef = doc(db, 'users', user.uid, 'results', Date.now().toString());
      await setDoc(newResultRef, resultData);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      setAlertMessage("Lưu thất bại, bác thử lại sau nhé!");
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
          setAlertMessage("Lưu lịch thất bại, bác thử lại sau nhé!");
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
        <div className="flex flex-col items-center justify-center py-6 px-4 space-y-8 animate-in fade-in duration-300">
          <div className="text-center space-y-4 w-full">
            <h2 className={`${titleClass} text-slate-800`}>
              Cháu chào Bác!
            </h2>
            <p className={`${bodyClass} text-slate-700 leading-relaxed font-medium`}>
              Bác cần cháu giúp đọc giấy xét nghiệm hay đơn thuốc nào hôm nay?
            </p>
          </div>

          <button 
            onClick={() => setScanState('ANALYZING')}
            className="w-full aspect-square max-w-xs rounded-3xl border-4 border-dashed border-emerald-400 bg-emerald-50/50 hover:bg-emerald-100/50 transition-all flex flex-col items-center justify-center p-8 space-y-6 active:scale-95 shadow-inner"
          >
            <div className="p-6 bg-emerald-100 rounded-full shadow-md">
              <Camera className="w-16 h-16 text-emerald-700 animate-pulse" />
            </div>
            <span className={`${subTitleClass} text-emerald-800 text-center font-bold`}>
              Chạm vào đây để Chụp hoặc Tải ảnh lên
            </span>
          </button>

          <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl w-full">
            <p className={`${descClass} text-blue-800 font-medium`}>
              💡 Mẹo nhỏ cho bác: Hãy chụp ảnh thật rõ nét, đầy đủ ánh sáng để cháu đọc chữ được chuẩn nhất ạ!
            </p>
          </div>
        </div>
      );
    }

    if (scanState === 'ANALYZING') {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4 space-y-8 animate-in fade-in duration-300">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-200 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative p-8 bg-emerald-50 rounded-full border-4 border-emerald-300 shadow-lg">
              <Loader2 className="w-20 h-20 text-emerald-600 animate-spin" />
            </div>
          </div>
          <p className={`${titleClass} text-center font-bold text-gray-800 leading-relaxed px-4 animate-pulse`}>
            Bác đợi cháu một chút nhé, bác sĩ AI đang đọc chữ...
          </p>
        </div>
      );
    }

    // RESULTS screen
    return (
      <div className="space-y-6 px-4 py-4 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
          <h2 className={`${titleClass} text-gray-800`}>Kết quả của bác đây ạ:</h2>
          <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full font-bold text-sm">Cần chú ý!</span>
        </div>
        
        <div className="space-y-4">
          {/* Card 1: WARNING */}
          <div className="bg-rose-50 border-l-8 border-rose-500 rounded-r-2xl p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-100 rounded-full shrink-0">
                <AlertTriangle className="w-8 h-8 text-rose-600" />
              </div>
              <div className="space-y-2">
                <h3 className={`${subTitleClass} font-bold text-rose-900`}>
                  Đường huyết (Glucose) - 8.5 mmol/L (Mức CAO)
                </h3>
                <p className={`${bodyClass} text-rose-800 leading-relaxed`}>
                  Bác sĩ AI giải thích: Đường trong máu của bác đang cao hơn bình thường. Bác nhớ hạn chế ăn cơm trắng, bánh kẹo ngọt và tái khám đúng hẹn nhé.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: GOOD */}
          <div className="bg-emerald-50 border-l-8 border-emerald-500 rounded-r-2xl p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-100 rounded-full shrink-0">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h3 className={`${subTitleClass} font-bold text-emerald-900`}>
                  Men gan - Bình thường
                </h3>
                <p className={`${bodyClass} text-emerald-800 leading-relaxed`}>
                  Chỉ số men gan cực kỳ ổn định. Gan của bác đang hoạt động rất tốt, không có dấu hiệu tổn thương nào ạ!
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <button 
            onClick={handleSaveResult}
            disabled={isSaving || saveSuccess}
            className={`w-full flex items-center justify-center gap-3 rounded-2xl p-4 text-xl font-bold transition-transform shadow-md active:scale-95 ${
              saveSuccess 
                ? 'bg-emerald-600 text-white' 
                : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
            }`}
          >
            {isSaving ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle className="w-7 h-7" />
            ) : (
              <Save className="w-7 h-7" />
            )}
            {saveSuccess ? 'Đã lưu kết quả!' : 'Lưu kết quả này'}
          </button>

          <button 
            onClick={() => setScanState('IDLE')}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-emerald-600 text-emerald-700 rounded-2xl p-4 text-xl font-bold active:scale-95 transition-transform shadow-sm hover:bg-emerald-50"
          >
            <RefreshCw className="w-6 h-6" />
            Chụp ảnh khác
          </button>
        </div>
      </div>
    );
  };

  // Content for Tab 2: MEDS
  const renderMedsTab = () => {
    return (
      <div className="space-y-6 px-4 py-4 animate-in slide-in-from-bottom-4 duration-300">
        <div className="space-y-2">
          <h2 className={`${titleClass} text-gray-800`}>Tra cứu thuốc thông minh</h2>
          <p className={`${descClass} text-slate-500`}>Nhập tên thuốc hoặc hướng camera vào hộp thuốc để tra thông tin.</p>
        </div>

        {/* Search Bar */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập hoặc đọc tên thuốc..."
              className="w-full bg-white border-2 border-slate-200 rounded-2xl py-4 pl-4 pr-12 text-lg shadow-sm focus:outline-none focus:border-emerald-500"
            />
            <button 
              onClick={() => {
                setSearchQuery("Amlodipin 5mg");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-emerald-600"
              title="Nhấn để tự điền mẫu"
            >
              <Mic className="w-6 h-6 text-emerald-600 animate-pulse" />
            </button>
          </div>
          <button 
            onClick={() => setAlertMessage("Tính năng chụp hộp thuốc đang được hoàn thiện, bác chờ bản cập nhật sau nhé!")}
            className="p-4 bg-emerald-50 border-2 border-emerald-200 text-emerald-700 rounded-2xl hover:bg-emerald-100"
          >
            <Camera className="w-6 h-6" />
          </button>
        </div>

        {/* Section 1: Medicine Info Card */}
        <div className="bg-white border-2 border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 rounded-xl">
                <Pill className="w-8 h-8 text-emerald-700" />
              </div>
              <div>
                <h3 className={`${subTitleClass} text-slate-800 font-bold`}>Amlodipin 5mg</h3>
                <span className="text-sm bg-blue-50 text-blue-700 font-bold px-2.5 py-0.5 rounded-full">Hạ huyết áp</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-base font-bold text-slate-500 uppercase tracking-wider">HƯỚNG DẪN SỬ DỤNG:</h4>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className={`${bodyClass} text-slate-800 font-semibold`}>
                💊 Uống 1 viên vào buổi sáng, sau khi ăn no.
              </p>
              <p className={`${descClass} text-slate-600 mt-1`}>
                Bác nên uống vào một khung giờ cố định mỗi ngày để đạt hiệu quả cao nhất.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: AI Warning Card */}
        <div className="bg-rose-50 border-l-8 border-rose-500 rounded-r-2xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-100 rounded-full shrink-0">
              <AlertTriangle className="w-8 h-8 text-rose-600" />
            </div>
            <div className="space-y-2">
              <h3 className={`${subTitleClass} font-bold text-rose-950`}>Cảnh báo từ bác sĩ AI:</h3>
              <p className={`${bodyClass} text-rose-900 font-semibold`}>
                ⚠️ Tuyệt đối không uống thuốc này cùng nước ép bưởi ạ.
              </p>
              <p className={`${descClass} text-rose-800 leading-relaxed`}>
                Nước ép bưởi có thể làm tăng lượng thuốc trong máu, dễ gây hạ huyết áp quá mức cực kỳ nguy hiểm cho sức khỏe của bác.
              </p>
            </div>
          </div>
        </div>

        {/* Action button */}
        <button 
          onClick={handleCreateReminder}
          disabled={isCreatingEvent || eventSuccess}
          className={`w-full flex items-center justify-center gap-3 rounded-2xl p-4 text-xl font-bold transition-transform shadow-md active:scale-95 ${
            eventSuccess
              ? 'bg-blue-500 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isCreatingEvent ? (
            <Loader2 className="w-7 h-7 animate-spin" />
          ) : eventSuccess ? (
            <CheckCircle className="w-7 h-7" />
          ) : (
            <Calendar className="w-7 h-7" />
          )}
          {eventSuccess ? 'Đã tạo lịch nhắc uống thuốc!' : 'Tạo lịch nhắc uống thuốc'}
        </button>
      </div>
    );
  };

  // Content for Tab 3: HISTORY
  const renderHistoryTab = () => {
    return (
      <div className="space-y-6 px-4 py-4 animate-in slide-in-from-bottom-4 duration-300">
        <div className="space-y-2">
          <h2 className={`${titleClass} text-gray-800`}>Lịch sử sức khỏe của bác</h2>
          <p className={`${descClass} text-slate-500`}>Nơi lưu trữ các lần khám và xét nghiệm để tiện theo dõi sức khỏe dài hạn.</p>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center justify-between hover:bg-slate-50/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-amber-600">
                <Pill className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className={`${subTitleClass} text-slate-800 font-bold`}>Đơn thuốc Huyết áp</h3>
                <p className={`${descClass} text-slate-500`}>Hôm nay • 08:30</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-slate-400" />
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center justify-between hover:bg-slate-50/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100 text-rose-600">
                <FileText className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className={`${subTitleClass} text-slate-800 font-bold`}>Phiếu xét nghiệm máu</h3>
                  <span className="text-xs bg-rose-100 text-rose-700 font-extrabold px-2 py-0.5 rounded">Đường cao</span>
                </div>
                <p className={`${descClass} text-slate-500`}>15/10/2023 • 10:15</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-slate-400" />
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center justify-between opacity-70 hover:bg-slate-50/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-600">
                <FileText className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className={`${subTitleClass} text-slate-800 font-bold`}>Kiểm tra gan tổng quát</h3>
                  <span className="text-xs bg-emerald-100 text-emerald-700 font-extrabold px-2 py-0.5 rounded">Khỏe mạnh</span>
                </div>
                <p className={`${descClass} text-slate-500`}>05/09/2023 • 09:00</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-slate-400" />
          </div>
        </div>

        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-800 flex items-center gap-3">
          <Heart className="w-8 h-8 text-emerald-600 shrink-0 fill-emerald-500 animate-pulse" />
          <p className={`${descClass} font-semibold`}>
            Bác có tổng cộng 3 bản ghi sức khỏe được lưu an toàn trên hệ thống.
          </p>
        </div>
      </div>
    );
  };

  // Content for Tab 4: PROFILE
  const renderProfileTab = () => {
    return (
      <div className="space-y-6 px-4 py-4 animate-in slide-in-from-bottom-4 duration-300">
        <div className="space-y-2">
          <h2 className={`${titleClass} text-gray-800`}>Hồ sơ cá nhân</h2>
          <p className={`${descClass} text-slate-500`}>Thông tin bệnh lý và thiết lập tiện ích của bác.</p>
        </div>

        {/* User Info Card */}
        <div className="bg-white border-2 border-slate-100 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-emerald-200">
            <UserIcon className="w-12 h-12 text-emerald-700" />
          </div>
          <div className="space-y-1">
            <h3 className={`${titleClass} text-slate-800 font-extrabold`}>Bác Nguyễn Văn A</h3>
            <p className={`${bodyClass} text-slate-600 font-semibold`}>65 tuổi • Hà Nội</p>
          </div>
        </div>

        {/* Medical Context */}
        <div className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-5 space-y-3">
          <h4 className="text-base font-extrabold text-emerald-950 uppercase tracking-wider">Bệnh nền đang theo dõi:</h4>
          <div className="flex flex-wrap gap-2">
            <span className="bg-white border border-emerald-200 text-emerald-900 px-3.5 py-1.5 rounded-full font-bold text-base">
              ❤️ Cao huyết áp
            </span>
            <span className="bg-white border border-emerald-200 text-emerald-900 px-3.5 py-1.5 rounded-full font-bold text-base">
              🥣 Đau dạ dày
            </span>
          </div>
        </div>

        {/* Settings Toggle */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-slate-500" />
              <span className={`${bodyClass} font-bold text-slate-800`}>Giao diện chữ cực to (Dễ đọc)</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isLargeText}
                onChange={() => setIsLargeText(!isLargeText)}
                className="sr-only peer" 
              />
              <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        {/* Emergency SOS Button */}
        <button 
          onClick={() => setAlertMessage("Chức năng đang thực hiện cuộc gọi SOS trực tiếp đến số điện thoại của người thân của Bác.")}
          className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white rounded-3xl p-5 text-xl font-extrabold active:scale-95 transition-all shadow-xl"
        >
          <Phone className="w-8 h-8 animate-bounce" />
          ☎️ GỌI NGƯỜI THÂN KHẨN CẤP (SOS)
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto h-screen bg-slate-50 shadow-2xl relative flex flex-col font-sans overflow-hidden border border-slate-200">
      
      {/* Alert Modal */}
      {alertMessage && (
        <div className="absolute inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 space-y-4 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-100 rounded-full shrink-0">
                <Info className="w-8 h-8 text-amber-600" />
              </div>
              <p className="text-xl text-gray-800 leading-relaxed font-semibold">
                {alertMessage}
              </p>
            </div>
            <button 
              onClick={() => setAlertMessage(null)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl p-4 text-xl font-bold active:scale-95 transition-transform"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmDialog && (
        <div className="absolute inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 space-y-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <p className="text-xl text-gray-800 leading-relaxed font-bold text-center">
              {confirmDialog.message}
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setConfirmDialog(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl p-4 text-lg font-bold active:scale-95 transition-transform"
              >
                Hủy
              </button>
              <button 
                onClick={confirmDialog.onConfirm}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl p-4 text-lg font-bold active:scale-95 transition-transform"
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-emerald-600 text-white p-4 shadow-md flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          <Stethoscope className="w-8 h-8" />
          <h1 className="text-2xl font-black tracking-tight">Trợ lý Y tế AI</h1>
        </div>
        <div>
          {user ? (
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 px-3.5 py-2 rounded-xl transition-all text-sm font-bold shadow"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          ) : (
            <button 
              onClick={handleLogin}
              className="flex items-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 px-3.5 py-2 rounded-xl transition-all text-sm font-bold shadow"
            >
              <LogIn className="w-4 h-4" />
              Đăng nhập
            </button>
          )}
        </div>
      </header>
      
      {/* Scrollable Content Container */}
      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'RECORDS' && renderRecordsTab()}
        {activeTab === 'MEDS' && renderMedsTab()}
        {activeTab === 'HISTORY' && renderHistoryTab()}
        {activeTab === 'PROFILE' && renderProfileTab()}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="absolute bottom-0 w-full h-18 bg-white border-t border-slate-200 flex justify-around items-center z-50 px-2 shadow-lg">
        <button 
          onClick={() => setActiveTab('RECORDS')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 gap-1 transition-all ${
            activeTab === 'RECORDS' ? 'text-emerald-600 scale-105' : 'text-slate-400'
          }`}
        >
          <FileText className="w-6.5 h-6.5" />
          <span className="text-xs font-black">Sổ Khám</span>
        </button>

        <button 
          onClick={() => setActiveTab('MEDS')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 gap-1 transition-all ${
            activeTab === 'MEDS' ? 'text-emerald-600 scale-105' : 'text-slate-400'
          }`}
        >
          <Pill className="w-6.5 h-6.5" />
          <span className="text-xs font-black">Tra Thuốc</span>
        </button>

        <button 
          onClick={() => setActiveTab('HISTORY')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 gap-1 transition-all ${
            activeTab === 'HISTORY' ? 'text-emerald-600 scale-105' : 'text-slate-400'
          }`}
        >
          <Clock className="w-6.5 h-6.5" />
          <span className="text-xs font-black">Lịch Sử</span>
        </button>

        <button 
          onClick={() => setActiveTab('PROFILE')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 gap-1 transition-all ${
            activeTab === 'PROFILE' ? 'text-emerald-600 scale-105' : 'text-slate-400'
          }`}
        >
          <UserIcon className="w-6.5 h-6.5" />
          <span className="text-xs font-black">Hồ Sơ</span>
        </button>
      </nav>
    </div>
  );
}
