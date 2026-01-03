/**
 * Pattern 타입 정의
 */
export interface Pattern {
  id: string;
  pattern_en: string;
  pattern_ko: string;
  examples: string[];
  tags: string[];
  done: boolean;
  review_count: number;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * 패턴 생성 데이터 (id, user_id, created_at, updated_at 제외)
 */
export interface CreatePatternData {
  pattern_en: string;
  pattern_ko: string;
  examples?: string[];
  tags?: string[];
  done?: boolean;
  review_count?: number;
}

/**
 * 패턴 업데이트 데이터 (모든 필드 선택적)
 */
export interface UpdatePatternData {
  pattern_en?: string;
  pattern_ko?: string;
  examples?: string[];
  tags?: string[];
  done?: boolean;
  review_count?: number;
}

