/**
 * Attendance 타입 정의
 */
export interface Attendance {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD 형식
  created_at?: string;
  updated_at?: string;
}

/**
 * 출석 체크 데이터 (생성 시)
 */
export interface CreateAttendanceData {
  date: string; // YYYY-MM-DD 형식
}

/**
 * 출석 통계
 */
export interface AttendanceStats {
  total: number; // 총 출석 횟수
  currentStreak: number; // 현재 연속 출석 일수
  longestStreak: number; // 최장 연속 출석 일수
  thisMonth: number; // 이번 달 출석 횟수
}



