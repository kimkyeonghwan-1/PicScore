// store/arenaStore.ts
import { create } from "zustand";
import { ArenaPhoto } from "../api/arenaApi";

// Arena 게임 상태 인터페이스
interface ArenaGameState {
  isActive: boolean;
  timeLeft: number;
  photos: ArenaPhoto[];
  correctOrder: number[];
  userOrder: number[];
  completed: boolean;
}

// Arena 결과 인터페이스
interface ArenaResult {
  score: number;
  correctCount: number; // 정답 개수 (0 또는 1)
  timeSpent: number;
  xpEarned: number;
  partialCorrectCount: number; // UI 표시용 부분 정답 개수
  remainingTime: number; // 백엔드에 전송할 남은 시간
}

// Arena 스토어 상태 인터페이스
interface ArenaStore {
  gameState: ArenaGameState;
  result: ArenaResult | null;
  
  // 게임 상태 설정 액션
  setGameState: (state: Partial<ArenaGameState>) => void;
  
  // 사진 순서 추가 액션
  addToUserOrder: (photoId: number) => void;
  
  // 사진 순서 삭제 액션
  removeFromUserOrder: (index: number) => void;
  
  // 사진 순서 리셋 액션
  resetUserOrder: () => void;
  
  // 결과 설정 액션
  setResult: (result: ArenaResult) => void;
  
  // 모든 상태 리셋 액션
  resetAll: () => void;
}

// 초기 게임 상태
const initialGameState: ArenaGameState = {
  isActive: false,
  timeLeft: 30, // 기본 30초
  photos: [],
  correctOrder: [],
  userOrder: [],
  completed: false,
};

// 아레나 스토어 생성
export const useArenaStore = create<ArenaStore>((set) => ({
  gameState: initialGameState,
  result: null,
  
  // 게임 상태 설정
  setGameState: (state) =>
    set((prev) => ({
      gameState: {
        ...prev.gameState,
        ...state,
      },
    })),
  
  // 사용자 순서에 사진 추가
  addToUserOrder: (photoId) =>
    set((prev) => {
      // 이미 선택된 사진이면 추가하지 않음
      if (prev.gameState.userOrder.includes(photoId)) {
        return prev;
      }
      
      // 최대 4개까지만 추가
      if (prev.gameState.userOrder.length >= 4) {
        return prev;
      }
      
      const newUserOrder = [...prev.gameState.userOrder, photoId];
      
      // 모든 사진이 선택되었는지 확인
      const completed = newUserOrder.length === 4;
      
      return {
        gameState: {
          ...prev.gameState,
          userOrder: newUserOrder,
          completed,
        },
      };
    }),
  
  // 사용자 순서에서 사진 제거
  removeFromUserOrder: (index) =>
    set((prev) => {
      const newUserOrder = [...prev.gameState.userOrder];
      newUserOrder.splice(index, 1);
      
      return {
        gameState: {
          ...prev.gameState,
          userOrder: newUserOrder,
          completed: false,
        },
      };
    }),
  
  // 사용자 순서 리셋
  resetUserOrder: () =>
    set((prev) => ({
      gameState: {
        ...prev.gameState,
        userOrder: [],
        completed: false,
      },
    })),
  
  // 결과 설정
  setResult: (result) => set(() => ({ result })),
  
  // 모든 상태 리셋
  resetAll: () =>
    set(() => ({
      gameState: initialGameState,
      result: null,
    })),
}));
