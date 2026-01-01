import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// 예시 데이터 타입
interface ExampleData {
  id: string;
  title: string;
  description: string;
}

// 예시 API 함수들 (실제 구현 시 교체)
const fetchExampleData = async (): Promise<ExampleData[]> => {
  // API 호출 예시
  // const response = await fetch('/api/example');
  // return response.json();
  return [];
};

const createExampleData = async (
  data: Omit<ExampleData, 'id'>
): Promise<ExampleData> => {
  // API 호출 예시
  // const response = await fetch('/api/example', {
  //   method: 'POST',
  //   body: JSON.stringify(data),
  // });
  // return response.json();
  return { id: '1', ...data };
};

// TanStack Query를 사용한 데이터 조회 Hook
export function useExampleQuery() {
  return useQuery({
    queryKey: ['example'],
    queryFn: fetchExampleData,
    staleTime: 5 * 60 * 1000, // 5분
  });
}

// TanStack Query를 사용한 데이터 생성 Mutation Hook
export function useExampleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExampleData,
    onSuccess: () => {
      // 성공 시 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['example'] });
    },
  });
}
