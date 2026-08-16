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
  type: 'prescription' | 'lab';
  badge: string;
  badgeType: 'warning' | 'success' | 'info';
  summary: string;
  facility?: string;
  doctor?: string;
  diagnosis?: string;
  details: HistoryItemDetail[];
  advice: string;
  warning?: string;
  note?: string;
  imageUrls?: string[];
  imageUrl?: string; // fallback for legacy
}

export const DEFAULT_HISTORY_RECORDS: HistoryRecord[] = [];

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

export const DEFAULT_MED_SEARCH_HISTORY: MedSearchHistoryItem[] = [];

export interface ScannedMedication {
  name: string;
  dosage: string;
  purpose: string;
  foodAdvice: string;
  reminderTime?: string;
}

export interface ScannedLabResult {
  label: string;
  value: string;
  status: 'normal' | 'high' | 'warning';
  advice?: string;
}

export interface PrescriptionScanResult {
  title: string;
  type: 'prescription' | 'lab';
  facility?: string;
  doctor?: string;
  diagnosis?: string;
  badge: string;
  badgeType: 'info' | 'warning' | 'success';
  summary: string;
  medications: ScannedMedication[];
  labResults: ScannedLabResult[];
  advice: string;
  warning?: string;
}
