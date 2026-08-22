export type TabType = 'RECORDS' | 'MEDS' | 'HISTORY' | 'PROFILE';
export type ScanStateType = 'IDLE' | 'ANALYZING' | 'RESULT';

export interface UserProfile {
  nickname: string;
  age: string;
  birthYear: string;
  userTitle: string; // e.g. "Bác", "Ông", "Bà", "Chú", "Cô", "Anh", "Chị"
  aiTitle: string;   // e.g. "Cháu", "Con", "Trợ lý AI", "Em", "Tôi"
  conditions: string[];
  emergencyName?: string;
  emergencyPhone?: string;
}

export const DEFAULT_PROFILE: UserProfile = {
  nickname: '',
  age: '',
  birthYear: '',
  userTitle: 'Bác',
  aiTitle: 'Cháu',
  conditions: [],
  emergencyName: '',
  emergencyPhone: ''
};

export const USER_TITLE_OPTIONS = ['Bác', 'Ông', 'Bà', 'Chú', 'Cô', 'Anh', 'Chị'];
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
  type: 'prescription' | 'lab' | 'consultation';
  badge: string;
  badgeType: 'warning' | 'info';
  summary: string;
  imageUrl?: string;
  imageUrls?: string[];
  facility?: string;
  doctor?: string;
  diagnosis?: string;
  details: HistoryItemDetail[];
  advice?: string;
  warning?: string;
}

export interface MedSearchHistoryItem {
  id: string;
  query: string;
  name: string;
  genericName?: string;
  dosage: string[] | string;
  purpose: string[] | string;
  foodAdvice: string[] | string;
  summary?: string;
  sources?: { title: string; uri: string }[];
  date: string;
  timestamp: number;
}

export interface PrescriptionScanResult {
  title?: string;
  type?: 'prescription' | 'lab' | 'consultation';
  badge?: string;
  badgeType?: 'warning' | 'info';
  summary: string;
  facility?: string;
  doctor?: string;
  diagnosis?: string;
  medications?: {
    name: string;
    dosage: string;
    purpose?: string;
    foodAdvice?: string;
    reminderTime?: string;
  }[];
  labResults?: {
    label: string;
    value: string;
    status?: 'normal' | 'high' | 'warning';
    advice?: string;
  }[];
  advice?: string;
  warning?: string;
}

export const DEFAULT_HISTORY_RECORDS: HistoryRecord[] = [];
export const DEFAULT_MED_SEARCH_HISTORY: MedSearchHistoryItem[] = [];
