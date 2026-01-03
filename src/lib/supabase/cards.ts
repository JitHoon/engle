import { createClient } from './client';
import type { Card, CreateCardData, UpdateCardData } from '@/types/card';

/**
 * 사용자의 모든 카드 조회
 */
export async function getCards(userId: string): Promise<Card[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching cards:', error);
    throw new Error('카드를 불러오는데 실패했습니다.');
  }

  // tags가 배열이 아닌 경우 배열로 변환
  const normalizedData = (data || []).map((card) => {
    let tags: string[] = [];
    if (Array.isArray(card.tags)) {
      tags = card.tags;
    } else if (card.tags) {
      if (typeof card.tags === 'string') {
        try {
          const parsed = JSON.parse(card.tags);
          tags = Array.isArray(parsed) ? parsed : [];
        } catch {
          tags = [];
        }
      }
    }
    return {
      ...card,
      tags,
    };
  });

  return normalizedData;
}

/**
 * 페이지네이션을 사용한 카드 조회
 * @param userId 사용자 ID
 * @param page 페이지 번호 (0부터 시작)
 * @param pageSize 페이지당 카드 수
 * @returns 카드 배열과 다음 페이지 존재 여부
 */
export async function getCardsPaginated(
  userId: string,
  page: number = 0,
  pageSize: number = 6
): Promise<{ cards: Card[]; hasMore: boolean }> {
  const supabase = createClient();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('cards')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching cards:', error);
    throw new Error('카드를 불러오는데 실패했습니다.');
  }

  // tags가 배열이 아닌 경우 배열로 변환
  const normalizedCards = (data || []).map((card) => {
    let tags: string[] = [];
    if (Array.isArray(card.tags)) {
      tags = card.tags;
    } else if (card.tags) {
      if (typeof card.tags === 'string') {
        try {
          const parsed = JSON.parse(card.tags);
          tags = Array.isArray(parsed) ? parsed : [];
        } catch {
          tags = [];
        }
      }
    }
    return {
      ...card,
      tags,
    };
  });

  const totalCount = count || 0;
  const hasMore = to + 1 < totalCount;

  return {
    cards: normalizedCards,
    hasMore,
  };
}

/**
 * 카드 통계 조회 (전체 데이터베이스 기준)
 * @param userId 사용자 ID
 * @returns 전체 카드 수, 복습 필요 카드 수, 완료 카드 수
 */
export async function getCardStats(
  userId: string
): Promise<{ total: number; incomplete: number; completed: number }> {
  const supabase = createClient();

  // 전체 카드 수
  const { count: totalCount, error: totalError } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (totalError) {
    console.error('Error fetching total card count:', totalError);
    throw new Error('전체 카드 수를 불러오는데 실패했습니다.');
  }

  // 복습 미완료 카드 수
  const { count: incompleteCount, error: incompleteError } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('done', false);

  if (incompleteError) {
    console.error('Error fetching incomplete card count:', incompleteError);
    throw new Error('복습 미완료 카드 수를 불러오는데 실패했습니다.');
  }

  // 복습 완료 카드 수
  const { count: completedCount, error: completedError } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('done', true);

  if (completedError) {
    console.error('Error fetching completed card count:', completedError);
    throw new Error('복습 완료 카드 수를 불러오는데 실패했습니다.');
  }

  return {
    total: totalCount || 0,
    incomplete: incompleteCount || 0,
    completed: completedCount || 0,
  };
}

/**
 * 카드 생성
 */
export async function createCard(
  userId: string,
  cardData: CreateCardData
): Promise<Card> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('cards')
    .insert({
      user_id: userId,
      ko: cardData.ko,
      en: cardData.en,
      tags: cardData.tags ?? [],
      done: cardData.done ?? false,
      review_count: cardData.review_count ?? 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating card:', error);
    throw new Error('카드를 생성하는데 실패했습니다.');
  }

  // tags 정규화
  let tags: string[] = [];
  if (Array.isArray(data.tags)) {
    tags = data.tags;
  } else if (data.tags) {
    if (typeof data.tags === 'string') {
      try {
        const parsed = JSON.parse(data.tags);
        tags = Array.isArray(parsed) ? parsed : [];
      } catch {
        tags = [];
      }
    }
  }

  return {
    ...data,
    tags,
  };
}

/**
 * 카드 업데이트
 */
export async function updateCard(
  cardId: string,
  updates: UpdateCardData
): Promise<Card> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('cards')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', cardId)
    .select()
    .single();

  if (error) {
    console.error('Error updating card:', error);
    throw new Error('카드를 업데이트하는데 실패했습니다.');
  }

  // tags 정규화
  let tags: string[] = [];
  if (Array.isArray(data.tags)) {
    tags = data.tags;
  } else if (data.tags) {
    if (typeof data.tags === 'string') {
      try {
        const parsed = JSON.parse(data.tags);
        tags = Array.isArray(parsed) ? parsed : [];
      } catch {
        tags = [];
      }
    }
  }

  return {
    ...data,
    tags,
  };
}

/**
 * 카드 삭제
 */
export async function deleteCard(cardId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from('cards').delete().eq('id', cardId);

  if (error) {
    console.error('Error deleting card:', error);
    throw new Error('카드를 삭제하는데 실패했습니다.');
  }
}

/**
 * 복습할 카드 조회 (done이 false인 카드)
 */
export async function getReviewCards(userId: string): Promise<Card[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', userId)
    .eq('done', false)
    .order('review_count', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching review cards:', error);
    throw new Error('복습할 카드를 불러오는데 실패했습니다.');
  }

  // tags 정규화
  const normalizedData = (data || []).map((card) => {
    let tags: string[] = [];
    if (Array.isArray(card.tags)) {
      tags = card.tags;
    } else if (card.tags) {
      if (typeof card.tags === 'string') {
        try {
          const parsed = JSON.parse(card.tags);
          tags = Array.isArray(parsed) ? parsed : [];
        } catch {
          tags = [];
        }
      }
    }
    return {
      ...card,
      tags,
    };
  });

  return normalizedData;
}

/**
 * 카드 복습 완료 처리 (review_count 증가 및 done 상태 업데이트)
 */
export async function markCardAsReviewed(cardId: string): Promise<Card> {
  const supabase = createClient();

  // 먼저 현재 카드 정보 조회
  const { data: currentCard, error: fetchError } = await supabase
    .from('cards')
    .select('review_count, done')
    .eq('id', cardId)
    .single();

  if (fetchError) {
    console.error('Error fetching card:', fetchError);
    throw new Error('카드를 불러오는데 실패했습니다.');
  }

  // review_count 증가 및 done 상태 업데이트
  const newReviewCount = (currentCard.review_count || 0) + 1;
  const isDone = newReviewCount >= 3; // 3번 이상 복습하면 완료로 표시

  const { data, error } = await supabase
    .from('cards')
    .update({
      review_count: newReviewCount,
      done: isDone,
      updated_at: new Date().toISOString(),
    })
    .eq('id', cardId)
    .select()
    .single();

  if (error) {
    console.error('Error updating card review:', error);
    throw new Error('카드 복습 상태를 업데이트하는데 실패했습니다.');
  }

  return data;
}

