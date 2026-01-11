import { createClient } from './client';
import type { Attendance, CreateAttendanceData, AttendanceStats } from '@/types/attendance';

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 */
function getTodayString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 사용자의 출석 기록 조회 (최근 28일)
 */
export async function getAttendanceRecords(userId: string): Promise<Attendance[]> {
  const supabase = createClient();

  // 최근 28일간의 출석 기록 조회
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 27); // 28일 전부터

  const startDateString = startDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDateString)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching attendance records:', error);
    throw new Error('출석 기록을 불러오는데 실패했습니다.');
  }

  return data || [];
}

/**
 * 오늘 출석 여부 확인
 */
export async function isTodayAttended(userId: string): Promise<boolean> {
  const supabase = createClient();
  const today = getTodayString();

  const { data, error } = await supabase
    .from('attendance')
    .select('id')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116은 데이터가 없을 때 발생하는 에러 (정상)
    console.error('Error checking attendance:', error);
    throw new Error('출석 확인에 실패했습니다.');
  }

  return !!data;
}

/**
 * 출석 체크
 */
export async function checkAttendance(userId: string): Promise<Attendance> {
  const supabase = createClient();
  const today = getTodayString();

  // 이미 오늘 출석했는지 확인
  const { data: existing } = await supabase
    .from('attendance')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  if (existing) {
    return existing;
  }

  // 출석 기록 생성
  const { data, error } = await supabase
    .from('attendance')
    .insert({
      user_id: userId,
      date: today,
    })
    .select()
    .single();

  if (error) {
    console.error('Error checking attendance:', error);
    throw new Error('출석 체크에 실패했습니다.');
  }

  return data;
}

/**
 * 출석 통계 조회
 */
export async function getAttendanceStats(userId: string): Promise<AttendanceStats> {
  const supabase = createClient();

  // 전체 출석 횟수
  const { count: total, error: totalError } = await supabase
    .from('attendance')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (totalError) {
    console.error('Error fetching total attendance:', totalError);
    throw new Error('출석 통계를 불러오는데 실패했습니다.');
  }

  // 이번 달 출석 횟수
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstDayString = firstDayOfMonth.toISOString().split('T')[0];

  const { count: thisMonth, error: monthError } = await supabase
    .from('attendance')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('date', firstDayString);

  if (monthError) {
    console.error('Error fetching monthly attendance:', monthError);
    throw new Error('월별 출석 통계를 불러오는데 실패했습니다.');
  }

  // 모든 출석 기록 조회 (연속 출석 계산용)
  const { data: allRecords, error: recordsError } = await supabase
    .from('attendance')
    .select('date')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (recordsError) {
    console.error('Error fetching attendance records:', recordsError);
    throw new Error('출석 기록을 불러오는데 실패했습니다.');
  }

  // 연속 출석 일수 계산
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  if (allRecords && allRecords.length > 0) {
    const sortedDates = allRecords.map((r) => r.date).sort((a, b) => b.localeCompare(a));
    const todayString = getTodayString();

    // 오늘부터 역순으로 연속 출석 확인
    let checkDate = new Date(todayString);
    let dateIndex = 0;

    while (dateIndex < sortedDates.length) {
      const checkDateString = checkDate.toISOString().split('T')[0];

      if (sortedDates[dateIndex] === checkDateString) {
        if (currentStreak === 0 && checkDateString === todayString) {
          // 오늘 출석했으면 연속 출석 시작
          currentStreak = 1;
          tempStreak = 1;
        } else if (currentStreak > 0) {
          // 연속 출석 중이면 계속
          currentStreak++;
          tempStreak++;
        } else {
          // 과거 출석이면 tempStreak만 증가
          tempStreak++;
        }
        dateIndex++;
      } else {
        // 날짜가 맞지 않으면 연속 출석 중단
        if (currentStreak === 0) {
          tempStreak = 0;
        } else {
          break;
        }
      }

      // 하루 전으로 이동
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // 최장 연속 출석 일수 계산
    tempStreak = 0;
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  return {
    total: total || 0,
    currentStreak,
    longestStreak,
    thisMonth: thisMonth || 0,
  };
}




