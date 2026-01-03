/**
 * Card 타입 정의
 */
export interface Card {
  id: string;
  ko: string;
  en: string;
  done: boolean;
  review_count: number;
  user_id: string;
  tags: string[];
  created_at?: string;
  updated_at?: string;
}

/**
 * 카드 생성 데이터 (id, user_id, created_at, updated_at 제외)
 */
export interface CreateCardData {
  ko: string;
  en: string;
  tags?: string[];
  done?: boolean;
  review_count?: number;
}

/**
 * 카드 업데이트 데이터 (모든 필드 선택적)
 */
export interface UpdateCardData {
  ko?: string;
  en?: string;
  tags?: string[];
  done?: boolean;
  review_count?: number;
}

