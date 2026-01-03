import { createClient } from './client';
import type { Pattern, CreatePatternData, UpdatePatternData } from '@/types/pattern';

/**
 * 배열 정규화 헬퍼 함수
 */
function normalizeArray<T>(value: unknown, defaultValue: T[] = []): T[] {
  if (!value) return defaultValue;
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : defaultValue;
    } catch {
      return defaultValue;
    }
  }
  return defaultValue;
}

/**
 * 사용자의 모든 패턴 조회
 */
export async function getPatterns(userId: string): Promise<Pattern[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('patterns')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching patterns:', error);
    throw new Error('패턴을 불러오는데 실패했습니다.');
  }

  const normalizedData = (data || []).map((pattern) => ({
    ...pattern,
    tags: normalizeArray<string>(pattern.tags, []),
    examples: normalizeArray<string>(pattern.examples, []),
  }));

  return normalizedData;
}

/**
 * 페이지네이션을 사용한 패턴 조회
 */
export async function getPatternsPaginated(
  userId: string,
  page: number = 0,
  pageSize: number = 6
): Promise<{ patterns: Pattern[]; hasMore: boolean }> {
  const supabase = createClient();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('patterns')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching patterns:', error);
    throw new Error('패턴을 불러오는데 실패했습니다.');
  }

  const normalizedPatterns = (data || []).map((pattern) => ({
    ...pattern,
    tags: normalizeArray<string>(pattern.tags, []),
    examples: normalizeArray<string>(pattern.examples, []),
  }));

  const totalCount = count || 0;
  const hasMore = to + 1 < totalCount;

  return {
    patterns: normalizedPatterns,
    hasMore,
  };
}

/**
 * 패턴 통계 조회
 */
export async function getPatternStats(
  userId: string
): Promise<{ total: number; incomplete: number; completed: number }> {
  const supabase = createClient();

  const { count: totalCount, error: totalError } = await supabase
    .from('patterns')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (totalError) {
    console.error('Error fetching total pattern count:', totalError);
    throw new Error('전체 패턴 수를 불러오는데 실패했습니다.');
  }

  const { count: incompleteCount, error: incompleteError } = await supabase
    .from('patterns')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('done', false);

  if (incompleteError) {
    console.error('Error fetching incomplete pattern count:', incompleteError);
    throw new Error('복습 미완료 패턴 수를 불러오는데 실패했습니다.');
  }

  const { count: completedCount, error: completedError } = await supabase
    .from('patterns')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('done', true);

  if (completedError) {
    console.error('Error fetching completed pattern count:', completedError);
    throw new Error('복습 완료 패턴 수를 불러오는데 실패했습니다.');
  }

  return {
    total: totalCount || 0,
    incomplete: incompleteCount || 0,
    completed: completedCount || 0,
  };
}

/**
 * 패턴 생성
 */
export async function createPattern(
  userId: string,
  patternData: CreatePatternData
): Promise<Pattern> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('patterns')
    .insert({
      user_id: userId,
      pattern_en: patternData.pattern_en,
      pattern_ko: patternData.pattern_ko,
      examples: patternData.examples ?? [],
      tags: patternData.tags ?? [],
      done: patternData.done ?? false,
      review_count: patternData.review_count ?? 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating pattern:', error);
    throw new Error('패턴을 생성하는데 실패했습니다.');
  }

  return {
    ...data,
    tags: normalizeArray<string>(data.tags, []),
    examples: normalizeArray<string>(data.examples, []),
  };
}

/**
 * 패턴 업데이트
 */
export async function updatePattern(
  patternId: string,
  updates: UpdatePatternData
): Promise<Pattern> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('patterns')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', patternId)
    .select()
    .single();

  if (error) {
    console.error('Error updating pattern:', error);
    throw new Error('패턴을 업데이트하는데 실패했습니다.');
  }

  return {
    ...data,
    tags: normalizeArray<string>(data.tags, []),
    examples: normalizeArray<string>(data.examples, []),
  };
}

/**
 * 패턴 삭제
 */
export async function deletePattern(patternId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from('patterns').delete().eq('id', patternId);

  if (error) {
    console.error('Error deleting pattern:', error);
    throw new Error('패턴을 삭제하는데 실패했습니다.');
  }
}

