export type TabType = 'RECORDS' | 'MEDS' | 'HISTORY' | 'PROFILE';
export type ScanStateType = 'IDLE' | 'ANALYZING' | 'RESULT';

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

export const DEFAULT_PROFILE: UserProfile = {
  nickname: '',
  age: '68',
  birthYear: '1958',
  userTitle: 'Bác',
  aiTitle: 'Cháu',
  conditions: ['❤️ Cao huyết áp', '🥣 Đau dạ dày'],
  emergencyName: 'Con gái Mai',
  emergencyPhone: '0987654321'
};

export const USER_TITLE_OPTIONS = ['Bác', 'Ông', 'Bà', 'Chú', 'Cô', 'Anh/Chị', 'Tôi'];
export const AI_TITLE_OPTIONS = ['Cháu', 'Con', 'Trợ lý AI', 'Em', 'Tôi'];
export const PRESET_CONDITIONS = [
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

export const DEFAULT_HISTORY_RECORDS: HistoryRecord[] = [
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
